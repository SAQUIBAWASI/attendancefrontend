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
//         <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gradient-to-br from-blue-100 to-purple-200">
//             <div className="grid w-full max-w-5xl grid-cols-1 overflow-hidden shadow-xl bg-white/80 backdrop-blur-md rounded-2xl md:grid-cols-2">

//                 {/* Left Side - Register Form */}
//                 <div className="flex flex-col justify-center p-8 md:p-12">
//                     <div className="mb-6 text-center">
//                         <h1 className="text-3xl font-extrabold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
//                             CLIENT REGISTRATION
//                         </h1>
//                         <p className="mt-1 text-sm text-gray-600">Join us today</p>
//                     </div>

//                     {error && (
//                         <div className="p-3 mb-4 text-sm text-red-600 bg-red-100 rounded-md shadow-sm">
//                             {error}
//                         </div>
//                     )}
//                     {success && (
//                         <div className="p-3 mb-4 text-sm text-green-600 bg-green-100 rounded-md shadow-sm">
//                             {success}
//                         </div>
//                     )}

//                     <form onSubmit={handleSubmit} className="space-y-4">
//                         <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700">Client Name</label>
//                                 <input type="text" name="clientName" value={formData.clientName} onChange={handleChange} required className="w-full px-4 py-2 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700">Company Name</label>
//                                 <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} required className="w-full px-4 py-2 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
//                             </div>
//                         </div>

//                         <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700">Email</label>
//                                 <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-2 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700">Phone</label>
//                                 <input type="text" name="phone" value={formData.phone} onChange={handleChange} required className="w-full px-4 py-2 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
//                             </div>
//                         </div>

//                         <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
//                                     className="w-full px-4 py-2 pr-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                 />
//                                 <button
//                                     type="button"
//                                     onClick={() => setShowPassword(!showPassword)}
//                                     className="absolute inset-y-0 flex items-center text-gray-500 right-3 hover:text-blue-600 focus:outline-none"
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

//                         <div className="mt-4 text-center">
//                             <p className="text-sm text-gray-600">Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login here</Link></p>
//                         </div>
//                     </form>
//                 </div>

//                 {/* Right Side - Image */}
//                 <div className="flex items-center justify-center p-6 bg-white/70 md:p-12">
//                     <img
//                         src="https://img.freepik.com/free-vector/sign-up-concept-illustration_114360-7885.jpg"
//                         alt="Registration Illustration"
//                         className="object-contain h-auto max-w-full rounded-md shadow-md"
//                     />
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default RegisterPage;

// import { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { API_BASE_URL } from '../config';

// const RegisterPage = () => {
//     const [formData, setFormData] = useState({
//         fullName: '',
//         email: '',
//         mobileNumber: '',
//         companyName: '',
//         numberOfEmployees: '',
//         address: '',
//         country: '',
//     });
//     const [error, setError] = useState('');
//     const [success, setSuccess] = useState('');
//     const [isLoading, setIsLoading] = useState(false);
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
//             const response = await fetch(`${API_BASE_URL}/client-requests/register`, {
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
//         <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gradient-to-br from-blue-100 to-purple-200">
//             <div className="grid w-full max-w-5xl grid-cols-1 overflow-hidden shadow-xl bg-white/80 backdrop-blur-md rounded-2xl md:grid-cols-2">

//                 {/* Left Side - Register Form */}
//                 <div className="flex flex-col justify-center p-8 md:p-12">
//                     <div className="mb-6 text-center">
//                         <h1 className="text-3xl font-extrabold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
//                             CLIENT REGISTRATION
//                         </h1>
//                         <p className="mt-1 text-sm text-gray-600">Join us today</p>
//                     </div>

//                     {error && (
//                         <div className="p-3 mb-4 text-sm text-red-600 bg-red-100 rounded-md shadow-sm">
//                             {error}
//                         </div>
//                     )}
//                     {success && (
//                         <div className="p-3 mb-4 text-sm text-green-600 bg-green-100 rounded-md shadow-sm">
//                             {success}
//                         </div>
//                     )}

//                     <form onSubmit={handleSubmit} className="space-y-4">
//                         <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700">Full Name *</label>
//                                 <input
//                                     type="text"
//                                     name="fullName"
//                                     value={formData.fullName}
//                                     onChange={handleChange}
//                                     required
//                                     className="w-full px-4 py-2 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                 />
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700">Email *</label>
//                                 <input
//                                     type="email"
//                                     name="email"
//                                     value={formData.email}
//                                     onChange={handleChange}
//                                     required
//                                     className="w-full px-4 py-2 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                 />
//                             </div>
//                         </div>

//                         <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700">Mobile Number *</label>
//                                 <input
//                                     type="text"
//                                     name="mobileNumber"
//                                     value={formData.mobileNumber}
//                                     onChange={handleChange}
//                                     required
//                                     className="w-full px-4 py-2 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                 />
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700">Company Name *</label>
//                                 <input
//                                     type="text"
//                                     name="companyName"
//                                     value={formData.companyName}
//                                     onChange={handleChange}
//                                     required
//                                     className="w-full px-4 py-2 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                 />
//                             </div>
//                         </div>

//                         <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700">Number of Employees *</label>
//                                 <select
//                                     name="numberOfEmployees"
//                                     value={formData.numberOfEmployees}
//                                     onChange={handleChange}
//                                     required
//                                     className="w-full px-4 py-2 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                 >
//                                     <option value="">Select</option>
//                                     <option value="1-10">1-10</option>
//                                     <option value="11-50">11-50</option>
//                                     <option value="51-200">51-200</option>
//                                     <option value="201-500">201-500</option>
//                                     <option value="501-1000">501-1000</option>
//                                     <option value="1000+">1000+</option>
//                                 </select>
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700">Country *</label>
//                                 <input
//                                     type="text"
//                                     name="country"
//                                     value={formData.country}
//                                     onChange={handleChange}
//                                     required
//                                     className="w-full px-4 py-2 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                 />
//                             </div>
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700">Address *</label>
//                             <input
//                                 type="text"
//                                 name="address"
//                                 value={formData.address}
//                                 onChange={handleChange}
//                                 required
//                                 className="w-full px-4 py-2 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             />
//                         </div>

//                         <button
//                             type="submit"
//                             disabled={isLoading}
//                             className={`w-full py-3 text-white text-sm font-medium rounded-md bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-600 hover:to-blue-600 transition duration-300 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
//                         >
//                             {isLoading ? 'Submitting...' : 'Register'}
//                         </button>

//                         <div className="mt-4 text-center">
//                             <p className="text-sm text-gray-600">Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login here</Link></p>
//                         </div>
//                     </form>
//                 </div>

//                 {/* Right Side - Image */}
//                 <div className="flex items-center justify-center p-6 bg-white/70 md:p-12">
//                     <img
//                         src="https://img.freepik.com/free-vector/sign-up-concept-illustration_114360-7885.jpg"
//                         alt="Registration Illustration"
//                         className="object-contain h-auto max-w-full rounded-md shadow-md"
//                     />
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default RegisterPage;


