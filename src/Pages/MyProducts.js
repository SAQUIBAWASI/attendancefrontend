// src/components/MyProducts.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaBuilding,
  FaUsers,
  FaTasks,
  FaCampground,
  FaPeopleArrows,
  FaRocket,
  FaArrowRight,
  FaCheckCircle,
  FaStar,
  FaInfoCircle,
  FaExternalLinkAlt,
  FaCog,
  FaBoxOpen,
  FaClipboardList,
  FaUserPlus,
  FaThumbsUp,
  FaClock,
  FaCodeBranch,
  FaEye
} from 'react-icons/fa';
import { FiCalendar, FiTrendingUp, FiAward } from 'react-icons/fi';
import '../index.css';
import './EmployeeDashboard.css';

const MyProducts = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState(null);

  // ─── PRODUCT DATA WITH LINKS ───
  const products = [
    {
      id: 1,
      name: "HRMS",
      icon: <FaBuilding className="text-xl" />,
      link: "https://hrms.iryax.com",
      description: "Complete Human Resource Management System with employee lifecycle management, attendance, leave, and payroll.",
      features: [
        "Employee Database Management",
        "Attendance & Leave Tracking",
        "Payroll Processing",
        "Performance Management",
        "Recruitment & Onboarding",
        "Employee Self-Service Portal"
      ],
      benefits: [
        "Automated HR Processes",
        "Reduced Administrative Burden",
        "Improved Employee Experience",
        "Data-Driven Decision Making"
      ],
      status: "Active",
      version: "v3.2.1",
      lastUpdated: "2026-06-28",
      users: 245,
      rating: 4.8
    },
    {
      id: 2,
      name: "RECRUITMENT",
      icon: <FaUserPlus className="text-xl" />,
      link: "https://recruitment.iryax.com",
      description: "End-to-end recruitment management platform with AI-powered candidate screening, interview scheduling, and offer management.",
      features: [
        "Job Posting Management",
        "Candidate Application Tracking",
        "AI-Powered Resume Screening",
        "Interview Scheduling",
        "Offer Letter Generation",
        "Analytics & Reporting"
      ],
      benefits: [
        "Faster Hiring Cycle",
        "Better Quality Hires",
        "Reduced Recruitment Cost",
        "Enhanced Candidate Experience"
      ],
      status: "Active",
      version: "v2.8.0",
      lastUpdated: "2026-06-25",
      users: 89,
      rating: 4.6
    },
    {
      id: 3,
      name: "TASK MANAGEMENT",
      icon: <FaTasks className="text-xl" />,
      link: "https://taskmanagement.iryax.com",
      description: "Agile task and project management tool with Kanban boards, sprint planning, and team collaboration features.",
      features: [
        "Project & Task Tracking",
        "Kanban & Scrum Boards",
        "Sprint Planning",
        "Team Collaboration",
        "Time Tracking",
        "Progress Analytics"
      ],
      benefits: [
        "Improved Team Productivity",
        "Better Project Visibility",
        "Enhanced Collaboration",
        "Faster Delivery Cycles"
      ],
      status: "Beta",
      version: "v1.5.0",
      lastUpdated: "2026-06-20",
      users: 156,
      rating: 4.7
    },
    {
      id: 4,
      name: "CAMP",
      icon: <FaCampground className="text-xl" />,
      link: "https://camp.iryax.com",
      description: "Field team management and camp coordination platform with real-time tracking, task assignment, and offline support.",
      features: [
        "Field Team Tracking",
        "Camp Coordination",
        "Offline Data Collection",
        "Real-time Updates",
        "Task Assignment",
        "Emergency Alerts"
      ],
      benefits: [
        "Real-time Field Visibility",
        "Efficient Camp Management",
        "Enhanced Team Safety",
        "Seamless Offline Operations"
      ],
      status: "Active",
      version: "v1.2.3",
      lastUpdated: "2026-06-18",
      users: 67,
      rating: 4.4
    },
    {
      id: 5,
      name: "CO-WORKING",
      icon: <FaPeopleArrows className="text-xl" />,
      link: "https://coworking.iryax.com",
      description: "Collaborative workspace management platform with resource booking, meeting room management, and community features.",
      features: [
        "Workspace Booking",
        "Meeting Room Management",
        "Resource Scheduling",
        "Community Features",
        "Billing & Invoicing",
        "Member Management"
      ],
      benefits: [
        "Optimized Space Utilization",
        "Enhanced Member Experience",
        "Streamlined Operations",
        "Increased Revenue"
      ],
      status: "Development",
      version: "v0.9.0",
      lastUpdated: "2026-06-15",
      users: 34,
      rating: 4.2
    }
  ];

  // ─── STATS ───
  const totalUsers = products.reduce((sum, p) => sum + p.users, 0);
  const avgRating = (products.reduce((sum, p) => sum + p.rating, 0) / products.length).toFixed(1);
  const activeProducts = products.filter(p => p.status === "Active").length;

  // ─── MODAL HANDLERS ───
  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  // ─── LINK HANDLER ───
  const handleLaunchProduct = (link) => {
    if (link) {
      window.open(link, '_blank');
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

  // ─── RATING STARS ───
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="text-yellow-400 text-[8px]" />);
    }
    if (hasHalfStar) {
      stars.push(<FaStar key="half" className="text-yellow-400 text-[8px] opacity-50" />);
    }
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaStar key={`empty-${i}`} className="text-gray-300 text-[8px]" />);
    }
    return stars;
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
              Manage and monitor all your products and services in one place.
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

        {/* Top KPI Stats Grid - Glassmorphism */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className={`${glassCard} rounded-xl p-4 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(59,130,246,0.12)]`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Products</span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FaBoxOpen className="text-blue-500 text-sm" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {products.length}
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
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Users</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <FaUsers className="text-amber-500 text-sm" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {totalUsers.toLocaleString()}
            </div>
            <div className="text-[10px] text-gray-400 font-medium">across all products</div>
          </div>

          <div className={`${glassCard} rounded-xl p-4 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(59,130,246,0.12)]`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Avg Rating</span>
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
                <FiAward className="text-rose-500 text-sm" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {avgRating}
            </div>
            <div className="text-[10px] text-gray-400 font-medium">user satisfaction</div>
          </div>
        </div>

        {/* Products Grid - Smaller Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`${glassStyle} rounded-xl overflow-hidden cursor-pointer group transition-all duration-300`}
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
              onClick={() => handleOpenModal(product)}
            >
              {/* Product Header - White to Blue Gradient */}
              <div className={`${gradientHeader} px-3 py-3 border-b border-white/30`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-400 flex items-center justify-center text-white shadow-md">
                      {product.icon}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-gray-800">{product.name}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {getStatusBadge(product.status)}
                      </div>
                    </div>
                  </div>
                  <motion.div
                    animate={{ x: hoveredProduct === product.id ? 2 : 0 }}
                    className="text-blue-400/50 hover:text-blue-500 transition-colors"
                  >
                    <FaArrowRight className="text-[10px]" />
                  </motion.div>
                </div>
              </div>

              {/* Product Body - Compact */}
              <div className="p-3">
                <p className="text-[9px] text-gray-500 line-clamp-2 leading-relaxed mb-2">
                  {product.description}
                </p>
                
                <div className="flex items-center justify-between text-[9px]">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      <FaUsers className="text-gray-400 text-[8px]" />
                      <span className="font-medium text-gray-700">{product.users}</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <div className="flex items-center gap-0.5">
                        {renderStars(product.rating)}
                      </div>
                      <span className="font-medium text-gray-700 ml-0.5">{product.rating}</span>
                    </div>
                  </div>
                  <span className="text-[7px] text-gray-400">
                    {new Date(product.lastUpdated).toLocaleDateString()}
                  </span>
                </div>

                {/* Quick Feature Tags - Smaller */}
                <div className="mt-1.5 flex flex-wrap gap-0.5">
                  {product.features.slice(0, 2).map((feature, i) => (
                    <span 
                      key={i}
                      className="text-[6px] px-1.5 py-0.5 rounded-full font-medium bg-blue-50/80 text-blue-600 border border-blue-100/50"
                    >
                      {feature.split(' ').slice(0, 2).join(' ')}
                    </span>
                  ))}
                  {product.features.length > 2 && (
                    <span className="text-[6px] px-1.5 py-0.5 rounded-full font-medium text-gray-400 border border-gray-200/50">
                      +{product.features.length - 2}
                    </span>
                  )}
                </div>

                {/* Action Buttons - View & Launch */}
                <div className="mt-2 flex gap-1.5">
                  <button
                    className="flex-1 py-1 text-[8px] font-bold text-center rounded-lg bg-blue-50/50 hover:bg-blue-100/70 text-blue-600 transition-all border border-blue-100/50 flex items-center justify-center gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenModal(product);
                    }}
                  >
                    <FaEye className="text-[7px]" />
                    View
                  </button>
                  <button
                    className="flex-1 py-1 text-[8px] font-bold text-center rounded-lg bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white transition-all shadow-sm flex items-center justify-center gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLaunchProduct(product.link);
                    }}
                  >
                    <FaExternalLinkAlt className="text-[7px]" />
                    Launch
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* ─── PRODUCT DETAIL MODAL - Glassmorphism ─── */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white/90 backdrop-blur-xl w-full max-w-3xl max-h-[85vh] rounded-2xl shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-4 duration-300 border border-white/40">
            
            {/* Modal Header - White to Blue Gradient */}
            <div className={`${gradientHeader} px-6 py-4 border-b border-white/30 flex-shrink-0`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-400 flex items-center justify-center text-white shadow-lg">
                    {selectedProduct.icon}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">{selectedProduct.name}</h2>
                    <div className="flex items-center gap-3 mt-1">
                      {getStatusBadge(selectedProduct.status)}
                      <span className="text-xs text-gray-500 font-medium">
                        {selectedProduct.version}
                      </span>
                      <span className="text-xs text-gray-400">
                        • {new Date(selectedProduct.lastUpdated).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)]">
              {/* Description */}
              <div className="mb-5 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/60">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {selectedProduct.description}
                </p>
              </div>

              {/* Stats Grid - Glass */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="text-center p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-white/60">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Users</p>
                  <p className="text-xl font-bold text-blue-600">{selectedProduct.users}</p>
                </div>
                <div className="text-center p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-white/60">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Rating</p>
                  <div className="flex items-center justify-center gap-1 mt-0.5">
                    <span className="text-xl font-bold text-yellow-600">{selectedProduct.rating}</span>
                    <div className="flex items-center gap-0.5">
                      {renderStars(selectedProduct.rating)}
                    </div>
                  </div>
                </div>
                <div className="text-center p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-white/60">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</p>
                  <p className="text-xl font-bold text-green-600 mt-0.5">{selectedProduct.status}</p>
                </div>
              </div>

              {/* Features & Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/60">
                  <h4 className="text-xs font-bold text-gray-700 mb-2.5 flex items-center gap-2">
                    <FaClipboardList className="text-blue-500 text-xs" />
                    Key Features
                  </h4>
                  <ul className="space-y-1.5">
                    {selectedProduct.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                        <FaCheckCircle className="text-blue-400 text-[8px] mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/60">
                  <h4 className="text-xs font-bold text-gray-700 mb-2.5 flex items-center gap-2">
                    <FiTrendingUp className="text-green-500 text-xs" />
                    Benefits
                  </h4>
                  <ul className="space-y-1.5">
                    {selectedProduct.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                        <FaCheckCircle className="text-green-400 text-[8px] mt-0.5 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Product Link */}
              {selectedProduct.link && (
                <div className="mt-4 p-3 bg-blue-50/50 backdrop-blur-sm rounded-xl border border-blue-100/50">
                  <p className="text-[10px] text-gray-500 font-medium">
                    Product URL: 
                    <a 
                      href={selectedProduct.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 ml-1 font-bold underline-offset-2 hover:underline"
                    >
                      {selectedProduct.link}
                    </a>
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer - Only Launch & Close */}
            <div className="px-6 py-3 border-t border-white/30 bg-white/30 backdrop-blur-sm flex gap-3">
              <button 
                onClick={() => handleLaunchProduct(selectedProduct.link)}
                className="flex-1 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <FaExternalLinkAlt className="text-[10px]" />
                Launch Product
              </button>
              <button 
                onClick={handleCloseModal}
                className="flex-1 py-2 text-xs font-bold text-gray-600 border border-white/50 rounded-lg hover:bg-white/50 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProducts;