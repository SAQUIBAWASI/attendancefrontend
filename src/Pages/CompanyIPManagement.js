// components/CompanyIPManagement.jsx
import React, { useState, useEffect } from 'react';
import CountUp from 'react-countup';
import { FaBuilding, FaNetworkWired, FaSync, FaCheck, FaClock, FaGlobe, FaServer, FaPlus } from 'react-icons/fa';
import { FiCalendar, FiRefreshCw, FiInfo, FiAlertCircle, FiSearch } from 'react-icons/fi';
import { toast } from 'react-toastify';

const API_BASE_URL = 'https://api.timelyhealth.in';

export default function CompanyIPManagement() {
  const [companyIPs, setCompanyIPs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCompanyId, setNewCompanyId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const saveStatusTimeoutRef = React.useRef(null);

  const showSaveStatus = (msg) => {
    setSaveStatus(msg);
    clearTimeout(saveStatusTimeoutRef.current);
    saveStatusTimeoutRef.current = setTimeout(() => setSaveStatus(''), 3500);
  };

  // Fetch all company IPs on mount
  useEffect(() => {
    fetchAllCompanyIPs();
  }, []);

  const fetchAllCompanyIPs = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${API_BASE_URL}/api/admin/get-ips`);
      const data = await response.json();

      if (data.success) {
        setCompanyIPs(data.data || []);
        if (data.data && data.data.length > 0) {
          setSelectedCompany(data.data[0]);
        }
      } else {
        setError(data.message || 'Failed to fetch company IPs');
        setCompanyIPs([]);
      }
    } catch (err) {
      console.error('Error fetching company IPs:', err);
      setError('Error fetching company IPs');
      toast.error('Failed to load company IP information');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateIP = async (companyId) => {
    try {
      setUpdating(true);
      
      const response = await fetch(`${API_BASE_URL}/api/admin/update-ip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId })
      });

      const data = await response.json();
      
      if (data.success) {
        showSaveStatus(`✅ IP updated for ${companyId} successfully!`);
        setShowUpdateModal(false);
        // Refresh the list
        await fetchAllCompanyIPs();
        toast.success(`IP address updated for ${companyId}`);
      } else {
        toast.error(data.message || 'Failed to update IP');
      }
    } catch (error) {
      console.error('Error updating IP:', error);
      toast.error('Error updating IP address');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddCompanyIP = async () => {
    if (!newCompanyId.trim()) {
      toast.warning('Please enter a Company ID');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/update-ip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: newCompanyId.trim() })
      });

      const data = await response.json();
      
      if (data.success) {
        showSaveStatus(`✅ Company IP added for ${newCompanyId} successfully!`);
        setShowAddModal(false);
        setNewCompanyId('');
        await fetchAllCompanyIPs();
        toast.success(`Company IP added for ${newCompanyId}`);
      } else {
        toast.error(data.message || 'Failed to add company IP');
      }
    } catch (error) {
      console.error('Error adding company IP:', error);
      toast.error('Error adding company IP');
    }
  };

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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      showSaveStatus('📋 IP copied to clipboard!');
    }).catch(() => {
      toast.warning('Failed to copy IP');
    });
  };

  const getStatusBadge = (ip) => {
    if (ip && ip.publicIp) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <span className="w-2 h-2 mr-1 bg-green-500 rounded-full animate-pulse"></span>
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
        <span className="w-2 h-2 mr-1 bg-gray-400 rounded-full"></span>
        Inactive
      </span>
    );
  };

  // Filter companies based on search
  const filteredCompanies = companyIPs.filter(company =>
    company.companyId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.publicIp?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="text-lg font-semibold text-gray-700">Loading Company IPs...</p>
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
            saveStatus.includes('✅') ? 'bg-green-600 border-l-4 border-green-700' : 'bg-red-500 border-l-4 border-red-600'
          }`}>
            {saveStatus}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
              Company <span className="text-blue-600">IP</span> Management
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage and monitor all company network IP addresses
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all shadow-sm flex items-center gap-2"
            >
              <FaPlus /> Add Company
            </button>
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
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Companies</span>
              <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <FaBuilding className="text-base" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              <CountUp end={companyIPs.length} duration={1} />
            </div>
            <div className="mt-1 text-xs text-gray-500">registered companies</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Active IPs</span>
              <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-green-50 text-green-600">
                <FaCheck className="text-base" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              <CountUp end={companyIPs.filter(ip => ip.publicIp).length} duration={1} />
            </div>
            <div className="mt-1 text-xs text-gray-500">active IP addresses</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Updated</span>
              <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                <FaClock className="text-base" />
              </div>
            </div>
            <div className="text-sm font-semibold text-gray-900">
              {companyIPs.length > 0 && companyIPs[0]?.updatedAt 
                ? formatTimeAgo(companyIPs[0].updatedAt)
                : 'Never'}
            </div>
            <div className="mt-1 text-xs text-gray-500">latest update</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Security</span>
              <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <FaGlobe className="text-base" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 text-green-600">✓</div>
            <div className="mt-1 text-xs text-gray-500">network secure</div>
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
                  placeholder="Search by Company ID or IP..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full sm:w-64"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  Showing <strong>{filteredCompanies.length}</strong> of <strong>{companyIPs.length}</strong> companies
                </span>
                <button
                  onClick={fetchAllCompanyIPs}
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
                <FiInfo className="text-blue-600" /> Company IP List
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">All registered companies and their public IP addresses</p>
            </div>
          </div>

          {filteredCompanies.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500 font-medium">
              {searchTerm ? 'No companies found matching your search.' : 'No company IPs registered yet.'}
              {!searchTerm && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="ml-2 text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Add your first company
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 bg-white">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th style={{ color: 'black' }} className="px-6 py-3 text-left">#</th>
                    <th style={{ color: 'black' }} className="px-6 py-3 text-left">Company ID</th>
                    <th style={{ color: 'black' }} className="px-6 py-3 text-left">Public IP</th>
                    <th style={{ color: 'black' }} className="px-6 py-3 text-left">Status</th>
                    <th style={{ color: 'black' }} className="px-6 py-3 text-left">Last Updated</th>
                    <th style={{ color: 'black' }} className="px-6 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm">
                  {filteredCompanies.map((company, index) => (
                    <tr key={company._id || index} className="hover:bg-gray-50 transition-all">
                      <td className="px-6 py-4 text-gray-500 font-medium">{index + 1}</td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">{company.companyId}</span>
                      </td>
                      <td className="px-6 py-4">
                        {company.publicIp ? (
                          <div className="flex items-center gap-2">
                            <code className="font-mono font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                              {company.publicIp}
                            </code>
                            <button
                              onClick={() => copyToClipboard(company.publicIp)}
                              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                              title="Copy IP"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400">Not configured</span>
                        )}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(company)}</td>
                      <td className="px-6 py-4">
                        <div className="text-gray-700">{formatDate(company.updatedAt)}</div>
                        <div className="text-xs text-gray-400">{formatTimeAgo(company.updatedAt)}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedCompany(company);
                            setShowUpdateModal(true);
                          }}
                          disabled={updating}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm flex items-center gap-1.5 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FaSync className={updating && selectedCompany?._id === company._id ? 'animate-spin' : ''} />
                          Update IP
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Update IP Modal */}
        {showUpdateModal && selectedCompany && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 animate-in fade-in zoom-in duration-200">
              <div className="p-4 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <FaSync className="text-blue-600" /> Update IP Address
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Update IP for {selectedCompany.companyId}
                </p>
              </div>

              <div className="p-6 space-y-4">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="flex items-start gap-3">
                    <FiAlertCircle className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-blue-800">
                        The system will automatically detect the current public IP address and update the company record.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Company ID</span>
                    <span className="font-semibold text-gray-900">{selectedCompany.companyId}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-500">Current IP</span>
                    <span className="font-mono font-semibold text-gray-900">{selectedCompany.publicIp || 'Not configured'}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowUpdateModal(false);
                      setSelectedCompany(null);
                    }}
                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleUpdateIP(selectedCompany.companyId)}
                    disabled={updating}
                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating && <FaSync className="animate-spin" />}
                    {updating ? 'Updating...' : 'Update IP'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Company Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 animate-in fade-in zoom-in duration-200">
              <div className="p-4 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <FaPlus className="text-green-600" /> Add Company IP
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Register a new company and fetch its public IP
                </p>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newCompanyId}
                    onChange={(e) => setNewCompanyId(e.target.value)}
                    placeholder="e.g., COMP002"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-400">Enter a unique identifier for the company</p>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="flex items-start gap-3">
                    <FiAlertCircle className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-blue-800">
                        A new record will be created with the current public IP address of this network.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setNewCompanyId('');
                    }}
                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCompanyIP}
                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <FaPlus /> Add Company
                  </button>
                </div>
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