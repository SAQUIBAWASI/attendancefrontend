import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff, FiUser } from "react-icons/fi";
import { FiAlertCircle, FiCheckCircle } from "react-icons/fi";

const CandidateLogin = () => {
    const [formData, setFormData] = useState({ email: "", password: "" });
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
            const res = await axios.post(`${API_BASE_URL}/candidate/login`, formData);
            if (res.data.token) {
                localStorage.setItem("candidateToken", res.data.token);

                // Fetch profile to get ID and Name
                const profileRes = await axios.get(`${API_BASE_URL}/candidate/profile`, {
                    headers: { Authorization: `Bearer ${res.data.token}` }
                });

                localStorage.setItem("candidateId", profileRes.data._id);
                localStorage.setItem("candidateName", profileRes.data.name);
                localStorage.setItem("userRole", "candidate");

                setMessage({ text: "Login successful! Redirecting...", type: "success" });
                setTimeout(() => navigate("/candidate-dashboard"), 1500);
            }
        } catch (err) {
            console.error("Login error:", err);
            setMessage({
                text: err.response?.data?.message || "Invalid credentials. Please try again.",
                type: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
            <div className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 overflow-hidden flex flex-col md:flex-row border border-slate-100 animate-in fade-in zoom-in duration-500">

                {/* Visual Side */}
                <div className="md:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 p-12 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15)_0%,transparent_60%)]"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-10 backdrop-blur-md border border-white/30 shadow-xl">
                            <FiUser className="text-2xl" />
                        </div>
                        <h2 className="text-4xl font-black leading-tight mb-4">
                            Step into your <br />
                            <span className="text-indigo-200">future career.</span>
                        </h2>
                        <p className="text-lg text-indigo-100/80 font-medium max-w-xs leading-relaxed">
                            Access your personalized dashboard to track applications and complete assessments.
                        </p>
                    </div>

                    <div className="relative z-10 pt-12">
                        <div className="flex -space-x-3 mb-6">
                            {[11, 12, 13, 14].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-indigo-600 bg-indigo-400 flex items-center justify-center overflow-hidden">
                                    <img src={`https://i.pravatar.cc/100?img=${i}`} alt="user" className="w-full h-full object-cover" />
                                </div>
                            ))}
                            <div className="w-10 h-10 rounded-full border-2 border-indigo-600 bg-indigo-800 flex items-center justify-center text-[10px] font-black">
                                +2k
                            </div>
                        </div>
                        <p className="text-[10px] font-black text-indigo-200/60 uppercase tracking-[0.2em]">
                            Joined by 2,000+ top candidates
                        </p>
                    </div>
                </div>

                {/* Form Side */}
                <div className="md:w-1/2 p-12 md:p-20 flex flex-col justify-center bg-white">
                    <div className="mb-12">
                        <h1 className="text-2xl font-black text-slate-800 mb-1">Candidate Login</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Enter your credentials to continue
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
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
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
                                    className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all text-sm font-medium text-slate-700 placeholder:text-slate-300 shadow-sm shadow-slate-100/50"
                                    placeholder="alex@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                                <a href="#" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700 transition-colors">Forgot?</a>
                            </div>
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
                                    className="w-full pl-11 pr-12 py-4 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all text-sm font-medium text-slate-700 placeholder:text-slate-300 shadow-sm shadow-slate-100/50"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-300 hover:text-indigo-600 transition-all"
                                >
                                    {showPassword ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-6 bg-indigo-600 text-white font-black rounded-xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:pointer-events-none group uppercase tracking-widest text-sm"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <FiArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-12 text-center text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                        Don't have an account?{" "}
                        <Link to="/candidate-register" className="text-indigo-600 font-black hover:underline underline-offset-8 transition-all">
                            Join Now
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CandidateLogin;
