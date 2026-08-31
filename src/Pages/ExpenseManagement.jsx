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
  FaRupeeSign,
  FaSearch,
  FaSync,
  FaTimes,
  FaTrashAlt,
  FaEdit,
} from "react-icons/fa";
import { API_BASE_URL } from "../config";
import "./EmployeeDashboard.css";
import "./EmployeePageShell.css";

const QUICK_PURPOSES = [
  "Client Visit",
  "Sample Collection",
  "Site Inspection",
  "Sales Meeting",
  "Delivery & Pickup",
  "Branch Travel",
];

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

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : "—");

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
  
  // ✅ Edit states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editFormData, setEditFormData] = useState(INITIAL_FORM);
  const [editStops, setEditStops] = useState([{ ...INITIAL_STOP }]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // ============= EDIT FUNCTIONS =============
  
  // Open Edit Modal
  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setEditFormData({
      purpose: expense.purpose || "",
      date: expense.date ? new Date(expense.date).toISOString().split("T")[0] : "",
      km: expense.km || "",
      remark: expense.remark || "",
    });
    setEditStops(expense.stops && expense.stops.length > 0 ? expense.stops.map(s => ({ ...s })) : [{ ...INITIAL_STOP }]);
    setIsEditModalOpen(true);
  };

  // Handle Edit Input Change
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Edit Stop Change
  const handleEditStopChange = (index, field, value) => {
    setEditStops((prev) =>
      prev.map((stop, stopIndex) =>
        stopIndex === index ? { ...stop, [field]: value } : stop
      )
    );
  };

  // Add Edit Stop
  const addEditStop = () => {
    setEditStops((prev) => [...prev, { ...INITIAL_STOP }]);
  };

  // Remove Edit Stop
  const removeEditStop = (index) => {
    if (editStops.length === 1) return;
    setEditStops((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculate Edit Values
  const editParsedKm = editFormData.km ? parseFloat(editFormData.km) : 0;
  const editStopsKm = editStops.reduce((sum, stop) => sum + (parseFloat(stop.km) || 0), 0);
  const editTotalKm = editStopsKm > 0 ? editStopsKm : editParsedKm;
  const editCalculatedCost = (editTotalKm * kmRate).toFixed(2);

  // Submit Edit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
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

      console.log("📤 Updating expense:", updateData);

      const res = await axios.put(
        `${API_BASE_URL}/expense/edit/${editingExpense._id}`,
        updateData
      );

      console.log("📥 Update response:", res.data);

      if (res.data.success) {
        alert("✅ Expense updated successfully!");
        setIsEditModalOpen(false);
        setEditingExpense(null);
        
        // Refresh data
        await fetchInitialData();
        
        // Close detail modal if open
        if (selectedExpense) {
          setSelectedExpense(null);
        }
      } else {
        alert("❌ Failed to update expense!");
      }
    } catch (error) {
      console.error("Error updating expense:", error);
      alert("❌ Error: " + (error.response?.data?.message || error.message));
    } finally {
      setIsUpdating(false);
    }
  };

  // ============= DELETE FUNCTIONS =============

  // Delete Expense
  const handleDeleteExpense = async (expenseId, purpose) => {
    if (window.confirm(`Are you sure you want to delete this expense record for "${purpose || 'Unknown'}"?`)) {
      setIsDeleting(true);
      try {
        const res = await axios.delete(`${API_BASE_URL}/expense/delete/${expenseId}`);
        if (res.data.success) {
          alert("✅ Expense deleted successfully!");
          await fetchInitialData();
          if (selectedExpense) {
            setSelectedExpense(null);
          }
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

    if (!employeeId) {
      alert("Employee details are missing. Please login again.");
      return;
    }

    if (!formData.purpose || totalKm <= 0 || !formData.date) {
      alert("Please fill in purpose, distance (KM), and date.");
      return;
    }

    for (let i = 0; i < stops.length; i += 1) {
      if (!stops[i].locationName.trim()) {
        alert(`Please provide a Location/Sample Name for Stop ${i + 1}.`);
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
        setFormData(INITIAL_FORM);
        setStops([{ ...INITIAL_STOP }]);
        setIsModalOpen(false);
        alert("Expense recorded successfully!");
      }
    } catch (error) {
      console.error("Error submitting expense:", error);
      alert("Failed to record expense. Please try again.");
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
              <span className="emp-dash__stat-label">Claims</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <FaClipboardList />
              </div>
            </div>
            <div className="emp-dash__stat-value">{stats.totalClaims}</div>
            <div className="emp-dash__stat-meta">total records submitted</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Distance</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FaRoute />
              </div>
            </div>
            <div className="emp-dash__stat-value">{Math.round(stats.totalDistance)}</div>
            <div className="emp-dash__stat-meta">km claimed overall</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Reimbursable</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                <FaMoneyBillWave />
              </div>
            </div>
            <div className="emp-dash__stat-value">{Math.round(stats.totalAmount)}</div>
            <div className="emp-dash__stat-meta">rupees across all claims</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">This Month</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--absent">
                <FaCalendarAlt />
              </div>
            </div>
            <div className="emp-dash__stat-value">{stats.monthlyClaims}</div>
            <div className="emp-dash__stat-meta">claims in current month</div>
          </div>
        </div>

        <div className="emp-page__hero">
          <div>
            <div className="emp-page__hero-eyebrow">Travel reimbursement</div>
            <div className="emp-page__hero-title">Current travel rate: {formatCurrency(kmRate)} per KM</div>
            <p className="emp-page__hero-copy">
              Stops-based distance is used automatically when you enter visit-wise KM. Keep each stop clear so approvals and reporting stay clean.
            </p>
          </div>
          <div className="emp-page__hero-actions">
            <button type="button" className="emp-page__hero-btn" onClick={() => setIsModalOpen(true)}>
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
              <h3 className="emp-dash__card-title">Expense Records</h3>
              <p className="emp-dash__card-desc">Review submitted travel claims and open any record for full details.</p>
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
                Found {filteredExpenses.length}
              </div>
            </div>
          </div>

          {filteredExpenses.length === 0 ? (
            <div className="emp-page__empty">
              <div className="emp-page__empty-icon">
                <FaClipboardList />
              </div>
              <h3>No expense records found</h3>
              <p>{tableSearch ? "Try a different search term." : "Create your first expense record to see it here."}</p>
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
                      <th>Outcome</th>
                      <th>Amount</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExpenses.map((expense, index) => {
                      const stopCount = expense.stops?.length || 0;
                      const primaryOutcome = expense.outcome || expense.stops?.[0]?.outcome || "—";
                      return (
                        <tr key={`${expense._id || expense.date}-${index}`}>
                          <td>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                              <span style={{ fontWeight: 600 }}>{expense.purpose}</span>
                              <span style={{ color: "#98a2b3", fontSize: "0.75rem" }}>{formatDate(expense.date)}</span>
                            </div>
                          </td>
                          <td>{Number(expense.km || 0).toFixed(1)} km</td>
                          <td>
                            <span className="emp-page__badge emp-page__badge--primary">
                              <FaRoute />
                              {stopCount > 0 ? `${stopCount} stop${stopCount > 1 ? "s" : ""}` : "Single visit"}
                            </span>
                          </td>
                          <td style={{ maxWidth: 220 }}>
                            <span title={primaryOutcome}>{primaryOutcome}</span>
                          </td>
                          <td style={{ fontWeight: 700 }}>{formatCurrency(expense.totalAmount)}</td>
                          <td style={{ textAlign: "right" }}>
                            <div style={{ display: "flex", gap: "4px", justifyContent: "flex-end" }}>
                              <button
                                type="button"
                                className="emp-page__icon-btn"
                                onClick={() => setSelectedExpense(expense)}
                                title="View details"
                              >
                                <FaEye />
                              </button>
                              <button
                                type="button"
                                className="emp-page__icon-btn"
                                onClick={() => handleEditExpense(expense)}
                                title="Edit"
                                style={{ color: "#10b981" }}
                              >
                                <FaEdit />
                              </button>
                              <button
                                type="button"
                                className="emp-page__icon-btn"
                                onClick={() => handleDeleteExpense(expense._id, expense.purpose)}
                                disabled={isDeleting}
                                title="Delete"
                                style={{ color: "#ef4444" }}
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
                          <div className="emp-page__mobile-subtitle">{formatDate(expense.date)}</div>
                        </div>
                        <div style={{ display: "flex", gap: "4px" }}>
                          <button
                            type="button"
                            className="emp-page__icon-btn"
                            onClick={() => setSelectedExpense(expense)}
                          >
                            <FaEye />
                          </button>
                          <button
                            type="button"
                            className="emp-page__icon-btn"
                            onClick={() => handleEditExpense(expense)}
                            style={{ color: "#10b981" }}
                          >
                            <FaEdit />
                          </button>
                          <button
                            type="button"
                            className="emp-page__icon-btn"
                            onClick={() => handleDeleteExpense(expense._id, expense.purpose)}
                            style={{ color: "#ef4444" }}
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
                          <span>{formatCurrency(expense.totalAmount)}</span>
                        </div>
                        <div className="emp-page__mobile-field">
                          <span>Stops</span>
                          <span>{stopCount > 0 ? stopCount : 1}</span>
                        </div>
                        <div className="emp-page__mobile-field">
                          <span>Outcome</span>
                          <span>{primaryOutcome}</span>
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

      {/* ===== RECORD EXPENSE MODAL (Same as before) ===== */}
      {isModalOpen && (
        <div
          className="emp-expense-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div className="emp-expense-modal-card">
            {/* Header */}
            <div className="emp-expense-modal-header">
              <div className="emp-expense-modal-header-left">
                <div className="emp-expense-modal-icon">
                  <FaMoneyBillWave />
                </div>
                <div>
                  <h3 className="emp-expense-modal-title">Record Expense</h3>
                  <p className="emp-expense-modal-subtitle">Track visit stops, distance, and reimbursement claim</p>
                </div>
              </div>
              <button
                type="button"
                className="emp-page__icon-btn"
                onClick={() => setIsModalOpen(false)}
                title="Close"
              >
                <FaTimes />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form id="expense-record-form" onSubmit={handleSubmit} className="emp-expense-modal-body">
              {/* Trip Overview Section */}
              <div className="emp-expense-section">
                <div className="emp-expense-section-title">
                  <FaRoute /> 1. Trip & Purpose
                </div>

                <div className="emp-page__form-grid">
                  <div className="emp-page__form-full">
                    <label className="emp-page__label">
                      Purpose of Travel <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <input
                      name="purpose"
                      value={formData.purpose}
                      onChange={handleInputChange}
                      className="emp-page__input"
                      placeholder="e.g. Client meeting or sample collection"
                      required
                    />
                    {/* Quick suggestion chips for fast mobile entry */}
                    <div className="emp-expense-chips">
                      {QUICK_PURPOSES.map((item) => (
                        <button
                          key={item}
                          type="button"
                          className={`emp-expense-chip ${formData.purpose === item ? "emp-expense-chip--active" : ""}`}
                          onClick={() => setFormData((prev) => ({ ...prev, purpose: item }))}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="emp-page__label">
                      Travel Date <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="emp-page__input"
                      required
                    />
                  </div>

                  <div>
                    <label className="emp-page__label">Total Distance</label>
                    <div className="emp-page__readonly" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span>{Number(totalKm || 0).toFixed(1)} KM</span>
                      <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 500 }}>
                        {stopsKm > 0 ? "Sum of stops" : "Manual entry"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Calculation Banner */}
              <div className="emp-expense-summary-banner">
                <div className="emp-expense-summary-item">
                  <span className="emp-expense-summary-label">Total Distance</span>
                  <span className="emp-expense-summary-val">{Number(totalKm || 0).toFixed(1)} km</span>
                </div>
                <div className="emp-expense-summary-item">
                  <span className="emp-expense-summary-label">Travel Rate</span>
                  <span className="emp-expense-summary-val">{formatCurrency(kmRate)} / km</span>
                </div>
                <div className="emp-expense-summary-item">
                  <span className="emp-expense-summary-label">Est. Reimbursement</span>
                  <span className="emp-expense-summary-val emp-expense-summary-val--highlight">
                    {formatCurrency(calculatedCost)}
                  </span>
                </div>
              </div>

              {/* Stops & Samples Section */}
              <div className="emp-expense-section">
                <div className="emp-expense-section-header">
                  <div className="emp-expense-section-title">
                    <FaMapMarkerAlt /> 2. Route Stops & Samples ({stops.length})
                  </div>
                  <button
                    type="button"
                    className="emp-page__primary-btn"
                    onClick={addStop}
                    style={{ padding: "0.45rem 0.85rem", fontSize: "0.75rem", width: "auto" }}
                  >
                    <FaPlus /> Add Stop
                  </button>
                </div>

                <div className="emp-page__stop-list">
                  {stops.map((stop, index) => (
                    <div key={`stop-${index}`} className="emp-expense-stop-card">
                      <div className="emp-expense-stop-header">
                        <span className="emp-expense-stop-badge">
                          <FaMapMarkerAlt style={{ fontSize: "0.75rem" }} /> Stop #{index + 1}
                        </span>

                        {stops.length > 1 && (
                          <button
                            type="button"
                            className="emp-expense-stop-remove-btn"
                            onClick={() => removeStop(index)}
                            title="Remove this stop"
                          >
                            <FaTrashAlt /> Remove
                          </button>
                        )}
                      </div>

                      <div className="emp-page__form-grid">
                        <div>
                          <label className="emp-page__label">
                            Location / Sample Name <span style={{ color: "#ef4444" }}>*</span>
                          </label>
                          <input
                            type="text"
                            value={stop.locationName}
                            onChange={(e) => handleStopChange(index, "locationName", e.target.value)}
                            className="emp-page__input"
                            placeholder="e.g. KPHB Branch / City Hospital"
                            required
                          />
                        </div>

                        <div>
                          <label className="emp-page__label">Meeting Outcome (Optional)</label>
                          <input
                            type="text"
                            value={stop.outcome}
                            onChange={(e) => handleStopChange(index, "outcome", e.target.value)}
                            className="emp-page__input"
                            placeholder="e.g. Collected sample / Discussed terms"
                          />
                        </div>

                        <div className="emp-page__subgrid emp-page__form-full">
                          <div>
                            <label className="emp-page__label">Distance (KM)</label>
                            <div className="emp-expense-input-with-affix">
                              <input
                                type="number"
                                min="0"
                                step="0.1"
                                inputMode="decimal"
                                value={stop.km}
                                onChange={(e) => handleStopChange(index, "km", e.target.value)}
                                className="emp-page__input emp-expense-input--has-suffix"
                                placeholder="0.0"
                              />
                              <span className="emp-expense-input-suffix">km</span>
                            </div>
                          </div>

                          <div>
                            <label className="emp-page__label">Order Value (₹)</label>
                            <div className="emp-expense-input-with-affix">
                              <span className="emp-expense-input-prefix">₹</span>
                              <input
                                type="number"
                                min="0"
                                inputMode="numeric"
                                value={stop.orderValue}
                                onChange={(e) => handleStopChange(index, "orderValue", e.target.value)}
                                className="emp-page__input emp-expense-input--has-prefix"
                                placeholder="0"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="emp-page__label">Upsell Value (₹)</label>
                            <div className="emp-expense-input-with-affix">
                              <span className="emp-expense-input-prefix">₹</span>
                              <input
                                type="number"
                                min="0"
                                inputMode="numeric"
                                value={stop.upsellValue}
                                onChange={(e) => handleStopChange(index, "upsellValue", e.target.value)}
                                className="emp-page__input emp-expense-input--has-prefix"
                                placeholder="0"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="emp-expense-add-stop-btn"
                  onClick={addStop}
                >
                  <FaPlus /> Add Another Stop
                </button>
              </div>

              {/* Remarks Section */}
              <div className="emp-expense-section">
                <div className="emp-expense-section-title">
                  <FaCommentDots /> 3. Additional Remark (Optional)
                </div>
                <textarea
                  name="remark"
                  value={formData.remark}
                  onChange={handleInputChange}
                  className="emp-page__textarea"
                  placeholder="Enter any additional notes, parking fees, toll info, or justifications..."
                  rows={2}
                />
              </div>
            </form>

            {/* Sticky Modal Footer */}
            <div className="emp-expense-modal-footer">
              <div className="emp-expense-footer-summary">
                <span className="emp-expense-footer-summary-label">Claim Summary</span>
                <span className="emp-expense-footer-summary-val">
                  {Number(totalKm || 0).toFixed(1)} km <span style={{ color: "#94a3b8" }}>•</span> {formatCurrency(calculatedCost)}
                </span>
              </div>

              <div className="emp-expense-footer-actions">
                <button
                  type="button"
                  className="emp-page__secondary-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="expense-record-form"
                  className="emp-page__primary-btn"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <FaSync className="animate-spin" /> Submitting...
                    </>
                  ) : (
                    "Submit Record"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== EXPENSE DETAILS MODAL ===== */}
      {selectedExpense && (
        <div
          className="emp-expense-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedExpense(null);
          }}
        >
          <div className="emp-expense-modal-card">
            {/* Header */}
            <div className="emp-expense-modal-header">
              <div className="emp-expense-modal-header-left">
                <div className="emp-expense-modal-icon">
                  <FaClipboardList />
                </div>
                <div>
                  <h3 className="emp-expense-modal-title">Expense Details</h3>
                  <p className="emp-expense-modal-subtitle">Submitted on {formatDate(selectedExpense.date)}</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  className="emp-page__icon-btn"
                  onClick={() => {
                    setSelectedExpense(null);
                    handleEditExpense(selectedExpense);
                  }}
                  style={{ color: "#10b981" }}
                  title="Edit"
                >
                  <FaEdit />
                </button>
                <button
                  type="button"
                  className="emp-page__icon-btn"
                  onClick={() => {
                    const expense = selectedExpense;
                    setSelectedExpense(null);
                    handleDeleteExpense(expense._id, expense.purpose);
                  }}
                  style={{ color: "#ef4444" }}
                  title="Delete"
                >
                  <FaTrashAlt />
                </button>
                <button
                  type="button"
                  className="emp-page__icon-btn"
                  onClick={() => setSelectedExpense(null)}
                  title="Close"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="emp-expense-modal-body">
              {/* Summary Banner */}
              <div className="emp-expense-summary-banner">
                <div className="emp-expense-summary-item">
                  <span className="emp-expense-summary-label">Distance</span>
                  <span className="emp-expense-summary-val">{Number(selectedExpense.km || 0).toFixed(1)} km</span>
                </div>
                <div className="emp-expense-summary-item">
                  <span className="emp-expense-summary-label">Rate Applied</span>
                  <span className="emp-expense-summary-val">{formatCurrency(selectedExpense.rateApplied)} / km</span>
                </div>
                <div className="emp-expense-summary-item">
                  <span className="emp-expense-summary-label">Total Reimbursable</span>
                  <span className="emp-expense-summary-val emp-expense-summary-val--highlight">
                    {formatCurrency(selectedExpense.totalAmount)}
                  </span>
                </div>
              </div>

              <div className="emp-expense-section">
                <div className="emp-expense-section-title">
                  <FaInfoCircle /> Purpose & Date
                </div>
                <div className="emp-page__form-grid">
                  <div>
                    <label className="emp-page__label">Purpose of Travel</label>
                    <div className="emp-page__readonly">{selectedExpense.purpose}</div>
                  </div>
                  <div>
                    <label className="emp-page__label">Travel Date</label>
                    <div className="emp-page__readonly">{formatDate(selectedExpense.date)}</div>
                  </div>
                </div>
              </div>

              {/* Stops Visited */}
              <div className="emp-expense-section">
                <div className="emp-expense-section-title">
                  <FaMapMarkerAlt /> Stops & Samples Visited ({selectedExpense.stops?.length || 0})
                </div>

                {selectedExpense.stops?.length ? (
                  <div className="emp-page__stop-list">
                    {selectedExpense.stops.map((stop, index) => (
                      <div key={`detail-stop-${index}`} className="emp-expense-stop-card">
                        <div className="emp-expense-stop-header">
                          <span className="emp-expense-stop-badge">
                            <FaMapMarkerAlt style={{ fontSize: "0.75rem" }} /> Stop #{index + 1}: {stop.locationName || "Location"}
                          </span>
                          {stop.outcome && (
                            <span className="emp-page__badge emp-page__badge--primary">
                              {stop.outcome}
                            </span>
                          )}
                        </div>

                        <div className="emp-page__subgrid">
                          <div className="emp-page__metric">
                            <div className="emp-page__metric-label">Distance</div>
                            <div className="emp-page__metric-value">{Number(stop.km || 0).toFixed(1)} km</div>
                          </div>
                          <div className="emp-page__metric">
                            <div className="emp-page__metric-label">Order Value</div>
                            <div className="emp-page__metric-value">{formatCurrency(stop.orderValue)}</div>
                          </div>
                          <div className="emp-page__metric">
                            <div className="emp-page__metric-label">Upsell Value</div>
                            <div className="emp-page__metric-value">{formatCurrency(stop.upsellValue)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="emp-page__empty" style={{ padding: "1.5rem 1rem" }}>
                    <div className="emp-page__empty-icon">
                      <FaRoute />
                    </div>
                    <h3>Single visit record</h3>
                    <p>No itemized stop list was recorded for this trip.</p>
                  </div>
                )}
              </div>

              {/* Remark */}
              {selectedExpense.remark && (
                <div className="emp-expense-section">
                  <div className="emp-expense-section-title">
                    <FaCommentDots /> Remark / Notes
                  </div>
                  <div className="emp-page__readonly" style={{ minHeight: "3.5rem", whiteSpace: "pre-wrap" }}>
                    {selectedExpense.remark}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="emp-expense-modal-footer" style={{ justifyContent: "flex-end" }}>
              <button
                type="button"
                className="emp-page__secondary-btn"
                onClick={() => setSelectedExpense(null)}
                style={{ width: "100%", maxWidth: "200px" }}
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== EDIT EXPENSE MODAL ===== */}
      {isEditModalOpen && editingExpense && (
        <div
          className="emp-expense-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsEditModalOpen(false);
              setEditingExpense(null);
            }
          }}
        >
          <div className="emp-expense-modal-card">
            {/* Header */}
            <div className="emp-expense-modal-header">
              <div className="emp-expense-modal-header-left">
                <div className="emp-expense-modal-icon">
                  <FaEdit />
                </div>
                <div>
                  <h3 className="emp-expense-modal-title">Edit Expense</h3>
                  <p className="emp-expense-modal-subtitle">Update your travel expense details</p>
                </div>
              </div>
              <button
                type="button"
                className="emp-page__icon-btn"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingExpense(null);
                }}
                title="Close"
              >
                <FaTimes />
              </button>
            </div>

            {/* Form Body */}
            <form id="expense-edit-form" onSubmit={handleEditSubmit} className="emp-expense-modal-body">
              {/* Trip Overview Section */}
              <div className="emp-expense-section">
                <div className="emp-expense-section-title">
                  <FaRoute /> 1. Trip & Purpose
                </div>

                <div className="emp-page__form-grid">
                  <div className="emp-page__form-full">
                    <label className="emp-page__label">
                      Purpose of Travel <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <input
                      name="purpose"
                      value={editFormData.purpose}
                      onChange={handleEditInputChange}
                      className="emp-page__input"
                      placeholder="e.g. Client meeting or sample collection"
                      required
                    />
                    <div className="emp-expense-chips">
                      {QUICK_PURPOSES.map((item) => (
                        <button
                          key={item}
                          type="button"
                          className={`emp-expense-chip ${editFormData.purpose === item ? "emp-expense-chip--active" : ""}`}
                          onClick={() => setEditFormData((prev) => ({ ...prev, purpose: item }))}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="emp-page__label">
                      Travel Date <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={editFormData.date}
                      onChange={handleEditInputChange}
                      className="emp-page__input"
                      required
                    />
                  </div>

                  <div>
                    <label className="emp-page__label">Total Distance</label>
                    <div className="emp-page__readonly" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span>{Number(editTotalKm || 0).toFixed(1)} KM</span>
                      <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 500 }}>
                        {editStopsKm > 0 ? "Sum of stops" : "Manual entry"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Calculation Banner */}
              <div className="emp-expense-summary-banner">
                <div className="emp-expense-summary-item">
                  <span className="emp-expense-summary-label">Total Distance</span>
                  <span className="emp-expense-summary-val">{Number(editTotalKm || 0).toFixed(1)} km</span>
                </div>
                <div className="emp-expense-summary-item">
                  <span className="emp-expense-summary-label">Travel Rate</span>
                  <span className="emp-expense-summary-val">{formatCurrency(kmRate)} / km</span>
                </div>
                <div className="emp-expense-summary-item">
                  <span className="emp-expense-summary-label">Est. Reimbursement</span>
                  <span className="emp-expense-summary-val emp-expense-summary-val--highlight">
                    {formatCurrency(editCalculatedCost)}
                  </span>
                </div>
              </div>

              {/* Stops & Samples Section */}
              <div className="emp-expense-section">
                <div className="emp-expense-section-header">
                  <div className="emp-expense-section-title">
                    <FaMapMarkerAlt /> 2. Route Stops & Samples ({editStops.length})
                  </div>
                  <button
                    type="button"
                    className="emp-page__primary-btn"
                    onClick={addEditStop}
                    style={{ padding: "0.45rem 0.85rem", fontSize: "0.75rem", width: "auto" }}
                  >
                    <FaPlus /> Add Stop
                  </button>
                </div>

                <div className="emp-page__stop-list">
                  {editStops.map((stop, index) => (
                    <div key={`edit-stop-${index}`} className="emp-expense-stop-card">
                      <div className="emp-expense-stop-header">
                        <span className="emp-expense-stop-badge">
                          <FaMapMarkerAlt style={{ fontSize: "0.75rem" }} /> Stop #{index + 1}
                        </span>

                        {editStops.length > 1 && (
                          <button
                            type="button"
                            className="emp-expense-stop-remove-btn"
                            onClick={() => removeEditStop(index)}
                            title="Remove this stop"
                          >
                            <FaTrashAlt /> Remove
                          </button>
                        )}
                      </div>

                      <div className="emp-page__form-grid">
                        <div>
                          <label className="emp-page__label">
                            Location / Sample Name <span style={{ color: "#ef4444" }}>*</span>
                          </label>
                          <input
                            type="text"
                            value={stop.locationName}
                            onChange={(e) => handleEditStopChange(index, "locationName", e.target.value)}
                            className="emp-page__input"
                            placeholder="e.g. KPHB Branch / City Hospital"
                            required
                          />
                        </div>

                        <div>
                          <label className="emp-page__label">Meeting Outcome (Optional)</label>
                          <input
                            type="text"
                            value={stop.outcome}
                            onChange={(e) => handleEditStopChange(index, "outcome", e.target.value)}
                            className="emp-page__input"
                            placeholder="e.g. Collected sample / Discussed terms"
                          />
                        </div>

                        <div className="emp-page__subgrid emp-page__form-full">
                          <div>
                            <label className="emp-page__label">Distance (KM)</label>
                            <div className="emp-expense-input-with-affix">
                              <input
                                type="number"
                                min="0"
                                step="0.1"
                                inputMode="decimal"
                                value={stop.km}
                                onChange={(e) => handleEditStopChange(index, "km", e.target.value)}
                                className="emp-page__input emp-expense-input--has-suffix"
                                placeholder="0.0"
                              />
                              <span className="emp-expense-input-suffix">km</span>
                            </div>
                          </div>

                          <div>
                            <label className="emp-page__label">Order Value (₹)</label>
                            <div className="emp-expense-input-with-affix">
                              <span className="emp-expense-input-prefix">₹</span>
                              <input
                                type="number"
                                min="0"
                                inputMode="numeric"
                                value={stop.orderValue}
                                onChange={(e) => handleEditStopChange(index, "orderValue", e.target.value)}
                                className="emp-page__input emp-expense-input--has-prefix"
                                placeholder="0"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="emp-page__label">Upsell Value (₹)</label>
                            <div className="emp-expense-input-with-affix">
                              <span className="emp-expense-input-prefix">₹</span>
                              <input
                                type="number"
                                min="0"
                                inputMode="numeric"
                                value={stop.upsellValue}
                                onChange={(e) => handleEditStopChange(index, "upsellValue", e.target.value)}
                                className="emp-page__input emp-expense-input--has-prefix"
                                placeholder="0"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="emp-expense-add-stop-btn"
                  onClick={addEditStop}
                >
                  <FaPlus /> Add Another Stop
                </button>
              </div>

              {/* Remarks Section */}
              <div className="emp-expense-section">
                <div className="emp-expense-section-title">
                  <FaCommentDots /> 3. Additional Remark (Optional)
                </div>
                <textarea
                  name="remark"
                  value={editFormData.remark}
                  onChange={handleEditInputChange}
                  className="emp-page__textarea"
                  placeholder="Enter any additional notes, parking fees, toll info, or justifications..."
                  rows={2}
                />
              </div>
            </form>

            {/* Footer */}
            <div className="emp-expense-modal-footer">
              <div className="emp-expense-footer-summary">
                <span className="emp-expense-footer-summary-label">Updated Summary</span>
                <span className="emp-expense-footer-summary-val">
                  {Number(editTotalKm || 0).toFixed(1)} km <span style={{ color: "#94a3b8" }}>•</span> {formatCurrency(editCalculatedCost)}
                </span>
              </div>

              <div className="emp-expense-footer-actions">
                <button
                  type="button"
                  className="emp-page__secondary-btn"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingExpense(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="expense-edit-form"
                  className="emp-page__primary-btn"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <FaSync className="animate-spin" /> Updating...
                    </>
                  ) : (
                    "Update Expense"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseManagement;