// import React, { useState, useEffect, useCallback } from "react";
// import Calendar from "react-calendar";
// import axios from "axios";
// import {
//   format,
//   isWithinInterval,
//   parseISO,
//   startOfDay,
//   differenceInDays,
// } from "date-fns";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Trash2,
//   Edit2,
//   Award,
//   Sun,
//   Building,
//   Star,
//   Info,
//   Save,
//   XCircle,
// } from "lucide-react";
// import { FaCalendarAlt, FaSearch, FaSync, FaTimes } from "react-icons/fa";
// import "react-calendar/dist/Calendar.css";
// import { API_BASE_URL } from "../config";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// /* ─── Category Config ─── */
// const CATEGORIES = [
//   { key: "Festival",          label: "Festival",         color: "#F97316", light: "#FFF7ED", icon: <Award size={12} /> },
//   { key: "National Holiday",  label: "National Holiday", color: "#10B981", light: "#ECFDF5", icon: <Sun size={12} /> },
//   { key: "Company Holiday",   label: "Company Holiday",  color: "#6366F1", light: "#EEF2FF", icon: <Building size={12} /> },
//   { key: "Observance",        label: "Observance",       color: "#8B5CF6", light: "#F5F3FF", icon: <Star size={12} /> },
//   { key: "Restricted Holiday",label: "Restricted",       color: "#EC4899", light: "#FDF2F8", icon: <Info size={12} /> },
// ];

// const catOf = (type) => CATEGORIES.find((c) => c.key === type) || CATEGORIES[0];

// const tileClass = {
//   "Festival":          "tile-festival",
//   "National Holiday":  "tile-national",
//   "Company Holiday":   "tile-company",
//   "Observance":        "tile-observance",
//   "Restricted Holiday":"tile-restricted",
// };

// /* ─────────────────────────────────────── */
// const HolidaysCalendar = ({ isEmployeeView = false }) => {
//   const isAdmin = !isEmployeeView;

//   const [holidays,   setHolidays]   = useState([]);
//   const [loading,    setLoading]    = useState(true);
//   const [saving,     setSaving]     = useState(false);
//   const [filter,     setFilter]     = useState("All");
//   const [search,     setSearch]     = useState("");
//   const [calDate,    setCalDate]    = useState(new Date());
//   const [showForm,   setShowForm]   = useState(false);
//   const [editingId,  setEditingId]  = useState(null);

//   const [tableSearch, setTableSearch] = useState("");
//   const [monthFilter, setMonthFilter] = useState("");
//   const [tableFilter, setTableFilter] = useState("All");

//   const [form, setForm] = useState({
//     name: "",
//     fromDate: format(new Date(), "yyyy-MM-dd"),
//     toDate:   format(new Date(), "yyyy-MM-dd"),
//     type:     "Festival",
//   });

//   /* ─── Fetch ─── */
//   const fetchHolidays = useCallback(async () => {
//     try {
//       setLoading(true);
//       const { data } = await axios.get(`${API_BASE_URL}/holidays/all`);
//       setHolidays(Array.isArray(data) ? data : []);
//     } catch {
//       toast.error("Failed to load holidays");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => { fetchHolidays(); }, [fetchHolidays]);

//   /* ─── Calendar tile colouring ─── */
//   const getTileClass = ({ date, view }) => {
//     if (view !== "month") return null;
//     const match = holidays.find((h) => {
//       try {
//         return isWithinInterval(startOfDay(date), {
//           start: startOfDay(parseISO(h.fromDate)),
//           end:   startOfDay(parseISO(h.toDate)),
//         });
//       } catch { return false; }
//     });
//     return match ? `hl-tile ${tileClass[match.type] || "tile-festival"}` : null;
//   };

//   /* ─── Date click ─── */
//   const onDayClick = (date) => {
//     setCalDate(date);
//     if (!isAdmin) return;
//     const existing = holidays.find((h) => {
//       try {
//         return isWithinInterval(startOfDay(date), {
//           start: startOfDay(parseISO(h.fromDate)),
//           end:   startOfDay(parseISO(h.toDate)),
//         });
//       } catch { return false; }
//     });
//     if (existing) {
//       setEditingId(existing._id);
//       setForm({
//         name:     existing.name,
//         fromDate: format(parseISO(existing.fromDate), "yyyy-MM-dd"),
//         toDate:   format(parseISO(existing.toDate),   "yyyy-MM-dd"),
//         type:     existing.type || "Festival",
//       });
//     } else {
//       setEditingId(null);
//       setForm({ name: "", fromDate: format(date, "yyyy-MM-dd"), toDate: format(date, "yyyy-MM-dd"), type: "Festival" });
//     }
//     setShowForm(true);
//   };

//   const openNewForm = () => {
//     setEditingId(null);
//     setForm({ name: "", fromDate: format(new Date(), "yyyy-MM-dd"), toDate: format(new Date(), "yyyy-MM-dd"), type: "Festival" });
//     setShowForm(true);
//   };

//   const openEditForm = (hol) => {
//     setEditingId(hol._id);
//     setForm({
//       name:     hol.name,
//       fromDate: format(parseISO(hol.fromDate), "yyyy-MM-dd"),
//       toDate:   format(parseISO(hol.toDate),   "yyyy-MM-dd"),
//       type:     hol.type || "Festival",
//     });
//     setShowForm(true);
//   };

//   /* ─── Save ─── */
//   const handleSave = async (e) => {
//     e.preventDefault();
//     if (new Date(form.fromDate) > new Date(form.toDate)) {
//       toast.error("'From' date cannot be after 'To' date");
//       return;
//     }
//     try {
//       setSaving(true);
//       const payload = {
//         ...form,
//         totalDays: differenceInDays(parseISO(form.toDate), parseISO(form.fromDate)) + 1,
//       };
//       if (editingId) {
//         await axios.put(`${API_BASE_URL}/holidays/${editingId}`, payload);
//         toast.success("Holiday updated!");
//       } else {
//         await axios.post(`${API_BASE_URL}/holidays/add`, payload);
//         toast.success(`✅ ${form.name} saved to calendar!`);
//       }
//       setShowForm(false);
//       setEditingId(null);
//       fetchHolidays();
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Failed to save");
//     } finally {
//       setSaving(false);
//     }
//   };

//   /* ─── Delete ─── */
//   const handleDelete = async (id) => {
//     if (!window.confirm("Remove this holiday?")) return;
//     try {
//       await axios.delete(`${API_BASE_URL}/holidays/${id}`);
//       toast.success("Holiday removed");
//       setShowForm(false);
//       fetchHolidays();
//     } catch {
//       toast.error("Failed to delete");
//     }
//   };

//   /* ─── Filtered list ─── */
//   const listed = holidays
//     .filter((h) => filter === "All" || h.type === filter)
//     .filter((h) =>
//       !search || h.name?.toLowerCase().includes(search.toLowerCase()) || h.type?.toLowerCase().includes(search.toLowerCase())
//     );

//   const tableListed = holidays
//     .filter((h) => tableFilter === "All" || h.type === tableFilter)
//     .filter((h) => !tableSearch || h.name?.toLowerCase().includes(tableSearch.toLowerCase()))
//     .filter((h) => monthFilter === "" || new Date(h.fromDate).getMonth().toString() === monthFilter);

//   const totalDays = form.fromDate && form.toDate
//     ? differenceInDays(parseISO(form.toDate), parseISO(form.fromDate)) + 1
//     : 1;

//   const selCat = catOf(form.type);

