import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaBriefcase, FaListUl, FaCode, FaMoneyBillWave, FaClipboardList, FaCopy, FaCheckCircle } from "react-icons/fa";

const API_BASE = "http://localhost:5000/api";

function JobPost() {
  const [formData, setFormData] = useState({
    role: "",
    responsibilities: "",
    skills: "",
    salary: "",
    assessmentId: "",
  });

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingQuizzes, setFetchingQuizzes] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);

  // Fetch Quizzes for selection
  useEffect(() => {
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
    fetchQuizzes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });
    setGeneratedLink("");

    try {
      const response = await axios.post(`${API_BASE}/jobs/create`, formData);
      if (response.data.success) {
        setMessage({ type: "success", text: "Job post created and notification sent!" });
        setGeneratedLink(window.location.origin + response.data.jobPost.link);
        setFormData({
          role: "",
          responsibilities: "",
          skills: "",
          salary: "",
          assessmentId: "",
        });
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Failed to create job post. Please try again.";
      setMessage({
        type: "error",
        text: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 p-6 text-white">
          <div className="flex items-center gap-3">
            <FaBriefcase className="text-3xl" />
            <h1 className="text-2xl md:text-3xl font-bold">Create Job Notification</h1>
          </div>
          <p className="mt-2 text-blue-100 opacity-90">Post a new job opening and assign assessments to candidates.</p>
        </div>

        <div className="p-6 md:p-8">
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
              }`}>
              {message.type === "success" ? <FaCheckCircle /> : <FaClipboardList />}
              <span className="font-medium">{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Job Role */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FaBriefcase className="text-blue-600" /> Job Role*
              </label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                placeholder="e.g. Frontend Developer"
              />
            </div>

            {/* Responsibilities */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FaListUl className="text-blue-600" /> Responsibilities*
              </label>
              <textarea
                name="responsibilities"
                value={formData.responsibilities}
                onChange={handleChange}
                required
                rows="4"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none resize-none"
                placeholder="Describe the key responsibilities of this role..."
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Skills */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FaCode className="text-blue-600" /> Skill Set*
                </label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  placeholder="e.g. React, JavaScript, CSS"
                />
              </div>

              {/* Salary */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FaMoneyBillWave className="text-blue-600" /> Offered Salary
                </label>
                <input
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  placeholder="e.g. ₹5,00,000 - ₹8,00,000 PA"
                />
              </div>
            </div>

            {/* Assessment Selection */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FaClipboardList className="text-blue-600" /> Assign Assessment
              </label>
              <select
                name="assessmentId"
                value={formData.assessmentId}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-white"
              >
                <option value="">None (Default)</option>
                {quizzes.map((quiz) => (
                  <option key={quiz._id} value={quiz._id}>
                    {quiz.topic || quiz.title}
                  </option>
                ))}
              </select>
              {fetchingQuizzes && <p className="text-xs text-blue-500">Loading assessments...</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-lg font-bold text-white transition-all transform hover:scale-[1.01] active:scale-95 shadow-lg ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-800 hover:bg-blue-700"
                }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                  Publishing...
                </div>
              ) : (
                "Publish Job Notification"
              )}
            </button>
          </form>

          {/* Resulting Link */}
          {generatedLink && (
            <div className="mt-8 p-6 bg-blue-50 border-2 border-dashed border-blue-200 rounded-xl">
              <h3 className="text-blue-900 font-bold mb-3 flex items-center gap-2">
                <FaCheckCircle className="text-green-500" /> Job Application Link Created
              </h3>
              <div className="flex items-center gap-2 bg-white p-2 border border-blue-200 rounded-lg shadow-sm">
                <input
                  readOnly
                  value={generatedLink}
                  className="flex-1 px-3 py-2 text-sm text-gray-600 outline-none overflow-hidden text-ellipsis"
                />
                <button
                  onClick={copyToClipboard}
                  className={`p-3 rounded-md transition-all ${copied ? "bg-green-500 text-white" : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    }`}
                  title="Copy link"
                >
                  {copied ? <FaCheckCircle /> : <FaCopy />}
                </button>
              </div>
              <p className="mt-3 text-xs text-blue-600 font-medium">
                Share this link with candidates to collect applications and track their progress.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default JobPost;