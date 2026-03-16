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
        const content = appOrLetter.content || appOrLetter.offerLetter || appOrLetter.resignationLetter;
        const type = appOrLetter.documentType || (appOrLetter.resignationLetter ? "Resignation" : "Offer");
        const sentAt = appOrLetter.sentAt || appOrLetter.offerSentAt || appOrLetter.resignationSentAt || appOrLetter.updatedAt;

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
            const isResignation = type.toLowerCase() === "resignation";
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
            doc.text(`${isResignation ? 'Date Filed' : 'Date of Issue'}: ${new Date(sentAt).toLocaleDateString()}`, 20, 76);
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

    const [isLettersDropdownOpen, setIsLettersDropdownOpen] = useState(false);

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
    ];

    return (
        <div className="w-full min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col">
            {/* STICKY HEADER SECTION - UserActivity Utility Style */}
            <div className="sticky top-0 z-[100] w-full bg-white border-b border-gray-100 shadow-sm transition-all duration-300">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between h-16 sm:h-20">

                    {/* Left: Branding */}
                    <div
                        className="flex items-center gap-3 cursor-pointer shrink-0 group"
                        onClick={() => navigate("/candidate-dashboard")}
                    >
                        <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-blue-100 transition-transform duration-300">
                            <FaTasks className="text-sm sm:text-base" />
                        </div>
                        <div className="hidden md:block">
                            <span className="block font-bold text-sm sm:text-base text-gray-900 tracking-tight leading-none">Candidate</span>
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
                                    className={`relative px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 no-underline ${isActive
                                        ? "text-white bg-gradient-to-r from-green-500 to-blue-600 shadow-md shadow-blue-50"
                                        : "text-gray-500 hover:text-blue-600 hover:bg-blue-50/50"
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
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 no-underline ${(location.pathname === '/letters' || location.pathname === '/candidate-documents' || location.pathname === '/candidate-personal-documents')
                                    ? "text-white bg-gradient-to-r from-green-500 to-blue-600 shadow-md shadow-blue-50"
                                    : "text-gray-500 hover:text-blue-600 hover:bg-blue-50/50"
                                    }`}
                            >
                                Letters & Docs
                                <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${isLettersDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Dropdown Menu */}
                            {isLettersDropdownOpen && (
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="py-2 flex flex-col">
                                        {[
                                            { to: "/letters", label: "Letters" },
                                            { to: "/candidate-documents", label: "Documents" },
                                            { to: "/candidate-personal-documents", label: "Personal Docs" }
                                        ].map(link => (
                                            <NavLink
                                                key={link.to}
                                                to={link.to}
                                                onClick={() => setIsLettersDropdownOpen(false)}
                                                className={({ isActive }) => `mx-2 my-1 px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all no-underline ${isActive ? "bg-gradient-to-r from-green-500 to-blue-600 text-white shadow-md shadow-blue-50" : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"}`}
                                            >
                                                {link.label}
                                            </NavLink>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: User Profile & Actions */}
                    <div className="flex items-center gap-3 sm:gap-5 shrink-0">
                        <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

                        <button
                            onClick={() => setIsProfileModalOpen(true)}
                            className="flex items-center gap-2.5 p-1 pr-3 sm:pr-4 rounded-full border border-gray-100 bg-white hover:bg-gray-50 hover:border-gray-200 transition-all duration-300 group"
                        >
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-xs sm:text-sm font-bold border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                {profile?.name?.charAt(0) || "C"}
                            </div>
                            <span className="hidden sm:block text-xs font-bold text-gray-700 group-hover:text-gray-900 tracking-wide">
                                {profile?.name || "Profile"}
                            </span>
                        </button>

                        <button
                            onClick={logout}
                            className="w-9 h-9 sm:w-10 sm:h-10 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg flex items-center justify-center transition-all duration-300 border border-transparent hover:border-red-100 group shadow-sm active:scale-95"
                            title="Sign Out"
                        >
                            <FaSignOutAlt className="text-[13px] sm:text-sm group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                    </div>
                </nav>

                {/* Mobile Navigation Links */}
                <div className="lg:hidden flex items-center gap-1 sm:gap-2 px-4 py-3 overflow-x-auto no-scrollbar border-t border-gray-50 bg-white">
                    {[...navItems, { path: "/letters", label: "Letters" }, { path: "/candidate-documents", label: "Documents" }, { path: "/candidate-personal-documents", label: "Personal Docs" }].map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `flex-shrink-0 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300 no-underline ${isActive
                                ? "bg-gradient-to-r from-green-500 to-blue-600 text-white shadow-lg shadow-blue-50"
                                : "text-gray-500 bg-gray-50 hover:bg-gray-100 border border-transparent"
                                }`}
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-grow w-full bg-gradient-to-br from-blue-50 to-indigo-100">
                <Outlet context={{ profile, appliedJobs, allJobs, personalDocs, searchQuery, setSearchQuery, fetchDashboardData, formatDocumentUrl, handleDownloadOffer, setIsModalOpen, setSelectedOffer, setActiveDocTab }} />
            </main>

            {/* PROFILE MODAL - Re-styled for Exact Match */}
            {isProfileModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white max-w-2xl w-full rounded-xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-500 flex flex-col max-h-[90vh] border border-gray-200">
                        <div className="px-6 py-4 bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-between shadow-md text-white shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur-md text-white flex items-center justify-center text-xl font-bold border border-white/30">
                                    {profile?.name?.charAt(0) || "C"}
                                </div>
                                <div className="min-w-0">
                                    <h1 className="text-lg font-bold text-white leading-tight truncate">{profile?.name}</h1>
                                    <p className="text-xs text-white/80 mt-0.5 truncate">{profile?.email}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsProfileModalOpen(false)} className="p-1 text-white hover:text-red-100 transition-colors">
                                <FaTimesCircle size={22} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto bg-white no-scrollbar flex-1">
                            {isEditingProfile ? (
                                <form id="profile-edit-form" onSubmit={handleUpdateProfile} className="space-y-6">
                                    <section>
                                        <h3 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Basic Information
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {[
                                                { label: "Full Name", key: "name" },
                                                { label: "Phone", key: "phone" },
                                            ].map(field => (
                                                <div key={field.key}>
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">{field.label}</label>
                                                    <input
                                                        type="text"
                                                        className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs font-medium text-gray-700 focus:ring-1 focus:ring-blue-500 outline-none"
                                                        value={editForm[field.key]}
                                                        onChange={(e) => setEditForm({ ...editForm, [field.key]: e.target.value })}
                                                        required={field.key === "name"}
                                                    />
                                                </div>
                                            ))}
                                            <div className="sm:col-span-2">
                                                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Address / Location</label>
                                                <textarea
                                                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs font-medium text-gray-700 focus:ring-1 focus:ring-blue-500 outline-none resize-none h-16"
                                                    value={editForm.address}
                                                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </section>
                                    <section>
                                        <h3 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Professional Background
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {[
                                                { label: "Qualification", key: "qualification" },
                                                { label: "Expected CTC", key: "expectedCTC" },
                                                { label: "Organization", key: "currentCompany" },
                                                { label: "Experience", key: "experience" },
                                            ].map(field => (
                                                <div key={field.key}>
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">{field.label}</label>
                                                    <input
                                                        type="text"
                                                        className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs font-medium text-gray-700 focus:ring-1 focus:ring-blue-500 outline-none"
                                                        value={editForm[field.key]}
                                                        onChange={(e) => setEditForm({ ...editForm, [field.key]: e.target.value })}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </form>
                            ) : (
                                <div className="space-y-6">
                                    <section>
                                        <h3 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Basic Information
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                                            <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                                                <span className="text-xs font-medium text-gray-500">Phone</span>
                                                <span className="text-xs font-bold text-gray-800">{profile?.phone || profile?.mobile || "N/A"}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                                                <span className="text-xs font-medium text-gray-500">Location</span>
                                                <span className="text-xs font-bold text-gray-800 truncate pl-4">{profile?.address || "N/A"}</span>
                                            </div>
                                        </div>
                                    </section>
                                    <section>
                                        <h3 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Professional Experience
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                                            <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                                                <span className="text-xs font-medium text-gray-500">Organization</span>
                                                <span className="text-xs font-bold text-gray-800">{profile?.currentCompany || profile?.companyName || "N/A"}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                                                <span className="text-xs font-medium text-gray-500">Experience</span>
                                                <span className="text-xs font-bold text-gray-800">{profile?.experience || "N/A"}</span>
                                            </div>
                                        </div>
                                    </section>
                                    <section className="bg-gray-50 rounded-lg p-5 border border-gray-100 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <FaFilePdf size={24} className="text-red-500" />
                                            <span className="text-xs font-bold text-gray-700">Curriculum Vitae</span>
                                        </div>
                                        {profile?.resume ? (
                                            <button onClick={() => window.open(formatDocumentUrl(profile.resume), "_blank")} className="px-4 py-1.5 bg-gray-800 text-white rounded text-[10px] font-bold uppercase transition-colors hover:bg-black">Access</button>
                                        ) : (
                                            <span className="text-[10px] font-bold text-gray-400 italic">Not Uploaded</span>
                                        )}
                                    </section>
                                </div>
                            )}
                        </div>
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 shrink-0">
                            {isEditingProfile ? (
                                <>
                                    <button onClick={() => setIsEditingProfile(false)} className="px-5 py-2 text-[10px] font-bold uppercase text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">Cancel</button>
                                    <button form="profile-edit-form" type="submit" disabled={isSavingProfile} className="px-5 py-2 text-[10px] font-bold uppercase text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all">
                                        {isSavingProfile ? "Saving..." : "Save Profile"}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={handleEditToggle} className="px-5 py-2 text-[10px] font-bold uppercase text-blue-600 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-all">Edit Records</button>
                                    <button onClick={() => setIsProfileModalOpen(false)} className="px-5 py-2 text-[10px] font-bold uppercase text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-all">Dismiss</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* DOCUMENT VIEWER MODAL - Re-styled for Exact Match */}
            {isModalOpen && selectedOffer && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-6xl h-[95vh] rounded-2xl shadow-3xl flex flex-col overflow-hidden border border-gray-200">
                        <div className="px-5 py-4 bg-gradient-to-r from-green-500 to-blue-600 flex justify-between items-center text-white shrink-0">
                            <div className="flex items-center gap-3">
                                <FaFilePdf className="text-xl" />
                                <div>
                                    <h2 className="text-lg font-bold">{(selectedOffer.documentType || "OFFICIAL").toUpperCase()} LETTER</h2>
                                    <p className="text-[10px] font-bold tracking-wider opacity-80 uppercase">{selectedOffer.jobId?.role}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {(selectedOffer.adminAttachment || selectedOffer.offerLetter) && (
                                    <button onClick={() => handleDownloadOffer(selectedOffer)} className="bg-white/20 border border-white/30 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase text-white hover:bg-white/30 transition-all">
                                        Download PDF
                                    </button>
                                )}
                                <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-md bg-white/20 flex items-center justify-center text-white hover:bg-red-500 transition-all"><FaTimes /></button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-hidden bg-gray-50 p-4 md:p-8 flex flex-col items-center">
                            <div className="w-full max-w-4xl h-full bg-white rounded-lg shadow-inner border border-gray-200 p-8 md:p-14 overflow-y-auto font-sans text-sm leading-relaxed text-gray-800">
                                {selectedOffer.offerLetter || selectedOffer.resignationLetter ? (
                                    <div className="whitespace-pre-wrap">{selectedOffer.offerLetter || selectedOffer.resignationLetter}</div>
                                ) : selectedOffer.adminAttachment ? (
                                    <iframe src={formatDocumentUrl(selectedOffer.adminAttachment)} title="Document Viewer" className="w-full h-full border-0" />
                                ) : (
                                    <div className="text-center text-gray-500 mt-20">No content available for this document.</div>
                                )}
                            </div>
                        </div>
                        <div className="px-6 py-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white shrink-0">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Digital Asset Verification ID: {selectedOffer._id.slice(-8).toUpperCase()}</span>
                            <div className="flex gap-3 w-full sm:w-auto">
                                <button onClick={() => setIsModalOpen(false)} className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg border border-gray-200 text-[10px] font-bold uppercase text-gray-500 hover:bg-gray-50">Close</button>
                                <button className="flex-1 sm:flex-none px-8 py-2.5 bg-gray-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all">Accept Offer</button>
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
