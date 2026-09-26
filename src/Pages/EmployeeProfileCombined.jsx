import React, { useEffect, useMemo, useState } from "react";
import MyJobs from "./MyJobs";
import EmployeePersonalDocuments from "./EmployeePersonalDocuments";
import EmployeeLetters from "./EmployeeLetters";
import MyMedicalCertificate from "./MyMedicalCertificate";
import { 
  FaBriefcase, 
  FaFolderOpen, 
  FaEnvelopeOpenText, 
  FaFileMedical, 
  FaUser, 
  FaChartLine, 
  FaRupeeSign,
  FaIdBadge,
  FaEdit,
  FaSave,
  FaTimes,
  FaEye,
  FaEyeSlash,
  FaSpinner,
  FaUniversity,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaBuilding
} from "react-icons/fa";
import { FiUsers, FiUserCheck, FiMail, FiEye } from "react-icons/fi";
import axios from "axios";

const API_BASE_URL = "https://api.timelyhealth.in/api";

// Pin Code Utility
const PINCODE_DATA = {
  "110001": { city: "New Delhi", state: "Delhi" },
  "400001": { city: "Mumbai", state: "Maharashtra" },
  "700001": { city: "Kolkata", state: "West Bengal" },
  "600001": { city: "Chennai", state: "Tamil Nadu" },
  "560001": { city: "Bengaluru", state: "Karnataka" },
  "380001": { city: "Ahmedabad", state: "Gujarat" },
  "302001": { city: "Jaipur", state: "Rajasthan" },
  "411001": { city: "Pune", state: "Maharashtra" },
  "800001": { city: "Patna", state: "Bihar" },
  "500001": { city: "Hyderabad", state: "Telangana" },
  "847301": { city: "Samastipur", state: "Bihar" },
};

const getCityStateFromPincode = async (pincode) => {
  try {
    if (PINCODE_DATA[pincode]) return PINCODE_DATA[pincode];
    try {
      const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
      if (response.data && response.data[0] && response.data[0].Status === "Success") {
        const postOffice = response.data[0].PostOffice[0];
        return { city: postOffice.District || postOffice.Name, state: postOffice.State, country: "India" };
      }
    } catch (apiError) { console.warn("External API failed"); }
    return null;
  } catch (error) { return null; }
};

