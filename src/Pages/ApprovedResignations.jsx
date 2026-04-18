import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jsPDF } from "jspdf";
import { API_BASE_URL } from "../config";
import {
  FaCalendarAlt, FaEye, FaDownload, FaSearch,
  FaFileAlt, FaSync, FaBriefcase, FaUserTie,
  FaTimes, FaArrowLeft
} from "react-icons/fa";

const ApprovedResignations = () => {
  const navigate = useNavigate();
  const [resignations, setResignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [roleSearchQuery, setRoleSearchQuery] = useState("");
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const roleDropdownRef = useRef(null);
  const [roles, setRoles] = useState([]);
  const [selectedResignation, setSelectedResignation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchResignations();
    fetchRoles();
    const handleClickOutside = (event) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
        setIsRoleDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/applications/all`);
      if (res.data.success) {
        const apps = res.data.applications || [];
        const uniqueRoles = [...new Set(apps.map(a => a.jobId?.role).filter(Boolean))];
        setRoles(uniqueRoles.map(r => ({ _id: r, name: r })));
      }
    } catch (err) {
      console.error("Failed to fetch roles:", err);
    }
  };

  const fetchResignations = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/applications/all`);
      const allApps = res.data.applications || [];
      // Filter logic same as main page
      const approved = allApps.filter(
        (app) => app.status === "Resigned" && app.resignationStatus === "Approved"
      );
      setResignations(approved);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const downloadResignationPDF = (app) => {
    if (!app) return;
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
    doc.text(`Role: ${app.jobId?.role || "N/A"}`, 20, 62);
    doc.text(`Date Filed: ${new Date(app.resignationSentAt).toLocaleDateString()}`, 20, 69);
    doc.setDrawColor(220, 220, 220);
    doc.line(20, 75, 190, 75);
    doc.setFont("helvetica", "normal");
    const splitText = doc.splitTextToSize(app.resignationLetter || "No content provided.", 170);
    doc.text(splitText, 20, 85);
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("Timely Health Projects - Human Resources Dept", 105, 285, { align: "center" });
    doc.save(`Resignation_Approved_${app.firstName}_${app.lastName}.pdf`);
  };

  const exportToCSV = () => {
    if (filteredData.length === 0) return alert("No data to export!");
    const headers = ["Name", "Email", "Role", "Filing Date", "Last Working Day", "Status"];
    const rows = filteredData.map((app) => [
      `"${app.firstName} ${app.lastName}"`,
      `"${app.email || ''}"`,
      `"${app.jobId?.role || 'N/A'}"`,
      `"${app.resignationSentAt ? new Date(app.resignationSentAt).toLocaleDateString() : ''}"`,
      `"${app.lastWorkingDay ? new Date(app.lastWorkingDay).toLocaleDateString() : ''}"`,
      `"Approved"`
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `approved_resignations_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredData = resignations.filter((app) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      `${app.firstName} ${app.lastName}`.toLowerCase().includes(query) ||
      (app.jobId?.role || "").toLowerCase().includes(query) ||
      (app.mobile || "").toLowerCase().includes(query) ||
      (app.email || "").toLowerCase().includes(query);
    const matchesRole = roleFilter ? app.jobId?.role === roleFilter : true;
    let matchesDate = true;
    if (dateFilter) {
      const appDate = new Date(app.resignationSentAt).toISOString().split("T")[0];
      matchesDate = appDate === dateFilter;
    }
    return matchesSearch && matchesRole && matchesDate;
  });

  return (
    <div className="p-3 mx-auto bg-white rounded-lg shadow-md max-w-9xl min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/employee-resignation")}
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaArrowLeft className="text-sm" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-gray-800">Approved Resignations</h2>
            <p className="text-xs text-gray-500">{filteredData.length} approved resignation(s)</p>
          </div>
          <span className="px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-widest bg-green-100 text-green-700">
            Approved
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-start xl:justify-end gap-3 w-full xl:w-auto">
          {/* filters */}
          <div className="relative w-full sm:w-auto">
            <input type="date" className="w-full appearance-none bg-white py-2 px-4 pr-10 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all hover:bg-gray-50 cursor-pointer shadow-sm sm:w-40" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
            {dateFilter && (<div className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-400 hover:text-red-500 transition-colors" onClick={() => setDateFilter("")}><FaTimes className="text-[12px]" /></div>)}
          </div>

          <div className="relative w-full sm:w-56" ref={roleDropdownRef}>
             <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 z-10"><FaBriefcase className="text-sm" /></div>
            <div className="w-full bg-white py-2 pl-10 pr-10 text-sm text-gray-700 border border-gray-300 rounded-lg font-bold transition-all hover:bg-gray-50 cursor-pointer shadow-sm relative overflow-hidden text-ellipsis whitespace-nowrap" onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}>{roleFilter || "Select Role"}</div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 z-10">{roleFilter ? (<FaTimes className="text-[12px] text-gray-400 hover:text-red-500 cursor-pointer" onClick={(e) => { e.stopPropagation(); setRoleFilter(""); }} />) : (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 pointer-events-none"><path d="m6 9 6 6 6-6" /></svg>)}</div>
            {isRoleDropdownOpen && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
                <div className="p-2 border-b border-gray-100 bg-gray-50">
                  <div className="relative">
                    <FaUserTie className="absolute left-2.5 top-2.5 text-gray-400 text-xs" />
                    <input type="text" className="w-full py-1.5 pl-8 pr-4 text-xs bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Search roles..." value={roleSearchQuery} onChange={(e) => setRoleSearchQuery(e.target.value)} onClick={(e) => e.stopPropagation()} autoFocus />
                  </div>
                </div>
                <div className="max-h-60 overflow-y-auto py-1">
                  <div className={`px-4 py-2 text-xs font-bold cursor-pointer hover:bg-indigo-50 ${!roleFilter ? 'text-indigo-600 bg-indigo-50/50' : 'text-gray-600'}`} onClick={() => { setRoleFilter(""); setIsRoleDropdownOpen(false); setRoleSearchQuery(""); }}>All Roles</div>
                  {roles.filter(r => r.name.toLowerCase().includes(roleSearchQuery.toLowerCase())).map(r => (
                    <div key={r._id} className={`px-4 py-2 text-xs font-bold cursor-pointer hover:bg-indigo-50 ${roleFilter === r.name ? 'text-indigo-600 bg-indigo-50/50' : 'text-gray-600'}`} onClick={() => { setRoleFilter(r.name); setIsRoleDropdownOpen(false); setRoleSearchQuery(""); }}>{r.name}</div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative w-full sm:w-auto sm:min-w-[250px]">
            <input type="text" className="w-full py-2 pl-10 pr-10 text-sm text-gray-700 placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" placeholder="Search employee, email, role..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400"><FaSearch className="text-sm" /></div>
            {searchQuery && (<div className="absolute inset-y-0 right-0 flex items-center pr-3"><FaTimes className="text-[12px] text-gray-400 hover:text-red-500 cursor-pointer" onClick={() => setSearchQuery("")} /></div>)}
          </div>

          {/* Buttons */}
          <button onClick={exportToCSV} className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors shadow-sm">
            <FaDownload className="text-[10px]" /> CSV
          </button>
          <button onClick={fetchResignations} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors shadow-sm">
            <FaSync className={`text-xs ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading Approved Resignations...</div>
        ) : filteredData.length > 0 ? (
          <table className="min-w-full">
            <thead className="text-left text-sm text-white bg-gradient-to-r from-purple-500 to-blue-600">
              <tr>
                <th className="py-3 px-4 text-center">Employee Name</th>
                <th className="py-3 px-4 text-center">Designation</th>
                <th className="py-3 px-4 text-center">Contact</th>
                <th className="py-3 px-4 text-center">Filing Date</th>
                <th className="py-3 px-4 text-center">Last Working Day</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((app) => (
                <tr key={app._id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-sm font-medium text-center">
                    <div className="font-bold text-gray-800">{app.firstName} {app.lastName}</div>
                    <div className="text-[10px] text-gray-400">{app.email}</div>
                  </td>
                  <td className="p-4 text-sm font-medium text-center">
                    <span className="inline-block px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full">{app.jobId?.role || "N/A"}</span>
                  </td>
                  <td className="p-4 text-sm font-medium text-center text-gray-600">{app.mobile}</td>
                  <td className="p-4 text-sm font-medium text-center">
                    <div className="inline-flex items-center gap-2 px-2 py-1 bg-gray-100 rounded text-[10px] font-bold text-gray-500">
                      <FaCalendarAlt className="text-[8px]" />
                      {app.resignationSentAt ? new Date(app.resignationSentAt).toLocaleDateString() : "—"}
                    </div>
                  </td>
                  <td className="p-4 text-sm font-medium text-center">
                    <div className="inline-flex items-center gap-2 px-2 py-1 bg-red-50 rounded text-[10px] font-bold text-red-600">
                      <FaCalendarAlt className="text-[8px]" />
                      {app.lastWorkingDay ? new Date(app.lastWorkingDay).toLocaleDateString() : "—"}
                    </div>
                  </td>
                  <td className="p-4 text-sm font-medium text-center">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700`}>
                      {(app.resignationStatus || "Pending").toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-sm font-medium text-center">
                    <div className="flex justify-center gap-3">
                      <button onClick={() => { setSelectedResignation(app); setIsModalOpen(true); }} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors group" title="View Details">
                        <FaEye size={16} className="group-hover:scale-110 transition-transform" />
                      </button>
                      <button onClick={() => downloadResignationPDF(app)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors group" title="Download PDF">
                        <FaDownload size={14} className="group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <FaFileAlt className="mx-auto mb-4 text-gray-300" size={48} />
            <p className="font-medium">No approved resignations found</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && selectedResignation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-[2px]">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl relative overflow-hidden border border-gray-100">
            <div className="px-8 pt-8 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl text-gray-800">{selectedResignation.firstName} {selectedResignation.lastName}</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-1 text-blue-600">{selectedResignation.jobId?.role || "N/A"}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all">✕</button>
            </div>
            <div className="p-8 pt-4 max-h-[75vh] overflow-y-auto space-y-6">
              <div className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Statement of Resignation</h3>
                <div className="text-base text-slate-700 font-medium leading-relaxed italic">{selectedResignation.resignationLetter || "No statement provided."}</div>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <FaCalendarAlt className="text-red-400" />
                  Filed: {selectedResignation.resignationSentAt ? new Date(selectedResignation.resignationSentAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) : "N/A"}
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-2xl text-[10px] font-black text-red-600 uppercase tracking-widest">
                  <FaCalendarAlt className="text-red-400" />
                  Last Day: {selectedResignation.lastWorkingDay ? new Date(selectedResignation.lastWorkingDay).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) : "N/A"}
                </div>
              </div>
            </div>
            <div className="px-8 py-6 border-t border-gray-50 flex justify-between items-center bg-gray-50/50">
              <button onClick={() => downloadResignationPDF(selectedResignation)} className="text-[10px] font-black text-gray-400 hover:text-red-500 transition-colors uppercase tracking-[0.2em] flex items-center gap-2 group">
                <FaDownload className="text-xs group-hover:animate-bounce" /> Archive PDF
              </button>
              <button onClick={() => setIsModalOpen(false)} className="px-8 py-3 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all shadow-lg shadow-gray-200">Dismiss</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovedResignations;
