import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FiPlus, FiEdit2, FiTrash2, FiX, 
  FiClock, FiStar, FiBell, FiCalendar,
  FiTrendingUp, FiAward, FiSmile, FiGrid,
  FiList, FiChevronRight, FiMoreVertical,
  FiHeart, FiShare2, FiCopy, FiExternalLink,
  FiZap, FiSun, FiMoon
} from 'react-icons/fi';
import { FaSearch, FaTimes, FaBirthdayCake, FaGlassCheers, FaTrophy, FaCalendarAlt, FaPlane, FaGraduationCap, FaEllipsisH } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

// API Service - Inline
const API_BASE_URL = 'http://localhost:5001/api/events';

const eventService = {
  createEvent: async (eventData) => {
    try {
      const response = await axios.post(API_BASE_URL, eventData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  getMyEvents: async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/my-events/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  updateEvent: async (id, eventData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/${id}`, eventData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  deleteEvent: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

// ============================================
// PREMIUM EVENT FORM
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

  const eventTypes = [
    { value: 'birthday', label: 'Birthday', icon: '🎂', color: '#f43f5e', bg: 'linear-gradient(135deg, #fce7f3, #fbcfe8)' },
    { value: 'anniversary', label: 'Anniversary', icon: '💑', color: '#ec4899', bg: 'linear-gradient(135deg, #fce7f3, #f9a8d4)' },
    { value: 'achievement', label: 'Achievement', icon: '🏆', color: '#f59e0b', bg: 'linear-gradient(135deg, #fef3c7, #fde68a)' },
    { value: 'appointment', label: 'Appointment', icon: '📅', color: '#3b82f6', bg: 'linear-gradient(135deg, #dbeafe, #bfdbfe)' },
    { value: 'vacation', label: 'Vacation', icon: '✈️', color: '#10b981', bg: 'linear-gradient(135deg, #d1fae5, #a7f3d0)' },
    { value: 'exam', label: 'Exam', icon: '📚', color: '#8b5cf6', bg: 'linear-gradient(135deg, #ede9fe, #ddd6fe)' },
    { value: 'other', label: 'Other', icon: '📌', color: '#6b7280', bg: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)' }
  ];

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

  const selectedType = eventTypes.find(t => t.value === formData.eventType);

  return (
    <motion.form 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      onSubmit={handleSubmit} 
      style={premiumStyles.form}
    >
      <div style={premiumStyles.formHeader}>
        <motion.div 
          whileHover={{ scale: 1.05, rotate: 5 }}
          style={{ ...premiumStyles.formHeaderIcon, background: selectedType?.bg || '#f0f0f0' }}
        >
          <span style={{ fontSize: '32px' }}>{event ? '✏️' : '✨'}</span>
        </motion.div>
        <div>
          <h3 style={premiumStyles.formHeaderTitle}>
            {event ? 'Update Event' : 'Create New Event'}
          </h3>
          <p style={premiumStyles.formHeaderSub}>
            {event ? 'Make changes to your event details' : 'Add a new event to your wishlist'}
          </p>
        </div>
      </div>

      <div style={premiumStyles.formBody}>
        <div style={premiumStyles.formGroup}>
          <label style={premiumStyles.label}>
            Event Title <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <motion.input
            whileFocus={{ scale: 1.01, borderColor: '#3b82f6' }}
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter event title..."
            style={{ ...premiumStyles.input, ...(errors.title ? premiumStyles.inputError : {}) }}
          />
          {errors.title && <span style={premiumStyles.errorText}>{errors.title}</span>}
        </div>

        <div style={premiumStyles.row}>
          <div style={premiumStyles.formGroup}>
            <label style={premiumStyles.label}>
              Event Type <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={premiumStyles.selectWrapper}>
              <select 
                name="eventType" 
                value={formData.eventType} 
                onChange={handleChange} 
                style={{ ...premiumStyles.input, background: selectedType?.bg + '30' }}
              >
                {eventTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={premiumStyles.formGroup}>
            <label style={premiumStyles.label}>
              Event Date <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <motion.input
              whileFocus={{ scale: 1.01, borderColor: '#3b82f6' }}
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              style={{ ...premiumStyles.input, ...(errors.date ? premiumStyles.inputError : {}) }}
            />
            {errors.date && <span style={premiumStyles.errorText}>{errors.date}</span>}
          </div>
        </div>

        <div style={premiumStyles.row}>
          <div style={premiumStyles.formGroup}>
            <label style={premiumStyles.label}>⏰ Reminder</label>
            <select name="reminderBefore" value={formData.reminderBefore} onChange={handleChange} style={premiumStyles.input}>
              {reminderOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div style={premiumStyles.formGroup}>
            <label style={premiumStyles.label}>🔄 Repeat</label>
            <select name="repeat" value={formData.repeat} onChange={handleChange} style={premiumStyles.input}>
              {repeatOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={premiumStyles.formGroup}>
          <label style={premiumStyles.label}>📝 Notes</label>
          <motion.textarea
            whileFocus={{ scale: 1.01, borderColor: '#3b82f6' }}
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Add any additional notes..."
            rows="2"
            style={premiumStyles.textarea}
          />
        </div>
      </div>

      <div style={premiumStyles.formActions}>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button" 
          onClick={onCancel} 
          style={premiumStyles.btnCancel} 
          disabled={isSubmitting}
        >
          <FiX size={18} /> Cancel
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(59,130,246,0.4)' }}
          whileTap={{ scale: 0.98 }}
          type="submit" 
          style={premiumStyles.btnSubmit} 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              ⏳
            </motion.span>
          ) : event ? (
            <><FiEdit2 size={18} /> Update Event</>
          ) : (
            <><FiPlus size={18} /> Add Event</>
          )}
        </motion.button>
      </div>
    </motion.form>
  );
};

// ============================================
// PREMIUM EVENT CARD
// ============================================
const EventCard = ({ event, onEdit, onDelete, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const getDaysRemaining = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(date);
    eventDate.setHours(0, 0, 0, 0);
    const diffTime = eventDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const days = getDaysRemaining(event.date);

  const getStatus = () => {
    if (days === 0) return { label: 'Today!', color: '#16a34a', bg: '#dcfce7', emoji: '🎉', pulse: true };
    if (days < 0) return { label: `${Math.abs(days)} days ago`, color: '#6b7280', bg: '#f3f4f6', emoji: '⏳', pulse: false };
    if (days <= 3) return { label: `${days} days left`, color: '#dc2626', bg: '#fee2e2', emoji: '🔥', pulse: true };
    if (days <= 7) return { label: `${days} days left`, color: '#d97706', bg: '#fef3c7', emoji: '📅', pulse: false };
    if (days <= 30) return { label: `${days} days left`, color: '#2563eb', bg: '#dbeafe', emoji: '📅', pulse: false };
    return { label: `${days} days left`, color: '#6b7280', bg: '#f3f4f6', emoji: '📅', pulse: false };
  };

  const status = getStatus();

  const eventConfig = {
    birthday: { 
      gradient: 'linear-gradient(135deg, #fce7f3, #fbcfe8)', 
      border: '#f9a8d4', 
      icon: '🎂', 
      label: 'Birthday',
      shadow: '0 8px 25px rgba(244,63,94,0.15)'
    },
    anniversary: { 
      gradient: 'linear-gradient(135deg, #fce7f3, #f9a8d4)', 
      border: '#ec4899', 
      icon: '💑', 
      label: 'Anniversary',
      shadow: '0 8px 25px rgba(236,72,153,0.15)'
    },
    achievement: { 
      gradient: 'linear-gradient(135deg, #fef3c7, #fde68a)', 
      border: '#fcd34d', 
      icon: '🏆', 
      label: 'Achievement',
      shadow: '0 8px 25px rgba(245,158,11,0.15)'
    },
    appointment: { 
      gradient: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', 
      border: '#93c5fd', 
      icon: '📅', 
      label: 'Appointment',
      shadow: '0 8px 25px rgba(59,130,246,0.15)'
    },
    vacation: { 
      gradient: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', 
      border: '#6ee7b7', 
      icon: '✈️', 
      label: 'Vacation',
      shadow: '0 8px 25px rgba(16,185,129,0.15)'
    },
    exam: { 
      gradient: 'linear-gradient(135deg, #ede9fe, #ddd6fe)', 
      border: '#c4b5fd', 
      icon: '📚', 
      label: 'Exam',
      shadow: '0 8px 25px rgba(139,92,246,0.15)'
    },
    other: { 
      gradient: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)', 
      border: '#d1d5db', 
      icon: '📌', 
      label: 'Other',
      shadow: '0 8px 25px rgba(107,114,128,0.15)'
    }
  };

  const config = eventConfig[event.eventType] || eventConfig.other;

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: "spring", 
        damping: 25, 
        stiffness: 300,
        delay: index * 0.05 
      }
    },
    hover: {
      y: -8,
      scale: 1.02,
      boxShadow: config.shadow || '0 20px 40px rgba(0,0,0,0.12)',
      transition: { type: "spring", damping: 20, stiffness: 400 }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...premiumStyles.card,
        background: config.gradient,
        borderColor: config.border,
      }}
    >
      {/* Premium Glow Effect */}
      <motion.div
        animate={{
          opacity: isHovered ? 1 : 0,
          scale: isHovered ? 1 : 0.8
        }}
        style={{
          position: 'absolute',
          top: '-50%',
          right: '-50%',
          width: '200%',
          height: '200%',
          background: `radial-gradient(circle, ${config.border}20, transparent 70%)`,
          pointerEvents: 'none',
          transition: 'all 0.5s'
        }}
      />

      {/* Decorative Badge */}
      <motion.div
        animate={{
          scale: isHovered ? 1.1 : 1,
          rotate: isHovered ? 10 : 0
        }}
        style={{
          ...premiumStyles.cardBadge,
          background: config.border,
        }}
      >
        {config.icon}
      </motion.div>

      {/* Like Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsLiked(!isLiked)}
        style={{
          position: 'absolute',
          top: '16px',
          right: '56px',
          background: 'rgba(255,255,255,0.8)',
          border: 'none',
          borderRadius: '50%',
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          zIndex: 2
        }}
      >
        <FiHeart 
          size={16} 
          style={{ 
            color: isLiked ? '#ef4444' : '#9ca3af',
            fill: isLiked ? '#ef4444' : 'none',
            transition: 'all 0.3s'
          }} 
        />
      </motion.button>

      <div style={premiumStyles.cardHeader}>
        <div style={premiumStyles.cardTitle}>
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            style={{
              ...premiumStyles.cardIcon,
              background: config.border + '40',
              color: config.border
            }}
          >
            {config.icon}
          </motion.div>
          <div>
            <motion.h3 
              animate={{
                color: isHovered ? config.border : '#1a1a1a'
              }}
              style={premiumStyles.cardTitleText}
            >
              {event.title}
            </motion.h3>
            <span style={{
              ...premiumStyles.eventType,
              background: config.border + '30',
              color: config.border
            }}>
              {config.label}
            </span>
          </div>
        </div>
        <div style={premiumStyles.cardActions}>
          <motion.button 
            whileHover={{ scale: 1.1, backgroundColor: '#dbeafe' }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onEdit(event)} 
            style={premiumStyles.btnEdit}
          >
            <FiEdit2 size={15} />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.1, backgroundColor: '#fee2e2' }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onDelete(event._id)} 
            style={premiumStyles.btnDelete}
          >
            <FiTrash2 size={15} />
          </motion.button>
        </div>
      </div>

      <div style={premiumStyles.cardBody}>
        <div style={premiumStyles.cardInfo}>
          <motion.span 
            animate={{
              scale: status.pulse ? [1, 1.05, 1] : 1
            }}
            transition={{
              duration: 1.5,
              repeat: status.pulse ? Infinity : 0,
              ease: "easeInOut"
            }}
            style={{ ...premiumStyles.statusBadge, backgroundColor: status.bg, color: status.color }}
          >
            {status.emoji} {status.label}
          </motion.span>
        </div>

        <div style={premiumStyles.cardDetails}>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            style={premiumStyles.detailItem}
          >
            <FiCalendar size={14} style={{ color: '#6b7280' }} />
            <span>{new Date(event.date).toLocaleDateString('en-IN', { 
              day: '2-digit', month: 'short', year: 'numeric' 
            })}</span>
          </motion.div>
          {event.reminderBefore !== undefined && (
            <motion.div 
              whileHover={{ scale: 1.05 }}
              style={premiumStyles.detailItem}
            >
              <FiBell size={14} style={{ color: '#6b7280' }} />
              <span>{event.reminderBefore === 0 ? 'Same Day' : `${event.reminderBefore} days before`}</span>
            </motion.div>
          )}
          {event.repeat === 'yearly' && (
            <motion.div 
              whileHover={{ scale: 1.05 }}
              style={premiumStyles.detailItem}
            >
              <FiStar size={14} style={{ color: '#f59e0b' }} />
              <span style={{ color: '#f59e0b' }}>Yearly</span>
            </motion.div>
          )}
        </div>

        {event.notes && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            style={premiumStyles.cardNotes}
          >
            <p style={premiumStyles.cardNotesText}>{event.notes}</p>
          </motion.div>
        )}

        {/* Share/Quick Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          style={premiumStyles.cardFooter}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={premiumStyles.footerBtn}
          >
            <FiShare2 size={14} /> Share
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={premiumStyles.footerBtn}
          >
            <FiCopy size={14} /> Copy
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

// ============================================
// PREMIUM MAIN COMPONENT
// ============================================
const EmployeeEvents = ({ userId: propUserId, userRole: propUserRole }) => {
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState('employee');
  const [displayId, setDisplayId] = useState('');
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('date');

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
                const res = await axios.get(`http://localhost:5001/api/employees/get-employee?email=${email}`);
                if (res.data && res.data.success && res.data.data) {
                  resolvedUserId = res.data.data._id || res.data.data.id;
                  if (resolvedUserId) {
                    localStorage.setItem('userId', resolvedUserId);
                  }
                }
              } catch (err) {
                console.error('Failed to get employee database ID:', err);
              }
            }
          }
        }
      }

      if (resolvedUserId) {
        setUserId(resolvedUserId);
      }
    };

    initUser();
  }, [propUserId, propUserRole]);

  useEffect(() => {
    if (userId) {
      fetchEvents();
    }
  }, [userId]);

  useEffect(() => {
    let filtered = [...events];
    
    if (filterType !== 'all') {
      filtered = filtered.filter(e => e.eventType === filterType);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(e => 
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.notes && e.notes.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Sort
    if (sortBy === 'date') {
      filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortBy === 'title') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }
    
    setFilteredEvents(filtered);
  }, [events, searchTerm, filterType, sortBy]);

  const fetchEvents = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await eventService.getMyEvents(userId);
      const eventsList = response.events || response.data || [];
      setEvents(eventsList);
      setFilteredEvents(eventsList);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (eventData) => {
    try {
      const response = await eventService.createEvent(eventData);
      const newEvent = response.event || response.data;
      if (newEvent) {
        setEvents(prev => [newEvent, ...prev]);
      }
      setShowModal(false);
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event');
    }
  };

  const handleUpdateEvent = async (eventData) => {
    try {
      const { id, ...updateData } = eventData;
      const response = await eventService.updateEvent(id, updateData);
      const updatedEvent = response.event || response.data;
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
      await eventService.deleteEvent(id);
      setEvents(events.filter(e => e._id !== id));
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
    }
  };

  const getStats = () => {
    const total = events.length;
    const upcoming = events.filter(e => new Date(e.date) >= new Date()).length;
    const today = events.filter(e => {
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      const eventDate = new Date(e.date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() === todayDate.getTime();
    }).length;
    const completed = events.filter(e => new Date(e.date) < new Date()).length;
    return { total, upcoming, today, completed };
  };

  const stats = getStats();

  const eventTypes = [
    'all', 'birthday', 'anniversary', 'achievement', 
    'appointment', 'vacation', 'exam', 'other'
  ];

  const eventTypeIcons = {
    all: '📋',
    birthday: '🎂',
    anniversary: '💑',
    achievement: '🏆',
    appointment: '📅',
    vacation: '✈️',
    exam: '📚',
    other: '📌'
  };

  const eventTypeLabels = {
    all: 'All',
    birthday: 'Birthday',
    anniversary: 'Anniversary',
    achievement: 'Achievement',
    appointment: 'Appointment',
    vacation: 'Vacation',
    exam: 'Exam',
    other: 'Other'
  };

  return (
    <div style={premiumStyles.container}>
      {/* Premium Background Effects */}
      <div style={premiumStyles.bgGradient1} />
      <div style={premiumStyles.bgGradient2} />
      <div style={premiumStyles.bgGradient3} />
      
      {/* Floating Particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.3
          }}
          style={{
            position: 'fixed',
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            background: `rgba(59,130,246,${0.1 + i * 0.05})`,
            top: `${10 + i * 12}%`,
            left: `${5 + i * 15}%`,
            pointerEvents: 'none',
            zIndex: 0
          }}
        />
      ))}
      
      <div style={premiumStyles.innerContainer}>
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          style={premiumStyles.header}
        >
          <div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              style={premiumStyles.headerBadge}
            >
              <FiZap style={{ marginRight: '8px' }} />
              <span>✨ Events Wishlist</span>
            </motion.div>
            <h1 style={premiumStyles.title}>
              My Events
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.3 }}
                style={premiumStyles.titleCount}
              >
                {events.length}
              </motion.span>
            </h1>
            <p style={premiumStyles.subtitle}>
              <motion.span 
                whileHover={{ scale: 1.05 }}
                style={premiumStyles.userBadge}
              >
                👤 {userRole.toUpperCase()}
              </motion.span>
              {displayId && (
                <motion.span 
                  whileHover={{ scale: 1.05 }}
                  style={premiumStyles.userBadge}
                >
                  🆔 {displayId}
                </motion.span>
              )}
            </p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05, boxShadow: '0 8px 30px rgba(59,130,246,0.4)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setEditingEvent(null);
              setShowModal(true);
            }} 
            style={premiumStyles.btnAdd}
          >
            <FiPlus size={20} /> Add New Event
          </motion.button>
        </motion.div>

        {/* Premium Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: "spring" }}
          style={premiumStyles.stats}
        >
          {[
            { icon: <FiCalendar size={22} />, label: 'Total Events', value: stats.total, bg: '#dbeafe', color: '#3b82f6' },
            { icon: <FiTrendingUp size={22} />, label: 'Upcoming', value: stats.upcoming, bg: '#d1fae5', color: '#10b981' },
            { icon: <FiSmile size={22} />, label: 'Today', value: stats.today, bg: '#fef3c7', color: '#f59e0b' },
            { icon: <FiAward size={22} />, label: 'Completed', value: stats.completed, bg: '#ede9fe', color: '#8b5cf6' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ 
                y: -4, 
                boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
                transition: { type: "spring", stiffness: 400 }
              }}
              style={premiumStyles.statCard}
            >
              <div style={{ ...premiumStyles.statIcon, background: stat.bg }}>
                <span style={{ color: stat.color }}>{stat.icon}</span>
              </div>
              <div>
                <span style={premiumStyles.statLabel}>{stat.label}</span>
                <motion.strong 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  style={premiumStyles.statValue}
                >
                  {stat.value}
                </motion.strong>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Premium Search & Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={premiumStyles.filters}
        >
          <div style={premiumStyles.filterTop}>
            <motion.div 
              whileFocus={{ borderColor: '#3b82f6' }}
              style={premiumStyles.searchBox}
            >
              <FaSearch color="#9ca3af" size={18} />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={premiumStyles.searchInput}
              />
              {searchTerm && (
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSearchTerm('')} 
                  style={premiumStyles.clearSearch}
                >
                  <FaTimes size={14} />
                </motion.button>
              )}
            </motion.div>

            <div style={premiumStyles.controls}>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                style={premiumStyles.sortSelect}
              >
                <option value="date">Sort by Date</option>
                <option value="title">Sort by Title</option>
              </select>

              <div style={premiumStyles.viewToggle}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('grid')}
                  style={{
                    ...premiumStyles.viewBtn,
                    ...(viewMode === 'grid' ? premiumStyles.viewBtnActive : {})
                  }}
                >
                  <FiGrid size={18} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('list')}
                  style={{
                    ...premiumStyles.viewBtn,
                    ...(viewMode === 'list' ? premiumStyles.viewBtnActive : {})
                  }}
                >
                  <FiList size={18} />
                </motion.button>
              </div>
            </div>
          </div>

          <div style={premiumStyles.filterButtons}>
            {eventTypes.map(type => (
              <motion.button
                key={type}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilterType(type)}
                style={{
                  ...premiumStyles.filterBtn,
                  ...(filterType === type ? premiumStyles.filterBtnActive : {})
                }}
              >
                {eventTypeIcons[type]} {eventTypeLabels[type]}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Events List */}
        {loading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={premiumStyles.loading}
          >
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              style={premiumStyles.spinner}
            />
            <p style={premiumStyles.loadingText}>Loading your events...</p>
          </motion.div>
        ) : filteredEvents.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring" }}
            style={premiumStyles.emptyState}
          >
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              style={premiumStyles.emptyIcon}
            >
              📭
            </motion.div>
            <h3 style={premiumStyles.emptyTitle}>No events found</h3>
            <p style={premiumStyles.emptyText}>
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Click "Add New Event" to create your first event ✨'}
            </p>
          </motion.div>
        ) : (
          <div style={{
            ...premiumStyles.eventsGrid,
            ...(viewMode === 'list' ? premiumStyles.eventsList : {})
          }}>
            {filteredEvents.map((event, index) => (
              <EventCard
                key={event._id}
                event={event}
                index={index}
                onEdit={(e) => {
                  setEditingEvent(e);
                  setShowModal(true);
                }}
                onDelete={handleDeleteEvent}
              />
            ))}
          </div>
        )}
      </div>

      {/* Premium Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={premiumStyles.modalOverlay} 
            onClick={() => {
              setShowModal(false);
              setEditingEvent(null);
            }}
          >
            <motion.div 
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 50, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              style={premiumStyles.modal} 
              onClick={(e) => e.stopPropagation()}
            >
              <div style={premiumStyles.modalHeader}>
                <h2 style={premiumStyles.modalTitle}>
                  {editingEvent ? '✏️ Edit Event' : '✨ Add New Event'}
                </h2>
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setShowModal(false);
                    setEditingEvent(null);
                  }} 
                  style={premiumStyles.modalClose}
                >
                  <FaTimes size={20} />
                </motion.button>
              </div>
              <div style={premiumStyles.modalBody}>
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
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// PREMIUM STYLES
// ============================================
const premiumStyles = {
  container: {
    minHeight: '100vh',
    padding: '32px',
    background: 'linear-gradient(135deg, #f0f4ff 0%, #faf5ff 25%, #fff5f5 50%, #f0fdf4 75%, #f5f3ff 100%)',
    position: 'relative',
    overflow: 'hidden'
  },
  bgGradient1: {
    position: 'fixed',
    top: '-400px',
    right: '-300px',
    width: '800px',
    height: '800px',
    background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
    borderRadius: '50%',
    pointerEvents: 'none',
    zIndex: 0
  },
  bgGradient2: {
    position: 'fixed',
    bottom: '-300px',
    left: '-300px',
    width: '700px',
    height: '700px',
    background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)',
    borderRadius: '50%',
    pointerEvents: 'none',
    zIndex: 0
  },
  bgGradient3: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '1000px',
    height: '1000px',
    background: 'radial-gradient(circle, rgba(236,72,153,0.03) 0%, transparent 70%)',
    borderRadius: '50%',
    pointerEvents: 'none',
    zIndex: 0
  },
  innerContainer: {
    maxWidth: '1440px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 1
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '20px'
  },
  headerBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 20px',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    color: 'white',
    borderRadius: '24px',
    fontSize: '12px',
    fontWeight: 600,
    marginBottom: '10px',
    letterSpacing: '0.5px',
    boxShadow: '0 4px 15px rgba(59,130,246,0.3)'
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    fontSize: '38px',
    fontWeight: 800,
    color: '#1a1a1a',
    margin: 0,
    letterSpacing: '-1px',
    background: 'linear-gradient(135deg, #1a1a1a, #4b5563)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  titleCount: {
    fontSize: '16px',
    fontWeight: 600,
    background: 'rgba(255,255,255,0.9)',
    padding: '2px 16px',
    borderRadius: '24px',
    color: '#4b5563',
    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
    backdropFilter: 'blur(10px)'
  },
  subtitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#666',
    margin: '6px 0 0',
    fontSize: '14px',
    flexWrap: 'wrap'
  },
  userBadge: {
    display: 'inline-block',
    padding: '4px 16px',
    background: 'rgba(255,255,255,0.9)',
    borderRadius: '14px',
    fontSize: '12px',
    fontWeight: 500,
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    backdropFilter: 'blur(10px)'
  },
  btnAdd: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '16px 32px',
    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
    color: 'white',
    border: 'none',
    borderRadius: '16px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(59,130,246,0.35)',
    transition: 'all 0.3s',
    whiteSpace: 'nowrap'
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '32px'
  },
  statCard: {
    background: 'rgba(255,255,255,0.85)',
    padding: '22px 26px',
    borderRadius: '20px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    border: '1px solid rgba(255,255,255,0.5)',
    transition: 'all 0.3s',
    backdropFilter: 'blur(20px)',
    cursor: 'pointer'
  },
  statIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  statLabel: {
    color: '#6b7280',
    fontSize: '13px',
    fontWeight: 500
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#1a1a1a',
    display: 'block',
    lineHeight: 1.2
  },
  filters: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '32px'
  },
  filterTop: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  searchBox: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.9)',
    padding: '0 20px',
    borderRadius: '16px',
    border: '2px solid #e5e7eb',
    transition: 'all 0.3s',
    minWidth: '200px',
    backdropFilter: 'blur(20px)'
  },
  searchInput: {
    flex: 1,
    padding: '14px 16px',
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    background: 'transparent',
    minWidth: '100px'
  },
  clearSearch: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#9ca3af',
    padding: '4px'
  },
  controls: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
  },
  sortSelect: {
    padding: '12px 18px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.9)',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    color: '#4b5563',
    outline: 'none',
    backdropFilter: 'blur(20px)'
  },
  viewToggle: {
    display: 'flex',
    gap: '4px',
    background: 'rgba(255,255,255,0.9)',
    padding: '4px',
    borderRadius: '12px',
    border: '2px solid #e5e7eb',
    backdropFilter: 'blur(20px)'
  },
  viewBtn: {
    padding: '8px 12px',
    border: 'none',
    borderRadius: '8px',
    background: 'transparent',
    cursor: 'pointer',
    color: '#9ca3af',
    transition: 'all 0.3s'
  },
  viewBtnActive: {
    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
    color: 'white'
  },
  filterButtons: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px'
  },
  filterBtn: {
    padding: '8px 20px',
    border: '2px solid #e5e7eb',
    borderRadius: '24px',
    background: 'rgba(255,255,255,0.8)',
    color: '#4b5563',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.3s',
    backdropFilter: 'blur(10px)'
  },
  filterBtnActive: {
    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
    color: 'white',
    borderColor: '#3b82f6',
    boxShadow: '0 4px 20px rgba(59,130,246,0.3)'
  },
  eventsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '28px'
  },
  eventsList: {
    gridTemplateColumns: '1fr'
  },
  card: {
    position: 'relative',
    borderRadius: '24px',
    padding: '28px 30px',
    borderLeft: '6px solid',
    transition: 'all 0.3s',
    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
    overflow: 'hidden',
    backdropFilter: 'blur(10px)',
    cursor: 'pointer'
  },
  cardBadge: {
    position: 'absolute',
    top: '-10px',
    right: '-10px',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
    transition: 'all 0.3s'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px'
  },
  cardTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flex: 1
  },
  cardIcon: {
    width: '52px',
    height: '52px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '26px',
    flexShrink: 0
  },
  cardTitleText: {
    margin: 0,
    fontSize: '19px',
    fontWeight: 600,
    color: '#1a1a1a',
    transition: 'color 0.3s'
  },
  eventType: {
    fontSize: '11px',
    fontWeight: 600,
    padding: '3px 16px',
    borderRadius: '14px',
    display: 'inline-block',
    textTransform: 'capitalize'
  },
  cardActions: {
    display: 'flex',
    gap: '6px'
  },
  btnEdit: {
    padding: '6px 10px',
    border: 'none',
    background: 'rgba(255,255,255,0.8)',
    borderRadius: '10px',
    cursor: 'pointer',
    color: '#3b82f6',
    transition: 'all 0.3s',
    backdropFilter: 'blur(10px)'
  },
  btnDelete: {
    padding: '6px 10px',
    border: 'none',
    background: 'rgba(255,255,255,0.8)',
    borderRadius: '10px',
    cursor: 'pointer',
    color: '#ef4444',
    transition: 'all 0.3s',
    backdropFilter: 'blur(10px)'
  },
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  cardInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap'
  },
  statusBadge: {
    fontSize: '13px',
    fontWeight: 600,
    padding: '4px 18px',
    borderRadius: '20px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px'
  },
  cardDetails: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    fontSize: '13px',
    color: '#4b5563'
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 8px',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.5)',
    transition: 'all 0.3s',
    cursor: 'pointer'
  },
  cardNotes: {
    paddingTop: '14px',
    borderTop: '1px solid rgba(0,0,0,0.06)',
    overflow: 'hidden'
  },
  cardNotesText: {
    margin: 0,
    fontSize: '13px',
    color: '#6b7280',
    lineHeight: 1.5
  },
  cardFooter: {
    display: 'flex',
    gap: '12px',
    paddingTop: '14px',
    borderTop: '1px solid rgba(0,0,0,0.06)',
    marginTop: '4px'
  },
  footerBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    background: 'rgba(255,255,255,0.6)',
    border: 'none',
    borderRadius: '8px',
    color: '#6b7280',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.3s',
    backdropFilter: 'blur(10px)'
  },
  loading: {
    textAlign: 'center',
    padding: '80px 20px',
    color: '#6b7280'
  },
  loadingText: {
    marginTop: '16px',
    fontSize: '16px',
    color: '#4b5563'
  },
  spinner: {
    width: '52px',
    height: '52px',
    margin: '0 auto',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%'
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 20px',
    background: 'rgba(255,255,255,0.9)',
    borderRadius: '28px',
    border: '2px dashed #e5e7eb',
    backdropFilter: 'blur(20px)'
  },
  emptyIcon: {
    fontSize: '88px',
    marginBottom: '20px'
  },
  emptyTitle: {
    margin: '0 0 10px',
    fontSize: '24px',
    color: '#1a1a1a',
    fontWeight: 700
  },
  emptyText: {
    color: '#6b7280',
    margin: 0,
    fontSize: '16px'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(12px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  modal: {
    background: 'white',
    borderRadius: '32px',
    maxWidth: '640px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 32px 80px rgba(0,0,0,0.2)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '28px 36px',
    borderBottom: '2px solid #f0f0f0'
  },
  modalTitle: {
    margin: 0,
    fontSize: '26px',
    fontWeight: 700,
    color: '#1a1a1a'
  },
  modalClose: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '8px',
    borderRadius: '12px',
    transition: 'all 0.3s'
  },
  modalBody: {
    padding: '36px'
  },
  // Form Styles
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '28px'
  },
  formHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '20px 28px',
    background: 'linear-gradient(135deg, #f0f4ff, #faf5ff)',
    borderRadius: '20px',
    marginBottom: '4px'
  },
  formHeaderIcon: {
    width: '64px',
    height: '64px',
    borderRadius: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  formHeaderTitle: {
    margin: 0,
    fontSize: '22px',
    fontWeight: 700,
    color: '#1a1a1a'
  },
  formHeaderSub: {
    margin: '2px 0 0',
    fontSize: '14px',
    color: '#6b7280'
  },
  formBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1
  },
  label: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#374151'
  },
  input: {
    padding: '14px 20px',
    border: '2px solid #e5e7eb',
    borderRadius: '16px',
    fontSize: '14px',
    fontFamily: 'inherit',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'all 0.3s',
    background: 'white'
  },
  inputError: {
    borderColor: '#ef4444'
  },
  errorText: {
    color: '#ef4444',
    fontSize: '12px',
    marginTop: '2px'
  },
  textarea: {
    padding: '14px 20px',
    border: '2px solid #e5e7eb',
    borderRadius: '16px',
    fontSize: '14px',
    fontFamily: 'inherit',
    width: '100%',
    boxSizing: 'border-box',
    resize: 'vertical',
    minHeight: '70px',
    transition: 'all 0.3s',
    background: 'white'
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px'
  },
  selectWrapper: {
    position: 'relative'
  },
  formActions: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'flex-end',
    paddingTop: '28px',
    borderTop: '2px solid #f0f0f0',
    marginTop: '4px'
  },
  btnCancel: {
    padding: '14px 32px',
    background: '#f3f4f6',
    border: 'none',
    borderRadius: '16px',
    cursor: 'pointer',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s',
    color: '#4b5563'
  },
  btnSubmit: {
    padding: '14px 36px',
    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
    color: 'white',
    border: 'none',
    borderRadius: '16px',
    cursor: 'pointer',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'all 0.3s',
    boxShadow: '0 4px 20px rgba(59,130,246,0.35)'
  }
};

// Add animation keyframes
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  * {
    box-sizing: border-box;
  }
  
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  
  ::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    border-radius: 10px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #2563eb, #7c3aed);
  }
  
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  }
`;
document.head.appendChild(styleSheet);

export default EmployeeEvents;