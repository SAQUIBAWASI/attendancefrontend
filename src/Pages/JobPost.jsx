import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiBriefcase, FiList, FiCode, FiDollarSign,
  FiClipboard, FiCopy, FiCheckCircle, FiPlus,
  FiX, FiExternalLink, FiSearch, FiMoreVertical
} from "react-icons/fi";

const API_BASE = "http://localhost:5000/api";

function JobPost() {
  const [formData, setFormData] = useState({
    role: "",
    responsibilities: "",
    skills: "",
    salary: "",
    assessmentId: "",
  });

  const [jobs, setJobs] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingJobs, setFetchingJobs] = useState(false);
  const [fetchingQuizzes, setFetchingQuizzes] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [copiedId, setCopiedId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch Jobs and Quizzes
  useEffect(() => {
    fetchJobs();
    fetchQuizzes();
  }, []);

  const fetchJobs = async () => {
    setFetchingJobs(true);
    try {
      const res = await axios.get(`${API_BASE}/jobs/all`);
      if (res.data.success) {
        setJobs(res.data.jobPosts);
      }
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    } finally {
      setFetchingJobs(false);
    }
  };

  const fetchQuizzes = async () => {
    setFetchingQuizzes(true);
    try {
      const res = await axios.get(`${API_BASE}/admin/getallquizes`).catch(() => null);
      if (res && res.data && res.data.quizzes) {
        setQuizzes(res.data.quizzes);
      }
    } catch (err) {
      console.error("Failed to fetch quizzes:", err);
    } finally {
      setFetchingQuizzes(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await axios.post(`${API_BASE}/jobs/create`, formData);
      if (response.data.success) {
        setMessage({ type: "success", text: "Job post created successfully!" });
        setFormData({
          role: "",
          responsibilities: "",
          skills: "",
          salary: "",
          assessmentId: "",
        });
        fetchJobs();
        setTimeout(() => {
          setIsModalOpen(false);
          setMessage({ type: "", text: "" });
        }, 1500);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Failed to create job post.";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (link, id) => {
    const fullLink = window.location.origin + link;
    navigator.clipboard.writeText(fullLink);
    setCopiedId(id);
    setTimeout(() => setCopiedId(""), 2000);
  };

  const filteredJobs = jobs.filter(job =>
    job.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.skills.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 lg:p-8 font-poppins">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-black text-gray-800 tracking-tight">
              Recruitment Dashboard
            </h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Manage job openings and candidate assessments</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-sm hover:shadow-lg active:scale-95 group"
          >
            <FiPlus className="text-lg group-hover:rotate-90 transition-transform duration-300" />
            <span>Post New Job</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="mt-8 bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
          <FiSearch className="text-gray-400 ml-2" />
          <input
            type="text"
            placeholder="Search by role or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent outline-none text-sm font-medium text-gray-600 placeholder:text-gray-400 py-1"
          />
        </div>
      </div>

      {/* Job Listings Grid */}
      <div className="max-w-7xl mx-auto">
        {fetchingJobs ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-indigo-50 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider animate-pulse">Synchronizing listing...</p>
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <div
                key={job._id}
                className="group bg-white rounded-2xl p-5 shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 flex flex-col h-full active:scale-[0.98]"
              >
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <FiBriefcase className="text-lg" />
                    </div>
                    <button className="text-gray-300 hover:text-gray-600 p-1 transition-colors">
                      <FiMoreVertical />
                    </button>
                  </div>

                  <h3 className="text-lg font-black text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
                    {job.role}
                  </h3>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {job.skills.split(",").map((skill, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-lg">
                        <FiDollarSign className="text-sm" />
                      </div>
                      <span className="text-xs font-black text-gray-800">{job.salary || "Competitive"}</span>
                    </div>
                    {job.assessmentId && (
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 flex items-center justify-center bg-amber-50 text-amber-600 rounded-lg">
                          <FiClipboard className="text-sm" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Assessment: <span className="text-gray-800">Included</span></span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-50 mt-auto">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(job.link, job._id)}
                      className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${copiedId === job._id
                          ? "bg-emerald-600 text-white"
                          : "bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white"
                        }`}
                    >
                      {copiedId === job._id ? (
                        <><FiCheckCircle /> Copied</>
                      ) : (
                        <><FiCopy /> Copy Link</>
                      )}
                    </button>
                    <a
                      href={job.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-gray-50 text-gray-400 hover:bg-gray-800 hover:text-white rounded-xl transition-all"
                    >
                      <FiExternalLink />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="bg-gray-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiSearch className="text-2xl text-gray-200" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">No jobs found</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Try refined search parameters</p>
          </div>
        )}
      </div>

      {/* Create Job Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden relative animate-in slide-in-from-bottom-4 duration-300 border border-gray-100">
            {/* Modal Header */}
            <div className="px-8 pt-8 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-gray-800">Post New Opening</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Configure recruitment details</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 pt-4 max-h-[75vh] overflow-y-auto no-scrollbar">
              {message.text && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${message.type === "success"
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                    : "bg-rose-50 text-rose-600 border border-rose-100"
                  }`}>
                  {message.type === "success" ? <FiCheckCircle className="text-lg" /> : <FiX className="text-lg" />}
                  <span className="text-sm font-bold">{message.text}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Job Role */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">
                      Job Position
                    </label>
                    <div className="relative group">
                      <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" />
                      <input
                        type="text"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        required
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm font-black text-gray-800 placeholder:text-gray-300"
                        placeholder="Frontend Engineer"
                      />
                    </div>
                  </div>

                  {/* Salary */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">
                      Budget / Package
                    </label>
                    <div className="relative group">
                      <FiDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" />
                      <input
                        type="text"
                        name="salary"
                        value={formData.salary}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm font-black text-gray-800 placeholder:text-gray-300"
                        placeholder="5 - 12 LPA"
                      />
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">
                    Required Stack
                  </label>
                  <div className="relative group">
                    <FiCode className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                      type="text"
                      name="skills"
                      value={formData.skills}
                      onChange={handleChange}
                      required
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm font-black text-gray-800 placeholder:text-gray-300"
                      placeholder="React, AWS, TypeScript"
                    />
                  </div>
                </div>

                {/* Assessment */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">
                    Pre-defined Assessment
                  </label>
                  <div className="relative group">
                    <FiClipboard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors z-10" />
                    <select
                      name="assessmentId"
                      value={formData.assessmentId}
                      onChange={handleChange}
                      className="w-full pl-11 pr-10 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm font-black text-gray-800 bg-white appearance-none relative"
                    >
                      <option value="">No assessment required</option>
                      {quizzes.map((quiz) => (
                        <option key={quiz._id} value={quiz._id}>
                          {quiz.topic || quiz.title}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300 group-hover:text-gray-600 transition-colors">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                    </div>
                  </div>
                  {fetchingQuizzes && <p className="text-[9px] text-indigo-500 font-bold ml-1 animate-pulse tracking-tighter">Syncing question banks...</p>}
                </div>

                {/* Responsibilities */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">
                    Role Summary
                  </label>
                  <div className="relative group">
                    <FiList className="absolute left-4 top-4 text-gray-300 group-focus-within:text-indigo-600 transition-colors" />
                    <textarea
                      name="responsibilities"
                      value={formData.responsibilities}
                      onChange={handleChange}
                      required
                      rows="3"
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm font-medium text-gray-800 placeholder:text-gray-300 resize-none"
                      placeholder="Outline core responsibilities..."
                    ></textarea>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="pt-6 border-t border-gray-50 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3.5 px-6 rounded-xl font-bold text-gray-400 hover:text-gray-800 hover:bg-gray-50 transition-all border border-transparent"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex-[1.5] py-3.5 px-8 rounded-xl font-bold text-white shadow-sm transition-all transform active:scale-95 ${loading ? "bg-indigo-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg shadow-indigo-100"
                      }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Deploying...</span>
                      </div>
                    ) : (
                      "Publish Position"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobPost;
