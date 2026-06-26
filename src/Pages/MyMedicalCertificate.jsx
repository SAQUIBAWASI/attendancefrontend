import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEye, FaFileMedical } from "react-icons/fa";
import { API_BASE_URL, API_DOMAIN } from "../config";
import "./EmployeeDashboard.css";
import "./EmployeePageShell.css";

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
    <div className="w-full">
      <div className="emp-dash__card">
        <div className="emp-dash__card-header">
          <div>
            <h3 className="emp-dash__card-title">Medical Certificates</h3>
            <p className="emp-dash__card-desc">Your submitted certificates and validity status.</p>
          </div>
          <div className="emp-page__pill emp-page__pill--muted">
            <FaFileMedical />
            {certificates.length} record{certificates.length !== 1 ? "s" : ""}
          </div>
        </div>

        {loading ? (
          <div className="emp-dash__loading">
            <div className="emp-dash__spinner" />
            <p className="emp-dash__loading-text">Loading medical certificates...</p>
          </div>
        ) : certificates.length > 0 ? (
          <>
          <div className="emp-dash__table-wrap">
            <table className="emp-dash__table">
              <thead>
                <tr>
                  <th>Registration Date</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {certificates.map((cert) => {
                  const isExpired = new Date(cert.expiryDate) < new Date();
                  return (
                    <tr key={cert._id}>
                      <td>{new Date(cert.registrationDate).toLocaleDateString()}</td>
                      <td>{new Date(cert.expiryDate).toLocaleDateString()}</td>
                      <td>
                        <span
                          className={`emp-dash__table-status ${
                            isExpired ? "emp-dash__table-status--other" : "emp-dash__table-status--present"
                          }`}
                        >
                          {isExpired ? "Expired" : "Active"}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <a
                          href={`${API_DOMAIN}${cert.documentUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="emp-page__primary-btn"
                          style={{ padding: "0.5rem 0.85rem" }}
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

          <div className="emp-dash__mobile-list">
            {certificates.map((cert) => {
              const isExpired = new Date(cert.expiryDate) < new Date();
              return (
                <div key={cert._id} className="emp-dash__mobile-item">
                  <div className="emp-dash__mobile-item-top">
                    <div className="emp-dash__mobile-date" style={{ fontWeight: 700 }}>Medical Certificate</div>
                    <span
                      className={`emp-dash__table-status ${
                        isExpired ? "emp-dash__table-status--other" : "emp-dash__table-status--present"
                      }`}
                    >
                      {isExpired ? "Expired" : "Active"}
                    </span>
                  </div>
                  <div className="emp-dash__mobile-grid">
                    <div className="emp-dash__mobile-field">
                      <span>Registration Date</span>
                      <span>{new Date(cert.registrationDate).toLocaleDateString()}</span>
                    </div>
                    <div className="emp-dash__mobile-field">
                      <span>Expiry Date</span>
                      <span>{new Date(cert.expiryDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.5rem" }}>
                    <a
                      href={`${API_DOMAIN}${cert.documentUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="emp-page__primary-btn"
                      style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                    >
                      <FaEye /> View Certificate
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
          </>
        ) : (
          <div className="emp-page__empty">
            <div className="emp-page__empty-icon">
              <FaFileMedical />
            </div>
            <h3>No medical certificates found</h3>
            <p>When you upload certificates, they will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyMedicalCertificate;
