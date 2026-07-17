// src/components/AttendanceByID.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaCheckCircle, 
  FaTimes, 
  FaSpinner,
  FaArrowLeft,
  FaRocket,
  FaSearch,
  FaVolumeUp,
  FaNetworkWired,
  FaExclamationTriangle,
  FaShieldAlt,
  FaThumbsUp,
  FaRegSmile,
  FaRegSadTear,
  FaCheck,
  FaRegHandPeace
} from 'react-icons/fa';
import { API_BASE_URL } from '../config';

const BASE_URL = API_BASE_URL.endsWith("/") ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
const cleanBaseUrl = BASE_URL.replace(/\/api\/?$/, "");

export default function AttendanceByID() {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  
  // ─── STATES ───
  const [employeeId, setEmployeeId] = useState('');
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [successIcon, setSuccessIcon] = useState(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [position, setPosition] = useState(null);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  // ─── IP VALIDATION STATES ───
  const [publicIP, setPublicIP] = useState('');
  const [companyIPs, setCompanyIPs] = useState([]);
  const [matchedCompany, setMatchedCompany] = useState(null);
  const [ipValidation, setIpValidation] = useState(null);
  const [gettingIP, setGettingIP] = useState(false);
  const [ipValid, setIpValid] = useState(false);
  const [isLoadingIPs, setIsLoadingIPs] = useState(false);

  // ─── QR CODE STATES ───
  const [qrToken, setQrToken] = useState(null);
  const [qrCompany, setQrCompany] = useState(null);
  const [isFromQR, setIsFromQR] = useState(false);
  
  // ─── AUTO CHECK-IN/OUT STATE ───
  const [autoCheckInDone, setAutoCheckInDone] = useState(false);
  const [autoCheckOutDone, setAutoCheckOutDone] = useState(false);

  // ─── EMPLOYEE LIST STATES ───
  const [allEmployees, setAllEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // ─── CONFETTI STATES ───
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState([]);

  // ─── VOICE STATES ───
  const [voicesLoaded, setVoicesLoaded] = useState(false);

  // ─── FETCH PUBLIC IP ───
  const fetchPublicIP = async () => {
    try {
      setGettingIP(true);
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      setPublicIP(data.ip);
      return data.ip;
    } catch (error) {
      console.error('Error fetching IP:', error);
      return null;
    } finally {
      setGettingIP(false);
    }
  };

  // ─── FETCH ALL COMPANY IPs ───
  const fetchAllCompanyIPs = async () => {
    try {
      setIsLoadingIPs(true);
      const response = await axios.get(`${cleanBaseUrl}/api/admin/get-ips`);
      
      if (response.data.success) {
        setCompanyIPs(response.data.data || []);
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching company IPs:', error);
      return [];
    } finally {
      setIsLoadingIPs(false);
    }
  };

  // ─── CHECK IP VALIDATION AGAINST ALL COMPANIES ───
  const checkIPValidation = (clientIP, companies) => {
    if (!clientIP || !companies || companies.length === 0) {
      return { valid: false, message: 'IP validation not available', matchedCompany: null };
    }
    
    const normalizedClient = clientIP.replace(/^::ffff:/, '');
    
    // Find matching company
    const matched = companies.find(comp => {
      const normalizedCompany = comp.publicIp?.replace(/^::ffff:/, '') || '';
      return normalizedClient === normalizedCompany;
    });
    
    if (matched) {
      return {
        valid: true,
        clientIP: normalizedClient,
        companyIP: matched.publicIp,
        companyId: matched.companyId,
        message: `IP matches company: ${matched.companyId}`,
        matchedCompany: matched
      };
    } else {
      return {
        valid: false,
        clientIP: normalizedClient,
        message: 'IP does not match any registered company',
        matchedCompany: null
      };
    }
  };

  // ─── LOAD VOICES ───
  useEffect(() => {
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          setVoicesLoaded(true);
          console.log('Voices loaded:', voices.length);
        }
      };
      
      loadVoices();
      
      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          loadVoices();
        };
      }
      
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  // ─── INITIAL IP FETCH ───
  useEffect(() => {
    const initIP = async () => {
      const ip = await fetchPublicIP();
      const companies = await fetchAllCompanyIPs();
      
      if (ip && companies.length > 0) {
        const validation = checkIPValidation(ip, companies);
        setIpValidation(validation);
        setIpValid(validation.valid);
        setMatchedCompany(validation.matchedCompany);
        
        if (validation.valid && validation.matchedCompany) {
          // Store the matched company ID in localStorage for use in check-in
          localStorage.setItem('companyId', validation.matchedCompany.companyId);
        }
      }
    };
    initIP();
  }, []);

  // ─── READ QR CODE PARAMETERS ───
  useEffect(() => {
    const searchParams = new URLSearchParams(routerLocation.search);
    const token = searchParams.get('token');
    const company = searchParams.get('company');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (token) {
      setQrToken(token);
      setQrCompany(company);
      setIsFromQR(true);
      
      if (lat && lng) {
        setPosition({ lat: parseFloat(lat), lng: parseFloat(lng) });
      }
      
      console.log('QR Scanned:', { token, company, lat, lng });
    }
  }, [routerLocation.search]);

  // ─── TIME UPDATE ───
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      setCurrentDate(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      );
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // ─── CONFETTI EFFECT ───
  const generateConfetti = () => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF9FF3', '#54A0FF', '#FECA57', '#FF9F43'];
    const pieces = [];
    for (let i = 0; i < 80; i++) {
      pieces.push({
        id: i,
        x: Math.random() * 100,
        y: -10 - Math.random() * 20,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        speed: Math.random() * 3 + 2,
        delay: Math.random() * 0.5,
        shape: Math.random() > 0.5 ? 'circle' : 'square'
      });
    }
    setConfettiPieces(pieces);
    setShowConfetti(true);
    
    setTimeout(() => {
      setShowConfetti(false);
    }, 4000);
  };

  // ─── FEMALE VOICE FOR CHECKIN ───
  const speakCheckInSuccess = (name) => {
    try {
      if (!('speechSynthesis' in window)) return;
      
      window.speechSynthesis.cancel();
      
      const ipStatus = ipValid ? `IP validated for ${matchedCompany?.companyId || 'company'}` : 'IP validation warning';
      const message = `Congratulations ${name}! You have successfully checked in. ${ipStatus}. Have a great day!`;
      const utterance = new SpeechSynthesisUtterance(message);
      
      const voices = window.speechSynthesis.getVoices();
      let femaleVoice = voices.find(v => 
        v.name.toLowerCase().includes('female') || 
        v.name.toLowerCase().includes('zira') || 
        v.name.toLowerCase().includes('samantha') ||
        v.name.toLowerCase().includes('victoria') ||
        v.name.toLowerCase().includes('google uk english female') ||
        v.name.toLowerCase().includes('karen') ||
        v.name.toLowerCase().includes('siri')
      );
      
      if (!femaleVoice) femaleVoice = voices.find(v => v.lang.includes('en-IN'));
      if (!femaleVoice) femaleVoice = voices.find(v => v.lang.includes('en'));
      if (femaleVoice) utterance.voice = femaleVoice;
      
      utterance.lang = femaleVoice?.lang || 'en-IN';
      utterance.pitch = 1.1;
      utterance.rate = 0.9;
      utterance.volume = 1;
      
      window.speechSynthesis.speak(utterance);
      
    } catch (error) {
      console.error('Speech error:', error);
    }
  };

  // ─── FEMALE VOICE FOR CHECKOUT ───
  const speakCheckOutSuccess = (name) => {
    try {
      if (!('speechSynthesis' in window)) return;
      
      window.speechSynthesis.cancel();
      
      const message = `Goodbye ${name}! You have successfully checked out. See you tomorrow!`;
      const utterance = new SpeechSynthesisUtterance(message);
      
      const voices = window.speechSynthesis.getVoices();
      let femaleVoice = voices.find(v => 
        v.name.toLowerCase().includes('female') || 
        v.name.toLowerCase().includes('zira') || 
        v.name.toLowerCase().includes('samantha') ||
        v.name.toLowerCase().includes('victoria') ||
        v.name.toLowerCase().includes('google uk english female') ||
        v.name.toLowerCase().includes('karen') ||
        v.name.toLowerCase().includes('siri')
      );
      
      if (!femaleVoice) femaleVoice = voices.find(v => v.lang.includes('en-IN'));
      if (!femaleVoice) femaleVoice = voices.find(v => v.lang.includes('en'));
      if (femaleVoice) utterance.voice = femaleVoice;
      
      utterance.lang = femaleVoice?.lang || 'en-IN';
      utterance.pitch = 1.1;
      utterance.rate = 0.9;
      utterance.volume = 1;
      
      window.speechSynthesis.speak(utterance);
      
    } catch (error) {
      console.error('Speech error:', error);
    }
  };

  // ─── PLAY SUCCESS SOUND ───
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
    } catch (e) {
      console.log('Sound error:', e);
    }
  };

  // ─── FETCH ALL EMPLOYEES ───
  const fetchAllEmployees = async () => {
    setSearchLoading(true);
    try {
      const response = await axios.get(`${cleanBaseUrl}/api/employees/get-employees`);
      if (response.data && Array.isArray(response.data)) {
        setAllEmployees(response.data);
        setFilteredEmployees(response.data);
      } else if (response.data.data && Array.isArray(response.data.data)) {
        setAllEmployees(response.data.data);
        setFilteredEmployees(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError('Failed to fetch employee list');
    } finally {
      setSearchLoading(false);
    }
  };

  // ─── SEARCH EMPLOYEE ───
  const searchEmployee = (query) => {
    setEmployeeId(query);
    if (query.trim().length > 0) {
      const filtered = allEmployees.filter(emp => 
        emp.employeeId?.toLowerCase().includes(query.toLowerCase()) ||
        emp.name?.toLowerCase().includes(query.toLowerCase()) ||
        emp.email?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredEmployees(filtered);
      setShowDropdown(true);
    } else {
      setFilteredEmployees(allEmployees);
      setShowDropdown(false);
    }
  };

  // ─── SELECT EMPLOYEE FROM DROPDOWN ───
  const selectEmployee = (emp) => {
    setEmployeeId(emp.employeeId);
    setEmployeeData(emp);
    setShowDropdown(false);
    setError('');
    fetchEmployeeDetails(emp);
  };

  // ─── GET EMPLOYEE LOCATION FROM API ───
  const getEmployeeLocationFromAPI = async (empId) => {
    try {
      const response = await axios.get(`${cleanBaseUrl}/api/employees/get-location/${empId}`);
      if (response.data && response.data.success) {
        const locData = response.data.data;
        if (locData.latitude && locData.longitude) {
          setPosition({ 
            lat: parseFloat(locData.latitude), 
            lng: parseFloat(locData.longitude) 
          });
          return true;
        }
        return false;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  // ─── AUTO CHECK-OUT ───
  const autoCheckOut = async (emp, lat, lng) => {
    try {
      console.log('Sending auto check-out request...');
      
      const payload = {
        employeeId: emp.employeeId,
        latitude: lat,
        longitude: lng,
        publicIp: publicIP
      };
      
      const response = await axios.post(`${cleanBaseUrl}/api/attendance/checkout`, payload);
      console.log('Checkout response:', response.data);
      
      setCheckedIn(false);
      setAutoCheckOutDone(true);
      setAutoCheckInDone(false);
      setSuccessIcon(<FaRegHandPeace className="text-3xl text-orange-500" />);
      
      const ipStatus = ipValid ? `IP validated (${matchedCompany?.companyId})` : 'IP mismatch';
      setSuccessMessage(`Check-out successful! Goodbye ${emp.name}! (${ipStatus})`);
      setShowSuccessPopup(true);
      
      playSuccessSound();
      setTimeout(() => generateConfetti(), 200);
      setTimeout(() => {
        if (voicesLoaded) {
          speakCheckOutSuccess(emp.name);
        } else {
          setTimeout(() => speakCheckOutSuccess(emp.name), 1000);
        }
      }, 500);
      
    } catch (err) {
      console.error('Auto check-out failed:', err);
      setSuccessIcon(<FaRegSadTear className="text-3xl text-red-500" />);
      setSuccessMessage(`Check-out failed: ${err.response?.data?.message || 'Please try again'}`);
      setShowSuccessPopup(true);
    }
  };

  // ─── AUTO CHECK-IN ───
  const autoCheckIn = async (emp, lat, lng) => {
    try {
      console.log('Sending auto check-in request...');
      
      const payload = {
        employeeId: emp.employeeId,
        employeeEmail: emp.email,
        latitude: lat,
        longitude: lng,
        reason: "QR Check-in",
        qrToken: qrToken || null,
        qrCompany: qrCompany || null,
        publicIp: publicIP
      };
      
      await axios.post(`${cleanBaseUrl}/api/attendance/checkinwithqr`, payload);

      setCheckedIn(true);
      setAutoCheckInDone(true);
      setAutoCheckOutDone(false);
      setSuccessIcon(<FaThumbsUp className="text-3xl text-green-500" />);
      
      const ipStatus = ipValid ? `IP validated (${matchedCompany?.companyId})` : 'IP mismatch';
      setSuccessMessage(`Check-in successful! Welcome ${emp.name}! (${ipStatus})`);
      setShowSuccessPopup(true);
      
      playSuccessSound();
      setTimeout(() => generateConfetti(), 200);
      setTimeout(() => {
        if (voicesLoaded) {
          speakCheckInSuccess(emp.name);
        } else {
          setTimeout(() => speakCheckInSuccess(emp.name), 1000);
        }
      }, 500);
      
    } catch (err) {
      console.error('Auto check-in failed:', err);
      if (err.response?.data?.message?.includes('Already checked-in')) {
        console.log('Already checked in, doing check-out...');
        await autoCheckOut(emp, lat, lng);
      } else {
        setSuccessIcon(<FaRegSadTear className="text-3xl text-red-500" />);
        setSuccessMessage(`Check-in failed: ${err.response?.data?.message || 'Please try again'}`);
        setShowSuccessPopup(true);
      }
    }
  };

  // ─── GET TODAY'S ATTENDANCE STATUS ───
  const getTodayAttendanceStatus = async (empId) => {
    try {
      const attRes = await axios.get(`${cleanBaseUrl}/api/attendance/myattendance/${empId}`);
      const records = attRes.data.records || [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayRecords = records.filter((rec) => {
        const checkInTime = new Date(rec.checkInTime);
        return checkInTime >= today;
      });
      
      if (todayRecords.length === 0) {
        return null;
      }
      
      todayRecords.sort((a, b) => new Date(b.checkInTime) - new Date(a.checkInTime));
      return todayRecords[0];
    } catch (err) {
      console.error('Error fetching attendance status:', err);
      return null;
    }
  };

  // ─── FETCH EMPLOYEE DETAILS ───
  const fetchEmployeeDetails = async (emp) => {
    setLoading(true);
    setError('');
    setCheckedIn(false);
    setPosition(null);
    setAutoCheckInDone(false);
    setAutoCheckOutDone(false);

    try {
      const empId = emp?._id || emp?.id || employeeId;
      
      if (!empId) {
        setError('Invalid Employee ID');
        setLoading(false);
        return;
      }

      const hasStoredLocation = await getEmployeeLocationFromAPI(empId);
      
      if (!hasStoredLocation) {
        fetchLocationAndUpdate(empId, emp);
        setLoading(false);
        return;
      }

      if (position && isFromQR) {
        const status = await getTodayAttendanceStatus(empId);
        console.log('Today\'s attendance status:', status);
        
        if (status && status.status === "checked-in") {
          console.log('Currently checked in, doing check-out...');
          await autoCheckOut(emp, position.lat, position.lng);
        } else {
          console.log('Not checked in, doing check-in...');
          await autoCheckIn(emp, position.lat, position.lng);
        }
      }

      try {
        const status = await getTodayAttendanceStatus(empId);
        if (status && status.status === "checked-in") {
          setCheckedIn(true);
        } else {
          setCheckedIn(false);
        }
      } catch (err) {
        console.error('Error fetching attendance:', err);
      }

    } catch (err) {
      console.error('Error fetching employee details:', err);
      setError(err.response?.data?.message || 'Failed to fetch employee details');
    } finally {
      setLoading(false);
    }
  };

  // ─── FETCH LOCATION AND UPDATE ───
  const fetchLocationAndUpdate = async (empId, emp) => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { 
          lat: pos.coords.latitude, 
          lng: pos.coords.longitude 
        };
        setPosition(coords);

        const empIdToUpdate = empId || employeeData?._id || employeeData?.employeeId || employeeId;
        if (empIdToUpdate) {
          try {
            await axios.put(`${cleanBaseUrl}/api/employees/update-location/${empIdToUpdate}`, {
              latitude: coords.lat,
              longitude: coords.lng
            });
          } catch (err) {
            console.error('Error updating location:', err);
          }
        }

        if (isFromQR) {
          const empData = emp || employeeData;
          if (empData) {
            const status = await getTodayAttendanceStatus(empId);
            console.log('Today\'s attendance status:', status);
            
            if (status && status.status === "checked-in") {
              await autoCheckOut(empData, coords.lat, coords.lng);
            } else {
              await autoCheckIn(empData, coords.lat, coords.lng);
            }
          }
        }
      },
      (err) => {
        console.error('Location error:', err);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  // ─── FETCH EMPLOYEE BY ID ───
  const fetchEmployee = async () => {
    if (!employeeId.trim()) {
      setError('Please enter Employee ID');
      return;
    }

    const emp = allEmployees.find(e => 
      e.employeeId?.toLowerCase() === employeeId.trim().toLowerCase() ||
      e._id === employeeId.trim()
    );

    if (emp) {
      setEmployeeData(emp);
      setShowDropdown(false);
      await fetchEmployeeDetails(emp);
    } else {
      setLoading(true);
      try {
        const response = await axios.get(`${cleanBaseUrl}/api/employees/${employeeId.trim()}`);
        if (response.data && response.data.data) {
          setEmployeeData(response.data.data);
          await fetchEmployeeDetails(response.data.data);
        } else {
          setError('Employee not found');
        }
      } catch (err) {
        setError('Employee not found');
      } finally {
        setLoading(false);
      }
    }
  };

  // ─── AUTO FETCH ON QR LOAD ───
  useEffect(() => {
    if (isFromQR && qrToken && allEmployees.length > 0) {
      const stored = localStorage.getItem('employeeData');
      if (stored) {
        try {
          const data = JSON.parse(stored);
          if (data.employeeId) {
            setEmployeeId(data.employeeId);
            
            const emp = allEmployees.find(e => 
              e.employeeId?.toLowerCase() === data.employeeId.toLowerCase()
            );
            if (emp) {
              setEmployeeData(emp);
              setShowDropdown(false);
              fetchEmployeeDetails(emp);
            } else {
              fetchEmployee();
            }
          }
        } catch (e) {
          console.error('Error parsing stored data:', e);
        }
      }
    }
  }, [isFromQR, qrToken, allEmployees]);

  // ─── LOAD EMPLOYEES ON MOUNT ───
  useEffect(() => {
    fetchAllEmployees();
  }, []);

  // ─── HANDLE ENTER KEY ───
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      fetchEmployee();
      setShowDropdown(false);
    }
  };

  // ─── DISMISS SUCCESS ───
  const dismissSuccess = () => {
    setShowSuccessPopup(false);
  };

  // ─── GO BACK ───
  const handleBack = () => {
    navigate(-1);
  };

  // ─── RENDER ───
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/80 to-purple-50/60 p-4 relative overflow-hidden">
      {/* ─── CONFETTI EFFECT ─── */}
      {showConfetti && (
        <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
          {confettiPieces.map((piece) => (
            <div
              key={piece.id}
              className={`absolute animate-confetti ${piece.shape === 'circle' ? 'rounded-full' : 'rounded-sm'}`}
              style={{
                left: `${piece.x}%`,
                top: `${piece.y}%`,
                width: `${piece.size}px`,
                height: `${piece.size * 0.6}px`,
                backgroundColor: piece.color,
                transform: `rotate(${piece.rotation}deg)`,
                animationDuration: `${piece.speed}s`,
                animationDelay: `${piece.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* ─── SUCCESS POPUP ─── */}
      {showSuccessPopup && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
          onClick={dismissSuccess}
        >
          <div 
            className="relative bg-gradient-to-br from-white via-green-50/95 to-emerald-50/95 rounded-3xl shadow-2xl max-w-sm w-full p-6 animate-scale-up border border-green-200/50"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={dismissSuccess}
              className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-gray-200 transition-all"
            >
              <FaTimes className="w-3.5 h-3.5 text-gray-400" />
            </button>

            <div className="text-center">
              <div className="flex justify-center mb-3">
                <div className={`w-20 h-20 ${successIcon?.type === FaThumbsUp ? 'bg-gradient-to-br from-green-500 to-emerald-500' : successIcon?.type === FaRegHandPeace ? 'bg-gradient-to-br from-orange-500 to-amber-500' : 'bg-gradient-to-br from-red-500 to-rose-500'} rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 animate-bounce`}>
                  {successIcon || <FaRegSmile className="text-3xl text-white" />}
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-900">{successMessage}</h2>
              <p className="text-sm text-gray-600 mt-1">
                {successIcon?.type === FaThumbsUp ? 'Have a great day!' : 
                 successIcon?.type === FaRegHandPeace ? 'See you tomorrow!' :
                 'Thank you for your hard work!'}
              </p>
              
              {/* IP Status in Success Popup */}
              <div className={`mt-2 p-2 rounded-lg text-xs ${ipValid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                <div className="flex items-center justify-center gap-2">
                  <FaShieldAlt className={ipValid ? 'text-green-600' : 'text-yellow-600'} />
                  <span>{ipValid ? `✅ IP Verified (${matchedCompany?.companyId || 'Company'})` : '⚠️ IP Mismatch'}</span>
                  <span className="text-[10px] text-gray-500">|</span>
                  <span className="font-mono text-[10px]">{publicIP}</span>
                </div>
              </div>
              
              {(successIcon?.type === FaThumbsUp || successIcon?.type === FaRegHandPeace) && (
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <FaVolumeUp className="text-purple-500 text-xs animate-pulse" />
                  <span className="text-[8px] text-purple-500 font-medium animate-pulse">
                    Female voice speaking...
                  </span>
                </div>
              )}
              <button
                onClick={dismissSuccess}
                className="mt-3 w-full py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/30 transition-all duration-200"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MAIN CONTENT ─── */}
      <div className="max-w-md mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleBack}
            className="p-2.5 bg-white/80 backdrop-blur-xl rounded-xl shadow-lg shadow-indigo-500/5 border border-white/60 hover:shadow-xl hover:scale-105 transition-all duration-300 group"
          >
            <FaArrowLeft className="w-4 h-4 text-gray-600 group-hover:text-indigo-600 transition-colors" />
          </button>
          <div className="flex items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur-xl rounded-xl shadow-lg shadow-indigo-500/5 border border-white/60">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-semibold text-gray-600">{currentDate}</span>
            <span className="text-xs font-bold text-indigo-600">{currentTime}</span>
          </div>
        </div>

        {/* ─── IP VALIDATION CARD ─── */}
        <div className={`mb-4 p-3 rounded-xl border ${ipValid ? 'bg-green-50/80 border-green-200/50' : 'bg-yellow-50/80 border-yellow-200/50'} backdrop-blur-sm`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaNetworkWired className={ipValid ? 'text-green-600' : 'text-yellow-600'} />
              <span className="text-xs font-medium text-gray-700">Network Security</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-mono ${ipValid ? 'text-green-700' : 'text-yellow-700'}`}>
                {publicIP || 'Fetching...'}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${ipValid ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                {ipValid ? '✅ Verified' : '⚠️ Mismatch'}
              </span>
            </div>
          </div>
          {matchedCompany && (
            <div className="mt-1 text-[10px] text-gray-500 flex items-center gap-2">
              <span>Company: {matchedCompany.companyId}</span>
              <span className="text-gray-300">|</span>
              <span>IP: {matchedCompany.publicIp}</span>
            </div>
          )}
          {!ipValid && companyIPs.length > 0 && (
            <div className="mt-1 text-[10px] text-yellow-600 flex items-center gap-1">
              <FaExclamationTriangle className="text-[10px]" />
              <span>No matching company IP found. Registered companies: {companyIPs.length}</span>
            </div>
          )}
          {companyIPs.length === 0 && !isLoadingIPs && (
            <div className="mt-1 text-[10px] text-gray-500 flex items-center gap-1">
              <span>No company IPs registered in the system</span>
            </div>
          )}
        </div>

        {/* ─── SEARCH INPUT ─── */}
        <div className="bg-white/85 backdrop-blur-2xl rounded-3xl shadow-xl shadow-indigo-500/5 border border-white/60 p-5 mb-4">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <FaSearch className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={employeeId}
              onChange={(e) => {
                setEmployeeId(e.target.value);
                if (e.target.value.length > 0) {
                  searchEmployee(e.target.value);
                } else {
                  setShowDropdown(false);
                  setEmployeeData(null);
                }
              }}
              onKeyPress={handleKeyPress}
              onFocus={() => {
                if (employeeId.length > 0) {
                  setShowDropdown(true);
                }
              }}
              placeholder="Search or enter Employee ID..."
              className="w-full pl-9 pr-14 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/50"
              disabled={loading || searchLoading}
            />
            {(loading || searchLoading) && (
              <FaSpinner className="absolute right-14 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500 animate-spin" />
            )}
            <button
              onClick={fetchEmployee}
              disabled={loading || searchLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading ? (
                <FaSpinner className="w-3 h-3 animate-spin" />
              ) : (
                <FaRocket className="w-3 h-3" />
              )}
            </button>
          </div>

          {/* ─── DROPDOWN ─── */}
          {showDropdown && filteredEmployees.length > 0 && (
            <div className="absolute z-50 w-full max-w-md mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {filteredEmployees.map((emp) => (
                <div
                  key={emp._id}
                  onClick={() => selectEmployee(emp)}
                  className="px-4 py-3 hover:bg-indigo-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-indigo-600">
                      {emp.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{emp.name}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-2">
                      <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">
                        {emp.employeeId}
                      </span>
                      <span>{emp.department || 'Department'}</span>
                    </p>
                  </div>
                  {emp.status === 'active' ? (
                    <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Active</span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-700 rounded-full">Inactive</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-200 flex items-center gap-2">
              <FaTimes className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* ─── EMPLOYEE DETAILS ─── */}
        {employeeData && (
          <div className="bg-white/85 backdrop-blur-2xl rounded-3xl shadow-xl shadow-indigo-500/5 border border-white/60 p-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <span className="text-2xl font-bold text-white">
                  {employeeData.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-900">{employeeData.name}</h2>
                <p className="text-sm font-medium text-indigo-600">{employeeData.department || 'Department'}</p>
                <p className="text-xs text-gray-500">{employeeData.email}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                    ID: {employeeData.employeeId}
                  </span>
                  {employeeData.status === 'active' ? (
                    <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Active</span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-700 rounded-full">Inactive</span>
                  )}
                  {autoCheckInDone && (
                    <span className="text-[10px] text-green-400 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <FaCheck className="text-[8px]" /> Checked In
                    </span>
                  )}
                  {autoCheckOutDone && (
                    <span className="text-[10px] text-orange-400 bg-orange-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <FaCheck className="text-[8px]" /> Checked Out
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* IP Status Badge */}
            <div className="mt-3 flex items-center gap-2 p-2 bg-gray-50/80 rounded-xl border border-gray-200/50">
              <FaShieldAlt className={ipValid ? 'text-green-600' : 'text-yellow-600'} />
              <span className="text-xs text-gray-600">IP Status:</span>
              <span className={`text-xs font-semibold ${ipValid ? 'text-green-700' : 'text-yellow-700'}`}>
                {ipValid ? `✅ Verified (${matchedCompany?.companyId})` : '⚠️ Mismatch'}
              </span>
              <span className="text-[10px] text-gray-400 font-mono">{publicIP}</span>
            </div>

            {/* Auto check-in success message */}
            {autoCheckInDone && (
              <div className="mt-4 p-3 bg-green-50/80 rounded-xl border border-green-200/50 animate-slide-up">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0 animate-pulse">
                    <FaCheckCircle className="text-green-600 text-lg" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-green-800">
                      Auto Check-in Successful!
                    </p>
                    <p className="text-xs text-green-600">
                      You have been automatically checked in via QR scan. {ipValid ? `IP Verified (${matchedCompany?.companyId})` : '⚠️ IP Mismatch'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Auto check-out success message */}
            {autoCheckOutDone && (
              <div className="mt-4 p-3 bg-orange-50/80 rounded-xl border border-orange-200/50 animate-slide-up">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0 animate-pulse">
                    <FaTimes className="text-orange-600 text-lg" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-orange-800">
                      Auto Check-out Successful!
                    </p>
                    <p className="text-xs text-orange-600">
                      You have been automatically checked out via QR scan.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-5">
          <p className="text-[9px] text-gray-300 font-medium">Powered by Timely Health HRMS</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-up {
          from { opacity: 0; transform: scale(0.9) translateY(15px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg) scale(0.5);
            opacity: 0;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-scale-up {
          animation: scale-up 0.35s ease-out;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        .animate-pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }
        .animate-bounce {
          animation: bounce 0.5s ease-in-out 3;
        }
        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }
        .animate-confetti {
          animation: confetti-fall forwards ease-in;
        }
      `}</style>
    </div>
  );
}