//   /* ─────────── RENDER ─────────── */
//   return (
//     <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100 font-sans">
//       <ToastContainer position="top-right" autoClose={3000} />

//       {/* ─── Calendar CSS ─── */}
//       <style>{`
//         .react-calendar{width:100%;border:none!important;border-radius:.5rem;padding:1rem;background:white;font-family:inherit;font-size:.8rem;}
//         .react-calendar__navigation{margin-bottom:1rem;}
//         .react-calendar__navigation button{font-weight:700!important;color:#1e293b!important;font-size:.875rem!important;border-radius:.375rem!important;min-width:36px;}
//         .react-calendar__navigation button:hover,.react-calendar__navigation button:focus{background:#f1f5f9!important;}
//         .react-calendar__month-view__weekdays__weekday{color:#94a3b8;font-weight:700;font-size:.6rem;letter-spacing:.1em;text-transform:uppercase;padding:.5rem 0;}
//         .react-calendar__month-view__weekdays__weekday abbr{text-decoration:none!important;}
//         .react-calendar__month-view__days__day--neighboringMonth{opacity:.25!important;}
//         .react-calendar__tile{padding:.65rem .3rem;border-radius:.375rem!important;font-size:.8rem;font-weight:500;color:#475569;position:relative;transition:all .12s;}
//         .react-calendar__tile:enabled:hover,.react-calendar__tile:enabled:focus{background:#dbeafe!important;color:#1d4ed8!important;}
//         .react-calendar__tile--now{background:transparent!important;color:#2563eb!important;font-weight:900!important;box-shadow:inset 0 0 0 2px #bfdbfe;}
//         .react-calendar__tile--active,.react-calendar__tile--active:enabled:hover{background:linear-gradient(to right,#22c55e,#2563eb)!important;color:white!important;box-shadow:0 2px 8px rgba(37,99,235,.3)!important;}

//         .hl-tile{font-weight:800!important;}
//         .hl-tile::after{content:'';position:absolute;bottom:3px;left:50%;transform:translateX(-50%);width:4px;height:4px;border-radius:50%;}

//         .tile-festival{background:#fff7ed!important;color:#f97316!important;}.tile-festival::after{background:#f97316;}
//         .tile-national{background:#ecfdf5!important;color:#10b981!important;}.tile-national::after{background:#10b981;}
//         .tile-company{background:#eef2ff!important;color:#6366f1!important;}.tile-company::after{background:#6366f1;}
//         .tile-observance{background:#f5f3ff!important;color:#8b5cf6!important;}.tile-observance::after{background:#8b5cf6;}
//         .tile-restricted{background:#fdf2f8!important;color:#ec4899!important;}.tile-restricted::after{background:#ec4899;}

//         .react-calendar__tile--active.hl-tile{color:white!important;}
//         .react-calendar__tile--active.hl-tile::after{background:white!important;}
//       `}</style>

//       <div className="mx-auto max-w-9xl">

//         {/* ─── TOP FILTER/CONTROL BAR ─── */}
//         <div className="p-3 mb-4 bg-white rounded-xl shadow-lg border border-gray-100">
//           <div className="flex flex-wrap items-center gap-2">

//             {/* Title */}
//             <div className="flex items-center gap-2 pr-3 border-r border-gray-200">
//               <FaCalendarAlt className="text-sm text-blue-600" />
//               <h1 className="text-sm font-bold tracking-widest text-gray-800 uppercase">Holiday Calendar</h1>
//             </div>

//             {/* Search */}
//             <div className="relative flex-1 min-w-[180px]">
//               <FaSearch className="absolute text-xs text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
//               <input
//                 type="text"
//                 placeholder="Search holiday name or type..."
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 className="w-full pl-7 pr-8 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none"
//               />
//               {search && (
//                 <FaTimes
//                   className="absolute text-xs text-gray-400 transform -translate-y-1/2 cursor-pointer right-2 top-1/2 hover:text-red-500"
//                   onClick={() => setSearch("")}
//                 />
//               )}
//             </div>

//             {/* Category Filter */}
//             <div className="flex flex-wrap items-center gap-1">
//               {["All", ...CATEGORIES.map((c) => c.key)].map((key) => {
//                 const c = CATEGORIES.find((x) => x.key === key);
//                 const active = filter === key;
//                 return (
//                   <button
//                     key={key}
//                     onClick={() => setFilter(key)}
//                     className={`h-7 px-2 text-[10px] font-bold rounded-md transition border ${
//                       active
//                         ? "bg-blue-600 text-white border-blue-600"
//                         : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
//                     }`}
//                   >
//                     {c?.label || "All"}
//                   </button>
//                 );
//               })}
//             </div>

//             {/* Count badge */}
//             <div className="flex items-center gap-1 border border-blue-200 bg-blue-50 rounded-lg px-2 h-7">
//               <span className="text-[10px] font-bold text-blue-600 uppercase">Total:</span>
//               <span className="text-xs font-black text-blue-700">{listed.length}</span>
//             </div>

//             {/* Sync */}
//             <button
//               onClick={() => { setSearch(""); setFilter("All"); fetchHolidays(); }}
//               className="flex items-center gap-1 h-7 px-3 text-xs font-medium text-gray-600 transition bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
//             >
//               <FaSync className={`text-[10px] ${loading ? "animate-spin" : ""}`} /> Sync
//             </button>

//             {/* Add Holiday */}
//             {isAdmin && (
//               <button
//                 onClick={openNewForm}
//                 className="flex items-center gap-1 h-7 px-3 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
//               >
//                 + Add Holiday
//               </button>
//             )}
//           </div>
//         </div>

//         {/* ─── MAIN GRID: Calendar + Form on left, Sidebar on right ─── */}
//         <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 mb-3">

//           {/* LEFT: Calendar */}
//           <div className="lg:col-span-7 space-y-3">

//             {/* Admin tip */}
//             {isAdmin && !showForm && (
//               <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm border border-blue-100 text-xs text-blue-700 font-medium">
//                 <span>👆</span>
//                 <span>Click any <strong>date</strong> on the calendar below to mark it as a holiday</span>
//               </div>
//             )}

//             {/* Calendar Card */}
//             <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
//               <Calendar
//                 onClickDay={onDayClick}
//                 value={calDate}
//                 tileClassName={getTileClass}
//                 next2Label={null}
//                 prev2Label={null}
//               />
//               {/* Color Legend */}
//               <div className="px-4 pb-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-gray-100 pt-2">
//                 {CATEGORIES.map((c) => (
//                   <span key={c.key} className="flex items-center gap-1 text-[10px] font-bold" style={{ color: c.color }}>
//                     <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
//                     {c.label}
//                   </span>
//                 ))}
//               </div>
//             </div>

//             {/* Inline Form */}
//             <AnimatePresence>
//               {showForm && isAdmin && (
//                 <motion.div
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, y: 10 }}
//                   className="bg-white rounded-xl shadow-lg overflow-hidden border border-blue-200"
//                 >
//                   {/* Form header */}
//                   <div
//                     className="px-4 py-3 flex items-center justify-between"
//                     style={{ backgroundColor: selCat.light }}
//                   >
//                     <div className="flex items-center gap-2">
//                       <div
//                         className="w-7 h-7 rounded-lg flex items-center justify-center"
//                         style={{ backgroundColor: selCat.color, color: "white" }}
//                       >
//                         {selCat.icon}
//                       </div>
//                       <div>
//                         <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: selCat.color }}>
//                           {editingId ? "Edit Holiday" : "New Holiday"}
//                         </p>
//                         <p className="text-sm font-black text-gray-800">
//                           {format(calDate, "MMMM d, yyyy")}
//                         </p>
//                       </div>
//                     </div>
//                     <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 transition">
//                       <XCircle size={18} />
//                     </button>
//                   </div>

