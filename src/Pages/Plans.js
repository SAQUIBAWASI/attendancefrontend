import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, Zap, Building2, Rocket, Globe, ChevronRight, Phone, 
  MessageCircle, PhoneCall, Sparkles, Award, Star, Shield, 
  TrendingUp, Crown, Gem, ArrowRight, Eye, X,
  Gift, CheckCircle2, ShieldCheck, Users, Stethoscope, Briefcase, Loader2
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
                <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-emerald-500" strokeWidth={3} />
                </div>
                <span className="text-gray-700 font-light leading-relaxed text-sm">
                  {feature}
                </span>
              </motion.div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-lg transition-all hover:scale-[1.02]"
          >
            Close
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const PricingTier = ({ tier, index, onBook }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  const maxVisibleFeatures = 4;

  const getColorStyles = (tier) => {
    if (tier.isCustomContact) {
      return {
        gradient: 'from-rose-500 to-orange-500',
        bg: 'bg-rose-50',
        border: 'border-rose-200',
        text: 'text-rose-600',
        hover: 'hover:border-rose-300',
        shadow: 'shadow-rose-200'
      };
    }
    if (tier.featured) {
      return {
        gradient: 'from-blue-600 via-purple-600 to-indigo-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-600',
        hover: 'hover:border-blue-300',
        shadow: 'shadow-blue-200'
      };
    }
    switch(index % 3) {
      case 0:
        return {
          gradient: 'from-blue-500 to-cyan-500',
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-600',
          hover: 'hover:border-blue-300',
          shadow: 'shadow-blue-200'
        };
      case 1:
        return {
          gradient: 'from-purple-500 to-indigo-500',
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          text: 'text-purple-600',
          hover: 'hover:border-purple-300',
          shadow: 'shadow-purple-200'
        };
      default:
        return {
          gradient: 'from-emerald-500 to-teal-500',
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          text: 'text-emerald-600',
          hover: 'hover:border-emerald-300',
          shadow: 'shadow-emerald-200'
        };
    }
  };

  const colors = getColorStyles(tier);
  const visibleFeatures = tier.features.slice(0, maxVisibleFeatures);
  const hasMoreFeatures = tier.features.length > maxVisibleFeatures;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        viewport={{ once: true }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border ${colors.border} ${colors.hover} flex flex-col h-full min-h-[500px]`}
      >
        {tier.featured && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30 whitespace-nowrap">
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white text-[10px] font-bold px-5 py-2 rounded-full uppercase tracking-[0.15em] shadow-lg border border-white/20 flex items-center gap-2 whitespace-nowrap">
              <Crown className="w-3 h-3 text-yellow-300 shrink-0" />
              <span>Most Popular</span>
            </div>
          </div>
        )}

        <div className="relative rounded-3xl overflow-hidden flex flex-col flex-1">
          <div className={`absolute -inset-0.5 bg-gradient-to-r ${colors.gradient} opacity-0 group-hover:opacity-20 blur-2xl transition-all duration-700`}></div>
          <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-[0.04] transition-all duration-500`}></div>

          <div className="relative p-7 md:p-9 flex flex-col flex-1">
            <div className={`${tier.featured ? 'mt-5' : ''} mb-6`}>
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <tier.icon className="w-7 h-7 text-white" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-bold text-gray-900 mb-1 tracking-tight">
                  {tier.name}
                </h3>
                {tier.featured && (
                  <span className="text-[10px] font-medium text-purple-600 bg-purple-100 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                    Best Value
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 font-light leading-relaxed line-clamp-2">{tier.description}</p>
            </div>

            <div className="mb-6 pb-6 border-b border-gray-100">
              <div className="flex items-baseline gap-1">
                <span className={`text-4xl md:text-5xl font-bold tracking-tight ${tier.featured ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600' : 'text-gray-900'}`}>
                  {tier.price}
                </span>
                {tier.price !== 'FREE' && tier.price !== 'Custom' && (
                  <span className="text-gray-400 text-sm font-medium">/month</span>
                )}
              </div>
              {tier.price === 'FREE' && (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium mt-2 bg-emerald-50 px-3 py-1 rounded-full">
                  <Sparkles className="w-3 h-3" />
                  No credit card required
                </span>
              )}
              {tier.price === 'Custom' && (
                <span className="inline-flex items-center gap-1 text-xs text-orange-600 font-medium mt-2 bg-orange-50 px-3 py-1 rounded-full">
                  <Gem className="w-3 h-3" />
                  Bespoke integrations
                </span>
              )}
            </div>

            <div className="flex-1">
              <ul className="space-y-3">
                {visibleFeatures.map((feature, idx) => (
                  <motion.li 
                    key={idx} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={isHovered ? { opacity: 1, x: 0 } : { opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-start gap-3 text-sm"
                  >
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Check className="w-3 h-3 text-emerald-500" strokeWidth={3} />
                    </div>
                    <span className="text-gray-600 font-light leading-relaxed line-clamp-1">
                      {typeof feature === 'string' && feature.includes('FREE') ? (
                        <>
                          {feature.replace('FREE', '')}
                          <span className="text-emerald-500 font-bold ml-1 bg-emerald-50 px-1.5 py-0.5 rounded text-xs">FREE</span>
                        </>
                      ) : feature}
                    </span>
                  </motion.li>
                ))}
              </ul>

              {hasMoreFeatures && (
                <button
                  onClick={() => setShowFeatures(true)}
                  className="mt-3 text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors group/btn"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View all {tier.features.length} features
                  <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              {tier.isCustomContact ? (
                <div className="flex flex-col gap-3 w-full">
                  <a
                    href="tel:+919010481048"
                    className="group/btn w-full py-3.5 rounded-xl text-center font-semibold text-sm bg-white text-gray-700 border-2 border-gray-200 hover:border-rose-300 hover:bg-rose-50 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] shadow-sm"
                  >
                    <Phone className="w-4 h-4 text-rose-500" />
                    Call Sales Team
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </a>
                  <a
                    href="https://wa.me/919010481048?text=Hi%2C%20I%27m%20interested%20in%20a%20custom%20pricing%20plan."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/btn w-full py-3.5 rounded-xl text-center font-semibold text-sm bg-gradient-to-r from-emerald-600 to-green-500 text-white hover:from-emerald-700 hover:to-green-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:scale-[1.02]"
                  >
                    <MessageCircle className="w-4 h-4 fill-white text-white" />
                    Chat on WhatsApp
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </a>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onBook(tier)}
                  className={`w-full py-4 rounded-xl text-center font-semibold text-sm transition-all flex items-center justify-center gap-2 group/btn ${
                    tier.featured
                      ? `bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white hover:shadow-xl shadow-lg ${colors.shadow}`
                      : `bg-gray-50 text-gray-700 border-2 border-gray-200 hover:bg-gradient-to-r ${colors.gradient} hover:text-white hover:border-transparent hover:shadow-lg`
                  }`}
                >
                  {tier.buttonText || 'Get Started'}
                  <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </motion.button>
              )}
            </div>
          </div>

          <div className={`h-1 w-full bg-gradient-to-r ${colors.gradient} opacity-0 group-hover:opacity-100 transition-all duration-700 mt-auto`}></div>
        </div>
      </motion.div>

      <FeaturesModal
        isOpen={showFeatures}
        onClose={() => setShowFeatures(false)}
        features={tier.features}
        planName={tier.name}
      />
    </>
  );
};

// Booking Modal - Register + Razorpay + Book Plan
const BookingModal = ({ isOpen, onClose, selectedPlan }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    workEmail: '',
    mobileNumber: '',
    companySize: '',
    industryType: '',
    referralCode: '',
    registrationType: '',
    password: '',
    address: '',
    organizationName: '',
    gstNumber: '',
    panNumber: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [bookingData, setBookingData] = useState(null);
  const [registerData, setRegisterData] = useState(null);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const isCoworkingPlan = () => {
    return selectedPlan?.name?.toLowerCase().includes('coworking') || 
           selectedPlan?.name?.toLowerCase().includes('coworking space');
  };

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
        registrationType: '',
        password: '',
        address: '',
        organizationName: '',
        gstNumber: '',
        panNumber: ''
      });
      setIsSuccess(false);
      setIsSubmitting(false);
      setErrorMessage('');
      setBookingData(null);
      setRegisterData(null);
      setRegisteredEmail('');
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

  const isFreePlan = () => {
    return selectedPlan?.price === 'FREE' || selectedPlan?.priceValue === 0;
  };

  const validateForm = () => {
    if (!formData.fullName || !formData.workEmail || !formData.mobileNumber || !formData.companySize || !formData.industryType) {
      setErrorMessage('Please fill in all required fields');
      return false;
    }

    if (!formData.password || formData.password.length < 6) {
      setErrorMessage('Password is required and must be at least 6 characters');
      return false;
    }

    if (isCoworkingPlan() && !formData.registrationType) {
      setErrorMessage('Please select registration type');
      return false;
    }

    return true;
  };

  // Step 1: Register User
  const registerUser = async () => {
    const registerPayload = {
      name: formData.fullName,
      email: formData.workEmail,
      password: formData.password,
      mobile: formData.mobileNumber,
      address: formData.address || 'Not provided',
      role: isCoworkingPlan() ? 'cabinOwner' : 'doctor',
      organizationName: formData.organizationName || '',
      gstNumber: formData.gstNumber || '',
      panNumber: formData.panNumber || ''
    };

    console.log('Register Payload:', registerPayload);

    const registerResponse = await fetch('https://spaceapi.iryax.com/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerPayload),
    });

    const registerResult = await registerResponse.json();
    console.log('Register Response:', registerResult);

    if (!registerResponse.ok) {
      throw new Error(registerResult.message || 'Registration failed. Please try again.');
    }

    setRegisterData(registerResult);
    setRegisteredEmail(formData.workEmail);
    return registerResult;
  };

  // Step 2: Initialize Razorpay Payment
  const initiatePayment = async () => {
    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');

    if (!res) {
      throw new Error('Razorpay SDK failed to load. Are you online?');
    }

    const RAZORPAY_KEY = 'rzp_test_BxtRNvflG06PTV';

    return new Promise((resolve, reject) => {
      const options = {
        key: RAZORPAY_KEY,
        amount: (selectedPlan.priceValue || 0) * 100,
        currency: "INR",
        name: "Iryax Global",
        description: `Booking for ${selectedPlan.name}`,
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
          color: "#0071e3"
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

  // Step 3: Book Plan
  const bookPlan = async (transactionId) => {
    const requestBody = {
      fullName: formData.fullName,
      workEmail: formData.workEmail,
      mobileNumber: formData.mobileNumber,
      companySize: formData.companySize,
      industryType: formData.industryType,
      planId: selectedPlan.id,
      transactionId: transactionId,
      isFree: isFreePlan(),
      registrationType: formData.registrationType || 'general'
    };

    if (formData.referralCode && formData.referralCode.trim()) {
      requestBody.referralCode = formData.referralCode.trim();
    }

    console.log('Book Plan Payload:', requestBody);

    const response = await fetch('https://api.ingrainsystems.com/api/clients/bookplan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    console.log("Book Plan Response:", data);

    if (!response.ok || data.success === false) {
      throw new Error(data.message || "Booking failed. Please contact support.");
    }

    setBookingData(data);
    return data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // Step 1: Register
      await registerUser();

      // If FREE plan, skip payment
      if (isFreePlan()) {
        await bookPlan('FREE_PLAN_' + Date.now());
        setIsSuccess(true);
        setIsSubmitting(false);
        return;
      }

      // Step 2: Payment (Razorpay) - Only for paid plans
      const transactionId = await initiatePayment();
      
      // Step 3: Book Plan with transaction ID
      await bookPlan(transactionId);
      
      setIsSuccess(true);
      
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
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
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900">Registration & Booking Confirmed!</h3>
                
                {registerData?.user && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-gray-700 text-sm">
                      Welcome <span className="font-bold text-blue-600">{registerData.user.name}</span>! 
                      {isCoworkingPlan() ? (
                        <span className="block text-xs text-gray-500 mt-1">You have registered as a Co-Owner.</span>
                      ) : (
                        <span className="block text-xs text-gray-500 mt-1">You have registered as a Doctor.</span>
                      )}
                      <span className="block text-xs text-gray-500 mt-1">Email: {registeredEmail}</span>
                    </p>
                  </div>
                )}

                {bookingData?.referralApplied && bookingData?.referralCoinsEarned > 0 && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Gift className="w-5 h-5 text-purple-600" />
                      <span className="text-purple-700 font-semibold">Referral Bonus!</span>
                    </div>
                    <p className="text-gray-700 text-sm">
                      You received <span className="font-bold text-purple-600">{bookingData.referralCoinsEarned} coins</span> for using referral code!
                    </p>
                  </div>
                )}

                <p className="text-gray-600 text-lg">
                  {isFreePlan() 
                    ? "Your FREE plan has been activated successfully! Our team will reach out to you shortly."
                    : "Payment successful! Your plan has been activated. Our team will reach out to you shortly."}
                </p>
                
                <button 
                  onClick={onClose}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-bold hover:shadow-lg transition-all"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="p-8 md:p-12 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Complete Your Registration</h2>
                    <p className="text-sm text-gray-500 mt-1">Fill in your details to get started</p>
                  </div>
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-xs font-bold">
                    {selectedPlan?.name}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Selected Plan</p>
                      <p className="font-bold text-gray-900">{selectedPlan?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Price</p>
                      <p className="font-bold text-gray-900 text-xl">
                        {selectedPlan?.price === 'FREE' ? 'FREE' : selectedPlan?.price}
                        {selectedPlan?.price !== 'FREE' && selectedPlan?.price !== 'Custom' && <span className="text-sm text-gray-500 font-normal">/month</span>}
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
                  {/* Registration Type - Sirf Coworking ke liye */}
                  {isCoworkingPlan() && (
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-600 ml-1">Registration Type *</label>
                      <div className="grid grid-cols-2 gap-3 mt-1.5">
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, registrationType: 'co-working' }))}
                          className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                            formData.registrationType === 'co-working'
                              ? 'border-blue-600 bg-blue-50 text-blue-700'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <Users className="w-4 h-4" />
                          <span className="text-sm font-medium">Co-working</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, registrationType: 'medical-cabin' }))}
                          className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                            formData.registrationType === 'medical-cabin'
                              ? 'border-blue-600 bg-blue-50 text-blue-700'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <Stethoscope className="w-4 h-4" />
                          <span className="text-sm font-medium">Medical Cabin</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Common Fields */}
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

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-600 ml-1">Password *</label>
                    <input 
                      required
                      type="password" 
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min 6 characters"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-800 text-sm"
                    />
                    <p className="text-xs text-gray-400 mt-1 ml-1">Password must be at least 6 characters</p>
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
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-600 ml-1">GST Number</label>
                      <input 
                        type="text" 
                        name="gstNumber"
                        value={formData.gstNumber}
                        onChange={handleChange}
                        placeholder="GSTIN"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-800 text-sm"
                      />
                    </div>
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

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-600 ml-1 flex items-center gap-2">
                      <Gift className="w-3.5 h-3.5 text-purple-600" />
                      Referral Code (Optional)
                    </label>
                    <input 
                      type="text" 
                      name="referralCode"
                      value={formData.referralCode}
                      onChange={handleChange}
                      placeholder="Enter referral code (e.g., IG1234)"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-gray-800 text-sm"
                    />
                    <p className="text-xs text-gray-400 mt-1 ml-1">
                      💡 Have a referral code? Enter it to get bonus coins!
                    </p>
                  </div>

                  <button 
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold tracking-wide hover:shadow-lg transition-all transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-4 group"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {isFreePlan() ? 'Registering...' : 'Processing...'}
                      </>
                    ) : (
                      <>
                        {isFreePlan() ? 'Register & Confirm FREE Plan' : `Register & Pay ${selectedPlan?.price}`}
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                  
                  {isFreePlan() && (
                    <p className="text-center text-xs text-gray-500 mt-3">
                      No payment required for FREE plan. Just register and get started!
                    </p>
                  )}

                  <div className="flex items-center justify-center gap-2 mt-2">
                    <ShieldCheck className="w-4 h-4 text-gray-400" />
                    <p className="text-xs text-gray-400">Your information is secure and encrypted</p>
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const Price = () => {
  const [tiers, setTiers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleBook = (plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://api.ingrainsystems.com/api/clients/allplans');
        const data = await response.json();
        
        const apiPlans = data?.plans || [];

        const filteredPlans = apiPlans.filter(plan => 
          plan.planFor?.toLowerCase() === 'timelyhealth'
        );

        const getIcon = (planName) => {
          const name = planName?.toLowerCase() || '';
          if (name.includes('coworking')) return Users;
          if (name.includes('medical')) return Stethoscope;
          if (name.includes('payroll')) return Briefcase;
          if (name.includes('recruitment')) return Rocket;
          if (name.includes('premium') || name.includes('pro')) return Zap;
          if (name.includes('enterprise')) return Globe;
          return Rocket;
        };

        const getColor = (planName, index) => {
          const name = planName?.toLowerCase() || '';
          if (name.includes('coworking')) return 'from-purple-500 to-indigo-500';
          if (name.includes('medical')) return 'from-rose-500 to-orange-500';
          if (name.includes('payroll')) return 'from-emerald-500 to-teal-500';
          if (name.includes('recruitment')) return 'from-blue-500 to-cyan-500';
          if (name.includes('premium') || name.includes('pro')) return 'from-purple-600 to-indigo-600';
          if (name.includes('enterprise')) return 'from-indigo-600 to-blue-600';
          return index === 0 ? 'from-blue-500 to-cyan-500' : 'from-purple-600 to-indigo-600';
        };

        const formattedPlans = filteredPlans.map((plan, index) => ({
          id: plan._id || plan.id,
          name: plan.name || "Plan",
          description: plan.description || "",
          price: plan.price === 0 ? "FREE" : plan.price ? `₹${plan.price}` : "Custom",
          priceValue: plan.price || 0,
          icon: getIcon(plan.name),
          color: getColor(plan.name, index),
          features: typeof plan.features === "string" ? plan.features.split(",").map(f => f.trim()) : plan.features || [],
          featured: plan.popular === true,
          buttonText: plan.buttonText || 'Get Started',
          planFor: plan.planFor || 'timelyhealth'
        }));

        const salesCard = {
          id: "custom-sales",
          name: "Custom Plan",
          description: "Need a tailored solution? We build custom modules for your business.",
          price: "Custom",
          icon: PhoneCall,
          color: "from-rose-600 to-orange-600",
          features: [
            "Bespoke system modules",
            "Custom workflow integrations",
            "Tailored architecture",
            "Dedicated support"
          ],
          featured: false,
          isCustomContact: true
        };

        if (formattedPlans.length === 0) {
          const fallbackPlans = [
            {
              id: "plan-starter",
              name: "Starter",
              description: "Essential tools to get started.",
              price: "FREE",
              priceValue: 0,
              icon: Rocket,
              color: "from-blue-500 to-cyan-500",
              features: ["Core Features FREE", "Basic Dashboard", "Email Support"],
              featured: false,
              buttonText: 'Get Started',
              planFor: 'timelyhealth'
            },
            {
              id: "plan-pro",
              name: "Pro",
              description: "Complete solution for growing businesses.",
              price: "₹500",
              priceValue: 500,
              icon: Zap,
              color: "from-purple-600 to-indigo-600",
              features: ["Full Feature Suite", "Advanced Analytics", "Priority Support", "Custom Integrations"],
              featured: true,
              buttonText: 'Get Started',
              planFor: 'timelyhealth'
            },
            {
              id: "plan-enterprise",
              name: "Enterprise",
              description: "Advanced architecture for large-scale operations.",
              price: "₹1000",
              priceValue: 1000,
              icon: Globe,
              color: "from-emerald-500 to-teal-500",
              features: ["Complete Suite Access", "Multi-department Support", "24/7 Priority Support", "API Access"],
              featured: false,
              buttonText: 'Get Started',
              planFor: 'timelyhealth'
            }
          ];
          setTiers([...fallbackPlans, salesCard]);
        } else {
          setTiers([...formattedPlans, salesCard]);
        }
      } catch (err) {
        console.error("API Error:", err);
        const fallbackPlans = [
          {
            id: "plan-starter",
            name: "Starter",
            description: "Essential tools to get started.",
            price: "FREE",
            priceValue: 0,
            icon: Rocket,
            color: "from-blue-500 to-cyan-500",
            features: ["Core Features FREE", "Basic Dashboard", "Email Support"],
            featured: false,
            buttonText: 'Get Started',
            planFor: 'timelyhealth'
          },
          {
            id: "plan-pro",
            name: "Pro",
            description: "Complete solution for growing businesses.",
            price: "₹500",
            priceValue: 500,
            icon: Zap,
            color: "from-purple-600 to-indigo-600",
            features: ["Full Feature Suite", "Advanced Analytics", "Priority Support", "Custom Integrations"],
            featured: true,
            buttonText: 'Get Started',
            planFor: 'timelyhealth'
          },
          {
            id: "plan-enterprise",
            name: "Enterprise",
            description: "Advanced architecture for large-scale operations.",
            price: "₹1000",
            priceValue: 1000,
            icon: Globe,
            color: "from-emerald-500 to-teal-500",
            features: ["Complete Suite Access", "Multi-department Support", "24/7 Priority Support", "API Access"],
            featured: false,
            buttonText: 'Get Started',
            planFor: 'timelyhealth'
          }
        ];

        const salesCard = {
          id: "custom-sales",
          name: "Custom Plan",
          description: "Need a tailored solution? We build custom modules for your business.",
          price: "Custom",
          icon: PhoneCall,
          color: "from-rose-600 to-orange-600",
          features: ["Bespoke system modules", "Custom workflow integrations", "Tailored architecture", "Dedicated support"],
          featured: false,
          isCustomContact: true
        };

        setTiers([...fallbackPlans, salesCard]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <TimelyNavbar />
      <main className="bg-white text-gray-900 font-sans pt-[52px] md:pt-[64px] selection:bg-blue-500/30 overflow-x-hidden">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0" style={{ 
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.03) 0%, transparent 50%), 
                              radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.03) 0%, transparent 50%),
                              radial-gradient(circle at 50% 20%, rgba(16, 185, 129, 0.02) 0%, transparent 50%)` 
          }}></div>
        </div>

        <section className="w-full flex flex-col items-center justify-center px-6 text-center relative pt-20 md:pt-28 pb-12 md:pb-16">
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
              className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full shadow-md border border-blue-200/50"
            >
              <Award className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-800">✦ Simple Pricing</span>
            </motion.div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight">
              Simple Pricing. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
                Smart Business.
              </span>
            </h1>
            
            <div className="flex items-center justify-center gap-3 mt-6">
              <div className="w-24 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-full"></div>
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <div className="w-24 h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-full"></div>
            </div>
          </motion.div>
        </section>

        {loading ? (
          <section className="w-full px-4 sm:px-6 py-12 relative z-10">
            <div className="max-w-7xl mx-auto flex justify-center items-center min-h-[400px]">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-400">Loading plans...</p>
              </div>
            </div>
          </section>
        ) : (
          <section className="w-full px-4 sm:px-6 py-8 relative z-10">
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 w-full">
              {tiers.map((tier, idx) => (
                <PricingTier key={idx} tier={tier} index={idx} onBook={handleBook} />
              ))}
            </div>
          </section>
        )}

        <section className="w-full px-6 py-20 relative z-10">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">every business</span>
              </h2>
              <div className="w-20 h-1 mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: Building2,
                  title: "Pay for what you need",
                  description: "Scale up or down as your business grows.",
                  color: "from-blue-500 to-cyan-500",
                  bg: "bg-blue-50",
                  border: "border-blue-200"
                },
                {
                  icon: Shield,
                  title: "Enterprise security",
                  description: "Top-tier protection for your data.",
                  color: "from-purple-500 to-indigo-500",
                  bg: "bg-purple-50",
                  border: "border-purple-200"
                },
                {
                  icon: TrendingUp,
                  title: "No hidden fees",
                  description: "Transparent pricing with no surprises.",
                  color: "from-emerald-500 to-teal-500",
                  bg: "bg-emerald-50",
                  border: "border-emerald-200"
                }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className={`group p-6 ${item.bg} rounded-2xl border ${item.border} hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 font-light">{item.description}</p>
                </motion.div>
              ))}
            </div>
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