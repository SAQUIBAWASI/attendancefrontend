import React, { useEffect, useMemo, useState } from "react";
import MyJobs from "./MyJobs";
import EmployeePersonalDocuments from "./EmployeePersonalDocuments";
import EmployeeLetters from "./EmployeeLetters";
import MyMedicalCertificate from "./MyMedicalCertificate";
import { FaBriefcase, FaFolderOpen, FaEnvelopeOpenText, FaFileMedical, FaUser, FaChartLine, FaRupeeSign } from "react-icons/fa";
import axios from "axios";

const API_BASE_URL = "https://api.timelyhealth.in/api";

const EmployeeProfileCombined = () => {
  const [activeTab, setActiveTab] = useState("experience");
  const [empData, setEmpData] = useState({});
  const [salaryData, setSalaryData] = useState(null);
  const [loadingSalary, setLoadingSalary] = useState(false);

  useEffect(() => {
    const employeeDataStr = localStorage.getItem("employeeData");
    if (employeeDataStr) {
      try {
        const data = JSON.parse(employeeDataStr);
        setEmpData(data);
        if (data.employeeId) {
          fetchEmployeeData(data.employeeId);
        }
      } catch (e) {
        console.error("Error parsing employeeData", e);
      }
    }
  }, []);

  const fetchEmployeeData = async (employeeId) => {
    setLoadingSalary(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/employees/get-employee?employeeId=${employeeId}`
      );
      if (response.data && response.data.success) {
        setSalaryData(response.data.data);
        setEmpData(prev => ({ ...prev, ...response.data.data }));
      }
    } catch (error) {
      console.error("Error fetching employee data:", error);
    } finally {
      setLoadingSalary(false);
    }
  };

  const tabs = [
    { id: "experience", label: "Jobs / Experience", icon: <FaBriefcase />, component: <MyJobs /> },
    { id: "documents", label: "Personal Documents", icon: <FaFolderOpen />, component: <EmployeePersonalDocuments /> },
    { id: "letters", label: "My Letters", icon: <FaEnvelopeOpenText />, component: <EmployeeLetters /> },
    { id: "medical", label: "My Medical Certificate", icon: <FaFileMedical />, component: <MyMedicalCertificate /> },
    { id: "salary", label: "Salary Hike", icon: <FaChartLine />, component: <SalaryHikeComponent employeeData={empData} salaryData={salaryData} loading={loadingSalary} /> }
  ];

  return (
    <div className="max-w-9xl mx-auto p-4 md:p-6 bg-slate-50 min-h-screen rounded-2xl">
      {/* Premium Profile Header Card */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 mb-6 flex flex-col md:flex-row items-center gap-6 transition-all hover:shadow-lg">
        <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-extrabold shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
          {empData.name ? empData.name.charAt(0).toUpperCase() : <FaUser size={28} />}
        </div>
        <div className="text-center md:text-left flex-1">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">{empData.name || "Employee Profile"}</h1>
          <p className="text-blue-600 font-bold text-sm uppercase tracking-wider mt-0.5">{empData.role || empData.designation || "Team Member"}</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3 text-xs text-slate-500 justify-center md:justify-start">
            {empData.email && (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-medium text-slate-600">{empData.email}</span>
              </span>
            )}
            {empData.department && (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                <span className="font-medium text-slate-600">{empData.department}</span>
              </span>
            )}
            {empData.employeeId && (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span className="font-semibold text-slate-600">ID: {empData.employeeId}</span>
              </span>
            )}
            {empData.salaryPerMonth && (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="font-semibold text-green-600">₹{empData.salaryPerMonth.toLocaleString()}/mo</span>
              </span>
            )}
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
      {/* </main> */}
      </div>
    </div>
  );
};

// ============================================
// SALARY HIKE COMPONENT - COMPACT GRID
// ============================================
const SalaryHikeComponent = ({ employeeData, salaryData, loading }) => {
  const [currentSalary, setCurrentSalary] = useState(0);
  const [increments, setIncrements] = useState([]);
  const [totalHike, setTotalHike] = useState(0);
  const [initialSalary, setInitialSalary] = useState(0);

  useEffect(() => {
    if (salaryData) {
      setCurrentSalary(salaryData.salaryPerMonth || 0);
      setIncrements(salaryData.salaryIncrements || []);
      
      const incs = salaryData.salaryIncrements || [];
      if (incs.length > 0) {
        const lastInc = incs[incs.length - 1];
        setInitialSalary(lastInc?.oldSalaryPerMonth || 0);
        let total = 0;
        incs.forEach(inc => {
          total += (inc.newSalaryPerMonth - inc.oldSalaryPerMonth);
        });
        setTotalHike(total);
      } else {
        setInitialSalary(salaryData.salaryPerMonth || 0);
      }
    }
  }, [salaryData]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500">Loading salary details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Salary Summary Cards - Compact Height */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100">
          <p className="text-[10px] text-slate-500 font-medium">Current Salary</p>
          <p className="text-lg font-bold text-slate-800">₹{currentSalary.toLocaleString()}</p>
          <p className="text-[9px] text-slate-400">per month</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100">
          <p className="text-[10px] text-slate-500 font-medium">Initial Salary</p>
          <p className="text-lg font-bold text-slate-800">₹{initialSalary.toLocaleString()}</p>
          <p className="text-[9px] text-slate-400">starting</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100">
          <p className="text-[10px] text-slate-500 font-medium">Total Hike</p>
          <p className="text-lg font-bold text-emerald-600">+₹{totalHike.toLocaleString()}</p>
          <p className="text-[9px] text-slate-400">
            {initialSalary > 0 ? `${Math.round((totalHike / initialSalary) * 100)}%` : 'N/A'}
          </p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100">
          <p className="text-[10px] text-slate-500 font-medium">Revisions</p>
          <p className="text-lg font-bold text-blue-600">{increments.length}</p>
          <p className="text-[9px] text-slate-400">hikes</p>
        </div>
      </div>

      {/* Salary Breakdown - Compact */}
      {salaryData && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <FaRupeeSign className="text-slate-500" /> Salary Breakdown
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="p-2 bg-slate-50 rounded-lg">
              <p className="text-[9px] text-slate-500">Basic</p>
              <p className="text-sm font-semibold text-slate-700">₹{salaryData.basicPay || 0}</p>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <p className="text-[9px] text-slate-500">HRA</p>
              <p className="text-sm font-semibold text-slate-700">₹{salaryData.hra || 0}</p>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <p className="text-[9px] text-slate-500">Conveyance</p>
              <p className="text-sm font-semibold text-slate-700">₹{salaryData.conveyanceAllowance || 0}</p>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <p className="text-[9px] text-slate-500">Medical</p>
              <p className="text-sm font-semibold text-slate-700">₹{salaryData.medicalAllowance || 0}</p>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <p className="text-[9px] text-slate-500">Performance</p>
              <p className="text-sm font-semibold text-slate-700">₹{salaryData.performanceAllowance || 0}</p>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <p className="text-[9px] text-slate-500">Special</p>
              <p className="text-sm font-semibold text-slate-700">₹{salaryData.specialAllowance || 0}</p>
            </div>
            <div className="p-2 bg-red-50 rounded-lg border border-red-100">
              <p className="text-[9px] text-red-500">Deductions</p>
              <p className="text-sm font-bold text-red-600">₹{(salaryData.ptax || 0) + (salaryData.gmcAmount || 0) + (salaryData.otherDeductions || 0)}</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-[9px] text-blue-600 font-medium">Net</p>
              <p className="text-sm font-bold text-blue-700">₹{salaryData.salaryPerMonth?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* Increment History - Compact */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <FaChartLine className="text-slate-500" /> Increment History
        </h3>
        
        {increments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-2 py-1.5 text-left text-[9px] font-semibold text-slate-600 uppercase">#</th>
                  <th className="px-2 py-1.5 text-left text-[9px] font-semibold text-slate-600 uppercase">Type</th>
                  <th className="px-2 py-1.5 text-left text-[9px] font-semibold text-slate-600 uppercase">Value</th>
                  <th className="px-2 py-1.5 text-left text-[9px] font-semibold text-slate-600 uppercase">Old</th>
                  <th className="px-2 py-1.5 text-left text-[9px] font-semibold text-slate-600 uppercase">New</th>
                  <th className="px-2 py-1.5 text-left text-[9px] font-semibold text-slate-600 uppercase">Hike</th>
                  <th className="px-2 py-1.5 text-left text-[9px] font-semibold text-slate-600 uppercase">Date</th>
                  <th className="px-2 py-1.5 text-left text-[9px] font-semibold text-slate-600 uppercase">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {increments.map((inc, index) => {
                  const hikeAmount = inc.newSalaryPerMonth - inc.oldSalaryPerMonth;
                  return (
                    <tr key={inc._id || index} className="hover:bg-slate-50 transition-colors">
                      <td className="px-2 py-1.5 text-xs text-slate-500">{increments.length - index}</td>
                      <td className="px-2 py-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${
                          inc.incrementType === 'percentage' 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {inc.incrementType === 'percentage' ? '%' : '₹'}
                        </span>
                      </td>
                      <td className="px-2 py-1.5 text-xs font-medium text-slate-700">
                        {inc.incrementType === 'percentage' ? `${inc.incrementValue}%` : `₹${inc.incrementValue}`}
                      </td>
                      <td className="px-2 py-1.5 text-xs text-slate-500">₹{inc.oldSalaryPerMonth}</td>
                      <td className="px-2 py-1.5 text-xs font-semibold text-emerald-600">₹{inc.newSalaryPerMonth}</td>
                      <td className="px-2 py-1.5 text-xs font-medium text-emerald-600">+₹{hikeAmount}</td>
                      <td className="px-2 py-1.5 text-xs text-slate-500">{formatDate(inc.effectiveFrom)}</td>
                      <td className="px-2 py-1.5 text-xs text-slate-500 max-w-[60px] truncate">{inc.reason || "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-slate-500">No salary increments found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeProfileCombined;