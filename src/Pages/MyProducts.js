// src/components/MyProducts.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaBuilding,
  FaUsers,
  FaTasks,
  FaCampground,
  FaPeopleArrows,
  FaBoxOpen,
  FaUserPlus,
  FaThumbsUp,
  FaClock,
  FaCodeBranch,
  FaExternalLinkAlt,
  FaCheckCircle,
  FaEye
} from 'react-icons/fa';
import { FiCalendar, FiAward } from 'react-icons/fi';
import '../index.css';
import './EmployeeDashboard.css';

const MyProducts = () => {
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // ─── Get credentials from localStorage ───
  const getCredentials = () => {
    const userRole = localStorage.getItem('userRole');
    let email = '', password = '';
    
    if (userRole === 'admin') {
      email = localStorage.getItem('adminEmail') || '';
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      password = userData.password || localStorage.getItem('adminPassword') || '';
    } else if (userRole === 'employee') {
      const employeeData = JSON.parse(localStorage.getItem('employeeData') || '{}');
      email = employeeData.email || localStorage.getItem('employeeEmail') || '';
      password = employeeData.password || localStorage.getItem('employeePassword') || '';
    } else if (userRole === 'client') {
      const clientData = JSON.parse(localStorage.getItem('clientData') || '{}');
      email = clientData.email || localStorage.getItem('clientEmail') || '';
      password = clientData.password || localStorage.getItem('clientPassword') || '';
    }
    
    console.log('🔑 Credentials:', { email, password, userRole });
    return { email, password, userRole };
  };

  // ─── Calculate expiry date (30 days from now) ───
  const getExpiryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date;
  };

  // ─── Calculate days remaining ───
  const getDaysRemaining = () => {
    const now = new Date();
    const expiry = getExpiryDate();
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // ─── PRODUCT DATA ───
  const products = [
    {
      id: 1,
      name: "HRMS",
      icon: <FaBuilding className="text-xl" />,
      link: "http://localhost:3000/my-products",
      status: "Active",
      expiryDate: getExpiryDate(),
      requiresAuth: false,
      loginPage: "default",
      isLaunched: true
    },
    {
      id: 2,
      name: "RECRUITMENT",
      icon: <FaUserPlus className="text-xl" />,
      link: "https://ingrainhire.ingrainsystems.com/client-login",
      status: "Active",
      expiryDate: getExpiryDate(),
      requiresAuth: true,
      loginPage: "client",
      isLaunched: false
    },
    {
      id: 3,
      name: "TASK MANAGEMENT",
      icon: <FaTasks className="text-xl" />,
      link: "https://taskmanagement.iryax.com",
      status: "Beta",
      expiryDate: getExpiryDate(),
      requiresAuth: true,
      loginPage: "default",
      isLaunched: false
    },
    {
      id: 4,
      name: "CAMP",
      icon: <FaCampground className="text-xl" />,
      link: "http://localhost:3001", // ⭐ FIXED: /login path add karo
      status: "Active",
      expiryDate: getExpiryDate(),
      requiresAuth: true, // ⭐ FIXED: true karo taaki params bheje
      loginPage: "default",
      isLaunched: false
    },
    {
      id: 5,
      name: "CO-WORKING",
      icon: <FaPeopleArrows className="text-xl" />,
      link: "https://coworking.iryax.com",
      status: "Development",
      expiryDate: getExpiryDate(),
      requiresAuth: false,
      loginPage: "default",
      isLaunched: false
    }
  ];

  // ─── STATS ───
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.status === "Active").length;
  const daysRemaining = getDaysRemaining();

  // ─── LINK HANDLER ───
  const handleLaunchProduct = (product) => {
    console.log('🚀 Launching product:', product.name);
    console.log('🔗 Product link:', product.link);
    console.log('🔐 Requires auth:', product.requiresAuth);
    
    // ⭐ If already launched, just open
    if (product.isLaunched) {
      window.open(product.link, '_blank');
      return;
    }
    
    // ⭐ If product doesn't require auth, just open
    if (!product.requiresAuth) {
      window.open(product.link, '_blank');
      return;
    }
    
    // ⭐ For products that require auth - get credentials
    const { email, password, userRole } = getCredentials();
    
    if (!email || !password) {
      alert(`Please login first to access ${product.name}.`);
      return;
    }

    setIsLoading(true);
    
    const baseUrl = product.link;
    const params = new URLSearchParams();
    params.append('email', email);
    params.append('password', password);
    params.append('autoLogin', 'true');
    params.append('role', userRole || 'employee');
    
    // ⭐ Special handling for Recruitment (Client Login)
    if (product.loginPage === 'client') {
      params.append('clientLogin', 'true');
      params.append('skipOtp', 'true');
    }
    
    // ⭐ Final URL - baseUrl already has /login
    const finalUrl = `${baseUrl}?${params.toString()}`;
    
    console.log('🔗 Final URL:', finalUrl);
    console.log('📧 Email:', email);
    console.log('🔐 Password:', password);
    
    const newWindow = window.open(finalUrl, '_blank');
    
    if (newWindow) {
      setIsLoading(false);
    } else {
      alert('Please allow popups for this site to auto-login.');
      setIsLoading(false);
      window.open(product.link, '_blank');
    }
  };

  // ─── STATUS BADGE ───
  const getStatusBadge = (status) => {
    const styles = {
      Active: 'bg-green-100/80 text-green-700 border-green-200/50',
      Beta: 'bg-yellow-100/80 text-yellow-700 border-yellow-200/50',
      Development: 'bg-blue-100/80 text-blue-700 border-blue-200/50'
    };
    const icons = {
      Active: <FaCheckCircle className="text-[7px] mr-1" />,
      Beta: <FaCodeBranch className="text-[7px] mr-1" />,
      Development: <FaClock className="text-[7px] mr-1" />
    };
    return (
      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider border backdrop-blur-sm ${styles[status] || 'bg-gray-100/80 text-gray-700 border-gray-200/50'}`}>
        {icons[status]}
        {status}
      </span>
    );
  };

  // ─── GLASSMORPHISM STYLES ───
  const glassStyle = "bg-white/80 backdrop-blur-xl border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_48px_rgba(59,130,246,0.15)]";
  const gradientHeader = "bg-gradient-to-r from-blue-50 via-blue-100/80 to-white";
  const glassCard = "bg-white/70 backdrop-blur-lg border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.06)]";

  return (
    <div className="emp-dash">
      <main className="p-4 sm:p-6 lg:p-8">
        {/* Dashboard Header */}
        <div className="emp-dash__header">
          <div>
            <h1 className="emp-dash__greeting">
              My <span>Products</span>
            </h1>
            <p className="emp-dash__subtitle">
              Manage and monitor all your products in one place.
            </p>
          </div>
          <div className="emp-dash__date-pill bg-white/70 backdrop-blur-lg border border-white/50 shadow-lg">
            <FiCalendar className="text-blue-500" />
            <span>
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Top KPI Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className={`${glassCard} rounded-xl p-4 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(59,130,246,0.12)]`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Products</span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FaBoxOpen className="text-blue-500 text-sm" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {totalProducts}
            </div>
            <div className="text-[10px] text-gray-400 font-medium">available products</div>
          </div>

          <div className={`${glassCard} rounded-xl p-4 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(59,130,246,0.12)]`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Active Products</span>
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                <FaThumbsUp className="text-green-500 text-sm" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {activeProducts}
            </div>
            <div className="text-[10px] text-gray-400 font-medium">currently live</div>
          </div>

          <div className={`${glassCard} rounded-xl p-4 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(59,130,246,0.12)]`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Days Remaining</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <FiAward className="text-amber-500 text-sm" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {daysRemaining}
            </div>
            <div className="text-[10px] text-gray-400 font-medium">until expiry</div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`${glassStyle} rounded-xl overflow-hidden transition-all duration-300`}
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              {/* Product Header */}
              <div className={`${gradientHeader} px-4 py-3 border-b border-white/30`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-400 flex items-center justify-center text-white shadow-md">
                      {product.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-800">{product.name}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {getStatusBadge(product.status)}
                        {product.requiresAuth && !product.isLaunched && (
                          <span className="text-[6px] px-1 py-0.5 rounded-full bg-purple-100/80 text-purple-600 border border-purple-200/50 font-medium">
                            Auto-Login
                          </span>
                        )}
                        {product.loginPage === 'client' && !product.isLaunched && (
                          <span className="text-[6px] px-1 py-0.5 rounded-full bg-green-100/80 text-green-600 border border-green-200/50 font-medium">
                            Client
                          </span>
                        )}
                        {product.isLaunched && (
                          <span className="text-[6px] px-1 py-0.5 rounded-full bg-emerald-100/80 text-emerald-600 border border-emerald-200/50 font-medium">
                            ✓ Launched
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Body */}
              <div className="p-4">
                {/* Expiry Date */}
                <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                  <span className="font-medium">Expires:</span>
                  <span className="font-bold text-amber-600">
                    {product.expiryDate.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                {/* Action Button */}
                <button
                  className={`w-full py-2 text-xs font-bold text-center rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 ${
                    product.isLaunched
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-600 hover:to-emerald-500 text-white'
                      : 'bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white'
                  }`}
                  onClick={() => handleLaunchProduct(product)}
                  disabled={isLoading}
                >
                  {isLoading && product.requiresAuth && !product.isLaunched ? (
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : product.isLaunched ? (
                    <>
                      <FaEye className="text-[10px]" />
                      Open
                    </>
                  ) : (
                    <>
                      <FaExternalLinkAlt className="text-[10px]" />
                      Launch
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default MyProducts;