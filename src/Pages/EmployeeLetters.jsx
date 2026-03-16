import React, { useState, useEffect, useRef } from "react";
import { FaFilePdf, FaEye, FaDownload, FaInbox, FaSearch, FaSync, FaCalendarAlt, FaTimes, FaSignOutAlt } from "react-icons/fa";
import axios from "axios";
import { API_BASE_URL } from "../config";
import { toast, ToastContainer } from "react-toastify";
import { jsPDF } from "jspdf";

const EmployeeLetters = () => {
    const [letters, setLetters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [localSearchQuery, setLocalSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
    const typeDropdownRef = useRef(null);

    const [isResignModalOpen, setIsResignModalOpen] = useState(false);
    const [resignationLetter, setResignationLetter] = useState("");
    const [isSubmittingResign, setIsSubmittingResign] = useState(false);

    // Modal state for viewer
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Get employee details from localStorage
    const employeeDataStr = localStorage.getItem("employeeData");
    const employeeData = employeeDataStr ? JSON.parse(employeeDataStr) : null;
    const employeeId = localStorage.getItem("employeeId");
    const employeeName = localStorage.getItem("employeeName") || employeeData?.name || "N/A";
    const employeeEmail = localStorage.getItem("employeeEmail") || employeeData?.email || "";
    const employeeRole = employeeData?.role || "N/A";

    useEffect(() => {
        if (employeeId) {
            fetchLetters();
        } else {
            setLoading(false);
        }
    }, [employeeId]);

    const fetchLetters = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/employees/letters/${employeeId}`);
            if (response.data.success) {
                setLetters(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching letters:", error);
            toast.error("Failed to load employment letters");
        } finally {
            setLoading(false);
        }
    };

    const docTypes = ["Offer", "Warning", "Appraisal", "Termination", "Resignation"];

    const sectionConfigs = {
        "Offer": {
            bg: "bg-blue-600",
            lightBg: "bg-blue-50",
            text: "text-blue-600",
            border: "border-blue-100",
            iconText: "text-blue-500",
            calIcon: "text-blue-400",
            icon: FaFilePdf,
            label: "Employment Offers"
        },
        "Appointment": {
            bg: "bg-emerald-600",
            lightBg: "bg-emerald-50",
            text: "text-emerald-600",
            border: "border-emerald-100",
            iconText: "text-emerald-500",
            calIcon: "text-emerald-400",
            icon: FaFilePdf,
            label: "Appointment Letters"
        },
        "Appraisal": {
            bg: "bg-purple-600",
            lightBg: "bg-purple-50",
            text: "text-purple-600",
            border: "border-purple-100",
            iconText: "text-purple-500",
            calIcon: "text-purple-400",
            icon: FaFilePdf,
            label: "Appraisal Letters"
        },
        "Warning": {
            bg: "bg-orange-600",
            lightBg: "bg-orange-50",
            text: "text-orange-600",
            border: "border-orange-100",
            iconText: "text-orange-500",
            calIcon: "text-orange-400",
            icon: FaFilePdf,
            label: "Warning Letters"
        },
        "Termination": {
            bg: "bg-rose-600",
            lightBg: "bg-rose-50",
            text: "text-rose-600",
            border: "border-rose-100",
            iconText: "text-rose-500",
            calIcon: "text-rose-400",
            icon: FaFilePdf,
            label: "Termination Letters"
        },
        "Resignation": {
            bg: "bg-rose-600",
            lightBg: "bg-rose-50",
            text: "text-rose-600",
            border: "border-rose-100",
            iconText: "text-rose-500",
            calIcon: "text-rose-400",
            icon: FaSignOutAlt,
            label: "Resignation Records"
        }
    };

    // Check if employee can resign (at least one valid application)
    const canResign = letters.some(app =>
        (app.status === "Selected" || app.status === "Hired") &&
        app.status !== "Resigned"
    );

    const offerApps = letters.flatMap(app => {
        const result = [];

        // 1. Check for Resignation
        if (app.resignationLetter || app.status === "Resigned") {
            result.push({
                ...app,
                documentType: "Resignation",
                offerLetter: "", // Clear offer text 
                adminAttachment: "",
                uniqueId: `${app._id}-resig`
            });
        }

        // 2. Add historical documents if any
        if (app.documentHistory && app.documentHistory.length > 0) {
            app.documentHistory.forEach((hist, index) => {
                // To avoid duplicate if the latest is also in history
                if (hist.content && hist.content === app.offerLetter && hist.documentType === app.documentType) {
                    return;
                }
                if (!hist.content && !hist.documentType) return;

                result.push({
                    ...app,
                    offerLetter: hist.content || "",
                    adminAttachment: "", // Don't inherit current attachment
                    resignationLetter: "", // Don't inherit resignation
                    documentType: hist.documentType || "Offer",
                    updatedAt: hist.sentAt || app.updatedAt,
                    offerSentAt: hist.sentAt || app.offerSentAt,
                    uniqueId: `${app._id}-hist-${index}`
                });
            });
        }

        // 3. Add the current HR document
        const currentDocType = app.documentType || (app.offerLetter ? "Offer" : "Offer");

        if (app.offerLetter || app.adminAttachment || ["Offer", "Warning", "Appraisal", "Termination"].includes(app.documentType)) {
            result.push({
                ...app,
                documentType: currentDocType,
                resignationLetter: "", // Clear so it only renders the HR letter content
                uniqueId: `${app._id}-curr`
            });
        }

        // Fallback if somehow empty
        if (result.length === 0) {
            result.push({ ...app, uniqueId: `${app._id}-curr` });
        }

        return result;
    });

    const filteredLetters = offerApps.filter(app => {
        const combinedQuery = localSearchQuery.toLowerCase();
        const matchesSearch =
            (app.jobId?.role || app.role || "").toLowerCase().includes(combinedQuery) ||
            app.documentType.toLowerCase().includes(combinedQuery);

        const matchesType = typeFilter
            ? app.documentType.toLowerCase() === typeFilter.toLowerCase()
            : true;

        let matchesDate = true;
        if (dateFilter) {
            const relevantDate = app.resignationSentAt || app.offerSentAt || app.updatedAt;
            const issueDate = new Date(relevantDate).toISOString().split("T")[0];
            matchesDate = issueDate === dateFilter;
        }

        return matchesSearch && matchesType && matchesDate;
    });

    // Group letters by documentType
    const groupedLetters = filteredLetters.reduce((acc, letter) => {
        const type = letter.documentType || "Offer";
        if (!acc[type]) acc[type] = [];
        acc[type].push(letter);
        return acc;
    }, {});

    const activeTypes = Object.keys(groupedLetters).sort((a, b) => {
        // Priority: Offer first, Resignation last, others in between alphabetically
        if (a === "Offer") return -1;
        if (b === "Offer") return 1;
        if (a === "Resignation") return 1;
        if (b === "Resignation") return -1;
        return a.localeCompare(b);
    });

    const formatDocumentUrl = (filePath) => {
        if (!filePath) return "";
        const relativePath = filePath.includes("uploads")
            ? "uploads/" + filePath.split(/uploads[\\/]/).pop().replace(/\\/g, "/")
            : filePath.replace(/\\/g, "/");
        return `${API_BASE_URL.replace("/api", "")}/${relativePath}`;
    };

    const handleDownloadOffer = (appOrLetter) => {
        if (!appOrLetter) return;
        const type = appOrLetter.documentType || (appOrLetter.resignationLetter ? "Resignation" : "Offer");
        const content = type === "Resignation"
            ? (appOrLetter.resignationLetter || appOrLetter.offerLetter)
            : (appOrLetter.offerLetter || appOrLetter.resignationLetter);
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
            doc.text("Employee Details:", 20, 55);
            doc.setFont("helvetica", "normal");
            doc.text(`Name: ${appOrLetter.firstName} ${appOrLetter.lastName}`, 20, 62);
            doc.text(`Position: ${appOrLetter.jobId?.role || appOrLetter.role || "Employee"}`, 20, 69);
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
            const fileName = `${type || "Letter"}_${appOrLetter.jobId?.role || "Employee"}.pdf`;
            doc.save(fileName);
        }
    };

    const handleSubmitResignation = async (e) => {
        e.preventDefault();

        if (!employeeEmail) {
            toast.error("Employee email not found. Please log in again.");
            return;
        }

        if (!resignationLetter.trim()) {
            toast.error("Please provide a resignation statement.");
            return;
        }

        setIsSubmittingResign(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/employees/submit-resignation`, {
                email: employeeEmail,
                resignationLetter: resignationLetter
            });

            if (res.data.success) {
                toast.success("Resignation submitted successfully!");
                setIsResignModalOpen(false);
                setResignationLetter("");
                fetchLetters(); // Refresh list to show resignation record
            }
        } catch (err) {
            console.error("Resignation error:", err);
            toast.error(err.response?.data?.message || "Failed to submit resignation");
        } finally {
            setIsSubmittingResign(false);
        }
    };

    const getDocTypeBadge = (type) => {
        const t = (type || "Offer").toLowerCase();
        switch (t) {
            case "offer": return "bg-blue-100 text-blue-800 border-blue-200";
            case "appointment": return "bg-emerald-100 text-emerald-800 border-emerald-200";
            case "appraisal": return "bg-purple-100 text-purple-800 border-purple-200";
            case "warning": return "bg-orange-100 text-orange-800 border-orange-200";
            case "termination": return "bg-rose-100 text-rose-800 border-rose-200";
            case "resignation": return "bg-amber-100 text-amber-800 border-amber-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const resetFilters = () => {
        setLocalSearchQuery("");
        setTypeFilter("");
        setDateFilter("");
    };

    const hasFilters = localSearchQuery || typeFilter || dateFilter;

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-2 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-slate-400 text-[10px] font-medium uppercase tracking-widest">Loading Letters...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100 font-sans">
            <div className="max-w-9xl mx-auto">

                {/* Header & Filters Section */}
                <div className="bg-white p-3 mb-3 rounded-lg shadow-md border border-gray-100">
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Search */}
                        <div className="relative flex-1 min-w-[180px]">
                            <FaSearch className="absolute text-sm text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
                            <input
                                type="text"
                                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 shadow-sm transition-all"
                                placeholder="Search role, doc type..."
                                value={localSearchQuery}
                                onChange={(e) => setLocalSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Document Type Dropdown */}
                        <div className="relative w-full sm:w-40" ref={typeDropdownRef}>
                            <select
                                className="w-full h-8 px-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 cursor-pointer transition-all appearance-none"
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                            >
                                <option value="">All Doc Types</option>
                                {docTypes.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-gray-400">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                            </div>
                        </div>

                        {/* Date Filter */}
                        <div className="relative w-[130px]">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 pointer-events-none">
                                Date:
                            </span>
                            <input
                                type="date"
                                className="w-full pl-10 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 cursor-pointer transition-all"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                            />
                        </div>

                        {/* Reset */}
                        {hasFilters && (
                            <button
                                onClick={resetFilters}
                                className="h-8 px-3 text-xs font-medium text-gray-600 transition bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 flex items-center gap-1"
                            >
                                <FaSync className="text-[10px]" /> Clear
                            </button>
                        )}

                        {/* File Resignation Button - Positioned in the filter row for a sleek look */}
                        {canResign && (
                            <button
                                onClick={() => {
                                    if (!resignationLetter.trim()) {
                                        const template = `To,
The Human Resources Department,
Timely Health Projects

Subject: Resignation Letter

Dear Sir/Madam,

I, ${employeeName}, am writing to formally resign from my position as ${employeeRole} at Timely Health Projects.

My last working day will be [Date]. I would like to thank you for the professional and personal development opportunities I have enjoyed during my tenure.

Please let me know the necessary steps to complete the exit process.

Sincerely,
${employeeName}`;
                                        setResignationLetter(template);
                                    }
                                    setIsResignModalOpen(true);
                                }}
                                className="h-8 px-3 text-xs font-bold text-white transition bg-rose-600 rounded-lg hover:bg-rose-700 flex items-center gap-1 shadow-sm uppercase tracking-wider ml-auto"
                            >
                                <FaSignOutAlt className="text-[10px]" /> Resign
                            </button>
                        )}
                    </div>
                </div>

                {/* DYNAMIC DOCUMENT SECTIONS */}
                {activeTypes.length > 0 ? (
                    activeTypes.map(type => {
                        const config = sectionConfigs[type] || { color: "gray", icon: FaFilePdf, label: `${type}s` };
                        const docs = groupedLetters[type];
                        const Icon = config.icon;
                        const isResignation = type === "Resignation";

                        return (
                            <div key={type} className="mb-6 overflow-hidden bg-white rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center justify-between p-4 bg-white border-b border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 ${config.lightBg} rounded-lg flex items-center justify-center ${config.iconText}`}>
                                            <Icon size={14} />
                                        </div>
                                        <div>
                                            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">{config.label}</h2>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 ${config.lightBg} ${config.text} text-[10px] font-bold rounded-full border ${config.border}`}>
                                        {docs.length} Records
                                    </span>
                                </div>

                                <div className="overflow-x-auto bg-white shadow-lg rounded-b-xl">
                                    <table className="min-w-full">
                                        <thead className="text-sm text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
                                            <tr>
                                                <th className="py-2.5 px-4 text-center">ROLE</th>
                                                {isResignation && <th className="py-2.5 px-4 text-center">STATUS</th>}
                                                <th className="py-2.5 px-4 text-center">{isResignation ? 'FILED ON' : 'ISSUED ON'}</th>
                                                <th className="py-2.5 px-4 text-center">REF ID</th>
                                                <th className="py-2.5 px-4 text-center">ACTIONS</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {docs.map((app) => (
                                                <tr key={app.uniqueId || app._id} className="transition-colors hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-center whitespace-nowrap">
                                                        <span className="text-sm font-medium text-gray-900 uppercase">
                                                            {app.jobId?.role || app.role || "N/A"}
                                                        </span>
                                                    </td>
                                                    {isResignation && (
                                                        <td className="px-4 py-3 text-center whitespace-nowrap">
                                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${app.resignationStatus === "Approved" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                                                                {app.resignationStatus || "Pending"}
                                                            </span>
                                                        </td>
                                                    )}
                                                    <td className="px-4 py-3 text-sm font-medium text-center text-gray-900 whitespace-nowrap">
                                                        {new Date(isResignation ? (app.resignationSentAt || app.updatedAt) : (app.offerSentAt || app.updatedAt)).toLocaleDateString("en-IN", {
                                                            dateStyle: "medium",
                                                        })}
                                                    </td>
                                                    <td className="px-4 py-3 text-center whitespace-nowrap">
                                                        <span className="px-2 py-1 text-xs font-semibold text-gray-600 bg-gray-100 rounded-full">
                                                            #{app._id.slice(-6).toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center whitespace-nowrap">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedOffer(app);
                                                                    setIsModalOpen(true);
                                                                }}
                                                                className={`p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-md transition-all`}
                                                                title="View Document"
                                                            >
                                                                <FaEye size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDownloadOffer(app)}
                                                                className={`p-1.5 text-green-600 bg-green-50 hover:bg-green-600 hover:text-white rounded-md transition-all`}
                                                                title="Download PDF"
                                                            >
                                                                <FaDownload size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="py-20 bg-white rounded-2xl shadow-sm border border-dashed border-gray-200 text-center max-w-2xl mx-auto my-12">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-4 border border-gray-100">
                            <FaInbox size={24} />
                        </div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">No Documents Found</h3>
                        <p className="text-xs text-gray-400">Try adjusting your filters or contact HR if you expect letters here.</p>
                        {hasFilters && (
                            <button onClick={resetFilters} className="mt-4 text-xs font-bold text-blue-600 hover:underline uppercase tracking-tight">Clear all filters</button>
                        )}
                    </div>
                )}
            </div>

            {/* DOCUMENT VIEWER MODAL */}
            {isModalOpen && selectedOffer && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 font-poppins">
                    <div className="bg-white w-full max-w-6xl h-[95vh] rounded-2xl shadow-3xl flex flex-col overflow-hidden border border-gray-200">
                        <div className="px-5 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 flex justify-between items-center text-white shrink-0">
                            <div className="flex items-center gap-3">
                                <FaFilePdf className="text-xl" />
                                <div>
                                    <h2 className="text-lg font-bold">{(selectedOffer.documentType || "OFFICIAL").toUpperCase()} LETTER</h2>
                                    <p className="text-[10px] font-bold tracking-wider opacity-80 uppercase">{selectedOffer.jobId?.role || selectedOffer.role}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {(selectedOffer.adminAttachment || selectedOffer.offerLetter || selectedOffer.resignationLetter) && (
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
                                <button onClick={() => setIsModalOpen(false)} className="px-8 py-2.5 bg-gray-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all">Close Viewer</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Resignation Modal */}
            {isResignModalOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm font-poppins">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-100">
                        <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="bg-rose-100 text-rose-600 p-2 rounded-xl">
                                    <FaSignOutAlt size={16} />
                                </div>
                                <h2 className="text-xl font-bold text-gray-800 tracking-tight">File Resignation</h2>
                            </div>
                            <button onClick={() => setIsResignModalOpen(false)} className="text-gray-400 hover:text-rose-500 transition-colors">
                                <FaTimes size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitResignation} className="p-8">
                            {/* Auto-populated details */}
                            {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                                        <FaSearch className="rotate-90" size={12} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">My Role</p>
                                        <p className="text-xs font-bold text-gray-700 truncate">{employeeRole}</p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center gap-3">
                                    <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                                        <FaCalendarAlt size={12} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">My Name</p>
                                        <p className="text-xs font-bold text-gray-700 truncate">{employeeName}</p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center gap-3 sm:col-span-2">
                                    <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                                        <FaInbox size={12} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">My Registered Email</p>
                                        <p className="text-xs font-bold text-gray-700">{employeeEmail}</p>
                                    </div>
                                </div>
                            </div> */}

                            <div className="mb-6">
                                <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-2 px-1">Resignation statement / reason *</label>
                                <textarea
                                    required
                                    value={resignationLetter}
                                    onChange={(e) => setResignationLetter(e.target.value)}
                                    className="w-full h-80 p-6 bg-white border border-gray-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all text-sm font-medium text-gray-700 shadow-sm leading-relaxed"
                                    placeholder="Please state your reason for resignation and your intended last working day..."
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsResignModalOpen(false)}
                                    className="flex-1 px-6 py-3 rounded-2xl font-bold text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all text-xs uppercase tracking-widest border border-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingResign}
                                    className="flex-2 bg-rose-500 hover:bg-rose-600 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-rose-100 text-xs uppercase tracking-widest flex items-center justify-center min-w-[160px]"
                                >
                                    {isSubmittingResign ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>Submit Resignation</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
        </div>
    );
};

export default EmployeeLetters;
