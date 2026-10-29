// src/Pages/RevenueAnalytics.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import {
  FaClinicMedical, FaFlask, FaPills, FaCalendarAlt, FaUsers, FaWalking,
  FaMoneyBillWave, FaChevronLeft, FaChevronRight,
  FaRupeeSign, FaCheckCircle, FaTimesCircle,
  FaGlobe, FaArrowUp, FaArrowDown, FaEquals, FaSave,
  FaBullseye, FaEdit, FaPlus, FaTrash, FaMinusCircle, FaPlusCircle, FaMinus
} from "react-icons/fa";
import {
  FiRefreshCw, FiTrendingUp, FiAlertCircle, FiClock, FiFilter,
  FiDownload, FiTrash2, FiCheckCircle, FiXCircle, FiSearch,
  FiX, FiTarget, FiPlus, FiEye, FiEyeOff, FiChevronDown,
  FiPieChart, FiBarChart2,
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

const DEFAULT_CATEGORIES = [
  { key: "clinic", label: "Clinic", color: "blue", short: "CL", col1: "Amount", col2: "FootFall" },
  { key: "lab", label: "Lab", color: "purple", short: "LB", col1: "Amount", col2: "FootFall" },
  { key: "clinicPharmacy", label: "Clinic Pharmacy", color: "emerald", short: "CP", col1: "Amount", col2: "FootFall" },
  { key: "retailPharmacy", label: "Total Pharmacy", color: "amber", short: "RP", col1: "Amount", col2: "FootFall" },
];

const COLOR_PALETTE = [
  { color: "blue", bg: "bg-blue-700", sub: "bg-blue-50 text-blue-700 border-blue-100", cell: "bg-blue-50/30", th: "bg-blue-800 border-blue-900" },
  { color: "purple", bg: "bg-purple-700", sub: "bg-purple-50 text-purple-700 border-purple-100", cell: "bg-purple-50/30", th: "bg-purple-800 border-purple-900" },
  { color: "emerald", bg: "bg-emerald-700", sub: "bg-emerald-50 text-emerald-700 border-emerald-100", cell: "bg-emerald-50/30", th: "bg-emerald-800 border-emerald-900" },
  { color: "amber", bg: "bg-amber-600", sub: "bg-amber-50 text-amber-700 border-amber-100", cell: "bg-amber-50/30", th: "bg-amber-700 border-amber-800" },
  { color: "rose", bg: "bg-rose-700", sub: "bg-rose-50 text-rose-700 border-rose-100", cell: "bg-rose-50/30", th: "bg-rose-800 border-rose-900" },
  { color: "cyan", bg: "bg-cyan-700", sub: "bg-cyan-50 text-cyan-700 border-cyan-100", cell: "bg-cyan-50/30", th: "bg-cyan-800 border-cyan-900" },
  { color: "indigo", bg: "bg-indigo-700", sub: "bg-indigo-50 text-indigo-700 border-indigo-100", cell: "bg-indigo-50/30", th: "bg-indigo-800 border-indigo-900" },
  { color: "fuchsia", bg: "bg-fuchsia-700", sub: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100", cell: "bg-fuchsia-50/30", th: "bg-fuchsia-800 border-fuchsia-900" },
];

const getDynamicStyles = (categories) => {
  const header = {};
  const sub = {};
  const cell = {};
  const th = {};
  categories.forEach((cat) => {
    const c = COLOR_PALETTE.find((p) => p.color === cat.color) || COLOR_PALETTE[0];
    header[cat.key] = c.bg;
    sub[cat.key] = c.sub;
    cell[cat.key] = c.cell;
    th[cat.key] = c.th;
  });
  return { header, sub, cell, th };
};

const FY_START_FROM = 2020;

const getCurrentFYStartYear = () => {
  const d = new Date();
  return d.getMonth() + 1 >= 4 ? d.getFullYear() : d.getFullYear() - 1;
};

const formatFY = (startYear) => `${startYear}-${String(startYear + 1).slice(-2)}`;

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
  
  let rpTotal = Number(rpFromCb.total ?? rpFromBank.total) || 0;
  let rpCash = Number(rpFromCb.cash ?? rpFromBank.cash) || 0;
  let rpOnline = Number(rpFromCb.online ?? rpFromBank.online) || 0;
  let rpFoot = Number(rpFromCb.footFall ?? rpFromBank.footFall) || 0;

  if (!raw.bankCredit && Array.isArray(raw.rows) && raw.rows.length > 0) {
    let sumCash = 0, sumOnline = 0, sumFoot = 0;
    raw.rows.forEach(r => {
      if (r.bankCredit?.retailPharmacy) {
        sumCash += Number(r.bankCredit.retailPharmacy.cash) || 0;
        sumOnline += Number(r.bankCredit.retailPharmacy.online) || 0;
        sumFoot += Number(r.bankCredit.retailPharmacy.footFall) || 0;
      }
    });
    if (sumCash > 0 || sumOnline > 0 || sumFoot > 0) {
      rpCash = sumCash;
      rpOnline = sumOnline;
      rpTotal = sumCash + sumOnline;
      rpFoot = sumFoot;
    }
  }

  const retailPharmacy = {
    total: rpTotal,
    cash: rpCash,
    online: rpOnline,
    card: Number(rpFromCb.card ?? rpFromBank.card) || 0,
    insurance: Number(rpFromCb.insurance ?? rpFromBank.insurance) || 0,
    due: Number(rpFromCb.due ?? rpFromBank.due) || 0,
    footFall: rpFoot,
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

      const monthData = Array.isArray(r.monthData) ? r.monthData.map(md => {
        const mdcb = md.categoryBreakdown || {};
        const mdBuild = (k) => ({
          total: Number(mdcb[k]?.total) || 0,
          cash: Number(mdcb[k]?.cash) || 0,
          online: Number(mdcb[k]?.online) || 0,
          card: Number(mdcb[k]?.card) || 0,
          insurance: Number(mdcb[k]?.insurance) || 0,
          due: Number(mdcb[k]?.due) || 0,
          footFall: Number(mdcb[k]?.footFall) || 0,
        });
        return {
          date: md.date,
          label: md.label,
          count: md.count || 0,
          clinic: mdBuild("clinic"),
          lab: mdBuild("lab"),
          pharmacy: mdBuild("pharmacy"),
          retailPharmacy: { cash: 0, online: 0, footFall: 0, total: 0 },
          bankCredit: null
        };
      }) : [];

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
        monthData: monthData
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
const MonthYearPickerPopup = ({ isOpen, position, month, year, onMonthSelect, onClose }) => {
  const [viewYear, setViewYear] = useState(year || new Date().getFullYear());
  useEffect(() => { if (isOpen) setViewYear(year || new Date().getFullYear()); }, [isOpen, year]);
  if (!isOpen) return null;

  const handleMonthClick = (mIdx) => { onMonthSelect(mIdx + 1, viewYear); onClose(); };

  return (
    <div className="fixed z-[999999] w-[340px] bg-white border border-blue-200 rounded-lg shadow-2xl overflow-hidden"
      style={{ top: position.top, left: position.left }}>
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100 border-b border-slate-200">
        <button type="button" onClick={() => setViewYear((y) => y - 1)} className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-white rounded">
          <FaChevronLeft className="w-3 h-3" />
        </button>
        <div className="text-base font-bold text-slate-800">{viewYear}</div>
        <button type="button" onClick={() => setViewYear((y) => y + 1)} className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-white rounded">
          <FaChevronRight className="w-3 h-3" />
        </button>
      </div>
      <div className="grid grid-cols-4 gap-2 p-4">
        {MONTHS.map((mName, idx) => {
          const isSelected = month === idx + 1 && year === viewYear;
          return (
            <button key={mName} type="button" onClick={() => handleMonthClick(idx)}
              className={`py-2.5 text-xs font-bold rounded transition-all ${isSelected ? "bg-slate-700 text-white" : "text-slate-700 hover:bg-slate-100"}`}>
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
const TargetProgressStrip = ({ rangeTarget, achieved, hasTarget, rangeLabel = "Target", targetFootFall = 0, achievedFootFall = 0 }) => {
  if (!hasTarget || rangeTarget <= 0) return null;

  const diff = achieved - rangeTarget;
  const diffAbs = Math.abs(diff);
  const pct = rangeTarget > 0 ? (achieved / rangeTarget) * 100 : 0;
  const shortPct = 100 - pct;

  let statusLabel = "PENDING", statusColor = "text-slate-500", barColor = "bg-slate-400", displayPct = `${pct.toFixed(0)}%`;
  if (diffAbs < 0.5) { statusLabel = "MATCHED"; statusColor = "text-emerald-700"; barColor = "bg-emerald-500"; displayPct = "100%"; }
  else if (diff > 0) { statusLabel = "EXCEEDED"; statusColor = "text-blue-700"; barColor = "bg-blue-500"; displayPct = `+${(pct - 100).toFixed(0)}%`; }
  else { statusLabel = "SHORTFALL"; statusColor = "text-rose-700"; barColor = "bg-rose-500"; displayPct = `-${shortPct.toFixed(0)}%`; }

  const barWidth = Math.min(pct, 100);
  const formatAmt = (val) => `₹${fmt(Math.round(val))}`;

  return (
    <div className="mt-2.5 pt-2 border-t border-slate-200/70">
      <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wide mb-1.5">
        <span className="text-slate-500">{rangeLabel}</span>
        <span className={statusColor}>{statusLabel}</span>
      </div>
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-[11px] font-black text-slate-800">{formatAmt(achieved)} / {formatAmt(rangeTarget)}</span>
        <span className={`text-[10px] font-black ${statusColor}`}>{displayPct}</span>
      </div>
      <div className="w-full h-1 rounded-full bg-slate-200 overflow-hidden">
        <div className={`h-full ${barColor} transition-all`} style={{ width: `${barWidth}%` }} />
      </div>
      {diffAbs >= 0.5 && (
        <div className={`text-[9px] font-bold mt-1 ${statusColor}`}>
          {diff > 0 ? `+₹${fmt(Math.round(diffAbs))} surplus (+${shortPct.toFixed(0)}%)` : `−₹${fmt(Math.round(diffAbs))} short (-${shortPct.toFixed(0)}%)`}
        </div>
      )}
    </div>
  );
};

/* ============================================================ */
/* Category Card                                                 */
/* ============================================================ */
const CategoryCard = ({ title, icon, footfall, total, data, accent = "blue", rangeTarget = 0, hasTarget = false, rangeLabel = "Target", isCustom = false, rangeTargetFF = 0 }) => {
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
    rose: { box: "bg-rose-50 text-rose-600", border: "border-rose-200", title: "text-slate-700" },
    cyan: { box: "bg-cyan-50 text-cyan-600", border: "border-cyan-200", title: "text-slate-700" },
    indigo: { box: "bg-indigo-50 text-indigo-600", border: "border-indigo-200", title: "text-slate-700" },
    fuchsia: { box: "bg-fuchsia-50 text-fuchsia-600", border: "border-fuchsia-200", title: "text-slate-700" },
  };
  const a = accentMap[accent] || accentMap.blue;

  const formatSmartAmt = (val) => {
    const roundedNum = Math.round(Number(val) || 0);
    let displayStr = "";
    if (roundedNum >= 10000000) displayStr = `₹${(roundedNum / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
    else if (roundedNum >= 100000) displayStr = `₹${(roundedNum / 100000).toFixed(2).replace(/\.00$/, '')} L`;
    else if (roundedNum >= 1000) displayStr = `₹${(roundedNum / 1000).toFixed(1).replace(/\.0$/, '')}K`;
    else displayStr = `₹${fmt(roundedNum)}`;
    return (
      <span className="group relative inline-block cursor-help">
        {displayStr}
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-[999] pointer-events-none">
          <span className="bg-slate-800 text-white text-[11px] font-medium py-1.5 px-3 rounded-md shadow-2xl whitespace-nowrap tracking-wide">
            Exact: <span className="font-bold text-emerald-300">₹{fmt(roundedNum)}</span>
          </span>
          <span className="w-2.5 h-2.5 bg-slate-800 transform rotate-45 -mt-1.5"></span>
        </span>
      </span>
    );
  };

  const isAmountShort = hasTarget && rangeTarget > 0 && total < rangeTarget;
  const amountColor = hasTarget && rangeTarget > 0 ? (isAmountShort ? "text-rose-600" : "text-emerald-600") : "text-slate-900";
  const AmountIcon = isAmountShort ? FaArrowDown : FaArrowUp;
  const amountIconClass = `w-3.5 h-3.5 ${amountColor} ${isAmountShort ? "rotate-45" : "-rotate-45"}`;
  const amountPrefix = (!isAmountShort && total > rangeTarget) ? "+" : "";

  const isFFShort = hasTarget && rangeTargetFF > 0 && footfall < rangeTargetFF;
  const ffColor = hasTarget && rangeTargetFF > 0 ? (isFFShort ? "text-rose-600" : "text-emerald-600") : "text-slate-900";
  const FFIcon = isFFShort ? FaArrowDown : FaArrowUp;
  const ffIconClass = `w-3.5 h-3.5 ${ffColor} ${isFFShort ? "rotate-45" : "-rotate-45"}`;
  const ffPrefix = (!isFFShort && footfall > rangeTargetFF) ? "+" : "";

  return (
    <div className={`bg-white rounded-lg border p-3 hover:border-blue-300 transition-colors ${a.border}`}>
      <div className="flex items-start gap-2 mb-2">
        <span className={`w-8 h-8 rounded-md flex items-center justify-center text-sm flex-shrink-0 ${a.box}`}>{icon}</span>
        <div className={`text-[12px] font-black uppercase tracking-wider leading-8 ${a.title}`}>{title}</div>
      </div>
      <div className="space-y-1 mb-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-black text-slate-800 uppercase tracking-wide">TOTAL:</span>
          <span className="text-[14px] font-black flex items-center gap-1">
            {hasTarget && rangeTarget > 0 ? (
              <>
                {React.createElement(AmountIcon, { className: amountIconClass })}
                <span className={amountColor}>{amountPrefix}{formatSmartAmt(total)}</span>
                <span className="text-slate-900"> / {formatSmartAmt(rangeTarget)}</span>
              </>
            ) : (
              <span className="text-slate-900">{formatSmartAmt(total)}</span>
            )}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-black text-slate-800 uppercase tracking-wide">FOOTFALL:</span>
          <span className="text-[14px] font-black flex items-center gap-1">
            {hasTarget && rangeTargetFF > 0 ? (
              <>
                {React.createElement(FFIcon, { className: ffIconClass })}
                <span className={ffColor}>{ffPrefix}{Math.round(footfall)}</span>
                <span className="text-slate-900"> / {Math.round(rangeTargetFF)}</span>
              </>
            ) : (
              <span className="text-slate-900">{Math.round(footfall)}</span>
            )}
          </span>
        </div>
      </div>
      <div className="space-y-1 pt-2 border-t border-slate-100">
        {metrics.map((m) => {
          const Icon = m.icon;
          const val = Number(data[m.key]) || 0;
          return (
            <div key={m.key} className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-600 font-bold"><Icon className={`w-2.5 h-2.5 ${m.color}`} /> {m.label}</span>
              <span className={`font-black ${m.color}`}>{formatSmartAmt(val)}</span>
            </div>
          );
        })}
      </div>
      {hasTarget && (
        <TargetProgressStrip rangeTarget={rangeTarget} achieved={total} hasTarget={hasTarget}
          rangeLabel={rangeLabel} targetFootFall={rangeTargetFF} achievedFootFall={footfall} />
      )}
    </div>
  );
};

/* ============================================================ */
/* Grand Total Card                                              */
/* ============================================================ */
const GrandTotalCard = ({ total, cash, online, due, footFall, rangeTarget = 0, hasTarget = false, rangeLabel = "Target", rangeTargetFF = 0 }) => {
  const formatSmartAmt = (val) => {
    const roundedNum = Math.round(Number(val) || 0);
    if (roundedNum >= 10000000) return `₹${(roundedNum / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
    if (roundedNum >= 100000) return `₹${(roundedNum / 100000).toFixed(2).replace(/\.00$/, '')} L`;
    if (roundedNum >= 1000) return `₹${(roundedNum / 1000).toFixed(1).replace(/\.0$/, '')}K`;
    return `₹${fmt(roundedNum)}`;
  };

  const diff = total - rangeTarget;
  const diffAbs = Math.abs(diff);
  const pct = rangeTarget > 0 ? (total / rangeTarget) * 100 : 0;
  const shortPct = 100 - pct;
  const barWidth = Math.min(pct, 100);

  let statusLabel = "PENDING", barColor = "bg-white/60", displayPct = `${pct.toFixed(0)}%`;
  if (rangeTarget > 0) {
    if (diffAbs < 0.5) { statusLabel = "MATCHED"; barColor = "bg-emerald-300"; displayPct = "100%"; }
    else if (diff > 0) { statusLabel = "EXCEEDED"; barColor = "bg-cyan-300"; displayPct = `+${(pct - 100).toFixed(0)}%`; }
    else { statusLabel = "SHORTFALL"; barColor = "bg-rose-300"; displayPct = `-${shortPct.toFixed(0)}%`; }
  }

  const totalPrefix = (hasTarget && total > rangeTarget) ? "+" : "";
  const ffPrefix = (hasTarget && rangeTargetFF > 0 && footFall > rangeTargetFF) ? "+" : "";

  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-3 text-white shadow-md shadow-blue-500/20">
      <div className="flex items-start gap-2 mb-2">
        <span className="w-8 h-8 rounded-md bg-white/20 flex items-center justify-center text-sm flex-shrink-0"><FaRupeeSign /></span>
        <div className="text-[12px] font-black uppercase tracking-wider leading-8 text-white">Grand Total</div>
      </div>
      <div className="space-y-1 mb-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-black text-white uppercase tracking-wide">GRAND TOTAL:</span>
          <span className="text-[14px] font-black text-white">
            {hasTarget && rangeTarget > 0 ? `${totalPrefix}${formatSmartAmt(total)} / ${formatSmartAmt(rangeTarget)}` : formatSmartAmt(total)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-black text-white uppercase tracking-wide">FOOTFALL TOTAL:</span>
          <span className="text-[14px] font-black text-white">
            {hasTarget && rangeTargetFF > 0 ? `${ffPrefix}${footFall} / ${Math.round(rangeTargetFF)}` : footFall}
          </span>
        </div>
      </div>
      <div className="space-y-1 pt-2 border-t border-white/20">
        {[{ label: "Cash", val: cash, isDue: false }, { label: "Online", val: online, isDue: false }, { label: "Due", val: due, isDue: true }].map((m) => (
          <div key={m.label} className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 text-white/80 font-bold">{m.label}</span>
            <span className={`font-black ${m.isDue ? "text-rose-200" : "text-white"}`}>{formatSmartAmt(m.val)}</span>
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
            <span className="text-[11px] font-black text-white">{formatSmartAmt(total)} / {formatSmartAmt(rangeTarget)}</span>
            <span className="text-[10px] font-black text-white/90">{displayPct}</span>
          </div>
          <div className="w-full h-1 rounded-full bg-white/20 overflow-hidden">
            <div className={`h-full ${barColor}`} style={{ width: `${barWidth}%` }} />
          </div>
          {diffAbs >= 0.5 && (
            <div className="text-[9px] font-bold mt-1 text-white/90">
              {diff > 0 ? `+₹${fmt(Math.round(diffAbs))} surplus (+${shortPct.toFixed(0)}%)` : `−₹${fmt(Math.round(diffAbs))} short (-${shortPct.toFixed(0)}%)`}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ============================================================ */
/* Add/Edit Target Modal                                        */
/* ============================================================ */
const AddTargetModal = ({ isOpen, onClose, onSave, saving, editTarget = null }) => {
  const isEditMode = !!editTarget;
  const defaultFYStart = isEditMode ? getFYStartForMonth(Number(editTarget.year), Number(editTarget.month)) : getCurrentFYStartYear();
  const [fyStartYear, setFyStartYear] = useState(defaultFYStart);
  const [categories, setCategories] = useState([]);
  const [grid, setGrid] = useState({});
  const [fyError, setFyError] = useState("");
  const [showAddSegment, setShowAddSegment] = useState(false);
  const [newSegName, setNewSegName] = useState("");
  const [newSegCol1, setNewSegCol1] = useState("SALES");
  const [newSegCol2, setNewSegCol2] = useState("FOOTFALL");
  
  const [newSegAssoc, setNewSegAssoc] = useState("Pharmacy");
  const [newSegCard, setNewSegCard] = useState(false);

  const currentFYStart = getCurrentFYStartYear();

  const fyOptions = useMemo(() => {
    const arr = [];
    const endYear = currentFYStart + 2;
    for (let y = FY_START_FROM; y <= endYear; y++) arr.push(y);
    if (isEditMode && !arr.includes(defaultFYStart)) { arr.push(defaultFYStart); arr.sort((a, b) => a - b); }
    return arr;
  }, [currentFYStart, isEditMode, defaultFYStart]);

  useEffect(() => {
    if (isOpen) {
      setFyError("");
      setFyStartYear(defaultFYStart);
      let savedCats = [];
      try {
        const stored = localStorage.getItem("revenue_custom_segments");
        if (stored) savedCats = JSON.parse(stored);
      } catch (e) { console.error(e); }
      const allCats = [...DEFAULT_CATEGORIES, ...savedCats];
      setCategories(allCats);
      const emptyGrid = {};
      FY_MONTH_ORDER.forEach((m) => {
        emptyGrid[m] = {};
        allCats.forEach((c) => { emptyGrid[m][c.key] = { amount: "", footFall: "" }; });
      });
      if (isEditMode && editTarget) {
        const editMonth = Number(editTarget.month);
        const editYear = Number(editTarget.year);
        const editFYStart = getFYStartForMonth(editYear, editMonth);
        if (editFYStart === defaultFYStart) {
          allCats.forEach((cat) => {
            const catData = editTarget.categories?.[cat.key];
            if (catData) {
              emptyGrid[editMonth][cat.key].amount = catData.amount > 0 ? (catData.amount / 100000).toFixed(2).replace(/\.00$/, '') : "";
              emptyGrid[editMonth][cat.key].footFall = catData.footFall > 0 ? String(catData.footFall) : "";
            }
          });
        }
      }
      setGrid(emptyGrid);
    }
  }, [isOpen, editTarget]);

  if (!isOpen) return null;

  const handleAddSegmentSubmit = () => {
    if (!newSegName.trim()) return;
    const key = `custom_${Date.now()}`;
    const color = COLOR_PALETTE[categories.length % COLOR_PALETTE.length].color;
    
    const newCat = { 
      key, 
      label: newSegName.trim(), 
      color, 
      short: newSegName.slice(0, 2).toUpperCase(), 
      col1: newSegCol1.trim() || "SALES", 
      col2: newSegCol2.trim() || "FOOTFALL",
      associatedWith: newSegAssoc,
      cardNeeded: newSegCard
    };

    const updatedCats = [...categories, newCat];
    setCategories(updatedCats);
    try { localStorage.setItem("revenue_custom_segments", JSON.stringify(updatedCats.filter(c => c.key.startsWith("custom_")))); } catch (e) { console.error(e); }
    setGrid(prev => {
      const next = { ...prev };
      FY_MONTH_ORDER.forEach((m) => { next[m] = { ...(next[m] || {}), [key]: { amount: "", footFall: "" } }; });
      return next;
    });
    setNewSegName(""); setNewSegCol1("SALES"); setNewSegCol2("FOOTFALL"); setNewSegAssoc("Pharmacy"); setNewSegCard(false); setShowAddSegment(false);
  };

  const handleRemoveSegment = (catKey) => {
    if (!window.confirm("Are you sure you want to remove this segment?")) return;
    const updatedCats = categories.filter(c => c.key !== catKey);
    setCategories(updatedCats);
    try { localStorage.setItem("revenue_custom_segments", JSON.stringify(updatedCats.filter(c => c.key.startsWith("custom_")))); } catch (e) { console.error(e); }
    setGrid(prev => {
      const next = { ...prev };
      FY_MONTH_ORDER.forEach((m) => { if (next[m]) delete next[m][catKey]; });
      return next;
    });
  };

  const handleSubmit = () => {
    const entries = [];
    let totalAmt = 0, totalFootFall = 0;
    FY_MONTH_ORDER.forEach((m) => {
      const calendarYear = m >= 4 ? fyStartYear : fyStartYear + 1;
      categories.forEach((cat) => {
        const amtRaw = grid?.[m]?.[cat.key]?.amount;
        const ffRaw = grid?.[m]?.[cat.key]?.footFall;
        const amt = (Number(amtRaw) || 0) * 100000;
        const ff = Number(ffRaw) || 0;
        if (amt > 0 || ff > 0) {
          entries.push({ category: cat.key, categoryLabel: cat.label, month: m, year: calendarYear, amount: amt, footFall: ff });
          totalAmt += amt; totalFootFall += ff;
        }
      });
    });
    if (entries.length === 0) { setFyError("Please enter at least one amount or footfall in the grid"); return; }
    setFyError("");
    onSave({ mode: isEditMode ? "edit" : "fy", fyStartYear, entries, totalAmount: totalAmt, totalFootFall, editTarget: isEditMode ? editTarget : null });
  };

  const handleGridChange = (month, catKey, field, value) => {
    setGrid((prev) => ({ ...prev, [month]: { ...(prev[month] || {}), [catKey]: { ...(prev[month]?.[catKey] || { amount: "", footFall: "" }), [field]: value } } }));
  };

  const getCategoryTotal = (catKey, field) => {
    let sum = 0;
    FY_MONTH_ORDER.forEach((m) => { const val = Number(grid?.[m]?.[catKey]?.[field]) || 0; sum += field === "amount" ? val * 100000 : val; });
    return sum;
  };
  const getMonthTotal = (month, field) => {
    let sum = 0;
    categories.forEach((c) => { const val = Number(grid?.[month]?.[c.key]?.[field]) || 0; sum += field === "amount" ? val * 100000 : val; });
    return sum;
  };
  const getGrandTotal = (field) => { let sum = 0; categories.forEach((c) => { sum += getCategoryTotal(c.key, field); }); return sum; };

  const editMonth = isEditMode ? Number(editTarget.month) : null;
  const styles = getDynamicStyles(categories);

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[999999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-[95vw] shadow-2xl border border-purple-200 overflow-hidden flex flex-col max-h-[95vh]">
        <div className={`px-5 py-4 text-white flex items-center gap-3 flex-shrink-0 ${isEditMode ? "bg-gradient-to-r from-blue-600 to-indigo-600" : "bg-gradient-to-r from-purple-600 to-indigo-600"}`}>
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            {isEditMode ? <FaEdit className="w-5 h-5" /> : <FiTarget className="w-5 h-5" />}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm m-0">{isEditMode ? `Edit Target for ${MONTHS[editMonth - 1]} ${editTarget.year}` : "Set Your Target"}</h3>
            <p className="text-[10px] text-white/80 m-0 mt-0.5">{isEditMode ? "Update the target values for this month (or any other month in the FY)" : "Enter targets for the full Financial Year (Apr → Mar). Note: Amounts should be entered in LAKHS (e.g. 2 = 2 Lakhs)."}</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setShowAddSegment(true)} className="px-3 py-1.5 text-[11px] font-bold text-purple-700 bg-white rounded shadow-sm hover:bg-purple-50 flex items-center gap-1.5 transition-colors">
              <FaPlus className="w-3 h-3" /> Add Segment
            </button>
            <button type="button" onClick={onClose} disabled={saving} className="w-7 h-7 rounded-md flex items-center justify-center text-white/80 hover:bg-white/20 hover:text-white disabled:opacity-50 ml-2">
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-3 overflow-y-auto flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-bold text-purple-700 uppercase">Financial Year:</label>
              <select value={fyStartYear} onChange={(e) => setFyStartYear(Number(e.target.value))} disabled={isEditMode}
                className="h-9 text-xs font-bold text-purple-800 bg-white border border-purple-300 rounded px-3 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 disabled:bg-slate-100 disabled:text-slate-500">
                {fyOptions.map((y) => (<option key={y} value={y}>FY {formatFY(y)}</option>))}
              </select>
            </div>
            <div className="text-[10px] font-semibold text-slate-500">({FY_MONTH_SHORT[4]} {fyStartYear} → {FY_MONTH_SHORT[3]} {fyStartYear + 1})</div>
            {isEditMode && <div className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded">Editing: {MONTHS[editMonth - 1]} {editTarget.year}</div>}
            <div className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-1 rounded flex items-center gap-1">
              <FiAlertCircle className="w-3 h-3" /> Amount in Lakhs (e.g. 2 = 2,00,000)
            </div>
          </div>

          <div className="border border-purple-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="px-2 py-2 text-center font-bold text-white uppercase tracking-wider text-[10px] border-r border-b border-purple-700 bg-purple-700 sticky left-0 z-20 whitespace-nowrap w-[80px]" rowSpan={2}>Month</th>
                    {categories.map((cat) => (
                      <th key={cat.key} colSpan={2} className={`px-2 py-2 text-center font-bold text-white uppercase tracking-wider text-[10px] border-r border-b ${styles.header[cat.key]} whitespace-nowrap relative group`}>
                        {cat.label}
                        {cat.key.startsWith("custom_") && (
                          <button type="button" onClick={() => handleRemoveSegment(cat.key)} className="absolute top-1/2 -translate-y-1/2 right-2 p-1 rounded text-white/70 hover:bg-red-600 hover:text-white transition-colors" title="Remove Segment">
                            <FaMinusCircle className="w-4 h-4" />
                          </button>
                        )}
                      </th>
                    ))}
                    <th className="px-2 py-2 text-center font-bold text-white uppercase tracking-wider text-[10px] bg-indigo-700 border-b border-indigo-800 whitespace-nowrap" colSpan={2}>Total</th>
                  </tr>
                  <tr>
                    {categories.map((cat) => (
                      <React.Fragment key={cat.key}>
                        <th className={`px-1.5 py-1.5 text-center font-bold uppercase tracking-wider text-[9px] border-r border-b ${styles.sub[cat.key]} whitespace-nowrap w-[80px]`}>{cat.col1 || "Amount"} (₹ Lakhs)</th>
                        <th className={`px-1.5 py-1.5 text-center font-bold uppercase tracking-wider text-[9px] border-r border-b ${styles.sub[cat.key]} whitespace-nowrap w-[80px]`}>{cat.col2 || "FootFall"}</th>
                      </React.Fragment>
                    ))}
                    <th className="px-1.5 py-1.5 text-center font-bold text-indigo-700 uppercase tracking-wider text-[9px] border-r border-b border-indigo-100 bg-indigo-50 whitespace-nowrap w-[80px]">Total</th>
                    <th className="px-1.5 py-1.5 text-center font-bold text-indigo-700 uppercase tracking-wider text-[9px] border-b border-indigo-100 bg-indigo-50 whitespace-nowrap w-[80px]">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {FY_MONTH_ORDER.map((m) => {
                    const yr = m >= 4 ? fyStartYear : fyStartYear + 1;
                    const isEditRow = isEditMode && m === editMonth;
                    const monthTotalAmount = getMonthTotal(m, "amount");
                    const monthTotalFF = getMonthTotal(m, "footFall");
                    return (
                      <tr key={m} className={`hover:bg-slate-50 ${isEditRow ? "bg-blue-50/50" : ""}`}>
                        <td className={`px-2 py-2 text-center font-bold text-[11px] border-r border-b sticky left-0 z-10 whitespace-nowrap w-[80px] ${isEditRow ? "bg-blue-100 text-blue-800" : "bg-slate-50 text-slate-700"}`}>
                          <div>{FY_MONTH_SHORT[m]}</div>
                          <div className="text-[9px] font-semibold text-slate-500 mt-0.5">{yr}</div>
                        </td>
                        {categories.map((cat) => {
                          const cellData = grid?.[m]?.[cat.key] || { amount: "", footFall: "" };
                          return (
                            <React.Fragment key={cat.key}>
                              <td className={`px-1 py-1.5 border-r border-b text-center ${isEditRow ? "bg-blue-50" : "bg-white"}`}>
                                <input type="number" min="0" placeholder="0" value={cellData.amount}
                                  onChange={(e) => handleGridChange(m, cat.key, "amount", e.target.value)}
                                  className={`w-full text-center text-[11px] font-bold text-slate-800 bg-white border rounded px-1 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 ${isEditRow ? "border-blue-400" : "border-slate-300"}`} />
                              </td>
                              <td className={`px-1 py-1.5 border-r border-b text-center ${isEditRow ? "bg-blue-50" : "bg-white"}`}>
                                <input type="number" min="0" placeholder="0" value={cellData.footFall}
                                  onChange={(e) => handleGridChange(m, cat.key, "footFall", e.target.value)}
                                  className={`w-full text-center text-[11px] font-bold text-slate-800 bg-white border rounded px-1 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 ${isEditRow ? "border-blue-400" : "border-slate-300"}`} />
                              </td>
                            </React.Fragment>
                          );
                        })}
                        <td className="px-2 py-2 text-center font-black text-indigo-800 text-xs bg-indigo-50 border-r border-b whitespace-nowrap">{monthTotalAmount > 0 ? fmt(monthTotalAmount) : "—"}</td>
                        <td className="px-2 py-2 text-center font-black text-indigo-800 text-xs bg-indigo-50 border-b whitespace-nowrap">{monthTotalFF > 0 ? fmt(monthTotalFF) : "—"}</td>
                      </tr>
                    );
                  })}
                  <tr className="bg-gradient-to-r from-slate-100 to-slate-50 border-t-2 border-slate-300">
                    <td className="px-2 py-2 text-center font-black text-slate-900 text-[10px] uppercase tracking-wider border-r border-slate-300 bg-slate-200 sticky left-0 z-10 whitespace-nowrap w-[80px]">Grand Total</td>
                    {categories.map((cat) => {
                      const catTotalAmt = getCategoryTotal(cat.key, "amount");
                      const catTotalFF = getCategoryTotal(cat.key, "footFall");
                      return (
                        <React.Fragment key={cat.key}>
                          <td className="px-2 py-2 text-center font-black text-indigo-900 text-xs bg-indigo-100 border-r border-slate-200 whitespace-nowrap">{catTotalAmt > 0 ? fmt(catTotalAmt) : "—"}</td>
                          <td className="px-2 py-2 text-center font-black text-indigo-900 text-xs bg-indigo-100 border-r border-slate-200 whitespace-nowrap">{catTotalFF > 0 ? fmt(catTotalFF) : "—"}</td>
                        </React.Fragment>
                      );
                    })}
                    <td className="px-2 py-2 text-center font-black text-indigo-900 text-sm bg-indigo-200 border-r border-slate-200 whitespace-nowrap">{getGrandTotal("amount") > 0 ? fmt(getGrandTotal("amount")) : "—"}</td>
                    <td className="px-2 py-2 text-center font-black text-indigo-900 text-sm bg-indigo-200 whitespace-nowrap">{getGrandTotal("footFall") > 0 ? fmt(getGrandTotal("footFall")) : "—"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {fyError && <div className="flex items-center gap-1 text-[10px] font-bold text-rose-600"><FiAlertCircle className="w-3 h-3" /> {fyError}</div>}

          <div className="bg-purple-50 rounded-lg border border-purple-200 p-2.5 text-[11px] text-purple-700 flex items-center justify-between flex-wrap gap-2">
            <span><span className="font-bold">FY {formatFY(fyStartYear)}</span> — Total across all categories:</span>
            <div className="flex gap-4">
              <span className="font-extrabold text-sm">Amt: {fmtAmt(getGrandTotal("amount"))}</span>
              <span className="font-extrabold text-sm">FF: {fmt(getGrandTotal("footFall"))}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 bg-slate-50 border-t border-slate-200 flex-shrink-0">
          <button type="button" onClick={onClose} disabled={saving} className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50">Cancel</button>
          <button type="button" onClick={handleSubmit} disabled={saving}
            className={`px-5 py-2 text-xs font-bold text-white rounded-lg shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 ${isEditMode ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"}`}>
            {saving ? <FiRefreshCw className="w-3 h-3 animate-spin" /> : <FaSave className="w-3 h-3" />}
            {saving ? (isEditMode ? "Updating..." : "Saving...") : (isEditMode ? `Update Targets` : `Save FY ${formatFY(fyStartYear)} Targets`)}
          </button>
        </div>
      </div>

      {showAddSegment && (
        <div className="fixed inset-0 z-[9999999] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl p-5 border border-slate-200">
            <h3 className="text-base font-bold text-slate-800 mb-1">Add New Segment</h3>
            <p className="text-xs text-slate-500 mb-4">Add a custom category and define the names for its two sub-columns.</p>
            <div className="space-y-4 mb-5">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Segment Name</label>
                <input type="text" autoFocus value={newSegName} onChange={(e) => setNewSegName(e.target.value)} placeholder="e.g. W-PHARMACY" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Sub-column 1 Name</label>
                  <input type="text" value={newSegCol1} onChange={(e) => setNewSegCol1(e.target.value)} placeholder="e.g. SALES" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Sub-column 2 Name</label>
                  <input type="text" value={newSegCol2} onChange={(e) => setNewSegCol2(e.target.value)} placeholder="e.g. FOOTFALL" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Associated With</label>
                <select value={newSegAssoc} onChange={(e) => setNewSegAssoc(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20">
                  <option value="Pharmacy">Pharmacy</option>
                  <option value="Clinic">Clinic</option>
                  <option value="Lab">Lab</option>
                  <option value="Non">Non</option>
                </select>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" id="cardNeeded" checked={newSegCard} onChange={(e) => setNewSegCard(e.target.checked)} className="w-4 h-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500" />
                <label htmlFor="cardNeeded" className="text-[11px] font-bold text-slate-600 cursor-pointer">Display as Card on Top</label>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button type="button" onClick={() => setShowAddSegment(false)} className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md">Cancel</button>
              <button type="button" onClick={handleAddSegmentSubmit} disabled={!newSegName.trim()} className="px-4 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-md shadow-sm disabled:opacity-50">Add Segment</button>
            </div>
          </div>
        </div>
      )}
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
  return rows.filter((r) => { if (!r.date) return false; return r.date >= fromDate && r.date <= toDate; });
};

const sumCategoryFromRows = (rows) => {
  const acc = { clinic: 0, lab: 0, clinicPharmacy: 0, retailPharmacy: 0, total: 0, clinicFF: 0, labFF: 0, clinicPharmacyFF: 0, retailPharmacyFF: 0, totalFF: 0 };
  if (!Array.isArray(rows)) return acc;
  rows.forEach((r) => {
    acc.clinic += Number(r.clinic?.total) || 0;
    acc.lab += Number(r.lab?.total) || 0;
    acc.clinicPharmacy += Number(r.pharmacy?.total) || 0;
    acc.retailPharmacy += Number(r.retailPharmacy?.total) || 0;
    acc.clinicFF += Number(r.clinic?.footFall) || 0;
    acc.labFF += Number(r.lab?.footFall) || 0;
    acc.clinicPharmacyFF += Number(r.pharmacy?.footFall) || 0;
    acc.retailPharmacyFF += Number(r.retailPharmacy?.footFall) || 0;
  });
  acc.total = acc.clinic + acc.lab + acc.clinicPharmacy + acc.retailPharmacy;
  acc.totalFF = acc.clinicFF + acc.labFF + acc.clinicPharmacyFF + acc.retailPharmacyFF;
  return acc;
};

/* ============================================================ */
/* Donut Chart                                                   */
/* ============================================================ */
const DonutChart = ({ total, cash, online, due, footFall, rangeTarget = 0, hasTarget = false, rangeTargetFF = 0, title = "Total", size = 320, color = "blue" }) => {
  const center = size / 2;
  const radius = (size / 2) - 10;
  const thickness = 110;
  const innerRadius = radius - thickness;

  const safeTotal = Number(total) || 0;
  const safeCash = Number(cash) || 0;
  const safeOnline = Number(online) || 0;
  const safeDue = Number(due) || 0;
  const safeFootFall = Number(footFall) || 0;

  const categoryBaseColor = { blue: "#1e40af", purple: "#6b21a8", emerald: "#047857", amber: "#b45309", indigo: "#312e81" }[color] || "#1e40af";
  const colors = { total: categoryBaseColor, due: "#f43f5e", online: "#0ea5e9", cash: "#10b981", footFall: "#8b5cf6" };

  let rawSlices = [
    { key: "total", label: "Total", value: safeTotal, color: colors.total },
    { key: "due", label: "Due", value: safeDue, color: colors.due },
    { key: "online", label: "Online", value: safeOnline, color: colors.online },
    { key: "cash", label: "Cash", value: safeCash, color: colors.cash },
    { key: "ff", label: "Footfall", value: safeFootFall, color: colors.footFall, isFF: true },
  ].filter(s => s.value > 0);

  let hasRealData = rawSlices.length > 0;
  if (title === "Grand Total" && safeTotal > 0) { hasRealData = true; if (rawSlices.length === 0) rawSlices = [{ key: "total", label: "Total", value: safeTotal, color: colors.total }]; }

  let smallSlices = [], largeSlices = [];
  const MIN_ANGLE = 45;
  if (hasRealData) {
    let processedSlices = rawSlices.map(s => { let base = safeTotal > 0 ? safeTotal : (safeFootFall > 0 ? safeFootFall : 1); return { ...s, angle: (s.value / base) * 360 }; });
    processedSlices.forEach(s => { if (s.angle < MIN_ANGLE && s.key !== "total") { s.angle = MIN_ANGLE; smallSlices.push(s); } else { largeSlices.push(s); } });
    if (smallSlices.length > 0) {
      const usedBySmall = smallSlices.reduce((acc, curr) => acc + curr.angle, 0);
      const availableForLarge = 360 - usedBySmall;
      let originalLargeAngleSum = 0;
      largeSlices.forEach(s => { let base = safeTotal > 0 ? safeTotal : 1; originalLargeAngleSum += (s.value / base) * 360; });
      largeSlices = largeSlices.map(s => { let base = safeTotal > 0 ? safeTotal : 1; const orig = (s.value / base) * 360; return { ...s, angle: originalLargeAngleSum > 0 ? (orig / originalLargeAngleSum) * availableForLarge : 0 }; });
    }
  }

  const finalSlices = [...largeSlices, ...smallSlices];
  const shortNum = (v) => {
    const n = Math.round(Number(v) || 0);
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2).replace(/\.00$/, "")}Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(2).replace(/\.00$/, "")}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
    return `₹${n}`;
  };

  let startAngle = -90;
  const renderedPaths = [];
  finalSlices.forEach((slice, idx) => {
    if (slice.angle === 0) return;
    const endAngle = startAngle + slice.angle;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = center + radius * Math.cos(startRad), y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad), y2 = center + radius * Math.sin(endRad);
    const x3 = center + innerRadius * Math.cos(endRad), y3 = center + innerRadius * Math.sin(endRad);
    const x4 = center + innerRadius * Math.cos(startRad), y4 = center + innerRadius * Math.sin(startRad);
    const largeArcFlag = slice.angle > 180 ? 1 : 0;
    const pathData = [`M ${x1} ${y1}`, `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`, `L ${x3} ${y3}`, `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`, `Z`].join(" ");
    const midAngle = startAngle + slice.angle / 2;
    const midRad = (midAngle * Math.PI) / 180;
    const textRadius = innerRadius + thickness / 2;
    const textX = center + textRadius * Math.cos(midRad), textY = center + textRadius * Math.sin(midRad);

    let valStr = "", subStr = "";
    if (slice.isFF) {
      const targetFF = Math.round(rangeTargetFF) || 0;
      valStr = `${Number(slice.value).toLocaleString('en-IN')}${hasTarget ? ` / ${targetFF}` : ""}`;
      const diff = targetFF - slice.value, diffAbs = Math.abs(diff);
      if (hasTarget && diffAbs > 0.5) subStr = diff > 0 ? `Short ${Math.round(diffAbs)}` : `Surp +${Math.round(diffAbs)}`;
    } else {
      valStr = `${shortNum(slice.value)}${hasTarget && rangeTarget > 0 ? ` / ${shortNum(rangeTarget)}` : ""}`;
      if (hasTarget && rangeTarget > 0) {
        let targetShare = slice.key === "total" ? rangeTarget : (safeTotal > 0 ? (slice.value / safeTotal) * rangeTarget : 0);
        const diff = targetShare - slice.value, diffAbs = Math.abs(diff);
        if (diffAbs > 0.5) subStr = diff > 0 ? `Short ${shortNum(diffAbs)}` : `Surp +${shortNum(diffAbs)}`;
      }
    }

    renderedPaths.push(
      <g key={idx}>
        <path d={pathData} fill={slice.color} stroke="#ffffff" strokeWidth="2" />
        <text x={textX} y={textY} fill="#ffffff" textAnchor="middle" dominantBaseline="middle" className="font-sans">
          <tspan x={textX} dy="-1.6em" className="font-bold text-[13px]">{slice.label}</tspan>
          <tspan x={textX} dy="1.4em" className="font-black text-[14px]">{valStr}</tspan>
          {subStr && (<tspan x={textX} dy="1.4em" className="font-bold text-[10px] opacity-90">{subStr}</tspan>)}
        </text>
      </g>
    );
    startAngle = endAngle;
  });

  const targetDiff = safeTotal - rangeTarget;
  const diffAbs = Math.abs(targetDiff);
  const pct = rangeTarget > 0 ? (safeTotal / rangeTarget) * 100 : 0;
  const shortPct = 100 - pct;
  const isMatched = hasTarget && rangeTarget > 0 && diffAbs < 0.5;
  const isSurplus = hasTarget && rangeTarget > 0 && targetDiff > 0;

  return (
    <div className="flex flex-col bg-white rounded-lg border border-slate-200 p-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="text-[13px] font-black uppercase tracking-wider text-slate-700 mb-1 text-center border-b border-slate-100 pb-1">{title}</div>
      <div className="flex justify-center items-center relative my-1" style={{ height: size }}>
        <svg width={size} height={size} className="block">
          <circle cx={center} cy={center} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={thickness} />
          {renderedPaths}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-[10px] font-black uppercase tracking-wide text-slate-500">TOTAL</div>
          <div className="font-black text-slate-800 text-xl leading-tight">{shortNum(safeTotal)}</div>
          {hasTarget && rangeTarget > 0 && (
            <div className="flex flex-col items-center mt-1">
              <div className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${isMatched ? "text-emerald-600 bg-emerald-50" : isSurplus ? "text-blue-600 bg-blue-50" : "text-rose-600 bg-rose-50"}`}>
                {isMatched ? "100%" : isSurplus ? `+${(pct - 100).toFixed(0)}%` : `-${shortPct.toFixed(0)}%`}
              </div>
              <div className={`text-[9px] font-black uppercase mt-0.5 ${isMatched ? "text-emerald-600" : isSurplus ? "text-blue-600" : "text-rose-600"}`}>
                {isMatched ? "MATCHED" : isSurplus ? "SURPLUS" : "SHORT"}
              </div>
            </div>
          )}
        </div>
      </div>
      {hasTarget && rangeTarget > 0 && (
        <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[10px]"><span className="font-semibold text-slate-500">Target:</span><span className="font-black text-slate-700">{shortNum(rangeTarget)}</span></div>
          <div className="flex items-center justify-between text-[10px]"><span className="font-semibold text-slate-500">Status:</span><span className={`font-black uppercase ${isMatched ? "text-emerald-600" : isSurplus ? "text-blue-600" : "text-rose-600"}`}>{isMatched ? "MATCHED" : isSurplus ? "EXCEEDED" : "SHORTFALL"}</span></div>
          {!isMatched && (
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-semibold text-slate-500">{isSurplus ? "Surplus:" : "Short:"}</span>
              <span className={`font-black ${isSurplus ? "text-blue-600" : "text-rose-600"}`}>{isSurplus ? "+" : "−"}{shortNum(diffAbs)} ({isSurplus ? "+" : "−"}{isSurplus ? (pct - 100).toFixed(0) : shortPct.toFixed(0)}%)</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ============================================================ */
/* GraphRepresentation                                          */
/* ============================================================ */
const GraphRepresentation = ({ cards, grandTotal, hasRangeTarget, rangeLabel = "Target" }) => {
  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm mb-3">
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 px-3 py-2 flex items-center gap-2 text-white">
        <FiPieChart className="w-4 h-4" />
        <h2 className="text-sm font-bold m-0">Graphical Representation</h2>
        <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded">Breakdown with Targets</span>
      </div>
      <div className="p-4 bg-slate-50">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {cards.map((card) => (
            <DonutChart key={card.key} title={card.title} total={card.total}
              cash={card.data.cash || 0} online={card.data.online || 0} due={card.data.due || 0}
              footFall={card.footfall || 0} rangeTarget={card.rangeTarget} rangeTargetFF={card.rangeTargetFF}
              hasTarget={hasRangeTarget && card.rangeTarget > 0} color={card.accent} />
          ))}
          <DonutChart title="Grand Total" total={grandTotal.total}
            cash={grandTotal.cash || 0} online={grandTotal.online || 0} due={grandTotal.due || 0}
            footFall={grandTotal.footFall || 0} rangeTarget={grandTotal.rangeTarget || 0}
            rangeTargetFF={grandTotal.rangeTargetFF || 0}
            hasTarget={hasRangeTarget && (grandTotal.rangeTarget || 0) > 0} color="indigo" />
        </div>
      </div>
    </div>
  );
};

/* ============================================================ */
/* Target Tracker                                               */
/* ============================================================ */
const TargetTracker = ({ onSetTargetClick, onExportClick, allTargets, loadingAllTargets, onEditRow, onDeleteRow, isHidden, onToggleHidden, fromDate, toDate, activePreset, rangeAchieved = {} }) => {
  const dynamicCategories = useMemo(() => {
    let savedCats = [];
    try { const stored = localStorage.getItem("revenue_custom_segments"); if (stored) savedCats = JSON.parse(stored); } catch (e) { console.error(e); }
    const seen = new Set();
    const cats = [];
    DEFAULT_CATEGORIES.forEach(def => { seen.add(def.key); cats.push(def); });
    savedCats.forEach(c => { if (!seen.has(c.key)) { seen.add(c.key); cats.push(c); } });
    if (allTargets && allTargets.length > 0) {
      allTargets.forEach(t => {
        if (t.category && !seen.has(t.category)) {
          seen.add(t.category);
          cats.push({ key: t.category, label: t.categoryLabel || t.category.replace("custom_", "Segment "), color: COLOR_PALETTE[cats.length % COLOR_PALETTE.length].color, short: (t.categoryLabel || "SG").slice(0, 2).toUpperCase(), col1: "Amount", col2: "FootFall" });
        }
      });
    }
    return cats;
  }, [allTargets]);

  const filteredTargets = useMemo(() => {
    if (!allTargets || allTargets.length === 0) return [];
    if (!fromDate || !toDate) return [];
    const rangeStart = new Date(fromDate + "T00:00:00");
    const rangeEnd = new Date(toDate + "T23:59:59");
    const monthMap = new Map();
    allTargets.forEach((t) => {
      const m = Number(t.month), y = Number(t.year);
      const key = `${y}-${m}`;
      if (!monthMap.has(key)) monthMap.set(key, { year: y, month: m, categories: {}, ids: [], savedAt: t.savedAt });
      const g = monthMap.get(key);
      if (t.category) {
        if (!g.categories[t.category]) g.categories[t.category] = { amount: 0, footFall: 0, ids: [] };
        g.categories[t.category].amount += Number(t.amount) || 0;
        g.categories[t.category].footFall += Number(t.footFall) || 0;
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
      let totalScaled = 0, totalFootFall = 0;
      Object.keys(g.categories).forEach((ck) => {
        const amt = g.categories[ck].amount * ratio;
        const ff = g.categories[ck].footFall * ratio;
        scaledCategories[ck] = { amount: amt, footFall: ff, ids: g.categories[ck].ids };
        totalScaled += amt; totalFootFall += ff;
      });
      out.push({ _id: g.ids[0], ids: g.ids, month: g.month, year: g.year, amount: totalScaled, totalFootFall, categories: scaledCategories, daysInRange, daysInMonth: dim, ratio, savedAt: g.savedAt });
    });
    return out.sort((a, b) => { if (Number(b.year) !== Number(a.year)) return Number(b.year) - Number(a.year); return Number(b.month) - Number(a.month); });
  }, [allTargets, fromDate, toDate]);

  const rangeLabel = useMemo(() => {
    if (activePreset === "today") return "Today's Target";
    if (activePreset === "yesterday") return "Yesterday's Target";
    if (activePreset === "thisWeek") return "This Week's Target";
    if (activePreset === "last7Days") return "Last 7 Days Target";
    if (activePreset === "thisMonth") return "This Month's Target";
    if (activePreset === "lastMonth") return "Last Month's Target";
    if (activePreset === "thisYear") return "This Year's Target";
    return "Range Target";
  }, [activePreset]);

  const getDateLabelForRow = (t) => {
    if (activePreset === "today" || activePreset === "yesterday") return formatDateToDDMMYYYY(fromDate);
    if (["thisWeek", "thisMonth", "lastMonth", "thisYear", "last7Days"].includes(activePreset)) return `${FY_MONTH_SHORT[t.month]}-${t.year}`;
    return `${formatDateToDDMMYYYY(fromDate)} – ${formatDateToDDMMYYYY(toDate)}`;
  };

  const styles = getDynamicStyles(dynamicCategories);

  return (
    <div className="bg-white rounded-lg border border-purple-200 overflow-hidden shadow-sm mb-3">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-3 py-2 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-white">
          <FiTarget className="w-4 h-4" />
          <h2 className="text-sm font-bold m-0">Monthly Target Tracker</h2>
          <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded">{filteredTargets.length} month{filteredTargets.length !== 1 ? "s" : ""} · {rangeLabel}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={onSetTargetClick} className="px-3 py-1.5 text-[11px] font-bold text-purple-700 bg-white rounded-md hover:bg-purple-50 flex items-center gap-1.5 shadow-sm"><FiPlus className="w-3 h-3" /> Set Your Target</button>
          <button type="button" onClick={onExportClick} className="px-3 py-1.5 text-[11px] font-bold text-blue-700 bg-white rounded-md hover:bg-blue-50 flex items-center gap-1.5 shadow-sm"><FiDownload className="w-3 h-3" /> Export</button>
          <button type="button" onClick={onToggleHidden} className="px-2.5 py-1.5 text-[10px] font-bold text-white bg-white/20 rounded hover:bg-white/30 flex items-center gap-1">
            {isHidden ? <FiEye className="w-3 h-3" /> : <FiEyeOff className="w-3 h-3" />}{isHidden ? "Show" : "Hide"}
          </button>
        </div>
      </div>
      {!isHidden && (
        <div className="p-3 overflow-x-auto">
          {loadingAllTargets && (!allTargets || allTargets.length === 0) ? (
            <div className="flex items-center justify-center py-8 text-slate-500"><FiRefreshCw className="w-5 h-5 text-purple-500 animate-spin mr-2" /><span className="text-xs font-medium">Loading targets...</span></div>
          ) : filteredTargets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <FaBullseye className="w-10 h-10 mb-2 text-purple-300" />
              <p className="text-xs font-bold text-purple-600 m-0 mb-0.5">No targets for this period</p>
              <p className="text-[11px] font-medium m-0 mb-3">{allTargets && allTargets.length > 0 ? "No targets set for the selected date range." : "Click 'Set Your Target' to add your first target."}</p>
            </div>
          ) : (
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  <th className="px-1 py-2 text-center font-bold text-white uppercase tracking-wider text-[9px] border-r border-blue-800 bg-blue-900" rowSpan={2}>{activePreset === "today" || activePreset === "yesterday" ? "Date" : "Month"}</th>
                  {dynamicCategories.map((cat) => (<th key={cat.key} colSpan={6} className={`px-1 py-2 text-center font-bold text-white uppercase tracking-wider text-[9px] border-r ${styles.header[cat.key]} whitespace-nowrap`}>{cat.label}</th>))}
                  <th className="px-1 py-2 text-center font-bold text-white uppercase tracking-wider text-[9px] bg-indigo-700 border-r border-indigo-800 whitespace-nowrap" colSpan={6}>Summary</th>
                  <th className="px-1 py-2 text-center font-bold text-white uppercase tracking-wider text-[9px] bg-slate-800" rowSpan={2}>Act</th>
                </tr>
                <tr>
                  {dynamicCategories.map((cat) => (
                    <React.Fragment key={cat.key}>
                      <th className={`px-1 py-1.5 text-center font-bold uppercase tracking-wider text-[8px] border-r ${styles.sub[cat.key]}`}>Ach / Tgt</th>
                      <th className={`px-1 py-1.5 text-center font-bold uppercase tracking-wider text-[8px] border-r ${styles.sub[cat.key]}`}>Ach% / 100%</th>
                      <th className={`px-1 py-1.5 text-center font-bold uppercase tracking-wider text-[8px] border-r ${styles.sub[cat.key]}`}>Per Day</th>
                      <th className={`px-1 py-1.5 text-center font-bold uppercase tracking-wider text-[8px] border-r ${styles.sub[cat.key]}`}>Short/Surp</th>
                      <th className={`px-1 py-1.5 text-center font-bold uppercase tracking-wider text-[8px] border-r ${styles.sub[cat.key]}`}>FF A/T</th>
                      <th className={`px-1 py-1.5 text-center font-bold uppercase tracking-wider text-[8px] border-r ${styles.sub[cat.key]}`}>FF Ach%</th>
                    </React.Fragment>
                  ))}
                  <th className="px-1 py-1.5 text-center font-bold text-indigo-700 uppercase tracking-wider text-[8px] border-r border-indigo-100 bg-indigo-50">Ach / Tgt</th>
                  <th className="px-1 py-1.5 text-center font-bold text-indigo-700 uppercase tracking-wider text-[8px] border-r border-indigo-100 bg-indigo-50">Ach% / 100%</th>
                  <th className="px-1 py-1.5 text-center font-bold text-indigo-700 uppercase tracking-wider text-[8px] border-r border-indigo-100 bg-indigo-50">Per Day</th>
                  <th className="px-1 py-1.5 text-center font-bold text-indigo-700 uppercase tracking-wider text-[8px] border-r border-indigo-100 bg-indigo-50">Short/Surp</th>
                  <th className="px-1 py-1.5 text-center font-bold text-indigo-700 uppercase tracking-wider text-[8px] border-r border-indigo-100 bg-indigo-50">FF A/T</th>
                  <th className="px-1 py-1.5 text-center font-bold text-indigo-700 uppercase tracking-wider text-[8px] border-r border-indigo-200 bg-indigo-50">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTargets.map((t) => {
                  const totalTarget = Number(t.amount) || 0;
                  const totalTargetFF = Number(t.totalFootFall) || 0;
                  const catAchMap = { clinic: rangeAchieved.clinic || 0, lab: rangeAchieved.lab || 0, clinicPharmacy: rangeAchieved.clinicPharmacy || 0, retailPharmacy: rangeAchieved.retailPharmacy || 0 };
                  const catAchFFMap = { clinic: rangeAchieved.clinicFF || 0, lab: rangeAchieved.labFF || 0, clinicPharmacy: rangeAchieved.clinicPharmacyFF || 0, retailPharmacy: rangeAchieved.retailPharmacyFF || 0 };
                  const totalAch = rangeAchieved.total || 0;
                  const totalAchFF = rangeAchieved.totalFF || 0;
                  const hasAch = rangeAchieved.hasData === true;
                  const rowDiff = totalAch - totalTarget;
                  const rowDiffAbs = Math.abs(rowDiff);
                  const rowPct = totalTarget > 0 ? (totalAch / totalTarget) * 100 : 0;
                  const rowStatus = getRowStatus(hasAch, totalTarget, rowDiff, rowDiffAbs);
                  const totalPerDay = t.daysInRange > 0 ? totalTarget / t.daysInRange : 0;

                  return (
                    <tr key={`${t.year}-${t.month}`} className="hover:bg-slate-50/60 border-b border-slate-200">
                      <td className="px-1 py-2 text-center font-bold text-slate-800 text-[10px] border-r border-slate-200 bg-slate-50 whitespace-nowrap">
                        <div className="text-purple-700">{getDateLabelForRow(t)}</div>
                        <div className="text-[8px] font-semibold text-slate-400 mt-0.5">({t.daysInRange}/{t.daysInMonth} days)</div>
                      </td>
                      {dynamicCategories.map((cat) => {
                        const catTarget = Number(t.categories?.[cat.key]?.amount) || 0;
                        const catTargetFF = Number(t.categories?.[cat.key]?.footFall) || 0;
                        const catAch = catAchMap[cat.key] || 0;
                        const catAchFF = catAchFFMap[cat.key] || 0;
                        const catDiff = catAch - catTarget;
                        const catDiffAbs = Math.abs(catDiff);
                        const catPct = catTarget > 0 ? (catAch / catTarget) * 100 : 0;
                        const catPerDay = t.daysInRange > 0 ? catTarget / t.daysInRange : 0;
                        const achColor = !hasAch ? "text-slate-400" : (catAch < catTarget ? "text-rose-700" : "text-emerald-700");
                        const pctColor = !hasAch ? "text-slate-400" : (catPct < 100 ? "text-rose-700" : "text-emerald-700");
                        const ffColor = !hasAch ? "text-slate-400" : (catAchFF < catTargetFF ? "text-rose-700" : "text-emerald-700");
                        return (
                          <React.Fragment key={cat.key}>
                            <td className={`px-1 py-2 text-center font-bold text-[9px] border-r ${styles.cell[cat.key]}`}>
                              <div className={achColor}>{hasAch ? (catAch > 0 ? fmtAmt(Math.round(catAch)) : "—") : "—"}</div>
                              <div className="w-3/4 mx-auto border-t border-slate-300 my-0.5"></div>
                              <div className="text-purple-800">{catTarget > 0 ? fmtAmt(Math.round(catTarget)) : "—"}</div>
                            </td>
                            <td className={`px-1 py-2 text-center font-bold text-[9px] border-r ${styles.cell[cat.key]}`}>
                              <div className={pctColor}>{hasAch && catTarget > 0 ? `${catPct.toFixed(1)}%` : "—"}</div>
                              <div className="w-3/4 mx-auto border-t border-slate-300 my-0.5"></div>
                              <div className="text-slate-500">100%</div>
                            </td>
                            <td className={`px-1 py-2 text-center font-bold text-slate-700 text-[9px] border-r ${styles.cell[cat.key]}`}>{catPerDay > 0 ? fmtAmt(Math.round(catPerDay)) : "—"}</td>
                            <td className={`px-1 py-2 text-center font-extrabold text-[9px] border-r ${styles.cell[cat.key]} ${!hasAch ? "text-slate-400" : catDiffAbs < 0.5 ? "text-emerald-700" : catDiff > 0 ? "text-blue-700" : "text-rose-700"}`}>
                              {hasAch ? (catDiffAbs < 0.5 ? "—" : (<>{catDiff > 0 ? `+${fmtAmt(Math.round(catDiffAbs))}` : `-${fmtAmt(Math.round(catDiffAbs))}`}<div className="text-[8px] font-normal opacity-80 mt-0.5">{catDiff > 0 ? "Surp" : "Short"}</div></>)) : "—"}
                            </td>
                            <td className={`px-1 py-2 text-center font-bold text-[9px] border-r ${styles.cell[cat.key]}`}>
                              <div className={ffColor}>{hasAch ? (catAchFF > 0 ? Math.round(catAchFF) : "—") : "—"}</div>
                              <div className="w-3/4 mx-auto border-t border-slate-300 my-0.5"></div>
                              <div className="text-purple-800">{catTargetFF > 0 ? Math.round(catTargetFF) : "—"}</div>
                            </td>
                            <td className={`px-1 py-2 text-center font-bold text-[9px] border-r ${styles.cell[cat.key]}`}>
                              <div className={catAchFF >= catTargetFF && hasAch ? "text-emerald-700" : "text-rose-700"}>{hasAch && catTargetFF > 0 ? `${((catAchFF / catTargetFF) * 100).toFixed(1)}%` : "—"}</div>
                            </td>
                          </React.Fragment>
                        );
                      })}
                      <td className="px-1 py-2 text-center font-extrabold text-[9px] border-r border-indigo-100 bg-indigo-50/50">
                        <div className={!hasAch ? "text-slate-400" : (totalAch < totalTarget ? "text-rose-700" : "text-emerald-700")}>{hasAch ? fmtAmt(Math.round(totalAch)) : "—"}</div>
                        <div className="w-3/4 mx-auto border-t border-indigo-300 my-0.5"></div>
                        <div className="text-purple-800">{fmtAmt(Math.round(totalTarget))}</div>
                      </td>
                      <td className="px-1 py-2 text-center font-bold text-[9px] border-r border-indigo-100 bg-indigo-50/50">
                        <div className={!hasAch ? "text-slate-400" : (rowPct < 100 ? "text-rose-700" : "text-emerald-700")}>{hasAch ? `${rowPct.toFixed(1)}%` : "—"}</div>
                        <div className="w-3/4 mx-auto border-t border-indigo-300 my-0.5"></div>
                        <div className="text-slate-500">100%</div>
                      </td>
                      <td className="px-1 py-2 text-center font-bold text-slate-700 text-[9px] border-r border-indigo-100 bg-indigo-50/50">{totalPerDay > 0 ? fmtAmt(Math.round(totalPerDay)) : "—"}</td>
                      <td className={`px-1 py-2 text-center font-extrabold text-[9px] border-r border-indigo-100 bg-indigo-50/50 ${!hasAch ? "text-slate-400" : rowDiffAbs < 0.5 ? "text-emerald-700" : rowDiff > 0 ? "text-blue-700" : "text-rose-700"}`}>
                        {hasAch ? (rowDiffAbs < 0.5 ? "—" : (<>{rowDiff > 0 ? `+${fmtAmt(Math.round(rowDiffAbs))}` : `-${fmtAmt(Math.round(rowDiffAbs))}`}<div className="text-[8px] font-normal opacity-80 mt-0.5">{rowDiff > 0 ? "Surp" : "Short"}</div></>)) : "—"}
                      </td>
                      <td className="px-1 py-2 text-center font-extrabold text-[9px] border-r border-indigo-100 bg-indigo-50/50">
                        <div className={!hasAch ? "text-slate-400" : (totalAchFF < totalTargetFF ? "text-rose-700" : "text-emerald-700")}>{hasAch ? (totalAchFF > 0 ? Math.round(totalAchFF) : "—") : "—"}</div>
                        <div className="w-3/4 mx-auto border-t border-indigo-300 my-0.5"></div>
                        <div className="text-purple-800">{totalTargetFF > 0 ? Math.round(totalTargetFF) : "—"}</div>
                      </td>
                      <td className={`px-1 py-2 text-center font-black text-[8px] uppercase tracking-wider border-r border-indigo-200 bg-indigo-50/50 ${rowStatus.color}`}>
                        {hasAch ? (<span className={`inline-flex items-center gap-1 px-1 py-0.5 rounded-full border ${rowStatus.bg} ${rowStatus.border}`}>{React.createElement(rowStatus.icon, { className: "w-2.5 h-2.5" })}{rowStatus.label}</span>) : (<span className="inline-flex items-center gap-1 px-1 py-0.5 rounded-full border bg-slate-50 text-slate-400 border-slate-200"><FiClock className="w-2.5 h-2.5" /> PEND</span>)}
                      </td>
                      <td className="px-1 py-2 text-center border-slate-200">
                        <div className="flex items-center justify-center gap-1">
                          <button type="button" onClick={() => onEditRow(t)} title="Edit" className="w-6 h-6 rounded-md flex items-center justify-center text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100"><FaEdit className="w-3 h-3" /></button>
                          <button type="button" onClick={() => onDeleteRow(t)} title="Delete" className="w-6 h-6 rounded-md flex items-center justify-center text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100"><FiTrash2 className="w-3 h-3" /></button>
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
  
  const [isEditingTotalBC, setIsEditingTotalBC] = useState(false);

  const [retailInput, setRetailInput] = useState({ cash: "", online: "", footFall: "" });
  const [rowInputs, setRowInputs] = useState({});
  const [savingRowKey, setSavingRowKey] = useState(null);
  const [savingRetailKey, setSavingRetailKey] = useState(null);

  const [savedTarget, setSavedTarget] = useState(null);
  const [savingTarget, setSavingTarget] = useState(false);
  const [deletingTarget, setDeletingTarget] = useState(false);
  const [showAddTargetModal, setShowAddTargetModal] = useState(false);
  const [editTargetData, setEditTargetData] = useState(null);

  const [allTargets, setAllTargets] = useState([]);
  const [loadingAllTargets, setLoadingAllTargets] = useState(false);
  const [isTargetHidden, setIsTargetHidden] = useState(false);
  const [customSegments, setCustomSegments] = useState([]);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const exportDropdownRef = useRef(null);
  const [expandedMonths, setExpandedMonths] = useState({});
  const [showGraph, setShowGraph] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("revenue_custom_segments");
      if (stored) setCustomSegments(JSON.parse(stored));
    } catch (e) { console.error(e); }
  }, [showAddTargetModal]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target)) setShowExportDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    } catch (err) { console.error("Fetch all targets error:", err); setAllTargets([]); }
    finally { setLoadingAllTargets(false); }
  }, []);

  useEffect(() => { fetchAllTargets(); }, [fetchAllTargets]);

  const handleSaveFYTargets = async (payload) => {
    setSavingTarget(true);
    const { entries, fyStartYear } = payload;
    let savedCount = 0, failedCount = 0;
    const errors = [];
    try {
      for (const entry of entries) {
        try {
          const res = await axios.post(`${TARGET_API_BASE}/save-revenue-target`, {
            month: entry.month, year: entry.year, amount: entry.amount, category: entry.category, categoryLabel: entry.categoryLabel, footFall: entry.footFall,
          });
          if (res.data?.success) savedCount++;
          else { failedCount++; errors.push(`${MONTHS[entry.month - 1]} ${entry.year}: ${res.data?.message || "failed"}`); }
        } catch (err) { failedCount++; errors.push(`${MONTHS[entry.month - 1]} ${entry.year}: ${err.response?.data?.message || err.message}`); }
      }
      if (failedCount === 0) { showToast(`✅ FY ${formatFY(fyStartYear)} — ${savedCount} target${savedCount > 1 ? "s" : ""} saved!`, "success"); setShowAddTargetModal(false); setEditTargetData(null); fetchAllTargets(); }
      else if (savedCount > 0) { showToast(`⚠️ ${savedCount} saved, ${failedCount} failed.`, "error"); fetchAllTargets(); }
      else { showToast(`❌ Failed to save. ${errors[0] || ""}`, "error"); }
    } finally { setSavingTarget(false); }
  };

  const handleUpdateTargets = async (payload) => {
    setSavingTarget(true);
    const { entries, editTarget } = payload;
    let updatedCount = 0, failedCount = 0;
    const errors = [];
    try {
      for (const entry of entries) {
        const existing = allTargets.find((t) => Number(t.month) === entry.month && Number(t.year) === entry.year && t.category === entry.category);
        try {
          if (existing && existing._id) {
            const res = await axios.put(`${TARGET_API_BASE}/update-revenue-target/${existing._id}`, { amount: entry.amount, footFall: entry.footFall });
            if (res.data?.success) updatedCount++;
            else { failedCount++; errors.push(`${entry.category}: ${res.data?.message || "failed"}`); }
          } else {
            const res = await axios.post(`${TARGET_API_BASE}/save-revenue-target`, { month: entry.month, year: entry.year, amount: entry.amount, category: entry.category, categoryLabel: entry.categoryLabel, footFall: entry.footFall });
            if (res.data?.success) updatedCount++;
            else { failedCount++; errors.push(`${entry.category}: ${res.data?.message || "failed"}`); }
          }
        } catch (err) { failedCount++; errors.push(`${entry.category}: ${err.response?.data?.message || err.message}`); }
      }
      const editMonth = Number(editTarget.month);
      const editYear = Number(editTarget.year);
      const existingCats = allTargets.filter((t) => Number(t.month) === editMonth && Number(t.year) === editYear);
      const newCatKeys = new Set(entries.map((e) => e.category));
      for (const ex of existingCats) {
        if (!newCatKeys.has(ex.category)) {
          try { const res = await axios.delete(`${TARGET_API_BASE}/revenue-target/${ex._id}`); if (res.data?.success) updatedCount++; } catch (err) { console.error("Delete removed category error:", err); }
        }
      }
      if (failedCount === 0) { showToast(`✅ Target updated for ${updatedCount} categor${updatedCount !== 1 ? "ies" : "y"}`, "success"); setShowAddTargetModal(false); setEditTargetData(null); fetchAllTargets(); }
      else if (updatedCount > 0) { showToast(`⚠️ ${updatedCount} updated, ${failedCount} failed.`, "error"); fetchAllTargets(); }
      else { showToast(`❌ Failed to update. ${errors[0] || ""}`, "error"); }
    } finally { setSavingTarget(false); }
  };

  const handleEditRow = (row) => {
    const categories = {};
    DEFAULT_CATEGORIES.forEach((cat) => {
      const rawAmt = Number(row.categories?.[cat.key]?.amount) || 0;
      const rawFF = Number(row.categories?.[cat.key]?.footFall) || 0;
      const ratio = row.ratio || 1;
      const originalAmt = ratio > 0 ? rawAmt / ratio : 0;
      const originalFF = ratio > 0 ? rawFF / ratio : 0;
      if (originalAmt > 0 || originalFF > 0) { categories[cat.key] = { amount: Math.round(originalAmt), footFall: Math.round(originalFF) }; }
    });
    setEditTargetData({ month: row.month, year: row.year, categories });
    setShowAddTargetModal(true);
  };

  const handleDeleteRow = async (row) => {
    const ids = row.ids || (row._id ? [row._id] : []);
    if (ids.length === 0) { showToast("Cannot delete: missing id", "error"); return; }
    if (!window.confirm(`Delete all targets for ${MONTHS[row.month - 1]} ${row.year}?`)) return;
    setDeletingTarget(true);
    try {
      let deletedCount = 0;
      for (const id of ids) { try { const res = await axios.delete(`${TARGET_API_BASE}/revenue-target/${id}`); if (res.data?.success) deletedCount++; } catch (err) { console.error("Delete row error:", err); } }
      if (deletedCount > 0) { showToast(`✅ Target deleted for ${MONTHS[row.month - 1]} ${row.year}`, "success"); fetchAllTargets(); }
      else { showToast("Failed to delete target", "error"); }
    } finally { setDeletingTarget(false); }
  };

  const fetchAnalytics = useCallback(async () => {
    let queryFrom = fromDate;
    let queryTo = toDate;
    if (activePreset === "all") { queryFrom = "2020-01-01"; queryTo = new Date().toISOString().split("T")[0]; }
    else if (!fromDate || !toDate) return;

    setLoading(true);
    setError(null);
    try {
      const url = `${ANALYTICS_API_BASE}/revenue-analytics?from=${queryFrom}&to=${queryTo}`;
      const res = await axios.get(url);
      if (res.data?.success) {
        const normalized = normalizeAnalyticsData(res.data);
        setData(normalized);

        const rp = normalized.retailPharmacy || {};
        setRetailInput({ cash: rp.cash ? String(rp.cash) : "", online: rp.online ? String(rp.online) : "", footFall: rp.footFall ? String(rp.footFall) : "" });

        const nextRowInputs = {};
        (normalized.rows || []).forEach((r) => {
          const key = r.date;
          const hasRetailData = (Number(r.retailPharmacy?.cash) > 0) || (Number(r.retailPharmacy?.online) > 0) || (Number(r.retailPharmacy?.footFall) > 0);
          
          const hasBankCredit = r.bankCredit != null && Number(r.bankCredit) > 0;

          nextRowInputs[key] = {
            cash: r.retailPharmacy?.cash ? String(r.retailPharmacy.cash) : "",
            online: r.retailPharmacy?.online ? String(r.retailPharmacy.online) : "",
            footFall: r.retailPharmacy?.footFall ? String(r.retailPharmacy.footFall) : "",
            bankCredit: r.bankCredit != null ? String(r.bankCredit) : "",
            savedBankCredit: hasBankCredit ? Number(r.bankCredit) : null,
            saved: hasBankCredit,
            savedRetail: hasRetailData,
            savedRetailCash: Number(r.retailPharmacy?.cash) || 0,
            savedRetailOnline: Number(r.retailPharmacy?.online) || 0,
            savedRetailFootFall: Number(r.retailPharmacy?.footFall) || 0,
            editingBankCredit: false,
          };
        });
        setRowInputs(nextRowInputs);
        
        setIsEditingTotalBC(false);

        if (res.data.bankCredit && Number(res.data.bankCredit.bankCredit) > 0) {
          setBankCredit(String(res.data.bankCredit.bankCredit || ""));
          setSavedBankCredit(Number(res.data.bankCredit.bankCredit) || 0);
        } else {
          const firstRowWithBC = normalized.rows.find(r => r.bankCredit != null && Number(r.bankCredit) > 0);
          if (firstRowWithBC) { setBankCredit(String(firstRowWithBC.bankCredit)); setSavedBankCredit(Number(firstRowWithBC.bankCredit)); }
          else { setBankCredit(""); setSavedBankCredit(null); }
        }
      } else {
        setError(res.data?.message || "Failed to fetch analytics");
        setData(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to fetch analytics");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

    useEffect(() => {
    // Page load hote hi Default Today set karo
    const nowD = new Date();
    setActivePreset("today");
    setFromDate(fmtDate(nowD));
    setToDate(fmtDate(nowD));
    setSelectedMonth(nowD.getMonth() + 1);
    setSelectedYear(nowD.getFullYear());
  }, []);

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
    if (preset === "today") { const t = fmtDate(nowD); setFromDate(t); setToDate(t); setSelectedMonth(nowD.getMonth() + 1); setSelectedYear(nowD.getFullYear()); }
    else if (preset === "yesterday") { const y = new Date(nowD); y.setDate(y.getDate() - 1); const t = fmtDate(y); setFromDate(t); setToDate(t); }
    else if (preset === "last7Days") { const past7Days = new Date(nowD); past7Days.setDate(nowD.getDate() - 6); setFromDate(fmtDate(past7Days)); setToDate(fmtDate(nowD)); }
    else if (preset === "thisWeek") { const dow = nowD.getDay(); const diff = dow === 0 ? 6 : dow - 1; const mon = new Date(nowD); mon.setDate(mon.getDate() - diff); setFromDate(fmtDate(mon)); setToDate(fmtDate(nowD)); }
    else if (preset === "thisMonth") { const first = new Date(nowD.getFullYear(), nowD.getMonth(), 1); const last = new Date(nowD.getFullYear(), nowD.getMonth() + 1, 0); setFromDate(fmtDate(first)); setToDate(fmtDate(last)); }
    else if (preset === "lastMonth") { const first = new Date(nowD.getFullYear(), nowD.getMonth() - 1, 1); const last = new Date(nowD.getFullYear(), nowD.getMonth(), 0); setFromDate(fmtDate(first)); setToDate(fmtDate(last)); }
    else if (preset === "thisYear") { const first = new Date(nowD.getFullYear(), 0, 1); const last = new Date(nowD.getFullYear(), 11, 31); setFromDate(fmtDate(first)); setToDate(fmtDate(last)); }
    else if (preset === "all") { setFromDate(""); setToDate(""); }
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

  // FIXED: W Pharmacy = 0 if Total Pharmacy is 0, else (Total - Clinic)
  const wPharmacyLive = useMemo(() => {
    const totalPharmacyCash = retailPharmacyLive.cash;
    const totalPharmacyOnline = retailPharmacyLive.online;
    const totalPharmacyFF = retailPharmacyLive.footFall;
    
    // If Total Pharmacy is 0, W Pharmacy should be 0
    const isRetailZero = (totalPharmacyCash === 0 && totalPharmacyOnline === 0 && totalPharmacyFF === 0);
    
    if (isRetailZero) {
      return { cash: 0, online: 0, total: 0, footFall: 0, due: 0 };
    }

    const cp = data?.pharmacy || { cash: 0, online: 0, total: 0, footFall: 0 };
    return {
      cash: totalPharmacyCash - (Number(cp.cash) || 0),
      online: totalPharmacyOnline - (Number(cp.online) || 0),
      total: (totalPharmacyCash + totalPharmacyOnline) - (Number(cp.cash) + Number(cp.online)),
      footFall: totalPharmacyFF - (Number(cp.footFall) || 0),
      due: 0,
    };
  }, [retailPharmacyLive, data]);

  // FIXED: Grand Total = Clinic + Lab + Clinic Pharmacy + W Pharmacy
  const grandTotalLive = useMemo(() => {
    if (!data) return null;
    const c = data.clinic, l = data.lab, cp = data.pharmacy, w = wPharmacyLive;
    
    let total = c.total + l.total + cp.total + w.total;
    let cash = c.cash + l.cash + cp.cash + w.cash;
    let online = c.online + l.online + cp.online + w.online;
    let due = c.due + l.due + cp.due + w.due;
    let footFall = c.footFall + l.footFall + cp.footFall + w.footFall;

    if (data.rows) {
      data.rows.forEach(row => {
        const ri = rowInputs[row.date] || {};
        customSegments.forEach(cat => {
          const cCash = Number(ri[cat.key]?.cash) || 0;
          const cOnline = Number(ri[cat.key]?.online) || 0;
          const cFoot = Number(ri[cat.key]?.footFall) || 0;
          
          cash += cCash;
          online += cOnline;
          total += (cCash + cOnline);
          footFall += cFoot;
        });
      });
    }

    return { total, cash, online, due, footFall };
  }, [data, wPharmacyLive, customSegments, rowInputs]);

  const rangeTargets = useMemo(() => {
    const empty = { clinic: 0, lab: 0, clinicPharmacy: 0, retailPharmacy: 0, total: 0, hasAny: false, daysCount: 0, clinicFF: 0, labFF: 0, clinicPharmacyFF: 0, retailPharmacyFF: 0, totalFF: 0 };
    if (!fromDate || !toDate) return empty;
    const start = new Date(fromDate), end = new Date(toDate);
    if (end < start) return empty;
    const acc = { ...empty };
    const cur = new Date(start);
    while (cur <= end) {
      const y = cur.getFullYear(), m = cur.getMonth() + 1;
      const dim = getDaysInMonth(y, m);
      const monthTargets = allTargets.filter((t) => Number(t.year) === y && Number(t.month) === m);
      monthTargets.forEach((t) => {
        const catKey = t.category;
        if (!catKey) return;
        const perDay = (Number(t.amount) || 0) / dim;
        const perDayFF = (Number(t.footFall) || 0) / dim;
        if (acc[catKey] !== undefined) { acc[catKey] += perDay; acc[`${catKey}FF`] = (acc[`${catKey}FF`] || 0) + perDayFF; }
        else { acc[catKey] = perDay; acc[`${catKey}FF`] = perDayFF; }
        acc.hasAny = true;
      });
      acc.daysCount += 1;
      cur.setDate(cur.getDate() + 1);
    }
    // Target total
    acc.total = acc.clinic + acc.lab + acc.clinicPharmacy;
    acc.totalFF = acc.clinicFF + acc.labFF + acc.clinicPharmacyFF;
    return acc;
  }, [fromDate, toDate, allTargets]);

  const hasRangeTarget = rangeTargets.hasAny;

  const rangeLabel = useMemo(() => {
    if (activePreset === "today") return "Today's Target";
    if (activePreset === "yesterday") return "Yesterday's Target";
    if (activePreset === "thisWeek") return "This Week's Target";
    if (activePreset === "last7Days") return "Last 7 Days Target";
    if (activePreset === "thisMonth") return "This Month's Target";
    if (activePreset === "lastMonth") return "Last Month's Target";
    if (activePreset === "thisYear") return "This Year's Target";
    if (rangeTargets.daysCount === 1) return "Day Target";
    return `${rangeTargets.daysCount} Days Target`;
  }, [activePreset, rangeTargets.daysCount]);

  const rangeAchieved = useMemo(() => {
    if (!data || !data.rows || data.rows.length === 0) {
      return { clinic: 0, lab: 0, clinicPharmacy: 0, retailPharmacy: 0, total: 0, hasData: false, clinicFF: 0, labFF: 0, clinicPharmacyFF: 0, retailPharmacyFF: 0, totalFF: 0 };
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
      wPharmacy: { cash: 0, online: 0, total: 0, footFall: 0 },
      grand: { cash: 0, online: 0, total: 0, footFall: 0 },
      bankCredit: 0, creditedDiff: 0,
    };
      data.rows.forEach((r) => {
      const rowKey = r.date || "__total__";
      const ri = rowInputs[rowKey] || {};
      const rCash = Number(ri.cash) || 0, rOnline = Number(ri.online) || 0, rFoot = Number(ri.footFall) || 0;
      
      acc.clinic.cash += Number(r.clinic.cash) || 0; acc.clinic.online += Number(r.clinic.online) || 0; acc.clinic.total += Number(r.clinic.total) || 0; acc.clinic.footFall += Number(r.clinic.footFall) || 0;
      acc.lab.cash += Number(r.lab.cash) || 0; acc.lab.online += Number(r.lab.online) || 0; acc.lab.total += Number(r.lab.total) || 0; acc.lab.footFall += Number(r.lab.footFall) || 0;
      acc.pharmacy.cash += Number(r.pharmacy.cash) || 0; acc.pharmacy.online += Number(r.pharmacy.online) || 0; acc.pharmacy.total += Number(r.pharmacy.total) || 0; acc.pharmacy.footFall += Number(r.pharmacy.footFall) || 0;
      acc.retail.cash += rCash; acc.retail.online += rOnline; acc.retail.total += rCash + rOnline; acc.retail.footFall += rFoot;
      
      let rowCustomCash = 0, rowCustomOnline = 0, rowCustomFoot = 0;
      customSegments.forEach(cat => {
        rowCustomCash += Number(ri[cat.key]?.cash) || 0;
        rowCustomOnline += Number(ri[cat.key]?.online) || 0;
        rowCustomFoot += Number(ri[cat.key]?.footFall) || 0;
      });

      const isRetailZero = (rCash === 0 && rOnline === 0 && rFoot === 0);
      const wCashVal = isRetailZero ? 0 : (rCash - (Number(r.pharmacy.cash) || 0));
      const wOnlineVal = isRetailZero ? 0 : (rOnline - (Number(r.pharmacy.online) || 0));

      acc.grand.cash += (Number(r.clinic.cash) || 0) + (Number(r.lab.cash) || 0) + (Number(r.pharmacy.cash) || 0) + wCashVal + rowCustomCash;
      acc.grand.online += (Number(r.clinic.online) || 0) + (Number(r.lab.online) || 0) + (Number(r.pharmacy.online) || 0) + wOnlineVal + rowCustomOnline;
      acc.grand.total += (Number(r.clinic.total) || 0) + (Number(r.lab.total) || 0) + (Number(r.pharmacy.total) || 0) + (wCashVal + wOnlineVal) + (rowCustomCash + rowCustomOnline);
      acc.grand.footFall += (Number(r.clinic.footFall) || 0) + (Number(r.lab.footFall) || 0) + (Number(r.pharmacy.footFall) || 0) + (isRetailZero ? 0 : (rFoot - (Number(r.pharmacy.footFall) || 0))) + rowCustomFoot;
      
      const rBC = ri.savedBankCredit != null ? Number(ri.savedBankCredit) : (parseFloat(ri.bankCredit) || 0);
      acc.bankCredit += rBC;
    });
    
    const isRetailZeroTotal = (acc.retail.cash === 0 && acc.retail.online === 0 && acc.retail.footFall === 0);
    acc.wPharmacy.cash = isRetailZeroTotal ? 0 : (acc.retail.cash - acc.pharmacy.cash);
    acc.wPharmacy.online = isRetailZeroTotal ? 0 : (acc.retail.online - acc.pharmacy.online);
    acc.wPharmacy.total = isRetailZeroTotal ? 0 : (acc.retail.total - acc.pharmacy.total);
    acc.wPharmacy.footFall = isRetailZeroTotal ? 0 : (acc.retail.footFall - acc.pharmacy.footFall);
    
    acc.creditedDiff = acc.bankCredit - acc.grand.online;
    return acc;
  }, [data, rowInputs, customSegments]);

  const handleSaveRetail = async (rowKey, retailData, rowGrandTotal) => {
    setSavingRetailKey(rowKey);
    try {
      const ri = rowInputs[rowKey] || {};
      const existingBC = ri.savedBankCredit != null ? Number(ri.savedBankCredit) : (parseFloat(ri.bankCredit) || 0);

      let rowFrom, rowTo;
      if (/^\d{4}-\d{2}$/.test(rowKey)) { const [y, m] = rowKey.split("-").map(Number); rowFrom = fmtDate(new Date(y, m - 1, 1)); rowTo = fmtDate(new Date(y, m, 0)); }
      else { rowFrom = rowKey; rowTo = rowKey; }

      // Diff is now calculated against the Online portion of the row grand total
      const diff = existingBC - (Number(rowInputs[rowKey]?.online) + (Number(data?.clinic?.online)||0) + (Number(data?.lab?.online)||0) + (Number(data?.pharmacy?.online)||0)); 
      const absDiff = Math.abs(diff);
      let diffStatus = "—";
      if (existingBC && rowGrandTotal) { if (absDiff < 0.5) diffStatus = "MATCHED"; else if (diff > 0) diffStatus = "CREDIT MORE"; else diffStatus = "CREDIT LESS"; }

      const res = await axios.post(`${ANALYTICS_API_BASE}/save-bank-credit`, {
        fromDate: rowFrom, toDate: rowTo, rowKey,
        bankCredit: existingBC, grandTotal: rowGrandTotal,
        creditedDiff: diff, diffStatus, savedBy: "Admin",
        retailPharmacy: { cash: retailData.cash, online: retailData.online, footFall: retailData.footFall, total: retailData.total },
      });

      if (res.data?.success) {
        setRowInputs((p) => ({ 
          ...p, 
          [rowKey]: { 
            ...(p[rowKey] || {}), 
            savedRetail: true,
            savedRetailCash: retailData.cash,
            savedRetailOnline: retailData.online,
            savedRetailFootFall: retailData.footFall
          } 
        }));
        showToast("✅ Total Pharmacy saved!", "success");
      } else { showToast(res.data?.message || "Failed to save retail", "error"); }
    } catch (err) { showToast(err.response?.data?.message || "Failed to save retail", "error"); }
    finally { setSavingRetailKey(null); }
  };

  const handleEditRetail = (rowKey) => {
    setRowInputs((p) => ({ ...p, [rowKey]: { ...(p[rowKey] || {}), savedRetail: false } }));
  };

  const handleSaveRow = async (rowKey, bankCreditNum, rowGrandTotal, retailData) => {
    let rowFrom, rowTo;
    if (/^\d{4}-\d{2}$/.test(rowKey)) { const [y, m] = rowKey.split("-").map(Number); rowFrom = fmtDate(new Date(y, m - 1, 1)); rowTo = fmtDate(new Date(y, m, 0)); }
    else { rowFrom = rowKey; rowTo = rowKey; }
    // Diff is now calculated against the Online portion
    const diff = bankCreditNum - (Number(retailData.online) + (Number(data?.clinic?.online)||0) + (Number(data?.lab?.online)||0) + (Number(data?.pharmacy?.online)||0));
    const absDiff = Math.abs(diff);
    let diffStatus = "—";
    if (bankCreditNum && rowGrandTotal) { if (absDiff < 0.5) diffStatus = "MATCHED"; else if (diff > 0) diffStatus = "CREDIT MORE"; else diffStatus = "CREDIT LESS"; }
    setSavingRowKey(rowKey);
    try {
      const res = await axios.post(`${ANALYTICS_API_BASE}/save-bank-credit`, {
        fromDate: rowFrom, toDate: rowTo, rowKey,
        bankCredit: bankCreditNum, grandTotal: rowGrandTotal,
        creditedDiff: diff, diffStatus, savedBy: "Admin",
        retailPharmacy: { cash: retailData.cash, online: retailData.online, footFall: retailData.footFall, total: retailData.total },
      });
      if (res.data?.success) {
        setRowInputs((p) => ({ ...p, [rowKey]: { ...(p[rowKey] || {}), saved: true, savedBankCredit: bankCreditNum, savedRetail: true, editingBankCredit: false } }));
        showToast(`✅ Row saved!`, "success");
      } else { showToast(res.data?.message || "Failed to save", "error"); }
    } catch (err) { showToast(err.response?.data?.message || "Failed to save", "error"); }
    finally { setSavingRowKey(null); }
  };

  const handleSaveClick = () => {
    setShowSaveConfirm(true);
  };

  const handleConfirmSave = async () => {
    const bankCreditNum = parseFloat(bankCredit) || 0;
    // Diff is now calculated against the total ONLINE instead of grand total
    const onlineTotalNum = grandTotalLive?.online || 0;
    const diff = bankCreditNum - onlineTotalNum;
    const absDiff = Math.abs(diff);
    let diffStatus = "—";
    if (bankCreditNum && onlineTotalNum) { if (absDiff < 0.5) diffStatus = "MATCHED"; else if (diff > 0) diffStatus = "CREDIT MORE"; else diffStatus = "CREDIT LESS"; }
    setSavingBankCredit(true);
    try {
      const res = await axios.post(`${ANALYTICS_API_BASE}/save-bank-credit`, {
        fromDate, toDate, rowKey: "__total__",
        bankCredit: bankCreditNum, grandTotal: grandTotalLive?.total || 0,
        creditedDiff: diff, diffStatus, savedBy: "Admin",
        retailPharmacy: retailPharmacyLive,
      });
      if (res.data?.success) {
        setSavedBankCredit(bankCreditNum);
        setIsEditingTotalBC(false);
        setShowSaveConfirm(false);
        showToast(`✅ Bank Credit ${fmtAmt(bankCreditNum)} saved!`, "success");
      } else { showToast(res.data?.message || "Failed to save bank credit", "error"); }
    } catch (err) { showToast(err.response?.data?.message || "Failed to save bank credit", "error"); }
    finally { setSavingBankCredit(false); }
  };

  const bankCreditNum = savedBankCredit !== null ? savedBankCredit : (parseFloat(bankCredit) || 0);
  const hasSavedValue = savedBankCredit !== null && savedBankCredit > 0;
  const currentInputNum = parseFloat(bankCredit) || 0;
  const hasUnsavedChange = currentInputNum !== (savedBankCredit || 0);

  const handleExportCSV = () => {
    if (!data || !grandTotalLive) return;
    // Export now uses online difference
    const diff = bankCreditNum - (grandTotalLive.online || 0);
    const diffLabel = !bankCreditNum ? "—" : Math.abs(diff) < 0.5 ? "MATCHED" : diff > 0 ? "CREDIT MORE" : "CREDIT LESS";
    const rowCells = (r) => {
      const rowKey = r.date || "__total__";
      const ri = rowInputs[rowKey] || {};
      const rCash = Number(ri.cash) || 0, rOnline = Number(ri.online) || 0, rFoot = Number(ri.footFall) || 0;
      const rRetail = { cash: rCash, online: rOnline, total: rCash + rOnline, footFall: rFoot };
      const rBC = ri.savedBankCredit != null ? Number(ri.savedBankCredit) : 0;
      
      const wCash = rRetail.cash - (Number(r.pharmacy.cash) || 0);
      const wOnline = rRetail.online - (Number(r.pharmacy.online) || 0);
      const wTotal = rRetail.total - (Number(r.pharmacy.total) || 0);
      const wFoot = rRetail.footFall - (Number(r.pharmacy.footFall) || 0);

      const rGrand = {
        cash: r.clinic.cash + r.lab.cash + r.pharmacy.cash + (rRetail.cash - (Number(r.pharmacy.cash) || 0)),
        online: r.clinic.online + r.lab.online + r.pharmacy.online + (rRetail.online - (Number(r.pharmacy.online) || 0)),
        total: r.clinic.total + r.lab.total + r.pharmacy.total + (rRetail.total - (Number(r.pharmacy.total) || 0)),
        footFall: r.clinic.footFall + r.lab.footFall + r.pharmacy.footFall + (rRetail.footFall - (Number(r.pharmacy.footFall) || 0)),
      };
      
      // Diff is calculated against online
      const rDiff = rBC - rGrand.online;
      
      const rDiffLabel = !rBC ? "—" : Math.abs(rDiff) < 0.5 ? "MATCHED" : rDiff > 0 ? "CREDIT MORE" : "CREDIT LESS";
      const isMonthly = r.year && r.month;
      const dateLabel = rowKey === "__total__" ? `${formatDateToDDMMYYYY(fromDate)} – ${formatDateToDDMMYYYY(toDate)}` : isMonthly ? `${MONTHS[r.month - 1].slice(0, 3)} ${r.year}` : formatDateToDDMMYYYY(r.date);
      
      return `
    <tr class="data-row">
      <td>${dateLabel}</td>
      <td>${r.clinic.cash}</td><td>${r.clinic.online}</td><td class="total-cell">${r.clinic.total}</td><td class="footfall">${r.clinic.footFall}</td>
      <td>${r.lab.cash}</td><td>${r.lab.online}</td><td class="total-cell">${r.lab.total}</td><td class="footfall">${r.lab.footFall}</td>
      <td>${r.pharmacy.cash}</td><td>${r.pharmacy.online}</td><td class="total-cell">${r.pharmacy.total}</td><td class="footfall">${r.pharmacy.footFall}</td>
      
      <!-- W Pharmacy -->
      <td style="background:#e0f2fe;font-weight:bold;color:#0e7490;">${wCash}</td>
      <td style="background:#e0f2fe;font-weight:bold;color:#0e7490;">${wOnline}</td>
      <td style="background:#e0f2fe;font-weight:900;color:#155e75;">${wTotal}</td>
      <td style="background:#e0f2fe;font-weight:bold;color:#155e75;">${wFoot}</td>
      
      <!-- Total Pharmacy -->
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
      
      <!-- W Pharmacy -->
      <td style="background:#e0f2fe;font-weight:bold;color:#0e7490;">${retailPharmacyLive.cash - data.pharmacy.cash}</td>
      <td style="background:#e0f2fe;font-weight:bold;color:#0e7490;">${retailPharmacyLive.online - data.pharmacy.online}</td>
      <td style="background:#e0f2fe;font-weight:900;color:#155e75;">${retailPharmacyLive.total - data.pharmacy.total}</td>
      <td style="background:#e0f2fe;font-weight:bold;color:#155e75;">${retailPharmacyLive.footFall - data.pharmacy.footFall}</td>
      
      <!-- Total Pharmacy -->
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
  .grp-wpharmacy { background: #0891b2; color: #fff; font-weight: bold; }
  .grp-retail { background: #d97706; color: #fff; font-weight: bold; }
  .grp-summary { background: #4338ca; color: #fff; font-weight: bold; }
  .grp-bank { background: #be123c; color: #fff; font-weight: bold; }
  .sub-clinic { background: #dbeafe; color: #1e40af; font-weight: bold; }
  .sub-lab { background: #ede9fe; color: #6d28d9; font-weight: bold; }
  .sub-pharmacy { background: #d1fae5; color: #047857; font-weight: bold; }
  .sub-wpharmacy { background: #cffafe; color: #0e7490; font-weight: bold; }
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
      <th class="grp-wpharmacy" colspan="4">W Pharmacy</th>
      <th class="grp-retail" colspan="4">Total Pharmacy</th>
      <th class="grp-summary" colspan="4">Grand Total</th>
      <th class="grp-bank" rowspan="2">Bank Credit</th>
      <th class="grp-bank" rowspan="2">Credited D/W</th>
      <th class="grp-bank" rowspan="2">Status</th>
    </tr>
    <tr>
      <th class="sub-clinic">Cash</th><th class="sub-clinic">Online</th><th class="sub-clinic">Total</th><th class="sub-clinic">FootFall</th>
      <th class="sub-lab">Cash</th><th class="sub-lab">Online</th><th class="sub-lab">Total</th><th class="sub-lab">FootFall</th>
      <th class="sub-pharmacy">Cash</th><th class="sub-pharmacy">Online</th><th class="sub-pharmacy">Total</th><th class="sub-pharmacy">FootFall</th>
      <th class="sub-wpharmacy">Cash</th><th class="sub-wpharmacy">Online</th><th class="sub-wpharmacy">Total</th><th class="sub-wpharmacy">FootFall</th>
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

  const handleExportTrackerCSV = () => {
    if (!allTargets || allTargets.length === 0) { showToast("No targets to export", "error"); return; }
    const rows = [["Month", "Year", "Category", "Target Amount", "Target Footfall"]];
    allTargets.forEach(t => { rows.push([MONTHS[t.month - 1], t.year, t.categoryLabel || t.category, t.amount, t.footFall]); });
    const csvContent = rows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Target_Tracker_Export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Target Tracker exported successfully!", "success");
  };

  const presetOptions = [
    { v: "today", l: "Today" }, { v: "yesterday", l: "Yesterday" },
    { v: "thisWeek", l: "This Week" }, { v: "last7Days", l: "Last 7 Days" },
    { v: "thisMonth", l: "This Month" }, { v: "lastMonth", l: "Last Month" },
    { v: "thisYear", l: "This Year" }, { v: "all", l: "All" },
  ];

  const inputCls = "w-full text-center text-xs font-bold bg-white border border-amber-400 rounded px-1 py-0.5 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500";

  const styles = getDynamicStyles(customSegments);

  const allCardCategories = useMemo(() => {
    const defaultCards = [
      { key: "clinic", title: "Clinic", icon: <FaClinicMedical />, accent: "blue", total: data?.clinic?.total || 0, footfall: data?.clinic?.footFall || 0, data: data?.clinic || {}, rangeTarget: rangeTargets.clinic, rangeTargetFF: rangeTargets.clinicFF, isCustom: false },
      { key: "lab", title: "Lab", icon: <FaFlask />, accent: "purple", total: data?.lab?.total || 0, footfall: data?.lab?.footFall || 0, data: data?.lab || {}, rangeTarget: rangeTargets.lab, rangeTargetFF: rangeTargets.labFF, isCustom: false },
      { key: "clinicPharmacy", title: "Clinic Pharmacy", icon: <FaPills />, accent: "emerald", total: data?.pharmacy?.total || 0, footfall: data?.pharmacy?.footFall || 0, data: data?.pharmacy || {}, rangeTarget: rangeTargets.clinicPharmacy, rangeTargetFF: rangeTargets.clinicPharmacyFF, isCustom: false },
      { key: "retailPharmacy", title: "Total Pharmacy", icon: <FaPills />, accent: "amber", total: retailPharmacyLive.total, footfall: retailPharmacyLive.footFall, data: retailPharmacyLive, rangeTarget: rangeTargets.retailPharmacy, rangeTargetFF: rangeTargets.retailPharmacyFF, isCustom: false },
    ];
    
    const customCards = customSegments.filter(cat => cat.cardNeeded).map((cat, idx) => {
      let totalCash = 0, totalOnline = 0, totalFF = 0;
      if (data?.rows) {
        data.rows.forEach(r => {
          const ri = rowInputs[r.date] || {};
          totalCash += Number(ri[cat.key]?.cash) || 0;
          totalOnline += Number(ri[cat.key]?.online) || 0;
          totalFF += Number(ri[cat.key]?.footFall) || 0;
        });
      }
      return { 
        key: cat.key, 
        title: cat.label, 
        icon: <FiTarget />, 
        accent: COLOR_PALETTE[idx % COLOR_PALETTE.length].color, 
        total: totalCash + totalOnline, 
        footfall: totalFF, 
        data: { cash: totalCash, online: totalOnline, due: 0, footFall: totalFF }, 
        rangeTarget: rangeTargets[cat.key] || 0, 
        rangeTargetFF: rangeTargets[`${cat.key}FF`] || 0, 
        isCustom: true 
      };
    });
    
    return [...defaultCards, ...customCards];
  }, [data, retailPharmacyLive, rangeTargets, customSegments, rowInputs]);

  const toggleExpand = (rowKey) => { setExpandedMonths(prev => ({ ...prev, [rowKey]: !prev[rowKey] })); };

  const renderTableRow = (r, isSubRow = false) => {
    const rowKey = r.date || "__total__";
    const isTotal = rowKey === "__total__";
    const ri = rowInputs[rowKey] || {};
    const rCash = isTotal ? (Number(retailInput.cash) || 0) : (Number(ri.cash) || 0);
    const rOnline = isTotal ? (Number(retailInput.online) || 0) : (Number(ri.online) || 0);
    const rFoot = isTotal ? (Number(retailInput.footFall) || 0) : (Number(ri.footFall) || 0);
    const rRetail = { cash: rCash, online: rOnline, total: rCash + rOnline, footFall: rFoot };
    const rBC = isTotal ? (savedBankCredit !== null ? savedBankCredit : (parseFloat(bankCredit) || 0)) : (ri.savedBankCredit != null ? Number(ri.savedBankCredit) : (parseFloat(ri.bankCredit) || 0));

      // W Pharmacy calculate hota hai Total - Clinic
    const isRetailZero = (rCash === 0 && rOnline === 0 && rFoot === 0);
    const wCash = isRetailZero ? 0 : rCash - (Number(r.pharmacy.cash) || 0);
    const wOnline = isRetailZero ? 0 : rOnline - (Number(r.pharmacy.online) || 0);
    const wTotal = isRetailZero ? 0 : rRetail.total - (Number(r.pharmacy.total) || 0);
    const wFoot = isRetailZero ? 0 : rFoot - (Number(r.pharmacy.footFall) || 0);

    // AGAR Total Pharmacy 0 hai, toh Grand Total mein minus nahi hoga (0 hi judega)
    let rGrand = {
      cash: r.clinic.cash + r.lab.cash + r.pharmacy.cash + (isRetailZero ? 0 : wCash),
      online: r.clinic.online + r.lab.online + r.pharmacy.online + (isRetailZero ? 0 : wOnline),
      total: r.clinic.total + r.lab.total + r.pharmacy.total + (isRetailZero ? 0 : wTotal),
      footFall: r.clinic.footFall + r.lab.footFall + r.pharmacy.footFall + (isRetailZero ? 0 : wFoot),
    };
    customSegments.forEach(cat => {
      const cCash = isTotal ? (Number(retailInput[`${cat.key}_cash`]) || 0) : (Number(ri[cat.key]?.cash) || 0);
      const cOnline = isTotal ? (Number(retailInput[`${cat.key}_online`]) || 0) : (Number(ri[cat.key]?.online) || 0);
      const cFoot = isTotal ? (Number(retailInput[`${cat.key}_ff`]) || 0) : (Number(ri[cat.key]?.footFall) || 0);
      
      rGrand.cash += cCash;
      rGrand.online += cOnline;
      rGrand.total += (cCash + cOnline);
      rGrand.footFall += cFoot;
    });

    // Calculate Diff against ONLINE
    const rDiff = rBC - rGrand.online; 
    const rDiffAbs = Math.abs(rDiff);
    const rDiffLabel = !rBC ? "—" : rDiffAbs < 0.5 ? "MATCHED" : rDiff > 0 ? "CREDIT MORE" : "CREDIT LESS";
    const rDiffColor = rDiffLabel === "MATCHED" ? "text-emerald-700" : rDiffLabel === "CREDIT MORE" ? "text-blue-700" : rDiffLabel === "CREDIT LESS" ? "text-rose-700" : "text-slate-400";
    const isMonthly = r.year && r.month;
    const dateLabel = isTotal ? `${formatDateToDDMMYYYY(fromDate)} – ${formatDateToDDMMYYYY(toDate)}` : isMonthly ? `${MONTHS[r.month - 1].slice(0, 3)} ${r.year}` : formatDateToDDMMYYYY(r.date);
    const hasMonthData = r.monthData && r.monthData.length > 0;
    const isExpanded = expandedMonths[rowKey];

    const isRetailSaved = !isTotal && ri.savedRetail === true;
    const isRetailSaving = savingRetailKey === rowKey;
    
    const savedCash = Number(ri.savedRetailCash) || 0;
    const savedOnline = Number(ri.savedRetailOnline) || 0;
    const savedFoot = Number(ri.savedRetailFootFall) || 0;
    const hasUnsavedRetailChange = rCash !== savedCash || rOnline !== savedOnline || rFoot !== savedFoot;
    
    // Custom classes for compact inputs
    const compactInputCls = "w-[70px] text-center text-xs font-bold bg-white border border-amber-400 rounded px-1 py-1 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 disabled:bg-slate-100 disabled:text-slate-500";

    return (
      <tr key={rowKey} className={`hover:bg-slate-50 ${isTotal ? "bg-amber-50/60 border-t-2 border-amber-300" : isSubRow ? "bg-slate-50/50" : ""}`}>
        <td className={`px-3 py-3 text-center font-bold text-slate-800 text-[11px] border-r border-slate-200 whitespace-nowrap ${isTotal ? "bg-amber-50" : isSubRow ? "bg-slate-100/50" : "bg-slate-50"}`}>
          <div className="flex items-center justify-center gap-1.5">
            {hasMonthData && !isTotal && (
              <div className="relative group flex items-center justify-center">
                <button onClick={() => toggleExpand(rowKey)} className="text-blue-600 hover:text-blue-800 transition-colors focus:outline-none">
                  {isExpanded ? <FaMinusCircle className="w-3.5 h-3.5" /> : <FaPlusCircle className="w-3.5 h-3.5" />}
                </button>
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 hidden group-hover:block bg-slate-800 text-white text-[10px] font-medium px-2 py-1 rounded shadow-lg whitespace-nowrap z-[999] pointer-events-none">
                  {isExpanded ? "Collapse Month" : "Expand Month"}
                </div>
              </div>
            )}
            <span>{dateLabel}</span>
          </div>
        </td>
        <td className="px-2 py-3 text-center font-semibold text-emerald-600 border-r border-slate-100 text-xs">{fmt(r.clinic.cash)}</td>
        <td className="px-2 py-3 text-center font-semibold text-sky-600 border-r border-slate-100 text-xs">{fmt(r.clinic.online)}</td>
        <td className="px-2 py-3 text-center font-bold text-blue-700 border-r border-slate-100 bg-blue-50/40 text-xs">{fmt(r.clinic.total)}</td>
        <td className="px-2 py-3 text-center font-bold text-blue-800 border-r border-slate-200 bg-blue-50/40 text-xs">{r.clinic.footFall}</td>

        <td className="px-2 py-3 text-center font-semibold text-emerald-600 border-r border-slate-100 text-xs">{fmt(r.lab.cash)}</td>
        <td className="px-2 py-3 text-center font-semibold text-sky-600 border-r border-slate-100 text-xs">{fmt(r.lab.online)}</td>
        <td className="px-2 py-3 text-center font-bold text-purple-700 border-r border-slate-100 bg-purple-50/40 text-xs">{fmt(r.lab.total)}</td>
        <td className="px-2 py-3 text-center font-bold text-purple-800 border-r border-slate-200 bg-purple-50/40 text-xs">{r.lab.footFall}</td>

        <td className="px-2 py-3 text-center font-semibold text-emerald-600 border-r border-slate-100 text-xs">{fmt(r.pharmacy.cash)}</td>
        <td className="px-2 py-3 text-center font-semibold text-sky-600 border-r border-slate-100 text-xs">{fmt(r.pharmacy.online)}</td>
        <td className="px-2 py-3 text-center font-bold text-emerald-700 border-r border-slate-100 bg-emerald-50/40 text-xs">{fmt(r.pharmacy.total)}</td>
        <td className="px-2 py-3 text-center font-bold text-emerald-800 border-r border-slate-200 bg-emerald-50/40 text-xs">{r.pharmacy.footFall}</td>

        {/* W Pharmacy - auto-calculated */}
        <td className="px-2 py-3 text-center font-semibold text-cyan-600 border-r border-slate-100 text-xs">{fmt(wCash)}</td>
        <td className="px-2 py-3 text-center font-semibold text-cyan-600 border-r border-slate-100 text-xs">{fmt(wOnline)}</td>
        <td className="px-2 py-3 text-center font-bold text-cyan-700 border-r border-slate-100 bg-cyan-50/40 text-xs">{fmt(wTotal)}</td>
        <td className="px-2 py-3 text-center font-bold text-cyan-800 border-r border-slate-200 bg-cyan-50/40 text-xs">{wFoot}</td>

        {/* Total Pharmacy inputs (COMPACT) */}
        <td className="px-1 py-2 border-r border-slate-100 bg-amber-50/40 w-[75px]">
          <input type="number" min="0" placeholder="0" disabled={!isTotal && isRetailSaved}
            value={isTotal ? retailInput.cash : (ri.cash || "")}
            onChange={(e) => {
              const v = e.target.value;
              if (isTotal) setRetailInput((p) => ({ ...p, cash: v }));
              else setRowInputs((p) => ({ ...p, [rowKey]: { ...(p[rowKey] || {}), cash: v, savedRetail: false } }));
            }}
            className={compactInputCls} />
        </td>
        <td className="px-1 py-2 border-r border-slate-100 bg-amber-50/40 w-[75px]">
          <input type="number" min="0" placeholder="0" disabled={!isTotal && isRetailSaved}
            value={isTotal ? retailInput.online : (ri.online || "")}
            onChange={(e) => {
              const v = e.target.value;
              if (isTotal) setRetailInput((p) => ({ ...p, online: v }));
              else setRowInputs((p) => ({ ...p, [rowKey]: { ...(p[rowKey] || {}), online: v, savedRetail: false } }));
            }}
            className={compactInputCls} />
        </td>
        
        {/* Total Pharmacy Total (with integrated Save/Edit icon) (COMPACT) */}
        <td className="px-1 py-2 text-center border-r border-slate-100 bg-amber-50/40 w-[110px]">
          <div className="flex items-center justify-center gap-0.5">
            <span className="font-bold text-amber-700 text-xs">{fmt(rRetail.total)}</span>
            {!isTotal && (
              isRetailSaved ? (
                <button type="button" onClick={() => handleEditRetail(rowKey)} className="w-5 h-5 rounded flex items-center justify-center text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200" title="Edit">
                  <FaEdit className="w-2.5 h-2.5" />
                </button>
              ) : (
                <button type="button" onClick={() => handleSaveRetail(rowKey, rRetail, rGrand.total)} disabled={isRetailSaving || !hasUnsavedRetailChange} className={`w-5 h-5 rounded flex items-center justify-center border ${isRetailSaving || !hasUnsavedRetailChange ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed" : "bg-amber-600 text-white hover:bg-amber-700 border-amber-600 shadow-sm"}`} title="Save">
                  {isRetailSaving ? <FiRefreshCw className="w-2.5 h-2.5 animate-spin" /> : <FaSave className="w-2.5 h-2.5" />}
                </button>
              )
            )}
          </div>
        </td>

        <td className="px-1 py-2 border-r border-slate-200 bg-amber-50/40 w-[75px]">
          <input type="number" min="0" placeholder="0" disabled={!isTotal && isRetailSaved}
            value={isTotal ? retailInput.footFall : (ri.footFall || "")}
            onChange={(e) => {
              const v = e.target.value;
              if (isTotal) setRetailInput((p) => ({ ...p, footFall: v }));
              else setRowInputs((p) => ({ ...p, [rowKey]: { ...(p[rowKey] || {}), footFall: v, savedRetail: false } }));
            }}
            className={compactInputCls} />
        </td>

        {customSegments.map(cat => {
          const cCash = isTotal ? (Number(retailInput[`${cat.key}_cash`]) || 0) : (Number(ri[cat.key]?.cash) || 0);
          const cOnline = isTotal ? (Number(retailInput[`${cat.key}_online`]) || 0) : (Number(ri[cat.key]?.online) || 0);
          const cTotal = cCash + cOnline;

          return (
            <React.Fragment key={cat.key}>
              <td className="px-1 py-2 border-r border-slate-100 bg-white w-[70px]">
                <input type="number" min="0" placeholder="0"
                  value={isTotal ? (retailInput[`${cat.key}_cash`] || "") : (ri[cat.key]?.cash || "")}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (isTotal) setRetailInput((p) => ({ ...p, [`${cat.key}_cash`]: v }));
                    else setRowInputs((p) => ({ ...p, [rowKey]: { ...(p[rowKey] || {}), [cat.key]: { ...(p[rowKey]?.[cat.key] || {}), cash: v } } }));
                  }}
                  className={compactInputCls} />
              </td>
              <td className="px-1 py-2 border-r border-slate-100 bg-white w-[70px]">
                <input type="number" min="0" placeholder="0"
                  value={isTotal ? (retailInput[`${cat.key}_online`] || "") : (ri[cat.key]?.online || "")}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (isTotal) setRetailInput((p) => ({ ...p, [`${cat.key}_online`]: v }));
                    else setRowInputs((p) => ({ ...p, [rowKey]: { ...(p[rowKey] || {}), [cat.key]: { ...(p[rowKey]?.[cat.key] || {}), online: v } } }));
                  }}
                  className={compactInputCls} />
              </td>
              <td className="px-2 py-3 text-center font-bold text-slate-700 border-r border-slate-100 bg-white text-xs w-[70px]">
                {fmt(cTotal)}
              </td>
              <td className="px-1 py-2 border-r border-slate-100 bg-white w-[70px]">
                <input type="number" min="0" placeholder="0"
                  value={isTotal ? (retailInput[`${cat.key}_ff`] || "") : (ri[cat.key]?.footFall || "")}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (isTotal) setRetailInput((p) => ({ ...p, [`${cat.key}_ff`]: v }));
                    else setRowInputs((p) => ({ ...p, [rowKey]: { ...(p[rowKey] || {}), [cat.key]: { ...(p[rowKey]?.[cat.key] || {}), footFall: v } } }));
                  }}
                  className={compactInputCls} />
              </td>
            </React.Fragment>
          );
        })}

        <td className="px-2 py-3 text-center font-bold text-emerald-700 border-r border-slate-100 bg-indigo-50/40 text-xs">{fmt(rGrand.cash)}</td>
        <td className="px-2 py-3 text-center font-bold text-sky-700 border-r border-slate-100 bg-indigo-50/40 text-xs">{fmt(rGrand.online)}</td>
        <td className="px-2 py-3 text-center font-black text-indigo-800 border-r border-slate-100 bg-indigo-50/40 text-sm">{fmt(rGrand.total)}</td>
        <td className="px-2 py-3 text-center font-black text-indigo-800 border-r border-slate-200 bg-indigo-50/40 text-xs">{rGrand.footFall}</td>

        <td className="px-2 py-2 border-r border-slate-200 bg-rose-50/40">
          {(() => {
            const isBCSaved = isTotal ? (savedBankCredit !== null && savedBankCredit > 0) : (ri.saved && ri.savedBankCredit !== null && ri.savedBankCredit > 0);
            const isEditingBC = isTotal ? isEditingTotalBC : !!ri.editingBankCredit;

            if (isBCSaved && !isEditingBC) {
              return (
                <div className="flex flex-col items-center gap-0.5">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="text-sm font-extrabold text-rose-700 whitespace-nowrap">₹{fmt(isTotal ? savedBankCredit : ri.savedBankCredit)}</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (isTotal) setIsEditingTotalBC(true);
                        else setRowInputs(p => ({ ...p, [rowKey]: { ...p[rowKey], editingBankCredit: true } }));
                      }}
                      className="w-6 h-6 rounded flex items-center justify-center text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200"
                      title="Edit Bank Credit"
                    >
                      <FaEdit className="w-2.5 h-2.5" />
                    </button>
                  </div>
                  <span className="text-[9px] font-bold text-emerald-600 flex items-center justify-center gap-1">
                    <FaCheckCircle className="w-2 h-2" /> Saved
                  </span>
                </div>
              );
            }

            const currentInputNum = parseFloat(isTotal ? bankCredit : ri.bankCredit) || 0;
            const savedBCNum = isTotal ? (savedBankCredit || 0) : (ri.savedBankCredit || 0);
            const hasUnsavedChange = currentInputNum !== savedBCNum;

            return (
              <>
                <div className="flex items-center gap-1 justify-center">
                                   <input type="number" min="0" placeholder="0"
                    value={(isTotal ? bankCredit : ri.bankCredit) === "0" || (isTotal ? bankCredit : ri.bankCredit) === 0 ? "" : (isTotal ? bankCredit : ri.bankCredit) || ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (isTotal) setBankCredit(v);
                      else setRowInputs((p) => ({ ...p, [rowKey]: { ...(p[rowKey] || {}), bankCredit: v } }));
                    }}
                    className="w-[70px] text-center text-sm font-extrabold text-rose-700 bg-white border border-rose-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500" />
                  
                  {isBCSaved && (
                    <button type="button"
                      onClick={() => {
                        if (isTotal) {
                          setIsEditingTotalBC(false);
                          setBankCredit(String(savedBankCredit));
                        } else {
                          setRowInputs(p => ({ ...p, [rowKey]: { ...p[rowKey], editingBankCredit: false, bankCredit: String(ri.savedBankCredit) } }));
                        }
                      }}
                      className="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-slate-500 bg-slate-200 hover:bg-slate-300 shadow-sm"
                      title="Cancel">
                      <FiX className="w-3 h-3" />
                    </button>
                  )}

                  <button type="button"
                    onClick={() => {
                      if (isTotal) handleSaveClick();
                      else {
                        const bcNum = parseFloat(ri.bankCredit) || 0;
                        handleSaveRow(rowKey, bcNum, rGrand.total, rRetail);
                      }
                    }}
                    disabled={!hasUnsavedChange}
                    title="Save"
                    className={`flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center transition-all shadow-sm ${hasUnsavedChange
                      ? "bg-gradient-to-br from-rose-500 to-rose-600 text-white hover:from-rose-600 hover:to-rose-700 hover:scale-105"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                      }`}>
                    {savingRowKey === rowKey ? <FiRefreshCw className="w-3 h-3 animate-spin" /> : <FaSave className="w-3 h-3" />}
                  </button>
                </div>
              </>
            );
          })()}
        </td>

        <td className={`px-2 py-3 text-center font-black text-sm border-r border-slate-200 bg-rose-50/40 ${rDiffColor}`}>
          {rDiffLabel === "—" ? "—" : (rDiffAbs < 0.5 ? "0" : fmt(rDiffAbs))}
        </td>
        <td className={`px-2 py-3 text-center font-bold text-[10px] uppercase tracking-wider bg-rose-50/40 ${rDiffColor}`}>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${rDiffLabel === "MATCHED" ? "bg-emerald-50 border-emerald-200" : rDiffLabel === "CREDIT MORE" ? "bg-blue-50 border-blue-200" : rDiffLabel === "CREDIT LESS" ? "bg-rose-50 border-rose-200" : "bg-slate-50 border-slate-200"}`}>
            {rDiffLabel === "MATCHED" && <FaEquals className="w-2.5 h-2.5" />}
            {rDiffLabel === "CREDIT MORE" && <FaArrowUp className="w-2.5 h-2.5" />}
            {rDiffLabel === "CREDIT LESS" && <FaArrowDown className="w-2.5 h-2.5" />}
            {rDiffLabel}
          </span>
        </td>
      </tr>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-2 sm:p-3 lg:p-4">
      {toast && (
        <div className={`fixed top-5 right-5 z-[99999] flex items-center gap-3 px-4 py-2.5 rounded-lg shadow-lg text-white ${toast.type === "error" ? "bg-red-600" : "bg-emerald-600"}`}>
          {toast.type === "error" ? <FiXCircle className="w-4 h-4" /> : <FiCheckCircle className="w-4 h-4" />}
          <span className="font-medium text-xs">{toast.message}</span>
        </div>
      )}

      <AddTargetModal isOpen={!!showAddTargetModal}
        onClose={() => { setShowAddTargetModal(false); setEditTargetData(null); }}
        onSave={(payload) => { if (payload.mode === "edit") handleUpdateTargets(payload); else if (payload.mode === "fy") handleSaveFYTargets(payload); }}
        saving={savingTarget} editTarget={editTargetData} />

      {showSaveConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[999999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-purple-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-4 text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0"><FaSave className="w-5 h-5" /></div>
              <div><h3 className="font-bold text-sm m-0">Save Bank Credit</h3><p className="text-[10px] text-white/80 m-0 mt-0.5">Confirm before saving</p></div>
            </div>
            <div className="p-5 space-y-3">
              <div className="bg-purple-50 rounded-lg border border-purple-200 p-3">
                <div className="flex items-center justify-between text-xs"><span className="text-slate-600 font-medium">Bank Credit:</span><span className="font-extrabold text-purple-700 text-base">{fmtAmt(parseFloat(bankCredit) || 0)}</span></div>
                <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-purple-200"><span className="text-slate-600 font-medium">Online Total:</span><span className="font-bold text-slate-700">{fmtAmt(grandTotalLive?.online || 0)}</span></div>
              </div>
              <p className="text-sm text-slate-700 text-center font-medium m-0">Do you want to save this bank credit?</p>
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-3 bg-slate-50 border-t border-slate-200">
              <button onClick={() => setShowSaveConfirm(false)} disabled={savingBankCredit} type="button" className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-50">Cancel</button>
              <button onClick={handleConfirmSave} disabled={savingBankCredit} type="button" className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-md flex items-center gap-1.5 disabled:opacity-50">
                {savingBankCredit ? <FiRefreshCw className="w-3 h-3 animate-spin" /> : <FaSave className="w-3 h-3" />}
                {savingBankCredit ? "Saving..." : "Yes, Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full">
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between gap-3 mb-3 bg-white border border-slate-200 rounded-lg px-3 py-2.5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2"><FiTrendingUp className="w-4 h-4 text-blue-600" /><h1 className="text-sm font-bold text-slate-900 whitespace-nowrap">Revenue Analytics</h1></div>
            <span className="text-xs font-extrabold text-blue-700 uppercase tracking-wider border-l border-slate-200 pl-3">
              {activePreset === "all" ? "All Time Data" : (fromDate && toDate ? `${formatDateToDDMMYYYY(fromDate)} – ${formatDateToDDMMYYYY(toDate)}` : "—")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 bg-blue-50 p-0.5 rounded-md border border-blue-100">
              {presetOptions.map((p) => (
                <button key={p.v} onClick={() => setPreset(p.v)} type="button"
                  className={`px-2.5 py-1 text-[10px] font-bold rounded transition-all whitespace-nowrap ${activePreset === p.v ? "bg-blue-600 text-white shadow-sm" : "text-blue-600 hover:bg-white"}`}>
                  {p.l}
                </button>
              ))}
            </div>
            <div className="relative ra-month-trigger">
              <button onClick={handleMonthPickerClick} type="button" className="flex items-center gap-2 h-8 px-3 text-[11px] font-bold text-white bg-blue-600 border border-blue-600 rounded-md hover:bg-blue-700 whitespace-nowrap shadow-sm">
                <span>{MONTHS[selectedMonth - 1]}, {selectedYear}</span><FaCalendarAlt className="w-3 h-3" />
              </button>
              <div className="ra-month-picker">
                <MonthYearPickerPopup isOpen={showMonthPicker} position={monthPickerPos} month={selectedMonth} year={selectedYear} onMonthSelect={handleMonthSelect} onClose={() => setShowMonthPicker(false)} />
              </div>
            </div>
            {hasAnalyticsFilters && (
              <button type="button" onClick={handleClearAnalyticsFilters} className="flex items-center gap-1 h-8 px-2.5 text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-md hover:bg-rose-100 whitespace-nowrap">
                <FiX className="w-3 h-3" /> Clear
              </button>
            )}
            <button type="button" onClick={() => { setEditTargetData(null); setShowAddTargetModal(true); }} className="flex items-center gap-1.5 h-8 px-3 text-[11px] font-bold text-white bg-purple-600 rounded-md hover:bg-purple-700 whitespace-nowrap shadow-sm">
              <FiTarget className="w-3 h-3" /> Seg & Target
            </button>
            <button type="button" onClick={() => setShowGraph((p) => !p)}
              className={`flex items-center gap-1.5 h-8 px-3 text-[11px] font-bold rounded-md whitespace-nowrap shadow-sm transition-colors ${showGraph ? "text-white bg-indigo-600 hover:bg-indigo-700" : "text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100"}`}>
              <FiPieChart className="w-3 h-3" /> {showGraph ? "Hide Graph" : "Show Graph"}
            </button>
            <div className="relative" ref={exportDropdownRef}>
              <button onClick={() => setShowExportDropdown(!showExportDropdown)} disabled={!data} type="button" className="flex items-center gap-1.5 h-8 px-2.5 text-[11px] font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap">
                <FiDownload className="w-3 h-3" /> Export <FiChevronDown className="w-3 h-3" />
              </button>
              {showExportDropdown && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-[999]">
                  <button onClick={() => { handleExportCSV(); setShowExportDropdown(false); }} className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2"><FiDownload className="w-3.5 h-3.5" /> Export Revenue</button>
                  <button onClick={() => { handleExportTrackerCSV(); setShowExportDropdown(false); }} className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2"><FiDownload className="w-3.5 h-3.5" /> Export Targets</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between gap-2 flex-wrap mb-3 bg-white border border-slate-200 rounded-lg px-3 py-2.5">
          <div className="flex items-center gap-2"><FiTrendingUp className="w-4 h-4 text-blue-600" /><h1 className="text-sm font-bold text-slate-900">Revenue Analytics</h1></div>
          <div className="flex items-center gap-1">
            {hasAnalyticsFilters && (<button type="button" onClick={handleClearAnalyticsFilters} className="p-1.5 text-rose-700 bg-rose-50 border border-rose-200 rounded-md"><FiX className="w-3 h-3" /></button>)}
            <button type="button" onClick={() => { setEditTargetData(null); setShowAddTargetModal(true); }} className="p-1.5 text-purple-700 bg-purple-50 border border-purple-200 rounded-md"><FiTarget className="w-3 h-3" /></button>
            <button type="button" onClick={() => setShowGraph((p) => !p)} className={`p-1.5 rounded-md border ${showGraph ? "text-white bg-indigo-600 border-indigo-600" : "text-indigo-700 bg-indigo-50 border-indigo-200"}`}><FiPieChart className="w-3 h-3" /></button>
            <div className="relative" ref={exportDropdownRef}>
              <button onClick={() => setShowExportDropdown(!showExportDropdown)} disabled={!data} className="p-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md disabled:opacity-50"><FiDownload className="w-3 h-3" /></button>
              {showExportDropdown && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-[999]">
                  <button onClick={() => { handleExportCSV(); setShowExportDropdown(false); }} className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50">Export Revenue</button>
                  <button onClick={() => { handleExportTrackerCSV(); setShowExportDropdown(false); }} className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-purple-50">Export Targets</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:hidden mb-3 flex items-center gap-1 overflow-x-auto pb-1">
          {presetOptions.map((p) => (
            <button key={p.v} onClick={() => setPreset(p.v)} className={`px-3 py-1.5 text-[11px] font-bold rounded-md border transition-all whitespace-nowrap flex-shrink-0 ${activePreset === p.v ? "bg-blue-600 text-white border-blue-600" : "bg-white text-blue-600 border-blue-200"}`}>
              {p.l}
            </button>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 px-3 py-2 mb-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs font-medium">
            <FiAlertCircle className="w-4 h-4 flex-shrink-0" /><span>{error}</span>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2.5 mb-3">
              {allCardCategories.map((card) => (
                <CategoryCard key={card.key} title={card.title} icon={card.icon} footfall={card.footfall} total={card.total} data={card.data} accent={card.accent}
                  rangeTarget={card.rangeTarget} rangeTargetFF={card.rangeTargetFF} hasTarget={hasRangeTarget && card.rangeTarget > 0} rangeLabel={rangeLabel} isCustom={card.isCustom} />
              ))}
              <GrandTotalCard total={grandTotalLive.total} cash={grandTotalLive.cash} online={grandTotalLive.online} due={grandTotalLive.due} footFall={grandTotalLive.footFall}
                rangeTarget={rangeTargets.total} rangeTargetFF={rangeTargets.totalFF} hasTarget={hasRangeTarget && rangeTargets.total > 0} rangeLabel={rangeLabel} />
            </div>

            {showGraph && (
              <GraphRepresentation cards={allCardCategories}
                grandTotal={{ total: grandTotalLive.total, cash: grandTotalLive.cash, online: grandTotalLive.online, due: grandTotalLive.due, footFall: grandTotalLive.footFall, rangeTarget: rangeTargets.total, rangeTargetFF: rangeTargets.totalFF }}
                hasRangeTarget={hasRangeTarget && rangeTargets.total > 0} rangeLabel={rangeLabel} />
            )}

            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-xs" style={{ minWidth: `${1100 + customSegments.length * 260}px` }}>
                  <thead>
                    <tr>
                      <th className="px-2 py-2 text-center font-bold text-white uppercase tracking-wider text-[10px] border-r border-blue-700 bg-blue-800" rowSpan={2}>Date</th>
                      <th className="px-2 py-2 text-center font-bold text-white uppercase tracking-wider text-[10px] border-r border-blue-700 bg-blue-800" colSpan={4}>Clinic</th>
                      <th className="px-2 py-2 text-center font-bold text-white uppercase tracking-wider text-[10px] border-r border-purple-700 bg-purple-700" colSpan={4}>Lab</th>
                      <th className="px-2 py-2 text-center font-bold text-white uppercase tracking-wider text-[10px] border-r border-emerald-700 bg-emerald-700" colSpan={4}>Clinic Pharmacy</th>
                      <th className="px-2 py-2 text-center font-bold text-white uppercase tracking-wider text-[10px] border-r border-cyan-700 bg-cyan-700" colSpan={4}>
                        <div className="flex items-center justify-center gap-1.5">
                          <FaWalking className="w-3 h-3" /> W Pharmacy
                        </div>
                      </th>
                      <th className="px-2 py-2 text-center font-bold text-white uppercase tracking-wider text-[10px] border-r border-amber-700 bg-amber-600" colSpan={4}>Total Pharmacy</th>
                      
                      {customSegments.map(cat => (
                        <React.Fragment key={cat.key}>
                          <th className={`px-2 py-2 text-center font-bold text-white uppercase tracking-wider text-[10px] border-r ${styles.header[cat.key]}`} colSpan={4}>{cat.label}</th>
                        </React.Fragment>
                      ))}
                      
                      <th className="px-2 py-2 text-center font-bold text-white uppercase tracking-wider text-[10px] border-r border-indigo-700 bg-indigo-700" colSpan={4}>Grand Total</th>
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

                      <th className="px-2 py-1.5 text-center font-bold text-cyan-700 uppercase tracking-wider text-[9px] border-r border-cyan-100 bg-cyan-50">Cash</th>
                      <th className="px-2 py-1.5 text-center font-bold text-cyan-700 uppercase tracking-wider text-[9px] border-r border-cyan-100 bg-cyan-50">Online</th>
                      <th className="px-2 py-1.5 text-center font-bold text-cyan-700 uppercase tracking-wider text-[9px] border-r border-cyan-100 bg-cyan-50">Total</th>
                      <th className="px-2 py-1.5 text-center font-bold text-cyan-700 uppercase tracking-wider text-[9px] border-r border-cyan-200 bg-cyan-50">FootFall</th>

                      <th className="px-1 py-1.5 text-center font-bold text-amber-700 uppercase tracking-wider text-[9px] border-r border-amber-100 bg-amber-50 w-[75px]">Cash</th>
                      <th className="px-1 py-1.5 text-center font-bold text-amber-700 uppercase tracking-wider text-[9px] border-r border-amber-100 bg-amber-50 w-[75px]">Online</th>
                      <th className="px-1 py-1.5 text-center font-bold text-amber-700 uppercase tracking-wider text-[9px] border-r border-amber-100 bg-amber-50 w-[110px]">Total</th>
                      <th className="px-1 py-1.5 text-center font-bold text-amber-700 uppercase tracking-wider text-[9px] border-r border-amber-200 bg-amber-50 w-[75px]">FootFall</th>

                      {customSegments.map(cat => (
                        <React.Fragment key={cat.key}>
                          <th className={`px-1 py-1.5 text-center font-bold uppercase tracking-wider text-[9px] border-r ${styles.sub[cat.key]} w-[70px]`}>Cash</th>
                          <th className={`px-1 py-1.5 text-center font-bold uppercase tracking-wider text-[9px] border-r ${styles.sub[cat.key]} w-[70px]`}>Online</th>
                          <th className={`px-1 py-1.5 text-center font-bold uppercase tracking-wider text-[9px] border-r ${styles.sub[cat.key]} w-[70px]`}>Total</th>
                          <th className={`px-1 py-1.5 text-center font-bold uppercase tracking-wider text-[9px] border-r ${styles.sub[cat.key]} w-[70px]`}>FootFall</th>
                        </React.Fragment>
                      ))}

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
                      const isExpanded = expandedMonths[rowKey];
                      return (
                        <React.Fragment key={rowKey || idx}>
                          {renderTableRow(r, false)}
                          {isExpanded && r.monthData && r.monthData.map(md => renderTableRow(md, true))}
                          {isExpanded && r.monthData && r.monthData.length > 0 && (
                            <>
                              <tr>
                                <td colSpan={50} className="py-2 bg-slate-100 border-y border-slate-300 text-center">
                                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-center gap-2">
                                    <span className="w-10 h-px bg-slate-400"></span>END OF {r.label.toUpperCase()}<span className="w-10 h-px bg-slate-400"></span>
                                  </span>
                                </td>
                              </tr>
                              <tr className="bg-indigo-50/50 border-b-2 border-indigo-200">
                                <td className="px-2 py-2 text-center font-bold text-indigo-800 text-[10px] uppercase tracking-wider border-r border-indigo-200 whitespace-nowrap">Summary ({r.label})</td>
                                <td className="px-2 py-2 text-center font-black text-emerald-700 border-r border-indigo-100 text-[10px]">{fmt(r.clinic.cash)}</td>
                                <td className="px-2 py-2 text-center font-black text-sky-700 border-r border-indigo-100 text-[10px]">{fmt(r.clinic.online)}</td>
                                <td className="px-2 py-2 text-center font-black text-blue-800 border-r border-indigo-100 bg-blue-100/30 text-[10px]">{fmt(r.clinic.total)}</td>
                                <td className="px-2 py-2 text-center font-black text-blue-900 border-r border-indigo-100 bg-blue-100/30 text-[10px]">{r.clinic.footFall}</td>
                                <td className="px-2 py-2 text-center font-black text-emerald-700 border-r border-indigo-100 text-[10px]">{fmt(r.lab.cash)}</td>
                                <td className="px-2 py-2 text-center font-black text-sky-700 border-r border-indigo-100 text-[10px]">{fmt(r.lab.online)}</td>
                                <td className="px-2 py-2 text-center font-black text-purple-800 border-r border-indigo-100 bg-purple-100/30 text-[10px]">{fmt(r.lab.total)}</td>
                                <td className="px-2 py-2 text-center font-black text-purple-900 border-r border-indigo-100 bg-purple-100/30 text-[10px]">{r.lab.footFall}</td>
                                <td className="px-2 py-2 text-center font-black text-emerald-700 border-r border-indigo-100 text-[10px]">{fmt(r.pharmacy.cash)}</td>
                                <td className="px-2 py-2 text-center font-black text-sky-700 border-r border-indigo-100 text-[10px]">{fmt(r.pharmacy.online)}</td>
                                <td className="px-2 py-2 text-center font-black text-emerald-800 border-r border-indigo-100 bg-emerald-100/30 text-[10px]">{fmt(r.pharmacy.total)}</td>
                                <td className="px-2 py-2 text-center font-black text-emerald-900 border-r border-indigo-100 bg-emerald-100/30 text-[10px]">{r.pharmacy.footFall}</td>
                                {/* W Pharmacy summary cells */}
                                <td className="px-2 py-2 text-center font-black text-cyan-700 border-r border-indigo-100 bg-cyan-100/30 text-[10px]">{fmt((Number(rowInputs[rowKey]?.cash) || 0) - (Number(r.pharmacy.cash) || 0))}</td>
                                <td className="px-2 py-2 text-center font-black text-cyan-700 border-r border-indigo-100 bg-cyan-100/30 text-[10px]">{fmt((Number(rowInputs[rowKey]?.online) || 0) - (Number(r.pharmacy.online) || 0))}</td>
                                <td className="px-2 py-2 text-center font-black text-cyan-800 border-r border-indigo-100 bg-cyan-100/30 text-[10px]">{fmt((Number(rowInputs[rowKey]?.cash) || 0) + (Number(rowInputs[rowKey]?.online) || 0) - (Number(r.pharmacy.cash) || 0) - (Number(r.pharmacy.online) || 0))}</td>
                                <td className="px-2 py-2 text-center font-black text-cyan-900 border-r border-indigo-100 bg-cyan-100/30 text-[10px]">{(Number(rowInputs[rowKey]?.footFall) || 0) - (Number(r.pharmacy.footFall) || 0)}</td>
                                {/* Total Pharmacy summary cells (Action removed) */}
                                <td className="px-2 py-2 border-r border-indigo-100 bg-amber-100/30"></td>
                                <td className="px-2 py-2 border-r border-indigo-100 bg-amber-100/30"></td>
                                <td className="px-2 py-2 text-center font-black text-amber-800 border-r border-indigo-100 bg-amber-100/30 text-[10px]">{fmt((Number(rowInputs[rowKey]?.cash) || 0) + (Number(rowInputs[rowKey]?.online) || 0))}</td>
                                <td className="px-2 py-2 text-center font-black text-amber-900 border-r border-indigo-200 bg-amber-100/30 text-[10px]">{rowInputs[rowKey]?.footFall || 0}</td>
                                
                                {customSegments.map(cat => (
                                  <React.Fragment key={cat.key}>
                                    <td className="px-2 py-2 border-r border-indigo-100 bg-slate-100/30"></td>
                                    <td className="px-2 py-2 border-r border-indigo-100 bg-slate-100/30"></td>
                                    <td className="px-2 py-2 border-r border-indigo-100 bg-slate-100/30"></td>
                                    <td className="px-2 py-2 border-r border-indigo-100 bg-slate-100/30"></td>
                                  </React.Fragment>
                                ))}

                                <td className="px-2 py-2 text-center font-black text-indigo-900 border-r border-indigo-100 bg-indigo-100 text-[10px]">
                                  {fmt(r.clinic.total + r.lab.total + r.pharmacy.total + (Number(rowInputs[rowKey]?.cash) || 0) + (Number(rowInputs[rowKey]?.online) || 0))}
                                </td>
                                <td className="px-2 py-2 text-center font-black text-indigo-900 border-r border-indigo-100 bg-indigo-100 text-[10px]">
                                  {r.clinic.footFall + r.lab.footFall + r.pharmacy.footFall + (Number(rowInputs[rowKey]?.footFall) || 0)}
                                </td>
                                <td className="px-2 py-2 border-r border-indigo-100 bg-rose-100/30"></td>
                                <td className="px-2 py-2 text-center font-black text-indigo-900 border-r border-indigo-100 bg-indigo-100 text-[10px]">
                                  {fmt(r.clinic.total + r.lab.total + r.pharmacy.total + (Number(rowInputs[rowKey]?.cash) || 0) + (Number(rowInputs[rowKey]?.online) || 0))}
                                </td>
                                <td className="px-2 py-2 text-center border-indigo-100 bg-rose-100/30"></td>
                              </tr>
                            </>
                          )}
                        </React.Fragment>
                      );
                    })}

                    {tableTotal && data.rows && data.rows.length > 0 && (
                      <tr className="bg-gradient-to-r from-slate-100 to-slate-50 border-t-2 border-b-2 border-slate-400 font-bold">
                        <td className="px-2 py-3 text-center font-black text-slate-900 text-[11px] uppercase tracking-wider border-r border-slate-300 bg-slate-200 whitespace-nowrap">
                          TOTAL<div className="text-[9px] font-semibold text-slate-500 normal-case mt-0.5">({data.rows.length} row{data.rows.length > 1 ? "s" : ""})</div>
                        </td>
                        <td className="px-2 py-3 text-center font-black text-emerald-700 border-r border-slate-200 bg-slate-100 text-xs">{fmt(tableTotal.clinic.cash)}</td>
                        <td className="px-2 py-3 text-center font-black text-sky-700 border-r border-slate-200 bg-slate-100 text-xs">{fmt(tableTotal.clinic.online)}</td>
                        <td className="px-2 py-3 text-center font-black text-blue-800 border-r border-slate-200 bg-blue-100 text-xs">{fmt(tableTotal.clinic.total)}</td>
                        <td className="px-2 py-3 text-center font-black text-blue-900 border-r border-slate-200 bg-blue-100 text-xs">{tableTotal.clinic.footFall}</td>
                        <td className="px-2 py-3 text-center font-black text-emerald-700 border-r border-slate-200 bg-slate-100 text-xs">{fmt(tableTotal.lab.cash)}</td>
                        <td className="px-2 py-3 text-center font-black text-sky-700 border-r border-slate-200 bg-slate-100 text-xs">{fmt(tableTotal.lab.online)}</td>
                        <td className="px-2 py-3 text-center font-black text-purple-800 border-r border-slate-200 bg-purple-100 text-xs">{fmt(tableTotal.lab.total)}</td>
                        <td className="px-2 py-3 text-center font-black text-purple-900 border-r border-slate-200 bg-purple-100 text-xs">{tableTotal.lab.footFall}</td>
                        <td className="px-2 py-3 text-center font-black text-emerald-700 border-r border-slate-200 bg-slate-100 text-xs">{fmt(tableTotal.pharmacy.cash)}</td>
                        <td className="px-2 py-3 text-center font-black text-sky-700 border-r border-slate-200 bg-slate-100 text-xs">{fmt(tableTotal.pharmacy.online)}</td>
                        <td className="px-2 py-3 text-center font-black text-emerald-800 border-r border-slate-200 bg-emerald-100 text-xs">{fmt(tableTotal.pharmacy.total)}</td>
                        <td className="px-2 py-3 text-center font-black text-emerald-900 border-r border-slate-200 bg-emerald-100 text-xs">{tableTotal.pharmacy.footFall}</td>
                        {/* W Pharmacy totals */}
                        <td className="px-2 py-3 text-center font-black text-cyan-700 border-r border-slate-200 bg-cyan-100 text-xs">{fmt(tableTotal.wPharmacy.cash)}</td>
                        <td className="px-2 py-3 text-center font-black text-cyan-700 border-r border-slate-200 bg-cyan-100 text-xs">{fmt(tableTotal.wPharmacy.online)}</td>
                        <td className="px-2 py-3 text-center font-black text-cyan-800 border-r border-slate-200 bg-cyan-100 text-xs">{fmt(tableTotal.wPharmacy.total)}</td>
                        <td className="px-2 py-3 text-center font-black text-cyan-900 border-r border-slate-200 bg-cyan-100 text-xs">{tableTotal.wPharmacy.footFall}</td>
                        {/* Total Pharmacy totals (Action removed) */}
                        <td className="px-2 py-3 text-center font-black text-amber-700 border-r border-slate-200 bg-amber-100 text-xs">{fmt(tableTotal.retail.cash)}</td>
                        <td className="px-2 py-3 text-center font-black text-amber-700 border-r border-slate-200 bg-amber-100 text-xs">{fmt(tableTotal.retail.online)}</td>
                        <td className="px-2 py-3 text-center font-black text-amber-800 border-r border-slate-200 bg-amber-100 text-xs">{fmt(tableTotal.retail.total)}</td>
                        <td className="px-2 py-3 text-center font-black text-amber-900 border-r border-slate-200 bg-amber-100 text-xs">{tableTotal.retail.footFall}</td>

                        {customSegments.map(cat => {
                          const sumCash = data.rows.reduce((sum, r) => sum + (Number(rowInputs[r.date]?.[cat.key]?.cash) || 0), 0);
                          const sumOnline = data.rows.reduce((sum, r) => sum + (Number(rowInputs[r.date]?.[cat.key]?.online) || 0), 0);
                          const sumFoot = data.rows.reduce((sum, r) => sum + (Number(rowInputs[r.date]?.[cat.key]?.footFall) || 0), 0);
                          return (
                            <React.Fragment key={cat.key}>
                              <td className="px-2 py-3 text-center font-black text-slate-800 border-r border-slate-200 bg-slate-100 text-xs">{fmt(sumCash)}</td>
                              <td className="px-2 py-3 text-center font-black text-slate-800 border-r border-slate-200 bg-slate-100 text-xs">{fmt(sumOnline)}</td>
                              <td className="px-2 py-3 text-center font-black text-slate-800 border-r border-slate-200 bg-slate-100 text-xs">{fmt(sumCash + sumOnline)}</td>
                              <td className="px-2 py-3 text-center font-black text-slate-800 border-r border-slate-200 bg-slate-100 text-xs">{fmt(sumFoot)}</td>
                            </React.Fragment>
                          );
                        })}

                        <td className="px-2 py-3 text-center font-black text-emerald-800 border-r border-slate-200 bg-indigo-100 text-xs">{fmt(tableTotal.grand.cash)}</td>
                        <td className="px-2 py-3 text-center font-black text-sky-800 border-r border-slate-200 bg-indigo-100 text-xs">{fmt(tableTotal.grand.online)}</td>
                        <td className="px-2 py-3 text-center font-black text-indigo-900 border-r border-slate-200 bg-indigo-200 text-sm">{fmt(tableTotal.grand.total)}</td>
                        <td className="px-2 py-3 text-center font-black text-indigo-900 border-r border-slate-200 bg-indigo-100 text-xs">{tableTotal.grand.footFall}</td>
                        <td className="px-2 py-3 text-center font-black text-rose-800 border-r border-slate-200 bg-rose-100 text-sm">{tableTotal.bankCredit ? fmt(tableTotal.bankCredit) : "—"}</td>
                        <td className={`px-2 py-3 text-center font-black text-sm border-r border-slate-200 bg-rose-100 ${!tableTotal.bankCredit ? "text-slate-400" : Math.abs(tableTotal.creditedDiff) < 0.5 ? "text-emerald-800" : tableTotal.creditedDiff > 0 ? "text-blue-800" : "text-rose-800"}`}>
                          {!tableTotal.bankCredit ? "—" : (Math.abs(tableTotal.creditedDiff) < 0.5 ? "0" : fmt(Math.abs(tableTotal.creditedDiff)))}
                        </td>
                        <td className="px-2 py-3 text-center bg-rose-100">
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