const EmployeeProfileCombined = () => {
  const [activeTab, setActiveTab] = useState("experience");
  const [empData, setEmpData] = useState({});
  const [salaryData, setSalaryData] = useState(null);
  const [loadingSalary, setLoadingSalary] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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
        localStorage.setItem("employeeData", JSON.stringify({ ...JSON.parse(localStorage.getItem("employeeData") || "{}"), ...response.data.data }));
      }
    } catch (error) {
      console.error("Error fetching employee data:", error);
    } finally {
      setLoadingSalary(false);
    }
  };

  const getFirstName = () => {
    if (!empData) return "Employee";
    return empData.name?.split(' ')[0] || "Employee";
  };

  const getInitials = () => {
    if (!empData || !empData.name) return "?";
    const nameParts = empData.name.split(' ');
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    }
    return empData.name.charAt(0).toUpperCase();
  };

  const getJoinedOn = () => {
    if (!empData) return "N/A";
    const date = empData.joinDate || empData.createdAt || empData.joinedDate || empData.joiningDate;
    if (!date) return "N/A";
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return "N/A";
    }
  };

  const tabs = [
    { 
      id: "experience", 
      label: "Jobs / Experience", 
      icon: <FaBriefcase />, 
      shortDesc: "View your job history",
      component: <MyJobs /> 
    },
    { 
      id: "documents", 
      label: "Personal Documents", 
      icon: <FaFolderOpen />, 
      shortDesc: "Access your documents",
      component: <EmployeePersonalDocuments /> 
    },
    { 
      id: "letters", 
      label: "My Letters", 
      icon: <FaEnvelopeOpenText />, 
      shortDesc: "Official correspondence",
      component: <EmployeeLetters /> 
    },
    { 
      id: "medical", 
      label: "My Medical Certificate", 
      icon: <FaFileMedical />, 
      shortDesc: "Medical records",
      component: <MyMedicalCertificate /> 
    },
    { 
      id: "salary", 
      label: "Salary Hike", 
      icon: <FaChartLine />, 
      shortDesc: "Salary breakdown & hikes",
      component: <SalaryHikeComponent employeeData={empData} salaryData={salaryData} loading={loadingSalary} /> 
    }
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab) || tabs[0];

  const joinedOn = useMemo(() => getJoinedOn(), [empData]);
  const firstName = useMemo(() => getFirstName(), [empData]);
  const initials = useMemo(() => getInitials(), [empData]);

  const handleProfileUpdated = (updatedEmployee) => {
    setEmpData(prev => ({ ...prev, ...updatedEmployee }));
    setSalaryData(updatedEmployee);
    const stored = JSON.parse(localStorage.getItem("employeeData") || "{}");
    localStorage.setItem("employeeData", JSON.stringify({ ...stored, ...updatedEmployee }));
    setSuccessMessage("✅ Profile updated successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  return (
    <div className="max-w-9xl mx-auto p-4 md:p-6 bg-slate-50 min-h-screen rounded-2xl">
      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
          {errorMessage}
        </div>
      )}

      {/* Profile Header — Original Clean Style */}
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
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => setShowViewModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all"
          >
            <FiEye /> View Details
          </button>
          {/* <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md"
          >
            <FaEdit /> Edit Profile
          </button> */}
        </div>
      </div>

      {/* Stats Section */}
      <div className="emp-dash__stats">
        <div className="emp-dash__stat">
          <div className="emp-dash__stat-top">
            <span className="emp-dash__stat-label">Employee ID</span>
            <div className="emp-dash__stat-icon emp-dash__stat-icon--rate"><FaIdBadge /></div>
          </div>
          <div className="emp-dash__stat-value" style={{ fontSize: "1.15rem" }}>{empData.employeeId || "—"}</div>
          <div className="emp-dash__stat-meta">registered employee code</div>
        </div>

        <div className="emp-dash__stat">
          <div className="emp-dash__stat-top">
            <span className="emp-dash__stat-label">Department</span>
            <div className="emp-dash__stat-icon emp-dash__stat-icon--present"><FiUsers /></div>
          </div>
          <div className="emp-dash__stat-value" style={{ fontSize: "1.15rem" }}>{empData.department || "—"}</div>
          <div className="emp-dash__stat-meta">current team or function</div>
        </div>

        <div className="emp-dash__stat">
          <div className="emp-dash__stat-top">
            <span className="emp-dash__stat-label">Role</span>
            <div className="emp-dash__stat-icon emp-dash__stat-icon--late"><FiUserCheck /></div>
          </div>
          <div className="emp-dash__stat-value" style={{ fontSize: "1.15rem" }}>{empData.role || empData.designation || "Team Member"}</div>
          <div className="emp-dash__stat-meta">active designation</div>
        </div>

        <div className="emp-dash__stat">
          <div className="emp-dash__stat-top">
            <span className="emp-dash__stat-label">Joined On</span>
            <div className="emp-dash__stat-icon emp-dash__stat-icon--absent"><FiMail /></div>
          </div>
          <div className="emp-dash__stat-value" style={{ fontSize: "1.15rem" }}>{joinedOn}</div>
          <div className="emp-dash__stat-meta">{empData.email || "employee email not available"}</div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="emp-page__hero">
        <div>
          <div className="emp-page__hero-eyebrow">Employee workspace</div>
          <div className="emp-page__hero-title">Welcome back, {firstName}</div>
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

      {/* Main Grid */}
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
              <span className="emp-dash__role">{empData.role || empData.designation || "Team Member"}</span>
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

      {/* View Details Modal */}
      {showViewModal && (
        <ViewDetailsModal
          empData={empData}
          onClose={() => setShowViewModal(false)}
          onEdit={() => {
            setShowViewModal(false);
            setShowEditModal(true);
          }}
        />
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          employee={empData}
          onClose={() => setShowEditModal(false)}
          onSave={handleProfileUpdated}
          setErrorMessage={setErrorMessage}
        />
      )}
    </div>
  );
};

