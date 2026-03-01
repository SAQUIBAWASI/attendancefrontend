import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import {
    FaUserGraduate, FaPhone, FaCalendarAlt, FaStar, FaEye, FaDownload,
    FaEnvelope, FaBriefcase, FaBuilding, FaMoneyBillWave,
    FaCalendarCheck, FaMapMarkerAlt, FaTimesCircle
} from "react-icons/fa";

import {
    FaUserTie,
    FaTimes,
    FaSync
} from "react-icons/fa";


const DetailItem = ({ icon, label, value }) => (
    <div className="flex items-start gap-3">
        <div className="mt-1 text-blue-500">{icon}</div>
        <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
            <p className="text-sm font-bold text-gray-800">{value}</p>
        </div>
    </div>
);



const JobApplicants = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [scoreFilter, setScoreFilter] = useState(0);
    const [roleFilter, setRoleFilter] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [roleSearchQuery, setRoleSearchQuery] = useState("");
    const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
    const roleDropdownRef = useRef(null);
    const [roles, setRoles] = useState([]);
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchApplications();
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

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE_URL}/applications/all`);
            if (res.data.success) {
                setApplications(res.data.applications);
            }
        } catch (err) {
            setError("Failed to fetch applications");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatDocumentUrl = (filePath) => {
        if (!filePath) return "";
        const relativePath = filePath.includes("uploads")
            ? "uploads/" + filePath.split(/uploads[\\/]/).pop().replace(/\\/g, "/")
            : filePath.replace(/\\/g, "/");
        return `${API_BASE_URL.replace("/api", "")}/${relativePath}`;
    };

    const handleOpenModal = (app) => {
        setSelectedApplicant(app);
        setIsModalOpen(true);
    };

    const filteredApplications = applications.filter(app => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            `${app.firstName} ${app.lastName}`.toLowerCase().includes(query) ||
            (app.jobId?.role || "").toLowerCase().includes(query) ||
            (app.mobile || "").toLowerCase().includes(query);

        const matchesScore = (app.technicalScore || 0) >= scoreFilter;

        const matchesRole = roleFilter ? (app.jobId?.role === roleFilter) : true;

        let matchesDate = true;
        if (dateFilter) {
            const appDate = new Date(app.appliedAt).toISOString().split('T')[0];
            matchesDate = appDate === dateFilter;
        }

        return matchesSearch && matchesScore && matchesRole && matchesDate;
    });

    const handleUpdateScore = async (id, field, value) => {
        // Cast to number for score fields
        const numericValue = (field === "status") ? value : Number(value);

        try {
            const res = await axios.post(`${API_BASE_URL}/applications/update-score`, {
                applicationId: id,
                [field]: numericValue,
            });
            if (res.data.success) {
                setApplications((prev) =>
                    prev.map((app) => (app._id === id ? { ...app, [field]: numericValue } : app))
                );
            }
        } catch (err) {
            console.error("Update score error:", err);
        }
    };

    const handleResignationStatusUpdate = async (id, status) => {
        try {
            setLoading(true);
            const res = await axios.post(`${API_BASE_URL}/applications/resignation-approval`, {
                applicationId: id,
                status
            });
            if (res.data.success) {
                alert(`Resignation ${status} successfully!`);
                setApplications((prev) =>
                    prev.map((app) => (app._id === id ? { ...app, resignationStatus: status } : app))
                );
                // Update selected applicant if modal is open
                if (selectedApplicant && selectedApplicant._id === id) {
                    setSelectedApplicant({ ...selectedApplicant, resignationStatus: status });
                }
            }
        } catch (err) {
            console.error("Resignation approval error:", err);
            alert("Failed to update resignation status.");
        } finally {
            setLoading(false);
        }
    };


    const Info = ({ label, value }) => (
        <div className="flex justify-between">
            <span className="text-gray-500">{label}</span>
            <span className="font-medium text-gray-800 text-right">
                {value || "N/A"}
            </span>
        </div>
    );

    const ScoreMini = ({ label, score }) => (
        <div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className={`text-sm font-semibold ${score >= 80
                ? "text-green-600"
                : score >= 50
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}>
                {score || 0}
            </p>
        </div>
    );



    return (
        <div className="w-full min-h-screen bg-gray-50/50 p-4 md:p-6 lg:p-8">
            {/* Header Section */}
            <div className="flex flex-col gap-4 mb-6 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex-shrink-0">
                    <h2 className="text-base font-bold text-gray-800">Job Applicants</h2>
                </div>

                <div className="flex flex-wrap items-center justify-start xl:justify-end gap-3 w-full xl:w-auto">
                    {/* Date Filter */}
                    <div className="relative w-full sm:w-auto">
                        <input
                            type="date"
                            className="w-full appearance-none bg-white py-2 px-4 pr-10 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all hover:bg-gray-50 cursor-pointer shadow-sm sm:w-40"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                        />
                        {dateFilter && (
                            <div
                                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-400 hover:text-red-500 transition-colors"
                                onClick={() => setDateFilter("")}
                                title="Clear date filter"
                            >
                                <FaTimes className="text-[12px]" />
                            </div>
                        )}
                    </div>


                       {/* Searchable Dept Filter */}
                    <div className="relative w-full sm:w-56" ref={roleDropdownRef}>
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 z-10">
                            <FaBriefcase className="text-sm" />
                        </div>
                        <div
                            className="w-full bg-white py-2 pl-10 pr-10 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all hover:bg-gray-50 cursor-pointer shadow-sm relative overflow-hidden text-ellipsis whitespace-nowrap"
                            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                        >
                            {roleFilter || "Select Role"}
                        </div>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 z-10">
                            {roleFilter ? (
                                <FaTimes
                                    className="text-[12px] text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
                                    onClick={(e) => { e.stopPropagation(); setRoleFilter(""); }}
                                    title="Clear role filter"
                                />
                            ) : (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 pointer-events-none"><path d="m6 9 6 6 6-6" /></svg>
                            )}
                        </div>

                        {isRoleDropdownOpen && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="p-2 border-b border-gray-100 bg-gray-50">
                                    <div className="relative">
                                        <FaUserTie className="absolute left-2.5 top-2.5 text-gray-400 text-xs" />
                                        <input
                                            type="text"
                                            className="w-full py-1.5 pl-8 pr-4 text-xs bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Search dept..."
                                            value={roleSearchQuery}
                                            onChange={(e) => setRoleSearchQuery(e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            autoFocus
                                        />
                                    </div>
                                </div>
                                <div className="max-h-60 overflow-y-auto py-1">
                                    <div
                                        className={`px-4 py-2 text-xs font-bold cursor-pointer hover:bg-indigo-50 transition-colors ${!roleFilter ? 'text-indigo-600 bg-indigo-50/50' : 'text-gray-600'}`}
                                        onClick={() => { setRoleFilter(""); setIsRoleDropdownOpen(false); setRoleSearchQuery(""); }}
                                    >
                                        All Depts
                                    </div>
                                    {roles
                                        .filter(r => r.name.toLowerCase().includes(roleSearchQuery.toLowerCase()))
                                        .map((r) => (
                                            <div
                                                key={r._id}
                                                className={`px-4 py-2 text-xs font-bold cursor-pointer hover:bg-indigo-50 transition-colors ${roleFilter === r.name ? 'text-indigo-600 bg-indigo-50/50' : 'text-gray-600'}`}
                                                onClick={() => { setRoleFilter(r.name); setIsRoleDropdownOpen(false); setRoleSearchQuery(""); }}
                                            >
                                                {r.name}
                                            </div>
                                        ))
                                    }
                                    {roles.filter(r => r.name.toLowerCase().includes(roleSearchQuery.toLowerCase())).length === 0 && (
                                        <div className="px-4 py-3 text-xs text-gray-400 text-center font-medium italic">
                                            No depts found
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    

                    {/* Searchable Dept Filter */}
                    <div className="relative w-full sm:w-56" ref={roleDropdownRef}>
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 z-10">
                            <FaBriefcase className="text-sm" />
                        </div>
                        <div
                            className="w-full bg-white py-2 pl-10 pr-10 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all hover:bg-gray-50 cursor-pointer shadow-sm relative overflow-hidden text-ellipsis whitespace-nowrap"
                            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                        >
                            {roleFilter || "Select Dept"}
                        </div>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 z-10">
                            {roleFilter ? (
                                <FaTimes
                                    className="text-[12px] text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
                                    onClick={(e) => { e.stopPropagation(); setRoleFilter(""); }}
                                    title="Clear role filter"
                                />
                            ) : (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 pointer-events-none"><path d="m6 9 6 6 6-6" /></svg>
                            )}
                        </div>

                        {isRoleDropdownOpen && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="p-2 border-b border-gray-100 bg-gray-50">
                                    <div className="relative">
                                        <FaUserTie className="absolute left-2.5 top-2.5 text-gray-400 text-xs" />
                                        <input
                                            type="text"
                                            className="w-full py-1.5 pl-8 pr-4 text-xs bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Search dept..."
                                            value={roleSearchQuery}
                                            onChange={(e) => setRoleSearchQuery(e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            autoFocus
                                        />
                                    </div>
                                </div>
                                <div className="max-h-60 overflow-y-auto py-1">
                                    <div
                                        className={`px-4 py-2 text-xs font-bold cursor-pointer hover:bg-indigo-50 transition-colors ${!roleFilter ? 'text-indigo-600 bg-indigo-50/50' : 'text-gray-600'}`}
                                        onClick={() => { setRoleFilter(""); setIsRoleDropdownOpen(false); setRoleSearchQuery(""); }}
                                    >
                                        All Depts
                                    </div>
                                    {roles
                                        .filter(r => r.name.toLowerCase().includes(roleSearchQuery.toLowerCase()))
                                        .map((r) => (
                                            <div
                                                key={r._id}
                                                className={`px-4 py-2 text-xs font-bold cursor-pointer hover:bg-indigo-50 transition-colors ${roleFilter === r.name ? 'text-indigo-600 bg-indigo-50/50' : 'text-gray-600'}`}
                                                onClick={() => { setRoleFilter(r.name); setIsRoleDropdownOpen(false); setRoleSearchQuery(""); }}
                                            >
                                                {r.name}
                                            </div>
                                        ))
                                    }
                                    {roles.filter(r => r.name.toLowerCase().includes(roleSearchQuery.toLowerCase())).length === 0 && (
                                        <div className="px-4 py-3 text-xs text-gray-400 text-center font-medium italic">
                                            No depts found
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Score Filter */}
                    <div className="relative w-full sm:w-auto">
                        <select
                            className="w-full appearance-none bg-white py-2 pl-4 pr-10 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all hover:bg-gray-50 cursor-pointer shadow-sm sm:w-40"
                            value={scoreFilter}
                            onChange={(e) => setScoreFilter(Number(e.target.value))}
                        >
                            <option value="0">All Scores</option>
                            <option value="60">60% & Above</option>
                            <option value="70">70% & Above</option>
                            <option value="80">80% & Above</option>
                            <option value="90">90% & Above</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            {scoreFilter > 0 ? (
                                <FaTimes
                                    className="text-[12px] text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
                                    onClick={() => setScoreFilter(0)}
                                    title="Clear score filter"
                                />
                            ) : (
                                <FaStar className="text-[10px] text-gray-400 pointer-events-none" />
                            )}
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full sm:w-auto sm:min-w-[250px] md:min-w-[300px]">
                        <input
                            type="text"
                            className="w-full py-2 pl-10 pr-10 text-sm text-gray-700 placeholder-gray-400 transition-all border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                            placeholder="Search name, mobile, role..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                            <FaUserGraduate className="text-sm" />
                        </div>
                        {searchQuery && (
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                <FaTimes
                                    className="text-[12px] text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
                                    onClick={() => setSearchQuery("")}
                                    title="Clear search"
                                />
                            </div>
                        )}
                    </div>

                    {/* Reset All Filters Button */}
                    {(searchQuery || scoreFilter > 0 || roleFilter || dateFilter) && (
                        <button
                            onClick={() => {
                                setSearchQuery("");
                                setScoreFilter(0);
                                setRoleFilter("");
                                setDateFilter("");
                                setRoleSearchQuery("");
                            }}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 hover:text-gray-900 rounded-lg transition-colors shadow-sm"
                            title="Reset all filters"
                        >
                            <FaSync className="text-xs" />
                            <span className="hidden sm:inline">Reset</span>
                        </button>
                    )}
                </div>
            </div>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

            <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading Applicants...</div>
                ) : filteredApplications.length > 0 ? (
                    <table className="min-w-full">
                        <thead className="text-left text-sm text-white bg-gradient-to-r from-purple-500 to-blue-600">
                            <tr>
                                <th className="py-3 px-4 text-center">Candidate Name</th>
                                <th className="py-3 px-4 text-center">Applied Role</th>
                                <th className="py-3 px-4 text-center">Contact</th>
                                {/* <th className="py-3 px-4 text-center">Rating</th> */}
                                <th className="py-3 px-4 text-center">Assement Score (100)</th>
                                {/* <th className="py-3 px-4 text-center">Rating (10)</th> */}
                                <th className="py-3 px-4 text-center">Status</th>
                                <th className="py-3 px-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredApplications.map((app) => (
                                <tr key={app._id} className="border-b hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-sm font-medium text-center">
                                        <div className="font-bold text-gray-800">{app.firstName} {app.lastName}</div>
                                        <div className="text-[10px] text-gray-400">{new Date(app.appliedAt).toLocaleDateString()}</div>
                                    </td>
                                    <td className="p-4 text-sm font-medium text-center">
                                        <span className="inline-block px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full">
                                            {app.jobId?.role || "System Specialist"}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm font-medium text-center text-gray-600">
                                        <div className="flex flex-col items-center">
                                            <span>{app.mobile}</span>
                                        </div>
                                    </td>
                                    {/* <td className="p-4 text-sm font-medium text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <FaStar className="text-yellow-400" />
                                            <span>{app.overallRating || 0}/5</span>
                                        </div>
                                    </td> */}
                                    <td className="p-4 text-sm font-medium text-center">
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            className="w-20 p-1.5 border rounded-lg text-xs text-center focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold bg-gray-50"
                                            value={app.technicalScore || 0}
                                            onChange={(e) => handleUpdateScore(app._id, "technicalScore", e.target.value)}
                                        />
                                    </td>
                                    {/* <td className="p-4 text-sm font-medium text-center">
                                        <select
                                            className="p-1 border rounded text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={app.overallRating || 0}
                                            onChange={(e) => handleUpdateScore(app._id, "overallRating", e.target.value)}
                                        >
                                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => <option key={v} value={v}>{v}</option>)}
                                        </select>
                                    </td> */}
                                    <td className="p-4 text-sm font-medium text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${app.status === 'Selected' ? 'bg-green-100 text-green-700' :
                                                app.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                    app.status === 'Resigned' ? 'bg-orange-100 text-orange-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {(app.status || "Applied").toUpperCase()}
                                            </span>
                                            {app.status === 'Resigned' && app.resignationStatus === 'Pending' && (
                                                <span className="text-[8px] font-black text-red-500 animate-pulse uppercase tracking-tighter">
                                                    Resignation Requested
                                                </span>
                                            )}
                                            {(app.interviewStatus === 'Invited' || app.interviewStatus === 'Rescheduled') && app.candidateInterviewStatus && app.candidateInterviewStatus !== 'Pending' && (
                                                <span className={`text-[8px] font-black uppercase tracking-tighter ${app.candidateInterviewStatus === 'Confirmed' ? 'text-indigo-600' : 'text-rose-600'}`}>
                                                    Interview {app.candidateInterviewStatus}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm font-medium text-center">
                                        <div className="flex justify-center gap-3">
                                            <button
                                                onClick={() => handleOpenModal(app)}
                                                className="text-blue-600 hover:text-blue-800 transition flex items-center gap-1 font-bold text-xs"
                                                title="View Details"
                                            >
                                                <FaEye /> View
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (app.resume) {
                                                        window.open(formatDocumentUrl(app.resume), '_blank');
                                                    }
                                                }}
                                                className="text-gray-600 hover:text-blue-600 transition flex items-center gap-1 font-bold text-xs"
                                                title="View Resume"
                                            >
                                                <FaDownload /> Resume
                                            </button>
                                            <button
                                                onClick={() => window.location.href = "/score"}
                                                className="text-purple-600 hover:text-purple-800 transition flex items-center gap-1 font-bold text-xs"
                                                title="Score Board"
                                            >
                                                <FaStar /> Score
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                            <FaUserGraduate size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-800">No applicants yet</h3>
                        <p className="text-gray-500">New job applications will appear here once candidates apply.</p>
                    </div>
                )}
            </div>

            {/* Candidate Details Modal */}
            {/* {isModalOpen && selectedApplicant && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 relative animate-in fade-in zoom-in duration-300">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-6 right-6 text-gray-400 hover:text-rose-500 transition-colors"
                        >
                            <FaTimesCircle size={24} />
                        </button>

                        <div className="flex items-center gap-5 mb-8 border-b border-gray-100 pb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-100">
                                {selectedApplicant.firstName.charAt(0)}{selectedApplicant.lastName.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 leading-tight">
                                    {selectedApplicant.firstName} {selectedApplicant.lastName}
                                </h2>
                                <p className="text-blue-600 text-xs font-black uppercase tracking-[0.2em] mt-1">
                                    {selectedApplicant.jobId?.role || "Position Applicant"}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                            <DetailItem icon={<FaEnvelope />} label="Email Address" value={selectedApplicant.email} />
                            <DetailItem icon={<FaPhone />} label="Mobile Number" value={selectedApplicant.mobile} />
                            <DetailItem icon={<FaBriefcase />} label="Total Experience" value={selectedApplicant.experience || "Not Provided"} />
                            <DetailItem icon={<FaBuilding />} label="Current Company" value={selectedApplicant.currentCompany || "Freelance / None"} />
                            <DetailItem icon={<FaMoneyBillWave />} label="Current salary (CTC)" value={selectedApplicant.currentCTC || "Negotiable"} />
                            <DetailItem icon={<FaMoneyBillWave />} label="Expected salary (CTC)" value={selectedApplicant.expectedCTC || "As per policy"} />
                            <DetailItem icon={<FaCalendarCheck />} label="Notice Period" value={selectedApplicant.noticePeriod || "Immediate"} />
                            <DetailItem icon={<FaMapMarkerAlt />} label="Current Location" value={selectedApplicant.currentLocation || "N/A"} />
                        </div>

                        {selectedApplicant.skills && (
                            <div className="mt-10 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Technical Skills</p>
                                <div className="flex flex-wrap gap-2">
                                    {selectedApplicant.skills.split(',').map((skill, i) => (
                                        <span key={i} className="px-3 py-1 bg-white border border-gray-200 text-gray-600 text-[10px] font-bold rounded-lg shadow-sm">
                                            {skill.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-10 flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-50">
                            <button
                                onClick={() => {
                                    if (selectedApplicant.resume) {
                                        // Ensure we only use the relative path starting from 'uploads/'
                                        const relativePath = selectedApplicant.resume.includes("uploads")
                                            ? "uploads/" + selectedApplicant.resume.split(/uploads[\\/]/).pop().replace(/\\/g, "/")
                                            : selectedApplicant.resume.replace(/\\/g, "/");

                                        window.open(`${API_BASE_URL.replace('/api', '')}/${relativePath}`, '_blank');
                                    }
                                }}
                                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
                            >
                                <FaDownload /> Download Resume
                            </button>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-all"
                            >
                                Close View
                            </button>
                        </div>
                    </div>
                </div>

              

            )} */}

            {isModalOpen && selectedApplicant && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-3xl rounded-xl shadow-xl relative overflow-hidden">

                        {/* Close Button */}
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                        >
                            <FaTimesCircle size={18} />
                        </button>

                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800">
                                    {selectedApplicant.firstName} {selectedApplicant.lastName}
                                </h2>
                                <p className="text-xs text-gray-500">
                                    {selectedApplicant.role || "Applicant"}
                                </p>
                            </div>

                            <span className={`px-3 py-1 text-xs font-semibold rounded-full
          ${selectedApplicant.status === "Pending"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : selectedApplicant.status === "Selected"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"}`}>
                                {selectedApplicant.status}
                            </span>
                        </div>

                        {/* Body */}
                        <div className="p-6 text-sm text-gray-700 space-y-6 max-h-[75vh] overflow-y-auto">

                            {/* Basic Info */}
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">
                                    Basic Information
                                </h3>
                                <div className="grid grid-cols-2 gap-y-2 gap-x-6">
                                    <Info label="Email" value={selectedApplicant.email} />
                                    <Info label="Mobile" value={selectedApplicant.mobile} />
                                    <Info label="Location" value={selectedApplicant.currentLocation} />
                                    <Info label="Notice Period" value={selectedApplicant.noticePeriod || "Immediate"} />
                                </div>
                            </div>

                            {/* Education */}
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">
                                    Education
                                </h3>
                                <div className="grid grid-cols-2 gap-y-2 gap-x-6">
                                    <Info label="Qualification" value={selectedApplicant.highestQualification} />
                                    <Info label="Institution" value={selectedApplicant.institution} />
                                    <Info label="Department" value={selectedApplicant.department} />
                                    <Info label="Percentage" value={selectedApplicant.percentage ? `${selectedApplicant.percentage}%` : "N/A"} />
                                </div>
                            </div>

                            {/* Experience */}
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">
                                    Experience
                                </h3>
                                <div className="grid grid-cols-2 gap-y-2 gap-x-6">
                                    <Info label="Total Exp" value={`${selectedApplicant.experience || 0} Years`} />
                                    <Info label="Company" value={selectedApplicant.companyName} />
                                    <Info label="Current CTC" value={selectedApplicant.currentCTC} />
                                    <Info label="Expected CTC" value={selectedApplicant.expectedCTC} />
                                </div>
                            </div>

                            {/* Skills */}
                            {selectedApplicant.skills && (
                                <div>
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">
                                        Skills
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedApplicant.skills.split(",").map((skill, i) => (
                                            <span
                                                key={i}
                                                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                                            >
                                                {skill.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Scores */}
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">
                                    Assessment Scores
                                </h3>

                                <div className="grid grid-cols-4 gap-4 text-center">
                                    <ScoreMini label="Tech" score={selectedApplicant.technicalScore} />
                                    <ScoreMini label="Appear" score={selectedApplicant.appearanceScore} />
                                    <ScoreMini label="Knowledge" score={selectedApplicant.workKnowledge} />
                                    <ScoreMini label="Overall" score={selectedApplicant.overallRating} />
                                </div>
                            </div>

                            {/* Interview Confirmation */}
                            {(selectedApplicant.interviewStatus === 'Invited' || selectedApplicant.interviewStatus === 'Rescheduled') && (
                                <div className={`p-4 rounded-xl border ${selectedApplicant.candidateInterviewStatus === 'Confirmed' ? 'bg-indigo-50 border-indigo-100' : selectedApplicant.candidateInterviewStatus === 'Declined' ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xs font-bold text-gray-700 uppercase flex items-center gap-2">
                                            <FaCalendarCheck className={selectedApplicant.candidateInterviewStatus === 'Confirmed' ? 'text-indigo-500' : 'text-gray-400'} /> Interview Confirmation
                                        </h3>
                                        <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-widest ${selectedApplicant.candidateInterviewStatus === 'Confirmed' ? 'bg-indigo-100 text-indigo-700' : selectedApplicant.candidateInterviewStatus === 'Declined' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {selectedApplicant.candidateInterviewStatus || 'Pending'}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-3">
                                        <Info label="Scheduled Time" value={selectedApplicant.interviewTime} />
                                        <Info label="Interview Mode" value={selectedApplicant.interviewMode || "Online"} />
                                    </div>
                                    {selectedApplicant.candidateInterviewNote && (
                                        <div className="mt-3 p-3 bg-white rounded-lg border border-gray-100 text-xs text-gray-600 italic">
                                            "{selectedApplicant.candidateInterviewNote}"
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Comment */}
                            {selectedApplicant.comment && (
                                <div className="text-xs bg-gray-50 p-3 rounded-md border text-gray-600">
                                    {selectedApplicant.comment}
                                </div>
                            )}

                            {/* Resignation Details */}
                            {selectedApplicant.status === "Resigned" && (
                                <div className="mt-6 p-6 bg-red-50 rounded-2xl border border-red-100 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-bold text-red-800 flex items-center gap-2">
                                            <FaUserTie className="text-red-500" /> Resignation Request
                                        </h3>
                                        <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-widest ${selectedApplicant.resignationStatus === 'Approved' ? 'bg-green-100 text-green-700' :
                                            selectedApplicant.resignationStatus === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {selectedApplicant.resignationStatus || 'Pending'}
                                        </span>
                                    </div>

                                    {selectedApplicant.resignationLetter && (
                                        <div className="bg-white p-4 rounded-xl border border-red-100 text-xs text-gray-700 italic leading-relaxed max-h-40 overflow-y-auto">
                                            "{selectedApplicant.resignationLetter}"
                                        </div>
                                    )}

                                    {selectedApplicant.resignationStatus === 'Pending' && (
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleResignationStatusUpdate(selectedApplicant._id, "Approved")}
                                                className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold uppercase rounded-lg transition-all"
                                            >
                                                Approve Resignation
                                            </button>
                                            <button
                                                onClick={() => handleResignationStatusUpdate(selectedApplicant._id, "Rejected")}
                                                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase rounded-lg transition-all"
                                            >
                                                Reject Resignation
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    if (selectedApplicant?.resume) {
                                        window.open(formatDocumentUrl(selectedApplicant.resume), "_blank");
                                    }
                                }}
                                className="px-4 py-2 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700"
                            >
                                View Resume
                            </button>

                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 bg-gray-800 text-white text-xs rounded-md hover:bg-black"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
};

export default JobApplicants;
