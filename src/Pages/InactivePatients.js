// InactivePatients.js — Inactive OPD Patients History
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
  FaUserCheck, FaUserClock, FaClinicMedical, FaFlask
} from "react-icons/fa";
import {
  FiRefreshCw, FiUsers, FiClock, FiEye, FiXCircle, FiCheckCircle, FiTrash2
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

const getBookingServices = (booking) => {
  if (!booking) return [];
  const arr = (Array.isArray(booking.serviceItems) && booking.serviceItems.length > 0 && booking.serviceItems) ||
    (Array.isArray(booking.services) && booking.services.length > 0 && booking.services) || [];
  return arr.map((s) => ({
    name: s.name || "Service",
    price: Number(s.price) || 0,
  }));
};

export default function InactivePatients() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);
  const [togglingStatus, setTogglingStatus] = useState(null);

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
          finalPayable: Number(b.finalPayable) || Number(b.totalAmount) || 0,
          amountPaid: Number(b.amountPaid) || 0,
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
        });
      }
    });
    return Array.from(map.values());
  }, [bookings]);

  const inactivePatients = useMemo(() => {
    return patients.filter((p) => !p.isActive).filter((p) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (p.name || "").toLowerCase().includes(q) ||
        (p.phone || "").toLowerCase().includes(q) ||
        (p.city || "").toLowerCase().includes(q) ||
        (p.pincode || "").toLowerCase().includes(q);
    });
  }, [patients, searchQuery]);

  const getMatchingBooking = (patient) =>
    bookings.find((b) =>
      b.patientPhone === patient.phone ||
      (b.patientName && patient.name && b.patientName.toLowerCase() === patient.name.toLowerCase())
    );

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
        showToast(`Patient ${patient.name} marked as Active!`, "success");

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

        <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
          <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap">
            Inactive Patients <span className="text-gray-500 text-sm">({inactivePatients.length})</span>
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative min-w-[200px]">
              <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input
                type="text"
                placeholder="Search inactive patients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <button onClick={fetchBookings} className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm">
              <FiRefreshCw className="w-3 h-3" /> Refresh
            </button>
            {/* ✅ Active Patients button */}
            <button
              onClick={() => navigate("/op-management")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm"
            >
              <FiUsers className="w-3 h-3" /> Active Patients
            </button>
          </div>
        </div>

        <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <FiClock className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-amber-900">Inactive Patients History</p>
            <p className="text-[11px] text-amber-800 mt-0.5">
              Ye sirf wo patients hain jinko deactivate kiya gaya hai. Inko dobara active karne ke liye "Activate" button dabao — wo wapas OP Management me aa jayenge.
            </p>
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
                {searchQuery ? "No records match your search." : "Currently koi inactive patient nahi hai."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="emp-dash__table">
                <thead>
                  <tr>
                    <th style={{ width: "35px", textAlign: "center" }}>#</th>
                    <th>Patient</th>
                    <th>Phone</th>
                    <th>City</th>
                    <th style={{ textAlign: "center" }}>Last Visit</th>
                    <th style={{ textAlign: "center" }}>Doctor</th>
                    <th style={{ textAlign: "center" }}>Deactivated Since</th>
                    <th style={{ textAlign: "center" }}>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inactivePatients.map((patient, idx) => {
                    const booking = getMatchingBooking(patient);
                    const isToggling = togglingStatus === patient._id;
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
                        <td className="px-3 py-3 text-center whitespace-nowrap text-[10px] text-gray-500">
                          {formatDateTimeToDDMMYYYY(patient.createdAt)}
                        </td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border bg-gray-100 text-gray-700 border-gray-300">
                            <FiClock className="w-2.5 h-2.5" /> Inactive
                          </span>
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
                                <FaToggleOff className="w-4 h-4 text-gray-500" />
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
          )}
        </div>

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