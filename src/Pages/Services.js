import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import {
  FaSearch,
  FaRupeeSign,
  FaPlus,
  FaTrashAlt,
  FaEdit,
  FaEye,
  FaFileMedical,
  FaTimes,
  FaCheck,
  FaCheckCircle,
  FaFileInvoiceDollar
} from "react-icons/fa";
import {
  FiUsers,
  FiFilter,
  FiDownload,
  FiTrash2,
  FiPlus,
  FiEdit2,
  FiEye,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiLayers,
  FiDollarSign,
  FiTrendingUp,
  FiActivity
} from "react-icons/fi";
import "./EmployeeDashboard.css";
import "./EmployeeLeaves.css";

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
  const [submitting, setSubmitting] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [priceSort, setPriceSort] = useState("default");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Modal States
  const [selectedService, setSelectedService] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    const saved = localStorage.getItem("services_itemsPerPage");
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
      showToast(
        error.response?.data?.message || "Failed to fetch services. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
  // 2. ADD / UPDATE SERVICE
  // =============================================
  const handleSaveService = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) {
      showToast("Please fill in all required fields!", "error");
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing) {
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
          setServices((prev) =>
            prev.map((s) => (s._id === formData._id ? res.data.data : s))
          );
          showToast(res.data.message || "Service updated successfully!", "success");
          resetForm();
        }
      } else {
        const newService = {
          name: formData.name.trim(),
          price: parseFloat(formData.price),
          description: formData.description.trim() || ""
        };

        const res = await axios.post(`${API_BASE_URL}/services/addservice`, newService);

        if (res && res.data && res.data.success) {
          setServices((prev) => [res.data.data, ...prev]);
          showToast(res.data.message || "Service added successfully!", "success");
          resetForm();
        }
      }
    } catch (error) {
      console.error("Error saving service:", error);
      showToast(
        error.response?.data?.message || "Failed to save service. Please try again.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =============================================
  // 3. DELETE SERVICE
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
        setServices((prev) => prev.filter((s) => s._id !== service._id));
        showToast(res.data.message || "Service deleted successfully!", "info");
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      showToast(
        error.response?.data?.message || "Failed to delete service. Please try again.",
        "error"
      );
    }
  };

  // Filtered & Sorted Services
  const filteredServices = useMemo(() => {
    let result = services.filter((s) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = (s.name || "").toLowerCase().includes(query);
        const matchPrice = (s.price !== undefined ? s.price.toString() : "").includes(query);
        const matchDescription = (s.description || "").toLowerCase().includes(query);
        return matchName || matchPrice || matchDescription;
      }
      return true;
    });

    if (priceSort === "lowToHigh") {
      result = [...result].sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (priceSort === "highToLow") {
      result = [...result].sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (priceSort === "nameAZ") {
      result = [...result].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }

    return result;
  }, [services, searchQuery, priceSort]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, priceSort]);

  // Stats
  const stats = useMemo(() => {
    const total = services.length;
    const totalPrice = services.reduce((sum, s) => sum + (s.price || 0), 0);
    const avgPrice = total > 0 ? (totalPrice / total).toFixed(0) : 0;
    const maxPrice = total > 0 ? Math.max(...services.map((s) => s.price || 0)) : 0;
    const minPrice = total > 0 ? Math.min(...services.map((s) => s.price || 0)) : 0;

    return { total, totalPrice, avgPrice, maxPrice, minPrice };
  }, [services]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRecords = filteredServices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);

  const handleItemsPerPageChange = (e) => {
    const newValue = Number(e.target.value);
    setItemsPerPage(newValue);
    localStorage.setItem("services_itemsPerPage", String(newValue));
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

    const headers = ["#", "Service Name", "Price (INR)", "Description", "Created At"];
    const csvRows = [
      headers.join(","),
      ...filteredServices.map((s, idx) => [
        idx + 1,
        `"${(s.name || "").replace(/"/g, '""')}"`,
        s.price || 0,
        `"${(s.description || "").replace(/"/g, '""')}"`,
        s.createdAt ? `"${new Date(s.createdAt).toLocaleDateString()}"` : '""'
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
    setPriceSort("default");
    setCurrentPage(1);
  };

  const isFilterActive = searchQuery !== "" || priceSort !== "default";

  return (
    <div className="emp-dash">
      <main className="p-2 sm:p-4 lg:p-6">
        {/* Toast Notification */}
        {toast && (
          <div
            className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white transition-all transform animate-bounce ${
              toast.type === "error"
                ? "bg-red-600"
                : toast.type === "info"
                ? "bg-cyan-600"
                : "bg-emerald-600"
            }`}
          >
            {toast.type === "error" ? (
              <FiXCircle className="w-5 h-5" />
            ) : (
              <FiCheckCircle className="w-5 h-5" />
            )}
            <span className="font-medium text-sm">{toast.message}</span>
          </div>
        )}

        {/* ===================== HEADER ===================== */}
        <div className="emp-dash__header">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap">
              Service <span>Management</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="emp-dash__date-pill">
              <FaFileMedical />
              <span>{services.length} Clinical Services</span>
            </div>
            <button
              onClick={fetchServices}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
              title="Refresh Services"
            >
              <FiRefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={downloadCSV}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all shadow-sm"
              title="Export CSV"
            >
              <FiDownload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button
              onClick={openAddForm}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm"
            >
              <FiPlus className="w-3.5 h-3.5" />
              <span>Add Service</span>
            </button>
          </div>
        </div>

        {/* ===================== TOP KPI STATS GRID ===================== */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
          {/* Total Services */}
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Services</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FiLayers />
              </div>
            </div>
            <div className="emp-dash__stat-value">{stats.total}</div>
            <div className="emp-dash__stat-meta">active clinical services</div>
          </div>

          {/* Average Price */}
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Average Fee</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <FaRupeeSign />
              </div>
            </div>
            <div className="emp-dash__stat-value text-emerald-600">₹{stats.avgPrice}</div>
            <div className="emp-dash__stat-meta">per service average</div>
          </div>

          {/* Min Price */}
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Min Fee</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <FiTrendingUp />
              </div>
            </div>
            <div className="emp-dash__stat-value text-indigo-600">₹{stats.minPrice}</div>
            <div className="emp-dash__stat-meta">lowest priced item</div>
          </div>

          {/* Max Price */}
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Max Fee</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                <FiDollarSign />
              </div>
            </div>
            <div className="emp-dash__stat-value text-purple-600">₹{stats.maxPrice}</div>
            <div className="emp-dash__stat-meta">highest priced item</div>
          </div>

          {/* Filtered Records */}
          <div className="emp-dash__stat col-span-2 lg:col-span-1">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Filtered Services</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FiFilter />
              </div>
            </div>
            <div className="emp-dash__stat-value text-base sm:text-lg md:text-xl font-bold truncate">
              {filteredServices.length}
            </div>
            <div className="emp-dash__stat-meta">matching results</div>
          </div>
        </div>

        {/* ===================== FILTERS CARD ===================== */}
        <div className="emp-dash__card mb-6">
          {/* Desktop Filter Bar */}
          <div className="hidden lg:block">
            <div className="flex items-center justify-between gap-3 p-3 bg-white rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {/* Search */}
                <div className="relative min-w-[180px] flex-1 max-w-[280px]">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  <input
                    type="text"
                    placeholder="Search service name, price, description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  />
                </div>

                {/* Sort Filter */}
                <select
                  value={priceSort}
                  onChange={(e) => setPriceSort(e.target.value)}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                    priceSort !== "default"
                      ? "border-blue-500 text-blue-700 bg-blue-50"
                      : "border-gray-300 text-gray-700"
                  }`}
                >
                  <option value="default">Sort by: Default</option>
                  <option value="nameAZ">Name (A-Z)</option>
                  <option value="lowToHigh">Price: Low to High</option>
                  <option value="highToLow">Price: High to Low</option>
                </select>
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {isFilterActive && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm whitespace-nowrap"
                  >
                    <FiTrash2 className="w-3 h-3 text-red-500" />
                    Clear
                  </button>
                )}

                <button
                  onClick={downloadCSV}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all shadow-sm whitespace-nowrap"
                >
                  <FiDownload className="w-3 h-3" />
                  Export
                </button>
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
                <FiFilter className="text-blue-600 text-base" />
                <span>Filters &amp; Actions</span>
                <span className="text-gray-400 text-xs">
                  {showMobileFilters ? "▲" : "▼"}
                </span>
              </button>
              <span className="text-xs text-gray-500">
                <strong>{filteredServices.length}</strong> services
              </span>
            </div>

            {showMobileFilters && (
              <div className="mt-2 p-4 bg-white rounded-xl border border-gray-200 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Search Service</label>
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                    <input
                      type="text"
                      placeholder="Search service name, price..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Sort Options</label>
                  <select
                    value={priceSort}
                    onChange={(e) => setPriceSort(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  >
                    <option value="default">Default</option>
                    <option value="nameAZ">Name (A-Z)</option>
                    <option value="lowToHigh">Price: Low to High</option>
                    <option value="highToLow">Price: High to Low</option>
                  </select>
                </div>

                <div className="pt-3 border-t border-gray-200 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={downloadCSV}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all shadow-sm"
                    >
                      <FiDownload className="w-3.5 h-3.5" />
                      Export CSV
                    </button>
                    {isFilterActive && (
                      <button
                        onClick={clearFilters}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
                      >
                        <FiTrash2 className="w-3.5 h-3.5 text-red-500" />
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ===================== SERVICES TABLE ===================== */}
        <div className="emp-dash__card">
          {loading ? (
            <div className="py-12 text-center text-gray-500">
              <FiRefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">Loading services...</p>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <FaFileMedical className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-700">No Services Found</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto mb-4">
                {services.length === 0
                  ? "Click 'Add Service' to create your first clinical service."
                  : "No services match your search criteria."}
              </p>
              {isFilterActive ? (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
                >
                  Clear Filters
                </button>
              ) : (
                <button
                  onClick={openAddForm}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm inline-flex items-center gap-1.5"
                >
                  <FiPlus className="w-3.5 h-3.5" /> Add Service
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="emp-dash__table">
                  <thead>
                    <tr>
                      <th style={{ width: "50px", textAlign: "center" }}>S.No</th>
                      <th>Service Details</th>
                      <th style={{ textAlign: "center" }}>Price</th>
                      <th>Description</th>
                      <th style={{ textAlign: "center" }}>Created Date</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecords.map((service, index) => (
                      <tr
                        key={service._id}
                        className="transition-colors hover:bg-blue-50/40 cursor-pointer"
                        onClick={() => {
                          setSelectedService(service);
                          setShowViewModal(true);
                        }}
                      >
                        {/* Index */}
                        <td className="px-3 py-3 text-center text-slate-500 font-semibold text-xs">
                          {indexOfFirstItem + index + 1}
                        </td>

                        {/* Service Details */}
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-xs shadow-sm">
                              {service.name ? service.name.charAt(0).toUpperCase() : "S"}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-800 text-xs truncate">
                                {service.name}
                              </div>
                              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                                Clinical Item
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-0.5 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <FaRupeeSign className="text-[10px]" />
                            {service.price || 0}
                          </span>
                        </td>

                        {/* Description */}
                        <td className="px-3 py-3 max-w-[260px]">
                          <div
                            className="truncate text-xs text-slate-600"
                            title={service.description || "No description"}
                          >
                            {service.description || "No description provided"}
                          </div>
                        </td>

                        {/* Created Date */}
                        <td className="px-3 py-3 text-center text-xs text-gray-500 whitespace-nowrap">
                          {service.createdAt
                            ? new Date(service.createdAt).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric"
                              })
                            : "-"}
                        </td>

                        {/* Actions */}
                        <td
                          className="px-3 py-3 text-right whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setSelectedService(service);
                                setShowViewModal(true);
                              }}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                              title="View Details"
                            >
                              <FiEye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openEditForm(service)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                              title="Edit Service"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteService(service)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                              title="Delete Service"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ===================== PAGINATION ===================== */}
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
                    Showing{" "}
                    <strong className="text-gray-800">
                      {filteredServices.length === 0 ? 0 : indexOfFirstItem + 1} -{" "}
                      {Math.min(indexOfLastItem, filteredServices.length)}
                    </strong>{" "}
                    of <strong className="text-gray-800">{filteredServices.length}</strong> records
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
                      onClick={() => (typeof page === "number" ? handlePageClick(page) : null)}
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
                    disabled={currentPage === totalPages || totalPages === 0}
                    className={`px-2.5 py-1 text-xs font-semibold border rounded-lg transition-all ${
                      currentPage === totalPages || totalPages === 0
                        ? "text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed"
                        : "text-gray-700 bg-white hover:bg-gray-50 border-gray-300 shadow-sm"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ===================== ADD / EDIT SERVICE MODAL ===================== */}
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-gray-200">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-md ${
                      isEditing
                        ? "bg-indigo-600 shadow-indigo-500/20"
                        : "bg-blue-600 shadow-blue-500/20"
                    }`}
                  >
                    {isEditing ? <FaEdit className="w-4 h-4" /> : <FaPlus className="w-4 h-4" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">
                      {isEditing ? "Edit Clinical Service" : "Add Clinical Service"}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {isEditing ? "Update service details below" : "Enter service name & pricing"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveService} className="mt-5 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                    Service Name <span className="text-blue-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., General Consultation, ECG, Dressing..."
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                    Price (₹) <span className="text-blue-600">*</span>
                  </label>
                  <div className="relative">
                    <FaRupeeSign className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="e.g., 300"
                      min="0"
                      step="1"
                      className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Brief description or clinical notes regarding the service..."
                    rows={3}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`px-5 py-2 rounded-lg text-xs font-bold text-white shadow-sm transition-all flex items-center gap-1.5 ${
                      isEditing
                        ? "bg-indigo-600 hover:bg-indigo-700"
                        : "bg-blue-600 hover:bg-blue-700"
                    } disabled:opacity-50`}
                  >
                    {submitting ? (
                      <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <FaCheck className="w-3.5 h-3.5" />
                    )}
                    {submitting
                      ? "Saving..."
                      : isEditing
                      ? "Save Changes"
                      : "Create Service"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ===================== VIEW SERVICE MODAL ===================== */}
        {showViewModal && selectedService && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-gray-200 relative">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
                    <FaFileMedical className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Service Details</h3>
                    <p className="text-xs text-gray-500">ID: {selectedService._id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>

              <div className="my-5 bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <div>
                    <div className="text-[10px] font-bold uppercase text-gray-400">Service Name</div>
                    <div className="text-base font-bold text-gray-900">{selectedService.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold uppercase text-gray-400">Price</div>
                    <div className="text-sm font-extrabold text-emerald-700">
                      ₹{selectedService.price || 0}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold uppercase text-gray-400 mb-1">Description</div>
                  <div className="text-xs text-gray-700 leading-relaxed bg-white p-3 rounded-lg border border-gray-200">
                    {selectedService.description || "No description provided"}
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200 flex justify-between text-xs text-gray-500">
                  <span>Created At:</span>
                  <span className="font-semibold text-gray-700">
                    {selectedService.createdAt
                      ? new Date(selectedService.createdAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })
                      : "N/A"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    openEditForm(selectedService);
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all flex items-center gap-1.5"
                >
                  <FiEdit2 className="w-3.5 h-3.5" /> Edit Service
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-200 hover:bg-gray-300 text-gray-700 transition-all"
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