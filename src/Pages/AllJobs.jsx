import React, { useState, useEffect, useRef } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";
import {
  FaBriefcase, FaMapMarkerAlt, FaClock, FaRupeeSign, FaEye,
  FaSync, FaTimes, FaSearch, FaUserTie, FaBuilding, FaInfoCircle
} from "react-icons/fa";

const AllJobs = () => {
  const { allJobs, searchQuery: globalSearchQuery, profile } = useOutletContext();
  const navigate = useNavigate();

  // Local competitive states for filtering (mirroring JobApplicants style)
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [roleSearchQuery, setRoleSearchQuery] = useState("");
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [roles, setRoles] = useState([]);
  const roleDropdownRef = useRef(null);

  useEffect(() => {
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
      const res = await axios.get(`${API_BASE_URL}/roles/all`);
      if (res.data.success) {
        setRoles(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch roles:", err);
    }
  };

  // Combine global search from Layout and local filters
  const filteredJobs = allJobs.filter(job => {
    const combinedQuery = (globalSearchQuery || localSearchQuery).toLowerCase();
    const matchesSearch =
      job.role.toLowerCase().includes(combinedQuery) ||
      job.location.toLowerCase().includes(combinedQuery) ||
      (job.department || "").toLowerCase().includes(combinedQuery);

    const matchesRole = roleFilter ? (job.department === roleFilter || job.role === roleFilter) : true;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-9xl mx-auto animate-in fade-in duration-700">

        {/* Header & Filter Section */}
        <div className="flex flex-col gap-4 mb-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex-shrink-0">
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Open Opportunities</h2>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mt-1">Explore positions curated for you</p>
          </div>

          <div className="flex flex-wrap items-center justify-start xl:justify-end gap-3 w-full xl:w-auto">

            {/* Dept Filter Dropdown (Searchable) */}
            <div className="relative w-full sm:w-64" ref={roleDropdownRef}>
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 z-10">
                <FaBuilding className="text-xs" />
              </div>
              <div
                className="w-full bg-white py-2.5 pl-10 pr-10 text-xs text-gray-700 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all hover:bg-gray-50 cursor-pointer shadow-sm relative overflow-hidden text-ellipsis whitespace-nowrap"
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              >
                {roleFilter || "Filter by Department"}
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 z-10">
                {roleFilter ? (
                  <FaTimes
                    className="text-[10px] text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
                    onClick={(e) => { e.stopPropagation(); setRoleFilter(""); }}
                    title="Clear filter"
                  />
                ) : (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 pointer-events-none"><path d="m6 9 6 6 6-6" /></svg>
                )}
              </div>

              {isRoleDropdownOpen && (
                <div className="absolute z-[110] w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="p-3 border-b border-gray-50 bg-gray-50/50">
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-2.5 text-gray-400 text-[10px]" />
                      <input
                        type="text"
                        className="w-full py-2 pl-8 pr-4 text-[10px] bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                        placeholder="Search departments..."
                        value={roleSearchQuery}
                        onChange={(e) => setRoleSearchQuery(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto py-2 no-scrollbar">
                    <div
                      className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-blue-50 transition-colors ${!roleFilter ? 'text-blue-600 bg-blue-50/50' : 'text-gray-500'}`}
                      onClick={() => { setRoleFilter(""); setIsRoleDropdownOpen(false); setRoleSearchQuery(""); }}
                    >
                      All Departments
                    </div>
                    {roles
                      .filter(r => r.name.toLowerCase().includes(roleSearchQuery.toLowerCase()))
                      .map((r) => (
                        <div
                          key={r._id}
                          className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-blue-50 transition-colors ${roleFilter === r.name ? 'text-blue-600 bg-blue-50/50' : 'text-gray-500'}`}
                          onClick={() => { setRoleFilter(r.name); setIsRoleDropdownOpen(false); setRoleSearchQuery(""); }}
                        >
                          {r.name}
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>

            {/* Local Search Bar */}
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <FaSearch className="text-xs" />
              </div>
              <input
                type="text"
                className="w-full py-2.5 pl-10 pr-10 text-xs text-gray-700 placeholder-gray-400 font-bold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                placeholder="Search roles, location..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
              />
              {(localSearchQuery || globalSearchQuery) && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <FaTimes
                    className="text-[10px] text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
                    onClick={() => setLocalSearchQuery("")}
                  />
                </div>
              )}
            </div>

            {/* Reset Filters */}
            {(localSearchQuery || roleFilter) && (
              <button
                onClick={() => {
                  setLocalSearchQuery("");
                  setRoleFilter("");
                  setRoleSearchQuery("");
                }}
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-all shadow-sm uppercase tracking-widest"
              >
                <FaSync className="text-[10px]" /> Reset
              </button>
            )}

            <div className="bg-white px-4 py-2.5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{filteredJobs.length} Jobs Live</span>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-hidden bg-white shadow-xl rounded-3xl border border-gray-100">
          <div className="overflow-x-auto">
            {filteredJobs.length > 0 ? (
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-green-500 to-blue-600 text-white text-center uppercase tracking-wider text-xs font-semibold">
                    <th className="py-2 px-8">Job Role</th>
                    <th className="py-2 px-6">Department</th>
                    <th className="py-2 px-6">Location</th>
                    <th className="py-2 px-6">Experience</th>
                    <th className="py-2 px-6">Salary (P.A)</th>
                    <th className="py-2 px-8">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-center">
                  {filteredJobs.map((job) => (
                    <tr key={job._id} className="group hover:bg-indigo-50/20 transition-all duration-300">
                      <td className="py-3 px-8 text-sm font-bold text-gray-800 leading-tight uppercase tracking-tight">
                        {job.role}
                        {job.jobType && (
                          <span className="block text-[10px] text-blue-500 mt-1 font-semibold tracking-widest">
                            {job.jobType}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-6">
                        <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 text-[10px] font-bold rounded-full border border-indigo-200 uppercase tracking-wider">
                          {job.department || "General"}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-xs font-medium text-gray-600">
                        <div className="flex items-center justify-center gap-2">
                          <FaMapMarkerAlt className="text-blue-400" size={12} />
                          {job.location}
                        </div>
                      </td>
                      <td className="py-3 px-6 text-xs font-medium text-gray-600 uppercase tracking-tight">
                        <div className="flex items-center justify-center gap-2">
                          <FaClock className="text-blue-400" size={12} />
                          {job.experience || "Fresher"}
                        </div>
                      </td>
                      <td className="py-3 px-6 text-xs font-bold text-gray-800">
                        <div className="flex items-center justify-center gap-1.5">
                          <FaRupeeSign className="text-emerald-500" size={12} />
                          {job.salary || "As per Policy"}
                        </div>
                      </td>
                      <td className="py-3 px-8">
                        <button
                          onClick={() => navigate(`/jobs/${job._id}`)}
                          className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:bg-blue-700 transition-all active:scale-95"
                        >
                          Review & Apply <FaEye className="text-xs" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-24 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-200 mx-auto mb-6 border-2 border-dashed border-gray-200">
                  <FaBriefcase size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-800 uppercase tracking-widest">No Matches Found</h3>
                <p className="text-xs font-medium text-gray-400 mt-3 uppercase tracking-widest leading-loose max-w-xs mx-auto">
                  We couldn't find any positions matching your search. Try different keywords or check back later!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Hint */}
        <div className="mt-12 flex items-center justify-center gap-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
          <FaInfoCircle className="text-blue-400" />
          New positions are added daily. Keep your profile updated for better matching.
        </div>
      </div>
    </div>
  );
};
  // );
// };

export default AllJobs;
