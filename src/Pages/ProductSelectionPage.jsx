import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const SelectProducts = () => {
    const [selectedApps, setSelectedApps] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [registrationData, setRegistrationData] = useState(null);
    const navigate = useNavigate();

    // Fetch registration data on component mount
    useEffect(() => {
        const registrationId = sessionStorage.getItem('registrationId');
        if (!registrationId) {
            setError('No registration found. Please register first.');
            setTimeout(() => navigate('/register'), 3000);
        }
    }, [navigate]);

    // Products based on your image
    const products = [
        // Row 1
        { id: 'hr', name: 'HR', icon: '👥', category: 'Management' },
        { id: 'attendance', name: 'Attendance', icon: '📅', category: 'Management' },
        { id: 'coworking', name: 'Co-Working', icon: '🏢', category: 'Workspace' },
        { id: 'projects', name: 'Projects', icon: '📊', category: 'Management' },
        { id: 'appointments', name: 'Appointments', icon: '📅', category: 'Scheduling' },
        { id: 'wellness', name: 'Wellness', icon: '🧘', category: 'Health' },
        
        // Row 2
        { id: 'support', name: 'Support', icon: '🎫', category: 'Service' },
        { id: 'security', name: 'Security', icon: '🔒', category: 'Safety' },
        { id: 'accounting', name: 'Accounting', icon: '💰', category: 'Finance' },
        { id: 'knowledge', name: 'Knowledge', icon: '📚', category: 'Learning' },
        { id: 'studio', name: 'Studio', icon: '🎨', category: 'Creative' },
        { id: 'rentals', name: 'Rentals', icon: '🏠', category: 'Property' },
        
        // Row 3
        { id: 'sign', name: 'Sign', icon: '✍️', category: 'Documents' },
        { id: 'crm', name: 'CRM', icon: '🤝', category: 'Sales' },
        { id: 'subscriptions', name: 'Subscriptions', icon: '📋', category: 'Billing' },
        { id: 'pos', name: 'POS', icon: '💳', category: 'Sales' },
        { id: 'discuss', name: 'Discuss', icon: '💬', category: 'Communication' },
        { id: 'documents', name: 'Documents', icon: '📄', category: 'Storage' }
    ];

    const toggleProduct = (productId) => {
        setSelectedApps(prev => {
            if (prev.includes(productId)) {
                return prev.filter(id => id !== productId);
            } else {
                return [...prev, productId];
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        const registrationId = sessionStorage.getItem('registrationId');
        
        if (!registrationId) {
            setError('Registration session expired. Please register again.');
            setTimeout(() => navigate('/register'), 2000);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/client-requests/select-products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    registrationId,
                    selectedApps: selectedApps
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Products selected successfully! Your request has been submitted for approval.');
                sessionStorage.removeItem('registrationId');
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                throw new Error(data.message || 'Failed to submit product selection');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Split products into rows of 6 for better display
    const productRows = [];
    for (let i = 0; i < products.length; i += 6) {
        productRows.push(products.slice(i, i + 6));
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 py-12 px-4">
            <div className="max-w-6xl mx-auto bg-white/90 backdrop-blur-md shadow-xl rounded-2xl p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold bg-gradient-to-r from-green-600 to-blue-600 text-transparent bg-clip-text mb-2">
                        Explore Our Solutions
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Click on any app to get started
                    </p>
                </div>

                {/* Error/Success Messages */}
                {error && (
                    <div className="p-4 text-red-600 bg-red-100 rounded-lg shadow-sm mb-6">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="p-4 text-green-600 bg-green-100 rounded-lg shadow-sm mb-6">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Product Grid - Display in rows like your image */}
                    <div className="space-y-6 mb-8">
                        {productRows.map((row, rowIndex) => (
                            <div key={rowIndex} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                {row.map(product => (
                                    <button
                                        key={product.id}
                                        type="button"
                                        onClick={() => toggleProduct(product.id)}
                                        className={`p-6 rounded-xl border-2 transition-all duration-200 text-center group ${
                                            selectedApps.includes(product.id)
                                                ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-105 ring-2 ring-blue-300'
                                                : 'border-gray-200 hover:border-blue-300 hover:shadow-md hover:bg-white'
                                        }`}
                                    >
                                        <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                                            {product.icon}
                                        </div>
                                        <div className={`font-semibold ${
                                            selectedApps.includes(product.id) 
                                                ? 'text-blue-700' 
                                                : 'text-gray-700'
                                        }`}>
                                            {product.name}
                                        </div>
                                        {selectedApps.includes(product.id) && (
                                            <div className="mt-2">
                                                <span className="inline-flex items-center px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                                                    ✓ Selected
                                                </span>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* View All Apps Link */}
                    <div className="text-center mb-6">
                        <button
                            type="button"
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm inline-flex items-center gap-1"
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        >
                            View all Apps 
                            <span className="text-lg">→</span>
                        </button>
                    </div>

                    {/* Quote Section */}
                    <div className="text-center mb-8">
                        <p className="text-gray-600 italic">
                            "Imagine a vast collection of business apps at your disposal."
                        </p>
                        <p className="text-gray-700 font-medium mt-2">
                            Got something to improve? There is an app for that.
                        </p>
                        <p className="text-gray-500 text-sm mt-1">
                            No complexity, no cost, just a click install!
                        </p>
                    </div>

                    {/* Selected Apps Summary */}
                    {selectedApps.length > 0 && (
                        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                        {selectedApps.length}
                                    </span>
                                    <span className="text-gray-700 font-medium">app(s) selected:</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {selectedApps.map(id => {
                                        const product = products.find(p => p.id === id);
                                        return (
                                            <span key={id} className="px-3 py-1 bg-white rounded-full text-sm border border-blue-300 text-blue-700">
                                                {product?.icon} {product?.name}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex flex-col items-center gap-4">
                        <button
                            type="submit"
                            disabled={isLoading || selectedApps.length === 0}
                            className={`px-10 py-4 text-white font-semibold rounded-lg bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-600 hover:to-blue-600 transition duration-300 transform hover:scale-105 ${
                                isLoading || selectedApps.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Submitting...
                                </span>
                            ) : (
                                'Submit Product Selection'
                            )}
                        </button>
                        
                        {selectedApps.length === 0 && (
                            <p className="text-gray-500 text-sm">
                                👆 Click on any app above to select it
                            </p>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SelectProducts;