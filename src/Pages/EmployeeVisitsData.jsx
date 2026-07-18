import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../config';
import {
  FaPhone, FaLink, FaSearch, FaTimes, FaSync,
  FaEdit, FaTrash, FaPlus, FaMapMarkerAlt,
  FaCalendarAlt, FaCheckCircle, FaExclamationCircle,
  FaBullseye, FaTimesCircle,
} from 'react-icons/fa';
import { FiFilter, FiCalendar, FiActivity, FiTrendingUp } from 'react-icons/fi';
import { MdCancel } from 'react-icons/md';
import './EmployeeDashboard.css';

/* ─── Status Badge ─── */
const StatusBadge = ({ status }) => {
  const cfg = {
    Pending: { bg: '#fef0c7', text: '#b54708' },
    Lead:    { bg: '#e0f2fe', text: '#0369a1' },
    Rejected:{ bg: '#fee4e2', text: '#b42318' },
  };
  const s = cfg[status] || { bg: '#f3f4f6', text: '#374151' };
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:4,
      padding:'0.2rem 0.55rem', borderRadius:6,
      fontSize:'0.7rem', fontWeight:700,
      backgroundColor:s.bg, color:s.text,
    }}>
      {status}
    </span>
  );
};

const getCurrentEmployeeLocation = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported in this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        resolve({
          latitude,
          longitude,
          accuracy: position.coords.accuracy,
          capturedAt: new Date().toISOString(),
          mapsLink: `https://www.google.com/maps?q=${latitude},${longitude}`,
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('Location access was denied. Please allow location permission and try again.'));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error('Current location is unavailable. Please try again.'));
            break;
          case error.TIMEOUT:
            reject(new Error('Location request timed out. Please try again.'));
            break;
          default:
            reject(new Error('Unable to capture current location. Please try again.'));
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  });

/* ─── Add / Edit Form Modal ─── */
const EMPTY_FORM = { centerName:'', clientName:'', contact:'', address:'', addressLink:'', status:'Pending', remarks:'' };

