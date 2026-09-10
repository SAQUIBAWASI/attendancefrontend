// CustomerReferralOP.js — All Customers + Their Referred OP Bookings
import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import {
  FaUserMd, FaUserInjured, FaSearch, FaCalendarAlt, FaClock,
  FaTimes, FaPhoneAlt, FaRupeeSign, FaPrint, FaCheckCircle,
  FaTimesCircle, FaFileInvoiceDollar, FaEye, FaEdit, FaTrashAlt,
  FaBuilding, FaAward, FaUsers, FaShareAlt, FaUserFriends,
  FaPrescription, FaFilePdf, FaSyncAlt, FaPills, FaFlask, FaClinicMedical,
  FaUser, FaMapMarkerAlt, FaUserCheck
} from "react-icons/fa";
import {
  FiUsers, FiUserCheck, FiClock, FiFilter, FiDownload, FiTrash2,
  FiPlus, FiEdit2, FiEye, FiRefreshCw, FiCheckCircle, FiXCircle,
  FiCalendar, FiChevronDown, FiAlertCircle, FiAward, FiUser
} from "react-icons/fi";
import "./EmployeeDashboard.css";
import "./EmployeeLeaves.css";
import logo from "../Images/Timelyhealth logo.png";
import prescriptionTemplate from "../Images/prescription.jpg";
import prescriptionBackTemplate from "../Images/prescriptionbackside.jpg";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:5001/api";
const REFERRAL_API = `${API_BASE_URL}/referralcontacts`;
const BOOKINGS_API = `${API_BASE_URL}/appointment-slots`;

const CLINIC_INFO = {
  name: "TimelyHealth",
  address:
    "Flat No: 301, 3rd Floor, Sri Sai Balaji Avenue, H. No: 1-98/9/25/p, Opp Style on Studio, VIP Hills, near Bank of Baroda, Arunodaya Colony, Sri Sai Nagar, Madhapur, Hyderabad, Telangana 500081",
  contact: "9505397000"
};

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

const formatDateToDDMMYYYY = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "N/A";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}/${d.getFullYear()}`;
  } catch { return "N/A"; }
};

const formatDateTimeToDDMMYYYY = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "N/A";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${d.getFullYear()} ${hh}:${mm}`;
  } catch { return "N/A"; }
};

const getStatusColors = (status) => {
  const map = {
    booked: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
    completed: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
    consulting: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
    cancelled: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
    pending: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" },
    confirmed: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" }
  };
  return map[status?.toLowerCase()] || map.booked;
};

const getPaymentStatusColors = (status) => {
  const map = {
    Paid: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: FaCheckCircle, iconColor: "text-emerald-600" },
    Partial: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: FaClock, iconColor: "text-amber-600" },
    Pending: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", icon: FaClock, iconColor: "text-gray-500" },
    Due: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: FaTimesCircle, iconColor: "text-red-500" }
  };
  return map[status] || map.Pending;
};

const getBookingServices = (booking) => {
  if (!booking) return [];
  const fromServiceItems = Array.isArray(booking.serviceItems) && booking.serviceItems.length > 0 ? booking.serviceItems : null;
  const fromServices = Array.isArray(booking.services) && booking.services.length > 0 ? booking.services : null;
  const arr = fromServiceItems || fromServices || [];
  return arr.map((s) => ({
    serviceId: s.serviceId || s._id || "",
    _id: s.serviceId || s._id || "",
    name: s.name || "Service",
    price: Number(s.price) || 0,
    description: s.description || "",
    paymentStatus: s.paymentStatus || booking.paymentStatus || "Pending",
    category: s.category || s.serviceCategory || s.type || "",
  }));
};

const getBookingFinalPayable = (booking) => {
  if (!booking) return 0;
  const final =
    Number(booking.finalPayable) ||
    Number(booking.finalPayableAmount) ||
    Number(booking.grandTotal) ||
    Number(booking.totalAmount) ||
    0;
  if (final > 0) return final;
  const items = getBookingServices(booking);
  const subtotal = items.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
  const commission = Number(booking.commissionAmount) || 0;
  return subtotal - commission;
};

const getBookingPaidInfo = (booking) => {
  if (!booking) return { final: 0, paid: 0, balance: 0, status: "Pending" };
  const final = getBookingFinalPayable(booking);
  const status = booking.paymentStatus || "Pending";
  let paid = Number(booking.amountPaid) || 0;
  if (status === "Paid") paid = final;
  else if (status === "Pending" || status === "Due") paid = 0;
  const balance = Math.max(0, final - paid);
  return { final, paid, balance, status };
};

// ✅ Customer payable calculation — same logic as doctor
const getCustomerPayable = (customer, booking) => {
  if (!customer || !booking) return 0;
  const services = getBookingServices(booking);
  if (!services || services.length === 0) return 0;

  const clinicP = parseFloat(customer.clinicCommission) || 0;
  const pharmacyP = parseFloat(customer.pharmacyCommission) || 0;
  const labP = parseFloat(customer.labCommission) || 0;

  let total = 0;
  services.forEach((svc) => {
    const price = Number(svc.price) || 0;
    const cat = (svc.category || svc.serviceCategory || svc.type || "clinic").toString().toLowerCase();
    let pct = clinicP;
    if (cat.includes("pharm") || cat.includes("medic")) pct = pharmacyP;
    else if (cat.includes("lab") || cat.includes("test") || cat.includes("diagnos")) pct = labP;
    else pct = clinicP;
    total += (price * pct) / 100;
  });

  return Math.round(total);
};

const getCustomerPayableBreakdown = (customer, booking) => {
  if (!customer || !booking) return { total: 0, items: [] };
  const services = getBookingServices(booking);
  if (!services || services.length === 0) return { total: 0, items: [] };

  const clinicP = parseFloat(customer.clinicCommission) || 0;
  const pharmacyP = parseFloat(customer.pharmacyCommission) || 0;
  const labP = parseFloat(customer.labCommission) || 0;

  let total = 0;
  const items = services.map((svc) => {
    const price = Number(svc.price) || 0;
    const cat = (svc.category || svc.serviceCategory || svc.type || "clinic").toString().toLowerCase();
    let category = "clinic";
    let pct = clinicP;
    if (cat.includes("pharm") || cat.includes("medic")) { category = "pharmacy"; pct = pharmacyP; }
    else if (cat.includes("lab") || cat.includes("test") || cat.includes("diagnos")) { category = "lab"; pct = labP; }
    else { category = "clinic"; pct = clinicP; }
    const payable = (price * pct) / 100;
    total += payable;
    return { name: svc.name, price, category, percent: pct, payable: Math.round(payable) };
  });

  return { total: Math.round(total), items };
};

const getAppliedCategories = (customer, booking) => {
  if (!customer || !booking) return [];
  const services = getBookingServices(booking);
  if (!services || services.length === 0) return [];

  const applied = new Set();
  services.forEach((svc) => {
    const cat = (svc.category || svc.serviceCategory || svc.type || "clinic").toString().toLowerCase();
    if (cat.includes("pharm") || cat.includes("medic")) applied.add("pharmacy");
    else if (cat.includes("lab") || cat.includes("test") || cat.includes("diagnos")) applied.add("lab");
    else applied.add("clinic");
  });

  return Array.from(applied);
};

const numberToWords = (num) => {
  if (num === 0) return "Zero";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const convert = (n) => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + convert(n % 100) : "");
    if (n < 100000) return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + convert(n % 1000) : "");
    if (n < 10000000) return convert(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + convert(n % 100000) : "");
    return convert(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + convert(n % 10000000) : "");
  };
  return convert(num) + " Rupees Only";
};

