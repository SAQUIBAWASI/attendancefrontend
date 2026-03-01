import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";
import {
    FaTasks, FaSignOutAlt, FaSearch, FaFilePdf, FaDownload, FaTimes, FaUserTie, FaCheckCircle, FaTimesCircle, FaCircle, FaDownload as FaDownloadIcon
} from "react-icons/fa";
import { jsPDF } from "jspdf";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CandidateLayout = () => {
    const [profile, setProfile] = useState(null);
    const [appliedJobs, setAppliedJobs] = useState([]);
    const [allJobs, setAllJobs] = useState([]);
    const [personalDocs, setPersonalDocs] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    // Shared state for Document Viewer Modal
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeDocTab, setActiveDocTab] = useState("offer");

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem("candidateToken");
            if (!token) {
                navigate("/candidate-login");
                return;
            }

            const headers = { Authorization: `Bearer ${token}` };

            const profileRes = await axios.get(`${API_BASE_URL}/candidate/profile`, { headers });
            let profileData = profileRes.data;

            const appsRes = await axios.get(`${API_BASE_URL}/candidate/applications`, { headers });
            const applications = appsRes.data;
            setAppliedJobs(applications);

            if (applications && applications.length > 0) {
                const latestApp = applications[0];
                profileData = {
                    ...profileData,
                    qualification: latestApp.highestQualification || profileData.qualification,
                    percentage: latestApp.percentage || profileData.percentage,
                    passingYear: latestApp.passingYear || profileData.passingYear,
                    experience: latestApp.experience || profileData.experience,
                    companyName: latestApp.companyName || latestApp.currentCompany || profileData.currentCompany || profileData.companyName,
                    currentCompany: latestApp.currentCompany || latestApp.companyName || profileData.currentCompany || profileData.companyName,
                    location: latestApp.currentLocation || profileData.address || profileData.location,
                    salary: latestApp.currentCTC || profileData.currentCTC || profileData.salary,
                    expectedSalary: latestApp.expectedCTC || profileData.expectedCTC || profileData.expectedSalary,
                    currentCTC: latestApp.currentCTC || profileData.currentCTC || profileData.salary,
                    expectedCTC: latestApp.expectedCTC || profileData.expectedCTC || profileData.expectedSalary,
                };
            }
            setProfile(profileData);

            const docsRes = await axios.get(`${API_BASE_URL}/candidate/documents`, { headers });
            if (docsRes.data && docsRes.data.success) {
                setPersonalDocs(docsRes.data.data);
            }

            const allJobsRes = await axios.get(`${API_BASE_URL}/jobs/all`);
            setAllJobs(allJobsRes.data.jobPosts || []);

        } catch (err) {
            console.error("Fetch dashboard error:", err);
            if (err.response?.status === 401) {
                navigate("/candidate-login");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEditToggle = () => {
        if (!isEditingProfile) {
            setEditForm({
                name: profile?.name || "",
                phone: profile?.phone || profile?.mobile || "",
                address: profile?.address || "",
                qualification: profile?.qualification || "",
                percentage: profile?.percentage || "",
                passingYear: profile?.passingYear || "",
                experience: profile?.experience || "",
                currentCompany: profile?.currentCompany || profile?.companyName || "",
                currentCTC: profile?.currentCTC || profile?.salary || "",
                expectedCTC: profile?.expectedCTC || profile?.expectedSalary || "",
                skills: profile?.skills || ""
            });
        }
        setIsEditingProfile(!isEditingProfile);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsSavingProfile(true);
        try {
            const token = localStorage.getItem("candidateToken");
            const headers = { Authorization: `Bearer ${token}` };
            const res = await axios.put(`${API_BASE_URL}/candidate/profile`, editForm, { headers });
            if (res.data) {
                // profileRes.data contains updated candidate
                setProfile(prev => ({ ...prev, ...res.data.candidate }));
                setIsEditingProfile(false);
                toast.success("Profile updated successfully!");
            }
        } catch (err) {
            console.error("Update profile error:", err);
            toast.error(err.response?.data?.message || "Failed to update profile.");
        } finally {
            setIsSavingProfile(false);
        }
    };

    const logout = () => {
        localStorage.removeItem("candidateToken");
        localStorage.removeItem("candidateId");
        navigate("/candidate-login");
    };

    const formatDocumentUrl = (filePath) => {
        if (!filePath) return "";
        const relativePath = filePath.includes("uploads")
            ? "uploads/" + filePath.split(/uploads[\\/]/).pop().replace(/\\/g, "/")
            : filePath.replace(/\\/g, "/");
        return `${API_BASE_URL.replace("/api", "")}/${relativePath}`;
    };

    const handleDownloadOffer = (appOrLetter) => {
        if (!appOrLetter) return;
        const content = appOrLetter.content || appOrLetter.offerLetter;
        const type = appOrLetter.documentType || "Offer";
        const sentAt = appOrLetter.sentAt || appOrLetter.offerSentAt || appOrLetter.updatedAt;

        if (appOrLetter.adminAttachment && !content) {
            window.open(formatDocumentUrl(appOrLetter.adminAttachment), "_blank");
            return;
        }

        if (content) {
            const doc = new jsPDF();
            doc.setFillColor(63, 81, 181);
            doc.rect(0, 0, 210, 40, 'F');
            doc.setFontSize(24);
            doc.setTextColor(255, 255, 255);
            const headerText = (type || "OFFER").toUpperCase() + " LETTER";
            doc.text(headerText, 105, 25, { align: "center" });
            doc.setFontSize(10);
            doc.setTextColor(230, 230, 230);
            doc.text(`Reference: ${type.toUpperCase()}-${(appOrLetter._id || "REF").toString().slice(-6).toUpperCase()}`, 105, 33, { align: "center" });
            doc.setFontSize(12);
            doc.setTextColor(60, 60, 60);
            doc.setFont("helvetica", "bold");
            doc.text("Candidate Details:", 20, 55);
            doc.setFont("helvetica", "normal");
            doc.text(`Name: ${profile?.name || "Candidate"}`, 20, 62);
            doc.text(`Position: ${appOrLetter.jobId?.role || "Not Specified"}`, 20, 69);
            doc.text(`Date of Issue: ${new Date(sentAt).toLocaleDateString()}`, 20, 76);
            doc.setDrawColor(230, 230, 230);
            doc.line(20, 85, 190, 85);
            doc.setFontSize(11);
            doc.setTextColor(30, 30, 30);
            const splitText = doc.splitTextToSize(content, 170);
            doc.text(splitText, 20, 95);
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(10);
                doc.setTextColor(150, 150, 150);
                doc.text("Timely Health Projects - Confidential", 105, 285, { align: "center" });
            }
            const fileName = `${type || "Letter"}_${appOrLetter.jobId?.role || "Candidate"}.pdf`;
            doc.save(fileName);
        }
    };

    // State for managing the dropdown
    const [isLettersDropdownOpen, setIsLettersDropdownOpen] = useState(false);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.letters-dropdown-container')) {
                setIsLettersDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-2 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-slate-400 text-[10px] font-medium uppercase tracking-widest">Loading Portal...</p>
            </div>
        </div>
    );

    const navItems = [
        { path: "/candidate-dashboard", label: "Home" },
        { path: "/all-jobs", label: "All Jobs" },
        { path: "/applied-jobs", label: "Applied" },
        { path: "/interview", label: "Interviews" },
        { path: "/my-jobs", label: "Experience" },
        // We will handle 'Letters' manually as a dropdown containing the other documents
    ];

    const getPageTitle = () => {
        const item = navItems.find(item => item.path === location.pathname);
        if (!item) return "Dashboard Overview";
        switch (item.path) {
            case "/candidate-dashboard": return "Dashboard Overview";
            case "/all-jobs": return "Explore Opportunities";
            case "/applied-jobs": return "My Applications";
            case "/interview": return "Interview Schedule";
            case "/letters": return "Offer Letters";
            case "/candidate-documents": return "Document Center";
            case "/candidate-personal-documents": return "Personal Records";
            default: return "Dashboard";
        }
    };

    return (
        <div className="w-full min-h-screen bg-gray-50/50 font-sans text-gray-800 flex flex-col">
            {/* STICKY HEADER SECTION - SaaS Style */}
            <div className="sticky top-0 z-[100] w-full bg-white border-b border-gray-100 shadow-sm transition-all duration-300">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between h-16 sm:h-20">

                    {/* Left: Branding */}
                    <div
                        className="flex items-center gap-3 cursor-pointer shrink-0 group"
                        onClick={() => navigate("/candidate-dashboard")}
                    >
                        <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform duration-300">
                            <FaTasks className="text-sm sm:text-base" />
                        </div>
                        <div className="hidden md:block">
                            <span className="block font-black text-sm sm:text-base text-gray-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors">Candidate</span>
                            <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">Portal</span>
                        </div>
                    </div>

                    {/* Middle: Navigation Links (Desktop) */}
                    <div className="hidden lg:flex items-center justify-center space-x-2 flex-1 px-8">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) => `relative px-4 py-2 rounded-xl text-xs sm:text-[11px] font-black uppercase tracking-wider transition-all duration-300 no-underline ${isActive
                                        ? "text-white bg-indigo-600 shadow-md shadow-indigo-100"
                                        : "text-gray-500 hover:text-indigo-600 hover:bg-indigo-50/50"
                                        }`}
                                >
                                    {item.label}
                                </NavLink>
                            );
                        })}

                        {/* Letters Dropdown */}
                        <div className="relative letters-dropdown-container">
                            <button
                                onClick={() => setIsLettersDropdownOpen(!isLettersDropdownOpen)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-[11px] font-black uppercase tracking-wider transition-all duration-300 no-underline ${(location.pathname === '/letters' || location.pathname === '/candidate-documents' || location.pathname === '/candidate-personal-documents')
                                    ? "text-white bg-indigo-600 shadow-md shadow-indigo-100"
                                    : "text-gray-500 hover:text-indigo-600 hover:bg-indigo-50/50"
                                    }`}
                            >
                                Letters & Docs
                                <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${isLettersDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Dropdown Menu */}
                            {isLettersDropdownOpen && (
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="py-2 flex flex-col">
                                        <NavLink
                                            to="/letters"
                                            onClick={() => setIsLettersDropdownOpen(false)}
                                            className={({ isActive }) => `mx-2 my-1 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all no-underline ${isActive ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"}`}
                                        >
                                            Letters
                                        </NavLink>
                                        <NavLink
                                            to="/candidate-documents"
                                            onClick={() => setIsLettersDropdownOpen(false)}
                                            className={({ isActive }) => `mx-2 my-1 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all no-underline ${isActive ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"}`}
                                        >
                                            Documents
                                        </NavLink>
                                        <NavLink
                                            to="/candidate-personal-documents"
                                            onClick={() => setIsLettersDropdownOpen(false)}
                                            className={({ isActive }) => `mx-2 my-1 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all no-underline ${isActive ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"}`}
                                        >
                                            Personal Docs
                                        </NavLink>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: User Profile & Actions */}
                    <div className="flex items-center gap-3 sm:gap-5 shrink-0">

                        {/* <div className="relative hidden sm:block w-48 shrink-0">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                            <input
                                type="text"
                                placeholder="Quick search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full py-1.5 pl-8 pr-4 text-xs font-bold text-gray-700 bg-gray-50 border border-gray-100 rounded-full focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-inner transition-all hover:bg-gray-100"
                            />
                        </div> */}

                        <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

                        <button
                            onClick={() => setIsProfileModalOpen(true)}
                            className="flex items-center gap-2.5 p-1 pr-3 sm:pr-4 rounded-full border border-gray-100 bg-white hover:bg-gray-50 hover:border-gray-200 hover:shadow-sm transition-all duration-300 group"
                        >
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 text-indigo-700 flex items-center justify-center text-xs sm:text-sm font-black border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                                {profile?.name?.charAt(0) || "C"}
                            </div>
                            <span className="hidden sm:block text-xs font-bold text-gray-700 group-hover:text-gray-900 tracking-wide">
                                {profile?.name || "Profile"}
                            </span>
                        </button>

                        <button
                            onClick={logout}
                            className="w-9 h-9 sm:w-10 sm:h-10 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl flex items-center justify-center transition-all duration-300 border border-transparent hover:border-red-100 group shadow-sm active:scale-95"
                            title="Sign Out"
                        >
                            <FaSignOutAlt className="text-[13px] sm:text-sm group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                    </div>
                </nav>

                {/* Mobile Navigation Links (Scrollable row under main bar for small screens) */}
                <div className="lg:hidden flex items-center gap-1 sm:gap-2 px-4 py-3 overflow-x-auto no-scrollbar border-t border-gray-50 bg-white">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 no-underline ${isActive
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                                : "text-gray-500 bg-gray-50 hover:bg-gray-100 border border-transparent"
                                }`}
                        >
                            {item.label}
                        </NavLink>
                    ))}
                    {/* Add the dropdown links to mobile view explicitly since they are removed from navItems */}
                    <NavLink
                        to="/letters"
                        className={({ isActive }) => `flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 no-underline ${isActive
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                            : "text-gray-500 bg-gray-50 hover:bg-gray-100 border border-transparent"
                            }`}
                    >
                        Letters
                    </NavLink>
                    <NavLink
                        to="/candidate-documents"
                        className={({ isActive }) => `flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 no-underline ${isActive
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                            : "text-gray-500 bg-gray-50 hover:bg-gray-100 border border-transparent"
                            }`}
                    >
                        Documents
                    </NavLink>
                    <NavLink
                        to="/candidate-personal-documents"
                        className={({ isActive }) => `flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 no-underline ${isActive
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                            : "text-gray-500 bg-gray-50 hover:bg-gray-100 border border-transparent"
                            }`}
                    >
                        Personal Docs
                    </NavLink>
                </div>
            </div>

            {/* Sub Nav / Action Bar removed entirely per user request */}

            {/* Main Content Area */}
            <main className="flex-grow w-full">
                <Outlet context={{ profile, appliedJobs, allJobs, personalDocs, searchQuery, setSearchQuery, fetchDashboardData, formatDocumentUrl, handleDownloadOffer, setIsModalOpen, setSelectedOffer, setActiveDocTab }} />
            </main>

            {/* PROFILE MODAL */}
            {isProfileModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white max-w-2xl w-full rounded-xl shadow-xl overflow-hidden relative animate-in zoom-in-95 duration-500 flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-xl font-black shadow-lg">
                                    {profile?.name?.charAt(0) || "C"}
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-gray-800 leading-tight">{profile?.name}</h1>
                                    <p className="text-xs text-gray-500 mt-0.5">{profile?.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100">
                                    <FaCircle className="text-[6px] animate-pulse" /> Profile Verified
                                </span>
                                <button onClick={() => setIsProfileModalOpen(false)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                                    <FaTimesCircle size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-8 bg-white no-scrollbar flex-1">
                            {isEditingProfile ? (
                                <form id="profile-edit-form" onSubmit={handleUpdateProfile} className="space-y-6">
                                    <section>
                                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Basic Information
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Full Name</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                                                    value={editForm.name}
                                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Phone</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                                                    value={editForm.phone}
                                                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                                />
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Address / Location</label>
                                                <textarea
                                                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-16"
                                                    value={editForm.address}
                                                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </section>

                                    <section>
                                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div> Academic Background
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Qualification</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                                                    value={editForm.qualification}
                                                    onChange={(e) => setEditForm({ ...editForm, qualification: e.target.value })}
                                                    placeholder="e.g. B.Tech"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Percentage / CGPA</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                                                    value={editForm.percentage}
                                                    onChange={(e) => setEditForm({ ...editForm, percentage: e.target.value })}
                                                    placeholder="e.g. 85%"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Passing Year</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                                                    value={editForm.passingYear}
                                                    onChange={(e) => setEditForm({ ...editForm, passingYear: e.target.value })}
                                                    placeholder="e.g. 2022"
                                                />
                                            </div>
                                        </div>
                                    </section>

                                    <section>
                                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Professional Record
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Organization</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                                                    value={editForm.currentCompany}
                                                    onChange={(e) => setEditForm({ ...editForm, currentCompany: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Experience</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                                                    value={editForm.experience}
                                                    onChange={(e) => setEditForm({ ...editForm, experience: e.target.value })}
                                                    placeholder="e.g. 2 Years"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Current CTC</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                                                    value={editForm.currentCTC}
                                                    onChange={(e) => setEditForm({ ...editForm, currentCTC: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Expected CTC</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                                                    value={editForm.expectedCTC}
                                                    onChange={(e) => setEditForm({ ...editForm, expectedCTC: e.target.value })}
                                                />
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Skills (Comma separated)</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                                                    value={editForm.skills}
                                                    onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })}
                                                    placeholder="e.g. React, Node.js, Python"
                                                />
                                            </div>
                                        </div>
                                    </section>
                                </form>
                            ) : (
                                <>
                                    <section>
                                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Basic Information
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                                <span className="text-xs font-bold text-gray-500">Phone</span>
                                                <span className="text-xs font-black text-gray-800">{profile?.phone || profile?.mobile || "N/A"}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                                <span className="text-xs font-bold text-gray-500">Location</span>
                                                <span className="text-xs font-black text-gray-800 truncate pl-4">{profile?.address || "N/A"}</span>
                                            </div>
                                        </div>
                                    </section>

                                    <section>
                                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div> Academic Background
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">
                                            <div className="flex flex-col py-2 border-b border-gray-50">
                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Qualification</span>
                                                <span className="text-xs font-black text-gray-800 mt-1">{profile?.qualification || "N/A"}</span>
                                            </div>
                                            <div className="flex flex-col py-2 border-b border-gray-50">
                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Percentage</span>
                                                <span className="text-xs font-black text-gray-800 mt-1">{profile?.percentage || "N/A"}</span>
                                            </div>
                                            <div className="flex flex-col py-2 border-b border-gray-50">
                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Passing Year</span>
                                                <span className="text-xs font-black text-gray-800 mt-1">{profile?.passingYear || "N/A"}</span>
                                            </div>
                                        </div>
                                    </section>

                                    <section>
                                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Professional Record
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                                <span className="text-xs font-bold text-gray-500">Experience</span>
                                                <span className="text-xs font-black text-gray-800">{profile?.experience ? (profile.experience === "Fresher" ? "Fresher" : `${profile.experience}`) : "N/A"}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                                <span className="text-xs font-bold text-gray-500">Organization</span>
                                                <span className="text-xs font-black text-gray-800">{profile?.currentCompany || profile?.companyName || "N/A"}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                                <span className="text-xs font-bold text-gray-500">Current CTC</span>
                                                <span className="text-xs font-black text-gray-800">{profile?.currentCTC || profile?.salary || "N/A"}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                                <span className="text-xs font-bold text-gray-500">Expected CTC</span>
                                                <span className="text-xs font-black text-gray-800">{profile?.expectedCTC || profile?.expectedSalary || "N/A"}</span>
                                            </div>
                                            <div className="sm:col-span-2">
                                                <span className="text-[10px] font-black text-gray-400 uppercase mb-2 block">Top Skills</span>
                                                <div className="flex flex-wrap gap-2">
                                                    {(profile?.skills || "").split(',').map((skill, idx) => skill.trim() && (
                                                        <span key={idx} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold border border-indigo-100">
                                                            {skill.trim()}
                                                        </span>
                                                    ))}
                                                    {!profile?.skills && <span className="text-xs text-gray-400 italic">No skills listed</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                    <section className="bg-gray-50 rounded-xl p-6 border border-gray-100 mt-4">
                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-red-500">
                                                    <FaFilePdf size={24} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-gray-800">Resume File</p>
                                                </div>
                                            </div>
                                            {profile?.resume ? (
                                                <button onClick={() => window.open(formatDocumentUrl(profile.resume), "_blank")} className="w-full sm:w-auto px-6 py-2.5 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-md active:scale-95">Access File</button>
                                            ) : (
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Digital Record Not Filed</span>
                                            )}
                                        </div>
                                    </section>
                                </>
                            )}
                        </div>
                        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-white shrink-0">
                            {isEditingProfile ? (
                                <>
                                    <button
                                        onClick={() => setIsEditingProfile(false)}
                                        className="px-6 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-gray-100 active:scale-95"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        form="profile-edit-form"
                                        type="submit"
                                        disabled={isSavingProfile}
                                        className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md active:scale-95 flex items-center justify-center min-w-[120px]"
                                    >
                                        {isSavingProfile ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Save Changes"}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={handleEditToggle}
                                        className="px-6 py-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-indigo-100 active:scale-95"
                                    >
                                        Edit Profile
                                    </button>
                                    <button
                                        onClick={() => setIsProfileModalOpen(false)}
                                        className="px-8 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-gray-100 active:scale-95"
                                    >
                                        Close
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* SHARED MODAL: DOCUMENT VIEWER */}
            {isModalOpen && selectedOffer && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-6xl h-[95vh] sm:h-[92vh] rounded-2xl shadow-3xl flex flex-col overflow-hidden border border-white/20 scale-100 animate-in zoom-in-95 duration-200">
                        <div className="px-4 py-4 md:px-8 md:py-6 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                    <FaFilePdf className="text-white text-lg md:text-xl" />
                                </div>
                                <div className="max-w-[150px] sm:max-w-none">
                                    <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">{(selectedOffer.documentType || "Official").toUpperCase()} LETTER</h2>
                                    <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-white/80 mt-0.5">{selectedOffer.jobId?.role}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 md:gap-3">
                                {(selectedOffer.adminAttachment || selectedOffer.offerLetter) && (
                                    <button onClick={() => handleDownloadOffer(selectedOffer)} className="flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wider text-white hover:bg-white/30 transition-all">
                                        <FaDownloadIcon size={10} /> <span className="hidden sm:inline">Download</span>
                                    </button>
                                )}
                                <button onClick={() => setIsModalOpen(false)} className="bg-white/20 backdrop-blur-sm border border-white/30 w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center text-white hover:bg-red-500/80 hover:border-red-400 transition-all"><FaTimes size={14} /></button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 p-3 sm:p-6 flex flex-col">
                            {(selectedOffer.offerLetter && (selectedOffer.adminAgreements || selectedOffer.adminAttachment)) && (
                                <div className="flex gap-2 mb-4 shrink-0">
                                    <button onClick={() => setActiveDocTab("offer")} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors border ${activeDocTab === "offer" ? "bg-purple-600 text-white border-purple-600 shadow-md" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}>{selectedOffer.documentType || "Offer"} Letter</button>
                                    <button onClick={() => setActiveDocTab("agreement")} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors border ${activeDocTab === "agreement" ? "bg-indigo-600 text-white border-indigo-600 shadow-md" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}>Employment Agreement</button>
                                </div>
                            )}
                            {activeDocTab === "offer" && (
                                <div className="w-full h-full overflow-y-auto flex justify-center py-4 md:py-0">
                                    <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg border border-slate-200 p-6 md:p-16 my-auto relative">
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none overflow-hidden">
                                            <span className="text-[120px] font-black tracking-[20px] -rotate-45 uppercase whitespace-nowrap">{(selectedOffer.documentType || "OFFER")}</span>
                                        </div>
                                        <div className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap font-serif text-slate-800 relative z-10">{selectedOffer.content || selectedOffer.offerLetter || "No Content Available."}</div>
                                    </div>
                                </div>
                            )}
                            {activeDocTab === "agreement" && (
                                <div className="w-full h-full flex flex-col">
                                    {selectedOffer.adminAttachment ? (
                                        <div className="w-full h-full flex flex-col bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
                                            <iframe src={formatDocumentUrl(selectedOffer.adminAttachment)} className="w-full flex-1 bg-white" title="Agreement Document" />
                                        </div>
                                    ) : (
                                        <div className="w-full h-full overflow-y-auto flex justify-center py-4 md:py-0">
                                            <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg border border-slate-200 p-6 md:p-16 my-auto">
                                                <div className="text-[11px] md:text-sm leading-relaxed text-slate-700 whitespace-pre-wrap font-sans">{selectedOffer.adminAgreements || "No Agreement Content."}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="px-6 py-6 sm:px-10 bg-white border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-6 shrink-0">
                            <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span className="truncate">Verification ID: {selectedOffer._id.slice(-12).toUpperCase()}</span>
                            </div>
                            <div className="flex gap-4 w-full sm:w-auto">
                                <button onClick={() => setIsModalOpen(false)} className="flex-1 sm:flex-none px-8 py-3.5 border-2 border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all active:scale-95">Dismiss</button>
                                <button className="flex-1 sm:flex-none px-12 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-200 hover:shadow-2xl hover:translate-y-[-2px] active:scale-95 transition-all">Accept & Sign</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
        </div>
    );
};

export default CandidateLayout;
