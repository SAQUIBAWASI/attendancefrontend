import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaCalendarAlt,
  FaClipboardList,
  FaCommentDots,
  FaEye,
  FaInfoCircle,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaPlus,
  FaRoute,
  FaSearch,
  FaSync,
  FaTimes,
  FaTrashAlt,
  FaEdit,
  FaCheckCircle,
  FaCar,
  FaWallet,
  FaFileInvoice,
  FaUserClock,
  FaExclamationCircle,
  FaChevronDown,
  FaChevronUp,
  FaUser,
} from "react-icons/fa";
import { FiFilter, FiTrash2, FiInbox } from "react-icons/fi";
import { API_BASE_URL } from "../config";
import "./EmployeeDashboard.css";
import "./EmployeePageShell.css";
import "../index.css";

const INITIAL_STOP = {
  locationName: "",
  outcome: "",
  orderValue: "",
  upsellValue: "",
  km: "",
};

const INITIAL_FORM = {
  purpose: "",
  date: new Date().toISOString().split("T")[0],
  km: "",
  remark: "",
};

const formatCurrency = (value) => 
  `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
  
const formatDate = (value) => 
  value ? new Date(value).toLocaleDateString("en-IN", { 
    day: "numeric", 
    month: "short", 
    year: "numeric" 
  }) : "—";

const StatusBadge = ({ status }) => {
  const config = {
    Pending: { bg: '#fef0c7', text: '#b54708' },
    Approved: { bg: '#d1fae5', text: '#065f46' },
    Rejected: { bg: '#fee4e2', text: '#b42318' },
  };
  const style = config[status] || { bg: '#f3f4f6', text: '#374151' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '0.2rem 0.55rem', borderRadius: 6,
      fontSize: '0.7rem', fontWeight: 700,
      backgroundColor: style.bg, color: style.text,
    }}>
      {status || 'Pending'}
    </span>
  );
};

const ExpenseManagement = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [kmRate, setKmRate] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [tableSearch, setTableSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [stops, setStops] = useState([{ ...INITIAL_STOP }]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editFormData, setEditFormData] = useState(INITIAL_FORM);
  const [editStops, setEditStops] = useState([{ ...INITIAL_STOP }]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [error, setError] = useState("");

  const employeeId = useMemo(() => {
    const directId = localStorage.getItem("employeeId");
    if (directId) return directId;
    try {
      return JSON.parse(localStorage.getItem("employeeData") || "{}")?.employeeId || "";
    } catch {
      return "";
    }
  }, []);

  const employeeName = useMemo(() => {
    const directName = localStorage.getItem("employeeName");
    if (directName) return directName;
    try {
      const data = JSON.parse(localStorage.getItem("employeeData") || "{}");
      return data?.name || data?.employeeName || "";
    } catch {
      return "";
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    if (!employeeId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [expensesRes, rateRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/expense/my?employeeId=${employeeId}`),
        axios.get(`${API_BASE_URL}/expense/rate`),
      ]);

      if (expensesRes.data.success) {
        setExpenses(Array.isArray(expensesRes.data.data) ? expensesRes.data.data : []);
      }
      if (rateRes.data.success) {
        setKmRate(rateRes.data.rate);
      }
    } catch (error) {
      console.error("Error fetching expense data:", error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message) => {
    setToastMessage(message);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handleOpenAddExpense = () => {
    setFormData(INITIAL_FORM);
    setStops([{ ...INITIAL_STOP }]);
    setError("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedExpense(null);
    setEditingExpense(null);
    setError("");
  };

  const handleViewExpense = (expense) => {
    setSelectedExpense(expense);
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setEditFormData({
      purpose: expense.purpose || "",
      date: expense.date ? new Date(expense.date).toISOString().split("T")[0] : "",
      km: expense.km || "",
      remark: expense.remark || "",
    });
    setEditStops(expense.stops && expense.stops.length > 0 
      ? expense.stops.map(s => ({ ...s })) 
      : [{ ...INITIAL_STOP }]
    );
    setError("");
    setIsEditModalOpen(true);
  };

  // ============= EDIT FUNCTIONS =============
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditStopChange = (index, field, value) => {
    setEditStops((prev) =>
      prev.map((stop, stopIndex) =>
        stopIndex === index ? { ...stop, [field]: value } : stop
      )
    );
  };

  const addEditStop = () => {
    setEditStops((prev) => [...prev, { ...INITIAL_STOP }]);
  };

  const removeEditStop = (index) => {
    if (editStops.length === 1) return;
    setEditStops((prev) => prev.filter((_, i) => i !== index));
  };

  const editParsedKm = editFormData.km ? parseFloat(editFormData.km) : 0;
  const editStopsKm = editStops.reduce((sum, stop) => sum + (parseFloat(stop.km) || 0), 0);
  const editTotalKm = editStopsKm > 0 ? editStopsKm : editParsedKm;
  const editCalculatedCost = (editTotalKm * kmRate).toFixed(2);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!editFormData.purpose || editTotalKm <= 0 || !editFormData.date) {
      setError("Please fill in purpose, distance (KM), and date.");
      return;
    }

    setIsUpdating(true);

    try {
      const updateData = {
        employeeId: employeeId,
        purpose: editFormData.purpose,
        date: editFormData.date,
        km: editTotalKm,
        rateApplied: kmRate,
        totalAmount: Number(editCalculatedCost),
        outcome: "",
        orderValue: editStops.reduce((sum, stop) => sum + (Number(stop.orderValue) || 0), 0),
        upsellValue: editStops.reduce((sum, stop) => sum + (Number(stop.upsellValue) || 0), 0),
        remark: editFormData.remark || "",
        stops: editStops
      };

      const res = await axios.put(
        `${API_BASE_URL}/expense/edit/${editingExpense._id}`,
        updateData
      );

      if (res.data.success) {
        showToast("✅ Expense updated successfully!");
        handleCloseModal();
        await fetchInitialData();
      } else {
        setError("❌ Failed to update expense!");
      }
    } catch (error) {
      console.error("Error updating expense:", error);
      setError(error?.response?.data?.message || error?.message || "Failed to update. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  // ============= DELETE FUNCTIONS =============
  const handleDeleteExpense = async (expenseId, purpose) => {
    if (window.confirm(`Are you sure you want to delete this expense record for "${purpose || 'Unknown'}"?`)) {
      setIsDeleting(true);
      try {
        const res = await axios.delete(`${API_BASE_URL}/expense/delete/${expenseId}`);
        if (res.data.success) {
          showToast("✅ Expense deleted successfully!");
          await fetchInitialData();
          setSelectedExpense(null);
        }
      } catch (error) {
        console.error("Error deleting expense:", error);
        alert("❌ Failed to delete expense!");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // ============= ORIGINAL FUNCTIONS =============
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStopChange = (index, field, value) => {
    setStops((prev) =>
      prev.map((stop, stopIndex) =>
        stopIndex === index ? { ...stop, [field]: value } : stop
      )
    );
  };

  const addStop = () => {
    setStops((prev) => [...prev, { ...INITIAL_STOP }]);
  };

  const removeStop = (index) => {
    if (stops.length === 1) return;
    setStops((prev) => prev.filter((_, i) => i !== index));
  };

  const parsedKm = formData.km ? parseFloat(formData.km) : 0;
  const stopsKm = stops.reduce((sum, stop) => sum + (parseFloat(stop.km) || 0), 0);
  const totalKm = stopsKm > 0 ? stopsKm : parsedKm;
  const calculatedCost = (totalKm * kmRate).toFixed(2);

  const filteredExpenses = useMemo(() => {
    const query = tableSearch.trim().toLowerCase();

    return expenses.filter((expense) => {
      const outcome = expense.outcome || expense.stops?.[0]?.outcome || "";
      const matchesSearch = !query || (
        expense.purpose?.toLowerCase().includes(query) ||
        outcome.toLowerCase().includes(query) ||
        expense.remark?.toLowerCase().includes(query)
      );

      const matchesStatus = !statusFilter || (expense.status || "Pending") === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [expenses, tableSearch, statusFilter]);

  const stats = useMemo(() => {
    const totalClaims = expenses.length;
    const totalAmount = expenses.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);
    const totalDistance = expenses.reduce((sum, item) => sum + Number(item.km || 0), 0);
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const monthlyClaims = expenses.filter((item) => {
      const itemDate = item.date ? new Date(item.date) : null;
      return itemDate && itemDate.getMonth() === thisMonth && itemDate.getFullYear() === thisYear;
    }).length;

    return {
      totalClaims,
      totalAmount,
      totalDistance,
      monthlyClaims,
    };
  }, [expenses]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!employeeId) {
      setError("Employee details are missing. Please login again.");
      return;
    }

    if (!formData.purpose || totalKm <= 0 || !formData.date) {
      setError("Please fill in purpose, distance (KM), and date.");
      return;
    }

    for (let i = 0; i < stops.length; i += 1) {
      if (!stops[i].locationName.trim()) {
        setError(`Please provide a Location/Sample Name for Stop ${i + 1}.`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/expense/add`, {
        ...formData,
        km: totalKm,
        stops,
        employeeId,
      });

      if (response.data.success) {
        setExpenses((prev) => [response.data.expense, ...prev]);
        handleCloseModal();
        showToast("✅ Expense recorded successfully!");
      }
    } catch (error) {
      console.error("Error submitting expense:", error);
      setError(error?.response?.data?.message || error?.message || "Failed to record expense. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && expenses.length === 0) {
    return (
      <div className="emp-dash emp-page-shell">
        <div className="emp-dash__loading">
          <div className="emp-dash__spinner" />
          <p className="emp-dash__loading-text">Loading your expense records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="emp-dash">
      {showSuccessToast && (
        <div className="emp-toast">
          <div className="emp-toast-content">
            <FaCheckCircle className="emp-toast-icon" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      <main className="p-2 sm:p-4 lg:p-6">
        {/* ── Desktop Header ── */}
        <div className="hidden sm:flex items-center justify-between gap-4 flex-wrap mb-4">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap">
              Expense <span>Management</span>
            </h1>
          </div>

          {/* Right side: Compact Filters & Actions (Desktop only) */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Record Expense Button */}
            <button
              type="button"
              onClick={handleOpenAddExpense}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm whitespace-nowrap"
            >
              <FaPlus size={10} /> Record Expense
            </button>

            {/* Quick Search - Compact */}
            <div className="relative">
              <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]" />
              <input
                type="text"
                placeholder="Search expense..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="w-[150px] pl-7 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-medium text-gray-700"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>

            {/* Clear Filters Button */}
            {(tableSearch || statusFilter) && (
              <button
                onClick={() => {
                  setTableSearch("");
                  setStatusFilter("");
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm whitespace-nowrap"
              >
                <FiTrash2 className="w-3 h-3" />
                Clear
              </button>
            )}

            {/* Refresh Button */}
            <button
              onClick={fetchInitialData}
              disabled={loading}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-all shadow-sm whitespace-nowrap"
            >
              <FaSync className={loading ? "animate-spin" : ""} size={10} />
              {loading ? "Loading..." : "Refresh"}
            </button>

            {/* Employee info pill */}
            {employeeName && (
              <div className="emp-dash__date-pill">
                <FaUser className="text-blue-600 text-[10px]" />
                <span>{employeeName}</span>
                {employeeId && <span className="text-gray-400 text-[10px] font-medium">· {employeeId}</span>}
              </div>
            )}
          </div>
        </div>

        {/* ── Mobile Header ── */}
        <div className="sm:hidden flex items-center justify-between gap-2 flex-wrap mb-3">
          <h1 className="text-base font-bold whitespace-nowrap">
            Expense <span className="text-indigo-600">Management</span>
          </h1>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleOpenAddExpense}
              className="px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 rounded-lg flex items-center gap-1 shadow-sm"
            >
              <FaPlus size={10} /> Record
            </button>
            <span className="text-xs text-gray-500">
              <strong>{filteredExpenses.length}</strong> records
            </span>
          </div>
        </div>

        {/* Mobile Filters Toggle */}
        <div className="sm:hidden mb-3">
          <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-gray-200">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-700"
            >
              <FiFilter className="text-blue-600 text-base" />
              <span>Filters &amp; Actions</span>
              {showMobileFilters ? (
                <FaChevronUp className="text-gray-400" />
              ) : (
                <FaChevronDown className="text-gray-400" />
              )}
            </button>
          </div>

          {showMobileFilters && (
            <div className="mt-2 p-4 bg-white rounded-xl border border-gray-200 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Search</label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text"
                    placeholder="Search purpose or remark..."
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white"
                >
                  <option value="">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="pt-3 border-t border-gray-200 space-y-2">
                <button
                  onClick={() => {
                    setTableSearch("");
                    setStatusFilter("");
                  }}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
                >
                  <FiTrash2 className="w-4 h-4" />
                  Clear Filters
                </button>
                <button
                  onClick={fetchInitialData}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-all shadow-sm"
                >
                  <FaSync className={loading ? "animate-spin" : ""} size={14} />
                  {loading ? "Loading..." : "Refresh Data"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── KPI Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Claims</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <FaFileInvoice className="text-blue-500" />
              </div>
            </div>
            <div className="emp-dash__stat-value">{stats.totalClaims}</div>
            <div className="emp-dash__stat-meta">records submitted 📋</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Distance</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FaCar className="text-emerald-500" />
              </div>
            </div>
            <div className="emp-dash__stat-value">{Math.round(stats.totalDistance)} km</div>
            <div className="emp-dash__stat-meta">claimed overall 🚗</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Reimbursable</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                <FaWallet className="text-amber-500" />
              </div>
            </div>
            <div className="emp-dash__stat-value">{formatCurrency(stats.totalAmount)}</div>
            <div className="emp-dash__stat-meta">total claim amount 💳</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">This Month</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--absent">
                <FaUserClock className="text-purple-500" />
              </div>
            </div>
            <div className="emp-dash__stat-value">{stats.monthlyClaims}</div>
            <div className="emp-dash__stat-meta">claims in current month 📅</div>
          </div>
        </div>

        {/* ── Rate Banner ── */}
        <div className="p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-100 rounded-2xl mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20 flex-shrink-0">
              <FaRoute size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-800">Reimbursement Rate</span>
                <span className="px-2 py-0.5 text-xs font-bold bg-blue-600 text-white rounded-full">
                  {formatCurrency(kmRate)} / KM
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Distance is automatically calculated from visit stops or entered manually.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleOpenAddExpense}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all flex items-center gap-1.5 shadow-sm whitespace-nowrap self-stretch sm:self-auto justify-center"
          >
            <FaPlus size={12} /> Record Expense
          </button>
        </div>

        {/* ── Card Container ── */}
        <div className="emp-dash__card mb-6">
          <div className="emp-dash__card-header flex items-center justify-between">
            <div>
              <h3 className="emp-dash__card-title flex items-center gap-2">
                <FaMoneyBillWave className="text-blue-600" />
                Expense History
              </h3>
              <p className="emp-dash__card-desc">Review and manage all your submitted travel claims.</p>
            </div>
            <div className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              {formatCurrency(stats.totalAmount)}
            </div>
          </div>

          <div className="emp-dash__card-body">
            {filteredExpenses.length === 0 ? (
              <div className="py-12 text-center">
                <div className="flex flex-col items-center gap-2">
                  <FiInbox className="text-5xl text-gray-300 mb-1" />
                  <p className="text-base font-semibold text-gray-600">No Expense Records Found</p>
                  <p className="text-xs text-gray-400 max-w-sm">
                    {tableSearch || statusFilter
                      ? "Try adjusting your search terms or filters."
                      : "Start tracking your travel expenses by recording your first claim."}
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenAddExpense}
                    className="mt-3 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all"
                  >
                    Record Expense
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="emp-dash__table-wrap hidden lg:block border border-gray-100 rounded-xl overflow-hidden">
                  <table className="emp-dash__table">
                    <thead>
                      <tr>
                        <th>Purpose &amp; Date</th>
                        <th className="text-center">Distance</th>
                        <th className="text-center">Stops</th>
                        <th className="text-center">Status</th>
                        <th className="text-right">Amount</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExpenses.map((expense, index) => {
                        const stopCount = expense.stops?.length || 0;
                        return (
                          <tr key={`${expense._id || expense.date}-${index}`} className="hover:bg-gray-50/60 transition-colors group">
                            <td>
                              <div className="flex flex-col">
                                <span className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{expense.purpose}</span>
                                <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                  <FaCalendarAlt size={10} /> {formatDate(expense.date)}
                                </span>
                              </div>
                            </td>
                            <td className="text-center whitespace-nowrap">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                                <FaCar className="text-slate-500" size={10} />
                                {Number(expense.km || 0).toFixed(1)} km
                              </span>
                            </td>
                            <td className="text-center whitespace-nowrap">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                <FaMapMarkerAlt size={10} />
                                {stopCount > 0 ? `${stopCount} stop${stopCount > 1 ? "s" : ""}` : "Single visit"}
                              </span>
                            </td>
                            <td className="text-center whitespace-nowrap">
                              <StatusBadge status={expense.status || "Pending"} />
                            </td>
                            <td className="text-right whitespace-nowrap font-bold text-slate-900 text-sm">
                              {formatCurrency(expense.totalAmount)}
                            </td>
                            <td className="text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1 shadow-2xs"
                                  onClick={() => handleViewExpense(expense)}
                                  title="View details"
                                >
                                  <FaEye size={11} /> View
                                </button>
                                <button
                                  type="button"
                                  className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1 shadow-2xs"
                                  onClick={() => handleEditExpense(expense)}
                                  title="Edit"
                                >
                                  <FaEdit size={11} /> Edit
                                </button>
                                <button
                                  type="button"
                                  className="px-2.5 py-1 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1 shadow-2xs"
                                  onClick={() => handleDeleteExpense(expense._id, expense.purpose)}
                                  disabled={isDeleting}
                                  title="Delete"
                                >
                                  <FaTrashAlt size={11} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards View */}
                <div className="lg:hidden space-y-3">
                  {filteredExpenses.map((expense, index) => {
                    const stopCount = expense.stops?.length || 0;
                    return (
                      <div key={`${expense._id || expense.date}-mobile-${index}`} className="bg-white rounded-xl border border-gray-200 shadow-2xs p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{expense.purpose}</h4>
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <FaCalendarAlt size={10} /> {formatDate(expense.date)}
                            </p>
                          </div>
                          <StatusBadge status={expense.status || "Pending"} />
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-3">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Distance</span>
                            <span className="font-semibold text-slate-800">{Number(expense.km || 0).toFixed(1)} km</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Amount</span>
                            <span className="font-bold text-blue-600">{formatCurrency(expense.totalAmount)}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Stops</span>
                            <span className="font-semibold text-slate-800">{stopCount > 0 ? stopCount : 1} stop(s)</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rate</span>
                            <span className="font-semibold text-slate-800">{formatCurrency(kmRate)}/km</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                          <button
                            type="button"
                            className="flex-1 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                            onClick={() => handleViewExpense(expense)}
                          >
                            <FaEye size={11} /> View
                          </button>
                          <button
                            type="button"
                            className="flex-1 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1"
                            onClick={() => handleEditExpense(expense)}
                          >
                            <FaEdit size={11} /> Edit
                          </button>
                          <button
                            type="button"
                            className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center"
                            onClick={() => handleDeleteExpense(expense._id, expense.purpose)}
                          >
                            <FaTrashAlt size={11} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* ===== RECORD EXPENSE MODAL - Expense Fields ===== */}
      {isModalOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={handleCloseModal}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '16px',
              maxWidth: '540px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              padding: '24px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Record Expense</h2>
              <button 
                onClick={handleCloseModal}
                style={{ background: 'none', border: 'none', fontSize: '20px', color: '#94a3b8', cursor: 'pointer' }}
              >
                <FaTimes />
              </button>
            </div>
            
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
              Track visit stops, distance, and reimbursement claim
            </p>

            <form onSubmit={handleSubmit}>
              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, marginBottom: '12px' }}>
                  <FaExclamationCircle size={14} />
                  <span>{error}</span>
                </div>
              )}

              {/* Purpose */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>Purpose of Travel <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="text"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleInputChange}
                  placeholder="e.g. Client meeting or sample collection"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                  required
                />
              </div>

              {/* Date */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>Travel Date <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                  required
                />
              </div>

              {/* Total Distance */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>Total Distance</label>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontWeight: 600 }}>
                  <span>{Number(totalKm || 0).toFixed(1)} KM</span>
                  <span style={{ fontSize: '11px', fontWeight: 500, color: '#94a3b8' }}>
                    {stopsKm > 0 ? "Auto-calculated from stops" : "Manual entry"}
                  </span>
                </div>
              </div>

              {/* Estimated Amount */}
              <div style={{ background: '#eff6ff', borderRadius: '10px', padding: '8px 12px', border: '1px solid #bfdbfe', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>Estimated Reimbursement</span>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#3b82f6' }}>{formatCurrency(calculatedCost)}</span>
                </div>
              </div>

              {/* Stops Section */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>Route Stops & Samples ({stops.length})</label>
                  <button
                    type="button"
                    onClick={addStop}
                    style={{ padding: '4px 12px', border: 'none', borderRadius: '6px', background: '#3b82f6', color: 'white', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    <FaPlus size={10} /> Add Stop
                  </button>
                </div>

                {stops.map((stop, index) => (
                  <div key={`stop-${index}`} style={{ background: '#f8fafc', borderRadius: '8px', padding: '12px', border: '1px solid #e2e8f0', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>Stop #{index + 1}</span>
                      {stops.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeStop(index)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px' }}
                        >
                          <FaTrashAlt /> Remove
                        </button>
                      )}
                    </div>

                    <div style={{ marginBottom: '6px' }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#0f172a', marginBottom: '2px' }}>Location / Sample Name <span style={{ color: '#ef4444' }}>*</span></label>
                      <input
                        type="text"
                        value={stop.locationName}
                        onChange={(e) => handleStopChange(index, "locationName", e.target.value)}
                        placeholder="e.g. KPHB Branch / City Hospital"
                        style={{ width: '100%', padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                        required
                      />
                    </div>

                    <div style={{ marginBottom: '6px' }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#0f172a', marginBottom: '2px' }}>Meeting Outcome (Optional)</label>
                      <input
                        type="text"
                        value={stop.outcome}
                        onChange={(e) => handleStopChange(index, "outcome", e.target.value)}
                        placeholder="e.g. Collected sample / Discussed terms"
                        style={{ width: '100%', padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#0f172a', marginBottom: '2px' }}>Distance (KM)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={stop.km}
                          onChange={(e) => handleStopChange(index, "km", e.target.value)}
                          placeholder="0.0"
                          style={{ width: '100%', padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#0f172a', marginBottom: '2px' }}>Order Value (₹)</label>
                        <input
                          type="number"
                          min="0"
                          value={stop.orderValue}
                          onChange={(e) => handleStopChange(index, "orderValue", e.target.value)}
                          placeholder="0"
                          style={{ width: '100%', padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#0f172a', marginBottom: '2px' }}>Upsell Value (₹)</label>
                        <input
                          type="number"
                          min="0"
                          value={stop.upsellValue}
                          onChange={(e) => handleStopChange(index, "upsellValue", e.target.value)}
                          placeholder="0"
                          style={{ width: '100%', padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addStop}
                  style={{ width: '100%', padding: '8px', border: '2px dashed #d1d5db', borderRadius: '8px', background: 'transparent', color: '#64748b', fontSize: '13px', fontWeight: 500, cursor: 'pointer', marginTop: '4px' }}
                >
                  <FaPlus /> Add Another Stop
                </button>
              </div>

              {/* Remarks */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>Additional Remark (Optional)</label>
                <textarea
                  name="remark"
                  value={formData.remark}
                  onChange={handleInputChange}
                  placeholder="Enter any additional notes, parking fees, toll info, or justifications..."
                  rows={2}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                <button type="button" onClick={handleCloseModal} style={{ padding: '8px 24px', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, background: '#f1f5f9', color: '#64748b', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} style={{ padding: '8px 24px', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, background: '#3b82f6', color: 'white', cursor: 'pointer' }}>
                  {submitting ? "Submitting..." : "Submit Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== EXPENSE DETAILS MODAL ===== */}
      {selectedExpense && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={() => setSelectedExpense(null)}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '16px',
              maxWidth: '540px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              padding: '24px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Expense Details</h2>
              <button 
                onClick={() => setSelectedExpense(null)}
                style={{ background: 'none', border: 'none', fontSize: '20px', color: '#94a3b8', cursor: 'pointer' }}
              >
                <FaTimes />
              </button>
            </div>
            
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
              Submitted on {formatDate(selectedExpense.date)}
            </p>

            {/* Summary Banner */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 500, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Distance</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{Number(selectedExpense.km || 0).toFixed(1)} km</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 500, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rate Applied</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{formatCurrency(selectedExpense.rateApplied)}/km</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 500, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Amount</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#3b82f6' }}>{formatCurrency(selectedExpense.totalAmount)}</div>
              </div>
            </div>

            {/* Purpose & Date */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}><FaInfoCircle style={{ color: '#3b82f6' }} /> Purpose & Date</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 500, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Purpose</div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a', padding: '4px 8px', background: '#f8fafc', borderRadius: '4px' }}>{selectedExpense.purpose}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 500, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a', padding: '4px 8px', background: '#f8fafc', borderRadius: '4px' }}>{formatDate(selectedExpense.date)}</div>
                </div>
              </div>
            </div>

            {/* Stops */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}><FaMapMarkerAlt style={{ color: '#3b82f6' }} /> Stops ({selectedExpense.stops?.length || 0})</div>
              {selectedExpense.stops?.length ? (
                selectedExpense.stops.map((stop, index) => (
                  <div key={`detail-stop-${index}`} style={{ background: '#f8fafc', borderRadius: '8px', padding: '8px 12px', border: '1px solid #e2e8f0', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '50%', background: '#3b82f6', color: 'white', fontSize: '10px', fontWeight: 700 }}>{index + 1}</span>
                      <span style={{ fontSize: '13px', fontWeight: 500, color: '#0f172a' }}>{stop.locationName}</span>
                      {stop.outcome && (
                        <span style={{ fontSize: '10px', color: '#10b981', background: '#ecfdf5', padding: '2px 8px', borderRadius: '12px' }}>{stop.outcome}</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: '#64748b' }}>
                      <span>📏 {Number(stop.km || 0).toFixed(1)} km</span>
                      <span>💰 {formatCurrency(stop.orderValue)}</span>
                      <span>📈 {formatCurrency(stop.upsellValue)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
                  <FaRoute style={{ fontSize: '28px', marginBottom: '6px', opacity: 0.5 }} />
                  <p style={{ margin: 0, fontSize: '13px' }}>No stops recorded for this trip</p>
                </div>
              )}
            </div>

            {/* Remarks */}
            {selectedExpense.remark && (
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}><FaCommentDots style={{ color: '#3b82f6' }} /> Remarks</div>
                <div style={{ fontSize: '13px', color: '#0f172a', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', whiteSpace: 'pre-wrap' }}>
                  {selectedExpense.remark}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', marginTop: '16px' }}>
              <button 
                onClick={() => setSelectedExpense(null)} 
                style={{ padding: '8px 24px', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, background: '#f1f5f9', color: '#64748b', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== EDIT EXPENSE MODAL ===== */}
      {isEditModalOpen && editingExpense && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={handleCloseModal}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '16px',
              maxWidth: '540px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              padding: '24px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Edit Expense</h2>
              <button 
                onClick={handleCloseModal}
                style={{ background: 'none', border: 'none', fontSize: '20px', color: '#94a3b8', cursor: 'pointer' }}
              >
                <FaTimes />
              </button>
            </div>
            
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
              Update your travel expense details
            </p>

            <form onSubmit={handleEditSubmit}>
              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, marginBottom: '12px' }}>
                  <FaExclamationCircle size={14} />
                  <span>{error}</span>
                </div>
              )}

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>Purpose of Travel <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="text"
                  name="purpose"
                  value={editFormData.purpose}
                  onChange={handleEditInputChange}
                  placeholder="e.g. Client meeting or sample collection"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>Travel Date <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="date"
                  name="date"
                  value={editFormData.date}
                  onChange={handleEditInputChange}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>Total Distance</label>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontWeight: 600 }}>
                  <span>{Number(editTotalKm || 0).toFixed(1)} KM</span>
                  <span style={{ fontSize: '11px', fontWeight: 500, color: '#94a3b8' }}>
                    {editStopsKm > 0 ? "Sum of stops" : "Manual entry"}
                  </span>
                </div>
              </div>

              <div style={{ background: '#eff6ff', borderRadius: '10px', padding: '8px 12px', border: '1px solid #bfdbfe', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>Estimated Reimbursement</span>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#3b82f6' }}>{formatCurrency(editCalculatedCost)}</span>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>Route Stops & Samples ({editStops.length})</label>
                  <button
                    type="button"
                    onClick={addEditStop}
                    style={{ padding: '4px 12px', border: 'none', borderRadius: '6px', background: '#3b82f6', color: 'white', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    <FaPlus size={10} /> Add Stop
                  </button>
                </div>

                {editStops.map((stop, index) => (
                  <div key={`edit-stop-${index}`} style={{ background: '#f8fafc', borderRadius: '8px', padding: '12px', border: '1px solid #e2e8f0', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>Stop #{index + 1}</span>
                      {editStops.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEditStop(index)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px' }}
                        >
                          <FaTrashAlt /> Remove
                        </button>
                      )}
                    </div>

                    <div style={{ marginBottom: '6px' }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#0f172a', marginBottom: '2px' }}>Location / Sample Name <span style={{ color: '#ef4444' }}>*</span></label>
                      <input
                        type="text"
                        value={stop.locationName}
                        onChange={(e) => handleEditStopChange(index, "locationName", e.target.value)}
                        placeholder="e.g. KPHB Branch / City Hospital"
                        style={{ width: '100%', padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                        required
                      />
                    </div>

                    <div style={{ marginBottom: '6px' }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#0f172a', marginBottom: '2px' }}>Meeting Outcome (Optional)</label>
                      <input
                        type="text"
                        value={stop.outcome}
                        onChange={(e) => handleEditStopChange(index, "outcome", e.target.value)}
                        placeholder="e.g. Collected sample / Discussed terms"
                        style={{ width: '100%', padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#0f172a', marginBottom: '2px' }}>Distance (KM)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={stop.km}
                          onChange={(e) => handleEditStopChange(index, "km", e.target.value)}
                          placeholder="0.0"
                          style={{ width: '100%', padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#0f172a', marginBottom: '2px' }}>Order Value (₹)</label>
                        <input
                          type="number"
                          min="0"
                          value={stop.orderValue}
                          onChange={(e) => handleEditStopChange(index, "orderValue", e.target.value)}
                          placeholder="0"
                          style={{ width: '100%', padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#0f172a', marginBottom: '2px' }}>Upsell Value (₹)</label>
                        <input
                          type="number"
                          min="0"
                          value={stop.upsellValue}
                          onChange={(e) => handleEditStopChange(index, "upsellValue", e.target.value)}
                          placeholder="0"
                          style={{ width: '100%', padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addEditStop}
                  style={{ width: '100%', padding: '8px', border: '2px dashed #d1d5db', borderRadius: '8px', background: 'transparent', color: '#64748b', fontSize: '13px', fontWeight: 500, cursor: 'pointer', marginTop: '4px' }}
                >
                  <FaPlus /> Add Another Stop
                </button>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>Additional Remark (Optional)</label>
                <textarea
                  name="remark"
                  value={editFormData.remark}
                  onChange={handleEditInputChange}
                  placeholder="Enter any additional notes, parking fees, toll info, or justifications..."
                  rows={2}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                <button type="button" onClick={handleCloseModal} style={{ padding: '8px 24px', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, background: '#f1f5f9', color: '#64748b', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={isUpdating} style={{ padding: '8px 24px', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, background: '#3b82f6', color: 'white', cursor: 'pointer' }}>
                  {isUpdating ? "Updating..." : "Update Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseManagement;