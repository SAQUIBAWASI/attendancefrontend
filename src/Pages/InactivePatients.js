// InactivePatients.js — Inactive OPD Patients History
// ✅ Stats Cards + Filters + Export CSV + Mobile Card View
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";
import {
  FaUserInjured, FaSearch, FaTimes, FaPhoneAlt, FaCheckCircle,
  FaToggleOn, FaToggleOff, FaEye, FaBirthdayCake, FaVenusMars,
  FaMapMarkerAlt, FaTint, FaEnvelope, FaCalendarAlt, FaNotesMedical,
  FaAllergies, FaPills, FaFileInvoiceDollar, FaPrescription, FaHeartbeat,
  FaUserFriends, FaUserMd as FaUserMdIcon, FaStickyNote, FaCommentMedical,
  FaUserCheck, FaUserClock, FaClinicMedical, FaFlask, FaDownload,
  FaFilter, FaTrashAlt, FaRupeeSign, FaCalendarRange
} from "react-icons/fa";
import {
  FiRefreshCw, FiUsers, FiClock, FiEye, FiXCircle, FiCheckCircle,
  FiTrash2, FiDownload, FiFilter, FiUserX, FiDollarSign
} from "react-icons/fi";
import "./EmployeeDashboard.css";
import "./EmployeeLeaves.css";

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

const formatTime = (dateStr) =>
  !dateStr ? "" : new Date(dateStr).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit", hour12: true
  });

const getBookingServices = (booking) => {
  if (!booking) return [];
  const arr = (Array.isArray(booking.serviceItems) && booking.serviceItems.length > 0 && booking.serviceItems) ||
    (Array.isArray(booking.services) && booking.services.length > 0 && booking.services) || [];
  return arr.map((s) => ({
    name: s.name || "Service",
    price: Number(s.price) || 0,
  }));
};

const getBookingFinalPayable = (booking) => {
  if (!booking) return 0;
  return Number(booking.finalPayable) ||
    Number(booking.finalPayableAmount) ||
    Number(booking.grandTotal) ||
    Number(booking.totalAmount) || 0;
};

