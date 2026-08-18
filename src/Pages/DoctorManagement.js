import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import {
  User,
  Stethoscope,
  Phone,
  Mail,
  MapPin,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Trash2,
  RefreshCw,
  Sparkles,
  Eye,
  Plus,
  Edit2,
  Calendar,
  Clock,
  Users,
  ChevronDown,
  X,
  Award,
  Briefcase,
  GraduationCap,
  Star,
  FileText,
  Download,
  Printer,
  Lock,
  EyeOff,
  Eye as EyeOpen,
  Key
} from "lucide-react";
import "./EmployeeDashboard.css";
import "./EmployeeLeaves.css";

const SPECIALIZATION_OPTIONS = [
  { value: "General Physician", label: "General Physician" },
  { value: "Cardiologist", label: "Cardiologist" },
  { value: "Dermatologist", label: "Dermatologist" },
  { value: "Endocrinologist", label: "Endocrinologist" },
  { value: "Gastroenterologist", label: "Gastroenterologist" },
  { value: "Gynecologist", label: "Gynecologist" },
  { value: "Neurologist", label: "Neurologist" },
  { value: "Ophthalmologist", label: "Ophthalmologist" },
  { value: "Orthopedic", label: "Orthopedic" },
  { value: "Pediatrician", label: "Pediatrician" },
  { value: "Psychiatrist", label: "Psychiatrist" },
  { value: "Pulmonologist", label: "Pulmonologist" },
  { value: "Radiologist", label: "Radiologist" },
  { value: "Surgeon", label: "Surgeon" },
  { value: "Urologist", label: "Urologist" }
];

