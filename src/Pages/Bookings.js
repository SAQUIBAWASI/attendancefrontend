import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import { useNavigate } from "react-router-dom";
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
  FaClipboardList,
  FaCalendarCheck,
  FaHistory
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
  FiPlusCircle,
  FiChevronDown,
  FiChevronUp,
  FiAlertCircle
} from "react-icons/fi";
import "./EmployeeDashboard.css";
import "./EmployeeLeaves.css";
import logo from "../Images/Timelyhealth logo.png";

const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" }
];

const FEE_TYPE_OPTIONS = [
  { value: "consultation", label: "Consultation Fee" },
  { value: "lab", label: "Lab Fee" }
];

const PAYMENT_TYPE_OPTIONS = [
  { value: "cash", label: "Cash" },
  { value: "online", label: "Online" }
];

const PAYMENT_STATUS_OPTIONS = [
  { value: "Pending", label: "Pending" },
  { value: "Paid", label: "Paid" }
];

const BOOKING_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "consulting", label: "Consulting" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" }
];

const EMPTY_FORM = {
  name: "",
  age: "",
  gender: "",
  phone: "",
  address: "",
  feeType: "consultation",
  feeAmount: 300,
  paymentType: "cash",
  reason: "",
  paymentStatus: "Pending",
  doctorId: "",
  slotId: "",
  appointmentDate: ""
};

const CLINIC_INFO = {
  name: "TimelyHealth",
  address:
    "Flat No: 301, 3rd Floor, Sri Sai Balaji Avenue, H. No: 1-98/9/25/p, Opp Style on Studio, VIP Hills, near Bank of Baroda, Arunodaya Colony, Sri Sai Nagar, Madhapur, Hyderabad, Telangana 500081",
  contact: "9505397000"
};

const getDayNameFromDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { weekday: "long" });
};

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
    confirmed: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" }
  };
  return statusMap[status?.toLowerCase()] || statusMap.booked;
};

const numberToWords = (num) => {
  if (num === 0) return "Zero";
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen"
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety"
  ];

  const convert = (n) => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    if (n < 1000)
      return (
        ones[Math.floor(n / 100)] +
        " Hundred" +
        (n % 100 ? " and " + convert(n % 100) : "")
      );
    if (n < 100000)
      return (
        convert(Math.floor(n / 1000)) +
        " Thousand" +
        (n % 1000 ? " " + convert(n % 1000) : "")
      );
    if (n < 10000000)
      return (
        convert(Math.floor(n / 100000)) +
        " Lakh" +
        (n % 100000 ? " " + convert(n % 100000) : "")
      );
    return (
      convert(Math.floor(n / 10000000)) +
      " Crore" +
      (n % 10000000 ? " " + convert(n % 10000000) : "")
    );
  };

  return convert(num) + " Rupees Only";
};

