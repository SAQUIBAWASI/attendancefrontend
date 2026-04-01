import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  BookOpen,
  Briefcase,
  Building2,
  CalendarDays,
  Clock,
  Coffee,
  DollarSign,
  FileText,
  Heart,
  HeartPulse,
  Home,
  Key,
  Lock,
  LogIn,
  Mail,
  MessageCircle,
  Package,
  Rocket,
  Settings,
  Shield,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  User,
  Users
} from "lucide-react";
import { useEffect, useState } from 'react';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [clientId, setClientId] = useState('');
  const [loginType, setLoginType] = useState('email');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [clientData, setClientData] = useState(null);
  const navigate = useNavigate();

  // Check localStorage on component mount
  useEffect(() => {
    const storedShowProducts = localStorage.getItem('showProducts');
    const storedClientData = localStorage.getItem('clientData');
    
    if (storedShowProducts === 'true' && storedClientData) {
      setShowProducts(true);
      setClientData(JSON.parse(storedClientData));
    }
  }, []);

  // Product icons mapping - UPDATED to include camp mapping to health/bmi
  const productIcons = {
    // Attendance Section
    attendance: { icon: <Clock size={24} />, color: "bg-blue-100 text-blue-600", name: "Attendance", section: "attendance" },
    
    // Co-Working Section
    coworking: { icon: <Building2 size={24} />, color: "bg-purple-100 text-purple-600", name: "Co-Working", section: "coworking" },
    
    // BMI & Health Section - Multiple keywords map to same section
    bmi: { icon: <Heart size={24} />, color: "bg-red-100 text-red-600", name: "BMI", section: "bmi" },
    health: { icon: <HeartPulse size={24} />, color: "bg-red-100 text-red-600", name: "Health", section: "bmi" },
    wellness: { icon: <HeartPulse size={24} />, color: "bg-red-100 text-red-600", name: "Wellness", section: "bmi" },
    camp: { icon: <Users size={24} />, color: "bg-red-100 text-red-600", name: "Health Camp", section: "bmi" }, // CAMP maps to BMI section
    
    // Other products
    hr: { icon: <Users size={24} />, color: "bg-pink-100 text-pink-600", name: "HR", section: "hr" },
    projects: { icon: <Briefcase size={24} />, color: "bg-orange-100 text-orange-600", name: "Projects", section: "projects" },
    appointments: { icon: <CalendarDays size={24} />, color: "bg-green-100 text-green-600", name: "Appointments", section: "appointments" },
    support: { icon: <MessageCircle size={24} />, color: "bg-indigo-100 text-indigo-600", name: "Support", section: "support" },
    security: { icon: <ShieldCheck size={24} />, color: "bg-teal-100 text-teal-600", name: "Security", section: "security" },
    accounting: { icon: <FileText size={24} />, color: "bg-amber-100 text-amber-600", name: "Accounting", section: "accounting" },
    knowledge: { icon: <BookOpen size={24} />, color: "bg-cyan-100 text-cyan-600", name: "Knowledge", section: "knowledge" },
    sign: { icon: <User size={24} />, color: "bg-lime-100 text-lime-600", name: "Sign", section: "sign" },
    crm: { icon: <Users size={24} />, color: "bg-rose-100 text-rose-600", name: "CRM", section: "crm" },
    studio: { icon: <Settings size={24} />, color: "bg-fuchsia-100 text-fuchsia-600", name: "Studio", section: "studio" },
    subscriptions: { icon: <Coffee size={24} />, color: "bg-violet-100 text-violet-600", name: "Subscriptions", section: "subscriptions" },
    rental: { icon: <Home size={24} />, color: "bg-yellow-100 text-yellow-600", name: "Rental", section: "rental" },
    pos: { icon: <DollarSign size={24} />, color: "bg-orange-100 text-orange-600", name: "POS", section: "pos" },
    discuss: { icon: <MessageCircle size={24} />, color: "bg-emerald-100 text-emerald-600", name: "Discuss", section: "discuss" },
    documents: { icon: <FileText size={24} />, color: "bg-sky-100 text-sky-600", name: "Documents", section: "documents" },
    project: { icon: <Briefcase size={24} />, color: "bg-indigo-100 text-indigo-600", name: "Project", section: "project" },
    timesheets: { icon: <Clock size={24} />, color: "bg-purple-100 text-purple-600", name: "Timesheets", section: "timesheets" },
    purchase: { icon: <ShoppingBag size={24} />, color: "bg-pink-100 text-pink-600", name: "Purchase", section: "purchase" },
    inventory: { icon: <Package size={24} />, color: "bg-blue-100 text-blue-600", name: "Inventory", section: "inventory" },
    manufacturing: { icon: <Settings size={24} />, color: "bg-green-100 text-green-600", name: "Manufacturing", section: "manufacturing" },
    sales: { icon: <TrendingUp size={24} />, color: "bg-red-100 text-red-600", name: "Sales", section: "sales" },
    dashboard: { icon: <Activity size={24} />, color: "bg-yellow-100 text-yellow-600", name: "Dashboard", section: "dashboard" }
  };

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
        localStorage.setItem('adminToken', adminData.token);
        localStorage.setItem('adminId', adminData.admin.id);
        localStorage.setItem('adminName', adminData.admin.name);
        localStorage.setItem('userRole', 'admin');
        localStorage.removeItem('showProducts');
        localStorage.removeItem('clientData');
        navigate('/dashboard');
        return;
      }

      // 2. Second Attempt: Employee Login
      const empResponse = await fetch("https://api.timelyhealth.in/api/employees/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const empData = await empResponse.json();

      if (empResponse.ok) {
        localStorage.setItem("employeeData", JSON.stringify(empData.employee));
        localStorage.setItem("employeeId", empData.employee._id);
        localStorage.setItem("employeeEmail", empData.employee.email);
        localStorage.setItem("employeeName", empData.employee.name);
        localStorage.setItem('userRole', 'employee');
        localStorage.removeItem('showProducts');
        localStorage.removeItem('clientData');
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

      const clientResponse = await fetch('http://localhost:5006/api/clients/clientlogin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientPayload),
      });

      const clientData = await clientResponse.json();

      if (clientResponse.ok) {
        // Store client data
        setClientData(clientData.client);
        localStorage.setItem('clientToken', clientData.token);
        localStorage.setItem('clientId', clientData.client._id);
        localStorage.setItem('clientCustomId', clientData.client.clientId);
        localStorage.setItem('clientName', clientData.client.name);
        localStorage.setItem('clientEmail', clientData.client.email);
        localStorage.setItem('clientData', JSON.stringify(clientData.client));
        localStorage.setItem('userRole', 'client');
        localStorage.setItem('showProducts', 'true');
        
        // Show products page instead of directly navigating
        setShowProducts(true);
        return;
      }

      throw new Error(clientData.message || empData.message || adminData.message || 'Invalid credentials');

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductClick = (product) => {
    // Get the section mapping for the product
    const productInfo = productIcons[product.toLowerCase()];
    const sectionToNavigate = productInfo?.section || product.toLowerCase();
    
    // Navigate to dashboard with product info
    localStorage.removeItem('showProducts'); // Clear products page flag
    navigate('/dashboard', { 
      state: { 
        client: clientData,
        selectedProduct: sectionToNavigate, // Use the mapped section
        userType: 'client'
      } 
    });
  };

  const handleBackToLogin = () => {
    setShowProducts(false);
    setClientData(null);
    localStorage.removeItem('showProducts');
    localStorage.removeItem('clientData');
  };

  // If showing products page
  if (showProducts && clientData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        {/* Animated background */}
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute bg-purple-300 rounded-full top-20 left-10 w-72 h-72 mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute bg-pink-300 rounded-full top-40 right-10 w-72 h-72 mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bg-blue-300 rounded-full bottom-20 left-1/2 w-72 h-72 mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-6xl px-4 py-12 mx-auto">
          {/* Welcome Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-center"
          >
            <div className="inline-flex items-center px-4 py-2 mb-4 rounded-full shadow-sm bg-white/80 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 mr-2 text-yellow-500" />
              <span className="text-sm text-gray-600">Welcome back, {clientData.name}!</span>
            </div>
            
            <h1 className="mb-2 text-3xl font-bold text-gray-800 md:text-4xl">
              Your <span className="text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">Purchased Products</span>
            </h1>
            <p className="text-gray-600">Select a product to access your dashboard</p>
          </motion.div>

          {/* Client Info Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-6 mb-8 border border-gray-100 shadow-lg bg-white/80 backdrop-blur-sm rounded-xl"
          >
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="text-center">
                <p className="text-xs text-gray-500">Client ID</p>
                <p className="text-sm font-medium text-gray-800">{clientData.clientId}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-800">{clientData.email}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Company</p>
                <p className="text-sm font-medium text-gray-800">{clientData.companyName}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Location</p>
                <p className="text-sm font-medium text-gray-800">{clientData.location}</p>
              </div>
            </div>
          </motion.div>

          {/* Products Grid */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
          >
            {clientData.accessibleProducts.map((product, index) => {
              // Normalize product name to lowercase for lookup
              const productKey = product.toLowerCase();
              const productInfo = productIcons[productKey] || {
                icon: <Rocket size={24} />,
                color: "bg-gray-100 text-gray-600",
                name: product.charAt(0).toUpperCase() + product.slice(1),
                section: productKey
              };

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleProductClick(product)}
                  className="relative p-4 overflow-hidden text-center transition-all duration-300 bg-white shadow-sm cursor-pointer rounded-xl hover:shadow-xl group"
                >
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${productInfo.color.replace('100', '500')} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  
                  <div className={`w-14 h-14 mx-auto mb-3 flex items-center justify-center rounded-xl ${productInfo.color} group-hover:scale-110 transition-transform duration-300`}>
                    {productInfo.icon}
                  </div>
                  
                  <p className="text-sm font-medium text-gray-700 group-hover:text-[#714b67] transition">
                    {productInfo.name}
                  </p>
                  
                  <p className="text-[10px] text-gray-400 mt-1">
                    Click to access
                  </p>

                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                    <div className="absolute top-0 block w-1/2 h-full transform -skew-x-12 -inset-full z-5 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine"></div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Bottom actions */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-8 text-center"
          >
            <button
              onClick={handleBackToLogin}
              className="flex items-center justify-center mx-auto text-sm text-gray-500 transition hover:text-gray-700"
            >
              <ArrowRight className="w-4 h-4 mr-1 rotate-180" />
              Back to Login
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Login Page
  return (
    <div className="relative flex items-center justify-center min-h-screen px-4 py-6 overflow-hidden bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          animate={{ 
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute w-64 h-64 bg-blue-300 rounded-full top-20 left-10 mix-blend-multiply filter blur-xl opacity-20"
        ></motion.div>
        <motion.div 
          animate={{ 
            x: [0, -100, 0],
            y: [0, 80, 0],
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute w-64 h-64 bg-purple-300 rounded-full top-40 right-10 mix-blend-multiply filter blur-xl opacity-20"
        ></motion.div>
        <motion.div 
          animate={{ 
            x: [0, 50, 0],
            y: [0, -50, 0],
          }}
          transition={{ 
            duration: 18,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute w-64 h-64 bg-pink-300 rounded-full bottom-20 left-1/2 mix-blend-multiply filter blur-xl opacity-20"
        ></motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 grid w-full max-w-4xl grid-cols-1 overflow-hidden shadow-2xl bg-white/90 backdrop-blur-md rounded-2xl md:grid-cols-2"
      >
        {/* Left Side - Login Form */}
        <div className="flex flex-col justify-center p-6 md:p-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-4 text-center"
          >
            <div className="inline-flex items-center px-3 py-1 mb-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100">
              <Lock className="w-3 h-3 mr-1 text-blue-600" />
              <span className="text-xs text-gray-600">Secure Access</span>
            </div>
            <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
              Welcome Back
            </h1>
            <p className="mt-1 text-xs text-gray-500">Sign in to continue your journey</p>
          </motion.div>

          {/* Login Type Toggle */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex justify-center mb-4"
          >
            <div className="inline-flex p-1 bg-gray-100 rounded-lg">
              <button
                type="button"
                onClick={() => setLoginType('email')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-300 ${
                  loginType === 'email' 
                    ? 'bg-white shadow text-blue-600 scale-105' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Email Login
              </button>
              <button
                type="button"
                onClick={() => setLoginType('clientId')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-300 ${
                  loginType === 'clientId' 
                    ? 'bg-white shadow text-purple-600 scale-105' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Client ID
              </button>
            </div>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-2 mb-3 text-xs text-red-600 border border-red-100 rounded-md bg-red-50"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {loginType === 'email' ? (
                <motion.div
                  key="email-field"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="block mb-1 text-xs font-medium text-gray-700" htmlFor="email">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full px-3 py-2 text-sm transition-all border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="clientid-field"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="block mb-1 text-xs font-medium text-gray-700" htmlFor="clientId">
                    Client ID
                  </label>
                  <input
                    type="text"
                    id="clientId"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    placeholder="CLIENT-XXXXXX"
                    className="w-full px-3 py-2 text-sm transition-all border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <label className="block mb-1 text-xs font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 pr-10 text-sm transition-all border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 flex items-center text-gray-500 transition right-3 hover:text-blue-600"
                >
                  {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </button>
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className={`w-full py-2.5 text-white text-sm font-medium rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 mr-2 border-2 border-white rounded-full border-t-transparent"
                  />
                  Verifying...
                </>
              ) : (
                <>
                  <LogIn size={14} className="mr-2" />
                  Sign In
                </>
              )}
            </motion.button>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="text-center"
            >
              <p className="text-xs text-gray-400">
                Need help? <a href="mailto:support@domain.com" className="text-blue-600 hover:underline">support@domain.com</a>
              </p>
            </motion.div>
          </form>
        </div>

        {/* Right Side - Info Panel */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col items-center justify-center p-6 text-white bg-gradient-to-br from-blue-600 to-purple-600 md:p-8"
        >
          <motion.img
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            src="https://t3.ftcdn.net/jpg/04/72/65/82/360_F_472658260_9eT6d4HzAt7lDZ8d5SAb5opOZikRH7AC.jpg"
            alt="Attendance Illustration"
            className="object-contain h-40 max-w-full mb-4 rounded-lg shadow-xl"
          />
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-center"
          >
            <h3 className="mb-3 text-lg font-semibold">Quick Guide</h3>
            <div className="space-y-2">
              <motion.div 
                whileHover={{ scale: 1.02, x: 5 }}
                className="flex items-center p-2 space-x-2 rounded-lg bg-white/20 backdrop-blur-sm"
              >
                <Mail size={14} />
                <p className="text-xs">Admin/Employee: Use email</p>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.02, x: 5 }}
                className="flex items-center p-2 space-x-2 rounded-lg bg-white/20 backdrop-blur-sm"
              >
                <Key size={14} />
                <p className="text-xs">Client: Email or Client ID</p>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.02, x: 5 }}
                className="flex items-center p-2 space-x-2 rounded-lg bg-white/20 backdrop-blur-sm"
              >
                <Shield size={14} />
                <p className="text-xs">Select product after login</p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes shine {
          100% { left: 150%; }
        }
        .animate-shine {
          animation: shine 1s ease-out;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;


// import { motion } from 'framer-motion';
// import {
//   Activity,
//   ArrowRight,
//   BookOpen,
//   Briefcase,
//   Building2,
//   CalendarDays,
//   Clock,
//   Coffee,
//   DollarSign,
//   FileText,
//   Heart,
//   HeartPulse,
//   Home,
//   MessageCircle,
//   Package,
//   Rocket,
//   Settings,
//   ShieldCheck,
//   ShoppingBag,
//   Sparkles,
//   TrendingUp,
//   User,
//   Users
// } from "lucide-react";
// import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';

// const ProductsPage = () => {
//   const [clientData, setClientData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     // Get data from localStorage
//     const storedClientData = localStorage.getItem('clientData');
//     const showProducts = localStorage.getItem('showProducts');
    
//     console.log('Stored client data:', storedClientData);
//     console.log('Show products:', showProducts);
    
//     if (storedClientData && showProducts === 'true') {
//       try {
//         const parsedData = JSON.parse(storedClientData);
//         console.log('Parsed client data:', parsedData);
//         setClientData(parsedData);
//       } catch (error) {
//         console.error('Error parsing client data:', error);
//         // If data is corrupted, use default data from image
//         setClientData({
//           name: 'test',
//           clientId: 'CLIENT-E25998',
//           email: 'test@gmail.com',
//           companyName: 'Serum Labs',
//           location: 'Hyderabad',
//           accessibleProducts: ['attendance', 'coworking']
//         });
//       }
//     } else {
//       // For testing/demo, use the data from the image
//       console.log('Using demo data from image');
//       setClientData({
//         name: 'test',
//         clientId: 'CLIENT-E25998',
//         email: 'test@gmail.com',
//         companyName: 'Serum Labs',
//         location: 'Hyderabad',
//         accessibleProducts: ['attendance', 'coworking', 'bmi', 'camp', 'health', 'hr', 'projects']
//       });
//     }
//     setLoading(false);
//   }, []);

//   // Product icons mapping
//   const productIcons = {
//     // Attendance Section
//     attendance: { icon: <Clock size={24} />, color: "bg-blue-100 text-blue-600", name: "Attendance" },
    
//     // Co-Working Section
//     coworking: { icon: <Building2 size={24} />, color: "bg-purple-100 text-purple-600", name: "Co-Working" },
    
//     // BMI & Health Section
//     bmi: { icon: <Heart size={24} />, color: "bg-red-100 text-red-600", name: "BMI" },
//     health: { icon: <HeartPulse size={24} />, color: "bg-red-100 text-red-600", name: "Health" },
//     wellness: { icon: <HeartPulse size={24} />, color: "bg-red-100 text-red-600", name: "Wellness" },
//     camp: { icon: <Users size={24} />, color: "bg-red-100 text-red-600", name: "Health Camp" },
    
//     // Other products
//     hr: { icon: <Users size={24} />, color: "bg-pink-100 text-pink-600", name: "HR" },
//     projects: { icon: <Briefcase size={24} />, color: "bg-orange-100 text-orange-600", name: "Projects" },
//     appointments: { icon: <CalendarDays size={24} />, color: "bg-green-100 text-green-600", name: "Appointments" },
//     support: { icon: <MessageCircle size={24} />, color: "bg-indigo-100 text-indigo-600", name: "Support" },
//     security: { icon: <ShieldCheck size={24} />, color: "bg-teal-100 text-teal-600", name: "Security" },
//     accounting: { icon: <FileText size={24} />, color: "bg-amber-100 text-amber-600", name: "Accounting" },
//     knowledge: { icon: <BookOpen size={24} />, color: "bg-cyan-100 text-cyan-600", name: "Knowledge" },
//     sign: { icon: <User size={24} />, color: "bg-lime-100 text-lime-600", name: "Sign" },
//     crm: { icon: <Users size={24} />, color: "bg-rose-100 text-rose-600", name: "CRM" },
//     studio: { icon: <Settings size={24} />, color: "bg-fuchsia-100 text-fuchsia-600", name: "Studio" },
//     subscriptions: { icon: <Coffee size={24} />, color: "bg-violet-100 text-violet-600", name: "Subscriptions" },
//     rental: { icon: <Home size={24} />, color: "bg-yellow-100 text-yellow-600", name: "Rental" },
//     pos: { icon: <DollarSign size={24} />, color: "bg-orange-100 text-orange-600", name: "POS" },
//     discuss: { icon: <MessageCircle size={24} />, color: "bg-emerald-100 text-emerald-600", name: "Discuss" },
//     documents: { icon: <FileText size={24} />, color: "bg-sky-100 text-sky-600", name: "Documents" },
//     project: { icon: <Briefcase size={24} />, color: "bg-indigo-100 text-indigo-600", name: "Project" },
//     timesheets: { icon: <Clock size={24} />, color: "bg-purple-100 text-purple-600", name: "Timesheets" },
//     purchase: { icon: <ShoppingBag size={24} />, color: "bg-pink-100 text-pink-600", name: "Purchase" },
//     inventory: { icon: <Package size={24} />, color: "bg-blue-100 text-blue-600", name: "Inventory" },
//     manufacturing: { icon: <Settings size={24} />, color: "bg-green-100 text-green-600", name: "Manufacturing" },
//     sales: { icon: <TrendingUp size={24} />, color: "bg-red-100 text-red-600", name: "Sales" },
//     dashboard: { icon: <Activity size={24} />, color: "bg-yellow-100 text-yellow-600", name: "Dashboard" }
//   };

//   const handleProductClick = (product) => {
//     console.log('Product clicked:', product);
//     // Navigate to dashboard with product info
//     localStorage.removeItem('showProducts');
//     navigate('/dashboard', { 
//       state: { 
//         client: clientData,
//         selectedProduct: product,
//         userType: 'client'
//       } 
//     });
//   };

//   const handleBackToLogin = () => {
//     localStorage.removeItem('showProducts');
//     localStorage.removeItem('clientData');
//     navigate('/login');
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
//         <div className="w-16 h-16 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
//       </div>
//     );
//   }

//   // Default products from image if nothing else
//   const defaultProducts = [
//     { id: 'attendance', name: 'Attendance', icon: <Clock size={24} />, color: "bg-blue-100 text-blue-600" },
//     { id: 'coworking', name: 'Co-Working', icon: <Building2 size={24} />, color: "bg-purple-100 text-purple-600" }
//   ];

//   const products = clientData?.accessibleProducts?.length > 0 
//     ? clientData.accessibleProducts 
//     : ['attendance', 'coworking'];

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
//       {/* Animated background */}
//       <div className="fixed inset-0 overflow-hidden">
//         <div className="absolute bg-purple-300 rounded-full w-96 h-96 top-20 left-10 mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
//         <div className="absolute bg-pink-300 rounded-full w-96 h-96 top-40 right-10 mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
//         <div className="absolute bg-blue-300 rounded-full w-96 h-96 bottom-20 left-1/2 mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
//       </div>

//       <div className="relative max-w-6xl px-4 py-8 mx-auto sm:py-12">
//         {/* Welcome Header */}
//         <motion.div 
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="mb-6 text-center sm:mb-8"
//         >
//           <div className="inline-flex items-center px-3 py-1 mb-3 rounded-full shadow-sm bg-white/80 backdrop-blur-sm sm:px-4 sm:py-2">
//             <Sparkles className="w-3 h-3 mr-1 text-yellow-500 sm:w-4 sm:h-4 sm:mr-2" />
//             <span className="text-xs text-gray-600 sm:text-sm">
//               Welcome back, {clientData?.name || 'test'}!
//             </span>
//           </div>
          
//           <h1 className="mb-1 text-2xl font-bold text-gray-800 sm:text-3xl md:text-4xl">
//             Your <span className="text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">Purchased Products</span>
//           </h1>
//           <p className="text-xs text-gray-600 sm:text-sm">Select a product to access your dashboard</p>
//         </motion.div>

//         {/* Client Info Card - Exactly as in the image */}
//         <motion.div 
//           initial={{ opacity: 0, scale: 0.95 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ delay: 0.1 }}
//           className="p-4 mb-6 border border-gray-100 shadow-lg bg-white/80 backdrop-blur-sm rounded-xl sm:p-6 sm:mb-8"
//         >
//           <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
//             <div className="text-center">
//               <p className="text-[10px] text-gray-500 sm:text-xs">Client ID</p>
//               <p className="text-xs font-medium text-gray-800 sm:text-sm">
//                 {clientData?.clientId || 'CLIENT-E25998'}
//               </p>
//             </div>
//             <div className="text-center">
//               <p className="text-[10px] text-gray-500 sm:text-xs">Email</p>
//               <p className="text-xs font-medium text-gray-800 sm:text-sm">
//                 {clientData?.email || 'test@gmail.com'}
//               </p>
//             </div>
//             <div className="text-center">
//               <p className="text-[10px] text-gray-500 sm:text-xs">Company</p>
//               <p className="text-xs font-medium text-gray-800 sm:text-sm">
//                 {clientData?.companyName || 'Serum Labs'}
//               </p>
//             </div>
//             <div className="text-center">
//               <p className="text-[10px] text-gray-500 sm:text-xs">Location</p>
//               <p className="text-xs font-medium text-gray-800 sm:text-sm">
//                 {clientData?.location || 'Hyderabad'}
//               </p>
//             </div>
//           </div>
//         </motion.div>

//         {/* Products Grid */}
//         <motion.div 
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.2 }}
//           className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
//         >
//           {products.map((product, index) => {
//             // Get product info from mapping
//             const productKey = typeof product === 'string' ? product.toLowerCase() : '';
//             const productInfo = productIcons[productKey] || {
//               icon: <Rocket size={24} />,
//               color: "bg-gray-100 text-gray-600",
//               name: typeof product === 'string' 
//                 ? product.charAt(0).toUpperCase() + product.slice(1) 
//                 : 'Product'
//             };

//             return (
//               <motion.div
//                 key={index}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: index * 0.05 }}
//                 whileHover={{ scale: 1.03, y: -3 }}
//                 whileTap={{ scale: 0.98 }}
//                 onClick={() => handleProductClick(productKey)}
//                 className="relative p-3 overflow-hidden text-center transition-all duration-300 bg-white shadow-sm cursor-pointer rounded-xl hover:shadow-xl group sm:p-4"
//               >
//                 <div className={`w-12 h-12 mx-auto mb-2 flex items-center justify-center rounded-xl ${productInfo.color} group-hover:scale-110 transition-transform duration-300 sm:w-14 sm:h-14 sm:mb-3`}>
//                   {productInfo.icon}
//                 </div>
                
//                 <p className="text-xs font-medium text-gray-700 group-hover:text-[#714b67] transition sm:text-sm">
//                   {productInfo.name}
//                 </p>
                
//                 <p className="text-[8px] text-gray-400 mt-0.5 sm:text-[10px] sm:mt-1">
//                   Click to access
//                 </p>

//                 {/* Hover shine effect */}
//                 <div className="absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
//                   <div className="absolute top-0 block w-1/2 h-full transform -skew-x-12 -inset-full bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine"></div>
//                 </div>
//               </motion.div>
//             );
//           })}
//         </motion.div>

//         {/* Back to Login button */}
//         <motion.div 
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.3 }}
//           className="mt-6 text-center sm:mt-8"
//         >
//           <button
//             onClick={handleBackToLogin}
//             className="inline-flex items-center px-3 py-1.5 text-xs text-gray-500 transition hover:text-gray-700 sm:text-sm"
//           >
//             <ArrowRight className="w-3 h-3 mr-1 rotate-180 sm:w-4 sm:h-4" />
//             ← Back to Login
//           </button>
//         </motion.div>
//       </div>

//       <style>{`
//         @keyframes blob {
//           0%, 100% { transform: translate(0px, 0px) scale(1); }
//           33% { transform: translate(30px, -50px) scale(1.1); }
//           66% { transform: translate(-20px, 20px) scale(0.9); }
//         }
//         .animate-blob {
//           animation: blob 7s infinite;
//         }
//         .animation-delay-2000 {
//           animation-delay: 2s;
//         }
//         .animation-delay-4000 {
//           animation-delay: 4s;
//         }
//         @keyframes shine {
//           100% { left: 150%; }
//         }
//         .animate-shine {
//           animation: shine 0.8s ease-out;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default ProductsPage;


// import { AnimatePresence, motion } from 'framer-motion';
// import {
//   Activity,
//   ArrowRight,
//   BookOpen,
//   Briefcase,
//   Building2,
//   CalendarDays,
//   Clock,
//   Coffee,
//   DollarSign,
//   FileText,
//   Heart,
//   HeartPulse,
//   Home,
//   Key,
//   Lock,
//   LogIn,
//   Mail,
//   MessageCircle,
//   Package,
//   Rocket,
//   Settings,
//   Shield,
//   ShieldCheck,
//   ShoppingBag,
//   Sparkles,
//   TrendingUp,
//   User,
//   Users
// } from "lucide-react";
// import { useEffect, useState } from 'react';
// import { FaEye, FaEyeSlash } from "react-icons/fa";
// import { useNavigate } from 'react-router-dom';

// const LoginPage = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [clientId, setClientId] = useState('');
//   const [loginType, setLoginType] = useState('email');
//   const [error, setError] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showProducts, setShowProducts] = useState(false);
//   const [clientData, setClientData] = useState(null);
//   const navigate = useNavigate();

//   // Check localStorage on component mount - direct navigation
//   useEffect(() => {
//     const userRole = localStorage.getItem('userRole');
//     const storedShowProducts = localStorage.getItem('showProducts');
//     const storedClientData = localStorage.getItem('clientData');
    
//     if (userRole === 'admin') {
//       navigate('/dashboard');
//     } else if (userRole === 'employee') {
//       navigate('/employeedashboard');
//     } else if (userRole === 'client' && storedShowProducts === 'true' && storedClientData) {
//       // Client directly goes to products page
//       setClientData(JSON.parse(storedClientData));
//       setShowProducts(true);
//     }
//   }, [navigate]);

//   // Product icons mapping - UPDATED to include camp mapping to health/bmi
//   const productIcons = {
//     // Attendance Section
//     attendance: { icon: <Clock size={24} />, color: "bg-blue-100 text-blue-600", name: "Attendance", section: "attendance" },
    
//     // Co-Working Section
//     coworking: { icon: <Building2 size={24} />, color: "bg-purple-100 text-purple-600", name: "Co-Working", section: "coworking" },
    
//     // BMI & Health Section - Multiple keywords map to same section
//     bmi: { icon: <Heart size={24} />, color: "bg-red-100 text-red-600", name: "BMI", section: "bmi" },
//     health: { icon: <HeartPulse size={24} />, color: "bg-red-100 text-red-600", name: "Health", section: "bmi" },
//     wellness: { icon: <HeartPulse size={24} />, color: "bg-red-100 text-red-600", name: "Wellness", section: "bmi" },
//     camp: { icon: <Users size={24} />, color: "bg-red-100 text-red-600", name: "Health Camp", section: "bmi" }, // CAMP maps to BMI section
    
//     // Other products
//     hr: { icon: <Users size={24} />, color: "bg-pink-100 text-pink-600", name: "HR", section: "hr" },
//     projects: { icon: <Briefcase size={24} />, color: "bg-orange-100 text-orange-600", name: "Projects", section: "projects" },
//     appointments: { icon: <CalendarDays size={24} />, color: "bg-green-100 text-green-600", name: "Appointments", section: "appointments" },
//     support: { icon: <MessageCircle size={24} />, color: "bg-indigo-100 text-indigo-600", name: "Support", section: "support" },
//     security: { icon: <ShieldCheck size={24} />, color: "bg-teal-100 text-teal-600", name: "Security", section: "security" },
//     accounting: { icon: <FileText size={24} />, color: "bg-amber-100 text-amber-600", name: "Accounting", section: "accounting" },
//     knowledge: { icon: <BookOpen size={24} />, color: "bg-cyan-100 text-cyan-600", name: "Knowledge", section: "knowledge" },
//     sign: { icon: <User size={24} />, color: "bg-lime-100 text-lime-600", name: "Sign", section: "sign" },
//     crm: { icon: <Users size={24} />, color: "bg-rose-100 text-rose-600", name: "CRM", section: "crm" },
//     studio: { icon: <Settings size={24} />, color: "bg-fuchsia-100 text-fuchsia-600", name: "Studio", section: "studio" },
//     subscriptions: { icon: <Coffee size={24} />, color: "bg-violet-100 text-violet-600", name: "Subscriptions", section: "subscriptions" },
//     rental: { icon: <Home size={24} />, color: "bg-yellow-100 text-yellow-600", name: "Rental", section: "rental" },
//     pos: { icon: <DollarSign size={24} />, color: "bg-orange-100 text-orange-600", name: "POS", section: "pos" },
//     discuss: { icon: <MessageCircle size={24} />, color: "bg-emerald-100 text-emerald-600", name: "Discuss", section: "discuss" },
//     documents: { icon: <FileText size={24} />, color: "bg-sky-100 text-sky-600", name: "Documents", section: "documents" },
//     project: { icon: <Briefcase size={24} />, color: "bg-indigo-100 text-indigo-600", name: "Project", section: "project" },
//     timesheets: { icon: <Clock size={24} />, color: "bg-purple-100 text-purple-600", name: "Timesheets", section: "timesheets" },
//     purchase: { icon: <ShoppingBag size={24} />, color: "bg-pink-100 text-pink-600", name: "Purchase", section: "purchase" },
//     inventory: { icon: <Package size={24} />, color: "bg-blue-100 text-blue-600", name: "Inventory", section: "inventory" },
//     manufacturing: { icon: <Settings size={24} />, color: "bg-green-100 text-green-600", name: "Manufacturing", section: "manufacturing" },
//     sales: { icon: <TrendingUp size={24} />, color: "bg-red-100 text-red-600", name: "Sales", section: "sales" },
//     dashboard: { icon: <Activity size={24} />, color: "bg-yellow-100 text-yellow-600", name: "Dashboard", section: "dashboard" }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setIsLoading(true);

//     try {
//       // 1. First Attempt: Admin Login
//       const adminResponse = await fetch('https://attendancebackend-5cgn.onrender.com/api/admin/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, password }),
//       });

//       const adminData = await adminResponse.json();

//       if (adminResponse.ok) {
//         localStorage.setItem('adminToken', adminData.token);
//         localStorage.setItem('adminId', adminData.admin.id);
//         localStorage.setItem('adminName', adminData.admin.name);
//         localStorage.setItem('userRole', 'admin');
//         localStorage.removeItem('showProducts');
//         localStorage.removeItem('clientData');
//         navigate('/dashboard');
//         return;
//       }

//       // 2. Second Attempt: Employee Login
//       const empResponse = await fetch("https://api.timelyhealth.in/api/employees/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password }),
//       });

//       const empData = await empResponse.json();

//       if (empResponse.ok) {
//         localStorage.setItem("employeeData", JSON.stringify(empData.employee));
//         localStorage.setItem("employeeId", empData.employee._id);
//         localStorage.setItem("employeeEmail", empData.employee.email);
//         localStorage.setItem("employeeName", empData.employee.name);
//         localStorage.setItem('userRole', 'employee');
//         localStorage.removeItem('showProducts');
//         localStorage.removeItem('clientData');
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

//       const clientResponse = await fetch('http://localhost:5006/api/clients/clientlogin', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(clientPayload),
//       });

//       const responseData = await clientResponse.json();

//       if (clientResponse.ok) {
//         // Extract client data properly
//         const clientInfo = responseData.client || responseData.data || responseData;
        
//         // Format client data
//         const formattedClientData = {
//           _id: clientInfo._id || '',
//           name: clientInfo.name || clientInfo.clientName || email.split('@')[0] || 'Client',
//           clientId: clientInfo.clientId || clientId || 'CLIENT-ID',
//           email: clientInfo.email || email,
//           companyName: clientInfo.companyName || clientInfo.company || 'Company Name',
//           location: clientInfo.location || clientInfo.city || 'Location',
//           accessibleProducts: clientInfo.accessibleProducts || 
//                              clientInfo.products || 
//                              clientInfo.purchasedProducts || 
//                              []  // Default empty array if no products
//         };

//         // Store client data
//         setClientData(formattedClientData);
//         localStorage.setItem('clientToken', responseData.token || '');
//         localStorage.setItem('clientId', formattedClientData._id);
//         localStorage.setItem('clientCustomId', formattedClientData.clientId);
//         localStorage.setItem('clientName', formattedClientData.name);
//         localStorage.setItem('clientEmail', formattedClientData.email);
//         localStorage.setItem('clientData', JSON.stringify(formattedClientData));
//         localStorage.setItem('userRole', 'client');
//         localStorage.setItem('showProducts', 'true');
        
//         // Directly show products page
//         setShowProducts(true);
//         return;
//       }

//       throw new Error(responseData.message || empData.message || adminData.message || 'Invalid credentials');

//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleProductClick = (product) => {
//     // Get the section mapping for the product
//     const productInfo = productIcons[product.toLowerCase()];
//     const sectionToNavigate = productInfo?.section || product.toLowerCase();
    
//     // Navigate to dashboard with product info
//     navigate('/dashboard', { 
//       state: { 
//         client: clientData,
//         selectedProduct: sectionToNavigate,
//         userType: 'client'
//       } 
//     });
//   };

//   const handleLogout = () => {
//     setShowProducts(false);
//     setClientData(null);
//     localStorage.removeItem('showProducts');
//     localStorage.removeItem('clientData');
//     localStorage.removeItem('userRole');
//     localStorage.removeItem('clientToken');
//     localStorage.removeItem('clientId');
//     localStorage.removeItem('clientCustomId');
//     localStorage.removeItem('clientName');
//     localStorage.removeItem('clientEmail');
//   };

//   // If showing products page (after login)
//   if (showProducts && clientData) {
//     const products = clientData.accessibleProducts || [];
    
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
//         {/* Animated background */}
//         <div className="fixed inset-0 overflow-hidden">
//           <div className="absolute bg-purple-300 rounded-full top-20 left-10 w-72 h-72 mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
//           <div className="absolute bg-pink-300 rounded-full top-40 right-10 w-72 h-72 mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
//           <div className="absolute bg-blue-300 rounded-full bottom-20 left-1/2 w-72 h-72 mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
//         </div>

//         <div className="relative max-w-6xl px-4 py-12 mx-auto">
//           {/* Welcome Header */}
//           <motion.div 
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5 }}
//             className="mb-8 text-center"
//           >
//             <div className="inline-flex items-center px-4 py-2 mb-4 rounded-full shadow-sm bg-white/80 backdrop-blur-sm">
//               <Sparkles className="w-4 h-4 mr-2 text-yellow-500" />
//               <span className="text-sm text-gray-600">Welcome back, {clientData.name}!</span>
//             </div>
            
//             <h1 className="mb-2 text-3xl font-bold text-gray-800 md:text-4xl">
//               Your <span className="text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">Purchased Products</span>
//             </h1>
//             <p className="text-gray-600">Select a product to access your dashboard</p>
//           </motion.div>

//           {/* Client Info Card */}
//           <motion.div 
//             initial={{ opacity: 0, scale: 0.95 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ duration: 0.5, delay: 0.2 }}
//             className="p-6 mb-8 border border-gray-100 shadow-lg bg-white/80 backdrop-blur-sm rounded-xl"
//           >
//             <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
//               <div className="text-center">
//                 <p className="text-xs text-gray-500">Client ID</p>
//                 <p className="text-sm font-medium text-gray-800">{clientData.clientId}</p>
//               </div>
//               <div className="text-center">
//                 <p className="text-xs text-gray-500">Email</p>
//                 <p className="text-sm font-medium text-gray-800">{clientData.email}</p>
//               </div>
//               <div className="text-center">
//                 <p className="text-xs text-gray-500">Company</p>
//                 <p className="text-sm font-medium text-gray-800">{clientData.companyName}</p>
//               </div>
//               <div className="text-center">
//                 <p className="text-xs text-gray-500">Location</p>
//                 <p className="text-sm font-medium text-gray-800">{clientData.location}</p>
//               </div>
//             </div>
//           </motion.div>

//           {/* Products Grid */}
//           {products.length > 0 ? (
//             <motion.div 
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ duration: 0.5, delay: 0.4 }}
//               className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
//             >
//               {products.map((product, index) => {
//                 // Handle if product is string or object
//                 const productName = typeof product === 'object' ? product.name || product.productName || '' : product;
//                 const productKey = productName.toLowerCase();
//                 const productInfo = productIcons[productKey] || {
//                   icon: <Rocket size={24} />,
//                   color: "bg-gray-100 text-gray-600",
//                   name: productName ? productName.charAt(0).toUpperCase() + productName.slice(1) : 'Product',
//                   section: productKey
//                 };

//                 return (
//                   <motion.div
//                     key={index}
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ duration: 0.3, delay: index * 0.1 }}
//                     whileHover={{ scale: 1.05, y: -5 }}
//                     whileTap={{ scale: 0.95 }}
//                     onClick={() => handleProductClick(productName)}
//                     className="relative p-4 overflow-hidden text-center transition-all duration-300 bg-white shadow-sm cursor-pointer rounded-xl hover:shadow-xl group"
//                   >
//                     {/* Gradient overlay on hover */}
//                     <div className={`absolute inset-0 bg-gradient-to-br ${productInfo.color.replace('100', '500')} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                    
//                     <div className={`w-14 h-14 mx-auto mb-3 flex items-center justify-center rounded-xl ${productInfo.color} group-hover:scale-110 transition-transform duration-300`}>
//                       {productInfo.icon}
//                     </div>
                    
//                     <p className="text-sm font-medium text-gray-700 group-hover:text-[#714b67] transition">
//                       {productInfo.name}
//                     </p>
                    
//                     <p className="text-[10px] text-gray-400 mt-1">
//                       Click to access
//                     </p>

//                     {/* Shine effect on hover */}
//                     <div className="absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
//                       <div className="absolute top-0 block w-1/2 h-full transform -skew-x-12 -inset-full z-5 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine"></div>
//                     </div>
//                   </motion.div>
//                 );
//               })}
//             </motion.div>
//           ) : (
//             <motion.div 
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               className="p-8 text-center bg-white/80 backdrop-blur-sm rounded-xl"
//             >
//               <p className="text-gray-500">No products available for this client.</p>
//             </motion.div>
//           )}

//           {/* Logout button */}
//           <motion.div 
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ duration: 0.5, delay: 0.6 }}
//             className="mt-8 text-center"
//           >
//             <button
//               onClick={handleLogout}
//               className="flex items-center justify-center mx-auto text-sm text-gray-500 transition hover:text-gray-700"
//             >
//               <ArrowRight className="w-4 h-4 mr-1 rotate-180" />
//               Logout
//             </button>
//           </motion.div>
//         </div>
//       </div>
//     );
//   }

//   // Login Page
//   return (
//     <div className="relative flex items-center justify-center min-h-screen px-4 py-6 overflow-hidden bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
//       {/* Animated Background Elements */}
//       <div className="absolute inset-0 overflow-hidden">
//         <motion.div 
//           animate={{ 
//             x: [0, 100, 0],
//             y: [0, 50, 0],
//           }}
//           transition={{ 
//             duration: 20,
//             repeat: Infinity,
//             ease: "linear"
//           }}
//           className="absolute w-64 h-64 bg-blue-300 rounded-full top-20 left-10 mix-blend-multiply filter blur-xl opacity-20"
//         ></motion.div>
//         <motion.div 
//           animate={{ 
//             x: [0, -100, 0],
//             y: [0, 80, 0],
//           }}
//           transition={{ 
//             duration: 25,
//             repeat: Infinity,
//             ease: "linear"
//           }}
//           className="absolute w-64 h-64 bg-purple-300 rounded-full top-40 right-10 mix-blend-multiply filter blur-xl opacity-20"
//         ></motion.div>
//         <motion.div 
//           animate={{ 
//             x: [0, 50, 0],
//             y: [0, -50, 0],
//           }}
//           transition={{ 
//             duration: 18,
//             repeat: Infinity,
//             ease: "linear"
//           }}
//           className="absolute w-64 h-64 bg-pink-300 rounded-full bottom-20 left-1/2 mix-blend-multiply filter blur-xl opacity-20"
//         ></motion.div>
//       </div>

//       <motion.div 
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//         className="relative z-10 grid w-full max-w-4xl grid-cols-1 overflow-hidden shadow-2xl bg-white/90 backdrop-blur-md rounded-2xl md:grid-cols-2"
//       >
//         {/* Left Side - Login Form */}
//         <div className="flex flex-col justify-center p-6 md:p-8">
//           <motion.div 
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.5, delay: 0.2 }}
//             className="mb-4 text-center"
//           >
//             <div className="inline-flex items-center px-3 py-1 mb-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100">
//               <Lock className="w-3 h-3 mr-1 text-blue-600" />
//               <span className="text-xs text-gray-600">Secure Access</span>
//             </div>
//             <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
//               Welcome Back
//             </h1>
//             <p className="mt-1 text-xs text-gray-500">Sign in to continue your journey</p>
//           </motion.div>

//           {/* Login Type Toggle */}
//           <motion.div 
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ duration: 0.5, delay: 0.3 }}
//             className="flex justify-center mb-4"
//           >
//             <div className="inline-flex p-1 bg-gray-100 rounded-lg">
//               <button
//                 type="button"
//                 onClick={() => setLoginType('email')}
//                 className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-300 ${
//                   loginType === 'email' 
//                     ? 'bg-white shadow text-blue-600 scale-105' 
//                     : 'text-gray-600 hover:text-gray-900'
//                 }`}
//               >
//                 Email Login
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setLoginType('clientId')}
//                 className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-300 ${
//                   loginType === 'clientId' 
//                     ? 'bg-white shadow text-purple-600 scale-105' 
//                     : 'text-gray-600 hover:text-gray-900'
//                 }`}
//               >
//                 Client ID
//               </button>
//             </div>
//           </motion.div>

//           <AnimatePresence>
//             {error && (
//               <motion.div 
//                 initial={{ opacity: 0, y: -10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0 }}
//                 className="p-2 mb-3 text-xs text-red-600 border border-red-100 rounded-md bg-red-50"
//               >
//                 {error}
//               </motion.div>
//             )}
//           </AnimatePresence>

//           <form onSubmit={handleSubmit} className="space-y-4">
//             <AnimatePresence mode="wait">
//               {loginType === 'email' ? (
//                 <motion.div
//                   key="email-field"
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: 20 }}
//                   transition={{ duration: 0.3 }}
//                 >
//                   <label className="block mb-1 text-xs font-medium text-gray-700" htmlFor="email">
//                     Email Address
//                   </label>
//                   <input
//                     type="email"
//                     id="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     placeholder="you@domain.com"
//                     className="w-full px-3 py-2 text-sm transition-all border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     required
//                   />
//                 </motion.div>
//               ) : (
//                 <motion.div
//                   key="clientid-field"
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: 20 }}
//                   transition={{ duration: 0.3 }}
//                 >
//                   <label className="block mb-1 text-xs font-medium text-gray-700" htmlFor="clientId">
//                     Client ID
//                   </label>
//                   <input
//                     type="text"
//                     id="clientId"
//                     value={clientId}
//                     onChange={(e) => setClientId(e.target.value)}
//                     placeholder="CLIENT-XXXXXX"
//                     className="w-full px-3 py-2 text-sm transition-all border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                     required
//                   />
//                 </motion.div>
//               )}
//             </AnimatePresence>

