// components/EmployeeLocations.js
import React, { useState, useEffect } from 'react';
import CountUp from 'react-countup';
import { 
  FaMapMarkerAlt, FaUser, FaPhone, FaEnvelope, FaIdCard, 
  FaBuilding, FaSearch, FaSync, FaExternalLinkAlt,
  FaUsers, FaMapPin, FaEye, FaCopy, FaCheckCircle,
  FaClock, FaGlobe, FaUserCheck, FaLocationArrow,
  FaCalendarCheck, FaHistory, FaSignInAlt, FaSignOutAlt,
  FaUserPlus, FaArrowRight, FaDirections, FaEye as FaEyeIcon,
  FaFilter, FaTimes
} from 'react-icons/fa';
import { FiCalendar, FiRefreshCw, FiInfo, FiAlertCircle, FiSearch } from 'react-icons/fi';
import { toast } from 'react-toastify';
import axios from 'axios';

const API_BASE_URL = 'https://api.timelyhealth.in';

export default function EmployeeLocations() {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [stats, setStats] = useState({ total: 0, withAddress: 0, withoutAddress: 0 });
  const [saveStatus, setSaveStatus] = useState('');
  const [addressPopup, setAddressPopup] = useState({ show: false, address: '', label: '' });

  // ─── Simple Filters ───
  const [filterDate, setFilterDate] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');

  const saveStatusTimeoutRef = React.useRef(null);

  const showSaveStatus = (msg) => {
    setSaveStatus(msg);
    clearTimeout(saveStatusTimeoutRef.current);
    saveStatusTimeoutRef.current = setTimeout(() => setSaveStatus(''), 3500);
  };

  const fetchEmployeeLocations = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.get(`${API_BASE_URL}/api/employees/employee-locations`);

      console.log('📍 Employee locations response:', response.data);

      if (response.data.success) {
        setEmployees(response.data.employees || []);
        setFilteredEmployees(response.data.employees || []);
        setStats(response.data.stats || { total: 0, withAddress: 0, withoutAddress: 0 });
        toast.success(`Loaded ${response.data.employees?.length || 0} employee locations`);
      } else {
        setError(response.data.message || 'Failed to fetch employee locations');
        toast.error(response.data.message || 'Failed to fetch employee locations');
      }
    } catch (err) {
      console.error('❌ Error fetching employee locations:', err);
      setError(err.response?.data?.message || 'Error fetching employee locations. Please try again.');
      toast.error('Failed to load employee locations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeLocations();
  }, []);

  // ─── Combined Filter (Search + Date) ───
  useEffect(() => {
    let result = employees;

    // ─── Search Filter (Employee Name/ID) ───
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(emp => 
        emp.name?.toLowerCase().includes(term) ||
        emp.employeeId?.toLowerCase().includes(term) ||
        emp.email?.toLowerCase().includes(term)
      );
    }

    // ─── Employee Filter (Dropdown) ───
    if (filterEmployee) {
      result = result.filter(emp => emp._id === filterEmployee);
    }

    // ─── Date Filter ───
    if (filterDate) {
      const selectedDate = new Date(filterDate);
      selectedDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);

      result = result.filter(emp => {
        const loginDate = emp.lastLoginLocation?.timestamp ? new Date(emp.lastLoginLocation.timestamp) : null;
        const checkinDate = emp.lastCheckInLocation?.timestamp ? new Date(emp.lastCheckInLocation.timestamp) : null;
        const checkoutDate = emp.lastCheckOutLocation?.timestamp ? new Date(emp.lastCheckOutLocation.timestamp) : null;

        return (loginDate && loginDate >= selectedDate && loginDate < nextDay) ||
               (checkinDate && checkinDate >= selectedDate && checkinDate < nextDay) ||
               (checkoutDate && checkoutDate >= selectedDate && checkoutDate < nextDay);
      });
    }

    setFilteredEmployees(result);
  }, [searchTerm, employees, filterDate, filterEmployee]);

  const openDetails = (employee) => {
    setSelectedEmployee(employee);
    setShowDetails(true);
    document.body.style.overflow = 'hidden';
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedEmployee(null);
    document.body.style.overflow = 'auto';
  };

  const openInGoogleMaps = (lat, lng) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  };

  const redirectToLocation = (lat, lng, name) => {
    setRedirecting(true);
    const url = `https://www.google.com/maps/dir//${lat},${lng}/@${lat},${lng},15z`;
    window.open(url, '_blank');
    showSaveStatus(`📍 Redirecting to ${name}'s location...`);
    setTimeout(() => setRedirecting(false), 2000);
  };

  const goToLocation = (lat, lng, label) => {
    if (lat && lng) {
      const url = `https://www.google.com/maps/dir//${lat},${lng}/@${lat},${lng},15z`;
      window.open(url, '_blank');
      toast.success(`📍 Navigating to ${label} location`);
    } else {
      toast.warning('Location not available');
    }
  };

  const showAddressPopup = (address, label) => {
    if (address) {
      setAddressPopup({ show: true, address, label });
    } else {
      toast.info('Address not available');
    }
  };

  const closeAddressPopup = () => {
    setAddressPopup({ show: false, address: '', label: '' });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      showSaveStatus('📋 Address copied to clipboard!');
      toast.success('Address copied!');
    }).catch(() => {
      toast.warning('Failed to copy');
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterDate('');
    setFilterEmployee('');
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '-';
    const now = new Date();
    const past = new Date(dateString);
    const diff = Math.floor((now - past) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    return formatDateTime(dateString);
  };

  const getStatusBadge = (employee) => {
    if (employee.latitude && employee.longitude) {
      const latest = employee.lastCheckOutLocation?.timestamp || 
                     employee.lastCheckInLocation?.timestamp || 
                     employee.lastLoginLocation?.timestamp;
      const isRecent = latest && (new Date() - new Date(latest)) < 600000;

      if (isRecent) {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <span className="w-2 h-2 mr-1 bg-green-500 rounded-full animate-pulse"></span>
            Online
          </span>
        );
      }
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <span className="w-2 h-2 mr-1 bg-yellow-500 rounded-full"></span>
          Away
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
        <span className="w-2 h-2 mr-1 bg-gray-400 rounded-full"></span>
        No Location
      </span>
    );
  };

  // ─── Get Initials ───
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // ─── Get Random Color ───
  const getAvatarColor = (name) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8C471', '#82E0AA', '#F1948A', '#85929E', '#73C6B6'
    ];
    let hash = 0;
    for (let i = 0; i < name?.length || 0; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (filterDate) count++;
    if (filterEmployee) count++;
    return count;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="text-lg font-semibold text-gray-700">Loading Employee Locations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 sm:p-6 lg:p-8">
        {saveStatus && (
          <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg font-semibold text-white animate-fade-in ${
            saveStatus.includes('✅') || saveStatus.includes('📍') 
              ? 'bg-green-600 border-l-4 border-green-700' 
              : 'bg-red-500 border-l-4 border-red-600'
          }`}>
            {saveStatus}
          </div>
        )}

        {/* ─── Address Popup ─── */}
        {addressPopup.show && (
          <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn"
            onClick={closeAddressPopup}
          >
            <div 
              className="bg-white rounded-2xl max-w-md w-full mx-4 p-6 shadow-2xl animate-scaleUp border border-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-blue-500 text-lg" />
                  <h3 className="text-lg font-bold text-gray-900">{addressPopup.label}</h3>
                </div>
                <button
                  onClick={closeAddressPopup}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FaTimes className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-sm text-gray-700 leading-relaxed">{addressPopup.address}</p>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => copyToClipboard(addressPopup.address)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition flex items-center justify-center gap-2"
                >
                  <FaCopy className="text-xs" /> Copy Address
                </button>
                <button
                  onClick={closeAddressPopup}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
              Employee <span className="text-blue-600">Locations</span>
            </h1>
            {/* <p className="mt-1 text-sm text-gray-600">
              Track real-time location of all employees
            </p> */}
          </div>
          <div className="flex gap-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm">
              <FiCalendar className="text-blue-600" />
              <span className="text-sm font-medium text-gray-600">
                {new Date().toLocaleString("en-US", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-3 mb-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Employees</span>
              <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <FaUsers className="text-base" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              <CountUp end={stats.total || employees.length} duration={1} />
            </div>
            <div className="mt-1 text-xs text-gray-500">registered employees</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">With Location</span>
              <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-green-50 text-green-600">
                <FaMapPin className="text-base" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              <CountUp end={employees.filter(emp => emp.latitude && emp.longitude).length} duration={1} />
            </div>
            <div className="mt-1 text-xs text-gray-500">live tracking</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">With Address</span>
              <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                <FaCheckCircle className="text-base" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              <CountUp end={stats.withAddress || 0} duration={1} />
            </div>
            <div className="mt-1 text-xs text-gray-500">address resolved</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Filtered</span>
              <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                <FaFilter className="text-base" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              <CountUp end={filteredEmployees.length} duration={1} />
            </div>
            <div className="mt-1 text-xs text-gray-500">
              {getActiveFilterCount() > 0 ? `${getActiveFilterCount()} filters` : 'no filters'}
            </div>
          </div>
        </div>

        {/* ─── Simple Filters ─── */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto">
                {/* ─── Employee Filter ─── */}
                <div className="flex items-center gap-2">
                  <FaUser className="text-gray-400" />
                  <select
                    value={filterEmployee}
                    onChange={(e) => setFilterEmployee(e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white min-w-[150px]"
                  >
                    <option value="">All Employees</option>
                    {employees.map(emp => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name} ({emp.employeeId})
                      </option>
                    ))}
                  </select>
                </div>

                {/* ─── Date Filter ─── */}
                <div className="flex items-center gap-2">
                  <FiCalendar className="text-gray-400" />
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  />
                </div>

                {/* ─── Search ─── */}
                <div className="flex items-center gap-2">
                  <FiSearch className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full sm:w-40"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={fetchEmployeeLocations}
                  disabled={loading}
                  className="px-3 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"
                >
                  <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                  Refresh
                </button>
                {getActiveFilterCount() > 0 && (
                  <button
                    onClick={clearFilters}
                    className="px-3 py-2 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-all flex items-center gap-2"
                  >
                    <FaTimes className="text-xs" /> Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ─── Active Filters Display ─── */}
          {getActiveFilterCount() > 0 && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">Active Filters:</span>
              {filterEmployee && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                  Employee: {employees.find(e => e._id === filterEmployee)?.name}
                  <FaTimes 
                    className="text-xs cursor-pointer hover:text-red-500"
                    onClick={() => setFilterEmployee('')}
                  />
                </span>
              )}
              {filterDate && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                  Date: {formatDateTime(filterDate)}
                  <FaTimes 
                    className="text-xs cursor-pointer hover:text-red-500"
                    onClick={() => setFilterDate('')}
                  />
                </span>
              )}
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
                  Search: {searchTerm}
                  <FaTimes 
                    className="text-xs cursor-pointer hover:text-red-500"
                    onClick={() => setSearchTerm('')}
                  />
                </span>
              )}
            </div>
          )}
        </div>

        {/* Main Table */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <FiInfo className="text-blue-600" /> Employee Location List
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {filterDate ? `Showing data for ${formatDateTime(filterDate)}` : 'All employees location history'}
                {filterEmployee && ` • ${employees.find(e => e._id === filterEmployee)?.name}`}
              </p>
            </div>
          </div>

          {filteredEmployees.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500 font-medium">
              No employees found matching your filters.
              <button
                onClick={clearFilters}
                className="ml-2 text-blue-600 hover:text-blue-700 font-semibold"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 bg-white">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-3 py-3 text-left text-black">#</th>
                    <th className="px-3 py-3 text-left text-black">Employee</th>
                    <th className="px-3 py-3 text-left text-black">Dept/Role</th>
                    <th className="px-3 py-3 text-left text-black">Login</th>
                    <th className="px-3 py-3 text-left text-black">Check-In</th>
                    <th className="px-3 py-3 text-left text-black">Check-Out</th>
                    <th className="px-3 py-3 text-left text-black">Status</th>
                    <th className="px-3 py-3 text-center text-black">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm">
                  {filteredEmployees.map((employee, index) => {
                    const loginTime = employee.lastLoginLocation?.timestamp;
                    const checkinTime = employee.lastCheckInLocation?.timestamp;
                    const checkoutTime = employee.lastCheckOutLocation?.timestamp;
                    const loginAddress = employee.lastLoginLocation?.address;
                    const checkinAddress = employee.lastCheckInLocation?.address;
                    const checkoutAddress = employee.lastCheckOutLocation?.address;

                    const isHighlighted = filterDate ? (
                      (loginTime && new Date(loginTime).toDateString() === new Date(filterDate).toDateString()) ||
                      (checkinTime && new Date(checkinTime).toDateString() === new Date(filterDate).toDateString()) ||
                      (checkoutTime && new Date(checkoutTime).toDateString() === new Date(filterDate).toDateString())
                    ) : false;

                    return (
                      <tr key={employee._id || index} className={`hover:bg-gray-50 transition-all ${isHighlighted ? 'bg-blue-50/50' : ''}`}>
                        <td className="px-3 py-3 text-gray-500 font-medium">{index + 1}</td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            {/* ─── Circle with First Letter ─── */}
                            <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                              style={{ background: getAvatarColor(employee.name) }}
                            >
                              {getInitials(employee.name)}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 text-sm">{employee.name || 'Unknown'}</div>
                              <div className="text-xs text-gray-400">ID: {employee.employeeId || 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-sm text-gray-700">{employee.department || 'N/A'}</div>
                          <div className="text-xs text-gray-400">{employee.role || 'N/A'}</div>
                        </td>

                        {/* ─── LOGIN ─── */}
                        <td className="px-3 py-3">
                          {loginTime ? (
                            <div className="space-y-1">
                              <div className="text-xs text-gray-700 font-medium">{formatDateTime(loginTime)}</div>
                              <div className="text-xs text-gray-400">{formatTimeAgo(loginTime)}</div>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => goToLocation(
                                    employee.lastLoginLocation?.latitude,
                                    employee.lastLoginLocation?.longitude,
                                    'Login'
                                  )}
                                  className="px-2 py-0.5 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition flex items-center gap-1"
                                >
                                  <FaDirections className="text-[9px]" /> Go
                                </button>
                                {loginAddress && (
                                  <button
                                    onClick={() => showAddressPopup(loginAddress, 'Login Location')}
                                    className="p-0.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                                    title="View Address"
                                  >
                                    <FaEyeIcon className="text-xs" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">Never</span>
                          )}
                        </td>

                        {/* ─── CHECK-IN ─── */}
                        <td className="px-3 py-3">
                          {checkinTime ? (
                            <div className="space-y-1">
                              <div className="text-xs text-gray-700 font-medium">{formatDateTime(checkinTime)}</div>
                              <div className="text-xs text-gray-400">{formatTimeAgo(checkinTime)}</div>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => goToLocation(
                                    employee.lastCheckInLocation?.latitude,
                                    employee.lastCheckInLocation?.longitude,
                                    'Check-In'
                                  )}
                                  className="px-2 py-0.5 text-xs font-medium text-green-600 bg-green-50 rounded hover:bg-green-100 transition flex items-center gap-1"
                                >
                                  <FaDirections className="text-[9px]" /> Go
                                </button>
                                {checkinAddress && (
                                  <button
                                    onClick={() => showAddressPopup(checkinAddress, 'Check-In Location')}
                                    className="p-0.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition"
                                    title="View Address"
                                  >
                                    <FaEyeIcon className="text-xs" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">Never</span>
                          )}
                        </td>

                        {/* ─── CHECK-OUT ─── */}
                        <td className="px-3 py-3">
                          {checkoutTime ? (
                            <div className="space-y-1">
                              <div className="text-xs text-gray-700 font-medium">{formatDateTime(checkoutTime)}</div>
                              <div className="text-xs text-gray-400">{formatTimeAgo(checkoutTime)}</div>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => goToLocation(
                                    employee.lastCheckOutLocation?.latitude,
                                    employee.lastCheckOutLocation?.longitude,
                                    'Check-Out'
                                  )}
                                  className="px-2 py-0.5 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition flex items-center gap-1"
                                >
                                  <FaDirections className="text-[9px]" /> Go
                                </button>
                                {checkoutAddress && (
                                  <button
                                    onClick={() => showAddressPopup(checkoutAddress, 'Check-Out Location')}
                                    className="p-0.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                                    title="View Address"
                                  >
                                    <FaEyeIcon className="text-xs" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">Never</span>
                          )}
                        </td>

                        <td className="px-3 py-3">{getStatusBadge(employee)}</td>
                        <td className="px-3 py-3 text-center">
                          <div className="flex flex-col items-center justify-center gap-1">
                            <button
                              onClick={() => openDetails(employee)}
                              className="px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                            >
                              <FaEye className="text-xs" /> View
                            </button>

                            {employee.latitude && employee.longitude && (
                              <button
                                onClick={() => redirectToLocation(employee.latitude, employee.longitude, employee.name)}
                                disabled={redirecting}
                                className="px-2.5 py-1 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition"
                              >
                                <FaLocationArrow className="text-xs" /> Map
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Employee Details Modal */}
        {showDetails && selectedEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <FaUser className="text-blue-600" /> Employee Location Details
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Complete location history for {selectedEmployee.name}
                </p>
                <button
                  onClick={closeDetails}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Employee Info */}
                <div className="flex items-center gap-4">
                  {/* ─── Circle with First Letter ─── */}
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0"
                    style={{ background: getAvatarColor(selectedEmployee.name) }}
                  >
                    {getInitials(selectedEmployee.name)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{selectedEmployee.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full">
                        {selectedEmployee.role || 'Employee'}
                      </span>
                      <span className="inline-block px-2 py-0.5 bg-gray-50 text-gray-600 text-xs font-semibold rounded-full">
                        {selectedEmployee.department || 'N/A'}
                      </span>
                      <span className="text-xs text-gray-400">ID: {selectedEmployee.employeeId || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Email</p>
                    <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      <FaEnvelope className="text-blue-500" /> {selectedEmployee.email || 'No email'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Phone</p>
                    <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      <FaPhone className="text-green-500" /> {selectedEmployee.phone || 'No phone'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Status</p>
                    <div>{getStatusBadge(selectedEmployee)}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Current Location</p>
                    {selectedEmployee.latitude && selectedEmployee.longitude ? (
                      <div className="flex items-center gap-1">
                        <code className="font-mono text-xs">
                          {selectedEmployee.latitude?.toFixed(5)}, {selectedEmployee.longitude?.toFixed(5)}
                        </code>
                        <button
                          onClick={() => openInGoogleMaps(selectedEmployee.latitude, selectedEmployee.longitude)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FaExternalLinkAlt className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Not available</span>
                    )}
                  </div>
                </div>

                {/* Location History Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Login Location */}
                  <div className={`rounded-xl p-4 border ${selectedEmployee.lastLoginLocation?.timestamp ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FaSignInAlt className="text-blue-600" />
                        <h4 className="text-sm font-bold text-gray-900">Login</h4>
                      </div>
                      {selectedEmployee.lastLoginLocation?.latitude && selectedEmployee.lastLoginLocation?.longitude && (
                        <button
                          onClick={() => goToLocation(
                            selectedEmployee.lastLoginLocation.latitude,
                            selectedEmployee.lastLoginLocation.longitude,
                            'Login'
                          )}
                          className="px-3 py-1 text-xs font-semibold text-blue-700 bg-white rounded-lg hover:bg-blue-100 transition flex items-center gap-1.5 shadow-sm border border-blue-200"
                        >
                          <FaDirections className="text-[10px]" /> Go
                        </button>
                      )}
                    </div>
                    {selectedEmployee.lastLoginLocation?.timestamp ? (
                      <>
                        <div className="text-xs text-gray-500">{formatDateTime(selectedEmployee.lastLoginLocation.timestamp)}</div>
                        <div className="text-xs text-gray-400">{formatTimeAgo(selectedEmployee.lastLoginLocation.timestamp)}</div>
                        {selectedEmployee.lastLoginLocation.latitude && selectedEmployee.lastLoginLocation.longitude && (
                          <div className="text-xs font-mono text-gray-600 mt-1">
                            {selectedEmployee.lastLoginLocation.latitude?.toFixed(5)}, {selectedEmployee.lastLoginLocation.longitude?.toFixed(5)}
                          </div>
                        )}
                        {selectedEmployee.lastLoginLocation.address && (
                          <div className="text-xs text-gray-600 mt-1 p-2 bg-white rounded border border-blue-100 leading-relaxed">
                            📍 {selectedEmployee.lastLoginLocation.address}
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-400 text-sm">No login location</span>
                    )}
                  </div>

                  {/* Check-In Location */}
                  <div className={`rounded-xl p-4 border ${selectedEmployee.lastCheckInLocation?.timestamp ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FaUserCheck className="text-green-600" />
                        <h4 className="text-sm font-bold text-gray-900">Check-In</h4>
                      </div>
                      {selectedEmployee.lastCheckInLocation?.latitude && selectedEmployee.lastCheckInLocation?.longitude && (
                        <button
                          onClick={() => goToLocation(
                            selectedEmployee.lastCheckInLocation.latitude,
                            selectedEmployee.lastCheckInLocation.longitude,
                            'Check-In'
                          )}
                          className="px-3 py-1 text-xs font-semibold text-green-700 bg-white rounded-lg hover:bg-green-100 transition flex items-center gap-1.5 shadow-sm border border-green-200"
                        >
                          <FaDirections className="text-[10px]" /> Go
                        </button>
                      )}
                    </div>
                    {selectedEmployee.lastCheckInLocation?.timestamp ? (
                      <>
                        <div className="text-xs text-gray-500">{formatDateTime(selectedEmployee.lastCheckInLocation.timestamp)}</div>
                        <div className="text-xs text-gray-400">{formatTimeAgo(selectedEmployee.lastCheckInLocation.timestamp)}</div>
                        {selectedEmployee.lastCheckInLocation.latitude && selectedEmployee.lastCheckInLocation.longitude && (
                          <div className="text-xs font-mono text-gray-600 mt-1">
                            {selectedEmployee.lastCheckInLocation.latitude?.toFixed(5)}, {selectedEmployee.lastCheckInLocation.longitude?.toFixed(5)}
                          </div>
                        )}
                        {selectedEmployee.lastCheckInLocation.address && (
                          <div className="text-xs text-gray-600 mt-1 p-2 bg-white rounded border border-green-100 leading-relaxed">
                            📍 {selectedEmployee.lastCheckInLocation.address}
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-400 text-sm">No check-in location</span>
                    )}
                  </div>

                  {/* Check-Out Location */}
                  <div className={`rounded-xl p-4 border ${selectedEmployee.lastCheckOutLocation?.timestamp ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FaSignOutAlt className="text-red-600" />
                        <h4 className="text-sm font-bold text-gray-900">Check-Out</h4>
                      </div>
                      {selectedEmployee.lastCheckOutLocation?.latitude && selectedEmployee.lastCheckOutLocation?.longitude && (
                        <button
                          onClick={() => goToLocation(
                            selectedEmployee.lastCheckOutLocation.latitude,
                            selectedEmployee.lastCheckOutLocation.longitude,
                            'Check-Out'
                          )}
                          className="px-3 py-1 text-xs font-semibold text-red-700 bg-white rounded-lg hover:bg-red-100 transition flex items-center gap-1.5 shadow-sm border border-red-200"
                        >
                          <FaDirections className="text-[10px]" /> Go
                        </button>
                      )}
                    </div>
                    {selectedEmployee.lastCheckOutLocation?.timestamp ? (
                      <>
                        <div className="text-xs text-gray-500">{formatDateTime(selectedEmployee.lastCheckOutLocation.timestamp)}</div>
                        <div className="text-xs text-gray-400">{formatTimeAgo(selectedEmployee.lastCheckOutLocation.timestamp)}</div>
                        {selectedEmployee.lastCheckOutLocation.latitude && selectedEmployee.lastCheckOutLocation.longitude && (
                          <div className="text-xs font-mono text-gray-600 mt-1">
                            {selectedEmployee.lastCheckOutLocation.latitude?.toFixed(5)}, {selectedEmployee.lastCheckOutLocation.longitude?.toFixed(5)}
                          </div>
                        )}
                        {selectedEmployee.lastCheckOutLocation.address && (
                          <div className="text-xs text-gray-600 mt-1 p-2 bg-white rounded border border-red-100 leading-relaxed">
                            📍 {selectedEmployee.lastCheckOutLocation.address}
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-400 text-sm">No check-out location</span>
                    )}
                  </div>
                </div>

                {/* Current Address */}
                {selectedEmployee.address && (
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">📍 Current Address</p>
                    <p className="text-sm text-gray-900 mt-1">{selectedEmployee.address}</p>
                    {selectedEmployee.latitude && selectedEmployee.longitude && (
                      <button
                        onClick={() => redirectToLocation(selectedEmployee.latitude, selectedEmployee.longitude, selectedEmployee.name)}
                        className="mt-2 px-4 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition flex items-center gap-1.5 shadow-sm"
                      >
                        <FaDirections className="text-[10px]" /> Go to Current Location
                      </button>
                    )}
                  </div>
                )}

                <button
                  onClick={closeDetails}
                  className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <style>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(-10px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes scaleUp {
            from { opacity: 0; transform: scale(0.9) translateY(20px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          .animate-fade-in { animation: fade-in 0.3s ease-out; }
          .animate-scaleUp { animation: scaleUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
        `}</style>
      </div>
    </div>
  );
}