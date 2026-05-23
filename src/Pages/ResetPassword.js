import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { API_BASE_URL } from '../config';

const ResetPassword = () => {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const userType = searchParams.get('type') || 'employee'; // Fallback to employee if missing
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/password-reset/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, type: userType }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Password has been reset successfully. Redirecting to login...');
        setTimeout(() => navigate('/login'), 3000);
      } else {
        throw new Error(data.message || 'Failed to reset password.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gradient-to-br from-blue-100 to-purple-200">
      <div className="w-full max-w-md p-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-extrabold text-transparent bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text">
            Reset Password
          </h1>
          <p className="mt-2 text-sm text-gray-500">Create a new secure password</p>
        </div>

        {message && (
          <div className="p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-md shadow-sm">
            {message}
          </div>
        )}
        
        {error && (
          <div className="p-3 mb-4 text-sm text-red-600 bg-red-100 rounded-md shadow-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              New Password
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

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <div className="relative mt-1">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 flex items-center text-gray-500 right-3 hover:text-blue-600 focus:outline-none"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 text-gray-900 text-sm font-medium rounded-md bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-600 hover:to-blue-600 transition duration-300 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
