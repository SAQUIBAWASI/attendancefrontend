import React, { useState, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";
import {
  FaCalendarAlt, FaClock, FaCheck, FaTimes, FaInbox,
  FaSearch, FaSync, FaVideo, FaMapMarkerAlt, FaBriefcase,
  FaCheckCircle, FaTimesCircle
} from "react-icons/fa";

const Interview = () => {
  const { appliedJobs, searchQuery: globalSearchQuery, fetchDashboardData } = useOutletContext();

  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [confirmingId, setConfirmingId] = useState(null);
  const statusDropdownRef = useRef(null);

  // Filter applications that have an interview invitation
  const interviewApps = appliedJobs.filter(app =>
    app.interviewStatus === "Invited" || app.interviewStatus === "Rescheduled"
  );

  const statuses = ["Pending", "Confirmed", "Declined"];

  const filteredApps = interviewApps.filter(app => {
    const combinedQuery = (globalSearchQuery || localSearchQuery).toLowerCase();
    const matchesSearch =
      (app.jobId?.role || "").toLowerCase().includes(combinedQuery) ||
      (app.candidateInterviewStatus || "").toLowerCase().includes(combinedQuery);

    const matchesStatus = statusFilter
      ? (app.candidateInterviewStatus || "Pending") === statusFilter
      : true;

    let matchesDate = true;
    if (dateFilter && app.interviewTime) {
      const schedDate = new Date(app.interviewTime).toISOString().split("T")[0];
      matchesDate = schedDate === dateFilter;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleConfirm = async (applicationId, status, note = "") => {
    setConfirmingId(applicationId + status);
    try {
      const token = localStorage.getItem("candidateToken");
      await axios.put(
        `${API_BASE_URL}/candidate/confirm-interview`,
        { applicationId, status, note },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDashboardData();
    } catch (err) {
      console.error("Error updating interview status:", err);
      alert("Failed to update status. Please try again.");
    } finally {
      setConfirmingId(null);
    }
  };

  const getConfirmationStyle = (status) => {
    switch (status) {
      case "Confirmed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Declined":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-amber-100 text-amber-800 border-amber-200";
    }
  };

  const resetFilters = () => {
    setLocalSearchQuery("");
    setStatusFilter("");
    setDateFilter("");
  };

  const hasFilters = localSearchQuery || statusFilter || dateFilter;

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-9xl mx-auto animate-in fade-in duration-700">

        {/* Header & Filters */}
        <div className="flex flex-col gap-4 mb-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex-shrink-0">
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Interview Schedule</h2>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mt-1">Your upcoming interviews and confirmation status</p>
          </div>

          <div className="flex flex-wrap items-center justify-start xl:justify-end gap-3 w-full xl:w-auto">

            {/* Date Filter */}
            <div className="relative w-full sm:w-auto">
              <input
                type="date"
                className="w-full appearance-none bg-white py-2.5 px-4 pr-10 text-xs text-gray-700 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold shadow-sm sm:w-40 cursor-pointer"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
              {dateFilter && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-400 hover:text-red-500 transition-colors" onClick={() => setDateFilter("")}>
                  <FaTimes className="text-[10px]" />
                </div>
              )}
            </div>

            {/* Status Dropdown */}
            <div className="relative w-full sm:w-52" ref={statusDropdownRef}>
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 z-10">
                <FaBriefcase className="text-xs" />
              </div>
              <div
                className="w-full bg-white py-2.5 pl-10 pr-10 text-xs text-gray-700 border border-gray-200 rounded-xl font-bold cursor-pointer hover:bg-gray-50 shadow-sm text-ellipsis whitespace-nowrap overflow-hidden"
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              >
                {statusFilter || "Filter by Confirmation"}
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 z-10">
                {statusFilter ? (
                  <FaTimes className="text-[10px] text-gray-400 hover:text-red-500 cursor-pointer" onClick={(e) => { e.stopPropagation(); setStatusFilter(""); }} />
                ) : (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 pointer-events-none"><path d="m6 9 6 6 6-6" /></svg>
                )}
              </div>
              {isStatusDropdownOpen && (
                <div className="absolute z-[110] w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="max-h-60 overflow-y-auto py-2">
                    <div className={`px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-blue-50 transition-colors ${!statusFilter ? 'text-blue-600 bg-blue-50/50' : 'text-gray-500'}`} onClick={() => { setStatusFilter(""); setIsStatusDropdownOpen(false); }}>
                      All Statuses
                    </div>
                    {statuses.map(s => (
                      <div key={s} className={`px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-blue-50 transition-colors ${statusFilter === s ? 'text-blue-600 bg-blue-50/50' : 'text-gray-500'}`} onClick={() => { setStatusFilter(s); setIsStatusDropdownOpen(false); }}>
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <FaSearch className="text-xs" />
              </div>
              <input
                type="text"
                className="w-full py-2.5 pl-10 pr-10 text-xs text-gray-700 placeholder-gray-400 font-bold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                placeholder="Search role, status..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
              />
              {localSearchQuery && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <FaTimes className="text-[10px] text-gray-400 hover:text-red-500 cursor-pointer" onClick={() => setLocalSearchQuery("")} />
                </div>
              )}
            </div>

            {/* Reset */}
            {hasFilters && (
              <button onClick={resetFilters} className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl shadow-sm uppercase tracking-widest transition-all">
                <FaSync className="text-[10px]" /> Reset
              </button>
            )}

            <div className="bg-white px-4 py-2.5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{filteredApps.length} Interviews</span>
            </div>
          </div>
        </div>

        {/* Table container */}
        <div className="overflow-hidden bg-white shadow-xl rounded-3xl border border-gray-100">
          <div className="overflow-x-auto">
            {filteredApps.length > 0 ? (
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-green-500 to-blue-600 text-white text-center uppercase tracking-wider text-xs font-semibold">
                    <th className="py-2.5 px-8">Role</th>
                    <th className="py-2.5 px-6">Interview Date & Time</th>
                    <th className="py-2.5 px-6">Mode</th>
                    <th className="py-2.5 px-6">Confirmation</th>
                    <th className="py-2.5 px-8">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-center">
                  {filteredApps.map((app) => {
                    const confirmStatus = app.candidateInterviewStatus || "Pending";
                    const isPending = confirmStatus === "Pending";
                    return (
                      <tr key={app._id} className="group hover:bg-indigo-50/20 transition-all duration-300">
                        {/* Role */}
                        <td className="py-2 px-8">
                          <div className="font-bold text-sm text-gray-800 uppercase tracking-tight">{app.jobId?.role || "N/A"}</div>
                          <span className={`inline-block mt-1 px-3 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-widest border ${app.interviewStatus === "Rescheduled" ? "bg-orange-50 text-orange-600 border-orange-100" : "bg-indigo-50 text-indigo-600 border-indigo-100"}`}>
                            {app.interviewStatus || "Invited"}
                          </span>
                        </td>

                        {/* Date & Time */}
                        <td className="py-2 px-6">
                          {app.interviewTime ? (
                            <div className="space-y-1">
                              <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-800">
                                <FaCalendarAlt className="text-blue-400" size={12} />
                                {new Date(app.interviewTime).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                              </div>
                              <div className="flex items-center justify-center gap-2 text-[10px] font-medium text-gray-500 uppercase">
                                <FaClock className="text-gray-400" size={10} />
                                {new Date(app.interviewTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">TBD</span>
                          )}
                        </td>

                        {/* Mode */}
                        <td className="py-2 px-6">
                          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-tight">
                            {(app.interviewMode || "Online").toLowerCase() === "online" ? (
                              <FaVideo className="text-blue-400" size={12} />
                            ) : (
                              <FaMapMarkerAlt className="text-orange-400" size={12} />
                            )}
                            <span>{app.interviewMode || "Online"}</span>
                          </div>
                        </td>

                        {/* Confirmation Status */}
                        <td className="py-2 px-6">
                          <div className="flex flex-col items-center gap-1">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold border uppercase tracking-widest shadow-sm ${getConfirmationStyle(confirmStatus)}`}>
                              {confirmStatus}
                            </span>
                            {app.candidateInterviewNote && (
                              <div className="mt-1 text-[9px] text-gray-400 italic max-w-[120px] mx-auto truncate" title={app.candidateInterviewNote}>
                                "{app.candidateInterviewNote}"
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Action */}
                        <td className="py-2 px-8">
                          {isPending ? (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleConfirm(app._id, "Declined")}
                                disabled={confirmingId === app._id + "Declined"}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-rose-200 text-rose-500 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-95 disabled:opacity-50"
                              >
                                <FaTimesCircle size={12} />
                                Decline
                              </button>
                              <button
                                onClick={() => handleConfirm(app._id, "Confirmed")}
                                disabled={confirmingId === app._id + "Confirmed"}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider shadow-md hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
                              >
                                <FaCheckCircle size={12} />
                                Confirm
                              </button>
                            </div>
                          ) : (
                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider ${confirmStatus === "Confirmed" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"}`}>
                              {confirmStatus === "Confirmed" ? <FaCheckCircle size={12} /> : <FaTimesCircle size={12} />}
                              {confirmStatus === "Confirmed" ? "Confirmed" : "Declined"}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-24 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-200 mx-auto mb-6 border-2 border-dashed border-gray-200">
                  <FaInbox size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-800 uppercase tracking-widest">No Interviews Scheduled</h3>
                <p className="text-xs font-medium text-gray-400 mt-3 uppercase tracking-widest leading-loose max-w-xs mx-auto">
                  Interview invitations from HR will appear here. Keep checking your status on the Applications page.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
 

export default Interview;

