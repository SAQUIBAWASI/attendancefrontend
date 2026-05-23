import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiCalendar, FiGift, FiClock } from 'react-icons/fi';
import { FaSearch, FaCalendarAlt, FaBuilding } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="mx-auto max-w-9xl">

        {/* Stats Strip */}
        {!loading && (
          <div className="flex flex-wrap gap-3 mb-3">
            <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-100 text-xs font-semibold text-gray-600">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block"></span>
              {birthdayCount} Birthdays upcoming
            </div>
            <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-100 text-xs font-semibold text-gray-600">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
              {anniversaryCount} Work Anniversaries upcoming
            </div>
            <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-100 text-xs font-semibold text-gray-600">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block"></span>
              {events.length} Total Events
            </div>
          </div>
        )}

        {/* Filters Bar */}
        <div className="p-3 mb-3 bg-white rounded-lg shadow-md">
          <div className="flex flex-wrap items-center gap-4">

            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <FaSearch className="absolute text-sm text-gray-500 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                placeholder="Search by name or employee ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Tabs */}
            <div className="flex bg-gray-100 p-1 rounded-lg">
              {['All', 'Birthdays', 'Anniversaries'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
                    activeTab === tab
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Month Filter */}
            <div className="relative w-[130px]">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 pointer-events-none">
                Month:
              </span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full pl-12 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500"
              />
            </div>
            {selectedMonth && (
              <button
                onClick={() => setSelectedMonth('')}
                className="h-9 px-3 text-xs font-medium text-gray-500 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear Month
              </button>
            )}

            {/* Month Info */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
              <FaCalendarAlt className="text-blue-500" />
              {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Events Table */}
        <div className="mb-6 overflow-hidden bg-white rounded-lg shadow-lg">
          <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
            <table className="min-w-full">
              <thead className="text-xs text-left bg-gradient-to-r from-green-500 to-blue-600">
                <tr>
                  <th className="px-4 py-3 text-center uppercase tracking-wider font-semibold text-white">#</th>
                  <th className="px-4 py-3 text-center uppercase tracking-wider font-semibold text-white">Employee</th>
                  <th className="px-4 py-3 text-center uppercase tracking-wider font-semibold text-white">Department</th>
                  <th className="px-4 py-3 text-center uppercase tracking-wider font-semibold text-white">Occasion</th>
                  <th className="px-4 py-3 text-center uppercase tracking-wider font-semibold text-white">Date</th>
                  <th className="px-4 py-3 text-center uppercase tracking-wider font-semibold text-white">Countdown</th>
                  <th className="px-4 py-3 text-center uppercase tracking-wider font-semibold text-white">Wish</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-10 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm font-medium text-gray-500">Loading upcoming events...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
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
                        className="transition-colors hover:bg-gray-50 group"
                      >
                        {/* Row Number */}
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <span className="text-xs font-bold text-gray-400">{index + 1}</span>
                        </td>

                        {/* Employee */}
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                              event.type === 'Birthday' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                            }`}>
                              {event.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col items-start">
                              <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {event.name}
                              </span>
                              <span className="text-[10px] text-gray-400 font-medium">
                                {event.empId || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Department */}
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <FaBuilding className="text-gray-400 text-[10px]" />
                            <span className="text-xs font-medium text-gray-600">{event.dept}</span>
                          </div>
                        </td>

                        {/* Occasion */}
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <div className="flex flex-col items-center gap-1">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              event.type === 'Birthday'
                                ? 'bg-rose-50 text-rose-700 border border-rose-100'
                                : 'bg-amber-50 text-amber-700 border border-amber-100'
                            }`}>
                              {event.type === 'Birthday' ? '🎂 Birthday' : '🏆 Work Anniversary'}
                            </span>
                            {event.milestone && (
                              <span className="text-[10px] font-semibold text-blue-600">
                                {event.milestone} Year{event.milestone > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <div className="flex flex-col items-center">
                            <span className="text-sm font-bold text-gray-800">
                              {formatDate(event.date)}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              Since {new Date(event.originalDate).getFullYear()}
                            </span>
                          </div>
                        </td>

                        {/* Countdown */}
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          {event.daysRemaining === 0 ? (
                            <div className="flex items-center justify-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-xs font-bold text-green-700 uppercase">Today! 🎉</span>
                            </div>
                          ) : event.daysRemaining <= 7 ? (
                            <div className="flex items-center justify-center gap-1.5 px-3 py-1 bg-orange-50 border border-orange-200 rounded-full">
                              <FiClock className="text-orange-500 text-[10px]" />
                              <span className="text-xs font-bold text-orange-600">In {event.daysRemaining} days</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1.5 text-gray-500">
                              <FiClock className="text-[10px]" />
                              <span className="text-xs font-medium">In {event.daysRemaining} days</span>
                            </div>
                          )}
                        </td>

                        {/* Wish Button */}
                        <td className="px-4 py-3 text-center whitespace-nowrap">
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

          {/* Footer */}
          {!loading && filteredEvents.length > 0 && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs font-medium text-gray-500">
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
      </div>
    </div>
  );
};

export default Events;