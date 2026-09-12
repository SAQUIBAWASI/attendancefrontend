import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import {
  AlertCircle,
  Coffee,
  Sun,
  Moon,
  Printer,
  XCircle,
  RefreshCw,
  Check,
  UserPlus,
  Stethoscope,
  ArrowRight,
  MessageCircle,
  CalendarDays,
  UserRound,
  CheckCircle2,
  ChevronDown,
  User,
  MapPin,
  Calendar,
  Plus,
  Trash2,
  CreditCard,
  Receipt,
  Search,
  Wallet,
  Cake
} from "lucide-react";
import TimelyFooter from './TimelyFooter';
import TimelyNavbar from '../Components/TimelyNavbar';

// ---------- Time utilities ----------
const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(":");
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
};

const minutesTo12Hour = (mins) => {
  let h = Math.floor(mins / 60);
  const m = mins % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  h = h ? h : 12;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
};

const minutesTo24Hour = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// ==================== TITLE OPTIONS ====================
const TITLE_OPTIONS = [
  { value: "Mr.",     label: "Mr.",        gender: "Male" },
  { value: "Miss",    label: "Miss",       gender: "Female" },
  { value: "Mrs.",    label: "Mrs.",       gender: "Female" },
  { value: "Master",  label: "Master",     gender: "Male" },
  { value: "Baby",    label: "Baby",       gender: "Others" },
  { value: "Baby Of", label: "Baby Of",    gender: "Others" }
];

const calculateAgeFromDob = (dobStr) => {
  if (!dobStr) return "";
  const dob = new Date(dobStr);
  if (isNaN(dob.getTime())) return "";
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age >= 0 ? String(age) : "";
};

