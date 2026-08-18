import React, { useState, useEffect, useMemo } from "react";
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
  ChevronDown
} from "lucide-react";
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

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const AppointmentSlots = () => {
  // Config States
  const [opDuration, setOpDuration] = useState(20);
  const [opGap, setOpGap] = useState(5);
  const [consultationFee, setConsultationFee] = useState(300);
  
  // UI & Data States
  const [slots, setSlots] = useState([]);
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [loading, setLoading] = useState(false);
  
  // Filters & Search
  const [shiftFilter, setShiftFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modals & Feedback
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedSlotForBook, setSelectedSlotForBook] = useState(null);
  const [patientNameInput, setPatientNameInput] = useState("");
  const [patientPhoneInput, setPatientPhoneInput] = useState("");
  
  // Doctors List
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  
  // New Custom Slot Inputs - Multiple Days
  const [newSlotDoctor, setNewSlotDoctor] = useState("");
  const [newSlotDays, setNewSlotDays] = useState([]);
  const [newSlotStartTime, setNewSlotStartTime] = useState("09:00");
  const [newSlotEndTime, setNewSlotEndTime] = useState("09:20");
  const [newSlotGap, setNewSlotGap] = useState(5);
  const [newSlotShift, setNewSlotShift] = useState("Morning Shift");
  const [newSlotConsultationFee, setNewSlotConsultationFee] = useState(300);
  const [newSlotDuration, setNewSlotDuration] = useState(20);

  // Notification Toast State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch doctors on mount
  useEffect(() => {
    fetchDoctors();
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

  // Fetch slots from backend - NO DUMMY DATA
  useEffect(() => {
    fetchSlots();
  }, []);

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

  // Toggle slot status between Available & Blocked
  const handleToggleStatus = async (slot) => {
    if (slot.type === "break") return;

    let newStatus = "available";
    if (slot.status === "available") newStatus = "blocked";
    else if (slot.status === "blocked") newStatus = "available";
    else if (slot.status === "booked") newStatus = "available";

    setSlots((prev) =>
      prev.map((s) => (s.slotId === slot.slotId ? { ...s, status: newStatus, patientName: "" } : s))
    );

    try {
      if (slot._id && !slot._id.startsWith("local_")) {
        await axios.put(`${API_BASE_URL}/appointment-slots/${slot._id}`, {
          status: newStatus
        }).catch(() => null);
      }
      showToast(`Slot status changed to '${newStatus}'`, "info");
    } catch (e) {
      console.error("Error updating slot status:", e);
      fetchSlots();
    }
  };

  // Confirm booking for a slot
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
        await axios.put(`${API_BASE_URL}/appointment-slots/${selectedSlotForBook._id}`, updated).catch(() => null);
      }
      showToast(`Booked appointment for ${patientNameInput}!`, "success");
    } catch (e) {
      console.error("Error booking slot:", e);
      fetchSlots();
    } finally {
      setShowBookModal(false);
      setPatientNameInput("");
      setPatientPhoneInput("");
    }
  };

  // Delete a specific slot
  const handleDeleteSlot = async (slotId, _id) => {
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

  // =============================================
  // TOGGLE DAY SELECTION
  // =============================================
  const toggleDaySelection = (day) => {
    setNewSlotDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day) 
        : [...prev, day]
    );
  };

  // =============================================
  // ADD CUSTOM SLOT WITH MULTIPLE DAYS
  // =============================================
  const handleAddCustomSlot = async () => {
    // Validation
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

    // Find selected doctor
    const selectedDoctor = doctors.find(d => d._id === newSlotDoctor);
    if (!selectedDoctor) {
      showToast("Selected doctor not found", "error");
      return;
    }

    // Generate slots for each selected day
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

    try {
      // Send each slot to backend
      const savedSlots = [];
      for (const slot of allNewSlots) {
        const res = await axios.post(`${API_BASE_URL}/appointment-slots`, slot).catch(() => null);
        if (res && res.data && res.data.slot) {
          savedSlots.push(res.data.slot);
        }
      }

      if (savedSlots.length > 0) {
        setSlots((prev) => [...prev, ...savedSlots]);
        showToast(`Added ${savedSlots.length} slots for ${selectedDoctor.name} on ${newSlotDays.length} day(s)!`, "success");
      } else {
        showToast("Failed to create slots. Please try again.", "error");
      }
      
      setShowAddModal(false);
      
      // Reset form
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
    }
  };

  // Filter slots for current selected day
  const currentDaySlots = useMemo(() => {
    return slots.filter((s) => s.dayOfWeek?.toLowerCase() === selectedDay.toLowerCase());
  }, [slots, selectedDay]);

  // Apply shift, status, and search filters
  const filteredSlots = useMemo(() => {
    return currentDaySlots.filter((slot) => {
      if (shiftFilter !== "All") {
        if (shiftFilter === "Morning" && !slot.shift?.toLowerCase().includes("morning")) return false;
        if (shiftFilter === "Evening" && !slot.shift?.toLowerCase().includes("evening")) return false;
        if (shiftFilter === "Break" && slot.type !== "break") return false;
      }
      if (statusFilter !== "All" && slot.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTime = (slot.startTime || "").toLowerCase().includes(query) || (slot.endTime || "").toLowerCase().includes(query);
        const matchPatient = (slot.patientName || "").toLowerCase().includes(query);
        const matchStatus = (slot.status || "").toLowerCase().includes(query);
        const matchDoctor = (slot.doctorName || "").toLowerCase().includes(query);
        if (!matchTime && !matchPatient && !matchStatus && !matchDoctor) return false;
      }
      return true;
    });
  }, [currentDaySlots, shiftFilter, statusFilter, searchQuery]);

  // Calculations for Stat Summary Cards
  const stats = useMemo(() => {
    const totalSlotsCount = slots.filter((s) => s.type !== "break").length;
    const dayTotalSlots = currentDaySlots.filter((s) => s.type !== "break").length;
    const dayAvailableSlots = currentDaySlots.filter((s) => s.status === "available" && s.type !== "break").length;
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

  // Group filtered slots by shift
  const morningShiftSlots = filteredSlots.filter((s) => s.shift?.toLowerCase().includes("morning"));
  const eveningShiftSlots = filteredSlots.filter((s) => s.shift?.toLowerCase().includes("evening"));

  return (
    <div className="emp-dash">
      <main className="p-2 sm:p-4 lg:p-6">
        {/* Toast Notification */}
        {toast && (
          <div
            className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white transition-all transform animate-bounce ${
              toast.type === "error" ? "bg-red-600" : toast.type === "info" ? "bg-cyan-600" : "bg-emerald-600"
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span className="font-medium text-sm">{toast.message}</span>
          </div>
        )}

        {/* Header */}
        <div className="emp-dash__header">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap">
              Appointment <span>Slots</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
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
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-md"
            >
              <Plus className="w-3.5 h-3.5" /> Add Slots
            </button>
            <button
              onClick={fetchSlots}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all shadow-md"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
        </div>

        {/* Stat Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total OP Slots</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div className="emp-dash__stat-value">{stats.totalSlotsCount}</div>
            <div className="emp-dash__stat-meta">across all days</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Slots ({selectedDay})</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <Clock className="w-4 h-4 text-indigo-600" />
              </div>
            </div>
            <div className="emp-dash__stat-value text-indigo-600">{stats.dayTotalSlots}</div>
            <div className="emp-dash__stat-meta">scheduled today</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Available</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <div className="emp-dash__stat-value text-emerald-600">{stats.dayAvailableSlots}</div>
            <div className="emp-dash__stat-meta">ready to book</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Booked</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                <Users className="w-4 h-4 text-amber-600" />
              </div>
            </div>
            <div className="emp-dash__stat-value text-amber-600">{stats.dayBookedSlots}</div>
            <div className="emp-dash__stat-meta">confirmed appointments</div>
          </div>

          <div className="emp-dash__stat col-span-2 lg:col-span-1">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">OP Hours ({selectedDay})</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <Clock className="w-4 h-4 text-purple-600" />
              </div>
            </div>
            <div className="emp-dash__stat-value text-purple-600">{stats.opHoursStr} Hrs</div>
            <div className="emp-dash__stat-meta">total operating time</div>
          </div>
        </div>

        {/* Day Selector Pills */}
        <div className="emp-dash__card p-2 mb-6 flex overflow-x-auto gap-1">
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = selectedDay.toLowerCase() === day.toLowerCase();
            const daySlotsCount = slots.filter(
              (s) => s.dayOfWeek?.toLowerCase() === day.toLowerCase() && s.type !== "break"
            ).length;

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`flex-1 min-w-[100px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-0.5 ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "bg-transparent text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span className="uppercase tracking-wider text-[10px] opacity-80">{day.substring(0, 3)}</span>
                <span className="text-xs">{day}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    isSelected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {daySlotsCount} Slots
                </span>
              </button>
            );
          })}
        </div>

        {/* Filters Bar */}
        <div className="emp-dash__card p-3 mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={shiftFilter}
                onChange={(e) => setShiftFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-gray-300 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="All">All Shifts</option>
                <option value="Morning">Morning Shift</option>
                <option value="Break">Break Period</option>
                <option value="Evening">Evening Shift</option>
              </select>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-gray-300 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="available">Available</option>
              <option value="booked">Booked</option>
              <option value="blocked">Blocked</option>
              <option value="break">Break</option>
            </select>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by time, patient, doctor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            />
          </div>
        </div>

        {/* Slots Timeline Layout - ONLY REAL DATA */}
        {loading ? (
          <div className="emp-dash__card p-12 text-center text-gray-500">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm font-medium">Loading appointment slots...</p>
          </div>
        ) : filteredSlots.length === 0 ? (
          <div className="emp-dash__card p-12 text-center text-gray-500">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-700">No Slots Found for {selectedDay}</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto mb-4">
              {slots.length === 0 
                ? "No appointment slots available. Click 'Add Slots' to create new slots."
                : "No slots found for this day. Try selecting another day."}
            </p>
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
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-xs shadow-md"
            >
              <Plus className="w-3.5 h-3.5 inline mr-1" /> Add Slots
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Morning Shift */}
            {(shiftFilter === "All" || shiftFilter === "Morning") && morningShiftSlots.length > 0 && (
              <div className="emp-dash__card p-4 md:p-5">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                  <div className="flex items-center gap-2 text-amber-700 font-bold text-sm md:text-base">
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span>Morning Shift</span>
                    <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-semibold border border-amber-200">
                      09:00 AM – 02:00 PM
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">
                    {morningShiftSlots.length} Slots
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                  {morningShiftSlots.map((slot) => (
                    <SlotCard
                      key={slot._id || slot.slotId}
                      slot={slot}
                      onToggleStatus={() => handleToggleStatus(slot)}
                      onBook={() => {
                        setSelectedSlotForBook(slot);
                        setShowBookModal(true);
                      }}
                      onDelete={() => handleDeleteSlot(slot.slotId, slot._id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Break Period */}
            {(shiftFilter === "All" || shiftFilter === "Break") && (
              <div className="bg-purple-50/70 rounded-2xl p-4 border border-purple-200/70 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-sm">
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
                        Scheduled Doctor Break &amp; Sanitization (02:00 PM – 03:00 PM)
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
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                  <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm md:text-base">
                    <Moon className="w-4 h-4 text-indigo-600" />
                    <span>Evening Shift</span>
                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-semibold border border-indigo-200">
                      03:00 PM – 09:00 PM
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">
                    {eveningShiftSlots.length} Slots
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                  {eveningShiftSlots.map((slot) => (
                    <SlotCard
                      key={slot._id || slot.slotId}
                      slot={slot}
                      onToggleStatus={() => handleToggleStatus(slot)}
                      onBook={() => {
                        setSelectedSlotForBook(slot);
                        setShowBookModal(true);
                      }}
                      onDelete={() => handleDeleteSlot(slot.slotId, slot._id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Show message if no slots match filters */}
            {morningShiftSlots.length === 0 && eveningShiftSlots.length === 0 && (
              <div className="emp-dash__card p-8 text-center text-gray-500">
                <p className="text-sm">No slots match your current filters.</p>
                <button
                  onClick={() => {
                    setShiftFilter("All");
                    setStatusFilter("All");
                    setSearchQuery("");
                  }}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-xs font-semibold underline"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* ============================================= */}
        {/* ADD SLOT MODAL */}
        {/* ============================================= */}
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Add New Slots</h3>
                    <p className="text-xs text-gray-500">Create multiple slots for a doctor</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
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
                      className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium appearance-none"
                    >
                      <option value="">Select a doctor</option>
                      {doctorsLoading ? (
                        <option value="" disabled>Loading doctors...</option>
                      ) : doctors.length === 0 ? (
                        <option value="" disabled>No doctors available</option>
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
                  {newSlotDoctor && (
                    <div className="mt-1.5 text-xs text-emerald-600">
                      ✓ Selected: {doctors.find(d => d._id === newSlotDoctor)?.name}
                    </div>
                  )}
                </div>

                {/* Multiple Days Selection */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                    Select Days <span className="text-red-500">*</span>
                    <span className="text-[10px] text-gray-400 font-normal ml-1">(Select multiple days)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDaySelection(day)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border-2 transition-all ${
                          newSlotDays.includes(day)
                            ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                            : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {day.substring(0, 3)}
                      </button>
                    ))}
                  </div>
                  {newSlotDays.length > 0 && (
                    <div className="mt-1.5 text-xs text-emerald-600">
                      ✓ Selected: {newSlotDays.join(", ")}
                    </div>
                  )}
                </div>

                {/* Start Time & End Time */}
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

                {/* Duration */}
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
                      onChange={(e) => setNewSlotDuration(Math.max(5, parseInt(e.target.value) || 20))}
                      className="w-24 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                    />
                    <span className="text-xs text-gray-500">minutes</span>
                    <div className="flex items-center gap-1 ml-2">
                      {[15, 20, 25, 30].map((dur) => (
                        <button
                          key={dur}
                          onClick={() => setNewSlotDuration(dur)}
                          className={`text-[10px] px-2 py-0.5 rounded font-semibold transition-all ${
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
                      onChange={(e) => setNewSlotGap(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-24 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                    />
                    <span className="text-xs text-gray-500">minutes</span>
                    <div className="flex items-center gap-1 ml-2">
                      {[0, 5, 10, 15].map((gap) => (
                        <button
                          key={gap}
                          onClick={() => setNewSlotGap(gap)}
                          className={`text-[10px] px-2 py-0.5 rounded font-semibold transition-all ${
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

                {/* Consultation Fee */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                    Consultation Fee (₹)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={newSlotConsultationFee}
                      onChange={(e) => setNewSlotConsultationFee(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-24 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                    />
                    <span className="text-xs text-gray-500">₹</span>
                    <div className="flex items-center gap-1 ml-2">
                      {[200, 300, 500, 1000].map((fee) => (
                        <button
                          key={fee}
                          onClick={() => setNewSlotConsultationFee(fee)}
                          className={`text-[10px] px-2 py-0.5 rounded font-semibold transition-all ${
                            newSlotConsultationFee === fee
                              ? "bg-emerald-600 text-white"
                              : "bg-white text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
                          }`}
                        >
                          ₹{fee}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Shift Category */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                    Shift Category <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Sun className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <select
                      value={newSlotShift}
                      onChange={(e) => setNewSlotShift(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium appearance-none"
                    >
                      <option value="Morning Shift">Morning Shift</option>
                      <option value="Evening Shift">Evening Shift</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-2.5 pointer-events-none" />
                  </div>
                </div>

                {/* Summary Preview */}
                {newSlotDoctor && newSlotDays.length > 0 && newSlotStartTime && newSlotEndTime && (
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="text-[10px] font-bold uppercase text-blue-700 mb-1">📋 Summary</div>
                    <div className="text-sm font-medium text-gray-800">
                      {doctors.find(d => d._id === newSlotDoctor)?.name}
                    </div>
                    <div className="text-xs text-gray-600">
                      Days: {newSlotDays.join(", ")}
                    </div>
                    <div className="text-xs text-gray-600">
                      {newSlotStartTime} – {newSlotEndTime} • Duration: {newSlotDuration}m • Gap: {newSlotGap}m • {newSlotShift}
                    </div>
                    <div className="text-xs text-emerald-600 font-semibold mt-1">
                      💰 Fee: ₹{newSlotConsultationFee}
                    </div>
                    <div className="text-xs text-blue-600 font-semibold mt-1">
                      📊 Total slots: {newSlotDays.length * Math.floor((timeToMinutes(newSlotEndTime) - timeToMinutes(newSlotStartTime)) / (newSlotDuration + newSlotGap))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCustomSlot}
                  disabled={!newSlotDoctor || newSlotDays.length === 0 || !newSlotStartTime || !newSlotEndTime}
                  className="px-5 py-2 rounded-xl text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" /> Generate Slots
                </button>
              </div>
            </div>
          </div>
        )}

        {/* BOOK SLOT MODAL */}
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
                  {selectedSlotForBook.dayOfWeek} — {selectedSlotForBook.startTime} to {selectedSlotForBook.endTime}
                </div>
                <div>Duration: {selectedSlotForBook.duration} Mins (OP)</div>
                {selectedSlotForBook.doctorName && (
                  <div className="text-emerald-700 font-semibold mt-0.5">
                    👨‍⚕️ {selectedSlotForBook.doctorName} ({selectedSlotForBook.doctorSpecialization})
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
      </main>
    </div>
  );
};

// Sub-component: Individual Slot Card
const SlotCard = ({ slot, onToggleStatus, onBook, onDelete }) => {
  const isAvailable = slot.status === "available";
  const isBooked = slot.status === "booked";
  const isBlocked = slot.status === "blocked";
  const isBreak = slot.type === "break";

  return (
    <div
      className={`relative p-3.5 rounded-xl border transition-all duration-200 shadow-sm flex flex-col justify-between ${
        isBreak
          ? "bg-purple-50/60 border-purple-200 text-purple-900"
          : isBooked
          ? "bg-amber-50/70 border-amber-300 text-amber-900"
          : isBlocked
          ? "bg-gray-100 border-gray-300 text-gray-500 opacity-75"
          : "bg-emerald-50/60 border-emerald-300 text-emerald-900 hover:shadow-md hover:border-emerald-400"
      }`}
    >
      <div>
        {/* Header: Slot Number & Status Badge */}
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

        {/* Start and End Time */}
        <div className="text-sm font-bold tracking-tight text-gray-900 mb-1">
          {slot.startTime} – {slot.endTime}
        </div>

        {/* Doctor Name */}
        {slot.doctorName && (
          <div className="text-[10px] font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded mb-1 truncate">
            👨‍⚕️ {slot.doctorName}
          </div>
        )}

        {/* OP Duration & Fee */}
        <div className="text-[11px] text-gray-500 font-medium mb-1.5 flex items-center justify-between">
          <span>⏱ {slot.duration} Mins {slot.gap > 0 ? `(+${slot.gap}m)` : ""}</span>
          {!isBreak && (
            <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
              ₹{slot.consultationFee !== undefined ? slot.consultationFee : 300}
            </span>
          )}
        </div>

        {/* Patient Name if Booked */}
        {isBooked && slot.patientName && (
          <div className="bg-amber-100/80 p-1.5 rounded-md text-xs font-semibold text-amber-900 mb-2 truncate">
            👤 {slot.patientName}
          </div>
        )}
      </div>

      {/* Quick Action Footer */}
      {!isBreak && (
        <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between gap-1 mt-2">
          {isAvailable && (
            <button
              onClick={onBook}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold py-1 px-2 rounded-md shadow-xs transition-all text-center"
            >
              Book
            </button>
          )}

          <button
            onClick={onToggleStatus}
            className={`text-[11px] font-semibold py-1 px-2 rounded-md transition-all ${
              isBlocked
                ? "bg-gray-200 hover:bg-gray-300 text-gray-700"
                : isBooked
                ? "bg-amber-200 hover:bg-amber-300 text-amber-800"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            }`}
          >
            {isBlocked ? "Unblock" : isBooked ? "Details" : "Block"}
          </button>

          <button
            onClick={onDelete}
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