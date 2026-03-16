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
      return { bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-200", icon: "text-emerald-500" };
    case "Rejected":
      return { bg: "bg-rose-100", text: "text-rose-800", border: "border-rose-200", icon: "text-rose-500" };
    case "Assessment Shared":
      return { bg: "bg-indigo-100", text: "text-indigo-800", border: "border-indigo-200", icon: "text-indigo-500" };
    case "Interview Scheduled":
      return { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200", icon: "text-blue-500" };
    default:
      return { bg: "bg-slate-100", text: "text-slate-800", border: "border-slate-200", icon: "text-slate-500" };
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
    <div className="min-h-screen p-4 md:p-6 lg:p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-9xl mx-auto space-y-8 animate-in fade-in duration-700"
      >
        {/* ── Sleek Header Section (Matched to AllJobs) ── */}
        <div className="flex flex-col gap-4 mb-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex-shrink-0">
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
              Welcome back, {profile?.name || "Candidate"} 👋
            </h2>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mt-1">
              Portal Overview • {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-start xl:justify-end gap-3 w-full xl:w-auto">
            <button
              onClick={() => navigate("/all-jobs")}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold uppercase tracking-wider shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
            >
              <FaBriefcase className="text-xs" /> Explore Jobs
            </button>

            <div className="bg-white px-4 py-2.5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{allJobs.length} Live Openings</span>
            </div>
          </div>
        </div>

        {/* ── Sleek Compact Stats Row (Navigation Cards) ── */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              className="bg-white px-4 py-2.5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md hover:border-blue-200 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gray-50 text-${stat.color}-600 group-hover:bg-${stat.color}-50 transition-colors`}>
                  <stat.icon size={14} />
                </div>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  {stat.label} <span className="text-gray-300 mx-1">:</span> <span className="text-gray-900 font-black">{stat.value}</span>
                </span>
              </div>
              <FaArrowRight className="text-[10px] text-gray-300 group-hover:text-blue-500 transition-colors" />
            </motion.div>
          ))}
        </div>

        {/* ── Pending Interviews Section (Strict UI Table Mode) ── */}
        {pendingInterviews.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-lg font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Interview Invitations
              </h3>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-4 py-1.5 rounded-full border border-amber-100 shadow-sm">Action Required</span>
            </div>

            <div className="overflow-hidden bg-white shadow-xl rounded-2xl border border-gray-100">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-green-500 to-blue-600 text-white text-center uppercase tracking-wider text-xs font-semibold">
                      <th className="py-2">Position</th>
                      <th className="py-2">Schedule</th>
                      <th className="py-2">Mode</th>
                      <th className="py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pendingInterviews.map((app) => (
                      <tr key={app._id} className="group hover:bg-gray-50 transition-all duration-300">
                        <td className="py-2 px-6 text-center text-sm font-semibold text-gray-800 uppercase tracking-tight">
                          {app.jobId?.role || "Position Update"}
                        </td>
                        <td className="py-2 px-6 text-center text-xs font-medium text-gray-600">
                          <div className="flex items-center justify-center gap-2">
                            <FaClock className="text-blue-400" />
                            {new Date(app.interviewTime).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                          </div>
                        </td>
                        <td className="py-2 px-6 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${app.interviewMode === "online" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-700 border-rose-100"}`}>
                            {app.interviewMode}
                          </span>
                        </td>
                        <td className="py-2 px-8 text-center">
                          <button
                            onClick={() => navigate("/interview")}
                            className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:bg-indigo-700 transition-all active:scale-95"
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
          </div>
        )}

        {/* ── Recent Activity Feed (Strict Table Style) ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Application Status Tracker
            </h3>
            <button
              onClick={() => navigate("/applied-jobs")}
              className="text-xs font-bold text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors"
            >
              Detailed History →
            </button>
          </div>

          <div className="overflow-hidden bg-white shadow-2xl rounded-3xl border border-gray-100">
            <div className="overflow-x-auto">
              {recentActivity.length > 0 ? (
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-green-500 to-blue-600 text-white text-center uppercase tracking-wider text-xs font-semibold">
                      <th className="py-2 px-8">Opportunity</th>
                      <th className="py-2 px-6">Current Status</th>
                      <th className="py-2 px-6">Last Update</th>
                      <th className="py-2 px-6">Progress</th>
                      <th className="py-2 px-8">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentActivity.map((activity) => {
                      const style = getStatusColors(activity.status);
                      return (
                        <tr key={activity._id} className="group hover:bg-indigo-50/20 transition-all duration-300">
                          <td className="py-2 px-8 text-center text-sm font-bold text-gray-800 uppercase tracking-tight leading-tight">
                            {activity.jobId?.role || "Position Update"}
                            {activity.jobId?.department && (
                              <span className="block text-[10px] text-blue-500 mt-1 uppercase tracking-widest font-semibold">
                                {activity.jobId.department}
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-6 text-center">
                            <span className={`inline-block px-4 py-1.5 ${style.bg} ${style.text} text-[10px] font-bold rounded-full border ${style.border} uppercase tracking-widest shadow-sm`}>
                              {activity.status}
                            </span>
                          </td>
                          <td className="py-2 px-6 text-center text-xs font-medium text-gray-500 uppercase tracking-tight">
                            {new Date(activity.updatedAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="py-2 px-6 text-center w-48">
                            <div className="flex items-center gap-3 justify-center px-4">
                              <div className="h-2 flex-1 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: activity.status === "Hired" ? "100%" : "60%" }}
                                  className={`h-full bg-gradient-to-r ${style.icon.replace('text-', 'from-').replace('500', '400')} to-blue-400`}
                                />
                              </div>
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Match</span>
                            </div>
                          </td>
                          <td className="py-2 px-8 text-center">
                            {activity.jobId && (
                              (() => {
                                const assessmentIds = activity.jobId.assessmentIds || [];
                                const completedQuizIds = activity.assessmentResults?.map(res => (res.quizId?._id || res.quizId)?.toString()) || [];
                                
                                const pendingAssessments = assessmentIds.filter(id => {
                                  const sid = (id._id || id).toString();
                                  return !completedQuizIds.includes(sid);
                                });

                                if (assessmentIds.length === 0) {
                                  return (
                                    <button
                                      onClick={() => navigate("/applied-jobs")}
                                      className="p-1.5 bg-white text-blue-500 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-md border border-gray-100 flex items-center justify-center mx-auto"
                                      title="View Details"
                                    >
                                      <FaEye size={14} />
                                    </button>
                                  );
                                }

                                if (pendingAssessments.length === 0) {
                                  return (
                                    <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold uppercase tracking-wider border border-emerald-100 whitespace-nowrap shadow-sm">
                                      <FaCheckCircle className="text-emerald-500" /> All Completed
                                    </div>
                                  );
                                }

                                return (
                                  <div className="flex flex-col gap-2 items-center">
                                    {pendingAssessments.map((assessment, idx) => {
                                      const quizId = (assessment._id || assessment).toString();
                                      const quizTitle = assessment.title || (assessmentIds.length > 1 ? `Quiz ${idx + 1}` : "Quiz");

                                      return (
                                        <button
                                          key={quizId}
                                          onClick={() => navigate(`/assessment/${activity.jobId._id}/${activity._id}/${quizId}`)}
                                          className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:bg-blue-700 transition-all active:scale-95 whitespace-nowrap min-w-[140px]"
                                        >
                                          Take {quizTitle}
                                        </button>
                                      );
                                    })}
                                    {completedQuizIds.length > 0 && (
                                      <div className="text-[9px] font-bold text-emerald-600 uppercase tracking-tight">
                                        {completedQuizIds.length}/{assessmentIds.length} Done
                                      </div>
                                    )}
                                  </div>
                                );
                              })()
                            )}
                          </td>   
                          {/* </td> */}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="p-24 text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-300 mx-auto mb-6 border-2 border-dashed border-gray-200">
                    <FaClipboardList size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 uppercase tracking-widest">No Applications Tracked</h3>
                  <p className="text-xs font-medium text-gray-400 mt-2 uppercase tracking-widest">Start your journey by exploring open positions.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Footer Link (Matched to AllJobs) ── */}
        <div className="mt-12 flex items-center justify-center gap-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
          <FaInfoCircle className="text-blue-400" />
          Portal information is synced in real-time with the central recruitment system.
        </div>
      </motion.div>
    </div>
  );
};


export default CandidateDashboard;
