import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import {
  FaCalendarAlt,
  FaSync,
  FaSearch,
  FaTimes,
  FaBirthdayCake,
  FaAward,
  FaUserTie,
  FaGift
} from 'react-icons/fa';

const Occasions = () => {
  const [occasions, setOccasions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [monthFilter, setMonthFilter] = useState("");
  const [occasionTypeFilter, setOccasionTypeFilter] = useState("all");

  useEffect(() => {
    fetchOccasions();
  }, []);

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    let d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;
    const parts = dateStr.split(/[-/]/);
    if (parts.length === 3) {
      if (parts[2].length === 4) return new Date(parts[2], parts[1] - 1, parts[0]);
      else if (parts[0].length === 4) return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    return null;
  };

  const fetchOccasions = async () => {
    setLoading(true);
    setError('');
    try {
      // Use the generic employee endpoint to build the occasions list
      const res = await axios.get("https://api.timelyhealth.in/api/employees/get-employees");
      const employees = res.data || [];
      
      const today = new Date();
      let allEvents = [];

      employees.forEach(emp => {
        // Handle Birthdays
        if (emp.dob) {
          const dobDate = parseDate(emp.dob);
          if (dobDate) {
            // Create a fake date for this year's birthday to accurately sort
            const thisYearsBday = new Date(today.getFullYear(), dobDate.getMonth(), dobDate.getDate());
            allEvents.push({
              id: `bday-${emp._id || emp.employeeId}`,
              employeeId: emp.employeeId,
              name: emp.name,
              role: emp.role || emp.department || 'Employee',
              type: 'birthday',
              originalDate: dobDate,
              eventDateThisYear: thisYearsBday,
              month: dobDate.getMonth(), // 0-11
              day: dobDate.getDate(),
              years: null,
              isToday: dobDate.getMonth() === today.getMonth() && dobDate.getDate() === today.getDate()
            });
          }
        }

        // Handle Work Anniversaries
        if (emp.joinDate) {
          const joinDate = parseDate(emp.joinDate);
          if (joinDate && joinDate.getFullYear() < today.getFullYear()) {
            const thisYearsAnniv = new Date(today.getFullYear(), joinDate.getMonth(), joinDate.getDate());
            const years = today.getFullYear() - joinDate.getFullYear();
            
            allEvents.push({
              id: `anniv-${emp._id || emp.employeeId}`,
              employeeId: emp.employeeId,
              name: emp.name,
              role: emp.role || emp.department || 'Employee',
              type: 'anniversary',
              originalDate: joinDate,
              eventDateThisYear: thisYearsAnniv,
              month: joinDate.getMonth(),
              day: joinDate.getDate(),
              years: years,
              isToday: joinDate.getMonth() === today.getMonth() && joinDate.getDate() === today.getDate()
            });
          }
        }
      });

      // Calculate exact next occurrence to sort chronologically from today
      const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
      
      allEvents.forEach(evt => {
        let nextOccur = new Date(today.getFullYear(), evt.month, evt.day);
        if (nextOccur.getTime() < todayDateOnly) {
           nextOccur.setFullYear(today.getFullYear() + 1);
        }
        evt.nextOccurTime = nextOccur.getTime();
      });

      // Sort by upcoming Date
      allEvents.sort((a, b) => {
         // Pinned today's events strictly at the top
         if (a.isToday && !b.isToday) return -1;
         if (!a.isToday && b.isToday) return 1;
         
         // Chronological order for upcoming events
         return a.nextOccurTime - b.nextOccurTime;
      });

      setOccasions(allEvents);

    } catch (err) {
      console.error("Error fetching occasions:", err);
      setError("Failed to load occasions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- Filtering Logic ---
  const filteredRecords = occasions.filter(occ => {
    // Search Query
    const query = searchQuery.toLowerCase();
    const empName = (occ.name || '').toLowerCase();
    const empId = (occ.employeeId || '').toLowerCase();
    const matchesSearch = empName.includes(query) || empId.includes(query);

    // Month Filter (monthFilter format comes as "MM" string from select)
    let matchesMonth = true;
    if (monthFilter !== "") {
        matchesMonth = occ.month === parseInt(monthFilter);
    }

    // Type Filter
    let matchesType = true;
    if (occasionTypeFilter !== "all") {
        matchesType = occ.type === occasionTypeFilter;
    }

    return matchesSearch && matchesMonth && matchesType;
  });

  const getMonthName = (monthIndex) => {
      const date = new Date();
      date.setMonth(monthIndex);
      return date.toLocaleString('default', { month: 'short' });
  };

  const getOrdinalSuffix = (i) => {
    let j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
  }

  return (
    <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100 font-sans">
      <div className="mx-auto max-w-9xl">

        {/* --- Header & Filters Panel --- */}
        <div className="p-3 mb-3 bg-white rounded-lg shadow-md">
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Header Title embedded in filter bar for space saving like AllExpensives */}
            <div className="flex items-center gap-2 pr-4 border-r border-gray-200 mr-2">
                <FaGift className="text-xl text-indigo-600" />
                <h1 className="text-sm font-bold tracking-widest text-gray-800 uppercase">Occasions</h1>
            </div>

            {/* Search */}
            <div className="relative flex-1 min-w-[180px]">
              <FaSearch className="absolute text-sm text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
              <input
                type="text"
                placeholder="Search employee or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <FaTimes
                  className="absolute text-[12px] text-gray-400 transform -translate-y-1/2 cursor-pointer right-2 top-1/2 hover:text-red-500"
                  onClick={() => setSearchQuery("")}
                />
              )}
            </div>

            {/* Month Filter */}
            <div className="relative w-[140px]">
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="w-full pl-3 pr-6 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 appearance-none bg-white text-gray-700"
              >
                <option value="">All Months</option>
                {[...Array(12).keys()].map(i => (
                    <option key={i} value={i}>{getMonthName(i)}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
                <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
              </div>
            </div>

            {/* Type Filter */}
            <div className="relative w-[160px]">
              <select
                value={occasionTypeFilter}
                onChange={(e) => setOccasionTypeFilter(e.target.value)}
                className="w-full pl-3 pr-6 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 appearance-none bg-white text-gray-700"
              >
                <option value="all">All Occasions</option>
                <option value="birthday">Birthdays Only</option>
                <option value="anniversary">Work Anniversaries</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
                <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
              </div>
            </div>

            {/* Stats Summary Bubble */}
            <div className="flex items-center gap-2 border border-blue-200 bg-blue-50 rounded-lg px-3 h-[30px]">
              <span className="text-[10px] font-bold text-blue-600 uppercase">Found:</span>
              <span className="text-xs font-black text-blue-700 tabular-nums">{filteredRecords.length} Events</span>
            </div>

            {/* Sync Button */}
            <button
              onClick={() => {
                setSearchQuery('');
                setMonthFilter('');
                setOccasionTypeFilter('all');
                fetchOccasions();
              }}
              className="h-8 px-3 text-xs font-medium text-gray-600 transition bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 flex items-center gap-1 cursor-pointer"
            >
              <FaSync className={`text-[10px] ${loading ? 'animate-spin' : ''}`} /> Sync
            </button>
          </div>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-xs font-bold">{error}</div>}

        {/* --- Main Table Area --- */}
        <div className="mb-6 overflow-hidden bg-white rounded-lg shadow-lg">
          <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
            <table className="min-w-full">
              {/* Sleek Gradient Header matching AllExpensives */}
              <thead className="text-sm text-left text-white bg-gradient-to-r from-indigo-500 to-purple-600">
                <tr>
                  <th className="py-3 px-4 text-left">EMPLOYEE</th>
                  <th className="py-3 px-4 text-center">ROLE</th>
                  <th className="py-3 px-4 text-center">OCCASION TYPE</th>
                  <th className="py-3 px-4 text-center">DATE</th>
                  <th className="py-3 px-4 text-center">ACTION</th>
                </tr>
              </thead>
              
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && occasions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-2 py-2 text-center">
                      <div className="flex items-center justify-center py-10">
                        <div className="w-8 h-8 border-b-2 border-indigo-600 rounded-full animate-spin"></div>
                        <span className="ml-2 text-xs font-bold text-gray-400 tracking-widest">
                          FETCHING OCCASIONS...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-2 py-2 text-center">
                      <div className="py-10">
                        <FaGift className="text-gray-300 text-3xl mx-auto mb-2" />
                        <p className="text-gray-500 text-xs font-bold tracking-widest">NO OCCASIONS FOUND</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((occ) => (
                    <tr
                      key={occ.id}
                      className={`transition-colors hover:bg-gray-50 group ${occ.isToday ? 'bg-orange-50/30' : ''}`}
                    >
                      <td className="px-4 py-3 text-left whitespace-nowrap">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm ${
                                occ.type === 'birthday' 
                                  ? 'bg-rose-100 text-rose-600 border border-rose-200' 
                                  : 'bg-amber-100 text-amber-600 border border-amber-200'
                            }`}>
                                {occ.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-gray-900 flex items-center gap-2">
                                    {occ.name}
                                    {occ.isToday && <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-orange-500 text-white animate-pulse">TODAY</span>}
                                </span>
                                <span className="text-[10px] text-gray-500 font-medium tracking-wide">
                                    ID: {occ.employeeId}
                                </span>
                            </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          {occ.role}
                        </span>
                      </td>
                      
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        {occ.type === 'birthday' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
                                <FaBirthdayCake className="text-rose-400" /> Birthday
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
                                <FaAward className="text-amber-400" /> {getOrdinalSuffix(occ.years)} Work Anniv
                            </span>
                        )}
                      </td>
                      
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center">
                            <span className="text-sm font-bold text-gray-900">
                                {occ.originalDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                            </span>
                            {occ.type === 'anniversary' && (
                                <span className="text-[10px] text-gray-400 font-medium">
                                    Since {occ.originalDate.getFullYear()}
                                </span>
                            )}
                        </div>
                      </td>
                      
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <button
                          className="text-indigo-600 hover:text-indigo-800 transition flex items-center justify-center gap-1 font-bold text-[11px] uppercase tracking-wider group/btn mx-auto bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 border border-indigo-100 shadow-sm"
                          onClick={() => alert(`Celebration feature for ${occ.name} is coming soon!`)}
                        >
                          <FaGift className="group-hover/btn:scale-110 transition-transform" /> Send Wish
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-in { animation-duration: 300ms; animation-fill-mode: both; }
        .fade-in { animation-name: fade-in; }
      `}</style>
    </div>
  );
};

export default Occasions;