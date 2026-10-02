// OpDashboard.js — Backend-filtered + Time filters + Stats + Revenue Breakdown (OpManagement style) + Mobile Welcome Popup
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import {
  Users, IndianRupee, CheckCircle2, Clock, TrendingUp, CreditCard,
  Banknote, Calendar, RefreshCw, ArrowRight, BarChart2, Activity,
  UserPlus, CalendarDays, Stethoscope, BookOpen,
  Gift, FlaskConical, Pill, Star, ShieldCheck, Wallet,
  Search, Trash2, Filter, AlertCircle, Smartphone, ChevronDown, ChevronUp, Plus
} from "lucide-react";
import {
  ResponsiveContainer, ComposedChart, Area, Bar, Line, XAxis, YAxis,
  Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend, BarChart
} from "recharts";
import "./EmployeeDashboard.css";
import "./Dashboard.css";

const COLORS = {
  primary: "#2563eb", success: "#10b981", warning: "#f59e0b",
  danger: "#ef4444", purple: "#8b5cf6", indigo: "#6366f1",
  pink: "#ec4899", cyan: "#06b6d4"
};

const BOOKING_TYPE_OPTIONS = [
  { value: "All", label: "All Booking Types" },
  { value: "Walk-In", label: "Walk-In" },
  { value: "Online", label: "Online" },
];

const REVENUE_CATEGORY_OPTIONS = [
  { value: "All", label: "All Revenue Types" },
  { value: "clinic", label: "Clinic Only" },
  { value: "lab", label: "Lab Only" },
  { value: "pharmacy", label: "Pharmacy Only" },
];

const PAYMENT_TYPE_FILTER_OPTIONS = [
  { value: "All", label: "All Payment Modes" },
  { value: "cash", label: "Cash" },
  { value: "online", label: "Online" },
  { value: "insurance", label: "Insurance" },
  { value: "card", label: "Card" },
];

// ✅ All moved to END
const TIME_FILTER_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "thisWeek", label: "This Week" },
  { value: "thisMonth", label: "This Month" },
  { value: "lastMonth", label: "Last Month" },
  { value: "thisYear", label: "This Year" },
  { value: "All", label: "All" },
];

const classifyService = (svc) => {
  if (!svc) return "clinic";
  const cat = (svc.category || svc.serviceCategory || svc.type || "").toString().toLowerCase();
  const name = (svc.name || "").toString().toLowerCase();
  if (cat.includes("pharm") || cat.includes("medic") || name.includes("pharm") || name.includes("medic")) return "pharmacy";
  if (cat.includes("lab") || cat.includes("test") || cat.includes("diagnos") || name.includes("lab") || name.includes("test")) return "lab";
  return "clinic";
};

const inr = (n) => `₹${Math.round(Number(n) || 0).toLocaleString("en-IN")}`;

