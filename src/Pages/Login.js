// import { useState } from 'react';
// import { FaEye, FaEyeSlash } from "react-icons/fa";
// import { useNavigate } from 'react-router-dom';
// import { API_BASE_URL } from '../config';

// const LoginPage = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [clientId, setClientId] = useState('');
//   const [loginType, setLoginType] = useState('email');
//   const [error, setError] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setIsLoading(true);

//     try {
//       // 1. First Attempt: Admin Login
//       const adminResponse = await fetch(`${API_BASE_URL}/admin/login`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, password }),
//       });

//       const adminData = await adminResponse.json();

//       if (adminResponse.ok) {
//         // Success: Admin Login
//         localStorage.setItem('adminToken', adminData.token);
//         localStorage.setItem('adminId', adminData.admin.id);
//         localStorage.setItem('adminEmail', adminData.admin.email);
//         localStorage.setItem('adminName', adminData.admin.name);
//         localStorage.setItem('userRole', 'admin');
//         navigate('/dashboard');
//         return;
//       }

//       // 2. Second Attempt: Employee Login
//       const empResponse = await fetch(`${API_BASE_URL}/employees/login`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password }),
//       });

//       const empData = await empResponse.json();

//       if (empResponse.ok) {
//         // Success: Employee Login
//         localStorage.setItem("employeeData", JSON.stringify(empData.employee));
//         localStorage.setItem("employeePermissions", JSON.stringify(empData.employee.permissions));
//         localStorage.setItem("employeeId", empData.employee.employeeId);
//         localStorage.setItem("employeeEmail", empData.employee.email);
//         localStorage.setItem("employeeName", empData.employee.name);
//         localStorage.setItem('userRole', 'employee');
//         navigate("/employeedashboard", { state: { email: empData.employee.email } });
//         return;
//       }

//       // 3. Third Attempt: Client Login
//       let clientPayload = {};
      
//       if (loginType === 'email') {
//         clientPayload = { email, password };
//       } else {
//         clientPayload = { clientId, password };
//       }

//       const clientResponse = await fetch(`${API_BASE_URL}/clients/clientlogin`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(clientPayload),
//       });

//       const clientData = await clientResponse.json();

//       if (clientResponse.ok) {
//         // Success: Client Login
//         localStorage.setItem('clientToken', clientData.token);
//         localStorage.setItem('clientId', clientData.client._id);
//         localStorage.setItem('clientCustomId', clientData.client.clientId);
//         localStorage.setItem('clientEmail', clientData.client.email);
//         localStorage.setItem('clientName', clientData.client.name);
//         localStorage.setItem('clientData', JSON.stringify(clientData.client));
//         localStorage.setItem('userRole', 'client');
        
//         // Navigate to client dashboard
//         navigate('/clientdashboard', { 
//           state: { 
//             client: clientData.client,
//             userType: 'client'
//           } 
//         });
//         return;
//       }

//       // 4. All failed
//       throw new Error(clientData.message || empData.message || adminData.message || 'Invalid credentials');

//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gradient-to-br from-blue-100 to-purple-200">
//       <div className="grid w-full max-w-5xl grid-cols-1 overflow-hidden shadow-xl bg-white/80 backdrop-blur-md rounded-2xl md:grid-cols-2">

//         {/* Left Side - Login Form */}
//         <div className="flex flex-col justify-center p-8 md:p-12">
//           <div className="mb-6 text-center">
//             <h1 className="text-4xl font-extrabold text-transparent bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text">
//               LOG IN
//             </h1>
//             <p className="mt-1 text-sm text-gray-500">Admin • Employee • Client</p>
//           </div>

//           {/* Login Type Toggle */}
//           <div className="flex justify-center mb-4">
//             <div className="inline-flex p-1 bg-gray-100 rounded-lg">
//               <button
//                 type="button"
//                 onClick={() => setLoginType('email')}
//                 className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
//                   loginType === 'email' 
//                     ? 'bg-white shadow text-blue-600' 
//                     : 'text-gray-500 hover:text-gray-900'
//                 }`}
//               >
//                 Email Login
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setLoginType('clientId')}
//                 className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
//                   loginType === 'clientId' 
//                     ? 'bg-white shadow text-purple-600' 
//                     : 'text-gray-500 hover:text-gray-900'
//                 }`}
//               >
//                 Client ID
//               </button>
//             </div>
//           </div>

