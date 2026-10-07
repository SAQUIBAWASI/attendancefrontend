// OpManagement.js — COMPLETE (Per-Category Independent Payment + Legacy Safe)
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";
import {
  FaSearch, FaCalendarAlt, FaClock, FaUserMd, FaStethoscope, FaTimes,
  FaPhoneAlt, FaMapMarkerAlt, FaRupeeSign, FaCreditCard, FaMoneyBillWave,
  FaPrint, FaCheckCircle, FaTimesCircle, FaFileInvoiceDollar, FaUserInjured,
  FaPlus, FaTrashAlt, FaEdit, FaEye, FaCheck, FaClipboardList, FaCalendarCheck,
  FaHistory, FaPrescription, FaFilePdf, FaServicestack, FaUserPlus, FaShareAlt,
  FaPercent, FaGift, FaBuilding, FaClinicMedical, FaPills, FaFlask,
  FaMinusCircle, FaPlusCircle, FaUserTag, FaUserFriends,
  FaUserMd as FaUserMdIcon, FaExternalLinkAlt, FaMicroscope, FaLock,
  FaHeartbeat, FaNotesMedical, FaAllergies, FaTint, FaBirthdayCake, FaVenusMars,
  FaEnvelope, FaIdCard, FaStickyNote, FaCommentMedical, FaUserCheck, FaUserClock,
  FaToggleOn, FaToggleOff, FaStar, FaWalking, FaGlobe, FaDownload, FaWhatsapp,
  FaCalculator, FaChevronLeft, FaChevronRight,
} from "react-icons/fa";
import {
  FiUsers, FiUserCheck, FiClock, FiFilter, FiDownload, FiTrash2, FiPlus,
  FiEdit2, FiEye, FiRefreshCw, FiCheckCircle, FiXCircle, FiCalendar,
  FiFileText, FiDollarSign, FiPlusCircle, FiChevronDown, FiChevronUp,
  FiAlertCircle, FiLock, FiUserX, FiUserPlus as FiUserPlusIcon, FiMoreVertical
} from "react-icons/fi";
import "./EmployeeDashboard.css";
import "./EmployeeLeaves.css";
import logo from "../Images/Timelyhealth logo.png";
import prescriptionTemplate from "../Images/prescription.jpg";
import prescriptionBackTemplate from "../Images/prescriptionbackside.jpg";

const TITLE_OPTIONS = [
  { value: "Mr.", label: "Mr." },
  { value: "Mrs.", label: "Mrs." },
  { value: "Miss", label: "Miss" },
  { value: "Master", label: "Master" },
  { value: "Baby", label: "Baby" },
  { value: "BabyOf", label: "Baby Of" },
  { value: "Dr.", label: "Dr." },
];

const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" }
];

const PAYMENT_TYPE_OPTIONS = [
  { value: "cash", label: "Cash" },
  { value: "online", label: "Online" },
  { value: "insurance", label: "Insurance" },
  { value: "card", label: "Card" },
  { value: "due", label: "Due" }
];

const PAYMENT_STATUS_OPTIONS = [
  { value: "Partial", label: "Partial" },
  { value: "Paid", label: "Paid" },
  { value: "Due", label: "Due" }
];

const BOOKING_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "consulting", label: "Consulting" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" }
];

const BOOKING_TYPE_OPTIONS = [
  { value: "All", label: "All Booking Types" },
  { value: "Walk-In", label: "Walk-In" },
  { value: "Online", label: "Online" }
];

const REVENUE_CATEGORY_OPTIONS = [
  { value: "All", label: "All Revenue Types" },
  { value: "clinic", label: "Clinic Only" },
  { value: "lab", label: "Lab Only" },
  { value: "pharmacy", label: "Pharmacy Only" },
];

const PAYMENT_TYPE_FILTER_OPTIONS = [
  { value: "All", label: "All Payment Modes" },
  { value: "cash", label: "Cash" },
  { value: "online", label: "Online" },
  { value: "insurance", label: "Insurance" },
  { value: "card", label: "Card" },
  { value: "due", label: "Due" },
];

const TIME_FILTER_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "thisWeek", label: "This Week" },
  { value: "thisMonth", label: "This Month" },
  { value: "lastMonth", label: "Last Month" },
  { value: "thisYear", label: "This Year" },
  { value: "All", label: "All" },
];

const DISCOUNT_TYPE_OPTIONS = [
  { value: "₹", label: "₹ (Rupees)" },
  { value: "%", label: "% (Percent)" }
];

const EMPTY_FORM = {
  title: "Mr.", name: "", dob: "", age: "", gender: "Male",
  phone: "", address: "", city: "", pincode: "",
  serviceItems: [], paymentType: "cash", reason: "", paymentStatus: "Due",
  doctorId: "", slotId: "", appointmentDate: "", selectedServices: [],
  referredByCustomer: "", referredByDoctor: "", referralCustomerId: "",
  referralDoctorId: "", referralCommission: "", referralCommissionType: "",
  partialAmount: "", discount: "", discountType: "₹", bookingId: "",
  status: "confirmed", offerApplied: null,
};

const CLINIC_INFO = {
  name: "TimelyHealth",
  address: "Flat No: 301, 3rd Floor, Sri Sai Balaji Avenue, H. No: 1-98/9/25/p, Opp Style on Studio, VIP Hills, near Bank of Baroda, Arunodaya Colony, Sri Sai Nagar, Madhapur, Hyderabad, Telangana 500081",
  contact: "9505397000"
};

const REVIEW_WINDOW_DAYS = 3;

const calculateAgeFromDOB = (dob) => {
  if (!dob) return "";
  try {
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return "";
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    return age > 0 ? age.toString() : "";
  } catch { return ""; }
};

const genderFromTitle = (title) => {
  if (!title) return "";
  const t = title.toString().trim();
  if (t === "Mr." || t === "Master") return "Male";
  if (t === "Mrs." || t === "Miss") return "Female";
  if (t === "Baby" || t === "BabyOf") return "Other";
  if (t === "Dr.") return "";
  return "";
};

const autoSelectTitleFromDob = (dob, gender) => {
  if (!dob) return null;
  try {
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    if (age < 0) return null;
    if (age < 2) return "Baby";
    if (age < 13) return gender === "Female" ? "Miss" : "Master";
    if (age < 18) return gender === "Female" ? "Miss" : "Mr.";
    if (gender === "Female") return "Miss";
    return "Mr.";
  } catch { return null; }
};

const getDayNameFromDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", { weekday: "long" });
};

const formatDateToDDMMYYYY = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  } catch { return "N/A"; }
};

const formatDateTimeToDDMMYYYY = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${date.getFullYear()} ${hours}:${minutes}`;
  } catch { return "N/A"; }
};

const getStatusColors = (status) => {
  const map = {
    booked: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
    completed: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
    consulting: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
    cancelled: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
    pending: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" },
    confirmed: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" }
  };
  return map[status?.toLowerCase()] || map.booked;
};

const getPaymentStatusColors = (status) => {
  const normalized = status === "Pending" ? "Due" : status;
  const map = {
    Paid: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: FaCheckCircle, iconColor: "text-emerald-600" },
    Partial: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: FaClock, iconColor: "text-amber-600" },
    Due: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: FaTimesCircle, iconColor: "text-red-500" },
    Empty: { bg: "bg-gray-50", text: "text-gray-400", border: "border-gray-200", icon: FaTimesCircle, iconColor: "text-gray-400" }
  };
  return map[normalized] || map.Due;
};

const getBookingType = (booking) => {
  if (!booking) return { label: "Walk-In", icon: FaWalking, color: "bg-amber-50 text-amber-700 border-amber-200" };
  if (booking.isOP === true) return { label: "Walk-In", icon: FaWalking, color: "bg-amber-50 text-amber-700 border-amber-200" };
  return { label: "Online", icon: FaGlobe, color: "bg-cyan-50 text-cyan-700 border-cyan-200" };
};

const numberToWords = (num) => {
  if (num === 0) return "Zero";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const convert = (n) => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + convert(n % 100) : "");
    if (n < 100000) return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + convert(n % 1000) : "");
    if (n < 10000000) return convert(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + convert(n % 100000) : "");
    return convert(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + convert(n % 10000000) : "");
  };
  return convert(Math.round(num)) + " Rupees Only";
};

const getBookingServices = (booking) => {
  if (!booking) return [];
  const fromServiceItems = Array.isArray(booking.serviceItems) && booking.serviceItems.length > 0 ? booking.serviceItems : null;
  const fromServices = Array.isArray(booking.services) && booking.services.length > 0 ? booking.services : null;
  const arr = fromServiceItems || fromServices || [];

  const baseServices = arr.map((s) => {
    const rawStatus = s.paymentStatus || booking.paymentStatus || "Due";
    const normalizedStatus = rawStatus === "Pending" ? "Due" : rawStatus;
    return {
      serviceId: s.serviceId || s._id || "",
      _id: s.serviceId || s._id || "",
      name: s.name || "Service",
      price: Number(s.price) || 0,
      description: s.description || "",
      category: s.category || s.serviceCategory || s.type || "",
      paymentStatus: normalizedStatus,
      isReviewService: false,
    };
  });

  const reviewServices = Array.isArray(booking?.reviews)
    ? booking.reviews.map((r) => {
      const rawStatus = booking.paymentStatus || "Due";
      const normalizedStatus = rawStatus === "Pending" ? "Due" : rawStatus;
      return {
        serviceId: r.serviceId || r._id || "",
        _id: r.serviceId || r._id || "",
        name: r.name || "Review Service",
        price: Number(r.price) || 0,
        description: r.description || "",
        category: "clinic",
        paymentStatus: normalizedStatus,
        isReviewService: true,
        addedAt: r.addedAt || null,
      };
    })
    : [];

  return [...baseServices, ...reviewServices];
};

const classifyService = (svc) => {
  if (!svc) return "clinic";
  const cat = (svc.category || svc.serviceCategory || svc.type || "").toString().toLowerCase();
  const name = (svc.name || "").toString().toLowerCase();
  if (cat.includes("pharm") || cat.includes("medic") || name.includes("pharm") || name.includes("medic")) return "pharmacy";
  if (cat.includes("lab") || cat.includes("test") || cat.includes("diagnos") || name.includes("lab") || name.includes("test")) return "lab";
  return "clinic";
};

const getAmountBreakdown = (booking) => {
  if (!booking)
    return { clinic: 0, lab: 0, pharmacy: 0, total: 0, manualMedicineTotal: 0, manualLabTotal: 0, reviewTotal: 0 };

  const services = getBookingServices(booking);
  let clinic = 0, lab = 0, pharmacy = 0;

  services.forEach((s) => {
    const cat = classifyService(s);
    const price = Number(s.price) || 0;
    if (s.isReviewService) clinic += price;
    else if (cat === "lab") lab += price;
    else if (cat === "pharmacy") pharmacy += price;
    else clinic += price;
  });

  const manualMedicineTotal = Number(booking?.medicineTotal) || 0;
  const manualLabTotal = Number(booking?.labTotal) || 0;
  pharmacy += manualMedicineTotal;
  lab += manualLabTotal;

  const reviewServices = Array.isArray(booking?.reviews) ? booking.reviews : [];
  const reviewTotal = reviewServices.reduce((sum, r) => sum + (Number(r.price) || 0), 0);

  const computed = clinic + lab + pharmacy;
  if (computed === 0) {
    const fallback =
      Number(booking.finalPayable) || Number(booking.finalPayableAmount) ||
      Number(booking.grandTotal) || Number(booking.totalAmount) || 0;
    clinic = fallback;
  }

  return { clinic, lab, pharmacy, total: clinic + lab + pharmacy, manualMedicineTotal, manualLabTotal, reviewTotal };
};

const getBookingSubtotal = (booking) => {
  if (!booking) return 0;
  const items = getBookingServices(booking);
  return items.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
};

const getBookingFinalPayable = (booking) => {
  if (!booking) return 0;
  const final =
    Number(booking.finalPayable) || Number(booking.finalPayableAmount) ||
    Number(booking.grandTotal) || Number(booking.totalAmount) || 0;
  if (final > 0) return final;
  const subtotal = getBookingSubtotal(booking);
  const commission = Number(booking.commissionAmount) || 0;
  const discount = Number(booking.discount) || 0;
  return subtotal - commission - discount;
};

const getBookingPaidInfo = (booking) => {
  if (!booking) return { final: 0, paid: 0, balance: 0, status: "Due" };
  const final = getBookingFinalPayable(booking);
  const rawStatus = booking.paymentStatus || "Due";
  const status = rawStatus === "Pending" ? "Due" : rawStatus;
  let paid = Number(booking.amountPaid) || 0;
  if (status === "Paid") paid = final;
  else if (status === "Due") paid = 0;
  const balance = Math.max(0, final - paid);
  return { final, paid, balance, status };
};

// ✅ Per-category independent payment status (Empty for ₹0)
const getCategoryStatuses = (booking) => {
  const breakdown = getAmountBreakdown(booking);
  const categories = ["clinic", "lab", "pharmacy"];
  const stored = booking?.categoryPayment || {};
  const result = {};

  // Legacy: agar categoryPayment nahi hai but booking Paid hai → sab Paid
  const legacyFullyPaid = !booking?.categoryPayment && booking?.paymentStatus === "Paid";
  // Legacy: agar Partial hai but categoryPayment nahi → unknown distribution, fallback to top-level
  const legacyPartial = !booking?.categoryPayment && booking?.paymentStatus === "Partial";

  categories.forEach((cat) => {
    const amt = Number(breakdown?.[cat]) || 0;
    if (amt <= 0) {
      result[cat] = "Empty";
      return;
    }

    const paidAmt = Number(stored?.[cat]?.paidAmount) || 0;

    if (paidAmt >= amt - 0.5) {
      result[cat] = "Paid";
    } else if (paidAmt > 0) {
      result[cat] = "Partial";
    } else if (legacyFullyPaid) {
      result[cat] = "Paid";
    } else if (legacyPartial) {
      // Legacy Partial: no per-category data → treat as Due (user can update)
      result[cat] = "Due";
    } else {
      result[cat] = "Due";
    }
  });

  return result;
};

const getReviewWindowStatus = (booking) => {
  if (!booking) return { canReview: false, daysLeft: 0, expired: false, isReviewed: false };
  const appointmentDateStr = booking.appointmentDate || booking.date;
  if (!appointmentDateStr) return { canReview: false, daysLeft: 0, expired: false, isReviewed: false };
  const appointmentDate = new Date(appointmentDateStr);
  if (isNaN(appointmentDate.getTime())) return { canReview: false, daysLeft: 0, expired: false, isReviewed: false };
  appointmentDate.setHours(23, 59, 59, 999);
  const today = new Date();
  const diffMs = today - appointmentDate;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const daysLeft = Math.max(0, REVIEW_WINDOW_DAYS - diffDays);
  return { canReview: true, daysLeft, expired: false, isReviewed: booking.isReviewed === true };
};

const fetchCityFromPincode = async (pincode) => {
  if (!pincode || pincode.trim().length < 6) return null;
  try {
    const res = await axios.get(`https://api.postalpincode.in/pincode/${encodeURIComponent(pincode.trim())}`);
    if (Array.isArray(res.data) && res.data[0]?.Status === "Success") {
      const offices = res.data[0].PostOffice || [];
      if (offices.length > 0) {
        const first = offices[0];
        return { city: first.District || first.Block || first.Name || "", state: first.State || "", area: first.Name || "", allOffices: offices };
      }
    }
    return null;
  } catch (err) { console.warn("City fetch failed:", err); return null; }
};

const computePaymentStatusFromAmount = (amountEntered, finalPayable) => {
  const amt = parseFloat(amountEntered) || 0;
  const final = parseFloat(finalPayable) || 0;
  if (final <= 0) return amt > 0 ? "Paid" : "Due";
  if (amt <= 0) return "Due";
  if (amt >= final) return "Paid";
  return "Partial";
};

const computeDiscountAmount = (subtotal, discountValue, discountType) => {
  const val = parseFloat(discountValue) || 0;
  if (val <= 0) return 0;
  if (discountType === "%") return (subtotal * val) / 100;
  return val;
};

const computeFinancials = (serviceItems, { labTotal = 0, medicineTotal = 0, referralCommission = 0, discount = 0, discountType = "₹", partialAmount = 0, offerAmount = 0 } = {}) => {
  const servicesSubtotal = (serviceItems || []).reduce((sum, s) => sum + (Number(s.price) || 0), 0);
  const subtotal = servicesSubtotal + (Number(labTotal) || 0) + (Number(medicineTotal) || 0);
  const commissionPercent = parseFloat(referralCommission) || 0;
  const commissionAmount = (subtotal * commissionPercent) / 100;
  const discountAmount = computeDiscountAmount(subtotal, discount, discountType);
  const offerDeduction = Number(offerAmount) || 0;
  const finalPayable = Math.max(0, subtotal - commissionAmount - discountAmount - offerDeduction);

  const parsedPartial = parseFloat(partialAmount) || 0;
  const paymentStatus = computePaymentStatusFromAmount(parsedPartial, finalPayable);
  const amountPaid = paymentStatus === "Paid" ? finalPayable : (paymentStatus === "Partial" ? Math.min(parsedPartial, finalPayable) : 0);
  const balanceAmount = Math.max(0, finalPayable - amountPaid);

  return { servicesSubtotal, subtotal, commissionPercent, commissionAmount, discountAmount, offerDeduction, finalPayable, parsedPartial, paymentStatus, amountPaid, balanceAmount };
};

/* ============================================================ */
/* DateRangePopup                                               */
/* ============================================================ */
const DateRangePopup = ({
  isOpen, position, fromDate, toDate, onFromChange, onToChange, onClear, onClose, dataAttr,
}) => {
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  useEffect(() => {
    if (isOpen) {
      if (fromDate) {
        const d = new Date(fromDate);
        if (!isNaN(d.getTime())) setCalendarMonth(new Date(d.getFullYear(), d.getMonth(), 1));
        else setCalendarMonth(new Date());
      } else {
        setCalendarMonth(new Date());
      }
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
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month - 1, prevMonthDays - i), currentMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), currentMonth: true });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), currentMonth: false });
    }
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
        <button type="button" onClick={onClear} className="text-[11px] font-bold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md border border-red-200 transition-colors">Reset</button>
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
          <button type="button" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))} className="p-1.5 hover:bg-gray-100 rounded-md text-gray-600"><FaChevronLeft className="w-3 h-3" /></button>
          <div className="text-xs font-bold text-gray-800">{monthLabel}</div>
          <button type="button" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))} className="p-1.5 hover:bg-gray-100 rounded-md text-gray-600"><FaChevronRight className="w-3 h-3" /></button>
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

