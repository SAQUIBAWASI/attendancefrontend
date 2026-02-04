import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaBriefcase, FaListUl, FaCode, FaMoneyBillWave, FaArrowRight, FaClock, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

const API_BASE = "http://localhost:5000/api";

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
