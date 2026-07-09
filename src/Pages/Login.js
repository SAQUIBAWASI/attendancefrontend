import { useState, useEffect, useRef } from 'react';
import { FaEye, FaEyeSlash, FaUser, FaSmile, FaTimes } from "react-icons/fa";
import { useNavigate, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const LoginPage = () => {
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
  
  // ⭐ Store navigation info
  const navigateToRef = useRef(null);
  const navigateStateRef = useRef(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const speechTimeoutRef = useRef(null);
  const loginButtonRef = useRef(null);

  // ─── Auto-fetch Location ───
  const fetchLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setLocationError('Geolocation is not supported by your browser');
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
          console.log('📍 Location fetched:', { lat, lng });
          resolve({ lat, lng });
        },
        (error) => {
          console.warn('⚠️ Location error:', error.message);
          setLocationError(`Location access denied: ${error.message}`);
          setLocationFetched(false);
          resolve({ lat: null, lng: null });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  };

  // ─── Check for auto-login parameters ───
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const autoLogin = urlParams.get('autoLogin');
    const emailParam = urlParams.get('email');
    const passwordParam = urlParams.get('password');

    console.log('🔍 Auto-login check:', { autoLogin, email: emailParam, password: passwordParam });

    fetchLocation();

    if (autoLogin === 'true' && emailParam && passwordParam) {
      console.log('🚀 Auto-login triggered for:', emailParam);
      setEmail(emailParam);
      setPassword(passwordParam);
      
      setTimeout(() => {
        if (loginButtonRef.current) {
          loginButtonRef.current.click();
        }
      }, 1000);
    }
  }, [location]);

  // ─── Check Speech Synthesis Support ───
  const checkSpeechSupport = () => {
    if (!('speechSynthesis' in window)) {
      setIsSpeechSupported(false);
      return false;
    }
    
    // Check if any voices are available
    let voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      // Some browsers need time to load voices
      window.speechSynthesis.onvoiceschanged = () => {
        voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          setIsSpeechSupported(true);
        }
      };
    }
    
    return true;
  };

  // ─── Female Voice Welcome Function (Mobile Optimized) ───
  const speakWelcome = (name, role) => {
    return new Promise((resolve) => {
      // If speech not supported, resolve immediately
      if (!('speechSynthesis' in window)) {
        console.warn('⚠️ Speech synthesis not supported');
        setIsSpeechSupported(false);
        resolve();
        return;
      }

      try {
        // ⭐ CRITICAL: Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
        const message = `Welcome ${name}! You are logged in as ${role}. Have a great day!`;
        const utterance = new SpeechSynthesisUtterance(message);
        
        // Language and voice settings
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        utterance.volume = 1;
        
        // ⭐ Mobile Fix: Try to get a female voice
        const voices = window.speechSynthesis.getVoices();
        console.log('🔊 Available voices:', voices.map(v => v.name));
        
        // Try multiple female voice patterns for better mobile support
        const femaleVoiceNames = [
          'Female', 'Samantha', 'Google UK', 'Victoria', 'Zira', 
          'Marie', 'Ellen', 'Susan', 'Karen', 'Siri', 
          'Alexa', 'Cortana', 'Alice', 'Claire', 'Amanda',
          'Allison', 'Ava', 'Joanna', 'Kendra', 'Kimberly',
          'Salli', 'Ivy', 'Emma', 'Amy', 'Mia'
        ];
        
        let femaleVoice = null;
        
        // Try to find female voice
        for (const voice of voices) {
          const voiceName = voice.name.toLowerCase();
          const voiceLang = voice.lang.toLowerCase();
          
          // Check if voice name contains female indicator or is a known female voice
          if (femaleVoiceNames.some(name => 
            voiceName.includes(name.toLowerCase()) || 
            voiceName.includes('female') ||
            voiceLang.includes('female')
          )) {
            femaleVoice = voice;
            break;
          }
        }
        
        // If no female voice found, try to get any English voice
        if (!femaleVoice) {
          femaleVoice = voices.find(v => 
            v.lang.startsWith('en-') || 
            v.lang === 'en-US' || 
            v.lang === 'en-GB'
          );
        }
        
        // If still no voice, use default
        if (femaleVoice) {
          utterance.voice = femaleVoice;
          console.log('🎤 Using voice:', femaleVoice.name);
        } else {
          // Fallback: use higher pitch for female-like sound
          utterance.pitch = 1.3;
          console.log('🎤 Using default voice with higher pitch');
        }
        
        // ⭐ Mobile Fix: Handle speech events properly
        let isResolved = false;
        
        utterance.onstart = () => {
          console.log('🔊 Speech started');
        };
        
        utterance.onend = () => {
          if (!isResolved) {
            isResolved = true;
            console.log('🔊 Speech ended');
            resolve();
          }
        };
        
        utterance.onerror = (event) => {
          console.warn('⚠️ Speech error:', event.error);
          
          // ⭐ Mobile Fix: If speech fails, try fallback
          if (event.error === 'not-allowed' || event.error === 'synthesis-unavailable') {
            // Try speaking again after a small delay
            setTimeout(() => {
              try {
                const fallbackUtterance = new SpeechSynthesisUtterance(message);
                fallbackUtterance.lang = 'en-US';
                fallbackUtterance.rate = 0.9;
                fallbackUtterance.pitch = 1.2;
                fallbackUtterance.volume = 1;
                
                fallbackUtterance.onend = () => {
                  if (!isResolved) {
                    isResolved = true;
                    resolve();
                  }
                };
                
                fallbackUtterance.onerror = () => {
                  if (!isResolved) {
                    isResolved = true;
                    resolve();
                  }
                };
                
                window.speechSynthesis.speak(fallbackUtterance);
              } catch (e) {
                console.warn('⚠️ Fallback speech failed:', e);
                if (!isResolved) {
                  isResolved = true;
                  resolve();
                }
              }
            }, 100);
          } else {
            if (!isResolved) {
              isResolved = true;
              resolve();
            }
          }
        };
        
        // ⭐ Mobile Fix: Speak with proper timing
        setTimeout(() => {
          window.speechSynthesis.speak(utterance);
        }, 100);
        
        // ⭐ Fallback timeout
        speechTimeoutRef.current = setTimeout(() => {
          if (!isResolved) {
            isResolved = true;
            console.warn('⚠️ Speech timeout, resolving...');
            resolve();
          }
        }, 10000);
        
      } catch (error) {
        console.error('❌ Speech synthesis error:', error);
        resolve();
      }
    });
  };

  // ─── Dismiss Welcome Popup ───
  const dismissWelcomePopup = () => {
    console.log('🔄 Dismissing popup...');
    setShowWelcome(false);
    
    // ⭐ Mobile Fix: Cancel speech properly
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } catch (e) {
      console.warn('⚠️ Error canceling speech:', e);
    }
    
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }
    
    // ⭐ CRITICAL: Navigate after popup dismiss
    const targetPath = navigateToRef.current;
    const targetState = navigateStateRef.current;
    
    if (targetPath) {
      console.log('🚀 Navigating to:', targetPath, 'with state:', targetState);
      navigateToRef.current = null;
      navigateStateRef.current = null;
      
      // Use requestAnimationFrame for smoother navigation
      if (window.requestAnimationFrame) {
        window.requestAnimationFrame(() => {
          if (targetState) {
            navigate(targetPath, { state: targetState, replace: true });
          } else {
            navigate(targetPath, { replace: true });
          }
        });
      } else {
        setTimeout(() => {
          if (targetState) {
            navigate(targetPath, { state: targetState, replace: true });
          } else {
            navigate(targetPath, { replace: true });
          }
        }, 50);
      }
    } else {
      console.warn('⚠️ No navigation target found!');
    }
  };

  // ─── Initialize speech on component mount ───
  useEffect(() => {
    // Check speech support
    checkSpeechSupport();
    
    // ⭐ Mobile Fix: Pre-load voices
    if ('speechSynthesis' in window) {
      // Try to get voices
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        console.log('🔊 Voices loaded:', voices.length);
      }
      
      // Listen for voice changes
      window.speechSynthesis.onvoiceschanged = () => {
        const updatedVoices = window.speechSynthesis.getVoices();
        console.log('🔊 Voices updated:', updatedVoices.length);
        if (updatedVoices.length > 0) {
          setIsSpeechSupported(true);
        }
      };
      
      // ⭐ Mobile Fix: Resume speech context on user interaction
      const resumeSpeech = () => {
        if ('speechSynthesis' in window) {
          try {
            // This helps resume speech on mobile
            window.speechSynthesis.cancel();
            window.speechSynthesis.getVoices();
          } catch (e) {
            console.warn('⚠️ Speech resume error:', e);
          }
        }
      };
      
      // Resume speech on user interaction
      document.addEventListener('click', resumeSpeech);
      document.addEventListener('touchstart', resumeSpeech);
      
      return () => {
        document.removeEventListener('click', resumeSpeech);
        document.removeEventListener('touchstart', resumeSpeech);
        if (speechTimeoutRef.current) {
          clearTimeout(speechTimeoutRef.current);
        }
        if ('speechSynthesis' in window) {
          try {
            window.speechSynthesis.cancel();
          } catch (e) {}
        }
      };
    }
  }, []);

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
      
      if (lat === null || lng === null) {
        console.warn('⚠️ Proceeding without location data');
        setLocationError('⚠️ Location unavailable - proceeding without it');
      }
    }

    try {
      // 1. Admin Login
      const adminResponse = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const adminData = await adminResponse.json();

      if (adminResponse.ok) {
        const admin = adminData.admin || {};
        const name = admin.name || 'Admin';
        const adminEmail = admin.email || email;
        const adminPassword = password;
        
        localStorage.setItem('adminToken', adminData.token);
        localStorage.setItem('adminId', admin.id || admin._id || '');
        localStorage.setItem('adminEmail', adminEmail);
        localStorage.setItem('adminName', name);
        localStorage.setItem('userRole', 'admin');
        localStorage.setItem('adminPassword', adminPassword);
        
        const userData = {
          _id: admin.id || admin._id || '',
          name: name,
          email: adminEmail,
          password: adminPassword,
          role: 'admin',
          latitude: lat,
          longitude: lng
        };
        localStorage.setItem('userData', JSON.stringify(userData));
        
        setUserName(name);
        setUserRole('Admin');
        
        const urlParams = new URLSearchParams(location.search);
        const autoLogin = urlParams.get('autoLogin');
        
        if (autoLogin === 'true') {
          setTimeout(() => {
            window.close();
          }, 2500);
        } else {
          navigateToRef.current = '/dashboard';
          navigateStateRef.current = null;
          console.log('📌 Set navigation target: /dashboard');
        }
        
        setShowWelcome(true);
        setIsLoading(false);
        
        // ⭐ Speak welcome with proper handling
        await speakWelcome(name, 'Admin');
        return;
      }

      // 2. Employee Login (with location)
      const empResponse = await fetch(`${API_BASE_URL}/employees/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          password,
          latitude: lat,
          longitude: lng
        }),
      });

      const empData = await empResponse.json();

      if (empResponse.ok) {
        const employee = empData.employee || {};
        const name = employee.name || 'Employee';
        const role = employee.role || employee.designation || 'Employee';
        const employeeId = employee.employeeId || employee.id || '';
        const employeePassword = password;
        
        const userData = {
          _id: employee.id || employee._id || '',
          name: name,
          email: employee.email || email,
          password: employeePassword,
          employeeId: employeeId,
          role: role,
          department: employee.department || '',
          permissions: employee.permissions || [],
          latitude: lat,
          longitude: lng,
          lastLoginLocation: { lat, lng }
        };
        
        localStorage.setItem("userData", JSON.stringify(userData));
        localStorage.setItem("employeeData", JSON.stringify(userData));
        localStorage.setItem("employeePermissions", JSON.stringify(employee.permissions || []));
        localStorage.setItem("employeeId", employeeId);
        localStorage.setItem("employeeEmail", employee.email || email);
        localStorage.setItem("employeeName", name);
        localStorage.setItem("employeeMongoId", employee._id || '');
        localStorage.setItem("employeePassword", employeePassword);
        localStorage.setItem('userRole', 'employee');
        localStorage.setItem("lastLoginLocation", JSON.stringify({ lat, lng }));
        
        if (empData.token) localStorage.setItem("token", empData.token);
        
        setUserName(name);
        setUserRole(role);
        
        const urlParams = new URLSearchParams(location.search);
        const autoLogin = urlParams.get('autoLogin');
        
        if (autoLogin === 'true') {
          setTimeout(() => {
            window.close();
          }, 2500);
        } else {
          navigateToRef.current = '/employeedashboard';
          navigateStateRef.current = { email: employee.email || '' };
          console.log('📌 Set navigation target: /employeedashboard');
        }
        
        setShowWelcome(true);
        setIsLoading(false);
        await speakWelcome(name, role);
        return;
      }

      // 3. Client Login
      const clientResponse = await fetch(`${API_BASE_URL}/clients/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const clientData = await clientResponse.json();

      if (clientResponse.ok) {
        const client = clientData.client || {};
        const name = client.name || 'Client';
        const clientPassword = password;
        
        const userData = {
          _id: client._id || '',
          name: name,
          email: client.email || email,
          password: clientPassword,
          role: 'client',
          latitude: lat,
          longitude: lng
        };
        
        localStorage.setItem('clientToken', clientData.token);
        localStorage.setItem('clientId', client._id || '');
        localStorage.setItem('clientCustomId', client.clientId || '');
        localStorage.setItem('clientEmail', client.email || email);
        localStorage.setItem('clientName', name);
        localStorage.setItem('clientData', JSON.stringify(userData));
        localStorage.setItem('userRole', 'client');
        localStorage.setItem('userData', JSON.stringify(userData));
        
        setUserName(name);
        setUserRole('Client');
        
        const urlParams = new URLSearchParams(location.search);
        const autoLogin = urlParams.get('autoLogin');
        
        if (autoLogin === 'true') {
          setTimeout(() => {
            window.close();
          }, 2500);
        } else {
          navigateToRef.current = '/client-dashboard';
          navigateStateRef.current = { 
            client: client,
            userType: 'client'
          };
          console.log('📌 Set navigation target: /client-dashboard');
        }
        
        setShowWelcome(true);
        setIsLoading(false);
        await speakWelcome(name, 'Client');
        return;
      }

      throw new Error(clientData.message || empData.message || adminData.message || 'Invalid credentials');

    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      
      {/* ─── Location Status Indicator ─── */}
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

      {/* ─── WELCOME POPUP ─── */}
      {showWelcome && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-md animate-fadeIn"
          onClick={dismissWelcomePopup}
        >
          <div 
            className="relative bg-white rounded-3xl p-8 sm:p-12 max-w-md w-full mx-4 shadow-2xl animate-scaleUp border border-gray-100"
            onClick={dismissWelcomePopup}
          >
            <button
              onClick={dismissWelcomePopup}
              className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 transition-all duration-200 hover:rotate-90 group"
              title="Close"
            >
              <FaTimes className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </button>

            <div className="relative text-center">
              <div className="relative mb-4">
                <div className="absolute -top-8 -left-8 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-r from-emerald-100 to-blue-100 rounded-full opacity-50 blur-2xl"></div>
                <div 
                  onClick={dismissWelcomePopup}
                  className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-emerald-400 to-blue-500 flex items-center justify-center shadow-xl shadow-emerald-500/30 animate-float cursor-pointer hover:scale-110 transition-all duration-300 group"
                  title="Click to dismiss"
                >
                  <div className="flex flex-col items-center justify-center">
                    <FaSmile className="w-8 h-8 text-white" />
                    <span className="text-[6px] sm:text-[8px] text-white/90 font-medium mt-0.5 group-hover:scale-110 transition-transform">
                      click me
                    </span>
                  </div>
                </div>
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2" onClick={dismissWelcomePopup}>
                Welcome, <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">{userName}</span>!
              </h2>
              
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-100 border border-gray-200 text-gray-700 text-sm mb-4" onClick={dismissWelcomePopup}>
                <FaUser className="w-3 h-3" />
                <span>{userRole}</span>
              </div>
              
              <p className="text-gray-600 text-sm mb-6" onClick={dismissWelcomePopup}>
                You have been successfully logged in to <strong className="text-gray-800">INGRAIN'S TMS</strong>
              </p>
              
              {/* ⭐ Show voice indicator only if supported */}
              {isSpeechSupported && (
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-4" onClick={dismissWelcomePopup}>
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                  <span className="text-[8px] sm:text-[10px] text-purple-500 font-medium animate-pulse">
                    🔊 Voice speaking...
                  </span>
                </div>
              )}
              
              {!isSpeechSupported && (
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-4" onClick={dismissWelcomePopup}>
                  <span className="text-[8px] sm:text-[10px] text-gray-400">
                    ✅ Login successful!
                  </span>
                </div>
              )}
              
              <div className="w-full" onClick={dismissWelcomePopup}>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full w-0 bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 rounded-full animate-progressFill"></div>
                </div>
              </div>

              <p className="text-[8px] sm:text-[10px] text-gray-400 mt-3" onClick={dismissWelcomePopup}>
                Click anywhere to dismiss
              </p>
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
            <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text">
              LOG IN
            </h1>
            <p className="mt-1 text-sm text-gray-500">Access your account</p>
          </div>

          {error && (
            <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {locationError && !error && (
            <div className="p-2 mb-3 text-xs text-yellow-700 bg-yellow-50 rounded-lg border border-yellow-200 flex items-center gap-2">
              <span>⚠️</span>
              {locationError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="email">
                Email Address
              </label>
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
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-sm text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  Forgot Password?
                </button>
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
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Verifying...
                </span>
              ) : (
                'Login'
              )}
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              New client? <a href="/register" className="text-emerald-600 hover:text-emerald-700 transition-colors">Register here</a>
            </p>
            <p className="mt-2 text-xs text-gray-400">
              Admin / Employee / Client • Use your registered email
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center justify-center p-8 bg-gradient-to-br from-emerald-50/50 to-blue-50/50">
          <div className="relative">
            <img
              src="https://t3.ftcdn.net/jpg/04/72/65/82/360_F_472658260_9eT6d4HzAt7lDZ8d5SAb5opOZikRH7AC.jpg"
              alt="Login Illustration"
              className="relative object-contain h-auto max-w-full rounded-2xl shadow-lg"
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes progressFill {
          0% { width: 0%; }
          30% { width: 35%; }
          60% { width: 70%; }
          100% { width: 100%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
        .animate-scaleUp {
          animation: scaleUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .animate-progressFill {
          animation: progressFill 2.5s ease-in-out forwards;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 0.8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;