//                   <form onSubmit={handleSave} className="p-4 space-y-3">
//                     {/* Name */}
//                     <div>
//                       <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">
//                         Occasion / Holiday Name *
//                       </label>
//                       <input
//                         required
//                         type="text"
//                         value={form.name}
//                         onChange={(e) => setForm({ ...form, name: e.target.value })}
//                         placeholder='e.g. "Good Friday", "Diwali", "Independence Day"…'
//                         className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 focus:border-blue-500 rounded-lg font-semibold text-gray-800 outline-none transition"
//                       />
//                     </div>

//                     {/* Category */}
//                     <div>
//                       <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">
//                         Category *
//                       </label>
//                       <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
//                         {CATEGORIES.map((c) => (
//                           <button
//                             key={c.key}
//                             type="button"
//                             onClick={() => setForm({ ...form, type: c.key })}
//                             className="flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider border-2 transition"
//                             style={
//                               form.type === c.key
//                                 ? { backgroundColor: c.color, color: "white", borderColor: c.color }
//                                 : { backgroundColor: c.light, color: c.color, borderColor: c.light }
//                             }
//                           >
//                             {c.icon} {c.label}
//                           </button>
//                         ))}
//                       </div>
//                     </div>

//                     {/* Date Range */}
//                     <div className="grid grid-cols-2 gap-3">
//                       <div>
//                         <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">From *</label>
//                         <input
//                           required type="date"
//                           value={form.fromDate}
//                           onChange={(e) => setForm({ ...form, fromDate: e.target.value })}
//                           className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 focus:border-blue-500 rounded-lg font-semibold outline-none transition"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">To *</label>
//                         <input
//                           required type="date"
//                           value={form.toDate}
//                           min={form.fromDate}
//                           onChange={(e) => setForm({ ...form, toDate: e.target.value })}
//                           className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 focus:border-blue-500 rounded-lg font-semibold outline-none transition"
//                         />
//                       </div>
//                     </div>

//                     {/* Preview */}
//                     <div
//                       className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold"
//                       style={{ backgroundColor: selCat.light, color: selCat.color }}
//                     >
//                       {selCat.icon}
//                       <span>{form.name || "Holiday"} · <strong>{totalDays}</strong> day{totalDays > 1 ? "s" : ""}</span>
//                     </div>

//                     {/* Buttons */}
//                     <div className="flex gap-2 pt-1">
//                       <button
//                         type="submit"
//                         disabled={saving}
//                         className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-600 text-white text-xs font-black rounded-lg hover:bg-blue-700 disabled:opacity-60 transition"
//                       >
//                         <Save size={13} />
//                         {saving ? "Saving…" : editingId ? "Update Holiday" : "Save to Calendar"}
//                       </button>
//                       {editingId && (
//                         <button
//                           type="button"
//                           onClick={() => handleDelete(editingId)}
//                           className="px-3 py-2 text-xs text-red-500 border border-red-200 font-black rounded-lg hover:bg-red-50 transition"
//                         >
//                           <Trash2 size={13} />
//                         </button>
//                       )}
//                       <button
//                         type="button"
//                         onClick={() => setShowForm(false)}
//                         className="px-3 py-2 text-xs text-gray-400 border border-gray-200 font-black rounded-lg hover:bg-gray-50 transition"
//                       >
//                         <XCircle size={13} />
//                       </button>
//                     </div>
//                   </form>
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </div>

//           {/* RIGHT: Sidebar */}
//           <div className="lg:col-span-5 space-y-3">

//             {/* Stats row */}
//             <div className="grid grid-cols-2 gap-2">
//               <div className="px-3 py-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg text-white shadow-md flex items-center justify-between">
//                 <p className="text-[9px] font-black uppercase tracking-widest text-white/70">Total Holidays</p>
//                 <h3 className="text-xl font-black">{holidays.length}</h3>
//               </div>
//               <div className="px-3 py-2 bg-white rounded-lg border border-gray-100 shadow-md flex items-center justify-between">
//                 <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Upcoming</p>
//                 <h3 className="text-xl font-black text-green-600">
//                   {holidays.filter((h) => { try { return parseISO(h.fromDate) >= startOfDay(new Date()); } catch { return false; } }).length}
//                 </h3>
//               </div>
//             </div>

//             {/* Category breakdown */}
//             <div className="bg-white rounded-lg shadow-md p-3">
//               <h3 className="text-xs font-black text-gray-700 uppercase tracking-widest mb-3">By Category</h3>
//               <div className="space-y-2">
//                 {CATEGORIES.map((c) => {
//                   const count = holidays.filter((h) => h.type === c.key).length;
//                   return (
//                     <div key={c.key} className="flex items-center gap-2.5">
//                       <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: c.light, color: c.color }}>
//                         {c.icon}
//                       </div>
//                       <div className="flex-1">
//                         <div className="flex justify-between mb-0.5">
//                           <span className="text-[10px] font-bold text-gray-600">{c.label}</span>
//                           <span className="text-[10px] font-black" style={{ color: c.color }}>{count}</span>
//                         </div>
//                         <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
//                           <div
//                             className="h-full rounded-full"
//                             style={{ width: holidays.length ? `${(count / holidays.length) * 100}%` : "0%", backgroundColor: c.color }}
//                           />
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>

//           </div>
//         </div>

//         {/* ─── HOLIDAY TABLE ─── */}
//         <div className="mb-6 overflow-hidden bg-white rounded-xl shadow-lg border border-gray-100">

//           {/* Table Filter Bar */}
//           <div className="p-3 border-b border-gray-200 bg-gray-50/50">
//             <div className="flex flex-wrap items-center gap-2">

//               {/* Search */}
//               <div className="relative flex-1 min-w-[180px]">
//                 <FaSearch className="absolute text-xs text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
//                 <input
//                   type="text"
//                   placeholder="Search holiday name..."
//                   value={tableSearch}
//                   onChange={(e) => setTableSearch(e.target.value)}
//                   className="w-full pl-7 pr-7 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
//                 />
//                 {tableSearch && (
//                   <FaTimes
//                     className="absolute text-xs text-gray-400 transform -translate-y-1/2 cursor-pointer right-2 top-1/2 hover:text-red-500"
//                     onClick={() => setTableSearch("")}
//                   />
//                 )}
//               </div>

//               {/* Month Filter */}
//               <select
//                 value={monthFilter}
//                 onChange={(e) => setMonthFilter(e.target.value)}
//                 className="h-7 px-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white text-gray-700"
//               >
//                 <option value="">All Months</option>
//                 {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => (
//                   <option key={i} value={i}>{m}</option>
//                 ))}
//               </select>

//               {/* Category filter tabs */}
//               <div className="flex flex-wrap items-center gap-1">
//                 {["All", ...CATEGORIES.map((c) => c.key)].map((key) => {
//                   const c = CATEGORIES.find((x) => x.key === key);
//                   const active = tableFilter === key;
//                   return (
//                     <button
//                       key={key}
//                       onClick={() => setTableFilter(key)}
//                       className={`h-7 px-2 text-[10px] font-bold rounded-md transition border ${
//                         active
//                           ? "bg-blue-600 text-white border-blue-600"
//                           : "bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200"
//                       }`}
//                     >
//                       {c?.label || "All"}
//                     </button>
//                   );
//                 })}
//               </div>

