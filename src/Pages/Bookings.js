import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import { useNavigate } from "react-router-dom";
import {
  FaSearch, FaCalendarAlt, FaUserMd, FaStethoscope, FaTimes, FaPhoneAlt,
  FaMapMarkerAlt, FaRupeeSign, FaCreditCard, FaMoneyBillWave, FaPrint,
  FaCheckCircle, FaFileInvoiceDollar, FaUserInjured, FaPlus, FaEye, FaCheck,
  FaCalendarCheck, FaUserFriends, FaToggleOn, FaToggleOff, FaClock,
  FaFileMedical, FaClipboardList, FaVideo, FaWhatsapp, FaDownload, FaSave,
  FaFilePdf, FaFileImage, FaCalendarPlus, FaArrowRight, FaHistory, FaReceipt,
  FaPrescription, FaHeartbeat, FaStar, FaTimesCircle,
} from "react-icons/fa";
import {
  FiUsers, FiUserCheck, FiClock, FiFilter, FiDownload, FiTrash2, FiPlus,
  FiEdit2, FiEye, FiRefreshCw, FiCheckCircle, FiXCircle, FiCalendar,
  FiPlusCircle, FiChevronDown, FiAlertCircle, FiFileText, FiPaperclip,
  FiVideo, FiPrinter,
} from "react-icons/fi";
import "./EmployeeDashboard.css";
import "./EmployeeLeaves.css";
import logo from "../Images/Timelyhealth logo.png";
import prescriptionTemplate from "../Images/prescription.jpg";
import prescriptionBackTemplate from "../Images/prescriptionbackside.jpg";

const PAYMENT_STATUS_OPTIONS = [
  { value: "Pending", label: "Pending" },
  { value: "Paid", label: "Paid" },
  { value: "Partial", label: "Partial" },
  { value: "Due", label: "Due" },
];

const BOOKING_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "consulting", label: "Consulting" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const CLINIC_INFO = {
  name: "TimelyHealth",
  address:
    "Flat No: 301, 3rd Floor, Sri Sai Balaji Avenue, H. No: 1-98/9/25/p, Opp Style on Studio, VIP Hills, near Bank of Baroda, Arunodaya Colony, Sri Sai Nagar, Madhapur, Hyderabad, Telangana 500081",
  contact: "9505397000",
};

const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");
const REVIEW_WINDOW_DAYS = 3;

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

const getStatusColors = (status) => {
  const statusMap = {
    booked: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
    completed: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
    consulting: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
    cancelled: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
    pending: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" },
    confirmed: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  };
  return statusMap[status?.toLowerCase()] || statusMap.booked;
};

const isOnlineBooking = (b) => {
  if (!b) return false;
  if (b.isOnline === true) return true;
  if (b.isOnline === "true") return true;
  if (b.bookingType === "Online") return true;
  return false;
};

const isRescheduled = (b) => {
  return (
    b &&
    ((b.rescheduleCount && b.rescheduleCount > 0) ||
      (b.rescheduleHistory && b.rescheduleHistory.length > 0))
  );
};

const getFileNameFromPath = (path) => {
  if (!path) return "File";
  return path.split("/").pop() || "File";
};

const getFileUrl = (path) => {
  if (!path) return "#";
  if (path.startsWith("http")) return path;
  return `${API_ORIGIN}${path}`;
};

const getFileType = (path) => {
  if (!path) return "unknown";
  const lower = path.toLowerCase();
  if (lower.endsWith(".pdf")) return "pdf";
  if (lower.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/)) return "image";
  return "other";
};

const buildWhatsAppNumber = (phone) => {
  if (!phone) return "";
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  return digits;
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

  return convert(num) + " Rupees Only";
};

const getReviewWindowStatus = (booking) => {
  if (!booking) return { canReview: false, daysLeft: 0, expired: true, isReviewed: false };

  const appointmentDateStr = booking.appointmentDate || booking.date;
  if (!appointmentDateStr) return { canReview: false, daysLeft: 0, expired: true, isReviewed: false };

  const appointmentDate = new Date(appointmentDateStr);
  if (isNaN(appointmentDate.getTime())) return { canReview: false, daysLeft: 0, expired: true, isReviewed: false };

  appointmentDate.setHours(23, 59, 59, 999);
  const today = new Date();
  const diffMs = today - appointmentDate;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const daysLeft = REVIEW_WINDOW_DAYS - diffDays;
  const canReview = diffDays >= 0 && diffDays <= REVIEW_WINDOW_DAYS;
  const expired = diffDays > REVIEW_WINDOW_DAYS;

  return {
    canReview,
    daysLeft: Math.max(0, daysLeft),
    expired,
    isReviewed: booking.isReviewed === true,
  };
};

