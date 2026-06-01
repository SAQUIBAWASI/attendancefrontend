import React, { useState, useEffect } from "react";
import MyJobs from "./MyJobs";
import EmployeePersonalDocuments from "./EmployeePersonalDocuments";
import EmployeeLetters from "./EmployeeLetters";
import MyMedicalCertificate from "./MyMedicalCertificate";
import { FaBriefcase, FaFolderOpen, FaEnvelopeOpenText, FaFileMedical, FaUser } from "react-icons/fa";

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

  const tabs = [
    { id: "experience", label: "Jobs / Experience", icon: <FaBriefcase />, component: <MyJobs /> },
    { id: "documents", label: "Personal Documents", icon: <FaFolderOpen />, component: <EmployeePersonalDocuments /> },
    { id: "letters", label: "My Letters", icon: <FaEnvelopeOpenText />, component: <EmployeeLetters /> },
    { id: "medical", label: "My Medical Certificate", icon: <FaFileMedical />, component: <MyMedicalCertificate /> }
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
          </div>
        </div>
      </div>

      {/* Modern Capsule Tab Switcher */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 mb-6 overflow-x-auto">
        <nav className="flex space-x-1 min-w-max" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group flex items-center gap-2.5 py-2.5 px-5 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 outline-none
                  ${isActive 
                    ? "bg-[#1D4ED8] text-white shadow-md shadow-blue-100" 
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                  }`}
              >
                <span className={`text-sm transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"}`}>
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab content area */}
      <div className="transition-all duration-300">
        {tabs.find((tab) => tab.id === activeTab)?.component}
      </div>
    </div>
  );
};

export default EmployeeProfileCombined;
