import React, { useState, useRef, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";
import {
  FaAddressCard, FaLock, FaUserShield, FaUserFriends,
  FaUpload, FaCheckCircle, FaTimesCircle, FaEye,
  FaSearch, FaTimes, FaSync, FaUniversity, FaPhoneAlt, FaShieldAlt,
  FaEdit, FaSave, FaBuilding, FaFilter
} from "react-icons/fa";

const CandidatePersonalDocuments = () => {
  const { personalDocs, fetchDashboardData, formatDocumentUrl } = useOutletContext();
  const [uploading, setUploading] = useState({});
  const [statusFilter, setStatusFilter] = useState("");
  const [localSearch, setLocalSearch] = useState("");

  // Update States
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [bankForm, setBankForm] = useState({ bankName: "", accountNumber: "", ifscCode: "" });
  const [emergencyForm, setEmergencyForm] = useState({ name: "", phone: "", relationship: "" });

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

  const handleFileUpload = async (fieldName, file) => {
    if (!file) return;
    setUploading(prev => ({ ...prev, [fieldName]: true }));
    try {
      const formData = new FormData();
      formData.append("document", file);
      formData.append("documentType", fieldName);
      const token = localStorage.getItem("candidateToken");
      await axios.post(`${API_BASE_URL}/candidate/upload-documents`, formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` }
      });
      fetchDashboardData();
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload document. Please try again.");
    } finally {
      setUploading(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  const handleSaveBankDetails = async (e) => {
    e.preventDefault();
    if (!bankForm.bankName || !bankForm.accountNumber || !bankForm.ifscCode) return alert("All fields are required");
    setIsSaving(true);
    try {
      const token = localStorage.getItem("candidateToken");
      await axios.post(`${API_BASE_URL}/candidate/save-bank-details`,
        { bankDetails: bankForm },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDashboardData();
      setIsBankModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save bank details");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEmergencyContact = async (e) => {
    e.preventDefault();
    if (!emergencyForm.name || !emergencyForm.phone || !emergencyForm.relationship) return alert("All fields are required");
    setIsSaving(true);
    try {
      const token = localStorage.getItem("candidateToken");
      await axios.post(`${API_BASE_URL}/candidate/save-emergency-contact`,
        { contactNumber: 1, contact: emergencyForm },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDashboardData();
      setIsEmergencyModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save contact");
    } finally {
      setIsSaving(false);
    }
  };

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

  return (
    <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100 font-sans">
      <div className="mx-auto max-w-9xl">

        {/* Header Section (Not in UserActivity but required for context) */}
        <div className="mb-4 flex items-center justify-between px-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Personal Documents</h1>
            <p className="text-sm text-gray-600">Track and manage your identification assets</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Vault Secured
            </span>
          </div>
        </div>

        {/* Filters Box - Exact Match to UserActivity */}
        <div className="p-3 mb-3 bg-white rounded-lg shadow-md">
          <div className="flex flex-wrap items-center gap-2">

            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <FaSearch className="absolute text-sm text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
              <input
                type="text"
                placeholder="Search documents..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 px-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 min-w-[120px]"
            >
              <option value="">All Status</option>
              <option value="Filed">Filed</option>
              <option value="Pending">Pending</option>
            </select>

            {/* Reset Button */}
            {(localSearch || statusFilter) && (
              <button
                onClick={resetFilters}
                className="h-8 px-3 text-xs font-medium text-gray-600 transition bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Activities (Documents) Table - Exact Match to UserActivity */}
        <div className="mb-6 overflow-hidden bg-white rounded-lg shadow-lg">
          <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
            <table className="min-w-full">
              <thead className="text-sm text-center text-white bg-gradient-to-r from-green-500 to-blue-600">
                <tr>
                  <th className="py-2 px-4">DOCUMENT NAME</th>
                  <th className="py-2 px-4">DESCRIPTION</th>
                  <th className="py-2 px-4">STATUS</th>
                  <th className="py-2 px-4">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDocs.length > 0 ? filteredDocs.map((doc) => {
                  const filed = !!docs[doc.id]?.filePath;
                  const isUploading = !!uploading[doc.id];
                  return (
                    <tr key={doc.id} className="transition-colors hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm font-medium text-center text-gray-900 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <doc.icon className="text-blue-500" />
                          {doc.label}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-xs text-center text-gray-600 whitespace-nowrap">
                        {doc.desc}
                      </td>
                      <td className="px-4 py-2 text-center whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${filed ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}>
                          {filed ? "Asset Filed" : "Pending"}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <label className="cursor-pointer">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-md border transition-all ${isUploading ? "bg-gray-50 text-gray-400 border-gray-200" : "bg-white border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white"
                              }`}>
                              {isUploading ? "..." : filed ? "UPDATE" : "UPLOAD"}
                            </span>
                            <input type="file" className="hidden" onChange={e => handleFileUpload(doc.id, e.target.files[0])} disabled={isUploading} />
                          </label>
                          {filed && (
                            <button
                              onClick={() => window.open(formatDocumentUrl(docs[doc.id].filePath), "_blank")}
                              className="px-3 py-1 text-xs font-semibold bg-gray-800 text-white rounded-md hover:bg-blue-600 transition-colors"
                            >
                              VIEW
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="4" className="px-2 py-10 text-center text-gray-500 text-sm">
                      No documents found matching your filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Cards Section - Styled like UserActivity Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-10">

          {/* Banking Details Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-2.5 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <FaUniversity />
                <span className="text-sm font-bold uppercase tracking-wider">Banking Details</span>
              </div>
              <button onClick={() => setIsBankModalOpen(true)} className="p-1 hover:bg-white/20 rounded transition-colors text-white">
                <FaEdit size={14} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {[
                { label: "Institution Name", value: docs.bankDetails?.bankName },
                { label: "Account Number", value: docs.bankDetails?.accountNumber },
                { label: "IFSC Code", value: docs.bankDetails?.ifscCode },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                  <span className="text-gray-500 font-medium">{item.label}</span>
                  <span className="text-gray-900 font-semibold">{item.value || "-"}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Contact Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-green-500 to-blue-600 px-4 py-2.5 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <FaPhoneAlt />
                <span className="text-sm font-bold uppercase tracking-wider">Emergency Contact</span>
              </div>
              <button onClick={() => setIsEmergencyModalOpen(true)} className="p-1 hover:bg-white/20 rounded transition-colors text-white">
                <FaEdit size={14} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {[
                { label: "Primary Name", value: docs.emergencyContact1?.name },
                { label: "Phone Number", value: docs.emergencyContact1?.phone },
                { label: "Relationship", value: docs.emergencyContact1?.relationship },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                  <span className="text-gray-500 font-medium">{item.label}</span>
                  <span className="text-gray-900 font-semibold">{item.value || "-"}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Update Modals - Simple & Clean to match the utilitarian theme */}
        {isBankModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-gray-200">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 flex justify-between items-center text-white">
                <h3 className="font-bold uppercase tracking-wider text-sm">Update Bank Details</h3>
                <button onClick={() => setIsBankModalOpen(false)}><FaTimes /></button>
              </div>
              <form onSubmit={handleSaveBankDetails} className="p-5 space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Bank Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 outline-none"
                      value={bankForm.bankName}
                      onChange={e => setBankForm({ ...bankForm, bankName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Account Number</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 outline-none"
                      value={bankForm.accountNumber}
                      onChange={e => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">IFSC Code</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 outline-none"
                      value={bankForm.ifscCode}
                      onChange={e => setBankForm({ ...bankForm, ifscCode: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setIsBankModalOpen(false)} className="flex-1 py-2 text-xs font-bold text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">CANCEL</button>
                  <button type="submit" disabled={isSaving} className="flex-1 py-2 text-xs font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
                    {isSaving ? "SAVING..." : "SAVE CHANGES"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isEmergencyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-gray-200">
              <div className="bg-gradient-to-r from-green-500 to-green-700 p-4 flex justify-between items-center text-white">
                <h3 className="font-bold uppercase tracking-wider text-sm">Update Emergency Contact</h3>
                <button onClick={() => setIsEmergencyModalOpen(false)}><FaTimes /></button>
              </div>
              <form onSubmit={handleSaveEmergencyContact} className="p-5 space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Contact Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 outline-none"
                      value={emergencyForm.name}
                      onChange={e => setEmergencyForm({ ...emergencyForm, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Phone Number</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 outline-none"
                      value={emergencyForm.phone}
                      onChange={e => setEmergencyForm({ ...emergencyForm, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Relationship</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 outline-none"
                      value={emergencyForm.relationship}
                      onChange={e => setEmergencyForm({ ...emergencyForm, relationship: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setIsEmergencyModalOpen(false)} className="flex-1 py-2 text-xs font-bold text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">CANCEL</button>
                  <button type="submit" disabled={isSaving} className="flex-1 py-2 text-xs font-bold text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors">
                    {isSaving ? "SAVING..." : "SAVE CONTACT"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CandidatePersonalDocuments;