// ============================================
// VIEW DETAILS MODAL — All employee data
// ============================================
const ViewDetailsModal = ({ empData, onClose, onEdit }) => {
  const getLocationName = (loc) => {
    if (!loc) return "Not assigned";
    if (typeof loc === 'object' && loc.name) return loc.name;
    return loc;
  };

  const formatDate = (d) => {
    if (!d) return "N/A";
    try {
      return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return "N/A"; }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-white shadow-2xl rounded-2xl flex flex-col max-h-[92vh] overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white text-lg font-bold">
              {empData.name ? empData.name.charAt(0).toUpperCase() : <FaUser />}
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                {empData.name || "Employee"}
              </h3>
              <p className="text-xs text-gray-500">
                ID: <strong className="text-gray-700">{empData.employeeId}</strong> • {empData.role || empData.designation || "Team Member"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Basic Details */}
          <ViewSection title="Basic Details" icon={<FaUser />} color="blue">
            <ViewField label="Full Name" value={empData.name} />
            <ViewField label="Email" value={empData.email} />
            <ViewField label="Phone" value={empData.phone} />
            <ViewField label="Alternate Number" value={empData.alternateNumber} />
            <ViewField label="Parents Name" value={empData.parentsName} />
            <ViewField label="Gender" value={empData.gender} />
            <ViewField label="Date of Birth" value={formatDate(empData.dob)} />
            <ViewField label="Employee ID" value={empData.employeeId} />
            <ViewField label="Join Date" value={formatDate(empData.joinDate)} />
          </ViewSection>

          {/* Address Details */}
          <ViewSection title="Address Details" icon={<FaMapMarkerAlt />} color="green">
            <ViewField label="Address Line 1" value={empData.addressLine1} />
            <ViewField label="Address Line 2" value={empData.addressLine2} />
            <ViewField label="City" value={empData.city} />
            <ViewField label="State" value={empData.state} />
            <ViewField label="Pin Code" value={empData.pinCode} />
            <ViewField label="Country" value={empData.country} />
            {empData.address && (
              <div className="col-span-1 sm:col-span-2 lg:col-span-3 bg-gray-50/60 p-3 rounded-lg border border-gray-100">
                <span className="text-gray-400 block mb-1 text-[10px] uppercase font-semibold">Full Address</span>
                <span className="font-medium text-gray-800 text-sm">{empData.address}</span>
              </div>
            )}
          </ViewSection>

          {/* Office Details */}
          <ViewSection title="Office Details" icon={<FaBuilding />} color="purple">
            <ViewField label="Department" value={empData.department} />
            <ViewField label="Role / Designation" value={empData.role || empData.designation} />
            <ViewField label="Work Location" value={getLocationName(empData.location)} />
            <ViewField label="Employment Type" value={empData.employmentType} />
            <ViewField label="Reporting Manager" value={empData.reportingManager} />
            <ViewField label="Status" value={empData.status || "active"} />
          </ViewSection>

          {/* Bank & Documents */}
          <ViewSection title="Bank & Documents" icon={<FaUniversity />} color="indigo">
            <ViewField label="Bank Name" value={empData.bankName} />
            <ViewField label="Bank Account No" value={empData.bankAccountNo || empData.bankAccount} />
            <ViewField label="IFSC Code" value={empData.ifscCode || empData.ifsc} />
            <ViewField label="PAN Card Number" value={empData.panNumber || empData.panCard} highlight />
            <ViewField label="Aadhaar Card Number" value={empData.aadharNumber || empData.aadharCard || empData.aadhaarNumber} highlight />
            <ViewField label="UAN Number" value={empData.uanNumber} />
            <ViewField label="PF Number" value={empData.pfNumber} />
            <ViewField label="ESIC Number" value={empData.esicNumber} />
          </ViewSection>

          {/* Salary Details */}
          <ViewSection title="Salary Details" icon={<FaMoneyBillWave />} color="emerald">
            <ViewField label="Basic Pay" value={`₹${(empData.basicPay || 0).toLocaleString()}`} />
            <ViewField label="HRA" value={`₹${(empData.hra || 0).toLocaleString()}`} />
            <ViewField label="Conveyance" value={`₹${(empData.conveyanceAllowance || 0).toLocaleString()}`} />
            <ViewField label="Medical" value={`₹${(empData.medicalAllowance || 0).toLocaleString()}`} />
            <ViewField label="Performance" value={`₹${(empData.performanceAllowance || 0).toLocaleString()}`} />
            <ViewField label="Special Allowance" value={`₹${(empData.specialAllowance || 0).toLocaleString()}`} />
            <ViewField label="Net Salary" value={`₹${(empData.salaryPerMonth || 0).toLocaleString()}`} highlightGreen />
            <ViewField label="Yearly CTC" value={`₹${(empData.ctc || 0).toLocaleString()}`} highlightGreen />
          </ViewSection>

          {/* HR & Leave */}
          <ViewSection title="HR & Leave Policy" icon={<FaCalendarAlt />} color="orange">
            <ViewField label="Shift Type" value={empData.shiftType} />
            <ViewField label="Shift Hours" value={`${empData.shiftHours || 8} hrs`} />
            <ViewField label="Week Off Day" value={empData.weekOffDay} />
            <ViewField label="Week Offs/Month" value={empData.weekOffPerMonth} />
            <ViewField label="Max CL" value={empData.maxCL} />
            <ViewField label="Max SL" value={empData.maxSL} />
            <ViewField label="Max EL" value={empData.maxEL} />
            <ViewField label="Max Comp Off" value={empData.maxCompOff} />
          </ViewSection>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-gray-100 bg-gray-50/50">
          <button onClick={onClose} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs transition-all">
            Close
          </button>
          {/* <button onClick={onEdit} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-all shadow-md flex items-center gap-2">
            <FaEdit /> Edit Profile
          </button> */}
        </div>
      </div>
    </div>
  );
};

