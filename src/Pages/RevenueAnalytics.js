// src/Pages/RevenueAnalytics.jsx
// ✅ Complete Revenue Analytics Component — Tailwind only, no CSS file
// 🎨 Clean light theme with blue accents
// ✨ Bank Credit now persists in DB — auto-loads on refresh
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import {
  FaClinicMedical, FaFlask, FaPills, FaCalendarAlt, FaUsers,
  FaMoneyBillWave, FaChevronLeft, FaChevronRight,
  FaRupeeSign, FaCheckCircle, FaTimesCircle,
  FaGlobe, FaWallet, FaChartBar, FaUniversity,
  FaArrowUp, FaArrowDown, FaEquals, FaSave,
} from "react-icons/fa";
import {
  FiRefreshCw, FiTrendingUp, FiAlertCircle, FiClock, FiFilter,
  FiDownload, FiTrash2, FiCheckCircle, FiXCircle, FiSearch,
  FiChevronDown, FiChevronUp, FiFileText,
} from "react-icons/fi";

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

/* ✅ UPDATED normalize — includes bankCredit from API response */
const normalizeAnalyticsData = (raw) => {
  if (!raw) return null;
  const cb = raw.categoryBreakdown || {};

  const clinic = {
    total: Number(cb.clinic?.total) || 0,
    cash: Number(cb.clinic?.cash) || 0,
    online: Number(cb.clinic?.online) || 0,
    card: Number(cb.clinic?.card) || 0,
    insurance: Number(cb.clinic?.insurance) || 0,
    due: Number(cb.clinic?.due) || 0,
    footFall: Number(cb.clinic?.footFall) || 0,
  };
  const lab = {
    total: Number(cb.lab?.total) || 0,
    cash: Number(cb.lab?.cash) || 0,
    online: Number(cb.lab?.online) || 0,
    card: Number(cb.lab?.card) || 0,
    insurance: Number(cb.lab?.insurance) || 0,
    due: Number(cb.lab?.due) || 0,
    footFall: Number(cb.lab?.footFall) || 0,
  };
  const pharmacy = {
    total: Number(cb.pharmacy?.total) || 0,
    cash: Number(cb.pharmacy?.cash) || 0,
    online: Number(cb.pharmacy?.online) || 0,
    card: Number(cb.pharmacy?.card) || 0,
    insurance: Number(cb.pharmacy?.insurance) || 0,
    due: Number(cb.pharmacy?.due) || 0,
    footFall: Number(cb.pharmacy?.footFall) || 0,
  };
  const grandTotal = {
    total: clinic.total + lab.total + pharmacy.total,
    cash: clinic.cash + lab.cash + pharmacy.cash,
    online: clinic.online + lab.online + pharmacy.online,
    card: clinic.card + lab.card + pharmacy.card,
    insurance: clinic.insurance + lab.insurance + pharmacy.insurance,
    due: clinic.due + lab.due + pharmacy.due,
    footFall: clinic.footFall + lab.footFall + pharmacy.footFall,
  };

  // ✅ Include bankCredit from response
  return {
    clinic,
    lab,
    pharmacy,
    grandTotal,
    bankCredit: raw.bankCredit || null,   // Saved bank credit record from DB
    dateRange: raw.dateRange || null,
  };
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
      } else setCalendarMonth(new Date());
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
      className="fixed z-[999999] w-[320px] bg-white border border-blue-200 rounded-lg shadow-2xl overflow-hidden"
      style={{ top: position.top, left: position.left }}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-blue-100 bg-blue-50/50">
        <h4 className="text-sm font-bold text-blue-800 m-0 flex items-center gap-1.5">
          <FaCalendarAlt className="text-blue-500 w-3 h-3" /> Date Range
        </h4>
        <button
          type="button"
          onClick={onClear}
          className="px-2.5 py-1 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100"
        >
          Reset
        </button>
      </div>

      <div className="flex gap-2 p-2.5 bg-blue-50/30 border-b border-blue-100">
        <div className="flex-1">
          <label className="block text-[9px] font-bold text-blue-500 uppercase mb-0.5">From</label>
          <div className="px-2 py-1 text-[11px] font-semibold text-blue-900 bg-white border border-blue-200 rounded">
            {fmtDisplay(fromDate) || <span className="text-blue-300 font-normal">dd/mm/yyyy</span>}
          </div>
        </div>
        <div className="flex-1">
          <label className="block text-[9px] font-bold text-blue-500 uppercase mb-0.5">To</label>
          <div className="px-2 py-1 text-[11px] font-semibold text-blue-900 bg-white border border-blue-200 rounded">
            {fmtDisplay(toDate) || <span className="text-blue-300 font-normal">dd/mm/yyyy</span>}
          </div>
        </div>
      </div>

      <div className="p-2.5">
        <div className="flex items-center justify-between mb-1.5">
          <button
            type="button"
            onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
            className="w-6 h-6 flex items-center justify-center text-blue-500 hover:bg-blue-100 rounded"
          >
            <FaChevronLeft className="w-2.5 h-2.5" />
          </button>
          <div className="text-xs font-bold text-blue-800">{monthLabel}</div>
          <button
            type="button"
            onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
            className="w-6 h-6 flex items-center justify-center text-blue-500 hover:bg-blue-100 rounded"
          >
            <FaChevronRight className="w-2.5 h-2.5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-0.5 mb-0.5">
          {weekdays.map((wd, i) => (
            <div key={wd} className={`text-[8px] font-bold text-center py-0.5 ${i === 0 ? "text-red-500" : "text-blue-400"}`}>
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

            let cls = "py-1 text-[10px] font-semibold text-center rounded transition-colors ";
            if (!currentMonth) cls += "text-blue-200 cursor-default";
            else if (isFromDay || isToDay) cls += "bg-blue-600 text-white cursor-pointer";
            else if (inRange) cls += "bg-blue-200 text-blue-700 cursor-pointer";
            else if (isToday) cls += "bg-blue-100 text-blue-800 ring-1 ring-blue-300 cursor-pointer";
            else if (isWeekend) cls += "text-red-500 hover:bg-blue-50 cursor-pointer";
            else cls += "text-blue-700 hover:bg-blue-50 cursor-pointer";

            return (
              <button key={idx} type="button" onClick={() => handleDayClick(ymd, currentMonth)} className={cls}>
                {String(date.getDate()).padStart(2, "0")}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-end gap-1.5 px-3 py-2 bg-blue-50/50 border-t border-blue-100">
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1 text-[10px] font-bold text-blue-600 bg-white border border-blue-200 rounded hover:bg-blue-50"
        >
          Close
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1 text-[10px] font-bold text-white bg-blue-600 rounded hover:bg-blue-700"
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
const CategoryCard = ({ title, icon, footfall, total, data }) => {
  const metrics = [
    { label: "Cash", key: "cash", icon: FaMoneyBillWave, color: "text-emerald-600" },
    { label: "Online", key: "online", icon: FaGlobe, color: "text-sky-600" },
    { label: "Due", key: "due", icon: FaTimesCircle, color: "text-rose-600" },
  ];

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3 hover:border-blue-300 transition-colors">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center text-sm">
            {icon}
          </span>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{title}</div>
            <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
              <FaUsers className="w-2 h-2" /> {footfall} FootFall
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-extrabold text-slate-900 leading-none">{fmt(total)}</div>
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Total</div>
        </div>
      </div>

      <div className="space-y-1 pt-2 border-t border-slate-100">
        {metrics.map((m) => {
          const Icon = m.icon;
          const val = Number(data[m.key]) || 0;
          return (
            <div key={m.key} className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                <Icon className={`w-2.5 h-2.5 ${m.color}`} />
                {m.label}
              </span>
              <span className={`font-bold ${m.color}`}>{fmt(val)}</span>
            </div>
          );
        })}
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
  const [activePreset, setActivePreset] = useState("today");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);
  const [bankCredit, setBankCredit] = useState("");

  const [savedBankCredit, setSavedBankCredit] = useState(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [savingBankCredit, setSavingBankCredit] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  /* ✅ UPDATED fetchAnalytics — also sets bank credit from response */
  const fetchAnalytics = useCallback(async () => {
    if (!fromDate && !toDate) return;
    setLoading(true);
    setError(null);
    try {
      const url = `${API_BASE_URL}/appointment-slots/revenue-analytics?from=${fromDate}&to=${toDate}`;
      const res = await axios.get(url);

      if (res.data?.success) {
        const normalized = normalizeAnalyticsData(res.data);
        setData(normalized);

        // ✅ Auto-populate saved bank credit if present
        if (res.data.bankCredit) {
          setBankCredit(String(res.data.bankCredit.bankCredit || ""));
          setSavedBankCredit(Number(res.data.bankCredit.bankCredit) || 0);
        } else {
          setBankCredit("");
          setSavedBankCredit(null);
        }
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

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  const handleDateButtonClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const popupWidth = 320;
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

    setActivePreset(preset);

    if (preset === "today") { const t = fmtDate(now); setFromDate(t); setToDate(t); }
    else if (preset === "yesterday") { const y = new Date(now); y.setDate(y.getDate() - 1); const t = fmtDate(y); setFromDate(t); setToDate(t); }
    else if (preset === "thisWeek") {
      const dow = now.getDay(); const diff = dow === 0 ? 6 : dow - 1;
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

  const clearFilters = () => {
    const t = new Date().toISOString().split("T")[0];
    setFromDate(t); setToDate(t);
    setActivePreset("today");
    setSearchQuery("");
    setBankCredit("");
    setSavedBankCredit(null);
    setShowDatePopup(false);
    setShowMobileFilters(false);
  };

  const handleSaveClick = () => {
    const bankCreditNum = parseFloat(bankCredit);
    if (isNaN(bankCreditNum) || bankCreditNum <= 0) {
      showToast("Please enter a valid bank credit amount first", "error");
      return;
    }
    setShowSaveConfirm(true);
  };

  /* ✅ UPDATED: Now actually POSTs to backend */
  const handleConfirmSave = async () => {
    const bankCreditNum = parseFloat(bankCredit) || 0;
    const grandTotalNum = data?.grandTotal?.total || 0;
    const diff = bankCreditNum - grandTotalNum;
    const absDiff = Math.abs(diff);

    let diffStatus = "—";
    if (bankCreditNum && grandTotalNum) {
      if (absDiff < 0.5) diffStatus = "MATCHED";
      else if (diff > 0) diffStatus = "CREDIT MORE";
      else diffStatus = "CREDIT LESS";
    }

    setSavingBankCredit(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/appointment-slots/save-bank-credit`,
        {
          fromDate,
          toDate,
          bankCredit: bankCreditNum,
          grandTotal: grandTotalNum,
          creditedDiff: diff,
          diffStatus,
          savedBy: "Admin",
        }
      );

      if (res.data?.success) {
        setSavedBankCredit(bankCreditNum);
        setShowSaveConfirm(false);
        showToast(`✅ Bank Credit ${fmt(bankCreditNum)} saved successfully!`, "success");
      } else {
        showToast(res.data?.message || "Failed to save bank credit", "error");
      }
    } catch (err) {
      console.error("Save bank credit error:", err);
      showToast(err.response?.data?.message || "Failed to save bank credit", "error");
    } finally {
      setSavingBankCredit(false);
    }
  };

  const handleCancelSave = () => {
    setShowSaveConfirm(false);
  };

  const activeBankCredit = savedBankCredit !== null ? savedBankCredit : (parseFloat(bankCredit) || 0);
  const bankCreditNum = activeBankCredit;
  const creditedDiff = bankCreditNum - (data?.grandTotal?.total || 0);
  const diffAbs = Math.abs(creditedDiff);
  const hasSavedValue = savedBankCredit !== null;

  const handleExportCSV = () => {
    if (!data) return;
    const diff = bankCreditNum - (data.grandTotal.total || 0);
    const diffLabel = !bankCreditNum ? "—" : (Math.abs(diff) < 0.5 ? "MATCHED" : (diff > 0 ? "CREDIT MORE" : "CREDIT LESS"));

    const htmlContent = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
<head>
<meta charset="UTF-8">
<style>
  table { border-collapse: collapse; font-family: Calibri, Arial, sans-serif; font-size: 11pt; }
  th { background: #1e3a8a; color: #ffffff; font-weight: bold; border: 1px solid #1e40af; padding: 8px 10px; text-align: center; white-space: nowrap; }
  td { border: 1px solid #cbd5e1; padding: 6px 10px; text-align: center; white-space: nowrap; }
  tr.data-row td { background: #f8fafc; font-weight: 600; color: #0f172a; }
  .title { font-size: 14pt; font-weight: bold; color: #0f172a; margin-bottom: 4px; }
  .date { font-size: 11pt; color: #475569; margin-bottom: 12px; }
</style>
</head>
<body>
  <div class="title">Revenue Analytics</div>
  <div class="date">Date: ${formatDateToDDMMYYYY(fromDate)} to ${formatDateToDDMMYYYY(toDate)}</div>
  <table>
    <thead>
      <tr>
        <th>Date Range</th>
        <th>Clinic FootFall</th><th>Clinic Cash</th><th>Clinic Online</th><th>Clinic Due</th><th>Clinic Total</th>
        <th>Lab FootFall</th><th>Lab Cash</th><th>Lab Online</th><th>Lab Due</th><th>Lab Total</th>
        <th>Pharmacy FootFall</th><th>Pharmacy Cash</th><th>Pharmacy Online</th><th>Pharmacy Due</th><th>Pharmacy Total</th>
        <th>Summary FootFall Total</th><th>Summary Cash Total</th><th>Summary Online Total</th><th>Summary Grand Total</th>
        <th>Bank Credit</th><th>Credited D/W</th><th>D/W Status</th>
      </tr>
    </thead>
    <tbody>
      <tr class="data-row">
        <td>${formatDateToDDMMYYYY(fromDate)} to ${formatDateToDDMMYYYY(toDate)}</td>
        <td>${data.clinic.footFall}</td><td>${data.clinic.cash}</td><td>${data.clinic.online}</td><td>${data.clinic.due}</td><td>${data.clinic.total}</td>
        <td>${data.lab.footFall}</td><td>${data.lab.cash}</td><td>${data.lab.online}</td><td>${data.lab.due}</td><td>${data.lab.total}</td>
        <td>${data.pharmacy.footFall}</td><td>${data.pharmacy.cash}</td><td>${data.pharmacy.online}</td><td>${data.pharmacy.due}</td><td>${data.pharmacy.total}</td>
        <td>${data.grandTotal.footFall}</td><td>${data.grandTotal.cash}</td><td>${data.grandTotal.online}</td><td>${data.grandTotal.total}</td>
        <td>${bankCreditNum || "—"}</td>
        <td>${Math.abs(diff) >= 0.5 && bankCreditNum ? Math.abs(diff) : (bankCreditNum ? 0 : "—")}</td>
        <td>${diffLabel}</td>
      </tr>
    </tbody>
  </table>
</body>
</html>`;

    const blob = new Blob([`\uFEFF${htmlContent}`], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Revenue_Analytics_${fromDate}_to_${toDate}.xls`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported revenue analytics to Excel!`, "success");
  };

  const presetOptions = [
    { v: "today", l: "Today" },
    { v: "yesterday", l: "Yesterday" },
    { v: "thisWeek", l: "Week" },
    { v: "thisMonth", l: "Month" },
    { v: "lastMonth", l: "Last Month" },
    { v: "thisYear", l: "Year" },
  ];

  const getDiffMeta = () => {
    if (!bankCreditNum || bankCreditNum === 0) {
      return { label: "—", value: 0, color: "text-slate-400", bg: "bg-slate-50", border: "border-slate-200", icon: FaEquals, tag: "Enter bank credit" };
    }
    if (Math.abs(creditedDiff) < 0.5) {
      return { label: "MATCHED", value: 0, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-300", icon: FaEquals, tag: "Perfect Match" };
    }
    if (creditedDiff > 0) {
      return { label: "CREDIT MORE", value: diffAbs, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-300", icon: FaArrowUp, tag: "Bank > Grand Total" };
    }
    return { label: "CREDIT LESS", value: diffAbs, color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-300", icon: FaArrowDown, tag: "Bank < Grand Total" };
  };

  const diffMeta = getDiffMeta();
  const DiffIcon = diffMeta.icon;

  const currentInputNum = parseFloat(bankCredit) || 0;
  const hasUnsavedChange = currentInputNum > 0 && currentInputNum !== savedBankCredit;

  return (
    <div className="min-h-screen bg-slate-50 p-2 sm:p-3 lg:p-4">
      {toast && (
        <div className={`fixed top-5 right-5 z-[99999] flex items-center gap-3 px-4 py-2.5 rounded-lg shadow-lg text-white ${toast.type === "error" ? "bg-red-600" : "bg-emerald-600"}`}>
          {toast.type === "error" ? <FiXCircle className="w-4 h-4" /> : <FiCheckCircle className="w-4 h-4" />}
          <span className="font-medium text-xs">{toast.message}</span>
        </div>
      )}

      {/* SAVE CONFIRMATION POPUP */}
      {showSaveConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[999999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-purple-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-4 text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <FaSave className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm m-0">Save Bank Credit</h3>
                <p className="text-[10px] text-white/80 m-0 mt-0.5">Confirm before saving</p>
              </div>
            </div>

            <div className="p-5 space-y-3">
              <div className="bg-purple-50 rounded-lg border border-purple-200 p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Bank Credit Amount:</span>
                  <span className="font-extrabold text-purple-700 text-base">{fmt(parseFloat(bankCredit) || 0)}</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-purple-200">
                  <span className="text-slate-600 font-medium">Grand Total:</span>
                  <span className="font-bold text-slate-700">{fmt(data?.grandTotal?.total || 0)}</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-purple-200">
                  <span className="text-slate-600 font-medium">Status:</span>
                  <span className="font-bold text-slate-700">
                    {Math.abs((parseFloat(bankCredit) || 0) - (data?.grandTotal?.total || 0)) < 0.5
                      ? "Matched ✓"
                      : ((parseFloat(bankCredit) || 0) > (data?.grandTotal?.total || 0) ? "Credit More" : "Credit Less")}
                  </span>
                </div>
              </div>

              <p className="text-sm text-slate-700 text-center font-medium m-0">
                Do you want to save this bank credit?
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-3 bg-slate-50 border-t border-slate-200">
              <button
                onClick={handleCancelSave}
                disabled={savingBankCredit}
                type="button"
                className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSave}
                disabled={savingBankCredit}
                type="button"
                className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-700 hover:to-indigo-700 shadow-md shadow-purple-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {savingBankCredit ? (
                  <FiRefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <FaSave className="w-3 h-3" />
                )}
                {savingBankCredit ? "Saving..." : "Yes, Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full">

        {/* HEADER */}
        <div className="hidden lg:flex items-center justify-between gap-3 mb-3 bg-white border border-slate-200 rounded-lg px-3 py-2.5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <FiTrendingUp className="w-4 h-4 text-blue-600" />
              <h1 className="text-sm font-bold text-slate-900 whitespace-nowrap">Revenue Analytics</h1>
            </div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-l border-slate-200 pl-3">
              {fromDate && toDate ? `${formatDateToDDMMYYYY(fromDate)} – ${formatDateToDDMMYYYY(toDate)}` : "—"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 bg-blue-50 p-0.5 rounded-md border border-blue-100">
              {presetOptions.map((p) => (
                <button
                  key={p.v}
                  onClick={() => setPreset(p.v)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded transition-all whitespace-nowrap ${
                    activePreset === p.v
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-blue-600 hover:bg-white"
                  }`}
                  type="button"
                >
                  {p.l}
                </button>
              ))}
            </div>

            <div className="relative ra-date-trigger">
              <button
                onClick={handleDateButtonClick}
                className="flex items-center gap-1.5 h-8 px-2.5 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 whitespace-nowrap"
                type="button"
              >
                <FaCalendarAlt className="w-3 h-3 text-blue-500" />
                <span>
                  {!fromDate && !toDate ? "Select Date"
                    : fromDate && toDate
                      ? `${formatDateToDDMMYYYY(fromDate)} – ${formatDateToDDMMYYYY(toDate)}`
                      : fromDate ? `From ${formatDateToDDMMYYYY(fromDate)}`
                      : `To ${formatDateToDDMMYYYY(toDate)}`}
                </span>
              </button>
              <div className="ra-date-popup">
                <DateRangePopup
                  isOpen={showDatePopup}
                  position={popupPos}
                  fromDate={fromDate}
                  toDate={toDate}
                  onFromChange={(v) => { setFromDate(v); setActivePreset(""); }}
                  onToChange={(v) => { setToDate(v); setActivePreset(""); }}
                  onClear={() => { setFromDate(""); setToDate(""); setActivePreset(""); }}
                  onClose={() => setShowDatePopup(false)}
                />
              </div>
            </div>

            <button
              onClick={handleExportCSV}
              disabled={!data}
              className="flex items-center gap-1.5 h-8 px-2.5 text-[11px] font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
              type="button"
            >
              <FiDownload className="w-3 h-3" />
              Export
            </button>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between gap-2 flex-wrap mb-3 bg-white border border-slate-200 rounded-lg px-3 py-2.5">
          <div className="flex items-center gap-2">
            <FiTrendingUp className="w-4 h-4 text-blue-600" />
            <h1 className="text-sm font-bold text-slate-900">Revenue Analytics</h1>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={fetchAnalytics} disabled={loading} className="p-1.5 text-blue-700 bg-blue-50 border border-blue-200 rounded-md">
              <FiRefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button onClick={() => setShowMobileFilters(!showMobileFilters)} className="p-1.5 text-blue-700 bg-blue-50 border border-blue-200 rounded-md">
              <FiFilter className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Mobile Presets */}
        <div className="lg:hidden mb-3">
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {presetOptions.map((p) => (
              <button
                key={p.v}
                onClick={() => setPreset(p.v)}
                className={`px-3 py-1.5 text-[11px] font-bold rounded-md border transition-all whitespace-nowrap flex-shrink-0 ${
                  activePreset === p.v
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-blue-600 border-blue-200"
                }`}
              >
                {p.l}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Filters Panel */}
        {showMobileFilters && (
          <div className="lg:hidden mb-3 p-3 bg-white rounded-lg border border-slate-200 space-y-2">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Search</label>
              <div className="relative">
                <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-3 h-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-7 pr-2 py-1.5 text-xs border border-slate-200 rounded-md"
                />
              </div>
            </div>
            <button
              onClick={handleDateButtonClick}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-md"
              type="button"
            >
              <FaCalendarAlt className="w-3 h-3" />
              <span>
                {!fromDate && !toDate ? "Select Date"
                  : fromDate && toDate
                    ? `${formatDateToDDMMYYYY(fromDate)} – ${formatDateToDDMMYYYY(toDate)}`
                    : fromDate ? `From ${formatDateToDDMMYYYY(fromDate)}`
                    : `To ${formatDateToDDMMYYYY(toDate)}`}
              </span>
            </button>
            <button onClick={handleExportCSV} disabled={!data} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-blue-600 rounded-md disabled:opacity-50">
              <FiDownload className="w-3.5 h-3.5" /> Export Excel
            </button>
            {(fromDate !== today || toDate !== today || searchQuery || bankCredit) && (
              <button onClick={clearFilters} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md">
                <FiTrash2 className="w-3.5 h-3.5 text-red-500" /> Clear All
              </button>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-3 py-2 mb-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs font-medium">
            <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
            <button onClick={fetchAnalytics} type="button" className="ml-auto px-2.5 py-1 text-[10px] font-bold text-red-700 bg-red-100 border border-red-200 rounded hover:bg-red-200">
              Retry
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && !data && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <FiRefreshCw className="w-6 h-6 text-blue-500 animate-spin mb-2" />
            <p className="text-xs m-0 font-medium">Loading revenue analytics...</p>
          </div>
        )}

        {/* DATA */}
        {data && !loading && (
          <>
            {/* Top Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 mb-3">
              <CategoryCard title="Clinic" icon={<FaClinicMedical />} footfall={data.clinic.footFall} total={data.clinic.total} data={data.clinic} />
              <CategoryCard title="Lab" icon={<FaFlask />} footfall={data.lab.footFall} total={data.lab.total} data={data.lab} />
              <CategoryCard title="Pharmacy" icon={<FaPills />} footfall={data.pharmacy.footFall} total={data.pharmacy.total} data={data.pharmacy} />

              {/* Summary Card */}
              <div className="bg-white rounded-lg border border-slate-200 p-3 hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm">
                      <FaChartBar />
                    </span>
                    <div>
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Summary</div>
                      <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                        <FaUsers className="w-2 h-2" /> {data.grandTotal.footFall} FootFall
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-extrabold text-slate-900 leading-none">{fmt(data.grandTotal.total)}</div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Total</div>
                  </div>
                </div>
                <div className="space-y-1 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <FaMoneyBillWave className="w-2.5 h-2.5 text-emerald-600" /> Cash Total
                    </span>
                    <span className="font-bold text-emerald-600">{fmt(data.grandTotal.cash)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <FaGlobe className="w-2.5 h-2.5 text-sky-600" /> Online Total
                    </span>
                    <span className="font-bold text-sky-600">{fmt(data.grandTotal.online)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <FaWallet className="w-2.5 h-2.5 text-blue-600" /> Grand Total
                    </span>
                    <span className="font-bold text-blue-600">{fmt(data.grandTotal.total)}</span>
                  </div>
                </div>
              </div>

              {/* Grand Total Card */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-3 text-white shadow-md shadow-blue-500/20">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-md bg-white/20 flex items-center justify-center text-sm">
                      <FaRupeeSign />
                    </span>
                    <div>
                      <div className="text-[11px] font-bold text-white/80 uppercase tracking-wide">Grand Total</div>
                      <div className="text-[10px] text-white/60 font-medium flex items-center gap-1 mt-0.5">
                        <FaUsers className="w-2 h-2" /> {data.grandTotal.footFall} FootFall
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-extrabold leading-none">{fmt(data.grandTotal.total)}</div>
                    <div className="text-[9px] font-bold text-white/60 uppercase tracking-wider mt-0.5">All</div>
                  </div>
                </div>
                <div className="space-y-1 pt-2 border-t border-white/20">
                  {[
                    { label: "Cash", key: "cash", icon: FaMoneyBillWave },
                    { label: "Online", key: "online", icon: FaGlobe },
                    { label: "Due", key: "due", icon: FaTimesCircle },
                  ].map((m) => {
                    const Icon = m.icon;
                    const val = Number(data.grandTotal[m.key]) || 0;
                    const isDue = m.key === "due";
                    return (
                      <div key={m.key} className="flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1.5 text-white/70 font-medium">
                          <Icon className="w-2.5 h-2.5" /> {m.label}
                        </span>
                        <span className={`font-bold ${isDue ? "text-rose-200" : "text-white"}`}>{fmt(val)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* REVENUE DETAILS TABLE */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden mb-3">
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <FiFileText className="text-blue-500 w-3.5 h-3.5" />
                  <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Revenue Details</h3>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  {fromDate && toDate ? `${formatDateToDDMMYYYY(fromDate)} – ${formatDateToDDMMYYYY(toDate)}` : "All time"}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-blue-50 border-b border-blue-100">
                    <tr>
                      <th className="px-3 py-2 text-center font-bold text-blue-600 uppercase tracking-wider text-[10px] border-r border-blue-100 whitespace-nowrap">Date Range</th>
                      <th className="px-3 py-2 text-center font-bold text-blue-600 uppercase tracking-wider text-[10px] border-r border-blue-100 whitespace-nowrap">Clinic FootFall</th>
                      <th className="px-3 py-2 text-center font-bold text-blue-600 uppercase tracking-wider text-[10px] border-r border-blue-100 whitespace-nowrap">Clinic Cash</th>
                      <th className="px-3 py-2 text-center font-bold text-blue-600 uppercase tracking-wider text-[10px] border-r border-blue-100 whitespace-nowrap">Clinic Online</th>
                      <th className="px-3 py-2 text-center font-bold text-blue-600 uppercase tracking-wider text-[10px] border-r border-blue-100 whitespace-nowrap">Clinic Due</th>
                      <th className="px-3 py-2 text-center font-bold text-blue-600 uppercase tracking-wider text-[10px] border-r border-blue-100 whitespace-nowrap">Clinic Total</th>
                      <th className="px-3 py-2 text-center font-bold text-blue-600 uppercase tracking-wider text-[10px] border-r border-blue-100 whitespace-nowrap">Lab FootFall</th>
                      <th className="px-3 py-2 text-center font-bold text-blue-600 uppercase tracking-wider text-[10px] border-r border-blue-100 whitespace-nowrap">Lab Cash</th>
                      <th className="px-3 py-2 text-center font-bold text-blue-600 uppercase tracking-wider text-[10px] border-r border-blue-100 whitespace-nowrap">Lab Online</th>
                      <th className="px-3 py-2 text-center font-bold text-blue-600 uppercase tracking-wider text-[10px] border-r border-blue-100 whitespace-nowrap">Lab Due</th>
                      <th className="px-3 py-2 text-center font-bold text-blue-600 uppercase tracking-wider text-[10px] border-r border-blue-100 whitespace-nowrap">Lab Total</th>
                      <th className="px-3 py-2 text-center font-bold text-blue-600 uppercase tracking-wider text-[10px] border-r border-blue-100 whitespace-nowrap">Pharmacy FootFall</th>
                      <th className="px-3 py-2 text-center font-bold text-blue-600 uppercase tracking-wider text-[10px] border-r border-blue-100 whitespace-nowrap">Pharmacy Cash</th>
                      <th className="px-3 py-2 text-center font-bold text-blue-600 uppercase tracking-wider text-[10px] border-r border-blue-100 whitespace-nowrap">Pharmacy Online</th>
                      <th className="px-3 py-2 text-center font-bold text-blue-600 uppercase tracking-wider text-[10px] border-r border-blue-100 whitespace-nowrap">Pharmacy Due</th>
                      <th className="px-3 py-2 text-center font-bold text-blue-600 uppercase tracking-wider text-[10px] border-r border-blue-100 whitespace-nowrap">Pharmacy Total</th>
                      <th className="px-3 py-2 text-center font-bold text-emerald-700 uppercase tracking-wider text-[10px] border-r border-emerald-200 bg-emerald-50 whitespace-nowrap">Summary FootFall Total</th>
                      <th className="px-3 py-2 text-center font-bold text-emerald-700 uppercase tracking-wider text-[10px] border-r border-emerald-200 bg-emerald-50 whitespace-nowrap">Summary Cash Total</th>
                      <th className="px-3 py-2 text-center font-bold text-emerald-700 uppercase tracking-wider text-[10px] border-r border-emerald-200 bg-emerald-50 whitespace-nowrap">Summary Online Total</th>
                      <th className="px-3 py-2 text-center font-bold text-emerald-700 uppercase tracking-wider text-[10px] border-r border-emerald-200 bg-emerald-50 whitespace-nowrap">Summary Grand Total</th>
                      <th className="px-3 py-2 text-center font-bold text-purple-700 uppercase tracking-wider text-[10px] border-r border-purple-200 bg-purple-50 whitespace-nowrap">Bank Credit</th>
                      <th className="px-3 py-2 text-center font-bold text-indigo-700 uppercase tracking-wider text-[10px] border-r border-indigo-200 bg-indigo-50 whitespace-nowrap">Credited D/W</th>
                      <th className="px-3 py-2 text-center font-bold text-indigo-700 uppercase tracking-wider text-[10px] bg-indigo-50 whitespace-nowrap">D/W Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-blue-50/40">
                      <td className="px-3 py-2.5 text-center font-semibold text-slate-700 text-[11px] border-r border-slate-100 whitespace-nowrap bg-blue-50/40">
                        {formatDateToDDMMYYYY(fromDate)} – {formatDateToDDMMYYYY(toDate)}
                      </td>
                      <td className="px-3 py-2.5 text-center font-semibold text-slate-800 border-r border-slate-100">{data.clinic.footFall}</td>
                      <td className="px-3 py-2.5 text-center font-semibold text-emerald-600 border-r border-slate-100">{data.clinic.cash}</td>
                      <td className="px-3 py-2.5 text-center font-semibold text-sky-600 border-r border-slate-100">{data.clinic.online}</td>
                      <td className="px-3 py-2.5 text-center font-semibold text-rose-600 border-r border-slate-100">{data.clinic.due}</td>
                      <td className="px-3 py-2.5 text-center font-bold text-slate-900 border-r border-slate-100">{data.clinic.total}</td>
                      <td className="px-3 py-2.5 text-center font-semibold text-slate-800 border-r border-slate-100">{data.lab.footFall}</td>
                      <td className="px-3 py-2.5 text-center font-semibold text-emerald-600 border-r border-slate-100">{data.lab.cash}</td>
                      <td className="px-3 py-2.5 text-center font-semibold text-sky-600 border-r border-slate-100">{data.lab.online}</td>
                      <td className="px-3 py-2.5 text-center font-semibold text-rose-600 border-r border-slate-100">{data.lab.due}</td>
                      <td className="px-3 py-2.5 text-center font-bold text-slate-900 border-r border-slate-100">{data.lab.total}</td>
                      <td className="px-3 py-2.5 text-center font-semibold text-slate-800 border-r border-slate-100">{data.pharmacy.footFall}</td>
                      <td className="px-3 py-2.5 text-center font-semibold text-emerald-600 border-r border-slate-100">{data.pharmacy.cash}</td>
                      <td className="px-3 py-2.5 text-center font-semibold text-sky-600 border-r border-slate-100">{data.pharmacy.online}</td>
                      <td className="px-3 py-2.5 text-center font-semibold text-rose-600 border-r border-slate-100">{data.pharmacy.due}</td>
                      <td className="px-3 py-2.5 text-center font-bold text-slate-900 border-r border-slate-100">{data.pharmacy.total}</td>
                      <td className="px-3 py-2.5 text-center font-bold text-emerald-700 border-r border-emerald-100 bg-emerald-50/50">{data.grandTotal.footFall}</td>
                      <td className="px-3 py-2.5 text-center font-bold text-emerald-700 border-r border-emerald-100 bg-emerald-50/50">{data.grandTotal.cash}</td>
                      <td className="px-3 py-2.5 text-center font-bold text-emerald-700 border-r border-emerald-100 bg-emerald-50/50">{data.grandTotal.online}</td>
                      <td className="px-3 py-2.5 text-center font-black text-emerald-800 text-sm border-r border-emerald-100 bg-emerald-50/50">{data.grandTotal.total}</td>

                      {/* ✅ Bank Credit with LARGER input + Save button */}
                      <td className="px-3 py-2 border-r border-purple-100 bg-purple-50/50">
                        <div className="flex items-center gap-1.5 justify-center">
                          <input
                            type="number"
                            value={bankCredit}
                            onChange={(e) => setBankCredit(e.target.value)}
                            placeholder="0"
                            min="0"
                            className="w-[140px] text-center text-sm font-extrabold text-purple-700 bg-white border border-purple-300 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                          />
                          <button
                            type="button"
                            onClick={handleSaveClick}
                            disabled={!bankCredit || parseFloat(bankCredit) <= 0 || !hasUnsavedChange}
                            title={hasSavedValue && !hasUnsavedChange ? "Already saved" : "Save Bank Credit"}
                            className={`flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center transition-all shadow-sm ${
                              hasUnsavedChange && parseFloat(bankCredit) > 0
                                ? "bg-gradient-to-br from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 hover:scale-105"
                                : "bg-slate-100 text-slate-400 cursor-not-allowed"
                            }`}
                          >
                            <FaSave className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {hasSavedValue && (
                          <div className="mt-1 text-center text-[9px] font-bold text-emerald-600 flex items-center justify-center gap-1">
                            <FaCheckCircle className="w-2 h-2" /> Saved
                          </div>
                        )}
                      </td>

                      <td className={`px-3 py-2.5 text-center font-black text-sm border-r border-indigo-100 ${diffMeta.bg}`}>
                        <span className={diffMeta.color}>
                          {diffMeta.value === 0 && !bankCreditNum ? "—" : (Math.abs(creditedDiff) < 0.5 && bankCreditNum ? "0" : fmt(diffMeta.value))}
                        </span>
                      </td>
                      <td className={`px-3 py-2.5 text-center font-bold text-[10px] uppercase tracking-wider ${diffMeta.bg} ${diffMeta.color}`}>
                        {diffMeta.label}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Empty State */}
            {data.grandTotal.total === 0 && (
              <div className="flex flex-col items-center justify-center py-10 mt-3 bg-white rounded-lg border border-dashed border-blue-200 text-blue-400">
                <FiAlertCircle className="w-8 h-8" />
                <h3 className="text-sm font-bold text-blue-600 mt-2 mb-0.5">No revenue data found</h3>
                <p className="text-[11px] m-0">No bookings with revenue in the selected date range.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}