//           {error && (
//             <div className="p-3 mb-4 text-sm text-red-600 bg-red-100 rounded-md shadow-sm">
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-5">
//             {loginType === 'email' ? (
//               <div>
//                 <label className="block text-sm font-medium text-gray-700" htmlFor="email">
//                   Email Address
//                 </label>
//                 <input
//                   type="email"
//                   id="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder="you@domain.com"
//                   className="w-full px-4 py-3 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   required
//                 />
//               </div>
//             ) : (
//               <div>
//                 <label className="block text-sm font-medium text-gray-700" htmlFor="clientId">
//                   Client ID
//                 </label>
//                 <input
//                   type="text"
//                   id="clientId"
//                   value={clientId}
//                   onChange={(e) => setClientId(e.target.value)}
//                   placeholder="CLIENT-XXXXXX"
//                   className="w-full px-4 py-3 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
//                   required
//                 />
//               </div>
//             )}

//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Password
//               </label>
//               <div className="relative mt-1">
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   placeholder="••••••••"
//                   className="w-full px-4 py-3 pr-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   required
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute inset-y-0 flex items-center text-gray-500 right-3 hover:text-blue-600 focus:outline-none"
//                 >
//                   {showPassword ? <FaEyeSlash /> : <FaEye />}
//                 </button>
//               </div>
//             </div>

//             <button
//               type="submit"
//               disabled={isLoading}
//               className={`w-full py-3 text-gray-900 text-sm font-medium rounded-md bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-600 hover:to-blue-600 transition duration-300 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''
//                 }`}
//             >
//               {isLoading ? 'Verifying...' : 'Login'}
//             </button>
//           </form>
          
//           <div className="mt-4 text-center">
//             <p className="text-sm text-gray-500">
//               New client? <a href="/register" className="text-blue-600 hover:underline">Register here</a>
//             </p>
//             <p className="mt-2 text-xs text-gray-500">
//               Admin/Employee: Use email • Client: Email or Client ID
//             </p>
//           </div>
//         </div>

//         {/* Right Side - Image */}
//         <div className="flex items-center justify-center p-6 bg-white/70 md:p-12">
//           <img
//             src="https://t3.ftcdn.net/jpg/04/72/65/82/360_F_472658260_9eT6d4HzAt7lDZ8d5SAb5opOZikRH7AC.jpg"
//             alt="Login Illustration"
//             className="object-contain h-auto max-w-full rounded-md shadow-md"
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;


