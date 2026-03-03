import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { FaShieldAlt, FaEye, FaSearch, FaTimes, FaInbox, FaSync, FaCalendarAlt } from "react-icons/fa";

const CandidateDocuments = () => {
  const { appliedJobs, searchQuery: globalSearchQuery, handleDownloadOffer, setIsModalOpen, setSelectedOffer, setActiveDocTab } = useOutletContext();
  const [localSearchQuery, setLocalSearchQuery] = useState("");

  const agreementApps = appliedJobs.filter(app =>
    app.status === "Hired" || app.status === "Selected" || (app.documentHistory && app.documentHistory.length > 0)
  ).filter(app => {
    const combinedQuery = (globalSearchQuery || localSearchQuery).toLowerCase();
    return (app.jobId?.role || "").toLowerCase().includes(combinedQuery);
  });

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-9xl mx-auto animate-in fade-in duration-700">

        {/* Header & Filters */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Compliance & Agreements</h2>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mt-2">Regulatory documents and digital contract history</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative w-full sm:w-80">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <FaSearch className="text-xs" />
                </div>
                <input
                  type="text"
                  className="w-full py-2.5 pl-10 pr-4 bg-gray-50 text-xs text-gray-700 placeholder-gray-400 font-bold border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
                  placeholder="Search by position..."
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                />
              </div>

              <div className="hidden sm:flex bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-100 shadow-sm items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{agreementApps.length} Agreements</span>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white shadow-xl rounded-3xl border border-gray-100 overflow-hidden">
          {agreementApps.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-green-500 to-blue-600 text-white text-center uppercase tracking-wider text-[10px] font-bold">
                    <th className="py-3 px-8">Document Portfolio</th>
                    <th className="py-3 px-6">Reference ID</th>
                    <th className="py-3 px-6">Audit Date</th>
                    <th className="py-3 px-6">Compliance State</th>
                    <th className="py-3 px-8">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-center">
                  {agreementApps.map((app) => (
                    <tr key={app._id} className="group hover:bg-indigo-50/20 transition-all duration-300">
                      <td className="py-2 px-8">
                        <div className="flex items-center justify-center gap-3">
                          <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500 border border-emerald-100 group-hover:scale-110 transition-transform shrink-0">
                            <FaShieldAlt size={14} />
                          </div>
                          <div className="text-left">
                            <div className="font-bold text-sm text-gray-800 uppercase tracking-tight">{app.jobId?.role || "Position Asset"}</div>
                            <div className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5 font-medium">Regulatory Contract</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-6">
                        <span className="font-bold text-[10px] text-gray-400 border border-gray-100 px-2 py-0.5 rounded bg-gray-50 uppercase tracking-widest">
                          #{app._id.slice(-8).toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2 px-6 text-xs font-bold text-gray-600 uppercase tracking-tight">
                        <div className="flex items-center justify-center gap-2">
                          <FaCalendarAlt className="text-blue-400" size={10} />
                          {new Date(app.updatedAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="py-2 px-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold uppercase tracking-widest">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-600"></div>
                          Verified
                        </div>
                      </td>
                      <td className="py-2 px-8 text-center">
                        <button
                          onClick={() => { setSelectedOffer(app); setActiveDocTab("agreement"); setIsModalOpen(true); }}
                          className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg transition-all shadow-sm"
                          title="View Document"
                        >
                          <FaEye size={14} />
                        </button>
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
              <h3 className="text-lg font-bold text-gray-800 uppercase tracking-widest">No Archival Records</h3>
              <p className="text-[10px] font-bold text-gray-400 mt-3 uppercase tracking-widest leading-loose max-w-xs mx-auto">
                Regulatory agreements and archival documents will be accessible once selections are finalized.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateDocuments;

// export default CandidateDocuments;
