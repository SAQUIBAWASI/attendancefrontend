import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaCalendarAlt,
  FaClipboardList,
  FaCommentDots,
  FaEye,
  FaMoneyBillWave,
  FaPlus,
  FaRoute,
  FaSearch,
  FaSync,
  FaTimes,
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
      alert("Please fill in purpose, distance, and date.");
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
                            <button
                              type="button"
                              className="emp-page__icon-btn"
                              onClick={() => setSelectedExpense(expense)}
                              title="View details"
                            >
                              <FaEye />
                            </button>
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
                        <button
                          type="button"
                          className="emp-page__icon-btn"
                          onClick={() => setSelectedExpense(expense)}
                        >
                          <FaEye />
                        </button>
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

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 emp-dash-modal">
          <div className="emp-dash__modal-panel bg-white shadow-2xl rounded-2xl" style={{ maxWidth: "960px" }}>
            <div className="emp-dash__card-header">
              <div>
                <h3 className="emp-dash__card-title">Record Expense</h3>
                <p className="emp-dash__card-desc">Add trip purpose, stops, and reimbursable distance.</p>
              </div>
              <button type="button" className="emp-page__icon-btn" onClick={() => setIsModalOpen(false)}>
                <FaTimes />
              </button>
            </div>

            <form id="expense-record-form" onSubmit={handleSubmit} className="emp-dash__modal-body" style={{ padding: "1.25rem" }}>
              <div className="emp-page__form-grid">
                <div className="emp-page__form-full">
                  <label className="emp-page__label">Purpose of Travel</label>
                  <input
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleInputChange}
                    className="emp-page__input"
                    placeholder="e.g. Client meeting or sample collection"
                    required
                  />
                </div>

                <div>
                  <label className="emp-page__label">Travel Date</label>
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
                  <label className="emp-page__label">Total KM Traveled</label>
                  <div className="emp-page__readonly">
                    {Number(totalKm || 0).toFixed(1)} km {stopsKm > 0 ? "(calculated from stops)" : ""}
                  </div>
                </div>

                <div className="emp-page__form-full">
                  <div className="emp-page__metric-row">
                    <div className="emp-page__metric">
                      <div className="emp-page__metric-label">Estimated reimbursement</div>
                      <div className="emp-page__metric-value">{formatCurrency(calculatedCost)}</div>
                    </div>
                    <div className="emp-page__metric">
                      <div className="emp-page__metric-label">Rate applied</div>
                      <div className="emp-page__metric-value">{formatCurrency(kmRate)} / km</div>
                    </div>
                  </div>
                </div>

                <div className="emp-page__form-full">
                  <div className="emp-dash__card" style={{ borderRadius: "14px" }}>
                    <div className="emp-dash__card-header">
                      <div>
                        <h4 className="emp-dash__card-title">Stops / Samples</h4>
                        <p className="emp-dash__card-desc">Add each visit so the record matches your travel route.</p>
                      </div>
                      <button type="button" className="emp-page__primary-btn" onClick={addStop}>
                        <FaPlus />
                        Add Stop
                      </button>
                    </div>
                    <div className="emp-dash__card-body">
                      <div className="emp-page__stop-list">
                        {stops.map((stop, index) => (
                          <div key={`stop-${index}`} className="emp-page__stop-card">
                            {stops.length > 1 && (
                              <button
                                type="button"
                                className="emp-page__icon-btn"
                                onClick={() => removeStop(index)}
                                style={{ position: "absolute", right: "0.75rem", top: "0.75rem" }}
                                title="Remove stop"
                              >
                                <FaTimes />
                              </button>
                            )}

                            <div className="emp-page__form-grid">
                              <div>
                                <label className="emp-page__label">
                                  <span className="emp-page__stop-number">{index + 1}</span>{" "}
                                  Location / Sample Name
                                </label>
                                <input
                                  type="text"
                                  value={stop.locationName}
                                  onChange={(e) => handleStopChange(index, "locationName", e.target.value)}
                                  className="emp-page__input"
                                  placeholder="e.g. KPHB Branch"
                                  required
                                />
                              </div>

                              <div>
                                <label className="emp-page__label">Meeting Outcome</label>
                                <input
                                  type="text"
                                  value={stop.outcome}
                                  onChange={(e) => handleStopChange(index, "outcome", e.target.value)}
                                  className="emp-page__input"
                                  placeholder="Discussed requirements"
                                />
                              </div>

                              <div className="emp-page__subgrid emp-page__form-full">
                                <div>
                                  <label className="emp-page__label">Distance (KM)</label>
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={stop.km}
                                    onChange={(e) => handleStopChange(index, "km", e.target.value)}
                                    className="emp-page__input"
                                    placeholder="0"
                                  />
                                </div>
                                <div>
                                  <label className="emp-page__label">Order Value (₹)</label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={stop.orderValue}
                                    onChange={(e) => handleStopChange(index, "orderValue", e.target.value)}
                                    className="emp-page__input"
                                    placeholder="0"
                                  />
                                </div>
                                <div>
                                  <label className="emp-page__label">Upsell Value (₹)</label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={stop.upsellValue}
                                    onChange={(e) => handleStopChange(index, "upsellValue", e.target.value)}
                                    className="emp-page__input"
                                    placeholder="0"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="emp-page__form-full">
                  <label className="emp-page__label">Remark</label>
                  <textarea
                    name="remark"
                    value={formData.remark}
                    onChange={handleInputChange}
                    className="emp-page__textarea"
                    placeholder="Additional notes for this claim"
                  />
                </div>
              </div>
            </form>

            <div className="emp-dash__card-body" style={{ paddingTop: 0, display: "flex", gap: "0.75rem" }}>
              <button type="button" className="emp-page__secondary-btn" onClick={() => setIsModalOpen(false)} style={{ flex: 1 }}>
                Cancel
              </button>
              <button
                type="submit"
                className="emp-page__primary-btn"
                form="expense-record-form"
                disabled={submitting}
                style={{ flex: 1 }}
              >
                {submitting ? "Submitting..." : "Submit Record"}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedExpense && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 emp-dash-modal">
          <div className="emp-dash__modal-panel bg-white shadow-2xl rounded-2xl" style={{ maxWidth: "920px" }}>
            <div className="emp-dash__card-header">
              <div>
                <h3 className="emp-dash__card-title">Expense Details</h3>
                <p className="emp-dash__card-desc">Review the recorded trip summary and stop-wise values.</p>
              </div>
              <button type="button" className="emp-page__icon-btn" onClick={() => setSelectedExpense(null)}>
                <FaTimes />
              </button>
            </div>

            <div className="emp-dash__modal-body" style={{ padding: "1.25rem" }}>
              <div className="emp-page__form-grid">
                <div className="emp-page__form-full">
                  <label className="emp-page__label">Purpose of Travel</label>
                  <div className="emp-page__readonly">{selectedExpense.purpose}</div>
                </div>

                <div>
                  <label className="emp-page__label">Travel Date</label>
                  <div className="emp-page__readonly">{formatDate(selectedExpense.date)}</div>
                </div>
                <div>
                  <label className="emp-page__label">Distance</label>
                  <div className="emp-page__readonly">{Number(selectedExpense.km || 0).toFixed(1)} km</div>
                </div>

                <div className="emp-page__form-full">
                  <div className="emp-page__metric-row">
                    <div className="emp-page__metric">
                      <div className="emp-page__metric-label">Total amount</div>
                      <div className="emp-page__metric-value">{formatCurrency(selectedExpense.totalAmount)}</div>
                    </div>
                    <div className="emp-page__metric">
                      <div className="emp-page__metric-label">Rate applied</div>
                      <div className="emp-page__metric-value">{formatCurrency(selectedExpense.rateApplied)} / km</div>
                    </div>
                  </div>
                </div>

                <div className="emp-page__form-full">
                  <div className="emp-dash__card" style={{ borderRadius: "14px" }}>
                    <div className="emp-dash__card-header">
                      <div>
                        <h4 className="emp-dash__card-title">Stops / Samples Visited</h4>
                        <p className="emp-dash__card-desc">Detailed stop-wise route and commercial value.</p>
                      </div>
                    </div>
                    <div className="emp-dash__card-body">
                      {selectedExpense.stops?.length ? (
                        <div className="emp-page__stop-list">
                          {selectedExpense.stops.map((stop, index) => (
                            <div key={`detail-stop-${index}`} className="emp-page__stop-card">
                              <div className="emp-page__mobile-top" style={{ marginBottom: "1rem" }}>
                                <div>
                                  <div className="emp-page__mobile-title">
                                    <span className="emp-page__stop-number">{index + 1}</span> {stop.locationName || "Stop"}
                                  </div>
                                  <div className="emp-page__mobile-subtitle">{stop.outcome || "No outcome added"}</div>
                                </div>
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
                          <h3>No stop-wise details</h3>
                          <p>This record was created without detailed stop entries.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="emp-page__form-full">
                  <label className="emp-page__label">Remark</label>
                  <div className="emp-page__readonly">{selectedExpense.remark || "—"}</div>
                </div>
              </div>
            </div>

            <div className="emp-dash__card-body" style={{ paddingTop: 0 }}>
              <button type="button" className="emp-page__secondary-btn" onClick={() => setSelectedExpense(null)} style={{ width: "100%" }}>
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseManagement;
