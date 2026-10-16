// src/Pages/RevenueAnalytics.jsx
// ✅ Revenue Analytics + Monthly Target Tracker
// 🆕 Edit Target → opens same FY grid modal with prefilled values
// 🆕 FY dropdown: 2020 se lo
// 🆕 Category cards: TOTAL labels bold
import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import {
  FaClinicMedical, FaFlask, FaPills, FaCalendarAlt, FaUsers,
  FaMoneyBillWave, FaChevronLeft, FaChevronRight,
  FaRupeeSign, FaCheckCircle, FaTimesCircle,
  FaGlobe, FaArrowUp, FaArrowDown, FaEquals, FaSave,
  FaBullseye, FaEdit,
} from "react-icons/fa";
import {
  FiRefreshCw, FiTrendingUp, FiAlertCircle, FiClock, FiFilter,
  FiDownload, FiTrash2, FiCheckCircle, FiXCircle, FiSearch,
  FiX, FiTarget, FiPlus, FiEye, FiEyeOff,
} from "react-icons/fi";

/* ============================================================ */
/* API Base URLs                                                 */
/* ============================================================ */
const TARGET_API_BASE = `${API_BASE_URL}/targetrev`;
const ANALYTICS_API_BASE = `${API_BASE_URL}/appointment-slots`;

/* ============================================================ */
/* Helpers                                                       */
/* ============================================================ */
const fmt = (n) => Number(n || 0).toLocaleString("en-IN");
const fmtAmt = (n) => `₹${fmt(n)}`;

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const FY_MONTH_ORDER = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];
const FY_MONTH_SHORT = {
  1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr", 5: "May", 6: "Jun",
  7: "Jul", 8: "Aug", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec",
};

const TARGET_CATEGORIES = [
  { key: "clinic", label: "Clinic", color: "blue", short: "CL" },
  { key: "lab", label: "Lab", color: "purple", short: "LB" },
  { key: "clinicPharmacy", label: "Clinic Pharmacy", color: "emerald", short: "CP" },
  { key: "retailPharmacy", label: "Retail Pharmacy", color: "amber", short: "RP" },
];

const CAT_HEADER_CLS = {
  blue: "bg-blue-700 border-blue-800",
  purple: "bg-purple-700 border-purple-800",
  emerald: "bg-emerald-700 border-emerald-800",
  amber: "bg-amber-600 border-amber-700",
};
const CAT_SUB_CLS = {
  blue: "bg-blue-50 text-blue-700 border-blue-100",
  purple: "bg-purple-50 text-purple-700 border-purple-100",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
  amber: "bg-amber-50 text-amber-700 border-amber-100",
};
const CAT_CELL_CLS = {
  blue: "bg-blue-50/30",
  purple: "bg-purple-50/30",
  emerald: "bg-emerald-50/30",
  amber: "bg-amber-50/30",
};

// 🆕 FY range start year — 2020 se
const FY_START_FROM = 2020;

const getCurrentFYStartYear = () => {
  const d = new Date();
  return d.getMonth() + 1 >= 4 ? d.getFullYear() : d.getFullYear() - 1;
};

const formatFY = (startYear) => `${startYear}-${String(startYear + 1).slice(-2)}`;

/**
 * Get FY start year given a calendar year and month.
 * Apr-Dec → year; Jan-Mar → year-1
 */
const getFYStartForMonth = (calendarYear, calendarMonth) => {
  return calendarMonth >= 4 ? calendarYear : calendarYear - 1;
};

const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate();
const pad = (n) => String(n).padStart(2, "0");
const fmtDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const formatDateToDDMMYYYY = (dateStr) => {
  if (!dateStr) return "";
  try {
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  } catch { return dateStr; }
};

const daysOverlapInMonth = (year, month, rangeStart, rangeEnd) => {
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);
  if (rangeEnd < monthStart || rangeStart > monthEnd) return 0;
  const start = rangeStart > monthStart ? rangeStart : monthStart;
  const end = rangeEnd < monthEnd ? rangeEnd : monthEnd;
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.max(0, Math.floor((e - s) / (1000 * 60 * 60 * 24)) + 1);
};

const normalizeAnalyticsData = (raw) => {
  if (!raw) return null;
  const cb = raw.categoryBreakdown || {};
  const build = (k) => ({
    total: Number(cb[k]?.total) || 0,
    cash: Number(cb[k]?.cash) || 0,
    online: Number(cb[k]?.online) || 0,
    card: Number(cb[k]?.card) || 0,
    insurance: Number(cb[k]?.insurance) || 0,
    due: Number(cb[k]?.due) || 0,
    footFall: Number(cb[k]?.footFall) || 0,
  });

  const rpFromBank = raw.bankCredit?.retailPharmacy || {};
  const rpFromCb = cb.retailPharmacy || {};
  const retailPharmacy = {
    total: Number(rpFromCb.total ?? rpFromBank.total) || 0,
    cash: Number(rpFromCb.cash ?? rpFromBank.cash) || 0,
    online: Number(rpFromCb.online ?? rpFromBank.online) || 0,
    card: Number(rpFromCb.card ?? rpFromBank.card) || 0,
    insurance: Number(rpFromCb.insurance ?? rpFromBank.insurance) || 0,
    due: Number(rpFromCb.due ?? rpFromBank.due) || 0,
    footFall: Number(rpFromCb.footFall ?? rpFromBank.footFall) || 0,
  };

  const rows = Array.isArray(raw.rows)
    ? raw.rows.map((r) => {
        const rcb = r.categoryBreakdown || {};
        const rBuild = (k) => ({
          total: Number(rcb[k]?.total) || 0,
          cash: Number(rcb[k]?.cash) || 0,
          online: Number(rcb[k]?.online) || 0,
          card: Number(rcb[k]?.card) || 0,
          insurance: Number(rcb[k]?.insurance) || 0,
          due: Number(rcb[k]?.due) || 0,
          footFall: Number(rcb[k]?.footFall) || 0,
        });
        const bank = r.bankCredit || null;
        const rp = bank?.retailPharmacy || {};
        return {
          date: r.date,
          label: r.label,
          year: r.year,
          month: r.month,
          count: r.count || 0,
          clinic: rBuild("clinic"),
          lab: rBuild("lab"),
          pharmacy: rBuild("pharmacy"),
          retailPharmacy: {
            cash: Number(rp.cash) || 0,
            online: Number(rp.online) || 0,
            footFall: Number(rp.footFall) || 0,
            total: (Number(rp.cash) || 0) + (Number(rp.online) || 0),
            due: 0, card: 0, insurance: 0,
          },
          bankCredit: bank?.bankCredit != null ? Number(bank.bankCredit) : null,
        };
      })
    : [];

  return {
    clinic: build("clinic"),
    lab: build("lab"),
    pharmacy: build("pharmacy"),
    retailPharmacy,
    rows,
    bankCredit: raw.bankCredit || null,
    dateRange: raw.dateRange || null,
  };
};

