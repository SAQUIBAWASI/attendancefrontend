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
  FileText
} from "lucide-react";
import "./EmployeeDashboard.css";
import "./EmployeeLeaves.css";
import logo from "../Images/logo2.png";

const DAYS_OF_WEEK = ["All", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

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

// Status color mapping
const getStatusColors = (status) => {
  const statusMap = {
    booked: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200", hover: "hover:bg-blue-200", icon: Clock },
    completed: { bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-200", hover: "hover:bg-emerald-200", icon: CheckCircle2 },
    consulting: { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-200", hover: "hover:bg-purple-200", icon: User },
    cancelled: { bg: "bg-red-100", text: "text-red-800", border: "border-red-200", hover: "hover:bg-red-200", icon: XCircle }
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
  const [statusFilter, setStatusFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState(null);
  
  const [showServicePaymentModal, setShowServicePaymentModal] = useState(false);
  const [selectedServiceFromBooking, setSelectedServiceFromBooking] = useState(null);
  const [updateServicePaymentStatus, setUpdateServicePaymentStatus] = useState("Pending");
  
  // State for inline dropdowns
  const [openStatusDropdown, setOpenStatusDropdown] = useState(null);
  const [openPaymentDropdown, setOpenPaymentDropdown] = useState(null);

  // State for Billing Modal
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [billingData, setBillingData] = useState({
    consultationFee: 0,
    serviceFees: [],
    totalAmount: 0,
    paidAmount: 0,
    dueAmount: 0,
    paymentStatus: "Pending",
    billDate: "",
    billNumber: "",
    items: []
  });

  const invoiceRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    const saved = localStorage.getItem('bookings_itemsPerPage');
    return saved ? parseInt(saved, 10) : 10;
  });

  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Navigate to OP Management
  const handleAddOP = () => {
    navigate('/op-management');
  };

  useEffect(() => {
    fetchBookings();
    fetchServices();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.status-dropdown') && !e.target.closest('.payment-dropdown')) {
        setOpenStatusDropdown(null);
        setOpenPaymentDropdown(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/appointment-slots/getallbookings`);

      if (res && res.data && res.data.success) {
        const bookedSlots = res.data.bookings.filter(
          (s) => (s.status === "booked" || s.status === "completed" || s.status === "consulting" || s.status === "cancelled" || s.patientName) && s.type !== "break"
        );
        setBookings(bookedSlots);
      } else {
        setBookings([]);
        showToast("No bookings found", "info");
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

  // =============================================
  // HANDLE ROW CLICK - Open Patient Details
  // =============================================
  const handleRowClick = (booking) => {
    setSelectedBooking(booking);
    setShowTicketModal(true);
  };

  // =============================================
  // HANDLE ACTION BUTTON CLICK - Prevent Row Click
  // =============================================
  const handleActionClick = (e) => {
    e.stopPropagation();
  };

  // =============================================
  // OPEN BILLING MODAL
  // =============================================
  const openBillingModal = (booking) => {
    setSelectedBooking(booking);
    
    // Calculate billing data
    const consultationFee = booking.consultationFee || 0;
    const serviceFees = (booking.services || []).map(s => ({
      name: s.name,
      price: s.price || 0,
      paymentStatus: s.paymentStatus || "Pending"
    }));
    const totalServiceFee = getTotalServiceFee(booking);
    const totalAmount = consultationFee + totalServiceFee;
    const isPaid = booking.paymentStatus === "Paid";
    const paidAmount = isPaid ? totalAmount : 0;
    const dueAmount = isPaid ? 0 : totalAmount;
    
    // Generate bill number
    const today = new Date();
    const billNumber = `BILL-${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}-${String(booking._id).slice(-6)}`;
    
    // Prepare items for bill
    const items = [
      {
        id: 'consultation',
        name: 'Consultation Fee',
        description: 'OPD Consultation',
        quantity: 1,
        unitPrice: consultationFee,
        total: consultationFee,
        type: 'consultation'
      },
      ...(booking.services || []).map((s, idx) => ({
        id: `service-${idx}`,
        name: s.name,
        description: s.description || 'Additional Service',
        quantity: 1,
        unitPrice: s.price || 0,
        total: s.price || 0,
        type: 'service',
        serviceId: s.serviceId || s._id
      }))
    ];

    setBillingData({
      consultationFee,
      serviceFees,
      totalAmount,
      paidAmount,
      dueAmount,
      paymentStatus: booking.paymentStatus || "Pending",
      billDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      billNumber,
      items
    });
    
    setShowBillingModal(true);
  };

  // =============================================
  // HANDLE BILLING - Mark as Paid
  // =============================================
  const handleMarkAsPaid = async () => {
    if (!selectedBooking) return;
    
    try {
      // Update booking payment status
      const res = await axios.put(`${API_BASE_URL}/appointment-slots/${selectedBooking._id}`, {
        paymentStatus: "Paid"
      });
      
      if (res && res.data && res.data.success) {
        // Update local state
        setBookings((prev) =>
          prev.map((b) =>
            b._id === selectedBooking._id ? { ...b, paymentStatus: "Paid" } : b
          )
        );
        
        // Update billing data
        setBillingData(prev => ({
          ...prev,
          paymentStatus: "Paid",
          paidAmount: prev.totalAmount,
          dueAmount: 0
        }));
        
        showToast(`Payment marked as Paid for ${selectedBooking.patientName}!`, "success");
      }
    } catch (error) {
      console.error("Error updating payment:", error);
      showToast("Failed to update payment status", "error");
    }
  };

  // =============================================
  // HANDLE BILLING - Print Bill
  // =============================================
  const printBill = () => {
    const billContent = document.getElementById('bill-content');
    if (!billContent) return;
    
    const win = window.open('', '_blank', 'width=800,height=900');
    if (win) {
      win.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <title>Bill - ${billingData.billNumber}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: 'Times New Roman', Times, serif;
                background: #ffffff;
                padding: 40px;
                color: #222222;
              }
              .bill-container {
                max-width: 800px;
                margin: 0 auto;
                border: 1px solid #cccccc;
                padding: 40px;
              }
              .bill-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 2px solid #222222;
                padding-bottom: 20px;
                margin-bottom: 30px;
              }
              .bill-title {
                display: flex;
                align-items: center;
                gap: 15px;
              }
              .bill-title .logo {
                width: 50px;
                height: 50px;
                object-fit: contain;
              }
              .bill-title .title-group h1 {
                font-size: 28px;
                font-weight: normal;
                letter-spacing: 2px;
                color: #222222;
                margin: 0;
              }
              .bill-title .title-group .sub {
                font-size: 12px;
                color: #666666;
                letter-spacing: 1px;
              }
              .bill-number {
                text-align: right;
              }
              .bill-number .label {
                font-size: 11px;
                color: #888888;
                text-transform: uppercase;
                letter-spacing: 1px;
              }
              .bill-number .value {
                font-size: 18px;
                font-weight: bold;
                color: #222222;
              }
              .bill-number .date {
                font-size: 12px;
                color: #666666;
                margin-top: 4px;
              }
              .patient-info {
                display: flex;
                justify-content: space-between;
                margin-bottom: 30px;
                padding: 15px;
                background: #f8fafc;
                border-radius: 8px;
              }
              .patient-info .info-group {
                display: flex;
                flex-direction: column;
              }
              .patient-info .info-group .label {
                font-size: 10px;
                color: #888888;
                text-transform: uppercase;
                letter-spacing: 1px;
              }
              .patient-info .info-group .value {
                font-size: 14px;
                font-weight: bold;
                color: #222222;
                margin-top: 2px;
              }
              .table-section {
                margin: 20px 0;
              }
              .bill-table {
                width: 100%;
                border-collapse: collapse;
              }
              .bill-table th {
                text-align: left;
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #888888;
                border-bottom: 1px solid #dddddd;
                padding: 10px 0;
                font-weight: normal;
              }
              .bill-table td {
                padding: 12px 0;
                border-bottom: 1px solid #eeeeee;
                font-size: 14px;
                color: #333333;
              }
              .bill-table .text-right {
                text-align: right;
              }
              .totals-section {
                margin: 20px 0 10px 0;
                padding: 15px 0;
                border-top: 2px solid #222222;
                border-bottom: 2px solid #222222;
                display: flex;
                justify-content: flex-end;
              }
              .totals-section .total-box {
                text-align: right;
              }
              .totals-section .total-box .label {
                font-size: 14px;
                color: #666666;
                text-transform: uppercase;
                letter-spacing: 1px;
              }
              .totals-section .total-box .amount {
                font-size: 24px;
                font-weight: bold;
                color: #222222;
                margin-top: 2px;
              }
              .payment-status-section {
                display: flex;
                justify-content: space-between;
                padding: 15px 0;
                margin: 10px 0;
                border-top: 1px solid #eeeeee;
                border-bottom: 1px solid #eeeeee;
              }
              .payment-status-section .status-label {
                font-size: 12px;
                color: #666666;
                text-transform: uppercase;
                letter-spacing: 1px;
              }
              .payment-status-section .status-value {
                font-size: 14px;
                font-weight: bold;
                color: ${billingData.paymentStatus === 'Paid' ? '#166534' : '#b45309'};
              }
              .footer-section {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #dddddd;
                display: flex;
                justify-content: space-between;
                font-size: 11px;
                color: #888888;
              }
              .footer-section .thankyou {
                text-align: center;
                font-size: 13px;
                color: #666666;
                letter-spacing: 1px;
                width: 100%;
                margin-top: 10px;
              }
            </style>
          </head>
          <body>
            <div class="bill-container">
              <div class="bill-header">
                <div class="bill-title">
                  <img src="${logo}" alt="TimelyHealth" class="logo" />
                  <div class="title-group">
                    <h1>BILL</h1>
                    <div class="sub">TimelyHealth</div>
                  </div>
                </div>
                <div class="bill-number">
                  <div class="label">Bill Number</div>
                  <div class="value">${billingData.billNumber}</div>
                  <div class="date">${billingData.billDate}</div>
                </div>
              </div>

              <div class="patient-info">
                <div class="info-group">
                  <span class="label">Patient Name</span>
                  <span class="value">${selectedBooking?.patientName || 'N/A'}</span>
                </div>
                <div class="info-group">
                  <span class="label">Phone</span>
                  <span class="value">${selectedBooking?.patientPhone || 'N/A'}</span>
                </div>
                <div class="info-group">
                  <span class="label">Age / Gender</span>
                  <span class="value">${selectedBooking?.patientAge || 'N/A'} yrs / ${selectedBooking?.patientGender || 'N/A'}</span>
                </div>
                <div class="info-group">
                  <span class="label">Appointment Date</span>
                  <span class="value">${formatDateToDDMMYYYY(selectedBooking?.date)}</span>
                </div>
              </div>

              <div class="table-section">
                <table class="bill-table">
                  <thead>
                    <tr>
                      <th style="width:50%;">Description</th>
                      <th style="width:20%;text-align:center;">Qty</th>
                      <th style="width:30%;text-align:right;">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${billingData.items.map(item => `
                      <tr>
                        <td>
                          ${item.name}
                          ${item.description && item.name !== 'Consultation Fee' ? `<div style="font-size:11px;color:#888888;">${item.description}</div>` : ''}
                        </td>
                        <td class="text-right">${item.quantity}</td>
                        <td class="text-right">₹ ${item.total.toFixed(2)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>

              <div class="totals-section">
                <div class="total-box">
                  <div class="label">Grand Total</div>
                  <div class="amount">₹ ${billingData.totalAmount.toFixed(2)}</div>
                </div>
              </div>

              <div class="payment-status-section">
                <span class="status-label">Payment Status</span>
                <span class="status-value">${billingData.paymentStatus}</span>
              </div>

              <div class="footer-section">
                <div class="thankyou">Thank you for your visit</div>
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

  // Inline status update handler with 4 options
  const handleInlineStatusUpdate = async (bookingId, newStatus, patientName) => {
    try {
      setBookings((prev) =>
        prev.map((b) =>
          b._id === bookingId ? { ...b, status: newStatus } : b
        )
      );

      if (bookingId && !bookingId.startsWith("demo_")) {
        await axios.put(`${API_BASE_URL}/appointment-slots/${bookingId}`, {
          status: newStatus
        });
      }
      showToast(`Appointment status updated to '${newStatus}' for ${patientName}!`, "success");
      setOpenStatusDropdown(null);
    } catch (e) {
      console.error("Error updating status:", e);
      showToast("Failed to update status. Please try again.", "error");
      fetchBookings();
    }
  };

  // Inline payment status update handler
  const handleInlinePaymentUpdate = async (bookingId, newPaymentStatus, patientName) => {
    try {
      setBookings((prev) =>
        prev.map((b) =>
          b._id === bookingId ? { ...b, paymentStatus: newPaymentStatus } : b
        )
      );

      if (bookingId && !bookingId.startsWith("demo_")) {
        await axios.put(`${API_BASE_URL}/appointment-slots/${bookingId}`, {
          paymentStatus: newPaymentStatus
        });
      }
      showToast(`Payment status updated to '${newPaymentStatus}' for ${patientName}!`, "success");
      setOpenPaymentDropdown(null);
    } catch (e) {
      console.error("Error updating payment status:", e);
      showToast("Failed to update payment status. Please try again.", "error");
      fetchBookings();
    }
  };

  const openStatusModal = (booking) => {
    setSelectedBooking(booking);
    setShowStatusModal(true);
  };

  const openPaymentModal = (booking) => {
    setSelectedBooking(booking);
    setShowPaymentModal(true);
  };

  const openAddServiceModal = (booking) => {
    setSelectedBooking(booking);
    setSelectedServiceId("");
    setSelectedServiceForBooking(null);
    setServiceDropdownOpen(false);
    setShowAddServiceModal(true);
  };

  const handleServiceSelect = (service) => {
    setSelectedServiceId(service._id);
    setSelectedServiceForBooking(service);
    setServiceDropdownOpen(false);
  };

  const openServicePaymentModal = (booking) => {
    setSelectedBooking(booking);
    if (booking.services && booking.services.length > 0) {
      setSelectedServiceFromBooking(booking.services[0]);
      setUpdateServicePaymentStatus(booking.services[0].paymentStatus || "Pending");
    } else {
      setSelectedServiceFromBooking(null);
      setUpdateServicePaymentStatus("Pending");
    }
    setShowServicePaymentModal(true);
  };

  const openInvoiceModal = (booking) => {
    setSelectedBooking(booking);
    setShowInvoiceModal(true);
  };

  const downloadInvoice = () => {
    if (!invoiceRef.current) return;

    const bookingCreatedDate = selectedBooking?.createdAt || selectedBooking?.updatedAt || selectedBooking?.date;
    const appointmentDate = selectedBooking?.date;
    const bookingStatus = selectedBooking?.status || "booked";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>Invoice ${selectedBooking?.slotId || 'N/A'}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Times New Roman', Times, serif;
              background: #ffffff;
              padding: 40px;
              color: #222222;
            }
            .invoice-container {
              max-width: 800px;
              margin: 0 auto;
              border: 1px solid #cccccc;
              padding: 40px;
            }
            .invoice-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #222222;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .invoice-title {
              display: flex;
              align-items: center;
              gap: 15px;
            }
            .invoice-title .logo {
              width: 50px;
              height: 50px;
              object-fit: contain;
            }
            .invoice-title .title-group h1 {
              font-size: 28px;
              font-weight: normal;
              letter-spacing: 2px;
              color: #222222;
              margin: 0;
            }
            .invoice-title .title-group .sub {
              font-size: 12px;
              color: #666666;
              letter-spacing: 1px;
            }
            .invoice-number {
              text-align: right;
            }
            .invoice-number .label {
              font-size: 11px;
              color: #888888;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .invoice-number .value {
              font-size: 18px;
              font-weight: bold;
              color: #222222;
            }
            .invoice-number .date {
              font-size: 12px;
              color: #666666;
              margin-top: 4px;
            }
            .date-info {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              margin-bottom: 20px;
              border-bottom: 1px solid #eeeeee;
              font-size: 12px;
            }
            .date-info .date-item {
              display: flex;
              flex-direction: column;
            }
            .date-info .date-item .date-label {
              font-size: 10px;
              text-transform: uppercase;
              color: #888888;
              letter-spacing: 0.5px;
            }
            .date-info .date-item .date-value {
              font-weight: bold;
              color: #222222;
              margin-top: 2px;
            }
            .billing-section {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
            }
            .billing-box {
              flex: 1;
            }
            .billing-box .label {
              font-size: 11px;
              color: #888888;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 6px;
            }
            .billing-box .name {
              font-size: 16px;
              font-weight: bold;
              color: #222222;
            }
            .billing-box .detail {
              font-size: 13px;
              color: #555555;
              margin-top: 2px;
            }
            .billing-box .detail-line {
              font-size: 13px;
              color: #555555;
              margin-top: 2px;
            }
            .table-section {
              margin: 30px 0;
            }
            .invoice-table {
              width: 100%;
              border-collapse: collapse;
            }
            .invoice-table th {
              text-align: left;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #888888;
              border-bottom: 1px solid #dddddd;
              padding: 10px 0;
              font-weight: normal;
            }
            .invoice-table td {
              padding: 12px 0;
              border-bottom: 1px solid #eeeeee;
              font-size: 14px;
              color: #333333;
            }
            .invoice-table .text-right {
              text-align: right;
            }
            .invoice-table .text-center {
              text-align: center;
            }
            .payment-status-text {
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #222222;
            }
            .payment-status-text.paid {
              color: #222222;
            }
            .payment-status-text.pending {
              color: #999999;
            }
            .footer-section {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #dddddd;
              display: flex;
              justify-content: space-between;
              font-size: 11px;
              color: #888888;
            }
            .footer-section .left {
              text-align: left;
            }
            .footer-section .right {
              text-align: right;
            }
            .footer-section .thankyou {
              text-align: center;
              font-size: 13px;
              color: #666666;
              letter-spacing: 1px;
              margin-top: 10px;
            }
            .amount-words {
              font-size: 12px;
              color: #666666;
              margin-top: 4px;
              font-style: italic;
            }
            .services-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 5px;
            }
            .services-table th {
              text-align: left;
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #888888;
              border-bottom: 1px solid #dddddd;
              padding: 6px 0;
              font-weight: normal;
            }
            .services-table td {
              padding: 8px 0;
              border-bottom: 1px solid #eeeeee;
              font-size: 13px;
              color: #333333;
            }
            .services-table .text-right {
              text-align: right;
            }
            .services-table .text-center {
              text-align: center;
            }
            .service-status-text {
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .service-status-text.paid {
              color: #222222;
            }
            .service-status-text.pending {
              color: #999999;
            }
            .company-name {
              font-size: 12px;
              color: #888888;
              letter-spacing: 1px;
              margin-top: 2px;
            }
            .status-badge {
              display: inline-block;
              padding: 3px 12px;
              border-radius: 20px;
              font-size: 10px;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 1px;
              background: ${bookingStatus === 'completed' ? '#dcfce7' : bookingStatus === 'consulting' ? '#f3e8ff' : bookingStatus === 'cancelled' ? '#fee2e2' : '#dbeafe'};
              color: ${bookingStatus === 'completed' ? '#166534' : bookingStatus === 'consulting' ? '#6b21a8' : bookingStatus === 'cancelled' ? '#991b1b' : '#1e40af'};
              border: 1px solid ${bookingStatus === 'completed' ? '#86efac' : bookingStatus === 'consulting' ? '#d8b4fe' : bookingStatus === 'cancelled' ? '#fca5a5' : '#93c5fd'};
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="invoice-header">
              <div class="invoice-title">
                <img src="${logo}" alt="TimelyHealth" class="logo" />
                <div class="title-group">
                  <h1>INVOICE</h1>
                  <div class="sub">TimelyHealth</div>
                </div>
              </div>
              <div class="invoice-number">
                <div class="label">Invoice Number</div>
                <div class="value">${selectedBooking?.slotId || 'N/A'}</div>
                <div class="date">${formatDateToDDMMYYYY(appointmentDate)}</div>
              </div>
            </div>

            <div class="date-info">
              <div class="date-item">
                <span class="date-label">Booking Created Date</span>
                <span class="date-value">${formatDateToDDMMYYYY(bookingCreatedDate)}</span>
              </div>
              <div class="date-item" style="text-align:right;">
                <span class="date-label">Appointment Date</span>
                <span class="date-value">${formatDateToDDMMYYYY(appointmentDate)}</span>
              </div>
            </div>

            <div class="billing-section">
              <div class="billing-box">
                <div class="label">Bill To</div>
                <div class="name">${selectedBooking?.patientName || 'N/A'}</div>
                <div class="detail">${selectedBooking?.patientAddress || 'N/A'}</div>
                <div class="detail-line">Phone: ${selectedBooking?.patientPhone || 'N/A'}</div>
                <div class="detail-line">Age: ${selectedBooking?.patientAge || 'N/A'} yrs</div>
              </div>
              <div class="billing-box" style="text-align:right;">
                <div class="label">Appointment Details</div>
                <div class="detail">${selectedBooking?.dayOfWeek || 'N/A'}</div>
                <div class="detail-line">${selectedBooking?.startTime || 'N/A'} - ${selectedBooking?.endTime || 'N/A'}</div>
                <div class="detail-line">${selectedBooking?.shift || 'N/A'}</div>
              </div>
            </div>

            <div class="table-section">
              <table class="invoice-table">
                <thead>
                  <tr>
                    <th style="width:50%;">Description</th>
                    <th style="width:25%;text-align:center;">Status</th>
                    <th style="width:25%;text-align:right;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Consultation Fee</td>
                    <td class="text-center">
                      <span class="status-badge">${bookingStatus}</span>
                    </td>
                    <td class="text-right">₹ ${selectedBooking?.consultationFee || 0}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            ${(selectedBooking?.services && selectedBooking.services.length > 0) ? `
            <div style="margin: 10px 0 20px 0;">
              <div style="font-size: 12px; color: #666666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; border-bottom: 1px solid #dddddd; padding-bottom: 6px;">Additional Services</div>
              <table class="services-table">
                <thead>
                  <tr>
                    <th style="width:50%;">Service Name</th>
                    <th style="width:25%;text-align:center;">Status</th>
                    <th style="width:25%;text-align:right;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${(selectedBooking?.services || []).map(s => `
                    <tr>
                      <td>${s.name} ${s.description ? `(${s.description})` : ''}</td>
                      <td class="text-center">
                        <span class="service-status-text ${s.paymentStatus === 'Paid' ? 'paid' : 'pending'}">${s.paymentStatus || 'Pending'}</span>
                      </td>
                      <td class="text-right">₹ ${s.price || 0}</td>
                    </tr>
                  `).join('')}
                  <tr style="border-top: 2px solid #222222;">
                    <td colspan="2" style="text-align:right;font-weight:bold;padding:12px 0;">Services Total</td>
                    <td style="text-align:right;font-weight:bold;padding:12px 0;">₹ ${getTotalServiceFee(selectedBooking)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            ` : ''}

            <div style="margin: 20px 0 10px 0; padding: 15px 0; border-top: 2px solid #222222; border-bottom: 2px solid #222222; display: flex; justify-content: flex-end; align-items: center;">
              <div style="text-align: right;">
                <div style="font-size: 14px; color: #666666; text-transform: uppercase; letter-spacing: 1px;">Grand Total</div>
                <div style="font-size: 22px; font-weight: bold; color: #222222;">₹ ${(selectedBooking?.consultationFee || 0) + getTotalServiceFee(selectedBooking)}</div>
                <div class="amount-words" style="font-size: 12px; color: #666666; font-style: italic; margin-top: 4px;">
                  ${numberToWords((selectedBooking?.consultationFee || 0) + getTotalServiceFee(selectedBooking))}
                </div>
              </div>
            </div>

            <div style="margin: 20px 0 10px 0; padding: 15px 0; border-top: 1px solid #eeeeee; border-bottom: 1px solid #eeeeee; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 12px; color: #666666; text-transform: uppercase; letter-spacing: 1px;">Payment Status</span>
              <span class="payment-status-text ${selectedBooking?.paymentStatus === 'Paid' ? 'paid' : 'pending'}">${selectedBooking?.paymentStatus || 'Pending'}</span>
            </div>

            <div class="footer-section">
              <div class="left">
                <div>${selectedBooking?.doctorName || 'General OP Doctor'}</div>
                <div class="company-name">TimelyHealth</div>
              </div>
              <div class="right">
                <div>Generated on ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                <div>${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </div>
            <div class="footer-section" style="border-top: none; padding-top: 5px;">
              <div class="thankyou" style="width:100%;">Thank you for your visit</div>
            </div>
          </div>
        </body>
      </html>
    `;

    const win = window.open('', '_blank', 'width=800,height=900');
    if (win) {
      win.document.write(htmlContent);
      win.document.close();
      win.focus();
      setTimeout(() => {
        win.print();
      }, 500);
    }
  };

  const numberToWords = (num) => {
    if (num === 0) return 'Zero';
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    const convert = (n) => {
      if (n < 20) return ones[n];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
      if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convert(n % 100) : '');
      if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
      if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
      return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
    };
    
    return convert(num) + ' Rupees Only';
  };

  const handleAddServiceToBooking = async () => {
    if (!selectedBooking) return;
    if (!selectedServiceForBooking) {
      showToast("Please select a service first!", "error");
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
        setBookings((prev) =>
          prev.map((b) =>
            b._id === selectedBooking._id
              ? {
                  ...b,
                  services: res.data.data.services,
                  consultationFee: res.data.data.totalFee + (b.consultationFee || 0)
                }
              : b
          )
        );

        showToast(res.data.message, "success");
        setShowAddServiceModal(false);
        setSelectedServiceId("");
        setSelectedServiceForBooking(null);
      }
    } catch (error) {
      console.error("Error adding service:", error);
      showToast(
        error.response?.data?.message || "Failed to add service. Please try again.",
        "error"
      );
    }
  };

  const handleRemoveService = async (booking, serviceId, serviceName) => {
    if (!window.confirm(`Remove "${serviceName}" from this booking?`)) {
      return;
    }

    try {
      const res = await axios.delete(
        `${API_BASE_URL}/services/deleteservicestobooking/${booking._id}/${serviceId}`
      );

      if (res && res.data && res.data.success) {
        setBookings((prev) =>
          prev.map((b) =>
            b._id === booking._id
              ? { ...b, services: res.data.data.services }
              : b
          )
        );
        showToast(res.data.message, "info");
      }
    } catch (error) {
      console.error("Error removing service:", error);
      showToast(
        error.response?.data?.message || "Failed to remove service",
        "error"
      );
    }
  };

  const handleUpdateServicePayment = async () => {
    if (!selectedBooking || !selectedServiceFromBooking) {
      showToast("No service selected!", "error");
      return;
    }

    const serviceId = selectedServiceFromBooking.serviceId || selectedServiceFromBooking._id;
    
    if (!serviceId) {
      showToast("Invalid service ID!", "error");
      return;
    }

    try {
      const res = await axios.put(
        `${API_BASE_URL}/services/updateservicepayment/${selectedBooking._id}/${serviceId}`,
        { paymentStatus: updateServicePaymentStatus }
      );

      if (res && res.data && res.data.success) {
        setBookings((prev) =>
          prev.map((b) =>
            b._id === selectedBooking._id
              ? { ...b, services: res.data.data.services }
              : b
          )
        );
        showToast(res.data.message, "success");
        setShowServicePaymentModal(false);
        setSelectedServiceFromBooking(null);
      }
    } catch (error) {
      console.error("Error updating service payment:", error);
      showToast(
        error.response?.data?.message || "Failed to update service payment",
        "error"
      );
    }
  };

  const handleCancelBooking = async (booking) => {
    try {
      setBookings((prev) => prev.filter((b) => b._id !== booking._id));

      if (booking._id && !booking._id.startsWith("demo_")) {
        await axios.put(`${API_BASE_URL}/appointment-slots/${booking._id}`, {
          status: "available",
          patientName: "",
          patientAge: "",
          patientGender: "Male",
          patientAddress: "",
          purpose: "",
          patientPhone: "",
          services: [],
          consultationFee: 0
        });
      }
      showToast(`Cancelled appointment for ${booking.patientName}. Slot released to available.`, "info");
    } catch (e) {
      console.error("Error cancelling booking:", e);
    }
  };

  const getTotalServiceFee = (booking) => {
    if (!booking.services || booking.services.length === 0) return 0;
    return booking.services.reduce((sum, s) => sum + (s.price || 0), 0);
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (dayFilter !== "All" && b.dayOfWeek.toLowerCase() !== dayFilter.toLowerCase()) {
        return false;
      }
      
      if (statusFilter !== "All" && b.status.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
      
      if (fromDate) {
        const bookingDate = b.date ? new Date(b.date) : null;
        const from = new Date(fromDate);
        if (bookingDate && bookingDate < from) {
          return false;
        }
      }
      
      if (toDate) {
        const bookingDate = b.date ? new Date(b.date) : null;
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        if (bookingDate && bookingDate > to) {
          return false;
        }
      }
      
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = (b.patientName || "").toLowerCase().includes(query);
        const matchPhone = (b.patientPhone || "").toLowerCase().includes(query);
        const matchAddress = (b.patientAddress || "").toLowerCase().includes(query);
        const matchPurpose = (b.purpose || "").toLowerCase().includes(query);
        const matchTime = (b.startTime || "").toLowerCase().includes(query) || (b.endTime || "").toLowerCase().includes(query);
        const matchDay = (b.dayOfWeek || "").toLowerCase().includes(query);
        const matchService = (b.services || []).some(s => s.name.toLowerCase().includes(query));

        if (!matchName && !matchPhone && !matchAddress && !matchPurpose && !matchTime && !matchDay && !matchService) {
          return false;
        }
      }
      
      return true;
    });
  }, [bookings, dayFilter, statusFilter, searchQuery, fromDate, toDate]);

  const stats = useMemo(() => {
    const totalCount = bookings.length;
    const bookedCount = bookings.filter((b) => b.status === "booked").length;
    const completedCount = bookings.filter((b) => b.status === "completed").length;
    const consultingCount = bookings.filter((b) => b.status === "consulting").length;
    const cancelledCount = bookings.filter((b) => b.status === "cancelled").length;
    const pendingPayment = bookings.filter((b) => b.paymentStatus === "Pending").length;
    const paidCount = bookings.filter((b) => b.paymentStatus === "Paid").length;
    const maleCount = bookings.filter((b) => b.patientGender === "Male").length;
    const femaleCount = bookings.filter((b) => b.patientGender === "Female").length;
    const totalFee = bookings.reduce((sum, b) => sum + (b.consultationFee || 0) + getTotalServiceFee(b), 0);

    return {
      totalCount,
      bookedCount,
      completedCount,
      consultingCount,
      cancelledCount,
      pendingPayment,
      paidCount,
      maleCount,
      femaleCount,
      totalFee
    };
  }, [bookings]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRecords = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  const handleItemsPerPageChange = (e) => {
    const newValue = Number(e.target.value);
    setItemsPerPage(newValue);
    localStorage.setItem('bookings_itemsPerPage', String(newValue));
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

  const clearFilters = () => {
    setSearchQuery("");
    setDayFilter("All");
    setStatusFilter("All");
    setFromDate("");
    setToDate("");
  };

  const downloadCSV = () => {
    if (filteredBookings.length === 0) {
      showToast("No appointment booking data available to export!", "error");
      return;
    }

    const headers = [
      "Patient Name", "Phone", "Age", "Gender", "Address",
      "Booking Date", "Appointment Date", "Day", "Start Time", "End Time", "Shift",
      "Purpose", "Services", "Total Fee", "Payment Status", "Appointment Status"
    ];

    const csvRows = [
      headers.join(","),
      ...filteredBookings.map((b) => {
        const serviceNames = (b.services || []).map(s => `${s.name}(${s.paymentStatus})`).join("; ");
        const totalFee = (b.consultationFee || 0) + getTotalServiceFee(b);
        const bookingDate = b.createdAt || b.updatedAt || b.date;
        return [
          `"${(b.patientName || "").replace(/"/g, '""')}"`,
          `"${b.patientPhone || ""}"`,
          b.patientAge || "",
          b.patientGender || "",
          `"${(b.patientAddress || "").replace(/"/g, '""')}"`,
          formatDateToDDMMYYYY(bookingDate),
          formatDateToDDMMYYYY(b.date),
          b.dayOfWeek || "",
          b.startTime || "",
          b.endTime || "",
          b.shift || "",
          `"${(b.purpose || "").replace(/"/g, '""')}"`,
          `"${serviceNames}"`,
          totalFee || 0,
          b.paymentStatus || "Pending",
          b.status || "booked"
        ].join(",");
      })
    ];

    const csvData = csvRows.join("\n");
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `appointment_bookings_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filteredBookings.length} booking records to CSV!`);
  };

  const renderStats = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
      <div className="emp-dash__stat">
        <div className="emp-dash__stat-top">
          <span className="emp-dash__stat-label">Total Bookings</span>
          <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
            <Users className="w-4 h-4 text-blue-600" />
          </div>
        </div>
        <div className="emp-dash__stat-value">{stats.totalCount}</div>
        <div className="emp-dash__stat-meta">
          {stats.bookedCount} Booked · {stats.consultingCount} Consulting · {stats.completedCount} Completed
        </div>
      </div>

      <div className="emp-dash__stat">
        <div className="emp-dash__stat-top">
          <span className="emp-dash__stat-label">Active / Booked</span>
          <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
        </div>
        <div className="emp-dash__stat-value text-amber-600">{stats.bookedCount}</div>
        <div className="emp-dash__stat-meta">upcoming appointments</div>
      </div>

      <div className="emp-dash__stat">
        <div className="emp-dash__stat-top">
          <span className="emp-dash__stat-label">Completed</span>
          <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
        </div>
        <div className="emp-dash__stat-value text-emerald-600">{stats.completedCount}</div>
        <div className="emp-dash__stat-meta">consultations done</div>
      </div>

      <div className="emp-dash__stat col-span-2 lg:col-span-1">
        <div className="emp-dash__stat-top">
          <span className="emp-dash__stat-label">Payment Status</span>
          <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
            <IndianRupee className="w-4 h-4 text-indigo-600" />
          </div>
        </div>
        <div className="emp-dash__stat-value text-sm sm:text-base font-bold truncate">
          <span className="text-amber-600">{stats.pendingPayment} Pending</span> / <span className="text-emerald-600">{stats.paidCount} Paid</span>
        </div>
        <div className="emp-dash__stat-meta">{stats.maleCount} Male · {stats.femaleCount} Female</div>
      </div>
    </div>
  );

  const renderFilters = () => (
    <div className="emp-dash__card mb-6">
      <div className="hidden lg:block">
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-xl border border-gray-200">
          <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
            <div className="relative min-w-[160px] flex-1 max-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
              <input
                type="text"
                placeholder="Search patient..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={dayFilter}
                onChange={(e) => setDayFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                {DAYS_OF_WEEK.map((day) => (
                  <option key={day} value={day}>
                    {day === "All" ? "All Days" : day}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="All">All Statuses</option>
                <option value="booked">Booked</option>
                <option value="consulting">Consulting</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-gray-500">From</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              />
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-gray-500">To</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {(searchQuery || dayFilter !== "All" || statusFilter !== "All" || fromDate || toDate) && (
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

      <div className="lg:hidden">
        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center gap-2 text-sm font-semibold text-gray-700"
          >
            <Filter className="text-blue-600 text-base" />
            <span>Filters &amp; Actions</span>
            {showMobileFilters ? (
              <ChevronUp className="text-gray-400" />
            ) : (
              <ChevronDown className="text-gray-400" />
            )}
          </button>
          <span className="text-xs text-gray-500">
            <strong>{filteredBookings.length}</strong> records
          </span>
        </div>

        {showMobileFilters && (
          <div className="mt-2 p-4 bg-white rounded-xl border border-gray-200 space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Search Patient</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search patient name, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Day</label>
              <select
                value={dayFilter}
                onChange={(e) => setDayFilter(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              >
                {DAYS_OF_WEEK.map((day) => (
                  <option key={day} value={day}>
                    {day === "All" ? "All Days" : day}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              >
                <option value="All">All Statuses</option>
                <option value="booked">Booked</option>
                <option value="consulting">Consulting</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">From Date</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">To Date</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={downloadCSV}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
                {(searchQuery || dayFilter !== "All" || statusFilter !== "All" || fromDate || toDate) && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="emp-dash">
      <main className="p-2 sm:p-4 lg:p-6">
        {toast && (
          <div
            className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white transition-all transform animate-bounce ${
              toast.type === "error" ? "bg-red-600" : toast.type === "info" ? "bg-cyan-600" : "bg-emerald-600"
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span className="font-medium text-sm">{toast.message}</span>
          </div>
        )}

        <div className="emp-dash__header">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap">
              Appointment <span>Bookings</span>
            </h1>
            <span className="text-xs text-gray-500 font-medium bg-white px-2.5 py-0.5 rounded-full border border-gray-200 shadow-xs">
              {bookings.length} Total Bookings
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleAddOP}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              OP
            </button>
            <button
              onClick={fetchBookings}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
            <button
              onClick={downloadCSV}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all shadow-md"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
          </div>
        </div>

        {renderStats()}
        {renderFilters()}

        {loading ? (
          <div className="emp-dash__card py-12 text-center text-gray-500">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-500">Loading appointment bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="emp-dash__card py-12 text-center text-gray-500">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-700">No Appointment Bookings Found</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto mb-4">No patient appointment records match your search criteria.</p>
            {(searchQuery || dayFilter !== "All" || statusFilter !== "All" || fromDate || toDate) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="emp-dash__card">
            <div className="overflow-x-auto">
              <table className="emp-dash__table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Age / Gender</th>
                    <th>Booking Date</th>
                    <th>Appt. Date</th>
                    <th>Time Slot &amp; Day</th>
                    <th>Shift</th>
                    <th>Services</th>
                    <th>Purpose</th>
                    <th>Total Fee</th>
                    <th>Payment Status</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.map((booking) => {
                    const isPaid = (booking.paymentStatus || "Pending") === "Paid";
                    const statusColors = getStatusColors(booking.status);
                    const StatusIcon = statusColors.icon;
                    const totalServiceFee = getTotalServiceFee(booking);
                    const totalFee = (booking.consultationFee || 0) + totalServiceFee;
                    const hasServices = booking.services && booking.services.length > 0;
                    
                    const bookingDate = booking.createdAt || booking.updatedAt || booking.date;
                    const appointmentDate = booking.date;

                    return (
                      <tr 
                        key={booking._id} 
                        className="transition-colors hover:bg-blue-50/50 cursor-pointer group"
                        onClick={() => handleRowClick(booking)}
                      >
                        <td className="px-3 py-3">
                          <div className="font-semibold text-slate-800 text-xs">{booking.patientName || "N/A"}</div>
                          {booking.patientPhone && (
                            <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-gray-400" /> {booking.patientPhone}
                            </div>
                          )}
                          {booking.patientAddress && (
                            <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5 truncate max-w-[180px]" title={booking.patientAddress}>
                              <MapPin className="w-3 h-3" /> {booking.patientAddress}
                            </div>
                          )}
                        </td>

                        <td className="px-3 py-3 font-medium text-slate-800 text-xs">
                          {booking.patientAge ? `${booking.patientAge} Yrs` : "N/A"}
                          <span className="text-gray-500 text-[11px] block capitalize">{booking.patientGender || "Male"}</span>
                        </td>

                        <td className="px-3 py-3 text-xs font-medium text-gray-600">
                          {formatDateToDDMMYYYY(bookingDate)}
                        </td>

                        <td className="px-3 py-3 text-xs font-bold text-blue-700">
                          {formatDateToDDMMYYYY(appointmentDate)}
                        </td>

                        <td className="px-3 py-3">
                          <div className="font-bold text-slate-800 text-xs">{booking.startTime} – {booking.endTime}</div>
                          <div className="text-[10px] text-blue-700 font-semibold">{booking.dayOfWeek}</div>
                        </td>

                        <td className="px-3 py-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              (booking.shift || "").toLowerCase().includes("morning")
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : "bg-purple-100 text-purple-800 border border-purple-200"
                            }`}
                          >
                            {booking.shift || "Morning Shift"}
                          </span>
                        </td>

                        <td className="px-3 py-3">
                          {hasServices ? (
                            <div className="flex flex-wrap gap-1">
                              {booking.services.map((svc, idx) => {
                                const isServicePaid = svc.paymentStatus === "Paid";
                                return (
                                  <span
                                    key={idx}
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${isServicePaid ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-amber-100 text-amber-800 border-amber-300"}`}
                                  >
                                    {isServicePaid ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-amber-600" />}
                                    {svc.name}
                                    <span className="text-[8px] uppercase opacity-70 ml-0.5">({svc.paymentStatus})</span>
                                    <span className="text-[10px] font-bold ml-0.5">₹{svc.price}</span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const id = svc.serviceId || svc._id;
                                        if (id) handleRemoveService(booking, id, svc.name);
                                      }}
                                      className="ml-0.5 text-red-500 hover:text-red-700 hover:scale-110 transition-transform"
                                      title="Remove service"
                                    >
                                      <XCircle className="w-3 h-3" />
                                    </button>
                                  </span>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="text-[10px] text-gray-400 italic">No services</span>
                          )}
                        </td>

                        <td className="px-3 py-3 max-w-[200px]">
                          <div className="truncate text-xs text-slate-700 font-medium" title={booking.purpose}>
                            {booking.purpose || "General OPD Consultation"}
                          </div>
                        </td>

                        <td className="px-3 py-3 font-bold text-slate-800 text-xs">
                          ₹{totalFee}
                        </td>

                        {/* INLINE PAYMENT STATUS DROPDOWN */}
                        <td className="px-3 py-3 payment-dropdown" onClick={handleActionClick}>
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenPaymentDropdown(openPaymentDropdown === booking._id ? null : booking._id);
                                setOpenStatusDropdown(null);
                              }}
                              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider w-fit transition-all hover:scale-105 ${
                                isPaid 
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200" 
                                  : "bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200"
                              }`}
                            >
                              {isPaid ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-amber-600" />}
                              {booking.paymentStatus || "Pending"}
                              <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
                            </button>

                            {openPaymentDropdown === booking._id && (
                              <div className="absolute left-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-1">
                                <button
                                  onClick={() => handleInlinePaymentUpdate(booking._id, "Paid", booking.patientName)}
                                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-emerald-50 text-emerald-700 font-medium flex items-center gap-2 transition-colors"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  Paid
                                </button>
                                <button
                                  onClick={() => handleInlinePaymentUpdate(booking._id, "Pending", booking.patientName)}
                                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-amber-50 text-amber-700 font-medium flex items-center gap-2 transition-colors"
                                >
                                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                                  Pending
                                </button>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* INLINE STATUS DROPDOWN WITH 4 OPTIONS */}
                        <td className="px-3 py-3 status-dropdown" onClick={handleActionClick}>
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenStatusDropdown(openStatusDropdown === booking._id ? null : booking._id);
                                setOpenPaymentDropdown(null);
                              }}
                              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize w-fit transition-all hover:scale-105 ${statusColors.bg} ${statusColors.text} border ${statusColors.border} ${statusColors.hover}`}
                            >
                              <StatusIcon className={`w-3 h-3 ${statusColors.text}`} />
                              {booking.status || "booked"}
                              <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
                            </button>

                            {openStatusDropdown === booking._id && (
                              <div className="absolute left-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-1">
                                <button
                                  onClick={() => handleInlineStatusUpdate(booking._id, "booked", booking.patientName)}
                                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 text-blue-700 font-medium flex items-center gap-2 transition-colors"
                                >
                                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                                  Booked
                                </button>
                                <button
                                  onClick={() => handleInlineStatusUpdate(booking._id, "consulting", booking.patientName)}
                                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-purple-50 text-purple-700 font-medium flex items-center gap-2 transition-colors"
                                >
                                  <User className="w-3.5 h-3.5 text-purple-600" />
                                  Consulting
                                </button>
                                <button
                                  onClick={() => handleInlineStatusUpdate(booking._id, "completed", booking.patientName)}
                                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-emerald-50 text-emerald-700 font-medium flex items-center gap-2 transition-colors"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  Completed
                                </button>
                                <button
                                  onClick={() => handleInlineStatusUpdate(booking._id, "cancelled", booking.patientName)}
                                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-red-50 text-red-700 font-medium flex items-center gap-2 transition-colors border-t border-gray-100"
                                >
                                  <XCircle className="w-3.5 h-3.5 text-red-600" />
                                  Cancelled
                                </button>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-3 py-3 text-right" onClick={handleActionClick}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedBooking(booking);
                                setShowTicketModal(true);
                              }} 
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group relative"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                View Details
                              </span>
                            </button>
                            
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                openAddServiceModal(booking);
                              }} 
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors group relative"
                              title="Add Service"
                            >
                              <PlusCircle className="w-4 h-4" />
                              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                Add Service
                              </span>
                            </button>
                            
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                openServicePaymentModal(booking);
                              }} 
                              className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors group relative"
                              title="Update Service Payment"
                            >
                              <CreditCard className="w-4 h-4" />
                              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                Update Service Payment
                              </span>
                            </button>

                            {/* ✅ BILLING BUTTON - NEW */}
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                openBillingModal(booking);
                              }} 
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors group relative"
                              title="View Bill"
                            >
                              <ReceiptText className="w-4 h-4" />
                              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                View Bill
                              </span>
                            </button>

                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                openInvoiceModal(booking);
                              }} 
                              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors group relative"
                              title="Download Invoice"
                            >
                              <Download className="w-4 h-4" />
                              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                Download Invoice
                              </span>
                            </button>
                            
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelBooking(booking);
                              }} 
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors group relative"
                              title="Cancel Appointment"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                Cancel Appointment
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="mt-2 text-xs text-gray-400 flex items-center gap-2 px-3 py-2 border-t border-gray-100">
                <span className="text-blue-500">💡 Tip:</span>
                <span>Click anywhere on a row to view patient's complete appointment details</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-200/50 bg-gray-50/30">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>Show</span>
                  <select value={itemsPerPage} onChange={handleItemsPerPageChange} className="p-1 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none">
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span>entries</span>
                </div>
                <div className="text-xs text-gray-500 font-medium">
                  Showing <strong className="text-gray-800">{indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredBookings.length)}</strong> of{" "}
                  <strong className="text-gray-800">{filteredBookings.length}</strong> records
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button onClick={handlePrevPage} disabled={currentPage === 1} className={`px-2.5 py-1 text-xs font-semibold border rounded-lg transition-all ${currentPage === 1 ? "text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed" : "text-gray-700 bg-white hover:bg-gray-50 border-gray-300 shadow-sm"}`}>
                  Prev
                </button>

                {getPageNumbers().map((page, index) => (
                  <button key={index} onClick={() => typeof page === 'number' ? handlePageClick(page) : null} disabled={page === "..."} className={`px-3 py-1 text-xs font-semibold border rounded-lg transition-all min-w-[32px] ${page === "..." ? "text-gray-400 bg-transparent border-transparent cursor-default" : currentPage === page ? "text-white bg-blue-600 border-blue-600 shadow-sm" : "text-gray-700 bg-white hover:bg-gray-50 border-gray-300"}`}>
                    {page}
                  </button>
                ))}

                <button onClick={handleNextPage} disabled={currentPage === totalPages} className={`px-2.5 py-1 text-xs font-semibold border rounded-lg transition-all ${currentPage === totalPages ? "text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed" : "text-gray-700 bg-white hover:bg-gray-50 border-gray-300 shadow-sm"}`}>
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================= */}
        {/* BILLING MODAL - NEW */}
        {/* ============================================= */}
        {showBillingModal && selectedBooking && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-gray-200 relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                    <ReceiptText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Patient Bill</h3>
                    <p className="text-xs text-gray-500">
                      {selectedBooking.patientName} • {billingData.billNumber}
                    </p>
                  </div>
                </div>
                <button onClick={() => { setShowBillingModal(false); setSelectedBooking(null); }} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div id="bill-content" className="mt-5">
                {/* Patient Info */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <div className="text-[10px] font-bold uppercase text-gray-400">Patient Name</div>
                      <div className="text-sm font-bold text-gray-900">{selectedBooking.patientName || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-gray-400">Phone</div>
                      <div className="text-sm font-bold text-gray-900">{selectedBooking.patientPhone || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-gray-400">Age / Gender</div>
                      <div className="text-sm font-bold text-gray-900">
                        {selectedBooking.patientAge || "N/A"} yrs / {selectedBooking.patientGender || "N/A"}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-gray-400">Appointment Date</div>
                      <div className="text-sm font-bold text-gray-900">
                        {formatDateToDDMMYYYY(selectedBooking.date)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bill Items */}
                <div className="overflow-x-auto mb-4">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-2 text-[11px] font-bold uppercase text-gray-500">Description</th>
                        <th className="text-center py-2 text-[11px] font-bold uppercase text-gray-500">Qty</th>
                        <th className="text-right py-2 text-[11px] font-bold uppercase text-gray-500">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billingData.items.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="py-2.5 text-sm font-medium text-gray-800">
                            {item.name}
                            {item.description && item.name !== 'Consultation Fee' && (
                              <div className="text-[11px] text-gray-400">{item.description}</div>
                            )}
                          </td>
                          <td className="py-2.5 text-sm text-center text-gray-700">{item.quantity}</td>
                          <td className="py-2.5 text-sm text-right font-medium text-gray-800">₹{item.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="border-t-2 border-gray-300 pt-4">
                  <div className="flex justify-end">
                    <div className="w-64">
                      <div className="flex justify-between py-1.5">
                        <span className="text-sm text-gray-600">Sub Total</span>
                        <span className="text-sm font-bold text-gray-800">₹{billingData.totalAmount}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-t border-gray-200">
                        <span className="text-base font-bold text-gray-800">Grand Total</span>
                        <span className="text-base font-bold text-emerald-700">₹{billingData.totalAmount}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-t border-gray-200 mt-1">
                        <span className="text-sm text-gray-600">Payment Status</span>
                        <span className={`text-sm font-bold ${billingData.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {billingData.paymentStatus}
                        </span>
                      </div>
                      {billingData.paymentStatus === "Pending" && (
                        <div className="flex justify-between py-1.5">
                          <span className="text-sm text-gray-600">Due Amount</span>
                          <span className="text-sm font-bold text-red-600">₹{billingData.dueAmount}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                  {billingData.paymentStatus === "Pending" && (
                    <button
                      onClick={handleMarkAsPaid}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Mark as Paid
                    </button>
                  )}
                  <button
                    onClick={printBill}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Printer className="w-4 h-4" /> Print Bill
                  </button>
                  <button
                    onClick={() => { setShowBillingModal(false); setSelectedBooking(null); }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Invoice Modal */}
        {showInvoiceModal && selectedBooking && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
              <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-gray-800 text-white flex items-center justify-center">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Invoice Preview</h3>
                    <p className="text-xs text-gray-500">{selectedBooking.patientName} • {selectedBooking.slotId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={downloadInvoice} className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-800 hover:bg-gray-900 text-white shadow-md transition-all flex items-center gap-1.5">
                    <Download className="w-4 h-4" /> Download / Print
                  </button>
                  <button onClick={() => { setShowInvoiceModal(false); setSelectedBooking(null); }} className="text-gray-400 hover:text-gray-600">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6" ref={invoiceRef}>
                <div style={{ fontFamily: "'Times New Roman', Times, serif", color: '#222222', maxWidth: '800px', margin: '0 auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #222222', paddingBottom: '20px', marginBottom: '30px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <img src={logo} alt="TimelyHealth" style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
                      <div>
                        <h1 style={{ fontSize: '28px', fontWeight: 'normal', letterSpacing: '2px', color: '#222222', margin: 0 }}>INVOICE</h1>
                        <div style={{ fontSize: '12px', color: '#666666', letterSpacing: '1px', marginTop: '2px' }}>TimelyHealth</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', color: '#888888', textTransform: 'uppercase', letterSpacing: '1px' }}>Invoice Number</div>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#222222' }}>{selectedBooking?.slotId || 'N/A'}</div>
                      <div style={{ fontSize: '12px', color: '#666666', marginTop: '4px' }}>
                        {formatDateToDDMMYYYY(selectedBooking?.date)}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', marginBottom: '20px', borderBottom: '1px solid #eeeeee', fontSize: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#888888', letterSpacing: '0.5px' }}>Booking Created Date</span>
                      <span style={{ fontWeight: 'bold', color: '#222222', marginTop: '2px' }}>{formatDateToDDMMYYYY(selectedBooking?.createdAt || selectedBooking?.updatedAt || selectedBooking?.date)}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
                      <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#888888', letterSpacing: '0.5px' }}>Appointment Date</span>
                      <span style={{ fontWeight: 'bold', color: '#222222', marginTop: '2px' }}>{formatDateToDDMMYYYY(selectedBooking?.date)}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#888888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Bill To</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#222222' }}>{selectedBooking?.patientName || 'N/A'}</div>
                      <div style={{ fontSize: '13px', color: '#555555', marginTop: '2px' }}>{selectedBooking?.patientAddress || 'N/A'}</div>
                      <div style={{ fontSize: '13px', color: '#555555', marginTop: '2px' }}>Phone: {selectedBooking?.patientPhone || 'N/A'}</div>
                      <div style={{ fontSize: '13px', color: '#555555', marginTop: '2px' }}>Age: {selectedBooking?.patientAge || 'N/A'} yrs</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', color: '#888888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Appointment Details</div>
                      <div style={{ fontSize: '13px', color: '#555555' }}>{selectedBooking?.dayOfWeek || 'N/A'}</div>
                      <div style={{ fontSize: '13px', color: '#555555', marginTop: '2px' }}>{selectedBooking?.startTime || 'N/A'} - {selectedBooking?.endTime || 'N/A'}</div>
                      <div style={{ fontSize: '13px', color: '#555555', marginTop: '2px' }}>{selectedBooking?.shift || 'N/A'}</div>
                    </div>
                  </div>

                  <div style={{ margin: '30px 0 10px 0' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#888888', borderBottom: '1px solid #dddddd', padding: '10px 0', fontWeight: 'normal', width: '50%' }}>Description</th>
                          <th style={{ textAlign: 'center', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#888888', borderBottom: '1px solid #dddddd', padding: '10px 0', fontWeight: 'normal', width: '25%' }}>Status</th>
                          <th style={{ textAlign: 'right', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#888888', borderBottom: '1px solid #dddddd', padding: '10px 0', fontWeight: 'normal', width: '25%' }}>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ padding: '12px 0', borderBottom: '1px solid #eeeeee', fontSize: '14px', color: '#333333' }}>Consultation Fee</td>
                          <td style={{ padding: '12px 0', borderBottom: '1px solid #eeeeee', fontSize: '14px', color: '#333333', textAlign: 'center' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '3px 12px',
                              borderRadius: '20px',
                              fontSize: '10px',
                              fontWeight: 'bold',
                              textTransform: 'uppercase',
                              letterSpacing: '1px',
                              background: (selectedBooking?.status || 'booked') === 'completed' ? '#dcfce7' : (selectedBooking?.status || 'booked') === 'consulting' ? '#f3e8ff' : (selectedBooking?.status || 'booked') === 'cancelled' ? '#fee2e2' : '#dbeafe',
                              color: (selectedBooking?.status || 'booked') === 'completed' ? '#166534' : (selectedBooking?.status || 'booked') === 'consulting' ? '#6b21a8' : (selectedBooking?.status || 'booked') === 'cancelled' ? '#991b1b' : '#1e40af',
                              border: `1px solid ${(selectedBooking?.status || 'booked') === 'completed' ? '#86efac' : (selectedBooking?.status || 'booked') === 'consulting' ? '#d8b4fe' : (selectedBooking?.status || 'booked') === 'cancelled' ? '#fca5a5' : '#93c5fd'}`
                            }}>
                              {selectedBooking?.status || 'booked'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 0', borderBottom: '1px solid #eeeeee', fontSize: '14px', color: '#333333', textAlign: 'right' }}>₹ {selectedBooking?.consultationFee || 0}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {(selectedBooking?.services && selectedBooking.services.length > 0) && (
                    <div style={{ margin: '10px 0 20px 0' }}>
                      <div style={{ fontSize: '12px', color: '#666666', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', borderBottom: '1px solid #dddddd', paddingBottom: '6px' }}>Additional Services</div>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            <th style={{ textAlign: 'left', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: '#888888', borderBottom: '1px solid #dddddd', padding: '6px 0', fontWeight: 'normal', width: '50%' }}>Service Name</th>
                            <th style={{ textAlign: 'center', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: '#888888', borderBottom: '1px solid #dddddd', padding: '6px 0', fontWeight: 'normal', width: '25%' }}>Status</th>
                            <th style={{ textAlign: 'right', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: '#888888', borderBottom: '1px solid #dddddd', padding: '6px 0', fontWeight: 'normal', width: '25%' }}>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedBooking.services.map((s, idx) => (
                            <tr key={idx}>
                              <td style={{ padding: '8px 0', borderBottom: '1px solid #eeeeee', fontSize: '13px', color: '#333333' }}>
                                {s.name} {s.description ? `(${s.description})` : ''}
                              </td>
                              <td style={{ padding: '8px 0', borderBottom: '1px solid #eeeeee', fontSize: '13px', color: '#333333', textAlign: 'center' }}>
                                <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: s.paymentStatus === 'Paid' ? '#222222' : '#999999' }}>
                                  {s.paymentStatus || 'Pending'}
                                </span>
                              </td>
                              <td style={{ padding: '8px 0', borderBottom: '1px solid #eeeeee', fontSize: '13px', color: '#333333', textAlign: 'right' }}>₹ {s.price || 0}</td>
                            </tr>
                          ))}
                          <tr style={{ borderTop: '2px solid #222222' }}>
                            <td colSpan="2" style={{ textAlign: 'right', fontWeight: 'bold', padding: '10px 0', fontSize: '13px' }}>Services Total</td>
                            <td style={{ textAlign: 'right', fontWeight: 'bold', padding: '10px 0', fontSize: '13px' }}>₹ {getTotalServiceFee(selectedBooking)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div style={{ margin: '20px 0 10px 0', padding: '15px 0', borderTop: '2px solid #222222', borderBottom: '2px solid #222222', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '14px', color: '#666666', textTransform: 'uppercase', letterSpacing: '1px' }}>Grand Total</div>
                      <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#222222' }}>₹ {(selectedBooking?.consultationFee || 0) + getTotalServiceFee(selectedBooking)}</div>
                      <div style={{ fontSize: '12px', color: '#666666', fontStyle: 'italic', marginTop: '4px' }}>
                        {numberToWords((selectedBooking?.consultationFee || 0) + getTotalServiceFee(selectedBooking))}
                      </div>
                    </div>
                  </div>

                  <div style={{ margin: '20px 0 10px 0', padding: '15px 0', borderTop: '1px solid #eeeeee', borderBottom: '1px solid #eeeeee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#666666', textTransform: 'uppercase', letterSpacing: '1px' }}>Payment Status</span>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: selectedBooking?.paymentStatus === 'Paid' ? '#222222' : '#999999' }}>
                      {selectedBooking?.paymentStatus || 'Pending'}
                    </span>
                  </div>

                  <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #dddddd', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#888888' }}>
                    <div>
                      <div>{selectedBooking?.doctorName || 'General OP Doctor'}</div>
                      <div style={{ fontSize: '12px', color: '#888888', letterSpacing: '1px', marginTop: '2px' }}>TimelyHealth</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div>Generated on {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                      <div>{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', fontSize: '13px', color: '#666666', letterSpacing: '1px', marginTop: '10px' }}>
                    Thank you for your visit
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Service Modal */}
        {showAddServiceModal && selectedBooking && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-gray-200">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Add Service</h3>
                    <p className="text-xs text-gray-500">
                      {selectedBooking.patientName} • {selectedBooking.dayOfWeek}
                    </p>
                  </div>
                </div>
                <button onClick={() => { setShowAddServiceModal(false); setServiceDropdownOpen(false); }} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="my-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Current Services</label>
                  <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium">
                    {selectedBooking.services && selectedBooking.services.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {selectedBooking.services.map((svc, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                            {svc.name} (₹{svc.price}) - {svc.paymentStatus}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">No services assigned</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Select Service <span className="text-red-500">*</span></label>
                  
                  <button onClick={() => setServiceDropdownOpen(!serviceDropdownOpen)} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white flex items-center justify-between">
                    <span className={selectedServiceForBooking ? "text-gray-900 font-medium" : "text-gray-400"}>
                      {selectedServiceForBooking ? `${selectedServiceForBooking.name} (₹${selectedServiceForBooking.price})` : "Select a service..."}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${serviceDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {serviceDropdownOpen && (
                    <div className="mt-1 border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto bg-white">
                      {servicesLoading ? (
                        <div className="px-4 py-3 text-center text-gray-500 text-sm">
                          <RefreshCw className="w-4 h-4 animate-spin inline mr-2" /> Loading services...
                        </div>
                      ) : services.length === 0 ? (
                        <div className="px-4 py-3 text-center text-gray-400 text-sm">No services available</div>
                      ) : (
                        services.map((service) => {
                          const alreadyAdded = (selectedBooking.services || []).some(s => s.serviceId === service._id);
                          return (
                            <button key={service._id} onClick={() => !alreadyAdded && handleServiceSelect(service)} className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors flex items-center justify-between ${alreadyAdded ? "opacity-50 cursor-not-allowed bg-gray-50" : ""} ${selectedServiceId === service._id ? "bg-emerald-50" : ""}`} disabled={alreadyAdded}>
                              <span className="font-medium text-gray-800">{service.name}</span>
                              <span className="text-xs font-bold text-emerald-700">{alreadyAdded ? "✓ Added" : `₹${service.price}`}</span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                {selectedServiceForBooking && (
                  <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-emerald-800">Selected Service</div>
                      <div className="text-sm font-bold text-gray-900">{selectedServiceForBooking.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Fee</div>
                      <div className="text-sm font-bold text-emerald-700">₹{selectedServiceForBooking.price}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3">
                <button onClick={() => { setShowAddServiceModal(false); setServiceDropdownOpen(false); }} className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all">
                  Cancel
                </button>
                <button onClick={handleAddServiceToBooking} disabled={!selectedServiceForBooking} className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all flex items-center gap-1.5 ${selectedServiceForBooking ? "bg-emerald-600 hover:bg-emerald-700" : "bg-gray-300 cursor-not-allowed"}`}>
                  <PlusCircle className="w-4 h-4" /> Add Service
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Service Payment Modal */}
        {showServicePaymentModal && selectedBooking && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-gray-200">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Service Payment Status</h3>
                    <p className="text-xs text-gray-500">{selectedBooking.patientName} • {selectedBooking.dayOfWeek}</p>
                  </div>
                </div>
                <button onClick={() => { setShowServicePaymentModal(false); setSelectedServiceFromBooking(null); }} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="my-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Select Service <span className="text-red-500">*</span></label>
                  <select value={selectedServiceFromBooking?.serviceId || selectedServiceFromBooking?._id || ""} onChange={(e) => {
                    const selectedId = e.target.value;
                    const service = (selectedBooking.services || []).find(s => s.serviceId === selectedId || s._id === selectedId);
                    if (service) { setSelectedServiceFromBooking(service); setUpdateServicePaymentStatus(service.paymentStatus || "Pending"); }
                  }} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white">
                    <option value="">Select a service...</option>
                    {(selectedBooking.services || []).map((svc) => {
                      const id = svc.serviceId || svc._id;
                      if (!id) return null;
                      return (
                        <option key={id} value={id}>
                          {svc.name} - ₹{svc.price} ({svc.paymentStatus || "Pending"})
                        </option>
                      );
                    })}
                  </select>
                </div>

                {selectedServiceFromBooking && (
                  <>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-[10px] font-bold uppercase text-gray-400">Service Name</div>
                          <div className="text-sm font-bold text-gray-900">{selectedServiceFromBooking.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-bold uppercase text-gray-400">Price</div>
                          <div className="text-sm font-bold text-emerald-700">₹{selectedServiceFromBooking.price}</div>
                        </div>
                      </div>
                      {selectedServiceFromBooking.description && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <div className="text-[10px] font-bold uppercase text-gray-400">Description</div>
                          <div className="text-xs text-gray-600">{selectedServiceFromBooking.description}</div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Current Payment Status</label>
                      <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase ${selectedServiceFromBooking.paymentStatus === "Paid" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                          {selectedServiceFromBooking.paymentStatus === "Paid" ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Clock className="w-3.5 h-3.5 text-amber-600" />}
                          {selectedServiceFromBooking.paymentStatus || "Pending"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Select New Payment Status</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setUpdateServicePaymentStatus("Pending")} className={`px-4 py-2.5 rounded-lg text-sm font-bold border-2 transition-all ${updateServicePaymentStatus === "Pending" ? "border-amber-500 bg-amber-50 text-amber-700" : "border-gray-300 bg-white text-gray-600 hover:border-amber-300 hover:bg-amber-50/50"}`}>
                          <Clock className="w-4 h-4 inline mr-1.5 text-amber-600" /> Pending
                        </button>
                        <button onClick={() => setUpdateServicePaymentStatus("Paid")} className={`px-4 py-2.5 rounded-lg text-sm font-bold border-2 transition-all ${updateServicePaymentStatus === "Paid" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-300 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50/50"}`}>
                          <CheckCircle2 className="w-4 h-4 inline mr-1.5 text-emerald-600" /> Paid
                        </button>
                      </div>
                    </div>

                    <div className={`p-3 rounded-lg border-2 ${updateServicePaymentStatus === "Paid" ? "bg-emerald-50 border-emerald-300" : "bg-amber-50 border-amber-300"}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold uppercase text-gray-500">Selected Status</div>
                          <div className={`text-sm font-bold ${updateServicePaymentStatus === "Paid" ? "text-emerald-700" : "text-amber-700"}`}>
                            {updateServicePaymentStatus === "Paid" ? "✅ Paid" : "⏳ Pending"}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">Service Fee</div>
                          <div className="text-sm font-bold text-gray-800">₹{selectedServiceFromBooking.price}</div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center justify-end gap-3">
                <button onClick={() => { setShowServicePaymentModal(false); setSelectedServiceFromBooking(null); }} className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all">
                  Cancel
                </button>
                <button onClick={handleUpdateServicePayment} disabled={!selectedServiceFromBooking} className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all flex items-center gap-1.5 ${selectedServiceFromBooking ? updateServicePaymentStatus === "Paid" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-amber-600 hover:bg-amber-700" : "bg-gray-300 cursor-not-allowed"}`}>
                  <CheckCircle2 className="w-4 h-4" /> Update Payment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Ticket Modal - Patient Details */}
        {showTicketModal && selectedBooking && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-gray-200 relative">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Appointment Details</h3>
                    <p className="text-xs text-gray-500">Ref ID: {selectedBooking.slotId || selectedBooking._id}</p>
                  </div>
                </div>
                <button onClick={() => setShowTicketModal(false)} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="my-5 bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <div>
                    <div className="text-[10px] font-bold uppercase text-gray-400">Patient Name</div>
                    <div className="text-base font-bold text-gray-900">{selectedBooking.patientName || "N/A"}</div>
                    {selectedBooking.patientPhone && (
                      <div className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" /> {selectedBooking.patientPhone}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold uppercase text-gray-400">Age / Gender</div>
                    <div className="text-sm font-bold text-gray-800">
                      {selectedBooking.patientAge ? `${selectedBooking.patientAge} Yrs` : "N/A"} ({selectedBooking.patientGender || "Male"})
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <div className="text-[10px] font-bold uppercase text-gray-400">Booking Date</div>
                    <div className="text-xs font-bold text-blue-900">
                      {formatDateToDDMMYYYY(selectedBooking.createdAt || selectedBooking.updatedAt || selectedBooking.date)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-gray-400">Appointment Date</div>
                    <div className="text-xs font-bold text-blue-900">
                      {formatDateToDDMMYYYY(selectedBooking.date)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase text-gray-400">Day</div>
                    <div className="text-xs font-bold text-blue-900">
                      {selectedBooking.dayOfWeek}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-gray-400">Time Slot</div>
                    <div className="text-xs font-bold text-blue-900">
                      {selectedBooking.startTime} – {selectedBooking.endTime}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <div className="text-[10px] font-bold uppercase text-gray-400">Services</div>
                  <div className="text-xs font-bold text-emerald-700">
                    {(selectedBooking.services || []).length > 0 ? (
                      (selectedBooking.services || []).map((svc, idx) => (
                        <div key={idx} className="font-medium">• {svc.name} (₹{svc.price}) - {svc.paymentStatus}</div>
                      ))
                    ) : (
                      <span className="text-gray-500 font-normal">No services assigned</span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold uppercase text-gray-400">Purpose of Visit</div>
                  <div className="text-xs font-medium text-gray-700">{selectedBooking.purpose || "General OPD Consultation"}</div>
                </div>

                <div className="pt-1">
                  <div className="text-[10px] font-bold uppercase text-gray-400">Patient Address</div>
                  <div className="text-xs font-medium text-gray-700">{selectedBooking.patientAddress || "N/A"}</div>
                </div>

                <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold uppercase text-gray-400">Total Fee</div>
                    <div className="text-sm font-extrabold text-blue-950">
                      ₹{(selectedBooking.consultationFee || 0) + getTotalServiceFee(selectedBooking)}
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <div>
                      <div className="text-[10px] font-bold uppercase text-gray-400">Payment Status</div>
                      <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${(selectedBooking.paymentStatus || "Pending") === "Paid" ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-amber-100 text-amber-900 border-amber-300"}`}>
                        {selectedBooking.paymentStatus || "Pending"}
                      </span>
                    </div>
                    {(selectedBooking.paymentStatus || "Pending") !== "Paid" && (
                      <button onClick={() => { setShowTicketModal(false); openPaymentModal(selectedBooking); }} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2 py-1 rounded shadow-xs transition-all">
                        Mark Paid
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button onClick={() => window.print()} className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center gap-1.5 transition-all">
                  <Printer className="w-4 h-4" /> Print Invoice
                </button>
                <button onClick={() => setShowTicketModal(false)} className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all">
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

export default Bookings;