// import axios from "axios";
// import { useEffect, useRef, useState } from "react";
// import { FaAsterisk, FaBriefcase, FaBuilding, FaCheck, FaDownload, FaEdit, FaEye, FaSave, FaSearch, FaSignOutAlt, FaSpinner, FaSync, FaTimes, FaUser, FaUserTie } from "react-icons/fa";
// import { toast } from "react-toastify";
// import { API_BASE_URL } from "../config";

// const MetaRow = ({ label, value }) => (
//   <div className="flex justify-between py-2 border-b border-gray-50 last:border-b-0 text-sm">
//     <span className="text-gray-500 font-medium">{label}</span>
//     <span className="font-bold text-gray-800 text-right">{value || "N/A"}</span>
//   </div>
// );

// const StatusBadge = ({ status, className = "" }) => {
//   const badges = {
//     approved: "bg-green-100 text-green-700",
//     rejected: "bg-red-100 text-red-700",
//     uploaded: "bg-blue-100 text-blue-700",
//     missing: "bg-gray-100 text-gray-500"
//   };

//   return (
//     <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${badges[status] || badges.missing} ${className}`}>
//       {status === 'approved' && <FaCheck className="mr-1 w-2 h-2" />}
//       {status === 'rejected' && <FaTimes className="mr-1 w-2 h-2" />}
//       {status}
//     </span>
//   );
// };

// export default function PersonalDocuments() {
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [dateFilter, setDateFilter] = useState("");
//   const [roleFilter, setRoleFilter] = useState("");
//   const [roles, setRoles] = useState([]);
//   const [roleSearchQuery, setRoleSearchQuery] = useState("");
//   const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
//   const roleDropdownRef = useRef(null);

//   const [candidateRoleFilter, setCandidateRoleFilter] = useState("");
//   const [candidateRoleSearchQuery, setCandidateRoleSearchQuery] = useState("");
//   const [isCandidateRoleDropdownOpen, setIsCandidateRoleDropdownOpen] = useState(false);
//   const candidateRoleDropdownRef = useRef(null);

//   const [marks, setMarks] = useState({});

//   // Editing states
//   const [isEditingBank, setIsEditingBank] = useState(false);
//   const [bankForm, setBankForm] = useState({ bankName: "", accountNumber: "", ifscCode: "" });
//   const [isSavingBank, setIsSavingBank] = useState(false);

//   const [isEditingEmergency1, setIsEditingEmergency1] = useState(false);
//   const [emergency1Form, setEmergency1Form] = useState({ name: "", phone: "", relationship: "" });
//   const [isSavingE1, setIsSavingE1] = useState(false);

//   const [isEditingEmergency2, setIsEditingEmergency2] = useState(false);
//   const [emergency2Form, setEmergency2Form] = useState({ name: "", phone: "", relationship: "" });
//   const [isSavingE2, setIsSavingE2] = useState(false);

//   useEffect(() => {
//     fetchData();
//     fetchRoles();

//     const handleClickOutside = (event) => {
//       if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
//         setIsRoleDropdownOpen(false);
//       }
//       if (candidateRoleDropdownRef.current && !candidateRoleDropdownRef.current.contains(event.target)) {
//         setIsCandidateRoleDropdownOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const fetchRoles = async () => {
//     try {
//       const res = await axios.get(`${API_BASE_URL}/roles/all`);
//       if (res.data.success) {
//         setRoles(res.data.data || []);
//       }
//     } catch (err) {
//       console.error("Failed to fetch roles:", err);
//     }
//   };

//   const getQueryUserId = () => {
//     const params = new URLSearchParams(window.location.search);
//     return params.get("userId");
//   };

//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const userId = getQueryUserId();
//       const token = localStorage.getItem("candidateToken");
//       const headers = token ? { Authorization: `Bearer ${token}` } : {};

//       if (userId) {
//         const res = await axios.get(`${API_BASE_URL}/candidate/admin/${userId}`, { headers });
//         if (res.data) {
//           const payload = res.data.success ? res.data.data : res.data;
//           setData(payload);
//         }
//       } else {
//         try {
//           const listRes = await axios.get(`${API_BASE_URL}/candidate/all-documents`, { headers });
//           if (listRes.data && listRes.data.success && Array.isArray(listRes.data.data)) {
//             setData(listRes.data.data);
//           } else if (listRes.data && Array.isArray(listRes.data)) {
//             setData(listRes.data);
//           } else {
//             const res = await axios.get(`${API_BASE_URL}/candidate/documents`, { headers });
//             const payload = res.data && res.data.success ? res.data.data : res.data;
//             setData(payload);
//           }
//         } catch (e) {
//           const res = await axios.get(`${API_BASE_URL}/candidate/documents`, { headers });
//           const payload = res.data && res.data.success ? res.data.data : res.data;
//           setData(payload);
//         }
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to load documents");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Initialize forms when data is loaded
//   useEffect(() => {
//     if (data && !Array.isArray(data)) {
//       setBankForm({
//         bankName: data.documents?.bankDetails?.bankName || "",
//         accountNumber: data.documents?.bankDetails?.accountNumber || "",
//         ifscCode: data.documents?.bankDetails?.ifscCode || ""
//       });
//       setEmergency1Form({
//         name: data.documents?.emergencyContact1?.name || "",
//         phone: data.documents?.emergencyContact1?.phone || "",
//         relationship: data.documents?.emergencyContact1?.relationship || ""
//       });
//       setEmergency2Form({
//         name: data.documents?.emergencyContact2?.name || "",
//         phone: data.documents?.emergencyContact2?.phone || "",
//         relationship: data.documents?.emergencyContact2?.relationship || ""
//       });
//     }
//   }, [data]);

//   const handleSaveBankDetails = async () => {
//     if (!bankForm.bankName || !bankForm.accountNumber || !bankForm.ifscCode) {
//       return toast.warning("Please fill all bank details");
//     }
//     setIsSavingBank(true);
//     try {
//       const token = localStorage.getItem("candidateToken");
//       const res = await axios.post(`${API_BASE_URL}/candidate/save-bank-details`,
//         { bankDetails: bankForm },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       if (res.data.success) {
//         toast.success("Bank details updated");
//         setIsEditingBank(false);
//         fetchData();
//       }
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Failed to save bank details");
//     } finally {
//       setIsSavingBank(false);
//     }
//   };

//   const handleSaveEmergencyContact = async (num) => {
//     const form = num === 1 ? emergency1Form : emergency2Form;
//     if (!form.name || !form.phone || !form.relationship) {
//       return toast.warning(`Please fill all fields for Emergency Contact #${num}`);
//     }
//     num === 1 ? setIsSavingE1(true) : setIsSavingE2(true);
//     try {
//       const token = localStorage.getItem("candidateToken");
//       const res = await axios.post(`${API_BASE_URL}/candidate/save-emergency-contact`,
//         { contactNumber: num, contact: form },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       if (res.data.success) {
//         toast.success(`Emergency Contact #${num} updated`);
//         num === 1 ? setIsEditingEmergency1(false) : setIsEditingEmergency2(false);
//         fetchData();
//       }
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Failed to save contact");
//     } finally {
//       num === 1 ? setIsSavingE1(false) : setIsSavingE2(false);
//     }
//   };

//   const openFile = (filePath) => {
//     if (!filePath) return;
//     const relativePath = filePath.includes("uploads")
//       ? "uploads/" + filePath.split(/uploads[\\/]/).pop().replace(/\\/g, "/")
//       : filePath.replace(/\\/g, "/");
//     const url = `${API_BASE_URL.replace("/api", "")}/${relativePath}`;
//     window.open(url, "_blank");
//   };

//   const mark = (key, state) => {
//     setMarks((s) => ({ ...s, [key]: state }));
//     toast.success(`${state === "approved" ? "Approved" : "Rejected"}: ${key}`);
//   };

//   if (loading) return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
//       <div className="text-center">
//         <FaSpinner className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
//         <p className="text-sm font-medium text-gray-400">Loading Documents...</p>
//       </div>
//     </div>
//   );

//   if (!data) return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50 p-6">
//       <div className="bg-white rounded-lg p-8 shadow-md text-center max-w-sm w-full border border-gray-100">
//         <FaUser size={32} className="mx-auto text-gray-300 mb-4" />
//         <h2 className="text-xl font-bold text-gray-800 mb-2">Unavailable</h2>
//         <p className="text-sm text-gray-500 mb-6">Candidate profile not found.</p>
//         <button onClick={fetchData} className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">Retry</button>
//       </div>
//     </div>
//   );