const OpDashboard = () => {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [backendStats, setBackendStats] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // ══════════ FILTERS ══════════
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [doctorFilter, setDoctorFilter] = useState("All");
  const [bookingTypeFilter, setBookingTypeFilter] = useState("All");
  const [revenueCategoryFilter, setRevenueCategoryFilter] = useState("All");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [apptFromDate, setApptFromDate] = useState("");
  const [apptToDate, setApptToDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [timeFilter, setTimeFilter] = useState("All");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // ✅ Show/Hide toggles
  const [showFilters, setShowFilters] = useState(false);
  const [showRevenueBreakdown, setShowRevenueBreakdown] = useState(true);

  // ✅ Mobile Welcome Popup
  const [showMobileWelcome, setShowMobileWelcome] = useState(false);

  const [selectedTrendMonth, setSelectedTrendMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [trendChartType, setTrendChartType] = useState("composed");

  useEffect(() => { fetchAllData(); }, []);

  // ✅ Mobile Welcome Popup — on every mount in mobile view
  useEffect(() => {
    const isMobile = window.innerWidth < 1024;
    if (isMobile) {
      setShowMobileWelcome(true);
    }
  }, []);

  const handleMobileWelcomeChoice = (choice) => {
    setShowMobileWelcome(false);
    if (choice === "register") {
      setTimeout(() => {
        handleQuickAction("/op-management", { openAddPatient: true });
      }, 200);
    }
  };

  useEffect(() => {
    fetchBookingsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    timeFilter, fromDate, toDate, apptFromDate, apptToDate, selectedMonth,
    doctorFilter, paymentTypeFilter, statusFilter, bookingTypeFilter,
    revenueCategoryFilter, searchQuery
  ]);

  const fetchAllData = () => {
    fetchBookingsData();
    fetchDoctorsData();
    fetchSlotsData();
    fetchServicesData();
  };

  const fetchBookingsData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (timeFilter && timeFilter !== "All") params.append("timeFilter", timeFilter);
      if (apptFromDate) params.append("apptFrom", apptFromDate);
      if (apptToDate) params.append("apptTo", apptToDate);
      if (fromDate) params.append("regFrom", fromDate);
      if (toDate) params.append("regTo", toDate);
      if (selectedMonth) params.append("month", selectedMonth);
      if (doctorFilter !== "All") params.append("doctor", doctorFilter);
      if (paymentTypeFilter !== "All") params.append("paymentType", paymentTypeFilter);
      if (statusFilter !== "All") params.append("paymentStatus", statusFilter);
      if (bookingTypeFilter !== "All") params.append("bookingType", bookingTypeFilter);
      if (revenueCategoryFilter !== "All") params.append("revenueCategory", revenueCategoryFilter);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const url = `${API_BASE_URL}/appointment-slots/getallbookings${params.toString() ? "?" + params.toString() : ""}`;
      const res = await axios.get(url);

      if (res.data?.success) {
        const arr = res.data.bookings || res.data.data || [];
        const transformed = arr.map((b) => {
          const slotDetails = b.slotDetails || {};
          const rawServices =
            (Array.isArray(b.services) && b.services.length > 0 && b.services) ||
            (Array.isArray(b.serviceItems) && b.serviceItems.length > 0 && b.serviceItems) ||
            [];

          const normalizedServices = rawServices.map((s) => ({
            serviceId: s.serviceId || s._id || "",
            _id: s.serviceId || s._id || "",
            name: s.name || "Service",
            price: Number(s.price) || 0,
            description: s.description || "",
            category: s.category || s.serviceCategory || s.type || "",
          }));

          const reviews = Array.isArray(b.reviews) ? b.reviews : [];
          const servicesTotal = normalizedServices.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
          const medicineTotal = Number(b.medicineTotal) || 0;
          const labTotal = Number(b.labTotal) || 0;

          const finalPayable =
            Number(b.finalPayable) || Number(b.finalPayableAmount) ||
            Number(b.grandTotal) || Number(b.totalAmount) ||
            (servicesTotal + medicineTotal + labTotal - (Number(b.discount) || 0));

          const amountPaid = Number(b.amountPaid) || 0;
          const balanceAmount = Number(b.balanceAmount) || Math.max(0, finalPayable - amountPaid);

          return {
            _id: b._id || b.id,
            patientName: b.patientName || "",
            patientAge: b.patientAge || "",
            patientGender: b.patientGender || "Male",
            patientPhone: b.patientPhone || "",
            patientAddress: b.patientAddress || "",
            patientTitle: b.patientTitle || "",
            date: slotDetails.date || b.appointmentDate || b.date || "",
            appointmentDate: b.appointmentDate || slotDetails.date || b.date || "",
            startTime: slotDetails.startTime || b.startTime || "",
            endTime: slotDetails.endTime || b.endTime || "",
            doctorName: slotDetails.doctorName || b.doctorName || "",
            doctorSpecialization: slotDetails.doctorSpecialization || b.doctorSpecialization || "",
            purpose: b.purpose || "",
            paymentStatus: b.paymentStatus || "Pending",
            paymentType: b.paymentType || "cash",
            status: b.status || "confirmed",
            services: normalizedServices,
            serviceItems: normalizedServices,
            servicesTotal, clinicAmount: servicesTotal,
            pharmacyAmount: medicineTotal, labAmount: labTotal,
            medicineTotal, labTotal,
            subtotal: Number(b.subtotal) || servicesTotal,
            discount: Number(b.discount) || 0,
            commissionAmount: Number(b.commissionAmount) || 0,
            offerApplied: b.offerApplied || null,
            offerDeduction: Number(b.offerDeduction) || 0,
            finalPayable, totalAmount: finalPayable, grandTotal: finalPayable,
            amountPaid, balanceAmount,
            createdAt: b.createdAt || b.bookedAt || new Date().toISOString(),
            bookedAt: b.bookedAt || b.createdAt || new Date().toISOString(),
            isOP: b.isOP === true,
            isActive: b.isActive !== undefined ? b.isActive : true,
            reviews,
            isReviewed: b.isReviewed === true,
          };
        });
        setBookings(transformed);
        if (res.data.stats) setBackendStats(res.data.stats);
      } else {
        setBookings([]);
        setBackendStats(null);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setBookings([]);
      setBackendStats(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorsData = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/doctors/getalldoctors`);
      setDoctors(res.data?.success ? (res.data.data || []) : []);
    } catch { setDoctors([]); }
  };

  const fetchSlotsData = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/appointment-slots`);
      setSlots(res.data?.success ? (res.data.slots || []) : []);
    } catch { setSlots([]); }
  };

  const fetchServicesData = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/services/allservices`);
      setServices(res.data?.success ? (res.data.services || []) : []);
    } catch { setServices([]); }
  };

  // ── HELPERS ──
  const getBookingServices = (booking) => {
    if (!booking) return [];
    const base = Array.isArray(booking.services) ? booking.services.map((s) => ({ ...s, isReviewService: false })) : [];
    const revs = Array.isArray(booking.reviews) ? booking.reviews.map((r) => ({
      serviceId: r.serviceId || r._id || "",
      name: r.name || "Review Service",
      price: Number(r.price) || 0,
      category: "clinic",
      isReviewService: true,
    })) : [];
    return [...base, ...revs];
  };

  const getAmountBreakdown = (booking) => {
    if (!booking) return { clinic: 0, lab: 0, pharmacy: 0, total: 0 };
    const items = getBookingServices(booking);
    let clinic = 0, lab = 0, pharmacy = 0;
    items.forEach((s) => {
      const cat = classifyService(s);
      const price = Number(s.price) || 0;
      if (s.isReviewService) clinic += price;
      else if (cat === "lab") lab += price;
      else if (cat === "pharmacy") pharmacy += price;
      else clinic += price;
    });
    pharmacy += Number(booking.medicineTotal) || 0;
    lab += Number(booking.labTotal) || 0;
    const total = clinic + lab + pharmacy;
    if (total === 0) {
      const fb = Number(booking.finalPayable) || Number(booking.grandTotal) || 0;
      clinic = fb;
    }
    return { clinic, lab, pharmacy, total: clinic + lab + pharmacy };
  };

  const isPaidBooking = (b) => b && (b.paymentStatus === "Paid" || b.paymentStatus === "paid");
  const isPartialBooking = (b) => b && (b.paymentStatus === "Partial" || b.paymentStatus === "partial");

  const getTotalBookingFee = (booking) => {
    if (!booking) return 0;
    return (
      Number(booking.finalPayable) || Number(booking.grandTotal) ||
      Number(booking.totalAmount) ||
      (Number(booking.servicesTotal) || 0) + (Number(booking.medicineTotal) || 0) +
      (Number(booking.labTotal) || 0) - (Number(booking.discount) || 0) -
      (Number(booking.offerDeduction) || 0)
    );
  };

  const getBookingPaidInfo = (booking) => {
    if (!booking) return { final: 0, paid: 0, balance: 0, status: "Pending" };
    const final = getTotalBookingFee(booking);
    const status = booking.paymentStatus || "Pending";
    let paid = Number(booking.amountPaid) || 0;
    if (status === "Paid") paid = final;
    else if (status === "Pending" || status === "Due") paid = 0;
    return { final, paid, balance: Math.max(0, final - paid), status };
  };

  const getRevenueForBooking = (b) => getBookingPaidInfo(b).paid;

  const getBookingType = (booking) => {
    if (!booking) return "Walk-In";
    return booking.isOP === true ? "Walk-In" : "Online";
  };

  const filteredBookings = bookings;

  const filteredPatients = useMemo(() => {
    const map = new Map();
    bookings.forEach((b) => {
      const key = (b.patientPhone || b.patientName || "").toString().trim();
      if (!key) return;
      if (!map.has(key)) map.set(key, {
        phone: b.patientPhone, name: b.patientName,
        isActive: b.isActive !== undefined ? b.isActive : true,
        totalFee: 0, totalPaid: 0, isPaid: false, bookingCount: 0,
      });
      const p = map.get(key);
      const pi = getBookingPaidInfo(b);
      p.totalFee += pi.final;
      p.totalPaid += pi.paid;
      p.bookingCount += 1;
      if (isPaidBooking(b)) p.isPaid = true;
    });
    return Array.from(map.values());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings]);

  // ══════════ STATS (OpManagement style) ══════════
  const stats = useMemo(() => {
    if (backendStats) {
      return {
        total: backendStats.totalPatients || 0,
        active: backendStats.active || 0,
        inactive: backendStats.inactive || 0,
        paid: backendStats.paid || 0,
        partial: backendStats.partial || 0,
        due: backendStats.due || 0,
        pending: backendStats.pending || 0,
      };
    }
    // Fallback: client-compute
    const uniquePatients = new Set();
    let active = 0, inactive = 0;
    bookings.forEach((b) => {
      const key = (b.patientPhone || b.patientName || "").toString().trim();
      if (!key) return;
      uniquePatients.add(key);
      const isActive = b.isActive !== undefined ? b.isActive : true;
      if (isActive) active += 1; else inactive += 1;
    });
    return {
      total: uniquePatients.size,
      active: active,
      inactive: inactive,
      paid: bookings.filter(isPaidBooking).length,
      partial: bookings.filter(isPartialBooking).length,
      due: bookings.filter((b) => b.paymentStatus === "Due").length,
      pending: bookings.filter((b) => b.paymentStatus === "Pending").length,
    };
  }, [backendStats, bookings]);

  // ══════════ CATEGORY REVENUE (FootFall wala — OpManagement style) ══════════
  const categoryRevenue = useMemo(() => {
    const result = {
      clinic: { total: 0, cash: 0, online: 0, card: 0, insurance: 0, due: 0, footFall: 0 },
      lab:    { total: 0, cash: 0, online: 0, card: 0, insurance: 0, due: 0, footFall: 0 },
      pharmacy: { total: 0, cash: 0, online: 0, card: 0, insurance: 0, due: 0, footFall: 0 },
    };
    const seenSets = { clinic: new Set(), lab: new Set(), pharmacy: new Set() };

    bookings.forEach((b) => {
      const bd = getAmountBreakdown(b);
      const pi = getBookingPaidInfo(b);
      const mode = (b.paymentType || "cash").toString().toLowerCase();
      const patientKey = (b.patientPhone || b.patientName || "").toString().trim();
      const catTotal = (Number(bd.clinic) || 0) + (Number(bd.lab) || 0) + (Number(bd.pharmacy) || 0);
      if (catTotal <= 0) return;

      ["clinic", "lab", "pharmacy"].forEach((cat) => {
        const amt = Number(bd[cat]) || 0;
        if (amt <= 0) return;

        const ratio = amt / catTotal;
        const collected = pi.paid * ratio;
        const due = pi.balance * ratio;

        result[cat].total += collected;
        if (mode === "cash") result[cat].cash += collected;
        else if (mode === "online") result[cat].online += collected;
        else if (mode === "card") result[cat].card += collected;
        else if (mode === "insurance") result[cat].insurance += collected;
        result[cat].due += due;

        if (patientKey && !seenSets[cat].has(patientKey)) {
          seenSets[cat].add(patientKey);
          result[cat].footFall += 1;
        }
      });
    });

    const grandTotal = result.clinic.total + result.lab.total + result.pharmacy.total;
    const grandFootFall = result.clinic.footFall + result.lab.footFall + result.pharmacy.footFall;

    return { ...result, grandTotal, grandFootFall };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings]);

  const clientCollection = useMemo(() => {
    const r = { cash: 0, online: 0, card: 0, insurance: 0, due: 0 };
    const c = { cash: 0, online: 0, card: 0, insurance: 0 };
    bookings.forEach((b) => {
      const pi = getBookingPaidInfo(b);
      const mode = (b.paymentType || "cash").toString().toLowerCase();
      if (pi.paid > 0 && r[mode] !== undefined) {
        r[mode] += pi.paid;
        c[mode] += 1;
      }
      r.due += pi.balance;
    });
    return { amounts: r, counts: c };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings]);

  const metrics = useMemo(() => {
    const ca = clientCollection.amounts;
    const cc = clientCollection.counts;

    if (backendStats) {
      const rb = backendStats.revenueBreakdown || {};
      const cashRevenue = rb.cashCollected ?? ca.cash;
      const onlineRevenue = rb.onlineCollected ?? ca.online;
      const cardRevenue = rb.cardCollected ?? ca.card;
      const insuranceRevenue = rb.insuranceCollected ?? ca.insurance;
      const totalCollected = rb.totalCollected ?? backendStats.totalRevenue ??
        (cashRevenue + onlineRevenue + cardRevenue + insuranceRevenue);
      const dueAmount = rb.dueAmount ?? ca.due;
      const totalBilled = totalCollected + dueAmount;
      const totalPatients = backendStats.totalPatients || 0;

      return {
        total: totalPatients, totalRevenue: totalCollected, totalCollected,
        pendingRevenue: dueAmount, dueAmount,
        totalExpectedRevenue: totalBilled, totalBilled,
        avgFee: totalPatients > 0 ? Math.round(totalBilled / totalPatients) : 0,
        collectionRate: totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0,
        totalBookings: totalPatients,
        bookingPaidCount: backendStats.paid || 0,
        bookingPartialCount: backendStats.partial || 0,
        bookingPendingCount: (backendStats.pending || 0) + (backendStats.due || 0),
        cashCount: cc.cash, onlineCount: cc.online, insuranceCount: cc.insurance, cardCount: cc.card,
        cashRevenue, onlineRevenue, insuranceRevenue, cardRevenue,
        doctorsCount: doctors.length,
        totalClinic: rb.clinicRevenue || 0,
        totalLab: rb.labRevenue || 0,
        totalPharmacy: rb.pharmacyRevenue || 0,
        bookingsWithOfferCount: bookings.filter((b) => b.offerApplied && Number(b.offerApplied.offerAmount) > 0).length,
        totalOfferDeduction: bookings.reduce((s, b) => s + (b.offerApplied ? Number(b.offerApplied.offerAmount) || 0 : 0), 0),
        reviewedBookingsCount: bookings.filter((b) => b.isReviewed === true).length,
        totalReviewServices: bookings.reduce((s, b) => s + (Array.isArray(b.reviews) ? b.reviews.length : 0), 0),
      };
    }
    return {
      total: 0, totalRevenue: 0, totalCollected: 0, pendingRevenue: 0, dueAmount: 0,
      totalExpectedRevenue: 0, totalBilled: 0,
      avgFee: 0, collectionRate: 0, totalBookings: 0,
      bookingPaidCount: 0, bookingPartialCount: 0, bookingPendingCount: 0,
      cashCount: 0, onlineCount: 0, insuranceCount: 0, cardCount: 0,
      cashRevenue: 0, onlineRevenue: 0, insuranceRevenue: 0, cardRevenue: 0,
      doctorsCount: doctors.length,
      totalClinic: 0, totalLab: 0, totalPharmacy: 0,
      bookingsWithOfferCount: 0, totalOfferDeduction: 0,
      reviewedBookingsCount: 0, totalReviewServices: 0,
    };
  }, [backendStats, bookings, doctors, clientCollection]);

  const upcomingAppointments = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return bookings
      .filter((b) => {
        const d = new Date(b.date);
        if (isNaN(d.getTime())) return false;
        d.setHours(0, 0, 0, 0);
        return d >= today;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [bookings]);

  const trendData = useMemo(() => {
    if (!bookings.length) return [];
    const map = {};
    bookings.forEach((b) => {
      const key = b.createdAt
        ? new Date(b.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
        : "Unknown";
      if (!map[key]) map[key] = { date: key, bookings: 0, revenue: 0, rawDate: new Date(b.createdAt) };
      map[key].bookings += 1;
      map[key].revenue += getRevenueForBooking(b);
    });
    return Object.values(map).sort((a, b) => a.rawDate - b.rawDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings]);

  const monthlyDailyTrend = useMemo(() => {
    if (!selectedTrendMonth)
      return { daysData: [], monthLabel: "", totalMonthPatients: 0, totalMonthRevenue: 0, peakDay: "-" };
    const [y, m] = selectedTrendMonth.split("-");
    const year = parseInt(y, 10), monthIdx = parseInt(m, 10) - 1;
    const dateObj = new Date(year, monthIdx, 1);
    const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
    const monthLabel = dateObj.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

    const dayMap = {};
    for (let d = 1; d <= daysInMonth; d++) {
      const fd = String(d).padStart(2, "0");
      dayMap[d] = {
        day: fd, dateLabel: `${fd} ${dateObj.toLocaleDateString("en-IN", { month: "short" })}`,
        patients: 0, paidPatients: 0, pendingPatients: 0, revenue: 0, bookings: 0
      };
    }
    bookings.forEach((b) => {
      if (!b.createdAt) return;
      const d = new Date(b.createdAt);
      if (d.getFullYear() === year && d.getMonth() === monthIdx) {
        const day = d.getDate();
        if (dayMap[day]) {
          dayMap[day].patients += 1;
          dayMap[day].bookings += 1;
          dayMap[day].revenue += getRevenueForBooking(b);
          if (isPaidBooking(b)) dayMap[day].paidPatients += 1;
          else dayMap[day].pendingPatients += 1;
        }
      }
    });
    const daysData = Object.values(dayMap);
    const totalMonthPatients = daysData.reduce((s, d) => s + d.patients, 0);
    const totalMonthRevenue = daysData.reduce((s, d) => s + d.revenue, 0);
    let maxV = -1, peakDay = "-";
    daysData.forEach((d) => {
      if (d.patients > maxV && d.patients > 0) {
        maxV = d.patients;
        peakDay = `${d.dateLabel} (${d.patients} bookings)`;
      }
    });
    return { daysData, monthLabel, totalMonthPatients, totalMonthRevenue, peakDay };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings, selectedTrendMonth]);

  const paymentStatusData = useMemo(() => {
    const paid = bookings.filter(isPaidBooking).length;
    const partial = bookings.filter(isPartialBooking).length;
    const pending = bookings.filter((b) =>
      b.paymentStatus === "Pending" || b.paymentStatus === "Due"
    ).length;
    return [
      { name: "Paid", value: paid, color: COLORS.success },
      { name: "Partial", value: partial, color: COLORS.warning },
      { name: "Pending", value: pending, color: COLORS.danger }
    ];
  }, [bookings]);

  const paymentMethodData = useMemo(() => {
    const paid = bookings.filter(isPaidBooking);
    return [
      { name: "Cash", value: paid.filter((b) => b.paymentType === "cash" || !b.paymentType).length, color: COLORS.success },
      { name: "Online", value: paid.filter((b) => b.paymentType === "online").length, color: COLORS.indigo },
      { name: "Insurance", value: paid.filter((b) => b.paymentType === "insurance").length, color: COLORS.purple },
      { name: "Card", value: paid.filter((b) => b.paymentType === "card").length, color: COLORS.cyan }
    ];
  }, [bookings]);

  const genderData = useMemo(() => {
    const c = { Male: 0, Female: 0, Other: 0 };
    const seen = new Set();
    bookings.forEach((b) => {
      const key = (b.patientPhone || b.patientName || "").toString().trim();
      if (!key || seen.has(key)) return;
      seen.add(key);
      const g = b.patientGender || "Other";
      if (c[g] !== undefined) c[g]++; else c.Other++;
    });
    return [
      { name: "Male", value: c.Male, color: "#3b82f6" },
      { name: "Female", value: c.Female, color: "#ec4899" },
      { name: "Other", value: c.Other, color: "#a855f7" }
    ];
  }, [bookings]);

  const formatDate = (s) => !s ? "N/A" : new Date(s).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric"
  });

  const getUniqueDoctors = () => {
    const m = new Map();
    bookings.forEach((b) => { if (b.doctorName) m.set(b.doctorName, b.doctorName); });
    return Array.from(m.keys());
  };

  const hasActiveFilters =
    searchQuery !== "" || statusFilter !== "All" || doctorFilter !== "All" ||
    bookingTypeFilter !== "All" || revenueCategoryFilter !== "All" ||
    paymentTypeFilter !== "All" || fromDate !== "" || toDate !== "" ||
    apptFromDate !== "" || apptToDate !== "" || selectedMonth !== "" ||
    (timeFilter && timeFilter !== "All");

  const clearFilters = () => {
    setSearchQuery(""); setStatusFilter("All"); setDoctorFilter("All");
    setBookingTypeFilter("All"); setRevenueCategoryFilter("All");
    setPaymentTypeFilter("All"); setFromDate(""); setToDate("");
    setApptFromDate(""); setApptToDate(""); setSelectedMonth("");
    setTimeFilter("All");
  };

  const handleTimeFilterChange = (value) => {
    setTimeFilter(value);
    if (value !== "All") {
      setApptFromDate("");
      setApptToDate("");
      setSelectedMonth("");
    }
  };

  const handleFromDateChange = (e) => { setFromDate(e.target.value); if (e.target.value) setSelectedMonth(""); };
  const handleToDateChange = (e) => { setToDate(e.target.value); if (e.target.value) setSelectedMonth(""); };
  const handleMonthChange = (e) => { setSelectedMonth(e.target.value); setFromDate(""); setToDate(""); setTimeFilter("All"); };
  const handleApptFromChange = (e) => { setApptFromDate(e.target.value); if (e.target.value) { setSelectedMonth(""); setTimeFilter("All"); } };
  const handleApptToChange = (e) => { setApptToDate(e.target.value); if (e.target.value) { setSelectedMonth(""); setTimeFilter("All"); } };

  const handleQuickAction = (path, state = {}) => {
    const role = localStorage.getItem("userRole");
    if (role === "employee") {
      const clean = path.startsWith("/") ? path.substring(1) : path;
      navigate(`/employee/${clean}`, { state });
    } else navigate(path, { state });
  };

  const DailyTrendTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-xl shadow-xl border border-gray-200 text-xs space-y-1">
          <div className="font-bold text-gray-900 border-b border-gray-100 pb-1 mb-1">📅 {d.dateLabel}</div>
          <div className="flex justify-between gap-4 text-blue-700 font-semibold"><span>Total:</span><span>{d.patients}</span></div>
          <div className="flex justify-between gap-4 text-emerald-600"><span>Paid:</span><span>{d.paidPatients}</span></div>
          <div className="flex justify-between gap-4 text-amber-600"><span>Pending:</span><span>{d.pendingPatients}</span></div>
          <div className="flex justify-between gap-4 text-purple-700 font-bold pt-1 border-t border-gray-100">
            <span>Collected:</span><span>₹{d.revenue.toLocaleString()}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderTrendGraph = () => {
    const data = monthlyDailyTrend.daysData;
    return (
      <ComposedChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="opTrendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 10, fontWeight: "600" }} />
        <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: "#2563eb", fontSize: 10, fontWeight: "700" }} allowDecimals={false} />
        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: "#10b981", fontSize: 10, fontWeight: "700" }} allowDecimals={false} />
        <Tooltip content={<DailyTrendTooltip />} />

        {trendChartType === "area" && (<>
          <Area yAxisId="left" type="monotone" dataKey="patients" name="Bookings" stroke="#2563eb" strokeWidth={2.5} fill="url(#opTrendGradient)" dot={{ fill: "#2563eb", stroke: "#fff", strokeWidth: 1.5, r: 3.5 }} />
          <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={2.5} dot={{ fill: "#10b981", stroke: "#fff", strokeWidth: 1.5, r: 3.5 }} />
        </>)}
        {trendChartType === "bar" && (<>
          <Bar yAxisId="left" dataKey="patients" name="Bookings" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={16} />
          <Bar yAxisId="right" dataKey="revenue" name="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} barSize={16} />
        </>)}
        {trendChartType === "line" && (<>
          <Line yAxisId="left" type="monotone" dataKey="patients" name="Bookings" stroke="#2563eb" strokeWidth={3} dot={{ fill: "#2563eb", stroke: "#fff", strokeWidth: 1.5, r: 4 }} />
          <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={3} dot={{ fill: "#10b981", stroke: "#fff", strokeWidth: 1.5, r: 4 }} />
        </>)}
        {trendChartType === "composed" && (<>
          <Bar yAxisId="left" dataKey="patients" name="Bookings" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
          <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={3} dot={{ fill: "#10b981", stroke: "#fff", strokeWidth: 1.5, r: 4 }} />
        </>)}
      </ComposedChart>
    );
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="emp-dash">
        <div className="emp-dash__loading">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mb-3" />
          <p className="emp-dash__loading-text">Loading OP Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="emp-dash">
      <main className="p-2 sm:p-4 lg:p-6">

        {/* ✅ Mobile Welcome Popup */}
        {showMobileWelcome && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 lg:hidden">
            <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Welcome to OP Dashboard</h3>
                    <p className="text-xs text-blue-100">What would you like to do?</p>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <button onClick={() => handleMobileWelcomeChoice("register")}
                  className="w-full flex items-center gap-3 px-4 py-3.5 bg-emerald-50 border-2 border-emerald-200 rounded-xl hover:bg-emerald-100 hover:border-emerald-400 transition-all text-left group">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-emerald-800 text-sm">New OP Register</div>
                    <div className="text-[11px] text-emerald-600">Register a new patient & book slot</div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-emerald-400 -rotate-90" />
                </button>
                <button onClick={() => handleMobileWelcomeChoice("manage")}
                  className="w-full flex items-center gap-3 px-4 py-3.5 bg-blue-50 border-2 border-blue-200 rounded-xl hover:bg-blue-100 hover:border-blue-400 transition-all text-left group">
                  <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-blue-800 text-sm">View Dashboard</div>
                    <div className="text-[11px] text-blue-600">Analytics, revenue & bookings</div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-blue-400 -rotate-90" />
                </button>
              </div>
              <div className="px-5 pb-5">
                <p className="text-[10px] text-gray-400 text-center">You can always access these options from the main screen.</p>
              </div>
            </div>
          </div>
        )}

        {/* ══════════ HEADER DESKTOP ══════════ */}
        <div className="hidden lg:flex items-center justify-between gap-3 flex-wrap mb-3">
          <div className="flex items-center gap-3">
            <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap">
              OP <span>Dashboard</span>
            </h1>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-sm transition-colors"
            >
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showFilters ? "Hide Filters" : "Expand Filters"}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => handleQuickAction("/op-management", { openAddPatient: true })}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm">
              <UserPlus className="w-4 h-4" /> Register New OP
            </button>
            <button onClick={fetchAllData}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>

        {/* ══════════ FILTER BAR — Desktop (Main, always visible) ══════════ */}
        <div className="hidden lg:flex items-center gap-2.5 flex-wrap mb-3">
          <div className="relative min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[220px] pl-9 pr-3 py-2.5 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-11 px-3 py-2 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg">
            <option value="All">All Payment</option>
            <option value="Pending">Pending</option>
            <option value="Partial">Partial</option>
            <option value="Paid">Paid</option>
            <option value="Due">Due</option>
          </select>
          <select value={bookingTypeFilter} onChange={(e) => setBookingTypeFilter(e.target.value)} className="h-11 px-3 py-2 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg">
            {BOOKING_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)} className="h-11 px-3 py-2 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg max-w-[160px] truncate">
            <option value="All">All Doctors</option>
            {getUniqueDoctors().map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={revenueCategoryFilter} onChange={(e) => setRevenueCategoryFilter(e.target.value)} className="h-11 px-3 py-2 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg">
            {REVENUE_CATEGORY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select value={paymentTypeFilter} onChange={(e) => setPaymentTypeFilter(e.target.value)} className="h-11 px-3 py-2 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg">
            {PAYMENT_TYPE_FILTER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          {/* TIME FILTER */}
          <div className="flex items-center gap-0.5 bg-gray-100 p-1.5 rounded-lg border border-gray-200">
            {TIME_FILTER_OPTIONS.map((opt) => (
              <button key={opt.value} onClick={() => handleTimeFilterChange(opt.value)}
                className={`px-3 py-2 text-xs font-bold rounded-md transition-all whitespace-nowrap ${
                  timeFilter === opt.value
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-600 hover:bg-white hover:text-gray-900"
                }`}>
                {opt.label}
              </button>
            ))}
          </div>

          {hasActiveFilters && (
            <button onClick={clearFilters}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm">
              <Trash2 className="w-4 h-4 text-red-500" /> Clear
            </button>
          )}
        </div>

        {/* ══════════ EXPANDED FILTERS — Desktop ══════════ */}
        {showFilters && (
          <div className="hidden lg:flex items-center gap-2.5 flex-wrap mb-6">
            <div className="flex items-center gap-1.5 px-3 h-11 border border-gray-300 bg-white rounded-lg">
              <span className="text-[10px] font-bold text-gray-500 uppercase whitespace-nowrap">Reg:</span>
              <input type="date" value={fromDate} onChange={handleFromDateChange} className="w-[125px] h-8 px-1 text-xs border-0 bg-transparent text-gray-900 rounded focus:outline-none" />
              <span className="text-gray-400 text-sm">–</span>
              <input type="date" value={toDate} onChange={handleToDateChange} className="w-[125px] h-8 px-1 text-xs border-0 bg-transparent text-gray-900 rounded focus:outline-none" />
            </div>
            <div className="flex items-center gap-1.5 px-3 h-11 border border-gray-300 bg-white rounded-lg">
              <span className="text-[10px] font-bold text-gray-500 uppercase whitespace-nowrap">Appt:</span>
              <input type="date" value={apptFromDate} onChange={handleApptFromChange} className="w-[125px] h-8 px-1 text-xs border-0 bg-transparent text-gray-900 rounded focus:outline-none" />
              <span className="text-gray-400 text-sm">–</span>
              <input type="date" value={apptToDate} onChange={handleApptToChange} className="w-[125px] h-8 px-1 text-xs border-0 bg-transparent text-gray-900 rounded focus:outline-none" />
            </div>
            <input type="month" value={selectedMonth} onChange={handleMonthChange} className="w-[150px] h-11 px-3 py-2 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg" />
          </div>
        )}

        {/* ══════════ MOBILE HEADER ══════════ */}
        <div className="lg:hidden flex items-center justify-between gap-2 flex-wrap mb-3">
          <div className="flex items-baseline gap-2">
            <h1 className="text-base font-bold whitespace-nowrap">OP <span className="text-indigo-600">Dashboard</span></h1>
            <div className="emp-dash__date-pill text-[10px] px-2 py-1">
              <Users className="w-3 h-3 text-blue-600" />
              <span>{filteredPatients.length} Patients</span>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-wrap justify-end">
            <button onClick={() => handleQuickAction("/op-management", { openAddPatient: true })}
              className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-white bg-blue-600 rounded-lg">
              <UserPlus className="w-3 h-3" /> Add
            </button>
            <button onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg">
              <Filter className="w-3 h-3" /> Filters
            </button>
          </div>
        </div>

        {/* ══════════ MOBILE TIME FILTER ══════════ */}
        <div className="lg:hidden mb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {TIME_FILTER_OPTIONS.map((opt) => (
              <button key={opt.value} onClick={() => handleTimeFilterChange(opt.value)}
                className={`px-4 py-2.5 text-xs font-bold rounded-lg border transition-all whitespace-nowrap flex-shrink-0 ${
                  timeFilter === opt.value
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white text-gray-600 border-gray-300"
                }`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* ══════════ MOBILE FILTERS ══════════ */}
        <div className="lg:hidden">
          {showMobileFilters && (
            <div className="mb-4 p-4 bg-white rounded-xl border border-gray-200 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg">
                  <option value="All">All Payment</option>
                  <option value="Pending">Pending</option>
                  <option value="Partial">Partial</option>
                  <option value="Paid">Paid</option>
                  <option value="Due">Due</option>
                </select>
                <select value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg">
                  <option value="All">All Doctors</option>
                  {getUniqueDoctors().map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select value={bookingTypeFilter} onChange={(e) => setBookingTypeFilter(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg">
                  {BOOKING_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <select value={paymentTypeFilter} onChange={(e) => setPaymentTypeFilter(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg">
                  {PAYMENT_TYPE_FILTER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <select value={revenueCategoryFilter} onChange={(e) => setRevenueCategoryFilter(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg">
                {REVENUE_CATEGORY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Registered Date</label>
                <div className="grid grid-cols-2 gap-2">
                  <input type="date" value={fromDate} onChange={handleFromDateChange} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg" />
                  <input type="date" value={toDate} onChange={handleToDateChange} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Appointment Date</label>
                <div className="grid grid-cols-2 gap-2">
                  <input type="date" value={apptFromDate} onChange={handleApptFromChange} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg" />
                  <input type="date" value={apptToDate} onChange={handleApptToChange} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Month</label>
                <input type="month" value={selectedMonth} onChange={handleMonthChange} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg" />
              </div>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg">
                  <Trash2 className="w-4 h-4 text-red-500" /> Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* ══════════ QUICK ACTIONS ══════════ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <button onClick={() => handleQuickAction("/doctor-management")}
            className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100">
              <Stethoscope className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quick Action</div>
              <div className="text-sm font-bold text-gray-800">Doctors</div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-blue-600" />
          </button>
          <button onClick={() => handleQuickAction("/appointment-slots")}
            className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-purple-300 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center group-hover:bg-purple-100">
              <CalendarDays className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quick Action</div>
              <div className="text-sm font-bold text-gray-800">Slots</div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-purple-600" />
          </button>
          <button onClick={() => handleQuickAction("/op-management")}
            className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-emerald-300 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100">
              <UserPlus className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quick Action</div>
              <div className="text-sm font-bold text-gray-800">OP</div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-emerald-600" />
          </button>
          <button onClick={() => handleQuickAction("/bookings")}
            className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-amber-300 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center group-hover:bg-amber-100">
              <BookOpen className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quick Action</div>
              <div className="text-sm font-bold text-gray-800">Bookings</div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-amber-600" />
          </button>
        </div>

        {/* ══════════ STATS GRID (OpManagement style — 6 cards) ══════════ */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-6">
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Clinic Patients</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate"><Users className="w-4 h-4 text-blue-600" /></div>
            </div>
            <div className="emp-dash__stat-value">{stats.total}</div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0 text-[10px] font-bold leading-tight">
              <span className="text-emerald-600 whitespace-nowrap">Active: {stats.active}</span>
              <span className="text-red-500 whitespace-nowrap">Inactive: {stats.inactive}</span>
            </div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Paid</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present"><CheckCircle2 className="w-4 h-4 text-emerald-600" /></div>
            </div>
            <div className="emp-dash__stat-value text-emerald-600">{stats.paid}</div>
            <div className="emp-dash__stat-meta">completed payments</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Partial</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate"><Clock className="w-4 h-4 text-amber-600" /></div>
            </div>
            <div className="emp-dash__stat-value text-amber-600">{stats.partial}</div>
            <div className="emp-dash__stat-meta">partially paid</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Pending</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--late"><Clock className="w-4 h-4 text-gray-500" /></div>
            </div>
            <div className="emp-dash__stat-value text-gray-600">{stats.pending}</div>
            <div className="emp-dash__stat-meta">awaiting payment</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Due</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--late"><AlertCircle className="w-4 h-4 text-red-500" /></div>
            </div>
            <div className="emp-dash__stat-value text-red-500">{stats.due}</div>
            <div className="emp-dash__stat-meta">overdue payments</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Collected</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present"><IndianRupee className="w-4 h-4 text-blue-700" /></div>
            </div>
            <div className="emp-dash__stat-value text-blue-700">{inr(categoryRevenue.grandTotal)}</div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0 text-[9px] font-bold leading-tight">
              <span className="text-blue-700 whitespace-nowrap">Clinic: {inr(categoryRevenue.clinic.total)}</span>
              <span className="text-purple-700 whitespace-nowrap">Lab: {inr(categoryRevenue.lab.total)}</span>
              <span className="text-green-700 whitespace-nowrap">Pharmacy: {inr(categoryRevenue.pharmacy.total)}</span>
            </div>
          </div>
        </div>

        {/* ══════════ REVENUE BREAKDOWN (FootFall wala — OpManagement style) ══════════ */}
        <div className="mb-6 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Revenue Breakdown</h3>
              <span className="text-xs text-gray-500">(based on current filters)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-700 bg-white px-3 py-1 rounded-full border border-indigo-200">
                {filteredPatients.length} patients
              </span>
              <button
                onClick={() => setShowRevenueBreakdown(!showRevenueBreakdown)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-white border border-indigo-300 rounded-lg hover:bg-indigo-50 shadow-sm transition-colors">
                {showRevenueBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {showRevenueBreakdown ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {showRevenueBreakdown && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3">

              {/* Clinic Revenue */}
              <div className="rounded-lg p-4 border border-blue-200 bg-blue-50 min-h-[115px] flex flex-col justify-between">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 uppercase">
                    <Stethoscope className="w-3 h-3" /> Clinic Revenue
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[11px] font-bold text-blue-600 leading-tight">FootFall: {categoryRevenue.clinic.footFall}</span>
                    <span className="text-xl font-extrabold text-blue-800">{inr(categoryRevenue.clinic.total)}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-bold">
                  <span className="text-emerald-700 whitespace-nowrap">Cash: {inr(categoryRevenue.clinic.cash)}</span>
                  <span className="text-cyan-700 whitespace-nowrap">Online: {inr(categoryRevenue.clinic.online)}</span>
                  <span className="text-red-600 whitespace-nowrap">Due: {inr(categoryRevenue.clinic.due)}</span>
                </div>
              </div>

              {/* Lab Revenue */}
              <div className="rounded-lg p-4 border border-purple-200 bg-purple-50 min-h-[115px] flex flex-col justify-between">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700 uppercase">
                    <FlaskConical className="w-3 h-3" /> Lab Revenue
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[11px] font-bold text-purple-600 leading-tight">FootFall: {categoryRevenue.lab.footFall}</span>
                    <span className="text-xl font-extrabold text-purple-800">{inr(categoryRevenue.lab.total)}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-bold">
                  <span className="text-emerald-700 whitespace-nowrap">Cash: {inr(categoryRevenue.lab.cash)}</span>
                  <span className="text-cyan-700 whitespace-nowrap">Online: {inr(categoryRevenue.lab.online)}</span>
                  <span className="text-red-600 whitespace-nowrap">Due: {inr(categoryRevenue.lab.due)}</span>
                </div>
              </div>

              {/* Pharmacy Revenue */}
              <div className="rounded-lg p-4 border border-green-200 bg-green-50 min-h-[115px] flex flex-col justify-between">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-green-700 uppercase">
                    <Pill className="w-3 h-3" /> Pharmacy Revenue
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[11px] font-bold text-green-600 leading-tight">FootFall: {categoryRevenue.pharmacy.footFall}</span>
                    <span className="text-xl font-extrabold text-green-800">{inr(categoryRevenue.pharmacy.total)}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-bold">
                  <span className="text-emerald-700 whitespace-nowrap">Cash: {inr(categoryRevenue.pharmacy.cash)}</span>
                  <span className="text-cyan-700 whitespace-nowrap">Online: {inr(categoryRevenue.pharmacy.online)}</span>
                  <span className="text-red-600 whitespace-nowrap">Due: {inr(categoryRevenue.pharmacy.due)}</span>
                </div>
              </div>

              {/* Total Collected */}
              <div className="rounded-lg p-4 border border-slate-300 bg-slate-50 min-h-[115px] flex flex-col justify-between">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase">
                    <IndianRupee className="w-3 h-3" /> Total Collected
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[11px] font-bold text-slate-600 leading-tight">FootFall: {categoryRevenue.grandFootFall}</span>
                    <span className="text-xl font-extrabold text-slate-900">{inr(categoryRevenue.grandTotal)}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-bold">
                  <span className="text-blue-700 whitespace-nowrap">Clinic: {inr(categoryRevenue.clinic.total)}</span>
                  <span className="text-purple-700 whitespace-nowrap">Lab: {inr(categoryRevenue.lab.total)}</span>
                  <span className="text-green-700 whitespace-nowrap">Pharmacy: {inr(categoryRevenue.pharmacy.total)}</span>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* ══════════ CHARTS ROW 1 ══════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 emp-dash__card p-4 md:p-5">
            <div className="mb-4">
              <h3 className="font-bold text-gray-800 text-sm md:text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" /> Bookings &amp; Revenue Trend
              </h3>
              <p className="text-xs text-gray-500">Daily booking volume and collected revenue</p>
            </div>
            {trendData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-400 text-xs">No trend data for selected filters</div>
            ) : (
              <div style={{ width: "100%", height: 260, position: "relative" }}>
                <ResponsiveContainer width="100%" height={260}>
                  <ComposedChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#64748b" }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#10b981" }} />
                    <Tooltip contentStyle={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
                    <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                    <Bar yAxisId="left" dataKey="bookings" name="Bookings" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={24} />
                    <Line yAxisId="right" type="monotone" dataKey="revenue" name="Collected" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="emp-dash__card p-4 md:p-5 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-gray-800 text-sm md:text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" /> Upcoming / Today
                </h3>
                <p className="text-xs text-gray-500">Today and future appointments</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {upcomingAppointments.length}
              </span>
            </div>
            {upcomingAppointments.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-8 text-gray-400">
                <CalendarDays className="w-10 h-10 mb-2 text-gray-300" />
                <p className="text-xs font-medium">No upcoming appointments</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {upcomingAppointments.slice(0, 8).map((b, idx) => {
                  const apptDate = new Date(b.date);
                  const today = new Date(); today.setHours(0, 0, 0, 0);
                  apptDate.setHours(0, 0, 0, 0);
                  const isToday = apptDate.getTime() === today.getTime();
                  const isPaid = isPaidBooking(b);
                  return (
                    <div key={b._id || idx}
                      className={`p-2.5 rounded-lg border ${isToday ? "bg-emerald-50/60 border-emerald-200" : "bg-gray-50/60 border-gray-200"}`}>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="font-bold text-slate-800 text-xs truncate">{b.patientName || "N/A"}</span>
                            {isToday && <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-emerald-600 text-white uppercase">Today</span>}
                          </div>
                          <div className="text-[10px] text-gray-600 flex items-center gap-1 truncate">
                            <Stethoscope className="w-2.5 h-2.5 flex-shrink-0" />
                            <span className="truncate">{b.doctorName || "N/A"}</span>
                          </div>
                        </div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase border flex-shrink-0 ${isPaid ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-amber-100 text-amber-700 border-amber-200"}`}>
                          {b.paymentStatus || "Pending"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1 text-slate-700">
                          <Calendar className="w-2.5 h-2.5 text-blue-600" />
                          <span className="font-semibold">{formatDate(b.date)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-blue-700">
                          <Clock className="w-2.5 h-2.5" />
                          <span className="font-semibold">{b.startTime || "-"} - {b.endTime || "-"}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ══════════ CHARTS ROW 2 ══════════ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="emp-dash__card p-4 md:p-5">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Payment Status
            </h3>
            <p className="text-xs text-gray-500 mb-3">Paid vs Pending breakdown</p>
            <div style={{ width: "100%", height: 180 }}>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={paymentStatusData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={60} />
                  <Tooltip />
                  <Bar dataKey="value" name="Bookings" radius={[0, 6, 6, 0]}>
                    {paymentStatusData.map((e, i) => <Cell key={`s-${i}`} fill={e.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-around pt-2 text-xs border-t border-gray-100 mt-2">
              <div className="text-center"><span className="text-emerald-600 font-bold block text-sm">{stats.paid}</span><span className="text-gray-500 text-[11px]">Paid</span></div>
              <div className="text-center"><span className="text-amber-600 font-bold block text-sm">{stats.partial}</span><span className="text-gray-500 text-[11px]">Partial</span></div>
              <div className="text-center"><span className="text-red-600 font-bold block text-sm">{stats.pending + stats.due}</span><span className="text-gray-500 text-[11px]">Pending</span></div>
            </div>
          </div>

          <div className="emp-dash__card p-4 md:p-5">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 mb-1">
              <CreditCard className="w-4 h-4 text-indigo-600" /> Payment Mode (Paid)
            </h3>
            <p className="text-xs text-gray-500 mb-3">Cash · Online · Insurance · Card</p>
            <div style={{ width: "100%", height: 180 }}>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={paymentMethodData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={70} />
                  <Tooltip />
                  <Bar dataKey="value" name="Bookings" radius={[0, 6, 6, 0]}>
                    {paymentMethodData.map((e, i) => <Cell key={`m-${i}`} fill={e.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-4 pt-2 text-xs border-t border-gray-100 mt-2 gap-1">
              {paymentMethodData.map((m) => (
                <div key={m.name} className="text-center">
                  <span className="font-bold block text-sm" style={{ color: m.color }}>{m.value}</span>
                  <span className="text-gray-500 text-[10px]">{m.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="emp-dash__card p-4 md:p-5">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-pink-600" /> Gender Demographics
            </h3>
            <p className="text-xs text-gray-500 mb-3">Patient gender distribution</p>
            <div style={{ width: "100%", height: 180 }}>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={genderData} cx="50%" cy="50%" outerRadius={65} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {genderData.map((e, i) => <Cell key={`g-${i}`} fill={e.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-around pt-2 text-xs border-t border-gray-100 mt-2">
              {genderData.map((g) => (
                <div key={g.name} className="text-center">
                  <span className="font-bold block text-sm" style={{ color: g.color }}>{g.value}</span>
                  <span className="text-gray-500 text-[11px]">{g.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════ MONTHLY TREND ══════════ */}
        <div className="emp-dash__card p-4 md:p-5 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-gray-800 text-sm md:text-base flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-blue-600" /> Daily Booking Trend ({monthlyDailyTrend.monthLabel})
              </h3>
              <p className="text-xs text-gray-500">Day-by-day booking volume and collected revenue</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg border border-gray-200">
                {["composed", "area", "bar", "line"].map((t) => (
                  <button key={t} onClick={() => setTrendChartType(t)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-md capitalize ${trendChartType === t ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-200"}`}>
                    {t}
                  </button>
                ))}
              </div>
              <input type="month" value={selectedTrendMonth} onChange={(e) => setSelectedTrendMonth(e.target.value)}
                className="px-2.5 py-1 text-xs border border-gray-300 rounded-lg font-bold text-gray-700 bg-gray-50" />
            </div>
          </div>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer width="100%" height={260}>{renderTrendGraph()}</ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 mt-2 border-t border-gray-100 text-center text-xs">
            <div className="bg-slate-50 p-2 rounded-lg">
              <span className="text-[10px] text-gray-500 font-bold uppercase block">Month</span>
              <span className="font-bold text-gray-800">{monthlyDailyTrend.monthLabel}</span>
            </div>
            <div className="bg-blue-50 p-2 rounded-lg">
              <span className="text-[10px] text-blue-700 font-bold uppercase block">Bookings</span>
              <span className="font-extrabold text-blue-900 text-sm">{monthlyDailyTrend.totalMonthPatients}</span>
            </div>
            <div className="bg-emerald-50 p-2 rounded-lg">
              <span className="text-[10px] text-emerald-700 font-bold uppercase block">Collected</span>
              <span className="font-extrabold text-emerald-900 text-sm">{inr(monthlyDailyTrend.totalMonthRevenue)}</span>
            </div>
            <div className="bg-purple-50 p-2 rounded-lg">
              <span className="text-[10px] text-purple-700 font-bold uppercase block">Peak Day</span>
              <span className="font-bold text-purple-900 truncate block">{monthlyDailyTrend.peakDay}</span>
            </div>
          </div>
        </div>

        {/* ══════════ RECENT BOOKINGS ══════════ */}
        <div className="emp-dash__card p-4 md:p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-800 text-sm md:text-base">Recent Bookings</h3>
              <p className="text-xs text-gray-500">Filtered results ({filteredBookings.length})</p>
            </div>
            <button onClick={() => handleQuickAction("/bookings")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {filteredBookings.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-xs">No bookings match your filters</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="emp-dash__table">
                <thead>
                  <tr>
                    <th style={{ width: 40, textAlign: "center" }}>S.No</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th style={{ textAlign: "center" }}>Date &amp; Slot</th>
                    <th style={{ textAlign: "center" }}>Offer</th>
                    <th style={{ textAlign: "center" }}>Total</th>
                    <th style={{ textAlign: "center" }}>Paid</th>
                    <th style={{ textAlign: "center" }}>Balance</th>
                    <th style={{ textAlign: "center" }}>Mode</th>
                    <th style={{ textAlign: "center" }}>Review</th>
                    <th style={{ textAlign: "center" }}>Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.slice(0, 10).map((b, idx) => {
                    const totalFee = getTotalBookingFee(b);
                    const pi = getBookingPaidInfo(b);
                    const isPaid = isPaidBooking(b);
                    const isPartial = isPartialBooking(b);
                    const offer = b.offerApplied;
                    return (
                      <tr key={b._id || idx} className="hover:bg-slate-50/50">
                        <td className="px-3 py-2.5 font-semibold text-gray-400 text-xs text-center">{idx + 1}</td>
                        <td className="px-3 py-2.5 font-semibold text-gray-800 text-xs">{b.patientName || "N/A"}</td>
                        <td className="px-3 py-2.5 text-xs text-gray-700">{b.doctorName || "N/A"}</td>
                        <td className="px-3 py-2.5 text-xs text-gray-600 text-center">
                          <div>{formatDate(b.date)}</div>
                          <div className="text-[10px] text-gray-400">{b.startTime} - {b.endTime}</div>
                        </td>
                        <td className="px-3 py-2.5 text-center whitespace-nowrap">
                          {offer && offer.offerAmount > 0 ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              <Gift className="w-2.5 h-2.5" /> −₹{offer.offerAmount}
                            </span>
                          ) : <span className="text-[10px] text-gray-400 italic">—</span>}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-center font-bold text-gray-800">₹{totalFee}</td>
                        <td className="px-3 py-2.5 text-xs text-center font-bold text-emerald-700">₹{pi.paid}</td>
                        <td className="px-3 py-2.5 text-xs text-center font-bold text-amber-700">₹{pi.balance}</td>
                        <td className="px-3 py-2.5 text-xs text-center">
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border bg-slate-50 text-slate-700 border-slate-200">
                            {b.paymentType || "cash"}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-center whitespace-nowrap">
                          {b.isReviewed ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <Star className="w-2.5 h-2.5" /> Yes
                            </span>
                          ) : <span className="text-[10px] text-gray-400 italic">—</span>}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            isPaid ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                            : isPartial ? "bg-amber-100 text-amber-800 border-amber-200"
                            : "bg-red-100 text-red-800 border-red-200"}`}>
                            {b.paymentStatus || "Pending"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default OpDashboard;