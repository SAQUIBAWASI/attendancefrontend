import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEye, FaFileMedical } from "react-icons/fa";
import { API_BASE_URL, API_DOMAIN } from "../config";

const MyMedicalCertificate = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);

  // Get employeeId from localStorage
  const employeeDataStr = localStorage.getItem("employeeData");
  const employeeData = employeeDataStr ? JSON.parse(employeeDataStr) : null;
  const employeeId = employeeData?.employeeId;

  useEffect(() => {
    if (employeeId) {
      fetchMyCertificates();
    }
  }, [employeeId]);

  const fetchMyCertificates = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/medical-certificates/employee/${employeeId}`);
      if (res.data.success) {
        setCertificates(res.data.data);
      }
    } catch (err) {
      console.error("Fetch my certificates error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <main className="flex-1 p-0 sm:p-0 lg:p-8">
        <div className="max-w-9xl p-0 mx-auto bg-white rounded-lg shadow-md">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-20 text-indigo-600">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="font-bold text-xs uppercase tracking-widest">Loading Records...</p>
            </div>
          ) : certificates.length > 0 ? (
            <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
              <table className="min-w-full">
                <thead className="text-sm text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
                  <tr>
                    <th className="px-4 py-2 border">Reg. Date</th>
                    <th className="px-4 py-2 border">Exp. Date</th>
                    <th className="px-4 py-2 border">Status</th>
                    <th className="px-4 py-2 text-center border">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {certificates.map((cert) => {
                    const isExpired = new Date(cert.expiryDate) < new Date();
                    return (
                      <tr key={cert._id} className="border-b hover:bg-gray-50">
                        <td className="p-2 border">{new Date(cert.registrationDate).toLocaleDateString()}</td>
                        <td className="p-2 border">{new Date(cert.expiryDate).toLocaleDateString()}</td>
                        <td className="p-2 border">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              isExpired
                                ? "bg-red-200 text-red-800"
                                : "bg-green-200 text-green-800"
                            }`}
                          >
                            {isExpired ? "Expired" : "Active"}
                          </span>
                        </td>
                        <td className="p-2 text-center border">
                          <a
                            href={`${API_DOMAIN}${cert.documentUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white px-4 py-1.5 rounded-lg font-bold text-xs transition-all shadow-sm border border-indigo-100"
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
            <div className="p-20 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                <FaFileMedical size={32} />
              </div>
              <p className="text-gray-500 italic">No medical certificates found.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyMedicalCertificate;
