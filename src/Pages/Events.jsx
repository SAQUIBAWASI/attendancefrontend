import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiCalendar, FiGift, FiClock, FiActivity, FiUsers, FiFilter } from 'react-icons/fi';
import { FaSearch, FaCalendarAlt, FaBuilding } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import "../index.css";
import "./EmployeeDashboard.css";
import "./EmployeeLeaves.css";

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

const Events = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://api.timelyhealth.in/api/employees/get-employees');
      const data = response.data || [];
      processEvents(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const processEvents = (employeeList) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcomingEvents = [];

    employeeList.forEach(emp => {
      const empName = emp.name || emp.fullName || 'Unknown';
      const empId = emp.employeeId || emp._id || '';
      const dept = emp.department || 'N/A';

      // ── Birthday Logic ──
      if (emp.dob) {
        const dob = parseDate(emp.dob);
        if (dob) {
          let bdayThisYear = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
          // If already passed this year, use next year
          if (bdayThisYear < today) {
            bdayThisYear = new Date(today.getFullYear() + 1, dob.getMonth(), dob.getDate());
          }
          const diffDays = Math.ceil((bdayThisYear - today) / (1000 * 60 * 60 * 24));
          upcomingEvents.push({
            id: `bday-${emp._id || empId}`,
            empId,
            name: empName,
            dept,
            type: 'Birthday',
            date: bdayThisYear,
            daysRemaining: diffDays,
            originalDate: dob,
            milestone: null,
          });
        }
      }

      // ── Work Anniversary Logic ──
      // API uses 'joinDate' field
      const joinDateStr = emp.joinDate || emp.joiningDate;
      if (joinDateStr) {
        const joinDate = parseDate(joinDateStr);
        if (joinDate && joinDate.getFullYear() < today.getFullYear()) {
          let anniversaryThisYear = new Date(today.getFullYear(), joinDate.getMonth(), joinDate.getDate());
          if (anniversaryThisYear < today) {
            anniversaryThisYear = new Date(today.getFullYear() + 1, joinDate.getMonth(), joinDate.getDate());
          }
          const diffDays = Math.ceil((anniversaryThisYear - today) / (1000 * 60 * 60 * 24));
          const years = anniversaryThisYear.getFullYear() - joinDate.getFullYear();
          upcomingEvents.push({
            id: `anniv-${emp._id || empId}`,
            empId,
            name: empName,
            dept,
            type: 'Work Anniversary',
            date: anniversaryThisYear,
            daysRemaining: diffDays,
            originalDate: joinDate,
            milestone: years,
          });
        }
      }
    });

    // Sort by days remaining (soonest first)
    upcomingEvents.sort((a, b) => a.daysRemaining - b.daysRemaining);
    setEvents(upcomingEvents);
    setFilteredEvents(upcomingEvents);
  };

  useEffect(() => {
    let result = [...events];
    if (activeTab === 'Birthdays') result = result.filter(e => e.type === 'Birthday');
    else if (activeTab === 'Anniversaries') result = result.filter(e => e.type === 'Work Anniversary');
    if (selectedMonth) {
      const [year, monthNum] = selectedMonth.split('-').map(Number);
      result = result.filter(e => e.date.getMonth() + 1 === monthNum);
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(e =>
        e.name.toLowerCase().includes(q) ||
        (e.empId && String(e.empId).toLowerCase().includes(q))
      );
    }
    setFilteredEvents(result);
  }, [searchTerm, activeTab, selectedMonth, events]);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const birthdayCount = events.filter(e => e.type === 'Birthday').length;
  const anniversaryCount = events.filter(e => e.type === 'Work Anniversary').length;

  return (
    <div className="emp-dash">
      <main className="p-4 sm:p-6 lg:p-8">

        {/* Dashboard Header */}
        <div className="emp-dash__header">
          <div>
            <h1 className="emp-dash__greeting">
              Upcoming <span>Events</span>
            </h1>
            <p className="emp-dash__subtitle">
              Monitor upcoming birthdays, work anniversaries, and milestones.
            </p>
          </div>
          <div className="emp-dash__date-pill">
            <FiCalendar />
            <span>
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Top KPI Stats Grid */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6">
            <div className="emp-dash__stat">
              <div className="emp-dash__stat-top">
                <span className="emp-dash__stat-label">Birthdays Upcoming</span>
                <div className="emp-dash__stat-icon emp-dash__stat-icon--absent">
                  <FiGift className="text-rose-500" />
                </div>
              </div>
              <div className="emp-dash__stat-value">{birthdayCount}</div>
              <div className="emp-dash__stat-meta">next 365 days</div>
            </div>

            <div className="emp-dash__stat">
              <div className="emp-dash__stat-top">
                <span className="emp-dash__stat-label">Anniversaries Upcoming</span>
                <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                  <FiCalendar className="text-amber-500" />
                </div>
              </div>
              <div className="emp-dash__stat-value">{anniversaryCount}</div>
              <div className="emp-dash__stat-meta">next 365 days</div>
            </div>

            <div className="emp-dash__stat">
              <div className="emp-dash__stat-top">
                <span className="emp-dash__stat-label">Total Events</span>
                <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                  <FiActivity className="text-blue-500" />
                </div>
              </div>
              <div className="emp-dash__stat-value">{events.length}</div>
              <div className="emp-dash__stat-meta">upcoming celebrations</div>
            </div>
          </div>
        )}

        {/* Filters Card */}
        <div className="emp-dash__card mb-6">
          <div className="emp-dash__card-header">
            <div>
              <h3 className="emp-dash__card-title flex items-center gap-2">
                <FiFilter className="text-blue-600" /> Filter Events
              </h3>
              {/* <p className="emp-dash__card-desc">Search by employee name/ID, filter by occasion, or select a specific month</p> */}
            </div>
          </div>
          <div className="emp-dash__card-body bg-gray-50/50">
            <div className="flex flex-wrap items-center gap-4">
              {/* Search */}
              <div className="flex-1 min-w-[240px]">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <FaSearch className="text-xs" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search by name or employee ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Tabs */}
              <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                {['All', 'Birthdays', 'Anniversaries'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      activeTab === tab
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Month Filter */}
              <div className="relative w-[150px]">
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {selectedMonth && (
                <button
                  onClick={() => setSelectedMonth('')}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear Month
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Events Table / Card Container */}
        <div className="emp-dash__card mb-6">
          
          {/* Desktop Table View */}
          <div className="emp-dash__table-wrap">
            <table className="emp-dash__table">
              <thead>
                <tr>
                  <th className="text-center w-12">#</th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Occasion</th>
                  <th className="text-center">Date</th>
                  <th className="text-center">Countdown</th>
                  <th className="text-right">Wish</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-10 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="emp-dash__spinner"></div>
                        <span className="text-sm font-medium text-gray-500">Loading upcoming events...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FiCalendar className="text-4xl text-gray-300" />
                        <p className="text-gray-500 font-medium">No upcoming events found</p>
                        <p className="text-gray-400 text-xs">Try switching tabs or clearing your search</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence>
                    {filteredEvents.map((event, index) => (
                      <motion.tr
                        key={event.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(index * 0.03, 0.5) }}
                        className="hover:bg-gray-55/60 transition-all group"
                      >
                        {/* Row Number */}
                        <td className="text-center font-bold text-gray-400 whitespace-nowrap">
                          {index + 1}
                        </td>

                        {/* Employee */}
                        <td className="whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                              event.type === 'Birthday' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                            }`}>
                              {event.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {event.name}
                              </span>
                              <span className="text-[10px] text-gray-400 font-medium">
                                {event.empId || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Department */}
                        <td className="whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <FaBuilding className="text-[10px]" />
                            <span className="font-medium">{event.dept}</span>
                          </div>
                        </td>

                        {/* Occasion */}
                        <td className="whitespace-nowrap">
                          <div className="flex flex-col items-start gap-1">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              event.type === 'Birthday'
                                ? 'bg-rose-50 text-rose-700 border border-rose-100'
                                : 'bg-amber-50 text-amber-700 border border-amber-100'
                            }`}>
                              {event.type === 'Birthday' ? '🎂 Birthday' : '🏆 Anniversary'}
                            </span>
                            {event.milestone && (
                              <span className="text-[10px] font-semibold text-blue-600 ml-1">
                                {event.milestone} Year{event.milestone > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Date */}
                        <td className="text-center whitespace-nowrap">
                          <div className="flex flex-col items-center">
                            <span className="font-bold text-gray-800">
                              {formatDate(event.date)}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              Since {new Date(event.originalDate).getFullYear()}
                            </span>
                          </div>
                        </td>

                        {/* Countdown */}
                        <td className="text-center whitespace-nowrap">
                          {event.daysRemaining === 0 ? (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-xs font-bold text-green-700 uppercase">Today! 🎉</span>
                            </div>
                          ) : event.daysRemaining <= 7 ? (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 border border-orange-200 rounded-full">
                              <FiClock className="text-orange-500 text-[10px]" />
                              <span className="text-xs font-bold text-orange-600">In {event.daysRemaining} days</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 text-gray-500">
                              <FiClock className="text-[10px]" />
                              <span className="text-xs font-medium">In {event.daysRemaining} days</span>
                            </div>
                          )}
                        </td>

                        {/* Wish Button */}
                        <td className="text-right whitespace-nowrap">
                          <button className={`p-2 rounded-lg transition-all transform hover:scale-110 shadow-sm border ${
                            event.type === 'Birthday'
                              ? 'bg-rose-500 text-white hover:bg-rose-600 border-rose-400'
                              : 'bg-amber-500 text-white hover:bg-amber-600 border-amber-400'
                          }`}
                          title={`Send wish to ${event.name}`}
                          >
                            <FiGift className="text-sm" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="emp-dash__mobile-list divide-y divide-gray-100">
            {loading ? (
              <div className="py-10 text-center">
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="emp-dash__spinner"></div>
                  <span className="text-sm font-medium text-gray-500">Loading upcoming events...</span>
                </div>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="py-12 text-center text-gray-500 font-medium">
                No upcoming events found
              </div>
            ) : (
              filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-4 hover:bg-gray-55/60 transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        event.type === 'Birthday' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {event.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{event.name}</h4>
                        <span className="text-xs text-gray-500">{event.empId || 'N/A'}</span>
                      </div>
                    </div>
                    
                    <button className={`p-2 rounded-lg transition-all shadow-sm border ${
                      event.type === 'Birthday'
                        ? 'bg-rose-500 text-white hover:bg-rose-600 border-rose-400'
                        : 'bg-amber-500 text-white hover:bg-amber-600 border-amber-400'
                    }`}
                    title={`Send wish to ${event.name}`}
                    >
                      <FiGift className="text-xs" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mb-3 text-gray-600">
                    <div><span className="text-gray-400">Dept:</span> {event.dept}</div>
                    <div>
                      <span className="text-gray-400">Occasion:</span>{' '}
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        event.type === 'Birthday'
                          ? 'bg-rose-50 text-rose-700 border border-rose-100'
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {event.type === 'Birthday' ? '🎂 Birthday' : '🏆 Anniversary'}
                      </span>
                      {event.milestone && (
                        <span className="ml-1 text-[9px] font-semibold text-blue-600">
                          ({event.milestone} Yr{event.milestone > 1 ? 's' : ''})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <span className="text-gray-400">Date:</span>{' '}
                      <span className="font-semibold text-gray-800">{formatDate(event.date)}</span>
                      <span className="text-[10px] text-gray-400 ml-1">
                        (Since {new Date(event.originalDate).getFullYear()})
                      </span>
                    </div>
                    <div>
                      {event.daysRemaining === 0 ? (
                        <span className="px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-200 font-bold uppercase text-[9px]">Today! 🎉</span>
                      ) : event.daysRemaining <= 7 ? (
                        <span className="px-2 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200 font-bold text-[9px]">In {event.daysRemaining} days</span>
                      ) : (
                        <span className="text-gray-500 text-[10px]">In {event.daysRemaining} days</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {!loading && filteredEvents.length > 0 && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs font-semibold text-gray-500">
                Showing <span className="text-gray-900 font-bold">{filteredEvents.length}</span> upcoming events
              </p>
              <div className="flex items-center gap-3 text-[10px] font-semibold text-gray-400">
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-rose-400 rounded-full"></span> Birthdays</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-400 rounded-full"></span> Anniversaries</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-400 rounded-full"></span> Today</span>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Events;