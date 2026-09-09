// OpManagement.js - Complete OP Management (With Add Buttons for Referrals)

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
  FaClipboardList,
  FaCalendarCheck,
  FaHistory,
  FaPrescription,
  FaFilePdf,
  FaServicestack,
  FaUserPlus,
  FaShareAlt,
  FaPercent,
  FaGift,
  FaBuilding,
  FaClinicMedical,
  FaPills,
  FaFlask,
  FaMinusCircle,
  FaPlusCircle,
  FaUserTag,
  FaUserFriends,
  FaUserMd as FaUserMdIcon,
  FaExternalLinkAlt
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
import prescriptionTemplate from "../Images/prescription.jpg";
import prescriptionBackTemplate from "../Images/prescriptionbackside.jpg";

// ===== NEW: Import useNavigate for navigation =====
import { useNavigate } from "react-router-dom";

const TITLE_OPTIONS = [
  { value: "Mr.", label: "Mr." },
  { value: "Ms.", label: "Ms." },
  { value: "Mrs.", label: "Mrs." },
  { value: "Baby", label: "Baby" },
  { value: "Dr.", label: "Dr." }
];

const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" }
];

const PAYMENT_TYPE_OPTIONS = [
  { value: "cash", label: "Cash" },
  { value: "online", label: "Online" }
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
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age > 0 ? age.toString() : "";
  } catch {
    return "";
  }
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

const getPaymentStatusColors = (status) => {
  const statusMap = {
    Paid: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: FaCheckCircle, iconColor: "text-emerald-600" },
    Partial: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: FaClock, iconColor: "text-amber-600" },
    Pending: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", icon: FaClock, iconColor: "text-gray-500" },
    Due: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: FaTimesCircle, iconColor: "text-red-500" }
  };
  return statusMap[status] || statusMap.Pending;
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

export default function OpManagement() {
  // ===== NEW: useNavigate hook =====
  const navigate = useNavigate();

  // ===== MAIN DATA STATES =====
  const [patients, setPatients] = useState([]);
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

  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [serviceDropdownOpenForModal, setServiceDropdownOpenForModal] = useState(false);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState(null);
  const [selectedBookingForService, setSelectedBookingForService] = useState(null);

  const [openStatusDropdown, setOpenStatusDropdown] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [openPaymentDropdown, setOpenPaymentDropdown] = useState(null);
  const [paymentUpdating, setPaymentUpdating] = useState(false);

  const [showStatusUpdateModal, setShowStatusUpdateModal] = useState(false);
  const [selectedBookingForStatus, setSelectedBookingForStatus] = useState(null);
  const [newBookingStatus, setNewBookingStatus] = useState("");

  const [showPaymentUpdateModal, setShowPaymentUpdateModal] = useState(false);
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState(null);
  const [newPaymentStatus, setNewPaymentStatus] = useState("");

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
  const printRef = useRef(null);

  const getDefaultMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  const hasActiveFilters =
    searchQuery !== "" ||
    statusFilter !== "All" ||
    feeTypeFilter !== "All" ||
    doctorFilter !== "All" ||
    fromDate !== "" ||
    toDate !== "" ||
    (selectedMonth && selectedMonth !== "");

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

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
      if (!e.target.closest(".status-dropdown")) {
        setOpenStatusDropdown(null);
      }
      if (!e.target.closest(".payment-dropdown")) {
        setOpenPaymentDropdown(null);
      }
      if (!e.target.closest(".service-dropdown-add-patient")) {
        setShowServiceSuggestions(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const fetchAllData = () => {
    fetchPatients();
    fetchBookings();
    fetchDoctors();
    fetchAllSlots();
    fetchServices();
    fetchReferralContacts();
  };

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/patients`);
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
      setPatients(patientsData);
    } catch (err) {
      console.error("Error fetching patients:", err);
      setPatients([]);
      showToast("Failed to fetch patient records", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
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
        } else {
          bookingsData = res.data.bookings || res.data.data || [];
        }
      } else if (Array.isArray(res.data)) {
        bookingsData = res.data;
      }

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
          patientTitle: b.patientTitle || "Mr.",
          patientDob: b.patientDob || "",
          dayOfWeek: slotDetails.dayOfWeek || b.dayOfWeek || "",
          date: slotDetails.date || b.appointmentDate || b.date || "",
          startTime: slotDetails.startTime || b.startTime || "",
          endTime: slotDetails.endTime || b.endTime || "",
          doctorId: slotDetails.doctorId || b.doctorId || "",
          doctorName: slotDetails.doctorName || b.doctorName || "",
          doctorSpecialization: slotDetails.doctorSpecialization || b.doctorSpecialization || "",
          purpose: b.purpose || "",
          consultationFee: b.consultationFee || 300,
          paymentType: b.paymentType || "cash",
          paymentStatus: b.paymentStatus || "Pending",
          partialAmount: b.partialAmount || 0,
          totalAmount: b.totalAmount || b.finalPayable || b.consultationFee || 300,
          finalPayable: b.finalPayable || b.totalAmount || b.consultationFee || 300,
          amountPaid: b.amountPaid || 0,
          balanceAmount: b.balanceAmount || 0,
          status: b.status || "confirmed",
          services: b.services || [],
          serviceItems: b.serviceItems || [],
          createdAt: b.createdAt || b.bookedAt || new Date().toISOString(),
          bookedAt: b.bookedAt || b.createdAt || new Date().toISOString(),
          appointmentDate: b.appointmentDate || slotDetails.date || "",
          isOP: b.isOP || false,
          referredByCustomer: b.referredByCustomer || "",
          referredByDoctor: b.referredByDoctor || "",
          referralCustomerId: b.referralCustomerId || "",
          referralDoctorId: b.referralDoctorId || "",
          referralCommission: b.referralCommission || "",
          referralCommissionType: b.referralCommissionType || "",
          subtotal: b.subtotal || 0,
          commissionAmount: b.commissionAmount || 0
        };
      });
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

  const fetchReferralContacts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/referralcontacts/getallreferralcontacts`);
      let contacts = [];
      if (res.data && res.data.success) {
        if (res.data.data && Array.isArray(res.data.data)) {
          contacts = res.data.data;
        } else if (Array.isArray(res.data)) {
          contacts = res.data;
        }
      } else if (Array.isArray(res.data)) {
        contacts = res.data;
      }
      setReferralContacts(contacts);
    } catch (error) {
      console.error("Error fetching referral contacts:", error);
      setReferralContacts([]);
    }
  };

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

  const checkExistingPatient = (value) => {
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
      found = patients.find((p) => p.phone === value);
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
      title: existingPatient.title || "Mr.",
      name: existingPatient.name || "",
      dob: existingPatient.dob || "",
      age: existingPatient.age ?? "",
      gender: existingPatient.gender || "",
      phone: existingPatient.phone || "",
      address: existingPatient.address || "",
      serviceItems: existingPatient.serviceItems || [],
      paymentType: existingPatient.paymentType || "cash",
      reason: existingPatient.reason || "",
      paymentStatus: existingPatient.paymentStatus || "Pending",
      selectedServices: existingPatient.services || [],
      referredByCustomer: existingPatient.referredByCustomer || "",
      referredByDoctor: existingPatient.referredByDoctor || "",
      referralCustomerId: existingPatient.referralCustomerId || "",
      referralDoctorId: existingPatient.referralDoctorId || "",
      referralCommission: existingPatient.referralCommission || "",
      referralCommissionType: existingPatient.referralCommissionType || ""
    }));
    setEditingId(existingPatient._id);
    setShowExistingPatientPopup(false);
    showToast(`Patient ${existingPatient.name} details auto-filled!`, "info");
  };

  const handleDobChange = (dob) => {
    setFormData((prev) => ({ 
      ...prev, 
      dob: dob,
      age: calculateAgeFromDOB(dob)
    }));
  };

  const handleReferralCustomerSelect = (contact) => {
    if (!contact) return;
    setFormData((prev) => ({
      ...prev,
      referredByCustomer: contact.customerName || "",
      referralCustomerId: contact._id,
    }));
    showToast(`Customer referral: ${contact.customerName}`, "info");
  };

  const handleReferralDoctorSelect = (contact) => {
    if (!contact) return;
    setFormData((prev) => ({
      ...prev,
      referredByDoctor: contact.doctorName || "",
      referralDoctorId: contact._id,
    }));
    showToast(`Doctor referral: ${contact.doctorName}`, "info");
  };

  // ===== NEW: Navigation handlers for Add buttons =====
  const handleAddCustomerReferral = () => {
    navigate("/customer-referrals");
  };

  const handleAddDoctorReferral = () => {
    navigate("/doctor-referrals");
  };

  const handleAddServiceItem = (service) => {
    if (!service) return;
    if (formData.serviceItems.some(s => s._id === service._id)) {
      showToast("Service already added!", "info");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      serviceItems: [...prev.serviceItems, { 
        ...service, 
        custom: false 
      }]
    }));
    setFilteredServices([]);
    setShowServiceSuggestions(false);
    showToast(`Added ${service.name}`, "success");
  };

  const handleAddCustomServiceItem = async () => {
    const serviceName = formData.serviceName?.trim();
    const servicePrice = formData.servicePrice?.trim();

    if (!serviceName) {
      showToast("Please enter a service name", "error");
      return;
    }
    if (!servicePrice) {
      showToast("Please enter service price", "error");
      return;
    }

    let existingService = services.find(s =>
      s.name.toLowerCase() === serviceName.toLowerCase()
    );

    if (existingService) {
      if (formData.serviceItems.some(s => s._id === existingService._id)) {
        showToast("Service already added!", "info");
        setFormData((prev) => ({ ...prev, serviceName: "", servicePrice: "" }));
        setFilteredServices([]);
        setShowServiceSuggestions(false);
        return;
      }
      handleAddServiceItem(existingService);
      setFormData((prev) => ({ ...prev, serviceName: "", servicePrice: "" }));
      setFilteredServices([]);
      setShowServiceSuggestions(false);
      return;
    }

    try {
      const newServiceData = {
        name: serviceName,
        price: parseFloat(servicePrice),
        description: ""
      };
      const res = await axios.post(`${API_BASE_URL}/services/addservice`, newServiceData);
      if (res && res.data && res.data.success) {
        const newService = res.data.data;
        await fetchServices();
        setFormData((prev) => ({
          ...prev,
          serviceItems: [...prev.serviceItems, { 
            ...newService, 
            custom: false 
          }],
          serviceName: "",
          servicePrice: ""
        }));
        setFilteredServices([]);
        setShowServiceSuggestions(false);
        showToast(`Service "${newService.name}" created and added!`, "success");
      } else {
        showToast(res.data?.message || "Failed to create service", "error");
      }
    } catch (error) {
      console.error("Error creating service:", error);
      showToast(error.response?.data?.message || "Failed to create service", "error");
    }
  };

  const handleRemoveServiceItem = (serviceId) => {
    setFormData((prev) => ({
      ...prev,
      serviceItems: prev.serviceItems.filter(s => s._id !== serviceId)
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "phone") {
      setFormData((prev) => ({ ...prev, [name]: value }));
      checkExistingPatient(value);
    } else if (name === "dob") {
      handleDobChange(value);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
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

  const handleEdit = (patient, existingBooking) => {
    console.log("🔄 EDIT CLICKED for patient:", patient);
    console.log("📋 Existing booking passed:", existingBooking);
    
    const today = new Date().toISOString().split("T")[0];

    const doctorId = existingBooking?.doctorId || patient.doctorId || "";
    const appointmentDate = existingBooking?.appointmentDate || 
                            existingBooking?.date || 
                            patient.appointmentDate || 
                            today;
    const slotId = existingBooking?.slotId || existingBooking?._id || "";
    const bookingId = existingBooking?._id || "";

    console.log("📌 Booking ID for update:", bookingId);

    setFormData({
      title: patient.title || "Mr.",
      name: patient.name || "",
      dob: patient.dob || "",
      age: patient.age ?? "",
      gender: patient.gender || "",
      phone: patient.phone || "",
      address: patient.address || "",
      serviceItems: patient.serviceItems || existingBooking?.serviceItems || [],
      paymentType: patient.paymentType || "cash",
      reason: patient.reason || "",
      paymentStatus: patient.paymentStatus || "Pending",
      doctorId: doctorId,
      slotId: slotId,
      bookingId: bookingId,
      appointmentDate: appointmentDate,
      selectedServices: patient.services || existingBooking?.services || [],
      referredByCustomer: patient.referredByCustomer || existingBooking?.referredByCustomer || "",
      referredByDoctor: patient.referredByDoctor || existingBooking?.referredByDoctor || "",
      referralCustomerId: patient.referralCustomerId || existingBooking?.referralCustomerId || "",
      referralDoctorId: patient.referralDoctorId || existingBooking?.referralDoctorId || "",
      referralCommission: patient.referralCommission || existingBooking?.referralCommission || "",
      referralCommissionType: patient.referralCommissionType || existingBooking?.referralCommissionType || "",
      partialAmount: patient.partialAmount || existingBooking?.partialAmount || "",
      serviceName: "",
      servicePrice: "",
      status: existingBooking?.status || "confirmed"
    });

    console.log("📝 Form data set with bookingId:", bookingId);

    setEditingId(patient._id);
    setShowForm(true);
    setExistingPatient(null);
    setShowExistingPatientPopup(false);
    setFilteredServices([]);
    setShowServiceSuggestions(false);
    setAvailableSlots([]);

    if (doctorId && appointmentDate) {
      setTimeout(() => {
        filterSlotsByDoctorAndDate(doctorId, appointmentDate);
      }, 200);
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
    setFilteredServices([]);
    setShowServiceSuggestions(false);
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
      patientBookingsList.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
      setPatientBookings(patientBookingsList);
      setShowPatientModal(true);
    } catch (err) {
      console.error("Error fetching patient data:", err);
      showToast("Failed to fetch patient data", "error");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleStatusDropdownToggle = (bookingId, e) => {
    e.stopPropagation();
    setOpenStatusDropdown(openStatusDropdown === bookingId ? null : bookingId);
  };

  const handleStatusSelect = async (booking, status, e) => {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    if (statusUpdating) return;
    if (status === booking.status) { setOpenStatusDropdown(null); return; }
    setStatusUpdating(true);
    try {
      const res = await axios.put(`${API_BASE_URL}/appointment-slots/${booking._id}`, { status: status });
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

  const handlePaymentDropdownToggle = (bookingId, e) => {
    e.stopPropagation();
    setOpenPaymentDropdown(openPaymentDropdown === bookingId ? null : bookingId);
  };

  const handlePaymentSelect = async (booking, paymentStatus, e) => {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    if (paymentUpdating) return;
    if (paymentStatus === booking.paymentStatus) { setOpenPaymentDropdown(null); return; }
    setPaymentUpdating(true);
    try {
      const res = await axios.put(`${API_BASE_URL}/appointment-slots/${booking._id}`, { paymentStatus: paymentStatus });
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

  const refreshPatientBookings = () => {
    if (selectedPatient) {
      const updatedBookings = bookings.filter(
        (b) =>
          b.patientPhone === selectedPatient.phone ||
          (b.patientName &&
            selectedPatient.name &&
            b.patientName.toLowerCase() === selectedPatient.name.toLowerCase())
      );
      updatedBookings.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
      setPatientBookings(updatedBookings);
    }
  };

  const handleBookNow = async (e) => {
    e.preventDefault();
    
    console.log("📝 NEW BOOKING SUBMITTED");
    console.log("📊 Form Data:", formData);

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
    if (formData.serviceItems.length === 0) {
      showToast("Please add at least one service", "error");
      return;
    }

    setSubmitting(true);
    try {
      let patientData;

      const servicesTotal = formData.serviceItems.reduce((sum, s) => sum + (s.price || 0), 0);
      const subtotal = servicesTotal;
      const commissionPercent = parseFloat(formData.referralCommission) || 0;
      const commissionAmount = (subtotal * commissionPercent) / 100;
      const finalPayable = subtotal - commissionAmount;

      let paymentStatus = formData.paymentStatus;
      let amountPaid = 0;
      let balanceAmount = finalPayable;

      if (formData.paymentStatus === "Paid") {
        amountPaid = finalPayable;
        balanceAmount = 0;
      } else if (formData.paymentStatus === "Partial" && formData.partialAmount) {
        amountPaid = parseFloat(formData.partialAmount) || 0;
        balanceAmount = finalPayable - amountPaid;
        if (balanceAmount <= 0) {
          paymentStatus = "Paid";
          amountPaid = finalPayable;
          balanceAmount = 0;
        }
      } else if (formData.paymentStatus === "Due") {
        amountPaid = 0;
        balanceAmount = finalPayable;
      } else {
        amountPaid = 0;
        balanceAmount = finalPayable;
      }

      console.log("📝 Creating new patient");
      const res = await axios.post(`${API_BASE_URL}/patients`, {
        title: formData.title,
        name: formData.name,
        dob: formData.dob,
        age: formData.age,
        gender: formData.gender,
        phone: formData.phone,
        address: formData.address,
        serviceItems: formData.serviceItems,
        paymentType: formData.paymentType,
        reason: formData.reason,
        paymentStatus: paymentStatus,
        services: formData.selectedServices,
        referredByCustomer: formData.referredByCustomer,
        referredByDoctor: formData.referredByDoctor,
        referralCustomerId: formData.referralCustomerId,
        referralDoctorId: formData.referralDoctorId,
        referralCommission: formData.referralCommission,
        referralCommissionType: formData.referralCommissionType,
        partialAmount: formData.partialAmount
      });
      
      if (res.data.success) {
        patientData = res.data.data;
        setPatients((prev) => [patientData, ...prev]);
      } else {
        showToast("Failed to save patient data", "error");
        setSubmitting(false);
        return;
      }

      const bookingPayload = {
        patientId: patientData._id,
        patientTitle: formData.title,
        patientName: formData.name,
        patientPhone: formData.phone,
        patientAge: formData.age,
        patientDob: formData.dob,
        patientGender: formData.gender,
        patientAddress: formData.address,
        purpose: formData.reason,
        paymentType: formData.paymentType,
        paymentStatus: paymentStatus,
        partialAmount: formData.partialAmount || 0,
        amountPaid: amountPaid,
        balanceAmount: balanceAmount,
        doctorId: formData.doctorId,
        appointmentDate: formData.appointmentDate,
        isOP: true,
        status: formData.status || "confirmed",
        serviceItems: formData.serviceItems.map(s => ({
          serviceId: s._id,
          name: s.name,
          price: s.price,
          description: s.description || ""
        })),
        services: formData.serviceItems.map(s => ({
          serviceId: s._id,
          name: s.name,
          price: s.price,
          description: s.description || ""
        })),
        referredByCustomer: formData.referredByCustomer,
        referredByDoctor: formData.referredByDoctor,
        referralCustomerId: formData.referralCustomerId,
        referralDoctorId: formData.referralDoctorId,
        referralCommission: formData.referralCommission,
        referralCommissionType: formData.referralCommissionType
      };

      console.log("📝 CREATING NEW BOOKING");
      console.log("📦 Booking Payload:", bookingPayload);
      
      const slotRes = await axios.post(`${API_BASE_URL}/appointment-slots/book`, {
        ...bookingPayload,
        slotId: formData.slotId
      });
      
      console.log("✅ CREATE RESPONSE:", slotRes.data);
      
      if (slotRes.data.success) {
        showToast(`✅ Appointment booked successfully for ${formData.title} ${formData.name}!`, "success");
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
        setFilteredServices([]);
        setShowServiceSuggestions(false);
      } else {
        console.error("❌ Create failed:", slotRes.data);
        showToast(slotRes.data.message || "Failed to book appointment", "error");
      }
    } catch (err) {
      console.error("❌ Error in handleBookNow:", err);
      console.error("❌ Error response:", err.response?.data);
      showToast(err.response?.data?.message || "Failed to book appointment", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateNow = async (e) => {
    e.preventDefault();
    
    console.log("🔄 UPDATE BOOKING SUBMITTED");
    console.log("📊 Form Data:", formData);
    console.log("🆔 Booking ID:", formData.bookingId);
    console.log("✏️ Editing ID:", editingId);

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
    if (formData.serviceItems.length === 0) {
      showToast("Please add at least one service", "error");
      return;
    }
    
    if (!formData.bookingId) {
      showToast("❌ No booking found to update. Please refresh and try again.", "error");
      console.error("❌ Update mode but bookingId is empty!");
      setSubmitting(false);
      return;
    }

    setSubmitting(true);
    try {
      let patientData;

      const servicesTotal = formData.serviceItems.reduce((sum, s) => sum + (s.price || 0), 0);
      const subtotal = servicesTotal;
      const commissionPercent = parseFloat(formData.referralCommission) || 0;
      const commissionAmount = (subtotal * commissionPercent) / 100;
      const finalPayable = subtotal - commissionAmount;

      let paymentStatus = formData.paymentStatus;
      let amountPaid = 0;
      let balanceAmount = finalPayable;

      if (formData.paymentStatus === "Paid") {
        amountPaid = finalPayable;
        balanceAmount = 0;
      } else if (formData.paymentStatus === "Partial" && formData.partialAmount) {
        amountPaid = parseFloat(formData.partialAmount) || 0;
        balanceAmount = finalPayable - amountPaid;
        if (balanceAmount <= 0) {
          paymentStatus = "Paid";
          amountPaid = finalPayable;
          balanceAmount = 0;
        }
      } else if (formData.paymentStatus === "Due") {
        amountPaid = 0;
        balanceAmount = finalPayable;
      } else {
        amountPaid = 0;
        balanceAmount = finalPayable;
      }

      console.log("🔄 Updating patient:", editingId);
      const res = await axios.put(`${API_BASE_URL}/patients/${editingId}`, {
        title: formData.title,
        name: formData.name,
        dob: formData.dob,
        age: formData.age,
        gender: formData.gender,
        phone: formData.phone,
        address: formData.address,
        serviceItems: formData.serviceItems,
        paymentType: formData.paymentType,
        reason: formData.reason,
        paymentStatus: paymentStatus,
        services: formData.selectedServices,
        referredByCustomer: formData.referredByCustomer,
        referredByDoctor: formData.referredByDoctor,
        referralCustomerId: formData.referralCustomerId,
        referralDoctorId: formData.referralDoctorId,
        referralCommission: formData.referralCommission,
        referralCommissionType: formData.referralCommissionType,
        partialAmount: formData.partialAmount
      });
      
      if (res.data.success) {
        patientData = res.data.data;
        setPatients((prev) => prev.map((p) => (p._id === editingId ? patientData : p)));
      } else {
        showToast("Failed to update patient data", "error");
        setSubmitting(false);
        return;
      }

      const bookingPayload = {
        patientId: patientData._id,
        patientTitle: formData.title,
        patientName: formData.name,
        patientPhone: formData.phone,
        patientAge: formData.age,
        patientDob: formData.dob,
        patientGender: formData.gender,
        patientAddress: formData.address,
        purpose: formData.reason,
        paymentType: formData.paymentType,
        paymentStatus: paymentStatus,
        partialAmount: formData.partialAmount || 0,
        amountPaid: amountPaid,
        balanceAmount: balanceAmount,
        doctorId: formData.doctorId,
        appointmentDate: formData.appointmentDate,
        isOP: true,
        status: formData.status || "confirmed",
        serviceItems: formData.serviceItems.map(s => ({
          serviceId: s._id,
          name: s.name,
          price: s.price,
          description: s.description || ""
        })),
        services: formData.serviceItems.map(s => ({
          serviceId: s._id,
          name: s.name,
          price: s.price,
          description: s.description || ""
        })),
        referredByCustomer: formData.referredByCustomer,
        referredByDoctor: formData.referredByDoctor,
        referralCustomerId: formData.referralCustomerId,
        referralDoctorId: formData.referralDoctorId,
        referralCommission: formData.referralCommission,
        referralCommissionType: formData.referralCommissionType
      };

      console.log("🔄 UPDATING BOOKING with ID:", formData.bookingId);
      console.log("📦 Booking Payload:", bookingPayload);
      
      const slotRes = await axios.put(`${API_BASE_URL}/appointment-slots/updateop/${formData.bookingId}`, bookingPayload);
      
      console.log("✅ UPDATE RESPONSE:", slotRes.data);
      
      if (slotRes.data.success) {
        showToast(`✅ Appointment updated successfully for ${formData.title} ${formData.name}!`, "success");
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
        setFilteredServices([]);
        setShowServiceSuggestions(false);
      } else {
        console.error("❌ Update failed:", slotRes.data);
        showToast(slotRes.data.message || "Failed to update appointment", "error");
      }
    } catch (err) {
      console.error("❌ Error in handleUpdateNow:", err);
      console.error("❌ Error response:", err.response?.data);
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
    if (prescriptionRef.current) {
      const win = window.open("", "_blank", "width=800,height=1100");
      if (win) {
        win.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Prescription - ${selectedBookingForPrescription?.patientName || "Patient"}</title>
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                  font-family: Arial, sans-serif; 
                  background: #fff; 
                  display: flex; 
                  flex-direction: column;
                  align-items: center; 
                  min-height: 100vh; 
                  padding: 20px; 
                }
                .prescription-page { 
                  max-width: 650px; 
                  width: 100%; 
                  position: relative; 
                  background: #fff; 
                  box-shadow: 0 4px 20px rgba(0,0,0,0.1); 
                  border-radius: 12px; 
                  overflow: hidden; 
                  margin-bottom: 30px;
                  page-break-after: always;
                }
                .prescription-page img { 
                  width: 100%; 
                  height: auto; 
                  display: block; 
                }
                .page-label {
                  text-align: center;
                  font-size: 11px;
                  color: #888;
                  padding: 6px 0;
                  background: #f5f5f5;
                  border-bottom: 1px solid #ddd;
                  font-weight: bold;
                  letter-spacing: 1px;
                }
                .overlay-print { 
                  position: absolute; 
                  top: 0; 
                  left: 0; 
                  right: 0; 
                  bottom: 0; 
                  padding: 0; 
                }
                .overlay-print .fld { 
                  position: absolute; 
                  font-size: 15px; 
                  font-weight: 600; 
                  color: #1a1a1a; 
                  letter-spacing: 0.2px; 
                  line-height: 1.3; 
                }
                @media print { 
                  body { padding: 0; } 
                  .prescription-page { box-shadow: none; border-radius: 0; margin-bottom: 0; }
                  .prescription-page:last-child { margin-bottom: 0; }
                  .page-label { display: none; }
                }
              </style>
            </head>
            <body>
              
              <div class="prescription-page">
                <div class="page-label">📄 Front Side - Prescription</div>
                <img src="${prescriptionTemplate}" alt="Prescription - Front" />
                <div class="overlay-print">
                  <div class="fld" style="top:78px;left:90px;max-width:280px;">
                    ${selectedBookingForPrescription?.patientTitle || ""} ${selectedBookingForPrescription?.patientName || "N/A"}
                  </div>
                  <div class="fld" style="top:78px;right:20px;">
                    ${formatDateToDDMMYYYY(selectedBookingForPrescription?.appointmentDate || selectedBookingForPrescription?.date)}
                  </div>
                  <div class="fld" style="top:104px;left:90px;">
                    ${selectedBookingForPrescription?.patientAge || "N/A"}
                  </div>
                  <div class="fld" style="top:104px;left:230px;">
                    ${selectedBookingForPrescription?.patientGender || "N/A"}
                  </div>
                  <div class="fld" style="top:104px;right:100px;">
                    ${selectedBookingForPrescription?.patientPhone || "N/A"}
                  </div>
                  <div class="fld" style="top:130px;left:90px;max-width:320px;">
                    ${selectedBookingForPrescription?.purpose || selectedBookingForPrescription?.reason || "N/A"}
                  </div>
                </div>
              </div>

              <div class="prescription-page">
                <div class="page-label">📄 Back Side</div>
                <img src="${prescriptionBackTemplate}" alt="Prescription - Back" />
              </div>

              <script>window.onload = function() { window.print(); }</script>
            </body>
          </html>
        `);
        win.document.close();
        win.focus();
      }
    } else {
      showToast("No prescription content to print", "error");
    }
  };

  const getTotalServiceFee = (booking) => {
    if (!booking.serviceItems && !booking.services) return 0;
    const items = booking.serviceItems || booking.services || [];
    return items.reduce((sum, s) => sum + (s.price || 0), 0);
  };

  const getTotalBookingFee = (booking) => {
    return getTotalServiceFee(booking);
  };

  const getPatientTotalFee = (patient) => {
    const patientBookings = bookings.filter(
      (b) =>
        b.patientPhone === patient.phone ||
        (b.patientName &&
          patient.name &&
          b.patientName.toLowerCase() === patient.name.toLowerCase())
    );
    if (patientBookings.length === 0) return 0;
    return patientBookings.reduce((total, b) => total + getTotalBookingFee(b), 0);
  };

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
      const items = b.serviceItems || b.services || [];
      items.forEach((s) => {
        allServices.push({
          name: s.name,
          price: s.price || 0,
          bookingDate: b.date || b.appointmentDate,
          serviceId: s.serviceId || s._id,
          bookingId: b._id
        });
      });
    });
    return allServices;
  };

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

  const getMatchingBooking = (patient) => {
    return bookings.find(
      (b) =>
        b.patientPhone === patient.phone ||
        (b.patientName &&
          patient.name &&
          b.patientName.toLowerCase() === patient.name.toLowerCase())
    );
  };

  const getConsultationPaymentStatus = (patient) => {
    const booking = getMatchingBooking(patient);
    if (!booking) return patient.paymentStatus || "Pending";
    return booking.paymentStatus || "Pending";
  };

  const getBookingStatus = (patient) => {
    const booking = getMatchingBooking(patient);
    if (!booking) return "No Booking";
    return booking.status || "confirmed";
  };

  const getAppointmentDate = (patient) => {
    const booking = getMatchingBooking(patient);
    if (!booking) return "-";
    return booking.appointmentDate || booking.date || "-";
  };

  const getSlotTiming = (patient) => {
    const booking = getMatchingBooking(patient);
    if (!booking) return "-";
    if (booking.startTime && booking.endTime) {
      return `${booking.startTime} - ${booking.endTime}`;
    }
    return "-";
  };

  const getBookingCreatedDate = (patient) => {
    const booking = getMatchingBooking(patient);
    if (!booking) return "-";
    return booking.bookedAt || booking.createdAt || "-";
  };

  const openBillingModal = (booking) => {
    setSelectedBookingForBilling(booking);
    const totalServiceFee = getTotalServiceFee(booking);
    const grossAmount = totalServiceFee;
    const commissionPercent = parseFloat(booking.referralCommission) || 0;
    const commissionAmount = (grossAmount * commissionPercent) / 100;
    const netAmount = grossAmount - commissionAmount;
    const isPaid = booking.paymentStatus === "Paid";
    const paidAmount = isPaid ? netAmount : 0;
    const balanceAmount = isPaid ? 0 : netAmount;

    const now = new Date();
    const dateStamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    const shortId = String(booking._id || "").slice(-6).toUpperCase() || "000000";
    const invoiceNo = `${dateStamp}-${shortId}`;
    const dateTimeLabel = `${now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} ${now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
    const receiptNo = `R-${shortId.slice(-4)}-${String(now.getFullYear()).slice(-2)}-${now.getMonth() + 1}-${Math.floor(1000 + Math.random() * 9000)}`;

    const items = (booking.serviceItems || booking.services || []).map((s, idx) => ({
      no: idx + 1,
      name: s.name,
      serviceCode: s.serviceId ? String(s.serviceId).slice(-6).toUpperCase() : `SVC-${String(idx + 1).padStart(2, "0")}`,
      remarks: "Service",
      amount: s.price || 0,
      paymentStatus: booking.paymentStatus || "Pending"
    }));

    if (commissionPercent > 0) {
      items.push({
        no: items.length + 1,
        name: `Referral Discount (${booking.referralCommissionType || 'Clinic'}: ${commissionPercent}%)`,
        serviceCode: "REF-DISC",
        remarks: `Referred by ${booking.referredByCustomer || booking.referredByDoctor || 'N/A'}`,
        amount: -commissionAmount,
        paymentStatus: "Paid"
      });
    }

    setBillingData({
      invoiceNo,
      invoiceDate: dateTimeLabel,
      receiptNo,
      receiptDate: dateTimeLabel,
      paymentMode: booking.paymentType ? booking.paymentType.charAt(0).toUpperCase() + booking.paymentType.slice(1) : "Cash",
      receivedBy: "Front Desk",
      branch: booking.doctorSpecialization || "Main Branch",
      doctorName: booking.doctorName || "General OP Doctor",
      items,
      grossAmount,
      netAmount,
      paidAmount,
      balanceAmount,
      paymentStatus: booking.paymentStatus || "Pending",
      amountInWords: numberToWords(netAmount)
    });
    setShowBillingModal(true);
  };

  const handleMarkAsPaid = async () => {
    if (!selectedBookingForBilling) return;
    try {
      const res = await axios.put(`${API_BASE_URL}/appointment-slots/${selectedBookingForBilling._id}`, { paymentStatus: "Paid" });
      if (res && res.data && res.data.success) {
        setBookings((prev) => prev.map((b) => b._id === selectedBookingForBilling._id ? { ...b, paymentStatus: "Paid" } : b));
        setBillingData((prev) => ({ ...prev, paymentStatus: "Paid", paidAmount: prev.netAmount, balanceAmount: 0 }));
        fetchPatients();
        refreshPatientBookings();
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
    const itemsRows = billingData.items.map((item) => `
      <tr>
        <td>${item.no}</td>
        <td>${item.name}</td>
        <td>${item.serviceCode}</td>
        <td>${item.remarks}</td>
        <td class="text-right">${Number(item.amount).toFixed(2)}</td>
        <td class="text-center">${item.paymentStatus || "Pending"}</td>
      </tr>
    `).join("");

    const win = window.open("", "_blank", "width=900,height=1000");
    if (win) {
      win.document.write(`
        <!DOCTYPE html>
        <html>
          <head><meta charset="UTF-8" /><title>Bill - ${billingData.invoiceNo}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; color: #222; padding: 24px; background: #fff; }
            .bill-wrap { max-width: 820px; margin: 0 auto; border: 1px solid #999; padding: 24px 28px; background: #fff; overflow: hidden; }
            .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.08; z-index: 0; width: 300px; height: 300px; }
            .watermark img { width: 100%; height: 100%; object-fit: contain; }
            .bill-content { position: relative; z-index: 1; }
            .top-header { display: flex; align-items: flex-start; justify-content: space-between; border-bottom: 2px solid #222; padding-bottom: 14px; }
            .top-header .brand { display: flex; align-items: center; gap: 14px; }
            .top-header .brand img { width: 60px; height: 60px; object-fit: contain; }
            .top-header .brand h1 { font-size: 20px; font-weight: bold; color: #111; }
            .top-header .brand p { font-size: 11px; color: #555; max-width: 440px; }
            .top-header .contact { text-align: right; font-size: 11px; color: #555; white-space: nowrap; }
            .bar-title { text-align: center; background: #f1f1f1; border-top: 1px solid #999; border-bottom: 1px solid #999; padding: 6px 0; font-size: 13px; font-weight: bold; letter-spacing: 1.5px; margin: 10px 0 14px 0; text-transform: uppercase; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 24px; font-size: 12px; margin-bottom: 14px; }
            .info-grid .label { color: #666; font-weight: bold; display: inline-block; width: 120px; }
            table.items { width: 100%; border-collapse: collapse; border-top: 2px solid #222; border-bottom: 2px solid #222; margin-bottom: 12px; }
            table.items th { text-align: left; font-size: 11px; color: #555; padding: 6px 4px; border-bottom: 1px solid #bbb; text-transform: uppercase; }
            table.items td { font-size: 12px; padding: 6px 4px; border-bottom: 1px solid #eee; color: #333; }
            table.items td.text-right, table.items th.text-right { text-align: right; }
            table.items td.text-center, table.items th.text-center { text-align: center; }
            .totals-box { width: 100%; max-width: 300px; margin-left: auto; font-size: 12px; margin-bottom: 12px; }
            .totals-box .row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #eee; }
            .totals-box .row.final { border-top: 2px solid #222; border-bottom: none; font-weight: bold; padding-top: 8px; margin-top: 4px; font-size: 13px; }
            .footer-row { display: flex; justify-content: flex-end; gap: 8px; font-size: 11px; color: #555; border-top: 1px solid #ddd; padding-top: 12px; margin-top: 10px; }
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
                  <div class="brand"><img src="${logo}" alt="${CLINIC_INFO.name}" /><div><h1>${CLINIC_INFO.name}</h1><p>${CLINIC_INFO.address}</p></div></div>
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
                  <thead><tr><th style="width:6%;">No.</th><th style="width:30%;">Service / Item</th><th style="width:16%;">Service Code</th><th style="width:22%;">Remarks</th><th style="width:14%;" class="text-right">Amount</th><th style="width:12%;" class="text-center">Payment Status</th></tr></thead>
                  <tbody>${itemsRows}</tbody>
                </table>
                <div class="totals-box">
                  <div class="row"><span>Gross Bill Amount</span><span>₹ ${billingData.grossAmount.toFixed(2)}</span></div>
                  ${billingData.grossAmount !== billingData.netAmount ? `<div class="row"><span>Referral Discount</span><span>-₹ ${(billingData.grossAmount - billingData.netAmount).toFixed(2)}</span></div>` : ''}
                  <div class="row"><span>Net Amount</span><span>₹ ${billingData.netAmount.toFixed(2)}</span></div>
                  <div class="row"><span>Paid Amount</span><span>₹ ${billingData.paidAmount.toFixed(2)}</span></div>
                  <div class="row final"><span>Balance to Pay</span><span>₹ ${billingData.balanceAmount.toFixed(2)}</span></div>
                </div>
                <div class="footer-row"><span>Printed Date : ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} ${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span></div>
                <div class="signature-section"><span class="sig">Signature</span></div>
                <div class="footer-note">* Bills cannot be cancelled once registered.</div>
              </div>
            </div>
          </body>
        </html>
      `);
      win.document.close();
      win.focus();
      setTimeout(() => { win.print(); }, 500);
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
    setFeeTypeFilter("All");
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
    else if (type === "Partial") setStatusFilter("Partial");
    else if (type === "Due") setStatusFilter("Due");
  };

  const getUniqueDoctors = () => {
    const doctorMap = new Map();
    bookings.forEach((b) => {
      if (b.doctorName) doctorMap.set(b.doctorName, { name: b.doctorName, specialization: b.doctorSpecialization || "" });
    });
    return Array.from(doctorMap.values());
  };

  const filteredPatients = useMemo(() => {
    const filtered = patients.filter((p) => {
      const paymentStatus = getPatientPaymentStatus(p);
      if (statusFilter !== "All" && paymentStatus !== statusFilter) return false;
      if (feeTypeFilter !== "All") {
        const hasMatchingService = (p.serviceItems || []).some(s => 
          s.name && s.name.toLowerCase().includes(feeTypeFilter.toLowerCase())
        );
        if (!hasMatchingService) return false;
      }
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
    return filtered;
  }, [patients, statusFilter, feeTypeFilter, doctorFilter, searchQuery, fromDate, toDate, selectedMonth, bookings]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, feeTypeFilter, doctorFilter, fromDate, toDate, selectedMonth]);

  const stats = useMemo(() => {
    const total = patients.length;
    let paidTotal = 0, paidCount = 0, pendingCount = 0, partialCount = 0, dueCount = 0;

    patients.forEach((p) => {
      const patientBookings = bookings.filter(
        (b) =>
          b.patientPhone === p.phone ||
          (b.patientName &&
            p.name &&
            b.patientName.toLowerCase() === p.name.toLowerCase())
      );

      let totalFee = 0;
      if (patientBookings.length > 0) {
        patientBookings.forEach((b) => {
          totalFee += (b.finalPayable || b.totalAmount || 0);
        });
      }

      const status = getPatientPaymentStatus(p);
      if (status === "Paid") {
        paidCount++;
        paidTotal += totalFee;
      } else if (status === "Partial") {
        partialCount++;
        const paidAmount = patientBookings.reduce((sum, b) => sum + (b.amountPaid || 0), 0);
        paidTotal += paidAmount;
      } else if (status === "Due") {
        dueCount++;
      } else {
        pendingCount++;
      }
    });

    return {
      total,
      paid: paidCount,
      pending: pendingCount,
      partial: partialCount,
      due: dueCount,
      totalRevenue: paidTotal
    };
  }, [patients, bookings]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstItem, indexOfLastItem);

  const handleItemsPerPageChange = (e) => {
    const newValue = Number(e.target.value);
    setItemsPerPage(newValue);
    localStorage.setItem("opMgmt_itemsPerPage", String(newValue));
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
    if (filteredPatients.length === 0) { alert("No patient records available to export!"); return; }
    const headers = ["#", "Patient Name", "Phone", "Doctor", "Appointment Date", "Slot Timing", "Booking Status",
      "Services", "Total Fee", "Payment Status", "Payment Mode", "Reason", "Referred By Customer", "Referred By Doctor", "Created At", "Registered"];
    const csvRows = [
      headers.join(","),
      ...filteredPatients.map((p, idx) => {
        const regDate = p.createdAt ? formatDateToDDMMYYYY(p.createdAt) : "-";
        const regTime = p.createdAt ? formatTime(p.createdAt) : "-";
        const totalFee = getPatientTotalFee(p);
        const services = getPatientServices(p);
        const consPaymentStatus = getConsultationPaymentStatus(p);
        const bookingStatus = getBookingStatus(p);
        const appointmentDate = getAppointmentDate(p);
        const slotTiming = getSlotTiming(p);
        const bookingCreated = getBookingCreatedDate(p);
        const serviceNames = services.map(s => `${s.name}`).join("; ");
        const booking = getMatchingBooking(p);
        return [
          idx + 1,
          `"${(p.title || "")} ${(p.name || "").replace(/"/g, '""')}"`,
          `"${p.phone || ""}"`,
          `"${booking?.doctorName || "N/A"}"`,
          `"${formatDateToDDMMYYYY(appointmentDate)}"`,
          `"${slotTiming}"`,
          `"${bookingStatus}"`,
          `"${serviceNames}"`,
          totalFee,
          `"${consPaymentStatus}"`,
          `"${p.paymentType || "cash"}"`,
          `"${(p.reason || "").replace(/"/g, '""')}"`,
          `"${(p.referredByCustomer || "").replace(/"/g, '""')}"`,
          `"${(p.referredByDoctor || "").replace(/"/g, '""')}"`,
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
    a.download = `OP_Patient_Records_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filteredPatients.length} patient records to CSV!`);
  };

  // ============================================================
  // ===================== RENDER ================================
  // ============================================================
  return (
    <div className="emp-dash">
      <main className="p-2 sm:p-4 lg:p-6">

        {toast && (
          <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white transition-all transform animate-bounce ${toast.type === "error" ? "bg-red-600" : toast.type === "info" ? "bg-cyan-600" : "bg-emerald-600"
            }`}>
            {toast.type === "error" ? <FiXCircle className="w-5 h-5" /> : <FiCheckCircle className="w-5 h-5" />}
            <span className="font-medium text-sm">{toast.message}</span>
          </div>
        )}

        {/* Header - Desktop */}
        <div className="hidden lg:flex items-center justify-between gap-3 flex-wrap mb-6">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap">OP <span>Management</span></h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="emp-dash__date-pill"><FaUserInjured /><span>{patients.length} Registered OPD Patients</span></div>
            <div className="relative min-w-[130px]">
              <FaSearch className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
              <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[200px] pl-8 pr-2 py-1.5 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
              <option value="All">All Payment</option><option value="Pending">Pending</option><option value="Partial">Partial</option><option value="Paid">Paid</option><option value="Due">Due</option>
            </select>
            <select value={feeTypeFilter} onChange={(e) => setFeeTypeFilter(e.target.value)}
              className="h-8 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
              <option value="All">All Services</option>
            </select>
            <select value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)}
              className="h-8 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 max-w-[130px] truncate">
              <option value="All">All Doctors</option>
              {getUniqueDoctors().map((doc) => <option key={doc.name} value={doc.name}>{doc.name}</option>)}
            </select>
            <input type="date" value={fromDate} onChange={handleFromDateChange}
              className="w-[110px] h-8 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
            <input type="date" value={toDate} onChange={handleToDateChange}
              className="w-[110px] h-8 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
            <input type="month" value={selectedMonth} onChange={handleMonthChange}
              className="w-[120px] h-8 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Select Month" />
            <button onClick={() => { fetchPatients(); fetchBookings(); fetchAllSlots(); fetchDoctors(); fetchServices(); fetchReferralContacts(); }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm whitespace-nowrap">
              <FiRefreshCw className="w-3 h-3" /> Refresh
            </button>
            <button onClick={downloadCSV}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all shadow-sm whitespace-nowrap">
              <FiDownload className="w-3 h-3" /> Export CSV
            </button>
            <button onClick={handleAddNewPatient} 
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm whitespace-nowrap">
              <FiPlus className="w-3 h-3" /> Add Patient
            </button>
            {hasActiveFilters && (
              <button onClick={clearFilters}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm whitespace-nowrap">
                <FiTrash2 className="w-3 h-3 text-red-500" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Header - Mobile */}
        <div className="lg:hidden flex items-center justify-between gap-2 flex-wrap mb-3">
          <div className="flex items-baseline gap-2">
            <h1 className="text-base font-bold whitespace-nowrap">OP <span className="text-indigo-600">Management</span></h1>
            <div className="emp-dash__date-pill text-[10px] px-2 py-1"><FaUserInjured className="w-3 h-3 text-blue-600" /><span>{patients.length} Patients</span></div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={handleAddNewPatient} className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all">
              <FiPlus className="w-3 h-3" /> Add
            </button>
            <button onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all">
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
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                  <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Payment Status</label>
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                    <option value="All">All Status</option><option value="Pending">Pending</option><option value="Partial">Partial</option><option value="Paid">Paid</option><option value="Due">Due</option>
                  </select>
                </div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Service</label>
                  <select value={feeTypeFilter} onChange={(e) => setFeeTypeFilter(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                    <option value="All">All Services</option>
                  </select>
                </div>
              </div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Doctor</label>
                <select value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                  <option value="All">All Doctors</option>
                  {getUniqueDoctors().map((doc) => <option key={doc.name} value={doc.name}>{doc.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="block text-xs font-medium text-gray-600 mb-1">From Date</label>
                  <input type="date" value={fromDate} onChange={handleFromDateChange}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">To Date</label>
                  <input type="date" value={toDate} onChange={handleToDateChange}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
              </div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Month</label>
                <input type="month" value={selectedMonth} onChange={handleMonthChange}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>
              <div className="pt-3 border-t border-gray-200 flex gap-2">
                <button onClick={handleAddNewPatient} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm">
                  <FiPlus className="w-4 h-4" /> Add Patient
                </button>
                <button onClick={downloadCSV} disabled={filteredPatients.length === 0}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                  <FiDownload className="w-4 h-4" /> Export
                </button>
              </div>
              {hasActiveFilters && (
                <button onClick={clearFilters}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all">
                  <FiTrash2 className="w-4 h-4 text-red-500" /> Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 md:gap-4 mb-6">
          <div className={`emp-dash__stat cursor-pointer hover:scale-105 transition-transform duration-200 ${activeCardFilter === "all" ? "ring-2 ring-blue-500/20 border-blue-400" : ""}`} onClick={() => handleCardClick("all")}>
            <div className="emp-dash__stat-top"><span className="emp-dash__stat-label">Total Patients</span><div className="emp-dash__stat-icon emp-dash__stat-icon--rate"><FiUsers /></div></div>
            <div className="emp-dash__stat-value">{stats.total}</div><div className="emp-dash__stat-meta">all registered OPD</div>
          </div>
          <div className={`emp-dash__stat cursor-pointer hover:scale-105 transition-transform duration-200 ${activeCardFilter === "Paid" ? "ring-2 ring-emerald-500/20 border-emerald-400" : ""}`} onClick={() => handleCardClick("Paid")}>
            <div className="emp-dash__stat-top"><span className="emp-dash__stat-label">Paid</span><div className="emp-dash__stat-icon emp-dash__stat-icon--present"><FiUserCheck /></div></div>
            <div className="emp-dash__stat-value text-emerald-600">{stats.paid}</div><div className="emp-dash__stat-meta">completed payments</div>
          </div>
          <div className={`emp-dash__stat cursor-pointer hover:scale-105 transition-transform duration-200 ${activeCardFilter === "Partial" ? "ring-2 ring-amber-500/20 border-amber-400" : ""}`} onClick={() => handleCardClick("Partial")}>
            <div className="emp-dash__stat-top"><span className="emp-dash__stat-label">Partial</span><div className="emp-dash__stat-icon emp-dash__stat-icon--rate"><FaClock /></div></div>
            <div className="emp-dash__stat-value text-amber-600">{stats.partial}</div><div className="emp-dash__stat-meta">partially paid</div>
          </div>
          <div className={`emp-dash__stat cursor-pointer hover:scale-105 transition-transform duration-200 ${activeCardFilter === "Pending" ? "ring-2 ring-gray-500/20 border-gray-400" : ""}`} onClick={() => handleCardClick("Pending")}>
            <div className="emp-dash__stat-top"><span className="emp-dash__stat-label">Pending</span><div className="emp-dash__stat-icon emp-dash__stat-icon--late"><FiClock /></div></div>
            <div className="emp-dash__stat-value text-gray-600">{stats.pending}</div><div className="emp-dash__stat-meta">awaiting payment</div>
          </div>
          <div className={`emp-dash__stat cursor-pointer hover:scale-105 transition-transform duration-200 ${activeCardFilter === "Due" ? "ring-2 ring-red-500/20 border-red-400" : ""}`} onClick={() => handleCardClick("Due")}>
            <div className="emp-dash__stat-top"><span className="emp-dash__stat-label">Due</span><div className="emp-dash__stat-icon emp-dash__stat-icon--late"><FiXCircle /></div></div>
            <div className="emp-dash__stat-value text-red-500">{stats.due}</div><div className="emp-dash__stat-meta">overdue payments</div>
          </div>
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top"><span className="emp-dash__stat-label">Total Revenue</span><div className="emp-dash__stat-icon emp-dash__stat-icon--present"><FaRupeeSign /></div></div>
            <div className="emp-dash__stat-value text-blue-700">₹{stats.totalRevenue.toLocaleString()}</div>
            <div className="emp-dash__stat-meta">collected revenue</div>
          </div>
        </div>

        {/* ===== ADD/EDIT PATIENT MODAL ===== */}
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-gray-200 relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20"><FaUserInjured className="w-5 h-5" /></div>
                  <div><h3 className="font-bold text-gray-900 text-base">{editingId ? "Edit Patient Details" : "Register OPD Patient & Book Slot"}</h3><p className="text-xs text-gray-500">Fill in patient and consultation details below</p></div>
                </div>
                <button onClick={cancelForm} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><FaTimes className="w-4 h-4" /></button>
              </div>

              {showExistingPatientPopup && existingPatient && !editingId && (
                <div className="mt-4 p-3.5 bg-blue-50 border border-blue-200 rounded-xl shadow-xs">
                  <div className="flex items-start gap-3">
                    <FiAlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-blue-900">Existing Patient Record Found!</p>
                      <div className="mt-1 text-xs text-blue-800 space-y-0.5">
                        <p><span className="font-semibold">Name:</span> {existingPatient.title || ""} {existingPatient.name} | <span className="font-semibold">Phone:</span> {existingPatient.phone}</p>
                        <p><span className="font-semibold">Age:</span> {existingPatient.age} yrs | <span className="font-semibold">Gender:</span> {existingPatient.gender}</p>
                      </div>
                      <button type="button" onClick={autoFillPatientDetails} className="mt-2 px-3.5 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-xs inline-flex items-center gap-1.5"><FaCheck className="text-[10px]" /> Auto-Fill Details</button>
                    </div>
                    <button type="button" onClick={() => setShowExistingPatientPopup(false)} className="text-gray-400 hover:text-gray-600"><FaTimes className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              )}

              <form onSubmit={editingId ? handleUpdateNow : handleBookNow} className="mt-5 space-y-4">
                {/* ===== PATIENT DETAILS - PHONE FIRST ===== */}
                <div className="grid grid-cols-1">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1 flex items-center gap-2">
                      <FaPhoneAlt className="text-blue-600" /> Phone Number <span className="text-blue-600">*</span>
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
                        className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium" 
                        required 
                      />
                    </div>
                    <p className="text-[9px] text-gray-400 mt-1 flex items-center gap-1">
                      <FiAlertCircle className="w-3 h-3" /> Phone number is used to check for existing patients
                    </p>
                  </div>
                </div>

                {/* ===== TITLE + NAME ===== */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="col-span-1">
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <FaUserTag className="text-blue-600" /> Title <span className="text-blue-600">*</span>
                    </label>
                    <div className="relative">
                      <select 
                        name="title" 
                        value={formData.title} 
                        onChange={handleInputChange}
                        className="w-full bg-white border border-gray-300 rounded-lg px-2 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium appearance-none"
                        required
                      >
                        {TITLE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                      <span className="text-gray-400 text-xs absolute right-2 top-2.5 pointer-events-none">▾</span>
                    </div>
                  </div>
                  <div className="col-span-3">
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">Patient Name <span className="text-blue-600">*</span></label>
                    <div className="relative">
                      <FaUserInjured className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                      <input 
                        ref={nameInputRef} 
                        type="text" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleInputChange} 
                        placeholder="Enter patient full name" 
                        className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium" 
                        required 
                      />
                    </div>
                  </div>
                </div>

                {/* ===== DOB + AGE + GENDER ===== */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <FaCalendarAlt className="text-blue-600" /> DOB <span className="text-blue-600">*</span>
                    </label>
                    <input 
                      type="date" 
                      name="dob" 
                      value={formData.dob} 
                      onChange={handleInputChange}
                      max={new Date().toISOString().split("T")[0]}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">Age (Years) <span className="text-blue-600">*</span></label>
                    <input 
                      type="number" 
                      name="age" 
                      value={formData.age} 
                      onChange={handleInputChange} 
                      placeholder="Auto-calculated" 
                      min="0" 
                      max="120" 
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium cursor-default" 
                      required 
                      readOnly
                    />
                    <p className="text-[8px] text-gray-400 mt-0.5">Auto-calculated from DOB</p>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">Gender <span className="text-blue-600">*</span></label>
                    <div className="relative">
                      <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium appearance-none" required>
                        <option value="">Select Gender</option>
                        {GENDER_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                      <span className="text-gray-400 text-xs absolute right-3 top-2.5 pointer-events-none">▾</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">Address</label>
                  <div className="relative">
                    <FaMapMarkerAlt className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                    <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="Patient street address" className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium" />
                  </div>
                </div>

                {/* Doctor & Appointment */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">Select Doctor <span className="text-blue-600">*</span></label>
                    <div className="relative">
                      <FaStethoscope className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                      <select name="doctorId" value={formData.doctorId} onChange={handleInputChange} className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-8 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium appearance-none" required>
                        <option value="">Select Doctor</option>
                        {doctors.map((doc) => <option key={doc._id || doc.id} value={doc._id || doc.id}>{doc.name || "Doctor"}</option>)}
                      </select>
                      <span className="text-gray-400 text-xs absolute right-3 top-2.5 pointer-events-none">▾</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">Appointment Date <span className="text-blue-600">*</span></label>
                    <input type="date" name="appointmentDate" value={formData.appointmentDate} onChange={handleInputChange} min={new Date().toISOString().split("T")[0]} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium" required />
                  </div>
                </div>

                {/* ===== SLOTS SECTION ===== */}
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
                        <FiRefreshCw className="w-4 h-4 animate-spin text-blue-600" /> Loading slots...
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

                          if (formData.slotId && !isSelected) {
                            return null;
                          }

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
                              <div className="font-bold text-xs">{slot.startTime} – {slot.endTime}</div>
                              <div className="text-[10px] text-gray-500">₹{slot.consultationFee || 0}</div>
                              {isBooked && <span className="text-[9px] font-bold text-red-500 block mt-0.5">Booked</span>}
                              {isSelected && <span className="text-[9px] font-bold text-emerald-600 block mt-0.5">✓ Selected</span>}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {formData.slotId && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, slotId: "" }));
                          if (formData.doctorId && formData.appointmentDate) {
                            filterSlotsByDoctorAndDate(formData.doctorId, formData.appointmentDate);
                          }
                        }}
                        className="mt-2 text-[10px] text-blue-600 hover:text-blue-800 font-medium underline"
                      >
                        Change Slot
                      </button>
                    )}
                  </div>
                )}

                {/* ===== SERVICES SECTION ===== */}
                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                      <FaServicestack className="text-blue-600" /> Services <span className="text-blue-600">*</span>
                      <span className="text-[10px] font-normal text-gray-400">(Consultation, Lab, etc.)</span>
                    </label>
                    <span className="text-[10px] text-gray-400">{formData.serviceItems.length} service{formData.serviceItems.length !== 1 ? 's' : ''} added</span>
                  </div>

                  {formData.serviceItems.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.serviceItems.map((svc, idx) => (
                        <div key={`${svc._id}-${idx}`} className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 shadow-sm">
                          <span>{svc.name}</span>
                          <span className="font-bold text-emerald-600">₹{svc.price}</span>
                          <button type="button" onClick={() => handleRemoveServiceItem(svc._id)} className="ml-1 text-red-400 hover:text-red-600 transition-colors"><FaMinusCircle className="w-3 h-3" /></button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex-1 min-w-[150px] relative">
                      <input
                        type="text"
                        value={formData.serviceName || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData((prev) => ({ ...prev, serviceName: value }));
                          if (value.trim().length > 0) {
                            const filtered = services.filter(s => 
                              s.name.toLowerCase().includes(value.toLowerCase())
                            );
                            setFilteredServices(filtered);
                            setShowServiceSuggestions(true);
                          } else {
                            setFilteredServices([]);
                            setShowServiceSuggestions(false);
                          }
                        }}
                        onFocus={() => {
                          if (formData.serviceName?.trim().length > 0) {
                            const filtered = services.filter(s => 
                              s.name.toLowerCase().includes(formData.serviceName.toLowerCase())
                            );
                            setFilteredServices(filtered);
                            setShowServiceSuggestions(true);
                          }
                        }}
                        placeholder="Service name (e.g. Consultation Fee)"
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                      />
                      {showServiceSuggestions && filteredServices.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto z-50">
                          {filteredServices.map((svc) => (
                            <button key={svc._id} type="button"
                              onClick={() => {
                                setFormData((prev) => ({ ...prev, serviceName: svc.name, servicePrice: svc.price.toString() }));
                                setFilteredServices([]);
                                setShowServiceSuggestions(false);
                              }}
                              className="w-full px-3.5 py-2.5 text-left text-xs hover:bg-gray-50 transition-colors flex items-center justify-between border-b border-gray-50 last:border-0">
                              <span className="font-medium text-gray-800">{svc.name}</span>
                              <span className="font-bold text-emerald-700">₹{svc.price}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="relative w-24">
                      <FaRupeeSign className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                      <input type="number" value={formData.servicePrice || ""} onChange={(e) => setFormData((prev) => ({ ...prev, servicePrice: e.target.value }))} placeholder="Price" min="0" className="w-full bg-white border border-gray-300 rounded-lg pl-8 pr-2 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium" />
                    </div>
                    <button type="button" onClick={handleAddCustomServiceItem} className="px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all flex items-center gap-1 whitespace-nowrap shadow-sm"><FaPlus className="w-3 h-3" /> Add</button>
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-3 text-[9px] text-gray-400">
                    <span className="flex items-center gap-1"><FiAlertCircle className="w-3 h-3" /> Type service name, set price, click <strong className="text-emerald-600">Add</strong></span>
                    <span className="text-gray-300">|</span>
                    <span>Add Consultation Fee, Lab Fee, or any other service</span>
                  </div>

                  {formData.serviceItems.length > 0 && (
                    <div className="mt-3 p-2.5 bg-white rounded-lg border border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-600">Subtotal:</span>
                        <span className="text-sm font-extrabold text-blue-700">
                          ₹{formData.serviceItems.reduce((sum, s) => sum + (s.price || 0), 0)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* ===== REFERRED BY SECTION - SPLIT WITH ADD BUTTONS ===== */}
                <div className="border border-gray-200 rounded-xl p-4 bg-blue-50/30">
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FaShareAlt className="text-blue-600" /> Referred By
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* ===== LEFT: Customer Referrals ===== */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                          <FaUserFriends className="text-blue-500" /> Customer
                        </label>
                        <button
                          type="button"
                          onClick={handleAddCustomerReferral}
                          className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 transition-colors"
                        >
                          <FaPlus className="w-2.5 h-2.5" /> Add
                        </button>
                      </div>
                      <select
                        value={formData.referralCustomerId}
                        onChange={(e) => {
                          const contactId = e.target.value;
                          if (contactId) {
                            const contact = referralContacts.find(c => c._id === contactId && c.referralType === "customer");
                            if (contact) {
                              handleReferralCustomerSelect(contact);
                            }
                          } else {
                            setFormData((prev) => ({ ...prev, referredByCustomer: "", referralCustomerId: "" }));
                          }
                        }}
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium appearance-none"
                      >
                        <option value="">-- Select Customer --</option>
                        {referralContacts
                          .filter(contact => contact.referralType === "customer")
                          .map((contact) => (
                            <option key={contact._id} value={contact._id}>
                              {contact.customerName || "N/A"} 
                              {contact.customerPhone ? ` (${contact.customerPhone})` : ''}
                            </option>
                          ))}
                      </select>
                      {formData.referredByCustomer && (
                        <div className="mt-2 text-xs text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 flex items-center gap-1.5">
                          <FaUserFriends className="text-blue-500 text-[10px]" />
                          <span className="font-medium">{formData.referredByCustomer}</span>
                        </div>
                      )}
                    </div>

                    {/* ===== RIGHT: Doctor Referrals ===== */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                          <FaUserMdIcon className="text-indigo-500" /> Doctor
                        </label>
                        <button
                          type="button"
                          onClick={handleAddDoctorReferral}
                          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 transition-colors"
                        >
                          <FaPlus className="w-2.5 h-2.5" /> Add
                        </button>
                      </div>
                      <select
                        value={formData.referralDoctorId}
                        onChange={(e) => {
                          const contactId = e.target.value;
                          if (contactId) {
                            const contact = referralContacts.find(c => c._id === contactId && c.referralType === "doctor");
                            if (contact) {
                              handleReferralDoctorSelect(contact);
                            }
                          } else {
                            setFormData((prev) => ({ ...prev, referredByDoctor: "", referralDoctorId: "" }));
                          }
                        }}
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium appearance-none"
                      >
                        <option value="">-- Select Doctor --</option>
                        {referralContacts
                          .filter(contact => contact.referralType === "doctor")
                          .map((contact) => (
                            <option key={contact._id} value={contact._id}>
                              {contact.doctorName || "N/A"} 
                              {contact.doctorSpecialization ? ` (${contact.doctorSpecialization})` : ''}
                            </option>
                          ))}
                      </select>
                      {formData.referredByDoctor && (
                        <div className="mt-2 text-xs text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200 flex items-center gap-1.5">
                          <FaUserMdIcon className="text-indigo-500 text-[10px]" />
                          <span className="font-medium">{formData.referredByDoctor}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-[9px] text-gray-400 mt-3 flex items-center gap-1">
                    <FiAlertCircle className="w-3 h-3" /> Select a customer or doctor referral (or both if applicable)
                  </p>
                </div>

                {/* ===== PAYMENT DETAILS ===== */}
                <div className="border border-gray-200 rounded-xl p-4 bg-purple-50/30">
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FaMoneyBillWave className="text-purple-600" /> Payment Details
                  </label>

                  {(() => {
                    const servicesTotal = formData.serviceItems.reduce((sum, s) => sum + (s.price || 0), 0);
                    const subtotal = servicesTotal;
                    const commissionPercent = parseFloat(formData.referralCommission) || 0;
                    const commissionAmount = (subtotal * commissionPercent) / 100;
                    const finalPayable = subtotal - commissionAmount;

                    return (
                      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
                        <div className="space-y-1.5 text-xs">
                          {formData.serviceItems.length > 0 && (
                            <>
                              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                                <span className="text-gray-700 font-medium">Services</span>
                                <span className="text-gray-500 text-[10px]">{formData.serviceItems.length} service{formData.serviceItems.length > 1 ? 's' : ''}</span>
                              </div>
                              {formData.serviceItems.map((svc, idx) => (
                                <div key={idx} className="flex justify-between items-center py-1 border-b border-gray-100 pl-4">
                                  <span className="text-gray-600 text-[10px]">• {svc.name}</span>
                                  <span className="font-medium text-gray-800">₹{svc.price || 0}</span>
                                </div>
                              ))}
                            </>
                          )}

                          <div className="flex justify-between items-center py-1.5 border-b border-gray-200 font-semibold">
                            <span className="text-gray-800">Subtotal</span>
                            <span className="text-gray-900">₹{subtotal}</span>
                          </div>

                          {commissionPercent > 0 && (
                            <div className="flex justify-between items-center py-1 border-b border-gray-200 bg-blue-50/50 px-2 rounded">
                              <div className="flex items-center gap-1.5">
                                <FaPercent className="text-blue-600 text-[10px]" />
                                <span className="text-gray-700 text-[10px]">
                                  Referral Discount ({formData.referralCommissionType || 'Clinic'}: {commissionPercent}%)
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500 text-[10px] line-through">₹{Math.round(commissionAmount)}</span>
                                <span className="text-red-500 font-bold">-₹{Math.round(commissionAmount)}</span>
                              </div>
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">Payment Mode <span className="text-blue-600">*</span></label>
                      <div className="flex gap-2">
                        {PAYMENT_TYPE_OPTIONS.map((opt) => (
                          <button key={opt.value} type="button" onClick={() => setFormData((prev) => ({ ...prev, paymentType: opt.value }))}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-bold transition-all ${formData.paymentType === opt.value ? "border-blue-500 bg-blue-50 text-blue-700 shadow-xs" : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"}`}>
                            {opt.value === "cash" ? <FaMoneyBillWave className="w-3.5 h-3.5" /> : <FaCreditCard className="w-3.5 h-3.5" />}{opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">Payment Status <span className="text-blue-600">*</span></label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {PAYMENT_STATUS_OPTIONS.map((st) => {
                          const colors = getPaymentStatusColors(st.value);
                          const Icon = colors.icon;
                          return (
                            <button key={st.value} type="button" onClick={() => setFormData((prev) => ({ ...prev, paymentStatus: st.value }))}
                              className={`px-2 py-1.5 rounded-lg border text-[10px] font-bold transition-all flex items-center justify-center gap-1 ${formData.paymentStatus === st.value ? `${colors.bg} ${colors.text} border-blue-500 ring-2 ring-blue-400/20` : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"}`}>
                              <Icon className={`w-3 h-3 ${colors.iconColor}`} /> {st.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {formData.paymentStatus === "Partial" && (
                    <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <label className="block text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1">Partial Amount (₹) <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <FaRupeeSign className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                        <input type="number" name="partialAmount" value={formData.partialAmount} onChange={handleInputChange} placeholder="Enter amount paid" min="0" className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium" required={formData.paymentStatus === "Partial"} />
                      </div>
                      {(() => {
                        const servicesTotal = formData.serviceItems.reduce((sum, s) => sum + (s.price || 0), 0);
                        const subtotal = servicesTotal;
                        const commissionPercent = parseFloat(formData.referralCommission) || 0;
                        const commissionAmount = (subtotal * commissionPercent) / 100;
                        const finalPayable = subtotal - commissionAmount;
                        return (
                          <p className="text-[9px] text-amber-600 mt-1">Total Payable: ₹{Math.round(finalPayable)}</p>
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

                {/* Reason */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">Reason / Symptoms</label>
                  <textarea name="reason" value={formData.reason} onChange={handleInputChange} placeholder="Brief description of symptoms..." rows={2} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium resize-none" />
                </div>

                {/* ===== FORM SUBMIT BUTTON ===== */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={cancelForm} className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all">
                    Cancel
                  </button>
                  
                  {editingId ? (
                    <button 
                      type="submit" 
                      disabled={submitting || !formData.slotId || !formData.doctorId || formData.serviceItems.length === 0} 
                      className="px-5 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {submitting ? (
                        <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <FiEdit2 className="w-3.5 h-3.5" />
                      )}
                      {submitting ? "Updating..." : "Update Appointment"}
                    </button>
                  ) : (
                    <button 
                      type="submit" 
                      disabled={submitting || !formData.slotId || !formData.doctorId || formData.serviceItems.length === 0} 
                      className="px-5 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {submitting ? (
                        <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <FiCalendar className="w-3.5 h-3.5" />
                      )}
                      {submitting ? "Processing..." : "Confirm & Book Slot"}
                    </button>
                  )}
                </div>
                <div className="text-[9px] text-gray-400 text-center mt-1">
                  * At least one service is required
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ===== PATIENT TABLE ===== */}
        <div className="emp-dash__card">
          {loading ? (
            <div className="py-12 text-center text-gray-500"><FiRefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" /><p className="text-sm font-medium text-gray-500">Loading patient records...</p></div>
          ) : filteredPatients.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <FaUserInjured className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-700">No Patient Records Found</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto mb-4">{patients.length === 0 ? "Click 'Add Patient' to register a new OPD patient." : "No records match your current search/date filters."}</p>
              {hasActiveFilters ? (
                <button onClick={clearFilters} className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm">Clear Filters</button>
              ) : (
                <button onClick={handleAddNewPatient} className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm inline-flex items-center gap-1.5"><FiPlus className="w-3.5 h-3.5" /> Add Patient</button>
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
                      <th style={{ textAlign: "center" }}>Slot Timing</th>
                      <th style={{ textAlign: "center" }}>Booking Status</th>
                      <th style={{ textAlign: "center" }}>Services</th>
                      <th style={{ textAlign: "center" }}>Total</th>
                      <th style={{ textAlign: "center" }}>Payment Status</th>
                      <th style={{ textAlign: "center" }}>Referred By (Customer)</th>
                      <th style={{ textAlign: "center" }}>Referred By (Doctor)</th>
                      <th style={{ textAlign: "center" }}>Created At</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPatients.map((patient, idx) => {
                      const matchingBooking = getMatchingBooking(patient);
                      const totalFee = getPatientTotalFee(patient);
                      const services = getPatientServices(patient);
                      const consultationPaymentStatus = getConsultationPaymentStatus(patient);
                      const bookingStatus = getBookingStatus(patient);
                      const appointmentDate = getAppointmentDate(patient);
                      const slotTiming = getSlotTiming(patient);
                      const statusColors = getStatusColors(bookingStatus);
                      const referredByCustomer = matchingBooking?.referredByCustomer || patient.referredByCustomer || "";
                      const referredByDoctor = matchingBooking?.referredByDoctor || patient.referredByDoctor || "";
                      const paymentColors = getPaymentStatusColors(consultationPaymentStatus);
                      const createdAt = matchingBooking?.createdAt || matchingBooking?.bookedAt || patient.createdAt;

                      return (
                        <tr key={patient._id} className="transition-colors hover:bg-blue-50/40 cursor-pointer group" onClick={() => handleRowClick(patient)}>
                          <td className="px-2 py-3 font-semibold text-center text-slate-500 text-[11px]">{indexOfFirstItem + idx + 1}</td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-[10px] shadow-sm">{patient.name ? patient.name.charAt(0).toUpperCase() : "P"}</div>
                              <div className="min-w-0">
                                <div className="font-semibold text-slate-800 text-xs truncate max-w-[80px]">
                                  {patient.title || ""} {patient.name || "N/A"}
                                </div>
                                <div className="text-[9px] text-gray-400">{patient.age || "?"} yrs</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap"><span className="text-xs font-medium text-slate-700">{patient.phone || "N/A"}</span></td>
                          <td className="px-3 py-3"><div className="text-xs font-semibold text-purple-800 truncate max-w-[90px]">{matchingBooking?.doctorName || "N/A"}</div></td>
                          <td className="px-3 py-3 text-center whitespace-nowrap"><span className="text-xs font-medium text-slate-700">{formatDateToDDMMYYYY(appointmentDate)}</span></td>
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
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            {bookingStatus !== "No Booking" && matchingBooking ? (
                              <div className="relative inline-block status-dropdown">
                                <button onClick={(e) => handleStatusDropdownToggle(matchingBooking._id, e)} className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${statusColors.bg} ${statusColors.text} ${statusColors.border} hover:opacity-80 transition-all`}>
                                  <FaCheckCircle className="w-2.5 h-2.5" /> {bookingStatus} <FiChevronDown className="w-3 h-3 ml-0.5" />
                                </button>
                                {openStatusDropdown === matchingBooking._id && (
                                  <div className="fixed z-[9999] bg-white rounded-lg shadow-2xl border border-gray-200 py-1 min-w-[140px] max-h-[200px] overflow-y-auto" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} onClick={(e) => e.stopPropagation()}>
                                    <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white to-transparent pointer-events-none"></div>
                                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                                    {BOOKING_STATUS_OPTIONS.map((st) => {
                                      const isActive = st.value === bookingStatus;
                                      const colors = getStatusColors(st.value);
                                      return <button key={st.value} onClick={(e) => { e.stopPropagation(); handleStatusSelect(matchingBooking, st.value, e); }} className={`w-full px-4 py-2 text-left text-[11px] font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2 ${isActive ? colors.text : "text-gray-600"}`}><span className={`w-2 h-2 rounded-full ${colors.bg} border ${colors.border}`}></span> {st.label} {isActive && <FaCheck className="w-2.5 h-2.5 ml-auto text-green-500" />}</button>;
                                    })}
                                  </div>
                                )}
                              </div>
                            ) : <span className="text-[10px] text-gray-400 italic">No Booking</span>}
                          </td>
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            {services.length > 0 ? (
                              <div className="flex flex-col gap-0.5 items-center">
                                {services.slice(0, 2).map((s, i) => (
                                  <span key={i} className="text-[9px] font-medium bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100" title={s.name}>
                                    {s.name}
                                  </span>
                                ))}
                                {services.length > 2 && <span className="text-[9px] text-gray-400">+{services.length - 2}</span>}
                              </div>
                            ) : <span className="text-[10px] text-gray-400 italic">-</span>}
                          </td>
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <span className="text-xs font-bold text-slate-800">
                              ₹{Math.round(matchingBooking?.finalPayable || matchingBooking?.totalAmount || totalFee)}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            {matchingBooking ? (
                              <div className="relative inline-block payment-dropdown">
                                <button onClick={(e) => handlePaymentDropdownToggle(matchingBooking._id, e)} className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${paymentColors.bg} ${paymentColors.text} ${paymentColors.border} hover:opacity-80 transition-all`}>
                                  <paymentColors.icon className={`w-2.5 h-2.5 ${paymentColors.iconColor}`} /> {consultationPaymentStatus} <FiChevronDown className="w-3 h-3 ml-0.5" />
                                </button>
                                {openPaymentDropdown === matchingBooking._id && (
                                  <div className="fixed z-[9999] bg-white rounded-lg shadow-2xl border border-gray-200 py-1 min-w-[140px] max-h-[200px] overflow-y-auto" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} onClick={(e) => e.stopPropagation()}>
                                    <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white to-transparent pointer-events-none"></div>
                                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                                    {PAYMENT_STATUS_OPTIONS.map((st) => {
                                      const isActive = st.value === consultationPaymentStatus;
                                      const colors = getPaymentStatusColors(st.value);
                                      const Icon = colors.icon;
                                      return <button key={st.value} onClick={(e) => { e.stopPropagation(); handlePaymentSelect(matchingBooking, st.value, e); }} className={`w-full px-4 py-2 text-left text-[11px] font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2 ${isActive ? colors.text : "text-gray-600"}`}><Icon className={`w-3 h-3 ${colors.iconColor}`} /> {st.label} {isActive && <FaCheck className="w-2.5 h-2.5 ml-auto text-green-500" />}</button>;
                                    })}
                                  </div>
                                )}
                              </div>
                            ) : <span className="text-[10px] text-gray-400 italic">-</span>}
                          </td>
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            {referredByCustomer ? (
                              <div className="flex items-center justify-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                                <FaUserFriends className="text-[9px]" />
                                <span className="truncate max-w-[80px]">{referredByCustomer}</span>
                              </div>
                            ) : <span className="text-[10px] text-gray-400 italic">-</span>}
                          </td>
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            {referredByDoctor ? (
                              <div className="flex items-center justify-center gap-1 text-xs font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                                <FaUserMdIcon className="text-[9px]" />
                                <span className="truncate max-w-[80px]">{referredByDoctor}</span>
                              </div>
                            ) : <span className="text-[10px] text-gray-400 italic">-</span>}
                          </td>
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <span className="text-[10px] font-medium text-gray-500">
                              {formatDateTimeToDDMMYYYY(createdAt)}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <button onClick={() => handleRowClick(patient)} className="p-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-all duration-200 shadow-sm border border-indigo-100 hover:shadow-md hover:scale-105"><FiEye className="w-3.5 h-3.5" /></button>
                              <button onClick={() => handleEdit(patient, matchingBooking)} className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200 shadow-sm border border-blue-100 hover:shadow-md hover:scale-105"><FiEdit2 className="w-3.5 h-3.5" /></button>
                              {matchingBooking && (
                                <>
                                  <button onClick={() => openPrescriptionModal(matchingBooking)} className="p-1.5 bg-teal-50 text-teal-600 hover:bg-teal-100 rounded-lg transition-all duration-200 shadow-sm border border-teal-100 hover:shadow-md hover:scale-105"><FaPrescription className="w-3.5 h-3.5" /></button>
                                  <button onClick={() => openBillingModal(matchingBooking)} className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-all duration-200 shadow-sm border border-emerald-100 hover:shadow-md hover:scale-105"><FaFileInvoiceDollar className="w-3.5 h-3.5" /></button>
                                </>
                              )}
                              <button onClick={() => handleDelete(patient._id)} className="p-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-all duration-200 shadow-sm border border-red-100 hover:shadow-md hover:scale-105"><FiTrash2 className="w-3.5 h-3.5" /></button>
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
                    <select value={itemsPerPage} onChange={handleItemsPerPageChange} className="p-1 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none">
                      <option value={5}>5</option><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option>
                    </select>
                    <span>entries</span>
                  </div>
                  <div className="text-xs text-gray-500 font-medium">
                    Showing <strong className="text-gray-800">{filteredPatients.length === 0 ? 0 : indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredPatients.length)}</strong> of <strong className="text-gray-800">{filteredPatients.length}</strong> records
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className={`px-2.5 py-1 text-xs font-semibold border rounded-lg transition-all ${currentPage === 1 ? "text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed" : "text-gray-700 bg-white hover:bg-gray-50 border-gray-300 shadow-sm"}`}>Prev</button>
                  {getPageNumbers().map((page, index) => (
                    <button key={index} onClick={() => (typeof page === "number" ? setCurrentPage(page) : null)} disabled={page === "..."} className={`px-3 py-1 text-xs font-semibold border rounded-lg transition-all min-w-[32px] ${page === "..." ? "text-gray-400 bg-transparent border-transparent cursor-default" : currentPage === page ? "text-white bg-blue-600 border-blue-600 shadow-sm" : "text-gray-700 bg-white hover:bg-gray-50 border-gray-300"}`}>{page}</button>
                  ))}
                  <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages || totalPages === 0} className={`px-2.5 py-1 text-xs font-semibold border rounded-lg transition-all ${currentPage === totalPages || totalPages === 0 ? "text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed" : "text-gray-700 bg-white hover:bg-gray-50 border-gray-300 shadow-sm"}`}>Next</button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ===== PATIENT DETAIL MODAL - Keep existing ===== */}
        {showPatientModal && selectedPatient && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-gray-200">
              <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-md shadow-purple-500/20"><FaUserInjured className="w-5 h-5" /></div>
                  <div><h3 className="font-bold text-gray-900 text-base">Patient Profile &amp; Appointments</h3><p className="text-xs text-gray-500">{selectedPatient.title || ""} {selectedPatient.name} • {selectedPatient.phone}</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-purple-700 font-semibold bg-purple-50 px-3 py-1 rounded-full border border-purple-200">{patientBookings.length} Bookings</span>
                  <button onClick={() => { setShowPatientModal(false); setPatientBookings([]); setSelectedPatient(null); }} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><FaTimes className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                {historyLoading ? (
                  <div className="py-12 text-center text-gray-500"><FiRefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" /><p className="text-sm font-medium text-gray-500">Loading patient history...</p></div>
                ) : (
                  <>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-bold flex items-center justify-center text-lg shadow-md flex-shrink-0">{selectedPatient.name ? selectedPatient.name.charAt(0).toUpperCase() : "P"}</div>
                        <div><div className="font-bold text-gray-900 text-base">{selectedPatient.title || ""} {selectedPatient.name}</div><div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5"><FaPhoneAlt className="text-gray-400 text-[10px]" />{selectedPatient.phone || "N/A"}</div></div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        <div><div className="text-[10px] font-bold uppercase text-gray-400">Age</div><div className="font-semibold text-gray-900">{selectedPatient.age || "N/A"} Yrs</div></div>
                        <div><div className="text-[10px] font-bold uppercase text-gray-400">Gender</div><div className="font-semibold text-gray-900 capitalize">{selectedPatient.gender || "N/A"}</div></div>
                        <div><div className="text-[10px] font-bold uppercase text-gray-400">DOB</div><div className="font-semibold text-gray-900">{formatDateToDDMMYYYY(selectedPatient.dob) || "N/A"}</div></div>
                        <div><div className="text-[10px] font-bold uppercase text-gray-400">Payment Mode</div><div className="font-semibold text-gray-900 capitalize">{selectedPatient.paymentType || "Cash"}</div></div>
                      </div>
                      {selectedPatient.address && (
                        <div className="mt-3 pt-3 border-t border-gray-200 text-xs"><div className="text-[10px] font-bold uppercase text-gray-400">Address</div><div className="text-gray-700">{selectedPatient.address}</div></div>
                      )}
                      {selectedPatient.reason && (
                        <div className="mt-2 text-xs"><div className="text-[10px] font-bold uppercase text-gray-400">Reason</div><div className="text-gray-700 bg-white p-2 rounded-lg border border-gray-200">{selectedPatient.reason}</div></div>
                      )}
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                        {selectedPatient.referredByCustomer && (
                          <div><div className="text-[10px] font-bold uppercase text-gray-400">Customer Referral</div><div className="text-gray-700 bg-white p-1.5 rounded-lg border border-gray-200 flex items-center gap-1.5"><FaUserFriends className="text-blue-500 text-[10px]" />{selectedPatient.referredByCustomer}</div></div>
                        )}
                        {selectedPatient.referredByDoctor && (
                          <div><div className="text-[10px] font-bold uppercase text-gray-400">Doctor Referral</div><div className="text-gray-700 bg-white p-1.5 rounded-lg border border-gray-200 flex items-center gap-1.5"><FaUserMdIcon className="text-indigo-500 text-[10px]" />{selectedPatient.referredByDoctor}</div></div>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-3"><FaCalendarAlt className="text-purple-600 text-sm" /><h4 className="font-bold text-gray-900 text-sm">Appointment Records ({patientBookings.length})</h4></div>
                      {patientBookings.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-sm bg-gray-50 rounded-xl border border-gray-200">No appointments booked yet.</div>
                      ) : (
                        <div className="space-y-4">
                          {patientBookings.map((booking, bIdx) => {
                            const hasServices = (booking.serviceItems && booking.serviceItems.length > 0) || (booking.services && booking.services.length > 0);
                            const items = booking.serviceItems || booking.services || [];
                            const totalFee = getTotalBookingFee(booking);
                            const statusColors = getStatusColors(booking.status);
                            const slotTiming = booking.startTime && booking.endTime ? `${booking.startTime} - ${booking.endTime}` : "-";
                            return (
                              <div key={booking._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-shadow">
                                <div className={`px-4 py-2.5 ${statusColors.bg} border-b ${statusColors.border} flex items-center justify-between flex-wrap gap-2`}>
                                  <div className="flex items-center gap-2.5">
                                    <span className="font-bold text-gray-500 text-xs">#{bIdx + 1}</span>
                                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${statusColors.text} ${statusColors.bg} ${statusColors.border}`}>{booking.status || "confirmed"}</span>
                                    <span className="text-xs text-gray-600 font-medium">{formatDateToDDMMYYYY(booking.appointmentDate || booking.date)}</span>
                                    {slotTiming !== "-" && <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200">{slotTiming}</span>}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button onClick={() => { setSelectedBookingForStatus(booking); setNewBookingStatus(booking.status || "confirmed"); setShowStatusUpdateModal(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><FiCheckCircle className="w-3.5 h-3.5" /></button>
                                    <button onClick={() => { setSelectedBookingForPayment(booking); setNewPaymentStatus(booking.paymentStatus || "Pending"); setShowPaymentUpdateModal(true); }} className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"><FaCreditCard className="w-3.5 h-3.5" /></button>
                                    <button onClick={() => openBillingModal(booking)} className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"><FaFileInvoiceDollar className="w-3.5 h-3.5" /></button>
                                    <button onClick={() => openPrescriptionModal(booking)} className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"><FaPrescription className="w-3.5 h-3.5" /></button>
                                  </div>
                                </div>
                                <div className="p-4 space-y-3">
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                    <div><div className="text-[10px] font-bold uppercase text-gray-400">Doctor</div><div className="font-bold text-gray-900">{booking.doctorName || "N/A"}</div></div>
                                    <div><div className="text-[10px] font-bold uppercase text-gray-400">Slot</div><div className="font-bold text-gray-900">{booking.startTime || "N/A"} – {booking.endTime || "N/A"}</div></div>
                                    <div><div className="text-[10px] font-bold uppercase text-gray-400">Payment</div><span onClick={(e) => { e.stopPropagation(); const newStatus = booking.paymentStatus === "Paid" ? "Pending" : "Paid"; handlePaymentSelect(booking, newStatus, e); }} className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border cursor-pointer hover:scale-105 transition-transform ${booking.paymentStatus === "Paid" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>{booking.paymentStatus || "Pending"}</span></div>
                                    <div><div className="text-[10px] font-bold uppercase text-gray-400">Total Fee</div><div className="text-sm font-extrabold text-blue-950">₹{totalFee}</div></div>
                                  </div>
                                  {(booking.referredByCustomer || booking.referredByDoctor) && (
                                    <div className="text-xs bg-indigo-50 p-2 rounded-lg border border-indigo-100 flex items-center gap-2 flex-wrap">
                                      <FaShareAlt className="text-indigo-600 text-xs" />
                                      {booking.referredByCustomer && <span className="font-medium text-gray-700">Customer: {booking.referredByCustomer}</span>}
                                      {booking.referredByCustomer && booking.referredByDoctor && <span className="text-gray-300">|</span>}
                                      {booking.referredByDoctor && <span className="font-medium text-gray-700">Doctor: {booking.referredByDoctor}</span>}
                                    </div>
                                  )}
                                  <div><div className="text-[10px] font-bold uppercase text-gray-400">Services</div>
                                    {hasServices ? (
                                      <div className="flex flex-wrap gap-1.5 mt-1">
                                        {items.map((svc, sIdx) => (
                                          <span key={sIdx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                            {svc.name} ₹{svc.price}
                                          </span>
                                        ))}
                                      </div>
                                    ) : <span className="text-xs text-gray-400 italic">No services added</span>}
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
              <div className="flex items-center justify-end px-6 py-4 border-t border-gray-200 bg-gray-50/50">
                <button onClick={() => { setShowPatientModal(false); setPatientBookings([]); setSelectedPatient(null); }} className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-200 hover:bg-gray-300 text-gray-700 transition-all">Close</button>
              </div>
            </div>
          </div>
        )}

        {/* ===== PRESCRIPTION MODAL ===== */}
        {showPrescriptionModal && selectedBookingForPrescription && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="relative max-w-[480px] w-full rounded-2xl overflow-hidden shadow-2xl bg-white max-h-[90vh] overflow-y-auto">
              
              <button 
                onClick={() => { 
                  setShowPrescriptionModal(false); 
                  setSelectedBookingForPrescription(null); 
                }} 
                className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-lg transition-all z-30"
              >
                <FaTimes className="w-4 h-4 text-gray-700" />
              </button>
              
              <div className="absolute top-2 left-2 flex gap-1.5 z-30">
                <button 
                  onClick={handlePrintPrescription} 
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold shadow-lg transition-all"
                >
                  <FaPrint className="w-3 h-3" /> Print
                </button>
                <button 
                  onClick={handlePrintPrescription} 
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold shadow-lg transition-all"
                >
                  <FaFilePdf className="w-3 h-3" /> PDF
                </button>
              </div>
              
              <div className="border-b border-gray-200 pb-2 mb-2">
                <div className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider py-1 bg-gray-50">
                  Front Side - Prescription
                </div>
                <div 
                  ref={prescriptionRef} 
                  className="relative w-full overflow-hidden"
                  style={{ 
                    transform: 'scale(0.75)', 
                    transformOrigin: 'top center',
                    width: '133.33%',
                    marginLeft: '-16.66%'
                  }}
                >
                  <img 
                    src={prescriptionTemplate} 
                    alt="Prescription Template - Front" 
                    className="w-full h-auto object-contain" 
                  />
                  
                  <div className="absolute inset-0 text-black" style={{ padding: 0 }}>
                    <div style={{ position: 'absolute', top: '78px', left: '90px', fontSize: '15px', fontWeight: '600', color: '#1a1a1a', letterSpacing: '0.2px', lineHeight: '1.3' }}>
                      {selectedBookingForPrescription?.patientTitle || ""} {selectedBookingForPrescription?.patientName || "N/A"}
                    </div>
                    <div style={{ position: 'absolute', top: '78px', right: '20px', fontSize: '15px', fontWeight: '600', color: '#1a1a1a', letterSpacing: '0.2px', lineHeight: '1.3' }}>
                      {formatDateToDDMMYYYY(selectedBookingForPrescription?.appointmentDate || selectedBookingForPrescription?.date)}
                    </div>
                    <div style={{ position: 'absolute', top: '104px', left: '90px', fontSize: '15px', fontWeight: '600', color: '#1a1a1a', letterSpacing: '0.2px', lineHeight: '1.3' }}>
                      {selectedBookingForPrescription?.patientAge || "N/A"}
                    </div>
                    <div style={{ position: 'absolute', top: '104px', left: '230px', fontSize: '15px', fontWeight: '600', color: '#1a1a1a', letterSpacing: '0.2px', lineHeight: '1.3' }}>
                      {selectedBookingForPrescription?.patientGender || "N/A"}
                    </div>
                    <div style={{ position: 'absolute', top: '104px', right: '100px', fontSize: '15px', fontWeight: '600', color: '#1a1a1a', letterSpacing: '0.2px', lineHeight: '1.3' }}>
                      {selectedBookingForPrescription?.patientPhone || "N/A"}
                    </div>
                    <div style={{ position: 'absolute', top: '130px', left: '90px', fontSize: '15px', fontWeight: '600', color: '#1a1a1a', letterSpacing: '0.2px', lineHeight: '1.3' }}>
                      {selectedBookingForPrescription?.purpose || selectedBookingForPrescription?.reason || "N/A"}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider py-1 bg-gray-50">
                  Back Side
                </div>
                <div 
                  className="relative w-full overflow-hidden"
                  style={{ 
                    transform: 'scale(0.75)', 
                    transformOrigin: 'top center',
                    width: '133.33%',
                    marginLeft: '-16.66%'
                  }}
                >
                  <img 
                    src={prescriptionBackTemplate} 
                    alt="Prescription Template - Back" 
                    className="w-full h-auto object-contain" 
                  />
                </div>
              </div>
              
              <div className="text-center text-[8px] text-gray-400 py-1 border-t border-gray-100">
                Scroll to view both sides
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
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/20"><FaFileInvoiceDollar className="w-5 h-5" /></div>
                  <div><h3 className="font-bold text-gray-900 text-base">Bill Cum Receipt</h3><p className="text-xs text-gray-500">{selectedBookingForBilling.patientName} • {billingData.invoiceNo}</p></div>
                </div>
                <button onClick={() => { setShowBillingModal(false); setSelectedBookingForBilling(null); }} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"><FaTimes className="w-4 h-4" /></button>
              </div>
              <div id="bill-content" className="p-6 md:p-8 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.04] pointer-events-none w-64 h-64"><img src={logo} alt={CLINIC_INFO.name} className="w-full h-full object-contain" /></div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between border-b-2 border-gray-800 pb-4 mb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-3"><img src={logo} alt={CLINIC_INFO.name} className="w-14 h-14 object-contain" /><div><h2 className="text-xl font-bold text-gray-900 tracking-wide">{CLINIC_INFO.name}</h2><p className="text-[11px] text-gray-500 max-w-sm">{CLINIC_INFO.address}</p></div></div>
                    <div className="text-right text-[11px] text-gray-500">Contact No : {CLINIC_INFO.contact}</div>
                  </div>
                  <div className="text-center bg-gray-100 border-y border-gray-300 py-1.5 mb-4"><span className="text-sm font-bold tracking-widest text-gray-800 uppercase">Bill Cum Receipt</span></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs mb-5">
                    <div><span className="font-bold text-gray-500 inline-block w-28">Name</span>: <span className="font-semibold text-gray-900">{selectedBookingForBilling?.patientTitle || ""} {selectedBookingForBilling?.patientName || "N/A"}</span></div>
                    <div><span className="font-bold text-gray-500 inline-block w-28">Invoice No / Date</span>: <span className="font-semibold text-gray-900">{billingData.invoiceNo} / {billingData.invoiceDate}</span></div>
                    <div><span className="font-bold text-gray-500 inline-block w-28">Age</span>: <span className="font-semibold text-gray-900">{selectedBookingForBilling?.patientAge || "N/A"} Yrs</span></div>
                    <div><span className="font-bold text-gray-500 inline-block w-28">Gender</span>: <span className="font-semibold text-gray-900">{selectedBookingForBilling?.patientGender || "N/A"}</span></div>
                    <div><span className="font-bold text-gray-500 inline-block w-28">Branch</span>: <span className="font-semibold text-gray-900">{billingData.branch}</span></div>
                    <div><span className="font-bold text-gray-500 inline-block w-28">Contact No</span>: <span className="font-semibold text-gray-900">{selectedBookingForBilling?.patientPhone || "N/A"}</span></div>
                    <div><span className="font-bold text-gray-500 inline-block w-28">Doctor</span>: <span className="font-semibold text-gray-900">{billingData.doctorName}</span></div>
                    <div><span className="font-bold text-gray-500 inline-block w-28">Appt. Date</span>: <span className="font-semibold text-gray-900">{formatDateToDDMMYYYY(selectedBookingForBilling?.date)}</span></div>
                  </div>
                  <table className="w-full mb-3 border-t-2 border-b-2 border-gray-800">
                    <thead><tr><th className="text-left py-1.5 text-[11px] font-bold text-gray-600 w-6">No.</th><th className="text-left py-1.5 text-[11px] font-bold text-gray-600 w-[28%]">Service / Item</th><th className="text-left py-1.5 text-[11px] font-bold text-gray-600 w-[16%]">Service Code</th><th className="text-left py-1.5 text-[11px] font-bold text-gray-600 w-[20%]">Remarks</th><th className="text-right py-1.5 text-[11px] font-bold text-gray-600 w-[14%]">Amount</th><th className="text-center py-1.5 text-[11px] font-bold text-gray-600 w-[16%]">Payment Status</th></tr></thead>
                    <tbody>
                      {billingData.items.map((item) => (
                        <tr key={item.no} className="border-b border-gray-100">
                          <td className="py-1.5 text-xs text-gray-700">{item.no}</td>
                          <td className="py-1.5 text-xs font-medium text-gray-800">{item.name}</td>
                          <td className="py-1.5 text-xs text-gray-600">{item.serviceCode}</td>
                          <td className="py-1.5 text-xs text-gray-500">{item.remarks}</td>
                          <td className="py-1.5 text-xs text-right font-semibold text-gray-800">₹{Number(item.amount).toFixed(2)}</td>
                          <td className="py-1.5 text-xs text-center"><span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${item.paymentStatus === "Paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{item.paymentStatus || "Pending"}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex flex-col items-end mb-3">
                    <div className="w-full max-w-xs text-xs">
                      <div className="flex justify-between py-1 border-b border-gray-200"><span className="text-gray-600">Gross Bill Amount</span><span className="font-bold text-gray-900">₹ {billingData.grossAmount.toFixed(2)}</span></div>
                      {billingData.grossAmount !== billingData.netAmount && (
                        <div className="flex justify-between py-1 border-b border-gray-200 text-emerald-600">
                          <span>Referral Discount ({selectedBookingForBilling?.referralCommissionType || 'Clinic'}: {selectedBookingForBilling?.referralCommission || 0}%)</span>
                          <span>-₹ {(billingData.grossAmount - billingData.netAmount).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between py-1 border-b border-gray-200"><span className="text-gray-600">Net Amount</span><span className="font-bold text-gray-900">₹ {billingData.netAmount.toFixed(2)}</span></div>
                      <div className="flex justify-between py-1 border-b border-gray-200"><span className="text-gray-600">Paid Amount</span><span className="font-bold text-emerald-700">₹ {billingData.paidAmount.toFixed(2)}</span></div>
                      <div className="flex justify-between py-1.5 mt-1 border-t-2 border-gray-800"><span className="font-bold text-gray-800">Balance to Pay</span><span className={`font-bold ${billingData.balanceAmount > 0 ? "text-red-600" : "text-emerald-700"}`}>₹ {billingData.balanceAmount.toFixed(2)}</span></div>
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
                {billingData.paymentStatus === "Pending" && <button onClick={handleMarkAsPaid} className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all flex items-center gap-1.5"><FaCheckCircle className="w-3.5 h-3.5" /> Mark as Paid</button>}
                <button onClick={printBill} className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all flex items-center gap-1.5"><FaPrint className="w-3.5 h-3.5" /> Print Bill</button>
                <button onClick={() => { setShowBillingModal(false); setSelectedBookingForBilling(null); }} className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-200 hover:bg-gray-300 text-gray-700 transition-all">Close</button>
              </div>
            </div>
          </div>
        )}

        {/* ===== STATUS UPDATE MODAL ===== */}
        {showStatusUpdateModal && selectedBookingForStatus && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5"><div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold"><FiCheckCircle className="w-5 h-5" /></div><div><h3 className="font-bold text-gray-900 text-base">Update Appointment Status</h3><p className="text-xs text-gray-500">{selectedBookingForStatus.patientName}</p></div></div>
                <button onClick={() => setShowStatusUpdateModal(false)} className="text-gray-400 hover:text-gray-600"><FaTimes className="w-4 h-4" /></button>
              </div>
              <div className="my-5 space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200"><div className="grid grid-cols-2 gap-3 text-xs"><div><div className="text-[10px] font-bold uppercase text-gray-400">Patient</div><div className="font-bold text-gray-900">{selectedBookingForStatus.patientName}</div></div><div><div className="text-[10px] font-bold uppercase text-gray-400">Current Status</div><span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${getStatusColors(selectedBookingForStatus.status).bg} ${getStatusColors(selectedBookingForStatus.status).text} ${getStatusColors(selectedBookingForStatus.status).border}`}>{selectedBookingForStatus.status || "confirmed"}</span></div></div></div>
                <div><label className="block text-xs font-bold uppercase text-gray-500 mb-2">Select New Status <span className="text-red-500">*</span></label><div className="grid grid-cols-2 gap-2">
                  {BOOKING_STATUS_OPTIONS.map((st) => {
                    const isSelected = newBookingStatus === st.value;
                    const colors = getStatusColors(st.value);
                    return <button key={st.value} onClick={() => setNewBookingStatus(st.value)} className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${isSelected ? `${colors.bg} ${colors.text} border-blue-500 shadow-xs ring-2 ring-blue-400/20` : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"}`}>{st.label}</button>;
                  })}
                </div></div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button onClick={() => setShowStatusUpdateModal(false)} className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all">Cancel</button>
                <button onClick={(e) => handleStatusSelect(selectedBookingForStatus, newBookingStatus, e)} disabled={statusUpdating} className="px-5 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all flex items-center gap-1.5">
                  {statusUpdating ? <FiRefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FaCheck className="w-3.5 h-3.5" />}
                  {statusUpdating ? "Updating..." : "Save Status"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== BOOKING PAYMENT UPDATE MODAL ===== */}
        {showPaymentUpdateModal && selectedBookingForPayment && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5"><div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold"><FaCreditCard className="w-4 h-4" /></div><div><h3 className="font-bold text-gray-900 text-base">Update Booking Payment Status</h3><p className="text-xs text-gray-500">{selectedBookingForPayment.patientName}</p></div></div>
                <button onClick={() => setShowPaymentUpdateModal(false)} className="text-gray-400 hover:text-gray-600"><FaTimes className="w-4 h-4" /></button>
              </div>
              <div className="my-5 space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200"><div className="grid grid-cols-2 gap-3 text-xs"><div><div className="text-[10px] font-bold uppercase text-gray-400">Patient</div><div className="font-bold text-gray-900">{selectedBookingForPayment.patientName}</div></div><div><div className="text-[10px] font-bold uppercase text-gray-400">Current Payment</div><span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${selectedBookingForPayment.paymentStatus === "Paid" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>{selectedBookingForPayment.paymentStatus || "Pending"}</span></div></div></div>
                <div><label className="block text-xs font-bold uppercase text-gray-500 mb-2">Select Payment Status <span className="text-red-500">*</span></label><div className="grid grid-cols-2 gap-3">
                  {PAYMENT_STATUS_OPTIONS.map((st) => {
                    const isSelected = newPaymentStatus === st.value;
                    return <button key={st.value} onClick={() => setNewPaymentStatus(st.value)} className={`px-4 py-2.5 rounded-lg text-xs font-bold border transition-all ${isSelected ? st.value === "Paid" ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-xs ring-2 ring-emerald-400/20" : "border-amber-500 bg-amber-50 text-amber-700 shadow-xs ring-2 ring-amber-400/20" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"}`}>{st.value === "Paid" ? <FaCheckCircle className="w-3.5 h-3.5 inline mr-1.5 text-emerald-600" /> : <FaClock className="w-3.5 h-3.5 inline mr-1.5 text-amber-600" />}{st.label}</button>;
                  })}
                </div></div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button onClick={() => setShowPaymentUpdateModal(false)} className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all">Cancel</button>
                <button onClick={(e) => handlePaymentSelect(selectedBookingForPayment, newPaymentStatus, e)} disabled={paymentUpdating} className="px-5 py-2 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition-all flex items-center gap-1.5">
                  {paymentUpdating ? <FiRefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FaCheck className="w-3.5 h-3.5" />}
                  {paymentUpdating ? "Updating..." : "Save Payment"}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}