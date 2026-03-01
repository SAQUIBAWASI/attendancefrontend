import React from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaCheckCircle, FaClock, FaChartLine,
  FaArrowRight, FaBriefcase, FaCalendarAlt,
  FaVideo, FaMapMarkerAlt, FaClipboardList, FaEye, FaSync, FaInfoCircle
} from "react-icons/fa";

const getStatusColors = (status) => {
  switch (status) {
    case "Hired":
    case "Selected":
      return { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100", icon: "text-emerald-500" };
    case "Rejected":
      return { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-100", icon: "text-rose-500" };
    case "Assessment Shared":
      return { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-100", icon: "text-indigo-500" };
    case "Interview Scheduled":
      return { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100", icon: "text-blue-500" };
    default:
      return { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-100", icon: "text-slate-500" };
  }
};

const CandidateDashboard = () => {
  const { profile, appliedJobs = [], allJobs = [] } = useOutletContext();
  const navigate = useNavigate();

  const totalApps = appliedJobs.length;
  const activeApps = appliedJobs.filter(a => !["Rejected", "Withdrawn"].includes(a.status)).length;
  const hiredApps = appliedJobs.filter(a => ["Hired", "Selected"].includes(a.status)).length;
  const successRate = totalApps > 0 ? Math.round((hiredApps / totalApps) * 100) : 0;

  const pendingInterviews = appliedJobs.filter(a =>
    (a.interviewStatus === "Invited" || a.interviewStatus === "Rescheduled") &&
    a.candidateInterviewStatus === "Pending"
  );

  const recentActivity = [...appliedJobs]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 10);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="w-full min-h-screen bg-transparent p-4 md:p-6 lg:p-8 space-y-8 animate-in fade-in duration-700"
    >
      {/* ── Sleek Header Section (Matched to AllJobs) ── */}
      <div className="flex flex-col gap-4 mb-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex-shrink-0">
          <h2 className="text-xl font-black text-gray-900 tracking-tight">
            Welcome back, {profile?.name || "Candidate"} 👋
          </h2>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
            Portal Overview • {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-start xl:justify-end gap-3 w-full xl:w-auto">
          <button
            onClick={() => navigate("/all-jobs")}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-gray-200 hover:bg-blue-600 hover:shadow-blue-200 transition-all active:scale-95"
          >
            <FaBriefcase className="text-xs" /> Explore Jobs
          </button>

          <div className="bg-white px-4 py-2.5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{allJobs.length} Live Openings</span>
          </div>
        </div>
      </div>

      {/* ── Sleek Compact Stats Row (Navigation Cards) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "All Jobs", value: allJobs.length, icon: FaBriefcase, color: "blue", path: "/all-jobs" },
          { label: "Applied", value: appliedJobs.length, icon: FaClipboardList, color: "indigo", path: "/applied-jobs" },
          { label: "Interview", value: pendingInterviews.length, icon: FaVideo, color: "amber", path: "/interview" },
          { label: "Requests", value: appliedJobs.filter(a => a.status === "Assessment Shared").length, icon: FaSync, color: "emerald", path: "/letters" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(stat.path)}
            className="bg-white px-4 py-3 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md hover:border-blue-100 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gray-50 text-${stat.color}-600 group-hover:bg-${stat.color}-50 transition-colors`}>
                <stat.icon size={14} />
              </div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-gray-900 tracking-tight">{stat.value}</span>
              <FaArrowRight className="text-[10px] text-gray-200 group-hover:text-blue-500 transition-colors" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Pending Interviews Section (Strict UI Table Mode) ── */}
      {pendingInterviews.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              Interview Invitations
            </h3>
            <span className="text-[9px] font-black text-amber-600 uppercase tracking-[0.2em] bg-amber-50 px-3 py-1 rounded-full border border-amber-100">Action Required</span>
          </div>

          <div className="overflow-x-auto bg-white shadow-lg rounded-2xl border border-gray-100 overflow-hidden">
            <table className="min-w-full">
              <thead className="text-[10px] text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 uppercase tracking-[0.2em] font-black">
                <tr>
                  <th className="py-4 px-6">Position</th>
                  <th className="py-4 px-6">Schedule</th>
                  <th className="py-4 px-6">Mode</th>
                  <th className="py-4 px-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pendingInterviews.map((app) => (
                  <tr key={app._id} className="group hover:bg-slate-50/80 transition-all duration-300">
                    <td className="py-4 px-6 text-center text-xs font-black text-gray-900 uppercase tracking-tight">
                      {app.jobId?.role || "Position Update"}
                    </td>
                    <td className="py-4 px-6 text-center text-[10px] font-black text-gray-500 uppercase">
                      <div className="flex items-center justify-center gap-2">
                        <FaClock className="text-gray-300" />
                        {new Date(app.interviewTime).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-block px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-gray-100 ${app.interviewMode === "online" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"}`}>
                        {app.interviewMode}
                      </span>
                    </td>
                    <td className="py-4 px-8 text-center">
                      <button
                        onClick={() => navigate("/interview")}
                        className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-md hover:bg-indigo-700 transition-all active:scale-95 group-hover:translate-x-1"
                      >
                        Confirm Invite <FaArrowRight className="text-xs" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Recent Activity Feed (Strict Table Style) ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Application Status Tracker
          </h3>
          <button
            onClick={() => navigate("/applied-jobs")}
            className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
          >
            Detailed History →
          </button>
        </div>

        <div className="overflow-x-auto bg-white shadow-xl rounded-3xl border border-gray-100 overflow-hidden">
          {recentActivity.length > 0 ? (
            <table className="min-w-full">
              <thead className="text-[10px] text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 uppercase tracking-[0.2em] font-black text-center">
                <tr>
                  <th className="py-4 px-8">Opportunity</th>
                  <th className="py-4 px-6">Current Status</th>
                  <th className="py-4 px-6">Last Update</th>
                  <th className="py-4 px-6">Progress</th>
                  <th className="py-4 px-8">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentActivity.map((activity) => {
                  const style = getStatusColors(activity.status);
                  return (
                    <tr key={activity._id} className="group hover:bg-blue-50/30 transition-all duration-300">
                      <td className="py-5 px-8 text-center text-xs font-black text-gray-900 uppercase tracking-tight leading-tight">
                        {activity.jobId?.role || "Position Update"}
                        {activity.jobId?.department && (
                          <span className="block text-[8px] text-blue-600 mt-1 uppercase tracking-[0.2em] font-bold">
                            {activity.jobId.department}
                          </span>
                        )}
                      </td>
                      <td className="py-5 px-6 text-center">
                        <span className={`inline-block px-3 py-1 ${style.bg} ${style.text} text-[10px] font-black rounded-lg border ${style.border} uppercase tracking-wider`}>
                          {activity.status}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-center text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                        {new Date(activity.updatedAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-5 px-6 text-center w-40">
                        <div className="flex items-center gap-3 justify-center">
                          <div className="h-1 flex-1 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: activity.status === "Hired" ? "100%" : "60%" }}
                              className={`h-full bg-gradient-to-r ${style.icon.replace('text-', 'from-').replace('500', '400')} to-transparent`}
                            />
                          </div>
                          <span className="text-[9px] font-black text-gray-400 uppercase">Match</span>
                        </div>
                      </td>
                      <td className="py-5 px-8 text-center">
                        <button
                          onClick={() => navigate("/applied-jobs")}
                          className="p-2.5 bg-gray-50 text-gray-400 hover:bg-indigo-600 hover:text-white rounded-xl transition-all shadow-sm border border-gray-100 group-hover:scale-105"
                          title="View Details"
                        >
                          <FaEye size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-20 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-[1.5rem] flex items-center justify-center text-gray-200 mx-auto mb-4 border-2 border-dashed border-gray-100">
                <FaClipboardList size={24} />
              </div>
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">No Applications Tracked</h3>
              <p className="text-[10px] font-black text-gray-400 mt-2 uppercase tracking-widest">Start your journey by exploring open positions.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Footer Link (Matched to AllJobs) ── */}
      <div className="mt-8 flex items-center justify-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
        <FaInfoCircle className="text-blue-400" />
        Portal information is synced in real-time with the central recruitment system.
      </div>
    </motion.div>
  );
};

export default CandidateDashboard;