//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ duration: 0.5, delay: 0.4 }}
//             >
//               <label className="block mb-1 text-xs font-medium text-gray-700">
//                 Password
//               </label>
//               <div className="relative">
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   placeholder="••••••••"
//                   className="w-full px-3 py-2 pr-10 text-sm transition-all border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   required
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute inset-y-0 flex items-center text-gray-500 transition right-3 hover:text-blue-600"
//                 >
//                   {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
//                 </button>
//               </div>
//             </motion.div>

//             <motion.button
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5, delay: 0.5 }}
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//               type="submit"
//               disabled={isLoading}
//               className={`w-full py-2.5 text-white text-sm font-medium rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center ${
//                 isLoading ? 'opacity-70 cursor-not-allowed' : ''
//               }`}
//             >
//               {isLoading ? (
//                 <>
//                   <motion.div
//                     animate={{ rotate: 360 }}
//                     transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
//                     className="w-4 h-4 mr-2 border-2 border-white rounded-full border-t-transparent"
//                   />
//                   Verifying...
//                 </>
//               ) : (
//                 <>
//                   <LogIn size={14} className="mr-2" />
//                   Sign In
//                 </>
//               )}
//             </motion.button>

//             <motion.div 
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ duration: 0.5, delay: 0.6 }}
//               className="text-center"
//             >
//               <p className="text-xs text-gray-400">
//                 Need help? <a href="mailto:support@domain.com" className="text-blue-600 hover:underline">support@domain.com</a>
//               </p>
//             </motion.div>
//           </form>
//         </div>

