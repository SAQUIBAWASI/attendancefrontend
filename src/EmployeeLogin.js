import { useState } from "react";
import { useNavigate } from "react-router-dom";

const EmployeeLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // ✅ Login API call
      const response = await fetch("https://attendancebackend-5cgn.onrender.com/api/employees/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Login failed");

      // ✅ Store full employee data in localStorage
      localStorage.setItem("employeeData", JSON.stringify(data.employee));

      // ✅ Optionally store message or token (if any)
      localStorage.setItem("loginMessage", data.message || "Login successful");

      // ✅ Navigate to employee dashboard
      navigate("/employeedashboard", { state: { email: data.employee.email } });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gradient-to-br from-green-100 to-teal-200">
      <div className="grid w-full max-w-5xl grid-cols-1 overflow-hidden shadow-xl bg-white/80 backdrop-blur-md rounded-2xl md:grid-cols-2">
        {/* Login Form */}
        <div className="flex flex-col justify-center p-8 md:p-12">
          <div className="mb-6 text-center">
            <h1 className="text-4xl font-extrabold text-transparent bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text">
              Attendance
            </h1>
            <p className="mt-1 text-sm text-gray-600">Employee Login</p>
          </div>

          {error && (
            <div className="p-3 mb-4 text-sm text-red-600 bg-red-100 rounded-md shadow-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full px-4 py-3 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 text-white text-sm font-medium rounded-md bg-gradient-to-r from-green-600 to-teal-600 hover:from-teal-600 hover:to-green-600 transition duration-300 ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>

        {/* Illustration */}
        <div className="flex items-center justify-center p-6 bg-white/70 md:p-12">
          <img
            src="https://cdn-icons-png.flaticon.com/512/1995/1995574.png"
            alt="Employee Illustration"
            className="object-contain h-auto max-w-full rounded-md shadow-md"
          />
        </div>
      </div>
    </div>
  );
};

export default EmployeeLogin;