//               {/* Count */}
//               <div className="flex items-center gap-1 border border-blue-200 bg-blue-50 rounded-lg px-2 h-7 ml-auto">
//                 <span className="text-[10px] font-bold text-blue-600 uppercase">Found:</span>
//                 <span className="text-xs font-black text-blue-700">{tableListed.length}</span>
//               </div>

//               {/* Clear filters */}
//               {(tableSearch || monthFilter !== "" || tableFilter !== "All") && (
//                 <button
//                   onClick={() => { setTableSearch(""); setMonthFilter(""); setTableFilter("All"); }}
//                   className="h-7 px-3 text-[10px] font-bold text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition"
//                 >
//                   Clear
//                 </button>
//               )}
//             </div>
//           </div>

//           <div className="overflow-x-auto">
//             <table className="min-w-full text-left bg-white">
//               <thead className="text-sm font-semibold tracking-wide text-left text-white uppercase bg-gradient-to-r from-green-500 to-blue-600">
//                 <tr>
//                   <th className="px-3 py-3 text-center">#</th>
//                   <th className="px-3 py-3 text-center">Holiday / Occasion</th>
//                   <th className="px-3 py-3 text-center">Category</th>
//                   <th className="px-3 py-3 text-center">From Date</th>
//                   <th className="px-3 py-3 text-center">To Date</th>
//                   <th className="px-3 py-3 text-center">Days</th>
//                   {isAdmin && <th className="px-3 py-3 text-center">Actions</th>}
//                 </tr>
//               </thead>

//               <tbody className="bg-white divide-y divide-gray-200">
//                 {loading ? (
//                   <tr>
//                     <td colSpan={isAdmin ? 7 : 6} className="px-2 py-6 text-center">
//                       <div className="flex items-center justify-center gap-2">
//                         <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
//                         <span className="text-xs font-bold text-gray-400 tracking-widest">LOADING…</span>
//                       </div>
//                     </td>
//                   </tr>
//                 ) : tableListed.length > 0 ? (
//                   tableListed.map((hol, i) => {
//                     const c = catOf(hol.type);
//                     return (
//                       <tr key={hol._id} className="hover:bg-blue-50/50 transition-colors text-sm">
//                         <td className="px-3 py-3 text-center text-gray-500 font-bold border-b border-gray-100">
//                           {String(i + 1).padStart(2, "0")}
//                         </td>
//                         <td className="px-3 py-3 text-center font-medium text-gray-900 whitespace-nowrap border-b border-gray-100">
//                           <div className="flex items-center justify-center gap-2">
//                             <span className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: c.light, color: c.color }}>
//                               {c.icon}
//                             </span>
//                             {hol.name}
//                           </div>
//                         </td>
//                         <td className="px-3 py-3 text-center border-b border-gray-100">
//                           <span
//                             className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm"
//                             style={{ backgroundColor: c.light, color: c.color, border: `1px solid ${c.color}30` }}
//                           >
//                             {hol.type}
//                           </span>
//                         </td>
//                         <td className="px-3 py-3 text-center text-gray-600 font-medium border-b border-gray-100">
//                           {format(parseISO(hol.fromDate), "dd MMM yyyy")}
//                         </td>
//                         <td className="px-3 py-3 text-center text-gray-600 font-medium border-b border-gray-100">
//                           {format(parseISO(hol.toDate), "dd MMM yyyy")}
//                         </td>
//                         <td className="px-3 py-3 text-center border-b border-gray-100">
//                           <span className="px-2.5 py-1 bg-blue-100/50 text-blue-700 rounded-full text-[11px] font-bold shadow-sm border border-blue-200">
//                             {hol.totalDays} day{hol.totalDays > 1 ? "s" : ""}
//                           </span>
//                         </td>
//                         {isAdmin && (
//                           <td className="px-3 py-3 text-center whitespace-nowrap border-b border-gray-100">
//                             <div className="flex items-center justify-center gap-2">
//                               <button
//                                 onClick={() => openEditForm(hol)}
//                                 className="p-1 text-yellow-500 transition-colors hover:text-yellow-700"
//                                 title="Edit"
//                               >
//                                 <Edit2 size={13} />
//                               </button>
//                               <button
//                                 onClick={() => handleDelete(hol._id)}
//                                 className="p-1 text-red-500 transition-colors hover:text-red-700"
//                                 title="Delete"
//                               >
//                                 <Trash2 size={13} />
//                               </button>
//                             </div>
//                           </td>
//                         )}
//                       </tr>
//                     );
//                   })
//                 ) : (
//                   <tr>
//                     <td colSpan={isAdmin ? 7 : 6} className="px-2 py-8 text-center text-xs text-gray-500 font-bold">
//                       No holidays found.{isAdmin && " Click any date on the calendar to add one!"}
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default HolidaysCalendar;


import axios from "axios";
import {
  differenceInDays,
  format,
  isWithinInterval,
  parseISO,
  startOfDay,
} from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  Building,
  Edit2,
  Info,
  Save,
  Star,
  Sun,
  Trash2,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { FaCalendarAlt, FaSearch, FaSync, FaTimes } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_BASE_URL } from "../config";

/* ─── Category Config ─── */
const CATEGORIES = [
  { key: "Festival",          label: "Festival",         color: "#F97316", light: "#FFF7ED", icon: <Award size={12} /> },
  { key: "National Holiday",  label: "National Holiday", color: "#10B981", light: "#ECFDF5", icon: <Sun size={12} /> },
  { key: "Company Holiday",   label: "Company Holiday",  color: "#6366F1", light: "#EEF2FF", icon: <Building size={12} /> },
  { key: "Observance",        label: "Observance",       color: "#8B5CF6", light: "#F5F3FF", icon: <Star size={12} /> },
  { key: "Restricted Holiday",label: "Restricted",       color: "#EC4899", light: "#FDF2F8", icon: <Info size={12} /> },
];

const catOf = (type) => CATEGORIES.find((c) => c.key === type) || CATEGORIES[0];

const tileClass = {
  "Festival":          "tile-festival",
  "National Holiday":  "tile-national",
  "Company Holiday":   "tile-company",
  "Observance":        "tile-observance",
  "Restricted Holiday":"tile-restricted",
};

/* ─────────────────────────────────────── */
const PRESET_HOLIDAYS_2026 = [
  { date: "2026-01-14", name: "Makar Sankranti", type: "Festival", isClosed: true },
  { date: "2026-01-26", name: "Republic Day", type: "National Holiday", isClosed: true },
  { date: "2026-03-04", name: "Holi", type: "Festival", isClosed: true },
  { date: "2026-03-21", name: "Id-Ul-Fitr", type: "Festival", isClosed: true },
  { date: "2026-03-31", name: "Mahavir Jayanti", type: "Festival", isClosed: true },
  { date: "2026-04-03", name: "Good Friday", type: "Festival", isClosed: true },
  { date: "2026-05-01", name: "Budha Purnima", type: "Festival", isClosed: true },
  { date: "2026-05-27", name: "Id-Ul-Zuha", type: "Festival", isClosed: true },
  { date: "2026-06-26", name: "Muharram", type: "Festival", isClosed: true },
  { date: "2026-08-15", name: "Independence Day", type: "National Holiday", isClosed: true },
  { date: "2026-08-26", name: "Id-e-Milad", type: "Festival", isClosed: true },
  { date: "2026-09-04", name: "Janmashtami", type: "Festival", isClosed: true },
  { date: "2026-10-02", name: "Gandhi Jayanti", type: "National Holiday", isClosed: true },
  { date: "2026-10-20", name: "Dussehra", type: "Festival", isClosed: true },
  { date: "2026-11-08", name: "Diwali", type: "Festival", isClosed: true },
  { date: "2026-11-24", name: "Guru Nanak Jynti", type: "Festival", isClosed: true },
  { date: "2026-12-25", name: "Christmas Day", type: "Festival", isClosed: true },
  { date: "2026-01-01", name: "New Year Day", type: "Restricted Holiday" },
  { date: "2026-01-03", name: "Hazarat Ali's Birthday", type: "Restricted Holiday" },
  { date: "2026-01-14", name: "Magha Bihu/Pongal", type: "Restricted Holiday" },
  { date: "2026-01-23", name: "Basant Panchmi", type: "Restricted Holiday" },
  { date: "2026-02-01", name: "Guru Ravidas Birthday", type: "Restricted Holiday" },
  { date: "2026-02-12", name: "Dayanand Saraswati Bdy", type: "Restricted Holiday" },
  { date: "2026-02-15", name: "Maha Shivratri", type: "Restricted Holiday" },
  { date: "2026-02-19", name: "Shivaji Jayanti", type: "Restricted Holiday" },
  { date: "2026-03-03", name: "Holika Dahan", type: "Restricted Holiday" },
  { date: "2026-03-03", name: "Dolyatra", type: "Restricted Holiday" },
  { date: "2026-03-19", name: "Cheti Chand", type: "Restricted Holiday" },
  { date: "2026-03-20", name: "Jamat Ul Vida", type: "Restricted Holiday" },
  { date: "2026-03-26", name: "Ram Navmi", type: "Restricted Holiday" },
  { date: "2026-04-05", name: "Easter Sunday", type: "Restricted Holiday" },
  { date: "2026-04-14", name: "Meshadi (Tamilnadu)", type: "Restricted Holiday" },
  { date: "2026-04-15", name: "Vaisakhadi/Bahag Bihu", type: "Restricted Holiday" },
  { date: "2026-05-09", name: "Rabindranath Tagore Bdy", type: "Restricted Holiday" },
  { date: "2026-07-16", name: "Rath Yatra", type: "Restricted Holiday" },
  { date: "2026-08-15", name: "Parsi New Year", type: "Restricted Holiday" },
  { date: "2026-08-26", name: "Onam", type: "Restricted Holiday" },
  { date: "2026-08-28", name: "Raksha Bandhan", type: "Restricted Holiday" },
  { date: "2026-09-14", name: "Ganesh Chaturti", type: "Restricted Holiday" },
  { date: "2026-10-18", name: "Maha Saptami", type: "Restricted Holiday" },
  { date: "2026-10-19", name: "Maha Astami", type: "Restricted Holiday" },
  { date: "2026-10-20", name: "Maha Navmi", type: "Restricted Holiday" },
  { date: "2026-10-26", name: "Maharshi Valmiki B'day", type: "Restricted Holiday" },
  { date: "2026-10-29", name: "Karka Chaturthi", type: "Restricted Holiday" },
  { date: "2026-11-08", name: "Naraka Chaturdarsi", type: "Restricted Holiday" },
  { date: "2026-11-09", name: "Govardhan Puja", type: "Restricted Holiday" },
  { date: "2026-11-11", name: "Bhai Duj", type: "Restricted Holiday" },
  { date: "2026-11-15", name: "Chhat Puja", type: "Restricted Holiday" },
  { date: "2026-11-24", name: "G.Teb Bahadur Martyrdom", type: "Restricted Holiday" },
  { date: "2026-12-23", name: "Hazrat Ali's Birthday", type: "Restricted Holiday" },
  { date: "2026-12-24", name: "Christmas Evening", type: "Restricted Holiday" }
];

