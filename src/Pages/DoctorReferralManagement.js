// ReferralManagement.js — Combined Doctor + Customer Referrals Management
import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaSearch, FaCalendarAlt, FaUserMd, FaTimes,
  FaPhoneAlt, FaMapMarkerAlt, FaRupeeSign, FaPrint, FaCheckCircle,
  FaTimesCircle, FaTrashAlt, FaAward, FaUser, FaHospital, FaBuilding,
  FaFlask, FaPills, FaClinicMedical, FaShareAlt, FaUsers, FaDatabase,
  FaUserPlus, FaUserCheck, FaGift, FaMoneyBillWave, FaServicestack,
  FaPlusCircle, FaMinusCircle
} from "react-icons/fa";
import {
  FiUsers, FiUserCheck, FiUserX, FiFilter, FiDownload,
  FiTrash2, FiPlus, FiEdit2, FiEye, FiRefreshCw, FiCheckCircle,
  FiXCircle, FiChevronDown, FiChevronUp, FiCheck,
  FiPercent, FiActivity, FiGift
} from "react-icons/fi";
import "./EmployeeDashboard.css";
import "./EmployeeLeaves.css";

const API_BASE_URL = "https://api.timelyhealth.in/api/referralcontacts";
const BASE_API = "https://api.timelyhealth.in/api";

const STATUS_OPTIONS = ["active", "inactive"];
const DISCOUNT_UNIT_OPTIONS = [
  { value: "%", label: "%" },
  { value: "₹", label: "₹" }
];

const COMMISSION_TYPE_OPTIONS = [
  { value: "%", label: "%" },
  { value: "₹", label: "₹" }
];

const EMPTY_DOCTOR_FORM = {
  referralType: "doctor",
  doctorName: "",
  doctorOrganization: "",
  doctorPhone: "",
  doctorSpecialization: "",
  doctorAddress: "",
  clinicCommission: "",
  clinicCommissionType: "%",
  pharmacyCommission: "",
  pharmacyCommissionType: "%",
  labCommission: "",
  labCommissionType: "%",
  feesCommission: "",
  feesCommissionType: "%",
  totalCommission: "",
  services: [],
  onboardDate: "",
  referralNotes: "",
  status: "active",
  discountFees: "",
  discountFeesType: "%",
  discountLab: "",
  discountLabType: "%"
};

const EMPTY_CUSTOMER_FORM = {
  referralType: "customer",
  customerName: "",
  customerOrganization: "",
  customerPhone: "",
  customerAddress: "",
  clinicCommission: "",
  clinicCommissionType: "%",
  pharmacyCommission: "",
  pharmacyCommissionType: "%",
  labCommission: "",
  labCommissionType: "%",
  feesCommission: "",
  feesCommissionType: "%",
  totalCommission: "",
  services: [],
  onboardDate: "",
  referralNotes: "",
  status: "active",
  discountFees: "",
  discountFeesType: "%",
  discountLab: "",
  discountLabType: "%"
};

const COMMISSION_FIELDS = [
  { key: "clinicCommission", typeKey: "clinicCommissionType", label: "Clinic", icon: FaClinicMedical, color: "blue" },
  { key: "pharmacyCommission", typeKey: "pharmacyCommissionType", label: "Pharmacy", icon: FaPills, color: "green" },
  { key: "labCommission", typeKey: "labCommissionType", label: "Lab", icon: FaFlask, color: "purple" },
  { key: "feesCommission", typeKey: "feesCommissionType", label: "Fees", icon: FaMoneyBillWave, color: "amber" }
];

// ==================== HELPERS ====================
const extractId = (val) => {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object" && val._id) return String(val._id);
  return "";
};

const extractName = (val) => {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") {
    return val.doctorName || val.customerName || val.name || "";
  }
  return "";
};

const detectCategory = (svc) => {
  if (!svc) return "clinic";
  const raw = (
    svc.category || svc.serviceCategory || svc.type || svc.serviceType ||
    svc.department || ""
  ).toString().toLowerCase();
  if (raw.includes("pharm") || raw.includes("medic")) return "pharmacy";
  if (raw.includes("lab") || raw.includes("test") || raw.includes("diagnos")) return "lab";
  return "clinic";
};

const getCommissionValue = (referrer, category) => {
  if (!referrer) return { value: 0, type: "%" };
  if (category === "pharmacy") {
    return {
      value: parseFloat(referrer.pharmacyCommission) || 0,
      type: referrer.pharmacyCommissionType || "%"
    };
  }
  if (category === "lab") {
    return {
      value: parseFloat(referrer.labCommission) || 0,
      type: referrer.labCommissionType || "%"
    };
  }
  return {
    value: parseFloat(referrer.clinicCommission) || 0,
    type: referrer.clinicCommissionType || "%"
  };
};

const getServiceReferrerPayable = (referrer, booking) => {
  if (!referrer || !booking) return 0;
  const rawServices =
    (Array.isArray(booking.services) && booking.services.length > 0 && booking.services) ||
    (Array.isArray(booking.serviceItems) && booking.serviceItems.length > 0 && booking.serviceItems) ||
    (Array.isArray(booking.selectedServices) && booking.selectedServices.length > 0 && booking.selectedServices) ||
    [];

  if (rawServices.length > 0) {
    let total = 0;
    rawServices.forEach((svc) => {
      const price = Number(svc.price) || Number(svc.amount) || Number(svc.fee) || Number(svc.rate) || 0;
      const category = detectCategory(svc);
      const { value, type } = getCommissionValue(referrer, category);
      const commission = type === "₹" ? value : (price * value) / 100;
      total += commission;
    });
    return Math.round(total);
  }

  const totalAmount = Number(booking.finalPayable) || Number(booking.totalAmount) || 0;
  if (totalAmount > 0) {
    const { value, type } = getCommissionValue(referrer, "clinic");
    return Math.round(type === "₹" ? value : (totalAmount * value) / 100);
  }
  return 0;
};

const formatDiscount = (value, type) => {
  if (!value) return "";
  const t = type || "%";
  return t === "₹" ? `₹${value}` : `${value}%`;
};

const formatCommission = (value, type) => {
  if (!value && value !== 0) return "0%";
  const t = type || "%";
  return t === "₹" ? `₹${value}` : `${value}%`;
};

