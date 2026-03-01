import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import {
    FaUserCheck, FaFileAlt, FaCheckCircle,
    FaChevronLeft, FaPaperPlane, FaShieldAlt,
    FaRocket, FaInfoCircle, FaEnvelope, FaImage
} from "react-icons/fa";
import { toast } from "react-toastify";

const InfoItem = ({ label, value }) => (
    <div className="flex flex-col">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">{label}</p>
        <p className="text-sm font-bold text-gray-800 tracking-tight">{value || "N/A"}</p>
    </div>
);

const renderMarkdown = (text) => {
    if (!text) return "";
    let html = text
        .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-black mb-6 text-gray-900 border-b-2 border-gray-100 pb-4">$1</h1>')
        .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mb-4 text-gray-800 mt-8">$1</h2>')
        .replace(/^### (.*$)/gm, '<h3 class="text-sm font-black mb-4 text-blue-600 uppercase tracking-[0.2em] mt-8">$1</h3>')
        .replace(/\*\*(.*?)\*\*/gm, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/gm, '<em>$1</em>')
        .replace(/^- (.*$)/gm, '<li class="ml-2 mb-2 text-gray-700">$1</li>');

    // Simple paragraph handling
    return html.split('\n').map(line => line.trim() ? `<p class="mb-2">${line}</p>` : '<div class="h-4"></div>').join('');
};

const SendOffer = () => {
    const query = new URLSearchParams(useLocation().search);
    const applicationId = query.get("id");
    const candidateEmail = query.get("email");
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [candidate, setCandidate] = useState(null);
    const [documentType, setDocumentType] = useState("Offer");
    const [offerContent, setOfferContent] = useState("");
    const [isPreview, setIsPreview] = useState(false);
    const [logoUrl, setLogoUrl] = useState("https://placehold.co/200x60/6366f1/ffffff?text=Timely+Health");

    const [docsVerified, setDocsVerified] = useState({
        resume: true,
        idProof: false,
        academicCertificates: false,
        experienceLetter: false,
    });

    useEffect(() => {
        if (applicationId || candidateEmail) {
            fetchApplicationDetails();
        } else {
            setFetching(false);
        }
    }, [applicationId, candidateEmail]);

    const getTemplate = (type, data) => {
        const { name, email, role, date, joiningDate, salary, location } = data;

        switch (type) {
            case "Appraisal":
                return `
# EMPLOYMENT APPRAISAL LETTER

**Date:** ${date}

**To:**
**${name}**
**Email:** ${email}

**Subject: Annual Performance Appraisal & Salary Revision**

**Dear ${name},**

Following our recent performance review for the previous financial year, we are pleased to inform you that your contribution to **Timely Health** has been exemplary. We value your commitment and are delighted to reward your hard work.

### REVISION DETAILS:
- **New Designation:** ${role}
- **Revised CTC:** ${salary}
- **Effective Date:** [Specify Date]

We look forward to your continued growth and success with the organization. Keep up the excellent work!

Best Regards,

**Management**
Timely Health Group
                `.trim();

            case "Warning":
                return `
# DISCIPLINARY WARNING LETTER

**Date:** ${date}

**To:**
**${name}**
**Email:** ${email}

**Subject: Formal Warning Regarding [Performance/Conduct]**

**Dear ${name},**

This letter serves as a formal warning regarding your recent [Performance/Conduct] issues observed between [Start Date] and [End Date]. Specifically, we have noted concerns regarding:

- [Issue 1: e.g., Recurring tardiness]
- [Issue 2: e.g., Delayed deliverables]

### REQUIRED ACTIONS:
Please ensure immediate improvement in the areas mentioned above. Failure to do so may result in further disciplinary action, up to and including termination of employment.

We hope to see a positive change in your performance moving forward.

Best Regards,

**Human Resources Department**
Timely Health Group
                `.trim();

            case "Termination":
                return `
# EMPLOYMENT TERMINATION NOTICE

**Date:** ${date}

**To:**
**${name}**
**Email:** ${email}

**Subject: Notice of Termination of Employment**

**Dear ${name},**

We regret to inform you that your employment with **Timely Health** is being terminated, effective [Effective Date], due to [Reason: e.g., Structural Redundancy / Performance Concerns].

### FINAL SETTLEMENT:
- **Last Working Day:** [Date]
- **Notice Period:** [Details]
- **Outstanding Dues:** To be settled within 45 days of the last working day.

Please return all company property (Laptop, ID Card, etc.) by your last working day to the HR department.

We wish you the best in your future endeavors.

Best Regards,

**Head of Human Resources**
Timely Health Group
                `.trim();

            default:
                return `
# EMPLOYMENT OFFER LETTER

**Date:** ${date}

**To:**
**${name}**
**Email:** ${email}

**Subject: Offer of Employment - ${role}**

**Dear ${name},**

Following our recent interview and evaluation process, we are pleased to offer you the position of **${role}** at **Timely Health**. We were highly impressed by your qualifications and we believe your expertise will be a significant asset to our mission.

### KEY TERMS OF EMPLOYMENT:
- **Designation:** ${role}
- **Joining Date:** ${joiningDate}
- **Salary (CTC):** ${salary}
- **Work Location:** ${location}

### NEXT STEPS:
Please ensure you have authenticated all required documents in your candidate portal. We look forward to having you on board.

Best Regards,

**Head of Talent Acquisition**
Timely Health Group
                `.trim();
        }
    };

    const fetchApplicationDetails = async () => {
        try {
            setFetching(true);
            let app = null;

            if (applicationId && applicationId !== "undefined") {
                const res = await axios.get(`${API_BASE_URL}/applications/get/${applicationId}`);
                if (res.data.success) app = res.data.application;
            }

            if (!app && candidateEmail) {
                const res = await axios.get(`${API_BASE_URL}/applications/all`);
                if (res.data.success) {
                    app = res.data.applications.find(a => a.email === candidateEmail);
                }
            }

            if (app) {
                setCandidate(app);
                if (app.documentsVerified) {
                    setDocsVerified({
                        resume: app.documentsVerified.resume || false,
                        idProof: app.documentsVerified.idProof || false,
                        academicCertificates: app.documentsVerified.academicCertificates || app.documentsVerified.educationalDocs || false,
                        experienceLetter: app.documentsVerified.experienceLetter || false,
                    });
                }

                const data = {
                    name: `${app.firstName} ${app.lastName}`,
                    email: app.email || "[Candidate Email]",
                    role: app.jobId?.role || "Team Member",
                    date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
                    joiningDate: app.dateOfJoining ? new Date(app.dateOfJoining).toLocaleDateString() : "[To be discussed]",
                    salary: app.expectedCTC ? `INR ${app.expectedCTC} per annum` : "As per agreed terms",
                    location: app.currentLocation || "Corporate Office"
                };

                setOfferContent(getTemplate("Offer", data));
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch candidate details");
        } finally {
            setFetching(false);
        }
    };

    const handleVerifyChange = (key) => setDocsVerified(s => ({ ...s, [key]: !s[key] }));

    const handleSendOffer = async () => {
        const appId = applicationId || candidate?._id;
        if (!appId) return toast.error("No Application ID found");

        try {
            setLoading(true);
            const res = await axios.post(`${API_BASE_URL}/applications/send-offer`, {
                applicationId: appId,
                email: candidateEmail || candidate?.email,
                offerLetterContent: offerContent,
                documentsVerified: docsVerified,
                documentType: documentType
            });

            if (res.data.success) {
                toast.success("Offer letter dispatched successfully");
                navigate("/score");
            }
        } catch (err) {
            toast.error("Dispatch Failed: " + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-6">
                <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                <div className="text-center">
                    <p className="text-base font-bold text-gray-800">Drafting Offer...</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-3 mx-auto bg-white rounded-lg shadow-md max-w-full min-h-screen">
            <div className="flex flex-col gap-6">
                {/* Header Section */}
                <div className="flex flex-col gap-4 mb-2 xl:flex-row xl:items-center xl:justify-between px-2">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors shadow-sm"
                        >
                            <FaChevronLeft className="text-xs" /> Back
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                Dispatch Offer Letter
                            </h1>
                            <p className="text-gray-400 text-[10px] font-black mt-1 uppercase tracking-widest">
                                Professional Documentation Pipeline
                            </p>
                        </div>
                    </div>

                    {candidate && (
                        <div className="flex items-center gap-4 bg-gray-50 px-5 py-3 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-lg font-black shadow-lg shadow-blue-100">
                                {candidate.firstName.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-gray-800 leading-tight">{candidate.firstName} {candidate.lastName}</span>
                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{candidate.jobId?.role}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-2">
                    {/* Left: Configuration Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Checklist */}
                        {/* <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                                <FaShieldAlt className="text-emerald-500" /> Documents Verification
                            </h3>
                            <div className="space-y-2">
                                {Object.keys(docsVerified).map((key) => (
                                    <label key={key} className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${docsVerified[key] ? 'bg-emerald-50 border-emerald-100' : 'bg-gray-50 border-gray-100 hover:bg-white'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${docsVerified[key] ? 'bg-emerald-500 text-white' : 'bg-white text-gray-300 border border-gray-200'}`}>
                                                {docsVerified[key] ? <FaCheckCircle size={12} /> : <FaInfoCircle size={12} />}
                                            </div>
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${docsVerified[key] ? 'text-emerald-700' : 'text-gray-500'}`}>
                                                {key.replace(/([A-Z])/g, ' $1')}
                                            </span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={docsVerified[key]}
                                            onChange={() => handleVerifyChange(key)}
                                        />
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${docsVerified[key] ? 'border-emerald-500 bg-emerald-500' : 'border-gray-200'}`}>
                                            {docsVerified[key] && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div> */}

                        {/* Branding */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                                <FaFileAlt className="text-purple-500" /> Document Type
                            </h3>
                            <div className="space-y-2">
                                {["Offer", "Appraisal", "Warning", "Termination"].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => {
                                            if (window.confirm(`Switch to ${type} template? This will overwrite your current edits.`)) {
                                                setDocumentType(type);
                                                const data = {
                                                    name: `${candidate?.firstName} ${candidate?.lastName}`,
                                                    email: candidate?.email || "[Candidate Email]",
                                                    role: candidate?.jobId?.role || "Team Member",
                                                    date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
                                                    joiningDate: candidate?.dateOfJoining ? new Date(candidate?.dateOfJoining).toLocaleDateString() : "[To be discussed]",
                                                    salary: candidate?.expectedCTC ? `INR ${candidate?.expectedCTC} per annum` : "As per agreed terms",
                                                    location: candidate?.currentLocation || "Corporate Office"
                                                };
                                                setOfferContent(getTemplate(type, data));
                                            }
                                        }}
                                        className={`w-full text-left p-3 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest ${documentType === type ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-gray-50 border-gray-100 text-gray-400 hover:bg-white hover:text-gray-600'}`}
                                    >
                                        {type} Letter
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Branding */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                                <FaImage className="text-blue-500" /> Branding Reference
                            </h3>
                            <div className="space-y-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Logo Provider URL</label>
                                    <input
                                        type="text"
                                        value={logoUrl}
                                        onChange={(e) => setLogoUrl(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-mono"
                                    />
                                </div>
                                <div className="h-28 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center p-4">
                                    <img src={logoUrl} alt="Preview" className="max-h-full max-w-full object-contain" onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=Invalid+Logo'} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Main Content Area */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden flex flex-col min-h-[750px]">
                            {/* Tabs synchronized with JobApplicants detail style */}
                            <div className="flex bg-gray-50/50 p-1.5 gap-1.5 border-b border-gray-100">
                                <button
                                    onClick={() => setIsPreview(false)}
                                    className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${!isPreview ? 'bg-white text-purple-600 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                                >
                                    Template Editor
                                </button>
                                <button
                                    onClick={() => setIsPreview(true)}
                                    className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${isPreview ? 'bg-white text-blue-600 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                                >
                                    Preview
                                </button>
                            </div>

                            <div className="flex-1 p-8 flex flex-col">
                                {isPreview ? (
                                    <div className="flex-1 bg-white border border-gray-100 rounded-xl p-12 overflow-y-auto max-h-[600px] shadow-inner relative animate-in fade-in duration-500">
                                        <div className="flex justify-between items-start mb-16 px-4">
                                            <img src={logoUrl} alt="Logo" className="h-10 object-contain" />
                                            <div className="text-right">
                                                <p className="text-base font-black text-gray-900 tracking-tight uppercase leading-none">Employment Offer</p>
                                                <p className="text-[9px] font-bold text-gray-400 mt-2 uppercase tracking-[0.2em]">Authentic Documentation</p>
                                            </div>
                                        </div>

                                        <div
                                            className="markdown-content text-sm leading-relaxed text-gray-700 font-serif px-4"
                                            dangerouslySetInnerHTML={{ __html: renderMarkdown(offerContent) }}
                                        />

                                        <div className="mt-20 flex justify-between items-end border-t border-gray-100 pt-10 px-4">
                                            <div className="flex flex-col gap-6">
                                                <div className="w-24 h-[1px] bg-gray-300"></div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Director - Human Resources</p>
                                            </div>
                                            <div className="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">Timely Health PVT LTD</div>
                                        </div>
                                    </div>

                                ) : (
                                    <textarea
                                        className="flex-1 w-full p-8 border border-gray-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-300 transition-all font-mono text-[11px] leading-relaxed resize-none bg-gray-50/50 text-gray-600 shadow-inner"
                                        value={offerContent}
                                        onChange={(e) => setOfferContent(e.target.value)}
                                        placeholder="Draft the official offer content here..."
                                    />
                                )}

                                <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-gray-50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-100">
                                            <FaRocket size={16} className="text-white animate-pulse" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-800 uppercase tracking-widest">Validated Template</p>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Ready for secure dispatch</p>
                                        </div>
                                    </div>

                                    <button
                                        className={`w-full md:w-auto px-10 py-4 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-100 disabled:opacity-50 disabled:pointer-events-none`}
                                        disabled={loading}
                                        onClick={handleSendOffer}
                                    >
                                        {loading ? "Transmitting..." : <><FaPaperPlane /> Dispatch {documentType}</>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SendOffer;
