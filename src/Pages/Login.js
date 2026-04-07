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
//             <p className="mt-1 text-sm text-gray-600">Admin • Employee • Client</p>
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
//                     : 'text-gray-600 hover:text-gray-900'
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
//                     : 'text-gray-600 hover:text-gray-900'
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
//               className={`w-full py-3 text-white text-sm font-medium rounded-md bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-600 hover:to-blue-600 transition duration-300 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''
//                 }`}
//             >
//               {isLoading ? 'Verifying...' : 'Login'}
//             </button>
//           </form>
          
//           <div className="mt-4 text-center">
//             <p className="text-sm text-gray-600">
//               New client? <a href="/register" className="text-blue-600 hover:underline">Register here</a>
//             </p>
//             <p className="mt-2 text-xs text-gray-400">
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


import { useState } from 'react';
import { FaEye, FaEyeSlash } from "react-icons/fa";
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
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. First Attempt: Admin Login
      const adminResponse = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const adminData = await adminResponse.json();

      if (adminResponse.ok) {
        // Success: Admin Login
        localStorage.setItem('adminToken', adminData.token);
        localStorage.setItem('adminId', adminData.admin.id);
        localStorage.setItem('adminEmail', adminData.admin.email);
        localStorage.setItem('adminName', adminData.admin.name);
        localStorage.setItem('userRole', 'admin');
        navigate('/dashboard');
        return;
      }

      // 2. Second Attempt: Employee Login
      const empResponse = await fetch(`${API_BASE_URL}/employees/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const empData = await empResponse.json();

      if (empResponse.ok) {
        // Success: Employee Login
        localStorage.setItem("employeeData", JSON.stringify(empData.employee));
        localStorage.setItem("employeePermissions", JSON.stringify(empData.employee.permissions));
        localStorage.setItem("employeeId", empData.employee.employeeId);
        localStorage.setItem("employeeEmail", empData.employee.email);
        localStorage.setItem("employeeName", empData.employee.name);
        localStorage.setItem('userRole', 'employee');
        navigate("/employeedashboard", { state: { email: empData.employee.email } });
        return;
      }

      // 3. Third Attempt: Client Login
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
        // Success: Client Login
        localStorage.setItem('clientToken', clientData.token);
        localStorage.setItem('clientId', clientData.client._id);
        localStorage.setItem('clientCustomId', clientData.client.clientId);
        localStorage.setItem('clientEmail', clientData.client.email);
        localStorage.setItem('clientName', clientData.client.name);
        localStorage.setItem('clientData', JSON.stringify(clientData.client));
        localStorage.setItem('userRole', 'client');
        
        // Navigate to client dashboard
        navigate('/client-dashboard', { 
          state: { 
            client: clientData.client,
            userType: 'client'
          } 
        });
        return;
      }

      // 4. All failed
      throw new Error(clientData.message || empData.message || adminData.message || 'Invalid credentials');

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gradient-to-br from-blue-100 to-purple-200">
      <div className="grid w-full max-w-5xl grid-cols-1 overflow-hidden shadow-xl bg-white/80 backdrop-blur-md rounded-2xl md:grid-cols-2">

        {/* Left Side - Login Form */}
        <div className="flex flex-col justify-center p-8 md:p-12">
          <div className="mb-6 text-center">
            <h1 className="text-4xl font-extrabold text-transparent bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text">
              LOG IN
            </h1>
            <p className="mt-1 text-sm text-gray-600">Unified Login Access</p>
          </div>

          {/* Login Type Toggle */}
          {/* <div className="flex justify-center mb-4">
            <div className="inline-flex p-1 bg-gray-100 rounded-lg">
              <button
                type="button"
                onClick={() => setLoginType('email')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
                  loginType === 'email' 
                    ? 'bg-white shadow text-blue-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Email Login
              </button>
              <button
                type="button"
                onClick={() => setLoginType('clientId')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
                  loginType === 'clientId' 
                    ? 'bg-white shadow text-purple-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Client ID
              </button>
            </div>
          </div> */}

          {error && (
            <div className="p-3 mb-4 text-sm text-red-600 bg-red-100 rounded-md shadow-sm">
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
                  className="w-full px-4 py-3 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-4 py-3 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 flex items-center text-gray-500 right-3 hover:text-blue-600 focus:outline-none"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 text-white text-sm font-medium rounded-md bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-600 hover:to-blue-600 transition duration-300 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
            >
              {isLoading ? 'Verifying...' : 'Login'}
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              New client? <a href="/register" className="text-blue-600 hover:underline">Register here</a>
            </p>
            <p className="mt-2 text-xs text-gray-400">
              Admin/Employee: Use email • Client: Email or Client ID
            </p>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="flex items-center justify-center p-6 bg-white/70 md:p-12">
          <img
            src="https://t3.ftcdn.net/jpg/04/72/65/82/360_F_472658260_9eT6d4HzAt7lDZ8d5SAb5opOZikRH7AC.jpg"
            alt="Login Illustration"
            className="object-contain h-auto max-w-full rounded-md shadow-md"
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