export default function InactivePatients() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);
  const [togglingStatus, setTogglingStatus] = useState(null);

  // Filters
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [doctorFilter, setDoctorFilter] = useState("All");
  const [genderFilter, setGenderFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Card filter
  const [activeCardFilter, setActiveCardFilter] = useState("all");

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [patientBookings, setPatientBookings] = useState([]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/appointment-slots/getallbookings`);
      let data = [];
      if (res.data?.success) data = res.data.bookings || res.data.data || [];
      else if (Array.isArray(res.data)) data = res.data;

      const transformed = data.map((b) => {
        const slotDetails = b.slotDetails || {};
        const rawServices = (Array.isArray(b.services) && b.services.length > 0 && b.services) ||
          (Array.isArray(b.serviceItems) && b.serviceItems.length > 0 && b.serviceItems) || [];
        const normalizedServices = rawServices.map((s) => ({
          name: s.name || "Service",
          price: Number(s.price) || 0,
          serviceId: s.serviceId || s._id || "",
        }));

        const finalPayable = Number(b.finalPayable) || Number(b.finalPayableAmount) ||
          Number(b.grandTotal) || Number(b.totalAmount) || 0;

        return {
          _id: b._id || b.id,
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
          purpose: b.purpose || "",
          symptoms: b.symptoms || "",
          doctorName: slotDetails.doctorName || b.doctorName || "",
          doctorSpecialization: slotDetails.doctorSpecialization || b.doctorSpecialization || "",
          startTime: slotDetails.startTime || b.startTime || "",
          endTime: slotDetails.endTime || b.endTime || "",
          appointmentDate: b.appointmentDate || slotDetails.date || "",
          date: slotDetails.date || b.appointmentDate || b.date || "",
          paymentType: b.paymentType || "cash",
          paymentStatus: b.paymentStatus || "Pending",
          finalPayable,
          totalAmount: finalPayable,
          amountPaid: Number(b.amountPaid) || 0,
          balanceAmount: Number(b.balanceAmount) || Math.max(0, finalPayable - (Number(b.amountPaid) || 0)),
          serviceItems: normalizedServices,
          services: normalizedServices,
          createdAt: b.createdAt || b.bookedAt || new Date().toISOString(),
          bookedAt: b.bookedAt || b.createdAt || new Date().toISOString(),
          isActive: b.isActive !== undefined ? b.isActive : true,
          referredByCustomer: b.referredByCustomer || "",
          referredByDoctor: b.referredByDoctor || "",
          clinicalNotes: b.clinicalNotes || "",
          diagnosis: b.diagnosis || "",
          prescription: b.prescription || "",
          vitalsTemp: b.vitalsTemp || "",
          vitalsBp: b.vitalsBp || "",
          vitalsPr: b.vitalsPr || "",
          vitalsWeight: b.vitalsWeight || "",
          checkInTime: b.checkInTime || null,
          checkOutTime: b.checkOutTime || null,
          waitingTime: Number(b.waitingTime) || 0,
          followUpRequired: b.followUpRequired || false,
          followUpDate: b.followUpDate || "",
          followUpNotes: b.followUpNotes || "",
          patientRating: b.patientRating ?? null,
          patientFeedback: b.patientFeedback || "",
          status: b.status || "confirmed",
          medicineTotal: Number(b.medicineTotal) || 0,
          labTotal: Number(b.labTotal) || 0,
        };
      });
      setBookings(transformed);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const patients = useMemo(() => {
    const map = new Map();
    const sorted = [...bookings].sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );
    sorted.forEach((b) => {
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
          isActive: b.isActive !== undefined ? b.isActive : true,
          latestBookingId: b._id,
          createdAt: b.createdAt || b.bookedAt,
          paymentStatus: b.paymentStatus || "Pending",
          totalFee: getBookingFinalPayable(b),
          doctorName: b.doctorName || "",
          appointmentDate: b.appointmentDate || b.date || "",
        });
      }
    });
    return Array.from(map.values());
  }, [bookings]);

  const getMatchingBooking = (patient) =>
    bookings.find((b) =>
      b.patientPhone === patient.phone ||
      (b.patientName && patient.name && b.patientName.toLowerCase() === patient.name.toLowerCase())
    );

  // ✅ Filter inactive patients
  const inactivePatients = useMemo(() => {
    return patients.filter((p) => !p.isActive).filter((p) => {
      // Card filter
      if (activeCardFilter === "Paid" && p.paymentStatus !== "Paid") return false;
      if (activeCardFilter === "Pending" && p.paymentStatus !== "Pending") return false;
      if (activeCardFilter === "Partial" && p.paymentStatus !== "Partial") return false;
      if (activeCardFilter === "Due" && p.paymentStatus !== "Due") return false;

      // Payment filter
      if (paymentFilter !== "All" && p.paymentStatus !== paymentFilter) return false;

      // Doctor filter
      if (doctorFilter !== "All" && p.doctorName !== doctorFilter) return false;

      // Gender filter
      if (genderFilter !== "All" && p.gender !== genderFilter) return false;

      // Date range
      if (p.createdAt) {
        const d = new Date(p.createdAt);
        if (fromDate && toDate) {
          const from = new Date(fromDate); from.setHours(0, 0, 0, 0);
          const to = new Date(toDate); to.setHours(23, 59, 59, 999);
          if (d < from || d > to) return false;
        } else if (fromDate) {
          const from = new Date(fromDate); from.setHours(0, 0, 0, 0);
          if (d < from) return false;
        } else if (toDate) {
          const to = new Date(toDate); to.setHours(23, 59, 59, 999);
          if (d > to) return false;
        }
      }

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (p.name || "").toLowerCase().includes(q) ||
          (p.phone || "").toLowerCase().includes(q) ||
          (p.city || "").toLowerCase().includes(q) ||
          (p.pincode || "").toLowerCase().includes(q) ||
          (p.doctorName || "").toLowerCase().includes(q);
      }
      return true;
    });
  }, [patients, searchQuery, paymentFilter, doctorFilter, genderFilter, fromDate, toDate, activeCardFilter]);

  // ✅ Stats
  const stats = useMemo(() => {
    const allInactive = patients.filter((p) => !p.isActive);
    let paid = 0, pending = 0, partial = 0, due = 0;
    let totalRevenue = 0;

    allInactive.forEach((p) => {
      if (p.paymentStatus === "Paid") paid++;
      else if (p.paymentStatus === "Partial") partial++;
      else if (p.paymentStatus === "Due") due++;
      else pending++;

      totalRevenue += Number(p.totalFee) || 0;
    });

    return {
      total: allInactive.length,
      paid, pending, partial, due,
      totalRevenue,
    };
  }, [patients]);

  const uniqueDoctors = useMemo(() => {
    const set = new Set();
    patients.forEach((p) => { if (p.doctorName) set.add(p.doctorName); });
    return Array.from(set);
  }, [patients]);

  const hasActiveFilters =
    searchQuery !== "" || paymentFilter !== "All" || doctorFilter !== "All" ||
    genderFilter !== "All" || fromDate !== "" || toDate !== "" ||
    activeCardFilter !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setPaymentFilter("All");
    setDoctorFilter("All");
    setGenderFilter("All");
    setFromDate("");
    setToDate("");
    setActiveCardFilter("all");
  };

  const handleCardClick = (type) => {
    setActiveCardFilter(type);
  };

  // ✅ Export CSV
  const downloadCSV = () => {
    if (!inactivePatients.length) {
      alert("No inactive patient records to export!");
      return;
    }

    const headers = [
      "#", "Patient Name", "Phone", "Age", "Gender", "City", "Pincode",
      "Blood Group", "Doctor", "Last Visit Date", "Last Slot Time",
      "Payment Status", "Payment Mode", "Total Fee", "Paid Amount",
      "Balance", "Reason", "Referred By Customer", "Referred By Doctor",
      "Deactivated Since"
    ];

    const rows = inactivePatients.map((p, idx) => {
      const b = getMatchingBooking(p);
      const paidAmount = Number(b?.amountPaid) || 0;
      const totalFee = getBookingFinalPayable(b);
      const balance = Math.max(0, totalFee - paidAmount);

      return [
        idx + 1,
        `"${p.title || ""} ${(p.name || "").replace(/"/g, '""')}"`,
        `"${p.phone || ""}"`,
        `"${p.age || ""}"`,
        `"${p.gender || ""}"`,
        `"${(p.city || "").replace(/"/g, '""')}"`,
        `"${p.pincode || ""}"`,
        `"${p.bloodGroup || ""}"`,
        `"${(b?.doctorName || "").replace(/"/g, '""')}"`,
        `"${formatDateToDDMMYYYY(b?.appointmentDate || b?.date)}"`,
        `"${b?.startTime && b?.endTime ? `${b.startTime} - ${b.endTime}` : ""}"`,
        `"${p.paymentStatus || "Pending"}"`,
        `"${b?.paymentType || "cash"}"`,
        totalFee,
        paidAmount,
        balance,
        `"${(b?.purpose || "").replace(/"/g, '""')}"`,
        `"${(b?.referredByCustomer || "").replace(/"/g, '""')}"`,
        `"${(b?.referredByDoctor || "").replace(/"/g, '""')}"`,
        `"${formatDateTimeToDDMMYYYY(p.createdAt)}"`
      ].join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Inactive_Patients_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`✅ Exported ${inactivePatients.length} inactive patients to CSV!`);
  };

  const handleToggleActiveStatus = async (patient) => {
    const matchingBooking = getMatchingBooking(patient);
    if (!matchingBooking) {
      showToast("No booking found for this patient", "error");
      return;
    }
    setTogglingStatus(patient._id);
    try {
      const res = await axios.put(
        `${API_BASE_URL}/appointment-slots/toggle-active/${matchingBooking._id}`,
        { isActive: true }
      );
      if (res?.data?.success) {
        showToast(`✅ Patient ${patient.name} activated!`, "success");

        setShowPatientModal(false);
        setPatientBookings([]);
        setSelectedPatient(null);

        setTimeout(() => {
          navigate("/op-management");
        }, 800);
      } else {
        showToast(res.data.message || "Failed to update status", "error");
      }
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to update status", "error");
    } finally {
      setTogglingStatus(null);
    }
  };

  const handleView = (patient) => {
    const list = bookings.filter(
      (b) => b.patientPhone === patient.phone ||
        (b.patientName && patient.name && b.patientName.toLowerCase() === patient.name.toLowerCase())
    );
    list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    setPatientBookings(list);
    setSelectedPatient(patient);
    setShowPatientModal(true);
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

        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between gap-3 flex-wrap mb-6">
          <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap">
            Inactive Patients <span className="text-gray-500 text-sm">({inactivePatients.length})</span>
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative min-w-[180px]">
              <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input
                type="text"
                placeholder="Search inactive patients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="h-8 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg"
            >
              <option value="All">All Payment</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Pending">Pending</option>
              <option value="Due">Due</option>
            </select>
            <select
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="h-8 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg max-w-[140px] truncate"
            >
              <option value="All">All Doctors</option>
              {uniqueDoctors.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="h-8 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg"
            >
              <option value="All">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-[110px] h-8 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg"
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-[110px] h-8 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg"
            />
            <button
              onClick={fetchBookings}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
            >
              <FiRefreshCw className="w-3 h-3" /> Refresh
            </button>
            <button
              onClick={downloadCSV}
              disabled={!inactivePatients.length}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 shadow-sm disabled:opacity-50"
            >
              <FiDownload className="w-3 h-3" /> Export CSV
            </button>
            <button
              onClick={() => navigate("/op-management")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm"
            >
              <FiUsers className="w-3 h-3" /> Active Patients
            </button>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
              >
                <FiTrash2 className="w-3 h-3 text-red-500" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden flex flex-col gap-2 mb-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h1 className="text-base font-bold whitespace-nowrap">
              Inactive <span className="text-indigo-600">Patients</span>
            </h1>
            <div className="emp-dash__date-pill text-[10px] px-2 py-1">
              <FaUserInjured className="w-3 h-3 text-gray-600" />
              <span>{inactivePatients.length} Inactive</span>
            </div>
          </div>

          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input
              type="text"
              placeholder="Search inactive patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={fetchBookings}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FiRefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
            <button
              onClick={downloadCSV}
              disabled={!inactivePatients.length}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <FiDownload className="w-3.5 h-3.5" /> Export
            </button>
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg"
            >
              <FiFilter className="w-3.5 h-3.5" /> Filters
            </button>
            <button
              onClick={() => navigate("/op-management")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm ml-auto"
            >
              <FiUsers className="w-3.5 h-3.5" /> Active
            </button>
          </div>
        </div>

        {/* Mobile Filters Panel */}
        <div className="lg:hidden">
          {showMobileFilters && (
            <div className="mb-4 p-4 bg-white rounded-xl border border-gray-200 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Payment Status</label>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg"
                >
                  <option value="All">All</option>
                  <option value="Paid">Paid</option>
                  <option value="Partial">Partial</option>
                  <option value="Pending">Pending</option>
                  <option value="Due">Due</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Doctor</label>
                <select
                  value={doctorFilter}
                  onChange={(e) => setDoctorFilter(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg"
                >
                  <option value="All">All Doctors</option>
                  {uniqueDoctors.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Gender</label>
                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg"
                >
                  <option value="All">All</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg"
                >
                  <FiTrash2 className="w-4 h-4 text-red-500" /> Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* ✅ Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4 mb-6">
          <div
            className={`emp-dash__stat cursor-pointer hover:scale-105 transition-all ${activeCardFilter === "all" ? "ring-2 ring-gray-500/20 border-gray-400" : ""}`}
            onClick={() => handleCardClick("all")}
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Inactive</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                <FiUserX />
              </div>
            </div>
            <div className="emp-dash__stat-value text-gray-700">{stats.total}</div>
            <div className="emp-dash__stat-meta">deactivated patients</div>
          </div>

          <div
            className={`emp-dash__stat cursor-pointer hover:scale-105 transition-all ${activeCardFilter === "Paid" ? "ring-2 ring-emerald-500/20 border-emerald-400" : ""}`}
            onClick={() => handleCardClick("Paid")}
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Paid</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <FaCheckCircle />
              </div>
            </div>
            <div className="emp-dash__stat-value text-emerald-600">{stats.paid}</div>
            <div className="emp-dash__stat-meta">completed payments</div>
          </div>

          <div
            className={`emp-dash__stat cursor-pointer hover:scale-105 transition-all ${activeCardFilter === "Partial" ? "ring-2 ring-amber-500/20 border-amber-400" : ""}`}
            onClick={() => handleCardClick("Partial")}
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Partial</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FaUserClock />
              </div>
            </div>
            <div className="emp-dash__stat-value text-amber-600">{stats.partial}</div>
            <div className="emp-dash__stat-meta">partially paid</div>
          </div>

          <div
            className={`emp-dash__stat cursor-pointer hover:scale-105 transition-all ${activeCardFilter === "Pending" ? "ring-2 ring-gray-500/20 border-gray-400" : ""}`}
            onClick={() => handleCardClick("Pending")}
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Pending</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                <FiClock />
              </div>
            </div>
            <div className="emp-dash__stat-value text-gray-600">{stats.pending}</div>
            <div className="emp-dash__stat-meta">awaiting payment</div>
          </div>

          <div
            className={`emp-dash__stat cursor-pointer hover:scale-105 transition-all ${activeCardFilter === "Due" ? "ring-2 ring-red-500/20 border-red-400" : ""}`}
            onClick={() => handleCardClick("Due")}
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Due</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                <FiXCircle />
              </div>
            </div>
            <div className="emp-dash__stat-value text-red-500">{stats.due}</div>
            <div className="emp-dash__stat-meta">overdue</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Value</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <FaRupeeSign />
              </div>
            </div>
            <div className="emp-dash__stat-value text-blue-700">
              ₹{stats.totalRevenue.toLocaleString()}
            </div>
            <div className="emp-dash__stat-meta">total inactive value</div>
          </div>
        </div>

       

        <div className="emp-dash__card">
          {loading ? (
            <div className="py-12 text-center">
              <FiRefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-500">Loading inactive patients...</p>
            </div>
          ) : inactivePatients.length === 0 ? (
            <div className="py-12 text-center">
              <FaUserInjured className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-700">No Inactive Patients</h3>
              <p className="text-xs text-gray-500 mt-1">
                {hasActiveFilters
                  ? "No records match your filters."
                  : "Currently koi inactive patient nahi hai."}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="emp-dash__table">
                  <thead>
                    <tr>
                      <th style={{ width: "35px", textAlign: "center" }}>#</th>
                      <th>Patient</th>
                      <th>Phone</th>
                      <th>City</th>
                      <th style={{ textAlign: "center" }}>Last Visit</th>
                      <th style={{ textAlign: "center" }}>Doctor</th>
                      <th style={{ textAlign: "center" }}>Payment</th>
                      <th style={{ textAlign: "center" }}>Deactivated Since</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inactivePatients.map((patient, idx) => {
                      const booking = getMatchingBooking(patient);
                      const isToggling = togglingStatus === patient._id;
                      const paymentStatus = patient.paymentStatus || "Pending";
                      return (
                        <tr key={patient._id} className="hover:bg-gray-50/60">
                          <td className="px-2 py-3 text-center text-slate-500 text-[11px]">{idx + 1}</td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 text-white font-bold flex items-center justify-center text-[10px]">
                                {patient.name ? patient.name.charAt(0).toUpperCase() : "P"}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-800 text-xs truncate max-w-[120px]">
                                  {patient.title} {patient.name || "N/A"}
                                </div>
                                <div className="text-[9px] text-gray-400">
                                  {patient.age || "N/A"} yrs • {patient.gender || "N/A"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-xs">{patient.phone || "N/A"}</td>
                          <td className="px-3 py-3 whitespace-nowrap text-xs">
                            {patient.city || "N/A"} {patient.pincode ? `- ${patient.pincode}` : ""}
                          </td>
                          <td className="px-3 py-3 text-center whitespace-nowrap text-xs">
                            <div className="font-semibold text-slate-700">
                              {formatDateToDDMMYYYY(booking?.appointmentDate || booking?.date)}
                            </div>
                            {booking?.startTime && booking?.endTime && (
                              <div className="text-[10px] text-blue-700 font-semibold mt-0.5">
                                {booking.startTime} - {booking.endTime}
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <div className="text-xs font-semibold text-purple-800">
                              {booking?.doctorName || "N/A"}
                            </div>
                          </td>
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${paymentStatus === "Paid"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : paymentStatus === "Partial"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : paymentStatus === "Due"
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : "bg-gray-50 text-gray-700 border-gray-200"
                              }`}>
                              {paymentStatus}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center whitespace-nowrap text-[10px] text-gray-500">
                            {formatDateTimeToDDMMYYYY(patient.createdAt)}
                          </td>
                          <td className="px-3 py-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleView(patient); }}
                                className="p-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg"
                                title="View Details"
                              >
                                <FiEye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleToggleActiveStatus(patient); }}
                                disabled={isToggling}
                                className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-full uppercase border-2 bg-emerald-50 text-emerald-700 border-emerald-400 hover:bg-emerald-100 transition-all disabled:opacity-50"
                                title="Click to activate"
                              >
                                {isToggling ? (
                                  <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <FaToggleOn className="w-4 h-4 text-emerald-600" />
                                )}
                                <span className="text-[10px]">Activate</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden p-3 space-y-3 bg-gray-50/50">
                {inactivePatients.map((patient) => {
                  const booking = getMatchingBooking(patient);
                  const isToggling = togglingStatus === patient._id;
                  const paymentStatus = patient.paymentStatus || "Pending";

                  return (
                    <div key={patient._id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      <div className="flex items-center justify-between gap-2 p-3 border-b border-gray-100 bg-gradient-to-r from-gray-50/80 to-slate-50/80">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                            {patient.name ? patient.name.charAt(0).toUpperCase() : "P"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-slate-800 text-sm truncate">
                              {patient.title} {patient.name || "N/A"}
                            </div>
                            <div className="text-[10px] text-gray-500 flex items-center gap-1">
                              <FaPhoneAlt className="text-[8px]" /> {patient.phone || "N/A"}
                            </div>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full uppercase border bg-gray-100 text-gray-700 border-gray-300 flex-shrink-0">
                          <FiClock className="w-2.5 h-2.5" /> Inactive
                        </span>
                      </div>

                      <div className="p-3 space-y-2.5">
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <div className="text-[9px] font-bold uppercase text-gray-400">Age / Gender</div>
                            <div className="font-semibold text-slate-700">
                              {patient.age || "N/A"} yrs • {patient.gender || "N/A"}
                            </div>
                          </div>
                          <div>
                            <div className="text-[9px] font-bold uppercase text-gray-400">City</div>
                            <div className="font-semibold text-slate-700 truncate">
                              {patient.city || "N/A"} {patient.pincode ? `- ${patient.pincode}` : ""}
                            </div>
                          </div>
                          <div>
                            <div className="text-[9px] font-bold uppercase text-gray-400">Last Visit</div>
                            <div className="font-semibold text-slate-700">
                              {formatDateToDDMMYYYY(booking?.appointmentDate || booking?.date)}
                            </div>
                            {booking?.startTime && booking?.endTime && (
                              <div className="text-[10px] text-blue-700 font-semibold">
                                {booking.startTime} - {booking.endTime}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-[9px] font-bold uppercase text-gray-400">Doctor</div>
                            <div className="font-semibold text-purple-800 truncate">
                              {booking?.doctorName || "N/A"}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${paymentStatus === "Paid"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : paymentStatus === "Partial"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : paymentStatus === "Due"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-gray-50 text-gray-700 border-gray-200"
                            }`}>
                            {paymentStatus}
                          </span>
                          <div className="text-[10px] text-gray-500">
                            {formatDateTimeToDDMMYYYY(patient.createdAt)}
                          </div>
                        </div>

                        <div className="flex items-center justify-center gap-1.5 pt-2 border-t border-gray-100 flex-wrap">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleView(patient); }}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-[10px] font-bold"
                          >
                            <FiEye className="w-3.5 h-3.5" /> View
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleToggleActiveStatus(patient); }}
                            disabled={isToggling}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-[10px] font-bold border-2 border-emerald-400 disabled:opacity-50"
                          >
                            {isToggling ? (
                              <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <FaToggleOn className="w-4 h-4 text-emerald-600" />
                            )}
                            <span>Activate</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Patient Modal */}
        {showPatientModal && selectedPatient && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border">
              <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-600 text-white flex items-center justify-center">
                    <FaUserInjured />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Patient Details (Inactive)</h3>
                    <p className="text-xs text-gray-500">
                      {selectedPatient.title} {selectedPatient.name} • {selectedPatient.phone}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowPatientModal(false); setPatientBookings([]); setSelectedPatient(null); }}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-5 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-300">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 text-white font-bold flex items-center justify-center text-2xl">
                      {selectedPatient.name ? selectedPatient.name.charAt(0).toUpperCase() : "P"}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900 text-lg">
                        {selectedPatient.title} {selectedPatient.name}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-1 mt-0.5">
                        <FaPhoneAlt className="text-[10px]" /> {selectedPatient.phone}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-3 py-1 rounded-full uppercase border bg-gray-100 text-gray-700 border-gray-300">
                      Inactive
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div>
                      <div className="text-[10px] font-bold uppercase text-gray-400 flex items-center gap-1">
                        <FaBirthdayCake className="text-[10px]" /> Age
                      </div>
                      <div className="font-semibold mt-0.5">{selectedPatient.age || "N/A"} Yrs</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-gray-400 flex items-center gap-1">
                        <FaVenusMars className="text-[10px]" /> Gender
                      </div>
                      <div className="font-semibold mt-0.5">{selectedPatient.gender || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-gray-400 flex items-center gap-1">
                        <FaCalendarAlt className="text-[10px]" /> DOB
                      </div>
                      <div className="font-semibold mt-0.5">{formatDateToDDMMYYYY(selectedPatient.dob)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-gray-400 flex items-center gap-1">
                        <FaTint className="text-[10px]" /> Blood Group
                      </div>
                      <div className="font-semibold mt-0.5">{selectedPatient.bloodGroup || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-gray-400 flex items-center gap-1">
                        <FaMapMarkerAlt className="text-[10px]" /> City
                      </div>
                      <div className="font-semibold mt-0.5">{selectedPatient.city || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-gray-400 flex items-center gap-1">
                        <FaMapMarkerAlt className="text-[10px]" /> Pincode
                      </div>
                      <div className="font-semibold mt-0.5">{selectedPatient.pincode || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-gray-400 flex items-center gap-1">
                        <FaEnvelope className="text-[10px]" /> Email
                      </div>
                      <div className="font-semibold mt-0.5 truncate">{selectedPatient.email || "N/A"}</div>
                    </div>
                    <div className="col-span-2 md:col-span-4">
                      <div className="text-[10px] font-bold uppercase text-gray-400 flex items-center gap-1">
                        <FaMapMarkerAlt className="text-[10px]" /> Address
                      </div>
                      <div className="font-semibold mt-0.5">{selectedPatient.address || "N/A"}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FaCalendarAlt className="text-gray-600" />
                    <h4 className="font-bold text-gray-900 text-sm">
                      Appointment History ({patientBookings.length})
                    </h4>
                  </div>
                  {patientBookings.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm bg-gray-50 rounded-xl border">
                      No appointments found.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {patientBookings.map((booking, bIdx) => {
                        const items = getBookingServices(booking);
                        return (
                          <div key={booking._id} className="bg-white border rounded-xl overflow-hidden shadow-sm">
                            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-2.5 flex-wrap">
                                <span className="font-bold text-gray-500 text-xs">#{bIdx + 1}</span>
                                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border bg-blue-50 text-blue-700 border-blue-200">
                                  {booking.status || "N/A"}
                                </span>
                                <span className="text-xs text-gray-600">
                                  {formatDateToDDMMYYYY(booking.appointmentDate || booking.date)}
                                </span>
                                {booking.startTime && booking.endTime && (
                                  <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200">
                                    {booking.startTime} - {booking.endTime}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-gray-500">
                                Booked: {formatDateTimeToDDMMYYYY(booking.bookedAt || booking.createdAt)}
                              </span>
                            </div>
                            <div className="p-4 space-y-3">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                <div>
                                  <div className="text-[10px] font-bold uppercase text-gray-400">Doctor</div>
                                  <div className="font-bold">{booking.doctorName || "N/A"}</div>
                                </div>
                                <div>
                                  <div className="text-[10px] font-bold uppercase text-gray-400">Purpose</div>
                                  <div className="font-bold">{booking.purpose || "N/A"}</div>
                                </div>
                                <div>
                                  <div className="text-[10px] font-bold uppercase text-gray-400">Payment Mode</div>
                                  <div className="font-bold capitalize">{booking.paymentType || "cash"}</div>
                                </div>
                                <div>
                                  <div className="text-[10px] font-bold uppercase text-gray-400">Payment Status</div>
                                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${booking.paymentStatus === "Paid" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : booking.paymentStatus === "Partial" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                                    {booking.paymentStatus || "N/A"}
                                  </span>
                                </div>
                              </div>

                              {items.length > 0 && (
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

                              {(booking.clinicalNotes || booking.diagnosis || booking.prescription) && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                                  {booking.clinicalNotes && (
                                    <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                                      <div className="text-[10px] font-bold uppercase text-blue-700 flex items-center gap-1">
                                        <FaStickyNote className="text-[9px]" /> Clinical Notes
                                      </div>
                                      <div className="mt-1 text-gray-700">{booking.clinicalNotes}</div>
                                    </div>
                                  )}
                                  {booking.diagnosis && (
                                    <div className="p-2 bg-purple-50 rounded-lg border border-purple-200">
                                      <div className="text-[10px] font-bold uppercase text-purple-700 flex items-center gap-1">
                                        <FaCommentMedical className="text-[9px]" /> Diagnosis
                                      </div>
                                      <div className="mt-1 text-gray-700">{booking.diagnosis}</div>
                                    </div>
                                  )}
                                  {booking.prescription && (
                                    <div className="p-2 bg-teal-50 rounded-lg border border-teal-200">
                                      <div className="text-[10px] font-bold uppercase text-teal-700 flex items-center gap-1">
                                        <FaPrescription className="text-[9px]" /> Prescription
                                      </div>
                                      <div className="mt-1 text-gray-700">{booking.prescription}</div>
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
              </div>

              <div className="flex justify-end px-6 py-4 border-t bg-gray-50/50 sticky bottom-0 gap-2">
                <button
                  onClick={() => { setShowPatientModal(false); setPatientBookings([]); setSelectedPatient(null); }}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-200 hover:bg-gray-300"
                >
                  Close
                </button>
                <button
                  onClick={() => handleToggleActiveStatus(selectedPatient)}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
                >
                  <FaToggleOn className="w-4 h-4" /> Activate Patient
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}