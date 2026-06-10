import React, { useEffect, useState, useRef } from 'react';
import { API_BASE_URL } from '../config';

function CompOffSettings() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    totalCompOff: '',
    validityFrom: '',
    validityTo: ''
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const saveStatusTimeoutRef = useRef(null);
  
  const showSaveStatus = (msg, isError = false) => {
    setSaveStatus(msg);
    clearTimeout(saveStatusTimeoutRef.current);
    saveStatusTimeoutRef.current = setTimeout(() => setSaveStatus(''), 3500);
  };
  
  // ── Fetch all comp-off settings ──────────────────────────────────────────────
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/leaves/get-all-comp-off-settings`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch comp-off settings');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setSettings(result.data || []);
      } else {
        throw new Error(result.message || 'Failed to fetch settings');
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchSettings();
  }, []);
  
  // ── Add new comp-off setting ──────────────────────────────────────────────
  const handleAddSetting = async () => {
    // Validation
    if (!formData.totalCompOff || formData.totalCompOff <= 0) {
      showSaveStatus('❌ Please enter a valid number of Comp-Off days', true);
      return;
    }
    
    if (!formData.validityFrom) {
      showSaveStatus('❌ Please select Validity From date', true);
      return;
    }
    
    if (!formData.validityTo) {
      showSaveStatus('❌ Please select Validity To date', true);
      return;
    }
    
    const fromDate = new Date(formData.validityFrom);
    const toDate = new Date(formData.validityTo);
    
    if (toDate < fromDate) {
      showSaveStatus('❌ Validity To date cannot be before Validity From date', true);
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/leaves/add-comp-off-settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          totalCompOff: Number(formData.totalCompOff),
          validityFrom: formData.validityFrom,
          validityTo: formData.validityTo
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        showSaveStatus('✅ Comp-Off setting added successfully');
        setIsModalOpen(false);
        resetForm();
        fetchSettings();
      } else {
        throw new Error(result.message || 'Failed to add setting');
      }
    } catch (err) {
      console.error(err);
      showSaveStatus(`❌ ${err.message}`, true);
    }
  };
  
  // ── Update comp-off setting ───────────────────────────────────────────────
  const handleUpdateSetting = async () => {
    if (!formData.totalCompOff || formData.totalCompOff <= 0) {
      showSaveStatus('❌ Please enter a valid number of Comp-Off days', true);
      return;
    }
    
    if (!formData.validityFrom) {
      showSaveStatus('❌ Please select Validity From date', true);
      return;
    }
    
    if (!formData.validityTo) {
      showSaveStatus('❌ Please select Validity To date', true);
      return;
    }
    
    const fromDate = new Date(formData.validityFrom);
    const toDate = new Date(formData.validityTo);
    
    if (toDate < fromDate) {
      showSaveStatus('❌ Validity To date cannot be before Validity From date', true);
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/leaves/update-comp-off-settings/${editingSetting._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          totalCompOff: Number(formData.totalCompOff),
          validityFrom: formData.validityFrom,
          validityTo: formData.validityTo
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        showSaveStatus('✅ Comp-Off setting updated successfully');
        setIsModalOpen(false);
        resetForm();
        fetchSettings();
      } else {
        throw new Error(result.message || 'Failed to update setting');
      }
    } catch (err) {
      console.error(err);
      showSaveStatus(`❌ ${err.message}`, true);
    }
  };
  
  // ── Delete comp-off setting ───────────────────────────────────────────────
  const handleDeleteSetting = async (setting) => {
    if (!window.confirm(`Are you sure you want to delete this Comp-Off setting?`)) {
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/leaves/delete-comp-off-settings/${setting._id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        showSaveStatus('✅ Comp-Off setting deleted successfully');
        fetchSettings();
      } else {
        throw new Error(result.message || 'Failed to delete setting');
      }
    } catch (err) {
      console.error(err);
      showSaveStatus(`❌ ${err.message}`, true);
    }
  };
  
  // ── Open modal for add/edit ───────────────────────────────────────────────
  const openAddModal = () => {
    setEditingSetting(null);
    resetForm();
    setIsModalOpen(true);
  };
  
  const openEditModal = (setting) => {
    setEditingSetting(setting);
    setFormData({
      totalCompOff: setting.totalCompOff,
      validityFrom: setting.validityFrom.split('T')[0],
      validityTo: setting.validityTo.split('T')[0]
    });
    setIsModalOpen(true);
  };
  
  const resetForm = () => {
    setFormData({
      totalCompOff: '',
      validityFrom: '',
      validityTo: ''
    });
  };
  
  // ── Filtered + paginated list ─────────────────────────────────────────────
  const filteredSettings = settings.filter(setting => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      setting._id?.toLowerCase().includes(q) ||
      setting.totalCompOff?.toString().includes(q) ||
      setting.status?.toLowerCase().includes(q)
    );
  });
  
  const totalPages = Math.ceil(filteredSettings.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredSettings.slice(startIdx, startIdx + itemsPerPage);
  
  const getPageNumbers = () => {
    const pages = [];
    const delta = 2;
    for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
      pages.push(i);
    }
    return pages;
  };
  
  // ── Format date ───────────────────────────────────────────────────────────
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // ── Loading / Error states ────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg font-semibold text-blue-600">Loading Comp-Off Settings...</div>
    </div>
  );
  
  if (error) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="p-4 text-red-600 bg-red-100 rounded-lg">Error: {error}</div>
    </div>
  );
  
  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="mx-auto max-w-9xl">
        
        {/* Toast notification */}
        {saveStatus && (
          <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg font-semibold text-white animate-fade-in ${
            saveStatus.includes('✅') ? 'bg-green-600 border-l-4 border-green-700' : 'bg-red-500 border-l-4 border-red-600'
          }`}>
            {saveStatus}
          </div>
        )}
        
        {/* ── Header with Add Button ── */}
        <div className="flex flex-wrap items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Comp-Off Settings</h1>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add New Setting
          </button>
        </div>
        
        {/* ── Filter bar ── */}
        <div className="p-2 mb-2 bg-white border border-gray-200 rounded-lg shadow-md">
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <svg className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by ID, days or status..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Clear */}
            <button
              onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
              className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 whitespace-nowrap"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear
            </button>
          </div>
        </div>
        
        {/* ── Table card ── */}
        <div className="p-0 mb-0 bg-white border border-gray-200 shadow-lg rounded-2xl">
          <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
            <table className="min-w-full">
              <thead className="text-sm text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
                <tr>
                  <th className="py-2 px-3 text-center">S.No</th>
                  <th className="py-2 px-3 text-center">Total Comp-Off Days</th>
                  <th className="py-2 px-3 text-center">Validity Period</th>
                  <th className="py-2 px-3 text-center">Status</th>
                  <th className="py-2 px-3 text-center">Created At</th>
                  <th className="py-2 px-3 text-center">Actions</th>
                </tr>
              </thead>
              
              <tbody>
                {currentItems.map((setting, index) => (
                  <tr
                    key={setting._id}
                    className="border-t border-gray-200 hover:bg-blue-50"
                  >
                    <td className="px-2 py-2 text-center text-gray-600">
                      {startIdx + index + 1}
                    </td>
                    <td className="px-2 py-2 font-semibold text-center text-indigo-600">
                      {setting.totalCompOff} day{setting.totalCompOff !== 1 ? 's' : ''}
                    </td>
                    <td className="px-2 py-2 text-center text-gray-600">
                      {formatDate(setting.validityFrom)} - {formatDate(setting.validityTo)}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                        setting.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {setting.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-center text-gray-600">
                      {formatDate(setting.createdAt)}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          title="Edit Setting"
                          onClick={() => openEditModal(setting)}
                          className="p-1.5 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-all duration-150"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          title="Delete Setting"
                          onClick={() => handleDeleteSetting(setting)}
                          className="p-1.5 text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-all duration-150"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* ── Pagination ── */}
            {filteredSettings.length > 0 && (
              <div className="flex flex-col items-center justify-between gap-4 mt-6 pb-4 sm:flex-row px-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Show:</label>
                    <select
                      value={itemsPerPage}
                      onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                      className="p-2 text-sm border rounded-lg"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                    <span className="text-sm text-gray-500">entries</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Showing {startIdx + 1} to {Math.min(startIdx + itemsPerPage, filteredSettings.length)} of {filteredSettings.length} entries
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-1 text-sm border rounded-lg ${
                      currentPage === 1
                        ? 'text-gray-500 bg-gray-100 border-gray-200 cursor-not-allowed'
                        : 'text-blue-500 bg-white hover:bg-gray-100 border-gray-300'
                    }`}
                  >
                    Previous
                  </button>
                  
                  {getPageNumbers().map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-1 text-sm border rounded-lg ${
                        currentPage === page
                          ? 'text-white bg-blue-600 border-blue-600'
                          : 'text-blue-500 bg-white hover:bg-gray-100 border-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className={`px-4 py-1 text-sm border rounded-lg ${
                      currentPage === totalPages || totalPages === 0
                        ? 'text-gray-500 bg-gray-100 border-gray-200 cursor-not-allowed'
                        : 'text-blue-500 bg-white hover:bg-gray-100 border-gray-300'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
            
            {filteredSettings.length === 0 && (
              <div className="py-8 text-center text-gray-500">
                No comp-off settings found
                {searchTerm && ' matching your search'}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* ── Modal for Add/Edit ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {editingSetting ? 'Edit Comp-Off Setting' : 'Add New Comp-Off Setting'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Comp-Off Days <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={formData.totalCompOff}
                  onChange={e => setFormData({ ...formData, totalCompOff: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter total comp-off days"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Validity From <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.validityFrom}
                  onChange={e => setFormData({ ...formData, validityFrom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Validity To <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.validityTo}
                  onChange={e => setFormData({ ...formData, validityTo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={editingSetting ? handleUpdateSetting : handleAddSetting}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all"
              >
                {editingSetting ? 'Update' : 'Save'}
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
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}

export default CompOffSettings;