// OpDashboard.js — Fixed Total Patients Count to match OpManagement
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import {
  Users, IndianRupee, CheckCircle2, Clock, TrendingUp, CreditCard,
  Banknote, Calendar, RefreshCw, ArrowRight, BarChart2, Activity,
  UserPlus, CalendarDays, Stethoscope, BookOpen,
  Gift, FlaskConical, Pill, Star, ShieldCheck, Wallet,
  Search, Trash2, Filter, AlertCircle, Smartphone, ChevronDown, ChevronUp, Plus,
  ChevronLeft, ChevronRight
} from "lucide-react";
import {
  ResponsiveContainer, ComposedChart, Area, Bar, Line, XAxis, YAxis,
  Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend, BarChart
} from "recharts";
import "./EmployeeDashboard.css";
import "./Dashboard.css";

// ═══════════════════════════════════════════════════════
// CACHE
// ═══════════════════════════════════════════════════════
const CACHE_KEYS = { DOCTORS: "op_dash_doctors_cache_v2" };
const CACHE_TTL = 10 * 60 * 1000;

const readCache = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.data) && Date.now() - parsed.ts < CACHE_TTL) return parsed.data;
  } catch { /* ignore */ }
  return null;
};
const writeCache = (key, data) => {
  try { localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() })); } catch { /* full */ }
};

const COLORS = {
  primary: "#2563eb", success: "#10b981", warning: "#f59e0b",
  danger: "#ef4444", purple: "#8b5cf6", indigo: "#6366f1",
  pink: "#ec4899", cyan: "#06b6d4"
};

const BOOKING_TYPE_OPTIONS = [
  { value: "All", label: "All Booking Types" },
  { value: "Walk-In", label: "Walk-In" },
  { value: "Online", label: "Online" },
];

const REVENUE_CATEGORY_OPTIONS = [
  { value: "All", label: "All Revenue Types" },
  { value: "clinic", label: "Clinic Only" },
  { value: "lab", label: "Lab Only" },
  { value: "pharmacy", label: "Pharmacy Only" },
];

const PAYMENT_TYPE_FILTER_OPTIONS = [
  { value: "All", label: "All Payment Modes" },
  { value: "cash", label: "Cash" },
  { value: "online", label: "Online" },
  { value: "insurance", label: "Insurance" },
  { value: "card", label: "Card" },
];

const TIME_FILTER_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "thisWeek", label: "This Week" },
  { value: "thisMonth", label: "This Month" },
  { value: "lastMonth", label: "Last Month" },
  { value: "thisYear", label: "This Year" },
  { value: "All", label: "All" },
];

const inr = (n) => `₹${Math.round(Number(n) || 0).toLocaleString("en-IN")}`;

