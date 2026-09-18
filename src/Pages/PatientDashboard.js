import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";
import {
  FaCalendarCheck,
  FaClock,
  FaTimesCircle,
  FaUserMd,
  FaRupeeSign,
  FaSignOutAlt,
  FaEye,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaVideo,
  FaTimes,
  FaDownload,
  FaCheckCircle,
  FaCalendarAlt,
  FaClipboardList,
  FaHeartbeat,
  FaStethoscope,
  FaBirthdayCake,
  FaVenusMars,
  FaSpinner,
  FaHistory,
  FaUser,
  FaIdCard,
  FaFileInvoiceDollar,
  FaNotesMedical,
  FaCalendarPlus,
  FaArrowRight,
} from "react-icons/fa";
import { FiRefreshCw, FiFileText, FiPaperclip } from "react-icons/fi";

const BASE_URL = API_BASE_URL.endsWith("/") ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
const cleanBaseUrl = BASE_URL.replace(/\/api\/?$/, "");
const API_ORIGIN = cleanBaseUrl;

// ==================== HELPERS ====================
const formatDate = (dateString) => {
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

const formatDateTime = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${day}/${month}/${year} ${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
  } catch {
    return "N/A";
  }
};

const getFileUrl = (path) => {
  if (!path) return "#";
  if (path.startsWith("http")) return path;
  return `${API_ORIGIN}${path}`;
};

const getFileName = (path) => {
  if (!path) return "File";
  return path.split("/").pop() || "File";
};

const getFileType = (path) => {
  if (!path) return "unknown";
  const lower = path.toLowerCase();
  if (lower.endsWith(".pdf")) return "pdf";
  if (lower.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/)) return "image";
  return "other";
};

const getStatusColors = (status) => {
  const map = {
    confirmed: "bg-blue-50 text-blue-700 border-blue-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    consulting: "bg-purple-50 text-purple-700 border-purple-200",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
  };
  return map[status?.toLowerCase()] || map.confirmed;
};

const getPaymentColors = (status) => {
  const map = {
    Paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    Partial: "bg-blue-50 text-blue-700 border-blue-200",
    Due: "bg-red-50 text-red-700 border-red-200",
  };
  return map[status] || map.Pending;
};

// ⭐ Check if appointment has been rescheduled
const isRescheduled = (apt) => {
  return (
    apt &&
    ((apt.rescheduleCount && apt.rescheduleCount > 0) ||
      (apt.rescheduleHistory && apt.rescheduleHistory.length > 0))
  );
};

// ⭐ Get latest reschedule entry
const getLatestReschedule = (apt) => {
  if (!apt || !apt.rescheduleHistory || apt.rescheduleHistory.length === 0) return null;
  return apt.rescheduleHistory[apt.rescheduleHistory.length - 1];
};

// ==================== SLOT HELPERS ====================
const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

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

