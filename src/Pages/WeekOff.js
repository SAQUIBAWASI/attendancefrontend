import axios from 'axios';
import { useEffect, useState, useRef, useMemo } from 'react';
import {
  FaCalendarTimes,
  FaSearch,
  FaTimes,
  FaPlus,
  FaCheck,
  FaTrash,
  FaTable,
  FaThLarge,
  FaBuilding,
  FaCalendarAlt,
  FaChevronUp,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaUsers,
  FaInfoCircle,
  FaExpandAlt
} from 'react-icons/fa';
import {
  FiCalendar,
  FiUsers,
  FiRepeat,
  FiGrid,
  FiFilter,
  FiTrash2,
  FiClock,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';
import { API_BASE_URL } from '../config';
import { isEmployeeHidden } from '../utils/employeeStatus';
import "../index.css";
import "./EmployeeDashboard.css";
import "./EmployeeLeaves.css";

const BASE_URL = API_BASE_URL.replace(/\/api$/, "");

const WEEK_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WEEK_NUMBERS = [1, 2, 3, 4, 5];

// Helper to compute calendar grid for a given YYYY-MM string
const getMonthCalendarDays = (monthStr) => {
  if (!monthStr) {
    const now = new Date();
    monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
  const [year, month] = monthStr.split('-').map(Number);
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay(); // 0 = Sun .. 6 = Sat
  const daysInMonth = new Date(year, month, 0).getDate();

  const blanks = Array.from({ length: firstDayOfWeek }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayOfWeek = new Date(year, month - 1, day).getDay();
    return { day, dateStr, dayOfWeek };
  });

  return { blanks, days, daysInMonth, year, month };
};

// =========================================================================
// MINI MONTH CALENDAR COMPONENT (Embedded in Table, Cards & Modal)
// =========================================================================
const MiniMonthCalendar = ({
  monthStr,
  calculatedDates = [],
  specificDates = [],
  onEnlarge = null,
  showTitle = true,
  interactive = true,
  isInactiveMonth = false
}) => {
  const { blanks, days, year, month } = useMemo(() => getMonthCalendarDays(monthStr), [monthStr]);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthLabel = `${monthNames[month - 1]} ${year}`;

  const offCount = calculatedDates.length;

  return (
    <div className={`inline-block p-2 bg-white rounded-xl border shadow-2xs w-full max-w-[210px] ${
      isInactiveMonth ? 'border-amber-200 bg-amber-50/20 opacity-80' : 'border-slate-200'
    }`}>
      {showTitle && (
        <div className="flex items-center justify-between gap-1 mb-1.5 pb-1 border-b border-slate-100">
          <div className="flex items-center gap-1">
            <FaCalendarAlt className={`text-[10px] ${isInactiveMonth ? 'text-amber-500' : 'text-indigo-500'}`} />
            <span className="text-[11px] font-bold text-slate-800">{monthLabel}</span>
          </div>
          <div className="flex items-center gap-1">
            {isInactiveMonth ? (
              <span className="px-1.5 py-0.2 text-[9px] font-bold text-amber-700 bg-amber-100 rounded-full border border-amber-200">
                Inactive
              </span>
            ) : (
              <span className="px-1.5 py-0.2 text-[9px] font-bold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200">
                {offCount} Off
              </span>
            )}
            {onEnlarge && (
              <button
                type="button"
                onClick={onEnlarge}
                className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                title="Enlarge Calendar"
              >
                <FaExpandAlt className="text-[9px]" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Weekday initials: S M T W T F S */}
      <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-bold text-slate-400 mb-1">
        <span className="text-rose-500 font-extrabold">Su</span>
        <span>Mo</span>
        <span>Tu</span>
        <span>We</span>
        <span>Th</span>
        <span>Fr</span>
        <span className="text-indigo-500 font-extrabold">Sa</span>
      </div>

      {/* Day Cells Grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {blanks.map((_, i) => (
          <div key={`b-${i}`} className="w-5 h-5" />
        ))}
        {days.map((d) => {
          const isOff = calculatedDates.includes(d.dateStr);
          const isSpecific = specificDates.includes(d.dateStr);

          let cellClass = "text-slate-600 hover:bg-slate-100";
          if (isOff) {
            cellClass = "bg-emerald-600 text-white font-bold shadow-xs scale-105";
          } else if (isSpecific) {
            cellClass = "bg-amber-500 text-white font-bold shadow-xs scale-105";
          } else if (d.dayOfWeek === 0) {
            cellClass = "text-rose-500 font-medium hover:bg-rose-50";
          }

          return (
            <div
              key={d.day}
              onClick={interactive && onEnlarge ? onEnlarge : undefined}
              className={`w-5 h-5 mx-auto flex items-center justify-center rounded-full text-[10px] transition-all cursor-pointer ${cellClass}`}
              title={
                isOff
                  ? `Week-Off: ${d.dateStr} (${WEEK_DAYS[d.dayOfWeek]})`
                  : isSpecific
                  ? `Additional Off: ${d.dateStr}`
                  : `${d.dateStr} (${WEEK_DAYS[d.dayOfWeek]})`
              }
            >
              {d.day}
            </div>
          );
        })}
      </div>

      {/* Mini Legend Footer */}
      <div className="mt-1.5 pt-1 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-500">
        {isInactiveMonth ? (
          <span className="text-[9px] text-amber-700 font-medium italic">
            Not active in this month
          </span>
        ) : (
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
            <span className="font-semibold text-emerald-800">Week-Off</span>
          </div>
        )}
        {onEnlarge && (
          <button
            type="button"
            onClick={onEnlarge}
            className="text-indigo-600 hover:text-indigo-800 font-semibold hover:underline"
          >
            View
          </button>
        )}
      </div>
    </div>
  );
};

// =========================================================================
// TABLE RECORD CALENDAR CELL (Renders Month Tabs for Selected Months Only)
// =========================================================================
const RecordCalendarCell = ({ record, filterMonth, calculateDatesFn, onEnlarge, formatMonthLabel }) => {
  const hasSpecificMonths = Array.isArray(record.selectedMonths) && record.selectedMonths.length > 0;

  // Decide initial active month for this row's calendar:
  // 1. If filterMonth is set and is one of the record's selected months, show filterMonth.
  // 2. If record has specific months, show record.selectedMonths[0].
  // 3. Otherwise show filterMonth or current month.
  const defaultMonth = useMemo(() => {
    if (hasSpecificMonths) {
      if (filterMonth && record.selectedMonths.includes(filterMonth)) {
        return filterMonth;
      }
      return record.selectedMonths[0];
    }
    return filterMonth || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  }, [record, filterMonth, hasSpecificMonths]);

  const [activeMonth, setActiveMonth] = useState(defaultMonth);

  // Sync if filterMonth changes and matches
  useEffect(() => {
    if (hasSpecificMonths && filterMonth && record.selectedMonths.includes(filterMonth)) {
      setActiveMonth(filterMonth);
    } else if (hasSpecificMonths && !record.selectedMonths.includes(activeMonth)) {
      setActiveMonth(record.selectedMonths[0]);
    }
  }, [filterMonth, hasSpecificMonths, record.selectedMonths]);

  const calculatedDates = useMemo(() => {
    return calculateDatesFn(record, activeMonth);
  }, [record, activeMonth, calculateDatesFn]);

  const isInactive = hasSpecificMonths && !record.selectedMonths.includes(activeMonth);

  return (
    <div className="flex flex-col items-center justify-center py-1">
      {/* If record has multiple selected months, show 1-click month tabs */}
      {hasSpecificMonths && record.selectedMonths.length > 1 && (
        <div className="flex flex-wrap gap-1 mb-1.5 justify-center max-w-[210px]">
          {record.selectedMonths.map(m => (
            <button
              key={m}
              type="button"
              onClick={() => setActiveMonth(m)}
              className={`px-1.5 py-0.5 text-[9px] font-bold rounded-md transition-all ${
                activeMonth === m
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
              title={`Switch calendar to ${formatMonthLabel(m)}`}
            >
              {formatMonthLabel(m)}
            </button>
          ))}
        </div>
      )}

      {/* If record has exactly 1 specific selected month */}
      {hasSpecificMonths && record.selectedMonths.length === 1 && (
        <div className="mb-1 text-center">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-purple-800 bg-purple-50 border border-purple-200 rounded-full">
            <span>🎯</span>
            <span>Only for {formatMonthLabel(record.selectedMonths[0])}</span>
          </span>
        </div>
      )}

      {/* Mini Calendar Widget */}
      <MiniMonthCalendar
        monthStr={activeMonth}
        calculatedDates={calculatedDates}
        specificDates={record.specificDates || []}
        onEnlarge={() => onEnlarge(record, activeMonth)}
        showTitle={true}
        interactive={true}
        isInactiveMonth={isInactive}
      />
    </div>
  );
};

// =========================================================================
// FULL INTERACTIVE CALENDAR MODAL
// =========================================================================
const FullCalendarModal = ({ record, initialMonth, onClose, calculateDatesFn, formatMonthLabel }) => {
  const hasSpecificMonths = Array.isArray(record.selectedMonths) && record.selectedMonths.length > 0;

  const defaultMonth = useMemo(() => {
    if (initialMonth) return initialMonth;
    if (hasSpecificMonths) return record.selectedMonths[0];
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }, [initialMonth, hasSpecificMonths, record]);

  const [currentMonth, setCurrentMonth] = useState(defaultMonth);

  const { blanks, days, year, month } = useMemo(
    () => getMonthCalendarDays(currentMonth),
    [currentMonth]
  );
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthLabel = `${monthNames[month - 1]} ${year}`;

  const isCurrentMonthActive = !hasSpecificMonths || record.selectedMonths.includes(currentMonth);

  const calculatedDates = useMemo(() => {
    return calculateDatesFn(record, currentMonth);
  }, [record, currentMonth, calculateDatesFn]);

  const specificDates = record.specificDates || [];

  // Month navigation helpers
  const handlePrevMonth = () => {
    const [y, m] = currentMonth.split('-').map(Number);
    const newDate = new Date(y, m - 2, 1);
    setCurrentMonth(
      `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`
    );
  };

  const handleNextMonth = () => {
    const [y, m] = currentMonth.split('-').map(Number);
    const newDate = new Date(y, m, 1);
    setCurrentMonth(
      `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`
    );
  };

  const isWeekly = (record.selectionMode || 'weekly') === 'weekly';

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:px-6 sm:py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50/90 via-purple-50/40 to-blue-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
              <FaCalendarAlt className="text-lg" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 leading-tight">
                Week-Off Calendar View
              </h3>
              <p className="text-xs text-gray-500">
                {record.selectAllEmployees
                  ? '🌟 All Company Employees'
                  : `${record.selectedEmployees?.length || 0} Assigned Employees`}
                {' • '}
                <span className="font-semibold text-indigo-700 capitalize">
                  {isWeekly ? 'Weekly Pattern' : 'Week-wise Pattern'}
                </span>
                {hasSpecificMonths ? (
                  <span className="ml-1.5 font-bold text-purple-700">
                    (Selected Months: {record.selectedMonths.map(m => formatMonthLabel(m)).join(', ')})
                  </span>
                ) : (
                  <span className="ml-1.5 font-bold text-slate-500">(All Months Ongoing)</span>
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-red-50 hover:text-red-600 text-gray-400 border border-gray-200 transition-colors shadow-2xs"
            aria-label="Close"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        {/* Selected Months Quick-Jump Row (If restricted to specific months) */}
        {hasSpecificMonths && (
          <div className="px-4 sm:px-6 py-2 bg-purple-50/70 border-b border-purple-100 flex items-center justify-between flex-wrap gap-2 text-xs">
            <span className="font-bold text-purple-900 flex items-center gap-1.5">
              <span>🎯 Configured Only For:</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {record.selectedMonths.map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setCurrentMonth(m)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    currentMonth === m
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'bg-white text-purple-700 border border-purple-200 hover:bg-purple-100'
                  }`}
                >
                  {formatMonthLabel(m)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Month Navigation & Legend Bar */}
        <div className="px-4 sm:px-6 py-3 border-b border-gray-200 bg-gray-50/70 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Previous / Next Month Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 shadow-2xs transition-colors"
              title="Previous Month"
            >
              <FaChevronLeft className="text-xs" />
            </button>
            <span className="text-sm font-bold text-gray-900 min-w-[140px] text-center">
              {monthLabel}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 shadow-2xs transition-colors"
              title="Next Month"
            >
              <FaChevronRight className="text-xs" />
            </button>
          </div>

          {/* Color Legend */}
          <div className="flex items-center gap-3 text-xs font-semibold">
            {isCurrentMonthActive ? (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block shadow-xs" />
                <span className="text-emerald-900">
                  Week Off ({calculatedDates.length})
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block shadow-xs" />
                <span className="text-amber-800 font-bold">Inactive Month (0 Off)</span>
              </div>
            )}
            {specificDates.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block shadow-xs" />
                <span className="text-amber-900">Additional Off</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-slate-200 inline-block border border-slate-300" />
              <span className="text-slate-500">Working Day</span>
            </div>
          </div>
        </div>

        {/* Big Calendar Grid Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Inactive Month Banner */}
          {!isCurrentMonthActive && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <FiAlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>
                  <strong>No Week-Offs in {monthLabel}:</strong> This policy was created <strong>only for {record.selectedMonths.map(m => formatMonthLabel(m)).join(', ')}</strong>.
                </span>
              </div>
              {record.selectedMonths.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCurrentMonth(record.selectedMonths[0])}
                  className="px-2.5 py-1 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors shadow-2xs"
                >
                  Jump to {formatMonthLabel(record.selectedMonths[0])} →
                </button>
              )}
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 text-center bg-slate-100 border-b border-gray-200 text-xs font-bold py-2.5">
              <div className="text-rose-600">Sunday</div>
              <div className="text-slate-700">Monday</div>
              <div className="text-slate-700">Tuesday</div>
              <div className="text-slate-700">Wednesday</div>
              <div className="text-slate-700">Thursday</div>
              <div className="text-slate-700">Friday</div>
              <div className="text-indigo-600">Saturday</div>
            </div>

            {/* Day Slots */}
            <div className="grid grid-cols-7 divide-x divide-y divide-gray-100 text-center">
              {blanks.map((_, i) => (
                <div
                  key={`blank-${i}`}
                  className="min-h-[55px] sm:min-h-[70px] bg-slate-50/50 p-1.5"
                />
              ))}

              {days.map((d) => {
                const isOff = calculatedDates.includes(d.dateStr);
                const isSpecific = specificDates.includes(d.dateStr);

                return (
                  <div
                    key={d.day}
                    className={`min-h-[55px] sm:min-h-[70px] p-1.5 flex flex-col justify-between transition-colors relative ${
                      isOff
                        ? 'bg-emerald-50/80 border-2 border-emerald-500 rounded-lg m-0.5 shadow-xs'
                        : isSpecific
                        ? 'bg-amber-50/80 border-2 border-amber-500 rounded-lg m-0.5 shadow-xs'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs sm:text-sm font-bold ${
                          isOff
                            ? 'text-emerald-800'
                            : isSpecific
                            ? 'text-amber-800'
                            : d.dayOfWeek === 0
                            ? 'text-rose-500'
                            : 'text-slate-700'
                        }`}
                      >
                        {d.day}
                      </span>
                      {isOff && (
                        <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                      )}
                      {isSpecific && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      )}
                    </div>

                    {isOff && (
                      <div className="mt-1">
                        <span className="inline-block px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold bg-emerald-600 text-white rounded shadow-2xs whitespace-nowrap">
                          🌿 Week Off
                        </span>
                      </div>
                    )}

                    {isSpecific && !isOff && (
                      <div className="mt-1">
                        <span className="inline-block px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold bg-amber-500 text-white rounded shadow-2xs whitespace-nowrap">
                          🎯 Extra Off
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Off Dates Summary List */}
          {isCurrentMonthActive ? (
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-900 mb-2">
                <span className="flex items-center gap-1.5">
                  <FiCheckCircle className="text-emerald-600" />
                  <span>
                    Total Week-Off Days in {monthLabel}:{' '}
                    <strong className="text-emerald-700 font-extrabold">
                      {calculatedDates.length} Days
                    </strong>
                  </span>
                </span>
              </div>
              {calculatedDates.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {calculatedDates.map((dateStr) => {
                    const d = new Date(dateStr + 'T00:00:00');
                    const dayName = WEEK_DAYS[d.getDay()];
                    return (
                      <span
                        key={dateStr}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-white text-emerald-800 border border-emerald-300 rounded-lg shadow-2xs"
                      >
                        <span>{dateStr.slice(8, 10)} {monthNames[month - 1].slice(0, 3)}</span>
                        <span className="text-[10px] text-emerald-600 font-normal">({dayName})</span>
                      </span>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-gray-500">
                  No week-off dates calculated for this month.
                </p>
              )}
            </div>
          ) : (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-center text-xs text-gray-500">
              This month has no week-offs configured because the policy only targets {record.selectedMonths.map(m => formatMonthLabel(m)).join(', ')}.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors shadow-2xs"
          >
            Close Calendar
          </button>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// MAIN WEEK OFF COMPONENT
// =========================================================================
export default function WeekOff() {
  const [allEmployees, setAllEmployees] = useState([]);
  const [weekOffRecords, setWeekOffRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // View mode: 'table' or 'grid'
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('weekOff_viewMode') || 'table';
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'weekly', 'weekwise'
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [showDepartmentFilter, setShowDepartmentFilter] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const departmentFilterRef = useRef(null);

  // Large Calendar Modal state
  const [activeCalendarModal, setActiveCalendarModal] = useState({
    isOpen: false,
    record: null,
    month: ''
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    const saved = localStorage.getItem('weekOff_itemsPerPage');
    return saved ? parseInt(saved, 10) : 10;
  });

  // Modal states
  const [showWeekOffModal, setShowWeekOffModal] = useState(false);
  const [weekOffSubmitting, setWeekOffSubmitting] = useState(false);
  const [modalActiveTab, setModalActiveTab] = useState(1); // 1: Audience, 2: Pattern, 3: Overrides/Months
  const [weekOffDateInput, setWeekOffDateInput] = useState('');
  const [weekOffEmpSearch, setWeekOffEmpSearch] = useState('');
  const [modalDepartmentFilter, setModalDepartmentFilter] = useState('');

  const [weekOffForm, setWeekOffForm] = useState({
    selectedEmployees: [],
    weekOffDays: ['Sunday'],
    specificDates: [],
    selectAllEmployees: false,
    selectedMonths: [],
    selectionMode: 'weekly', // 'weekly', 'weekwise'
    weekwiseSelection: [], // Array of { week: 1-5, day: 'Sunday'-'Saturday' }
    monthlyPattern: []
  });

  // Save view mode & items per page preference
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('weekOff_viewMode', mode);
  };

  const handleItemsPerPageChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setItemsPerPage(val);
    setCurrentPage(1);
    localStorage.setItem('weekOff_itemsPerPage', val);
  };

  // Close department dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (departmentFilterRef.current && !departmentFilterRef.current.contains(event.target)) {
        setShowDepartmentFilter(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-hide alert banners
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 6000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Fetch initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchEmployees(), fetchWeekOffRecords()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/employees/get-employees`);
      if (Array.isArray(res.data)) {
        setAllEmployees(res.data);
      }
    } catch (e) {
      console.error('Error fetching employees:', e);
    }
  };

  const fetchWeekOffRecords = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/shifts/week-off`);
      if (res.data.success) {
        setWeekOffRecords(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch week-off records:', err);
    }
  };

  const handleDeleteWeekOff = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this week-off policy?')) return;
    try {
      const response = await axios.delete(`${API_BASE_URL}/shifts/week-off/${recordId}`);
      if (response.data.success) {
        setSuccess('Week-off policy deleted successfully.');
        fetchWeekOffRecords();
      } else {
        setError(response.data.message || 'Failed to delete record.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete week-off record.');
    }
  };

  // Helper to get employee details
  const employeeMap = useMemo(() => {
    const map = new Map();
    allEmployees.forEach(emp => {
      const id = String(emp.employeeId || emp._id);
      map.set(id, emp);
      if (emp._id) map.set(String(emp._id), emp);
    });
    return map;
  }, [allEmployees]);

  const getEmployeeDetails = (empId) => {
    const emp = employeeMap.get(String(empId));
    if (!emp) return { name: 'Employee', department: '-', designation: '-', profilePicture: null };

    let pictureUrl = null;
    if (emp.profilePicture) {
      pictureUrl = emp.profilePicture.startsWith('http')
        ? emp.profilePicture
        : `${BASE_URL}/${emp.profilePicture.replace(/^\//, '')}`;
    }

    return {
      name: emp.name || emp.employeeName || 'Unknown',
      department: emp.department || '-',
      designation: emp.designation || '-',
      profilePicture: pictureUrl
    };
  };

  // Unique departments for filter dropdown
  const uniqueDepartments = useMemo(() => {
    const depts = new Set();
    allEmployees.forEach(emp => {
      if (emp.department) depts.add(emp.department);
    });
    return Array.from(depts).sort();
  }, [allEmployees]);

  // Format month helper: "2026-09" => "Sep 2026"
  const formatMonthLabel = (monthValue) => {
    if (!monthValue) return '';
    try {
      const [year, month] = monthValue.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${monthNames[parseInt(month, 10) - 1]} ${year}`;
    } catch {
      return monthValue;
    }
  };

  // Format date helper: "2026-09-15" => "15 Sep 2026"
  const formatDateLabel = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00'));
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // =========================================================================
  // CORE CALCULATION: Strictly scopes week-offs to selected months only!
  // =========================================================================
  const calculateDatesFromPattern = (record, targetMonth = null) => {
    if (!record) return [];

    const hasSpecificMonths = Array.isArray(record.selectedMonths) && record.selectedMonths.length > 0;

    // If targetMonth is passed, and record has specific selectedMonths:
    // If targetMonth is NOT one of the selectedMonths, it MUST NOT have any pattern week-offs!
    if (targetMonth && hasSpecificMonths && !record.selectedMonths.includes(targetMonth)) {
      // Check if there are manual specificDates matching this month
      if (Array.isArray(record.specificDates)) {
        return record.specificDates.filter(d => d.startsWith(targetMonth));
      }
      return [];
    }

    const calculatedDates = [];
    const dayMap = { 'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6 };

    let monthsToProcess = [];
    if (targetMonth) {
      monthsToProcess = [targetMonth];
    } else if (hasSpecificMonths) {
      monthsToProcess = record.selectedMonths;
    } else {
      const now = new Date();
      monthsToProcess = [`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`];
    }

    // Weekly pattern
    if ((record.selectionMode === 'weekly' || !record.selectionMode) && record.weekOffDays && record.weekOffDays.length > 0) {
      monthsToProcess.forEach(monthVal => {
        if (hasSpecificMonths && !record.selectedMonths.includes(monthVal)) return;

        const [year, month] = monthVal.split('-').map(Number);
        const daysInMonth = new Date(year, month, 0).getDate();

        record.weekOffDays.forEach(dayName => {
          const fullDay = dayName.length === 3
            ? WEEK_DAYS.find(d => d.startsWith(dayName))
            : dayName;
          const targetDay = dayMap[fullDay];
          if (targetDay !== undefined) {
            for (let day = 1; day <= daysInMonth; day++) {
              const date = new Date(year, month - 1, day);
              if (date.getDay() === targetDay) {
                calculatedDates.push(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
              }
            }
          }
        });
      });
    }

    // Week-wise pattern
    if (record.selectionMode === 'weekwise' && record.weekwiseSelection && record.weekwiseSelection.length > 0) {
      monthsToProcess.forEach(monthVal => {
        if (hasSpecificMonths && !record.selectedMonths.includes(monthVal)) return;

        const [year, month] = monthVal.split('-').map(Number);
        const daysInMonth = new Date(year, month, 0).getDate();

        record.weekwiseSelection.forEach(({ week, day }) => {
          const fullDay = day.length === 3
            ? WEEK_DAYS.find(d => d.startsWith(day))
            : day;
          const targetDay = dayMap[fullDay];
          if (targetDay !== undefined) {
            const firstDayOfMonth = new Date(year, month - 1, 1);
            const firstDayOffset = (targetDay - firstDayOfMonth.getDay() + 7) % 7;
            const targetDate = 1 + firstDayOffset + (week - 1) * 7;
            if (targetDate <= daysInMonth && targetDate > 0) {
              calculatedDates.push(`${year}-${String(month).padStart(2, '0')}-${String(targetDate).padStart(2, '0')}`);
            }
          }
        });
      });
    }

    // Also include manual specificDates if they fall in the processed months
    if (Array.isArray(record.specificDates) && record.specificDates.length > 0) {
      record.specificDates.forEach(dateStr => {
        const dateMonth = dateStr.slice(0, 7);
        if (monthsToProcess.includes(dateMonth)) {
          calculatedDates.push(dateStr);
        }
      });
    }

    return Array.from(new Set(calculatedDates)).sort();
  };

  // Filter records based on search, department, pattern mode
  const filteredRecords = useMemo(() => {
    return weekOffRecords.filter(rec => {
      // 1. Pattern Mode filter
      if (filterMode !== 'all') {
        const recMode = rec.selectionMode || 'weekly';
        if (recMode !== filterMode) return false;
      }

      // 2. Department filter
      if (filterDepartment) {
        if (!rec.selectAllEmployees) {
          const hasEmployeeInDept = rec.selectedEmployees?.some(e => {
            const info = getEmployeeDetails(e.employeeId);
            return info.department === filterDepartment;
          });
          if (!hasEmployeeInDept) return false;
        }
      }

      // 3. Search query
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchesScope = rec.selectAllEmployees && 'all company employees'.includes(query);
        const matchesEmp = rec.selectedEmployees?.some(e => {
          const name = (e.employeeName || '').toLowerCase();
          const id = (e.employeeId || '').toLowerCase();
          return name.includes(query) || id.includes(query);
        });
        const matchesPatternDays = (rec.weekOffDays || []).some(d => d.toLowerCase().includes(query));
        const matchesWeekwise = (rec.weekwiseSelection || []).some(item =>
          `week ${item.week} ${item.day}`.toLowerCase().includes(query)
        );
        const matchesMode = (rec.selectionMode || 'weekly').toLowerCase().includes(query);

        if (!matchesScope && !matchesEmp && !matchesPatternDays && !matchesWeekwise && !matchesMode) {
          return false;
        }
      }

      return true;
    });
  }, [weekOffRecords, filterMode, filterDepartment, searchTerm]);

  // KPI summary statistics
  const stats = useMemo(() => {
    const totalRecords = weekOffRecords.length;
    const hasGlobal = weekOffRecords.some(r => r.selectAllEmployees);
    const assignedIds = new Set();
    weekOffRecords.forEach(r => {
      if (!r.selectAllEmployees && r.selectedEmployees) {
        r.selectedEmployees.forEach(e => assignedIds.add(String(e.employeeId)));
      }
    });

    const weeklyCount = weekOffRecords.filter(r => (r.selectionMode || 'weekly') === 'weekly').length;
    const weekwiseCount = weekOffRecords.filter(r => r.selectionMode === 'weekwise').length;

    return {
      total: totalRecords,
      coveredText: hasGlobal ? 'All Employees' : `${assignedIds.size} Employees`,
      weekly: weeklyCount,
      weekwise: weekwiseCount
    };
  }, [weekOffRecords]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / itemsPerPage));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(p => p - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(p => p + 1);
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterDepartment('');
    setFilterMode('all');
    const now = new Date();
    setSelectedMonth(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
    setCurrentPage(1);
  };

  const isAnyFilterActive = Boolean(
    searchTerm ||
    filterDepartment ||
    filterMode !== 'all'
  );

  // Open Full Calendar Modal
  const openCalendarModal = (record, monthStr) => {
    setActiveCalendarModal({
      isOpen: true,
      record,
      month: monthStr || (record.selectedMonths && record.selectedMonths.length > 0 ? record.selectedMonths[0] : selectedMonth)
    });
  };

  const closeCalendarModal = () => {
    setActiveCalendarModal({
      isOpen: false,
      record: null,
      month: ''
    });
  };

  // Modal open handler
  const openWeekOffModal = () => {
    setWeekOffForm({
      selectedEmployees: [],
      weekOffDays: ['Sunday'],
      specificDates: [],
      selectAllEmployees: false,
      selectedMonths: [],
      selectionMode: 'weekly',
      weekwiseSelection: [],
      monthlyPattern: []
    });
    setWeekOffDateInput('');
    setWeekOffEmpSearch('');
    setModalDepartmentFilter('');
    setModalActiveTab(1);
    setShowWeekOffModal(true);
  };

  // Week-off modal form helpers
  const toggleWeekOffDay = (day) => {
    setWeekOffForm(prev => ({
      ...prev,
      weekOffDays: prev.weekOffDays.includes(day)
        ? prev.weekOffDays.filter(d => d !== day)
        : [...prev.weekOffDays, day]
    }));
  };

  const toggleWeekwiseSelection = (week, day) => {
    setWeekOffForm(prev => {
      const exists = prev.weekwiseSelection.some(item => item.week === week && item.day === day);
      if (exists) {
        return {
          ...prev,
          weekwiseSelection: prev.weekwiseSelection.filter(item => !(item.week === week && item.day === day))
        };
      } else {
        return {
          ...prev,
          weekwiseSelection: [...prev.weekwiseSelection, { week, day }]
        };
      }
    });
  };

  const toggleAllWeeksForDay = (day) => {
    setWeekOffForm(prev => {
      const allSelected = WEEK_NUMBERS.every(w =>
        prev.weekwiseSelection.some(item => item.week === w && item.day === day)
      );
      if (allSelected) {
        return {
          ...prev,
          weekwiseSelection: prev.weekwiseSelection.filter(item => item.day !== day)
        };
      } else {
        const withoutDay = prev.weekwiseSelection.filter(item => item.day !== day);
        const allForDay = WEEK_NUMBERS.map(w => ({ week: w, day }));
        return {
          ...prev,
          weekwiseSelection: [...withoutDay, ...allForDay]
        };
      }
    });
  };

  const applyWeekwisePreset = (preset) => {
    if (preset === 'all-sundays') {
      setWeekOffForm(prev => ({
        ...prev,
        weekwiseSelection: WEEK_NUMBERS.map(w => ({ week: w, day: 'Sunday' }))
      }));
    } else if (preset === '2nd-4th-saturday') {
      setWeekOffForm(prev => ({
        ...prev,
        weekwiseSelection: [
          { week: 2, day: 'Saturday' },
          { week: 4, day: 'Saturday' }
        ]
      }));
    } else if (preset === 'sundays-and-2nd-4th-saturday') {
      setWeekOffForm(prev => ({
        ...prev,
        weekwiseSelection: [
          ...WEEK_NUMBERS.map(w => ({ week: w, day: 'Sunday' })),
          { week: 2, day: 'Saturday' },
          { week: 4, day: 'Saturday' }
        ]
      }));
    } else if (preset === 'all-sat-sun') {
      setWeekOffForm(prev => ({
        ...prev,
        weekwiseSelection: WEEK_NUMBERS.flatMap(w => [
          { week: w, day: 'Saturday' },
          { week: w, day: 'Sunday' }
        ])
      }));
    } else if (preset === 'clear') {
      setWeekOffForm(prev => ({
        ...prev,
        weekwiseSelection: []
      }));
    }
  };

  const handleModeSwitch = (mode) => {
    setWeekOffForm(prev => {
      let newWeekOffDays = prev.weekOffDays;
      let newWeekwiseSelection = prev.weekwiseSelection;

      if (mode === 'weekwise') {
        if (newWeekwiseSelection.length === 0) {
          const daysToUse = prev.weekOffDays.length > 0 ? prev.weekOffDays : ['Sunday'];
          newWeekwiseSelection = WEEK_NUMBERS.flatMap(w => daysToUse.map(d => ({ week: w, day: d })));
        }
      } else if (mode === 'weekly') {
        if (newWeekOffDays.length === 0) {
          const extractedDays = Array.from(new Set(prev.weekwiseSelection.map(item => item.day)));
          newWeekOffDays = extractedDays.length > 0 ? extractedDays : ['Sunday'];
        }
      }

      return {
        ...prev,
        selectionMode: mode,
        weekOffDays: newWeekOffDays,
        weekwiseSelection: newWeekwiseSelection
      };
    });
  };

  const addWeekOffDate = () => {
    if (!weekOffDateInput) return;
    if (weekOffForm.specificDates.includes(weekOffDateInput)) return;
    setWeekOffForm(prev => ({
      ...prev,
      specificDates: [...prev.specificDates, weekOffDateInput].sort()
    }));
    setWeekOffDateInput('');
  };

  const removeWeekOffDate = (date) => {
    setWeekOffForm(prev => ({
      ...prev,
      specificDates: prev.specificDates.filter(d => d !== date)
    }));
  };

  const handleSaveWeekOff = async (e) => {
    e.preventDefault();
    setError('');

    if (!weekOffForm.selectAllEmployees && weekOffForm.selectedEmployees.length === 0) {
      setError('Please select at least one employee or check "Apply to All Employees".');
      setModalActiveTab(1);
      return;
    }

    let hasPattern = false;
    if (weekOffForm.selectionMode === 'weekly' && weekOffForm.weekOffDays.length > 0) {
      hasPattern = true;
    } else if (weekOffForm.selectionMode === 'weekwise' && weekOffForm.weekwiseSelection.length > 0) {
      hasPattern = true;
    }

    if (!hasPattern && weekOffForm.specificDates.length === 0) {
      if (weekOffForm.selectionMode === 'weekwise') {
        setError('Please select at least one week-off day in the week-wise table or click a quick preset.');
      } else {
        setError('Please select at least one day (e.g. Sunday) or add a specific date.');
      }
      setModalActiveTab(2);
      return;
    }

    try {
      setWeekOffSubmitting(true);
      const payload = {
        selectedEmployees: weekOffForm.selectAllEmployees ? [] : weekOffForm.selectedEmployees,
        weekOffDays: weekOffForm.weekOffDays,
        specificDates: weekOffForm.specificDates,
        selectAllEmployees: weekOffForm.selectAllEmployees,
        selectedMonths: weekOffForm.selectedMonths,
        selectionMode: weekOffForm.selectionMode,
        weekwiseSelection: weekOffForm.weekwiseSelection,
        monthlyPattern: []
      };

      const res = await axios.post(`${API_BASE_URL}/shifts/week-off`, payload);
      if (res.data.success) {
        const countDesc = weekOffForm.selectAllEmployees
          ? 'all company employees'
          : `${weekOffForm.selectedEmployees.length} employee(s)`;
        setSuccess(`Week-off policy configured successfully for ${countDesc}.`);
        setShowWeekOffModal(false);
        fetchWeekOffRecords();
      } else {
        setError(res.data.message || 'Failed to save week off policy.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save week off policy.');
    } finally {
      setWeekOffSubmitting(false);
    }
  };

  // Loading state matching AttendanceList.js
  if (loading) {
    return (
      <div className="emp-dash">
        <div className="emp-dash__loading">
          <div className="emp-dash__spinner" />
          <p className="emp-dash__loading-text">Loading week off management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="emp-dash">
      <main className="p-2 sm:p-4 lg:p-6">

        {/* Global Success / Error Banners */}
        {success && (
          <div className="mb-4 flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl shadow-xs transition-all">
            <div className="flex items-center gap-2.5 text-xs font-semibold">
              <FiCheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{success}</span>
            </div>
            <button
              onClick={() => setSuccess('')}
              className="text-emerald-500 hover:text-emerald-700 p-1 rounded-md"
            >
              <FaTimes className="w-3 h-3" />
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 flex items-center justify-between p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl shadow-xs transition-all">
            <div className="flex items-center gap-2.5 text-xs font-semibold">
              <FiAlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError('')}
              className="text-red-500 hover:text-red-700 p-1 rounded-md"
            >
              <FaTimes className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Desktop Header - Title on Left, Complete Filters and Action on Right */}
        <div className="hidden lg:flex items-center justify-between gap-3 flex-wrap mb-4">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap">
              Week Off <span>Management</span>
            </h1>
            <span className="text-xs text-slate-500 font-medium">
              Configure &amp; track automated weekly and week-wise employee offs
            </span>
          </div>

          {/* Right Side: Filters and Action Button */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative min-w-[140px]">
              <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]" />
              <input
                type="text"
                placeholder="Search rule or emp..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-[150px] pl-7 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white shadow-2xs"
              />
            </div>

            {/* Department Filter Dropdown */}
            <div className="relative" ref={departmentFilterRef}>
              <button
                type="button"
                onClick={() => setShowDepartmentFilter(!showDepartmentFilter)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all bg-white whitespace-nowrap shadow-2xs ${
                  filterDepartment
                    ? "border-indigo-500 text-indigo-700 ring-2 ring-indigo-500/10 bg-indigo-50 font-semibold"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <FaBuilding className="text-gray-400 text-[10px]" />
                <span className="truncate max-w-[90px]">{filterDepartment || "Department"}</span>
                <span className="text-gray-400 text-[10px]">▾</span>
              </button>
              {showDepartmentFilter && (
                <div
                  className="fixed bg-white border border-gray-200 rounded-lg shadow-2xl min-w-[190px] max-h-60 overflow-y-auto"
                  style={{
                    zIndex: 99999,
                    top: departmentFilterRef.current ? departmentFilterRef.current.getBoundingClientRect().bottom + 4 : 'auto',
                    left: departmentFilterRef.current ? departmentFilterRef.current.getBoundingClientRect().left : 'auto',
                  }}
                >
                  <div
                    onClick={() => {
                      setFilterDepartment("");
                      setShowDepartmentFilter(false);
                      setCurrentPage(1);
                    }}
                    className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100 cursor-pointer hover:bg-indigo-50"
                  >
                    All Departments
                  </div>
                  {uniqueDepartments.map((dept) => (
                    <div
                      key={dept}
                      onClick={() => {
                        setFilterDepartment(dept);
                        setShowDepartmentFilter(false);
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-2 text-xs cursor-pointer hover:bg-indigo-50 ${
                        filterDepartment === dept ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-gray-700"
                      }`}
                    >
                      {dept}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pattern Mode Filter */}
            <div className="relative">
              <select
                value={filterMode}
                onChange={(e) => {
                  setFilterMode(e.target.value);
                  setCurrentPage(1);
                }}
                className={`h-8 px-2.5 py-1 text-xs font-medium border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white shadow-2xs ${
                  filterMode !== 'all' ? 'border-indigo-500 text-indigo-700 bg-indigo-50 font-semibold' : 'border-gray-300 text-gray-700'
                }`}
              >
                <option value="all">All Patterns</option>
                <option value="weekly">Weekly Pattern</option>
                <option value="weekwise">Week-wise Pattern</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            {isAnyFilterActive && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-2xs whitespace-nowrap"
              >
                <FiTrash2 className="w-3 h-3 text-gray-500" />
                Clear
              </button>
            )}

            {/* Primary Action Button: Set Week Off */}
            <button
              onClick={openWeekOffModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm hover:shadow transition-all whitespace-nowrap"
            >
              <FaPlus className="w-3 h-3" />
              Set Week Off
            </button>
          </div>
        </div>

        {/* Mobile Header - Compact Title & Filter Drawer */}
        <div className="lg:hidden flex items-center justify-between gap-2 flex-wrap mb-3">
          <h1 className="text-base font-bold whitespace-nowrap text-gray-900">
            Week Off <span className="text-indigo-600">Management</span>
          </h1>
          <button
            onClick={openWeekOffModal}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-indigo-600 rounded-lg shadow-sm"
          >
            <FaPlus className="w-3 h-3" /> Set Week Off
          </button>
        </div>

        {/* Mobile Filter Toggle Drawer */}
        <div className="lg:hidden mb-3">
          <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-gray-200 shadow-2xs">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center gap-2 text-xs font-semibold text-gray-700"
            >
              <FiFilter className="text-indigo-600 text-sm" />
              <span>Filter Policies</span>
              {showMobileFilters ? <FaChevronUp className="text-gray-400 text-xs" /> : <FaChevronDown className="text-gray-400 text-xs" />}
            </button>
            <span className="text-xs text-gray-500 font-medium">
              <strong>{filteredRecords.length}</strong> policies
            </span>
          </div>

          {showMobileFilters && (
            <div className="mt-2 p-3 bg-white rounded-xl border border-gray-200 shadow-sm space-y-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Search</label>
                <input
                  type="text"
                  placeholder="Search name, ID, or day..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Department</label>
                  <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="">All Departments</option>
                    {uniqueDepartments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Pattern Mode</label>
                  <select
                    value={filterMode}
                    onChange={(e) => setFilterMode(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="all">All Modes</option>
                    <option value="weekly">Weekly</option>
                    <option value="weekwise">Week-wise</option>
                  </select>
                </div>
              </div>
              {isAnyFilterActive && (
                <button
                  onClick={clearFilters}
                  className="w-full py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Top KPI Stats Grid (Matching AttendanceList) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-5">
          {/* Card 1: Total Policies */}
          <div
            className="emp-dash__stat cursor-pointer hover:scale-[1.02] transition-transform duration-200"
            onClick={() => setFilterMode('all')}
            title="Click to view all policies"
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Policies</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FiCalendar />
              </div>
            </div>
            <div className="emp-dash__stat-value">{stats.total}</div>
            <div className="emp-dash__stat-meta">configured week-off rules</div>
          </div>

          {/* Card 2: Employees Covered */}
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Coverage</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <FiUsers />
              </div>
            </div>
            <div className="emp-dash__stat-value text-lg sm:text-2xl font-bold truncate">
              {stats.coveredText}
            </div>
            <div className="emp-dash__stat-meta">employees covered by rules</div>
          </div>

          {/* Card 3: Weekly Rules */}
          <div
            className="emp-dash__stat cursor-pointer hover:scale-[1.02] transition-transform duration-200"
            onClick={() => setFilterMode('weekly')}
            title="Click to filter weekly policies"
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Weekly Rules</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                <FiRepeat />
              </div>
            </div>
            <div className="emp-dash__stat-value">{stats.weekly}</div>
            <div className="emp-dash__stat-meta">repeating every week</div>
          </div>

          {/* Card 4: Week-Wise Rules */}
          <div
            className="emp-dash__stat cursor-pointer hover:scale-[1.02] transition-transform duration-200"
            onClick={() => setFilterMode('weekwise')}
            title="Click to filter week-wise policies"
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Week-Wise Rules</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                <FiGrid />
              </div>
            </div>
            <div className="emp-dash__stat-value">{stats.weekwise}</div>
            <div className="emp-dash__stat-meta">custom alternating weeks</div>
          </div>
        </div>

        {/* Main Card Container */}
        <div className="emp-dash__card">
          {/* Card Header with Title and View Toggles */}
          <div className="emp-dash__card-header flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="emp-dash__card-title flex items-center gap-2">
                <FaCalendarTimes className="text-indigo-600" />
                <span>Configured Week-Off Rules</span>
                <span className="ml-1.5 px-2 py-0.5 text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full">
                  {filteredRecords.length} {filteredRecords.length === 1 ? 'Rule' : 'Rules'}
                </span>
              </h3>
              <p className="emp-dash__card-desc">
                Interactive calendars with highlighted week-offs for <strong>selected months only</strong>
              </p>
            </div>

            {/* Right Header: View Mode Toggle */}
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center p-0.5 bg-gray-100 rounded-lg border border-gray-200">
                <button
                  type="button"
                  onClick={() => handleViewModeChange('table')}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                    viewMode === 'table'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                  title="Table View"
                >
                  <FaTable className="text-[11px]" />
                  <span>Table</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleViewModeChange('grid')}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                  title="Cards View"
                >
                  <FaThLarge className="text-[11px]" />
                  <span>Cards</span>
                </button>
              </div>
            </div>
          </div>

          {/* Records Display or Empty State */}
          {filteredRecords.length === 0 ? (
            <div className="py-14 px-4 text-center">
              <div className="w-14 h-14 mx-auto mb-3 flex items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 text-2xl shadow-inner">
                <FaCalendarTimes />
              </div>
              <h4 className="text-sm font-bold text-gray-800 mb-1">No week-off rules found</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">
                {isAnyFilterActive
                  ? "No rules match your active filter criteria. Try clearing filters or searching for another term."
                  : "No week-off policies configured yet. Click below to configure the first policy."}
              </p>
              {isAnyFilterActive ? (
                <button
                  onClick={clearFilters}
                  className="px-3.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
                >
                  Clear All Filters
                </button>
              ) : (
                <button
                  onClick={openWeekOffModal}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
                >
                  + Set Week Off
                </button>
              )}
            </div>
          ) : viewMode === 'table' ? (
            /* TABLE VIEW WITH HIGHLIGHTED CALENDARS SCOPED TO SELECTED MONTHS */
            <div className="overflow-x-auto">
              <table className="emp-dash__table">
                <thead>
                  <tr>
                    <th style={{ minWidth: '200px' }}>Assigned Scope / Employees</th>
                    <th style={{ minWidth: '105px' }}>Pattern Mode</th>
                    <th style={{ minWidth: '150px' }}>Schedule / Days</th>
                    <th style={{ minWidth: '220px', textAlign: 'center' }}>
                      Calculated Dates (Selected Months Only)
                    </th>
                    <th style={{ minWidth: '120px' }}>Configured Target Months</th>
                    <th style={{ minWidth: '100px' }}>Additional Dates</th>
                    <th style={{ minWidth: '110px' }}>Created On</th>
                    <th style={{ textAlign: 'right', minWidth: '70px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.map((record) => {
                    const isWeekly = (record.selectionMode || 'weekly') === 'weekly';

                    return (
                      <tr key={record._id} className="transition-colors hover:bg-slate-50/60">
                        {/* Scope / Employees */}
                        <td className="px-3 py-3">
                          {record.selectAllEmployees ? (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
                              <span>🌟</span>
                              <span>All Company Employees</span>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold">
                                  {record.selectedEmployees?.length || 0}
                                </span>
                                <span className="text-xs font-semibold text-slate-800">
                                  {record.selectedEmployees?.length === 1 ? '1 Employee' : `${record.selectedEmployees?.length || 0} Employees`}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {record.selectedEmployees?.slice(0, 2).map((emp) => {
                                  const empInfo = getEmployeeDetails(emp.employeeId);
                                  return (
                                    <div
                                      key={emp.employeeId}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-md text-[11px] font-medium"
                                      title={`ID: ${emp.employeeId} • Dept: ${empInfo.department}`}
                                    >
                                      <span className="truncate max-w-[110px]">{emp.employeeName}</span>
                                    </div>
                                  );
                                })}
                                {(record.selectedEmployees?.length || 0) > 2 && (
                                  <span
                                    className="inline-flex items-center px-1.5 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-md text-[10px] font-bold cursor-help"
                                    title={record.selectedEmployees.slice(2).map(e => e.employeeName).join(', ')}
                                  >
                                    +{record.selectedEmployees.length - 2} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Pattern Mode Badge */}
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              isWeekly
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-purple-50 text-purple-700 border-purple-200'
                            }`}
                          >
                            {isWeekly ? <FiRepeat className="text-[10px]" /> : <FiGrid className="text-[10px]" />}
                            {isWeekly ? 'Weekly' : 'Week-wise'}
                          </span>
                        </td>

                        {/* Schedule / Days */}
                        <td className="px-3 py-3">
                          {isWeekly ? (
                            <div className="flex flex-wrap gap-1">
                              {(record.weekOffDays && record.weekOffDays.length > 0) ? (
                                record.weekOffDays.map(day => (
                                  <span
                                    key={day}
                                    className="px-2 py-0.5 text-[11px] font-semibold bg-slate-100 text-slate-700 rounded border border-slate-200"
                                  >
                                    Every {day.slice(0, 3)}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-gray-400">-</span>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-1 max-w-sm">
                              {record.weekwiseSelection && record.weekwiseSelection.length > 0 ? (
                                record.weekwiseSelection.map((item, idx) => (
                                  <span
                                    key={idx}
                                    className="px-1.5 py-0.5 text-[10px] font-semibold bg-purple-50 text-purple-700 rounded border border-purple-200"
                                  >
                                    W{item.week}-{item.day.slice(0, 3)}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-gray-400">-</span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* HIGHLIGHTED CALENDAR CELL - SCOPED ONLY TO SELECTED MONTHS */}
                        <td className="px-3 py-2 text-center">
                          <RecordCalendarCell
                            record={record}
                            filterMonth={selectedMonth}
                            calculateDatesFn={calculateDatesFromPattern}
                            onEnlarge={openCalendarModal}
                            formatMonthLabel={formatMonthLabel}
                          />
                        </td>

                        {/* Configured Target Months */}
                        <td className="px-3 py-3">
                          {record.selectedMonths && record.selectedMonths.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {record.selectedMonths.map((m, i) => (
                                <span
                                  key={i}
                                  className="px-1.5 py-0.5 text-[10px] font-bold bg-purple-50 text-purple-700 rounded-md border border-purple-200"
                                >
                                  {formatMonthLabel(m)}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium italic">All Months (Ongoing)</span>
                          )}
                        </td>

                        {/* Additional Dates */}
                        <td className="px-3 py-3">
                          {record.specificDates && record.specificDates.length > 0 ? (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold bg-orange-50 text-orange-700 rounded-md border border-orange-200 cursor-help"
                              title={record.specificDates.map(d => formatDateLabel(d)).join(', ')}
                            >
                              🎯 {record.specificDates.length} date(s)
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* Created At */}
                        <td className="px-3 py-3 text-slate-500 text-[11px] font-medium whitespace-nowrap">
                          {record.createdAt ? (
                            <div>
                              <div>{formatDateLabel(record.createdAt)}</div>
                              <div className="text-[10px] text-slate-400">
                                {new Date(record.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                              </div>
                            </div>
                          ) : '-'}
                        </td>

                        {/* Actions */}
                        <td className="px-3 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteWeekOff(record._id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete this week-off policy"
                          >
                            <FaTrash className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* CARDS GRID VIEW WITH HIGHLIGHTED CALENDARS */
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentRecords.map((record) => {
                const isWeekly = (record.selectionMode || 'weekly') === 'weekly';
                const hasSpecificMonths = Array.isArray(record.selectedMonths) && record.selectedMonths.length > 0;
                const cardActiveMonth = hasSpecificMonths ? record.selectedMonths[0] : selectedMonth;
                const calculatedDates = calculateDatesFromPattern(record, cardActiveMonth);

                return (
                  <div
                    key={record._id}
                    className="p-4 rounded-xl border border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Header: Scope + Delete */}
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        {record.selectAllEmployees ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            🌟 All Employees
                          </span>
                        ) : (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                              <FaUsers className="text-[10px]" /> {record.selectedEmployees?.length || 0} Employees
                            </span>
                            <p className="text-[11px] text-gray-500 mt-1 line-clamp-1">
                              {record.selectedEmployees?.map(e => e.employeeName).join(', ')}
                            </p>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteWeekOff(record._id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete policy"
                        >
                          <FaTrash className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Pattern Badge & Configured Months */}
                      <div className="mb-2.5 flex items-center justify-between flex-wrap gap-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                            isWeekly
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-purple-50 text-purple-700 border-purple-200'
                          }`}
                        >
                          {isWeekly ? <FiRepeat /> : <FiGrid />}
                          {isWeekly ? 'Weekly Pattern' : 'Week-wise Pattern'}
                        </span>
                        {hasSpecificMonths && (
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                            {record.selectedMonths.map(m => formatMonthLabel(m)).join(', ')}
                          </span>
                        )}
                      </div>

                      {/* Highlighted Calendar in Card */}
                      <div className="my-3 flex justify-center">
                        <MiniMonthCalendar
                          monthStr={cardActiveMonth}
                          calculatedDates={calculatedDates}
                          specificDates={record.specificDates || []}
                          onEnlarge={() => openCalendarModal(record, cardActiveMonth)}
                          showTitle={true}
                          interactive={true}
                        />
                      </div>

                      {/* Schedule details */}
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs mb-2.5">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Off Days:
                        </div>
                        {isWeekly ? (
                          <div className="flex flex-wrap gap-1">
                            {record.weekOffDays?.map(d => (
                              <span key={d} className="px-1.5 py-0.5 bg-white rounded border border-slate-200 text-slate-700 font-semibold text-[10px]">
                                Every {d}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {record.weekwiseSelection?.map((item, idx) => (
                              <span key={idx} className="px-1.5 py-0.5 bg-purple-100/60 rounded border border-purple-200 text-purple-800 font-semibold text-[10px]">
                                W{item.week}-{item.day.slice(0, 3)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Footer: Creation Date */}
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
                      <span>Created: {formatDateLabel(record.createdAt)}</span>
                      <button
                        type="button"
                        onClick={() => openCalendarModal(record, cardActiveMonth)}
                        className="text-indigo-600 font-semibold hover:underline"
                      >
                        Full Calendar →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls (Matching AttendanceList.js) */}
          {filteredRecords.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-200">
              <div className="flex items-center gap-3 text-xs text-gray-600">
                <div className="flex items-center gap-1.5">
                  <span>Show</span>
                  <select
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                    className="p-1 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span>entries</span>
                </div>
                <div className="text-xs text-gray-500 font-medium">
                  Showing <strong className="text-gray-800">{indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredRecords.length)}</strong> of{" "}
                  <strong className="text-gray-800">{filteredRecords.length}</strong> rules
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`px-2.5 py-1 text-xs font-semibold border rounded-lg transition-all ${
                    currentPage === 1
                      ? "text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed"
                      : "text-gray-700 bg-white hover:bg-gray-50 border-gray-300 shadow-2xs"
                  }`}
                >
                  Prev
                </button>

                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => typeof page === 'number' ? setCurrentPage(page) : null}
                    disabled={page === "..."}
                    className={`px-3 py-1 text-xs font-semibold border rounded-lg transition-all min-w-[32px] ${
                      page === "..."
                        ? "text-gray-400 bg-transparent border-transparent cursor-default"
                        : currentPage === page
                          ? "text-white bg-indigo-600 border-indigo-600 shadow-2xs"
                          : "text-gray-700 bg-white hover:bg-gray-50 border-gray-300"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-2.5 py-1 text-xs font-semibold border rounded-lg transition-all ${
                    currentPage === totalPages
                      ? "text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed"
                      : "text-gray-700 bg-white hover:bg-gray-50 border-gray-300 shadow-2xs"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ========================================================================= */}
      {/* LARGE FULL-MONTH CALENDAR POPUP MODAL                                    */}
      {/* ========================================================================= */}
      {activeCalendarModal.isOpen && activeCalendarModal.record && (
        <FullCalendarModal
          record={activeCalendarModal.record}
          initialMonth={activeCalendarModal.month}
          onClose={closeCalendarModal}
          calculateDatesFn={calculateDatesFromPattern}
          formatMonthLabel={formatMonthLabel}
        />
      )}

      {/* ========================================================================= */}
      {/* POLISHED SET WEEK OFF MODAL WITH LIVE CALENDAR PREVIEW                    */}
      {/* ========================================================================= */}
      {showWeekOffModal && (() => {
        const activeEmployees = allEmployees.filter(emp => !isEmployeeHidden(emp));
        const searchLower = weekOffEmpSearch.toLowerCase();
        const filteredEmpList = weekOffEmpSearch || modalDepartmentFilter
          ? activeEmployees.filter(emp => {
              const matchesSearch = !weekOffEmpSearch ||
                (emp.name || emp.employeeName || '').toLowerCase().includes(searchLower) ||
                (emp.employeeId || '').toLowerCase().includes(searchLower);
              const matchesDept = !modalDepartmentFilter || emp.department === modalDepartmentFilter;
              return matchesSearch && matchesDept;
            })
          : activeEmployees;

        // Determine which month to preview in the modal
        const modalPreviewMonth = (weekOffForm.selectedMonths && weekOffForm.selectedMonths.length > 0)
          ? weekOffForm.selectedMonths[0]
          : selectedMonth;

        const tempRecord = {
          selectionMode: weekOffForm.selectionMode,
          weekOffDays: weekOffForm.weekOffDays,
          weekwiseSelection: weekOffForm.weekwiseSelection,
          selectedMonths: weekOffForm.selectedMonths
        };
        const modalCalculatedDates = calculateDatesFromPattern(tempRecord, modalPreviewMonth);

        return (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto"
            onClick={() => setShowWeekOffModal(false)}
          >
            <div
              className="relative bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-4 sm:px-6 sm:py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50/80 via-purple-50/40 to-blue-50/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
                    <FaCalendarTimes className="text-lg" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 leading-tight">
                      Set Week-Off Policy
                    </h3>
                    <p className="text-xs text-gray-500">
                      Configure automated weekly or alternating week-wise days off
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowWeekOffModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-red-50 hover:text-red-600 text-gray-400 border border-gray-200 transition-colors shadow-2xs"
                  aria-label="Close"
                >
                  <FaTimes className="text-sm" />
                </button>
              </div>

              {/* Stepper Tabs */}
              <div className="grid grid-cols-3 border-b border-gray-200 bg-gray-50/60 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setModalActiveTab(1)}
                  className={`py-2.5 px-2 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                    modalActiveTab === 1
                      ? 'border-indigo-600 text-indigo-700 bg-white font-bold'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-indigo-100 text-indigo-700">
                    1
                  </span>
                  <span>Employees</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalActiveTab(2)}
                  className={`py-2.5 px-2 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                    modalActiveTab === 2
                      ? 'border-indigo-600 text-indigo-700 bg-white font-bold'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-indigo-100 text-indigo-700">
                    2
                  </span>
                  <span>Pattern</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalActiveTab(3)}
                  className={`py-2.5 px-2 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                    modalActiveTab === 3
                      ? 'border-indigo-600 text-indigo-700 bg-white font-bold'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-indigo-100 text-indigo-700">
                    3
                  </span>
                  <span>Target Months</span>
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSaveWeekOff} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">

                {/* TAB 1: EMPLOYEE SELECTION */}
                {modalActiveTab === 1 && (
                  <div className="space-y-3.5">
                    {/* Select All Checkbox */}
                    <div className="p-3 bg-gradient-to-r from-indigo-50/70 to-blue-50/70 border border-indigo-200 rounded-xl flex items-center justify-between cursor-pointer hover:border-indigo-300 transition-colors">
                      <label htmlFor="selectAllEmployeesModal" className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          id="selectAllEmployeesModal"
                          checked={weekOffForm.selectAllEmployees}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            setWeekOffForm(prev => ({
                              ...prev,
                              selectAllEmployees: isChecked,
                              selectedEmployees: isChecked ? [] : prev.selectedEmployees
                            }));
                          }}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                        />
                        <div>
                          <span className="text-xs font-bold text-indigo-900 block">Apply to All Company Employees</span>
                          <span className="text-[11px] text-indigo-600">Universal rule covering all active staff members</span>
                        </div>
                      </label>
                      <span className="text-lg">🌟</span>
                    </div>

                    {!weekOffForm.selectAllEmployees && (
                      <>
                        {/* Search and Dept Filter Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="relative">
                            <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                            <input
                              type="text"
                              placeholder="Search employee name or ID..."
                              value={weekOffEmpSearch}
                              onChange={(e) => setWeekOffEmpSearch(e.target.value)}
                              className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                            />
                          </div>
                          <div>
                            <select
                              value={modalDepartmentFilter}
                              onChange={(e) => setModalDepartmentFilter(e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-gray-700"
                            >
                              <option value="">All Departments</option>
                              {uniqueDepartments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Selected Chips */}
                        {weekOffForm.selectedEmployees.length > 0 && (
                          <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl">
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1.5">
                              <span>Selected: <strong>{weekOffForm.selectedEmployees.length}</strong> employee(s)</span>
                              <button
                                type="button"
                                onClick={() => setWeekOffForm(prev => ({ ...prev, selectedEmployees: [] }))}
                                className="text-[11px] text-red-600 hover:underline"
                              >
                                Clear All
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                              {weekOffForm.selectedEmployees.map(emp => (
                                <span
                                  key={emp.employeeId}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full"
                                >
                                  {emp.employeeName}
                                  <button
                                    type="button"
                                    onClick={() => setWeekOffForm(prev => ({
                                      ...prev,
                                      selectedEmployees: prev.selectedEmployees.filter(e => e.employeeId !== emp.employeeId)
                                    }))}
                                    className="text-indigo-400 hover:text-indigo-700 ml-0.5"
                                  >
                                    <FaTimes className="text-[9px]" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Employee Checklist */}
                        <div className="border border-gray-200 rounded-xl overflow-hidden max-h-52 overflow-y-auto divide-y divide-gray-100 bg-white">
                          {filteredEmpList.length === 0 ? (
                            <div className="p-6 text-center text-xs text-gray-400">
                              No active employees found matching query
                            </div>
                          ) : (
                            filteredEmpList.map(emp => {
                              const empId = String(emp.employeeId || emp._id);
                              const empName = emp.name || emp.employeeName || 'Unknown';
                              const isSelected = weekOffForm.selectedEmployees.some(e => String(e.employeeId) === empId);

                              return (
                                <label
                                  key={empId}
                                  className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors ${
                                    isSelected ? 'bg-indigo-50/70' : 'hover:bg-gray-50'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => {
                                      const checked = e.target.checked;
                                      setWeekOffForm(prev => ({
                                        ...prev,
                                        selectedEmployees: checked
                                          ? [...prev.selectedEmployees, { employeeId: empId, employeeName: empName }]
                                          : prev.selectedEmployees.filter(i => String(i.employeeId) !== empId)
                                      }));
                                    }}
                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <span className="text-xs font-semibold text-gray-800 block truncate">{empName}</span>
                                    <span className="text-[10px] text-gray-500 block truncate">
                                      ID: {emp.employeeId || '-'} • {emp.department || 'No Dept'}
                                    </span>
                                  </div>
                                  {isSelected && <FaCheck className="text-indigo-600 text-xs flex-shrink-0" />}
                                </label>
                              );
                            })
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* TAB 2: PATTERN CONFIGURATION */}
                {modalActiveTab === 2 && (
                  <div className="space-y-4">
                    {/* Mode Switcher */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Pattern Mode
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleModeSwitch('weekly')}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            weekOffForm.selectionMode === 'weekly'
                              ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-500/20 shadow-xs'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-900">
                            <FiRepeat className="text-indigo-600" />
                            <span>Weekly Pattern</span>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-1">
                            Same days repeat every week (e.g. Every Sunday)
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleModeSwitch('weekwise')}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            weekOffForm.selectionMode === 'weekwise'
                              ? 'border-purple-600 bg-purple-50/80 ring-2 ring-purple-500/20 shadow-xs'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-bold text-xs text-purple-900">
                            <FiGrid className="text-purple-600" />
                            <span>Week-Wise Pattern</span>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-1">
                            Specific weeks (e.g. 2nd &amp; 4th Saturday)
                          </p>
                        </button>
                      </div>
                    </div>

                    {/* Weekly Mode Day Selector */}
                    {weekOffForm.selectionMode === 'weekly' && (
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                        <label className="block text-xs font-semibold text-slate-700">
                          Select Repeating Days:
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {WEEK_DAYS.map(day => {
                            const isSelected = weekOffForm.weekOffDays.includes(day);
                            return (
                              <button
                                key={day}
                                type="button"
                                onClick={() => toggleWeekOffDay(day)}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                                  isSelected
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                    : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400 hover:text-indigo-700'
                                }`}
                              >
                                {day}
                              </button>
                            );
                          })}
                        </div>
                        {weekOffForm.weekOffDays.length > 0 && (
                          <p className="text-xs text-indigo-700 font-semibold mt-1">
                            Active: {weekOffForm.weekOffDays.join(', ')}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Week-wise Mode Matrix & Presets */}
                    {weekOffForm.selectionMode === 'weekwise' && (
                      <div className="space-y-3">
                        {/* 1-Click Presets */}
                        <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl">
                          <p className="text-[11px] font-bold text-purple-900 mb-1.5">
                            ⚡ 1-Click Quick Presets:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            <button
                              type="button"
                              onClick={() => applyWeekwisePreset('all-sundays')}
                              className="px-2 py-1 text-[11px] font-semibold bg-white text-purple-700 border border-purple-200 rounded-md hover:bg-purple-100 transition-colors shadow-2xs"
                            >
                              🌟 All Sundays
                            </button>
                            <button
                              type="button"
                              onClick={() => applyWeekwisePreset('2nd-4th-saturday')}
                              className="px-2 py-1 text-[11px] font-semibold bg-white text-purple-700 border border-purple-200 rounded-md hover:bg-purple-100 transition-colors shadow-2xs"
                            >
                              🌟 2nd &amp; 4th Sat
                            </button>
                            <button
                              type="button"
                              onClick={() => applyWeekwisePreset('sundays-and-2nd-4th-saturday')}
                              className="px-2 py-1 text-[11px] font-semibold bg-white text-purple-700 border border-purple-200 rounded-md hover:bg-purple-100 transition-colors shadow-2xs"
                            >
                              🌟 Sun + 2nd &amp; 4th Sat
                            </button>
                            <button
                              type="button"
                              onClick={() => applyWeekwisePreset('all-sat-sun')}
                              className="px-2 py-1 text-[11px] font-semibold bg-white text-purple-700 border border-purple-200 rounded-md hover:bg-purple-100 transition-colors shadow-2xs"
                            >
                              🌟 All Sat &amp; Sun
                            </button>
                            <button
                              type="button"
                              onClick={() => applyWeekwisePreset('clear')}
                              className="px-2 py-1 text-[11px] font-semibold bg-white text-gray-500 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
                            >
                              Clear
                            </button>
                          </div>
                        </div>

                        {/* Column toggles */}
                        <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl">
                          <p className="text-[10px] text-gray-500 font-semibold mb-1">Toggle day across all 5 weeks:</p>
                          <div className="flex flex-wrap gap-1">
                            {WEEK_DAYS.map(day => {
                              const allSelected = WEEK_NUMBERS.every(w =>
                                weekOffForm.weekwiseSelection.some(i => i.week === w && i.day === day)
                              );
                              return (
                                <button
                                  key={`col-${day}`}
                                  type="button"
                                  onClick={() => toggleAllWeeksForDay(day)}
                                  className={`px-2 py-0.5 text-[10px] font-semibold rounded border transition-colors ${
                                    allSelected
                                      ? 'bg-purple-600 text-white border-purple-600'
                                      : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'
                                  }`}
                                >
                                  All {day.slice(0, 3)}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Weeks Matrix */}
                        <div className="space-y-1.5">
                          {WEEK_NUMBERS.map(week => (
                            <div key={week} className="p-2 border border-gray-200 rounded-lg bg-white flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-gray-700 whitespace-nowrap min-w-[50px]">
                                Week {week}
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {WEEK_DAYS.map(day => {
                                  const isSelected = weekOffForm.weekwiseSelection.some(
                                    i => i.week === week && i.day === day
                                  );
                                  return (
                                    <button
                                      key={`${week}-${day}`}
                                      type="button"
                                      onClick={() => toggleWeekwiseSelection(week, day)}
                                      className={`px-2 py-1 text-[10px] font-bold rounded border transition-all ${
                                        isSelected
                                          ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                                          : 'bg-white text-gray-600 border-gray-300 hover:border-purple-300'
                                      }`}
                                    >
                                      {day.slice(0, 3)}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Calculated Dates Live Preview WITH INTERACTIVE MINI CALENDAR */}
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                          <FiCheckCircle className="text-emerald-600" />
                          <span>
                            Live Calendar Preview ({formatMonthLabel(modalPreviewMonth)}):
                          </span>
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-200">
                          {modalCalculatedDates.length} Days Off
                        </span>
                      </div>

                      {/* Info if specific months chosen */}
                      {weekOffForm.selectedMonths.length > 0 && (
                        <div className="text-[11px] font-semibold text-purple-700 bg-purple-50/70 px-2 py-1 rounded border border-purple-200 text-center">
                          🎯 Scoped exclusively to selected months: {weekOffForm.selectedMonths.map(m => formatMonthLabel(m)).join(', ')}
                        </div>
                      )}

                      {/* Embedded Mini Calendar Preview */}
                      <div className="flex justify-center pt-1">
                        <MiniMonthCalendar
                          monthStr={modalPreviewMonth}
                          calculatedDates={modalCalculatedDates}
                          specificDates={weekOffForm.specificDates}
                          showTitle={false}
                          interactive={false}
                        />
                      </div>

                      {modalCalculatedDates.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pt-1">
                          {modalCalculatedDates.map((date, idx) => (
                            <span key={idx} className="px-2 py-0.5 text-[10px] font-medium bg-white text-emerald-800 rounded border border-emerald-200 shadow-2xs">
                              {formatDateLabel(date)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-gray-500 text-center">
                          Select days above to see calculated dates highlighted in the calendar.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 3: TARGET MONTHS & OPTIONAL DATES */}
                {modalActiveTab === 3 && (
                  <div className="space-y-4">
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 flex items-start gap-2">
                      <FaInfoCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Select Specific Months:</strong> Check one or more months below to restrict this week-off policy <strong>only</strong> to those calendar months. Months you leave unchecked will have <strong>zero</strong> week-offs from this policy. If you check none, it applies to all months ongoing.
                      </div>
                    </div>

                    {/* Specific Months Selector */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-bold text-gray-700">
                          Target Months (Week-Offs apply ONLY to checked months):
                        </label>
                        {weekOffForm.selectedMonths.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setWeekOffForm(prev => ({ ...prev, selectedMonths: [] }))}
                            className="text-[11px] font-semibold text-purple-600 hover:underline"
                          >
                            Reset to All Months
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                        {[
                          { val: '2026-01', label: 'Jan 2026' },
                          { val: '2026-02', label: 'Feb 2026' },
                          { val: '2026-03', label: 'Mar 2026' },
                          { val: '2026-04', label: 'Apr 2026' },
                          { val: '2026-05', label: 'May 2026' },
                          { val: '2026-06', label: 'Jun 2026' },
                          { val: '2026-07', label: 'Jul 2026' },
                          { val: '2026-08', label: 'Aug 2026' },
                          { val: '2026-09', label: 'Sep 2026' },
                          { val: '2026-10', label: 'Oct 2026' },
                          { val: '2026-11', label: 'Nov 2026' },
                          { val: '2026-12', label: 'Dec 2026' },
                          { val: '2027-01', label: 'Jan 2027' },
                          { val: '2027-02', label: 'Feb 2027' },
                          { val: '2027-03', label: 'Mar 2027' },
                          { val: '2027-04', label: 'Apr 2027' }
                        ].map(month => (
                          <label
                            key={month.val}
                            className={`flex items-center gap-1.5 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                              weekOffForm.selectedMonths.includes(month.val)
                                ? 'bg-purple-50 border-purple-300 font-bold text-purple-800 ring-1 ring-purple-400/30'
                                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={weekOffForm.selectedMonths.includes(month.val)}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setWeekOffForm(prev => ({
                                  ...prev,
                                  selectedMonths: checked
                                    ? [...prev.selectedMonths, month.val].sort()
                                    : prev.selectedMonths.filter(m => m !== month.val)
                                }));
                              }}
                              className="w-3.5 h-3.5 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                            />
                            <span>{month.label}</span>
                          </label>
                        ))}
                      </div>
                      {weekOffForm.selectedMonths.length > 0 && (
                        <p className="mt-2 text-xs font-semibold text-purple-700">
                          Selected: {weekOffForm.selectedMonths.map(m => formatMonthLabel(m)).join(', ')} ({weekOffForm.selectedMonths.length} month(s))
                        </p>
                      )}
                    </div>

                    {/* Additional One-Off Dates */}
                    <div className="pt-2 border-t border-gray-100">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Add Specific One-Off Off Dates (Optional):
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={weekOffDateInput}
                          onChange={(e) => setWeekOffDateInput(e.target.value)}
                          className="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                        <button
                          type="button"
                          onClick={addWeekOffDate}
                          disabled={!weekOffDateInput}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 transition-colors"
                        >
                          + Add Date
                        </button>
                      </div>

                      {weekOffForm.specificDates.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {weekOffForm.specificDates.map(date => (
                            <span
                              key={date}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200 rounded-full"
                            >
                              {formatDateLabel(date)}
                              <button
                                type="button"
                                onClick={() => removeWeekOffDate(date)}
                                className="text-orange-400 hover:text-orange-700 ml-0.5"
                              >
                                <FaTimes className="text-[9px]" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Live Policy Summary Box */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1 text-slate-700">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Rule Preview Summary:
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">Scope: </span>
                    {weekOffForm.selectAllEmployees
                      ? '🌟 All Company Employees'
                      : weekOffForm.selectedEmployees.length > 0
                        ? `${weekOffForm.selectedEmployees.length} employee(s) selected`
                        : <span className="text-red-500 font-bold">None selected</span>}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">Pattern: </span>
                    <span className="capitalize font-medium">{weekOffForm.selectionMode}</span>
                    {weekOffForm.selectionMode === 'weekly' && weekOffForm.weekOffDays.length > 0 && (
                      <span className="text-indigo-700 font-semibold"> ({weekOffForm.weekOffDays.join(', ')})</span>
                    )}
                    {weekOffForm.selectionMode === 'weekwise' && weekOffForm.weekwiseSelection.length > 0 && (
                      <span className="text-purple-700 font-semibold"> ({weekOffForm.weekwiseSelection.length} rule slots)</span>
                    )}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">Target Months: </span>
                    {weekOffForm.selectedMonths.length > 0 ? (
                      <span className="font-bold text-purple-700">
                        {weekOffForm.selectedMonths.map(m => formatMonthLabel(m)).join(', ')} (Only these months)
                      </span>
                    ) : (
                      <span className="font-medium text-slate-500">All Months (Ongoing)</span>
                    )}
                  </div>
                  {modalCalculatedDates.length > 0 && (
                    <div className="text-emerald-700 font-semibold pt-1">
                      ✅ {modalCalculatedDates.length} calculated day(s) off in {formatMonthLabel(modalPreviewMonth)}
                    </div>
                  )}
                </div>

                {/* Error inside modal */}
                {error && (
                  <div className="p-3 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg">
                    ❌ {error}
                  </div>
                )}
              </form>

              {/* Modal Footer */}
              <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  {modalActiveTab > 1 && (
                    <button
                      type="button"
                      onClick={() => setModalActiveTab(t => t - 1)}
                      className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Back
                    </button>
                  )}
                  {modalActiveTab < 3 && (
                    <button
                      type="button"
                      onClick={() => setModalActiveTab(t => t + 1)}
                      className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      Next Step →
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowWeekOffModal(false)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveWeekOff}
                    disabled={weekOffSubmitting}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {weekOffSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        <span>Saving Policy...</span>
                      </>
                    ) : (
                      <>
                        <FaCheck className="text-xs" />
                        <span>Save Week-Off Policy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
