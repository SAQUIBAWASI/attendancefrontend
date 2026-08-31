import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import {
  Clock,
  Calendar,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Coffee,
  Sparkles,
  RefreshCw,
  Search,
  Filter,
  Users,
  Sun,
  Moon,
  User,
  Stethoscope,
  ChevronDown,
  Eye,
  Phone,
  MapPin,
  FileText,
  CreditCard,
  Activity,
  PieChart,
  Check,
  CalendarDays
} from "lucide-react";
import {
  FaUserMd,
  FaCalendarCheck,
  FaClock,
  FaTimes,
  FaRupeeSign,
  FaCheckCircle,
  FaRegCalendarAlt,
  FaPlus,
  FaTrashAlt,
  FaEye,
  FaUserInjured
} from "react-icons/fa";
import {
  FiUsers,
  FiUserCheck,
  FiClock,
  FiFilter,
  FiTrash2,
  FiPlus,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiCalendar,
  FiSun,
  FiMoon,
  FiCoffee,
  FiAlertCircle
} from "react-icons/fi";
import "./EmployeeDashboard.css";
import "./EmployeeLeaves.css";

// Time Helper Utilities
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
  const strH = String(h).padStart(2, "0");
  const strM = String(m).padStart(2, "0");
  return `${strH}:${strM} ${ampm}`;
};

