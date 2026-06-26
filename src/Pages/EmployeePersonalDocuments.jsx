import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import {
    FaAddressCard, FaLock, FaUserShield, FaUserFriends,
    FaSearch, FaUniversity, FaPhoneAlt
} from "react-icons/fa";
import "./EmployeeDashboard.css";
import "./EmployeePageShell.css";

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
        return (
            <div className="emp-dash__loading">
                <div className="emp-dash__spinner" />
                <p className="emp-dash__loading-text">Loading documents...</p>
            </div>
        );
    }

    if (errorMsg) {
        return (
            <div className="emp-page__empty">
                <div className="emp-page__empty-icon">
                    <FaSearch size={18} />
                </div>
                <h3>Unable to load documents</h3>
                <p>{errorMsg}</p>
                <button onClick={fetchDashboardData} className="emp-page__primary-btn" style={{ marginTop: "0.75rem" }}>
                    Retry
                </button>
            </div>
        );
    }

    if (noCandidate) {
        return (
            <div className="emp-page__empty">
                <div className="emp-page__empty-icon">
                    <FaUserFriends size={18} />
                </div>
                <h3>No candidate profile linked</h3>
                <p>
                    Your employee email does not match any candidate profile. Please ensure you have a candidate account registered with the same email address.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full">

                {/* Filters Box - Synced with UserActivity/EmployeeLetters style */}
                <div className="emp-dash__card" style={{ marginBottom: "1rem" }}>
                    <div className="emp-dash__card-header">
                        <div>
                            <h3 className="emp-dash__card-title">Personal Documents</h3>
                            <p className="emp-dash__card-desc">View and access your uploaded identity and education documents.</p>
                        </div>
                        <div className="emp-page__pill emp-page__pill--muted">
                            <FaAddressCard />
                            {filteredDocs.length} item{filteredDocs.length !== 1 ? "s" : ""}
                        </div>
                    </div>

                    <div className="emp-dash__card-body" style={{ paddingTop: "1rem" }}>
                        <div className="emp-page__filters">

                        {/* Search */}
                        <div className="emp-page__search-wrap">
                            <FaSearch className="emp-page__search-icon" />
                            <input
                                type="text"
                                placeholder="Search by name or description..."
                                value={localSearch}
                                onChange={(e) => setLocalSearch(e.target.value)}
                                className="emp-page__search"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="relative min-w-[150px]">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="emp-page__select"
                            >
                                <option value="">All Statuses</option>
                                <option value="Filed">Asset Filed</option>
                                <option value="Pending">Pending</option>
                            </select>
                        </div>

                        {/* Reset Button */}
                        {(localSearch || statusFilter) && (
                            <button
                                onClick={resetFilters}
                                className="emp-page__secondary-btn"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                    </div>
                </div>

                {/* Documents Table */}
                <div className="emp-dash__card" style={{ marginBottom: "1.25rem" }}>
                    <div className="emp-dash__table-wrap">
                        <table className="emp-dash__table">
                            <thead>
                                <tr>
                                    <th>Document</th>
                                    <th>Classification</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: "right" }}>Access</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDocs.length > 0 ? filteredDocs.map((doc) => {
                                    const filed = !!docs[doc.id]?.filePath;
                                    return (
                                        <tr key={doc.id}>
                                            <td>
                                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                                    <div className={`emp-page__badge ${filed ? "emp-page__badge--success" : "emp-page__badge--warning"}`}>
                                                        <doc.icon size={14} />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 700 }}>{doc.label}</div>
                                                        <div style={{ fontSize: "0.75rem", color: "#98a2b3" }}>ID: {doc.id.toUpperCase()}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{doc.desc}</td>
                                            <td>
                                                <span className={`emp-dash__table-status ${filed ? "emp-dash__table-status--present" : "emp-dash__table-status--other"}`}>
                                                    {filed ? "Filed" : "Pending"}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: "right" }}>
                                                {filed ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => window.open(formatDocumentUrl(docs[doc.id].filePath), "_blank")}
                                                        className="emp-page__primary-btn"
                                                        style={{ padding: "0.5rem 0.85rem" }}
                                                    >
                                                        View
                                                    </button>
                                                ) : (
                                                    <span className="emp-page__badge emp-page__badge--primary">N/A</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="4">
                                            <div className="emp-page__empty" style={{ padding: "2rem 1rem" }}>
                                                <div className="emp-page__empty-icon">
                                                    <FaSearch size={18} />
                                                </div>
                                                <h3>No matching records</h3>
                                                <p>Try changing the search or status filter.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="emp-dash__mobile-list">
                        {filteredDocs.length > 0 ? filteredDocs.map((doc) => {
                            const filed = !!docs[doc.id]?.filePath;
                            return (
                                <div key={doc.id} className="emp-dash__mobile-item">
                                    <div className="emp-dash__mobile-item-top">
                                        <div className="emp-dash__mobile-date" style={{ fontWeight: 700 }}>{doc.label}</div>
                                        <span className={`emp-dash__table-status ${filed ? "emp-dash__table-status--present" : "emp-dash__table-status--other"}`}>
                                            {filed ? "Filed" : "Pending"}
                                        </span>
                                    </div>
                                    <div className="emp-dash__mobile-grid">
                                        <div className="emp-dash__mobile-field">
                                            <span>Classification</span>
                                            <span>{doc.desc}</span>
                                        </div>
                                        <div className="emp-dash__mobile-field">
                                            <span>Doc Code</span>
                                            <span>{doc.id.toUpperCase()}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.5rem" }}>
                                        {filed ? (
                                            <button
                                                type="button"
                                                onClick={() => window.open(formatDocumentUrl(docs[doc.id].filePath), "_blank")}
                                                className="emp-page__primary-btn"
                                                style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem" }}
                                            >
                                                View Document
                                            </button>
                                        ) : (
                                            <span className="emp-page__badge emp-page__badge--primary">Not Available</span>
                                        )}
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="emp-page__empty" style={{ padding: "2rem 1rem" }}>
                                <h3>No matching records</h3>
                                <p>Try changing the search or status filter.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Info Cards Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Banking Details Card - Aligned with Apply for Leave Modal */}
                    <div className="emp-dash__card">
                        <div className="emp-dash__card-header">
                            <h3 className="emp-dash__card-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <span className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FaUniversity size={18} /></span>
                                Banking Vault
                            </h3>
                            <button className="text-[10px] font-bold text-blue-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 uppercase">Verified</button>
                        </div>

                        <div className="emp-dash__card-body">
                            <div>
                                <label className="block mb-1 text-xs font-medium text-gray-700">Institution Name</label>
                                <div className="w-full p-2.5 text-sm font-semibold text-gray-700 border border-gray-200 rounded-lg bg-white/50">
                                    {docs.bankDetails?.bankName || "Pending Verification"}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1 text-xs font-medium text-gray-700">Account Number</label>
                                    <div className="w-full p-2.5 text-sm font-mono font-bold text-gray-700 border border-gray-200 rounded-lg bg-white/50 tracking-wider">
                                        {docs.bankDetails?.accountNumber || "•••• •••• ••••"}
                                    </div>
                                </div>
                                <div>
                                    <label className="block mb-1 text-xs font-medium text-gray-700">IFSC Code</label>
                                    <div className="w-full p-2.5 text-sm font-mono font-bold text-gray-700 border border-gray-200 rounded-lg bg-white/50">
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
                    <div className="emp-dash__card">
                        <div className="emp-dash__card-header">
                            <h3 className="emp-dash__card-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <span className="p-2 bg-rose-50 text-rose-600 rounded-lg"><FaPhoneAlt size={16} /></span>
                                Emergency Hub
                            </h3>
                            <button className="text-[10px] font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100 uppercase underline decoration-rose-300">Priority I</button>
                        </div>

                        <div className="emp-dash__card-body">
                            <div>
                                <label className="block mb-1 text-xs font-medium text-gray-700">Contact Identity (Name)</label>
                                <div className="w-full p-2.5 text-sm font-bold text-gray-700 border border-gray-200 rounded-lg bg-white/50 uppercase">
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
                                <p className="text-[10px] text-gray-500 font-semibold italic p-3 bg-white rounded-md border border-gray-200">
                                    * Protocol active for immediate medical and site contingency reporting.
                                </p>
                            </div> */}
                        </div>
                    </div>

                </div>
                </div>

            
    );
};

export default EmployeePersonalDocuments;
