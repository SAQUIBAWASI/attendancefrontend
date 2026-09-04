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
} from "react-icons/fa";
import { API_BASE_URL } from "../config";
import "./EmployeeDashboard.css";
import "./EmployeePageShell.css";

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
    if (!query) return expenses;

    return expenses.filter((expense) => {
      const outcome = expense.outcome || expense.stops?.[0]?.outcome || "";
      return (
        expense.purpose?.toLowerCase().includes(query) ||
        outcome.toLowerCase().includes(query) ||
        expense.remark?.toLowerCase().includes(query)
      );
    });
  }, [expenses, tableSearch]);

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
    <div className="emp-dash emp-page-shell">
      {showSuccessToast && (
        <div className="emp-toast">
          <div className="emp-toast-content">
            <FaCheckCircle className="emp-toast-icon" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      <main>
        <div className="emp-dash__header">
          <div>
            <h1 className="emp-dash__greeting">
              Expense <span>Management</span>
            </h1>
            <p className="emp-dash__subtitle">
              Track your travel claims, reimbursement amount, and meeting outcomes in one place.
            </p>
          </div>
          <div className="emp-dash__date-pill">
            <FaCalendarAlt />
            <span>
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        <div className="emp-dash__stats">
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Claims</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <FaFileInvoice />
              </div>
            </div>
            <div className="emp-dash__stat-value">{stats.totalClaims}</div>
            <div className="emp-dash__stat-meta">records submitted</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Distance</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FaCar />
              </div>
            </div>
            <div className="emp-dash__stat-value">{Math.round(stats.totalDistance)}</div>
            <div className="emp-dash__stat-meta">km claimed overall</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Amount</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                <FaWallet />
              </div>
            </div>
            <div className="emp-dash__stat-value">{formatCurrency(stats.totalAmount)}</div>
            <div className="emp-dash__stat-meta">reimbursable amount</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">This Month</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--absent">
                <FaUserClock />
              </div>
            </div>
            <div className="emp-dash__stat-value">{stats.monthlyClaims}</div>
            <div className="emp-dash__stat-meta">claims in current month</div>
          </div>
        </div>

        <div className="emp-page__hero">
          <div>
            <div className="emp-page__hero-eyebrow">
              <FaRoute /> Travel reimbursement
            </div>
            <div className="emp-page__hero-title">
              Rate: {formatCurrency(kmRate)} <span style={{ fontSize: "0.8rem", fontWeight: "normal" }}>per KM</span>
            </div>
            <p className="emp-page__hero-copy">
              Enter your trip details and stops. Distance is automatically calculated from your stops or you can enter it manually.
            </p>
          </div>
          <div className="emp-page__hero-actions">
            <button type="button" className="emp-page__hero-btn" onClick={handleOpenAddExpense}>
              <FaPlus />
              Record Expense
            </button>
            <button type="button" className="emp-page__hero-btn--ghost" onClick={fetchInitialData}>
              <FaSync className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        <div className="emp-dash__card">
          <div className="emp-dash__card-header">
            <div>
              <h3 className="emp-dash__card-title">Expense History</h3>
              <p className="emp-dash__card-desc">Review and manage all your submitted travel claims.</p>
            </div>
            <div className="emp-page__pill">
              <FaMoneyBillWave />
              {formatCurrency(stats.totalAmount)}
            </div>
          </div>

          <div className="emp-dash__card-body" style={{ paddingBottom: "1rem" }}>
            <div className="emp-page__filters">
              <div className="emp-page__search-wrap">
                <FaSearch className="emp-page__search-icon" />
                <input
                  type="text"
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  className="emp-page__search"
                  placeholder="Search by purpose, outcome, or remark..."
                />
                {tableSearch && (
                  <FaTimes className="emp-page__search-clear" onClick={() => setTableSearch("")} />
                )}
              </div>

              <div className="emp-page__pill emp-page__pill--muted">
                <FaClipboardList />
                {filteredExpenses.length} records
              </div>
            </div>
          </div>

          {filteredExpenses.length === 0 ? (
            <div className="emp-page__empty">
              <div className="emp-page__empty-icon">
                <FaFileInvoice />
              </div>
              <h3>No expense records found</h3>
              <p>
                {tableSearch 
                  ? "Try adjusting your search terms." 
                  : "Start tracking your travel expenses by clicking 'Record Expense'."}
              </p>
              <button 
                className="emp-page__hero-btn" 
                onClick={handleOpenAddExpense}
                style={{ marginTop: "1rem" }}
              >
                <FaPlus /> Create Your First Expense
              </button>
            </div>
          ) : (
            <>
              <div className="emp-dash__table-wrap">
                <table className="emp-dash__table">
                  <thead>
                    <tr>
                      <th>Purpose & Date</th>
                      <th>Distance</th>
                      <th>Stops</th>
                      <th>Status</th>
                      <th>Amount</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExpenses.map((expense, index) => {
                      const stopCount = expense.stops?.length || 0;
                      const primaryOutcome = expense.outcome || expense.stops?.[0]?.outcome || "—";
                      return (
                        <tr key={`${expense._id || expense.date}-${index}`}>
                          <td>
                            <div className="emp-table__purpose">
                              <span className="emp-table__purpose-name">{expense.purpose}</span>
                              <span className="emp-table__purpose-date">{formatDate(expense.date)}</span>
                            </div>
                          </td>
                          <td>
                            <span className="emp-table__distance">
                              <FaCar className="emp-table__distance-icon" />
                              {Number(expense.km || 0).toFixed(1)} km
                            </span>
                          </td>
                          <td>
                            <span className="emp-page__badge emp-page__badge--primary">
                              <FaMapMarkerAlt />
                              {stopCount > 0 ? `${stopCount} stop${stopCount > 1 ? "s" : ""}` : "Single visit"}
                            </span>
                          </td>
                          <td>
                            <StatusBadge status={expense.status || "Pending"} />
                          </td>
                          <td>
                            <span className="emp-table__amount">{formatCurrency(expense.totalAmount)}</span>
                          </td>
                          <td>
                            <div className="emp-table__actions">
                              <button
                                type="button"
                                className="emp-table__action-btn emp-table__action-btn--view"
                                onClick={() => handleViewExpense(expense)}
                                title="View details"
                              >
                                <FaEye />
                              </button>
                              <button
                                type="button"
                                className="emp-table__action-btn emp-table__action-btn--edit"
                                onClick={() => handleEditExpense(expense)}
                                title="Edit"
                              >
                                <FaEdit />
                              </button>
                              <button
                                type="button"
                                className="emp-table__action-btn emp-table__action-btn--delete"
                                onClick={() => handleDeleteExpense(expense._id, expense.purpose)}
                                disabled={isDeleting}
                                title="Delete"
                              >
                                <FaTrashAlt />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="emp-page__mobile-list">
                {filteredExpenses.map((expense, index) => {
                  const stopCount = expense.stops?.length || 0;
                  const primaryOutcome = expense.outcome || expense.stops?.[0]?.outcome || "—";
                  return (
                    <div key={`${expense._id || expense.date}-mobile-${index}`} className="emp-page__mobile-card">
                      <div className="emp-page__mobile-top">
                        <div>
                          <div className="emp-page__mobile-title">{expense.purpose}</div>
                          <div className="emp-page__mobile-subtitle">
                            <FaCalendarAlt /> {formatDate(expense.date)}
                          </div>
                        </div>
                        <div className="emp-mobile__actions">
                          <button
                            type="button"
                            className="emp-table__action-btn emp-table__action-btn--view"
                            onClick={() => handleViewExpense(expense)}
                          >
                            <FaEye />
                          </button>
                          <button
                            type="button"
                            className="emp-table__action-btn emp-table__action-btn--edit"
                            onClick={() => handleEditExpense(expense)}
                          >
                            <FaEdit />
                          </button>
                          <button
                            type="button"
                            className="emp-table__action-btn emp-table__action-btn--delete"
                            onClick={() => handleDeleteExpense(expense._id, expense.purpose)}
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      </div>

                      <div className="emp-page__mobile-grid">
                        <div className="emp-page__mobile-field">
                          <span>Distance</span>
                          <span>{Number(expense.km || 0).toFixed(1)} km</span>
                        </div>
                        <div className="emp-page__mobile-field">
                          <span>Amount</span>
                          <span className="emp-table__amount">{formatCurrency(expense.totalAmount)}</span>
                        </div>
                        <div className="emp-page__mobile-field">
                          <span>Stops</span>
                          <span>{stopCount > 0 ? stopCount : 1}</span>
                        </div>
                        <div className="emp-page__mobile-field">
                          <span>Status</span>
                          <StatusBadge status={expense.status || "Pending"} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
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