// View Section wrapper — same original UI style
const ViewSection = ({ title, icon, color = "blue", children }) => {
  const colorMap = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50",
    purple: "text-purple-600 bg-purple-50",
    indigo: "text-indigo-600 bg-indigo-50",
    emerald: "text-emerald-600 bg-emerald-50",
    orange: "text-orange-600 bg-orange-50",
  };
  const cls = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-2">
        <div className={`w-7 h-7 rounded-lg ${cls.split(' ')[1]} flex items-center justify-center`}>
          {React.cloneElement(icon, { className: cls.split(' ')[0], size: 12 })}
        </div>
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      </div>
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {children}
      </div>
    </div>
  );
};

// View Field — clean card, no rainbow
const ViewField = ({ label, value, highlight, highlightGreen }) => {
  return (
    <div className="bg-gray-50/60 p-3 rounded-lg border border-gray-100">
      <span className="text-gray-400 block mb-1 text-[10px] uppercase font-semibold tracking-wider">{label}</span>
      <span className={`font-semibold text-sm break-all ${
        highlightGreen ? 'text-green-600' : 
        highlight ? 'text-slate-900' : 
        'text-slate-800'
      }`}>
        {value || "N/A"}
      </span>
    </div>
  );
};

// ============================================
// EDIT PROFILE MODAL
// ============================================
const EditProfileModal = ({ employee, onClose, onSave, setErrorMessage }) => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    alternateNumber: "",
    parentsName: "",
    gender: "",
    dob: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pinCode: "",
    country: "India",
    bankName: "",
    bankAccountNo: "",
    ifscCode: "",
    panNumber: "",
    aadharNumber: "",
    uanNumber: "",
    pfNumber: "",
    esicNumber: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (employee) {
      const nameParts = employee.name ? employee.name.trim().split(' ') : ['', ''];
      setForm({
        firstName: employee.firstName || nameParts[0] || "",
        lastName: employee.lastName || nameParts.slice(1).join(' ') || "",
        email: employee.email || "",
        password: "",
        phone: employee.phone || "",
        alternateNumber: employee.alternateNumber || "",
        parentsName: employee.parentsName || "",
        gender: employee.gender || "",
        dob: employee.dob ? new Date(employee.dob).toISOString().split('T')[0] : "",
        addressLine1: employee.addressLine1 || "",
        addressLine2: employee.addressLine2 || "",
        city: employee.city || "",
        state: employee.state || "",
        pinCode: employee.pinCode || "",
        country: employee.country || "India",
        bankName: employee.bankName || "",
        bankAccountNo: employee.bankAccountNo || employee.bankAccount || "",
        ifscCode: employee.ifscCode || employee.ifsc || "",
        panNumber: employee.panNumber || employee.panCard || "",
        aadharNumber: employee.aadharNumber || employee.aadharCard || employee.aadhaarNumber || "",
        uanNumber: employee.uanNumber || "",
        pfNumber: employee.pfNumber || "",
        esicNumber: employee.esicNumber || "",
      });
    }
  }, [employee]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePinCodeChange = async (value) => {
    setForm(prev => ({ ...prev, pinCode: value }));
    if (value.length === 6) {
      try {
        const locationData = await getCityStateFromPincode(value);
        if (locationData) {
          setForm(prev => ({
            ...prev,
            city: locationData.city || prev.city,
            state: locationData.state || prev.state,
          }));
        }
      } catch (e) { /* ignore */ }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!form.phone || form.phone.length !== 10) {
        throw new Error("Phone number must be 10 digits");
      }
      if (form.pinCode && form.pinCode.length !== 6) {
        throw new Error("Pin code must be 6 digits");
      }

      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        name: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        phone: form.phone,
        alternateNumber: form.alternateNumber,
        parentsName: form.parentsName,
        gender: form.gender,
        dob: form.dob || null,
        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2,
        city: form.city,
        state: form.state,
        pinCode: form.pinCode,
        country: form.country,
        bankName: form.bankName,
        bankAccountNo: form.bankAccountNo,
        ifscCode: form.ifscCode,
        panNumber: form.panNumber ? form.panNumber.toUpperCase() : "",
        aadharNumber: form.aadharNumber ? String(form.aadharNumber).replace(/\D/g, '').slice(0, 12) : "",
        uanNumber: form.uanNumber,
        pfNumber: form.pfNumber,
        esicNumber: form.esicNumber,
      };
      if (form.password) payload.password = form.password;

      const response = await axios.put(
        `${API_BASE_URL}/employees/update/${employee._id}`,
        payload
      );

      if (response.data.success) {
        setSuccess("✅ Profile updated successfully!");
        setTimeout(() => {
          onSave(response.data.employee);
          onClose();
        }, 800);
      } else {
        throw new Error(response.data.message || "Failed to update");
      }
    } catch (err) {
      console.error("Update error:", err);
      const msg = err.response?.data?.message || err.message || "Something went wrong";
      setError(msg);
      if (setErrorMessage) setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-white shadow-2xl rounded-2xl flex flex-col max-h-[92vh] overflow-hidden border border-gray-100">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <FaEdit className="text-blue-600" /> Edit My Profile
            </h3>
            <p className="text-xs text-gray-500">Update your personal, contact & bank details</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-6">
          {error && (<div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">❌ {error}</div>)}
          {success && (<div className="p-3 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg">{success}</div>)}

          <EditSection title="Basic Details" icon={<FaUser className="text-blue-600" />}>
            <Field label="First Name *">
              <input type="text" value={form.firstName} onChange={(e) => handleChange('firstName', e.target.value)} className="w-full p-2.5 border rounded-lg text-sm" required />
            </Field>
            <Field label="Last Name">
              <input type="text" value={form.lastName} onChange={(e) => handleChange('lastName', e.target.value)} className="w-full p-2.5 border rounded-lg text-sm" />
            </Field>
            <Field label="Email *">
              <input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} className="w-full p-2.5 border rounded-lg text-sm" required />
            </Field>
            <Field label="Phone *">
              <input type="text" value={form.phone} onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} maxLength={10} className="w-full p-2.5 border rounded-lg text-sm" required />
            </Field>
            <Field label="Alternate Number">
              <input type="text" value={form.alternateNumber} onChange={(e) => handleChange('alternateNumber', e.target.value.replace(/\D/g, '').slice(0, 10))} maxLength={10} className="w-full p-2.5 border rounded-lg text-sm" />
            </Field>
            <Field label="Parents Name">
              <input type="text" value={form.parentsName} onChange={(e) => handleChange('parentsName', e.target.value)} className="w-full p-2.5 border rounded-lg text-sm" />
            </Field>
            <Field label="Gender">
              <select value={form.gender} onChange={(e) => handleChange('gender', e.target.value)} className="w-full p-2.5 border rounded-lg text-sm">
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </Field>
            <Field label="Date of Birth">
              <input type="date" value={form.dob} onChange={(e) => handleChange('dob', e.target.value)} max={new Date().toISOString().split('T')[0]} className="w-full p-2.5 border rounded-lg text-sm" />
            </Field>
            <Field label="Password (Leave blank to keep current)">
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => handleChange('password', e.target.value)} placeholder="New password" className="w-full p-2.5 pr-10 border rounded-lg text-sm" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-500">
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </Field>
          </EditSection>

          <EditSection title="Address Details" icon={<FaMapMarkerAlt className="text-green-600" />}>
            <Field label="Address Line 1">
              <input type="text" value={form.addressLine1} onChange={(e) => handleChange('addressLine1', e.target.value)} className="w-full p-2.5 border rounded-lg text-sm" />
            </Field>
            <Field label="Address Line 2">
              <input type="text" value={form.addressLine2} onChange={(e) => handleChange('addressLine2', e.target.value)} className="w-full p-2.5 border rounded-lg text-sm" />
            </Field>
            <Field label="Pin Code">
              <input type="text" value={form.pinCode} onChange={(e) => handlePinCodeChange(e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} className="w-full p-2.5 border rounded-lg text-sm" />
            </Field>
            <Field label="City">
              <input type="text" value={form.city} onChange={(e) => handleChange('city', e.target.value)} className="w-full p-2.5 border rounded-lg text-sm" />
            </Field>
            <Field label="State">
              <input type="text" value={form.state} onChange={(e) => handleChange('state', e.target.value)} className="w-full p-2.5 border rounded-lg text-sm" />
            </Field>
            <Field label="Country">
              <select value={form.country} onChange={(e) => handleChange('country', e.target.value)} className="w-full p-2.5 border rounded-lg text-sm">
                <option value="India">India</option>
                <option value="USA">USA</option>
                <option value="UK">UK</option>
              </select>
            </Field>
          </EditSection>

          <EditSection title="Bank & Documents" icon={<FaUniversity className="text-indigo-600" />}>
            <Field label="Bank Name">
              <input type="text" value={form.bankName} onChange={(e) => handleChange('bankName', e.target.value)} className="w-full p-2.5 border rounded-lg text-sm" />
            </Field>
            <Field label="Bank Account Number">
              <input type="text" value={form.bankAccountNo} onChange={(e) => handleChange('bankAccountNo', e.target.value)} className="w-full p-2.5 border rounded-lg text-sm" />
            </Field>
            <Field label="IFSC Code">
              <input type="text" value={form.ifscCode} onChange={(e) => handleChange('ifscCode', e.target.value.toUpperCase())} className="w-full p-2.5 border rounded-lg text-sm" />
            </Field>

            <Field label="PAN Card Number">
              <input type="text" value={form.panNumber} onChange={(e) => handleChange('panNumber', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))} placeholder="ABCDE1234F" maxLength={10} className="w-full p-2.5 border rounded-lg text-sm tracking-wider uppercase" />
              <p className="text-[10px] text-gray-500 mt-1">Format: 5 letters + 4 digits + 1 letter</p>
            </Field>

            <Field label="Aadhaar Card Number">
              <input type="text" value={form.aadharNumber} onChange={(e) => handleChange('aadharNumber', e.target.value.replace(/\D/g, '').slice(0, 12))} placeholder="12-digit Aadhaar number" maxLength={12} className="w-full p-2.5 border rounded-lg text-sm tracking-wider" />
              <p className="text-[10px] text-gray-500 mt-1">12 digits, no spaces</p>
            </Field>

            <Field label="UAN Number">
              <input type="text" value={form.uanNumber} onChange={(e) => handleChange('uanNumber', e.target.value)} className="w-full p-2.5 border rounded-lg text-sm" />
            </Field>
            <Field label="PF Number">
              <input type="text" value={form.pfNumber} onChange={(e) => handleChange('pfNumber', e.target.value)} className="w-full p-2.5 border rounded-lg text-sm" />
            </Field>
            <Field label="ESIC Number">
              <input type="text" value={form.esicNumber} onChange={(e) => handleChange('esicNumber', e.target.value)} className="w-full p-2.5 border rounded-lg text-sm" />
            </Field>
          </EditSection>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-[11px] text-blue-700">
            ℹ️ <strong>Note:</strong> You can update your personal & bank details here. 
            For changes to Department, Role, Salary, or Shift, please contact HR/Admin.
          </div>
        </form>

        <div className="flex justify-end gap-2 p-4 border-t border-gray-100 bg-gray-50/50">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs transition-all">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-xl text-xs transition-all shadow-md flex items-center gap-2">
            {loading ? (<><FaSpinner className="animate-spin" /> Saving...</>) : (<><FaSave /> Save Changes</>)}
          </button>
        </div>
      </div>
    </div>
  );
};

