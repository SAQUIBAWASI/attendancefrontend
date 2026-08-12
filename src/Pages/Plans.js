import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, Zap, Building2, Rocket, Globe, ChevronRight, Phone, 
  MessageCircle, PhoneCall, Sparkles, Award, Star, Shield, 
  TrendingUp, Crown, Gem, ArrowRight, Eye, X,
  Gift, CheckCircle2, ShieldCheck, Users, Stethoscope, Briefcase, Loader2, Layers,
  Calendar, Clock, BadgeCheck, Heart, Tag, Briefcase as BriefcaseIcon,
  User, CreditCard, FileText, Settings, BarChart3, Receipt, IndianRupee,
  Package
} from 'lucide-react';
import TimelyFooter from './TimelyFooter';
import TimelyNavbar from '../Components/TimelyNavbar';

// Features Popup Modal
const FeaturesModal = ({ isOpen, onClose, features, planName }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-gray-100 max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {planName} - Features
              </h3>
              <p className="text-sm text-gray-500 mt-1">All features included in this plan</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="space-y-3">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="mt-0.5 w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-blue-600" strokeWidth={3} />
                </div>
                <span className="text-gray-700 font-light leading-relaxed text-sm">
                  {feature}
                </span>
              </motion.div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-500 text-white font-semibold hover:shadow-lg transition-all hover:scale-[1.02]"
          >
            Close
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// GST Popup Modal
const GSTPopup = ({ isOpen, onClose, onConfirm, planPrice }) => {
  const gstAmount = Math.round(planPrice * 0.18);
  const totalAmount = planPrice + gstAmount;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <Receipt className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Tax Invoice</h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Plan Price</span>
                  <span className="font-semibold text-gray-900">₹{planPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-gray-200 pt-2">
                  <span className="text-gray-500">GST (18%)</span>
                  <span className="font-semibold text-blue-600">₹{gstAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-gray-200 pt-2">
                  <span className="text-gray-700 font-bold">Total Amount</span>
                  <span className="font-bold text-gray-900 text-lg">₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 text-white font-semibold hover:shadow-lg transition-all hover:scale-[1.02]"
                >
                  Proceed to Pay ₹{totalAmount.toLocaleString()}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Bundle Pricing Card - Single Card
const BundlePricingCard = ({ bundlePlan, onBook }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  const maxVisibleFeatures = 8;

  const visibleFeatures = bundlePlan.features?.slice(0, maxVisibleFeatures) || [];
  const hasMoreFeatures = bundlePlan.features?.length > maxVisibleFeatures;

  const mrpPrice = 12500;
  const offerPrice = bundlePlan.price || 999;
  const discountPercent = Math.round(((mrpPrice - offerPrice) / mrpPrice) * 100);
  const gstAmount = Math.round(offerPrice * 0.18);
  const totalWithGST = offerPrice + gstAmount;

  // All 4 Products included in the bundle
  const includedProducts = [
    { 
      name: "Recruitment", 
      icon: <BriefcaseIcon className="w-4 h-4" />, 
      color: "from-blue-500 to-cyan-500",
      desc: "Hire smarter with AI-powered recruitment"
    },
    { 
      name: "Payroll", 
      icon: <CreditCard className="w-4 h-4" />, 
      color: "from-purple-500 to-indigo-500",
      desc: "Seamless payroll & attendance management"
    },
    { 
      name: "Medical Camps", 
      icon: <Stethoscope className="w-4 h-4" />, 
      color: "from-rose-500 to-orange-500",
      desc: "Organize & manage health camps"
    },
    { 
      name: "Coworking Space", 
      icon: <Building2 className="w-4 h-4" />, 
      color: "from-orange-500 to-amber-500",
      desc: "Smart space & desk management"
    }
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative group bg-white rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-700 hover:-translate-y-3 border-2 border-blue-200 hover:border-blue-300 flex flex-col w-full max-w-4xl mx-auto"
      >
        {/* Premium Badge */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30 whitespace-nowrap">
          <div className="bg-gradient-to-r from-blue-600 to-emerald-500 text-white text-[10px] font-bold px-6 py-2.5 rounded-full uppercase tracking-[0.15em] shadow-xl border border-white/20 flex items-center gap-2">
            <Crown className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
            <span>Complete Bundle</span>
          </div>
        </div>

        <div className="relative rounded-3xl overflow-hidden flex flex-col flex-1 pt-6">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-emerald-500 opacity-0 group-hover:opacity-20 blur-2xl transition-all duration-700"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-emerald-500 opacity-0 group-hover:opacity-[0.04] transition-all duration-500"></div>

          <div className="relative p-6 md:p-10 flex flex-col flex-1">
            {/* Header - Top Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                <Package className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                  {bundlePlan.name || "Complete Bundle"}
                </h3>
                <p className="text-sm text-gray-500 font-light">All 4 products included • 30 days access</p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <p className="text-gray-600 font-light leading-relaxed text-base">
                {bundlePlan.description || "Get full access to all 4 products with our complete bundle. Perfect for businesses needing end-to-end solutions."}
              </p>
            </div>

            {/* Price Section with MRP & Offer */}
            <div className="mb-6 pb-6 border-b border-gray-100">
              <div className="flex flex-col items-start gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">
                    ₹{offerPrice.toLocaleString()}
                  </span>
                  <span className="text-gray-400 text-sm font-medium">/month</span>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm text-gray-400 line-through">
                    MRP: ₹{mrpPrice.toLocaleString()}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-white bg-red-500 px-3 py-1 rounded-full">
                    <Tag className="w-3 h-3" />
                    {discountPercent}% OFF
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full">
                    <Sparkles className="w-3 h-3" />
                    Best Deal
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">
                    + GST (18%): ₹{gstAmount.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className="inline-flex items-center gap-1 text-xs text-gray-500 font-medium bg-gray-50 px-3 py-1 rounded-full">
                  <Shield className="w-3 h-3" />
                  All features included
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-gray-500 font-medium bg-gray-50 px-3 py-1 rounded-full">
                  <Users className="w-3 h-3" />
                  Team ready
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium bg-emerald-50 px-3 py-1 rounded-full">
                  <IndianRupee className="w-3 h-3" />
                  Total: ₹{totalWithGST.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Products Included Section - ALL 4 PRODUCTS */}
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-500" />
                All 4 Products Included
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {includedProducts.map((product, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex flex-col items-center gap-1.5 p-3 bg-gray-50 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group/item"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${product.color} flex items-center justify-center shrink-0 group-hover/item:scale-110 transition-transform shadow-md`}>
                      {product.icon}
                    </div>
                    <span className="text-[10px] font-semibold text-gray-700 text-center leading-tight">
                      {product.name}
                    </span>
                    <span className="text-[8px] text-gray-400 text-center leading-tight hidden sm:block">
                      {product.desc}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Features Grid */}
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-blue-500" />
                Plan Benefits
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                {visibleFeatures.map((feature, idx) => (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={isHovered ? { opacity: 1, x: 0 } : { opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-start gap-2.5 text-sm p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="mt-0.5 w-4 h-4 rounded-full bg-blue-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Check className="w-2.5 h-2.5 text-blue-600" strokeWidth={3} />
                    </div>
                    <span className="text-gray-600 font-light leading-relaxed text-xs">
                      {feature}
                    </span>
                  </motion.div>
                ))}
              </div>

              {hasMoreFeatures && (
                <button
                  onClick={() => setShowFeatures(true)}
                  className="mt-3 text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors group/btn"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View all {bundlePlan.features?.length || 0} benefits
                  <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              )}
            </div>

            {/* CTA Button */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onBook(bundlePlan)}
                className="w-full py-4 rounded-xl text-center font-semibold text-base transition-all flex items-center justify-center gap-2 group/btn bg-gradient-to-r from-blue-600 to-emerald-500 text-white hover:shadow-xl shadow-lg shadow-blue-200"
              >
                Get Started - ₹{totalWithGST.toLocaleString()} (incl. GST)
                <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </motion.button>
              <div className="flex flex-wrap items-center justify-center gap-4 mt-3">
                <p className="text-center text-xs text-gray-400 flex items-center gap-1">
                  🔒 Secure payment
                </p>
                <p className="text-center text-xs text-gray-400 flex items-center gap-1">
                  ⏱️ 30 days access
                </p>
                <p className="text-center text-xs text-gray-400 flex items-center gap-1">
                  🔄 No auto-renewal
                </p>
              </div>
            </div>
          </div>

          <div className="h-1 w-full bg-gradient-to-r from-blue-600 to-emerald-500 opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
        </div>
      </motion.div>

      <FeaturesModal
        isOpen={showFeatures}
        onClose={() => setShowFeatures(false)}
        features={bundlePlan.features || []}
        planName="Complete Bundle"
      />
    </>
  );
};

// Booking Modal
const BookingModal = ({ isOpen, onClose, selectedPlan }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    workEmail: '',
    mobileNumber: '',
    companySize: '',
    industryType: '',
    referralCode: '',
    address: '',
    organizationName: '',
    panNumber: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [bookingData, setBookingData] = useState(null);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [showGSTPopup, setShowGSTPopup] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrorMessage('');
  };

  useEffect(() => {
    if (isOpen) {
      setFormData({
        fullName: '',
        workEmail: '',
        mobileNumber: '',
        companySize: '',
        industryType: '',
        referralCode: '',
        address: '',
        organizationName: '',
        panNumber: ''
      });
      setIsSuccess(false);
      setIsSubmitting(false);
      setErrorMessage('');
      setBookingData(null);
      setRegisteredEmail('');
      setShowGSTPopup(false);
    }
  }, [isOpen]);

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const validateForm = () => {
    if (!formData.fullName || !formData.workEmail || !formData.mobileNumber || !formData.companySize || !formData.industryType) {
      setErrorMessage('Please fill in all required fields');
      return false;
    }
    return true;
  };

  const bookPlan = async (transactionId) => {
    // ALL 4 products for bundle
    const accessibleProducts = [
      { name: "recruitment" },
      { name: "payroll" },
      { name: "medicalCamps" },
      { name: "coworkingSpace" }
    ];

    const requestBody = {
      fullName: formData.fullName,
      workEmail: formData.workEmail,
      mobileNumber: formData.mobileNumber,
      companySize: formData.companySize,
      industryType: formData.industryType,
      planId: selectedPlan._id,
      transactionId: transactionId,
      referralCode: formData.referralCode || '',
      accessibleProducts: accessibleProducts // 👈 Sending all 4 products
    };

    console.log('Booking Payload:', requestBody);

    const response = await fetch('https://api.ingrainsystems.com/api/clients/bookplan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok || data.success === false) {
      throw new Error(data.message || "Plan activation failed. Please contact support.");
    }

    setBookingData(data);
    setRegisteredEmail(formData.workEmail);
    return data;
  };

  const initiatePayment = async () => {
    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');

    if (!res) {
      throw new Error('Razorpay SDK failed to load. Are you online?');
    }

    const RAZORPAY_KEY = 'rzp_test_BxtRNvflG06PTV';
    const baseAmount = selectedPlan.price || 999;
    const gstAmount = Math.round(baseAmount * 0.18);
    const totalAmount = baseAmount + gstAmount;

    return new Promise((resolve, reject) => {
      const options = {
        key: RAZORPAY_KEY,
        amount: totalAmount * 100,
        currency: "INR",
        name: "Iryax Global",
        description: selectedPlan.name || "Complete Bundle",
        handler: async function (response) {
          const transactionId = response.razorpay_payment_id;
          resolve(transactionId);
        },
        prefill: {
          name: formData.fullName,
          email: formData.workEmail,
          contact: formData.mobileNumber
        },
        theme: {
          color: "#2563eb"
        },
        modal: {
          ondismiss: function() {
            reject(new Error('Payment cancelled'));
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setShowGSTPopup(true);
  };

  const handleGSTConfirm = async () => {
    setShowGSTPopup(false);
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const transactionId = await initiatePayment();
      await bookPlan(transactionId);
      setIsSuccess(true);
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage(error.message || 'Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>

              {isSuccess ? (
                <div className="p-12 text-center space-y-6 max-h-[80vh] overflow-y-auto">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900">Bundle Activated! 🎉</h3>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-gray-700 text-sm">
                      Welcome <span className="font-bold text-blue-600">{formData.fullName}</span>!
                      <span className="block text-xs text-gray-500 mt-1">Email: {registeredEmail}</span>
                      <span className="block text-xs text-green-600 mt-1">✓ Your Complete Bundle with all 4 products is now active!</span>
                    </p>
                  </div>

                  {bookingData?.referralApplied && bookingData?.referralCoinsEarned > 0 && (
                    <div className="bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Gift className="w-5 h-5 text-blue-600" />
                        <span className="text-blue-700 font-semibold">Referral Bonus!</span>
                      </div>
                      <p className="text-gray-700 text-sm">
                        You received <span className="font-bold text-blue-600">{bookingData.referralCoinsEarned} coins</span> for using referral code!
                      </p>
                    </div>
                  )}

                  {bookingData?.client && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <p className="text-xs text-gray-500">Client ID: <span className="font-mono font-semibold">{bookingData.client.clientId}</span></p>
                      <p className="text-xs text-gray-500">Referral Code: <span className="font-mono font-semibold text-blue-600">{bookingData.client.referralCode}</span></p>
                      <p className="text-xs text-gray-500">Wallet Coins: <span className="font-semibold text-emerald-600">{bookingData.client.walletCoins}</span></p>
                    </div>
                  )}

                  <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-xl p-4 border border-blue-200">
                    <p className="text-gray-600 text-sm">
                      ✨ Your complete bundle is now active. You have full access to all 4 products for 30 days.
                    </p>
                  </div>
                  
                  <button 
                    onClick={onClose}
                    className="bg-gradient-to-r from-blue-600 to-emerald-500 text-white px-8 py-3 rounded-full font-bold hover:shadow-lg transition-all"
                  >
                    Start Exploring
                  </button>
                </div>
              ) : (
                <div className="p-8 md:p-12 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Activate Complete Bundle</h2>
                      <p className="text-sm text-gray-500 mt-1">Fill in your details to get started</p>
                    </div>
                    <div className="bg-gradient-to-r from-blue-600 to-emerald-500 text-white px-4 py-2 rounded-full text-xs font-bold">
                      ₹{selectedPlan?.price || 999}
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 via-emerald-50 to-blue-50 rounded-xl p-4 mb-6 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Plan</p>
                        <p className="font-bold text-gray-900">{selectedPlan?.name || "Complete Bundle"}</p>
                        <p className="text-xs text-gray-500">All 4 products included</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Price</p>
                        <p className="font-bold text-gray-900 text-xl">
                          ₹{selectedPlan?.price || 999}<span className="text-sm text-gray-500 font-normal">/month</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {errorMessage && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-red-600 text-sm font-medium">{errorMessage}</p>
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-600 ml-1">Full Name *</label>
                      <input 
                        required
                        type="text" 
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-800 text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-600 ml-1">Work Email *</label>
                      <input 
                        required
                        type="email" 
                        name="workEmail"
                        value={formData.workEmail}
                        onChange={handleChange}
                        placeholder="john@company.com"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-800 text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-600 ml-1">Mobile Number *</label>
                        <input 
                          required
                          type="tel" 
                          name="mobileNumber"
                          value={formData.mobileNumber}
                          onChange={handleChange}
                          placeholder="+91 XXXXX XXXXX"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-800 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-600 ml-1">Company Size *</label>
                        <select 
                          required
                          name="companySize"
                          value={formData.companySize}
                          onChange={handleChange}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-800 text-sm appearance-none cursor-pointer"
                        >
                          <option value="" disabled className="bg-white">Select Size</option>
                          <option value="1-10" className="bg-white">1-10</option>
                          <option value="11-50" className="bg-white">11-50</option>
                          <option value="51-200" className="bg-white">51-200</option>
                          <option value="201-500" className="bg-white">201-500</option>
                          <option value="500+" className="bg-white">500+</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-600 ml-1">Industry *</label>
                      <input 
                        required
                        type="text" 
                        name="industryType"
                        value={formData.industryType}
                        onChange={handleChange}
                        placeholder="e.g. Technology, Finance, Retail"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-800 text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-600 ml-1">Address</label>
                      <input 
                        type="text" 
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Your business address"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-800 text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-600 ml-1">Organization Name</label>
                        <input 
                          type="text" 
                          name="organizationName"
                          value={formData.organizationName}
                          onChange={handleChange}
                          placeholder="Your organization"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-800 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-600 ml-1">PAN Number</label>
                        <input 
                          type="text" 
                          name="panNumber"
                          value={formData.panNumber}
                          onChange={handleChange}
                          placeholder="PAN Number"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-800 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-600 ml-1 flex items-center gap-2">
                        <Gift className="w-3.5 h-3.5 text-blue-600" />
                        Referral Code (Optional)
                      </label>
                      <input 
                        type="text" 
                        name="referralCode"
                        value={formData.referralCode}
                        onChange={handleChange}
                        placeholder="Enter referral code (e.g., IG1234)"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-800 text-sm"
                      />
                      <p className="text-xs text-gray-400 mt-1 ml-1">
                        💡 Have a referral code? Enter it to get bonus coins!
                      </p>
                    </div>

                    <button 
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-blue-600 to-emerald-500 text-white py-4 rounded-xl font-bold tracking-wide hover:shadow-lg transition-all transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-4 group"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Proceed to Payment - ₹{Math.round((selectedPlan?.price || 999) * 1.18)}
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-center gap-2 mt-2">
                      <ShieldCheck className="w-4 h-4 text-gray-400" />
                      <p className="text-xs text-gray-400">Your information is secure and encrypted</p>
                    </div>
                  </form>
                </div>
              )}
            </motion.div>
          </div>

          <GSTPopup
            isOpen={showGSTPopup}
            onClose={() => setShowGSTPopup(false)}
            onConfirm={handleGSTConfirm}
            planPrice={selectedPlan?.price || 999}
          />
        </>
      )}
    </AnimatePresence>
  );
};

const Price = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [bundlePlan, setBundlePlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch plans from API - Only get Bundle plan
  useEffect(() => {
    const fetchBundlePlan = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://api.ingrainsystems.com/api/clients/allplans');
        const data = await response.json();
        
        if (data.success && data.plans) {
          // Find only the Complete Bundle plan
          const bundle = data.plans.find(
            plan => plan.planFor === 'bundle' || 
                    plan.name?.toLowerCase().includes('bundle') ||
                    plan.name?.toLowerCase().includes('complete')
          );
          
          if (bundle) {
            setBundlePlan(bundle);
          } else {
            // Fallback if bundle not found in API
            setBundlePlan({
              _id: "6a7c03408eea0675f86baa69",
              name: "Complete Bundle",
              description: "Get all 4 products in one unified platform. End-to-end solutions for your entire business.",
              price: 999,
              priceDisplay: "₹999",
              features: [
                "Recruitment - Full Access",
                "Payroll - Full Access",
                "Medical Camps - Full Access",
                "Coworking Space - Full Access",
                "Unified Admin Dashboard",
                "Single Sign-On (SSO)",
                "Unified Analytics & Reporting",
                "Priority 24/7 Support",
                "API Access for All Modules",
                "Regular Updates & New Features",
                "Dedicated Account Manager",
                "Custom Integrations Support",
                "Enterprise-grade Security",
                "Data Migration Assistance",
                "Team Management Across Products"
              ],
              popular: true,
              buttonText: "Get Bundle",
              planFor: "bundle"
            });
          }
        } else {
          setError('Failed to load plan');
        }
      } catch (err) {
        console.error('Error fetching plans:', err);
        // Fallback bundle plan
        setBundlePlan({
          _id: "6a7c03408eea0675f86baa69",
          name: "Complete Bundle",
          description: "Get all 4 products in one unified platform. End-to-end solutions for your entire business.",
          price: 999,
          priceDisplay: "₹999",
          features: [
            "Recruitment - Full Access",
            "Payroll - Full Access",
            "Medical Camps - Full Access",
            "Coworking Space - Full Access",
            "Unified Admin Dashboard",
            "Single Sign-On (SSO)",
            "Unified Analytics & Reporting",
            "Priority 24/7 Support",
            "API Access for All Modules",
            "Regular Updates & New Features",
            "Dedicated Account Manager",
            "Custom Integrations Support",
            "Enterprise-grade Security",
            "Data Migration Assistance",
            "Team Management Across Products"
          ],
          popular: true,
          buttonText: "Get Bundle",
          planFor: "bundle"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBundlePlan();
  }, []);

  const handleBook = (plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (loading) {
    return (
      <>
        <TimelyNavbar />
        <main className="bg-white text-gray-900 font-sans pt-[52px] md:pt-[64px] min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            <p className="text-gray-500">Loading plan...</p>
          </div>
        </main>
        <TimelyFooter />
      </>
    );
  }

  if (error) {
    return (
      <>
        <TimelyNavbar />
        <main className="bg-white text-gray-900 font-sans pt-[52px] md:pt-[64px] min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
            >
              Retry
            </button>
          </div>
        </main>
        <TimelyFooter />
      </>
    );
  }

  return (
    <>
      <TimelyNavbar />
      <main className="bg-white text-gray-900 font-sans pt-[52px] md:pt-[64px] selection:bg-blue-500/30 overflow-x-hidden">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0" style={{ 
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(37, 99, 235, 0.03) 0%, transparent 50%), 
                              radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.03) 0%, transparent 50%),
                              radial-gradient(circle at 50% 20%, rgba(59, 130, 246, 0.02) 0%, transparent 50%)` 
          }}></div>
        </div>

        <section className="w-full flex flex-col items-center justify-center px-6 text-center relative pt-20 md:pt-28 pb-8 md:pb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10"
          >
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-gradient-to-r from-blue-100 to-emerald-100 rounded-full shadow-md border border-blue-200/50"
            >
              <Award className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-800">✦ Complete Bundle</span>
            </motion.div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight">
              All Products. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-emerald-500">
                One Bundle.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 font-light max-w-2xl mx-auto mb-6">
              Get all 4 products in one unified platform. End-to-end solutions for your entire business.
            </p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <div className="w-24 h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-emerald-500 rounded-full"></div>
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-blue-600 rounded-full"></div>
            </div>
          </motion.div>
        </section>

        {/* Bundle Card - Single */}
        <section className="w-full px-4 sm:px-6 py-8 relative z-10">
          <div className="max-w-4xl mx-auto">
            {bundlePlan && (
              <BundlePricingCard 
                bundlePlan={bundlePlan} 
                onBook={handleBook} 
              />
            )}
          </div>
        </section>

        <BookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          selectedPlan={selectedPlan}
        />
      </main>
      <TimelyFooter />
    </>
  );
};

export default Price;