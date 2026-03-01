import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
    FaBriefcase, FaListUl, FaCode, FaMoneyBillWave,
    FaArrowRight, FaClock, FaCheckCircle, FaExclamationTriangle,
    FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaGraduationCap,
    FaFileUpload, FaTimes, FaMapMarkerAlt, FaHistory, FaFilePdf
} from "react-icons/fa";
import {
    FiUser, FiMail, FiPhone, FiLock, FiBriefcase, FiDollarSign,
    FiCheckCircle, FiX, FiArrowRight, FiFileText, FiMapPin, FiAward
} from "react-icons/fi";
import { FaUserTie } from "react-icons/fa";
import { FiBookOpen, FiLayers } from "react-icons/fi";
import { FiPercent, FiCalendar, FiClock } from "react-icons/fi";
import { FiTrendingUp } from "react-icons/fi";






import { API_BASE_URL } from "../config";

const API_BASE = API_BASE_URL;

function JobDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCheckingExistence, setIsCheckingExistence] = useState(false);
    const [candidateExists, setCandidateExists] = useState(false);
    const [emailChecked, setEmailChecked] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false); // New state
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);

    // const [formData, setFormData] = useState({
    //     firstName: "",
    //     lastName: "",
    //     email: "",
    //     mobile: "",
    //     password: "", // New Field
    //     currentCompany: "",
    //     currentCTC: "",
    //     expectedCTC: "",
    //     resume: null
    // });


    const [formData, setFormData] = useState({
        // Login / Register
        password: "",

        // Basic Details
        firstName: "",
        lastName: "",
        email: "",
        mobile: "",
        address: "",

        // Qualification
        highestQualification: "",
        institution: "",
        department: "",
        percentage: "",
        passingYear: "",

        // Experience
        companyName: "",
        role: "",
        totalExperience: "",   // we mapped this in backend
        currentCompany: "",
        currentLocation: "",
        currentCTC: "",
        expectedCTC: "",

        // Additional
        noticePeriod: "",
        skills: "",
        dateOfJoining: "",

        // Resume
        resume: null
    });


    useEffect(() => {
        // Check if already logged in as candidate
        const token = localStorage.getItem("candidateToken");
        if (token) {
            setEmailChecked(true);
            setCandidateExists(true);
            setIsLoggedIn(true); // Set isLoggedIn if token exists
            // We could fetch profile here if we wanted to pre-fill
        }

        const fetchJobDetails = async () => {
            try {
                // If logged in, check if already applied to this job
                const token = localStorage.getItem("candidateToken");
                if (token) {
                    try {
                        const appRes = await axios.get(`${API_BASE}/candidate/applications`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        const alreadyApplied = appRes.data.some(app => {
                            const appId = app.jobId?._id || app.jobId;
                            return appId && appId.toString() === id.toString();
                        });
                        setHasApplied(alreadyApplied);
                    } catch (err) {
                        console.error("Failed to fetch applications for duplicate check", err);
                    }
                }

                const response = await axios.get(`${API_BASE}/jobs/view/${id}`);
                if (response.data.success) {
                    setJob(response.data.jobPost);
                } else {
                    setError("Job post not found.");
                }
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load job details.");
            } finally {
                setLoading(false);
            }
        };
        fetchJobDetails();
    }, [id]);

    const handleEmailCheck = async () => {
        if (!formData.email) return;
        setIsCheckingExistence(true);
        setMessage({ type: "", text: "" });
        setIsLoggedIn(false); // Reset isLoggedIn on new email check
        try {
            const res = await axios.post(`${API_BASE}/candidate/check-existence`, { email: formData.email });
            if (res.data.exists) {
                setCandidateExists(true);
                setShowPassword(true);
                setEmailChecked(true); // Allow them to see password field
                setMessage({ type: "info", text: "Existing candidate found. Please enter your password to apply." });
            } else {
                setCandidateExists(false);
                setShowPassword(true);
                setEmailChecked(true);
                setMessage({ type: "info", text: "New candidate! Please fill in your details and create a password." });
            }
        } catch (err) {
            console.error("Existence check failed", err);
            setMessage({ type: "error", text: "Authentication server unreachable. Please try again." });
        } finally {
            setIsCheckingExistence(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, resume: e.target.files[0] }));
    };

    const handleLogin = async () => {
        setSubmitting(true);
        try {
            const loginRes = await axios.post(`${API_BASE}/candidate/login`, {
                email: formData.email,
                password: formData.password
            });
            const token = loginRes.data.token;
            // Get candidate ID and details
            const profileRes = await axios.get(`${API_BASE}/candidate/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Pre-fill
            const candidateData = profileRes.data;
            const [fname, ...lname] = (candidateData.name || "").split(' ');
            setFormData(prev => ({
                ...prev,
                firstName: fname,
                lastName: lname.join(' '),
                mobile: candidateData.phone || prev.mobile,
                currentCompany: candidateData.currentCompany || prev.currentCompany,
                currentCTC: candidateData.currentCTC || prev.currentCTC,
                expectedCTC: candidateData.expectedCTC || prev.expectedCTC,
                skills: candidateData.skills || prev.skills,
                address: candidateData.address || prev.address,
                highestQualification: candidateData.highestQualification || prev.highestQualification,
                institution: candidateData.institution || prev.institution,
                department: candidateData.department || prev.department,
                percentage: candidateData.percentage || prev.percentage,
                passingYear: candidateData.passingYear || prev.passingYear,
                totalExperience: candidateData.experience || prev.totalExperience,
                currentLocation: candidateData.currentLocation || prev.currentLocation,
            }));

            localStorage.setItem("candidateToken", token);
            localStorage.setItem("candidateId", profileRes.data._id);
            setIsLoggedIn(true);

            // Check if already applied after login
            try {
                const appRes = await axios.get(`${API_BASE}/candidate/applications`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const alreadyApplied = appRes.data.some(app => {
                    const appId = app.jobId?._id || app.jobId;
                    return appId && appId.toString() === id.toString();
                });
                setHasApplied(alreadyApplied);
                if (alreadyApplied) {
                    setMessage({ type: "info", text: "You have already applied for this position." });
                } else {
                    setMessage({ type: "success", text: "Details auto-filled! Please review and click Apply." });
                }
            } catch (err) {
                setMessage({ type: "success", text: "Details auto-filled! Please review and click Apply." });
            }

        } catch (err) {
            setMessage({ type: "error", text: "Invalid password. Please try again." });
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setSubmitting(true);
        setMessage({ type: "", text: "" });

        try {
            let candidateId = localStorage.getItem("candidateId");
            let token = localStorage.getItem("candidateToken");

            // Handle Registration login if not already active
            if (!token && !candidateExists) {
                // Register
                const regRes = await axios.post(`${API_BASE}/candidate/register`, {
                    name: `${formData.firstName} ${formData.lastName}`,
                    email: formData.email,
                    password: formData.password,
                    phone: formData.mobile,
                    currentCompany: formData.currentCompany,
                    currentCTC: formData.currentCTC,
                    expectedCTC: formData.expectedCTC,
                });
                token = regRes.data.token;
                // Get candidate ID
                const profileRes = await axios.get(`${API_BASE}/candidate/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                candidateId = profileRes.data._id;
                localStorage.setItem("candidateToken", token);
                localStorage.setItem("candidateId", candidateId);
            }

            // Now Submit Application
            const data = new FormData();
            data.append("jobId", job._id);
            data.append("candidateId", candidateId);

            Object.keys(formData).forEach(key => {
                if (key === 'resume') {
                    if (formData[key]) data.append("resume", formData[key]);
                } else if (key !== 'password') { // Don't send password to application endpoint
                    data.append(key, formData[key]);
                }
            });

            const res = await axios.post(`${API_BASE}/applications/submit`, data, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (res.data.success) {
                setMessage({ type: "success", text: "Application submitted successfully!" });

                if ((job.assessmentIds && job.assessmentIds.length > 0) || job.assessmentId) {
                    setTimeout(() => {
                        const firstQuizId = job.assessmentIds?.[0]?._id || job.assessmentIds?.[0] || job.assessmentId?._id || job.assessmentId;
                        navigate(`/assessment/${job._id}/${res.data.application._id}${firstQuizId ? '/' + (firstQuizId._id || firstQuizId) : ''}`);
                    }, 2000);
                } else {
                    setTimeout(() => {
                        setIsModalOpen(false);
                        setEmailChecked(false);
                        setShowPassword(false);
                    }, 3000);
                }
            }
        } catch (err) {
            setMessage({
                type: "error",
                text: err.response?.data?.message || "Failed to process application. Please check your credentials."
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-100 rounded-2xl animate-pulse"></div>
                        <div className="absolute inset-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-2xl animate-spin"></div>
                    </div>
                    <p className="text-blue-400 font-bold text-[10px] uppercase tracking-[0.3em] animate-pulse">Initializing Portal...</p>
                </div>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-6">
                <div className="max-w-lg w-full bg-white p-12 rounded-2xl shadow-2xl shadow-blue-900/5 text-center border border-blue-50 animate-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <FaExclamationTriangle size={32} />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Post Not Found</h2>
                    <p className="text-gray-500 mb-10 leading-relaxed font-medium">{error || "This job posting may have been archived or the link might be incorrect."}</p>
                    <a href="/" className="inline-block bg-blue-600 text-white px-10 py-4 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all hover:shadow-xl shadow-blue-100 transform active:scale-95 uppercase tracking-widest">
                        Return to Careers
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 pb-20 font-sans text-slate-800">
            {/* Professional Career Portal Hero */}
            <div className="relative overflow-hidden bg-white border-b border-blue-100 pt-20 pb-28 px-4">
                {/* Subtle Background Accents */}
                <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl"></div>

                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="flex flex-wrap items-center gap-2 mb-6 animate-in fade-in slide-in-from-left-4 duration-500">
                        <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100 shadow-sm">
                            Career Opportunity
                        </span>
                        <span className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2 shadow-sm">
                            <FaCheckCircle className="text-xs" /> Now Hiring
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight text-gray-900 animate-in fade-in slide-in-from-left-6 duration-700 max-w-4xl">
                        {job.role}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 text-gray-600 font-bold animate-in fade-in slide-in-from-left-8 duration-1000">
                        <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl border border-blue-100 shadow-sm">
                            <FaMoneyBillWave className="text-blue-500 text-xl" />
                            <span className="text-gray-900 font-black">{job.salary || "Competitive Market Rate"}</span>
                        </div>
                        <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl border border-gray-100 shadow-sm">
                            <FaClock className="text-purple-500" />
                            <span className="text-[10px] uppercase tracking-widest font-black text-gray-400">
                                Posted {job.createdAt && !isNaN(new Date(job.createdAt).getTime())
                                    ? new Date(job.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long' })
                                    : "Recently"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Integration */}
            <div className="max-w-6xl mx-auto px-4 -mt-12 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Column - Details */}
                    <div className="lg:col-span-3 space-y-8 animate-in slide-in-from-bottom-8 duration-700">
                        <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/5 overflow-hidden border border-blue-50 p-8 md:p-12">
                            <div className="space-y-12">
                                {/* Responsibilities Card */}
                                <section className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
                                            <FaListUl className="text-xl" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-gray-900 tracking-tight">Job Description</h2>
                                            <p className="text-[9px] text-blue-400 font-bold uppercase tracking-widest mt-0.5">Primary role expectations</p>
                                        </div>
                                    </div>
                                    {/* <div className="text-gray-600 leading-relaxed whitespace-pre-wrap pl-4 border-l-4 border-blue-100 text-base font-medium">
                                        {job.responsibilities}
                                    </div> */}
                                    <div className="text-gray-600 leading-relaxed whitespace-pre-wrap pl-4 border-l-4 border-blue-100 text-base font-medium">
                                        {job.description || job.responsibilities || "No description provided."}
                                    </div>

                                </section>

                                {/* Skills Card */}
                                {/* <section className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-xl flex items-center justify-center shadow-lg shadow-purple-100">
                                            <FaCode className="text-xl" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-gray-900 tracking-tight">Required Skills</h2>
                                            <p className="text-[9px] text-purple-400 font-bold uppercase tracking-widest mt-0.5">Key technical qualifications</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-3 pt-2">
                                        {job.skills.split(',').map((skill, idx) => (
                                            <span key={idx} className="bg-blue-50/50 text-blue-700 px-5 py-3 rounded-xl text-[10px] font-black border border-blue-100 hover:bg-blue-600 hover:text-white transition-all cursor-default uppercase tracking-widest">
                                                {skill.trim()}
                                            </span>
                                        ))}
                                    </div>
                                 

                                </section> */}
                                <section className="space-y-10">

                                    {/* 🔹 Job Overview Section */}
                                    <div className="grid md:grid-cols-2 gap-8">

                                        {/* Work Location */}
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 text-white rounded-xl flex items-center justify-center shadow-lg shadow-red-100">
                                                <FaMapMarkerAlt className="text-xl" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-black text-gray-900 tracking-tight">
                                                    Work Location
                                                </h2>
                                                {/* <p className="text-[9px] text-red-400 font-bold uppercase tracking-widest mt-0.5">
                    Job location details
                </p> */}
                                                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap pl-4 border-l-4 border-blue-100 text-base font-medium">
                                                    {job?.location}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Experience Required */}
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                                                <FaUserTie className="text-xl" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-black text-gray-900 tracking-tight">
                                                    Experience Required
                                                </h2>
                                                {/* <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest mt-0.5">
                    Minimum qualification level
                </p> */}
                                                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap pl-4 border-l-4 border-blue-100 text-base font-medium">
                                                    {job?.experience}
                                                </p>
                                            </div>
                                        </div>

                                    </div>


                                    {/* 🔹 Required Skills Section */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-xl flex items-center justify-center shadow-lg shadow-purple-100">
                                                <FaCode className="text-xl" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-black text-gray-900 tracking-tight">
                                                    Required Skills
                                                </h2>
                                                {/* <p className="text-[9px] text-purple-400 font-bold uppercase tracking-widest mt-0.5">
                    Key technical qualifications
                </p> */}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-3 pt-2">
                                            {job?.skills ? (
                                                job.skills.split(',').filter(s => s.trim()).map((skill, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="bg-blue-50/50 text-blue-700 px-5 py-3 rounded-xl text-[10px] font-black border border-blue-100 hover:bg-blue-600 hover:text-white transition-all cursor-default uppercase tracking-widest"
                                                    >
                                                        {skill.trim()}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-gray-400 text-xs italic">No specific skills listed</span>
                                            )}
                                        </div>
                                    </div>

                                </section>

                            </div>
                        </div>
                    </div>

                    {/* Right Column - Action Card */}
                    <div className="lg:col-span-1 animate-in slide-in-from-right-8 duration-700">
                        <div className="sticky top-24 space-y-6">
                            <div className="bg-white rounded-2xl shadow-2xl shadow-blue-900/10 border border-blue-50 p-8 text-center group">
                                <div className="w-20 h-20 flex items-center justify-center bg-blue-50/50 rounded-2xl mx-auto mb-6 transition-transform group-hover:scale-105 duration-500 border border-blue-100">
                                    <FaBriefcase className="text-4xl text-blue-600" />
                                </div>
                                <h3 className="text-xl font-black text-gray-900 mb-4">Join our team</h3>

                                {((job.assessmentIds && job.assessmentIds.length > 0) || job.assessmentId) && (
                                    <div className="mb-6 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl flex items-center justify-center gap-2 border border-blue-100/50">
                                        <FaClock className="animate-pulse" /> Assessment Enclosed
                                    </div>
                                )}

                                <p className="text-gray-500 mb-8 leading-relaxed text-xs font-medium">
                                    {((job.assessmentIds && job.assessmentIds.length > 0) || job.assessmentId)
                                        ? "Apply to begin the screening and assessment process."
                                        : "Submit your official application for team evaluation."}
                                </p>

                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    disabled={hasApplied}
                                    className={`w-full px-8 py-4 rounded-xl font-black text-sm transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 shadow-lg ${hasApplied
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                                        : "bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:shadow-blue-200"
                                        }`}
                                >
                                    {hasApplied ? "Applied" : "Apply Now"}
                                    {!hasApplied && <FaArrowRight className="text-xs transition-transform group-hover:translate-x-1" />}
                                </button>
                            </div>

                            {/* Response Metrics */}
                            <div className="bg-white rounded-2xl p-6 flex items-center justify-around border border-blue-50 shadow-sm">
                                <div className="text-center">
                                    <span className="block text-lg font-black text-gray-900">24h</span>
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Response</span>
                                </div>
                                <div className="w-px h-8 bg-blue-50"></div>
                                <div className="text-center">
                                    <span className="block text-lg font-black text-gray-900">Fast</span>
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Review</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-20 text-center">
                    <div className="inline-block px-8 py-3 bg-white rounded-full border border-blue-50 text-[9px] font-black uppercase tracking-[0.4em] text-blue-300 shadow-sm">
                        Timely Health Recruitment
                    </div>
                </div>
            </div>

            {/* Redesigned Application Modal - Styled to match JobPost exactly */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden relative animate-in slide-in-from-bottom-4 duration-300 border border-gray-100">
                        {/* Modal Header */}
                        <div className="px-8 pt-8 pb-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl text-gray-800">
                                    Apply for {job.role}
                                </h2>

                                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">
                                    {emailChecked ? "Complete your profile details" : "Start your recruitment journey"}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setEmailChecked(false);
                                    setCandidateExists(false);
                                    setMessage({ type: "", text: "" });
                                }}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            >
                                <FiX className="text-lg" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 pt-4 max-h-[75vh] overflow-y-auto no-scrollbar">
                            {message.text && (
                                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-4 ${message.type === "success" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                    message.type === "info" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                                        "bg-rose-50 text-rose-600 border border-rose-100"
                                    }`}>
                                    {message.type === "success" ? <FiCheckCircle className="text-lg shrink-0" /> : <FiX className="text-lg shrink-0" />}
                                    <span className="text-sm font-bold">{message.text}</span>
                                </div>
                            )}

                            {!emailChecked ? (
                                <div className="space-y-5 animate-in fade-in duration-300">
                                    <div className="space-y-1.5">
                                        <label className="block mb-1 text-sm font-medium text-gray-700">Email Address</label>
                                        <div className="relative group">
                                            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors z-10" />
                                            <input
                                                type="email" name="email" required
                                                value={formData.email} onChange={handleChange}
                                                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm text-gray-800 bg-white"
                                                placeholder="e.g. candidate@domain.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <button
                                            onClick={handleEmailCheck}
                                            disabled={isCheckingExistence || !formData.email}
                                            className="w-full py-4 px-8 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 hover:shadow-lg shadow-blue-100 transition-all transform active:scale-95 disabled:bg-blue-300 disabled:shadow-none flex items-center justify-center gap-3"
                                        >
                                            {isCheckingExistence ? (
                                                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Validating...</>
                                            ) : (
                                                <>Continue to Form <FiArrowRight /></>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-5 animate-in slide-in-from-right-4 duration-500">
                                    {candidateExists && !isLoggedIn ? (
                                        <div className="space-y-5">
                                            <div className="space-y-1.5">
                                                <label className="block mb-1 text-sm font-medium text-gray-700">Existing Account Password</label>
                                                <div className="relative group">
                                                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors z-10" />
                                                    <input
                                                        type="password" name="password" required
                                                        value={formData.password} onChange={handleChange}
                                                        className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm text-gray-800 bg-white"
                                                        placeholder="••••••••"
                                                    />
                                                </div>
                                            </div>
                                            <div className="pt-2">
                                                <button
                                                    onClick={handleLogin}
                                                    disabled={submitting || !formData.password}
                                                    className="w-full py-4 px-8 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all transform active:scale-95 shadow-lg shadow-blue-100 flex items-center justify-center gap-3"
                                                >
                                                    {submitting ? "Authenticating..." : "Login & Auto-fill"}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSubmit} className="space-y-5">
                                            {!isLoggedIn && (
                                                <div className="space-y-1.5">
                                                    <label className="block mb-1 text-sm font-medium text-gray-700">Create Security Password</label>
                                                    <div className="relative group">
                                                        <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors z-10" />
                                                        <input
                                                            type="password" name="password" required
                                                            value={formData.password} onChange={handleChange}
                                                            className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm text-gray-800 bg-white"
                                                            placeholder="••••••••"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            <label style={{ textAlign: 'center' }} className="block mb-1 text-sm  font-medium text-blue-400">Candidate Basic Details</label>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <div className="space-y-1.5">
                                                    <label className="block mb-1 text-sm font-medium text-gray-700">First Name</label>
                                                    <input
                                                        type="text" name="firstName" required
                                                        value={formData.firstName} onChange={handleChange}
                                                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm text-gray-800 bg-white"
                                                        placeholder="John"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="block mb-1 text-sm font-medium text-gray-700">Last Name</label>
                                                    <input
                                                        type="text" name="lastName" required
                                                        value={formData.lastName} onChange={handleChange}
                                                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm text-gray-800 bg-white"
                                                        placeholder="Doe"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <div className="space-y-1.5">
                                                    <label className="block mb-1 text-sm font-medium text-gray-700">Mobile</label>
                                                    <div className="relative group">
                                                        <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors z-10" />
                                                        <input
                                                            type="tel" name="mobile" required
                                                            value={formData.mobile} onChange={handleChange}
                                                            className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm text-gray-800 bg-white"
                                                            placeholder="+91..."
                                                        />
                                                    </div>
                                                </div>


                                                <div className="space-y-1.5">
                                                    <label className="block mb-1 text-sm font-medium text-gray-700">Adress</label>
                                                    <div className="relative group">
                                                        <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors z-10" />
                                                        <input
                                                            type="text" name="currentCompany"
                                                            value={formData.currentCompany} onChange={handleChange}
                                                            className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm text-gray-800 bg-white"
                                                            placeholder="Hyderabad,india."
                                                        />
                                                    </div>
                                                </div>



                                                {/* <div className="space-y-1.5">
                                                    <label className="block mb-1 text-sm font-medium text-gray-700">Company</label>
                                                    <div className="relative group">
                                                        <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors z-10" />
                                                        <input
                                                            type="text" name="currentCompany"
                                                            value={formData.currentCompany} onChange={handleChange}
                                                            className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm text-gray-800 bg-white"
                                                            placeholder="Current Org"
                                                        />
                                                    </div>
                                                </div> */}
                                            </div>

                                            <label style={{ textAlign: 'center' }} className="block mb-1 text-sm  font-medium text-blue-400">Qualification Details</label>

                                            {/* <div className="space-y-1.5">
                                                <label className="block mb-1 text-sm font-medium text-gray-700">Qualification</label>
                                                <div className="relative group">
                                                    <FiFileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors z-10" />
                                                    <input
                                                        type="text" name="highestQualification"
                                                        value={formData.highestQualification} onChange={handleChange}
                                                        className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm text-gray-800 bg-white"
                                                        placeholder="Highest Degree"
                                                    />
                                                </div>
                                            </div> */}



                                            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <div className="space-y-1.5">
                                                    <label className="block mb-1 text-sm font-medium text-gray-700">Current CTC</label>
                                                    <div className="relative group">
                                                        <FiDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors z-10" />
                                                        <input
                                                            type="text" name="currentCTC"
                                                            value={formData.currentCTC} onChange={handleChange}
                                                            className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm text-gray-800 bg-white"
                                                            placeholder="e.g. 12 LPA"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="block mb-1 text-sm font-medium text-gray-700">Expected CTC</label>
                                                    <div className="relative group">
                                                        <FiAward className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors z-10" />
                                                        <input
                                                            type="text" name="expectedCTC"
                                                            value={formData.expectedCTC} onChange={handleChange}
                                                            className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm text-gray-800 bg-white"
                                                            placeholder="e.g. 15 LPA"
                                                        />
                                                    </div>
                                                </div>
                                            </div> */}

                                            <div className="space-y-1.5">
                                                <label className="block mb-1 text-sm font-medium text-gray-700">Qualification</label>
                                                <div className="relative group">
                                                    <FiFileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors z-10" />
                                                    <input
                                                        type="text" name="highestQualification"
                                                        value={formData.highestQualification} onChange={handleChange}
                                                        className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm text-gray-800 bg-white"
                                                        placeholder="Highest Degree"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                                {/* College / University / School */}
                                                <div className="space-y-1.5">
                                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                                        College / University / School
                                                    </label>
                                                    <div className="relative group">
                                                        <FiBookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors z-10" />
                                                        <input
                                                            type="text"
                                                            name="institution"
                                                            value={formData.institution}
                                                            onChange={handleChange}
                                                            className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm text-gray-800 bg-white"
                                                            placeholder="Enter your College / University / School"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Department */}
                                                <div className="space-y-1.5">
                                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                                        Department
                                                    </label>
                                                    <div className="relative group">
                                                        <FiLayers className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors z-10" />
                                                        <input
                                                            type="text"
                                                            name="department"
                                                            value={formData.department}
                                                            onChange={handleChange}
                                                            className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm text-gray-800 bg-white"
                                                            placeholder="Enter your Department (e.g. Computer Science)"
                                                        />
                                                    </div>
                                                </div>

                                            </div>


                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                                {/* Percentage */}
                                                <div className="space-y-1.5">
                                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                                        Percentage
                                                    </label>
                                                    <div className="relative group">
                                                        <FiPercent className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors z-10" />
                                                        <input
                                                            type="number"
                                                            name="percentage"
                                                            value={formData.percentage}
                                                            onChange={handleChange}
                                                            className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm text-gray-800 bg-white"
                                                            placeholder="Enter your Percentage (e.g. 85)"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Passed Out Year */}
                                                {/* <div className="space-y-1.5">
                                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                                        Passed Out Year
                                                    </label>
                                                    <div className="relative group">
                                                        <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors z-10" />
                                                        <input
                                                            type="number"
                                                            name="passedOutYear"
                                                            // value={formData.passedOutYear}
                                                            // onChange={handleChange}

                                                            value={formData.passingYear}

                                                            className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm text-gray-800 bg-white"
                                                            placeholder="Enter your Passed Out Year (e.g. 2023)"
                                                        />
                                                    </div>
                                                </div> */}

                                                <div className="space-y-1.5">
                                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                                        Passed Out Year
                                                    </label>

                                                    <div className="relative group">
                                                        <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors z-10" />

                                                        <input
                                                            type="number"
                                                            name="passingYear"   // ✅ must match state key
                                                            value={formData.passingYear}
                                                            onChange={handleChange}  // ✅ required
                                                            className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm text-gray-800 bg-white"
                                                            placeholder="Enter your Passed Out Year (e.g. 2023)"
                                                        />
                                                    </div>
                                                </div>


                                            </div>

                                            <label style={{ textAlign: 'center' }} className="block mb-1 text-sm  font-medium text-blue-400">Experience</label>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                                {/* Company Name */}
                                                <div className="space-y-1.5">
                                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                                        Company Name
                                                    </label>
                                                    <div className="relative group">
                                                        <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors z-10" />
                                                        <input
                                                            type="text"
                                                            name="companyName"
                                                            value={formData.companyName}
                                                            onChange={handleChange}
                                                            className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm text-gray-800 bg-white"
                                                            placeholder="Enter your Company Name"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Role */}
                                                <div className="space-y-1.5">
                                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                                        Role
                                                    </label>
                                                    <div className="relative group">
                                                        <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors z-10" />
                                                        <input
                                                            type="text"
                                                            name="role"
                                                            value={formData.role}
                                                            onChange={handleChange}
                                                            className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm text-gray-800 bg-white"
                                                            placeholder="Enter your Role (e.g. Frontend Developer)"
                                                        />
                                                    </div>
                                                </div>

                                            </div>


                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <div className="space-y-1.5">
                                                    <label className="block mb-1 text-sm font-medium text-gray-700">Current CTC</label>
                                                    <div className="relative group">
                                                        <FiDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors z-10" />
                                                        <input
                                                            type="text" name="currentCTC"
                                                            value={formData.currentCTC} onChange={handleChange}
                                                            className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm text-gray-800 bg-white"
                                                            placeholder="e.g. 12 LPA"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="block mb-1 text-sm font-medium text-gray-700">Expected CTC</label>
                                                    <div className="relative group">
                                                        <FiAward className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors z-10" />
                                                        <input
                                                            type="text" name="expectedCTC"
                                                            value={formData.expectedCTC} onChange={handleChange}
                                                            className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm text-gray-800 bg-white"
                                                            placeholder="e.g. 15 LPA"
                                                        />
                                                    </div>
                                                </div>
                                            </div>




                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                                {/* Office Location */}
                                                <div className="space-y-1.5">
                                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                                        Office Location
                                                    </label>
                                                    <div className="relative group">
                                                        <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors z-10" />
                                                        <input
                                                            type="text"
                                                            // name="officeLocation"
                                                            // value={formData.officeLocation}
                                                            name="currentLocation"
                                                            value={formData.currentLocation}

                                                            onChange={handleChange}
                                                            className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm text-gray-800 bg-white"
                                                            placeholder="Enter your Office Location (e.g. Bangalore)"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Total Experience */}
                                                <div className="space-y-1.5">
                                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                                        Total Experience (Years)
                                                    </label>
                                                    <div className="relative group">
                                                        <FiTrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors z-10" />
                                                        <input
                                                            type="number"
                                                            name="totalExperience"
                                                            value={formData.totalExperience}
                                                            onChange={handleChange}
                                                            min="0"
                                                            className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm text-gray-800 bg-white"
                                                            placeholder="Enter total experience (e.g. 2)"
                                                        />
                                                    </div>
                                                </div>

                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                                {/* Notice Period */}
                                                <div className="space-y-1.5">
                                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                                        Notice Period (Days)
                                                    </label>
                                                    <div className="relative group">
                                                        <FiClock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors z-10" />
                                                        <input
                                                            type="text"
                                                            name="noticePeriod"
                                                            value={formData.noticePeriod}
                                                            onChange={handleChange}
                                                            className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm text-gray-800 bg-white"
                                                            placeholder="e.g. 30 Days"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Date of Joining */}
                                                <div className="space-y-1.5">
                                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                                        Expected Date of Joining
                                                    </label>
                                                    <div className="relative group">
                                                        <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors z-10" />
                                                        <input
                                                            type="date"
                                                            name="dateOfJoining"
                                                            value={formData.dateOfJoining}
                                                            onChange={handleChange}
                                                            className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm text-gray-800 bg-white"
                                                        />
                                                    </div>
                                                </div>

                                            </div>







                                            <div className="space-y-1.5">
                                                <label className="block mb-1 text-sm font-medium text-gray-700">Resume Upload (PDF)</label>
                                                <input
                                                    type="file" accept=".pdf,.doc,.docx"
                                                    onChange={handleFileChange}
                                                    className="w-full px-4 py-6 rounded-xl border-2 border-dashed border-gray-100 hover:bg-blue-50/30 hover:border-blue-200 transition-all font-bold text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                                                />
                                            </div>

                                            <div className="pt-4 flex flex-col md:flex-row gap-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsModalOpen(false)}
                                                    className="flex-1 py-3.5 px-6 rounded-xl font-bold text-gray-400 hover:text-gray-800 hover:bg-gray-50 transition-all border border-transparent"
                                                >
                                                    Discard
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={submitting}
                                                    className="flex-[1.5] py-3.5 px-8 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 hover:shadow-lg shadow-blue-100 transition-all transform active:scale-95 disabled:bg-blue-300 flex items-center justify-center gap-3"
                                                >
                                                    {submitting ? (
                                                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Sending...</>
                                                    ) : (
                                                        <>{candidateExists ? "Confirm & Apply" : "Register & Apply"} <FiArrowRight /></>
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default JobDetails;