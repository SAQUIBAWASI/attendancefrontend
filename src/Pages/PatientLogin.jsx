import { useState, useEffect, useRef } from 'react';
import { FaUser, FaSmile, FaTimes, FaArrowRight, FaEnvelope, FaCheck, FaSpinner, FaVolumeUp } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import axios from 'axios';
import logo from "../Images/Timelyhealth logo.png";

const BASE_URL = API_BASE_URL.endsWith("/") ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
const cleanBaseUrl = BASE_URL.replace(/\/api\/?$/, "");

// ==================== VOICE HELPERS ====================
const getFemaleVoice = (voices) => {
  let femaleVoice = voices.find(
    (voice) =>
      voice.name.toLowerCase().includes("female") ||
      voice.name.toLowerCase().includes("woman") ||
      voice.name.toLowerCase().includes("zira") ||
      voice.name.toLowerCase().includes("samantha") ||
      voice.name.toLowerCase().includes("victoria")
  );
  if (!femaleVoice) {
    femaleVoice = voices.find((voice) => voice.lang.includes("en-IN"));
  }
  if (!femaleVoice) {
    femaleVoice = voices.find((voice) => voice.lang.includes("en-US") || voice.lang.includes("en-GB"));
  }
  if (!femaleVoice && voices.length > 0) {
    femaleVoice = voices[0];
  }
  return femaleVoice;
};

const speakWithRetry = (message, retries = 5) => {
  return new Promise((resolve) => {
    if (!("speechSynthesis" in window)) {
      resolve(false);
      return;
    }
    const trySpeak = (attempt = 0) => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0 || attempt >= retries) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(message);
        const femaleVoice = getFemaleVoice(voices);
        if (femaleVoice) {
          utterance.voice = femaleVoice;
        }
        utterance.lang = "en-IN";
        utterance.pitch = 1.2;
        utterance.rate = 0.9;
        utterance.volume = 1;
        utterance.onend = () => resolve(true);
        utterance.onerror = () => resolve(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setTimeout(() => trySpeak(attempt + 1), 300);
      }
    };
    trySpeak();
  });
};

const playSuccessSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, index) => {
      setTimeout(() => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = freq;
        oscillator.type = "sine";
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      }, index * 120);
    });
  } catch (e) {}
};

