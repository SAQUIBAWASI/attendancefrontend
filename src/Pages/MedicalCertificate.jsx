import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaUpload, FaEye, FaCalendarAlt, FaFileMedical } from "react-icons/fa";
import { API_BASE_URL, API_DOMAIN } from "../config";
import EmployeeLayout from "../Layout/EmployeeLayout";

const MedicalCertificate = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    registrationDate: "",
    expiryDate: "",
    document: null,
  });

  const userRole = localStorage.getItem("userRole");
  const employeeData = JSON.parse(localStorage.getItem("employeeData"));
  
  // Resolve ID and Name based on role
  let userId = "";
  let userName = "";
  let isCandidate = userRole === "candidate";

  if (isCandidate) {
    userId = localStorage.getItem("candidateId");
    userName = localStorage.getItem("candidateName");
  } else {
    userId = employeeData?.employeeId;
    userName = employeeData?.name;
  }

  // ✅ Debug Logging
  console.log("Health Certificate Debug - Role:", userRole);
  console.log("Health Certificate Debug - UserID:", userId);

  useEffect(() => {
    if (userId && userId !== "undefined" && userId !== "null") {
      fetchCertificates();
    } else {
      console.warn("Medical Certificate: No valid UserID found in localStorage.");
      setError("Unable to identify current user. Please log out and log in again.");
    }
  }, [userId]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      // Ensure we don't call with invalid string
      if (userId === "undefined" || userId === "null") return;
      
      const res = await axios.get(`${API_BASE_URL}/medical-certificates/employee/${userId}`);
      if (res.data.success) {
        setCertificates(res.data.data);
      }
    } catch (err) {
      console.error("Fetch certificates error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, document: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId || userId === "undefined" || userId === "null") {
      alert("Session expired or invalid user. Please login again.");
      return;
    }
    if (!formData.registrationDate || !formData.expiryDate || !formData.document) {
      alert("Please fill all fields and select a document.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      const data = new FormData();
      if (isCandidate) {
        data.append("candidateId", userId);
        data.append("candidateName", userName);
      } else {
        data.append("employeeId", userId);
        data.append("employeeName", userName);
      }
      data.append("registrationDate", formData.registrationDate);
      data.append("expiryDate", formData.expiryDate);
      data.append("document", formData.document);

      const res = await axios.post(`${API_BASE_URL}/medical-certificates/upload`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        setSuccess("Medical certificate uploaded successfully!");
        setFormData({ registrationDate: "", expiryDate: "", document: null });
        fetchCertificates();
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.response?.data?.message || "Failed to upload certificate.");
    } finally {
      setUploading(false);
    }
  };

  return (
    
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                <FaFileMedical size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Medical Certificate</h1>
                <p className="text-sm text-gray-500">Upload and manage your medical records</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FaCalendarAlt className="text-blue-500" /> Registration Date
                </label>
                <input
                  type="date"
                  name="registrationDate"
                  value={formData.registrationDate}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FaCalendarAlt className="text-red-500" /> Expiry Date
                </label>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-semibold text-gray-700">Upload Certificate (PDF/Image)</label>
                <div className="relative group">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="doc-upload"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <label
                    htmlFor="doc-upload"
                    className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-8 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer"
                  >
                    <FaUpload className="text-3xl text-gray-400 group-hover:text-blue-500 mb-2" />
                    <span className="text-sm text-gray-600">
                      {formData.document ? formData.document.name : "Click to select file"}
                    </span>
                  </label>
                </div>
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={uploading}
                  className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg ${
                    uploading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700 shadow-blue-100"
                  }`}
                >
                  {uploading ? "Uploading..." : "Submit Certificate"}
                </button>
              </div>
            </form>

            {success && <p className="mt-4 p-3 bg-green-50 text-green-600 rounded-lg text-center text-sm font-medium">{success}</p>}
            {error && <p className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-center text-sm font-medium">{error}</p>}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Uploaded Certificates</h2>
            {loading ? (
              <p className="text-center text-gray-500">Loading records...</p>
            ) : certificates.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Reg. Date</th>
                      <th className="p-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Exp. Date</th>
                      <th className="p-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                      <th className="p-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {certificates.map((cert) => {
                      const idExpired = new Date(cert.expiryDate) < new Date();
                      return (
                        <tr key={cert._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="p-4 text-sm text-gray-700">{new Date(cert.registrationDate).toLocaleDateString()}</td>
                          <td className="p-4 text-sm text-gray-700">{new Date(cert.expiryDate).toLocaleDateString()}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${idExpired ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
                              {idExpired ? "Expired" : "Active"}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <a
                              href={`${API_DOMAIN}${cert.documentUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold text-sm"
                            >
                              <FaEye /> View
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-400 italic">No certificates uploaded yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
  
  );
};

export default MedicalCertificate;