//   // Admin List View
//   if (Array.isArray(data)) {
//     const filteredData = Array.isArray(data) ? data.filter(row => {
//       const docs = row.documents || {};
//       // Check if any of the main document keys have a filePath
//       const hasUploadedDocs = Object.entries(docs).some(([key, doc]) =>
//         !['bankDetails', 'emergencyContact1', 'emergencyContact2', '_id'].includes(key) &&
//         doc && typeof doc === 'object' && doc.filePath
//       );

//       const candidateObj = row.candidateId && typeof row.candidateId === 'object' ? row.candidateId : null;
//       const candName = candidateObj?.name || row.candidateName || row.name || '';
//       const candEmail = candidateObj?.email || row.email || '';
//       const query = searchQuery.toLowerCase();

//       const matchesSearch = candName.toLowerCase().includes(query) || candEmail.toLowerCase().includes(query);

//       const matchesDate = dateFilter
//         ? new Date(row.createdAt || row.updatedAt).toISOString().slice(0, 10) === dateFilter
//         : true;

//       // Ensure job/role exists in the document model if available, otherwise just match true for legacy
//       const candRole = candidateObj?.jobId?.role || row.jobId?.role || row.role || "";
//       const matchesRole = roleFilter ? candRole === roleFilter : true;
//       const candActualRole = row.role || candidateObj?.role || "";
//       const matchesCandidateRole = candidateRoleFilter ? candRole === candidateRoleFilter : true; // often same data, or can match exact candRole

//       return matchesSearch && hasUploadedDocs && matchesDate && matchesRole && matchesCandidateRole;
//     }) : [];

//     return (
//       <div className="p-3 mx-auto bg-white rounded-lg shadow-md max-w-full min-h-screen">
//         <div className="flex flex-col gap-4 mb-6 xl:flex-row xl:items-center xl:justify-between px-2">
//           {/* <div> */}
//           {/* <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
//               Personal Documents
//             </h1> */}
//           {/* <h2 className="text-base font-bold text-gray-800">Assessment Manager</h2> */}
//           {/* <p className="text-gray-400 text-[11px] font-bold mt-1 uppercase tracking-widest pl-0">
//               Showing {filteredData.length} records with updated documents
//             </p> */}
//           {/* </div> */}

//           <div className="flex flex-wrap items-center justify-start xl:justify-end gap-3 flex-grow">
//             {/* Date Filter */}
//             <div className="relative w-full sm:w-auto">
//               <input
//                 type="date"
//                 className="w-full appearance-none bg-white py-2 px-4 pr-10 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all hover:bg-gray-50 cursor-pointer shadow-sm sm:w-40"
//                 value={dateFilter}
//                 onChange={(e) => setDateFilter(e.target.value)}
//               />
//               {dateFilter && (
//                 <div
//                   className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-400 hover:text-red-500 transition-colors"
//                   onClick={() => setDateFilter("")}
//                   title="Clear date filter"
//                 >
//                   <FaTimes className="text-[12px]" />
//                 </div>
//               )}
//             </div>

//             {/* Searchable Dept Filter */}
//             <div className="relative w-full sm:w-56" ref={roleDropdownRef}>
//               <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 z-10">
//                 <FaBriefcase className="text-sm" />
//               </div>
//               <div
//                 className="w-full bg-white py-2 pl-10 pr-10 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all hover:bg-gray-50 cursor-pointer shadow-sm relative overflow-hidden text-ellipsis whitespace-nowrap"
//                 onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
//               >
//                 {roleFilter || "Select Dept"}
//               </div>
//               <div className="absolute inset-y-0 right-0 flex items-center pr-3 z-10">
//                 {roleFilter ? (
//                   <FaTimes
//                     className="text-[12px] text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
//                     onClick={(e) => { e.stopPropagation(); setRoleFilter(""); }}
//                     title="Clear role filter"
//                   />
//                 ) : (
//                   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 pointer-events-none"><path d="m6 9 6 6 6-6" /></svg>
//                 )}
//               </div>

//               {isRoleDropdownOpen && (
//                 <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
//                   <div className="p-2 border-b border-gray-100 bg-gray-50">
//                     <div className="relative">
//                       <FaUserTie className="absolute left-2.5 top-2.5 text-gray-400 text-xs" />
//                       <input
//                         type="text"
//                         className="w-full py-1.5 pl-8 pr-4 text-xs bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         placeholder="Search dept..."
//                         value={roleSearchQuery}
//                         onChange={(e) => setRoleSearchQuery(e.target.value)}
//                         onClick={(e) => e.stopPropagation()}
//                         autoFocus
//                       />
//                     </div>
//                   </div>
//                   <div className="max-h-60 overflow-y-auto py-1">
//                     <div
//                       className={`px-4 py-2 text-xs font-bold cursor-pointer hover:bg-indigo-50 transition-colors ${!roleFilter ? 'text-indigo-600 bg-indigo-50/50' : 'text-gray-600'}`}
//                       onClick={() => { setRoleFilter(""); setIsRoleDropdownOpen(false); setRoleSearchQuery(""); }}
//                     >
//                       All Depts
//                     </div>
//                     {roles
//                       .filter(r => r.name.toLowerCase().includes(roleSearchQuery.toLowerCase()))
//                       .map((r) => (
//                         <div
//                           key={r._id}
//                           className={`px-4 py-2 text-xs font-bold cursor-pointer hover:bg-indigo-50 transition-colors ${roleFilter === r.name ? 'text-indigo-600 bg-indigo-50/50' : 'text-gray-600'}`}
//                           onClick={() => { setRoleFilter(r.name); setIsRoleDropdownOpen(false); setRoleSearchQuery(""); }}
//                         >
//                           {r.name}
//                         </div>
//                       ))
//                     }
//                     {roles.filter(r => r.name.toLowerCase().includes(roleSearchQuery.toLowerCase())).length === 0 && (
//                       <div className="px-4 py-3 text-xs text-gray-400 text-center font-medium italic">
//                         No depts found
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Searchable Role Filter */}
//             <div className="relative w-full sm:w-56" ref={candidateRoleDropdownRef}>
//               <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 z-10">
//                 <FaBriefcase className="text-sm" />
//               </div>
//               <div
//                 className="w-full bg-white py-2 pl-10 pr-10 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all hover:bg-gray-50 cursor-pointer shadow-sm relative overflow-hidden text-ellipsis whitespace-nowrap"
//                 onClick={() => setIsCandidateRoleDropdownOpen(!isCandidateRoleDropdownOpen)}
//               >
//                 {candidateRoleFilter || "Select Role"}
//               </div>
//               <div className="absolute inset-y-0 right-0 flex items-center pr-3 z-10">
//                 {candidateRoleFilter ? (
//                   <FaTimes
//                     className="text-[12px] text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
//                     onClick={(e) => { e.stopPropagation(); setCandidateRoleFilter(""); }}
//                     title="Clear role filter"
//                   />
//                 ) : (
//                   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 pointer-events-none"><path d="m6 9 6 6 6-6" /></svg>
//                 )}
//               </div>

