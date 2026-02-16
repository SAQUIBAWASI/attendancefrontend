import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import {
    FaUserCircle, FaBriefcase, FaCalendarCheck, FaHourglassHalf,
    FaCheckCircle, FaTimesCircle, FaTasks, FaSearch, FaMapMarkerAlt,
    FaMoneyBillWave, FaClock, FaInbox, FaRegClipboard, FaBuilding,
    FaArrowRight, FaDownload, FaChevronRight, FaSignOutAlt, FaCog,
    FaFilter, FaTimes, FaList, FaThLarge, FaTable, FaChartBar, FaCalendarAlt, FaStar, FaRegStar,
    FaEye, FaFilePdf, FaCheck, FaExclamationTriangle, FaUpload
} from "react-icons/fa";

const CandidateDashboard = () => {
    const [activeTab, setActiveTab] = useState("overview");
    const [profile, setProfile] = useState(null);
    const [appliedJobs, setAppliedJobs] = useState([]);
    const [allJobs, setAllJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploadingDoc, setUploadingDoc] = useState(false);
    const [activeDocTab, setActiveDocTab] = useState("offer");

    const handleViewDocument = (app) => {
        setSelectedOffer(app);
        if (app.adminAgreements || app.adminAttachment) {
            setActiveDocTab("agreement");
        } else {
            setActiveDocTab("offer");
        }
        setIsModalOpen(true);
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem("candidateToken");
            if (!token) {
                window.location.href = "/candidate-login";
                return;
            }

            const headers = { Authorization: `Bearer ${token}` };

            const profileRes = await axios.get(`${API_BASE_URL}/candidate/profile`, { headers });
            setProfile(profileRes.data);

            const appsRes = await axios.get(`${API_BASE_URL}/candidate/applications`, { headers });
            setAppliedJobs(appsRes.data);

            const allJobsRes = await axios.get(`${API_BASE_URL}/jobs/all`);
            setAllJobs(allJobsRes.data.jobPosts || []);

        } catch (err) {
            console.error("Fetch dashboard error:", err);
            if (err.response?.status === 401) {
                window.location.href = "/candidate-login";
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (applicationId, file) => {
        if (!file) return;

        const formData = new FormData();
        formData.append("applicationId", applicationId);
        formData.append("signedDoc", file);

        try {
            setUploadingDoc(true);
            const res = await axios.post(`${API_BASE_URL}/applications/upload-signed-docs`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            if (res.data.success) {
                alert("Document uploaded for review!");
                fetchDashboardData();
            }
        } catch (err) {
            alert("Upload failed. Please try again.");
        } finally {
            setUploadingDoc(false);
        }
    };

    const getStatusBadge = (status) => {
        const baseClasses = "px-2 py-0.5 text-[10px] font-medium rounded-full";
        switch (status) {
            case "Hired": return <span className={`${baseClasses} bg-green-100 text-green-700`}>Hired</span>;
            case "Selected": return <span className={`${baseClasses} bg-teal-100 text-teal-700`}>Selected</span>;
            case "Rejected": return <span className={`${baseClasses} bg-red-100 text-red-700`}>Rejected</span>;
            case "Shortlisted": return <span className={`${baseClasses} bg-purple-100 text-purple-700`}>Shortlisted</span>;
            case "Interview": return <span className={`${baseClasses} bg-orange-100 text-orange-700`}>Interview</span>;
            case "New": return <span className={`${baseClasses} bg-blue-100 text-blue-700`}>New</span>;
            default: return <span className={`${baseClasses} bg-slate-100 text-slate-700`}>{status || "Applied"}</span>;
        }
    };

    const getTagColor = (index) => {
        const colors = [
            'bg-blue-100 text-blue-700',
            'bg-pink-100 text-pink-700',
            'bg-purple-100 text-purple-700',
            'bg-orange-100 text-orange-700',
            'bg-teal-100 text-teal-700'
        ];
        return colors[index % colors.length];
    };

    const renderStars = (count) => {
        return (
            <div className="flex gap-0.5 text-xs text-yellow-500">
                {[1, 2, 3].map((s) => (
                    s <= count ? <FaStar key={s} /> : <FaRegStar key={s} className="text-slate-200" />
                ))}
            </div>
        );
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-2 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-slate-400 text-[10px] font-medium uppercase tracking-widest">Loading Dashboard...</p>
            </div>
        </div>
    );

    const interviewJobs = appliedJobs.filter(app => app.interviewStatus === "Invited");
    // Separate Offers and Agreements
    const offerApps = appliedJobs.filter(app => app.offerLetter);
    const agreementApps = appliedJobs.filter(app => app.adminAgreements || app.adminAttachment);

    const logout = () => {
        localStorage.removeItem("candidateToken");
        localStorage.removeItem("candidateId");
        window.location.href = "/candidate-login";
    };

    // Filter logic for search
    const filteredApps = appliedJobs.filter(app => {
        const query = searchQuery.toLowerCase();
        return (app.jobId?.role || "").toLowerCase().includes(query) || (profile?.name || "").toLowerCase().includes(query);
    });

    const filteredJobs = allJobs.filter(job => {
        const query = searchQuery.toLowerCase();
        return (job.role || "").toLowerCase().includes(query) || (job.company || "Timely Health").toLowerCase().includes(query);
    });

    return (
        <div className="min-h-screen bg-white font-sans text-slate-800">
            {/* Odoo-Style Top Navbar */}
            <nav className="bg-gradient-to-r from-[#9333EA] to-[#2563EB] text-white flex items-center justify-between px-4 py-2 sticky top-0 z-50 shadow-md">
                <div className="flex items-center gap-3 sm:gap-6 flex-1 min-w-0">
                    <div className="flex items-center gap-2 cursor-pointer group shrink-0" onClick={() => window.location.reload()}>
                        <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center transition-transform group-hover:scale-110">
                            <div className="w-4 h-4 bg-[#9333EA] rounded-sm"></div>
                        </div>
                        <span className="font-semibold text-sm hidden xs:block">Recruitment</span>
                    </div>
                    <div className="flex gap-4 text-sm font-medium opacity-80 overflow-x-auto no-scrollbar scroll-smooth flex-1 min-w-0">
                        {["overview", "all-jobs", "applications", "interviews", "offers", "documents"].map((tab) => (
                            <span
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`cursor-pointer hover:opacity-100 transition-all whitespace-nowrap pb-1 ${activeTab === tab ? "border-b-2 border-white font-bold opacity-100" : ""}`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1).replace("-", " ")}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* <div className="relative cursor-pointer">
                        <FaInbox className="text-lg opacity-80" />
                        <span className="absolute -top-1 -right-1 bg-white text-[#9333EA] text-[8px] px-1 rounded-full border border-white/20 font-bold">4</span>
                    </div> */}
                    {/* Hide clock on mobile to save space */}
                    <FaClock className="hidden sm:block text-lg opacity-80" />
                    <div className="flex items-center gap-2 sm:pl-4 sm:border-l sm:border-white/20">
                        <span className="hidden sm:block text-xs font-medium">{profile?.name}</span>
                        <div className="w-7 h-7 bg-indigo-500 text-white rounded-full flex items-center justify-center text-[11px] font-bold border border-white/20">
                            {profile?.firstName?.charAt(0)}{profile?.lastName?.charAt(0)}
                        </div>
                        <FaSignOutAlt onClick={logout} className="ml-1 sm:ml-2 text-sm cursor-pointer opacity-80 hover:opacity-100" title="Logout" />
                    </div>
                </div>
            </nav>

            {/* Sub Nav / Action Bar */}
            <div className="bg-white border-b border-slate-200 px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-[44px] z-40">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <button className="bg-[#9333EA] hover:bg-[#7e22ce] text-white px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-tight shadow-sm transition-all active:scale-95">
                        New
                    </button>
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-medium text-slate-700 capitalize">
                            {activeTab.replace("-", " ")}
                        </h2>
                        <FaCog className="text-slate-400 cursor-pointer hover:text-slate-600 outline-none" />
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-2 md:pb-0">
                    {/* Unified Search Bar */}
                    <div className="flex-1 md:w-96 relative flex items-center bg-slate-50 border border-slate-300 rounded-md shadow-inner focus-within:ring-1 focus-within:ring-[#9333EA] focus-within:border-[#2563EB]">
                        <div className="pl-3 pr-2 border-r border-slate-200">
                            <FaSearch className="text-slate-400 text-[10px]" />
                        </div>
                        <div className="flex items-center gap-1 bg-blue-100 text-[#2563EB] text-[10px] font-black px-2 py-0.5 rounded m-1.5 whitespace-nowrap">
                            <FaFilter className="text-[8px]" />
                            <span className="uppercase tracking-tighter">Applicants</span>
                            <FaTimes className="text-[8px] cursor-pointer" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search everything..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none outline-none py-2 px-2 text-xs w-full text-slate-700 placeholder:text-slate-400"
                        />
                        <div className="px-3 border-l border-slate-200 cursor-pointer hover:bg-slate-100">
                            <FaChevronRight className="text-slate-400 text-[8px] rotate-90" />
                        </div>
                    </div>

                    <div className="hidden sm:flex border border-slate-300 rounded overflow-hidden shadow-sm">
                        <button className="p-2.5 bg-slate-50 hover:bg-slate-100 border-r border-slate-200 text-slate-600 transition-colors"><FaList size={11} /></button>
                        <button className="p-2.5 bg-white text-slate-400 hover:text-slate-600 border-r border-slate-200"><FaThLarge size={11} /></button>
                        <button className="p-2.5 bg-white text-slate-400 hover:text-slate-600 border-r border-slate-200"><FaTable size={11} /></button>
                        <button className="p-2.5 bg-white text-slate-400 hover:text-slate-600 border-r border-slate-200"><FaChartBar size={11} /></button>
                        <button className="p-2.5 bg-white text-slate-400 hover:text-slate-600 border-r border-slate-200"><FaCalendarAlt size={11} /></button>
                        <button className="p-2.5 bg-white text-slate-400 hover:text-slate-600"><FaClock size={11} /></button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="p-0 bg-white">

                {/* OVERVIEW SECTION (Odoo Widgets) */}
                {activeTab === "overview" && (
                    <div className="p-4 md:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {[
                            { label: "Active Applications", value: appliedJobs.length, icon: <FaTasks className="text-[#2563EB]" />, color: "border-[#2563EB]" },
                            { label: "Interviews Scheduled", value: interviewJobs.length, icon: <FaCalendarCheck className="text-orange-500" />, color: "border-orange-400" },
                            { label: "Available Positions", value: allJobs.length, icon: <FaBriefcase className="text-[#2563EB]" />, color: "border-[#2563EB]" },
                            { label: "Official Offers", value: offerApps.length, icon: <FaRegClipboard className="text-[#9333EA]" />, color: "border-[#9333EA]" }
                        ].map((widget, i) => (
                            <div key={i} className={`bg-white border-l-4 ${widget.color} p-6 shadow-md rounded-r-lg hover:shadow-xl transition-shadow cursor-pointer group`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{widget.label}</p>
                                        <h3 className="text-3xl font-black text-slate-800">{widget.value}</h3>
                                    </div>
                                    <div className="text-2xl opacity-20 group-hover:opacity-100 transition-opacity">
                                        {widget.icon}
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-[#2563EB] uppercase">
                                    View Report <FaArrowRight size={8} />
                                </div>
                            </div>
                        ))}

                        <div className="col-span-1 lg:col-span-4 mt-8">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 border-b border-slate-100 pb-2">Recent Engagement</h3>
                            <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                                {appliedJobs.slice(0, 3).map((app, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 border-b border-slate-200 last:border-0 hover:bg-white transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 bg-white border border-slate-200 rounded flex items-center justify-center text-slate-400"><FaClock size={12} /></div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-700">Applied for {app.jobId?.role}</p>
                                                <p className="text-[10px] text-slate-400 uppercase tracking-widest">{new Date(app.appliedAt).toDateString()}</p>
                                            </div>
                                        </div>
                                        <span className="text-[9px] font-black px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full uppercase">Submitted</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* OPPORTUNITIES SECTION (Odoo List + Mobile Cards) */}
                {activeTab === "all-jobs" && (
                    <div className="overflow-x-auto">
                        {/* Desktop Table */}
                        <table className="w-full text-left border-collapse table-auto hidden md:table">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 w-10"><input type="checkbox" className="rounded" /></th>
                                    <th className="px-6 py-3 text-[11px] font-bold text-slate-600 uppercase tracking-tight">Requirement</th>
                                    <th className="px-6 py-3 text-[11px] font-bold text-slate-600 uppercase tracking-tight">Location</th>
                                    <th className="px-6 py-3 text-[11px] font-bold text-slate-600 uppercase tracking-tight text-center">Difficulty</th>
                                    <th className="px-6 py-3 text-[11px] font-bold text-slate-600 uppercase tracking-tight text-center">Expertise</th>
                                    <th className="px-6 py-3 text-[11px] font-bold text-slate-600 uppercase tracking-tight">Compensation</th>
                                    <th className="px-6 py-3 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredJobs.map((job, idx) => (
                                    <tr key={job._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4"><input type="checkbox" className="rounded border-slate-300" /></td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center text-indigo-600 font-black text-xs">
                                                    {job.role?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{job.role}</p>
                                                    <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Timely Health PVT LTD</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium text-slate-600"><FaMapMarkerAlt className="inline mr-1 text-slate-300" /> Pan-India</td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center">{renderStars(idx % 2 + 1)}</div>
                                        </td>
                                        <td className="px-6 py-4 text-center text-[10px] font-black uppercase text-slate-500 whitespace-nowrap">
                                            {job.experience || "Fresher"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-bold text-green-600">{job.salary || "Competitive"}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    onClick={() => window.location.href = `/jobs/${job.link?.split('/').pop()}`}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold uppercase tracking-widest transition-colors shadow-sm"
                                                    title="View Full Details"
                                                >
                                                    <FaEye size={12} className="text-[#9333EA]" /> View
                                                </button>
                                                <button
                                                    onClick={() => window.location.href = `/jobs/${job.link?.split('/').pop()}`}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded text-[10px] font-bold uppercase tracking-widest transition-colors shadow-sm"
                                                    title="Apply Now"
                                                >
                                                    <FaArrowRight size={10} /> Apply
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Mobile Cards */}
                        <div className="md:hidden space-y-4 p-4">
                            {filteredJobs.map((job, idx) => (
                                <div key={job._id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-black text-sm">
                                                {job.role?.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-800">{job.role}</h4>
                                                <p className="text-[10px] text-slate-400 uppercase font-black">Timely Health</p>
                                            </div>
                                        </div>
                                        {renderStars(idx % 2 + 1)}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase">
                                            <FaMapMarkerAlt className="text-slate-300" /> Pan-India
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase">
                                            <FaChartBar className="text-slate-300" /> {job.experience || "Fresher"}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-green-600 font-bold uppercase col-span-2">
                                            <FaMoneyBillWave className="text-green-300" /> {job.salary || "Competitive"}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => window.location.href = `/jobs/${job.link?.split('/').pop()}`}
                                            className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded text-[10px] font-black uppercase tracking-widest border border-slate-200"
                                        >
                                            Details
                                        </button>
                                        <button
                                            onClick={() => window.location.href = `/jobs/${job.link?.split('/').pop()}`}
                                            className="flex-1 py-2 bg-[#2563EB] text-white rounded text-[10px] font-black uppercase tracking-widest"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* APPLICATIONS SECTION (Desktop Table + Mobile Cards) */}
                {activeTab === "applications" && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse table-auto hidden md:table">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 w-10"><input type="checkbox" className="rounded" /></th>
                                    <th className="px-6 py-3 text-[11px] font-bold text-slate-600 uppercase tracking-tight">Name</th>
                                    <th className="px-6 py-3 text-[11px] font-bold text-slate-600 uppercase tracking-tight whitespace-nowrap">Applied on</th>
                                    <th className="px-6 py-3 text-[11px] font-bold text-slate-600 uppercase tracking-tight">Job Position</th>
                                    <th className="px-6 py-3 text-[11px] font-bold text-slate-600 uppercase tracking-tight">Stage</th>
                                    <th className="px-6 py-3 text-[11px] font-bold text-slate-600 uppercase tracking-tight text-center">Matching</th>
                                    <th className="px-6 py-3 text-[11px] font-bold text-slate-600 uppercase tracking-tight">Tags</th>
                                    <th className="px-6 py-3 text-[11px] font-bold text-slate-600 uppercase tracking-tight">Recruiter</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredApps.map((app, idx) => (
                                    <tr key={app._id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                                        <td className="px-6 py-4"><input type="checkbox" className="rounded border-slate-300" /></td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-900">{profile?.name}</td>
                                        <td className="px-6 py-4 text-[11px] text-slate-500 font-bold uppercase tracking-tighter">
                                            {new Date(app.appliedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">{app.jobId?.role}</td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(app.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center">
                                                {renderStars(idx % 3 + 1)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tight ${getTagColor(idx)}`}>Demo</span>
                                                {idx % 2 === 0 && <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tight ${getTagColor(idx + 1)}`}>Priority</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 bg-indigo-500 text-white rounded-[4px] flex items-center justify-center text-[10px] font-black uppercase shadow-sm">
                                                    K
                                                </div>
                                                <span className="text-xs text-slate-600 font-medium whitespace-nowrap">K.kumar Kumar</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Mobile Cards */}
                        <div className="md:hidden space-y-4 p-4">
                            {filteredApps.map((app, idx) => (
                                <div key={app._id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                                    <div className="flex justify-between items-center mb-3">
                                        <div>
                                            <h4 className="text-sm font-black text-slate-800">{app.jobId?.role}</h4>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(app.appliedAt).toDateString()}</p>
                                        </div>
                                        {getStatusBadge(app.status)}
                                    </div>
                                    <div className="flex items-center justify-between mt-4 py-2 border-t border-slate-50">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 bg-indigo-500 text-white rounded-[4px] flex items-center justify-center text-[8px] font-black uppercase">K</div>
                                            <span className="text-[10px] text-slate-500 font-bold">K.kumar</span>
                                        </div>
                                        {renderStars(idx % 3 + 1)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* INTERVIEWS SECTION (Desktop Table + Mobile Cards) */}
                {activeTab === "interviews" && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse table-auto hidden md:table">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 w-10"><input type="checkbox" className="rounded" /></th>
                                    <th className="px-6 py-3 text-[11px] font-bold text-slate-600 uppercase tracking-tight">Meeting Reference</th>
                                    <th className="px-6 py-3 text-[11px] font-bold text-slate-600 uppercase tracking-tight">Timeline</th>
                                    <th className="px-6 py-3 text-[11px] font-bold text-slate-600 uppercase tracking-tight">Mode</th>
                                    <th className="px-6 py-3 text-[11px] font-bold text-slate-600 uppercase tracking-tight">Verification</th>
                                    <th className="px-6 py-3 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {interviewJobs.length > 0 ? interviewJobs.map((app, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4"><input type="checkbox" className="rounded border-slate-300" /></td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded flex items-center justify-center"><FaCalendarAlt size={12} /></div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{app.jobId?.role} Discussion</p>
                                                    <p className="text-[10px] text-slate-400 font-mono">REF: INTERVIEW-{app._id.slice(-4).toUpperCase()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <div className="text-[11px] font-black text-slate-800 uppercase tracking-tight flex items-center gap-1">
                                                    <FaClock className="text-[#2563EB] text-[10px]" />
                                                    {new Date(app.interviewTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </div>
                                                <div className="text-[10px] font-bold text-[#9333EA] mt-0.5 ml-3.5">
                                                    {new Date(app.interviewTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 overflow-hidden">
                                            <span className="text-[10px] font-bold border border-slate-200 px-2 py-0.5 rounded bg-white text-slate-500 uppercase tracking-widest">Google Meet / Zoom</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center gap-1 text-green-500 font-bold text-[10px] uppercase">
                                                <FaCheckCircle /> Link Ready
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest shadow-sm transition-all active:scale-95">
                                                Join Now
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="py-24 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                                    <FaCalendarAlt size={32} />
                                                </div>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No scheduled interviews currently</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Mobile Cards */}
                        <div className="md:hidden space-y-4 p-4">
                            {interviewJobs.length > 0 ? interviewJobs.map((app, i) => (
                                <div key={i} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center shrink-0">
                                            <FaCalendarAlt size={16} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-slate-800">{app.jobId?.role}</h4>
                                            <p className="text-[10px] text-slate-400 font-mono tracking-tighter">REF: {app._id.slice(-4).toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 mb-4 bg-slate-50 p-2 rounded">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-700 uppercase">
                                            <FaCalendarAlt className="text-blue-500" /> {new Date(app.interviewTime).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase">
                                            <FaClock className="text-indigo-400" /> {new Date(app.interviewTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    <button className="w-full py-2.5 bg-[#2563EB] text-white rounded-lg text-[10px] font-black uppercase tracking-[0.1em] shadow-md">
                                        Join Meeting
                                    </button>
                                </div>
                            )) : (
                                <div className="py-12 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                    <FaCalendarAlt className="mx-auto text-slate-200 mb-2" size={24} />
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">No scheduled interviews</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}


                {/* OFFERS SECTION (Desktop Table + Mobile Cards) */}
                {activeTab === "offers" && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse table-auto hidden md:table">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 w-10"><input type="checkbox" className="rounded" /></th>
                                    <th className="px-6 py-3 text-[11px] font-bold text-slate-600 uppercase tracking-tight">Job Role</th>
                                    <th className="px-6 py-3 text-[11px] font-bold text-slate-600 uppercase tracking-tight">Offer Date</th>
                                    <th className="px-6 py-3 text-[11px] font-bold text-slate-600 uppercase tracking-tight text-center">Status</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {offerApps.length > 0 ? offerApps.map((app, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4"><input type="checkbox" className="rounded border-slate-300" /></td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-purple-100 ring-2 ring-purple-100 text-purple-600 rounded flex items-center justify-center"><FaRegClipboard size={14} /></div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{app.jobId?.role}</p>
                                                    <p className="text-[10px] text-slate-400 font-mono">OFFER-{app._id.slice(-4).toUpperCase()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-tighter">
                                            {new Date(app.updatedAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-wide">Released</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => { setSelectedOffer(app); setActiveDocTab("offer"); setIsModalOpen(true); }}
                                                    className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-[10px] font-bold uppercase tracking-widest transition-colors shadow-md"
                                                >
                                                    <FaEye size={12} /> View Offer
                                                </button>
                                                <button
                                                    onClick={() => window.print()}
                                                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[10px] font-bold uppercase tracking-widest transition-colors shadow-md"
                                                    title="Print / Save as PDF"
                                                >
                                                    <FaDownload size={12} /> Save
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="py-24 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                                    <FaRegClipboard size={32} />
                                                </div>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No offers released yet</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Mobile Cards */}
                        <div className="md:hidden space-y-4 p-4">
                            {offerApps.length > 0 ? offerApps.map((app, i) => (
                                <div key={i} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center shrink-0">
                                            <FaRegClipboard size={16} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-slate-800">{app.jobId?.role}</h4>
                                            <p className="text-[10px] text-slate-400 font-mono tracking-tighter">OFFER-{app._id.slice(-4).toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Released on: {new Date(app.updatedAt).toLocaleDateString()}</span>
                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[8px] font-black uppercase">Active</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => { setSelectedOffer(app); setActiveDocTab("offer"); setIsModalOpen(true); }}
                                            className="flex-1 py-2 bg-purple-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                                        >
                                            <FaEye /> View
                                        </button>
                                        <button
                                            onClick={() => window.print()}
                                            className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase border border-slate-200"
                                        >
                                            <FaDownload />
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-12 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                    <FaRegClipboard className="mx-auto text-slate-200 mb-2" size={24} />
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">No offers yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* DOCUMENTS SECTION (Agreements Only) */}
                {activeTab === "documents" && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse table-auto hidden md:table">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 w-10"><input type="checkbox" className="rounded" /></th>
                                    <th className="px-6 py-3 text-[11px] font-bold text-slate-600 uppercase tracking-tight">Document Name</th>
                                    <th className="px-6 py-3 text-[11px] font-bold text-slate-600 uppercase tracking-tight">Type</th>
                                    <th className="px-6 py-3 text-[11px] font-bold text-slate-600 uppercase tracking-tight">Issuance</th>
                                    <th className="px-6 py-3 text-[11px] font-bold text-slate-600 uppercase tracking-tight text-center">Security</th>
                                    <th className="px-6 py-3 text-[11px] font-bold text-slate-600 uppercase tracking-tight">Review Status</th>
                                    <th className="px-6 py-3 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {agreementApps.length > 0 ? agreementApps.map((app, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4"><input type="checkbox" className="rounded border-slate-300" /></td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded flex items-center justify-center ${app.adminAttachment ? 'bg-indigo-50 text-indigo-500' : 'bg-red-50 text-red-500'}`}>
                                                    <FaFilePdf size={14} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">
                                                        Agreement Document - {app.jobId?.role}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">
                                                        {app.adminAttachment ? 'Admin_Agreement.pdf' : `Agreement_${app._id.slice(-4)}.pdf`}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-slate-100 text-slate-600">
                                                Employment Agreement
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-tighter">
                                            {new Date(app.appliedAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center text-green-500" title="Checksum Verified">
                                                <FaCheckCircle />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className={`text-[10px] font-black uppercase tracking-wider ${app.docReviewStatus === 'Accepted' ? 'text-green-600' :
                                                    app.docReviewStatus === 'Rejected' ? 'text-red-600' :
                                                        app.docReviewStatus === 'Pending' ? 'text-orange-500' :
                                                            'text-slate-400'
                                                    }`}>
                                                    {app.docReviewStatus || "Not Sent"}
                                                </span>
                                                {app.adminAgreements && (
                                                    <span className="text-[9px] text-slate-500 italic truncate max-w-[150px]">
                                                        "{app.adminAgreements.substring(0, 30)}..."
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {/* Admin Document Download */}
                                                {app.adminAttachment && (
                                                    <button
                                                        onClick={() => window.open(`${API_BASE_URL.replace('/api', '')}/${app.adminAttachment}`, '_blank')}
                                                        className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-bold uppercase tracking-widest transition-colors shadow-md"
                                                        title="Download Admin Document"
                                                    >
                                                        <FaDownload size={12} /> Download
                                                    </button>
                                                )}

                                                {/* Candidate Upload */}
                                                {(app.adminAgreements || app.adminAttachment) && (
                                                    <label className={`flex items-center gap-1.5 px-3 py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-colors shadow-md cursor-pointer ${uploadingDoc ? "bg-slate-300 text-slate-500" : "bg-green-600 hover:bg-green-700 text-white"
                                                        }`}>
                                                        <FaUpload size={12} />
                                                        <input
                                                            type="file"
                                                            className="hidden"
                                                            onChange={(e) => handleFileUpload(app._id, e.target.files[0])}
                                                            disabled={uploadingDoc}
                                                        />
                                                        {app.candidateAgreementsUpload ? "Update" : "Upload Signed"}
                                                    </label>
                                                )}

                                                {/* View Button */}
                                                <button
                                                    onClick={() => { setSelectedOffer(app); setActiveDocTab("agreement"); setIsModalOpen(true); }}
                                                    className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-[10px] font-bold uppercase tracking-widest transition-colors shadow-md"
                                                    title="View Document"
                                                >
                                                    <FaEye size={12} /> View
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="7" className="py-24 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                                    <FaInbox size={32} />
                                                </div>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No agreements pending</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Mobile Cards */}
                        <div className="md:hidden space-y-4 p-4">
                            {agreementApps.length > 0 ? agreementApps.map((app, i) => (
                                <div key={i} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${app.adminAttachment ? 'bg-indigo-50 text-indigo-500' : 'bg-red-50 text-red-500'}`}>
                                            <FaFilePdf size={18} />
                                        </div>
                                        <div className="overflow-hidden">
                                            <h4 className="text-sm font-black text-slate-800 truncate">Agreement - {app.jobId?.role}</h4>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">Issued: {new Date(app.appliedAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-50">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</span>
                                        <span className={`text-[10px] font-black uppercase tracking-wider ${app.docReviewStatus === 'Accepted' ? 'text-green-600' :
                                            app.docReviewStatus === 'Rejected' ? 'text-red-600' :
                                                app.docReviewStatus === 'Pending' ? 'text-orange-500' :
                                                    'text-slate-400'
                                            }`}>
                                            {app.docReviewStatus || "Not Sent"}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => { setSelectedOffer(app); setActiveDocTab("agreement"); setIsModalOpen(true); }}
                                            className="py-2 bg-purple-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm"
                                        >
                                            <FaEye size={12} /> View
                                        </button>
                                        {app.adminAttachment && (
                                            <button
                                                onClick={() => window.open(`${API_BASE_URL.replace('/api', '')}/${app.adminAttachment}`, '_blank')}
                                                className="py-2 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-indigo-100"
                                            >
                                                <FaDownload size={12} /> Get PDF
                                            </button>
                                        )}
                                        <label className={`col-span-2 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-md cursor-pointer ${uploadingDoc ? "bg-slate-300 text-slate-500" : "bg-green-600 hover:bg-green-700 text-white"}`}>
                                            <FaUpload size={14} />
                                            <input
                                                type="file"
                                                className="hidden"
                                                onChange={(e) => handleFileUpload(app._id, e.target.files[0])}
                                                disabled={uploadingDoc}
                                            />
                                            {app.candidateAgreementsUpload ? "Update Signature" : "Upload Signed Copy"}
                                        </label>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-12 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                    <FaInbox className="mx-auto text-slate-200 mb-2" size={24} />
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">No agreements</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Pagination Footer */}
            <footer className="bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between sticky bottom-0 z-40">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                    Entries: {
                        activeTab === "all-jobs" ? filteredJobs.length :
                            activeTab === "applications" ? filteredApps.length :
                                activeTab === "interviews" ? interviewJobs.length :
                                    activeTab === "offers" ? offerApps.length :
                                        activeTab === "documents" ? agreementApps.length : 1
                    } Displayed
                </div>
                <div className="flex items-center gap-1">
                    <button className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 text-slate-300 hover:bg-slate-50 transition-colors"><FaChevronRight className="rotate-180" size={10} /></button>
                    <button className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 text-slate-300 hover:bg-slate-50 transition-colors"><FaChevronRight size={10} /></button>
                </div>
            </footer>

            {/* Sleek Modern Document Viewer Modal */}
            {isModalOpen && selectedOffer && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-6xl h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200/50 scale-100 animate-in zoom-in-95 duration-200">
                        {/* Sleek Gradient Header */}
                        <div className="px-4 py-4 md:px-8 md:py-6 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                    <FaFilePdf className="text-white text-lg md:text-xl" />
                                </div>
                                <div className="max-w-[150px] sm:max-w-none">
                                    <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-white/80">Document Viewer</h3>
                                    <p className="text-sm md:text-lg font-bold text-white mt-0.5 truncate">{selectedOffer.jobId?.role}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 md:gap-3">
                                {selectedOffer.adminAttachment && (
                                    <button
                                        onClick={() => window.open(`${API_BASE_URL.replace('/api', '')}/${selectedOffer.adminAttachment}`, '_blank')}
                                        className="flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wider text-white hover:bg-white/30 transition-all"
                                    >
                                        <FaDownload size={10} className="md:size-[12px]" /> <span className="hidden sm:inline">Download</span>
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="bg-white/20 backdrop-blur-sm border border-white/30 w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center text-white hover:bg-red-500/80 hover:border-red-400 transition-all"
                                >
                                    <FaTimes size={14} className="md:size-[16px]" />
                                </button>
                            </div>
                        </div>

                        {/* Document Content Area */}
                        <div className="flex-1 overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex flex-col">

                            {/* TABS if both exist */}
                            {(selectedOffer.offerLetter && (selectedOffer.adminAgreements || selectedOffer.adminAttachment)) && (
                                <div className="flex gap-2 mb-4 shrink-0">
                                    <button
                                        onClick={() => setActiveDocTab("offer")}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors border ${activeDocTab === "offer"
                                            ? "bg-purple-600 text-white border-purple-600 shadow-md"
                                            : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}
                                    >
                                        Offer Letter
                                    </button>
                                    <button
                                        onClick={() => setActiveDocTab("agreement")}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors border ${activeDocTab === "agreement"
                                            ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                                            : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}
                                    >
                                        Employment Agreement
                                    </button>
                                </div>
                            )}

                            {/* CONTENT: OFFER LETTER */}
                            {activeDocTab === "offer" && (
                                <div className="w-full h-full overflow-y-auto flex justify-center py-4 md:py-0">
                                    <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg border border-slate-200 p-6 md:p-16 my-auto">
                                        <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none rotate-45 text-slate-900 font-black text-4xl md:text-7xl uppercase tracking-[0.5em] select-none">
                                            OFFER LETTER
                                        </div>
                                        <div className="relative">
                                            <div className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap font-serif text-slate-800">
                                                {selectedOffer.offerLetter || "No Offer Letter Content Available."}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* CONTENT: AGREEMENT */}
                            {activeDocTab === "agreement" && (
                                <div className="w-full h-full flex flex-col">
                                    {selectedOffer.adminAttachment ? (
                                        <div className="w-full h-full flex flex-col bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
                                            <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 shrink-0">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                                        <FaFilePdf className="text-indigo-600" size={18} />
                                                    </div>
                                                    <div>
                                                        <h2 className="text-sm font-bold text-slate-900">Agreement Document</h2>
                                                        <p className="text-xs text-slate-500">Admin-sent document for review and signature</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <iframe
                                                src={`${API_BASE_URL.replace('/api', '')}/${selectedOffer.adminAttachment}`}
                                                className="w-full flex-1 bg-white"
                                                title="Agreement Document"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-full h-full overflow-y-auto flex justify-center py-4 md:py-0">
                                            <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg border border-slate-200 p-6 md:p-16 my-auto">
                                                <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none rotate-45 text-slate-900 font-black text-4xl md:text-7xl uppercase tracking-[0.5em] select-none">
                                                    AGREEMENT
                                                </div>
                                                <div className="relative">
                                                    <div className="flex items-center gap-3 mb-4 md:mb-6 pb-4 border-b border-slate-200">
                                                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                                            <FaFilePdf className="text-white" size={16} />
                                                        </div>
                                                        <div>
                                                            <h2 className="text-base md:text-xl font-bold text-slate-900">Agreement Document</h2>
                                                            <p className="text-[10px] md:text-xs text-slate-500">Please review carefully</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-[11px] md:text-sm leading-relaxed text-slate-700 whitespace-pre-wrap font-sans">
                                                        {selectedOffer.adminAgreements || "No Agreement Content."}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Sleek Footer */}
                        <div className="px-8 py-5 bg-white border-t border-slate-200 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                                <FaCheckCircle className="text-green-500" size={14} />
                                <span>Document ID: {selectedOffer._id.slice(-8).toUpperCase()}</span>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2.5 border-2 border-slate-300 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition-all"
                                >
                                    Close
                                </button>
                                <button className="px-8 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all active:scale-95">
                                    Accept & Sign
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CandidateDashboard;