export default function ReferralManagement() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("doctor");
  const isDoctorTab = activeTab === "doctor";

  const [doctorReferrals, setDoctorReferrals] = useState([]);
  const [customerReferrals, setCustomerReferrals] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [apiConnected, setApiConnected] = useState(true);

  const [formData, setFormData] = useState({ ...EMPTY_DOCTOR_FORM });
  const [editingId, setEditingId] = useState(null);
  const [editingType, setEditingType] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formService, setFormService] = useState({ name: "", price: "" });

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [monthFilter, setMonthFilter] = useState("");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const statusDropdownRef = useRef(null);
  const [activeCardFilter, setActiveCardFilter] = useState("all");

  const [toast, setToast] = useState(null);
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedOfferReferral, setSelectedOfferReferral] = useState(null);
  const [offerSubmitting, setOfferSubmitting] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState(null);
  const [offerForm, setOfferForm] = useState({ offerName: "", amount: "" });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    const saved = localStorage.getItem("referralManagement_itemsPerPage");
    return saved ? parseInt(saved, 10) : 10;
  });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target)) {
        setShowStatusDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchBookingsData = async () => {
    try {
      const res = await axios.get(`${BASE_API}/appointment-slots/getallreferralbookings`);
      if (res.data && res.data.success) {
        const bookingsData = res.data.bookings || [];
        setBookings(bookingsData);
        return bookingsData;
      }
      const res2 = await axios.get(`${BASE_API}/appointment-slots/getallbookings`);
      if (res2.data && res2.data.success) {
        const bookingsData = res2.data.bookings || res2.data.data || [];
        const transformed = bookingsData.map((b) => {
          const slotDetails = b.slotDetails || {};
          return {
            _id: b._id || b.id,
            referralContactId: b.referralContactId || "",
            referralDoctorId: b.referralDoctorId || "",
            referralCustomerId: b.referralCustomerId || "",
            referredByDoctor: b.referredByDoctor || "",
            referredBy: b.referredBy || "",
            patientName: b.patientName || "",
            patientPhone: b.patientPhone || "",
            date: slotDetails.date || b.appointmentDate || b.date || "",
            doctorName: slotDetails.doctorName || b.doctorName || "",
            consultationFee: b.consultationFee || 0,
            commissionAmount: b.commissionAmount || 0,
            finalPayable: b.finalPayable || b.totalAmount || 0,
            paymentStatus: b.paymentStatus || "Pending",
            status: b.status || "confirmed",
            services: b.services || [],
            serviceItems: b.serviceItems || [],
            isOP: b.isOP === true,
            createdAt: b.createdAt || b.bookedAt || new Date().toISOString()
          };
        });
        setBookings(transformed);
        return transformed;
      }
      setBookings([]);
      return [];
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setBookings([]);
      return [];
    }
  };

  const fetchReferrals = async () => {
    setLoading(true);
    setError("");
    setApiConnected(true);
    try {
      await fetchBookingsData();
      const res = await axios.get(`${API_BASE_URL}/getallreferralcontacts`);

      let referralsData = [];
      if (res.data && res.data.success) {
        if (res.data.data && Array.isArray(res.data.data)) {
          referralsData = res.data.data;
        } else if (Array.isArray(res.data)) {
          referralsData = res.data;
        }
      } else if (Array.isArray(res.data)) {
        referralsData = res.data;
      }

      referralsData = referralsData.map((r) => ({
        ...r,
        offers: Array.isArray(r.offers) ? r.offers : [],
        services: Array.isArray(r.services) ? r.services : []
      }));

      const doctors = referralsData.filter((r) => r.referralType === "doctor");
      const customers = referralsData.filter((r) => r.referralType === "customer");

      setDoctorReferrals(doctors);
      setCustomerReferrals(customers);

      if (doctors.length === 0 && customers.length === 0) {
        setApiConnected(false);
        showToast("No referral records found.", "info");
      } else {
        showToast(`Loaded ${doctors.length} doctors & ${customers.length} customers!`, "success");
      }
    } catch (err) {
      console.error("=== ERROR FETCHING REFERRALS ===", err);
      setApiConnected(false);
      setDoctorReferrals([]);
      setCustomerReferrals([]);
      setError(err.response?.data?.message || "Failed to fetch referral records");
      showToast(err.response?.data?.message || "Failed to fetch referral records", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReferrals(); }, []);

  const activeReferrals = isDoctorTab ? doctorReferrals : customerReferrals;
  const setActiveReferrals = isDoctorTab ? setDoctorReferrals : setCustomerReferrals;
  const referrerLabel = isDoctorTab ? "Doctor" : "Customer";
  const referrerLabelPlural = isDoctorTab ? "Doctors" : "Customers";
  const headerAccent = isDoctorTab ? "text-purple-600" : "text-indigo-600";
  const avatarBg = isDoctorTab ? "bg-purple-500" : "bg-indigo-500";
  const addButtonBg = isDoctorTab ? "bg-purple-600 hover:bg-purple-700" : "bg-indigo-600 hover:bg-indigo-700";

  const getReferralMetrics = (referral) => {
    if (!referral) {
      return { opCount: 0, revenue: 0, patientCount: 0, lastVisit: null, bookingIds: [], bookings: [] };
    }
    const refId = String(referral._id || "");
    const refName = (isDoctorTab ? (referral.doctorName || "") : (referral.customerName || "")).trim().toLowerCase();

    const matchedBookings = bookings.filter((b) => {
      const cId = extractId(b.referralContactId);
      const cuId = extractId(b.referralCustomerId);
      const dId = extractId(b.referralDoctorId);

      if (cId && cId === refId) return true;
      if (cuId && cuId === refId) return true;
      if (dId && dId === refId) return true;

      const refCustomerName = (extractName(b.referralCustomerId) || "").trim().toLowerCase();
      const refDoctorName = (extractName(b.referralDoctorId) || b.referredByDoctor || "").trim().toLowerCase();
      const referredBy = (b.referredBy || "").trim().toLowerCase();

      if (refName && (refCustomerName === refName || refDoctorName === refName || referredBy === refName)) return true;
      return false;
    });

    const opCount = matchedBookings.filter((b) => b.isOP === true).length;
    const revenue = matchedBookings.reduce((sum, b) => sum + getServiceReferrerPayable(referral, b), 0);
    const patientCount = new Set(matchedBookings.map((b) => b.patientName)).size;

    return {
      opCount, revenue, patientCount,
      lastVisit: matchedBookings.length > 0
        ? matchedBookings.reduce((latest, b) => {
            const d = new Date(b.createdAt || b.bookedAt);
            return d > latest ? d : latest;
          }, new Date(0))
        : null,
      bookingIds: matchedBookings.map((b) => b._id),
      bookings: matchedBookings
    };
  };

  const addReferral = async (payload) => axios.post(`${API_BASE_URL}/addreferralcontact`, payload);
  const updateReferral = async (id, payload) => axios.put(`${API_BASE_URL}/updatereferralcontact/${id}`, payload);
  const deleteReferral = async (id) => axios.delete(`${API_BASE_URL}/deletereferralcontact/${id}`);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (
      name === "clinicCommission" || name === "pharmacyCommission" ||
      name === "labCommission" || name === "feesCommission" ||
      name === "clinicCommissionType" || name === "pharmacyCommissionType" ||
      name === "labCommissionType" || name === "feesCommissionType"
    ) {
      const clinicVal = parseFloat(name === "clinicCommission" ? value : formData.clinicCommission) || 0;
      const pharmacyVal = parseFloat(name === "pharmacyCommission" ? value : formData.pharmacyCommission) || 0;
      const labVal = parseFloat(name === "labCommission" ? value : formData.labCommission) || 0;
      const feesVal = parseFloat(name === "feesCommission" ? value : formData.feesCommission) || 0;
      setFormData((prev) => ({
        ...prev,
        totalCommission: (clinicVal + pharmacyVal + labVal + feesVal).toString()
      }));
    }
  };

  // ─── SERVICES handlers (form) ───
  const handleAddService = () => {
    const name = formService.name?.trim();
    const price = formService.price?.toString().trim();
    if (!name) { showToast("Please enter service name", "error"); return; }
    if (!price || isNaN(Number(price))) { showToast("Please enter valid service price", "error"); return; }
    setFormData((prev) => ({
      ...prev,
      services: [...(prev.services || []), { name, price: Number(price) }],
    }));
    setFormService({ name: "", price: "" });
  };

  const handleRemoveService = (index) => {
    setFormData((prev) => ({
      ...prev,
      services: (prev.services || []).filter((_, i) => i !== index),
    }));
  };

  const handleUpdateServicePrice = (index, newPrice) => {
    setFormData((prev) => ({
      ...prev,
      services: (prev.services || []).map((s, i) =>
        i === index ? { ...s, price: Number(newPrice) || 0 } : s
      ),
    }));
  };

  const getServicesTotal = () => {
    return (formData.services || []).reduce((sum, s) => sum + (Number(s.price) || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isDoctorTab) {
      if (!formData.doctorName || !formData.doctorOrganization) {
        showToast("Please fill in Doctor Name and Organisation Name", "error");
        return;
      }
    } else {
      if (!formData.customerName || !formData.customerPhone) {
        showToast("Please fill in Customer Name and Phone", "error");
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        referralType: isDoctorTab ? "doctor" : "customer",
        services: (formData.services || []).filter((s) => s.name && s.price >= 0),
      };

      if (editingId) {
        const res = await updateReferral(editingId, payload);
        if (res.data.success) {
          const updatedData = res.data.data || { _id: editingId, ...payload };
          const savedReferral = {
            ...updatedData,
            offers: updatedData.offers || [],
            services: updatedData.services || payload.services || []
          };
          setActiveReferrals((prev) =>
            prev.map((r) => (r._id === editingId ? { ...r, ...updatedData, offers: r.offers || [] } : r))
          );
          showToast(`${referrerLabel} referral updated successfully!`);
        }
      } else {
        const res = await addReferral(payload);
        if (res.data.success) {
          const newData = res.data.data || {
            _id: Date.now().toString(), ...payload, offers: [],
            createdAt: new Date().toISOString()
          };
          const savedReferral = {
            ...newData,
            offers: newData.offers || [],
            services: newData.services || payload.services || []
          };
          setActiveReferrals((prev) => [savedReferral, ...prev]);
          showToast(`${referrerLabel} referral added successfully!`);
        }
      }

      setFormData(isDoctorTab ? { ...EMPTY_DOCTOR_FORM } : { ...EMPTY_CUSTOMER_FORM });
      setEditingId(null);
      setEditingType(null);
      setShowForm(false);
      setFormService({ name: "", price: "" });
    } catch (err) {
      console.error(`Error saving ${referrerLabel.toLowerCase()} referral:`, err);
      showToast(err.response?.data?.message || `Failed to save referral`, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (referral) => {
    const common = {
      clinicCommission: referral.clinicCommission || "",
      clinicCommissionType: referral.clinicCommissionType || "%",
      pharmacyCommission: referral.pharmacyCommission || "",
      pharmacyCommissionType: referral.pharmacyCommissionType || "%",
      labCommission: referral.labCommission || "",
      labCommissionType: referral.labCommissionType || "%",
      feesCommission: referral.feesCommission || "",
      feesCommissionType: referral.feesCommissionType || "%",
      totalCommission: referral.totalCommission || "",
      services: Array.isArray(referral.services) ? [...referral.services] : [],
      onboardDate: referral.onboardDate || referral.referralDate || "",
      referralNotes: referral.referralNotes || "",
      status: referral.status || "active",
      discountFees: referral.discountFees || "",
      discountFeesType: referral.discountFeesType || "%",
      discountLab: referral.discountLab || "",
      discountLabType: referral.discountLabType || "%"
    };

    if (isDoctorTab) {
      setFormData({
        referralType: "doctor",
        doctorName: referral.doctorName || "",
        doctorOrganization: referral.doctorOrganization || "",
        doctorPhone: referral.doctorPhone || "",
        doctorSpecialization: referral.doctorSpecialization || "",
        doctorAddress: referral.doctorAddress || "",
        ...common
      });
      setEditingType("doctor");
    } else {
      setFormData({
        referralType: "customer",
        customerName: referral.customerName || "",
        customerOrganization: referral.customerOrganization || "",
        customerPhone: referral.customerPhone || "",
        customerAddress: referral.customerAddress || "",
        ...common
      });
      setEditingType("customer");
    }
    setEditingId(referral._id);
    setFormService({ name: "", price: "" });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete this ${referrerLabel.toLowerCase()} referral record?`)) return;
    try {
      await deleteReferral(id);
      setActiveReferrals((prev) => prev.filter((r) => r._id !== id));
      showToast(`${referrerLabel} referral deleted successfully`, "info");
    } catch (err) {
      console.error("Error deleting:", err);
      showToast(err.response?.data?.message || "Failed to delete referral", "error");
    }
  };

  const handleStatusChange = async (referral, newStatus) => {
    try {
      const res = await updateReferral(referral._id, { status: newStatus });
      if (res.data.success) {
        setActiveReferrals((prev) => prev.map((r) => (r._id === referral._id ? { ...r, status: newStatus } : r)));
        if (selectedReferral && selectedReferral._id === referral._id) {
          setSelectedReferral((prev) => ({ ...prev, status: newStatus }));
        }
        showToast(`Referral status updated to '${newStatus}'`);
      }
    } catch (err) {
      console.error("Error updating status:", err);
      showToast(err.response?.data?.message || "Failed to update status", "error");
    }
  };

  const openOfferModal = (referral) => {
    setSelectedOfferReferral(referral);
    setEditingOfferId(null);
    setOfferForm({ offerName: "", amount: "" });
    setShowOfferModal(true);
  };

  const openEditOfferModal = (referral, offer) => {
    setSelectedOfferReferral(referral);
    setEditingOfferId(offer._id);
    setOfferForm({ offerName: offer.offerName || "", amount: offer.offerAmount || "" });
    setShowOfferModal(true);
  };

  const closeOfferModal = () => {
    setShowOfferModal(false);
    setSelectedOfferReferral(null);
    setEditingOfferId(null);
    setOfferForm({ offerName: "", amount: "" });
  };

  const handleOfferInputChange = (e) => {
    const { name, value } = e.target;
    setOfferForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleOfferSubmit = async (e) => {
    e.preventDefault();
    if (!offerForm.offerName || !offerForm.amount) {
      showToast("Please fill Offer Name and Amount", "error");
      return;
    }
    if (!selectedOfferReferral) return;

    setOfferSubmitting(true);
    try {
      const payload = { offerName: offerForm.offerName, offerAmount: Number(offerForm.amount) };
      let res;
      if (editingOfferId) {
        res = await axios.put(`${API_BASE_URL}/updateoffer/${selectedOfferReferral._id}/${editingOfferId}`, payload);
      } else {
        res = await axios.post(`${API_BASE_URL}/addoffer/${selectedOfferReferral._id}`, payload);
      }

      if (res.data.success) {
        const updatedReferral = {
          ...res.data.data,
          offers: Array.isArray(res.data.data?.offers) ? res.data.data.offers : []
        };
        setActiveReferrals((prev) => prev.map((r) => (r._id === updatedReferral._id ? updatedReferral : r)));
        if (selectedReferral && selectedReferral._id === updatedReferral._id) setSelectedReferral(updatedReferral);
        showToast(editingOfferId ? "Offer updated successfully!" : "Offer added successfully!");
        closeOfferModal();
      }
    } catch (err) {
      console.error("Error saving offer:", err);
      showToast(err.response?.data?.message || "Failed to save offer", "error");
    } finally {
      setOfferSubmitting(false);
    }
  };

  const handleDeleteOffer = async (referral, offerId) => {
    if (!window.confirm("Are you sure you want to delete this offer?")) return;
    try {
      const res = await axios.delete(`${API_BASE_URL}/deleteoffer/${referral._id}/${offerId}`);
      if (res.data.success) {
        const updatedReferral = {
          ...res.data.data,
          offers: Array.isArray(res.data.data?.offers) ? res.data.data.offers : []
        };
        setActiveReferrals((prev) => prev.map((r) => (r._id === updatedReferral._id ? updatedReferral : r)));
        if (selectedReferral && selectedReferral._id === updatedReferral._id) setSelectedReferral(updatedReferral);
        showToast("Offer deleted successfully!");
      }
    } catch (err) {
      console.error("Error deleting offer:", err);
      showToast(err.response?.data?.message || "Failed to delete offer", "error");
    }
  };

  const cancelForm = () => {
    setFormData(isDoctorTab ? { ...EMPTY_DOCTOR_FORM } : { ...EMPTY_CUSTOMER_FORM });
    setEditingId(null);
    setEditingType(null);
    setShowForm(false);
    setFormService({ name: "", price: "" });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
    setMonthFilter("");
    setActiveCardFilter("all");
    setCurrentPage(1);
    if (window.innerWidth < 1024) setShowMobileFilters(false);
  };

  const hasActiveFilters = searchQuery || statusFilter !== "All" || monthFilter !== "";
  const getStatusLabel = () => statusFilter === "All" ? "Status" : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1);

  const handleCardClick = (type) => {
    setActiveCardFilter(type);
    setCurrentPage(1);
    if (type === "all") setStatusFilter("All");
    else setStatusFilter(type);
  };

  const filteredReferrals = useMemo(() => {
    return activeReferrals.filter((r) => {
      if (monthFilter && monthFilter !== "") {
        const createdAt = new Date(r.createdAt);
        const referralMonth = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, "0")}`;
        if (referralMonth !== monthFilter) return false;
      }
      if (statusFilter !== "All" && r.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (isDoctorTab) {
          const name = (r.doctorName || "").toLowerCase().includes(q);
          const phone = (r.doctorPhone || "").toLowerCase().includes(q);
          const org = (r.doctorOrganization || "").toLowerCase().includes(q);
          const spec = (r.doctorSpecialization || "").toLowerCase().includes(q);
          if (!name && !phone && !org && !spec) return false;
        } else {
          const name = (r.customerName || "").toLowerCase().includes(q);
          const phone = (r.customerPhone || "").toLowerCase().includes(q);
          const address = (r.customerAddress || "").toLowerCase().includes(q);
          if (!name && !phone && !address) return false;
        }
      }
      return true;
    });
  }, [activeReferrals, statusFilter, searchQuery, monthFilter, isDoctorTab]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter, monthFilter, activeTab]);

  const stats = useMemo(() => {
    const total = activeReferrals.length;
    const active = activeReferrals.filter((r) => r.status === "active").length;
    const inactive = activeReferrals.filter((r) => r.status === "inactive").length;
    let totalOps = 0;
    activeReferrals.forEach((r) => { totalOps += getReferralMetrics(r).opCount; });
    return { total, active, inactive, totalOps };
  }, [activeReferrals, bookings, activeTab]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  const getStatusBadgeColor = (status) => {
    return status === "active"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-red-50 text-red-700 border-red-200";
  };

  const getTypeBadgeColor = (type) => {
    return type === "customer"
      ? "bg-indigo-50 text-indigo-700 border-indigo-200"
      : "bg-purple-50 text-purple-700 border-purple-200";
  };

  const downloadCSV = () => {
    if (filteredReferrals.length === 0) {
      alert(`No ${referrerLabel.toLowerCase()} referral records available to download!`);
      return;
    }
    const headers = isDoctorTab
      ? ["Sl No", "Name", "Organisation", "Phone", "Specialization", "Address", "Clinic", "Pharmacy", "Lab", "Fees", "Services", "Discount Fees", "Discount Lab", "Status", "Onboard Date"]
      : ["Sl No", "Name", "Phone", "Address", "Clinic", "Pharmacy", "Lab", "Fees", "Services", "Discount Fees", "Discount Lab", "Status", "Onboard Date"];

    const csvRows = [
      headers.join(","),
      ...filteredReferrals.map((r, idx) => {
        const discountFeesStr = r.discountFees ? `${r.discountFees}${r.discountFeesType || "%"}` : "";
        const discountLabStr = r.discountLab ? `${r.discountLab}${r.discountLabType || "%"}` : "";
        const servicesStr = (r.services || []).map((s) => `${s.name} (₹${s.price})`).join("; ");
        const clinicStr = formatCommission(r.clinicCommission, r.clinicCommissionType);
        const pharmacyStr = formatCommission(r.pharmacyCommission, r.pharmacyCommissionType);
        const labStr = formatCommission(r.labCommission, r.labCommissionType);
        const feesStr = formatCommission(r.feesCommission, r.feesCommissionType);
        if (isDoctorTab) {
          return [
            idx + 1,
            `"${(r.doctorName || "").replace(/"/g, '""')}"`,
            `"${(r.doctorOrganization || "").replace(/"/g, '""')}"`,
            `"${r.doctorPhone || ""}"`,
            `"${(r.doctorSpecialization || "").replace(/"/g, '""')}"`,
            `"${(r.doctorAddress || "").replace(/"/g, '""')}"`,
            `"${clinicStr}"`, `"${pharmacyStr}"`, `"${labStr}"`, `"${feesStr}"`,
            `"${servicesStr}"`,
            `"${discountFeesStr}"`, `"${discountLabStr}"`,
            `"${r.status || "active"}"`,
            `"${formatDate(r.onboardDate || r.referralDate || r.createdAt)}"`
          ].join(",");
        } else {
          return [
            idx + 1,
            `"${(r.customerName || "").replace(/"/g, '""')}"`,
            `"${r.customerPhone || ""}"`,
            `"${(r.customerAddress || "").replace(/"/g, '""')}"`,
            `"${clinicStr}"`, `"${pharmacyStr}"`, `"${labStr}"`, `"${feesStr}"`,
            `"${servicesStr}"`,
            `"${discountFeesStr}"`, `"${discountLabStr}"`,
            `"${r.status || "active"}"`,
            `"${formatDate(r.onboardDate || r.referralDate || r.createdAt)}"`
          ].join(",");
        }
      })
    ];

    const csvData = csvRows.join("\n");
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${referrerLabel.toLowerCase()}_referral_records_${new Date().toLocaleDateString().replace(/\//g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filteredReferrals.length} records!`);
  };

  const totalPages = Math.ceil(filteredReferrals.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReferrals = filteredReferrals.slice(indexOfFirstItem, indexOfLastItem);

  const handleItemsPerPageChange = (e) => {
    const newValue = Number(e.target.value);
    setItemsPerPage(newValue);
    localStorage.setItem("referralManagement_itemsPerPage", String(newValue));
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) pageNumbers.push(i);
      else if (i === currentPage - 3 || i === currentPage + 3) pageNumbers.push("...");
    }
    return pageNumbers;
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchQuery("");
    setStatusFilter("All");
    setMonthFilter("");
    setActiveCardFilter("all");
    setCurrentPage(1);
    setShowForm(false);
    setEditingId(null);
    setEditingType(null);
    setFormData(tab === "doctor" ? { ...EMPTY_DOCTOR_FORM } : { ...EMPTY_CUSTOMER_FORM });
    setFormService({ name: "", price: "" });
  };

  if (loading) {
    return (
      <div className="emp-dash">
        <div className="emp-dash__loading">
          <div className="emp-dash__spinner" />
          <p className="emp-dash__loading-text">Loading referrals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="emp-dash">
      <main className="p-2 sm:p-4 lg:p-6">
        {toast && (
          <div className={`fixed top-5 right-5 z-[99999] flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white transition-all ${toast.type === "error" ? "bg-red-600" : toast.type === "info" ? "bg-cyan-600" : "bg-emerald-600"}`}>
            {toast.type === "error" ? <FiXCircle className="w-5 h-5" /> : <FiCheckCircle className="w-5 h-5" />}
            <span className="font-medium text-sm">{toast.message}</span>
          </div>
        )}

        {/* TABS */}
        <div className="flex items-center gap-2 mb-4 border-b-2 border-gray-200 overflow-x-auto">
          <button onClick={() => handleTabChange("doctor")} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold whitespace-nowrap border-b-2 transition-all ${activeTab === "doctor" ? "border-purple-600 text-purple-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            <FaUserMd className="w-4 h-4" /> Doctor Referrals
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === "doctor" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-500"}`}>{doctorReferrals.length}</span>
          </button>
          <button onClick={() => handleTabChange("customer")} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold whitespace-nowrap border-b-2 transition-all ${activeTab === "customer" ? "border-indigo-600 text-indigo-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            <FaUser className="w-4 h-4" /> Customer Referrals
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === "customer" ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-500"}`}>{customerReferrals.length}</span>
          </button>
        </div>

        {/* HEADER DESKTOP */}
        <div className="hidden lg:flex items-center justify-between gap-3 flex-wrap mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap">{referrerLabel} <span>Referrals</span></h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="emp-dash__date-pill flex-shrink-0">{isDoctorTab ? <FaUserMd /> : <FaUser />}<span>{activeReferrals.length} {referrerLabelPlural}</span></div>
            <div className="relative min-w-[150px]">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input type="text" placeholder={isDoctorTab ? "Search Name, Org..." : "Search Name, Phone..."} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-[180px] pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white" />
            </div>
            <input type="month" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className="px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none bg-white" />
            <div className="relative" ref={statusDropdownRef}>
              <button onClick={() => setShowStatusDropdown(!showStatusDropdown)} className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all bg-white whitespace-nowrap ${statusFilter !== "All" ? "border-blue-500 text-blue-700 bg-blue-50" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}>
                <FiActivity className="text-gray-400 text-[10px]" />
                <span className="truncate max-w-[60px]">{getStatusLabel()}</span>
                <span className="text-gray-400 text-[10px]">▾</span>
              </button>
              {showStatusDropdown && (
                <div className="fixed bg-white border border-gray-200 rounded-lg shadow-2xl min-w-[150px]" style={{ zIndex: 99999, top: statusDropdownRef.current ? statusDropdownRef.current.getBoundingClientRect().bottom + 4 : "auto", left: statusDropdownRef.current ? statusDropdownRef.current.getBoundingClientRect().left : "auto" }}>
                  <div onClick={() => { setStatusFilter("All"); setShowStatusDropdown(false); }} className={`px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 flex items-center justify-between ${statusFilter === "All" ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"}`}>
                    <span>All Status</span>{statusFilter === "All" && <FiCheck className="w-3 h-3 text-blue-600" />}
                  </div>
                  {STATUS_OPTIONS.map((status) => (
                    <div key={status} onClick={() => { setStatusFilter(status); setShowStatusDropdown(false); }} className={`px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 flex items-center justify-between ${statusFilter === status ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"}`}>
                      <span className="capitalize">{status}</span>{statusFilter === status && <FiCheck className="w-3 h-3 text-blue-600" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap">
                <FiTrash2 className="w-3 h-3 text-red-500" /> Clear
              </button>
            )}
            <button onClick={fetchReferrals} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"><FiRefreshCw className="w-3.5 h-3.5" /><span className="hidden sm:inline">Refresh</span></button>
            <button onClick={downloadCSV} className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700"><FiDownload className="w-3.5 h-3.5" /><span className="hidden sm:inline">Export CSV</span></button>
            <button onClick={() => navigate("/referral-bookings")} className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"><FaUsers className="w-3.5 h-3.5" /><span>{referrerLabel} Referred OP</span></button>
            <button onClick={() => { setFormData(isDoctorTab ? { ...EMPTY_DOCTOR_FORM } : { ...EMPTY_CUSTOMER_FORM }); setEditingId(null); setEditingType(null); setFormService({ name: "", price: "" }); setShowForm(true); }} className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white ${addButtonBg} rounded-lg shadow-sm`}>
              {isDoctorTab ? <FaUserMd className="w-3.5 h-3.5" /> : <FaUserPlus className="w-3.5 h-3.5" />}<span>Add {referrerLabel}</span>
            </button>
          </div>
        </div>

        {/* HEADER MOBILE */}
        <div className="lg:hidden flex flex-col gap-2 mb-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h1 className="text-base font-bold whitespace-nowrap">{referrerLabel} <span className={headerAccent}>Referrals</span></h1>
            <div className="emp-dash__date-pill text-[10px] px-2 py-1">{isDoctorTab ? <FaUserMd className="text-[10px]" /> : <FaUser className="text-[10px]" />}<span>{activeReferrals.length} {referrerLabelPlural}</span></div>
          </div>
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input type="text" placeholder={`Search ${referrerLabel.toLowerCase()}...`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-8 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none bg-white" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setShowMobileFilters(!showMobileFilters)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <FiFilter className="text-blue-600 text-sm" /><span>Filter</span>{showMobileFilters ? <FiChevronUp className="text-gray-400 text-xs" /> : <FiChevronDown className="text-gray-400 text-xs" />}
            </button>
            {hasActiveFilters && (<button onClick={clearFilters} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"><FiTrash2 className="w-3 h-3 text-red-500" />Clear</button>)}
            <button onClick={() => navigate("/referral-bookings")} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"><FaUsers className="w-3.5 h-3.5" /><span>Referred OP</span></button>
            <button onClick={() => { setFormData(isDoctorTab ? { ...EMPTY_DOCTOR_FORM } : { ...EMPTY_CUSTOMER_FORM }); setEditingId(null); setEditingType(null); setFormService({ name: "", price: "" }); setShowForm(true); }} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white ${addButtonBg} rounded-lg`}>
              {isDoctorTab ? <FaUserMd className="w-3.5 h-3.5" /> : <FaUserPlus className="w-3.5 h-3.5" />}<span>{referrerLabel}</span>
            </button>
          </div>
          {showMobileFilters && (
            <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Month</label>
                <input type="month" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white">
                  <option value="All">All Status</option>
                  {STATUS_OPTIONS.map((status) => (<option key={status} value={status} className="capitalize">{status}</option>))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className={`emp-dash__stat cursor-pointer hover:scale-105 transition-transform duration-200 ${activeCardFilter === "all" ? "ring-2 ring-blue-500/20 border-blue-400" : ""}`} onClick={() => handleCardClick("all")}>
            <div className="emp-dash__stat-top"><span className="emp-dash__stat-label">Total {referrerLabelPlural}</span><div className="emp-dash__stat-icon emp-dash__stat-icon--rate"><FiUsers /></div></div>
            <div className="emp-dash__stat-value">{stats.total}</div>
            <div className="emp-dash__stat-meta">all referrals</div>
          </div>
          <div className={`emp-dash__stat cursor-pointer hover:scale-105 transition-transform duration-200 ${activeCardFilter === "active" ? "ring-2 ring-emerald-500/20 border-emerald-400" : ""}`} onClick={() => handleCardClick("active")}>
            <div className="emp-dash__stat-top"><span className="emp-dash__stat-label">Active</span><div className="emp-dash__stat-icon emp-dash__stat-icon--present"><FiUserCheck /></div></div>
            <div className="emp-dash__stat-value text-emerald-600">{stats.active}</div>
            <div className="emp-dash__stat-meta">active referrals</div>
          </div>
          <div className={`emp-dash__stat cursor-pointer hover:scale-105 transition-transform duration-200 ${activeCardFilter === "inactive" ? "ring-2 ring-red-500/20 border-red-400" : ""}`} onClick={() => handleCardClick("inactive")}>
            <div className="emp-dash__stat-top"><span className="emp-dash__stat-label">Inactive</span><div className="emp-dash__stat-icon emp-dash__stat-icon--late"><FiUserX /></div></div>
            <div className="emp-dash__stat-value text-red-500">{stats.inactive}</div>
            <div className="emp-dash__stat-meta">inactive referrals</div>
          </div>
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top"><span className="emp-dash__stat-label">Total OPs</span><div className="emp-dash__stat-icon emp-dash__stat-icon--rate"><FaUsers className="w-4 h-4 text-blue-600" /></div></div>
            <div className="emp-dash__stat-value text-blue-600">{stats.totalOps}</div>
            <div className="emp-dash__stat-meta">total OP visits</div>
          </div>
        </div>

        {/* TABLE + CARD VIEW */}
        <div className="emp-dash__card">
          {activeReferrals.length === 0 && !loading ? (
            <div className="emp-dash__card-body py-12 text-center text-gray-500">
              <div className="mb-3 text-4xl text-gray-300">{isDoctorTab ? <FaUserMd className="w-12 h-12 text-gray-300 mx-auto" /> : <FaUser className="w-12 h-12 text-gray-300 mx-auto" />}</div>
              <p className="mb-1 text-sm font-semibold text-gray-800">No {referrerLabel.toLowerCase()} referrals found</p>
              <button onClick={() => { setFormData(isDoctorTab ? { ...EMPTY_DOCTOR_FORM } : { ...EMPTY_CUSTOMER_FORM }); setEditingId(null); setEditingType(null); setFormService({ name: "", price: "" }); setShowForm(true); }} className={`px-4 py-2 text-xs font-semibold text-white ${addButtonBg} rounded-lg inline-flex items-center gap-1.5`}>
                {isDoctorTab ? <FaUserMd className="w-3.5 h-3.5" /> : <FaUserPlus className="w-3.5 h-3.5" />}Add {referrerLabel}
              </button>
            </div>
          ) : filteredReferrals.length === 0 && !loading ? (
            <div className="emp-dash__card-body py-12 text-center text-gray-500">
              <p className="mb-1 text-sm font-semibold text-gray-800">No matching records found</p>
              <button onClick={clearFilters} className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Clear Filters</button>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="emp-dash__table">
                  <thead>
                    <tr>
                      <th style={{ width: "40px", textAlign: "center" }}>S.No</th>
                      <th>{referrerLabel}</th>
                      <th>Organisation</th>
                      <th>Phone</th>
                      <th>{isDoctorTab ? "Specialization" : "Address"}</th>
                      <th style={{ textAlign: "center" }}>Clinic</th>
                      <th style={{ textAlign: "center" }}>Pharmacy</th>
                      <th style={{ textAlign: "center" }}>Lab</th>
                      <th style={{ textAlign: "center" }}>Fees</th>
                      <th style={{ textAlign: "center" }}>Services</th>
                      <th style={{ textAlign: "center" }}>Discount</th>
                      <th style={{ textAlign: "center" }}>Status</th>
                      <th style={{ textAlign: "center" }}>Onboard Date</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentReferrals.map((referral, idx) => {
                      const offers = referral.offers || [];
                      const services = referral.services || [];
                      const name = isDoctorTab ? (referral.doctorName || "N/A") : (referral.customerName || "N/A");

                      return (
                        <tr key={referral._id} className="transition-colors hover:bg-slate-50/50">
                          <td className="px-3 py-3 font-semibold text-center text-slate-500 text-[11px]">{indexOfFirstItem + idx + 1}</td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-full ${avatarBg} text-white font-bold flex items-center justify-center flex-shrink-0 text-xs shadow-sm`}>{name.charAt(0).toUpperCase()}</div>
                              <div className="font-semibold text-slate-800 text-xs truncate">{name}</div>
                            </div>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <div className="text-xs font-medium text-slate-700 flex items-center gap-1">
                              <FaBuilding className="text-gray-400 text-[11px]" />
                              <span className="truncate max-w-[150px]">{isDoctorTab ? (referral.doctorOrganization || "N/A") : (referral.customerOrganization || "N/A")}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <span className="text-xs font-medium text-slate-700 flex items-center gap-1"><FaPhoneAlt className="text-gray-400 text-[10px]" />{isDoctorTab ? (referral.doctorPhone || "N/A") : (referral.customerPhone || "N/A")}</span>
                          </td>
                          {isDoctorTab ? (
                            <td className="px-3 py-3 whitespace-nowrap"><span className="text-xs font-medium text-slate-700 flex items-center gap-1"><FaAward className="text-gray-400 text-[11px]" />{referral.doctorSpecialization || "General"}</span></td>
                          ) : (
                            <td className="px-3 py-3 whitespace-nowrap"><span className="text-xs font-medium text-slate-700 flex items-center gap-1"><FaMapMarkerAlt className="text-gray-400 text-[11px]" /><span className="truncate max-w-[150px]">{referral.customerAddress || "N/A"}</span></span></td>
                          )}
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                              {formatCommission(referral.clinicCommission, referral.clinicCommissionType)}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">
                              {formatCommission(referral.pharmacyCommission, referral.pharmacyCommissionType)}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                              {formatCommission(referral.labCommission, referral.labCommissionType)}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                              {formatCommission(referral.feesCommission, referral.feesCommissionType)}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            {services.length > 0 ? (
                              <div className="flex flex-col items-center gap-0.5">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  <FaServicestack className="w-2.5 h-2.5" />
                                  {services.length} service{services.length > 1 ? "s" : ""}
                                </span>
                                <span className="text-[9px] text-gray-500">
                                  ₹{services.reduce((s, x) => s + (Number(x.price) || 0), 0)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-gray-400 italic">—</span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-center">
                            {(referral.discountFees || referral.discountLab) ? (
                              <div className="flex flex-col gap-1 text-[10px] font-bold">
                                {referral.discountFees && <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Fees: {formatDiscount(referral.discountFees, referral.discountFeesType)}</span>}
                                {referral.discountLab && <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Lab: {formatDiscount(referral.discountLab, referral.discountLabType)}</span>}
                              </div>
                            ) : offers.length > 0 ? (
                              <div className="flex flex-col items-center gap-1">
                                {offers.slice(0, 1).map((offer) => (
                                  <div key={offer._id} className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                    <FiGift className="w-2.5 h-2.5" />{offer.offerName}: ₹{offer.offerAmount}
                                  </div>
                                ))}
                              </div>
                            ) : <span className="text-[10px] text-gray-400 italic">-</span>}
                          </td>
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${getStatusBadgeColor(referral.status)}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${referral.status === "active" ? "bg-emerald-500" : "bg-red-500"}`}></span>{referral.status}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <div className="font-semibold text-slate-700 text-[11px]">{formatDate(referral.onboardDate || referral.referralDate || referral.createdAt)}</div>
                          </td>
                          <td className="px-3 py-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => openOfferModal(referral)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg" title="Add Offer"><FiGift className="w-4 h-4" /></button>
                              <button onClick={() => { setSelectedReferral(referral); setShowDetailModal(true); }} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg" title="View Details"><FiEye className="w-4 h-4" /></button>
                              <button onClick={() => handleEdit(referral)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit"><FiEdit2 className="w-4 h-4" /></button>
                              <button onClick={() => handleDelete(referral._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Delete"><FiTrash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARD VIEW */}
              <div className="lg:hidden p-3 space-y-3 bg-gray-50/50">
                {currentReferrals.map((referral) => {
                  const services = referral.services || [];
                  const name = isDoctorTab ? (referral.doctorName || "N/A") : (referral.customerName || "N/A");

                  return (
                    <div key={referral._id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      <div className="flex items-center justify-between gap-2 p-3 border-b border-gray-100 bg-gradient-to-r from-blue-50/60 to-indigo-50/60">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className={`w-9 h-9 rounded-full ${avatarBg} text-white font-bold flex items-center justify-center text-xs flex-shrink-0`}>{name.charAt(0).toUpperCase()}</div>
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-slate-800 text-sm truncate">{name}</div>
                            <div className="text-[11px] text-gray-500 flex items-center gap-1"><FaPhoneAlt className="text-[9px]" />{isDoctorTab ? (referral.doctorPhone || "N/A") : (referral.customerPhone || "N/A")}</div>
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full uppercase border ${getStatusBadgeColor(referral.status)} flex-shrink-0`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${referral.status === "active" ? "bg-emerald-500" : "bg-red-500"}`}></span>{referral.status}
                        </span>
                      </div>
                      <div className="p-3 space-y-2.5">
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <div className="text-[9px] font-bold uppercase text-gray-400">Organisation</div>
                            <div className="font-semibold text-slate-700 truncate">{isDoctorTab ? (referral.doctorOrganization || "N/A") : (referral.customerOrganization || "N/A")}</div>
                          </div>
                          {isDoctorTab ? (
                            <div>
                              <div className="text-[9px] font-bold uppercase text-gray-400">Specialization</div>
                              <div className="font-semibold text-slate-700 truncate">{referral.doctorSpecialization || "General"}</div>
                            </div>
                          ) : (
                            <div>
                              <div className="text-[9px] font-bold uppercase text-gray-400">Address</div>
                              <div className="font-semibold text-slate-700 truncate">{referral.customerAddress || "N/A"}</div>
                            </div>
                          )}
                        </div>
                        {isDoctorTab && referral.doctorAddress && (
                          <div className="text-[11px]">
                            <div className="text-[9px] font-bold uppercase text-gray-400">Address</div>
                            <div className="font-semibold text-slate-700 truncate">{referral.doctorAddress}</div>
                          </div>
                        )}

                        {services.length > 0 && (
                          <div className="pt-2 border-t border-gray-100">
                            <div className="bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] font-bold text-emerald-700 uppercase flex items-center gap-1">
                                  <FaServicestack className="text-[10px]" /> Services ({services.length})
                                </span>
                                <span className="text-xs font-extrabold text-emerald-900">
                                  ₹{services.reduce((s, x) => s + (Number(x.price) || 0), 0)}
                                </span>
                              </div>
                              <div className="space-y-0.5">
                                {services.map((svc, i) => (
                                  <div key={i} className="flex items-center justify-between text-[10px] text-emerald-800">
                                    <span className="truncate max-w-[120px]">• {svc.name}</span>
                                    <span className="font-bold">₹{svc.price}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 4 column grid for Clinic, Pharmacy, Lab, Fees */}
                        <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-gray-100">
                          <div className="text-center p-1.5 rounded-lg bg-blue-50 border border-blue-200">
                            <div className="text-[8px] font-bold text-blue-600 uppercase">Clinic</div>
                            <div className="text-[10px] font-extrabold text-blue-800">{formatCommission(referral.clinicCommission, referral.clinicCommissionType)}</div>
                          </div>
                          <div className="text-center p-1.5 rounded-lg bg-green-50 border border-green-200">
                            <div className="text-[8px] font-bold text-green-600 uppercase">Pharm</div>
                            <div className="text-[10px] font-extrabold text-green-800">{formatCommission(referral.pharmacyCommission, referral.pharmacyCommissionType)}</div>
                          </div>
                          <div className="text-center p-1.5 rounded-lg bg-purple-50 border border-purple-200">
                            <div className="text-[8px] font-bold text-purple-600 uppercase">Lab</div>
                            <div className="text-[10px] font-extrabold text-purple-800">{formatCommission(referral.labCommission, referral.labCommissionType)}</div>
                          </div>
                          <div className="text-center p-1.5 rounded-lg bg-amber-50 border border-amber-200">
                            <div className="text-[8px] font-bold text-amber-600 uppercase">Fees</div>
                            <div className="text-[10px] font-extrabold text-amber-800">{formatCommission(referral.feesCommission, referral.feesCommissionType)}</div>
                          </div>
                        </div>
                        {(referral.discountFees || referral.discountLab) && (
                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                            <div className="text-center p-1.5 rounded-lg bg-amber-50 border border-amber-200"><div className="text-[8px] font-bold text-amber-600 uppercase">Discount Fees</div><div className="text-xs font-extrabold text-amber-800">{formatDiscount(referral.discountFees, referral.discountFeesType) || "-"}</div></div>
                            <div className="text-center p-1.5 rounded-lg bg-amber-50 border border-amber-200"><div className="text-[8px] font-bold text-amber-600 uppercase">Discount Lab</div><div className="text-xs font-extrabold text-amber-800">{formatDiscount(referral.discountLab, referral.discountLabType) || "-"}</div></div>
                          </div>
                        )}
                        <div className="flex items-center justify-end text-[11px] pt-2 border-t border-gray-100">
                          <div className="text-slate-600 font-medium">{formatDate(referral.onboardDate || referral.referralDate || referral.createdAt)}</div>
                        </div>
                        <div className="flex items-center justify-center gap-1.5 pt-2 border-t border-gray-100 flex-wrap">
                          <button onClick={() => openOfferModal(referral)} className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg text-[10px] font-bold"><FiGift className="w-3.5 h-3.5" /> Offer</button>
                          <button onClick={() => { setSelectedReferral(referral); setShowDetailModal(true); }} className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-[10px] font-bold"><FiEye className="w-3.5 h-3.5" /> View</button>
                          <button onClick={() => handleEdit(referral)} className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-[10px] font-bold"><FiEdit2 className="w-3.5 h-3.5" /> Edit</button>
                          <button onClick={() => handleDelete(referral._id)} className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg text-[10px] font-bold"><FiTrash2 className="w-3.5 h-3.5" /> Delete</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* PAGINATION */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-200/50 bg-gray-50/30">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Show</span>
                    <select value={itemsPerPage} onChange={handleItemsPerPageChange} className="p-1 border border-gray-300 rounded-md bg-white text-gray-700">
                      <option value={5}>5</option><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option>
                    </select>
                    <span>entries</span>
                  </div>
                  <div className="text-xs text-gray-500 font-medium">Showing <strong className="text-gray-800">{filteredReferrals.length === 0 ? 0 : indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredReferrals.length)}</strong> of <strong className="text-gray-800">{filteredReferrals.length}</strong></div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className={`px-2.5 py-1 text-xs font-semibold border rounded-lg ${currentPage === 1 ? "text-gray-400 bg-gray-100 cursor-not-allowed" : "text-gray-700 bg-white hover:bg-gray-50"}`}>Prev</button>
                  {getPageNumbers().map((page, index) => (
                    <button key={index} onClick={() => (typeof page === "number" ? setCurrentPage(page) : null)} disabled={page === "..."} className={`px-3 py-1 text-xs font-semibold border rounded-lg min-w-[32px] ${page === "..." ? "text-gray-400 border-transparent" : currentPage === page ? "text-white bg-blue-600 border-blue-600" : "text-gray-700 bg-white hover:bg-gray-50 border-gray-300"}`}>{page}</button>
                  ))}
                  <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages || totalPages === 0} className={`px-2.5 py-1 text-xs font-semibold border rounded-lg ${currentPage === totalPages || totalPages === 0 ? "text-gray-400 bg-gray-100 cursor-not-allowed" : "text-gray-700 bg-white hover:bg-gray-50"}`}>Next</button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ==================== ADD/EDIT FORM MODAL ==================== */}
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-gray-200 relative max-h-[92vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${isDoctorTab ? "bg-purple-600" : "bg-indigo-600"} text-white flex items-center justify-center font-bold shadow-md`}>
                    {isDoctorTab ? <FaUserMd className="w-6 h-6" /> : <FaUserPlus className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{editingType === (isDoctorTab ? "doctor" : "customer") ? `Edit ${referrerLabel} Referral` : `Add ${referrerLabel} Referral`}</h3>
                    <p className="text-sm text-gray-500">Fill in the {referrerLabel.toLowerCase()} referral details below</p>
                  </div>
                </div>
                <button onClick={cancelForm} className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"><FaTimes className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-7 py-6">
                <div className="space-y-6">

                  {/* Basic Info */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 pb-2 border-b border-gray-100">
                      Basic Information
                    </h4>
                    {isDoctorTab ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Doctor Name <span className="text-purple-600">*</span></label>
                          <div className="relative">
                            <FaUserMd className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                            <input type="text" name="doctorName" value={formData.doctorName || ""} onChange={handleInputChange} placeholder="Dr. Jane Smith" className="w-full bg-white border border-gray-300 rounded-lg pl-11 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-medium" required />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Organisation Name <span className="text-purple-600">*</span></label>
                          <div className="relative">
                            <FaBuilding className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                            <input type="text" name="doctorOrganization" value={formData.doctorOrganization || ""} onChange={handleInputChange} placeholder="City Hospital" className="w-full bg-white border border-gray-300 rounded-lg pl-11 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-medium" required />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Phone Number</label>
                          <div className="relative">
                            <FaPhoneAlt className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                            <input type="tel" name="doctorPhone" value={formData.doctorPhone || ""} onChange={handleInputChange} placeholder="+91 9876543210" className="w-full bg-white border border-gray-300 rounded-lg pl-11 pr-3 py-2.5 text-sm focus:outline-none font-medium" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Specialization</label>
                          <div className="relative">
                            <FaAward className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                            <input type="text" name="doctorSpecialization" value={formData.doctorSpecialization || ""} onChange={handleInputChange} placeholder="Cardiologist" className="w-full bg-white border border-gray-300 rounded-lg pl-11 pr-3 py-2.5 text-sm focus:outline-none font-medium" />
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Address</label>
                          <div className="relative">
                            <FaMapMarkerAlt className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                            <input type="text" name="doctorAddress" value={formData.doctorAddress || ""} onChange={handleInputChange} placeholder="Clinic/Hospital full address" className="w-full bg-white border border-gray-300 rounded-lg pl-11 pr-3 py-2.5 text-sm focus:outline-none font-medium" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Customer Name <span className="text-indigo-600">*</span></label>
                          <div className="relative">
                            <FaUser className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                            <input type="text" name="customerName" value={formData.customerName || ""} onChange={handleInputChange} placeholder="John Doe" className="w-full bg-white border border-gray-300 rounded-lg pl-11 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium" required />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Organisation Name</label>
                          <div className="relative">
                            <FaBuilding className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                            <input type="text" name="customerOrganization" value={formData.customerOrganization || ""} onChange={handleInputChange} placeholder="Organisation" className="w-full bg-white border border-gray-300 rounded-lg pl-11 pr-3 py-2.5 text-sm focus:outline-none font-medium" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Phone Number <span className="text-indigo-600">*</span></label>
                          <div className="relative">
                            <FaPhoneAlt className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                            <input type="tel" name="customerPhone" value={formData.customerPhone || ""} onChange={handleInputChange} placeholder="+91 9876543210" className="w-full bg-white border border-gray-300 rounded-lg pl-11 pr-3 py-2.5 text-sm focus:outline-none font-medium" required />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Address</label>
                          <div className="relative">
                            <FaMapMarkerAlt className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                            <input type="text" name="customerAddress" value={formData.customerAddress || ""} onChange={handleInputChange} placeholder="Customer's address" className="w-full bg-white border border-gray-300 rounded-lg pl-11 pr-3 py-2.5 text-sm focus:outline-none font-medium" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ✅ Consultant Fee — 4 fields in one row (Clinic, Pharmacy, Lab, Fees) */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 pb-2 border-b border-gray-100">
                      Consultant Fee
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {COMMISSION_FIELDS.map((field) => {
                        const Icon = field.icon;
                        const borderColor = {
                          blue: "border-blue-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20",
                          green: "border-green-300 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/20",
                          purple: "border-purple-300 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20",
                          amber: "border-amber-300 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20"
                        }[field.color];
                        const selectColor = {
                          blue: "bg-blue-50 text-blue-800 border-blue-300",
                          green: "bg-green-50 text-green-800 border-green-300",
                          purple: "bg-purple-50 text-purple-800 border-purple-300",
                          amber: "bg-amber-50 text-amber-800 border-amber-300"
                        }[field.color];
                        const labelColor = {
                          blue: "text-blue-700",
                          green: "text-green-700",
                          purple: "text-purple-700",
                          amber: "text-amber-700"
                        }[field.color];

                        return (
                          <div key={field.key}>
                            <label className={`block text-[10px] font-bold mb-1.5 flex items-center gap-1 ${labelColor} uppercase tracking-wider`}>
                              <Icon className="text-[11px]" />
                              {field.label}
                            </label>
                            <div className={`flex items-stretch w-full bg-white border rounded-lg overflow-hidden ${borderColor}`}>
                              <input
                                type="number"
                                name={field.key}
                                value={formData[field.key] || ""}
                                onChange={handleInputChange}
                                placeholder="0"
                                min="0"
                                className="flex-1 min-w-0 px-2.5 py-2.5 text-sm font-semibold bg-transparent focus:outline-none"
                                style={{ border: "none" }}
                              />
                              <div className={`w-[48px] shrink-0 flex items-center justify-center border-l ${selectColor}`}>
                                <select
                                  name={field.typeKey}
                                  value={formData[field.typeKey] || "%"}
                                  onChange={handleInputChange}
                                  className="w-full h-full bg-transparent border-0 text-xs font-bold text-center cursor-pointer focus:outline-none"
                                  style={{ appearance: "none", WebkitAppearance: "none", MozAppearance: "none", textAlignLast: "center", padding: 0 }}
                                >
                                  {COMMISSION_TYPE_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                   
                  </div>

                  {/* Services Section */}
                  <div className="border rounded-xl p-5 bg-emerald-50/40 border-emerald-200">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-emerald-200">
                      <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-2">
                        <FaServicestack className="text-emerald-600 w-4 h-4" /> Services
                      </label>
                      {formData.services?.length > 0 && (
                        <span className="text-xs font-extrabold text-emerald-800">
                          Total: ₹{getServicesTotal()}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <div className="flex-1 min-w-[160px]">
                        <input
                          type="text"
                          value={formService.name}
                          onChange={(e) => setFormService((p) => ({ ...p, name: e.target.value }))}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddService(); } }}
                          placeholder="Service name (e.g. Consultation)"
                          className="w-full bg-white border border-emerald-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                        />
                      </div>
                      <div className="w-28 relative">
                        <FaRupeeSign className="w-3.5 h-3.5 text-emerald-500 absolute left-3 top-3" />
                        <input
                          type="number"
                          value={formService.price}
                          onChange={(e) => setFormService((p) => ({ ...p, price: e.target.value }))}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddService(); } }}
                          placeholder="0"
                          min="0"
                          className="w-full bg-white border border-emerald-300 rounded-lg pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-semibold"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddService}
                        disabled={!formService.name.trim() || !formService.price}
                        className="px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                      >
                        <FaPlusCircle className="w-3 h-3" /> Add
                      </button>
                    </div>

                    {formData.services?.length > 0 ? (
                      <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                        {formData.services.map((svc, i) => (
                          <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs bg-white border border-emerald-200">
                            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                              {i + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-gray-800 truncate">{svc.name}</div>
                            </div>
                            <div className="w-24 relative">
                              <FaRupeeSign className="w-3 h-3 text-emerald-500 absolute left-2.5 top-2" />
                              <input
                                type="number"
                                value={svc.price}
                                onChange={(e) => handleUpdateServicePrice(i, e.target.value)}
                                className="w-full px-2 pl-7 py-1 text-xs font-bold text-emerald-700 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                min="0"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveService(i)}
                              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                              title="Remove"
                            >
                              <FaMinusCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-[11px] text-emerald-600 bg-white/50 rounded-lg border border-dashed border-emerald-300">
                        No services added yet — add service name & price above
                      </div>
                    )}
                  </div>

                  {/* Additional Details */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 pb-2 border-b border-gray-100">
                      Additional Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Onboard Date</label>
                        <div className="relative">
                          <FaCalendarAlt className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                          <input type="date" name="onboardDate" value={formData.onboardDate || ""} onChange={handleInputChange} className="w-full bg-white border border-gray-300 rounded-lg pl-11 pr-3 py-2.5 text-sm focus:outline-none font-medium" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Status</label>
                        <select name="status" value={formData.status || "active"} onChange={handleInputChange} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none font-medium">
                          {STATUS_OPTIONS.map((status) => (<option key={status} value={status} className="capitalize">{status}</option>))}
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Notes</label>
                        <textarea name="referralNotes" value={formData.referralNotes || ""} onChange={handleInputChange} rows="2" placeholder="Add any additional notes..." className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none font-medium resize-none" />
                      </div>
                    </div>
                  </div>

                  {/* Special Offers (Discount) */}
                  <div className="border rounded-xl p-5 bg-amber-50/40 border-amber-200">
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-2">
                        <FiGift className="text-amber-600 w-4 h-4" /> Special Offers (Discount)
                      </label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1.5">Fees Discount</label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <FiPercent className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                            <input
                              type="number"
                              name="discountFees"
                              value={formData.discountFees || ""}
                              onChange={handleInputChange}
                              placeholder="0"
                              min="0"
                              className="w-full bg-white border border-amber-300 rounded-lg pl-11 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-medium"
                            />
                          </div>
                          <select
                            name="discountFeesType"
                            value={formData.discountFeesType || "%"}
                            onChange={handleInputChange}
                            className="w-[70px] bg-white border border-amber-300 rounded-lg px-2 py-2.5 text-sm font-bold text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                          >
                            {DISCOUNT_UNIT_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1.5">Lab Discount</label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <FaFlask className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                            <input
                              type="number"
                              name="discountLab"
                              value={formData.discountLab || ""}
                              onChange={handleInputChange}
                              placeholder="0"
                              min="0"
                              className="w-full bg-white border border-amber-300 rounded-lg pl-11 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-medium"
                            />
                          </div>
                          <select
                            name="discountLabType"
                            value={formData.discountLabType || "%"}
                            onChange={handleInputChange}
                            className="w-[70px] bg-white border border-amber-300 rounded-lg px-2 py-2.5 text-sm font-bold text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                          >
                            {DISCOUNT_UNIT_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {(formData.discountFees || formData.discountLab) && (
                      <div className="mt-3 p-3 bg-white rounded-lg border border-amber-200 flex items-center justify-between">
                        <span className="text-sm font-semibold text-amber-800 flex items-center gap-1.5"><FiGift className="w-4 h-4" />Discount Applied</span>
                        <span className="text-base font-extrabold text-amber-900">
                          {formData.discountFees ? `Fees: ${formatDiscount(formData.discountFees, formData.discountFeesType)}` : ""}
                          {formData.discountFees && formData.discountLab ? " • " : ""}
                          {formData.discountLab ? `Lab: ${formatDiscount(formData.discountLab, formData.discountLabType)}` : ""}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </form>

              <div className="flex items-center justify-end gap-3 px-7 py-4 border-t border-gray-100 bg-gray-50">
                <button type="button" onClick={cancelForm} className="px-5 py-2.5 rounded-lg text-sm font-bold bg-white hover:bg-gray-100 text-gray-700 border border-gray-300">Cancel</button>
                <button type="submit" onClick={handleSubmit} disabled={submitting} className={`px-6 py-2.5 rounded-lg text-sm font-bold ${addButtonBg} text-white shadow-sm flex items-center gap-2 disabled:opacity-50`}>
                  {submitting ? <FiRefreshCw className="w-4 h-4 animate-spin" /> : editingType === (isDoctorTab ? "doctor" : "customer") ? <FiCheckCircle className="w-4 h-4" /> : (isDoctorTab ? <FaUserMd className="w-4 h-4" /> : <FaUserPlus className="w-4 h-4" />)}
                  {editingType === (isDoctorTab ? "doctor" : "customer") ? `Update ${referrerLabel}` : `Add ${referrerLabel}`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DETAIL MODAL */}
        {showDetailModal && selectedReferral && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold"><FaShareAlt className="w-5 h-5" /></div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{referrerLabel} Referral Details</h3>
                    <p className="text-xs text-gray-500">ID: {selectedReferral._id}</p>
                  </div>
                </div>
                <button onClick={() => { setShowDetailModal(false); setSelectedReferral(null); }} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"><FaTimes className="w-4 h-4" /></button>
              </div>
              <div className="my-5 bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-4">
                <div className="flex items-center gap-3.5 pb-3 border-b border-gray-200">
                  <div className={`w-12 h-12 rounded-full ${avatarBg} text-white font-bold text-lg flex items-center justify-center flex-shrink-0`}>
                    {(isDoctorTab ? selectedReferral.doctorName : selectedReferral.customerName)?.charAt(0).toUpperCase() || (isDoctorTab ? "D" : "C")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-base font-bold text-gray-900 truncate">{isDoctorTab ? selectedReferral.doctorName : selectedReferral.customerName}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {isDoctorTab ? `${selectedReferral.doctorOrganization || "N/A"} • ${selectedReferral.doctorPhone || "N/A"}` : `${selectedReferral.customerPhone || "N/A"}`}
                    </div>
                  </div>
                </div>

                {(selectedReferral.doctorAddress || selectedReferral.customerAddress) && (
                  <div>
                    <div className="text-[10px] font-bold uppercase text-gray-400">Address</div>
                    <div className="text-xs font-medium text-gray-700 mt-0.5">{isDoctorTab ? selectedReferral.doctorAddress : selectedReferral.customerAddress}</div>
                  </div>
                )}

                {isDoctorTab && selectedReferral.doctorSpecialization && (
                  <div>
                    <div className="text-[10px] font-bold uppercase text-gray-400">Specialization</div>
                    <div className="text-xs font-medium text-gray-700 mt-0.5">{selectedReferral.doctorSpecialization}</div>
                  </div>
                )}

                <div className="pt-2 border-t border-gray-200">
                  <div className="text-[10px] font-bold uppercase text-gray-400">Consultant Fee</div>
                  <div className="grid grid-cols-4 gap-2 mt-1">
                    <div className="bg-blue-50 p-2 rounded-lg text-center border border-blue-100">
                      <div className="text-[9px] text-blue-600 font-bold">Clinic</div>
                      <div className="text-xs font-extrabold text-blue-900">{formatCommission(selectedReferral.clinicCommission, selectedReferral.clinicCommissionType)}</div>
                    </div>
                    <div className="bg-green-50 p-2 rounded-lg text-center border border-green-100">
                      <div className="text-[9px] text-green-600 font-bold">Pharmacy</div>
                      <div className="text-xs font-extrabold text-green-900">{formatCommission(selectedReferral.pharmacyCommission, selectedReferral.pharmacyCommissionType)}</div>
                    </div>
                    <div className="bg-purple-50 p-2 rounded-lg text-center border border-purple-100">
                      <div className="text-[9px] text-purple-600 font-bold">Lab</div>
                      <div className="text-xs font-extrabold text-purple-900">{formatCommission(selectedReferral.labCommission, selectedReferral.labCommissionType)}</div>
                    </div>
                    <div className="bg-amber-50 p-2 rounded-lg text-center border border-amber-100">
                      <div className="text-[9px] text-amber-600 font-bold">Fees</div>
                      <div className="text-xs font-extrabold text-amber-900">{formatCommission(selectedReferral.feesCommission, selectedReferral.feesCommissionType)}</div>
                    </div>
                  </div>
                </div>

                {selectedReferral.services?.length > 0 && (
                  <div className="pt-2 border-t border-gray-200">
                    <div className="text-[10px] font-bold uppercase text-gray-400">Services ({selectedReferral.services.length})</div>
                    <div className="mt-1 space-y-1">
                      {selectedReferral.services.map((s, i) => (
                        <div key={i} className="flex items-center justify-between bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                          <span className="text-xs font-semibold text-emerald-800 truncate max-w-[200px]">• {s.name}</span>
                          <span className="text-xs font-extrabold text-emerald-900">₹{s.price}</span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between pt-1 px-3">
                        <span className="text-[10px] font-bold text-emerald-700 uppercase">Total</span>
                        <span className="text-sm font-extrabold text-emerald-900">
                          ₹{selectedReferral.services.reduce((s, x) => s + (Number(x.price) || 0), 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {(selectedReferral.discountFees || selectedReferral.discountLab) && (
                  <div className="pt-2 border-t border-gray-200">
                    <div className="text-[10px] font-bold uppercase text-gray-400">Special Offers (Discount)</div>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {selectedReferral.discountFees && <div className="bg-amber-50 p-2 rounded-lg text-center border border-amber-100"><div className="text-[9px] text-amber-700 font-bold">Fees</div><div className="text-sm font-extrabold text-amber-900">{formatDiscount(selectedReferral.discountFees, selectedReferral.discountFeesType)}</div></div>}
                      {selectedReferral.discountLab && <div className="bg-amber-50 p-2 rounded-lg text-center border border-amber-100"><div className="text-[9px] text-amber-700 font-bold">Lab</div><div className="text-sm font-extrabold text-amber-900">{formatDiscount(selectedReferral.discountLab, selectedReferral.discountLabType)}</div></div>}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-gray-200">
                  <div className="text-[10px] font-bold uppercase text-gray-400">OP Metrics</div>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div className="bg-indigo-50 p-2 rounded-lg text-center border border-indigo-100"><div className="text-[9px] text-indigo-600 font-bold">OP Count</div><div className="text-sm font-extrabold text-indigo-900">{getReferralMetrics(selectedReferral).opCount}</div></div>
                    <div className="bg-emerald-50 p-2 rounded-lg text-center border border-emerald-100"><div className="text-[9px] text-emerald-600 font-bold">Revenue</div><div className="text-sm font-extrabold text-emerald-900">₹{getReferralMetrics(selectedReferral).revenue.toLocaleString()}</div></div>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <div className="text-[10px] font-bold uppercase text-gray-400">Onboard Date</div>
                  <div className="text-xs font-medium text-gray-700 mt-0.5">{formatDate(selectedReferral.onboardDate || selectedReferral.referralDate || selectedReferral.createdAt)}</div>
                </div>

                {selectedReferral.referralNotes && (
                  <div className="pt-2 border-t border-gray-200">
                    <div className="text-[10px] font-bold uppercase text-gray-400">Notes</div>
                    <div className="text-xs font-medium text-gray-700 mt-0.5 p-2 bg-white rounded-lg border border-gray-200">{selectedReferral.referralNotes}</div>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-end gap-2.5 mt-4">
                <button onClick={() => window.print()} className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center gap-1.5"><FaPrint className="w-3.5 h-3.5" /> Print</button>
                <button onClick={() => { const ref = selectedReferral; setShowDetailModal(false); handleEdit(ref); }} className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 flex items-center gap-1.5"><FiEdit2 className="w-3.5 h-3.5" /> Edit</button>
                <button onClick={() => { setShowDetailModal(false); setSelectedReferral(null); }} className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white">Close</button>
              </div>
            </div>
          </div>
        )}

        {/* OFFER MODAL */}
        {showOfferModal && selectedOfferReferral && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold"><FiGift className="w-5 h-5" /></div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{editingOfferId ? "Edit Offer" : "Add Offer"}</h3>
                    <p className="text-xs text-gray-500 truncate max-w-[200px]">{isDoctorTab ? selectedOfferReferral.doctorName : selectedOfferReferral.customerName}</p>
                  </div>
                </div>
                <button onClick={closeOfferModal} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"><FaTimes className="w-4 h-4" /></button>
              </div>
              <form onSubmit={handleOfferSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">Offer Name <span className="text-amber-600">*</span></label>
                  <div className="relative">
                    <FiGift className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                    <input type="text" name="offerName" value={offerForm.offerName} onChange={handleOfferInputChange} placeholder="e.g. Consultation Discount" className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-medium" required />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">Amount (₹) <span className="text-amber-600">*</span></label>
                  <div className="relative">
                    <FaRupeeSign className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                    <input type="number" name="amount" value={offerForm.amount} onChange={handleOfferInputChange} placeholder="150" min="0" className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-medium" required />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={closeOfferModal} className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700">Cancel</button>
                  <button type="submit" disabled={offerSubmitting} className="px-5 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1.5 disabled:opacity-50">
                    {offerSubmitting ? <FiRefreshCw className="w-3.5 h-3.5 animate-spin" /> : editingOfferId ? <FiCheckCircle className="w-3.5 h-3.5" /> : <FiPlus className="w-3.5 h-3.5" />}
                    {editingOfferId ? "Update Offer" : "Add Offer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}