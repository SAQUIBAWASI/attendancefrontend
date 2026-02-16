// import { useState } from 'react';
// import { FaEye, FaEyeSlash } from "react-icons/fa";
// import { Link, useNavigate } from 'react-router-dom';

// const RegisterPage = () => {
//     const [formData, setFormData] = useState({
//         clientName: '',
//         companyName: '',
//         email: '',
//         phone: '',
//         password: '',
//         address: '',
//         country: '',
//     });
//     const [error, setError] = useState('');
//     const [success, setSuccess] = useState('');
//     const [isLoading, setIsLoading] = useState(false);
//     const [showPassword, setShowPassword] = useState(false);
//     const navigate = useNavigate();

//     const handleChange = (e) => {
//         setFormData({ ...formData, [e.target.name]: e.target.value });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setError('');
//         setSuccess('');
//         setIsLoading(true);

//         try {
//             const response = await fetch('http://localhost:5000/api/client-requests/register', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(formData),
//             });

//             const data = await response.json();

//             if (response.ok) {
//                 setSuccess(data.message);
//                 setTimeout(() => {
//                     navigate('/login');
//                 }, 2000);
//             } else {
//                 throw new Error(data.message || 'Registration failed');
//             }
//         } catch (err) {
//             setError(err.message);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     return (
//         <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-blue-100 to-purple-200">
//             <div className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl w-full max-w-5xl overflow-hidden grid grid-cols-1 md:grid-cols-2">

//                 {/* Left Side - Register Form */}
//                 <div className="p-8 md:p-12 flex flex-col justify-center">
//                     <div className="text-center mb-6">
//                         <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
//                             CLIENT REGISTRATION
//                         </h1>
//                         <p className="text-gray-600 text-sm mt-1">Join us today</p>
//                     </div>

//                     {error && (
//                         <div className="p-3 text-red-600 bg-red-100 rounded-md shadow-sm text-sm mb-4">
//                             {error}
//                         </div>
//                     )}
//                     {success && (
//                         <div className="p-3 text-green-600 bg-green-100 rounded-md shadow-sm text-sm mb-4">
//                             {success}
//                         </div>
//                     )}

//                     <form onSubmit={handleSubmit} className="space-y-4">
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700">Client Name</label>
//                                 <input type="text" name="clientName" value={formData.clientName} onChange={handleChange} required className="w-full px-4 py-2 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700">Company Name</label>
//                                 <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} required className="w-full px-4 py-2 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
//                             </div>
//                         </div>

//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700">Email</label>
//                                 <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-2 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700">Phone</label>
//                                 <input type="text" name="phone" value={formData.phone} onChange={handleChange} required className="w-full px-4 py-2 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
//                             </div>
//                         </div>

//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700">Country</label>
//                                 <input type="text" name="country" value={formData.country} onChange={handleChange} required className="w-full px-4 py-2 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700">Address</label>
//                                 <input type="text" name="address" value={formData.address} onChange={handleChange} required className="w-full px-4 py-2 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
//                             </div>
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700">Password</label>
//                             <div className="relative mt-1">
//                                 <input
//                                     type={showPassword ? "text" : "password"}
//                                     name="password"
//                                     value={formData.password}
//                                     onChange={handleChange}
//                                     required
//                                     className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
//                                 />
//                                 <button
//                                     type="button"
//                                     onClick={() => setShowPassword(!showPassword)}
//                                     className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-blue-600 focus:outline-none"
//                                 >
//                                     {showPassword ? <FaEyeSlash /> : <FaEye />}
//                                 </button>
//                             </div>
//                         </div>

//                         <button
//                             type="submit"
//                             disabled={isLoading}
//                             className={`w-full py-3 text-white text-sm font-medium rounded-md bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-600 hover:to-blue-600 transition duration-300 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
//                         >
//                             {isLoading ? 'Submitting...' : 'Register'}
//                         </button>

//                         <div className="text-center mt-4">
//                             <p className="text-sm text-gray-600">Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login here</Link></p>
//                         </div>
//                     </form>
//                 </div>

//                 {/* Right Side - Image */}
//                 <div className="bg-white/70 flex items-center justify-center p-6 md:p-12">
//                     <img
//                         src="https://img.freepik.com/free-vector/sign-up-concept-illustration_114360-7885.jpg"
//                         alt="Registration Illustration"
//                         className="max-w-full h-auto object-contain rounded-md shadow-md"
//                     />
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default RegisterPage;

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        mobileNumber: '',
        companyName: '',
        numberOfEmployees: '',
        address: '',
        country: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/client-requests/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(data.message);
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                throw new Error(data.message || 'Registration failed');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-blue-100 to-purple-200">
            <div className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl w-full max-w-5xl overflow-hidden grid grid-cols-1 md:grid-cols-2">

                {/* Left Side - Register Form */}
                <div className="p-8 md:p-12 flex flex-col justify-center">
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                            CLIENT REGISTRATION
                        </h1>
                        <p className="text-gray-600 text-sm mt-1">Join us today</p>
                    </div>

                    {error && (
                        <div className="p-3 text-red-600 bg-red-100 rounded-md shadow-sm text-sm mb-4">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-3 text-green-600 bg-green-100 rounded-md shadow-sm text-sm mb-4">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Mobile Number *</label>
                                <input
                                    type="text"
                                    name="mobileNumber"
                                    value={formData.mobileNumber}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Company Name *</label>
                                <input
                                    type="text"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Number of Employees *</label>
                                <select
                                    name="numberOfEmployees"
                                    value={formData.numberOfEmployees}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select</option>
                                    <option value="1-10">1-10</option>
                                    <option value="11-50">11-50</option>
                                    <option value="51-200">51-200</option>
                                    <option value="201-500">201-500</option>
                                    <option value="501-1000">501-1000</option>
                                    <option value="1000+">1000+</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Country *</label>
                                <input
                                    type="text"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Address *</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-3 text-white text-sm font-medium rounded-md bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-600 hover:to-blue-600 transition duration-300 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? 'Submitting...' : 'Register'}
                        </button>

                        <div className="text-center mt-4">
                            <p className="text-sm text-gray-600">Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login here</Link></p>
                        </div>
                    </form>
                </div>

                {/* Right Side - Image */}
                <div className="bg-white/70 flex items-center justify-center p-6 md:p-12">
                    <img
                        src="https://img.freepik.com/free-vector/sign-up-concept-illustration_114360-7885.jpg"
                        alt="Registration Illustration"
                        className="max-w-full h-auto object-contain rounded-md shadow-md"
                    />
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