import { countries } from 'countries-list'; // Fixed: named import instead of default
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { API_BASE_URL } from '../config';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        mobileNumber: '',
        companyName: '',
        numberOfEmployees: '',
        address: '',
        pincode: '',
        city: '',
        state: '',
        country: null,
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isPincodeLoading, setIsPincodeLoading] = useState(false);
    const navigate = useNavigate();

    // Prepare country options for react-select
    const countryOptions = Object.entries(countries).map(([code, country]) => ({
        value: code,
        label: country.name,
        phone: country.phone
    })).sort((a, b) => a.label.localeCompare(b.label));

    // Rest of your component code remains the same...
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCountryChange = (selectedOption) => {
        setFormData({ ...formData, country: selectedOption });
    };

    // Fetch location details from pincode
    const fetchPincodeDetails = async (pincode) => {
        if (pincode.length === 6) {
            setIsPincodeLoading(true);
            try {
                // Using a free pincode API (you can replace with your preferred API)
                const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
                const data = await response.json();
                
                if (data[0].Status === 'Success') {
                    const postOffice = data[0].PostOffice[0];
                    setFormData(prev => ({
                        ...prev,
                        city: postOffice.District,
                        state: postOffice.State
                    }));
                    setError(''); // Clear any previous error
                } else {
                    setError('Invalid Pincode');
                }
            } catch (err) {
                console.error('Error fetching pincode details:', err);
                setError('Failed to fetch location details');
            } finally {
                setIsPincodeLoading(false);
            }
        }
    };

    // Handle pincode change with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (formData.pincode && formData.pincode.length === 6) {
                fetchPincodeDetails(formData.pincode);
            }
        }, 500); // Debounce for 500ms

        return () => clearTimeout(timer);
    }, [formData.pincode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        // Validate that city and state are filled
        if (!formData.city || !formData.state) {
            setError('Please enter a valid pincode to fetch city and state');
            setIsLoading(false);
            return;
        }

        // Prepare data for submission
        const submissionData = {
            ...formData,
            country: formData.country ? formData.country.label : '',
            countryCode: formData.country ? formData.country.value : '',
            fullAddress: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`
        };

        try {
            const response = await fetch(`${API_BASE_URL}/client-requests/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(data.message);
                // Store registration ID in session storage for product selection
                sessionStorage.setItem('registrationId', data.requestId);
                setTimeout(() => {
                    navigate('/productselection');
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
        <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gradient-to-br from-blue-100 to-purple-200">
            <div className="grid w-full max-w-5xl grid-cols-1 overflow-hidden shadow-xl bg-white/80 backdrop-blur-md rounded-2xl md:grid-cols-2">
                {/* Left Side - Register Form */}
                <div className="flex flex-col justify-center p-8 md:p-12">
                    <div className="mb-6 text-center">
                        <h1 className="text-3xl font-extrabold text-transparent bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text">
                            CLIENT REGISTRATION
                        </h1>
                        <p className="mt-1 text-sm text-gray-600">Join us today</p>
                    </div>

                    {error && (
                        <div className="p-3 mb-4 text-sm text-red-600 bg-red-100 rounded-md shadow-sm">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-3 mb-4 text-sm text-green-600 bg-green-100 rounded-md shadow-sm">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                                <Select
                                    options={countryOptions}
                                    value={formData.country}
                                    onChange={handleCountryChange}
                                    isSearchable={true}
                                    placeholder="Search country..."
                                    className="mt-1 text-sm"
                                    required
                                    styles={{
                                        control: (base) => ({
                                            ...base,
                                            minHeight: '42px',
                                            borderColor: '#d1d5db'
                                        })
                                    }}
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
                                placeholder="Street address"
                                className="w-full px-4 py-2 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Pincode *</label>
                                <input
                                    type="text"
                                    name="pincode"
                                    value={formData.pincode}
                                    onChange={handleChange}
                                    required
                                    maxLength="6"
                                    placeholder="Enter 6-digit pincode"
                                    className="w-full px-4 py-2 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {isPincodeLoading && (
                                    <p className="mt-1 text-xs text-gray-500">Fetching location...</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">City *</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    required
                                    readOnly
                                    className="w-full px-4 py-2 mt-1 text-sm border border-gray-300 rounded-md bg-gray-50 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">State *</label>
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    required
                                    readOnly
                                    className="w-full px-4 py-2 mt-1 text-sm border border-gray-300 rounded-md bg-gray-50 focus:outline-none"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-3 text-white text-sm font-medium rounded-md bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-600 hover:to-blue-600 transition duration-300 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? 'Submitting...' : 'Register'}
                        </button>

                        <div className="mt-4 text-center">
                            <p className="text-sm text-gray-600">Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login here</Link></p>
                        </div>
                    </form>
                </div>

                {/* Right Side - Image */}
                <div className="flex items-center justify-center p-6 bg-white/70 md:p-12">
                    <img
                        src="https://img.freepik.com/free-vector/sign-up-concept-illustration_114360-7885.jpg"
                        alt="Registration Illustration"
                        className="object-contain h-auto max-w-full rounded-md shadow-md"
                    />
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;