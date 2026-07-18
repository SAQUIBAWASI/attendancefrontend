// import React, { useState, useEffect, useCallback } from 'react';
// import axios from 'axios';
// import { motion, AnimatePresence } from 'framer-motion';
// import { API_BASE_URL } from '../config';
// import {
//   FaPhone, FaLink, FaSearch, FaTimes, FaSync,
//   FaMapMarkerAlt, FaUser, FaCalendarAlt, FaCommentAlt,
//   FaDownload,
// } from 'react-icons/fa';
// import { FiFilter } from 'react-icons/fi'; // Removed FiCalendar from here
// import './EmployeeDashboard.css';

// /* ─── Status Badge ─── */
// const StatusBadge = ({ status }) => {
//   const cfg = {
//     Pending: { bg: '#fef0c7', text: '#b54708' },
//     Lead:    { bg: '#e0f2fe', text: '#0369a1' },
//     Rejected:{ bg: '#fee4e2', text: '#b42318' },
//   };
//   const s = cfg[status] || { bg: '#f3f4f6', text: '#374151' };
//   return (
//     <span style={{
//       display:'inline-flex', alignItems:'center', gap:4,
//       padding:'0.2rem 0.55rem', borderRadius:6,
//       fontSize:'0.7rem', fontWeight:700,
//       backgroundColor:s.bg, color:s.text,
//     }}>
//       {status}
//     </span>
//   );
// };

// /* ─── Main Component ─── */
// const TotalVisits = () => {
//   const [visits, setVisits] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedMonth, setSelectedMonth] = useState('');
//   const [statusFilter, setStatusFilter] = useState('All');

//   const fetchTotalVisits = useCallback(async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const res = await axios.get(`${API_BASE_URL}/call-data/all`);
//       if (res.data.success) setVisits(res.data.data || []);
//     } catch (err) {
//       console.error('Fetch total visits error:', err);
//       setError('Failed to load total visits. Please try again.');
//     } finally { setLoading(false); }
//   }, []);

//   useEffect(() => { fetchTotalVisits(); }, [fetchTotalVisits]);

//   const visitsForMonth = visits.filter(v => {
//     if (!selectedMonth) return true;
//     return new Date(v.createdAt).toISOString().slice(0, 7) === selectedMonth;
//   });

//   const filtered = visitsForMonth.filter(v => {
//     const q = searchQuery.toLowerCase();
//     const matchesSearch = !q ||
//       (v.centerName||'').toLowerCase().includes(q) ||
//       (v.clientName||'').toLowerCase().includes(q) ||
//       (v.contact||'').includes(q) ||
//       (v.employeeDetails?.name||'').toLowerCase().includes(q);
//     return matchesSearch && (statusFilter === 'All' || v.status === statusFilter);
//   });

//   const getPeriodLabel = () => {
//     try {
//       if (selectedMonth) return new Date(`${selectedMonth}-01`).toLocaleDateString('en-IN', { month:'long', year:'numeric' });
//       return 'All Time';
//     } catch { return selectedMonth; }
//   };

//   const handleDownload = () => {
//     const dataToDownload = filtered.map(v => ({
//       'Date': new Date(v.createdAt).toLocaleDateString('en-IN', {
//         day: '2-digit',
//         month: 'short',
//         year: 'numeric',
//       }),
//       'Center Name': v.centerName,
//       'Client Name': v.clientName,
//       'Contact': v.contact,
//       'Address': v.address,
//       'Google Maps Link': v.addressLink || '',
//       'Status': v.status,
//       'Remarks': v.remarks || '',
//       'Employee ID': v.employeeId,
//       'Employee Name': v.employeeDetails?.name || ''
//     }));

//     const headers = Object.keys(dataToDownload[0] || {});
//     const csvContent = [
//       headers.join(','),
//       ...dataToDownload.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
//     ].join('\n');

