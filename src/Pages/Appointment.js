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
  ArrowLeft,
  CalendarDays,
  UserRound,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  User,
  MapPin,
  Calendar,
  Plus,
  Trash2,
  CreditCard,
  Receipt,
  Search,
  Wallet,
  Cake,
  Building2,
  Award,
  Briefcase,
  Video,
  Footprints,
  Upload,
  FileText,
  Paperclip,
  Filter,
  SlidersHorizontal,
  Pill,
  FlaskConical,
} from "lucide-react";
import TimelyFooter from "./TimelyFooter";
import TimelyNavbar from "../Components/TimelyNavbar";

// ✅ Local category images
import doctorConsultationImg from "../Images/doctorconsultation.png";
import labTestImg from "../Images/labtest.png";

// ==================== BRAND COLORS ====================
const BLUE = "#2B5CA8";
const BLUE_DARK = "#1F4680";
const BLUE_LIGHT = "#E6EEF9";
const BLUE_BORDER = "#BFD3EC";
const BLUE_SHADOW = "rgba(43,92,168,0.2)";

const GREEN = "#1AA179";
const GREEN_DARK = "#137A5C";
const GREEN_LIGHT = "#E3F5EF";
const GREEN_BORDER = "#B5E3D3";
const GREEN_SHADOW = "rgba(26,161,121,0.2)";

// ==================== BANNER SLIDES ====================
const BANNER_SLIDES = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1600&q=80",
    tagline: "Book an appointment",
    title: "Schedule your consultation in a few simple steps",
    description:
      "Choose your clinic, pick a doctor, select your preferred slot, and complete your OPD booking — all in one place.",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=1600&q=80",
    tagline: "Trusted care",
    title: "Expert doctors, seamless booking experience",
    description:
      "Access verified specialists across multiple clinics. Get instant confirmation and secure your appointment in minutes.",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1600&q=80",
    tagline: "Your health, our priority",
    title: "Quality healthcare at your fingertips",
    description:
      "From routine checkups to specialist consultations — we make healthcare accessible, convenient, and reliable for everyone.",
  },
];

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
  { value: "Mr.", label: "Mr.", gender: "Male" },
  { value: "Miss", label: "Miss", gender: "Female" },
  { value: "Mrs.", label: "Mrs.", gender: "Female" },
  { value: "Master", label: "Master", gender: "Male" },
  { value: "Baby", label: "Baby", gender: "Others" },
  { value: "Baby Of", label: "Baby Of", gender: "Others" },
];

// ==================== DEFAULT CLINIC ====================
const DEFAULT_CLINIC = {
  _id: "timelyhealth-default",
  id: "timelyhealth-default",
  name: "TimelyHealth",
  city: "Hyderabad",
  address: "Madhapur, Hyderabad, Telangana",
};

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

// ==================== STEP ENUM ====================
const STEPS = {
  CATEGORY: 0,
  CLINIC: 1,
  DOCTOR: 2,
  BOOKING_TYPE: 3,
  SLOT: 4,
  DETAILS: 5,
};

