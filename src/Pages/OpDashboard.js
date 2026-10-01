import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import {
  Users, IndianRupee, CheckCircle2, Clock, TrendingUp, CreditCard,
  Banknote, Calendar, RefreshCw, ArrowRight, BarChart2, Activity,
  UserPlus, CalendarDays, Stethoscope, BookOpen, X,
  Gift, FlaskConical, Pill, Star, ShieldCheck, Wallet,
  Search, Trash2, Filter
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

const classifyService = (svc) => {
  if (!svc) return "clinic";
  const cat = (svc.category || svc.serviceCategory || svc.type || "").toString().toLowerCase();
  const name = (svc.name || "").toString().toLowerCase();
  if (cat.includes("pharm") || cat.includes("medic") || name.includes("pharm") || name.includes("medic")) return "pharmacy";
  if (cat.includes("lab") || cat.includes("test") || cat.includes("diagnos") || name.includes("lab") || name.includes("test")) return "lab";
  return "clinic";
};

const isDateInRange = (dateStr, from, to) => {
  if (!from && !to) return true;
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  if (from && to) {
    const f = new Date(from); f.setHours(0, 0, 0, 0);
    const t = new Date(to); t.setHours(23, 59, 59, 999);
    return d >= f && d <= t;
  }
  if (from) { const f = new Date(from); f.setHours(0, 0, 0, 0); return d >= f; }
  if (to) { const t = new Date(to); t.setHours(23, 59, 59, 999); return d <= t; }
  return true;
};

const OpDashboard = () => {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // ══════════ ALL FILTERS (exact same as OpManagement) ══════════
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
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [selectedTrendMonth, setSelectedTrendMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [trendChartType, setTrendChartType] = useState("composed");

  useEffect(() => { fetchAllData(); }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchPatientsData(), fetchBookingsData(),
        fetchDoctorsData(), fetchSlotsData(), fetchServicesData(),
      ]);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchPatientsData = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/patients`);
      if (res.data?.success) setPatients(res.data.data || []);
      else if (Array.isArray(res.data)) setPatients(res.data);
      else setPatients([]);
    } catch { setPatients([]); }
  };

  const fetchBookingsData = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/appointment-slots/getallbookings`);
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
            reviews,
            isReviewed: b.isReviewed === true,
          };
        });
        setBookings(transformed);
      } else setBookings([]);
    } catch { setBookings([]); }
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

  const getCategoryPaidAmounts = (booking) => {
    if (!booking || !isPaidBooking(booking)) return { clinic: 0, pharmacy: 0, lab: 0 };
    return getAmountBreakdown(booking);
  };

  const getBookingType = (booking) => {
    if (!booking) return "Walk-In";
    return booking.isOP === true ? "Walk-In" : "Online";
  };

  // ── MASTER FILTER ──
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (!isDateInRange(b.createdAt, fromDate, toDate)) return false;
      if (!isDateInRange(b.appointmentDate || b.date, apptFromDate, apptToDate)) return false;

      if (selectedMonth) {
        const ds = b.appointmentDate || b.date;
        if (!ds) return false;
        const d = new Date(ds);
        if (isNaN(d.getTime())) return false;
        const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (m !== selectedMonth) return false;
      }

      if (doctorFilter !== "All" && b.doctorName !== doctorFilter) return false;
      if (bookingTypeFilter !== "All" && getBookingType(b) !== bookingTypeFilter) return false;
      if (statusFilter !== "All" && (b.paymentStatus || "Pending") !== statusFilter) return false;
      if (paymentTypeFilter !== "All" &&
        (b.paymentType || "cash").toLowerCase() !== paymentTypeFilter.toLowerCase()) return false;

      if (revenueCategoryFilter !== "All") {
        const bd = getAmountBreakdown(b);
        if (revenueCategoryFilter === "clinic" && !(bd.clinic > 0)) return false;
        if (revenueCategoryFilter === "lab" && !(bd.lab > 0)) return false;
        if (revenueCategoryFilter === "pharmacy" && !(bd.pharmacy > 0)) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const m =
          (b.patientName || "").toLowerCase().includes(q) ||
          (b.patientPhone || "").toLowerCase().includes(q) ||
          (b.doctorName || "").toLowerCase().includes(q) ||
          (b.purpose || "").toLowerCase().includes(q);
        if (!m) return false;
      }

      return true;
    });
  }, [
    bookings, fromDate, toDate, apptFromDate, apptToDate, selectedMonth,
    doctorFilter, bookingTypeFilter, statusFilter, paymentTypeFilter,
    revenueCategoryFilter, searchQuery
  ]);

  const filteredPatients = useMemo(() => {
    const map = new Map();
    filteredBookings.forEach((b) => {
      const key = (b.patientPhone || b.patientName || "").toString().trim();
      if (!key) return;
      if (!map.has(key)) map.set(key, {
        phone: b.patientPhone, name: b.patientName,
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
  }, [filteredBookings]);

  // ── METRICS ──
  const metrics = useMemo(() => {
    const totalRevenue = filteredBookings.reduce((s, b) => s + getRevenueForBooking(b), 0);
    const totalExpectedRevenue = filteredBookings.reduce((s, b) => s + getTotalBookingFee(b), 0);
    const pendingRevenue = Math.max(0, totalExpectedRevenue - totalRevenue);
    const avgFee = filteredBookings.length > 0 ? Math.round(totalExpectedRevenue / filteredBookings.length) : 0;
    const collectionRate = totalExpectedRevenue > 0 ? Math.round((totalRevenue / totalExpectedRevenue) * 100) : 0;

    const bookingPaidCount = filteredBookings.filter(isPaidBooking).length;
    const bookingPartialCount = filteredBookings.filter(isPartialBooking).length;
    const bookingPendingCount = filteredBookings.filter((b) =>
      b.paymentStatus === "Pending" || b.paymentStatus === "Due"
    ).length;

    const paidBookings = filteredBookings.filter(isPaidBooking);
    const cashCount = paidBookings.filter((b) => b.paymentType === "cash" || !b.paymentType).length;
    const onlineCount = paidBookings.filter((b) => b.paymentType === "online").length;
    const insuranceCount = paidBookings.filter((b) => b.paymentType === "insurance").length;
    const cardCount = paidBookings.filter((b) => b.paymentType === "card").length;

    let cashRevenue = 0, onlineRevenue = 0, insuranceRevenue = 0, cardRevenue = 0;
    paidBookings.forEach((b) => {
      const paid = getRevenueForBooking(b);
      const pt = (b.paymentType || "cash").toLowerCase();
      if (pt === "cash") cashRevenue += paid;
      else if (pt === "online") onlineRevenue += paid;
      else if (pt === "insurance") insuranceRevenue += paid;
      else if (pt === "card") cardRevenue += paid;
    });

    let totalClinic = 0, totalPharmacy = 0, totalLab = 0;
    filteredBookings.forEach((b) => {
      const cats = getCategoryPaidAmounts(b);
      totalClinic += cats.clinic;
      totalPharmacy += cats.pharmacy;
      totalLab += cats.lab;
    });

    const bookingsWithOffer = filteredBookings.filter(
      (b) => b.offerApplied && Number(b.offerApplied.offerAmount) > 0
    );
    const totalOfferDeduction = bookingsWithOffer.reduce(
      (s, b) => s + (Number(b.offerApplied.offerAmount) || 0), 0
    );

    const reviewedBookings = filteredBookings.filter((b) => b.isReviewed === true);
    const totalReviewServices = filteredBookings.reduce(
      (s, b) => s + (Array.isArray(b.reviews) ? b.reviews.length : 0), 0
    );
    const totalReviewRevenue = filteredBookings.reduce((s, b) => {
      if (!isPaidBooking(b)) return s;
      return s + (Array.isArray(b.reviews) ? b.reviews.reduce((x, r) => x + (Number(r.price) || 0), 0) : 0);
    }, 0);

    return {
      total: filteredPatients.length,
      totalRevenue, pendingRevenue, totalExpectedRevenue, avgFee, collectionRate,
      totalBookings: filteredBookings.length,
      bookingPaidCount, bookingPartialCount, bookingPendingCount,
      cashCount, onlineCount, insuranceCount, cardCount,
      cashRevenue, onlineRevenue, insuranceRevenue, cardRevenue,
      doctorsCount: doctors.length,
      totalClinic, totalPharmacy, totalLab,
      bookingsWithOfferCount: bookingsWithOffer.length, totalOfferDeduction,
      reviewedBookingsCount: reviewedBookings.length, totalReviewServices, totalReviewRevenue,
    };
  }, [filteredPatients, filteredBookings, doctors]);

  const upcomingAppointments = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return filteredBookings
      .filter((b) => {
        const d = new Date(b.date);
        if (isNaN(d.getTime())) return false;
        d.setHours(0, 0, 0, 0);
        return d >= today;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [filteredBookings]);

  const trendData = useMemo(() => {
    if (!filteredBookings.length) return [];
    const map = {};
    filteredBookings.forEach((b) => {
      const key = b.createdAt
        ? new Date(b.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
        : "Unknown";
      if (!map[key]) map[key] = { date: key, bookings: 0, revenue: 0, rawDate: new Date(b.createdAt) };
      map[key].bookings += 1;
      map[key].revenue += getRevenueForBooking(b);
    });
    return Object.values(map).sort((a, b) => a.rawDate - b.rawDate);
  }, [filteredBookings]);

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
    filteredBookings.forEach((b) => {
      if (!b.createdAt) return;
      const d = new Date(b.createdAt);
      if (d.getFullYear() === year && d.getMonth() === monthIdx) {
        const day = d.getDate();
        if (dayMap[day]) {
          dayMap[day].patients += 1;
          dayMap[day].bookings += 1;
          if (isPaidBooking(b)) {
            dayMap[day].revenue += getTotalBookingFee(b);
            dayMap[day].paidPatients += 1;
          } else dayMap[day].pendingPatients += 1;
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
  }, [filteredBookings, selectedTrendMonth]);

  const paymentStatusData = useMemo(() => {
    const paid = filteredBookings.filter(isPaidBooking).length;
    const partial = filteredBookings.filter(isPartialBooking).length;
    const pending = filteredBookings.filter((b) =>
      b.paymentStatus === "Pending" || b.paymentStatus === "Due"
    ).length;
    return [
      { name: "Paid", value: paid, color: COLORS.success },
      { name: "Partial", value: partial, color: COLORS.warning },
      { name: "Pending", value: pending, color: COLORS.danger }
    ];
  }, [filteredBookings]);

  const paymentMethodData = useMemo(() => {
    const paid = filteredBookings.filter(isPaidBooking);
    return [
      { name: "Cash", value: paid.filter((b) => b.paymentType === "cash" || !b.paymentType).length, color: COLORS.success },
      { name: "Online", value: paid.filter((b) => b.paymentType === "online").length, color: COLORS.indigo },
      { name: "Insurance", value: paid.filter((b) => b.paymentType === "insurance").length, color: COLORS.purple },
      { name: "Card", value: paid.filter((b) => b.paymentType === "card").length, color: COLORS.cyan }
    ];
  }, [filteredBookings]);

  const genderData = useMemo(() => {
    const c = { Male: 0, Female: 0, Other: 0 };
    patients.forEach((p) => {
      const g = p.gender || "Other";
      if (c[g] !== undefined) c[g]++; else c.Other++;
    });
    return [
      { name: "Male", value: c.Male, color: "#3b82f6" },
      { name: "Female", value: c.Female, color: "#ec4899" },
      { name: "Other", value: c.Other, color: "#a855f7" }
    ];
  }, [patients]);

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
    apptFromDate !== "" || apptToDate !== "" || selectedMonth !== "";

  const clearFilters = () => {
    setSearchQuery(""); setStatusFilter("All"); setDoctorFilter("All");
    setBookingTypeFilter("All"); setRevenueCategoryFilter("All");
    setPaymentTypeFilter("All"); setFromDate(""); setToDate("");
    setApptFromDate(""); setApptToDate(""); setSelectedMonth("");
  };

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
            <span>Revenue:</span><span>₹{d.revenue.toLocaleString()}</span>
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

  if (loading) {
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

        {/* ══════════ HEADER (Desktop) — EXACT OpManagement style ══════════ */}
        <div className="hidden lg:flex items-center justify-between gap-3 flex-wrap mb-4">
          <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap">
            OP <span>Dashboard</span>
          </h1>
        </div>

        {/* ══════════ FILTER BAR — EXACT OpManagement style (Desktop) ══════════ */}
        <div className="hidden lg:flex items-center gap-2 flex-wrap mb-6">
          {/* Search */}
          <div className="relative min-w-[130px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[200px] pl-8 pr-2 py-1.5 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Payment Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg"
          >
            <option value="All">All Payment</option>
            <option value="Pending">Pending</option>
            <option value="Partial">Partial</option>
            <option value="Paid">Paid</option>
            <option value="Due">Due</option>
          </select>

          {/* Booking Type */}
          <select
            value={bookingTypeFilter}
            onChange={(e) => setBookingTypeFilter(e.target.value)}
            className="h-8 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg"
          >
            {BOOKING_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          {/* Doctor */}
          <select
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
            className="h-8 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg max-w-[130px] truncate"
          >
            <option value="All">All Doctors</option>
            {getUniqueDoctors().map((d) => <option key={d} value={d}>{d}</option>)}
          </select>

          {/* Revenue Category */}
          <select
            value={revenueCategoryFilter}
            onChange={(e) => setRevenueCategoryFilter(e.target.value)}
            className="h-8 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg"
          >
            {REVENUE_CATEGORY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          {/* Payment Type */}
          <select
            value={paymentTypeFilter}
            onChange={(e) => setPaymentTypeFilter(e.target.value)}
            className="h-8 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg"
          >
            {PAYMENT_TYPE_FILTER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          {/* REG DATE */}
          <div className="flex items-center gap-1 px-2 h-8 border border-gray-300 bg-white rounded-lg">
            <span className="text-[9px] font-bold text-gray-500 uppercase whitespace-nowrap">REG:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => { setFromDate(e.target.value); if (e.target.value) setSelectedMonth(""); }}
              className="w-[105px] h-6 px-1 text-[11px] border-0 bg-transparent text-gray-900 rounded focus:outline-none"
            />
            <span className="text-gray-400 text-xs">–</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => { setToDate(e.target.value); if (e.target.value) setSelectedMonth(""); }}
              className="w-[105px] h-6 px-1 text-[11px] border-0 bg-transparent text-gray-900 rounded focus:outline-none"
            />
          </div>

          {/* APPT DATE */}
          <div className="flex items-center gap-1 px-2 h-8 border border-gray-300 bg-white rounded-lg">
            <span className="text-[9px] font-bold text-gray-500 uppercase whitespace-nowrap">APPT:</span>
            <input
              type="date"
              value={apptFromDate}
              onChange={(e) => { setApptFromDate(e.target.value); if (e.target.value) setSelectedMonth(""); }}
              className="w-[105px] h-6 px-1 text-[11px] border-0 bg-transparent text-gray-900 rounded focus:outline-none"
            />
            <span className="text-gray-400 text-xs">–</span>
            <input
              type="date"
              value={apptToDate}
              onChange={(e) => { setApptToDate(e.target.value); if (e.target.value) setSelectedMonth(""); }}
              className="w-[105px] h-6 px-1 text-[11px] border-0 bg-transparent text-gray-900 rounded focus:outline-none"
            />
          </div>

          {/* Month */}
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value);
              if (e.target.value) { setFromDate(""); setToDate(""); setApptFromDate(""); setApptToDate(""); }
            }}
            className="w-[120px] h-8 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg"
            title="Appointment month"
          />

          {/* Register New OP */}
          <button
            onClick={() => handleQuickAction("/op-management", { openAddPatient: true })}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm"
          >
            <UserPlus className="w-3 h-3" /> Register New OP
          </button>

          {/* Refresh */}
          <button
            onClick={fetchAllData}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
            title="Refresh"
          >
            <RefreshCw className="w-3 h-3" />
          </button>

          {/* Clear */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
            >
              <Trash2 className="w-3 h-3 text-red-500" /> Clear
            </button>
          )}
        </div>

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
            <button
              onClick={() => handleQuickAction("/op-management", { openAddPatient: true })}
              className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-white bg-blue-600 rounded-lg"
            >
              <UserPlus className="w-3 h-3" /> Add
            </button>
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg"
            >
              <Filter className="w-3 h-3" /> Filters
            </button>
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
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg"
                  />
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
                  <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); if (e.target.value) setSelectedMonth(""); }} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg" />
                  <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); if (e.target.value) setSelectedMonth(""); }} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Appointment Date</label>
                <div className="grid grid-cols-2 gap-2">
                  <input type="date" value={apptFromDate} onChange={(e) => { setApptFromDate(e.target.value); if (e.target.value) setSelectedMonth(""); }} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg" />
                  <input type="date" value={apptToDate} onChange={(e) => { setApptToDate(e.target.value); if (e.target.value) setSelectedMonth(""); }} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Month</label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => { setSelectedMonth(e.target.value); setFromDate(""); setToDate(""); setApptFromDate(""); setApptToDate(""); }}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg"
                />
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

        {/* ══════════ KPI ROW 1 ══════════ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Bookings</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate"><Calendar className="w-4 h-4 text-blue-600" /></div>
            </div>
            <div className="emp-dash__stat-value">{metrics.totalBookings}</div>
            <div className="emp-dash__stat-meta">{metrics.doctorsCount} doctors</div>
          </div>
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Revenue (Paid)</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present"><IndianRupee className="w-4 h-4 text-emerald-600" /></div>
            </div>
            <div className="emp-dash__stat-value text-emerald-600">₹{metrics.totalRevenue.toLocaleString()}</div>
            <div className="emp-dash__stat-meta">{metrics.collectionRate}% of ₹{metrics.totalExpectedRevenue.toLocaleString()}</div>
          </div>
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Pending Payments</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--late"><Clock className="w-4 h-4 text-amber-600" /></div>
            </div>
            <div className="emp-dash__stat-value text-amber-600">₹{metrics.pendingRevenue.toLocaleString()}</div>
            <div className="emp-dash__stat-meta">{metrics.bookingPendingCount + metrics.bookingPartialCount} pending</div>
          </div>
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Avg Fee / Booking</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate"><TrendingUp className="w-4 h-4 text-indigo-600" /></div>
            </div>
            <div className="emp-dash__stat-value text-indigo-600">₹{metrics.avgFee.toLocaleString()}</div>
            <div className="emp-dash__stat-meta">average total payable</div>
          </div>
        </div>

        {/* ══════════ KPI ROW 2 ══════════ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="emp-dash__stat border-amber-200 bg-amber-50/40">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label text-amber-700">Offers Applied</span>
              <div className="emp-dash__stat-icon bg-amber-100"><Gift className="w-4 h-4 text-amber-600" /></div>
            </div>
            <div className="emp-dash__stat-value text-amber-700">{metrics.bookingsWithOfferCount}</div>
            <div className="emp-dash__stat-meta text-amber-600">− ₹{metrics.totalOfferDeduction.toLocaleString()}</div>
          </div>
          <div className="emp-dash__stat border-emerald-200 bg-emerald-50/40">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label text-emerald-700">Reviews Done</span>
              <div className="emp-dash__stat-icon bg-emerald-100"><Star className="w-4 h-4 text-emerald-600" /></div>
            </div>
            <div className="emp-dash__stat-value text-emerald-700">{metrics.reviewedBookingsCount}</div>
            <div className="emp-dash__stat-meta text-emerald-600">{metrics.totalReviewServices} services</div>
          </div>
          <div className="emp-dash__stat border-purple-200 bg-purple-50/40">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label text-purple-700">Insurance Paid</span>
              <div className="emp-dash__stat-icon bg-purple-100"><ShieldCheck className="w-4 h-4 text-purple-600" /></div>
            </div>
            <div className="emp-dash__stat-value text-purple-700">₹{metrics.insuranceRevenue.toLocaleString()}</div>
            <div className="emp-dash__stat-meta text-purple-600">{metrics.insuranceCount} bookings</div>
          </div>
          <div className="emp-dash__stat border-cyan-200 bg-cyan-50/40">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label text-cyan-700">Card Paid</span>
              <div className="emp-dash__stat-icon bg-cyan-100"><Wallet className="w-4 h-4 text-cyan-600" /></div>
            </div>
            <div className="emp-dash__stat-value text-cyan-700">₹{metrics.cardRevenue.toLocaleString()}</div>
            <div className="emp-dash__stat-meta text-cyan-600">{metrics.cardCount} bookings</div>
          </div>
        </div>

        {/* ══════════ REVENUE BREAKDOWN ══════════ */}
        <div className="mb-6 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Revenue Breakdown</h3>
              <span className="text-[10px] text-gray-500">(based on filters · Paid only)</span>
            </div>
            <span className="text-[10px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-full border border-indigo-200">
              {filteredBookings.length} bookings
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 p-3">
            <div className="rounded-lg p-2.5 border border-blue-200 bg-blue-50">
              <div className="flex items-center gap-1 text-[9px] font-bold text-blue-700 uppercase"><Stethoscope className="w-3 h-3" /> Clinic</div>
              <div className="text-sm font-extrabold text-blue-800 mt-0.5">₹{Math.round(metrics.totalClinic).toLocaleString()}</div>
            </div>
            <div className="rounded-lg p-2.5 border border-purple-200 bg-purple-50">
              <div className="flex items-center gap-1 text-[9px] font-bold text-purple-700 uppercase"><FlaskConical className="w-3 h-3" /> Lab</div>
              <div className="text-sm font-extrabold text-purple-800 mt-0.5">₹{Math.round(metrics.totalLab).toLocaleString()}</div>
            </div>
            <div className="rounded-lg p-2.5 border border-green-200 bg-green-50">
              <div className="flex items-center gap-1 text-[9px] font-bold text-green-700 uppercase"><Pill className="w-3 h-3" /> Pharmacy</div>
              <div className="text-sm font-extrabold text-green-800 mt-0.5">₹{Math.round(metrics.totalPharmacy).toLocaleString()}</div>
            </div>
            <div className="rounded-lg p-2.5 border border-emerald-200 bg-emerald-50">
              <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-700 uppercase"><Banknote className="w-3 h-3" /> Cash</div>
              <div className="text-sm font-extrabold text-emerald-800 mt-0.5">₹{Math.round(metrics.cashRevenue).toLocaleString()}</div>
            </div>
            <div className="rounded-lg p-2.5 border border-cyan-200 bg-cyan-50">
              <div className="flex items-center gap-1 text-[9px] font-bold text-cyan-700 uppercase"><CreditCard className="w-3 h-3" /> Online</div>
              <div className="text-sm font-extrabold text-cyan-800 mt-0.5">₹{Math.round(metrics.onlineRevenue).toLocaleString()}</div>
            </div>
            <div className="rounded-lg p-2.5 border border-slate-300 bg-slate-50">
              <div className="flex items-center gap-1 text-[9px] font-bold text-slate-700 uppercase"><IndianRupee className="w-3 h-3" /> Total</div>
              <div className="text-sm font-extrabold text-slate-900 mt-0.5">₹{Math.round(metrics.totalRevenue).toLocaleString()}</div>
              <div className="text-[9px] font-semibold text-red-600 mt-0.5">Due: ₹{Math.round(metrics.pendingRevenue).toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* ══════════ CHARTS ROW 1 ══════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 emp-dash__card p-4 md:p-5">
            <div className="mb-4">
              <h3 className="font-bold text-gray-800 text-sm md:text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" /> Bookings &amp; Revenue Trend
              </h3>
              <p className="text-xs text-gray-500">Daily booking volume and paid revenue</p>
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
                    <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue (Paid)" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
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
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={60} />
                  <Tooltip />
                  <Bar dataKey="value" name="Bookings" radius={[0, 6, 6, 0]}>
                    {paymentStatusData.map((e, i) => <Cell key={`s-${i}`} fill={e.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-around pt-2 text-xs border-t border-gray-100 mt-2">
              <div className="text-center"><span className="text-emerald-600 font-bold block text-sm">{metrics.bookingPaidCount}</span><span className="text-gray-500 text-[11px]">Paid</span></div>
              <div className="text-center"><span className="text-amber-600 font-bold block text-sm">{metrics.bookingPartialCount}</span><span className="text-gray-500 text-[11px]">Partial</span></div>
              <div className="text-center"><span className="text-red-600 font-bold block text-sm">{metrics.bookingPendingCount}</span><span className="text-gray-500 text-[11px]">Pending</span></div>
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
                  <XAxis type="number" tick={{ fontSize: 11 }} />
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
              <p className="text-xs text-gray-500">Day-by-day booking volume and paid revenue</p>
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
              <span className="text-[10px] text-emerald-700 font-bold uppercase block">Revenue (Paid)</span>
              <span className="font-extrabold text-emerald-900 text-sm">₹{monthlyDailyTrend.totalMonthRevenue.toLocaleString()}</span>
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