export default function Bookings() {
  const navigate = useNavigate();
  
  // ===== MAIN DATA STATES =====
  const [patients, setPatients] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [allSlots, setAllSlots] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);

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

  // Status Dropdown state
  const [openStatusDropdown, setOpenStatusDropdown] = useState(null);

  const [existingPatient, setExistingPatient] = useState(null);
  const [showExistingPatientPopup, setShowExistingPatientPopup] = useState(false);
  const [searchingPatient, setSearchingPatient] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [feeTypeFilter, setFeeTypeFilter] = useState("All");
  const [doctorFilter, setDoctorFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Card filter state
  const [activeCardFilter, setActiveCardFilter] = useState("all");

  const [toast, setToast] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [patientBookings, setPatientBookings] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    const saved = localStorage.getItem("bookings_itemsPerPage");
    return saved ? parseInt(saved, 10) : 10;
  });

  // ===== BILLING STATE =====
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
    amountInWords: ""
  });

  const phoneInputRef = useRef(null);
  const nameInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const getDefaultMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };
  const isDefaultMonth = selectedMonth === getDefaultMonth();

  const hasActiveFilters = 
    searchQuery !== "" ||
    statusFilter !== "All" ||
    feeTypeFilter !== "All" ||
    doctorFilter !== "All" ||
    fromDate !== "" ||
    toDate !== "" ||
    (selectedMonth && selectedMonth !== "");

  const formatMonthDisplay = (monthValue) => {
    if (!monthValue) return '';
    const [year, month] = monthValue.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  // Toast helper
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch initial data
  useEffect(() => {
    fetchAllData();
    const today = new Date().toISOString().split("T")[0];
    setFormData((prev) => ({ ...prev, appointmentDate: today }));
  }, []);

  const fetchAllData = () => {
    fetchPatients();
    fetchBookings();
    fetchDoctors();
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

  // ===== fetchPatients =====
  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/patients`);
      console.log("=== PATIENTS API RESPONSE ===", res.data);
      
      let patientsData = [];
      if (res.data && res.data.success) {
        if (res.data.data && Array.isArray(res.data.data)) {
          patientsData = res.data.data;
        } else if (Array.isArray(res.data)) {
          patientsData = res.data;
        } else {
          patientsData = res.data.data || [];
        }
      } else if (Array.isArray(res.data)) {
        patientsData = res.data;
      }
      
      console.log("=== EXTRACTED PATIENTS ===", patientsData);
      setPatients(patientsData);
    } catch (err) {
      console.error("Error fetching patients:", err);
      setPatients([]);
      showToast("Failed to fetch patient records", "error");
    } finally {
      setLoading(false);
    }
  };

  // ===== fetchBookings =====
  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/appointment-slots/getallbookings`);
      console.log("=== BOOKINGS API RESPONSE ===", res.data);
      
      let bookingsData = [];
      if (res.data && res.data.success) {
        if (res.data.bookings && Array.isArray(res.data.bookings)) {
          bookingsData = res.data.bookings;
        } else if (res.data.data && Array.isArray(res.data.data)) {
          bookingsData = res.data.data;
        } else if (Array.isArray(res.data)) {
          bookingsData = res.data;
        } else {
          bookingsData = res.data.bookings || res.data.data || [];
        }
      } else if (Array.isArray(res.data)) {
        bookingsData = res.data;
      }
      
      console.log("=== EXTRACTED BOOKINGS ===", bookingsData);
      
      const transformedBookings = bookingsData.map((b) => {
        const slotDetails = b.slotDetails || {};
        return {
          _id: b._id || b.id,
          slotId: b.slotId || b._id,
          patientName: b.patientName || "",
          patientAge: b.patientAge || "",
          patientGender: b.patientGender || "Male",
          patientPhone: b.patientPhone || "",
          patientAddress: b.patientAddress || "",
          patientEmail: b.patientEmail || "",
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
          consultationFee: b.consultationFee || 300,
          paymentType: b.paymentType || "cash",
          paymentStatus: b.paymentStatus || "Pending",
          totalAmount: b.totalAmount || b.consultationFee || 300,
          amountPaid: b.amountPaid || 0,
          balanceAmount: b.balanceAmount || 0,
          status: b.status || "confirmed",
          services: b.services || [],
          createdAt: b.createdAt || b.bookedAt || new Date().toISOString(),
          updatedAt: b.updatedAt || b.createdAt || new Date().toISOString(),
          bookedAt: b.bookedAt || b.createdAt || new Date().toISOString(),
          shift: b.shift || slotDetails.shift || "Morning Shift",
          appointmentDate: b.appointmentDate || slotDetails.date || "",
          billNumber: b.billNumber || "",
          billingDate: b.billingDate || null,
          completedAt: b.completedAt || null,
          followUpRequired: b.followUpRequired || false,
          followUpDate: b.followUpDate || "",
          followUpNotes: b.followUpNotes || "",
          notes: b.notes || "",
          clinicalNotes: b.clinicalNotes || "",
          diagnosis: b.diagnosis || "",
          prescription: b.prescription || "",
          labTestsOrdered: b.labTestsOrdered || [],
          imagingOrdered: b.imagingOrdered || [],
          referralToSpecialist: b.referralToSpecialist || "",
          patientRating: b.patientRating || null,
          patientFeedback: b.patientFeedback || ""
        };
      });
      
      console.log("=== TRANSFORMED BOOKINGS ===", transformedBookings);
      setBookings(transformedBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setBookings([]);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/doctors/getalldoctors`);
      if (res.data && res.data.success) {
        setDoctors(res.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
      setDoctors([]);
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

  // Filter slots for appointment booking
  const filterSlotsByDoctorAndDate = (doctorId, date) => {
    if (!doctorId || !date) {
      setAvailableSlots([]);
      return;
    }
    setSlotsLoading(true);
    setAvailableSlots([]);
    setFormData((prev) => ({ ...prev, slotId: "" }));
    try {
      const selectedDay = getDayNameFromDate(date);
      let filtered = allSlots.filter((slot) => {
        const isSameDoctor = slot.doctorId === doctorId;
        const isSameDay = slot.dayOfWeek === selectedDay;
        const isNotBreak = slot.type !== "break";
        return isSameDoctor && isSameDay && isNotBreak;
      });
      const seenTimes = new Set();
      filtered = filtered.filter((slot) => {
        const key = slot.startTime;
        if (seenTimes.has(key)) return false;
        seenTimes.add(key);
        return true;
      });
      filtered.sort((a, b) => a.startTime.localeCompare(b.startTime));
      setAvailableSlots(filtered);
    } catch (error) {
      console.error("Error filtering slots:", error);
      setAvailableSlots([]);
      showToast("Failed to filter slots", "error");
    } finally {
      setSlotsLoading(false);
    }
  };

  // Existing patient lookup
  const checkExistingPatient = (value, field) => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (editingId) {
      setExistingPatient(null);
      setShowExistingPatientPopup(false);
      return;
    }
    if (!value || value.length < 2) {
      setExistingPatient(null);
      setShowExistingPatientPopup(false);
      return;
    }
    setSearchingPatient(true);
    searchTimeoutRef.current = setTimeout(() => {
      let found = null;
      if (field === "phone") {
        found = patients.find((p) => p.phone === value);
      } else if (field === "name") {
        const searchTerm = value.toLowerCase().trim();
        found = patients.find((p) => p.name && p.name.toLowerCase().includes(searchTerm));
      }
      if (found) {
        setExistingPatient(found);
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
      name: existingPatient.name || "",
      age: existingPatient.age ?? "",
      gender: existingPatient.gender || "",
      phone: existingPatient.phone || "",
      address: existingPatient.address || "",
      feeType: existingPatient.feeType || "consultation",
      feeAmount: existingPatient.feeAmount ?? 300,
      paymentType: existingPatient.paymentType || "cash",
      reason: existingPatient.reason || "",
      paymentStatus: existingPatient.paymentStatus || "Pending"
    }));
    setEditingId(existingPatient._id);
    setShowExistingPatientPopup(false);
    showToast(`Patient ${existingPatient.name} details auto-filled!`, "info");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "phone") checkExistingPatient(value, "phone");
    else if (name === "name") checkExistingPatient(value, "name");
    if (name === "doctorId" || name === "appointmentDate") {
      const doctorId = name === "doctorId" ? value : formData.doctorId;
      const date = name === "appointmentDate" ? value : formData.appointmentDate;
      if (doctorId && date) filterSlotsByDoctorAndDate(doctorId, date);
      else setAvailableSlots([]);
    }
  };

  const handleSlotSelect = (slotId) => {
    setFormData((prev) => ({ ...prev, slotId }));
  };

  // Submit patient & book slot
  const handleBookNow = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || formData.age === "" || !formData.gender) {
      showToast("Please fill all required fields", "error");
      return;
    }
    if (!formData.doctorId) {
      showToast("Please select a doctor", "error");
      return;
    }
    if (!formData.slotId) {
      showToast("Please select an available slot", "error");
      return;
    }
    setSubmitting(true);
    try {
      let patientData;
      if (editingId) {
        const res = await axios.put(`${API_BASE_URL}/patients/${editingId}`, {
          name: formData.name,
          age: formData.age,
          gender: formData.gender,
          phone: formData.phone,
          address: formData.address,
          feeType: formData.feeType,
          feeAmount: formData.feeAmount,
          paymentType: formData.paymentType,
          reason: formData.reason,
          paymentStatus: formData.paymentStatus
        });
        if (res.data.success) {
          patientData = res.data.data;
          setPatients((prev) => prev.map((p) => (p._id === editingId ? patientData : p)));
        }
      } else {
        const res = await axios.post(`${API_BASE_URL}/patients`, {
          name: formData.name,
          age: formData.age,
          gender: formData.gender,
          phone: formData.phone,
          address: formData.address,
          feeType: formData.feeType,
          feeAmount: formData.feeAmount,
          paymentType: formData.paymentType,
          reason: formData.reason,
          paymentStatus: formData.paymentStatus
        });
        if (res.data.success) {
          patientData = res.data.data;
          setPatients((prev) => [patientData, ...prev]);
        }
      }
      if (!patientData) {
        showToast("Failed to save patient data", "error");
        setSubmitting(false);
        return;
      }
      const bookingPayload = {
        slotId: formData.slotId,
        patientId: patientData._id,
        patientName: formData.name,
        patientPhone: formData.phone,
        patientAge: formData.age,
        patientGender: formData.gender,
        patientAddress: formData.address,
        purpose: formData.reason,
        consultationFee: formData.feeAmount,
        paymentType: formData.paymentType,
        paymentStatus: formData.paymentStatus,
        doctorId: formData.doctorId,
        appointmentDate: formData.appointmentDate
      };
      const slotRes = await axios.post(`${API_BASE_URL}/appointment-slots/book`, bookingPayload);
      if (slotRes.data.success) {
        showToast(`Appointment booked successfully for ${formData.name}!`, "success");
        fetchBookings();
        fetchAllSlots();
        filterSlotsByDoctorAndDate(formData.doctorId, formData.appointmentDate);
        const today = new Date().toISOString().split("T")[0];
        setFormData({ ...EMPTY_FORM, appointmentDate: today });
        setEditingId(null);
        setShowForm(false);
        setAvailableSlots([]);
        setExistingPatient(null);
        setShowExistingPatientPopup(false);
      } else {
        showToast(slotRes.data.message || "Failed to book appointment", "error");
      }
    } catch (err) {
      console.error("Error booking appointment:", err);
      showToast(err.response?.data?.message || "Failed to book appointment", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ==================== STATUS SELECT HANDLER ====================
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
      const res = await axios.put(
        `${API_BASE_URL}/appointment-slots/${booking._id}`,
        { status: status }
      );
      if (res && res.data && res.data.success) {
        showToast(`Status updated to ${status}!`, "success");
        setOpenStatusDropdown(null);
        fetchBookings();
        fetchPatients();
        refreshPatientBookings();
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

  // ==================== PAYMENT SELECT HANDLER ====================
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
      const res = await axios.put(
        `${API_BASE_URL}/appointment-slots/${booking._id}`,
        { paymentStatus: paymentStatus }
      );
      if (res && res.data && res.data.success) {
        showToast(`Payment updated to ${paymentStatus}!`, "success");
        setOpenPaymentDropdown(null);
        fetchBookings();
        fetchPatients();
        refreshPatientBookings();
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

  // Add Service Modal Handlers
  const openAddServiceModal = (booking) => {
    setSelectedBookingForService(booking);
    setSelectedServiceId("");
    setSelectedServiceForBooking(null);
    setServiceDropdownOpen(false);
    setShowAddServiceModal(true);
  };

  const handleServiceSelect = (service) => {
    setSelectedServiceId(service._id);
    setSelectedServiceForBooking(service);
    setServiceDropdownOpen(false);
  };

  const handleAddServiceToBooking = async () => {
    if (!selectedBookingForService || !selectedServiceForBooking) {
      showToast("Please select a service", "error");
      return;
    }
    try {
      const res = await axios.post(
        `${API_BASE_URL}/services/addservicestobooking/${selectedBookingForService._id}`,
        {
          serviceId: selectedServiceForBooking._id,
          name: selectedServiceForBooking.name,
          price: selectedServiceForBooking.price,
          description: selectedServiceForBooking.description || ""
        }
      );
      if (res && res.data && res.data.success) {
        showToast(res.data.message, "success");
        setShowAddServiceModal(false);
        setSelectedServiceId("");
        setSelectedServiceForBooking(null);
        setSelectedBookingForService(null);
        fetchBookings();
        refreshPatientBookings();
      }
    } catch (error) {
      console.error("Error adding service:", error);
      showToast(error.response?.data?.message || "Failed to add service", "error");
    }
  };

  const handleRemoveService = async (booking, serviceId, serviceName) => {
    if (!window.confirm(`Remove "${serviceName}" from this booking?`)) return;
    try {
      const res = await axios.delete(
        `${API_BASE_URL}/services/deleteservicestobooking/${booking._id}/${serviceId}`
      );
      if (res && res.data && res.data.success) {
        showToast(res.data.message, "info");
        fetchBookings();
        refreshPatientBookings();
      }
    } catch (error) {
      console.error("Error removing service:", error);
      showToast(error.response?.data?.message || "Failed to remove service", "error");
    }
  };

  // Status Update Handlers
  const openStatusUpdateModal = (booking) => {
    setSelectedBookingForStatus(booking);
    setNewBookingStatus(booking.status || "confirmed");
    setShowStatusUpdateModal(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedBookingForStatus || !newBookingStatus) {
      showToast("Please select a status", "error");
      return;
    }
    if (newBookingStatus === selectedBookingForStatus.status) {
      showToast("Status is already set to this value", "info");
      setShowStatusUpdateModal(false);
      return;
    }
    setStatusUpdating(true);
    try {
      const res = await axios.put(
        `${API_BASE_URL}/appointment-slots/${selectedBookingForStatus._id}`,
        { status: newBookingStatus }
      );
      if (res && res.data && res.data.success) {
        showToast(`Booking status updated to ${newBookingStatus}!`, "success");
        setShowStatusUpdateModal(false);
        fetchBookings();
        fetchPatients();
        refreshPatientBookings();
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

  // Payment Update Handlers
  const openPaymentUpdateModal = (booking) => {
    setSelectedBookingForPayment(booking);
    setNewPaymentStatus(booking.paymentStatus || "Pending");
    setShowPaymentUpdateModal(true);
  };

  const handlePaymentUpdate = async () => {
    if (!selectedBookingForPayment || !newPaymentStatus) {
      showToast("Please select a payment status", "error");
      return;
    }
    if (newPaymentStatus === selectedBookingForPayment.paymentStatus) {
      showToast("Payment status is already set to this value", "info");
      setShowPaymentUpdateModal(false);
      return;
    }
    setPaymentUpdating(true);
    try {
      const res = await axios.put(
        `${API_BASE_URL}/appointment-slots/${selectedBookingForPayment._id}`,
        { paymentStatus: newPaymentStatus }
      );
      if (res && res.data && res.data.success) {
        showToast(`Booking payment status updated to ${newPaymentStatus}!`, "success");
        setShowPaymentUpdateModal(false);
        fetchBookings();
        fetchPatients();
        refreshPatientBookings();
      } else {
        showToast(res.data.message || "Failed to update payment status", "error");
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      showToast(error.response?.data?.message || "Failed to update payment status", "error");
    } finally {
      setPaymentUpdating(false);
    }
  };

  // Inline Quick Payment Status Switch
  const handleInlinePaymentUpdate = async (bookingId, newPaymentStatus, patientName) => {
    try {
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, paymentStatus: newPaymentStatus } : b))
      );

      await axios.put(`${API_BASE_URL}/appointment-slots/${bookingId}`, {
        paymentStatus: newPaymentStatus
      });

      showToast(`Payment status updated to '${newPaymentStatus}' for ${patientName}!`, "success");
      setOpenPaymentDropdown(null);
      fetchPatients();
      refreshPatientBookings();
    } catch (error) {
      console.error("Error updating payment status:", error);
      showToast("Failed to update payment status. Please try again.", "error");
      fetchBookings();
    }
  };

  const refreshPatientBookings = () => {
    if (selectedPatient) {
      const updatedBookings = bookings.filter(
        (b) =>
          b.patientPhone === selectedPatient.phone ||
          (b.patientName &&
            selectedPatient.name &&
            b.patientName.toLowerCase() === selectedPatient.name.toLowerCase())
      );
      updatedBookings.sort(
        (a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
      );
      setPatientBookings(updatedBookings);
    }
  };

  const handleEdit = (patient) => {
    const today = new Date().toISOString().split("T")[0];
    setFormData({
      name: patient.name || "",
      age: patient.age ?? "",
      gender: patient.gender || "",
      phone: patient.phone || "",
      address: patient.address || "",
      feeType: patient.feeType || "consultation",
      feeAmount: patient.feeAmount ?? 300,
      paymentType: patient.paymentType || "cash",
      reason: patient.reason || "",
      paymentStatus: patient.paymentStatus || "Pending",
      doctorId: "",
      slotId: "",
      appointmentDate: today
    });
    setEditingId(patient._id);
    setShowForm(true);
    setAvailableSlots([]);
    setExistingPatient(null);
    setShowExistingPatientPopup(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this patient record?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/patients/${id}`);
      setPatients((prev) => prev.filter((p) => p._id !== id));
      showToast("Patient record deleted successfully", "info");
    } catch (err) {
      console.error("Error deleting:", err);
      showToast("Failed to delete patient record", "error");
    }
  };

  const cancelForm = () => {
    const today = new Date().toISOString().split("T")[0];
    setFormData({ ...EMPTY_FORM, appointmentDate: today });
    setEditingId(null);
    setShowForm(false);
    setAvailableSlots([]);
    setExistingPatient(null);
    setShowExistingPatientPopup(false);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
  };

  const handleRowClick = (patient) => {
    fetchPatientData(patient);
  };

  const fetchPatientData = async (patient) => {
    setHistoryLoading(true);
    setSelectedPatient(patient);
    try {
      const patientBookingsList = bookings.filter(
        (b) =>
          b.patientPhone === patient.phone ||
          (b.patientName &&
            patient.name &&
            b.patientName.toLowerCase() === patient.name.toLowerCase())
      );
      patientBookingsList.sort(
        (a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
      );
      setPatientBookings(patientBookingsList);
      setShowPatientModal(true);
    } catch (err) {
      console.error("Error fetching patient data:", err);
      showToast("Failed to fetch patient data", "error");
    } finally {
      setHistoryLoading(false);
    }
  };

  // Billing helpers
  const getTotalServiceFee = (booking) => {
    if (!booking.services || booking.services.length === 0) return 0;
    return booking.services.reduce((sum, s) => sum + (s.price || 0), 0);
  };

  const getTotalBookingFee = (booking) => {
    return (booking.consultationFee || 0) + getTotalServiceFee(booking);
  };

  // Get patient's total fee (consultation + services)
  const getPatientTotalFee = (patient) => {
    const patientBookings = bookings.filter(
      (b) =>
        b.patientPhone === patient.phone ||
        (b.patientName &&
          patient.name &&
          b.patientName.toLowerCase() === patient.name.toLowerCase())
    );
    if (patientBookings.length === 0) return patient.feeAmount || 300;
    return patientBookings.reduce((total, b) => total + getTotalBookingFee(b), 0);
  };

  // Get patient's services list
  const getPatientServices = (patient) => {
    const patientBookings = bookings.filter(
      (b) =>
        b.patientPhone === patient.phone ||
        (b.patientName &&
          patient.name &&
          b.patientName.toLowerCase() === patient.name.toLowerCase())
    );
    const allServices = [];
    patientBookings.forEach((b) => {
      if (b.services && b.services.length > 0) {
        b.services.forEach((s) => {
          allServices.push({
            name: s.name,
            price: s.price || 0,
            paymentStatus: s.paymentStatus || "Pending",
            bookingDate: b.date || b.appointmentDate
          });
        });
      }
    });
    return allServices;
  };

  // Get patient's payment status from bookings
  const getPatientPaymentStatus = (patient) => {
    const patientBookings = bookings.filter(
      (b) =>
        b.patientPhone === patient.phone ||
        (b.patientName &&
          patient.name &&
          b.patientName.toLowerCase() === patient.name.toLowerCase())
    );
    if (patientBookings.length === 0) return patient.paymentStatus || "Pending";
    const hasPaid = patientBookings.some((b) => b.paymentStatus === "Paid");
    return hasPaid ? "Paid" : "Pending";
  };

  // Get matching booking for patient
  const getMatchingBooking = (patient) => {
    return bookings.find(
      (b) =>
        b.patientPhone === patient.phone ||
        (b.patientName &&
          patient.name &&
          b.patientName.toLowerCase() === patient.name.toLowerCase())
    );
  };

  // Get consultation payment status
  const getConsultationPaymentStatus = (patient) => {
    const booking = getMatchingBooking(patient);
    if (!booking) return patient.paymentStatus || "Pending";
    return booking.paymentStatus || "Pending";
  };

  // Get booking status
  const getBookingStatus = (patient) => {
    const booking = getMatchingBooking(patient);
    if (!booking) return "No Booking";
    return booking.status || "confirmed";
  };

  // Get appointment date
  const getAppointmentDate = (patient) => {
    const booking = getMatchingBooking(patient);
    if (!booking) return "-";
    return booking.appointmentDate || booking.date || "-";
  };

  // Get slot timing
  const getSlotTiming = (patient) => {
    const booking = getMatchingBooking(patient);
    if (!booking) return "-";
    if (booking.startTime && booking.endTime) {
      return `${booking.startTime} - ${booking.endTime}`;
    }
    return "-";
  };

  // Get booking created date
  const getBookingCreatedDate = (patient) => {
    const booking = getMatchingBooking(patient);
    if (!booking) return "-";
    return booking.bookedAt || booking.createdAt || "-";
  };

  // Get service payment statuses
  const getServicePaymentStatuses = (patient) => {
    const services = getPatientServices(patient);
    return services.map(s => ({
      name: s.name,
      price: s.price,
      paymentStatus: s.paymentStatus || "Pending"
    }));
  };

  const openBillingModal = (booking) => {
    setSelectedBookingForBilling(booking);

    const consultationFee = booking.consultationFee || 0;
    const totalServiceFee = getTotalServiceFee(booking);
    const grossAmount = consultationFee + totalServiceFee;
    const isPaid = booking.paymentStatus === "Paid";
    const paidAmount = isPaid ? grossAmount : 0;
    const balanceAmount = isPaid ? 0 : grossAmount;

    const now = new Date();
    const dateStamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
      now.getDate()
    ).padStart(2, "0")}`;
    const shortId = String(booking._id || "").slice(-6).toUpperCase() || "000000";
    const invoiceNo = `${dateStamp}-${shortId}`;
    const dateTimeLabel = `${now.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    })} ${now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
    const receiptNo = `R-${shortId.slice(-4)}-${String(now.getFullYear()).slice(-2)}-${
      now.getMonth() + 1
    }-${Math.floor(1000 + Math.random() * 9000)}`;

    const items = [
      {
        no: 1,
        name: "Consultation Fee",
        serviceCode: "CONS-01",
        remarks: booking.purpose || "OPD Consultation",
        amount: consultationFee,
        paymentStatus: booking.paymentStatus || "Pending"
      },
      ...(booking.services || []).map((s, idx) => ({
        no: idx + 2,
        name: s.name,
        serviceCode: s.serviceId
          ? String(s.serviceId).slice(-6).toUpperCase()
          : `SVC-${String(idx + 1).padStart(2, "0")}`,
        remarks: s.description || s.paymentStatus || "Additional Service",
        amount: s.price || 0,
        paymentStatus: s.paymentStatus || "Pending"
      }))
    ];

    setBillingData({
      invoiceNo,
      invoiceDate: dateTimeLabel,
      receiptNo,
      receiptDate: dateTimeLabel,
      paymentMode: booking.paymentType
        ? booking.paymentType.charAt(0).toUpperCase() + booking.paymentType.slice(1)
        : "Cash",
      receivedBy: "Front Desk",
      branch: booking.doctorSpecialization || "Main Branch",
      doctorName: booking.doctorName || "General OP Doctor",
      items,
      grossAmount,
      netAmount: grossAmount,
      paidAmount,
      balanceAmount,
      paymentStatus: booking.paymentStatus || "Pending",
      amountInWords: numberToWords(grossAmount)
    });

    setShowBillingModal(true);
  };

  const handleMarkAsPaid = async () => {
    if (!selectedBookingForBilling) return;

    try {
      const res = await axios.put(
        `${API_BASE_URL}/appointment-slots/${selectedBookingForBilling._id}`,
        { paymentStatus: "Paid" }
      );

      if (res && res.data && res.data.success) {
        setBookings((prev) =>
          prev.map((b) =>
            b._id === selectedBookingForBilling._id ? { ...b, paymentStatus: "Paid" } : b
          )
        );

        setBillingData((prev) => ({
          ...prev,
          paymentStatus: "Paid",
          paidAmount: prev.netAmount,
          balanceAmount: 0
        }));

        fetchPatients();
        refreshPatientBookings();

        showToast(
          `Payment marked as Paid for ${selectedBookingForBilling.patientName}!`,
          "success"
        );
      } else {
        showToast(res.data.message || "Failed to update payment", "error");
      }
    } catch (error) {
      console.error("Error updating payment:", error);
      showToast("Failed to update payment status", "error");
    }
  };

  const printBill = () => {
    const billContent = document.getElementById("bill-content");
    if (!billContent) return;

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
              body {
                font-family: Arial, Helvetica, sans-serif;
                color: #222222;
                padding: 24px;
                background: #ffffff;
                position: relative;
              }
              .bill-wrap {
                max-width: 820px;
                margin: 0 auto;
                border: 1px solid #999999;
                padding: 24px 28px;
                position: relative;
                background: #ffffff;
                overflow: hidden;
              }
              .watermark {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                opacity: 0.08;
                z-index: 0;
                pointer-events: none;
                width: 300px;
                height: 300px;
              }
              .watermark img {
                width: 100%;
                height: 100%;
                object-fit: contain;
              }
              .bill-content {
                position: relative;
                z-index: 1;
              }
              .top-header {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                border-bottom: 2px solid #222222;
                padding-bottom: 14px;
              }
              .top-header .brand {
                display: flex;
                align-items: center;
                gap: 14px;
              }
              .top-header .brand img {
                width: 60px;
                height: 60px;
                object-fit: contain;
              }
              .top-header .brand h1 {
                font-size: 20px;
                font-weight: bold;
                color: #111111;
                letter-spacing: 0.3px;
              }
              .top-header .brand p {
                font-size: 11px;
                color: #555555;
                margin-top: 2px;
                max-width: 440px;
              }
              .top-header .contact {
                text-align: right;
                font-size: 11px;
                color: #555555;
                white-space: nowrap;
              }
              .bar-title {
                text-align: center;
                background: #f1f1f1;
                border-top: 1px solid #999999;
                border-bottom: 1px solid #999999;
                padding: 6px 0;
                font-size: 13px;
                font-weight: bold;
                letter-spacing: 1.5px;
                margin: 10px 0 14px 0;
                text-transform: uppercase;
              }
              .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 4px 24px;
                font-size: 12px;
                margin-bottom: 14px;
              }
              .info-grid .label {
                color: #666666;
                font-weight: bold;
                display: inline-block;
                width: 120px;
              }
              table.items {
                width: 100%;
                border-collapse: collapse;
                border-top: 2px solid #222222;
                border-bottom: 2px solid #222222;
                margin-bottom: 12px;
              }
              table.items th {
                text-align: left;
                font-size: 11px;
                color: #555555;
                padding: 6px 4px;
                border-bottom: 1px solid #bbbbbb;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              table.items td {
                font-size: 12px;
                padding: 6px 4px;
                border-bottom: 1px solid #eeeeee;
                color: #333333;
              }
              table.items td.text-right,
              table.items th.text-right {
                text-align: right;
              }
              table.items td.text-center,
              table.items th.text-center {
                text-align: center;
              }
              .totals-box {
                width: 100%;
                max-width: 300px;
                margin-left: auto;
                font-size: 12px;
                margin-bottom: 12px;
              }
              .totals-box .row {
                display: flex;
                justify-content: space-between;
                padding: 4px 0;
                border-bottom: 1px solid #eeeeee;
              }
              .totals-box .row.final {
                border-top: 2px solid #222222;
                border-bottom: none;
                font-weight: bold;
                padding-top: 8px;
                margin-top: 4px;
                font-size: 13px;
              }
              .footer-row {
                display: flex;
                justify-content: flex-end;
                gap: 8px;
                font-size: 11px;
                color: #555555;
                border-top: 1px solid #dddddd;
                padding-top: 12px;
                margin-top: 10px;
              }
              .signature-section {
                display: flex;
                justify-content: flex-end;
                margin-top: 8px;
              }
              .signature-section .sig {
                font-weight: bold;
                color: #333;
              }
              @media print {
                body { padding: 0; }
                .bill-wrap { border: none; }
              }
            </style>
          </head>
          <body>
            <div class="bill-wrap">
              <div class="watermark">
                <img src="${logo}" alt="${CLINIC_INFO.name}" />
              </div>
              
              <div class="bill-content">
                <div class="top-header">
                  <div class="brand">
                    <img src="${logo}" alt="${CLINIC_INFO.name}" />
                    <div>
                      <h1>${CLINIC_INFO.name}</h1>
                      <p>${CLINIC_INFO.address}</p>
                    </div>
                  </div>
                  <div class="contact">
                    Contact No : ${CLINIC_INFO.contact}
                  </div>
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
                  <tbody>
                    ${itemsRows}
                  </tbody>
                </table>

                <div class="totals-box">
                  <div class="row"><span>Gross Bill Amount</span><span>₹ ${billingData.grossAmount.toFixed(2)}</span></div>
                  <div class="row"><span>Net Amount</span><span>₹ ${billingData.netAmount.toFixed(2)}</span></div>
                  <div class="row"><span>Paid Amount</span><span>₹ ${billingData.paidAmount.toFixed(2)}</span></div>
                  <div class="row final"><span>Balance to Pay</span><span>₹ ${billingData.balanceAmount.toFixed(2)}</span></div>
                </div>

                <div class="footer-row">
                  <span>Printed Date : ${new Date().toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                  })} ${new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit"
      })}</span>
                </div>
                <div class="signature-section">
                  <span class="sig">Signature</span>
                </div>
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
    if (e.target.value) {
      setSelectedMonth("");
    }
  };

  const handleToDateChange = (e) => {
    setToDate(e.target.value);
    if (e.target.value) {
      setSelectedMonth("");
    }
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
    setFromDate("");
    setToDate("");
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
    setFeeTypeFilter("All");
    setDoctorFilter("All");
    setFromDate("");
    setToDate("");
    setSelectedMonth("");
    setActiveCardFilter("all");
    setCurrentPage(1);
    if (window.innerWidth < 1024) {
      setShowMobileFilters(false);
    }
  };

  const handleCardClick = (type) => {
    setActiveCardFilter(type);
    setCurrentPage(1);
    if (type === "all") {
      setStatusFilter("All");
    } else if (type === "Paid") {
      setStatusFilter("Paid");
    } else if (type === "Pending") {
      setStatusFilter("Pending");
    }
  };

  const getUniqueDoctors = () => {
    const doctorMap = new Map();
    bookings.forEach((b) => {
      if (b.doctorName) {
        doctorMap.set(b.doctorName, {
          name: b.doctorName,
          specialization: b.doctorSpecialization || ""
        });
      }
    });
    return Array.from(doctorMap.values());
  };

  // Filtered Patients
  const filteredPatients = useMemo(() => {
    console.log("=== FILTERING PATIENTS ===");
    console.log("All Patients:", patients);
    console.log("Selected Month:", selectedMonth);
    
    const filtered = patients.filter((p) => {
      const paymentStatus = getPatientPaymentStatus(p);
      
      if (statusFilter !== "All" && paymentStatus !== statusFilter) return false;
      if (feeTypeFilter !== "All" && p.feeType !== feeTypeFilter) return false;

      if (doctorFilter !== "All") {
        const hasBookingWithDoctor = bookings.some(
          (b) =>
            (b.patientPhone === p.phone ||
              (b.patientName &&
                p.name &&
                b.patientName.toLowerCase() === p.name.toLowerCase())) &&
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
        const matchName = (p.name || "").toLowerCase().includes(q);
        const matchPhone = (p.phone || "").toLowerCase().includes(q);
        const matchAddress = (p.address || "").toLowerCase().includes(q);
        const matchReason = (p.reason || "").toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchAddress && !matchReason) return false;
      }
      return true;
    });
    
    console.log("=== FILTERED PATIENTS COUNT ===", filtered.length);
    return filtered;
  }, [
    patients,
    statusFilter,
    feeTypeFilter,
    doctorFilter,
    searchQuery,
    fromDate,
    toDate,
    selectedMonth,
    bookings
  ]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, feeTypeFilter, doctorFilter, fromDate, toDate, selectedMonth]);

  // Stats with services included
  const stats = useMemo(() => {
    const total = bookings.length;
    
    let paidTotal = 0;
    let paidCount = 0;
    let pendingCount = 0;
    
    bookings.forEach((b) => {
      const totalFee = getTotalBookingFee(b);
      const isPaid = b.paymentStatus === "Paid";
      
      if (isPaid) {
        paidCount++;
        paidTotal += totalFee;
      } else {
        pendingCount++;
      }
    });
    
    const totalRevenue = paidTotal;
    
    return { 
      total, 
      paid: paidCount, 
      pending: pendingCount, 
      totalRevenue 
    };
  }, [bookings]);

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

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "-";
      return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
    } catch {
      return "-";
    }
  };

  // Pagination Calculations
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstItem, indexOfLastItem);

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

  const downloadCSV = () => {
    if (filteredPatients.length === 0) {
      alert("No records available to export!");
      return;
    }
    const headers = [
      "#", "Patient Name", "Phone", "Doctor", "Appointment Date", "Slot Timing", "Booking Status",
      "Consultation Fee", "Cons. Payment", "Services", "Services Payment",
      "Total Fee", "Payment Mode", "Reason", "Booked On", "Registered"
    ];
    const csvRows = [
      headers.join(","),
      ...filteredPatients.map((p, idx) => {
        const regDate = p.createdAt ? formatDateToDDMMYYYY(p.createdAt) : "-";
        const regTime = p.createdAt ? formatTime(p.createdAt) : "-";
        const totalFee = getPatientTotalFee(p);
        const services = getPatientServices(p);
        const servicesTotal = services.reduce((sum, s) => sum + s.price, 0);
        const consPaymentStatus = getConsultationPaymentStatus(p);
        const bookingStatus = getBookingStatus(p);
        const appointmentDate = getAppointmentDate(p);
        const slotTiming = getSlotTiming(p);
        const bookingCreated = getBookingCreatedDate(p);
        const serviceNames = services.map(s => s.name).join("; ");
        const serviceStatuses = services.map(s => s.paymentStatus).join("; ");
        const booking = getMatchingBooking(p);
        const consultationFee = booking?.consultationFee || p.feeAmount || 300;
        return [
          idx + 1,
          `"${(p.name || "").replace(/"/g, '""')}"`,
          `"${p.phone || ""}"`,
          `"${booking?.doctorName || "N/A"}"`,
          `"${formatDateToDDMMYYYY(appointmentDate)}"`,
          `"${slotTiming}"`,
          `"${bookingStatus}"`,
          consultationFee,
          `"${consPaymentStatus}"`,
          `"${serviceNames}"`,
          `"${serviceStatuses}"`,
          totalFee,
          `"${p.paymentType || "cash"}"`,
          `"${(p.reason || "").replace(/"/g, '""')}"`,
          `"${formatDateTimeToDDMMYYYY(bookingCreated)}"`,
          `${regDate} ${regTime}`
        ].join(",");
      })
    ];
    const csvData = csvRows.join("\n");
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Bookings_Records_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filteredPatients.length} records to CSV!`);
  };

  // ============================================================
  // ===================== JSX RENDER ============================
  // ============================================================

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

        {/* ===================== HEADER WITH FILTERS ===================== */}
        <div className="hidden lg:flex items-center justify-between gap-3 flex-wrap mb-6">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap">
              Appointment <span>Bookings</span>
            </h1>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="emp-dash__date-pill">
              <FaCalendarCheck />
              <span>{bookings.length} Total Bookings</span>
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
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="consulting">Consulting</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={feeTypeFilter}
              onChange={(e) => setFeeTypeFilter(e.target.value)}
              className="h-8 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="All">All Fee Types</option>
              <option value="consultation">Consultation</option>
              <option value="lab">Lab</option>
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
              placeholder="Select Month"
            />

            <button
              onClick={() => { fetchPatients(); fetchBookings(); fetchAllSlots(); fetchDoctors(); fetchServices(); }}
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

            <button
              onClick={() => {
                const today = new Date().toISOString().split("T")[0];
                setFormData({ ...EMPTY_FORM, appointmentDate: today });
                setEditingId(null);
                setShowForm(true);
                setAvailableSlots([]);
                setExistingPatient(null);
                setShowExistingPatientPopup(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm whitespace-nowrap"
            >
              <FiPlus className="w-3 h-3" /> Add Booking
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm whitespace-nowrap"
              >
                <FiTrash2 className="w-3 h-3 text-red-500" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between gap-2 flex-wrap mb-3">
          <div className="flex items-baseline gap-2">
            <h1 className="text-base font-bold whitespace-nowrap">
              Appointment <span className="text-indigo-600">Bookings</span>
            </h1>
            <div className="emp-dash__date-pill text-[10px] px-2 py-1">
              <FaCalendarCheck className="w-3 h-3 text-blue-600" />
              <span>{bookings.length} Bookings</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                const today = new Date().toISOString().split("T")[0];
                setFormData({ ...EMPTY_FORM, appointmentDate: today });
                setEditingId(null);
                setShowForm(true);
                setAvailableSlots([]);
                setExistingPatient(null);
                setShowExistingPatientPopup(false);
              }}
              className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all"
            >
              <FiPlus className="w-3 h-3" /> Add
            </button>
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
            >
              <FiFilter className="w-3 h-3" />
              Filters
            </button>
          </div>
        </div>

        {/* Mobile Filters Panel */}
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
                  <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="All">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="consulting">Consulting</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Fee Type</label>
                  <select
                    value={feeTypeFilter}
                    onChange={(e) => setFeeTypeFilter(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="All">All Fee Types</option>
                    <option value="consultation">Consultation</option>
                    <option value="lab">Lab</option>
                  </select>
                </div>
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
                  onClick={() => {
                    const today = new Date().toISOString().split("T")[0];
                    setFormData({ ...EMPTY_FORM, appointmentDate: today });
                    setEditingId(null);
                    setShowForm(true);
                    setAvailableSlots([]);
                    setExistingPatient(null);
                    setShowExistingPatientPopup(false);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm"
                >
                  <FiPlus className="w-4 h-4" /> Add Booking
                </button>
                <button
                  onClick={downloadCSV}
                  disabled={filteredPatients.length === 0}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiDownload className="w-4 h-4" /> Export
                </button>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
                >
                  <FiTrash2 className="w-4 h-4 text-red-500" />
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* ===================== TOP KPI STATS GRID ===================== */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
          <div
            className={`emp-dash__stat cursor-pointer hover:scale-105 transition-transform duration-200 ${
              activeCardFilter === "all" ? "ring-2 ring-blue-500/20 border-blue-400" : ""
            }`}
            onClick={() => handleCardClick("all")}
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Bookings</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FiUsers />
              </div>
            </div>
            <div className="emp-dash__stat-value">{stats.total}</div>
            <div className="emp-dash__stat-meta">all appointments</div>
          </div>

          <div
            className={`emp-dash__stat cursor-pointer hover:scale-105 transition-transform duration-200 ${
              activeCardFilter === "Paid" ? "ring-2 ring-emerald-500/20 border-emerald-400" : ""
            }`}
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
            className={`emp-dash__stat cursor-pointer hover:scale-105 transition-transform duration-200 ${
              activeCardFilter === "Pending" ? "ring-2 ring-amber-500/20 border-amber-400" : ""
            }`}
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
            <div className="emp-dash__stat-value text-blue-700">
              ₹{stats.totalRevenue.toLocaleString()}
            </div>
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
              {filteredPatients.length}
            </div>
            <div className="emp-dash__stat-meta">matching filters</div>
          </div>
        </div>

        {/* ===================== BOOKINGS TABLE SECTION ===================== */}
        <div className="emp-dash__card">
          {loading ? (
            <div className="py-12 text-center text-gray-500">
              <FiRefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">Loading booking records...</p>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <FaUserInjured className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-700">No Booking Records Found</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto mb-4">
                {bookings.length === 0
                  ? "Click 'Add Booking' to create a new appointment."
                  : "No records match your current search/date filters."}
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
                    const today = new Date().toISOString().split("T")[0];
                    setFormData({ ...EMPTY_FORM, appointmentDate: today });
                    setEditingId(null);
                    setShowForm(true);
                    setAvailableSlots([]);
                    setExistingPatient(null);
                    setShowExistingPatientPopup(false);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm inline-flex items-center gap-1.5"
                >
                  <FiPlus className="w-3.5 h-3.5" /> Add Booking
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
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
                      <th style={{ textAlign: "center" }}>Cons. Fee</th>
                      <th style={{ textAlign: "center" }}>Cons. Payment</th>
                      <th style={{ textAlign: "center" }}>Services</th>
                      <th style={{ textAlign: "center" }}>Services Payment</th>
                      <th style={{ textAlign: "center" }}>Total</th>
                      <th style={{ textAlign: "center" }}>Payment Mode</th>
                      <th style={{ textAlign: "center" }}>Booked On</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPatients.map((patient, idx) => {
                      const matchingBooking = getMatchingBooking(patient);
                      const totalFee = getPatientTotalFee(patient);
                      const services = getPatientServices(patient);
                      const consultationFee = matchingBooking?.consultationFee || patient.feeAmount || 300;
                      const consultationPaymentStatus = getConsultationPaymentStatus(patient);
                      const isConsultationPaid = consultationPaymentStatus === "Paid";
                      const bookingStatus = getBookingStatus(patient);
                      const appointmentDate = getAppointmentDate(patient);
                      const slotTiming = getSlotTiming(patient);
                      const bookingCreated = getBookingCreatedDate(patient);
                      const statusColors = getStatusColors(bookingStatus);

                      // Service payment status handler
                      const handleServicePaymentToggle = async (service) => {
                        const booking = bookings.find(b => b._id === matchingBooking?._id);
                        if (!booking) return;
                        const serviceId = service.serviceId || service._id;
                        const newStatus = service.paymentStatus === "Paid" ? "Pending" : "Paid";
                        try {
                          const res = await axios.put(
                            `${API_BASE_URL}/services/updateservicepayment/${booking._id}/${serviceId}`,
                            { paymentStatus: newStatus }
                          );
                          if (res && res.data && res.data.success) {
                            showToast(`Service payment updated to ${newStatus}!`, "success");
                            fetchBookings();
                            fetchPatients();
                            refreshPatientBookings();
                          }
                        } catch (error) {
                          console.error("Error updating service payment:", error);
                          showToast("Failed to update service payment", "error");
                        }
                      };

                      return (
                        <tr
                          key={patient._id}
                          className="transition-colors hover:bg-blue-50/40 cursor-pointer group"
                          onClick={() => handleRowClick(patient)}
                        >
                          <td className="px-2 py-3 font-semibold text-center text-slate-500 text-[11px]">
                            {indexOfFirstItem + idx + 1}
                          </td>

                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-[10px] shadow-sm">
                                {patient.name ? patient.name.charAt(0).toUpperCase() : "P"}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-slate-800 text-xs truncate max-w-[80px]">
                                  {patient.name || "N/A"}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-3 py-3 whitespace-nowrap">
                            <span className="text-xs font-medium text-slate-700">
                              {patient.phone || "N/A"}
                            </span>
                          </td>

                          <td className="px-3 py-3">
                            <div className="text-xs font-semibold text-purple-800 truncate max-w-[90px]">
                              {matchingBooking?.doctorName || "N/A"}
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

                          {/* ===== BOOKING STATUS DROPDOWN ===== */}
                          <td className="px-3 py-3 text-center whitespace-nowrap relative status-dropdown">
                            {bookingStatus !== "No Booking" && matchingBooking ? (
                              <div className="relative inline-block">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenStatusDropdown(openStatusDropdown === matchingBooking._id ? null : matchingBooking._id);
                                  }}
                                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${statusColors.bg} ${statusColors.text} ${statusColors.border} hover:opacity-80 transition-all`}
                                >
                                  <FaCheckCircle className="w-2.5 h-2.5" />
                                  {bookingStatus}
                                  <FiChevronDown className="w-3 h-3 ml-0.5" />
                                </button>
                                {openStatusDropdown === matchingBooking._id && (
                                  <div 
                                    className="fixed z-[9999] bg-white rounded-lg shadow-2xl border border-gray-200 py-1 min-w-[140px] max-h-[200px] overflow-y-auto"
                                    style={{
                                      top: '50%',
                                      left: '50%',
                                      transform: 'translate(-50%, -50%)',
                                      boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white to-transparent pointer-events-none"></div>
                                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                                    {BOOKING_STATUS_OPTIONS.map((st) => {
                                      const isActive = st.value === bookingStatus.toLowerCase();
                                      const colors = getStatusColors(st.value);
                                      return (
                                        <button
                                          key={st.value}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (matchingBooking) {
                                              handleStatusSelect(matchingBooking, st.value, e);
                                            }
                                          }}
                                          className={`w-full px-4 py-2 text-left text-[11px] font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2 ${isActive ? colors.text : "text-gray-600"}`}
                                        >
                                          <span className={`w-2 h-2 rounded-full ${colors.bg} border ${colors.border}`}></span>
                                          {st.label}
                                          {isActive && <FaCheck className="w-2.5 h-2.5 ml-auto text-green-500" />}
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-[10px] text-gray-400 italic">No Booking</span>
                            )}
                          </td>

                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <span className="text-xs font-bold text-slate-800">
                              ₹{consultationFee}
                            </span>
                          </td>

                          {/* ===== CONSULTATION PAYMENT DROPDOWN ===== */}
                          <td className="px-3 py-3 text-center whitespace-nowrap relative payment-dropdown">
                            {matchingBooking ? (
                              <div className="relative inline-block">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenPaymentDropdown(openPaymentDropdown === matchingBooking._id ? null : matchingBooking._id);
                                  }}
                                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                                    isConsultationPaid
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                      : "bg-amber-50 text-amber-700 border-amber-200"
                                  } hover:opacity-80 transition-all`}
                                >
                                  {isConsultationPaid ? (
                                    <FaCheckCircle className="w-2.5 h-2.5 text-emerald-600" />
                                  ) : (
                                    <FaClock className="w-2.5 h-2.5 text-amber-600" />
                                  )}
                                  {consultationPaymentStatus}
                                  <FiChevronDown className="w-3 h-3 ml-0.5" />
                                </button>
                                {openPaymentDropdown === matchingBooking._id && (
                                  <div 
                                    className="fixed z-[9999] bg-white rounded-lg shadow-2xl border border-gray-200 py-1 min-w-[140px] max-h-[200px] overflow-y-auto"
                                    style={{
                                      top: '50%',
                                      left: '50%',
                                      transform: 'translate(-50%, -50%)',
                                      boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white to-transparent pointer-events-none"></div>
                                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                                    {PAYMENT_STATUS_OPTIONS.map((st) => {
                                      const isActive = st.value === consultationPaymentStatus;
                                      return (
                                        <button
                                          key={st.value}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handlePaymentSelect(matchingBooking, st.value, e);
                                          }}
                                          className={`w-full px-4 py-2 text-left text-[11px] font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2 ${isActive ? st.value === "Paid" ? "text-emerald-700" : "text-amber-700" : "text-gray-600"}`}
                                        >
                                          {st.value === "Paid" ? (
                                            <FaCheckCircle className="w-3 h-3 text-emerald-500" />
                                          ) : (
                                            <FaClock className="w-3 h-3 text-amber-500" />
                                          )}
                                          {st.label}
                                          {isActive && <FaCheck className="w-2.5 h-2.5 ml-auto text-green-500" />}
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
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
                            {services.length > 0 ? (
                              <div className="flex flex-col gap-0.5 items-center">
                                {services.slice(0, 2).map((s, i) => {
                                  const isPaid = s.paymentStatus === "Paid";
                                  return (
                                    <span
                                      key={i}
                                      onClick={() => {
                                        handleServicePaymentToggle(s);
                                      }}
                                      className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full border cursor-pointer hover:scale-105 transition-transform ${
                                        isPaid
                                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                          : "bg-amber-50 text-amber-700 border-amber-200"
                                      }`}
                                      title="Click to toggle service payment"
                                    >
                                      {s.paymentStatus}
                                    </span>
                                  );
                                })}
                                {services.length > 2 && (
                                  <span className="text-[8px] text-gray-400">+{services.length - 2}</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[10px] text-gray-400 italic">-</span>
                            )}
                          </td>

                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <span className="text-xs font-bold text-slate-800">
                              ₹{totalFee}
                            </span>
                          </td>

                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 capitalize">
                              {patient.paymentType === "online" ? (
                                <FaCreditCard className="text-indigo-500 text-[11px]" />
                              ) : (
                                <FaMoneyBillWave className="text-green-600 text-[11px]" />
                              )}
                              {patient.paymentType || "cash"}
                            </span>
                          </td>

                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <div className="text-[10px] font-semibold text-slate-700">
                              {formatDateTimeToDDMMYYYY(bookingCreated)}
                            </div>
                          </td>

                          <td
                            className="px-3 py-3 text-right whitespace-nowrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleRowClick(patient)}
                                className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                                title="View Details"
                              >
                                <FiEye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEdit(patient)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                title="Edit"
                              >
                                <FiEdit2 className="w-4 h-4" />
                              </button>
                              {matchingBooking && (
                                <>
                                  <button
                                    onClick={() => openBillingModal(matchingBooking)}
                                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-100"
                                    title="Bill"
                                  >
                                    <FaFileInvoiceDollar className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => openPaymentUpdateModal(matchingBooking)}
                                    className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors border border-transparent hover:border-purple-100"
                                    title="Update Payment"
                                  >
                                    <FaCreditCard className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => openStatusUpdateModal(matchingBooking)}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                    title="Update Status"
                                  >
                                    <FiCheckCircle className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => openAddServiceModal(matchingBooking)}
                                    className="p-1.5 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors border border-transparent hover:border-cyan-100"
                                    title="Add Service"
                                  >
                                    <FiPlusCircle className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (!window.confirm(`Delete booking for "${patient.name}"?`)) return;
                                      handleDelete(patient._id);
                                    }}
                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                    title="Delete"
                                  >
                                    <FiTrash2 className="w-4 h-4" />
                                  </button>
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
                      {filteredPatients.length === 0 ? 0 : indexOfFirstItem + 1} -{" "}
                      {Math.min(indexOfLastItem, filteredPatients.length)}
                    </strong>{" "}
                    of <strong className="text-gray-800">{filteredPatients.length}</strong> records
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

        {/* ============================================================ */}
        {/* ===== ALL MODALS ===== */}
        {/* ============================================================ */}
        
        {/* ===================== ADD / EDIT PATIENT & BOOKING MODAL ===================== */}
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-gray-200 relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
                    <FaUserInjured className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">
                      {editingId ? "Edit Patient Details" : "Register OPD Patient & Book Slot"}
                    </h3>
                    <p className="text-xs text-gray-500">Fill in patient and consultation details below</p>
                  </div>
                </div>
                <button
                  onClick={cancelForm}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>

              {showExistingPatientPopup && existingPatient && !editingId && (
                <div className="mt-4 p-3.5 bg-blue-50 border border-blue-200 rounded-xl shadow-xs">
                  <div className="flex items-start gap-3">
                    <FiAlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-blue-900">Existing Patient Record Found!</p>
                      <div className="mt-1 text-xs text-blue-800 space-y-0.5">
                        <p>
                          <span className="font-semibold">Name:</span> {existingPatient.name} |{" "}
                          <span className="font-semibold">Phone:</span> {existingPatient.phone}
                        </p>
                        <p>
                          <span className="font-semibold">Age:</span> {existingPatient.age} yrs |{" "}
                          <span className="font-semibold">Gender:</span> {existingPatient.gender}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={autoFillPatientDetails}
                        className="mt-2 px-3.5 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-xs inline-flex items-center gap-1.5"
                      >
                        <FaCheck className="text-[10px]" />
                        Auto-Fill Details
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowExistingPatientPopup(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <FaTimes className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleBookNow} className="mt-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Patient Name <span className="text-blue-600">*</span>
                    </label>
                    <div className="relative">
                      <FaUserInjured className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        ref={nameInputRef}
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter patient full name"
                        className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Phone Number <span className="text-blue-600">*</span>
                    </label>
                    <div className="relative">
                      <FaPhoneAlt className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        ref={phoneInputRef}
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Age (Years) <span className="text-blue-600">*</span>
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      placeholder="28"
                      min="0"
                      max="120"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Gender <span className="text-blue-600">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium appearance-none"
                        required
                      >
                        <option value="">Select Gender</option>
                        {GENDER_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <span className="text-gray-400 text-xs absolute right-3 top-2.5 pointer-events-none">▾</span>
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
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Patient street address"
                      className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Select Doctor <span className="text-blue-600">*</span>
                    </label>
                    <div className="relative">
                      <FaStethoscope className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                      <select
                        name="doctorId"
                        value={formData.doctorId}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-8 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium appearance-none"
                        required
                      >
                        <option value="">Select Doctor</option>
                        {doctors.map((doc) => (
                          <option key={doc._id || doc.id} value={doc._id || doc.id}>
                            {doc.name || "Doctor"}
                          </option>
                        ))}
                      </select>
                      <span className="text-gray-400 text-xs absolute right-3 top-2.5 pointer-events-none">▾</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Appointment Date <span className="text-blue-600">*</span>
                    </label>
                    <input
                      type="date"
                      name="appointmentDate"
                      value={formData.appointmentDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                      required
                    />
                  </div>
                </div>

                {formData.doctorId && formData.appointmentDate && (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Available Time Slots ({getDayNameFromDate(formData.appointmentDate)})</span>
                      {formData.slotId && (
                        <span className="text-emerald-600 font-semibold flex items-center gap-1 normal-case text-xs">
                          <FiCheckCircle /> Slot Selected
                        </span>
                      )}
                    </label>
                    {slotsLoading ? (
                      <div className="flex items-center gap-2 text-gray-500 text-xs py-3 justify-center">
                        <FiRefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                        Loading slots...
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <div className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                        No slots available for this doctor on selected date.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto p-1">
                        {availableSlots.map((slot) => {
                          const isSelected = formData.slotId === slot._id;
                          const isBooked = slot.status === "booked";
                          return (
                            <button
                              key={slot._id}
                              type="button"
                              onClick={() => !isBooked && handleSlotSelect(slot._id)}
                              className={`relative p-2 text-xs font-semibold rounded-lg border transition-all text-left ${
                                isSelected
                                  ? "border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-400/20 shadow-xs"
                                  : isBooked
                                  ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
                                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                              }`}
                              disabled={isBooked}
                            >
                              <div className="font-bold text-xs">
                                {slot.startTime} – {slot.endTime}
                              </div>
                              <div className="text-[10px] text-gray-500">₹{slot.consultationFee || 300}</div>
                              {isBooked && (
                                <span className="text-[9px] font-bold text-red-500 block mt-0.5">Booked</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Fee Type <span className="text-blue-600">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="feeType"
                        value={formData.feeType}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium appearance-none"
                      >
                        {FEE_TYPE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <span className="text-gray-400 text-xs absolute right-3 top-2.5 pointer-events-none">▾</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Fee Amount (₹) <span className="text-blue-600">*</span>
                    </label>
                    <input
                      type="number"
                      name="feeAmount"
                      value={formData.feeAmount}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Payment Mode <span className="text-blue-600">*</span>
                    </label>
                    <div className="flex gap-2">
                      {PAYMENT_TYPE_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, paymentType: opt.value }))}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-bold transition-all ${
                            formData.paymentType === opt.value
                              ? "border-blue-500 bg-blue-50 text-blue-700 shadow-xs"
                              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                          }`}
                        >
                          {opt.value === "cash" ? (
                            <FaMoneyBillWave className="w-3.5 h-3.5" />
                          ) : (
                            <FaCreditCard className="w-3.5 h-3.5" />
                          )}
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Payment Status
                    </label>
                    <div className="flex gap-2">
                      {PAYMENT_STATUS_OPTIONS.map((st) => (
                        <button
                          key={st.value}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, paymentStatus: st.value }))}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-bold transition-all ${
                            formData.paymentStatus === st.value
                              ? st.value === "Paid"
                                ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-xs"
                                : "border-amber-500 bg-amber-50 text-amber-700 shadow-xs"
                              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                          }`}
                        >
                          {st.value === "Paid" ? (
                            <FaCheckCircle className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <FaClock className="w-3 h-3 text-amber-600" />
                          )}
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                    Reason / Symptoms
                  </label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    placeholder="Brief description of symptoms..."
                    rows={2}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium resize-none"
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
                    disabled={submitting || !formData.slotId || !formData.doctorId}
                    className="px-5 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {submitting ? (
                      <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <FiCalendar className="w-3.5 h-3.5" />
                    )}
                    {submitting ? "Processing..." : "Confirm & Book Slot"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ===================== PATIENT DETAIL & HISTORY MODAL ===================== */}
        {showPatientModal && selectedPatient && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-gray-200">
              <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-md shadow-purple-500/20">
                    <FaUserInjured className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Patient Profile &amp; Appointments</h3>
                    <p className="text-xs text-gray-500">
                      {selectedPatient.name} • {selectedPatient.phone}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-purple-700 font-semibold bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                    {patientBookings.length} Bookings
                  </span>
                  <button
                    onClick={() => {
                      setShowPatientModal(false);
                      setPatientBookings([]);
                      setSelectedPatient(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {historyLoading ? (
                  <div className="py-12 text-center text-gray-500">
                    <FiRefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-500">Loading patient history...</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-bold flex items-center justify-center text-lg shadow-md flex-shrink-0">
                          {selectedPatient.name ? selectedPatient.name.charAt(0).toUpperCase() : "P"}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-base">{selectedPatient.name}</div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                            <FaPhoneAlt className="text-gray-400 text-[10px]" />
                            {selectedPatient.phone || "N/A"}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        <div>
                          <div className="text-[10px] font-bold uppercase text-gray-400">Age</div>
                          <div className="font-semibold text-gray-900">{selectedPatient.age || "N/A"} Yrs</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase text-gray-400">Gender</div>
                          <div className="font-semibold text-gray-900 capitalize">{selectedPatient.gender || "N/A"}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase text-gray-400">Fee Type</div>
                          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200">
                            {selectedPatient.feeType === "lab" ? "Lab" : "Consultation"}
                          </span>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase text-gray-400">Payment Mode</div>
                          <div className="font-semibold text-gray-900 capitalize">{selectedPatient.paymentType || "Cash"}</div>
                        </div>
                      </div>

                      {selectedPatient.address && (
                        <div className="mt-3 pt-3 border-t border-gray-200 text-xs">
                          <div className="text-[10px] font-bold uppercase text-gray-400">Address</div>
                          <div className="text-gray-700">{selectedPatient.address}</div>
                        </div>
                      )}
                      {selectedPatient.reason && (
                        <div className="mt-2 text-xs">
                          <div className="text-[10px] font-bold uppercase text-gray-400">Reason</div>
                          <div className="text-gray-700 bg-white p-2 rounded-lg border border-gray-200">{selectedPatient.reason}</div>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <FaCalendarAlt className="text-purple-600 text-sm" />
                        <h4 className="font-bold text-gray-900 text-sm">
                          Appointment Records ({patientBookings.length})
                        </h4>
                      </div>

                      {patientBookings.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-sm bg-gray-50 rounded-xl border border-gray-200">
                          No appointments booked yet.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {patientBookings.map((booking, bIdx) => {
                            const hasServices = booking.services && booking.services.length > 0;
                            const totalFee = getTotalBookingFee(booking);
                            const statusColors = getStatusColors(booking.status);
                            const slotTiming = booking.startTime && booking.endTime 
                              ? `${booking.startTime} - ${booking.endTime}` 
                              : "-";

                            return (
                              <div
                                key={booking._id}
                                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-shadow"
                              >
                                <div
                                  className={`px-4 py-2.5 ${statusColors.bg} border-b ${statusColors.border} flex items-center justify-between flex-wrap gap-2`}
                                >
                                  <div className="flex items-center gap-2.5">
                                    <span className="font-bold text-gray-500 text-xs">#{bIdx + 1}</span>
                                    <span
                                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${statusColors.text} ${statusColors.bg} ${statusColors.border}`}
                                    >
                                      {booking.status || "confirmed"}
                                    </span>
                                    <span className="text-xs text-gray-600 font-medium">
                                      {formatDateToDDMMYYYY(booking.appointmentDate || booking.date)}
                                    </span>
                                    {slotTiming !== "-" && (
                                      <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200">
                                        {slotTiming}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => openStatusUpdateModal(booking)}
                                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                      title="Update Status"
                                    >
                                      <FiCheckCircle className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => openPaymentUpdateModal(booking)}
                                      className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                      title="Update Payment"
                                    >
                                      <FaCreditCard className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => openAddServiceModal(booking)}
                                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                      title="Add Service"
                                    >
                                      <FiPlusCircle className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => openBillingModal(booking)}
                                      className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                                      title="View Bill"
                                    >
                                      <FaFileInvoiceDollar className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                <div className="p-4 space-y-3">
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                    <div>
                                      <div className="text-[10px] font-bold uppercase text-gray-400">Doctor</div>
                                      <div className="font-bold text-gray-900">{booking.doctorName || "N/A"}</div>
                                    </div>
                                    <div>
                                      <div className="text-[10px] font-bold uppercase text-gray-400">Slot</div>
                                      <div className="font-bold text-gray-900">
                                        {booking.startTime || "N/A"} – {booking.endTime || "N/A"}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-[10px] font-bold uppercase text-gray-400">Cons. Payment</div>
                                      <span
                                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                                          booking.paymentStatus === "Paid"
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                            : "bg-amber-50 text-amber-700 border-amber-200"
                                        }`}
                                      >
                                        {booking.paymentStatus || "Pending"}
                                      </span>
                                    </div>
                                    <div>
                                      <div className="text-[10px] font-bold uppercase text-gray-400">Total Fee</div>
                                      <div className="text-sm font-extrabold text-blue-950">₹{totalFee}</div>
                                    </div>
                                  </div>

                                  <div>
                                    <div className="text-[10px] font-bold uppercase text-gray-400">Services</div>
                                    {hasServices ? (
                                      <div className="flex flex-wrap gap-1.5 mt-1">
                                        {booking.services.map((svc, sIdx) => (
                                          <span
                                            key={sIdx}
                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200"
                                          >
                                            {svc.name} (₹{svc.price})
                                            <span
                                              className={`text-[8px] font-bold px-1 py-0.5 rounded ${
                                                svc.paymentStatus === "Paid"
                                                  ? "bg-emerald-100 text-emerald-700"
                                                  : "bg-amber-100 text-amber-700"
                                              }`}
                                            >
                                              {svc.paymentStatus || "Pending"}
                                            </span>
                                            <button
                                              onClick={() => {
                                                const serviceId = svc.serviceId || svc._id;
                                                if (serviceId) handleRemoveService(booking, serviceId, svc.name);
                                              }}
                                              className="text-red-500 hover:text-red-700 ml-1"
                                            >
                                              <FaTimes className="w-2.5 h-2.5" />
                                            </button>
                                          </span>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-xs text-gray-400 italic">No services added</span>
                                    )}
                                  </div>

                                  {(booking.diagnosis || booking.prescription || booking.notes) && (
                                    <div className="bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100 text-xs space-y-1">
                                      {booking.diagnosis && (
                                        <div>
                                          <strong className="text-emerald-900">Diagnosis:</strong>{" "}
                                          <span className="text-gray-700">{booking.diagnosis}</span>
                                        </div>
                                      )}
                                      {booking.prescription && (
                                        <div>
                                          <strong className="text-emerald-900">Prescription:</strong>{" "}
                                          <span className="text-gray-700">{booking.prescription}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
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

              <div className="flex items-center justify-end px-6 py-4 border-t border-gray-200 bg-gray-50/50">
                <button
                  onClick={() => {
                    setShowPatientModal(false);
                    setPatientBookings([]);
                    setSelectedPatient(null);
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-200 hover:bg-gray-300 text-gray-700 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================== BILLING MODAL ===================== */}
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
                    <div className="text-right text-[11px] text-gray-500">
                      Contact No : {CLINIC_INFO.contact}
                    </div>
                  </div>

                  <div className="text-center bg-gray-100 border-y border-gray-300 py-1.5 mb-4">
                    <span className="text-sm font-bold tracking-widest text-gray-800 uppercase">Bill Cum Receipt</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs mb-5">
                    <div><span className="font-bold text-gray-500 inline-block w-28">Name</span>: <span className="font-semibold text-gray-900">{selectedBookingForBilling.patientName || "N/A"}</span></div>
                    <div><span className="font-bold text-gray-500 inline-block w-28">Invoice No / Date</span>: <span className="font-semibold text-gray-900">{billingData.invoiceNo} / {billingData.invoiceDate}</span></div>
                    <div><span className="font-bold text-gray-500 inline-block w-28">Age</span>: <span className="font-semibold text-gray-900">{selectedBookingForBilling.patientAge || "N/A"} Yrs</span></div>
                    <div><span className="font-bold text-gray-500 inline-block w-28">Gender</span>: <span className="font-semibold text-gray-900">{selectedBookingForBilling.patientGender || "N/A"}</span></div>
                    <div><span className="font-bold text-gray-500 inline-block w-28">Branch</span>: <span className="font-semibold text-gray-900">{billingData.branch}</span></div>
                    <div><span className="font-bold text-gray-500 inline-block w-28">Contact No</span>: <span className="font-semibold text-gray-900">{selectedBookingForBilling.patientPhone || "N/A"}</span></div>
                    <div><span className="font-bold text-gray-500 inline-block w-28">Doctor</span>: <span className="font-semibold text-gray-900">{billingData.doctorName}</span></div>
                    <div><span className="font-bold text-gray-500 inline-block w-28">Appt. Date</span>: <span className="font-semibold text-gray-900">{formatDateToDDMMYYYY(selectedBookingForBilling.date)}</span></div>
                  </div>

                  <table className="w-full mb-3 border-t-2 border-b-2 border-gray-800">
                    <thead>
                      <tr className="border-b border-gray-300">
                        <th className="text-left py-1.5 text-[11px] font-bold text-gray-600 w-6">No.</th>
                        <th className="text-left py-1.5 text-[11px] font-bold text-gray-600 w-[28%]">Service / Item</th>
                        <th className="text-left py-1.5 text-[11px] font-bold text-gray-600 w-[16%]">Service Code</th>
                        <th className="text-left py-1.5 text-[11px] font-bold text-gray-600 w-[20%]">Remarks</th>
                        <th className="text-right py-1.5 text-[11px] font-bold text-gray-600 w-[14%]">Amount</th>
                        <th className="text-center py-1.5 text-[11px] font-bold text-gray-600 w-[16%]">Payment Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billingData.items.map((item) => (
                        <tr key={item.no} className="border-b border-gray-100">
                          <td className="py-1.5 text-xs text-gray-700">{item.no}</td>
                          <td className="py-1.5 text-xs font-medium text-gray-800">{item.name}</td>
                          <td className="py-1.5 text-xs text-gray-600">{item.serviceCode}</td>
                          <td className="py-1.5 text-xs text-gray-500">{item.remarks}</td>
                          <td className="py-1.5 text-xs text-right font-semibold text-gray-800">₹{Number(item.amount).toFixed(2)}</td>
                          <td className="py-1.5 text-xs text-center">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${item.paymentStatus === "Paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                              {item.paymentStatus || "Pending"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="flex flex-col items-end mb-3">
                    <div className="w-full max-w-xs text-xs">
                      <div className="flex justify-between py-1 border-b border-gray-200"><span className="text-gray-600">Gross Bill Amount</span><span className="font-bold text-gray-900">₹ {billingData.grossAmount.toFixed(2)}</span></div>
                      <div className="flex justify-between py-1 border-b border-gray-200"><span className="text-gray-600">Net Amount</span><span className="font-bold text-gray-900">₹ {billingData.netAmount.toFixed(2)}</span></div>
                      <div className="flex justify-between py-1 border-b border-gray-200"><span className="text-gray-600">Paid Amount</span><span className="font-bold text-emerald-700">₹ {billingData.paidAmount.toFixed(2)}</span></div>
                      <div className="flex justify-between py-1.5 mt-1 border-t-2 border-gray-800">
                        <span className="font-bold text-gray-800">Balance to Pay</span>
                        <span className={`font-bold ${billingData.balanceAmount > 0 ? "text-red-600" : "text-emerald-700"}`}>
                          ₹ {billingData.balanceAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-2 pt-4 mt-2 border-t border-gray-200 text-[11px] text-gray-500">
                    <span>Printed Date : {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                    <span className="font-bold text-gray-700">Authorized Signature</span>
                  </div>
                  <div className="mt-3 text-[10px] text-gray-400 italic">* Bills cannot be cancelled once registered.</div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50/50">
                {billingData.paymentStatus === "Pending" && (
                  <button onClick={handleMarkAsPaid} className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all flex items-center gap-1.5">
                    <FaCheckCircle className="w-3.5 h-3.5" /> Mark as Paid
                  </button>
                )}
                <button onClick={printBill} className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all flex items-center gap-1.5">
                  <FaPrint className="w-3.5 h-3.5" /> Print Bill
                </button>
                <button onClick={() => { setShowBillingModal(false); setSelectedBookingForBilling(null); }} className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-200 hover:bg-gray-300 text-gray-700 transition-all">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================== STATUS UPDATE MODAL ===================== */}
        {showStatusUpdateModal && selectedBookingForStatus && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold"><FiCheckCircle className="w-5 h-5" /></div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Update Appointment Status</h3>
                    <p className="text-xs text-gray-500">{selectedBookingForStatus.patientName}</p>
                  </div>
                </div>
                <button onClick={() => setShowStatusUpdateModal(false)} className="text-gray-400 hover:text-gray-600"><FaTimes className="w-4 h-4" /></button>
              </div>

              <div className="my-5 space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div><div className="text-[10px] font-bold uppercase text-gray-400">Patient</div><div className="font-bold text-gray-900">{selectedBookingForStatus.patientName}</div></div>
                    <div><div className="text-[10px] font-bold uppercase text-gray-400">Current Status</div><span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${getStatusColors(selectedBookingForStatus.status).bg} ${getStatusColors(selectedBookingForStatus.status).text} ${getStatusColors(selectedBookingForStatus.status).border}`}>{selectedBookingForStatus.status || "confirmed"}</span></div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Select New Status <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-2 gap-2">
                    {BOOKING_STATUS_OPTIONS.map((st) => {
                      const isSelected = newBookingStatus === st.value;
                      const colors = getStatusColors(st.value);
                      return (
                        <button key={st.value} onClick={() => setNewBookingStatus(st.value)}
                          className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${isSelected ? `${colors.bg} ${colors.text} border-blue-500 shadow-xs ring-2 ring-blue-400/20` : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"}`}>
                          {st.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button onClick={() => setShowStatusUpdateModal(false)} className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all">Cancel</button>
                <button onClick={handleStatusUpdate} disabled={statusUpdating} className="px-5 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all flex items-center gap-1.5">
                  {statusUpdating ? <FiRefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FaCheck className="w-3.5 h-3.5" />}
                  {statusUpdating ? "Updating..." : "Save Status"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================== BOOKING PAYMENT UPDATE MODAL ===================== */}
        {showPaymentUpdateModal && selectedBookingForPayment && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold"><FaCreditCard className="w-4 h-4" /></div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Update Booking Payment Status</h3>
                    <p className="text-xs text-gray-500">{selectedBookingForPayment.patientName}</p>
                  </div>
                </div>
                <button onClick={() => setShowPaymentUpdateModal(false)} className="text-gray-400 hover:text-gray-600"><FaTimes className="w-4 h-4" /></button>
              </div>

              <div className="my-5 space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div><div className="text-[10px] font-bold uppercase text-gray-400">Patient</div><div className="font-bold text-gray-900">{selectedBookingForPayment.patientName}</div></div>
                    <div><div className="text-[10px] font-bold uppercase text-gray-400">Current Payment</div><span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${selectedBookingForPayment.paymentStatus === "Paid" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>{selectedBookingForPayment.paymentStatus || "Pending"}</span></div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Select Payment Status <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-2 gap-3">
                    {PAYMENT_STATUS_OPTIONS.map((st) => {
                      const isSelected = newPaymentStatus === st.value;
                      return (
                        <button key={st.value} onClick={() => setNewPaymentStatus(st.value)}
                          className={`px-4 py-2.5 rounded-lg text-xs font-bold border transition-all ${isSelected ? st.value === "Paid" ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-xs ring-2 ring-emerald-400/20" : "border-amber-500 bg-amber-50 text-amber-700 shadow-xs ring-2 ring-amber-400/20" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"}`}>
                          {st.value === "Paid" ? <FaCheckCircle className="w-3.5 h-3.5 inline mr-1.5 text-emerald-600" /> : <FaClock className="w-3.5 h-3.5 inline mr-1.5 text-amber-600" />}
                          {st.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button onClick={() => setShowPaymentUpdateModal(false)} className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all">Cancel</button>
                <button onClick={handlePaymentUpdate} disabled={paymentUpdating} className="px-5 py-2 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition-all flex items-center gap-1.5">
                  {paymentUpdating ? <FiRefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FaCheck className="w-3.5 h-3.5" />}
                  {paymentUpdating ? "Updating..." : "Save Payment"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================== ADD SERVICE MODAL ===================== */}
        {showAddServiceModal && selectedBookingForService && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold"><FiPlusCircle className="w-5 h-5" /></div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Add Clinical Service</h3>
                    <p className="text-xs text-gray-500">{selectedBookingForService.patientName}</p>
                  </div>
                </div>
                <button onClick={() => { setShowAddServiceModal(false); setServiceDropdownOpen(false); }} className="text-gray-400 hover:text-gray-600"><FaTimes className="w-4 h-4" /></button>
              </div>

              <div className="my-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Current Services</label>
                  <div className="px-3.5 py-2 bg-gray-50 rounded-lg border border-gray-200 text-xs font-medium">
                    {selectedBookingForService.services && selectedBookingForService.services.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {selectedBookingForService.services.map((svc, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            {svc.name} (₹{svc.price})
                            <span className={`text-[8px] font-bold px-1 py-0.5 rounded ${svc.paymentStatus === "Paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                              {svc.paymentStatus || "Pending"}
                            </span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">No services currently added</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Select Service <span className="text-red-500">*</span></label>
                  <button onClick={() => setServiceDropdownOpen(!serviceDropdownOpen)}
                    className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white flex items-center justify-between">
                    <span className={selectedServiceForBooking ? "text-gray-900 font-semibold" : "text-gray-400"}>
                      {selectedServiceForBooking ? `${selectedServiceForBooking.name} (₹${selectedServiceForBooking.price})` : "Choose a service..."}
                    </span>
                    <FiChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${serviceDropdownOpen ? "rotate-180" : ""}`} />
                  </button>
                  {serviceDropdownOpen && (
                    <div className="mt-1 border border-gray-200 rounded-lg shadow-xl max-h-52 overflow-y-auto bg-white">
                      {servicesLoading ? (
                        <div className="px-4 py-3 text-center text-gray-500 text-xs"><FiRefreshCw className="w-3.5 h-3.5 animate-spin inline mr-2" /> Loading services...</div>
                      ) : services.length === 0 ? (
                        <div className="px-4 py-3 text-center text-gray-400 text-xs">No services found</div>
                      ) : (
                        services.map((service) => {
                          const alreadyAdded = (selectedBookingForService.services || []).some((s) => s.serviceId === service._id);
                          return (
                            <button key={service._id} onClick={() => !alreadyAdded && handleServiceSelect(service)}
                              className={`w-full px-3.5 py-2 text-left text-xs hover:bg-gray-50 transition-colors flex items-center justify-between ${alreadyAdded ? "opacity-50 cursor-not-allowed bg-gray-50" : ""} ${selectedServiceId === service._id ? "bg-emerald-50" : ""}`}
                              disabled={alreadyAdded}>
                              <span className="font-medium text-gray-800">{service.name}</span>
                              <span className="font-bold text-emerald-700">{alreadyAdded ? "✓ Added" : `₹${service.price}`}</span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                {selectedServiceForBooking && (
                  <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 flex items-center justify-between text-xs">
                    <div><div className="text-[10px] font-bold uppercase text-emerald-800">Selected Service</div><div className="font-bold text-gray-900">{selectedServiceForBooking.name}</div></div>
                    <div className="text-right"><div className="text-[10px] font-bold uppercase text-gray-500">Service Fee</div><div className="font-bold text-emerald-700">₹{selectedServiceForBooking.price}</div></div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button onClick={() => { setShowAddServiceModal(false); setServiceDropdownOpen(false); }} className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all">Cancel</button>
                <button onClick={handleAddServiceToBooking} disabled={!selectedServiceForBooking} className="px-5 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all disabled:opacity-50">Add Service</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}