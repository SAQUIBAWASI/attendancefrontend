import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  FiCalendar, FiGift, FiClock, FiActivity, FiFilter, FiTrash2,
  FiPlus, FiEdit2, FiX, FiCheck, FiRepeat, FiBell, FiGrid,
  FiList, FiTrendingUp, FiAward, FiSmile
} from 'react-icons/fi';
import {
  FaSearch, FaTimes, FaChevronDown, FaChevronUp
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../config';
import '../index.css';
import './EmployeeDashboard.css';
import './EmployeeLeaves.css';

// API Service with local fallback for offline/resilience
const API_URL = `${API_BASE_URL}/events`;

const getLocalEvents = (userId) => {
  try {
    const raw = localStorage.getItem(`emp_events_${userId || 'guest'}`);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

const saveLocalEvents = (userId, events) => {
  try {
    localStorage.setItem(`emp_events_${userId || 'guest'}`, JSON.stringify(events));
  } catch (e) {
    console.error('Error saving events to storage:', e);
  }
};

const eventService = {
  getMyEvents: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/my-events/${userId}`);
      const data = response.data?.events || response.data?.data || response.data;
      if (Array.isArray(data)) {
        saveLocalEvents(userId, data);
        return data;
      }
      return getLocalEvents(userId);
    } catch (error) {
      console.warn('Backend events API unreachable, using local storage:', error.message);
      return getLocalEvents(userId);
    }
  },
  createEvent: async (eventData, userId) => {
    try {
      const response = await axios.post(API_URL, eventData);
      const newEvent = response.data?.event || response.data?.data || response.data;
      if (newEvent && newEvent._id) {
        const local = getLocalEvents(userId);
        saveLocalEvents(userId, [newEvent, ...local]);
        return newEvent;
      }
    } catch (error) {
      console.warn('Backend create event failed, saving locally:', error.message);
    }
    const fallbackEvent = {
      ...eventData,
      _id: 'evt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      createdAt: new Date().toISOString()
    };
    const local = getLocalEvents(userId);
    saveLocalEvents(userId, [fallbackEvent, ...local]);
    return fallbackEvent;
  },
  updateEvent: async (id, eventData, userId) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, eventData);
      const updated = response.data?.event || response.data?.data || response.data;
      if (updated) {
        const local = getLocalEvents(userId).map(e => e._id === id ? updated : e);
        saveLocalEvents(userId, local);
        return updated;
      }
    } catch (error) {
      console.warn('Backend update event failed, updating locally:', error.message);
    }
    const updated = { ...eventData, _id: id };
    const local = getLocalEvents(userId).map(e => e._id === id ? updated : e);
    saveLocalEvents(userId, local);
    return updated;
  },
  deleteEvent: async (id, userId) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
    } catch (error) {
      console.warn('Backend delete event failed, deleting locally:', error.message);
    }
    const local = getLocalEvents(userId).filter(e => e._id !== id);
    saveLocalEvents(userId, local);
    return true;
  }
};

// Date helpers
const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const getDaysRemaining = (dateStr) => {
  if (!dateStr) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(dateStr);
  eventDate.setHours(0, 0, 0, 0);
  const diffTime = eventDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Event categories metadata
const EVENT_CATEGORIES = [
  { value: 'birthday', label: 'Birthday', icon: '🎂', badgeClass: 'bg-rose-50 text-rose-700 border-rose-100', avatarBg: 'bg-rose-100 text-rose-600' },
  { value: 'anniversary', label: 'Anniversary', icon: '💑', badgeClass: 'bg-amber-50 text-amber-700 border-amber-100', avatarBg: 'bg-amber-100 text-amber-600' },
  { value: 'achievement', label: 'Achievement', icon: '🏆', badgeClass: 'bg-yellow-50 text-yellow-700 border-yellow-100', avatarBg: 'bg-yellow-100 text-yellow-600' },
  { value: 'appointment', label: 'Appointment', icon: '📅', badgeClass: 'bg-blue-50 text-blue-700 border-blue-100', avatarBg: 'bg-blue-100 text-blue-600' },
  { value: 'vacation', label: 'Vacation', icon: '✈️', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-100', avatarBg: 'bg-emerald-100 text-emerald-600' },
  { value: 'exam', label: 'Exam', icon: '📚', badgeClass: 'bg-purple-50 text-purple-700 border-purple-100', avatarBg: 'bg-purple-100 text-purple-600' },
  { value: 'other', label: 'Other', icon: '📌', badgeClass: 'bg-gray-50 text-gray-700 border-gray-100', avatarBg: 'bg-gray-100 text-gray-600' }
];

const getCategoryConfig = (type) => {
  return EVENT_CATEGORIES.find(c => c.value === type) || EVENT_CATEGORIES[6];
};

// ============================================
// MODAL EVENT FORM COMPONENT
// ============================================
const EventForm = ({ event, onSubmit, onCancel, userId, userRole }) => {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    eventType: event?.eventType || 'birthday',
    date: event?.date ? new Date(event.date).toISOString().split('T')[0] : '',
    reminderBefore: event?.reminderBefore ?? 1,
    repeat: event?.repeat || 'none',
    notes: event?.notes || ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reminderOptions = [
    { value: 0, label: 'Same Day' },
    { value: 1, label: '1 Day Before' },
    { value: 2, label: '2 Days Before' },
    { value: 3, label: '3 Days Before' },
    { value: 7, label: '1 Week Before' },
    { value: 14, label: '2 Weeks Before' },
    { value: 30, label: '1 Month Before' }
  ];

  const repeatOptions = [
    { value: 'none', label: 'No Repeat' },
    { value: 'yearly', label: 'Yearly' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.date) newErrors.date = 'Date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      try {
        const submitData = {
          ...formData,
          userId: userId,
          userRole: userRole || 'employee',
          ...(event?._id && { id: event._id })
        };
        await onSubmit(submitData);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      {/* Title */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Event Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., Annual Team Meet, Mom's Birthday, Project Launch..."
          className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
            errors.title ? 'border-red-400 bg-red-50/20' : 'border-gray-300'
          }`}
        />
        {errors.title && <span className="text-[11px] text-red-500 mt-1 block">{errors.title}</span>}
      </div>

      {/* Type & Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            name="eventType"
            value={formData.eventType}
            onChange={handleChange}
            className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            {EVENT_CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Event Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
              errors.date ? 'border-red-400 bg-red-50/20' : 'border-gray-300'
            }`}
          />
          {errors.date && <span className="text-[11px] text-red-500 mt-1 block">{errors.date}</span>}
        </div>
      </div>

      {/* Reminder & Repeat */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            ⏰ Reminder
          </label>
          <select
            name="reminderBefore"
            value={formData.reminderBefore}
            onChange={handleChange}
            className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            {reminderOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            🔄 Recurrence
          </label>
          <select
            name="repeat"
            value={formData.repeat}
            onChange={handleChange}
            className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            {repeatOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          📝 Notes / Description
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Add any reminders, venue, or details..."
          rows="3"
          className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
        />
      </div>

      {/* Form Buttons */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : event ? (
            <><FiEdit2 className="w-3.5 h-3.5" /> Update Event</>
          ) : (
            <><FiPlus className="w-3.5 h-3.5" /> Save Event</>
          )}
        </button>
      </div>
    </form>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
const EmployeeEvents = ({ userId: propUserId, userRole: propUserRole }) => {
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState('employee');
  const [displayId, setDisplayId] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'upcoming', 'today', 'completed'
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  // Resolve user identification
  useEffect(() => {
    const initUser = async () => {
      const resolvedRole = propUserRole || localStorage.getItem('userRole') || 'employee';
      setUserRole(resolvedRole);

      const resolvedDisplayId = resolvedRole === 'admin'
        ? (localStorage.getItem('adminName') || localStorage.getItem('adminEmail') || 'Admin')
        : (localStorage.getItem('employeeId') || '');
      setDisplayId(resolvedDisplayId);

      let resolvedUserId = propUserId || localStorage.getItem('userId');

      if (!resolvedUserId) {
        if (resolvedRole === 'admin') {
          resolvedUserId = localStorage.getItem('adminId');
        } else {
          try {
            const empData = JSON.parse(localStorage.getItem('employeeData')) || {};
            resolvedUserId = empData._id || empData.id;
            if (!resolvedUserId) {
              const uData = JSON.parse(localStorage.getItem('userData')) || {};
              resolvedUserId = uData._id || uData.id;
            }
          } catch (e) {
            console.error('Error parsing employee/user data:', e);
          }

          if (!resolvedUserId) {
            const email = localStorage.getItem('employeeEmail');
            if (email) {
              try {
                const res = await axios.get(`${API_BASE_URL}/employees/get-employee?email=${email}`);
                if (res.data && res.data.success && res.data.data) {
                  resolvedUserId = res.data.data._id || res.data.data.id;
                  if (resolvedUserId) {
                    localStorage.setItem('userId', resolvedUserId);
                  }
                }
              } catch (err) {
                console.error('Failed to get employee ID:', err);
              }
            }
          }
        }
      }

      if (resolvedUserId) {
        setUserId(resolvedUserId);
      } else {
        // Use default fallback ID for guests or local session
        setUserId('emp_default');
      }
    };

    initUser();
  }, [propUserId, propUserRole]);

  // Fetch events
  useEffect(() => {
    if (userId) {
      fetchEvents();
    }
  }, [userId]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const list = await eventService.getMyEvents(userId);
      setEvents(list || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (eventData) => {
    try {
      const newEvent = await eventService.createEvent(eventData, userId);
      if (newEvent) {
        setEvents(prev => [newEvent, ...prev]);
      }
      setShowModal(false);
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to save event');
    }
  };

  const handleUpdateEvent = async (eventData) => {
    try {
      const { id, ...updateData } = eventData;
      const updatedEvent = await eventService.updateEvent(id, updateData, userId);
      if (updatedEvent) {
        setEvents(prev => prev.map(e => e._id === id ? updatedEvent : e));
      }
      setShowModal(false);
      setEditingEvent(null);
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Failed to update event');
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await eventService.deleteEvent(id, userId);
      setEvents(prev => prev.filter(e => e._id !== id));
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = events.length;
    const todayCount = events.filter(e => getDaysRemaining(e.date) === 0).length;
    const upcomingCount = events.filter(e => getDaysRemaining(e.date) > 0).length;
    const completedCount = events.filter(e => getDaysRemaining(e.date) < 0).length;
    return { total, today: todayCount, upcoming: upcomingCount, completed: completedCount };
  }, [events]);

  // Card filter click handler
  const handleStatCardClick = (status) => {
    setStatusFilter(prev => prev === status ? 'all' : status);
  };

  // Filtered & Sorted events
  const filteredEvents = useMemo(() => {
    let result = [...events];

    // Status filter
    if (statusFilter === 'upcoming') {
      result = result.filter(e => getDaysRemaining(e.date) > 0);
    } else if (statusFilter === 'today') {
      result = result.filter(e => getDaysRemaining(e.date) === 0);
    } else if (statusFilter === 'completed') {
      result = result.filter(e => getDaysRemaining(e.date) < 0);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(e => e.eventType === selectedCategory);
    }

    // Month filter
    if (selectedMonth) {
      const [year, monthNum] = selectedMonth.split('-').map(Number);
      result = result.filter(e => {
        if (!e.date) return false;
        const d = new Date(e.date);
        return d.getFullYear() === year && d.getMonth() + 1 === monthNum;
      });
    }

    // Search term
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(e =>
        (e.title && e.title.toLowerCase().includes(q)) ||
        (e.notes && e.notes.toLowerCase().includes(q)) ||
        (e.eventType && e.eventType.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sortBy === 'date') {
      result.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortBy === 'title') {
      result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }

    return result;
  }, [events, statusFilter, selectedCategory, selectedMonth, searchTerm, sortBy]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedMonth('');
    setStatusFilter('all');
    setSortBy('date');
    if (window.innerWidth < 640) {
      setShowMobileFilters(false);
    }
  };

  const isFilterActive = searchTerm || selectedCategory !== 'all' || selectedMonth || statusFilter !== 'all';

  // Render status / countdown pill
  const renderCountdownBadge = (days) => {
    if (days === 0) {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-green-50 border border-green-200 rounded-full">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-bold text-green-700 uppercase tracking-wide">Today! 🎉</span>
        </div>
      );
    }
    if (days > 0 && days <= 7) {
      return (
        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-orange-50 border border-orange-200 rounded-full">
          <FiClock className="text-orange-500 text-[10px]" />
          <span className="text-[10px] font-bold text-orange-600">In {days} day{days > 1 ? 's' : ''}</span>
        </div>
      );
    }
    if (days > 7) {
      return (
        <div className="inline-flex items-center gap-1 text-gray-500">
          <FiClock className="text-[10px]" />
          <span className="text-xs font-medium">In {days} days</span>
        </div>
      );
    }
    return (
      <div className="inline-flex items-center gap-1 text-gray-400">
        <FiClock className="text-[10px]" />
        <span className="text-xs font-normal">{Math.abs(days)}d ago</span>
      </div>
    );
  };

  return (
    <div className="emp-dash">
      <main className="p-2 sm:p-4 lg:p-6">

        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between gap-3 flex-wrap mb-4">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap">
              My <span>Events</span>
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {userRole.toUpperCase()} {displayId ? `• ${displayId}` : ''}
            </span>
          </div>

          {/* Right Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative min-w-[140px]">
              <span className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FaSearch className="text-[10px]" />
              </span>
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-[140px] pl-7 pr-6 py-1.5 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="text-[10px]" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex bg-gray-100 p-0.5 rounded-lg h-8">
              {[
                { value: 'all', label: 'All' },
                { value: 'birthday', label: '🎂 Bday' },
                { value: 'anniversary', label: '💑 Anniv' },
                { value: 'achievement', label: '🏆 Achiev' },
                { value: 'vacation', label: '✈️ Trip' }
              ].map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-2 py-1 text-[10px] font-semibold rounded-md transition-all whitespace-nowrap ${
                    selectedCategory === cat.value
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Month Filter */}
            <div className="relative">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-[120px] h-8 px-2 py-1 text-xs border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-8 px-2 py-1 text-xs border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
            >
              <option value="date">📅 Date</option>
              <option value="title">🔤 Title</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 p-0.5 rounded-lg h-8">
              <button
                onClick={() => setViewMode('table')}
                title="Table View"
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <FiList className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                title="Grid View"
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <FiGrid className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Clear Filters */}
            {isFilterActive && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm whitespace-nowrap"
              >
                <FiTrash2 className="w-3 h-3" /> Clear
              </button>
            )}

            {/* Add Event Button */}
            <button
              onClick={() => {
                setEditingEvent(null);
                setShowModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all whitespace-nowrap"
            >
              <FiPlus className="w-3.5 h-3.5" /> Add Event
            </button>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between gap-2 flex-wrap mb-3">
          <div>
            <h1 className="text-base font-bold whitespace-nowrap">
              My <span className="text-blue-600">Events</span>
            </h1>
            <span className="text-[10px] text-gray-500">{userRole.toUpperCase()} {displayId ? `• ${displayId}` : ''}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingEvent(null);
                setShowModal(true);
              }}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
            >
              <FiPlus className="w-3.5 h-3.5" /> Add
            </button>
            <div className="emp-dash__date-pill text-[10px] px-2 py-1">
              <FiCalendar className="text-[10px]" />
              <span>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "short",
                  day: "numeric",
                  month: "short"
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Filters Toggle Drawer */}
        <div className="lg:hidden mb-3">
          <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-gray-200">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-700"
            >
              <FiFilter className="text-blue-600 text-base" />
              <span>Filters &amp; View</span>
              {showMobileFilters ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                <strong>{filteredEvents.length}</strong> events
              </span>
              <div className="flex bg-gray-100 p-0.5 rounded-lg">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1 rounded ${viewMode === 'table' ? 'bg-white text-blue-600' : 'text-gray-500'}`}
                >
                  <FiList className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1 rounded ${viewMode === 'grid' ? 'bg-white text-blue-600' : 'text-gray-500'}`}
                >
                  <FiGrid className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {showMobileFilters && (
            <div className="mt-2 p-4 bg-white rounded-xl border border-gray-200 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Search</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <FaSearch className="text-sm" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search by title, notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="all">All Categories</option>
                  {EVENT_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Month</label>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full px-2 py-2 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Sort</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-2 py-2 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="date">Date</option>
                    <option value="title">Title</option>
                  </select>
                </div>
              </div>

              {isFilterActive && (
                <div className="pt-2 border-t border-gray-200">
                  <button
                    onClick={clearFilters}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    <FiTrash2 className="w-4 h-4" /> Clear All Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Top KPI Stats Grid - 4 cards matching Events.jsx */}
        {!loading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
            {/* Total Events */}
            <div
              className={`emp-dash__stat cursor-pointer hover:shadow-md transition-all hover:scale-[1.02] ${
                statusFilter === 'all' && !isFilterActive ? 'ring-2 ring-blue-400 shadow-md' : ''
              }`}
              onClick={() => handleStatCardClick('all')}
            >
              <div className="emp-dash__stat-top">
                <span className="emp-dash__stat-label">Total Events</span>
                <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                  <FiActivity className="text-blue-500" />
                </div>
              </div>
              <div className="emp-dash__stat-value">{stats.total}</div>
              <div className="emp-dash__stat-meta">tap to see all 📋</div>
            </div>

            {/* Upcoming */}
            <div
              className={`emp-dash__stat cursor-pointer hover:shadow-md transition-all hover:scale-[1.02] ${
                statusFilter === 'upcoming' ? 'ring-2 ring-emerald-400 shadow-md' : ''
              }`}
              onClick={() => handleStatCardClick('upcoming')}
            >
              <div className="emp-dash__stat-top">
                <span className="emp-dash__stat-label">Upcoming</span>
                <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                  <FiClock className="text-emerald-500" />
                </div>
              </div>
              <div className="emp-dash__stat-value">{stats.upcoming}</div>
              <div className="emp-dash__stat-meta">tap to filter ⏳</div>
            </div>

            {/* Today */}
            <div
              className={`emp-dash__stat cursor-pointer hover:shadow-md transition-all hover:scale-[1.02] ${
                statusFilter === 'today' ? 'ring-2 ring-amber-400 shadow-md' : ''
              }`}
              onClick={() => handleStatCardClick('today')}
            >
              <div className="emp-dash__stat-top">
                <span className="emp-dash__stat-label">Today</span>
                <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                  <FiGift className="text-amber-500" />
                </div>
              </div>
              <div className="emp-dash__stat-value">{stats.today}</div>
              <div className="emp-dash__stat-meta">tap to filter 🎉</div>
            </div>

            {/* Past / Completed */}
            <div
              className={`emp-dash__stat cursor-pointer hover:shadow-md transition-all hover:scale-[1.02] ${
                statusFilter === 'completed' ? 'ring-2 ring-purple-400 shadow-md' : ''
              }`}
              onClick={() => handleStatCardClick('completed')}
            >
              <div className="emp-dash__stat-top">
                <span className="emp-dash__stat-label">Completed</span>
                <div className="emp-dash__stat-icon bg-purple-50 text-purple-600">
                  <FiAward className="text-purple-600" />
                </div>
              </div>
              <div className="emp-dash__stat-value">{stats.completed}</div>
              <div className="emp-dash__stat-meta">tap to filter 📜</div>
            </div>
          </div>
        )}

        {/* Active Filter Indicator */}
        {isFilterActive && (
          <div className="mb-4 flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xs">
            <span className="font-semibold text-blue-700">🔍 Filter active:</span>
            {statusFilter !== 'all' && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 capitalize">
                Status: {statusFilter}
              </span>
            )}
            {selectedCategory !== 'all' && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 capitalize">
                {getCategoryConfig(selectedCategory).icon} {selectedCategory}
              </span>
            )}
            {selectedMonth && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                Month: {selectedMonth}
              </span>
            )}
            {searchTerm && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-800">
                "{searchTerm}"
              </span>
            )}
            <button
              onClick={clearFilters}
              className="ml-auto text-blue-600 hover:text-blue-800 font-semibold"
            >
              Reset Filters ✕
            </button>
          </div>
        )}

        {/* Main Content Card Container */}
        <div className="emp-dash__card mb-6">
          {loading ? (
            <div className="py-14 text-center">
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="emp-dash__spinner"></div>
                <span className="text-sm font-medium text-gray-500">Loading your events...</span>
              </div>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="py-14 text-center">
              <div className="flex flex-col items-center justify-center gap-3 max-w-sm mx-auto px-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 text-xl">
                  <FiCalendar />
                </div>
                <h3 className="text-base font-semibold text-gray-800">No events found</h3>
                <p className="text-xs text-gray-500">
                  {isFilterActive
                    ? 'No events match your current filter settings. Try resetting filters or search.'
                    : 'You have not added any personal events yet. Create your first event to keep track!'}
                </p>
                {isFilterActive ? (
                  <button
                    onClick={clearFilters}
                    className="mt-1 px-3.5 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    Clear Filters
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditingEvent(null);
                      setShowModal(true);
                    }}
                    className="mt-1 flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
                  >
                    <FiPlus className="w-4 h-4" /> Add Your First Event
                  </button>
                )}
              </div>
            </div>
          ) : viewMode === 'table' ? (
            /* ================= DESKTOP & MOBILE TABLE VIEW ================= */
            <div className="emp-dash__table-wrap">
              <table className="emp-dash__table">
                <thead>
                  <tr>
                    <th className="text-center w-12">S.No</th>
                    <th>Event Details</th>
                    <th>Category</th>
                    <th className="text-center">Event Date</th>
                    <th className="text-center">Countdown</th>
                    <th>Reminder &amp; Repeat</th>
                    <th>Notes</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredEvents.map((event, index) => {
                      const config = getCategoryConfig(event.eventType);
                      const days = getDaysRemaining(event.date);

                      return (
                        <motion.tr
                          key={event._id || index}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: Math.min(index * 0.02, 0.3) }}
                          className="hover:bg-gray-50/70 transition-all group"
                        >
                          {/* S.No */}
                          <td className="text-center font-bold text-gray-400 whitespace-nowrap">
                            {index + 1}
                          </td>

                          {/* Event Details */}
                          <td className="whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-sm ${config.avatarBg}`}>
                                {config.icon}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                  {event.title}
                                </span>
                                {event.notes && (
                                  <span className="text-[10px] text-gray-400 font-normal line-clamp-1 max-w-[220px]">
                                    {event.notes}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Category Badge */}
                          <td className="whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${config.badgeClass}`}>
                              <span>{config.icon}</span>
                              <span>{config.label}</span>
                            </span>
                          </td>

                          {/* Date */}
                          <td className="text-center whitespace-nowrap">
                            <div className="flex flex-col items-center">
                              <span className="font-bold text-gray-800">
                                {formatDate(event.date)}
                              </span>
                              {event.repeat === 'yearly' && (
                                <span className="text-[10px] font-semibold text-amber-600 flex items-center gap-0.5">
                                  <FiRepeat className="text-[9px]" /> Yearly
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Countdown */}
                          <td className="text-center whitespace-nowrap">
                            {renderCountdownBadge(days)}
                          </td>

                          {/* Reminder & Repeat */}
                          <td className="whitespace-nowrap">
                            <div className="flex flex-col items-start gap-1">
                              {event.reminderBefore !== undefined && event.reminderBefore !== null ? (
                                <span className="inline-flex items-center gap-1 text-[11px] text-gray-600">
                                  <FiBell className="text-gray-400 text-[10px]" />
                                  {event.reminderBefore === 0 ? 'Same day' : `${event.reminderBefore}d before`}
                                </span>
                              ) : (
                                <span className="text-gray-300 text-xs">—</span>
                              )}
                              {event.repeat === 'yearly' && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 font-medium">
                                  <FiRepeat className="text-[9px]" /> Repeats yearly
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Notes */}
                          <td className="whitespace-nowrap">
                            <span className="text-xs text-gray-500 line-clamp-1 max-w-[160px]" title={event.notes}>
                              {event.notes || <span className="text-gray-300">—</span>}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingEvent(event);
                                  setShowModal(true);
                                }}
                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-gray-200 hover:border-blue-300"
                                title="Edit Event"
                              >
                                <FiEdit2 className="text-xs" />
                              </button>
                              <button
                                onClick={() => handleDeleteEvent(event._id)}
                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-gray-200 hover:border-red-300"
                                title="Delete Event"
                              >
                                <FiTrash2 className="text-xs" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          ) : (
            /* ================= MODERN GRID VIEW ================= */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 sm:p-6 bg-gray-50/40">
              <AnimatePresence>
                {filteredEvents.map((event, index) => {
                  const config = getCategoryConfig(event.eventType);
                  const days = getDaysRemaining(event.date);

                  return (
                    <motion.div
                      key={event._id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.02, 0.3) }}
                      className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <div>
                        {/* Top header of card */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base shadow-sm ${config.avatarBg}`}>
                              {config.icon}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors line-clamp-1">
                                {event.title}
                              </h4>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${config.badgeClass}`}>
                                {config.label}
                              </span>
                            </div>
                          </div>

                          {/* Countdown badge */}
                          {renderCountdownBadge(days)}
                        </div>

                        {/* Date and details */}
                        <div className="space-y-1.5 text-xs text-gray-600 mb-3 pt-2 border-t border-gray-100">
                          <div className="flex items-center gap-1.5">
                            <FiCalendar className="text-gray-400 text-xs" />
                            <span className="font-medium text-gray-800">{formatDate(event.date)}</span>
                          </div>

                          {(event.reminderBefore !== undefined || event.repeat === 'yearly') && (
                            <div className="flex items-center gap-3 text-[11px] text-gray-500">
                              {event.reminderBefore !== undefined && (
                                <span className="flex items-center gap-1">
                                  <FiBell className="text-gray-400" />
                                  {event.reminderBefore === 0 ? 'Same day' : `${event.reminderBefore}d before`}
                                </span>
                              )}
                              {event.repeat === 'yearly' && (
                                <span className="flex items-center gap-1 text-amber-600 font-semibold">
                                  <FiRepeat className="text-[10px]" /> Yearly
                                </span>
                              )}
                            </div>
                          )}

                          {event.notes && (
                            <p className="text-[11px] text-gray-500 italic line-clamp-2 bg-gray-50 p-2 rounded border border-gray-100 mt-2">
                              "{event.notes}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-gray-100">
                        <button
                          onClick={() => {
                            setEditingEvent(event);
                            setShowModal(true);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md border border-gray-200 transition-colors"
                        >
                          <FiEdit2 className="text-[11px]" /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event._id)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md border border-gray-200 transition-colors"
                        >
                          <FiTrash2 className="text-[11px]" /> Delete
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {/* Footer matching Events.jsx */}
          {!loading && filteredEvents.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 sm:px-6 py-3 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs font-semibold text-gray-500">
                Showing <span className="text-gray-900 font-bold">{filteredEvents.length}</span> of {events.length} events
              </p>
              <div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold text-gray-400">
                <span
                  className={`flex items-center gap-1 cursor-pointer hover:text-gray-600 transition-colors ${
                    selectedCategory === 'birthday' ? 'text-rose-500' : ''
                  }`}
                  onClick={() => setSelectedCategory(selectedCategory === 'birthday' ? 'all' : 'birthday')}
                >
                  <span className="w-2 h-2 bg-rose-400 rounded-full"></span> Birthdays
                </span>
                <span
                  className={`flex items-center gap-1 cursor-pointer hover:text-gray-600 transition-colors ${
                    selectedCategory === 'anniversary' ? 'text-amber-500' : ''
                  }`}
                  onClick={() => setSelectedCategory(selectedCategory === 'anniversary' ? 'all' : 'anniversary')}
                >
                  <span className="w-2 h-2 bg-amber-400 rounded-full"></span> Anniversaries
                </span>
                <span
                  className={`flex items-center gap-1 cursor-pointer hover:text-gray-600 transition-colors ${
                    selectedCategory === 'all' ? 'text-blue-500' : ''
                  }`}
                  onClick={() => setSelectedCategory('all')}
                >
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span> All Categories
                </span>
                {isFilterActive && (
                  <span
                    className="text-blue-500 cursor-pointer hover:underline text-[9px]"
                    onClick={clearFilters}
                  >
                    Reset All
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

      </main>

      {/* Modern Add / Edit Event Modal */}
      <AnimatePresence>
        {showModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm overflow-y-auto"
            onClick={() => {
              setShowModal(false);
              setEditingEvent(null);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-lg overflow-hidden my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/60">
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {editingEvent ? '✏️ Edit Event' : '✨ Add New Event'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {editingEvent ? 'Update details for this event' : 'Create an event with reminders and recurrence'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingEvent(null);
                  }}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <EventForm
                event={editingEvent}
                userId={userId}
                userRole={userRole}
                onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
                onCancel={() => {
                  setShowModal(false);
                  setEditingEvent(null);
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmployeeEvents;