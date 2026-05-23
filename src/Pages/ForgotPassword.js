import React, { useState } from 'react';
import { API_BASE_URL } from '../config';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState('employee'); // Default to employee
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsLoading(true);

    try {
      // Use the new unified password reset endpoint
      const response = await fetch(`${API_BASE_URL}/password-reset/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: userType }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Password reset email sent. Please check your inbox.');
      } else {
        throw new Error(data.message || 'Failed to send password reset email.');
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
            Forgot Password
          </h1>
          <p className="mt-2 text-sm text-gray-500">Enter your email to receive a reset link</p>
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
            <label className="block text-sm font-medium text-gray-700" htmlFor="userType">
              Account Type
            </label>
            <select
              id="userType"
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              className="w-full px-4 py-3 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="admin">Admin</option>
              <option value="employee">Employee</option>
              <option value="client">Client</option>
            </select>
          </div>

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

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 text-gray-900 text-sm font-medium rounded-md bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-600 hover:to-blue-600 transition duration-300 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            Remembered your password? <a href="/login" className="text-blue-600 hover:underline">Log in here</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