export default function Bookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [allSlots, setAllSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);

  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState(null);
  const [selectedBookingForService, setSelectedBookingForService] = useState(null);

  const [showStatusUpdateModal, setShowStatusUpdateModal] = useState(false);
  const [selectedBookingForStatus, setSelectedBookingForStatus] = useState(null);
  const [newBookingStatus, setNewBookingStatus] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(false);

  const [showPaymentUpdateModal, setShowPaymentUpdateModal] = useState(false);
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState(null);
  const [newPaymentStatus, setNewPaymentStatus] = useState("");
  const [paymentUpdating, setPaymentUpdating] = useState(false);

  const [openPaymentDropdown, setOpenPaymentDropdown] = useState(null);
  const [openStatusDropdown, setOpenStatusDropdown] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [doctorFilter, setDoctorFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [activeCardFilter, setActiveCardFilter] = useState("all");

  const [toast, setToast] = useState(null);

  const [previewFile, setPreviewFile] = useState(null);
  const [fileListModal, setFileListModal] = useState(null);

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBookingForView, setSelectedBookingForView] = useState(null);

  const [showPaymentSummaryPopup, setShowPaymentSummaryPopup] = useState(false);
  const [selectedBookingForPaymentSummary, setSelectedBookingForPaymentSummary] = useState(null);
  const [markingPaid, setMarkingPaid] = useState(false);

  const [togglingActiveId, setTogglingActiveId] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBookingForEdit, setSelectedBookingForEdit] = useState(null);
  const [editForm, setEditForm] = useState({
    patientTitle: "",
    patientName: "",
    patientAge: "",
    patientGender: "Male",
    patientPhone: "",
    patientEmail: "",
    patientAddress: "",
    patientCity: "",
    patientPincode: "",
    patientDob: "",
    purpose: "",
    symptoms: "",
    paymentType: "cash",
    paymentStatus: "Pending",
    status: "confirmed",
    amountPaid: 0,
    balanceAmount: 0,
    discount: 0,
    isActive: true,
  });
  const [editSaving, setEditSaving] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    const saved = localStorage.getItem("bookings_itemsPerPage");
    return saved ? parseInt(saved, 10) : 10;
  });

  const [showBillingModal, setShowBillingModal] = useState(false);
  const [selectedBookingForBilling, setSelectedBookingForBilling] = useState(null);
  const [billingData, setBillingData] = useState({
    invoiceNo: "",
    invoiceDate: "",
    receiptNo: "",
    receiptDate: "",
    paymentMode: "Cash",
    receivedBy: "Front Desk",
    branch: "",
    doctorName: "",
    items: [],
    grossAmount: 0,
    netAmount: 0,
    paidAmount: 0,
    balanceAmount: 0,
    paymentStatus: "Pending",
    amountInWords: "",
    transactionId: "",
  });

  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [vitalsBooking, setVitalsBooking] = useState(null);
  const [vitalsData, setVitalsData] = useState({ temp: "", bp: "", pr: "", weight: "" });
  const [savingVitals, setSavingVitals] = useState(false);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewBooking, setReviewBooking] = useState(null);
  const [savingReview, setSavingReview] = useState(false);

  const hasActiveFilters =
    searchQuery !== "" ||
    statusFilter !== "All" ||
    doctorFilter !== "All" ||
    fromDate !== "" ||
    toDate !== "" ||
    (selectedMonth && selectedMonth !== "");

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };


    // 🔥 Navigate based on user role (admin → /path, employee → /employee/path)
  const handleRoleBasedNavigate = (path) => {
    const userRole = localStorage.getItem("userRole");
    if (userRole === "employee") {
      const cleanPath = path.startsWith("/") ? path.substring(1) : path;
      navigate(`/employee/${cleanPath}`);
    } else {
      navigate(path);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = () => {
    fetchBookings();
    fetchAllSlots();
    fetchServices();
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".payment-dropdown") && !e.target.closest(".status-dropdown")) {
        setOpenPaymentDropdown(null);
        setOpenStatusDropdown(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/appointment-slots/getallbookings`);

      let bookingsData = [];
      if (res.data && res.data.success) {
        if (res.data.bookings && Array.isArray(res.data.bookings)) {
          bookingsData = res.data.bookings;
        } else if (res.data.data && Array.isArray(res.data.data)) {
          bookingsData = res.data.data;
        } else if (Array.isArray(res.data)) {
          bookingsData = res.data;
        }
      } else if (Array.isArray(res.data)) {
        bookingsData = res.data;
      }

      const onlineBookings = bookingsData.filter(isOnlineBooking);

      const transformedBookings = onlineBookings.map((b) => {
        const slotDetails = b.slotDetails || {};
        return {
          _id: b._id || b.id,
          slotId: b.slotId || b._id,
          patientName: b.patientName || "",
          patientAge: b.patientAge || "",
          patientGender: b.patientGender || "Male",
          patientTitle: b.patientTitle || "",
          patientPhone: b.patientPhone || "",
          patientAddress: b.patientAddress || "",
          patientEmail: b.patientEmail || "",
          patientDob: b.patientDob || "",
          patientCity: b.patientCity || "",
          patientPincode: b.patientPincode || "",
          dayOfWeek: slotDetails.dayOfWeek || b.dayOfWeek || "",
          date: slotDetails.date || b.appointmentDate || b.date || "",
          appointmentDate: b.appointmentDate || slotDetails.date || "",
          startTime: slotDetails.startTime || b.startTime || "",
          endTime: slotDetails.endTime || b.endTime || "",
          doctorId: slotDetails.doctorId || b.doctorId || "",
          doctorName: slotDetails.doctorName || b.doctorName || "",
          doctorSpecialization: slotDetails.doctorSpecialization || b.doctorSpecialization || "",
          purpose: b.purpose || "",
          symptoms: b.symptoms || "",
          appointmentType: b.appointmentType || "Online Consultation",
          priority: b.priority || "Normal",
          consultationFee: b.consultationFee || 0,
          paymentType: b.paymentType || "cash",
          paymentStatus: b.paymentStatus || "Pending",
          paymentTransactionId: b.paymentTransactionId || "",
          transactionId: b.transactionId || "",
          totalAmount: b.totalAmount || 0,
          totalFee: b.totalFee || 0,
          grandTotal: b.grandTotal || 0,
          finalPayable: b.finalPayable || b.finalPayableAmount || 0,
          amountPaid: b.amountPaid || 0,
          balanceAmount: b.balanceAmount || 0,
          discount: b.discount || 0,
          tax: b.tax || 0,
          subtotal: b.subtotal || 0,
          status: b.status || "confirmed",
          services: b.services || [],
          serviceItems: b.serviceItems || [],
          reports: b.reports || [],
          prescriptions: b.prescriptions || [],
          bookingType: b.bookingType || "Online",
          isOnline: true,
          isActive: b.isActive !== undefined ? b.isActive : true,
          clinicId: b.clinicId || "",
          clinicName: b.clinicName || "",
          medicineTotal: b.medicineTotal || 0,
          labTotal: b.labTotal || 0,
          servicesTotal: b.servicesTotal || 0,
          createdAt: b.createdAt || b.bookedAt || new Date().toISOString(),
          updatedAt: b.updatedAt || b.createdAt || new Date().toISOString(),
          bookedAt: b.bookedAt || b.createdAt || new Date().toISOString(),
          shift: b.shift || slotDetails.shift || "Morning Shift",
          isOP: false,
          vitalsTemp: b.vitalsTemp || "",
          vitalsBp: b.vitalsBp || "",
          vitalsPr: b.vitalsPr || "",
          vitalsWeight: b.vitalsWeight || "",
          isReviewed: b.isReviewed === true,
          reviewDate: b.reviewDate || null,
          rescheduleHistory: b.rescheduleHistory || [],
          rescheduledAt: b.rescheduledAt || null,
          rescheduleCount: b.rescheduleCount || 0,
        };
      });

      setBookings(transformedBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllSlots = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/appointment-slots`);
      if (res.data && res.data.success) {
        setAllSlots(res.data.slots || []);
      }
    } catch (error) {
      console.error("Error fetching all slots:", error);
    }
  };

  const fetchServices = async () => {
    setServicesLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/services/allservices`);
      if (res && res.data && res.data.success) {
        setServices(res.data.services || []);
      } else {
        setServices([]);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      setServices([]);
    } finally {
      setServicesLoading(false);
    }
  };

  const getTotalBookingFee = (booking) => {
    if (!booking) return 0;
    return (
      Number(booking.finalPayable) ||
      Number(booking.grandTotal) ||
      Number(booking.totalAmount) ||
      Number(booking.totalFee) ||
      0
    );
  };

  const sendUpdateOP = async (booking, payload) => {
    const res = await axios.put(
      `${API_BASE_URL}/appointment-slots/updateop/${booking._id}`,
      payload
    );
    return res;
  };

  const handleStatusSelect = async (booking, status, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (statusUpdating) return;
    if (status === booking.status) {
      setOpenStatusDropdown(null);
      return;
    }
    setStatusUpdating(true);
    try {
      const res = await sendUpdateOP(booking, {
        status,
        patientName: booking.patientName,
        patientAge: booking.patientAge,
        patientGender: booking.patientGender,
        patientTitle: booking.patientTitle,
        patientPhone: booking.patientPhone,
        patientEmail: booking.patientEmail,
        patientAddress: booking.patientAddress,
        patientCity: booking.patientCity,
        patientPincode: booking.patientPincode,
        patientDob: booking.patientDob,
        purpose: booking.purpose,
        symptoms: booking.symptoms,
        paymentType: booking.paymentType,
        paymentStatus: booking.paymentStatus,
        services: booking.services || [],
        serviceItems: booking.services || [],
        subtotal: booking.subtotal,
        finalPayable: booking.finalPayable || booking.totalAmount,
        finalPayableAmount: booking.finalPayable || booking.totalAmount,
        grandTotal: booking.grandTotal || booking.totalAmount,
        totalAmount: booking.totalAmount,
        amountPaid: booking.amountPaid,
        balanceAmount: booking.balanceAmount,
        discount: booking.discount,
        medicineTotal: booking.medicineTotal,
        labTotal: booking.labTotal,
        appointmentDate: booking.appointmentDate || booking.date,
      });
      if (res && res.data && res.data.success) {
        showToast(`Status updated to ${status}!`, "success");
        setOpenStatusDropdown(null);
        fetchBookings();
      } else {
        showToast(res.data.message || "Failed to update status", "error");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      showToast(error.response?.data?.message || "Failed to update status", "error");
    } finally {
      setStatusUpdating(false);
    }
  };

  const handlePaymentSelect = async (booking, paymentStatus, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (paymentUpdating) return;
    if (paymentStatus === booking.paymentStatus) {
      setOpenPaymentDropdown(null);
      return;
    }
    setPaymentUpdating(true);
    try {
      const totalPayable = getTotalBookingFee(booking);
      const newAmountPaid = paymentStatus === "Paid" ? totalPayable : booking.amountPaid || 0;
      const newBalance = paymentStatus === "Paid" ? 0 : booking.balanceAmount || totalPayable;

      const res = await sendUpdateOP(booking, {
        patientName: booking.patientName,
        patientAge: booking.patientAge,
        patientGender: booking.patientGender,
        patientTitle: booking.patientTitle,
        patientPhone: booking.patientPhone,
        patientEmail: booking.patientEmail,
        patientAddress: booking.patientAddress,
        patientCity: booking.patientCity,
        patientPincode: booking.patientPincode,
        patientDob: booking.patientDob,
        purpose: booking.purpose,
        symptoms: booking.symptoms,
        paymentType: booking.paymentType,
        paymentStatus,
        services: booking.services || [],
        serviceItems: booking.services || [],
        subtotal: booking.subtotal,
        finalPayable: totalPayable,
        finalPayableAmount: totalPayable,
        grandTotal: totalPayable,
        totalAmount: totalPayable,
        amountPaid: newAmountPaid,
        balanceAmount: newBalance,
        discount: booking.discount,
        medicineTotal: booking.medicineTotal,
        labTotal: booking.labTotal,
        status: booking.status,
        appointmentDate: booking.appointmentDate || booking.date,
      });
      if (res && res.data && res.data.success) {
        showToast(`Payment updated to ${paymentStatus}!`, "success");
        setOpenPaymentDropdown(null);
        fetchBookings();
      } else {
        showToast(res.data.message || "Failed to update payment", "error");
      }
    } catch (error) {
      console.error("Error updating payment:", error);
      showToast(error.response?.data?.message || "Failed to update payment", "error");
    } finally {
      setPaymentUpdating(false);
    }
  };

  const handleToggleActive = async (booking) => {
    if (togglingActiveId === booking._id) return;
    setTogglingActiveId(booking._id);
    const newValue = !booking.isActive;
    try {
      const res = await axios.put(
        `${API_BASE_URL}/appointment-slots/toggle-active/${booking._id}`,
        { isActive: newValue }
      );
      if (res && res.data && res.data.success) {
        setBookings((prev) =>
          prev.map((b) => (b._id === booking._id ? { ...b, isActive: newValue } : b))
        );
        showToast(
          res.data.message || `${booking.patientName} marked as ${newValue ? "Active" : "Inactive"}`,
          newValue ? "success" : "info"
        );
      } else {
        showToast(res.data?.message || "Failed to update status", "error");
      }
    } catch (error) {
      console.error("Error toggling active:", error);
      showToast(error.response?.data?.message || "Failed to update status", "error");
    } finally {
      setTogglingActiveId(null);
    }
  };

  const openEditModal = (booking) => {
    setSelectedBookingForEdit(booking);
    setEditForm({
      patientTitle: booking.patientTitle || "Mr.",
      patientName: booking.patientName || "",
      patientAge: booking.patientAge || "",
      patientGender: booking.patientGender || "Male",
      patientPhone: booking.patientPhone || "",
      patientEmail: booking.patientEmail || "",
      patientAddress: booking.patientAddress || "",
      patientCity: booking.patientCity || "",
      patientPincode: booking.patientPincode || "",
      patientDob: booking.patientDob || "",
      purpose: booking.purpose || "",
      symptoms: booking.symptoms || "",
      paymentType: booking.paymentType || "cash",
      paymentStatus: booking.paymentStatus || "Pending",
      status: booking.status || "confirmed",
      amountPaid: booking.amountPaid || 0,
      balanceAmount: booking.balanceAmount || 0,
      discount: booking.discount || 0,
      isActive: booking.isActive !== false,
    });
    setShowEditModal(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveEdit = async () => {
    if (!selectedBookingForEdit) return;
    setEditSaving(true);
    try {
      const totalPayable = getTotalBookingFee(selectedBookingForEdit);
      const paidAmount = Number(editForm.amountPaid) || 0;
      const balance = Math.max(0, totalPayable - paidAmount);

      const res = await sendUpdateOP(selectedBookingForEdit, {
        patientTitle: editForm.patientTitle,
        patientName: editForm.patientName,
        patientAge: editForm.patientAge,
        patientGender: editForm.patientGender,
        patientPhone: editForm.patientPhone,
        patientEmail: editForm.patientEmail,
        patientAddress: editForm.patientAddress,
        patientCity: editForm.patientCity,
        patientPincode: editForm.patientPincode,
        patientDob: editForm.patientDob,
        purpose: editForm.purpose,
        symptoms: editForm.symptoms,
        paymentType: editForm.paymentType,
        paymentStatus: editForm.paymentStatus,
        status: editForm.status,
        services: selectedBookingForEdit.services || [],
        serviceItems: selectedBookingForEdit.services || [],
        subtotal: selectedBookingForEdit.subtotal,
        finalPayable: totalPayable,
        finalPayableAmount: totalPayable,
        grandTotal: totalPayable,
        totalAmount: totalPayable,
        amountPaid: paidAmount,
        balanceAmount: balance,
        discount: Number(editForm.discount) || 0,
        medicineTotal: selectedBookingForEdit.medicineTotal,
        labTotal: selectedBookingForEdit.labTotal,
        isActive: editForm.isActive,
        appointmentDate: selectedBookingForEdit.appointmentDate || selectedBookingForEdit.date,
      });

      if (res && res.data && res.data.success) {
        showToast("Booking updated successfully!", "success");
        setShowEditModal(false);
        setSelectedBookingForEdit(null);
        fetchBookings();
      } else {
        showToast(res.data.message || "Failed to update", "error");
      }
    } catch (error) {
      console.error("Error saving edit:", error);
      showToast(error.response?.data?.message || "Failed to update", "error");
    } finally {
      setEditSaving(false);
    }
  };

  const openFileListModal = (booking, type) => {
    const files = type === "reports" ? booking.reports || [] : booking.prescriptions || [];

    if (files.length === 1) {
      openDirectPreview(files[0]);
      return;
    }

    setFileListModal({
      booking,
      type,
      files,
    });
  };

  const openDirectPreview = (path) => {
    if (!path) {
      showToast("File not available", "error");
      return;
    }
    setPreviewFile({
      url: getFileUrl(path),
      name: getFileNameFromPath(path),
      type: getFileType(path),
    });
  };

  const downloadPreviewFile = async () => {
    if (!previewFile) return;
    try {
      const response = await fetch(previewFile.url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = previewFile.name || "file";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      showToast("File downloaded successfully!", "success");
    } catch (err) {
      console.error("Download failed:", err);
      window.open(previewFile.url, "_blank");
      showToast("Download started in new tab", "info");
    }
  };

  const printPreviewFile = () => {
    if (!previewFile) return;
    const win = window.open("", "_blank", "width=900,height=1000");
    if (!win) {
      showToast("Please allow popups to print", "error");
      return;
    }
    if (previewFile.type === "image") {
      win.document.write(`
        <html>
          <head><title>Print - ${previewFile.name}</title></head>
          <body style="margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#fff;">
            <img src="${previewFile.url}" style="max-width:100%;max-height:100vh;object-fit:contain;" onload="window.print();window.close();" />
          </body>
        </html>
      `);
    } else if (previewFile.type === "pdf") {
      win.document.write(`
        <html>
          <head><title>Print - ${previewFile.name}</title></head>
          <body style="margin:0;">
            <iframe src="${previewFile.url}" style="width:100%;height:100vh;border:0;" onload="setTimeout(()=>{window.print();},500);"></iframe>
          </body>
        </html>
      `);
    } else {
      win.close();
      showToast("This file type cannot be printed", "error");
      return;
    }
    win.document.close();
  };

  const openViewModal = (booking) => {
    setSelectedBookingForView(booking);
    setShowViewModal(true);
  };

  const openPaymentSummaryPopup = (booking) => {
    setSelectedBookingForPaymentSummary(booking);
    setShowPaymentSummaryPopup(true);
    setOpenPaymentDropdown(null);
  };

  const handleMarkAsPaidFromSummary = async () => {
    if (!selectedBookingForPaymentSummary) return;
    setMarkingPaid(true);
    try {
      const totalPayable = getTotalBookingFee(selectedBookingForPaymentSummary);
      const res = await sendUpdateOP(selectedBookingForPaymentSummary, {
        patientName: selectedBookingForPaymentSummary.patientName,
        patientAge: selectedBookingForPaymentSummary.patientAge,
        patientGender: selectedBookingForPaymentSummary.patientGender,
        patientTitle: selectedBookingForPaymentSummary.patientTitle,
        patientPhone: selectedBookingForPaymentSummary.patientPhone,
        patientEmail: selectedBookingForPaymentSummary.patientEmail,
        patientAddress: selectedBookingForPaymentSummary.patientAddress,
        patientCity: selectedBookingForPaymentSummary.patientCity,
        patientPincode: selectedBookingForPaymentSummary.patientPincode,
        patientDob: selectedBookingForPaymentSummary.patientDob,
        purpose: selectedBookingForPaymentSummary.purpose,
        symptoms: selectedBookingForPaymentSummary.symptoms,
        paymentType: selectedBookingForPaymentSummary.paymentType,
        paymentStatus: "Paid",
        services: selectedBookingForPaymentSummary.services || [],
        serviceItems: selectedBookingForPaymentSummary.services || [],
        subtotal: selectedBookingForPaymentSummary.subtotal,
        finalPayable: totalPayable,
        finalPayableAmount: totalPayable,
        grandTotal: totalPayable,
        totalAmount: totalPayable,
        amountPaid: totalPayable,
        balanceAmount: 0,
        discount: selectedBookingForPaymentSummary.discount,
        medicineTotal: selectedBookingForPaymentSummary.medicineTotal,
        labTotal: selectedBookingForPaymentSummary.labTotal,
        status: selectedBookingForPaymentSummary.status,
        appointmentDate:
          selectedBookingForPaymentSummary.appointmentDate || selectedBookingForPaymentSummary.date,
      });
      if (res && res.data && res.data.success) {
        showToast(
          `Payment marked as Paid for ${selectedBookingForPaymentSummary.patientName}!`,
          "success"
        );
        setShowPaymentSummaryPopup(false);
        setSelectedBookingForPaymentSummary(null);
        fetchBookings();
      } else {
        showToast(res.data.message || "Failed to update payment", "error");
      }
    } catch (error) {
      console.error("Error updating payment:", error);
      showToast(error.response?.data?.message || "Failed to update payment", "error");
    } finally {
      setMarkingPaid(false);
    }
  };

  const startWhatsAppVideoCall = (booking) => {
    const number = buildWhatsAppNumber(booking.patientPhone);
    if (!number) {
      showToast("Patient phone number is not available", "error");
      return;
    }
    if (!window.confirm(`Start WhatsApp video call with ${booking.patientName} (${booking.patientPhone})?`)) return;
    const message = encodeURIComponent(
      `Hello ${booking.patientName}, this is TimelyHealth. Joining for your online consultation now.`
    );
    const url = `https://wa.me/${number}?text=${message}`;
    window.open(url, "_blank");
    showToast("Opening WhatsApp — tap the video call icon to start the call.", "info");
  };

  const getTotalServiceFee = (booking) => {
    if (!booking.services || booking.services.length === 0) return 0;
    return booking.services.reduce((sum, s) => sum + (s.price || 0), 0);
  };

  const handlePrintPrescription = (booking) => {
    if (!booking) {
      showToast("No prescription data to print", "error");
      return;
    }
    const b = booking;
    const win = window.open("", "_blank", "width=800,height=1100");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html><html><head><title>Prescription - ${b.patientName || "Patient"}</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:Arial,sans-serif; background:#fff; display:flex; flex-direction:column; align-items:center; min-height:100vh; padding:20px; }
        .prescription-page { max-width:650px; width:100%; position:relative; background:#fff; box-shadow:0 4px 20px rgba(0,0,0,0.1); border-radius:12px; overflow:hidden; margin-bottom:30px; page-break-after:always; }
        .prescription-page img { width:100%; height:auto; display:block; }
        .page-label { text-align:center; font-size:11px; color:#888; padding:6px 0; background:#f5f5f5; border-bottom:1px solid #ddd; font-weight:bold; letter-spacing:1px; }
        .overlay-print { position:absolute; top:0; left:0; right:0; bottom:0; }
        .overlay-print .fld { position:absolute; font-size:15px; font-weight:600; color:#1a1a1a; letter-spacing:0.2px; line-height:1.3; }
        @media print { body { padding:0; } .prescription-page { box-shadow:none; border-radius:0; margin-bottom:0; } .page-label { display:none; } }
      </style></head><body>
      <div class="prescription-page">
        <div class="page-label">📄 Front Side - Prescription</div>
        <img src="${prescriptionTemplate}" alt="Front" />
        <div class="overlay-print">
          <div class="fld" style="top:78px;left:90px;max-width:280px;">${b.patientTitle || ""} ${b.patientName || "N/A"}</div>
          <div class="fld" style="top:78px;right:20px;">${formatDateToDDMMYYYY(b.appointmentDate || b.date)}</div>
          <div class="fld" style="top:104px;left:90px;">${b.patientAge || "N/A"}</div>
          <div class="fld" style="top:104px;left:230px;">${b.patientGender || "N/A"}</div>
          <div class="fld" style="top:104px;right:100px;">${b.patientPhone || "N/A"}</div>
          <div class="fld" style="top:130px;left:90px;max-width:320px;">${b.purpose || "N/A"}</div>
          <div class="fld" style="top:160px;left:90px;">${b.vitalsTemp || ""}</div>
          <div class="fld" style="top:160px;left:230px;">${b.vitalsBp || ""}</div>
          <div class="fld" style="top:160px;left:400px;">${b.vitalsPr || ""}</div>
          <div class="fld" style="top:160px;right:80px;">${b.vitalsWeight || ""}</div>
        </div>
      </div>
      <div class="prescription-page"><div class="page-label">📄 Back Side</div><img src="${prescriptionBackTemplate}" alt="Back" /></div>
      <script>window.onload = function() { window.print(); }</script></body></html>
    `);
    win.document.close();
    win.focus();
  };

  const openVitalsModal = (booking) => {
    setVitalsBooking(booking);
    setVitalsData({
      temp: booking.vitalsTemp || "",
      bp: booking.vitalsBp || "",
      pr: booking.vitalsPr || "",
      weight: booking.vitalsWeight || "",
    });
    setShowVitalsModal(true);
  };

  const handleSaveVitals = async () => {
    if (!vitalsBooking) return;
    setSavingVitals(true);
    try {
      const res = await axios.put(
        `${API_BASE_URL}/appointment-slots/vitals/${vitalsBooking._id}`,
        {
          vitalsTemp: vitalsData.temp,
          vitalsBp: vitalsData.bp,
          vitalsPr: vitalsData.pr,
          vitalsWeight: vitalsData.weight,
        }
      );
      if (res?.data?.success) {
        showToast("Vitals saved successfully!", "success");
        setShowVitalsModal(false);
        setVitalsBooking(null);
        setVitalsData({ temp: "", bp: "", pr: "", weight: "" });
        await fetchBookings();
      } else {
        showToast(res.data.message || "Failed to save vitals", "error");
      }
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to save vitals", "error");
    } finally {
      setSavingVitals(false);
    }
  };

  const openReviewModal = (booking) => {
    if (!booking) return;

    const status = getReviewWindowStatus(booking);

    if (!status.canReview && !status.isReviewed) {
      if (status.expired) {
        showToast("Review window expired (3 days limit).", "error");
      } else {
        showToast("Review will be available on appointment date.", "info");
      }
      return;
    }

    setReviewBooking(booking);
    setShowReviewModal(true);
  };

  const handleSaveReview = async () => {
    if (!reviewBooking) return;

    setSavingReview(true);
    try {
      const payload = {
        isReviewed: true,
        reviewDate: new Date().toISOString(),
      };

      const res = await axios.put(
        `${API_BASE_URL}/appointment-slots/review/${reviewBooking._id}`,
        payload
      );

      if (res?.data?.success || res?.status === 200) {
        showToast(`✅ Review marked for ${reviewBooking.patientName}!`, "success");
        setShowReviewModal(false);
        setReviewBooking(null);
        await fetchBookings();
      } else {
        showToast(res.data?.message || "Failed to save review", "error");
      }
    } catch (error) {
      console.error("Review save error:", error);
      setBookings((prev) =>
        prev.map((b) =>
          b._id === reviewBooking._id
            ? { ...b, isReviewed: true, reviewDate: new Date().toISOString() }
            : b
        )
      );
      showToast("Review marked locally (backend unavailable)", "info");
      setShowReviewModal(false);
      setReviewBooking(null);
    } finally {
      setSavingReview(false);
    }
  };

  const openBillingModal = (booking) => {
    setSelectedBookingForBilling(booking);

    const totalPayable = getTotalBookingFee(booking);
    const isPaid = booking.paymentStatus === "Paid";
    const paidAmount = isPaid ? totalPayable : booking.amountPaid || 0;
    const balanceAmount = isPaid ? 0 : booking.balanceAmount || totalPayable;

    const now = new Date();
    const dateStamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    const shortId = String(booking._id || "").slice(-6).toUpperCase() || "000000";
    const invoiceNo = `${dateStamp}-${shortId}`;
    const dateTimeLabel = `${now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} ${now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
    const receiptNo = `R-${shortId.slice(-4)}-${String(now.getFullYear()).slice(-2)}-${now.getMonth() + 1}-${Math.floor(1000 + Math.random() * 9000)}`;

    const items = booking.services && booking.services.length > 0
      ? booking.services.map((s, idx) => ({
          no: idx + 1,
          name: s.name,
          serviceCode: s.serviceId ? String(s.serviceId).slice(-6).toUpperCase() : `SVC-${String(idx + 1).padStart(2, "0")}`,
          remarks: s.description || s.paymentStatus || "Service",
          amount: s.price || 0,
          paymentStatus: s.paymentStatus || "Pending",
        }))
      : [
          {
            no: 1,
            name: "Consultation Fee",
            serviceCode: "CONS-01",
            remarks: booking.purpose || "Online Consultation",
            amount: totalPayable,
            paymentStatus: booking.paymentStatus || "Pending",
          },
        ];

    setBillingData({
      invoiceNo,
      invoiceDate: dateTimeLabel,
      receiptNo,
      receiptDate: dateTimeLabel,
      paymentMode: booking.paymentType ? booking.paymentType.charAt(0).toUpperCase() + booking.paymentType.slice(1) : "Cash",
      receivedBy: "Front Desk",
      branch: booking.clinicName || "TimelyHealth",
      doctorName: booking.doctorName || "General OP Doctor",
      items,
      grossAmount: totalPayable,
      netAmount: totalPayable,
      paidAmount,
      balanceAmount,
      paymentStatus: booking.paymentStatus || "Pending",
      amountInWords: numberToWords(totalPayable),
      transactionId: booking.paymentTransactionId || booking.transactionId || "",
    });

    setShowBillingModal(true);
  };

  const handleMarkAsPaid = async () => {
    if (!selectedBookingForBilling) return;
    try {
      const totalPayable = getTotalBookingFee(selectedBookingForBilling);
      const res = await sendUpdateOP(selectedBookingForBilling, {
        patientName: selectedBookingForBilling.patientName,
        patientAge: selectedBookingForBilling.patientAge,
        patientGender: selectedBookingForBilling.patientGender,
        patientTitle: selectedBookingForBilling.patientTitle,
        patientPhone: selectedBookingForBilling.patientPhone,
        patientEmail: selectedBookingForBilling.patientEmail,
        patientAddress: selectedBookingForBilling.patientAddress,
        patientCity: selectedBookingForBilling.patientCity,
        patientPincode: selectedBookingForBilling.patientPincode,
        patientDob: selectedBookingForBilling.patientDob,
        purpose: selectedBookingForBilling.purpose,
        symptoms: selectedBookingForBilling.symptoms,
        paymentType: selectedBookingForBilling.paymentType,
        paymentStatus: "Paid",
        services: selectedBookingForBilling.services || [],
        serviceItems: selectedBookingForBilling.services || [],
        subtotal: selectedBookingForBilling.subtotal,
        finalPayable: totalPayable,
        finalPayableAmount: totalPayable,
        grandTotal: totalPayable,
        totalAmount: totalPayable,
        amountPaid: totalPayable,
        balanceAmount: 0,
        discount: selectedBookingForBilling.discount,
        medicineTotal: selectedBookingForBilling.medicineTotal,
        labTotal: selectedBookingForBilling.labTotal,
        status: selectedBookingForBilling.status,
        appointmentDate: selectedBookingForBilling.appointmentDate || selectedBookingForBilling.date,
      });
      if (res && res.data && res.data.success) {
        setBookings((prev) =>
          prev.map((b) =>
            b._id === selectedBookingForBilling._id ? { ...b, paymentStatus: "Paid", amountPaid: totalPayable, balanceAmount: 0 } : b
          )
        );
        setBillingData((prev) => ({
          ...prev,
          paymentStatus: "Paid",
          paidAmount: prev.netAmount,
          balanceAmount: 0,
        }));
        showToast(`Payment marked as Paid for ${selectedBookingForBilling.patientName}!`, "success");
      } else {
        showToast(res.data.message || "Failed to update payment", "error");
      }
    } catch (error) {
      console.error("Error updating payment:", error);
      showToast("Failed to update payment status", "error");
    }
  };

  const printBill = () => {
    const itemsRows = billingData.items
      .map(
        (item) => `
      <tr>
        <td>${item.no}</td>
        <td>${item.name}</td>
        <td>${item.serviceCode}</td>
        <td>${item.remarks}</td>
        <td class="text-right">${Number(item.amount).toFixed(2)}</td>
        <td class="text-center">${item.paymentStatus || "Pending"}</td>
      </tr>
    `
      )
      .join("");

    const txnRow = billingData.transactionId
      ? `<div><span class="label">Txn ID</span>: <span style="font-family:monospace;font-size:11px;">${billingData.transactionId}</span></div>`
      : "";

    const paymentModeRow = `<div><span class="label">Payment Mode</span>: ${billingData.paymentMode}</div>`;

    const win = window.open("", "_blank", "width=900,height=1000");
    if (win) {
      win.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <title>Bill - ${billingData.invoiceNo}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: Arial, Helvetica, sans-serif; color: #222222; padding: 24px; background: #ffffff; position: relative; }
              .bill-wrap { max-width: 820px; margin: 0 auto; border: 1px solid #999999; padding: 24px 28px; position: relative; background: #ffffff; overflow: hidden; }
              .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.08; z-index: 0; pointer-events: none; width: 300px; height: 300px; }
              .watermark img { width: 100%; height: 100%; object-fit: contain; }
              .bill-content { position: relative; z-index: 1; }
              .top-header { display: flex; align-items: flex-start; justify-content: space-between; border-bottom: 2px solid #222222; padding-bottom: 14px; }
              .top-header .brand { display: flex; align-items: center; gap: 14px; }
              .top-header .brand img { width: 60px; height: 60px; object-fit: contain; }
              .top-header .brand h1 { font-size: 20px; font-weight: bold; color: #111111; }
              .top-header .brand p { font-size: 11px; color: #555555; margin-top: 2px; max-width: 440px; }
              .top-header .contact { text-align: right; font-size: 11px; color: #555555; white-space: nowrap; }
              .bar-title { text-align: center; background: #f1f1f1; border-top: 1px solid #999999; border-bottom: 1px solid #999999; padding: 6px 0; font-size: 13px; font-weight: bold; letter-spacing: 1.5px; margin: 10px 0 14px 0; text-transform: uppercase; }
              .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 24px; font-size: 12px; margin-bottom: 14px; }
              .info-grid .label { color: #666666; font-weight: bold; display: inline-block; width: 120px; }
              table.items { width: 100%; border-collapse: collapse; border-top: 2px solid #222222; border-bottom: 2px solid #222222; margin-bottom: 12px; }
              table.items th { text-align: left; font-size: 11px; color: #555555; padding: 6px 4px; border-bottom: 1px solid #bbbbbb; text-transform: uppercase; }
              table.items td { font-size: 12px; padding: 6px 4px; border-bottom: 1px solid #eeeeee; color: #333333; }
              table.items td.text-right, table.items th.text-right { text-align: right; }
              table.items td.text-center, table.items th.text-center { text-align: center; }
              .totals-box { width: 100%; max-width: 300px; margin-left: auto; font-size: 12px; margin-bottom: 12px; }
              .totals-box .row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #eeeeee; }
              .totals-box .row.final { border-top: 2px solid #222222; font-weight: bold; padding-top: 8px; margin-top: 4px; font-size: 13px; }
              .footer-row { display: flex; justify-content: flex-end; gap: 8px; font-size: 11px; color: #555555; border-top: 1px solid #dddddd; padding-top: 12px; margin-top: 10px; }
              .signature-section { display: flex; justify-content: flex-end; margin-top: 8px; }
              .signature-section .sig { font-weight: bold; color: #333; }
              @media print { body { padding: 0; } .bill-wrap { border: none; } }
            </style>
          </head>
          <body>
            <div class="bill-wrap">
              <div class="watermark"><img src="${logo}" alt="${CLINIC_INFO.name}" /></div>
              <div class="bill-content">
                <div class="top-header">
                  <div class="brand">
                    <img src="${logo}" alt="${CLINIC_INFO.name}" />
                    <div>
                      <h1>${CLINIC_INFO.name}</h1>
                      <p>${CLINIC_INFO.address}</p>
                    </div>
                  </div>
                  <div class="contact">Contact No : ${CLINIC_INFO.contact}</div>
                </div>
                <div class="bar-title">Bill Cum Receipt</div>
                <div class="info-grid">
                  <div><span class="label">Name</span>: ${selectedBookingForBilling?.patientName || "N/A"}</div>
                  <div><span class="label">Invoice No / Date</span>: ${billingData.invoiceNo} / ${billingData.invoiceDate}</div>
                  <div><span class="label">Age</span>: ${selectedBookingForBilling?.patientAge || "N/A"} Yrs</div>
                  <div><span class="label">Gender</span>: ${selectedBookingForBilling?.patientGender || "N/A"}</div>
                  <div><span class="label">Branch</span>: ${billingData.branch}</div>
                  <div><span class="label">Contact No</span>: ${selectedBookingForBilling?.patientPhone || "N/A"}</div>
                  <div><span class="label">Doctor</span>: ${billingData.doctorName}</div>
                  <div><span class="label">Appt. Date</span>: ${formatDateToDDMMYYYY(selectedBookingForBilling?.date)}</div>
                  ${paymentModeRow}
                  ${txnRow}
                </div>
                <table class="items">
                  <thead>
                    <tr>
                      <th style="width:6%;">No.</th>
                      <th style="width:30%;">Service / Item</th>
                      <th style="width:16%;">Service Code</th>
                      <th style="width:22%;">Remarks</th>
                      <th style="width:14%;" class="text-right">Amount</th>
                      <th style="width:12%;" class="text-center">Payment Status</th>
                    </tr>
                  </thead>
                  <tbody>${itemsRows}</tbody>
                </table>
                <div class="totals-box">
                  <div class="row"><span>Gross Bill Amount</span><span>₹ ${billingData.grossAmount.toFixed(2)}</span></div>
                  <div class="row"><span>Net Amount</span><span>₹ ${billingData.netAmount.toFixed(2)}</span></div>
                  <div class="row"><span>Paid Amount</span><span>₹ ${billingData.paidAmount.toFixed(2)}</span></div>
                  <div class="row final"><span>Balance to Pay</span><span>₹ ${billingData.balanceAmount.toFixed(2)}</span></div>
                </div>
                <div class="footer-row">
                  <span>Printed Date : ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} ${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <div class="signature-section"><span class="sig">Signature</span></div>
                <div class="footer-note">* Bills cannot be cancelled once registered.</div>
              </div>
            </div>
          </body>
        </html>
      `);
      win.document.close();
      win.focus();
      setTimeout(() => {
        win.print();
      }, 500);
    }
  };

  const handleFromDateChange = (e) => {
    setFromDate(e.target.value);
    if (e.target.value) setSelectedMonth("");
  };

  const handleToDateChange = (e) => {
    setToDate(e.target.value);
    if (e.target.value) setSelectedMonth("");
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
    setFromDate("");
    setToDate("");
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
    setDoctorFilter("All");
    setFromDate("");
    setToDate("");
    setSelectedMonth("");
    setActiveCardFilter("all");
    setCurrentPage(1);
    if (window.innerWidth < 1024) setShowMobileFilters(false);
  };

  const handleCardClick = (type) => {
    setActiveCardFilter(type);
    setCurrentPage(1);
    if (type === "all") setStatusFilter("All");
    else if (type === "Paid") setStatusFilter("Paid");
    else if (type === "Pending") setStatusFilter("Pending");
  };

  const getUniqueDoctors = () => {
    const doctorMap = new Map();
    bookings.forEach((b) => {
      if (b.doctorName) {
        doctorMap.set(b.doctorName, {
          name: b.doctorName,
          specialization: b.doctorSpecialization || "",
        });
      }
    });
    return Array.from(doctorMap.values());
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // ✅ Only show active bookings on this page
      if (b.isActive === false) return false;

      if (statusFilter !== "All" && b.paymentStatus !== statusFilter) return false;
      if (doctorFilter !== "All" && b.doctorName !== doctorFilter) return false;

      if (selectedMonth && selectedMonth !== "") {
        const recordDate = new Date(b.appointmentDate || b.date || b.createdAt);
        const recordMonth = recordDate.toISOString().slice(0, 7);
        if (recordMonth !== selectedMonth) return false;
      }

      const dateToCheck = b.appointmentDate || b.date || b.createdAt;
      if (dateToCheck) {
        const recordDate = new Date(dateToCheck);
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
        const matchName = (b.patientName || "").toLowerCase().includes(q);
        const matchPhone = (b.patientPhone || "").toLowerCase().includes(q);
        const matchAddress = (b.patientAddress || "").toLowerCase().includes(q);
        const matchPurpose = (b.purpose || "").toLowerCase().includes(q);
        const matchDoctor = (b.doctorName || "").toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchAddress && !matchPurpose && !matchDoctor) return false;
      }
      return true;
    });
  }, [bookings, statusFilter, doctorFilter, searchQuery, fromDate, toDate, selectedMonth]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, doctorFilter, fromDate, toDate, selectedMonth]);

  const stats = useMemo(() => {
    const activeBookings = bookings.filter((b) => b.isActive !== false);
    const total = activeBookings.length;
    let paidTotal = 0;
    let paidCount = 0;
    let pendingCount = 0;

    activeBookings.forEach((b) => {
      const totalFee = getTotalBookingFee(b);
      const isPaid = b.paymentStatus === "Paid";
      if (isPaid) {
        paidCount++;
        paidTotal += totalFee;
      } else {
        pendingCount++;
      }
    });

    return { total, paid: paidCount, pending: pendingCount, totalRevenue: paidTotal };
  }, [bookings]);

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);

  const handleItemsPerPageChange = (e) => {
    const newValue = Number(e.target.value);
    setItemsPerPage(newValue);
    localStorage.setItem("bookings_itemsPerPage", String(newValue));
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
      if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
        pageNumbers.push(i);
      } else if (i === currentPage - 3 || i === currentPage + 3) {
        pageNumbers.push("...");
      }
    }
    return pageNumbers;
  };

  const downloadCSV = () => {
    if (filteredBookings.length === 0) {
      alert("No records available to export!");
      return;
    }
    const headers = ["#", "Patient Name", "Phone", "Doctor", "Appointment Date", "Slot Timing", "Booking Status", "Payment Status", "Transaction ID", "Services", "Reports", "Prescriptions", "Total Fee", "Payment Mode", "Reason", "Rescheduled", "Booked On"];
    const csvRows = [
      headers.join(","),
      ...filteredBookings.map((b, idx) => {
        const totalFee = getTotalBookingFee(b);
        const services = b.services || [];
        const serviceNames = services.map((s) => s.name).join("; ");
        const slotTiming = b.startTime && b.endTime ? `${b.startTime} - ${b.endTime}` : "-";
        const reportCount = (b.reports || []).length;
        const prescriptionCount = (b.prescriptions || []).length;
        const rescheduled = isRescheduled(b) ? `Yes (${b.rescheduleCount || 1}x)` : "No";
        const txnId = b.paymentTransactionId || b.transactionId || "-";
        return [
          idx + 1,
          `"${(b.patientName || "").replace(/"/g, '""')}"`,
          `"${b.patientPhone || ""}"`,
          `"${b.doctorName || "N/A"}"`,
          `"${formatDateToDDMMYYYY(b.appointmentDate || b.date)}"`,
          `"${slotTiming}"`,
          `"${b.status || "confirmed"}"`,
          `"${b.paymentStatus || "Pending"}"`,
          `"${txnId}"`,
          `"${serviceNames}"`,
          `"${reportCount} file(s)"`,
          `"${prescriptionCount} file(s)"`,
          totalFee,
          `"${b.paymentType || "cash"}"`,
          `"${(b.purpose || "").replace(/"/g, '""')}"`,
          `"${rescheduled}"`,
          `"${formatDateTimeToDDMMYYYY(b.bookedAt || b.createdAt)}"`,
        ].join(",");
      }),
    ];
    const csvData = csvRows.join("\n");
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Online_Bookings_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filteredBookings.length} records to CSV!`);
  };

  return (
    <div className="emp-dash">
      <main className="p-2 sm:p-4 lg:p-6">
        {toast && (
          <div
            className={`fixed top-5 right-5 z-[9999] flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white transition-all transform animate-bounce ${
              toast.type === "error" ? "bg-red-600" : toast.type === "info" ? "bg-cyan-600" : "bg-emerald-600"
            }`}
          >
            {toast.type === "error" ? <FiXCircle className="w-5 h-5" /> : <FiCheckCircle className="w-5 h-5" />}
            <span className="font-medium text-sm">{toast.message}</span>
          </div>
        )}

        {/* HEADER DESKTOP */}
        <div className="hidden lg:flex items-center justify-between gap-3 flex-wrap mb-6">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap">
              Online <span>Bookings</span>
            </h1>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="emp-dash__date-pill">
              <FaCalendarCheck />
              <span>{stats.total} Online Bookings</span>
            </div>
            <div className="relative min-w-[130px]">
              <FaSearch className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[200px] pl-8 pr-2 py-1.5 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="All">All Payment Status</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
            </select>

            <select
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="h-8 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 max-w-[130px] truncate"
            >
              <option value="All">All Doctors</option>
              {getUniqueDoctors().map((doc) => (
                <option key={doc.name} value={doc.name}>
                  {doc.name}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={fromDate}
              onChange={handleFromDateChange}
              className="w-[110px] h-8 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <input
              type="date"
              value={toDate}
              onChange={handleToDateChange}
              className="w-[110px] h-8 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <input
              type="month"
              value={selectedMonth}
              onChange={handleMonthChange}
              className="w-[120px] h-8 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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

                       {/* ✅ Inactive Patients Button */}
            <button
              onClick={() => handleRoleBasedNavigate("/inactive-patients")}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-all shadow-sm whitespace-nowrap"
            >
              <FaUserInjured className="w-3 h-3" /> Inactive Patients
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

        {/* HEADER MOBILE */}
        <div className="lg:hidden flex items-center justify-between gap-2 flex-wrap mb-3">
          <div className="flex items-baseline gap-2">
            <h1 className="text-base font-bold whitespace-nowrap">
              Online <span className="text-indigo-600">Bookings</span>
            </h1>
            <div className="emp-dash__date-pill text-[10px] px-2 py-1">
              <FaCalendarCheck className="w-3 h-3 text-blue-600" />
              <span>{stats.total} Online</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
                      {/* ✅ Inactive Patients Button Mobile */}
            <button
              onClick={() => handleRoleBasedNavigate("/inactive-patients")}
              className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-all"
            >
              <FaUserInjured className="w-3 h-3" /> Inactive
            </button>
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
            >
              <FiFilter className="w-3 h-3" /> Filters
            </button>
          </div>
        </div>

        {/* MOBILE FILTERS */}
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
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Payment Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="All">All Payment Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Doctor</label>
                  <select
                    value={doctorFilter}
                    onChange={(e) => setDoctorFilter(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="All">All Doctors</option>
                    {getUniqueDoctors().map((doc) => (
                      <option key={doc.name} value={doc.name}>
                        {doc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">From Date</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={handleFromDateChange}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">To Date</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={handleToDateChange}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Month</label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={handleMonthChange}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div className="pt-3 border-t border-gray-200 flex gap-2">
                <button
                  onClick={downloadCSV}
                  disabled={filteredBookings.length === 0}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiDownload className="w-4 h-4" /> Export
                </button>
                <button
                  onClick={fetchAllData}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
                >
                  <FiRefreshCw className="w-4 h-4" /> Refresh
                </button>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
                >
                  <FiTrash2 className="w-4 h-4 text-red-500" /> Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* KPI STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
          <div
            className={`emp-dash__stat cursor-pointer hover:scale-105 transition-transform duration-200 ${activeCardFilter === "all" ? "ring-2 ring-blue-500/20 border-blue-400" : ""}`}
            onClick={() => handleCardClick("all")}
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Online</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FiUsers />
              </div>
            </div>
            <div className="emp-dash__stat-value">{stats.total}</div>
            <div className="emp-dash__stat-meta">online appointments</div>
          </div>

          <div
            className={`emp-dash__stat cursor-pointer hover:scale-105 transition-transform duration-200 ${activeCardFilter === "Paid" ? "ring-2 ring-emerald-500/20 border-emerald-400" : ""}`}
            onClick={() => handleCardClick("Paid")}
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Paid</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <FiUserCheck />
              </div>
            </div>
            <div className="emp-dash__stat-value text-emerald-600">{stats.paid}</div>
            <div className="emp-dash__stat-meta">completed payments</div>
          </div>

          <div
            className={`emp-dash__stat cursor-pointer hover:scale-105 transition-transform duration-200 ${activeCardFilter === "Pending" ? "ring-2 ring-amber-500/20 border-amber-400" : ""}`}
            onClick={() => handleCardClick("Pending")}
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Pending</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                <FiClock />
              </div>
            </div>
            <div className="emp-dash__stat-value text-amber-600">{stats.pending}</div>
            <div className="emp-dash__stat-meta">awaiting payment</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Revenue</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <FaRupeeSign />
              </div>
            </div>
            <div className="emp-dash__stat-value text-blue-700">₹{stats.totalRevenue.toLocaleString()}</div>
            <div className="emp-dash__stat-meta">collected revenue</div>
          </div>

          <div className="emp-dash__stat col-span-2 lg:col-span-1">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Filtered Records</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FiFilter />
              </div>
            </div>
            <div className="emp-dash__stat-value text-base sm:text-lg md:text-xl font-bold truncate">
              {filteredBookings.length}
            </div>
            <div className="emp-dash__stat-meta">matching filters</div>
          </div>
        </div>

        {/* ===== MAIN TABLE / CARD SECTION ===== */}
        <div className="emp-dash__card">
          {loading ? (
            <div className="py-12 text-center text-gray-500">
              <FiRefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">Loading online booking records...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <FaUserInjured className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-700">No Online Booking Records Found</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto mb-4">
                {stats.total === 0 ? "Online bookings yahan dikhengi." : "No records match your current search/date filters."}
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
              {/* ===== DESKTOP TABLE VIEW ===== */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="emp-dash__table">
                  <thead>
                    <tr>
                      <th style={{ width: "35px", textAlign: "center" }}>#</th>
                      <th>Patient</th>
                      <th>Phone</th>
                      <th>Doctor</th>
                      <th style={{ textAlign: "center" }}>Appt. Date</th>
                      <th style={{ textAlign: "center" }}>Slot & Timing</th>
                      <th style={{ textAlign: "center" }}>Booking Status</th>
                      <th style={{ textAlign: "center" }}>Payment Status</th>
                      <th style={{ textAlign: "center" }}>Transaction ID</th>
                      <th style={{ textAlign: "center" }}>Services</th>
                      <th style={{ textAlign: "center" }}>Reports</th>
                      <th style={{ textAlign: "center" }}>Prescriptions</th>
                      <th style={{ textAlign: "center" }}>Total</th>
                      <th style={{ textAlign: "center" }}>Payment Mode</th>
                      <th style={{ textAlign: "center" }}>Reschedule</th>
                      <th style={{ textAlign: "center" }}>Booked On</th>
                      <th style={{ textAlign: "center" }}>Active</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentBookings.map((booking, idx) => {
                      const totalFee = getTotalBookingFee(booking);
                      const services = booking.services || [];
                      const consultationPaymentStatus = booking.paymentStatus || "Pending";
                      const isConsultationPaid = consultationPaymentStatus === "Paid";
                      const bookingStatus = booking.status || "confirmed";
                      const appointmentDate = booking.appointmentDate || booking.date;
                      const slotTiming = booking.startTime && booking.endTime ? `${booking.startTime} - ${booking.endTime}` : "-";
                      const bookingCreated = booking.bookedAt || booking.createdAt;
                      const statusColors = getStatusColors(bookingStatus);
                      const reports = booking.reports || [];
                      const prescriptions = booking.prescriptions || [];
                      const isActive = booking.isActive !== false;
                      const rescheduled = isRescheduled(booking);
                      const txnId = booking.paymentTransactionId || booking.transactionId || "";

                      return (
                        <tr key={booking._id} className="transition-colors hover:bg-blue-50/40 group">
                          <td className="px-2 py-3 font-semibold text-center text-slate-500 text-[11px]">
                            {indexOfFirstItem + idx + 1}
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-[10px] shadow-sm">
                                {booking.patientName ? booking.patientName.charAt(0).toUpperCase() : "P"}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-slate-800 text-xs truncate max-w-[80px]">
                                  {booking.patientName || "N/A"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <span className="text-xs font-medium text-slate-700">{booking.patientPhone || "N/A"}</span>
                          </td>
                          <td className="px-3 py-3">
                            <div className="text-xs font-semibold text-purple-800 truncate max-w-[90px]">
                              {booking.doctorName || "N/A"}
                            </div>
                          </td>
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <span className="text-xs font-medium text-slate-700">
                              {formatDateToDDMMYYYY(appointmentDate)}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            {slotTiming !== "-" ? (
                              <div className="flex flex-col items-center">
                                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                                  {slotTiming}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-gray-400 italic">-</span>
                            )}
                          </td>

                          <td className="px-3 py-3 text-center whitespace-nowrap relative status-dropdown">
                            <div className="relative inline-block">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenStatusDropdown(openStatusDropdown === booking._id ? null : booking._id);
                                }}
                                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${statusColors.bg} ${statusColors.text} ${statusColors.border} hover:opacity-80 transition-all`}
                              >
                                <FaCheckCircle className="w-2.5 h-2.5" />
                                {bookingStatus}
                                <FiChevronDown className="w-3 h-3 ml-0.5" />
                              </button>
                              {openStatusDropdown === booking._id && (
                                <div
                                  className="fixed z-[9999] bg-white rounded-lg shadow-2xl border border-gray-200 py-1 min-w-[140px] max-h-[200px] overflow-y-auto"
                                  style={{
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {BOOKING_STATUS_OPTIONS.map((st) => {
                                    const isActiveSt = st.value === bookingStatus.toLowerCase();
                                    const colors = getStatusColors(st.value);
                                    return (
                                      <button
                                        key={st.value}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleStatusSelect(booking, st.value, e);
                                        }}
                                        className={`w-full px-4 py-2 text-left text-[11px] font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2 ${isActiveSt ? colors.text : "text-gray-600"}`}
                                      >
                                        <span className={`w-2 h-2 rounded-full ${colors.bg} border ${colors.border}`}></span>
                                        {st.label}
                                        {isActiveSt && <FaCheck className="w-2.5 h-2.5 ml-auto text-green-500" />}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </td>

                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openPaymentSummaryPopup(booking);
                              }}
                              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                                isConsultationPaid
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              } hover:opacity-80 transition-all`}
                              title="Click to view payment summary"
                            >
                              {isConsultationPaid ? (
                                <FaCheckCircle className="w-2.5 h-2.5 text-emerald-600" />
                              ) : (
                                <FiClock className="w-2.5 h-2.5 text-amber-600" />
                              )}
                              {consultationPaymentStatus}
                            </button>
                          </td>

                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            {txnId ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(txnId);
                                  showToast("Transaction ID copied!", "success");
                                }}
                                title={`Click to copy: ${txnId}`}
                                className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded border border-slate-200 transition-colors max-w-[120px]"
                              >
                                <FaReceipt className="w-2.5 h-2.5 flex-shrink-0" />
                                <span className="truncate">{txnId}</span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-gray-400 italic">-</span>
                            )}
                          </td>

                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            {services.length > 0 ? (
                              <div className="flex flex-col gap-0.5 items-center">
                                {services.slice(0, 2).map((s, i) => (
                                  <span
                                    key={i}
                                    className="text-[9px] font-medium bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100"
                                    title={s.name}
                                  >
                                    {s.name} (₹{s.price})
                                  </span>
                                ))}
                                {services.length > 2 && (
                                  <span className="text-[9px] text-gray-400">+{services.length - 2}</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[10px] text-gray-400 italic">-</span>
                            )}
                          </td>

                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            {reports.length > 0 ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openFileListModal(booking, "reports");
                                }}
                                className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors"
                                title={reports.length > 1 ? "Click to view all reports" : "Click to view report"}
                              >
                                <FiFileText className="w-3 h-3" /> {reports.length}
                              </button>
                            ) : (
                              <span className="text-[10px] text-gray-400 italic">-</span>
                            )}
                          </td>

                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            {prescriptions.length > 0 ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openFileListModal(booking, "prescriptions");
                                }}
                                className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors"
                                title={prescriptions.length > 1 ? "Click to view all prescriptions" : "Click to view prescription"}
                              >
                                <FiPaperclip className="w-3 h-3" /> {prescriptions.length}
                              </button>
                            ) : (
                              <span className="text-[10px] text-gray-400 italic">-</span>
                            )}
                          </td>

                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <span className="text-xs font-bold text-slate-800">₹{totalFee}</span>
                          </td>

                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 capitalize">
                              {booking.paymentType === "online" ? (
                                <FaCreditCard className="text-indigo-500 text-[11px]" />
                              ) : (
                                <FaMoneyBillWave className="text-green-600 text-[11px]" />
                              )}
                              {booking.paymentType || "cash"}
                            </span>
                          </td>

                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            {rescheduled ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openViewModal(booking);
                                }}
                                className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
                                title="View reschedule details"
                              >
                                <FaCalendarPlus className="w-2.5 h-2.5" />
                                {booking.rescheduleCount > 1 ? `×${booking.rescheduleCount}` : "Yes"}
                              </button>
                            ) : (
                              <span className="text-[10px] text-gray-400 italic">No</span>
                            )}
                          </td>

                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <div className="text-[10px] font-semibold text-slate-700">
                              {formatDateTimeToDDMMYYYY(bookingCreated)}
                            </div>
                          </td>

                          <td className="px-3 py-3 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleToggleActive(booking)}
                              disabled={togglingActiveId === booking._id}
                              className={`relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all ${
                                isActive
                                  ? "bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                                  : "bg-gray-100 border-gray-300 text-gray-500 hover:bg-gray-200"
                              } ${togglingActiveId === booking._id ? "opacity-60 cursor-wait" : ""}`}
                              title={isActive ? "Click to mark Inactive" : "Click to mark Active"}
                            >
                              <span
                                className={`relative inline-block w-7 h-4 rounded-full transition-colors ${
                                  isActive ? "bg-emerald-500" : "bg-gray-400"
                                }`}
                              >
                                <span
                                  className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                                    isActive ? "translate-x-3" : "translate-x-0"
                                  }`}
                                ></span>
                              </span>
                              <span className="text-[9px] font-bold uppercase tracking-wide">
                                {isActive ? "Active" : "Inactive"}
                              </span>
                            </button>
                          </td>

                          <td className="px-3 py-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openViewModal(booking)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                title="View Details"
                              >
                                <FiEye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openEditModal(booking)}
                                className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-transparent hover:border-amber-100"
                                title="Edit Booking"
                              >
                                <FiEdit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => startWhatsAppVideoCall(booking)}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-transparent hover:border-green-100"
                                title="Start WhatsApp Video Call"
                              >
                                <FaVideo className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handlePrintPrescription(booking)}
                                className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors border border-transparent hover:border-teal-100"
                                title="Print Prescription"
                              >
                                <FaPrescription className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openVitalsModal(booking)}
                                className="p-1.5 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors border border-transparent hover:border-pink-100"
                                title="Vitals"
                              >
                                <FaHeartbeat className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openBillingModal(booking)}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-100"
                                title="Invoice / Bill"
                              >
                                <FaFileInvoiceDollar className="w-3.5 h-3.5" />
                              </button>
                              {(() => {
                                const rStatus = getReviewWindowStatus(booking);
                                const isReviewed = booking.isReviewed === true;
                                const isDisabled = !rStatus.canReview && !isReviewed;

                                return (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (isDisabled) {
                                        if (rStatus.expired) showToast("Review window expired (3 days limit).", "error");
                                        else showToast("Review will be available on appointment date.", "info");
                                        return;
                                      }
                                      openReviewModal(booking);
                                    }}
                                    disabled={isDisabled}
                                    className={`p-1.5 rounded-lg transition-colors border border-transparent ${
                                      isReviewed
                                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                        : isDisabled
                                        ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                                        : "text-amber-600 hover:bg-amber-50 hover:border-amber-100"
                                    }`}
                                    title={
                                      isReviewed
                                        ? `Reviewed on ${formatDateToDDMMYYYY(booking.reviewDate)}`
                                        : isDisabled
                                        ? rStatus.expired
                                          ? "Review window expired (3 days limit)"
                                          : "Not yet available"
                                        : `Click to mark reviewed (${rStatus.daysLeft} day${rStatus.daysLeft !== 1 ? "s" : ""} left)`
                                    }
                                  >
                                    <FaStar className="w-3.5 h-3.5" />
                                  </button>
                                );
                              })()}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* ===== MOBILE CARD VIEW ===== */}
              <div className="lg:hidden p-3 space-y-3 bg-gray-50/50">
                {currentBookings.map((booking, idx) => {
                  const totalFee = getTotalBookingFee(booking);
                  const services = booking.services || [];
                  const consultationPaymentStatus = booking.paymentStatus || "Pending";
                  const isConsultationPaid = consultationPaymentStatus === "Paid";
                  const bookingStatus = booking.status || "confirmed";
                  const appointmentDate = booking.appointmentDate || booking.date;
                  const slotTiming = booking.startTime && booking.endTime ? `${booking.startTime} - ${booking.endTime}` : "-";
                  const statusColors = getStatusColors(bookingStatus);
                  const reports = booking.reports || [];
                  const prescriptions = booking.prescriptions || [];
                  const isActive = booking.isActive !== false;
                  const rescheduled = isRescheduled(booking);
                  const txnId = booking.paymentTransactionId || booking.transactionId || "";

                  return (
                    <div key={booking._id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      <div className="flex items-center justify-between gap-2 p-3 border-b border-gray-100 bg-gradient-to-r from-blue-50/60 to-indigo-50/60">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                            {booking.patientName ? booking.patientName.charAt(0).toUpperCase() : "P"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-slate-800 text-sm truncate">
                              {booking.patientName || "N/A"}
                            </div>
                            <div className="text-[11px] text-gray-500 flex items-center gap-1">
                              <FaPhoneAlt className="text-[9px]" /> {booking.patientPhone || "N/A"}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full uppercase border ${statusColors.bg} ${statusColors.text} ${statusColors.border} flex-shrink-0`}
                        >
                          <FaCheckCircle className="w-2.5 h-2.5" /> {bookingStatus}
                        </span>
                      </div>

                      <div className="p-3 space-y-2.5">
                        {rescheduled && (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 flex items-center gap-2">
                            <FaCalendarPlus className="w-3 h-3 text-amber-600 flex-shrink-0" />
                            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                              Rescheduled
                            </span>
                            {booking.rescheduleCount > 1 && (
                              <span className="text-[10px] font-bold text-amber-700 ml-auto">
                                ×{booking.rescheduleCount}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <div className="text-[9px] font-bold uppercase text-gray-400">Doctor</div>
                            <div className="font-semibold text-purple-700 truncate">{booking.doctorName || "N/A"}</div>
                          </div>
                          <div>
                            <div className="text-[9px] font-bold uppercase text-gray-400">Age / Gender</div>
                            <div className="font-semibold text-slate-700">
                              {booking.patientAge || "N/A"} yrs · {booking.patientGender || "N/A"}
                            </div>
                          </div>
                          <div>
                            <div className="text-[9px] font-bold uppercase text-gray-400">Appt. Date</div>
                            <div className="font-semibold text-slate-700">{formatDateToDDMMYYYY(appointmentDate)}</div>
                          </div>
                          <div>
                            <div className="text-[9px] font-bold uppercase text-gray-400">Slot Time</div>
                            <div className="font-semibold text-blue-700">{slotTiming !== "-" ? slotTiming : "N/A"}</div>
                          </div>
                        </div>

                        {txnId && (
                          <div className="pt-2 border-t border-gray-100">
                            <div className="text-[9px] font-bold uppercase text-gray-400 mb-0.5">Transaction ID</div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(txnId);
                                showToast("Transaction ID copied!", "success");
                              }}
                              className="w-full flex items-center gap-1.5 text-[10px] font-mono font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded border border-slate-200 transition-colors"
                            >
                              <FaReceipt className="w-3 h-3 flex-shrink-0 text-slate-500" />
                              <span className="truncate">{txnId}</span>
                            </button>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-gray-100">
                          <div className="text-center p-1.5 rounded-lg bg-purple-50 border border-purple-200">
                            <div className="text-[8px] font-bold text-purple-600 uppercase">Services</div>
                            <div className="text-xs font-extrabold text-purple-800 truncate">
                              {services.length > 0 ? services.map((s) => s.name).join(", ") : "None"}
                            </div>
                          </div>
                          <div className="text-center p-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
                            <div className="text-[8px] font-bold text-emerald-600 uppercase">Total</div>
                            <div className="text-xs font-extrabold text-emerald-800">₹{totalFee}</div>
                          </div>
                        </div>

                        {(reports.length > 0 || prescriptions.length > 0) && (
                          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-100">
                            {reports.length > 0 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openFileListModal(booking, "reports");
                                }}
                                className="inline-flex items-center gap-1 text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full border border-indigo-200 hover:bg-indigo-100 transition-colors"
                              >
                                <FiFileText className="w-3 h-3" /> {reports.length} Report
                                {reports.length > 1 ? "s" : ""}
                              </button>
                            )}
                            {prescriptions.length > 0 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openFileListModal(booking, "prescriptions");
                                }}
                                className="inline-flex items-center gap-1 text-[10px] font-bold bg-purple-50 text-purple-700 px-2 py-1 rounded-full border border-purple-200 hover:bg-purple-100 transition-colors"
                              >
                                <FiPaperclip className="w-3 h-3" /> {prescriptions.length} Prescription
                                {prescriptions.length > 1 ? "s" : ""}
                              </button>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-bold uppercase text-gray-400">Payment:</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openPaymentSummaryPopup(booking);
                              }}
                              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                                isConsultationPaid
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}
                            >
                              {isConsultationPaid ? (
                                <FaCheckCircle className="w-2.5 h-2.5 text-emerald-600" />
                              ) : (
                                <FiClock className="w-2.5 h-2.5 text-amber-600" />
                              )}
                              {consultationPaymentStatus}
                            </button>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-slate-600">
                            {booking.paymentType === "online" ? (
                              <FaCreditCard className="text-indigo-500 text-[10px]" />
                            ) : (
                              <FaMoneyBillWave className="text-green-600 text-[10px]" />
                            )}
                            {booking.paymentType || "cash"}
                          </div>
                        </div>

                        <div className="flex items-center justify-center pt-2 border-t border-gray-100">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleActive(booking);
                            }}
                            disabled={togglingActiveId === booking._id}
                            className={`relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                              isActive
                                ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                                : "bg-gray-100 border-gray-300 text-gray-500"
                            } ${togglingActiveId === booking._id ? "opacity-60 cursor-wait" : ""}`}
                          >
                            <span
                              className={`relative inline-block w-8 h-4 rounded-full transition-colors ${
                                isActive ? "bg-emerald-500" : "bg-gray-400"
                              }`}
                            >
                              <span
                                className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                                  isActive ? "translate-x-4" : "translate-x-0"
                                }`}
                              ></span>
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wide">
                              {isActive ? "Active" : "Inactive"}
                            </span>
                          </button>
                        </div>

                        <div className="flex items-center justify-center gap-1.5 pt-2 border-t border-gray-100 flex-wrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openViewModal(booking);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-[10px] font-bold"
                            title="View Details"
                          >
                            <FiEye className="w-3.5 h-3.5" /> View
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(booking);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg text-[10px] font-bold"
                            title="Edit Booking"
                          >
                            <FiEdit2 className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startWhatsAppVideoCall(booking);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg text-[10px] font-bold"
                            title="WhatsApp Video Call"
                          >
                            <FaVideo className="w-3.5 h-3.5" /> Video
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePrintPrescription(booking);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-teal-50 text-teal-600 hover:bg-teal-100 rounded-lg text-[10px] font-bold"
                            title="Print Prescription"
                          >
                            <FaPrescription className="w-3.5 h-3.5" /> Rx
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openVitalsModal(booking);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-pink-50 text-pink-600 hover:bg-pink-100 rounded-lg text-[10px] font-bold"
                            title="Vitals"
                          >
                            <FaHeartbeat className="w-3.5 h-3.5" /> Vitals
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openBillingModal(booking);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-[10px] font-bold"
                            title="Invoice"
                          >
                            <FaFileInvoiceDollar className="w-3.5 h-3.5" /> Bill
                          </button>
                          {(() => {
                            const rStatus = getReviewWindowStatus(booking);
                            const isReviewed = booking.isReviewed === true;
                            const isDisabled = !rStatus.canReview && !isReviewed;

                            return (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (isDisabled) {
                                    if (rStatus.expired) showToast("Review window expired (3 days limit).", "error");
                                    else showToast("Review will be available on appointment date.", "info");
                                    return;
                                  }
                                  openReviewModal(booking);
                                }}
                                disabled={isDisabled}
                                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold ${
                                  isReviewed
                                    ? "bg-emerald-100 text-emerald-700"
                                    : isDisabled
                                    ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                                    : "bg-amber-50 text-amber-600"
                                }`}
                                title={isReviewed ? "Reviewed" : isDisabled ? "Not available" : "Mark Reviewed"}
                              >
                                <FaStar className="w-3.5 h-3.5" /> Review
                              </button>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* PAGINATION */}
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
                      {filteredBookings.length === 0 ? 0 : indexOfFirstItem + 1} -{" "}
                      {Math.min(indexOfLastItem, filteredBookings.length)}
                    </strong>{" "}
                    of <strong className="text-gray-800">{filteredBookings.length}</strong> records
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

        {/* ===== FILE LIST MODAL ===== */}
        {fileListModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[78] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-200 flex flex-col max-h-[85vh]">
              <div
                className={`flex items-center justify-between px-5 py-4 border-b border-gray-200 rounded-t-2xl flex-shrink-0 ${
                  fileListModal.type === "reports"
                    ? "bg-gradient-to-r from-indigo-50 to-blue-50"
                    : "bg-gradient-to-r from-purple-50 to-pink-50"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold flex-shrink-0 ${
                      fileListModal.type === "reports" ? "bg-indigo-600 text-white" : "bg-purple-600 text-white"
                    }`}
                  >
                    {fileListModal.type === "reports" ? <FiFileText className="w-5 h-5" /> : <FiPaperclip className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm">
                      {fileListModal.type === "reports" ? "Reports" : "Prescriptions"}
                    </h3>
                    <p className="text-[11px] text-gray-500 truncate">
                      {fileListModal.booking.patientName} • {fileListModal.files.length} file
                      {fileListModal.files.length > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setFileListModal(null)}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 flex-shrink-0"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {fileListModal.files.map((path, idx) => {
                  const fileName = getFileNameFromPath(path);
                  const fileType = getFileType(path);
                  const isPdf = fileType === "pdf";
                  const isImage = fileType === "image";
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        openDirectPreview(path);
                        setFileListModal(null);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border-2 transition-all text-left group ${
                        fileListModal.type === "reports"
                          ? "bg-indigo-50/60 border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300"
                          : "bg-purple-50/60 border-purple-200 hover:bg-purple-100 hover:border-purple-300"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg bg-white border flex items-center justify-center flex-shrink-0 ${
                          fileListModal.type === "reports" ? "border-indigo-200" : "border-purple-200"
                        }`}
                      >
                        {isPdf ? (
                          <FaFilePdf className="w-5 h-5 text-red-500" />
                        ) : isImage ? (
                          <FaFileImage
                            className={`w-5 h-5 ${
                              fileListModal.type === "reports" ? "text-indigo-500" : "text-purple-500"
                            }`}
                          />
                        ) : (
                          <FiFileText
                            className={`w-5 h-5 ${
                              fileListModal.type === "reports" ? "text-indigo-500" : "text-purple-500"
                            }`}
                          />
                        )}
                      </div>

                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0 ${
                          fileListModal.type === "reports" ? "bg-indigo-600 text-white" : "bg-purple-600 text-white"
                        }`}
                      >
                        {idx + 1}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-gray-900 truncate">{fileName}</div>
                        <div
                          className={`text-[10px] font-medium ${
                            fileListModal.type === "reports" ? "text-indigo-600" : "text-purple-600"
                          }`}
                        >
                          {isPdf ? "PDF Document" : isImage ? "Image File" : "File"} • Click to preview
                        </div>
                      </div>

                      <FiEye
                        className={`w-4 h-4 flex-shrink-0 ${
                          fileListModal.type === "reports"
                            ? "text-indigo-400 group-hover:text-indigo-700"
                            : "text-purple-400 group-hover:text-purple-700"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-end px-5 py-3 border-t border-gray-200 bg-gray-50/50 rounded-b-2xl flex-shrink-0">
                <button
                  onClick={() => setFileListModal(null)}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-200 hover:bg-gray-300 text-gray-700 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== EDIT MODAL ===== */}
        {showEditModal && selectedBookingForEdit && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[85] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-200 flex flex-col max-h-[92vh]">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 rounded-t-2xl flex-shrink-0 bg-gradient-to-r from-amber-50 to-orange-50">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                    <FiEdit2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 text-base truncate">Edit Booking</h3>
                    <p className="text-xs text-gray-500 truncate">
                      {selectedBookingForEdit.patientName} • {selectedBookingForEdit.patientPhone}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedBookingForEdit(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 flex-shrink-0"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                <div>
                  <h4 className="text-[11px] font-bold uppercase text-gray-400 tracking-wider mb-2.5">
                    Patient Information
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Title</label>
                      <select
                        name="patientTitle"
                        value={editForm.patientTitle}
                        onChange={handleEditFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs bg-white"
                      >
                        <option value="Mr.">Mr.</option>
                        <option value="Mrs.">Mrs.</option>
                        <option value="Ms.">Ms.</option>
                        <option value="Master">Master</option>
                        <option value="Baby">Baby</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Full Name</label>
                      <input
                        type="text"
                        name="patientName"
                        value={editForm.patientName}
                        onChange={handleEditFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Age</label>
                      <input
                        type="number"
                        name="patientAge"
                        value={editForm.patientAge}
                        onChange={handleEditFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Gender</label>
                      <select
                        name="patientGender"
                        value={editForm.patientGender}
                        onChange={handleEditFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs bg-white"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Phone</label>
                      <input
                        type="text"
                        name="patientPhone"
                        value={editForm.patientPhone}
                        onChange={handleEditFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Email</label>
                      <input
                        type="email"
                        name="patientEmail"
                        value={editForm.patientEmail}
                        onChange={handleEditFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Date of Birth</label>
                      <input
                        type="date"
                        name="patientDob"
                        value={editForm.patientDob}
                        onChange={handleEditFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">City</label>
                      <input
                        type="text"
                        name="patientCity"
                        value={editForm.patientCity}
                        onChange={handleEditFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Pincode</label>
                      <input
                        type="text"
                        name="patientPincode"
                        value={editForm.patientPincode}
                        onChange={handleEditFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Address</label>
                      <input
                        type="text"
                        name="patientAddress"
                        value={editForm.patientAddress}
                        onChange={handleEditFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[11px] font-bold uppercase text-gray-400 tracking-wider mb-2.5">
                    Appointment Details
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Purpose</label>
                      <input
                        type="text"
                        name="purpose"
                        value={editForm.purpose}
                        onChange={handleEditFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Symptoms</label>
                      <textarea
                        name="symptoms"
                        value={editForm.symptoms}
                        onChange={handleEditFormChange}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[11px] font-bold uppercase text-gray-400 tracking-wider mb-2.5">
                    Status & Payment
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">
                        Booking Status
                      </label>
                      <select
                        name="status"
                        value={editForm.status}
                        onChange={handleEditFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs bg-white capitalize"
                      >
                        {BOOKING_STATUS_OPTIONS.map((st) => (
                          <option key={st.value} value={st.value}>
                            {st.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">
                        Payment Status
                      </label>
                      <select
                        name="paymentStatus"
                        value={editForm.paymentStatus}
                        onChange={handleEditFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs bg-white"
                      >
                        {PAYMENT_STATUS_OPTIONS.map((st) => (
                          <option key={st.value} value={st.value}>
                            {st.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">
                        Payment Mode
                      </label>
                      <select
                        name="paymentType"
                        value={editForm.paymentType}
                        onChange={handleEditFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs bg-white capitalize"
                      >
                        <option value="cash">Cash</option>
                        <option value="online">Online</option>
                        <option value="card">Card</option>
                        <option value="upi">UPI</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">
                        Discount (₹)
                      </label>
                      <input
                        type="number"
                        name="discount"
                        value={editForm.discount}
                        onChange={handleEditFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">
                        Amount Paid (₹)
                      </label>
                      <input
                        type="number"
                        name="amountPaid"
                        value={editForm.amountPaid}
                        onChange={handleEditFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">
                        Total Payable
                      </label>
                      <input
                        type="text"
                        value={getTotalBookingFee(selectedBookingForEdit)}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 text-xs font-bold"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          name="isActive"
                          checked={editForm.isActive}
                          onChange={handleEditFormChange}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-[11px] font-bold uppercase text-gray-600">Active Booking</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-200 bg-gray-50/50 rounded-b-2xl flex-shrink-0">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedBookingForEdit(null);
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-200 hover:bg-gray-300 text-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={editSaving}
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {editSaving ? (
                    <>
                      <FiRefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <FaSave className="w-3.5 h-3.5" /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== VIEW DETAILS MODAL ===== */}
        {showViewModal && selectedBookingForView && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[75] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-200 flex flex-col max-h-[92vh]">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 rounded-t-2xl flex-shrink-0 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-sm flex-shrink-0 shadow-md">
                    {selectedBookingForView.patientName
                      ? selectedBookingForView.patientName.charAt(0).toUpperCase()
                      : "P"}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 text-base truncate">
                      {selectedBookingForView.patientName || "N/A"}
                    </h3>
                    <p className="text-xs text-gray-500">Booking Details</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedBookingForView(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 flex-shrink-0"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {isRescheduled(selectedBookingForView) && (
                  <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden">
                    <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-amber-200 bg-amber-100/60">
                      <FaCalendarPlus className="w-3.5 h-3.5 text-amber-700" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">
                        Reschedule History
                      </h4>
                      {selectedBookingForView.rescheduleCount > 1 && (
                        <span className="ml-auto text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-600 text-white">
                          {selectedBookingForView.rescheduleCount} times
                        </span>
                      )}
                    </div>
                    <div className="p-4 space-y-3">
                      {(selectedBookingForView.rescheduleHistory || []).map((entry, idx) => (
                        <div
                          key={idx}
                          className={`rounded-lg p-3 border ${
                            idx === (selectedBookingForView.rescheduleHistory || []).length - 1
                              ? "bg-white border-amber-300 shadow-sm"
                              : "bg-white/60 border-amber-100"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold uppercase text-amber-700">
                              {idx === (selectedBookingForView.rescheduleHistory || []).length - 1
                                ? "Latest Change"
                                : `Change #${idx + 1}`}
                            </span>
                            {entry.rescheduledAt && (
                              <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                                <FaHistory className="w-2.5 h-2.5" />
                                {formatDateTimeToDDMMYYYY(entry.rescheduledAt)}
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 gap-2">
                            <div className="bg-red-50/60 border border-red-100 rounded-lg p-2">
                              <div className="text-[9px] font-bold uppercase text-red-600 mb-1">
                                Previous Slot
                              </div>
                              <div className="flex items-center justify-between gap-2 text-[11px]">
                                <span className="flex items-center gap-1 text-slate-500 line-through">
                                  <FaCalendarAlt className="w-2.5 h-2.5" />
                                  {formatDateToDDMMYYYY(entry.previousDate)}
                                </span>
                                <span className="flex items-center gap-1 text-slate-500 line-through">
                                  <FaClock className="w-2.5 h-2.5" />
                                  {entry.previousStartTime} - {entry.previousEndTime}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-center">
                              <FaArrowRight className="w-3.5 h-3.5 text-amber-600" />
                            </div>

                            <div className="bg-emerald-50/60 border border-emerald-100 rounded-lg p-2">
                              <div className="text-[9px] font-bold uppercase text-emerald-700 mb-1">
                                New Slot
                              </div>
                              <div className="flex items-center justify-between gap-2 text-[11px]">
                                <span className="flex items-center gap-1 text-emerald-800 font-bold">
                                  <FaCalendarAlt className="w-2.5 h-2.5" />
                                  {formatDateToDDMMYYYY(entry.newDate)}
                                </span>
                                <span className="flex items-center gap-1 text-emerald-800 font-bold">
                                  <FaClock className="w-2.5 h-2.5" />
                                  {entry.newStartTime} - {entry.newEndTime}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-[11px] font-bold uppercase text-gray-400 tracking-wider mb-2.5 flex items-center gap-1.5">
                    <FiUserCheck className="w-3.5 h-3.5 text-blue-500" /> Patient Information
                  </h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 bg-blue-50/40 border border-blue-100 rounded-xl p-4 text-xs">
                    <div>
                      <div className="text-[10px] font-bold uppercase text-gray-400 mb-0.5">Full Name</div>
                      <div className="font-semibold text-slate-800">{selectedBookingForView.patientName || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-gray-400 mb-0.5">Phone</div>
                      <div className="font-semibold text-slate-800">{selectedBookingForView.patientPhone || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-gray-400 mb-0.5">Age</div>
                      <div className="font-semibold text-slate-800">{selectedBookingForView.patientAge || "N/A"} yrs</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-gray-400 mb-0.5">Gender</div>
                      <div className="font-semibold text-slate-800">{selectedBookingForView.patientGender || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-gray-400 mb-0.5">Email</div>
                      <div className="font-semibold text-slate-800 break-all">
                        {selectedBookingForView.patientEmail || "N/A"}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-gray-400 mb-0.5">Date of Birth</div>
                      <div className="font-semibold text-slate-800">
                        {selectedBookingForView.patientDob
                          ? formatDateToDDMMYYYY(selectedBookingForView.patientDob)
                          : "N/A"}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-[10px] font-bold uppercase text-gray-400 mb-0.5">Address</div>
                      <div className="font-semibold text-slate-800">{selectedBookingForView.patientAddress || "N/A"}</div>
                    </div>
                    {(selectedBookingForView.patientCity || selectedBookingForView.patientPincode) && (
                      <div className="col-span-2">
                        <div className="text-[10px] font-bold uppercase text-gray-400 mb-0.5">City / Pincode</div>
                        <div className="font-semibold text-slate-800">
                          {selectedBookingForView.patientCity || ""}{" "}
                          {selectedBookingForView.patientPincode ? `- ${selectedBookingForView.patientPincode}` : ""}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-[11px] font-bold uppercase text-gray-400 tracking-wider mb-2.5 flex items-center gap-1.5">
                    <FiCalendar className="w-3.5 h-3.5 text-purple-500" /> Appointment Information
                  </h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 bg-purple-50/40 border border-purple-100 rounded-xl p-4 text-xs">
                    <div>
                      <div className="text-[10px] font-bold uppercase text-gray-400 mb-0.5">Doctor</div>
                      <div className="font-semibold text-purple-800">{selectedBookingForView.doctorName || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-gray-400 mb-0.5">Specialization</div>
                      <div className="font-semibold text-slate-800">
                        {selectedBookingForView.doctorSpecialization || "N/A"}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-gray-400 mb-0.5">Appointment Date</div>
                      <div className="font-semibold text-slate-800">
                        {formatDateToDDMMYYYY(
                          selectedBookingForView.appointmentDate || selectedBookingForView.date
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-gray-400 mb-0.5">Slot Timing</div>
                      <div className="font-semibold text-blue-700">
                        {selectedBookingForView.startTime && selectedBookingForView.endTime
                          ? `${selectedBookingForView.startTime} - ${selectedBookingForView.endTime}`
                          : "N/A"}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-gray-400 mb-0.5">Shift</div>
                      <div className="font-semibold text-slate-800">{selectedBookingForView.shift || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-gray-400 mb-0.5">Appointment Type</div>
                      <div className="font-semibold text-slate-800">
                        {selectedBookingForView.appointmentType || "N/A"}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-[10px] font-bold uppercase text-gray-400 mb-0.5">Purpose / Reason</div>
                      <div className="font-semibold text-slate-800">{selectedBookingForView.purpose || "N/A"}</div>
                    </div>
                    {selectedBookingForView.symptoms && (
                      <div className="col-span-2">
                        <div className="text-[10px] font-bold uppercase text-gray-400 mb-0.5">Symptoms</div>
                        <div className="font-semibold text-slate-800">{selectedBookingForView.symptoms}</div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-[11px] font-bold uppercase text-gray-400 tracking-wider mb-2.5 flex items-center gap-1.5">
                    <FaRupeeSign className="w-3 h-3 text-emerald-500" /> Payment & Status
                  </h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 bg-emerald-50/40 border border-emerald-100 rounded-xl p-4 text-xs">
                    <div>
                      <div className="text-[10px] font-bold uppercase text-gray-400 mb-0.5">Booking Status</div>
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                          getStatusColors(selectedBookingForView.status).bg
                        } ${getStatusColors(selectedBookingForView.status).text} ${
                          getStatusColors(selectedBookingForView.status).border
                        }`}
                      >
                        {selectedBookingForView.status || "confirmed"}
                      </span>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-gray-400 mb-0.5">Payment Status</div>
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                          selectedBookingForView.paymentStatus === "Paid"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {selectedBookingForView.paymentStatus || "Pending"}
                      </span>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-gray-400 mb-0.5">Payment Mode</div>
                      <div className="font-semibold text-slate-800 capitalize">
                        {selectedBookingForView.paymentType || "cash"}
                      </div>
                    </div>

                    {(selectedBookingForView.paymentTransactionId ||
                      selectedBookingForView.transactionId) && (
                      <div className="col-span-2">
                        <div className="text-[10px] font-bold uppercase text-gray-400 mb-0.5">
                          Transaction ID
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded border border-slate-200 break-all">
                            {selectedBookingForView.paymentTransactionId ||
                              selectedBookingForView.transactionId}
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(
                                selectedBookingForView.paymentTransactionId ||
                                  selectedBookingForView.transactionId
                              );
                              showToast("Transaction ID copied!", "success");
                            }}
                            className="text-[10px] font-bold text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="text-[10px] font-bold uppercase text-gray-400 mb-0.5">Total Amount</div>
                      <div className="font-bold text-emerald-700 text-sm">
                        ₹{getTotalBookingFee(selectedBookingForView)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-gray-400 mb-0.5">Booked On</div>
                      <div className="font-semibold text-slate-800">
                        {formatDateTimeToDDMMYYYY(
                          selectedBookingForView.bookedAt || selectedBookingForView.createdAt
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-gray-400 mb-0.5">Booking Type</div>
                      <div className="font-semibold text-slate-800">
                        {selectedBookingForView.bookingType || "Online"}
                      </div>
                    </div>
                  </div>
                </div>

                {selectedBookingForView.services && selectedBookingForView.services.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold uppercase text-gray-400 tracking-wider mb-2.5 flex items-center gap-1.5">
                      <FiPlusCircle className="w-3.5 h-3.5 text-indigo-500" /> Services (
                      {selectedBookingForView.services.length})
                    </h4>
                    <div className="space-y-2">
                      {selectedBookingForView.services.map((svc, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-indigo-50/40 border border-indigo-100 rounded-lg px-3 py-2 text-xs"
                        >
                          <div className="font-semibold text-slate-800">{svc.name}</div>
                          <div className="font-bold text-indigo-700">₹{svc.price || 0}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {((selectedBookingForView.reports || []).length > 0 ||
                  (selectedBookingForView.prescriptions || []).length > 0) && (
                  <div>
                    <h4 className="text-[11px] font-bold uppercase text-gray-400 tracking-wider mb-2.5 flex items-center gap-1.5">
                      <FiFileText className="w-3.5 h-3.5 text-cyan-500" /> Attachments
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(selectedBookingForView.reports || []).length > 0 && (
                        <button
                          onClick={() => {
                            setShowViewModal(false);
                            openFileListModal(selectedBookingForView, "reports");
                          }}
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors"
                        >
                          <FiFileText className="w-3.5 h-3.5" /> View{" "}
                          {(selectedBookingForView.reports || []).length} Report
                          {(selectedBookingForView.reports || []).length > 1 ? "s" : ""}
                        </button>
                      )}
                      {(selectedBookingForView.prescriptions || []).length > 0 && (
                        <button
                          onClick={() => {
                            setShowViewModal(false);
                            openFileListModal(selectedBookingForView, "prescriptions");
                          }}
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors"
                        >
                          <FiPaperclip className="w-3.5 h-3.5" /> View{" "}
                          {(selectedBookingForView.prescriptions || []).length} Prescription
                          {(selectedBookingForView.prescriptions || []).length > 1 ? "s" : ""}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-200 bg-gray-50/50 rounded-b-2xl flex-shrink-0">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    openBillingModal(selectedBookingForView);
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <FaFileInvoiceDollar className="w-3.5 h-3.5" /> View Bill
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedBookingForView(null);
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-200 hover:bg-gray-300 text-gray-700 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== PAYMENT SUMMARY POPUP ===== */}
        {showPaymentSummaryPopup && selectedBookingForPaymentSummary && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                    <FaRupeeSign className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Payment Summary</h3>
                    <p className="text-[10px] text-gray-500 truncate max-w-[180px]">
                      {selectedBookingForPaymentSummary.patientName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowPaymentSummaryPopup(false);
                    setSelectedBookingForPaymentSummary(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
                >
                  <FaTimes className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-4 space-y-3">
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 font-medium">Total Amount</span>
                    <span className="font-bold text-gray-900">
                      ₹{getTotalBookingFee(selectedBookingForPaymentSummary)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 font-medium">Paid Amount</span>
                    <span className="font-bold text-emerald-700">
                      ₹
                      {selectedBookingForPaymentSummary.paymentStatus === "Paid"
                        ? getTotalBookingFee(selectedBookingForPaymentSummary)
                        : selectedBookingForPaymentSummary.amountPaid || 0}
                    </span>
                  </div>
                  <div className="h-px bg-gray-200" />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-800 font-bold">Balance</span>
                    <span
                      className={`font-bold text-sm ${
                        selectedBookingForPaymentSummary.paymentStatus === "Paid"
                          ? "text-emerald-700"
                          : "text-red-600"
                      }`}
                    >
                      ₹
                      {selectedBookingForPaymentSummary.paymentStatus === "Paid"
                        ? 0
                        : selectedBookingForPaymentSummary.balanceAmount ||
                          getTotalBookingFee(selectedBookingForPaymentSummary)}
                    </span>
                  </div>
                </div>

                {(selectedBookingForPaymentSummary.paymentTransactionId ||
                  selectedBookingForPaymentSummary.transactionId) && (
                  <div className="bg-slate-50 rounded-lg border border-slate-200 p-2">
                    <div className="text-[9px] font-bold uppercase text-gray-400 mb-0.5">Transaction ID</div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-semibold text-slate-700 break-all flex-1">
                        {selectedBookingForPaymentSummary.paymentTransactionId ||
                          selectedBookingForPaymentSummary.transactionId}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            selectedBookingForPaymentSummary.paymentTransactionId ||
                              selectedBookingForPaymentSummary.transactionId
                          );
                          showToast("Copied!", "success");
                        }}
                        className="text-[9px] font-bold text-blue-600 hover:text-blue-800 px-1.5 py-0.5 rounded hover:bg-blue-50 transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="rounded-lg bg-gray-50 border border-gray-200 p-2">
                    <div className="text-[9px] font-bold uppercase text-gray-400 mb-0.5">Status</div>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase border ${
                        selectedBookingForPaymentSummary.paymentStatus === "Paid"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {selectedBookingForPaymentSummary.paymentStatus || "Pending"}
                    </span>
                  </div>
                  <div className="rounded-lg bg-gray-50 border border-gray-200 p-2">
                    <div className="text-[9px] font-bold uppercase text-gray-400 mb-0.5">Payment Mode</div>
                    <div className="font-semibold text-slate-800 capitalize">
                      {selectedBookingForPaymentSummary.paymentType || "cash"}
                    </div>
                  </div>
                </div>

                {selectedBookingForPaymentSummary.paymentStatus !== "Paid" && (
                  <button
                    onClick={handleMarkAsPaidFromSummary}
                    disabled={markingPaid}
                    className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all disabled:opacity-50"
                  >
                    {markingPaid ? (
                      <>
                        <FiRefreshCw className="w-3.5 h-3.5 animate-spin" /> Marking...
                      </>
                    ) : (
                      <>
                        <FaCheckCircle className="w-3.5 h-3.5" /> Mark as Paid
                      </>
                    )}
                  </button>
                )}

                {selectedBookingForPaymentSummary.paymentStatus === "Paid" && (
                  <div className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                    <FaCheckCircle className="w-3.5 h-3.5" /> Payment Completed
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                <button
                  onClick={() => {
                    setShowPaymentSummaryPopup(false);
                    openBillingModal(selectedBookingForPaymentSummary);
                  }}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center gap-1"
                >
                  <FaFileInvoiceDollar className="w-3 h-3" /> View Bill
                </button>
                <button
                  onClick={() => {
                    setShowPaymentSummaryPopup(false);
                    setSelectedBookingForPaymentSummary(null);
                  }}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-gray-200 hover:bg-gray-300 text-gray-700 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== DIRECT FILE PREVIEW MODAL ===== */}
        {previewFile && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl border border-gray-200 flex flex-col max-h-[92vh]">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 rounded-t-2xl flex-shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-md flex-shrink-0 ${
                      previewFile.type === "pdf"
                        ? "bg-red-600 text-white shadow-red-500/20"
                        : "bg-indigo-600 text-white shadow-indigo-500/20"
                    }`}
                  >
                    {previewFile.type === "pdf" ? (
                      <FiFileText className="w-5 h-5" />
                    ) : (
                      <FiEye className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 text-base truncate">{previewFile.name}</h3>
                    <p className="text-xs text-gray-500">File Preview</p>
                  </div>
                </div>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 flex-shrink-0"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-4 bg-gray-100">
                <div className="rounded-xl bg-gray-100 flex items-center justify-center min-h-[400px]">
                  {previewFile.type === "image" ? (
                    <img
                      src={previewFile.url}
                      alt={previewFile.name}
                      className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg bg-white"
                    />
                  ) : previewFile.type === "pdf" ? (
                    <iframe
                      src={previewFile.url}
                      title={previewFile.name}
                      className="w-full h-[70vh] rounded-lg shadow-lg bg-white border-0"
                    />
                  ) : (
                    <div className="text-center py-12">
                      <FiFileText className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-gray-600 mb-1">Preview not available</p>
                      <p className="text-xs text-gray-400 mb-4">
                        This file type cannot be previewed in the browser. Use Download button below.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-200 bg-gray-50/50 rounded-b-2xl flex-shrink-0">
                <button
                  onClick={downloadPreviewFile}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <FaDownload className="w-3.5 h-3.5" /> Download
                </button>
                <button
                  onClick={printPreviewFile}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <FiPrinter className="w-3.5 h-3.5" /> Print
                </button>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-200 hover:bg-gray-300 text-gray-700 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== VITALS MODAL ===== */}
        {showVitalsModal && vitalsBooking && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-gray-200">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-pink-500 text-white flex items-center justify-center">
                    <FaHeartbeat className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Vitals</h3>
                    <p className="text-[10px] text-gray-500">{vitalsBooking.patientName}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowVitalsModal(false);
                    setVitalsBooking(null);
                    setVitalsData({ temp: "", bp: "", pr: "", weight: "" });
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-pink-700 uppercase tracking-wider mb-1">
                    Temp (°F)
                  </label>
                  <input
                    type="text"
                    value={vitalsData.temp}
                    onChange={(e) => setVitalsData((prev) => ({ ...prev, temp: e.target.value }))}
                    placeholder="e.g. 98.6"
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-pink-700 uppercase tracking-wider mb-1">
                    BP (mmHg)
                  </label>
                  <input
                    type="text"
                    value={vitalsData.bp}
                    onChange={(e) => setVitalsData((prev) => ({ ...prev, bp: e.target.value }))}
                    placeholder="e.g. 120/80"
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-pink-700 uppercase tracking-wider mb-1">
                    PR (bpm)
                  </label>
                  <input
                    type="text"
                    value={vitalsData.pr}
                    onChange={(e) => setVitalsData((prev) => ({ ...prev, pr: e.target.value }))}
                    placeholder="e.g. 72"
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-pink-700 uppercase tracking-wider mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="text"
                    value={vitalsData.weight}
                    onChange={(e) => setVitalsData((prev) => ({ ...prev, weight: e.target.value }))}
                    placeholder="e.g. 70"
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 px-5 py-3 border-t border-gray-200 bg-gray-50/50 rounded-b-2xl">
                <button
                  onClick={() => {
                    setShowVitalsModal(false);
                    setVitalsBooking(null);
                    setVitalsData({ temp: "", bp: "", pr: "", weight: "" });
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-200 hover:bg-gray-300 text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveVitals}
                  disabled={savingVitals}
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-pink-600 hover:bg-pink-700 text-white shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  {savingVitals ? (
                    <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <FiCheckCircle className="w-3.5 h-3.5" />
                  )}
                  {savingVitals ? "Saving..." : "Save Vitals"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== REVIEW MODAL ===== */}
        {showReviewModal && reviewBooking && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-200 relative">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                    <FaStar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Patient Review</h3>
                    <p className="text-xs text-gray-500">
                      {reviewBooking.patientName} • {reviewBooking.patientPhone}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    setReviewBooking(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="text-[10px] font-bold uppercase text-gray-400 mb-3">Appointment Details</div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Doctor</span>
                      <span className="font-bold text-gray-900">{reviewBooking.doctorName || "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Appointment Date</span>
                      <span className="font-bold text-gray-900">
                        {formatDateToDDMMYYYY(reviewBooking.appointmentDate || reviewBooking.date)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Purpose</span>
                      <span className="font-bold text-gray-900 truncate max-w-[180px]">
                        {reviewBooking.purpose || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {reviewBooking.isReviewed ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FaCheckCircle className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-emerald-800">Already Reviewed</span>
                    </div>
                    <p className="text-[11px] text-emerald-700">
                      Reviewed on:{" "}
                      <b>
                        {formatDateTimeToDDMMYYYY(
                          reviewBooking.reviewDate || new Date().toISOString()
                        )}
                      </b>
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="text-[10px] font-bold uppercase text-amber-700 mb-1">
                        Review Window
                      </div>
                      <p className="text-[11px] text-amber-800">
                        {(() => {
                          const rStatus = getReviewWindowStatus(reviewBooking);
                          return rStatus.canReview
                            ? `You have ${rStatus.daysLeft} day${rStatus.daysLeft !== 1 ? "s" : ""} left to mark this review.`
                            : "Review window is not available.";
                        })()}
                      </p>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-[11px] text-blue-800">
                        Clicking <b>"Mark as Reviewed"</b> will set <b>isReviewed: true</b> and record the
                        current date/time.
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50/50">
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    setReviewBooking(null);
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-200 hover:bg-gray-300 text-gray-700"
                >
                  {reviewBooking.isReviewed ? "Close" : "Cancel"}
                </button>
                {!reviewBooking.isReviewed && (
                  <button
                    onClick={handleSaveReview}
                    disabled={savingReview}
                    className="px-5 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {savingReview ? (
                      <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <FaCheckCircle className="w-3.5 h-3.5" />
                    )}
                    {savingReview ? "Saving..." : "Mark as Reviewed"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== BILLING MODAL ===== */}
        {showBillingModal && selectedBookingForBilling && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-gray-200 relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
                    <FaFileInvoiceDollar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Bill Cum Receipt</h3>
                    <p className="text-xs text-gray-500">
                      {selectedBookingForBilling.patientName} • {billingData.invoiceNo}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowBillingModal(false);
                    setSelectedBookingForBilling(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>

              <div id="bill-content" className="p-6 md:p-8 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.04] pointer-events-none w-64 h-64">
                  <img src={logo} alt={CLINIC_INFO.name} className="w-full h-full object-contain" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between border-b-2 border-gray-800 pb-4 mb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <img src={logo} alt={CLINIC_INFO.name} className="w-14 h-14 object-contain" />
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 tracking-wide">{CLINIC_INFO.name}</h2>
                        <p className="text-[11px] text-gray-500 max-w-sm">{CLINIC_INFO.address}</p>
                      </div>
                    </div>
                    <div className="text-right text-[11px] text-gray-500">Contact No : {CLINIC_INFO.contact}</div>
                  </div>

                  <div className="text-center bg-gray-100 border-y border-gray-300 py-1.5 mb-4">
                    <span className="text-sm font-bold tracking-widest text-gray-800 uppercase">
                      Bill Cum Receipt
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs mb-5">
                    <div>
                      <span className="font-bold text-gray-500 inline-block w-28">Name</span>:{" "}
                      <span className="font-semibold text-gray-900">
                        {selectedBookingForBilling.patientName || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-500 inline-block w-28">Invoice No / Date</span>:{" "}
                      <span className="font-semibold text-gray-900">
                        {billingData.invoiceNo} / {billingData.invoiceDate}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-500 inline-block w-28">Age</span>:{" "}
                      <span className="font-semibold text-gray-900">
                        {selectedBookingForBilling.patientAge || "N/A"} Yrs
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-500 inline-block w-28">Gender</span>:{" "}
                      <span className="font-semibold text-gray-900">
                        {selectedBookingForBilling.patientGender || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-500 inline-block w-28">Branch</span>:{" "}
                      <span className="font-semibold text-gray-900">{billingData.branch}</span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-500 inline-block w-28">Contact No</span>:{" "}
                      <span className="font-semibold text-gray-900">
                        {selectedBookingForBilling.patientPhone || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-500 inline-block w-28">Doctor</span>:{" "}
                      <span className="font-semibold text-gray-900">{billingData.doctorName}</span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-500 inline-block w-28">Appt. Date</span>:{" "}
                      <span className="font-semibold text-gray-900">
                        {formatDateToDDMMYYYY(selectedBookingForBilling.date)}
                      </span>
                    </div>

                    <div>
                      <span className="font-bold text-gray-500 inline-block w-28">Payment Mode</span>:{" "}
                      <span className="font-semibold text-gray-900">{billingData.paymentMode}</span>
                    </div>

                    {billingData.transactionId && (
                      <div className="sm:col-span-2">
                        <span className="font-bold text-gray-500 inline-block w-28">Txn ID</span>:{" "}
                        <span className="font-mono text-[11px] font-semibold text-gray-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {billingData.transactionId}
                        </span>
                      </div>
                    )}
                  </div>

                  <table className="w-full mb-3 border-t-2 border-b-2 border-gray-800">
                    <thead>
                      <tr className="border-b border-gray-300">
                        <th className="text-left py-1.5 text-[11px] font-bold text-gray-600 w-6">No.</th>
                        <th className="text-left py-1.5 text-[11px] font-bold text-gray-600 w-[28%]">
                          Service / Item
                        </th>
                        <th className="text-left py-1.5 text-[11px] font-bold text-gray-600 w-[16%]">
                          Service Code
                        </th>
                        <th className="text-left py-1.5 text-[11px] font-bold text-gray-600 w-[20%]">Remarks</th>
                        <th className="text-right py-1.5 text-[11px] font-bold text-gray-600 w-[14%]">
                          Amount
                        </th>
                        <th className="text-center py-1.5 text-[11px] font-bold text-gray-600 w-[16%]">
                          Payment Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {billingData.items.map((item) => (
                        <tr key={item.no} className="border-b border-gray-100">
                          <td className="py-1.5 text-xs text-gray-700">{item.no}</td>
                          <td className="py-1.5 text-xs font-medium text-gray-800">{item.name}</td>
                          <td className="py-1.5 text-xs text-gray-600">{item.serviceCode}</td>
                          <td className="py-1.5 text-xs text-gray-500">{item.remarks}</td>
                          <td className="py-1.5 text-xs text-right font-semibold text-gray-800">
                            ₹{Number(item.amount).toFixed(2)}
                          </td>
                          <td className="py-1.5 text-xs text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                item.paymentStatus === "Paid"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {item.paymentStatus || "Pending"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="flex flex-col items-end mb-3">
                    <div className="w-full max-w-xs text-xs">
                      <div className="flex justify-between py-1 border-b border-gray-200">
                        <span className="text-gray-600">Gross Bill Amount</span>
                        <span className="font-bold text-gray-900">
                          ₹ {billingData.grossAmount.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-200">
                        <span className="text-gray-600">Net Amount</span>
                        <span className="font-bold text-gray-900">₹ {billingData.netAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-200">
                        <span className="text-gray-600">Paid Amount</span>
                        <span className="font-bold text-emerald-700">₹ {billingData.paidAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between py-1.5 mt-1 border-t-2 border-gray-800">
                        <span className="font-bold text-gray-800">Balance to Pay</span>
                        <span
                          className={`font-bold ${
                            billingData.balanceAmount > 0 ? "text-red-600" : "text-emerald-700"
                          }`}
                        >
                          ₹ {billingData.balanceAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-2 pt-4 mt-2 border-t border-gray-200 text-[11px] text-gray-500">
                    <span>
                      Printed Date :{" "}
                      {new Date().toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className="font-bold text-gray-700">Authorized Signature</span>
                  </div>
                  <div className="mt-3 text-[10px] text-gray-400 italic">
                    * Bills cannot be cancelled once registered.
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50/50">
                {billingData.paymentStatus === "Pending" && (
                  <button
                    onClick={handleMarkAsPaid}
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <FaCheckCircle className="w-3.5 h-3.5" /> Mark as Paid
                  </button>
                )}
                <button
                  onClick={printBill}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all flex items-center gap-1.5"
                >
                  <FaPrint className="w-3.5 h-3.5" /> Print Bill
                </button>
                <button
                  onClick={() => {
                    setShowBillingModal(false);
                    setSelectedBookingForBilling(null);
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-200 hover:bg-gray-300 text-gray-700 transition-all"
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