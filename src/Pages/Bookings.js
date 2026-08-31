import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Printer,
  Trash2,
  RefreshCw,
  Sparkles,
  Eye,
  Phone,
  Users,
  UserCheck,
  Download,
  ChevronUp,
  ChevronDown,
  Edit,
  IndianRupee,
  PlusCircle,
  CreditCard,
  Plus,
  ReceiptText,
  FileText,
  Activity,
  Check,
  CalendarDays
} from "lucide-react";
import {
  FaSearch,
  FaUserMd,
  FaCalendarCheck,
  FaClock,
  FaTimes,
  FaRupeeSign,
  FaCheckCircle,
  FaRegCalendarAlt,
  FaPlus,
  FaTrashAlt,
  FaEye,
  FaUserInjured,
  FaFileInvoiceDollar,
  FaMoneyBillWave,
  FaPrint,
  FaStethoscope
} from "react-icons/fa";
import {
  FiUsers,
  FiUserCheck,
  FiClock,
  FiFilter,
  FiDownload,
  FiTrash2,
  FiPlus,
  FiEdit2,
  FiEye,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiCalendar,
  FiDollarSign,
  FiPlusCircle,
  FiFileText,
  FiCheck,
  FiChevronDown
} from "react-icons/fi";
import "./EmployeeDashboard.css";
import "./EmployeeLeaves.css";
import logo from "../Images/Timelyhealth logo.png";

const DAYS_OF_WEEK = [
  "All",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

const BOOKING_STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "confirmed", label: "Confirmed" },
  { value: "booked", label: "Booked" },
  { value: "consulting", label: "Consulting" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "pending", label: "Pending" }
];

const PAYMENT_STATUS_OPTIONS = [
  { value: "all", label: "All Payments" },
  { value: "Paid", label: "Paid" },
  { value: "Pending", label: "Pending" }
];

const CLINIC_INFO = {
  name: "TimelyHealth",
  address:
    "Flat No: 301, 3rd Floor, Sri Sai Balaji Avenue, H. No: 1-98/9/25/p, Opp Style on Studio, VIP Hills, near Bank of Baroda, Arunodaya Colony, Sri Sai Nagar, Madhapur, Hyderabad, Telangana 500081",
  contact: "9505397000"
};

const formatDateToDDMMYYYY = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return "N/A";
  }
};

const getStatusColors = (status) => {
  const statusMap = {
    booked: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
    completed: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
    consulting: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
    cancelled: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
    pending: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" },
    confirmed: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" }
  };
  return statusMap[status?.toLowerCase()] || statusMap.booked;
};