//               {isCandidateRoleDropdownOpen && (
//                 <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
//                   <div className="p-2 border-b border-gray-100 bg-gray-50">
//                     <div className="relative">
//                       <FaUserTie className="absolute left-2.5 top-2.5 text-gray-400 text-xs" />
//                       <input
//                         type="text"
//                         className="w-full py-1.5 pl-8 pr-4 text-xs bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         placeholder="Search role..."
//                         value={candidateRoleSearchQuery}
//                         onChange={(e) => setCandidateRoleSearchQuery(e.target.value)}
//                         onClick={(e) => e.stopPropagation()}
//                         autoFocus
//                       />
//                     </div>
//                   </div>
//                   <div className="max-h-60 overflow-y-auto py-1">
//                     <div
//                       className={`px-4 py-2 text-xs font-bold cursor-pointer hover:bg-indigo-50 transition-colors ${!candidateRoleFilter ? 'text-indigo-600 bg-indigo-50/50' : 'text-gray-600'}`}
//                       onClick={() => { setCandidateRoleFilter(""); setIsCandidateRoleDropdownOpen(false); setCandidateRoleSearchQuery(""); }}
//                     >
//                       All Roles
//                     </div>
//                     {roles
//                       .filter(r => r.name.toLowerCase().includes(candidateRoleSearchQuery.toLowerCase()))
//                       .map((r) => (
//                         <div
//                           key={`cand-${r._id}`}
//                           className={`px-4 py-2 text-xs font-bold cursor-pointer hover:bg-indigo-50 transition-colors ${candidateRoleFilter === r.name ? 'text-indigo-600 bg-indigo-50/50' : 'text-gray-600'}`}
//                           onClick={() => { setCandidateRoleFilter(r.name); setIsCandidateRoleDropdownOpen(false); setCandidateRoleSearchQuery(""); }}
//                         >
//                           {r.name}
//                         </div>
//                       ))
//                     }
//                     {roles.filter(r => r.name.toLowerCase().includes(candidateRoleSearchQuery.toLowerCase())).length === 0 && (
//                       <div className="px-4 py-3 text-xs text-gray-400 text-center font-medium italic">
//                         No roles found
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Name / Email Search */}
//             <div className="relative w-full sm:w-64">
//               <input
//                 type="text"
//                 className="w-full py-2 pl-10 pr-10 text-sm text-gray-700 placeholder-gray-400 transition-all border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholder="Search name or email..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//               />
//               <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
//                 <FaSearch />
//               </div>
//               {searchQuery && (
//                 <div className="absolute inset-y-0 right-0 flex items-center pr-3">
//                   <FaTimes
//                     className="text-xs text-gray-400 hover:text-rose-500 cursor-pointer transition-colors"
//                     onClick={() => setSearchQuery("")}
//                   />
//                 </div>
//               )}
//             </div>

//             <button onClick={fetchData} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 hover:text-gray-900 rounded-lg transition-colors shadow-sm">
//               <FaSync className="text-xs" />
//               <span className="hidden sm:inline"></span>
//             </button>

//             <button
//               onClick={() => window.location.assign('/employee-resignation')}
//               className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-red-600 rounded-lg shadow-sm hover:bg-red-700"
//             >
//               <FaSignOutAlt />
//               <span>Resignations</span>
//             </button>
//           </div>
//         </div>

//         <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
//              <table className="min-w-full">
//               <thead className="text-sm text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
//               <tr>
//                 <th className="py-2 text-center">Candidate Details</th>
//                 {["Aadhar", "PAN", "Pass", "10th", "12th", "Grad", "Exp", "Bank"].map((header) => (
//                   <th key={header} className="py-2 text-center">{header}</th>
//                 ))}
//                 <th className="py-2 text-center border-l border-white/20">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100">
//               {filteredData.map((row) => {
//                 const docs = row.documents || {};
//                 const candidateObj = row.candidateId && typeof row.candidateId === 'object' ? row.candidateId : null;
//                 const candName = candidateObj?.name || row.candidateName || row.name || 'Unknown';
//                 const candEmail = candidateObj?.email || row.email || '';
//                 const candId = candidateObj?._id || candidateObj?.id || row.candidateId || row._id || '-';

//                 const renderDocMini = (docKey) => {
//                   const doc = docs[docKey] || {};
//                   const uploaded = !!doc.filePath;
//                   return (
//                     <td className="p-4 text-center">
//                       <div className="flex items-center justify-center gap-2">
//                         {uploaded ? (
//                           <>
//                             <button
//                               onClick={() => openFile(doc.filePath)}
//                               className="p-1.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
//                               title="View"
//                             >
//                               <FaEye size={12} />
//                             </button>
//                             <button
//                               onClick={() => openFile(doc.filePath)}
//                               className="p-1.5 rounded bg-gray-50 text-gray-500 hover:bg-gray-800 hover:text-white transition-all"
//                               title="Download"
//                             >
//                               <FaDownload size={12} />
//                             </button>
//                           </>
//                         ) : (
//                           <FaTimes className="text-gray-200" size={12} />
//                         )}
//                       </div>
//                     </td>
//                   );
//                 };

//                 return (
//                   <tr key={candId} className="hover:bg-gray-50 transition-colors">
//                     <td className="p-4">
//                       <div className="flex items-center gap-3">
//                         <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white shadow-sm">
//                           {candName.charAt(0)}
//                         </div>
//                         <div>
//                           <div className="text-sm font-bold text-gray-800">{candName}</div>
//                           <div className="text-[10px] text-gray-400 font-medium">{candEmail || candId.slice(-8)}</div>
//                         </div>
//                       </div>
//                     </td>
//                     {renderDocMini('aadharCard')}
//                     {renderDocMini('panCard')}
//                     {renderDocMini('passportPhoto')}
//                     {renderDocMini('tenthCertificate')}
//                     {renderDocMini('twelfthCertificate')}
//                     {renderDocMini('graduationCertificate')}
//                     {renderDocMini('experienceLetters')}
//                     <td className="p-4 text-center">
//                       <div className={`w-2 h-2 mx-auto rounded-full ${docs.bankDetails?.bankName ? 'bg-green-500 shadow-sm' : 'bg-gray-100'}`}></div>
//                     </td>
//                     <td className="p-4 text-center border-l border-gray-50">
//                       <button
//                         onClick={() => window.location.assign(`/personaldocuments?userId=${candId}`)}
//                         className="text-blue-600 hover:text-blue-800 font-bold text-xs"
//                       >
//                         Review
//                       </button>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//           {data.length === 0 && (
//             <div className="p-12 text-center text-gray-500 text-sm font-medium">No active records found.</div>
//           )}
//         </div>
//       </div>
//     );
//   }

//   const docKeys = Object.keys(data.documents || {}).filter(key =>
//     !['bankDetails', 'emergencyContact1', 'emergencyContact2'].includes(key)
//   );

//   // Profile Specific View
//   return (
//     <div className="p-3 mx-auto bg-white rounded-lg shadow-md max-w-full min-h-screen">
//       <div className="flex flex-col gap-6">
//         {/* Header synced with JobApplicants modal style */}
//         <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
//           <div className="flex items-center gap-5">
//             <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-100">
//               {data.candidateName?.charAt(0) || data.email?.charAt(0) || <FaUser />}
//             </div>
//             <div>
//               <h2 className="text-2xl font-bold text-gray-800 leading-tight">
//                 {data.candidateName || data.email || 'Candidate Profile'}
//               </h2>
//               <p className="text-blue-600 text-xs font-black uppercase tracking-[0.2em] mt-1">
//                 Verified: {data.completionPercentage ?? 0}%
//               </p>
//             </div>
//           </div>
//           <div className="flex items-center gap-3">
//             <button onClick={() => window.location.assign('/personaldocuments')} className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-all">Close</button>
//           </div>
//         </div>

//         <div className="p-6">
//           <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
//             <div className="lg:col-span-3 space-y-10">
//               {/* Documents Grid */}
//               <div>
//                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Verification Documents</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
//                   {docKeys.map((key) => {
//                     const doc = data.documents[key] || {};
//                     const uploaded = !!doc.filePath;
//                     const state = marks[key] || (doc.verified ? 'approved' : uploaded ? 'uploaded' : 'missing');

//                     return (
//                       <div key={key} className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-lg transition-all flex flex-col justify-between min-h-[160px]">
//                         <div>
//                           <div className="flex justify-between items-start mb-3">
//                             <h4 className="text-sm font-bold text-gray-800">{key.replace(/([A-Z])/g, ' $1')}</h4>
//                             <StatusBadge status={state} />
//                           </div>
//                           <p className="text-[10px] text-gray-400 font-mono truncate">{doc.fileName || 'No file selected'}</p>
//                         </div>

//                         <div className="flex flex-col gap-2 mt-4">
//                           <div className="flex gap-2">
//                             <button
//                               onClick={() => openFile(doc.filePath)}
//                               disabled={!uploaded}
//                               className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${uploaded ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-50 text-gray-300'}`}
//                             >
//                               <FaEye size={12} /> View
//                             </button>
//                             <button
//                               onClick={() => openFile(doc.filePath)}
//                               disabled={!uploaded}
//                               className={`flex-1 py-2 rounded-lg text-xs font-bold border flex items-center justify-center gap-2 transition-all ${uploaded ? 'border-gray-200 text-gray-700 hover:bg-gray-50' : 'bg-gray-50 border-transparent text-gray-300'}`}
//                             >
//                               <FaDownload size={12} /> Download
//                             </button>
//                           </div>

//                           <div className="flex gap-2">
//                             <button
//                               onClick={() => mark(key, 'approved')}
//                               className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${state === 'approved' ? 'bg-green-100 border-green-200 text-green-700' : 'border-gray-100 text-gray-400 hover:text-green-600'}`}
//                             >
//                               Approve
//                             </button>
//                             <button
//                               onClick={() => mark(key, 'rejected')}
//                               className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${state === 'rejected' ? 'bg-red-100 border-red-200 text-red-700' : 'border-gray-100 text-gray-400 hover:text-red-600'}`}
//                             >
//                               Reject
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>

//               {/* Extra Details synced with JobApplicants DetailItem style */}
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-6 border-t border-gray-100">
//                 {/* Bank Details Section */}
//                 <div className="space-y-4">
//                   <div className="flex items-center justify-between">
//                     <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
//                       <FaBuilding className="text-blue-500" /> Bank Details
//                     </h3>
//                     {!isEditingBank && (
//                       <button
//                         onClick={() => setIsEditingBank(true)}
//                         className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
//                         title="Edit Bank Details"
//                       >
//                         <FaEdit size={12} />
//                       </button>
//                     )}
//                   </div>

//                   <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-3">
//                     {isEditingBank ? (
//                       <div className="space-y-3">
//                         <div>
//                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Institution Name</label>
//                           <input
//                             type="text"
//                             className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
//                             value={bankForm.bankName}
//                             onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
//                             placeholder="e.g. HDFC Bank"
//                           />
//                         </div>
//                         <div>
//                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Account Number</label>
//                           <input
//                             type="text"
//                             className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
//                             value={bankForm.accountNumber}
//                             onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
//                             placeholder="Account Number"
//                           />
//                         </div>
//                         <div>
//                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">IFSC Code</label>
//                           <input
//                             type="text"
//                             className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
//                             value={bankForm.ifscCode}
//                             onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value })}
//                             placeholder="IFSC Code"
//                           />
//                         </div>
//                         <div className="flex gap-2 pt-2">
//                           <button
//                             onClick={handleSaveBankDetails}
//                             disabled={isSavingBank}
//                             className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
//                           >
//                             {isSavingBank ? <FaSpinner className="animate-spin" /> : <><FaSave /> Save</>}
//                           </button>
//                           <button
//                             onClick={() => {
//                               setIsEditingBank(false);
//                               setBankForm({
//                                 bankName: data.documents?.bankDetails?.bankName || "",
//                                 accountNumber: data.documents?.bankDetails?.accountNumber || "",
//                                 ifscCode: data.documents?.bankDetails?.ifscCode || ""
//                               });
//                             }}
//                             className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
//                           >
//                             Cancel
//                           </button>
//                         </div>
//                       </div>
//                     ) : (
//                       <>
//                         <MetaRow label="Institution" value={data.documents?.bankDetails?.bankName} />
//                         <MetaRow label="Account" value={data.documents?.bankDetails?.accountNumber} />
//                         <MetaRow label="IFSC Code" value={data.documents?.bankDetails?.ifscCode} />
//                         {!data.documents?.bankDetails?.bankName && (
//                           <p className="text-[10px] font-bold text-gray-400 italic text-center py-2">No bank details provided</p>
//                         )}
//                       </>
//                     )}
//                   </div>
//                 </div>

//                 {/* Emergency Contact #1 Section */}
//                 <div className="space-y-4">
//                   <div className="flex items-center justify-between">
//                     <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
//                       <FaAsterisk className="text-rose-500" /> Emergency #1
//                     </h3>
//                     {!isEditingEmergency1 && (
//                       <button
//                         onClick={() => setIsEditingEmergency1(true)}
//                         className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
//                         title="Edit Contact 1"
//                       >
//                         <FaEdit size={12} />
//                       </button>
//                     )}
//                   </div>

//                   <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-3">
//                     {isEditingEmergency1 ? (
//                       <div className="space-y-3">
//                         <div>
//                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Full Name</label>
//                           <input
//                             type="text"
//                             className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-rose-500 outline-none transition-all shadow-sm"
//                             value={emergency1Form.name}
//                             onChange={(e) => setEmergency1Form({ ...emergency1Form, name: e.target.value })}
//                             placeholder="Contact Name"
//                           />
//                         </div>
//                         <div>
//                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Phone Number</label>
//                           <input
//                             type="text"
//                             className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-rose-500 outline-none transition-all shadow-sm"
//                             value={emergency1Form.phone}
//                             onChange={(e) => setEmergency1Form({ ...emergency1Form, phone: e.target.value })}
//                             placeholder="Phone Number"
//                           />
//                         </div>
//                         <div>
//                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Relationship</label>
//                           <input
//                             type="text"
//                             className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-rose-500 outline-none transition-all shadow-sm"
//                             value={emergency1Form.relationship}
//                             onChange={(e) => setEmergency1Form({ ...emergency1Form, relationship: e.target.value })}
//                             placeholder="Relation (e.g. Spouse)"
//                           />
//                         </div>
//                         <div className="flex gap-2 pt-2">
//                           <button
//                             onClick={() => handleSaveEmergencyContact(1)}
//                             disabled={isSavingE1}
//                             className="flex-1 py-2 bg-rose-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all flex items-center justify-center gap-2"
//                           >
//                             {isSavingE1 ? <FaSpinner className="animate-spin" /> : <><FaSave /> Save</>}
//                           </button>
//                           <button
//                             onClick={() => {
//                               setIsEditingEmergency1(false);
//                               setEmergency1Form({
//                                 name: data.documents?.emergencyContact1?.name || "",
//                                 phone: data.documents?.emergencyContact1?.phone || "",
//                                 relationship: data.documents?.emergencyContact1?.relationship || ""
//                               });
//                             }}
//                             className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
//                           >
//                             Cancel
//                           </button>
//                         </div>
//                       </div>
//                     ) : (
//                       <>
//                         <MetaRow label="Identity" value={data.documents?.emergencyContact1?.name} />
//                         <MetaRow label="Phone" value={data.documents?.emergencyContact1?.phone} />
//                         <MetaRow label="Relation" value={data.documents?.emergencyContact1?.relationship} />
//                         {!data.documents?.emergencyContact1?.name && (
//                           <p className="text-[10px] font-bold text-gray-400 italic text-center py-2">No contact provided</p>
//                         )}
//                       </>
//                     )}
//                   </div>
//                 </div>

//                 {/* Emergency Contact #2 Section */}
//                 <div className="space-y-4">
//                   <div className="flex items-center justify-between">
//                     <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
//                       <FaAsterisk className="text-blue-500" /> Emergency #2
//                     </h3>
//                     {!isEditingEmergency2 && (
//                       <button
//                         onClick={() => setIsEditingEmergency2(true)}
//                         className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
//                         title="Edit Contact 2"
//                       >
//                         <FaEdit size={12} />
//                       </button>
//                     )}
//                   </div>

//                   <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-3">
//                     {isEditingEmergency2 ? (
//                       <div className="space-y-3">
//                         <div>
//                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Full Name</label>
//                           <input
//                             type="text"
//                             className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
//                             value={emergency2Form.name}
//                             onChange={(e) => setEmergency2Form({ ...emergency2Form, name: e.target.value })}
//                             placeholder="Contact Name"
//                           />
//                         </div>
//                         <div>
//                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Phone Number</label>
//                           <input
//                             type="text"
//                             className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
//                             value={emergency2Form.phone}
//                             onChange={(e) => setEmergency2Form({ ...emergency2Form, phone: e.target.value })}
//                             placeholder="Phone Number"
//                           />
//                         </div>
//                         <div>
//                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Relationship</label>
//                           <input
//                             type="text"
//                             className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
//                             value={emergency2Form.relationship}
//                             onChange={(e) => setEmergency2Form({ ...emergency2Form, relationship: e.target.value })}
//                             placeholder="Relation (e.g. Parent)"
//                           />
//                         </div>
//                         <div className="flex gap-2 pt-2">
//                           <button
//                             onClick={() => handleSaveEmergencyContact(2)}
//                             disabled={isSavingE2}
//                             className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
//                           >
//                             {isSavingE2 ? <FaSpinner className="animate-spin" /> : <><FaSave /> Save</>}
//                           </button>
//                           <button
//                             onClick={() => {
//                               setIsEditingEmergency2(false);
//                               setEmergency2Form({
//                                 name: data.documents?.emergencyContact2?.name || "",
//                                 phone: data.documents?.emergencyContact2?.phone || "",
//                                 relationship: data.documents?.emergencyContact2?.relationship || ""
//                               });
//                             }}
//                             className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
//                           >
//                             Cancel
//                           </button>
//                         </div>
//                       </div>
//                     ) : (
//                       <>
//                         <MetaRow label="Identity" value={data.documents?.emergencyContact2?.name} />
//                         <MetaRow label="Phone" value={data.documents?.emergencyContact2?.phone} />
//                         <MetaRow label="Relation" value={data.documents?.emergencyContact2?.relationship} />
//                         {!data.documents?.emergencyContact2?.name && (
//                           <p className="text-[10px] font-bold text-gray-400 italic text-center py-2">No contact provided</p>
//                         )}
//                       </>
//                     )}
//                   </div>
//                 </div>

//                 {/* Academic Background Section */}
//                 <div className="space-y-4">
//                   <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
//                     <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div> Academic Background
//                   </h3>
//                   <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-3">
//                     <MetaRow label="Qualification" value={data.candidateId?.qualification} />
//                     <MetaRow label="Percentage" value={data.candidateId?.percentage} />
//                     <MetaRow label="Passing Year" value={data.candidateId?.passingYear} />
//                     {(!data.candidateId?.qualification && !data.candidateId?.percentage) && (
//                       <p className="text-[10px] font-bold text-gray-400 italic text-center py-2">No academic details provided</p>
//                     )}
//                   </div>
//                 </div>

//                 {/* Professional Record Section */}
//                 <div className="space-y-4">
//                   <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
//                     <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Professional Record
//                   </h3>
//                   <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-3">
//                     <MetaRow label="Experience" value={data.candidateId?.experience} />
//                     <MetaRow label="Organization" value={data.candidateId?.currentCompany} />
//                     <MetaRow label="Current CTC" value={data.candidateId?.currentCTC} />
//                     <MetaRow label="Expected CTC" value={data.candidateId?.expectedCTC} />
//                     <div className="pt-2">
//                       <span className="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-widest">Skills</span>
//                       <div className="flex flex-wrap gap-1.5">
//                         {(data.candidateId?.skills || "").split(',').map((skill, idx) => skill.trim() && (
//                           <span key={idx} className="px-2 py-0.5 bg-white border border-gray-200 text-gray-600 rounded-md text-[9px] font-bold">
//                             {skill.trim()}
//                           </span>
//                         ))}
//                         {!data.candidateId?.skills && <span className="text-[10px] text-gray-400 italic font-medium">No skills listed</span>}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Sidebar synced with standard JobApplicants side info */}
//             <div className="space-y-6">
//               <div className="bg-gray-900 rounded-2xl p-6 text-white shadow-xl">
//                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-gray-400">Onboarding Metric</h4>
//                 <div className="flex items-end gap-2 mb-4">
//                   <span className="text-4xl font-black">{data.completionPercentage ?? 0}%</span>
//                   <span className="text-xs font-bold mb-1 opacity-50">Score</span>
//                 </div>
//                 <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
//                   <div className="h-full bg-blue-500 rounded-full" style={{ width: `${data.completionPercentage ?? 0}%` }}></div>
//                 </div>
//                 <p className="mt-4 text-[10px] font-medium text-gray-500 italic uppercase tracking-tighter">Requires 100% for full clearance</p>
//               </div>

//               <div className="bg-white border border-gray-100 rounded-xl p-5 space-y-4">
//                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Record Hash</p>
//                 <code className="text-[9px] text-blue-600 bg-blue-50 px-2 py-1 rounded block break-all font-mono">{data._id}</code>
//                 <div className="pt-2">
//                   <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Created At</p>
//                   <p className="text-xs font-bold text-gray-700">{data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'N/A'}</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



import axios from "axios";
import { useEffect, useRef, useState } from "react";
import {
  FaAsterisk, FaBriefcase, FaBuilding, FaCalendarAlt, FaCheck, FaDownload, FaEdit,
  FaEye, FaSave, FaSearch, FaSignOutAlt, FaSpinner, FaSync, FaTimes,
  FaUser, FaUserTie
} from "react-icons/fa";
import { toast } from "react-toastify";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { API_BASE_URL } from "../config";

const MetaRow = ({ label, value }) => (
  <div className="flex flex-col gap-1 p-3 bg-gray-50/50 rounded-xl border border-gray-100 transition-all hover:bg-white hover:shadow-sm">
    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
    <span className="text-sm font-bold text-gray-800 break-words">{value || "---"}</span>
  </div>
);

const StatusBadge = ({ status, className = "" }) => {
  const badges = {
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    uploaded: "bg-blue-100 text-blue-700",
    missing: "bg-gray-100 text-gray-500"
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${badges[status] || badges.missing} ${className}`}>
      {status === 'approved' && <FaCheck className="mr-1 w-2 h-2" />}
      {status === 'rejected' && <FaTimes className="mr-1 w-2 h-2" />}
      {status}
    </span>
  );
};

export default function PersonalDocuments() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [roles, setRoles] = useState([]);
  const [roleSearchQuery, setRoleSearchQuery] = useState("");
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const roleDropdownRef = useRef(null);

  const [marks, setMarks] = useState({});

  // Pagination states
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  });

  // Editing states
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [bankForm, setBankForm] = useState({ bankName: "", accountNumber: "", ifscCode: "" });
  const [isSavingBank, setIsSavingBank] = useState(false);

  const [isEditingEmergency1, setIsEditingEmergency1] = useState(false);
  const [emergency1Form, setEmergency1Form] = useState({ name: "", phone: "", relationship: "" });
  const [isSavingE1, setIsSavingE1] = useState(false);

  const [isEditingEmergency2, setIsEditingEmergency2] = useState(false);
  const [emergency2Form, setEmergency2Form] = useState({ name: "", phone: "", relationship: "" });
  const [isSavingE2, setIsSavingE2] = useState(false);
  const [isDownloadingBulk, setIsDownloadingBulk] = useState(false);

  // Helper to get filtered data - define this before any conditional returns
  const getFilteredData = () => {
    if (!Array.isArray(data)) return [];

    return data.filter(row => {
      const docs = row.documents || {};
      const hasUploadedDocs = Object.entries(docs).some(([key, doc]) =>
        !['bankDetails', 'emergencyContact1', 'emergencyContact2', '_id'].includes(key) &&
        doc && typeof doc === 'object' && doc.filePath
      );

      const candidateObj = row.candidateId && typeof row.candidateId === 'object' ? row.candidateId : null;
      const candName = candidateObj?.name || row.candidateName || row.name || '';
      const candEmail = candidateObj?.email || row.email || '';
      const query = searchQuery.toLowerCase();

      const matchesSearch = candName.toLowerCase().includes(query) || candEmail.toLowerCase().includes(query);

      const matchesDate = dateFilter
        ? new Date(row.createdAt || row.updatedAt).toISOString().slice(0, 10) === dateFilter
        : true;

      const candRole = candidateObj?.jobId?.role || row.jobId?.role || row.role || "";
      const matchesRole = roleFilter ? candRole === roleFilter : true;

      return matchesSearch && hasUploadedDocs && matchesDate && matchesRole;
    });
  };

  useEffect(() => {
    fetchData();
    fetchRoles();

    const handleClickOutside = (event) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
        setIsRoleDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update pagination when filtered data changes - MOVED TO TOP LEVEL
  useEffect(() => {
    if (Array.isArray(data)) {
      const filtered = getFilteredData();
      setPagination(prev => ({
        ...prev,
        totalCount: filtered.length,
        totalPages: Math.ceil(filtered.length / prev.limit),
        currentPage: 1
      }));
    }
  }, [data, searchQuery, roleFilter, dateFilter]);

  const fetchRoles = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/roles/all`);
      if (res.data.success) {
        setRoles(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch roles:", err);
    }
  };

  const getQueryUserId = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("userId");
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const userId = getQueryUserId();
      const token = localStorage.getItem("candidateToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      if (userId) {
        const res = await axios.get(`${API_BASE_URL}/candidate/admin/${userId}`, { headers });
        if (res.data) {
          const payload = res.data.success ? res.data.data : res.data;
          setData(payload);
        }
      } else {
        try {
          const listRes = await axios.get(`${API_BASE_URL}/candidate/all-documents`, { headers });
          if (listRes.data && listRes.data.success && Array.isArray(listRes.data.data)) {
            setData(listRes.data.data);
          } else if (listRes.data && Array.isArray(listRes.data)) {
            setData(listRes.data);
          } else {
            const res = await axios.get(`${API_BASE_URL}/candidate/documents`, { headers });
            const payload = res.data && res.data.success ? res.data.data : res.data;
            setData(payload);
          }
        } catch (e) {
          const res = await axios.get(`${API_BASE_URL}/candidate/documents`, { headers });
          const payload = res.data && res.data.success ? res.data.data : res.data;
          setData(payload);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  // Initialize forms when data is loaded
  useEffect(() => {
    if (data && !Array.isArray(data)) {
      setBankForm({
        bankName: data.documents?.bankDetails?.bankName || "",
        accountNumber: data.documents?.bankDetails?.accountNumber || "",
        ifscCode: data.documents?.bankDetails?.ifscCode || ""
      });
      setEmergency1Form({
        name: data.documents?.emergencyContact1?.name || "",
        phone: data.documents?.emergencyContact1?.phone || "",
        relationship: data.documents?.emergencyContact1?.relationship || ""
      });
      setEmergency2Form({
        name: data.documents?.emergencyContact2?.name || "",
        phone: data.documents?.emergencyContact2?.phone || "",
        relationship: data.documents?.emergencyContact2?.relationship || ""
      });
    }
  }, [data]);

  const handleSaveBankDetails = async () => {
    if (!bankForm.bankName || !bankForm.accountNumber || !bankForm.ifscCode) {
      return toast.warning("Please fill all bank details");
    }
    setIsSavingBank(true);
    try {
      const token = localStorage.getItem("candidateToken");
      const res = await axios.post(`${API_BASE_URL}/candidate/save-bank-details`,
        { bankDetails: bankForm },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success("Bank details updated");
        setIsEditingBank(false);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save bank details");
    } finally {
      setIsSavingBank(false);
    }
  };

  const handleSaveEmergencyContact = async (num) => {
    const form = num === 1 ? emergency1Form : emergency2Form;
    if (!form.name || !form.phone || !form.relationship) {
      return toast.warning(`Please fill all fields for Emergency Contact #${num}`);
    }
    num === 1 ? setIsSavingE1(true) : setIsSavingE2(true);
    try {
      const token = localStorage.getItem("candidateToken");
      const res = await axios.post(`${API_BASE_URL}/candidate/save-emergency-contact`,
        { contactNumber: num, contact: form },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success(`Emergency Contact #${num} updated`);
        num === 1 ? setIsEditingEmergency1(false) : setIsEditingEmergency2(false);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save contact");
    } finally {
      num === 1 ? setIsSavingE1(false) : setIsSavingE2(false);
    }
  };

  const openFile = (filePath) => {
    if (!filePath) return;
    const relativePath = filePath.includes("uploads")
      ? "uploads/" + filePath.split(/uploads[\\/]/).pop().replace(/\\/g, "/")
      : filePath.replace(/\\/g, "/");
    const url = `${API_BASE_URL.replace("/api", "")}/${relativePath}`;
    window.open(url, "_blank");
  };

  const mark = (key, state) => {
    setMarks((s) => ({ ...s, [key]: state }));
    toast.success(`${state === "approved" ? "Approved" : "Rejected"}: ${key}`);
  };

  const handleBulkDownload = async (targetData = null) => {
    const activeData = targetData || data;
    if (!activeData || Array.isArray(activeData)) return;

    const docsToDownload = Object.entries(activeData.documents || {})
      .filter(([key, doc]) =>
        !['bankDetails', 'emergencyContact1', 'emergencyContact2', '_id'].includes(key) &&
        doc && typeof doc === 'object' && doc.filePath
      );

    if (docsToDownload.length === 0) {
      return toast.info("No documents uploaded to download");
    }

    setIsDownloadingBulk(true);
    const zip = new JSZip();
    const toastId = toast.loading(`Preparing bulk download for ${activeData.candidateName || 'Candidate'}...`);

    try {
      const downloadPromises = docsToDownload.map(async ([key, doc]) => {
        const relativePath = doc.filePath.includes("uploads")
          ? "uploads/" + doc.filePath.split(/uploads[\\/]/).pop().replace(/\\/g, "/")
          : doc.filePath.replace(/\\/g, "/");
        const url = `${API_BASE_URL.replace("/api", "")}/${relativePath}`;

        try {
          const response = await axios.get(url, { responseType: 'arraybuffer' });
          const fileName = doc.fileName || `${key}.${doc.filePath.split('.').pop()}`;
          zip.file(fileName, response.data);
        } catch (err) {
          console.error(`Failed to download ${key}:`, err);
        }
      });

      await Promise.all(downloadPromises);

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${activeData.candidateName || 'Candidate'}_Documents.zip`);
      toast.update(toastId, { render: "Bulk download complete!", type: "success", isLoading: false, autoClose: 3000 });
    } catch (err) {
      console.error("Bulk download failed:", err);
      toast.update(toastId, { render: "Bulk download failed", type: "error", isLoading: false, autoClose: 3000 });
    } finally {
      setIsDownloadingBulk(false);
    }
  };

  // Pagination Handlers
  const handleItemsPerPageChange = (limit) => {
    const filtered = Array.isArray(data) ? getFilteredData() : [];
    setPagination({
      currentPage: 1,
      limit: limit,
      totalCount: filtered.length,
      totalPages: Math.ceil(filtered.length / limit)
    });
  };

  const handlePrevPage = () => {
    if (pagination.currentPage > 1) {
      setPagination(prev => ({
        ...prev,
        currentPage: prev.currentPage - 1
      }));
    }
  };

  const handleNextPage = () => {
    if (pagination.currentPage < pagination.totalPages) {
      setPagination(prev => ({
        ...prev,
        currentPage: prev.currentPage + 1
      }));
    }
  };

  const handlePageClick = (page) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= pagination.totalPages; i++) {
      if (
        i === 1 ||
        i === pagination.totalPages ||
        (i >= pagination.currentPage - 2 && i <= pagination.currentPage + 2)
      ) {
        pageNumbers.push(i);
      } else if (i === pagination.currentPage - 3 || i === pagination.currentPage + 3) {
        pageNumbers.push("...");
      }
    }
    return pageNumbers;
  };

  const resetFilters = () => {
    setSearchQuery("");
    setRoleFilter("");
    setDateFilter("");
    setRoleSearchQuery("");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <FaSpinner className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
        <p className="text-sm font-medium text-gray-400">Loading Documents...</p>
      </div>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="bg-white rounded-lg p-8 shadow-md text-center max-w-sm w-full border border-gray-100">
        <FaUser size={32} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Unavailable</h2>
        <p className="text-sm text-gray-500 mb-6">Candidate profile not found.</p>
        <button onClick={fetchData} className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">Retry</button>
      </div>
    </div>
  );

  // Admin List View
  if (Array.isArray(data)) {
    const filteredData = getFilteredData();

    const indexOfLastItem = pagination.currentPage * pagination.limit;
    const indexOfFirstItem = indexOfLastItem - pagination.limit;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-0 md:p-2 lg:p-4 pb-20">
        {/* Page Header Section */}
        <div className="px-6 py-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              Personal Documents
              <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-blue-200">
                {filteredData.length} Records
              </span>
            </h1>
            <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest pl-1">Document Verification Manager</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchData} className="h-11 px-5 text-xs font-black text-gray-600 bg-white border border-gray-100 shadow-sm rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2 uppercase tracking-widest">
              <FaSync className={`text-blue-500 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <button
              onClick={() => window.location.assign('/employee-resignation')}
              className="h-11 px-6 text-xs font-black text-white bg-red-600 shadow-lg shadow-red-100 rounded-xl hover:bg-red-700 transition-all flex items-center gap-2 uppercase tracking-widest"
            >
              <FaSignOutAlt /> Resignations
            </button>
          </div>
        </div>

        {/* Unified Search & Filter Bar */}
        <div className="mx-6 mb-6 p-4 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50">
          <div className="flex flex-wrap items-center gap-4">
            {/* Professional Search Input */}
            <div className="relative flex-1 min-w-[300px] group">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search by candidate name or identifier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-transparent rounded-xl text-sm font-bold text-gray-700 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors bg-gray-100 p-1.5 rounded-lg"
                >
                  <FaTimes size={10} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Role Dropdown */}
              <div className="relative" ref={roleDropdownRef}>
                <button
                  onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                  className={`h-12 px-5 text-xs font-black rounded-xl transition-all flex items-center gap-2 border uppercase tracking-widest ${roleFilter
                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100'
                    : 'bg-white text-gray-600 border-gray-100 hover:border-blue-200'
                    }`}
                >
                  <FaBriefcase className={roleFilter ? 'text-white' : 'text-blue-500'} />
                  {roleFilter || 'All Departments'}
                </button>

                {isRoleDropdownOpen && (
                  <div className="absolute z-50 mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden py-1 animate-in fade-in slide-in-from-top-2">
                    <div className="p-3 border-b border-gray-50 bg-gray-50/50">
                      <div className="relative">
                        <FaUserTie className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                        <input
                          type="text"
                          className="w-full py-2 pl-9 pr-3 text-xs bg-white border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                          placeholder="Search roles..."
                          value={roleSearchQuery}
                          onChange={(e) => setRoleSearchQuery(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      <div
                        onClick={() => { setRoleFilter(''); setIsRoleDropdownOpen(false); setRoleSearchQuery(''); }}
                        className={`px-4 py-2.5 text-xs font-bold cursor-pointer hover:bg-blue-50 transition-colors ${!roleFilter ? 'text-blue-600 bg-blue-50/80' : 'text-gray-600'}`}
                      >
                        ALL DEPARTMENTS
                      </div>
                      {roles
                        .filter(r => r.name.toLowerCase().includes(roleSearchQuery.toLowerCase()))
                        .map((r) => (
                          <div
                            key={r._id}
                            onClick={() => { setRoleFilter(r.name); setIsRoleDropdownOpen(false); setRoleSearchQuery(''); }}
                            className={`px-4 py-2.5 text-xs font-bold cursor-pointer hover:bg-blue-50 transition-colors ${roleFilter === r.name ? 'text-blue-600 bg-blue-50/80' : 'text-gray-600'}`}
                          >
                            {r.name.toUpperCase()}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Date Filter */}
              <div className="relative group">
                <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="h-12 pl-12 pr-4 bg-white border border-gray-100 rounded-xl text-xs font-black text-gray-600 uppercase tracking-widest focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none cursor-pointer hover:border-blue-200"
                />
              </div>

              {/* Clear Action */}
              {(searchQuery || roleFilter || dateFilter) && (
                <button
                  onClick={resetFilters}
                  className="h-12 px-6 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] hover:bg-rose-100 transition-all active:scale-95 flex items-center gap-2"
                >
                  <FaTimes /> Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
          <table className="min-w-full">
            <thead className="text-sm text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
              <tr>
                <th className="py-2 text-center">Candidate Details</th>
                {["Aadhar", "PAN", "Pass", "10th", "12th", "Grad", "Exp", "Bank"].map((header) => (
                  <th key={header} className="py-2 text-center">{header}</th>
                ))}
                <th className="py-2 text-center border-l border-white/20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentItems.map((row) => {
                const docs = row.documents || {};
                const candidateObj = row.candidateId && typeof row.candidateId === 'object' ? row.candidateId : null;
                const candName = candidateObj?.name || row.candidateName || row.name || 'Unknown';
                const candEmail = candidateObj?.email || row.email || '';
                const candId = candidateObj?._id || candidateObj?.id || row.candidateId || row._id || '-';

                const renderDocMini = (docKey) => {
                  const doc = docs[docKey] || {};
                  const uploaded = !!doc.filePath;
                  return (
                    <td className="p-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {uploaded ? (
                          <>
                            <button
                              onClick={() => openFile(doc.filePath)}
                              className="p-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
                              title="View"
                            >
                              <FaEye size={10} />
                            </button>
                            <button
                              onClick={() => openFile(doc.filePath)}
                              className="p-1 rounded bg-gray-50 text-gray-500 hover:bg-gray-800 hover:text-white transition-all"
                              title="Download"
                            >
                              <FaDownload size={10} />
                            </button>
                          </>
                        ) : (
                          <FaTimes className="text-gray-200" size={10} />
                        )}
                      </div>
                    </td>
                  );
                };

                return (
                  <tr key={candId} className="hover:bg-gray-50 transition-colors">
                    <td className="p-2 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white shadow-sm text-xs">
                          {candName.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-800">{candName}</div>
                          <div className="text-[8px] text-gray-400 font-medium">{candEmail || candId.slice(-8)}</div>
                        </div>
                      </div>
                    </td>
                    {renderDocMini('aadharCard')}
                    {renderDocMini('panCard')}
                    {renderDocMini('passportPhoto')}
                    {renderDocMini('tenthCertificate')}
                    {renderDocMini('twelfthCertificate')}
                    {renderDocMini('graduationCertificate')}
                    {renderDocMini('experienceLetters')}
                    <td className="p-2 text-center">
                      <div className={`w-2 h-2 mx-auto rounded-full ${docs.bankDetails?.bankName ? 'bg-green-500 shadow-sm' : 'bg-gray-100'}`}></div>
                    </td>
                    <td className="p-2 text-center border-l border-gray-50">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => window.location.assign(`/personaldocuments?userId=${candId}`)}
                          className="p-1.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
                          title="Review"
                        >
                          <FaEye size={12} />
                        </button>
                        <button
                          onClick={() => handleBulkDownload(row)}
                          disabled={isDownloadingBulk}
                          className="p-1.5 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-50"
                          title="Bulk Download"
                        >
                          <FaDownload size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          {filteredData.length > 0 && (
            <div className="flex flex-col items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50 sm:flex-row">
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
                <span>Showing</span>
                <span className="font-medium">
                  {indexOfFirstItem + 1}
                </span>
                <span>to</span>
                <span className="font-medium">
                  {Math.min(indexOfLastItem, filteredData.length)}
                </span>
                <span>of</span>
                <span className="font-medium">
                  {filteredData.length}
                </span>
                <span>results</span>

                <select
                  value={pagination.limit}
                  onChange={(e) => {
                    const newLimit = Number(e.target.value);
                    handleItemsPerPageChange(newLimit);
                  }}
                  className="p-1 ml-2 text-sm border rounded-lg"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="flex items-center gap-2 mt-2 sm:mt-0">
                <button
                  onClick={handlePrevPage}
                  disabled={pagination.currentPage === 1}
                  className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${pagination.currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {getPageNumbers().map((page, index) => (
                    <button
                      key={index}
                      onClick={() => typeof page === 'number' ? handlePageClick(page) : null}
                      disabled={page === "..."}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${page === "..."
                        ? "text-gray-500 cursor-default"
                        : pagination.currentPage === page
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${pagination.currentPage === pagination.totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {filteredData.length === 0 && (
            <div className="p-12 text-center text-gray-500 text-sm font-medium">No active records found.</div>
          )}
        </div>
      </div>
    );
  }

  // Profile Specific View (single candidate)
  const docKeys = Object.keys(data.documents || {}).filter(key =>
    !['bankDetails', 'emergencyContact1', 'emergencyContact2'].includes(key)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-0 md:p-4 lg:p-6">
      <div className="w-full space-y-8 p-4">
        {/* Header Section */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-blue-100">
              {data.candidateName?.charAt(0) || data.email?.charAt(0) || <FaUser />}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
                {data.candidateName || data.email || 'Candidate Profile'}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-widest rounded-full border border-blue-100">
                  Candidate ID: {data._id?.slice(-8).toUpperCase() || 'N/A'}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  {data.completionPercentage ?? 0}% Complete
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => handleBulkDownload()}
              disabled={isDownloadingBulk}
              className={`h-10 px-6 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-md ${isDownloadingBulk
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100 hover:shadow-blue-200'
                }`}
            >
              {isDownloadingBulk ? (
                <FaSpinner className="animate-spin text-sm" />
              ) : (
                <FaDownload className="text-sm" />
              )}
              {isDownloadingBulk ? "Preparing..." : "Bulk Download"}
            </button>
            <button
              onClick={() => window.location.assign('/personaldocuments')}
              className="h-10 px-6 bg-gray-800 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-all shadow-md"
            >
              Close
            </button>
          </div>
        </div>

        <div className="w-full pb-12">
          {/* Main Content Area */}
          <div className="w-full space-y-12">
            {/* Documents Section */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <FaBriefcase className="text-blue-500 text-sm" />
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Verification Documents</h3>
              </div>

              <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
                      <tr>
                        <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest">Document Type</th>
                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-center">Status</th>
                        <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest">File Details</th>
                        <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-center">Actions</th>
                        <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-right">Verification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {docKeys.map((key) => {
                        const doc = data.documents[key] || {};
                        const uploaded = !!doc.filePath;
                        const state = marks[key] || (doc.verified ? 'approved' : uploaded ? 'uploaded' : 'missing');

                        return (
                          <tr key={key} className="group hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <span className="text-sm font-bold text-gray-800">
                                {key.replace(/([A-Z])/g, ' $1').toUpperCase()}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <StatusBadge status={state} />
                            </td>
                            <td className="px-6 py-4">
                              <code className="text-[10px] text-gray-500 font-bold font-mono bg-gray-50 px-3 py-1 rounded-lg border border-gray-100 block max-w-[200px] truncate">
                                {doc.fileName || '--'}
                              </code>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => openFile(doc.filePath)}
                                  disabled={!uploaded}
                                  className={`p-2 rounded-lg transition-all ${uploaded ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm' : 'bg-gray-50 text-gray-300 cursor-not-allowed'}`}
                                  title="View Document"
                                >
                                  <FaEye size={12} />
                                </button>
                                <button
                                  onClick={() => openFile(doc.filePath)}
                                  disabled={!uploaded}
                                  className={`p-2 rounded-lg border transition-all ${uploaded ? 'border-gray-200 bg-white text-gray-600 hover:border-gray-900 hover:text-gray-900 shadow-sm' : 'bg-gray-50 border-transparent text-gray-300 cursor-not-allowed'}`}
                                  title="Download Document"
                                >
                                  <FaDownload size={12} />
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => mark(key, 'approved')}
                                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all flex items-center justify-center gap-1.5 ${state === 'approved' ? 'bg-green-100 border-green-200 text-green-700 shadow-sm' : 'border-gray-100 bg-white text-gray-400 hover:border-green-500 hover:text-green-500'}`}
                                >
                                  <FaCheck size={10} /> Approve
                                </button>
                                <button
                                  onClick={() => mark(key, 'rejected')}
                                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all flex items-center justify-center gap-1.5 ${state === 'rejected' ? 'bg-red-100 border-red-200 text-red-700 shadow-sm' : 'border-gray-100 bg-white text-gray-400 hover:border-red-500 hover:text-red-500'}`}
                                >
                                  <FaTimes size={10} /> Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Extra Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pt-12 border-t border-gray-100">
              {/* Bank Details Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <FaBuilding className="text-blue-500" /> Bank Details
                  </h3>
                  {!isEditingBank && (
                    <button
                      onClick={() => setIsEditingBank(true)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 bg-blue-50 rounded-lg transition-all"
                      title="Edit Bank Details"
                    >
                      <FaEdit size={12} />
                    </button>
                  )}
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 space-y-4">
                  {isEditingBank ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Institution Name</label>
                        <input
                          type="text"
                          className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          value={bankForm.bankName}
                          onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                          placeholder="e.g. HDFC Bank"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Account Number</label>
                        <input
                          type="text"
                          className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          value={bankForm.accountNumber}
                          onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                          placeholder="Account Number"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">IFSC Code</label>
                        <input
                          type="text"
                          className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          value={bankForm.ifscCode}
                          onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value })}
                          placeholder="IFSC Code"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={handleSaveBankDetails}
                          disabled={isSavingBank}
                          className="flex-1 h-9 bg-blue-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                        >
                          {isSavingBank ? <FaSpinner className="animate-spin" /> : <><FaSave /> Save</>}
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingBank(false);
                            setBankForm({
                              bankName: data.documents?.bankDetails?.bankName || "",
                              accountNumber: data.documents?.bankDetails?.accountNumber || "",
                              ifscCode: data.documents?.bankDetails?.ifscCode || ""
                            });
                          }}
                          className="px-4 h-9 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-gray-200 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <MetaRow label="Institution" value={data.documents?.bankDetails?.bankName} />
                      <MetaRow label="Account" value={data.documents?.bankDetails?.accountNumber} />
                      <MetaRow label="IFSC Code" value={data.documents?.bankDetails?.ifscCode} />
                      {!data.documents?.bankDetails?.bankName && (
                        <p className="text-[10px] font-bold text-gray-400 italic text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 mt-2">No bank details provided</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Emergency Contact #1 Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <FaAsterisk className="text-rose-500" /> Emergency #1
                  </h3>
                  {!isEditingEmergency1 && (
                    <button
                      onClick={() => setIsEditingEmergency1(true)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 bg-rose-50 rounded-lg transition-all"
                      title="Edit Contact 1"
                    >
                      <FaEdit size={12} />
                    </button>
                  )}
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 space-y-4">
                  {isEditingEmergency1 ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Full Name</label>
                        <input
                          type="text"
                          className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-rose-500 outline-none transition-all"
                          value={emergency1Form.name}
                          onChange={(e) => setEmergency1Form({ ...emergency1Form, name: e.target.value })}
                          placeholder="Contact Name"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Phone Number</label>
                        <input
                          type="text"
                          className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-rose-500 outline-none transition-all"
                          value={emergency1Form.phone}
                          onChange={(e) => setEmergency1Form({ ...emergency1Form, phone: e.target.value })}
                          placeholder="Phone Number"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Relationship</label>
                        <input
                          type="text"
                          className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-rose-500 outline-none transition-all"
                          value={emergency1Form.relationship}
                          onChange={(e) => setEmergency1Form({ ...emergency1Form, relationship: e.target.value })}
                          placeholder="Relation (e.g. Spouse)"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => handleSaveEmergencyContact(1)}
                          disabled={isSavingE1}
                          className="flex-1 h-9 bg-rose-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-rose-700 transition-all flex items-center justify-center gap-2"
                        >
                          {isSavingE1 ? <FaSpinner className="animate-spin" /> : <><FaSave /> Save</>}
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingEmergency1(false);
                            setEmergency1Form({
                              name: data.documents?.emergencyContact1?.name || "",
                              phone: data.documents?.emergencyContact1?.phone || "",
                              relationship: data.documents?.emergencyContact1?.relationship || ""
                            });
                          }}
                          className="px-4 h-9 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-gray-200 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <MetaRow label="Identity" value={data.documents?.emergencyContact1?.name} />
                      <MetaRow label="Phone" value={data.documents?.emergencyContact1?.phone} />
                      <MetaRow label="Relation" value={data.documents?.emergencyContact1?.relationship} />
                      {!data.documents?.emergencyContact1?.name && (
                        <p className="text-[10px] font-bold text-gray-400 italic text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 mt-2">No contact provided</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Emergency Contact #2 Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <FaAsterisk className="text-teal-500" /> Emergency #2
                  </h3>
                  {!isEditingEmergency2 && (
                    <button
                      onClick={() => setIsEditingEmergency2(true)}
                      className="p-1.5 text-teal-600 hover:bg-teal-100 bg-teal-50 rounded-lg transition-all"
                      title="Edit Contact 2"
                    >
                      <FaEdit size={12} />
                    </button>
                  )}
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 space-y-4">
                  {isEditingEmergency2 ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Full Name</label>
                        <input
                          type="text"
                          className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                          value={emergency2Form.name}
                          onChange={(e) => setEmergency2Form({ ...emergency2Form, name: e.target.value })}
                          placeholder="Contact Name"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Phone Number</label>
                        <input
                          type="text"
                          className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                          value={emergency2Form.phone}
                          onChange={(e) => setEmergency2Form({ ...emergency2Form, phone: e.target.value })}
                          placeholder="Phone Number"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Relationship</label>
                        <input
                          type="text"
                          className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                          value={emergency2Form.relationship}
                          onChange={(e) => setEmergency2Form({ ...emergency2Form, relationship: e.target.value })}
                          placeholder="Relation (e.g. Parent)"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => handleSaveEmergencyContact(2)}
                          disabled={isSavingE2}
                          className="flex-1 h-9 bg-teal-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-teal-700 transition-all flex items-center justify-center gap-2"
                        >
                          {isSavingE2 ? <FaSpinner className="animate-spin" /> : <><FaSave /> Save</>}
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingEmergency2(false);
                            setEmergency2Form({
                              name: data.documents?.emergencyContact2?.name || "",
                              phone: data.documents?.emergencyContact2?.phone || "",
                              relationship: data.documents?.emergencyContact2?.relationship || ""
                            });
                          }}
                          className="px-4 h-9 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-gray-200 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <MetaRow label="Identity" value={data.documents?.emergencyContact2?.name} />
                      <MetaRow label="Phone" value={data.documents?.emergencyContact2?.phone} />
                      <MetaRow label="Relation" value={data.documents?.emergencyContact2?.relationship} />
                      {!data.documents?.emergencyContact2?.name && (
                        <p className="text-[10px] font-bold text-gray-400 italic text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 mt-2">No contact provided</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