// ==================== COMPONENT ====================
const PatientLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [userName, setUserName] = useState('');
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [patientData, setPatientData] = useState(null);

  const loginButtonRef = useRef(null);
  const speechTimeoutRef = useRef(null);
  const redirectTimerRef = useRef(null);
  const welcomeTimerRef = useRef(null);

  // ---------- Clear all session data ----------
  const clearAllUserData = () => {
    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
    if (speechTimeoutRef.current) { clearTimeout(speechTimeoutRef.current); speechTimeoutRef.current = null; }
    if (redirectTimerRef.current) { clearTimeout(redirectTimerRef.current); redirectTimerRef.current = null; }
    if (welcomeTimerRef.current) { clearTimeout(welcomeTimerRef.current); welcomeTimerRef.current = null; }
    const allKeys = Object.keys(localStorage);
    const keysToKeep = ['_persist'];
    allKeys.forEach(key => { if (!keysToKeep.includes(key)) localStorage.removeItem(key); });
    try { sessionStorage.clear(); } catch (e) {}
    setUserName('');
    setShowWelcome(false);
    setError('');
    setIsLoading(false);
    setIsSpeaking(false);
    setPatientData(null);
  };

  // ---------- Speak welcome ----------
  const speakWelcome = async (name) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const message = `Welcome ${name}! You are logged in. Have a great day!`;
      await speakWithRetry(message);
    } catch (error) {
      console.error("Speech error:", error);
    }
  };

  // ---------- Go to dashboard ----------
  const goToDashboard = () => {
    setShowWelcome(false);
    if (speechTimeoutRef.current) { clearTimeout(speechTimeoutRef.current); speechTimeoutRef.current = null; }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    navigate('/patient/dashboard', { replace: true });
  };

  // ---------- Handle Login ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setError('Please enter your email');
      setIsLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        `${cleanBaseUrl}/api/patients/login`,
        { email: trimmedEmail },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (res.data && res.data.success) {
        const patient = res.data.patient || {};
        const name = patient.name || 'Patient';

        // Save to localStorage
        localStorage.setItem('patientEmail', patient.email || trimmedEmail);
        localStorage.setItem('patientName', name);
        localStorage.setItem('patientPhone', patient.phone || '');
        localStorage.setItem('userRole', 'patient');
        localStorage.setItem('userData', JSON.stringify({ ...patient, role: 'patient' }));

        setPatientData(patient);
        setUserName(name);
        setIsLoading(false);
        setShowWelcome(true);

        // Play sound + speak welcome
        playSuccessSound();
        setTimeout(async () => {
          setIsSpeaking(true);
          await speakWelcome(name);
          setIsSpeaking(false);
        }, 500);
      } else {
        setError(res.data?.message || 'Login failed');
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Login error:", err);
      const errMsg =
        err.response?.data?.message ||
        "Unable to login. Please check your email and try again.";
      setError(errMsg);
      setIsLoading(false);
    }
  };

  // ---------- Cleanup ----------
  useEffect(() => {
    return () => {
      if (speechTimeoutRef.current) { clearTimeout(speechTimeoutRef.current); speechTimeoutRef.current = null; }
      if (redirectTimerRef.current) { clearTimeout(redirectTimerRef.current); redirectTimerRef.current = null; }
      if (welcomeTimerRef.current) { clearTimeout(welcomeTimerRef.current); welcomeTimerRef.current = null; }
      if ('speechSynthesis' in window) { try { window.speechSynthesis.cancel(); } catch (e) {} }
    };
  }, []);

  // ---------- Auto-redirect after welcome popup ----------
  useEffect(() => {
    if (showWelcome) {
      if (welcomeTimerRef.current) { clearTimeout(welcomeTimerRef.current); welcomeTimerRef.current = null; }
      welcomeTimerRef.current = setTimeout(() => { goToDashboard(); }, 5000);
    }
    return () => {
      if (welcomeTimerRef.current) { clearTimeout(welcomeTimerRef.current); welcomeTimerRef.current = null; }
    };
  }, [showWelcome]);

  // ---------- Speech support check ----------
  useEffect(() => {
    if (!('speechSynthesis' in window)) setIsSpeechSupported(false);
    const resumeSpeech = () => {
      if ('speechSynthesis' in window) {
        try { window.speechSynthesis.cancel(); window.speechSynthesis.getVoices(); } catch (e) {}
      }
    };
    document.addEventListener('click', resumeSpeech);
    document.addEventListener('touchstart', resumeSpeech);
    return () => {
      document.removeEventListener('click', resumeSpeech);
      document.removeEventListener('touchstart', resumeSpeech);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">

      {/* ─── WELCOME POPUP ─── */}
      {showWelcome && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-md animate-fadeIn" onClick={goToDashboard}>
          <div
            className="relative bg-white rounded-3xl p-8 sm:p-12 max-w-md w-full mx-4 shadow-2xl animate-scaleUp border border-gray-100"
            onClick={(e) => { e.stopPropagation(); goToDashboard(); }}
          >
            <button
              onClick={(e) => { e.stopPropagation(); goToDashboard(); }}
              className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 transition-all duration-200 hover:rotate-90 group"
            >
              <FaTimes className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </button>

            <div className="relative text-center">
              <div className="relative mb-4">
                <div className="absolute -top-8 -left-8 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-r from-emerald-100 to-blue-100 rounded-full opacity-50 blur-2xl"></div>
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-emerald-400 to-blue-500 flex items-center justify-center shadow-xl shadow-emerald-500/30 animate-float">
                  <FaSmile className="w-8 h-8 text-white" />
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                Welcome, <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">{userName}</span>!
              </h2>

              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-100 border border-gray-200 text-gray-700 text-sm mb-4">
                <FaUser className="w-3 h-3" /> <span>Patient</span>
              </div>

              <p className="text-gray-600 text-sm mb-4">
                You have been successfully logged in to <strong className="text-gray-800">TimelyHealth</strong>
              </p>

              <p className="text-xs text-gray-400 mb-4 animate-pulse">⏳ Redirecting to dashboard in 5 seconds...</p>

              {isSpeechSupported && isSpeaking && (
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-4">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                  <span className="text-[8px] sm:text-[10px] text-purple-500 font-medium animate-pulse flex items-center gap-1">
                    <FaVolumeUp className="text-xs" /> Voice speaking...
                  </span>
                </div>
              )}

              <div className="w-full mt-4">
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full w-0 bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 rounded-full animate-progressFill"></div>
                </div>
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); goToDashboard(); }}
                className="mt-6 w-full py-3 rounded-xl text-white text-sm font-bold bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 transition-all duration-300 shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
              >
                Go to Dashboard <FaArrowRight className="text-xs" />
              </button>

              <p className="text-[8px] sm:text-[10px] text-gray-400 mt-3">Click anywhere to dismiss</p>
            </div>
          </div>
        </div>
      )}

      {/* ─── MAIN LOGIN CARD ─── */}
      <div className="grid w-full max-w-5xl grid-cols-1 overflow-hidden bg-white rounded-3xl shadow-2xl border border-gray-100 md:grid-cols-2">

        {/* LEFT: Login Form */}
        <div className="flex flex-col justify-center p-6 sm:p-8 md:p-12">
          <div className="mb-6 text-center">
            <img
              src={logo}
              alt="TimelyHealth"
              className="w-32 h-auto mx-auto mb-4 object-contain"
            />
            <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text">
              PATIENT LOGIN
            </h1>
            <p className="mt-1 text-sm text-gray-500">Login with your registered email</p>
          </div>

          {error && (
            <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200 flex items-start gap-2">
              <span>❌</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="email">
                Email Address
              </label>
              <div className="relative mt-1">
                <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  required
                  autoComplete="email"
                  autoFocus
                />
              </div>
              <p className="mt-1.5 text-[11px] text-gray-400">
                Use the email you used while booking your appointment
              </p>
            </div>

            <button
              ref={loginButtonRef}
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 text-white text-sm font-semibold rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <FaSpinner className="animate-spin" /> Logging in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <FaCheck /> Login
                </span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Don't have an appointment yet?{" "}
              <button
                type="button"
                onClick={() => navigate('/appointment')}
                className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
              >
                Book Now
              </button>
            </p>
            <p className="mt-3 text-xs text-gray-400">
              Patient access only · No password required
            </p>
          </div>
        </div>

        {/* RIGHT: Logo Section — TILTED */}
        <div className="hidden md:flex flex-col items-center justify-center p-10 bg-gradient-to-br from-slate-50 via-white to-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-300/40 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-300/40 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>
          <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-purple-300/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>

          <div
            className="relative z-10 w-full max-w-md bg-white rounded-3xl p-8 transition-all duration-700 hover:scale-105"
            style={{
              transform: 'rotate(-6deg)',
              boxShadow: '0 30px 60px -15px rgba(16, 185, 129, 0.35), 0 20px 40px -20px rgba(59, 130, 246, 0.35), 0 10px 20px -10px rgba(0, 0, 0, 0.15)',
            }}
          >
            <img src={logo} alt="TimelyHealth Logo" className="w-full h-auto object-contain" />
            <p className="text-center mt-4 text-sm font-medium text-gray-500 tracking-wide">
              Your Health, Our Priority
            </p>
          </div>

          <p className="relative z-10 mt-10 text-xs text-gray-500 tracking-[0.3em] uppercase font-semibold">
            Patient Portal
          </p>

          <div className="relative z-10 mt-4 flex items-center gap-2">
            <span className="w-12 h-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full"></span>
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.9) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes progressFill { 0% { width: 0%; } 30% { width: 35%; } 60% { width: 70%; } 100% { width: 100%; } }
        @keyframes float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-10px) rotate(5deg); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
        .animate-scaleUp { animation: scaleUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .animate-progressFill { animation: progressFill 2.5s ease-in-out forwards; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-spin { animation: spin 0.8s linear infinite; }
      `}</style>
    </div>
  );
};

export default PatientLogin;