// ==================== MAIN COMPONENT ====================
const PatientDashboard = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboardData, setDashboardData] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [fileListModal, setFileListModal] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [rescheduleModal, setRescheduleModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const [activeSection, setActiveSection] = useState("upcoming");

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const patientEmail = localStorage.getItem("patientEmail");

  useEffect(() => {
    if (!patientEmail) {
      navigate("/patientlogin", { replace: true });
    }
  }, [patientEmail, navigate]);

  const fetchDashboard = async (isRefresh = false) => {
    if (!patientEmail) return;

    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    setError("");

    try {
      const res = await axios.get(
        `${cleanBaseUrl}/api/patients/dashboard?email=${encodeURIComponent(patientEmail)}`
      );

      if (res.data?.success) {
        setDashboardData(res.data);
        if (isRefresh) showToast("Dashboard refreshed!", "success");
      } else {
        setError(res.data?.message || "Failed to load dashboard");
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      if (err.response?.status === 404) {
        setError("No appointments found. Please book your first appointment.");
      } else {
        setError(
          err.response?.data?.message || "Unable to load dashboard. Please try again."
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [patientEmail]);

  const handleLogout = () => {
    if (!window.confirm("Are you sure you want to logout?")) return;
    localStorage.removeItem("patientEmail");
    localStorage.removeItem("patientName");
    localStorage.removeItem("patientPhone");
    localStorage.removeItem("userData");
    localStorage.removeItem("userRole");
    navigate("/patient/login", { replace: true });
  };

  const openPreview = (path) => {
    if (!path) return;
    setPreviewFile({
      url: getFileUrl(path),
      name: getFileName(path),
      type: getFileType(path),
    });
  };

  const openFileListModal = (apt, type) => {
    const files = type === "reports" ? apt.reports || [] : apt.prescriptions || [];
    if (files.length === 0) return;
    if (files.length === 1) {
      openPreview(files[0]);
      return;
    }
    setFileListModal({ apt, type, files });
  };

  const downloadFile = async (file) => {
    try {
      const response = await fetch(file.url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = file.name || "file";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      showToast("File downloaded!", "success");
    } catch (err) {
      window.open(file.url, "_blank");
    }
  };

  const startWhatsAppVideoCall = (apt) => {
    const phone = dashboardData?.patient?.phone;
    if (!phone) {
      showToast("Phone number not available", "error");
      return;
    }
    const digits = String(phone).replace(/\D/g, "");
    const number = digits.length === 10 ? `91${digits}` : digits;
    const msg = encodeURIComponent(
      `Hello, this is regarding my appointment on ${formatDate(
        apt.appointmentDate
      )} at ${apt.startTime} with ${apt.doctorName}.`
    );
    window.open(`https://wa.me/${number}?text=${msg}`, "_blank");
  };

  const handleRescheduleSubmit = async ({ appointmentId, newDate, newSlot }) => {
    try {
      const res = await axios.put(
        `${cleanBaseUrl}/api/appointment-slots/reschedule/${appointmentId}`,
        {
          appointmentDate: newDate,
          startTime: newSlot.startTime,
          endTime: newSlot.endTime,
          startTime24: newSlot.startTime24 || "",
          endTime24: newSlot.endTime24 || "",
          slotId: newSlot.slotId || "",
          _id: newSlot._id || "",
          dayOfWeek: newSlot.dayOfWeek || "",
          shift: newSlot.shift || "",
          doctorId: newSlot.doctorId || "",
          patientEmail,
        }
      );

      if (res.data?.success) {
        showToast("Appointment rescheduled successfully!", "success");
        setRescheduleModal(null);
        fetchDashboard(true);
      } else {
        showToast(res.data?.message || "Failed to reschedule", "error");
      }
    } catch (err) {
      console.error("Reschedule error:", err);
      showToast(
        err.response?.data?.message || "Unable to reschedule. Please try again.",
        "error"
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <FaSpinner className="w-10 h-10 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <FaTimesCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Oops!</h2>
          <p className="text-sm text-slate-600 mb-6">{error || "Something went wrong"}</p>
          <div className="flex gap-2">
            <button
              onClick={() => fetchDashboard()}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 transition-all"
            >
              <FiRefreshCw className="inline mr-1" /> Retry
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  const {
    patient,
    stats,
    upcomingAppointments,
    pastAppointments,
    cancelledAppointments,
    nextAppointment,
  } = dashboardData;

  const heroRescheduled = isRescheduled(nextAppointment);

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {toast && (
        <div className="fixed top-24 right-5 z-[9999]">
          <div
            className={`flex items-center gap-2 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium ${
              toast.type === "error" ? "bg-red-600" : "bg-emerald-600"
            }`}
          >
            {toast.type === "error" ? <FaTimesCircle /> : <FaCheckCircle />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16">
          <div className="flex items-center justify-between gap-3 h-16 sm:h-18">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 text-white flex items-center justify-center shadow-md flex-shrink-0">
                <FaUserMd className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg mt-2 font-bold text-slate-900 leading-tight truncate">
                  Patient Dashboard
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => fetchDashboard(true)}
                disabled={refreshing}
                className="flex items-center gap-1.5 px-3 py-2 sm:px-3.5 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all disabled:opacity-50 shadow-sm"
              >
                <FiRefreshCw className={refreshing ? "animate-spin" : ""} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 sm:px-4 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 transition-all shadow-md shadow-red-500/20"
              >
                <FaSignOutAlt />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 pt-6 sm:pt-8 pb-4 space-y-6">
        {nextAppointment && (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-blue-600 p-6 sm:p-8 shadow-xl">
            <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 left-1/3 w-56 h-56 bg-white/10 rounded-full translate-y-1/2 blur-3xl"></div>

            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-white/90">
                    Next Appointment
                  </span>
                  {heroRescheduled && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-amber-900 uppercase tracking-wider flex items-center gap-1">
                      <FaCalendarPlus className="w-2.5 h-2.5" />
                      Rescheduled
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0">
                    <FaUserMd className="w-7 h-7 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl sm:text-3xl font-bold text-white truncate">
                      {nextAppointment.doctorName || "Doctor"}
                    </h3>
                    <p className="text-sm text-white/85 mt-0.5">
                      {nextAppointment.doctorSpecialization || "Specialist"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Pill
                    icon={<FaCalendarAlt />}
                    text={formatDate(nextAppointment.appointmentDate)}
                  />
                  <Pill
                    icon={<FaClock />}
                    text={`${nextAppointment.startTime} - ${nextAppointment.endTime}`}
                  />
                  <Pill
                    icon={nextAppointment.isOnline ? <FaVideo /> : <FaUserMd />}
                    text={nextAppointment.appointmentType || "Consultation"}
                  />
                </div>

                {heroRescheduled && (
                  <div className="mt-4 bg-white/15 backdrop-blur-md rounded-xl p-3 border border-white/20">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/80 mb-1.5">
                      Previously Scheduled
                    </p>
                    {(() => {
                      const last = getLatestReschedule(nextAppointment);
                      if (!last) return null;
                      return (
                        <div className="flex items-center gap-2 text-xs text-white flex-wrap">
                          <span className="line-through opacity-80">
                            {formatDate(last.previousDate)}
                          </span>
                          <span className="line-through opacity-80">
                            {last.previousStartTime} - {last.previousEndTime}
                          </span>
                          <FaArrowRight className="w-3 h-3 opacity-70" />
                          <span className="font-bold">{formatDate(last.newDate)}</span>
                          <span className="font-bold">
                            {last.newStartTime} - {last.newEndTime}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-2 self-start lg:self-center flex-shrink-0">
                <button
                  onClick={() => startWhatsAppVideoCall(nextAppointment)}
                  className="px-6 py-3.5 rounded-2xl bg-white text-emerald-700 font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2.5 hover:scale-105"
                >
                  <FaVideo className="text-lg" /> Join Call
                </button>

                {/* ⭐ Reschedule button — disabled if already rescheduled */}
                <button
                  onClick={() => !heroRescheduled && setRescheduleModal(nextAppointment)}
                  disabled={heroRescheduled}
                  title={
                    heroRescheduled
                      ? "Already rescheduled — cannot reschedule again"
                      : "Reschedule"
                  }
                  className={`px-6 py-3 rounded-2xl font-bold text-sm border transition-all flex items-center justify-center gap-2 ${
                    heroRescheduled
                      ? "bg-white/10 backdrop-blur-md text-white/50 border-white/20 cursor-not-allowed"
                      : "bg-white/20 backdrop-blur-md text-white border-white/30 hover:bg-white/30"
                  }`}
                >
                  <FaCalendarPlus /> {heroRescheduled ? "Rescheduled" : "Reschedule"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500"></div>
          <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-500 text-white font-bold flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/20 flex-shrink-0">
              {patient.name ? patient.name.charAt(0).toUpperCase() : "P"}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
                {patient.title ? `${patient.title} ` : ""}
                {patient.name || "Patient"}
              </h2>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {patient.email && (
                  <div className="flex items-center gap-2 min-w-0">
                    <FaEnvelope className="text-emerald-500 flex-shrink-0" />
                    <span className="text-slate-600 truncate">{patient.email}</span>
                  </div>
                )}
                {patient.phone && (
                  <div className="flex items-center gap-2 min-w-0">
                    <FaPhoneAlt className="text-blue-500 flex-shrink-0" />
                    <span className="text-slate-600 truncate">{patient.phone}</span>
                  </div>
                )}
                {patient.age && (
                  <div className="flex items-center gap-2">
                    <FaBirthdayCake className="text-purple-500" />
                    <span className="text-slate-600">{patient.age} yrs</span>
                  </div>
                )}
                {patient.gender && (
                  <div className="flex items-center gap-2">
                    <FaVenusMars className="text-rose-500" />
                    <span className="text-slate-600">{patient.gender}</span>
                  </div>
                )}
              </div>
              {patient.address && (
                <div className="mt-3 flex items-start gap-2 text-xs text-slate-500">
                  <FaMapMarkerAlt className="text-rose-500 mt-0.5 flex-shrink-0" />
                  <span>{patient.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <BigStat
            icon={<FaCalendarCheck />}
            label="Upcoming"
            value={stats.totalUpcoming}
            gradient="from-blue-500 to-blue-600"
          />
          <BigStat
            icon={<FaClipboardList />}
            label="Total Visits"
            value={stats.totalAppointments}
            gradient="from-purple-500 to-purple-600"
          />
          <BigStat
            icon={<FaRupeeSign />}
            label="Total Paid"
            value={`₹${Number(stats.totalPaid).toLocaleString()}`}
            gradient="from-emerald-500 to-emerald-600"
          />
          <BigStat
            icon={<FaHeartbeat />}
            label="Doctors"
            value={stats.totalDoctors}
            gradient="from-rose-500 to-rose-600"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-5 sm:px-6 py-5 border-b border-slate-100 flex items-center gap-3 bg-gradient-to-r from-slate-50 to-white">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center shadow-md flex-shrink-0">
              <FaHistory className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Consultation History
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                All your appointments — upcoming, past & cancelled
              </p>
            </div>
          </div>

          <div className="px-4 sm:px-6 pt-4">
            <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-2xl w-full sm:w-auto overflow-x-auto">
              <SectionPill
                active={activeSection === "upcoming"}
                onClick={() => setActiveSection("upcoming")}
                icon={<FaCalendarCheck />}
                label="Upcoming"
                count={upcomingAppointments.length}
                activeColor="blue"
              />
              <SectionPill
                active={activeSection === "past"}
                onClick={() => setActiveSection("past")}
                icon={<FaClock />}
                label="Past"
                count={pastAppointments.length}
                activeColor="slate"
              />
              <SectionPill
                active={activeSection === "cancelled"}
                onClick={() => setActiveSection("cancelled")}
                icon={<FaTimesCircle />}
                label="Cancelled"
                count={cancelledAppointments.length}
                activeColor="red"
              />
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {activeSection === "upcoming" && (
              <>
                {upcomingAppointments.length === 0 ? (
                  <EmptyState text="No upcoming appointments" />
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {upcomingAppointments.map((apt) => (
                      <AppointmentCard
                        key={apt._id}
                        apt={apt}
                        onFileList={openFileListModal}
                        onVideoCall={startWhatsAppVideoCall}
                        onViewDetails={setDetailModal}
                        onReschedule={setRescheduleModal}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {activeSection === "past" && (
              <>
                {pastAppointments.length === 0 ? (
                  <EmptyState text="No past consultations yet" />
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {pastAppointments.map((apt) => (
                      <AppointmentCard
                        key={apt._id}
                        apt={apt}
                        onFileList={openFileListModal}
                        onVideoCall={startWhatsAppVideoCall}
                        onViewDetails={setDetailModal}
                        onReschedule={setRescheduleModal}
                        isPast
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {activeSection === "cancelled" && (
              <>
                {cancelledAppointments.length === 0 ? (
                  <EmptyState text="No cancelled appointments" />
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {cancelledAppointments.map((apt) => (
                      <AppointmentCard
                        key={apt._id}
                        apt={apt}
                        onFileList={openFileListModal}
                        onVideoCall={startWhatsAppVideoCall}
                        onViewDetails={setDetailModal}
                        onReschedule={setRescheduleModal}
                        isPast
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {detailModal && (
        <AppointmentDetailModal
          apt={detailModal}
          onClose={() => setDetailModal(null)}
          onFileList={(apt, type) => {
            setDetailModal(null);
            openFileListModal(apt, type);
          }}
          onVideoCall={startWhatsAppVideoCall}
          onReschedule={(apt) => {
            setDetailModal(null);
            setRescheduleModal(apt);
          }}
        />
      )}

      {rescheduleModal && (
        <RescheduleModal
          apt={rescheduleModal}
          onClose={() => setRescheduleModal(null)}
          onSubmit={handleRescheduleSubmit}
        />
      )}

      {previewFile && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <div className="min-w-0">
                <h3 className="font-bold text-slate-900 text-sm truncate">
                  {previewFile.name}
                </h3>
                <p className="text-xs text-slate-500">File Preview</p>
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <FaTimes />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-slate-100">
              <div className="flex items-center justify-center min-h-[400px]">
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
                    <FiFileText className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-600">
                      Preview not available
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => downloadFile(previewFile)}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
              >
                <FaDownload /> Download
              </button>
              <button
                onClick={() => setPreviewFile(null)}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {fileListModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[85vh]">
            <div
              className={`flex items-center justify-between px-5 py-4 border-b border-slate-100 ${
                fileListModal.type === "reports" ? "bg-indigo-50" : "bg-purple-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
                    fileListModal.type === "reports" ? "bg-indigo-600" : "bg-purple-600"
                  }`}
                >
                  {fileListModal.type === "reports" ? <FiFileText /> : <FiPaperclip />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {fileListModal.type === "reports" ? "Reports" : "Prescriptions"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {fileListModal.files.length} file
                    {fileListModal.files.length > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFileListModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-white"
              >
                <FaTimes />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {fileListModal.files.map((path, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    openPreview(path);
                    setFileListModal(null);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl border-2 border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all text-left"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${
                      fileListModal.type === "reports" ? "bg-indigo-500" : "bg-purple-500"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {getFileName(path)}
                    </div>
                    <div className="text-[10px] text-slate-500">Click to preview</div>
                  </div>
                  <FaEye className="text-slate-400 flex-shrink-0" />
                </button>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setFileListModal(null)}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== SUB-COMPONENTS ====================

const Pill = ({ icon, text }) => (
  <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3.5 py-1.5 rounded-full text-xs font-semibold text-white">
    {icon} {text}
  </span>
);

const BigStat = ({ icon, label, value, gradient }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-5 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-3">
      <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
        {label}
      </span>
      <div
        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} text-white flex items-center justify-center shadow-lg flex-shrink-0`}
      >
        {icon}
      </div>
    </div>
    <div className="text-2xl sm:text-3xl font-bold text-slate-900 truncate">
      {value}
    </div>
  </div>
);

const SectionPill = ({ active, onClick, icon, label, count, activeColor }) => {
  const colorMap = {
    blue: "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-500/30",
    slate: "bg-gradient-to-r from-slate-600 to-slate-800 text-white shadow-slate-500/30",
    red: "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-red-500/30",
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex-shrink-0 ${
        active
          ? `${colorMap[activeColor]} shadow-md`
          : "text-slate-600 hover:bg-white hover:text-slate-900"
      }`}
    >
      {icon}
      <span>{label}</span>
      <span
        className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
          active ? "bg-white/25 text-white" : "bg-slate-200 text-slate-600"
        }`}
      >
        {count}
      </span>
    </button>
  );
};

const EmptyState = ({ text }) => (
  <div className="text-center py-10">
    <FaCalendarAlt className="w-12 h-12 text-slate-200 mx-auto mb-3" />
    <p className="text-sm font-medium text-slate-500">{text}</p>
  </div>
);

// ============ APPOINTMENT CARD ============
const AppointmentCard = ({
  apt,
  onFileList,
  onVideoCall,
  onViewDetails,
  onReschedule,
  isPast = false,
}) => {
  const isOnline = apt.isOnline || apt.bookingType === "Online";
  const rescheduled = isRescheduled(apt);
  const lastReschedule = getLatestReschedule(apt);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-lg hover:border-slate-300 transition-all flex flex-col">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center flex-shrink-0 shadow-md">
            {apt.doctorName ? apt.doctorName.charAt(0).toUpperCase() : "D"}
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-slate-900 text-sm truncate">
              {apt.doctorName || "Doctor"}
            </h4>
            <p className="text-[11px] text-slate-500 truncate">
              {apt.doctorSpecialization || "Specialist"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => onViewDetails(apt)}
            title="View full details"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700 transition-all"
          >
            <FaEye className="w-3.5 h-3.5" />
          </button>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getStatusColors(
              apt.status
            )}`}
          >
            {apt.status}
          </span>
        </div>
      </div>

      {rescheduled && (
        <div className="mb-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-center gap-2">
          <FaCalendarPlus className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
            Rescheduled
          </span>
          {apt.rescheduleCount > 1 && (
            <span className="text-[10px] font-bold text-amber-700 ml-auto">
              ×{apt.rescheduleCount}
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 text-[11px] mb-3">
        <div className="flex items-center gap-1.5 text-slate-700">
          <FaCalendarAlt className="text-emerald-500 flex-shrink-0" />
          <span className="font-semibold">{formatDate(apt.appointmentDate)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-700">
          <FaClock className="text-blue-500 flex-shrink-0" />
          <span className="font-semibold">
            {apt.startTime} - {apt.endTime}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600 col-span-2">
          <FaStethoscope className="text-purple-500 flex-shrink-0" />
          <span className="truncate">{apt.purpose || apt.symptoms || "Consultation"}</span>
        </div>
      </div>

      {rescheduled && lastReschedule && (
        <div className="mb-3 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
          <div className="text-[9px] font-bold uppercase text-slate-400 mb-1">
            Previous Slot
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 flex-wrap">
            <span className="line-through">
              {formatDate(lastReschedule.previousDate)}
            </span>
            <span className="line-through">
              {lastReschedule.previousStartTime} - {lastReschedule.previousEndTime}
            </span>
            <FaArrowRight className="w-2.5 h-2.5" />
            <span className="font-bold text-slate-700">
              {lastReschedule.newStartTime} - {lastReschedule.newEndTime}
            </span>
          </div>
        </div>
      )}

      {apt.services && apt.services.length > 0 && (
        <div className="mb-3 pb-3 border-t border-slate-100 pt-3">
          <div className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">
            Services
          </div>
          <div className="flex flex-wrap gap-1.5">
            {apt.services.map((s, i) => (
              <span
                key={i}
                className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100"
              >
                {s.name} · ₹{s.price}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-3 pt-3 border-t border-slate-100">
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getPaymentColors(
            apt.paymentStatus
          )}`}
        >
          {apt.paymentStatus}
        </span>
        <div className="text-right">
          <div className="text-[9px] font-bold uppercase text-slate-400">Total</div>
          <div className="text-sm font-bold text-slate-900">₹{apt.finalPayable}</div>
        </div>
      </div>

      {(apt.reports?.length > 0 || apt.prescriptions?.length > 0) && (
        <div className="flex flex-wrap gap-1.5 mb-3 pb-3 border-t border-slate-100 pt-3">
          {apt.reports?.length > 0 && (
            <button
              onClick={() => onFileList(apt, "reports")}
              className="inline-flex items-center gap-1 text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full border border-indigo-200 hover:bg-indigo-100 transition-colors"
            >
              <FiFileText className="w-3 h-3" /> {apt.reports.length} Report
              {apt.reports.length > 1 ? "s" : ""}
            </button>
          )}
          {apt.prescriptions?.length > 0 && (
            <button
              onClick={() => onFileList(apt, "prescriptions")}
              className="inline-flex items-center gap-1 text-[10px] font-bold bg-purple-50 text-purple-700 px-2 py-1 rounded-full border border-purple-200 hover:bg-purple-100 transition-colors"
            >
              <FiPaperclip className="w-3 h-3" /> {apt.prescriptions.length} Prescription
              {apt.prescriptions.length > 1 ? "s" : ""}
            </button>
          )}
        </div>
      )}

      {/* ⭐ ACTIONS */}
      <div className="flex gap-1.5 pt-3 border-t border-slate-100 mt-auto">
        {/* Reschedule button — DISABLED if already rescheduled */}
        <button
          onClick={() => !rescheduled && onReschedule(apt)}
          disabled={rescheduled}
          title={
            rescheduled
              ? "Already rescheduled — cannot reschedule again"
              : "Reschedule"
          }
          className={`flex items-center justify-center gap-1 px-2.5 py-2.5 rounded-xl text-[11px] font-bold transition-all flex-shrink-0 border ${
            rescheduled
              ? "text-slate-400 bg-slate-100 border-slate-200 cursor-not-allowed"
              : "text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200"
          }`}
        >
          <FaCalendarPlus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {rescheduled ? "Rescheduled" : "Reschedule"}
          </span>
        </button>

        {isOnline && (
          <button
            onClick={() => onVideoCall(apt)}
            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl text-[11px] font-bold text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-md shadow-green-500/20 transition-all"
          >
            <FaVideo className="w-3.5 h-3.5" /> Join
          </button>
        )}

        <button
          onClick={() => onVideoCall(apt)}
          className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all"
        >
          <FaPhoneAlt className="w-3.5 h-3.5" /> Contact
        </button>
      </div>
    </div>
  );
};

// ============ APPOINTMENT DETAIL MODAL ============
const AppointmentDetailModal = ({
  apt,
  onClose,
  onFileList,
  onVideoCall,
  onReschedule,
}) => {
  const isOnline = apt.isOnline || apt.bookingType === "Online";
  const patient = apt.patient || {};
  const rescheduled = isRescheduled(apt);
  const lastReschedule = getLatestReschedule(apt);

  return (
    <div
      className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-gradient-to-br from-emerald-500 via-teal-500 to-blue-600 px-5 sm:px-6 py-5">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
          <div className="relative flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0">
                <FaUserMd className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">
                  Appointment Details
                </p>
                <h3 className="text-lg sm:text-xl font-bold text-white truncate">
                  {apt.doctorName || "Doctor"}
                </h3>
                <p className="text-xs text-white/85 truncate">
                  {apt.doctorSpecialization || "Specialist"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/20 transition-all flex-shrink-0"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            <span
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase ${getStatusColors(
                apt.status
              )}`}
            >
              Status: {apt.status}
            </span>
            <span
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase ${getPaymentColors(
                apt.paymentStatus
              )}`}
            >
              Payment: {apt.paymentStatus}
            </span>
            {isOnline && (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase bg-emerald-50 text-emerald-700 border-emerald-200">
                Online
              </span>
            )}
            {rescheduled && (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
                <FaCalendarPlus className="w-2.5 h-2.5" />
                Rescheduled ×{apt.rescheduleCount || 1}
              </span>
            )}
          </div>

          {rescheduled && lastReschedule && (
            <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden">
              <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-amber-200 bg-amber-100/60">
                <FaCalendarPlus className="w-3.5 h-3.5 text-amber-700" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  Reschedule History
                </h4>
                {apt.rescheduleCount > 1 && (
                  <span className="ml-auto text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-600 text-white">
                    {apt.rescheduleCount} times
                  </span>
                )}
              </div>
              <div className="p-4 space-y-3">
                <div className="bg-white/70 rounded-lg p-3 border border-amber-200">
                  <div className="text-[10px] font-bold uppercase text-amber-700 mb-1.5">
                    Previous Slot
                  </div>
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="flex items-center gap-1.5 text-slate-500 line-through">
                      <FaCalendarAlt className="w-3 h-3" />
                      {formatDate(lastReschedule.previousDate)}
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-500 line-through">
                      <FaClock className="w-3 h-3" />
                      {lastReschedule.previousStartTime} -{" "}
                      {lastReschedule.previousEndTime}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <div className="flex items-center gap-2 text-amber-600">
                    <div className="h-px w-12 bg-amber-300"></div>
                    <FaArrowRight className="w-4 h-4" />
                    <div className="h-px w-12 bg-amber-300"></div>
                  </div>
                </div>

                <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                  <div className="text-[10px] font-bold uppercase text-emerald-700 mb-1.5">
                    New Slot
                  </div>
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="flex items-center gap-1.5 text-emerald-800 font-bold">
                      <FaCalendarAlt className="w-3 h-3" />
                      {formatDate(lastReschedule.newDate)}
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-800 font-bold">
                      <FaClock className="w-3 h-3" />
                      {lastReschedule.newStartTime} - {lastReschedule.newEndTime}
                    </span>
                  </div>
                </div>

                {lastReschedule.rescheduledAt && (
                  <div className="flex items-center gap-1.5 text-[10px] text-amber-700 pt-2 border-t border-amber-200">
                    <FaHistory className="w-3 h-3" />
                    Rescheduled on{" "}
                    <span className="font-bold">
                      {formatDateTime(lastReschedule.rescheduledAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <DetailSection icon={<FaCalendarAlt />} title="Current Date & Time" color="emerald">
            <DetailRow label="Date" value={formatDate(apt.appointmentDate)} />
            <DetailRow label="Start Time" value={apt.startTime || "N/A"} />
            <DetailRow label="End Time" value={apt.endTime || "N/A"} />
          </DetailSection>

          <DetailSection icon={<FaUserMd />} title="Doctor Information" color="blue">
            <DetailRow label="Name" value={apt.doctorName || "N/A"} />
            <DetailRow label="Specialization" value={apt.doctorSpecialization || "N/A"} />
            {apt.doctorEmail && <DetailRow label="Email" value={apt.doctorEmail} />}
            {apt.doctorPhone && <DetailRow label="Phone" value={apt.doctorPhone} />}
          </DetailSection>

          {(apt.patientName || patient.name || apt.patientEmail || patient.email) && (
            <DetailSection icon={<FaUser />} title="Patient Information" color="purple">
              <DetailRow label="Name" value={apt.patientName || patient.name || "N/A"} />
              {apt.patientAge || patient.age ? (
                <DetailRow label="Age" value={`${apt.patientAge || patient.age} years`} />
              ) : null}
              {apt.patientGender || patient.gender ? (
                <DetailRow label="Gender" value={apt.patientGender || patient.gender} />
              ) : null}
              {apt.patientPhone || patient.phone ? (
                <DetailRow label="Phone" value={apt.patientPhone || patient.phone} />
              ) : null}
              {apt.patientEmail || patient.email ? (
                <DetailRow label="Email" value={apt.patientEmail || patient.email} />
              ) : null}
            </DetailSection>
          )}

          {(apt.purpose || apt.symptoms || apt.notes) && (
            <DetailSection icon={<FaNotesMedical />} title="Purpose / Symptoms" color="amber">
              {apt.purpose && <DetailRow label="Purpose" value={apt.purpose} />}
              {apt.symptoms && <DetailRow label="Symptoms" value={apt.symptoms} />}
              {apt.notes && <DetailRow label="Notes" value={apt.notes} />}
            </DetailSection>
          )}

          {apt.services && apt.services.length > 0 && (
            <DetailSection icon={<FaStethoscope />} title="Services" color="indigo">
              <div className="flex flex-wrap gap-1.5">
                {apt.services.map((s, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-100"
                  >
                    {s.name} · ₹{s.price}
                  </span>
                ))}
              </div>
            </DetailSection>
          )}

          <DetailSection icon={<FaFileInvoiceDollar />} title="Payment Summary" color="rose">
            {apt.consultationFee !== undefined && (
              <DetailRow label="Consultation Fee" value={`₹${apt.consultationFee}`} />
            )}
            {apt.servicesTotal !== undefined && (
              <DetailRow label="Services Total" value={`₹${apt.servicesTotal}`} />
            )}
            {apt.discount !== undefined && apt.discount > 0 && (
              <DetailRow label="Discount" value={`- ₹${apt.discount}`} />
            )}
            {apt.tax !== undefined && apt.tax > 0 && (
              <DetailRow label="Tax" value={`₹${apt.tax}`} />
            )}
            {apt.finalPayable !== undefined && (
              <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-200">
                <span className="text-xs font-bold text-slate-900">Final Payable</span>
                <span className="text-base font-bold text-emerald-700">
                  ₹{apt.finalPayable}
                </span>
              </div>
            )}
            {apt.amountPaid !== undefined && (
              <DetailRow label="Amount Paid" value={`₹${apt.amountPaid}`} />
            )}
            {apt.amountDue !== undefined && (
              <DetailRow label="Amount Due" value={`₹${apt.amountDue}`} />
            )}
            {apt.paymentMethod && (
              <DetailRow label="Payment Method" value={apt.paymentMethod} />
            )}
            {apt.transactionId && (
              <DetailRow label="Transaction ID" value={apt.transactionId} />
            )}
          </DetailSection>

          {(apt.reports?.length > 0 || apt.prescriptions?.length > 0) && (
            <DetailSection icon={<FiPaperclip />} title="Attachments" color="cyan">
              <div className="flex flex-wrap gap-2">
                {apt.reports?.length > 0 && (
                  <button
                    onClick={() => onFileList(apt, "reports")}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full border border-indigo-200 hover:bg-indigo-100 transition-colors"
                  >
                    <FiFileText className="w-3.5 h-3.5" /> {apt.reports.length} Report
                    {apt.reports.length > 1 ? "s" : ""}
                  </button>
                )}
                {apt.prescriptions?.length > 0 && (
                  <button
                    onClick={() => onFileList(apt, "prescriptions")}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full border border-purple-200 hover:bg-purple-100 transition-colors"
                  >
                    <FiPaperclip className="w-3.5 h-3.5" /> {apt.prescriptions.length}{" "}
                    Prescription
                    {apt.prescriptions.length > 1 ? "s" : ""}
                  </button>
                )}
              </div>
            </DetailSection>
          )}

          {(apt.bookingId || apt._id || apt.createdAt) && (
            <DetailSection icon={<FaIdCard />} title="Booking Info" color="slate">
              {apt.bookingId && <DetailRow label="Booking ID" value={apt.bookingId} />}
              {apt._id && <DetailRow label="Reference ID" value={apt._id} />}
              {apt.createdAt && (
                <DetailRow label="Booked On" value={formatDate(apt.createdAt)} />
              )}
              {apt.appointmentType && (
                <DetailRow label="Appointment Type" value={apt.appointmentType} />
              )}
              {apt.bookingType && <DetailRow label="Booking Type" value={apt.bookingType} />}
            </DetailSection>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-4 sm:px-6 py-3 border-t border-slate-200 bg-slate-50 flex-wrap">
          {/* ⭐ Reschedule button — DISABLED if already rescheduled */}
          <button
            onClick={() => !rescheduled && onReschedule(apt)}
            disabled={rescheduled}
            title={
              rescheduled
                ? "Already rescheduled — cannot reschedule again"
                : "Reschedule"
            }
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md transition-all ${
              rescheduled
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-amber-500 hover:bg-amber-600 text-white"
            }`}
          >
            <FaCalendarPlus /> {rescheduled ? "Rescheduled" : "Reschedule"}
          </button>
          {isOnline && (
            <button
              onClick={() => {
                onVideoCall(apt);
                onClose();
              }}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white flex items-center gap-1.5 shadow-md"
            >
              <FaVideo /> Join Call
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ============ RESCHEDULE MODAL ============
const RescheduleModal = ({ apt, onClose, onSubmit }) => {
  const today = new Date().toISOString().split("T")[0];

  const [newDate, setNewDate] = useState(
    apt.appointmentDate
      ? new Date(apt.appointmentDate).toISOString().split("T")[0]
      : today
  );
  const [submitting, setSubmitting] = useState(false);

  const [allSlots, setAllSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [nowTick, setNowTick] = useState(Date.now());

  useEffect(() => {
    const tick = setInterval(() => setNowTick(Date.now()), 30000);
    return () => clearInterval(tick);
  }, []);

  const dayOfWeekName = useMemo(() => {
    if (!newDate) return "Monday";
    const dateObj = new Date(newDate);
    return DAYS_OF_WEEK[dateObj.getDay()];
  }, [newDate]);

  const isToday = useMemo(() => newDate === today, [newDate, today]);

  const isSlotPast = (slot) => {
    if (!isToday) return false;
    const now = new Date(nowTick);
    return getSlotStartMinutes(slot) <= now.getHours() * 60 + now.getMinutes();
  };

  const isSlotBookable = (slot) => {
    return slot.status !== "booked" && slot.status !== "break" && !isSlotPast(slot);
  };

  const fetchSlotsForDay = async (dayName, doctorId) => {
    setLoadingSlots(true);
    setSelectedSlot(null);
    try {
      let url = `${cleanBaseUrl}/api/appointment-slots?dayOfWeek=${dayName}`;
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

  useEffect(() => {
    const doctorId = apt.doctorId || apt.doctor?._id || "";
    fetchSlotsForDay(dayOfWeekName, doctorId);
  }, [newDate, dayOfWeekName]);

  const availableSlots = useMemo(
    () => allSlots.filter((s) => s.type !== "break" && isSlotBookable(s)),
    [allSlots, isToday, nowTick]
  );

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!newDate || !selectedSlot) return;

    setSubmitting(true);
    try {
      await onSubmit({
        appointmentId: apt._id,
        newDate,
        newSlot: selectedSlot,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 px-5 sm:px-6 py-5">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
          <div className="relative flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0">
                <FaCalendarPlus className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">
                  Reschedule
                </p>
                <h3 className="text-base sm:text-lg font-bold text-white truncate">
                  {apt.doctorName || "Doctor"}
                </h3>
                <p className="text-[11px] text-white/85 truncate">
                  {apt.doctorSpecialization || "Specialist"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/20 transition-all flex-shrink-0"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
            <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">
              Current Schedule
            </p>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                <FaCalendarAlt className="text-slate-400" />
                {formatDate(apt.appointmentDate)}
              </span>
              <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                <FaClock className="text-slate-400" />
                {apt.startTime} - {apt.endTime}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              New Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              min={today}
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-xl text-sm border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
            />
            <p className="mt-1.5 text-[11px] text-slate-500">
              Day: <span className="font-bold text-slate-700">{dayOfWeekName}</span>
            </p>
          </div>

          {selectedSlot && (
            <div className="rounded-xl p-3 border-l-4 bg-emerald-50 border-emerald-500 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-wider font-black text-emerald-700">
                  Selected Slot
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {selectedSlot.startTime} – {selectedSlot.endTime}
                </div>
              </div>
              <FaCheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
          )}

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Available Slots</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {isToday ? "Only upcoming slots are shown" : `For ${dayOfWeekName}`}
                </p>
              </div>
              {!loadingSlots && (
                <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-blue-50 text-blue-700">
                  {availableSlots.length} available
                </span>
              )}
            </div>

            {loadingSlots ? (
              <div className="py-10 text-center">
                <FaSpinner className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
                <p className="text-xs text-slate-500">Loading slots…</p>
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="py-8 text-center">
                <FaCalendarAlt className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p className="text-xs text-slate-500 italic">
                  {isToday
                    ? "No upcoming slots available today. Try another date."
                    : "No slots available for this day."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {availableSlots.map((slot) => (
                  <RescheduleSlotTile
                    key={slot._id || slot.slotId}
                    slot={slot}
                    isSelected={
                      selectedSlot &&
                      (selectedSlot._id === slot._id ||
                        selectedSlot.slotId === slot.slotId)
                    }
                    onSelect={() => setSelectedSlot(slot)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-[11px] text-amber-800 leading-relaxed">
              ⚠️ Rescheduling is subject to doctor availability. You'll be notified once
              confirmed.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !selectedSlot}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white flex items-center gap-1.5 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <FaSpinner className="animate-spin" /> Submitting...
              </>
            ) : (
              <>
                <FaCalendarPlus /> Confirm Reschedule
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const RescheduleSlotTile = ({ slot, isSelected, onSelect }) => (
  <button
    type="button"
    onClick={onSelect}
    className={`p-2.5 rounded-lg border-2 text-left transition-all flex flex-col justify-between h-16 active:scale-[0.97] ${
      isSelected
        ? "bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/30"
        : "bg-white border-slate-200 hover:border-amber-400 hover:bg-amber-50"
    }`}
  >
    <div
      className={`text-[11px] font-bold tracking-tight ${
        isSelected ? "text-white" : "text-slate-900"
      }`}
    >
      {slot.startTime} – {slot.endTime}
    </div>
    <div className="flex items-center justify-end">
      <span
        className={`px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider font-black ${
          isSelected ? "bg-white text-amber-600" : "bg-amber-100 text-amber-700"
        }`}
      >
        {isSelected ? "Selected" : "Book"}
      </span>
    </div>
  </button>
);

const DetailSection = ({ icon, title, color = "slate", children }) => {
  const colorMap = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    purple: "bg-purple-50 text-purple-700 border-purple-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
    rose: "bg-rose-50 text-rose-700 border-rose-100",
    cyan: "bg-cyan-50 text-cyan-700 border-cyan-100",
    slate: "bg-slate-50 text-slate-700 border-slate-100",
  };

  return (
    <div className={`rounded-xl border ${colorMap[color]} overflow-hidden`}>
      <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-white/60">
        <span className="text-sm">{icon}</span>
        <h4 className="text-xs font-bold uppercase tracking-wider">{title}</h4>
      </div>
      <div className="px-3.5 py-3 space-y-1.5 bg-white/60">{children}</div>
    </div>
  );
};

const DetailRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-3 text-xs">
    <span className="text-slate-500 font-medium flex-shrink-0">{label}</span>
    <span className="text-slate-900 font-semibold text-right break-words">
      {value || "N/A"}
    </span>
  </div>
);

export default PatientDashboard;