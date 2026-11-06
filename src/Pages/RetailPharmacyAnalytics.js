// src/Pages/RetailPharmacyAnalytics.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import {
  FaPills, FaCalendarAlt, FaMoneyBillWave, FaGlobe, FaTimesCircle,
  FaArrowUp, FaArrowDown, FaSave, FaEdit, FaPlus, FaTrash,
  FaChevronLeft, FaChevronRight, FaBullseye, FaCheckCircle, FaExclamationTriangle
} from "react-icons/fa";
import {
  FiTrendingUp, FiAlertCircle, FiDownload, FiTarget, FiRefreshCw,
  FiPieChart, FiCheckCircle, FiXCircle, FiX, FiLock, FiAlertTriangle
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

const pad = (n) => String(n).padStart(2, "0");
const fmtDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const formatDateToDDMMYYYY = (dateStr) => {
  if (!dateStr) return "";
  try {
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  } catch { return dateStr; }
};

const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate();

const getCurrentFYStartYear = () => {
  const d = new Date();
  return d.getMonth() + 1 >= 4 ? d.getFullYear() : d.getFullYear() - 1;
};
const formatFY = (startYear) => `${startYear}-${String(startYear + 1).slice(-2)}`;
const getFYStartForMonth = (calendarYear, calendarMonth) => calendarMonth >= 4 ? calendarYear : calendarYear - 1;

/* Denomination values used in Cash popup */
const DENOMINATIONS = [500, 200, 100, 50, 20, 10, 5, 2, 1];

/* ============================================================ */
/* Month-Year Picker Popup                                       */
/* ============================================================ */
const MonthYearPickerPopup = ({ isOpen, position, month, year, onMonthSelect, onClose }) => {
  const [viewYear, setViewYear] = useState(year || new Date().getFullYear());
  useEffect(() => { if (isOpen) setViewYear(year || new Date().getFullYear()); }, [isOpen, year]);
  if (!isOpen) return null;

  const handleMonthClick = (mIdx) => { onMonthSelect(mIdx + 1, viewYear); onClose(); };

  return (
    <div className="fixed z-[999999] w-[340px] bg-white border border-amber-200 rounded-lg shadow-2xl overflow-hidden" style={{ top: position.top, left: position.left }}>
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100 border-b border-slate-200">
        <button type="button" onClick={() => setViewYear((y) => y - 1)} className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-white rounded"><FaChevronLeft className="w-3 h-3" /></button>
        <div className="text-base font-bold text-slate-800">{viewYear}</div>
        <button type="button" onClick={() => setViewYear((y) => y + 1)} className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-white rounded"><FaChevronRight className="w-3 h-3" /></button>
      </div>
      <div className="grid grid-cols-4 gap-2 p-4">
        {MONTHS.map((mName, idx) => {
          const isSelected = month === idx + 1 && year === viewYear;
          return (
            <button key={mName} type="button" onClick={() => handleMonthClick(idx)}
              className={`py-2.5 text-xs font-bold rounded transition-all ${isSelected ? "bg-amber-600 text-white" : "text-slate-700 hover:bg-slate-100"}`}>
              {mName.slice(0, 3)}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ============================================================ */
/* Cash Denomination Popup                                       */
/* ============================================================ */
const CashDenominationPopup = ({ isOpen, onClose, onConfirm, initialAmount = "", initialBreakdown = [], rowLabel = "" }) => {
  const [qtys, setQtys] = useState({});

  useEffect(() => {
    if (isOpen) {
      const next = {};
      DENOMINATIONS.forEach((d) => { next[d] = ""; });

      if (Array.isArray(initialBreakdown) && initialBreakdown.length > 0) {
        initialBreakdown.forEach((b) => {
          const denom = Number(b?.denomination);
          const qty = Number(b?.qty) || 0;
          if (DENOMINATIONS.includes(denom) && qty > 0) next[denom] = String(qty);
        });
      } else {
        const amt = Number(initialAmount) || 0;
        if (amt > 0) {
          let remaining = Math.round(amt);
          DENOMINATIONS.forEach((d) => {
            const count = Math.floor(remaining / d);
            if (count > 0) { next[d] = String(count); remaining -= count * d; }
          });
        }
      }
      setQtys(next);
    }
  }, [isOpen, initialAmount, initialBreakdown]);

  const total = useMemo(() => {
    return DENOMINATIONS.reduce((sum, d) => sum + d * (Number(qtys[d]) || 0), 0);
  }, [qtys]);

  if (!isOpen) return null;

  const handleChange = (denom, val) => setQtys((p) => ({ ...p, [denom]: val }));

  const handleClear = () => {
    const next = {};
    DENOMINATIONS.forEach((d) => { next[d] = ""; });
    setQtys(next);
  };

  const buildBreakdown = () =>
    DENOMINATIONS
      .map((d) => {
        const q = Number(qtys[d]) || 0;
        return q > 0 ? { denomination: d, qty: q, amount: d * q } : null;
      })
      .filter(Boolean);

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[999999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-emerald-200 overflow-hidden flex flex-col max-h-[95vh]">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-white flex items-center gap-3 flex-shrink-0">
          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
            <FaMoneyBillWave className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm m-0">Cash Denomination</h3>
            <p className="text-[10px] text-white/80 m-0 mt-0.5 truncate">
              {rowLabel ? `Entry for ${rowLabel}` : "Enter note / coin counts"}
            </p>
          </div>
          <button type="button" onClick={onClose} className="w-7 h-7 rounded-md flex items-center justify-center text-white/80 hover:bg-white/20 hover:text-white">
            <FiX className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          <div className="border border-emerald-200 rounded-lg overflow-hidden">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-emerald-50">
                  <th className="px-2 py-1.5 text-left font-bold text-emerald-800 uppercase tracking-wider text-[9px] border-b border-emerald-200">Denomination</th>
                  <th className="px-2 py-1.5 text-center font-bold text-emerald-800 uppercase tracking-wider text-[9px] border-b border-l border-emerald-200">Qty</th>
                  <th className="px-2 py-1.5 text-right font-bold text-emerald-800 uppercase tracking-wider text-[9px] border-b border-l border-emerald-200">Amount</th>
                </tr>
              </thead>
              <tbody>
                {DENOMINATIONS.map((d) => {
                  const q = Number(qtys[d]) || 0;
                  const amt = d * q;
                  return (
                    <tr key={d} className="hover:bg-emerald-50/40">
                      <td className="px-2 py-1 border-b border-emerald-100 font-bold text-slate-700 whitespace-nowrap">
                        ₹{d} <span className="text-slate-400 font-semibold">×</span>
                      </td>
                      <td className="px-1 py-1 border-b border-l border-emerald-100">
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={qtys[d] || ""}
                          onChange={(e) => handleChange(d, e.target.value)}
                          className="w-full text-center text-xs font-bold text-slate-800 border border-emerald-300 rounded px-1 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                        />
                      </td>
                      <td className="px-2 py-1 border-b border-l border-emerald-100 text-right font-black text-emerald-700 whitespace-nowrap">
                        {amt > 0 ? fmt(amt) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-emerald-100">
                  <td className="px-2 py-2 font-black text-emerald-900 uppercase tracking-wider text-[10px]" colSpan={2}>Total Cash</td>
                  <td className="px-2 py-2 text-right font-black text-emerald-900 text-sm">{fmtAmt(total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 px-4 py-3 bg-slate-50 border-t border-slate-200 flex-shrink-0">
          <button type="button" onClick={handleClear}
            className="px-3 py-2 text-[11px] font-bold text-rose-600 bg-white border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors">
            Clear
          </button>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors">
              Cancel
            </button>
            <button type="button" onClick={() => { onConfirm(total, buildBreakdown()); onClose(); }}
              className="px-5 py-2 text-xs font-bold text-white rounded-lg shadow-md bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 flex items-center gap-1.5">
              <FaCheckCircle className="w-3 h-3" /> Apply {fmtAmt(total)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================ */
/* Save Confirmation Popup                                       */
/* ============================================================ */
const SaveConfirmPopup = ({ isOpen, onClose, onConfirm, saving, rowLabel, payload }) => {
  if (!isOpen || !payload) return null;

  const { cash, online, footFall, cashDenominations, total } = payload;
  const hasDenoms = Array.isArray(cashDenominations) && cashDenominations.length > 0;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-amber-200 overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-white flex items-center gap-2.5 flex-shrink-0">
          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
            <FaExclamationTriangle className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm m-0">Please Re-check Your Entry</h3>
            <p className="text-[10px] text-white/85 m-0 mt-0.5 truncate">
              {rowLabel ? `Saving for ${rowLabel}` : "Confirm before saving"}
            </p>
          </div>
          <button type="button" onClick={onClose} disabled={saving}
            className="w-7 h-7 rounded-md flex items-center justify-center text-white/80 hover:bg-white/20 hover:text-white disabled:opacity-50">
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Body — summary */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-emerald-50 border-b border-slate-200">
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                <FaMoneyBillWave className="w-3 h-3" /> Cash
              </span>
              <span className="text-sm font-black text-emerald-700">{fmtAmt(cash)}</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 bg-sky-50 border-b border-slate-200">
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-sky-700">
                <FaGlobe className="w-3 h-3" /> Online
              </span>
              <span className="text-sm font-black text-sky-700">{fmtAmt(online)}</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 bg-violet-50 border-b border-slate-200">
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-violet-700">
                <FiTarget className="w-3 h-3" /> FootFall
              </span>
              <span className="text-sm font-black text-violet-700">{fmt(footFall)}</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 bg-indigo-50">
              <span className="text-[11px] font-black uppercase tracking-wider text-indigo-700">Grand Total</span>
              <span className="text-base font-black text-indigo-800">{fmtAmt(total)}</span>
            </div>
          </div>

          {hasDenoms && (
            <div className="rounded-lg border border-emerald-200 overflow-hidden">
              <div className="px-3 py-1.5 bg-emerald-100 text-[10px] font-black uppercase tracking-wider text-emerald-800">
                Cash Denomination Breakdown
              </div>
              <div className="max-h-36 overflow-y-auto">
                <table className="w-full text-[11px]">
                  <tbody>
                    {cashDenominations.map((d) => (
                      <tr key={d.denomination} className="border-b border-emerald-100 last:border-0">
                        <td className="px-3 py-1 font-bold text-slate-700">₹{d.denomination} × {d.qty}</td>
                        <td className="px-3 py-1 text-right font-black text-emerald-700">{fmt(d.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-rose-50 border border-rose-200">
            <FiLock className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <p className="text-[10px] leading-relaxed text-rose-700 font-medium m-0">
              <span className="font-black uppercase">Important:</span> Once saved, this entry{" "}
              <span className="font-black">cannot be edited</span>. If you need to make any changes later,{" "}
              <span className="font-black">please contact your administrator</span>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 bg-slate-50 border-t border-slate-200 flex-shrink-0">
          <button type="button" onClick={onClose} disabled={saving}
            className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50">
            Go Back
          </button>
          <button type="button" onClick={onConfirm} disabled={saving}
            className="px-5 py-2 text-xs font-bold text-white rounded-lg shadow-md bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 flex items-center gap-1.5 disabled:opacity-50">
            {saving ? <FiRefreshCw className="w-3 h-3 animate-spin" /> : <FaCheckCircle className="w-3 h-3" />}
            {saving ? "Saving..." : "Yes, Save Permanently"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ============================================================ */
/* Add/Edit Target Modal — ONLY FOR RETAIL PHARMACY              */
/* ============================================================ */
const AddRetailTargetModal = ({ isOpen, onClose, onSave, saving, editTarget = null }) => {
  const isEditMode = !!editTarget;
  const defaultFYStart = isEditMode ? getFYStartForMonth(Number(editTarget.year), Number(editTarget.month)) : getCurrentFYStartYear();

  const [fyStartYear, setFyStartYear] = useState(defaultFYStart);
  const [grid, setGrid] = useState({});
  const [fyError, setFyError] = useState("");

  const currentFYStart = getCurrentFYStartYear();

  const fyOptions = useMemo(() => {
    const arr = [];
    const endYear = currentFYStart + 2;
    for (let y = 2020; y <= endYear; y++) arr.push(y);
    if (isEditMode && !arr.includes(defaultFYStart)) {
      arr.push(defaultFYStart);
      arr.sort((a, b) => a - b);
    }
    return arr;
  }, [currentFYStart, isEditMode, defaultFYStart]);

  useEffect(() => {
    if (isOpen) {
      setFyError("");
      setFyStartYear(defaultFYStart);

      const emptyGrid = {};
      FY_MONTH_ORDER.forEach((m) => {
        emptyGrid[m] = { amount: "", footFall: "" };
      });

      if (isEditMode && editTarget) {
        const editMonth = Number(editTarget.month);
        const editYear = Number(editTarget.year);
        const editFYStart = getFYStartForMonth(editYear, editMonth);
        if (editFYStart === defaultFYStart) {
          if (editTarget.amount > 0) emptyGrid[editMonth].amount = (editTarget.amount / 100000).toFixed(2).replace(/\.00$/, '');
          if (editTarget.footFall > 0) emptyGrid[editMonth].footFall = String(editTarget.footFall);
        }
      }
      setGrid(emptyGrid);
    }
  }, [isOpen, editTarget]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    const entries = [];
    let totalAmt = 0;
    let totalFootFall = 0;

    FY_MONTH_ORDER.forEach((m) => {
      const calendarYear = m >= 4 ? fyStartYear : fyStartYear + 1;
      const amtRaw = grid?.[m]?.amount;
      const ffRaw = grid?.[m]?.footFall;

      const amtInLakhs = Number(amtRaw) || 0;
      const amt = amtInLakhs * 100000;
      const ff = Number(ffRaw) || 0;

      if (amt > 0 || ff > 0) {
        entries.push({
          category: "retailPharmacy",
          categoryLabel: "Retail Pharmacy",
          month: m,
          year: calendarYear,
          amount: amt,
          footFall: ff
        });
        totalAmt += amt;
        totalFootFall += ff;
      }
    });

    if (entries.length === 0) {
      setFyError("Please enter at least one amount or footfall in the grid");
      return;
    }
    setFyError("");
    onSave({
      mode: isEditMode ? "edit" : "fy",
      fyStartYear,
      entries,
      totalAmount: totalAmt,
      totalFootFall: totalFootFall,
      editTarget: isEditMode ? editTarget : null,
    });
  };

  const handleGridChange = (month, field, value) => {
    setGrid((prev) => ({
      ...prev,
      [month]: {
        ...(prev[month] || { amount: "", footFall: "" }),
        [field]: value,
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[999999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-[95vw] shadow-2xl border border-amber-200 overflow-hidden flex flex-col max-h-[95vh]">
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-5 py-4 text-white flex items-center gap-3 flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            {isEditMode ? <FaEdit className="w-5 h-5" /> : <FiTarget className="w-5 h-5" />}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm m-0">
              {isEditMode ? `Edit Retail Pharmacy Target for ${MONTHS[editTarget.month - 1]} ${editTarget.year}` : "Set Retail Pharmacy Target"}
            </h3>
            <p className="text-[10px] text-white/80 m-0 mt-0.5">
              Enter targets for the full Financial Year (Apr → Mar). Note: Amounts should be entered in LAKHS.
            </p>
          </div>
          <button type="button" onClick={onClose} disabled={saving} className="w-7 h-7 rounded-md flex items-center justify-center text-white/80 hover:bg-white/20 hover:text-white disabled:opacity-50 ml-2">
            <FiX className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3 overflow-y-auto flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-bold text-amber-700 uppercase">Financial Year:</label>
              <select value={fyStartYear} onChange={(e) => setFyStartYear(Number(e.target.value))} disabled={isEditMode}
                className="h-9 text-xs font-bold text-amber-800 bg-white border border-amber-300 rounded px-3 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 disabled:bg-slate-100 disabled:text-slate-500">
                {fyOptions.map((y) => (<option key={y} value={y}>FY {formatFY(y)}</option>))}
              </select>
            </div>
            <div className="text-[10px] font-semibold text-slate-500">
              ({FY_MONTH_SHORT[4]} {fyStartYear} → {FY_MONTH_SHORT[3]} {fyStartYear + 1})
            </div>
            {isEditMode && (
              <div className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded">
                Editing: {MONTHS[editTarget.month - 1]} {editTarget.year}
              </div>
            )}
            <div className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-1 rounded flex items-center gap-1">
              <FiAlertCircle className="w-3 h-3" /> Amount in Lakhs (e.g. 2 = 2,00,000)
            </div>
          </div>

          <div className="border border-amber-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="px-2 py-2 text-center font-bold text-white uppercase tracking-wider text-[10px] border-r border-b border-amber-700 bg-amber-700 sticky left-0 z-20 whitespace-nowrap w-[120px]" rowSpan={2}>
                      Month
                    </th>
                    <th colSpan={2} className="px-2 py-2 text-center font-bold text-white uppercase tracking-wider text-[10px] border-r border-b bg-amber-600 whitespace-nowrap">
                      Retail Pharmacy
                    </th>
                  </tr>
                  <tr>
                    <th className="px-1.5 py-1.5 text-center font-bold uppercase tracking-wider text-[9px] border-r border-b bg-amber-50 text-amber-700 whitespace-nowrap w-[120px]">Amount (₹ Lakhs)</th>
                    <th className="px-1.5 py-1.5 text-center font-bold uppercase tracking-wider text-[9px] border-r border-b bg-amber-50 text-amber-700 whitespace-nowrap w-[120px]">FootFall</th>
                  </tr>
                </thead>
                <tbody>
                  {FY_MONTH_ORDER.map((m) => {
                    const yr = m >= 4 ? fyStartYear : fyStartYear + 1;
                    const isEditRow = isEditMode && m === editTarget.month;

                    return (
                      <tr key={m} className={`hover:bg-slate-50 ${isEditRow ? "bg-amber-50/50" : ""}`}>
                        <td className={`px-2 py-2 text-center font-bold text-[11px] border-r border-b sticky left-0 z-10 whitespace-nowrap w-[120px] ${isEditRow ? "bg-amber-100 text-amber-800" : "bg-slate-50 text-slate-700"}`}>
                          <div>{FY_MONTH_SHORT[m]}</div>
                          <div className="text-[9px] font-semibold text-slate-500 mt-0.5">{yr}</div>
                        </td>
                        <td className={`px-1 py-1.5 border-r border-b text-center ${isEditRow ? "bg-amber-50" : "bg-white"}`}>
                          <input type="number" min="0" placeholder="0"
                            value={grid?.[m]?.amount || ""}
                            onChange={(e) => handleGridChange(m, "amount", e.target.value)}
                            className={`w-full text-center text-[11px] font-bold text-slate-800 bg-white border rounded px-1 py-1 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 ${isEditRow ? "border-amber-400" : "border-slate-300"}`} />
                        </td>
                        <td className={`px-1 py-1.5 border-r border-b text-center ${isEditRow ? "bg-amber-50" : "bg-white"}`}>
                          <input type="number" min="0" placeholder="0"
                            value={grid?.[m]?.footFall || ""}
                            onChange={(e) => handleGridChange(m, "footFall", e.target.value)}
                            className={`w-full text-center text-[11px] font-bold text-slate-800 bg-white border rounded px-1 py-1 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 ${isEditRow ? "border-amber-400" : "border-slate-300"}`} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {fyError && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-rose-600">
              <FiAlertCircle className="w-3 h-3" /> {fyError}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 bg-slate-50 border-t border-slate-200 flex-shrink-0">
          <button type="button" onClick={onClose} disabled={saving}
            className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} disabled={saving}
            className="px-5 py-2 text-xs font-bold text-white rounded-lg shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
            {saving ? <FiRefreshCw className="w-3 h-3 animate-spin" /> : <FaSave className="w-3 h-3" />}
            {saving ? "Saving..." : `Save FY ${formatFY(fyStartYear)} Targets`}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ============================================================ */
/* Main Component                                                */
/* ============================================================ */
export default function RetailPharmacyAnalytics() {
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
  
  const [retailInput, setRetailInput] = useState({ cash: "", online: "", footFall: "" });
  const [rowInputs, setRowInputs] = useState({});
  const [savingRowKey, setSavingRowKey] = useState(null);

  /* Cash denomination popup state */
  const [cashPopupOpen, setCashPopupOpen] = useState(false);
  const [cashPopupRowKey, setCashPopupRowKey] = useState(null);
  const [cashPopupLabel, setCashPopupLabel] = useState("");
  const [cashPopupInitial, setCashPopupInitial] = useState("");
  const [cashPopupBreakdown, setCashPopupBreakdown] = useState([]);

  /* Save confirmation popup state */
  const [confirmPopupOpen, setConfirmPopupOpen] = useState(false);
  const [confirmPayload, setConfirmPayload] = useState(null);

  const [allTargets, setAllTargets] = useState([]);
  const [loadingAllTargets, setLoadingAllTargets] = useState(false);
  const [showAddTargetModal, setShowAddTargetModal] = useState(false);
  const [editTargetData, setEditTargetData] = useState(null);
  const [savingTarget, setSavingTarget] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // --- Fetch Targets ---
  const fetchAllTargets = useCallback(async () => {
    setLoadingAllTargets(true);
    try {
      const res = await axios.get(`${TARGET_API_BASE}/revenue-target`);
      const list = res.data?.targets || res.data?.data || [];
      const retailTargets = Array.isArray(list) ? list.filter(t => t.category === "retailPharmacy") : [];
      setAllTargets(retailTargets);
    } catch (err) {
      console.error("Fetch targets error:", err);
      setAllTargets([]);
    } finally {
      setLoadingAllTargets(false);
    }
  }, []);

  useEffect(() => { fetchAllTargets(); }, [fetchAllTargets]);

  // --- Save Targets ---
  const handleSaveTargets = async (payload) => {
    setSavingTarget(true);
    const { entries, fyStartYear } = payload;
    let savedCount = 0;
    let failedCount = 0;
    const errors = [];

    try {
      for (const entry of entries) {
        try {
          const existing = allTargets.find(
            (t) => Number(t.month) === entry.month && Number(t.year) === entry.year
          );

          if (existing && existing._id) {
            const res = await axios.put(`${TARGET_API_BASE}/update-revenue-target/${existing._id}`, {
              amount: entry.amount, footFall: entry.footFall,
            });
            if (res.data?.success) savedCount++; else { failedCount++; errors.push(res.data?.message); }
          } else {
            const res = await axios.post(`${TARGET_API_BASE}/save-revenue-target`, {
              month: entry.month, year: entry.year, amount: entry.amount, category: entry.category, categoryLabel: entry.categoryLabel, footFall: entry.footFall,
            });
            if (res.data?.success) savedCount++; else { failedCount++; errors.push(res.data?.message); }
          }
        } catch (err) {
          failedCount++;
          errors.push(err.response?.data?.message || err.message);
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

  // --- Fetch Analytics (Only Retail Pharmacy) ---
  const fetchAnalytics = useCallback(async () => {
    let queryFrom = fromDate;
    let queryTo = toDate;

    if (activePreset === "all") {
      queryFrom = "2020-01-01";
      queryTo = new Date().toISOString().split("T")[0];
    } else if (!fromDate || !toDate) return;

    setLoading(true);
    setError(null);
    try {
      const url = `${ANALYTICS_API_BASE}/revenue-analytics?from=${queryFrom}&to=${queryTo}`;
      const res = await axios.get(url);
      if (res.data?.success) {
        const raw = res.data;
        
        const rpFromBank = raw.bankCredit?.retailPharmacy || {};
        const rpFromCb = raw.categoryBreakdown?.retailPharmacy || {};
        
        const retailPharmacy = {
          total: Number(rpFromCb.total ?? rpFromBank.total) || 0,
          cash: Number(rpFromCb.cash ?? rpFromBank.cash) || 0,
          online: Number(rpFromCb.online ?? rpFromBank.online) || 0,
          due: Number(rpFromCb.due ?? rpFromBank.due) || 0,
          footFall: Number(rpFromCb.footFall ?? rpFromBank.footFall) || 0,
        };

        const rows = Array.isArray(raw.rows) ? raw.rows.map(r => {
          const rp = r.bankCredit?.retailPharmacy || {};
          return {
            date: r.date,
            label: r.label,
            year: r.year,
            month: r.month,
            retailPharmacy: {
              cash: Number(rp.cash) || 0,
              online: Number(rp.online) || 0,
              footFall: Number(rp.footFall) || 0,
              total: (Number(rp.cash) || 0) + (Number(rp.online) || 0),
            },
            bankCredit: r.bankCredit?.bankCredit != null ? Number(r.bankCredit.bankCredit) : null,
            cashDenominations: Array.isArray(r.bankCredit?.cashDenominations)
              ? r.bankCredit.cashDenominations
              : [],
          };
        }) : [];

        setData({ retailPharmacy, rows });

        setRetailInput({
          cash: retailPharmacy.cash ? String(retailPharmacy.cash) : "",
          online: retailPharmacy.online ? String(retailPharmacy.online) : "",
          footFall: retailPharmacy.footFall ? String(retailPharmacy.footFall) : "",
        });

        const nextRowInputs = {};
        rows.forEach((r) => {
          const hasExistingData = (r.retailPharmacy?.total > 0 || r.retailPharmacy?.footFall > 0);
          nextRowInputs[r.date] = {
            cash: r.retailPharmacy?.cash ? String(r.retailPharmacy.cash) : "",
            online: r.retailPharmacy?.online ? String(r.retailPharmacy.online) : "",
            footFall: r.retailPharmacy?.footFall ? String(r.retailPharmacy.footFall) : "",
            cashDenominations: r.cashDenominations || [],
            saved: hasExistingData,
          };
        });
        setRowInputs(nextRowInputs);

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
  }, [fromDate, toDate, activePreset]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  // --- Picker & Preset Logic ---
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
    else if (preset === "last7Days") { const past = new Date(nowD); past.setDate(nowD.getDate() - 6); setFromDate(fmtDate(past)); setToDate(fmtDate(nowD)); }
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

  // --- Range Calculations ---
  const rangeTargets = useMemo(() => {
    let total = 0, totalFF = 0, hasAny = false, daysCount = 0;
    if (!fromDate || !toDate) return { total, totalFF, hasAny, daysCount };

    const start = new Date(fromDate);
    const end = new Date(toDate);
    if (end < start) return { total, totalFF, hasAny, daysCount };

    const cur = new Date(start);
    while (cur <= end) {
      const y = cur.getFullYear();
      const m = cur.getMonth() + 1;
      const dim = getDaysInMonth(y, m);
      const monthTargets = allTargets.filter((t) => Number(t.year) === y && Number(t.month) === m);
      
      monthTargets.forEach((t) => {
        total += (Number(t.amount) || 0) / dim;
        totalFF += (Number(t.footFall) || 0) / dim;
        hasAny = true;
      });
      daysCount += 1;
      cur.setDate(cur.getDate() + 1);
    }
    return { total, totalFF, hasAny, daysCount };
  }, [fromDate, toDate, allTargets]);

  const rangeAchieved = useMemo(() => {
    if (!data || !data.rows) return { total: 0, totalFF: 0, cash: 0, online: 0, due: 0, hasData: false };
    
    const filtered = data.rows.filter(r => r.date >= fromDate && r.date <= toDate);
    
    let total = 0, totalFF = 0, cash = 0, online = 0, due = 0;
    filtered.forEach(r => {
      total += r.retailPharmacy?.total || 0;
      cash += r.retailPharmacy?.cash || 0;
      online += r.retailPharmacy?.online || 0;
      totalFF += r.retailPharmacy?.footFall || 0;
    });

    if (fromDate === toDate && activePreset === "today") {
      const c = Number(retailInput.cash) || 0;
      const o = Number(retailInput.online) || 0;
      const f = Number(retailInput.footFall) || 0;
      if (filtered.length === 0 && (c > 0 || o > 0 || f > 0)) {
         total = c + o; cash = c; online = o; totalFF = f;
      }
    }

    return { total, totalFF, cash, online, due, hasData: filtered.length > 0 || total > 0 };
  }, [data, fromDate, toDate, retailInput, activePreset]);

  const retailPharmacyLive = useMemo(() => {
    const cash = Number(retailInput.cash) || 0;
    const online = Number(retailInput.online) || 0;
    return { cash, online, due: 0, total: cash + online, footFall: Number(retailInput.footFall) || 0 };
  }, [retailInput]);

  const grandTotalLive = retailPharmacyLive;

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

  const presetOptions = [
    { v: "today", l: "Today" },
    { v: "yesterday", l: "Yesterday" },
    { v: "thisWeek", l: "This Week" },
    { v: "last7Days", l: "Last 7 Days" },
    { v: "thisMonth", l: "This Month" },
    { v: "lastMonth", l: "Last Month" },
    { v: "thisYear", l: "This Year" },
    { v: "all", l: "All" },
  ];

  /* ---------------------- Save flow with confirm ---------------------- */
  // Step 1: user clicks Save on a row → build payload → open confirmation
  const requestSaveRow = (rowKey, rowLabel) => {
    const ri = rowInputs[rowKey] || {};
    const rCash = Number(ri.cash) || 0;
    const rOnline = Number(ri.online) || 0;
    const rFoot = Number(ri.footFall) || 0;
    const rDenoms = Array.isArray(ri.cashDenominations) ? ri.cashDenominations : [];
    const rTotal = rCash + rOnline;

    setConfirmPayload({
      rowKey,
      rowLabel,
      cash: rCash,
      online: rOnline,
      footFall: rFoot,
      total: rTotal,
      cashDenominations: rDenoms,
    });
    setConfirmPopupOpen(true);
  };

  // Step 2: user confirms in popup → actual API save
  const doSaveRow = async () => {
    if (!confirmPayload) return;
    const { rowKey, cash: rCash, online: rOnline, footFall: rFoot, total: rTotal, cashDenominations: rDenoms } = confirmPayload;

    const existingRow = data?.rows?.find(r => r.date === rowKey);
    const existingBC = existingRow?.bankCredit != null ? Number(existingRow.bankCredit) : 0;

    let diff = 0;
    let diffStatus = "—";
    if (existingBC > 0) {
      diff = existingBC - rOnline;
      const absDiff = Math.abs(diff);
      if (absDiff < 0.5) diffStatus = "MATCHED";
      else if (diff > 0) diffStatus = "CREDIT MORE";
      else diffStatus = "CREDIT LESS";
    }

    setSavingRowKey(rowKey);
    try {
const res = await axios.post(`${ANALYTICS_API_BASE}/save-bank-credit`, {
  fromDate: rowKey,
  toDate: rowKey,
  rowKey,
  bankCredit: existingBC,
  grandTotal: rTotal,
  creditedDiff: diff,
  diffStatus,
  cashDenominations: rDenoms,
  savedBy: "Admin",
  retailPharmacy: { cash: rCash, online: rOnline, footFall: rFoot, total: rTotal },
});
      if (res.data?.success) {
        setRowInputs(p => ({ ...p, [rowKey]: { ...p[rowKey], saved: true } }));
        showToast("Row Saved!", "success");
        setConfirmPopupOpen(false);
        setConfirmPayload(null);
        fetchAnalytics();
      } else {
        showToast(res.data?.message || "Failed", "error");
      }
    } catch (err) {
      showToast("Failed to save", "error");
    } finally {
      setSavingRowKey(null);
    }
  };

  // ✅ SMART ROWS LOGIC: Generate Jan-Dec when This Year or All
  const displayRows = useMemo(() => {
    if (activePreset === "thisYear" || activePreset === "all") {
      const selectedYr = selectedYear || new Date().getFullYear();
      return Array.from({ length: 12 }).map((_, i) => {
        const m = i + 1;
        const monthStr = `${selectedYr}-${pad(m)}`;
        const existingRow = data?.rows?.find(r => r.date && r.date.startsWith(monthStr));
        
        return {
          date: existingRow ? existingRow.date : `${monthStr}-01`,
          label: `${MONTHS[i]} ${selectedYr}`,
          isMonthlyView: true,
          retailPharmacy: existingRow ? existingRow.retailPharmacy : { cash: 0, online: 0, footFall: 0, total: 0 },
        };
      });
    }
    return data?.rows || [];
  }, [data, activePreset, selectedYear]);

  /* ---------- Open Cash popup for a row ---------- */
  const openCashPopup = (rowKey, rowLabel) => {
    const ri = rowInputs[rowKey] || {};
    const existingRow = data?.rows?.find(r => r.date === rowKey);
    const initial = ri.cash !== undefined
      ? ri.cash
      : (existingRow?.retailPharmacy?.cash || "");
    const initialBreakdown = Array.isArray(ri.cashDenominations) && ri.cashDenominations.length > 0
      ? ri.cashDenominations
      : (Array.isArray(existingRow?.cashDenominations) ? existingRow.cashDenominations : []);

    setCashPopupRowKey(rowKey);
    setCashPopupLabel(rowLabel);
    setCashPopupInitial(initial !== "" ? String(initial) : "");
    setCashPopupBreakdown(initialBreakdown);
    setCashPopupOpen(true);
  };

  const handleCashPopupConfirm = (totalCash, breakdown = []) => {
    if (!cashPopupRowKey) return;
    setRowInputs((p) => ({
      ...p,
      [cashPopupRowKey]: {
        ...(p[cashPopupRowKey] || {}),
        cash: String(totalCash),
        cashDenominations: breakdown,
        saved: false,
      },
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-2 sm:p-3 lg:p-4">
      {toast && (
        <div className={`fixed top-5 right-5 z-[99999] flex items-center gap-3 px-4 py-2.5 rounded-lg shadow-lg text-white ${toast.type === "error" ? "bg-red-600" : "bg-emerald-600"}`}>
          {toast.type === "error" ? <FiXCircle className="w-4 h-4" /> : <FiCheckCircle className="w-4 h-4" />}
          <span className="font-medium text-xs">{toast.message}</span>
        </div>
      )}

      <AddRetailTargetModal
        isOpen={showAddTargetModal}
        onClose={() => { setShowAddTargetModal(false); setEditTargetData(null); }}
        onSave={handleSaveTargets}
        saving={savingTarget}
        editTarget={editTargetData}
      />

      <CashDenominationPopup
        isOpen={cashPopupOpen}
        onClose={() => { setCashPopupOpen(false); setCashPopupRowKey(null); setCashPopupLabel(""); }}
        onConfirm={handleCashPopupConfirm}
        initialAmount={cashPopupInitial}
        initialBreakdown={cashPopupBreakdown}
        rowLabel={cashPopupLabel}
      />

      <SaveConfirmPopup
        isOpen={confirmPopupOpen}
        onClose={() => { if (!savingRowKey) { setConfirmPopupOpen(false); setConfirmPayload(null); } }}
        onConfirm={doSaveRow}
        saving={!!savingRowKey}
        rowLabel={confirmPayload?.rowLabel}
        payload={confirmPayload}
      />

      <div className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-3 bg-white border border-slate-200 rounded-lg px-3 py-2.5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <FaPills className="w-4 h-4 text-amber-600" />
              <h1 className="text-sm font-bold text-slate-900 whitespace-nowrap">Retail Pharmacy</h1>
            </div>
            <span className="text-xs font-extrabold text-amber-700 uppercase tracking-wider border-l border-slate-200 pl-3">
              {activePreset === "all" ? "All Time Data" : (fromDate && toDate ? `${formatDateToDDMMYYYY(fromDate)} – ${formatDateToDDMMYYYY(toDate)}` : "—")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 bg-amber-50 p-0.5 rounded-md border border-amber-100">
              {presetOptions.map((p) => (
                <button key={p.v} onClick={() => setPreset(p.v)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded transition-all whitespace-nowrap ${activePreset === p.v ? "bg-amber-600 text-white shadow-sm" : "text-amber-700 hover:bg-white"}`} type="button">
                  {p.l}
                </button>
              ))}
            </div>
            
            <div className="relative ra-month-trigger">
              <button onClick={handleMonthPickerClick}
                className="flex items-center gap-2 h-8 px-3 text-[11px] font-bold text-white bg-amber-600 border border-amber-600 rounded-md hover:bg-amber-700 whitespace-nowrap shadow-sm" type="button">
                <span>{MONTHS[selectedMonth - 1]}, {selectedYear}</span>
                <FaCalendarAlt className="w-3 h-3" />
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
            
            <button type="button" onClick={() => { setEditTargetData(null); setShowAddTargetModal(true); }}
              className="flex items-center gap-1.5 h-8 px-3 text-[11px] font-bold text-white bg-amber-700 rounded-md hover:bg-amber-800 whitespace-nowrap shadow-sm">
              <FiTarget className="w-3 h-3" /> Set Target
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-3 py-2 mb-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs font-medium">
            <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
            <button onClick={fetchAnalytics} type="button" className="ml-auto px-2.5 py-1 text-[10px] font-bold text-red-700 bg-red-100 border border-red-200 rounded hover:bg-red-200">Retry</button>
          </div>
        )}

        {loading && !data && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <FiRefreshCw className="w-6 h-6 text-amber-500 animate-spin mb-2" />
            <p className="text-xs m-0 font-medium">Loading retail pharmacy data...</p>
          </div>
        )}

        {data && !loading && (
          <>
            {/* Top Summary Card */}
            <div className="max-w-md mb-4">
              <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-8 h-8 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center text-sm flex-shrink-0">
                    <FaPills />
                  </span>
                  <div className="text-[12px] font-black uppercase tracking-wider text-slate-700">Retail Pharmacy</div>
                </div>
                
                <div className="space-y-1 mb-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black text-slate-800 uppercase tracking-wide">TOTAL:</span>
                    <span className="text-[14px] font-black flex items-center gap-1 text-rose-600">
                      <FaArrowDown className="w-3.5 h-3.5 rotate-45" />
                      {fmtAmt(rangeAchieved.total)} / {fmtAmt(rangeTargets.total)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black text-slate-800 uppercase tracking-wide">FOOTFALL:</span>
                    <span className="text-[14px] font-black text-slate-900">{Math.round(rangeAchieved.totalFF)}</span>
                  </div>
                </div>

                <div className="space-y-1 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1.5 text-slate-600 font-bold"><FaMoneyBillWave className="w-2.5 h-2.5 text-emerald-600" /> Cash</span>
                    <span className="font-black text-emerald-600">{fmtAmt(rangeAchieved.cash)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1.5 text-slate-600 font-bold"><FaGlobe className="w-2.5 h-2.5 text-sky-600" /> Online</span>
                    <span className="font-black text-sky-600">{fmtAmt(rangeAchieved.online)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1.5 text-slate-600 font-bold"><FaTimesCircle className="w-2.5 h-2.5 text-rose-600" /> Due</span>
                    <span className="font-black text-rose-600">{fmtAmt(rangeAchieved.due)}</span>
                  </div>
                </div>

                {rangeTargets.total > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200/70">
                    <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wide mb-1.5">
                      <span className="text-slate-500">{rangeLabel}</span>
                      <span className="text-rose-700">SHORTFALL</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[11px] font-black text-slate-800">
                        {fmtAmt(rangeAchieved.total)} / {fmtAmt(rangeTargets.total)}
                      </span>
                      <span className="text-[10px] font-black text-rose-700">
                        -{((100 - (rangeAchieved.total / rangeTargets.total) * 100)).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full h-1 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full bg-rose-500 transition-all" style={{ width: `${Math.min(100, (rangeAchieved.total / rangeTargets.total) * 100)}%` }} />
                    </div>
                    {rangeAchieved.total < rangeTargets.total && (
                      <div className="text-[9px] font-bold mt-1 text-rose-700">
                        −{fmtAmt(rangeTargets.total - rangeAchieved.total)} short (-{((100 - (rangeAchieved.total / rangeTargets.total) * 100)).toFixed(0)}%)
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Table: Manual Entry Day-wise */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm mt-4">
              <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-3 py-2 flex items-center justify-between">
                <h2 className="text-sm font-bold text-white m-0 flex items-center gap-2">
                  <FaCalendarAlt /> Retail Pharmacy Daily Entry
                </h2>
              </div>
              <div className="overflow-x-auto p-4">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 bg-slate-100 border text-slate-700 font-bold uppercase tracking-wider text-[10px]">Date</th>
                      <th className="px-3 py-2 bg-emerald-50 border text-emerald-700 font-bold uppercase tracking-wider text-[10px]">Cash</th>
                      <th className="px-3 py-2 bg-sky-50 border text-sky-700 font-bold uppercase tracking-wider text-[10px]">Online</th>
                      <th className="px-3 py-2 bg-indigo-50 border text-indigo-700 font-bold uppercase tracking-wider text-[10px]">Total</th>
                      <th className="px-3 py-2 bg-violet-50 border text-violet-700 font-bold uppercase tracking-wider text-[10px]">FootFall</th>
                      <th className="px-3 py-2 bg-slate-100 border text-slate-700 font-bold uppercase tracking-wider text-[10px]">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayRows.map((r, idx) => {
                      const rowKey = r.date;
                      const ri = rowInputs[rowKey] || {};
                      
                      const rC = ri.cash !== undefined ? (Number(ri.cash) || 0) : (r.retailPharmacy?.cash || 0);
                      const rO = ri.online !== undefined ? (Number(ri.online) || 0) : (r.retailPharmacy?.online || 0);
                      const rF = ri.footFall !== undefined ? (Number(ri.footFall) || 0) : (r.retailPharmacy?.footFall || 0);
                      const tot = rC + rO;

                      const isSaved = ri.saved === true;
                      const rowLabel = r.isMonthlyView ? r.label : formatDateToDDMMYYYY(r.date);

                      return (
                        <tr key={rowKey || idx} className="hover:bg-slate-50 border-b">
                          <td className="px-3 py-2 text-center font-bold text-slate-700 border">
                            {rowLabel}
                          </td>
                          <td className="px-1 py-1 border bg-emerald-50/20">
                             <input
                               type="number"
                               disabled={isSaved}
                               value={ri.cash !== undefined ? ri.cash : (r.retailPharmacy?.cash || "")}
                               onChange={e => setRowInputs(p => ({...p, [rowKey]: {...p[rowKey], cash: e.target.value, saved: false}}))}
                               onFocus={() => { if (!isSaved) openCashPopup(rowKey, rowLabel); }}
                               className={`w-full text-center text-xs font-bold border rounded px-1 py-1 ${isSaved ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed" : "border-emerald-300 bg-white cursor-pointer"}`}
                               placeholder="0" />
                          </td>
                          <td className="px-1 py-1 border bg-sky-50/20">
                             <input type="number" 
                               disabled={isSaved}
                               value={ri.online !== undefined ? ri.online : (r.retailPharmacy?.online || "")} 
                               onChange={e => setRowInputs(p => ({...p, [rowKey]: {...p[rowKey], online: e.target.value, saved: false}}))} 
                               className={`w-full text-center text-xs font-bold border rounded px-1 py-1 ${isSaved ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed" : "border-sky-300 bg-white"}`} placeholder="0" />
                          </td>
                          <td className="px-3 py-2 text-center font-black text-indigo-700 border bg-indigo-50/30">{fmt(tot)}</td>
                          <td className="px-1 py-1 border bg-violet-50/20">
                             <input type="number" 
                               disabled={isSaved}
                               value={ri.footFall !== undefined ? ri.footFall : (r.retailPharmacy?.footFall || "")} 
                               onChange={e => setRowInputs(p => ({...p, [rowKey]: {...p[rowKey], footFall: e.target.value, saved: false}}))} 
                               className={`w-full text-center text-xs font-bold border rounded px-1 py-1 ${isSaved ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed" : "border-violet-300 bg-white"}`} placeholder="0" />
                          </td>
                          <td className="px-2 py-1 border text-center">
                            {isSaved ? (
                              <button disabled className="px-3 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold flex items-center justify-center gap-1 w-full shadow-sm cursor-not-allowed opacity-90">
                                <FaCheckCircle className="w-3 h-3" /> Saved
                              </button>
                            ) : (
                              <button onClick={() => requestSaveRow(rowKey, rowLabel)} disabled={savingRowKey === rowKey}
                                className="px-3 py-1 bg-amber-600 text-white rounded text-[10px] font-bold hover:bg-amber-700 disabled:opacity-50 w-full shadow-sm">
                                 {savingRowKey === rowKey ? "Saving..." : "Save"}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {(!displayRows || displayRows.length === 0) && (
                      <tr>
                        <td colSpan={6} className="text-center py-6 text-slate-400 font-medium">No data available for this period. Enter data above.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}