// Time options from 5:00 AM to 12:00 AM (midnight)
const TIME_OPTIONS = [
  "5:00 AM", "5:30 AM", "6:00 AM", "6:30 AM",
  "7:00 AM", "7:30 AM", "8:00 AM", "8:30 AM",
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
  "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM",
  "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM",
  "9:00 PM", "9:30 PM", "10:00 PM", "10:30 PM",
  "11:00 PM", "11:30 PM", "12:00 AM"
];

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  password: "",
  specialization: "",
  qualification: "",
  experience: "",
  address: "",
  consultationFee: "",
  availableDays: [],
  availableTimeStart: "",
  availableTimeEnd: "",
  status: "active"
};

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const DoctorManagement = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [toast, setToast] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordInModal, setShowPasswordInModal] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // =============================================
  // GET ALL DOCTORS - /api/doctors/getalldoctors
  // =============================================
  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/doctors/getalldoctors`);
      if (res.data && res.data.success) {
        setDoctors(res.data.data || []);
      } else {
        setDoctors([]);
      }
    } catch (err) {
      console.error("Error fetching doctors:", err);
      setDoctors([]);
      showToast(err.response?.data?.message || "Failed to fetch doctor records", "error");
    } finally {
      setLoading(false);
    }
  };

  const addDoctor = async (payload) => {
    const res = await axios.post(`${API_BASE_URL}/doctors/adddoctor`, payload);
    return res;
  };

  const updateDoctor = async (id, payload) => {
    const res = await axios.put(`${API_BASE_URL}/doctors/updatedoctor/${id}`, payload);
    return res;
  };

  const deleteDoctor = async (id) => {
    const res = await axios.delete(`${API_BASE_URL}/doctors/deletedoctor/${id}`);
    return res;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDayToggle = (day) => {
    setFormData((prev) => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter((d) => d !== day)
        : [...prev.availableDays, day]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.specialization) {
      showToast("Please fill all required fields (Name, Phone, Specialization)", "error");
      return;
    }
    if (!editingId && !formData.password) {
      showToast("Please set a password for the new doctor", "error");
      return;
    }
    if (!editingId && formData.password.length < 6) {
      showToast("Password must be at least 6 characters long", "error");
      return;
    }
    setSubmitting(true);
    try {
      const payload = { ...formData };
      
      if (payload.availableTimeStart && payload.availableTimeEnd) {
        payload.availableTime = `${payload.availableTimeStart} - ${payload.availableTimeEnd}`;
      } else if (payload.availableTimeStart) {
        payload.availableTime = payload.availableTimeStart;
      } else {
        payload.availableTime = "";
      }
      
      delete payload.availableTimeStart;
      delete payload.availableTimeEnd;
      
      if (editingId && !payload.password) {
        delete payload.password;
      }
      
      if (editingId) {
        const res = await updateDoctor(editingId, payload);
        if (res.data.success) {
          setDoctors((prev) =>
            prev.map((d) => (d._id === editingId ? res.data.data : d))
          );
          showToast("Doctor record updated successfully!");
        }
      } else {
        const res = await addDoctor(payload);
        if (res.data.success) {
          setDoctors((prev) => [res.data.data, ...prev]);
          showToast("Doctor added successfully!");
        }
      }
      setFormData({ ...EMPTY_FORM });
      setEditingId(null);
      setShowForm(false);
    } catch (err) {
      console.error("Error saving doctor:", err);
      showToast(err.response?.data?.message || "Failed to save doctor", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (doctor) => {
    let startTime = "";
    let endTime = "";
    if (doctor.availableTime) {
      const parts = doctor.availableTime.split(" - ");
      if (parts.length === 2) {
        startTime = parts[0].trim();
        endTime = parts[1].trim();
      } else {
        startTime = doctor.availableTime;
      }
    }

    setFormData({
      name: doctor.name || "",
      email: doctor.email || "",
      phone: doctor.phone || "",
      password: "",
      specialization: doctor.specialization || "",
      qualification: doctor.qualification || "",
      experience: doctor.experience || "",
      address: doctor.address || "",
      consultationFee: doctor.consultationFee || "",
      availableDays: doctor.availableDays || [],
      availableTimeStart: startTime,
      availableTimeEnd: endTime,
      status: doctor.status || "active"
    });
    setEditingId(doctor._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this doctor record?")) return;
    try {
      await deleteDoctor(id);
      setDoctors((prev) => prev.filter((d) => d._id !== id));
      showToast("Doctor record deleted", "info");
    } catch (err) {
      console.error("Error deleting:", err);
      showToast(err.response?.data?.message || "Failed to delete doctor record", "error");
    }
  };

  const handleStatusToggle = async (doctor) => {
    const newStatus = doctor.status === "active" ? "inactive" : "active";
    try {
      const res = await updateDoctor(doctor._id, { status: newStatus });
      if (res.data.success) {
        setDoctors((prev) =>
          prev.map((d) => (d._id === doctor._id ? { ...d, status: newStatus } : d))
        );
        if (selectedDoctor && selectedDoctor._id === doctor._id) {
          setSelectedDoctor((prev) => ({ ...prev, status: newStatus }));
        }
        showToast(`Doctor status updated to '${newStatus}'`);
      }
    } catch (err) {
      console.error("Error toggling status:", err);
      showToast(err.response?.data?.message || "Failed to update status", "error");
    }
  };

  const cancelForm = () => {
    setFormData({ ...EMPTY_FORM });
    setEditingId(null);
    setShowForm(false);
    setShowPassword(false);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSpecializationFilter("All");
    setStatusFilter("All");
  };

  const filteredDoctors = useMemo(() => {
    return doctors.filter((d) => {
      if (specializationFilter !== "All" && d.specialization !== specializationFilter) return false;
      if (statusFilter !== "All" && d.status !== statusFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (d.name || "").toLowerCase().includes(q);
        const matchPhone = (d.phone || "").toLowerCase().includes(q);
        const matchEmail = (d.email || "").toLowerCase().includes(q);
        const matchSpecialization = (d.specialization || "").toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchEmail && !matchSpecialization) return false;
      }
      return true;
    });
  }, [doctors, specializationFilter, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    const total = filteredDoctors.length;
    const active = filteredDoctors.filter((d) => d.status === "active").length;
    const inactive = filteredDoctors.filter((d) => d.status === "inactive").length;
    return { total, active, inactive };
  }, [filteredDoctors]);

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

  const downloadCSV = () => {
    if (filteredDoctors.length === 0) {
      showToast("No doctor records available to export!", "error");
      return;
    }

    const headers = [
      "#", "Doctor ID", "Name", "Specialization", "Qualification", "Experience",
      "Phone", "Email", "Consultation Fee", "Available Days", "Available Time", "Status", "Joined Date"
    ];

    const csvRows = [
      headers.join(","),
      ...filteredDoctors.map((d, idx) => {
        const days = (d.availableDays || []).join("; ");
        return [
          idx + 1,
          `"${d._id}"`,
          `"${(d.name || "").replace(/"/g, '""')}"`,
          `"${d.specialization || ""}"`,
          `"${(d.qualification || "").replace(/"/g, '""')}"`,
          `"${d.experience || ""}"`,
          `"${d.phone || ""}"`,
          `"${d.email || ""}"`,
          d.consultationFee || 0,
          `"${days}"`,
          `"${d.availableTime || ""}"`,
          `"${d.status || "active"}"`,
          `"${formatDate(d.createdAt)}"`
        ].join(",");
      })
    ];

    const csvData = csvRows.join("\n");
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Doctors_Records_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filteredDoctors.length} doctor records to CSV!`);
  };

  const isFilterActive = searchQuery || specializationFilter !== "All" || statusFilter !== "All";

  return (
    <div className="emp-dash">
      <main className="p-2 sm:p-4 lg:p-6">
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

        <div className="emp-dash__header">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap">
              Doctor <span>Management</span>
            </h1>
            <span className="text-xs text-gray-500 font-medium bg-white px-2.5 py-0.5 rounded-full border border-gray-200 shadow-xs">
              {doctors.length} Doctors
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchDoctors} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
            <button onClick={downloadCSV} className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all shadow-md">
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
            <button onClick={() => { setFormData({ ...EMPTY_FORM }); setEditingId(null); setShowForm(true); }} className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-md">
              <Plus className="w-3.5 h-3.5" /> Add Doctor
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-6">
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Doctors</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="emp-dash__stat-value">{stats.total}</div>
            <div className="emp-dash__stat-meta">registered doctors</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Active</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="emp-dash__stat-value text-emerald-600">{stats.active}</div>
            <div className="emp-dash__stat-meta">currently active</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Inactive</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                <XCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="emp-dash__stat-value text-red-500">{stats.inactive}</div>
            <div className="emp-dash__stat-meta">temporarily inactive</div>
          </div>
        </div>

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-gray-200 relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">
                      {editingId ? "Edit Doctor Details" : "Add New Doctor"}
                    </h3>
                    <p className="text-xs text-gray-500">Fill in doctor details below</p>
                  </div>
                </div>
                <button onClick={cancelForm} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                {/* Row 1: Name, Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Doctor Name <span className="text-blue-600">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Dr. John Doe"
                        className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="doctor@hospital.com"
                        className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 2: Phone, Specialization */}
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
                      Specialization <span className="text-blue-600">*</span>
                    </label>
                    <div className="relative">
                      <Award className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                      <select
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium appearance-none"
                        required
                      >
                        <option value="">Select Specialization</option>
                        {SPECIALIZATION_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-2.5 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Row 3: Password */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                    Password {!editingId && <span className="text-blue-600">*</span>}
                    {editingId && <span className="text-gray-400 text-[10px] font-normal ml-1">(Leave blank to keep current)</span>}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder={editingId ? "Enter new password (optional)" : "Set a password (min 6 characters)"}
                      className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-12 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                      required={!editingId}
                      minLength="6"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOpen className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                  {!editingId && (
                    <p className="text-[10px] text-gray-400 mt-1">Password must be at least 6 characters long</p>
                  )}
                </div>

                {/* Row 4: Qualification, Experience */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Qualification
                    </label>
                    <div className="relative">
                      <GraduationCap className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleInputChange}
                        placeholder="MD, MBBS, etc."
                        className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Experience (Years)
                    </label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="number"
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        placeholder="5"
                        min="0"
                        className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 5: Consultation Fee, Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Consultation Fee (₹)
                    </label>
                    <div className="relative">
                      <Star className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="number"
                        name="consultationFee"
                        value={formData.consultationFee}
                        onChange={handleInputChange}
                        placeholder="500"
                        min="0"
                        className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Status
                    </label>
                    <div className="flex gap-3">
                      {["active", "inactive"].map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, status: st }))}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition-all capitalize ${
                            formData.status === st
                              ? st === "active"
                                ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                                : "border-red-500 bg-red-50 text-red-700 shadow-sm"
                              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                          }`}
                        >
                          {st === "active" ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Row 6: Address */}
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
                      placeholder="Clinic address"
                      className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                    />
                  </div>
                </div>

                {/* Row 7: Available Days */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                    Available Days
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleDayToggle(day)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border-2 transition-all ${
                          formData.availableDays.includes(day)
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Row 8: Available Time */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                    Available Time
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-medium text-gray-500 mb-1">
                        Start Time
                      </label>
                      <div className="relative">
                        <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                        <select
                          name="availableTimeStart"
                          value={formData.availableTimeStart}
                          onChange={handleInputChange}
                          className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium appearance-none"
                        >
                          <option value="">Select Start Time</option>
                          {TIME_OPTIONS.map((time) => (
                            <option key={`start-${time}`} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-2.5 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-500 mb-1">
                        End Time
                      </label>
                      <div className="relative">
                        <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                        <select
                          name="availableTimeEnd"
                          value={formData.availableTimeEnd}
                          onChange={handleInputChange}
                          className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium appearance-none"
                        >
                          <option value="">Select End Time</option>
                          {TIME_OPTIONS.map((time) => (
                            <option key={`end-${time}`} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-2.5 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                  {formData.availableTimeStart && formData.availableTimeEnd && (
                    <p className="text-xs text-blue-600 font-semibold mt-2">
                      Selected: {formData.availableTimeStart} - {formData.availableTimeEnd}
                    </p>
                  )}
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
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    {editingId ? "Update Doctor" : "Add Doctor"}
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
              <div className="relative min-w-[150px] flex-1 max-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs w-3.5 h-3.5" />
                <input
                  type="text"
                  placeholder="Search doctor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                />
              </div>

              <div className="flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-gray-400" />
                <select
                  value={specializationFilter}
                  onChange={(e) => setSpecializationFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-gray-300 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="All">All Specializations</option>
                  {SPECIALIZATION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-gray-300 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="All">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

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
            </div>
          </div>
        </div>

        {/* Doctor Records Table */}
        <div className="emp-dash__card">
          {loading ? (
            <div className="py-12 text-center text-gray-500">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">Loading doctor records...</p>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <Stethoscope className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-700">No Doctor Records Found</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto mb-3">
                {doctors.length === 0 ? "Click 'Add Doctor' to register a new doctor." : "No records match your current filters."}
              </p>
              {isFilterActive && (
                <button onClick={clearFilters} className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm">
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
                    <th>Doctor</th>
                    <th>Specialization</th>
                    <th>Qualification</th>
                    <th>Experience</th>
                    <th>Consultation Fee</th>
                    <th>Available Days</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDoctors.map((doctor, idx) => {
                    const isActive = doctor.status === "active";
                    return (
                      <tr key={doctor._id} className="transition-colors hover:bg-slate-50/50">
                        <td className="px-3 py-3 font-semibold text-gray-400 text-[11px]">{idx + 1}</td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-slate-800 text-xs">{doctor.name || "N/A"}</div>
                              {doctor.phone && (
                                <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                                  <Phone className="w-3 h-3 text-gray-400" /> {doctor.phone}
                                </div>
                              )}
                              {doctor.email && (
                                <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                                  <Mail className="w-3 h-3" /> {doctor.email}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                            <Award className="w-3 h-3" />
                            {doctor.specialization || "N/A"}
                          </span>
                        </td>
                        <td className="px-3 py-3 font-medium text-slate-700 text-xs">
                          {doctor.qualification || "N/A"}
                        </td>
                        <td className="px-3 py-3 font-medium text-slate-700 text-xs">
                          {doctor.experience ? `${doctor.experience} yrs` : "N/A"}
                        </td>
                        <td className="px-3 py-3 font-bold text-slate-800 text-xs">
                          ₹{doctor.consultationFee || 0}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-wrap gap-1">
                            {(doctor.availableDays || []).length > 0 ? (
                              (doctor.availableDays || []).map((day, idx) => (
                                <span key={idx} className="text-[10px] font-medium bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
                                  {day.slice(0, 3)}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] text-gray-400 italic">Not set</span>
                            )}
                          </div>
                          {doctor.availableTime && (
                            <div className="text-[10px] text-gray-500 mt-1">{doctor.availableTime}</div>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-col gap-1">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider w-fit ${
                              isActive ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-red-100 text-red-800 border border-red-200"
                            }`}>
                              {isActive ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-red-600" />}
                              {doctor.status || "active"}
                            </span>
                            <button onClick={() => handleStatusToggle(doctor)} className={`text-[10px] font-medium underline w-fit ${
                              isActive ? "text-red-500 hover:text-red-700" : "text-emerald-600 hover:text-emerald-700"
                            }`}>
                              {isActive ? "Set Inactive" : "Set Active"}
                            </button>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="font-medium text-slate-800 text-[11px]">{formatDate(doctor.createdAt)}</div>
                          <div className="text-[10px] text-gray-400">{formatTime(doctor.createdAt)}</div>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => { setSelectedDoctor(doctor); setShowDetailModal(true); setShowPasswordInModal(false); }} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors group relative" title="View Details">
                              <Eye className="w-4 h-4" />
                              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">View Details</span>
                            </button>
                            <button onClick={() => handleEdit(doctor)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group relative" title="Edit">
                              <Edit2 className="w-4 h-4" />
                              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Edit</span>
                            </button>
                            <button onClick={() => handleDelete(doctor._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors group relative" title="Delete">
                              <Trash2 className="w-4 h-4" />
                              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Delete</span>
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

        {/* Doctor Detail Modal - WITH PASSWORD DISPLAY */}
        {showDetailModal && selectedDoctor && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-gray-200 relative">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Doctor Details</h3>
                    <p className="text-xs text-gray-500">ID: {selectedDoctor._id}</p>
                  </div>
                </div>
                <button onClick={() => { setShowDetailModal(false); setSelectedDoctor(null); setShowPasswordInModal(false); }} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="my-5 bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-3">
                <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                  <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <User className="w-7 h-7 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">{selectedDoctor.name}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Award className="w-3.5 h-3.5 text-purple-600" />
                      {selectedDoctor.specialization}
                    </div>
                  </div>
                  <span className={`ml-auto text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                    selectedDoctor.status === "active" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-red-100 text-red-800 border border-red-200"
                  }`}>
                    {selectedDoctor.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase text-gray-400">Phone</div>
                    <div className="text-xs font-bold text-blue-900">{selectedDoctor.phone}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-gray-400">Email</div>
                    <div className="text-xs font-bold text-blue-900">{selectedDoctor.email || "N/A"}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase text-gray-400">Qualification</div>
                    <div className="text-xs font-medium text-gray-700">{selectedDoctor.qualification || "N/A"}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-gray-400">Experience</div>
                    <div className="text-xs font-medium text-gray-700">
                      {selectedDoctor.experience ? `${selectedDoctor.experience} years` : "N/A"}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <div className="text-[10px] font-bold uppercase text-gray-400">Address</div>
                  <div className="text-xs font-medium text-gray-700">{selectedDoctor.address || "N/A"}</div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <div className="text-[10px] font-bold uppercase text-gray-400">Consultation Fee</div>
                    <div className="text-sm font-extrabold text-blue-950">₹{selectedDoctor.consultationFee || 0}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-gray-400">Joined</div>
                    <div className="text-xs font-medium text-gray-700">{formatDate(selectedDoctor.createdAt)}</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <div className="text-[10px] font-bold uppercase text-gray-400">Available Days</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(selectedDoctor.availableDays || []).length > 0 ? (
                      (selectedDoctor.availableDays || []).map((day, idx) => (
                        <span key={idx} className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                          {day}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">Not set</span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold uppercase text-gray-400">Available Time</div>
                  <div className="text-xs font-medium text-gray-700">{selectedDoctor.availableTime || "Not set"}</div>
                </div>

                {/* ✅ PASSWORD DISPLAY SECTION */}
                <div className="pt-3 border-t-2 border-blue-200 bg-blue-50/50 -mx-5 px-5 py-3 rounded-b-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-blue-600" />
                      <div className="text-[10px] font-bold uppercase text-gray-500">Password</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-mono font-bold text-gray-800 bg-white px-3 py-1 rounded-lg border border-gray-300 min-w-[120px] text-center">
                        {showPasswordInModal ? (
                          selectedDoctor.password || "********"
                        ) : (
                          "••••••••"
                        )}
                      </div>
                      <button
                        onClick={() => setShowPasswordInModal(!showPasswordInModal)}
                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title={showPasswordInModal ? "Hide Password" : "Show Password"}
                      >
                        {showPasswordInModal ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <EyeOpen className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-3">
                <button onClick={() => window.print()} className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center gap-1.5">
                  <Printer className="w-4 h-4" /> Print
                </button>
                <button onClick={() => { setShowDetailModal(false); setSelectedDoctor(null); setShowPasswordInModal(false); }} className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md">
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

export default DoctorManagement;