const minutesTo24Hour = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const DAYS_OF_WEEK = [
  "All",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

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

const AppointmentSlots = () => {
  const [slots, setSlots] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [shiftFilter, setShiftFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDay, setSelectedDay] = useState("Monday");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedSlotForBook, setSelectedSlotForBook] = useState(null);
  const [patientNameInput, setPatientNameInput] = useState("");
  const [patientPhoneInput, setPatientPhoneInput] = useState("");

  const [showBookingDetailsModal, setShowBookingDetailsModal] = useState(false);
  const [selectedBookingDetails, setSelectedBookingDetails] = useState(null);
  const [bookingDetailsLoading, setBookingDetailsLoading] = useState(false);

  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);

  const [newSlotDoctor, setNewSlotDoctor] = useState("");
  const [newSlotDays, setNewSlotDays] = useState([]);
  const [newSlotStartTime, setNewSlotStartTime] = useState("09:00");
  const [newSlotEndTime, setNewSlotEndTime] = useState("09:20");
  const [newSlotGap, setNewSlotGap] = useState(5);
  const [newSlotShift, setNewSlotShift] = useState("Morning Shift");
  const [newSlotConsultationFee, setNewSlotConsultationFee] = useState(300);
  const [newSlotDuration, setNewSlotDuration] = useState(20);
  const [generatingSlots, setGeneratingSlots] = useState(false);

  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    fetchDoctors();
    fetchSlots();
  }, []);

  const fetchDoctors = async () => {
    setDoctorsLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/doctors/getalldoctors`);
      if (res.data && res.data.success) {
        setDoctors(res.data.data || []);
      } else {
        setDoctors([]);
      }
    } catch (err) {
      console.error("Error fetching doctors:", err);
      setDoctors([]);
    } finally {
      setDoctorsLoading(false);
    }
  };

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const slotsRes = await axios.get(`${API_BASE_URL}/appointment-slots`);
      if (slotsRes && slotsRes.data && slotsRes.data.success) {
        const slotsData = slotsRes.data.slots || [];
        setSlots(slotsData);
      } else {
        setSlots([]);
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingDetails = async (slot) => {
    if (!slot._id) {
      showToast("Invalid slot ID", "error");
      return;
    }

    setBookingDetailsLoading(true);
    setSelectedBookingDetails(null);

    try {
      const res = await axios.get(`${API_BASE_URL}/appointment-slots/getallbookings`);

      if (res && res.data && res.data.success) {
        const bookings = res.data.bookings || [];

        const booking = bookings.find((b) => {
          if (b.slotId === slot._id || b.slotId === slot.slotId) return true;
          if (b.slotDetails) {
            const sd = b.slotDetails;
            if (sd.startTime === slot.startTime && sd.dayOfWeek === slot.dayOfWeek) return true;
            if (sd.date === slot.date && sd.startTime === slot.startTime) return true;
          }
          return false;
        });

        if (booking) {
          const slotDetails = booking.slotDetails || {};

          setSelectedBookingDetails({
            patientName: booking.patientName || slot.patientName || "N/A",
            patientPhone: booking.patientPhone || slot.patientPhone || "N/A",
            patientAge: booking.patientAge || slot.patientAge || "N/A",
            patientGender: booking.patientGender || slot.patientGender || "N/A",
            patientAddress: booking.patientAddress || slot.patientAddress || "N/A",
            dayOfWeek: slotDetails.dayOfWeek || booking.dayOfWeek || slot.dayOfWeek || "N/A",
            appointmentDate:
              slotDetails.date || booking.appointmentDate || booking.date || slot.date || "N/A",
            startTime: slotDetails.startTime || booking.startTime || slot.startTime || "N/A",
            endTime: slotDetails.endTime || booking.endTime || slot.endTime || "N/A",
            doctorName: slotDetails.doctorName || booking.doctorName || slot.doctorName || "N/A",
            doctorSpecialization:
              slotDetails.doctorSpecialization ||
              booking.doctorSpecialization ||
              slot.doctorSpecialization ||
              "",
            purpose: booking.purpose || slot.purpose || "General Consultation",
            consultationFee: booking.consultationFee || slot.consultationFee || 300,
            paymentStatus: booking.paymentStatus || slot.paymentStatus || "Pending",
            status: booking.status || slot.status || "booked",
            bookingData: booking,
            slotData: slot
          });
        } else {
          setSelectedBookingDetails({
            patientName: slot.patientName || "N/A",
            patientPhone: slot.patientPhone || "N/A",
            patientAge: slot.patientAge || "N/A",
            patientGender: slot.patientGender || "Male",
            patientAddress: slot.patientAddress || "N/A",
            dayOfWeek: slot.dayOfWeek || "N/A",
            appointmentDate: slot.date || "N/A",
            startTime: slot.startTime || "N/A",
            endTime: slot.endTime || "N/A",
            doctorName: slot.doctorName || "N/A",
            doctorSpecialization: slot.doctorSpecialization || "",
            purpose: slot.purpose || "General Consultation",
            consultationFee: slot.consultationFee || 300,
            paymentStatus: slot.paymentStatus || "Pending",
            status: slot.status || "booked",
            bookingData: null,
            slotData: slot
          });
        }
        setShowBookingDetailsModal(true);
      } else {
        showToast("No booking details found", "error");
      }
    } catch (error) {
      console.error("Error fetching booking details:", error);
      showToast("Failed to fetch booking details", "error");
    } finally {
      setBookingDetailsLoading(false);
    }
  };

  const handleToggleStatus = async (slot) => {
    if (slot.type === "break") return;

    let newStatus = "available";
    if (slot.status === "available") newStatus = "blocked";
    else if (slot.status === "blocked") newStatus = "available";
    else if (slot.status === "booked") {
      await fetchBookingDetails(slot);
      return;
    }

    setSlots((prev) =>
      prev.map((s) => (s.slotId === slot.slotId ? { ...s, status: newStatus, patientName: "" } : s))
    );

    try {
      if (slot._id && !slot._id.startsWith("local_")) {
        await axios
          .put(`${API_BASE_URL}/appointment-slots/${slot._id}`, {
            status: newStatus
          })
          .catch(() => null);
      }
      showToast(`Slot status changed to '${newStatus}'`, "info");
    } catch (e) {
      console.error("Error updating slot status:", e);
      fetchSlots();
    }
  };

  const handleConfirmBooking = async () => {
    if (!patientNameInput.trim()) {
      showToast("Please enter patient name", "error");
      return;
    }

    if (!selectedSlotForBook) return;

    const updated = {
      status: "booked",
      patientName: patientNameInput,
      patientPhone: patientPhoneInput
    };

    setSlots((prev) =>
      prev.map((s) => (s.slotId === selectedSlotForBook.slotId ? { ...s, ...updated } : s))
    );

    try {
      if (selectedSlotForBook._id && !selectedSlotForBook._id.startsWith("local_")) {
        await axios
          .put(`${API_BASE_URL}/appointment-slots/${selectedSlotForBook._id}`, updated)
          .catch(() => null);
      }
      showToast(`Booked appointment for ${patientNameInput}!`, "success");
    } catch (e) {
      console.error("Error booking slot:", e);
      fetchSlots();
    } finally {
      setShowBookModal(false);
      setPatientNameInput("");
      setPatientPhoneInput("");
      setSelectedSlotForBook(null);
    }
  };

  const handleDeleteSlot = async (slotId, _id) => {
    if (!window.confirm("Are you sure you want to delete this appointment slot?")) return;

    setSlots((prev) => prev.filter((s) => s.slotId !== slotId));

    try {
      if (_id && !_id.startsWith("local_")) {
        await axios.delete(`${API_BASE_URL}/appointment-slots/${_id}`).catch(() => null);
      }
      showToast("Slot deleted successfully", "info");
    } catch (e) {
      console.error("Error deleting slot:", e);
      fetchSlots();
    }
  };

  const toggleDaySelection = (day) => {
    setNewSlotDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleAddCustomSlot = async () => {
    if (!newSlotDoctor) {
      showToast("Please select a doctor", "error");
      return;
    }

    if (newSlotDays.length === 0) {
      showToast("Please select at least one day", "error");
      return;
    }

    const sStartMins = timeToMinutes(newSlotStartTime);
    const sEndMins = timeToMinutes(newSlotEndTime);

    if (sEndMins <= sStartMins) {
      showToast("End time must be after start time", "error");
      return;
    }

    const selectedDoctor = doctors.find((d) => d._id === newSlotDoctor);
    if (!selectedDoctor) {
      showToast("Selected doctor not found", "error");
      return;
    }

    const allNewSlots = [];

    for (const day of newSlotDays) {
      let curr = sStartMins;
      let slotIdx = 1;

      while (curr + newSlotDuration <= sEndMins) {
        const sStart = curr;
        const sEnd = curr + newSlotDuration;

        allNewSlots.push({
          dayOfWeek: day,
          startTime: minutesTo12Hour(sStart),
          endTime: minutesTo12Hour(sEnd),
          startTime24: minutesTo24Hour(sStart),
          endTime24: minutesTo24Hour(sEnd),
          duration: newSlotDuration,
          gap: newSlotGap || 0,
          shift: newSlotShift,
          type: "op",
          status: "available",
          consultationFee: newSlotConsultationFee,
          doctorId: selectedDoctor._id,
          doctorName: selectedDoctor.name,
          doctorSpecialization: selectedDoctor.specialization,
          slotNumber: slotIdx++
        });

        curr = sEnd + (newSlotGap || 0);
      }
    }

    if (allNewSlots.length === 0) {
      showToast("No slots could be generated in the given time range", "error");
      return;
    }

    setGeneratingSlots(true);
    try {
      const savedSlots = [];
      for (const slot of allNewSlots) {
        const res = await axios.post(`${API_BASE_URL}/appointment-slots`, slot).catch(() => null);
        if (res && res.data && res.data.slot) {
          savedSlots.push(res.data.slot);
        }
      }

      if (savedSlots.length > 0) {
        setSlots((prev) => [...prev, ...savedSlots]);
        showToast(
          `Added ${savedSlots.length} slots for ${selectedDoctor.name} on ${newSlotDays.length} day(s)!`,
          "success"
        );
      } else {
        showToast("Failed to create slots. Please try again.", "error");
      }

      setShowAddModal(false);
      setNewSlotDoctor("");
      setNewSlotDays([]);
      setNewSlotStartTime("09:00");
      setNewSlotEndTime("09:20");
      setNewSlotGap(5);
      setNewSlotShift("Morning Shift");
      setNewSlotConsultationFee(300);
      setNewSlotDuration(20);
    } catch (e) {
      console.error("Error adding slots:", e);
      showToast("Error adding slots. Please try again.", "error");
    } finally {
      setGeneratingSlots(false);
    }
  };

  const uniqueDoctors = useMemo(() => {
    const doctorMap = new Map();
    slots.forEach((slot) => {
      if (slot.doctorId && typeof slot.doctorId === "object") {
        const doc = slot.doctorId;
        if (!doctorMap.has(doc._id)) {
          doctorMap.set(doc._id, doc);
        }
      } else if (slot.doctorId && typeof slot.doctorId === "string") {
        if (!doctorMap.has(slot.doctorId)) {
          doctorMap.set(slot.doctorId, {
            _id: slot.doctorId,
            name: slot.doctorName || "Unknown Doctor"
          });
        }
      }
    });
    return Array.from(doctorMap.values());
  }, [slots]);

  const selectedDoctorSlots = useMemo(() => {
    if (!selectedDoctorId) return [];
    return slots.filter((s) => {
      const slotDoctorId = typeof s.doctorId === "object" ? s.doctorId?._id : s.doctorId;
      return slotDoctorId === selectedDoctorId && s.type !== "break";
    });
  }, [slots, selectedDoctorId]);

  const doctorStatusStats = useMemo(() => {
    const total = selectedDoctorSlots.length;
    const booked = selectedDoctorSlots.filter((s) => s.status === "booked").length;
    const available = selectedDoctorSlots.filter((s) => s.status === "available").length;
    const blocked = selectedDoctorSlots.filter((s) => s.status === "blocked").length;
    return { total, booked, available, blocked };
  }, [selectedDoctorSlots]);

  const filteredByDoctor = useMemo(() => {
    if (selectedDoctorId) {
      return slots.filter((s) => {
        const slotDoctorId = typeof s.doctorId === "object" ? s.doctorId?._id : s.doctorId;
        return slotDoctorId === selectedDoctorId;
      });
    }
    return slots;
  }, [slots, selectedDoctorId]);

  const currentDaySlots = useMemo(() => {
    if (selectedDay === "All") {
      return filteredByDoctor;
    }
    return filteredByDoctor.filter(
      (s) => s.dayOfWeek?.toLowerCase() === selectedDay.toLowerCase()
    );
  }, [filteredByDoctor, selectedDay]);

  const filteredSlots = useMemo(() => {
    return currentDaySlots.filter((slot) => {
      if (shiftFilter !== "All") {
        if (shiftFilter === "Morning" && !slot.shift?.toLowerCase().includes("morning"))
          return false;
        if (shiftFilter === "Evening" && !slot.shift?.toLowerCase().includes("evening"))
          return false;
        if (shiftFilter === "Break" && slot.type !== "break") return false;
      }
      if (statusFilter !== "All" && slot.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTime =
          (slot.startTime || "").toLowerCase().includes(query) ||
          (slot.endTime || "").toLowerCase().includes(query);
        const matchPatient = (slot.patientName || "").toLowerCase().includes(query);
        const matchStatus = (slot.status || "").toLowerCase().includes(query);
        const doctorName = slot.doctorId?.name || slot.doctorName || "";
        const matchDoctor = doctorName.toLowerCase().includes(query);
        if (!matchTime && !matchPatient && !matchStatus && !matchDoctor) return false;
      }
      return true;
    });
  }, [currentDaySlots, shiftFilter, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    const totalSlotsCount = slots.filter((s) => s.type !== "break").length;
    const dayTotalSlots = currentDaySlots.filter((s) => s.type !== "break").length;
    const dayAvailableSlots = currentDaySlots.filter(
      (s) => s.status === "available" && s.type !== "break"
    ).length;
    const dayBookedSlots = currentDaySlots.filter((s) => s.status === "booked").length;
    const dayBlockedSlots = currentDaySlots.filter((s) => s.status === "blocked").length;

    const opTotalMins = currentDaySlots
      .filter((s) => s.type !== "break")
      .reduce((acc, curr) => acc + (curr.duration || 20), 0);
    const opHoursStr = (opTotalMins / 60).toFixed(1);

    return {
      totalSlotsCount,
      dayTotalSlots,
      dayAvailableSlots,
      dayBookedSlots,
      dayBlockedSlots,
      opHoursStr
    };
  }, [slots, currentDaySlots]);

  const morningShiftSlots = filteredSlots.filter((s) =>
    s.shift?.toLowerCase().includes("morning")
  );
  const eveningShiftSlots = filteredSlots.filter((s) =>
    s.shift?.toLowerCase().includes("evening")
  );

  const getDoctorDisplayName = (slot) => {
    if (slot.doctorId && typeof slot.doctorId === "object" && slot.doctorId.name) {
      return slot.doctorId.name;
    }
    if (slot.doctorName) {
      return slot.doctorName;
    }
    return "General OP Doctor";
  };

  const getDoctorSpecialization = (slot) => {
    if (slot.doctorId && typeof slot.doctorId === "object" && slot.doctorId.specialization) {
      return slot.doctorId.specialization;
    }
    if (slot.doctorSpecialization) {
      return slot.doctorSpecialization;
    }
    return "";
  };

  const getSelectedDoctorName = () => {
    if (!selectedDoctorId) return "All Doctors";
    const doc = uniqueDoctors.find((d) => d._id === selectedDoctorId);
    return doc?.name || "Unknown Doctor";
  };

  const getSelectedDoctor = () => {
    if (!selectedDoctorId) return null;
    return doctors.find((d) => d._id === selectedDoctorId);
  };

  const handleCardClick = (filterType) => {
    if (filterType === "all") {
      setStatusFilter("All");
    } else if (filterType === "available") {
      setStatusFilter("available");
    } else if (filterType === "booked") {
      setStatusFilter("booked");
    }
  };

  const handleClearFilters = () => {
    setStatusFilter("All");
    setShiftFilter("All");
    setSearchQuery("");
    setSelectedDoctorId(null);
    setSelectedDay("Monday");
  };

  const isFilterActive =
    statusFilter !== "All" ||
    shiftFilter !== "All" ||
    searchQuery !== "" ||
    selectedDoctorId !== null;

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

        {/* ===================== HEADER ===================== */}
        <div className="emp-dash__header">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap">
              Appointment <span>Slots</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="emp-dash__date-pill">
              <FaRegCalendarAlt />
              <span>
                {stats.totalSlotsCount} Total Slots • {selectedDay === "All" ? "All Days" : selectedDay}
              </span>
            </div>
            <button
              onClick={() => {
                handleClearFilters();
                fetchSlots();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
              title="Refresh Slots"
            >
              <FiRefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={() => {
                setNewSlotDoctor("");
                setNewSlotDays([]);
                setNewSlotStartTime("09:00");
                setNewSlotEndTime("09:20");
                setNewSlotGap(5);
                setNewSlotShift("Morning Shift");
                setNewSlotConsultationFee(300);
                setNewSlotDuration(20);
                setShowAddModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm"
            >
              <FiPlus className="w-3.5 h-3.5" />
              <span>Add Slots</span>
            </button>
          </div>
        </div>

        {/* ===================== TOP KPI STATS GRID ===================== */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
          {/* Total OP Slots */}
          <div
            className={`emp-dash__stat cursor-pointer hover:scale-105 transition-transform duration-200 ${
              statusFilter === "All" ? "ring-2 ring-blue-500/20 border-blue-400" : ""
            }`}
            onClick={() => handleCardClick("all")}
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total OP Slots</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FiCalendar />
              </div>
            </div>
            <div className="emp-dash__stat-value">{stats.totalSlotsCount}</div>
            <div className="emp-dash__stat-meta">across all days</div>
          </div>

          {/* Slots on Selected Day */}
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">
                Slots ({selectedDay === "All" ? "All Days" : selectedDay})
              </span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FiClock />
              </div>
            </div>
            <div className="emp-dash__stat-value text-indigo-600">{stats.dayTotalSlots}</div>
            <div className="emp-dash__stat-meta">scheduled slots</div>
          </div>

          {/* Available Slots */}
          <div
            className={`emp-dash__stat cursor-pointer hover:scale-105 transition-transform duration-200 ${
              statusFilter === "available" ? "ring-2 ring-emerald-500/20 border-emerald-400" : ""
            }`}
            onClick={() => handleCardClick("available")}
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Available</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <FiCheckCircle />
              </div>
            </div>
            <div className="emp-dash__stat-value text-emerald-600">{stats.dayAvailableSlots}</div>
            <div className="emp-dash__stat-meta">ready to book</div>
          </div>

          {/* Booked Slots */}
          <div
            className={`emp-dash__stat cursor-pointer hover:scale-105 transition-transform duration-200 ${
              statusFilter === "booked" ? "ring-2 ring-amber-500/20 border-amber-400" : ""
            }`}
            onClick={() => handleCardClick("booked")}
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Booked</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                <FiUsers />
              </div>
            </div>
            <div className="emp-dash__stat-value text-amber-600">{stats.dayBookedSlots}</div>
            <div className="emp-dash__stat-meta">confirmed appointments</div>
          </div>

          {/* Operating Hours */}
          <div className="emp-dash__stat col-span-2 lg:col-span-1">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">OP Hours</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <Activity className="w-4 h-4 text-purple-600" />
              </div>
            </div>
            <div className="emp-dash__stat-value text-purple-600">{stats.opHoursStr} Hrs</div>
            <div className="emp-dash__stat-meta">operating time</div>
          </div>
        </div>

        {/* ===================== DAYS OF THE WEEK SELECTOR ===================== */}
        <div className="emp-dash__card p-2 mb-4">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-1">
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = selectedDay === day;
              const daySlotCount =
                day === "All"
                  ? filteredByDoctor.filter((s) => s.type !== "break").length
                  : filteredByDoctor.filter(
                      (s) => s.dayOfWeek?.toLowerCase() === day.toLowerCase() && s.type !== "break"
                    ).length;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`flex-1 min-w-[95px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-0.5 whitespace-nowrap ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <span className="text-xs">{day}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      isSelected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {daySlotCount} Slots
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ===================== DOCTOR SELECTOR PILLS ===================== */}
        {uniqueDoctors.length > 0 && (
          <div className="emp-dash__card p-2 mb-4 flex overflow-x-auto gap-1.5">
            <button
              onClick={() => {
                setSelectedDoctorId(null);
                setStatusFilter("All");
              }}
              className={`min-w-[110px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                !selectedDoctorId
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "bg-transparent text-gray-600 hover:bg-gray-100"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                  !selectedDoctorId ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
                }`}
              >
                ALL
              </div>
              <div className="text-left min-w-0">
                <div className="text-xs truncate">All Doctors</div>
                <div
                  className={`text-[9px] font-medium ${
                    !selectedDoctorId ? "text-indigo-200" : "text-gray-400"
                  }`}
                >
                  {slots.filter((s) => s.type !== "break").length} Slots
                </div>
              </div>
            </button>

            {uniqueDoctors.map((doc) => {
              const isSelected = selectedDoctorId === doc._id;
              const doctorSlots = slots.filter((s) => {
                const slotDoctorId =
                  typeof s.doctorId === "object" ? s.doctorId?._id : s.doctorId;
                return slotDoctorId === doc._id && s.type !== "break";
              });

              return (
                <button
                  key={doc._id}
                  onClick={() => {
                    setSelectedDoctorId(doc._id);
                    setStatusFilter("All");
                  }}
                  className={`min-w-[120px] max-w-[170px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "bg-transparent text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                      isSelected ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {doc.name ? doc.name.charAt(0).toUpperCase() : "D"}
                  </div>
                  <div className="text-left min-w-0">
                    <div className="text-xs truncate" title={doc.name}>
                      {doc.name || "Doctor"}
                    </div>
                    <div
                      className={`text-[9px] font-medium truncate ${
                        isSelected ? "text-blue-200" : "text-gray-400"
                      }`}
                    >
                      {doctorSlots.length} Slots
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* ===================== SELECTED DOCTOR OVERVIEW CARD ===================== */}
        {selectedDoctorId && (
          <div className="emp-dash__card p-4 mb-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200/80">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">{getSelectedDoctorName()}</h3>
                  <p className="text-xs text-gray-500">
                    {getSelectedDoctor()?.specialization || "General Physician"} •{" "}
                    <strong>{doctorStatusStats.total}</strong> Total Scheduled Slots
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {statusFilter !== "All" && (
                  <button
                    onClick={() => setStatusFilter("All")}
                    className="text-xs text-blue-700 font-semibold bg-white px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50 transition-all shadow-xs"
                  >
                    ✕ Clear Status ({statusFilter})
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedDoctorId(null);
                    setStatusFilter("All");
                  }}
                  className="text-xs text-gray-600 hover:text-gray-900 font-semibold bg-white px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all shadow-xs"
                >
                  ✕ Clear Doctor
                </button>
              </div>
            </div>

            {/* Status Breakdown Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              <div
                className={`bg-white rounded-xl p-3 border transition-all cursor-pointer ${
                  statusFilter === "available"
                    ? "border-emerald-500 ring-2 ring-emerald-500/20"
                    : "border-emerald-200"
                }`}
                onClick={() => setStatusFilter("available")}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold uppercase text-emerald-600">Available</div>
                    <div className="text-xl font-bold text-emerald-700">
                      {doctorStatusStats.available}
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                </div>
                <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full"
                    style={{
                      width: `${
                        doctorStatusStats.total > 0
                          ? (doctorStatusStats.available / doctorStatusStats.total) * 100
                          : 0
                      }%`
                    }}
                  ></div>
                </div>
              </div>

              <div
                className={`bg-white rounded-xl p-3 border transition-all cursor-pointer ${
                  statusFilter === "booked"
                    ? "border-amber-500 ring-2 ring-amber-500/20"
                    : "border-amber-200"
                }`}
                onClick={() => setStatusFilter("booked")}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold uppercase text-amber-600">Booked</div>
                    <div className="text-xl font-bold text-amber-700">
                      {doctorStatusStats.booked}
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Users className="w-4 h-4 text-amber-600" />
                  </div>
                </div>
                <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className="bg-amber-500 h-1.5 rounded-full"
                    style={{
                      width: `${
                        doctorStatusStats.total > 0
                          ? (doctorStatusStats.booked / doctorStatusStats.total) * 100
                          : 0
                      }%`
                    }}
                  ></div>
                </div>
              </div>

              <div
                className={`bg-white rounded-xl p-3 border transition-all cursor-pointer ${
                  statusFilter === "blocked"
                    ? "border-gray-500 ring-2 ring-gray-500/20"
                    : "border-gray-200"
                }`}
                onClick={() => setStatusFilter("blocked")}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold uppercase text-gray-500">Blocked</div>
                    <div className="text-xl font-bold text-gray-700">
                      {doctorStatusStats.blocked}
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                    <XCircle className="w-4 h-4 text-gray-500" />
                  </div>
                </div>
                <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className="bg-gray-400 h-1.5 rounded-full"
                    style={{
                      width: `${
                        doctorStatusStats.total > 0
                          ? (doctorStatusStats.blocked / doctorStatusStats.total) * 100
                          : 0
                      }%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== FILTERS BAR ===================== */}
        <div className="emp-dash__card p-3 mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {/* Shift Filter */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={shiftFilter}
                onChange={(e) => setShiftFilter(e.target.value)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                  shiftFilter !== "All"
                    ? "border-blue-500 text-blue-700 bg-blue-50"
                    : "border-gray-300 text-gray-700"
                }`}
              >
                <option value="All">All Shifts</option>
                <option value="Morning">Morning Shift</option>
                <option value="Break">Break Period</option>
                <option value="Evening">Evening Shift</option>
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                statusFilter !== "All"
                  ? "border-blue-500 text-blue-700 bg-blue-50"
                  : "border-gray-300 text-gray-700"
              }`}
            >
              <option value="All">All Statuses</option>
              <option value="available">Available</option>
              <option value="booked">Booked</option>
              <option value="blocked">Blocked</option>
              <option value="break">Break</option>
            </select>

            {isFilterActive && (
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-xs"
              >
                <FiTrash2 className="w-3 h-3 text-red-500" />
                Clear
              </button>
            )}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search time, patient, doctor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            />
          </div>
        </div>

        {/* ===================== SLOTS DISPLAY SECTION ===================== */}
        {loading ? (
          <div className="emp-dash__card p-12 text-center text-gray-500">
            <FiRefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm font-medium">Loading appointment slots...</p>
          </div>
        ) : filteredSlots.length === 0 ? (
          <div className="emp-dash__card p-12 text-center text-gray-500">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-700">No Slots Found</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto mb-4">
              {slots.length === 0
                ? "No appointment slots available. Click 'Add Slots' to generate new slots."
                : `No matching slots found on ${selectedDay === "All" ? "all days" : selectedDay}.`}
            </p>
            {isFilterActive ? (
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={() => {
                  setNewSlotDoctor("");
                  setNewSlotDays([]);
                  setNewSlotStartTime("09:00");
                  setNewSlotEndTime("09:20");
                  setNewSlotGap(5);
                  setNewSlotShift("Morning Shift");
                  setNewSlotConsultationFee(300);
                  setNewSlotDuration(20);
                  setShowAddModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-xs shadow-sm inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Add Slots
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6 slots-section">
            {/* Morning Shift */}
            {(shiftFilter === "All" || shiftFilter === "Morning") && morningShiftSlots.length > 0 && (
              <div className="emp-dash__card p-4 md:p-5">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4 flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-sm md:text-base">
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span>Morning Shift</span>
                    <span className="text-xs bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full font-semibold border border-amber-200">
                      09:00 AM – 02:00 PM
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">
                    <strong>{morningShiftSlots.length}</strong> Slots
                    {statusFilter !== "All" && (
                      <span className="ml-1.5 text-amber-600 font-bold">({statusFilter})</span>
                    )}
                    {selectedDay === "All" && (
                      <span className="ml-1.5 text-blue-600 font-bold">(All Days)</span>
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                  {morningShiftSlots.map((slot) => (
                    <SlotCard
                      key={slot._id || slot.slotId}
                      slot={slot}
                      getDoctorName={getDoctorDisplayName}
                      getDoctorSpecialization={getDoctorSpecialization}
                      onToggleStatus={() => handleToggleStatus(slot)}
                      onBook={() => {
                        setSelectedSlotForBook(slot);
                        setShowBookModal(true);
                      }}
                      onDelete={() => handleDeleteSlot(slot.slotId, slot._id)}
                      onViewBooking={() => fetchBookingDetails(slot)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Break Period */}
            {(shiftFilter === "All" || shiftFilter === "Break") && (
              <div className="bg-purple-50/70 rounded-2xl p-4 border border-purple-200/70 shadow-xs">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-xs">
                      <Coffee className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-purple-900 text-sm">Afternoon OP Break Period</h3>
                        <span className="bg-purple-200 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          NO OP SLOTS
                        </span>
                      </div>
                      <p className="text-xs text-purple-700 mt-0.5">
                        Scheduled Doctor Break &amp; Clinic Sanitization (02:00 PM – 03:00 PM)
                      </p>
                    </div>
                  </div>

                  <div className="text-xs font-bold text-purple-900 bg-white px-3 py-1.5 rounded-lg border border-purple-200">
                    02:00 PM – 03:00 PM
                  </div>
                </div>
              </div>
            )}

            {/* Evening Shift */}
            {(shiftFilter === "All" || shiftFilter === "Evening") && eveningShiftSlots.length > 0 && (
              <div className="emp-dash__card p-4 md:p-5">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4 flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-indigo-800 font-bold text-sm md:text-base">
                    <Moon className="w-4 h-4 text-indigo-600" />
                    <span>Evening Shift</span>
                    <span className="text-xs bg-indigo-50 text-indigo-800 px-2.5 py-0.5 rounded-full font-semibold border border-indigo-200">
                      03:00 PM – 09:00 PM
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">
                    <strong>{eveningShiftSlots.length}</strong> Slots
                    {statusFilter !== "All" && (
                      <span className="ml-1.5 text-amber-600 font-bold">({statusFilter})</span>
                    )}
                    {selectedDay === "All" && (
                      <span className="ml-1.5 text-blue-600 font-bold">(All Days)</span>
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                  {eveningShiftSlots.map((slot) => (
                    <SlotCard
                      key={slot._id || slot.slotId}
                      slot={slot}
                      getDoctorName={getDoctorDisplayName}
                      getDoctorSpecialization={getDoctorSpecialization}
                      onToggleStatus={() => handleToggleStatus(slot)}
                      onBook={() => {
                        setSelectedSlotForBook(slot);
                        setShowBookModal(true);
                      }}
                      onDelete={() => handleDeleteSlot(slot.slotId, slot._id)}
                      onViewBooking={() => fetchBookingDetails(slot)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================== ADD SLOT MODAL ===================== */}
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-gray-200 relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Generate New Slots</h3>
                    <p className="text-xs text-gray-500">Create recurring slots for doctors</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="my-5 space-y-4">
                {/* Doctor Selection */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                    Select Doctor <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Stethoscope className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <select
                      value={newSlotDoctor}
                      onChange={(e) => setNewSlotDoctor(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-8 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium appearance-none"
                    >
                      <option value="">Select a doctor</option>
                      {doctorsLoading ? (
                        <option value="" disabled>
                          Loading doctors...
                        </option>
                      ) : doctors.length === 0 ? (
                        <option value="" disabled>
                          No doctors available
                        </option>
                      ) : (
                        doctors.map((doc) => (
                          <option key={doc._id} value={doc._id}>
                            {doc.name} - {doc.specialization}
                          </option>
                        ))
                      )}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-2.5 pointer-events-none" />
                  </div>
                </div>

                {/* Days Selection */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                    Select Days <span className="text-red-500">*</span>
                    <span className="text-[10px] text-gray-400 font-normal ml-1">
                      (Select multiple)
                    </span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {DAYS_OF_WEEK.filter((d) => d !== "All").map((day) => {
                      const isSelected = newSlotDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDaySelection(day)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                            isSelected
                              ? "border-blue-500 bg-blue-50 text-blue-700 shadow-xs ring-2 ring-blue-400/20"
                              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {day.substring(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Start & End Times */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                      Start Time <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="time"
                        value={newSlotStartTime}
                        onChange={(e) => setNewSlotStartTime(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                      End Time <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="time"
                        value={newSlotEndTime}
                        onChange={(e) => setNewSlotEndTime(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Slot Duration */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                    Slot Duration (Minutes)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="5"
                      max="120"
                      step="5"
                      value={newSlotDuration}
                      onChange={(e) =>
                        setNewSlotDuration(Math.max(5, parseInt(e.target.value) || 20))
                      }
                      className="w-24 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                    />
                    <span className="text-xs text-gray-500">mins</span>
                    <div className="flex items-center gap-1 ml-auto">
                      {[15, 20, 25, 30].map((dur) => (
                        <button
                          key={dur}
                          type="button"
                          onClick={() => setNewSlotDuration(dur)}
                          className={`text-[10px] px-2.5 py-1 rounded-md font-semibold transition-all ${
                            newSlotDuration === dur
                              ? "bg-blue-600 text-white"
                              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-300"
                          }`}
                        >
                          {dur}m
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Gap Between Slots */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                    Gap Between Slots (Minutes)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={newSlotGap}
                      onChange={(e) =>
                        setNewSlotGap(Math.max(0, parseInt(e.target.value) || 0))
                      }
                      className="w-24 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                    />
                    <span className="text-xs text-gray-500">mins</span>
                    <div className="flex items-center gap-1 ml-auto">
                      {[0, 5, 10, 15].map((gap) => (
                        <button
                          key={gap}
                          type="button"
                          onClick={() => setNewSlotGap(gap)}
                          className={`text-[10px] px-2.5 py-1 rounded-md font-semibold transition-all ${
                            newSlotGap === gap
                              ? "bg-blue-600 text-white"
                              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-300"
                          }`}
                        >
                          {gap}m
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Fee and Shift Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                      Consultation Fee (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={newSlotConsultationFee}
                      onChange={(e) =>
                        setNewSlotConsultationFee(Math.max(0, parseInt(e.target.value) || 0))
                      }
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                      Shift Category <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Sun className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                      <select
                        value={newSlotShift}
                        onChange={(e) => setNewSlotShift(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-8 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium appearance-none"
                      >
                        <option value="Morning Shift">Morning Shift</option>
                        <option value="Evening Shift">Evening Shift</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-2.5 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Live Preview Box */}
                {newSlotDoctor && newSlotDays.length > 0 && newSlotStartTime && newSlotEndTime && (
                  <div className="bg-blue-50 p-3.5 rounded-xl border border-blue-200 text-xs">
                    <div className="text-[10px] font-bold uppercase text-blue-700 mb-1">
                      📋 Generated Slots Summary
                    </div>
                    <div className="font-bold text-gray-800">
                      {doctors.find((d) => d._id === newSlotDoctor)?.name}
                    </div>
                    <div className="text-gray-600 mt-0.5">
                      Days: {newSlotDays.join(", ")}
                    </div>
                    <div className="text-gray-600">
                      {newSlotStartTime} – {newSlotEndTime} • Duration: {newSlotDuration}m • Gap:{" "}
                      {newSlotGap}m • {newSlotShift}
                    </div>
                    <div className="text-emerald-700 font-bold mt-1">
                      💰 Fee: ₹{newSlotConsultationFee} | 📊 Slots per day:{" "}
                      {Math.floor(
                        (timeToMinutes(newSlotEndTime) - timeToMinutes(newSlotStartTime)) /
                          (newSlotDuration + newSlotGap)
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddCustomSlot}
                  disabled={
                    generatingSlots ||
                    !newSlotDoctor ||
                    newSlotDays.length === 0 ||
                    !newSlotStartTime ||
                    !newSlotEndTime
                  }
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {generatingSlots ? (
                    <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  {generatingSlots ? "Generating..." : "Generate Slots"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================== BOOK SLOT MODAL ===================== */}
        {showBookModal && selectedSlotForBook && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" /> Book OP Slot
                </h3>
                <button
                  onClick={() => setShowBookModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="my-4 bg-blue-50 p-3 rounded-xl border border-blue-100 text-xs text-blue-900">
                <div className="font-bold text-sm text-blue-950 mb-1">
                  {selectedSlotForBook.dayOfWeek} — {selectedSlotForBook.startTime} to{" "}
                  {selectedSlotForBook.endTime}
                </div>
                <div>Duration: {selectedSlotForBook.duration} Mins (OP)</div>
                {getDoctorDisplayName(selectedSlotForBook) && (
                  <div className="text-emerald-700 font-semibold mt-0.5">
                    👨‍⚕️ {getDoctorDisplayName(selectedSlotForBook)}{" "}
                    {getDoctorSpecialization(selectedSlotForBook) &&
                      `(${getDoctorSpecialization(selectedSlotForBook)})`}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                    Patient Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={patientNameInput}
                    onChange={(e) => setPatientNameInput(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                    Patient Contact Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +91 9876543210"
                    value={patientPhoneInput}
                    onChange={(e) => setPatientPhoneInput(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowBookModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmBooking}
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                >
                  Confirm Appointment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================== BOOKING DETAILS MODAL ===================== */}
        {showBookingDetailsModal && selectedBookingDetails && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-gray-200 relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Booking Details</h3>
                    <p className="text-xs text-gray-500">Appointment Information</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowBookingDetailsModal(false);
                    setSelectedBookingDetails(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {bookingDetailsLoading ? (
                <div className="py-8 text-center">
                  <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mx-auto mb-2" />
                  <p className="text-xs text-gray-500">Loading booking details...</p>
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  {/* Patient Info */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-[10px] font-bold uppercase text-gray-400">
                          Patient Name
                        </div>
                        <div className="text-sm font-bold text-gray-900">
                          {selectedBookingDetails.patientName || "N/A"}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase text-gray-400">Phone</div>
                        <div className="text-sm font-bold text-gray-900">
                          {selectedBookingDetails.patientPhone || "N/A"}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase text-gray-400">Age</div>
                        <div className="text-sm font-bold text-gray-900">
                          {selectedBookingDetails.patientAge || "N/A"} yrs
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase text-gray-400">Gender</div>
                        <div className="text-sm font-bold text-gray-900 capitalize">
                          {selectedBookingDetails.patientGender || "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Appointment Info */}
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-[10px] font-bold uppercase text-blue-600">Date</div>
                        <div className="text-sm font-bold text-gray-900">
                          {selectedBookingDetails.appointmentDate &&
                          selectedBookingDetails.appointmentDate !== "N/A"
                            ? formatDateToDDMMYYYY(selectedBookingDetails.appointmentDate)
                            : "N/A"}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase text-blue-600">Day</div>
                        <div className="text-sm font-bold text-gray-900">
                          {selectedBookingDetails.dayOfWeek || "N/A"}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase text-blue-600">Time Slot</div>
                        <div className="text-sm font-bold text-gray-900">
                          {selectedBookingDetails.startTime &&
                          selectedBookingDetails.startTime !== "N/A"
                            ? `${selectedBookingDetails.startTime} – ${selectedBookingDetails.endTime}`
                            : "N/A"}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase text-blue-600">Doctor</div>
                        <div className="text-sm font-bold text-gray-900">
                          {selectedBookingDetails.doctorName || "N/A"}
                          {selectedBookingDetails.doctorSpecialization && (
                            <span className="text-[10px] text-gray-500 ml-1">
                              ({selectedBookingDetails.doctorSpecialization})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Purpose & Fee */}
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-[10px] font-bold uppercase text-emerald-600">
                          Purpose
                        </div>
                        <div className="text-sm font-medium text-gray-800">
                          {selectedBookingDetails.purpose || "General Consultation"}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase text-emerald-600">Fee</div>
                        <div className="text-sm font-bold text-emerald-700">
                          ₹{selectedBookingDetails.consultationFee || 300}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment & Booking Status */}
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-bold uppercase text-amber-600">
                          Payment Status
                        </div>
                        <span
                          className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                            selectedBookingDetails.paymentStatus === "Paid"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : "bg-amber-100 text-amber-900 border-amber-300"
                          }`}
                        >
                          {selectedBookingDetails.paymentStatus || "Pending"}
                        </span>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase text-amber-600">
                          Booking Status
                        </div>
                        <span
                          className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                            selectedBookingDetails.status === "completed"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : selectedBookingDetails.status === "cancelled"
                              ? "bg-red-100 text-red-800 border-red-300"
                              : "bg-blue-100 text-blue-800 border-blue-300"
                          }`}
                        >
                          {selectedBookingDetails.status || "booked"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  {selectedBookingDetails.patientAddress &&
                    selectedBookingDetails.patientAddress !== "N/A" && (
                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                        <div className="text-[10px] font-bold uppercase text-gray-400">Address</div>
                        <div className="text-sm font-medium text-gray-700">
                          {selectedBookingDetails.patientAddress}
                        </div>
                      </div>
                    )}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowBookingDetailsModal(false);
                    setSelectedBookingDetails(null);
                  }}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all"
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
};

// Sub-component: Individual Slot Card
const SlotCard = ({
  slot,
  getDoctorName,
  getDoctorSpecialization,
  onToggleStatus,
  onBook,
  onDelete,
  onViewBooking
}) => {
  const isAvailable = slot.status === "available";
  const isBooked = slot.status === "booked";
  const isBlocked = slot.status === "blocked";
  const isBreak = slot.type === "break";

  const doctorName = getDoctorName(slot);
  const doctorSpecialization = getDoctorSpecialization(slot);

  return (
    <div
      className={`relative p-3.5 rounded-xl border transition-all duration-200 shadow-xs flex flex-col justify-between cursor-pointer ${
        isBreak
          ? "bg-purple-50/60 border-purple-200 text-purple-900"
          : isBooked
          ? "bg-amber-50/70 border-amber-300 text-amber-900 hover:shadow-md hover:border-amber-400"
          : isBlocked
          ? "bg-gray-100 border-gray-300 text-gray-500 opacity-75"
          : "bg-emerald-50/60 border-emerald-300 text-emerald-900 hover:shadow-md hover:border-emerald-400"
      }`}
      onClick={() => {
        if (isBooked) {
          onViewBooking();
        }
      }}
    >
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Slot #{slot.slotNumber || "OP"}
          </span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
              isBreak
                ? "bg-purple-200 text-purple-800"
                : isBooked
                ? "bg-amber-200 text-amber-800"
                : isBlocked
                ? "bg-gray-300 text-gray-700"
                : "bg-emerald-200 text-emerald-800"
            }`}
          >
            {slot.status}
          </span>
        </div>

        <div className="text-sm font-bold tracking-tight text-gray-900 mb-1">
          {slot.startTime} – {slot.endTime}
        </div>

        {doctorName && (
          <div
            className="text-[10px] font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded mb-1 truncate"
            title={doctorName}
          >
            👨‍⚕️ {doctorName}
            {doctorSpecialization && (
              <span className="text-[9px] text-gray-500 ml-1">({doctorSpecialization})</span>
            )}
          </div>
        )}

        <div className="text-[11px] text-gray-500 font-medium mb-1.5 flex items-center justify-between">
          <span>
            ⏱ {slot.duration} Mins {slot.gap > 0 ? `(+${slot.gap}m)` : ""}
          </span>
          {!isBreak && (
            <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
              ₹{slot.consultationFee !== undefined ? slot.consultationFee : 300}
            </span>
          )}
        </div>

        {isBooked && slot.patientName && (
          <div className="bg-amber-100/80 p-1.5 rounded-md text-xs font-semibold text-amber-900 mb-2 truncate flex items-center gap-1">
            <User className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{slot.patientName}</span>
            <span className="text-[9px] text-amber-700 ml-auto flex-shrink-0">👆 View</span>
          </div>
        )}
      </div>

      {!isBreak && (
        <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between gap-1 mt-2">
          {isAvailable && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBook();
              }}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold py-1 px-2 rounded-md shadow-xs transition-all text-center"
            >
              Book
            </button>
          )}

          {isBooked && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewBooking();
              }}
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold py-1 px-2 rounded-md shadow-xs transition-all text-center flex items-center justify-center gap-1"
            >
              <Eye className="w-3 h-3" /> Details
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleStatus();
            }}
            className={`text-[11px] font-semibold py-1 px-2 rounded-md transition-all ${
              isBlocked
                ? "bg-gray-200 hover:bg-gray-300 text-gray-700"
                : isBooked
                ? "bg-amber-200 hover:bg-amber-300 text-amber-800"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            }`}
          >
            {isBlocked ? "Unblock" : isBooked ? "View" : "Block"}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Delete Slot"
            className="text-gray-400 hover:text-red-600 p-1 rounded transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default AppointmentSlots;