export default function CustomerReferralOP() {
  const navigate = useNavigate();

  const [referrals, setReferrals] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [customerFilter, setCustomerFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [activeCardFilter, setActiveCardFilter] = useState("all");

  const [toast, setToast] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    const saved = localStorage.getItem("customerReferralOP_itemsPerPage");
    return saved ? parseInt(saved, 10) : 10;
  });

  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedBookingForPrescription, setSelectedBookingForPrescription] = useState(null);
  const prescriptionRef = useRef(null);

  const [showBillingModal, setShowBillingModal] = useState(false);
  const [selectedBookingForBilling, setSelectedBookingForBilling] = useState(null);
  const [billingData, setBillingData] = useState({
    invoiceNo: "", invoiceDate: "", receiptNo: "", receiptDate: "",
    paymentMode: "Cash", receivedBy: "Front Desk", branch: "", doctorName: "",
    items: [], grossAmount: 0, netAmount: 0, paidAmount: 0, balanceAmount: 0,
    paymentStatus: "Pending", amountInWords: ""
  });

  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedBookingForCustomerModal, setSelectedBookingForCustomerModal] = useState(null);

  const [showCustomerPaymentModal, setShowCustomerPaymentModal] = useState(false);
  const [selectedBookingForCustomerPayment, setSelectedBookingForCustomerPayment] = useState(null);
  const [selectedCustomerForPayment, setSelectedCustomerForPayment] = useState(null);
  const [newCustomerPaymentStatus, setNewCustomerPaymentStatus] = useState("Pending");
  const [savingCustomerPayment, setSavingCustomerPayment] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const refRes = await axios.get(`${REFERRAL_API}/getallreferralcontacts`);
      let allReferrals = [];
      if (refRes.data?.success) allReferrals = refRes.data.data || [];
      else if (Array.isArray(refRes.data)) allReferrals = refRes.data;
      const customerReferrals = allReferrals.filter((r) => r.referralType === "customer");
      setReferrals(customerReferrals);

      const bookRes = await axios.get(`${BOOKINGS_API}/getallreferralbookings`);
      if (bookRes.data?.success) {
        setBookings(bookRes.data.bookings || []);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error("Error fetching customer referral OP data:", err);
      showToast(err.response?.data?.message || "Failed to load data", "error");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const getBookingsForReferral = (referral) => {
    if (!referral) return [];
    const refId = String(referral._id || "");
    const refName = (referral.customerName || "").trim().toLowerCase();

    return bookings.filter((b) => {
      const cId = extractId(b.referralContactId);
      const cuId = extractId(b.referralCustomerId);
      const dId = extractId(b.referralDoctorId);

      if (cId && cId === refId) return true;
      if (cuId && cuId === refId) return true;
      if (dId && dId === refId) return true;

      const refCustomerName = (extractName(b.referralCustomerId) || "").trim().toLowerCase();
      const refDoctorName = (extractName(b.referralDoctorId) || b.referredByDoctor || "").trim().toLowerCase();
      const referredBy = (b.referredBy || "").trim().toLowerCase();

      if (refName && (refCustomerName === refName || refDoctorName === refName || referredBy === refName)) {
        return true;
      }

      return false;
    });
  };

  const buildFlatRows = () => {
    const rows = [];
    referrals.forEach((ref) => {
      const refBookings = getBookingsForReferral(ref);
      if (refBookings.length === 0) {
        rows.push({ customer: ref, booking: null });
      } else {
        refBookings.forEach((b) => {
          rows.push({ customer: ref, booking: b });
        });
      }
    });
    return rows;
  };

  const flatRows = useMemo(() => buildFlatRows(), [referrals, bookings]);

  const uniqueCustomers = useMemo(() => {
    const map = new Map();
    referrals.forEach((r) => {
      if (r.customerName) map.set(r._id, r.customerName);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [referrals]);

  const filteredRows = useMemo(() => {
    return flatRows.filter(({ customer, booking }) => {
      if (customerFilter !== "All" && customer._id !== customerFilter) return false;

      if (!booking) {
        if (statusFilter !== "All") return false;
        if (fromDate || toDate || selectedMonth) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const m =
            (customer.customerName || "").toLowerCase().includes(q) ||
            (customer.customerAddress || "").toLowerCase().includes(q) ||
            (customer.customerPhone || "").toLowerCase().includes(q);
          if (!m) return false;
        }
        return true;
      }

      if (statusFilter !== "All" && booking.paymentStatus !== statusFilter) return false;

      if (selectedMonth && selectedMonth !== "") {
        const d = new Date(booking.createdAt || booking.bookedAt);
        const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (m !== selectedMonth) return false;
      }

      if (fromDate && toDate) {
        const d = new Date(booking.createdAt || booking.bookedAt);
        const f = new Date(fromDate); f.setHours(0, 0, 0, 0);
        const t = new Date(toDate); t.setHours(23, 59, 59, 999);
        if (d < f || d > t) return false;
      } else if (fromDate) {
        const d = new Date(booking.createdAt || booking.bookedAt);
        const f = new Date(fromDate); f.setHours(0, 0, 0, 0);
        const t = new Date(fromDate); t.setHours(23, 59, 59, 999);
        if (d < f || d > t) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const m =
          (booking.patientName || "").toLowerCase().includes(q) ||
          (booking.patientPhone || "").toLowerCase().includes(q) ||
          (customer.customerName || "").toLowerCase().includes(q) ||
          (customer.customerAddress || "").toLowerCase().includes(q) ||
          (customer.customerPhone || "").toLowerCase().includes(q);
        if (!m) return false;
      }

      return true;
    });
  }, [flatRows, customerFilter, statusFilter, searchQuery, fromDate, toDate, selectedMonth]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter, customerFilter, fromDate, toDate, selectedMonth]);

  const stats = useMemo(() => {
    const totalCustomers = referrals.length;
    const totalBookings = bookings.length;

    let payableTotal = 0;
    let paidCount = 0, partialCount = 0, pendingCount = 0, dueCount = 0;

    bookings.forEach((b) => {
      const st = b.paymentStatus || "Pending";
      if (st === "Paid") paidCount++;
      else if (st === "Partial") partialCount++;
      else if (st === "Due") dueCount++;
      else pendingCount++;
    });

    flatRows.forEach(({ customer, booking }) => {
      if (customer && booking) {
        payableTotal += getCustomerPayable(customer, booking);
      }
    });

    return {
      totalCustomers,
      totalBookings,
      paidCount,
      partialCount,
      pendingCount,
      dueCount,
      totalPayable: payableTotal
    };
  }, [referrals, bookings, flatRows]);

  const handleCardClick = (type) => {
    setActiveCardFilter(type);
    setCurrentPage(1);
    if (type === "all") setStatusFilter("All");
    else setStatusFilter(type);
  };

  const clearFilters = () => {
    setSearchQuery(""); setStatusFilter("All"); setCustomerFilter("All");
    setFromDate(""); setToDate(""); setSelectedMonth("");
    setActiveCardFilter("all"); setCurrentPage(1);
    if (window.innerWidth < 1024) setShowMobileFilters(false);
  };

  const hasActiveFilters =
    searchQuery !== "" || statusFilter !== "All" || customerFilter !== "All" ||
    fromDate !== "" || toDate !== "" || (selectedMonth && selectedMonth !== "");

  const totalPages = Math.ceil(filteredRows.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRows = filteredRows.slice(indexOfFirstItem, indexOfLastItem);

  const handleItemsPerPageChange = (e) => {
    const v = Number(e.target.value);
    setItemsPerPage(v);
    localStorage.setItem("customerReferralOP_itemsPerPage", String(v));
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) pages.push(i);
      else if (i === currentPage - 3 || i === currentPage + 3) pages.push("...");
    }
    return pages;
  };

  const downloadCSV = () => {
    if (!filteredRows.length) { alert("No records available to export!"); return; }
    const headers = [
      "#", "Customer Name", "Customer Phone", "Customer Address",
      "Clinic %", "Pharmacy %", "Lab %",
      "Patient", "Phone", "Appt. Date", "Slot Timing",
      "Services", "Applied On", "Total", "Payment Status", "Customer Payable", "Customer Payment Status",
      "Payment Mode", "Created At"
    ];
    const csvRows = [headers.join(","), ...filteredRows.map((row, idx) => {
      const { customer, booking } = row;
      if (!booking) {
        return [
          idx + 1,
          `"${(customer.customerName || "").replace(/"/g, '""')}"`,
          `"${customer.customerPhone || ""}"`,
          `"${(customer.customerAddress || "").replace(/"/g, '""')}"`,
          `"${customer.clinicCommission || 0}"`,
          `"${customer.pharmacyCommission || 0}"`,
          `"${customer.labCommission || 0}"`,
          `"-"`, `"-"`, `"-"`, `"-"`,
          `"-"`, `"-"`, 0, `"-"`, 0, `"${customer.customerPaymentStatus || "Pending"}"`, `"-"`, `"-"`
        ].join(",");
      }
      const info = getBookingPaidInfo(booking);
      const services = getBookingServices(booking);
      const customerPayable = getCustomerPayable(customer, booking);
      const appliedCats = getAppliedCategories(customer, booking);
      return [
        idx + 1,
        `"${(customer.customerName || "").replace(/"/g, '""')}"`,
        `"${customer.customerPhone || ""}"`,
        `"${(customer.customerAddress || "").replace(/"/g, '""')}"`,
        `"${customer.clinicCommission || 0}"`,
        `"${customer.pharmacyCommission || 0}"`,
        `"${customer.labCommission || 0}"`,
        `"${(booking.patientTitle || "")} ${(booking.patientName || "").replace(/"/g, '""')}"`,
        `"${booking.patientPhone || ""}"`,
        `"${formatDateToDDMMYYYY(booking.appointmentDate || booking.date)}"`,
        `"${booking.startTime || ""} - ${booking.endTime || ""}"`,
        `"${services.map((s) => s.name).join("; ")}"`,
        `"${appliedCats.join(", ")}"`,
        info.final,
        `"${booking.paymentStatus || "Pending"}"`,
        customerPayable,
        `"${booking.customerPaymentStatus || "Pending"}"`,
        `"${booking.paymentType || "cash"}"`,
        `"${formatDateTimeToDDMMYYYY(booking.createdAt)}"`
      ].join(",");
    })];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Customer_Referral_OP_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filteredRows.length} records!`);
  };

  const openCustomerPaymentModal = (customer, booking) => {
    setSelectedCustomerForPayment(customer);
    setSelectedBookingForCustomerPayment(booking);
    setNewCustomerPaymentStatus(booking?.customerPaymentStatus || "Pending");
    setShowCustomerPaymentModal(true);
  };

  const handleSaveCustomerPaymentStatus = async () => {
    if (!selectedBookingForCustomerPayment) {
      showToast("No booking selected", "error");
      return;
    }
    setSavingCustomerPayment(true);
    try {
      const res = await axios.put(
        `${BOOKINGS_API}/updatecustomerpayment/${selectedBookingForCustomerPayment._id}`,
        { customerPaymentStatus: newCustomerPaymentStatus }
      );
      if (res.data?.success || res.status === 200) {
        setBookings((prev) =>
          prev.map((b) =>
            b._id === selectedBookingForCustomerPayment._id
              ? { ...b, customerPaymentStatus: newCustomerPaymentStatus }
              : b
          )
        );
        showToast(`Customer payment status updated to ${newCustomerPaymentStatus}!`, "success");
        setShowCustomerPaymentModal(false);
        setSelectedCustomerForPayment(null);
        setSelectedBookingForCustomerPayment(null);
      } else {
        showToast(res.data?.message || "Failed to update", "error");
      }
    } catch (err) {
      console.error("Error updating customer payment status:", err);
      showToast(err.response?.data?.message || "Failed to update customer payment status", "error");
    } finally {
      setSavingCustomerPayment(false);
    }
  };

  const openPrescriptionModal = (booking) => {
    setSelectedBookingForPrescription(booking);
    setShowPrescriptionModal(true);
  };

  const handlePrintPrescription = () => {
    if (!prescriptionRef.current) { showToast("No prescription content to print", "error"); return; }
    const win = window.open("", "_blank", "width=800,height=1100");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html><html><head><title>Prescription - ${selectedBookingForPrescription?.patientName || "Patient"}</title>
      <style>
        *{margin:0;padding:0;box-sizing:border-box;}
        body{font-family:Arial,sans-serif;background:#fff;display:flex;flex-direction:column;align-items:center;min-height:100vh;padding:20px;}
        .prescription-page{max-width:650px;width:100%;position:relative;background:#fff;box-shadow:0 4px 20px rgba(0,0,0,.1);border-radius:12px;overflow:hidden;margin-bottom:30px;page-break-after:always;}
        .prescription-page img{width:100%;height:auto;display:block;}
        .page-label{text-align:center;font-size:11px;color:#888;padding:6px 0;background:#f5f5f5;border-bottom:1px solid #ddd;font-weight:bold;letter-spacing:1px;}
        .overlay-print{position:absolute;top:0;left:0;right:0;bottom:0;}
        .overlay-print .fld{position:absolute;font-size:15px;font-weight:600;color:#1a1a1a;letter-spacing:.2px;line-height:1.3;}
        @media print{body{padding:0;}.prescription-page{box-shadow:none;border-radius:0;margin-bottom:0;}.page-label{display:none;}}
      </style></head><body>
      <div class="prescription-page">
        <div class="page-label">📄 Front Side - Prescription</div>
        <img src="${prescriptionTemplate}" alt="Front" />
        <div class="overlay-print">
          <div class="fld" style="top:78px;left:90px;max-width:280px;">${selectedBookingForPrescription?.patientTitle || ""} ${selectedBookingForPrescription?.patientName || "N/A"}</div>
          <div class="fld" style="top:78px;right:20px;">${formatDateToDDMMYYYY(selectedBookingForPrescription?.appointmentDate || selectedBookingForPrescription?.date)}</div>
          <div class="fld" style="top:104px;left:90px;">${selectedBookingForPrescription?.patientAge || "N/A"}</div>
          <div class="fld" style="top:104px;left:230px;">${selectedBookingForPrescription?.patientGender || "N/A"}</div>
          <div class="fld" style="top:104px;right:100px;">${selectedBookingForPrescription?.patientPhone || "N/A"}</div>
          <div class="fld" style="top:130px;left:90px;max-width:320px;">${selectedBookingForPrescription?.purpose || "N/A"}</div>
        </div>
      </div>
      <div class="prescription-page"><div class="page-label">📄 Back Side</div><img src="${prescriptionBackTemplate}" alt="Back" /></div>
      <script>window.onload=function(){window.print();}</script></body></html>
    `);
    win.document.close();
    win.focus();
  };

  const openBillingModal = (booking) => {
    setSelectedBookingForBilling(booking);
    const normalizedItems = getBookingServices(booking);
    const grossAmount = normalizedItems.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
    const commissionPercent = parseFloat(booking.referralCommission) || 0;
    const commissionAmount = Number(booking.commissionAmount) || (grossAmount * commissionPercent) / 100;
    const netAmount =
      Number(booking.finalPayable) || Number(booking.finalPayableAmount) ||
      Number(booking.grandTotal) || (grossAmount - commissionAmount);
    const isPaid = booking.paymentStatus === "Paid";
    const isPartial = booking.paymentStatus === "Partial";
    const paidAmount = isPaid ? netAmount : isPartial ? (Number(booking.amountPaid) || 0) : 0;
    const balanceAmount = Math.max(0, netAmount - paidAmount);

    const now = new Date();
    const dateStamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    const shortId = String(booking._id || "").slice(-6).toUpperCase() || "000000";
    const invoiceNo = `${dateStamp}-${shortId}`;
    const dateTimeLabel = `${now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} ${now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;

    const items = normalizedItems.map((s, idx) => ({
      no: idx + 1,
      name: s.name,
      serviceCode: s.serviceId ? String(s.serviceId).slice(-6).toUpperCase() : `SVC-${String(idx + 1).padStart(2, "0")}`,
      remarks: "Service",
      amount: s.price || 0,
      paymentStatus: isPaid ? "Paid" : (isPartial ? "Partial" : (s.paymentStatus || booking.paymentStatus || "Pending"))
    }));

    setBillingData({
      invoiceNo, invoiceDate: dateTimeLabel,
      receiptNo: `R-${shortId.slice(-4)}`, receiptDate: dateTimeLabel,
      paymentMode: booking.paymentType ? booking.paymentType.charAt(0).toUpperCase() + booking.paymentType.slice(1) : "Cash",
      receivedBy: "Front Desk",
      branch: booking.doctorSpecialization || "Main Branch",
      doctorName: booking.doctorName || "General OP Doctor",
      items, grossAmount, netAmount, paidAmount, balanceAmount,
      paymentStatus: booking.paymentStatus || "Pending",
      amountInWords: numberToWords(netAmount)
    });
    setShowBillingModal(true);
  };

  const printBill = () => {
    const itemsRows = billingData.items.map((item) => `
      <tr>
        <td>${item.no}</td><td>${item.name}</td><td>${item.serviceCode}</td>
        <td>${item.remarks}</td><td class="text-right">${Number(item.amount).toFixed(2)}</td>
        <td class="text-center">${item.paymentStatus || "Pending"}</td>
      </tr>
    `).join("");
    const win = window.open("", "_blank", "width=900,height=1000");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Bill - ${billingData.invoiceNo}</title>
      <style>
        *{margin:0;padding:0;box-sizing:border-box;}
        body{font-family:Arial,sans-serif;color:#222;padding:24px;background:#fff;}
        .bill-wrap{max-width:820px;margin:0 auto;border:1px solid #999;padding:24px 28px;background:#fff;overflow:hidden;position:relative;}
        .watermark{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);opacity:.08;z-index:0;width:300px;height:300px;}
        .watermark img{width:100%;height:100%;object-fit:contain;}
        .bill-content{position:relative;z-index:1;}
        .top-header{display:flex;align-items:flex-start;justify-content:space-between;border-bottom:2px solid #222;padding-bottom:14px;}
        .top-header .brand{display:flex;align-items:center;gap:14px;}
        .top-header .brand img{width:60px;height:60px;object-fit:contain;}
        .top-header .brand h1{font-size:20px;font-weight:bold;color:#111;}
        .top-header .brand p{font-size:11px;color:#555;max-width:440px;}
        .top-header .contact{text-align:right;font-size:11px;color:#555;white-space:nowrap;}
        .bar-title{text-align:center;background:#f1f1f1;border-top:1px solid #999;border-bottom:1px solid #999;padding:6px 0;font-size:13px;font-weight:bold;letter-spacing:1.5px;margin:10px 0 14px;text-transform:uppercase;}
        .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px 24px;font-size:12px;margin-bottom:14px;}
        .info-grid .label{color:#666;font-weight:bold;display:inline-block;width:120px;}
        table.items{width:100%;border-collapse:collapse;border-top:2px solid #222;border-bottom:2px solid #222;margin-bottom:12px;}
        table.items th{text-align:left;font-size:11px;color:#555;padding:6px 4px;border-bottom:1px solid #bbb;text-transform:uppercase;}
        table.items td{font-size:12px;padding:6px 4px;border-bottom:1px solid #eee;color:#333;}
        table.items td.text-right,table.items th.text-right{text-align:right;}
        table.items td.text-center,table.items th.text-center{text-align:center;}
        .totals-box{width:100%;max-width:300px;margin-left:auto;font-size:12px;margin-bottom:12px;}
        .totals-box .row{display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #eee;}
        .totals-box .row.final{border-top:2px solid #222;border-bottom:none;font-weight:bold;padding-top:8px;margin-top:4px;font-size:13px;}
        .footer-row{display:flex;justify-content:flex-end;gap:8px;font-size:11px;color:#555;border-top:1px solid #ddd;padding-top:12px;margin-top:10px;}
        .signature-section{display:flex;justify-content:flex-end;margin-top:8px;}
        .signature-section .sig{font-weight:bold;color:#333;}
        @media print{body{padding:0;}.bill-wrap{border:none;}}
      </style></head><body>
      <div class="bill-wrap">
        <div class="watermark"><img src="${logo}" alt="${CLINIC_INFO.name}"/></div>
        <div class="bill-content">
          <div class="top-header">
            <div class="brand"><img src="${logo}" alt="${CLINIC_INFO.name}"/><div><h1>${CLINIC_INFO.name}</h1><p>${CLINIC_INFO.address}</p></div></div>
            <div class="contact">Contact No : ${CLINIC_INFO.contact}</div>
          </div>
          <div class="bar-title">Bill Cum Receipt</div>
          <div class="info-grid">
            <div><span class="label">Name</span>: ${selectedBookingForBilling?.patientTitle || ""} ${selectedBookingForBilling?.patientName || "N/A"}</div>
            <div><span class="label">Invoice No / Date</span>: ${billingData.invoiceNo} / ${billingData.invoiceDate}</div>
            <div><span class="label">Age</span>: ${selectedBookingForBilling?.patientAge || "N/A"} Yrs</div>
            <div><span class="label">Gender</span>: ${selectedBookingForBilling?.patientGender || "N/A"}</div>
            <div><span class="label">Branch</span>: ${billingData.branch}</div>
            <div><span class="label">Contact No</span>: ${selectedBookingForBilling?.patientPhone || "N/A"}</div>
            <div><span class="label">Doctor</span>: ${billingData.doctorName}</div>
            <div><span class="label">Appt. Date</span>: ${formatDateToDDMMYYYY(selectedBookingForBilling?.appointmentDate || selectedBookingForBilling?.date)}</div>
          </div>
          <table class="items">
            <thead><tr>
              <th style="width:6%;">No.</th><th style="width:30%;">Service / Item</th>
              <th style="width:16%;">Service Code</th><th style="width:22%;">Remarks</th>
              <th style="width:14%;" class="text-right">Amount</th>
              <th style="width:12%;" class="text-center">Payment Status</th>
            </tr></thead>
            <tbody>${itemsRows}</tbody>
          </table>
          <div class="totals-box">
            <div class="row"><span>Net Amount</span><span>₹ ${billingData.netAmount.toFixed(2)}</span></div>
            <div class="row"><span>Paid Amount</span><span>₹ ${billingData.paidAmount.toFixed(2)}</span></div>
            <div class="row final"><span>Balance to Pay</span><span>₹ ${billingData.balanceAmount.toFixed(2)}</span></div>
          </div>
          <div class="footer-row"><span>Printed Date : ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} ${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span></div>
          <div class="signature-section"><span class="sig">Signature</span></div>
        </div>
      </div>
    </body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  };

  return (
    <div className="emp-dash">
      <main className="p-2 sm:p-4 lg:p-6">
        {toast && (
          <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white ${toast.type === "error" ? "bg-red-600" : toast.type === "info" ? "bg-cyan-600" : "bg-emerald-600"}`}>
            {toast.type === "error" ? <FiXCircle className="w-5 h-5" /> : <FiCheckCircle className="w-5 h-5" />}
            <span className="font-medium text-sm">{toast.message}</span>
          </div>
        )}

        {/* Header Desktop */}
        <div className="hidden lg:flex items-center justify-between gap-3 flex-wrap mb-6">
          <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap">
            Customer Referral <span>OP</span>
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="emp-dash__date-pill">
              <FaUser />
              <span>{referrals.length} Customers • {bookings.length} Bookings</span>
            </div>
            <div className="relative min-w-[130px]">
              <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[200px] pl-8 pr-2 py-1.5 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg"
              />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-8 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg">
              <option value="All">All Payment</option>
              <option value="Pending">Pending</option>
              <option value="Partial">Partial</option>
              <option value="Paid">Paid</option>
              <option value="Due">Due</option>
            </select>
            <select value={customerFilter} onChange={(e) => setCustomerFilter(e.target.value)} className="h-8 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg max-w-[150px] truncate">
              <option value="All">All Customers</option>
              {uniqueCustomers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); if (e.target.value) setSelectedMonth(""); }} className="w-[110px] h-8 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg" />
            <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); if (e.target.value) setSelectedMonth(""); }} className="w-[110px] h-8 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg" />
            <input type="month" value={selectedMonth} onChange={(e) => { setSelectedMonth(e.target.value); setFromDate(""); setToDate(""); }} className="w-[120px] h-8 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg" />
            <button onClick={fetchAllData} className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm">
              <FiRefreshCw className="w-3 h-3" /> Refresh
            </button>
            <button onClick={downloadCSV} className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 shadow-sm">
              <FiDownload className="w-3 h-3" /> Export CSV
            </button>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm">
                <FiTrash2 className="w-3 h-3 text-red-500" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Header Mobile */}
        <div className="lg:hidden flex items-center justify-between gap-2 flex-wrap mb-3">
          <div className="flex items-baseline gap-2">
            <h1 className="text-base font-bold whitespace-nowrap">Customer Referral <span className="text-indigo-600">OP</span></h1>
            <div className="emp-dash__date-pill text-[10px] px-2 py-1">
              <FaUser className="w-3 h-3 text-indigo-600" />
              <span>{referrals.length}C • {bookings.length}B</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setShowMobileFilters(!showMobileFilters)} className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg">
              <FiFilter className="w-3 h-3" /> Filters
            </button>
          </div>
        </div>

        {/* Mobile Filters */}
        {showMobileFilters && (
          <div className="lg:hidden mb-4 p-4 bg-white rounded-xl border border-gray-200 space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Search</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg">
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Partial">Partial</option>
                <option value="Paid">Paid</option>
                <option value="Due">Due</option>
              </select>
              <select value={customerFilter} onChange={(e) => setCustomerFilter(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg">
                <option value="All">All Customers</option>
                {uniqueCustomers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); if (e.target.value) setSelectedMonth(""); }} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg" />
              <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); if (e.target.value) setSelectedMonth(""); }} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg" />
            </div>
            <input type="month" value={selectedMonth} onChange={(e) => { setSelectedMonth(e.target.value); setFromDate(""); setToDate(""); }} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg" />
            <div className="pt-3 border-t border-gray-200 flex gap-2">
              <button onClick={downloadCSV} disabled={!filteredRows.length} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg disabled:opacity-50">
                <FiDownload className="w-4 h-4" /> Export
              </button>
              <button onClick={fetchAllData} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg">
                <FiRefreshCw className="w-4 h-4" /> Refresh
              </button>
            </div>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg">
                <FiTrash2 className="w-4 h-4 text-red-500" /> Clear All Filters
              </button>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 md:gap-4 mb-6">
          <div className={`emp-dash__stat cursor-pointer hover:scale-105 ${activeCardFilter === "all" ? "ring-2 ring-blue-500/20 border-blue-400" : ""}`} onClick={() => handleCardClick("all")}>
            <div className="emp-dash__stat-top"><span className="emp-dash__stat-label">Total Customers</span><div className="emp-dash__stat-icon emp-dash__stat-icon--rate"><FiUsers /></div></div>
            <div className="emp-dash__stat-value">{stats.totalCustomers}</div>
            <div className="emp-dash__stat-meta">referring customers</div>
          </div>
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top"><span className="emp-dash__stat-label">Total Bookings</span><div className="emp-dash__stat-icon emp-dash__stat-icon--rate"><FaUserInjured /></div></div>
            <div className="emp-dash__stat-value text-blue-600">{stats.totalBookings}</div>
            <div className="emp-dash__stat-meta">referred OP bookings</div>
          </div>
          <div className={`emp-dash__stat cursor-pointer hover:scale-105 ${activeCardFilter === "Paid" ? "ring-2 ring-emerald-500/20 border-emerald-400" : ""}`} onClick={() => handleCardClick("Paid")}>
            <div className="emp-dash__stat-top"><span className="emp-dash__stat-label">Paid</span><div className="emp-dash__stat-icon emp-dash__stat-icon--present"><FiUserCheck /></div></div>
            <div className="emp-dash__stat-value text-emerald-600">{stats.paidCount}</div>
            <div className="emp-dash__stat-meta">completed payments</div>
          </div>
          <div className={`emp-dash__stat cursor-pointer hover:scale-105 ${activeCardFilter === "Partial" ? "ring-2 ring-amber-500/20 border-amber-400" : ""}`} onClick={() => handleCardClick("Partial")}>
            <div className="emp-dash__stat-top"><span className="emp-dash__stat-label">Partial</span><div className="emp-dash__stat-icon emp-dash__stat-icon--rate"><FaClock /></div></div>
            <div className="emp-dash__stat-value text-amber-600">{stats.partialCount}</div>
            <div className="emp-dash__stat-meta">partially paid</div>
          </div>
          <div className={`emp-dash__stat cursor-pointer hover:scale-105 ${activeCardFilter === "Pending" ? "ring-2 ring-gray-500/20 border-gray-400" : ""}`} onClick={() => handleCardClick("Pending")}>
            <div className="emp-dash__stat-top"><span className="emp-dash__stat-label">Pending</span><div className="emp-dash__stat-icon emp-dash__stat-icon--late"><FiClock /></div></div>
            <div className="emp-dash__stat-value text-gray-600">{stats.pendingCount}</div>
            <div className="emp-dash__stat-meta">awaiting payment</div>
          </div>
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Customer Payable</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present"><FaRupeeSign /></div>
            </div>
            <div className="emp-dash__stat-value text-indigo-700">₹{stats.totalPayable.toLocaleString()}</div>
            <div className="emp-dash__stat-meta">payable to customers</div>
          </div>
        </div>

        {/* Table */}
        <div className="emp-dash__card">
          {loading ? (
            <div className="py-12 text-center"><FiRefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" /><p className="text-sm text-gray-500">Loading customer referral OP records...</p></div>
          ) : filteredRows.length === 0 ? (
            <div className="py-12 text-center">
              <FaUser className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-700">No Customer Referral OP Records</h3>
              <p className="text-xs text-gray-500 mt-1 mb-4">{flatRows.length === 0 ? "No referrals or bookings yet." : "No records match your filters."}</p>
              {hasActiveFilters && <button onClick={clearFilters} className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg">Clear Filters</button>}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="emp-dash__table">
                  <thead>
                    <tr>
                      <th style={{ width: "35px", textAlign: "center" }}>#</th>
                      <th>Referred By Customer</th>
                      <th>Patient</th>
                      <th>Phone</th>
                      <th>Treating Doctor</th>
                      <th style={{ textAlign: "center" }}>Appt. Date</th>
                      <th style={{ textAlign: "center" }}>Slot</th>
                      <th style={{ textAlign: "center" }}>Services</th>
                      <th style={{ textAlign: "center" }}>Applied On</th>
                      <th style={{ textAlign: "center" }}>Total</th>
                      <th style={{ textAlign: "center" }}>Payment Status</th>
                      <th style={{ textAlign: "center" }}>Customer Payable</th>
                      <th style={{ textAlign: "center" }}>Customer Payment</th>
                      <th style={{ textAlign: "center" }}>Referral %</th>
                      <th style={{ textAlign: "center" }}>Created At</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRows.map((row, idx) => {
                      const { customer, booking } = row;
                      if (!booking) {
                        return (
                          <tr key={`${customer._id}-no-booking`} className="hover:bg-indigo-50/30">
                            <td className="px-2 py-3 text-center text-slate-500 text-[11px]">{indexOfFirstItem + idx + 1}</td>
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center text-[10px]">
                                  {customer.customerName ? customer.customerName.charAt(0).toUpperCase() : "C"}
                                </div>
                                <div>
                                  <div className="font-semibold text-xs text-indigo-800 truncate max-w-[120px]">{customer.customerName || "N/A"}</div>
                                  <div className="text-[9px] text-gray-400 truncate max-w-[120px]">{customer.customerPhone || "-"}</div>
                                </div>
                              </div>
                            </td>
                            <td colSpan={15} className="px-3 py-3 text-center text-xs text-gray-400 italic">No referrals made yet</td>
                          </tr>
                        );
                      }

                      const info = getBookingPaidInfo(booking);
                      const services = getBookingServices(booking);
                      const paymentColors = getPaymentStatusColors(booking.paymentStatus);
                      const slotTiming = booking.startTime && booking.endTime ? `${booking.startTime} - ${booking.endTime}` : "-";
                      const customerPayable = getCustomerPayable(customer, booking);
                      const customerPaymentStatus = booking.customerPaymentStatus || "Pending";
                      const customerPayColors = getPaymentStatusColors(customerPaymentStatus);
                      const appliedCats = getAppliedCategories(customer, booking);

                      return (
                        <tr key={booking._id} className="hover:bg-indigo-50/30">
                          <td className="px-2 py-3 text-center text-slate-500 text-[11px]">{indexOfFirstItem + idx + 1}</td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center text-[10px]">
                                {customer.customerName ? customer.customerName.charAt(0).toUpperCase() : "C"}
                              </div>
                              <div>
                                <div className="font-semibold text-xs text-indigo-800 truncate max-w-[120px]">{customer.customerName || "N/A"}</div>
                                <div className="text-[9px] text-gray-400 truncate max-w-[120px]">{customer.customerPhone || "-"}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <div className="font-semibold text-xs text-slate-800 truncate max-w-[100px]">{booking.patientTitle || ""} {booking.patientName || "N/A"}</div>
                            <div className="text-[9px] text-gray-400">{booking.patientAge || "?"} yrs • {booking.patientGender || "-"}</div>
                          </td>
                          <td className="px-3 py-3 text-xs whitespace-nowrap">{booking.patientPhone || "N/A"}</td>
                          <td className="px-3 py-3"><div className="text-xs font-semibold text-indigo-700 truncate max-w-[100px]">{booking.doctorName || "N/A"}</div></td>
                          <td className="px-3 py-3 text-center text-xs whitespace-nowrap">{formatDateToDDMMYYYY(booking.appointmentDate || booking.date)}</td>
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            {slotTiming !== "-" ? <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">{slotTiming}</span> : <span className="text-[10px] text-gray-400 italic">-</span>}
                          </td>
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            {services.length > 0 ? (
                              <div className="flex flex-col gap-0.5 items-center">
                                {services.slice(0, 2).map((s, i) => <span key={i} className="text-[9px] font-medium bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100">{s.name}</span>)}
                                {services.length > 2 && <span className="text-[9px] text-gray-400">+{services.length - 2}</span>}
                              </div>
                            ) : <span className="text-[10px] text-gray-400 italic">-</span>}
                          </td>
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            {appliedCats.length > 0 ? (
                              <div className="flex flex-col gap-0.5 items-center">
                                {appliedCats.map((cat, i) => {
                                  const colors =
                                    cat === "clinic"
                                      ? "bg-blue-50 text-blue-700 border-blue-100"
                                      : cat === "pharmacy"
                                      ? "bg-green-50 text-green-700 border-green-100"
                                      : "bg-purple-50 text-purple-700 border-purple-100";
                                  return (
                                    <span key={i} className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${colors}`}>
                                      {cat}
                                    </span>
                                  );
                                })}
                              </div>
                            ) : <span className="text-[10px] text-gray-400 italic">-</span>}
                          </td>
                          <td className="px-3 py-3 text-center whitespace-nowrap"><span className="text-xs font-bold text-slate-800">₹{Math.round(info.final)}</span></td>
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${paymentColors.bg} ${paymentColors.text} ${paymentColors.border}`}>
                              <paymentColors.icon className={`w-2.5 h-2.5 ${paymentColors.iconColor}`} /> {booking.paymentStatus || "Pending"}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                              ₹{customerPayable}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${customerPayColors.bg} ${customerPayColors.text} ${customerPayColors.border}`}>
                              <customerPayColors.icon className={`w-2.5 h-2.5 ${customerPayColors.iconColor}`} /> {customerPaymentStatus}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <div className="flex flex-col gap-0.5 items-center">
                              <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100" title="Clinic">
                                Clinic: {customer.clinicCommission || 0}%
                              </span>
                              <span className="text-[9px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100" title="Pharmacy">
                                Pharmacy: {customer.pharmacyCommission || 0}%
                              </span>
                              <span className="text-[9px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100" title="Lab">
                                Lab: {customer.labCommission || 0}%
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-center text-[10px] text-gray-500 whitespace-nowrap">{formatDateTimeToDDMMYYYY(booking.createdAt)}</td>
                          <td className="px-3 py-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedCustomer(customer);
                                  setSelectedBookingForCustomerModal(booking);
                                  setShowCustomerModal(true);
                                }}
                                className="p-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg"
                                title="View"
                              >
                                <FiEye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openCustomerPaymentModal(customer, booking)}
                                className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg"
                                title="Edit Customer Payment"
                              >
                                <FiEdit2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t bg-gray-50/30">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Show</span>
                    <select value={itemsPerPage} onChange={handleItemsPerPageChange} className="p-1 border rounded-md bg-white">
                      <option value={5}>5</option><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option>
                    </select>
                    <span>entries</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Showing <strong>{filteredRows.length === 0 ? 0 : indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredRows.length)}</strong> of <strong>{filteredRows.length}</strong>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className={`px-2.5 py-1 text-xs font-semibold border rounded-lg ${currentPage === 1 ? "text-gray-400 bg-gray-100 cursor-not-allowed" : "text-gray-700 bg-white hover:bg-gray-50"}`}>Prev</button>
                  {getPageNumbers().map((page, i) => (
                    <button key={i} onClick={() => typeof page === "number" && setCurrentPage(page)} disabled={page === "..."} className={`px-3 py-1 text-xs font-semibold border rounded-lg min-w-[32px] ${page === "..." ? "text-gray-400 border-transparent" : currentPage === page ? "text-white bg-blue-600 border-blue-600" : "text-gray-700 bg-white hover:bg-gray-50"}`}>{page}</button>
                  ))}
                  <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages || totalPages === 0} className={`px-2.5 py-1 text-xs font-semibold border rounded-lg ${currentPage === totalPages ? "text-gray-400 bg-gray-100 cursor-not-allowed" : "text-gray-700 bg-white hover:bg-gray-50"}`}>Next</button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Prescription Modal */}
        {showPrescriptionModal && selectedBookingForPrescription && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="relative max-w-[480px] w-full rounded-2xl overflow-hidden shadow-2xl bg-white max-h-[90vh] overflow-y-auto">
              <button onClick={() => { setShowPrescriptionModal(false); setSelectedBookingForPrescription(null); }} className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5 shadow-lg z-30"><FaTimes className="w-4 h-4 text-gray-700" /></button>
              <div className="absolute top-2 left-2 flex gap-1.5 z-30">
                <button onClick={handlePrintPrescription} className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold shadow-lg"><FaPrint className="w-3 h-3" /> Print</button>
                <button onClick={handlePrintPrescription} className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-bold shadow-lg"><FaFilePdf className="w-3 h-3" /> PDF</button>
              </div>
              <div className="border-b pb-2 mb-2">
                <div className="text-center text-[10px] font-bold text-gray-400 py-1 bg-gray-50">Front Side - Prescription</div>
                <div ref={prescriptionRef} className="relative w-full overflow-hidden" style={{ transform: "scale(0.75)", transformOrigin: "top center", width: "133.33%", marginLeft: "-16.66%" }}>
                  <img src={prescriptionTemplate} alt="Front" className="w-full h-auto object-contain" />
                  <div className="absolute inset-0 text-black">
                    <div style={{ position: "absolute", top: "78px", left: "90px", fontSize: "15px", fontWeight: 600 }}>{selectedBookingForPrescription?.patientTitle || ""} {selectedBookingForPrescription?.patientName || "N/A"}</div>
                    <div style={{ position: "absolute", top: "78px", right: "20px", fontSize: "15px", fontWeight: 600 }}>{formatDateToDDMMYYYY(selectedBookingForPrescription?.appointmentDate || selectedBookingForPrescription?.date)}</div>
                    <div style={{ position: "absolute", top: "104px", left: "90px", fontSize: "15px", fontWeight: 600 }}>{selectedBookingForPrescription?.patientAge || "N/A"}</div>
                    <div style={{ position: "absolute", top: "104px", left: "230px", fontSize: "15px", fontWeight: 600 }}>{selectedBookingForPrescription?.patientGender || "N/A"}</div>
                    <div style={{ position: "absolute", top: "104px", right: "100px", fontSize: "15px", fontWeight: 600 }}>{selectedBookingForPrescription?.patientPhone || "N/A"}</div>
                    <div style={{ position: "absolute", top: "130px", left: "90px", fontSize: "15px", fontWeight: 600 }}>{selectedBookingForPrescription?.purpose || "N/A"}</div>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-center text-[10px] font-bold text-gray-400 py-1 bg-gray-50">Back Side</div>
                <div className="relative w-full overflow-hidden" style={{ transform: "scale(0.75)", transformOrigin: "top center", width: "133.33%", marginLeft: "-16.66%" }}>
                  <img src={prescriptionBackTemplate} alt="Back" className="w-full h-auto object-contain" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Billing Modal */}
        {showBillingModal && selectedBookingForBilling && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center"><FaFileInvoiceDollar /></div>
                  <div><h3 className="font-bold text-gray-900 text-base">Bill Cum Receipt</h3><p className="text-xs text-gray-500">{selectedBookingForBilling.patientName} • {billingData.invoiceNo}</p></div>
                </div>
                <button onClick={() => { setShowBillingModal(false); setSelectedBookingForBilling(null); }} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"><FaTimes /></button>
              </div>
              <div className="p-6 md:p-8 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.04] pointer-events-none w-64 h-64"><img src={logo} alt={CLINIC_INFO.name} /></div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between border-b-2 border-gray-800 pb-4 mb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-3"><img src={logo} alt={CLINIC_INFO.name} className="w-14 h-14 object-contain" /><div><h2 className="text-xl font-bold">{CLINIC_INFO.name}</h2><p className="text-[11px] text-gray-500 max-w-sm">{CLINIC_INFO.address}</p></div></div>
                    <div className="text-right text-[11px] text-gray-500">Contact No : {CLINIC_INFO.contact}</div>
                  </div>
                  <div className="text-center bg-gray-100 border-y border-gray-300 py-1.5 mb-4"><span className="text-sm font-bold tracking-widest uppercase">Bill Cum Receipt</span></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs mb-5">
                    <div><span className="font-bold text-gray-500 inline-block w-28">Name</span>: {selectedBookingForBilling?.patientTitle || ""} {selectedBookingForBilling?.patientName || "N/A"}</div>
                    <div><span className="font-bold text-gray-500 inline-block w-28">Invoice No / Date</span>: {billingData.invoiceNo} / {billingData.invoiceDate}</div>
                    <div><span className="font-bold text-gray-500 inline-block w-28">Age</span>: {selectedBookingForBilling?.patientAge || "N/A"} Yrs</div>
                    <div><span className="font-bold text-gray-500 inline-block w-28">Gender</span>: {selectedBookingForBilling?.patientGender || "N/A"}</div>
                    <div><span className="font-bold text-gray-500 inline-block w-28">Contact No</span>: {selectedBookingForBilling?.patientPhone || "N/A"}</div>
                    <div><span className="font-bold text-gray-500 inline-block w-28">Doctor</span>: {billingData.doctorName}</div>
                  </div>
                  <table className="w-full mb-3 border-t-2 border-b-2 border-gray-800">
                    <thead><tr>
                      <th className="text-left py-1.5 text-[11px] font-bold text-gray-600">No.</th>
                      <th className="text-left py-1.5 text-[11px] font-bold text-gray-600">Service / Item</th>
                      <th className="text-right py-1.5 text-[11px] font-bold text-gray-600">Amount</th>
                      <th className="text-center py-1.5 text-[11px] font-bold text-gray-600">Status</th>
                    </tr></thead>
                    <tbody>
                      {billingData.items.map((item) => (
                        <tr key={item.no} className="border-b border-gray-100">
                          <td className="py-1.5 text-xs">{item.no}</td>
                          <td className="py-1.5 text-xs font-medium">{item.name}</td>
                          <td className="py-1.5 text-xs text-right font-semibold">₹{Number(item.amount).toFixed(2)}</td>
                          <td className="py-1.5 text-xs text-center"><span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${item.paymentStatus === "Paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{item.paymentStatus || "Pending"}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex flex-col items-end mb-3">
                    <div className="w-full max-w-xs text-xs">
                      <div className="flex justify-between py-1 border-b"><span>Net Amount</span><span className="font-bold">₹ {billingData.netAmount.toFixed(2)}</span></div>
                      <div className="flex justify-between py-1 border-b"><span>Paid Amount</span><span className="font-bold text-emerald-700">₹ {billingData.paidAmount.toFixed(2)}</span></div>
                      <div className="flex justify-between py-1.5 mt-1 border-t-2 border-gray-800"><span className="font-bold">Balance to Pay</span><span className={`font-bold ${billingData.balanceAmount > 0 ? "text-red-600" : "text-emerald-700"}`}>₹ {billingData.balanceAmount.toFixed(2)}</span></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50/50">
                <button onClick={printBill} className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 text-white flex items-center gap-1.5"><FaPrint className="w-3.5 h-3.5" /> Print Bill</button>
                <button onClick={() => { setShowBillingModal(false); setSelectedBookingForBilling(null); }} className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-200 hover:bg-gray-300">Close</button>
              </div>
            </div>
          </div>
        )}

        {/* Customer Detail Modal */}
        {showCustomerModal && selectedCustomer && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center"><FaUser /></div>
                  <div>
                    <h3 className="font-bold text-gray-900">Customer Referral Details</h3>
                    <p className="text-xs text-gray-500">ID: {selectedCustomer._id}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowCustomerModal(false);
                    setSelectedCustomer(null);
                    setSelectedBookingForCustomerModal(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="my-4 bg-gray-50 p-5 rounded-xl border space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b">
                  <div className="w-14 h-14 rounded-full bg-indigo-500 text-white font-bold text-xl flex items-center justify-center">
                    {selectedCustomer.customerName?.charAt(0).toUpperCase() || "C"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 text-base">{selectedCustomer.customerName}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <FaPhoneAlt className="text-[10px]" />
                      {selectedCustomer.customerPhone || "N/A"}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <FaMapMarkerAlt className="text-[10px]" />
                      {selectedCustomer.customerAddress || "N/A"}
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border ${selectedCustomer.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                    {selectedCustomer.status || "active"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-[10px] font-bold uppercase text-gray-400">Referral Date</div>
                    <div className="font-semibold">{formatDateToDDMMYYYY(selectedCustomer.referralDate || selectedCustomer.createdAt)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-gray-400">Created</div>
                    <div className="font-semibold">{formatDateTimeToDDMMYYYY(selectedCustomer.createdAt)}</div>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <div className="text-[10px] font-bold uppercase text-gray-400 mb-2 flex items-center gap-1">
                    <FiAward className="text-indigo-500" /> Referral % Breakdown
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-blue-50 p-2.5 rounded-lg text-center border border-blue-100">
                      <div className="text-[9px] text-blue-600 font-bold flex items-center justify-center gap-1">
                        <FaClinicMedical className="text-[10px]" /> Clinic
                      </div>
                      <div className="text-base font-extrabold text-blue-900">{selectedCustomer.clinicCommission || 0}%</div>
                    </div>
                    <div className="bg-green-50 p-2.5 rounded-lg text-center border border-green-100">
                      <div className="text-[9px] text-green-600 font-bold flex items-center justify-center gap-1">
                        <FaPills className="text-[10px]" /> Pharmacy
                      </div>
                      <div className="text-base font-extrabold text-green-900">{selectedCustomer.pharmacyCommission || 0}%</div>
                    </div>
                    <div className="bg-purple-50 p-2.5 rounded-lg text-center border border-purple-100">
                      <div className="text-[9px] text-purple-600 font-bold flex items-center justify-center gap-1">
                        <FaFlask className="text-[10px]" /> Lab
                      </div>
                      <div className="text-base font-extrabold text-purple-900">{selectedCustomer.labCommission || 0}%</div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <div className="text-[10px] font-bold uppercase text-gray-400 mb-2">Referral Metrics</div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-blue-50 p-2 rounded-lg text-center border border-blue-100">
                      <div className="text-[9px] text-blue-600 font-bold">Total OPs</div>
                      <div className="text-base font-extrabold text-blue-900">{getBookingsForReferral(selectedCustomer).length}</div>
                    </div>
                    <div className="bg-emerald-50 p-2 rounded-lg text-center border border-emerald-100">
                      <div className="text-[9px] text-emerald-600 font-bold">Patient Total</div>
                      <div className="text-base font-extrabold text-emerald-900">
                        ₹{getBookingsForReferral(selectedCustomer).reduce((sum, b) => sum + getBookingFinalPayable(b), 0).toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-indigo-50 p-2 rounded-lg text-center border border-indigo-100">
                      <div className="text-[9px] text-indigo-600 font-bold">Customer Payable</div>
                      <div className="text-base font-extrabold text-indigo-900">
                        ₹{getBookingsForReferral(selectedCustomer).reduce((sum, b) => sum + getCustomerPayable(selectedCustomer, b), 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <div className="text-[10px] font-bold uppercase text-gray-400 mb-1">Customer Payment Status</div>
                  <span className={`inline-block text-[11px] font-bold px-3 py-1 rounded-full uppercase border ${getPaymentStatusColors(selectedBookingForCustomerModal?.customerPaymentStatus || "Pending").bg} ${getPaymentStatusColors(selectedBookingForCustomerModal?.customerPaymentStatus || "Pending").text} ${getPaymentStatusColors(selectedBookingForCustomerModal?.customerPaymentStatus || "Pending").border}`}>
                    {selectedBookingForCustomerModal?.customerPaymentStatus || "Pending"}
                  </span>
                </div>

                {selectedBookingForCustomerModal && (() => {
                  const breakdown = getCustomerPayableBreakdown(selectedCustomer, selectedBookingForCustomerModal);
                  const appliedCats = getAppliedCategories(selectedCustomer, selectedBookingForCustomerModal);
                  return (
                    <div className="pt-3 border-t">
                      <div className="text-[10px] font-bold uppercase text-gray-400 mb-2">Selected Booking Details</div>

                      <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Patient:</span>
                          <span className="font-semibold">{selectedBookingForCustomerModal.patientTitle} {selectedBookingForCustomerModal.patientName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Phone:</span>
                          <span className="font-semibold">{selectedBookingForCustomerModal.patientPhone || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Appt. Date:</span>
                          <span className="font-semibold">{formatDateToDDMMYYYY(selectedBookingForCustomerModal.appointmentDate || selectedBookingForCustomerModal.date)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Treating Doctor:</span>
                          <span className="font-semibold">{selectedBookingForCustomerModal.doctorName || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Total Amount:</span>
                          <span className="font-semibold">₹{Math.round(getBookingFinalPayable(selectedBookingForCustomerModal))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Applied On:</span>
                          <span className="font-semibold">
                            {appliedCats.length > 0
                              ? appliedCats.map((c) => c.charAt(0).toUpperCase() + c.slice(1)).join(", ")
                              : "-"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="text-[10px] font-bold uppercase text-gray-400 mb-1.5">Service-wise Commission</div>
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                          <table className="w-full text-xs">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="text-left px-2 py-1.5 text-[9px] font-bold text-gray-500 uppercase">Service</th>
                                <th className="text-center px-2 py-1.5 text-[9px] font-bold text-gray-500 uppercase">Category</th>
                                <th className="text-right px-2 py-1.5 text-[9px] font-bold text-gray-500 uppercase">Price</th>
                                <th className="text-center px-2 py-1.5 text-[9px] font-bold text-gray-500 uppercase">%</th>
                                <th className="text-right px-2 py-1.5 text-[9px] font-bold text-gray-500 uppercase">Payable</th>
                              </tr>
                            </thead>
                            <tbody>
                              {breakdown.items.map((it, i) => (
                                <tr key={i} className="border-t border-gray-100">
                                  <td className="px-2 py-1.5 font-medium text-gray-700">{it.name}</td>
                                  <td className="px-2 py-1.5 text-center">
                                    <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                      it.category === "clinic"
                                        ? "bg-blue-50 text-blue-700"
                                        : it.category === "pharmacy"
                                        ? "bg-green-50 text-green-700"
                                        : "bg-purple-50 text-purple-700"
                                    }`}>
                                      {it.category}
                                    </span>
                                  </td>
                                  <td className="px-2 py-1.5 text-right font-semibold text-gray-700">₹{it.price}</td>
                                  <td className="px-2 py-1.5 text-center font-semibold text-gray-600">{it.percent}%</td>
                                  <td className="px-2 py-1.5 text-right font-bold text-indigo-700">₹{it.payable}</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot className="bg-indigo-50 border-t-2 border-indigo-200">
                              <tr>
                                <td colSpan={4} className="px-2 py-2 text-right font-bold text-indigo-800 text-[11px]">
                                  Total Customer Payable
                                </td>
                                <td className="px-2 py-2 text-right font-extrabold text-indigo-900 text-[12px]">
                                  ₹{breakdown.total}
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {selectedCustomer.referralNotes && (
                  <div className="pt-3 border-t">
                    <div className="text-[10px] font-bold uppercase text-gray-400 mb-1">Notes</div>
                    <div className="text-xs font-medium text-gray-700 p-2 bg-white rounded-lg border border-gray-200">
                      {selectedCustomer.referralNotes}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowCustomerModal(false);
                    openCustomerPaymentModal(selectedCustomer, selectedBookingForCustomerModal);
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 flex items-center gap-1.5"
                >
                  <FiEdit2 className="w-3.5 h-3.5" /> Update Payment
                </button>
                <button
                  onClick={() => {
                    setShowCustomerModal(false);
                    setSelectedCustomer(null);
                    setSelectedBookingForCustomerModal(null);
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Customer Payment Status Update Modal */}
        {showCustomerPaymentModal && selectedCustomerForPayment && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border">
              <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center"><FaEdit /></div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Update Customer Payment</h3>
                    <p className="text-xs text-gray-500">{selectedCustomerForPayment.customerName}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowCustomerPaymentModal(false); setSelectedCustomerForPayment(null); setSelectedBookingForCustomerPayment(null); }}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>

              {selectedBookingForCustomerPayment && (
                <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                  <div className="text-xs text-indigo-700 font-bold uppercase">Customer Payable For This Booking</div>
                  <div className="text-lg font-extrabold text-indigo-900 mt-0.5">
                    ₹{getCustomerPayable(selectedCustomerForPayment, selectedBookingForCustomerPayment)}
                  </div>
                  <div className="text-[10px] text-indigo-600 mt-0.5">
                    Patient: {selectedBookingForCustomerPayment.patientName} • Total: ₹{Math.round(getBookingFinalPayable(selectedBookingForCustomerPayment))}
                  </div>
                </div>
              )}

              <div className="my-5">
                <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Customer Payment Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["Pending", "Paid"].map((st) => {
                    const isSelected = newCustomerPaymentStatus === st;
                    const colors = getPaymentStatusColors(st);
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setNewCustomerPaymentStatus(st)}
                        className={`px-3 py-2.5 rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 ${isSelected ? `${colors.bg} ${colors.text} border-blue-500 ring-2 ring-blue-400/20` : "border-gray-200 bg-white text-gray-700"}`}
                      >
                        <colors.icon className={`w-3.5 h-3.5 ${colors.iconColor}`} />
                        {st}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  onClick={() => { setShowCustomerPaymentModal(false); setSelectedCustomerForPayment(null); setSelectedBookingForCustomerPayment(null); }}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-100 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCustomerPaymentStatus}
                  disabled={savingCustomerPayment}
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 disabled:opacity-50"
                >
                  {savingCustomerPayment ? <FiRefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FiCheckCircle className="w-3.5 h-3.5" />}
                  {savingCustomerPayment ? "Saving..." : "Save Status"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}