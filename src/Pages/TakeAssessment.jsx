import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaClock, FaCheckCircle, FaExclamationTriangle, FaArrowRight, FaArrowLeft, FaTasks } from "react-icons/fa";
import { API_BASE_URL } from "../config";

const TakeAssessment = () => {
    const { jobId, applicationId, quizId } = useParams();
    const navigate = useNavigate();

    const [quiz, setQuiz] = useState(null);
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
                        setTimeLeft(assessment.duration * 60);
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
    }, [timeLeft, isSubmitted, quiz]);

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

        quiz.questions.forEach((q, index) => {
            const questionMarks = q.marks || 1;
            totalRawMarks += questionMarks;
            if (answers[index] === q.correctAnswer) {
                rawScore += questionMarks;
            }
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
                targetTotal: targetTotal
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
            <div className="text-center space-y-4">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-indigo-900 font-black uppercase tracking-widest text-xs">Initializing Secure Environment...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
            <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl border border-rose-100 text-center">
                <FaExclamationTriangle className="text-5xl text-rose-500 mx-auto mb-6" />
                <h2 className="text-2xl font-black text-gray-800 mb-2">Access Denied</h2>
                <p className="text-gray-500 mb-8 font-medium">{error}</p>
                <button onClick={() => navigate(-1)} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all">
                    Return to Job Details
                </button>
            </div>
        </div>
    );

    if (isSubmitted) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
            <div className="max-w-xl w-full bg-white p-12 rounded-[3rem] shadow-2xl border border-gray-100 text-center">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-100">
                    <FaCheckCircle className="text-4xl" />
                </div>
                <h2 className="text-3xl font-black text-gray-800 mb-4 tracking-tight">Assessment Completed!</h2>
                <p className="text-gray-500 mb-10 font-medium leading-relaxed">
                    Your responses have been securely recorded. Our recruitment team will review your performance and reach out shortly.
                </p>

                {/* Score hidden as per user request */}
                {/* <div className="bg-gray-50 p-8 rounded-[2rem] mb-10 border border-gray-100">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Your Performance Record</div>
                    <div className="text-4xl font-black text-indigo-600">
                        {score} <span className="text-sm text-gray-400 font-bold uppercase tracking-widest">/ 100 Marks</span>
                    </div>
                </div> */}

                <button
                    onClick={() => navigate('/candidate-dashboard')}
                    className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-lg hover:bg-indigo-700 hover:shadow-2xl shadow-indigo-100 transition-all active:scale-95"
                >
                    Return to Homepage
                </button>
            </div>
        </div>
    );

    if (showInstructions) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
            <div className="max-w-2xl w-full bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-gray-100">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
                        <FaTasks className="text-2xl" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-800 tracking-tight">Assessment Instructions</h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Read carefully before starting</p>
                    </div>
                </div>

                <div className="space-y-6 mb-10">
                    <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <p className="text-emerald-800 font-bold leading-relaxed">
                            Thank you for applying! We're excited to evaluate your skills for this position.
                        </p>
                    </div>

                    <div className="space-y-4 text-gray-600">
                        <div className="flex gap-4 items-start">
                            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">1</div>
                            <p className="text-sm font-medium">This is a Multiple Choice Question (MCQ) assessment. Each question will have 4 options.</p>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">2</div>
                            <p className="text-sm font-medium">Select the most appropriate answer. There is <span className="text-indigo-600 font-black italic underline">no negative marking</span> for incorrect answers.</p>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">3</div>
                            <p className="text-sm font-medium">After choosing an answer, click <span className="font-black text-gray-800">"Next"</span> to proceed. You can also go back to previous questions.</p>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">4</div>
                            <p className="text-sm font-medium">Upon answering all questions, click <span className="font-black text-emerald-600">"Finish Assessment"</span> to submit your final responses.</p>
                        </div>
                    </div>

                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-center gap-3">
                        <FaClock className="text-amber-500 animate-pulse" />
                        <span className="text-xs font-bold text-amber-700">The timer ({quiz?.duration || 0} mins) will start once you click the button below.</span>
                    </div>
                </div>

                <button
                    onClick={() => setShowInstructions(false)}
                    className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 hover:shadow-2xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 group"
                >
                    Start Assessment Now
                    <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );

    const currentQuestion = quiz.questions[currentQuestionIndex];

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-12">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-50 px-4 py-6 shadow-sm">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
                            <FaTasks className="text-xl" />
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-gray-800 tracking-tight">{quiz.title}</h1>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Candidate Assessment Phase</p>
                        </div>
                    </div>

                    <div className={`px-6 py-3 rounded-2xl border flex items-center gap-3 transition-colors ${timeLeft < 60 ? "bg-rose-50 border-rose-100 text-rose-600" : "bg-indigo-50 border-indigo-100 text-indigo-600"
                        }`}>
                        <FaClock className={timeLeft < 60 ? "animate-pulse" : ""} />
                        <span className="font-black tabular-nums">{formatTime(timeLeft)}</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-3xl mx-auto px-4 mt-12">
                {/* Progress Bar */}
                <div className="mb-10 space-y-3">
                    <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{Math.round(((currentQuestionIndex + 1) / quiz.questions.length) * 100)}% Complete</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-50 shadow-inner">
                        <div
                            className="h-full bg-indigo-600 rounded-full transition-all duration-500 shadow-sm"
                            style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Question Card */}
                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-900/5 border border-gray-100 p-8 md:p-12 overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
                    <div className="mb-10">
                        <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">Prompt</div>
                        <h2 className="text-xl md:text-2xl font-black text-gray-800 leading-tight">
                            {currentQuestion.questionText}
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {currentQuestion.options.map((option, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleOptionSelect(option)}
                                className={`w-full text-left p-6 rounded-2xl border-2 transition-all flex items-center justify-between group ${answers[currentQuestionIndex] === option
                                    ? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100 scale-[1.02]"
                                    : "bg-white border-gray-100 text-gray-600 hover:border-indigo-200 hover:bg-indigo-50/30"
                                    }`}
                            >
                                <span className="font-bold">{option}</span>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${answers[currentQuestionIndex] === option
                                    ? "bg-white border-white text-indigo-600"
                                    : "border-gray-100 group-hover:border-indigo-300"
                                    }`}>
                                    {answers[currentQuestionIndex] === option && <FaCheckCircle className="text-xs" />}
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-50 flex items-center justify-between gap-4">
                        <button
                            disabled={currentQuestionIndex === 0}
                            onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                            className="flex items-center gap-2 px-6 py-4 rounded-xl font-black text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all disabled:opacity-0"
                        >
                            <FaArrowLeft /> Previous
                        </button>

                        {currentQuestionIndex === quiz.questions.length - 1 ? (
                            <button
                                onClick={handleSubmit}
                                disabled={!answers[currentQuestionIndex]}
                                className="flex items-center gap-3 px-10 py-4 bg-emerald-600 text-white rounded-xl font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all transform active:scale-90 disabled:bg-gray-200 disabled:shadow-none"
                            >
                                Finish Assessment <FaCheckCircle />
                            </button>
                        ) : (
                            <button
                                disabled={!answers[currentQuestionIndex]}
                                onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                                className="flex items-center gap-3 px-10 py-4 bg-indigo-600 text-white rounded-xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all transform active:scale-90 disabled:bg-gray-200 disabled:shadow-none"
                            >
                                Next Question <FaArrowRight />
                            </button>
                        )}
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