const Appointment = () => {
  const todayStr = new Date().toISOString().split("T")[0];

  // ===== PATIENT STATE =====
  const [patientTitle, setPatientTitle] = useState("Mr.");
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientDob, setPatientDob] = useState("");
  const [patientGender, setPatientGender] = useState("Male");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [patientAddress, setPatientAddress] = useState("");
  const [purpose, setPurpose] = useState("");
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // ===== DOCTORS =====
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [doctorsLoading, setDoctorsLoading] = useState(false);

  // ===== SERVICES =====
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [serviceSearch, setServiceSearch] = useState("");
  const [selectedServices, setSelectedServices] = useState([]);

  // ===== SLOTS =====
  const [allSlots, setAllSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ===== PAYMENT =====
  const [paymentType, setPaymentType] = useState("cash");

  // ===== CONFIRMATION / TOAST =====
  const [bookingConfirmation, setBookingConfirmation] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const dayOfWeekName = useMemo(() => {
    if (!selectedDate) return "Monday";
    const dateObj = new Date(selectedDate);
    return DAYS_OF_WEEK[dateObj.getDay()];
  }, [selectedDate]);

  // ==================== TITLE CHANGE ====================
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setPatientTitle(newTitle);
    const found = TITLE_OPTIONS.find(t => t.value === newTitle);
    if (found) setPatientGender(found.gender);
  };

  // ==================== DOB CHANGE ====================
  const handleDobChange = (e) => {
    const newDob = e.target.value;
    setPatientDob(newDob);
    const calculated = calculateAgeFromDob(newDob);
    if (calculated !== "") setPatientAge(calculated);
  };

  // ==================== FETCH DOCTORS ====================
  const fetchDoctors = async () => {
    setDoctorsLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/doctors/getalldoctors`);
      if (res.data && res.data.success) {
        setDoctors(res.data.data || []);
        if (res.data.data && res.data.data.length > 0) {
          setSelectedDoctorId(res.data.data[0]._id || res.data.data[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
      setDoctors([]);
      showToast("Failed to load doctors list", "error");
    } finally {
      setDoctorsLoading(false);
    }
  };

  // ==================== FETCH SERVICES ====================
  const fetchServices = async () => {
    setServicesLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/services/allservices`);
      if (res.data && res.data.success) {
        const activeServices = (res.data.services || []).filter(s => s.isActive !== false);
        setServices(activeServices);
      } else {
        setServices([]);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      setServices([]);
      showToast("Failed to load services", "error");
    } finally {
      setServicesLoading(false);
    }
  };

  // ==================== FETCH SLOTS ====================
  const fetchSlotsForDay = async (dayName, doctorId) => {
    setLoadingSlots(true);
    setSelectedSlot(null);
    try {
      let url = `${API_BASE_URL}/appointment-slots?dayOfWeek=${dayName}`;
      if (doctorId) url += `&doctorId=${doctorId}`;
      const res = await axios.get(url).catch(() => null);
      if (res && res.data && res.data.slots && res.data.slots.length > 0) {
        setAllSlots(res.data.slots);
      } else {
        setAllSlots(generateFallbackSlots(dayName));
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
      setAllSlots(generateFallbackSlots(dayName));
    } finally {
      setLoadingSlots(false);
    }
  };

  // ==================== FALLBACK SLOTS ====================
  const generateFallbackSlots = (dayName) => {
    const isSunday = dayName === "Sunday";
    const slots = [];
    let slotIdx = 1;

    let curr = timeToMinutes("09:00");
    const morningEnd = timeToMinutes("14:00");
    while (curr + 20 <= morningEnd) {
      const start = curr;
      const end = curr + 20;
      slots.push({
        _id: `fallback_${dayName}_morning_${slotIdx}`,
        slotId: `${dayName.substring(0, 3).toLowerCase()}_m_${slotIdx}`,
        dayOfWeek: dayName,
        startTime: minutesTo12Hour(start),
        endTime: minutesTo12Hour(end),
        startTime24: minutesTo24Hour(start),
        endTime24: minutesTo24Hour(end),
        duration: 20,
        gap: 5,
        consultationFee: 300,
        paymentStatus: "Pending",
        shift: "Morning Shift",
        type: "op",
        status: "available",
        patientName: "",
        slotNumber: slotIdx++
      });
      curr = end + 5;
    }

    if (!isSunday) {
      slots.push({
        _id: `fallback_${dayName}_break`,
        slotId: `${dayName.substring(0, 3).toLowerCase()}_brk`,
        dayOfWeek: dayName,
        startTime: "02:00 PM",
        endTime: "03:00 PM",
        startTime24: "14:00",
        endTime24: "15:00",
        duration: 60,
        gap: 0,
        consultationFee: 0,
        paymentStatus: "Pending",
        shift: "Break",
        type: "break",
        status: "break",
        slotNumber: slotIdx++,
        notes: "Afternoon OP Break"
      });

      curr = timeToMinutes("15:00");
      const eveningEnd = timeToMinutes("21:00");
      while (curr + 20 <= eveningEnd) {
        const start = curr;
        const end = curr + 20;
        slots.push({
          _id: `fallback_${dayName}_evening_${slotIdx}`,
          slotId: `${dayName.substring(0, 3).toLowerCase()}_e_${slotIdx}`,
          dayOfWeek: dayName,
          startTime: minutesTo12Hour(start),
          endTime: minutesTo12Hour(end),
          startTime24: minutesTo24Hour(start),
          endTime24: minutesTo24Hour(end),
          duration: 20,
          gap: 5,
          consultationFee: 300,
          paymentStatus: "Pending",
          shift: "Evening Shift",
          type: "op",
          status: "available",
          patientName: "",
          slotNumber: slotIdx++
        });
        curr = end + 5;
      }
    }
    return slots;
  };

  // ==================== EFFECTS ====================
  useEffect(() => {
    fetchDoctors();
    fetchServices();
  }, []);

  useEffect(() => {
    if (selectedDoctorId) {
      fetchSlotsForDay(dayOfWeekName, selectedDoctorId);
    }
  }, [selectedDate, dayOfWeekName, selectedDoctorId]);

  // ==================== UTILS ====================
  const isToday = useMemo(() => selectedDate === todayStr, [selectedDate, todayStr]);

  const getSlotStartMinutes = (slot) => {
    if (slot.startTime24) {
      const parts = slot.startTime24.trim().split(":");
      return (parseInt(parts[0], 10) || 0) * 60 + (parseInt(parts[1], 10) || 0);
    }
    if (slot.startTime) {
      let [time, modifier] = slot.startTime.split(" ");
      let [hours, minutes] = time.split(":");
      let h = parseInt(hours, 10);
      let m = parseInt(minutes, 10);
      if (modifier === "PM" && h < 12) h += 12;
      if (modifier === "AM" && h === 12) h = 0;
      return h * 60 + m;
    }
    return 0;
  };

  const isSlotPast = (slot) => {
    if (!isToday) return false;
    const now = new Date();
    return getSlotStartMinutes(slot) <= now.getHours() * 60 + now.getMinutes();
  };

  const morningSlots = useMemo(
    () => allSlots.filter((s) => s.type !== "break" && s.shift && s.shift.toLowerCase().includes("morning")),
    [allSlots]
  );

  const breakSlots = useMemo(() => allSlots.filter((s) => s.type === "break"), [allSlots]);

  const eveningSlots = useMemo(
    () => allSlots.filter((s) => s.type !== "break" && s.shift && s.shift.toLowerCase().includes("evening")),
    [allSlots]
  );

  // ==================== SERVICES HANDLERS ====================
  const filteredServices = useMemo(() => {
    const q = serviceSearch.trim().toLowerCase();
    if (!q) return [];
    return services.filter(s => s.name?.toLowerCase().includes(q));
  }, [services, serviceSearch]);

  const addService = (svc) => {
    setSelectedServices((prev) => {
      const existing = prev.find(s => s._id === svc._id);
      if (existing) {
        return prev.map(s => s._id === svc._id ? { ...s, quantity: s.quantity + 1 } : s);
      }
      return [...prev, {
        _id: svc._id,
        name: svc.name,
        price: Number(svc.price) || 0,
        description: svc.description || "",
        quantity: 1
      }];
    });
  };

  const removeService = (id) => {
    setSelectedServices((prev) => prev.filter(s => s._id !== id));
  };

  // ==================== CALCULATIONS ====================
  const subtotal = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + (Number(s.price) || 0) * (Number(s.quantity) || 1), 0);
  }, [selectedServices]);

  const finalPayable = subtotal;

  // ==================== SUBMIT ====================
  const handleSubmitBooking = async (e) => {
    e.preventDefault();

    if (!patientName.trim()) return showToast("Please enter the patient's full name.", "error");
    if (!patientAge || parseInt(patientAge) <= 0) return showToast("Please enter a valid age.", "error");
    if (!patientPhone.trim() || patientPhone.length < 10) return showToast("Please enter a valid 10-digit phone number.", "error");
    if (!patientAddress.trim()) return showToast("Please enter the patient's address.", "error");
    if (!purpose.trim()) return showToast("Please enter the purpose of the appointment.", "error");
    if (!selectedDoctorId) return showToast("Please select a doctor.", "error");
    if (!selectedSlot) return showToast("Please select an available appointment slot.", "error");
    if (selectedServices.length === 0) return showToast("Please select at least one service.", "error");

    setIsSubmitting(true);
    const selectedDoc = doctors.find(d => d._id === selectedDoctorId || d.id === selectedDoctorId);

    const bookingPayload = {
      _id: selectedSlot._id,
      slotId: selectedSlot.slotId,
      dayOfWeek: dayOfWeekName,
      date: selectedDate,
      appointmentDate: selectedDate,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      startTime24: selectedSlot.startTime24,
      endTime24: selectedSlot.endTime24,

      doctorId: selectedDoctorId,
      doctorName: selectedDoc?.name || "",
      doctorSpecialization: selectedDoc?.specialization || "",

      patientTitle,
      patientName: patientName.trim(),
      patientAge: patientAge.toString(),
      patientDob: patientDob || "",
      patientGender,
      patientPhone: patientPhone.trim(),
      patientEmail: patientEmail.trim(),
      patientAddress: patientAddress.trim(),
      purpose: purpose.trim(),

      consultationFee: 0,
      paymentType: paymentType || "cash",
      paymentStatus: "Pending",
      partialAmount: 0,

      serviceItems: selectedServices.map(s => ({
        serviceId: s._id,
        _id: s._id,
        name: s.name,
        price: Number(s.price) || 0,
        quantity: Number(s.quantity) || 1,
        description: s.description || "",
        paymentStatus: "Pending"
      })),
      services: selectedServices.map(s => ({
        serviceId: s._id,
        _id: s._id,
        name: s.name,
        price: Number(s.price) || 0,
        quantity: Number(s.quantity) || 1,
        description: s.description || "",
        paymentStatus: "Pending"
      })),

      discount: 0,
      referralCommission: "",
      referralCommissionType: "",

      isOP: false
    };

    try {
      const bookRes = await axios.post(`${API_BASE_URL}/appointment-slots/book`, bookingPayload);

      if (bookRes && bookRes.data && bookRes.data.slot) {
        const updatedDbSlot = bookRes.data.slot;
        setAllSlots((prev) =>
          prev.map((s) => (s._id === selectedSlot._id || s.slotId === selectedSlot.slotId ? updatedDbSlot : s))
        );
      } else {
        setAllSlots((prev) =>
          prev.map((s) => (s._id === selectedSlot._id ? { ...s, status: "booked" } : s))
        );
      }

      setBookingConfirmation({
        appointmentId: `APP-${Date.now().toString().slice(-6)}`,
        patientTitle,
        patientName: patientName.trim(),
        patientAge,
        patientDob,
        patientGender,
        patientPhone: patientPhone.trim(),
        patientEmail: patientEmail.trim(),
        patientAddress: patientAddress.trim(),
        purpose: purpose.trim(),
        date: selectedDate,
        dayOfWeek: dayOfWeekName,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        shift: selectedSlot.shift,
        duration: selectedSlot.duration,
        doctorName: selectedDoc?.name || "",
        doctorSpecialization: selectedDoc?.specialization || "",
        services: selectedServices.map(s => ({
          name: s.name,
          price: Number(s.price) || 0,
          quantity: Number(s.quantity) || 1,
          total: (Number(s.price) || 0) * (Number(s.quantity) || 1)
        })),
        subtotal,
        finalPayable,
        paymentStatus: "Pending",
        amountPaid: 0,
        balanceAmount: finalPayable,
        paymentType
      });

      showToast(`Appointment confirmed for ${patientName}.`, "success");

      setPatientTitle("Mr.");
      setPatientName("");
      setPatientAge("");
      setPatientDob("");
      setPatientGender("Male");
      setPatientPhone("");
      setPatientEmail("");
      setPatientAddress("");
      setPurpose("");
      setSelectedSlot(null);
      setSelectedServices([]);
      setServiceSearch("");
      setPaymentType("cash");
    } catch (error) {
      console.error("Booking error:", error);
      showToast(error?.response?.data?.message || "We couldn't complete the booking. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <TimelyNavbar />
      <div className="min-h-screen bg-[#F7F8F7] text-[#1A2421] font-sans pt-20">
        {toast && (
          <div
            role="status"
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-lg shadow-lg text-white text-sm font-medium transition-all ${
              toast.type === "error" ? "bg-[#B3261E]" : "bg-[#1F7A4D]"
            }`}
          >
            {toast.type === "error" ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span>{toast.message}</span>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 md:px-6 pt-12 pb-6">
          <p className="text-xs font-semibold tracking-widest text-[#0F5C4D] uppercase mb-2">Book an appointment</p>
          <h1 className="text-3xl md:text-[2.25rem] font-semibold text-[#1A2421] tracking-tight">
            Schedule your consultation
          </h1>
          <p className="mt-3 text-sm text-[#5B6B65] max-w-2xl leading-relaxed">
            Enter patient details, choose a doctor, select services, pick a slot, and complete your OPD booking.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 pb-16">
          <form onSubmit={handleSubmitBooking}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* LEFT */}
              <div className="lg:col-span-5 space-y-6">

                {/* PATIENT CARD */}
                <div className="bg-white rounded-xl border border-[#E4E7E4] overflow-hidden">
                  <div className="px-6 py-5 border-b border-[#E4E7E4]">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#EDF4F2] rounded-lg">
                        <UserPlus className="w-4 h-4 text-[#0F5C4D]" />
                      </div>
                      <div>
                        <h2 className="text-sm font-semibold text-[#1A2421]">Patient details</h2>
                        <p className="text-xs text-[#8A948F]">Step 1 of 3</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-[110px_1fr] gap-3">
                      <div>
                        <label className="block text-xs font-medium text-[#3F4A45] mb-1.5">
                          Title <span className="text-[#B3261E]">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={patientTitle}
                            onChange={handleTitleChange}
                            className="w-full pl-3 pr-7 py-2.5 bg-white border border-[#D7DCD9] rounded-lg text-sm outline-none appearance-none focus:ring-2 focus:ring-[#0F5C4D]/20 focus:border-[#0F5C4D]"
                          >
                            {TITLE_OPTIONS.map(t => (
                              <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-[#8A948F] absolute right-2 top-3 pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#3F4A45] mb-1.5">
                          Full name <span className="text-[#B3261E]">*</span>
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-[#8A948F] absolute left-3 top-2.5" />
                          <input
                            type="text"
                            required
                            placeholder="Patient's full name"
                            value={patientName}
                            onChange={(e) => setPatientName(e.target.value)}
                            className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#D7DCD9] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0F5C4D]/20 focus:border-[#0F5C4D]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-[#3F4A45] mb-1.5 flex items-center gap-1.5">
                          <Cake className="w-3.5 h-3.5 text-[#8A948F]" /> Date of birth
                        </label>
                        <input
                          type="date"
                          max={todayStr}
                          value={patientDob}
                          onChange={handleDobChange}
                          className="w-full px-3.5 py-2.5 bg-white border border-[#D7DCD9] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0F5C4D]/20 focus:border-[#0F5C4D]"
                        />
                        <p className="mt-1 text-[10px] text-[#8A948F]">Age auto-calculated</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#3F4A45] mb-1.5">
                          Age <span className="text-[#B3261E]">*</span>
                        </label>
                        <div className="relative">
                          <Calendar className="w-4 h-4 text-[#8A948F] absolute left-3 top-2.5" />
                          <input
                            type="number"
                            required
                            min="0"
                            max="120"
                            placeholder="28"
                            value={patientAge}
                            onChange={(e) => setPatientAge(e.target.value)}
                            className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#D7DCD9] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0F5C4D]/20 focus:border-[#0F5C4D]"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#3F4A45] mb-1.5">
                        Gender <span className="text-[#B3261E]">*</span>
                      </label>
                      <div className="relative">
                        <UserRound className="w-4 h-4 text-[#8A948F] absolute left-3 top-2.5" />
                        <select
                          value={patientGender}
                          onChange={(e) => setPatientGender(e.target.value)}
                          className="w-full pl-9 pr-8 py-2.5 bg-white border border-[#D7DCD9] rounded-lg text-sm outline-none appearance-none focus:ring-2 focus:ring-[#0F5C4D]/20 focus:border-[#0F5C4D]"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Others">Others</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-[#8A948F] absolute right-3 top-2.5 pointer-events-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-[#3F4A45] mb-1.5">Phone <span className="text-[#B3261E]">*</span></label>
                        <input
                          type="tel"
                          required
                          placeholder="9876543210"
                          value={patientPhone}
                          onChange={(e) => setPatientPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                          className="w-full px-3.5 py-2.5 bg-white border border-[#D7DCD9] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0F5C4D]/20 focus:border-[#0F5C4D]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#3F4A45] mb-1.5">Email</label>
                        <input
                          type="email"
                          placeholder="patient@email.com"
                          value={patientEmail}
                          onChange={(e) => setPatientEmail(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-[#D7DCD9] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0F5C4D]/20 focus:border-[#0F5C4D]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#3F4A45] mb-1.5">Address <span className="text-[#B3261E]">*</span></label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-[#8A948F] absolute left-3 top-2.5" />
                        <textarea
                          required
                          rows={2}
                          placeholder="Residential address"
                          value={patientAddress}
                          onChange={(e) => setPatientAddress(e.target.value)}
                          className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#D7DCD9] rounded-lg text-sm resize-none outline-none focus:ring-2 focus:ring-[#0F5C4D]/20 focus:border-[#0F5C4D]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#3F4A45] mb-1.5">Purpose of visit <span className="text-[#B3261E]">*</span></label>
                      <textarea
                        required
                        rows={2}
                        placeholder="e.g. General checkup, fever"
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#D7DCD9] rounded-lg text-sm resize-none outline-none focus:ring-2 focus:ring-[#0F5C4D]/20 focus:border-[#0F5C4D]"
                      />
                    </div>
                  </div>
                </div>

                {/* SERVICES CARD */}
                <div className="bg-white rounded-xl border border-[#E4E7E4] overflow-hidden">
                  <div className="px-6 py-5 border-b border-[#E4E7E4]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#EDF4F2] rounded-lg">
                          <Receipt className="w-4 h-4 text-[#0F5C4D]" />
                        </div>
                        <div>
                          <h2 className="text-sm font-semibold text-[#1A2421]">Services</h2>
                          <p className="text-xs text-[#8A948F]">Step 2 of 3</p>
                        </div>
                      </div>
                      {selectedServices.length > 0 && (
                        <span className="text-xs bg-[#EDF4F2] text-[#0F5C4D] px-2.5 py-1 rounded-full font-semibold">
                          {selectedServices.length} selected
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="relative">
                      <Search className="w-4 h-4 text-[#8A948F] absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search services by name..."
                        value={serviceSearch}
                        onChange={(e) => setServiceSearch(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#D7DCD9] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0F5C4D]/20 focus:border-[#0F5C4D]"
                      />
                    </div>

                    <div className="max-h-64 overflow-y-auto border border-[#E4E7E4] rounded-lg divide-y divide-[#E4E7E4]">
                      {servicesLoading ? (
                        <div className="p-6 text-center text-xs text-[#8A948F]">
                          <RefreshCw className="w-4 h-4 animate-spin inline-block mr-2" /> Loading services...
                        </div>
                      ) : !serviceSearch.trim() ? (
                        <div className="p-6 text-center text-xs text-[#8A948F]">
                          Type service name to search...
                        </div>
                      ) : filteredServices.length === 0 ? (
                        <div className="p-6 text-center text-xs text-[#8A948F]">
                          No services found.
                        </div>
                      ) : (
                        filteredServices.map((svc) => {
                          const added = selectedServices.find(s => s._id === svc._id);
                          return (
                            <div
                              key={svc._id}
                              className="flex items-center justify-between px-3.5 py-2.5 hover:bg-[#F7F8F7] transition-colors"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-medium text-[#1A2421] truncate">{svc.name}</div>
                              </div>
                              <div className="flex items-center gap-3 ml-3">
                                <span className="text-sm font-semibold text-[#0F5C4D] whitespace-nowrap">
                                  ₹{svc.price}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => addService(svc)}
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                                    added
                                      ? "bg-[#EDF4F2] text-[#0F5C4D] hover:bg-[#D8E9E4]"
                                      : "bg-[#0F5C4D] text-white hover:bg-[#0C4A3E]"
                                  }`}
                                >
                                  <Plus className="w-3 h-3" />
                                  {added ? `Add (${added.quantity})` : "Add"}
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* ✅ Selected services — sirf delete button, +/- hata diya */}
                    {selectedServices.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-[#E4E7E4]">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#8A948F]">
                          Selected services
                        </div>
                        {selectedServices.map((s) => (
                          <div
                            key={s._id}
                            className="flex items-center justify-between gap-3 p-3 bg-[#F7F8F7] border border-[#E4E7E4] rounded-lg"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-semibold text-[#1A2421] truncate">{s.name}</div>
                              <div className="text-[11px] text-[#8A948F] mt-0.5">
                                {s.quantity > 1 ? `${s.quantity} × ₹${s.price} = ` : ""}
                                <span className="font-bold text-[#0F5C4D]">
                                  ₹{(Number(s.price) || 0) * (Number(s.quantity) || 1)}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeService(s._id)}
                              className="w-8 h-8 rounded-lg bg-[#FCE9E7] text-[#B3261E] flex items-center justify-center hover:bg-[#F8D5D1] transition-colors flex-shrink-0"
                              title="Remove service"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* BILLING CARD */}
                <div className="bg-white rounded-xl border border-[#E4E7E4] overflow-hidden">
                  <div className="px-6 py-5 border-b border-[#E4E7E4]">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#EDF4F2] rounded-lg">
                        <CreditCard className="w-4 h-4 text-[#0F5C4D]" />
                      </div>
                      <div>
                        <h2 className="text-sm font-semibold text-[#1A2421]">Billing & payment</h2>
                        <p className="text-xs text-[#8A948F]">Step 3 of 3</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-[#3F4A45] mb-1.5 flex items-center gap-1.5">
                        <Wallet className="w-3.5 h-3.5 text-[#8A948F]" /> Payment type
                      </label>
                      <div className="relative">
                        <select
                          value={paymentType}
                          onChange={(e) => setPaymentType(e.target.value)}
                          className="w-full px-3.5 pr-8 py-2.5 bg-white border border-[#D7DCD9] rounded-lg text-sm outline-none appearance-none focus:ring-2 focus:ring-[#0F5C4D]/20 focus:border-[#0F5C4D]"
                        >
                          <option value="cash">Cash</option>
                          <option value="card">Card</option>
                          <option value="upi">UPI</option>
                          <option value="netbanking">Net Banking</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-[#8A948F] absolute right-3 top-2.5 pointer-events-none" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#FDF3DA] border border-[#F0DFA8] rounded-lg">
                      <span className="text-xs font-medium text-[#7A5300]">Payment status</span>
                      <span className="text-xs font-bold text-[#7A5300] uppercase tracking-wide">Pending</span>
                    </div>

                    <div className="bg-[#F7F8F7] border border-[#E4E7E4] rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#5B6B65]">Subtotal ({selectedServices.length} item{selectedServices.length !== 1 ? 's' : ''})</span>
                        <span className="font-semibold text-[#1A2421]">₹{subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-[#E4E7E4]">
                        <span className="text-sm font-semibold text-[#1A2421]">Total payable</span>
                        <span className="text-lg font-bold text-[#0F5C4D]">₹{finalPayable.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT */}
              <div className="lg:col-span-7 space-y-6">

                <div className="bg-white rounded-xl border border-[#E4E7E4] p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#3F4A45] mb-1.5 flex items-center gap-1.5">
                        <Stethoscope className="w-3.5 h-3.5 text-[#8A948F]" /> Select doctor <span className="text-[#B3261E]">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-[#8A948F] absolute left-3 top-2.5" />
                        <select
                          value={selectedDoctorId}
                          onChange={(e) => setSelectedDoctorId(e.target.value)}
                          className="w-full pl-9 pr-8 py-2.5 bg-white border border-[#D7DCD9] rounded-lg text-sm outline-none appearance-none focus:ring-2 focus:ring-[#0F5C4D]/20 focus:border-[#0F5C4D]"
                          required
                        >
                          <option value="">Select Doctor</option>
                          {doctorsLoading ? (
                            <option value="" disabled>Loading doctors...</option>
                          ) : doctors.length === 0 ? (
                            <option value="" disabled>No doctors available</option>
                          ) : (
                            doctors.map((doc) => (
                              <option key={doc._id || doc.id} value={doc._id || doc.id}>
                                {doc.name || "Unnamed Doctor"} - {doc.specialization || "General"}
                              </option>
                            ))
                          )}
                        </select>
                        <ChevronDown className="w-4 h-4 text-[#8A948F] absolute right-3 top-2.5 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#3F4A45] mb-1.5 flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5 text-[#8A948F]" /> Appointment date <span className="text-[#B3261E]">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        min={todayStr}
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#D7DCD9] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0F5C4D]/20 focus:border-[#0F5C4D]"
                      />
                      <p className="mt-1.5 text-[11px] text-[#5B6B65]">
                        Day: <span className="font-semibold text-[#1A2421]">{dayOfWeekName}</span>
                      </p>
                    </div>
                  </div>

                  {selectedSlot && (
                    <div className="border-l-2 border-[#0F5C4D] bg-[#EDF4F2] rounded-r-lg p-4 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] uppercase tracking-wide font-semibold text-[#0F5C4D]">Selected slot</div>
                        <div className="text-base font-semibold text-[#1A2421]">
                          {selectedSlot.startTime} – {selectedSlot.endTime}
                        </div>
                        <div className="text-xs text-[#5B6B65] mt-0.5">{selectedSlot.shift}</div>
                      </div>
                      <Check className="w-5 h-5 text-[#0F5C4D] shrink-0" />
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-xl border border-[#E4E7E4] p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E4E7E4] pb-4 mb-6">
                    <div>
                      <h3 className="text-base font-semibold text-[#1A2421]">
                        Available slots for {dayOfWeekName}
                      </h3>
                    </div>
                    <div className="flex items-center gap-4 text-[11px] font-medium text-[#5B6B65]">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#0F5C4D] inline-block" /> Available
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#D7DCD9] inline-block" /> Booked
                      </span>
                    </div>
                  </div>

                  {!selectedDoctorId ? (
                    <div className="py-16 text-center">
                      <Stethoscope className="w-12 h-12 text-[#B7BFBB] mx-auto mb-3" />
                      <p className="text-sm font-medium text-[#5B6B65]">Please select a doctor first to view available slots.</p>
                    </div>
                  ) : loadingSlots ? (
                    <div className="py-16 text-center">
                      <RefreshCw className="w-6 h-6 text-[#0F5C4D] animate-spin mx-auto mb-3" />
                      <p className="text-sm font-medium text-[#5B6B65]">Loading slots for {dayOfWeekName}…</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2 font-semibold text-[#1A2421] text-sm">
                            <Sun className="w-4 h-4 text-[#8A948F]" />
                            <span>Morning shift <span className="font-normal text-[#8A948F] text-xs">(09:00 AM – 02:00 PM)</span></span>
                          </div>
                          <span className="text-xs bg-[#EDF4F2] text-[#0F5C4D] px-2.5 py-0.5 rounded font-semibold">
                            {morningSlots.filter((s) => s.status === "available" && !isSlotPast(s)).length} available
                          </span>
                        </div>

                        {morningSlots.length === 0 ? (
                          <p className="text-xs text-[#8A948F] italic py-2">No morning slots available.</p>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {morningSlots.map((slot) => (
                              <AppointmentSlotTile
                                key={slot._id || slot.slotId}
                                slot={slot}
                                isPast={isSlotPast(slot)}
                                isSelected={selectedSlot && (selectedSlot._id === slot._id || selectedSlot.slotId === slot.slotId)}
                                onSelect={() => !isSlotPast(slot) && setSelectedSlot(slot)}
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      {breakSlots.length > 0 && (
                        <div className="bg-[#F7F8F7] border border-[#E4E7E4] p-3.5 rounded-lg flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 font-medium text-[#3F4A45]">
                            <Coffee className="w-4 h-4 text-[#8A948F]" />
                            <span>Break & sanitization <span className="font-normal text-[#8A948F]">(02:00 PM – 03:00 PM)</span></span>
                          </div>
                          <span className="bg-[#E4E7E4] text-[#5B6B65] text-[10px] font-semibold px-2.5 py-0.5 rounded uppercase">
                            No booking
                          </span>
                        </div>
                      )}

                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2 font-semibold text-[#1A2421] text-sm">
                            <Moon className="w-4 h-4 text-[#8A948F]" />
                            <span>Evening shift <span className="font-normal text-[#8A948F] text-xs">(03:00 PM – 09:00 PM)</span></span>
                          </div>
                          <span className="text-xs bg-[#EDF4F2] text-[#0F5C4D] px-2.5 py-0.5 rounded font-semibold">
                            {eveningSlots.filter((s) => s.status === "available" && !isSlotPast(s)).length} available
                          </span>
                        </div>

                        {dayOfWeekName === "Sunday" ? (
                          <div className="bg-[#F7F8F7] p-5 rounded-lg text-center border border-[#E4E7E4] text-xs text-[#5B6B65]">
                            Evening shift is closed on Sundays. OP runs 09:00 AM – 02:00 PM.
                          </div>
                        ) : eveningSlots.length === 0 ? (
                          <p className="text-xs text-[#8A948F] italic py-2">No evening slots available.</p>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {eveningSlots.map((slot) => (
                              <AppointmentSlotTile
                                key={slot._id || slot.slotId}
                                slot={slot}
                                isPast={isSlotPast(slot)}
                                isSelected={selectedSlot && (selectedSlot._id === slot._id || selectedSlot.slotId === slot.slotId)}
                                onSelect={() => !isSlotPast(slot) && setSelectedSlot(slot)}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !selectedSlot || !selectedDoctorId || selectedServices.length === 0}
                  className={`w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-sm transition-colors ${
                    selectedSlot && selectedDoctorId && selectedServices.length > 0 && !isSubmitting
                      ? "bg-[#0F5C4D] text-white hover:bg-[#0C4A3E]"
                      : "bg-[#E4E7E4] text-[#8A948F] cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Processing…
                    </>
                  ) : (
                    <>
                      Confirm booking • ₹{finalPayable.toLocaleString()}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* CONFIRMATION MODAL */}
        {bookingConfirmation && (
          <div className="fixed inset-0 bg-[#1A2421]/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-xl max-w-lg w-full p-6 md:p-8 border border-[#E4E7E4] my-8">
              <div className="flex items-center justify-between pb-4 border-b border-[#E4E7E4]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#EDF4F2] text-[#0F5C4D] flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1A2421] text-lg">Appointment booked</h3>
                    <p className="text-xs text-[#8A948F]">Reference #{bookingConfirmation.appointmentId}</p>
                  </div>
                </div>
                <button
                  onClick={() => setBookingConfirmation(null)}
                  className="text-[#8A948F] hover:text-[#1A2421] p-1.5 rounded-lg"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="my-6 bg-[#F7F8F7] p-5 rounded-lg border border-[#E4E7E4] space-y-3.5">
                <div className="flex items-center justify-between pb-3 border-b border-[#E4E7E4]">
                  <div>
                    <div className="text-[10px] font-semibold uppercase text-[#8A948F]">Patient</div>
                    <div className="text-sm font-semibold text-[#1A2421]">
                      {bookingConfirmation.patientTitle} {bookingConfirmation.patientName}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-semibold uppercase text-[#8A948F]">Age / Gender</div>
                    <div className="text-sm font-medium text-[#3F4A45]">
                      {bookingConfirmation.patientAge} yrs ({bookingConfirmation.patientGender})
                    </div>
                  </div>
                </div>

                {bookingConfirmation.patientDob && (
                  <div>
                    <div className="text-[10px] font-semibold uppercase text-[#8A948F]">Date of Birth</div>
                    <div className="text-xs font-medium text-[#3F4A45]">{bookingConfirmation.patientDob}</div>
                  </div>
                )}

                <div className="pb-2 border-b border-[#E4E7E4]">
                  <div className="text-[10px] font-semibold uppercase text-[#8A948F]">Doctor</div>
                  <div className="text-sm font-semibold text-[#1A2421]">{bookingConfirmation.doctorName || "N/A"}</div>
                  {bookingConfirmation.doctorSpecialization && (
                    <div className="text-xs text-[#5B6B65]">{bookingConfirmation.doctorSpecialization}</div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[10px] font-semibold uppercase text-[#8A948F]">Phone</div>
                    <div className="text-xs font-medium text-[#3F4A45]">{bookingConfirmation.patientPhone}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase text-[#8A948F]">Email</div>
                    <div className="text-xs font-medium text-[#3F4A45]">{bookingConfirmation.patientEmail || "Not provided"}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[10px] font-semibold uppercase text-[#8A948F]">Date</div>
                    <div className="text-xs font-medium text-[#3F4A45]">
                      {bookingConfirmation.date} ({bookingConfirmation.dayOfWeek})
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase text-[#8A948F]">Time</div>
                    <div className="text-xs font-medium text-[#3F4A45]">
                      {bookingConfirmation.startTime} – {bookingConfirmation.endTime}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E4E7E4]">
                  <div className="text-[10px] font-semibold uppercase text-[#8A948F] mb-2">Services</div>
                  <div className="space-y-1">
                    {bookingConfirmation.services.map((s, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-[#3F4A45]">{s.name} × {s.quantity}</span>
                        <span className="font-semibold text-[#1A2421]">₹{s.total}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E4E7E4] flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#1A2421]">Total payable</span>
                  <span className="text-base font-bold text-[#0F5C4D]">₹{bookingConfirmation.finalPayable.toLocaleString()}</span>
                </div>

                <div className="text-center pt-2 border-t border-[#E4E7E4]">
                  <span className="inline-block bg-[#FDF3DA] text-[#92600B] text-[10px] font-bold px-3 py-1 rounded uppercase">
                    Payment: {bookingConfirmation.paymentStatus}
                  </span>
                </div>

                {bookingConfirmation.patientAddress && (
                  <div>
                    <div className="text-[10px] font-semibold uppercase text-[#8A948F]">Address</div>
                    <div className="text-xs text-[#3F4A45]">{bookingConfirmation.patientAddress}</div>
                  </div>
                )}

                {bookingConfirmation.purpose && (
                  <div>
                    <div className="text-[10px] font-semibold uppercase text-[#8A948F]">Purpose</div>
                    <div className="text-xs text-[#3F4A45]">{bookingConfirmation.purpose}</div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#F7F8F7] hover:bg-[#E4E7E4] text-[#3F4A45] flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
                <button
                  type="button"
                  onClick={() => setBookingConfirmation(null)}
                  className="px-5 py-2 rounded-lg text-xs font-semibold bg-[#0F5C4D] text-white hover:bg-[#0C4A3E]"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Support section */}
        <section className="bg-[#0F5C4D] py-14">
          <div className="max-w-4xl px-4 mx-auto text-center sm:px-6">
            <h2 className="mb-3 text-2xl md:text-3xl font-semibold text-white">Need help with your booking?</h2>
            <p className="mb-8 text-sm text-white/80 max-w-2xl mx-auto">
              Our support team can help with appointments, available slots, or questions about consultation services.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => window.open('https://wa.me/919010481048?text=Hello! I need help with booking an appointment.', '_blank')}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#0F5C4D] rounded-lg hover:bg-[#F0F3F2] font-semibold text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Chat with support
              </button>
              <a
                href="/membership"
                className="flex items-center gap-2 px-5 py-2.5 bg-transparent text-white border border-white/40 rounded-lg hover:bg-white/10 font-semibold text-sm"
              >
                Become a member
              </a>
            </div>
          </div>
        </section>
      </div>
      <TimelyFooter />
    </>
  );
};

// ---------- Sub-component: slot tile ----------
const AppointmentSlotTile = ({ slot, isSelected, onSelect, isPast }) => {
  const isBooked = slot.status === "booked";

  if (isPast) {
    return (
      <div className="p-3 rounded-lg bg-[#F7F8F7] border border-[#E4E7E4] text-[#B7BFBB] cursor-not-allowed flex flex-col justify-between h-20">
        <div>
          <div className="text-xs font-medium line-through text-[#B7BFBB]">
            {slot.startTime} – {slot.endTime}
          </div>
          <div className="text-[10px] text-[#B7BFBB] mt-0.5">Past slot</div>
        </div>
        <div className="flex items-center justify-between text-[10px] font-medium uppercase">
          <span>Passed</span>
        </div>
      </div>
    );
  }

  if (isBooked) {
    return (
      <div className="p-3 rounded-lg bg-[#F7F8F7] border border-[#E4E7E4] text-[#B7BFBB] cursor-not-allowed flex flex-col justify-between h-20">
        <div>
          <div className="text-xs font-medium line-through">{slot.startTime} – {slot.endTime}</div>
          {slot.patientName && (
            <div className="text-[10px] text-[#8A948F] truncate mt-0.5" title={slot.patientName}>
              {slot.patientName}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between text-[10px] font-medium uppercase">
          <span>Booked</span>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`p-3 rounded-lg border text-left transition-colors flex flex-col justify-between h-20 ${
        isSelected
          ? "bg-[#0F5C4D] text-white border-[#0F5C4D]"
          : "bg-white border-[#D7DCD9] text-[#1A2421] hover:border-[#0F5C4D] hover:bg-[#EDF4F2]"
      }`}
    >
      <div className="text-xs font-semibold tracking-tight">
        {slot.startTime} – {slot.endTime}
      </div>
      <div className="flex items-center justify-between text-[10px] font-medium">
        <span className={isSelected ? "text-white/90" : "text-[#5B6B65]"}>{slot.shift}</span>
        <span
          className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-wide font-semibold ${
            isSelected ? "bg-white text-[#0F5C4D]" : "bg-[#EDF4F2] text-[#0F5C4D]"
          }`}
        >
          {isSelected ? "Selected" : "Available"}
        </span>
      </div>
    </button>
  );
};

export default Appointment;