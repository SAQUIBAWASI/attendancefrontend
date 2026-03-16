import React, { useState, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { FaFilePdf, FaEye, FaDownload, FaInbox, FaSearch, FaTimes, FaSync, FaCalendarAlt, FaSignOutAlt } from "react-icons/fa";
import axios from "axios";
import { API_BASE_URL } from "../config";
import { toast } from "react-toastify";
import { jsPDF } from "jspdf";

const Letters = () => {
  const {
    appliedJobs, searchQuery: globalSearchQuery,
    handleDownloadOffer, setIsModalOpen, setSelectedOffer, setActiveDocTab
  } = useOutletContext();

  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const typeDropdownRef = useRef(null);

  const [isResignModalOpen, setIsResignModalOpen] = useState(false);
  const [resignationLetter, setResignationLetter] = useState("");
  const [isSubmittingResign, setIsSubmittingResign] = useState(false);

  const docTypes = ["Offer", "Appointment", "Experience", "Internship", "Relieving", "Resignation"];

  // Logic to find eligible application for resignation
  // A candidate can resign if they are "Selected" or "Hired" and haven't already filed a resignation (or it was rejected)
  const canResignApp = appliedJobs.find(app =>
    (app.status === "Selected" || app.status === "Hired") &&
    (!app.status === "Resigned" || app.resignationStatus === "Rejected")
  );

  const offerApps = appliedJobs.filter(app =>
    app.offerLetter ||
    app.adminAttachment ||
    (app.status === "Resigned" && app.resignationStatus === "Approved")
  ).map(app => {
    if (app.status === "Resigned" && app.resignationStatus === "Approved") {
      return { ...app, documentType: "Resignation" };
    }
    return app;
  });

  const filteredLetters = offerApps.filter(app => {
    const combinedQuery = (globalSearchQuery || localSearchQuery).toLowerCase();
    const matchesSearch =
      (app.jobId?.role || app.role || "").toLowerCase().includes(combinedQuery) ||
      (app.documentType || "Offer").toLowerCase().includes(combinedQuery);

    const matchesType = typeFilter
      ? (app.documentType || "Offer").toLowerCase() === typeFilter.toLowerCase()
      : true;

    let matchesDate = true;
    if (dateFilter) {
      const issueDate = new Date(app.offerSentAt || app.updatedAt).toISOString().split("T")[0];
      matchesDate = issueDate === dateFilter;
    }

    return matchesSearch && matchesType && matchesDate;
  });

  const getDocTypeBadge = (type) => {
    const t = (type || "Offer").toLowerCase();
    switch (t) {
      case "offer": return "bg-blue-100 text-blue-800 border-blue-200";
      case "appointment": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "experience": return "bg-purple-100 text-purple-800 border-purple-200";
      case "internship": return "bg-orange-100 text-orange-800 border-orange-200";
      case "relieving": return "bg-rose-100 text-rose-800 border-rose-200";
      case "resignation": return "bg-amber-100 text-amber-800 border-amber-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleSubmitResignation = async (e) => {
    e.preventDefault();
    if (!resignationLetter.trim()) {
      toast.error("Please provide a resignation statement.");
      return;
    }

    setIsSubmittingResign(true);
    try {
      const token = localStorage.getItem("candidateToken");
      const res = await axios.post(`${API_BASE_URL}/candidate/submit-resignation`, {
        applicationId: canResignApp._id,
        resignationLetter: resignationLetter
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        toast.success("Resignation submitted successfully!");
        setIsResignModalOpen(false);
        setResignationLetter("");
        // Reload or update context would be ideal, but for now we rely on user refresh or global state update if handled by Layout
      }
    } catch (err) {
      console.error("Resignation error:", err);
      toast.error(err.response?.data?.message || "Failed to submit resignation");
    } finally {
      setIsSubmittingResign(false);
    }
  };

  const handleDownloadResignation = (app) => {
    const doc = new jsPDF();
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 210, 40, "F");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("RESIGNATION LETTER", 105, 25, { align: "center" });

    doc.setTextColor(50, 50, 50);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Employee: ${app.firstName} ${app.lastName}`, 20, 55);
    doc.text(`Role: ${app.jobId?.role || app.role || "N/A"}`, 20, 62);
    doc.text(`Date Filed: ${new Date(app.resignationSentAt || app.updatedAt).toLocaleDateString()}`, 20, 69);

    doc.setDrawColor(220, 220, 220);
    doc.line(20, 75, 190, 75);

    doc.setFont("helvetica", "normal");
    const letterBody = app.resignationLetter || "No content provided.";
    const splitText = doc.splitTextToSize(letterBody, 170);
    doc.text(splitText, 20, 85);

    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("Timely Health Projects - Human Resources Dept", 105, 285, { align: "center" });
    doc.save(`Resignation_${app.firstName}_${app.lastName}.pdf`);
  };

  const resetFilters = () => {
    setLocalSearchQuery("");
    setTypeFilter("");
    setDateFilter("");
  };

  const hasFilters = localSearchQuery || typeFilter || dateFilter;

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-9xl mx-auto animate-in fade-in duration-700">

        {/* Header & Filters Section */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Offer Letters & Documents</h2>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mt-2">Access your formal offer letters and employment agreements</p>
              </div>
              {canResignApp && (
                <button
                  onClick={() => {
                    if (!resignationLetter.trim()) {
                      const app = canResignApp;
                      const template = `To,\nThe Human Resources Department,\nTimely Health Projects\n\nSubject: Resignation Letter\n\nDear Sir/Madam,\n\nI, ${app?.firstName} ${app?.lastName}, am writing to formally resign from my position as ${app?.jobId?.role || app?.role || "[Role]"} at Timely Health Projects.\n\nMy last working day will be [Date]. I would like to thank you for the professional and personal development opportunities I have enjoyed during my tenure.\n\nPlease let me know the necessary steps to complete the exit process.\n\nSincerely,\n${app?.firstName} ${app?.lastName}`;
                      setResignationLetter(template);
                    }
                    setIsResignModalOpen(true);
                  }}
                  className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-rose-100 active:scale-95"
                >
                  <FaSignOutAlt /> File Resignation
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Date Filter */}
              <div className="relative w-full sm:w-auto">
                <input
                  type="date"
                  className="w-full bg-gray-50 py-2.5 px-4 pr-10 text-xs text-gray-700 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold shadow-sm sm:w-40 cursor-pointer transition-all"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>

              {/* Document Type Dropdown */}
              <div className="relative w-full sm:w-52" ref={typeDropdownRef}>
                <div
                  className="w-full bg-gray-50 py-2.5 px-4 text-xs text-gray-700 border border-gray-100 rounded-xl font-bold cursor-pointer hover:bg-gray-100 shadow-sm transition-all flex items-center justify-between"
                  onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                >
                  <span className="truncate">{typeFilter || "Filter by Doc Type"}</span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`text-gray-400 transition-transform duration-200 ${isTypeDropdownOpen ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6" /></svg>
                </div>
                {isTypeDropdownOpen && (
                  <div className="absolute z-[110] w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="max-h-60 overflow-y-auto py-2">
                      <div
                        className={`px-4 py-2.5 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-blue-50 transition-colors ${!typeFilter ? 'text-blue-600 bg-blue-50/50' : 'text-gray-500'}`}
                        onClick={() => { setTypeFilter(""); setIsTypeDropdownOpen(false); }}
                      >
                        All Types
                      </div>
                      {docTypes.map(t => (
                        <div
                          key={t}
                          className={`px-4 py-2.5 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-blue-50 transition-colors ${typeFilter === t ? 'text-blue-600 bg-blue-50/50' : 'text-gray-500'}`}
                          onClick={() => { setTypeFilter(t); setIsTypeDropdownOpen(false); }}
                        >
                          {t}
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
                  className="w-full py-2.5 pl-10 pr-4 bg-gray-50 text-xs text-gray-700 placeholder-gray-400 font-bold border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
                  placeholder="Search role, doc type..."
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                />
              </div>

              {/* Reset */}
              {hasFilters && (
                <button onClick={resetFilters} className="p-2.5 text-gray-400 hover:text-rose-500 bg-gray-50 hover:bg-rose-50 border border-gray-100 rounded-xl transition-all shadow-sm" title="Reset Filters">
                  <FaSync className="text-xs" />
                </button>
              )}

              <div className="hidden sm:flex bg-blue-50 px-4 py-2.5 rounded-xl border border-blue-100 shadow-sm items-center gap-2">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{filteredLetters.length} Documents</span>
              </div>
            </div>
          </div>
        </div>

        {/* Table Area */}
        <div className="bg-white shadow-xl rounded-3xl border border-gray-100 overflow-hidden">
          {filteredLetters.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-green-500 to-blue-600 text-white text-center uppercase tracking-wider text-[10px] font-bold">
                    <th className="py-3 px-8">Position / Role</th>
                    <th className="py-3 px-6">Document Type</th>
                    <th className="py-3 px-6">Issued On</th>
                    <th className="py-3 px-6">Ref ID</th>
                    <th className="py-3 px-8">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-center">
                  {filteredLetters.map((app) => (
                    <tr key={app._id} className="group hover:bg-indigo-50/20 transition-all duration-300">
                      <td className="py-2 px-8">
                        <div className="flex items-center justify-center gap-3">
                          <div className="w-8 h-8 bg-rose-50 rounded-lg flex items-center justify-center text-rose-500 border border-rose-100 group-hover:scale-110 transition-transform shrink-0">
                            <FaFilePdf size={12} />
                          </div>
                          <div className="text-left">
                            <div className="font-bold text-sm text-gray-800 uppercase tracking-tight">{app.jobId?.role || app.role || "N/A"}</div>
                            <div className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5 font-medium">Formal Documentation</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getDocTypeBadge(app.documentType)}`}>
                          {app.documentType || "Offer"}
                        </span>
                      </td>
                      <td className="py-2 px-6 text-xs font-bold text-gray-600 uppercase tracking-tight">
                        <div className="flex items-center justify-center gap-2">
                          <FaCalendarAlt className="text-blue-400" size={10} />
                          {new Date(app.offerSentAt || app.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                      </td>
                      <td className="py-2 px-6">
                        <span className="font-bold text-[10px] text-gray-400 border border-gray-100 px-2 py-0.5 rounded bg-gray-50 uppercase tracking-widest">
                          #{app._id.slice(-6).toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2 px-8">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedOffer(app);
                              setActiveDocTab(app.documentType === "Resignation" ? "resignation" : "offer");
                              setIsModalOpen(true);
                            }}
                            className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg transition-all shadow-sm"
                            title="View Document"
                          >
                            <FaEye size={14} />
                          </button>
                          <button
                            onClick={() => {
                              if (app.documentType === "Resignation") {
                                handleDownloadResignation(app);
                              } else {
                                handleDownloadOffer(app);
                              }
                            }}
                            className="p-2 bg-gray-900 text-white hover:bg-blue-600 rounded-lg transition-all shadow-sm"
                            title="Download PDF"
                          >
                            <FaDownload size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-24 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-gray-200 mx-auto mb-6 border-2 border-dashed border-gray-100">
                <FaInbox size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-800 uppercase tracking-widest">No Letters Yet</h3>
              <p className="text-[10px] font-bold text-gray-400 mt-3 uppercase tracking-widest leading-loose max-w-xs mx-auto">
                Offer letters and official documents will appear here once issued by HR.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Resignation Modal */}
      {isResignModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="bg-rose-100 text-rose-600 p-2 rounded-xl">
                  <FaSignOutAlt size={16} />
                </div>
                <h2 className="text-xl font-bold text-gray-800 tracking-tight">File Resignation</h2>
              </div>
              <button onClick={() => setIsResignModalOpen(false)} className="text-gray-400 hover:text-rose-500 transition-colors">
                <FaTimes size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitResignation} className="p-8">
              <div className="mb-6">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                  Submitting resignation for: <span className="text-gray-800">{canResignApp?.jobId?.role || canResignApp?.role || "N/A"}</span>
                </p>
                <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-2 px-1">Resignation statement / reason *</label>
                <textarea
                  required
                  value={resignationLetter}
                  onChange={(e) => setResignationLetter(e.target.value)}
                  className="w-full h-40 p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all text-sm font-medium text-gray-700 shadow-sm"
                  placeholder="Please state your reason for resignation and your intended last working day..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsResignModalOpen(false)}
                  className="flex-1 px-6 py-3 rounded-2xl font-bold text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all text-xs uppercase tracking-widest border border-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingResign}
                  className="flex-2 bg-rose-500 hover:bg-rose-600 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-rose-100 text-xs uppercase tracking-widest flex items-center justify-center min-w-[160px]"
                >
                  {isSubmittingResign ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Submit Resignation</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Letters;
