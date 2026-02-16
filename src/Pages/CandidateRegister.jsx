import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE_URL } from "../config";
import {
    FiUser, FiMail, FiLock, FiPhone, FiMapPin,
    FiArrowRight, FiEye, FiEyeOff, FiBriefcase, FiLayers
} from "react-icons/fi";
import { FiAlertCircle, FiCheckCircle } from "react-icons/fi";

const CandidateRegister = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        skills: "",
        experience: "",
        address: "",
        currentCompany: "",
        currentCTC: "",
        expectedCTC: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: "", type: "" });

        try {
            const res = await axios.post(`${API_BASE_URL}/candidate/register`, formData);
            if (res.data.token) {
                setMessage({ text: "Registration successful! Redirecting to login...", type: "success" });
                setTimeout(() => navigate("/candidate-login"), 2000);
            }
        } catch (err) {
            console.error("Registration error:", err);
            setMessage({
                text: err.response?.data?.message || "Registration failed. Please try again.",
                type: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
            <div className="w-full max-w-6xl bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 overflow-hidden flex flex-col md:flex-row border border-slate-100 animate-in fade-in zoom-in duration-500">

                {/* Visual Side */}
                <div className="md:w-5/12 bg-indigo-600 p-12 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at -20% -20%,rgba(255,255,255,0.2)_0%,transparent_60%)]"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-10 backdrop-blur-md border border-white/30 shadow-xl">
                            <FiUser className="text-2xl" />
                        </div>
                        <h2 className="text-4xl font-black leading-tight mb-4">
                            Build your <br />
                            <span className="text-indigo-200">professional profile.</span>
                        </h2>
                        <p className="text-lg text-indigo-100/80 font-medium leading-relaxed">
                            Join our talent community and land your dream job at Timely Health.
                        </p>
                    </div>

                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center gap-4 group">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-all">
                                <FiCheckCircle className="text-indigo-200" />
                            </div>
                            <span className="text-xs font-bold text-indigo-100 uppercase tracking-wider">Quick 1-minute setup</span>
                        </div>
                        <div className="flex items-center gap-4 group">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-all">
                                <FiCheckCircle className="text-indigo-200" />
                            </div>
                            <span className="text-xs font-bold text-indigo-100 uppercase tracking-wider">Apply with one click</span>
                        </div>
                    </div>
                </div>

                {/* Form Side */}
                <div className="md:w-7/12 p-12 md:p-16 flex flex-col justify-center overflow-y-auto max-h-[90vh] no-scrollbar bg-white">
                    <div className="mb-12">
                        <h1 className="text-2xl font-black text-slate-800 mb-1">Create Account</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Join the elite talent pool
                        </p>
                    </div>

                    {message.text && (
                        <div className={`mb-8 p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 border ${message.type === "success"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : "bg-rose-50 text-rose-600 border-rose-100"
                            }`}>
                            {message.type === "success" ? <FiCheckCircle className="text-lg shrink-0" /> : <FiAlertCircle className="text-lg shrink-0" />}
                            <span className="text-sm font-bold">{message.text}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-[10px]">Full Name</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-indigo-600 transition-colors">
                                        <FiUser className="text-lg" />
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all text-sm font-medium text-slate-700 placeholder:text-slate-300 shadow-sm shadow-slate-100/50"
                                        placeholder="Alex Johnson"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-indigo-600 transition-colors">
                                        <FiMail className="text-lg" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all text-sm font-medium text-slate-700 placeholder:text-slate-300 shadow-sm shadow-slate-100/50"
                                        placeholder="alex@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-indigo-600 transition-colors">
                                        <FiPhone className="text-lg" />
                                    </div>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all text-sm font-medium text-slate-700 placeholder:text-slate-300 shadow-sm shadow-slate-100/50"
                                        placeholder="+1 234 567 890"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-indigo-600 transition-colors">
                                        <FiLock className="text-lg" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-11 pr-12 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all text-sm font-medium text-slate-700 placeholder:text-slate-300 shadow-sm shadow-slate-100/50"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-300 hover:text-indigo-600"
                                    >
                                        {showPassword ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location / Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-indigo-600 transition-colors">
                                    <FiMapPin className="text-lg" />
                                </div>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all text-sm font-medium text-slate-700 placeholder:text-slate-300 shadow-sm shadow-slate-100/50"
                                    placeholder="City, Country"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Experience (Years)</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-indigo-600 transition-colors">
                                        <FiBriefcase className="text-lg" />
                                    </div>
                                    <input
                                        type="text"
                                        name="experience"
                                        value={formData.experience}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl border-dashed focus:bg-white focus:border-solid focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all text-sm font-medium text-slate-700"
                                        placeholder="e.g. 5 Years"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Key Skills</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-indigo-600 transition-colors">
                                        <FiLayers className="text-lg" />
                                    </div>
                                    <input
                                        type="text"
                                        name="skills"
                                        value={formData.skills}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl border-dashed focus:bg-white focus:border-solid focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all text-sm font-medium text-slate-700"
                                        placeholder="React, Node.js, AWS"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-6 bg-indigo-600 text-white font-black rounded-xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:pointer-events-none group mt-6 uppercase tracking-widest text-sm"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Create Account</span>
                                    <FiArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-10 text-center text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                        Already have an account?{" "}
                        <Link to="/candidate-login" className="text-indigo-600 font-black hover:underline underline-offset-8 transition-all">
                            Log In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CandidateRegister;
