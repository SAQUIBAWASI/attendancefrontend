import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import {
    FaUserGraduate, FaPhone, FaCalendarAlt, FaStar, FaEye, FaDownload,
    FaEnvelope, FaBriefcase, FaBuilding, FaMoneyBillWave,
    FaCalendarCheck, FaMapMarkerAlt, FaTimesCircle
} from "react-icons/fa";

const DetailItem = ({ icon, label, value }) => (
    <div className="flex items-start gap-3">
        <div className="mt-1 text-blue-500">{icon}</div>
        <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
            <p className="text-sm font-bold text-gray-800">{value}</p>
        </div>
    </div>
);



const JobApplicants = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [scoreFilter, setScoreFilter] = useState(0);
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE_URL}/applications/all`);
            if (res.data.success) {
                setApplications(res.data.applications);
            }
        } catch (err) {
            setError("Failed to fetch applications");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (app) => {
        setSelectedApplicant(app);
        setIsModalOpen(true);
    };

    const filteredApplications = applications.filter(app => {
        const matchesSearch = `${app.firstName} ${app.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (app.jobId?.role || "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchesScore = (app.technicalScore || 0) >= scoreFilter;
        return matchesSearch && matchesScore;
    });

    const handleUpdateScore = async (id, field, value) => {
        // Cast to number for score fields
        const numericValue = (field === "status") ? value : Number(value);

        try {
            const res = await axios.post(`${API_BASE_URL}/applications/update-score`, {
                applicationId: id,
                [field]: numericValue,
            });
            if (res.data.success) {
                setApplications((prev) =>
                    prev.map((app) => (app._id === id ? { ...app, [field]: numericValue } : app))
                );
            }
        } catch (err) {
            console.error("Update score error:", err);
        }
    };

    return (
        <div className="p-3 mx-auto bg-white rounded-lg shadow-md max-w-9xl min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        Job Applicants
                    </h1>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Score Filter */}
                    <div className="relative">
                        <select
                            className="appearance-none bg-white py-2 pl-4 pr-10 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all hover:bg-gray-50 cursor-pointer shadow-sm"
                            value={scoreFilter}
                            onChange={(e) => setScoreFilter(Number(e.target.value))}
                        >
                            <option value="0">All Scores</option>
                            <option value="60">60% & Above</option>
                            <option value="70">70% & Above</option>
                            <option value="80">80% & Above</option>
                            <option value="90">90% & Above</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                            <FaStar className="text-[10px]" />
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full md:w-72">
                        <input
                            type="text"
                            className="w-full py-2 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 transition-all border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Search name or role..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                            <FaUserGraduate className="text-sm" />
                        </div>
                    </div>
                </div>
            </div>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

            <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading Applicants...</div>
                ) : filteredApplications.length > 0 ? (
                    <table className="min-w-full">
                        <thead className="text-left text-sm text-white bg-gradient-to-r from-purple-500 to-blue-600">
                            <tr>
                                <th className="py-3 px-4 text-center">Candidate Name</th>
                                <th className="py-3 px-4 text-center">Applied Role</th>
                                <th className="py-3 px-4 text-center">Contact</th>
                                {/* <th className="py-3 px-4 text-center">Rating</th> */}
                                <th className="py-3 px-4 text-center">Assement Score (100)</th>
                                {/* <th className="py-3 px-4 text-center">Rating (10)</th> */}
                                <th className="py-3 px-4 text-center">Status</th>
                                <th className="py-3 px-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredApplications.map((app) => (
                                <tr key={app._id} className="border-b hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-sm font-medium text-center">
                                        <div className="font-bold text-gray-800">{app.firstName} {app.lastName}</div>
                                        <div className="text-[10px] text-gray-400">{new Date(app.appliedAt).toLocaleDateString()}</div>
                                    </td>
                                    <td className="p-4 text-sm font-medium text-center">
                                        <span className="inline-block px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full">
                                            {app.jobId?.role || "System Specialist"}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm font-medium text-center text-gray-600">
                                        <div className="flex flex-col items-center">
                                            <span>{app.mobile}</span>
                                        </div>
                                    </td>
                                    {/* <td className="p-4 text-sm font-medium text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <FaStar className="text-yellow-400" />
                                            <span>{app.overallRating || 0}/5</span>
                                        </div>
                                    </td> */}
                                    <td className="p-4 text-sm font-medium text-center">
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            className="w-20 p-1.5 border rounded-lg text-xs text-center focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold bg-gray-50"
                                            value={app.technicalScore || 0}
                                            onChange={(e) => handleUpdateScore(app._id, "technicalScore", e.target.value)}
                                        />
                                    </td>
                                    {/* <td className="p-4 text-sm font-medium text-center">
                                        <select
                                            className="p-1 border rounded text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={app.overallRating || 0}
                                            onChange={(e) => handleUpdateScore(app._id, "overallRating", e.target.value)}
                                        >
                                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => <option key={v} value={v}>{v}</option>)}
                                        </select>
                                    </td> */}
                                    <td className="p-4 text-sm font-medium text-center">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${app.status === 'Selected' ? 'bg-green-100 text-green-700' :
                                            app.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {(app.status || "Applied").toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm font-medium text-center">
                                        <div className="flex justify-center gap-3">
                                            <button
                                                onClick={() => handleOpenModal(app)}
                                                className="text-blue-600 hover:text-blue-800 transition flex items-center gap-1 font-bold text-xs"
                                                title="View Details"
                                            >
                                                <FaEye /> View
                                            </button>
                                            <button
                                                onClick={() => window.open(`${API_BASE_URL.replace('/api', '')}/${app.resume}`, '_blank')}
                                                className="text-gray-600 hover:text-blue-600 transition flex items-center gap-1 font-bold text-xs"
                                                title="View Resume"
                                            >
                                                <FaDownload /> Resume
                                            </button>
                                            <button
                                                onClick={() => window.location.href = "/score"}
                                                className="text-purple-600 hover:text-purple-800 transition flex items-center gap-1 font-bold text-xs"
                                                title="Score Board"
                                            >
                                                <FaStar /> Score
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                            <FaUserGraduate size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-800">No applicants yet</h3>
                        <p className="text-gray-500">New job applications will appear here once candidates apply.</p>
                    </div>
                )}
            </div>

            {/* Candidate Details Modal */}
            {isModalOpen && selectedApplicant && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 relative animate-in fade-in zoom-in duration-300">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-6 right-6 text-gray-400 hover:text-rose-500 transition-colors"
                        >
                            <FaTimesCircle size={24} />
                        </button>

                        <div className="flex items-center gap-5 mb-8 border-b border-gray-100 pb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-100">
                                {selectedApplicant.firstName.charAt(0)}{selectedApplicant.lastName.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 leading-tight">
                                    {selectedApplicant.firstName} {selectedApplicant.lastName}
                                </h2>
                                <p className="text-blue-600 text-xs font-black uppercase tracking-[0.2em] mt-1">
                                    {selectedApplicant.jobId?.role || "Position Applicant"}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                            <DetailItem icon={<FaEnvelope />} label="Email Address" value={selectedApplicant.email} />
                            <DetailItem icon={<FaPhone />} label="Mobile Number" value={selectedApplicant.mobile} />
                            <DetailItem icon={<FaBriefcase />} label="Total Experience" value={selectedApplicant.experience || "Not Provided"} />
                            <DetailItem icon={<FaBuilding />} label="Current Company" value={selectedApplicant.currentCompany || "Freelance / None"} />
                            <DetailItem icon={<FaMoneyBillWave />} label="Current salary (CTC)" value={selectedApplicant.currentCTC || "Negotiable"} />
                            <DetailItem icon={<FaMoneyBillWave />} label="Expected salary (CTC)" value={selectedApplicant.expectedCTC || "As per policy"} />
                            <DetailItem icon={<FaCalendarCheck />} label="Notice Period" value={selectedApplicant.noticePeriod || "Immediate"} />
                            <DetailItem icon={<FaMapMarkerAlt />} label="Current Location" value={selectedApplicant.currentLocation || "N/A"} />
                        </div>

                        {selectedApplicant.skills && (
                            <div className="mt-10 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Technical Skills</p>
                                <div className="flex flex-wrap gap-2">
                                    {selectedApplicant.skills.split(',').map((skill, i) => (
                                        <span key={i} className="px-3 py-1 bg-white border border-gray-200 text-gray-600 text-[10px] font-bold rounded-lg shadow-sm">
                                            {skill.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-10 flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-50">
                            <button
                                onClick={() => window.open(`${API_BASE_URL.replace('/api', '')}/${selectedApplicant.resume}`, '_blank')}
                                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
                            >
                                <FaDownload /> Download Resume
                            </button>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-all"
                            >
                                Close View
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobApplicants;