const Appointment = () => {
  const todayStr = new Date().toISOString().split("T")[0];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentStep, setCurrentStep] = useState(STEPS.CATEGORY);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedClinic, setSelectedClinic] = useState(null);

  const [patientTitle, setPatientTitle] = useState("Mr.");
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientDob, setPatientDob] = useState("");
  const [patientGender, setPatientGender] = useState("Male");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [patientAddress, setPatientAddress] = useState("");
  const [purpose, setPurpose] = useState("");

  const [uploadedReports, setUploadedReports] = useState([]);
  const [uploadedPrescriptions, setUploadedPrescriptions] = useState([]);

  const [bookingType, setBookingType] = useState("");
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const [clinics, setClinics] = useState([]);
  const [clinicsLoading, setClinicsLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [clinicSearch, setClinicSearch] = useState("");

  const [doctorSearch, setDoctorSearch] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("all");
  const [experienceFilter, setExperienceFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [serviceSearch, setServiceSearch] = useState("");
  const [selectedServices, setSelectedServices] = useState([]);

  const [allSlots, setAllSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [paymentType, setPaymentType] = useState("cash");
  const [bookingConfirmation, setBookingConfirmation] = useState(null);
  const [toast, setToast] = useState(null);

  const [nowTick, setNowTick] = useState(Date.now());

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BANNER_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const tick = setInterval(() => setNowTick(Date.now()), 30000);
    return () => clearInterval(tick);
  }, []);

  const goToSlide = (idx) => setCurrentSlide(idx);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % BANNER_SLIDES.length);
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + BANNER_SLIDES.length) % BANNER_SLIDES.length);

  const dayOfWeekName = useMemo(() => {
    if (!selectedDate) return "Monday";
    const dateObj = new Date(selectedDate);
    return DAYS_OF_WEEK[dateObj.getDay()];
  }, [selectedDate]);

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setPatientTitle(newTitle);
    const found = TITLE_OPTIONS.find((t) => t.value === newTitle);
    if (found) setPatientGender(found.gender);
  };

  const handleDobChange = (e) => {
    const newDob = e.target.value;
    setPatientDob(newDob);
    const calculated = calculateAgeFromDob(newDob);
    if (calculated !== "") setPatientAge(calculated);
  };

  const processFiles = (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return [];

    const maxSizeMB = 10;
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    const validFiles = [];
    files.forEach((file) => {
      if (file.size > maxSizeMB * 1024 * 1024) {
        showToast(`${file.name} is larger than ${maxSizeMB}MB`, "error");
        return;
      }
      if (!allowedTypes.includes(file.type)) {
        showToast(`${file.name} — only PDF/JPG/PNG allowed`, "error");
        return;
      }
      validFiles.push({
        name: file.name,
        size: file.size,
        type: file.type,
        file,
      });
    });
    return validFiles;
  };

  const handleReportUpload = (e) => {
    const validFiles = processFiles(e.target.files);
    if (validFiles.length > 0) {
      setUploadedReports((prev) => [...prev, ...validFiles]);
      showToast(`${validFiles.length} report${validFiles.length > 1 ? "s" : ""} added`, "success");
    }
    e.target.value = "";
  };

  const handlePrescriptionUpload = (e) => {
    const validFiles = processFiles(e.target.files);
    if (validFiles.length > 0) {
      setUploadedPrescriptions((prev) => [...prev, ...validFiles]);
      showToast(
        `${validFiles.length} prescription${validFiles.length > 1 ? "s" : ""} added`,
        "success"
      );
    }
    e.target.value = "";
  };

  const removeReport = (idx) => {
    setUploadedReports((prev) => prev.filter((_, i) => i !== idx));
  };

  const removePrescription = (idx) => {
    setUploadedPrescriptions((prev) => prev.filter((_, i) => i !== idx));
  };

  const clearAllReports = () => {
    if (uploadedReports.length === 0) return;
    setUploadedReports([]);
    showToast("All reports removed", "success");
  };

  const clearAllPrescriptions = () => {
    if (uploadedPrescriptions.length === 0) return;
    setUploadedPrescriptions([]);
    showToast("All prescriptions removed", "success");
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const fetchClinics = async () => {
    setClinicsLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/clinics/getallclinics`).catch(() => null);
      let fetchedClinics = [];

      if (res && res.data && res.data.success) {
        fetchedClinics = res.data.data || res.data.clinics || [];
      } else if (res && Array.isArray(res.data)) {
        fetchedClinics = res.data;
      } else if (res && res.data && Array.isArray(res.data.clinics)) {
        fetchedClinics = res.data.clinics;
      }

      const hasTimelyHealth = fetchedClinics.some(
        (c) =>
          (c.name || "").toLowerCase().includes("timelyhealth") ||
          (c.name || "").toLowerCase().includes("timely health")
      );

      if (!hasTimelyHealth) {
        fetchedClinics = [DEFAULT_CLINIC, ...fetchedClinics];
      }

      setClinics(fetchedClinics);
    } catch (error) {
      console.error("Error fetching clinics:", error);
      setClinics([DEFAULT_CLINIC]);
    } finally {
      setClinicsLoading(false);
    }
  };

  const fetchDoctors = async () => {
    setDoctorsLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/doctors/getalldoctors`);
      if (res.data && res.data.success) {
        setDoctors(res.data.data || []);
      } else if (Array.isArray(res.data)) {
        setDoctors(res.data);
      } else {
        setDoctors([]);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
      setDoctors([]);
      showToast("Failed to load doctors list", "error");
    } finally {
      setDoctorsLoading(false);
    }
  };

  const fetchServices = async () => {
    setServicesLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/services/allservices`);
      if (res.data && res.data.success) {
        const activeServices = (res.data.services || []).filter((s) => s.isActive !== false);
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
        slotNumber: slotIdx++,
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
        notes: "Afternoon OP Break",
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
          slotNumber: slotIdx++,
        });
        curr = end + 5;
      }
    }
    return slots;
  };

  useEffect(() => {
    fetchClinics();
    fetchDoctors();
    fetchServices();
  }, []);

  useEffect(() => {
    if (selectedDoctorId && currentStep === STEPS.SLOT) {
      fetchSlotsForDay(dayOfWeekName, selectedDoctorId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, dayOfWeekName, selectedDoctorId, currentStep]);

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
    const now = new Date(nowTick);
    return getSlotStartMinutes(slot) <= now.getHours() * 60 + now.getMinutes();
  };

  const isSlotBookable = (slot) => {
    return slot.status !== "booked" && slot.status !== "break" && !isSlotPast(slot);
  };

  const morningSlots = useMemo(
    () =>
      allSlots.filter(
        (s) =>
          s.type !== "break" &&
          s.shift &&
          s.shift.toLowerCase().includes("morning") &&
          isSlotBookable(s)
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allSlots, isToday, nowTick]
  );

  const breakSlots = useMemo(() => allSlots.filter((s) => s.type === "break"), [allSlots]);

  const eveningSlots = useMemo(
    () =>
      allSlots.filter(
        (s) =>
          s.type !== "break" &&
          s.shift &&
          s.shift.toLowerCase().includes("evening") &&
          isSlotBookable(s)
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allSlots, isToday, nowTick]
  );

  const filteredClinics = useMemo(() => {
    const q = clinicSearch.trim().toLowerCase();
    if (!q) return clinics;
    return clinics.filter(
      (c) =>
        (c.name || "").toLowerCase().includes(q) ||
        (c.city || "").toLowerCase().includes(q) ||
        (c.address || "").toLowerCase().includes(q)
    );
  }, [clinics, clinicSearch]);

  const specializations = useMemo(() => {
    const specs = doctors
      .map((d) => d.specialization)
      .filter((s) => s && s.trim() !== "");
    return [...new Set(specs)].sort();
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    let list = [...doctors];

    if (selectedClinic) {
      const clinicId = selectedClinic._id || selectedClinic.id;
      const clinicHasDoctors = list.some(
        (d) => d.clinicId === clinicId || d.clinic?._id === clinicId || d.clinic === clinicId
      );
      if (clinicHasDoctors) {
        list = list.filter(
          (d) => d.clinicId === clinicId || d.clinic?._id === clinicId || d.clinic === clinicId
        );
      }
    }

    const q = doctorSearch.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (d) =>
          (d.name || "").toLowerCase().includes(q) ||
          (d.specialization || "").toLowerCase().includes(q) ||
          (d.qualification || "").toLowerCase().includes(q)
      );
    }

    if (specializationFilter !== "all") {
      list = list.filter((d) => d.specialization === specializationFilter);
    }

    if (experienceFilter !== "all") {
      list = list.filter((d) => {
        const exp = parseInt(d.experience, 10) || 0;
        if (experienceFilter === "0-5") return exp >= 0 && exp <= 5;
        if (experienceFilter === "5-10") return exp > 5 && exp <= 10;
        if (experienceFilter === "10-15") return exp > 10 && exp <= 15;
        if (experienceFilter === "15+") return exp > 15;
        return true;
      });
    }

    return list;
  }, [doctors, selectedClinic, doctorSearch, specializationFilter, experienceFilter]);

  const filteredServices = useMemo(() => {
    const q = serviceSearch.trim().toLowerCase();
    if (!q) return [];
    return services.filter((s) => s.name?.toLowerCase().includes(q));
  }, [services, serviceSearch]);

  const addService = (svc) => {
    setSelectedServices((prev) => {
      const existing = prev.find((s) => s._id === svc._id);
      if (existing) {
        return prev.map((s) => (s._id === svc._id ? { ...s, quantity: s.quantity + 1 } : s));
      }
      return [
        ...prev,
        {
          _id: svc._id,
          name: svc.name,
          price: Number(svc.price) || 0,
          description: svc.description || "",
          quantity: 1,
        },
      ];
    });
  };

  const removeService = (id) => {
    setSelectedServices((prev) => prev.filter((s) => s._id !== id));
  };

  const subtotal = useMemo(() => {
    return selectedServices.reduce(
      (sum, s) => sum + (Number(s.price) || 0) * (Number(s.quantity) || 1),
      0
    );
  }, [selectedServices]);

  const finalPayable = subtotal;

  const goToStep = (step) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    goToStep(STEPS.CLINIC);
  };

  const handleClinicSelect = (clinic) => {
    setSelectedClinic(clinic);
    setSelectedDoctorId("");
    setDoctorSearch("");
    setSpecializationFilter("all");
    setExperienceFilter("all");
    goToStep(STEPS.DOCTOR);
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctorId(doctor._id || doctor.id);
    goToStep(STEPS.BOOKING_TYPE);
  };

  const handleBookingTypeSelect = (type) => {
    setBookingType(type);
    if (type === "online") {
      setPurpose("Doctor Consultation");

      const consultationService = services.find(
        (s) => s.name?.toLowerCase().trim() === "doctor consultation"
      );

      if (consultationService) {
        setSelectedServices((prev) => {
          const exists = prev.find((s) => s._id === consultationService._id);
          if (exists) return prev;
          return [
            ...prev,
            {
              _id: consultationService._id,
              name: consultationService.name,
              price: Number(consultationService.price) || 0,
              description: consultationService.description || "",
              quantity: 1,
            },
          ];
        });
        showToast(`"Doctor Consultation" added (₹${consultationService.price})`, "success");
      } else {
        showToast("Doctor Consultation service not found in catalog", "error");
      }
    }
    goToStep(STEPS.SLOT);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleSlotContinue = () => {
    if (!selectedSlot) {
      showToast("Please select a slot to continue.", "error");
      return;
    }
    goToStep(STEPS.DETAILS);
  };

  const handleBack = () => {
    if (currentStep === STEPS.DETAILS) {
      goToStep(STEPS.SLOT);
    } else if (currentStep === STEPS.SLOT) {
      setSelectedSlot(null);
      if (bookingType === "online") {
        const consultationService = services.find(
          (s) => s.name?.toLowerCase().trim() === "doctor consultation"
        );
        if (consultationService) {
          setSelectedServices((prev) => prev.filter((s) => s._id !== consultationService._id));
        }
      }
      goToStep(STEPS.BOOKING_TYPE);
    } else if (currentStep === STEPS.BOOKING_TYPE) {
      goToStep(STEPS.DOCTOR);
    } else if (currentStep === STEPS.DOCTOR) {
      goToStep(STEPS.CLINIC);
    } else if (currentStep === STEPS.CLINIC) {
      setSelectedClinic(null);
      goToStep(STEPS.CATEGORY);
    }
  };

  const resetAll = () => {
    setCurrentStep(STEPS.CATEGORY);
    setSelectedCategory(null);
    setSelectedClinic(null);
    setSelectedDoctorId("");
    setBookingType("");
    setSelectedSlot(null);
    setPatientTitle("Mr.");
    setPatientName("");
    setPatientAge("");
    setPatientDob("");
    setPatientGender("Male");
    setPatientPhone("");
    setPatientEmail("");
    setPatientAddress("");
    setPurpose("");
    setUploadedReports([]);
    setUploadedPrescriptions([]);
    setSelectedServices([]);
    setServiceSearch("");
    setPaymentType("cash");
    setSelectedDate(todayStr);
    setDoctorSearch("");
    setSpecializationFilter("all");
    setExperienceFilter("all");
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();

    if (!patientName.trim()) return showToast("Please enter the patient's full name.", "error");
    if (!patientAge || parseInt(patientAge) <= 0) return showToast("Please enter a valid age.", "error");
    if (!patientPhone.trim() || patientPhone.length < 10)
      return showToast("Please enter a valid 10-digit phone number.", "error");
    if (!patientAddress.trim()) return showToast("Please enter the patient's address.", "error");

    if (bookingType === "walkin" && !purpose.trim()) {
      return showToast("Please enter the purpose of the appointment.", "error");
    }

    if (!selectedDoctorId) return showToast("Please select a doctor.", "error");
    if (!selectedSlot) return showToast("Please select an available appointment slot.", "error");
    if (selectedServices.length === 0) return showToast("Please select at least one service.", "error");

    setIsSubmitting(true);
    const selectedDoc = doctors.find((d) => d._id === selectedDoctorId || d.id === selectedDoctorId);

    const formData = new FormData();

    formData.append("_id", selectedSlot._id || "");
    formData.append("slotId", selectedSlot.slotId || "");
    formData.append("dayOfWeek", dayOfWeekName);
    formData.append("date", selectedDate);
    formData.append("appointmentDate", selectedDate);
    formData.append("startTime", selectedSlot.startTime || "");
    formData.append("endTime", selectedSlot.endTime || "");
    formData.append("startTime24", selectedSlot.startTime24 || "");
    formData.append("endTime24", selectedSlot.endTime24 || "");

    formData.append("doctorId", selectedDoctorId);
    formData.append("doctorName", selectedDoc?.name || "");
    formData.append("doctorSpecialization", selectedDoc?.specialization || "");

    formData.append("clinicId", selectedClinic?._id || selectedClinic?.id || "");
    formData.append("clinicName", selectedClinic?.name || "");
    formData.append("bookingType", bookingType === "walkin" ? "Walk-In" : "Online");
    formData.append("isOP", bookingType === "walkin" ? "true" : "false");

    formData.append("patientTitle", patientTitle);
    formData.append("patientName", patientName.trim());
    formData.append("patientAge", patientAge.toString());
    formData.append("patientDob", patientDob || "");
    formData.append("patientGender", patientGender);
    formData.append("patientPhone", patientPhone.trim());
    formData.append("patientEmail", patientEmail.trim());
    formData.append("patientAddress", patientAddress.trim());
    formData.append("purpose", bookingType === "online" ? "Doctor Consultation" : purpose.trim());

    formData.append("consultationFee", "0");
    formData.append("paymentType", paymentType || "cash");
    formData.append("paymentStatus", "Pending");
    formData.append("partialAmount", "0");
    formData.append("discount", "0");
    formData.append("referralCommission", "");
    formData.append("referralCommissionType", "");

    const servicesJson = JSON.stringify(
      selectedServices.map((s) => ({
        serviceId: s._id,
        _id: s._id,
        name: s.name,
        price: Number(s.price) || 0,
        quantity: Number(s.quantity) || 1,
        description: s.description || "",
        paymentStatus: "Pending",
      }))
    );
    formData.append("serviceItems", servicesJson);
    formData.append("services", servicesJson);

    // ✅ Just append files — no JSON metadata
    uploadedReports.forEach((r) => {
      if (r.file) {
        formData.append("reports", r.file, r.name);
      }
    });

    uploadedPrescriptions.forEach((p) => {
      if (p.file) {
        formData.append("prescriptions", p.file, p.name);
      }
    });

    try {
      const bookRes = await axios.post(`${API_BASE_URL}/appointment-slots/book-online`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (bookRes && bookRes.data && bookRes.data.slot) {
        const updatedDbSlot = bookRes.data.slot;
        setAllSlots((prev) =>
          prev.map((s) => (s._id === selectedSlot._id || s.slotId === selectedSlot.slotId ? updatedDbSlot : s))
        );
      } else {
        setAllSlots((prev) => prev.map((s) => (s._id === selectedSlot._id ? { ...s, status: "booked" } : s)));
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
        purpose: bookingType === "online" ? "Doctor Consultation" : purpose.trim(),
        date: selectedDate,
        dayOfWeek: dayOfWeekName,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        shift: selectedSlot.shift,
        duration: selectedSlot.duration,
        doctorName: selectedDoc?.name || "",
        doctorSpecialization: selectedDoc?.specialization || "",
        clinicName: selectedClinic?.name || "",
        bookingType: bookingType === "walkin" ? "Walk-In" : "Online",
        reports: uploadedReports.map((r) => r.name),
        prescriptions: uploadedPrescriptions.map((p) => p.name),
        services: selectedServices.map((s) => ({
          name: s.name,
          price: Number(s.price) || 0,
          quantity: Number(s.quantity) || 1,
          total: (Number(s.price) || 0) * (Number(s.quantity) || 1),
        })),
        subtotal,
        finalPayable,
        paymentStatus: "Pending",
        amountPaid: 0,
        balanceAmount: finalPayable,
        paymentType,
      });

      showToast(`Appointment confirmed for ${patientName}.`, "success");
      resetAll();
    } catch (error) {
      console.error("Booking error:", error);
      showToast(
        error?.response?.data?.message || "We couldn't complete the booking. Please try again.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepLabels = ["Category", "Clinic", "Doctor", "Type", "Slot", "Details"];

  const renderStepIndicator = () => (
    <div className="mb-6 md:mb-8">
      <div className="flex md:hidden items-center gap-2 overflow-x-auto pb-2 px-1 -mx-4 scrollbar-hide">
        {stepLabels.map((label, idx) => {
          const isActive = idx === currentStep;
          const isPast = idx < currentStep;
          const accent = idx % 2 === 0 ? BLUE : GREEN;

          return (
            <div
              key={`m-${label}`}
              className="flex items-center gap-2 px-3.5 py-2 rounded-full text-[11px] font-bold whitespace-nowrap transition-all flex-shrink-0"
              style={{
                backgroundColor: isActive ? accent : isPast ? `${accent}15` : "#F2F4F3",
                color: isActive ? "#FFFFFF" : isPast ? accent : "#9AA5A0",
                boxShadow: isActive ? `0 4px 12px ${accent}40` : "none",
              }}
            >
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black"
                style={{
                  backgroundColor: isActive ? "rgba(255,255,255,0.25)" : isPast ? accent : "#E2E6E3",
                  color: isActive ? "#FFFFFF" : isPast ? "#FFFFFF" : "#8A948F",
                }}
              >
                {isPast ? <Check className="w-3 h-3" /> : idx + 1}
              </span>
              {label}
            </div>
          );
        })}
      </div>

      <div className="hidden md:flex items-center justify-center gap-2 overflow-x-auto pb-2">
        {stepLabels.map((label, idx) => {
          const isActive = idx === currentStep;
          const isPast = idx < currentStep;
          const accent = idx % 2 === 0 ? BLUE : GREEN;
          const accentDark = idx % 2 === 0 ? BLUE_DARK : GREEN_DARK;
          const accentLight = idx % 2 === 0 ? BLUE_LIGHT : GREEN_LIGHT;

          return (
            <React.Fragment key={`d-${label}`}>
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all"
                style={{
                  backgroundColor: isActive ? accent : isPast ? accentLight : "#F7F8F7",
                  color: isActive ? "#FFFFFF" : isPast ? accentDark : "#B7BFBB",
                  boxShadow: isActive ? `0 4px 10px ${idx % 2 === 0 ? BLUE_SHADOW : GREEN_SHADOW}` : "none",
                }}
              >
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{
                    backgroundColor: isActive ? "#FFFFFF" : isPast ? accent : "#E4E7E4",
                    color: isActive ? accent : isPast ? "#FFFFFF" : "#8A948F",
                  }}
                >
                  {isPast ? <Check className="w-3 h-3" /> : idx + 1}
                </span>
                {label}
              </div>
              {idx < stepLabels.length - 1 && (
                <div
                  className="w-4 h-px flex-shrink-0"
                  style={{
                    backgroundColor: idx < currentStep ? (idx % 2 === 0 ? BLUE_BORDER : GREEN_BORDER) : "#E4E7E4",
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );

  const isOnline = bookingType === "online";

  return (
    <>
      <TimelyNavbar />
      <div className="min-h-screen bg-[#F7F8F7] text-[#1A2421] font-sans">
        {toast && (
          <div
            role="status"
            className="fixed top-6 right-6 z-[60] flex items-center gap-3 px-5 py-3.5 rounded-lg shadow-lg text-white text-sm font-medium transition-all"
            style={{ backgroundColor: toast.type === "error" ? "#B3261E" : GREEN }}
          >
            {toast.type === "error" ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        )}

        {/* ==================== BANNER SLIDER ==================== */}
        <section className="relative mt-16 md:mt-20 w-full">
          <div className="hidden sm:block relative w-full h-[200px] sm:h-[230px] md:h-[260px] lg:h-[280px] overflow-hidden">
            {BANNER_SLIDES.map((s, idx) => (
              <div
                key={s.id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`}
              >
                <img src={s.image} alt={s.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 max-w-7xl mx-auto px-6 md:px-10 flex items-center">
                  <div
                    className="max-w-2xl backdrop-blur-sm rounded-2xl p-4 md:p-6 border-l-4"
                    style={{
                      backgroundColor: "rgba(0,0,0,0.4)",
                      borderLeftColor: idx % 2 === 0 ? GREEN : BLUE,
                    }}
                  >
                    <p
                      className="text-[10px] md:text-xs font-semibold tracking-widest uppercase mb-1.5 md:mb-2"
                      style={{ color: idx % 2 === 0 ? "#7FDCBB" : "#8FB8EB" }}
                    >
                      {s.tagline}
                    </p>
                    <h1 className="text-lg sm:text-xl md:text-3xl lg:text-4xl font-semibold text-white tracking-tight leading-tight">
                      {s.title}
                    </h1>
                    <p className="hidden md:block mt-3 text-xs md:text-sm text-white/90 leading-relaxed max-w-xl">
                      {s.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous slide"
              className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-10 md:h-10 rounded-full backdrop-blur-sm border border-white/40 flex items-center justify-center text-white transition-all hover:scale-105"
              style={{ backgroundColor: `${BLUE}80` }}
            >
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next slide"
              className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-10 md:h-10 rounded-full backdrop-blur-sm border border-white/40 flex items-center justify-center text-white transition-all hover:scale-105"
              style={{ backgroundColor: `${GREEN}80` }}
            >
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
              {BANNER_SLIDES.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => goToSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className="rounded-full transition-all"
                  style={{
                    width: idx === currentSlide ? "24px" : "8px",
                    height: "8px",
                    backgroundColor: idx === currentSlide ? GREEN : "rgba(255,255,255,0.6)",
                  }}
                />
              ))}
            </div>
          </div>

          <div className="block sm:hidden px-4 pt-3">
            <div className="relative w-full h-[130px] rounded-2xl overflow-hidden shadow-lg">
              {BANNER_SLIDES.map((s, idx) => (
                <div
                  key={s.id}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                    }`}
                >
                  <img src={s.image} alt={s.title} className="w-full h-full object-cover" />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(120deg, ${BLUE_DARK}F5 0%, ${BLUE}C0 55%, ${GREEN}60 100%)`,
                    }}
                  />
                  <div className="absolute inset-0 px-4 py-3 flex flex-col justify-center">
                    <p className="text-[9px] font-black tracking-widest uppercase mb-1" style={{ color: "#7FDCBB" }}>
                      {s.tagline}
                    </p>
                    <h2 className="text-[14px] font-bold text-white leading-snug pr-14 line-clamp-2">
                      {s.title}
                    </h2>
                  </div>
                </div>
              ))}

              <div className="absolute bottom-2 right-3 z-20 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={prevSlide}
                  aria-label="Previous slide"
                  className="w-5 h-5 rounded-full backdrop-blur-sm flex items-center justify-center text-white"
                  style={{ backgroundColor: "rgba(255,255,255,0.25)" }}
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                {BANNER_SLIDES.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => goToSlide(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className="rounded-full transition-all"
                    style={{
                      width: idx === currentSlide ? "16px" : "6px",
                      height: "6px",
                      backgroundColor: idx === currentSlide ? "#FFFFFF" : "rgba(255,255,255,0.5)",
                    }}
                  />
                ))}
                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="Next slide"
                  className="w-5 h-5 rounded-full backdrop-blur-sm flex items-center justify-center text-white"
                  style={{ backgroundColor: "rgba(255,255,255,0.25)" }}
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== MAIN CONTENT ==================== */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-14">
          {renderStepIndicator()}

          {/* STEP 1: CATEGORY */}
          {currentStep === STEPS.CATEGORY && (
            <div>
              <div className="text-center mb-8 md:mb-14">
                <h2 className="text-xl md:text-3xl font-bold text-[#1A2421] tracking-tight">
                  What are you looking for?
                </h2>
                <p className="mt-2 text-xs md:text-sm text-[#5B6B65]">Select a category to get started</p>
              </div>

              <div className="flex flex-wrap items-start justify-center gap-8 md:gap-16 lg:gap-20 max-w-4xl mx-auto">
                <button
                  type="button"
                  onClick={() => handleCategorySelect("doctor_consultation")}
                  className="group flex flex-col items-center gap-4 focus:outline-none"
                >
                  <div
                    className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white flex items-center justify-center transition-all duration-300 group-hover:-translate-y-1 overflow-hidden border-2 border-[#E4E7E4]"
                    style={{
                      boxShadow: `0 10px 25px -5px ${BLUE_SHADOW}, 0 8px 10px -6px ${BLUE_SHADOW}`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = BLUE;
                      e.currentTarget.style.boxShadow = `0 20px 40px -10px ${BLUE_SHADOW}, 0 12px 20px -8px ${GREEN_SHADOW}`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#E4E7E4";
                      e.currentTarget.style.boxShadow = `0 10px 25px -5px ${BLUE_SHADOW}, 0 8px 10px -6px ${BLUE_SHADOW}`;
                    }}
                  >
                    <img
                      src={doctorConsultationImg}
                      alt="Doctor Consultation"
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <span className="text-sm md:text-base font-semibold text-[#1A2421] text-center leading-tight max-w-[140px] group-hover:hidden">
                    Doctor Consultation
                  </span>
                  <span
                    className="text-sm md:text-base font-semibold text-center leading-tight max-w-[140px] hidden group-hover:block"
                    style={{ color: BLUE }}
                  >
                    Doctor Consultation
                  </span>
                </button>

                <div className="flex flex-col items-center gap-4 opacity-60 cursor-not-allowed">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white border-2 border-dashed border-[#E4E7E4] flex items-center justify-center shadow-sm overflow-hidden">
                    <img src={labTestImg} alt="Lab Tests" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-sm md:text-base font-semibold text-[#B7BFBB] text-center leading-tight max-w-[140px]">
                    Lab Tests
                  </span>
                </div>

                <div className="flex flex-col items-center gap-4 opacity-60 cursor-not-allowed">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white border-2 border-dashed border-[#E4E7E4] flex items-center justify-center shadow-sm">
                    <UserPlus className="w-14 h-14 md:w-16 md:h-16 text-[#B7BFBB]" />
                  </div>
                  <span className="text-sm md:text-base font-semibold text-[#B7BFBB] text-center leading-tight max-w-[140px]">
                    Health Packages
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: CLINIC */}
          {currentStep === STEPS.CLINIC && (
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-6 md:mb-8">
                <h2 className="text-xl md:text-3xl font-bold text-[#1A2421] tracking-tight">
                  Choose a clinic
                </h2>
                <p className="mt-2 text-xs md:text-sm text-[#5B6B65]">
                  Select the clinic where you'd like to book your appointment
                </p>
              </div>

              <div className="mb-5 md:mb-6 max-w-md mx-auto">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-3.5" style={{ color: BLUE }} />
                  <input
                    type="text"
                    placeholder="Search clinics by name or city..."
                    value={clinicSearch}
                    onChange={(e) => setClinicSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#D7DCD9] rounded-xl text-sm outline-none shadow-sm"
                    onFocus={(e) => {
                      e.target.style.borderColor = BLUE;
                      e.target.style.boxShadow = `0 0 0 4px ${BLUE}15`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#D7DCD9";
                      e.target.style.boxShadow = "0 1px 2px rgba(0,0,0,0.03)";
                    }}
                  />
                </div>
              </div>

              {clinicsLoading ? (
                <div className="py-16 text-center">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3" style={{ color: BLUE }} />
                  <p className="text-sm font-medium text-[#5B6B65]">Loading clinics...</p>
                </div>
              ) : filteredClinics.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#E4E7E4] py-16 text-center">
                  <Building2 className="w-12 h-12 text-[#B7BFBB] mx-auto mb-3" />
                  <p className="text-sm font-medium text-[#5B6B65]">No clinics available.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {filteredClinics.map((clinic, cIdx) => {
                    const isDefault = (clinic._id || clinic.id) === DEFAULT_CLINIC._id;
                    const accent = cIdx % 2 === 0 ? BLUE : GREEN;
                    const accentLight = cIdx % 2 === 0 ? BLUE_LIGHT : GREEN_LIGHT;
                    const accentDark = cIdx % 2 === 0 ? BLUE_DARK : GREEN_DARK;

                    return (
                      <button
                        key={clinic._id || clinic.id}
                        type="button"
                        onClick={() => handleClinicSelect(clinic)}
                        className="group text-left bg-white rounded-2xl border-2 transition-all p-4 md:p-5 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.99]"
                        style={{
                          borderColor: isDefault ? `${accent}55` : "#E4E7E4",
                          boxShadow: "0 2px 8px rgba(15,92,77,0.04)",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = accent)}
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.borderColor = isDefault ? `${accent}55` : "#E4E7E4")
                        }
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div
                            className="w-12 h-12 md:w-11 md:h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
                            style={{
                              background: `linear-gradient(135deg, ${accentLight}, ${accent}25)`,
                            }}
                          >
                            <Building2 className="w-5 h-5 md:w-5 md:h-5" style={{ color: accent }} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-[15px] md:text-sm font-bold text-[#1A2421] truncate">
                                {clinic.name || "Unnamed Clinic"}
                              </h3>
                              {isDefault && (
                                <span
                                  className="text-[9px] font-black text-white px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0"
                                  style={{ backgroundColor: accent }}
                                >
                                  Default
                                </span>
                              )}
                            </div>
                            {clinic.city && (
                              <p className="text-[11px] md:text-xs text-[#8A948F] flex items-center gap-1 mt-1">
                                <MapPin className="w-3 h-3" /> {clinic.city}
                              </p>
                            )}
                          </div>
                        </div>
                        {clinic.address && (
                          <p className="text-[11px] md:text-xs text-[#5B6B65] leading-relaxed line-clamp-2 mb-3">
                            {clinic.address}
                          </p>
                        )}
                        <div
                          className="flex items-center justify-between text-xs font-bold pt-2 border-t border-dashed"
                          style={{ color: accentDark, borderColor: "#EEF1EF" }}
                        >
                          <span>Select clinic</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="mt-6 md:mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-2 px-6 py-3 md:px-5 md:py-2.5 text-sm font-semibold bg-white border-2 rounded-xl transition-colors"
                  style={{ color: BLUE_DARK, borderColor: BLUE_BORDER }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = BLUE_LIGHT)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: DOCTOR */}
          {currentStep === STEPS.DOCTOR && (
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-5 md:mb-6">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3"
                  style={{ backgroundColor: GREEN_LIGHT, color: GREEN_DARK }}
                >
                  <Building2 className="w-3 h-3" /> {selectedClinic?.name || "Clinic"}
                </div>
                <h2 className="text-xl md:text-3xl font-bold text-[#1A2421] tracking-tight">
                  Choose your doctor
                </h2>
                <p className="mt-2 text-xs md:text-sm text-[#5B6B65]">
                  Pick a specialist based on their experience & expertise
                </p>
              </div>

              <div className="mb-5 md:mb-6 space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-3.5" style={{ color: BLUE }} />
                    <input
                      type="text"
                      placeholder="Search doctors by name or specialization..."
                      value={doctorSearch}
                      onChange={(e) => setDoctorSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-[#D7DCD9] rounded-xl text-sm outline-none shadow-sm"
                      onFocus={(e) => {
                        e.target.style.borderColor = BLUE;
                        e.target.style.boxShadow = `0 0 0 4px ${BLUE}15`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#D7DCD9";
                        e.target.style.boxShadow = "0 1px 2px rgba(0,0,0,0.03)";
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowFilters((v) => !v)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold border-2 transition-colors"
                    style={
                      showFilters
                        ? { backgroundColor: BLUE, color: "#FFFFFF", borderColor: BLUE }
                        : { backgroundColor: "#FFFFFF", color: BLUE_DARK, borderColor: BLUE_BORDER }
                    }
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                    {(specializationFilter !== "all" || experienceFilter !== "all") && (
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: GREEN }} />
                    )}
                  </button>
                </div>

                {showFilters && (
                  <div
                    className="bg-white rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 shadow-sm border-2"
                    style={{ borderColor: GREEN_BORDER }}
                  >
                    <div>
                      <label
                        className="block text-[11px] font-black uppercase tracking-wider mb-1.5 flex items-center gap-1.5"
                        style={{ color: GREEN_DARK }}
                      >
                        <Filter className="w-3 h-3" /> Specialization
                      </label>
                      <div className="relative">
                        <select
                          value={specializationFilter}
                          onChange={(e) => setSpecializationFilter(e.target.value)}
                          className="w-full px-3 pr-8 py-2.5 bg-white border border-[#D7DCD9] rounded-lg text-sm outline-none appearance-none"
                          onFocus={(e) => (e.target.style.borderColor = GREEN)}
                          onBlur={(e) => (e.target.style.borderColor = "#D7DCD9")}
                        >
                          <option value="all">All specializations</option>
                          {specializations.map((spec) => (
                            <option key={spec} value={spec}>
                              {spec}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-[#8A948F] absolute right-2.5 top-3 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label
                        className="block text-[11px] font-black uppercase tracking-wider mb-1.5 flex items-center gap-1.5"
                        style={{ color: GREEN_DARK }}
                      >
                        <Briefcase className="w-3 h-3" /> Experience
                      </label>
                      <div className="relative">
                        <select
                          value={experienceFilter}
                          onChange={(e) => setExperienceFilter(e.target.value)}
                          className="w-full px-3 pr-8 py-2.5 bg-white border border-[#D7DCD9] rounded-lg text-sm outline-none appearance-none"
                          onFocus={(e) => (e.target.style.borderColor = GREEN)}
                          onBlur={(e) => (e.target.style.borderColor = "#D7DCD9")}
                        >
                          <option value="all">Any experience</option>
                          <option value="0-5">0 – 5 years</option>
                          <option value="5-10">5 – 10 years</option>
                          <option value="10-15">10 – 15 years</option>
                          <option value="15+">15+ years</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-[#8A948F] absolute right-2.5 top-3 pointer-events-none" />
                      </div>
                    </div>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => {
                          setDoctorSearch("");
                          setSpecializationFilter("all");
                          setExperienceFilter("all");
                        }}
                        className="w-full px-3 py-2.5 text-xs font-bold text-[#B3261E] bg-[#FCE9E7] hover:bg-[#F8D5D1] rounded-lg transition-colors"
                      >
                        Clear all filters
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-[#5B6B65]">
                  <span>
                    Showing <b style={{ color: BLUE }}>{filteredDoctors.length}</b> doctor
                    {filteredDoctors.length !== 1 ? "s" : ""}
                  </span>
                  {(specializationFilter !== "all" || experienceFilter !== "all" || doctorSearch) && (
                    <span className="text-[#8A948F] italic">Filters applied</span>
                  )}
                </div>
              </div>

              {doctorsLoading ? (
                <div className="py-16 text-center">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3" style={{ color: BLUE }} />
                  <p className="text-sm font-medium text-[#5B6B65]">Loading doctors...</p>
                </div>
              ) : filteredDoctors.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#E4E7E4] py-16 text-center">
                  <Stethoscope className="w-12 h-12 text-[#B7BFBB] mx-auto mb-3" />
                  <p className="text-sm font-medium text-[#5B6B65]">No doctors found matching your criteria.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setDoctorSearch("");
                      setSpecializationFilter("all");
                      setExperienceFilter("all");
                    }}
                    className="mt-3 text-xs font-bold hover:underline"
                    style={{ color: BLUE }}
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  {filteredDoctors.map((doc, dIdx) => {
                    const docId = doc._id || doc.id;
                    const isSelected = selectedDoctorId === docId;
                    const accent = dIdx % 2 === 0 ? BLUE : GREEN;
                    const accentDark = dIdx % 2 === 0 ? BLUE_DARK : GREEN_DARK;
                    const accentLight = dIdx % 2 === 0 ? BLUE_LIGHT : GREEN_LIGHT;

                    return (
                      <button
                        key={docId}
                        type="button"
                        onClick={() => handleDoctorSelect(doc)}
                        className="text-left bg-white rounded-2xl border-2 transition-all p-4 md:p-5 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.99]"
                        style={{
                          borderColor: isSelected ? accent : "#E4E7E4",
                          boxShadow: isSelected ? `0 4px 16px ${accent}30` : "0 2px 8px rgba(15,92,77,0.04)",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = accent)}
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.borderColor = isSelected ? accent : "#E4E7E4")
                        }
                      >
                        <div className="flex items-start gap-3.5 md:gap-4">
                          <div className="relative flex-shrink-0">
                            <div
                              className="w-14 h-14 md:w-14 md:h-14 rounded-full flex items-center justify-center"
                              style={{ background: `linear-gradient(135deg, ${accent}, ${accentDark})` }}
                            >
                              <span className="text-white text-lg md:text-lg font-bold">
                                {(doc.name || "D").charAt(0).toUpperCase()}
                              </span>
                            </div>
                            {isSelected && (
                              <div
                                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white"
                                style={{ backgroundColor: accent }}
                              >
                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-[15px] md:text-base font-bold text-[#1A2421] truncate">
                              {doc.name || "Unnamed Doctor"}
                            </h3>
                            {doc.specialization && (
                              <div
                                className="flex items-center gap-1.5 text-xs font-bold mt-1"
                                style={{ color: accent }}
                              >
                                <Award className="w-3 h-3" /> {doc.specialization}
                              </div>
                            )}
                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#5B6B65]">
                              {doc.experience && (
                                <span className="flex items-center gap-1">
                                  <Briefcase className="w-3 h-3" /> {doc.experience} yrs exp
                                </span>
                              )}
                              {doc.qualification && <span className="truncate">{doc.qualification}</span>}
                            </div>
                            {doc.consultationFee && (
                              <div
                                className="mt-2.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold"
                                style={{ backgroundColor: accentLight, color: accentDark }}
                              >
                                Consultation: ₹{doc.consultationFee}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="mt-6 md:mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-2 px-6 py-3 md:px-5 md:py-2.5 text-sm font-semibold bg-white border-2 rounded-xl transition-colors"
                  style={{ color: BLUE_DARK, borderColor: BLUE_BORDER }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = BLUE_LIGHT)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: BOOKING TYPE */}
          {currentStep === STEPS.BOOKING_TYPE && (
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-6 md:mb-8">
                <h2 className="text-xl md:text-3xl font-bold text-[#1A2421] tracking-tight">
                  Select booking type
                </h2>
                <p className="mt-2 text-xs md:text-sm text-[#5B6B65]">
                  Choose how you'd like to consult with the doctor
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                <button
                  type="button"
                  onClick={() => handleBookingTypeSelect("walkin")}
                  className="group text-left bg-white rounded-2xl border-2 transition-all p-5 md:p-6 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.99]"
                  style={{ borderColor: bookingType === "walkin" ? GREEN : "#E4E7E4" }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = GREEN)}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = bookingType === "walkin" ? GREEN : "#E4E7E4")
                  }
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors"
                    style={{ background: `linear-gradient(135deg, ${GREEN_LIGHT}, ${GREEN}25)` }}
                  >
                    <Footprints className="w-7 h-7" style={{ color: GREEN_DARK }} />
                  </div>
                  <h3 className="text-base md:text-lg font-bold text-[#1A2421] mb-1.5">Walk-In</h3>
                  <p className="text-sm text-[#5B6B65] leading-relaxed">
                    Visit the clinic in person for your consultation
                  </p>
                  <div
                    className="mt-4 flex items-center justify-between text-sm font-bold"
                    style={{ color: GREEN_DARK }}
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleBookingTypeSelect("online")}
                  className="group text-left bg-white rounded-2xl border-2 transition-all p-5 md:p-6 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.99]"
                  style={{ borderColor: bookingType === "online" ? BLUE : "#E4E7E4" }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = BLUE)}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = bookingType === "online" ? BLUE : "#E4E7E4")
                  }
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors"
                    style={{ background: `linear-gradient(135deg, ${BLUE_LIGHT}, ${BLUE}25)` }}
                  >
                    <Video className="w-7 h-7" style={{ color: BLUE_DARK }} />
                  </div>
                  <h3 className="text-base md:text-lg font-bold text-[#1A2421] mb-1.5">Online</h3>
                  <p className="text-sm text-[#5B6B65] leading-relaxed">
                    Consult with the doctor via video call from home
                  </p>
                  <div
                    className="mt-4 flex items-center justify-between text-sm font-bold"
                    style={{ color: BLUE_DARK }}
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>

              <div className="mt-6 md:mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-2 px-6 py-3 md:px-5 md:py-2.5 text-sm font-semibold bg-white border-2 rounded-xl transition-colors"
                  style={{ color: BLUE_DARK, borderColor: BLUE_BORDER }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = BLUE_LIGHT)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: SLOT */}
          {currentStep === STEPS.SLOT && (
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-6 md:mb-8">
                <h2 className="text-xl md:text-3xl font-bold text-[#1A2421] tracking-tight">
                  Pick a date & slot
                </h2>
                <p className="mt-2 text-xs md:text-sm text-[#5B6B65]">
                  Select your preferred appointment date and time
                </p>
              </div>

              <div
                className="bg-white rounded-2xl p-4 md:p-5 mb-5 md:mb-6 max-w-md mx-auto shadow-sm border-2"
                style={{ borderColor: BLUE_BORDER }}
              >
                <label
                  className="text-xs font-bold mb-2 flex items-center gap-1.5"
                  style={{ color: BLUE_DARK }}
                >
                  <CalendarDays className="w-3.5 h-3.5" /> Appointment date{" "}
                  <span className="text-[#B3261E]">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3.5 py-3 bg-white border border-[#D7DCD9] rounded-xl text-sm outline-none"
                  onFocus={(e) => {
                    e.target.style.borderColor = BLUE;
                    e.target.style.boxShadow = `0 0 0 4px ${BLUE}15`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#D7DCD9";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <p className="mt-2 text-[11px] text-[#5B6B65]">
                  Day: <span className="font-bold text-[#1A2421]">{dayOfWeekName}</span>
                </p>
              </div>

              {selectedSlot && (
                <div
                  className="max-w-2xl mx-auto mb-5 md:mb-6 rounded-2xl p-4 flex items-center justify-between border-l-4"
                  style={{ backgroundColor: GREEN_LIGHT, borderLeftColor: GREEN }}
                >
                  <div>
                    <div
                      className="text-[10px] uppercase tracking-wider font-black"
                      style={{ color: GREEN_DARK }}
                    >
                      Selected slot
                    </div>
                    <div className="text-base font-bold text-[#1A2421]">
                      {selectedSlot.startTime} – {selectedSlot.endTime}
                    </div>
                    <div className="text-xs text-[#5B6B65] mt-0.5">{selectedSlot.shift}</div>
                  </div>
                  <Check className="w-6 h-6 shrink-0" style={{ color: GREEN_DARK }} strokeWidth={3} />
                </div>
              )}

              <div className="bg-white rounded-2xl border border-[#E4E7E4] p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E4E7E4] pb-4 mb-5 md:mb-6">
                  <div>
                    <h3 className="text-sm md:text-base font-bold text-[#1A2421]">
                      Available slots for {dayOfWeekName}
                    </h3>
                    <p className="text-[11px] md:text-xs text-[#8A948F] mt-0.5">
                      {isToday
                        ? "Only upcoming slots are shown (past slots hidden)"
                        : "Only available slots are shown below"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#5B6B65]">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: BLUE }} />
                    Available
                  </div>
                </div>

                {loadingSlots ? (
                  <div className="py-16 text-center">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3" style={{ color: BLUE }} />
                    <p className="text-sm font-medium text-[#5B6B65]">Loading slots for {dayOfWeekName}…</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 font-bold text-[#1A2421] text-sm">
                          <Sun className="w-4 h-4 text-[#E8A33D]" />
                          <span>
                            Morning shift{" "}
                            <span className="font-normal text-[#8A948F] text-xs">(09:00 AM – 02:00 PM)</span>
                          </span>
                        </div>
                        <span
                          className="text-xs px-2.5 py-0.5 rounded-full font-bold"
                          style={{ backgroundColor: BLUE_LIGHT, color: BLUE_DARK }}
                        >
                          {morningSlots.length} available
                        </span>
                      </div>

                      {morningSlots.length === 0 ? (
                        <p className="text-xs text-[#8A948F] italic py-2">
                          {isToday ? "No upcoming morning slots available." : "No morning slots available."}
                        </p>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 md:gap-3">
                          {morningSlots.map((slot) => (
                            <AppointmentSlotTile
                              key={slot._id || slot.slotId}
                              slot={slot}
                              isSelected={
                                selectedSlot &&
                                (selectedSlot._id === slot._id || selectedSlot.slotId === slot.slotId)
                              }
                              onSelect={() => handleSlotSelect(slot)}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {breakSlots.length > 0 && !isToday && (
                      <div className="bg-[#F7F8F7] border border-[#E4E7E4] p-3.5 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 font-medium text-[#3F4A45]">
                          <Coffee className="w-4 h-4 text-[#8A948F]" />
                          <span>
                            Break & sanitization{" "}
                            <span className="font-normal text-[#8A948F]">(02:00 PM – 03:00 PM)</span>
                          </span>
                        </div>
                        <span className="bg-[#E4E7E4] text-[#5B6B65] text-[10px] font-bold px-2.5 py-0.5 rounded uppercase">
                          No booking
                        </span>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 font-bold text-[#1A2421] text-sm">
                          <Moon className="w-4 h-4" style={{ color: BLUE }} />
                          <span>
                            Evening shift{" "}
                            <span className="font-normal text-[#8A948F] text-xs">(03:00 PM – 09:00 PM)</span>
                          </span>
                        </div>
                        <span
                          className="text-xs px-2.5 py-0.5 rounded-full font-bold"
                          style={{ backgroundColor: GREEN_LIGHT, color: GREEN_DARK }}
                        >
                          {eveningSlots.length} available
                        </span>
                      </div>

                      {dayOfWeekName === "Sunday" ? (
                        <div className="bg-[#F7F8F7] p-5 rounded-xl text-center border border-[#E4E7E4] text-xs text-[#5B6B65]">
                          Evening shift is closed on Sundays. OP runs 09:00 AM – 02:00 PM.
                        </div>
                      ) : eveningSlots.length === 0 ? (
                        <p className="text-xs text-[#8A948F] italic py-2">
                          {isToday ? "No upcoming evening slots available." : "No evening slots available."}
                        </p>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 md:gap-3">
                          {eveningSlots.map((slot) => (
                            <AppointmentSlotTile
                              key={slot._id || slot.slotId}
                              slot={slot}
                              isSelected={
                                selectedSlot &&
                                (selectedSlot._id === slot._id || selectedSlot.slotId === slot.slotId)
                              }
                              onSelect={() => handleSlotSelect(slot)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 md:mt-8 flex flex-col sm:flex-row justify-between gap-3 max-w-2xl mx-auto">
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 md:px-5 md:py-2.5 text-sm font-semibold bg-white border-2 rounded-xl transition-colors"
                  style={{ color: BLUE_DARK, borderColor: BLUE_BORDER }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = BLUE_LIGHT)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={handleSlotContinue}
                  disabled={!selectedSlot}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 md:px-6 md:py-2.5 text-sm font-bold rounded-xl transition-all"
                  style={
                    selectedSlot
                      ? {
                        backgroundColor: GREEN,
                        color: "#FFFFFF",
                        boxShadow: `0 6px 16px ${GREEN_SHADOW}`,
                      }
                      : { backgroundColor: "#E4E7E4", color: "#8A948F", cursor: "not-allowed" }
                  }
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: DETAILS */}
          {currentStep === STEPS.DETAILS && (
            <div>
              <div className="text-center mb-6 md:mb-8">
                <h2 className="text-xl md:text-3xl font-bold text-[#1A2421] tracking-tight">
                  Patient details & payment
                </h2>
                <p className="mt-2 text-xs md:text-sm text-[#5B6B65]">
                  Fill in patient information to confirm your booking
                </p>
              </div>

              <div
                className="max-w-5xl mx-auto mb-5 md:mb-6 bg-white rounded-2xl p-3.5 md:p-4 shadow-sm border-2"
                style={{ borderColor: BLUE_BORDER }}
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-wider" style={{ color: BLUE }}>
                      Clinic
                    </div>
                    <div className="font-bold text-[#1A2421] truncate mt-0.5">
                      {selectedClinic?.name || "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-wider" style={{ color: GREEN }}>
                      Doctor
                    </div>
                    <div className="font-bold text-[#1A2421] truncate mt-0.5">
                      {doctors.find((d) => (d._id || d.id) === selectedDoctorId)?.name || "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-wider" style={{ color: BLUE }}>
                      Booking Type
                    </div>
                    <div className="font-bold text-[#1A2421] mt-0.5">
                      {bookingType === "walkin" ? "Walk-In" : bookingType === "online" ? "Online" : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-wider" style={{ color: GREEN }}>
                      Slot
                    </div>
                    <div className="font-bold text-[#1A2421] mt-0.5">
                      {selectedSlot ? `${selectedSlot.startTime} – ${selectedSlot.endTime}` : "—"}
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmitBooking}>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-6xl mx-auto pb-8 lg:pb-0">
                  {/* LEFT */}
                  <div className="lg:col-span-7 space-y-5 md:space-y-6">
                    <div className="bg-white rounded-2xl border border-[#E4E7E4] overflow-hidden">
                      <div
                        className="px-5 md:px-6 py-4 md:py-5 border-b border-[#E4E7E4]"
                        style={{ background: `linear-gradient(to right, ${BLUE_LIGHT}, transparent)` }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <UserPlus className="w-4 h-4" style={{ color: BLUE }} />
                          </div>
                          <div>
                            <h2 className="text-sm font-bold text-[#1A2421]">Patient details</h2>
                            <p className="text-xs text-[#5B6B65]">Enter patient information</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-5 md:p-6 space-y-4">
                        <div className="grid grid-cols-[110px_1fr] gap-3">
                          <div>
                            <label className="block text-xs font-medium text-[#3F4A45] mb-1.5">
                              Title <span className="text-[#B3261E]">*</span>
                            </label>
                            <div className="relative">
                              <select
                                value={patientTitle}
                                onChange={handleTitleChange}
                                className="w-full pl-3 pr-7 py-2.5 bg-white border border-[#D7DCD9] rounded-lg text-sm outline-none appearance-none"
                                onFocus={(e) => (e.target.style.borderColor = BLUE)}
                                onBlur={(e) => (e.target.style.borderColor = "#D7DCD9")}
                              >
                                {TITLE_OPTIONS.map((t) => (
                                  <option key={t.value} value={t.value}>
                                    {t.label}
                                  </option>
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
                              <User className="w-4 h-4 absolute left-3 top-2.5" style={{ color: BLUE }} />
                              <input
                                type="text"
                                required
                                placeholder="Patient's full name"
                                value={patientName}
                                onChange={(e) => setPatientName(e.target.value)}
                                className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#D7DCD9] rounded-lg text-sm outline-none"
                                onFocus={(e) => {
                                  e.target.style.borderColor = BLUE;
                                  e.target.style.boxShadow = `0 0 0 3px ${BLUE}22`;
                                }}
                                onBlur={(e) => {
                                  e.target.style.borderColor = "#D7DCD9";
                                  e.target.style.boxShadow = "none";
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-[#3F4A45] mb-1.5 flex items-center gap-1.5">
                              <Cake className="w-3.5 h-3.5" style={{ color: BLUE }} /> Date of birth
                            </label>
                            <input
                              type="date"
                              max={todayStr}
                              value={patientDob}
                              onChange={handleDobChange}
                              className="w-full px-3.5 py-2.5 bg-white border border-[#D7DCD9] rounded-lg text-sm outline-none"
                              onFocus={(e) => {
                                e.target.style.borderColor = BLUE;
                                e.target.style.boxShadow = `0 0 0 3px ${BLUE}22`;
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor = "#D7DCD9";
                                e.target.style.boxShadow = "none";
                              }}
                            />
                            <p className="mt-1 text-[10px] text-[#8A948F]">Age auto-calculated</p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-[#3F4A45] mb-1.5">
                              Age <span className="text-[#B3261E]">*</span>
                            </label>
                            <div className="relative">
                              <Calendar className="w-4 h-4 absolute left-3 top-2.5" style={{ color: BLUE }} />
                              <input
                                type="number"
                                required
                                min="0"
                                max="120"
                                placeholder="28"
                                value={patientAge}
                                onChange={(e) => setPatientAge(e.target.value)}
                                className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#D7DCD9] rounded-lg text-sm outline-none"
                                onFocus={(e) => {
                                  e.target.style.borderColor = BLUE;
                                  e.target.style.boxShadow = `0 0 0 3px ${BLUE}22`;
                                }}
                                onBlur={(e) => {
                                  e.target.style.borderColor = "#D7DCD9";
                                  e.target.style.boxShadow = "none";
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-[#3F4A45] mb-1.5">
                            Gender <span className="text-[#B3261E]">*</span>
                          </label>
                          <div className="relative">
                            <UserRound className="w-4 h-4 absolute left-3 top-2.5" style={{ color: BLUE }} />
                            <select
                              value={patientGender}
                              onChange={(e) => setPatientGender(e.target.value)}
                              className="w-full pl-9 pr-8 py-2.5 bg-white border border-[#D7DCD9] rounded-lg text-sm outline-none appearance-none"
                              onFocus={(e) => (e.target.style.borderColor = BLUE)}
                              onBlur={(e) => (e.target.style.borderColor = "#D7DCD9")}
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
                            <label className="block text-xs font-medium text-[#3F4A45] mb-1.5">
                              Phone <span className="text-[#B3261E]">*</span>
                            </label>
                            <input
                              type="tel"
                              required
                              placeholder="9876543210"
                              value={patientPhone}
                              onChange={(e) => setPatientPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                              className="w-full px-3.5 py-2.5 bg-white border border-[#D7DCD9] rounded-lg text-sm outline-none"
                              onFocus={(e) => {
                                e.target.style.borderColor = BLUE;
                                e.target.style.boxShadow = `0 0 0 3px ${BLUE}22`;
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor = "#D7DCD9";
                                e.target.style.boxShadow = "none";
                              }}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-[#3F4A45] mb-1.5">Email</label>
                            <input
                              type="email"
                              placeholder="patient@email.com"
                              value={patientEmail}
                              onChange={(e) => setPatientEmail(e.target.value)}
                              className="w-full px-3.5 py-2.5 bg-white border border-[#D7DCD9] rounded-lg text-sm outline-none"
                              onFocus={(e) => {
                                e.target.style.borderColor = BLUE;
                                e.target.style.boxShadow = `0 0 0 3px ${BLUE}22`;
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor = "#D7DCD9";
                                e.target.style.boxShadow = "none";
                              }}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-[#3F4A45] mb-1.5">
                            Address <span className="text-[#B3261E]">*</span>
                          </label>
                          <div className="relative">
                            <MapPin className="w-4 h-4 absolute left-3 top-2.5" style={{ color: BLUE }} />
                            <textarea
                              required
                              rows={2}
                              placeholder="Residential address"
                              value={patientAddress}
                              onChange={(e) => setPatientAddress(e.target.value)}
                              className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#D7DCD9] rounded-lg text-sm resize-none outline-none"
                              onFocus={(e) => {
                                e.target.style.borderColor = BLUE;
                                e.target.style.boxShadow = `0 0 0 3px ${BLUE}22`;
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor = "#D7DCD9";
                                e.target.style.boxShadow = "none";
                              }}
                            />
                          </div>
                        </div>

                        {!isOnline && (
                          <div>
                            <label className="block text-xs font-medium text-[#3F4A45] mb-1.5">
                              Purpose of visit <span className="text-[#B3261E]">*</span>
                            </label>
                            <textarea
                              required
                              rows={2}
                              placeholder="e.g. General checkup, fever"
                              value={purpose}
                              onChange={(e) => setPurpose(e.target.value)}
                              className="w-full px-3.5 py-2.5 bg-white border border-[#D7DCD9] rounded-lg text-sm resize-none outline-none"
                              onFocus={(e) => {
                                e.target.style.borderColor = GREEN;
                                e.target.style.boxShadow = `0 0 0 3px ${GREEN}22`;
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor = "#D7DCD9";
                                e.target.style.boxShadow = "none";
                              }}
                            />
                          </div>
                        )}

                        {isOnline && (
                          <div
                            className="p-3.5 rounded-xl border"
                            style={{ backgroundColor: BLUE_LIGHT, borderColor: `${BLUE}33` }}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Video className="w-3.5 h-3.5" style={{ color: BLUE }} />
                              <span
                                className="text-xs font-black uppercase tracking-wider"
                                style={{ color: BLUE_DARK }}
                              >
                                Online Consultation
                              </span>
                            </div>
                            <p className="text-xs text-[#3F4A45]">
                              Purpose: <b>Doctor Consultation</b> (auto-set for online mode)
                            </p>
                          </div>
                        )}

                        {isOnline && (
                          <div className="space-y-4">
                            {/* REPORTS UPLOAD */}
                            <div
                              className="border-2 border-dashed rounded-2xl p-4"
                              style={{
                                borderColor: `${BLUE}4D`,
                                backgroundColor: `${BLUE_LIGHT}66`,
                              }}
                            >
                              <div className="flex items-center justify-between gap-2 mb-3">
                                <div className="flex items-center gap-2">
                                  <FlaskConical className="w-4 h-4" style={{ color: BLUE }} />
                                  <label
                                    className="text-xs font-black uppercase tracking-wider"
                                    style={{ color: BLUE_DARK }}
                                  >
                                    Upload Reports
                                  </label>
                                  <span className="text-[10px] text-[#5B6B65] font-normal">(Optional)</span>
                                  {uploadedReports.length > 0 && (
                                    <span
                                      className="text-[10px] font-black px-2 py-0.5 rounded-full"
                                      style={{ backgroundColor: BLUE, color: "#FFFFFF" }}
                                    >
                                      {uploadedReports.length}
                                    </span>
                                  )}
                                </div>
                                {uploadedReports.length > 0 && (
                                  <button
                                    type="button"
                                    onClick={clearAllReports}
                                    className="text-[10px] font-bold text-[#B3261E] hover:underline"
                                  >
                                    Clear all
                                  </button>
                                )}
                              </div>

                              <p className="text-[11px] text-[#5B6B65] mb-3">
                                Share lab reports, scans, or diagnostic documents to help the doctor prepare.
                                You can upload multiple files.
                              </p>

                              <input
                                id="report-upload"
                                type="file"
                                multiple
                                accept=".pdf,.jpg,.jpeg,.png,.webp"
                                onChange={handleReportUpload}
                                className="hidden"
                              />

                              <label
                                htmlFor="report-upload"
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border-2 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                                style={{ borderColor: BLUE, color: BLUE_DARK }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = BLUE;
                                  e.currentTarget.style.color = "#FFFFFF";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = "#FFFFFF";
                                  e.currentTarget.style.color = BLUE_DARK;
                                }}
                              >
                                <Upload className="w-3.5 h-3.5" />
                                {uploadedReports.length > 0 ? "Add More Reports" : "Choose Report Files"}
                              </label>

                              <p className="mt-2 text-[10px] text-[#8A948F]">
                                PDF, JPG, PNG, WEBP • Max 10MB per file • Multiple files allowed
                              </p>

                              {uploadedReports.length > 0 && (
                                <div className="mt-3 space-y-2">
                                  {uploadedReports.map((r, idx) => (
                                    <div
                                      key={`report-${r.name}-${idx}`}
                                      className="flex items-center justify-between gap-2 p-2.5 bg-white border rounded-xl"
                                      style={{ borderColor: `${BLUE}33` }}
                                    >
                                      <div className="flex items-center gap-2 min-w-0 flex-1">
                                        <div
                                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                          style={{ backgroundColor: BLUE_LIGHT }}
                                        >
                                          <FlaskConical className="w-4 h-4" style={{ color: BLUE }} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <div className="text-xs font-bold text-[#1A2421] truncate">
                                            {r.name}
                                          </div>
                                          <div className="text-[10px] text-[#8A948F]">
                                            {formatFileSize(r.size)}
                                          </div>
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => removeReport(idx)}
                                        className="w-7 h-7 rounded-lg bg-[#FCE9E7] text-[#B3261E] flex items-center justify-center hover:bg-[#F8D5D1] flex-shrink-0"
                                        title="Remove file"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* PRESCRIPTIONS UPLOAD */}
                            <div
                              className="border-2 border-dashed rounded-2xl p-4"
                              style={{
                                borderColor: `${GREEN}4D`,
                                backgroundColor: `${GREEN_LIGHT}66`,
                              }}
                            >
                              <div className="flex items-center justify-between gap-2 mb-3">
                                <div className="flex items-center gap-2">
                                  <Pill className="w-4 h-4" style={{ color: GREEN }} />
                                  <label
                                    className="text-xs font-black uppercase tracking-wider"
                                    style={{ color: GREEN_DARK }}
                                  >
                                    Upload Prescriptions
                                  </label>
                                  <span className="text-[10px] text-[#5B6B65] font-normal">(Optional)</span>
                                  {uploadedPrescriptions.length > 0 && (
                                    <span
                                      className="text-[10px] font-black px-2 py-0.5 rounded-full"
                                      style={{ backgroundColor: GREEN, color: "#FFFFFF" }}
                                    >
                                      {uploadedPrescriptions.length}
                                    </span>
                                  )}
                                </div>
                                {uploadedPrescriptions.length > 0 && (
                                  <button
                                    type="button"
                                    onClick={clearAllPrescriptions}
                                    className="text-[10px] font-bold text-[#B3261E] hover:underline"
                                  >
                                    Clear all
                                  </button>
                                )}
                              </div>

                              <p className="text-[11px] text-[#5B6B65] mb-3">
                                Share any existing prescriptions or doctor's notes for reference. You can
                                upload multiple files.
                              </p>

                              <input
                                id="prescription-upload"
                                type="file"
                                multiple
                                accept=".pdf,.jpg,.jpeg,.png,.webp"
                                onChange={handlePrescriptionUpload}
                                className="hidden"
                              />

                              <label
                                htmlFor="prescription-upload"
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border-2 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                                style={{ borderColor: GREEN, color: GREEN_DARK }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = GREEN;
                                  e.currentTarget.style.color = "#FFFFFF";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = "#FFFFFF";
                                  e.currentTarget.style.color = GREEN_DARK;
                                }}
                              >
                                <Upload className="w-3.5 h-3.5" />
                                {uploadedPrescriptions.length > 0
                                  ? "Add More Prescriptions"
                                  : "Choose Prescription Files"}
                              </label>

                              <p className="mt-2 text-[10px] text-[#8A948F]">
                                PDF, JPG, PNG, WEBP • Max 10MB per file • Multiple files allowed
                              </p>

                              {uploadedPrescriptions.length > 0 && (
                                <div className="mt-3 space-y-2">
                                  {uploadedPrescriptions.map((p, idx) => (
                                    <div
                                      key={`prescription-${p.name}-${idx}`}
                                      className="flex items-center justify-between gap-2 p-2.5 bg-white border rounded-xl"
                                      style={{ borderColor: `${GREEN}33` }}
                                    >
                                      <div className="flex items-center gap-2 min-w-0 flex-1">
                                        <div
                                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                          style={{ backgroundColor: GREEN_LIGHT }}
                                        >
                                          <Pill className="w-4 h-4" style={{ color: GREEN }} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <div className="text-xs font-bold text-[#1A2421] truncate">
                                            {p.name}
                                          </div>
                                          <div className="text-[10px] text-[#8A948F]">
                                            {formatFileSize(p.size)}
                                          </div>
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => removePrescription(idx)}
                                        className="w-7 h-7 rounded-lg bg-[#FCE9E7] text-[#B3261E] flex items-center justify-center hover:bg-[#F8D5D1] flex-shrink-0"
                                        title="Remove file"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-[#E4E7E4] overflow-hidden">
                      <div
                        className="px-5 md:px-6 py-4 md:py-5 border-b border-[#E4E7E4]"
                        style={{ background: `linear-gradient(to right, ${GREEN_LIGHT}, transparent)` }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                              <Receipt className="w-4 h-4" style={{ color: GREEN }} />
                            </div>
                            <div>
                              <h2 className="text-sm font-bold text-[#1A2421]">Services</h2>
                              <p className="text-xs text-[#5B6B65]">Add required services</p>
                            </div>
                          </div>
                          {selectedServices.length > 0 && (
                            <span
                              className="text-xs px-2.5 py-1 rounded-full font-bold"
                              style={{ backgroundColor: GREEN_LIGHT, color: GREEN_DARK }}
                            >
                              {selectedServices.length} selected
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-5 md:p-6 space-y-4">
                        <div className="relative">
                          <Search className="w-4 h-4 absolute left-3.5 top-3.5" style={{ color: GREEN }} />
                          <input
                            type="text"
                            placeholder="Search services by name..."
                            value={serviceSearch}
                            onChange={(e) => setServiceSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-[#D7DCD9] rounded-xl text-sm outline-none"
                            onFocus={(e) => {
                              e.target.style.borderColor = GREEN;
                              e.target.style.boxShadow = `0 0 0 4px ${GREEN}15`;
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = "#D7DCD9";
                              e.target.style.boxShadow = "none";
                            }}
                          />
                        </div>

                        <div className="max-h-64 overflow-y-auto border border-[#E4E7E4] rounded-xl divide-y divide-[#E4E7E4]">
                          {servicesLoading ? (
                            <div className="p-6 text-center text-xs text-[#8A948F]">
                              <RefreshCw className="w-4 h-4 animate-spin inline-block mr-2" /> Loading services...
                            </div>
                          ) : !serviceSearch.trim() ? (
                            <div className="p-6 text-center text-xs text-[#8A948F]">
                              Type service name to search...
                            </div>
                          ) : filteredServices.length === 0 ? (
                            <div className="p-6 text-center text-xs text-[#8A948F]">No services found.</div>
                          ) : (
                            filteredServices.map((svc) => {
                              const added = selectedServices.find((s) => s._id === svc._id);
                              return (
                                <div
                                  key={svc._id}
                                  className="flex items-center justify-between px-3.5 py-2.5 hover:bg-[#F7F8F7] transition-colors"
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="text-sm font-medium text-[#1A2421] truncate">
                                      {svc.name}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3 ml-3">
                                    <span
                                      className="text-sm font-bold whitespace-nowrap"
                                      style={{ color: GREEN_DARK }}
                                    >
                                      ₹{svc.price}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => addService(svc)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors"
                                      style={
                                        added
                                          ? { backgroundColor: GREEN_LIGHT, color: GREEN_DARK }
                                          : { backgroundColor: GREEN, color: "#FFFFFF" }
                                      }
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

                        {selectedServices.length > 0 && (
                          <div className="space-y-2 pt-2 border-t border-[#E4E7E4]">
                            <div className="text-[11px] font-black uppercase tracking-wider text-[#8A948F]">
                              Selected services
                            </div>
                            {selectedServices.map((s) => (
                              <div
                                key={s._id}
                                className="flex items-center justify-between gap-3 p-3 bg-[#F7F8F7] border border-[#E4E7E4] rounded-xl"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm font-bold text-[#1A2421] truncate">
                                    {s.name}
                                  </div>
                                  <div className="text-[11px] text-[#8A948F] mt-0.5">
                                    {s.quantity > 1 ? `${s.quantity} × ₹${s.price} = ` : ""}
                                    <span className="font-bold" style={{ color: GREEN_DARK }}>
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
                  </div>

                  {/* RIGHT — Billing & Payment */}
                  <div className="lg:col-span-5 space-y-5 md:space-y-6">
                    <div
                      className="bg-white rounded-2xl overflow-hidden lg:sticky lg:top-24 shadow-sm border-2"
                      style={{ borderColor: BLUE_BORDER }}
                    >
                      <div
                        className="px-5 md:px-6 py-4 md:py-5 border-b"
                        style={{
                          borderColor: BLUE_BORDER,
                          background: `linear-gradient(to right, ${BLUE_LIGHT}, transparent)`,
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <CreditCard className="w-4 h-4" style={{ color: BLUE }} />
                          </div>
                          <div>
                            <h2 className="text-sm font-bold text-[#1A2421]">Billing & payment</h2>
                            <p className="text-xs text-[#5B6B65]">Final step</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-5 md:p-6 space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-[#3F4A45] mb-1.5 flex items-center gap-1.5">
                            <Wallet className="w-3.5 h-3.5" style={{ color: BLUE }} /> Payment type
                          </label>
                          <div className="relative">
                            <select
                              value={paymentType}
                              onChange={(e) => setPaymentType(e.target.value)}
                              className="w-full px-3.5 pr-8 py-3 bg-white border border-[#D7DCD9] rounded-xl text-sm outline-none appearance-none"
                              onFocus={(e) => (e.target.style.borderColor = BLUE)}
                              onBlur={(e) => (e.target.style.borderColor = "#D7DCD9")}
                            >
                              <option value="cash">Cash</option>
                              <option value="card">Card</option>
                              <option value="upi">UPI</option>
                              <option value="netbanking">Net Banking</option>
                            </select>
                            <ChevronDown className="w-4 h-4 text-[#8A948F] absolute right-3 top-3.5 pointer-events-none" />
                          </div>
                        </div>

                        <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#FDF3DA] border border-[#F0DFA8] rounded-xl">
                          <span className="text-xs font-medium text-[#7A5300]">Payment status</span>
                          <span className="text-xs font-bold text-[#7A5300] uppercase tracking-wider">
                            Pending
                          </span>
                        </div>

                        {isOnline && (uploadedReports.length > 0 || uploadedPrescriptions.length > 0) && (
                          <div className="bg-[#F7F8F7] border border-[#E4E7E4] rounded-xl p-3 space-y-1.5">
                            <div className="text-[11px] font-black uppercase tracking-wider text-[#8A948F]">
                              Attachments
                            </div>
                            {uploadedReports.length > 0 && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="flex items-center gap-1.5" style={{ color: BLUE_DARK }}>
                                  <FlaskConical className="w-3 h-3" /> Reports
                                </span>
                                <span className="font-bold text-[#1A2421]">
                                  {uploadedReports.length} file(s)
                                </span>
                              </div>
                            )}
                            {uploadedPrescriptions.length > 0 && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="flex items-center gap-1.5" style={{ color: GREEN_DARK }}>
                                  <Pill className="w-3 h-3" /> Prescriptions
                                </span>
                                <span className="font-bold text-[#1A2421]">
                                  {uploadedPrescriptions.length} file(s)
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="bg-[#F7F8F7] border border-[#E4E7E4] rounded-xl p-4 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#5B6B65]">
                              Subtotal ({selectedServices.length} item
                              {selectedServices.length !== 1 ? "s" : ""})
                            </span>
                            <span className="font-bold text-[#1A2421]">
                              ₹{subtotal.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-[#E4E7E4]">
                            <span className="text-sm font-bold text-[#1A2421]">Total payable</span>
                            <span className="text-lg font-bold" style={{ color: GREEN_DARK }}>
                              ₹{finalPayable.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* CONFIRM + BACK BUTTONS */}
                        <div className="space-y-2.5 pt-2 border-t border-[#E4E7E4]">
                          <button
                            type="submit"
                            disabled={
                              isSubmitting || !selectedSlot || !selectedDoctorId || selectedServices.length === 0
                            }
                            className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-sm transition-all active:scale-[0.98]"
                            style={
                              selectedSlot && selectedDoctorId && selectedServices.length > 0 && !isSubmitting
                                ? {
                                  backgroundColor: GREEN,
                                  color: "#FFFFFF",
                                  boxShadow: `0 6px 16px ${GREEN_SHADOW}`,
                                }
                                : { backgroundColor: "#E4E7E4", color: "#8A948F", cursor: "not-allowed" }
                            }
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

                          <button
                            type="button"
                            onClick={handleBack}
                            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold bg-white border-2 rounded-xl transition-colors"
                            style={{ color: BLUE_DARK, borderColor: BLUE_BORDER }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = BLUE_LIGHT)}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
                          >
                            <ArrowLeft className="w-4 h-4" /> Back
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* ==================== SIMPLE THANK YOU POPUP ==================== */}
        {bookingConfirmation && (
          <div className="fixed inset-0 bg-[#1A2421]/70 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-[300px] shadow-2xl border border-[#E4E7E4] overflow-hidden">
              <div className="py-8 px-6 flex flex-col items-center">
                {/* Green check circle */}
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                  style={{
                    background: `linear-gradient(135deg, ${GREEN}, ${GREEN_DARK})`,
                    boxShadow: `0 10px 25px ${GREEN_SHADOW}`,
                  }}
                >
                  <Check className="w-10 h-10 text-white" strokeWidth={3} />
                </div>

                <h3 className="text-xl font-bold text-[#1A2421] text-center">
                  Thank You!
                </h3>
                <p className="text-sm text-[#5B6B65] mt-2 text-center leading-relaxed">
                  Your appointment has been booked successfully
                </p>

                <button
                  type="button"
                  onClick={() => setBookingConfirmation(null)}
                  className="w-full mt-6 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm text-white transition-all active:scale-[0.98]"
                  style={{
                    backgroundColor: GREEN,
                    boxShadow: `0 6px 16px ${GREEN_SHADOW}`,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = GREEN_DARK)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = GREEN)}
                >
                  <Check className="w-4 h-4" strokeWidth={3} />
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <TimelyFooter />
    </>
  );
};

// ---------- Sub-component: slot tile ----------
const AppointmentSlotTile = ({ slot, isSelected, onSelect }) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="p-3 rounded-xl border-2 text-left transition-all flex flex-col justify-between h-20 active:scale-[0.97]"
      style={
        isSelected
          ? {
            backgroundColor: BLUE,
            color: "#FFFFFF",
            borderColor: BLUE,
            boxShadow: `0 6px 16px ${BLUE_SHADOW}`,
          }
          : {
            backgroundColor: "#FFFFFF",
            borderColor: "#D7DCD9",
            color: "#1A2421",
          }
      }
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = BLUE;
          e.currentTarget.style.backgroundColor = BLUE_LIGHT;
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = "#D7DCD9";
          e.currentTarget.style.backgroundColor = "#FFFFFF";
        }
      }}
    >
      <div className="text-xs font-bold tracking-tight">
        {slot.startTime} – {slot.endTime}
      </div>
      <div className="flex items-center justify-between text-[10px] font-medium">
        <span style={{ color: isSelected ? "rgba(255,255,255,0.9)" : "#5B6B65" }}>{slot.shift}</span>
        <span
          className="px-2 py-0.5 rounded-md text-[9px] uppercase tracking-wider font-black"
          style={
            isSelected
              ? { backgroundColor: "#FFFFFF", color: BLUE }
              : { backgroundColor: BLUE_LIGHT, color: BLUE }
          }
        >
          {isSelected ? "Selected" : "Available"}
        </span>
      </div>
    </button>
  );
};

export default Appointment;