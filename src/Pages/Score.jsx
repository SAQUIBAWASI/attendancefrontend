import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";
import { FaUser, FaEnvelope, FaBriefcase, FaStar, FaPaperPlane, FaSave, FaTimes, FaSync, FaTasks, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { FiRefreshCw, FiX, FiSearch, FiBriefcase as FiBriefcaseIcon, FiFilter } from "react-icons/fi";
import {FaUserTie,} from "react-icons/fa";

const Score = () => {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [scoreFilter, setScoreFilter] = useState(0);
    const [roleFilter, setRoleFilter] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [roles, setRoles] = useState([]);
    const [roleSearchQuery, setRoleSearchQuery] = useState("");
    const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
    const roleDropdownRef = useRef(null);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteForm, setInviteForm] = useState({
        subject: "Interview Invitation - Timely Health",
        time: "",
        interviewMode: "Online", // Default to Online
    });
    

    const [locations, setLocations] = useState([]); // State for office locations

    const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
    const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
    const [selectedAssessmentData, setSelectedAssessmentData] = useState(null);
    const [docsForm, setDocsForm] = useState({
        agreementsContent: "Please read, sign, and re-upload this agreement for next steps.",
    });

    const [quizzes, setQuizzes] = useState([]);

    useEffect(() => {
        fetchCandidates();
        fetchQuizzes();
        fetchLocations();
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
                setRoles(res.data.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch roles:", err);
        }
    };

    const fetchLocations = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/location/alllocation`);
            if (res.data?.locations) setLocations(res.data.locations);
        } catch (err) {
            console.error("Failed to fetch locations:", err);
        }
    };

    const fetchQuizzes = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/admin/getallquizes`);
            if (res.data?.quizzes) setQuizzes(res.data.quizzes);
        } catch (err) {
            console.error("Failed to fetch quizzes:", err);
        }
    };

    const fetchCandidates = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE_URL}/applications/all`);
            if (res.data.success) {
                setCandidates(res.data.applications);
            }
        } catch (err) {
            setError("Failed to fetch candidates score data");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateScore = async (id, field, value) => {
        // Cast to number for score fields
        const numericValue = (field === "status") ? value : Number(value);

        try {
            const res = await axios.post(`${API_BASE_URL}/applications/update-score`, {
                applicationId: id,
                [field]: numericValue,
            });
            if (res.data.success) {
                setCandidates((prev) =>
                    prev.map((c) => (c._id === id ? { ...c, [field]: numericValue } : c))
                );
            }
        } catch (err) {
            console.error("Update score error:", err);
        }
    };

    const handleOpenInviteModal = (candidate) => {
        setSelectedCandidate(candidate);
        setIsInviteModalOpen(true);
    };

    const handleSendInvite = async () => {
        if (!inviteForm.time || !inviteForm.subject) {
            alert("Please fill in all fields");
            return;
        }

        try {
            const res = await axios.post(`${API_BASE_URL}/applications/send-invitation`, {
                applicationId: selectedCandidate._id,
                interviewSubject: inviteForm.subject,
                interviewTime: inviteForm.time,
                interviewMode: inviteForm.interviewMode,
            });

            if (res.data.success) {
                alert("Interview invitation sent successfully!");
                setIsInviteModalOpen(false);
                fetchCandidates();
            }
        } catch (err) {
            console.error("Send invite error:", err);
            alert("Failed to send invitation");
        }
    };

    // ✅ Added Missing Functions for Offer and Docs
    const navigate = useNavigate();

    const handleOpenOfferModal = (candidate) => {
        navigate(`/sendoffer?id=${candidate._id}&email=${candidate.email}`);
    };

    const handleOpenDocsModal = (candidate) => {
        setSelectedCandidate(candidate);
        setDocsForm({ agreementsContent: candidate.adminAgreements || "Please read, sign, and re-upload this agreement for next steps." });
        setIsDocsModalOpen(true);
    };

    const handleOpenAssessmentDetails = (candidate) => {
        if (!candidate.assessmentResults || candidate.assessmentResults.length === 0) {
            alert("No assessment data available for this candidate.");
            return;
        }

        const latest = candidate.assessmentResults[candidate.assessmentResults.length - 1];

        // ---- DEBUG: Open browser console (F12) to see this ----
        console.log("=== ASSESSMENT DEBUG ===");
        console.log("Candidate:", candidate.firstName, candidate.lastName);
        console.log("latest.quizId type:", typeof latest.quizId, latest.quizId);
        console.log("latest.answers length:", latest.answers?.length ?? "undefined/null");
        console.log("latest.answers sample:", latest.answers?.[0]);
        console.log("All quizzes IDs:", quizzes.map(q => q._id));
        // --------------------------------------------------------

        // The backend now populates assessmentResults.quizId with {title, questions}
        let matchedQuiz = null;

        if (latest.quizId && typeof latest.quizId === 'object' && latest.quizId.questions) {
            // Backend populated: use directly
            matchedQuiz = latest.quizId;
            console.log("Matched quiz from populated quizId:", matchedQuiz.title, "questions:", matchedQuiz.questions?.length);
        } else {
            // Fallback: search in separately-fetched quizzes list by ID
            const quizId = typeof latest.quizId === 'object' ? latest.quizId?._id : latest.quizId;
            matchedQuiz = quizzes.find(q => String(q._id) === String(quizId));
            console.log("Fallback quiz search for ID:", quizId, "found:", matchedQuiz?.title ?? "NOT FOUND");

            // Last resort: match by quiz title extracted from comment
            if (!matchedQuiz && candidate.comment) {
                const titleMatch = candidate.comment.match(/"([^"]+)"/);
                if (titleMatch?.[1]) {
                    matchedQuiz = quizzes.find(q => q.title === titleMatch[1]);
                    console.log("Title fallback match:", matchedQuiz?.title ?? "NOT FOUND");
                }
            }
        }

        let enrichedAnswers = [];

        if (matchedQuiz && matchedQuiz.questions && matchedQuiz.questions.length > 0) {
            enrichedAnswers = matchedQuiz.questions.map((q, idx) => {
                const storedByText = latest.answers?.find(a => a.questionText === q.questionText);
                const storedByIndex = latest.answers?.[idx];
                const storedAns = storedByText || storedByIndex;

                const selected = storedAns?.selectedOption || "Not Answered";
                const correct = q.correctAnswer || "";

                console.log(`Q${idx + 1}: stored="${selected}", correct="${correct}"`);

                return {
                    questionText: q.questionText,
                    options: q.options || [],
                    correctAnswer: correct,
                    selectedOption: selected,
                    isCorrect: String(selected).trim() === String(correct).trim(),
                    marks: q.marks || 1,
                };
            });
        } else if (latest.answers && latest.answers.length > 0) {
            // No quiz template available — use stored answers directly
            enrichedAnswers = latest.answers.map(ans => ({
                questionText: ans.questionText || "Question",
                options: ans.options?.length > 0
                    ? ans.options
                    : [ans.selectedOption, ans.correctAnswer].filter(Boolean),
                correctAnswer: ans.correctAnswer || "",
                selectedOption: ans.selectedOption || "Not Answered",
                isCorrect: ans.isCorrect !== undefined
                    ? ans.isCorrect
                    : String(ans.selectedOption).trim() === String(ans.correctAnswer).trim(),
                marks: ans.marks || 1
            }));
        }

        console.log("Final enrichedAnswers count:", enrichedAnswers.length);

        setSelectedAssessmentData({
            ...latest,
            answers: enrichedAnswers,
            quizTitle: matchedQuiz?.title || "Assessment"
        });
        setSelectedCandidate(candidate);
        setIsAssessmentModalOpen(true);
    };

    const [docsFile, setDocsFile] = useState(null);

    const handleSendAgreements = async () => {
        const formData = new FormData();
        formData.append("applicationId", selectedCandidate._id);
        formData.append("agreementsContent", docsForm.agreementsContent);
        if (docsFile) {
            formData.append("adminAttachment", docsFile);
        }

        try {
            const res = await axios.post(`${API_BASE_URL}/applications/send-agreements`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            if (res.data.success) {
                alert("Agreements sent successfully!");
                setDocsFile(null); // Reset file
                fetchCandidates();
            }
        } catch (err) {
            console.error(err);
            alert("Failed to send agreements");
        }
    };

    const handleReviewDocs = async (status) => {
        try {
            const res = await axios.post(`${API_BASE_URL}/applications/review-documents`, {
                applicationId: selectedCandidate._id,
                status
            });
            if (res.data.success) {
                alert(`Documents ${status}`);
                setIsDocsModalOpen(false);
                fetchCandidates();
            }
        } catch (err) {
            console.error(err);
            alert("Failed to update status");
        }
    };

    const filteredCandidates = candidates.filter(c => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = `${c.firstName} ${c.lastName}`.toLowerCase().includes(query) ||
            (c.jobId?.role || "").toLowerCase().includes(query);

        const matchesScore = (c.technicalScore || 0) >= scoreFilter;

        const matchesRole = roleFilter ? (c.jobId?.role === roleFilter) : true;

        const matchesDate = dateFilter
            ? new Date(c.appliedAt).toISOString().slice(0, 10) === dateFilter
            : true;

        return matchesSearch && matchesScore && matchesRole && matchesDate;
    });

    const resetFilters = () => {
        setSearchQuery("");
        setScoreFilter(0);
        setRoleFilter("");
        setRoleSearchQuery("");
        setDateFilter("");
    };

    if (loading) return <div className="p-8 text-center">Loading Score Board...</div>;

    return (
        <div className="w-full min-h-screen bg-gray-50/50 p-4 md:p-6 lg:p-8">
            <div className="flex flex-col gap-4 mb-6 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex-shrink-0">
                    <h2 className="text-base font-bold text-gray-800">Scoring & Selection</h2>
                </div>

                <div className="flex flex-wrap items-center justify-start xl:justify-end gap-3 flex-grow">
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

                    {/* Searchable Dept/Role Filter */}
                    <div className="relative w-full sm:w-56" ref={roleDropdownRef}>
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 z-10">
                            <FiBriefcaseIcon className="text-sm" />
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
                                />
                            ) : (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 pointer-events-none"><path d="m6 9 6 6 6-6" /></svg>
                            )}
                        </div>

                        {isRoleDropdownOpen && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="p-2 border-b border-gray-100 bg-gray-50">
                                    <div className="relative">
                                        <FiSearch className="absolute left-2.5 top-2.5 text-gray-400 text-xs" />
                                        <input
                                            type="text"
                                            className="w-full py-1.5 pl-8 pr-4 text-xs bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Search roles..."
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
                                        All Roles
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
                                            No roles found
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
                    <div className="relative w-full sm:w-40">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                            <FaStar className="text-[12px]" />
                        </div>
                        <select
                            className="w-full appearance-none bg-white py-2 pl-10 pr-10 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all hover:bg-gray-50 cursor-pointer shadow-sm"
                            value={scoreFilter}
                            onChange={(e) => setScoreFilter(Number(e.target.value))}
                        >
                            <option value="0">All Scores</option>
                            <option value="60">60% & Up</option>
                            <option value="70">70% & Up</option>
                            <option value="80">80% & Up</option>
                            <option value="90">90% & Up</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            {scoreFilter > 0 ? (
                                <FaTimes
                                    className="text-[12px] text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
                                    onClick={() => setScoreFilter(0)}
                                />
                            ) : (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 pointer-events-none"><path d="m6 9 6 6 6-6" /></svg>
                            )}
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full sm:w-64">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                            <FiSearch className="text-sm" />
                        </div>
                        <input
                            type="text"
                            className="w-full py-2 pl-10 pr-10 text-sm text-gray-700 placeholder-gray-400 transition-all border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Search name or role..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                <FaTimes
                                    className="text-[12px] text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
                                    onClick={() => setSearchQuery("")}
                                />
                            </div>
                        )}
                    </div>

                    {/* Reset Button */}
                    <div className="flex items-center gap-2">
                        {(searchQuery || roleFilter || scoreFilter > 0) && (
                            <button
                                onClick={resetFilters}
                                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 hover:text-gray-900 rounded-lg transition-colors border border-gray-200"
                                title="Reset All Filters"
                            >
                                <FaSync className="text-xs" />
                                <span className="hidden sm:inline">Reset</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

            <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
                <table className="min-w-full">
                    <thead className="text-left text-sm text-white bg-gradient-to-r from-purple-500 to-blue-600">
                        <tr>
                            <th className="py-3 px-4 text-center">Candidate</th>
                            <th className="py-3 px-4 text-center">Role</th>
                            <th className="py-3 px-4 text-center">Appearance (10)</th>
                            <th className="py-3 px-4 text-center">Knowledge (10)</th>
                            <th className="py-3 px-4 text-center">Assessment Score (100)</th>
                            {/* <th className="py-3 px-4 text-center">Assessment</th> */}
                            <th className="py-3 px-4 text-center">Rating (10)</th>
                            <th className="py-3 px-4 text-center">Status</th>
                            <th className="py-3 px-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCandidates.map((c) => (
                            <tr key={c._id} className="border-b hover:bg-gray-50 transition-colors">
                                <td className="p-4 text-sm font-medium text-center">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-800">{c.firstName} {c.lastName}</span>
                                        {/* <span className="text-[10px] text-gray-400 flex items-center justify-center gap-1"><FaEnvelope /> {c.email}</span> */}
                                    </div>
                                </td>
                                <td className="p-4 text-sm font-medium text-center">
                                    <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded uppercase font-bold">
                                        {c.jobId?.role || "N/A"}
                                    </span>
                                </td>
                                <td className="p-4 text-sm font-medium text-center">
                                    <input
                                        type="number"
                                        min="0"
                                        max="10"
                                        className="w-16 p-1 border rounded text-xs text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={c.appearanceScore || 0}
                                        onChange={(e) => handleUpdateScore(c._id, "appearanceScore", e.target.value)}
                                    />
                                </td>
                                <td className="p-4 text-sm font-medium text-center">
                                    <input
                                        type="number"
                                        min="0"
                                        max="10"
                                        className="w-16 p-1 border rounded text-xs text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={c.workKnowledge || 0}
                                        onChange={(e) => handleUpdateScore(c._id, "workKnowledge", e.target.value)}
                                    />
                                </td>
                                <td className="p-4 text-sm font-medium text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            className="w-16 p-1 border rounded text-xs text-center font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={c.technicalScore || 0}
                                            onChange={(e) => handleUpdateScore(c._id, "technicalScore", e.target.value)}
                                        />
                                        {c.assessmentResults && c.assessmentResults.length > 0 && (
                                            <button
                                                onClick={() => handleOpenAssessmentDetails(c)}
                                                className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl transition-all duration-300 shadow-sm hover:shadow-md border border-indigo-100 group flex items-center justify-center transform hover:-translate-y-0.5"
                                                title="View Detailed Answers"
                                            >
                                                <FaTasks size={14} className="group-hover:scale-110 transition-transform" />
                                            </button>
                                        )}
                                    </div>
                                </td>

                                <td className="p-4 text-sm font-medium text-center">
                                    <select
                                        className="p-1 border rounded text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={c.overallRating || 0}
                                        onChange={(e) => handleUpdateScore(c._id, "overallRating", e.target.value)}
                                    >
                                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => <option key={v} value={v}>{v}</option>)}
                                    </select>
                                </td>
                                <td className="p-4 text-sm font-medium text-center">
                                    <select
                                        className={`p-1 border rounded text-[10px] font-bold ${c.status === "Selected" ? "text-green-600 bg-green-50" :
                                            c.status === "Interview" ? "text-blue-600 bg-blue-50" : "text-gray-600"
                                            }`}
                                        value={c.status || "Pending"}
                                        onChange={(e) => handleUpdateScore(c._id, "status", e.target.value)}
                                    >
                                        <option value="Pending">PENDING</option>
                                        <option value="Shortlisted">SHORTLISTED</option>
                                        <option value="Interview">INTERVIEW</option>
                                        <option value="Selected">SELECTED</option>
                                        <option value="Rejected">REJECTED</option>
                                    </select>
                                    {(c.interviewStatus === 'Invited' || c.interviewStatus === 'Rescheduled') && c.candidateInterviewStatus && (
                                        <div className="mt-1">
                                            <span className={`text-[8px] font-black uppercase tracking-tighter ${c.candidateInterviewStatus === 'Confirmed' ? 'text-indigo-600 bg-indigo-50 px-1 rounded' : c.candidateInterviewStatus === 'Declined' ? 'text-rose-600 bg-rose-50 px-1 rounded' : 'text-amber-600 bg-amber-50 px-1 rounded'}`}>
                                                {c.candidateInterviewStatus === 'Pending' ? 'Awaiting Conf' : `Interview ${c.candidateInterviewStatus}`}
                                            </span>
                                            {c.candidateInterviewNote && (
                                                <div className="text-[8px] text-gray-400 italic truncate max-w-[80px] mx-auto mt-0.5" title={c.candidateInterviewNote}>
                                                    "{c.candidateInterviewNote}"
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </td>
                                {/* <td className="p-4 text-sm font-medium text-center">
                                    <div className="flex justify-center gap-2">
                                        {c.status === "Selected" && (
                                            <button
                                                onClick={() => handleOpenInviteModal(c)}
                                                className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center justify-center gap-1 text-[10px] font-bold shadow-sm"
                                                title="Send Interview Invite"
                                            >
                                                <FaPaperPlane /> INVITE
                                            </button>
                                        )}
                                        {c.status === "Selected" && (
                                            <button
                                                onClick={() => handleOpenOfferModal(c)}
                                                className="p-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 transition flex items-center justify-center gap-1 text-[10px] font-bold shadow-sm"
                                                title="Send Offer Letter"
                                            >
                                                <FaEnvelope /> OFFER
                                            </button>
                                        )}
                                        {c.status === "Selected" && (
                                            <button
                                                onClick={() => handleOpenDocsModal(c)}
                                                className={`p-1.5 text-white rounded transition flex items-center justify-center gap-1 text-[10px] font-bold shadow-sm ${c.docReviewStatus === "Accepted" ? "bg-green-600 hover:bg-green-700" :
                                                    c.docReviewStatus === "Pending" ? "bg-orange-500 hover:bg-orange-600" :
                                                        "bg-indigo-600 hover:bg-indigo-700"
                                                    }`}
                                            >
                                                DOCS
                                            </button>
                                        )}
                                    </div>
                                </td> */}
                                <td className="p-4 text-sm font-medium text-center">
                                    <div className="flex justify-center gap-2">

                                        {/* ✅ Show only INVITE when status = Interview */}
                                        {c.status === "Interview" && (
                                            <button
                                                onClick={() => handleOpenInviteModal(c)}
                                                className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-1.5 text-[10px] font-black tracking-widest shadow-md hover:shadow-lg hover:-translate-y-0.5"
                                            >
                                                <FaPaperPlane className="text-white/90" /> INVITE
                                            </button>
                                        )}

                                        {/* ✅ Show OFFER + DOCS when status = Selected */}
                                        {c.status === "Selected" && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleOpenOfferModal(c)}
                                                    className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white rounded-xl hover:from-purple-600 hover:to-fuchsia-700 transition-all duration-300 flex items-center justify-center gap-1.5 text-[10px] font-black tracking-widest shadow-md hover:shadow-lg hover:-translate-y-0.5"
                                                >
                                                    <FaEnvelope className="text-white/90" /> OFFER
                                                </button>

                                                <button
                                                    onClick={() => handleOpenDocsModal(c)}
                                                    className={`px-3 py-1.5 text-white rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 text-[10px] font-black tracking-widest shadow-md hover:shadow-lg hover:-translate-y-0.5 ${c.docReviewStatus === "Accepted"
                                                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                                                        : c.docReviewStatus === "Pending"
                                                            ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                                                            : "bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900"
                                                        }`}
                                                >
                                                    DOCS
                                                </button>
                                            </div>
                                        )}

                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredCandidates.length === 0 && <div className="p-8 text-center text-gray-500 font-bold">No candidates found matching filters.</div>}
            </div>

            {/* Invite Modal */}
            {
                isInviteModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <FaPaperPlane className="text-blue-600" /> Send Interview Invite
                            </h2>
                            <p className="text-sm text-gray-600 mb-4">
                                Candidate: <span className="font-semibold text-gray-800">{selectedCandidate?.firstName} {selectedCandidate?.lastName}</span>
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                        value={inviteForm.subject}
                                        onChange={(e) => setInviteForm({ ...inviteForm, subject: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Interview Time & Date</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                        value={inviteForm.time}
                                        onChange={(e) => setInviteForm({ ...inviteForm, time: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Interview Mode / Location</label>
                                    <select
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 font-bold text-sm"
                                        value={inviteForm.interviewMode}
                                        onChange={(e) => setInviteForm({ ...inviteForm, interviewMode: e.target.value })}
                                    >
                                        <option value="Online">🌐 Online (Google Meet / Zoom)</option>
                                        {locations.map(loc => (
                                            <option key={loc._id} value={loc.fullAddress}>
                                                📍 {loc.name} - {loc.fullAddress}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                                    onClick={() => setIsInviteModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 shadow-lg"
                                    onClick={handleSendInvite}
                                >
                                    Send Invitation
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Document Management Modal */}
            {
                isDocsModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <FaSave className="text-indigo-600" /> Document Management
                                </h2>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${selectedCandidate?.docReviewStatus === 'Accepted' ? 'bg-green-100 text-green-700' :
                                    selectedCandidate?.docReviewStatus === 'Pending' ? 'bg-orange-100 text-orange-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                    Review Status: {selectedCandidate?.docReviewStatus}
                                </span>
                            </div>

                            <div className="space-y-6">
                                {/* Step 1: Send Agreements */}
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                    <h3 className="text-sm font-black uppercase text-slate-700 mb-3 tracking-wider">Step 1: Agreements for Candidate</h3>
                                    <textarea
                                        className="w-full p-3 border rounded-md text-sm min-h-[150px] focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Enter agreement terms or instructions..."
                                        value={docsForm.agreementsContent}
                                        onChange={(e) => setDocsForm({ ...docsForm, agreementsContent: e.target.value })}
                                    />
                                    <div className="mt-3">
                                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Attach Agreement Check (PDF/Doc)</label>
                                        <input
                                            type="file"
                                            className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                            onChange={(e) => setDocsFile(e.target.files[0])}
                                        />
                                    </div>
                                    <button
                                        onClick={handleSendAgreements}
                                        className="mt-3 px-6 py-2 bg-indigo-600 text-white rounded text-xs font-bold uppercase tracking-widest hover:bg-indigo-700"
                                    >
                                        Send / Update Agreements
                                    </button>
                                </div>

                                {/* Step 2: Review Candidate Upload */}
                                {selectedCandidate?.candidateAgreementsUpload && (
                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                        <h3 className="text-sm font-black uppercase text-blue-800 mb-3 tracking-wider">Step 2: Review Uploaded Document</h3>
                                        <div className="flex items-center justify-between bg-white p-3 rounded border border-blue-100 mb-4">
                                            <div className="flex items-center gap-2">
                                                <FaPaperPlane className="text-blue-500" />
                                                <span className="text-xs font-bold text-slate-700">Signed_Agreement.pdf</span>
                                            </div>
                                            <button
                                                onClick={() => window.open(`${API_BASE_URL.replace('/api', '')}/${selectedCandidate.candidateAgreementsUpload}`, '_blank')}
                                                className="text-[10px] font-black uppercase text-blue-600 hover:underline"
                                            >
                                                View Upload
                                            </button>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleReviewDocs("Accepted")}
                                                className="flex-1 py-2 bg-green-600 text-white rounded text-xs font-bold uppercase tracking-widest hover:bg-green-700 shadow-md"
                                            >
                                                Accept Documents
                                            </button>
                                            <button
                                                onClick={() => handleReviewDocs("Rejected")}
                                                className="flex-1 py-2 bg-red-600 text-white rounded text-xs font-bold uppercase tracking-widest hover:bg-red-700 shadow-md"
                                            >
                                                Reject & Resubmit
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {!selectedCandidate?.candidateAgreementsUpload && (
                                    <div className="text-center p-8 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                                        <p className="text-xs font-bold text-slate-400 uppercase">Awaiting candidate upload...</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end mt-6">
                                <button
                                    className="px-6 py-2 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 rounded"
                                    onClick={() => setIsDocsModalOpen(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
            {/* Assessment Detail Modal */}
            {isAssessmentModalOpen && selectedAssessmentData && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
                    <div className="bg-white max-w-4xl w-full rounded-2xl shadow-2xl overflow-hidden relative animate-in slide-in-from-bottom-4 duration-300 border border-gray-100 max-h-[90vh] flex flex-col">

                        {/* Header matching JobPost */}
                        <div className="px-8 pt-8 pb-6 border-b border-gray-100 flex-shrink-0">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-xl text-gray-800 font-bold flex items-center gap-2">
                                        <FaTasks className="text-indigo-600" />
                                        Assessment Answer Sheet
                                    </h2>
                                    <p className="text-[10px] font-bold uppercase tracking-widest mt-1.5 text-gray-500">
                                        {selectedAssessmentData.quizTitle && `Quiz: ${selectedAssessmentData.quizTitle} • `}Candidate: <span className="text-indigo-600">{selectedCandidate?.firstName} {selectedCandidate?.lastName}</span>
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsAssessmentModalOpen(false)}
                                    className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all"
                                >
                                    <FiX className="text-lg" />
                                </button>
                            </div>

                            {/* Clean Stats Line */}
                            <div className="flex items-center gap-6  border-t border-gray-100/50">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-gray-500">Final Score:</span>
                                    <span className="text-sm font-black text-indigo-600">
                                        {selectedAssessmentData.score}<span className="text-xs text-gray-400 font-bold">/100</span>
                                    </span>
                                </div>

                                <div className="h-4 w-[1px] bg-gray-200"></div>

                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-gray-500">Questions:</span>
                                    <span className="text-sm font-black text-gray-700">
                                        {selectedAssessmentData.answers?.length || selectedAssessmentData.totalQuestions || 0}
                                    </span>
                                </div>

                                <div className="h-4 w-[1px] bg-gray-200"></div>

                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-gray-500">Status:</span>
                                    <span className={`text-xs font-black uppercase tracking-wider ${selectedAssessmentData.score >= 70 ? 'text-emerald-600' :
                                        selectedAssessmentData.score >= 50 ? 'text-amber-600' :
                                            'text-rose-600'
                                        }`}>
                                        {selectedAssessmentData.score >= 70 ? "Excellent" : selectedAssessmentData.score >= 50 ? "Average" : "Poor"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Answers List */}
                        <div className="p-8 overflow-y-auto space-y-6 flex-grow bg-white">
                            {selectedAssessmentData.answers && selectedAssessmentData.answers.length > 0 ? (
                                selectedAssessmentData.answers.map((ans, idx) => {
                                    const optionLabels = ["A", "B", "C", "D", "E", "F", "G", "H"];
                                    const options = ans.options && ans.options.length > 0
                                        ? ans.options
                                        : [ans.selectedOption, ans.correctAnswer].filter(Boolean);

                                    return (
                                        <div key={idx} className="bg-white rounded-xl border border-gray-200 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] overflow-hidden">
                                            {/* Question Header */}
                                            <div className="flex items-start gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-black text-xs ${ans.isCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                                    Q{idx + 1}
                                                </div>
                                                <div className="flex-grow pt-1">
                                                    <p className="text-sm font-bold text-gray-800 leading-relaxed">{ans.questionText}</p>
                                                </div>
                                                <div className="shrink-0 pt-1.5 flex items-center gap-1.5">
                                                    {ans.isCorrect ? (
                                                        <span className="text-[10px] font-black uppercase text-emerald-600 flex items-center gap-1"><FaCheckCircle className="text-sm" /> Correct</span>
                                                    ) : (
                                                        <span className="text-[10px] font-black uppercase text-rose-600 flex items-center gap-1"><FaExclamationTriangle className="text-sm" /> Incorrect</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Options Grid */}
                                            <div className="p-5 space-y-2.5">
                                                {options.map((opt, oIdx) => {
                                                    const isCorrectOpt = String(opt).trim() === String(ans.correctAnswer).trim();
                                                    const isCandidateOpt = String(opt).trim() === String(ans.selectedOption).trim();
                                                    const label = optionLabels[oIdx] || String(oIdx + 1);

                                                    let optStyle = "bg-white border-gray-200 text-gray-600";
                                                    let radioStyle = "border-gray-200 border-2";
                                                    let badge = null;

                                                    if (isCorrectOpt && isCandidateOpt) {
                                                        optStyle = "bg-emerald-50/50 border-emerald-300 text-emerald-800";
                                                        radioStyle = "border-emerald-500 bg-emerald-500";
                                                        badge = <span className="text-[9px] font-black text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded text-right uppercase tracking-wider">✓ Selected Correctly</span>;
                                                    } else if (isCorrectOpt) {
                                                        optStyle = "bg-emerald-50/30 border-emerald-200 text-emerald-700 border-dashed";
                                                        radioStyle = "border-emerald-400 border-2";
                                                        badge = <span className="text-[9px] font-black text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded text-right uppercase tracking-wider">✓ Correct Answer</span>;
                                                    } else if (isCandidateOpt) {
                                                        optStyle = "bg-rose-50/50 border-rose-300 text-rose-800";
                                                        radioStyle = "border-rose-500 bg-rose-500";
                                                        badge = <span className="text-[9px] font-black text-rose-600 bg-rose-100 px-2.5 py-1 rounded text-right uppercase tracking-wider">✗ Selected Incorrectly</span>;
                                                    }

                                                    return (
                                                        <div key={oIdx} className={`flex items-center gap-4 px-4 py-3 rounded-xl border transition-all ${optStyle}`}>
                                                            {/* Option Label */}
                                                            <div className="shrink-0">
                                                                <span className="text-[10px] font-black text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded uppercase">{label}</span>
                                                            </div>

                                                            {/* Radio Circle */}
                                                            <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${radioStyle}`}>
                                                                {(isCandidateOpt || isCorrectOpt) && (
                                                                    <div className={`w-1.5 h-1.5 rounded-full ${isCorrectOpt && !isCandidateOpt ? 'bg-emerald-400' : 'bg-white'}`} />
                                                                )}
                                                            </div>

                                                            {/* Option text */}
                                                            <p className="text-xs font-semibold flex-grow">{opt}</p>

                                                            {/* Badge */}
                                                            {badge && (
                                                                <div className="shrink-0 flex items-center justify-end min-w-[120px]">
                                                                    {badge}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center justify-center">
                                    <div className="w-16 h-16 bg-white text-gray-300 rounded-full flex items-center justify-center mb-4 border border-gray-100 shadow-sm">
                                        <FaTasks className="text-3xl" />
                                    </div>
                                    <p className="text-gray-800 font-bold mb-1">No detailed analysis available</p>
                                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest max-w-xs">Old assessment record without question tracking</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-8 py-4 border-t border-gray-100 bg-gray-50 flex justify-end flex-shrink-0">
                            <button
                                onClick={() => setIsAssessmentModalOpen(false)}
                                className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg font-bold text-xs uppercase tracking-widest transition-all shadow-[0_2px_4px_rgba(0,0,0,0.02)]"
                            >
                                Close View
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default Score;