//         {/* Right Side - Info Panel */}
//         <motion.div 
//           initial={{ opacity: 0, x: 20 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 0.5, delay: 0.3 }}
//           className="flex flex-col items-center justify-center p-6 text-white bg-gradient-to-br from-blue-600 to-purple-600 md:p-8"
//         >
//           <motion.img
//             initial={{ scale: 0.9 }}
//             animate={{ scale: 1 }}
//             transition={{ duration: 0.5, delay: 0.4 }}
//             src="https://t3.ftcdn.net/jpg/04/72/65/82/360_F_472658260_9eT6d4HzAt7lDZ8d5SAb5opOZikRH7AC.jpg"
//             alt="Attendance Illustration"
//             className="object-contain h-40 max-w-full mb-4 rounded-lg shadow-xl"
//           />
          
//           <motion.div 
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5, delay: 0.5 }}
//             className="text-center"
//           >
//             <h3 className="mb-3 text-lg font-semibold">Quick Guide</h3>
//             <div className="space-y-2">
//               <motion.div 
//                 whileHover={{ scale: 1.02, x: 5 }}
//                 className="flex items-center p-2 space-x-2 rounded-lg bg-white/20 backdrop-blur-sm"
//               >
//                 <Mail size={14} />
//                 <p className="text-xs">Admin/Employee: Use email</p>
//               </motion.div>
              
