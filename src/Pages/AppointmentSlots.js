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
  Save,
  Sliders,
  Info
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

// Default weekly schedule definition
const DEFAULT_SCHEDULES = DAYS_OF_WEEK.map((day) => {
  if (day === "Sunday") {
    return {
      dayOfWeek: day,
      isWorking: true,
      shifts: [{ name: "Morning Shift", startTime: "09:00", endTime: "14:00" }],
      breaks: []
    };
  } else {
    return {
      dayOfWeek: day,
      isWorking: true,
      shifts: [
        { name: "Morning Shift", startTime: "09:00", endTime: "14:00" },
        { name: "Evening Shift", startTime: "15:00", endTime: "21:00" }
      ],
      breaks: [
        { name: "Afternoon Break", startTime: "14:00", endTime: "15:00" }
      ]
    };
  }
});

const AppointmentSlots = () => {
  // Config States
  const [opDuration, setOpDuration] = useState(20); // 20 Mins default
  const [opGap, setOpGap] = useState(5);           // 5 Mins gap default
  const [consultationFee, setConsultationFee] = useState(300); // 300 Rs default consultation fee
  const [weeklySchedules, setWeeklySchedules] = useState(DEFAULT_SCHEDULES);
  
  // UI & Data States
  const [slots, setSlots] = useState([]);
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
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
  
  // New Custom Slot Inputs
  const [newSlotDay, setNewSlotDay] = useState("Monday");
  const [newSlotStartTime, setNewSlotStartTime] = useState("09:00");
  const [newSlotEndTime, setNewSlotEndTime] = useState("09:20");
  const [newSlotShift, setNewSlotShift] = useState("Morning Shift");
  const [newSlotType, setNewSlotType] = useState("op");

  // Notification Toast State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch slot configuration and slots from backend API
  useEffect(() => {
    fetchConfigAndSlots();
  }, []);

  const fetchConfigAndSlots = async () => {
    setLoading(true);
    try {
      // 1. Fetch Config
      const configRes = await axios.get(`${API_BASE_URL}/appointment-slots/config`).catch(() => null);
      if (configRes && configRes.data && configRes.data.success && configRes.data.config) {
        const { opDuration: d, opGap: g, consultationFee: f, weeklySchedules: scheds } = configRes.data.config;
        if (d) setOpDuration(d);
        if (g !== undefined) setOpGap(g);
        if (f !== undefined) setConsultationFee(f);
        if (scheds && scheds.length > 0) setWeeklySchedules(scheds);
      }

      // 2. Fetch Slots
      const slotsRes = await axios.get(`${API_BASE_URL}/appointment-slots`).catch(() => null);
      if (slotsRes && slotsRes.data && slotsRes.data.slots && slotsRes.data.slots.length > 0) {
        setSlots(slotsRes.data.slots);
      } else {
        // Fallback: Generate slots on client side if backend empty
        generateLocalSlots(opDuration, opGap, weeklySchedules, consultationFee);
      }
    } catch (error) {
      console.error("Error connecting to API:", error);
      generateLocalSlots(opDuration, opGap, weeklySchedules, consultationFee);
    } finally {
      setLoading(false);
    }
  };

  // Client-side instant slot generator
  const generateLocalSlots = (duration, gap, schedules, fee = consultationFee) => {
    let allGenerated = [];

    (schedules || DEFAULT_SCHEDULES).forEach((daySched) => {
      if (!daySched.isWorking) return;
      const day = daySched.dayOfWeek;
      let slotIdx = 1;

      // Shifts
      (daySched.shifts || []).forEach((sh) => {
        const startMins = timeToMinutes(sh.startTime);
        const endMins = timeToMinutes(sh.endTime);
        let curr = startMins;

        while (curr + duration <= endMins) {
          const sStart = curr;
          const sEnd = curr + duration;

          allGenerated.push({
            _id: `local_${day}_${sh.name}_${slotIdx}`,
            slotId: `${day.substring(0,3).toLowerCase()}_${slotIdx}`,
            dayOfWeek: day,
            startTime: minutesTo12Hour(sStart),
            endTime: minutesTo12Hour(sEnd),
            startTime24: minutesTo24Hour(sStart),
            endTime24: minutesTo24Hour(sEnd),
            duration: duration,
            gap: gap,
            consultationFee: fee,
            paymentStatus: "Pending",
            shift: sh.name,
            type: "op",
            status: "available",
            slotNumber: slotIdx++
          });

          curr = sEnd + gap;
        }
      });

      // Breaks
      (daySched.breaks || []).forEach((brk) => {
        const bStartMins = timeToMinutes(brk.startTime);
        const bEndMins = timeToMinutes(brk.endTime);

        allGenerated.push({
          _id: `local_break_${day}_${bStartMins}`,
          slotId: `break_${day.substring(0,3).toLowerCase()}`,
          dayOfWeek: day,
          startTime: minutesTo12Hour(bStartMins),
          endTime: minutesTo12Hour(bEndMins),
          startTime24: brk.startTime,
          endTime24: brk.endTime,
          duration: bEndMins - bStartMins,
          gap: 0,
          shift: "Break",
          type: "break",
          status: "break",
          slotNumber: 0
        });
      });
    });

    setSlots(allGenerated);
  };

  // Save Configuration & Trigger Full Backend Slot Generation
  const handleSaveAndGenerate = async () => {
    setIsGenerating(true);
    setIsSaving(true);
    try {
      // 1. Save Config
      await axios.post(`${API_BASE_URL}/appointment-slots/config`, {
        opDuration,
        opGap,
        consultationFee,
        weeklySchedules
      }).catch(() => null);

      // 2. Generate Slots on Server
      const genRes = await axios.post(`${API_BASE_URL}/appointment-slots/generate`, {
        opDuration,
        opGap,
        consultationFee,
        weeklySchedules
      }).catch(() => null);

      if (genRes && genRes.data && genRes.data.success) {
        setSlots(genRes.data.slots);
        showToast(`Successfully generated ${genRes.data.slots.length} appointment slots!`, "success");
      } else {
        generateLocalSlots(opDuration, opGap, weeklySchedules, consultationFee);
        showToast("Generated appointment slots locally!", "info");
      }
    } catch (e) {
      console.error("Error saving slot configuration:", e);
      showToast("Error updating slot configuration", "error");
    } finally {
      setIsGenerating(false);
      setIsSaving(false);
    }
  };

  // Toggle slot status between Available & Blocked
  const handleToggleStatus = async (slot) => {
    if (slot.type === "break") return;

    let newStatus = "available";
    if (slot.status === "available") newStatus = "blocked";
    else if (slot.status === "blocked") newStatus = "available";
    else if (slot.status === "booked") newStatus = "available";

    // Optimistic UI update
    setSlots((prev) =>
      prev.map((s) => (s.slotId === slot.slotId ? { ...s, status: newStatus, patientName: "" } : s))
    );

    try {
      if (slot._id && !slot._id.startsWith("local_")) {
        await axios.put(`${API_BASE_URL}/appointment-slots/${slot._id}`, {
          status: newStatus,
          patientName: newStatus === "available" ? "" : slot.patientName
        }).catch(() => null);
      }
      showToast(`Slot status changed to '${newStatus}'`, "info");
    } catch (e) {
      console.error("Error updating slot status:", e);
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

    // Optimistic UI update
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
    }
  };

  // Add custom slot manually
  const handleAddCustomSlot = async () => {
    const sStartMins = timeToMinutes(newSlotStartTime);
    const sEndMins = timeToMinutes(newSlotEndTime);

    if (sEndMins <= sStartMins) {
      showToast("End time must be after start time", "error");
      return;
    }

    const newSlotObj = {
      slotId: `custom_${Date.now()}`,
      dayOfWeek: newSlotDay,
      startTime: minutesTo12Hour(sStartMins),
      endTime: minutesTo12Hour(sEndMins),
      startTime24: minutesTo24Hour(sStartMins),
      endTime24: minutesTo24Hour(sEndMins),
      duration: sEndMins - sStartMins,
      gap: 0,
      shift: newSlotShift,
      type: newSlotType,
      status: newSlotType === "break" ? "break" : "available",
      notes: "Manually Added Slot"
    };

    try {
      const res = await axios.post(`${API_BASE_URL}/appointment-slots`, newSlotObj).catch(() => null);
      if (res && res.data && res.data.slot) {
        setSlots((prev) => [...prev, res.data.slot]);
      } else {
        newSlotObj._id = `local_custom_${Date.now()}`;
        setSlots((prev) => [...prev, newSlotObj]);
      }
      showToast(`Added custom slot (${newSlotObj.startTime} - ${newSlotObj.endTime}) for ${newSlotDay}`, "success");
      setShowAddModal(false);
    } catch (e) {
      console.error("Error adding slot:", e);
    }
  };

  // Filter slots for current selected day
  const currentDaySlots = useMemo(() => {
    return slots.filter((s) => s.dayOfWeek.toLowerCase() === selectedDay.toLowerCase());
  }, [slots, selectedDay]);

  // Apply shift, status, and search filters
  const filteredSlots = useMemo(() => {
    return currentDaySlots.filter((slot) => {
      // Shift filter
      if (shiftFilter !== "All") {
        if (shiftFilter === "Morning" && !slot.shift.toLowerCase().includes("morning")) return false;
        if (shiftFilter === "Evening" && !slot.shift.toLowerCase().includes("evening")) return false;
        if (shiftFilter === "Break" && slot.type !== "break") return false;
      }
      // Status filter
      if (statusFilter !== "All" && slot.status !== statusFilter) return false;
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTime = slot.startTime.toLowerCase().includes(query) || slot.endTime.toLowerCase().includes(query);
        const matchPatient = (slot.patientName || "").toLowerCase().includes(query);
        const matchStatus = slot.status.toLowerCase().includes(query);
        if (!matchTime && !matchPatient && !matchStatus) return false;
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
    
    // Total OP hours on current day
    const opTotalMins = currentDaySlots
      .filter((s) => s.type !== "break")
      .reduce((acc, curr) => acc + (curr.duration || opDuration), 0);
    const opHoursStr = (opTotalMins / 60).toFixed(1);

    return {
      totalSlotsCount,
      dayTotalSlots,
      dayAvailableSlots,
      dayBookedSlots,
      dayBlockedSlots,
      opHoursStr
    };
  }, [slots, currentDaySlots, opDuration]);

  // Group filtered slots by shift for clean visual presentation
  const morningShiftSlots = filteredSlots.filter((s) => s.shift.toLowerCase().includes("morning"));
  const eveningShiftSlots = filteredSlots.filter((s) => s.shift.toLowerCase().includes("evening"));

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

        {/* Clean HRMS Header matching OpManagement */}
        <div className="emp-dash__header">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap">
              Appointment <span>Slots</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Add Custom Slot
            </button>
            <button
              onClick={handleSaveAndGenerate}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-md disabled:opacity-50"
            >
              {isGenerating ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              {isGenerating ? "Generating..." : "Save & Generate Slots"}
            </button>
          </div>
        </div>

        {/* Stat Summary Cards matching OpManagement */}
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

        {/* Main Settings Control Box Card */}
        <div className="emp-dash__card p-4 md:p-5 mb-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
            <div className="flex items-center gap-2 text-gray-800 font-bold text-sm md:text-base">
              <Sliders className="w-4 h-4 text-blue-600" />
              <span>OP Duration, Fee &amp; Gap Configuration</span>
            </div>
            <span className="text-xs text-gray-500">
              Configure parameters to automatically generate daily OPD slots
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* OP Duration Field */}
            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200">
              <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                OP Duration (Consultation)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="5"
                  max="120"
                  step="5"
                  value={opDuration}
                  onChange={(e) => setOpDuration(Math.max(5, parseInt(e.target.value) || 5))}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-gray-800 font-bold text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <span className="text-xs font-semibold text-gray-500">Mins</span>
              </div>
              <div className="flex items-center gap-1 mt-2">
                {[15, 20, 25, 30].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setOpDuration(mins)}
                    className={`text-xs px-2 py-0.5 rounded font-semibold transition-all ${
                      opDuration === mins
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-300"
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            {/* Gap After OP Field */}
            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200">
              <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                Turnaround Gap
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="60"
                  step="1"
                  value={opGap}
                  onChange={(e) => setOpGap(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-gray-800 font-bold text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <span className="text-xs font-semibold text-gray-500">Mins</span>
              </div>
              <div className="flex items-center gap-1 mt-2">
                {[0, 5, 10, 15].map((gap) => (
                  <button
                    key={gap}
                    onClick={() => setOpGap(gap)}
                    className={`text-xs px-2 py-0.5 rounded font-semibold transition-all ${
                      opGap === gap
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-300"
                    }`}
                  >
                    {gap}m
                  </button>
                ))}
              </div>
            </div>

            {/* Consultation Fee Field */}
            <div className="bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-200">
              <label className="block text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-1.5">
                Consultation Fee (₹)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-emerald-700">₹</span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={consultationFee}
                  onChange={(e) => setConsultationFee(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-white border border-emerald-300 rounded-lg px-3 py-1.5 text-gray-800 font-bold text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <div className="flex items-center gap-1 mt-2">
                {[200, 300, 500, 1000].map((fee) => (
                  <button
                    key={fee}
                    onClick={() => setConsultationFee(fee)}
                    className={`text-xs px-2 py-0.5 rounded font-semibold transition-all ${
                      consultationFee === fee
                        ? "bg-emerald-600 text-white"
                        : "bg-white text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
                    }`}
                  >
                    ₹{fee}
                  </button>
                ))}
              </div>
            </div>

            {/* Combined Cycle Summary */}
            <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-100 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block mb-1">
                  Effective Slot Cycle
                </span>
                <div className="text-xl font-extrabold text-blue-950">
                  {opDuration + opGap} <span className="text-xs font-semibold text-blue-700">Mins</span>
                </div>
                <p className="text-[11px] text-blue-700 mt-0.5">
                  {opDuration}m consultation + {opGap}m gap
                </p>
              </div>
              <div className="text-[11px] text-blue-600 mt-2 font-medium flex items-center gap-1">
                <Info className="w-3.5 h-3.5" /> Next slot every {opDuration + opGap}m
              </div>
            </div>
          </div>
        </div>

        {/* Day Selector Pills Card */}
        <div className="emp-dash__card p-2 mb-6 flex overflow-x-auto gap-1">
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = selectedDay.toLowerCase() === day.toLowerCase();
            const daySlotsCount = slots.filter(
              (s) => s.dayOfWeek.toLowerCase() === day.toLowerCase() && s.type !== "break"
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

        {/* Filters Bar Card */}
        <div className="emp-dash__card p-3 mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Shift Filter */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={shiftFilter}
                onChange={(e) => setShiftFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-gray-300 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="All">All Shifts</option>
                <option value="Morning">Morning Shift (09:00 AM - 02:00 PM)</option>
                <option value="Break">Break Period (02:00 PM - 03:00 PM)</option>
                <option value="Evening">Evening Shift (03:00 PM - 09:00 PM)</option>
              </select>
            </div>

            {/* Status Filter */}
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

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by time, status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            />
          </div>
        </div>

        {/* Slots Timeline Layout */}
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
              No appointment slots match your current filter selection.
            </p>
            <button
              onClick={handleSaveAndGenerate}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-xs shadow-md"
            >
              Generate Default Slots
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 1. MORNING SHIFT SECTION */}
            {(shiftFilter === "All" || shiftFilter === "Morning") && (
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

                {morningShiftSlots.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-2">No morning slots matching filters.</p>
                ) : (
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
                )}
              </div>
            )}

            {/* 2. BREAK PERIOD SECTION */}
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

            {/* 3. EVENING SHIFT SECTION */}
            {(shiftFilter === "All" || shiftFilter === "Evening") && (
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

                {selectedDay === "Sunday" ? (
                  <div className="bg-gray-50 p-5 rounded-xl text-center border border-gray-200">
                    <Moon className="w-7 h-7 text-gray-300 mx-auto mb-1.5" />
                    <h4 className="text-sm font-bold text-gray-700">Evening OP Closed on Sundays</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      According to operational rules, Sunday OP runs only from 09:00 AM to 02:00 PM.
                    </p>
                  </div>
                ) : eveningShiftSlots.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-2">No evening slots matching filters.</p>
                ) : (
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
                )}
              </div>
            )}
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

        {/* ADD CUSTOM SLOT MODAL */}
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  <Plus className="w-5 h-5 text-blue-600" /> Create Custom Slot
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="my-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                    Day of Week
                  </label>
                  <select
                    value={newSlotDay}
                    onChange={(e) => setNewSlotDay(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={newSlotStartTime}
                      onChange={(e) => setNewSlotStartTime(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={newSlotEndTime}
                      onChange={(e) => setNewSlotEndTime(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                    Shift Category
                  </label>
                  <select
                    value={newSlotShift}
                    onChange={(e) => setNewSlotShift(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="Morning Shift">Morning Shift</option>
                    <option value="Evening Shift">Evening Shift</option>
                    <option value="Break">Break Period</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCustomSlot}
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                >
                  Add Slot
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

        {/* OP Duration & Gap Tag */}
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