const Bookings = () => {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [dayFilter, setDayFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Active top card filter
  const [activeCardFilter, setActiveCardFilter] = useState("all");

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [newPaymentStatus, setNewPaymentStatus] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [paymentUpdating, setPaymentUpdating] = useState(false);

  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState(null);

  const [openStatusDropdown, setOpenStatusDropdown] = useState(null);
  const [openPaymentDropdown, setOpenPaymentDropdown] = useState(null);

  const [showBillingModal, setShowBillingModal] = useState(false);
  const [billingData, setBillingData] = useState({
    invoiceNo: "",
    invoiceDate: "",
    branch: "",
    doctorName: "",
    items: [],
    grossAmount: 0,
    netAmount: 0,
    paidAmount: 0,
    balanceAmount: 0,
    paymentStatus: "Pending"
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    const saved = localStorage.getItem("bookings_itemsPerPage");
    return saved ? parseInt(saved, 10) : 10;
  });

  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleAddOP = () => {
    navigate("/op-management");
  };

  useEffect(() => {
    fetchBookings();
    fetchServices();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".status-dropdown") && !e.target.closest(".payment-dropdown")) {
        setOpenStatusDropdown(null);
        setOpenPaymentDropdown(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/appointment-slots/getallbookings`);
      if (res && res.data && res.data.success) {
        const bookingsData = res.data.bookings || [];

        const transformedBookings = bookingsData.map((b) => {
          const slotDetails = b.slotDetails || {};

          return {
            _id: b._id || b.id,
            slotId: b.slotId || b._id,
            patientName: b.patientName || "",
            patientAge: b.patientAge || "",
            patientGender: b.patientGender || "Male",
            patientPhone: b.patientPhone || "",
            patientAddress: b.patientAddress || "",
            patientEmail: b.patientEmail || "",
            dayOfWeek: slotDetails.dayOfWeek || b.dayOfWeek || "",
            date: slotDetails.date || b.appointmentDate || b.date || "",
            startTime: slotDetails.startTime || b.startTime || "",
            endTime: slotDetails.endTime || b.endTime || "",
            startTime24: slotDetails.startTime24 || b.startTime24 || "",
            endTime24: slotDetails.endTime24 || b.endTime24 || "",
            doctorId: slotDetails.doctorId || b.doctorId || "",
            doctorName: slotDetails.doctorName || b.doctorName || "",
            doctorSpecialization:
              slotDetails.doctorSpecialization || b.doctorSpecialization || "",
            purpose: b.purpose || "",
            symptoms: b.symptoms || "",
            appointmentType: b.appointmentType || "Consultation",
            priority: b.priority || "Normal",
            consultationFee: b.consultationFee || 300,
            paymentType: b.paymentType || "cash",
            paymentStatus: b.paymentStatus || "Pending",
            totalAmount: b.totalAmount || b.consultationFee || 300,
            amountPaid: b.amountPaid || 0,
            balanceAmount: b.balanceAmount || 0,
            status: b.status || "confirmed",
            services: b.services || [],
            createdAt: b.createdAt || b.bookedAt || new Date().toISOString(),
            updatedAt: b.updatedAt || b.createdAt || new Date().toISOString(),
            bookedAt: b.bookedAt || b.createdAt || new Date().toISOString(),
            shift: b.shift || slotDetails.shift || "Morning Shift",
            patientBloodGroup: b.patientBloodGroup || "",
            patientMedicalHistory: b.patientMedicalHistory || "",
            patientAllergies: b.patientAllergies || "",
            patientMedications: b.patientMedications || "",
            notes: b.notes || "",
            clinicalNotes: b.clinicalNotes || "",
            diagnosis: b.diagnosis || "",
            prescription: b.prescription || "",
            labTestsOrdered: b.labTestsOrdered || [],
            imagingOrdered: b.imagingOrdered || [],
            totalFee: b.totalFee || b.consultationFee || 300,
            servicesTotal: b.servicesTotal || 0,
            grandTotal: b.grandTotal || b.consultationFee || 300
          };
        });

        setBookings(transformedBookings);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setBookings([]);
      showToast(error.response?.data?.message || "Failed to fetch bookings", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    setServicesLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/services/allservices`);
      if (res && res.data && res.data.success) {
        setServices(res.data.services || []);
      } else {
        setServices([]);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      setServices([]);
    } finally {
      setServicesLoading(false);
    }
  };

  const handleRowClick = (booking) => {
    setSelectedBooking(booking);
    setShowTicketModal(true);
  };

  const getTotalServiceFee = (booking) => {
    if (!booking.services || booking.services.length === 0) return 0;
    return booking.services.reduce((sum, s) => sum + (s.price || 0), 0);
  };

  const getTotalBookingFee = (booking) => {
    return (booking.consultationFee || 0) + getTotalServiceFee(booking);
  };

  // Open Billing Modal
  const openBillingModal = (booking) => {
    setSelectedBooking(booking);

    const consultationFee = booking.consultationFee || 0;
    const totalServiceFee = getTotalServiceFee(booking);
    const grossAmount = consultationFee + totalServiceFee;
    const isPaid = booking.paymentStatus === "Paid";
    const paidAmount = isPaid ? grossAmount : 0;
    const balanceAmount = isPaid ? 0 : grossAmount;

    const now = new Date();
    const dateStamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
      now.getDate()
    ).padStart(2, "0")}`;
    const shortId = String(booking._id || "").slice(-6).toUpperCase() || "000000";
    const invoiceNo = `${dateStamp}-${shortId}`;
    const dateTimeLabel = `${now.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    })} ${now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;

    const items = [
      {
        no: 1,
        name: "Consultation Fee",
        serviceCode: "CONS-01",
        remarks: booking.purpose || "OPD Consultation",
        amount: consultationFee
      },
      ...(booking.services || []).map((s, idx) => ({
        no: idx + 2,
        name: s.name,
        serviceCode: s.serviceId
          ? String(s.serviceId).slice(-6).toUpperCase()
          : `SVC-${String(idx + 1).padStart(2, "0")}`,
        remarks: s.description || s.paymentStatus || "Additional Service",
        amount: s.price || 0
      }))
    ];

    setBillingData({
      invoiceNo,
      invoiceDate: dateTimeLabel,
      branch: booking.doctorSpecialization || "Main Branch",
      doctorName: booking.doctorName || "General OP Doctor",
      items,
      grossAmount,
      netAmount: grossAmount,
      paidAmount,
      balanceAmount,
      paymentStatus: booking.paymentStatus || "Pending"
    });

    setShowBillingModal(true);
  };

  const handleMarkAsPaid = async () => {
    if (!selectedBooking) return;

    try {
      const res = await axios.put(`${API_BASE_URL}/appointment-slots/${selectedBooking._id}`, {
        paymentStatus: "Paid"
      });

      if (res && res.data && res.data.success) {
        setBookings((prev) =>
          prev.map((b) => (b._id === selectedBooking._id ? { ...b, paymentStatus: "Paid" } : b))
        );

        setBillingData((prev) => ({
          ...prev,
          paymentStatus: "Paid",
          paidAmount: prev.netAmount,
          balanceAmount: 0
        }));

        showToast(`Payment marked as Paid for ${selectedBooking.patientName}!`, "success");
      }
    } catch (error) {
      console.error("Error updating payment:", error);
      showToast("Failed to update payment status", "error");
    }
  };

  const printBill = () => {
    const billContent = document.getElementById("bill-content");
    if (!billContent) return;

    const itemsRows = billingData.items
      .map(
        (item) => `
      <tr>
        <td>${item.no}</td>
        <td>${item.name}</td>
        <td>${item.serviceCode}</td>
        <td>${item.remarks}</td>
        <td class="text-right">${Number(item.amount).toFixed(2)}</td>
      </tr>
    `
      )
      .join("");

    const win = window.open("", "_blank", "width=850,height=1000");
    if (win) {
      win.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <title>Bill - ${billingData.invoiceNo}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body {
                font-family: Arial, Helvetica, sans-serif;
                color: #222222;
                padding: 24px;
                background: #ffffff;
              }
              .bill-wrap {
                max-width: 820px;
                margin: 0 auto;
                border: 1px solid #999999;
                padding: 24px 28px;
                position: relative;
              }
              .top-header {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                border-bottom: 2px solid #222222;
                padding-bottom: 14px;
              }
              .top-header .brand {
                display: flex;
                align-items: center;
                gap: 14px;
              }
              .top-header .brand img {
                width: 60px;
                height: 60px;
                object-fit: contain;
              }
              .top-header .brand h1 {
                font-size: 20px;
                font-weight: bold;
                color: #111111;
              }
              .top-header .brand p {
                font-size: 11px;
                color: #555555;
                margin-top: 2px;
                max-width: 440px;
              }
              .top-header .contact {
                text-align: right;
                font-size: 11px;
                color: #555555;
              }
              .bar-title {
                text-align: center;
                background: #f1f1f1;
                border-top: 1px solid #999999;
                border-bottom: 1px solid #999999;
                padding: 6px 0;
                font-size: 13px;
                font-weight: bold;
                letter-spacing: 1.5px;
                margin: 10px 0 14px 0;
                text-transform: uppercase;
              }
              .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 4px 24px;
                font-size: 12px;
                margin-bottom: 14px;
              }
              .info-grid .label {
                color: #666666;
                font-weight: bold;
                display: inline-block;
                width: 120px;
              }
              table.items {
                width: 100%;
                border-collapse: collapse;
                border-top: 2px solid #222222;
                border-bottom: 2px solid #222222;
                margin-bottom: 12px;
              }
              table.items th {
                text-align: left;
                font-size: 11px;
                color: #555555;
                padding: 6px 4px;
                border-bottom: 1px solid #bbbbbb;
                text-transform: uppercase;
              }
              table.items td {
                font-size: 12px;
                padding: 6px 4px;
                border-bottom: 1px solid #eeeeee;
                color: #333333;
              }
              table.items td.text-right,
              table.items th.text-right {
                text-align: right;
              }
              .totals-box {
                width: 100%;
                max-width: 300px;
                margin-left: auto;
                font-size: 12px;
                margin-bottom: 12px;
              }
              .totals-box .row {
                display: flex;
                justify-content: space-between;
                padding: 4px 0;
                border-bottom: 1px solid #eeeeee;
              }
              .totals-box .row.final {
                border-top: 2px solid #222222;
                border-bottom: none;
                font-weight: bold;
                padding-top: 8px;
                margin-top: 4px;
                font-size: 13px;
              }
              .footer-row {
                display: flex;
                justify-content: flex-end;
                gap: 8px;
                font-size: 11px;
                color: #555555;
                border-top: 1px solid #dddddd;
                padding-top: 12px;
                margin-top: 10px;
              }
              .signature-section {
                display: flex;
                justify-content: flex-end;
                margin-top: 8px;
              }
              @media print {
                body { padding: 0; }
                .bill-wrap { border: none; }
              }
            </style>
          </head>
          <body>
            <div class="bill-wrap">
              <div class="top-header">
                <div class="brand">
                  <img src="${logo}" alt="${CLINIC_INFO.name}" />
                  <div>
                    <h1>${CLINIC_INFO.name}</h1>
                    <p>${CLINIC_INFO.address}</p>
                  </div>
                </div>
                <div class="contact">
                  Contact No : ${CLINIC_INFO.contact}
                </div>
              </div>

              <div class="bar-title">Bill Cum Receipt</div>

              <div class="info-grid">
                <div><span class="label">Name</span>: ${selectedBooking?.patientName || "N/A"}</div>
                <div><span class="label">Invoice No / Date</span>: ${billingData.invoiceNo} / ${billingData.invoiceDate}</div>
                <div><span class="label">Age</span>: ${selectedBooking?.patientAge || "N/A"} Yrs</div>
                <div><span class="label">Gender</span>: ${selectedBooking?.patientGender || "N/A"}</div>
                <div><span class="label">Branch</span>: ${billingData.branch}</div>
                <div><span class="label">Contact No</span>: ${selectedBooking?.patientPhone || "N/A"}</div>
                <div><span class="label">Doctor</span>: ${billingData.doctorName}</div>
                <div><span class="label">Appt. Date</span>: ${formatDateToDDMMYYYY(selectedBooking?.date)}</div>
              </div>

              <table class="items">
                <thead>
                  <tr>
                    <th style="width:6%;">No.</th>
                    <th style="width:34%;">Service / Item</th>
                    <th style="width:18%;">Service Code</th>
                    <th style="width:24%;">Remarks</th>
                    <th style="width:18%;" class="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRows}
                </tbody>
              </table>

              <div class="totals-box">
                <div class="row"><span>Gross Bill Amount</span><span>₹ ${billingData.grossAmount.toFixed(2)}</span></div>
                <div class="row"><span>Net Amount</span><span>₹ ${billingData.netAmount.toFixed(2)}</span></div>
                <div class="row"><span>Paid Amount</span><span>₹ ${billingData.paidAmount.toFixed(2)}</span></div>
                <div class="row final"><span>Balance to Pay</span><span>₹ ${billingData.balanceAmount.toFixed(2)}</span></div>
              </div>

              <div class="footer-row">
                <span>Printed Date : ${new Date().toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric"
                })} ${new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit"
      })}</span>
              </div>
              <div class="signature-section">
                <span class="sig" style="font-weight:bold;">Authorized Signature</span>
              </div>
            </div>
          </body>
        </html>
      `);
      win.document.close();
      win.focus();
      setTimeout(() => {
        win.print();
      }, 500);
    }
  };

  // Quick Inline Status Update
  const handleInlineStatusUpdate = async (bookingId, statusVal, patientName) => {
    try {
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: statusVal } : b))
      );
      await axios.put(`${API_BASE_URL}/appointment-slots/${bookingId}`, { status: statusVal });
      showToast(`Status updated to '${statusVal}' for ${patientName}!`, "success");
      setOpenStatusDropdown(null);
    } catch (error) {
      console.error("Error updating status:", error);
      showToast("Failed to update status", "error");
      fetchBookings();
    }
  };

  // Quick Inline Payment Update
  const handleInlinePaymentUpdate = async (bookingId, paymentVal, patientName) => {
    try {
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, paymentStatus: paymentVal } : b))
      );
      await axios.put(`${API_BASE_URL}/appointment-slots/${bookingId}`, {
        paymentStatus: paymentVal
      });
      showToast(`Payment updated to '${paymentVal}' for ${patientName}!`, "success");
      setOpenPaymentDropdown(null);
    } catch (error) {
      console.error("Error updating payment status:", error);
      showToast("Failed to update payment status", "error");
      fetchBookings();
    }
  };

  // Delete Booking
  const handleDeleteBooking = async (booking) => {
    if (
      !window.confirm(
        `Are you sure you want to cancel and delete the booking for "${booking.patientName}"?`
      )
    ) {
      return;
    }

    try {
      const res = await axios.delete(
        `${API_BASE_URL}/appointment-slots/booking/${booking._id}`
      );
      if (res && res.data && res.data.success) {
        setBookings((prev) => prev.filter((b) => b._id !== booking._id));
        showToast("Booking deleted successfully!", "info");
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
      showToast(error.response?.data?.message || "Failed to delete booking", "error");
    }
  };

  // Add Service to Booking
  const openAddServiceModal = (booking) => {
    setSelectedBooking(booking);
    setSelectedServiceId("");
    setSelectedServiceForBooking(null);
    setServiceDropdownOpen(false);
    setShowAddServiceModal(true);
  };

  const handleAddServiceToBooking = async () => {
    if (!selectedBooking || !selectedServiceForBooking) {
      showToast("Please select a service", "error");
      return;
    }

    try {
      const res = await axios.post(
        `${API_BASE_URL}/services/addservicestobooking/${selectedBooking._id}`,
        {
          serviceId: selectedServiceForBooking._id,
          name: selectedServiceForBooking.name,
          price: selectedServiceForBooking.price,
          description: selectedServiceForBooking.description || ""
        }
      );

      if (res && res.data && res.data.success) {
        showToast(res.data.message, "success");
        setShowAddServiceModal(false);
        fetchBookings();
      }
    } catch (error) {
      console.error("Error adding service:", error);
      showToast(error.response?.data?.message || "Failed to add service", "error");
    }
  };

  const handleRemoveService = async (booking, serviceId, serviceName) => {
    if (!window.confirm(`Remove "${serviceName}" from this booking?`)) return;

    try {
      const res = await axios.delete(
        `${API_BASE_URL}/services/deleteservicestobooking/${booking._id}/${serviceId}`
      );
      if (res && res.data && res.data.success) {
        showToast(res.data.message, "info");
        fetchBookings();
      }
    } catch (error) {
      console.error("Error removing service:", error);
      showToast(error.response?.data?.message || "Failed to remove service", "error");
    }
  };

  const handleCardClick = (type) => {
    setActiveCardFilter(type);
    setCurrentPage(1);
    if (type === "all") {
      setStatusFilter("all");
      setPaymentFilter("all");
    } else if (type === "confirmed") {
      setStatusFilter("confirmed");
    } else if (type === "completed") {
      setStatusFilter("completed");
    } else if (type === "pending_payment") {
      setPaymentFilter("Pending");
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setDayFilter("All");
    setStatusFilter("all");
    setPaymentFilter("all");
    setFromDate("");
    setToDate("");
    setActiveCardFilter("all");
    setCurrentPage(1);
  };

  const isFilterActive =
    searchQuery !== "" ||
    dayFilter !== "All" ||
    statusFilter !== "all" ||
    paymentFilter !== "all" ||
    fromDate !== "" ||
    toDate !== "";

  // Filtered Bookings Memo
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (statusFilter !== "all") {
        if (statusFilter === "confirmed" && b.status !== "confirmed" && b.status !== "booked")
          return false;
        else if (statusFilter !== "confirmed" && b.status !== statusFilter) return false;
      }

      if (paymentFilter !== "all" && b.paymentStatus !== paymentFilter) return false;

      if (dayFilter !== "All" && b.dayOfWeek?.toLowerCase() !== dayFilter.toLowerCase())
        return false;

      if (b.date || b.appointmentDate) {
        const bDate = new Date(b.date || b.appointmentDate);
        if (fromDate && toDate) {
          const from = new Date(fromDate);
          from.setHours(0, 0, 0, 0);
          const to = new Date(toDate);
          to.setHours(23, 59, 59, 999);
          if (bDate < from || bDate > to) return false;
        } else if (fromDate && !toDate) {
          const from = new Date(fromDate);
          from.setHours(0, 0, 0, 0);
          if (bDate < from) return false;
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (b.patientName || "").toLowerCase().includes(q);
        const matchPhone = (b.patientPhone || "").toLowerCase().includes(q);
        const matchDoctor = (b.doctorName || "").toLowerCase().includes(q);
        const matchPurpose = (b.purpose || "").toLowerCase().includes(q);
        const matchAddress = (b.patientAddress || "").toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchDoctor && !matchPurpose && !matchAddress)
          return false;
      }

      return true;
    });
  }, [bookings, statusFilter, paymentFilter, dayFilter, fromDate, toDate, searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, paymentFilter, dayFilter, fromDate, toDate]);

  // Stats
  const stats = useMemo(() => {
    const total = bookings.length;
    const confirmed = bookings.filter(
      (b) => b.status === "confirmed" || b.status === "booked"
    ).length;
    const completed = bookings.filter((b) => b.status === "completed").length;
    const pendingPayment = bookings.filter((b) => b.paymentStatus === "Pending").length;
    const totalRevenue = bookings
      .filter((b) => b.paymentStatus === "Paid")
      .reduce((sum, b) => sum + getTotalBookingFee(b), 0);

    return { total, confirmed, completed, pendingPayment, totalRevenue };
  }, [bookings]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRecords = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  const handleItemsPerPageChange = (e) => {
    const newValue = Number(e.target.value);
    setItemsPerPage(newValue);
    localStorage.setItem("bookings_itemsPerPage", String(newValue));
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

  // Export CSV
  const downloadCSV = () => {
    if (filteredBookings.length === 0) {
      showToast("No bookings data available to export!", "error");
      return;
    }

    const headers = [
      "#",
      "Patient Name",
      "Age",
      "Gender",
      "Phone",
      "Doctor Name",
      "Doctor Specialty",
      "Appt Date",
      "Day",
      "Time Slot",
      "Shift",
      "Status",
      "Payment Status",
      "Consultation Fee",
      "Services Total",
      "Grand Total (INR)",
      "Purpose"
    ];

    const csvRows = [
      headers.join(","),
      ...filteredBookings.map((b, idx) => [
        idx + 1,
        `"${(b.patientName || "").replace(/"/g, '""')}"`,
        b.patientAge || "",
        `"${b.patientGender || "Male"}"`,
        `"${b.patientPhone || ""}"`,
        `"${(b.doctorName || "").replace(/"/g, '""')}"`,
        `"${(b.doctorSpecialization || "").replace(/"/g, '""')}"`,
        `"${formatDateToDDMMYYYY(b.date)}"`,
        `"${b.dayOfWeek || ""}"`,
        `"${b.startTime || ""} - ${b.endTime || ""}"`,
        `"${b.shift || ""}"`,
        `"${b.status || ""}"`,
        `"${b.paymentStatus || ""}"`,
        b.consultationFee || 300,
        getTotalServiceFee(b),
        getTotalBookingFee(b),
        `"${(b.purpose || "").replace(/"/g, '""')}"`
      ].join(","))
    ];

    const csvData = csvRows.join("\n");
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filteredBookings.length} bookings to CSV!`);
  };

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
              Appointment <span>Bookings</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="emp-dash__date-pill">
              <FaCalendarCheck />
              <span>{bookings.length} Total Bookings</span>
            </div>
            <button
              onClick={fetchBookings}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
              title="Refresh Bookings"
            >
              <FiRefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={downloadCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all shadow-sm"
              title="Export CSV"
            >
              <FiDownload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button
              onClick={handleAddOP}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm"
            >
              <FiPlus className="w-3.5 h-3.5" />
              <span>Add OPD Patient</span>
            </button>
          </div>
        </div>

        {/* ===================== TOP KPI STATS GRID ===================== */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
          {/* Total Bookings */}
          <div
            className={`emp-dash__stat cursor-pointer hover:scale-105 transition-transform duration-200 ${
              activeCardFilter === "all" ? "ring-2 ring-blue-500/20 border-blue-400" : ""
            }`}
            onClick={() => handleCardClick("all")}
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Bookings</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FiCalendar />
              </div>
            </div>
            <div className="emp-dash__stat-value">{stats.total}</div>
            <div className="emp-dash__stat-meta">all appointments</div>
          </div>

          {/* Confirmed / Booked */}
          <div
            className={`emp-dash__stat cursor-pointer hover:scale-105 transition-transform duration-200 ${
              activeCardFilter === "confirmed" ? "ring-2 ring-blue-500/20 border-blue-400" : ""
            }`}
            onClick={() => handleCardClick("confirmed")}
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Confirmed</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FiUsers />
              </div>
            </div>
            <div className="emp-dash__stat-value text-blue-700">{stats.confirmed}</div>
            <div className="emp-dash__stat-meta">active bookings</div>
          </div>

          {/* Completed */}
          <div
            className={`emp-dash__stat cursor-pointer hover:scale-105 transition-transform duration-200 ${
              activeCardFilter === "completed" ? "ring-2 ring-emerald-500/20 border-emerald-400" : ""
            }`}
            onClick={() => handleCardClick("completed")}
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Completed</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <FiCheckCircle />
              </div>
            </div>
            <div className="emp-dash__stat-value text-emerald-600">{stats.completed}</div>
            <div className="emp-dash__stat-meta">consultations done</div>
          </div>

          {/* Pending Payment */}
          <div
            className={`emp-dash__stat cursor-pointer hover:scale-105 transition-transform duration-200 ${
              activeCardFilter === "pending_payment"
                ? "ring-2 ring-amber-500/20 border-amber-400"
                : ""
            }`}
            onClick={() => handleCardClick("pending_payment")}
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Pending Payment</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                <FiClock />
              </div>
            </div>
            <div className="emp-dash__stat-value text-amber-600">{stats.pendingPayment}</div>
            <div className="emp-dash__stat-meta">awaiting payment</div>
          </div>

          {/* Total Revenue */}
          <div className="emp-dash__stat col-span-2 lg:col-span-1">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Paid Revenue</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <FaRupeeSign />
              </div>
            </div>
            <div className="emp-dash__stat-value text-base sm:text-lg md:text-xl font-bold truncate text-emerald-700">
              ₹{stats.totalRevenue.toLocaleString()}
            </div>
            <div className="emp-dash__stat-meta">collected fees</div>
          </div>
        </div>

        {/* ===================== FILTERS CARD ===================== */}
        <div className="emp-dash__card mb-6">
          {/* Desktop Filter Bar */}
          <div className="hidden lg:block">
            <div className="flex items-center justify-between gap-3 p-3 bg-white rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
                {/* Search */}
                <div className="relative min-w-[150px] flex-1 max-w-[220px]">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  <input
                    type="text"
                    placeholder="Search patient, doctor, phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  />
                </div>

                {/* Booking Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                    statusFilter !== "all"
                      ? "border-blue-500 text-blue-700 bg-blue-50"
                      : "border-gray-300 text-gray-700"
                  }`}
                >
                  {BOOKING_STATUS_OPTIONS.map((st) => (
                    <option key={st.value} value={st.value}>
                      {st.label}
                    </option>
                  ))}
                </select>

                {/* Payment Status Filter */}
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                    paymentFilter !== "all"
                      ? "border-blue-500 text-blue-700 bg-blue-50"
                      : "border-gray-300 text-gray-700"
                  }`}
                >
                  {PAYMENT_STATUS_OPTIONS.map((st) => (
                    <option key={st.value} value={st.value}>
                      {st.label}
                    </option>
                  ))}
                </select>

                {/* Day Filter */}
                <select
                  value={dayFilter}
                  onChange={(e) => setDayFilter(e.target.value)}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                    dayFilter !== "All"
                      ? "border-blue-500 text-blue-700 bg-blue-50"
                      : "border-gray-300 text-gray-700"
                  }`}
                >
                  {DAYS_OF_WEEK.map((day) => (
                    <option key={day} value={day}>
                      {day === "All" ? "All Days" : day}
                    </option>
                  ))}
                </select>

                {/* Date Range */}
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-[120px] h-8 px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                />
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-[120px] h-8 px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                />
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

          {/* Mobile Filter Bar */}
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
                <strong>{filteredBookings.length}</strong> bookings
              </span>
            </div>

            {showMobileFilters && (
              <div className="mt-2 p-4 bg-white rounded-xl border border-gray-200 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Search</label>
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                    <input
                      type="text"
                      placeholder="Search patient, doctor, phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Booking Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                    >
                      {BOOKING_STATUS_OPTIONS.map((st) => (
                        <option key={st.value} value={st.value}>
                          {st.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Payment Status</label>
                    <select
                      value={paymentFilter}
                      onChange={(e) => setPaymentFilter(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                    >
                      {PAYMENT_STATUS_OPTIONS.map((st) => (
                        <option key={st.value} value={st.value}>
                          {st.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">From Date</label>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">To Date</label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                    />
                  </div>
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

        {/* ===================== BOOKINGS TABLE SECTION ===================== */}
        <div className="emp-dash__card">
          {loading ? (
            <div className="py-12 text-center text-gray-500">
              <FiRefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">Loading bookings data...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-700">No Bookings Found</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto mb-4">
                {bookings.length === 0
                  ? "No appointments booked yet. Click 'Add OPD Patient' to register a booking."
                  : "No bookings match your current search/date filters."}
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
                  onClick={handleAddOP}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm inline-flex items-center gap-1.5"
                >
                  <FiPlus className="w-3.5 h-3.5" /> Add OPD Patient
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="emp-dash__table">
                  <thead>
                    <tr>
                      <th style={{ width: "40px", textAlign: "center" }}>S.No</th>
                      <th>Patient Details</th>
                      <th>Doctor</th>
                      <th style={{ textAlign: "center" }}>Date &amp; Slot</th>
                      <th style={{ textAlign: "center" }}>Fee</th>
                      <th style={{ textAlign: "center" }}>Booking Status</th>
                      <th style={{ textAlign: "center" }}>Payment</th>
                      <th>Purpose</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecords.map((booking, idx) => {
                      const totalFee = getTotalBookingFee(booking);
                      const isPaid = booking.paymentStatus === "Paid";
                      const statusColors = getStatusColors(booking.status);
                      const servicesCount = (booking.services || []).length;

                      return (
                        <tr
                          key={booking._id}
                          className="transition-colors hover:bg-blue-50/40 cursor-pointer"
                          onClick={() => handleRowClick(booking)}
                        >
                          {/* Row Index */}
                          <td className="px-3 py-3 font-semibold text-center text-slate-500 text-[11px]">
                            {indexOfFirstItem + idx + 1}
                          </td>

                          {/* Patient Details - Name, Age, Gender */}
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-xs shadow-sm">
                                {booking.patientName ? booking.patientName.charAt(0).toUpperCase() : "P"}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-slate-800 text-xs truncate">
                                  {booking.patientName || "N/A"}
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-gray-500">
                                  <span>{booking.patientAge ? `${booking.patientAge} Yrs` : ""}</span>
                                  {booking.patientGender && (
                                    <span>• {booking.patientGender}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Doctor - Doctor Name Only */}
                          <td className="px-3 py-3">
                            <div
                              className="text-xs font-semibold text-slate-800 truncate max-w-[160px]"
                              title={booking.doctorName}
                            >
                              {booking.doctorName || "General OP Doctor"}
                            </div>
                          </td>

                          {/* Date & Slot - Date and Time Slot Only */}
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <div className="font-semibold text-slate-800 text-xs">
                              {formatDateToDDMMYYYY(booking.date)}
                            </div>
                            <div className="text-[11px] font-medium text-gray-600 mt-0.5">
                              {booking.startTime} – {booking.endTime}
                            </div>
                          </td>

                          {/* Fee */}
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <div className="text-xs font-bold text-slate-800">
                              ₹{totalFee}
                            </div>
                            {servicesCount > 0 && (
                              <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200 block mt-0.5">
                                +{servicesCount} service{servicesCount > 1 ? "s" : ""}
                              </span>
                            )}
                          </td>

                          {/* Inline Booking Status Dropdown */}
                          <td
                            className="px-3 py-3 text-center whitespace-nowrap status-dropdown"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="relative inline-block">
                              <button
                                onClick={() =>
                                  setOpenStatusDropdown(
                                    openStatusDropdown === booking._id ? null : booking._id
                                  )
                                }
                                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider transition-all border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}
                              >
                                {booking.status || "confirmed"}
                                <FiChevronDown className="w-3 h-3 opacity-70" />
                              </button>

                              {openStatusDropdown === booking._id && (
                                <div className="absolute left-1/2 -translate-x-1/2 mt-1 w-32 bg-white rounded-lg shadow-xl border border-gray-200 z-30 py-1">
                                  {["confirmed", "consulting", "completed", "cancelled", "pending"].map(
                                    (st) => (
                                      <button
                                        key={st}
                                        onClick={() =>
                                          handleInlineStatusUpdate(
                                            booking._id,
                                            st,
                                            booking.patientName
                                          )
                                        }
                                        className={`w-full text-left px-3 py-1.5 text-xs font-semibold capitalize hover:bg-gray-50 flex items-center justify-between ${
                                          booking.status === st
                                            ? "text-blue-600 bg-blue-50"
                                            : "text-gray-700"
                                        }`}
                                      >
                                        <span>{st}</span>
                                        {booking.status === st && <FiCheck className="w-3 h-3" />}
                                      </button>
                                    )
                                  )}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Inline Payment Status Dropdown */}
                          <td
                            className="px-3 py-3 text-center whitespace-nowrap payment-dropdown"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="relative inline-block">
                              <button
                                onClick={() =>
                                  setOpenPaymentDropdown(
                                    openPaymentDropdown === booking._id ? null : booking._id
                                  )
                                }
                                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider transition-all border ${
                                  isPaid
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                    : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                                }`}
                              >
                                {isPaid ? (
                                  <FaCheckCircle className="text-emerald-600 text-[10px]" />
                                ) : (
                                  <FaClock className="text-amber-600 text-[10px]" />
                                )}
                                {booking.paymentStatus || "Pending"}
                                <FiChevronDown className="w-3 h-3 opacity-70" />
                              </button>

                              {openPaymentDropdown === booking._id && (
                                <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-xl border border-gray-200 z-30 py-1">
                                  <button
                                    onClick={() =>
                                      handleInlinePaymentUpdate(
                                        booking._id,
                                        "Paid",
                                        booking.patientName
                                      )
                                    }
                                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-emerald-50 text-emerald-700 font-semibold flex items-center gap-1.5"
                                  >
                                    <FaCheckCircle className="text-emerald-600 text-[11px]" />
                                    Paid
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleInlinePaymentUpdate(
                                        booking._id,
                                        "Pending",
                                        booking.patientName
                                      )
                                    }
                                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-amber-50 text-amber-700 font-semibold flex items-center gap-1.5"
                                  >
                                    <FaClock className="text-amber-600 text-[11px]" />
                                    Pending
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Purpose */}
                          <td className="px-3 py-3">
                            <div
                              className="truncate text-xs text-slate-700 max-w-[130px]"
                              title={booking.purpose}
                            >
                              {booking.purpose || "General Consultation"}
                            </div>
                          </td>

                          {/* Action Icons */}
                          <td
                            className="px-3 py-3 text-right whitespace-nowrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleRowClick(booking)}
                                className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                                title="View Appointment Details"
                              >
                                <FiEye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openAddServiceModal(booking)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                title="Add Clinical Service"
                              >
                                <FiPlusCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openBillingModal(booking)}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-100"
                                title="View & Print Bill"
                              >
                                <FaFileInvoiceDollar className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteBooking(booking)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                title="Cancel & Delete Booking"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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
                      {filteredBookings.length === 0 ? 0 : indexOfFirstItem + 1} -{" "}
                      {Math.min(indexOfLastItem, filteredBookings.length)}
                    </strong>{" "}
                    of <strong className="text-gray-800">{filteredBookings.length}</strong> records
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

        {/* ===================== APPOINTMENT DETAILS / TICKET MODAL ===================== */}
        {showTicketModal && selectedBooking && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
              <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">
                      Appointment Summary &amp; Clinical Details
                    </h3>
                    <p className="text-xs text-gray-500">
                      {selectedBooking.patientName} • {selectedBooking.dayOfWeek} (
                      {formatDateToDDMMYYYY(selectedBooking.date)})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTicketModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Patient Profile Card */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <div className="text-[10px] font-bold uppercase text-gray-400">Patient Name</div>
                      <div className="font-bold text-gray-900">{selectedBooking.patientName}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-gray-400">Contact Number</div>
                      <div className="font-bold text-gray-900">{selectedBooking.patientPhone || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-gray-400">Age / Gender</div>
                      <div className="font-bold text-gray-900">
                        {selectedBooking.patientAge ? `${selectedBooking.patientAge} Yrs` : "N/A"} •{" "}
                        {selectedBooking.patientGender}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-gray-400">Payment Status</div>
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                          selectedBooking.paymentStatus === "Paid"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {selectedBooking.paymentStatus || "Pending"}
                      </span>
                    </div>
                  </div>
                  {selectedBooking.patientAddress && (
                    <div className="mt-2.5 pt-2.5 border-t border-gray-200 text-xs">
                      <span className="font-bold text-gray-400 uppercase text-[10px] block">Address</span>
                      <span className="text-gray-700">{selectedBooking.patientAddress}</span>
                    </div>
                  )}
                </div>

                {/* Doctor & Timing Info */}
                <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200/80">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <div className="text-[10px] font-bold uppercase text-blue-700">Doctor</div>
                      <div className="font-bold text-gray-900">{selectedBooking.doctorName}</div>
                      <div className="text-[10px] text-gray-500">{selectedBooking.doctorSpecialization}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-blue-700">Appointment Date</div>
                      <div className="font-bold text-gray-900">{formatDateToDDMMYYYY(selectedBooking.date)}</div>
                      <div className="text-[10px] text-gray-500">{selectedBooking.dayOfWeek}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-blue-700">Slot Time &amp; Shift</div>
                      <div className="font-bold text-gray-900">
                        {selectedBooking.startTime} – {selectedBooking.endTime}
                      </div>
                      <div className="text-[10px] text-gray-500">{selectedBooking.shift}</div>
                    </div>
                  </div>
                </div>

                {/* Fee & Additional Services Breakdown */}
                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200/70">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                      Fee Breakdown
                    </span>
                    <span className="text-sm font-extrabold text-blue-950">
                      Total: ₹{getTotalBookingFee(selectedBooking)}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs text-gray-700">
                    <div className="flex justify-between">
                      <span>Consultation Fee</span>
                      <span className="font-bold">₹{selectedBooking.consultationFee || 300}</span>
                    </div>
                    {selectedBooking.services && selectedBooking.services.length > 0 && (
                      <div className="pt-2 border-t border-emerald-100 space-y-1">
                        <div className="text-[10px] font-bold uppercase text-emerald-800">
                          Additional Services ({selectedBooking.services.length})
                        </div>
                        {selectedBooking.services.map((svc, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-white p-1.5 rounded border border-emerald-100">
                            <span>{svc.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-emerald-700">₹{svc.price}</span>
                              <button
                                onClick={() => {
                                  const serviceId = svc.serviceId || svc._id;
                                  if (serviceId)
                                    handleRemoveService(selectedBooking, serviceId, svc.name);
                                }}
                                className="text-red-500 hover:text-red-700 p-0.5"
                                title="Remove Service"
                              >
                                <FaTimes className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Clinical Notes if available */}
                {(selectedBooking.diagnosis || selectedBooking.prescription || selectedBooking.purpose) && (
                  <div className="bg-purple-50/50 p-3.5 rounded-xl border border-purple-100 text-xs space-y-1">
                    <div className="text-[10px] font-bold uppercase text-purple-800 mb-1">
                      Clinical Notes &amp; Purpose
                    </div>
                    {selectedBooking.purpose && (
                      <div>
                        <strong className="text-purple-900">Purpose:</strong>{" "}
                        <span className="text-gray-700">{selectedBooking.purpose}</span>
                      </div>
                    )}
                    {selectedBooking.diagnosis && (
                      <div>
                        <strong className="text-purple-900">Diagnosis:</strong>{" "}
                        <span className="text-gray-700">{selectedBooking.diagnosis}</span>
                      </div>
                    )}
                    {selectedBooking.prescription && (
                      <div>
                        <strong className="text-purple-900">Prescription:</strong>{" "}
                        <span className="text-gray-700">{selectedBooking.prescription}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50/50">
                <button
                  onClick={() => {
                    setShowTicketModal(false);
                    openBillingModal(selectedBooking);
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all flex items-center gap-1.5"
                >
                  <FaFileInvoiceDollar className="w-3.5 h-3.5" /> View / Print Bill
                </button>
                <button
                  onClick={() => setShowTicketModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-200 hover:bg-gray-300 text-gray-700 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================== BILLING MODAL ===================== */}
        {showBillingModal && selectedBooking && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-gray-200 relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
                    <FaFileInvoiceDollar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Bill Cum Receipt</h3>
                    <p className="text-xs text-gray-500">
                      {selectedBooking.patientName} • {billingData.invoiceNo}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBillingModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>

              <div id="bill-content" className="p-6 md:p-8 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.04] pointer-events-none w-64 h-64">
                  <img src={logo} alt={CLINIC_INFO.name} className="w-full h-full object-contain" />
                </div>

                <div className="relative z-10">
                  <div className="flex items-start justify-between border-b-2 border-gray-800 pb-4 mb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <img src={logo} alt={CLINIC_INFO.name} className="w-14 h-14 object-contain" />
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 tracking-wide">{CLINIC_INFO.name}</h2>
                        <p className="text-[11px] text-gray-500 max-w-sm">{CLINIC_INFO.address}</p>
                      </div>
                    </div>
                    <div className="text-right text-[11px] text-gray-500">
                      Contact No : {CLINIC_INFO.contact}
                    </div>
                  </div>

                  <div className="text-center bg-gray-100 border-y border-gray-300 py-1.5 mb-4">
                    <span className="text-sm font-bold tracking-widest text-gray-800 uppercase">
                      Bill Cum Receipt
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs mb-5">
                    <div>
                      <span className="font-bold text-gray-500 inline-block w-28">Name</span>:{" "}
                      <span className="font-semibold text-gray-900">{selectedBooking.patientName || "N/A"}</span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-500 inline-block w-28">Invoice No / Date</span>:{" "}
                      <span className="font-semibold text-gray-900">
                        {billingData.invoiceNo} / {billingData.invoiceDate}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-500 inline-block w-28">Age</span>:{" "}
                      <span className="font-semibold text-gray-900">{selectedBooking.patientAge || "N/A"} Yrs</span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-500 inline-block w-28">Gender</span>:{" "}
                      <span className="font-semibold text-gray-900">{selectedBooking.patientGender || "N/A"}</span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-500 inline-block w-28">Branch</span>:{" "}
                      <span className="font-semibold text-gray-900">{billingData.branch}</span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-500 inline-block w-28">Contact No</span>:{" "}
                      <span className="font-semibold text-gray-900">{selectedBooking.patientPhone || "N/A"}</span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-500 inline-block w-28">Doctor</span>:{" "}
                      <span className="font-semibold text-gray-900">{billingData.doctorName}</span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-500 inline-block w-28">Appt. Date</span>:{" "}
                      <span className="font-semibold text-gray-900">
                        {formatDateToDDMMYYYY(selectedBooking.date)}
                      </span>
                    </div>
                  </div>

                  <table className="w-full mb-3 border-t-2 border-b-2 border-gray-800">
                    <thead>
                      <tr className="border-b border-gray-300">
                        <th className="text-left py-1.5 text-[11px] font-bold text-gray-600 w-8">No.</th>
                        <th className="text-left py-1.5 text-[11px] font-bold text-gray-600">Service / Item</th>
                        <th className="text-left py-1.5 text-[11px] font-bold text-gray-600">Service Code</th>
                        <th className="text-left py-1.5 text-[11px] font-bold text-gray-600">Remarks</th>
                        <th className="text-right py-1.5 text-[11px] font-bold text-gray-600">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billingData.items.map((item) => (
                        <tr key={item.no} className="border-b border-gray-100">
                          <td className="py-1.5 text-xs text-gray-700">{item.no}</td>
                          <td className="py-1.5 text-xs font-medium text-gray-800">{item.name}</td>
                          <td className="py-1.5 text-xs text-gray-600">{item.serviceCode}</td>
                          <td className="py-1.5 text-xs text-gray-500">{item.remarks}</td>
                          <td className="py-1.5 text-xs text-right font-semibold text-gray-800">
                            {Number(item.amount).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="flex flex-col items-end mb-3">
                    <div className="w-full max-w-xs text-xs">
                      <div className="flex justify-between py-1 border-b border-gray-200">
                        <span className="text-gray-600">Gross Bill Amount</span>
                        <span className="font-bold text-gray-900">₹ {billingData.grossAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-200">
                        <span className="text-gray-600">Net Amount</span>
                        <span className="font-bold text-gray-900">₹ {billingData.netAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-200">
                        <span className="text-gray-600">Paid Amount</span>
                        <span className="font-bold text-emerald-700">₹ {billingData.paidAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between py-1.5 mt-1 border-t-2 border-gray-800">
                        <span className="font-bold text-gray-800">Balance to Pay</span>
                        <span
                          className={`font-bold ${
                            billingData.balanceAmount > 0 ? "text-red-600" : "text-emerald-700"
                          }`}
                        >
                          ₹ {billingData.balanceAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-2 pt-4 mt-2 border-t border-gray-200 text-[11px] text-gray-500">
                    <span>
                      Printed Date :{" "}
                      {new Date().toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      })}{" "}
                      {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className="font-bold text-gray-700">Authorized Signature</span>
                  </div>
                  <div className="mt-3 text-[10px] text-gray-400 italic">
                    * Bills cannot be cancelled once registered.
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50/50">
                {billingData.paymentStatus === "Pending" && (
                  <button
                    onClick={handleMarkAsPaid}
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <FaCheckCircle className="w-3.5 h-3.5" /> Mark as Paid
                  </button>
                )}
                <button
                  onClick={printBill}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all flex items-center gap-1.5"
                >
                  <FaPrint className="w-3.5 h-3.5" /> Print Bill
                </button>
                <button
                  onClick={() => setShowBillingModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-200 hover:bg-gray-300 text-gray-700 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================== ADD SERVICE MODAL ===================== */}
        {showAddServiceModal && selectedBooking && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <FiPlusCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Add Clinical Service</h3>
                    <p className="text-xs text-gray-500">
                      {selectedBooking.patientName} • {selectedBooking.dayOfWeek}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddServiceModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>

              <div className="my-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">
                    Current Services
                  </label>
                  <div className="px-3.5 py-2 bg-gray-50 rounded-lg border border-gray-200 text-xs font-medium">
                    {selectedBooking.services && selectedBooking.services.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {selectedBooking.services.map((svc, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200"
                          >
                            {svc.name} (₹{svc.price})
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">No services currently added</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">
                    Select Service <span className="text-red-500">*</span>
                  </label>
                  <button
                    onClick={() => setServiceDropdownOpen(!serviceDropdownOpen)}
                    className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white flex items-center justify-between"
                  >
                    <span
                      className={
                        selectedServiceForBooking ? "text-gray-900 font-semibold" : "text-gray-400"
                      }
                    >
                      {selectedServiceForBooking
                        ? `${selectedServiceForBooking.name} (₹${selectedServiceForBooking.price})`
                        : "Choose a service..."}
                    </span>
                    <FiChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        serviceDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {serviceDropdownOpen && (
                    <div className="mt-1 border border-gray-200 rounded-lg shadow-xl max-h-52 overflow-y-auto bg-white">
                      {servicesLoading ? (
                        <div className="px-4 py-3 text-center text-gray-500 text-xs">
                          <FiRefreshCw className="w-3.5 h-3.5 animate-spin inline mr-2" /> Loading
                          services...
                        </div>
                      ) : services.length === 0 ? (
                        <div className="px-4 py-3 text-center text-gray-400 text-xs">
                          No services found
                        </div>
                      ) : (
                        services.map((service) => {
                          const alreadyAdded = (selectedBooking.services || []).some(
                            (s) => s.serviceId === service._id
                          );
                          return (
                            <button
                              key={service._id}
                              onClick={() => {
                                if (!alreadyAdded) {
                                  setSelectedServiceId(service._id);
                                  setSelectedServiceForBooking(service);
                                  setServiceDropdownOpen(false);
                                }
                              }}
                              className={`w-full px-3.5 py-2 text-left text-xs hover:bg-gray-50 transition-colors flex items-center justify-between ${
                                alreadyAdded ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
                              } ${selectedServiceId === service._id ? "bg-emerald-50" : ""}`}
                              disabled={alreadyAdded}
                            >
                              <span className="font-medium text-gray-800">{service.name}</span>
                              <span className="font-bold text-emerald-700">
                                {alreadyAdded ? "✓ Added" : `₹${service.price}`}
                              </span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                {selectedServiceForBooking && (
                  <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 flex items-center justify-between text-xs">
                    <div>
                      <div className="text-[10px] font-bold uppercase text-emerald-800">
                        Selected Service
                      </div>
                      <div className="font-bold text-gray-900">{selectedServiceForBooking.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-bold uppercase text-gray-500">Service Fee</div>
                      <div className="font-bold text-emerald-700">
                        ₹{selectedServiceForBooking.price}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  onClick={() => setShowAddServiceModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddServiceToBooking}
                  disabled={!selectedServiceForBooking}
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all disabled:opacity-50"
                >
                  Add Service
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Bookings;