/* ─────────────────────────────────────── */
const HolidaysCalendar = ({ isEmployeeView = false }) => {
  const isAdmin = !isEmployeeView;

  const [holidays,   setHolidays]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [filter,     setFilter]     = useState("All");
  const [search,     setSearch]     = useState("");
  const [calDate,    setCalDate]    = useState(new Date());
  const [showForm,   setShowForm]   = useState(false);
  const [editingId,  setEditingId]  = useState(null);

  const [tableSearch, setTableSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [tableFilter, setTableFilter] = useState("All");
  const [stateFilter, setStateFilter] = useState("All States");
  const [activeLabelYear, setActiveLabelYear] = useState(new Date().getFullYear());

  const INDIAN_STATES = [
    "All States", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", 
    "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", 
    "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", 
    "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", 
    "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"
  ];

  const [form, setForm] = useState({
    name: "",
    fromDate: format(new Date(), "yyyy-MM-dd"),
    toDate:   format(new Date(), "yyyy-MM-dd"),
    type:     "Festival",
    state:    "All States"
  });

  /* ─── Fetch ─── */
  const fetchHolidays = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE_URL}/holidays/all`);
      const fetchedHolidays = Array.isArray(data) ? data : [];
      
      let merged = [...fetchedHolidays];
      PRESET_HOLIDAYS_2026.forEach(preset => {
        const exists = fetchedHolidays.find(h => 
          h.fromDate === preset.date && 
          h.name.toLowerCase() === preset.name.toLowerCase()
        );
        if (!exists) {
          merged.push({
            _id: `preset-${preset.date}-${preset.name}`,
            name: preset.name,
            fromDate: preset.date,
            toDate: preset.date,
            type: preset.type,
            state: "All States",
            isActive: null,
            totalDays: 1,
            isPreset: true
          });
        }
      });
      merged.sort((a, b) => new Date(a.fromDate) - new Date(b.fromDate));
      
      setHolidays(merged);
    } catch {
      toast.error("Failed to load holidays");
    } finally {
      setLoading(false);
    }
  }, [isEmployeeView]);

  useEffect(() => { fetchHolidays(); }, [fetchHolidays]);

  /* ─── Calendar tile colouring ─── */
  const getTileClass = ({ date, view }) => {
    if (view !== "month") return null;
    
    // Add Sunday class if it's Sunday
    const isSunday = date.getDay() === 0;
    const sundayClass = isSunday ? "sunday-tile" : "";
    
    return sundayClass || null;
  };

  /* --- Tile Content (Holiday Names) --- */
  const getTileContent = ({ date, view }) => {
    if (view !== "month") return null;
    // Find all holidays for this day to allow multiple labels
    const matches = holidays.filter((h) => {
      try {
        if (stateFilter !== "All States" && h.state !== "All States" && h.state !== stateFilter) return false;
        return isWithinInterval(startOfDay(date), {
          start: startOfDay(parseISO(h.fromDate)),
          end:   startOfDay(parseISO(h.toDate)),
        });
      } catch { return false; }
    });

    if (matches.length > 0) {
      return (
        <div className="flex flex-col gap-[1px] mt-0.5 overflow-hidden w-full items-center">
          {matches.map((match, idx) => {
            if (idx > 1) return null; // limit to 2 to prevent overflow
            const c = catOf(match.type);
            return (
              <div 
                key={match._id || idx}
                className={`text-[8px] leading-tight truncate flex items-center justify-center gap-0.5 w-[90%] max-w-[36px] ${match.isActive === false ? 'line-through opacity-60' : ''}`}
                style={{ color: c.color }}
                title={match.name}
              >
                <div className="min-w-[2px] h-[8px] rounded-sm flex-shrink-0" style={{ backgroundColor: c.color }} />
                <span className="truncate">{match.name.split(" ")[0]}</span>
              </div>
            );
          })}
          {matches.length > 2 && (
            <div className="text-[7px] text-gray-500 font-bold leading-none">+{matches.length - 2}</div>
          )}
        </div>
      );
    }
    return null;
  };

  /* ─── Date click ─── */
  const onDayClick = (date) => {
    setCalDate(date);
    if (!isAdmin) return;
    const existing = holidays.find((h) => {
      try {
        return isWithinInterval(startOfDay(date), {
          start: startOfDay(parseISO(h.fromDate)),
          end:   startOfDay(parseISO(h.toDate)),
        });
      } catch { return false; }
    });
    if (existing) {
      setEditingId(existing._id);
      setForm({
        name:     existing.name,
        fromDate: format(parseISO(existing.fromDate), "yyyy-MM-dd"),
        toDate:   format(parseISO(existing.toDate),   "yyyy-MM-dd"),
        type:     existing.type || "Festival",
        state:    existing.state || "All States",
      });
    } else {
      setEditingId(null);
      setForm({ name: "", fromDate: format(date, "yyyy-MM-dd"), toDate: format(date, "yyyy-MM-dd"), type: "Festival", state: "All States" });
    }
    setShowForm(true);
  };

  const openNewForm = () => {
    setEditingId(null);
    setForm({ name: "", fromDate: format(new Date(), "yyyy-MM-dd"), toDate: format(new Date(), "yyyy-MM-dd"), type: "Festival", state: "All States" });
    setShowForm(true);
  };

  const openEditForm = (hol) => {
    setEditingId(hol._id);
    setForm({
      name:     hol.name,
      fromDate: format(parseISO(hol.fromDate), "yyyy-MM-dd"),
      toDate:   format(parseISO(hol.toDate),   "yyyy-MM-dd"),
      type:     hol.type || "Festival",
      state:    hol.state || "All States",
    });
    setShowForm(true);
  };

  /* ─── Save ─── */
  const handleSave = async (e) => {
    e.preventDefault();
    if (new Date(form.fromDate) > new Date(form.toDate)) {
      toast.error("'From' date cannot be after 'To' date");
      return;
    }
    try {
      setSaving(true);
      const payload = {
        ...form,
        totalDays: differenceInDays(parseISO(form.toDate), parseISO(form.fromDate)) + 1,
      };
      if (editingId && !String(editingId).startsWith("preset-")) {
        await axios.put(`${API_BASE_URL}/holidays/${editingId}`, payload);
        toast.success("Holiday updated!");
      } else {
        await axios.post(`${API_BASE_URL}/holidays/add`, payload);
        toast.success(`✅ ${form.name} saved to calendar!`);
      }
      setShowForm(false);
      setEditingId(null);
      fetchHolidays();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  /* ─── Delete ─── */
  const handleDelete = async (id) => {
    if (!window.confirm("Remove this holiday?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/holidays/${id}`);
      toast.success("Holiday removed");
      setShowForm(false);
      fetchHolidays();
    } catch {
      toast.error("Failed to delete");
    }
  };

  /* ─── Toggle Active ─── */
  const handleToggleActive = async (hol) => {
    if (!isAdmin) return;
    try {
      const newStatus = hol.isActive === false ? true : false;
      const confirmStr = newStatus ? "give" : "skip";
      if (!window.confirm(`Are you sure you want to ${confirmStr} this holiday?`)) return;
      
      if (hol.isPreset) {
        const payload = {
          name: hol.name,
          fromDate: hol.fromDate,
          toDate: hol.toDate,
          type: hol.type,
          state: hol.state,
          isActive: newStatus,
          totalDays: hol.totalDays
        };
        await axios.post(`${API_BASE_URL}/holidays/add`, payload);
      } else {
        await axios.put(`${API_BASE_URL}/holidays/${hol._id}`, { isActive: newStatus });
      }
      toast.success(`Holiday ${newStatus ? "will be given" : "skipped"}`);
      fetchHolidays();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  /* ─── Filtered list ─── */
  const stateFilteredHolidays = holidays.filter(h => stateFilter === "All States" || h.state === "All States" || h.state === stateFilter);

  // Filter primarily by the globally active year from the calendar view
  const yearFilteredHolidays = stateFilteredHolidays.filter(h => {
    try { return new Date(h.fromDate).getFullYear() === activeLabelYear; } catch { return false; }
  });

  // Define stats collection based exclusively on the active year (and approved status for employee view)
  let statsHolidays = yearFilteredHolidays;
  if (isEmployeeView) {
    statsHolidays = statsHolidays.filter(h => h.isActive === true || (!h.isPreset && h.isActive !== false));
  }

  const listed = yearFilteredHolidays
    .filter((h) => filter === "All" || h.type === filter)
    .filter((h) =>
      !search || h.name?.toLowerCase().includes(search.toLowerCase()) || h.type?.toLowerCase().includes(search.toLowerCase())
    );

  const tableListed = yearFilteredHolidays
    .filter((h) => tableFilter === "All" || h.type === tableFilter)
    .filter((h) => !tableSearch || h.name?.toLowerCase().includes(tableSearch.toLowerCase()))
    .filter((h) => monthFilter === "" || new Date(h.fromDate).getMonth().toString() === monthFilter)
    .filter((h) => !isEmployeeView || h.isActive === true || (!h.isPreset && h.isActive !== false));

  const totalDays = form.fromDate && form.toDate
    ? differenceInDays(parseISO(form.toDate), parseISO(form.fromDate)) + 1
    : 1;

  const selCat = catOf(form.type);

  /* ─────────── RENDER ─────────── */
  return (
    <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100 font-sans">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* ─── Calendar CSS ─── */}
      <style>{`
        .react-calendar{width:100%;border:none!important;border-radius:.5rem;padding:1rem;background:white;font-family:inherit;font-size:.8rem;}
        .react-calendar__navigation{margin-bottom:1rem;}
        .react-calendar__navigation button{font-weight:700!important;color:#1e293b!important;font-size:.875rem!important;border-radius:.375rem!important;min-width:36px;}
        .react-calendar__navigation button:hover,.react-calendar__navigation button:focus{background:#f1f5f9!important;}
        .react-calendar__month-view__weekdays__weekday{color:#94a3b8;font-weight:700;font-size:.6rem;letter-spacing:.1em;text-transform:uppercase;padding:.5rem 0;}
        .react-calendar__month-view__weekdays__weekday abbr{text-decoration:none!important;}
        .react-calendar__month-view__days__day--neighboringMonth{opacity:.25!important;}
        .react-calendar__tile{padding:.65rem .3rem;border-radius:.375rem!important;font-size:0.8rem;font-weight:500;color:#475569;position:relative;transition:all .12s;}
        .react-calendar__tile > abbr { margin-bottom: 2px; }
        .react-calendar__tile:enabled:hover,.react-calendar__tile:enabled:focus{background:#f8fafc!important;color:#1d4ed8!important;}
        .react-calendar__tile--now{background:transparent!important;color:#2563eb!important;font-weight:900!important;}
        .react-calendar__tile--now > abbr { background:#2563eb; color:white; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
        .react-calendar__tile--active,.react-calendar__tile--active:enabled:hover{background:#f1f5f9!important;color:#0f172a!important;}
        .react-calendar__tile--active > abbr { background:#0f172a; color:white; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }

        /* Sunday styling - Red color for Sunday dates */
        .sunday-tile {
          color: #dc2626 !important;
          font-weight: 600 !important;
        }
        
        /* Keep Sunday red even when hovered */
        .react-calendar__tile:enabled:hover.sunday-tile {
          color: #dc2626 !important;
        }
        
      `}</style>

      <div className="mx-auto max-w-9xl">

        {/* ─── TOP HEADER BAR ─── */}
        <div className="p-4 mb-4 rounded-2xl shadow-md flex items-center justify-between overflow-hidden relative bg-gradient-to-r from-[#2cb89d] via-teal-500 to-[#1f68e0] border border-transparent">
          {/* UI Decals */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl transform translate-x-10 -translate-y-10 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#1f68e0] opacity-30 rounded-full blur-xl transform -translate-x-5 translate-y-5 pointer-events-none"></div>
          
          <div className="relative z-10 flex items-center gap-3 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/40 shadow-inner">
              <FaCalendarAlt className="text-2xl text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-black tracking-widest text-white uppercase drop-shadow-md leading-tight">Holiday Calendar</h1>
              <p className="text-[10px] font-bold text-teal-50 tracking-[0.2em] uppercase opacity-90 drop-shadow-sm">Company Approved Festivals & Occasions</p>
            </div>
          </div>
          
          <div className="relative z-10 hidden sm:flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-[11px] font-black text-white shadow-inner flex items-center gap-2 uppercase tracking-widest">
              Year <span className="px-2 py-0.5 rounded-md bg-white text-[#1f68e0] font-black shadow-sm">{activeLabelYear}</span>
            </div>
            {isAdmin && (
              <div className="flex items-center gap-3 pl-3 border-l border-white/20">
                <button
                  onClick={() => { fetchHolidays(); }}
                  className="flex items-center justify-center w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 rounded-lg text-white transition disabled:opacity-50"
                  title="Sync Data"
                  disabled={loading}
                >
                  <FaSync className={`text-[12px] ${loading ? "animate-spin" : ""}`} />
                </button>
                <button
                  onClick={openNewForm}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-[11px] font-black text-white uppercase tracking-widest rounded-xl transition shadow-lg flex items-center gap-2 hover:scale-105 transform active:scale-95"
                >
                  <span className="text-[14px] leading-none">+</span> Add Holiday
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ─── MAIN GRID: Calendar + Form on left, Sidebar on right ─── */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 mb-3">

          {/* LEFT: Calendar */}
          <div className="lg:col-span-7 space-y-3">

            {/* Admin tip */}
            {isAdmin && !showForm && (
              <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm border border-blue-100 text-xs text-blue-700 font-medium">
                <span>👆</span>
                <span>Click any <strong>date</strong> on the calendar below to mark it as a holiday</span>
              </div>
            )}

            {/* Calendar Card */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
              <Calendar
                onClickDay={onDayClick}
                value={calDate}
                onActiveStartDateChange={({ activeStartDate }) => {
                  setCalDate(activeStartDate);
                  setActiveLabelYear(activeStartDate.getFullYear());
                }}
                tileClassName={getTileClass}
                tileContent={getTileContent}
                next2Label={null}
                prev2Label={null}
              />
              {/* Color Legend */}
              <div className="px-4 pb-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-gray-100 pt-2">
                {CATEGORIES.map((c) => (
                  <span key={c.key} className="flex items-center gap-1 text-[10px] font-bold" style={{ color: c.color }}>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                    {c.label}
                  </span>
                ))}
                <span className="flex items-center gap-1 text-[10px] font-bold text-red-500">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Sunday
                </span>
              </div>
            </div>

            {/* Inline Form */}
            <AnimatePresence>
              {showForm && isAdmin && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden border border-blue-200"
                >
                  {/* Form header */}
                  <div
                    className="px-4 py-3 flex items-center justify-between"
                    style={{ backgroundColor: selCat.light }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: selCat.color, color: "white" }}
                      >
                        {selCat.icon}
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: selCat.color }}>
                          {editingId ? "Edit Holiday" : "New Holiday"}
                        </p>
                        <p className="text-sm font-black text-gray-800">
                          {format(calDate, "MMMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 transition">
                      <XCircle size={18} />
                    </button>
                  </div>

                  <form onSubmit={handleSave} className="p-4 space-y-3">
                    {/* Name */}
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">
                        Occasion / Holiday Name *
                      </label>
                      <input
                        required
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder='e.g. "Good Friday", "Diwali", "Independence Day"…'
                        className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 focus:border-blue-500 rounded-lg font-semibold text-gray-800 outline-none transition"
                      />
                    </div>

                    {/* State */}
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">
                        State *
                      </label>
                      <select
                        value={form.state}
                        onChange={(e) => setForm({ ...form, state: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 focus:border-blue-500 rounded-lg font-semibold text-gray-800 outline-none transition"
                      >
                        {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">
                        Category *
                      </label>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                        {CATEGORIES.map((c) => (
                          <button
                            key={c.key}
                            type="button"
                            onClick={() => setForm({ ...form, type: c.key })}
                            className="flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider border-2 transition"
                            style={
                              form.type === c.key
                                ? { backgroundColor: c.color, color: "white", borderColor: c.color }
                                : { backgroundColor: c.light, color: c.color, borderColor: c.light }
                            }
                          >
                            {c.icon} {c.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">From *</label>
                        <input
                          required type="date"
                          value={form.fromDate}
                          onChange={(e) => setForm({ ...form, fromDate: e.target.value })}
                          className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 focus:border-blue-500 rounded-lg font-semibold outline-none transition"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">To *</label>
                        <input
                          required type="date"
                          value={form.toDate}
                          min={form.fromDate}
                          onChange={(e) => setForm({ ...form, toDate: e.target.value })}
                          className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 focus:border-blue-500 rounded-lg font-semibold outline-none transition"
                        />
                      </div>
                    </div>

                    {/* Preview */}
                    <div
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold"
                      style={{ backgroundColor: selCat.light, color: selCat.color }}
                    >
                      {selCat.icon}
                      <span>{form.name || "Holiday"} ({form.state}) · <strong>{totalDays}</strong> day{totalDays > 1 ? "s" : ""}</span>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2 pt-1">
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-600 text-white text-xs font-black rounded-lg hover:bg-blue-700 disabled:opacity-60 transition"
                      >
                        <Save size={13} />
                        {saving ? "Saving…" : editingId ? "Update Holiday" : "Save to Calendar"}
                      </button>
                      {editingId && (
                        <button
                          type="button"
                          onClick={() => handleDelete(editingId)}
                          className="px-3 py-2 text-xs text-red-500 border border-red-200 font-black rounded-lg hover:bg-red-50 transition"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="px-3 py-2 text-xs text-gray-400 border border-gray-200 font-black rounded-lg hover:bg-gray-50 transition"
                      >
                        <XCircle size={13} />
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT: Sidebar */}
          <div className="lg:col-span-5 space-y-3">

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-2">
              <div className="px-3 py-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg text-white shadow-md flex items-center justify-between">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/70">Total Holidays</p>
                <h3 className="text-xl font-black">{statsHolidays.length}</h3>
              </div>
              <div className="px-3 py-2 bg-white rounded-lg border border-gray-100 shadow-md flex items-center justify-between">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Upcoming</p>
                <h3 className="text-xl font-black text-green-600">
                  {statsHolidays.filter((h) => { try { return parseISO(h.fromDate) >= startOfDay(new Date()); } catch { return false; } }).length}
                </h3>
              </div>
            </div>

            {/* Category breakdown */}
            <div className="bg-white rounded-lg shadow-md p-3">
              <h3 className="text-xs font-black text-gray-700 uppercase tracking-widest mb-3">By Category</h3>
              <div className="space-y-2">
                {CATEGORIES.map((c) => {
                  const count = statsHolidays.filter((h) => h.type === c.key).length;
                  return (
                    <div key={c.key} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: c.light, color: c.color }}>
                        {c.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-0.5">
                          <span className="text-[10px] font-bold text-gray-600">{c.label}</span>
                          <span className="text-[10px] font-black" style={{ color: c.color }}>{count}</span>
                        </div>
                        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: statsHolidays.length ? `${(count / statsHolidays.length) * 100}%` : "0%", backgroundColor: c.color }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* ─── HOLIDAY TABLE ─── */}
        <div className="mb-6 overflow-hidden bg-white rounded-xl shadow-lg border border-gray-100">

          {/* Table Filter Bar */}
          <div className="p-3 border-b border-gray-200 bg-gray-50/50">
            <div className="flex flex-wrap items-center gap-2">

              {/* Search */}
              <div className="relative flex-1 min-w-[180px]">
                <FaSearch className="absolute text-xs text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
                <input
                  type="text"
                  placeholder="Search holiday name..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  className="w-full pl-7 pr-7 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                />
                {tableSearch && (
                  <FaTimes
                    className="absolute text-xs text-gray-400 transform -translate-y-1/2 cursor-pointer right-2 top-1/2 hover:text-red-500"
                    onClick={() => setTableSearch("")}
                  />
                )}
              </div>

              {/* Month Filter */}
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="h-7 px-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white text-gray-700"
              >
                <option value="">All Months</option>
                {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => (
                  <option key={i} value={i}>{m}</option>
                ))}
              </select>

              {/* Category filter tabs */}
              <div className="flex flex-wrap items-center gap-1">
                {["All", ...CATEGORIES.map((c) => c.key)].map((key) => {
                  const c = CATEGORIES.find((x) => x.key === key);
                  const active = tableFilter === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setTableFilter(key)}
                      className={`h-7 px-2 text-[10px] font-bold rounded-md transition border ${
                        active
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200"
                      }`}
                    >
                      {c?.label || "All"}
                    </button>
                  );
                })}
              </div>

              {/* Count */}
              <div className="flex items-center gap-1 border border-blue-200 bg-blue-50 rounded-lg px-2 h-7 ml-auto">
                <span className="text-[10px] font-bold text-blue-600 uppercase">Found:</span>
                <span className="text-xs font-black text-blue-700">{tableListed.length}</span>
              </div>

              {/* Clear filters */}
              {(tableSearch || monthFilter !== "" || tableFilter !== "All") && (
                <button
                  onClick={() => { setTableSearch(""); setMonthFilter(""); setTableFilter("All"); }}
                  className="h-7 px-3 text-[10px] font-bold text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left bg-white">
              <thead className="text-sm font-semibold tracking-wide text-left text-white uppercase bg-gradient-to-r from-green-500 to-blue-600">
                <tr>
                  <th className="px-3 py-3 text-center">#</th>
                  <th className="px-3 py-3 text-center">Holiday / Occasion</th>
                  <th className="px-3 py-3 text-center">Category</th>
                  <th className="px-3 py-3 text-center">State</th>
                  <th className="px-3 py-3 text-center">From Date</th>
                  <th className="px-3 py-3 text-center">To Date</th>
                  <th className="px-3 py-3 text-center">Days</th>
                  {isAdmin && <th className="px-3 py-3 text-center">Given</th>}
                  {isAdmin && <th className="px-3 py-3 text-center">Actions</th>}
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={isAdmin ? 9 : 7} className="px-2 py-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-bold text-gray-400 tracking-widest">LOADING…</span>
                      </div>
                    </td>
                  </tr>
                ) : tableListed.length > 0 ? (
                  tableListed.map((hol, i) => {
                    const c = catOf(hol.type);
                    return (
                      <tr key={hol._id} className="hover:bg-blue-50/50 transition-colors text-sm">
                        <td className="px-3 py-3 text-center text-gray-500 font-bold border-b border-gray-100">
                          {String(i + 1).padStart(2, "0")}
                        </td>
                        <td className="px-3 py-3 text-center font-medium text-gray-900 whitespace-nowrap border-b border-gray-100">
                          <div className="flex items-center justify-center gap-2">
                            <span className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: c.light, color: c.color }}>
                              {c.icon}
                            </span>
                            {hol.name}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center border-b border-gray-100">
                          <span
                            className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm"
                            style={{ backgroundColor: c.light, color: c.color, border: `1px solid ${c.color}30` }}
                          >
                            {hol.type}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center text-[10px] font-bold text-gray-600 border-b border-gray-100">
                          {hol.state || "All States"}
                        </td>
                        <td className="px-3 py-3 text-center text-gray-600 font-medium border-b border-gray-100">
                          {format(parseISO(hol.fromDate), "dd MMM yyyy")}
                        </td>
                        <td className="px-3 py-3 text-center text-gray-600 font-medium border-b border-gray-100">
                          {format(parseISO(hol.toDate), "dd MMM yyyy")}
                        </td>
                        <td className="px-3 py-3 text-center border-b border-gray-100">
                          <span className={`${hol.isActive === false ? 'bg-red-50 text-red-600 border-red-200' : 'bg-blue-100/50 text-blue-700 border-blue-200'} px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm border`}>
                            {hol.totalDays} day{hol.totalDays > 1 ? "s" : ""}
                          </span>
                        </td>
                        {isAdmin && (
                          <td className="px-3 py-3 text-center border-b border-gray-100">
                            <button
                              onClick={() => handleToggleActive(hol)}
                              className={`px-2 py-1 text-[10px] font-bold rounded-md transition ${hol.isActive === false ? 'bg-red-100 text-red-700 hover:bg-red-200' : (hol.isActive === null ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-green-100 text-green-700 hover:bg-green-200')}`}
                            >
                              {hol.isActive === false ? "SKIPPED" : (hol.isActive === null ? "DECIDE" : "YES")}
                            </button>
                          </td>
                        )}
                        {isAdmin && (
                          <td className="px-3 py-3 text-center whitespace-nowrap border-b border-gray-100">
                            <div className="flex items-center justify-center gap-2">
                              {!hol.isPreset && (
                                <>
                                  <button
                                    onClick={() => openEditForm(hol)}
                                    className="p-1 text-yellow-500 transition-colors hover:text-yellow-700"
                                    title="Edit"
                                  >
                                    <Edit2 size={13} />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(hol._id)}
                                    className="p-1 text-red-500 transition-colors hover:text-red-700"
                                    title="Delete"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                ) : null}
              </tbody>
            </table>

            {!loading && tableListed.length === 0 && (
              <div className="flex flex-col items-center justify-center p-12 bg-white">
                <div className="w-20 h-20 mb-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center border border-blue-100 shadow-sm">
                  <span className="text-4xl text-blue-500">🏖️</span>
                </div>
                <h3 className="text-lg font-black text-gray-800 mb-1 tracking-wide uppercase">
                  No Holidays Found
                </h3>
                <p className="text-xs font-bold text-gray-500 text-center max-w-sm leading-relaxed">
                  {isAdmin 
                    ? "Click any date on the calendar above to declare a new holiday for your team!"
                    : "No company holidays have been declared at the moment. Please check back later!"}
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default HolidaysCalendar;