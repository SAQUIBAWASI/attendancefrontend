import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import {
  FaPhone, FaLink, FaSearch, FaTimes, FaSync,
  FaCalendarAlt, FaDownload, FaTimesCircle, FaChevronUp, FaChevronDown
} from 'react-icons/fa';
import { FiFilter, FiActivity, FiTrendingUp, FiTrash2, FiRefreshCw } from 'react-icons/fi';
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

/* ─── Main Component ─── */
const PendingVisits = () => {
  const [visits, setVisits] = useState([]);
  const [summaryVisits, setSummaryVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // ✅ Month filter - default to current month
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const fetchPendingVisits = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [pendingRes, allRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/call-data/pending`),
        axios.get(`${API_BASE_URL}/call-data/all`)
      ]);

      if (pendingRes.data.success) setVisits(pendingRes.data.data || []);
      if (allRes.data.success) setSummaryVisits(allRes.data.data || []);
    } catch (err) {
      console.error('Fetch pending visits error:', err);
      setError('Failed to load pending visits. Please try again.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPendingVisits(); }, [fetchPendingVisits]);

  const visitsForMonth = visits.filter(v => {
    if (!selectedMonth) return true;
    return new Date(v.createdAt).toISOString().slice(0, 7) === selectedMonth;
  });

  const filtered = visitsForMonth.filter(v => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      (v.centerName||'').toLowerCase().includes(q) ||
      (v.clientName||'').toLowerCase().includes(q) ||
      (v.contact||'').includes(q) ||
      (v.employeeDetails?.name||'').toLowerCase().includes(q);
    return matchesSearch;
  });

  const summaryVisitsForMonth = summaryVisits.filter(v => {
    if (!selectedMonth) return true;
    return new Date(v.createdAt).toISOString().slice(0, 7) === selectedMonth;
  });

  const getPeriodLabel = () => {
    try {
      if (selectedMonth) return new Date(`${selectedMonth}-01`).toLocaleDateString('en-IN', { month:'long', year:'numeric' });
      return 'All Time';
    } catch { return selectedMonth; }
  };

  const totalVisits = summaryVisitsForMonth.length;
  const pendingVisits = summaryVisitsForMonth.filter((v) => v.status === 'Pending').length;
  const leadVisits = summaryVisitsForMonth.filter((v) => v.status === 'Lead').length;
  const rejectedVisits = summaryVisitsForMonth.filter((v) => v.status === 'Rejected').length;

  // ✅ Get default month
  const getDefaultMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };
  const isDefaultMonth = selectedMonth === getDefaultMonth();

  // ✅ Check if any filter is active
  const hasActiveFilters = searchQuery || !isDefaultMonth;

  // ✅ Format month for display
  const formatMonthDisplay = (monthValue) => {
    if (!monthValue) return '';
    const [year, month] = monthValue.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  // ✅ Get filter summary for display
  const getFilterSummary = () => {
    const parts = [];
    if (searchQuery) {
      parts.push(`Search: "${searchQuery}"`);
    }
    if (!isDefaultMonth) {
      parts.push(`Month: ${formatMonthDisplay(selectedMonth)}`);
    }
    return parts;
  };

  const clearFilters = () => {
    setSearchQuery('');
    const now = new Date();
    setSelectedMonth(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
    if (window.innerWidth < 640) {
      setShowMobileFilters(false);
    }
  };

  const handleDownload = () => {
    const dataToDownload = filtered.map(v => ({
      'Date': new Date(v.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      'Center Name': v.centerName,
      'Client Name': v.clientName,
      'Contact': v.contact,
      'Address': v.address,
      'Google Maps Link': v.addressLink || '',
      'Status': v.status,
      'Remarks': v.remarks || '',
      'Employee ID': v.employeeId,
      'Employee Name': v.employeeDetails?.name || ''
    }));

    const headers = Object.keys(dataToDownload[0] || {});
    const csvContent = [
      headers.join(','),
      ...dataToDownload.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `pending-visits-${selectedMonth || 'all'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="emp-dash">
      <main className="p-4 sm:p-6 lg:p-8">

        {/* Header - Title on Left, Date and Filters on Right */}
        <div className="hidden lg:flex items-center justify-between gap-3 flex-wrap mb-6">
          <div>
            <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap flex items-center gap-2">
              Pending <span>Visits</span>
            </h1>
            {/* <p className="emp-dash__subtitle text-sm text-gray-500">
              View all pending visit records across the organization.
            </p> */}
          </div>

          {/* Right side: Date + All Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative min-w-[130px]">
              <span className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FaSearch className="text-[10px]" />
              </span>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-[130px] pl-7 pr-2 py-1.5 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {/* Month Filter */}
            <input
              type="month"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="w-[120px] h-8 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />

            {/* Refresh Button */}
            <button
              onClick={() => { setSearchQuery(''); fetchPendingVisits(); }}
              disabled={loading}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm whitespace-nowrap"
            >
              <FiRefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            {/* Export Button */}
            <button
              onClick={handleDownload}
              disabled={filtered.length === 0}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all shadow-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaDownload size={12} />
              Export
            </button>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm whitespace-nowrap"
              >
                <FiTrash2 className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Mobile Header - Only Title and Date */}
        <div className="lg:hidden flex items-center justify-between gap-2 flex-wrap mb-3">
          <div>
            <h1 className="text-base font-bold whitespace-nowrap">
              Pending <span className="text-indigo-600">Visits</span>
            </h1>
          </div>
          <div className="emp-dash__date-pill text-[10px] px-2 py-1">
            <FaCalendarAlt className="text-[10px]" />
            <span>{getPeriodLabel()}</span>
          </div>
        </div>

        {/* Mobile Filters Toggle */}
        <div className="lg:hidden mb-3">
          <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-gray-200">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-700"
            >
              <FiFilter className="text-blue-600 text-base" />
              <span>Filters &amp; Actions</span>
              {showMobileFilters ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
            </button>
            <span className="text-xs text-gray-500">
              <strong>{filtered.length}</strong> pending visits
            </span>
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
                    placeholder="Search by center, client, employee..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Month</label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-gray-200 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { setSearchQuery(''); fetchPendingVisits(); }}
                    disabled={loading}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm"
                  >
                    <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                  <button
                    onClick={handleDownload}
                    disabled={filtered.length === 0}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaDownload className="w-4 h-4" />
                    Export
                  </button>
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {!loading && (
          <div className="grid grid-cols-1 gap-3 mb-6 sm:grid-cols-2 lg:grid-cols-4">
            <Link to="/total-visits" className="emp-dash__stat" style={{ textDecoration: 'none', cursor: 'pointer' }}>
              <div className="emp-dash__stat-top">
                <span className="emp-dash__stat-label">Total Visits</span>
                <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                  <FaPhone className="text-blue-500" />
                </div>
              </div>
              <div className="emp-dash__stat-value">{totalVisits}</div>
              <div className="emp-dash__stat-meta">{selectedMonth ? 'for selected month' : 'all periods'}</div>
            </Link>

            <Link to="/pending-visits" className="emp-dash__stat" style={{ textDecoration: 'none', cursor: 'pointer' }}>
              <div className="emp-dash__stat-top">
                <span className="emp-dash__stat-label">Pending</span>
                <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                  <FiActivity className="text-yellow-500" />
                </div>
              </div>
              <div className="emp-dash__stat-value">{pendingVisits}</div>
              <div className="emp-dash__stat-meta">needs follow-up</div>
            </Link>

            <Link to="/leads" className="emp-dash__stat" style={{ textDecoration: 'none', cursor: 'pointer' }}>
              <div className="emp-dash__stat-top">
                <span className="emp-dash__stat-label">Leads</span>
                <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                  <FiTrendingUp className="text-green-500" />
                </div>
              </div>
              <div className="emp-dash__stat-value">{leadVisits}</div>
              <div className="emp-dash__stat-meta">positive outcomes</div>
            </Link>

            <Link to="/rejected-visits" className="emp-dash__stat" style={{ textDecoration: 'none', cursor: 'pointer' }}>
              <div className="emp-dash__stat-top">
                <span className="emp-dash__stat-label">Rejected</span>
                <div className="emp-dash__stat-icon emp-dash__stat-icon--absent">
                  <FaTimesCircle className="text-red-500" />
                </div>
              </div>
              <div className="emp-dash__stat-value">{rejectedVisits}</div>
              <div className="emp-dash__stat-meta">not interested</div>
            </Link>
          </div>
        )}

        {/* ✅ Active Filter Indicator */}
        {/* {hasActiveFilters && (
          <div className="mb-4 flex flex-wrap items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xs">
            <span className="font-semibold text-blue-700">📅 Current Filters:</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {getFilterSummary().map((item, index) => (
                <span key={index} className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-medium">
                  {item}
                </span>
              ))}
            </div>
            <button 
              onClick={clearFilters}
              className="ml-auto text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
            >
              <FiTrash2 className="w-3 h-3" />
              Clear All
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-xs font-bold">{error}</div>
        )} */}

        {/* Table */}
        <div className="emp-dash__card">
          <div className="emp-dash__card-header">
            <div>
              <h3 className="emp-dash__card-title">Pending Visit Records</h3>
              <p className="emp-dash__card-desc">All pending visits for <strong>{getPeriodLabel()}</strong>.</p>
            </div>
          </div>

          <div className="sm:hidden px-4 pt-3 text-[11px] font-medium text-gray-500">
            Swipe left or right to see the full table.
          </div>

          <div className="emp-dash__table-wrap visits-summary-table-wrap overflow-x-auto">
            <table className="emp-dash__table visits-summary-table" style={{ minWidth: '920px' }}>
              <thead>
                <tr>
                  <th style={{ minWidth: '40px' }}>#</th>
                  <th style={{ minWidth: '100px' }}><div className="flex items-center gap-1"><FaCalendarAlt size={10} />Date</div></th>
                  <th style={{ minWidth: '120px' }}>Employee</th>
                  <th style={{ minWidth: '120px' }}>Center Name</th>
                  <th style={{ minWidth: '150px' }}>Client &amp; Contact</th>
                  <th style={{ minWidth: '180px' }}>Address</th>
                  <th style={{ minWidth: '80px', textAlign:'center' }}>Status</th>
                  <th style={{ minWidth: '120px' }}>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {loading && visits.length === 0 ? (
                  <tr><td colSpan="8" className="py-10 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="emp-dash__spinner"></div>
                      <span className="text-sm font-medium text-gray-500">Loading pending visits…</span>
                    </div>
                  </td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan="8" className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <FaPhone className="text-5xl text-gray-200" />
                      <p className="text-gray-500 font-semibold text-sm">No pending visits found</p>
                      <p className="text-gray-400 text-xs">Try adjusting filters or check back later.</p>
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
                        <td>
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-900 font-medium">{rec.employeeDetails?.name || rec.employeeId}</span>
                            <span className="text-[10px] text-gray-400">{rec.employeeId}</span>
                          </div>
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
                          <div className="flex items-center gap-1.5 max-w-[180px]">
                            <span className="text-xs text-gray-600 truncate" title={rec.address}>{rec.address}</span>
                            {rec.addressLink && (
                              <a href={rec.addressLink} target="_blank" rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-700 flex-shrink-0" title="Open in Google Maps"
                                onClick={e => e.stopPropagation()}>
                                <FaLink size={10} />
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="text-center whitespace-nowrap"><StatusBadge status={rec.status} /></td>
                        <td><span className="text-xs text-gray-500 line-clamp-2 max-w-[160px]" title={rec.remarks}>{rec.remarks || '—'}</span></td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>
          {!loading && filtered.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 sm:px-6 py-3 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs font-semibold text-gray-500">
                Showing <span className="text-gray-900 font-bold">{filtered.length}</span> pending records for{' '}
                <span className="text-blue-600 font-bold">{getPeriodLabel()}</span>
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                <span>Pending: <strong className="text-amber-600">{filtered.length}</strong></span>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PendingVisits;