//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     const link = document.createElement('a');
//     const url = URL.createObjectURL(blob);
//     link.setAttribute('href', url);
//     link.setAttribute('download', `total-visits-${selectedMonth || 'all'}.csv`);
//     link.style.visibility = 'hidden';
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   return (
//     <div className="emp-dash">
//       <main className="p-4 sm:p-6 lg:p-8">

//         {/* Header */}
//         <div className="emp-dash__header">
//           <div>
//             <h1 className="emp-dash__greeting">Total <span>Visits</span></h1>
//             <p className="emp-dash__subtitle">
//               View all visit records across the organization.
//             </p>
//           </div>
//           <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
//             <div className="emp-dash__date-pill"><FaCalendarAlt /><span>{getPeriodLabel()}</span></div>
//           </div>
//         </div>

//         {/* Filters */}
//         <div className="emp-dash__card mb-6">
//           <div className="emp-dash__card-header">
//             <div>
//               <h3 className="emp-dash__card-title flex items-center gap-2"><FiFilter className="text-blue-600" /> Filters &amp; Search</h3>
//               <p className="emp-dash__card-desc">Filter by month, status, or search by center, client, or employee name.</p>
//             </div>
//           </div>
//           <div className="emp-dash__card-body bg-gray-50/50">
//             <div className="flex flex-wrap items-end gap-4">
//               {/* Search */}
//               <div className="flex flex-col gap-1.5 flex-1 min-w-[180px]">
//                 <label className="text-xs font-medium text-gray-600">Search</label>
//                 <div className="relative">
//                   <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
//                   <input type="text" placeholder="Center, client, employee or contact…" value={searchQuery}
//                     onChange={e => setSearchQuery(e.target.value)}
//                     className="w-full pl-9 pr-8 py-2 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
//                   {searchQuery && (
//                     <button onClick={() => setSearchQuery('')}
//                       className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors">
//                       <FaTimes className="text-[10px]" />
//                     </button>
//                   )}
//                 </div>
//               </div>
//               {/* Month */}
//               <div className="flex flex-col gap-1.5">
//                 <label className="text-xs font-medium text-gray-600">Month</label>
//                 <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
//                   onClick={e => e.target.showPicker && e.target.showPicker()}
//                   className="h-9 px-3 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold" />
//               </div>
//               {/* Status */}
//               <div className="flex flex-col gap-1.5">
//                 <label className="text-xs font-medium text-gray-600">Status</label>
//                 <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
//                   className="h-9 px-3 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold">
//                   <option value="All">All Statuses</option>
//                   <option value="Pending">Pending</option>
//                   <option value="Lead">Lead</option>
//                   <option value="Rejected">Rejected</option>
//                 </select>
//               </div>
//               {/* Refresh */}
//               <button onClick={() => { setSearchQuery(''); setStatusFilter('All'); setSelectedMonth(''); fetchTotalVisits(); }}
//                 className="h-9 px-3 text-xs font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5">
//                 <FaSync className={`text-[10px] ${loading ? 'animate-spin' : ''}`} />Refresh
//               </button>
//               {/* Download */}
//               <button onClick={handleDownload} disabled={filtered.length === 0}
//                 className="h-9 px-3 text-xs font-semibold text-white bg-green-600 border border-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed">
//                 <FaDownload className="text-[10px]" />Download
//               </button>
//             </div>
//             <div className="mt-3 pt-3 border-t border-gray-200/50 text-xs text-gray-500 font-medium">
//               Showing <strong className="text-gray-800">{filtered.length}</strong> of{' '}
//               <strong className="text-gray-800">{visitsForMonth.length}</strong> records for{' '}
//               <span className="text-blue-600 font-bold">{getPeriodLabel()}</span>
//             </div>
//           </div>
//         </div>

//         {error && (
//           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-xs font-bold">{error}</div>
//         )}

//         {/* Table */}
//         <div className="emp-dash__card">
//           <div className="emp-dash__card-header">
//             <div>
//               <h3 className="emp-dash__card-title">All Visit Records</h3>
//               <p className="emp-dash__card-desc">All visits for <strong>{getPeriodLabel()}</strong>.</p>
//             </div>
//           </div>
//           <div className="emp-dash__table-wrap overflow-x-auto">
//             <table className="emp-dash__table">
//               <thead>
//                 <tr>
//                   <th>#</th>
//                   <th><div className="flex items-center gap-1"><FaCalendarAlt size={10} />Date</div></th>
//                   <th>Employee</th>
//                   <th>Center Name</th>
//                   <th>Client &amp; Contact</th>
//                   <th>Address</th>
//                   <th style={{ textAlign:'center' }}>Status</th>
//                   <th>Remarks</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {loading && visits.length === 0 ? (
//                   <tr><td colSpan="8" className="py-10 text-center">
//                     <div className="flex flex-col items-center justify-center gap-3">
//                       <div className="emp-dash__spinner"></div>
//                       <span className="text-sm font-medium text-gray-500">Loading total visits…</span>
//                     </div>
//                   </td></tr>
//                 ) : filtered.length === 0 ? (
//                   <tr><td colSpan="8" className="py-14 text-center">
//                     <div className="flex flex-col items-center justify-center gap-3">
//                       <FaPhone className="text-5xl text-gray-200" />
//                       <p className="text-gray-500 font-semibold text-sm">No visits found</p>
//                       <p className="text-gray-400 text-xs">Try adjusting filters or check back later.</p>
//                     </div>
//                   </td></tr>
//                 ) : (
//                   <AnimatePresence>
//                     {filtered.map((rec, idx) => (
//                       <motion.tr key={rec._id}
//                         initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
//                         transition={{ delay: Math.min(idx * 0.03, 0.4) }}
//                         className="hover:bg-gray-50/60 transition-all group">
//                         <td className="text-xs text-gray-400 font-medium">{idx + 1}</td>
//                         <td className="whitespace-nowrap">
//                           <span className="text-xs font-semibold text-gray-700">
//                             {new Date(rec.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
//                           </span>
//                         </td>
//                         <td>
//                           <div className="flex flex-col">
//                             <span className="text-xs text-gray-900 font-medium">{rec.employeeDetails?.name || rec.employeeId}</span>
//                             <span className="text-[10px] text-gray-400">{rec.employeeId}</span>
//                           </div>
//                         </td>
//                         <td><span className="font-semibold text-gray-800 text-xs whitespace-nowrap">{rec.centerName}</span></td>
//                         <td>
//                           <div className="flex flex-col">
//                             <span className="text-xs text-gray-900 font-medium">{rec.clientName}</span>
//                             <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
//                               <FaPhone size={8} />{rec.contact}
//                             </span>
//                           </div>
//                         </td>
//                         <td>
//                           <div className="flex items-center gap-1.5 max-w-[180px]">
//                             <span className="text-xs text-gray-600 truncate" title={rec.address}>{rec.address}</span>
//                             {rec.addressLink && (
//                               <a href={rec.addressLink} target="_blank" rel="noopener noreferrer"
//                                 className="text-blue-500 hover:text-blue-700 flex-shrink-0" title="Open in Google Maps"
//                                 onClick={e => e.stopPropagation()}>
//                                 <FaLink size={10} />
//                               </a>
//                             )}
//                           </div>
//                         </td>
//                         <td className="text-center whitespace-nowrap"><StatusBadge status={rec.status} /></td>
//                         <td><span className="text-xs text-gray-500 line-clamp-2 max-w-[160px]" title={rec.remarks}>{rec.remarks || '—'}</span></td>
//                       </motion.tr>
//                     ))}
//                   </AnimatePresence>
//                 )}
//               </tbody>
//             </table>
//           </div>
//           {!loading && filtered.length > 0 && (
//             <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50/50">
//               <p className="text-xs font-semibold text-gray-500">
//                 Showing <span className="text-gray-900 font-bold">{filtered.length}</span> records for{' '}
//                 <span className="text-blue-600 font-bold">{getPeriodLabel()}</span>
//               </p>
//               <div className="flex items-center gap-4 text-xs text-gray-500">
//                 <span>Leads: <strong className="text-green-600">{filtered.filter(v => v.status==='Lead').length}</strong></span>
//                 <span>Pending: <strong className="text-amber-600">{filtered.filter(v => v.status==='Pending').length}</strong></span>
//                 <span>Rejected: <strong className="text-red-500">{filtered.filter(v => v.status==='Rejected').length}</strong></span>
//               </div>
//             </div>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// };

// export default TotalVisits;





import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import {
  FaPhone, FaLink, FaSearch, FaTimes, FaSync,
  FaCalendarAlt, FaDownload, FaTimesCircle

} from 'react-icons/fa';
import { FiFilter, FiActivity, FiTrendingUp } from 'react-icons/fi';
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
const TotalVisits = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchTotalVisits = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE_URL}/call-data/all`);
      if (res.data.success) setVisits(res.data.data || []);
    } catch (err) {
      console.error('Fetch total visits error:', err);
      setError('Failed to load total visits. Please try again.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTotalVisits(); }, [fetchTotalVisits]);

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
    return matchesSearch && (statusFilter === 'All' || v.status === statusFilter);
  });

  const getPeriodLabel = () => {
    try {
      if (selectedMonth) return new Date(`${selectedMonth}-01`).toLocaleDateString('en-IN', { month:'long', year:'numeric' });
      return 'All Time';
    } catch { return selectedMonth; }
  };

  const totalVisits = visitsForMonth.length;
  const pendingVisits = visitsForMonth.filter((v) => v.status === 'Pending').length;
  const leadVisits = visitsForMonth.filter((v) => v.status === 'Lead').length;
  const rejectedVisits = visitsForMonth.filter((v) => v.status === 'Rejected').length;

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
    link.setAttribute('download', `total-visits-${selectedMonth || 'all'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="emp-dash">
      <main className="p-4 sm:p-6 lg:p-8">

        {/* Header */}
        <div className="emp-dash__header">
          <div>
            <h1 className="emp-dash__greeting">Total <span>Visits</span></h1>
            <p className="emp-dash__subtitle">
              View all visit records across the organization.
            </p>
          </div>
          <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
            <div className="emp-dash__date-pill">
              <FaCalendarAlt />
              <span>{getPeriodLabel()}</span>
            </div>
          </div>
        </div>

        {!loading && (
          <div className="emp-dash__stats">
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

        {/* Filters */}
        <div className="emp-dash__card mb-6">
          <div className="emp-dash__card-header">
            <div>
              <h3 className="emp-dash__card-title flex items-center gap-2"><FiFilter className="text-blue-600" /> Filters &amp; Actions</h3>
              <p className="emp-dash__card-desc">Filter by month, status, or search by center, client, or employee name.</p>
            </div>
          </div>
          <div className="emp-dash__card-body bg-gray-50/50">
            {/* Desktop Filters */}
            <div className="hidden md:flex flex-wrap items-end gap-4">
              {/* Search */}
              <div className="flex flex-col gap-1.5 flex-1 min-w-[180px]">
                <label className="text-xs font-medium text-gray-600">Search</label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  <input type="text" placeholder="Center, client, employee or contact…" value={searchQuery}
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
              <button onClick={() => { setSearchQuery(''); setStatusFilter('All'); setSelectedMonth(''); fetchTotalVisits(); }}
                className="h-9 px-3 text-xs font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5">
                <FaSync className={`text-[10px] ${loading ? 'animate-spin' : ''}`} />Refresh
              </button>
              {/* Download */}
              <button onClick={handleDownload} disabled={filtered.length === 0}
                className="h-9 px-3 text-xs font-semibold text-white bg-green-600 border border-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed">
                <FaDownload className="text-[10px]" />Download
              </button>
            </div>

            {/* Mobile Filters */}
            <div className="md:hidden flex flex-col gap-3">
              {/* Search */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600">Search</label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  <input type="text" placeholder="Search…" value={searchQuery}
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

              <div className="grid grid-cols-2 gap-2">
                {/* Month */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-600">Month</label>
                  <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
                    onClick={e => e.target.showPicker && e.target.showPicker()}
                    className="w-full h-9 px-3 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold" />
                </div>
                {/* Status */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-600">Status</label>
                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                    className="w-full h-9 px-3 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold">
                    <option value="All">All</option>
                    <option value="Pending">Pending</option>
                    <option value="Lead">Lead</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Refresh */}
                <button onClick={() => { setSearchQuery(''); setStatusFilter('All'); setSelectedMonth(''); fetchTotalVisits(); }}
                  className="w-full h-9 px-3 text-xs font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5">
                  <FaSync className={`text-[10px] ${loading ? 'animate-spin' : ''}`} />Refresh
                </button>
                {/* Download */}
                <button onClick={handleDownload} disabled={filtered.length === 0}
                  className="w-full h-9 px-3 text-xs font-semibold text-white bg-green-600 border border-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed">
                  <FaDownload className="text-[10px]" />Download
                </button>
              </div>
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
              <h3 className="emp-dash__card-title">All Visit Records</h3>
              <p className="emp-dash__card-desc">All visits for <strong>{getPeriodLabel()}</strong>.</p>
            </div>
          </div>
          
          {/* Swipe hint for mobile */}
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
                      <span className="text-sm font-medium text-gray-500">Loading total visits…</span>
                    </div>
                  </td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan="8" className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <FaPhone className="text-5xl text-gray-200" />
                      <p className="text-gray-500 font-semibold text-sm">No visits found</p>
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
                Showing <span className="text-gray-900 font-bold">{filtered.length}</span> records for{' '}
                <span className="text-blue-600 font-bold">{getPeriodLabel()}</span>
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                <span>Leads: <strong className="text-green-600">{filtered.filter(v => v.status==='Lead').length}</strong></span>
                <span>Pending: <strong className="text-amber-600">{filtered.filter(v => v.status==='Pending').length}</strong></span>
                <span>Rejected: <strong className="text-red-500">{filtered.filter(v => v.status==='Rejected').length}</strong></span>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};



export default TotalVisits