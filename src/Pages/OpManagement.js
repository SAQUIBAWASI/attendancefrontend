import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import {
  Calendar,
  Clock,
  User,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Trash2,
  RefreshCw,
  Sparkles,
  Eye,
  Check,
  Phone,
  MapPin,
  FileText,
  Plus,
  Edit2,
  IndianRupee,
  CreditCard,
  Banknote,
  Printer,
  Download,
  Users,
  ChevronDown,
  X,
  History
} from "lucide-react";
import "./EmployeeDashboard.css";
import "./EmployeeLeaves.css";

const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" }
];
const FEE_TYPE_OPTIONS = [
  { value: "consultation", label: "Consultation Fee" },
  { value: "lab", label: "Lab Fee" }
];
const PAYMENT_TYPE_OPTIONS = [
  { value: "cash", label: "Cash" },
  { value: "online", label: "Online" }
];

const EMPTY_FORM = {
  name: "",
  age: "",
  gender: "",
  phone: "",
  address: "",
  feeType: "consultation",
  feeAmount: 300,
  paymentType: "cash",
  reason: "",
  paymentStatus: "pending"
};

const OpManagement = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [feeTypeFilter, setFeeTypeFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  const [toast, setToast] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [patientHistory, setPatientHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/patients`);
      if (res.data && res.data.success) {
        setPatients(res.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching patients:", err);
      showToast("Failed to fetch patient records", "error");
    } finally {
      setLoading(false);
    }
  };

  // =============================================
  // FETCH PATIENT HISTORY
  // =============================================
  const fetchPatientHistory = async (patient) => {
    setHistoryLoading(true);
    setSelectedPatient(patient);
    try {
      // Fetch all patients with same phone number or name
      const res = await axios.get(`${API_BASE_URL}/patients`);
      if (res.data && res.data.success) {
        const allPatients = res.data.data || [];
        // Filter by phone number (primary) or name (secondary)
        const history = allPatients.filter(p => 
          p.phone === patient.phone || 
          (p.name && patient.name && p.name.toLowerCase() === patient.name.toLowerCase())
        );
        // Sort by date (newest first)
        history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setPatientHistory(history);
        setShowHistoryModal(true);
      }
    } catch (err) {
      console.error("Error fetching patient history:", err);
      showToast("Failed to fetch patient history", "error");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || formData.age === "" || !formData.gender) {
      showToast("Please fill all required fields (Name, Age, Gender, Phone)", "error");
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        const res = await axios.put(`${API_BASE_URL}/patients/${editingId}`, formData);
        if (res.data.success) {
          setPatients((prev) =>
            prev.map((p) => (p._id === editingId ? res.data.data : p))
          );
          showToast("Patient record updated successfully!");
        }
      } else {
        const res = await axios.post(`${API_BASE_URL}/patients`, formData);
        if (res.data.success) {
          setPatients((prev) => [res.data.data, ...prev]);
          showToast("Patient added successfully!");
        }
      }
      setFormData({ ...EMPTY_FORM });
      setEditingId(null);
      setShowForm(false);
    } catch (err) {
      console.error("Error saving patient:", err);
      showToast(err.response?.data?.message || "Failed to save patient", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (patient) => {
    setFormData({
      name: patient.name || "",
      age: patient.age ?? "",
      gender: patient.gender || "",
      phone: patient.phone || "",
      address: patient.address || "",
      feeType: patient.feeType || "consultation",
      feeAmount: patient.feeAmount ?? 300,
      paymentType: patient.paymentType || "cash",
      reason: patient.reason || "",
      paymentStatus: patient.paymentStatus || "pending"
    });
    setEditingId(patient._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this patient record?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/patients/${id}`);
      setPatients((prev) => prev.filter((p) => p._id !== id));
      showToast("Patient record deleted", "info");
    } catch (err) {
      console.error("Error deleting:", err);
      showToast("Failed to delete patient record", "error");
    }
  };

  const handlePaymentToggle = async (patient) => {
    const newStatus = patient.paymentStatus === "paid" ? "pending" : "paid";
    try {
      const res = await axios.put(`${API_BASE_URL}/patients/${patient._id}`, {
        paymentStatus: newStatus
      });
      if (res.data.success) {
        setPatients((prev) =>
          prev.map((p) => (p._id === patient._id ? { ...p, paymentStatus: newStatus } : p))
        );
        if (selectedPatient && selectedPatient._id === patient._id) {
          setSelectedPatient((prev) => ({ ...prev, paymentStatus: newStatus }));
        }
        showToast(`Payment marked as '${newStatus}' for ${patient.name}!`);
      }
    } catch (err) {
      console.error("Error toggling payment:", err);
      showToast("Failed to update payment status", "error");
    }
  };

  const cancelForm = () => {
    setFormData({ ...EMPTY_FORM });
    setEditingId(null);
    setShowForm(false);
  };

  // Date Filter Handlers
  const handleFromDateChange = (e) => {
    setFromDate(e.target.value);
    if (e.target.value) {
      setSelectedMonth("");
    }
  };

  const handleToDateChange = (e) => {
    setToDate(e.target.value);
    if (e.target.value) {
      setSelectedMonth("");
    }
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
    setFromDate("");
    setToDate("");
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
    setFeeTypeFilter("All");
    setFromDate("");
    setToDate("");
    setSelectedMonth("");
  };

  // Filtered patients
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      // Payment status filter
      if (statusFilter !== "All" && p.paymentStatus !== statusFilter) return false;
      
      // Fee type filter
      if (feeTypeFilter !== "All" && p.feeType !== feeTypeFilter) return false;

      // Date Range & Month Filters
      if (p.createdAt) {
        const recordDate = new Date(p.createdAt);

        if (fromDate && toDate) {
          const from = new Date(fromDate);
          from.setHours(0, 0, 0, 0);
          const to = new Date(toDate);
          to.setHours(23, 59, 59, 999);
          if (recordDate < from || recordDate > to) return false;
        } else if (fromDate && !toDate) {
          const from = new Date(fromDate);
          from.setHours(0, 0, 0, 0);
          const to = new Date(fromDate);
          to.setHours(23, 59, 59, 999);
          if (recordDate < from || recordDate > to) return false;
        } else if (selectedMonth) {
          const recordMonth = recordDate.toISOString().slice(0, 7);
          if (recordMonth !== selectedMonth) return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (p.name || "").toLowerCase().includes(q);
        const matchPhone = (p.phone || "").toLowerCase().includes(q);
        const matchAddress = (p.address || "").toLowerCase().includes(q);
        const matchReason = (p.reason || "").toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchAddress && !matchReason) return false;
      }
      return true;
    });
  }, [patients, statusFilter, feeTypeFilter, searchQuery, fromDate, toDate, selectedMonth]);

  // Export CSV Handler
  const downloadCSV = () => {
    if (filteredPatients.length === 0) {
      showToast("No patient records available to export!", "error");
      return;
    }

    const headers = [
      "#",
      "Patient ID",
      "Patient Name",
      "Age",
      "Gender",
      "Phone Number",
      "Address",
      "Fee Type",
      "Fee Amount (Rs)",
      "Payment Type",
      "Payment Status",
      "Reason for Consultation",
      "Registered Date",
      "Registered Time"
    ];

    const csvRows = [
      headers.join(","),
      ...filteredPatients.map((p, idx) => {
        const regDate = p.createdAt ? formatDate(p.createdAt) : "N/A";
        const regTime = p.createdAt ? formatTime(p.createdAt) : "N/A";
        return [
          idx + 1,
          `"${p._id}"`,
          `"${(p.name || "").replace(/"/g, '""')}"`,
          p.age ?? "",
          `"${p.gender || ""}"`,
          `"${p.phone || ""}"`,
          `"${(p.address || "").replace(/"/g, '""')}"`,
          `"${p.feeType === "lab" ? "Lab Fee" : "Consultation Fee"}"`,
          p.feeAmount ?? 300,
          `"${p.paymentType || "cash"}"`,
          `"${p.paymentStatus || "pending"}"`,
          `"${(p.reason || "").replace(/"/g, '""')}"`,
          `"${regDate}"`,
          `"${regTime}"`
        ].join(",");
      })
    ];

    const csvData = csvRows.join("\n");
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `OP_Patient_Records_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filteredPatients.length} patient records to CSV!`);
  };

  // Stats
  const stats = useMemo(() => {
    const total = filteredPatients.length;
    const paid = filteredPatients.filter((p) => p.paymentStatus === "paid").length;
    const pending = filteredPatients.filter((p) => p.paymentStatus === "pending").length;
    const totalRevenue = filteredPatients
      .filter((p) => p.paymentStatus === "paid")
      .reduce((sum, p) => sum + (p.feeAmount || 0), 0);
    return { total, paid, pending, totalRevenue };
  }, [filteredPatients]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  const isFilterActive =
    searchQuery ||
    statusFilter !== "All" ||
    feeTypeFilter !== "All" ||
    fromDate ||
    toDate ||
    selectedMonth;

  return (
    <div className="emp-dash">
      <main className="p-2 sm:p-4 lg:p-6">
        {/* Toast */}
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
            <Sparkles className="w-5 h-5" />
            <span className="font-medium text-sm">{toast.message}</span>
          </div>
        )}

        {/* Header */}
        <div className="emp-dash__header">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap">
              OP <span>Management</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchPatients}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
            <button
              onClick={() => {
                setFormData({ ...EMPTY_FORM });
                setEditingId(null);
                setShowForm(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-md"
            >
              <Plus className="w-3.5 h-3.5" /> Add Patient
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Patients</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="emp-dash__stat-value">{stats.total}</div>
            <div className="emp-dash__stat-meta">registered OPD</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Paid</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="emp-dash__stat-value text-emerald-600">{stats.paid}</div>
            <div className="emp-dash__stat-meta">completed payments</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Pending</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="emp-dash__stat-value text-amber-600">{stats.pending}</div>
            <div className="emp-dash__stat-meta">awaiting payment</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Revenue</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <div className="emp-dash__stat-value text-blue-700">₹{stats.totalRevenue.toLocaleString()}</div>
            <div className="emp-dash__stat-meta">collected revenue</div>
          </div>
        </div>

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-gray-200 relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">
                      {editingId ? "Edit Patient Details" : "Register New Patient"}
                    </h3>
                    <p className="text-xs text-gray-500">Fill in patient details below</p>
                  </div>
                </div>
                <button onClick={cancelForm} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                {/* Row 1: Name, Age */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Patient Name <span className="text-blue-600">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter patient name"
                        className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Age <span className="text-blue-600">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        placeholder="Enter age"
                        min="0"
                        max="120"
                        className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Row: Gender */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                    Gender <span className="text-blue-600">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium appearance-none"
                      required
                    >
                      <option value="">Select Gender</option>
                      {GENDER_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-2.5 pointer-events-none" />
                  </div>
                </div>

                {/* Row 2: Phone, Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Phone Number <span className="text-blue-600">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+91 9876543210"
                        className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Address
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Patient address"
                        className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 3: Fee Type, Fee Amount */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Fee Type <span className="text-blue-600">*</span>
                    </label>
                    <div className="relative">
                      <FileText className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                      <select
                        name="feeType"
                        value={formData.feeType}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium appearance-none"
                      >
                        {FEE_TYPE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-2.5 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Fee Amount (₹) <span className="text-blue-600">*</span>
                    </label>
                    <div className="relative">
                      <IndianRupee className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="number"
                        name="feeAmount"
                        value={formData.feeAmount}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Row 4: Payment Type, Payment Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Payment Type <span className="text-blue-600">*</span>
                    </label>
                    <div className="flex gap-3">
                      {PAYMENT_TYPE_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, paymentType: opt.value }))}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${
                            formData.paymentType === opt.value
                              ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                          }`}
                        >
                          {opt.value === "cash" ? (
                            <Banknote className="w-4 h-4" />
                          ) : (
                            <CreditCard className="w-4 h-4" />
                          )}
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Payment Status
                    </label>
                    <div className="flex gap-3">
                      {["pending", "paid"].map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, paymentStatus: st }))}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition-all capitalize ${
                            formData.paymentStatus === st
                              ? st === "paid"
                                ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                                : "border-amber-500 bg-amber-50 text-amber-700 shadow-sm"
                              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                          }`}
                        >
                          {st === "paid" ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Row 5: Reason */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                    Reason for Consultation
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <textarea
                      name="reason"
                      value={formData.reason}
                      onChange={handleInputChange}
                      placeholder="Brief description of the consultation reason..."
                      rows={3}
                      className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium resize-none"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={cancelForm}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : editingId ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    {editingId ? "Update Patient" : "Add Patient"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Filter & Search Toolbar */}
        <div className="emp-dash__card mb-6">
          <div className="flex items-center justify-between gap-3 p-3 bg-white rounded-xl border border-gray-200 flex-wrap">
            <div className="flex items-center gap-2.5 flex-1 min-w-0 flex-wrap">
              {/* Search */}
              <div className="relative min-w-[150px] flex-1 max-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs w-3.5 h-3.5" />
                <input
                  type="text"
                  placeholder="Search name, phone, address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                />
              </div>

              {/* Status filter */}
              <div className="flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-gray-300 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="All">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </select>
              </div>

              {/* Fee type filter */}
              <div className="flex items-center gap-1">
                <select
                  value={feeTypeFilter}
                  onChange={(e) => setFeeTypeFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-gray-300 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="All">All Fee Types</option>
                  <option value="consultation">Consultation</option>
                  <option value="lab">Lab</option>
                </select>
              </div>

              {/* Date From */}
              <div className="relative">
                <input
                  type="date"
                  value={fromDate}
                  onChange={handleFromDateChange}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  title="From Date"
                  className="w-[120px] h-8 px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                />
              </div>

              {/* Date To */}
              <div className="relative">
                <input
                  type="date"
                  value={toDate}
                  onChange={handleToDateChange}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  title="To Date"
                  className="w-[120px] h-8 px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                />
              </div>

              {/* Month Picker */}
              <div className="relative">
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={handleMonthChange}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  title="Select Month"
                  className="w-[130px] h-8 px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-semibold"
                />
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {isFilterActive && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm whitespace-nowrap"
                >
                  <Trash2 className="w-3 h-3 text-red-500" />
                  Clear
                </button>
              )}

              <button
                onClick={downloadCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all shadow-md whitespace-nowrap"
                title="Export patient records to CSV"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Patient Records Table */}
        <div className="emp-dash__card">
          {loading ? (
            <div className="py-12 text-center text-gray-500">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">Loading patient records...</p>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-700">No Patient Records Found</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto mb-3">
                {patients.length === 0
                  ? "Click 'Add Patient' to register a new patient."
                  : "No records match your current date/search filters."}
              </p>
              {isFilterActive && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="emp-dash__table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Patient Name & Info</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Fee Type & Amount</th>
                    <th>Payment Type</th>
                    <th>Payment Status</th>
                    <th>Reason</th>
                    <th>Date</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient, idx) => {
                    const isPaid = patient.paymentStatus === "paid";
                    return (
                      <tr key={patient._id} className="transition-colors hover:bg-slate-50/50">
                        <td className="px-3 py-3 font-semibold text-gray-400 text-[11px]">{idx + 1}</td>
                        <td className="px-3 py-3">
                          <div className="font-semibold text-slate-800 text-xs">{patient.name || "N/A"}</div>
                          {patient.phone && (
                            <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-gray-400" /> {patient.phone}
                            </div>
                          )}
                          {patient.address && (
                            <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5 truncate max-w-[200px]" title={patient.address}>
                              <MapPin className="w-3 h-3" /> {patient.address}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-3 font-medium text-slate-800 text-xs">{patient.age ?? "N/A"} Yrs</td>
                        <td className="px-3 py-3 font-medium text-slate-700 text-xs capitalize">{patient.gender || "N/A"}</td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              patient.feeType === "lab"
                                ? "bg-purple-100 text-purple-800 border border-purple-200"
                                : "bg-blue-100 text-blue-800 border border-blue-200"
                            }`}
                          >
                            {patient.feeType === "lab" ? "Lab" : "Consult"}
                          </span>
                          <div className="font-bold text-slate-800 text-xs mt-0.5">
                            ₹{patient.feeAmount ?? 300}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 capitalize">
                            {patient.paymentType === "online" ? (
                              <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
                            ) : (
                              <Banknote className="w-3.5 h-3.5 text-green-600" />
                            )}
                            {patient.paymentType || "cash"}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider w-fit ${
                                isPaid
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : "bg-amber-100 text-amber-800 border border-amber-200"
                              }`}
                            >
                              {isPaid ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-amber-600" />}
                              {patient.paymentStatus || "pending"}
                            </span>
                            {!isPaid ? (
                              <button
                                onClick={() => handlePaymentToggle(patient)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-xs transition-all flex items-center gap-1 w-fit"
                              >
                                <Check className="w-3 h-3" /> Mark Paid
                              </button>
                            ) : (
                              <button
                                onClick={() => handlePaymentToggle(patient)}
                                className="text-gray-400 hover:text-amber-600 text-[10px] underline font-medium w-fit"
                              >
                                Mark Pending
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3 max-w-[180px]">
                          <div className="truncate text-xs text-slate-700 font-medium" title={patient.reason}>
                            {patient.reason || "General Consultation"}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="font-medium text-slate-800 text-[11px]">{formatDate(patient.createdAt)}</div>
                          <div className="text-[10px] text-gray-400">{formatTime(patient.createdAt)}</div>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* View Details */}
                            <button
                              onClick={() => {
                                setSelectedPatient(patient);
                                setShowDetailModal(true);
                              }}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            
                            {/* Patient History - NEW */}
                            <button
                              onClick={() => fetchPatientHistory(patient)}
                              className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="View Patient History"
                            >
                              <History className="w-4 h-4" />
                            </button>
                            
                            {/* Edit */}
                            <button
                              onClick={() => handleEdit(patient)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            
                            {/* Delete */}
                            <button
                              onClick={() => handleDelete(patient._id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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

        {/* ============================================= */}
        {/* PATIENT HISTORY MODAL */}
        {/* ============================================= */}
        {showHistoryModal && selectedPatient && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
              <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Patient History</h3>
                    <p className="text-xs text-gray-500">
                      {selectedPatient.name} • {selectedPatient.phone}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {patientHistory.length} visits
                  </span>
                  <button 
                    onClick={() => {
                      setShowHistoryModal(false);
                      setPatientHistory([]);
                      setSelectedPatient(null);
                    }} 
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {historyLoading ? (
                  <div className="py-12 text-center text-gray-500">
                    <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-500">Loading patient history...</p>
                  </div>
                ) : patientHistory.length === 0 ? (
                  <div className="py-12 text-center text-gray-500">
                    <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-gray-700">No History Found</h3>
                    <p className="text-xs text-gray-500 mt-1">This patient has no previous visits.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="emp-dash__table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Date</th>
                          <th>Time</th>
                          <th>Fee Type</th>
                          <th>Fee Amount</th>
                          <th>Payment Type</th>
                          <th>Payment Status</th>
                          <th>Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {patientHistory.map((record, idx) => (
                          <tr 
                            key={record._id} 
                            className={`transition-colors hover:bg-slate-50/50 ${
                              record._id === selectedPatient._id ? "bg-purple-50/50 border-l-2 border-purple-500" : ""
                            }`}
                          >
                            <td className="px-3 py-3 font-semibold text-gray-400 text-[11px]">{idx + 1}</td>
                            <td className="px-3 py-3 font-medium text-slate-800 text-xs">
                              {formatDate(record.createdAt)}
                            </td>
                            <td className="px-3 py-3 text-xs text-gray-500">
                              {formatTime(record.createdAt)}
                            </td>
                            <td className="px-3 py-3">
                              <span
                                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                  record.feeType === "lab"
                                    ? "bg-purple-100 text-purple-800 border border-purple-200"
                                    : "bg-blue-100 text-blue-800 border border-blue-200"
                                }`}
                              >
                                {record.feeType === "lab" ? "Lab" : "Consult"}
                              </span>
                            </td>
                            <td className="px-3 py-3 font-bold text-slate-800 text-xs">
                              ₹{record.feeAmount ?? 300}
                            </td>
                            <td className="px-3 py-3">
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 capitalize">
                                {record.paymentType === "online" ? (
                                  <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
                                ) : (
                                  <Banknote className="w-3.5 h-3.5 text-green-600" />
                                )}
                                {record.paymentType || "cash"}
                              </span>
                            </td>
                            <td className="px-3 py-3">
                              <span
                                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider w-fit ${
                                  record.paymentStatus === "paid"
                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                    : "bg-amber-100 text-amber-800 border border-amber-200"
                                }`}
                              >
                                {record.paymentStatus === "paid" ? (
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Clock className="w-3 h-3 text-amber-600" />
                                )}
                                {record.paymentStatus || "pending"}
                              </span>
                            </td>
                            <td className="px-3 py-3 max-w-[200px]">
                              <div className="truncate text-xs text-slate-700 font-medium" title={record.reason}>
                                {record.reason || "General Consultation"}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {/* Current visit indicator */}
                    <div className="mt-4 text-xs text-gray-500 flex items-center gap-2">
                      <span className="inline-block w-3 h-3 bg-purple-500 rounded"></span>
                      <span>Current visit</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Patient Detail Modal */}
        {showDetailModal && selectedPatient && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-gray-200 relative">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Patient Details</h3>
                    <p className="text-xs text-gray-500">ID: {selectedPatient._id}</p>
                  </div>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="my-5 bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <div>
                    <div className="text-[10px] font-bold uppercase text-gray-400">Patient Name</div>
                    <div className="text-base font-bold text-gray-900">{selectedPatient.name}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-gray-400">Age</div>
                    <div className="text-sm font-bold text-gray-800">{selectedPatient.age} Years</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold uppercase text-gray-400">Gender</div>
                    <div className="text-sm font-bold text-gray-800 capitalize">{selectedPatient.gender || "N/A"}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <div className="text-[10px] font-bold uppercase text-gray-400">Phone</div>
                    <div className="text-xs font-bold text-blue-900">{selectedPatient.phone}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-gray-400">Registered On</div>
                    <div className="text-xs font-bold text-blue-900">{formatDate(selectedPatient.createdAt)}</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <div className="text-[10px] font-bold uppercase text-gray-400">Address</div>
                  <div className="text-xs font-medium text-gray-700">{selectedPatient.address || "N/A"}</div>
                </div>

                <div className="pt-1">
                  <div className="text-[10px] font-bold uppercase text-gray-400">Reason for Consultation</div>
                  <div className="text-xs font-medium text-gray-700">{selectedPatient.reason || "General Consultation"}</div>
                </div>

                <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold uppercase text-gray-400">Fee ({selectedPatient.feeType})</div>
                    <div className="text-sm font-extrabold text-blue-950">₹{selectedPatient.feeAmount ?? 300}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-gray-400">Payment Type</div>
                    <div className="text-xs font-bold text-gray-700 capitalize flex items-center gap-1">
                      {selectedPatient.paymentType === "online" ? <CreditCard className="w-3 h-3" /> : <Banknote className="w-3 h-3" />}
                      {selectedPatient.paymentType}
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <div>
                      <div className="text-[10px] font-bold uppercase text-gray-400">Payment Status</div>
                      <span
                        className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                          selectedPatient.paymentStatus === "paid"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : "bg-amber-100 text-amber-900 border-amber-300"
                        }`}
                      >
                        {selectedPatient.paymentStatus || "pending"}
                      </span>
                    </div>
                    {selectedPatient.paymentStatus !== "paid" && (
                      <button
                        onClick={() => handlePaymentToggle(selectedPatient)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2 py-1 rounded shadow-xs transition-all"
                      >
                        Mark Paid
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" /> Print
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md"
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

export default OpManagement;