//               <motion.div 
//                 whileHover={{ scale: 1.02, x: 5 }}
//                 className="flex items-center p-2 space-x-2 rounded-lg bg-white/20 backdrop-blur-sm"
//               >
//                 <Key size={14} />
//                 <p className="text-xs">Client: Email or Client ID</p>
//               </motion.div>
              
//               <motion.div 
//                 whileHover={{ scale: 1.02, x: 5 }}
//                 className="flex items-center p-2 space-x-2 rounded-lg bg-white/20 backdrop-blur-sm"
//               >
//                 <Shield size={14} />
//                 <p className="text-xs">Select product after login</p>
//               </motion.div>
//             </div>
//           </motion.div>
//         </motion.div>
//       </motion.div>

//       <style>{`
//         @keyframes blob {
//           0%, 100% { transform: translate(0px, 0px) scale(1); }
//           33% { transform: translate(30px, -50px) scale(1.1); }
//           66% { transform: translate(-20px, 20px) scale(0.9); }
//         }
//         .animate-blob {
//           animation: blob 7s infinite;
//         }
//         .animation-delay-2000 {
//           animation-delay: 2s;
//         }
//         .animation-delay-4000 {
//           animation-delay: 4s;
//         }
//         @keyframes shine {
//           100% { left: 150%; }
//         }
//         .animate-shine {
//           animation: shine 1s ease-out;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default LoginPage;