import { useState, useEffect, useRef } from 'react';
import { FaEye, FaEyeSlash, FaUser, FaSmile, FaTimes, FaArrowRight, FaCamera, FaSpinner, FaCheck, FaRedo, FaExclamationTriangle, FaVolumeUp } from "react-icons/fa";
import { BsCamera } from "react-icons/bs";
import { useNavigate, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import axios from 'axios';

const BASE_URL = API_BASE_URL.endsWith("/") ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
const cleanBaseUrl = BASE_URL.replace(/\/api\/?$/, "");

const ONSITE_RADIUS_M = 50;
const ONSITE_ONLY_DEPARTMENTS = ["Laboratory Medicine", "Medical", "Nursing"];

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

const base64ToFile = (base64String, filename) => {
  try {
    const arr = base64String.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  } catch (error) {
    return null;
  }
};

const playShutterSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioContext.currentTime;
    const osc1 = audioContext.createOscillator();
    const gain1 = audioContext.createGain();
    osc1.connect(gain1);
    gain1.connect(audioContext.destination);
    osc1.frequency.value = 1500;
    osc1.type = "square";
    gain1.gain.setValueAtTime(0.05, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc1.start(now);
    osc1.stop(now + 0.05);
    const osc2 = audioContext.createOscillator();
    const gain2 = audioContext.createGain();
    osc2.connect(gain2);
    gain2.connect(audioContext.destination);
    osc2.frequency.value = 1200;
    osc2.type = "square";
    gain2.gain.setValueAtTime(0.05, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.13);
  } catch (e) {}
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

const speakCheckInSuccess = async (name) => {
  const message = `Hello ${name}! You have successfully checked in. Have a great day!`;
  return speakWithRetry(message);
};

const isToday = (date) => {
  if (!date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate.getTime() === today.getTime();
};

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Login states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [locationError, setLocationError] = useState('');
  const [locationFetched, setLocationFetched] = useState(false);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  
  // Employee data
  const [isImageCaptureAllowed, setIsImageCaptureAllowed] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [employeeEmail, setEmployeeEmail] = useState('');
  const [employeeDepartment, setEmployeeDepartment] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [assignedLocation, setAssignedLocation] = useState(null);
  const [position, setPosition] = useState(null);
  const [distance, setDistance] = useState(null);
  const [checkedIn, setCheckedIn] = useState(false);

  const [reason, setReason] = useState("");

  // Camera states
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Reason popup
  const [showReasonPopup, setShowReasonPopup] = useState(false);
  const [tempReason, setTempReason] = useState("");
  const [pendingAction, setPendingAction] = useState(null);
  const [isReasonProcessing, setIsReasonProcessing] = useState(false);

  // Success popup
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Toast
  const [toastMessage, setToastMessage] = useState(null);

  const loginButtonRef = useRef(null);
  const speechTimeoutRef = useRef(null);
  const redirectTimerRef = useRef(null);
  const welcomeTimerRef = useRef(null);

  // ─── Fetch Location ───
  const fetchLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setLocationError('Geolocation not supported');
        resolve({ lat: null, lng: null });
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLatitude(lat);
          setLongitude(lng);
          setLocationFetched(true);
          setLocationError('');
          resolve({ lat, lng });
        },
        (error) => {
          setLocationError(`Location denied: ${error.message}`);
          setLocationFetched(false);
          resolve({ lat: null, lng: null });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  };

  // ─── Get Current Location ───
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setPosition(coords);
          if (assignedLocation) {
            const dist = haversineDistance(
              coords.lat,
              coords.lng,
              assignedLocation.latitude,
              assignedLocation.longitude
            );
            setDistance(dist);
          }
          resolve(coords);
        },
        (err) => {
          reject(new Error("Error getting location: " + err.message));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  };

  // ─── Fetch Employee Assigned Location ───
  const fetchAssignedLocation = async (empId) => {
    if (!empId) return;
    try {
      const url = `${cleanBaseUrl}/api/employees/mylocation/${empId}`;
      const res = await axios.get(url);
      if (res.data) {
        let locationData = null;
        if (res.data.success && res.data.data) {
          locationData = res.data.data.location || res.data.data;
        } else if (res.data.location) {
          locationData = res.data.location;
        } else if (res.data.data) {
          locationData = res.data.data;
        } else if (res.data.latitude || res.data.coordinates) {
          locationData = res.data;
        }
        if (locationData) {
          setAssignedLocation(locationData);
        }
      }
    } catch (err) {
      console.error("Error fetching location:", err);
    }
  };

  // ─── Check today's attendance ───
  const fetchTodayAttendance = async (empId) => {
    if (!empId) return;
    try {
      const url = `${cleanBaseUrl}/api/attendance/myattendance/${empId}`;
      const res = await axios.get(url);
      const records = res.data.records || [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayRecord = records.find((rec) => {
        const checkInTime = new Date(rec.checkInTime);
        return checkInTime >= today && (rec.status === "checked-in" || rec.status === "on-break");
      });
      setCheckedIn(!!todayRecord);
    } catch (err) {
      console.error("Error fetching attendance:", err);
    }
  };

  // ─── Camera Functions ───
  const startCamera = async () => {
    try {
      setCameraError(null);
      const constraints = {
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraReady(true);
      }
    } catch (err) {
      setCameraError("Unable to access camera. Please check permissions.");
      setIsCameraReady(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraReady(false);
    setCapturedImage(null);
  };

  const handleCloseCamera = () => {
    stopCamera();
    setShowCameraModal(false);
    setCapturedImage(null);
    setIsCapturing(false);
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedImage(imageData);
    playShutterSound();
    return imageData;
  };

  // ─── Handle Capture Now ───
  const handleCaptureNow = () => {
    if (!videoRef.current || !isCameraReady) {
      alert("Camera is not ready. Please wait.");
      return;
    }
    setIsCapturing(true);
    const imageData = captureImage();
    if (imageData) {
      setTimeout(() => {
        const isOnsiteOnlyDepartment = ONSITE_ONLY_DEPARTMENTS.includes(employeeDepartment);
        if (!isOnsiteOnlyDepartment && distance > ONSITE_RADIUS_M && !reason.trim()) {
          if (!isReasonProcessing && !showReasonPopup) {
            setPendingAction("submit");
            setTempReason("");
            setShowReasonPopup(true);
            setIsCapturing(false);
          }
          return;
        }
        handleSubmitCheckIn(imageData);
      }, 300);
    } else {
      setIsCapturing(false);
      alert("Failed to capture image. Please try again.");
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setIsCapturing(false);
    if (videoRef.current && isCameraReady) {
      videoRef.current.play().catch((err) => console.error("Error resuming video:", err));
    }
  };

  // ─── Submit Check-In with Photo ───
  const handleSubmitCheckIn = async (imageData) => {
    if (!employeeId || !employeeEmail) {
      alert("Employee data missing.");
      setIsCapturing(false);
      return;
    }

    try {
      await getCurrentLocation();
    } catch (err) {
      alert("Could not get location: " + err.message);
      setIsCapturing(false);
      return;
    }

    const isOnsiteOnlyDepartment = ONSITE_ONLY_DEPARTMENTS.includes(employeeDepartment);

    if (isOnsiteOnlyDepartment && distance > ONSITE_RADIUS_M) {
      alert(`Outside office range (${distance}m). Must be within ${ONSITE_RADIUS_M}m.`);
      setIsCapturing(false);
      return;
    }

    if (!isOnsiteOnlyDepartment && distance > ONSITE_RADIUS_M && !reason.trim()) {
      if (!isReasonProcessing && !showReasonPopup) {
        setPendingAction("submit");
        setTempReason("");
        setShowReasonPopup(true);
      }
      return;
    }

    setSubmitting(true);
    try {
      const imageFile = base64ToFile(imageData, `checkin-${employeeId}-${Date.now()}.jpg`);
      if (!imageFile) {
        alert("Failed to process image.");
        setIsCapturing(false);
        setSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append("employeeId", employeeId);
      formData.append("employeeEmail", employeeEmail);
      formData.append("latitude", position.lat.toString());
      formData.append("longitude", position.lng.toString());
      formData.append("reason", isOnsiteOnlyDepartment ? "Onsite" : reason || "Onsite");
      formData.append("image", imageFile);

      await axios.post(`${cleanBaseUrl}/api/attendance/checkin`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      handleCloseCamera();
      setIsCapturing(false);
      setSuccessMessage("✅ Check-in Successful with Photo! 📸");
      setShowSuccessPopup(true);
      setCheckedIn(true);
      
      playSuccessSound();
      setTimeout(async () => {
        setIsSpeaking(true);
        await speakCheckInSuccess(employeeName);
        setIsSpeaking(false);
      }, 500);
      
      setShowWelcome(false);
      
      redirectTimerRef.current = setTimeout(() => {
        navigate('/employeedashboard', { replace: true });
      }, 2000);
      
    } catch (err) {
      alert(err.response?.data?.message || "Check-in failed.");
      setIsCapturing(false);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Reason Popup Handlers ───
  const handleReasonConfirm = () => {
    if (!tempReason.trim()) {
      alert("Please select a reason.");
      return;
    }
    setIsReasonProcessing(true);
    setReason(tempReason);
    setShowReasonPopup(false);

    setTimeout(() => {
      if (pendingAction === "submit") {
        handleSubmitCheckIn(capturedImage);
      }
      setPendingAction(null);
      setIsReasonProcessing(false);
    }, 300);
  };

  const handleReasonCancel = () => {
    setShowReasonPopup(false);
    setTempReason("");
    setPendingAction(null);
    setIsReasonProcessing(false);
  };

  // ─── Open Camera for Attendance ───
  const handleOpenCameraForAttendance = async () => {
    setShowWelcome(false);
    
    try {
      await getCurrentLocation();
    } catch (err) {
      alert("Could not get location: " + err.message);
      return;
    }

    const isOnsiteOnlyDepartment = ONSITE_ONLY_DEPARTMENTS.includes(employeeDepartment);

    if (isOnsiteOnlyDepartment && distance > ONSITE_RADIUS_M) {
      alert(`Department must be within ${ONSITE_RADIUS_M}m. Current distance: ${distance}m`);
      return;
    }

    if (!isOnsiteOnlyDepartment && distance > ONSITE_RADIUS_M) {
      setPendingAction("camera");
      setTempReason("");
      setShowReasonPopup(true);
      return;
    }

    setShowCameraModal(true);
    setTimeout(() => startCamera(), 300);
  };

  // ─── Speak Welcome ───
  const speakWelcome = (name, role) => {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        resolve();
        return;
      }
      try {
        window.speechSynthesis.cancel();
        const message = `Welcome ${name}! You are logged in as ${role}. Have a great day!`;
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        utterance.volume = 1;
        const voices = window.speechSynthesis.getVoices();
        const femaleVoice = getFemaleVoice(voices);
        if (femaleVoice) {
          utterance.voice = femaleVoice;
        }
        let isResolved = false;
        utterance.onend = () => {
          if (!isResolved) { isResolved = true; resolve(); }
        };
        utterance.onerror = () => {
          if (!isResolved) { isResolved = true; resolve(); }
        };
        setTimeout(() => {
          window.speechSynthesis.speak(utterance);
        }, 100);
        speechTimeoutRef.current = setTimeout(() => {
          if (!isResolved) { isResolved = true; resolve(); }
        }, 10000);
      } catch (error) {
        resolve();
      }
    });
  };

  // ─── Auto Redirect to Dashboard ───
  const goToDashboard = () => {
    setShowWelcome(false);
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    const role = localStorage.getItem('userRole');
    if (role === 'admin') {
      navigate('/dashboard', { replace: true });
    } else if (role === 'employee') {
      navigate('/employeedashboard', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  // ─── Check if attendance prompt should be shown ───
  const shouldShowAttendancePrompt = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && !checkedIn) {
      const role = localStorage.getItem('userRole');
      if (role === 'employee') {
        return true;
      }
    }
    return false;
  };

  // ─── Auto-login check ───
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const autoLogin = urlParams.get('autoLogin');
    const emailParam = urlParams.get('email');
    const passwordParam = urlParams.get('password');

    fetchLocation();

    if (autoLogin === 'true' && emailParam && passwordParam) {
      setEmail(emailParam);
      setPassword(passwordParam);
      setTimeout(() => {
        if (loginButtonRef.current) {
          loginButtonRef.current.click();
        }
      }, 1000);
    }
  }, [location]);

  // ─── Auto close welcome popup after 5 seconds ───
  useEffect(() => {
    if (showWelcome) {
      welcomeTimerRef.current = setTimeout(() => {
        goToDashboard();
      }, 5000);
    }
    return () => {
      if (welcomeTimerRef.current) {
        clearTimeout(welcomeTimerRef.current);
      }
    };
  }, [showWelcome]);

  // ─── Speech support ───
  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setIsSpeechSupported(false);
    }
    const resumeSpeech = () => {
      if ('speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          window.speechSynthesis.getVoices();
        } catch (e) {}
      }
    };
    document.addEventListener('click', resumeSpeech);
    document.addEventListener('touchstart', resumeSpeech);
    return () => {
      document.removeEventListener('click', resumeSpeech);
      document.removeEventListener('touchstart', resumeSpeech);
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
      if (welcomeTimerRef.current) {
        clearTimeout(welcomeTimerRef.current);
      }
      if ('speechSynthesis' in window) {
        try { window.speechSynthesis.cancel(); } catch (e) {}
      }
    };
  }, []);

  // ─── Login Submit ───
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setIsLoading(true);

    let lat = latitude;
    let lng = longitude;
    if (!locationFetched || lat === null || lng === null) {
      const locationResult = await fetchLocation();
      lat = locationResult.lat;
      lng = locationResult.lng;
    }

    try {
      // ✅ Admin Login
      const adminResponse = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const adminData = await adminResponse.json();

      if (adminResponse.ok) {
        const admin = adminData.admin || {};
        const name = admin.name || 'Admin';
        localStorage.setItem('adminToken', adminData.token);
        localStorage.setItem('userRole', 'admin');
        localStorage.setItem('adminEmail', email);
        localStorage.setItem('adminName', name);
        if (admin.id || admin._id) {
          localStorage.setItem('adminId', admin.id || admin._id);
        }
        localStorage.setItem('userData', JSON.stringify({ name, email, role: 'admin' }));
        setUserName(name);
        setUserRole('Admin');
        setIsImageCaptureAllowed(false);
        
        setIsLoading(false);
        navigate('/dashboard', { replace: true });
        return;
      }

      // ✅ Employee Login
      const empResponse = await fetch(`${API_BASE_URL}/employees/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, latitude: lat, longitude: lng }),
      });
      const empData = await empResponse.json();

      if (empResponse.ok) {
        const employee = empData.employee || {};
        const name = employee.name || 'Employee';
        const role = employee.role || employee.designation || 'Employee';
        const empId = employee.employeeId || '';
        const empEmail = employee.email || email;
        const dept = employee.department || '';
        const isAllowed = employee.isAllowedImageCapturedAttendance === true || employee.isAllowedImageCapturedAttendance === "true";

        setEmployeeId(empId);
        setEmployeeEmail(empEmail);
        setEmployeeName(name);
        setEmployeeDepartment(dept);
        setIsImageCaptureAllowed(isAllowed);

        // ✅ Check if already checked in today
        let isAlreadyCheckedIn = false;
        if (employee.lastCheckInLocation && employee.lastCheckInLocation.timestamp) {
          isAlreadyCheckedIn = isToday(employee.lastCheckInLocation.timestamp);
        }

        // ✅ Also check from attendance API
        await fetchTodayAttendance(empId);
        
        // ✅ If either says checked in, set checkedIn true
        if (isAlreadyCheckedIn) {
          setCheckedIn(true);
        }

        await fetchAssignedLocation(empId);

        const userData = {
          name, email: empEmail, employeeId: empId, role, department: dept,
          permissions: employee.permissions || [],
          isAllowedImageCapturedAttendance: isAllowed,
          lastCheckInLocation: employee.lastCheckInLocation || null
        };
        localStorage.setItem("userData", JSON.stringify(userData));
        localStorage.setItem("employeeData", JSON.stringify(userData));
        localStorage.setItem("employeeId", empId);
        localStorage.setItem("employeeEmail", empEmail);
        localStorage.setItem("employeeName", name);
        localStorage.setItem("employeeDepartment", dept);
        localStorage.setItem('userRole', 'employee');
        localStorage.setItem("isAllowedImageCapturedAttendance", String(isAllowed));
        if (empData.token) localStorage.setItem("token", empData.token);

        setUserName(name);
        setUserRole(role);

        setIsLoading(false);

        // ✅ WELCOME POPUP HAMESHA DIKHEGA!
        setShowWelcome(true);
        
        // ✅ Voice welcome
        await speakWelcome(name, role);
        
        return;
      }

      // ❌ CLIENT LOGIN REMOVED - No longer supported
      // ✅ ✅ ✅ YAHAN PE ERROR MESSAGE SHOW KARO JO API SE AAYI HAI!
      // ✅ Agar employee login fail hua toh uska error message dikhao
      if (empData && empData.message) {
        throw new Error(empData.message);
      } else {
        throw new Error('Invalid credentials - Admin or Employee login only');
      }

    } catch (err) {
      // ✅ ✅ ✅ ERROR MESSAGE UI PE SHOW KARO!
      setError(err.message); // <--- YEH UI PE ERROR DIKHAYEGA!
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">

      {/* ─── TOAST ─── */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
          <div className={`px-6 py-3 rounded-2xl shadow-2xl backdrop-blur-sm text-white font-medium text-sm flex items-center gap-2.5 border border-white/20 ${toastMessage.type === "success" ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-gradient-to-r from-red-500 to-rose-500"}`}>
            <span className="text-lg">{toastMessage.type === "success" ? "✅" : "❌"}</span>
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* ─── SUCCESS POPUP ─── */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 transform animate-scale-up border border-green-200/50">
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                  <div className="relative w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                    <span className="text-3xl">✅</span>
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900">{successMessage}</h3>
              <p className="text-sm text-gray-500 mt-1">Redirecting to dashboard...</p>
              {isSpeaking && (
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <div className="flex items-center gap-0.5">
                    <div className="w-1 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: "0s" }}></div>
                    <div className="w-1 h-3 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-1 h-4 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                    <div className="w-1 h-3 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: "0.6s" }}></div>
                    <div className="w-1 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: "0.8s" }}></div>
                  </div>
                  <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                    <FaVolumeUp className="text-xs" /> Speaking...
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── REASON POPUP ─── */}
      {showReasonPopup && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 transform animate-scale-up border border-yellow-200/50">
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
                  <div className="relative w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/30">
                    <span className="text-3xl">⚠️</span>
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Outside Office Range</h3>
              <p className="text-sm text-gray-600 mt-1">
                You are <span className="font-bold text-red-500">{distance}m</span> away from the office.
                <br />
                <span className="text-xs text-gray-500">Please select a reason for check-in.</span>
              </p>
              <div className="mt-4">
                <select
                  value={tempReason}
                  onChange={(e) => setTempReason(e.target.value)}
                  className="w-full p-3 text-sm border border-gray-200 rounded-xl bg-gray-50/50 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                >
                  <option value="">-- Select Reason --</option>
                  <option value="Field Work">📋 Field Work</option>
                  <option value="Work From Home">🏠 Work From Home</option>
                  <option value="Client Meeting">🤝 Client Meeting</option>
                  <option value="Other">📝 Other</option>
                </select>
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={handleReasonCancel}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReasonConfirm}
                  disabled={isReasonProcessing}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 shadow-lg shadow-yellow-500/30 transition-all duration-200 transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                >
                  {isReasonProcessing ? "Processing..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── CAMERA MODAL ─── */}
      {showCameraModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[95vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <FaCamera className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">📸 Check In Photo</h3>
                  <p className="text-xs text-gray-500 font-medium">For attendance verification</p>
                </div>
              </div>
              <button
                onClick={handleCloseCamera}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 hover:bg-red-50 hover:text-red-500 transition-all duration-300 shadow-md hover:shadow-lg transform hover:rotate-90"
              >
                <FaTimes className="text-gray-600 hover:text-red-500 transition-colors text-lg" />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-hidden flex flex-col">
              <div className="relative bg-black rounded-2xl overflow-hidden aspect-[4/3] flex items-center justify-center">
                {capturedImage ? (
                  <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover ${!isCameraReady ? "hidden" : ""}`}
                    />
                    {!isCameraReady && !cameraError && (
                      <div className="text-center text-white">
                        <FaSpinner className="w-10 h-10 animate-spin mx-auto mb-3 text-indigo-400" />
                        <p className="text-base font-medium">Starting camera...</p>
                      </div>
                    )}
                    {cameraError && (
                      <div className="text-center text-white p-4">
                        <FaExclamationTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                        <p className="text-sm font-medium text-red-400">{cameraError}</p>
                        <button
                          onClick={startCamera}
                          className="mt-3 px-5 py-2.5 bg-indigo-600 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
                        >
                          Retry
                        </button>
                      </div>
                    )}
                  </>
                )}
                {!capturedImage && isCameraReady && !isCapturing && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 border-2 border-white/20 rounded-2xl"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 border border-white/10 rounded-full"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-center gap-4">
                {capturedImage ? (
                  <>
                    <button onClick={handleRetake} className="px-6 py-3 rounded-xl text-sm font-medium bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors flex items-center gap-2">
                      <FaRedo className="text-base" /> Retake
                    </button>
                    <button
                      onClick={() => {
                        if (capturedImage) {
                          const isOnsiteOnlyDepartment = ONSITE_ONLY_DEPARTMENTS.includes(employeeDepartment);
                          if (!isOnsiteOnlyDepartment && distance > ONSITE_RADIUS_M && !reason.trim()) {
                            if (!isReasonProcessing && !showReasonPopup) {
                              setPendingAction("submit");
                              setTempReason("");
                              setShowReasonPopup(true);
                              setIsCapturing(false);
                            }
                            return;
                          }
                          handleSubmitCheckIn(capturedImage);
                        }
                      }}
                      disabled={submitting}
                      className="px-8 py-3 rounded-xl text-base font-bold text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/30 transition-all duration-200 flex items-center gap-3 disabled:opacity-50"
                    >
                      {submitting ? <FaSpinner className="animate-spin text-lg" /> : <FaCheck className="text-lg" />}
                      Submit
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={handleCloseCamera} className="px-6 py-3 rounded-xl text-sm font-medium bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors">
                      Cancel
                    </button>
                    <button
                      onClick={handleCaptureNow}
                      disabled={!isCameraReady || isCapturing}
                      className="relative px-10 py-3 rounded-xl text-base font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg shadow-indigo-500/30 transition-all duration-200 flex items-center gap-3 disabled:opacity-50"
                    >
                      {isCapturing ? (
                        <><FaSpinner className="animate-spin text-lg" /> Capturing...</>
                      ) : (
                        <><BsCamera className="text-lg" /> Capture Now</>
                      )}
                    </button>
                  </>
                )}
              </div>

              <div className="mt-3 text-center">
                <p className="text-xs text-gray-400 font-medium">
                  {capturedImage ? "✅ Photo captured! Click Submit to continue." : "📸 Click 'Capture Now' to take a photo instantly"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── HIDDEN CANVAS ─── */}
      <canvas ref={canvasRef} className="hidden" />

      {/* ─── LOCATION STATUS ─── */}
      <div className="fixed top-4 right-4 z-50">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
          locationFetched && latitude !== null && longitude !== null
            ? 'bg-green-100 text-green-700 border border-green-200'
            : locationError
            ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
            : 'bg-gray-100 text-gray-600 border border-gray-200'
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            locationFetched && latitude !== null && longitude !== null
              ? 'bg-green-500 animate-pulse'
              : locationError
              ? 'bg-yellow-500'
              : 'bg-gray-400'
          }`}></span>
          {locationFetched && latitude !== null && longitude !== null
            ? `📍 ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
            : locationError
            ? '⚠️ Location off'
            : '⏳ Fetching location...'}
        </div>
      </div>

      {/* ─── WELCOME POPUP ─── ✅ HAMESHA DIKHEGA! */}
      {showWelcome && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-md animate-fadeIn" 
          onClick={goToDashboard}
        >
          <div 
            className="relative bg-white rounded-3xl p-8 sm:p-12 max-w-md w-full mx-4 shadow-2xl animate-scaleUp border border-gray-100"
            onClick={(e) => {
              e.stopPropagation();
              goToDashboard();
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToDashboard();
              }}
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
                <FaUser className="w-3 h-3" /> <span>{userRole}</span>
              </div>

              <p className="text-gray-600 text-sm mb-4">
                You have been successfully logged in to <strong className="text-gray-800">INGRAIN'S TMS</strong>
              </p>

              <p className="text-xs text-gray-400 mb-4 animate-pulse">
                ⏳ Redirecting to dashboard in 5 seconds...
              </p>

              {isSpeechSupported && (
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-4">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                  <span className="text-[8px] sm:text-[10px] text-purple-500 font-medium animate-pulse">🔊 Voice speaking...</span>
                </div>
              )}

              {/* ─── ATTENDANCE PROMPT ─── ✅ Show when NOT checked in */}
              {!checkedIn && isImageCaptureAllowed && shouldShowAttendancePrompt() && (
                <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 flex-shrink-0">
                      <FaCamera className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-800">📸 Mark Attendance with Photo</p>
                      <p className="text-xs text-gray-500">Capture photo & check in instantly</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenCameraForAttendance();
                      }}
                      className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-300 shadow-md shadow-indigo-500/30 flex items-center justify-center gap-2"
                    >
                      <FaCamera className="w-4 h-4" /> 📸 Capture & Check In
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        goToDashboard();
                      }}
                      className="px-4 py-2.5 rounded-xl text-gray-500 text-sm font-medium hover:bg-gray-100 transition-all duration-200"
                    >
                      Skip
                    </button>
                  </div>
                </div>
              )}

              <div className="w-full mt-4">
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full w-0 bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 rounded-full animate-progressFill"></div>
                </div>
              </div>

              <p className="text-[8px] sm:text-[10px] text-gray-400 mt-3">Click anywhere to dismiss</p>
            </div>
          </div>
        </div>
      )}

      {/* ─── LOGIN CARD ─── */}
      <div className="grid w-full max-w-5xl grid-cols-1 overflow-hidden bg-white rounded-3xl shadow-2xl border border-gray-100 md:grid-cols-2">

        <div className="flex flex-col justify-center p-6 sm:p-8 md:p-12">
          <div className="mb-6 text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-blue-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <span className="text-2xl text-white font-bold">🚀</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text">LOG IN</h1>
            <p className="mt-1 text-sm text-gray-500">Admin / Employee Login</p>
          </div>

          {/* ✅ ERROR MESSAGE UI PE SHOW HOGA! */}
          {error && (
            <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
              ❌ {error}
            </div>
          )}

          {locationError && !error && (
            <div className="p-2 mb-3 text-xs text-yellow-700 bg-yellow-50 rounded-lg border border-yellow-200 flex items-center gap-2">
              <span>⚠️</span> {locationError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full px-4 py-3 mt-1 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <button type="button" onClick={() => navigate('/forgot-password')} className="text-sm text-emerald-600 hover:text-emerald-700 transition-colors">Forgot Password?</button>
              </div>
              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-10 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 flex items-center text-gray-400 right-3 hover:text-gray-600 focus:outline-none transition-colors"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              ref={loginButtonRef}
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 text-white text-sm font-semibold rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Verifying...
                </span>
              ) : ('Login')}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">Employee? Use your registered email</p>
            <p className="mt-2 text-xs text-gray-400">Admin / Employee access only</p>
          </div>
        </div>

        <div className="hidden md:flex items-center justify-center p-8 bg-gradient-to-br from-emerald-50/50 to-blue-50/50">
          <img src="https://t3.ftcdn.net/jpg/04/72/65/82/360_F_472658260_9eT6d4HzAt7lDZ8d5SAb5opOZikRH7AC.jpg" alt="Login Illustration" className="relative object-contain h-auto max-w-full rounded-2xl shadow-lg" />
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.9) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes scale-up { from { opacity: 0; transform: scale(0.9) translateY(15px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes progressFill { 0% { width: 0%; } 30% { width: 35%; } 60% { width: 70%; } 100% { width: 100%; } }
        @keyframes float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-10px) rotate(5deg); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.4s ease-out; }
        .animate-scaleUp { animation: scaleUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .animate-scale-up { animation: scale-up 0.35s ease-out; }
        .animate-progressFill { animation: progressFill 2.5s ease-in-out forwards; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-spin { animation: spin 0.8s linear infinite; }
        .z-60 { z-index: 60; }
      `}</style>
    </div>
  );
};

export default LoginPage;