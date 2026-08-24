import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import {
  Calendar,
  Clock,
  User,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Trash2,
  RefreshCw,
  Sparkles,
  Eye,
  Check,
  Phone,
  MapPin,
  FileText,
  Plus,
  Edit2,
  IndianRupee,
  CreditCard,
  Banknote,
  Printer,
  Download,
  Users,
  ChevronDown,
  X,
  History,
  Stethoscope,
  UserCheck,
  ReceiptText,
  CalendarDays,
  AlertCircle,
  PlusCircle,
  ChevronUp,
  Mail,
  Activity,
  Clipboard,
  Heart,
  Pill,
  Syringe,
  Scissors,
  Thermometer,
  Weight,
  Ruler,
  Clock as ClockIcon
} from "lucide-react";
import "./EmployeeDashboard.css";
import "./EmployeeLeaves.css";
import logo from "../Images/logo2.png";

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

const getDayNameFromDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'long' });
};

const getStatusColors = (status) => {
  const statusMap = {
    booked: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200" },
    completed: { bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-200" },
    consulting: { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-200" },
    cancelled: { bg: "bg-red-100", text: "text-red-800", border: "border-red-200" },
    pending: { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-200" },
    confirmed: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200" }
  };
  return statusMap[status?.toLowerCase()] || statusMap.booked;
};

const OpManagement = () => {
  // ===== STATES =====
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

  // ===== INLINE PAYMENT DROPDOWN (same as Bookings component) =====
  const [openPaymentDropdown, setOpenPaymentDropdown] = useState(null);

  const [existingPatient, setExistingPatient] = useState(null);
  const [showExistingPatientPopup, setShowExistingPatientPopup] = useState(false);
  const [searchingPatient, setSearchingPatient] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [feeTypeFilter, setFeeTypeFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  const [toast, setToast] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [patientBookings, setPatientBookings] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ===== BILLING STATE (same as Bookings component) =====
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [selectedBookingForBilling, setSelectedBookingForBilling] = useState(null);
  const [billingData, setBillingData] = useState({
    consultationFee: 0,
    serviceFees: [],
    totalAmount: 0,
    paidAmount: 0,
    dueAmount: 0,
    paymentStatus: "Pending",
    billDate: "",
    billNumber: "",
    items: []
  });

  const phoneInputRef = useRef(null);
  const nameInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // ===== TOAST =====
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ===== FETCH FUNCTIONS =====
  useEffect(() => {
    fetchPatients();
    fetchBookings();
    fetchDoctors();
    fetchAllSlots();
    fetchServices();
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, appointmentDate: today }));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.payment-dropdown')) {
        setOpenPaymentDropdown(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/patients`);
      if (res.data && res.data.success) {
        setPatients(res.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching patients:", err);
      showToast("Failed to fetch patient records", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/appointment-slots/getallbookings`);
      if (res && res.data && res.data.success) {
        const bookingsData = res.data.bookings || [];
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
            startTime24: slotDetails.startTime24 || b.startTime24 || "",
            endTime24: slotDetails.endTime24 || b.endTime24 || "",
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
            totalFee: b.totalFee || b.consultationFee || 300,
            servicesTotal: b.servicesTotal || 0,
            grandTotal: b.grandTotal || b.consultationFee || 300,
            isCompleted: b.isCompleted || false,
            isCancelled: b.isCancelled || false,
            isActive: b.isActive || true,
            billNumber: b.billNumber || "",
            billingDate: b.billingDate || null,
            consultationStarted: b.consultationStarted || false,
            consultationCompleted: b.consultationCompleted || false,
            cancelled: b.cancelled || false,
            cancellationReason: b.cancellationReason || "",
            completedAt: b.completedAt || null,
            followUpRequired: b.followUpRequired || false,
            followUpDate: b.followUpDate || "",
            followUpNotes: b.followUpNotes || "",
            checkInTime: b.checkInTime || null,
            checkOutTime: b.checkOutTime || null,
            waitingTime: b.waitingTime || 0,
            actualConsultationDuration: b.actualConsultationDuration || 0,
            notes: b.notes || "",
            clinicalNotes: b.clinicalNotes || "",
            diagnosis: b.diagnosis || "",
            prescription: b.prescription || "",
            labTestsOrdered: b.labTestsOrdered || [],
            imagingOrdered: b.imagingOrdered || [],
            referralToSpecialist: b.referralToSpecialist || "",
            isTelemedicine: b.isTelemedicine || false,
            telemedicinePlatform: b.telemedicinePlatform || "",
            telemedicineLink: b.telemedicineLink || "",
            reminderSent: b.reminderSent || false,
            reminderSentAt: b.reminderSentAt || null,
            smsSent: b.smsSent || false,
            emailSent: b.emailSent || false,
            patientRating: b.patientRating || null,
            patientFeedback: b.patientFeedback || "",
            discount: b.discount || 0,
            tax: b.tax || 0,
            paymentTransactionId: b.paymentTransactionId || "",
            referredBy: b.referredBy || "",
            insuranceProvider: b.insuranceProvider || "",
            insurancePolicyNumber: b.insurancePolicyNumber || "",
            bookedBy: b.bookedBy || "",
            updatedBy: b.updatedBy || "",
            createdBy: b.createdBy || ""
          };
        });
        setBookings(transformedBookings);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
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

  // ===== SLOT FILTER =====
  const filterSlotsByDoctorAndDate = (doctorId, date) => {
    if (!doctorId || !date) {
      setAvailableSlots([]);
      return;
    }
    setSlotsLoading(true);
    setAvailableSlots([]);
    setFormData(prev => ({ ...prev, slotId: "" }));
    try {
      const selectedDay = getDayNameFromDate(date);
      let filtered = allSlots.filter(slot => {
        const isSameDoctor = slot.doctorId === doctorId;
        const isSameDay = slot.dayOfWeek === selectedDay;
        const isNotBreak = slot.type !== 'break';
        return isSameDoctor && isSameDay && isNotBreak;
      });
      const seenTimes = new Set();
      filtered = filtered.filter(slot => {
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

  // ===== EXISTING PATIENT CHECK =====
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
      if (field === 'phone') {
        found = patients.find(p => p.phone === value);
      } else if (field === 'name') {
        const searchTerm = value.toLowerCase().trim();
        found = patients.find(p => p.name && p.name.toLowerCase().includes(searchTerm));
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
    setFormData(prev => ({
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

  // ===== INPUT HANDLERS =====
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'phone') checkExistingPatient(value, 'phone');
    else if (name === 'name') checkExistingPatient(value, 'name');
    if (name === 'doctorId' || name === 'appointmentDate') {
      const doctorId = name === 'doctorId' ? value : formData.doctorId;
      const date = name === 'appointmentDate' ? value : formData.appointmentDate;
      if (doctorId && date) filterSlotsByDoctorAndDate(doctorId, date);
      else setAvailableSlots([]);
    }
  };

  const handleSlotSelect = (slotId) => {
    setFormData((prev) => ({ ...prev, slotId }));
  };

  // ===== BOOK NOW =====
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
      showToast("Please select a slot for booking", "error");
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
        showToast(`✅ Appointment booked successfully for ${formData.name}!`, "success");
        fetchBookings();
        fetchAllSlots();
        filterSlotsByDoctorAndDate(formData.doctorId, formData.appointmentDate);
        const today = new Date().toISOString().split('T')[0];
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

  // ===== SERVICE FUNCTIONS =====
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
      showToast("Please select a booking and service", "error");
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
      const res = await axios.delete(`${API_BASE_URL}/services/deleteservicestobooking/${booking._id}/${serviceId}`);
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

  // ===== STATUS UPDATE =====
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

  // ===== PAYMENT UPDATE =====
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
        showToast(`Payment status updated to ${newPaymentStatus}!`, "success");
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

  // ===== INLINE PAYMENT UPDATE (NEW - like Bookings component) =====
  const handleInlinePaymentUpdate = async (bookingId, newPaymentStatus, patientName) => {
    try {
      // Update local state immediately for better UX
      setBookings((prev) =>
        prev.map((b) =>
          b._id === bookingId ? { ...b, paymentStatus: newPaymentStatus } : b
        )
      );

      // Update on server
      await axios.put(`${API_BASE_URL}/appointment-slots/${bookingId}`, {
        paymentStatus: newPaymentStatus
      });

      showToast(`Payment status updated to '${newPaymentStatus}' for ${patientName}!`, "success");
      setOpenPaymentDropdown(null);
      
      // Refresh data
      fetchPatients();
      refreshPatientBookings();
    } catch (error) {
      console.error("Error updating payment status:", error);
      showToast("Failed to update payment status. Please try again.", "error");
      fetchBookings(); // Revert on error
    }
  };

  // ===== REFRESH PATIENT BOOKINGS =====
  const refreshPatientBookings = () => {
    if (selectedPatient) {
      const updatedBookings = bookings.filter(b => 
        b.patientPhone === selectedPatient.phone || 
        (b.patientName && selectedPatient.name && b.patientName.toLowerCase() === selectedPatient.name.toLowerCase())
      );
      updatedBookings.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
      setPatientBookings(updatedBookings);
    }
  };

  // ===== PATIENT FUNCTIONS =====
  const handleEdit = (patient) => {
    const today = new Date().toISOString().split('T')[0];
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
      showToast("Patient record deleted", "info");
    } catch (err) {
      console.error("Error deleting:", err);
      showToast("Failed to delete patient record", "error");
    }
  };

  const cancelForm = () => {
    const today = new Date().toISOString().split('T')[0];
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

  const handleActionClick = (e) => {
    e.stopPropagation();
  };

  const fetchPatientData = async (patient) => {
    setHistoryLoading(true);
    setSelectedPatient(patient);
    try {
      const patientBookingsList = bookings.filter(b => 
        b.patientPhone === patient.phone || 
        (b.patientName && patient.name && b.patientName.toLowerCase() === patient.name.toLowerCase())
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

  // ===== BILLING FUNCTIONS (exact same as Bookings component) =====
  const getTotalServiceFee = (booking) => {
    if (!booking.services || booking.services.length === 0) return 0;
    return booking.services.reduce((sum, s) => sum + (s.price || 0), 0);
  };

  const getTotalBookingFee = (booking) => {
    return (booking.consultationFee || 0) + getTotalServiceFee(booking);
  };

  const openBillingModal = (booking) => {
    setSelectedBookingForBilling(booking);

    const consultationFee = booking.consultationFee || 0;
    const serviceFees = (booking.services || []).map(s => ({
      name: s.name,
      price: s.price || 0,
      paymentStatus: s.paymentStatus || "Pending"
    }));
    const totalServiceFee = getTotalServiceFee(booking);
    const totalAmount = consultationFee + totalServiceFee;
    const isPaid = booking.paymentStatus === "Paid";
    const paidAmount = isPaid ? totalAmount : 0;
    const dueAmount = isPaid ? 0 : totalAmount;

    const today = new Date();
    const billNumber = `BILL-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}-${String(booking._id).slice(-6)}`;

    const items = [
      {
        id: 'consultation',
        name: 'Consultation Fee',
        description: 'OPD Consultation',
        quantity: 1,
        unitPrice: consultationFee,
        total: consultationFee,
        type: 'consultation'
      },
      ...(booking.services || []).map((s, idx) => ({
        id: `service-${idx}`,
        name: s.name,
        description: s.description || 'Additional Service',
        quantity: 1,
        unitPrice: s.price || 0,
        total: s.price || 0,
        type: 'service',
        serviceId: s.serviceId || s._id
      }))
    ];

    setBillingData({
      consultationFee,
      serviceFees,
      totalAmount,
      paidAmount,
      dueAmount,
      paymentStatus: booking.paymentStatus || "Pending",
      billDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      billNumber,
      items
    });

    setShowBillingModal(true);
  };

  const handleMarkAsPaid = async () => {
    if (!selectedBookingForBilling) return;

    try {
      const res = await axios.put(`${API_BASE_URL}/appointment-slots/${selectedBookingForBilling._id}`, {
        paymentStatus: "Paid"
      });

      if (res && res.data && res.data.success) {
        setBookings((prev) =>
          prev.map((b) =>
            b._id === selectedBookingForBilling._id ? { ...b, paymentStatus: "Paid" } : b
          )
        );

        setBillingData(prev => ({
          ...prev,
          paymentStatus: "Paid",
          paidAmount: prev.totalAmount,
          dueAmount: 0
        }));

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
    const billContent = document.getElementById('bill-content');
    if (!billContent) return;

    const win = window.open('', '_blank', 'width=800,height=900');
    if (win) {
      win.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <title>Bill - ${billingData.billNumber}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: 'Times New Roman', Times, serif;
                background: #ffffff;
                padding: 40px;
                color: #222222;
              }
              .bill-container {
                max-width: 800px;
                margin: 0 auto;
                border: 1px solid #cccccc;
                padding: 40px;
              }
              .bill-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 2px solid #222222;
                padding-bottom: 20px;
                margin-bottom: 30px;
              }
              .bill-title {
                display: flex;
                align-items: center;
                gap: 15px;
              }
              .bill-title .logo {
                width: 50px;
                height: 50px;
                object-fit: contain;
              }
              .bill-title .title-group h1 {
                font-size: 28px;
                font-weight: normal;
                letter-spacing: 2px;
                color: #222222;
                margin: 0;
              }
              .bill-title .title-group .sub {
                font-size: 12px;
                color: #666666;
                letter-spacing: 1px;
              }
              .bill-number {
                text-align: right;
              }
              .bill-number .label {
                font-size: 11px;
                color: #888888;
                text-transform: uppercase;
                letter-spacing: 1px;
              }
              .bill-number .value {
                font-size: 18px;
                font-weight: bold;
                color: #222222;
              }
              .bill-number .date {
                font-size: 12px;
                color: #666666;
                margin-top: 4px;
              }
              .patient-info {
                display: flex;
                justify-content: space-between;
                margin-bottom: 30px;
                padding: 15px;
                background: #f8fafc;
                border-radius: 8px;
              }
              .patient-info .info-group {
                display: flex;
                flex-direction: column;
              }
              .patient-info .info-group .label {
                font-size: 10px;
                color: #888888;
                text-transform: uppercase;
                letter-spacing: 1px;
              }
              .patient-info .info-group .value {
                font-size: 14px;
                font-weight: bold;
                color: #222222;
                margin-top: 2px;
              }
              .table-section {
                margin: 20px 0;
              }
              .bill-table {
                width: 100%;
                border-collapse: collapse;
              }
              .bill-table th {
                text-align: left;
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #888888;
                border-bottom: 1px solid #dddddd;
                padding: 10px 0;
                font-weight: normal;
              }
              .bill-table td {
                padding: 12px 0;
                border-bottom: 1px solid #eeeeee;
                font-size: 14px;
                color: #333333;
              }
              .bill-table .text-right {
                text-align: right;
              }
              .totals-section {
                margin: 20px 0 10px 0;
                padding: 15px 0;
                border-top: 2px solid #222222;
                border-bottom: 2px solid #222222;
                display: flex;
                justify-content: flex-end;
              }
              .totals-section .total-box {
                text-align: right;
              }
              .totals-section .total-box .label {
                font-size: 14px;
                color: #666666;
                text-transform: uppercase;
                letter-spacing: 1px;
              }
              .totals-section .total-box .amount {
                font-size: 24px;
                font-weight: bold;
                color: #222222;
                margin-top: 2px;
              }
              .payment-status-section {
                display: flex;
                justify-content: space-between;
                padding: 15px 0;
                margin: 10px 0;
                border-top: 1px solid #eeeeee;
                border-bottom: 1px solid #eeeeee;
              }
              .payment-status-section .status-label {
                font-size: 12px;
                color: #666666;
                text-transform: uppercase;
                letter-spacing: 1px;
              }
              .payment-status-section .status-value {
                font-size: 14px;
                font-weight: bold;
                color: ${billingData.paymentStatus === 'Paid' ? '#166534' : '#b45309'};
              }
              .footer-section {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #dddddd;
                display: flex;
                justify-content: space-between;
                font-size: 11px;
                color: #888888;
              }
              .footer-section .thankyou {
                text-align: center;
                font-size: 13px;
                color: #666666;
                letter-spacing: 1px;
                width: 100%;
                margin-top: 10px;
              }
            </style>
          </head>
          <body>
            <div class="bill-container">
              <div class="bill-header">
                <div class="bill-title">
                  <img src="${logo}" alt="TimelyHealth" class="logo" />
                  <div class="title-group">
                    <h1>BILL</h1>
                    <div class="sub">TimelyHealth</div>
                  </div>
                </div>
                <div class="bill-number">
                  <div class="label">Bill Number</div>
                  <div class="value">${billingData.billNumber}</div>
                  <div class="date">${billingData.billDate}</div>
                </div>
              </div>

              <div class="patient-info">
                <div class="info-group">
                  <span class="label">Patient Name</span>
                  <span class="value">${selectedBookingForBilling?.patientName || 'N/A'}</span>
                </div>
                <div class="info-group">
                  <span class="label">Phone</span>
                  <span class="value">${selectedBookingForBilling?.patientPhone || 'N/A'}</span>
                </div>
                <div class="info-group">
                  <span class="label">Age / Gender</span>
                  <span class="value">${selectedBookingForBilling?.patientAge || 'N/A'} yrs / ${selectedBookingForBilling?.patientGender || 'N/A'}</span>
                </div>
                <div class="info-group">
                  <span class="label">Appointment Date</span>
                  <span class="value">${formatDateToDDMMYYYY(selectedBookingForBilling?.appointmentDate || selectedBookingForBilling?.date)}</span>
                </div>
              </div>

              <div class="table-section">
                <table class="bill-table">
                  <thead>
                    <tr>
                      <th style="width:50%;">Description</th>
                      <th style="width:20%;text-align:center;">Qty</th>
                      <th style="width:30%;text-align:right;">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${billingData.items.map(item => `
                      <tr>
                        <td>
                          ${item.name}
                          ${item.description && item.name !== 'Consultation Fee' ? `<div style="font-size:11px;color:#888888;">${item.description}</div>` : ''}
                        </td>
                        <td class="text-right">${item.quantity}</td>
                        <td class="text-right">₹ ${item.total.toFixed(2)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>

              <div class="totals-section">
                <div class="total-box">
                  <div class="label">Grand Total</div>
                  <div class="amount">₹ ${billingData.totalAmount.toFixed(2)}</div>
                </div>
              </div>

              <div class="payment-status-section">
                <span class="status-label">Payment Status</span>
                <span class="status-value">${billingData.paymentStatus}</span>
              </div>

              <div class="footer-section">
                <div class="thankyou">Thank you for your visit</div>
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

  // ===== FILTERS =====
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
    setFromDate("");
    setToDate("");
    setSelectedMonth("");
  };

  // ===== FILTERED PATIENTS =====
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      if (statusFilter !== "All" && p.paymentStatus !== statusFilter) return false;
      if (feeTypeFilter !== "All" && p.feeType !== feeTypeFilter) return false;

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
        } else if (selectedMonth) {
          const recordMonth = recordDate.toISOString().slice(0, 7);
          if (recordMonth !== selectedMonth) return false;
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
  }, [patients, statusFilter, feeTypeFilter, searchQuery, fromDate, toDate, selectedMonth]);

  // ===== STATS =====
  const stats = useMemo(() => {
    const total = filteredPatients.length;
    const paid = filteredPatients.filter((p) => p.paymentStatus === "Paid").length;
    const pending = filteredPatients.filter((p) => p.paymentStatus === "Pending").length;
    const totalRevenue = filteredPatients
      .filter((p) => p.paymentStatus === "Paid")
      .reduce((sum, p) => sum + (p.feeAmount || 0), 0);
    return { total, paid, pending, totalRevenue };
  }, [filteredPatients]);

  // ===== UTILITY =====
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
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

  const formatDateToDDMMYYYY = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      return "N/A";
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return "N/A";
    }
  };

  const isFilterActive = searchQuery || statusFilter !== "All" || feeTypeFilter !== "All" || fromDate || toDate || selectedMonth;

  // ===== DOWNLOAD CSV =====
  const downloadCSV = () => {
    if (filteredPatients.length === 0) {
      showToast("No patient records available to export!", "error");
      return;
    }
    const headers = [
      "#", "Patient ID", "Patient Name", "Age", "Gender", "Phone Number",
      "Address", "Fee Type", "Fee Amount (Rs)", "Payment Type", "Payment Status",
      "Reason for Consultation", "Registered Date", "Registered Time"
    ];
    const csvRows = [
      headers.join(","),
      ...filteredPatients.map((p, idx) => {
        const regDate = p.createdAt ? formatDate(p.createdAt) : "N/A";
        const regTime = p.createdAt ? formatTime(p.createdAt) : "N/A";
        return [
          idx + 1,
          `"${p._id}"`,
          `"${(p.name || "").replace(/"/g, '""')}"`,
          p.age ?? "",
          `"${p.gender || ""}"`,
          `"${p.phone || ""}"`,
          `"${(p.address || "").replace(/"/g, '""')}"`,
          `"${p.feeType === "lab" ? "Lab Fee" : "Consultation Fee"}"`,
          p.feeAmount ?? 300,
          `"${p.paymentType || "cash"}"`,
          `"${p.paymentStatus || "Pending"}"`,
          `"${(p.reason || "").replace(/"/g, '""')}"`,
          `"${regDate}"`,
          `"${regTime}"`
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

  // ===== RENDER =====
  return (
    <div className="emp-dash">
      <main className="p-2 sm:p-4 lg:p-6">
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
            <Sparkles className="w-5 h-5" />
            <span className="font-medium text-sm">{toast.message}</span>
          </div>
        )}

        {/* HEADER */}
        <div className="emp-dash__header">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap">
              OP <span>Management</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { fetchPatients(); fetchBookings(); fetchAllSlots(); fetchDoctors(); fetchServices(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
            <button
              onClick={() => {
                const today = new Date().toISOString().split('T')[0];
                setFormData({ ...EMPTY_FORM, appointmentDate: today });
                setEditingId(null);
                setShowForm(true);
                setAvailableSlots([]);
                setExistingPatient(null);
                setShowExistingPatientPopup(false);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-md"
            >
              <Plus className="w-3.5 h-3.5" /> Add Patient
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Patients</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="emp-dash__stat-value">{stats.total}</div>
            <div className="emp-dash__stat-meta">registered OPD</div>
          </div>
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Paid</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="emp-dash__stat-value text-emerald-600">{stats.paid}</div>
            <div className="emp-dash__stat-meta">completed payments</div>
          </div>
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Pending</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="emp-dash__stat-value text-amber-600">{stats.pending}</div>
            <div className="emp-dash__stat-meta">awaiting payment</div>
          </div>
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Revenue</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <div className="emp-dash__stat-value text-blue-700">₹{stats.totalRevenue.toLocaleString()}</div>
            <div className="emp-dash__stat-meta">collected revenue</div>
          </div>
        </div>

        {/* BOOKING FORM MODAL */}
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-gray-200 relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">
                      {editingId ? "Edit Patient Details" : "Register New Patient"}
                    </h3>
                    <p className="text-xs text-gray-500">Fill in patient details below</p>
                  </div>
                </div>
                <button onClick={cancelForm} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {showExistingPatientPopup && existingPatient && !editingId && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl shadow-sm">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-blue-800">Existing Patient Found!</p>
                      <div className="mt-1 text-xs text-blue-700 space-y-0.5">
                        <p><span className="font-semibold">Name:</span> {existingPatient.name}</p>
                        <p><span className="font-semibold">Phone:</span> {existingPatient.phone}</p>
                        <p><span className="font-semibold">Age:</span> {existingPatient.age} yrs | <span className="font-semibold">Gender:</span> {existingPatient.gender}</p>
                        {existingPatient.address && <p><span className="font-semibold">Address:</span> {existingPatient.address}</p>}
                      </div>
                      <button
                        type="button"
                        onClick={autoFillPatientDetails}
                        className="mt-2 px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Auto-Fill Details
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowExistingPatientPopup(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
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
                      <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        ref={nameInputRef}
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter patient name"
                        className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                        required
                      />
                    </div>
                    {searchingPatient && (
                      <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Searching...
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Age <span className="text-blue-600">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        placeholder="Enter age"
                        min="0"
                        max="120"
                        className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                    Gender <span className="text-blue-600">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium appearance-none"
                      required
                    >
                      <option value="">Select Gender</option>
                      {GENDER_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-2.5 pointer-events-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Phone Number <span className="text-blue-600">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
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
                    {editingId && (
                      <p className="text-[10px] text-blue-500 mt-1">Editing existing patient record</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Address
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Patient address"
                        className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                    Select Doctor <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Stethoscope className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <select
                      name="doctorId"
                      value={formData.doctorId}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium appearance-none"
                      required
                    >
                      <option value="">Select Doctor</option>
                      {doctors && doctors.length > 0 ? (
                        doctors.map((doc) => (
                          <option key={doc._id || doc.id} value={doc._id || doc.id}>
                            {doc.name || "Unnamed Doctor"} - {doc.specialization || "General"}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>No doctors available</option>
                      )}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-2.5 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                    Appointment Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <CalendarDays className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="date"
                      name="appointmentDate"
                      value={formData.appointmentDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                      required
                    />
                  </div>
                </div>

                {formData.doctorId && formData.appointmentDate && (
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Select Available Slot <span className="text-red-500">*</span>
                    </label>
                    {slotsLoading ? (
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Loading slots...
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                        No slots available for this doctor on {formData.appointmentDate ? new Date(formData.appointmentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'selected date'} ({getDayNameFromDate(formData.appointmentDate)}). 
                        Please try another doctor or date.
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                          {availableSlots.map((slot) => {
                            const isSelected = formData.slotId === slot._id;
                            const isBooked = slot.status === 'booked';
                            return (
                              <button
                                key={slot._id}
                                type="button"
                                onClick={() => !isBooked && handleSlotSelect(slot._id)}
                                className={`relative px-3 py-2 text-xs font-semibold rounded-lg border-2 transition-all ${
                                  isSelected
                                    ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md ring-2 ring-blue-200"
                                    : isBooked
                                    ? "border-red-300 bg-red-50 text-red-500 cursor-not-allowed opacity-60"
                                    : "border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50"
                                }`}
                                disabled={isBooked}
                              >
                                {isSelected && !isBooked && (
                                  <div className="absolute -top-2 -right-2 bg-blue-500 rounded-full p-0.5 shadow-lg">
                                    <Check className="w-3.5 h-3.5 text-white" />
                                  </div>
                                )}
                                <div className={`font-bold ${isSelected ? 'text-blue-700' : isBooked ? 'text-red-500' : 'text-gray-700'}`}>
                                  {slot.startTime} – {slot.endTime}
                                </div>
                                <div className="text-[9px] text-gray-400">{slot.dayOfWeek}</div>
                                <div className="text-[8px] font-bold text-emerald-600 mt-0.5">
                                  ₹{slot.consultationFee || 300}
                                </div>
                                {isBooked && (
                                  <div className="mt-1 text-[8px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full border border-red-300">
                                    🔒 Booked
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                        {formData.slotId && (
                          <div className="mt-2 text-xs text-emerald-600 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Slot selected successfully!</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Fee Type <span className="text-blue-600">*</span>
                    </label>
                    <div className="relative">
                      <FileText className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                      <select
                        name="feeType"
                        value={formData.feeType}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium appearance-none"
                      >
                        {FEE_TYPE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-2.5 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Fee Amount (₹) <span className="text-blue-600">*</span>
                    </label>
                    <div className="relative">
                      <IndianRupee className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="number"
                        name="feeAmount"
                        value={formData.feeAmount}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Payment Type <span className="text-blue-600">*</span>
                    </label>
                    <div className="flex gap-3">
                      {PAYMENT_TYPE_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, paymentType: opt.value }))}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${
                            formData.paymentType === opt.value
                              ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                          }`}
                        >
                          {opt.value === "cash" ? <Banknote className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Payment Status
                    </label>
                    <div className="flex gap-3">
                      {PAYMENT_STATUS_OPTIONS.map((st) => (
                        <button
                          key={st.value}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, paymentStatus: st.value }))}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${
                            formData.paymentStatus === st.value
                              ? st.value === "Paid"
                                ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                                : "border-amber-500 bg-amber-50 text-amber-700 shadow-sm"
                              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                          }`}
                        >
                          {st.value === "Paid" ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                    Reason for Consultation
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <textarea
                      name="reason"
                      value={formData.reason}
                      onChange={handleInputChange}
                      placeholder="Brief description of the consultation reason..."
                      rows={3}
                      className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium resize-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={cancelForm}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !formData.slotId || !formData.doctorId}
                    className="px-6 py-2.5 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Calendar className="w-4 h-4" />
                    )}
                    {submitting ? "Booking..." : "📅 Book Now"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* FILTERS */}
        <div className="emp-dash__card mb-6">
          <div className="flex items-center justify-between gap-3 p-3 bg-white rounded-xl border border-gray-200 flex-wrap">
            <div className="flex items-center gap-2.5 flex-1 min-w-0 flex-wrap">
              <div className="relative min-w-[150px] flex-1 max-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs w-3.5 h-3.5" />
                <input
                  type="text"
                  placeholder="Search name, phone, address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                />
              </div>
              <div className="flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-gray-300 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
              <div className="flex items-center gap-1">
                <select
                  value={feeTypeFilter}
                  onChange={(e) => setFeeTypeFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-gray-300 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="All">All Fee Types</option>
                  <option value="consultation">Consultation</option>
                  <option value="lab">Lab</option>
                </select>
              </div>
              <div className="relative">
                <input
                  type="date"
                  value={fromDate}
                  onChange={handleFromDateChange}
                  className="w-[120px] h-8 px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                />
              </div>
              <div className="relative">
                <input
                  type="date"
                  value={toDate}
                  onChange={handleToDateChange}
                  className="w-[120px] h-8 px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                />
              </div>
              <div className="relative">
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={handleMonthChange}
                  className="w-[130px] h-8 px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-semibold"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {isFilterActive && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm whitespace-nowrap"
                >
                  <Trash2 className="w-3 h-3 text-red-500" />
                  Clear
                </button>
              )}
              <button
                onClick={downloadCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all shadow-md whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* PATIENTS TABLE */}
        <div className="emp-dash__card">
          {loading ? (
            <div className="py-12 text-center text-gray-500">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">Loading patient records...</p>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-700">No Patient Records Found</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto mb-3">
                {patients.length === 0
                  ? "Click 'Add Patient' to register a new patient."
                  : "No records match your current date/search filters."}
              </p>
              {isFilterActive && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="emp-dash__table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Patient Name & Info</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Fee Type & Amount</th>
                    <th>Payment Type</th>
                    <th>Payment Status</th>
                    <th>Reason</th>
                    <th>Date</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient, idx) => {
                    const isPaid = patient.paymentStatus === "Paid";
                    const patientBookingCount = bookings.filter(b => 
                      b.patientPhone === patient.phone || 
                      (b.patientName && patient.name && b.patientName.toLowerCase() === patient.name.toLowerCase())
                    ).length;
                    
                    return (
                      <tr 
                        key={patient._id} 
                        className="transition-colors hover:bg-blue-50/50 cursor-pointer group"
                        onClick={() => handleRowClick(patient)}
                      >
                        <td className="px-3 py-3 font-semibold text-gray-400 text-[11px]">{idx + 1}</td>
                        <td className="px-3 py-3">
                          <div className="font-semibold text-slate-800 text-xs">{patient.name || "N/A"}</div>
                          {patient.phone && (
                            <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-gray-400" /> {patient.phone}
                            </div>
                          )}
                          {patient.address && (
                            <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5 truncate max-w-[200px]" title={patient.address}>
                              <MapPin className="w-3 h-3" /> {patient.address}
                            </div>
                          )}
                          {patientBookingCount > 0 && (
                            <div className="text-[10px] text-blue-500 font-medium mt-0.5">
                              📋 {patientBookingCount} booking{patientBookingCount > 1 ? 's' : ''}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-3 font-medium text-slate-800 text-xs">{patient.age ?? "N/A"} Yrs</td>
                        <td className="px-3 py-3 font-medium text-slate-700 text-xs capitalize">{patient.gender || "N/A"}</td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              patient.feeType === "lab"
                                ? "bg-purple-100 text-purple-800 border border-purple-200"
                                : "bg-blue-100 text-blue-800 border border-blue-200"
                            }`}
                          >
                            {patient.feeType === "lab" ? "Lab" : "Consult"}
                          </span>
                          <div className="font-bold text-slate-800 text-xs mt-0.5">
                            ₹{patient.feeAmount ?? 300}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 capitalize">
                            {patient.paymentType === "online" ? (
                              <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
                            ) : (
                              <Banknote className="w-3.5 h-3.5 text-green-600" />
                            )}
                            {patient.paymentType || "cash"}
                          </span>
                        </td>
                        <td className="px-3 py-3 payment-dropdown" onClick={handleActionClick}>
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenPaymentDropdown(openPaymentDropdown === patient._id ? null : patient._id);
                              }}
                              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider w-fit transition-all hover:scale-105 ${
                                isPaid
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200"
                                  : "bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200"
                              }`}
                            >
                              {isPaid ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-amber-600" />}
                              {patient.paymentStatus || "Pending"}
                              <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
                            </button>

                            {openPaymentDropdown === patient._id && (
                              <div className="absolute left-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Find the booking for this patient to update payment
                                    const booking = bookings.find(b => 
                                      b.patientPhone === patient.phone || 
                                      (b.patientName && patient.name && b.patientName.toLowerCase() === patient.name.toLowerCase())
                                    );
                                    if (booking) {
                                      handleInlinePaymentUpdate(booking._id, "Paid", patient.name);
                                    } else {
                                      showToast("No booking found for this patient", "error");
                                    }
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-emerald-50 text-emerald-700 font-medium flex items-center gap-2 transition-colors"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  Paid
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const booking = bookings.find(b => 
                                      b.patientPhone === patient.phone || 
                                      (b.patientName && patient.name && b.patientName.toLowerCase() === patient.name.toLowerCase())
                                    );
                                    if (booking) {
                                      handleInlinePaymentUpdate(booking._id, "Pending", patient.name);
                                    } else {
                                      showToast("No booking found for this patient", "error");
                                    }
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-amber-50 text-amber-700 font-medium flex items-center gap-2 transition-colors"
                                >
                                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                                  Pending
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3 max-w-[180px]">
                          <div className="truncate text-xs text-slate-700 font-medium" title={patient.reason}>
                            {patient.reason || "General Consultation"}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="font-medium text-slate-800 text-[11px]">{formatDate(patient.createdAt)}</div>
                          <div className="text-[10px] text-gray-400">{formatTime(patient.createdAt)}</div>
                        </td>
                        <td className="px-3 py-3 text-right" onClick={handleActionClick}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRowClick(patient);
                              }}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(patient);
                              }}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(patient._id);
                              }}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            {patientBookingCount > 0 && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const booking = bookings.find(b => 
                                      b.patientPhone === patient.phone || 
                                      (b.patientName && patient.name && b.patientName.toLowerCase() === patient.name.toLowerCase())
                                    );
                                    if (booking) {
                                      openBillingModal(booking);
                                    } else {
                                      showToast("No booking found for billing", "error");
                                    }
                                  }}
                                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                  title="View Bill"
                                >
                                  <ReceiptText className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const booking = bookings.find(b => 
                                      b.patientPhone === patient.phone || 
                                      (b.patientName && patient.name && b.patientName.toLowerCase() === patient.name.toLowerCase())
                                    );
                                    if (booking) {
                                      openPaymentUpdateModal(booking);
                                    } else {
                                      showToast("No booking found for payment update", "error");
                                    }
                                  }}
                                  className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                  title="Update Payment"
                                >
                                  <CreditCard className="w-4 h-4" />
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
              <div className="mt-2 text-xs text-gray-400 flex items-center gap-2 px-3 py-2 border-t border-gray-100">
                <span className="text-blue-500">💡 Tip:</span>
                <span>Click anywhere on a row or the 👁️ icon to view complete patient details with all bookings</span>
              </div>
            </div>
          )}
        </div>

        {/* ===== PATIENT DETAIL MODAL ===== */}
        {showPatientModal && selectedPatient && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-2xl border border-gray-200">
              <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Patient Details</h3>
                    <p className="text-xs text-gray-500">
                      {selectedPatient.name} • {selectedPatient.phone}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {patientBookings.length} Bookings
                  </span>
                  <button 
                    onClick={() => {
                      setShowPatientModal(false);
                      setPatientBookings([]);
                      setSelectedPatient(null);
                    }} 
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {historyLoading ? (
                  <div className="py-12 text-center text-gray-500">
                    <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-500">Loading patient data...</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-[10px] font-bold uppercase text-gray-400">Name</div>
                          <div className="text-sm font-bold text-gray-900">{selectedPatient.name}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase text-gray-400">Phone</div>
                          <div className="text-sm font-bold text-gray-900">{selectedPatient.phone}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase text-gray-400">Age</div>
                          <div className="text-sm font-bold text-gray-900">{selectedPatient.age} yrs</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase text-gray-400">Gender</div>
                          <div className="text-sm font-bold text-gray-900 capitalize">{selectedPatient.gender}</div>
                        </div>
                      </div>
                      {selectedPatient.address && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <div className="text-[10px] font-bold uppercase text-gray-400">Address</div>
                          <div className="text-sm text-gray-700">{selectedPatient.address}</div>
                        </div>
                      )}
                      {selectedPatient.reason && (
                        <div className="mt-1">
                          <div className="text-[10px] font-bold uppercase text-gray-400">Reason</div>
                          <div className="text-sm text-gray-700">{selectedPatient.reason}</div>
                        </div>
                      )}
                      <div className="mt-2 pt-2 border-t border-gray-200 grid grid-cols-3 gap-2">
                        <div>
                          <div className="text-[10px] font-bold uppercase text-gray-400">Fee Type</div>
                          <div className="text-sm font-bold text-gray-900 capitalize">{selectedPatient.feeType || "Consultation"}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase text-gray-400">Fee Amount</div>
                          <div className="text-sm font-bold text-emerald-700">₹{selectedPatient.feeAmount || 300}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase text-gray-400">Payment Status</div>
                          <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${selectedPatient.paymentStatus === "Paid" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                            {selectedPatient.paymentStatus || "Pending"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-4 h-4 text-amber-600" />
                        <h4 className="font-bold text-amber-800 text-sm">All Bookings ({patientBookings.length})</h4>
                      </div>
                      {patientBookings.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-sm bg-gray-50 rounded-lg">
                          No bookings found for this patient
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {patientBookings.map((booking, idx) => {
                            const hasServices = booking.services && booking.services.length > 0;
                            const totalFee = getTotalBookingFee(booking);
                            const statusColors = getStatusColors(booking.status);
                            
                            return (
                              <div key={booking._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <div className={`px-4 py-3 ${statusColors.bg} border-b ${statusColors.border} flex items-center justify-between flex-wrap gap-2`}>
                                  <div className="flex items-center gap-3">
                                    <span className="font-bold text-gray-500 text-xs">#{idx + 1}</span>
                                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase ${statusColors.text} ${statusColors.bg} border ${statusColors.border}`}>
                                      {booking.status || "confirmed"}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {formatDateToDDMMYYYY(booking.appointmentDate || booking.date)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openStatusUpdateModal(booking);
                                      }}
                                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                      title="Update Status"
                                    >
                                      <CheckCircle2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openPaymentUpdateModal(booking);
                                      }}
                                      className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                      title="Update Payment"
                                    >
                                      <CreditCard className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openAddServiceModal(booking);
                                      }}
                                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                      title="Add Service"
                                    >
                                      <PlusCircle className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openBillingModal(booking);
                                      }}
                                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                      title="View Bill"
                                    >
                                      <ReceiptText className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>

                                <div className="p-4 space-y-3">
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div>
                                      <div className="text-[10px] font-bold uppercase text-gray-400">Doctor</div>
                                      <div className="text-sm font-bold text-gray-900">{booking.doctorName || "N/A"}</div>
                                      <div className="text-[10px] text-gray-500">{booking.doctorSpecialization || ""}</div>
                                    </div>
                                    <div>
                                      <div className="text-[10px] font-bold uppercase text-gray-400">Date</div>
                                      <div className="text-sm font-bold text-gray-900">{formatDateToDDMMYYYY(booking.appointmentDate || booking.date)}</div>
                                      <div className="text-[10px] text-gray-500">{booking.dayOfWeek || ""}</div>
                                    </div>
                                    <div>
                                      <div className="text-[10px] font-bold uppercase text-gray-400">Time</div>
                                      <div className="text-sm font-bold text-gray-900">{booking.startTime || "N/A"} – {booking.endTime || "N/A"}</div>
                                      <div className="text-[10px] text-gray-500">{booking.shift || ""}</div>
                                    </div>
                                    <div>
                                      <div className="text-[10px] font-bold uppercase text-gray-400">Payment</div>
                                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${booking.paymentStatus === "Paid" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                                        {booking.paymentStatus || "Pending"}
                                      </span>
                                      <div className="text-sm font-bold text-gray-900 mt-0.5">₹{totalFee}</div>
                                    </div>
                                  </div>

                                  {booking.purpose && (
                                    <div className="bg-gray-50 p-2 rounded-lg">
                                      <div className="text-[10px] font-bold uppercase text-gray-400">Purpose</div>
                                      <div className="text-sm text-gray-700">{booking.purpose}</div>
                                    </div>
                                  )}

                                  <div>
                                    <div className="text-[10px] font-bold uppercase text-gray-400">Services</div>
                                    {hasServices ? (
                                      <div className="flex flex-wrap gap-1.5 mt-1">
                                        {booking.services.map((svc, sIdx) => (
                                          <span key={sIdx} className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                            {svc.name} <span className="text-[10px] font-bold text-emerald-700">₹{svc.price}</span>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                const serviceId = svc.serviceId || svc._id;
                                                if (serviceId) handleRemoveService(booking, serviceId, svc.name);
                                              }}
                                              className="ml-0.5 text-red-500 hover:text-red-700"
                                            >
                                              <XCircle className="w-3 h-3" />
                                            </button>
                                          </span>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-xs text-gray-400 italic">No services added</span>
                                    )}
                                  </div>

                                  <div className="grid grid-cols-3 gap-2 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                                    <div>
                                      <div className="text-[9px] font-bold uppercase text-gray-400">Consultation</div>
                                      <div className="text-sm font-bold text-gray-900">₹{booking.consultationFee || 300}</div>
                                    </div>
                                    <div>
                                      <div className="text-[9px] font-bold uppercase text-gray-400">Services</div>
                                      <div className="text-sm font-bold text-gray-900">₹{getTotalServiceFee(booking)}</div>
                                    </div>
                                    <div>
                                      <div className="text-[9px] font-bold uppercase text-gray-400">Grand Total</div>
                                      <div className="text-base font-bold text-emerald-700">₹{totalFee}</div>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs bg-gray-50 p-2 rounded-lg border border-gray-200">
                                    {booking.appointmentType && (
                                      <div>
                                        <span className="text-gray-400">Type</span>
                                        <div className="font-medium text-gray-700 capitalize">{booking.appointmentType}</div>
                                      </div>
                                    )}
                                    {booking.priority && (
                                      <div>
                                        <span className="text-gray-400">Priority</span>
                                        <div className={`font-medium ${booking.priority === "Urgent" ? "text-red-600" : "text-gray-700"}`}>{booking.priority}</div>
                                      </div>
                                    )}
                                    {booking.patientEmail && (
                                      <div>
                                        <span className="text-gray-400">Email</span>
                                        <div className="font-medium text-gray-700 truncate">{booking.patientEmail}</div>
                                      </div>
                                    )}
                                    {booking.patientBloodGroup && (
                                      <div>
                                        <span className="text-gray-400">Blood Group</span>
                                        <div className="font-medium text-red-700">{booking.patientBloodGroup}</div>
                                      </div>
                                    )}
                                    {booking.billNumber && (
                                      <div>
                                        <span className="text-gray-400">Bill</span>
                                        <div className="font-medium text-gray-700">{booking.billNumber}</div>
                                      </div>
                                    )}
                                    <div>
                                      <span className="text-gray-400">Booked At</span>
                                      <div className="font-medium text-gray-700">{formatDateTime(booking.bookedAt || booking.createdAt)}</div>
                                    </div>
                                    {booking.completedAt && (
                                      <div>
                                        <span className="text-gray-400">Completed At</span>
                                        <div className="font-medium text-gray-700">{formatDateTime(booking.completedAt)}</div>
                                      </div>
                                    )}
                                    {booking.referralToSpecialist && (
                                      <div>
                                        <span className="text-gray-400">Referred To</span>
                                        <div className="font-medium text-orange-700">{booking.referralToSpecialist}</div>
                                      </div>
                                    )}
                                  </div>

                                  {(booking.diagnosis || booking.prescription || booking.notes || booking.clinicalNotes) && (
                                    <div className="bg-green-50 p-2.5 rounded-lg border border-green-200">
                                      <div className="text-[10px] font-bold uppercase text-green-600 mb-1">Clinical Details</div>
                                      <div className="space-y-0.5 text-sm">
                                        {booking.diagnosis && <div><span className="text-gray-500">Diagnosis:</span> {booking.diagnosis}</div>}
                                        {booking.prescription && <div><span className="text-gray-500">Prescription:</span> {booking.prescription}</div>}
                                        {booking.notes && <div><span className="text-gray-500">Notes:</span> {booking.notes}</div>}
                                        {booking.clinicalNotes && <div><span className="text-gray-500">Clinical Notes:</span> {booking.clinicalNotes}</div>}
                                      </div>
                                    </div>
                                  )}

                                  {(booking.labTestsOrdered?.length > 0 || booking.imagingOrdered?.length > 0) && (
                                    <div className="bg-purple-50 p-2.5 rounded-lg border border-purple-200">
                                      <div className="text-[10px] font-bold uppercase text-purple-600 mb-1">Tests & Imaging</div>
                                      <div className="flex flex-wrap gap-1 text-xs">
                                        {booking.labTestsOrdered?.map((test, idx) => (
                                          <span key={idx} className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">🧪 {test}</span>
                                        ))}
                                        {booking.imagingOrdered?.map((img, idx) => (
                                          <span key={idx} className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">📷 {img}</span>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {booking.followUpRequired && (
                                    <div className="bg-orange-50 p-2.5 rounded-lg border border-orange-200">
                                      <div className="text-[10px] font-bold uppercase text-orange-600">Follow-up Required</div>
                                      <div className="text-sm text-gray-700">
                                        {booking.followUpDate && <span>Date: {formatDateToDDMMYYYY(booking.followUpDate)}</span>}
                                        {booking.followUpNotes && <span className="ml-2">Notes: {booking.followUpNotes}</span>}
                                      </div>
                                    </div>
                                  )}

                                  {booking.patientFeedback && (
                                    <div className="bg-yellow-50 p-2.5 rounded-lg border border-yellow-200">
                                      <div className="text-[10px] font-bold uppercase text-yellow-600">Patient Feedback</div>
                                      <div className="text-sm text-gray-700">
                                        {booking.patientFeedback}
                                        {booking.patientRating && <span className="ml-2 font-bold text-yellow-600">⭐{booking.patientRating}/5</span>}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 text-xs text-gray-500">
                      <span className="text-gray-400">Total Bookings: {patientBookings.length}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== BILLING MODAL ===== */}
        {showBillingModal && selectedBookingForBilling && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-gray-200 relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                    <ReceiptText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Patient Bill</h3>
                    <p className="text-xs text-gray-500">
                      {selectedBookingForBilling.patientName} • {billingData.billNumber}
                    </p>
                  </div>
                </div>
                <button onClick={() => { setShowBillingModal(false); setSelectedBookingForBilling(null); }} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div id="bill-content" className="mt-5">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <div className="text-[10px] font-bold uppercase text-gray-400">Patient Name</div>
                      <div className="text-sm font-bold text-gray-900">{selectedBookingForBilling.patientName || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-gray-400">Phone</div>
                      <div className="text-sm font-bold text-gray-900">{selectedBookingForBilling.patientPhone || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-gray-400">Age / Gender</div>
                      <div className="text-sm font-bold text-gray-900">
                        {selectedBookingForBilling.patientAge || "N/A"} yrs / {selectedBookingForBilling.patientGender || "N/A"}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-gray-400">Appointment Date</div>
                      <div className="text-sm font-bold text-gray-900">
                        {formatDateToDDMMYYYY(selectedBookingForBilling.appointmentDate || selectedBookingForBilling.date)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto mb-4">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-2 text-[11px] font-bold uppercase text-gray-500">Description</th>
                        <th className="text-center py-2 text-[11px] font-bold uppercase text-gray-500">Qty</th>
                        <th className="text-right py-2 text-[11px] font-bold uppercase text-gray-500">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billingData.items.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="py-2.5 text-sm font-medium text-gray-800">
                            {item.name}
                            {item.description && item.name !== 'Consultation Fee' && (
                              <div className="text-[11px] text-gray-400">{item.description}</div>
                            )}
                          </td>
                          <td className="py-2.5 text-sm text-center text-gray-700">{item.quantity}</td>
                          <td className="py-2.5 text-sm text-right font-medium text-gray-800">₹{item.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="border-t-2 border-gray-300 pt-4">
                  <div className="flex justify-end">
                    <div className="w-64">
                      <div className="flex justify-between py-1.5">
                        <span className="text-sm text-gray-600">Sub Total</span>
                        <span className="text-sm font-bold text-gray-800">₹{billingData.totalAmount}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-t border-gray-200">
                        <span className="text-base font-bold text-gray-800">Grand Total</span>
                        <span className="text-base font-bold text-emerald-700">₹{billingData.totalAmount}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-t border-gray-200 mt-1">
                        <span className="text-sm text-gray-600">Payment Status</span>
                        <span className={`text-sm font-bold ${billingData.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {billingData.paymentStatus}
                        </span>
                      </div>
                      {billingData.paymentStatus === "Pending" && (
                        <div className="flex justify-between py-1.5">
                          <span className="text-sm text-gray-600">Due Amount</span>
                          <span className="text-sm font-bold text-red-600">₹{billingData.dueAmount}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                  {billingData.paymentStatus === "Pending" && (
                    <button
                      onClick={handleMarkAsPaid}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Mark as Paid
                    </button>
                  )}
                  <button
                    onClick={printBill}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Printer className="w-4 h-4" /> Print Bill
                  </button>
                  <button
                    onClick={() => { setShowBillingModal(false); setSelectedBookingForBilling(null); }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== STATUS UPDATE MODAL ===== */}
        {showStatusUpdateModal && selectedBookingForStatus && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Update Booking Status</h3>
                    <p className="text-xs text-gray-500">
                      {selectedBookingForStatus.patientName} • {selectedBookingForStatus.dayOfWeek}
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowStatusUpdateModal(false)} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="my-5 space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-[10px] font-bold uppercase text-gray-400">Patient</div>
                      <div className="text-sm font-bold text-gray-900">{selectedBookingForStatus.patientName}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-gray-400">Current Status</div>
                      <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${getStatusColors(selectedBookingForStatus.status).bg} ${getStatusColors(selectedBookingForStatus.status).text} border ${getStatusColors(selectedBookingForStatus.status).border}`}>
                        {selectedBookingForStatus.status || "confirmed"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Select New Status <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-2 gap-2">
                    {BOOKING_STATUS_OPTIONS.map((st) => {
                      const isSelected = newBookingStatus === st.value;
                      const colors = getStatusColors(st.value);
                      return (
                        <button
                          key={st.value}
                          onClick={() => setNewBookingStatus(st.value)}
                          className={`px-3 py-2.5 rounded-lg text-xs font-bold border-2 transition-all ${isSelected ? `${colors.bg} ${colors.text} border-${colors.text} shadow-sm` : "border-gray-300 bg-white text-gray-600 hover:border-gray-400 hover:bg-gray-50"}`}
                        >
                          {st.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button onClick={() => setShowStatusUpdateModal(false)} className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all">
                  Cancel
                </button>
                <button onClick={handleStatusUpdate} disabled={statusUpdating || !newBookingStatus || newBookingStatus === selectedBookingForStatus.status} className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all flex items-center gap-1.5 ${statusUpdating || !newBookingStatus || newBookingStatus === selectedBookingForStatus.status ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}>
                  {statusUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {statusUpdating ? "Updating..." : "Update Status"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== PAYMENT UPDATE MODAL ===== */}
        {showPaymentUpdateModal && selectedBookingForPayment && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Update Payment Status</h3>
                    <p className="text-xs text-gray-500">
                      {selectedBookingForPayment.patientName} • {selectedBookingForPayment.dayOfWeek}
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowPaymentUpdateModal(false)} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="my-5 space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-[10px] font-bold uppercase text-gray-400">Patient</div>
                      <div className="text-sm font-bold text-gray-900">{selectedBookingForPayment.patientName}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-gray-400">Total Fee</div>
                      <div className="text-sm font-bold text-emerald-700">₹{getTotalBookingFee(selectedBookingForPayment)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-gray-400">Current Payment</div>
                      <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${selectedBookingForPayment.paymentStatus === "Paid" ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-amber-100 text-amber-900 border-amber-300"}`}>
                        {selectedBookingForPayment.paymentStatus || "Pending"}
                      </span>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-gray-400">Due Amount</div>
                      <div className="text-sm font-bold text-red-600">
                        ₹{selectedBookingForPayment.paymentStatus === "Paid" ? 0 : getTotalBookingFee(selectedBookingForPayment)}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Select Payment Status <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-2 gap-3">
                    {PAYMENT_STATUS_OPTIONS.map((st) => {
                      const isSelected = newPaymentStatus === st.value;
                      return (
                        <button
                          key={st.value}
                          onClick={() => setNewPaymentStatus(st.value)}
                          className={`px-4 py-2.5 rounded-lg text-sm font-bold border-2 transition-all ${isSelected ? st.value === "Paid" ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm" : "border-amber-500 bg-amber-50 text-amber-700 shadow-sm" : "border-gray-300 bg-white text-gray-600 hover:border-gray-400 hover:bg-gray-50"}`}
                        >
                          {st.value === "Paid" ? <CheckCircle2 className="w-4 h-4 inline mr-1 text-emerald-600" /> : <Clock className="w-4 h-4 inline mr-1 text-amber-600" />}
                          {st.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button onClick={() => setShowPaymentUpdateModal(false)} className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all">
                  Cancel
                </button>
                <button onClick={handlePaymentUpdate} disabled={paymentUpdating || !newPaymentStatus || newPaymentStatus === selectedBookingForPayment.paymentStatus} className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all flex items-center gap-1.5 ${paymentUpdating || !newPaymentStatus || newPaymentStatus === selectedBookingForPayment.paymentStatus ? "bg-gray-300 cursor-not-allowed" : newPaymentStatus === "Paid" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-amber-600 hover:bg-amber-700"}`}>
                  {paymentUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {paymentUpdating ? "Updating..." : "Update Payment"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== ADD SERVICE MODAL ===== */}
        {showAddServiceModal && selectedBookingForService && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-gray-200">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Add Service</h3>
                    <p className="text-xs text-gray-500">
                      {selectedBookingForService.patientName} • {selectedBookingForService.dayOfWeek}
                    </p>
                  </div>
                </div>
                <button onClick={() => { setShowAddServiceModal(false); setServiceDropdownOpen(false); }} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="my-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Current Services</label>
                  <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium">
                    {selectedBookingForService.services && selectedBookingForService.services.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {selectedBookingForService.services.map((svc, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                            {svc.name} (₹{svc.price}) - {svc.paymentStatus}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">No services assigned</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Select Service <span className="text-red-500">*</span></label>
                  <button onClick={() => setServiceDropdownOpen(!serviceDropdownOpen)} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white flex items-center justify-between">
                    <span className={selectedServiceForBooking ? "text-gray-900 font-medium" : "text-gray-400"}>
                      {selectedServiceForBooking ? `${selectedServiceForBooking.name} (₹${selectedServiceForBooking.price})` : "Select a service..."}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${serviceDropdownOpen ? "rotate-180" : ""}`} />
                  </button>
                  {serviceDropdownOpen && (
                    <div className="mt-1 border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto bg-white">
                      {servicesLoading ? (
                        <div className="px-4 py-3 text-center text-gray-500 text-sm">
                          <RefreshCw className="w-4 h-4 animate-spin inline mr-2" /> Loading services...
                        </div>
                      ) : services.length === 0 ? (
                        <div className="px-4 py-3 text-center text-gray-400 text-sm">No services available</div>
                      ) : (
                        services.map((service) => {
                          const alreadyAdded = (selectedBookingForService.services || []).some(s => s.serviceId === service._id);
                          return (
                            <button key={service._id} onClick={() => !alreadyAdded && handleServiceSelect(service)} className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors flex items-center justify-between ${alreadyAdded ? "opacity-50 cursor-not-allowed bg-gray-50" : ""} ${selectedServiceId === service._id ? "bg-emerald-50" : ""}`} disabled={alreadyAdded}>
                              <span className="font-medium text-gray-800">{service.name}</span>
                              <span className="text-xs font-bold text-emerald-700">{alreadyAdded ? "✓ Added" : `₹${service.price}`}</span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                {selectedServiceForBooking && (
                  <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-emerald-800">Selected Service</div>
                      <div className="text-sm font-bold text-gray-900">{selectedServiceForBooking.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Fee</div>
                      <div className="text-sm font-bold text-emerald-700">₹{selectedServiceForBooking.price}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3">
                <button onClick={() => { setShowAddServiceModal(false); setServiceDropdownOpen(false); }} className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all">
                  Cancel
                </button>
                <button onClick={handleAddServiceToBooking} disabled={!selectedServiceForBooking} className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all flex items-center gap-1.5 ${selectedServiceForBooking ? "bg-emerald-600 hover:bg-emerald-700" : "bg-gray-300 cursor-not-allowed"}`}>
                  <PlusCircle className="w-4 h-4" /> Add Service
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default OpManagement;