import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import {
  Clock,
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
  Mail,
  ArrowRight,
  MessageCircle,
  CalendarDays,
  Home,
  UserRound,
  Smartphone,
  CheckCircle2
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
  const strH = String(h).padStart(2, "0");
  const strM = String(m).padStart(2, "0");
  return `${strH}:${strM} ${ampm}`;
};

const minutesTo24Hour = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const Appointment = () => {
  const todayStr = new Date().toISOString().split("T")[0];

  // Form state
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientGender, setPatientGender] = useState("Male");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [patientAddress, setPatientAddress] = useState("");
  const [purpose, setPurpose] = useState("");
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Slots state
  const [allSlots, setAllSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Confirmation modal
  const [bookingConfirmation, setBookingConfirmation] = useState(null);

  // Toast
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

  useEffect(() => {
    fetchSlotsForDay(dayOfWeekName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, dayOfWeekName]);

  const fetchSlotsForDay = async (dayName) => {
    setLoadingSlots(true);
    setSelectedSlot(null);

    try {
      const res = await axios.get(`${API_BASE_URL}/appointment-slots?dayOfWeek=${dayName}`).catch(() => null);

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

    // Morning: 09:00 AM – 02:00 PM
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

    // Break: 02:00 PM – 03:00 PM (non-Sunday only)
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

      // Evening: 03:00 PM – 09:00 PM
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

  const isToday = useMemo(() => selectedDate === todayStr, [selectedDate, todayStr]);

  const getSlotStartMinutes = (slot) => {
    if (slot.startTime24) {
      const parts = slot.startTime24.trim().split(":");
      const h = parseInt(parts[0], 10) || 0;
      const m = parseInt(parts[1], 10) || 0;
      return h * 60 + m;
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
    const currentMinutesToday = now.getHours() * 60 + now.getMinutes();
    return getSlotStartMinutes(slot) <= currentMinutesToday;
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

  const handleSubmitBooking = async (e) => {
    e.preventDefault();

    if (!patientName.trim()) return showToast("Please enter the patient's full name.", "error");
    if (!patientAge || parseInt(patientAge) <= 0) return showToast("Please enter a valid age.", "error");
    if (!patientPhone.trim() || patientPhone.length < 10) return showToast("Please enter a valid 10-digit phone number.", "error");
    if (!patientAddress.trim()) return showToast("Please enter the patient's address.", "error");
    if (!purpose.trim()) return showToast("Please enter the purpose of the appointment.", "error");
    if (!selectedSlot) return showToast("Please select an available appointment slot.", "error");

    setIsSubmitting(true);

    const bookingPayload = {
      _id: selectedSlot._id,
      slotId: selectedSlot.slotId,
      dayOfWeek: dayOfWeekName,
      date: selectedDate,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      patientName: patientName.trim(),
      patientAge: patientAge.toString(),
      patientGender: patientGender,
      patientPhone: patientPhone.trim(),
      patientEmail: patientEmail.trim(),
      patientAddress: patientAddress.trim(),
      purpose: purpose.trim(),
      consultationFee: selectedSlot.consultationFee !== undefined ? selectedSlot.consultationFee : 300,
      paymentStatus: "Pending"
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
          prev.map((s) => (s._id === selectedSlot._id ? { ...s, status: "booked", ...bookingPayload } : s))
        );
      }

      setBookingConfirmation({
        appointmentId: `APP-${Date.now().toString().slice(-6)}`,
        patientName: patientName.trim(),
        patientAge,
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
        consultationFee: selectedSlot.consultationFee !== undefined ? selectedSlot.consultationFee : 300,
        paymentStatus: "Pending"
      });

      showToast(`Appointment confirmed for ${patientName}.`, "success");

      setPatientName("");
      setPatientAge("");
      setPatientPhone("");
      setPatientEmail("");
      setPatientAddress("");
      setPurpose("");
      setSelectedSlot(null);
    } catch (error) {
      console.error("Booking error:", error);
      showToast("We couldn't complete the booking. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <TimelyNavbar />
      <div className="min-h-screen bg-[#F7F8F7] text-[#1A2421] font-sans pt-20">
        {/* Toast */}
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

        {/* Page header */}
        <div className="max-w-6xl mx-auto px-4 md:px-6 pt-12 pb-6">
          <p className="text-xs font-semibold tracking-widest text-[#0F5C4D] uppercase mb-2">Book an appointment</p>
          <h1 className="text-3xl md:text-[2.25rem] font-semibold text-[#1A2421] tracking-tight">
            Schedule your consultation
          </h1>
          <p className="mt-3 text-sm text-[#5B6B65] max-w-2xl leading-relaxed">
            Enter patient details, choose a date, and select an available slot to complete your OPD booking.
          </p>
        </div>

        {/* Main container */}
        <div className="max-w-6xl mx-auto px-4 md:px-6 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* LEFT: Patient form */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-xl border border-[#E4E7E4] overflow-hidden">
                <div className="px-6 py-5 border-b border-[#E4E7E4]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#EDF4F2] rounded-lg">
                      <UserPlus className="w-4 h-4 text-[#0F5C4D]" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-[#1A2421]">Patient details</h2>
                      <p className="text-xs text-[#8A948F]">Step 1 of 2</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <form onSubmit={handleSubmitBooking} className="space-y-4">
                    {/* Full name */}
                    <div>
                      <label className="block text-xs font-medium text-[#3F4A45] mb-1.5">
                        Full name <span className="text-[#B3261E]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Patient's full name"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#D7DCD9] rounded-lg focus:ring-2 focus:ring-[#0F5C4D]/20 focus:border-[#0F5C4D] transition-colors text-sm text-[#1A2421] outline-none"
                      />
                    </div>

                    {/* Age / Gender */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-[#3F4A45] mb-1.5">
                          Age <span className="text-[#B3261E]">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          max="120"
                          placeholder="28"
                          value={patientAge}
                          onChange={(e) => setPatientAge(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-[#D7DCD9] rounded-lg focus:ring-2 focus:ring-[#0F5C4D]/20 focus:border-[#0F5C4D] transition-colors text-sm text-[#1A2421] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#3F4A45] mb-1.5">
                          Gender <span className="text-[#B3261E]">*</span>
                        </label>
                        <select
                          value={patientGender}
                          onChange={(e) => setPatientGender(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-[#D7DCD9] rounded-lg focus:ring-2 focus:ring-[#0F5C4D]/20 focus:border-[#0F5C4D] transition-colors text-sm text-[#1A2421] outline-none"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Others">Others</option>
                        </select>
                      </div>
                    </div>

                    {/* Phone / Email */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-[#3F4A45] mb-1.5 flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5 text-[#8A948F]" />
                          Phone <span className="text-[#B3261E]">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="9876543210"
                          value={patientPhone}
                          onChange={(e) => setPatientPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                          className="w-full px-3.5 py-2.5 bg-white border border-[#D7DCD9] rounded-lg focus:ring-2 focus:ring-[#0F5C4D]/20 focus:border-[#0F5C4D] transition-colors text-sm text-[#1A2421] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#3F4A45] mb-1.5 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-[#8A948F]" />
                          Email
                        </label>
                        <input
                          type="email"
                          placeholder="patient@email.com"
                          value={patientEmail}
                          onChange={(e) => setPatientEmail(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-[#D7DCD9] rounded-lg focus:ring-2 focus:ring-[#0F5C4D]/20 focus:border-[#0F5C4D] transition-colors text-sm text-[#1A2421] outline-none"
                        />
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-xs font-medium text-[#3F4A45] mb-1.5 flex items-center gap-1.5">
                        <Home className="w-3.5 h-3.5 text-[#8A948F]" />
                        Address <span className="text-[#B3261E]">*</span>
                      </label>
                      <textarea
                        required
                        rows={2}
                        placeholder="Residential address"
                        value={patientAddress}
                        onChange={(e) => setPatientAddress(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#D7DCD9] rounded-lg focus:ring-2 focus:ring-[#0F5C4D]/20 focus:border-[#0F5C4D] transition-colors text-sm text-[#1A2421] resize-none outline-none"
                      />
                    </div>

                    {/* Purpose */}
                    <div>
                      <label className="block text-xs font-medium text-[#3F4A45] mb-1.5 flex items-center gap-1.5">
                        <Stethoscope className="w-3.5 h-3.5 text-[#8A948F]" />
                        Purpose of visit <span className="text-[#B3261E]">*</span>
                      </label>
                      <textarea
                        required
                        rows={2}
                        placeholder="e.g. General checkup, fever, follow-up consultation"
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#D7DCD9] rounded-lg focus:ring-2 focus:ring-[#0F5C4D]/20 focus:border-[#0F5C4D] transition-colors text-sm text-[#1A2421] resize-none outline-none"
                      />
                    </div>

                    {/* Date */}
                    <div className="pt-1">
                      <label className="block text-xs font-medium text-[#3F4A45] mb-1.5 flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5 text-[#8A948F]" />
                        Appointment date <span className="text-[#B3261E]">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        min={todayStr}
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#D7DCD9] rounded-lg text-sm font-medium text-[#1A2421] focus:ring-2 focus:ring-[#0F5C4D]/20 focus:border-[#0F5C4D] transition-colors outline-none"
                      />
                      <p className="mt-2 text-xs text-[#5B6B65]">
                        Day selected: <span className="font-semibold text-[#1A2421]">{dayOfWeekName}</span>
                      </p>
                    </div>

                    {/* Selected slot summary */}
                    {selectedSlot ? (
                      <div className="border-l-2 border-[#0F5C4D] bg-[#EDF4F2] rounded-r-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-[10px] uppercase tracking-wide font-semibold text-[#0F5C4D]">Selected slot</div>
                            <div className="text-base font-semibold text-[#1A2421]">
                              {selectedSlot.startTime} – {selectedSlot.endTime}
                            </div>
                            <div className="text-xs text-[#5B6B65] mt-0.5">{selectedSlot.shift}</div>
                          </div>
                          <Check className="w-5 h-5 text-[#0F5C4D] shrink-0" />
                        </div>
                        <div className="pt-2 border-t border-[#0F5C4D]/15 flex items-center justify-between text-xs">
                          <span className="font-medium text-[#3F4A45]">
                            Fee: ₹{selectedSlot.consultationFee !== undefined ? selectedSlot.consultationFee : 300}
                          </span>
                          <span className="bg-[#FDF3DA] text-[#92600B] px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase">
                            Pending
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[#FDF3DA] border border-[#F0DFA8] p-3.5 rounded-lg text-xs text-[#7A5300] flex items-center gap-2.5">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>Select an available appointment slot from the panel on the right.</span>
                      </div>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={isSubmitting || !selectedSlot}
                      className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-colors ${
                        selectedSlot && !isSubmitting
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
                          Confirm booking
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* RIGHT: Slot selection */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-xl border border-[#E4E7E4] p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E4E7E4] pb-4 mb-6">
                  <div>
                    <p className="text-xs font-semibold tracking-widest text-[#0F5C4D] uppercase mb-1">Step 2 of 2</p>
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

                {loadingSlots ? (
                  <div className="py-16 text-center">
                    <RefreshCw className="w-6 h-6 text-[#0F5C4D] animate-spin mx-auto mb-3" />
                    <p className="text-sm font-medium text-[#5B6B65]">Loading slots for {dayOfWeekName}…</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Morning */}
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

                    {/* Break */}
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

                    {/* Evening */}
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
            </div>
          </div>
        </div>

        {/* Booking confirmation modal */}
        {bookingConfirmation && (
          <div className="fixed inset-0 bg-[#1A2421]/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-lg w-full p-6 md:p-8 border border-[#E4E7E4]">
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
                  className="text-[#8A948F] hover:text-[#1A2421] p-1.5 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="my-6 bg-[#F7F8F7] p-5 rounded-lg border border-[#E4E7E4] space-y-3.5">
                <div className="flex items-center justify-between pb-3 border-b border-[#E4E7E4]">
                  <div>
                    <div className="text-[10px] font-semibold uppercase text-[#8A948F]">Patient</div>
                    <div className="text-sm font-semibold text-[#1A2421]">{bookingConfirmation.patientName}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-semibold uppercase text-[#8A948F]">Age / Gender</div>
                    <div className="text-sm font-medium text-[#3F4A45]">
                      {bookingConfirmation.patientAge} yrs ({bookingConfirmation.patientGender})
                    </div>
                  </div>
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
                  <div className="text-[10px] font-semibold uppercase text-[#8A948F]">Purpose</div>
                  <div className="text-xs text-[#3F4A45]">{bookingConfirmation.purpose}</div>
                </div>

                <div>
                  <div className="text-[10px] font-semibold uppercase text-[#8A948F]">Address</div>
                  <div className="text-xs text-[#3F4A45]">{bookingConfirmation.patientAddress}</div>
                </div>

                <div className="pt-3 border-t border-[#E4E7E4] flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-semibold uppercase text-[#8A948F]">Consultation fee</div>
                    <div className="text-base font-semibold text-[#1A2421]">
                      ₹{bookingConfirmation.consultationFee !== undefined ? bookingConfirmation.consultationFee : 300}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-semibold uppercase text-[#8A948F]">Payment</div>
                    <span className="inline-block bg-[#FDF3DA] text-[#92600B] text-[10px] font-semibold px-2.5 py-1 rounded uppercase">
                      {bookingConfirmation.paymentStatus || "Pending"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#F7F8F7] hover:bg-[#E4E7E4] text-[#3F4A45] flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
                <button
                  onClick={() => setBookingConfirmation(null)}
                  className="px-5 py-2 rounded-lg text-xs font-semibold bg-[#0F5C4D] text-white hover:bg-[#0C4A3E] transition-colors"
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
            <h2 className="mb-3 text-2xl md:text-3xl font-semibold text-white">
              Need help with your booking?
            </h2>
            <p className="mb-8 text-sm text-white/80 max-w-2xl mx-auto">
              Our support team can help with appointments, available slots, or questions about consultation services.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => window.open('https://wa.me/919010481048?text=Hello! I need help with booking an appointment.', '_blank')}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#0F5C4D] rounded-lg hover:bg-[#F0F3F2] transition-colors font-semibold text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Chat with support
              </button>
              <a
                href="/membership"
                className="flex items-center gap-2 px-5 py-2.5 bg-transparent text-white border border-white/40 rounded-lg hover:bg-white/10 transition-colors font-semibold text-sm"
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
          <div className="text-xs font-medium line-through">
            {slot.startTime} – {slot.endTime}
          </div>
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
        <span className={isSelected ? "text-white/90" : "text-[#5B6B65]"}>
          ₹{slot.consultationFee !== undefined ? slot.consultationFee : 300}
        </span>
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