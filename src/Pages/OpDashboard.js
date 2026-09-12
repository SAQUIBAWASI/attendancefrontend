import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import {
  Users,
  IndianRupee,
  CheckCircle2,
  Clock,
  TrendingUp,
  CreditCard,
  Banknote,
  Calendar,
  RefreshCw,
  ArrowRight,
  PieChart as PieIcon,
  BarChart2,
  Activity,
  User,
  Phone,
  FileText,
  Sliders,
  UserPlus,
  CalendarDays,
  Stethoscope,
  BookOpen,
  CalendarRange,
  X
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart
} from "recharts";
import "./EmployeeDashboard.css";
import "./Dashboard.css";

const COLORS = {
  primary: "#2563eb",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  purple: "#8b5cf6",
  indigo: "#6366f1",
  pink: "#ec4899",
  cyan: "#06b6d4"
};

const OpDashboard = () => {
  const navigate = useNavigate();
  
  // ===== ALL DATA STATES =====
  const [patients, setPatients] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState("all");
  
  // ===== DATE RANGE FILTERS =====
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [selectedTrendMonth, setSelectedTrendMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const [trendChartType, setTrendChartType] = useState("composed");

  // ===== FETCH ALL DATA =====
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchPatientsData(),
        fetchBookingsData(),
        fetchDoctorsData(),
        fetchSlotsData(),
        fetchServicesData()
      ]);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // ===== INDIVIDUAL API CALLS =====
  const fetchPatientsData = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/patients`);
      if (res.data && res.data.success) {
        setPatients(res.data.data || []);
      } else if (Array.isArray(res.data)) {
        setPatients(res.data);
      } else {
        setPatients([]);
      }
    } catch (err) {
      console.error("Error fetching patients:", err);
      setPatients([]);
    }
  };

  // ===== ✅ BOOKINGS MAPPING =====
  const fetchBookingsData = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/appointment-slots/getallbookings`);
      if (res.data && res.data.success) {
        const bookingsData = res.data.bookings || res.data.data || [];
        const transformed = bookingsData.map((b) => {
          const slotDetails = b.slotDetails || {};

          const services = Array.isArray(b.services) ? b.services : [];
          const servicesTotal = services.reduce(
            (sum, s) => sum + (Number(s.price) || 0),
            0
          );

          const medicineTotal = Number(b.medicineTotal) || 0;
          const labTotal = Number(b.labTotal) || 0;

          const finalPayable =
            Number(b.finalPayable) ||
            Number(b.finalPayableAmount) ||
            Number(b.grandTotal) ||
            Number(b.totalAmount) ||
            (servicesTotal + medicineTotal + labTotal - (Number(b.discount) || 0));

          const amountPaid = Number(b.amountPaid) || 0;
          const balanceAmount =
            Number(b.balanceAmount) ||
            Math.max(0, finalPayable - amountPaid);

          return {
            _id: b._id || b.id,
            patientName: b.patientName || "",
            patientAge: b.patientAge || "",
            patientGender: b.patientGender || "Male",
            patientPhone: b.patientPhone || "",
            patientAddress: b.patientAddress || "",
            patientTitle: b.patientTitle || "",
            date: slotDetails.date || b.appointmentDate || b.date || "",
            startTime: slotDetails.startTime || b.startTime || "",
            endTime: slotDetails.endTime || b.endTime || "",
            doctorName: slotDetails.doctorName || b.doctorName || "",
            doctorSpecialization:
              slotDetails.doctorSpecialization || b.doctorSpecialization || "",
            purpose: b.purpose || "",
            consultationFee: Number(b.consultationFee) || 300,
            paymentStatus: b.paymentStatus || "Pending",
            paymentType: b.paymentType || "cash",
            status: b.status || "confirmed",
            services: services,
            servicesTotal: servicesTotal,
            clinicAmount: servicesTotal,
            pharmacyAmount: medicineTotal,
            labAmount: labTotal,
            medicineTotal: medicineTotal,
            labTotal: labTotal,
            subtotal: Number(b.subtotal) || servicesTotal,
            discount: Number(b.discount) || 0,
            tax: Number(b.tax) || 0,
            commissionAmount: Number(b.commissionAmount) || 0,
            finalPayable: finalPayable,
            totalAmount: finalPayable,
            grandTotal: finalPayable,
            amountPaid: amountPaid,
            balanceAmount: balanceAmount,
            partialAmount: Number(b.partialAmount) || 0,
            referredBy: b.referredBy || "",
            referredByDoctor: b.referredByDoctor || "",
            referredByCustomer: b.referredByCustomer || "",
            referralContactId: b.referralContactId || "",
            referralDoctorId: b.referralDoctorId || "",
            referralCustomerId: b.referralCustomerId || "",
            doctorPaymentStatus: b.doctorPaymentStatus || "Pending",
            customerPaymentStatus: b.customerPaymentStatus || "Pending",
            partnerPaymentStatus: b.partnerPaymentStatus || "Due",
            doctorPaymentUpdatedAt: b.doctorPaymentUpdatedAt || null,
            createdAt: b.createdAt || b.bookedAt || new Date().toISOString(),
            bookedAt: b.bookedAt || b.createdAt || new Date().toISOString(),
            isOP: b.isOP === true,
            isCompleted: b.isCompleted === true,
            isCancelled: b.isCancelled === true
          };
        });
        setBookings(transformed);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setBookings([]);
    }
  };

  const fetchDoctorsData = async () => {
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
    }
  };

  const fetchSlotsData = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/appointment-slots`);
      if (res.data && res.data.success) {
        setSlots(res.data.slots || []);
      } else {
        setSlots([]);
      }
    } catch (err) {
      console.error("Error fetching slots:", err);
      setSlots([]);
    }
  };

  const fetchServicesData = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/services/allservices`);
      if (res.data && res.data.success) {
        setServices(res.data.services || []);
      } else {
        setServices([]);
      }
    } catch (err) {
      console.error("Error fetching services:", err);
      setServices([]);
    }
  };

  // ===== ✅ HELPER: Only "Paid" bookings count for revenue =====
  const isPaidBooking = (booking) => {
    if (!booking) return false;
    return (
      booking.paymentStatus === "Paid" ||
      booking.paymentStatus === "paid"
    );
  };

  // ===== HELPER: Total payable for a booking =====
  const getTotalBookingFee = (booking) => {
    if (!booking) return 0;
    return (
      Number(booking.finalPayable) ||
      Number(booking.grandTotal) ||
      Number(booking.totalAmount) ||
      (Number(booking.servicesTotal) || 0) +
        (Number(booking.medicineTotal) || 0) +
        (Number(booking.labTotal) || 0) -
        (Number(booking.discount) || 0)
    );
  };

  // ✅ Revenue = ONLY "Paid" bookings (full finalPayable)
  const getRevenueForBooking = (booking) => {
    if (!booking) return 0;
    if (isPaidBooking(booking)) return getTotalBookingFee(booking);
    return 0;
  };

  // ✅ Category amounts ONLY for "Paid" bookings
  const getCategoryAmounts = (booking) => {
    if (!booking) return { clinic: 0, pharmacy: 0, lab: 0 };
    if (!isPaidBooking(booking)) return { clinic: 0, pharmacy: 0, lab: 0 };
    return {
      clinic: Number(booking.clinicAmount) || Number(booking.servicesTotal) || 0,
      pharmacy: Number(booking.pharmacyAmount) || Number(booking.medicineTotal) || 0,
      lab: Number(booking.labAmount) || Number(booking.labTotal) || 0
    };
  };

  // ===== CHECK IF DATE IS IN RANGE =====
  const isDateInRange = (dateStr) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return false;
    
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      return date >= from && date <= to;
    }
    if (fromDate && !toDate) {
      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);
      return date >= from;
    }
    if (!fromDate && toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      return date <= to;
    }
    return true;
  };

  // ===== FILTERED PATIENTS =====
  const filteredPatients = useMemo(() => {
    const patientsWithBookings = patients.map((p) => {
      const patientBookings = bookings.filter(
        (b) =>
          (b.patientPhone === p.phone ||
            (b.patientName &&
              p.name &&
              b.patientName.toLowerCase() === p.name.toLowerCase())) &&
          isDateInRange(b.createdAt)
      );

      const totalFee = patientBookings.reduce(
        (sum, b) => sum + getTotalBookingFee(b),
        0
      );

      // ✅ Only "Paid" bookings count
      const totalPaid = patientBookings.reduce(
        (sum, b) => sum + getRevenueForBooking(b),
        0
      );

      const isPaid =
        patientBookings.length > 0 &&
        patientBookings.some((b) => isPaidBooking(b));

      const bookingStatus =
        patientBookings.length > 0 ? patientBookings[0].status : "No Booking";
      const doctorName =
        patientBookings.length > 0 ? patientBookings[0].doctorName : "N/A";
      const appointmentDate =
        patientBookings.length > 0 ? patientBookings[0].date : null;

      return {
        ...p,
        totalFee: totalFee || p.feeAmount || 0,
        totalPaid: totalPaid,
        isPaid: isPaid || p.paymentStatus === "Paid" || p.paymentStatus === "paid",
        bookingStatus,
        doctorName,
        appointmentDate,
        bookingCount: patientBookings.length,
        patientBookings
      };
    });

    if (timeFilter === "all") return patientsWithBookings;
    const now = new Date();
    
    return patientsWithBookings.filter((p) => {
      if (!p.createdAt) return false;
      const created = new Date(p.createdAt);

      if (timeFilter === "today") {
        return (
          created.getDate() === now.getDate() &&
          created.getMonth() === now.getMonth() &&
          created.getFullYear() === now.getFullYear()
        );
      }
      if (timeFilter === "7days") {
        const diffDays = (now - created) / (1000 * 60 * 60 * 24);
        return diffDays <= 7;
      }
      if (timeFilter === "month") {
        return (
          created.getMonth() === now.getMonth() &&
          created.getFullYear() === now.getFullYear()
        );
      }
      return true;
    });
  }, [patients, bookings, timeFilter, fromDate, toDate]);

  // ===== FILTERED BOOKINGS =====
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => isDateInRange(b.createdAt));
  }, [bookings, fromDate, toDate]);

  // ===== ✅ METRICS — Revenue = Only "Paid" bookings =====
  const metrics = useMemo(() => {
    const total = filteredPatients.length;

    // ✅ Revenue = SUM of finalPayable ONLY for "Paid" bookings
    const totalRevenue = filteredBookings.reduce(
      (sum, b) => sum + getRevenueForBooking(b),
      0
    );

    // ✅ Expected = SUM of finalPayable for ALL bookings
    const totalExpectedRevenue = filteredBookings.reduce(
      (sum, b) => sum + getTotalBookingFee(b),
      0
    );

    // ✅ Pending = Expected - Collected (only Paid counted)
    const pendingRevenue = Math.max(0, totalExpectedRevenue - totalRevenue);

    const avgFee =
      filteredBookings.length > 0
        ? Math.round(totalExpectedRevenue / filteredBookings.length)
        : 0;

    const collectionRate =
      totalExpectedRevenue > 0
        ? Math.round((totalRevenue / totalExpectedRevenue) * 100)
        : 0;

    const confirmedCount = filteredBookings.filter(
      (b) => b.status === "confirmed" || b.status === "booked"
    ).length;
    const completedCount = filteredBookings.filter(
      (b) => b.status === "completed"
    ).length;
    const consultingCount = filteredBookings.filter(
      (b) => b.status === "consulting"
    ).length;
    const cancelledCount = filteredBookings.filter(
      (b) => b.status === "cancelled"
    ).length;
    const pendingBookingCount = filteredBookings.filter(
      (b) => b.status === "pending"
    ).length;

    const bookingPaidCount = filteredBookings.filter(isPaidBooking).length;
    const bookingPartialCount = filteredBookings.filter(
      (b) => b.paymentStatus === "Partial" || b.paymentStatus === "partial"
    ).length;
    const bookingPendingCount = filteredBookings.filter(
      (b) =>
        b.paymentStatus === "Pending" ||
        b.paymentStatus === "pending" ||
        b.paymentStatus === "Due"
    ).length;

    const totalBookings = filteredBookings.length;

    const cashCount = filteredBookings.filter(
      (b) => b.paymentType === "cash" || !b.paymentType
    ).length;
    const onlineCount = filteredBookings.filter(
      (b) => b.paymentType === "online"
    ).length;

    // ✅ Category totals ONLY for "Paid" bookings
    let totalClinic = 0;
    let totalPharmacy = 0;
    let totalLab = 0;
    filteredBookings.forEach((b) => {
      const cats = getCategoryAmounts(b);
      totalClinic += cats.clinic;
      totalPharmacy += cats.pharmacy;
      totalLab += cats.lab;
    });

    return {
      total,
      paidCount: filteredPatients.filter((p) => p.isPaid).length,
      pendingCount: filteredPatients.filter((p) => !p.isPaid).length,
      totalRevenue,
      pendingRevenue,
      totalExpectedRevenue,
      avgFee,
      collectionRate,
      totalBookings,
      confirmedCount,
      completedCount,
      consultingCount,
      cancelledCount,
      pendingBookingCount,
      bookingPaidCount,
      bookingPartialCount,
      bookingPendingCount,
      cashCount,
      onlineCount,
      doctorsCount: doctors.length,
      slotsCount: slots.length,
      servicesCount: services.length,
      totalClinic,
      totalPharmacy,
      totalLab
    };
  }, [filteredPatients, filteredBookings, doctors, services]);

  // ===== TREND DATA — Only "Paid" revenue =====
  const trendData = useMemo(() => {
    if (!filteredBookings.length) return [];
    
    const map = {};
    filteredBookings.forEach((b) => {
      const dateKey = b.createdAt
        ? new Date(b.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short"
          })
        : "Unknown";

      if (!map[dateKey]) {
        map[dateKey] = {
          date: dateKey,
          patients: 0,
          revenue: 0,
          bookings: 0,
          rawDate: new Date(b.createdAt)
        };
      }
      map[dateKey].patients += 1;
      map[dateKey].bookings += 1;
      // ✅ Only count revenue for "Paid" bookings
      map[dateKey].revenue += getRevenueForBooking(b);
    });

    return Object.values(map).sort((a, b) => a.rawDate - b.rawDate);
  }, [filteredBookings]);

  // ===== MONTHLY DAILY TREND — Only "Paid" revenue =====
  const monthlyDailyTrend = useMemo(() => {
    if (!selectedTrendMonth)
      return {
        daysData: [],
        monthLabel: "",
        totalMonthPatients: 0,
        totalMonthRevenue: 0,
        peakDay: "-"
      };

    const [yearStr, monthStr] = selectedTrendMonth.split("-");
    const year = parseInt(yearStr, 10);
    const monthIdx = parseInt(monthStr, 10) - 1;

    const dateObj = new Date(year, monthIdx, 1);
    const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
    const monthLabel = dateObj.toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric"
    });

    const dayMap = {};
    for (let day = 1; day <= daysInMonth; day++) {
      const formattedDay = String(day).padStart(2, "0");
      dayMap[day] = {
        day: formattedDay,
        dateLabel: `${formattedDay} ${dateObj.toLocaleDateString("en-IN", {
          month: "short"
        })}`,
        patients: 0,
        paidPatients: 0,
        pendingPatients: 0,
        revenue: 0,
        bookings: 0
      };
    }

    filteredBookings.forEach((b) => {
      if (!b.createdAt) return;
      const pDate = new Date(b.createdAt);
      if (pDate.getFullYear() === year && pDate.getMonth() === monthIdx) {
        const day = pDate.getDate();
        if (dayMap[day]) {
          dayMap[day].patients += 1;
          dayMap[day].bookings += 1;
          // ✅ Revenue only for Paid bookings
          if (isPaidBooking(b)) {
            dayMap[day].revenue += getTotalBookingFee(b);
            dayMap[day].paidPatients += 1;
          } else {
            dayMap[day].pendingPatients += 1;
          }
        }
      }
    });

    const daysData = Object.values(dayMap);
    const totalMonthPatients = daysData.reduce((sum, d) => sum + d.patients, 0);
    const totalMonthRevenue = daysData.reduce((sum, d) => sum + d.revenue, 0);

    let maxVal = -1;
    let peakDay = "-";
    daysData.forEach((d) => {
      if (d.patients > maxVal && d.patients > 0) {
        maxVal = d.patients;
        peakDay = `${d.dateLabel} (${d.patients} bookings)`;
      }
    });

    return {
      daysData,
      monthLabel,
      totalMonthPatients,
      totalMonthRevenue,
      peakDay
    };
  }, [filteredBookings, selectedTrendMonth]);

  // ===== CHART DATA =====
  const paymentStatusData = useMemo(() => {
    const paid = filteredBookings.filter(isPaidBooking).length;
    const partial = filteredBookings.filter(
      (b) => b.paymentStatus === "Partial" || b.paymentStatus === "partial"
    ).length;
    const pending = filteredBookings.filter(
      (b) =>
        b.paymentStatus === "Pending" ||
        b.paymentStatus === "pending" ||
        b.paymentStatus === "Due"
    ).length;
    return [
      { name: "Paid", value: paid || 0, color: COLORS.success },
      { name: "Partial", value: partial || 0, color: COLORS.warning },
      { name: "Pending", value: pending || 0, color: COLORS.danger }
    ];
  }, [filteredBookings]);

  const paymentMethodData = useMemo(() => {
    // ✅ Only "Paid" bookings
    const paidBookings = filteredBookings.filter(isPaidBooking);
    const cash = paidBookings.filter(
      (b) => b.paymentType === "cash" || !b.paymentType
    ).length;
    const online = paidBookings.filter(
      (b) => b.paymentType === "online"
    ).length;
    return [
      { name: "Cash", value: cash || 0, color: COLORS.success },
      { name: "Online", value: online || 0, color: COLORS.indigo }
    ];
  }, [filteredBookings]);

  const genderData = useMemo(() => {
    const counts = { Male: 0, Female: 0, Other: 0 };
    patients.forEach((p) => {
      const g = p.gender || "Other";
      if (counts[g] !== undefined) counts[g]++;
      else counts.Other++;
    });

    const total = counts.Male + counts.Female + counts.Other;
    if (total === 0) {
      return [
        { name: "Male", value: 0, color: "#3b82f6" },
        { name: "Female", value: 0, color: "#ec4899" },
        { name: "Other", value: 0, color: "#a855f7" }
      ];
    }

    return [
      { name: "Male", value: counts.Male, color: "#3b82f6" },
      { name: "Female", value: counts.Female, color: "#ec4899" },
      { name: "Other", value: counts.Other, color: "#a855f7" }
    ];
  }, [patients]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const clearDateRange = () => {
    setFromDate("");
    setToDate("");
  };

  // ===== TOOLTIP =====
  const DailyTrendTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-xl shadow-xl border border-gray-200 text-xs space-y-1 z-50">
          <div className="font-bold text-gray-900 border-b border-gray-100 pb-1 mb-1">
            📅 {data.dateLabel}
          </div>
          <div className="flex justify-between gap-4 text-blue-700 font-semibold">
            <span>Total Bookings:</span>
            <span>{data.patients}</span>
          </div>
          <div className="flex justify-between gap-4 text-emerald-600 font-medium">
            <span>Paid:</span>
            <span>{data.paidPatients}</span>
          </div>
          <div className="flex justify-between gap-4 text-amber-600 font-medium">
            <span>Pending:</span>
            <span>{data.pendingPatients}</span>
          </div>
          <div className="flex justify-between gap-4 text-purple-700 font-bold pt-1 border-t border-gray-100">
            <span>Revenue (Paid):</span>
            <span>₹{data.revenue.toLocaleString()}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // ===== RENDER TREND GRAPH =====
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
        <XAxis
          dataKey="day"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#64748b", fontSize: 10, fontWeight: "600" }}
        />
        <YAxis
          yAxisId="left"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#2563eb", fontSize: 10, fontWeight: "700" }}
          allowDecimals={false}
          domain={[0, "auto"]}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#10b981", fontSize: 10, fontWeight: "700" }}
          allowDecimals={false}
          domain={[0, "auto"]}
        />
        <Tooltip content={<DailyTrendTooltip />} />

        {trendChartType === "area" && (
          <>
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="patients"
              name="Bookings"
              stroke="#2563eb"
              strokeWidth={2.5}
              fill="url(#opTrendGradient)"
              dot={{ fill: "#2563eb", stroke: "#fff", strokeWidth: 1.5, r: 3.5 }}
              activeDot={{ r: 6, fill: "#2563eb", stroke: "#fff", strokeWidth: 2 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="revenue"
              name="Revenue (Paid)"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={{ fill: "#10b981", stroke: "#fff", strokeWidth: 1.5, r: 3.5 }}
              activeDot={{ r: 6, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }}
            />
          </>
        )}

        {trendChartType === "bar" && (
          <>
            <Bar yAxisId="left" dataKey="patients" name="Bookings" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={16} />
            <Bar yAxisId="right" dataKey="revenue" name="Revenue (Paid)" fill="#10b981" radius={[4, 4, 0, 0]} barSize={16} />
          </>
        )}

        {trendChartType === "line" && (
          <>
            <Line yAxisId="left" type="monotone" dataKey="patients" name="Bookings" stroke="#2563eb" strokeWidth={3} dot={{ fill: "#2563eb", stroke: "#fff", strokeWidth: 1.5, r: 4 }} activeDot={{ r: 6, fill: "#2563eb", stroke: "#fff", strokeWidth: 2 }} />
            <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue (Paid)" stroke="#10b981" strokeWidth={3} dot={{ fill: "#10b981", stroke: "#fff", strokeWidth: 1.5, r: 4 }} activeDot={{ r: 6, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }} />
          </>
        )}

        {trendChartType === "composed" && (
          <>
            <Bar yAxisId="left" dataKey="patients" name="Bookings" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
            <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue (Paid)" stroke="#10b981" strokeWidth={3} dot={{ fill: "#10b981", stroke: "#fff", strokeWidth: 1.5, r: 4 }} activeDot={{ r: 6, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }} />
          </>
        )}
      </ComposedChart>
    );
  };

  // ===== QUICK ACTION - ROLE BASED =====
  const handleQuickAction = (path) => {
    const userRole = localStorage.getItem("userRole");
    
    if (userRole === "admin") {
      navigate(path);
      return;
    }
    
    if (userRole === "employee") {
      const cleanPath = path.startsWith("/") ? path.substring(1) : path;
      navigate(`/employee/${cleanPath}`);
      return;
    }
    
    navigate(path);
  };

  // ===== LOADING =====
  if (loading) {
    return (
      <div className="emp-dash">
        <div className="emp-dash__loading">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mb-3" />
          <p className="emp-dash__loading-text">Loading OP Dashboard Analytics...</p>
        </div>
      </div>
    );
  }

  // ===== RENDER =====
  return (
    <div className="emp-dash">
      <main className="p-2 sm:p-4 lg:p-6">
        {/* Header */}
        <div className="emp-dash__header flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-baseline gap-3 flex-wrap">
              <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap">
                OP <span>Dashboard</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Time Filter Buttons */}
            <div className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-lg p-1 shadow-sm">
              <button
                onClick={() => { setTimeFilter("all"); clearDateRange(); }}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  timeFilter === "all" && !fromDate && !toDate
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                All Time
              </button>
              <button
                onClick={() => { setTimeFilter("month"); clearDateRange(); }}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  timeFilter === "month"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                This Month
              </button>
              <button
                onClick={() => { setTimeFilter("7days"); clearDateRange(); }}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  timeFilter === "7days"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Last 7 Days
              </button>
              <button
                onClick={() => { setTimeFilter("today"); clearDateRange(); }}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  timeFilter === "today"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Today
              </button>
            </div>

            {/* Date Range Picker */}
            <div className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-lg px-2 py-1 shadow-sm">
              <CalendarRange className="w-3.5 h-3.5 text-gray-400" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => { setFromDate(e.target.value); setTimeFilter("all"); }}
                className="w-[110px] text-xs border-none focus:outline-none focus:ring-0 bg-transparent text-gray-700 font-medium"
                placeholder="From"
              />
              <span className="text-gray-300 text-xs">-</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); setTimeFilter("all"); }}
                className="w-[110px] text-xs border-none focus:outline-none focus:ring-0 bg-transparent text-gray-700 font-medium"
                placeholder="To"
              />
              {(fromDate || toDate) && (
                <button
                  onClick={clearDateRange}
                  className="text-gray-400 hover:text-red-500 transition-colors p-0.5"
                  title="Clear Date Range"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Register New OP */}
            <button
              onClick={() => handleQuickAction("/op-management")}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all shadow-sm"
              title="Register a new OP patient"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register New OP</span>
            </button>

            <button
              onClick={fetchAllData}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
              title="Refresh Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* QUICK ACTION BUTTONS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <button
            onClick={() => handleQuickAction("/doctor-management")}
            className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <Stethoscope className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quick Action</div>
              <div className="text-sm font-bold text-gray-800">Doctors</div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </button>

          <button
            onClick={() => handleQuickAction("/appointment-slots")}
            className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-purple-300 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
              <CalendarDays className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quick Action</div>
              <div className="text-sm font-bold text-gray-800">Slots</div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
          </button>

          <button
            onClick={() => handleQuickAction("/op-management")}
            className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-emerald-300 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
              <UserPlus className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quick Action</div>
              <div className="text-sm font-bold text-gray-800">OP</div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
          </button>

          <button
            onClick={() => handleQuickAction("/bookings")}
            className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-amber-300 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
              <BookOpen className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quick Action</div>
              <div className="text-sm font-bold text-gray-800">Bookings</div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
          </button>
        </div>

        {/* KPI STATS CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Bookings</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div className="emp-dash__stat-value">{metrics.totalBookings}</div>
            <div className="emp-dash__stat-meta">{metrics.doctorsCount} doctors</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Revenue (Paid)</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <IndianRupee className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <div className="emp-dash__stat-value text-emerald-600">
              ₹{metrics.totalRevenue.toLocaleString()}
            </div>
            <div className="emp-dash__stat-meta">
              {metrics.collectionRate}% of ₹{metrics.totalExpectedRevenue.toLocaleString()}
            </div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Pending Payments</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
            </div>
            <div className="emp-dash__stat-value text-amber-600">
              ₹{metrics.pendingRevenue.toLocaleString()}
            </div>
            <div className="emp-dash__stat-meta">
              {metrics.bookingPendingCount + metrics.bookingPartialCount} bookings pending
            </div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Avg Fee / Booking</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
              </div>
            </div>
            <div className="emp-dash__stat-value text-indigo-600">
              ₹{metrics.avgFee.toLocaleString()}
            </div>
            <div className="emp-dash__stat-meta">average total payable</div>
          </div>
        </div>

        {/* Category Breakdown Row — Only "Paid" bookings */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="emp-dash__stat border-blue-200 bg-blue-50/40">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label text-blue-700">Clinic / Consultation</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate bg-blue-100">
                <Stethoscope className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div className="emp-dash__stat-value text-blue-700">
              ₹{metrics.totalClinic.toLocaleString()}
            </div>
            <div className="emp-dash__stat-meta text-blue-600">paid consultation</div>
          </div>

          <div className="emp-dash__stat border-green-200 bg-green-50/40">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label text-green-700">Pharmacy / Medicines</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present bg-green-100">
                <CreditCard className="w-4 h-4 text-green-600" />
              </div>
            </div>
            <div className="emp-dash__stat-value text-green-700">
              ₹{metrics.totalPharmacy.toLocaleString()}
            </div>
            <div className="emp-dash__stat-meta text-green-600">paid medicines</div>
          </div>

          <div className="emp-dash__stat border-purple-200 bg-purple-50/40">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label text-purple-700">Lab Tests</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--late bg-purple-100">
                <FileText className="w-4 h-4 text-purple-600" />
              </div>
            </div>
            <div className="emp-dash__stat-value text-purple-700">
              ₹{metrics.totalLab.toLocaleString()}
            </div>
            <div className="emp-dash__stat-meta text-purple-600">paid lab tests</div>
          </div>
        </div>

        {/* DATE RANGE INFO BADGE */}
        {(fromDate || toDate) && (
          <div className="flex items-center gap-2 mb-4 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
            <CalendarRange className="w-4 h-4 text-blue-500" />
            <span className="font-semibold">Date Range:</span>
            <span>{fromDate ? formatDate(fromDate) : "Start"}</span>
            <span className="text-blue-300">→</span>
            <span>{toDate ? formatDate(toDate) : "End"}</span>
            <button
              onClick={clearDateRange}
              className="ml-2 text-blue-500 hover:text-red-500 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Charts Row 1: Booking & Revenue Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 emp-dash__card p-4 md:p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-800 text-sm md:text-base flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" /> Bookings &amp; Revenue Trend
                </h3>
                <p className="text-xs text-gray-500">Daily booking volume and paid revenue</p>
              </div>
            </div>

            {trendData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-400 text-xs">
                No trend data available for selected period
              </div>
            ) : (
              <div style={{ width: "100%", height: 260, minHeight: 260, position: "relative" }}>
                <ResponsiveContainer width="100%" height={260}>
                  <ComposedChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#64748b" }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#10b981" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        fontSize: "12px"
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                    <Bar yAxisId="left" dataKey="bookings" name="Bookings" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={24} />
                    <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue (Paid)" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Booking Status Distribution */}
          <div className="emp-dash__card p-4 md:p-5 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-gray-800 text-sm md:text-base flex items-center gap-2 mb-1">
                <PieIcon className="w-4 h-4 text-purple-600" /> Booking Status
              </h3>
              <p className="text-xs text-gray-500 mb-4">Appointment status distribution</p>

              <div style={{ width: "100%", height: 200, minHeight: 200, position: "relative" }}>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Confirmed", value: metrics.confirmedCount || 0, color: "#3b82f6" },
                        { name: "Completed", value: metrics.completedCount || 0, color: "#10b981" },
                        { name: "Consulting", value: metrics.consultingCount || 0, color: "#8b5cf6" },
                        { name: "Cancelled", value: metrics.cancelledCount || 0, color: "#ef4444" },
                        { name: "Pending", value: metrics.pendingBookingCount || 0, color: "#f59e0b" }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {[
                        { name: "Confirmed", color: "#3b82f6" },
                        { name: "Completed", color: "#10b981" },
                        { name: "Consulting", color: "#8b5cf6" },
                        { name: "Cancelled", color: "#ef4444" },
                        { name: "Pending", color: "#f59e0b" }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 2: Payment Status, Mode & Gender */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Payment Status Chart */}
          <div className="emp-dash__card p-4 md:p-5">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Payment Status
            </h3>
            <p className="text-xs text-gray-500 mb-3">Paid vs Pending breakdown</p>

            <div style={{ width: "100%", height: 180, minHeight: 180, position: "relative" }}>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={paymentStatusData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={60} />
                  <Tooltip />
                  <Bar dataKey="value" name="Bookings" radius={[0, 6, 6, 0]}>
                    {paymentStatusData.map((entry, index) => (
                      <Cell key={`status-cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-around items-center pt-2 text-xs border-t border-gray-100 mt-2">
              <div className="text-center">
                <span className="text-emerald-600 font-bold block text-sm">{metrics.bookingPaidCount}</span>
                <span className="text-gray-500 text-[11px]">Paid</span>
              </div>
              <div className="text-center">
                <span className="text-amber-600 font-bold block text-sm">{metrics.bookingPartialCount}</span>
                <span className="text-gray-500 text-[11px]">Partial</span>
              </div>
              <div className="text-center">
                <span className="text-red-600 font-bold block text-sm">{metrics.bookingPendingCount}</span>
                <span className="text-gray-500 text-[11px]">Pending</span>
              </div>
            </div>
          </div>

          {/* Payment Mode Chart — Paid only */}
          <div className="emp-dash__card p-4 md:p-5">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 mb-1">
              <CreditCard className="w-4 h-4 text-indigo-600" /> Payment Mode (Paid)
            </h3>
            <p className="text-xs text-gray-500 mb-3">Cash vs Online collection</p>

            <div style={{ width: "100%", height: 180, minHeight: 180, position: "relative" }}>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={paymentMethodData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={60} />
                  <Tooltip />
                  <Bar dataKey="value" name="Bookings" radius={[0, 6, 6, 0]}>
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`method-cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-around items-center pt-2 text-xs border-t border-gray-100 mt-2">
              <div className="text-center">
                <span className="text-emerald-700 font-bold block text-sm flex items-center justify-center gap-1">
                  <Banknote className="w-3.5 h-3.5" /> {paymentMethodData[0]?.value || 0}
                </span>
                <span className="text-gray-500 text-[11px]">Cash Payments</span>
              </div>
              <div className="text-center">
                <span className="text-indigo-700 font-bold block text-sm flex items-center justify-center gap-1">
                  <CreditCard className="w-3.5 h-3.5" /> {paymentMethodData[1]?.value || 0}
                </span>
                <span className="text-gray-500 text-[11px]">Online Payments</span>
              </div>
            </div>
          </div>

          {/* Gender Ratio Chart */}
          <div className="emp-dash__card p-4 md:p-5">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-pink-600" /> Gender Demographics
            </h3>
            <p className="text-xs text-gray-500 mb-3">Patient gender distribution</p>

            <div style={{ width: "100%", height: 180, minHeight: 180, position: "relative" }}>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    outerRadius={65}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`gender-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-around items-center pt-2 text-xs border-t border-gray-100 mt-2">
              {genderData.map((g) => (
                <div key={g.name} className="text-center">
                  <span className="font-bold block text-sm" style={{ color: g.color }}>
                    {g.value}
                  </span>
                  <span className="text-gray-500 text-[11px]">{g.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* DAY-BY-DAY MONTHLY TREND CHART */}
        <div className="emp-dash__card p-4 md:p-5 mb-6 flex flex-col">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-gray-800 text-sm md:text-base flex items-center gap-2">
                <BarChart2 className="w-4.5 h-4.5 text-blue-600" /> Daily Booking Trend ({monthlyDailyTrend.monthLabel})
              </h3>
              <p className="text-xs text-gray-500">Day-by-day booking volume and paid revenue breakdown</p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-blue-600" /> Graph Type:
                </label>
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg border border-gray-200">
                  <button
                    onClick={() => setTrendChartType("composed")}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                      trendChartType === "composed"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Composed
                  </button>
                  <button
                    onClick={() => setTrendChartType("area")}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                      trendChartType === "area"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Area
                  </button>
                  <button
                    onClick={() => setTrendChartType("bar")}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                      trendChartType === "bar"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Bar
                  </button>
                  <button
                    onClick={() => setTrendChartType("line")}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                      trendChartType === "line"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Line
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <label className="text-xs font-semibold text-gray-500">Month:</label>
                <input
                  type="month"
                  value={selectedTrendMonth}
                  onChange={(e) => setSelectedTrendMonth(e.target.value)}
                  className="px-2.5 py-1 text-xs border border-gray-300 rounded-lg font-bold text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div style={{ width: "100%", height: 260, minHeight: 260, position: "relative" }}>
            <ResponsiveContainer width="100%" height={260}>
              {renderTrendGraph()}
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 mt-2 border-t border-gray-100 text-center text-xs">
            <div className="bg-slate-50 p-2 rounded-lg">
              <span className="text-[10px] text-gray-500 font-bold uppercase block">Month</span>
              <span className="font-bold text-gray-800">{monthlyDailyTrend.monthLabel}</span>
            </div>
            <div className="bg-blue-50 p-2 rounded-lg">
              <span className="text-[10px] text-blue-700 font-bold uppercase block">Monthly Bookings</span>
              <span className="font-extrabold text-blue-900 text-sm">{monthlyDailyTrend.totalMonthPatients}</span>
            </div>
            <div className="bg-emerald-50 p-2 rounded-lg">
              <span className="text-[10px] text-emerald-700 font-bold uppercase block">Monthly Revenue (Paid)</span>
              <span className="font-extrabold text-emerald-900 text-sm">₹{monthlyDailyTrend.totalMonthRevenue.toLocaleString()}</span>
            </div>
            <div className="bg-purple-50 p-2 rounded-lg">
              <span className="text-[10px] text-purple-700 font-bold uppercase block">Peak Day</span>
              <span className="font-bold text-purple-900 truncate block" title={monthlyDailyTrend.peakDay}>
                {monthlyDailyTrend.peakDay}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Bookings Table */}
        <div className="emp-dash__card p-4 md:p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-800 text-sm md:text-base">Recent Bookings</h3>
              <p className="text-xs text-gray-500">Latest appointments and payment status</p>
            </div>
            <button
              onClick={() => handleQuickAction("/bookings")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              View All Bookings <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {filteredBookings.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-xs">
              No bookings found for selected period
            </div>
          ) : (
            <>
              {/* ===== DESKTOP TABLE VIEW ===== */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="emp-dash__table">
                  <thead>
                    <tr>
                      <th style={{ width: "45px", textAlign: "center" }}>S.No</th>
                      <th>Patient Name</th>
                      <th>Doctor</th>
                      <th style={{ textAlign: "center" }}>Date &amp; Slot</th>
                      <th style={{ textAlign: "center" }}>Total</th>
                      <th style={{ textAlign: "center" }}>Paid</th>
                      <th style={{ textAlign: "center" }}>Balance</th>
                      <th style={{ textAlign: "center" }}>Status</th>
                      <th style={{ textAlign: "center" }}>Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.slice(0, 10).map((b, idx) => {
                      const totalFee = getTotalBookingFee(b);
                      const paidAmount = b.amountPaid || 0;
                      const balance = b.balanceAmount || Math.max(0, totalFee - paidAmount);
                      const isPaid = isPaidBooking(b);
                      const isPartial = b.paymentStatus === "Partial" || b.paymentStatus === "partial";
                      const statusColors = {
                        confirmed: "bg-blue-100 text-blue-800 border-blue-200",
                        completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
                        consulting: "bg-purple-100 text-purple-800 border-purple-200",
                        cancelled: "bg-red-100 text-red-800 border-red-200",
                        pending: "bg-gray-100 text-gray-800 border-gray-200",
                        booked: "bg-blue-100 text-blue-800 border-blue-200"
                      };
                      const statusClass = statusColors[b.status] || statusColors.pending;
                      
                      return (
                        <tr key={b._id || idx} className="hover:bg-slate-50/50 cursor-pointer" onClick={() => handleQuickAction("/bookings")}>
                          <td className="px-3 py-2.5 font-semibold text-gray-400 text-xs text-center">{idx + 1}</td>
                          <td className="px-3 py-2.5 font-semibold text-gray-800 text-xs">{b.patientName || "N/A"}</td>
                          <td className="px-3 py-2.5 text-xs text-gray-700">{b.doctorName || "N/A"}</td>
                          <td className="px-3 py-2.5 text-xs text-gray-600 text-center">
                            <div>{formatDate(b.date)}</div>
                            <div className="text-[10px] text-gray-400">{b.startTime} - {b.endTime}</div>
                          </td>
                          <td className="px-3 py-2.5 text-xs text-center font-bold text-gray-800">₹{totalFee}</td>
                          <td className="px-3 py-2.5 text-xs text-center font-bold text-emerald-700">₹{paidAmount}</td>
                          <td className="px-3 py-2.5 text-xs text-center font-bold text-amber-700">₹{balance}</td>
                          <td className="px-3 py-2.5 text-xs text-center">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${statusClass}`}>
                              {b.status || "pending"}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-xs text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                isPaid
                                  ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                  : isPartial
                                  ? "bg-amber-100 text-amber-800 border-amber-200"
                                  : "bg-red-100 text-red-800 border-red-200"
                              }`}
                            >
                              {b.paymentStatus || "Pending"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* ===== MOBILE CARD VIEW ===== */}
              <div className="lg:hidden space-y-3">
                {filteredBookings.slice(0, 10).map((b, idx) => {
                  const totalFee = getTotalBookingFee(b);
                  const paidAmount = b.amountPaid || 0;
                  const balance = b.balanceAmount || Math.max(0, totalFee - paidAmount);
                  const isPaid = isPaidBooking(b);
                  const isPartial = b.paymentStatus === "Partial" || b.paymentStatus === "partial";
                  const statusColors = {
                    confirmed: "bg-blue-50 text-blue-700 border-blue-200",
                    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
                    consulting: "bg-purple-50 text-purple-700 border-purple-200",
                    cancelled: "bg-red-50 text-red-700 border-red-200",
                    pending: "bg-gray-50 text-gray-700 border-gray-200",
                    booked: "bg-blue-50 text-blue-700 border-blue-200"
                  };
                  const statusClass = statusColors[b.status] || statusColors.pending;

                  return (
                    <div
                      key={b._id || idx}
                      className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                      onClick={() => handleQuickAction("/bookings")}
                    >
                      {/* Card Header */}
                      <div className="flex items-center justify-between gap-2 p-3 border-b border-gray-100 bg-gradient-to-r from-blue-50/60 to-indigo-50/60">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                            {b.patientName ? b.patientName.charAt(0).toUpperCase() : "P"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-slate-800 text-sm truncate">{b.patientName || "N/A"}</div>
                            <div className="text-[10px] text-gray-500 flex items-center gap-1">
                              <Stethoscope className="w-3 h-3" /> {b.doctorName || "N/A"}
                            </div>
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full uppercase border ${statusClass} flex-shrink-0`}>
                          {b.status || "pending"}
                        </span>
                      </div>

                      {/* Card Body */}
                      <div className="p-3 space-y-2.5">
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <div className="text-[9px] font-bold uppercase text-gray-400">Date</div>
                            <div className="font-semibold text-slate-700">{formatDate(b.date)}</div>
                          </div>
                          <div>
                            <div className="text-[9px] font-bold uppercase text-gray-400">Slot Time</div>
                            <div className="font-semibold text-blue-700">{b.startTime} - {b.endTime}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-gray-100">
                          <div className="text-center p-1.5 rounded-lg bg-gray-50 border border-gray-200">
                            <div className="text-[8px] font-bold text-gray-600 uppercase">Total</div>
                            <div className="text-xs font-extrabold text-slate-800">₹{totalFee}</div>
                          </div>
                          <div className="text-center p-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
                            <div className="text-[8px] font-bold text-emerald-600 uppercase">Paid</div>
                            <div className="text-xs font-extrabold text-emerald-800">₹{paidAmount}</div>
                          </div>
                          <div className="text-center p-1.5 rounded-lg bg-amber-50 border border-amber-200">
                            <div className="text-[8px] font-bold text-amber-600 uppercase">Balance</div>
                            <div className="text-xs font-extrabold text-amber-800">₹{balance}</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <span className="text-[9px] font-bold uppercase text-gray-400">Payment Status:</span>
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                              isPaid
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : isPartial
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-red-50 text-red-700 border-red-200"
                            }`}
                          >
                            {b.paymentStatus || "Pending"}
                          </span>
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
    </div>
  );
};

export default OpDashboard;