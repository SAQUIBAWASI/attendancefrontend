import React, { useEffect, useMemo, useState } from "react";
import MyJobs from "./MyJobs";
import EmployeePersonalDocuments from "./EmployeePersonalDocuments";
import EmployeeLetters from "./EmployeeLetters";
import MyMedicalCertificate from "./MyMedicalCertificate";
import {
  FaBriefcase,
  FaEnvelopeOpenText,
  FaFileMedical,
  FaFolderOpen,
  FaIdBadge,
  FaUser,
} from "react-icons/fa";
import { FiCalendar, FiMail, FiUserCheck, FiUsers } from "react-icons/fi";
import "./EmployeeDashboard.css";
import "./EmployeePageShell.css";

const EmployeeProfileCombined = () => {
  const [activeTab, setActiveTab] = useState("experience");
  const [empData, setEmpData] = useState({});

  useEffect(() => {
    const employeeDataStr = localStorage.getItem("employeeData");
    if (employeeDataStr) {
      try {
        setEmpData(JSON.parse(employeeDataStr));
      } catch (e) {
        console.error("Error parsing employeeData", e);
      }
    }
  }, []);

  const tabs = useMemo(
    () => [
      {
        id: "experience",
        label: "Jobs / Experience",
        shortDesc: "Employment and role history",
        icon: <FaBriefcase />,
        component: <MyJobs />,
      },
      {
        id: "documents",
        label: "Personal Documents",
        shortDesc: "Identity and employee files",
        icon: <FaFolderOpen />,
        component: <EmployeePersonalDocuments />,
      },
      {
        id: "letters",
        label: "My Letters",
        shortDesc: "Offer letters and HR letters",
        icon: <FaEnvelopeOpenText />,
        component: <EmployeeLetters />,
      },
      {
        id: "medical",
        label: "My Medical Certificate",
        shortDesc: "Medical submissions and records",
        icon: <FaFileMedical />,
        component: <MyMedicalCertificate />,
      },
    ],
    []
  );

  const activeTabData = tabs.find((tab) => tab.id === activeTab) || tabs[0];
  const firstName = empData.name?.split(" ")?.[0] || "there";
  const initials = empData.name
    ? empData.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "EP";
  const joinedOn = empData.joinDate ? new Date(empData.joinDate).toLocaleDateString() : "Not available";

  return (
    <div className="emp-dash emp-page-shell">
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 1023px) {
          .emp-profile__grid .emp-dash__sidebar {
            order: 1 !important;
          }
          .emp-profile__grid .emp-dash__main {
            order: 2 !important;
          }
        }
      `}} />
      <main>
        <div className="emp-dash__header">
          <div>
            <h1 className="emp-dash__greeting">
              Profile <span>Overview</span>
            </h1>
            <p className="emp-dash__subtitle">
              View your work profile, personal documents, letters, and medical records in one place.
            </p>
          </div>
          <div className="emp-dash__date-pill">
            <FiCalendar />
            <span>
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        <div className="emp-dash__stats">
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Employee ID</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FaIdBadge />
              </div>
            </div>
            <div className="emp-dash__stat-value" style={{ fontSize: "1.15rem" }}>
              {empData.employeeId || "—"}
            </div>
            <div className="emp-dash__stat-meta">registered employee code</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Department</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <FiUsers />
              </div>
            </div>
            <div className="emp-dash__stat-value" style={{ fontSize: "1.15rem" }}>
              {empData.department || "—"}
            </div>
            <div className="emp-dash__stat-meta">current team or function</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Role</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                <FiUserCheck />
              </div>
            </div>
            <div className="emp-dash__stat-value" style={{ fontSize: "1.15rem" }}>
              {empData.role || empData.designation || "Team Member"}
            </div>
            <div className="emp-dash__stat-meta">active designation</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Joined On</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--absent">
                <FiMail />
              </div>
            </div>
            <div className="emp-dash__stat-value" style={{ fontSize: "1.15rem" }}>
              {joinedOn}
            </div>
            <div className="emp-dash__stat-meta">
              {empData.email || "employee email not available"}
            </div>
          </div>
        </div>

        <div className="emp-page__hero">
          <div>
            <div className="emp-page__hero-eyebrow">Employee workspace</div>
            <div className="emp-page__hero-title">
              Welcome back, {firstName}
            </div>
            <p className="emp-page__hero-copy">
              Keep your profile information and records easy to access. Switch between experience, documents, letters, and medical details from one dashboard-style view.
            </p>
          </div>
          <div className="emp-page__hero-actions">
            <div className="emp-page__hero-btn--ghost" style={{ cursor: "default" }}>
              <FiMail />
              {empData.email || "No email available"}
            </div>
          </div>
        </div>

        <div className="emp-dash__grid emp-profile__grid">
          <aside className="emp-dash__sidebar">
            <div className="emp-dash__card">
              <div className="emp-dash__profile">
                <div className="emp-dash__avatar-wrap">
                  <div className="emp-dash__avatar-fallback">
                    {empData.name ? initials : <FaUser size={24} />}
                  </div>
                </div>
                <h2 className="emp-dash__name">{empData.name || "Employee Profile"}</h2>
                <span className="emp-dash__role">
                  {empData.role || empData.designation || "Team Member"}
                </span>
                <p className="emp-dash__emp-id">ID: {empData.employeeId || "Not available"}</p>
              </div>

              <div className="emp-dash__card-body" style={{ paddingTop: 0 }}>
                <div className="emp-dash__detail-row">
                  <span className="emp-dash__detail-label">Email</span>
                  <span className="emp-dash__detail-value">{empData.email || "—"}</span>
                </div>
                <div className="emp-dash__detail-row">
                  <span className="emp-dash__detail-label">Department</span>
                  <span className="emp-dash__detail-value">{empData.department || "—"}</span>
                </div>
                <div className="emp-dash__detail-row">
                  <span className="emp-dash__detail-label">Status</span>
                  <span className="emp-dash__status-badge">
                    <span className="emp-dash__status-dot" />
                    Active
                  </span>
                </div>
                <div className="emp-dash__detail-row">
                  <span className="emp-dash__detail-label">Joined</span>
                  <span className="emp-dash__detail-value">{joinedOn}</span>
                </div>
              </div>
            </div>

            <div className="emp-dash__card">
              <div className="emp-dash__card-header">
                <div>
                  <h3 className="emp-dash__card-title">Profile Sections</h3>
                  <p className="emp-dash__card-desc">Move between your employee records</p>
                </div>
              </div>
              <div className="emp-dash__card-body">
                <div className="emp-dash__actions">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`emp-dash__action ${activeTab === tab.id ? "emp-dash__action--primary" : ""}`}
                    >
                      <div className="emp-dash__action-icon">{tab.icon}</div>
                      <div>
                        <div className="emp-dash__action-title">{tab.label}</div>
                        <div className="emp-dash__action-desc">{tab.shortDesc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <div className="emp-dash__main">
            <div className="emp-dash__card">
              <div className="emp-dash__card-header">
                <div>
                  <h3 className="emp-dash__card-title">{activeTabData.label}</h3>
                  <p className="emp-dash__card-desc">{activeTabData.shortDesc}</p>
                </div>
              </div>
              <div className="emp-dash__card-body">
                {activeTabData.component}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeProfileCombined;
