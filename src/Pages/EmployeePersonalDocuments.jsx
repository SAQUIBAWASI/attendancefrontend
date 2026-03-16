import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import {
    FaAddressCard, FaLock, FaUserShield, FaUserFriends,
    FaSearch, FaUniversity, FaPhoneAlt
} from "react-icons/fa";

const formatDocumentUrl = (filePath) => {
    if (!filePath) return "";
    return `${API_BASE_URL}/${filePath.replace(/\\/g, "/")}`;
};

const EmployeePersonalDocuments = () => {
    const [personalDocs, setPersonalDocs] = useState({});
    const [statusFilter, setStatusFilter] = useState("");
    const [localSearch, setLocalSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const [noCandidate, setNoCandidate] = useState(false);

    // Update States
    const [bankForm, setBankForm] = useState({ bankName: "", accountNumber: "", ifscCode: "" });
    const [emergencyForm, setEmergencyForm] = useState({ name: "", phone: "", relationship: "" });

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setErrorMsg("");
            setNoCandidate(false);
            const employeeId = localStorage.getItem("employeeId");
            if (!employeeId) {
                setErrorMsg("Employee ID not found. Please log in again.");
                return;
            }

            const response = await axios.get(`${API_BASE_URL}/employees/candidate-documents/${employeeId}`);
            if (response.data && response.data.data) {
                if (response.data.noCandidate) {
                    setNoCandidate(true);
                    setPersonalDocs({ documents: {} });
                } else {
                    // response.data.data is the CandidateDocuments mongoose document.
                    // The actual nested fields (aadharCard, bankDetails, etc.) live inside its .documents sub-object.
                    setPersonalDocs({ documents: response.data.data.documents || {} });
                }
            } else {
                setPersonalDocs({ documents: {} });
            }
        } catch (error) {
            console.error("Error fetching employee docs:", error);
            if (error.response?.data?.message) {
                setErrorMsg(error.response.data.message);
            } else {
                setErrorMsg("Failed to load documents. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const docs = personalDocs?.documents || {};

    // Initialize forms when personalDocs data is available
    useEffect(() => {
        if (docs.bankDetails) {
            setBankForm({
                bankName: docs.bankDetails.bankName || "",
                accountNumber: docs.bankDetails.accountNumber || "",
                ifscCode: docs.bankDetails.ifscCode || ""
            });
        }
        if (docs.emergencyContact1) {
            setEmergencyForm({
                name: docs.emergencyContact1.name || "",
                phone: docs.emergencyContact1.phone || "",
                relationship: docs.emergencyContact1.relationship || ""
            });
        }
    }, [personalDocs]);

    const docSections = [
        { id: "aadharCard", label: "Aadhar / National ID", icon: FaAddressCard, desc: "Government-issued identity proof" },
        { id: "panCard", label: "PAN Card", icon: FaLock, desc: "Tax identification document" },
        { id: "tenthCertificate", label: "10th Certificate", icon: FaUserShield, desc: "Secondary school certificate" },
        { id: "twelfthCertificate", label: "12th Certificate", icon: FaUserShield, desc: "Higher secondary certificate" },
        { id: "graduationCertificate", label: "Graduation Degree", icon: FaUserShield, desc: "University degree certificate" },
        { id: "passportPhoto", label: "Passport Photo", icon: FaUserFriends, desc: "Recent passport photograph" },
    ];

    const filteredDocs = docSections.filter(doc => {
        const filed = !!docs[doc.id]?.filePath;
        const matchesStatus = statusFilter === "Filed" ? filed : statusFilter === "Pending" ? !filed : true;
        const matchesSearch = doc.label.toLowerCase().includes(localSearch.toLowerCase()) ||
            doc.desc.toLowerCase().includes(localSearch.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const resetFilters = () => { setStatusFilter(""); setLocalSearch(""); };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen text-gray-500">Loading documents...</div>;
    }

    if (errorMsg) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-3">
                <div className="text-red-500 text-lg font-semibold">⚠️ {errorMsg}</div>
                <button onClick={fetchDashboardData} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">Retry</button>
            </div>
        );
    }

    if (noCandidate) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-3 p-8 text-center">
                <div className="text-5xl mb-2">🔗</div>
                <h2 className="text-xl font-bold text-gray-700">No Candidate Profile Linked</h2>
                <p className="text-sm text-gray-500 max-w-md">
                    Your employee account email does not match any candidate profile in the system.
                    To display your personal documents here, please ensure you have a candidate account registered with the same email address.
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-2 bg-gray-100 font-sans">
            <div className="mx-auto max-w-9xl">

                {/* Filters Box - Synced with UserActivity/EmployeeLetters style */}
                <div className="p-2 mb-3 bg-white rounded-lg shadow-md border border-gray-100">
                    <div className="flex flex-wrap items-center gap-2">

                        {/* Search */}
                        <div className="relative flex-1 min-w-[200px]">
                            <FaSearch className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2 text-sm" />
                            <input
                                type="text"
                                placeholder="Search by name or description..."
                                value={localSearch}
                                onChange={(e) => setLocalSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 shadow-sm transition-all"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="relative min-w-[150px]">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full h-8 px-3 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 cursor-pointer transition-all appearance-none font-bold text-gray-700"
                            >
                                <option value="">All Statuses</option>
                                <option value="Filed">Asset Filed</option>
                                <option value="Pending">Pending</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                            </div>
                        </div>

                        {/* Reset Button */}
                        {(localSearch || statusFilter) && (
                            <button
                                onClick={resetFilters}
                                className="h-8 px-3 text-xs font-medium text-gray-600 transition bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 flex items-center gap-1"
                            >
                                <FaSearch className="rotate-90 text-[10px]" /> Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Documents Table */}
                <div className="mb-6 overflow-hidden bg-white rounded-lg shadow-lg border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="text-sm text-center text-white bg-blue-600">
                                <tr className="uppercase tracking-wider text-[11px] font-bold">
                                    <th className="py-2.5 px-6">DOCUMENT IDENTITY</th>
                                    <th className="py-2.5 px-6">CLASSIFICATION</th>
                                    <th className="py-2.5 px-6">VAULT STATUS</th>
                                    <th className="py-2.5 px-6">ACCESS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredDocs.length > 0 ? filteredDocs.map((doc) => {
                                    const filed = !!docs[doc.id]?.filePath;
                                    return (
                                        <tr key={doc.id} className="transition-colors hover:bg-gray-50">
                                            <td className="px-6 py-2">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-1.5 rounded ${filed ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"} border border-gray-100`}>
                                                        <doc.icon size={14} />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-[11px] text-gray-800 uppercase tracking-tight">{doc.label}</div>
                                                        <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-none">ID: {doc.id.toUpperCase()}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-2 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                                                {doc.desc}
                                            </td>
                                            <td className="px-6 py-2 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-widest shadow-sm transition-all ${filed ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                                                        }`}>
                                                        {filed ? "Verified" : "Pending"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-2">
                                                <div className="flex items-center justify-center">
                                                    {filed ? (
                                                        <button
                                                            onClick={() => window.open(formatDocumentUrl(docs[doc.id].filePath), "_blank")}
                                                            className="px-3 py-1 bg-gray-900 text-white rounded text-[9px] font-bold uppercase tracking-wider hover:bg-blue-600 transition-all shadow-sm"
                                                        >
                                                            VIEW
                                                        </button>
                                                    ) : (
                                                        <span className="text-[9px] font-bold text-gray-300 uppercase tracking-wider bg-gray-50 px-2 py-1 rounded border border-gray-100">N/A</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="4" className="py-10 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-200 border-2 border-dashed border-gray-100">
                                                    <FaSearch size={18} />
                                                </div>
                                                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No matching records</h3>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Info Cards Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">

                    {/* Banking Details Card - Aligned with Apply for Leave Modal */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <span className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FaUniversity size={18} /></span>
                                Banking Vault
                            </h3>
                            <button className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 uppercase">Verified</button>
                        </div>

                        <div className="p-4 sm:p-6 space-y-4">
                            <div>
                                <label className="block mb-1 text-xs font-medium text-gray-700">Institution Name</label>
                                <div className="w-full p-2.5 text-sm font-semibold text-gray-800 border border-gray-200 rounded-lg bg-gray-50/50">
                                    {docs.bankDetails?.bankName || "Pending Verification"}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1 text-xs font-medium text-gray-700">Account Number</label>
                                    <div className="w-full p-2.5 text-sm font-mono font-bold text-gray-800 border border-gray-200 rounded-lg bg-gray-50/50 tracking-wider">
                                        {docs.bankDetails?.accountNumber || "•••• •••• ••••"}
                                    </div>
                                </div>
                                <div>
                                    <label className="block mb-1 text-xs font-medium text-gray-700">IFSC Code</label>
                                    <div className="w-full p-2.5 text-sm font-mono font-bold text-gray-800 border border-gray-200 rounded-lg bg-gray-50/50">
                                        {docs.bankDetails?.ifscCode || "N/A"}
                                    </div>
                                </div>
                            </div>

                            {/* <div className="flex gap-3 pt-2">
                                <div className="flex-1 py-2 text-center text-[11px] font-bold text-blue-600 bg-blue-50 rounded-lg border border-blue-100 shadow-sm flex items-center justify-center gap-2">
                                    <FaUserShield size={14} /> SECURED VAULT ACCESS
                                </div>
                            </div> */}
                        </div>
                    </div>

                    {/* Emergency Contact Card - Aligned with Apply for Leave Modal */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <span className="p-2 bg-rose-50 text-rose-600 rounded-lg"><FaPhoneAlt size={16} /></span>
                                Emergency Hub
                            </h3>
                            <button className="text-[10px] font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100 uppercase underline decoration-rose-300">Priority I</button>
                        </div>

                        <div className="p-4 sm:p-6 space-y-4">
                            <div>
                                <label className="block mb-1 text-xs font-medium text-gray-700">Contact Identity (Name)</label>
                                <div className="w-full p-2.5 text-sm font-bold text-gray-800 border border-gray-200 rounded-lg bg-gray-50/50 uppercase">
                                    {docs.emergencyContact1?.name || "Not Established"}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1 text-xs font-medium text-gray-700">Direct Vector (Phone)</label>
                                    <div className="w-full p-2.5 text-sm font-mono font-bold text-rose-900 border border-rose-200 rounded-lg bg-rose-50/30">
                                        {docs.emergencyContact1?.phone || "000.000.0000"}
                                    </div>
                                </div>
                                <div>
                                    <label className="block mb-1 text-xs font-medium text-gray-700">Relationship Bound</label>
                                    <div className="w-full p-2.5 text-sm font-bold text-blue-900 border border-blue-200 rounded-lg bg-blue-50/30 uppercase">
                                        {docs.emergencyContact1?.relationship || "N/A"}
                                    </div>
                                </div>
                            </div>

                            {/* <div className="pt-2 text-center">
                                <p className="text-[10px] text-gray-400 font-semibold italic p-3 bg-gray-50 rounded-md border border-gray-100">
                                    * Protocol active for immediate medical and site contingency reporting.
                                </p>
                            </div> */}
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default EmployeePersonalDocuments;
