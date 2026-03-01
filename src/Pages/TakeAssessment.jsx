import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaClock, FaCheckCircle, FaExclamationTriangle, FaArrowRight, FaArrowLeft, FaTasks } from "react-icons/fa";
import { FiCheckCircle } from "react-icons/fi";
import { API_BASE_URL } from "../config";

const TakeAssessment = () => {
    const { jobId, applicationId, quizId } = useParams();
    const navigate = useNavigate();

    const [quiz, setQuiz] = useState(null);
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [showInstructions, setShowInstructions] = useState(true);

    useEffect(() => {
        const fetchAssessment = async () => {
            try {
                // First try to get application details by ID
                let myApp = null;
                try {
                    const appRes = await axios.get(`${API_BASE_URL}/applications/get/${applicationId}`);
                    myApp = appRes.data.application;
                } catch (err) {
                    console.warn("Fetch application by ID failed, trying fallback...", err);
                    // Fallback: If ID fetch fails, try to find it in all applications (last resort)
                    const allAppRes = await axios.get(`${API_BASE_URL}/applications/all`);
                    myApp = allAppRes.data.applications.find(a => a._id === applicationId);
                }

                let targetAssessmentId = quizId || myApp?.assignedAssessmentId?._id || myApp?.assignedAssessmentId;

                // If not assigned explicitly and no quizId in URL, get from job details
                if (!targetAssessmentId) {
                    const jobRes = await axios.get(`${API_BASE_URL}/jobs/view/${jobId}`);
                    if (jobRes.data.success) {
                        const job = jobRes.data.jobPost;
                        // Use first assessment from array or the single assessmentId (if it exists)
                        targetAssessmentId = job.assessmentIds?.[0]?._id || job.assessmentIds?.[0] || job.assessmentId?._id || job.assessmentId;
                    }
                }

                if (targetAssessmentId) {
                    // Now get the quiz details
                    const quizRes = await axios.get(`${API_BASE_URL}/admin/getallquizes`);
                    const assessment = quizRes.data.quizzes.find(q => q._id === targetAssessmentId);

                    if (assessment) {
                        setQuiz(assessment);
                        setApplication(myApp);
                        // Fix Timer Initialization: Ensure duration exists and is set correctly
                        const durationInSeconds = (assessment.duration || 30) * 60;
                        setTimeLeft(durationInSeconds);
                    } else {
                        setError("Assessment not found.");
                    }
                } else {
                    setError("No assessment linked to this application.");
                }
            } catch (err) {
                setError("Failed to load assessment.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAssessment();
    }, [jobId, applicationId, quizId]);

    useEffect(() => {
        if (timeLeft > 0 && !isSubmitted && !showInstructions) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && quiz && !isSubmitted && !showInstructions) {
            handleSubmit();
        }
    }, [timeLeft, isSubmitted, quiz, showInstructions]); // Added showInstructions to fix timer start issue

    const handleOptionSelect = (option) => {
        setAnswers({
            ...answers,
            [currentQuestionIndex]: option
        });
    };

    const handleSubmit = async () => {
        if (isSubmitted) return;

        let rawScore = 0;
        let totalRawMarks = 0;

        const detailedAnswers = quiz.questions.map((q, index) => {
            const questionMarks = q.marks || 1;
            const selectedOption = answers[index] || "Not Answered";
            const isCorrect = selectedOption === q.correctAnswer;

            if (isCorrect) {
                rawScore += questionMarks;
            }
            totalRawMarks += questionMarks;

            return {
                questionText: q.questionText,
                options: q.options || [],
                selectedOption,
                correctAnswer: q.correctAnswer,
                isCorrect,
                marks: questionMarks
            };
        });

        // Scoring Logic: Always scaled to 100 marks as per user clarification
        const totalQuestions = quiz.questions.length;
        const targetTotal = 100;

        let scaledScore = 0;
        if (totalRawMarks > 0) {
            scaledScore = Math.round((rawScore / totalRawMarks) * targetTotal);
        }

        setScore(scaledScore);
        setIsSubmitted(true);

        try {
            await axios.post(`${API_BASE_URL}/applications/update-score`, {
                applicationId,
                technicalScore: scaledScore.toString(),
                overallRating: ((scaledScore / targetTotal) * 5).toFixed(1),
                comment: `Candidate completed online assessment "${quiz.title}". Score: ${scaledScore}/${targetTotal} (Raw: ${rawScore}/${totalRawMarks})`
            });

            // Also update assessmentResults in JobApplication
            await axios.post(`${API_BASE_URL}/applications/submit-assessment`, {
                applicationId,
                quizId: quiz._id,
                score: scaledScore,
                totalQuestions: totalQuestions,
                targetTotal: targetTotal,
                answers: detailedAnswers // Send full answer details
            });

        } catch (err) {
            console.error("Failed to save score:", err);
            // Even if save fails, we show the success screen to candidate
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 font-sans">
            <div className="text-center space-y-6">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-100 rounded-2xl animate-pulse"></div>
                    <div className="absolute inset-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-2xl animate-spin mx-auto"></div>
                </div>
                <p className="text-blue-400 font-bold uppercase tracking-[0.3em] text-[10px] animate-pulse">Initializing Portal Environment...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4 font-sans">
            <div className="max-w-md w-full bg-white p-12 rounded-2xl shadow-2xl shadow-blue-950/10 border border-blue-50 text-center">
                <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <FaExclamationTriangle className="text-3xl" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Access Denied</h2>
                <p className="text-gray-500 mb-10 font-medium leading-relaxed">{error}</p>
                <button
                    onClick={() => navigate(-1)}
                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-black text-sm hover:bg-blue-700 transition-all hover:shadow-xl shadow-blue-100 transform active:scale-95 uppercase tracking-widest"
                >
                    Return to Careers
                </button>
            </div>
        </div>
    );

    if (isSubmitted) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4 font-sans text-slate-800">
            <div className="max-w-xl w-full bg-white p-12 rounded-2xl shadow-2xl shadow-blue-900/10 border border-blue-50 text-center">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-900/5">
                    <FaCheckCircle className="text-4xl" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Assessment Completed!</h2>
                <p className="text-gray-500 mb-10 font-bold leading-relaxed">
                    Thank you {application?.firstName || "Candidate"}. Your responses have been securely recorded. Our recruitment team will review your performance and reach out shortly.
                </p>

                <button
                    onClick={() => navigate('/candidate-dashboard')}
                    className="w-full py-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-black text-sm hover:shadow-2xl shadow-blue-100 transition-all active:scale-95 uppercase tracking-widest"
                >
                    Return to Homepage
                </button>
            </div>
        </div>
    );

    if (showInstructions) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4 font-sans text-slate-800">
            <div className="max-w-2xl w-full bg-white p-8 md:p-12 rounded-2xl shadow-2xl shadow-blue-900/10 border border-blue-50">
                <div className="flex items-center gap-5 mb-10">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
                        <FaTasks className="text-2xl" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Assessment Instructions</h2>
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Read carefully before starting</p>
                    </div>
                </div>

                <div className="space-y-8 mb-12">
                    <div className="p-6 bg-blue-50 text-blue-700 rounded-2xl border border-blue-100 font-black text-sm">
                        Hello {application?.firstName || "Candidate"}! We're excited to evaluate your skills for the {quiz?.title} phase.
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { id: 1, text: "Multiple Choice Question (MCQ) format with 5 unique options." },
                            { id: 2, text: "No negative marking. Feel free to attempt all questions." },
                            { id: 3, text: "Click \"Next\" to proceed. You can revisit previous questions." },
                            { id: 4, text: "Click \"Finish\" once all questions are correctly answered." }
                        ].map(item => (
                            <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100/50">
                                <div className="w-6 h-6 rounded-lg bg-white text-blue-600 flex items-center justify-center font-black text-[10px] shadow-sm shrink-0">{item.id}</div>
                                <p className="text-[11px] font-bold text-gray-600 leading-normal">{item.text}</p>
                            </div>
                        ))}
                    </div>

                    <div className="p-5 bg-amber-50 rounded-xl border border-amber-100 flex items-center gap-4">
                        <FaClock className="text-amber-500 text-xl animate-pulse" />
                        <span className="text-[11px] font-black text-amber-800 uppercase tracking-tight">
                            The timer ({quiz?.duration || 0} mins) will start once you click start.
                        </span>
                    </div>
                </div>

                <button
                    onClick={() => setShowInstructions(false)}
                    className="w-full py-5 bg-blue-600 text-white rounded-xl font-black text-sm hover:bg-blue-700 hover:shadow-2xl shadow-blue-100 transition-all flex items-center justify-center gap-3 group uppercase tracking-widest"
                >
                    Start Assessment Now
                    <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );

    const currentQuestion = quiz.questions[currentQuestionIndex];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 font-sans pb-12 text-gray-800">
            {/* Responsive Header - Optimized for Mobile/Tablet */}
            <div className="bg-gradient-to-r from-purple-500 to-blue-600 sticky top-0 z-50 px-4 py-3 md:py-4 shadow-lg">
                <div className="max-w-5xl mx-auto flex flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2 md:gap-4 min-w-0">
                        <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 bg-white/20 backdrop-blur-md text-white rounded-lg flex items-center justify-center border border-white/30">
                            <FaTasks className="text-sm md:text-lg" />
                        </div>
                        <div className="truncate">
                            <h1 className="text-xs md:text-base font-bold text-white tracking-tight truncate leading-tight">
                                {application?.firstName || "Hello"}, {quiz.title}
                            </h1>
                            <p className="hidden xs:block text-[9px] md:text-[10px] font-medium text-blue-100 uppercase tracking-widest opacity-80 truncate">Assignment Phase</p>
                        </div>
                    </div>

                    <div className={`shrink-0 px-3 py-1.5 md:px-5 md:py-2 rounded-lg border flex items-center gap-2 md:gap-3 transition-all duration-500 shadow-sm ${timeLeft < 60 ? "bg-red-500 border-red-400 text-white animate-pulse" : "bg-white/10 border-white/20 text-white"
                        }`}>
                        <FaClock className="text-xs md:text-sm" />
                        <span className="font-bold tabular-nums text-xs md:text-sm">{formatTime(timeLeft)}</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-3xl mx-auto px-4 mt-6 md:mt-10">
                {/* Progress Bar */}
                <div className="mb-6 md:mb-8 space-y-2 md:space-y-3">
                    <div className="flex justify-between items-end">
                        <span className="text-[9px] md:text-[10px] font-bold text-blue-600 uppercase tracking-widest">Question {currentQuestionIndex + 1} / {quiz.questions.length}</span>
                        <span className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">{Math.round(((currentQuestionIndex + 1) / quiz.questions.length) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-white rounded-full overflow-hidden p-0.5 border border-gray-200 shadow-sm">
                        <div
                            className="h-full bg-gradient-to-r from-purple-500 to-blue-600 rounded-full transition-all duration-1000"
                            style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Question Card - Matches UserActivity sleekness */}
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5 md:p-8 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                    <div className="mb-5 md:mb-6">
                        <div className="text-[8px] md:text-[9px] font-bold text-blue-500 uppercase tracking-[0.2em] mb-1 md:mb-2">Current Question</div>
                        <h2 className="text-base md:text-lg font-bold text-gray-800 leading-snug">
                            {currentQuestion.questionText}
                        </h2>
                    </div>

                    <div className="space-y-2">
                        {currentQuestion.options.map((option, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleOptionSelect(option)}
                                className={`w-full text-left px-4 py-3 md:px-5 md:py-3.5 rounded-lg border transition-all flex items-center justify-between group ${answers[currentQuestionIndex] === option
                                    ? "bg-blue-50 border-blue-500 text-blue-700 shadow-sm"
                                    : "bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50/20"
                                    }`}
                            >
                                <span className="font-semibold text-[11px] md:text-xs leading-tight">{option}</span>
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-3 transition-all ${answers[currentQuestionIndex] === option
                                    ? "bg-blue-600 border-blue-600 text-white"
                                    : "border-gray-200 group-hover:border-blue-300"
                                    }`}>
                                    {answers[currentQuestionIndex] === option && <FiCheckCircle className="text-[8px]" />}
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Responsive Navigation Buttons */}
                    <div className="mt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-between">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <button
                                disabled={currentQuestionIndex === 0}
                                onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 md:py-3 rounded-lg font-bold text-[10px] md:text-xs uppercase tracking-wider text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all disabled:opacity-0 active:scale-95 border border-transparent hover:border-blue-100"
                            >
                                <FaArrowLeft /> Back
                            </button>
                        </div>

                        <div className="w-full sm:w-auto">
                            {currentQuestionIndex === quiz.questions.length - 1 ? (
                                <button
                                    onClick={handleSubmit}
                                    disabled={!answers[currentQuestionIndex]}
                                    className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-3 md:py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-bold text-[11px] md:text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all transform active:scale-95 disabled:bg-gray-200 disabled:shadow-none"
                                >
                                    Finish Assessment <FaCheckCircle />
                                </button>
                            ) : (
                                <button
                                    disabled={!answers[currentQuestionIndex]}
                                    onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                                    className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-3 md:py-3.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg font-bold text-[11px] md:text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all transform active:scale-95 disabled:bg-gray-200 disabled:shadow-none"
                                >
                                    Next Question <FaArrowRight />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Security Alert */}
                <div className="mt-8 flex items-center justify-center gap-2 text-[9px] font-black text-gray-300 uppercase tracking-widest">
                    <FaExclamationTriangle className="text-amber-400" /> Secure SSL Environment Active - Do Not Close Browser
                </div>
            </div>
        </div>
    );
};

export default TakeAssessment;
