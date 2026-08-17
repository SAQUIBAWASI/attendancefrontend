import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Sparkles,
  XCircle,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  Download,
  IndianRupee
} from "lucide-react";
import "./EmployeeDashboard.css";

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    _id: "",
    name: "",
    price: "",
    description: ""
  });
  
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Modal States
  const [selectedService, setSelectedService] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    const saved = localStorage.getItem('services_itemsPerPage');
    return saved ? parseInt(saved, 10) : 10;
  });

  // Toast State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // =============================================
  // 1. GET ALL SERVICES - /allservices
  // =============================================
  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/services/allservices`);
      
      if (res && res.data && res.data.success) {
        setServices(res.data.services || []);
      } else {
        setServices([]);
        showToast("No services found", "info");
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      setServices([]);
      showToast(error.response?.data?.message || "Failed to fetch services. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      _id: "",
      name: "",
      price: "",
      description: ""
    });
    setIsEditing(false);
    setShowForm(false);
  };

  // Open Add Form
  const openAddForm = () => {
    resetForm();
    setIsEditing(false);
    setShowForm(true);
  };

  // Open Edit Form
  const openEditForm = (service) => {
    setFormData({
      _id: service._id,
      name: service.name,
      price: service.price,
      description: service.description || ""
    });
    setIsEditing(true);
    setShowForm(true);
  };

  // =============================================
  // 2. ADD SERVICE - /addservice (POST)
  // =============================================
  const handleSaveService = async () => {
    if (!formData.name.trim() || !formData.price) {
      showToast("Please fill in all required fields!", "error");
      return;
    }

    try {
      if (isEditing) {
        // =============================================
        // 3. UPDATE SERVICE - /updateservice/:id (PUT)
        // =============================================
        const updatedService = {
          name: formData.name.trim(),
          price: parseFloat(formData.price),
          description: formData.description.trim() || ""
        };

        const res = await axios.put(
          `${API_BASE_URL}/services/updateservice/${formData._id}`,
          updatedService
        );
        
        if (res && res.data && res.data.success) {
          // Update the service in the list
          setServices(prev =>
            prev.map(s => s._id === formData._id ? res.data.data : s)
          );
          showToast(res.data.message || `Service updated successfully!`, "success");
        }
      } else {
        // Add new service
        const newService = {
          name: formData.name.trim(),
          price: parseFloat(formData.price),
          description: formData.description.trim() || ""
        };

        const res = await axios.post(
          `${API_BASE_URL}/services/addservice`,
          newService
        );
        
        if (res && res.data && res.data.success) {
          setServices(prev => [res.data.data, ...prev]);
          showToast(res.data.message || `Service added successfully!`, "success");
        }
      }

      resetForm();
    } catch (error) {
      console.error("Error saving service:", error);
      showToast(
        error.response?.data?.message || "Failed to save service. Please try again.",
        "error"
      );
    }
  };

  // =============================================
  // 4. DELETE SERVICE - /deleteservice/:id (DELETE)
  // =============================================
  const handleDeleteService = async (service) => {
    if (!window.confirm(`Are you sure you want to delete "${service.name}"?`)) {
      return;
    }

    try {
      const res = await axios.delete(
        `${API_BASE_URL}/services/deleteservice/${service._id}`
      );
      
      if (res && res.data && res.data.success) {
        setServices(prev => prev.filter(s => s._id !== service._id));
        showToast(res.data.message || `Service deleted successfully!`, "info");
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      showToast(
        error.response?.data?.message || "Failed to delete service. Please try again.",
        "error"
      );
    }
  };

  // Filtered Services
  const filteredServices = useMemo(() => {
    return services.filter(s => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = s.name.toLowerCase().includes(query);
        const matchPrice = s.price.toString().includes(query);
        const matchDescription = (s.description || "").toLowerCase().includes(query);
        return matchName || matchPrice || matchDescription;
      }
      return true;
    });
  }, [services, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const total = services.length;
    const totalPrice = services.reduce((sum, s) => sum + (s.price || 0), 0);
    const avgPrice = total > 0 ? (totalPrice / total).toFixed(0) : 0;

    return { total, totalPrice, avgPrice };
  }, [services]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRecords = filteredServices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);

  const handleItemsPerPageChange = (e) => {
    const newValue = Number(e.target.value);
    setItemsPerPage(newValue);
    localStorage.setItem('services_itemsPerPage', String(newValue));
    setCurrentPage(1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 2 && i <= currentPage + 2)
      ) {
        pageNumbers.push(i);
      } else if (i === currentPage - 3 || i === currentPage + 3) {
        pageNumbers.push("...");
      }
    }
    return pageNumbers;
  };

  // Download CSV
  const downloadCSV = () => {
    if (filteredServices.length === 0) {
      showToast("No services data available to export!", "error");
      return;
    }

    const headers = ["Service Name", "Price (₹)", "Description", "Created At"];
    const csvRows = [
      headers.join(","),
      ...filteredServices.map((s) => [
        `"${s.name.replace(/"/g, '""')}"`,
        s.price || 0,
        `"${(s.description || "").replace(/"/g, '""')}"`,
        s.createdAt ? new Date(s.createdAt).toLocaleDateString() : ""
      ].join(","))
    ];

    const csvData = csvRows.join("\n");
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `services_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filteredServices.length} services to CSV!`);
  };

  const clearFilters = () => {
    setSearchQuery("");
  };

  return (
    <div className="emp-dash">
      <main className="p-2 sm:p-4 lg:p-6">
        {/* Toast Notification */}
        {toast && (
          <div
            className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white transition-all transform animate-bounce ${
              toast.type === "error" ? "bg-red-600" : toast.type === "info" ? "bg-cyan-600" : "bg-emerald-600"
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span className="font-medium text-sm">{toast.message}</span>
          </div>
        )}

        {/* Header */}
        <div className="emp-dash__header">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap">
              Service <span>Management</span>
            </h1>
            <span className="text-xs text-gray-500 font-medium bg-white px-2.5 py-0.5 rounded-full border border-gray-200 shadow-xs">
              {services.length} Total Services
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchServices}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
            <button
              onClick={downloadCSV}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all shadow-md"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
            <button
              onClick={openAddForm}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-md"
            >
              <Plus className="w-3.5 h-3.5" /> Add Service
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-6">
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Services</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <Plus className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div className="emp-dash__stat-value">{stats.total}</div>
            <div className="emp-dash__stat-meta">active services</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Average Price</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <IndianRupee className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <div className="emp-dash__stat-value text-emerald-600">₹{stats.avgPrice}</div>
            <div className="emp-dash__stat-meta">per service</div>
          </div>

          <div className="emp-dash__stat col-span-2 lg:col-span-1">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Value</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                <IndianRupee className="w-4 h-4 text-indigo-600" />
              </div>
            </div>
            <div className="emp-dash__stat-value text-indigo-600">₹{stats.totalPrice}</div>
            <div className="emp-dash__stat-meta">combined service value</div>
          </div>
        </div>

        {/* Filters Card */}
        <div className="emp-dash__card mb-6">
          <div className="hidden lg:block">
            <div className="flex items-center justify-between gap-3 p-3 bg-white rounded-xl border border-gray-200">
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <div className="relative min-w-[160px] flex-1 max-w-[240px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                  <input
                    type="text"
                    placeholder="Search service name, price..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {searchQuery && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm whitespace-nowrap"
                  >
                    <Trash2 className="w-3 h-3 text-red-500" />
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Filters */}
          <div className="lg:hidden">
            <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="flex items-center gap-2 text-sm font-semibold text-gray-700"
              >
                <Filter className="text-blue-600 text-base" />
                <span>Filters &amp; Actions</span>
                {showMobileFilters ? (
                  <ChevronUp className="text-gray-400" />
                ) : (
                  <ChevronDown className="text-gray-400" />
                )}
              </button>
              <span className="text-xs text-gray-500">
                <strong>{filteredServices.length}</strong> records
              </span>
            </div>

            {showMobileFilters && (
              <div className="mt-2 p-4 bg-white rounded-xl border border-gray-200 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Search Service</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search service name, price..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={downloadCSV}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all shadow-sm"
                    >
                      <Download className="w-4 h-4" />
                      Export CSV
                    </button>
                    <button
                      onClick={openAddForm}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Service
                    </button>
                  </div>
                  {searchQuery && (
                    <button
                      onClick={clearFilters}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                      Clear Search
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Services Table */}
        {loading ? (
          <div className="emp-dash__card py-12 text-center text-gray-500">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-500">Loading services...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="emp-dash__card py-12 text-center text-gray-500">
            <Plus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-700">No Services Found</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto mb-4">
              {services.length === 0 
                ? "No services have been added yet. Click 'Add Service' to create one." 
                : "No services match your search criteria."}
            </p>
            {services.length === 0 ? (
              <button
                onClick={openAddForm}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-md"
              >
                <Plus className="w-4 h-4 inline mr-1" /> Add Service
              </button>
            ) : searchQuery && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="emp-dash__card">
            <div className="overflow-x-auto">
              <table className="emp-dash__table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Service Name</th>
                    <th>Price</th>
                    <th>Description</th>
                    <th>Created At</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.map((service, index) => (
                    <tr key={service._id} className="transition-colors hover:bg-slate-50/50">
                      <td className="px-3 py-3 text-xs text-gray-500 font-medium">
                        {indexOfFirstItem + index + 1}
                      </td>

                      <td className="px-3 py-3">
                        <div className="font-bold text-slate-800 text-xs">{service.name}</div>
                      </td>

                      <td className="px-3 py-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <IndianRupee className="w-3 h-3" />
                          {service.price || 0}
                        </span>
                      </td>

                      <td className="px-3 py-3 max-w-[200px]">
                        <div className="truncate text-xs text-slate-600" title={service.description || ""}>
                          {service.description || "No description"}
                        </div>
                      </td>

                      <td className="px-3 py-3 text-xs text-gray-500">
                        {service.createdAt ? new Date(service.createdAt).toLocaleDateString() : "N/A"}
                      </td>

                      {/* Action Column - 3 Icons: View, Edit, Delete */}
                      <td className="px-3 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1. View Details */}
                          <button
                            onClick={() => {
                              setSelectedService(service);
                              setShowViewModal(true);
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {/* 2. Edit Service */}
                          <button
                            onClick={() => openEditForm(service)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit Service"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          
                          {/* 3. Delete Service */}
                          <button
                            onClick={() => handleDeleteService(service)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Service"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-200/50 bg-gray-50/30">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>Show</span>
                  <select
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                    className="p-1 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span>entries</span>
                </div>
                <div className="text-xs text-gray-500 font-medium">
                  Showing <strong className="text-gray-800">{indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredServices.length)}</strong> of{" "}
                  <strong className="text-gray-800">{filteredServices.length}</strong> records
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`px-2.5 py-1 text-xs font-semibold border rounded-lg transition-all ${
                    currentPage === 1
                      ? "text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed"
                      : "text-gray-700 bg-white hover:bg-gray-50 border-gray-300 shadow-sm"
                  }`}
                >
                  Prev
                </button>

                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === 'number' ? handlePageClick(page) : null}
                    disabled={page === "..."}
                    className={`px-3 py-1 text-xs font-semibold border rounded-lg transition-all min-w-[32px] ${
                      page === "..."
                        ? "text-gray-400 bg-transparent border-transparent cursor-default"
                        : currentPage === page
                          ? "text-white bg-blue-600 border-blue-600 shadow-sm"
                          : "text-gray-700 bg-white hover:bg-gray-50 border-gray-300"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-2.5 py-1 text-xs font-semibold border rounded-lg transition-all ${
                    currentPage === totalPages
                      ? "text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed"
                      : "text-gray-700 bg-white hover:bg-gray-50 border-gray-300 shadow-sm"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Service Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-gray-200">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isEditing ? "bg-indigo-600" : "bg-emerald-600"
                  } text-white`}>
                    {isEditing ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">
                      {isEditing ? "Edit Service" : "Add New Service"}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {isEditing ? "Update service details" : "Create a new service"}
                    </p>
                  </div>
                </div>
                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="my-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">
                    Service Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., General Consultation"
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">
                    Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="e.g., 300"
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Brief description of the service..."
                    rows="3"
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveService}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isEditing ? "Update Service" : "Add Service"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Service Modal */}
        {showViewModal && selectedService && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-gray-200 relative">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                    <Eye className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Service Details</h3>
                    <p className="text-xs text-gray-500">ID: {selectedService._id}</p>
                  </div>
                </div>
                <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="my-5 bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <div>
                    <div className="text-[10px] font-bold uppercase text-gray-400">Service Name</div>
                    <div className="text-base font-bold text-gray-900">{selectedService.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold uppercase text-gray-400">Price</div>
                    <div className="text-sm font-bold text-emerald-700">
                      <IndianRupee className="inline w-4 h-4" /> {selectedService.price || 0}
                    </div>
                  </div>
                </div>

                <div className="pt-1">
                  <div className="text-[10px] font-bold uppercase text-gray-400">Description</div>
                  <div className="text-sm font-medium text-gray-700 leading-relaxed">
                    {selectedService.description || "No description provided"}
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <div className="text-[10px] font-bold uppercase text-gray-400">Created At</div>
                  <div className="text-xs font-medium text-gray-600">
                    {selectedService.createdAt ? new Date(selectedService.createdAt).toLocaleString() : "N/A"}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    openEditForm(selectedService);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all flex items-center gap-1.5"
                >
                  <Edit className="w-4 h-4" /> Edit Service
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Services;