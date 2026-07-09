// components/EmployeeLocations.js
import React, { useState, useEffect } from 'react';
import CountUp from 'react-countup';
import { 
  FaMapMarkerAlt, FaUser, FaPhone, FaEnvelope, FaIdCard, 
  FaBuilding, FaSearch, FaSync, FaExternalLinkAlt,
  FaUsers, FaMapPin, FaEye, FaCopy, FaCheckCircle,
  FaClock, FaGlobe, FaUserCheck, FaLocationArrow
} from 'react-icons/fa';
import { FiCalendar, FiRefreshCw, FiInfo, FiAlertCircle, FiSearch } from 'react-icons/fi';
import { toast } from 'react-toastify';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [saveStatus, setSaveStatus] = useState('');
  const saveStatusTimeoutRef = React.useRef(null);

  const showSaveStatus = (msg) => {
    setSaveStatus(msg);
    clearTimeout(saveStatusTimeoutRef.current);
    saveStatusTimeoutRef.current = setTimeout(() => setSaveStatus(''), 3500);
  };

  // ─── Fetch Employee Locations ───
  const fetchEmployeeLocations = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get(`${API_BASE_URL}/api/employees/employee-locations`);
      
      console.log('📍 Employee locations response:', response.data);
      
      if (response.data.success) {
        setEmployees(response.data.employees || []);
        setFilteredEmployees(response.data.employees || []);
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

  // ─── Initial Load ───
  useEffect(() => {
    fetchEmployeeLocations();
  }, []);

  // ─── Search Filter ───
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredEmployees(employees);
    } else {
      const term = searchTerm.toLowerCase().trim();
      const filtered = employees.filter(emp => 
        emp.name?.toLowerCase().includes(term) ||
        emp.email?.toLowerCase().includes(term) ||
        emp.phone?.includes(term) ||
        emp.employeeId?.toLowerCase().includes(term) ||
        emp.address?.toLowerCase().includes(term)
      );
      setFilteredEmployees(filtered);
    }
  }, [searchTerm, employees]);

  // ─── Open Employee Details ───
  const openDetails = (employee) => {
    setSelectedEmployee(employee);
    setShowDetails(true);
    document.body.style.overflow = 'hidden';
  };

  // ─── Close Employee Details ───
  const closeDetails = () => {
    setShowDetails(false);
    setSelectedEmployee(null);
    document.body.style.overflow = 'auto';
  };

  // ─── Open in Google Maps ───
  const openInGoogleMaps = (lat, lng) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  };

  // ─── Redirect to Location (with direction) ───
  const redirectToLocation = (lat, lng, name) => {
    setRedirecting(true);
    // Open in Google Maps with directions
    const url = `https://www.google.com/maps/dir//${lat},${lng}/@${lat},${lng},15z`;
    window.open(url, '_blank');
    showSaveStatus(`📍 Redirecting to ${name}'s location...`);
    setTimeout(() => setRedirecting(false), 2000);
  };

  // ─── Open in Google Maps (with destination) ───
  const openLocationWithDirections = (lat, lng, name) => {
    // This will open Google Maps with the location as destination
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    window.open(url, '_blank');
    toast.success(`📍 Navigating to ${name}'s location`);
  };

  // ─── Copy to Clipboard ───
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      showSaveStatus('📋 Coordinates copied to clipboard!');
      toast.success('Coordinates copied!');
    }).catch(() => {
      toast.warning('Failed to copy');
    });
  };

  // ─── Format Date ───
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // ─── Format Time Ago ───
  const formatTimeAgo = (dateString) => {
    if (!dateString) return '-';
    const now = new Date();
    const past = new Date(dateString);
    const diff = Math.floor((now - past) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  // ─── Get Status Badge ───
  const getStatusBadge = (employee) => {
    if (employee.latitude && employee.longitude) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <span className="w-2 h-2 mr-1 bg-green-500 rounded-full animate-pulse"></span>
          Live
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
        {/* Toast notification */}
        {saveStatus && (
          <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg font-semibold text-white animate-fade-in ${
            saveStatus.includes('✅') || saveStatus.includes('📍') 
              ? 'bg-green-600 border-l-4 border-green-700' 
              : 'bg-red-500 border-l-4 border-red-600'
          }`}>
            {saveStatus}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
              Employee <span className="text-blue-600">Locations</span>
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Track real-time location of all employees
            </p>
          </div>
          <div className="flex gap-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm">
              <FiCalendar className="text-blue-600" />
              <span className="text-sm font-medium text-gray-600">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
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
              <CountUp end={employees.length} duration={1} />
            </div>
            <div className="mt-1 text-xs text-gray-500">registered employees</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Active Locations</span>
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
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Updated</span>
              <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                <FaClock className="text-base" />
              </div>
            </div>
            <div className="text-sm font-semibold text-gray-900">
              {employees.length > 0 && employees[0]?.lastUpdated 
                ? formatTimeAgo(employees[0].lastUpdated)
                : 'Never'}
            </div>
            <div className="mt-1 text-xs text-gray-500">latest update</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">With Address</span>
              <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                <FaCheckCircle className="text-base" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 text-green-600">
              <CountUp end={employees.filter(emp => emp.address && emp.address !== 'Address not found').length} duration={1} />
            </div>
            <div className="mt-1 text-xs text-gray-500">address resolved</div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FiSearch className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, ID, phone or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full sm:w-64"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  Showing <strong>{filteredEmployees.length}</strong> of <strong>{employees.length}</strong> employees
                </span>
                <button
                  onClick={fetchEmployeeLocations}
                  disabled={loading}
                  className="px-3 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"
                >
                  <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <FiInfo className="text-blue-600" /> Employee Location List
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">All employees and their current locations</p>
            </div>
          </div>

          {filteredEmployees.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500 font-medium">
              {searchTerm ? 'No employees found matching your search.' : 'No employee locations available yet.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 bg-white">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th style={{ color: 'black' }} className="px-6 py-3 text-left">#</th>
                    <th style={{ color: 'black' }} className="px-6 py-3 text-left">Employee</th>
                    <th style={{ color: 'black' }} className="px-6 py-3 text-left">Contact</th>
                    <th style={{ color: 'black' }} className="px-6 py-3 text-left">Location</th>
                    <th style={{ color: 'black' }} className="px-6 py-3 text-left">Status</th>
                    <th style={{ color: 'black' }} className="px-6 py-3 text-left">Last Updated</th>
                    <th style={{ color: 'black' }} className="px-6 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm">
                  {filteredEmployees.map((employee, index) => (
                    <tr key={employee._id || index} className="hover:bg-gray-50 transition-all">
                      <td className="px-6 py-4 text-gray-500 font-medium">{index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                            style={{ background: getAvatarColor(employee.name) }}
                          >
                            {getInitials(employee.name)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{employee.name || 'Unknown'}</div>
                            <div className="text-xs text-gray-400">ID: {employee.employeeId || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700">{employee.email || 'No email'}</div>
                        <div className="text-xs text-gray-400">{employee.phone || 'No phone'}</div>
                      </td>
                      <td className="px-6 py-4">
                        {employee.latitude && employee.longitude ? (
                          <div>
                            <div className="flex items-center gap-2">
                              <code className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                                {employee.latitude?.toFixed(5)}, {employee.longitude?.toFixed(5)}
                              </code>
                              <button
                                onClick={() => copyToClipboard(`${employee.latitude}, ${employee.longitude}`)}
                                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                                title="Copy coordinates"
                              >
                                <FaCopy className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="text-xs text-gray-400 mt-1 truncate max-w-xs">
                              {employee.address || 'Address not found'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Not available</span>
                        )}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(employee)}</td>
                      <td className="px-6 py-4">
                        <div className="text-gray-700">{formatDate(employee.lastUpdated)}</div>
                        <div className="text-xs text-gray-400">{formatTimeAgo(employee.lastUpdated)}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5">
                          {/* View Button */}
                          <button
                            onClick={() => openDetails(employee)}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm flex items-center gap-1.5"
                          >
                            <FaEye className="text-xs" /> View
                          </button>
                          
                          {/* Redirect/Map Button - Only if location exists */}
                          {employee.latitude && employee.longitude && (
                            <button
                              onClick={() => redirectToLocation(employee.latitude, employee.longitude, employee.name)}
                              disabled={redirecting}
                              className="px-3 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all shadow-sm flex items-center gap-1.5"
                            >
                              <FaLocationArrow className="text-xs" /> Navigate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Employee Details Modal */}
        {showDetails && selectedEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
              <div className="p-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <FaUser className="text-blue-600" /> Employee Location Details
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Complete location information for {selectedEmployee.name}
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
                <div className="flex items-center gap-4 mb-4">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0"
                    style={{ background: getAvatarColor(selectedEmployee.name) }}
                  >
                    {getInitials(selectedEmployee.name)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{selectedEmployee.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full">
                        {selectedEmployee.role || 'Employee'}
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
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Department</p>
                    <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      <FaBuilding className="text-orange-500" /> {selectedEmployee.department || 'Not assigned'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Status</p>
                    <div>{getStatusBadge(selectedEmployee)}</div>
                  </div>
                </div>

                {/* Location Details */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                    <FaMapMarkerAlt className="text-red-500" /> Location Details
                  </h3>
                  {selectedEmployee.latitude && selectedEmployee.longitude ? (
                    <>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-white rounded-lg p-3 border border-gray-100">
                          <p className="text-xs text-gray-400 font-medium">Latitude</p>
                          <p className="font-mono text-sm font-semibold text-gray-900">
                            {selectedEmployee.latitude?.toFixed(6)}
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-100">
                          <p className="text-xs text-gray-400 font-medium">Longitude</p>
                          <p className="font-mono text-sm font-semibold text-gray-900">
                            {selectedEmployee.longitude?.toFixed(6)}
                          </p>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-100">
                        <p className="text-xs text-gray-400 font-medium">Address</p>
                        <p className="text-sm text-gray-900 mt-1">{selectedEmployee.address || 'Address not available'}</p>
                      </div>
                      
                      {/* ─── Redirect Buttons in Modal ─── */}
                      <div className="flex flex-col sm:flex-row gap-2 mt-3">
                        <button
                          onClick={() => openInGoogleMaps(selectedEmployee.latitude, selectedEmployee.longitude)}
                          className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          <FaExternalLinkAlt /> Open in Google Maps
                        </button>
                        <button
                          onClick={() => redirectToLocation(selectedEmployee.latitude, selectedEmployee.longitude, selectedEmployee.name)}
                          className="flex-1 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          <FaLocationArrow /> Get Directions
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="bg-white rounded-lg p-4 text-center text-gray-400">
                      <FaMapPin className="text-4xl mx-auto mb-2 text-gray-300" />
                      <p>No location data available for this employee</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={closeDetails}
                  className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-200"
                >
                  Close
                </button>

                <p className="text-xs text-center text-gray-400 mt-2">
                  Last updated: {new Date(selectedEmployee.lastUpdated).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
        )}

        <style>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(-10px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in { animation: fade-in 0.3s ease-out; }
        `}</style>
      </div>
    </div>
  );
}