const VisitFormModal = ({ show, onClose, onSave, editRecord, employeeId }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [capturingLocation, setCapturingLocation] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (editRecord) {
      setForm({
        centerName: editRecord.centerName || '',
        clientName: editRecord.clientName || '',
        contact:    editRecord.contact    || '',
        address:    editRecord.address    || '',
        addressLink:editRecord.addressLink|| '',
        status:     editRecord.status     || 'Pending',
        remarks:    editRecord.remarks    || '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErr('');
    setCapturingLocation(false);
  }, [editRecord, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!form.centerName || !form.clientName || !form.contact || !form.address) {
      setErr('Please fill in all required fields.');
      return;
    }
    setSaving(true);
    try {
      if (editRecord) {
        await axios.put(`${API_BASE_URL}/call-data/edit/${editRecord._id}`, form);
      } else {
        setCapturingLocation(true);
        const employeeLocation = await getCurrentEmployeeLocation();
        await axios.post(`${API_BASE_URL}/call-data/add`, { ...form, employeeId, employeeLocation });
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Save visit error:', error);
      setErr(error?.response?.data?.message || error?.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
      setCapturingLocation(false);
    }
  };

  if (!show) return null;

  const inp = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white';
  const lbl = 'block text-sm font-medium text-gray-600 mb-1';

  return (
    <AnimatePresence>
      <motion.div key="fb" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" />
      <motion.div key="fm" initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
        exit={{ opacity:0, scale:0.95 }} transition={{ duration:0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={e => e.stopPropagation()}>
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">{editRecord ? 'Edit Visit Record' : 'Add New Visit Record'}</h3>
            <button onClick={onClose} className="text-gray-400 text-2xl hover:text-gray-600 transition-colors">×</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {err && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm font-semibold">
                <FaExclamationCircle size={14} />{err}
              </div>
            )}
            {!editRecord && (
              <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm">
                <FaMapMarkerAlt size={14} className="mt-0.5 shrink-0" />
                <span>Your current location will be captured automatically when you submit this visit record.</span>
              </div>
            )}
            <div>
              <label className={lbl}>Center Name <span className="text-red-500">*</span></label>
              <input type="text" name="centerName" value={form.centerName} onChange={handleChange}
                placeholder="e.g. City Diagnostic Center" className={inp} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Client Name <span className="text-red-500">*</span></label>
                <input type="text" name="clientName" value={form.clientName} onChange={handleChange}
                  placeholder="Client / Doctor name" className={inp} required />
              </div>
              <div>
                <label className={lbl}>Contact <span className="text-red-500">*</span></label>
                <input type="text" name="contact" value={form.contact} onChange={handleChange}
                  placeholder="Phone number" className={inp} required />
              </div>
            </div>
            <div>
              <label className={lbl}>Address <span className="text-red-500">*</span></label>
              <textarea name="address" value={form.address} onChange={handleChange}
                placeholder="Full address" className={inp} rows="2" required></textarea>
            </div>
            <div>
              <label className={lbl}>Google Maps Link</label>
              <input type="url" name="addressLink" value={form.addressLink} onChange={handleChange}
                placeholder="https://maps.google.com/..." className={inp} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Status</label>
                <select name="status" value={form.status} onChange={handleChange} className={inp}>
                  <option value="Pending">Pending</option>
                  <option value="Lead">Lead</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className={lbl}>Remarks</label>
                <input type="text" name="remarks" value={form.remarks} onChange={handleChange}
                  placeholder="Optional notes" className={inp} />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
              <button type="submit" disabled={saving || capturingLocation} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50">
                {capturingLocation ? 'Capturing location...' : saving ? 'Saving...' : (editRecord ? 'Update' : 'Add Visit')}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

/* ─── Delete Confirm Modal ─── */
const DeleteModal = ({ show, onClose, onConfirm, deleting }) => {
  if (!show) return null;
  return (
    <AnimatePresence>
      <motion.div key="db" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]" />
      <motion.div key="dm" initial={{ opacity:0, scale:0.96, y:16 }} animate={{ opacity:1, scale:1, y:0 }}
        exit={{ opacity:0, scale:0.96, y:16 }} transition={{ duration:0.18 }}
        className="fixed inset-0 z-[201] flex items-center justify-center p-4"
        onClick={e => e.stopPropagation()}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center"
          onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100 mx-auto mb-4">
            <FaTrash className="text-red-500 text-xl" />
          </div>
          <h3 className="font-bold text-gray-900 text-base mb-1">Delete Visit Record?</h3>
          <p className="text-xs text-gray-500 mb-5">This action cannot be undone. The record will be permanently removed.</p>
          <div className="flex items-center gap-3">
            <button onClick={onClose}
              className="flex-1 px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button onClick={onConfirm} disabled={deleting}
              className="flex-1 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 rounded-lg transition-all flex items-center justify-center gap-2">
              {deleting ? (<><FaSync className="animate-spin text-[10px]" />Deleting…</>) : 'Delete'}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

/* ─── Main Component ─── */
const EmployeeVisitsData = () => {
  const [employeeId, setEmployeeId]     = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [visits, setVisits]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [searchQuery, setSearchQuery]   = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showForm, setShowForm]         = useState(false);
  const [editRecord, setEditRecord]     = useState(null);
  const [showDelete, setShowDelete]     = useState(false);
  const [deleteId, setDeleteId]         = useState(null);
  const [deleting, setDeleting]         = useState(false);

  // ── View Targets modal ────────────────────────────────────────────────────────
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [targetData, setTargetData]           = useState(null);   // { target, month }
  const [targetLoading, setTargetLoading]     = useState(false);
  const [viewTargetMonth, setViewTargetMonth] = useState('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('employeeData');
      if (stored) {
        const emp = JSON.parse(stored);
        setEmployeeId(emp.employeeId || '');
        setEmployeeName(emp.name || emp.fullName || emp.employeeName || '');
      }
    } catch (e) { console.error('Failed to read employee data:', e); }
  }, []);

  const fetchVisits = useCallback(async () => {
    if (!employeeId) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE_URL}/call-data/my`, { params: { employeeId } });
      if (res.data.success) setVisits(res.data.data || []);
    } catch (err) {
      console.error('Fetch visits error:', err);
      setError('Failed to load visit records. Please try again.');
    } finally { setLoading(false); }
  }, [employeeId]);

  useEffect(() => { if (employeeId) fetchVisits(); }, [employeeId, fetchVisits]);

  const visitsForMonth = visits.filter(v => {
    if (!selectedMonth) return true;
    return new Date(v.createdAt).toISOString().slice(0, 7) === selectedMonth;
  });

  const filtered = visitsForMonth.filter(v => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      (v.centerName||'').toLowerCase().includes(q) ||
      (v.clientName||'').toLowerCase().includes(q) ||
      (v.contact||'').includes(q);
    return matchesSearch && (statusFilter === 'All' || v.status === statusFilter);
  });

  const totalVisits  = visitsForMonth.length;
  const pendingCount = visitsForMonth.filter(v => v.status === 'Pending').length;
  const leadCount    = visitsForMonth.filter(v => v.status === 'Lead').length;
  const rejectedCount= visitsForMonth.filter(v => v.status === 'Rejected').length;

  const getPeriodLabel = () => {
    try {
      if (selectedMonth) return new Date(`${selectedMonth}-01`).toLocaleDateString('en-IN', { month:'long', year:'numeric' });
      return 'All Time';
    } catch { return selectedMonth; }
  };

  // Fetch the target for the active month
  const fetchMyTarget = useCallback(async (month) => {
    if (!employeeId) return;
    setTargetLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/visit-targets/employee`, {
        params: { employeeId, month },
      });
      setTargetData(res.data.data || null);
    } catch (err) {
      console.error('Fetch target error:', err);
      setTargetData(null);
    } finally {
      setTargetLoading(false);
    }
  }, [employeeId]);

  // Calculate visit counts for the selected target month
  const getVisitsForMonth = (month) => {
    if (!month) return [];
    return visits.filter(v => new Date(v.createdAt).toISOString().slice(0, 7) === month);
  };

  const targetMonthVisits = getVisitsForMonth(viewTargetMonth);
  const targetMonthTotal = targetMonthVisits.length;
  const targetMonthPending = targetMonthVisits.filter(v => v.status === 'Pending').length;
  const targetMonthLeads = targetMonthVisits.filter(v => v.status === 'Lead').length;
  const targetMonthRejected = targetMonthVisits.filter(v => v.status === 'Rejected').length;

  const openTargetModal = () => {
    setViewTargetMonth(selectedMonth || new Date().toISOString().slice(0, 7));
    setShowTargetModal(true);
    fetchMyTarget(selectedMonth || new Date().toISOString().slice(0, 7));
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await axios.delete(`${API_BASE_URL}/call-data/delete/${deleteId}`);
      setShowDelete(false);
      setDeleteId(null);
      fetchVisits();
    } catch (err) { console.error('Delete error:', err); }
    finally { setDeleting(false); }
  };

  return (
    <div className="emp-dash">
      <main className="p-4 sm:p-6 lg:p-8">

        {/* Header */}
        <div className="emp-dash__header">
          <div>
            <h1 className="emp-dash__greeting">My Visits &amp; <span>Call Records</span></h1>
            <p className="emp-dash__subtitle">
              {employeeName ? `${employeeName}'s visit records for the selected month.` : 'Your personal visit records and call logs.'}
            </p>
          </div>
          <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
            <div className="emp-dash__date-pill"><FiCalendar /><span>{getPeriodLabel()}</span></div>
            {/* View Targets */}
            <button
              onClick={openTargetModal}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.45rem 1rem', fontSize: '0.8rem', fontWeight: 700,
                color: '#fff',
                background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                border: 'none', borderRadius: '10px', cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(124,58,237,0.28)', transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(124,58,237,0.38)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 10px rgba(124,58,237,0.28)'; }}
            >
              <FaBullseye style={{ fontSize: '0.82rem' }} />
              View Targets
            </button>
            <button onClick={() => { setEditRecord(null); setShowForm(true); }}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-sm">
              <FaPlus size={11} />Add Visit
            </button>
          </div>
        </div>

        {/* KPI Stats */}
        {!loading && (
          <div className="emp-dash__stats">
            {[
              { label:'Total Visits', value:totalVisits,   meta:'this month',        iconClass:'emp-dash__stat-icon--rate',    icon:<FaPhone className="text-blue-500" />       },
              { label:'Pending',      value:pendingCount,  meta:'needs follow-up',   iconClass:'emp-dash__stat-icon--late',    icon:<FiActivity className="text-yellow-500" />  },
              { label:'Leads',        value:leadCount,     meta:'positive outcomes',  iconClass:'emp-dash__stat-icon--present', icon:<FiTrendingUp className="text-green-500" /> },
              { label:'Rejected',     value:rejectedCount, meta:'not interested',     iconClass:'emp-dash__stat-icon--absent',  icon:<MdCancel className="text-red-500" />       },
            ].map(stat => (
              <div key={stat.label} className="emp-dash__stat">
                <div className="emp-dash__stat-top">
                  <span className="emp-dash__stat-label">{stat.label}</span>
                  <div className={`emp-dash__stat-icon ${stat.iconClass}`}>{stat.icon}</div>
                </div>
                <div className="emp-dash__stat-value">{stat.value}</div>
                <div className="emp-dash__stat-meta">{stat.meta}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="emp-dash__card mb-6">
          <div className="emp-dash__card-header">
            <div>
              <h3 className="emp-dash__card-title flex items-center gap-2"><FiFilter className="text-blue-600" /> Filters &amp; Actions</h3>
              <p className="emp-dash__card-desc">Filter by month, status, or search by center / client name.</p>
            </div>
          </div>
          <div className="emp-dash__card-body bg-gray-50/50">
            <div className="flex flex-wrap items-end gap-4">
              {/* Search */}
              <div className="flex flex-col gap-1.5 flex-1 min-w-[180px]">
                <label className="text-xs font-medium text-gray-600">Search</label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  <input type="text" placeholder="Center, client or contact…" value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors">
                      <FaTimes className="text-[10px]" />
                    </button>
                  )}
                </div>
              </div>
              {/* Month */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600">Month</label>
                <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
                  onClick={e => e.target.showPicker && e.target.showPicker()}
                  className="h-9 px-3 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold" />
              </div>
              {/* Status */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600">Status</label>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                  className="h-9 px-3 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold">
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Lead">Lead</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              {/* Refresh */}
              <button onClick={() => { setSearchQuery(''); setStatusFilter('All'); setSelectedMonth(new Date().toISOString().slice(0,7)); fetchVisits(); }}
                className="h-9 px-3 text-xs font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5">
                <FaSync className={`text-[10px] ${loading ? 'animate-spin' : ''}`} />Refresh
              </button>
              {/* Add shortcut */}
              <button onClick={() => { setEditRecord(null); setShowForm(true); }}
                className="h-9 px-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all flex items-center gap-1.5 shadow-sm">
                <FaPlus size={10} />Add Visit
              </button>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200/50 text-xs text-gray-500 font-medium">
              Showing <strong className="text-gray-800">{filtered.length}</strong> of{' '}
              <strong className="text-gray-800">{visitsForMonth.length}</strong> records for{' '}
              <span className="text-blue-600 font-bold">{getPeriodLabel()}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-xs font-bold">{error}</div>
        )}

        {/* Table */}
        <div className="emp-dash__card">
          <div className="emp-dash__card-header">
            <div>
              <h3 className="emp-dash__card-title">Visit Records</h3>
              <p className="emp-dash__card-desc">All your visit and call records for <strong>{getPeriodLabel()}</strong>.</p>
            </div>
          </div>
          <div className="emp-dash__table-wrap employee-visits-table-wrap overflow-x-auto">
            <div className="sm:hidden px-4 pt-3 text-[11px] font-medium text-gray-500">
              Swipe left or right to see the full table.
            </div>
            <table className="emp-dash__table employee-visits-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th><div className="flex items-center gap-1"><FaCalendarAlt size={10} />Date</div></th>
                  <th>Center Name</th>
                  <th>Client &amp; Contact</th>
                  <th>Address</th>
                  <th style={{ textAlign:'center' }}>Status</th>
                  <th>Remarks</th>
                  <th style={{ textAlign:'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && visits.length === 0 ? (
                  <tr><td colSpan="8" className="py-10 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="emp-dash__spinner"></div>
                      <span className="text-sm font-medium text-gray-500">Loading visit records…</span>
                    </div>
                  </td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan="8" className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <FaPhone className="text-5xl text-gray-200" />
                      <p className="text-gray-500 font-semibold text-sm">No records found</p>
                      <p className="text-gray-400 text-xs">Try adjusting filters or add a new visit record.</p>
                      <button onClick={() => { setEditRecord(null); setShowForm(true); }}
                        className="mt-1 inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-sm">
                        <FaPlus size={10} />Add Visit
                      </button>
                    </div>
                  </td></tr>
                ) : (
                  <AnimatePresence>
                    {filtered.map((rec, idx) => (
                      <motion.tr key={rec._id}
                        initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                        transition={{ delay: Math.min(idx * 0.03, 0.4) }}
                        className="hover:bg-gray-50/60 transition-all group">
                        <td className="text-xs text-gray-400 font-medium">{idx + 1}</td>
                        <td className="whitespace-nowrap">
                          <span className="text-xs font-semibold text-gray-700">
                            {new Date(rec.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
                          </span>
                        </td>
                        <td><span className="font-semibold text-gray-800 text-xs whitespace-nowrap">{rec.centerName}</span></td>
                        <td>
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-900 font-medium">{rec.clientName}</span>
                            <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                              <FaPhone size={8} />{rec.contact}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="flex flex-col gap-1 max-w-[220px]">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-gray-600 truncate" title={rec.address}>{rec.address}</span>
                              {rec.addressLink && (
                                <a href={rec.addressLink} target="_blank" rel="noopener noreferrer"
                                  className="text-blue-500 hover:text-blue-700 flex-shrink-0" title="Open client address in Google Maps"
                                  onClick={e => e.stopPropagation()}>
                                  <FaLink size={10} />
                                </a>
                              )}
                            </div>
                            {rec.employeeLocation?.mapsLink && (
                              <a
                                href={rec.employeeLocation.mapsLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 hover:text-emerald-700"
                                title="Open captured employee location"
                              >
                                <FaMapMarkerAlt size={9} />
                                My location
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="text-center whitespace-nowrap"><StatusBadge status={rec.status} /></td>
                        <td><span className="text-xs text-gray-500 line-clamp-2 max-w-[160px]" title={rec.remarks}>{rec.remarks || '—'}</span></td>
                        <td className="text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => { setEditRecord(rec); setShowForm(true); }}
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="Edit">
                              <FaEdit size={11} />
                            </button>
                            <button onClick={() => { setDeleteId(rec._id); setShowDelete(true); }}
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors" title="Delete">
                              <FaTrash size={11} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>
          {!loading && filtered.length > 0 && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs font-semibold text-gray-500">
                Showing <span className="text-gray-900 font-bold">{filtered.length}</span> records for{' '}
                <span className="text-blue-600 font-bold">{getPeriodLabel()}</span>
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>Leads: <strong className="text-green-600">{filtered.filter(v => v.status==='Lead').length}</strong></span>
                <span>Pending: <strong className="text-amber-600">{filtered.filter(v => v.status==='Pending').length}</strong></span>
                <span>Rejected: <strong className="text-red-500">{filtered.filter(v => v.status==='Rejected').length}</strong></span>
              </div>
            </div>
          )}
        </div>
      </main>

      <VisitFormModal show={showForm} onClose={() => setShowForm(false)} onSave={fetchVisits} editRecord={editRecord} employeeId={employeeId} />
      <DeleteModal show={showDelete} onClose={() => { setShowDelete(false); setDeleteId(null); }} onConfirm={handleDeleteConfirm} deleting={deleting} />

      {/* ── View Targets Modal ── */}
      <AnimatePresence>
        {showTargetModal && (
          <>
            <motion.div key="tgt-bd"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowTargetModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]" />

            <motion.div key="tgt-panel"
              initial={{ opacity: 0, scale: 0.94, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 24 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="fixed inset-0 z-[201] flex items-center justify-center p-4"
              onClick={e => e.stopPropagation()}>

              <div
                className="bg-white rounded-2xl shadow-2xl w-full flex flex-col overflow-hidden"
                style={{ maxWidth: '460px' }}
                onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '1rem 1.3rem',
                  background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{
                      width: '2rem', height: '2rem', borderRadius: '8px',
                      background: 'rgba(255,255,255,0.18)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <FaBullseye style={{ color: '#fff', fontSize: '1rem' }} />
                    </div>
                    <div>
                      <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>My Target</h2>
                      <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.7rem', margin: 0 }}>{viewTargetMonth ? new Date(`${viewTargetMonth}-01`).toLocaleDateString('en-IN', { month:'long', year:'numeric' }) : 'Select Month'}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="month"
                      value={viewTargetMonth}
                      onChange={(e) => {
                        setViewTargetMonth(e.target.value);
                        fetchMyTarget(e.target.value);
                      }}
                      onClick={(e) => e.target.showPicker && e.target.showPicker()}
                      style={{
                        padding: '0.35rem 0.6rem',
                        fontSize: '0.75rem',
                        border: '1px solid rgba(255,255,255,0.3)',
                        borderRadius: '6px',
                        background: 'rgba(255,255,255,0.15)',
                        color: '#fff',
                        outline: 'none',
                        cursor: 'pointer',
                        colorScheme: 'light',
                      }}
                    />
                    <button
                      onClick={() => setShowTargetModal(false)}
                      style={{
                        width: '1.9rem', height: '1.9rem', borderRadius: '50%',
                        background: 'rgba(255,255,255,0.18)', border: 'none',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
                    >
                      <FaTimes style={{ fontSize: '0.8rem' }} />
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div style={{ padding: '1.3rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

                  {targetLoading ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280', fontSize: '0.82rem' }}>
                      <div className="emp-dash__spinner" style={{ margin: '0 auto 0.6rem' }} />
                      Loading target...
                    </div>
                  ) : (
                    <>
                      {/* Target Count Card */}
                      <div style={{
                        background: 'linear-gradient(135deg, #ede9fe 0%, #e0e7ff 100%)',
                        borderRadius: '14px', padding: '1.1rem 1.3rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      }}>
                        <div>
                          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#6d28d9', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Monthly Target
                          </div>
                          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#4c1d95', lineHeight: 1 }}>
                            {targetData ? targetData.target : '—'}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#7c3aed', marginTop: '0.2rem' }}>
                            {targetData ? 'visits assigned' : 'No target set for this month'}
                          </div>
                        </div>
                        <div style={{
                          width: '3.5rem', height: '3.5rem', borderRadius: '50%',
                          background: 'rgba(124,58,237,0.15)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <FaBullseye style={{ fontSize: '1.6rem', color: '#7c3aed' }} />
                        </div>
                      </div>

                      {/* Progress Bar (visits vs target) */}
                      {targetData && (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#374151' }}>Progress</span>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4f46e5' }}>
                              {targetMonthTotal} / {targetData.target} visits
                            </span>
                          </div>
                          <div style={{ height: '10px', background: '#e5e7eb', borderRadius: '99px', overflow: 'hidden' }}>
                            <div style={{
                              height: '100%',
                              width: `${Math.min((targetMonthTotal / targetData.target) * 100, 100)}%`,
                              background: targetMonthTotal >= targetData.target
                                ? 'linear-gradient(90deg, #16a34a, #22c55e)'
                                : 'linear-gradient(90deg, #7c3aed, #4f46e5)',
                              borderRadius: '99px',
                              transition: 'width 0.6s ease',
                            }} />
                          </div>
                          <div style={{ fontSize: '0.68rem', color: '#6b7280', marginTop: '0.3rem', textAlign: 'right' }}>
                            {targetMonthTotal >= targetData.target
                              ? '🎉 Target achieved!'
                              : `${targetData.target - targetMonthTotal} more visits to reach target`}
                          </div>
                        </div>
                      )}

                      {/* Stats Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.7rem' }}>
                        {/* Total Visits */}
                        <div style={{
                          background: '#eff6ff', borderRadius: '12px', padding: '0.85rem 1rem',
                          display: 'flex', alignItems: 'center', gap: '0.65rem',
                        }}>
                          <div style={{
                            width: '2rem', height: '2rem', borderRadius: '8px',
                            background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <FaPhone style={{ color: '#2563eb', fontSize: '0.85rem' }} />
                          </div>
                          <div>
                            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e3a8a', lineHeight: 1 }}>{targetMonthTotal}</div>
                            <div style={{ fontSize: '0.68rem', color: '#3b82f6', fontWeight: 600 }}>Total Visits</div>
                          </div>
                        </div>

                        {/* Leads */}
                        <div style={{
                          background: '#f0fdf4', borderRadius: '12px', padding: '0.85rem 1rem',
                          display: 'flex', alignItems: 'center', gap: '0.65rem',
                        }}>
                          <div style={{
                            width: '2rem', height: '2rem', borderRadius: '8px',
                            background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <FaCheckCircle style={{ color: '#16a34a', fontSize: '0.85rem' }} />
                          </div>
                          <div>
                            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#14532d', lineHeight: 1 }}>{targetMonthLeads}</div>
                            <div style={{ fontSize: '0.68rem', color: '#16a34a', fontWeight: 600 }}>Leads</div>
                          </div>
                        </div>

                        {/* Rejected */}
                        <div style={{
                          background: '#fff1f2', borderRadius: '12px', padding: '0.85rem 1rem',
                          display: 'flex', alignItems: 'center', gap: '0.65rem',
                        }}>
                          <div style={{
                            width: '2rem', height: '2rem', borderRadius: '8px',
                            background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <FaTimesCircle style={{ color: '#dc2626', fontSize: '0.85rem' }} />
                          </div>
                          <div>
                            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#7f1d1d', lineHeight: 1 }}>{targetMonthRejected}</div>
                            <div style={{ fontSize: '0.68rem', color: '#dc2626', fontWeight: 600 }}>Rejected</div>
                          </div>
                        </div>

                        {/* Pending */}
                        <div style={{
                          background: '#fffbeb', borderRadius: '12px', padding: '0.85rem 1rem',
                          display: 'flex', alignItems: 'center', gap: '0.65rem',
                        }}>
                          <div style={{
                            width: '2rem', height: '2rem', borderRadius: '8px',
                            background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <FiActivity style={{ color: '#d97706', fontSize: '0.85rem' }} />
                          </div>
                          <div>
                            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#78350f', lineHeight: 1 }}>{targetMonthPending}</div>
                            <div style={{ fontSize: '0.68rem', color: '#d97706', fontWeight: 600 }}>Pending</div>
                          </div>
                        </div>
                      </div>

                      {/* Month Note */}
                      <div style={{
                        background: '#f8fafc', borderRadius: '10px', padding: '0.6rem 0.9rem',
                        fontSize: '0.72rem', color: '#64748b', textAlign: 'center',
                        border: '1px solid #e2e8f0',
                      }}>
                        📅 Data shown for <strong style={{ color: '#334155' }}>{viewTargetMonth ? new Date(`${viewTargetMonth}-01`).toLocaleDateString('en-IN', { month:'long', year:'numeric' }) : 'Select Month'}</strong>
                      </div>
                    </>
                  )}
                </div>

                {/* Footer */}
                <div style={{
                  display: 'flex', justifyContent: 'flex-end',
                  padding: '0.8rem 1.3rem',
                  borderTop: '1px solid #e5e7eb',
                  background: '#f9fafb',
                }}>
                  <button
                    onClick={() => setShowTargetModal(false)}
                    style={{
                      padding: '0.45rem 1.2rem', fontSize: '0.8rem', fontWeight: 600,
                      color: '#374151', background: '#fff',
                      border: '1.5px solid #d1d5db', borderRadius: '8px', cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmployeeVisitsData;