// import React, { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";
// import {
//     FaBriefcase, FaListUl, FaCode, FaMoneyBillWave,
//     FaArrowRight, FaClock, FaCheckCircle, FaExclamationTriangle,
//     FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaGraduationCap,
//     FaFileUpload, FaTimes, FaMapMarkerAlt, FaHistory
// } from "react-icons/fa";

// const API_BASE = "https://api.timelyhealth.in"; // Revert to local for development

// function JobDetails() {
//     const { id } = useParams();
//     const [job, setJob] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");

//     // Form State
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [submitting, setSubmitting] = useState(false);
//     const [message, setMessage] = useState({ type: "", text: "" });
//     const [formData, setFormData] = useState({
//         firstName: "",
//         lastName: "",
//         email: "",
//         mobile: "",
//         dob: "",
//         highestQualification: "",
//         experience: "",
//         currentLocation: "",
//         noticePeriod: "",
//         resume: null
//     });

//     useEffect(() => {
//         const fetchJobDetails = async () => {
//             try {
//                 const response = await axios.get(`${API_BASE}/api/jobs/view/${id}`);
//                 if (response.data.success) {
//                     setJob(response.data.jobPost);
//                 } else {
//                     setError("Job post not found.");
//                 }
//             } catch (err) {
//                 setError(err.response?.data?.message || "Failed to load job details.");
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchJobDetails();
//     }, [id]);

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({ ...prev, [name]: value }));
//     };

//     const handleFileChange = (e) => {
//         setFormData(prev => ({ ...prev, resume: e.target.files[0] }));
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setSubmitting(true);
//         setMessage({ type: "", text: "" });

//         const data = new FormData();
//         data.append("jobId", job._id); // ✅ Use MongoDB _id, not the link ID
//         Object.keys(formData).forEach(key => {
//             data.append(key, formData[key]);
//         });

//         try {
//             const res = await axios.post(`${API_BASE}/api/applications/submit`, data, {
//                 headers: { "Content-Type": "multipart/form-data" }
//             });
//             if (res.data.success) {
//                 setMessage({ type: "success", text: "Successfully applied! We will contact you soon." });
//                 setTimeout(() => {
//                     setIsModalOpen(false);
//                     setFormData({
//                         firstName: "", lastName: "", email: "", mobile: "",
//                         dob: "", highestQualification: "", experience: "",
//                         currentLocation: "", noticePeriod: "", resume: null
//                     });
//                 }, 3000);
//             }
//         } catch (err) {
//             setMessage({ type: "error", text: err.response?.data?.message || "Failed to submit application." });
//         } finally {
//             setSubmitting(false);
//         }
//     };

//     if (loading) {
//         return (
//             <div className="min-h-screen flex items-center justify-center bg-gray-50">
//                 <div className="flex flex-col items-center gap-4">
//                     <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
//                     <p className="text-gray-600 font-bold animate-pulse">Loading job details...</p>
//                 </div>
//             </div>
//         );
//     }

//     if (error || !job) {
//         return (
//             <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
//                 <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center border border-rose-100">
//                     <FaExclamationTriangle className="text-5xl text-rose-500 mx-auto mb-4" />
//                     <h2 className="text-2xl font-black text-gray-800 mb-2">Oops!</h2>
//                     <p className="text-gray-600 mb-6">{error || "The job posting you are looking for might have expired or been removed."}</p>
//                     <a href="/" className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors">
//                         Go to Homepage
//                     </a>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen bg-gray-50 pb-12 font-sans">
//             {/* Header/Hero Section */}
//             <div className="bg-gradient-to-r from-gray-900 via-indigo-950 to-indigo-900 text-white py-20 px-4 shadow-lg">
//                 <div className="max-w-5xl mx-auto">
//                     <div className="flex flex-wrap items-center gap-3 mb-6">
//                         <span className="bg-indigo-500/30 backdrop-blur-sm text-indigo-100 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-400/30">
//                             Remote Available
//                         </span>
//                         <span className="bg-emerald-500/30 backdrop-blur-sm text-emerald-100 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-400/30 flex items-center gap-2">
//                             <FaCheckCircle className="text-xs" /> Actively Hiring
//                         </span>
//                     </div>
//                     <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">{job.role}</h1>
//                     <div className="flex flex-wrap items-center gap-8 text-indigo-100/90 font-semibold">
//                         <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10">
//                             <FaMoneyBillWave className="text-emerald-400 text-xl" />
//                             <span className="font-black">{job.salary || "Competitive Salary"}</span>
//                         </div>
//                         <div className="flex items-center gap-3">
//                             <FaClock className="text-indigo-300" />
//                             <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-200">Posted on {new Date(job.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</span>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Main Content */}
//             <div className="max-w-5xl mx-auto px-4 -mt-10">
//                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//                     {/* Left Column - Details */}
//                     <div className="lg:col-span-2 space-y-8">
//                         <div className="bg-white rounded-[2rem] shadow-2xl shadow-indigo-900/5 overflow-hidden border border-gray-100 p-8 md:p-12">
//                             <div className="space-y-12">
//                                 {/* Responsibilities */}
//                                 <section className="space-y-6">
//                                     <div className="flex items-center gap-4">
//                                         <div className="bg-indigo-600 text-white p-3 rounded-2xl shadow-lg shadow-indigo-100">
//                                             <FaListUl className="text-xl" />
//                                         </div>
//                                         <h2 className="text-2xl font-black text-gray-800 tracking-tight">Job Responsibilities</h2>
//                                     </div>
//                                     <div className="text-gray-600 leading-[1.8] whitespace-pre-wrap pl-6 border-l-4 border-indigo-500/20 text-sm font-medium">
//                                         {job.responsibilities}
//                                     </div>
//                                 </section>

//                                 {/* Skills */}
//                                 <section className="space-y-6">
//                                     <div className="flex items-center gap-4">
//                                         <div className="bg-emerald-600 text-white p-3 rounded-2xl shadow-lg shadow-emerald-100">
//                                             <FaCode className="text-xl" />
//                                         </div>
//                                         <h2 className="text-2xl font-black text-gray-800 tracking-tight">Required Expertise</h2>
//                                     </div>
//                                     <div className="flex flex-wrap gap-3 pt-2">
//                                         {job.skills.split(',').map((skill, idx) => (
//                                             <span key={idx} className="bg-indigo-50 text-indigo-700 px-6 py-3 rounded-2xl text-[10px] font-black border border-indigo-100/50 hover:border-indigo-400 hover:bg-white hover:shadow-md transition-all cursor-default uppercase tracking-widest">
//                                                 {skill.trim()}
//                                             </span>
//                                         ))}
//                                     </div>
//                                 </section>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Right Column - Application Card */}
//                     <div className="lg:col-span-1">
//                         <div className="sticky top-8 space-y-6">
//                             <div className="bg-white rounded-[2rem] shadow-2xl shadow-indigo-900/5 border border-gray-100 p-8 text-center">
//                                 <div className="w-20 h-20 flex items-center justify-center bg-gray-50 rounded-[2rem] mx-auto mb-6">
//                                     <FaBriefcase className="text-4xl text-indigo-600" />
//                                 </div>
//                                 <h3 className="text-2xl font-black text-gray-800 mb-4">Interested in this role?</h3>
//                                 <p className="text-gray-500 mb-8 leading-relaxed text-sm font-medium">
//                                     {job.assessmentId
//                                         ? "This position requires a brief skill assessment before final interview."
//                                         : "Join our team at Timely Health. Submit your application today."}
//                                 </p>
//                                 <button
//                                     onClick={() => setIsModalOpen(true)}
//                                     className="w-full bg-indigo-600 text-white px-8 py-2 rounded-[1.5rem] font-black text-lg hover:bg-indigo-700 hover:shadow-2xl shadow-indigo-200 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 group"
//                                 >
//                                     Apply Now
//                                     <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
//                                 </button>
//                                 <p className="mt-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Application takes <span className="text-indigo-600">2 minutes</span></p>
//                             </div>

//                             {/* Trust badges */}
//                             <div className="flex items-center justify-center gap-6 text-gray-400">
//                                 <div className="flex flex-col items-center gap-1">
//                                     <span className="text-xl font-black text-gray-800">98%</span>
//                                     <span className="text-[10px] uppercase font-bold tracking-widest">Satisfaction</span>
//                                 </div>
//                                 <div className="w-[1px] h-8 bg-gray-200"></div>
//                                 <div className="flex flex-col items-center gap-1">
//                                     <span className="text-xl font-black text-gray-800">24h</span>
//                                     <span className="text-[10px] uppercase font-bold tracking-widest">Response Time</span>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="mt-20 text-center">
//                     <div className="inline-block px-8 py-3 bg-white rounded-full border border-gray-100 text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 shadow-sm">
//                         Timely Health Recruitment Engine v2.0
//                     </div>
//                 </div>
//             </div>

//             {/* Application Modal */}
//             {isModalOpen && (
//                 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-[2px] animate-in fade-in duration-300">
//                     <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl shadow-indigo-900/10 overflow-hidden relative animate-in slide-in-from-bottom-10 duration-500 border border-gray-100">
//                         {/* Modal Header */}
//                         <div className="bg-white px-8 py-10 relative border-b border-gray-50 text-center">
//                             <button
//                                 onClick={() => setIsModalOpen(false)}
//                                 className="absolute top-8 right-8 p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
//                             >
//                                 <FaTimes className="text-xl" />
//                             </button>
//                             <div className="w-16 h-16 flex items-center justify-center bg-indigo-600 text-white rounded-[2rem] mx-auto mb-6 shadow-xl shadow-indigo-100">
//                                 <FaUser className="text-2xl" />
//                             </div>
//                             <h2 className="text-3xl font-black text-gray-800 mb-2 tracking-tight leading-tight">Apply for {job.role}</h2>
//                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Configure your candidate identity</p>
//                         </div>

//                         {/* Modal Body */}
//                         <div className="p-8 md:p-12 max-h-[70vh] overflow-y-auto no-scrollbar">
//                             {message.text && (
//                                 <div className={`mb-8 p-4 rounded-2xl flex items-center gap-4 ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
//                                     } animate-in slide-in-from-top-4 font-black text-sm`}>
//                                     {message.type === "success" ? <FaCheckCircle /> : <FaExclamationTriangle />}
//                                     {message.text}
//                                 </div>
//                             )}

//                             <form onSubmit={handleSubmit} className="space-y-8">
//                                 {/* Section: Basic Details */}
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                                     <div className="space-y-1.5">
//                                         <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">First Name</label>
//                                         <div className="relative group">
//                                             <FaUser className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" />
//                                             <input
//                                                 type="text" name="firstName" required
//                                                 value={formData.firstName} onChange={handleChange}
//                                                 className="w-full pl-12 pr-6 py-4 rounded-2xl border border-gray-100 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all font-black text-gray-800"
//                                                 placeholder="John"
//                                             />
//                                         </div>
//                                     </div>
//                                     <div className="space-y-1.5">
//                                         <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Last Name</label>
//                                         <div className="relative group">
//                                             <FaUser className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" />
//                                             <input
//                                                 type="text" name="lastName" required
//                                                 value={formData.lastName} onChange={handleChange}
//                                                 className="w-full pl-12 pr-6 py-4 rounded-2xl border border-gray-100 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all font-black text-gray-800"
//                                                 placeholder="Doe"
//                                             />
//                                         </div>
//                                     </div>
//                                     <div className="space-y-1.5">
//                                         <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
//                                         <div className="relative group">
//                                             <FaEnvelope className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" />
//                                             <input
//                                                 type="email" name="email" required
//                                                 value={formData.email} onChange={handleChange}
//                                                 className="w-full pl-12 pr-6 py-4 rounded-2xl border border-gray-100 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all font-black text-gray-800"
//                                                 placeholder="john@example.com"
//                                             />
//                                         </div>
//                                     </div>
//                                     <div className="space-y-1.5">
//                                         <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Mobile Number</label>
//                                         <div className="relative group">
//                                             <FaPhone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" />
//                                             <input
//                                                 type="tel" name="mobile" required
//                                                 value={formData.mobile} onChange={handleChange}
//                                                 className="w-full pl-12 pr-6 py-4 rounded-2xl border border-gray-100 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all font-black text-gray-800"
//                                                 placeholder="+91 99999 99999"
//                                             />
//                                         </div>
//                                     </div>
//                                     <div className="space-y-1.5">
//                                         <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Date of Birth</label>
//                                         <div className="relative group">
//                                             <FaCalendarAlt className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" />
//                                             <input
//                                                 type="date" name="dob" required
//                                                 value={formData.dob} onChange={handleChange}
//                                                 className="w-full pl-12 pr-6 py-4 rounded-2xl border border-gray-100 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all font-black text-gray-800"
//                                             />
//                                         </div>
//                                     </div>
//                                     <div className="space-y-1.5">
//                                         <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Highest Qualification</label>
//                                         <div className="relative group">
//                                             <FaGraduationCap className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors z-10" />
//                                             <select
//                                                 name="highestQualification" required
//                                                 value={formData.highestQualification} onChange={handleChange}
//                                                 className="w-full pl-12 pr-10 py-4 rounded-2xl border border-gray-100 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 outline-none appearance-none transition-all font-black text-gray-800 bg-white"
//                                             >
//                                                 <option value="">Select Qualification</option>
//                                                 <option value="Tenth">10th Standard</option>
//                                                 <option value="Twelfth">12th Standard</option>
//                                                 <option value="Graduate">Bachelor's Degree</option>
//                                                 <option value="Post Graduate">Master's Degree</option>
//                                                 <option value="PhD">Doctorate / PhD</option>
//                                                 <option value="Diploma">Professional Diploma</option>
//                                             </select>
//                                             <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300">
//                                                 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
//                                             </div>
//                                         </div>
//                                     </div>
//                                     <div className="space-y-1.5">
//                                         <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Current Location</label>
//                                         <div className="relative group">
//                                             <FaMapMarkerAlt className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" />
//                                             <input
//                                                 type="text" name="currentLocation"
//                                                 value={formData.currentLocation} onChange={handleChange}
//                                                 className="w-full pl-12 pr-6 py-4 rounded-2xl border border-gray-100 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all font-black text-gray-800"
//                                                 placeholder="e.g. Mumbai, India"
//                                             />
//                                         </div>
//                                     </div>
//                                     <div className="space-y-1.5">
//                                         <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Total Experience</label>
//                                         <div className="relative group">
//                                             <FaHistory className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" />
//                                             <input
//                                                 type="text" name="experience"
//                                                 value={formData.experience} onChange={handleChange}
//                                                 className="w-full pl-12 pr-6 py-4 rounded-2xl border border-gray-100 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all font-black text-gray-800"
//                                                 placeholder="e.g. 3 years"
//                                             />
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Section: Resume Upload */}
//                                 <div className="space-y-1.5">
//                                     <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Resume / CV (PDF or DOCX)</label>
//                                     <div className="relative">
//                                         <input
//                                             type="file" name="resume" required accept=".pdf,.doc,.docx"
//                                             onChange={handleFileChange}
//                                             className="hidden" id="resume-upload"
//                                         />
//                                         <label
//                                             htmlFor="resume-upload"
//                                             className="w-full flex flex-col items-center justify-center gap-4 p-12 border-2 border-dashed border-gray-100 rounded-[2.5rem] cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group"
//                                         >
//                                             <div className="w-16 h-16 flex items-center justify-center bg-gray-50 rounded-[1.5rem] group-hover:bg-white group-hover:shadow-xl transition-all">
//                                                 <FaFileUpload className="text-2xl text-gray-300 group-hover:text-indigo-600 transition-colors" />
//                                             </div>
//                                             <div className="text-center">
//                                                 <span className="block font-black text-gray-800 text-sm mb-1">{formData.resume ? formData.resume.name : "Secure Upload"}</span>
//                                                 <span className="text-[9px] uppercase tracking-[0.2em] text-gray-400 font-bold">PDF, DOCX up to 5MB</span>
//                                             </div>
//                                         </label>
//                                     </div>
//                                 </div>

//                                 {/* Submit Button */}
//                                 <div className="pt-6">
//                                     <button
//                                         type="submit"
//                                         disabled={submitting}
//                                         className={`w-full py-2 rounded-[1.5rem] font-black text-white text-lg transition-all shadow-xl shadow-indigo-100 transform active:scale-95 ${submitting ? "bg-indigo-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-2xl shadow-indigo-200"
//                                             }`}
//                                     >
//                                         {submitting ? (
//                                             <div className="flex items-center justify-center gap-3">
//                                                 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
//                                                 <span>Deploying Profile...</span>
//                                             </div>
//                                         ) : "Confirm Application"}
//                                     </button>
//                                 </div>
//                             </form>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }

// export default JobDetails;



import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaBriefcase, FaListUl, FaCode, FaMoneyBillWave, FaArrowRight, FaClock, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

const API_BASE = "https://api.timelyhealth.in/api";

function JobDetails() {
    const { id } = useParams();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchJobDetails = async () => {
            try {
                const response = await axios.get(`${API_BASE}/jobs/view/${id}`);
                if (response.data.success) {
                    setJob(response.data.jobPost);
                } else {
                    setError("Job post not found.");
                }
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load job details.");
            } finally {
                setLoading(false);
            }
        };
        fetchJobDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600 font-medium animate-pulse">Loading job details...</p>
                </div>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center border border-red-100">
                    <FaExclamationTriangle className="text-5xl text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
                    <p className="text-gray-600 mb-6">{error || "The job posting you are looking for might have expired or been removed."}</p>
                    <a href="/" className="inline-block bg-blue-700 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-800 transition-colors">
                        Go to Homepage
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header/Hero Section */}
            <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white py-16 px-4 shadow-lg">
                <div className="max-w-4xl mx-auto">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span className="bg-blue-500/30 backdrop-blur-sm text-blue-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-400/30">
                            Full-Time
                        </span>
                        <span className="bg-green-500/30 backdrop-blur-sm text-green-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-green-400/30 flex items-center gap-1">
                            <FaCheckCircle className="text-[10px]" /> Actively Hiring
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">{job.role}</h1>
                    <div className="flex flex-wrap items-center gap-6 text-blue-100/90 font-medium">
                        <div className="flex items-center gap-2">
                            <FaMoneyBillWave className="text-blue-300" />
                            <span>{job.salary || "Competitive Salary"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <FaClock className="text-blue-300" />
                            <span>Posted on {new Date(job.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 -mt-8">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mb-8">
                    <div className="p-8 md:p-12 space-y-10">
                        {/* Responsibilities */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                    <FaListUl className="text-blue-700 text-xl" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Job Responsibilities</h2>
                            </div>
                            <div className="text-gray-600 leading-relaxed whitespace-pre-wrap pl-2 border-l-4 border-blue-500/20">
                                {job.responsibilities}
                            </div>
                        </section>

                        {/* Skills */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                                <div className="bg-indigo-100 p-2 rounded-lg">
                                    <FaCode className="text-indigo-700 text-xl" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Required Skills</h2>
                            </div>
                            <div className="flex flex-wrap gap-2 pt-2">
                                {job.skills.split(',').map((skill, idx) => (
                                    <span key={idx} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 hover:border-blue-400 hover:bg-white transition-all cursor-default">
                                        {skill.trim()}
                                    </span>
                                ))}
                            </div>
                        </section>

                        {/* Assessment Call to Action */}
                        <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100 shadow-inner">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                <div>
                                    <h3 className="text-xl font-bold text-blue-900 mb-2">Ready to take the next step?</h3>
                                    <p className="text-blue-700/80 max-w-md">
                                        {job.assessmentId
                                            ? "This position requires a brief skill assessment to proceed with your application."
                                            : "Apply now to express your interest in this role at Timely Health."}
                                    </p>
                                </div>
                                <button className="whitespace-nowrap bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-800 hover:shadow-lg transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center gap-3 group">
                                    {job.assessmentId ? "Start Assessment" : "Apply Now"}
                                    <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </section>
                    </div>
                </div>

                {/* Footer info */}
                <div className="text-center text-gray-400 text-sm italic">
                    Powered by Timely Health Recruitment Portal
                </div>
            </div>
        </div>
    );
}

export default JobDetails;