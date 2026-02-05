import { useState } from 'react';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      const adminResponse = await fetch('https://attendancebackend-5cgn.onrender.com/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const adminData = await adminResponse.json();

      if (adminResponse.ok) {
        // Success: Admin Login
        localStorage.setItem('adminToken', adminData.token);
        localStorage.setItem('adminId', adminData.admin.id);
        localStorage.setItem('adminEmail', adminData.admin.email); // ✅ Store Email for Notifications
        localStorage.setItem('adminName', adminData.admin.name);
        localStorage.setItem('userRole', 'admin');
        navigate('/dashboard');
        return;
      }

      // 2. Second Attempt (if Admin fails): Employee Login
      // Use local backend for development
      const empResponse = await fetch("http://localhost:5000/api/employees/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const empData = await empResponse.json();

      if (empResponse.ok) {
        // Success: Employee Login
        localStorage.setItem("employeeData", JSON.stringify(empData.employee));
        localStorage.setItem("employeePermissions", JSON.stringify(empData.employee.permissions)); // ✅ Store permissions
        localStorage.setItem("employeeId", empData.employee.employeeId);
        localStorage.setItem("employeeEmail", empData.employee.email);
        localStorage.setItem("employeeName", empData.employee.name);
        localStorage.setItem('userRole', 'employee');
        navigate("/employeedashboard", { state: { email: empData.employee.email } });
        return;
      }

      // 3. Both failed
      throw new Error(empData.message || adminData.message || 'Invalid email or password');

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-blue-100 to-purple-200">
      <div className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl w-full max-w-5xl overflow-hidden grid grid-cols-1 md:grid-cols-2">

        {/* Left Side - Login Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              LOG IN 
            </h1>
            <p className="text-gray-600 text-sm mt-1">Unified Login Access</p>
          </div>

          {error && (
            <div className="p-3 text-red-600 bg-red-100 rounded-md shadow-sm text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="email">
                Email / ID
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
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  required
                />

                {/* 👁️ Show/Hide Password Button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-blue-600 focus:outline-none"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 text-white text-sm font-medium rounded-md bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-600 hover:to-blue-600 transition duration-300 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
            >
              {isLoading ? 'Verifying...' : 'Login'}
            </button>
          </form>
        </div>

        {/* Right Side - Image */}
        <div className="bg-white/70 flex items-center justify-center p-6 md:p-12">
          <img
            src="https://t3.ftcdn.net/jpg/04/72/65/82/360_F_472658260_9eT6d4HzAt7lDZ8d5SAb5opOZikRH7AC.jpg"
            alt="Attendance Illustration"
            className="max-w-full h-auto object-contain rounded-md shadow-md"
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