// ═══════════════════════════════════════════════════════
// DATE RANGE POPUP
// ═══════════════════════════════════════════════════════
const DateRangePopup = ({
  isOpen, position, fromDate, toDate, onFromChange, onToChange, onClear, onClose, dataAttr,
}) => {
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  useEffect(() => {
    if (isOpen) {
      if (fromDate) {
        const d = new Date(fromDate);
        if (!isNaN(d.getTime())) setCalendarMonth(new Date(d.getFullYear(), d.getMonth(), 1));
        else setCalendarMonth(new Date());
      } else {
        setCalendarMonth(new Date());
      }
    }
  }, [isOpen, fromDate]);

  if (!isOpen) return null;

  const toYMD = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();
    const days = [];
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month - 1, prevMonthDays - i), currentMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), currentMonth: true });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), currentMonth: false });
    }
    return days;
  };

  const days = getDaysInMonth(calendarMonth);
  const monthLabel = calendarMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const todayStr = toYMD(new Date());

  const handleDayClick = (dateStr, isCurrentMonth) => {
    if (!isCurrentMonth) return;
    if (!fromDate || (fromDate && toDate)) {
      onFromChange(dateStr);
      onToChange("");
    } else if (fromDate && !toDate) {
      if (dateStr >= fromDate) onToChange(dateStr);
      else onFromChange(dateStr);
    }
  };

  const isInRange = (d) => {
    if (!fromDate || !toDate) return false;
    return d >= fromDate && d <= toDate;
  };

  const fmtDisplay = (ymd) => {
    if (!ymd) return "";
    const [y, m, d] = ymd.split("-");
    return `${d}/${m}/${y}`;
  };

  return (
    <div
      data-attr={dataAttr}
      className="fixed bg-white border border-gray-200 rounded-2xl shadow-2xl"
      style={{ top: position.top, left: position.left, zIndex: 999999, width: 340 }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="text-base font-bold text-gray-900">Date Range</h3>
        <button type="button" onClick={onClear} className="text-[11px] font-bold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md border border-red-200 transition-colors">Reset</button>
      </div>

      <div className="px-3 py-3 bg-gray-50 flex items-center gap-2">
        <div className="flex-1">
          <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">From</label>
          <div className="px-2 py-1.5 text-[11px] border border-gray-300 rounded-md bg-white text-gray-800 font-semibold">
            {fmtDisplay(fromDate) || <span className="text-gray-400 font-normal">dd/mm/yyyy</span>}
          </div>
        </div>
        <div className="flex-1">
          <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">To</label>
          <div className="px-2 py-1.5 text-[11px] border border-gray-300 rounded-md bg-white text-gray-800 font-semibold">
            {fmtDisplay(toDate) || <span className="text-gray-400 font-normal">dd/mm/yyyy</span>}
          </div>
        </div>
      </div>

      <div className="px-3 py-3">
        <div className="flex items-center justify-between mb-2">
          <button type="button" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))} className="p-1.5 hover:bg-gray-100 rounded-md text-gray-600"><ChevronLeft className="w-3 h-3" /></button>
          <div className="text-xs font-bold text-gray-800">{monthLabel}</div>
          <button type="button" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))} className="p-1.5 hover:bg-gray-100 rounded-md text-gray-600"><ChevronRight className="w-3 h-3" /></button>
        </div>

        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {weekdays.map((wd, i) => (
            <div key={wd} className={`text-[9px] font-bold text-center py-1 ${i === 0 ? "text-red-500" : "text-gray-500"}`}>{wd}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-0.5">
          {days.map(({ date, currentMonth }, idx) => {
            const ymd = toYMD(date);
            const inRange = isInRange(ymd);
            const isFromDay = ymd === fromDate;
            const isToDay = ymd === toDate;
            const isToday = ymd === todayStr;
            const isWeekend = date.getDay() === 0;

            let cls = "text-[11px] font-semibold py-1.5 rounded-md text-center transition-colors ";
            if (!currentMonth) cls += "text-gray-300 cursor-default ";
            else if (isFromDay || isToDay) cls += "bg-orange-500 text-white cursor-pointer ";
            else if (inRange) cls += "bg-orange-100 text-orange-700 cursor-pointer ";
            else if (isToday) cls += "bg-blue-50 text-blue-700 ring-1 ring-blue-300 cursor-pointer ";
            else if (isWeekend) cls += "text-red-500 hover:bg-orange-50 cursor-pointer ";
            else cls += "text-gray-800 hover:bg-orange-50 cursor-pointer ";

            return (
              <button key={idx} type="button" onClick={() => handleDayClick(ymd, currentMonth)} className={cls}>
                {String(date.getDate()).padStart(2, "0")}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <button type="button" onClick={onClose} className="text-xs font-bold text-gray-600 hover:text-gray-900">Close</button>
        <button type="button" onClick={onClose} className="text-xs font-bold text-orange-600 hover:text-orange-700">Confirm</button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════
const OpDashboard = () => {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [doctorFilter, setDoctorFilter] = useState("All");
  const [bookingTypeFilter, setBookingTypeFilter] = useState("All");
  const [revenueCategoryFilter, setRevenueCategoryFilter] = useState("All");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState("All");
  const [referredByFilter, setReferredByFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [apptFromDate, setApptFromDate] = useState("");
  const [apptToDate, setApptToDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  const [timeFilter, setTimeFilter] = useState("All");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [showRevenueBreakdown, setShowRevenueBreakdown] = useState(false);
  const [showMobileWelcome, setShowMobileWelcome] = useState(false);

  const [showRegDatePopup, setShowRegDatePopup] = useState(false);
  const [showApptDatePopup, setShowApptDatePopup] = useState(false);
  const [regPopupPos, setRegPopupPos] = useState({ top: 0, left: 0 });
  const [apptPopupPos, setApptPopupPos] = useState({ top: 0, left: 0 });

  const [selectedTrendMonth, setSelectedTrendMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [trendChartType, setTrendChartType] = useState("composed");

  const searchDebounceRef = useRef(null);
  const initialMountRef = useRef(true);

  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchQuery]);

  useEffect(() => {
    if (window.innerWidth < 1024) setShowMobileWelcome(true);
  }, []);

  useEffect(() => {
    const cached = readCache(CACHE_KEYS.DOCTORS);
    if (cached && cached.length) setDoctors(cached);
    fetchDoctorsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (initialMountRef.current) {
      initialMountRef.current = false;
      fetchDashboardData();
      return;
    }
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    timeFilter, fromDate, toDate, apptFromDate, apptToDate, selectedMonth,
    doctorFilter, paymentTypeFilter, statusFilter, bookingTypeFilter,
    revenueCategoryFilter, referredByFilter, debouncedSearch, selectedTrendMonth
  ]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('[data-attr="reg"]') && !e.target.closest('[data-btn="reg"]')) {
        setShowRegDatePopup(false);
      }
      if (!e.target.closest('[data-attr="appt"]') && !e.target.closest('[data-btn="appt"]')) {
        setShowApptDatePopup(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (timeFilter && timeFilter !== "All") params.append("timeFilter", timeFilter);
      if (apptFromDate) params.append("apptFrom", apptFromDate);
      if (apptToDate) params.append("apptTo", apptToDate);
      if (fromDate) params.append("regFrom", fromDate);
      if (toDate) params.append("regTo", toDate);
      if (selectedMonth) params.append("month", selectedMonth);
      if (doctorFilter !== "All") params.append("doctor", doctorFilter);
      if (paymentTypeFilter !== "All") params.append("paymentType", paymentTypeFilter);
      if (statusFilter !== "All") params.append("paymentStatus", statusFilter);
      if (bookingTypeFilter !== "All") params.append("bookingType", bookingTypeFilter);
      if (revenueCategoryFilter !== "All") params.append("revenueCategory", revenueCategoryFilter);
      if (debouncedSearch.trim()) params.append("search", debouncedSearch.trim());
      if (selectedTrendMonth) params.append("trendMonth", selectedTrendMonth);

      const baseUrl = `${API_BASE_URL}/appointment-slots`;
      
      // ✅ FIX: Fetch both stats and raw bookings in parallel
      const [statsRes, bookingsRes] = await Promise.all([
        axios.get(`${baseUrl}/op-dashboard-stats?${params.toString()}`),
        axios.get(`${baseUrl}/getallbookings?${params.toString()}`)
      ]);

      let finalData = statsRes.data?.success ? { ...statsRes.data } : null;

      if (finalData) {
        const bookingsList = bookingsRes.data?.bookings || bookingsRes.data?.data || [];
        const bStats = bookingsRes.data?.stats;

        if (!finalData.stats) finalData.stats = {};
        
        // ✅ Override totalPatients with exact booking row count (matches OpManagement)
        finalData.stats.totalPatients = bookingsList.length;
        
        // ✅ Sync other stats if backend stats are available
        if (bStats) {
          finalData.stats.active = bStats.active || 0;
          finalData.stats.inactive = bStats.inactive || 0;
          finalData.stats.paid = bStats.paid || 0;
          finalData.stats.partial = bStats.partial || 0;
          finalData.stats.due = bStats.due || 0;
        }

        setDashboardData(finalData);
      } else {
        setDashboardData(null);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorsData = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/doctors/getalldoctors`);
      const data = res.data?.success ? (res.data.data || []) : [];
      setDoctors(data);
      writeCache(CACHE_KEYS.DOCTORS, data);
    } catch { /* keep cached */ }
  };

  const stats = dashboardData?.stats || {
    totalPatients: 0, active: 0, inactive: 0,
    paid: 0, partial: 0, pending: 0, due: 0,
    totalRevenue: 0, totalCollected: 0, totalDue: 0, totalBilled: 0,
  };

  const categoryRevenue = dashboardData?.categoryBreakdown || {
    clinic: { total: 0, cash: 0, online: 0, card: 0, insurance: 0, due: 0, footFall: 0 },
    lab: { total: 0, cash: 0, online: 0, card: 0, insurance: 0, due: 0, footFall: 0 },
    pharmacy: { total: 0, cash: 0, online: 0, card: 0, insurance: 0, due: 0, footFall: 0 },
  };

  const grandTotal = (categoryRevenue.clinic?.total || 0) + (categoryRevenue.lab?.total || 0) + (categoryRevenue.pharmacy?.total || 0);
  const grandFootFall = (categoryRevenue.clinic?.footFall || 0) + (categoryRevenue.lab?.footFall || 0) + (categoryRevenue.pharmacy?.footFall || 0);

  const genderData = dashboardData?.genderData || [
    { name: "Male", value: 0, color: "#3b82f6" },
    { name: "Female", value: 0, color: "#ec4899" },
    { name: "Other", value: 0, color: "#a855f7" },
  ];

  const paymentStatusData = dashboardData?.paymentStatusData || [
    { name: "Paid", value: 0, color: COLORS.success },
    { name: "Partial", value: 0, color: COLORS.warning },
    { name: "Pending", value: 0, color: COLORS.danger },
  ];

  const paymentMethodData = dashboardData?.paymentMethodData || [
    { name: "Cash", value: 0, color: COLORS.success },
    { name: "Online", value: 0, color: COLORS.indigo },
    { name: "Insurance", value: 0, color: COLORS.purple },
    { name: "Card", value: 0, color: COLORS.cyan },
  ];

  const monthlyDailyTrend = dashboardData?.trend || {
    monthLabel: "",
    daysData: [],
    totalMonthPatients: 0,
    totalMonthRevenue: 0,
    peakDay: "-",
  };

  const extras = dashboardData?.extras || {
    reviewedCount: 0, totalReviewServices: 0, offersCount: 0, totalOfferDeduction: 0,
  };

  const totalPatientsCount = stats.totalPatients || 0;

  const hasActiveFilters =
    searchQuery !== "" || statusFilter !== "All" || doctorFilter !== "All" ||
    bookingTypeFilter !== "All" || revenueCategoryFilter !== "All" ||
    paymentTypeFilter !== "All" || referredByFilter !== "All" ||
    fromDate !== "" || toDate !== "" ||
    apptFromDate !== "" || apptToDate !== "" || selectedMonth !== "" ||
    (timeFilter && timeFilter !== "All");

  const clearFilters = () => {
    setSearchQuery(""); setStatusFilter("All"); setDoctorFilter("All");
    setBookingTypeFilter("All"); setRevenueCategoryFilter("All");
    setPaymentTypeFilter("All"); setReferredByFilter("All");
    setFromDate(""); setToDate("");
    setApptFromDate(""); setApptToDate(""); setSelectedMonth("");
    setTimeFilter("All"); // 👈 "All" KAR DO
  };

  const handleTimeFilterChange = (value) => {
    setTimeFilter(value);
    if (value !== "All") {
      setApptFromDate("");
      setApptToDate("");
      setSelectedMonth("");
    }
  };

  const handleFromDateChange = (e) => { setFromDate(e.target.value); if (e.target.value) setSelectedMonth(""); };
  const handleToDateChange = (e) => { setToDate(e.target.value); if (e.target.value) setSelectedMonth(""); };
  const handleMonthChange = (e) => { setSelectedMonth(e.target.value); setFromDate(""); setToDate(""); setTimeFilter("All"); };
  const handleApptFromChange = (e) => { setApptFromDate(e.target.value); if (e.target.value) { setSelectedMonth(""); setTimeFilter("All"); } };
  const handleApptToChange = (e) => { setApptToDate(e.target.value); if (e.target.value) { setSelectedMonth(""); setTimeFilter("All"); } };

  const handleQuickAction = (path, state = {}) => {
    const role = localStorage.getItem("userRole");
    if (role === "employee") {
      const clean = path.startsWith("/") ? path.substring(1) : path;
      navigate(`/employee/${clean}`, { state });
    } else navigate(path, { state });
  };

  const handleMobileWelcomeChoice = (choice) => {
    setShowMobileWelcome(false);
    if (choice === "register") {
      setTimeout(() => {
        handleQuickAction("/op-management", { openAddPatient: true });
      }, 200);
    }
  };

  const getUniqueDoctors = () => {
    const m = new Map();
    doctors.forEach((d) => {
      const name = d.name || d.doctorName;
      if (name) m.set(name, name);
    });
    return Array.from(m.keys());
  };

  const getUniqueReferrers = () => {
    return { customers: [], doctors: [] };
  };

  const DailyTrendTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-xl shadow-xl border border-gray-200 text-xs space-y-1">
          <div className="font-bold text-gray-900 border-b border-gray-100 pb-1 mb-1">📅 {d.dateLabel}</div>
          <div className="flex justify-between gap-4 text-blue-700 font-semibold"><span>Total:</span><span>{d.patients}</span></div>
          <div className="flex justify-between gap-4 text-emerald-600"><span>Paid:</span><span>{d.paidPatients}</span></div>
          <div className="flex justify-between gap-4 text-amber-600"><span>Pending:</span><span>{d.pendingPatients}</span></div>
          <div className="flex justify-between gap-4 text-purple-700 font-bold pt-1 border-t border-gray-100">
            <span>Collected:</span><span>₹{(d.revenue || 0).toLocaleString()}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderTrendGraph = () => {
    const data = monthlyDailyTrend.daysData;
    return (
      <ComposedChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="opTrendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 10, fontWeight: "600" }} />
        <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: "#2563eb", fontSize: 10, fontWeight: "700" }} allowDecimals={false} />
        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: "#10b981", fontSize: 10, fontWeight: "700" }} allowDecimals={false} />
        <Tooltip content={<DailyTrendTooltip />} />

        {trendChartType === "area" && (<>
          <Area yAxisId="left" type="monotone" dataKey="patients" name="Bookings" stroke="#2563eb" strokeWidth={2.5} fill="url(#opTrendGradient)" dot={{ fill: "#2563eb", stroke: "#fff", strokeWidth: 1.5, r: 3.5 }} />
          <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={2.5} dot={{ fill: "#10b981", stroke: "#fff", strokeWidth: 1.5, r: 3.5 }} />
        </>)}
        {trendChartType === "bar" && (<>
          <Bar yAxisId="left" dataKey="patients" name="Bookings" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={16} />
          <Bar yAxisId="right" dataKey="revenue" name="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} barSize={16} />
        </>)}
        {trendChartType === "line" && (<>
          <Line yAxisId="left" type="monotone" dataKey="patients" name="Bookings" stroke="#2563eb" strokeWidth={3} dot={{ fill: "#2563eb", stroke: "#fff", strokeWidth: 1.5, r: 4 }} />
          <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={3} dot={{ fill: "#10b981", stroke: "#fff", strokeWidth: 1.5, r: 4 }} />
        </>)}
        {trendChartType === "composed" && (<>
          <Bar yAxisId="left" dataKey="patients" name="Bookings" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
          <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={3} dot={{ fill: "#10b981", stroke: "#fff", strokeWidth: 1.5, r: 4 }} />
        </>)}
      </ComposedChart>
    );
  };

  if (loading && !dashboardData) {
    return (
      <div className="emp-dash">
        <div className="emp-dash__loading">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mb-3" />
          <p className="emp-dash__loading-text">Loading OP Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="emp-dash">
      <main className="p-2 sm:p-4 lg:p-6">

        {/* Mobile Welcome Popup */}
        {showMobileWelcome && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 lg:hidden">
            <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Welcome to OP Dashboard</h3>
                    <p className="text-xs text-blue-100">What would you like to do?</p>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <button onClick={() => handleMobileWelcomeChoice("register")}
                  className="w-full flex items-center gap-3 px-4 py-3.5 bg-emerald-50 border-2 border-emerald-200 rounded-xl hover:bg-emerald-100 hover:border-emerald-400 transition-all text-left group">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-emerald-800 text-sm">New OP Register</div>
                    <div className="text-[11px] text-emerald-600">Register a new patient & book slot</div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-emerald-400 -rotate-90" />
                </button>
                <button onClick={() => handleMobileWelcomeChoice("manage")}
                  className="w-full flex items-center gap-3 px-4 py-3.5 bg-blue-50 border-2 border-blue-200 rounded-xl hover:bg-blue-100 hover:border-blue-400 transition-all text-left group">
                  <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-blue-800 text-sm">View Dashboard</div>
                    <div className="text-[11px] text-blue-600">Analytics, revenue & bookings</div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-blue-400 -rotate-90" />
                </button>
              </div>
              <div className="px-5 pb-5">
                <p className="text-[10px] text-gray-400 text-center">You can always access these options from the main screen.</p>
              </div>
            </div>
          </div>
        )}

        {/* ══════════ ROW 1 (Desktop) — ALWAYS VISIBLE ══════════ */}
        <div className="hidden lg:grid grid-cols-3 items-center gap-2 mb-3">
          <div className="flex items-center">
            <h1 className="emp-dash__greeting text-lg font-bold whitespace-nowrap">
              OP <span>Dashboard</span>
            </h1>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="relative flex-shrink-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[160px] pl-8 pr-2 py-2 text-xs border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-0.5 bg-gray-100 p-1 rounded-lg border border-gray-200">
              {TIME_FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleTimeFilterChange(opt.value)}
                  className={`px-2.5 py-1.5 text-[11px] font-bold rounded-md transition-all whitespace-nowrap ${
                    timeFilter === opt.value
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-600 hover:bg-white hover:text-gray-900"
                  }`}
                  title={opt.label}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1.5 justify-end">
            <button
              onClick={() => handleQuickAction("/op-management", { openAddPatient: true })}
              className="flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm whitespace-nowrap"
            >
              <UserPlus className="w-3.5 h-3.5" /> Register New OP
            </button>
          </div>
        </div>

        {/* ROW 2 (Desktop) — Filters ONLY VISIBLE when Revenue Breakdown is shown */}
        {showRevenueBreakdown && (
          <div className="hidden lg:flex items-center gap-1.5 flex-nowrap mb-3 overflow-x-auto">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 px-2 text-xs border border-gray-300 bg-white rounded-lg flex-shrink-0">
              <option value="All">All Payment</option>
              <option value="Pending">Pending</option>
              <option value="Partial">Partial</option>
              <option value="Paid">Paid</option>
              <option value="Due">Due</option>
            </select>
            <select value={bookingTypeFilter} onChange={(e) => setBookingTypeFilter(e.target.value)} className="h-9 px-2 text-xs border border-gray-300 bg-white rounded-lg flex-shrink-0">
              {BOOKING_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)} className="h-9 px-2 text-xs border border-gray-300 bg-white rounded-lg max-w-[120px] truncate flex-shrink-0">
              <option value="All">All Doctors</option>
              {getUniqueDoctors().map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={revenueCategoryFilter} onChange={(e) => setRevenueCategoryFilter(e.target.value)} className="h-9 px-2 text-xs border border-gray-300 bg-white rounded-lg flex-shrink-0">
              {REVENUE_CATEGORY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select value={paymentTypeFilter} onChange={(e) => setPaymentTypeFilter(e.target.value)} className="h-9 px-2 text-xs border border-gray-300 bg-white rounded-lg flex-shrink-0">
              {PAYMENT_TYPE_FILTER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            <select
              value={referredByFilter}
              onChange={(e) => setReferredByFilter(e.target.value)}
              className={`h-9 px-2 text-xs border rounded-lg max-w-[140px] truncate flex-shrink-0 ${
                referredByFilter !== "All"
                  ? "border-indigo-500 text-indigo-700 bg-indigo-50"
                  : "border-gray-300 bg-white"
              }`}
              title="Filter by Referred By"
            >
              <option value="All">All Referrers</option>
              {getUniqueReferrers().customers.length > 0 && (
                <optgroup label="Customers">
                  {getUniqueReferrers().customers.map((c) => (
                    <option key={`c-${c}`} value={`customer::${c}`}>{c}</option>
                  ))}
                </optgroup>
              )}
              {getUniqueReferrers().doctors.length > 0 && (
                <optgroup label="Doctors">
                  {getUniqueReferrers().doctors.map((d) => (
                    <option key={`d-${d}`} value={`doctor::${d}`}>{d}</option>
                  ))}
                </optgroup>
              )}
            </select>

            {/* Reg Date Popup */}
            <div className="relative flex-shrink-0">
              <button
                data-btn="reg"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const popupWidth = 340;
                  const left = Math.min(rect.left, window.innerWidth - popupWidth - 20);
                  setRegPopupPos({ top: rect.bottom + 6, left });
                  setShowRegDatePopup(!showRegDatePopup);
                  setShowApptDatePopup(false);
                }}
                className={`flex items-center gap-1.5 h-9 px-2.5 text-xs font-semibold rounded-lg border transition-all whitespace-nowrap ${
                  (fromDate || toDate)
                    ? "border-blue-500 text-blue-700 bg-blue-50 ring-2 ring-blue-500/10"
                    : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                }`}
              >
                <Calendar className="w-3 h-3" />
                <span>
                  {!fromDate && !toDate
                    ? "Reg Date"
                    : fromDate && toDate
                      ? `${fromDate.slice(8, 10)}/${fromDate.slice(5, 7)} – ${toDate.slice(8, 10)}/${toDate.slice(5, 7)}`
                      : fromDate
                        ? `From ${fromDate.slice(8, 10)}/${fromDate.slice(5, 7)}`
                        : `To ${toDate.slice(8, 10)}/${toDate.slice(5, 7)}`}
                </span>
                {(fromDate || toDate) && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setFromDate("");
                      setToDate("");
                    }}
                    className="ml-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center hover:bg-red-600 cursor-pointer"
                  >
                    ✕
                  </span>
                )}
              </button>
              <DateRangePopup
                isOpen={showRegDatePopup}
                position={regPopupPos}
                fromDate={fromDate}
                toDate={toDate}
                onFromChange={setFromDate}
                onToChange={setToDate}
                onClear={() => { setFromDate(""); setToDate(""); }}
                onClose={() => setShowRegDatePopup(false)}
                dataAttr="reg"
              />
            </div>

            {/* Appt Date Popup */}
            <div className="relative flex-shrink-0">
              <button
                data-btn="appt"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const popupWidth = 340;
                  const left = Math.min(rect.left, window.innerWidth - popupWidth - 20);
                  setApptPopupPos({ top: rect.bottom + 6, left });
                  setShowApptDatePopup(!showApptDatePopup);
                  setShowRegDatePopup(false);
                }}
                className={`flex items-center gap-1.5 h-9 px-2.5 text-xs font-semibold rounded-lg border transition-all whitespace-nowrap ${
                  (apptFromDate || apptToDate)
                    ? "border-blue-500 text-blue-700 bg-blue-50 ring-2 ring-blue-500/10"
                    : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                }`}
              >
                <Calendar className="w-3 h-3" />
                <span>
                  {!apptFromDate && !apptToDate
                    ? "Appt Date"
                    : apptFromDate && apptToDate
                      ? `${apptFromDate.slice(8, 10)}/${apptFromDate.slice(5, 7)} – ${apptToDate.slice(8, 10)}/${apptToDate.slice(5, 7)}`
                      : apptFromDate
                        ? `From ${apptFromDate.slice(8, 10)}/${apptFromDate.slice(5, 7)}`
                        : `To ${apptToDate.slice(8, 10)}/${apptToDate.slice(5, 7)}`}
                </span>
                {(apptFromDate || apptToDate) && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setApptFromDate("");
                      setApptToDate("");
                    }}
                    className="ml-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center hover:bg-red-600 cursor-pointer"
                  >
                    ✕
                  </span>
                )}
              </button>
              <DateRangePopup
                isOpen={showApptDatePopup}
                position={apptPopupPos}
                fromDate={apptFromDate}
                toDate={apptToDate}
                onFromChange={setApptFromDate}
                onToChange={setApptToDate}
                onClear={() => { setApptFromDate(""); setApptToDate(""); }}
                onClose={() => setShowApptDatePopup(false)}
                dataAttr="appt"
              />
            </div>

            <input
              type="month"
              value={selectedMonth}
              onChange={handleMonthChange}
              className="h-9 px-2 text-xs border border-gray-300 bg-white rounded-lg flex-shrink-0 w-[110px]"
              title="Appointment month"
            />

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 h-9 px-2.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex-shrink-0"
              >
                <Trash2 className="w-3 h-3 text-red-500" /> Clear
              </button>
            )}
          </div>
        )}

        {/* MOBILE HEADER */}
        <div className="lg:hidden flex items-center justify-between gap-2 flex-wrap mb-3">
          <div className="flex items-baseline gap-2">
            <h1 className="text-base font-bold whitespace-nowrap">OP <span className="text-indigo-600">Dashboard</span></h1>
            <div className="emp-dash__date-pill text-[10px] px-2 py-1">
              <Users className="w-3 h-3 text-blue-600" />
              <span>{totalPatientsCount} Patients</span>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-wrap justify-end">
            <button onClick={() => handleQuickAction("/op-management", { openAddPatient: true })}
              className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-white bg-blue-600 rounded-lg">
              <UserPlus className="w-3 h-3" /> Add
            </button>
            <button onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg">
              <Filter className="w-3 h-3" /> Filters
            </button>
          </div>
        </div>

        {/* MOBILE TIME FILTER */}
        <div className="lg:hidden mb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {TIME_FILTER_OPTIONS.map((opt) => (
              <button key={opt.value} onClick={() => handleTimeFilterChange(opt.value)}
                className={`px-4 py-2.5 text-xs font-bold rounded-lg border transition-all whitespace-nowrap flex-shrink-0 ${
                  timeFilter === opt.value
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white text-gray-600 border-gray-300"
                }`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* MOBILE FILTERS */}
        <div className="lg:hidden">
          {showMobileFilters && (
            <div className="mb-4 p-4 bg-white rounded-xl border border-gray-200 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg">
                  <option value="All">All Payment</option>
                  <option value="Pending">Pending</option>
                  <option value="Partial">Partial</option>
                  <option value="Paid">Paid</option>
                  <option value="Due">Due</option>
                </select>
                <select value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg">
                  <option value="All">All Doctors</option>
                  {getUniqueDoctors().map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select value={bookingTypeFilter} onChange={(e) => setBookingTypeFilter(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg">
                  {BOOKING_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <select value={paymentTypeFilter} onChange={(e) => setPaymentTypeFilter(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg">
                  {PAYMENT_TYPE_FILTER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <select value={revenueCategoryFilter} onChange={(e) => setRevenueCategoryFilter(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg">
                {REVENUE_CATEGORY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Registered Date</label>
                <div className="grid grid-cols-2 gap-2">
                  <input type="date" value={fromDate} onChange={handleFromDateChange} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg" />
                  <input type="date" value={toDate} onChange={handleToDateChange} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Appointment Date</label>
                <div className="grid grid-cols-2 gap-2">
                  <input type="date" value={apptFromDate} onChange={handleApptFromChange} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg" />
                  <input type="date" value={apptToDate} onChange={handleApptToChange} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Month</label>
                <input type="month" value={selectedMonth} onChange={handleMonthChange} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg" />
              </div>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg">
                  <Trash2 className="w-4 h-4 text-red-500" /> Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <button onClick={() => handleQuickAction("/doctor-management")}
            className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100">
              <Stethoscope className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quick Action</div>
              <div className="text-sm font-bold text-gray-800">Doctors</div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-blue-600" />
          </button>
          <button onClick={() => handleQuickAction("/appointment-slots")}
            className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-purple-300 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center group-hover:bg-purple-100">
              <CalendarDays className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quick Action</div>
              <div className="text-sm font-bold text-gray-800">Slots</div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-purple-600" />
          </button>
          <button onClick={() => handleQuickAction("/op-management")}
            className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-emerald-300 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100">
              <UserPlus className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quick Action</div>
              <div className="text-sm font-bold text-gray-800">OP</div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-emerald-600" />
          </button>
          <button onClick={() => handleQuickAction("/bookings")}
            className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-amber-300 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center group-hover:bg-amber-100">
              <BookOpen className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quick Action</div>
              <div className="text-sm font-bold text-gray-800">Bookings</div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-amber-600" />
          </button>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-6">
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Clinic Patients</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate"><Users className="w-4 h-4 text-blue-600" /></div>
            </div>
            <div className="emp-dash__stat-value">{stats.totalPatients}</div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0 text-[10px] font-bold leading-tight">
              <span className="text-emerald-600 whitespace-nowrap">Active: {stats.active}</span>
              <span className="text-red-500 whitespace-nowrap">Inactive: {stats.inactive}</span>
            </div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Paid</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present"><CheckCircle2 className="w-4 h-4 text-emerald-600" /></div>
            </div>
            <div className="emp-dash__stat-value text-emerald-600">{stats.paid}</div>
            <div className="emp-dash__stat-meta">completed payments</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Partial</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate"><Clock className="w-4 h-4 text-amber-600" /></div>
            </div>
            <div className="emp-dash__stat-value text-amber-600">{stats.partial}</div>
            <div className="emp-dash__stat-meta">partially paid</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Pending</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--late"><Clock className="w-4 h-4 text-gray-500" /></div>
            </div>
            <div className="emp-dash__stat-value text-gray-600">{stats.pending}</div>
            <div className="emp-dash__stat-meta">awaiting payment</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Due</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--late"><AlertCircle className="w-4 h-4 text-red-500" /></div>
            </div>
            <div className="emp-dash__stat-value text-red-500">{stats.due}</div>
            <div className="emp-dash__stat-meta">overdue payments</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Collected</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present"><IndianRupee className="w-4 h-4 text-blue-700" /></div>
            </div>
            <div className="emp-dash__stat-value text-blue-700">{inr(grandTotal)}</div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0 text-[9px] font-bold leading-tight">
              <span className="text-blue-700 whitespace-nowrap">Clinic: {inr(categoryRevenue.clinic?.total || 0)}</span>
              <span className="text-purple-700 whitespace-nowrap">Lab: {inr(categoryRevenue.lab?.total || 0)}</span>
              <span className="text-green-700 whitespace-nowrap">Pharmacy: {inr(categoryRevenue.pharmacy?.total || 0)}</span>
            </div>
          </div>
        </div>

        {/* REVENUE BREAKDOWN — Toggle also controls Row 2 filters */}
        <div className="mb-6 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Revenue Breakdown</h3>
              <span className="text-xs text-gray-500">(based on current filters)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-700 bg-white px-3 py-1 rounded-full border border-indigo-200">
                {totalPatientsCount} patients
              </span>
              <button
                onClick={() => setShowRevenueBreakdown(!showRevenueBreakdown)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-white border border-indigo-300 rounded-lg hover:bg-indigo-50 shadow-sm transition-colors">
                {showRevenueBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {showRevenueBreakdown ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {showRevenueBreakdown && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3">
              <div className="rounded-lg p-4 border border-blue-200 bg-blue-50 min-h-[115px] flex flex-col justify-between">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 uppercase">
                    <Stethoscope className="w-3 h-3" /> Clinic Revenue
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[11px] font-bold text-blue-600 leading-tight">FootFall: {categoryRevenue.clinic?.footFall || 0}</span>
                    <span className="text-xl font-extrabold text-blue-800">{inr(categoryRevenue.clinic?.total || 0)}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-bold">
                  <span className="text-emerald-700 whitespace-nowrap">Cash: {inr(categoryRevenue.clinic?.cash || 0)}</span>
                  <span className="text-cyan-700 whitespace-nowrap">Online: {inr(categoryRevenue.clinic?.online || 0)}</span>
                  <span className="text-red-600 whitespace-nowrap">Due: {inr(categoryRevenue.clinic?.due || 0)}</span>
                </div>
              </div>

              <div className="rounded-lg p-4 border border-purple-200 bg-purple-50 min-h-[115px] flex flex-col justify-between">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700 uppercase">
                    <FlaskConical className="w-3 h-3" /> Lab Revenue
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[11px] font-bold text-purple-600 leading-tight">FootFall: {categoryRevenue.lab?.footFall || 0}</span>
                    <span className="text-xl font-extrabold text-purple-800">{inr(categoryRevenue.lab?.total || 0)}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-bold">
                  <span className="text-emerald-700 whitespace-nowrap">Cash: {inr(categoryRevenue.lab?.cash || 0)}</span>
                  <span className="text-cyan-700 whitespace-nowrap">Online: {inr(categoryRevenue.lab?.online || 0)}</span>
                  <span className="text-red-600 whitespace-nowrap">Due: {inr(categoryRevenue.lab?.due || 0)}</span>
                </div>
              </div>

              <div className="rounded-lg p-4 border border-green-200 bg-green-50 min-h-[115px] flex flex-col justify-between">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-green-700 uppercase">
                    <Pill className="w-3 h-3" /> Pharmacy Revenue
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[11px] font-bold text-green-600 leading-tight">FootFall: {categoryRevenue.pharmacy?.footFall || 0}</span>
                    <span className="text-xl font-extrabold text-green-800">{inr(categoryRevenue.pharmacy?.total || 0)}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-bold">
                  <span className="text-emerald-700 whitespace-nowrap">Cash: {inr(categoryRevenue.pharmacy?.cash || 0)}</span>
                  <span className="text-cyan-700 whitespace-nowrap">Online: {inr(categoryRevenue.pharmacy?.online || 0)}</span>
                  <span className="text-red-600 whitespace-nowrap">Due: {inr(categoryRevenue.pharmacy?.due || 0)}</span>
                </div>
              </div>

              <div className="rounded-lg p-4 border border-slate-300 bg-slate-50 min-h-[115px] flex flex-col justify-between">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase">
                    <IndianRupee className="w-3 h-3" /> Total Collected
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[11px] font-bold text-slate-600 leading-tight">FootFall: {grandFootFall}</span>
                    <span className="text-xl font-extrabold text-slate-900">{inr(grandTotal)}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-bold">
                  <span className="text-blue-700 whitespace-nowrap">Clinic: {inr(categoryRevenue.clinic?.total || 0)}</span>
                  <span className="text-purple-700 whitespace-nowrap">Lab: {inr(categoryRevenue.lab?.total || 0)}</span>
                  <span className="text-green-700 whitespace-nowrap">Pharmacy: {inr(categoryRevenue.pharmacy?.total || 0)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CHARTS ROW 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 emp-dash__card p-4 md:p-5">
            <div className="mb-4">
              <h3 className="font-bold text-gray-800 text-sm md:text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" /> Bookings &amp; Revenue Trend
              </h3>
              <p className="text-xs text-gray-500">Daily booking volume and collected revenue</p>
            </div>
            {monthlyDailyTrend.daysData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-400 text-xs">No trend data for selected month</div>
            ) : (
              <div style={{ width: "100%", height: 260, position: "relative" }}>
                <ResponsiveContainer width="100%" height={260}>
                  {renderTrendGraph()}
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="emp-dash__card p-4 md:p-5 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-gray-800 text-sm md:text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" /> Summary
                </h3>
                <p className="text-xs text-gray-500">Current filter overview</p>
              </div>
            </div>
            <div className="space-y-2 flex-1">
              <div className="p-3 rounded-lg border border-blue-200 bg-blue-50 flex justify-between items-center">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase">
                  <Users className="w-3.5 h-3.5" /> Total Patients
                </div>
                <div className="text-lg font-extrabold text-blue-800">{stats.totalPatients}</div>
              </div>
              <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50 flex justify-between items-center">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Total Collected
                </div>
                <div className="text-lg font-extrabold text-emerald-800">{inr(grandTotal)}</div>
              </div>
              <div className="p-3 rounded-lg border border-red-200 bg-red-50 flex justify-between items-center">
                <div className="flex items-center gap-2 text-xs font-bold text-red-700 uppercase">
                  <AlertCircle className="w-3.5 h-3.5" /> Total Due
                </div>
                <div className="text-lg font-extrabold text-red-800">
                  {inr((categoryRevenue.clinic?.due || 0) + (categoryRevenue.lab?.due || 0) + (categoryRevenue.pharmacy?.due || 0))}
                </div>
              </div>
              <div className="p-3 rounded-lg border border-purple-200 bg-purple-50 flex justify-between items-center">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-700 uppercase">
                  <Star className="w-3.5 h-3.5" /> Reviews
                </div>
                <div className="text-lg font-extrabold text-purple-800">{extras.reviewedCount}</div>
              </div>
              <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 flex justify-between items-center">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase">
                  <Gift className="w-3.5 h-3.5" /> Offers Applied
                </div>
                <div className="text-lg font-extrabold text-amber-800">{extras.offersCount}</div>
              </div>
            </div>
          </div>
        </div>

        {/* CHARTS ROW 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="emp-dash__card p-4 md:p-5">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Payment Status
            </h3>
            <p className="text-xs text-gray-500 mb-3">Paid vs Pending breakdown</p>
            <div style={{ width: "100%", height: 180 }}>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={paymentStatusData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={60} />
                  <Tooltip />
                  <Bar dataKey="value" name="Bookings" radius={[0, 6, 6, 0]}>
                    {paymentStatusData.map((e, i) => <Cell key={`s-${i}`} fill={e.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-around pt-2 text-xs border-t border-gray-100 mt-2">
              <div className="text-center"><span className="text-emerald-600 font-bold block text-sm">{stats.paid}</span><span className="text-gray-500 text-[11px]">Paid</span></div>
              <div className="text-center"><span className="text-amber-600 font-bold block text-sm">{stats.partial}</span><span className="text-gray-500 text-[11px]">Partial</span></div>
              <div className="text-center"><span className="text-red-600 font-bold block text-sm">{stats.pending + stats.due}</span><span className="text-gray-500 text-[11px]">Pending</span></div>
            </div>
          </div>

          <div className="emp-dash__card p-4 md:p-5">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 mb-1">
              <CreditCard className="w-4 h-4 text-indigo-600" /> Payment Mode (Paid)
            </h3>
            <p className="text-xs text-gray-500 mb-3">Cash · Online · Insurance · Card</p>
            <div style={{ width: "100%", height: 180 }}>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={paymentMethodData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={70} />
                  <Tooltip />
                  <Bar dataKey="value" name="Bookings" radius={[0, 6, 6, 0]}>
                    {paymentMethodData.map((e, i) => <Cell key={`m-${i}`} fill={e.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-4 pt-2 text-xs border-t border-gray-100 mt-2 gap-1">
              {paymentMethodData.map((m) => (
                <div key={m.name} className="text-center">
                  <span className="font-bold block text-sm" style={{ color: m.color }}>{m.value}</span>
                  <span className="text-gray-500 text-[10px]">{m.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="emp-dash__card p-4 md:p-5">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-pink-600" /> Gender Demographics
            </h3>
            <p className="text-xs text-gray-500 mb-3">Patient gender distribution</p>
            <div style={{ width: "100%", height: 180 }}>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={genderData} cx="50%" cy="50%" outerRadius={65} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {genderData.map((e, i) => <Cell key={`g-${i}`} fill={e.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-around pt-2 text-xs border-t border-gray-100 mt-2">
              {genderData.map((g) => (
                <div key={g.name} className="text-center">
                  <span className="font-bold block text-sm" style={{ color: g.color }}>{g.value}</span>
                  <span className="text-gray-500 text-[11px]">{g.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MONTHLY TREND */}
        <div className="emp-dash__card p-4 md:p-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-gray-800 text-sm md:text-base flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-blue-600" /> Daily Booking Trend ({monthlyDailyTrend.monthLabel || "—"})
              </h3>
              <p className="text-xs text-gray-500">Day-by-day booking volume and collected revenue</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg border border-gray-200">
                {["composed", "area", "bar", "line"].map((t) => (
                  <button key={t} onClick={() => setTrendChartType(t)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-md capitalize ${trendChartType === t ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-200"}`}>
                    {t}
                  </button>
                ))}
              </div>
              <input type="month" value={selectedTrendMonth} onChange={(e) => setSelectedTrendMonth(e.target.value)}
                className="px-2.5 py-1 text-xs border border-gray-300 rounded-lg font-bold text-gray-700 bg-gray-50" />
            </div>
          </div>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer width="100%" height={260}>{renderTrendGraph()}</ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 mt-2 border-t border-gray-100 text-center text-xs">
            <div className="bg-slate-50 p-2 rounded-lg">
              <span className="text-[10px] text-gray-500 font-bold uppercase block">Month</span>
              <span className="font-bold text-gray-800">{monthlyDailyTrend.monthLabel || "—"}</span>
            </div>
            <div className="bg-blue-50 p-2 rounded-lg">
              <span className="text-[10px] text-blue-700 font-bold uppercase block">Bookings</span>
              <span className="font-extrabold text-blue-900 text-sm">{monthlyDailyTrend.totalMonthPatients || 0}</span>
            </div>
            <div className="bg-emerald-50 p-2 rounded-lg">
              <span className="text-[10px] text-emerald-700 font-bold uppercase block">Collected</span>
              <span className="font-extrabold text-emerald-900 text-sm">{inr(monthlyDailyTrend.totalMonthRevenue || 0)}</span>
            </div>
            <div className="bg-purple-50 p-2 rounded-lg">
              <span className="text-[10px] text-purple-700 font-bold uppercase block">Peak Day</span>
              <span className="font-bold text-purple-900 truncate block">{monthlyDailyTrend.peakDay || "-"}</span>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default OpDashboard;