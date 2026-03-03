import React, { useState, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { FaFilePdf, FaEye, FaDownload, FaInbox, FaSearch, FaTimes, FaSync, FaCalendarAlt } from "react-icons/fa";

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

  const docTypes = ["Offer", "Appointment", "Experience", "Internship", "Relieving"];

  const offerApps = appliedJobs.filter(app => app.offerLetter || app.adminAttachment);

  const filteredLetters = offerApps.filter(app => {
    const combinedQuery = (globalSearchQuery || localSearchQuery).toLowerCase();
    const matchesSearch =
      (app.jobId?.role || "").toLowerCase().includes(combinedQuery) ||
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
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
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
            <div>
              <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Offer Letters & Documents</h2>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mt-2">Access your formal offer letters and employment agreements</p>
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
                            <div className="font-bold text-sm text-gray-800 uppercase tracking-tight">{app.jobId?.role || "N/A"}</div>
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
                              setActiveDocTab("offer");
                              setIsModalOpen(true);
                            }}
                            className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg transition-all shadow-sm"
                            title="View Document"
                          >
                            <FaEye size={14} />
                          </button>
                          <button
                            onClick={() => handleDownloadOffer(app)}
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
    </div>
  );
};

export default Letters;
