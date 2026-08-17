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
  Sliders
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
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState("all"); // 'all', 'month', 'today', '7days'

  // Selected month for Day-by-Day trend chart (default: current YYYY-MM)
  const [selectedTrendMonth, setSelectedTrendMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  // Graph Type Selector State ('composed' | 'area' | 'bar' | 'line')
  const [trendChartType, setTrendChartType] = useState("composed");

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/patients`);
      if (res.data && res.data.success) {
        setPatients(res.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching patient data for OP Dashboard:", err);
      setError("Failed to load patient records");
    } finally {
      setLoading(false);
    }
  };

  // Filtered patients based on selected timeframe
  const filteredPatients = useMemo(() => {
    if (timeFilter === "all") return patients;
    const now = new Date();
    
    return patients.filter((p) => {
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
  }, [patients, timeFilter]);

  // Overall KPI Metrics
  const metrics = useMemo(() => {
    const total = filteredPatients.length;
    const paidPatients = filteredPatients.filter((p) => p.paymentStatus === "paid");
    const pendingPatients = filteredPatients.filter((p) => p.paymentStatus === "pending");

    const totalRevenue = paidPatients.reduce((sum, p) => sum + (p.feeAmount || 0), 0);
    const pendingRevenue = pendingPatients.reduce((sum, p) => sum + (p.feeAmount || 0), 0);
    const totalExpectedRevenue = filteredPatients.reduce((sum, p) => sum + (p.feeAmount || 0), 0);

    const avgFee = total > 0 ? Math.round(totalExpectedRevenue / total) : 0;
    const collectionRate = totalExpectedRevenue > 0 ? Math.round((totalRevenue / totalExpectedRevenue) * 100) : 0;

    // Fee breakdown
    const consultCount = filteredPatients.filter((p) => p.feeType === "consultation" || !p.feeType).length;
    const labCount = filteredPatients.filter((p) => p.feeType === "lab").length;
    const consultRevenue = filteredPatients
      .filter((p) => (p.feeType === "consultation" || !p.feeType) && p.paymentStatus === "paid")
      .reduce((sum, p) => sum + (p.feeAmount || 0), 0);
    const labRevenue = filteredPatients
      .filter((p) => p.feeType === "lab" && p.paymentStatus === "paid")
      .reduce((sum, p) => sum + (p.feeAmount || 0), 0);

    // Payment Type breakdown
    const cashCount = filteredPatients.filter((p) => p.paymentType === "cash" || !p.paymentType).length;
    const onlineCount = filteredPatients.filter((p) => p.paymentType === "online").length;

    return {
      total,
      paidCount: paidPatients.length,
      pendingCount: pendingPatients.length,
      totalRevenue,
      pendingRevenue,
      totalExpectedRevenue,
      avgFee,
      collectionRate,
      consultCount,
      labCount,
      consultRevenue,
      labRevenue,
      cashCount,
      onlineCount
    };
  }, [filteredPatients]);

  // Daily Trend Data for Top Composed Chart
  const trendData = useMemo(() => {
    if (!filteredPatients.length) return [];
    
    const map = {};
    filteredPatients.forEach((p) => {
      const dateKey = p.createdAt
        ? new Date(p.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short"
          })
        : "Unknown";

      if (!map[dateKey]) {
        map[dateKey] = { date: dateKey, patients: 0, revenue: 0, rawDate: new Date(p.createdAt) };
      }
      map[dateKey].patients += 1;
      if (p.paymentStatus === "paid") {
        map[dateKey].revenue += p.feeAmount || 0;
      }
    });

    return Object.values(map).sort((a, b) => a.rawDate - b.rawDate);
  }, [filteredPatients]);

  // Day-by-Day Monthly Trend Calculation for Selected Month (e.g. July, August)
  const monthlyDailyTrend = useMemo(() => {
    if (!selectedTrendMonth) return { daysData: [], monthLabel: "", totalMonthPatients: 0, totalMonthRevenue: 0, peakDay: "-" };

    const [yearStr, monthStr] = selectedTrendMonth.split("-");
    const year = parseInt(yearStr, 10);
    const monthIdx = parseInt(monthStr, 10) - 1; // 0-indexed month

    const dateObj = new Date(year, monthIdx, 1);
    const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
    const monthLabel = dateObj.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

    // Map patient records for this specific month by day of month (1 to daysInMonth)
    const dayMap = {};
    for (let day = 1; day <= daysInMonth; day++) {
      const formattedDay = String(day).padStart(2, "0");
      dayMap[day] = {
        day: formattedDay,
        dateLabel: `${formattedDay} ${dateObj.toLocaleDateString("en-IN", { month: "short" })}`,
        patients: 0,
        paidPatients: 0,
        pendingPatients: 0,
        revenue: 0,
        consultCount: 0,
        labCount: 0
      };
    }

    patients.forEach((p) => {
      if (!p.createdAt) return;
      const pDate = new Date(p.createdAt);
      if (pDate.getFullYear() === year && pDate.getMonth() === monthIdx) {
        const day = pDate.getDate();
        if (dayMap[day]) {
          dayMap[day].patients += 1;
          if (p.paymentStatus === "paid") {
            dayMap[day].paidPatients += 1;
            dayMap[day].revenue += p.feeAmount || 0;
          } else {
            dayMap[day].pendingPatients += 1;
          }
          if (p.feeType === "lab") dayMap[day].labCount += 1;
          else dayMap[day].consultCount += 1;
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
        peakDay = `${d.dateLabel} (${d.patients} patients)`;
      }
    });

    return {
      daysData,
      monthLabel,
      totalMonthPatients,
      totalMonthRevenue,
      peakDay
    };
  }, [patients, selectedTrendMonth]);

  // Fee Type Distribution Data
  const feeTypePieData = useMemo(() => {
    return [
      { name: "Consultation Fee", value: metrics.consultCount, revenue: metrics.consultRevenue, color: COLORS.primary },
      { name: "Lab Fee", value: metrics.labCount, revenue: metrics.labRevenue, color: COLORS.purple }
    ];
  }, [metrics]);

  // Payment Status Distribution Data
  const paymentStatusData = useMemo(() => {
    return [
      { name: "Paid", value: metrics.paidCount, color: COLORS.success },
      { name: "Pending", value: metrics.pendingCount, color: COLORS.warning }
    ];
  }, [metrics]);

  // Payment Method Breakdown Data
  const paymentMethodData = useMemo(() => {
    return [
      { name: "Cash", value: metrics.cashCount, color: COLORS.success },
      { name: "Online", value: metrics.onlineCount, color: COLORS.indigo }
    ];
  }, [metrics]);

  // Gender Ratio Data
  const genderData = useMemo(() => {
    const counts = { Male: 0, Female: 0, Other: 0 };
    filteredPatients.forEach((p) => {
      const g = p.gender || "Other";
      if (counts[g] !== undefined) counts[g]++;
      else counts.Other++;
    });

    return [
      { name: "Male", value: counts.Male, color: "#3b82f6" },
      { name: "Female", value: counts.Female, color: "#ec4899" },
      { name: "Other", value: counts.Other, color: "#a855f7" }
    ];
  }, [filteredPatients]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  // Custom Tooltip for Monthly Daily Trend Chart
  const DailyTrendTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-xl shadow-xl border border-gray-200 text-xs space-y-1 z-50">
          <div className="font-bold text-gray-900 border-b border-gray-100 pb-1 mb-1">
            📅 {data.dateLabel}
          </div>
          <div className="flex justify-between gap-4 text-blue-700 font-semibold">
            <span>Total Patients:</span>
            <span>{data.patients}</span>
          </div>
          <div className="flex justify-between gap-4 text-emerald-600 font-medium">
            <span>Paid Patients:</span>
            <span>{data.paidPatients}</span>
          </div>
          <div className="flex justify-between gap-4 text-amber-600 font-medium">
            <span>Pending Patients:</span>
            <span>{data.pendingPatients}</span>
          </div>
          <div className="flex justify-between gap-4 text-purple-700 font-bold pt-1 border-t border-gray-100">
            <span>Revenue Collected:</span>
            <span>₹{data.revenue.toLocaleString()}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Render Daily Trend Chart depending on Graph Type selected (Using ComposedChart for all modes to guarantee dual Y-axis & SVG stability)
  const renderTrendGraph = () => {
    const data = monthlyDailyTrend.daysData;

    return (
      <ComposedChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="opTrendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35}/>
            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis 
          dataKey="day" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#64748b', fontSize: 10, fontWeight: '600' }} 
        />
        <YAxis 
          yAxisId="left"
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#2563eb', fontSize: 10, fontWeight: '700' }}
          allowDecimals={false}
          domain={[0, 'auto']}
        />
        <YAxis 
          yAxisId="right"
          orientation="right"
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#10b981', fontSize: 10, fontWeight: '700' }}
          allowDecimals={false}
          domain={[0, 'auto']}
        />
        <Tooltip content={<DailyTrendTooltip />} />

        {/* 1. AREA MODE */}
        {trendChartType === "area" && (
          <>
            <Area 
              yAxisId="left" 
              type="monotone" 
              dataKey="patients" 
              name="Patients Registered" 
              stroke="#2563eb" 
              strokeWidth={2.5} 
              fill="url(#opTrendGradient)" 
              dot={{ fill: '#2563eb', stroke: '#fff', strokeWidth: 1.5, r: 3.5 }} 
              activeDot={{ r: 6, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }} 
            />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="revenue" 
              name="Revenue (₹)" 
              stroke="#10b981" 
              strokeWidth={2.5} 
              dot={{ fill: '#10b981', stroke: '#fff', strokeWidth: 1.5, r: 3.5 }} 
              activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} 
            />
          </>
        )}

        {/* 2. BAR MODE */}
        {trendChartType === "bar" && (
          <>
            <Bar yAxisId="left" dataKey="patients" name="Patients Registered" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={16} />
            <Bar yAxisId="right" dataKey="revenue" name="Revenue (₹)" fill="#10b981" radius={[4, 4, 0, 0]} barSize={16} />
          </>
        )}

        {/* 3. LINE MODE */}
        {trendChartType === "line" && (
          <>
            <Line yAxisId="left" type="monotone" dataKey="patients" name="Patients Registered" stroke="#2563eb" strokeWidth={3} dot={{ fill: '#2563eb', stroke: '#fff', strokeWidth: 1.5, r: 4 }} activeDot={{ r: 6, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }} />
            <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', stroke: '#fff', strokeWidth: 1.5, r: 4 }} activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} />
          </>
        )}

        {/* 4. COMPOSED MODE (Default) */}
        {trendChartType === "composed" && (
          <>
            <Bar yAxisId="left" dataKey="patients" name="Patients Registered" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
            <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', stroke: '#fff', strokeWidth: 1.5, r: 4 }} activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} />
          </>
        )}
      </ComposedChart>
    );
  };

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
            <p className="text-xs text-gray-500 mt-1">
              Real-time Outpatient analytics, registration trends, fee collection &amp; revenue insights
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Time filter selector */}
            <div className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setTimeFilter("all")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  timeFilter === "all"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                All Time
              </button>
              <button
                onClick={() => setTimeFilter("month")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  timeFilter === "month"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                This Month
              </button>
              <button
                onClick={() => setTimeFilter("7days")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  timeFilter === "7days"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Last 7 Days
              </button>
              <button
                onClick={() => setTimeFilter("today")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  timeFilter === "today"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Today
              </button>
            </div>

            <button
              onClick={fetchPatients}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
              title="Refresh Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => navigate("/op-management")}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-md"
            >
              OP Management <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* KPI Stats Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total OP Patients</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div className="emp-dash__stat-value">{metrics.total}</div>
            <div className="emp-dash__stat-meta">registered OPD records</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Revenue Collected</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <IndianRupee className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <div className="emp-dash__stat-value text-emerald-600">
              ₹{metrics.totalRevenue.toLocaleString()}
            </div>
            <div className="emp-dash__stat-meta">
              {metrics.collectionRate}% collection rate
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
              {metrics.pendingCount} patients pending
            </div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Avg Fee per Patient</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
              </div>
            </div>
            <div className="emp-dash__stat-value text-indigo-600">
              ₹{metrics.avgFee.toLocaleString()}
            </div>
            <div className="emp-dash__stat-meta">average OPD charge</div>
          </div>
        </div>

        {/* Charts Row 1: Patient & Revenue Trend (ComposedChart) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 emp-dash__card p-4 md:p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-800 text-sm md:text-base flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" /> Patient Registrations &amp; Revenue Trend
                </h3>
                <p className="text-xs text-gray-500">Daily patient volume and revenue generated</p>
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
                    <Bar yAxisId="left" dataKey="patients" name="Patients Registered" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={24} />
                    <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Fee Type Distribution Donut Chart */}
          <div className="emp-dash__card p-4 md:p-5 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-gray-800 text-sm md:text-base flex items-center gap-2 mb-1">
                <PieIcon className="w-4 h-4 text-purple-600" /> Fee Type Breakdown
              </h3>
              <p className="text-xs text-gray-500 mb-4">Consultation vs Lab fee distribution</p>

              <div style={{ width: "100%", height: 220, minHeight: 220, position: "relative" }}>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={feeTypePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {feeTypePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name, props) => [
                        `${value} Patients (₹${props.payload.revenue.toLocaleString()})`,
                        name
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100 text-center">
              <div className="bg-blue-50 p-2 rounded-lg">
                <span className="text-[10px] uppercase font-bold text-blue-700 block">Consultation</span>
                <span className="text-sm font-bold text-blue-900">{metrics.consultCount}</span>
                <span className="text-[10px] text-gray-500 block">₹{metrics.consultRevenue.toLocaleString()}</span>
              </div>
              <div className="bg-purple-50 p-2 rounded-lg">
                <span className="text-[10px] uppercase font-bold text-purple-700 block">Lab Fee</span>
                <span className="text-sm font-bold text-purple-900">{metrics.labCount}</span>
                <span className="text-[10px] text-gray-500 block">₹{metrics.labRevenue.toLocaleString()}</span>
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
                  <Bar dataKey="value" name="Patients" radius={[0, 6, 6, 0]}>
                    {paymentStatusData.map((entry, index) => (
                      <Cell key={`status-cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-around items-center pt-2 text-xs border-t border-gray-100 mt-2">
              <div className="text-center">
                <span className="text-emerald-600 font-bold block text-sm">{metrics.paidCount}</span>
                <span className="text-gray-500 text-[11px]">Paid Records</span>
              </div>
              <div className="text-center">
                <span className="text-amber-600 font-bold block text-sm">{metrics.pendingCount}</span>
                <span className="text-gray-500 text-[11px]">Pending Records</span>
              </div>
            </div>
          </div>

          {/* Payment Mode Chart */}
          <div className="emp-dash__card p-4 md:p-5">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 mb-1">
              <CreditCard className="w-4 h-4 text-indigo-600" /> Payment Mode
            </h3>
            <p className="text-xs text-gray-500 mb-3">Cash vs Online collection</p>

            <div style={{ width: "100%", height: 180, minHeight: 180, position: "relative" }}>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={paymentMethodData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={60} />
                  <Tooltip />
                  <Bar dataKey="value" name="Patients" radius={[0, 6, 6, 0]}>
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
                  <Banknote className="w-3.5 h-3.5" /> {metrics.cashCount}
                </span>
                <span className="text-gray-500 text-[11px]">Cash Payments</span>
              </div>
              <div className="text-center">
                <span className="text-indigo-700 font-bold block text-sm flex items-center justify-center gap-1">
                  <CreditCard className="w-3.5 h-3.5" /> {metrics.onlineCount}
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

        {/* DAY-BY-DAY MONTHLY OPD TREND CHART WITH GRAPH TYPE SELECTOR */}
        <div className="emp-dash__card p-4 md:p-5 mb-6 flex flex-col">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-gray-800 text-sm md:text-base flex items-center gap-2">
                <BarChart2 className="w-4.5 h-4.5 text-blue-600" /> Daily OPD Trend ({monthlyDailyTrend.monthLabel})
              </h3>
              <p className="text-xs text-gray-500">Day-by-day patient volume and revenue breakdown for the selected month</p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* GRAPH TYPE SELECTOR */}
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

              {/* MONTH SELECTOR */}
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-semibold text-gray-500">Month:</label>
                <input
                  type="month"
                  value={selectedTrendMonth}
                  onChange={(e) => setSelectedTrendMonth(e.target.value)}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
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
              <span className="text-[10px] text-blue-700 font-bold uppercase block">Monthly Patients</span>
              <span className="font-extrabold text-blue-900 text-sm">{monthlyDailyTrend.totalMonthPatients}</span>
            </div>
            <div className="bg-emerald-50 p-2 rounded-lg">
              <span className="text-[10px] text-emerald-700 font-bold uppercase block">Monthly Revenue</span>
              <span className="font-extrabold text-emerald-900 text-sm">₹{monthlyDailyTrend.totalMonthRevenue.toLocaleString()}</span>
            </div>
            <div className="bg-purple-50 p-2 rounded-lg">
              <span className="text-[10px] text-purple-700 font-bold uppercase block">Peak Patient Day</span>
              <span className="font-bold text-purple-900 truncate block" title={monthlyDailyTrend.peakDay}>
                {monthlyDailyTrend.peakDay}
              </span>
            </div>
          </div>
        </div>

        {/* Recent OPD Registrations Table */}
        <div className="emp-dash__card p-4 md:p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-800 text-sm md:text-base">Recent OPD Registrations</h3>
              <p className="text-xs text-gray-500">Latest patient registrations and payment status</p>
            </div>
            <button
              onClick={() => navigate("/op-management")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              View All Patients <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {filteredPatients.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-xs">
              No recent OPD patient records found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="emp-dash__table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Patient Name</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Phone</th>
                    <th>Fee Type &amp; Amount</th>
                    <th>Payment Mode</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.slice(0, 7).map((p, idx) => (
                    <tr key={p._id || idx} className="hover:bg-slate-50/50">
                      <td className="px-3 py-2.5 font-semibold text-gray-400 text-xs">{idx + 1}</td>
                      <td className="px-3 py-2.5 font-semibold text-gray-800 text-xs">{p.name}</td>
                      <td className="px-3 py-2.5 text-xs text-gray-700">{p.age} Yrs</td>
                      <td className="px-3 py-2.5 text-xs text-gray-700 capitalize">{p.gender || "N/A"}</td>
                      <td className="px-3 py-2.5 text-xs text-gray-600">{p.phone}</td>
                      <td className="px-3 py-2.5 text-xs">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase mr-1.5 ${
                            p.feeType === "lab"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {p.feeType === "lab" ? "Lab" : "Consult"}
                        </span>
                        <span className="font-bold text-gray-800">₹{p.feeAmount ?? 300}</span>
                      </td>
                      <td className="px-3 py-2.5 text-xs capitalize text-gray-700">
                        {p.paymentType || "cash"}
                      </td>
                      <td className="px-3 py-2.5 text-xs">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            p.paymentStatus === "paid"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-amber-100 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {p.paymentStatus || "pending"}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-gray-500">{formatDate(p.createdAt)}</td>
                    </tr>
                  ))}
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