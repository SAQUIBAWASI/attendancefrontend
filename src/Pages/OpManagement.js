// OpManagement.js — Full Refactored Version (with City→Pincode Auto-Fetch + Clean B/W Bill + Discount)
import React, { useState, useEffect, useMemo, useRef } from "react";
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
  FaToggleOn, FaToggleOff
} from "react-icons/fa";
import {
  FiUsers, FiUserCheck, FiClock, FiFilter, FiDownload, FiTrash2, FiPlus,
  FiEdit2, FiEye, FiRefreshCw, FiCheckCircle, FiXCircle, FiCalendar,
  FiFileText, FiDollarSign, FiPlusCircle, FiChevronDown, FiChevronUp,
  FiAlertCircle, FiLock
} from "react-icons/fi";
import "./EmployeeDashboard.css";
import "./EmployeeLeaves.css";
import logo from "../Images/Timelyhealth logo.png";
import prescriptionTemplate from "../Images/prescription.jpg";
import prescriptionBackTemplate from "../Images/prescriptionbackside.jpg";
import { useNavigate } from "react-router-dom";

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
  { value: "card", label: "Card" }
];

const PAYMENT_STATUS_OPTIONS = [
  { value: "Pending", label: "Pending" },
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

const EMPTY_FORM = {
  title: "Mr.",
  name: "",
  dob: "",
  age: "",
  gender: "",
  phone: "",
  address: "",
  city: "",
  pincode: "",
  serviceItems: [],
  paymentType: "cash",
  reason: "",
  paymentStatus: "Pending",
  doctorId: "",
  slotId: "",
  appointmentDate: "",
  selectedServices: [],
  referredByCustomer: "",
  referredByDoctor: "",
  referralCustomerId: "",
  referralDoctorId: "",
  referralCommission: "",
  referralCommissionType: "",
  partialAmount: "",
  discount: "",
  bookingId: "",
  status: "confirmed"
};

const CLINIC_INFO = {
  name: "TimelyHealth",
  address:
    "Flat No: 301, 3rd Floor, Sri Sai Balaji Avenue, H. No: 1-98/9/25/p, Opp Style on Studio, VIP Hills, near Bank of Baroda, Arunodaya Colony, Sri Sai Nagar, Madhapur, Hyderabad, Telangana 500081",
  contact: "9505397000"
};

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
    return `${day}/${month}/${date.getFullYear()}`;
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
  const map = {
    Paid: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: FaCheckCircle, iconColor: "text-emerald-600" },
    Partial: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: FaClock, iconColor: "text-amber-600" },
    Pending: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", icon: FaClock, iconColor: "text-gray-500" },
    Due: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: FaTimesCircle, iconColor: "text-red-500" }
  };
  return map[status] || map.Pending;
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
  return arr.map((s) => ({
    serviceId: s.serviceId || s._id || "",
    _id: s.serviceId || s._id || "",
    name: s.name || "Service",
    price: Number(s.price) || 0,
    description: s.description || "",
    category: s.category || s.serviceCategory || s.type || "",
    paymentStatus: s.paymentStatus || booking.paymentStatus || "Pending",
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

const getAmountBreakdown = (booking) => {
  if (!booking) return { clinic: 0, lab: 0, pharmacy: 0, total: 0, manualMedicineTotal: 0, manualLabTotal: 0 };

  const services = getBookingServices(booking);
  let clinic = 0, lab = 0, pharmacy = 0;

  services.forEach((s) => {
    const cat = classifyService(s);
    const price = Number(s.price) || 0;
    if (cat === "lab") lab += price;
    else if (cat === "pharmacy") pharmacy += price;
    else clinic += price;
  });

  const manualMedicineTotal = Number(booking?.medicineTotal) || 0;
  const manualLabTotal = Number(booking?.labTotal) || 0;

  pharmacy += manualMedicineTotal;
  lab += manualLabTotal;

  const computed = clinic + lab + pharmacy;
  if (computed === 0) {
    const fallback =
      Number(booking.finalPayable) ||
      Number(booking.finalPayableAmount) ||
      Number(booking.grandTotal) ||
      Number(booking.totalAmount) ||
      0;
    clinic = fallback;
  }

  return {
    clinic,
    lab,
    pharmacy,
    total: clinic + lab + pharmacy,
    manualMedicineTotal,
    manualLabTotal,
  };
};

const getBookingSubtotal = (booking) => {
  if (!booking) return 0;
  const items = getBookingServices(booking);
  return items.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
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
  const subtotal = getBookingSubtotal(booking);
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

const fetchCityFromPincode = async (pincode) => {
  if (!pincode || pincode.trim().length < 6) return null;
  try {
    const res = await axios.get(
      `https://api.postalpincode.in/pincode/${encodeURIComponent(pincode.trim())}`
    );
    if (Array.isArray(res.data) && res.data[0]?.Status === "Success") {
      const offices = res.data[0].PostOffice || [];
      if (offices.length > 0) {
        const first = offices[0];
        return {
          city: first.District || first.Block || first.Name || "",
          state: first.State || "",
          area: first.Name || "",
          allOffices: offices,
        };
      }
    }
    return null;
  } catch (err) {
    console.warn("City fetch failed:", err);
    return null;
  }
};

export default function OpManagement() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
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

  const [openStatusDropdown, setOpenStatusDropdown] = useState(null);
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
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [activeCardFilter, setActiveCardFilter] = useState("all");

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

  const [showBillingModal, setShowBillingModal] = useState(false);
  const [selectedBookingForBilling, setSelectedBookingForBilling] = useState(null);
const [billingData, setBillingData] = useState({
  invoiceNo: "", invoiceDate: "", receiptNo: "", receiptDate: "",
  paymentMode: "Cash", receivedBy: "Front Desk", branch: "", doctorName: "",
  items: [], grossAmount: 0, netAmount: 0, paidAmount: 0, balanceAmount: 0,
  discount: 0,
  paymentStatus: "Pending", amountInWords: "",
  breakdown: { clinic: 0, lab: 0, pharmacy: 0 }
});

  const [showMedicineTotalModal, setShowMedicineTotalModal] = useState(false);
  const [medicineTotalBooking, setMedicineTotalBooking] = useState(null);
  const [editingMedicineTotal, setEditingMedicineTotal] = useState("");
  const [savingMedicineTotal, setSavingMedicineTotal] = useState(false);

  const [showLabTotalModal, setShowLabTotalModal] = useState(false);
  const [labTotalBooking, setLabTotalBooking] = useState(null);
  const [editingLabTotal, setEditingLabTotal] = useState("");
  const [savingLabTotal, setSavingLabTotal] = useState(false);

  const [showPartialModal, setShowPartialModal] = useState(false);
  const [partialBooking, setPartialBooking] = useState(null);
  const [partialAmountInput, setPartialAmountInput] = useState("");
  const [savingPartial, setSavingPartial] = useState(false);

  const [citySuggestions, setCitySuggestions] = useState([]);
  const [fetchingCity, setFetchingCity] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const pincodeDebounceRef = useRef(null);

  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [vitalsBooking, setVitalsBooking] = useState(null);
  const [vitalsData, setVitalsData] = useState({ temp: "", bp: "", pr: "", weight: "" });
  const [savingVitals, setSavingVitals] = useState(false);

  const [togglingStatus, setTogglingStatus] = useState(null);

  const phoneInputRef = useRef(null);
  const nameInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const hasActiveFilters =
    searchQuery !== "" || statusFilter !== "All" || feeTypeFilter !== "All" ||
    doctorFilter !== "All" || fromDate !== "" || toDate !== "" ||
    (selectedMonth && selectedMonth !== "");

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const patients = useMemo(() => {
    const map = new Map();
    const sortedBookings = [...bookings].sort(
      (a, b) => new Date(b.createdAt || b.bookedAt || 0) - new Date(a.createdAt || a.bookedAt || 0)
    );
    sortedBookings.forEach((b) => {
      const key = (b.patientPhone || b.patientName || "").toString().trim();
      if (!key) return;
      if (!map.has(key)) {
        map.set(key, {
          _id: b.patientId || b._id || key,
          title: b.patientTitle || "Mr.",
          name: b.patientName || "",
          dob: b.patientDob || "",
          age: b.patientAge || "",
          gender: b.patientGender || "",
          phone: b.patientPhone || "",
          email: b.patientEmail || "",
          address: b.patientAddress || "",
          city: b.patientCity || "",
          pincode: b.patientPincode || "",
          bloodGroup: b.patientBloodGroup || "",
          medicalHistory: b.patientMedicalHistory || "",
          allergies: b.patientAllergies || "",
          medications: b.patientMedications || "",
          reason: b.purpose || "",
          paymentType: b.paymentType || "cash",
          paymentStatus: b.paymentStatus || "Pending",
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
    if (formData.doctorId && formData.appointmentDate) {
      filterSlotsByDoctorAndDate(formData.doctorId, formData.appointmentDate);
    }
  }, [formData.doctorId, formData.appointmentDate]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".status-dropdown")) setOpenStatusDropdown(null);
      if (!e.target.closest(".payment-dropdown")) setOpenPaymentDropdown(null);
      if (!e.target.closest(".service-dropdown-add-patient")) setShowServiceSuggestions(false);
      if (!e.target.closest(".city-dropdown-add-patient")) setShowCitySuggestions(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
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
      const res = await axios.get(`${API_BASE_URL}/appointment-slots/getallbookings`);
      let bookingsData = [];
      if (res.data?.success) {
        bookingsData = res.data.bookings || res.data.data || [];
      } else if (Array.isArray(res.data)) {
        bookingsData = res.data;
      }

      const transformedBookings = bookingsData.map((b) => {
        const slotDetails = b.slotDetails || {};
        const rawServices =
          (Array.isArray(b.services) && b.services.length > 0 && b.services) ||
          (Array.isArray(b.serviceItems) && b.serviceItems.length > 0 && b.serviceItems) ||
          [];

        const normalizedServices = rawServices.map((s) => ({
          serviceId: s.serviceId || s._id || "",
          _id: s.serviceId || s._id || "",
          name: s.name || "Service",
          price: Number(s.price) || 0,
          description: s.description || "",
          category: s.category || s.serviceCategory || s.type || "",
          paymentStatus: s.paymentStatus || b.paymentStatus || "Pending",
          addedAt: s.addedAt || b.createdAt || new Date().toISOString(),
        }));

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
          paymentStatus: b.paymentStatus || "Pending",
          partialAmount: Number(b.partialAmount) || 0,
          subtotal, commissionAmount, discount, finalPayable, finalPayableAmount: finalPayable,
          totalAmount, grandTotal: totalAmount, amountPaid, balanceAmount,
          tax: Number(b.tax) || 0,
          status: b.status || "confirmed",
          services: normalizedServices,
          serviceItems: normalizedServices,
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

  const filterSlotsByDoctorAndDate = (doctorId, date) => {
    if (!doctorId || !date) { setAvailableSlots([]); return; }
    setSlotsLoading(true);
    setAvailableSlots([]);
    setFormData((prev) => ({ ...prev, slotId: "" }));
    try {
      const selectedDay = getDayNameFromDate(date);
      let filtered = allSlots.filter((slot) =>
        slot.doctorId === doctorId && slot.dayOfWeek === selectedDay && slot.type !== "break"
      );
      const seen = new Set();
      filtered = filtered.filter((slot) => {
        if (seen.has(slot.startTime)) return false;
        seen.add(slot.startTime);
        return true;
      });
      filtered.sort((a, b) => a.startTime.localeCompare(b.startTime));
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
        const derived = patients.find((p) => p.phone === value) || {
          _id: latest.patientId || latest._id,
          title: latest.patientTitle || "Mr.",
          name: latest.patientName || "",
          dob: latest.patientDob || "",
          age: latest.patientAge || "",
          gender: latest.patientGender || "",
          phone: latest.patientPhone || "",
          address: latest.patientAddress || "",
          city: latest.patientCity || "",
          pincode: latest.patientPincode || "",
          reason: latest.purpose || "",
          paymentType: latest.paymentType || "cash",
          paymentStatus: latest.paymentStatus || "Pending",
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
      } else {
        setExistingPatient(null);
        setShowExistingPatientPopup(false);
      }
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
      serviceItems: existingPatient.serviceItems || [],
      paymentType: existingPatient.paymentType || "cash",
      reason: existingPatient.reason || "",
      paymentStatus: existingPatient.paymentStatus || "Pending",
      referredByCustomer: existingPatient.referredByCustomer || "",
      referredByDoctor: existingPatient.referredByDoctor || "",
      referralCustomerId: existingPatient.referralCustomerId || "",
      referralDoctorId: existingPatient.referralDoctorId || "",
      referralCommission: existingPatient.referralCommission || "",
      referralCommissionType: existingPatient.referralCommissionType || ""
    }));
    setCitySuggestions([]);
    setShowCitySuggestions(false);
    setShowExistingPatientPopup(false);
    showToast(`Patient ${existingPatient.name} details auto-filled!`, "info");
  };

  const handleDobChange = (dob) => {
    const newAge = calculateAgeFromDOB(dob);
    setFormData((prev) => {
      const autoTitle = autoSelectTitleFromDob(dob, prev.gender);
      return { ...prev, dob, age: newAge, title: autoTitle || prev.title };
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

    if (!value || value.length < 6) {
      setCitySuggestions([]);
      setShowCitySuggestions(false);
      return;
    }

    pincodeDebounceRef.current = setTimeout(async () => {
      setFetchingCity(true);
      const result = await fetchCityFromPincode(value);
      setFetchingCity(false);

      if (result) {
        setCitySuggestions(result.allOffices.map((o) => ({
          pincode: o.Pincode,
          area: o.Name,
          district: o.District,
          state: o.State,
        })));
        setShowCitySuggestions(true);
        setFormData((prev) => ({
          ...prev,
          city: prev.city || result.city,
        }));
      } else {
        setCitySuggestions([]);
        setShowCitySuggestions(false);
      }
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
    setFormData((prev) => ({
      ...prev,
      referredByCustomer: contact.customerName || "",
      referralCustomerId: contact._id,
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

  const handleAddCustomerReferral = () => navigate("/customer-referrals");
  const handleAddDoctorReferral = () => navigate("/doctor-referrals");

  const handleAddServiceItem = (service) => {
    if (!service) return;
    if (formData.serviceItems.some((s) => s._id === service._id)) {
      showToast("Service already added!", "info");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      serviceItems: [...prev.serviceItems, { ...service, custom: false }]
    }));
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
      } else {
        showToast(res.data?.message || "Failed to create service", "error");
      }
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to create service", "error");
    }
  };

  const handleRemoveServiceItem = (serviceId) => {
    setFormData((prev) => ({
      ...prev,
      serviceItems: prev.serviceItems.filter((s) => s._id !== serviceId)
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      setFormData((prev) => ({ ...prev, [name]: value }));
      checkExistingPatient(value);
    } else if (name === "dob") {
      handleDobChange(value);
    } else if (name === "gender") {
      handleGenderChange(value);
    } else if (name === "title") {
      handleTitleChange(value);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSlotSelect = (slotId) => setFormData((prev) => ({ ...prev, slotId }));

  const handleEdit = (patient, existingBooking) => {
    const today = new Date().toISOString().split("T")[0];
    const doctorId = existingBooking?.doctorId || "";
    const appointmentDate = existingBooking?.appointmentDate || existingBooking?.date || today;
    const slotId = existingBooking?.slotId || existingBooking?._id || "";
    const bookingId = existingBooking?._id || "";

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
      paymentStatus: existingBooking?.paymentStatus || patient.paymentStatus || "Pending",
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
      serviceName: "", servicePrice: "",
      status: existingBooking?.status || "confirmed"
    });

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
  };

  const handleToggleActiveStatus = async (patient) => {
    const matchingBooking = getMatchingBooking(patient);
    if (!matchingBooking) {
      showToast("No booking found for this patient", "error");
      return;
    }
    const currentStatus = matchingBooking.isActive !== undefined ? matchingBooking.isActive : true;
    const newStatus = !currentStatus;

    setTogglingStatus(patient._id);
    try {
      const res = await axios.put(
        `${API_BASE_URL}/appointment-slots/toggle-active/${matchingBooking._id}`,
        { isActive: newStatus }
      );
      if (res?.data?.success) {
        showToast(`Patient marked as ${newStatus ? "Active" : "Inactive"}!`, "success");
        await fetchBookings();
        refreshPatientBookings();
      } else {
        showToast(res.data.message || "Failed to update status", "error");
      }
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to update status", "error");
    } finally {
      setTogglingStatus(null);
    }
  };

  const handleRowClick = (patient) => fetchPatientData(patient);

  const fetchPatientData = async (patient) => {
    setHistoryLoading(true);
    setSelectedPatient(patient);
    try {
      const list = bookings.filter(
        (b) => b.patientPhone === patient.phone ||
          (b.patientName && patient.name && b.patientName.toLowerCase() === patient.name.toLowerCase())
      );
      list.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
      setPatientBookings(list);
      setShowPatientModal(true);
    } catch (err) {
      console.error("Error fetching patient data:", err);
      showToast("Failed to fetch patient data", "error");
    } finally { setHistoryLoading(false); }
  };

  const handleStatusDropdownToggle = (bookingId, e) => {
    e.stopPropagation();
    setOpenStatusDropdown(openStatusDropdown === bookingId ? null : bookingId);
  };

  const handleStatusSelect = async (booking, status, e) => {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    if (statusUpdating || status === booking.status) { setOpenStatusDropdown(null); return; }
    setStatusUpdating(true);
    try {
      const res = await axios.put(`${API_BASE_URL}/appointment-slots/${booking._id}`, { status });
      if (res?.data?.success) {
        showToast(`Status updated to ${status}!`, "success");
        setOpenStatusDropdown(null);
        await fetchBookings();
        refreshPatientBookings();
      } else showToast(res.data.message || "Failed to update status", "error");
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to update status", "error");
    } finally { setStatusUpdating(false); }
  };

  const handlePaymentDropdownToggle = (bookingId, e) => {
    e.stopPropagation();
    setOpenPaymentDropdown(openPaymentDropdown === bookingId ? null : bookingId);
  };

  const handlePaymentSelect = async (booking, paymentStatus, e) => {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    if (paymentUpdating || paymentStatus === booking.paymentStatus) {
      setOpenPaymentDropdown(null);
      return;
    }

    if (paymentStatus === "Partial") {
      openPartialModal(booking);
      setOpenPaymentDropdown(null);
      return;
    }

    setPaymentUpdating(true);
    try {
      const res = await axios.put(`${API_BASE_URL}/appointment-slots/${booking._id}`, { paymentStatus });
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
      const updated = bookings.filter(
        (b) => b.patientPhone === selectedPatient.phone ||
          (b.patientName && selectedPatient.name && b.patientName.toLowerCase() === selectedPatient.name.toLowerCase())
      );
      updated.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
      setPatientBookings(updated);
    }
  };

  const openPartialModal = (booking) => {
    setPartialBooking(booking);
    setPartialAmountInput(String(booking.amountPaid || booking.partialAmount || ""));
    setShowPartialModal(true);
  };

  const handleMarkFullPaid = async () => {
    if (!partialBooking) return;
    const finalPayable = getBookingFinalPayable(partialBooking);

    setSavingPartial(true);
    try {
      const res = await axios.put(`${API_BASE_URL}/appointment-slots/${partialBooking._id}`, {
        paymentStatus: "Paid",
        amountPaid: finalPayable,
        partialAmount: finalPayable,
        balanceAmount: 0,
      });
      if (res?.data?.success) {
        showToast(`✅ Payment marked as Fully Paid! ₹${Math.round(finalPayable)} cleared.`, "success");
        setShowPartialModal(false);
        setPartialBooking(null);
        setPartialAmountInput("");
        await fetchBookings();
        refreshPatientBookings();
      } else showToast(res.data.message || "Failed to update payment", "error");
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to update payment", "error");
    } finally {
      setSavingPartial(false);
    }
  };

  const openMedicineTotalModal = (booking) => {
    setMedicineTotalBooking(booking);
    setEditingMedicineTotal(String(booking.medicineTotal || 0));
    setShowMedicineTotalModal(true);
  };

  const handleSaveMedicineTotal = async () => {
    if (!medicineTotalBooking) return;
    const total = parseFloat(editingMedicineTotal) || 0;
    if (total < 0) { showToast("Invalid amount", "error"); return; }
    setSavingMedicineTotal(true);
    try {
      const res = await axios.put(
        `${API_BASE_URL}/appointment-slots/updatecharges/${medicineTotalBooking._id}`,
        { medicineTotal: total }
      );
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
    setEditingLabTotal(String(booking.labTotal || 0));
    setShowLabTotalModal(true);
  };

  const handleSaveLabTotal = async () => {
    if (!labTotalBooking) return;
    const total = parseFloat(editingLabTotal) || 0;
    if (total < 0) { showToast("Invalid amount", "error"); return; }
    setSavingLabTotal(true);
    try {
      const res = await axios.put(
        `${API_BASE_URL}/appointment-slots/updatecharges/${labTotalBooking._id}`,
        { labTotal: total }
      );
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
        refreshPatientBookings();
      } else {
        showToast(res.data.message || "Failed to save vitals", "error");
      }
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to save vitals", "error");
    } finally {
      setSavingVitals(false);
    }
  };

  const handleBookNow = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || formData.age === "" || !formData.gender) {
      showToast("Please fill all required fields", "error"); return;
    }
    if (!formData.doctorId) { showToast("Please select a doctor", "error"); return; }
    if (!formData.slotId) { showToast("Please select an available slot", "error"); return; }
    if (formData.serviceItems.length === 0) { showToast("Please add at least one service", "error"); return; }
    if (formData.paymentStatus === "Partial" && (!formData.partialAmount || parseFloat(formData.partialAmount) <= 0)) {
      showToast("Please enter partial amount received", "error"); return;
    }

    setSubmitting(true);
    try {
      const subtotal = formData.serviceItems.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
      const commissionPercent = parseFloat(formData.referralCommission) || 0;
      const commissionAmount = (subtotal * commissionPercent) / 100;
      const discountAmount = parseFloat(formData.discount) || 0;
      const finalPayable = subtotal - commissionAmount - discountAmount;

      const parsedPartial = parseFloat(formData.partialAmount) || 0;
      let paymentStatus = formData.paymentStatus;
      let amountPaid = 0;
      let balanceAmount = finalPayable;

      if (paymentStatus === "Paid") {
        amountPaid = finalPayable; balanceAmount = 0;
      } else if (paymentStatus === "Partial" && parsedPartial > 0) {
        amountPaid = parsedPartial;
        balanceAmount = finalPayable - parsedPartial;
        if (balanceAmount <= 0) { paymentStatus = "Paid"; amountPaid = finalPayable; balanceAmount = 0; }
      } else if (paymentStatus === "Due") {
        amountPaid = 0; balanceAmount = finalPayable;
      }

      const bookingPayload = {
        patientTitle: formData.title,
        patientName: formData.name,
        patientPhone: formData.phone,
        patientAge: formData.age,
        patientDob: formData.dob,
        patientGender: formData.gender,
        patientAddress: formData.address,
        patientCity: formData.city,
        patientPincode: formData.pincode,
        purpose: formData.reason,
        paymentType: formData.paymentType,
        paymentStatus,
        partialAmount: parsedPartial,
        amountPaid,
        balanceAmount,
        discount: discountAmount,
        doctorId: formData.doctorId,
        appointmentDate: formData.appointmentDate,
        isOP: true,
        status: formData.status || "confirmed",
        serviceItems: formData.serviceItems.map((s) => ({
          serviceId: s._id, name: s.name, price: Number(s.price) || 0, description: s.description || ""
        })),
        services: formData.serviceItems.map((s) => ({
          serviceId: s._id, name: s.name, price: Number(s.price) || 0, description: s.description || ""
        })),
        referredByCustomer: formData.referredByCustomer,
        referredByDoctor: formData.referredByDoctor,
        referralCustomerId: formData.referralCustomerId,
        referralDoctorId: formData.referralDoctorId,
        referralCommission: formData.referralCommission,
        referralCommissionType: formData.referralCommissionType,
        slotId: formData.slotId,
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
      } else {
        showToast(slotRes.data.message || "Failed to book appointment", "error");
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to book appointment", "error");
    } finally { setSubmitting(false); }
  };

  const handleUpdateNow = async (e) => {
  e.preventDefault();

  if (!formData.bookingId) {
    showToast("❌ No booking to update", "error");
    return;
  }

  setSubmitting(true);
  try {
    // ✅ Services subtotal
    const servicesSubtotal = formData.serviceItems.reduce(
      (sum, s) => sum + (Number(s.price) || 0),
      0
    );

    // ✅ Lab + Medicine totals from matching booking
    const matchBForUpdate = getMatchingBooking({
      phone: formData.phone,
      name: formData.name,
      _id: formData.bookingId,
    });
    const labTotalForUpdate = Number(matchBForUpdate?.labTotal) || 0;
    const medicineTotalForUpdate = Number(matchBForUpdate?.medicineTotal) || 0;

    // ✅ Grand subtotal (Clinic + Lab + Pharmacy)
    const subtotal = servicesSubtotal + labTotalForUpdate + medicineTotalForUpdate;

    // ✅ Commission + Discount
    const commissionPercent = parseFloat(formData.referralCommission) || 0;
    const commissionAmount = (subtotal * commissionPercent) / 100;
    const discountAmount = parseFloat(formData.discount) || 0;

    // ✅ Final Payable = Subtotal − Commission − Discount
    const finalPayable = subtotal - commissionAmount - discountAmount;

    // ✅ Payment handling
    const parsedPartial = parseFloat(formData.partialAmount) || 0;
    let paymentStatus = formData.paymentStatus;
    let amountPaid = 0;
    let balanceAmount = finalPayable;

    if (paymentStatus === "Paid") {
      amountPaid = finalPayable;
      balanceAmount = 0;
    } else if (paymentStatus === "Partial" && parsedPartial > 0) {
      amountPaid = parsedPartial;
      balanceAmount = finalPayable - parsedPartial;
      if (balanceAmount <= 0) {
        paymentStatus = "Paid";
        amountPaid = finalPayable;
        balanceAmount = 0;
      }
    } else if (paymentStatus === "Due") {
      amountPaid = 0;
      balanceAmount = finalPayable;
    }

    const bookingPayload = {
      patientTitle: formData.title,
      patientName: formData.name,
      patientPhone: formData.phone,
      patientAge: formData.age,
      patientDob: formData.dob,
      patientGender: formData.gender,
      patientAddress: formData.address,
      patientCity: formData.city,
      patientPincode: formData.pincode,
      purpose: formData.reason,
      paymentType: formData.paymentType,
      paymentStatus,
      partialAmount: parsedPartial,
      amountPaid,
      balanceAmount,
      discount: discountAmount,
      doctorId: formData.doctorId,
      appointmentDate: formData.appointmentDate,
      isOP: true,
      status: formData.status || "confirmed",
      serviceItems: formData.serviceItems.map((s) => ({
        serviceId: s._id || s.serviceId,
        name: s.name,
        price: Number(s.price) || 0,
        description: s.description || "",
      })),
      services: formData.serviceItems.map((s) => ({
        serviceId: s._id || s.serviceId,
        name: s.name,
        price: Number(s.price) || 0,
        description: s.description || "",
      })),
      referredByCustomer: formData.referredByCustomer,
      referredByDoctor: formData.referredByDoctor,
      referralCustomerId: formData.referralCustomerId,
      referralDoctorId: formData.referralDoctorId,
      referralCommission: formData.referralCommission,
      referralCommissionType: formData.referralCommissionType,
    };

    if (formData.slotId) {
      bookingPayload.slotId = formData.slotId;
    }

    console.log("📤 PUT URL:", `${API_BASE_URL}/appointment-slots/updateop/${formData.bookingId}`);
    console.log("📦 Payload:", bookingPayload);

    const slotRes = await axios.put(
      `${API_BASE_URL}/appointment-slots/updateop/${formData.bookingId}`,
      bookingPayload
    );

    console.log("📥 Response:", slotRes.data);

    if (slotRes.data.success) {
      showToast(`✅ Appointment updated successfully for ${formData.title} ${formData.name}!`, "success");
      await fetchBookings();
      fetchAllSlots();
      if (formData.doctorId && formData.appointmentDate) {
        filterSlotsByDoctorAndDate(formData.doctorId, formData.appointmentDate);
      }
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
    } else {
      showToast(slotRes.data.message || "Failed to update appointment", "error");
    }
  } catch (err) {
    console.error("❌ API Error:", err);
    showToast(err.response?.data?.message || "Failed to update appointment", "error");
  } finally {
    setSubmitting(false);
  }
};
  const openPrescriptionModal = (booking) => {
    setSelectedBookingForPrescription(booking);
    setShowPrescriptionModal(true);
  };

  const handlePrintPrescription = () => {
    if (!prescriptionRef.current) { showToast("No prescription content to print", "error"); return; }
    const win = window.open("", "_blank", "width=800,height=1100");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html><html><head><title>Prescription - ${selectedBookingForPrescription?.patientName || "Patient"}</title>
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
          <div class="fld" style="top:78px;left:90px;max-width:280px;">${selectedBookingForPrescription?.patientTitle || ""} ${selectedBookingForPrescription?.patientName || "N/A"}</div>
          <div class="fld" style="top:78px;right:20px;">${formatDateToDDMMYYYY(selectedBookingForPrescription?.appointmentDate || selectedBookingForPrescription?.date)}</div>
          <div class="fld" style="top:104px;left:90px;">${selectedBookingForPrescription?.patientAge || "N/A"}</div>
          <div class="fld" style="top:104px;left:230px;">${selectedBookingForPrescription?.patientGender || "N/A"}</div>
          <div class="fld" style="top:104px;right:100px;">${selectedBookingForPrescription?.patientPhone || "N/A"}</div>
          <div class="fld" style="top:130px;left:90px;max-width:320px;">${selectedBookingForPrescription?.purpose || "N/A"}</div>
          <div class="fld" style="top:160px;left:90px;">${selectedBookingForPrescription?.vitalsTemp || ""}</div>
          <div class="fld" style="top:160px;left:230px;">${selectedBookingForPrescription?.vitalsBp || ""}</div>
          <div class="fld" style="top:160px;left:400px;">${selectedBookingForPrescription?.vitalsPr || ""}</div>
          <div class="fld" style="top:160px;right:80px;">${selectedBookingForPrescription?.vitalsWeight || ""}</div>
        </div>
      </div>
      <div class="prescription-page"><div class="page-label">📄 Back Side</div><img src="${prescriptionBackTemplate}" alt="Back" /></div>
      <script>window.onload = function() { window.print(); }</script></body></html>
    `);
    win.document.close();
    win.focus();
  };

  const getPatientTotalFee = (patient) => {
    const list = bookings.filter((b) => b.patientPhone === patient.phone ||
      (b.patientName && patient.name && b.patientName.toLowerCase() === patient.name.toLowerCase()));
    if (!list.length) return 0;
    return list.reduce((t, b) => t + getBookingFinalPayable(b), 0);
  };

  const getPatientServices = (patient) => {
    const list = bookings.filter((b) => b.patientPhone === patient.phone ||
      (b.patientName && patient.name && b.patientName.toLowerCase() === patient.name.toLowerCase()));
    const all = [];
    list.forEach((b) => getBookingServices(b).forEach((s) => all.push({
      name: s.name, price: s.price, bookingDate: b.date || b.appointmentDate,
      serviceId: s.serviceId, bookingId: b._id
    })));
    return all;
  };

  const getPatientPaymentStatus = (patient) => {
    const list = bookings.filter((b) => b.patientPhone === patient.phone ||
      (b.patientName && patient.name && b.patientName.toLowerCase() === patient.name.toLowerCase()));
    if (!list.length) return patient.paymentStatus || "Pending";
    return list.some((b) => b.paymentStatus === "Paid") ? "Paid" : "Pending";
  };

  const getMatchingBooking = (patient) => bookings.find((b) =>
    b.patientPhone === patient.phone ||
    (b.patientName && patient.name && b.patientName.toLowerCase() === patient.name.toLowerCase()));

  const getConsultationPaymentStatus = (patient) => getMatchingBooking(patient)?.paymentStatus || patient.paymentStatus || "Pending";
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

  const openBillingModal = (booking) => {
    setSelectedBookingForBilling(booking);

    const normalizedItems = getBookingServices(booking);
    const breakdown = getAmountBreakdown(booking);

    const items = [];

    normalizedItems.forEach((s, idx) => {
      const cat = classifyService(s);
      items.push({
        no: items.length + 1,
        name: s.name,
        serviceCode: s.serviceId
          ? String(s.serviceId).slice(-6).toUpperCase()
          : `SVC-${String(idx + 1).padStart(2, "0")}`,
        remarks: cat === "lab" ? "Lab Test" : cat === "pharmacy" ? "Pharmacy" : "Consultation",
        category: cat,
        amount: Number(s.price) || 0,
        paymentStatus: booking.paymentStatus || "Pending",
      });
    });

    const hasPharmacyService = normalizedItems.some((s) => classifyService(s) === "pharmacy");
    if (Number(booking.medicineTotal) > 0 && !hasPharmacyService) {
      items.push({
        no: items.length + 1,
        name: "Medicines",
        serviceCode: "PHARM",
        remarks: "Pharmacy",
        category: "pharmacy",
        amount: Number(booking.medicineTotal),
        paymentStatus: booking.paymentStatus || "Pending",
      });
    }

    const hasLabService = normalizedItems.some((s) => classifyService(s) === "lab");
    if (Number(booking.labTotal) > 0 && !hasLabService) {
      items.push({
        no: items.length + 1,
        name: "Lab Tests",
        serviceCode: "LAB",
        remarks: "Lab Test",
        category: "lab",
        amount: Number(booking.labTotal),
        paymentStatus: booking.paymentStatus || "Pending",
      });
    }

    if (items.length === 0) {
      const fallback =
        Number(booking.finalPayable) ||
        Number(booking.finalPayableAmount) ||
        Number(booking.grandTotal) ||
        Number(booking.totalAmount) ||
        0;
      if (fallback > 0) {
        items.push({
          no: 1,
          name: "Consultation Fee",
          serviceCode: "CONS",
          remarks: "Consultation",
          category: "clinic",
          amount: fallback,
          paymentStatus: booking.paymentStatus || "Pending",
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
    const netAmount =
      Number(booking.finalPayable) ||
      Number(booking.finalPayableAmount) ||
      Number(booking.grandTotal) ||
      (grossAmount - commissionAmount - discountAmount);

    const isPaid = booking.paymentStatus === "Paid";
    const isPartial = booking.paymentStatus === "Partial";
    const paidAmount = isPaid ? netAmount : isPartial ? (Number(booking.amountPaid) || 0) : 0;
    const balanceAmount = Math.max(0, netAmount - paidAmount);

    const now = new Date();
    const dateStamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    const shortId = String(booking._id || "").slice(-6).toUpperCase() || "000000";
    const invoiceNo = `${dateStamp}-${shortId}`;
    const dateTimeLabel = `${now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} ${now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;

   setBillingData({
  invoiceNo,
  invoiceDate: dateTimeLabel,
  receiptNo: `R-${shortId.slice(-4)}`,
  receiptDate: dateTimeLabel,
  paymentMode: booking.paymentType
    ? booking.paymentType.charAt(0).toUpperCase() + booking.paymentType.slice(1)
    : "Cash",
  receivedBy: "Front Desk",
  branch: booking.doctorSpecialization || "Main Branch",
  doctorName: booking.doctorName || "General OP Doctor",
  items,
  breakdown: {
    clinic: Math.round(finalBreakdown.clinic || 0),
    lab: Math.round(finalBreakdown.lab || 0),
    pharmacy: Math.round(finalBreakdown.pharmacy || 0),
  },
  grossAmount,
  discount: discountAmount,
  netAmount,
  paidAmount,
  balanceAmount,
  paymentStatus: booking.paymentStatus || "Pending",
  amountInWords: numberToWords(netAmount),
});
    setShowBillingModal(true);
  };

  const handleMarkAsPaid = async () => {
    if (!selectedBookingForBilling) return;
    try {
      const res = await axios.put(`${API_BASE_URL}/appointment-slots/${selectedBookingForBilling._id}`, { paymentStatus: "Paid" });
      if (res?.data?.success) {
        setBookings((prev) => prev.map((b) => b._id === selectedBookingForBilling._id ? { ...b, paymentStatus: "Paid" } : b));
        setBillingData((prev) => ({
          ...prev,
          paymentStatus: "Paid",
          paidAmount: prev.netAmount,
          balanceAmount: 0,
          items: prev.items.map((it) => ({ ...it, paymentStatus: "Paid" }))
        }));
        refreshPatientBookings();
        showToast(`Payment marked as Paid for ${selectedBookingForBilling.patientName}!`, "success");
      } else showToast(res.data.message || "Failed to update payment", "error");
    } catch (error) {
      showToast("Failed to update payment status", "error");
    }
  };

  const printBill = () => {
    const groups = { clinic: [], lab: [], pharmacy: [] };
    billingData.items.forEach((it) => {
      const cat = it.category || "clinic";
      if (groups[cat]) groups[cat].push(it);
      else groups.clinic.push(it);
    });

    const categoryLabel = {
      clinic: "CONSULTATION",
      lab: "LAB",
      pharmacy: "PHARMACY",
    };

    let runningIdx = 0;
    let rowsHtml = "";

    ["clinic", "lab", "pharmacy"].forEach((catKey) => {
      const items = groups[catKey];
      const subtotal = items.reduce((s, x) => s + (Number(x.amount) || 0), 0);

      if (items.length === 0) {
        runningIdx++;
        rowsHtml += `
          <tr>
            <td style="padding:7px 6px;font-size:11px;color:#555;border-bottom:1px solid #eee;text-align:center;">${runningIdx}</td>
            <td style="padding:7px 6px;border-bottom:1px solid #eee;">
              <span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:9px;font-weight:bold;text-transform:uppercase;letter-spacing:.3px;background:#f3f4f6;color:#374151;border:1px solid #d1d5db;">
                ${categoryLabel[catKey]}
              </span>
            </td>
            <td style="padding:7px 6px;font-size:12px;color:#555;text-align:right;border-bottom:1px solid #eee;font-weight:600;">₹ 0.00</td>
          </tr>
        `;
      } else {
        items.forEach((item) => {
          runningIdx++;
          rowsHtml += `
            <tr>
              <td style="padding:6px 6px;font-size:11px;color:#333;border-bottom:1px solid #eee;text-align:center;">${runningIdx}</td>
              <td style="padding:6px 6px;font-size:12px;color:#111;border-bottom:1px solid #eee;">${item.name}</td>
              <td style="padding:6px 6px;font-size:12px;font-weight:600;color:#111;text-align:right;border-bottom:1px solid #eee;">
                ₹ ${Number(item.amount).toFixed(2)}
              </td>
            </tr>
          `;
        });
      }

      rowsHtml += `
        <tr style="background:#f9fafb;border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;">
          <td colspan="2" style="text-align:right;font-size:10px;font-weight:bold;text-transform:uppercase;letter-spacing:.5px;color:#374151;padding:7px 8px;">
            Subtotal — ${categoryLabel[catKey]}
          </td>
          <td style="text-align:right;font-size:12px;font-weight:bold;color:#111;padding:7px 8px;">
            ₹ ${subtotal.toFixed(2)}
          </td>
        </tr>
      `;
    });

    const grossTotal =
      (billingData.breakdown?.clinic || 0) +
      (billingData.breakdown?.lab || 0) +
      (billingData.breakdown?.pharmacy || 0);

    rowsHtml += `
      <tr style="background:#e5e7eb;border-top:2px solid #111;border-bottom:2px solid #111;">
        <td colspan="2" style="text-align:right;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:.5px;color:#111;padding:9px 8px;">
          Gross Total
        </td>
        <td style="text-align:right;font-size:14px;font-weight:bold;color:#111;padding:9px 8px;">
          ₹ ${grossTotal.toFixed(2)}
        </td>
      </tr>
    `;

    const win = window.open("", "_blank", "width=900,height=1000");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Bill - ${billingData.invoiceNo}</title>
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
            <div><span class="label">Name</span>: ${selectedBookingForBilling?.patientTitle || ""} ${selectedBookingForBilling?.patientName || "N/A"}</div>
            <div><span class="label">Invoice No / Date</span>: ${billingData.invoiceNo} / ${billingData.invoiceDate}</div>
            <div><span class="label">Age</span>: ${selectedBookingForBilling?.patientAge || "N/A"} Yrs</div>
            <div><span class="label">Gender</span>: ${selectedBookingForBilling?.patientGender || "N/A"}</div>
            <div><span class="label">Branch</span>: ${billingData.branch}</div>
            <div><span class="label">Contact No</span>: ${selectedBookingForBilling?.patientPhone || "N/A"}</div>
            <div><span class="label">Doctor</span>: ${billingData.doctorName}</div>
            <div><span class="label">Appt. Date</span>: ${formatDateToDDMMYYYY(selectedBookingForBilling?.date)}</div>
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
  <div class="row"><span>Gross Amount</span><span style="font-weight:bold;">₹ ${billingData.grossAmount.toFixed(2)}</span></div>
  ${billingData.discount > 0 ? `<div class="row"><span>Discount</span><span style="color:#dc2626;">− ₹ ${billingData.discount.toFixed(2)}</span></div>` : ""}
  <div class="row" style="background:#eff6ff;font-weight:bold;"><span>Net Amount</span><span>₹ ${billingData.netAmount.toFixed(2)}</span></div>
  <div class="row paid"><span>Paid Amount</span><span>₹ ${billingData.paidAmount.toFixed(2)}</span></div>
  <div class="row final"><span>Balance to Pay</span><span>₹ ${billingData.balanceAmount.toFixed(2)}</span></div>
</div>
          <div class="amount-words">Amount in words: <b>${billingData.amountInWords}</b></div>
          <div class="footer-row"><span>Printed Date : ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} ${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span></div>
          <div class="signature-section"><span class="sig">Authorised Signature</span></div>
        </div>
      </div>
    </body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  };

  const handleFromDateChange = (e) => { setFromDate(e.target.value); if (e.target.value) setSelectedMonth(""); };
  const handleToDateChange = (e) => { setToDate(e.target.value); if (e.target.value) setSelectedMonth(""); };
  const handleMonthChange = (e) => { setSelectedMonth(e.target.value); setFromDate(""); setToDate(""); };

  const clearFilters = () => {
    setSearchQuery(""); setStatusFilter("All"); setFeeTypeFilter("All"); setDoctorFilter("All");
    setFromDate(""); setToDate(""); setSelectedMonth(""); setActiveCardFilter("all"); setCurrentPage(1);
    if (window.innerWidth < 1024) setShowMobileFilters(false);
  };

  const handleCardClick = (type) => {
    setActiveCardFilter(type); setCurrentPage(1);
    if (type === "all") setStatusFilter("All");
    else setStatusFilter(type);
  };

  const getUniqueDoctors = () => {
    const map = new Map();
    bookings.forEach((b) => { if (b.doctorName) map.set(b.doctorName, { name: b.doctorName, specialization: b.doctorSpecialization || "" }); });
    return Array.from(map.values());
  };

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      if (!getPatientActiveStatus(p)) return false;

      const paymentStatus = getPatientPaymentStatus(p);
      if (statusFilter !== "All" && paymentStatus !== statusFilter) return false;
      if (feeTypeFilter !== "All") {
        const hasMatchingService = (p.serviceItems || []).some((s) => s.name && s.name.toLowerCase().includes(feeTypeFilter.toLowerCase()));
        if (!hasMatchingService) return false;
      }
      if (doctorFilter !== "All") {
        const hasBookingWithDoctor = bookings.some((b) =>
          (b.patientPhone === p.phone || (b.patientName && p.name && b.patientName.toLowerCase() === p.name.toLowerCase())) &&
          b.doctorName === doctorFilter
        );
        if (!hasBookingWithDoctor) return false;
      }
      if (selectedMonth && selectedMonth !== "") {
        const recordDate = new Date(p.createdAt);
        const recordMonth = recordDate.toISOString().slice(0, 7);
        if (recordMonth !== selectedMonth) return false;
      }
      if (p.createdAt) {
        const recordDate = new Date(p.createdAt);
        if (fromDate && toDate) {
          const from = new Date(fromDate); from.setHours(0, 0, 0, 0);
          const to = new Date(toDate); to.setHours(23, 59, 59, 999);
          if (recordDate < from || recordDate > to) return false;
        } else if (fromDate) {
          const from = new Date(fromDate); from.setHours(0, 0, 0, 0);
          const to = new Date(fromDate); to.setHours(23, 59, 59, 999);
          if (recordDate < from || recordDate > to) return false;
        }
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const m = (p.name || "").toLowerCase().includes(q) ||
          (p.phone || "").toLowerCase().includes(q) ||
          (p.address || "").toLowerCase().includes(q) ||
          (p.city || "").toLowerCase().includes(q) ||
          (p.pincode || "").toLowerCase().includes(q) ||
          (p.reason || "").toLowerCase().includes(q);
        if (!m) return false;
      }
      return true;
    });
  }, [patients, statusFilter, feeTypeFilter, doctorFilter, searchQuery, fromDate, toDate, selectedMonth, bookings]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter, feeTypeFilter, doctorFilter, fromDate, toDate, selectedMonth]);

  const stats = useMemo(() => {
    const total = patients.length;
    let paidTotal = 0, paidCount = 0, pendingCount = 0, partialCount = 0, dueCount = 0;
    patients.forEach((p) => {
      const list = bookings.filter((b) => b.patientPhone === p.phone ||
        (b.patientName && p.name && b.patientName.toLowerCase() === p.name.toLowerCase()));
      let totalFee = 0;
      list.forEach((b) => { totalFee += Number(b.finalPayable ?? b.totalAmount ?? 0) || 0; });
      const status = getPatientPaymentStatus(p);
      if (status === "Paid") { paidCount++; paidTotal += totalFee; }
      else if (status === "Partial") {
        partialCount++;
        paidTotal += list.reduce((s, b) => s + (Number(b.amountPaid) || 0), 0);
      } else if (status === "Due") dueCount++;
      else pendingCount++;
    });
    return { total, paid: paidCount, pending: pendingCount, partial: partialCount, due: dueCount, totalRevenue: paidTotal };
  }, [patients, bookings]);

  const formatTime = (dateStr) => !dateStr ? "" : new Date(dateStr).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstItem, indexOfLastItem);

  const handleItemsPerPageChange = (e) => {
    const v = Number(e.target.value);
    setItemsPerPage(v); localStorage.setItem("opMgmt_itemsPerPage", String(v)); setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) pages.push(i);
      else if (i === currentPage - 3 || i === currentPage + 3) pages.push("...");
    }
    return pages;
  };

  const downloadCSV = () => {
    if (!filteredPatients.length) { alert("No patient records available to export!"); return; }
    const headers = ["#", "Patient Name", "Phone", "Address", "City", "Pincode", "Doctor", "Appointment Date & Time", "Booking Status", "Active Status",
      "Services", "Clinic Amount", "Lab Amount", "Pharmacy Amount", "Medicine Total", "Discount", "Total Fee", "Paid Amount", "Balance Amount", "Payment Status", "Payment Mode", "Reason", "Referred By Customer", "Referred By Doctor", "Created At", "Registered"];
    const csvRows = [headers.join(","), ...filteredPatients.map((p, idx) => {
      const totalFee = getPatientTotalFee(p);
      const services = getPatientServices(p);
      const booking = getMatchingBooking(p);
      const paidInfo = getBookingPaidInfo(booking);
      const regDate = p.createdAt ? formatDateToDDMMYYYY(p.createdAt) : "-";
      const regTime = p.createdAt ? formatTime(p.createdAt) : "-";
      const breakdown = getAmountBreakdown(booking);
      const slotTiming = getSlotTiming(p);
      const isActive = getPatientActiveStatus(p);
      return [
        idx + 1,
        `"${(p.title || "")} ${(p.name || "").replace(/"/g, '""')}"`,
        `"${p.phone || ""}"`,
        `"${(p.address || "").replace(/"/g, '""')}"`,
        `"${(p.city || "").replace(/"/g, '""')}"`,
        `"${p.pincode || ""}"`,
        `"${booking?.doctorName || "N/A"}"`,
        `"${formatDateToDDMMYYYY(getAppointmentDate(p))} ${slotTiming !== "-" ? slotTiming : ""}"`,
        `"${getBookingStatus(p)}"`,
        `"${isActive ? "Active" : "Inactive"}"`,
        `"${services.map((s) => s.name).join("; ")}"`,
        breakdown.clinic,
        breakdown.lab,
        breakdown.pharmacy,
        booking?.medicineTotal || 0,
        booking?.discount || 0,
        totalFee,
        paidInfo.paid,
        paidInfo.balance,
        `"${getConsultationPaymentStatus(p)}"`,
        `"${p.paymentType || "cash"}"`,
        `"${(p.reason || "").replace(/"/g, '""')}"`,
        `"${(p.referredByCustomer || "").replace(/"/g, '""')}"`,
        `"${(p.referredByDoctor || "").replace(/"/g, '""')}"`,
        `"${formatDateTimeToDDMMYYYY(getBookingCreatedDate(p))}"`,
        `${regDate} ${regTime}`
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

  const buildBillingTableRows = () => {
    const groups = { clinic: [], lab: [], pharmacy: [] };
    billingData.items.forEach((it) => {
      const cat = it.category || "clinic";
      if (groups[cat]) groups[cat].push(it);
      else groups.clinic.push(it);
    });

    const labels = {
      clinic: "CONSULTATION",
      lab: "LAB",
      pharmacy: "PHARMACY",
    };

    const rows = [];
    let runningIdx = 0;

    ["clinic", "lab", "pharmacy"].forEach((catKey) => {
      const items = groups[catKey];
      const subtotal = items.reduce((s, x) => s + (Number(x.amount) || 0), 0);

      if (items.length === 0) {
        runningIdx++;
        rows.push(
          <tr key={`empty-${catKey}`} className="border-b border-gray-100">
            <td className="py-2 px-2 text-xs text-gray-500 text-center">{runningIdx}</td>
            <td className="py-2 px-2">
              <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700 border border-gray-300">
                {labels[catKey]}
              </span>
            </td>
            <td className="py-2 px-2 text-xs text-right font-semibold text-gray-500">
              ₹0.00
            </td>
          </tr>
        );
      } else {
        items.forEach((item) => {
          runningIdx++;
          rows.push(
            <tr key={item.no} className="border-b border-gray-100">
              <td className="py-2 px-2 text-xs text-gray-700 text-center">{runningIdx}</td>
              <td className="py-2 px-2 text-xs font-medium text-gray-800">{item.name}</td>
              <td className="py-2 px-2 text-xs text-right font-semibold text-gray-800">
                ₹{Number(item.amount).toFixed(2)}
              </td>
            </tr>
          );
        });
      }

      rows.push(
        <tr key={`sub-${catKey}`} className="bg-gray-50 border-b-2 border-gray-300">
          <td colSpan={2} className="py-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-right text-gray-700">
            Subtotal — {labels[catKey]}
          </td>
          <td className="py-1.5 px-2 text-xs text-right font-extrabold text-gray-800">
            ₹{subtotal.toFixed(2)}
          </td>
        </tr>
      );
    });

    const gross =
      (billingData.breakdown?.clinic || 0) +
      (billingData.breakdown?.lab || 0) +
      (billingData.breakdown?.pharmacy || 0);

    rows.push(
      <tr key="gross" className="bg-gray-200 border-t-2 border-b-2 border-gray-800">
        <td colSpan={2} className="py-2 px-2 text-xs font-extrabold uppercase text-gray-900 text-right tracking-wider">
          Gross Total
        </td>
        <td className="py-2 px-2 text-sm text-right font-extrabold text-gray-900">
          ₹{gross.toFixed(2)}
        </td>
      </tr>
    );

    return rows;
  };

  return (
    <div className="emp-dash">
      <main className="p-2 sm:p-4 lg:p-6">
        {toast && (
          <div className={`fixed top-5 right-5 z-[99999] flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white ${toast.type === "error" ? "bg-red-600" : toast.type === "info" ? "bg-cyan-600" : "bg-emerald-600"}`}>
            {toast.type === "error" ? <FiXCircle className="w-5 h-5" /> : <FiCheckCircle className="w-5 h-5" />}
            <span className="font-medium text-sm">{toast.message}</span>
          </div>
        )}

        {/* Header Desktop */}
        <div className="hidden lg:flex items-center justify-between gap-3 flex-wrap mb-6">
          <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap">OP <span>Management</span></h1>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="emp-dash__date-pill"><FaUserInjured /><span>{patients.length} Registered OPD Patients</span></div>
            <div className="relative min-w-[130px]">
              <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[200px] pl-8 pr-2 py-1.5 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-8 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg">
              <option value="All">All Payment</option><option value="Pending">Pending</option><option value="Partial">Partial</option><option value="Paid">Paid</option><option value="Due">Due</option>
            </select>
            <select value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)} className="h-8 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg max-w-[130px] truncate">
              <option value="All">All Doctors</option>
              {getUniqueDoctors().map((doc) => <option key={doc.name} value={doc.name}>{doc.name}</option>)}
            </select>
            <input type="date" value={fromDate} onChange={handleFromDateChange} className="w-[110px] h-8 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg" />
            <input type="date" value={toDate} onChange={handleToDateChange} className="w-[110px] h-8 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg" />
            <input type="month" value={selectedMonth} onChange={handleMonthChange} className="w-[120px] h-8 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg" />
            <button onClick={fetchAllData} className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm">
              <FiRefreshCw className="w-3 h-3" /> Refresh
            </button>
            <button onClick={downloadCSV} className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 shadow-sm">
              <FiDownload className="w-3 h-3" /> Export CSV
            </button>
            <button onClick={handleAddNewPatient} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm">
              <FiPlus className="w-3 h-3" /> Add Patient
            </button>
            <button onClick={() => navigate("/inactive-patients")} className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm">
              <FiClock className="w-3 h-3 text-amber-600" /> Inactive Patients
            </button>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm">
                <FiTrash2 className="w-3 h-3 text-red-500" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Header Mobile */}
        <div className="lg:hidden flex items-center justify-between gap-2 flex-wrap mb-3">
          <div className="flex items-baseline gap-2">
            <h1 className="text-base font-bold whitespace-nowrap">OP <span className="text-indigo-600">Management</span></h1>
            <div className="emp-dash__date-pill text-[10px] px-2 py-1"><FaUserInjured className="w-3 h-3 text-blue-600" /><span>{patients.length} Patients</span></div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={handleAddNewPatient} className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-white bg-blue-600 rounded-lg">
              <FiPlus className="w-3 h-3" /> Add
            </button>
            <button onClick={() => setShowMobileFilters(!showMobileFilters)} className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg">
              <FiFilter className="w-3 h-3" /> Filters
            </button>
          </div>
        </div>

        {/* Mobile Filters Panel */}
        <div className="lg:hidden">
          {showMobileFilters && (
            <div className="mb-4 p-4 bg-white rounded-xl border border-gray-200 space-y-3">
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Search</label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg">
                  <option value="All">All Status</option><option value="Pending">Pending</option><option value="Partial">Partial</option><option value="Paid">Paid</option><option value="Due">Due</option>
                </select>
                <select value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg">
                  <option value="All">All Doctors</option>
                  {getUniqueDoctors().map((doc) => <option key={doc.name} value={doc.name}>{doc.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input type="date" value={fromDate} onChange={handleFromDateChange} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg" />
                <input type="date" value={toDate} onChange={handleToDateChange} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg" />
              </div>
              <input type="month" value={selectedMonth} onChange={handleMonthChange} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg" />
              <div className="pt-3 border-t border-gray-200 flex gap-2">
                <button onClick={handleAddNewPatient} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg"><FiPlus className="w-4 h-4" /> Add Patient</button>
                <button onClick={downloadCSV} disabled={!filteredPatients.length} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg disabled:opacity-50"><FiDownload className="w-4 h-4" /> Export</button>
              </div>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg">
                  <FiTrash2 className="w-4 h-4 text-red-500" /> Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 md:gap-4 mb-6">
          <div className={`emp-dash__stat cursor-pointer hover:scale-105 ${activeCardFilter === "all" ? "ring-2 ring-blue-500/20 border-blue-400" : ""}`} onClick={() => handleCardClick("all")}>
            <div className="emp-dash__stat-top"><span className="emp-dash__stat-label">Total Patients</span><div className="emp-dash__stat-icon emp-dash__stat-icon--rate"><FiUsers /></div></div>
            <div className="emp-dash__stat-value">{stats.total}</div><div className="emp-dash__stat-meta">all registered OPD</div>
          </div>
          <div className={`emp-dash__stat cursor-pointer hover:scale-105 ${activeCardFilter === "Paid" ? "ring-2 ring-emerald-500/20 border-emerald-400" : ""}`} onClick={() => handleCardClick("Paid")}>
            <div className="emp-dash__stat-top"><span className="emp-dash__stat-label">Paid</span><div className="emp-dash__stat-icon emp-dash__stat-icon--present"><FiUserCheck /></div></div>
            <div className="emp-dash__stat-value text-emerald-600">{stats.paid}</div><div className="emp-dash__stat-meta">completed payments</div>
          </div>
          <div className={`emp-dash__stat cursor-pointer hover:scale-105 ${activeCardFilter === "Partial" ? "ring-2 ring-amber-500/20 border-amber-400" : ""}`} onClick={() => handleCardClick("Partial")}>
            <div className="emp-dash__stat-top"><span className="emp-dash__stat-label">Partial</span><div className="emp-dash__stat-icon emp-dash__stat-icon--rate"><FaClock /></div></div>
            <div className="emp-dash__stat-value text-amber-600">{stats.partial}</div><div className="emp-dash__stat-meta">partially paid</div>
          </div>
          <div className={`emp-dash__stat cursor-pointer hover:scale-105 ${activeCardFilter === "Pending" ? "ring-2 ring-gray-500/20 border-gray-400" : ""}`} onClick={() => handleCardClick("Pending")}>
            <div className="emp-dash__stat-top"><span className="emp-dash__stat-label">Pending</span><div className="emp-dash__stat-icon emp-dash__stat-icon--late"><FiClock /></div></div>
            <div className="emp-dash__stat-value text-gray-600">{stats.pending}</div><div className="emp-dash__stat-meta">awaiting payment</div>
          </div>
          <div className={`emp-dash__stat cursor-pointer hover:scale-105 ${activeCardFilter === "Due" ? "ring-2 ring-red-500/20 border-red-400" : ""}`} onClick={() => handleCardClick("Due")}>
            <div className="emp-dash__stat-top"><span className="emp-dash__stat-label">Due</span><div className="emp-dash__stat-icon emp-dash__stat-icon--late"><FiXCircle /></div></div>
            <div className="emp-dash__stat-value text-red-500">{stats.due}</div><div className="emp-dash__stat-meta">overdue payments</div>
          </div>
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top"><span className="emp-dash__stat-label">Total Revenue</span><div className="emp-dash__stat-icon emp-dash__stat-icon--present"><FaRupeeSign /></div></div>
            <div className="emp-dash__stat-value text-blue-700">₹{stats.totalRevenue.toLocaleString()}</div>
            <div className="emp-dash__stat-meta">collected revenue</div>
          </div>
        </div>

       {/* ADD/EDIT MODAL */}
{showForm && (
  <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-gray-200 relative max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold"><FaUserInjured className="w-5 h-5" /></div>
          <div>
            <h3 className="font-bold text-gray-900 text-base">{isEditMode ? "Edit Patient Details" : "Register OPD Patient & Book Slot"}</h3>
            <p className="text-xs text-gray-500">
              {isEditMode ? "Patient info editable — amount/lab/medicine locked" : "Fill in patient and consultation details below"}
            </p>
          </div>
        </div>
        <button onClick={cancelForm} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"><FaTimes className="w-4 h-4" /></button>
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

      <form onSubmit={isEditMode ? handleUpdateNow : handleBookNow} className="mt-5 space-y-4">
        <div>
          <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1 flex items-center gap-2">
            <FaPhoneAlt className="text-blue-600" /> Phone Number <span className="text-blue-600">*</span>
          </label>
          <div className="relative">
            <FaPhoneAlt className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
            <input ref={phoneInputRef} type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+91 9876543210" className={`w-full border rounded-lg pl-9 pr-3 py-2.5 text-sm ${isEditMode ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200" : "bg-white border-gray-300"}`} disabled={isEditMode} required />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <div className="col-span-1">
            <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">Title <span className="text-blue-600">*</span></label>
            <select name="title" value={formData.title} onChange={handleInputChange} className={`w-full border rounded-lg px-2 py-2.5 text-sm ${isEditMode ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200" : "bg-white border-gray-300"}`} disabled={isEditMode} required>
              {TITLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="col-span-3">
            <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">Patient Name <span className="text-blue-600">*</span></label>
            <input ref={nameInputRef} type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter patient full name" className={`w-full border rounded-lg px-3 py-2.5 text-sm ${isEditMode ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200" : "bg-white border-gray-300"}`} disabled={isEditMode} required />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">DOB <span className="text-blue-600">*</span></label>
            <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} max={new Date().toISOString().split("T")[0]} className={`w-full border rounded-lg px-3 py-2.5 text-sm ${isEditMode ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200" : "bg-white border-gray-300"}`} disabled={isEditMode} required />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">Age <span className="text-blue-600">*</span></label>
            <input type="number" name="age" value={formData.age} onChange={(e) => { const val = e.target.value; setFormData((prev) => ({ ...prev, age: val })); }} placeholder="Auto or enter manually" min="0" max="120" className={`w-full border rounded-lg px-3 py-2.5 text-sm ${isEditMode ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200" : "bg-white border-gray-300"}`} disabled={isEditMode} required />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">Gender <span className="text-blue-600">*</span></label>
            <select name="gender" value={formData.gender} onChange={handleInputChange} className={`w-full border rounded-lg px-3 py-2.5 text-sm ${isEditMode ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200" : "bg-white border-gray-300"}`} disabled={isEditMode} required>
              <option value="">Select Gender</option>
              {GENDER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1 flex items-center gap-2">
            <FaMapMarkerAlt className="text-blue-600 text-[10px]" /> Address
          </label>
          <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="Patient street address" className={`w-full border rounded-lg px-3 py-2.5 text-sm ${isEditMode ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200" : "bg-white border-gray-300"}`} disabled={isEditMode} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Pincode <span className="text-blue-600">*</span></span>
              {fetchingCity && <FiRefreshCw className="w-3 h-3 text-blue-500 animate-spin" />}
            </label>
            <input type="text" name="pincode" value={formData.pincode} onChange={handlePincodeChange} onFocus={() => { if (citySuggestions.length > 0) setShowCitySuggestions(true); }} placeholder="Enter 6-digit pincode" maxLength="6" inputMode="numeric" className={`w-full border rounded-lg px-3 py-2.5 text-sm ${isEditMode ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200" : "bg-white border-gray-300"}`} disabled={isEditMode} />
          </div>

          <div className="relative city-dropdown-add-patient">
            <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              City
              {formData.city && !isEditMode && (
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">✓ Auto</span>
              )}
            </label>
            <input type="text" name="city" value={formData.city} onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))} onFocus={() => { if (!isEditMode && citySuggestions.length > 0) setShowCitySuggestions(true); }} placeholder="Auto-filled from pincode" autoComplete="off" className={`w-full border rounded-lg px-3 py-2.5 text-sm ${isEditMode ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200" : "bg-white border-gray-300"}`} disabled={isEditMode} />
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1 flex items-center gap-2">
              Select Doctor <span className="text-blue-600">*</span>
              {isEditMode && <FaLock className="text-amber-500 text-[10px]" />}
            </label>
            <select name="doctorId" value={formData.doctorId} onChange={handleInputChange} disabled={isEditMode} className={`w-full border rounded-lg px-3 py-2.5 text-sm ${isEditMode ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200" : "bg-white border-gray-300"}`} required>
              <option value="">Select Doctor</option>
              {doctors.map((d) => <option key={d._id || d.id} value={d._id || d.id}>{d.name || "Doctor"}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1 flex items-center gap-2">
              Appointment Date <span className="text-blue-600">*</span>
              {isEditMode && <FaLock className="text-amber-500 text-[10px]" />}
            </label>
            <input type="date" name="appointmentDate" value={formData.appointmentDate} onChange={handleInputChange} disabled={isEditMode} min={new Date().toISOString().split("T")[0]} className={`w-full border rounded-lg px-3 py-2.5 text-sm ${isEditMode ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200" : "bg-white border-gray-300"}`} required />
          </div>
        </div>

        {formData.doctorId && formData.appointmentDate && !isEditMode && (
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2">Available Slots ({getDayNameFromDate(formData.appointmentDate)})</label>
            {slotsLoading ? (
              <div className="text-xs text-gray-500 py-3 text-center"><FiRefreshCw className="w-4 h-4 animate-spin inline" /> Loading...</div>
            ) : availableSlots.length === 0 ? (
              <div className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">No slots available.</div>
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

        {/* Services */}
        <div className="border rounded-xl p-4 bg-gray-50/50 border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
              <FaServicestack className="text-blue-600" /> Services <span className="text-blue-600">*</span>
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
            <div className="flex-1 min-w-[150px] relative">
              <input type="text" value={formData.serviceName || ""} onChange={(e) => {
                const v = e.target.value;
                setFormData((p) => ({ ...p, serviceName: v }));
                if (v.trim()) { setFilteredServices(services.filter((s) => s.name.toLowerCase().includes(v.toLowerCase()))); setShowServiceSuggestions(true); }
                else { setFilteredServices([]); setShowServiceSuggestions(false); }
              }} placeholder="Service name" className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm" />
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
            <input type="number" value={formData.servicePrice || ""} onChange={(e) => setFormData((p) => ({ ...p, servicePrice: e.target.value }))} placeholder="Price" className="w-24 bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm" />
            <button type="button" onClick={handleAddCustomServiceItem} className="px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 rounded-lg flex items-center gap-1"><FaPlus className="w-3 h-3" /> Add</button>
          </div>
          {formData.serviceItems.length > 0 && (
            <div className="mt-3 p-2.5 bg-white rounded-lg border border-gray-200 flex justify-between">
              <span className="text-xs font-bold">Subtotal:</span>
              <span className="text-sm font-extrabold text-blue-700">₹{formData.serviceItems.reduce((s, x) => s + (Number(x.price) || 0), 0)}</span>
            </div>
          )}
        </div>

        {/* Referred By */}
        <div className={`border rounded-xl p-4 ${isEditMode ? "bg-gray-100 border-gray-300" : "bg-blue-50/30 border-gray-200"}`}>
          <label className="block text-[11px] font-bold text-gray-600 uppercase mb-3 flex items-center gap-2">
            <FaShareAlt className="text-blue-600" /> Referred By
            {isEditMode && <span className="ml-2 inline-flex items-center gap-1 text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded border border-amber-200"><FaLock /> Locked</span>}
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-semibold text-gray-500 uppercase flex items-center gap-1.5">
                  <FaUserFriends className="text-blue-500" /> Customer
                </label>
                {!isEditMode && (
                  <button type="button" onClick={handleAddCustomerReferral} className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5" title="Add new customer referral">
                    <FaPlus className="w-2.5 h-2.5" /> Add
                  </button>
                )}
              </div>
              <select value={formData.referralCustomerId} onChange={(e) => {
                const id = e.target.value;
                if (id) { const c = referralContacts.find((x) => x._id === id && x.referralType === "customer"); if (c) handleReferralCustomerSelect(c); }
                else { setFormData((p) => ({ ...p, referredByCustomer: "", referralCustomerId: "" })); }
              }} disabled={isEditMode} className={`w-full border rounded-lg px-3 py-2.5 text-sm ${isEditMode ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200" : "bg-white border-gray-300"}`}>
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
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-semibold text-gray-500 uppercase flex items-center gap-1.5">
                  <FaUserMdIcon className="text-indigo-500" /> Doctor
                </label>
                {!isEditMode && (
                  <button type="button" onClick={handleAddDoctorReferral} className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5" title="Add new doctor referral">
                    <FaPlus className="w-2.5 h-2.5" /> Add
                  </button>
                )}
              </div>
              <select value={formData.referralDoctorId} onChange={(e) => {
                const id = e.target.value;
                if (id) { const c = referralContacts.find((x) => x._id === id && x.referralType === "doctor"); if (c) handleReferralDoctorSelect(c); }
                else { setFormData((p) => ({ ...p, referredByDoctor: "", referralDoctorId: "" })); }
              }} disabled={isEditMode} className={`w-full border rounded-lg px-3 py-2.5 text-sm ${isEditMode ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200" : "bg-white border-gray-300"}`}>
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

        <div>
          <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Reason / Symptoms</label>
          <textarea name="reason" value={formData.reason} onChange={handleInputChange} rows={2} className={`w-full border rounded-lg px-3 py-2 text-sm resize-none ${isEditMode ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200" : "bg-white border-gray-300"}`} disabled={isEditMode} placeholder="Enter reason or symptoms" />
        </div>

        {/* ✅ Payment Details — Services + Lab + Pharmacy + Discount */}
        <div className={`border rounded-xl p-4 ${isEditMode ? "bg-gray-100 border-gray-300" : "bg-purple-50/30 border-gray-200"}`}>
          <label className="block text-[11px] font-bold text-gray-600 uppercase mb-3 flex items-center gap-2">
            <FaMoneyBillWave className="text-purple-600" /> Payment Details
            {isEditMode && <span className="ml-2 inline-flex items-center gap-1 text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded border border-amber-200"><FaLock /> Amount Locked</span>}
          </label>

          {(() => {
            // ✅ Services subtotal
            const servicesSubtotal = formData.serviceItems.reduce((sum, s) => sum + (Number(s.price) || 0), 0);

            // ✅ Lab + Medicine totals from matching booking
            const matchB = getMatchingBooking({
              phone: formData.phone,
              name: formData.name,
              _id: formData.bookingId,
            });
            const labTotal = Number(matchB?.labTotal) || 0;
            const medicineTotal = Number(matchB?.medicineTotal) || 0;

            // ✅ Grand subtotal
            const subtotal = servicesSubtotal + labTotal + medicineTotal;

            const commissionPercent = parseFloat(formData.referralCommission) || 0;
            const commissionAmount = (subtotal * commissionPercent) / 100;
            const discountAmount = parseFloat(formData.discount) || 0;
            const finalPayable = subtotal - commissionAmount - discountAmount;

            return (
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
                      <span className="text-purple-700 text-[11px] font-semibold flex items-center gap-1">
                        <FaFlask className="text-[9px]" /> Lab Total
                      </span>
                      <span className="font-bold text-purple-700">₹{labTotal}</span>
                    </div>
                  )}

                  {medicineTotal > 0 && (
                    <div className="flex justify-between items-center py-1 border-b border-gray-100">
                      <span className="text-green-700 text-[11px] font-semibold flex items-center gap-1">
                        <FaPills className="text-[9px]" /> Pharmacy Total
                      </span>
                      <span className="font-bold text-green-700">₹{medicineTotal}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-1.5 border-b border-t-2 border-gray-800 bg-gray-50 px-2 -mx-2 mt-1">
                    <span className="text-gray-900 text-[11px] font-bold">SUBTOTAL</span>
                    <span className="font-extrabold text-gray-900">₹{subtotal}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center py-1 border-b border-gray-100">
                      <span className="text-red-600 text-[11px] font-semibold flex items-center gap-1">
                        <FaPercent className="text-[9px]" /> Discount
                      </span>
                      <span className="font-bold text-red-600">− ₹{Math.round(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-2 border-t-2 border-gray-800">
                    <span className="font-bold text-gray-800">Payable Amount</span>
                    <span className="font-bold text-emerald-700 text-sm">₹{Math.round(finalPayable)}</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ✅ Discount Input Field — Always Editable */}
          <div className="mb-4">
            <label className="block text-[11px] font-bold text-purple-700 uppercase mb-1 flex items-center gap-1.5">
              <FaPercent className="text-[10px]" /> Discount Amount (₹)
            </label>
            <input
              type="number"
              name="discount"
              value={formData.discount}
              onChange={handleInputChange}
              placeholder="0"
              min="0"
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            />
            <p className="text-[10px] text-gray-500 mt-1">Discount will be deducted from total payable amount</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Payment Mode</label>
              <select name="paymentType" value={formData.paymentType} onChange={handleInputChange} disabled={isEditMode} className={`w-full border rounded-lg px-3 py-2.5 text-sm ${isEditMode ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200" : "bg-white border-gray-300"}`}>
                {PAYMENT_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                Payment Status
                {isEditMode && formData.paymentStatus === "Paid" && (
                  <span className="ml-2 text-[9px] text-emerald-600 font-bold">✓ Already Paid (Locked)</span>
                )}
              </label>
              <select name="paymentStatus" value={formData.paymentStatus} onChange={handleInputChange} disabled={isEditMode && formData.paymentStatus === "Paid"} className={`w-full border rounded-lg px-3 py-2.5 text-sm ${isEditMode && formData.paymentStatus === "Paid" ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200" : "bg-white border-gray-300"}`}>
                {PAYMENT_STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {formData.paymentStatus === "Partial" && (
            <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <label className="block text-[10px] font-bold text-amber-700 uppercase mb-1">
                Partial Amount (₹) <span className="text-red-500">*</span>
              </label>
              <input type="number" name="partialAmount" value={formData.partialAmount} onChange={handleInputChange} placeholder="Enter amount received" min="0" className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm" />
              {(() => {
                const servicesSubtotal = formData.serviceItems.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
                const matchB = getMatchingBooking({ phone: formData.phone, name: formData.name, _id: formData.bookingId });
                const labTotal = Number(matchB?.labTotal) || 0;
                const medicineTotal = Number(matchB?.medicineTotal) || 0;
                const subtotal = servicesSubtotal + labTotal + medicineTotal;
                const commissionPercent = parseFloat(formData.referralCommission) || 0;
                const discountAmount = parseFloat(formData.discount) || 0;
                const finalPayable = subtotal - (subtotal * commissionPercent) / 100 - discountAmount;
                const partial = parseFloat(formData.partialAmount) || 0;
                const remaining = Math.max(0, finalPayable - partial);
                const isFullyPaid = partial >= finalPayable && finalPayable > 0;

                return (
                  <div className="mt-2 space-y-1 text-[10px]">
                    <div className="flex justify-between text-amber-800">
                      <span>Total Payable:</span>
                      <span className="font-bold">₹{Math.round(finalPayable)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-700">
                      <span>Amount Receiving:</span>
                      <span className="font-bold">₹{Math.round(partial)}</span>
                    </div>
                    <div className={`flex justify-between border-t border-amber-300 pt-1 mt-1 ${isFullyPaid ? "text-emerald-700" : "text-red-700"}`}>
                      <span>{isFullyPaid ? "Status:" : "Balance Remaining:"}</span>
                      <span className="font-bold">{isFullyPaid ? "✓ Will be marked as Paid" : `₹${Math.round(remaining)}`}</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {formData.paymentStatus === "Due" && (
            <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-[10px] text-red-700 font-medium flex items-center gap-2"><FaTimesCircle className="w-4 h-4" /> This payment is marked as Due. No amount will be collected now.</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button type="button" onClick={cancelForm} className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-100 hover:bg-gray-200">Cancel</button>
          <button type="submit" className={`px-5 py-2 rounded-lg text-xs font-bold text-white shadow-sm flex items-center gap-1.5 ${isEditMode ? "bg-blue-600 hover:bg-blue-700" : "bg-emerald-600 hover:bg-emerald-700"}`}>
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
              <div className="overflow-x-auto">
                <table className="emp-dash__table">
                  <thead>
                    <tr>
                      <th style={{ width: "35px", textAlign: "center" }}>#</th>
                      <th>Patient</th><th>Phone</th><th>Doctor</th>
                      <th style={{ textAlign: "center" }}>Appt. Date & Time</th>
                      <th style={{ textAlign: "center" }}>Booking Status</th>
                      <th style={{ textAlign: "center", minWidth: "150px" }}>Amount</th>
                      <th style={{ textAlign: "center" }}>Discount</th>
                      <th style={{ textAlign: "center" }}>Total</th>
                      <th style={{ textAlign: "center" }}>Paid</th>
                      <th style={{ textAlign: "center" }}>DUE</th>
                      <th style={{ textAlign: "center" }}>Payment Status</th>
                      <th style={{ textAlign: "center" }}>Referred By (Customer)</th>
                      <th style={{ textAlign: "center" }}>Referred By (Doctor)</th>
                      <th style={{ textAlign: "center" }}>Created At</th>
                      <th style={{ textAlign: "center" }}>Active</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPatients.map((patient, idx) => {
                      const matchingBooking = getMatchingBooking(patient);
                      const totalFee = getPatientTotalFee(patient);
                      const consultationPaymentStatus = getConsultationPaymentStatus(patient);
                      const bookingStatus = getBookingStatus(patient);
                      const appointmentDate = getAppointmentDate(patient);
                      const slotTiming = getSlotTiming(patient);
                      const statusColors = getStatusColors(bookingStatus);
                      const referredByCustomer = matchingBooking?.referredByCustomer || patient.referredByCustomer || "";
                      const referredByDoctor = matchingBooking?.referredByDoctor || patient.referredByDoctor || "";
                      const paymentColors = getPaymentStatusColors(consultationPaymentStatus);
                      const createdAt = matchingBooking?.createdAt || matchingBooking?.bookedAt || patient.createdAt;
                      const paidInfo = getBookingPaidInfo(matchingBooking);
                      const amountBreakdown = getAmountBreakdown(matchingBooking);
                      const isPaid = consultationPaymentStatus === "Paid";
                      const isPartial = consultationPaymentStatus === "Partial";
                      const isActive = getPatientActiveStatus(patient);
                      const isToggling = togglingStatus === patient._id;
                      const discountAmount = Number(matchingBooking?.discount) || 0;

                      return (
                        <tr key={patient._id} className="hover:bg-blue-50/40">
                          <td className="px-2 py-3 text-center text-slate-500 text-[11px]">{indexOfFirstItem + idx + 1}</td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-[10px]">{patient.name ? patient.name.charAt(0).toUpperCase() : "P"}</div>
                              <div>
                                <div className="font-semibold text-slate-800 text-xs truncate max-w-[80px]">{patient.title || ""} {patient.name || "N/A"}</div>
                                <div className="text-[9px] text-gray-400">{patient.age || "N/A"} yrs</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-xs">{patient.phone || "N/A"}</td>
                          <td className="px-3 py-3"><div className="text-xs font-semibold text-purple-800 truncate max-w-[90px]">{matchingBooking?.doctorName || "N/A"}</div></td>
                          <td className="px-3 py-3 text-center whitespace-nowrap text-xs">
                            <div className="font-semibold text-slate-700">{formatDateToDDMMYYYY(appointmentDate)}</div>
                            {slotTiming !== "-" && (
                              <div className="text-[10px] text-blue-700 font-semibold mt-0.5">{slotTiming}</div>
                            )}
                          </td>
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            {bookingStatus !== "No Booking" && matchingBooking ? (
                              <div className="relative inline-block status-dropdown">
                                <button onClick={(e) => handleStatusDropdownToggle(matchingBooking._id, e)} className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}>
                                  <FaCheckCircle className="w-2.5 h-2.5" /> {bookingStatus} <FiChevronDown className="w-3 h-3" />
                                </button>
                                {openStatusDropdown === matchingBooking._id && (
                                  <div className="fixed z-[9999] bg-white rounded-lg shadow-2xl border py-1 min-w-[140px]" style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} onClick={(e) => e.stopPropagation()}>
                                    {BOOKING_STATUS_OPTIONS.map((st) => {
                                      const isActive_ = st.value === bookingStatus;
                                      const colors = getStatusColors(st.value);
                                      return <button key={st.value} onClick={(e) => { e.stopPropagation(); handleStatusSelect(matchingBooking, st.value, e); }} className={`w-full px-4 py-2 text-left text-[11px] font-semibold hover:bg-gray-50 flex items-center gap-2 ${isActive_ ? colors.text : "text-gray-600"}`}><span className={`w-2 h-2 rounded-full ${colors.bg} border ${colors.border}`}></span> {st.label} {isActive_ && <FaCheck className="w-2.5 h-2.5 ml-auto text-green-500" />}</button>;
                                    })}
                                  </div>
                                )}
                              </div>
                            ) : <span className="text-[10px] text-gray-400 italic">N/A</span>}
                          </td>
                          <td className="px-3 py-3" style={{ minWidth: "150px" }}>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center justify-between gap-1 px-2 py-1 rounded border border-blue-200 bg-blue-50 text-blue-700 text-[10px]">
                                <span className="font-semibold whitespace-nowrap flex items-center gap-1"><FaClinicMedical className="text-[9px]" /> Clinic:</span>
                                <span className="font-bold whitespace-nowrap">₹{Math.round(Number(amountBreakdown?.clinic) || 0)}</span>
                              </div>
                              <div className="flex items-center justify-between gap-1 px-2 py-1 rounded border border-purple-200 bg-purple-50 text-purple-700 text-[10px]">
                                <span className="font-semibold whitespace-nowrap flex items-center gap-1"><FaFlask className="text-[9px]" /> Lab:</span>
                                <span className="font-bold whitespace-nowrap flex items-center gap-1">
                                  ₹{Math.round(Number(amountBreakdown?.lab) || 0)}
                                  <button onClick={(e) => { e.stopPropagation(); if (matchingBooking) openLabTotalModal(matchingBooking); }} className="p-0.5 rounded hover:bg-purple-100" title="Edit Lab Total">
                                    <FaRupeeSign className="w-2.5 h-2.5 text-purple-600" />
                                  </button>
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-1 px-2 py-1 rounded border border-green-200 bg-green-50 text-green-700 text-[10px]">
                                <span className="font-semibold whitespace-nowrap flex items-center gap-1"><FaPills className="text-[9px]" /> Pharmacy:</span>
                                <span className="font-bold whitespace-nowrap flex items-center gap-1">
                                  ₹{Math.round(Number(amountBreakdown?.pharmacy) || 0)}
                                  <button onClick={(e) => { e.stopPropagation(); if (matchingBooking) openMedicineTotalModal(matchingBooking); }} className="p-0.5 rounded hover:bg-green-100" title="Edit Medicine Total">
                                    <FaRupeeSign className="w-2.5 h-2.5 text-green-600" />
                                  </button>
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            {discountAmount > 0 ? (
                              <span className="text-xs font-bold text-red-600">− ₹{Math.round(discountAmount)}</span>
                            ) : <span className="text-xs text-gray-400">—</span>}
                          </td>
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <span className="text-xs font-bold text-slate-800">₹{Math.round(paidInfo.final)}</span>
                          </td>
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <span className="text-xs font-bold text-emerald-700">₹{Math.round(paidInfo.paid)}</span>
                          </td>
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <span className={`text-xs font-bold ${paidInfo.balance > 0 ? "text-red-600" : "text-gray-400"}`}>₹{Math.round(paidInfo.balance)}</span>
                          </td>
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            {matchingBooking ? (
                              isPaid ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default">
                                  <FaCheckCircle className="w-2.5 h-2.5 text-emerald-600" /> Paid
                                </span>
                              ) : isPartial ? (
                                <button onClick={(e) => { e.stopPropagation(); openPartialModal(matchingBooking); }} className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" title="Click to update payment">
                                  <FaClock className="w-2.5 h-2.5 text-amber-600" /> Partial <FiChevronDown className="w-3 h-3" />
                                </button>
                              ) : (
                                <div className="relative inline-block payment-dropdown">
                                  <button onClick={(e) => handlePaymentDropdownToggle(matchingBooking._id, e)} className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${paymentColors.bg} ${paymentColors.text} ${paymentColors.border}`}>
                                    <paymentColors.icon className={`w-2.5 h-2.5 ${paymentColors.iconColor}`} /> {consultationPaymentStatus} <FiChevronDown className="w-3 h-3" />
                                  </button>
                                  {openPaymentDropdown === matchingBooking._id && (
                                    <div className="fixed z-[9999] bg-white rounded-lg shadow-2xl border py-1 min-w-[140px]" style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} onClick={(e) => e.stopPropagation()}>
                                      {PAYMENT_STATUS_OPTIONS.map((st) => {
                                        const isActive_ = st.value === consultationPaymentStatus;
                                        const colors = getPaymentStatusColors(st.value);
                                        const Icon = colors.icon;
                                        return <button key={st.value} onClick={(e) => { e.stopPropagation(); handlePaymentSelect(matchingBooking, st.value, e); }} className={`w-full px-4 py-2 text-left text-[11px] font-semibold hover:bg-gray-50 flex items-center gap-2 ${isActive_ ? colors.text : "text-gray-600"}`}><Icon className={`w-3 h-3 ${colors.iconColor}`} /> {st.label} {isActive_ && <FaCheck className="w-2.5 h-2.5 ml-auto text-green-500" />}</button>;
                                      })}
                                    </div>
                                  )}
                                </div>
                              )
                            ) : <span className="text-[10px] text-gray-400 italic">N/A</span>}
                          </td>
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            {referredByCustomer ? <div className="flex items-center justify-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100"><FaUserFriends className="text-[9px]" /><span className="truncate max-w-[80px]">{referredByCustomer}</span></div> : <span className="text-[10px] text-gray-400 italic">N/A</span>}
                          </td>
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            {referredByDoctor ? <div className="flex items-center justify-center gap-1 text-xs font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100"><FaUserMdIcon className="text-[9px]" /><span className="truncate max-w-[80px]">{referredByDoctor}</span></div> : <span className="text-[10px] text-gray-400 italic">N/A</span>}
                          </td>
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <div className="text-[10px] font-semibold text-slate-700">{formatDateToDDMMYYYY(createdAt)}</div>
                            <div className="text-[9px] text-gray-400 mt-0.5">{createdAt ? new Date(createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) : "N/A"}</div>
                          </td>
                          <td className="px-3 py-4 text-center whitespace-nowrap">
                            <button onClick={(e) => { e.stopPropagation(); handleToggleActiveStatus(patient); }} disabled={isToggling} className={`inline-flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-full uppercase border-2 transition-all shadow-sm ${isActive ? "bg-emerald-50 text-emerald-700 border-emerald-400 hover:bg-emerald-100 hover:shadow-md" : "bg-gray-100 text-gray-600 border-gray-400 hover:bg-gray-200 hover:shadow-md"} disabled:opacity-50`} title={isActive ? "Click to deactivate" : "Click to activate"}>
                              {isToggling ? <FiRefreshCw className="w-5 h-5 animate-spin" /> : isActive ? <FaToggleOn className="w-6 h-6 text-emerald-600" /> : <FaToggleOff className="w-6 h-6 text-gray-500" />}
                              <span className="text-[11px]">{isActive ? "Active" : "Inactive"}</span>
                            </button>
                          </td>
                          <td className="px-3 py-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button onClick={(e) => { e.stopPropagation(); handleRowClick(patient); }} className="p-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg" title="View"><FiEye className="w-3.5 h-3.5" /></button>
                              <button onClick={(e) => { e.stopPropagation(); handleEdit(patient, matchingBooking); }} className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg" title="Edit"><FiEdit2 className="w-3.5 h-3.5" /></button>
                              {matchingBooking && (
                                <>
                                  <button onClick={(e) => { e.stopPropagation(); openPrescriptionModal(matchingBooking); }} className="p-1.5 bg-teal-50 text-teal-600 hover:bg-teal-100 rounded-lg" title="Prescription"><FaPrescription className="w-3.5 h-3.5" /></button>
                                  <button onClick={(e) => { e.stopPropagation(); openVitalsModal(matchingBooking); }} className="p-1.5 bg-pink-50 text-pink-600 hover:bg-pink-100 rounded-lg" title="Vitals"><FaHeartbeat className="w-3.5 h-3.5" /></button>
                                  <button onClick={(e) => { e.stopPropagation(); openBillingModal(matchingBooking); }} className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg" title="Billing"><FaFileInvoiceDollar className="w-3.5 h-3.5" /></button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
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

        {/* COMPLETE PATIENT MODAL */}
        {showPatientModal && selectedPatient && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border">
              <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center"><FaUserInjured /></div>
                  <div><h3 className="font-bold text-gray-900 text-base">Patient Profile & Appointments</h3><p className="text-xs text-gray-500">{selectedPatient.title} {selectedPatient.name} • {selectedPatient.phone}</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-purple-700 font-semibold bg-purple-50 px-3 py-1 rounded-full border">{patientBookings.length} Bookings</span>
                  <button onClick={() => { setShowPatientModal(false); setPatientBookings([]); setSelectedPatient(null); }} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"><FaTimes /></button>
                </div>
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
                        <div><div className="text-[10px] font-bold uppercase text-gray-400 flex items-center gap-1"><FaBirthdayCake className="text-[10px]" /> Age</div><div className="font-semibold mt-0.5">{selectedPatient.age || "N/A"} Yrs</div></div>
                        <div><div className="text-[10px] font-bold uppercase text-gray-400 flex items-center gap-1"><FaVenusMars className="text-[10px]" /> Gender</div><div className="font-semibold mt-0.5">{selectedPatient.gender || "N/A"}</div></div>
                        <div><div className="text-[10px] font-bold uppercase text-gray-400 flex items-center gap-1"><FaCalendarAlt className="text-[10px]" /> DOB</div><div className="font-semibold mt-0.5">{formatDateToDDMMYYYY(selectedPatient.dob)}</div></div>
                        <div><div className="text-[10px] font-bold uppercase text-gray-400 flex items-center gap-1"><FaTint className="text-[10px]" /> Blood Group</div><div className="font-semibold mt-0.5">{selectedPatient.bloodGroup || "N/A"}</div></div>
                        <div><div className="text-[10px] font-bold uppercase text-gray-400 flex items-center gap-1"><FaCreditCard className="text-[10px]" /> Payment Mode</div><div className="font-semibold mt-0.5 capitalize">{selectedPatient.paymentType || "N/A"}</div></div>
                        <div><div className="text-[10px] font-bold uppercase text-gray-400 flex items-center gap-1"><FaMapMarkerAlt className="text-[10px]" /> City</div><div className="font-semibold mt-0.5">{selectedPatient.city || "N/A"}</div></div>
                        <div><div className="text-[10px] font-bold uppercase text-gray-400 flex items-center gap-1"><FaMapMarkerAlt className="text-[10px]" /> Pincode</div><div className="font-semibold mt-0.5">{selectedPatient.pincode || "N/A"}</div></div>
                        <div><div className="text-[10px] font-bold uppercase text-gray-400 flex items-center gap-1"><FaEnvelope className="text-[10px]" /> Email</div><div className="font-semibold mt-0.5 truncate">{selectedPatient.email || "N/A"}</div></div>
                        <div className="col-span-2 md:col-span-4"><div className="text-[10px] font-bold uppercase text-gray-400 flex items-center gap-1"><FaMapMarkerAlt className="text-[10px]" /> Address</div><div className="font-semibold mt-0.5">{selectedPatient.address || "N/A"}</div></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-3"><FaCalendarAlt className="text-purple-600" /><h4 className="font-bold text-gray-900 text-sm">Appointment Records ({patientBookings.length})</h4></div>
                      {patientBookings.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-sm bg-gray-50 rounded-xl border">No appointments booked yet.</div>
                      ) : (
                        <div className="space-y-4">
                          {patientBookings.map((booking, bIdx) => {
                            const items = getBookingServices(booking);
                            const hasServices = items.length > 0;
                            const totalFee = getBookingFinalPayable(booking);
                            const paidInfo = getBookingPaidInfo(booking);
                            const statusColors = getStatusColors(booking.status);
                            const slotTiming = booking.startTime && booking.endTime ? `${booking.startTime} - ${booking.endTime}` : "N/A";
                            const breakdown = getAmountBreakdown(booking);
                            const hasVitals = booking.vitalsTemp || booking.vitalsBp || booking.vitalsPr || booking.vitalsWeight;
                            return (
                              <div key={booking._id} className="bg-white border rounded-xl overflow-hidden shadow-sm">
                                <div className={`px-4 py-2.5 ${statusColors.bg} border-b ${statusColors.border} flex items-center justify-between flex-wrap gap-2`}>
                                  <div className="flex items-center gap-2.5 flex-wrap">
                                    <span className="font-bold text-gray-500 text-xs">#{bIdx + 1}</span>
                                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${statusColors.text} ${statusColors.bg} ${statusColors.border}`}>{booking.status || "N/A"}</span>
                                    <span className="text-xs text-gray-600">{formatDateToDDMMYYYY(booking.appointmentDate || booking.date)}</span>
                                    {slotTiming !== "N/A" && <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200">{slotTiming}</span>}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button onClick={() => openBillingModal(booking)} className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg" title="Billing"><FaFileInvoiceDollar className="w-3.5 h-3.5" /></button>
                                    <button onClick={() => openPrescriptionModal(booking)} className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg" title="Prescription"><FaPrescription className="w-3.5 h-3.5" /></button>
                                    <button onClick={() => openVitalsModal(booking)} className="p-1.5 text-pink-600 hover:bg-pink-50 rounded-lg" title="Vitals"><FaHeartbeat className="w-3.5 h-3.5" /></button>
                                  </div>
                                </div>
                                <div className="p-4 space-y-4">
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                    <div><div className="text-[10px] font-bold uppercase text-gray-400">Doctor</div><div className="font-bold">{booking.doctorName || "N/A"}</div><div className="text-[10px] text-gray-500">{booking.doctorSpecialization || ""}</div></div>
                                    <div><div className="text-[10px] font-bold uppercase text-gray-400">Appointment Type</div><div className="font-bold">{booking.appointmentType || "Consultation"}</div></div>
                                    <div><div className="text-[10px] font-bold uppercase text-gray-400">Purpose</div><div className="font-bold">{booking.purpose || "N/A"}</div></div>
                                    <div><div className="text-[10px] font-bold uppercase text-gray-400">Booked At</div><div className="font-bold text-[11px]">{formatDateTimeToDDMMYYYY(booking.bookedAt || booking.createdAt)}</div></div>
                                  </div>

                                  {hasVitals && (
                                    <div className="p-3 bg-pink-50 rounded-lg border border-pink-200">
                                      <div className="text-[10px] font-bold uppercase text-pink-700 flex items-center gap-1 mb-2"><FaHeartbeat className="text-[10px]" /> Vitals</div>
                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                        {booking.vitalsTemp && <div><span className="text-gray-500">Temp:</span> <span className="font-bold">{booking.vitalsTemp} °F</span></div>}
                                        {booking.vitalsBp && <div><span className="text-gray-500">BP:</span> <span className="font-bold">{booking.vitalsBp} mmHg</span></div>}
                                        {booking.vitalsPr && <div><span className="text-gray-500">PR:</span> <span className="font-bold">{booking.vitalsPr} bpm</span></div>}
                                        {booking.vitalsWeight && <div><span className="text-gray-500">Weight:</span> <span className="font-bold">{booking.vitalsWeight} kg</span></div>}
                                      </div>
                                    </div>
                                  )}

                                  {(booking.referredByCustomer || booking.referredByDoctor) && (
                                    <div className="flex flex-wrap gap-2">
                                      {booking.referredByCustomer && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                          <FaUserFriends className="text-[9px]" /> Customer: {booking.referredByCustomer}
                                        </span>
                                      )}
                                      {booking.referredByDoctor && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                                          <FaUserMdIcon className="text-[9px]" /> Doctor: {booking.referredByDoctor}
                                        </span>
                                      )}
                                    </div>
                                  )}

                                  {hasServices && (
                                    <div>
                                      <div className="text-[10px] font-bold uppercase text-gray-400">Services</div>
                                      <div className="flex flex-wrap gap-1.5 mt-1">
                                        {items.map((svc, sIdx) => (
                                          <span key={sIdx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                            {svc.name} ₹{svc.price}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs p-3 bg-gray-50 rounded-lg border">
                                    <div><div className="text-[10px] font-bold uppercase text-gray-400">Total Fee</div><div className="text-sm font-extrabold text-slate-800">₹{Math.round(totalFee)}</div></div>
                                    <div><div className="text-[10px] font-bold uppercase text-gray-400">Paid</div><div className="text-sm font-extrabold text-emerald-700">₹{Math.round(paidInfo.paid)}</div></div>
                                    <div><div className="text-[10px] font-bold uppercase text-gray-400">Balance</div><div className={`text-sm font-extrabold ${paidInfo.balance > 0 ? "text-red-600" : "text-gray-400"}`}>₹{Math.round(paidInfo.balance)}</div></div>
                                    <div><div className="text-[10px] font-bold uppercase text-gray-400">Mode</div><div className="font-bold capitalize">{booking.paymentType || "cash"}</div></div>
                                    <div><div className="text-[10px] font-bold uppercase text-gray-400">Status</div>
                                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${booking.paymentStatus === "Paid" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : booking.paymentStatus === "Partial" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                                        {booking.paymentStatus || "N/A"}
                                      </span>
                                    </div>
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

        {/* PRESCRIPTION MODAL */}
        {showPrescriptionModal && selectedBookingForPrescription && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="relative max-w-[480px] w-full rounded-2xl overflow-hidden shadow-2xl bg-white max-h-[90vh] overflow-y-auto">
              <button onClick={() => { setShowPrescriptionModal(false); setSelectedBookingForPrescription(null); }} className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5 shadow-lg z-30"><FaTimes className="w-4 h-4 text-gray-700" /></button>
              <div className="absolute top-2 left-2 flex gap-1.5 z-30">
                <button onClick={handlePrintPrescription} className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold shadow-lg"><FaPrint className="w-3 h-3" /> Print</button>
                <button onClick={handlePrintPrescription} className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-bold shadow-lg"><FaFilePdf className="w-3 h-3" /> PDF</button>
              </div>
              <div className="border-b pb-2 mb-2">
                <div className="text-center text-[10px] font-bold text-gray-400 py-1 bg-gray-50">Front Side - Prescription</div>
                <div ref={prescriptionRef} className="relative w-full overflow-hidden" style={{ transform: "scale(0.75)", transformOrigin: "top center", width: "133.33%", marginLeft: "-16.66%" }}>
                  <img src={prescriptionTemplate} alt="Front" className="w-full h-auto object-contain" />
                  <div className="absolute inset-0 text-black">
                    <div style={{ position: "absolute", top: "78px", left: "90px", fontSize: "15px", fontWeight: 600 }}>{selectedBookingForPrescription?.patientTitle || ""} {selectedBookingForPrescription?.patientName || "N/A"}</div>
                    <div style={{ position: "absolute", top: "78px", right: "20px", fontSize: "15px", fontWeight: 600 }}>{formatDateToDDMMYYYY(selectedBookingForPrescription?.appointmentDate || selectedBookingForPrescription?.date)}</div>
                    <div style={{ position: "absolute", top: "104px", left: "90px", fontSize: "15px", fontWeight: 600 }}>{selectedBookingForPrescription?.patientAge || "N/A"}</div>
                    <div style={{ position: "absolute", top: "104px", left: "230px", fontSize: "15px", fontWeight: 600 }}>{selectedBookingForPrescription?.patientGender || "N/A"}</div>
                    <div style={{ position: "absolute", top: "104px", right: "100px", fontSize: "15px", fontWeight: 600 }}>{selectedBookingForPrescription?.patientPhone || "N/A"}</div>
                    <div style={{ position: "absolute", top: "130px", left: "90px", fontSize: "15px", fontWeight: 600 }}>{selectedBookingForPrescription?.purpose || "N/A"}</div>
                    <div style={{ position: "absolute", top: "160px", left: "90px", fontSize: "15px", fontWeight: 600 }}>{selectedBookingForPrescription?.vitalsTemp || ""}</div>
                    <div style={{ position: "absolute", top: "160px", left: "230px", fontSize: "15px", fontWeight: 600 }}>{selectedBookingForPrescription?.vitalsBp || ""}</div>
                    <div style={{ position: "absolute", top: "160px", left: "370px", fontSize: "15px", fontWeight: 600 }}>{selectedBookingForPrescription?.vitalsPr || ""}</div>
                    <div style={{ position: "absolute", top: "160px", right: "100px", fontSize: "15px", fontWeight: 600 }}>{selectedBookingForPrescription?.vitalsWeight || ""}</div>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-center text-[10px] font-bold text-gray-400 py-1 bg-gray-50">Back Side</div>
                <div className="relative w-full overflow-hidden" style={{ transform: "scale(0.75)", transformOrigin: "top center", width: "133.33%", marginLeft: "-16.66%" }}>
                  <img src={prescriptionBackTemplate} alt="Back" className="w-full h-auto object-contain" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BILLING MODAL */}
        {showBillingModal && selectedBookingForBilling && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center"><FaFileInvoiceDollar /></div>
                  <div><h3 className="font-bold text-gray-900 text-base">Bill Cum Receipt</h3><p className="text-xs text-gray-500">{selectedBookingForBilling.patientName} • {billingData.invoiceNo}</p></div>
                </div>
                <button onClick={() => { setShowBillingModal(false); setSelectedBookingForBilling(null); }} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"><FaTimes /></button>
              </div>
              <div className="p-6 md:p-8 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.04] pointer-events-none w-64 h-64"><img src={logo} alt={CLINIC_INFO.name} /></div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between border-b-2 border-gray-800 pb-4 mb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-3"><img src={logo} alt={CLINIC_INFO.name} className="w-14 h-14 object-contain" /><div><h2 className="text-xl font-bold">{CLINIC_INFO.name}</h2><p className="text-[11px] text-gray-500 max-w-sm">{CLINIC_INFO.address}</p></div></div>
                    <div className="text-right text-[11px] text-gray-500">Contact No : {CLINIC_INFO.contact}</div>
                  </div>
                  <div className="text-center bg-gray-100 border-y border-gray-300 py-1.5 mb-4"><span className="text-sm font-bold tracking-widest uppercase">Bill Cum Receipt</span></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs mb-5">
                    <div><span className="font-bold text-gray-500 inline-block w-28">Name</span>: {selectedBookingForBilling?.patientTitle || ""} {selectedBookingForBilling?.patientName || "N/A"}</div>
                    <div><span className="font-bold text-gray-500 inline-block w-28">Invoice No / Date</span>: {billingData.invoiceNo} / {billingData.invoiceDate}</div>
                    <div><span className="font-bold text-gray-500 inline-block w-28">Age</span>: {selectedBookingForBilling?.patientAge || "N/A"} Yrs</div>
                    <div><span className="font-bold text-gray-500 inline-block w-28">Gender</span>: {selectedBookingForBilling?.patientGender || "N/A"}</div>
                    <div><span className="font-bold text-gray-500 inline-block w-28">Contact No</span>: {selectedBookingForBilling?.patientPhone || "N/A"}</div>
                    <div><span className="font-bold text-gray-500 inline-block w-28">Doctor</span>: {billingData.doctorName}</div>
                  </div>

                  <table className="w-full mb-4 border-t-2 border-b-2 border-gray-800">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-center py-2 px-2 text-[10px] font-bold text-gray-600 uppercase tracking-wider" style={{ width: "8%" }}>No.</th>
                        <th className="text-left py-2 px-2 text-[10px] font-bold text-gray-600 uppercase tracking-wider" style={{ width: "62%" }}>Service / Item</th>
                        <th className="text-right py-2 px-2 text-[10px] font-bold text-gray-600 uppercase tracking-wider" style={{ width: "30%" }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {buildBillingTableRows()}
                    </tbody>
                  </table>

                 <div className="flex flex-col items-end mb-3">
  <div className="w-full max-w-xs text-xs bg-gray-50 rounded-lg border border-gray-200 p-3">

    {/* ✅ Gross Amount */}
    <div className="flex justify-between py-1.5 border-b border-gray-200">
      <span className="text-gray-600">Gross Amount</span>
      <span className="font-bold text-gray-900">₹ {billingData.grossAmount.toFixed(2)}</span>
    </div>

    {/* ✅ Discount (only if > 0) */}
    {billingData.discount > 0 && (
      <div className="flex justify-between py-1.5 border-b border-gray-200">
        <span className="text-red-600 flex items-center gap-1">
          <FaPercent className="text-[9px]" /> Discount
        </span>
        <span className="font-bold text-red-600">− ₹ {billingData.discount.toFixed(2)}</span>
      </div>
    )}

    {/* ✅ Net Amount */}
    <div className="flex justify-between py-1.5 border-b border-gray-200 bg-blue-50/50 -mx-3 px-3">
      <span className="text-gray-900 font-bold">Net Amount</span>
      <span className="font-bold text-gray-900">₹ {billingData.netAmount.toFixed(2)}</span>
    </div>

    <div className="flex justify-between py-1.5 border-b border-gray-200">
      <span className="text-gray-600">Paid Amount</span>
      <span className="font-bold text-emerald-700">₹ {billingData.paidAmount.toFixed(2)}</span>
    </div>
    <div className="flex justify-between py-2 mt-1 border-t-2 border-gray-800">
      <span className="font-extrabold text-gray-900">Balance to Pay</span>
      <span className={`font-extrabold ${billingData.balanceAmount > 0 ? "text-red-600" : "text-emerald-700"}`}>
        ₹ {billingData.balanceAmount.toFixed(2)}
      </span>
    </div>
  </div>
  <div className="mt-2 text-[10px] text-gray-500 italic">
    Amount in words: <span className="font-semibold text-gray-700">{billingData.amountInWords}</span>
  </div>
</div>
                </div>
              </div>
              <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50/50">
                {billingData.paymentStatus === "Pending" && <button onClick={handleMarkAsPaid} className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 text-white flex items-center gap-1.5"><FaCheckCircle className="w-3.5 h-3.5" /> Mark as Paid</button>}
                <button onClick={printBill} className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 text-white flex items-center gap-1.5"><FaPrint className="w-3.5 h-3.5" /> Print Bill</button>
                <button onClick={() => { setShowBillingModal(false); setSelectedBookingForBilling(null); }} className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-200 hover:bg-gray-300">Close</button>
              </div>
            </div>
          </div>
        )}

        {/* PARTIAL PAYMENT MODAL — Mark as Fully Paid */}
        {showPartialModal && partialBooking && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border relative">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center"><FaClock className="w-5 h-5" /></div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Update Payment</h3>
                    <p className="text-xs text-gray-500">{partialBooking.patientName} • {partialBooking.patientPhone}</p>
                  </div>
                </div>
                <button onClick={() => { setShowPartialModal(false); setPartialBooking(null); }} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"><FaTimes className="w-4 h-4" /></button>
              </div>

              {(() => {
                const finalPayable = getBookingFinalPayable(partialBooking);
                const paidInfo = getBookingPaidInfo(partialBooking);
                return (
                  <div className="p-6 space-y-4">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="text-[10px] font-bold uppercase text-gray-400 mb-3">Payment Summary</div>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Total Payable</span>
                          <span className="font-bold text-gray-900 text-sm">₹{Math.round(finalPayable)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Already Paid</span>
                          <span className="font-bold text-emerald-700">₹{Math.round(paidInfo.paid)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t-2 border-gray-800">
                          <span className="font-bold text-gray-800">Due Amount</span>
                          <span className="font-bold text-red-600 text-lg">₹{Math.round(paidInfo.balance)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-[11px] text-blue-800">
                        Clicking <b>"Mark as Fully Paid"</b> will clear the entire due amount of <b>₹{Math.round(paidInfo.balance)}</b>.
                      </p>
                    </div>
                  </div>
                );
              })()}

              <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50/50">
                <button onClick={() => { setShowPartialModal(false); setPartialBooking(null); }} className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-200 hover:bg-gray-300 text-gray-700">Cancel</button>
                <button onClick={handleMarkFullPaid} disabled={savingPartial} className="px-5 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 disabled:opacity-50">
                  {savingPartial ? <FiRefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FaCheckCircle className="w-3.5 h-3.5" />}
                  {savingPartial ? "Saving..." : "Mark as Fully Paid"}
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
                <p className="text-[10px] text-gray-500">Update the total medicine amount for this booking.</p>
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

        {/* LAB TOTAL MODAL */}
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
                <p className="text-[10px] text-gray-500">Update the total lab amount for this booking.</p>
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
                <div>
                  <label className="block text-[11px] font-bold text-pink-700 uppercase tracking-wider mb-1">Temp (°F)</label>
                  <input type="text" value={vitalsData.temp} onChange={(e) => setVitalsData((prev) => ({ ...prev, temp: e.target.value }))} placeholder="e.g. 98.6" className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-pink-700 uppercase tracking-wider mb-1">BP (mmHg)</label>
                  <input type="text" value={vitalsData.bp} onChange={(e) => setVitalsData((prev) => ({ ...prev, bp: e.target.value }))} placeholder="e.g. 120/80" className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-pink-700 uppercase tracking-wider mb-1">PR (bpm)</label>
                  <input type="text" value={vitalsData.pr} onChange={(e) => setVitalsData((prev) => ({ ...prev, pr: e.target.value }))} placeholder="e.g. 72" className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-pink-700 uppercase tracking-wider mb-1">Weight (kg)</label>
                  <input type="text" value={vitalsData.weight} onChange={(e) => setVitalsData((prev) => ({ ...prev, weight: e.target.value }))} placeholder="e.g. 70" className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm" />
                </div>
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

      </main>
    </div>
  );
}