import { useState, useEffect, useRef } from 'react';
import { FaEye, FaEyeSlash, FaCheckCircle, FaUser } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [clientId, setClientId] = useState('');
  const [loginType, setLoginType] = useState('email');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const navigate = useNavigate();
  const speechTimeoutRef = useRef(null);

  // ─── Female Voice Welcome Function ───
  const speakWelcome = (name, role) => {
    return new Promise((resolve) => {
      if ('speechSynthesis' in window) {
        const message = `Welcome ${name}! You are logged in as ${role}. Have a great day!`;
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'en-US';
        utterance.rate = 0.85;
        utterance.pitch = 1.2;
        utterance.volume = 1;
        
        const voices = window.speechSynthesis.getVoices();
        const femaleVoice = voices.find(voice => 
          voice.name.includes('Female') || 
          voice.name.includes('Samantha') ||
          voice.name.includes('Google UK') || 
          voice.name.includes('Victoria') ||
          voice.name.includes('Zira') ||
          voice.name.includes('Marie') ||
          voice.name.includes('Ellen') ||
          voice.name.includes('Susan') ||
          voice.name.includes('Karen') ||
          voice.name.includes('Siri')
        );
        
        if (femaleVoice) {
          utterance.voice = femaleVoice;
        } else {
          utterance.pitch = 1.3;
        }
        
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        window.speechSynthesis.speak(utterance);
        
        speechTimeoutRef.current = setTimeout(() => resolve(), 8000);
      } else {
        resolve();
      }
    });
  };

  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
    
    return () => {
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. Admin Login
      const adminResponse = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const adminData = await adminResponse.json();

      if (adminResponse.ok) {
        const name = adminData.admin?.name || 'Admin';
        localStorage.setItem('adminToken', adminData.token);
        localStorage.setItem('adminId', adminData.admin?.id || '');
        localStorage.setItem('adminEmail', adminData.admin?.email || '');
        localStorage.setItem('adminName', name);
        localStorage.setItem('userRole', 'admin');
        
        setUserName(name);
        setUserRole('Admin');
        setShowWelcome(true);
        setIsLoading(false);
        
        await speakWelcome(name, 'Admin');
        navigate('/dashboard');
        return;
      }

      // 2. Employee Login
      const empResponse = await fetch(`${API_BASE_URL}/employees/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const empData = await empResponse.json();

      if (empResponse.ok) {
        const employee = empData.employee || {};
        const name = employee.name || 'Employee';
        const role = employee.role || employee.designation || 'Employee';
        const employeeId = employee.employeeId || '';
        
        localStorage.setItem("employeeData", JSON.stringify(employee));
        localStorage.setItem("employeePermissions", JSON.stringify(employee.permissions || []));
        localStorage.setItem("employeeId", employeeId);
        localStorage.setItem("employeeEmail", employee.email || '');
        localStorage.setItem("employeeName", name);
        localStorage.setItem('userRole', 'employee');
        
        setUserName(name);
        setUserRole(role);
        setShowWelcome(true);
        setIsLoading(false);
        
        await speakWelcome(name, role);
        navigate("/employeedashboard", { state: { email: employee.email || '' } });
        return;
      }

      // 3. Client Login
      let clientPayload = {};
      if (loginType === 'email') {
        clientPayload = { email, password };
      } else {
        clientPayload = { clientId, password };
      }

      const clientResponse = await fetch(`http://localhost:5006/api/clients/clientlogin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientPayload),
      });

      const clientData = await clientResponse.json();

      if (clientResponse.ok) {
        const client = clientData.client || {};
        const name = client.name || 'Client';
        
        localStorage.setItem('clientToken', clientData.token);
        localStorage.setItem('clientId', client._id || '');
        localStorage.setItem('clientCustomId', client.clientId || '');
        localStorage.setItem('clientEmail', client.email || '');
        localStorage.setItem('clientName', name);
        localStorage.setItem('clientData', JSON.stringify(client));
        localStorage.setItem('userRole', 'client');
        
        setUserName(name);
        setUserRole('Client');
        setShowWelcome(true);
        setIsLoading(false);
        
        await speakWelcome(name, 'Client');
        navigate('/client-dashboard', { 
          state: { 
            client: client,
            userType: 'client'
          } 
        });
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
      
      {/* ─── WELCOME POPUP ─── */}
      {showWelcome && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-md animate-fadeIn">
          <div className="relative bg-white rounded-3xl p-8 sm:p-12 max-w-md w-full mx-4 shadow-2xl animate-scaleUp border border-gray-100">
            <div className="relative text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-pulse-slow">
                <FaCheckCircle className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 text-3xl animate-sparkle">✨</div>
              <div className="absolute -bottom-2 -left-2 text-2xl animate-sparkle" style={{ animationDelay: '1s' }}>🌟</div>
              
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                Welcome, <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">{userName}</span>! 🎉
              </h2>
              
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-100 border border-gray-200 text-gray-700 text-sm mb-4">
                <FaUser className="w-3 h-3" />
                <span>{userRole}</span>
              </div>
              
              <p className="text-gray-600 text-sm mb-6">
                You have been successfully logged in to <strong className="text-gray-800">INGRAIN'S TMS</strong>
              </p>
              
              <div className="w-full">
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full w-0 bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 rounded-full animate-progressFill"></div>
                </div>
                <p className="text-gray-400 text-xs mt-3 animate-pulse-slow">🔊 Voice welcome in progress...</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── LOGIN CARD ─── */}
      <div className="grid w-full max-w-5xl grid-cols-1 overflow-hidden bg-white rounded-3xl shadow-2xl border border-gray-100 md:grid-cols-2">

        {/* Left Side - Login Form */}
        <div className="flex flex-col justify-center p-8 md:p-12">
          <div className="mb-6 text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-blue-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            </div>
            <h1 className="text-4xl font-extrabold text-transparent bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text">
              LOG IN
            </h1>
            <p className="mt-1 text-sm text-gray-500">Unified Login Access</p>
          </div>

          {error && (
            <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {loginType === 'email' ? (
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
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="clientId">
                  Client ID
                </label>
                <input
                  type="text"
                  id="clientId"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="CLIENT-XXXXXX"
                  className="w-full px-4 py-3 mt-1 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            )}

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
              Admin/Employee: Use email • Client: Email or Client ID
            </p>
          </div>
        </div>

        {/* Right Side - Image */}
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
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes sparkle {
          0%, 100% { transform: rotate(0deg) scale(1); opacity: 1; }
          50% { transform: rotate(20deg) scale(1.2); opacity: 0.8; }
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
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
        .animate-sparkle {
          animation: sparkle 3s ease-in-out infinite;
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