export default function OpManagement() {
  const navigate = useNavigate();
  const location = useLocation();

  const [bookings, setBookings] = useState([]);
  const [backendStats, setBackendStats] = useState(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [allSlots, setAllSlots] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [referralContacts, setReferralContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [filteredServices, setFilteredServices] = useState([]);
  const [showServiceSuggestions, setShowServiceSuggestions] = useState(false);

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusModalBooking, setStatusModalBooking] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [openPaymentDropdown, setOpenPaymentDropdown] = useState(null);
  const [paymentUpdating, setPaymentUpdating] = useState(false);

  const [existingPatient, setExistingPatient] = useState(null);
  const [showExistingPatientPopup, setShowExistingPatientPopup] = useState(false);
  const [searchingPatient, setSearchingPatient] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [feeTypeFilter, setFeeTypeFilter] = useState("All");
  const [doctorFilter, setDoctorFilter] = useState("All");
  const [bookingTypeFilter, setBookingTypeFilter] = useState("All");
  const [revenueCategoryFilter, setRevenueCategoryFilter] = useState("All");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState("All");
  const [referredByFilter, setReferredByFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [apptFromDate, setApptFromDate] = useState("");
  const [apptToDate, setApptToDate] = useState("");
  const [timeFilter, setTimeFilter] = useState("All");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [activeCardFilter, setActiveCardFilter] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");

  const [showRevenueBreakdown, setShowRevenueBreakdown] = useState(false);

  const [showRegDatePopup, setShowRegDatePopup] = useState(false);
  const [showApptDatePopup, setShowApptDatePopup] = useState(false);
  const [regPopupPos, setRegPopupPos] = useState({ top: 0, left: 0 });
  const [apptPopupPos, setApptPopupPos] = useState({ top: 0, left: 0 });

  const [showMobileWelcome, setShowMobileWelcome] = useState(false);

  const [showCalculationPopup, setShowCalculationPopup] = useState(false);
  const [calculationData, setCalculationData] = useState(null);
  const [userClosedCalcPopup, setUserClosedCalcPopup] = useState(false);

  const [toast, setToast] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [patientBookings, setPatientBookings] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedBookingForPrescription, setSelectedBookingForPrescription] = useState(null);
  const prescriptionRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    const saved = localStorage.getItem("opMgmt_itemsPerPage");
    return saved ? parseInt(saved, 10) : 10;
  });

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceModalUrl, setInvoiceModalUrl] = useState("");
  const [invoiceModalBooking, setInvoiceModalBooking] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(null);
  const [invoiceSending, setInvoiceSending] = useState(null);

  const [showMedicineTotalModal, setShowMedicineTotalModal] = useState(false);
  const [medicineTotalBooking, setMedicineTotalBooking] = useState(null);
  const [editingMedicineTotal, setEditingMedicineTotal] = useState("");
  const [savingMedicineTotal, setSavingMedicineTotal] = useState(false);

  const [showLabTotalModal, setShowLabTotalModal] = useState(false);
  const [labTotalBooking, setLabTotalBooking] = useState(null);
  const [editingLabTotal, setEditingLabTotal] = useState("");
  const [savingLabTotal, setSavingLabTotal] = useState(false);

  const [showLabItemsModal, setShowLabItemsModal] = useState(false);
  const [labItemsBooking, setLabItemsBooking] = useState(null);
  const [labItemsList, setLabItemsList] = useState([]);
  const [labItemPrice, setLabItemPrice] = useState("");
  const [savingLabItems, setSavingLabItems] = useState(false);

  const [showPharmacyItemsModal, setShowPharmacyItemsModal] = useState(false);
  const [pharmacyItemsBooking, setPharmacyItemsBooking] = useState(null);
  const [pharmacyItemsList, setPharmacyItemsList] = useState([]);
  const [pharmacyItemPrice, setPharmacyItemPrice] = useState("");
  const [savingPharmacyItems, setSavingPharmacyItems] = useState(false);

  const [showPartialModal, setShowPartialModal] = useState(false);
  const [partialBooking, setPartialBooking] = useState(null);
  const [partialCategory, setPartialCategory] = useState(null);
  const [partialAmountInput, setPartialAmountInput] = useState("");
  const [savingPartial, setSavingPartial] = useState(false);
  const [partialPaymentType, setPartialPaymentType] = useState("cash");

  const [showPaymentTypeEditModal, setShowPaymentTypeEditModal] = useState(false);
  const [paymentTypeEditBooking, setPaymentTypeEditBooking] = useState(null);
  const [paymentTypeEditValue, setPaymentTypeEditValue] = useState("cash");
  const [savingPaymentTypeEdit, setSavingPaymentTypeEdit] = useState(false);

  const [citySuggestions, setCitySuggestions] = useState([]);
  const [fetchingCity, setFetchingCity] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const pincodeDebounceRef = useRef(null);

  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [vitalsBooking, setVitalsBooking] = useState(null);
  const [vitalsData, setVitalsData] = useState({ temp: "", bp: "", pr: "", weight: "" });
  const [savingVitals, setSavingVitals] = useState(false);

  const [togglingStatus, setTogglingStatus] = useState(null);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewBooking, setReviewBooking] = useState(null);
  const [reviewData, setReviewData] = useState({ isReviewed: false, reviewDate: "" });
  const [savingReview, setSavingReview] = useState(false);

  const [reviewServices, setReviewServices] = useState([]);
  const [reviewServiceInput, setReviewServiceInput] = useState("");
  const [showReviewServiceSuggestions, setShowReviewServiceSuggestions] = useState(false);
  const [filteredReviewServices, setFilteredReviewServices] = useState([]);

  const [selectedCustomerOffers, setSelectedCustomerOffers] = useState([]);
  const [selectedOfferId, setSelectedOfferId] = useState("");
  const [appliedOffer, setAppliedOffer] = useState(null);

  const [showClinicServicesModal, setShowClinicServicesModal] = useState(false);
  const [clinicServicesBooking, setClinicServicesBooking] = useState(null);
  const [clinicServicesList, setClinicServicesList] = useState([]);
  const [clinicServiceInput, setClinicServiceInput] = useState("");
  const [clinicServicePrice, setClinicServicePrice] = useState("");
  const [clinicServiceSuggestions, setClinicServiceSuggestions] = useState([]);
  const [showClinicServiceSuggestions, setShowClinicServiceSuggestions] = useState(false);
  const [savingClinicServices, setSavingClinicServices] = useState(false);

  const [openActionDropdown, setOpenActionDropdown] = useState(null);

  const phoneInputRef = useRef(null);
  const nameInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const API_BASE_INVURL = 'https://api.timelyhealth.in';

  /* ============================================================
     ✅ Helper Functions
     ============================================================ */

  // ✅ Preserve existing paid amount correctly — ALL legacy cases handled
  const computeExistingPaidTotal = (booking) => {
    if (!booking) return 0;

    const existing = booking.categoryPayment;
    const rawStatus = booking.paymentStatus || "Due";
    const wasPaid = rawStatus === "Paid";
    const wasPartial = rawStatus === "Partial";
    const bd = getAmountBreakdown(booking);

    // Case 1: New structure (categoryPayment present) — sum paid amounts
    if (existing && (existing.clinic || existing.lab || existing.pharmacy)) {
      return (
        (Number(existing.clinic?.paidAmount) || 0) +
        (Number(existing.lab?.paidAmount) || 0) +
        (Number(existing.pharmacy?.paidAmount) || 0)
      );
    }

    // Case 2: Legacy Paid — full amount treated as paid
    if (wasPaid) {
      return (Number(bd.clinic) || 0) + (Number(bd.lab) || 0) + (Number(bd.pharmacy) || 0);
    }

    // Case 3: Legacy Partial — use existing amountPaid
    if (wasPartial) {
      return Number(booking.amountPaid) || Number(booking.partialAmount) || 0;
    }

    // Case 4: Legacy Due — 0
    return 0;
  };

  // ✅ Category payment snapshot builder — preserves existing paidAmount
  const buildCategoryPaymentSnapshot = (booking) => {
    const existing = booking?.categoryPayment;
    const bd = getAmountBreakdown(booking);
    const wasPaid = booking?.paymentStatus === "Paid";

    return {
      clinic: {
        paidAmount:
          existing?.clinic?.paidAmount !== undefined
            ? Number(existing.clinic.paidAmount) || 0
            : wasPaid ? (Number(bd.clinic) || 0) : 0,
      },
      lab: {
        paidAmount:
          existing?.lab?.paidAmount !== undefined
            ? Number(existing.lab.paidAmount) || 0
            : wasPaid ? (Number(bd.lab) || 0) : 0,
      },
      pharmacy: {
        paidAmount:
          existing?.pharmacy?.paidAmount !== undefined
            ? Number(existing.pharmacy.paidAmount) || 0
            : wasPaid ? (Number(bd.pharmacy) || 0) : 0,
      },
    };
  };

  const hasActiveFilters =
    searchQuery !== "" || statusFilter !== "All" || feeTypeFilter !== "All" ||
    doctorFilter !== "All" || bookingTypeFilter !== "All" ||
    fromDate !== "" || toDate !== "" || apptFromDate !== "" || apptToDate !== "" ||
    (selectedMonth && selectedMonth !== "") ||
    (timeFilter && timeFilter !== "All") ||
    revenueCategoryFilter !== "All" || paymentTypeFilter !== "All" ||
    referredByFilter !== "All";

  useEffect(() => {
    const isMobile = window.innerWidth < 1024;
    if (isMobile) setShowMobileWelcome(true);
  }, []);

  const handleMobileWelcomeChoice = (choice) => {
    setShowMobileWelcome(false);
    if (choice === "register") setTimeout(() => { handleAddNewPatient(); }, 200);
  };

  /* ============================================================
     CLINIC SERVICES MODAL HANDLERS
     ============================================================ */
  const openClinicServicesModal = (booking) => {
    if (!booking) return;
    const allServices = getBookingServices(booking);
    const clinicOnly = allServices.filter((s) => {
      if (s.isReviewService) return false;
      return classifyService(s) === "clinic";
    });
    setClinicServicesList(clinicOnly.map((s) => ({
      serviceId: s.serviceId || s._id || "",
      name: s.name,
      price: Number(s.price) || 0,
      description: s.description || "",
    })));
    setClinicServicesBooking(booking);
    setClinicServiceInput("");
    setClinicServicePrice("");
    setClinicServiceSuggestions([]);
    setShowClinicServiceSuggestions(false);
    setShowClinicServicesModal(true);
  };

  const handleAddClinicServiceItem = (service) => {
    if (!service) return;
    setClinicServicesList((prev) => [...prev, {
      serviceId: service._id || "",
      name: service.name,
      price: Number(service.price) || 0,
      description: service.description || "",
    }]);
    setClinicServiceInput("");
    setClinicServicePrice("");
    setClinicServiceSuggestions([]);
    setShowClinicServiceSuggestions(false);
  };

  const handleAddCustomClinicService = async () => {
    const name = clinicServiceInput.trim();
    const price = clinicServicePrice.trim();
    if (!name) { showToast("Please enter a service name", "error"); return; }
    if (!price) { showToast("Please enter service price", "error"); return; }
    const existingService = services.find((s) => s.name.toLowerCase() === name.toLowerCase());
    if (existingService) { handleAddClinicServiceItem(existingService); return; }

    try {
      const res = await axios.post(`${API_BASE_URL}/services/addservice`, { name, price: parseFloat(price), description: "" });
      if (res?.data?.success) {
        const newService = res.data.data;
        await fetchServices();
        setClinicServicesList((prev) => [...prev, {
          serviceId: newService._id || "",
          name: newService.name,
          price: Number(newService.price) || 0,
          description: "",
        }]);
        setClinicServiceInput("");
        setClinicServicePrice("");
        setClinicServiceSuggestions([]);
        setShowClinicServiceSuggestions(false);
        showToast(`Service "${newService.name}" created and added!`, "success");
      } else { showToast(res.data?.message || "Failed to create service", "error"); }
    } catch (error) { showToast(error.response?.data?.message || "Failed to create service", "error"); }
  };

  const handleRemoveClinicServiceItem = (index) => {
    setClinicServicesList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateClinicServicePrice = (index, newPrice) => {
    setClinicServicesList((prev) => prev.map((s, i) => (i === index ? { ...s, price: Number(newPrice) || 0 } : s)));
  };

  const handleSaveClinicServices = async () => {
    if (!clinicServicesBooking) return;
    setSavingClinicServices(true);
    try {
      const booking = clinicServicesBooking;
      const allServices = getBookingServices(booking);
      const nonClinic = allServices.filter((s) => {
        if (s.isReviewService) return false;
        return classifyService(s) !== "clinic";
      });
      const mergedServices = [
        ...clinicServicesList.map((s) => ({
          serviceId: s.serviceId || "", name: s.name, price: Number(s.price) || 0,
          description: s.description || "", category: "clinic",
        })),
        ...nonClinic.map((s) => ({
          serviceId: s.serviceId || s._id || "", name: s.name, price: Number(s.price) || 0,
          description: s.description || "", category: s.category || "",
        })),
      ];

      const fin = computeFinancials(mergedServices, {
        labTotal: Number(booking.labTotal) || 0,
        medicineTotal: Number(booking.medicineTotal) || 0,
        referralCommission: booking.referralCommission || 0,
        discount: booking.discount || 0,
        discountType: booking.discountType || "₹",
        partialAmount: computeExistingPaidTotal(booking),  // ✅ FIX
        offerAmount: booking.offerApplied?.offerAmount || 0,
      });

      const payload = {
        patientTitle: booking.patientTitle, patientName: booking.patientName,
        patientPhone: booking.patientPhone, patientAge: booking.patientAge,
        patientDob: booking.patientDob, patientGender: booking.patientGender,
        patientAddress: booking.patientAddress, patientCity: booking.patientCity,
        patientPincode: booking.patientPincode, purpose: booking.purpose,
        paymentType: booking.paymentType, paymentStatus: fin.paymentStatus,
        partialAmount: fin.parsedPartial, amountPaid: fin.amountPaid,
        balanceAmount: fin.balanceAmount, subtotal: fin.subtotal,
        commissionAmount: fin.commissionAmount, discount: fin.discountAmount,
        discountType: booking.discountType || "₹", offerDeduction: fin.offerDeduction,
        finalPayable: fin.finalPayable, finalPayableAmount: fin.finalPayable,
        grandTotal: fin.finalPayable, totalAmount: fin.finalPayable,
        doctorId: booking.doctorId, appointmentDate: booking.appointmentDate,
        isOP: true, status: booking.status || "confirmed",
        serviceItems: mergedServices, services: mergedServices,
        labItems: Array.isArray(booking.labItems) ? booking.labItems : [],
        medicineItems: Array.isArray(booking.medicineItems) ? booking.medicineItems : [],
        referredByCustomer: booking.referredByCustomer, referredByDoctor: booking.referredByDoctor,
        referralCustomerId: booking.referralCustomerId, referralDoctorId: booking.referralDoctorId,
        referralCommission: booking.referralCommission, referralCommissionType: booking.referralCommissionType,
        offerApplied: booking.offerApplied || null,
        categoryPayment: buildCategoryPaymentSnapshot(booking),
      };

      const res = await axios.put(`${API_BASE_URL}/appointment-slots/updateop/${booking._id}`, payload);
      if (res?.data?.success) {
        showToast(`✅ Services updated! ${clinicServicesList.length} clinic service${clinicServicesList.length !== 1 ? "s" : ""}.`, "success");
        setShowClinicServicesModal(false);
        setClinicServicesBooking(null);
        setClinicServicesList([]);
        await fetchBookings();
        refreshPatientBookings();
      } else { showToast(res.data?.message || "Failed to update services", "error"); }
    } catch (err) {
      console.error("Clinic services save error:", err);
      showToast(err.response?.data?.message || "Failed to update services", "error");
    } finally { setSavingClinicServices(false); }
  };

  /* ============================================================
     LAB ITEMS MULTI-ITEM HANDLERS
     ============================================================ */
  const openLabItemsModal = (booking) => {
    if (!booking) return;
    let items = Array.isArray(booking.labItems) ? booking.labItems : [];
    if (items.length === 0 && (Number(booking.labTotal) || 0) > 0) {
      items = [{ serviceId: "", name: "Lab Test", price: Number(booking.labTotal) || 0, description: "", category: "lab" }];
    }
    setLabItemsList(items.map((s) => ({
      serviceId: s.serviceId || s._id || "",
      name: s.name || "Lab Test",
      price: Number(s.price) || 0,
      description: s.description || "",
    })));
    setLabItemsBooking(booking);
    setLabItemPrice("");
    setShowLabItemsModal(true);
  };

  const handleAddLabItem = () => {
    const price = labItemPrice.trim();
    if (!price) { showToast("Please enter lab amount", "error"); return; }
    if (Number(price) < 0) { showToast("Invalid amount", "error"); return; }
    setLabItemsList((prev) => [...prev, {
      serviceId: "",
      name: `Lab Test ${prev.length + 1}`,
      price: Number(price) || 0,
      description: "",
    }]);
    setLabItemPrice("");
  };

  const handleRemoveLabItem = (index) => {
    setLabItemsList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateLabItemPrice = (index, newPrice) => {
    setLabItemsList((prev) => prev.map((s, i) => (i === index ? { ...s, price: Number(newPrice) || 0 } : s)));
  };

  const handleSaveLabItems = async () => {
    if (!labItemsBooking) return;
    setSavingLabItems(true);
    try {
      const booking = labItemsBooking;
      const allServices = getBookingServices(booking);
      const nonReviewServices = allServices.filter((s) => !s.isReviewService);

      const mergedServices = nonReviewServices.map((s) => ({
        serviceId: s.serviceId || s._id || "",
        name: s.name,
        price: Number(s.price) || 0,
        description: s.description || "",
        category: s.category || "",
      }));

      const labItems = labItemsList.map((s) => ({
        serviceId: s.serviceId || "",
        name: s.name,
        price: Number(s.price) || 0,
        description: s.description || "",
        category: "lab",
      }));
      const labTotal = labItems.reduce((sum, s) => sum + (Number(s.price) || 0), 0);

      const fin = computeFinancials(mergedServices, {
        labTotal,
        medicineTotal: Number(booking.medicineTotal) || 0,
        referralCommission: booking.referralCommission || 0,
        discount: booking.discount || 0,
        discountType: booking.discountType || "₹",
        partialAmount: computeExistingPaidTotal(booking),  // ✅ FIX
        offerAmount: booking.offerApplied?.offerAmount || 0,
      });

      const payload = {
        patientTitle: booking.patientTitle, patientName: booking.patientName,
        patientPhone: booking.patientPhone, patientAge: booking.patientAge,
        patientDob: booking.patientDob, patientGender: booking.patientGender,
        patientAddress: booking.patientAddress, patientCity: booking.patientCity,
        patientPincode: booking.patientPincode, purpose: booking.purpose,
        paymentType: booking.paymentType, paymentStatus: fin.paymentStatus,
        partialAmount: fin.parsedPartial, amountPaid: fin.amountPaid,
        balanceAmount: fin.balanceAmount, subtotal: fin.subtotal,
        commissionAmount: fin.commissionAmount, discount: fin.discountAmount,
        discountType: booking.discountType || "₹", offerDeduction: fin.offerDeduction,
        finalPayable: fin.finalPayable, finalPayableAmount: fin.finalPayable,
        grandTotal: fin.finalPayable, totalAmount: fin.finalPayable,
        doctorId: booking.doctorId, appointmentDate: booking.appointmentDate,
        isOP: true, status: booking.status || "confirmed",
        serviceItems: mergedServices, services: mergedServices,
        labItems, labTotal,
        medicineItems: Array.isArray(booking.medicineItems) ? booking.medicineItems : [],
        medicineTotal: Number(booking.medicineTotal) || 0,
        referredByCustomer: booking.referredByCustomer, referredByDoctor: booking.referredByDoctor,
        referralCustomerId: booking.referralCustomerId, referralDoctorId: booking.referralDoctorId,
        referralCommission: booking.referralCommission, referralCommissionType: booking.referralCommissionType,
        offerApplied: booking.offerApplied || null,
        categoryPayment: buildCategoryPaymentSnapshot(booking),
      };

      const res = await axios.put(`${API_BASE_URL}/appointment-slots/updateop/${booking._id}`, payload);
      if (res?.data?.success) {
        showToast(`✅ Lab items updated! Total: ₹${Math.round(labTotal)} (${labItems.length} item${labItems.length !== 1 ? "s" : ""})`, "success");
        setShowLabItemsModal(false);
        setLabItemsBooking(null);
        setLabItemsList([]);
        await fetchBookings();
        refreshPatientBookings();
      } else {
        showToast(res.data?.message || "Failed to update lab items", "error");
      }
    } catch (err) {
      console.error("Lab items save error:", err);
      showToast(err.response?.data?.message || "Failed to update lab items", "error");
    } finally {
      setSavingLabItems(false);
    }
  };

  /* ============================================================
     PHARMACY ITEMS MULTI-ITEM HANDLERS
     ============================================================ */
  const openPharmacyItemsModal = (booking) => {
    if (!booking) return;
    let items = Array.isArray(booking.medicineItems) ? booking.medicineItems : [];
    if (items.length === 0 && (Number(booking.medicineTotal) || 0) > 0) {
      items = [{ serviceId: "", name: "Medicine", price: Number(booking.medicineTotal) || 0, description: "", category: "pharmacy" }];
    }
    setPharmacyItemsList(items.map((s) => ({
      serviceId: s.serviceId || s._id || "",
      name: s.name || "Medicine",
      price: Number(s.price) || 0,
      description: s.description || "",
    })));
    setPharmacyItemsBooking(booking);
    setPharmacyItemPrice("");
    setShowPharmacyItemsModal(true);
  };

  const handleAddPharmacyItem = () => {
    const price = pharmacyItemPrice.trim();
    if (!price) { showToast("Please enter medicine amount", "error"); return; }
    if (Number(price) < 0) { showToast("Invalid amount", "error"); return; }
    setPharmacyItemsList((prev) => [...prev, {
      serviceId: "",
      name: `Medicine ${prev.length + 1}`,
      price: Number(price) || 0,
      description: "",
    }]);
    setPharmacyItemPrice("");
  };

  const handleRemovePharmacyItem = (index) => {
    setPharmacyItemsList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdatePharmacyItemPrice = (index, newPrice) => {
    setPharmacyItemsList((prev) => prev.map((s, i) => (i === index ? { ...s, price: Number(newPrice) || 0 } : s)));
  };

  const handleSavePharmacyItems = async () => {
    if (!pharmacyItemsBooking) return;
    setSavingPharmacyItems(true);
    try {
      const booking = pharmacyItemsBooking;
      const allServices = getBookingServices(booking);
      const nonReviewServices = allServices.filter((s) => !s.isReviewService);

      const mergedServices = nonReviewServices.map((s) => ({
        serviceId: s.serviceId || s._id || "",
        name: s.name,
        price: Number(s.price) || 0,
        description: s.description || "",
        category: s.category || "",
      }));

      const medicineItems = pharmacyItemsList.map((s) => ({
        serviceId: s.serviceId || "",
        name: s.name,
        price: Number(s.price) || 0,
        description: s.description || "",
        category: "pharmacy",
      }));
      const medicineTotal = medicineItems.reduce((sum, s) => sum + (Number(s.price) || 0), 0);

      const fin = computeFinancials(mergedServices, {
        labTotal: Number(booking.labTotal) || 0,
        medicineTotal,
        referralCommission: booking.referralCommission || 0,
        discount: booking.discount || 0,
        discountType: booking.discountType || "₹",
        partialAmount: computeExistingPaidTotal(booking),  // ✅ FIX
        offerAmount: booking.offerApplied?.offerAmount || 0,
      });

      const payload = {
        patientTitle: booking.patientTitle, patientName: booking.patientName,
        patientPhone: booking.patientPhone, patientAge: booking.patientAge,
        patientDob: booking.patientDob, patientGender: booking.patientGender,
        patientAddress: booking.patientAddress, patientCity: booking.patientCity,
        patientPincode: booking.patientPincode, purpose: booking.purpose,
        paymentType: booking.paymentType, paymentStatus: fin.paymentStatus,
        partialAmount: fin.parsedPartial, amountPaid: fin.amountPaid,
        balanceAmount: fin.balanceAmount, subtotal: fin.subtotal,
        commissionAmount: fin.commissionAmount, discount: fin.discountAmount,
        discountType: booking.discountType || "₹", offerDeduction: fin.offerDeduction,
        finalPayable: fin.finalPayable, finalPayableAmount: fin.finalPayable,
        grandTotal: fin.finalPayable, totalAmount: fin.finalPayable,
        doctorId: booking.doctorId, appointmentDate: booking.appointmentDate,
        isOP: true, status: booking.status || "confirmed",
        serviceItems: mergedServices, services: mergedServices,
        labItems: Array.isArray(booking.labItems) ? booking.labItems : [],
        labTotal: Number(booking.labTotal) || 0,
        medicineItems, medicineTotal,
        referredByCustomer: booking.referredByCustomer, referredByDoctor: booking.referredByDoctor,
        referralCustomerId: booking.referralCustomerId, referralDoctorId: booking.referralDoctorId,
        referralCommission: booking.referralCommission, referralCommissionType: booking.referralCommissionType,
        offerApplied: booking.offerApplied || null,
        categoryPayment: buildCategoryPaymentSnapshot(booking),
      };

      const res = await axios.put(`${API_BASE_URL}/appointment-slots/updateop/${booking._id}`, payload);
      if (res?.data?.success) {
        showToast(`✅ Pharmacy items updated! Total: ₹${Math.round(medicineTotal)} (${medicineItems.length} item${medicineItems.length !== 1 ? "s" : ""})`, "success");
        setShowPharmacyItemsModal(false);
        setPharmacyItemsBooking(null);
        setPharmacyItemsList([]);
        await fetchBookings();
        refreshPatientBookings();
      } else {
        showToast(res.data?.message || "Failed to update pharmacy items", "error");
      }
    } catch (err) {
      console.error("Pharmacy items save error:", err);
      showToast(err.response?.data?.message || "Failed to update pharmacy items", "error");
    } finally {
      setSavingPharmacyItems(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleRoleBasedNavigate = (path) => {
    const userRole = localStorage.getItem("userRole");
    if (userRole === "employee") {
      const cleanPath = path.startsWith("/") ? path.substring(1) : path;
      navigate(`/employee/${cleanPath}`);
    } else { navigate(path); }
  };

  const patients = useMemo(() => {
    const map = new Map();
    const sortedBookings = [...bookings].sort((a, b) => new Date(b.createdAt || b.bookedAt || 0) - new Date(a.createdAt || a.bookedAt || 0));
    sortedBookings.forEach((b) => {
      const key = (b.patientPhone || b.patientName || "").toString().trim();
      if (!key) return;
      if (!map.has(key)) {
        const rawPS = b.paymentStatus || "Due";
        const normalizedPS = rawPS === "Pending" ? "Due" : rawPS;
        map.set(key, {
          _id: b.patientId || b._id || key,
          title: b.patientTitle || "Mr.", name: b.patientName || "",
          dob: b.patientDob || "", age: b.patientAge || "",
          gender: b.patientGender || "", phone: b.patientPhone || "",
          email: b.patientEmail || "", address: b.patientAddress || "",
          city: b.patientCity || "", pincode: b.patientPincode || "",
          bloodGroup: b.patientBloodGroup || "",
          medicalHistory: b.patientMedicalHistory || "",
          allergies: b.patientAllergies || "",
          medications: b.patientMedications || "",
          reason: b.purpose || "",
          paymentType: b.paymentType || "cash",
          paymentStatus: normalizedPS,
          serviceItems: getBookingServices(b),
          referredByCustomer: b.referredByCustomer || "",
          referredByDoctor: b.referredByDoctor || "",
          referralCustomerId: b.referralCustomerId || "",
          referralDoctorId: b.referralDoctorId || "",
          referralCommission: b.referralCommission || "",
          referralCommissionType: b.referralCommissionType || "",
          createdAt: b.createdAt || b.bookedAt,
          latestBookingId: b._id,
          isActive: b.isActive !== undefined ? b.isActive : true,
          isReviewed: b.isReviewed === true,
          reviewDate: b.reviewDate || null,
          isOP: b.isOP,
        });
      }
    });
    return Array.from(map.values());
  }, [bookings]);

  useEffect(() => {
    fetchAllData();
    const today = new Date().toISOString().split("T")[0];
    setFormData((prev) => ({ ...prev, appointmentDate: today }));
  }, []);

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    timeFilter, fromDate, toDate, apptFromDate, apptToDate, selectedMonth,
    doctorFilter, paymentTypeFilter, statusFilter,
    bookingTypeFilter, revenueCategoryFilter, searchQuery
  ]);

  useEffect(() => {
    const isSpecificTimeFilter = timeFilter && timeFilter !== "All";
    const isSpecificRevenueFilter = revenueCategoryFilter !== "All";

    if (isSpecificTimeFilter && isSpecificRevenueFilter && bookings.length > 0) {
      const details = bookings
        .map((b) => {
          const bd = getAmountBreakdown(b);
          const pi = getBookingPaidInfo(b);
          const mode = (b.paymentType || "cash").toString().toLowerCase();
          const catTotal = (Number(bd.clinic) || 0) + (Number(bd.lab) || 0) + (Number(bd.pharmacy) || 0);
          const catAmount = Number(bd[revenueCategoryFilter]) || 0;
          const ratio = catTotal > 0 ? catAmount / catTotal : 0;
          const catPaid = pi.paid * ratio;
          const catDue = pi.balance * ratio;

          return {
            bookingId: b._id,
            patientName: b.patientName || "N/A",
            patientPhone: b.patientPhone || "",
            doctorName: b.doctorName || "",
            date: b.appointmentDate || b.date || "",
            paymentType: mode,
            clinic: Number(bd.clinic) || 0,
            lab: Number(bd.lab) || 0,
            pharmacy: Number(bd.pharmacy) || 0,
            categoryAmount: catAmount,
            categoryPaid: catPaid,
            categoryDue: catDue,
            cash: mode === "cash" ? catPaid : 0,
            online: mode === "online" ? catPaid : 0,
            card: mode === "card" ? catPaid : 0,
            insurance: mode === "insurance" ? catPaid : 0,
          };
        })
        .filter((d) => d.categoryAmount > 0);

      const sum = (key) => details.reduce((s, d) => s + (d[key] || 0), 0);

      setCalculationData({
        timeFilter,
        revenueCategory: revenueCategoryFilter,
        bookings: details,
        total: sum("categoryAmount"),
        totalPaid: sum("categoryPaid"),
        totalDue: sum("categoryDue"),
        cash: sum("cash"),
        online: sum("online"),
        card: sum("card"),
        insurance: sum("insurance"),
      });
      setUserClosedCalcPopup(false);
      setShowCalculationPopup(true);
    } else {
      setShowCalculationPopup(false);
      setCalculationData(null);
      setUserClosedCalcPopup(false);
    }
  }, [bookings, timeFilter, revenueCategoryFilter]);

  useEffect(() => {
    if (location.state?.openAddPatient) {
      setTimeout(() => {
        const today = new Date().toISOString().split("T")[0];
        setFormData({ ...EMPTY_FORM, appointmentDate: today });
        setEditingId(null);
        setShowForm(true);
      }, 150);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state]);

  useEffect(() => {
    if (formData.doctorId && formData.appointmentDate) {
      filterSlotsByDoctorAndDate(formData.doctorId, formData.appointmentDate);
    }
  }, [formData.doctorId, formData.appointmentDate]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".payment-dropdown")) setOpenPaymentDropdown(null);
      if (!e.target.closest(".service-dropdown-add-patient")) setShowServiceSuggestions(false);
      if (!e.target.closest(".city-dropdown-add-patient")) setShowCitySuggestions(false);
      if (!e.target.closest(".action-dropdown")) setOpenActionDropdown(null);
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

  useEffect(() => {
    return () => {
      if (pincodeDebounceRef.current) clearTimeout(pincodeDebounceRef.current);
    };
  }, []);

  const fetchAllData = () => {
    fetchBookings();
    fetchDoctors();
    fetchAllSlots();
    fetchServices();
    fetchReferralContacts();
  };

  const fetchBookings = async () => {
    setLoading(true);
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

      const url = `${API_BASE_URL}/appointment-slots/getallbookings${params.toString() ? "?" + params.toString() : ""}`;
      const res = await axios.get(url);

      let bookingsData = [];
      if (res.data?.success) {
        bookingsData = res.data.bookings || res.data.data || [];
        if (res.data.stats) setBackendStats(res.data.stats);
        if (res.data.categoryBreakdown) setCategoryBreakdown(res.data.categoryBreakdown);
      } else if (Array.isArray(res.data)) {
        bookingsData = res.data;
      }

      const transformedBookings = bookingsData.map((b) => {
        const slotDetails = b.slotDetails || {};
        const rawServices =
          (Array.isArray(b.services) && b.services.length > 0 && b.services) ||
          (Array.isArray(b.serviceItems) && b.serviceItems.length > 0 && b.serviceItems) ||
          [];

        const normalizedServices = rawServices.map((s) => {
          const rawSvcPS = s.paymentStatus;
          const rawBookPS = b.paymentStatus;
          const fallback = rawSvcPS
            ? (rawSvcPS === "Pending" ? "Due" : rawSvcPS)
            : (rawBookPS ? (rawBookPS === "Pending" ? "Due" : rawBookPS) : "Due");
          return {
            serviceId: s.serviceId || s._id || "",
            _id: s.serviceId || s._id || "",
            name: s.name || "Service",
            price: Number(s.price) || 0,
            description: s.description || "",
            category: s.category || s.serviceCategory || s.type || "",
            paymentStatus: fallback,
            addedAt: s.addedAt || b.createdAt || new Date().toISOString(),
          };
        });

        const normalizedLabItems = Array.isArray(b.labItems)
          ? b.labItems.map((item) => ({
            serviceId: item.serviceId || item._id || "",
            name: item.name || "Lab Test",
            price: Number(item.price) || 0,
            description: item.description || "",
            category: "lab",
          }))
          : [];

        const normalizedMedicineItems = Array.isArray(b.medicineItems)
          ? b.medicineItems.map((item) => ({
            serviceId: item.serviceId || item._id || "",
            name: item.name || "Medicine",
            price: Number(item.price) || 0,
            description: item.description || "",
            category: "pharmacy",
          }))
          : [];

        const servicesTotal = normalizedServices.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
        const subtotal = Number(b.subtotal) || servicesTotal;
        const commissionAmount = Number(b.commissionAmount) || 0;
        const discount = Number(b.discount) || 0;
        const finalPayable =
          Number(b.finalPayable) || Number(b.finalPayableAmount) || Number(b.grandTotal) ||
          Number(b.totalAmount) || (subtotal - commissionAmount - discount) || 0;
        const totalAmount = Number(b.totalAmount) || Number(b.grandTotal) || finalPayable;
        const amountPaid = Number(b.amountPaid) || 0;
        const balanceAmount = Number(b.balanceAmount) || Math.max(0, finalPayable - amountPaid);
        const rawBookingPS = b.paymentStatus || "Due";
        const normalizedBookingPS = rawBookingPS === "Pending" ? "Due" : rawBookingPS;

        return {
          _id: b._id || b.id,
          slotId: b.slotId || b._id,
          patientId: b.patientId || "",
          patientName: b.patientName || "",
          patientAge: b.patientAge || "",
          patientGender: b.patientGender || "",
          patientPhone: b.patientPhone || "",
          patientEmail: b.patientEmail || "",
          patientAddress: b.patientAddress || "",
          patientCity: b.patientCity || "",
          patientPincode: b.patientPincode || "",
          patientTitle: b.patientTitle || "Mr.",
          patientDob: b.patientDob || "",
          patientBloodGroup: b.patientBloodGroup || "",
          patientMedicalHistory: b.patientMedicalHistory || "",
          patientAllergies: b.patientAllergies || "",
          patientMedications: b.patientMedications || "",
          dayOfWeek: slotDetails.dayOfWeek || b.dayOfWeek || "",
          date: slotDetails.date || b.appointmentDate || b.date || "",
          startTime: slotDetails.startTime || b.startTime || "",
          endTime: slotDetails.endTime || b.endTime || "",
          doctorId: slotDetails.doctorId || b.doctorId || "",
          doctorName: slotDetails.doctorName || b.doctorName || "",
          doctorSpecialization: slotDetails.doctorSpecialization || b.doctorSpecialization || "",
          purpose: b.purpose || "",
          symptoms: b.symptoms || "",
          appointmentType: b.appointmentType || "Consultation",
          priority: b.priority || "Normal",
          paymentType: b.paymentType || "cash",
          paymentStatus: normalizedBookingPS,
          partialAmount: Number(b.partialAmount) || 0,
          subtotal, commissionAmount, discount, finalPayable, finalPayableAmount: finalPayable,
          totalAmount, grandTotal: totalAmount, amountPaid, balanceAmount,
          tax: Number(b.tax) || 0,
          status: b.status || "confirmed",
          services: normalizedServices,
          serviceItems: normalizedServices,
          labItems: normalizedLabItems,
          medicineItems: normalizedMedicineItems,
          // ✅ CRITICAL: categoryPayment pass-through
          categoryPayment: b.categoryPayment || null,
          createdAt: b.createdAt || b.bookedAt || new Date().toISOString(),
          bookedAt: b.bookedAt || b.createdAt || new Date().toISOString(),
          appointmentDate: b.appointmentDate || slotDetails.date || "",
          isOP: b.isOP || false,
          isActive: b.isActive !== undefined ? b.isActive : true,
          referredBy: b.referredBy || "",
          referralContactId: b.referralContactId || "",
          referredByCustomer: b.referredByCustomer || "",
          referredByDoctor: b.referredByDoctor || "",
          referralCustomerId: b.referralCustomerId || "",
          referralDoctorId: b.referralDoctorId || "",
          referralCommission: b.referralCommission || "",
          referralCommissionType: b.referralCommissionType || "",
          clinicalNotes: b.clinicalNotes || "",
          diagnosis: b.diagnosis || "",
          prescription: b.prescription || "",
          medicines: Array.isArray(b.medicines) ? b.medicines : [],
          medicineTotal: Number(b.medicineTotal) || 0,
          labTotal: Number(b.labTotal) || 0,
          vitalsTemp: b.vitalsTemp || "",
          vitalsBp: b.vitalsBp || "",
          vitalsPr: b.vitalsPr || "",
          vitalsWeight: b.vitalsWeight || "",
          followUpRequired: b.followUpRequired || false,
          followUpDate: b.followUpDate || "",
          followUpNotes: b.followUpNotes || "",
          checkInTime: b.checkInTime || null,
          checkOutTime: b.checkOutTime || null,
          waitingTime: Number(b.waitingTime) || 0,
          notes: b.notes || "",
          patientRating: b.patientRating ?? null,
          patientFeedback: b.patientFeedback || "",
          isReviewed: b.isReviewed === true,
          reviewDate: b.reviewDate || null,
          reviews: Array.isArray(b.reviews) ? b.reviews : [],
          reviewServicesTotal: Number(b.reviewServicesTotal) || 0,
          invoiceUrl: b.invoiceUrl || null,
          offerApplied: b.offerApplied || null,
        };
      });
      setBookings(transformedBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setBookings([]);
      setBackendStats(null);
      setCategoryBreakdown(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/doctors/getalldoctors`);
      if (res.data?.success) setDoctors(res.data.data || []);
    } catch (error) { console.error("Error fetching doctors:", error); setDoctors([]); }
  };

  const fetchAllSlots = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/appointment-slots`);
      if (res.data?.success) setAllSlots(res.data.slots || []);
    } catch (error) { console.error("Error fetching all slots:", error); }
  };

  const fetchServices = async () => {
    setServicesLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/services/allservices`);
      setServices(res?.data?.success ? res.data.services || [] : []);
    } catch (error) { console.error("Error fetching services:", error); setServices([]); }
    finally { setServicesLoading(false); }
  };

  const fetchReferralContacts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/referralcontacts/getallreferralcontacts`);
      let contacts = [];
      if (res.data?.success) contacts = res.data.data || [];
      else if (Array.isArray(res.data)) contacts = res.data;
      setReferralContacts(contacts);
    } catch (error) { console.error("Error fetching referral contacts:", error); setReferralContacts([]); }
  };

  const getCustomerOffers = (customerId) => {
    if (!customerId) return [];
    const contact = referralContacts.find((c) => c._id === customerId && c.referralType === "customer");
    return Array.isArray(contact?.offers) ? contact.offers : [];
  };

  const parseSlotTimeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    try {
      const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
      if (!match) return 0;
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const meridiem = (match[3] || "").toUpperCase();
      if (meridiem === "PM" && hours !== 12) hours += 12;
      if (meridiem === "AM" && hours === 12) hours = 0;
      return hours * 60 + minutes;
    } catch { return 0; }
  };

  const filterSlotsByDoctorAndDate = (doctorId, date) => {
    if (!doctorId || !date) { setAvailableSlots([]); return; }
    setSlotsLoading(true);
    setAvailableSlots([]);
    setFormData((prev) => ({ ...prev, slotId: "" }));
    try {
      const selectedDay = getDayNameFromDate(date);
      let filtered = allSlots.filter((slot) => {
        if (slot.doctorId !== doctorId) return false;
        if (slot.type === "break") return false;
        if (slot.date && slot.date.trim() !== "") return slot.date === date;
        return slot.dayOfWeek === selectedDay;
      });
      const seen = new Set();
      filtered = filtered.filter((slot) => {
        if (seen.has(slot.startTime)) return false;
        seen.add(slot.startTime);
        return true;
      });
      filtered.sort((a, b) => {
        const aMins = parseSlotTimeToMinutes(a.startTime);
        const bMins = parseSlotTimeToMinutes(b.startTime);
        return aMins - bMins;
      });
      setAvailableSlots(filtered);
    } catch (error) {
      console.error("Error filtering slots:", error);
      setAvailableSlots([]);
      showToast("Failed to filter slots", "error");
    } finally { setSlotsLoading(false); }
  };

  const checkExistingPatient = (value) => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (editingId) { setExistingPatient(null); setShowExistingPatientPopup(false); return; }
    if (!value || value.length < 2) { setExistingPatient(null); setShowExistingPatientPopup(false); return; }
    setSearchingPatient(true);
    searchTimeoutRef.current = setTimeout(() => {
      const matches = bookings
        .filter((b) => b.patientPhone === value)
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      const latest = matches[0];
      if (latest) {
        const rawPS = latest.paymentStatus || "Due";
        const normalizedPS = rawPS === "Pending" ? "Due" : rawPS;
        const derived = patients.find((p) => p.phone === value) || {
          _id: latest.patientId || latest._id,
          title: latest.patientTitle || "Mr.",
          name: latest.patientName || "",
          dob: latest.patientDob || "", age: latest.patientAge || "",
          gender: latest.patientGender || "", phone: latest.patientPhone || "",
          address: latest.patientAddress || "", city: latest.patientCity || "",
          pincode: latest.patientPincode || "", reason: latest.purpose || "",
          paymentType: latest.paymentType || "cash",
          paymentStatus: normalizedPS,
          serviceItems: getBookingServices(latest),
          referredByCustomer: latest.referredByCustomer || "",
          referredByDoctor: latest.referredByDoctor || "",
          referralCustomerId: latest.referralCustomerId || "",
          referralDoctorId: latest.referralDoctorId || "",
          referralCommission: latest.referralCommission || "",
          referralCommissionType: latest.referralCommissionType || "",
        };
        setExistingPatient(derived);
        setShowExistingPatientPopup(true);
      } else { setExistingPatient(null); setShowExistingPatientPopup(false); }
      setSearchingPatient(false);
    }, 500);
  };

  const autoFillPatientDetails = () => {
    if (!existingPatient) return;
    setFormData((prev) => ({
      ...prev,
      title: existingPatient.title || "Mr.",
      name: existingPatient.name || "",
      dob: existingPatient.dob || "",
      age: existingPatient.age ?? "",
      gender: existingPatient.gender || "",
      phone: existingPatient.phone || "",
      address: existingPatient.address || "",
      city: existingPatient.city || "",
      pincode: existingPatient.pincode || "",
      referredByCustomer: existingPatient.referredByCustomer || "",
      referredByDoctor: existingPatient.referredByDoctor || "",
      referralCustomerId: existingPatient.referralCustomerId || "",
      referralDoctorId: existingPatient.referralDoctorId || "",
      referralCommission: existingPatient.referralCommission || "",
      referralCommissionType: existingPatient.referralCommissionType || "",
      serviceItems: [], paymentStatus: "Due", partialAmount: "",
      discount: "", discountType: "₹", paymentType: "cash",
      doctorId: "", slotId: "", offerApplied: null,
    }));
    if (existingPatient.referralCustomerId) {
      const offers = getCustomerOffers(existingPatient.referralCustomerId);
      setSelectedCustomerOffers(offers);
    } else { setSelectedCustomerOffers([]); }
    setSelectedOfferId("");
    setAppliedOffer(null);
    setCitySuggestions([]);
    setShowCitySuggestions(false);
    setShowExistingPatientPopup(false);
    showToast(`Patient ${existingPatient.name} ki basic details auto-filled! Ab services add karo.`, "info");
  };

  const handleDobChange = (dob) => {
    const newAge = calculateAgeFromDOB(dob);
    setFormData((prev) => {
      const autoTitle = autoSelectTitleFromDob(dob, prev.gender);
      const finalTitle = autoTitle || prev.title;
      const autoGender = genderFromTitle(finalTitle);
      return { ...prev, dob, age: newAge, title: finalTitle, gender: autoGender || prev.gender };
    });
  };

  const handleGenderChange = (gender) => {
    setFormData((prev) => {
      const autoTitle = autoSelectTitleFromDob(prev.dob, gender);
      return { ...prev, gender, title: autoTitle || prev.title };
    });
  };

  const handleTitleChange = (title) => {
    setFormData((prev) => {
      const autoGender = genderFromTitle(title);
      const newGender = autoGender || prev.gender;
      return { ...prev, title, gender: newGender };
    });
  };

  const handlePincodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setFormData((prev) => ({ ...prev, pincode: value }));
    if (pincodeDebounceRef.current) clearTimeout(pincodeDebounceRef.current);
    if (!value || value.length < 6) { setCitySuggestions([]); setShowCitySuggestions(false); return; }
    pincodeDebounceRef.current = setTimeout(async () => {
      setFetchingCity(true);
      const result = await fetchCityFromPincode(value);
      setFetchingCity(false);
      if (result) {
        setCitySuggestions(result.allOffices.map((o) => ({
          pincode: o.Pincode, area: o.Name, district: o.District, state: o.State,
        })));
        setShowCitySuggestions(true);
        setFormData((prev) => ({ ...prev, city: prev.city || result.city }));
      } else { setCitySuggestions([]); setShowCitySuggestions(false); }
    }, 500);
  };

  const handleSelectCity = (suggestion) => {
    setFormData((prev) => ({
      ...prev,
      city: suggestion.district || suggestion.area || prev.city,
      pincode: suggestion.pincode,
    }));
    setShowCitySuggestions(false);
  };

  const handleReferralCustomerSelect = (contact) => {
    if (!contact) return;
    const offers = Array.isArray(contact.offers) ? contact.offers : [];
    setSelectedCustomerOffers(offers);
    setSelectedOfferId("");
    setAppliedOffer(null);
    setFormData((prev) => ({
      ...prev,
      referredByCustomer: contact.customerName || "",
      referralCustomerId: contact._id,
      offerApplied: null,
    }));
  };

  const handleReferralDoctorSelect = (contact) => {
    if (!contact) return;
    setFormData((prev) => ({
      ...prev,
      referredByDoctor: contact.doctorName || "",
      referralDoctorId: contact._id,
    }));
  };

  const handleAddCustomerReferral = () => handleRoleBasedNavigate("/referral-management");
  const handleAddDoctorReferral = () => handleRoleBasedNavigate("/referral-management");

  const handleAddServiceItem = (service) => {
    if (!service) return;
    setFormData((prev) => ({ ...prev, serviceItems: [...prev.serviceItems, { ...service, custom: false }] }));
    setFilteredServices([]);
    setShowServiceSuggestions(false);
  };

  const handleAddCustomServiceItem = async () => {
    const serviceName = formData.serviceName?.trim();
    const servicePrice = formData.servicePrice?.trim();
    if (!serviceName) { showToast("Please enter a service name", "error"); return; }
    if (!servicePrice) { showToast("Please enter service price", "error"); return; }
    let existingService = services.find((s) => s.name.toLowerCase() === serviceName.toLowerCase());
    if (existingService) {
      handleAddServiceItem(existingService);
      setFormData((prev) => ({ ...prev, serviceName: "", servicePrice: "" }));
      return;
    }
    try {
      const res = await axios.post(`${API_BASE_URL}/services/addservice`, {
        name: serviceName, price: parseFloat(servicePrice), description: ""
      });
      if (res?.data?.success) {
        const newService = res.data.data;
        await fetchServices();
        setFormData((prev) => ({
          ...prev,
          serviceItems: [...prev.serviceItems, { ...newService, custom: false }],
          serviceName: "", servicePrice: ""
        }));
        showToast(`Service "${newService.name}" created and added!`, "success");
      } else { showToast(res.data?.message || "Failed to create service", "error"); }
    } catch (error) { showToast(error.response?.data?.message || "Failed to create service", "error"); }
  };

  const handleRemoveServiceItem = (serviceId) => {
    setFormData((prev) => ({ ...prev, serviceItems: prev.serviceItems.filter((s) => s._id !== serviceId) }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") { setFormData((prev) => ({ ...prev, [name]: value })); checkExistingPatient(value); }
    else if (name === "dob") handleDobChange(value);
    else if (name === "gender") handleGenderChange(value);
    else if (name === "title") handleTitleChange(value);
    else if (name === "name") setFormData((prev) => ({ ...prev, name: value.toUpperCase() }));
    else setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSlotSelect = (slotId) => setFormData((prev) => ({ ...prev, slotId }));

  const handleEdit = (patient, existingBooking) => {
    const today = new Date().toISOString().split("T")[0];
    const doctorId = existingBooking?.doctorId || "";
    const appointmentDate = existingBooking?.appointmentDate || existingBooking?.date || today;
    const slotId = existingBooking?.slotId || existingBooking?._id || "";
    const bookingId = existingBooking?._id || "";

    const rawPS = existingBooking?.paymentStatus || patient.paymentStatus || "Due";
    const normalizedPS = rawPS === "Pending" ? "Due" : rawPS;

    setFormData({
      title: existingBooking?.patientTitle || patient.title || "Mr.",
      name: existingBooking?.patientName || patient.name || "",
      dob: existingBooking?.patientDob || patient.dob || "",
      age: existingBooking?.patientAge ?? patient.age ?? "",
      gender: existingBooking?.patientGender || patient.gender || "",
      phone: existingBooking?.patientPhone || patient.phone || "",
      address: existingBooking?.patientAddress || patient.address || "",
      city: existingBooking?.patientCity || patient.city || "",
      pincode: existingBooking?.patientPincode || patient.pincode || "",
      serviceItems: getBookingServices(existingBooking),
      paymentType: existingBooking?.paymentType || patient.paymentType || "cash",
      reason: existingBooking?.purpose || patient.reason || "",
      paymentStatus: normalizedPS,
      doctorId, slotId, bookingId, appointmentDate,
      selectedServices: existingBooking?.services || [],
      referredByCustomer: existingBooking?.referredByCustomer || patient.referredByCustomer || "",
      referredByDoctor: existingBooking?.referredByDoctor || patient.referredByDoctor || "",
      referralCustomerId: existingBooking?.referralCustomerId || patient.referralCustomerId || "",
      referralDoctorId: existingBooking?.referralDoctorId || patient.referralDoctorId || "",
      referralCommission: existingBooking?.referralCommission || patient.referralCommission || "",
      referralCommissionType: existingBooking?.referralCommissionType || patient.referralCommissionType || "",
      partialAmount: existingBooking?.amountPaid || existingBooking?.partialAmount || "",
      discount: existingBooking?.discount || "",
      discountType: "₹",
      serviceName: "", servicePrice: "",
      status: existingBooking?.status || "confirmed",
      offerApplied: existingBooking?.offerApplied || null,
    });

    const customerId = existingBooking?.referralCustomerId || patient.referralCustomerId || "";
    if (customerId) {
      const offers = getCustomerOffers(customerId);
      setSelectedCustomerOffers(offers);
      const appliedOfferId = existingBooking?.offerApplied?.offerId || "";
      setSelectedOfferId(appliedOfferId);
      if (appliedOfferId) {
        const offer = offers.find((o) => o._id === appliedOfferId);
        setAppliedOffer(offer || null);
      } else { setAppliedOffer(null); }
    } else {
      setSelectedCustomerOffers([]);
      setSelectedOfferId("");
      setAppliedOffer(null);
    }

    setEditingId(bookingId);
    setShowForm(true);
    setExistingPatient(null);
    setShowExistingPatientPopup(false);
    setFilteredServices([]);
    setShowServiceSuggestions(false);
    setAvailableSlots([]);
    setCitySuggestions([]);
    setShowCitySuggestions(false);

    if (doctorId && appointmentDate) {
      setTimeout(() => filterSlotsByDoctorAndDate(doctorId, appointmentDate), 200);
    }
  };

  const handleAddNewPatient = () => {
    const today = new Date().toISOString().split("T")[0];
    setFormData({ ...EMPTY_FORM, appointmentDate: today });
    setEditingId(null);
    setShowForm(true);
    setAvailableSlots([]);
    setExistingPatient(null);
    setShowExistingPatientPopup(false);
    setFilteredServices([]);
    setShowServiceSuggestions(false);
    setCitySuggestions([]);
    setShowCitySuggestions(false);
    setSelectedCustomerOffers([]);
    setSelectedOfferId("");
    setAppliedOffer(null);
  };

  const cancelForm = () => {
    const today = new Date().toISOString().split("T")[0];
    setFormData({ ...EMPTY_FORM, appointmentDate: today });
    setEditingId(null);
    setShowForm(false);
    setAvailableSlots([]);
    setExistingPatient(null);
    setShowExistingPatientPopup(false);
    setFilteredServices([]);
    setShowServiceSuggestions(false);
    setCitySuggestions([]);
    setShowCitySuggestions(false);
    setSelectedCustomerOffers([]);
    setSelectedOfferId("");
    setAppliedOffer(null);
  };

  const handleToggleActiveStatus = async (patient) => {
    const matchingBooking = getMatchingBooking(patient);
    if (!matchingBooking) { showToast("No booking found for this patient", "error"); return; }
    const currentStatus = matchingBooking.isActive !== undefined ? matchingBooking.isActive : true;
    const newStatus = !currentStatus;
    setTogglingStatus(patient._id);
    try {
      const res = await axios.put(`${API_BASE_URL}/appointment-slots/toggle-active/${matchingBooking._id}`, { isActive: newStatus });
      if (res?.data?.success) {
        showToast(`Patient marked as ${newStatus ? "Active" : "Inactive"}!`, "success");
        await fetchBookings();
        refreshPatientBookings();
      } else { showToast(res.data.message || "Failed to update status", "error"); }
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to update status", "error");
    } finally { setTogglingStatus(null); }
  };

  const handleRowClick = (patient) => fetchPatientData(patient);

  const fetchPatientData = async (patient) => {
    setHistoryLoading(true);
    setSelectedPatient(patient);
    try {
      const list = bookings.filter((b) =>
        b.patientPhone === patient.phone ||
        (b.patientName && patient.name && b.patientName.toLowerCase() === patient.name.toLowerCase()));
      list.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
      setPatientBookings(list);
      setShowPatientModal(true);
    } catch (err) {
      console.error("Error fetching patient data:", err);
      showToast("Failed to fetch patient data", "error");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleStatusSelect = async (booking, status, e) => {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    if (statusUpdating || status === booking.status) {
      setShowStatusModal(false);
      setStatusModalBooking(null);
      return;
    }
    setStatusUpdating(true);
    try {
      const res = await axios.put(`${API_BASE_URL}/appointment-slots/${booking._id}`, { status });
      if (res?.data?.success) {
        showToast(`Status updated to ${status}!`, "success");
        setShowStatusModal(false);
        setStatusModalBooking(null);
        await fetchBookings();
        refreshPatientBookings();
      } else {
        showToast(res.data.message || "Failed to update status", "error");
      }
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to update status", "error");
    } finally {
      setStatusUpdating(false);
    }
  };

  const handlePaymentDropdownToggle = (bookingId, e) => {
    e.stopPropagation();
    setOpenPaymentDropdown(openPaymentDropdown === bookingId ? null : bookingId);
  };

  const handlePaymentSelect = async (booking, paymentStatus, e) => {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    if (paymentUpdating || paymentStatus === booking.paymentStatus) { setOpenPaymentDropdown(null); return; }
    if (paymentStatus === "Partial" || paymentStatus === "Due") {
      openPartialModal(booking);
      setOpenPaymentDropdown(null);
      return;
    }
    setPaymentUpdating(true);
    try {
      const payload = { paymentStatus };
      if (paymentStatus === "Due") {
        payload.categoryPayment = {
          clinic: { paidAmount: 0 },
          lab: { paidAmount: 0 },
          pharmacy: { paidAmount: 0 },
        };
      } else if (paymentStatus === "Paid") {
        const bd = getAmountBreakdown(booking);
        payload.categoryPayment = {
          clinic: { paidAmount: Number(bd.clinic) || 0 },
          lab: { paidAmount: Number(bd.lab) || 0 },
          pharmacy: { paidAmount: Number(bd.pharmacy) || 0 },
        };
      }
      const res = await axios.put(`${API_BASE_URL}/appointment-slots/${booking._id}`, payload);
      if (res?.data?.success) {
        showToast(`Payment updated to ${paymentStatus}!`, "success");
        setOpenPaymentDropdown(null);
        await fetchBookings();
        refreshPatientBookings();
      } else showToast(res.data.message || "Failed to update payment", "error");
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to update payment", "error");
    } finally { setPaymentUpdating(false); }
  };

  const refreshPatientBookings = () => {
    if (selectedPatient) {
      const updated = bookings.filter((b) =>
        b.patientPhone === selectedPatient.phone ||
        (b.patientName && selectedPatient.name && b.patientName.toLowerCase() === selectedPatient.name.toLowerCase()));
      updated.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
      setPatientBookings(updated);
    }
  };

  const openPartialModal = (booking, category = null) => {
    setPartialBooking(booking);
    setPartialCategory(category);
    setPartialAmountInput(String(booking.amountPaid || booking.partialAmount || ""));
    setPartialPaymentType(booking.paymentType || "cash");
    setShowPartialModal(true);
  };

  const handleMarkFullPaid = async () => {
    if (!partialBooking) return;
    const bd = getAmountBreakdown(partialBooking);

    // ✅ Preserve existing per-category paidAmounts
    const existing = partialBooking.categoryPayment;
    const wasPaid = partialBooking.paymentStatus === "Paid";
    const categoryPayment = {
      clinic: {
        paidAmount: existing?.clinic?.paidAmount !== undefined
          ? Number(existing.clinic.paidAmount) || 0
          : wasPaid ? (Number(bd.clinic) || 0) : 0,
      },
      lab: {
        paidAmount: existing?.lab?.paidAmount !== undefined
          ? Number(existing.lab.paidAmount) || 0
          : wasPaid ? (Number(bd.lab) || 0) : 0,
      },
      pharmacy: {
        paidAmount: existing?.pharmacy?.paidAmount !== undefined
          ? Number(existing.pharmacy.paidAmount) || 0
          : wasPaid ? (Number(bd.pharmacy) || 0) : 0,
      },
    };

    // ✅ SIRF clicked category ko mark karo — baaki untouched
    if (partialCategory) {
      categoryPayment[partialCategory] = {
        paidAmount: Number(bd[partialCategory]) || 0,
      };
    } else {
      // Fallback: no category — mark all as paid
      categoryPayment.clinic = { paidAmount: Number(bd.clinic) || 0 };
      categoryPayment.lab = { paidAmount: Number(bd.lab) || 0 };
      categoryPayment.pharmacy = { paidAmount: Number(bd.pharmacy) || 0 };
    }

    // Recompute overall totals
    const totalPaid =
      (categoryPayment.clinic.paidAmount || 0) +
      (categoryPayment.lab.paidAmount || 0) +
      (categoryPayment.pharmacy.paidAmount || 0);
    const totalAmount =
      (Number(bd.clinic) || 0) + (Number(bd.lab) || 0) + (Number(bd.pharmacy) || 0);
    const totalDue = Math.max(0, totalAmount - totalPaid);

    let paymentStatus = "Due";
    if (totalDue <= 0.5 && totalPaid > 0) paymentStatus = "Paid";
    else if (totalPaid > 0) paymentStatus = "Partial";

    setSavingPartial(true);
    try {
      const res = await axios.put(`${API_BASE_URL}/appointment-slots/${partialBooking._id}`, {
        paymentStatus,
        paymentType: partialPaymentType,
        amountPaid: totalPaid,
        partialAmount: totalPaid,
        balanceAmount: totalDue,
        categoryPayment,
      });
      if (res?.data?.success) {
        const label = partialCategory
          ? `${partialCategory.charAt(0).toUpperCase() + partialCategory.slice(1)}`
          : "Payment";
        showToast(`✅ ${label} marked as Paid!`, "success");
        setShowPartialModal(false);
        setPartialBooking(null);
        setPartialCategory(null);
        setPartialAmountInput("");
        setPartialPaymentType("cash");
        await fetchBookings();
        refreshPatientBookings();
      } else showToast(res.data.message || "Failed to update payment", "error");
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to update payment", "error");
    } finally { setSavingPartial(false); }
  };

  const openPaymentTypeEditModal = (booking) => {
    if (!booking) return;
    setPaymentTypeEditBooking(booking);
    setPaymentTypeEditValue(booking?.paymentType || "cash");
    setShowPaymentTypeEditModal(true);
  };

  const handleSavePaymentTypeEdit = async () => {
    if (!paymentTypeEditBooking) return;
    setSavingPaymentTypeEdit(true);
    try {
      const res = await axios.put(`${API_BASE_URL}/appointment-slots/${paymentTypeEditBooking._id}`, { paymentType: paymentTypeEditValue });
      if (res?.data?.success) {
        showToast(`✅ Payment Type updated to ${paymentTypeEditValue}!`, "success");
        setShowPaymentTypeEditModal(false);
        setPaymentTypeEditBooking(null);
        setPaymentTypeEditValue("cash");
        await fetchBookings();
        refreshPatientBookings();
      } else { showToast(res.data?.message || "Failed to update payment type", "error"); }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update payment type", "error");
    } finally { setSavingPaymentTypeEdit(false); }
  };

  const openMedicineTotalModal = (booking) => {
    setMedicineTotalBooking(booking);
    setEditingMedicineTotal(booking.medicineTotal ? String(booking.medicineTotal) : "");
    setShowMedicineTotalModal(true);
  };

  const handleSaveMedicineTotal = async () => {
    if (!medicineTotalBooking) return;
    const total = parseFloat(editingMedicineTotal) || 0;
    if (total < 0) { showToast("Invalid amount", "error"); return; }
    setSavingMedicineTotal(true);
    try {
      const res = await axios.put(`${API_BASE_URL}/appointment-slots/updatecharges/${medicineTotalBooking._id}`, { medicineTotal: total });
      if (res?.data?.success) {
        showToast(`Medicine ₹${total} saved. New Total: ₹${res.data.data.totalAmount}`, "success");
        setShowMedicineTotalModal(false);
        setMedicineTotalBooking(null);
        await fetchBookings();
        refreshPatientBookings();
      } else showToast(res.data.message || "Failed to update", "error");
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to update", "error");
    } finally { setSavingMedicineTotal(false); }
  };

  const openLabTotalModal = (booking) => {
    setLabTotalBooking(booking);
    setEditingLabTotal(booking.labTotal ? String(booking.labTotal) : "");
    setShowLabTotalModal(true);
  };

  const handleSaveLabTotal = async () => {
    if (!labTotalBooking) return;
    const total = parseFloat(editingLabTotal) || 0;
    if (total < 0) { showToast("Invalid amount", "error"); return; }
    setSavingLabTotal(true);
    try {
      const res = await axios.put(`${API_BASE_URL}/appointment-slots/updatecharges/${labTotalBooking._id}`, { labTotal: total });
      if (res?.data?.success) {
        showToast(`Lab ₹${total} saved. New Total: ₹${res.data.data.totalAmount}`, "success");
        setShowLabTotalModal(false);
        setLabTotalBooking(null);
        await fetchBookings();
        refreshPatientBookings();
      } else showToast(res.data.message || "Failed to update", "error");
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to update", "error");
    } finally { setSavingLabTotal(false); }
  };

  const openVitalsModal = (booking) => {
    setVitalsBooking(booking);
    setVitalsData({
      temp: booking.vitalsTemp || "", bp: booking.vitalsBp || "",
      pr: booking.vitalsPr || "", weight: booking.vitalsWeight || "",
    });
    setShowVitalsModal(true);
  };

  const handleSaveVitals = async () => {
    if (!vitalsBooking) return;
    setSavingVitals(true);
    try {
      const res = await axios.put(`${API_BASE_URL}/appointment-slots/vitals/${vitalsBooking._id}`, {
        vitalsTemp: vitalsData.temp, vitalsBp: vitalsData.bp,
        vitalsPr: vitalsData.pr, vitalsWeight: vitalsData.weight,
      });
      if (res?.data?.success) {
        showToast("Vitals saved successfully!", "success");
        setShowVitalsModal(false);
        setVitalsBooking(null);
        setVitalsData({ temp: "", bp: "", pr: "", weight: "" });
        await fetchBookings();
        refreshPatientBookings();
      } else { showToast(res.data.message || "Failed to save vitals", "error"); }
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to save vitals", "error");
    } finally { setSavingVitals(false); }
  };

  const openReviewModal = (booking) => {
    if (!booking) return;
    setReviewBooking(booking);
    setReviewData({
      isReviewed: booking.isReviewed === true,
      reviewDate: booking.reviewDate || new Date().toISOString(),
    });
    setReviewServices([]);
    setReviewServiceInput("");
    setFilteredReviewServices([]);
    setShowReviewServiceSuggestions(false);
    setShowReviewModal(true);
  };

  const handleReviewServiceInputChange = (value) => {
    setReviewServiceInput(value);
    if (value.trim()) {
      const filtered = services.filter((s) => s.name.toLowerCase().includes(value.toLowerCase()));
      setFilteredReviewServices(filtered);
      setShowReviewServiceSuggestions(true);
    } else { setFilteredReviewServices([]); setShowReviewServiceSuggestions(false); }
  };

  const handleAddReviewService = (service) => {
    if (!service) return;
    const newReviewService = {
      serviceId: service._id || service.serviceId || "",
      name: service.name || "",
      price: Number(service.price) || 0,
      category: service.category || service.serviceCategory || service.type || "",
      description: service.description || "",
      addedAt: new Date().toISOString(),
    };
    setReviewServices((prev) => [...prev, newReviewService]);
    setReviewServiceInput("");
    setFilteredReviewServices([]);
    setShowReviewServiceSuggestions(false);
  };

  const handleAddCustomReviewService = () => {
    const name = reviewServiceInput.trim();
    if (!name) { showToast("Please enter a service name", "error"); return; }
    const matched = services.find((s) => s.name.toLowerCase() === name.toLowerCase());
    if (matched) { handleAddReviewService(matched); return; }
    setReviewServices((prev) => [...prev, {
      serviceId: "", name, price: 0, category: "", description: "",
      custom: true, addedAt: new Date().toISOString(),
    }]);
    setReviewServiceInput("");
    setFilteredReviewServices([]);
    setShowReviewServiceSuggestions(false);
  };

  const handleUpdateReviewServicePrice = (index, newPrice) => {
    setReviewServices((prev) => prev.map((r, i) => (i === index ? { ...r, price: Number(newPrice) || 0 } : r)));
  };

  const handleRemoveReviewService = (index) => {
    setReviewServices((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveReview = async () => {
    if (!reviewBooking) return;
    if (reviewServices.length === 0) { showToast("Please add at least one service before marking review.", "error"); return; }
    setSavingReview(true);
    try {
      const existingReviews = Array.isArray(reviewBooking.reviews) ? reviewBooking.reviews : [];
      const mergedReviews = [
        ...existingReviews.map((r) => ({
          serviceId: r.serviceId || "", name: r.name || "",
          price: Number(r.price) || 0, category: r.category || "",
          description: r.description || "", addedAt: r.addedAt || new Date().toISOString(),
        })),
        ...reviewServices.map((r) => ({
          serviceId: r.serviceId || "", name: r.name || "",
          price: Number(r.price) || 0, category: r.category || "",
          description: r.description || "", addedAt: r.addedAt || new Date().toISOString(),
        })),
      ];
      const mergedTotal = mergedReviews.reduce((sum, r) => sum + (Number(r.price) || 0), 0);
      const payload = {
        isReviewed: true,
        reviewDate: new Date().toISOString(),
        reviews: mergedReviews,
        reviewServicesTotal: mergedTotal,
      };
      const res = await axios.put(`${API_BASE_URL}/appointment-slots/review/${reviewBooking._id}`, payload);
      if (res?.data?.success || res?.status === 200) {
        showToast(`✅ Review updated! ${reviewServices.length} new service${reviewServices.length > 1 ? "s" : ""} added.`, "success");
        setShowReviewModal(false);
        setReviewBooking(null);
        setReviewData({ isReviewed: false, reviewDate: "" });
        setReviewServices([]);
        setReviewServiceInput("");
        setFilteredReviewServices([]);
        setShowReviewServiceSuggestions(false);
        await fetchBookings();
        refreshPatientBookings();
      } else { showToast(res.data?.message || "Failed to save review", "error"); }
    } catch (error) {
      console.error("Review save error:", error);
      const existingReviews = Array.isArray(reviewBooking.reviews) ? reviewBooking.reviews : [];
      const merged = [...existingReviews, ...reviewServices];
      setBookings((prev) =>
        prev.map((b) =>
          b._id === reviewBooking._id
            ? { ...b, isReviewed: true, reviewDate: new Date().toISOString(), reviews: merged, reviewServicesTotal: merged.reduce((s, r) => s + (Number(r.price) || 0), 0) }
            : b
        )
      );
      showToast("Review marked locally (backend unavailable)", "info");
      setShowReviewModal(false);
      setReviewBooking(null);
      setReviewServices([]);
    } finally { setSavingReview(false); }
  };

  const handleBookNow = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fin = computeFinancials(formData.serviceItems, {
        labTotal: 0, medicineTotal: 0,
        referralCommission: formData.referralCommission,
        discount: formData.discount, discountType: formData.discountType,
        partialAmount: formData.partialAmount,
        offerAmount: appliedOffer?.offerAmount || 0,
      });

      const bookingPayload = {
        patientTitle: formData.title, patientName: formData.name,
        patientPhone: formData.phone, patientAge: formData.age,
        patientDob: formData.dob, patientGender: formData.gender,
        patientAddress: formData.address, patientCity: formData.city,
        patientPincode: formData.pincode, purpose: formData.reason,
        paymentType: formData.paymentType, paymentStatus: fin.paymentStatus,
        partialAmount: fin.parsedPartial, amountPaid: fin.amountPaid,
        balanceAmount: fin.balanceAmount, subtotal: fin.subtotal,
        commissionAmount: fin.commissionAmount, discount: fin.discountAmount,
        discountType: formData.discountType, offerDeduction: fin.offerDeduction,
        finalPayable: fin.finalPayable, finalPayableAmount: fin.finalPayable,
        grandTotal: fin.finalPayable, totalAmount: fin.finalPayable,
        doctorId: formData.doctorId, appointmentDate: formData.appointmentDate,
        isOP: true, status: formData.status || "confirmed",
        serviceItems: formData.serviceItems.map((s) => ({
          serviceId: s._id, name: s.name, price: Number(s.price) || 0, description: s.description || "",
        })),
        services: formData.serviceItems.map((s) => ({
          serviceId: s._id, name: s.name, price: Number(s.price) || 0, description: s.description || "",
        })),
        referredByCustomer: formData.referredByCustomer,
        referredByDoctor: formData.referredByDoctor,
        referralCustomerId: formData.referralCustomerId,
        referralDoctorId: formData.referralDoctorId,
        referralCommission: formData.referralCommission,
        referralCommissionType: formData.referralCommissionType,
        slotId: formData.slotId,
        offerApplied: formData.offerApplied || null,
      };

      const slotRes = await axios.post(`${API_BASE_URL}/appointment-slots/book`, bookingPayload);
      if (slotRes.data.success) {
        showToast(`✅ Appointment booked successfully for ${formData.title} ${formData.name}!`, "success");
        await fetchBookings();
        fetchAllSlots();
        filterSlotsByDoctorAndDate(formData.doctorId, formData.appointmentDate);
        const today = new Date().toISOString().split("T")[0];
        setFormData({ ...EMPTY_FORM, appointmentDate: today });
        setEditingId(null); setShowForm(false); setAvailableSlots([]);
        setExistingPatient(null); setShowExistingPatientPopup(false);
        setFilteredServices([]); setShowServiceSuggestions(false);
        setCitySuggestions([]); setShowCitySuggestions(false);
        setSelectedCustomerOffers([]); setSelectedOfferId(""); setAppliedOffer(null);
      } else { showToast(slotRes.data.message || "Failed to book appointment", "error"); }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to book appointment", "error");
    } finally { setSubmitting(false); }
  };

  const handleUpdateNow = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const matchBForUpdate = getMatchingBooking({ phone: formData.phone, name: formData.name, _id: formData.bookingId });
      const labTotalForUpdate = Number(matchBForUpdate?.labTotal) || 0;
      const medicineTotalForUpdate = Number(matchBForUpdate?.medicineTotal) || 0;

      const fin = computeFinancials(formData.serviceItems, {
        labTotal: labTotalForUpdate, medicineTotal: medicineTotalForUpdate,
        referralCommission: formData.referralCommission,
        discount: formData.discount, discountType: formData.discountType,
        partialAmount: formData.partialAmount,
        offerAmount: appliedOffer?.offerAmount || 0,
      });

      const bookingPayload = {
        patientTitle: formData.title, patientName: formData.name,
        patientPhone: formData.phone, patientAge: formData.age,
        patientDob: formData.dob, patientGender: formData.gender,
        patientAddress: formData.address, patientCity: formData.city,
        patientPincode: formData.pincode, purpose: formData.reason,
        paymentType: formData.paymentType, paymentStatus: fin.paymentStatus,
        partialAmount: fin.parsedPartial, amountPaid: fin.amountPaid,
        balanceAmount: fin.balanceAmount, subtotal: fin.subtotal,
        commissionAmount: fin.commissionAmount, discount: fin.discountAmount,
        discountType: formData.discountType, offerDeduction: fin.offerDeduction,
        finalPayable: fin.finalPayable, finalPayableAmount: fin.finalPayable,
        grandTotal: fin.finalPayable, totalAmount: fin.finalPayable,
        doctorId: formData.doctorId, appointmentDate: formData.appointmentDate,
        isOP: true, status: formData.status || "confirmed",
        serviceItems: formData.serviceItems.map((s) => ({
          serviceId: s._id || s.serviceId, name: s.name, price: Number(s.price) || 0, description: s.description || "",
        })),
        services: formData.serviceItems.map((s) => ({
          serviceId: s._id || s.serviceId, name: s.name, price: Number(s.price) || 0, description: s.description || "",
        })),
        labItems: Array.isArray(matchBForUpdate?.labItems) ? matchBForUpdate.labItems : [],
        medicineItems: Array.isArray(matchBForUpdate?.medicineItems) ? matchBForUpdate.medicineItems : [],
        referredByCustomer: formData.referredByCustomer,
        referredByDoctor: formData.referredByDoctor,
        referralCustomerId: formData.referralCustomerId,
        referralDoctorId: formData.referralDoctorId,
        referralCommission: formData.referralCommission,
        referralCommissionType: formData.referralCommissionType,
        offerApplied: formData.offerApplied || null,
      };

      if (formData.slotId) bookingPayload.slotId = formData.slotId;

      const slotRes = await axios.put(`${API_BASE_URL}/appointment-slots/updateop/${formData.bookingId}`, bookingPayload);
      if (slotRes.data.success) {
        showToast(`✅ Appointment updated successfully for ${formData.title} ${formData.name}!`, "success");
        await fetchBookings();
        fetchAllSlots();
        if (formData.doctorId && formData.appointmentDate) {
          filterSlotsByDoctorAndDate(formData.doctorId, formData.appointmentDate);
        }
        const today = new Date().toISOString().split("T")[0];
        setFormData({ ...EMPTY_FORM, appointmentDate: today });
        setEditingId(null); setShowForm(false); setAvailableSlots([]);
        setExistingPatient(null); setShowExistingPatientPopup(false);
        setFilteredServices([]); setShowServiceSuggestions(false);
        setCitySuggestions([]); setShowCitySuggestions(false);
        setSelectedCustomerOffers([]); setSelectedOfferId(""); setAppliedOffer(null);
      } else { showToast(slotRes.data.message || "Failed to update appointment", "error"); }
    } catch (err) {
      console.error("❌ API Error:", err);
      showToast(err.response?.data?.message || "Failed to update appointment", "error");
    } finally { setSubmitting(false); }
  };

  const openPrescriptionModal = (booking) => {
    if (!booking) { showToast("No booking data found", "error"); return; }
    handlePrintPrescription(booking);
  };

  const handlePrintPrescription = (booking) => {
    const b = booking || selectedBookingForPrescription;
    if (!b) { showToast("No prescription data to print", "error"); return; }
    const win = window.open("", "_blank", "width=800,height=1100");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Prescription</title>
        <style>
          * { margin:0; padding:0; box-sizing:border-box; }
          html, body { margin: 0; padding: 0; background: #fff; width: 100%; }
          .prescription-page { width: 100%; max-width: 100%; position: relative; background: #fff; display: block; margin: 0; padding: 0; }
          .prescription-page img { width: 100%; height: auto; display: block; margin: 0; padding: 0; }
          .overlay-print { position: absolute; top: 0; left: 0; right: 0; bottom: 0; }
          .overlay-print .fld { position: absolute; font-size: 15px; font-weight: 600; color: #1a1a1a; letter-spacing: 0.2px; line-height: 1.3; }
          @page { size: auto; margin: 0; }
          @media print {
            html, body { margin: 0 !important; padding: 0 !important; }
            .prescription-page { margin: 0 !important; padding: 0 !important; page-break-after: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="prescription-page">
          <img src="${prescriptionTemplate}" alt="Prescription" />
          <div class="overlay-print">
            <div class="fld" style="top:102px;left:90px;max-width:280px;">${b.patientTitle || ""} ${b.patientName || "N/A"}</div>
            <div class="fld" style="top:106px;right:40px;">${formatDateToDDMMYYYY(b.appointmentDate || b.date)}</div>
            <div class="fld" style="top:138px;left:90px;">${b.patientAge || "N/A"}</div>
            <div class="fld" style="top:138px;left:320px;">${b.patientGender || "N/A"}</div>
            <div class="fld" style="top:138px;right:100px;">${b.patientPhone || "N/A"}</div>
            <div class="fld" style="top:168px;left:90px;max-width:320px;">${b.purpose || "N/A"}</div>
            <div class="fld" style="top:200px;left:90px;">${b.vitalsTemp || ""}</div>
            <div class="fld" style="top:200px;left:300px;">${b.vitalsBp || ""}</div>
            <div class="fld" style="top:200px;left:500px;">${b.vitalsPr || ""}</div>
            <div class="fld" style="top:200px;right:80px;">${b.vitalsWeight || ""}</div>
          </div>
        </div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `);
    win.document.close();
    win.focus();
  };

  const getMatchingBooking = (patient) => bookings.find((b) =>
    b.patientPhone === patient.phone ||
    (b.patientName && patient.name && b.patientName.toLowerCase() === patient.name.toLowerCase()));

  const getConsultationPaymentStatus = (patient) => {
    const raw = getMatchingBooking(patient)?.paymentStatus || patient.paymentStatus || "Due";
    return raw === "Pending" ? "Due" : raw;
  };
  const getBookingStatus = (patient) => getMatchingBooking(patient)?.status || "No Booking";
  const getAppointmentDate = (patient) => {
    const b = getMatchingBooking(patient);
    return b ? (b.appointmentDate || b.date || "-") : "-";
  };
  const getSlotTiming = (patient) => {
    const b = getMatchingBooking(patient);
    return b && b.startTime && b.endTime ? `${b.startTime} - ${b.endTime}` : "-";
  };
  const getBookingCreatedDate = (patient) => {
    const b = getMatchingBooking(patient);
    return b ? (b.bookedAt || b.createdAt || "-") : "-";
  };
  const getPatientActiveStatus = (patient) => {
    const b = getMatchingBooking(patient);
    return b ? (b.isActive !== undefined ? b.isActive : true) : true;
  };

  const buildBillHtml = (bd, bk) => {
    const groups = { clinic: [], lab: [], pharmacy: [] };
    (bd.items || []).forEach((it) => {
      const cat = it.category || "clinic";
      if (groups[cat]) groups[cat].push(it);
      else groups.clinic.push(it);
    });
    const categoryLabel = { clinic: "CONSULTATION", lab: "LAB", pharmacy: "PHARMACY" };
    let runningIdx = 0;
    let rowsHtml = "";
    ["clinic", "lab", "pharmacy"].forEach((catKey) => {
      const items = groups[catKey];
      if (items.length === 0) return;
      const subtotal = items.reduce((s, x) => s + (Number(x.amount) || 0), 0);
      items.forEach((item) => {
        runningIdx++;
        rowsHtml += `
          <tr>
            <td style="padding:6px 6px;font-size:11px;color:#333;border-bottom:1px solid #eee;text-align:center;">${runningIdx}</td>
            <td style="padding:6px 6px;font-size:12px;color:#111;border-bottom:1px solid #eee;">${item.name}</td>
            <td style="padding:6px 6px;font-size:12px;font-weight:600;color:#111;text-align:right;border-bottom:1px solid #eee;">₹ ${Number(item.amount).toFixed(2)}</td>
          </tr>`;
      });
      if (items.length > 1) {
        rowsHtml += `
          <tr style="background:#f9fafb;border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;">
            <td colspan="2" style="text-align:right;font-size:10px;font-weight:bold;text-transform:uppercase;letter-spacing:.5px;color:#374151;padding:7px 8px;">Subtotal — ${categoryLabel[catKey]}</td>
            <td style="text-align:right;font-size:12px;font-weight:bold;color:#111;padding:7px 8px;">₹ ${subtotal.toFixed(2)}</td>
          </tr>`;
      }
    });
    const grossTotal = (bd.breakdown?.clinic || 0) + (bd.breakdown?.lab || 0) + (bd.breakdown?.pharmacy || 0);
    rowsHtml += `
      <tr style="background:#e5e7eb;border-top:2px solid #111;border-bottom:2px solid #111;">
        <td colspan="2" style="text-align:right;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:.5px;color:#111;padding:9px 8px;">Gross Total</td>
        <td style="text-align:right;font-size:14px;font-weight:bold;color:#111;padding:9px 8px;">₹ ${grossTotal.toFixed(2)}</td>
      </tr>`;

    return `
      <!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Bill - ${bd.invoiceNo}</title>
      <style>
        *{margin:0;padding:0;box-sizing:border-box;}
        body{font-family:Arial,sans-serif;color:#222;padding:24px;background:#fff;}
        .bill-wrap{max-width:820px;margin:0 auto;border:1px solid #999;padding:24px 28px;background:#fff;overflow:hidden;position:relative;}
        .watermark{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);opacity:.06;z-index:0;width:300px;height:300px;}
        .watermark img{width:100%;height:100%;object-fit:contain;}
        .bill-content{position:relative;z-index:1;}
        .top-header{display:flex;align-items:flex-start;justify-content:space-between;border-bottom:2px solid #222;padding-bottom:14px;}
        .top-header .brand{display:flex;align-items:center;gap:14px;}
        .top-header .brand img{width:60px;height:60px;object-fit:contain;}
        .top-header .brand h1{font-size:20px;font-weight:bold;color:#111;}
        .top-header .brand p{font-size:11px;color:#555;max-width:440px;line-height:1.4;}
        .top-header .contact{text-align:right;font-size:11px;color:#555;white-space:nowrap;}
        .bar-title{text-align:center;background:#f1f1f1;border-top:1px solid #999;border-bottom:1px solid #999;padding:6px 0;font-size:13px;font-weight:bold;letter-spacing:1.5px;margin:10px 0 14px;text-transform:uppercase;}
        .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px 24px;font-size:12px;margin-bottom:16px;}
        .info-grid .label{color:#666;font-weight:bold;display:inline-block;width:120px;}
        table.items{width:100%;border-collapse:collapse;margin-bottom:16px;border-top:2px solid #222;border-bottom:2px solid #222;}
        table.items th{text-align:left;font-size:11px;color:#555;padding:8px 6px;border-bottom:1px solid #bbb;text-transform:uppercase;letter-spacing:.4px;background:#f9fafb;}
        .totals-box{width:100%;max-width:340px;margin-left:auto;font-size:12px;margin-bottom:12px;}
        .totals-box .row{display:flex;justify-content:space-between;padding:7px 10px;border-bottom:1px solid #eee;}
        .totals-box .row.paid{color:#15803d;font-weight:bold;}
        .totals-box .row.final{border-top:2px solid #222;border-bottom:none;font-weight:bold;padding-top:10px;margin-top:2px;font-size:14px;background:#f3f4f6;color:#111;}
        .amount-words{text-align:right;font-size:11px;color:#555;font-style:italic;margin-bottom:14px;padding-right:10px;}
        .footer-row{display:flex;justify-content:flex-end;gap:8px;font-size:11px;color:#555;border-top:1px solid #ddd;padding-top:12px;margin-top:10px;}
        .signature-section{display:flex;justify-content:flex-end;margin-top:8px;}
        .signature-section .sig{font-weight:bold;color:#333;border-top:1px solid #333;padding-top:4px;min-width:140px;text-align:center;}
        @media print{body{padding:0;}.bill-wrap{border:none;}}
      </style></head><body>
      <div class="bill-wrap">
        <div class="watermark"><img src="${logo}" alt="${CLINIC_INFO.name}"/></div>
        <div class="bill-content">
          <div class="top-header">
            <div class="brand"><img src="${logo}" alt="${CLINIC_INFO.name}"/><div><h1>${CLINIC_INFO.name}</h1><p>${CLINIC_INFO.address}</p></div></div>
            <div class="contact">Contact No : ${CLINIC_INFO.contact}</div>
          </div>
          <div class="bar-title">Bill Cum Receipt</div>
          <div class="info-grid">
            <div><span class="label">Name</span>: ${bk?.patientTitle || ""} ${bk?.patientName || "N/A"}</div>
            <div><span class="label">Invoice No / Date</span>: ${bd.invoiceNo} / ${bd.invoiceDate}</div>
            <div><span class="label">Age</span>: ${bk?.patientAge || "N/A"} Yrs</div>
            <div><span class="label">Gender</span>: ${bk?.patientGender || "N/A"}</div>
            <div><span class="label">Branch</span>: ${bd.branch}</div>
            <div><span class="label">Contact No</span>: ${bk?.patientPhone || "N/A"}</div>
            <div><span class="label">Doctor</span>: ${bd.doctorName}</div>
            <div><span class="label">Appt. Date</span>: ${formatDateToDDMMYYYY(bk?.date)}</div>
          </div>
          <table class="items">
            <thead><tr>
              <th style="width:8%;text-align:center;">No.</th>
              <th style="width:62%;">Service / Item</th>
              <th style="width:30%;text-align:right;">Amount</th>
            </tr></thead>
            <tbody>${rowsHtml}</tbody>
          </table>
          <div class="totals-box">
            <div class="row"><span>Gross Amount</span><span style="font-weight:bold;">₹ ${bd.grossAmount.toFixed(2)}</span></div>
            ${bd.discount > 0 ? `<div class="row"><span>Discount</span><span style="color:#dc2626;">− ₹ ${bd.discount.toFixed(2)}</span></div>` : ""}
            <div class="row" style="background:#eff6ff;font-weight:bold;"><span>Net Amount</span><span>₹ ${bd.netAmount.toFixed(2)}</span></div>
            <div class="row paid"><span>Paid Amount</span><span>₹ ${bd.paidAmount.toFixed(2)}</span></div>
            <div class="row final"><span>Balance to Pay</span><span>₹ ${bd.balanceAmount.toFixed(2)}</span></div>
          </div>
          <div class="amount-words">Amount in words: <b>${bd.amountInWords}</b></div>
          <div class="footer-row"><span>Printed Date : ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} ${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span></div>
          <div class="signature-section"><span class="sig">Authorised Signature</span></div>
        </div>
      </div>
    </body></html>`;
  };

  const saveInvoiceToBackend = async (bookingId, billHtml) => {
    if (!bookingId || !billHtml) return null;
    try {
      const res = await axios.post(`${API_BASE_URL}/appointment-slots/save-invoice`, { bookingId, html: billHtml });
      if (res?.data?.success) {
        setBookings((prev) =>
          prev.map((b) =>
            b._id === bookingId
              ? { ...b, invoiceUrl: res.data.invoiceUrl, invoiceGeneratedAt: new Date().toISOString() }
              : b
          )
        );
        return res.data.invoiceUrl;
      }
      showToast(res.data?.message || "Failed to save invoice", "error");
      return null;
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save invoice", "error");
      return null;
    }
  };

  const handleSendInvoice = async (booking) => {
    if (!booking || !booking._id) { showToast("Booking data missing", "error"); return; }
    if (!booking.invoiceUrl || booking.invoiceUrl.trim() === "") {
      showToast("Invoice not generated yet. Please generate invoice first.", "error"); return;
    }
    setInvoiceSending(booking._id);
    try {
      const res = await axios.post(`${API_BASE_URL}/appointment-slots/send-invoice`, { bookingId: booking._id });
      if (res?.data?.success) {
        showToast(`✅ Invoice sent to ${booking.patientName || "patient"} on WhatsApp!`, "success");
      } else { showToast(res.data?.message || "Failed to send invoice", "error"); }
    } catch (err) {
      console.error("Send invoice error:", err);
      showToast(err.response?.data?.message || err.message || "Failed to send invoice", "error");
    } finally { setInvoiceSending(null); }
  };

  const openBillingModal = async (booking) => {
    if (!booking) return;
    if (booking.invoiceUrl && booking.invoiceUrl.trim() !== "") {
      const base = API_BASE_INVURL.replace(/\/$/, "");
      const fullUrl = booking.invoiceUrl.startsWith("http")
        ? booking.invoiceUrl
        : `${base}${booking.invoiceUrl.startsWith("/") ? "" : "/"}${booking.invoiceUrl}`;
      setInvoiceModalUrl(fullUrl);
      setInvoiceModalBooking(booking);
      setShowInvoiceModal(true);
      return;
    }

    setInvoiceLoading(booking._id);
    const normalizedItems = getBookingServices(booking);
    const items = [];

    normalizedItems.forEach((s, idx) => {
      const cat = classifyService(s);
      const finalCat = s.isReviewService ? "clinic" : cat;
      const rawPS = booking.paymentStatus || "Due";
      const normalizedPS = rawPS === "Pending" ? "Due" : rawPS;
      items.push({
        no: items.length + 1, name: s.name,
        serviceCode: s.serviceId ? String(s.serviceId).slice(-6).toUpperCase() : `SVC-${String(idx + 1).padStart(2, "0")}`,
        remarks: s.isReviewService ? "Review Service" : finalCat === "lab" ? "Lab Test" : finalCat === "pharmacy" ? "Pharmacy" : "Consultation",
        category: finalCat, amount: Number(s.price) || 0,
        paymentStatus: normalizedPS,
        isReviewService: s.isReviewService || false,
      });
    });

    if (Array.isArray(booking.labItems)) {
      booking.labItems.forEach((item) => {
        items.push({
          no: items.length + 1, name: item.name || "Lab Test",
          serviceCode: item.serviceId ? String(item.serviceId).slice(-6).toUpperCase() : "LAB",
          remarks: "Lab Test",
          category: "lab", amount: Number(item.price) || 0,
          paymentStatus: booking.paymentStatus || "Due",
          isReviewService: false,
        });
      });
    }
    if (Array.isArray(booking.medicineItems)) {
      booking.medicineItems.forEach((item) => {
        items.push({
          no: items.length + 1, name: item.name || "Medicine",
          serviceCode: item.serviceId ? String(item.serviceId).slice(-6).toUpperCase() : "PHM",
          remarks: "Pharmacy",
          category: "pharmacy", amount: Number(item.price) || 0,
          paymentStatus: booking.paymentStatus || "Due",
          isReviewService: false,
        });
      });
    }

    if (items.length === 0) {
      const fallback = Number(booking.finalPayable) || Number(booking.finalPayableAmount) || Number(booking.grandTotal) || Number(booking.totalAmount) || 0;
      if (fallback > 0) {
        const rawPS = booking.paymentStatus || "Due";
        const normalizedPS = rawPS === "Pending" ? "Due" : rawPS;
        items.push({
          no: 1, name: "Consultation Fee", serviceCode: "CONS", remarks: "Consultation",
          category: "clinic", amount: fallback,
          paymentStatus: normalizedPS, isReviewService: false,
        });
      }
    }

    const finalBreakdown = { clinic: 0, lab: 0, pharmacy: 0 };
    items.forEach((it) => {
      if (it.category === "lab") finalBreakdown.lab += it.amount;
      else if (it.category === "pharmacy") finalBreakdown.pharmacy += it.amount;
      else finalBreakdown.clinic += it.amount;
    });

    const grossAmount = items.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
    const commissionPercent = parseFloat(booking.referralCommission) || 0;
    const commissionAmount = Number(booking.commissionAmount) || (grossAmount * commissionPercent) / 100;
    const discountAmount = Number(booking.discount) || 0;
    const netAmount = Number(booking.finalPayable) || Number(booking.finalPayableAmount) || Number(booking.grandTotal) || grossAmount - commissionAmount - discountAmount;

    const isPaid = booking.paymentStatus === "Paid";
    const isPartial = booking.paymentStatus === "Partial";
    const paidAmount = isPaid ? netAmount : isPartial ? Number(booking.amountPaid) || 0 : 0;
    const balanceAmount = Math.max(0, netAmount - paidAmount);

    const now = new Date();
    const dateStamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    const shortId = String(booking._id || "").slice(-6).toUpperCase() || "000000";
    const invoiceNo = `${dateStamp}-${shortId}`;
    const dateTimeLabel = `${now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} ${now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;

    const rawPS2 = booking.paymentStatus || "Due";
    const normalizedPS2 = rawPS2 === "Pending" ? "Due" : rawPS2;

    const newBillingData = {
      invoiceNo, invoiceDate: dateTimeLabel,
      receiptNo: `R-${shortId.slice(-4)}`, receiptDate: dateTimeLabel,
      paymentMode: booking.paymentType ? booking.paymentType.charAt(0).toUpperCase() + booking.paymentType.slice(1) : "Cash",
      receivedBy: "Front Desk",
      branch: booking.doctorSpecialization || "Main Branch",
      doctorName: booking.doctorName || "General OP Doctor",
      items,
      breakdown: {
        clinic: Math.round(finalBreakdown.clinic || 0),
        lab: Math.round(finalBreakdown.lab || 0),
        pharmacy: Math.round(finalBreakdown.pharmacy || 0),
      },
      grossAmount, discount: discountAmount, netAmount, paidAmount, balanceAmount,
      paymentStatus: normalizedPS2,
      amountInWords: numberToWords(netAmount),
    };

    const html = buildBillHtml(newBillingData, booking);
    const savedUrl = await saveInvoiceToBackend(booking._id, html);
    setInvoiceLoading(null);

    if (savedUrl) {
      const base = API_BASE_INVURL.replace(/\/$/, "");
      const fullUrl = savedUrl.startsWith("http") ? savedUrl : `${base}${savedUrl.startsWith("/") ? "" : "/"}${savedUrl}`;
      setInvoiceModalUrl(fullUrl);
      setInvoiceModalBooking(booking);
      setShowInvoiceModal(true);
      showToast(`✅ Invoice generated!`, "success");
    } else { showToast("Invoice generation failed", "error"); }
  };

  const handleFromDateChange = (e) => { setFromDate(e.target.value); if (e.target.value) setSelectedMonth(""); };
  const handleToDateChange = (e) => { setToDate(e.target.value); if (e.target.value) setSelectedMonth(""); };
  const handleMonthChange = (e) => { setSelectedMonth(e.target.value); setFromDate(""); setToDate(""); setTimeFilter("All"); };

  const handleApptFromChange = (e) => {
    setApptFromDate(e.target.value);
    if (e.target.value) { setSelectedMonth(""); setTimeFilter("All"); }
  };
  const handleApptToChange = (e) => {
    setApptToDate(e.target.value);
    if (e.target.value) { setSelectedMonth(""); setTimeFilter("All"); }
  };
  const handleTimeFilterChange = (value) => {
    setTimeFilter(value);
    if (value !== "All") {
      setApptFromDate("");
      setApptToDate("");
      setSelectedMonth("");
    }
  };

  const clearFilters = () => {
    setSearchQuery(""); setStatusFilter("All"); setFeeTypeFilter("All"); setDoctorFilter("All");
    setBookingTypeFilter("All");
    setFromDate(""); setToDate(""); setSelectedMonth("");
    setApptFromDate(""); setApptToDate("");
    setTimeFilter("All");
    setRevenueCategoryFilter("All"); setPaymentTypeFilter("All");
    setReferredByFilter("All");
    setActiveCardFilter("all"); setCurrentPage(1);
    setActiveFilter("all");
    setShowRegDatePopup(false); setShowApptDatePopup(false);
    if (window.innerWidth < 1024) setShowMobileFilters(false);
  };

  const handleCardClick = (type) => {
    setActiveCardFilter(type); setCurrentPage(1);
    if (type === "all") { setStatusFilter("All"); setActiveFilter("all"); }
    else if (type === "active") { setActiveFilter("active"); setStatusFilter("All"); }
    else if (type === "inactive") { setActiveFilter("inactive"); handleRoleBasedNavigate("/inactive-patients"); }
    else { setStatusFilter(type); setActiveFilter("all"); }
  };

  const getUniqueDoctors = () => {
    const map = new Map();
    bookings.forEach((b) => { if (b.doctorName) map.set(b.doctorName, { name: b.doctorName, specialization: b.doctorSpecialization || "" }); });
    return Array.from(map.values());
  };

  const getUniqueReferrers = () => {
    const customers = new Set();
    const doctors = new Set();
    bookings.forEach((b) => {
      if (b.referredByCustomer) customers.add(b.referredByCustomer);
      if (b.referredByDoctor) doctors.add(b.referredByDoctor);
    });
    return {
      customers: Array.from(customers).sort(),
      doctors: Array.from(doctors).sort(),
    };
  };

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const isActive = getPatientActiveStatus(p);
      if (activeFilter === "active" && !isActive) return false;
      if (activeFilter === "inactive" && isActive) return false;

      if (feeTypeFilter !== "All") {
        const hasMatchingService = (p.serviceItems || []).some(
          (s) => s.name && s.name.toLowerCase().includes(feeTypeFilter.toLowerCase())
        );
        if (!hasMatchingService) return false;
      }

      if (referredByFilter !== "All") {
        const b = getMatchingBooking(p);
        if (referredByFilter.startsWith("customer::")) {
          const name = referredByFilter.replace("customer::", "");
          if ((b?.referredByCustomer || "") !== name) return false;
        } else if (referredByFilter.startsWith("doctor::")) {
          const name = referredByFilter.replace("doctor::", "");
          if ((b?.referredByDoctor || "") !== name) return false;
        }
      }

      return true;
    });
  }, [patients, activeFilter, feeTypeFilter, referredByFilter, bookings]);

  useEffect(() => { setCurrentPage(1); }, [
    searchQuery, statusFilter, feeTypeFilter, doctorFilter, bookingTypeFilter,
    fromDate, toDate, selectedMonth, apptFromDate, apptToDate, activeFilter,
    revenueCategoryFilter, paymentTypeFilter, timeFilter, referredByFilter
  ]);

  const stats = useMemo(() => {
    if (backendStats) {
      return {
        total: backendStats.totalPatients || 0,
        active: backendStats.active || 0,
        inactive: backendStats.inactive || 0,
        paid: backendStats.paid || 0,
        partial: backendStats.partial || 0,
        due: backendStats.due || 0,
        pending: 0,
        totalRevenue: backendStats.totalRevenue || 0,
      };
    }
    return { total: 0, active: 0, inactive: 0, paid: 0, partial: 0, due: 0, pending: 0, totalRevenue: 0 };
  }, [backendStats]);

  const categoryRevenue = useMemo(() => {
    const cb = categoryBreakdown || {};
    const clinic = cb.clinic || {};
    const lab = cb.lab || {};
    const pharmacy = cb.pharmacy || {};
    return {
      clinic: {
        total: Number(clinic.total) || 0,
        cash: Number(clinic.cash) || 0,
        online: Number(clinic.online) || 0,
        card: Number(clinic.card) || 0,
        insurance: Number(clinic.insurance) || 0,
        due: Number(clinic.due) || 0,
        footFall: Number(clinic.footFall) || 0,
      },
      lab: {
        total: Number(lab.total) || 0,
        cash: Number(lab.cash) || 0,
        online: Number(lab.online) || 0,
        card: Number(lab.card) || 0,
        insurance: Number(lab.insurance) || 0,
        due: Number(lab.due) || 0,
        footFall: Number(lab.footFall) || 0,
      },
      pharmacy: {
        total: Number(pharmacy.total) || 0,
        cash: Number(pharmacy.cash) || 0,
        online: Number(pharmacy.online) || 0,
        card: Number(pharmacy.card) || 0,
        insurance: Number(pharmacy.insurance) || 0,
        due: Number(pharmacy.due) || 0,
        footFall: Number(pharmacy.footFall) || 0,
      },
      grandTotal:
        (Number(clinic.total) || 0) +
        (Number(lab.total) || 0) +
        (Number(pharmacy.total) || 0),
      grandFootFall:
        (Number(clinic.footFall) || 0) +
        (Number(lab.footFall) || 0) +
        (Number(pharmacy.footFall) || 0),
    };
  }, [categoryBreakdown]);

  const formatTime = (dateStr) => !dateStr ? "" : new Date(dateStr).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstItem, indexOfLastItem);

  const handleItemsPerPageChange = (e) => {
    const v = Number(e.target.value);
    setItemsPerPage(v);
    localStorage.setItem("opMgmt_itemsPerPage", String(v));
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

  const getPatientServices = (patient) => {
    const list = bookings.filter((b) =>
      b.patientPhone === patient.phone ||
      (b.patientName && patient.name && b.patientName.toLowerCase() === patient.name.toLowerCase()));
    const all = [];
    list.forEach((b) => getBookingServices(b).forEach((s) => all.push({
      name: s.name, price: s.price, bookingDate: b.date || b.appointmentDate,
      serviceId: s.serviceId, bookingId: b._id
    })));
    return all;
  };

  const downloadCSV = () => {
    if (!filteredPatients.length) { alert("No patient records available to export!"); return; }
    const headers = ["#", "Patient Name", "Phone", "Address", "City", "Pincode", "Doctor", "Booking Type", "Appointment Date & Time", "Booking Status", "Active Status", "Services", "Clinic Amount", "Lab Amount", "Pharmacy Amount", "Medicine Total", "Discount", "Offer Applied", "Offer Amount", "Total Fee", "Paid Amount", "Balance Amount", "Payment Status", "Payment Mode", "Reason", "Referred By Customer", "Referred By Doctor", "Created At", "Registered", "Review Status", "Reviewed On"];
    const csvRows = [headers.join(","), ...filteredPatients.map((p, idx) => {
      const booking = getMatchingBooking(p);
      const paidInfo = getBookingPaidInfo(booking);
      const breakdown = getAmountBreakdown(booking);
      const services = getPatientServices(p);
      const slotTiming = getSlotTiming(p);
      const isActive = getPatientActiveStatus(p);
      const reviewStatus = booking?.isReviewed ? "Reviewed" : (getReviewWindowStatus(booking).expired ? "Expired" : "Pending");
      const reviewedOn = booking?.reviewDate ? formatDateTimeToDDMMYYYY(booking.reviewDate) : "-";
      const bookingType = getBookingType(booking).label;
      const offerName = booking?.offerApplied?.offerName || "";
      const offerAmount = booking?.offerApplied?.offerAmount || 0;
      const totalFee = paidInfo.final;
      const regDate = p.createdAt ? formatDateToDDMMYYYY(p.createdAt) : "-";
      const regTime = p.createdAt ? formatTime(p.createdAt) : "-";
      return [
        idx + 1,
        `"${(p.title || "")} ${(p.name || "").replace(/"/g, '""')}"`,
        `"${p.phone || ""}"`,
        `"${(p.address || "").replace(/"/g, '""')}"`,
        `"${(p.city || "").replace(/"/g, '""')}"`,
        `"${p.pincode || ""}"`,
        `"${booking?.doctorName || "N/A"}"`,
        `"${bookingType}"`,
        `"${formatDateToDDMMYYYY(getAppointmentDate(p))} ${slotTiming !== "-" ? slotTiming : ""}"`,
        `"${getBookingStatus(p)}"`,
        `"${isActive ? "Active" : "Inactive"}"`,
        `"${services.map((s) => s.name).join("; ")}"`,
        breakdown.clinic, breakdown.lab, breakdown.pharmacy,
        booking?.medicineTotal || 0,
        booking?.discount || 0,
        `"${offerName}"`, offerAmount,
        totalFee, paidInfo.paid, paidInfo.balance,
        `"${getConsultationPaymentStatus(p)}"`,
        `"${p.paymentType || "cash"}"`,
        `"${(p.reason || "").replace(/"/g, '""')}"`,
        `"${(p.referredByCustomer || "").replace(/"/g, '""')}"`,
        `"${(p.referredByDoctor || "").replace(/"/g, '""')}"`,
        `"${formatDateTimeToDDMMYYYY(getBookingCreatedDate(p))}"`,
        `${regDate} ${regTime}`,
        `"${reviewStatus}"`,
        `"${reviewedOn}"`
      ].join(",");
    })];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `OP_Patient_Records_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filteredPatients.length} patient records to CSV!`);
  };

  const isEditMode = Boolean(editingId);

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

        {/* Mobile Welcome Popup */}
        {showMobileWelcome && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 lg:hidden">
            <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <FaUserInjured className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Welcome to OP Management</h3>
                    <p className="text-xs text-blue-100">What would you like to do?</p>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <button onClick={() => handleMobileWelcomeChoice("register")} className="w-full flex items-center gap-3 px-4 py-3.5 bg-emerald-50 border-2 border-emerald-200 rounded-xl hover:bg-emerald-100 hover:border-emerald-400 transition-all text-left group">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                    <FaPlus className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-emerald-800 text-sm">New OP Register</div>
                    <div className="text-[11px] text-emerald-600">Register a new patient & book slot</div>
                  </div>
                  <FiChevronDown className="w-4 h-4 text-emerald-400 -rotate-90" />
                </button>
                <button onClick={() => handleMobileWelcomeChoice("manage")} className="w-full flex items-center gap-3 px-4 py-3.5 bg-blue-50 border-2 border-blue-200 rounded-xl hover:bg-blue-100 hover:border-blue-400 transition-all text-left group">
                  <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                    <FiUsers className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-blue-800 text-sm">Manage OP</div>
                    <div className="text-[11px] text-blue-600">View & manage all patient records</div>
                  </div>
                  <FiChevronDown className="w-4 h-4 text-blue-400 -rotate-90" />
                </button>
              </div>
              <div className="px-5 pb-5">
                <p className="text-[10px] text-gray-400 text-center">You can always access these options from the main screen.</p>
              </div>
            </div>
          </div>
        )}

        {/* ROW 1 */}
        <div className="hidden lg:grid grid-cols-3 items-center gap-2 mb-3">
          <div className="flex items-center">
            <h1 className="emp-dash__greeting text-lg font-bold whitespace-nowrap">OP <span>Management</span></h1>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="relative flex-shrink-0">
              <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-[140px] pl-8 pr-2 py-2 text-xs border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
            </div>
            <div className="flex items-center gap-0.5 bg-gray-100 p-1 rounded-lg border border-gray-200">
              {TIME_FILTER_OPTIONS.map((opt) => (
                <button key={opt.value} onClick={() => handleTimeFilterChange(opt.value)} className={`px-2.5 py-1.5 text-[11px] font-bold rounded-md transition-all whitespace-nowrap ${timeFilter === opt.value ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:bg-white hover:text-gray-900"}`} title={opt.label}>{opt.label}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1.5 justify-end">
            <button onClick={handleAddNewPatient} className="flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm whitespace-nowrap"><FiPlus className="w-3.5 h-3.5" /> Add Patient</button>
            <button onClick={downloadCSV} className="flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 shadow-sm whitespace-nowrap"><FiDownload className="w-3.5 h-3.5" /> Export CSV</button>
            <button onClick={() => handleRoleBasedNavigate("/inactive-patients")} className="flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm whitespace-nowrap"><FiClock className="w-3.5 h-3.5 text-amber-600" /> Inactive Patients</button>
          </div>
        </div>

        {/* ROW 2 - Filters */}
        {showRevenueBreakdown && (
          <div className="hidden lg:flex items-center gap-1.5 flex-nowrap mb-3">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 px-2 text-xs border border-gray-300 bg-white rounded-lg flex-shrink-0">
              <option value="All">All Payment</option>
              <option value="Partial">Partial</option>
              <option value="Paid">Paid</option>
              <option value="Due">Due</option>
            </select>
            <select value={bookingTypeFilter} onChange={(e) => setBookingTypeFilter(e.target.value)} className="h-9 px-2 text-xs border border-gray-300 bg-white rounded-lg flex-shrink-0">
              {BOOKING_TYPE_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
            </select>
            <select value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)} className="h-9 px-2 text-xs border border-gray-300 bg-white rounded-lg max-w-[110px] truncate flex-shrink-0">
              <option value="All">All Doctors</option>
              {getUniqueDoctors().map((doc) => (<option key={doc.name} value={doc.name}>{doc.name}</option>))}
            </select>
            <select value={revenueCategoryFilter} onChange={(e) => setRevenueCategoryFilter(e.target.value)} className="h-9 px-2 text-xs border border-gray-300 bg-white rounded-lg flex-shrink-0">
              {REVENUE_CATEGORY_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
            </select>
            <select value={paymentTypeFilter} onChange={(e) => setPaymentTypeFilter(e.target.value)} className="h-9 px-2 text-xs border border-gray-300 bg-white rounded-lg flex-shrink-0">
              {PAYMENT_TYPE_FILTER_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
            </select>
            <select value={referredByFilter} onChange={(e) => setReferredByFilter(e.target.value)} className={`h-9 px-2 text-xs border rounded-lg max-w-[140px] truncate flex-shrink-0 ${referredByFilter !== "All" ? "border-indigo-500 text-indigo-700 bg-indigo-50" : "border-gray-300 bg-white"}`} title="Filter by Referred By">
              <option value="All">All Referrers</option>
              {getUniqueReferrers().customers.length > 0 && (
                <optgroup label="Customers">
                  {getUniqueReferrers().customers.map((c) => (<option key={`c-${c}`} value={`customer::${c}`}>{c}</option>))}
                </optgroup>
              )}
              {getUniqueReferrers().doctors.length > 0 && (
                <optgroup label="Doctors">
                  {getUniqueReferrers().doctors.map((d) => (<option key={`d-${d}`} value={`doctor::${d}`}>{d}</option>))}
                </optgroup>
              )}
            </select>

            <div className="relative flex-shrink-0">
              <button data-btn="reg" onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const popupWidth = 340;
                const left = Math.min(rect.left, window.innerWidth - popupWidth - 20);
                setRegPopupPos({ top: rect.bottom + 6, left });
                setShowRegDatePopup(!showRegDatePopup);
                setShowApptDatePopup(false);
              }} className={`flex items-center gap-1.5 h-9 px-2.5 text-xs font-semibold rounded-lg border transition-all whitespace-nowrap ${(fromDate || toDate) ? "border-blue-500 text-blue-700 bg-blue-50 ring-2 ring-blue-500/10" : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"}`}>
                <FaCalendarAlt className="w-3 h-3" />
                <span>
                  {!fromDate && !toDate ? "Reg Date" : fromDate && toDate ? `${fromDate.slice(8, 10)}/${fromDate.slice(5, 7)} – ${toDate.slice(8, 10)}/${toDate.slice(5, 7)}` : fromDate ? `From ${fromDate.slice(8, 10)}/${fromDate.slice(5, 7)}` : `To ${toDate.slice(8, 10)}/${toDate.slice(5, 7)}`}
                </span>
                {(fromDate || toDate) && (<span onClick={(e) => { e.stopPropagation(); setFromDate(""); setToDate(""); }} className="ml-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center hover:bg-red-600 cursor-pointer">✕</span>)}
              </button>
              <DateRangePopup isOpen={showRegDatePopup} position={regPopupPos} fromDate={fromDate} toDate={toDate} onFromChange={setFromDate} onToChange={setToDate} onClear={() => { setFromDate(""); setToDate(""); }} onClose={() => setShowRegDatePopup(false)} dataAttr="reg" />
            </div>

            <div className="relative flex-shrink-0">
              <button data-btn="appt" onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const popupWidth = 340;
                const left = Math.min(rect.left, window.innerWidth - popupWidth - 20);
                setApptPopupPos({ top: rect.bottom + 6, left });
                setShowApptDatePopup(!showApptDatePopup);
                setShowRegDatePopup(false);
              }} className={`flex items-center gap-1.5 h-9 px-2.5 text-xs font-semibold rounded-lg border transition-all whitespace-nowrap ${(apptFromDate || apptToDate) ? "border-blue-500 text-blue-700 bg-blue-50 ring-2 ring-blue-500/10" : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"}`}>
                <FaCalendarAlt className="w-3 h-3" />
                <span>
                  {!apptFromDate && !apptToDate ? "Appt Date" : apptFromDate && apptToDate ? `${apptFromDate.slice(8, 10)}/${apptFromDate.slice(5, 7)} – ${apptToDate.slice(8, 10)}/${apptToDate.slice(5, 7)}` : apptFromDate ? `From ${apptFromDate.slice(8, 10)}/${apptFromDate.slice(5, 7)}` : `To ${apptToDate.slice(8, 10)}/${apptToDate.slice(5, 7)}`}
                </span>
                {(apptFromDate || apptToDate) && (<span onClick={(e) => { e.stopPropagation(); setApptFromDate(""); setApptToDate(""); }} className="ml-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center hover:bg-red-600 cursor-pointer">✕</span>)}
              </button>
              <DateRangePopup isOpen={showApptDatePopup} position={apptPopupPos} fromDate={apptFromDate} toDate={apptToDate} onFromChange={setApptFromDate} onToChange={setApptToDate} onClear={() => { setApptFromDate(""); setApptToDate(""); }} onClose={() => setShowApptDatePopup(false)} dataAttr="appt" />
            </div>

            <input type="month" value={selectedMonth} onChange={handleMonthChange} className="h-9 px-2 text-xs border border-gray-300 bg-white rounded-lg flex-shrink-0 w-[110px]" title="Appointment month" />

            {timeFilter !== "All" && revenueCategoryFilter !== "All" && calculationData && (
              <button onClick={() => { setUserClosedCalcPopup(false); setShowCalculationPopup(true); }} className="flex items-center gap-1 h-9 px-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex-shrink-0" title="Show Calculation">
                <FaCalculator className="w-3.5 h-3.5" /> Calc
              </button>
            )}

            {hasActiveFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 h-9 px-2.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex-shrink-0">
                <FiTrash2 className="w-3 h-3 text-red-500" /> Clear
              </button>
            )}
          </div>
        )}

        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between gap-2 flex-wrap mb-3">
          <div className="flex items-baseline gap-2">
            <h1 className="text-base font-bold whitespace-nowrap">OP <span className="text-indigo-600">Management</span></h1>
            <div className="emp-dash__date-pill text-[10px] px-2 py-1"><FaUserInjured className="w-3 h-3 text-blue-600" /><span>{patients.length} Patients</span></div>
          </div>
          <div className="flex items-center gap-1 flex-wrap justify-end">
            <button onClick={handleAddNewPatient} className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-white bg-blue-600 rounded-lg"><FiPlus className="w-3 h-3" /> Add</button>
            <button onClick={() => handleRoleBasedNavigate("/inactive-patients")} className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg"><FiClock className="w-3 h-3 text-amber-600" /> Inactive</button>
            <button onClick={() => setShowMobileFilters(!showMobileFilters)} className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg"><FiFilter className="w-3 h-3" /> Filters</button>
          </div>
        </div>

        <div className="lg:hidden mb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {TIME_FILTER_OPTIONS.map((opt) => (
              <button key={opt.value} onClick={() => handleTimeFilterChange(opt.value)} className={`px-4 py-2.5 text-xs font-bold rounded-lg border transition-all whitespace-nowrap flex-shrink-0 ${timeFilter === opt.value ? "bg-blue-600 text-white border-blue-600 shadow-sm" : "bg-white text-gray-600 border-gray-300"}`}>{opt.label}</button>
            ))}
          </div>
          {timeFilter !== "All" && revenueCategoryFilter !== "All" && calculationData && (
            <button onClick={() => { setUserClosedCalcPopup(false); setShowCalculationPopup(true); }} className="mt-2 flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"><FaCalculator className="w-3 h-3" /> Show Calculation</button>
          )}
        </div>

        {/* Mobile Filters */}
        <div className="lg:hidden">
          {showMobileFilters && showRevenueBreakdown && (
            <div className="mb-4 p-4 bg-white rounded-xl border border-gray-200 space-y-3">
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Search</label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg">
                  <option value="All">All Status</option><option value="Partial">Partial</option><option value="Paid">Paid</option><option value="Due">Due</option>
                </select>
                <select value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg">
                  <option value="All">All Doctors</option>
                  {getUniqueDoctors().map((doc) => <option key={doc.name} value={doc.name}>{doc.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Booking Type</label>
                <select value={bookingTypeFilter} onChange={(e) => setBookingTypeFilter(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg">
                  {BOOKING_TYPE_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select value={revenueCategoryFilter} onChange={(e) => setRevenueCategoryFilter(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg">
                  {REVENUE_CATEGORY_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                </select>
                <select value={paymentTypeFilter} onChange={(e) => setPaymentTypeFilter(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg">
                  {PAYMENT_TYPE_FILTER_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Referred By</label>
                <select value={referredByFilter} onChange={(e) => setReferredByFilter(e.target.value)} className={`w-full px-3 py-2.5 text-sm border rounded-lg ${referredByFilter !== "All" ? "border-indigo-500 text-indigo-700 bg-indigo-50" : "border-gray-300"}`}>
                  <option value="All">All Referrers</option>
                  {getUniqueReferrers().customers.length > 0 && (<optgroup label="Customers">{getUniqueReferrers().customers.map((c) => (<option key={`c-${c}`} value={`customer::${c}`}>{c}</option>))}</optgroup>)}
                  {getUniqueReferrers().doctors.length > 0 && (<optgroup label="Doctors">{getUniqueReferrers().doctors.map((d) => (<option key={`d-${d}`} value={`doctor::${d}`}>{d}</option>))}</optgroup>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Registered Date</label>
                <div className="grid grid-cols-2 gap-2">
                  <input type="date" value={fromDate} onChange={handleFromDateChange} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg" />
                  <input type="date" value={toDate} onChange={handleToDateChange} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Appointment Date</label>
                <div className="grid grid-cols-2 gap-2">
                  <input type="date" value={apptFromDate} onChange={handleApptFromChange} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg" />
                  <input type="date" value={apptToDate} onChange={handleApptToChange} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 h-9 px-2 border border-gray-300 bg-white rounded-lg flex-shrink-0">
                <FaCalendarAlt className="w-3 h-3 text-gray-500" />
                <span className="text-[10px] font-bold text-gray-500 uppercase whitespace-nowrap">Month Wise:</span>
                <input type="month" value={selectedMonth} onChange={handleMonthChange} className="text-[11px] border-0 bg-transparent text-gray-900 focus:outline-none w-[110px]" title="Filter by appointment month" />
              </div>
              <div className="pt-3 border-t border-gray-200 flex gap-2">
                <button onClick={handleAddNewPatient} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg"><FiPlus className="w-4 h-4" /> Add Patient</button>
                <button onClick={downloadCSV} disabled={!filteredPatients.length} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg disabled:opacity-50"><FiDownload className="w-4 h-4" /> Export</button>
              </div>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg"><FiTrash2 className="w-4 h-4 text-red-500" /> Clear All Filters</button>
              )}
            </div>
          )}
        </div>

        {/* Revenue Breakdown */}
        <div className="mb-6 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <FaMoneyBillWave className="text-indigo-600 w-5 h-5" />
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Revenue Breakdown</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-700 bg-white px-3 py-1 rounded-full border border-indigo-200">{filteredPatients.length} patients</span>
              {timeFilter !== "All" && revenueCategoryFilter !== "All" && calculationData && (
                <button onClick={() => { setUserClosedCalcPopup(false); setShowCalculationPopup(true); }} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-white border border-indigo-300 rounded-lg hover:bg-indigo-50 shadow-sm transition-colors"><FaCalculator className="w-3.5 h-3.5" /> Calculation</button>
              )}
              <button onClick={() => setShowRevenueBreakdown(!showRevenueBreakdown)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-white border border-indigo-300 rounded-lg hover:bg-indigo-50 shadow-sm transition-colors">
                {showRevenueBreakdown ? <FiChevronUp className="w-3.5 h-3.5" /> : <FiChevronDown className="w-3.5 h-3.5" />}
                {showRevenueBreakdown ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {showRevenueBreakdown && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3">
              <div className="rounded-lg p-4 border border-blue-200 bg-blue-50 min-h-[115px] flex flex-col justify-between">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 uppercase"><FaClinicMedical className="text-xs" /> Clinic Revenue</div>
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

              <div className="rounded-lg p-4 border border-purple-200 bg-purple-50 min-h-[115px] flex flex-col justify-between">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700 uppercase"><FaFlask className="text-xs" /> Lab Revenue</div>
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

              <div className="rounded-lg p-4 border border-green-200 bg-green-50 min-h-[115px] flex flex-col justify-between">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-green-700 uppercase"><FaPills className="text-xs" /> Pharmacy Revenue</div>
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

              <div className="rounded-lg p-4 border border-slate-300 bg-slate-50 min-h-[115px] flex flex-col justify-between">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase"><FaRupeeSign className="text-xs" /> Total Collected</div>
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

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
          <div className={`emp-dash__stat cursor-pointer hover:scale-105 ${activeCardFilter === "all" ? "ring-2 ring-blue-500/20 border-blue-400" : ""}`} onClick={() => handleCardClick("all")}>
            <div className="emp-dash__stat-top"><span className="emp-dash__stat-label">Total Clinic Patients</span><div className="emp-dash__stat-icon emp-dash__stat-icon--rate"><FiUsers /></div></div>
            <div className="emp-dash__stat-value">{stats.total}</div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0 text-[10px] font-bold leading-tight">
              <span className="text-emerald-600 whitespace-nowrap">Active: {stats.active}</span>
              <span className="text-red-500 whitespace-nowrap">Inactive: {stats.inactive}</span>
            </div>
          </div>
          <div className={`emp-dash__stat cursor-pointer hover:scale-105 ${activeCardFilter === "Paid" ? "ring-2 ring-emerald-500/20 border-emerald-400" : ""}`} onClick={() => handleCardClick("Paid")}>
            <div className="emp-dash__stat-top"><span className="emp-dash__stat-label">Paid</span><div className="emp-dash__stat-icon emp-dash__stat-icon--present"><FiUserCheck /></div></div>
            <div className="emp-dash__stat-value text-emerald-600">{stats.paid}</div><div className="emp-dash__stat-meta">completed payments</div>
          </div>
          <div className={`emp-dash__stat cursor-pointer hover:scale-105 ${activeCardFilter === "Partial" ? "ring-2 ring-amber-500/20 border-amber-400" : ""}`} onClick={() => handleCardClick("Partial")}>
            <div className="emp-dash__stat-top"><span className="emp-dash__stat-label">Partial</span><div className="emp-dash__stat-icon emp-dash__stat-icon--rate"><FaClock /></div></div>
            <div className="emp-dash__stat-value text-amber-600">{stats.partial}</div><div className="emp-dash__stat-meta">partially paid</div>
          </div>
          <div className={`emp-dash__stat cursor-pointer hover:scale-105 ${activeCardFilter === "Due" ? "ring-2 ring-red-500/20 border-red-400" : ""}`} onClick={() => handleCardClick("Due")}>
            <div className="emp-dash__stat-top"><span className="emp-dash__stat-label">Due</span><div className="emp-dash__stat-icon emp-dash__stat-icon--late"><FiXCircle /></div></div>
            <div className="emp-dash__stat-value text-red-500">{stats.due}</div><div className="emp-dash__stat-meta">overdue payments</div>
          </div>
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Collected</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present"><FaRupeeSign /></div>
            </div>
            <div className="emp-dash__stat-value text-blue-700">{fmt(categoryRevenue.grandTotal)}</div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0 text-[9px] font-bold leading-tight">
              <span className="text-blue-700 whitespace-nowrap">Clinic: {fmt(categoryRevenue.clinic.total)}</span>
              <span className="text-purple-700 whitespace-nowrap">Lab: {fmt(categoryRevenue.lab.total)}</span>
              <span className="text-green-700 whitespace-nowrap">Pharmacy: {fmt(categoryRevenue.pharmacy.total)}</span>
            </div>
          </div>
        </div>

        {/* ADD/EDIT MODAL */}
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
            <button onClick={cancelForm} className="absolute top-4 right-4 sm:top-6 sm:right-24 z-[60] w-10 h-10 rounded-full bg-white text-gray-700 hover:bg-red-500 hover:text-white shadow-2xl border-2 border-gray-200 hover:border-red-500 flex items-center justify-center transition-all" title="Close">
              <FaTimes className="w-5 h-5" />
            </button>
            <div className="bg-white rounded-2xl w-full max-w-[1200px] p-4 sm:p-6 md:p-8 shadow-2xl border border-gray-200 relative max-h-[96vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0"><FaUserInjured className="w-4 h-4 sm:w-5 sm:h-5" /></div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate">{isEditMode ? "Edit Patient Details" : "Register OPD Patient & Book Slot"}</h3>
                    <p className="text-[11px] sm:text-xs text-gray-500 truncate">{isEditMode ? "Patient info editable — amount/lab/medicine locked" : "Fill in patient and consultation details below"}</p>
                  </div>
                </div>
              </div>

              {showExistingPatientPopup && existingPatient && !editingId && (
                <div className="mt-4 p-3.5 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <FiAlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-blue-900">Existing Patient Record Found!</p>
                      <div className="mt-1 text-xs text-blue-800 space-y-0.5">
                        <p><span className="font-semibold">Name:</span> {existingPatient.title} {existingPatient.name} | <span className="font-semibold">Phone:</span> {existingPatient.phone}</p>
                        <p><span className="font-semibold">Age:</span> {existingPatient.age} yrs | <span className="font-semibold">Gender:</span> {existingPatient.gender}</p>
                      </div>
                      <button type="button" onClick={autoFillPatientDetails} className="mt-2 px-3.5 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg inline-flex items-center gap-1.5"><FaCheck className="text-[10px]" /> Auto-Fill Details</button>
                    </div>
                    <button type="button" onClick={() => setShowExistingPatientPopup(false)} className="text-gray-400 hover:text-gray-600"><FaTimes className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              )}

              <form onSubmit={isEditMode ? handleUpdateNow : handleBookNow} className="mt-4 sm:mt-5 space-y-4" noValidate>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                    <FaPhoneAlt className="text-blue-600" /> Phone Number
                  </label>
                  <div className="relative">
                    <FaPhoneAlt className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input ref={phoneInputRef} type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+91 9876543210" className="w-full border rounded-xl pl-10 pr-3 py-3.5 text-base sm:text-sm font-medium bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                  <div className="col-span-1">
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">Title</label>
                    <select name="title" value={formData.title} onChange={handleInputChange} className="w-full border rounded-xl px-2 py-3.5 text-base sm:text-sm font-medium bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none">
                      {TITLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2 sm:col-span-3">
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">Patient Name</label>
                    <input ref={nameInputRef} type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter patient full name" className="w-full border rounded-xl px-3 py-3.5 text-base sm:text-sm font-medium uppercase bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  <div className="hidden sm:block">
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">DOB</label>
                    <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className={`w-full border rounded-xl px-3 py-3.5 text-sm font-medium ${isEditMode ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200" : "bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"}`} disabled={isEditMode} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">Age</label>
                    <input type="number" name="age" value={formData.age} onChange={(e) => setFormData((prev) => ({ ...prev, age: e.target.value }))} placeholder="Enter age" min="0" max="120" className={`w-full border rounded-xl px-3 py-3.5 text-base sm:text-sm font-medium ${isEditMode ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200" : "bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"}`} disabled={isEditMode} />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleInputChange} className={`w-full border rounded-xl px-3 py-3.5 text-base sm:text-sm font-medium ${isEditMode ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200" : "bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"}`} disabled={isEditMode}>
                      <option value="">Select Gender</option>
                      {GENDER_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-blue-600 text-[10px]" /> Address
                  </label>
                  <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="Patient street address" className={`w-full border rounded-xl px-3 py-3.5 text-base sm:text-sm font-medium ${isEditMode ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200" : "bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"}`} disabled={isEditMode} />
                </div>

                <div className="hidden sm:grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>Pincode</span>
                      {fetchingCity && <FiRefreshCw className="w-3 h-3 text-blue-500 animate-spin" />}
                    </label>
                    <input type="text" name="pincode" value={formData.pincode} onChange={handlePincodeChange} onFocus={() => { if (citySuggestions.length > 0) setShowCitySuggestions(true); }} placeholder="Enter 6-digit pincode" maxLength="6" inputMode="numeric" className={`w-full border rounded-xl px-3 py-3.5 text-sm font-medium ${isEditMode ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200" : "bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"}`} disabled={isEditMode} />
                  </div>
                  <div className="relative city-dropdown-add-patient">
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      City
                      {formData.city && !isEditMode && (<span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">✓ Auto</span>)}
                    </label>
                    <input type="text" name="city" value={formData.city} onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))} onFocus={() => { if (!isEditMode && citySuggestions.length > 0) setShowCitySuggestions(true); }} placeholder="Auto-filled from pincode" autoComplete="off" className={`w-full border rounded-xl px-3 py-3.5 text-sm font-medium ${isEditMode ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200" : "bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"}`} disabled={isEditMode} />
                    {!isEditMode && showCitySuggestions && citySuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-52 overflow-y-auto z-50">
                        <div className="px-3 py-1.5 bg-blue-50 border-b border-blue-100 sticky top-0">
                          <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">{citySuggestions.length} area{citySuggestions.length > 1 ? "s" : ""} found — select to fill city</p>
                        </div>
                        {citySuggestions.map((sug, i) => (
                          <button key={`${sug.pincode}-${i}`} type="button" onMouseDown={(e) => { e.preventDefault(); handleSelectCity(sug); }} className="w-full px-3 py-2 text-left text-xs hover:bg-blue-50 flex items-center justify-between border-b border-gray-100 last:border-0">
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-800">{sug.area}</span>
                              <span className="text-[10px] text-gray-500">{sug.district}, {sug.state}</span>
                            </div>
                            <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px] border border-blue-200">{sug.pincode}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                        Select Doctor
                        {isEditMode && <FaLock className="text-amber-500 text-[10px]" />}
                      </label>
                      {!isEditMode && (
                        <button type="button" onClick={() => handleRoleBasedNavigate("/doctor-management")} className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5" title="Add New Doctor">
                          <FaPlus className="w-2.5 h-2.5" /> Add
                        </button>
                      )}
                    </div>
                    <select name="doctorId" value={formData.doctorId} onChange={handleInputChange} disabled={isEditMode} className={`w-full border rounded-xl px-3 py-3.5 text-base sm:text-sm font-medium ${isEditMode ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200" : "bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"}`}>
                      <option value="">Select Doctor</option>
                      {doctors.map((d) => <option key={d._id || d.id} value={d._id || d.id}>{d.name || "Doctor"}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5 flex items-center gap-2">Appointment Date</label>
                    <input type="date" name="appointmentDate" value={formData.appointmentDate} onChange={handleInputChange} className="w-full border rounded-xl px-3 py-3.5 text-base sm:text-sm font-medium bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none" />
                  </div>
                </div>

                {formData.doctorId && formData.appointmentDate && !isEditMode && (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2">Available Slots ({getDayNameFromDate(formData.appointmentDate)})</label>
                    {slotsLoading ? (
                      <div className="text-xs text-gray-500 py-3 text-center"><FiRefreshCw className="w-4 h-4 animate-spin inline" /> Loading...</div>
                    ) : availableSlots.length === 0 ? (
                      <div className="text-xs text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200 flex items-center justify-between gap-3 flex-wrap">
                        <span className="font-semibold">No slots available for this doctor on this date.</span>
                        <button type="button" onClick={() => handleRoleBasedNavigate("/appointment-slots")} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors" title="Manage Appointment Slots">
                          <FaPlus className="w-3 h-3" /> Add Slots for this Doctor
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto p-1">
                        {availableSlots.map((slot) => {
                          const isSelected = formData.slotId === slot._id;
                          const isBooked = slot.status === "booked";
                          if (formData.slotId && !isSelected) return null;
                          return (
                            <button key={slot._id} type="button" onClick={() => !isBooked && handleSlotSelect(slot._id)} className={`p-2 text-xs font-semibold rounded-lg border text-left ${isSelected ? "border-blue-500 bg-blue-50 text-blue-700" : isBooked ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"}`} disabled={isBooked}>
                              <div className="font-bold text-xs">{slot.startTime} – {slot.endTime}</div>
                              <div className="text-[10px] text-gray-500">₹{slot.consultationFee || 0}</div>
                              {isBooked && <span className="text-[9px] font-bold text-red-500 block">Booked</span>}
                              {isSelected && <span className="text-[9px] font-bold text-emerald-600 block">✓ Selected</span>}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {formData.slotId && (
                      <button type="button" onClick={() => { setFormData((p) => ({ ...p, slotId: "" })); filterSlotsByDoctorAndDate(formData.doctorId, formData.appointmentDate); }} className="mt-2 text-[10px] text-blue-600 underline">Change Slot</button>
                    )}
                  </div>
                )}

                <div className="border rounded-xl p-3 sm:p-4 bg-blue-50/30 border-gray-200">
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-3 flex items-center gap-2">
                    <FaShareAlt className="text-blue-600" /> Referred By
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[10px] font-semibold text-gray-500 uppercase flex items-center gap-1.5">
                          <FaUserFriends className="text-blue-500" /> Customer
                        </label>
                        <button type="button" onClick={handleAddCustomerReferral} className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5">
                          <FaPlus className="w-2.5 h-2.5" /> Add
                        </button>
                      </div>
                      <select value={formData.referralCustomerId} onChange={(e) => {
                        const id = e.target.value;
                        if (id) { const c = referralContacts.find((x) => x._id === id && x.referralType === "customer"); if (c) handleReferralCustomerSelect(c); }
                        else {
                          setFormData((p) => ({ ...p, referredByCustomer: "", referralCustomerId: "", offerApplied: null }));
                          setSelectedCustomerOffers([]); setSelectedOfferId(""); setAppliedOffer(null);
                        }
                      }} className="w-full border rounded-xl px-3 py-3.5 text-base sm:text-sm font-medium bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none">
                        <option value="">-- Select Customer --</option>
                        {referralContacts.filter((c) => c.referralType === "customer").map((c) => (
                          <option key={c._id} value={c._id}>{c.customerName || "N/A"} {c.customerPhone ? `(${c.customerPhone})` : ""}</option>
                        ))}
                      </select>
                      {formData.referredByCustomer && (
                        <div className="mt-2 text-xs text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 flex items-center gap-1.5">
                          <FaUserFriends className="text-blue-500 text-[10px]" />
                          <span className="font-medium truncate">{formData.referredByCustomer}</span>
                        </div>
                      )}

                      {formData.referralCustomerId && selectedCustomerOffers.length > 0 && (
                        <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                          <label className="block text-[10px] font-bold text-amber-700 uppercase mb-1.5 flex items-center gap-1.5">
                            <FaGift className="text-amber-600" /> Apply Offer (Optional)
                          </label>
                          <select value={selectedOfferId} onChange={(e) => {
                            const offerId = e.target.value;
                            setSelectedOfferId(offerId);
                            if (offerId) {
                              const offer = selectedCustomerOffers.find((o) => o._id === offerId);
                              if (offer) {
                                setAppliedOffer(offer);
                                const offerNameLower = (offer.offerName || "").trim().toLowerCase();
                                let matchedService = services.find((s) => (s.name || "").trim().toLowerCase() === offerNameLower);
                                if (!matchedService && offerNameLower) {
                                  matchedService = services.find((s) => {
                                    const svcName = (s.name || "").trim().toLowerCase();
                                    return (svcName.includes(offerNameLower) || offerNameLower.includes(svcName));
                                  });
                                }
                                let newServiceItems = formData.serviceItems;
                                if (matchedService) {
                                  newServiceItems = [...formData.serviceItems, { ...matchedService, custom: false }];
                                  showToast(`✅ Offer applied & service "${matchedService.name}" (₹${matchedService.price}) auto-added!`, "success");
                                } else { showToast(`Offer applied: ${offer.offerName} (₹${offer.offerAmount}) — no matching service found`, "info"); }
                                setFormData((prev) => ({
                                  ...prev, serviceItems: newServiceItems,
                                  offerApplied: {
                                    referralContactId: prev.referralCustomerId,
                                    offerId: offer._id, offerName: offer.offerName,
                                    offerAmount: Number(offer.offerAmount) || 0,
                                  },
                                }));
                              }
                            } else { setAppliedOffer(null); setFormData((prev) => ({ ...prev, offerApplied: null })); }
                          }} className="w-full bg-white border border-amber-300 rounded-lg px-3 py-3 text-base sm:text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none">
                            <option value="">-- No Offer --</option>
                            {selectedCustomerOffers.map((o) => (
                              <option key={o._id} value={o._id}>{o.offerName} — ₹{o.offerAmount}</option>
                            ))}
                          </select>
                          {appliedOffer && (
                            <div className="mt-2 flex items-center justify-between bg-white px-3 py-2 rounded border border-amber-300">
                              <span className="text-xs font-semibold text-amber-800 flex items-center gap-1">
                                <FaGift className="text-amber-600" /> {appliedOffer.offerName}
                              </span>
                              <span className="text-sm font-extrabold text-amber-900">− ₹{appliedOffer.offerAmount}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[10px] font-semibold text-gray-500 uppercase flex items-center gap-1.5">
                          <FaUserMdIcon className="text-indigo-500" /> Doctor
                        </label>
                        <button type="button" onClick={handleAddDoctorReferral} className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5">
                          <FaPlus className="w-2.5 h-2.5" /> Add
                        </button>
                      </div>
                      <select value={formData.referralDoctorId} onChange={(e) => {
                        const id = e.target.value;
                        if (id) { const c = referralContacts.find((x) => x._id === id && x.referralType === "doctor"); if (c) handleReferralDoctorSelect(c); }
                        else { setFormData((p) => ({ ...p, referredByDoctor: "", referralDoctorId: "" })); }
                      }} className="w-full border rounded-xl px-3 py-3.5 text-base sm:text-sm font-medium bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none">
                        <option value="">-- Select Doctor --</option>
                        {referralContacts.filter((c) => c.referralType === "doctor").map((c) => (
                          <option key={c._id} value={c._id}>{c.doctorName || "N/A"} {c.doctorSpecialization ? `(${c.doctorSpecialization})` : ""}</option>
                        ))}
                      </select>
                      {formData.referredByDoctor && (
                        <div className="mt-2 text-xs text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200 flex items-center gap-1.5">
                          <FaUserMdIcon className="text-indigo-500 text-[10px]" />
                          <span className="font-medium truncate">{formData.referredByDoctor}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border rounded-xl p-3 sm:p-4 bg-gray-50/50 border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                      <FaServicestack className="text-blue-600" /> Services
                    </label>
                    <span className="text-[10px] text-gray-400">{formData.serviceItems.length} added</span>
                  </div>
                  {formData.serviceItems.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.serviceItems.map((svc, i) => (
                        <div key={`${svc._id}-${i}`} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          <span>{svc.name}</span>
                          <span className="font-bold text-emerald-600">₹{svc.price}</span>
                          <button type="button" onClick={() => handleRemoveServiceItem(svc._id)} className="text-red-400 hover:text-red-600"><FaMinusCircle className="w-3 h-3" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex-1 min-w-[140px] relative service-dropdown-add-patient">
                      <input type="text" value={formData.serviceName || ""} onChange={(e) => {
                        const v = e.target.value;
                        setFormData((p) => ({ ...p, serviceName: v }));
                        if (v.trim()) { setFilteredServices(services.filter((s) => s.name.toLowerCase().includes(v.toLowerCase()))); setShowServiceSuggestions(true); }
                        else { setFilteredServices([]); setShowServiceSuggestions(false); }
                      }} placeholder="Service name" className="w-full bg-white border border-gray-300 rounded-xl px-3 py-3.5 text-base sm:text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none" />
                      {showServiceSuggestions && filteredServices.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto z-50">
                          {filteredServices.map((svc) => (
                            <button key={svc._id} type="button" onClick={() => { setFormData((p) => ({ ...p, serviceName: svc.name, servicePrice: svc.price.toString() })); setFilteredServices([]); setShowServiceSuggestions(false); }} className="w-full px-3.5 py-2.5 text-left text-xs hover:bg-gray-50 flex items-center justify-between border-b last:border-0">
                              <span>{svc.name}</span><span className="font-bold text-emerald-700">₹{svc.price}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <input type="number" value={formData.servicePrice || ""} onChange={(e) => setFormData((p) => ({ ...p, servicePrice: e.target.value }))} placeholder="Price" className="w-24 bg-white border border-gray-300 rounded-xl px-3 py-3.5 text-base sm:text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none" />
                    <button type="button" onClick={handleAddCustomServiceItem} className="px-4 py-3.5 text-xs font-bold text-white bg-emerald-600 rounded-xl flex items-center gap-1"><FaPlus className="w-3 h-3" /> Add</button>
                  </div>
                  {formData.serviceItems.length > 0 && (
                    <div className="mt-3 p-2.5 bg-white rounded-lg border border-gray-200 flex justify-between">
                      <span className="text-xs font-bold">Subtotal:</span>
                      <span className="text-sm font-extrabold text-blue-700">₹{formData.serviceItems.reduce((s, x) => s + (Number(x.price) || 0), 0)}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1.5">Reason / Symptoms</label>
                  <textarea name="reason" value={formData.reason} onChange={handleInputChange} rows={2} className="w-full border rounded-xl px-3 py-3 text-base sm:text-sm font-medium resize-none bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none" placeholder="Enter reason or symptoms" />
                </div>

                <div className={`border rounded-xl p-3 sm:p-4 ${isEditMode ? "bg-gray-100 border-gray-300" : "bg-purple-50/30 border-gray-200"}`}>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-3 flex items-center gap-2">
                    <FaMoneyBillWave className="text-purple-600" /> Payment Details
                    {isEditMode && <span className="ml-2 inline-flex items-center gap-1 text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded border border-amber-200"><FaLock /> Amount Locked</span>}
                  </label>

                  {(() => {
                    const matchB = getMatchingBooking({ phone: formData.phone, name: formData.name, _id: formData.bookingId });
                    const labTotal = Number(matchB?.labTotal) || 0;
                    const medicineTotal = Number(matchB?.medicineTotal) || 0;

                    const fin = computeFinancials(formData.serviceItems, {
                      labTotal, medicineTotal,
                      referralCommission: formData.referralCommission,
                      discount: formData.discount, discountType: formData.discountType,
                      partialAmount: formData.partialAmount,
                      offerAmount: appliedOffer?.offerAmount || 0,
                    });

                    return (
                      <>
                        <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
                          <div className="space-y-1.5 text-xs">
                            {formData.serviceItems.length > 0 && (
                              <>
                                <div className="flex justify-between items-center py-1 border-b border-gray-100">
                                  <span className="text-gray-700 font-medium flex items-center gap-1.5"><FaClinicMedical className="text-[10px] text-blue-600" /> Clinic Services</span>
                                  <span className="text-gray-500 text-[10px]">{formData.serviceItems.length} service{formData.serviceItems.length > 1 ? "s" : ""}</span>
                                </div>
                                {formData.serviceItems.map((svc, idx) => (
                                  <div key={idx} className="flex justify-between items-center py-1 border-b border-gray-100 pl-4">
                                    <span className="text-gray-600 text-[10px]">• {svc.name}</span>
                                    <span className="font-medium text-gray-800">₹{svc.price || 0}</span>
                                  </div>
                                ))}
                              </>
                            )}
                            {labTotal > 0 && (
                              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                                <span className="text-purple-700 text-[11px] font-semibold flex items-center gap-1"><FaFlask className="text-[9px]" /> Lab Total</span>
                                <span className="font-bold text-purple-700">₹{labTotal}</span>
                              </div>
                            )}
                            {medicineTotal > 0 && (
                              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                                <span className="text-green-700 text-[11px] font-semibold flex items-center gap-1"><FaPills className="text-[9px]" /> Pharmacy Total</span>
                                <span className="font-bold text-green-700">₹{medicineTotal}</span>
                              </div>
                            )}
                            <div className="flex justify-between items-center py-1.5 border-b border-t-2 border-gray-800 bg-gray-50 px-2 -mx-2 mt-1">
                              <span className="text-gray-900 text-[11px] font-bold">SUBTOTAL</span>
                              <span className="font-extrabold text-gray-900">₹{fin.subtotal}</span>
                            </div>
                            {fin.discountAmount > 0 && (
                              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                                <span className="text-red-600 text-[11px] font-semibold flex items-center gap-1"><FaPercent className="text-[9px]" /> Discount {formData.discountType === "%" ? `(${formData.discount}%)` : ""}</span>
                                <span className="font-bold text-red-600">− ₹{Math.round(fin.discountAmount)}</span>
                              </div>
                            )}
                            {fin.offerDeduction > 0 && (
                              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                                <span className="text-amber-700 text-[11px] font-semibold flex items-center gap-1"><FaGift className="text-[9px]" /> Offer ({appliedOffer?.offerName})</span>
                                <span className="font-bold text-amber-700">− ₹{Math.round(fin.offerDeduction)}</span>
                              </div>
                            )}
                            <div className="flex justify-between items-center py-2 border-t-2 border-gray-800">
                              <span className="font-bold text-gray-800">Payable Amount</span>
                              <span className="font-bold text-emerald-700 text-sm">₹{Math.round(fin.finalPayable)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-12 gap-2 sm:gap-3 mb-3">
                          <div className="col-span-1 md:col-span-2">
                            <label className="block text-[11px] font-bold text-purple-700 uppercase mb-1 flex items-center gap-1.5"><FaPercent className="text-[10px]" /> Type</label>
                            <select name="discountType" value={formData.discountType} onChange={handleInputChange} className="w-full bg-white border border-gray-300 rounded-xl px-2 py-3.5 text-base sm:text-sm font-medium focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none">
                              {DISCOUNT_TYPE_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                            </select>
                          </div>
                          <div className="col-span-1 md:col-span-3">
                            <label className="block text-[11px] font-bold text-purple-700 uppercase mb-1">Discount</label>
                            <input type="number" name="discount" value={formData.discount} onChange={handleInputChange} placeholder={formData.discountType === "%" ? "Enter %" : "Enter amount"} min="0" max={formData.discountType === "%" ? "100" : undefined} className="w-full bg-white border border-gray-300 rounded-xl px-3 py-3.5 text-base sm:text-sm font-medium focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none" />
                          </div>
                          <div className="col-span-2 md:col-span-3">
                            <label className="block text-[11px] font-bold text-amber-700 uppercase mb-1">Amount Received (₹)</label>
                            <input type="number" name="partialAmount" value={formData.partialAmount} onChange={handleInputChange} placeholder="0 for Due" min="0" className="w-full bg-white border border-gray-300 rounded-xl px-3 py-3.5 text-base sm:text-sm font-medium focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none" />
                          </div>
                          <div className="col-span-2 md:col-span-4">
                            <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Payment Mode</label>
                            <select name="paymentType" value={formData.paymentType} onChange={handleInputChange} disabled={isEditMode} className={`w-full border rounded-xl px-3 py-3.5 text-base sm:text-sm font-medium ${isEditMode ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200" : "bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"}`}>
                              {PAYMENT_TYPE_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                            </select>
                          </div>
                        </div>
                        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                          <div className="space-y-1 text-[10px]">
                            <div className="flex justify-between text-amber-800"><span>Total Payable:</span><span className="font-bold">₹{Math.round(fin.finalPayable)}</span></div>
                            <div className="flex justify-between text-emerald-700"><span>Amount Receiving:</span><span className="font-bold">₹{Math.round(fin.parsedPartial)}</span></div>
                            <div className={`flex justify-between border-t border-amber-300 pt-1 mt-1 ${fin.balanceAmount > 0 ? "text-red-700" : "text-emerald-700"}`}>
                              <span>{fin.balanceAmount > 0 ? "Balance Remaining:" : "Status:"}</span>
                              <span className="font-bold">{fin.balanceAmount > 0 ? `₹${Math.round(fin.balanceAmount)}` : "✓ Fully Paid"}</span>
                            </div>
                            <div className={`flex items-center justify-between border rounded-md px-2 py-1 mt-1 ${fin.paymentStatus === "Paid" ? "text-emerald-700 bg-emerald-50 border-emerald-200" : fin.paymentStatus === "Partial" ? "text-amber-700 bg-amber-50 border-amber-200" : "text-red-700 bg-red-50 border-red-200"}`}>
                              <span className="font-semibold">Payment Status:</span>
                              <span className="font-extrabold uppercase tracking-wide">{fin.paymentStatus}</span>
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button type="button" onClick={cancelForm} className="px-4 py-3 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200">Cancel</button>
                  <button type="submit" className={`px-5 py-3 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-1.5 ${isEditMode ? "bg-blue-600 hover:bg-blue-700" : "bg-emerald-600 hover:bg-emerald-700"}`}>
                    {submitting ? <FiRefreshCw className="w-3.5 h-3.5 animate-spin" /> : isEditMode ? <FiEdit2 className="w-3.5 h-3.5" /> : <FiCalendar className="w-3.5 h-3.5" />}
                    {submitting ? "Saving..." : isEditMode ? "Update Appointment" : "Confirm & Book Slot"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TABLE */}
        <div className="emp-dash__card">
          {loading ? (
            <div className="py-12 text-center"><FiRefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" /><p className="text-sm text-gray-500">Loading patient records...</p></div>
          ) : filteredPatients.length === 0 ? (
            <div className="py-12 text-center">
              <FaUserInjured className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-700">No Patient Records Found</h3>
              <p className="text-xs text-gray-500 mt-1 mb-4">{patients.length === 0 ? "Click 'Add Patient' to register a new OPD patient." : "No records match your filters."}</p>
              {hasActiveFilters ? (
                <button onClick={clearFilters} className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg">Clear Filters</button>
              ) : (
                <button onClick={handleAddNewPatient} className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg inline-flex items-center gap-1.5"><FiPlus className="w-3.5 h-3.5" /> Add Patient</button>
              )}
            </div>
          ) : (
            <>
              <div className="hidden lg:block overflow-x-auto">
                <table className="emp-dash__table op-compact-table">
                  <thead>
                    <tr>
                      <th style={{ width: "35px", textAlign: "center" }}>#</th>
                      <th style={{ minWidth: "180px" }}>Patient</th>
                      <th style={{ minWidth: "170px" }}>Doctor / Date</th>
                      <th style={{ textAlign: "center", minWidth: "140px" }}>Booking Type / Status</th>
                      <th style={{ textAlign: "center", minWidth: "150px" }}>Amount</th>
                      <th style={{ textAlign: "center" }}>Total</th>
                      <th style={{ textAlign: "center" }}>Disc.</th>
                      <th style={{ textAlign: "center" }}>DUE</th>
                      <th style={{ textAlign: "center" }}>Paid</th>
                      <th style={{ textAlign: "center", minWidth: "110px" }}>Pment Type</th>
                      <th style={{ textAlign: "center", minWidth: "130px" }}>Pment Status</th>
                      <th style={{ textAlign: "center", minWidth: "150px" }}>Referred By</th>
                      <th style={{ textAlign: "center" }}>Created At</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPatients.map((patient, idx) => {
                      const matchingBooking = getMatchingBooking(patient);
                      const consultationPaymentStatus = getConsultationPaymentStatus(patient);
                      const bookingStatus = getBookingStatus(patient);
                      const appointmentDate = getAppointmentDate(patient);
                      const slotTiming = getSlotTiming(patient);
                      const statusColors = getStatusColors(bookingStatus);
                      const referredByCustomer = matchingBooking?.referredByCustomer || patient.referredByCustomer || "";
                      const referredByDoctor = matchingBooking?.referredByDoctor || patient.referredByDoctor || "";
                      const createdAt = matchingBooking?.createdAt || matchingBooking?.bookedAt || patient.createdAt;
                      const paidInfo = getBookingPaidInfo(matchingBooking);
                      const amountBreakdown = getAmountBreakdown(matchingBooking);
                      const catStatuses = getCategoryStatuses(matchingBooking);
                      const isActive = getPatientActiveStatus(patient);
                      const isToggling = togglingStatus === patient._id;
                      const discountAmount = Number(matchingBooking?.discount) || 0;
                      const bookingTypeInfo = getBookingType(matchingBooking);
                      const BookingTypeIcon = bookingTypeInfo.icon;

                      return (
                        <tr key={patient._id} className="hover:bg-blue-50/40">
                          <td className="px-2 py-3 text-center text-slate-500 text-[11px]">{indexOfFirstItem + idx + 1}</td>

                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0">
                                {patient.name ? patient.name.charAt(0).toUpperCase() : "P"}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-semibold text-slate-800 text-xs whitespace-normal break-words leading-tight min-w-[140px]">
                                  {patient.title || ""} {patient.name || "N/A"}
                                </div>
                                <div className="text-[10px] text-gray-500 font-medium">{patient.age || "N/A"} yrs · {patient.gender || "N/A"}</div>
                                <div className="text-[10px] text-gray-500 flex items-center gap-1"><FaPhoneAlt className="text-[8px]" /> {patient.phone || "N/A"}</div>
                              </div>
                            </div>
                          </td>

                          <td className="px-3 py-3">
                            <div className="flex flex-col gap-0.5 min-w-[150px]">
                              <div className="text-xs font-semibold text-purple-800 truncate max-w-[140px]">{matchingBooking?.doctorName || "N/A"}</div>
                              <div className="text-[10px] font-semibold text-slate-700">{formatDateToDDMMYYYY(appointmentDate)}</div>
                              {slotTiming !== "-" && (<div className="text-[9px] text-blue-700 font-semibold">{slotTiming}</div>)}
                            </div>
                          </td>

                          <td className="px-3 py-3 text-center" style={{ minWidth: "140px" }}>
                            {matchingBooking ? (
                              <div className="flex flex-col items-center gap-1">
                                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${bookingTypeInfo.color}`}>
                                  <BookingTypeIcon className="w-2.5 h-2.5" /> {bookingTypeInfo.label}
                                </span>
                                {bookingStatus !== "No Booking" ? (
                                  <button onClick={(e) => { e.stopPropagation(); setStatusModalBooking(matchingBooking); setShowStatusModal(true); }} className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${statusColors.bg} ${statusColors.text} ${statusColors.border} hover:opacity-80 transition-all cursor-pointer shadow-sm`} title="Change Booking Status">
                                    <FaCheckCircle className="w-2.5 h-2.5" /> {bookingStatus} <FiChevronDown className="w-3 h-3" />
                                  </button>
                                ) : (<span className="text-[10px] text-gray-400 italic">No Booking</span>)}
                              </div>
                            ) : (<span className="text-[10px] text-gray-400 italic">N/A</span>)}
                          </td>

                          {/* AMOUNT COLUMN — 3 Row */}
                          <td className="px-3 py-3" style={{ minWidth: "150px" }}>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center justify-between gap-1 px-2 py-1 rounded border border-blue-200 bg-blue-50 text-blue-700 text-[10px]">
                                <span className="font-semibold whitespace-nowrap flex items-center gap-1"><FaClinicMedical className="text-[9px]" /> Clinic:</span>
                                <span className="font-bold whitespace-nowrap flex items-center gap-1">
                                  ₹{Math.round(Number(amountBreakdown?.clinic) || 0)}
                                  <button onClick={(e) => { e.stopPropagation(); if (matchingBooking) openClinicServicesModal(matchingBooking); }} className="p-0.5 rounded hover:bg-blue-100" title="Add / Edit Services">
                                    <FaPlus className="w-2.5 h-2.5 text-blue-600" />
                                  </button>
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-1 px-2 py-1 rounded border border-purple-200 bg-purple-50 text-purple-700 text-[10px]">
                                <span className="font-semibold whitespace-nowrap flex items-center gap-1"><FaFlask className="text-[9px]" /> Lab:</span>
                                <span className="font-bold whitespace-nowrap flex items-center gap-1">
                                  ₹{Math.round(Number(amountBreakdown?.lab) || 0)}
                                  <button onClick={(e) => { e.stopPropagation(); if (matchingBooking) openLabItemsModal(matchingBooking); }} className="p-0.5 rounded hover:bg-purple-100" title="Add / Edit Lab Items">
                                    <FaPlus className="w-2.5 h-2.5 text-purple-600" />
                                  </button>
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-1 px-2 py-1 rounded border border-green-200 bg-green-50 text-green-700 text-[10px]">
                                <span className="font-semibold whitespace-nowrap flex items-center gap-1"><FaPills className="text-[9px]" /> Pharmacy:</span>
                                <span className="font-bold whitespace-nowrap flex items-center gap-1">
                                  ₹{Math.round(Number(amountBreakdown?.pharmacy) || 0)}
                                  <button onClick={(e) => { e.stopPropagation(); if (matchingBooking) openPharmacyItemsModal(matchingBooking); }} className="p-0.5 rounded hover:bg-green-100" title="Add / Edit Pharmacy Items">
                                    <FaPlus className="w-2.5 h-2.5 text-green-600" />
                                  </button>
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="px-3 py-3 text-center whitespace-nowrap"><span className="text-xs font-bold text-slate-800">₹{Math.round(paidInfo.final)}</span></td>
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            {discountAmount > 0 ? (<span className="text-xs font-bold text-red-600">− ₹{Math.round(discountAmount)}</span>) : <span className="text-xs text-gray-400">—</span>}
                          </td>
                          <td className="px-3 py-3 text-center whitespace-nowrap"><span className={`text-xs font-bold ${paidInfo.balance > 0 ? "text-red-600" : "text-gray-400"}`}>₹{Math.round(paidInfo.balance)}</span></td>
                          <td className="px-3 py-3 text-center whitespace-nowrap"><span className="text-xs font-bold text-emerald-700">₹{Math.round(paidInfo.paid)}</span></td>

                          {/* PAYMENT TYPE — 3 Row */}
                          <td className="px-3 py-3" style={{ minWidth: "110px" }}>
                            {matchingBooking ? (
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center justify-center gap-1 px-2 py-1 rounded border border-blue-200 bg-blue-50 text-[10px]">
                                  <button onClick={(e) => { e.stopPropagation(); openPaymentTypeEditModal(matchingBooking); }} className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded uppercase border bg-white text-slate-700 border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer" title="Change Payment Type">
                                    {matchingBooking.paymentType || "cash"} <FiChevronDown className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                                <div className="flex items-center justify-center gap-1 px-2 py-1 rounded border border-purple-200 bg-purple-50 text-[10px]">
                                  <button onClick={(e) => { e.stopPropagation(); openPaymentTypeEditModal(matchingBooking); }} className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded uppercase border bg-white text-slate-700 border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer" title="Change Payment Type">
                                    {matchingBooking.paymentType || "cash"} <FiChevronDown className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                                <div className="flex items-center justify-center gap-1 px-2 py-1 rounded border border-green-200 bg-green-50 text-[10px]">
                                  <button onClick={(e) => { e.stopPropagation(); openPaymentTypeEditModal(matchingBooking); }} className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded uppercase border bg-white text-slate-700 border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer" title="Change Payment Type">
                                    {matchingBooking.paymentType || "cash"} <FiChevronDown className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              </div>
                            ) : (<span className="text-[10px] text-gray-400 italic block text-center">N/A</span>)}
                          </td>

                          {/* PAYMENT STATUS — Per-category */}
                          <td className="px-3 py-3" style={{ minWidth: "130px" }}>
                            {matchingBooking ? (
                              <div className="flex flex-col gap-1">
                                {["clinic", "lab", "pharmacy"].map((cat) => {
                                  const catStatus = catStatuses[cat] || "Due";
                                  const catColors = getPaymentStatusColors(catStatus);
                                  const CatIcon = catColors.icon;
                                  const borderColor = cat === "clinic" ? "border-blue-200 bg-blue-50" : cat === "lab" ? "border-purple-200 bg-purple-50" : "border-green-200 bg-green-50";
                                  return (
                                    <div key={cat} className={`flex items-center justify-center gap-1 px-2 py-1 rounded border ${borderColor} text-[10px]`}>
                                      {catStatus === "Empty" ? (
                                        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border bg-gray-50 text-gray-400 border-gray-200 cursor-default">
                                          — N/A
                                        </span>
                                      ) : catStatus === "Paid" ? (
                                        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default">
                                          <FaCheckCircle className="w-2 h-2 text-emerald-600" /> Paid
                                        </span>
                                      ) : (
                                        <button onClick={(e) => { e.stopPropagation(); openPartialModal(matchingBooking, cat); }} className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${catColors.bg} ${catColors.text} ${catColors.border} hover:opacity-80`}>
                                          <CatIcon className={`w-2 h-2 ${catColors.iconColor}`} /> {catStatus}
                                        </button>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (<span className="text-[10px] text-gray-400 italic block text-center">N/A</span>)}
                          </td>

                          <td className="px-3 py-3">
                            <div className="flex flex-col gap-1 min-w-[120px]">
                              {referredByCustomer ? (
                                <div onClick={(e) => { e.stopPropagation(); handleRoleBasedNavigate("/referral-management"); }} className="flex items-center gap-1 text-[10px] font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors" title="Go to Referral Management">
                                  <FaUserFriends className="text-[8px] flex-shrink-0" />
                                  <span className="truncate max-w-[90px]">{referredByCustomer}</span>
                                </div>
                              ) : (<span className="text-[9px] text-gray-400 italic">No Customer</span>)}
                              {referredByDoctor ? (
                                <div onClick={(e) => { e.stopPropagation(); handleRoleBasedNavigate("/referral-management"); }} className="flex items-center gap-1 text-[10px] font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-full border border-indigo-100 cursor-pointer hover:bg-indigo-100 transition-colors" title="Go to Referral Management">
                                  <FaUserMdIcon className="text-[8px] flex-shrink-0" />
                                  <span className="truncate max-w-[90px]">{referredByDoctor}</span>
                                </div>
                              ) : (<span className="text-[9px] text-gray-400 italic">No Doctor</span>)}
                            </div>
                          </td>

                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <div className="text-[10px] font-semibold text-slate-700">{formatDateToDDMMYYYY(createdAt)}</div>
                            <div className="text-[9px] text-gray-400 mt-0.5">{createdAt ? new Date(createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) : "N/A"}</div>
                          </td>

                          <td className="px-3 py-3 text-right whitespace-nowrap">
                            <div className="relative inline-block action-dropdown">
                              <button onClick={(e) => { e.stopPropagation(); setOpenActionDropdown(openActionDropdown === patient._id ? null : patient._id); }} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors" title="Actions">
                                <FiMoreVertical className="w-4 h-4" />
                              </button>
                              {openActionDropdown === patient._id && (
                                <div className="absolute right-0 top-full mt-1 z-[9999] bg-white rounded-xl shadow-2xl border border-gray-200 py-2 min-w-[170px]" onClick={(e) => e.stopPropagation()}>
                                  <div className="px-3 pb-2 mb-1 border-b border-gray-100">
                                    <div className="text-[11px] font-bold text-slate-800 truncate">{patient.title || ""} {patient.name || "N/A"}</div>
                                    <div className="text-[9px] text-gray-400">{patient.phone || ""}</div>
                                  </div>
                                  <button onClick={(e) => { e.stopPropagation(); setOpenActionDropdown(null); handleRowClick(patient); }} className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-50 transition-colors"><FiEye className="w-3.5 h-3.5" /> View</button>
                                  <button onClick={(e) => { e.stopPropagation(); setOpenActionDropdown(null); handleEdit(patient, matchingBooking); }} className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-semibold text-blue-700 hover:bg-blue-50 transition-colors"><FiEdit2 className="w-3.5 h-3.5" /> Edit</button>
                                  {matchingBooking && (
                                    <>
                                      <button onClick={(e) => { e.stopPropagation(); setOpenActionDropdown(null); openPrescriptionModal(matchingBooking); }} className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-semibold text-teal-700 hover:bg-teal-50 transition-colors"><FaPrescription className="w-3.5 h-3.5" /> Prescription</button>
                                      <button onClick={(e) => { e.stopPropagation(); setOpenActionDropdown(null); openVitalsModal(matchingBooking); }} className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-semibold text-pink-700 hover:bg-pink-50 transition-colors"><FaHeartbeat className="w-3.5 h-3.5" /> Vitals</button>
                                      <button onClick={(e) => { e.stopPropagation(); setOpenActionDropdown(null); openBillingModal(matchingBooking); }} disabled={invoiceLoading === matchingBooking._id} className={`w-full flex items-center gap-2 px-3 py-2 text-[11px] font-semibold transition-colors disabled:opacity-50 ${matchingBooking?.invoiceUrl ? "text-blue-700 hover:bg-blue-50" : "text-emerald-700 hover:bg-emerald-50"}`}>
                                        {invoiceLoading === matchingBooking._id ? (<FiRefreshCw className="w-3.5 h-3.5 animate-spin" />) : (<FaFileInvoiceDollar className="w-3.5 h-3.5" />)}
                                        {matchingBooking?.invoiceUrl ? "View Invoice" : "Generate Bill"}
                                      </button>
                                      {(() => {
                                        const rStatus = getReviewWindowStatus(matchingBooking);
                                        const isReviewed = matchingBooking.isReviewed === true;
                                        const isDisabled = !rStatus.canReview && !isReviewed;
                                        return (
                                          <button onClick={(e) => {
                                            e.stopPropagation();
                                            if (isDisabled) {
                                              if (rStatus.expired) showToast("Review window expired (3 days limit).", "error");
                                              else showToast("Review will be available on appointment date.", "info");
                                              return;
                                            }
                                            setOpenActionDropdown(null);
                                            openReviewModal(matchingBooking);
                                          }} disabled={isDisabled} className={`w-full flex items-center gap-2 px-3 py-2 text-[11px] font-semibold transition-colors ${isReviewed ? "text-emerald-700 hover:bg-emerald-50" : isDisabled ? "text-gray-300 cursor-not-allowed" : "text-amber-700 hover:bg-amber-50"}`}>
                                            <FaStar className="w-3.5 h-3.5" /> {isReviewed ? "Reviewed" : "Mark Review"}
                                          </button>
                                        );
                                      })()}
                                      <div className="border-t border-gray-100 mt-1 pt-1">
                                        <button onClick={(e) => { e.stopPropagation(); setOpenActionDropdown(null); handleToggleActiveStatus(patient); }} disabled={isToggling} className={`w-full flex items-center gap-2 px-3 py-2 text-[11px] font-semibold transition-colors disabled:opacity-50 ${isActive ? "text-emerald-700 hover:bg-emerald-50" : "text-gray-600 hover:bg-gray-50"}`}>
                                          {isToggling ? (<FiRefreshCw className="w-3.5 h-3.5 animate-spin" />) : isActive ? (<FaToggleOn className="w-4 h-4 text-emerald-600" />) : (<FaToggleOff className="w-4 h-4 text-gray-500" />)}
                                          {isActive ? "Mark Inactive" : "Mark Active"}
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              )}
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
                {currentPatients.map((patient, idx) => {
                  const matchingBooking = getMatchingBooking(patient);
                  const bookingStatus = getBookingStatus(patient);
                  const appointmentDate = getAppointmentDate(patient);
                  const slotTiming = getSlotTiming(patient);
                  const paidInfo = getBookingPaidInfo(matchingBooking);
                  const amountBreakdown = getAmountBreakdown(matchingBooking);
                  const isActive = getPatientActiveStatus(patient);
                  const isToggling = togglingStatus === patient._id;
                  const discountAmount = Number(matchingBooking?.discount) || 0;
                  const bookingTypeInfo = getBookingType(matchingBooking);
                  const BookingTypeIcon = bookingTypeInfo.icon;
                  const offerApplied = matchingBooking?.offerApplied;

                  return (
                    <div key={patient._id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      <div className="flex items-center justify-between gap-2 p-3 border-b border-gray-100 bg-gradient-to-r from-blue-50/60 to-indigo-50/60">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                            {patient.name ? patient.name.charAt(0).toUpperCase() : "P"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-slate-800 text-sm truncate">{patient.title || ""} {patient.name || "N/A"}</div>
                            <div className="text-[11px] text-gray-500 flex items-center gap-1"><FaPhoneAlt className="text-[9px]" /> {patient.phone || "N/A"}</div>
                          </div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); handleToggleActiveStatus(patient); }} disabled={isToggling} className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full uppercase border-2 flex-shrink-0 ${isActive ? "bg-emerald-50 text-emerald-700 border-emerald-400" : "bg-gray-100 text-gray-600 border-gray-400"} disabled:opacity-50`}>
                          {isToggling ? <FiRefreshCw className="w-3 h-3 animate-spin" /> : isActive ? <FaToggleOn className="w-4 h-4 text-emerald-600" /> : <FaToggleOff className="w-4 h-4 text-gray-500" />}
                          <span>{isActive ? "Active" : "Inactive"}</span>
                        </button>
                      </div>

                      <div className="p-3 space-y-2.5">
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div><div className="text-[9px] font-bold uppercase text-gray-400">Doctor</div><div className="font-semibold text-purple-700 truncate">{matchingBooking?.doctorName || "N/A"}</div></div>
                          <div><div className="text-[9px] font-bold uppercase text-gray-400">Age / Gender</div><div className="font-semibold text-slate-700">{patient.age || "N/A"} yrs · {patient.gender || "N/A"}</div></div>
                          <div>
                            <div className="text-[9px] font-bold uppercase text-gray-400">Booking Type</div>
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${bookingTypeInfo.color}`}>
                              <BookingTypeIcon className="w-2.5 h-2.5" /> {bookingTypeInfo.label}
                            </span>
                          </div>
                          <div><div className="text-[9px] font-bold uppercase text-gray-400">Appt. Date</div><div className="font-semibold text-slate-700">{formatDateToDDMMYYYY(appointmentDate)}</div></div>
                          <div><div className="text-[9px] font-bold uppercase text-gray-400">Slot Time</div><div className="font-semibold text-blue-700">{slotTiming !== "-" ? slotTiming : "N/A"}</div></div>
                        </div>

                        {offerApplied && offerApplied.offerAmount > 0 && (
                          <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-amber-700 flex items-center gap-1"><FaGift className="w-3 h-3" /> {offerApplied.offerName}</span>
                            <span className="text-xs font-extrabold text-amber-900">− ₹{offerApplied.offerAmount}</span>
                          </div>
                        )}

                        <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-gray-100">
                          <div className="text-center p-1.5 rounded-lg bg-blue-50 border border-blue-200">
                            <div className="text-[8px] font-bold text-blue-600 uppercase">Clinic</div>
                            <div className="text-xs font-extrabold text-blue-800">₹{Math.round(Number(amountBreakdown?.clinic) || 0)}</div>
                          </div>
                          <div className="text-center p-1.5 rounded-lg bg-purple-50 border border-purple-200">
                            <div className="text-[8px] font-bold text-purple-600 uppercase">Lab</div>
                            <div className="text-xs font-extrabold text-purple-800">₹{Math.round(Number(amountBreakdown?.lab) || 0)}</div>
                          </div>
                          <div className="text-center p-1.5 rounded-lg bg-green-50 border border-green-200">
                            <div className="text-[8px] font-bold text-green-600 uppercase">Pharmacy</div>
                            <div className="text-xs font-extrabold text-green-800">₹{Math.round(Number(amountBreakdown?.pharmacy) || 0)}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-gray-100 text-[10px]">
                          <div className="text-center"><div className="text-[8px] font-bold uppercase text-gray-400">Total</div><div className="font-bold text-slate-800">₹{Math.round(paidInfo.final)}</div></div>
                          <div className="text-center"><div className="text-[8px] font-bold uppercase text-gray-400">Paid</div><div className="font-bold text-emerald-700">₹{Math.round(paidInfo.paid)}</div></div>
                          <div className="text-center"><div className="text-[8px] font-bold uppercase text-gray-400">Due</div><div className={`font-bold ${paidInfo.balance > 0 ? "text-red-600" : "text-gray-400"}`}>₹{Math.round(paidInfo.balance)}</div></div>
                          <div className="text-center"><div className="text-[8px] font-bold uppercase text-gray-400">Disc.</div><div className={`font-bold ${discountAmount > 0 ? "text-red-600" : "text-gray-400"}`}>{discountAmount > 0 ? `−₹${Math.round(discountAmount)}` : "—"}</div></div>
                        </div>

                        <div className="flex items-center justify-center gap-1.5 pt-2 border-t border-gray-100 flex-wrap">
                          <button onClick={(e) => { e.stopPropagation(); handleRowClick(patient); }} className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-[10px] font-bold"><FiEye className="w-3.5 h-3.5" /> View</button>
                          <button onClick={(e) => { e.stopPropagation(); handleEdit(patient, matchingBooking); }} className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-[10px] font-bold"><FiEdit2 className="w-3.5 h-3.5" /> Edit</button>
                          {matchingBooking && (
                            <>
                              <button onClick={(e) => { e.stopPropagation(); openPrescriptionModal(matchingBooking); }} className="flex items-center gap-1 px-2.5 py-1.5 bg-teal-50 text-teal-600 hover:bg-teal-100 rounded-lg text-[10px] font-bold"><FaPrescription className="w-3.5 h-3.5" /> Rx</button>
                              <button onClick={(e) => { e.stopPropagation(); openBillingModal(matchingBooking); }} disabled={invoiceLoading === matchingBooking._id} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold ${matchingBooking?.invoiceUrl ? "bg-blue-100 text-blue-700" : "bg-emerald-50 text-emerald-600"} disabled:opacity-50`}>
                                {invoiceLoading === matchingBooking._id ? <FiRefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FaFileInvoiceDollar className="w-3.5 h-3.5" />} {matchingBooking?.invoiceUrl ? "Invoice" : "Bill"}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t bg-gray-50/30">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Show</span>
                    <select value={itemsPerPage} onChange={handleItemsPerPageChange} className="p-1 border rounded-md bg-white">
                      <option value={5}>5</option><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option>
                    </select>
                    <span>entries</span>
                  </div>
                  <div className="text-xs text-gray-500">Showing <strong>{filteredPatients.length === 0 ? 0 : indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredPatients.length)}</strong> of <strong>{filteredPatients.length}</strong></div>
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

        {/* INVOICE PDF VIEWER MODAL */}
        {showInvoiceModal && invoiceModalUrl && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl border flex flex-col max-h-[95vh]">
              <div className="flex items-center justify-between px-6 py-4 border-b bg-white rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center"><FaFileInvoiceDollar /></div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Invoice Preview</h3>
                    <p className="text-xs text-gray-500">{invoiceModalBooking?.patientTitle} {invoiceModalBooking?.patientName} • {invoiceModalBooking?.patientPhone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => window.open(invoiceModalUrl, "_blank")} className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"><FaExternalLinkAlt className="w-3 h-3" /> Open</button>
                  <button onClick={() => { const a = document.createElement("a"); a.href = invoiceModalUrl; a.download = `invoice-${invoiceModalBooking?._id || "download"}.pdf`; a.target = "_blank"; document.body.appendChild(a); a.click(); document.body.removeChild(a); }} className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"><FaDownload className="w-3 h-3" /> Download</button>
                  <button onClick={() => handleSendInvoice(invoiceModalBooking)} disabled={invoiceSending === invoiceModalBooking?._id} className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50">
                    {invoiceSending === invoiceModalBooking?._id ? (<FiRefreshCw className="w-3 h-3 animate-spin" />) : (<FaWhatsapp className="w-3 h-3" />)}
                    {invoiceSending === invoiceModalBooking?._id ? "Sending..." : "Send Invoice"}
                  </button>
                  <button onClick={() => { const iframe = document.getElementById("invoice-pdf-iframe"); if (iframe) iframe.contentWindow.print(); }} className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"><FaPrint className="w-3 h-3" /> Print</button>
                  <button onClick={() => { setShowInvoiceModal(false); setInvoiceModalUrl(""); setInvoiceModalBooking(null); }} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"><FaTimes className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="flex-1 overflow-hidden bg-gray-100">
                <iframe id="invoice-pdf-iframe" src={invoiceModalUrl} title="Invoice PDF" className="w-full h-full border-0" style={{ minHeight: "70vh" }} />
              </div>
              <div className="flex justify-end gap-3 px-6 py-3 border-t bg-gray-50/50 rounded-b-2xl">
                <button onClick={() => { setShowInvoiceModal(false); setInvoiceModalUrl(""); setInvoiceModalBooking(null); }} className="px-5 py-2 rounded-lg text-xs font-bold bg-gray-200 hover:bg-gray-300 text-gray-700">Close</button>
              </div>
            </div>
          </div>
        )}

        {/* FILTER CALCULATION POPUP */}
        {showCalculationPopup && calculationData && !userClosedCalcPopup && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[99999] flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl border border-gray-200 max-h-[92vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-5 py-4 border-b bg-gradient-to-r from-indigo-50 to-blue-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center"><FaRupeeSign className="w-5 h-5" /></div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base flex items-center gap-2 flex-wrap">
                      Filter Calculation Details
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 uppercase">{timeFilter}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${revenueCategoryFilter === "clinic" ? "bg-blue-100 text-blue-700 border-blue-200" : revenueCategoryFilter === "lab" ? "bg-purple-100 text-purple-700 border-purple-200" : "bg-green-100 text-green-700 border-green-200"}`}>
                        {revenueCategoryFilter} Only
                      </span>
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">{calculationData.bookings.length} bookings with {revenueCategoryFilter} revenue — verification purposes</p>
                  </div>
                </div>
                <button onClick={() => { setShowCalculationPopup(false); setUserClosedCalcPopup(true); }} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"><FaTimes className="w-4 h-4" /></button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 border-b bg-gray-50">
                <div className={`rounded-lg p-2.5 border ${revenueCategoryFilter === "clinic" ? "border-blue-200 bg-blue-50" : revenueCategoryFilter === "lab" ? "border-purple-200 bg-purple-50" : "border-green-200 bg-green-50"}`}>
                  <div className={`text-[9px] font-bold uppercase ${revenueCategoryFilter === "clinic" ? "text-blue-700" : revenueCategoryFilter === "lab" ? "text-purple-700" : "text-green-700"}`}>Cash</div>
                  <div className={`text-sm font-extrabold ${revenueCategoryFilter === "clinic" ? "text-blue-800" : revenueCategoryFilter === "lab" ? "text-purple-800" : "text-green-800"}`}>{fmt(calculationData.cash)}</div>
                </div>
                <div className={`rounded-lg p-2.5 border ${revenueCategoryFilter === "clinic" ? "border-blue-200 bg-blue-50" : revenueCategoryFilter === "lab" ? "border-purple-200 bg-purple-50" : "border-green-200 bg-green-50"}`}>
                  <div className={`text-[9px] font-bold uppercase ${revenueCategoryFilter === "clinic" ? "text-blue-700" : revenueCategoryFilter === "lab" ? "text-purple-700" : "text-green-700"}`}>Online</div>
                  <div className={`text-sm font-extrabold ${revenueCategoryFilter === "clinic" ? "text-blue-800" : revenueCategoryFilter === "lab" ? "text-purple-800" : "text-green-800"}`}>{fmt(calculationData.online)}</div>
                </div>
                <div className="rounded-lg p-2.5 border border-red-200 bg-red-50">
                  <div className="text-[9px] font-bold text-red-700 uppercase">Due</div>
                  <div className="text-sm font-extrabold text-red-800">{fmt(calculationData.totalDue)}</div>
                </div>
                <div className={`rounded-lg p-2.5 border-2 ${revenueCategoryFilter === "clinic" ? "border-blue-400 bg-blue-100" : revenueCategoryFilter === "lab" ? "border-purple-400 bg-purple-100" : "border-green-400 bg-green-100"}`}>
                  <div className={`text-[9px] font-bold uppercase ${revenueCategoryFilter === "clinic" ? "text-blue-800" : revenueCategoryFilter === "lab" ? "text-purple-800" : "text-green-800"}`}>Total ({revenueCategoryFilter})</div>
                  <div className={`text-sm font-extrabold ${revenueCategoryFilter === "clinic" ? "text-blue-900" : revenueCategoryFilter === "lab" ? "text-purple-900" : "text-green-900"}`}>{fmt(calculationData.total)}</div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-100 sticky top-0 z-10">
                    <tr>
                      <th className="px-3 py-2 text-left font-bold text-gray-600" style={{ width: "40px" }}>#</th>
                      <th className="px-3 py-2 text-left font-bold text-gray-600">Patient</th>
                      <th className="px-3 py-2 text-left font-bold text-gray-600">Doctor</th>
                      <th className="px-3 py-2 text-left font-bold text-gray-600">Date</th>
                      <th className="px-3 py-2 text-right font-bold text-blue-700">Clinic</th>
                      <th className="px-3 py-2 text-right font-bold text-purple-700">Lab</th>
                      <th className="px-3 py-2 text-right font-bold text-green-700">Pharmacy</th>
                      <th className="px-3 py-2 text-right font-bold text-indigo-700 bg-indigo-50">{revenueCategoryFilter.toUpperCase()}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculationData.bookings.map((d, i) => (
                      <tr key={d.bookingId || i} className="border-b border-gray-100 hover:bg-blue-50/30">
                        <td className="px-3 py-2 text-gray-500 font-semibold">{i + 1}</td>
                        <td className="px-3 py-2">
                          <div className="font-semibold text-gray-800 truncate max-w-[140px]">{d.patientName}</div>
                          <div className="text-[10px] text-gray-400">{d.patientPhone}</div>
                        </td>
                        <td className="px-3 py-2 text-gray-600 truncate max-w-[120px]">{d.doctorName || "N/A"}</td>
                        <td className="px-3 py-2 text-gray-500">{formatDateToDDMMYYYY(d.date)}</td>
                        <td className={`px-3 py-2 text-right font-bold ${revenueCategoryFilter === "clinic" ? "text-blue-700 bg-blue-50/50" : "text-gray-400"}`}>₹{Math.round(d.clinic)}</td>
                        <td className={`px-3 py-2 text-right font-bold ${revenueCategoryFilter === "lab" ? "text-purple-700 bg-purple-50/50" : "text-gray-400"}`}>₹{Math.round(d.lab)}</td>
                        <td className={`px-3 py-2 text-right font-bold ${revenueCategoryFilter === "pharmacy" ? "text-green-700 bg-green-50/50" : "text-gray-400"}`}>₹{Math.round(d.pharmacy)}</td>
                        <td className="px-3 py-2 text-right font-extrabold text-indigo-800 bg-indigo-50/50">₹{Math.round(d.categoryAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center gap-3 px-5 py-3 border-t bg-gray-50">
                <div className="text-[11px] text-gray-500">💡 This popup shows the manual calculation breakdown. Use it to verify against backend response.</div>
                <button onClick={() => { setShowCalculationPopup(false); setUserClosedCalcPopup(true); }} className="px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white">Got it, Close</button>
              </div>
            </div>
          </div>
        )}

        {/* PATIENT MODAL */}
        {showPatientModal && selectedPatient && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border">
              <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center"><FaUserInjured /></div>
                  <div><h3 className="font-bold text-gray-900 text-base">Patient Profile & Appointments</h3><p className="text-xs text-gray-500">{selectedPatient.title} {selectedPatient.name} • {selectedPatient.phone}</p></div>
                </div>
                <button onClick={() => { setShowPatientModal(false); setPatientBookings([]); setSelectedPatient(null); }} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"><FaTimes /></button>
              </div>
              <div className="p-6 space-y-6">
                {historyLoading ? (
                  <div className="py-12 text-center"><FiRefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" /><p className="text-sm text-gray-500">Loading...</p></div>
                ) : (
                  <>
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-5 rounded-xl border border-purple-100">
                      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-purple-200">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-bold flex items-center justify-center text-2xl">
                          {selectedPatient.name ? selectedPatient.name.charAt(0).toUpperCase() : "P"}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-gray-900 text-lg">{selectedPatient.title} {selectedPatient.name}</div>
                          <div className="text-sm text-gray-600 flex items-center gap-1 mt-0.5"><FaPhoneAlt className="text-[10px]" /> {selectedPatient.phone}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        <div><div className="text-[10px] font-bold uppercase text-gray-400">Age</div><div className="font-semibold mt-0.5">{selectedPatient.age || "N/A"} Yrs</div></div>
                        <div><div className="text-[10px] font-bold uppercase text-gray-400">Gender</div><div className="font-semibold mt-0.5">{selectedPatient.gender || "N/A"}</div></div>
                        <div><div className="text-[10px] font-bold uppercase text-gray-400">City</div><div className="font-semibold mt-0.5">{selectedPatient.city || "N/A"}</div></div>
                        <div><div className="text-[10px] font-bold uppercase text-gray-400">Pincode</div><div className="font-semibold mt-0.5">{selectedPatient.pincode || "N/A"}</div></div>
                        <div className="col-span-2 md:col-span-4"><div className="text-[10px] font-bold uppercase text-gray-400">Address</div><div className="font-semibold mt-0.5">{selectedPatient.address || "N/A"}</div></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-3"><FaCalendarAlt className="text-purple-600" /><h4 className="font-bold text-gray-900 text-sm">Appointment Records ({patientBookings.length})</h4></div>
                      {patientBookings.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-sm bg-gray-50 rounded-xl border">No appointments booked yet.</div>
                      ) : (
                        <div className="space-y-4">
                          {patientBookings.map((booking, bIdx) => {
                            const paidInfo = getBookingPaidInfo(booking);
                            const statusColors = getStatusColors(booking.status);
                            return (
                              <div key={booking._id} className="bg-white border rounded-xl overflow-hidden shadow-sm">
                                <div className={`px-4 py-2.5 ${statusColors.bg} border-b ${statusColors.border} flex items-center justify-between`}>
                                  <div className="flex items-center gap-2.5 flex-wrap">
                                    <span className="font-bold text-gray-500 text-xs">#{bIdx + 1}</span>
                                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${statusColors.text} ${statusColors.bg} ${statusColors.border}`}>{booking.status || "N/A"}</span>
                                    <span className="text-xs text-gray-600">{formatDateToDDMMYYYY(booking.appointmentDate || booking.date)}</span>
                                  </div>
                                </div>
                                <div className="p-4 space-y-2 text-xs">
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div><div className="text-[10px] font-bold uppercase text-gray-400">Doctor</div><div className="font-bold">{booking.doctorName || "N/A"}</div></div>
                                    <div><div className="text-[10px] font-bold uppercase text-gray-400">Purpose</div><div className="font-bold">{booking.purpose || "N/A"}</div></div>
                                    <div><div className="text-[10px] font-bold uppercase text-gray-400">Total Fee</div><div className="font-extrabold text-slate-800">₹{Math.round(paidInfo.final)}</div></div>
                                    <div><div className="text-[10px] font-bold uppercase text-gray-400">Paid</div><div className="font-extrabold text-emerald-700">₹{Math.round(paidInfo.paid)}</div></div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
              <div className="flex justify-end px-6 py-4 border-t bg-gray-50/50 sticky bottom-0">
                <button onClick={() => { setShowPatientModal(false); setPatientBookings([]); setSelectedPatient(null); }} className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-200 hover:bg-gray-300">Close</button>
              </div>
            </div>
          </div>
        )}

        {/* PARTIAL PAYMENT MODAL — Category-specific */}
        {showPartialModal && partialBooking && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border relative">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl text-white flex items-center justify-center ${partialCategory === "clinic" ? "bg-blue-500" : partialCategory === "lab" ? "bg-purple-500" : partialCategory === "pharmacy" ? "bg-green-500" : "bg-amber-500"}`}>
                    {partialCategory === "clinic" ? <FaClinicMedical className="w-5 h-5" /> : partialCategory === "lab" ? <FaFlask className="w-5 h-5" /> : partialCategory === "pharmacy" ? <FaPills className="w-5 h-5" /> : <FaClock className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">
                      {partialCategory ? `${partialCategory.charAt(0).toUpperCase() + partialCategory.slice(1)} Payment` : "Update Payment"}
                    </h3>
                    <p className="text-xs text-gray-500">{partialBooking.patientName} • {partialBooking.patientPhone}</p>
                  </div>
                </div>
                <button onClick={() => { setShowPartialModal(false); setPartialBooking(null); setPartialCategory(null); }} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"><FaTimes className="w-4 h-4" /></button>
              </div>

              {(() => {
                const bd = getAmountBreakdown(partialBooking);
                const existing = partialBooking.categoryPayment || {};
                const wasPaid = partialBooking.paymentStatus === "Paid";

                if (partialCategory) {
                  const catAmt = Number(bd[partialCategory]) || 0;
                  const catPaid = existing?.[partialCategory]?.paidAmount !== undefined
                    ? Number(existing[partialCategory].paidAmount) || 0
                    : wasPaid ? catAmt : 0;
                  const catDue = Math.max(0, catAmt - catPaid);
                  return (
                    <div className="p-6 space-y-4">
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="text-[10px] font-bold uppercase text-gray-400 mb-3">{partialCategory} Summary</div>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between items-center"><span className="text-gray-600">Category Amount</span><span className="font-bold text-gray-900 text-sm">₹{Math.round(catAmt)}</span></div>
                          <div className="flex justify-between items-center"><span className="text-gray-600">Already Paid</span><span className="font-bold text-emerald-700">₹{Math.round(catPaid)}</span></div>
                          <div className="flex justify-between items-center pt-2 border-t-2 border-gray-800"><span className="font-bold text-gray-800">Due Amount</span><span className="font-bold text-red-600 text-lg">₹{Math.round(catDue)}</span></div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><FaMoneyBillWave className="text-purple-600" /> Payment Type</label>
                        <select value={partialPaymentType} onChange={(e) => setPartialPaymentType(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-800">
                          {PAYMENT_TYPE_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                        </select>
                      </div>
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-[11px] text-blue-800">
                          <b>{partialCategory.charAt(0).toUpperCase() + partialCategory.slice(1)}</b> will be marked as Fully Paid (<b>₹{Math.round(catDue)}</b>).
                          <br />
                          <span className="text-emerald-700 font-semibold">✅ Other categories will remain UNCHANGED.</span>
                        </p>
                      </div>
                    </div>
                  );
                }

                const finalPayable = getBookingFinalPayable(partialBooking);
                const paidInfo = getBookingPaidInfo(partialBooking);
                return (
                  <div className="p-6 space-y-4">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="text-[10px] font-bold uppercase text-gray-400 mb-3">Payment Summary</div>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center"><span className="text-gray-600">Total Payable</span><span className="font-bold text-gray-900 text-sm">₹{Math.round(finalPayable)}</span></div>
                        <div className="flex justify-between items-center"><span className="text-gray-600">Already Paid</span><span className="font-bold text-emerald-700">₹{Math.round(paidInfo.paid)}</span></div>
                        <div className="flex justify-between items-center pt-2 border-t-2 border-gray-800"><span className="font-bold text-gray-800">Due Amount</span><span className="font-bold text-red-600 text-lg">₹{Math.round(paidInfo.balance)}</span></div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><FaMoneyBillWave className="text-purple-600" /> Payment Type</label>
                      <select value={partialPaymentType} onChange={(e) => setPartialPaymentType(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-800">
                        {PAYMENT_TYPE_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                      </select>
                    </div>
                  </div>
                );
              })()}

              <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50/50">
                <button onClick={() => { setShowPartialModal(false); setPartialBooking(null); setPartialCategory(null); }} className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-200 hover:bg-gray-300 text-gray-700">Cancel</button>
                <button onClick={handleMarkFullPaid} disabled={savingPartial} className="px-5 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 disabled:opacity-50">
                  {savingPartial ? <FiRefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FaCheckCircle className="w-3.5 h-3.5" />}
                  {savingPartial ? "Saving..." : partialCategory ? `Mark ${partialCategory.charAt(0).toUpperCase() + partialCategory.slice(1)} Paid` : "Mark as Fully Paid"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PAYMENT TYPE EDIT MODAL */}
        {showPaymentTypeEditModal && paymentTypeEditBooking && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[95] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border relative">
              <div className="flex items-center justify-between px-5 py-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-700 text-white flex items-center justify-center"><FaMoneyBillWave className="w-4 h-4" /></div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Change Payment Type</h3>
                    <p className="text-[10px] text-gray-500 truncate">{paymentTypeEditBooking.patientName}</p>
                  </div>
                </div>
                <button onClick={() => { setShowPaymentTypeEditModal(false); setPaymentTypeEditBooking(null); }} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"><FaTimes className="w-4 h-4" /></button>
              </div>
              <div className="p-5 space-y-3">
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider">Select Payment Type</label>
                <select value={paymentTypeEditValue} onChange={(e) => setPaymentTypeEditValue(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-800">
                  {PAYMENT_TYPE_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                </select>
              </div>
              <div className="flex justify-end gap-3 px-5 py-3 border-t bg-gray-50/50 rounded-b-2xl">
                <button onClick={() => { setShowPaymentTypeEditModal(false); setPaymentTypeEditBooking(null); }} className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-200 hover:bg-gray-300 text-gray-700">Cancel</button>
                <button onClick={handleSavePaymentTypeEdit} disabled={savingPaymentTypeEdit} className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-700 hover:bg-slate-800 text-white shadow-sm flex items-center gap-1.5 disabled:opacity-50">
                  {savingPaymentTypeEdit ? <FiRefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FiCheckCircle className="w-3.5 h-3.5" />}
                  {savingPaymentTypeEdit ? "Saving..." : "Update"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MEDICINE TOTAL MODAL */}
        {showMedicineTotalModal && medicineTotalBooking && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border">
              <div className="flex items-center justify-between px-5 py-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-green-500 text-white flex items-center justify-center"><FaPills className="w-4 h-4" /></div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Medicine Total</h3>
                    <p className="text-[10px] text-gray-500">{medicineTotalBooking.patientName}</p>
                  </div>
                </div>
                <button onClick={() => { setShowMedicineTotalModal(false); setMedicineTotalBooking(null); }} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"><FaTimes className="w-4 h-4" /></button>
              </div>
              <div className="p-5 space-y-3">
                <label className="block text-[11px] font-bold text-green-700 uppercase tracking-wider">Total Medicine Amount (₹)</label>
                <input type="number" value={editingMedicineTotal} onChange={(e) => setEditingMedicineTotal(e.target.value)} placeholder="0" min="0" className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm" />
              </div>
              <div className="flex justify-end gap-3 px-5 py-3 border-t bg-gray-50/50 rounded-b-2xl">
                <button onClick={() => { setShowMedicineTotalModal(false); setMedicineTotalBooking(null); }} className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-200 hover:bg-gray-300 text-gray-700">Cancel</button>
                <button onClick={handleSaveMedicineTotal} disabled={savingMedicineTotal} className="px-5 py-2 rounded-lg text-xs font-bold bg-green-600 hover:bg-green-700 text-white shadow-sm flex items-center gap-1.5 disabled:opacity-50">
                  {savingMedicineTotal ? <FiRefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FiCheckCircle className="w-3.5 h-3.5" />}
                  {savingMedicineTotal ? "Saving..." : "Update"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LAB TOTAL MODAL (legacy) */}
        {showLabTotalModal && labTotalBooking && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border">
              <div className="flex items-center justify-between px-5 py-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500 text-white flex items-center justify-center"><FaMicroscope className="w-4 h-4" /></div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Lab Total</h3>
                    <p className="text-[10px] text-gray-500">{labTotalBooking.patientName}</p>
                  </div>
                </div>
                <button onClick={() => { setShowLabTotalModal(false); setLabTotalBooking(null); }} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"><FaTimes className="w-4 h-4" /></button>
              </div>
              <div className="p-5 space-y-3">
                <label className="block text-[11px] font-bold text-purple-700 uppercase tracking-wider">Total Lab Amount (₹)</label>
                <input type="number" value={editingLabTotal} onChange={(e) => setEditingLabTotal(e.target.value)} placeholder="0" min="0" className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm" />
              </div>
              <div className="flex justify-end gap-3 px-5 py-3 border-t bg-gray-50/50 rounded-b-2xl">
                <button onClick={() => { setShowLabTotalModal(false); setLabTotalBooking(null); }} className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-200 hover:bg-gray-300 text-gray-700">Cancel</button>
                <button onClick={handleSaveLabTotal} disabled={savingLabTotal} className="px-5 py-2 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm flex items-center gap-1.5 disabled:opacity-50">
                  {savingLabTotal ? <FiRefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FiCheckCircle className="w-3.5 h-3.5" />}
                  {savingLabTotal ? "Saving..." : "Update"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LAB ITEMS MODAL */}
        {showLabItemsModal && labItemsBooking && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border relative max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-5 py-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500 text-white flex items-center justify-center"><FaFlask className="w-4 h-4" /></div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Lab Items</h3>
                    <p className="text-[10px] text-gray-500">{labItemsBooking.patientTitle} {labItemsBooking.patientName}</p>
                  </div>
                </div>
                <button onClick={() => { setShowLabItemsModal(false); setLabItemsBooking(null); setLabItemsList([]); }} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"><FaTimes className="w-4 h-4" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Lab Amounts ({labItemsList.length})</label>
                    {labItemsList.length > 0 && (<span className="text-[11px] font-extrabold text-purple-700">Total: ₹{labItemsList.reduce((s, x) => s + (Number(x.price) || 0), 0)}</span>)}
                  </div>
                  {labItemsList.length === 0 ? (
                    <div className="text-center py-4 text-[11px] text-gray-400 bg-gray-50 rounded-lg border border-dashed">No amounts added yet</div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {labItemsList.map((item, i) => (
                        <div key={`${item.serviceId}-${i}`} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs bg-purple-50 border border-purple-200">
                          <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">{i + 1}</span>
                          <span className="text-gray-500 font-semibold text-[10px] whitespace-nowrap">Amount (₹):</span>
                          <input type="number" value={item.price} onChange={(e) => handleUpdateLabItemPrice(i, e.target.value)} className="flex-1 px-2 py-1 text-xs font-bold text-purple-700 border border-gray-300 rounded" min="0" />
                          <button type="button" onClick={() => handleRemoveLabItem(i)} className="text-red-400 hover:text-red-600 p-1"><FaMinusCircle className="w-3.5 h-3.5" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="border rounded-xl p-3 bg-gray-50 border-gray-200">
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Add New Amount</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <input type="number" value={labItemPrice} onChange={(e) => setLabItemPrice(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddLabItem(); } }} placeholder="Enter amount (₹)" className="flex-1 min-w-[180px] bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm" min="0" />
                    <button type="button" onClick={handleAddLabItem} disabled={!labItemPrice.trim()} className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-1 disabled:opacity-50"><FaPlus className="w-3 h-3" /> Add</button>
                  </div>
                </div>
              </div>
              <div className="sticky bottom-0 flex justify-end gap-3 px-5 py-3 border-t bg-gray-50/80 backdrop-blur rounded-b-2xl">
                <button onClick={() => { setShowLabItemsModal(false); setLabItemsBooking(null); setLabItemsList([]); }} className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-200 hover:bg-gray-300 text-gray-700">Cancel</button>
                <button onClick={handleSaveLabItems} disabled={savingLabItems} className="px-5 py-2 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm flex items-center gap-1.5 disabled:opacity-50">
                  {savingLabItems ? (<FiRefreshCw className="w-3.5 h-3.5 animate-spin" />) : (<FiCheckCircle className="w-3.5 h-3.5" />)}
                  {savingLabItems ? "Saving..." : `Save Lab (${labItemsList.length})`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PHARMACY ITEMS MODAL */}
        {showPharmacyItemsModal && pharmacyItemsBooking && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border relative max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-5 py-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-green-500 text-white flex items-center justify-center"><FaPills className="w-4 h-4" /></div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Pharmacy Items</h3>
                    <p className="text-[10px] text-gray-500">{pharmacyItemsBooking.patientTitle} {pharmacyItemsBooking.patientName}</p>
                  </div>
                </div>
                <button onClick={() => { setShowPharmacyItemsModal(false); setPharmacyItemsBooking(null); setPharmacyItemsList([]); }} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"><FaTimes className="w-4 h-4" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Medicine Amounts ({pharmacyItemsList.length})</label>
                    {pharmacyItemsList.length > 0 && (<span className="text-[11px] font-extrabold text-green-700">Total: ₹{pharmacyItemsList.reduce((s, x) => s + (Number(x.price) || 0), 0)}</span>)}
                  </div>
                  {pharmacyItemsList.length === 0 ? (
                    <div className="text-center py-4 text-[11px] text-gray-400 bg-gray-50 rounded-lg border border-dashed">No amounts added yet</div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {pharmacyItemsList.map((item, i) => (
                        <div key={`${item.serviceId}-${i}`} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs bg-green-50 border border-green-200">
                          <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">{i + 1}</span>
                          <span className="text-gray-500 font-semibold text-[10px] whitespace-nowrap">Amount (₹):</span>
                          <input type="number" value={item.price} onChange={(e) => handleUpdatePharmacyItemPrice(i, e.target.value)} className="flex-1 px-2 py-1 text-xs font-bold text-green-700 border border-gray-300 rounded" min="0" />
                          <button type="button" onClick={() => handleRemovePharmacyItem(i)} className="text-red-400 hover:text-red-600 p-1"><FaMinusCircle className="w-3.5 h-3.5" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="border rounded-xl p-3 bg-gray-50 border-gray-200">
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Add New Amount</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <input type="number" value={pharmacyItemPrice} onChange={(e) => setPharmacyItemPrice(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddPharmacyItem(); } }} placeholder="Enter amount (₹)" className="flex-1 min-w-[180px] bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm" min="0" />
                    <button type="button" onClick={handleAddPharmacyItem} disabled={!pharmacyItemPrice.trim()} className="px-4 py-2 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-1 disabled:opacity-50"><FaPlus className="w-3 h-3" /> Add</button>
                  </div>
                </div>
              </div>
              <div className="sticky bottom-0 flex justify-end gap-3 px-5 py-3 border-t bg-gray-50/80 backdrop-blur rounded-b-2xl">
                <button onClick={() => { setShowPharmacyItemsModal(false); setPharmacyItemsBooking(null); setPharmacyItemsList([]); }} className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-200 hover:bg-gray-300 text-gray-700">Cancel</button>
                <button onClick={handleSavePharmacyItems} disabled={savingPharmacyItems} className="px-5 py-2 rounded-lg text-xs font-bold bg-green-600 hover:bg-green-700 text-white shadow-sm flex items-center gap-1.5 disabled:opacity-50">
                  {savingPharmacyItems ? (<FiRefreshCw className="w-3.5 h-3.5 animate-spin" />) : (<FiCheckCircle className="w-3.5 h-3.5" />)}
                  {savingPharmacyItems ? "Saving..." : `Save Pharmacy (${pharmacyItemsList.length})`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CLINIC SERVICES POPUP */}
        {showClinicServicesModal && clinicServicesBooking && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border relative max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-5 py-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500 text-white flex items-center justify-center"><FaClinicMedical className="w-4 h-4" /></div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Clinic Services</h3>
                    <p className="text-[10px] text-gray-500">{clinicServicesBooking.patientTitle} {clinicServicesBooking.patientName}</p>
                  </div>
                </div>
                <button onClick={() => { setShowClinicServicesModal(false); setClinicServicesBooking(null); setClinicServicesList([]); }} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"><FaTimes className="w-4 h-4" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Services ({clinicServicesList.length})</label>
                    {clinicServicesList.length > 0 && (<span className="text-[11px] font-extrabold text-blue-700">Total: ₹{clinicServicesList.reduce((s, x) => s + (Number(x.price) || 0), 0)}</span>)}
                  </div>
                  {clinicServicesList.length === 0 ? (
                    <div className="text-center py-4 text-[11px] text-gray-400 bg-gray-50 rounded-lg border border-dashed">No services yet</div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {clinicServicesList.map((svc, i) => (
                        <div key={`${svc.serviceId}-${i}`} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs bg-blue-50 border border-blue-200">
                          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">{i + 1}</span>
                          <div className="flex-1 min-w-0"><div className="font-semibold text-gray-800 truncate">{svc.name}</div></div>
                          <input type="number" value={svc.price} onChange={(e) => handleUpdateClinicServicePrice(i, e.target.value)} className="w-20 px-2 py-1 text-xs font-bold text-emerald-700 border border-gray-300 rounded" min="0" />
                          <button type="button" onClick={() => handleRemoveClinicServiceItem(i)} className="text-red-400 hover:text-red-600 p-1"><FaMinusCircle className="w-3.5 h-3.5" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="border rounded-xl p-3 bg-gray-50 border-gray-200">
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Add New Service</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex-1 min-w-[180px] relative">
                      <input type="text" value={clinicServiceInput} onChange={(e) => {
                        const v = e.target.value;
                        setClinicServiceInput(v);
                        if (v.trim()) {
                          const filtered = services.filter((s) => s.name.toLowerCase().includes(v.toLowerCase()));
                          setClinicServiceSuggestions(filtered);
                          setShowClinicServiceSuggestions(true);
                        } else { setClinicServiceSuggestions([]); setShowClinicServiceSuggestions(false); }
                      }} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddCustomClinicService(); } }} placeholder="Search or type service name..." className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                      {showClinicServiceSuggestions && clinicServiceSuggestions.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-40 overflow-y-auto z-50">
                          {clinicServiceSuggestions.map((svc) => (
                            <button key={svc._id} type="button" onMouseDown={(e) => { e.preventDefault(); handleAddClinicServiceItem(svc); }} className="w-full px-3 py-2 text-left text-xs hover:bg-blue-50 flex items-center justify-between border-b border-gray-100 last:border-0">
                              <span className="font-semibold text-gray-800">{svc.name}</span>
                              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">₹{svc.price}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <input type="number" value={clinicServicePrice} onChange={(e) => setClinicServicePrice(e.target.value)} placeholder="Price" className="w-24 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm" min="0" />
                    <button type="button" onClick={handleAddCustomClinicService} disabled={!clinicServiceInput.trim()} className="px-3 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1 disabled:opacity-50"><FaPlus className="w-3 h-3" /> Add</button>
                  </div>
                </div>
              </div>
              <div className="sticky bottom-0 flex justify-end gap-3 px-5 py-3 border-t bg-gray-50/80 backdrop-blur rounded-b-2xl">
                <button onClick={() => { setShowClinicServicesModal(false); setClinicServicesBooking(null); setClinicServicesList([]); }} className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-200 hover:bg-gray-300 text-gray-700">Cancel</button>
                <button onClick={handleSaveClinicServices} disabled={savingClinicServices} className="px-5 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-1.5 disabled:opacity-50">
                  {savingClinicServices ? (<FiRefreshCw className="w-3.5 h-3.5 animate-spin" />) : (<FiCheckCircle className="w-3.5 h-3.5" />)}
                  {savingClinicServices ? "Saving..." : `Save Services (${clinicServicesList.length})`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VITALS MODAL */}
        {showVitalsModal && vitalsBooking && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border">
              <div className="flex items-center justify-between px-5 py-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-pink-500 text-white flex items-center justify-center"><FaHeartbeat className="w-4 h-4" /></div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Vitals</h3>
                    <p className="text-[10px] text-gray-500">{vitalsBooking.patientName}</p>
                  </div>
                </div>
                <button onClick={() => { setShowVitalsModal(false); setVitalsBooking(null); setVitalsData({ temp: "", bp: "", pr: "", weight: "" }); }} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"><FaTimes className="w-4 h-4" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div><label className="block text-[11px] font-bold text-pink-700 uppercase tracking-wider mb-1">Temp (°F)</label><input type="text" value={vitalsData.temp} onChange={(e) => setVitalsData((prev) => ({ ...prev, temp: e.target.value }))} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm" /></div>
                <div><label className="block text-[11px] font-bold text-pink-700 uppercase tracking-wider mb-1">BP (mmHg)</label><input type="text" value={vitalsData.bp} onChange={(e) => setVitalsData((prev) => ({ ...prev, bp: e.target.value }))} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm" /></div>
                <div><label className="block text-[11px] font-bold text-pink-700 uppercase tracking-wider mb-1">PR (bpm)</label><input type="text" value={vitalsData.pr} onChange={(e) => setVitalsData((prev) => ({ ...prev, pr: e.target.value }))} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm" /></div>
                <div><label className="block text-[11px] font-bold text-pink-700 uppercase tracking-wider mb-1">Weight (kg)</label><input type="text" value={vitalsData.weight} onChange={(e) => setVitalsData((prev) => ({ ...prev, weight: e.target.value }))} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm" /></div>
              </div>
              <div className="flex justify-end gap-3 px-5 py-3 border-t bg-gray-50/50 rounded-b-2xl">
                <button onClick={() => { setShowVitalsModal(false); setVitalsBooking(null); setVitalsData({ temp: "", bp: "", pr: "", weight: "" }); }} className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-200 hover:bg-gray-300 text-gray-700">Cancel</button>
                <button onClick={handleSaveVitals} disabled={savingVitals} className="px-5 py-2 rounded-lg text-xs font-bold bg-pink-600 hover:bg-pink-700 text-white shadow-sm flex items-center gap-1.5 disabled:opacity-50">
                  {savingVitals ? <FiRefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FiCheckCircle className="w-3.5 h-3.5" />}
                  {savingVitals ? "Saving..." : "Save Vitals"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* BOOKING STATUS UPDATE MODAL */}
        {showStatusModal && statusModalBooking && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border relative overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                    <FaCheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Update Booking Status</h3>
                    <p className="text-[10px] text-gray-500 truncate max-w-[180px]">
                      {statusModalBooking.patientTitle} {statusModalBooking.patientName}
                    </p>
                  </div>
                </div>
                <button onClick={() => { setShowStatusModal(false); setStatusModalBooking(null); }} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-white/50 transition-colors">
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
                <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-2">Select New Status</label>
                {BOOKING_STATUS_OPTIONS.map((st) => {
                  const isActive_ = st.value === statusModalBooking.status;
                  const colors = getStatusColors(st.value);
                  return (
                    <button key={st.value} onClick={async (e) => {
                      e.stopPropagation();
                      await handleStatusSelect(statusModalBooking, st.value, e);
                      setShowStatusModal(false);
                      setStatusModalBooking(null);
                    }} className={`w-full px-4 py-3 rounded-xl text-left text-sm font-bold flex items-center justify-between border transition-all ${isActive_ ? `${colors.bg} ${colors.text} ${colors.border} ring-2 ring-blue-500/20` : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300"}`}>
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${colors.bg} border ${colors.border}`}></span>
                        {st.label}
                      </div>
                      {isActive_ && <FaCheck className="w-4 h-4 text-emerald-500" />}
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-end px-5 py-3 border-t bg-gray-50/50">
                <button onClick={() => { setShowStatusModal(false); setStatusModalBooking(null); }} className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* REVIEW MODAL */}
        {showReviewModal && reviewBooking && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border relative max-h-[92vh] overflow-y-auto">
              <div className="sticky top-0 bg-white z-20 flex items-center justify-between px-6 py-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center"><FaStar className="w-5 h-5" /></div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Patient Review</h3>
                    <p className="text-xs text-gray-500">{reviewBooking.patientName} • {reviewBooking.patientPhone}</p>
                  </div>
                </div>
                <button onClick={() => { setShowReviewModal(false); setReviewBooking(null); }} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"><FaTimes className="w-4 h-4" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="text-[10px] font-bold uppercase text-gray-400 mb-3">Appointment Details</div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center"><span className="text-gray-600">Doctor</span><span className="font-bold text-gray-900">{reviewBooking.doctorName || "N/A"}</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-600">Appointment Date</span><span className="font-bold text-gray-900">{formatDateToDDMMYYYY(reviewBooking.appointmentDate || reviewBooking.date)}</span></div>
                  </div>
                </div>
                <div className="border rounded-xl p-4 bg-blue-50/30 border-blue-200">
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <input type="text" value={reviewServiceInput} onChange={(e) => handleReviewServiceInputChange(e.target.value)} placeholder="Search or type service name..." className="flex-1 min-w-[200px] bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm" />
                    <button type="button" onClick={handleAddCustomReviewService} disabled={!reviewServiceInput.trim()} className="px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 rounded-lg flex items-center gap-1 disabled:opacity-50"><FaPlus className="w-3 h-3" /> Add</button>
                  </div>
                  {reviewServices.length > 0 && (
                    <div className="space-y-2 mt-3">
                      {reviewServices.map((svc, i) => (
                        <div key={`new-${i}`} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs bg-white border border-blue-200">
                          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
                          <span className="flex-1 font-semibold text-gray-800">{svc.name}</span>
                          <input type="number" value={svc.price} onChange={(e) => handleUpdateReviewServicePrice(i, e.target.value)} className="w-20 px-2 py-1 text-xs font-bold text-emerald-700 border border-gray-300 rounded" min="0" />
                          <button type="button" onClick={() => handleRemoveReviewService(i)} className="text-red-400 hover:text-red-600 p-1"><FaMinusCircle className="w-3.5 h-3.5" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="sticky bottom-0 flex justify-end gap-3 px-6 py-4 border-t bg-gray-50/80 backdrop-blur">
                <button onClick={() => { setShowReviewModal(false); setReviewBooking(null); setReviewServices([]); }} className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-200 hover:bg-gray-300 text-gray-700">Cancel</button>
                <button onClick={handleSaveReview} disabled={savingReview || reviewServices.length === 0} className="px-5 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 disabled:opacity-50">
                  {savingReview ? (<FiRefreshCw className="w-3.5 h-3.5 animate-spin" />) : (<FaCheckCircle className="w-3.5 h-3.5" />)}
                  {savingReview ? "Saving..." : `Save Review (${reviewServices.length})`}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}