/* ============================================================ */
/* Month-Year Picker Popup                                       */
/* ============================================================ */
const MonthYearPickerPopup = ({
  isOpen, position, month, year, onMonthSelect, onClose,
}) => {
  const [viewYear, setViewYear] = useState(year || new Date().getFullYear());

  useEffect(() => {
    if (isOpen) setViewYear(year || new Date().getFullYear());
  }, [isOpen, year]);

  if (!isOpen) return null;

  const handleMonthClick = (mIdx) => {
    onMonthSelect(mIdx + 1, viewYear);
    onClose();
  };

  return (
    <div
      className="fixed z-[999999] w-[340px] bg-white border border-blue-200 rounded-lg shadow-2xl overflow-hidden"
      style={{ top: position.top, left: position.left }}
    >
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100 border-b border-slate-200">
        <button type="button" onClick={() => setViewYear((y) => y - 1)}
          className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-white rounded">
          <FaChevronLeft className="w-3 h-3" />
        </button>
        <div className="text-base font-bold text-slate-800">{viewYear}</div>
        <button type="button" onClick={() => setViewYear((y) => y + 1)}
          className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-white rounded">
          <FaChevronRight className="w-3 h-3" />
        </button>
      </div>
      <div className="grid grid-cols-4 gap-2 p-4">
        {MONTHS.map((mName, idx) => {
          const isSelected = month === idx + 1 && year === viewYear;
          return (
            <button key={mName} type="button" onClick={() => handleMonthClick(idx)}
              className={`py-2.5 text-xs font-bold rounded transition-all ${
                isSelected ? "bg-slate-700 text-white" : "text-slate-700 hover:bg-slate-100"
              }`}>
              {mName.slice(0, 3)}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ============================================================ */
/* Target Progress Strip                                        */
/* ============================================================ */
const TargetProgressStrip = ({ rangeTarget, achieved, hasTarget, rangeLabel = "Target" }) => {
  if (!hasTarget || rangeTarget <= 0) return null;

  const diff = achieved - rangeTarget;
  const pct = rangeTarget > 0 ? (achieved / rangeTarget) * 100 : 0;
  const diffAbs = Math.abs(diff);

  let statusLabel = "PENDING";
  let statusColor = "text-slate-500";
  let barColor = "bg-slate-400";

  if (diffAbs < 0.5) {
    statusLabel = "MATCHED";
    statusColor = "text-emerald-700";
    barColor = "bg-emerald-500";
  } else if (diff > 0) {
    statusLabel = "EXCEEDED";
    statusColor = "text-blue-700";
    barColor = "bg-blue-500";
  } else {
    statusLabel = "SHORTFALL";
    statusColor = "text-rose-700";
    barColor = "bg-rose-500";
  }

  const barWidth = Math.min(pct, 100);

  return (
    <div className="mt-2.5 pt-2 border-t border-slate-200/70">
      <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wide mb-1.5">
        <span className="text-slate-500">{rangeLabel}</span>
        <span className={statusColor}>{statusLabel}</span>
      </div>
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-[11px] font-black text-slate-800">₹{fmt(Math.round(rangeTarget))}</span>
        <span className={`text-[10px] font-black ${statusColor}`}>{pct.toFixed(0)}%</span>
      </div>
      <div className="w-full h-1 rounded-full bg-slate-200 overflow-hidden">
        <div className={`h-full ${barColor} transition-all`} style={{ width: `${barWidth}%` }} />
      </div>
      {diffAbs >= 0.5 && (
        <div className={`text-[9px] font-bold mt-1 ${statusColor}`}>
          {diff > 0 ? `+₹${fmt(Math.round(diffAbs))} surplus` : `−₹${fmt(Math.round(diffAbs))} short`}
        </div>
      )}
    </div>
  );
};

/* ============================================================ */
/* Category Card                                                 */
/* ============================================================ */
const CategoryCard = ({
  title, icon, footfall, total, data, accent = "blue",
  rangeTarget = 0, hasTarget = false, rangeLabel = "Target",
}) => {
  const metrics = [
    { label: "Cash", key: "cash", icon: FaMoneyBillWave, color: "text-emerald-600" },
    { label: "Online", key: "online", icon: FaGlobe, color: "text-sky-600" },
    { label: "Due", key: "due", icon: FaTimesCircle, color: "text-rose-600" },
  ];
  const accentMap = {
    blue: { box: "bg-blue-50 text-blue-600", border: "border-slate-200", title: "text-slate-700" },
    purple: { box: "bg-purple-50 text-purple-600", border: "border-slate-200", title: "text-slate-700" },
    emerald: { box: "bg-emerald-50 text-emerald-600", border: "border-slate-200", title: "text-slate-700" },
    amber: { box: "bg-amber-50 text-amber-600", border: "border-amber-300", title: "text-slate-700" },
  };
  const a = accentMap[accent] || accentMap.blue;

  return (
    <div className={`bg-white rounded-lg border p-3 hover:border-blue-300 transition-colors ${a.border}`}>
      <div className="flex items-start gap-2 mb-2">
        <span className={`w-8 h-8 rounded-md flex items-center justify-center text-sm flex-shrink-0 ${a.box}`}>{icon}</span>
        <div className={`text-[12px] font-black uppercase tracking-wider leading-8 ${a.title}`}>{title}</div>
      </div>
      <div className="space-y-1 mb-2.5">
        {/* 🆕 TOTAL labels bold (font-black already) */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-black text-slate-800 uppercase tracking-wide">{title.toUpperCase()} TOTAL:</span>
          <span className="text-[14px] font-black text-slate-900">{fmtAmt(total)}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-black text-slate-800 uppercase tracking-wide">FOOTFALL TOTAL:</span>
          <span className="text-[14px] font-black text-slate-900">{footfall}</span>
        </div>
      </div>
      <div className="space-y-1 pt-2 border-t border-slate-100">
        {metrics.map((m) => {
          const Icon = m.icon;
          const val = Number(data[m.key]) || 0;
          return (
            <div key={m.key} className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-600 font-bold">
                <Icon className={`w-2.5 h-2.5 ${m.color}`} /> {m.label}
              </span>
              <span className={`font-black ${m.color}`}>{fmtAmt(val)}</span>
            </div>
          );
        })}
      </div>
      {hasTarget && (
        <TargetProgressStrip rangeTarget={rangeTarget} achieved={total} hasTarget={hasTarget} rangeLabel={rangeLabel} />
      )}
    </div>
  );
};

/* ============================================================ */
/* Grand Total Card                                              */
/* ============================================================ */
const GrandTotalCard = ({
  total, cash, online, due, footFall,
  rangeTarget = 0, hasTarget = false, rangeLabel = "Target",
}) => {
  const diff = total - rangeTarget;
  const pct = rangeTarget > 0 ? (total / rangeTarget) * 100 : 0;
  const diffAbs = Math.abs(diff);
  const barWidth = Math.min(pct, 100);

  let statusLabel = "PENDING";
  let barColor = "bg-white/60";
  if (rangeTarget > 0) {
    if (diffAbs < 0.5) { statusLabel = "MATCHED"; barColor = "bg-emerald-300"; }
    else if (diff > 0) { statusLabel = "EXCEEDED"; barColor = "bg-cyan-300"; }
    else { statusLabel = "SHORTFALL"; barColor = "bg-rose-300"; }
  }

  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-3 text-white shadow-md shadow-blue-500/20">
      <div className="flex items-start gap-2 mb-2">
        <span className="w-8 h-8 rounded-md bg-white/20 flex items-center justify-center text-sm flex-shrink-0">
          <FaRupeeSign />
        </span>
        <div className="text-[12px] font-black uppercase tracking-wider leading-8 text-white">Grand Total</div>
      </div>
      <div className="space-y-1 mb-2.5">
        {/* 🆕 TOTAL labels bold (font-black already) */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-black text-white uppercase tracking-wide">GRAND TOTAL:</span>
          <span className="text-[14px] font-black text-white">{fmtAmt(total)}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-black text-white uppercase tracking-wide">FOOTFALL TOTAL:</span>
          <span className="text-[14px] font-black text-white">{footFall}</span>
        </div>
      </div>
      <div className="space-y-1 pt-2 border-t border-white/20">
        {[
          { label: "Cash", val: cash, isDue: false },
          { label: "Online", val: online, isDue: false },
          { label: "Due", val: due, isDue: true },
        ].map((m) => (
          <div key={m.label} className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 text-white/80 font-bold">{m.label}</span>
            <span className={`font-black ${m.isDue ? "text-rose-200" : "text-white"}`}>{fmtAmt(m.val)}</span>
          </div>
        ))}
      </div>
      {hasTarget && rangeTarget > 0 && (
        <div className="mt-2.5 pt-2 border-t border-white/20">
          <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wide mb-1.5">
            <span className="text-white/70">{rangeLabel}</span>
            <span className="text-white">{statusLabel}</span>
          </div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-black text-white">₹{fmt(Math.round(rangeTarget))}</span>
            <span className="text-[10px] font-black text-white/90">{pct.toFixed(0)}%</span>
          </div>
          <div className="w-full h-1 rounded-full bg-white/20 overflow-hidden">
            <div className={`h-full ${barColor}`} style={{ width: `${barWidth}%` }} />
          </div>
          {diffAbs >= 0.5 && (
            <div className="text-[9px] font-bold mt-1 text-white/90">
              {diff > 0 ? `+₹${fmt(Math.round(diffAbs))} surplus` : `−₹${fmt(Math.round(diffAbs))} short`}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ============================================================ */
/* Add/Edit Target Modal — FY grid (supports editTarget)        */
/* 🆕 FY dropdown: 2020 → current + 2                            */
/* ============================================================ */
const AddTargetModal = ({
  isOpen, onClose, onSave, saving,
  editTarget = null,
}) => {
  const isEditMode = !!editTarget;

  const defaultFYStart = isEditMode
    ? getFYStartForMonth(Number(editTarget.year), Number(editTarget.month))
    : getCurrentFYStartYear();

  const [fyStartYear, setFyStartYear] = useState(defaultFYStart);
  const [grid, setGrid] = useState({});
  const [fyError, setFyError] = useState("");

  const currentFYStart = getCurrentFYStartYear();

  // 🆕 FY options: 2020 → current + 2
  const fyOptions = useMemo(() => {
    const arr = [];
    const endYear = currentFYStart + 2;
    for (let y = FY_START_FROM; y <= endYear; y++) arr.push(y);
    // Ensure edit target's FY is in the list
    if (isEditMode && !arr.includes(defaultFYStart)) {
      arr.push(defaultFYStart);
      arr.sort((a, b) => a - b);
    }
    return arr;
  }, [currentFYStart, isEditMode, defaultFYStart]);

  // Initialize grid on open
  useEffect(() => {
    if (isOpen) {
      setFyError("");
      setFyStartYear(defaultFYStart);
      const emptyGrid = {};
      TARGET_CATEGORIES.forEach((c) => {
        emptyGrid[c.key] = {};
        FY_MONTH_ORDER.forEach((m) => { emptyGrid[c.key][m] = ""; });
      });

      if (isEditMode && editTarget) {
        const editMonth = Number(editTarget.month);
        const editYear = Number(editTarget.year);
        const editFYStart = getFYStartForMonth(editYear, editMonth);
        if (editFYStart === defaultFYStart) {
          TARGET_CATEGORIES.forEach((cat) => {
            const val = Number(editTarget.categories?.[cat.key]) || 0;
            if (val > 0) {
              emptyGrid[cat.key][editMonth] = String(Math.round(val));
            }
          });
        }
      }

      setGrid(emptyGrid);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, editTarget]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    const entries = [];
    let totalAmt = 0;
    TARGET_CATEGORIES.forEach((cat) => {
      FY_MONTH_ORDER.forEach((m) => {
        const raw = grid?.[cat.key]?.[m];
        const val = Number(raw);
        if (val > 0) {
          const calendarYear = m >= 4 ? fyStartYear : fyStartYear + 1;
          entries.push({ category: cat.key, month: m, year: calendarYear, amount: val });
          totalAmt += val;
        }
      });
    });
    if (entries.length === 0) {
      setFyError("Please enter at least one amount in the grid");
      return;
    }
    setFyError("");
    onSave({
      mode: isEditMode ? "edit" : "fy",
      fyStartYear,
      entries,
      totalAmount: totalAmt,
      editTarget: isEditMode ? editTarget : null,
    });
  };

  const handleGridChange = (catKey, month, value) => {
    setGrid((prev) => ({ ...prev, [catKey]: { ...(prev[catKey] || {}), [month]: value } }));
  };
  const getCategoryTotal = (catKey) => {
    let sum = 0;
    FY_MONTH_ORDER.forEach((m) => { sum += Number(grid?.[catKey]?.[m]) || 0; });
    return sum;
  };
  const getMonthTotal = (month) => {
    let sum = 0;
    TARGET_CATEGORIES.forEach((c) => { sum += Number(grid?.[c.key]?.[month]) || 0; });
    return sum;
  };
  const getGrandTotal = () => {
    let sum = 0;
    TARGET_CATEGORIES.forEach((c) => { sum += getCategoryTotal(c.key); });
    return sum;
  };
  const colorMap = {
    blue: "text-blue-700 bg-blue-50 border-blue-200",
    purple: "text-purple-700 bg-purple-50 border-purple-200",
    emerald: "text-emerald-700 bg-emerald-50 border-emerald-200",
    amber: "text-amber-700 bg-amber-50 border-amber-200",
  };

  const editMonth = isEditMode ? Number(editTarget.month) : null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[999999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl shadow-2xl border border-purple-200 overflow-hidden">
        <div className={`px-5 py-4 text-white flex items-center gap-3 ${isEditMode ? "bg-gradient-to-r from-blue-600 to-indigo-600" : "bg-gradient-to-r from-purple-600 to-indigo-600"}`}>
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            {isEditMode ? <FaEdit className="w-5 h-5" /> : <FiTarget className="w-5 h-5" />}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm m-0">
              {isEditMode
                ? `Edit Target for ${MONTHS[editMonth - 1]} ${editTarget.year}`
                : "Set Your Target"}
            </h3>
            <p className="text-[10px] text-white/80 m-0 mt-0.5">
              {isEditMode
                ? "Update the target values for this month (or any other month in the FY)"
                : "Enter targets for the full Financial Year (Apr → Mar)"}
            </p>
          </div>
          <button type="button" onClick={onClose} disabled={saving}
            className="w-7 h-7 rounded-md flex items-center justify-center text-white/80 hover:bg-white/20 hover:text-white disabled:opacity-50">
            <FiX className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-bold text-purple-700 uppercase">Financial Year:</label>
              <select value={fyStartYear} onChange={(e) => setFyStartYear(Number(e.target.value))}
                disabled={isEditMode}
                className="h-9 text-xs font-bold text-purple-800 bg-white border border-purple-300 rounded px-3 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 disabled:bg-slate-100 disabled:text-slate-500">
                {fyOptions.map((y) => (<option key={y} value={y}>FY {formatFY(y)}</option>))}
              </select>
            </div>
            <div className="text-[10px] font-semibold text-slate-500">
              ({FY_MONTH_SHORT[4]} {fyStartYear} → {FY_MONTH_SHORT[3]} {fyStartYear + 1})
            </div>
            {isEditMode && (
              <div className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded">
                Editing: {MONTHS[editMonth - 1]} {editTarget.year}
              </div>
            )}
          </div>

          <div className="border border-purple-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse" style={{ minWidth: "1100px" }}>
                <thead>
                  <tr>
                    <th className="px-2 py-2 text-center font-bold text-white uppercase tracking-wider text-[10px] border-r border-purple-700 bg-purple-700 sticky left-0 z-10 whitespace-nowrap">
                      Category
                    </th>
                    {FY_MONTH_ORDER.map((m) => {
                      const yr = m >= 4 ? fyStartYear : fyStartYear + 1;
                      const isEditCol = isEditMode && m === editMonth;
                      return (
                        <th key={m} className={`px-1.5 py-2 text-center font-bold uppercase tracking-wider text-[10px] border-r whitespace-nowrap ${
                          isEditCol ? "text-white bg-blue-700 border-blue-800" : "text-purple-800 bg-purple-50 border-purple-200"
                        }`}>
                          {FY_MONTH_SHORT[m]}
                          <div className={`text-[8px] font-semibold normal-case mt-0.5 ${isEditCol ? "text-white/90" : "text-purple-500"}`}>
                            {String(yr).slice(-2)}
                          </div>
                        </th>
                      );
                    })}
                    <th className="px-2 py-2 text-center font-bold text-white uppercase tracking-wider text-[10px] bg-indigo-700 whitespace-nowrap">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {TARGET_CATEGORIES.map((cat) => {
                    const catTotal = getCategoryTotal(cat.key);
                    const cm = colorMap[cat.color] || colorMap.blue;
                    return (
                      <tr key={cat.key} className="hover:bg-slate-50">
                        <td className={`px-3 py-2 text-center font-bold text-[11px] border-r border-slate-200 border-b sticky left-0 z-10 whitespace-nowrap ${cm}`}>
                          {cat.label}
                        </td>
                        {FY_MONTH_ORDER.map((m) => {
                          const isEditCol = isEditMode && m === editMonth;
                          return (
                            <td key={m} className={`px-1 py-1.5 border-r border-b text-center ${
                              isEditCol ? "bg-blue-50" : "bg-white"
                            }`}>
                              <input type="number" min="0" placeholder="0"
                                value={grid?.[cat.key]?.[m] ?? ""}
                                onChange={(e) => handleGridChange(cat.key, m, e.target.value)}
                                className={`w-[78px] text-center text-[11px] font-bold text-slate-800 bg-white border rounded px-1 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 ${
                                  isEditCol ? "border-blue-400" : "border-slate-300"
                                }`} />
                            </td>
                          );
                        })}
                        <td className="px-2 py-2 text-center font-black text-indigo-800 text-xs bg-indigo-50 border-b whitespace-nowrap">
                          {catTotal > 0 ? fmtAmt(catTotal) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-gradient-to-r from-slate-100 to-slate-50">
                    <td className="px-3 py-2 text-center font-black text-slate-900 text-[10px] uppercase tracking-wider border-r border-slate-300 bg-slate-200 sticky left-0 z-10 whitespace-nowrap">
                      Month Total
                    </td>
                    {FY_MONTH_ORDER.map((m) => {
                      const mt = getMonthTotal(m);
                      const isEditCol = isEditMode && m === editMonth;
                      return (
                        <td key={m} className={`px-1 py-2 text-center font-black text-slate-800 text-[10px] border-r border-slate-200 whitespace-nowrap ${
                          isEditCol ? "bg-blue-100" : "bg-slate-100"
                        }`}>
                          {mt > 0 ? fmt(mt) : "—"}
                        </td>
                      );
                    })}
                    <td className="px-2 py-2 text-center font-black text-indigo-900 text-xs bg-indigo-200 whitespace-nowrap">
                      {getGrandTotal() > 0 ? fmtAmt(getGrandTotal()) : "—"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {fyError && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-rose-600">
              <FiAlertCircle className="w-3 h-3" /> {fyError}
            </div>
          )}

          <div className="bg-purple-50 rounded-lg border border-purple-200 p-2.5 text-[11px] text-purple-700 flex items-center justify-between flex-wrap gap-2">
            <span>
              <span className="font-bold">FY {formatFY(fyStartYear)}</span> — Total across all categories:
            </span>
            <span className="font-extrabold text-sm">{fmtAmt(getGrandTotal())}</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 bg-slate-50 border-t border-slate-200">
          <button type="button" onClick={onClose} disabled={saving}
            className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} disabled={saving}
            className={`px-5 py-2 text-xs font-bold text-white rounded-lg shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 ${
              isEditMode
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            }`}>
            {saving ? <FiRefreshCw className="w-3 h-3 animate-spin" /> : <FaSave className="w-3 h-3" />}
            {saving
              ? (isEditMode ? "Updating..." : "Saving...")
              : (isEditMode ? `Update Targets` : `Save FY ${formatFY(fyStartYear)} Targets`)}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ============================================================ */
/* Small helpers                                                 */
/* ============================================================ */
const getRowStatus = (hasAch, amt, d, dAbs) => {
  if (!hasAch) return { label: "PENDING", color: "text-slate-400", bg: "bg-slate-50", icon: FiClock, border: "border-slate-200" };
  if (!amt || amt === 0) return { label: "—", color: "text-slate-400", bg: "bg-slate-50", icon: FaEquals, border: "border-slate-200" };
  if (dAbs < 0.5) return { label: "ACHIEVED", color: "text-emerald-700", bg: "bg-emerald-50", icon: FaEquals, border: "border-emerald-200" };
  if (d > 0) return { label: "EXCEEDED", color: "text-blue-700", bg: "bg-blue-50", icon: FaArrowUp, border: "border-blue-200" };
  return { label: "SHORTFALL", color: "text-rose-700", bg: "bg-rose-50", icon: FaArrowDown, border: "border-rose-200" };
};

const filterRowsByRange = (rows, fromDate, toDate) => {
  if (!Array.isArray(rows)) return [];
  if (!fromDate || !toDate) return rows;
  return rows.filter((r) => {
    if (!r.date) return false;
    return r.date >= fromDate && r.date <= toDate;
  });
};

const sumCategoryFromRows = (rows) => {
  const acc = { clinic: 0, lab: 0, clinicPharmacy: 0, retailPharmacy: 0, total: 0 };
  if (!Array.isArray(rows)) return acc;
  rows.forEach((r) => {
    acc.clinic += Number(r.clinic?.total) || 0;
    acc.lab += Number(r.lab?.total) || 0;
    acc.clinicPharmacy += Number(r.pharmacy?.total) || 0;
    acc.retailPharmacy += Number(r.retailPharmacy?.total) || 0;
  });
  acc.total = acc.clinic + acc.lab + acc.clinicPharmacy + acc.retailPharmacy;
  return acc;
};

/* ============================================================ */
/* Target Tracker                                                */
/* ============================================================ */
const TargetTracker = ({
  onSetTargetClick,
  allTargets, loadingAllTargets, onEditRow, onDeleteRow,
  isHidden, onToggleHidden,
  fromDate, toDate, activePreset,
  rangeAchieved = { clinic: 0, lab: 0, clinicPharmacy: 0, retailPharmacy: 0, total: 0, hasData: false },
}) => {

  const filteredTargets = useMemo(() => {
    if (!allTargets || allTargets.length === 0) return [];
    if (!fromDate || !toDate) return [];

    const rangeStart = new Date(fromDate + "T00:00:00");
    const rangeEnd = new Date(toDate + "T23:59:59");

    const monthMap = new Map();
    allTargets.forEach((t) => {
      const m = Number(t.month);
      const y = Number(t.year);
      const key = `${y}-${m}`;
      if (!monthMap.has(key)) {
        monthMap.set(key, {
          year: y, month: m,
          categories: {},
          ids: [],
          savedAt: t.savedAt,
        });
      }
      const g = monthMap.get(key);
      if (t.category) {
        if (!g.categories[t.category]) g.categories[t.category] = { amount: 0, ids: [] };
        g.categories[t.category].amount += Number(t.amount) || 0;
        g.categories[t.category].ids.push(t._id);
      }
      if (t._id && !g.ids.includes(t._id)) g.ids.push(t._id);
      if (t.savedAt && (!g.savedAt || new Date(t.savedAt) > new Date(g.savedAt))) g.savedAt = t.savedAt;
    });

    const out = [];
    monthMap.forEach((g) => {
      const dim = getDaysInMonth(g.year, g.month);
      const daysInRange = daysOverlapInMonth(g.year, g.month, rangeStart, rangeEnd);
      if (daysInRange <= 0) return;

      const ratio = dim > 0 ? daysInRange / dim : 0;

      const scaledCategories = {};
      let totalScaled = 0;
      Object.keys(g.categories).forEach((ck) => {
        const amt = g.categories[ck].amount * ratio;
        scaledCategories[ck] = { amount: amt, ids: g.categories[ck].ids };
        totalScaled += amt;
      });

      out.push({
        _id: g.ids[0],
        ids: g.ids,
        month: g.month,
        year: g.year,
        amount: totalScaled,
        categories: scaledCategories,
        daysInRange,
        daysInMonth: dim,
        ratio,
        savedAt: g.savedAt,
      });
    });

    return out.sort((a, b) => {
      if (Number(b.year) !== Number(a.year)) return Number(b.year) - Number(a.year);
      return Number(b.month) - Number(a.month);
    });
  }, [allTargets, fromDate, toDate]);

  const rangeLabel = useMemo(() => {
    if (activePreset === "today") return "Today's Target";
    if (activePreset === "yesterday") return "Yesterday's Target";
    if (activePreset === "thisWeek") return "This Week's Target";
    if (activePreset === "thisMonth") return "This Month's Target";
    if (activePreset === "lastMonth") return "Last Month's Target";
    if (activePreset === "thisYear") return "This Year's Target";
    return "Range Target";
  }, [activePreset]);

  const getDateLabelForRow = (t) => {
    if (activePreset === "today" || activePreset === "yesterday") {
      return formatDateToDDMMYYYY(fromDate);
    }
    if (activePreset === "thisWeek" || activePreset === "thisMonth" ||
        activePreset === "lastMonth" || activePreset === "thisYear") {
      return `${FY_MONTH_SHORT[t.month]}-${t.year}`;
    }
    return `${formatDateToDDMMYYYY(fromDate)} – ${formatDateToDDMMYYYY(toDate)}`;
  };

  return (
    <div className="bg-white rounded-lg border border-purple-200 overflow-hidden shadow-sm mb-3">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-3 py-2 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-white">
          <FiTarget className="w-4 h-4" />
          <h2 className="text-sm font-bold m-0">Monthly Target Tracker</h2>
          <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded">
            {filteredTargets.length} month{filteredTargets.length !== 1 ? "s" : ""} · {rangeLabel}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={onSetTargetClick}
            className="px-3 py-1.5 text-[11px] font-bold text-purple-700 bg-white rounded-md hover:bg-purple-50 flex items-center gap-1.5 shadow-sm">
            <FiPlus className="w-3 h-3" /> Set Your Target
          </button>
          <button type="button" onClick={onToggleHidden} title={isHidden ? "Show targets" : "Hide targets"}
            className="px-2.5 py-1.5 text-[10px] font-bold text-white bg-white/20 rounded hover:bg-white/30 flex items-center gap-1">
            {isHidden ? <FiEye className="w-3 h-3" /> : <FiEyeOff className="w-3 h-3" />}
            {isHidden ? "Show" : "Hide"}
          </button>
        </div>
      </div>

      {!isHidden && (
        <div className="p-3 overflow-x-auto">
          {loadingAllTargets && (!allTargets || allTargets.length === 0) ? (
            <div className="flex items-center justify-center py-8 text-slate-500">
              <FiRefreshCw className="w-5 h-5 text-purple-500 animate-spin mr-2" />
              <span className="text-xs font-medium">Loading targets...</span>
            </div>
          ) : filteredTargets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <FaBullseye className="w-10 h-10 mb-2 text-purple-300" />
              <p className="text-xs font-bold text-purple-600 m-0 mb-0.5">No targets for this period</p>
              <p className="text-[11px] font-medium m-0 mb-3">
                {allTargets && allTargets.length > 0
                  ? "No targets set for the selected date range."
                  : "Click 'Set Your Target' to add your first target."}
              </p>
              {(!allTargets || allTargets.length === 0) && (
                <button type="button" onClick={onSetTargetClick}
                  className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-700 hover:to-indigo-700 shadow-md flex items-center gap-1.5">
                  <FiPlus className="w-3 h-3" /> Set Your Target
                </button>
              )}
            </div>
          ) : (
            <table className="w-full border-collapse text-xs" style={{ minWidth: "1700px" }}>
              <thead>
                <tr>
                  <th className="px-2 py-2 text-center font-bold text-white uppercase tracking-wider text-[10px] border-r border-blue-800 bg-blue-900"
                    rowSpan={2} style={{ minWidth: "130px" }}>
                    {activePreset === "today" || activePreset === "yesterday" ? "Date" : "Month"}
                  </th>
                  {TARGET_CATEGORIES.map((cat) => (
                    <th key={cat.key} colSpan={5}
                      className={`px-2 py-2 text-center font-bold text-white uppercase tracking-wider text-[10px] border-r ${CAT_HEADER_CLS[cat.color]} whitespace-nowrap`}>
                      {cat.label}
                    </th>
                  ))}
                  <th className="px-2 py-2 text-center font-bold text-white uppercase tracking-wider text-[10px] bg-indigo-700 border-r border-indigo-800 whitespace-nowrap"
                    colSpan={4}>
                    Summary
                  </th>
                  <th className="px-2 py-2 text-center font-bold text-white uppercase tracking-wider text-[10px] bg-slate-800"
                    rowSpan={2} style={{ minWidth: "80px" }}>
                    Actions
                  </th>
                </tr>
                <tr>
                  {TARGET_CATEGORIES.map((cat) => (
                    <React.Fragment key={cat.key}>
                      <th className={`px-1.5 py-1.5 text-center font-bold uppercase tracking-wider text-[9px] border-r ${CAT_SUB_CLS[cat.color]} whitespace-nowrap`}>Target</th>
                      <th className={`px-1.5 py-1.5 text-center font-bold uppercase tracking-wider text-[9px] border-r ${CAT_SUB_CLS[cat.color]} whitespace-nowrap`}>Achieved</th>
                      <th className={`px-1.5 py-1.5 text-center font-bold uppercase tracking-wider text-[9px] border-r ${CAT_SUB_CLS[cat.color]} whitespace-nowrap`}>Ach %</th>
                      <th className={`px-1.5 py-1.5 text-center font-bold uppercase tracking-wider text-[9px] border-r ${CAT_SUB_CLS[cat.color]} whitespace-nowrap`}>Per Day</th>
                      <th className={`px-1.5 py-1.5 text-center font-bold uppercase tracking-wider text-[9px] border-r ${CAT_SUB_CLS[cat.color]} whitespace-nowrap`}>Short/Surp</th>
                    </React.Fragment>
                  ))}
                  <th className="px-1.5 py-1.5 text-center font-bold text-indigo-700 uppercase tracking-wider text-[9px] border-r border-indigo-100 bg-indigo-50 whitespace-nowrap">Target</th>
                  <th className="px-1.5 py-1.5 text-center font-bold text-indigo-700 uppercase tracking-wider text-[9px] border-r border-indigo-100 bg-indigo-50 whitespace-nowrap">Achieved</th>
                  <th className="px-1.5 py-1.5 text-center font-bold text-indigo-700 uppercase tracking-wider text-[9px] border-r border-indigo-100 bg-indigo-50 whitespace-nowrap">Ach %</th>
                  <th className="px-1.5 py-1.5 text-center font-bold text-indigo-700 uppercase tracking-wider text-[9px] border-r border-indigo-200 bg-indigo-50 whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTargets.map((t) => {
                  const m = Number(t.month);
                  const y = Number(t.year);
                  const totalTarget = Number(t.amount) || 0;
                  const catAchMap = {
                    clinic: rangeAchieved.clinic || 0,
                    lab: rangeAchieved.lab || 0,
                    clinicPharmacy: rangeAchieved.clinicPharmacy || 0,
                    retailPharmacy: rangeAchieved.retailPharmacy || 0,
                  };
                  const totalAch = rangeAchieved.total || 0;
                  const hasAch = rangeAchieved.hasData === true;

                  const rowDiff = totalAch - totalTarget;
                  const rowDiffAbs = Math.abs(rowDiff);
                  const rowPct = totalTarget > 0 ? (totalAch / totalTarget) * 100 : 0;
                  const rowStatus = getRowStatus(hasAch, totalTarget, rowDiff, rowDiffAbs);

                  return (
                    <tr key={`${y}-${m}`} className="hover:bg-slate-50/60 border-b border-slate-200">
                      <td className="px-2 py-2.5 text-center font-bold text-slate-800 text-[11px] border-r border-slate-200 bg-slate-50 whitespace-nowrap">
                        <div className="text-purple-700">{getDateLabelForRow(t)}</div>
                        <div className="text-[9px] font-semibold text-slate-400 mt-0.5">
                          ({t.daysInRange}/{t.daysInMonth} days)
                        </div>
                      </td>

                      {TARGET_CATEGORIES.map((cat) => {
                        const catTarget = Number(t.categories?.[cat.key]?.amount) || 0;
                        const catAch = catAchMap[cat.key] || 0;
                        const catDiff = catAch - catTarget;
                        const catDiffAbs = Math.abs(catDiff);
                        const catPct = catTarget > 0 ? (catAch / catTarget) * 100 : 0;
                        const catPerDay = t.daysInRange > 0 ? catTarget / t.daysInRange : 0;
                        const catDiffColor = !hasAch ? "text-slate-400"
                          : catDiffAbs < 0.5 ? "text-emerald-700"
                          : catDiff > 0 ? "text-blue-700" : "text-rose-700";

                        return (
                          <React.Fragment key={cat.key}>
                            <td className={`px-1.5 py-2.5 text-center font-extrabold text-purple-800 text-[11px] border-r ${CAT_CELL_CLS[cat.color]} whitespace-nowrap`}>
                              {catTarget > 0 ? fmtAmt(Math.round(catTarget)) : "—"}
                            </td>
                            <td className={`px-1.5 py-2.5 text-center font-extrabold text-emerald-700 text-[11px] border-r ${CAT_CELL_CLS[cat.color]} whitespace-nowrap`}>
                              {hasAch ? (catAch > 0 ? fmtAmt(Math.round(catAch)) : "—") : "—"}
                            </td>
                            <td className={`px-1.5 py-2.5 text-center font-bold text-[10px] border-r ${CAT_CELL_CLS[cat.color]} whitespace-nowrap ${catDiffColor}`}>
                              {hasAch && catTarget > 0 ? `${catPct.toFixed(1)}%` : "—"}
                            </td>
                            <td className={`px-1.5 py-2.5 text-center font-bold text-slate-700 text-[10px] border-r ${CAT_CELL_CLS[cat.color]} whitespace-nowrap`}>
                              {catPerDay > 0 ? fmtAmt(Math.round(catPerDay)) : "—"}
                            </td>
                            <td className={`px-1.5 py-2.5 text-center font-extrabold text-[10px] border-r ${CAT_CELL_CLS[cat.color]} whitespace-nowrap ${catDiffColor}`}>
                              {hasAch ? (
                                catDiffAbs < 0.5 ? "—" : (
                                  <>
                                    {fmtAmt(Math.round(catDiffAbs))}
                                    <div className="text-[8px] font-normal opacity-80 mt-0.5">
                                      {catDiff > 0 ? "Surplus" : "Short"}
                                    </div>
                                  </>
                                )
                              ) : "—"}
                            </td>
                          </React.Fragment>
                        );
                      })}

                      <td className="px-2 py-2.5 text-center font-extrabold text-purple-800 text-xs border-r border-indigo-100 bg-indigo-50/50 whitespace-nowrap">
                        {fmtAmt(Math.round(totalTarget))}
                      </td>
                      <td className="px-2 py-2.5 text-center font-extrabold text-emerald-700 text-xs border-r border-indigo-100 bg-indigo-50/50 whitespace-nowrap">
                        {hasAch ? fmtAmt(Math.round(totalAch)) : "—"}
                      </td>
                      <td className={`px-2 py-2.5 text-center font-black text-xs border-r border-indigo-100 bg-indigo-50/50 whitespace-nowrap ${rowStatus.color}`}>
                        {hasAch ? `${rowPct.toFixed(1)}%` : "—"}
                      </td>
                      <td className={`px-2 py-2.5 text-center font-black text-[10px] uppercase tracking-wider border-r border-indigo-200 bg-indigo-50/50 whitespace-nowrap ${rowStatus.color}`}>
                        {hasAch ? (
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border ${rowStatus.bg} ${rowStatus.border}`}>
                            {React.createElement(rowStatus.icon, { className: "w-2.5 h-2.5" })}
                            {rowStatus.label}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border bg-slate-50 text-slate-400 border-slate-200">
                            <FiClock className="w-2.5 h-2.5" /> PENDING
                          </span>
                        )}
                      </td>

                      <td className="px-2 py-2 text-center border-slate-200 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button type="button" onClick={() => onEditRow(t)} title="Edit"
                            className="w-7 h-7 rounded-md flex items-center justify-center text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100">
                            <FaEdit className="w-3 h-3" />
                          </button>
                          <button type="button" onClick={() => onDeleteRow(t)} title="Delete"
                            className="w-7 h-7 rounded-md flex items-center justify-center text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100">
                            <FiTrash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

/* ============================================================ */
/* Main Component                                                */
/* ============================================================ */
export default function RevenueAnalytics() {
  const today = new Date().toISOString().split("T")[0];
  const now = new Date();

  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [activePreset, setActivePreset] = useState("today");

  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [monthPickerPos, setMonthPickerPos] = useState({ top: 0, left: 0 });

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [bankCredit, setBankCredit] = useState("");
  const [savedBankCredit, setSavedBankCredit] = useState(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [savingBankCredit, setSavingBankCredit] = useState(false);

  const [retailInput, setRetailInput] = useState({ cash: "", online: "", footFall: "" });
  const [rowInputs, setRowInputs] = useState({});
  const [savingRowKey, setSavingRowKey] = useState(null);

  const [savedTarget, setSavedTarget] = useState(null);
  const [savingTarget, setSavingTarget] = useState(false);
  const [deletingTarget, setDeletingTarget] = useState(false);
  const [showAddTargetModal, setShowAddTargetModal] = useState(false);
  const [editTargetData, setEditTargetData] = useState(null);

  const [allTargets, setAllTargets] = useState([]);
  const [loadingAllTargets, setLoadingAllTargets] = useState(false);

  const [isTargetHidden, setIsTargetHidden] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchAllTargets = useCallback(async () => {
    setLoadingAllTargets(true);
    try {
      const res = await axios.get(`${TARGET_API_BASE}/revenue-target`);
      const list = res.data?.targets || res.data?.data || [];
      setAllTargets(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Fetch all targets error:", err);
      setAllTargets([]);
    } finally {
      setLoadingAllTargets(false);
    }
  }, []);

  useEffect(() => { fetchAllTargets(); }, [fetchAllTargets]);

  const handleSaveFYTargets = async (payload) => {
    setSavingTarget(true);
    const { entries, fyStartYear } = payload;
    let savedCount = 0;
    let failedCount = 0;
    const errors = [];

    try {
      for (const entry of entries) {
        try {
          const res = await axios.post(`${TARGET_API_BASE}/save-revenue-target`, {
            month: entry.month, year: entry.year, amount: entry.amount, category: entry.category,
          });
          if (res.data?.success) {
            savedCount++;
          } else {
            failedCount++;
            errors.push(`${MONTHS[entry.month - 1]} ${entry.year}: ${res.data?.message || "failed"}`);
          }
        } catch (err) {
          failedCount++;
          errors.push(`${MONTHS[entry.month - 1]} ${entry.year}: ${err.response?.data?.message || err.message}`);
        }
      }
      if (failedCount === 0) {
        showToast(`✅ FY ${formatFY(fyStartYear)} — ${savedCount} target${savedCount > 1 ? "s" : ""} saved!`, "success");
        setShowAddTargetModal(false);
        setEditTargetData(null);
        fetchAllTargets();
      } else if (savedCount > 0) {
        showToast(`⚠️ ${savedCount} saved, ${failedCount} failed.`, "error");
        fetchAllTargets();
      } else {
        showToast(`❌ Failed to save. ${errors[0] || ""}`, "error");
      }
    } finally { setSavingTarget(false); }
  };

  const handleUpdateTargets = async (payload) => {
    setSavingTarget(true);
    const { entries, editTarget } = payload;
    let updatedCount = 0;
    let failedCount = 0;
    const errors = [];

    try {
      for (const entry of entries) {
        const existing = allTargets.find(
          (t) => Number(t.month) === entry.month &&
                 Number(t.year) === entry.year &&
                 t.category === entry.category
        );

        try {
          if (existing && existing._id) {
            const res = await axios.put(`${TARGET_API_BASE}/update-revenue-target/${existing._id}`, {
              amount: entry.amount,
            });
            if (res.data?.success) updatedCount++;
            else {
              failedCount++;
              errors.push(`${entry.category}: ${res.data?.message || "failed"}`);
            }
          } else {
            const res = await axios.post(`${TARGET_API_BASE}/save-revenue-target`, {
              month: entry.month, year: entry.year, amount: entry.amount, category: entry.category,
            });
            if (res.data?.success) updatedCount++;
            else {
              failedCount++;
              errors.push(`${entry.category}: ${res.data?.message || "failed"}`);
            }
          }
        } catch (err) {
          failedCount++;
          errors.push(`${entry.category}: ${err.response?.data?.message || err.message}`);
        }
      }

      const editMonth = Number(editTarget.month);
      const editYear = Number(editTarget.year);
      const existingCats = allTargets.filter(
        (t) => Number(t.month) === editMonth && Number(t.year) === editYear
      );
      const newCatKeys = new Set(entries.map((e) => e.category));
      for (const ex of existingCats) {
        if (!newCatKeys.has(ex.category)) {
          try {
            const res = await axios.delete(`${TARGET_API_BASE}/revenue-target/${ex._id}`);
            if (res.data?.success) updatedCount++;
          } catch (err) {
            console.error("Delete removed category error:", err);
          }
        }
      }

      if (failedCount === 0) {
        showToast(`✅ Target updated for ${updatedCount} categor${updatedCount !== 1 ? "ies" : "y"}`, "success");
        setShowAddTargetModal(false);
        setEditTargetData(null);
        fetchAllTargets();
      } else if (updatedCount > 0) {
        showToast(`⚠️ ${updatedCount} updated, ${failedCount} failed.`, "error");
        fetchAllTargets();
      } else {
        showToast(`❌ Failed to update. ${errors[0] || ""}`, "error");
      }
    } finally { setSavingTarget(false); }
  };

  const handleEditRow = (row) => {
    const categories = {};
    TARGET_CATEGORIES.forEach((cat) => {
      const rawAmt = Number(row.categories?.[cat.key]?.amount) || 0;
      const ratio = row.ratio || 1;
      const originalAmt = ratio > 0 ? rawAmt / ratio : 0;
      if (originalAmt > 0) categories[cat.key] = Math.round(originalAmt);
    });

    setEditTargetData({
      month: row.month,
      year: row.year,
      categories,
    });
    setShowAddTargetModal(true);
  };

  const handleDeleteRow = async (row) => {
    const ids = row.ids || (row._id ? [row._id] : []);
    if (ids.length === 0) { showToast("Cannot delete: missing id", "error"); return; }
    if (!window.confirm(`Delete all targets for ${MONTHS[row.month - 1]} ${row.year}?`)) return;

    setDeletingTarget(true);
    try {
      let deletedCount = 0;
      for (const id of ids) {
        try {
          const res = await axios.delete(`${TARGET_API_BASE}/revenue-target/${id}`);
          if (res.data?.success) deletedCount++;
        } catch (err) { console.error("Delete row error:", err); }
      }
      if (deletedCount > 0) {
        showToast(`✅ Target deleted for ${MONTHS[row.month - 1]} ${row.year}`, "success");
        fetchAllTargets();
      } else {
        showToast("Failed to delete target", "error");
      }
    } finally { setDeletingTarget(false); }
  };

  const fetchAnalytics = useCallback(async () => {
    if (!fromDate && !toDate) return;
    setLoading(true);
    setError(null);
    try {
      const url = `${ANALYTICS_API_BASE}/revenue-analytics?from=${fromDate}&to=${toDate}`;
      const res = await axios.get(url);
      if (res.data?.success) {
        const normalized = normalizeAnalyticsData(res.data);
        setData(normalized);

        const rp = normalized.retailPharmacy || {};
        setRetailInput({
          cash: rp.cash ? String(rp.cash) : "",
          online: rp.online ? String(rp.online) : "",
          footFall: rp.footFall ? String(rp.footFall) : "",
        });

        const nextRowInputs = {};
        (normalized.rows || []).forEach((r) => {
          const key = r.date;
          nextRowInputs[key] = {
            cash: r.retailPharmacy?.cash ? String(r.retailPharmacy.cash) : "",
            online: r.retailPharmacy?.online ? String(r.retailPharmacy.online) : "",
            footFall: r.retailPharmacy?.footFall ? String(r.retailPharmacy.footFall) : "",
            bankCredit: r.bankCredit != null ? String(r.bankCredit) : "",
            savedBankCredit: r.bankCredit != null ? Number(r.bankCredit) : null,
            saved: r.bankCredit != null,
          };
        });
        setRowInputs(nextRowInputs);

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
      setError(err.response?.data?.message || err.message || "Failed to fetch analytics");
      setData(null);
    } finally { setLoading(false); }
  }, [fromDate, toDate]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  const handleMonthPickerClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const popupWidth = 340;
    const left = Math.min(rect.left, window.innerWidth - popupWidth - 20);
    setMonthPickerPos({ top: rect.bottom + 6, left });
    setShowMonthPicker(!showMonthPicker);
  };
  const handleMonthSelect = (month, year) => {
    setSelectedMonth(month); setSelectedYear(year);
    const first = new Date(year, month - 1, 1);
    const last = new Date(year, month, 0);
    setFromDate(fmtDate(first)); setToDate(fmtDate(last));
    setActivePreset("");
  };
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".ra-month-picker") && !e.target.closest(".ra-month-trigger")) setShowMonthPicker(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const setPreset = (preset) => {
    const nowD = new Date();
    setActivePreset(preset);
    if (preset === "today") { const t = fmtDate(nowD); setFromDate(t); setToDate(t); }
    else if (preset === "yesterday") { const y = new Date(nowD); y.setDate(y.getDate() - 1); const t = fmtDate(y); setFromDate(t); setToDate(t); }
    else if (preset === "thisWeek") {
      const dow = nowD.getDay(); const diff = dow === 0 ? 6 : dow - 1;
      const mon = new Date(nowD); mon.setDate(mon.getDate() - diff);
      setFromDate(fmtDate(mon)); setToDate(fmtDate(nowD));
    } else if (preset === "thisMonth") {
      const first = new Date(nowD.getFullYear(), nowD.getMonth(), 1);
      const last = new Date(nowD.getFullYear(), nowD.getMonth() + 1, 0);
      setFromDate(fmtDate(first)); setToDate(fmtDate(last));
    } else if (preset === "lastMonth") {
      const first = new Date(nowD.getFullYear(), nowD.getMonth() - 1, 1);
      const last = new Date(nowD.getFullYear(), nowD.getMonth(), 0);
      setFromDate(fmtDate(first)); setToDate(fmtDate(last));
    } else if (preset === "thisYear") {
      const first = new Date(nowD.getFullYear(), 0, 1);
      const last = new Date(nowD.getFullYear(), 11, 31);
      setFromDate(fmtDate(first)); setToDate(fmtDate(last));
    }
  };
  const handleClearAnalyticsFilters = () => {
    const t = fmtDate(new Date());
    setFromDate(t); setToDate(t); setActivePreset("today");
    setSelectedMonth(now.getMonth() + 1); setSelectedYear(now.getFullYear());
  };

  const hasAnalyticsFilters = activePreset !== "today" && (!!activePreset || !!fromDate || !!toDate);

  const retailPharmacyLive = useMemo(() => {
    const cash = Number(retailInput.cash) || 0;
    const online = Number(retailInput.online) || 0;
    return { cash, online, due: 0, total: cash + online, card: 0, insurance: 0, footFall: Number(retailInput.footFall) || 0 };
  }, [retailInput]);

  const grandTotalLive = useMemo(() => {
    if (!data) return null;
    const c = data.clinic, l = data.lab, p = data.pharmacy, r = retailPharmacyLive;
    return {
      total: c.total + l.total + p.total + r.total,
      cash: c.cash + l.cash + p.cash + r.cash,
      online: c.online + l.online + p.online + r.online,
      due: c.due + l.due + p.due + r.due,
      footFall: c.footFall + l.footFall + p.footFall + r.footFall,
    };
  }, [data, retailPharmacyLive]);

  const rangeTargets = useMemo(() => {
    const empty = { clinic: 0, lab: 0, clinicPharmacy: 0, retailPharmacy: 0, total: 0, hasAny: false, daysCount: 0 };
    if (!fromDate || !toDate) return empty;

    const start = new Date(fromDate);
    const end = new Date(toDate);
    if (end < start) return empty;

    const acc = { clinic: 0, lab: 0, clinicPharmacy: 0, retailPharmacy: 0, total: 0, hasAny: false, daysCount: 0 };
    const cur = new Date(start);

    while (cur <= end) {
      const y = cur.getFullYear();
      const m = cur.getMonth() + 1;
      const dim = getDaysInMonth(y, m);
      const monthTargets = allTargets.filter((t) => Number(t.year) === y && Number(t.month) === m);
      monthTargets.forEach((t) => {
        const catKey = t.category;
        if (!catKey) return;
        const perDay = (Number(t.amount) || 0) / dim;
        if (acc[catKey] !== undefined) acc[catKey] += perDay;
        acc.hasAny = true;
      });
      acc.daysCount += 1;
      cur.setDate(cur.getDate() + 1);
    }

    acc.total = acc.clinic + acc.lab + acc.clinicPharmacy + acc.retailPharmacy;
    return acc;
  }, [fromDate, toDate, allTargets]);

  const hasRangeTarget = rangeTargets.hasAny;

  const rangeLabel = useMemo(() => {
    if (activePreset === "today") return "Today's Target";
    if (activePreset === "yesterday") return "Yesterday's Target";
    if (activePreset === "thisWeek") return "This Week's Target";
    if (activePreset === "thisMonth") return "This Month's Target";
    if (activePreset === "lastMonth") return "Last Month's Target";
    if (activePreset === "thisYear") return "This Year's Target";
    if (rangeTargets.daysCount === 1) return "Day Target";
    return `${rangeTargets.daysCount} Days Target`;
  }, [activePreset, rangeTargets.daysCount]);

  const rangeAchieved = useMemo(() => {
    if (!data || !data.rows || data.rows.length === 0) {
      return { clinic: 0, lab: 0, clinicPharmacy: 0, retailPharmacy: 0, total: 0, hasData: false };
    }
    const filteredRows = filterRowsByRange(data.rows, fromDate, toDate);
    const sums = sumCategoryFromRows(filteredRows);
    return { ...sums, hasData: filteredRows.length > 0 };
  }, [data, fromDate, toDate]);

  const tableTotal = useMemo(() => {
    if (!data || !data.rows || data.rows.length === 0) return null;
    const acc = {
      clinic: { cash: 0, online: 0, total: 0, footFall: 0 },
      lab: { cash: 0, online: 0, total: 0, footFall: 0 },
      pharmacy: { cash: 0, online: 0, total: 0, footFall: 0 },
      retail: { cash: 0, online: 0, total: 0, footFall: 0 },
      grand: { cash: 0, online: 0, total: 0, footFall: 0 },
      bankCredit: 0, creditedDiff: 0,
    };
    data.rows.forEach((r) => {
      const rowKey = r.date || "__total__";
      const ri = rowInputs[rowKey] || {};
      const rCash = Number(ri.cash) || 0;
      const rOnline = Number(ri.online) || 0;
      const rFoot = Number(ri.footFall) || 0;
      acc.clinic.cash += Number(r.clinic.cash) || 0;
      acc.clinic.online += Number(r.clinic.online) || 0;
      acc.clinic.total += Number(r.clinic.total) || 0;
      acc.clinic.footFall += Number(r.clinic.footFall) || 0;
      acc.lab.cash += Number(r.lab.cash) || 0;
      acc.lab.online += Number(r.lab.online) || 0;
      acc.lab.total += Number(r.lab.total) || 0;
      acc.lab.footFall += Number(r.lab.footFall) || 0;
      acc.pharmacy.cash += Number(r.pharmacy.cash) || 0;
      acc.pharmacy.online += Number(r.pharmacy.online) || 0;
      acc.pharmacy.total += Number(r.pharmacy.total) || 0;
      acc.pharmacy.footFall += Number(r.pharmacy.footFall) || 0;
      acc.retail.cash += rCash;
      acc.retail.online += rOnline;
      acc.retail.total += rCash + rOnline;
      acc.retail.footFall += rFoot;
      acc.grand.cash += (Number(r.clinic.cash) || 0) + (Number(r.lab.cash) || 0) + (Number(r.pharmacy.cash) || 0) + rCash;
      acc.grand.online += (Number(r.clinic.online) || 0) + (Number(r.lab.online) || 0) + (Number(r.pharmacy.online) || 0) + rOnline;
      acc.grand.total += (Number(r.clinic.total) || 0) + (Number(r.lab.total) || 0) + (Number(r.pharmacy.total) || 0) + (rCash + rOnline);
      acc.grand.footFall += (Number(r.clinic.footFall) || 0) + (Number(r.lab.footFall) || 0) + (Number(r.pharmacy.footFall) || 0) + rFoot;
      const rBC = ri.savedBankCredit != null ? Number(ri.savedBankCredit) : (parseFloat(ri.bankCredit) || 0);
      acc.bankCredit += rBC;
    });
    acc.creditedDiff = acc.bankCredit - acc.grand.total;
    return acc;
  }, [data, rowInputs]);

  const handleSaveClick = () => {
    const bankCreditNum = parseFloat(bankCredit);
    if (isNaN(bankCreditNum) || bankCreditNum <= 0) { showToast("Please enter a valid bank credit amount first", "error"); return; }
    setShowSaveConfirm(true);
  };

  const handleSaveRow = async (rowKey, bankCreditNum, rowGrandTotal, retailData) => {
    let rowFrom, rowTo;
    if (/^\d{4}-\d{2}$/.test(rowKey)) {
      const [y, m] = rowKey.split("-").map(Number);
      rowFrom = fmtDate(new Date(y, m - 1, 1));
      rowTo = fmtDate(new Date(y, m, 0));
    } else { rowFrom = rowKey; rowTo = rowKey; }
    const diff = bankCreditNum - rowGrandTotal;
    const absDiff = Math.abs(diff);
    let diffStatus = "—";
    if (bankCreditNum && rowGrandTotal) {
      if (absDiff < 0.5) diffStatus = "MATCHED";
      else if (diff > 0) diffStatus = "CREDIT MORE";
      else diffStatus = "CREDIT LESS";
    }
    setSavingRowKey(rowKey);
    try {
      const res = await axios.post(`${ANALYTICS_API_BASE}/save-bank-credit`, {
        fromDate: rowFrom, toDate: rowTo, rowKey,
        bankCredit: bankCreditNum, grandTotal: rowGrandTotal,
        creditedDiff: diff, diffStatus, savedBy: "Admin",
        retailPharmacy: { cash: retailData.cash, online: retailData.online, footFall: retailData.footFall, total: retailData.total },
      });
      if (res.data?.success) {
        setRowInputs((p) => ({ ...p, [rowKey]: { ...(p[rowKey] || {}), saved: true, savedBankCredit: bankCreditNum } }));
        showToast(`✅ Row saved!`, "success");
      } else { showToast(res.data?.message || "Failed to save", "error"); }
    } catch (err) { showToast(err.response?.data?.message || "Failed to save", "error"); }
    finally { setSavingRowKey(null); }
  };

  const handleConfirmSave = async () => {
    const bankCreditNum = parseFloat(bankCredit) || 0;
    const grandTotalNum = grandTotalLive?.total || 0;
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
      const res = await axios.post(`${ANALYTICS_API_BASE}/save-bank-credit`, {
        fromDate, toDate, rowKey: "__total__",
        bankCredit: bankCreditNum, grandTotal: grandTotalNum,
        creditedDiff: diff, diffStatus, savedBy: "Admin",
        retailPharmacy: retailPharmacyLive,
      });
      if (res.data?.success) {
        setSavedBankCredit(bankCreditNum);
        setShowSaveConfirm(false);
        showToast(`✅ Bank Credit ${fmtAmt(bankCreditNum)} saved!`, "success");
      } else { showToast(res.data?.message || "Failed to save bank credit", "error"); }
    } catch (err) { showToast(err.response?.data?.message || "Failed to save bank credit", "error"); }
    finally { setSavingBankCredit(false); }
  };

  const bankCreditNum = savedBankCredit !== null ? savedBankCredit : (parseFloat(bankCredit) || 0);
  const hasSavedValue = savedBankCredit !== null;
  const currentInputNum = parseFloat(bankCredit) || 0;
  const hasUnsavedChange = currentInputNum > 0 && currentInputNum !== savedBankCredit;

  const handleExportCSV = () => {
    if (!data || !grandTotalLive) return;
    const diff = bankCreditNum - (grandTotalLive.total || 0);
    const diffLabel = !bankCreditNum ? "—" : Math.abs(diff) < 0.5 ? "MATCHED" : diff > 0 ? "CREDIT MORE" : "CREDIT LESS";
    const rowCells = (r) => {
      const rowKey = r.date || "__total__";
      const ri = rowInputs[rowKey] || {};
      const rCash = Number(ri.cash) || 0;
      const rOnline = Number(ri.online) || 0;
      const rFoot = Number(ri.footFall) || 0;
      const rRetail = { cash: rCash, online: rOnline, total: rCash + rOnline, footFall: rFoot };
      const rBC = ri.savedBankCredit != null ? Number(ri.savedBankCredit) : 0;
      const rGrand = {
        cash: r.clinic.cash + r.lab.cash + r.pharmacy.cash + rRetail.cash,
        online: r.clinic.online + r.lab.online + r.pharmacy.online + rRetail.online,
        total: r.clinic.total + r.lab.total + r.pharmacy.total + rRetail.total,
        footFall: r.clinic.footFall + r.lab.footFall + r.pharmacy.footFall + rRetail.footFall,
      };
      const rDiff = rBC - rGrand.total;
      const rDiffLabel = !rBC ? "—" : Math.abs(rDiff) < 0.5 ? "MATCHED" : rDiff > 0 ? "CREDIT MORE" : "CREDIT LESS";
      const isMonthly = r.year && r.month;
      const dateLabel = rowKey === "__total__"
        ? `${formatDateToDDMMYYYY(fromDate)} – ${formatDateToDDMMYYYY(toDate)}`
        : isMonthly ? `${MONTHS[r.month - 1].slice(0, 3)} ${r.year}` : formatDateToDDMMYYYY(r.date);
      return `
    <tr class="data-row">
      <td>${dateLabel}</td>
      <td>${r.clinic.cash}</td><td>${r.clinic.online}</td><td class="total-cell">${r.clinic.total}</td><td class="footfall">${r.clinic.footFall}</td>
      <td>${r.lab.cash}</td><td>${r.lab.online}</td><td class="total-cell">${r.lab.total}</td><td class="footfall">${r.lab.footFall}</td>
      <td>${r.pharmacy.cash}</td><td>${r.pharmacy.online}</td><td class="total-cell">${r.pharmacy.total}</td><td class="footfall">${r.pharmacy.footFall}</td>
      <td>${rRetail.cash}</td><td>${rRetail.online}</td><td class="total-cell">${rRetail.total}</td><td class="footfall">${rRetail.footFall}</td>
      <td>${rGrand.cash}</td><td>${rGrand.online}</td><td class="grand-total">${rGrand.total}</td><td class="footfall">${rGrand.footFall}</td>
      <td>${rBC || "—"}</td>
      <td>${Math.abs(rDiff) >= 0.5 && rBC ? Math.abs(rDiff) : (rBC ? 0 : "—")}</td>
      <td>${rDiffLabel}</td>
    </tr>`;
    };
    const totalRowHtml = `
    <tr class="data-row" style="background:#fef3c7;">
      <td style="font-weight:bold;">TOTAL</td>
      <td>${data.clinic.cash}</td><td>${data.clinic.online}</td><td class="total-cell">${data.clinic.total}</td><td class="footfall">${data.clinic.footFall}</td>
      <td>${data.lab.cash}</td><td>${data.lab.online}</td><td class="total-cell">${data.lab.total}</td><td class="footfall">${data.lab.footFall}</td>
      <td>${data.pharmacy.cash}</td><td>${data.pharmacy.online}</td><td class="total-cell">${data.pharmacy.total}</td><td class="footfall">${data.pharmacy.footFall}</td>
      <td>${retailPharmacyLive.cash}</td><td>${retailPharmacyLive.online}</td><td class="total-cell">${retailPharmacyLive.total}</td><td class="footfall">${retailPharmacyLive.footFall}</td>
      <td>${grandTotalLive.cash}</td><td>${grandTotalLive.online}</td><td class="grand-total">${grandTotalLive.total}</td><td class="footfall">${grandTotalLive.footFall}</td>
      <td>${bankCreditNum || "—"}</td>
      <td>${Math.abs(diff) >= 0.5 && bankCreditNum ? Math.abs(diff) : (bankCreditNum ? 0 : "—")}</td>
      <td>${diffLabel}</td>
    </tr>`;
    const bodyRows = (data.rows || []).map(rowCells).join("");
    const htmlContent = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
<head><meta charset="UTF-8">
<style>
  table { border-collapse: collapse; font-family: Calibri, Arial, sans-serif; font-size: 10pt; }
  th, td { border: 1px solid #94a3b8; padding: 5px 8px; text-align: center; white-space: nowrap; }
  .grp-clinic { background: #1e40af; color: #fff; font-weight: bold; }
  .grp-lab { background: #6d28d9; color: #fff; font-weight: bold; }
  .grp-pharmacy { background: #047857; color: #fff; font-weight: bold; }
  .grp-retail { background: #d97706; color: #fff; font-weight: bold; }
  .grp-summary { background: #4338ca; color: #fff; font-weight: bold; }
  .grp-bank { background: #be123c; color: #fff; font-weight: bold; }
  .sub-clinic { background: #dbeafe; color: #1e40af; font-weight: bold; }
  .sub-lab { background: #ede9fe; color: #6d28d9; font-weight: bold; }
  .sub-pharmacy { background: #d1fae5; color: #047857; font-weight: bold; }
  .sub-retail { background: #fef3c7; color: #b45309; font-weight: bold; }
  .sub-summary { background: #e0e7ff; color: #4338ca; font-weight: bold; }
  .data-row td { background: #f8fafc; font-weight: 600; }
  .total-cell { background: #dbeafe; font-weight: bold; color: #1e40af; }
  .grand-total { background: #e0e7ff; font-weight: 900; color: #312e81; }
  .footfall { background: #eff6ff; font-weight: bold; color: #1e3a8a; }
</style>
</head>
<body>
<table>
  <thead>
    <tr>
      <th class="grp-clinic" rowspan="2">Date</th>
      <th class="grp-clinic" colspan="4">Clinic</th>
      <th class="grp-lab" colspan="4">Lab</th>
      <th class="grp-pharmacy" colspan="4">Clinic Pharmacy</th>
      <th class="grp-retail" colspan="4">Retail Pharmacy</th>
      <th class="grp-summary" colspan="4">Summary</th>
      <th class="grp-bank" rowspan="2">Bank Credit</th>
      <th class="grp-bank" rowspan="2">Credited D/W</th>
      <th class="grp-bank" rowspan="2">Status</th>
    </tr>
    <tr>
      <th class="sub-clinic">Cash</th><th class="sub-clinic">Online</th><th class="sub-clinic">Total</th><th class="sub-clinic">FootFall</th>
      <th class="sub-lab">Cash</th><th class="sub-lab">Online</th><th class="sub-lab">Total</th><th class="sub-lab">FootFall</th>
      <th class="sub-pharmacy">Cash</th><th class="sub-pharmacy">Online</th><th class="sub-pharmacy">Total</th><th class="sub-pharmacy">FootFall</th>
      <th class="sub-retail">Cash</th><th class="sub-retail">Online</th><th class="sub-retail">Total</th><th class="sub-retail">FootFall</th>
      <th class="sub-summary">Cash</th><th class="sub-summary">Online</th><th class="sub-summary">Grand Total</th><th class="sub-summary">FootFall</th>
    </tr>
  </thead>
  <tbody>${bodyRows}${totalRowHtml}</tbody>
</table>
</body>
</html>`;
    const blob = new Blob([`\uFEFF${htmlContent}`], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `Revenue_Analytics_${fromDate}_to_${toDate}.xls`;
    a.click(); URL.revokeObjectURL(url);
    showToast(`Exported revenue analytics to Excel!`, "success");
  };

  const presetOptions = [
    { v: "today", l: "Today" }, { v: "yesterday", l: "Yesterday" },
    { v: "thisWeek", l: "Week" }, { v: "thisMonth", l: "Month" },
    { v: "lastMonth", l: "Last Month" }, { v: "thisYear", l: "Year" },
  ];
  const inputCls = "w-full text-center text-xs font-bold bg-white border border-amber-400 rounded px-1 py-0.5 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500";

  return (
    <div className="min-h-screen bg-slate-50 p-2 sm:p-3 lg:p-4">
      {toast && (
        <div className={`fixed top-5 right-5 z-[99999] flex items-center gap-3 px-4 py-2.5 rounded-lg shadow-lg text-white ${toast.type === "error" ? "bg-red-600" : "bg-emerald-600"}`}>
          {toast.type === "error" ? <FiXCircle className="w-4 h-4" /> : <FiCheckCircle className="w-4 h-4" />}
          <span className="font-medium text-xs">{toast.message}</span>
        </div>
      )}

      <AddTargetModal
        isOpen={!!showAddTargetModal}
        onClose={() => { setShowAddTargetModal(false); setEditTargetData(null); }}
        onSave={(payload) => {
          if (payload.mode === "edit") handleUpdateTargets(payload);
          else if (payload.mode === "fy") handleSaveFYTargets(payload);
        }}
        saving={savingTarget}
        editTarget={editTargetData}
      />

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
                  <span className="text-slate-600 font-medium">Bank Credit:</span>
                  <span className="font-extrabold text-purple-700 text-base">{fmtAmt(parseFloat(bankCredit) || 0)}</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-purple-200">
                  <span className="text-slate-600 font-medium">Grand Total:</span>
                  <span className="font-bold text-slate-700">{fmtAmt(grandTotalLive?.total || 0)}</span>
                </div>
              </div>
              <p className="text-sm text-slate-700 text-center font-medium m-0">Do you want to save this bank credit?</p>
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-3 bg-slate-50 border-t border-slate-200">
              <button onClick={() => setShowSaveConfirm(false)} disabled={savingBankCredit} type="button"
                className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-50">
                Cancel
              </button>
              <button onClick={handleConfirmSave} disabled={savingBankCredit} type="button"
                className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-md flex items-center gap-1.5 disabled:opacity-50">
                {savingBankCredit ? <FiRefreshCw className="w-3 h-3 animate-spin" /> : <FaSave className="w-3 h-3" />}
                {savingBankCredit ? "Saving..." : "Yes, Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full">
        {/* COMMON FILTER HEADER */}
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
                <button key={p.v} onClick={() => setPreset(p.v)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded transition-all whitespace-nowrap ${activePreset === p.v ? "bg-blue-600 text-white shadow-sm" : "text-blue-600 hover:bg-white"
                    }`} type="button">
                  {p.l}
                </button>
              ))}
            </div>
            {hasAnalyticsFilters && (
              <button type="button" onClick={handleClearAnalyticsFilters}
                className="flex items-center gap-1 h-8 px-2.5 text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-md hover:bg-rose-100 whitespace-nowrap">
                <FiX className="w-3 h-3" /> Clear
              </button>
            )}
            <div className="relative ra-month-trigger">
              <button onClick={handleMonthPickerClick}
                className="flex items-center gap-2 h-8 px-3 text-[11px] font-bold text-white bg-blue-600 border border-blue-600 rounded-md hover:bg-blue-700 whitespace-nowrap shadow-sm"
                type="button">
                <span>{MONTHS[selectedMonth - 1]}, {selectedYear}</span>
                <FaCalendarAlt className="w-3 h-3" />
              </button>
              <div className="ra-month-picker">
                <MonthYearPickerPopup
                  isOpen={showMonthPicker}
                  position={monthPickerPos}
                  month={selectedMonth}
                  year={selectedYear}
                  onMonthSelect={handleMonthSelect}
                  onClose={() => setShowMonthPicker(false)}
                />
              </div>
            </div>
            <button onClick={fetchAnalytics} disabled={loading}
              className="flex items-center gap-1.5 h-8 px-2.5 text-[11px] font-semibold text-blue-700 bg-white border border-blue-200 rounded-md hover:bg-blue-50 disabled:opacity-50 whitespace-nowrap"
              type="button">
              <FiRefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
            <button onClick={handleExportCSV} disabled={!data}
              className="flex items-center gap-1.5 h-8 px-2.5 text-[11px] font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
              type="button">
              <FiDownload className="w-3 h-3" /> Export
            </button>
          </div>
        </div>

        {/* Mobile common filters */}
        <div className="lg:hidden flex items-center justify-between gap-2 flex-wrap mb-3 bg-white border border-slate-200 rounded-lg px-3 py-2.5">
          <div className="flex items-center gap-2">
            <FiTrendingUp className="w-4 h-4 text-blue-600" />
            <h1 className="text-sm font-bold text-slate-900">Revenue Analytics</h1>
          </div>
          <div className="flex items-center gap-1">
            {hasAnalyticsFilters && (
              <button type="button" onClick={handleClearAnalyticsFilters}
                className="p-1.5 text-rose-700 bg-rose-50 border border-rose-200 rounded-md">
                <FiX className="w-3 h-3" />
              </button>
            )}
            <button onClick={fetchAnalytics} disabled={loading} className="p-1.5 text-blue-700 bg-blue-50 border border-blue-200 rounded-md">
              <FiRefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button onClick={handleExportCSV} disabled={!data} className="p-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md disabled:opacity-50">
              <FiDownload className="w-3 h-3" />
            </button>
          </div>
        </div>
        <div className="lg:hidden mb-3 flex items-center gap-1 overflow-x-auto pb-1">
          {presetOptions.map((p) => (
            <button key={p.v} onClick={() => setPreset(p.v)}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-md border transition-all whitespace-nowrap flex-shrink-0 ${activePreset === p.v ? "bg-blue-600 text-white border-blue-600" : "bg-white text-blue-600 border-blue-200"
                }`}>
              {p.l}
            </button>
          ))}
        </div>

        {/* TARGET TRACKER */}
        <TargetTracker
          onSetTargetClick={() => { setEditTargetData(null); setShowAddTargetModal(true); }}
          allTargets={allTargets}
          loadingAllTargets={loadingAllTargets}
          onEditRow={handleEditRow}
          onDeleteRow={handleDeleteRow}
          isHidden={isTargetHidden}
          onToggleHidden={() => setIsTargetHidden((p) => !p)}
          fromDate={fromDate}
          toDate={toDate}
          activePreset={activePreset}
          rangeAchieved={rangeAchieved}
        />

        {error && (
          <div className="flex items-center gap-2 px-3 py-2 mb-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs font-medium">
            <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
            <button onClick={fetchAnalytics} type="button" className="ml-auto px-2.5 py-1 text-[10px] font-bold text-red-700 bg-red-100 border border-red-200 rounded hover:bg-red-200">Retry</button>
          </div>
        )}

        {loading && !data && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <FiRefreshCw className="w-6 h-6 text-blue-500 animate-spin mb-2" />
            <p className="text-xs m-0 font-medium">Loading revenue analytics...</p>
          </div>
        )}

        {data && !loading && grandTotalLive && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 mb-3">
              <CategoryCard title="Clinic" icon={<FaClinicMedical />} footfall={data.clinic.footFall} total={data.clinic.total} data={data.clinic} accent="blue" rangeTarget={rangeTargets.clinic} hasTarget={hasRangeTarget && rangeTargets.clinic > 0} rangeLabel={rangeLabel} />
              <CategoryCard title="Lab" icon={<FaFlask />} footfall={data.lab.footFall} total={data.lab.total} data={data.lab} accent="purple" rangeTarget={rangeTargets.lab} hasTarget={hasRangeTarget && rangeTargets.lab > 0} rangeLabel={rangeLabel} />
              <CategoryCard title="Clinic Pharmacy" icon={<FaPills />} footfall={data.pharmacy.footFall} total={data.pharmacy.total} data={data.pharmacy} accent="emerald" rangeTarget={rangeTargets.clinicPharmacy} hasTarget={hasRangeTarget && rangeTargets.clinicPharmacy > 0} rangeLabel={rangeLabel} />
              <CategoryCard title="Retail Pharmacy" icon={<FaPills />} footfall={retailPharmacyLive.footFall} total={retailPharmacyLive.total} data={retailPharmacyLive} accent="amber" rangeTarget={rangeTargets.retailPharmacy} hasTarget={hasRangeTarget && rangeTargets.retailPharmacy > 0} rangeLabel={rangeLabel} />
              <GrandTotalCard total={grandTotalLive.total} cash={grandTotalLive.cash} online={grandTotalLive.online} due={grandTotalLive.due} footFall={grandTotalLive.footFall} rangeTarget={rangeTargets.total} hasTarget={hasRangeTarget && rangeTargets.total > 0} rangeLabel={rangeLabel} />
            </div>

            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-xs" style={{ minWidth: "1500px" }}>
                  <thead>
                    <tr>
                      <th className="px-2 py-2 text-center font-bold text-white uppercase tracking-wider text-[10px] border-r border-blue-700 bg-blue-800" rowSpan={2}>Date</th>
                      <th className="px-2 py-2 text-center font-bold text-white uppercase tracking-wider text-[10px] border-r border-blue-700 bg-blue-800" colSpan={4}>Clinic</th>
                      <th className="px-2 py-2 text-center font-bold text-white uppercase tracking-wider text-[10px] border-r border-purple-700 bg-purple-700" colSpan={4}>Lab</th>
                      <th className="px-2 py-2 text-center font-bold text-white uppercase tracking-wider text-[10px] border-r border-emerald-700 bg-emerald-700" colSpan={4}>Clinic Pharmacy</th>
                      <th className="px-2 py-2 text-center font-bold text-white uppercase tracking-wider text-[10px] border-r border-amber-700 bg-amber-600" colSpan={4}>Retail Pharmacy</th>
                      <th className="px-2 py-2 text-center font-bold text-white uppercase tracking-wider text-[10px] border-r border-indigo-700 bg-indigo-700" colSpan={4}>Summary</th>
                      <th className="px-2 py-2 text-center font-bold text-white uppercase tracking-wider text-[10px] border-r border-rose-700 bg-rose-700" rowSpan={2}>Bank Credit</th>
                      <th className="px-2 py-2 text-center font-bold text-white uppercase tracking-wider text-[10px] border-r border-rose-700 bg-rose-700" rowSpan={2}>Credited D/W</th>
                      <th className="px-2 py-2 text-center font-bold text-white uppercase tracking-wider text-[10px] bg-rose-700" rowSpan={2}>Status</th>
                    </tr>
                    <tr>
                      <th className="px-2 py-1.5 text-center font-bold text-blue-700 uppercase tracking-wider text-[9px] border-r border-blue-100 bg-blue-50">Cash</th>
                      <th className="px-2 py-1.5 text-center font-bold text-blue-700 uppercase tracking-wider text-[9px] border-r border-blue-100 bg-blue-50">Online</th>
                      <th className="px-2 py-1.5 text-center font-bold text-blue-700 uppercase tracking-wider text-[9px] border-r border-blue-100 bg-blue-50">Total</th>
                      <th className="px-2 py-1.5 text-center font-bold text-blue-700 uppercase tracking-wider text-[9px] border-r border-blue-200 bg-blue-50">FootFall</th>
                      <th className="px-2 py-1.5 text-center font-bold text-purple-700 uppercase tracking-wider text-[9px] border-r border-purple-100 bg-purple-50">Cash</th>
                      <th className="px-2 py-1.5 text-center font-bold text-purple-700 uppercase tracking-wider text-[9px] border-r border-purple-100 bg-purple-50">Online</th>
                      <th className="px-2 py-1.5 text-center font-bold text-purple-700 uppercase tracking-wider text-[9px] border-r border-purple-100 bg-purple-50">Total</th>
                      <th className="px-2 py-1.5 text-center font-bold text-purple-700 uppercase tracking-wider text-[9px] border-r border-purple-200 bg-purple-50">FootFall</th>
                      <th className="px-2 py-1.5 text-center font-bold text-emerald-700 uppercase tracking-wider text-[9px] border-r border-emerald-100 bg-emerald-50">Cash</th>
                      <th className="px-2 py-1.5 text-center font-bold text-emerald-700 uppercase tracking-wider text-[9px] border-r border-emerald-100 bg-emerald-50">Online</th>
                      <th className="px-2 py-1.5 text-center font-bold text-emerald-700 uppercase tracking-wider text-[9px] border-r border-emerald-100 bg-emerald-50">Total</th>
                      <th className="px-2 py-1.5 text-center font-bold text-emerald-700 uppercase tracking-wider text-[9px] border-r border-emerald-200 bg-emerald-50">FootFall</th>
                      <th className="px-2 py-1.5 text-center font-bold text-amber-700 uppercase tracking-wider text-[9px] border-r border-amber-100 bg-amber-50">Cash</th>
                      <th className="px-2 py-1.5 text-center font-bold text-amber-700 uppercase tracking-wider text-[9px] border-r border-amber-100 bg-amber-50">Online</th>
                      <th className="px-2 py-1.5 text-center font-bold text-amber-700 uppercase tracking-wider text-[9px] border-r border-amber-100 bg-amber-50">Total</th>
                      <th className="px-2 py-1.5 text-center font-bold text-amber-700 uppercase tracking-wider text-[9px] border-r border-amber-200 bg-amber-50">FootFall</th>
                      <th className="px-2 py-1.5 text-center font-bold text-indigo-700 uppercase tracking-wider text-[9px] border-r border-indigo-100 bg-indigo-50">Cash</th>
                      <th className="px-2 py-1.5 text-center font-bold text-indigo-700 uppercase tracking-wider text-[9px] border-r border-indigo-100 bg-indigo-50">Online</th>
                      <th className="px-2 py-1.5 text-center font-bold text-indigo-700 uppercase tracking-wider text-[9px] border-r border-indigo-100 bg-indigo-50">Grand Total</th>
                      <th className="px-2 py-1.5 text-center font-bold text-indigo-700 uppercase tracking-wider text-[9px] border-r border-indigo-200 bg-indigo-50">FootFall</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.rows && data.rows.length > 0 ? data.rows : [{
                      date: "__total__", label: "", year: null, month: null,
                      clinic: data.clinic, lab: data.lab, pharmacy: data.pharmacy,
                      retailPharmacy: { cash: 0, online: 0, footFall: 0, total: 0 },
                      bankCredit: data.bankCredit?.bankCredit ?? null,
                    }]).map((r, idx) => {
                      const rowKey = r.date || "__total__";
                      const isTotal = rowKey === "__total__";
                      const ri = rowInputs[rowKey] || {};
                      const rCash = isTotal ? (Number(retailInput.cash) || 0) : (Number(ri.cash) || 0);
                      const rOnline = isTotal ? (Number(retailInput.online) || 0) : (Number(ri.online) || 0);
                      const rFoot = isTotal ? (Number(retailInput.footFall) || 0) : (Number(ri.footFall) || 0);
                      const rRetail = { cash: rCash, online: rOnline, total: rCash + rOnline, footFall: rFoot };
                      const rBC = isTotal
                        ? (savedBankCredit !== null ? savedBankCredit : (parseFloat(bankCredit) || 0))
                        : (ri.savedBankCredit != null ? Number(ri.savedBankCredit) : (parseFloat(ri.bankCredit) || 0));
                      const rGrand = {
                        cash: r.clinic.cash + r.lab.cash + r.pharmacy.cash + rRetail.cash,
                        online: r.clinic.online + r.lab.online + r.pharmacy.online + rRetail.online,
                        total: r.clinic.total + r.lab.total + r.pharmacy.total + rRetail.total,
                        footFall: r.clinic.footFall + r.lab.footFall + r.pharmacy.footFall + rRetail.footFall,
                      };
                      const rDiff = rBC - rGrand.total;
                      const rDiffAbs = Math.abs(rDiff);
                      const rDiffLabel = !rBC ? "—" : rDiffAbs < 0.5 ? "MATCHED" : rDiff > 0 ? "CREDIT MORE" : "CREDIT LESS";
                      const rDiffColor = rDiffLabel === "MATCHED" ? "text-emerald-700"
                        : rDiffLabel === "CREDIT MORE" ? "text-blue-700"
                        : rDiffLabel === "CREDIT LESS" ? "text-rose-700" : "text-slate-400";
                      const isMonthly = r.year && r.month;
                      const dateLabel = isTotal
                        ? `${formatDateToDDMMYYYY(fromDate)} – ${formatDateToDDMMYYYY(toDate)}`
                        : isMonthly ? `${MONTHS[r.month - 1].slice(0, 3)} ${r.year}` : formatDateToDDMMYYYY(r.date);

                      return (
                        <tr key={rowKey || idx} className={`hover:bg-slate-50 ${isTotal ? "bg-amber-50/60 border-t-2 border-amber-300" : ""}`}>
                          <td className={`px-3 py-3 text-center font-bold text-slate-800 text-[11px] border-r border-slate-200 whitespace-nowrap ${isTotal ? "bg-amber-50" : "bg-slate-50"}`}>{dateLabel}</td>
                          <td className="px-3 py-3 text-center font-semibold text-emerald-600 border-r border-slate-100 text-xs">{fmt(r.clinic.cash)}</td>
                          <td className="px-3 py-3 text-center font-semibold text-sky-600 border-r border-slate-100 text-xs">{fmt(r.clinic.online)}</td>
                          <td className="px-3 py-3 text-center font-bold text-blue-700 border-r border-slate-100 bg-blue-50/40 text-xs">{fmt(r.clinic.total)}</td>
                          <td className="px-3 py-3 text-center font-bold text-blue-800 border-r border-slate-200 bg-blue-50/40 text-xs">{r.clinic.footFall}</td>
                          <td className="px-3 py-3 text-center font-semibold text-emerald-600 border-r border-slate-100 text-xs">{fmt(r.lab.cash)}</td>
                          <td className="px-3 py-3 text-center font-semibold text-sky-600 border-r border-slate-100 text-xs">{fmt(r.lab.online)}</td>
                          <td className="px-3 py-3 text-center font-bold text-purple-700 border-r border-slate-100 bg-purple-50/40 text-xs">{fmt(r.lab.total)}</td>
                          <td className="px-3 py-3 text-center font-bold text-purple-800 border-r border-slate-200 bg-purple-50/40 text-xs">{r.lab.footFall}</td>
                          <td className="px-3 py-3 text-center font-semibold text-emerald-600 border-r border-slate-100 text-xs">{fmt(r.pharmacy.cash)}</td>
                          <td className="px-3 py-3 text-center font-semibold text-sky-600 border-r border-slate-100 text-xs">{fmt(r.pharmacy.online)}</td>
                          <td className="px-3 py-3 text-center font-bold text-emerald-700 border-r border-slate-100 bg-emerald-50/40 text-xs">{fmt(r.pharmacy.total)}</td>
                          <td className="px-3 py-3 text-center font-bold text-emerald-800 border-r border-slate-200 bg-emerald-50/40 text-xs">{r.pharmacy.footFall}</td>
                          <td className="px-2 py-2 border-r border-slate-100 bg-amber-50/40">
                            <input type="number" min="0" placeholder="0"
                              value={isTotal ? retailInput.cash : (ri.cash || "")}
                              onChange={(e) => {
                                const v = e.target.value;
                                if (isTotal) setRetailInput((p) => ({ ...p, cash: v }));
                                else setRowInputs((p) => ({ ...p, [rowKey]: { ...(p[rowKey] || {}), cash: v } }));
                              }}
                              className={inputCls} />
                          </td>
                          <td className="px-2 py-2 border-r border-slate-100 bg-amber-50/40">
                            <input type="number" min="0" placeholder="0"
                              value={isTotal ? retailInput.online : (ri.online || "")}
                              onChange={(e) => {
                                const v = e.target.value;
                                if (isTotal) setRetailInput((p) => ({ ...p, online: v }));
                                else setRowInputs((p) => ({ ...p, [rowKey]: { ...(p[rowKey] || {}), online: v } }));
                              }}
                              className={inputCls} />
                          </td>
                          <td className="px-3 py-3 text-center font-bold text-amber-700 border-r border-slate-100 bg-amber-50/40 text-xs">{fmt(rRetail.total)}</td>
                          <td className="px-2 py-2 border-r border-slate-200 bg-amber-50/40">
                            <input type="number" min="0" placeholder="0"
                              value={isTotal ? retailInput.footFall : (ri.footFall || "")}
                              onChange={(e) => {
                                const v = e.target.value;
                                if (isTotal) setRetailInput((p) => ({ ...p, footFall: v }));
                                else setRowInputs((p) => ({ ...p, [rowKey]: { ...(p[rowKey] || {}), footFall: v } }));
                              }}
                              className={inputCls} />
                          </td>
                          <td className="px-3 py-3 text-center font-bold text-emerald-700 border-r border-slate-100 bg-indigo-50/40 text-xs">{fmt(rGrand.cash)}</td>
                          <td className="px-3 py-3 text-center font-bold text-sky-700 border-r border-slate-100 bg-indigo-50/40 text-xs">{fmt(rGrand.online)}</td>
                          <td className="px-3 py-3 text-center font-black text-indigo-800 border-r border-slate-100 bg-indigo-50/40 text-sm">{fmt(rGrand.total)}</td>
                          <td className="px-3 py-3 text-center font-black text-indigo-800 border-r border-slate-200 bg-indigo-50/40 text-xs">{rGrand.footFall}</td>
                          <td className="px-2 py-2 border-r border-slate-200 bg-rose-50/40">
                            <div className="flex items-center gap-1 justify-center">
                              <input type="number" min="0" placeholder="0"
                                value={isTotal ? bankCredit : (ri.bankCredit || "")}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  if (isTotal) setBankCredit(v);
                                  else setRowInputs((p) => ({ ...p, [rowKey]: { ...(p[rowKey] || {}), bankCredit: v } }));
                                }}
                                className="w-[110px] text-center text-sm font-extrabold text-rose-700 bg-white border border-rose-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500" />
                              <button type="button"
                                onClick={() => {
                                  if (isTotal) handleSaveClick();
                                  else {
                                    const bcNum = parseFloat(ri.bankCredit) || 0;
                                    if (bcNum <= 0) { showToast("Enter bank credit first", "error"); return; }
                                    handleSaveRow(rowKey, bcNum, rGrand.total, rRetail);
                                  }
                                }}
                                disabled={isTotal ? (!bankCredit || parseFloat(bankCredit) <= 0 || !hasUnsavedChange) : (!ri.bankCredit || parseFloat(ri.bankCredit) <= 0)}
                                title={isTotal && hasSavedValue && !hasUnsavedChange ? "Already saved" : "Save"}
                                className={`flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center transition-all shadow-sm ${
                                  (isTotal ? (hasUnsavedChange && parseFloat(bankCredit) > 0) : (parseFloat(ri.bankCredit) > 0))
                                    ? "bg-gradient-to-br from-rose-500 to-rose-600 text-white hover:from-rose-600 hover:to-rose-700 hover:scale-105"
                                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                }`}>
                                {savingRowKey === rowKey ? <FiRefreshCw className="w-3 h-3 animate-spin" /> : <FaSave className="w-3 h-3" />}
                              </button>
                            </div>
                            {(isTotal ? hasSavedValue : ri.saved) && (
                              <div className="mt-1 text-center text-[9px] font-bold text-emerald-600 flex items-center justify-center gap-1">
                                <FaCheckCircle className="w-2 h-2" /> Saved
                              </div>
                            )}
                          </td>
                          <td className={`px-3 py-3 text-center font-black text-sm border-r border-slate-200 bg-rose-50/40 ${rDiffColor}`}>
                            {rDiffLabel === "—" ? "—" : (rDiffAbs < 0.5 ? "0" : fmt(rDiffAbs))}
                          </td>
                          <td className={`px-3 py-3 text-center font-bold text-[10px] uppercase tracking-wider bg-rose-50/40 ${rDiffColor}`}>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${
                              rDiffLabel === "MATCHED" ? "bg-emerald-50 border-emerald-200"
                              : rDiffLabel === "CREDIT MORE" ? "bg-blue-50 border-blue-200"
                              : rDiffLabel === "CREDIT LESS" ? "bg-rose-50 border-rose-200" : "bg-slate-50 border-slate-200"
                            }`}>
                              {rDiffLabel === "MATCHED" && <FaEquals className="w-2.5 h-2.5" />}
                              {rDiffLabel === "CREDIT MORE" && <FaArrowUp className="w-2.5 h-2.5" />}
                              {rDiffLabel === "CREDIT LESS" && <FaArrowDown className="w-2.5 h-2.5" />}
                              {rDiffLabel}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {tableTotal && data.rows && data.rows.length > 0 && (
                      <tr className="bg-gradient-to-r from-slate-100 to-slate-50 border-t-2 border-b-2 border-slate-400 font-bold">
                        <td className="px-3 py-3 text-center font-black text-slate-900 text-[11px] uppercase tracking-wider border-r border-slate-300 bg-slate-200 whitespace-nowrap">
                          TOTAL
                          <div className="text-[9px] font-semibold text-slate-500 normal-case mt-0.5">({data.rows.length} row{data.rows.length > 1 ? "s" : ""})</div>
                        </td>
                        <td className="px-3 py-3 text-center font-black text-emerald-700 border-r border-slate-200 bg-slate-100 text-xs">{fmt(tableTotal.clinic.cash)}</td>
                        <td className="px-3 py-3 text-center font-black text-sky-700 border-r border-slate-200 bg-slate-100 text-xs">{fmt(tableTotal.clinic.online)}</td>
                        <td className="px-3 py-3 text-center font-black text-blue-800 border-r border-slate-200 bg-blue-100 text-xs">{fmt(tableTotal.clinic.total)}</td>
                        <td className="px-3 py-3 text-center font-black text-blue-900 border-r border-slate-200 bg-blue-100 text-xs">{tableTotal.clinic.footFall}</td>
                        <td className="px-3 py-3 text-center font-black text-emerald-700 border-r border-slate-200 bg-slate-100 text-xs">{fmt(tableTotal.lab.cash)}</td>
                        <td className="px-3 py-3 text-center font-black text-sky-700 border-r border-slate-200 bg-slate-100 text-xs">{fmt(tableTotal.lab.online)}</td>
                        <td className="px-3 py-3 text-center font-black text-purple-800 border-r border-slate-200 bg-purple-100 text-xs">{fmt(tableTotal.lab.total)}</td>
                        <td className="px-3 py-3 text-center font-black text-purple-900 border-r border-slate-200 bg-purple-100 text-xs">{tableTotal.lab.footFall}</td>
                        <td className="px-3 py-3 text-center font-black text-emerald-700 border-r border-slate-200 bg-slate-100 text-xs">{fmt(tableTotal.pharmacy.cash)}</td>
                        <td className="px-3 py-3 text-center font-black text-sky-700 border-r border-slate-200 bg-slate-100 text-xs">{fmt(tableTotal.pharmacy.online)}</td>
                        <td className="px-3 py-3 text-center font-black text-emerald-800 border-r border-slate-200 bg-emerald-100 text-xs">{fmt(tableTotal.pharmacy.total)}</td>
                        <td className="px-3 py-3 text-center font-black text-emerald-900 border-r border-slate-200 bg-emerald-100 text-xs">{tableTotal.pharmacy.footFall}</td>
                        <td className="px-3 py-3 text-center font-black text-amber-700 border-r border-slate-200 bg-amber-100 text-xs">{fmt(tableTotal.retail.cash)}</td>
                        <td className="px-3 py-3 text-center font-black text-amber-700 border-r border-slate-200 bg-amber-100 text-xs">{fmt(tableTotal.retail.online)}</td>
                        <td className="px-3 py-3 text-center font-black text-amber-800 border-r border-slate-200 bg-amber-100 text-xs">{fmt(tableTotal.retail.total)}</td>
                        <td className="px-3 py-3 text-center font-black text-amber-900 border-r border-slate-200 bg-amber-100 text-xs">{tableTotal.retail.footFall}</td>
                        <td className="px-3 py-3 text-center font-black text-emerald-800 border-r border-slate-200 bg-indigo-100 text-xs">{fmt(tableTotal.grand.cash)}</td>
                        <td className="px-3 py-3 text-center font-black text-sky-800 border-r border-slate-200 bg-indigo-100 text-xs">{fmt(tableTotal.grand.online)}</td>
                        <td className="px-3 py-3 text-center font-black text-indigo-900 border-r border-slate-200 bg-indigo-200 text-sm">{fmt(tableTotal.grand.total)}</td>
                        <td className="px-3 py-3 text-center font-black text-indigo-900 border-r border-slate-200 bg-indigo-100 text-xs">{tableTotal.grand.footFall}</td>
                        <td className="px-3 py-3 text-center font-black text-rose-800 border-r border-slate-200 bg-rose-100 text-sm">{tableTotal.bankCredit ? fmt(tableTotal.bankCredit) : "—"}</td>
                        <td className={`px-3 py-3 text-center font-black text-sm border-r border-slate-200 bg-rose-100 ${
                          !tableTotal.bankCredit ? "text-slate-400"
                            : Math.abs(tableTotal.creditedDiff) < 0.5 ? "text-emerald-800"
                            : tableTotal.creditedDiff > 0 ? "text-blue-800" : "text-rose-800"
                        }`}>
                          {!tableTotal.bankCredit ? "—" : (Math.abs(tableTotal.creditedDiff) < 0.5 ? "0" : fmt(Math.abs(tableTotal.creditedDiff)))}
                        </td>
                        <td className="px-3 py-3 text-center bg-rose-100">
                          {(() => {
                            if (!tableTotal.bankCredit) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border bg-slate-50 border-slate-200 text-slate-400 text-[10px] font-bold uppercase tracking-wider">—</span>;
                            if (Math.abs(tableTotal.creditedDiff) < 0.5) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border bg-emerald-50 border-emerald-200 text-emerald-800 text-[10px] font-bold uppercase tracking-wider"><FaEquals className="w-2.5 h-2.5" />MATCHED</span>;
                            if (tableTotal.creditedDiff > 0) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border bg-blue-50 border-blue-200 text-blue-800 text-[10px] font-bold uppercase tracking-wider"><FaArrowUp className="w-2.5 h-2.5" />CREDIT MORE</span>;
                            return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border bg-rose-50 border-rose-200 text-rose-800 text-[10px] font-bold uppercase tracking-wider"><FaArrowDown className="w-2.5 h-2.5" />CREDIT LESS</span>;
                          })()}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {grandTotalLive.total === 0 && (
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