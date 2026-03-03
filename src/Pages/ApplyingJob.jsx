import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";

const API_BASE = API_BASE_URL;

/* ── Shared Input Style ─────────────────────────────────── */
const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: 10,
  border: "1.5px solid #e2e8f0",
  fontSize: 14,
  fontWeight: 500,
  color: "#0f172a",
  outline: "none",
  background: "#fff",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};

const labelStyle = {
  display: "block",
  fontSize: 12,
  fontWeight: 700,
  color: "#475569",
  marginBottom: 5,
  letterSpacing: "0.03em",
};

const SectionHeader = ({ icon, title, subtitle, color = "#6366f1" }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, paddingBottom: 14, borderBottom: "1px solid #f1f5f9" }}>
    <div style={{ width: 40, height: 40, borderRadius: 12, background: color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
    </div>
    <div>
      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 900, color: "#0f172a" }}>{title}</h3>
      {subtitle && <p style={{ margin: 0, fontSize: 11, color: "#94a3b8", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>{subtitle}</p>}
    </div>
  </div>
);

const Field = ({ label, children }) => (
  <div style={{ display: "flex", flexDirection: "column" }}>
    <label style={labelStyle}>{label}</label>
    {children}
  </div>
);

function ApplyingJob() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isCheckingExistence, setIsCheckingExistence] = useState(false);
  const [candidateExists, setCandidateExists] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", mobile: "", address: "",
    highestQualification: "", institution: "", department: "", percentage: "", passingYear: "",
    companyName: "", role: "", totalExperience: "", currentCompany: "", currentLocation: "",
    currentCTC: "", expectedCTC: "", noticePeriod: "", skills: "", dateOfJoining: "",
    resume: null, existingResume: ""
  });

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await axios.get(`${API_BASE}/jobs/view/${jobId}`);
        if (res.data.success) setJob(res.data.jobPost);
        else setError("Job post not found.");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load job details.");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();

    const token = localStorage.getItem("candidateToken");
    if (token) {
      setEmailChecked(true);
      setCandidateExists(true);
      setIsLoggedIn(true);
      axios.get(`${API_BASE}/candidate/profile`, { headers: { Authorization: `Bearer ${token}` } })
        .then(profileRes => {
          const d = profileRes.data;
          const [fname, ...lname] = (d.name || "").split(" ");
          setFormData(prev => ({
            ...prev,
            email: d.email || prev.email,
            firstName: fname || prev.firstName,
            lastName: lname.join(" ") || prev.lastName,
            mobile: d.phone || prev.mobile,
            address: d.address || prev.address,
            highestQualification: d.qualification || prev.highestQualification,
            institution: d.institution || prev.institution,
            department: d.department || prev.department,
            percentage: d.percentage || prev.percentage,
            passingYear: d.passingYear || prev.passingYear,
            currentCompany: d.currentCompany || prev.currentCompany,
            role: d.role || prev.role,
            totalExperience: d.experience || prev.totalExperience,
            currentCTC: d.currentCTC || prev.currentCTC,
            expectedCTC: d.expectedCTC || prev.expectedCTC,
            noticePeriod: d.noticePeriod || prev.noticePeriod,
            dateOfJoining: d.dateOfJoining || prev.dateOfJoining,
            currentLocation: d.currentLocation || prev.currentLocation,
            skills: d.skills || prev.skills,
            existingResume: d.resume || ""
          }));
        })
        .catch(() => { });
    }
  }, [jobId]);

  const handleEmailCheck = async () => {
    if (!formData.email) return;
    setIsCheckingExistence(true);
    setMessage({ type: "", text: "" });
    setIsLoggedIn(false);
    try {
      const res = await axios.post(`${API_BASE}/candidate/check-existence`, { email: formData.email });
      if (res.data.exists) {
        setCandidateExists(true);
        setEmailChecked(true);
        setMessage({ type: "info", text: "Profile found! Auto-filling your details..." });
        await handleLogin(formData.email);
      } else {
        setCandidateExists(false);
        setEmailChecked(true);
        setMessage({ type: "info", text: "New candidate! Fill in your details below to apply." });
      }
    } catch {
      setMessage({ type: "error", text: "Server unreachable. Please try again." });
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

  const handleLogin = async (emailToLogin) => {
    setSubmitting(true);
    try {
      const loginRes = await axios.post(`${API_BASE}/candidate/login`, { email: emailToLogin || formData.email });
      const token = loginRes.data.token;
      const profileRes = await axios.get(`${API_BASE}/candidate/profile`, { headers: { Authorization: `Bearer ${token}` } });
      const d = profileRes.data;
      const [fname, ...lname] = (d.name || "").split(" ");
      setFormData(prev => ({
        ...prev,
        firstName: fname, lastName: lname.join(" "),
        mobile: d.phone || prev.mobile,
        currentCompany: d.currentCompany || prev.currentCompany,
        currentCTC: d.currentCTC || prev.currentCTC,
        expectedCTC: d.expectedCTC || prev.expectedCTC,
        skills: d.skills || prev.skills,
        address: d.address || prev.address,
        highestQualification: d.qualification || d.highestQualification || prev.highestQualification,
        institution: d.institution || prev.institution,
        department: d.department || prev.department,
        percentage: d.percentage || prev.percentage,
        passingYear: d.passingYear || prev.passingYear,
        totalExperience: d.experience || prev.totalExperience,
        currentLocation: d.currentLocation || prev.currentLocation,
        noticePeriod: d.noticePeriod || prev.noticePeriod,
        dateOfJoining: d.dateOfJoining || prev.dateOfJoining,
        role: d.role || prev.role,
        existingResume: d.resume || ""
      }));
      localStorage.setItem("candidateToken", token);
      localStorage.setItem("candidateId", d._id);
      setIsLoggedIn(true);
      setMessage({ type: "success", text: "All details auto-filled from your profile! Review & apply." });
    } catch {
      setMessage({ type: "error", text: "Failed to load candidate profile." });
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

      if (!token && !candidateExists) {
        const regRes = await axios.post(`${API_BASE}/candidate/register`, {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email, phone: formData.mobile,
          skills: formData.skills, experience: formData.totalExperience,
          address: formData.address, currentCompany: formData.currentCompany,
          currentCTC: formData.currentCTC, expectedCTC: formData.expectedCTC,
          highestQualification: formData.highestQualification,
          institution: formData.institution, department: formData.department,
          currentLocation: formData.currentLocation, noticePeriod: formData.noticePeriod,
          dateOfJoining: formData.dateOfJoining, role: formData.role,
          percentage: formData.percentage, passingYear: formData.passingYear
        });
        token = regRes.data.token;
        const profileRes = await axios.get(`${API_BASE}/candidate/profile`, { headers: { Authorization: `Bearer ${token}` } });
        candidateId = profileRes.data._id;
        localStorage.setItem("candidateToken", token);
        localStorage.setItem("candidateId", candidateId);
      } else if (token && isLoggedIn) {
        try {
          await axios.put(`${API_BASE}/candidate/profile`, {
            name: `${formData.firstName} ${formData.lastName}`,
            phone: formData.mobile, skills: formData.skills,
            experience: formData.totalExperience, address: formData.address,
            currentCompany: formData.currentCompany, currentCTC: formData.currentCTC,
            expectedCTC: formData.expectedCTC, qualification: formData.highestQualification,
            institution: formData.institution, department: formData.department,
            currentLocation: formData.currentLocation, noticePeriod: formData.noticePeriod,
            dateOfJoining: formData.dateOfJoining, role: formData.role,
            percentage: formData.percentage, passingYear: formData.passingYear
          }, { headers: { Authorization: `Bearer ${token}` } });
        } catch { /* non-blocking */ }
      }

      const data = new FormData();
      data.append("jobId", job._id);
      data.append("candidateId", candidateId);
      Object.keys(formData).forEach(key => {
        if (key === "resume") { if (formData[key]) data.append("resume", formData[key]); }
        else if (key !== "password" && key !== "existingResume") data.append(key, formData[key]);
      });

      const res = await axios.post(`${API_BASE}/applications/submit`, data, { headers: { "Content-Type": "multipart/form-data" } });
      if (res.data.success) {
        setMessage({ type: "success", text: "Application submitted successfully! Redirecting..." });
        setTimeout(() => {
          if ((job.assessmentIds && job.assessmentIds.length > 0) || job.assessmentId) {
            const firstQuizId = job.assessmentIds?.[0]?._id || job.assessmentIds?.[0] || job.assessmentId?._id || job.assessmentId;
            navigate(`/assessment/${jobId}/${res.data.application._id}${firstQuizId ? "/" + (firstQuizId._id || firstQuizId) : ""}`);
          } else {
            navigate("/candidate-dashboard");
          }
        }, 2000);
      }
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to submit application. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Loading ─── */
  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#0f172a,#1e1b4b,#0f172a)" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <div style={{ position: "relative", width: 60, height: 60 }}>
          <div style={{ position: "absolute", inset: 0, border: "4px solid rgba(139,92,246,0.2)", borderRadius: 16 }} />
          <div style={{ position: "absolute", inset: 0, border: "4px solid transparent", borderTopColor: "#8b5cf6", borderRadius: 16, animation: "spin 0.8s linear infinite" }} />
        </div>
        <p style={{ color: "#a78bfa", fontSize: 11, fontWeight: 800, letterSpacing: "0.3em", textTransform: "uppercase" }}>Loading Application...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error || !job) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", padding: 24 }}>
      <div style={{ background: "#fff", borderRadius: 24, padding: 48, textAlign: "center", maxWidth: 400, width: "100%", boxShadow: "0 8px 40px rgba(0,0,0,0.08)" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", marginBottom: 8 }}>Job Not Found</h2>
        <p style={{ fontSize: 14, color: "#64748b", marginBottom: 24 }}>{error || "This job may have been archived."}</p>
        <button onClick={() => navigate(-1)} style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", border: "none", borderRadius: 12, padding: "12px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Go Back</button>
      </div>
    </div>
  );

  const msgColors = {
    success: { bg: "#f0fdf4", border: "#bbf7d0", text: "#15803d", icon: "✓" },
    info: { bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8", icon: "ℹ" },
    error: { bg: "#fef2f2", border: "#fecaca", text: "#dc2626", icon: "✕" },
  };

  /* ── Main ─── */
  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        input:focus, textarea:focus, select:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }
        .fld-input:hover { border-color: #a5b4fc !important; }
        @media (max-width: 640px) { .hero-title { font-size: 22px !important; } .form-card { padding: 20px !important; } .form-grid-2 { grid-template-columns: 1fr !important; } .form-grid-3 { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* ── STICKY TOP BANNER ── */}
      {message.text && (() => {
        const mc = msgColors[message.type] || msgColors.info;
        return (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, background: mc.bg, borderBottom: `2px solid ${mc.border}`, padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", animation: "fadeDown 0.3s ease", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 24, height: 24, borderRadius: "50%", background: mc.text, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, flexShrink: 0 }}>{mc.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: mc.text }}>{message.text}</span>
            </div>
            <button onClick={() => setMessage({ type: "", text: "" })} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: mc.text, opacity: 0.7, lineHeight: 1, padding: "0 4px", flexShrink: 0 }}>×</button>
          </div>
        );
      })()}

      {/* ── HERO ── */}
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 55%, #312e81 100%)", padding: "56px 24px 72px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -80, right: -80, width: 350, height: 350, borderRadius: "50%", background: "rgba(139,92,246,0.1)", filter: "blur(60px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -40, left: -40, width: 250, height: 250, borderRadius: "50%", background: "rgba(99,102,241,0.08)", filter: "blur(50px)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 780, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: "#a5b4fc", fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: 24, display: "flex", alignItems: "center", gap: 6, padding: 0 }}>
            ← Back to Job
          </button>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
            <span style={{ background: "rgba(99,102,241,0.25)", color: "#c4b5fd", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 8, padding: "4px 14px", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase" }}>
              Job Application
            </span>
            <span style={{ background: "rgba(16,185,129,0.2)", color: "#6ee7b7", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 8, padding: "4px 14px", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase" }}>
              ✓ Position Open
            </span>
          </div>
          <h1 className="hero-title" style={{ color: "#fff", fontSize: "clamp(22px,3.5vw,36px)", fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1.2, margin: "0 0 12px" }}>
            Apply for <span style={{ color: "#a78bfa" }}>{job.role}</span>
          </h1>
          <p style={{ color: "#94a3b8", fontSize: 14, fontWeight: 500, margin: 0 }}>
            {emailChecked
              ? candidateExists
                ? "✅ Profile auto-filled — review and confirm your details below."
                : "📋 New application — fill in your details to get started."
              : "Enter your email to begin. Returning candidates will be auto-filled."}
          </p>
        </div>
      </div>

      {/* ── MAIN CARD ── */}
      <div style={{ maxWidth: 780, margin: "-40px auto 80px", padding: "0 16px", position: "relative", zIndex: 10 }}>
        <div className="form-card" style={{ background: "#fff", borderRadius: 24, boxShadow: "0 8px 40px rgba(0,0,0,0.08)", border: "1px solid #e2e8f0", overflow: "hidden", animation: "fadeUp 0.4s ease" }}>

          {/* Card top gradient bar */}
          <div style={{ height: 5, background: "linear-gradient(90deg,#6366f1,#8b5cf6,#d946ef)" }} />

          {/* ── EMAIL STEP ── */}
          {!emailChecked ? (
            <div style={{ padding: "48px 40px" }}>
              <div style={{ textAlign: "center", marginBottom: 36 }}>
                <div style={{ width: 72, height: 72, background: "linear-gradient(135deg,#eef2ff,#f3e8ff)", border: "1px solid #ddd6fe", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 28 }}>
                  📧
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0f172a", margin: "0 0 8px" }}>Enter your Email</h2>
                <p style={{ fontSize: 13, color: "#64748b", margin: 0, lineHeight: 1.6 }}>
                  We'll check if you already have a profile — returning candidates get auto-filled!
                </p>
              </div>

              <div style={{ maxWidth: 400, margin: "0 auto" }}>
                <label style={labelStyle}>Email Address *</label>
                <div style={{ position: "relative", marginBottom: 20 }}>
                  <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>📧</span>
                  <input
                    type="email" name="email" required
                    value={formData.email} onChange={handleChange}
                    onKeyDown={e => e.key === "Enter" && handleEmailCheck()}
                    className="fld-input"
                    style={{ ...inputStyle, paddingLeft: 42 }}
                    placeholder="candidate@example.com"
                  />
                </div>

                <button
                  onClick={handleEmailCheck}
                  disabled={isCheckingExistence || !formData.email}
                  style={{
                    width: "100%", padding: "14px 24px", borderRadius: 12, border: "none",
                    background: isCheckingExistence || !formData.email ? "#e2e8f0" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
                    color: isCheckingExistence || !formData.email ? "#94a3b8" : "#fff",
                    fontSize: 14, fontWeight: 800, cursor: isCheckingExistence || !formData.email ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                    transition: "all 0.2s", boxShadow: isCheckingExistence || !formData.email ? "none" : "0 4px 20px rgba(99,102,241,0.3)",
                    letterSpacing: "0.02em"
                  }}>
                  {isCheckingExistence
                    ? <><span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />Checking...</>
                    : <>Continue  →</>}
                </button>
              </div>
            </div>
          ) : candidateExists && !isLoggedIn ? (
            /* ── AUTHENTICATING ── */
            <div style={{ padding: "72px 40px", textAlign: "center" }}>
              <div style={{ width: 48, height: 48, border: "4px solid rgba(99,102,241,0.15)", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
              <p style={{ fontSize: 14, fontWeight: 700, color: "#6366f1" }}>Authenticating candidate...</p>
            </div>
          ) : (
            /* ── APPLICATION FORM ── */
            <form onSubmit={handleSubmit} style={{ padding: "36px 40px" }}>

              {/* Section 1: Personal */}
              <div style={{ marginBottom: 36 }}>
                <SectionHeader icon="👤" title="Personal Details" subtitle="Basic contact information" color="linear-gradient(135deg,#6366f1,#8b5cf6)" />
                <div className="form-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                  <Field label="First Name *">
                    <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} className="fld-input" style={inputStyle} placeholder="John" />
                  </Field>
                  <Field label="Last Name *">
                    <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} className="fld-input" style={inputStyle} placeholder="Doe" />
                  </Field>
                  <Field label="Email Address">
                    <input type="email" name="email" value={formData.email} readOnly style={{ ...inputStyle, background: "#f8fafc", color: "#64748b" }} />
                  </Field>
                  <Field label="Mobile Number *">
                    <input type="tel" name="mobile" required value={formData.mobile} onChange={handleChange} className="fld-input" style={inputStyle} placeholder="+91 98765 43210" />
                  </Field>
                </div>
                <div style={{ marginTop: 18 }}>
                  <Field label="Address / City">
                    <input type="text" name="address" value={formData.address || ""} onChange={handleChange} className="fld-input" style={inputStyle} placeholder="City, State, Country" />
                  </Field>
                </div>
              </div>

              {/* Section 2: Education */}
              <div style={{ marginBottom: 36, paddingTop: 28, borderTop: "1px solid #f1f5f9" }}>
                <SectionHeader icon="🎓" title="Education" subtitle="Academic qualifications" color="linear-gradient(135deg,#8b5cf6,#d946ef)" />
                <div className="form-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <Field label="Highest Qualification">
                      <input type="text" name="highestQualification" value={formData.highestQualification} onChange={handleChange} className="fld-input" style={inputStyle} placeholder="e.g. B.Tech, MCA, MBBS" />
                    </Field>
                  </div>
                  <Field label="Institution / College">
                    <input type="text" name="institution" value={formData.institution} onChange={handleChange} className="fld-input" style={inputStyle} placeholder="University or College name" />
                  </Field>
                  <Field label="Department / Stream">
                    <input type="text" name="department" value={formData.department} onChange={handleChange} className="fld-input" style={inputStyle} placeholder="e.g. Computer Science" />
                  </Field>
                  <Field label="Percentage / CGPA">
                    <input type="number" name="percentage" value={formData.percentage} onChange={handleChange} className="fld-input" style={inputStyle} placeholder="e.g. 85 or 8.5" />
                  </Field>
                  <Field label="Passing Year">
                    <input type="number" name="passingYear" value={formData.passingYear} onChange={handleChange} className="fld-input" style={inputStyle} placeholder="e.g. 2022" />
                  </Field>
                </div>
              </div>

              {/* Section 3: Experience */}
              <div style={{ marginBottom: 36, paddingTop: 28, borderTop: "1px solid #f1f5f9" }}>
                <SectionHeader icon="💼" title="Work Experience" subtitle="Professional background" color="linear-gradient(135deg,#0ea5e9,#6366f1)" />
                <div className="form-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                  <Field label="Current Company">
                    <input type="text" name="currentCompany" value={formData.currentCompany} onChange={handleChange} className="fld-input" style={inputStyle} placeholder="Your current employer" />
                  </Field>
                  <Field label="Current Role / Designation">
                    <input type="text" name="role" value={formData.role} onChange={handleChange} className="fld-input" style={inputStyle} placeholder="e.g. Staff Nurse, Developer" />
                  </Field>
                  <Field label="Total Experience (Yrs)">
                    <input type="number" name="totalExperience" min="0" value={formData.totalExperience} onChange={handleChange} className="fld-input" style={inputStyle} placeholder="e.g. 3" />
                  </Field>
                  <Field label="Current Location">
                    <input type="text" name="currentLocation" value={formData.currentLocation} onChange={handleChange} className="fld-input" style={inputStyle} placeholder="City, State" />
                  </Field>
                  <Field label="Current CTC">
                    <input type="text" name="currentCTC" value={formData.currentCTC} onChange={handleChange} className="fld-input" style={inputStyle} placeholder="e.g. 6 LPA" />
                  </Field>
                  <Field label="Expected CTC">
                    <input type="text" name="expectedCTC" value={formData.expectedCTC} onChange={handleChange} className="fld-input" style={inputStyle} placeholder="e.g. 9 LPA" />
                  </Field>
                  <Field label="Notice Period">
                    <input type="text" name="noticePeriod" value={formData.noticePeriod} onChange={handleChange} className="fld-input" style={inputStyle} placeholder="e.g. 30 Days, Immediate" />
                  </Field>
                  <Field label="Preferred Join Date">
                    <input type="date" name="dateOfJoining" value={formData.dateOfJoining} onChange={handleChange} className="fld-input" style={inputStyle} />
                  </Field>
                </div>
                <div style={{ marginTop: 18 }}>
                  <Field label="Key Skills (comma separated)">
                    <input type="text" name="skills" value={formData.skills} onChange={handleChange} className="fld-input" style={inputStyle} placeholder="e.g. React, Node.js, MongoDB" />
                  </Field>
                </div>
              </div>

              {/* Section 4: Resume */}
              <div style={{ marginBottom: 36, paddingTop: 28, borderTop: "1px solid #f1f5f9" }}>
                <SectionHeader icon="📄" title="Resume" subtitle="Upload your latest CV" color="linear-gradient(135deg,#10b981,#0ea5e9)" />
                <div style={{ position: "relative" }}>
                  <input
                    type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer", zIndex: 5 }}
                  />
                  <div style={{
                    border: "2px dashed", borderColor: formData.resume || formData.existingResume ? "#6366f1" : "#cbd5e1",
                    borderRadius: 14, padding: "28px 20px", textAlign: "center",
                    background: formData.resume || formData.existingResume ? "#f5f3ff" : "#fafafa",
                    transition: "all 0.2s"
                  }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>{formData.resume ? "✅" : formData.existingResume ? "📎" : "📤"}</div>
                    {formData.resume ? (
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#6366f1" }}>
                        {formData.resume.name} <span style={{ color: "#94a3b8", fontWeight: 500 }}>(ready to upload)</span>
                      </p>
                    ) : formData.existingResume ? (
                      <>
                        <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: "#6366f1" }}>Previously uploaded resume found ✓</p>
                        <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>You can upload a new one to replace it, or leave it as is.</p>
                      </>
                    ) : (
                      <>
                        <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, color: "#374151" }}><span style={{ color: "#6366f1" }}>Click to upload</span> or drag & drop</p>
                        <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>PDF, DOC, DOCX — Max 10MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* ── SUBMIT BUTTONS ── */}
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <button
                  type="button" onClick={() => navigate(-1)}
                  style={{ flex: 1, minWidth: 120, padding: "14px 20px", borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 14, fontWeight: 700, color: "#475569", cursor: "pointer", transition: "all 0.2s" }}>
                  ← Cancel
                </button>
                <button
                  type="submit" disabled={submitting}
                  style={{
                    flex: 2, minWidth: 200, padding: "14px 24px", borderRadius: 12, border: "none",
                    background: submitting ? "#e2e8f0" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
                    color: submitting ? "#94a3b8" : "#fff",
                    fontSize: 14, fontWeight: 800, cursor: submitting ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                    boxShadow: submitting ? "none" : "0 4px 20px rgba(99,102,241,0.35)",
                    transition: "all 0.2s", letterSpacing: "0.02em"
                  }}>
                  {submitting
                    ? <><span style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#6366f1", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} /> Submitting...</>
                    : <>{candidateExists ? "Confirm & Apply →" : "Register & Apply →"}</>}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <p style={{ textAlign: "center", marginTop: 24, fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.2em", textTransform: "uppercase" }}>
          Timely Health Recruitment Portal
        </p>
      </div>
    </div>
  );
}

export default ApplyingJob;