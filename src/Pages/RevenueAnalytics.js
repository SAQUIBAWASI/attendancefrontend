// src/Pages/RevenueAnalytics.jsx
// ✅ Complete Revenue Analytics Component — Tailwind only, no CSS file
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import {
  FaClinicMedical, FaFlask, FaPills, FaCalendarAlt, FaUsers,
  FaMoneyBillWave, FaChevronLeft, FaChevronRight, FaDownload,
} from "react-icons/fa";
import { FiRefreshCw, FiTrendingUp, FiAlertCircle } from "react-icons/fi";

/* ============================================================ */
/* Helpers                                                       */
/* ============================================================ */
const fmt = (n) => `₹${Math.round(Number(n) || 0).toLocaleString("en-IN")}`;

const formatDateToDDMMYYYY = (dateStr) => {
  if (!dateStr) return "";
  try {
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  } catch { return dateStr; }
};

/* ============================================================ */
/* DateRangePopup                                                */
/* ============================================================ */
const DateRangePopup = ({
  isOpen, position, fromDate, toDate, onFromChange, onToChange, onClear, onClose,
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
      className="fixed z-[999999] w-[340px] bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden"
      style={{ top: position.top, left: position.left }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <h4 className="text-sm font-bold text-slate-900 m-0">Date Range</h4>
        <button
          type="button"
          onClick={onClear}
          className="px-3 py-1.5 text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
        >
          Reset
        </button>
      </div>

      <div className="flex gap-2 p-3 bg-slate-50 border-b border-slate-100">
        <div className="flex-1">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">From</label>
          <div className="px-2.5 py-1.5 text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-md">
            {fmtDisplay(fromDate) || <span className="text-slate-400 font-normal">dd/mm/yyyy</span>}
          </div>
        </div>
        <div className="flex-1">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">To</label>
          <div className="px-2.5 py-1.5 text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-md">
            {fmtDisplay(toDate) || <span className="text-slate-400 font-normal">dd/mm/yyyy</span>}
          </div>
        </div>
      </div>

      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <button
            type="button"
            onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
            className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-md transition-colors"
          >
            <FaChevronLeft className="w-3 h-3" />
          </button>
          <div className="text-[13px] font-bold text-slate-900">{monthLabel}</div>
          <button
            type="button"
            onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
            className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-md transition-colors"
          >
            <FaChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {weekdays.map((wd, i) => (
            <div
              key={wd}
              className={`text-[9px] font-bold text-center py-1 ${i === 0 ? "text-red-500" : "text-slate-500"}`}
            >
              {wd}
            </div>
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

            let cls = "py-1.5 text-[11px] font-semibold text-center rounded-md transition-colors ";
            if (!currentMonth) cls += "text-slate-300 cursor-default";
            else if (isFromDay || isToDay) cls += "bg-orange-500 text-white cursor-pointer";
            else if (inRange) cls += "bg-orange-100 text-orange-700 cursor-pointer";
            else if (isToday) cls += "bg-blue-50 text-blue-700 ring-1 ring-blue-300 cursor-pointer";
            else if (isWeekend) cls += "text-red-500 hover:bg-orange-50 cursor-pointer";
            else cls += "text-slate-800 hover:bg-orange-50 cursor-pointer";

            return (
              <button key={idx} type="button" onClick={() => handleDayClick(ymd, currentMonth)} className={cls}>
                {String(date.getDate()).padStart(2, "0")}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 px-4 py-3 bg-slate-50 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-1.5 text-xs font-bold text-slate-600 bg-slate-200 rounded-md hover:bg-slate-300 transition-colors"
        >
          Close
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-1.5 text-xs font-bold text-white bg-orange-500 rounded-md hover:bg-orange-600 transition-colors"
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

/* ============================================================ */
/* Category Card                                                 */
/* ============================================================ */
const CategoryCard = ({ title, icon, color, footfall, total, data }) => {
  const colorMap = {
    blue: {
      border: "border-t-blue-500",
      iconBg: "bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/25",
    },
    purple: {
      border: "border-t-purple-500",
      iconBg: "bg-gradient-to-br from-purple-500 to-purple-600 shadow-purple-500/25",
    },
    green: {
      border: "border-t-emerald-500",
      iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/25",
    },
  };

  const metrics = [
    { label: "Cash", key: "cash", dot: "bg-emerald-500", value: "text-emerald-600" },
    { label: "Online", key: "online", dot: "bg-blue-500", value: "text-blue-600" },
    { label: "Card", key: "card", dot: "bg-purple-500", value: "text-purple-600" },
    { label: "Insurance", key: "insurance", dot: "bg-amber-500", value: "text-amber-600" },
  ];

  return (
    <div className={`bg-white rounded-xl border border-slate-200 border-t-[3px] ${colorMap[color].border} shadow-sm hover:shadow-md transition-shadow overflow-hidden`}>
      <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-100">
        <div className={`w-11 h-11 rounded-lg flex items-center justify-center text-white text-xl shadow-md ${colorMap[color].iconBg} flex-shrink-0`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-slate-900 truncate">{title}</h3>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 mt-0.5">
            <FaUsers className="w-3 h-3" /> {footfall} FootFall
          </span>
        </div>
        <div className="text-right flex-shrink-0">
          <span className="block text-[22px] font-extrabold text-slate-900 leading-none">
            {fmt(total)}
          </span>
          <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mt-1">
            Total
          </span>
        </div>
      </div>

      <div className="px-4 py-3 flex flex-col gap-2.5">
        {metrics.map((m) => (
          <div key={m.key} className="flex items-center gap-2.5 py-1.5">
            <div className={`w-2 h-2 rounded-full ${m.dot} flex-shrink-0`} />
            <div className="flex-1 text-xs font-semibold text-slate-500">{m.label}</div>
            <div className={`text-sm font-extrabold ${m.value}`}>{fmt(data[m.key])}</div>
          </div>
        ))}
        <div className="flex items-center gap-2.5 pt-3 mt-1 border-t border-dashed border-slate-200">
          <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
          <div className="flex-1 text-xs font-semibold text-slate-500">Due</div>
          <div className="text-sm font-extrabold text-red-600">{fmt(data.due)}</div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================ */
/* Main Component                                                */
/* ============================================================ */
export default function RevenueAnalytics() {
  const today = new Date().toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDatePopup, setShowDatePopup] = useState(false);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });

  const fetchAnalytics = useCallback(async () => {
    if (!fromDate && !toDate) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (fromDate) params.append("from", fromDate);
      if (toDate) params.append("to", toDate);

      const url = `${API_BASE_URL}/appointment-slots/revenue-analytics?${params.toString()}`;
      const res = await axios.get(url);

      if (res.data?.success) {
        setData(res.data.data);
      } else {
        setError(res.data?.message || "Failed to fetch analytics");
        setData(null);
      }
    } catch (err) {
      console.error("Revenue analytics fetch error:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch analytics");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleDateButtonClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const popupWidth = 340;
    const left = Math.min(rect.left, window.innerWidth - popupWidth - 20);
    setPopupPos({ top: rect.bottom + 6, left });
    setShowDatePopup(!showDatePopup);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".ra-date-popup") && !e.target.closest(".ra-date-trigger")) {
        setShowDatePopup(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const setPreset = (preset) => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const fmtDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    if (preset === "today") {
      const t = fmtDate(now);
      setFromDate(t); setToDate(t);
    } else if (preset === "yesterday") {
      const y = new Date(now); y.setDate(y.getDate() - 1);
      const t = fmtDate(y);
      setFromDate(t); setToDate(t);
    } else if (preset === "thisWeek") {
      const dow = now.getDay();
      const diff = dow === 0 ? 6 : dow - 1;
      const mon = new Date(now); mon.setDate(mon.getDate() - diff);
      setFromDate(fmtDate(mon)); setToDate(fmtDate(now));
    } else if (preset === "thisMonth") {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setFromDate(fmtDate(first)); setToDate(fmtDate(last));
    } else if (preset === "lastMonth") {
      const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const last = new Date(now.getFullYear(), now.getMonth(), 0);
      setFromDate(fmtDate(first)); setToDate(fmtDate(last));
    } else if (preset === "thisYear") {
      const first = new Date(now.getFullYear(), 0, 1);
      const last = new Date(now.getFullYear(), 11, 31);
      setFromDate(fmtDate(first)); setToDate(fmtDate(last));
    }
  };

  const handleExportCSV = () => {
    if (!data) return;
    const rows = [
      ["Category", "FootFall", "Total", "Cash", "Online", "Card", "Insurance", "Due"],
      ["Clinic", data.clinic.footFall, data.clinic.total, data.clinic.cash, data.clinic.online, data.clinic.card, data.clinic.insurance, data.clinic.due],
      ["Lab", data.lab.footFall, data.lab.total, data.lab.cash, data.lab.online, data.lab.card, data.lab.insurance, data.lab.due],
      ["Pharmacy", data.pharmacy.footFall, data.pharmacy.total, data.pharmacy.cash, data.pharmacy.online, data.pharmacy.card, data.pharmacy.insurance, data.pharmacy.due],
      ["Grand Total", data.grandTotal.footFall, data.grandTotal.total, data.grandTotal.cash, data.grandTotal.online, data.grandTotal.card, data.grandTotal.insurance, data.grandTotal.due],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Revenue_Analytics_${fromDate}_to_${toDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-5">
      <div className="max-w-[1400px] mx-auto">

        {/* ═══════════ HEADER ═══════════ */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center text-xl shadow-md shadow-indigo-500/25">
              <FiTrendingUp />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 m-0">Revenue Analytics</h1>
              <p className="text-xs text-slate-500 mt-0.5 m-0">
                Category-wise footfall, cash, online & due breakdown
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Presets */}
            <div className="flex gap-0.5 p-1 bg-slate-100 rounded-lg border border-slate-200">
              {[
                { v: "today", l: "Today" },
                { v: "yesterday", l: "Yesterday" },
                { v: "thisWeek", l: "Week" },
                { v: "thisMonth", l: "Month" },
                { v: "lastMonth", l: "Last Month" },
                { v: "thisYear", l: "Year" },
              ].map((p) => (
                <button
                  key={p.v}
                  onClick={() => setPreset(p.v)}
                  className="px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-white hover:text-slate-900 rounded-md transition-all whitespace-nowrap"
                  type="button"
                >
                  {p.l}
                </button>
              ))}
            </div>

            {/* Date Range Button */}
            <div className="relative">
              <button
                onClick={handleDateButtonClick}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                  fromDate || toDate
                    ? "bg-blue-50 border border-blue-500 text-blue-700 ring-2 ring-blue-500/10"
                    : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
                type="button"
              >
                <FaCalendarAlt className="w-3.5 h-3.5" />
                <span>
                  {!fromDate && !toDate
                    ? "Select Date"
                    : fromDate && toDate
                      ? `${formatDateToDDMMYYYY(fromDate)} – ${formatDateToDDMMYYYY(toDate)}`
                      : fromDate
                        ? `From ${formatDateToDDMMYYYY(fromDate)}`
                        : `To ${formatDateToDDMMYYYY(toDate)}`}
                </span>
              </button>
              <DateRangePopup
                isOpen={showDatePopup}
                position={popupPos}
                fromDate={fromDate}
                toDate={toDate}
                onFromChange={setFromDate}
                onToChange={setToDate}
                onClear={() => { setFromDate(""); setToDate(""); }}
                onClose={() => setShowDatePopup(false)}
              />
            </div>

            {/* Refresh */}
            <button
              onClick={fetchAnalytics}
              disabled={loading}
              className="w-9 h-9 flex items-center justify-center bg-white border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
              title="Refresh"
            >
              <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>

            {/* Export */}
            <button
              onClick={handleExportCSV}
              disabled={!data}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              type="button"
            >
              <FaDownload className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>
        </div>

        {/* ═══════════ ERROR ═══════════ */}
        {error && (
          <div className="flex items-center gap-2.5 px-4 py-3.5 mb-5 bg-red-50 border border-red-200 rounded-lg text-red-800 text-[13px] font-medium">
            <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
            <button
              onClick={fetchAnalytics}
              type="button"
              className="ml-auto px-3 py-1.5 text-[11px] font-bold text-red-800 bg-red-100 border border-red-200 rounded-md hover:bg-red-200 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* ═══════════ LOADING ═══════════ */}
        {loading && !data && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <FiRefreshCw className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
            <p className="text-sm m-0">Loading revenue analytics...</p>
          </div>
        )}

        {/* ═══════════ DATA ═══════════ */}
        {data && !loading && (
          <>
            {/* Category Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
              <CategoryCard
                title="Clinic Revenue"
                icon={<FaClinicMedical />}
                color="blue"
                footfall={data.clinic.footFall}
                total={data.clinic.total}
                data={data.clinic}
              />
              <CategoryCard
                title="Lab Revenue"
                icon={<FaFlask />}
                color="purple"
                footfall={data.lab.footFall}
                total={data.lab.total}
                data={data.lab}
              />
              <CategoryCard
                title="Pharmacy Revenue"
                icon={<FaPills />}
                color="green"
                footfall={data.pharmacy.footFall}
                total={data.pharmacy.total}
                data={data.pharmacy}
              />
            </div>

            {/* Grand Total */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-5 sm:p-6 text-white shadow-xl shadow-slate-900/15">
              <div className="flex items-center gap-3.5 pb-4 mb-4 border-b border-white/15">
                <div className="w-13 h-13 p-3 rounded-xl bg-white/15 flex items-center justify-center text-2xl flex-shrink-0">
                  <FaMoneyBillWave />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold m-0">Grand Total</h3>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-white/70 mt-0.5">
                    <FaUsers className="w-3 h-3" /> {data.grandTotal.footFall} FootFall
                  </span>
                </div>
                <div className="ml-auto text-2xl sm:text-3xl font-black tracking-tight">
                  {fmt(data.grandTotal.total)}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <div className="p-3 bg-white/10 border border-white/10 rounded-lg">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-white/70 uppercase tracking-wide mb-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    Cash
                  </div>
                  <div className="text-lg font-extrabold text-emerald-300">{fmt(data.grandTotal.cash)}</div>
                </div>
                <div className="p-3 bg-white/10 border border-white/10 rounded-lg">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-white/70 uppercase tracking-wide mb-1.5">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                    Online
                  </div>
                  <div className="text-lg font-extrabold text-blue-300">{fmt(data.grandTotal.online)}</div>
                </div>
                <div className="p-3 bg-white/10 border border-white/10 rounded-lg">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-white/70 uppercase tracking-wide mb-1.5">
                    <div className="w-2 h-2 rounded-full bg-purple-400" />
                    Card
                  </div>
                  <div className="text-lg font-extrabold text-purple-300">{fmt(data.grandTotal.card)}</div>
                </div>
                <div className="p-3 bg-white/10 border border-white/10 rounded-lg">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-white/70 uppercase tracking-wide mb-1.5">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    Insurance
                  </div>
                  <div className="text-lg font-extrabold text-amber-300">{fmt(data.grandTotal.insurance)}</div>
                </div>
                <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-lg">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-white/70 uppercase tracking-wide mb-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    Due
                  </div>
                  <div className="text-lg font-extrabold text-red-300">{fmt(data.grandTotal.due)}</div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ═══════════ EMPTY STATE ═══════════ */}
        {data && !loading && data.grandTotal.total === 0 && (
          <div className="flex flex-col items-center justify-center py-16 mt-5 bg-white rounded-xl border-2 border-dashed border-slate-200 text-slate-400">
            <FiAlertCircle className="w-10 h-10" />
            <h3 className="text-[15px] font-bold text-slate-600 mt-3 mb-1">No revenue data found</h3>
            <p className="text-xs m-0">No bookings with revenue in the selected date range.</p>
          </div>
        )}
      </div>
    </div>
  );
}