const EditSection = ({ title, icon, children }) => (
  <div className="border border-gray-100 rounded-xl p-4 bg-white">
    <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
      {icon} {title}
    </h4>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {children}
    </div>
  </div>
);

const Field = ({ label, children }) => (
  <div>
    <label className="block mb-1 text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
      {label}
    </label>
    {children}
  </div>
);

// ============================================
// SALARY HIKE COMPONENT
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
    try {
      return new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return "N/A"; }
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
          <p className="text-[9px] text-slate-400">{initialSalary > 0 ? `${Math.round((totalHike / initialSalary) * 100)}%` : 'N/A'}</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100">
          <p className="text-[10px] text-slate-500 font-medium">Revisions</p>
          <p className="text-lg font-bold text-blue-600">{increments.length}</p>
          <p className="text-[9px] text-slate-400">hikes</p>
        </div>
      </div>

      {salaryData && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <FaRupeeSign className="text-slate-500" /> Salary Breakdown
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="p-2 bg-slate-50 rounded-lg"><p className="text-[9px] text-slate-500">Basic</p><p className="text-sm font-semibold text-slate-700">₹{salaryData.basicPay || 0}</p></div>
            <div className="p-2 bg-slate-50 rounded-lg"><p className="text-[9px] text-slate-500">HRA</p><p className="text-sm font-semibold text-slate-700">₹{salaryData.hra || 0}</p></div>
            <div className="p-2 bg-slate-50 rounded-lg"><p className="text-[9px] text-slate-500">Conveyance</p><p className="text-sm font-semibold text-slate-700">₹{salaryData.conveyanceAllowance || 0}</p></div>
            <div className="p-2 bg-slate-50 rounded-lg"><p className="text-[9px] text-slate-500">Medical</p><p className="text-sm font-semibold text-slate-700">₹{salaryData.medicalAllowance || 0}</p></div>
            <div className="p-2 bg-slate-50 rounded-lg"><p className="text-[9px] text-slate-500">Performance</p><p className="text-sm font-semibold text-slate-700">₹{salaryData.performanceAllowance || 0}</p></div>
            <div className="p-2 bg-slate-50 rounded-lg"><p className="text-[9px] text-slate-500">Special</p><p className="text-sm font-semibold text-slate-700">₹{salaryData.specialAllowance || 0}</p></div>
            <div className="p-2 bg-red-50 rounded-lg border border-red-100"><p className="text-[9px] text-red-500">Deductions</p><p className="text-sm font-bold text-red-600">₹{(salaryData.ptax || 0) + (salaryData.gmcAmount || 0) + (salaryData.otherDeductions || 0)}</p></div>
            <div className="p-2 bg-blue-50 rounded-lg border border-blue-200"><p className="text-[9px] text-blue-600 font-medium">Net</p><p className="text-sm font-bold text-blue-700">₹{salaryData.salaryPerMonth?.toLocaleString() || 0}</p></div>
          </div>
        </div>
      )}

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
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${inc.incrementType === 'percentage' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                          {inc.incrementType === 'percentage' ? '%' : '₹'}
                        </span>
                      </td>
                      <td className="px-2 py-1.5 text-xs font-medium text-slate-700">{inc.incrementType === 'percentage' ? `${inc.incrementValue}%` : `₹${inc.incrementValue}`}</td>
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