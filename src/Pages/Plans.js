import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, Sparkles, Crown, Rocket,
  ShieldCheck, Users, Briefcase as BriefcaseIcon,
  FileText, Package, Receipt, X, ChevronRight, Gift, Loader2,
  CheckCircle2, Layers, Bot, Puzzle, Wallet, UserCheck, Target,
  Zap, Activity, DoorOpen, Plus
} from 'lucide-react';
import TimelyFooter from './TimelyFooter';
import TimelyNavbar from '../Components/TimelyNavbar';

/* ══════════════════════════════════════════════
   API BASE URL
   ══════════════════════════════════════════════ */
const API_BASE_URL = "http://localhost:5001";

/* ══════════════════════════════════════════════
   DUMMY ADD-ONS DATA
   ══════════════════════════════════════════════ */
const ADDONS_DATA = [
  {
    _id: 'addon_op_mgmt',
    productName: 'OP Management',
    price: 1000,
    description: 'Complete outpatient management with patient registration, appointments & billing.',
    features: [
      'Patient Registration', 'Appointment Scheduling', 'Doctor Management',
      'Billing & Invoices', 'Prescription Generation', 'Vitals Tracking',
    ],
  },
  {
    _id: 'addon_bmi',
    productName: 'BMI',
    price: 1000,
    description: 'Body Mass Index tracking & health analytics for clinics and wellness centers.',
    features: [
      'BMI Calculator', 'Health Metrics Tracking', 'Patient Health Reports',
      'Progress Charts', 'Diet Recommendations', 'Export Reports',
    ],
  },
  {
    _id: 'addon_cabin',
    productName: 'Cabin Management',
    price: 1000,
    description: 'Manage clinic cabins, room allocation & doctor scheduling efficiently.',
    features: [
      'Cabin Allocation', 'Room Booking System', 'Doctor Schedule Mapping',
      'Occupancy Tracking', 'Maintenance Alerts', 'Analytics Dashboard',
    ],
  },
];

/* ══════════════════════════════════════════════
   PRODUCT ICON MAPPER
   ══════════════════════════════════════════════ */
const getProductIcon = (name, size = "w-4 h-4") => {
  const n = (name || "").toLowerCase();
  if (n.includes("payroll") || n.includes("salary") || n.includes("payslip")) return <Wallet className={`${size} text-blue-700`} />;
  if (n.includes("emp") || n.includes("tracking") || n.includes("employee") || n.includes("attendance") || n.includes("hrms")) return <UserCheck className={`${size} text-teal-600`} />;
  if (n.includes("recruit") || n.includes("hiring") || n.includes("candidate")) return <Target className={`${size} text-blue-700`} />;
  if (n.includes("short") || n.includes("gig") || n.includes("job")) return <Zap className={`${size} text-teal-600`} />;
  if (n.includes("op") || n.includes("patient") || n.includes("clinic")) return <Package className={`${size} text-teal-600`} />;
  if (n.includes("pharm") || n.includes("medic")) return <Package className={`${size} text-blue-700`} />;
  if (n.includes("lab")) return <FileText className={`${size} text-teal-600`} />;
  if (n.includes("bmi") || n.includes("health")) return <Activity className={`${size} text-blue-700`} />;
  if (n.includes("cabin") || n.includes("room")) return <DoorOpen className={`${size} text-teal-600`} />;
  return <BriefcaseIcon className={`${size} text-blue-700`} />;
};

/* ══════════════════════════════════════════════
   GST POPUP
   ══════════════════════════════════════════════ */
const GSTPopup = ({ isOpen, onClose, onConfirm, planPrice }) => {
  const gstAmount = Math.round(planPrice * 0.18);
  const totalAmount = planPrice + gstAmount;
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
                    <Receipt className="w-5 h-5 text-blue-700" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Tax Invoice</h3>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
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
                  <span className="font-semibold text-blue-700">₹{gstAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-gray-200 pt-2">
                  <span className="text-gray-700 font-bold">Total Amount</span>
                  <span className="font-bold text-gray-900 text-lg">₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-all">
                  Cancel
                </button>
                <button onClick={onConfirm} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-700 to-teal-500 text-white font-semibold hover:shadow-lg transition-all hover:scale-[1.02]">
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

/* ══════════════════════════════════════════════
   BOOKING MODAL
   ══════════════════════════════════════════════ */
const BookingModal = ({ isOpen, onClose, selectedPlan }) => {
  const [formData, setFormData] = useState({
    fullName: '', workEmail: '', mobileNumber: '', companySize: '',
    industryType: '', referralCode: '', address: '', organizationName: '', panNumber: ''
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
        fullName: '', workEmail: '', mobileNumber: '', companySize: '',
        industryType: '', referralCode: '', address: '', organizationName: '', panNumber: ''
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

  /* ══════════════════════════════════════════════
     STEP 1: CREATE ORDER
     POST /api/timely-clients/bookplan
     Body: { planId, planName, price }
     ══════════════════════════════════════════════ */
  const createOrder = async () => {
    const response = await fetch(`${API_BASE_URL}/api/timely-clients/bookplan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        planId: selectedPlan._id,
        planName: selectedPlan.planName || selectedPlan.productName,
        price: selectedPlan.price,
      }),
    });
    const data = await response.json();
    if (!response.ok || data.success === false) {
      throw new Error(data.message || "Failed to create order");
    }
    return data; // { order: { orderId, amount, currency }, keyId }
  };

  /* ══════════════════════════════════════════════
     STEP 2: RAZORPAY CHECKOUT
     ══════════════════════════════════════════════ */
  const initiatePayment = async () => {
    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
    if (!res) throw new Error('Razorpay SDK failed to load. Are you online?');

    // Order create karo backend se
    const { order, keyId } = await createOrder();

    return new Promise((resolve, reject) => {
      const options = {
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: "TimelyHealth",
        description: selectedPlan.planName || selectedPlan.productName || "Premium Plan",
        handler: async function (response) {
          /* response = { razorpay_order_id, razorpay_payment_id, razorpay_signature } */
          resolve(response);
        },
        prefill: {
          name: formData.fullName,
          email: formData.workEmail,
          contact: formData.mobileNumber,
        },
        theme: { color: "#1E5FA8" },
        modal: { ondismiss: function () { reject(new Error('Payment cancelled')); } }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    });
  };

  /* ══════════════════════════════════════════════
     STEP 3: BOOK PLAN (VERIFY + SAVE)
     POST /api/timely-clients/bookplan
     Body: form + razorpay verification fields
     ══════════════════════════════════════════════ */
  const bookPlan = async (razorpayResponse) => {
    const accessibleProducts = (selectedPlan?.products || []).map((p) => ({
      name: p.productName,
    }));

    const requestBody = {
      /* form fields */
      fullName: formData.fullName,
      workEmail: formData.workEmail,
      mobileNumber: formData.mobileNumber,
      companySize: formData.companySize,
      industryType: formData.industryType,
      address: formData.address || '',
      organizationName: formData.organizationName || '',
      panNumber: formData.panNumber || '',
      planId: selectedPlan._id,
      referralCode: formData.referralCode || '',
      accessibleProducts,

      /* razorpay verification fields */
      razorpay_order_id: razorpayResponse.razorpay_order_id,
      razorpay_payment_id: razorpayResponse.razorpay_payment_id,
      razorpay_signature: razorpayResponse.razorpay_signature,
    };

    const response = await fetch(`${API_BASE_URL}/api/timely-clients/bookplan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setShowGSTPopup(true);
  };

  const handleGSTConfirm = async () => {
    setShowGSTPopup(false);
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      // Step 1+2: Order create + Razorpay checkout
      const razorpayResponse = await initiatePayment();
      // Step 3: Verify + save booking
      await bookPlan(razorpayResponse);
      setIsSuccess(true);
      setIsSubmitting(false);
    } catch (error) {
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
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
                  <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10 text-teal-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900">Plan Activated! 🎉</h3>
                  <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                    <p className="text-gray-700 text-sm">
                      Welcome <span className="font-bold text-blue-700">{formData.fullName}</span>!
                      <span className="block text-xs text-gray-500 mt-1">Email: {registeredEmail}</span>
                      <span className="block text-xs text-green-600 mt-1">✓ Your plan is now active!</span>
                    </p>
                  </div>
                  {bookingData?.client && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <p className="text-xs text-gray-500">Client ID: <span className="font-mono font-semibold">{bookingData.client.clientId}</span></p>
                      <p className="text-xs text-gray-500">Referral Code: <span className="font-mono font-semibold text-blue-700">{bookingData.client.referralCode}</span></p>
                    </div>
                  )}
                  <button
                    onClick={onClose}
                    className="bg-gradient-to-r from-blue-700 to-teal-500 text-white px-8 py-3 rounded-full font-bold hover:shadow-lg transition-all"
                  >
                    Start Exploring
                  </button>
                </div>
              ) : (
                <div className="p-8 md:p-12 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Activate {selectedPlan?.planName || selectedPlan?.productName || "Plan"}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">Fill in your details to get started</p>
                    </div>
                    <div className="bg-gradient-to-r from-blue-700 to-teal-500 text-white px-4 py-2 rounded-full text-xs font-bold">
                      ₹{selectedPlan?.price || 0}
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl p-4 mb-6 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Plan / Add-on</p>
                        <p className="font-bold text-gray-900">
                          {selectedPlan?.planName || selectedPlan?.productName || "Plan"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {selectedPlan?.products?.length
                            ? `${selectedPlan.products.length} products included`
                            : 'Single add-on'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Price</p>
                        <p className="font-bold text-gray-900 text-xl">₹{selectedPlan?.price || 0}</p>
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
                      <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="John Doe"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition-all text-gray-800 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-600 ml-1">Work Email *</label>
                      <input required type="email" name="workEmail" value={formData.workEmail} onChange={handleChange} placeholder="john@company.com"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition-all text-gray-800 text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-600 ml-1">Mobile Number *</label>
                        <input required type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} placeholder="+91 XXXXX XXXXX"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition-all text-gray-800 text-sm" />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-600 ml-1">Company Size *</label>
                        <select required name="companySize" value={formData.companySize} onChange={handleChange}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition-all text-gray-800 text-sm appearance-none cursor-pointer">
                          <option value="" disabled>Select Size</option>
                          <option value="1-10">1-10</option>
                          <option value="11-50">11-50</option>
                          <option value="51-200">51-200</option>
                          <option value="201-500">201-500</option>
                          <option value="500+">500+</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-600 ml-1">Industry *</label>
                      <input required type="text" name="industryType" value={formData.industryType} onChange={handleChange} placeholder="e.g. Technology, Finance, Retail"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition-all text-gray-800 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-600 ml-1">Address</label>
                      <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Your business address"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition-all text-gray-800 text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-600 ml-1">Organization Name</label>
                        <input type="text" name="organizationName" value={formData.organizationName} onChange={handleChange} placeholder="Your organization"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition-all text-gray-800 text-sm" />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-600 ml-1">PAN Number</label>
                        <input type="text" name="panNumber" value={formData.panNumber} onChange={handleChange} placeholder="PAN Number"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition-all text-gray-800 text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-600 ml-1 flex items-center gap-2">
                        <Gift className="w-3.5 h-3.5 text-blue-700" />
                        Referral Code (Optional)
                      </label>
                      <input type="text" name="referralCode" value={formData.referralCode} onChange={handleChange} placeholder="Enter referral code"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition-all text-gray-800 text-sm" />
                    </div>
                    <button type="submit" disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-blue-700 to-teal-500 text-white py-4 rounded-xl font-bold tracking-wide hover:shadow-lg transition-all transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-4 group">
                      {isSubmitting ? (<><Loader2 className="w-5 h-5 animate-spin" />Processing...</>) : (<>Proceed to Payment - ₹{Math.round((selectedPlan?.price || 0) * 1.18)}<ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>)}
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
            planPrice={selectedPlan?.price || 0}
          />
        </>
      )}
    </AnimatePresence>
  );
};

/* ══════════════════════════════════════════════
   MAIN PRICE PAGE
   ══════════════════════════════════════════════ */
const Price = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [bundlePlan, setBundlePlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('allInOne');
  const [selectedAddonIds, setSelectedAddonIds] = useState([]);

  const tabs = [
    { key: 'memberPlan', label: 'Member Plan', icon: <BriefcaseIcon className="w-3.5 h-3.5" /> },
    { key: 'allInOne', label: 'All In One', icon: <Layers className="w-3.5 h-3.5" /> },
    { key: 'aiAgent', label: 'AI Agent', icon: <Bot className="w-3.5 h-3.5" /> },
    { key: 'addOns', label: 'Add-ons', icon: <Puzzle className="w-3.5 h-3.5" /> },
  ];

  useEffect(() => {
    const fetchBundlePlan = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/api/timely-plans/getalltimelyplans`);
        const result = await response.json();

        if (result.success && Array.isArray(result.data) && result.data.length > 0) {
          const activePlan = result.data.find(p => p.status === "active") || result.data[0];
          setBundlePlan(activePlan);
        } else {
          setError("No plans available");
          setBundlePlan(null);
        }
      } catch (err) {
        console.error('Error fetching plans:', err);
        setError("Failed to load plans. Please try again.");
        setBundlePlan(null);
      } finally {
        setLoading(false);
      }
    };
    fetchBundlePlan();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (activeTab !== 'addOns') setSelectedAddonIds([]);
  }, [activeTab]);

  if (loading) {
    return (
      <>
        <TimelyNavbar />
        <main className="bg-white min-h-screen flex items-center justify-center pt-[64px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-blue-700" />
            <p className="text-gray-500">Loading plan...</p>
          </div>
        </main>
        <TimelyFooter />
      </>
    );
  }

  if (error || !bundlePlan) {
    return (
      <>
        <TimelyNavbar />
        <main className="bg-white min-h-screen flex items-center justify-center pt-[64px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || "No plan found"}</p>
            <button onClick={() => window.location.reload()} className="px-6 py-2 bg-blue-700 text-white rounded-full hover:bg-blue-800">
              Retry
            </button>
          </div>
        </main>
        <TimelyFooter />
      </>
    );
  }

  const plan = bundlePlan;
  const basePrice = plan.price || 0;
  const discount = plan.discount || 0;
  const discountedPrice = Math.round(basePrice - (basePrice * discount / 100));
  const gstAmount = Math.round(discountedPrice * 0.18);
  const totalWithGST = discountedPrice + gstAmount;
  const description = plan.description || '';
  const products = plan.products || [];

  const validityLabel = plan.validityUnit === "years"
    ? `${plan.validity} Year${plan.validity > 1 ? "s" : ""}`
    : plan.validityUnit === "months"
      ? `${plan.validity} Month${plan.validity > 1 ? "s" : ""}`
      : `${plan.validity} Days`;

  const validityDays = plan.validityUnit === "years"
    ? plan.validity * 365
    : plan.validityUnit === "months"
      ? plan.validity * 30
      : plan.validity;

  const priceSuffix = plan.validityUnit === "years" ? "/year" : plan.validityUnit === "months" ? "/month" : "/plan";

  const showProducts = activeTab === 'allInOne';
  const showAddons = activeTab === 'addOns';
  const showPricingCard = showProducts || showAddons;

  const toggleAddon = (addonId) => {
    setSelectedAddonIds(prev =>
      prev.includes(addonId) ? prev.filter(id => id !== addonId) : [...prev, addonId]
    );
  };

  const selectedAddons = ADDONS_DATA.filter(a => selectedAddonIds.includes(a._id));
  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const addonsGST = Math.round(addonsTotal * 0.18);
  const addonsTotalWithGST = addonsTotal + addonsGST;

  const openBulkAddonBooking = () => {
    if (selectedAddons.length === 0) return;
    setSelectedPlan({
      _id: selectedAddons.map(a => a._id).join(','),
      planName: `${selectedAddons.length} Add-on${selectedAddons.length > 1 ? 's' : ''}`,
      productName: selectedAddons.map(a => a.productName).join(', '),
      price: addonsTotal,
      products: selectedAddons.map(a => ({ productName: a.productName })),
    });
    setIsModalOpen(true);
  };

  return (
    <>
      <TimelyNavbar />
      <main className="bg-white text-gray-900 font-sans pt-[52px] md:pt-[64px] overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">

          {/* SLIM HERO BANNER */}
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-lg overflow-hidden mt-4 md:mt-5 mb-4 bg-gradient-to-r from-blue-700 via-blue-600 to-teal-500 text-white shadow-md"
          >
            <div className="relative px-4 md:px-5 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex-1 min-w-[260px]">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mb-0.5">
                    <span className="text-sm md:text-base font-medium text-white/95 leading-tight">
                      {plan.planName} at just
                    </span>
                    {discount > 0 && (
                      <span className="text-white/50 line-through text-xs md:text-sm font-normal">
                        ₹{basePrice.toLocaleString()}
                      </span>
                    )}
                    <span className="text-xl md:text-2xl font-extrabold text-white leading-none">
                      ₹{discountedPrice.toLocaleString()}
                    </span>
                    <span className="text-xs md:text-sm text-white/80 font-normal">{priceSuffix}</span>
                    <span className="text-white/60 text-xs mx-0.5">•</span>
                    <span className="text-[10px] md:text-xs text-white/85 font-medium">{validityLabel}</span>
                    <span className="text-white/60 text-xs mx-0.5">•</span>
                    <span className="text-[10px] md:text-xs text-white/85 font-medium">Unlimited Users</span>
                  </div>

                  {description && (
                    <p className="text-[10px] md:text-[11px] text-white/75 leading-snug line-clamp-1 max-w-2xl">
                      {description}
                    </p>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setSelectedPlan({ ...plan, price: discountedPrice });
                    setIsModalOpen(true);
                  }}
                  className="flex items-center gap-1 bg-white text-blue-700 font-bold text-[11px] md:text-xs px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all group whitespace-nowrap"
                >
                  Book Demo
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* TABS */}
          <div className="mb-4 -mx-1 overflow-x-auto pb-1">
            <div className="inline-flex items-center gap-1 bg-white rounded-full p-1 shadow-sm border border-gray-100 min-w-full sm:min-w-0">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-4 md:px-6 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-semibold transition-all whitespace-nowrap ${
                    activeTab === tab.key ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* MAIN LAYOUT */}
          <div className={`grid gap-6 items-start ${showPricingCard ? 'lg:grid-cols-3' : 'lg:grid-cols-1'}`}>

            {/* LEFT */}
            <div className={showPricingCard ? 'lg:col-span-2' : 'lg:col-span-1'}>
              {showProducts && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 auto-rows-fr">
                    {products.map((product, pIdx) => (
                      <motion.div
                        key={pIdx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: pIdx * 0.04 }}
                        className="bg-white rounded-xl border border-gray-200 p-3 hover:shadow-md hover:border-blue-200 transition-all"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center shrink-0">
                            {getProductIcon(product.productName, "w-3.5 h-3.5")}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-[13px] font-bold text-gray-900 truncate leading-tight">{product.productName}</h3>
                            <p className="text-[9px] text-gray-500">{product.features?.length || 0} features</p>
                          </div>
                        </div>
                        <div className="border-t border-gray-100 mb-2"></div>
                        <ul className="space-y-1">
                          {(product.features || []).map((feature, fIdx) => (
                            <li key={fIdx} className="flex items-start gap-1.5">
                              <Check className="w-3 h-3 text-teal-600 mt-0.5 shrink-0" strokeWidth={3} />
                              <span className="text-[11px] text-gray-600 leading-tight">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    ))}
                  </div>

                  <div className="bg-gray-50 rounded-xl border border-dashed border-gray-300 p-3">
                    <h4 className="text-[11px] font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-blue-700" />
                      Integrations included (free)
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {["Google", "Razorpay", "WhatsApp API", "Tally", "Stripe", "Slack", "Zoom", "Zapier"].map((int, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-white border border-gray-200 rounded-full text-[10px] text-gray-600">
                          <span className="w-1 h-1 rounded-full bg-teal-500"></span>
                          {int}
                        </span>
                      ))}
                    </div>
                    <p className="text-[9px] text-gray-400 mt-1.5">All integrations are charged as custom integrations.</p>
                  </div>
                </div>
              )}

              {/* ADD-ONS TAB */}
              {showAddons && (
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl border border-blue-200 p-3 mb-1">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <Puzzle className="w-4 h-4 text-blue-700" />
                      Premium Add-ons
                    </h3>
                    <p className="text-[11px] text-gray-600 mt-0.5">
                      Enhance your plan with these powerful add-ons. Each add-on is priced at <strong>₹1,000</strong>. Click <strong>Add</strong> to include it in your cart.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 auto-rows-fr">
                    {ADDONS_DATA.map((addon, idx) => {
                      const isSelected = selectedAddonIds.includes(addon._id);
                      return (
                        <motion.div
                          key={addon._id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className={`bg-white rounded-xl border p-3 transition-all flex flex-col ${
                            isSelected ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md' : 'border-gray-200 hover:shadow-md hover:border-blue-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center shrink-0">
                                {getProductIcon(addon.productName, "w-3.5 h-3.5")}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="text-[13px] font-bold text-gray-900 truncate leading-tight">{addon.productName}</h3>
                                <p className="text-[9px] text-gray-500">{addon.features.length} features</p>
                              </div>
                            </div>
                            {isSelected && (
                              <span className="shrink-0 inline-flex items-center gap-0.5 bg-teal-100 text-teal-700 text-[9px] font-bold px-2 py-0.5 rounded-full border border-teal-200">
                                <Check className="w-2.5 h-2.5" strokeWidth={3} />
                                Added
                              </span>
                            )}
                          </div>

                          <p className="text-[10px] text-gray-500 leading-snug mb-2 line-clamp-2">{addon.description}</p>
                          <div className="border-t border-gray-100 mb-2"></div>

                          <ul className="space-y-1 flex-1 mb-3">
                            {addon.features.map((feature, fIdx) => (
                              <li key={fIdx} className="flex items-start gap-1.5">
                                <Check className="w-3 h-3 text-teal-600 mt-0.5 shrink-0" strokeWidth={3} />
                                <span className="text-[11px] text-gray-600 leading-tight">{feature}</span>
                              </li>
                            ))}
                          </ul>

                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toggleAddon(addon._id)}
                            className={`w-full py-2 rounded-lg font-bold text-[11px] shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5 group border ${
                              isSelected
                                ? 'bg-teal-50 text-teal-700 border-teal-300 hover:bg-teal-100'
                                : 'bg-gradient-to-r from-blue-700 to-teal-500 text-white border-transparent'
                            }`}
                          >
                            {isSelected ? (
                              <><Check className="w-3.5 h-3.5" strokeWidth={3} />Added — Remove</>
                            ) : (
                              <><Plus className="w-3.5 h-3.5" />Add for ₹{addon.price.toLocaleString()}</>
                            )}
                          </motion.button>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* COMING SOON */}
              {!showProducts && !showAddons && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
                    {tabs.find(t => t.key === activeTab)?.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{tabs.find(t => t.key === activeTab)?.label}</h3>
                  <p className="text-sm text-gray-500 mb-1">Coming soon</p>
                  <p className="text-xs text-gray-400">This section will be available shortly. Stay tuned!</p>
                </motion.div>
              )}
            </div>

            {/* RIGHT: STICKY PRICING CARD */}
            {showPricingCard && (
              <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-24">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden"
                  >
                    <div className="p-3 flex flex-col lg:min-h-[520px]">
                      {showAddons ? (
                        <>
                          <div>
                            <div className="inline-flex items-center gap-1.5 bg-purple-50 border border-purple-200 text-purple-700 text-[10px] font-bold px-2.5 py-1 rounded-full mb-2">
                              <Puzzle className="w-3 h-3" />
                              Add-ons Cart
                            </div>

                            <p className="text-[10px] text-gray-500 mb-1.5">
                              {selectedAddons.length} of {ADDONS_DATA.length} selected
                            </p>

                            <div className="flex items-baseline gap-1 mb-1">
                              <span className="text-3xl font-extrabold text-gray-900">₹{addonsTotal.toLocaleString()}</span>
                              <span className="text-xs text-gray-500 font-medium">/total</span>
                            </div>

                            {selectedAddons.length > 0 && (
                              <div className="bg-gray-50 rounded-lg border border-gray-100 p-2.5 mb-3 space-y-1.5 text-[11px]">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Subtotal</span>
                                  <span className="font-semibold text-gray-800">₹{addonsTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">GST (18%)</span>
                                  <span className="font-semibold text-blue-700">₹{addonsGST.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between border-t border-gray-200 pt-1.5">
                                  <span className="font-bold text-gray-800">Total</span>
                                  <span className="font-extrabold text-gray-900">₹{addonsTotalWithGST.toLocaleString()}</span>
                                </div>
                              </div>
                            )}

                            {selectedAddons.length > 0 ? (
                              <div className="space-y-1.5 mb-4 max-h-[180px] overflow-y-auto pr-1">
                                {selectedAddons.map((a) => (
                                  <div key={a._id} className="flex items-center justify-between text-[11px] py-1 px-2 bg-white rounded-md border border-gray-200">
                                    <span className="text-gray-700 truncate flex items-center gap-1.5 min-w-0">
                                      <Check className="w-3 h-3 text-teal-600 shrink-0" strokeWidth={3} />
                                      <span className="truncate">{a.productName}</span>
                                    </span>
                                    <div className="flex items-center gap-2 shrink-0">
                                      <span className="font-semibold text-gray-800">₹{a.price.toLocaleString()}</span>
                                      <button onClick={() => toggleAddon(a._id)} className="p-0.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Remove">
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="space-y-1.5 mb-4">
                                <div className="flex items-start gap-2">
                                  <Check className="w-3.5 h-3.5 text-teal-600 mt-0.5 shrink-0" strokeWidth={3} />
                                  <span className="text-[11px] text-gray-700">Each add-on @ <strong>₹1,000</strong></span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <Check className="w-3.5 h-3.5 text-teal-600 mt-0.5 shrink-0" strokeWidth={3} />
                                  <span className="text-[11px] text-gray-700">Mix & match any add-ons</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <Check className="w-3.5 h-3.5 text-teal-600 mt-0.5 shrink-0" strokeWidth={3} />
                                  <span className="text-[11px] text-gray-700">Priority support</span>
                                </div>
                              </div>
                            )}

                            <motion.button
                              whileHover={{ scale: selectedAddons.length > 0 ? 1.02 : 1 }}
                              whileTap={{ scale: selectedAddons.length > 0 ? 0.98 : 1 }}
                              onClick={openBulkAddonBooking}
                              disabled={selectedAddons.length === 0}
                              className={`w-full py-3 rounded-xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 group ${
                                selectedAddons.length > 0
                                  ? 'bg-gradient-to-r from-blue-700 to-teal-500 text-white shadow-blue-500/30 hover:shadow-xl'
                                  : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                              }`}
                            >
                              {selectedAddons.length > 0
                                ? `Book Now — ₹${addonsTotalWithGST.toLocaleString()}`
                                : 'Select add-ons to continue'}
                              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </motion.button>
                          </div>

                          <div className="mt-auto pt-4 border-t border-gray-100 space-y-2 text-[10px]">
                            <p className="text-gray-400 leading-relaxed">
                              Add-ons are charged separately from your base plan. All add-ons are one-time purchases with lifetime access.
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <div className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-700 text-[10px] font-bold px-2.5 py-1 rounded-full mb-2">
                              <Crown className="w-3 h-3" />
                              Best value plan
                            </div>

                            <p className="text-[10px] text-gray-500 mb-1.5">{validityLabel} - {validityDays} days</p>

                            <div className="flex items-baseline gap-1 mb-1">
                              <span className="text-3xl font-extrabold text-gray-900">₹{discountedPrice.toLocaleString()}</span>
                              <span className="text-xs text-gray-500 font-medium">{priceSuffix}</span>
                            </div>
                            <p className="text-[10px] text-gray-500 mb-4">₹{totalWithGST.toLocaleString()} incl. GST for the plan</p>

                            <div className="space-y-1.5 mb-4">
                              <div className="flex items-start gap-2">
                                <Check className="w-3.5 h-3.5 text-teal-600 mt-0.5 shrink-0" strokeWidth={3} />
                                <span className="text-[11px] text-gray-700"><strong>Unlimited users</strong> included</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <Check className="w-3.5 h-3.5 text-teal-600 mt-0.5 shrink-0" strokeWidth={3} />
                                <span className="text-[11px] text-gray-700">All {products.length} products included</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <Check className="w-3.5 h-3.5 text-teal-600 mt-0.5 shrink-0" strokeWidth={3} />
                                <span className="text-[11px] text-gray-700">Priority support</span>
                              </div>
                            </div>

                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                setSelectedPlan({ ...plan, price: discountedPrice });
                                setIsModalOpen(true);
                              }}
                              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-700 to-teal-500 text-white font-bold text-xs shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
                            >
                              Book Demo
                              <Sparkles className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                            </motion.button>
                          </div>

                          <div className="mt-auto pt-4 border-t border-gray-100 space-y-2 text-[10px]">
                            <div className="flex items-start gap-2">
                              <Users className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                              <div className="flex-1">
                                <span className="text-gray-500">Extra member</span>
                                <span className="float-right font-semibold text-gray-800">₹500/user/month</span>
                              </div>
                            </div>
                            <p className="text-gray-400 leading-relaxed">
                              Outgoing limits are at account level, irrespective of team size.
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                </div>
              </div>
            )}
          </div>

          {/* BOTTOM CTA BANNER */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-10 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 md:p-8 flex flex-wrap items-center justify-between gap-4 shadow-xl"
          >
            <div className="text-white">
              <h3 className="text-lg md:text-2xl font-bold mb-1">Ready to get started?</h3>
              <p className="text-xs md:text-sm text-gray-300">Start your free trial in 2 minutes!</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedPlan({ ...plan, price: discountedPrice });
                setIsModalOpen(true);
              }}
              className="px-6 md:px-8 py-3 rounded-full bg-gradient-to-r from-blue-700 to-teal-500 text-white font-bold text-sm md:text-base shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all flex items-center gap-2 group"
            >
              Start Free Trial
              <Rocket className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </motion.button>
          </motion.div>

          {/* FOOTER NOTES */}
          <div className="mt-8 pt-6 border-t border-gray-200 space-y-2 text-[11px] md:text-xs text-gray-500">
            <p className="flex items-start gap-1.5"><span className="text-blue-700 mt-0.5">•</span>For all add-ons with 'per user' pricing, base plan extra user charges will also be applicable.</p>
            <p className="flex items-start gap-1.5"><span className="text-blue-700 mt-0.5">•</span>All add-ons have to be purchased for the full team & for the full duration of your current plan.</p>
            <p className="flex items-start gap-1.5"><span className="text-blue-700 mt-0.5">•</span>We do not have a refund policy. Please make use of your free trial facility before making a purchase.</p>
            <p className="flex items-start gap-1.5">
              <span className="text-blue-700 mt-0.5">•</span>
              <span><strong className="text-gray-700">Multiple numbers policy:</strong> To buy more than 1 number, all numbers (including your 1st) must be recharged with Annual plans. This facility is available only to Private Limited/LLP/GST-registered entities. No offers apply on additional numbers.</span>
            </p>
            <p className="flex items-start gap-1.5"><span className="text-blue-700 mt-0.5">•</span><strong className="text-gray-700">+18% GST</strong> applicable on all prices.</p>
          </div>
        </div>
      </main>

      <BookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} selectedPlan={selectedPlan} />
      <TimelyFooter />
    </>
  );
};

export default Price;


// import React, { useEffect, useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   Check, Tag, MessageCircle, PhoneCall, Sparkles, Crown, Rocket,
//   ShieldCheck, Users, Briefcase as BriefcaseIcon,
//   FileText, Package, Receipt, X, ChevronRight, Gift, Loader2,
//   CheckCircle2, Layers, Bot, Puzzle, Wallet, UserCheck, Target,
//   Zap, Clock, Activity, DoorOpen, Plus, Minus, Star
// } from 'lucide-react';
// import TimelyFooter from './TimelyFooter';
// import TimelyNavbar from '../Components/TimelyNavbar';

// const API_BASE_URL = "https://api.timelyhealth.in";

// /* ══════════════════════════════════════════════
//    DUMMY ADD-ONS DATA
//    ══════════════════════════════════════════════ */
// const ADDONS_DATA = [
//   {
//     _id: 'addon_op_mgmt',
//     productName: 'OP Management',
//     price: 1000,
//     description: 'Complete outpatient management with patient registration, appointments & billing.',
//     features: [
//       'Patient Registration', 'Appointment Scheduling', 'Doctor Management',
//       'Billing & Invoices', 'Prescription Generation', 'Vitals Tracking',
//     ],
//   },
//   {
//     _id: 'addon_bmi',
//     productName: 'BMI',
//     price: 1000,
//     description: 'Body Mass Index tracking & health analytics for clinics and wellness centers.',
//     features: [
//       'BMI Calculator', 'Health Metrics Tracking', 'Patient Health Reports',
//       'Progress Charts', 'Diet Recommendations', 'Export Reports',
//     ],
//   },
//   {
//     _id: 'addon_cabin',
//     productName: 'Cabin Management',
//     price: 1000,
//     description: 'Manage clinic cabins, room allocation & doctor scheduling efficiently.',
//     features: [
//       'Cabin Allocation', 'Room Booking System', 'Doctor Schedule Mapping',
//       'Occupancy Tracking', 'Maintenance Alerts', 'Analytics Dashboard',
//     ],
//   },
// ];

// /* ══════════════════════════════════════════════
//    PRODUCT ICON MAPPER
//    ══════════════════════════════════════════════ */
// const getProductIcon = (name, size = "w-4 h-4") => {
//   const n = (name || "").toLowerCase();
//   if (n.includes("payroll") || n.includes("salary") || n.includes("payslip")) return <Wallet className={`${size} text-emerald-600`} />;
//   if (n.includes("emp") || n.includes("tracking") || n.includes("employee") || n.includes("attendance") || n.includes("hrms")) return <UserCheck className={`${size} text-emerald-600`} />;
//   if (n.includes("recruit") || n.includes("hiring") || n.includes("candidate")) return <Target className={`${size} text-slate-700`} />;
//   if (n.includes("short") || n.includes("gig") || n.includes("job")) return <Zap className={`${size} text-emerald-600`} />;
//   if (n.includes("op") || n.includes("patient") || n.includes("clinic")) return <Package className={`${size} text-emerald-600`} />;
//   if (n.includes("pharm") || n.includes("medic")) return <Package className={`${size} text-slate-700`} />;
//   if (n.includes("lab")) return <FileText className={`${size} text-emerald-600`} />;
//   if (n.includes("bmi") || n.includes("health")) return <Activity className={`${size} text-slate-700`} />;
//   if (n.includes("cabin") || n.includes("room")) return <DoorOpen className={`${size} text-emerald-600`} />;
//   return <BriefcaseIcon className={`${size} text-slate-700`} />;
// };

// /* ══════════════════════════════════════════════
//    GST POPUP
//    ══════════════════════════════════════════════ */
// const GSTPopup = ({ isOpen, onClose, onConfirm, planPrice }) => {
//   const gstAmount = Math.round(planPrice * 0.18);
//   const totalAmount = planPrice + gstAmount;
//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
//           <motion.div
//             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//             onClick={onClose}
//             className="absolute inset-0 bg-black/60 backdrop-blur-sm"
//           />
//           <motion.div
//             initial={{ scale: 0.9, y: 20, opacity: 0 }}
//             animate={{ scale: 1, y: 0, opacity: 1 }}
//             exit={{ scale: 0.9, y: 20, opacity: 0 }}
//             className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
//           >
//             <div className="p-6 md:p-8">
//               <div className="flex items-center justify-between mb-4">
//                 <div className="flex items-center gap-3">
//                   <div className="p-2 bg-emerald-100 rounded-xl">
//                     <Receipt className="w-5 h-5 text-emerald-700" />
//                   </div>
//                   <h3 className="text-xl font-bold text-gray-900">Tax Invoice</h3>
//                 </div>
//                 <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
//                   <X className="w-5 h-5 text-gray-500" />
//                 </button>
//               </div>
//               <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
//                 <div className="flex justify-between text-sm">
//                   <span className="text-gray-500">Plan Price</span>
//                   <span className="font-semibold text-gray-900">₹{planPrice.toLocaleString()}</span>
//                 </div>
//                 <div className="flex justify-between text-sm border-t border-gray-200 pt-2">
//                   <span className="text-gray-500">GST (18%)</span>
//                   <span className="font-semibold text-emerald-700">₹{gstAmount.toLocaleString()}</span>
//                 </div>
//                 <div className="flex justify-between text-sm border-t border-gray-200 pt-2">
//                   <span className="text-gray-700 font-bold">Total Amount</span>
//                   <span className="font-bold text-gray-900 text-lg">₹{totalAmount.toLocaleString()}</span>
//                 </div>
//               </div>
//               <div className="flex gap-3">
//                 <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-all">
//                   Cancel
//                 </button>
//                 <button onClick={onConfirm} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-slate-900 to-emerald-600 text-white font-semibold hover:shadow-lg transition-all hover:scale-[1.02]">
//                   Proceed to Pay ₹{totalAmount.toLocaleString()}
//                 </button>
//               </div>
//             </div>
//           </motion.div>
//         </div>
//       )}
//     </AnimatePresence>
//   );
// };

// /* ══════════════════════════════════════════════
//    BOOKING MODAL
//    ══════════════════════════════════════════════ */
// const BookingModal = ({ isOpen, onClose, selectedPlan }) => {
//   const [formData, setFormData] = useState({
//     fullName: '', workEmail: '', mobileNumber: '', companySize: '',
//     industryType: '', referralCode: '', address: '', organizationName: '', panNumber: ''
//   });
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isSuccess, setIsSuccess] = useState(false);
//   const [errorMessage, setErrorMessage] = useState('');
//   const [bookingData, setBookingData] = useState(null);
//   const [registeredEmail, setRegisteredEmail] = useState('');
//   const [showGSTPopup, setShowGSTPopup] = useState(false);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     setErrorMessage('');
//   };

//   useEffect(() => {
//     if (isOpen) {
//       setFormData({
//         fullName: '', workEmail: '', mobileNumber: '', companySize: '',
//         industryType: '', referralCode: '', address: '', organizationName: '', panNumber: ''
//       });
//       setIsSuccess(false);
//       setIsSubmitting(false);
//       setErrorMessage('');
//       setBookingData(null);
//       setRegisteredEmail('');
//       setShowGSTPopup(false);
//     }
//   }, [isOpen]);

//   const loadScript = (src) => {
//     return new Promise((resolve) => {
//       const script = document.createElement('script');
//       script.src = src;
//       script.onload = () => resolve(true);
//       script.onerror = () => resolve(false);
//       document.body.appendChild(script);
//     });
//   };

//   const validateForm = () => {
//     if (!formData.fullName || !formData.workEmail || !formData.mobileNumber || !formData.companySize || !formData.industryType) {
//       setErrorMessage('Please fill in all required fields');
//       return false;
//     }
//     return true;
//   };

//   const bookPlan = async (transactionId) => {
//     const accessibleProducts = (selectedPlan?.products || []).map((p) => ({ name: p.productName }));
//     const requestBody = {
//       fullName: formData.fullName,
//       workEmail: formData.workEmail,
//       mobileNumber: formData.mobileNumber,
//       companySize: formData.companySize,
//       industryType: formData.industryType,
//       planId: selectedPlan._id,
//       transactionId,
//       referralCode: formData.referralCode || '',
//       accessibleProducts,
//     };
//     const response = await fetch('https://api.ingrainsystems.com/api/clients/bookplan', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(requestBody),
//     });
//     const data = await response.json();
//     if (!response.ok || data.success === false) {
//       throw new Error(data.message || "Plan activation failed. Please contact support.");
//     }
//     setBookingData(data);
//     setRegisteredEmail(formData.workEmail);
//     return data;
//   };

//   const initiatePayment = async () => {
//     const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
//     if (!res) throw new Error('Razorpay SDK failed to load. Are you online?');
//     const RAZORPAY_KEY = 'rzp_test_BxtRNvflG06PTV';
//     const baseAmount = selectedPlan.price || 0;
//     const gstAmount = Math.round(baseAmount * 0.18);
//     const totalAmount = baseAmount + gstAmount;
//     return new Promise((resolve, reject) => {
//       const options = {
//         key: RAZORPAY_KEY,
//         amount: totalAmount * 100,
//         currency: "INR",
//         name: "TimelyHealth",
//         description: selectedPlan.planName || selectedPlan.productName || "Premium Plan",
//         handler: async function (response) { resolve(response.razorpay_payment_id); },
//         prefill: { name: formData.fullName, email: formData.workEmail, contact: formData.mobileNumber },
//         theme: { color: "#059669" },
//         modal: { ondismiss: function () { reject(new Error('Payment cancelled')); } }
//       };
//       const rzp = new window.Razorpay(options);
//       rzp.open();
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateForm()) return;
//     setShowGSTPopup(true);
//   };

//   const handleGSTConfirm = async () => {
//     setShowGSTPopup(false);
//     setIsSubmitting(true);
//     setErrorMessage('');
//     try {
//       const transactionId = await initiatePayment();
//       await bookPlan(transactionId);
//       setIsSuccess(true);
//       setIsSubmitting(false);
//     } catch (error) {
//       setErrorMessage(error.message || 'Something went wrong. Please try again.');
//       setIsSubmitting(false);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <>
//           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
//             <motion.div
//               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//               onClick={onClose}
//               className="absolute inset-0 bg-black/60 backdrop-blur-sm"
//             />
//             <motion.div
//               initial={{ opacity: 0, scale: 0.9, y: 20 }}
//               animate={{ opacity: 1, scale: 1, y: 0 }}
//               exit={{ opacity: 0, scale: 0.9, y: 20 }}
//               className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
//             >
//               <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10">
//                 <X className="w-5 h-5 text-gray-600" />
//               </button>

//               {isSuccess ? (
//                 <div className="p-12 text-center space-y-6 max-h-[80vh] overflow-y-auto">
//                   <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
//                     <CheckCircle2 className="w-10 h-10 text-emerald-600" />
//                   </div>
//                   <h3 className="text-3xl font-bold text-gray-900">Plan Activated! 🎉</h3>
//                   <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
//                     <p className="text-gray-700 text-sm">
//                       Welcome <span className="font-bold text-emerald-700">{formData.fullName}</span>!
//                       <span className="block text-xs text-gray-500 mt-1">Email: {registeredEmail}</span>
//                       <span className="block text-xs text-emerald-600 mt-1">✓ Your plan is now active!</span>
//                     </p>
//                   </div>
//                   {bookingData?.client && (
//                     <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
//                       <p className="text-xs text-gray-500">Client ID: <span className="font-mono font-semibold">{bookingData.client.clientId}</span></p>
//                       <p className="text-xs text-gray-500">Referral Code: <span className="font-mono font-semibold text-emerald-700">{bookingData.client.referralCode}</span></p>
//                     </div>
//                   )}
//                   <button onClick={onClose} className="bg-gradient-to-r from-slate-900 to-emerald-600 text-white px-8 py-3 rounded-full font-bold hover:shadow-lg transition-all">
//                     Start Exploring
//                   </button>
//                 </div>
//               ) : (
//                 <div className="p-8 md:p-12 max-h-[90vh] overflow-y-auto">
//                   <div className="flex items-center justify-between mb-6">
//                     <div>
//                       <h2 className="text-2xl font-bold text-gray-900">
//                         Activate {selectedPlan?.planName || selectedPlan?.productName || "Plan"}
//                       </h2>
//                       <p className="text-sm text-gray-500 mt-1">Fill in your details to get started</p>
//                     </div>
//                     <div className="bg-gradient-to-r from-slate-900 to-emerald-600 text-white px-4 py-2 rounded-full text-xs font-bold">
//                       ₹{selectedPlan?.price || 0}
//                     </div>
//                   </div>

//                   <div className="bg-gradient-to-r from-slate-50 to-emerald-50 rounded-xl p-4 mb-6 border border-emerald-200">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="text-sm text-gray-600">Plan / Add-on</p>
//                         <p className="font-bold text-gray-900">{selectedPlan?.planName || selectedPlan?.productName || "Plan"}</p>
//                         <p className="text-xs text-gray-500">
//                           {selectedPlan?.products?.length ? `${selectedPlan.products.length} products included` : 'Single add-on'}
//                         </p>
//                       </div>
//                       <div className="text-right">
//                         <p className="text-sm text-gray-600">Price</p>
//                         <p className="font-bold text-gray-900 text-xl">₹{selectedPlan?.price || 0}</p>
//                       </div>
//                     </div>
//                   </div>

//                   {errorMessage && (
//                     <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
//                       <p className="text-red-600 text-sm font-medium">{errorMessage}</p>
//                     </div>
//                   )}

//                   <form onSubmit={handleSubmit} className="space-y-4">
//                     <div>
//                       <label className="text-xs font-bold uppercase tracking-wider text-gray-600 ml-1">Full Name *</label>
//                       <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="John Doe"
//                         className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 transition-all text-gray-800 text-sm" />
//                     </div>
//                     <div>
//                       <label className="text-xs font-bold uppercase tracking-wider text-gray-600 ml-1">Work Email *</label>
//                       <input required type="email" name="workEmail" value={formData.workEmail} onChange={handleChange} placeholder="john@company.com"
//                         className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 transition-all text-gray-800 text-sm" />
//                     </div>
//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <label className="text-xs font-bold uppercase tracking-wider text-gray-600 ml-1">Mobile Number *</label>
//                         <input required type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} placeholder="+91 XXXXX XXXXX"
//                           className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 transition-all text-gray-800 text-sm" />
//                       </div>
//                       <div>
//                         <label className="text-xs font-bold uppercase tracking-wider text-gray-600 ml-1">Company Size *</label>
//                         <select required name="companySize" value={formData.companySize} onChange={handleChange}
//                           className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 transition-all text-gray-800 text-sm appearance-none cursor-pointer">
//                           <option value="" disabled>Select Size</option>
//                           <option value="1-10">1-10</option>
//                           <option value="11-50">11-50</option>
//                           <option value="51-200">51-200</option>
//                           <option value="201-500">201-500</option>
//                           <option value="500+">500+</option>
//                         </select>
//                       </div>
//                     </div>
//                     <div>
//                       <label className="text-xs font-bold uppercase tracking-wider text-gray-600 ml-1">Industry *</label>
//                       <input required type="text" name="industryType" value={formData.industryType} onChange={handleChange} placeholder="e.g. Technology, Finance, Retail"
//                         className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 transition-all text-gray-800 text-sm" />
//                     </div>
//                     <div>
//                       <label className="text-xs font-bold uppercase tracking-wider text-gray-600 ml-1">Address</label>
//                       <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Your business address"
//                         className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 transition-all text-gray-800 text-sm" />
//                     </div>
//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <label className="text-xs font-bold uppercase tracking-wider text-gray-600 ml-1">Organization Name</label>
//                         <input type="text" name="organizationName" value={formData.organizationName} onChange={handleChange} placeholder="Your organization"
//                           className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 transition-all text-gray-800 text-sm" />
//                       </div>
//                       <div>
//                         <label className="text-xs font-bold uppercase tracking-wider text-gray-600 ml-1">PAN Number</label>
//                         <input type="text" name="panNumber" value={formData.panNumber} onChange={handleChange} placeholder="PAN Number"
//                           className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 transition-all text-gray-800 text-sm" />
//                       </div>
//                     </div>
//                     <div>
//                       <label className="text-xs font-bold uppercase tracking-wider text-gray-600 ml-1 flex items-center gap-2">
//                         <Gift className="w-3.5 h-3.5 text-emerald-700" />
//                         Referral Code (Optional)
//                       </label>
//                       <input type="text" name="referralCode" value={formData.referralCode} onChange={handleChange} placeholder="Enter referral code"
//                         className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 transition-all text-gray-800 text-sm" />
//                     </div>
//                     <button type="submit" disabled={isSubmitting}
//                       className="w-full bg-gradient-to-r from-slate-900 to-emerald-600 text-white py-4 rounded-xl font-bold tracking-wide hover:shadow-lg transition-all transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-4 group">
//                       {isSubmitting ? (<><Loader2 className="w-5 h-5 animate-spin" />Processing...</>) : (<>Proceed to Payment - ₹{Math.round((selectedPlan?.price || 0) * 1.18)}<ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>)}
//                     </button>
//                     <div className="flex items-center justify-center gap-2 mt-2">
//                       <ShieldCheck className="w-4 h-4 text-gray-400" />
//                       <p className="text-xs text-gray-400">Your information is secure and encrypted</p>
//                     </div>
//                   </form>
//                 </div>
//               )}
//             </motion.div>
//           </div>

//           <GSTPopup isOpen={showGSTPopup} onClose={() => setShowGSTPopup(false)} onConfirm={handleGSTConfirm} planPrice={selectedPlan?.price || 0} />
//         </>
//       )}
//     </AnimatePresence>
//   );
// };

// /* ══════════════════════════════════════════════
//    MAIN PRICE PAGE — DESIGN 2
//    ══════════════════════════════════════════════ */
// const Price = () => {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedPlan, setSelectedPlan] = useState(null);
//   const [bundlePlan, setBundlePlan] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [activeTab, setActiveTab] = useState('allInOne');
//   const [selectedAddonIds, setSelectedAddonIds] = useState([]);

//   const tabs = [
//     { key: 'memberPlan', label: 'Member Plan', icon: <BriefcaseIcon className="w-3.5 h-3.5" /> },
//     { key: 'allInOne', label: 'All In One', icon: <Layers className="w-3.5 h-3.5" /> },
//     { key: 'aiAgent', label: 'AI Agent', icon: <Bot className="w-3.5 h-3.5" /> },
//     { key: 'addOns', label: 'Add-ons', icon: <Puzzle className="w-3.5 h-3.5" /> },
//   ];

//   useEffect(() => {
//     const fetchBundlePlan = async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const response = await fetch(`${API_BASE_URL}/api/timely-plans/getalltimelyplans`);
//         const result = await response.json();
//         if (result.success && Array.isArray(result.data) && result.data.length > 0) {
//           const activePlan = result.data.find(p => p.status === "active") || result.data[0];
//           setBundlePlan(activePlan);
//         } else {
//           setError("No plans available");
//           setBundlePlan(null);
//         }
//       } catch (err) {
//         console.error('Error fetching plans:', err);
//         setError("Failed to load plans. Please try again.");
//         setBundlePlan(null);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchBundlePlan();
//   }, []);

//   useEffect(() => { window.scrollTo(0, 0); }, []);

//   useEffect(() => {
//     if (activeTab !== 'addOns') setSelectedAddonIds([]);
//   }, [activeTab]);

//   if (loading) {
//     return (
//       <>
//         <TimelyNavbar />
//         <main className="bg-slate-50 min-h-screen flex items-center justify-center pt-[64px]">
//           <div className="flex flex-col items-center gap-4">
//             <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
//             <p className="text-gray-500">Loading plan...</p>
//           </div>
//         </main>
//         <TimelyFooter />
//       </>
//     );
//   }

//   if (error || !bundlePlan) {
//     return (
//       <>
//         <TimelyNavbar />
//         <main className="bg-slate-50 min-h-screen flex items-center justify-center pt-[64px]">
//           <div className="text-center">
//             <p className="text-red-600 mb-4">{error || "No plan found"}</p>
//             <button onClick={() => window.location.reload()} className="px-6 py-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700">
//               Retry
//             </button>
//           </div>
//         </main>
//         <TimelyFooter />
//       </>
//     );
//   }

//   const plan = bundlePlan;
//   const basePrice = plan.price || 0;
//   const discount = plan.discount || 0;
//   const discountedPrice = Math.round(basePrice - (basePrice * discount / 100));
//   const totalWithGST = discountedPrice + Math.round(discountedPrice * 0.18);
//   const description = plan.description || '';
//   const products = plan.products || [];

//   const validityLabel = plan.validityUnit === "years"
//     ? `${plan.validity} Year${plan.validity > 1 ? "s" : ""}`
//     : plan.validityUnit === "months"
//       ? `${plan.validity} Month${plan.validity > 1 ? "s" : ""}`
//       : `${plan.validity} Days`;

//   const validityDays = plan.validityUnit === "years"
//     ? plan.validity * 365
//     : plan.validityUnit === "months"
//       ? plan.validity * 30
//       : plan.validity;

//   const priceSuffix = plan.validityUnit === "years" ? "/year" : plan.validityUnit === "months" ? "/month" : "/plan";

//   const showProducts = activeTab === 'allInOne';
//   const showAddons = activeTab === 'addOns';
//   const showPricingCard = showProducts || showAddons;

//   const toggleAddon = (addonId) => {
//     setSelectedAddonIds(prev =>
//       prev.includes(addonId) ? prev.filter(id => id !== addonId) : [...prev, addonId]
//     );
//   };

//   const selectedAddons = ADDONS_DATA.filter(a => selectedAddonIds.includes(a._id));
//   const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
//   const addonsGST = Math.round(addonsTotal * 0.18);
//   const addonsTotalWithGST = addonsTotal + addonsGST;

//   const openBulkAddonBooking = () => {
//     if (selectedAddons.length === 0) return;
//     setSelectedPlan({
//       _id: selectedAddons.map(a => a._id).join(','),
//       planName: `${selectedAddons.length} Add-on${selectedAddons.length > 1 ? 's' : ''}`,
//       productName: selectedAddons.map(a => a.productName).join(', '),
//       price: addonsTotal,
//       products: selectedAddons.map(a => ({ productName: a.productName })),
//     });
//     setIsModalOpen(true);
//   };

//   return (
//     <>
//       <TimelyNavbar />
//       <main className="bg-slate-50 text-gray-900 font-sans pt-[52px] md:pt-[64px] overflow-x-hidden min-h-screen">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-32">

//           {/* ═══════════ HERO BANNER — DESIGN 2 ═══════════ */}
//           <motion.div
//             initial={{ opacity: 0, y: -8 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="relative rounded-2xl overflow-hidden mt-4 md:mt-5 mb-6 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white shadow-xl"
//           >
//             <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
//             <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl -ml-20 -mb-20"></div>

//             <div className="relative px-5 md:px-7 py-5">
//               <div className="flex flex-wrap items-center justify-between gap-4">
//                 <div className="flex-1 min-w-[260px]">
//                   <div className="flex items-center gap-2 mb-1.5">
//                     <span className="inline-flex items-center gap-1 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur">
//                       <Star className="w-3 h-3 fill-emerald-400 text-emerald-400" />
//                       LIMITED TIME OFFER
//                     </span>
//                   </div>
//                   <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mb-1">
//                     <span className="text-base md:text-lg font-medium text-white/95">{plan.planName} at just</span>
//                     {discount > 0 && (
//                       <span className="text-white/40 line-through text-xs md:text-sm">₹{basePrice.toLocaleString()}</span>
//                     )}
//                     <span className="text-2xl md:text-3xl font-extrabold text-emerald-300 leading-none">
//                       ₹{discountedPrice.toLocaleString()}
//                     </span>
//                     <span className="text-xs md:text-sm text-white/70">{priceSuffix}</span>
//                   </div>
//                   <div className="flex flex-wrap items-center gap-2 text-[10px] md:text-xs text-white/70">
//                     <span>{validityLabel}</span>
//                     <span className="text-white/30">•</span>
//                     <span>{validityDays} days</span>
//                     <span className="text-white/30">•</span>
//                     <span>Unlimited Users</span>
//                   </div>
//                 </div>

//                 <motion.button
//                   whileHover={{ scale: 1.03 }}
//                   whileTap={{ scale: 0.97 }}
//                   onClick={() => { setSelectedPlan({ ...plan, price: discountedPrice }); setIsModalOpen(true); }}
//                   className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold text-[11px] md:text-xs px-5 py-2.5 rounded-full shadow-lg transition-all group whitespace-nowrap"
//                 >
//                   Book Demo
//                   <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
//                 </motion.button>
//               </div>
//             </div>
//           </motion.div>

//           {/* ═══════════ TABS — UNDERLINE STYLE ═══════════ */}
//           <div className="mb-5 border-b border-gray-200 overflow-x-auto">
//             <div className="inline-flex items-center gap-1 min-w-full sm:min-w-0">
//               {tabs.map((tab) => (
//                 <button
//                   key={tab.key}
//                   onClick={() => setActiveTab(tab.key)}
//                   className={`relative flex items-center gap-1.5 px-4 md:px-5 py-3 text-xs md:text-sm font-semibold transition-all whitespace-nowrap ${
//                     activeTab === tab.key ? 'text-slate-900' : 'text-gray-500 hover:text-slate-900'
//                   }`}
//                 >
//                   {tab.icon}
//                   {tab.label}
//                   {activeTab === tab.key && (
//                     <motion.div
//                       layoutId="tab-underline"
//                       className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-slate-900 to-emerald-600 rounded-full"
//                       transition={{ type: "spring", stiffness: 400, damping: 30 }}
//                     />
//                   )}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* ═══════════ MAIN LAYOUT ═══════════ */}
//           <div className={`grid gap-6 items-start ${showPricingCard ? 'lg:grid-cols-3' : 'lg:grid-cols-1'}`}>

//             {/* LEFT */}
//             <div className={showPricingCard ? 'lg:col-span-2' : 'lg:col-span-1'}>

//               {/* ─── ALL IN ONE — ROW LIST STYLE ─── */}
//               {showProducts && (
//                 <div className="space-y-3">
//                   <div className="flex items-center justify-between mb-1">
//                     <h2 className="text-base md:text-lg font-bold text-slate-900">
//                       What's included in {plan.planName}
//                     </h2>
//                     <span className="text-[10px] md:text-xs text-gray-500 bg-white border border-gray-200 px-2.5 py-1 rounded-full">
//                       {products.length} products
//                     </span>
//                   </div>

//                   <div className="space-y-2">
//                     {products.map((product, pIdx) => (
//                       <motion.div
//                         key={pIdx}
//                         initial={{ opacity: 0, x: -8 }}
//                         animate={{ opacity: 1, x: 0 }}
//                         transition={{ delay: pIdx * 0.05 }}
//                         className="bg-white rounded-xl border border-gray-200 p-4 hover:border-emerald-300 hover:shadow-md transition-all group"
//                       >
//                         <div className="flex items-start gap-3">
//                           <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-100 to-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
//                             {getProductIcon(product.productName, "w-5 h-5")}
//                           </div>

//                           <div className="flex-1 min-w-0">
//                             <div className="flex items-start justify-between gap-2 mb-1">
//                               <h3 className="text-[14px] font-bold text-gray-900 leading-tight">
//                                 {product.productName}
//                               </h3>
//                               <span className="shrink-0 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
//                                 Included
//                               </span>
//                             </div>
//                             <p className="text-[10px] text-gray-500 mb-2.5">
//                               {product.features?.length || 0} features
//                             </p>
//                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
//                               {(product.features || []).map((feature, fIdx) => (
//                                 <div key={fIdx} className="flex items-start gap-1.5">
//                                   <Check className="w-3 h-3 text-emerald-600 mt-0.5 shrink-0" strokeWidth={3} />
//                                   <span className="text-[11px] text-gray-600 leading-tight">{feature}</span>
//                                 </div>
//                               ))}
//                             </div>
//                           </div>
//                         </div>
//                       </motion.div>
//                     ))}
//                   </div>

//                   {/* Integrations */}
//                   <div className="bg-white rounded-xl border border-dashed border-gray-300 p-4 mt-3">
//                     <h4 className="text-xs font-semibold text-gray-800 mb-2.5 flex items-center gap-1.5">
//                       <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
//                       Free integrations included
//                     </h4>
//                     <div className="flex flex-wrap gap-1.5">
//                       {["Google", "Razorpay", "WhatsApp API", "Tally", "Stripe", "Slack", "Zoom", "Zapier"].map((int, i) => (
//                         <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-gray-200 rounded-lg text-[10px] text-gray-700 font-medium">
//                           <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
//                           {int}
//                         </span>
//                       ))}
//                     </div>
//                     <p className="text-[9px] text-gray-400 mt-2">
//                       * All integrations are charged as custom integrations.
//                     </p>
//                   </div>
//                 </div>
//               )}

//               {/* ─── ADD-ONS — LIST ROW STYLE ─── */}
//               {showAddons && (
//                 <div className="space-y-3">
//                   <div className="flex items-center justify-between mb-1">
//                     <div>
//                       <h2 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
//                         <Puzzle className="w-4 h-4 text-emerald-600" />
//                         Premium Add-ons
//                       </h2>
//                       <p className="text-[11px] text-gray-500 mt-0.5">
//                         Each add-on at <strong className="text-slate-900">₹1,000</strong> · Mix & match any
//                       </p>
//                     </div>
//                     {selectedAddons.length > 0 && (
//                       <span className="text-[10px] md:text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-bold whitespace-nowrap">
//                         {selectedAddons.length} added
//                       </span>
//                     )}
//                   </div>

//                   <div className="space-y-2">
//                     {ADDONS_DATA.map((addon, idx) => {
//                       const isSelected = selectedAddonIds.includes(addon._id);
//                       return (
//                         <motion.div
//                           key={addon._id}
//                           initial={{ opacity: 0, x: -8 }}
//                           animate={{ opacity: 1, x: 0 }}
//                           transition={{ delay: idx * 0.05 }}
//                           className={`bg-white rounded-xl border p-4 transition-all ${
//                             isSelected
//                               ? 'border-emerald-500 ring-2 ring-emerald-500/15 shadow-md'
//                               : 'border-gray-200 hover:border-emerald-300 hover:shadow-md'
//                           }`}
//                         >
//                           <div className="flex flex-col sm:flex-row sm:items-start gap-3">
//                             <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-100 to-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
//                               {getProductIcon(addon.productName, "w-5 h-5")}
//                             </div>

//                             <div className="flex-1 min-w-0">
//                               <div className="flex items-start justify-between gap-2 mb-1">
//                                 <div className="min-w-0">
//                                   <h3 className="text-[14px] font-bold text-gray-900 leading-tight flex items-center gap-2 flex-wrap">
//                                     {addon.productName}
//                                     {isSelected && (
//                                       <span className="inline-flex items-center gap-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
//                                         <Check className="w-2.5 h-2.5" strokeWidth={3} />
//                                         ADDED
//                                       </span>
//                                     )}
//                                   </h3>
//                                   <p className="text-[10px] text-gray-500 mt-0.5">{addon.features.length} features</p>
//                                 </div>
//                                 <span className="shrink-0 inline-flex items-center bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
//                                   ₹{addon.price.toLocaleString()}
//                                 </span>
//                               </div>

//                               <p className="text-[11px] text-gray-500 leading-snug mb-2.5">{addon.description}</p>

//                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mb-3">
//                                 {addon.features.map((feature, fIdx) => (
//                                   <div key={fIdx} className="flex items-start gap-1.5">
//                                     <Check className="w-3 h-3 text-emerald-600 mt-0.5 shrink-0" strokeWidth={3} />
//                                     <span className="text-[11px] text-gray-600 leading-tight">{feature}</span>
//                                   </div>
//                                 ))}
//                               </div>

//                               <motion.button
//                                 whileHover={{ scale: 1.02 }}
//                                 whileTap={{ scale: 0.98 }}
//                                 onClick={() => toggleAddon(addon._id)}
//                                 className={`w-full sm:w-auto sm:min-w-[200px] py-2 px-4 rounded-lg font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 group border ${
//                                   isSelected
//                                     ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
//                                     : 'bg-slate-900 hover:bg-slate-800 text-white border-transparent'
//                                 }`}
//                               >
//                                 {isSelected ? (
//                                   <>
//                                     <Check className="w-3.5 h-3.5" strokeWidth={3} />
//                                     Added — Click to Remove
//                                   </>
//                                 ) : (
//                                   <>
//                                     <Plus className="w-3.5 h-3.5" />
//                                     Add for ₹{addon.price.toLocaleString()}
//                                   </>
//                                 )}
//                               </motion.button>
//                             </div>
//                           </div>
//                         </motion.div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               )}

//               {/* ─── COMING SOON ─── */}
//               {!showProducts && !showAddons && (
//                 <motion.div
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 md:p-16 text-center"
//                 >
//                   <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-slate-100 to-emerald-50 flex items-center justify-center border border-emerald-100">
//                     {tabs.find(t => t.key === activeTab)?.icon}
//                   </div>
//                   <h3 className="text-lg font-bold text-gray-900 mb-2">
//                     {tabs.find(t => t.key === activeTab)?.label}
//                   </h3>
//                   <p className="text-sm text-gray-500 mb-1">Coming soon</p>
//                   <p className="text-xs text-gray-400">This section will be available shortly. Stay tuned!</p>
//                 </motion.div>
//               )}
//             </div>

//             {/* ═══════════ RIGHT: DARK GRADIENT CARD ═══════════ */}
//             {showPricingCard && (
//               <div className="lg:col-span-1">
//                 <div className="lg:sticky lg:top-24">
//                   <motion.div
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-900 text-white"
//                   >
//                     <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl"></div>
//                     <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-400/10 rounded-full blur-3xl"></div>

//                     <div className="relative p-5 flex flex-col lg:min-h-[520px]">
//                       {showAddons ? (
//                         /* ═══ ADD-ONS DARK CART ═══ */
//                         <>
//                           <div>
//                             <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold px-2.5 py-1 rounded-full mb-3 backdrop-blur">
//                               <Puzzle className="w-3 h-3" />
//                               ADD-ONS CART
//                             </div>

//                             <p className="text-[10px] text-white/60 mb-1.5">
//                               {selectedAddons.length} of {ADDONS_DATA.length} selected
//                             </p>

//                             <div className="flex items-baseline gap-1.5 mb-1">
//                               <span className="text-3xl md:text-4xl font-extrabold text-white">
//                                 ₹{addonsTotal.toLocaleString()}
//                               </span>
//                               <span className="text-xs text-white/60 font-medium">/total</span>
//                             </div>
//                             <p className="text-[10px] text-white/50 mb-4">
//                               {selectedAddons.length > 0
//                                 ? `₹${addonsTotalWithGST.toLocaleString()} incl. 18% GST`
//                                 : 'Select add-ons to see total'}
//                             </p>

//                             {selectedAddons.length > 0 && (
//                               <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-3 mb-3 space-y-1.5 text-[11px]">
//                                 <div className="flex justify-between">
//                                   <span className="text-white/60">Subtotal</span>
//                                   <span className="font-semibold text-white">₹{addonsTotal.toLocaleString()}</span>
//                                 </div>
//                                 <div className="flex justify-between">
//                                   <span className="text-white/60">GST (18%)</span>
//                                   <span className="font-semibold text-emerald-300">₹{addonsGST.toLocaleString()}</span>
//                                 </div>
//                                 <div className="flex justify-between border-t border-white/10 pt-1.5">
//                                   <span className="font-bold text-white">Total</span>
//                                   <span className="font-extrabold text-emerald-300 text-sm">₹{addonsTotalWithGST.toLocaleString()}</span>
//                                 </div>
//                               </div>
//                             )}

//                             {selectedAddons.length > 0 ? (
//                               <div className="space-y-1.5 mb-4 max-h-[160px] overflow-y-auto pr-1">
//                                 {selectedAddons.map((a) => (
//                                   <div key={a._id} className="flex items-center justify-between text-[11px] py-1.5 px-2.5 bg-white/5 backdrop-blur border border-white/10 rounded-md">
//                                     <span className="text-white/90 truncate flex items-center gap-1.5 min-w-0">
//                                       <Check className="w-3 h-3 text-emerald-400 shrink-0" strokeWidth={3} />
//                                       <span className="truncate">{a.productName}</span>
//                                     </span>
//                                     <div className="flex items-center gap-2 shrink-0">
//                                       <span className="font-semibold text-white">₹{a.price.toLocaleString()}</span>
//                                       <button
//                                         onClick={() => toggleAddon(a._id)}
//                                         className="p-0.5 rounded-full hover:bg-red-500/20 text-white/50 hover:text-red-300 transition-colors"
//                                         title="Remove"
//                                       >
//                                         <X className="w-3 h-3" />
//                                       </button>
//                                     </div>
//                                   </div>
//                                 ))}
//                               </div>
//                             ) : (
//                               <div className="space-y-2 mb-4">
//                                 {[
//                                   'Each add-on @ ₹1,000',
//                                   'Mix & match any add-ons',
//                                   'Priority support included',
//                                 ].map((t, i) => (
//                                   <div key={i} className="flex items-start gap-2">
//                                     <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" strokeWidth={3} />
//                                     <span className="text-[11px] text-white/80">{t}</span>
//                                   </div>
//                                 ))}
//                               </div>
//                             )}

//                             <motion.button
//                               whileHover={{ scale: selectedAddons.length > 0 ? 1.02 : 1 }}
//                               whileTap={{ scale: selectedAddons.length > 0 ? 0.98 : 1 }}
//                               onClick={openBulkAddonBooking}
//                               disabled={selectedAddons.length === 0}
//                               className={`w-full py-3.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 group shadow-lg ${
//                                 selectedAddons.length > 0
//                                   ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-900'
//                                   : 'bg-white/10 text-white/30 cursor-not-allowed'
//                               }`}
//                             >
//                               {selectedAddons.length > 0
//                                 ? `Book Now — ₹${addonsTotalWithGST.toLocaleString()}`
//                                 : 'Select add-ons to continue'}
//                               <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
//                             </motion.button>
//                           </div>

//                           <div className="mt-auto pt-4 border-t border-white/10 mt-4">
//                             <p className="text-[10px] text-white/40 leading-relaxed">
//                               Add-ons are charged separately from your base plan. One-time purchase with lifetime access.
//                             </p>
//                           </div>
//                         </>
//                       ) : (
//                         /* ═══ DEFAULT PLAN CARD ═══ */
//                         <>
//                           <div>
//                             <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold px-2.5 py-1 rounded-full mb-3 backdrop-blur">
//                               <Crown className="w-3 h-3" />
//                               BEST VALUE PLAN
//                             </div>

//                             <p className="text-[10px] text-white/60 mb-1.5">
//                               {validityLabel} · {validityDays} days
//                             </p>

//                             <div className="flex items-baseline gap-1.5 mb-1">
//                               <span className="text-4xl font-extrabold text-white">
//                                 ₹{discountedPrice.toLocaleString()}
//                               </span>
//                               <span className="text-xs text-white/60 font-medium">{priceSuffix}</span>
//                             </div>
//                             <p className="text-[10px] text-white/50 mb-5">
//                               ₹{totalWithGST.toLocaleString()} incl. GST for the plan
//                             </p>

//                             <div className="space-y-2 mb-5">
//                               {[
//                                 <><strong>Unlimited users</strong> included</>,
//                                 `All ${products.length} products included`,
//                                 'Priority support',
//                               ].map((t, i) => (
//                                 <div key={i} className="flex items-start gap-2">
//                                   <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" strokeWidth={3} />
//                                   <span className="text-[11px] text-white/80">{t}</span>
//                                 </div>
//                               ))}
//                             </div>

//                             <motion.button
//                               whileHover={{ scale: 1.02 }}
//                               whileTap={{ scale: 0.98 }}
//                               onClick={() => { setSelectedPlan({ ...plan, price: discountedPrice }); setIsModalOpen(true); }}
//                               className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 group"
//                             >
//                               Book Demo
//                               <Sparkles className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
//                             </motion.button>
//                           </div>

//                           <div className="mt-auto pt-4 border-t border-white/10 space-y-2 text-[10px] mt-4">
//                             <div className="flex items-start gap-2">
//                               <Users className="w-3.5 h-3.5 text-white/40 mt-0.5 shrink-0" />
//                               <div className="flex-1">
//                                 <span className="text-white/60">Extra member</span>
//                                 <span className="float-right font-semibold text-white">₹500/user/month</span>
//                               </div>
//                             </div>
//                             <p className="text-white/40 leading-relaxed">
//                               Outgoing limits are at account level, irrespective of team size.
//                             </p>
//                           </div>
//                         </>
//                       )}
//                     </div>
//                   </motion.div>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* ═══════════ BOTTOM CTA BANNER ═══════════ */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             className="mt-10 relative rounded-2xl p-6 md:p-8 flex flex-wrap items-center justify-between gap-4 shadow-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 overflow-hidden"
//           >
//             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
//             <div className="relative text-white">
//               <h3 className="text-lg md:text-2xl font-bold mb-1">Ready to get started?</h3>
//               <p className="text-xs md:text-sm text-white/80">Start your free trial in 2 minutes!</p>
//             </div>
//             <motion.button
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               onClick={() => { setSelectedPlan({ ...plan, price: discountedPrice }); setIsModalOpen(true); }}
//               className="relative px-6 md:px-8 py-3 rounded-full bg-slate-900 text-white font-bold text-sm md:text-base shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group"
//             >
//               Start Free Trial
//               <Rocket className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
//             </motion.button>
//           </motion.div>

//           {/* FOOTER NOTES */}
//           <div className="mt-8 pt-6 border-t border-gray-200 space-y-2 text-[11px] md:text-xs text-gray-500">
//             {[
//               "For all add-ons with 'per user' pricing, base plan extra user charges will also be applicable.",
//               "All add-ons have to be purchased for the full team & for the full duration of your current plan.",
//               "We do not have a refund policy. Please make use of your free trial facility before making a purchase.",
//             ].map((t, i) => (
//               <p key={i} className="flex items-start gap-1.5">
//                 <span className="text-emerald-600 mt-0.5">•</span>{t}
//               </p>
//             ))}
//             <p className="flex items-start gap-1.5">
//               <span className="text-emerald-600 mt-0.5">•</span>
//               <span><strong className="text-gray-700">Multiple numbers policy:</strong> To buy more than 1 number, all numbers (including your 1st) must be recharged with Annual plans. This facility is available only to Private Limited/LLP/GST-registered entities. No offers apply on additional numbers.</span>
//             </p>
//             <p className="flex items-start gap-1.5">
//               <span className="text-emerald-600 mt-0.5">•</span>
//               <strong className="text-gray-700">+18% GST</strong> applicable on all prices.
//             </p>
//           </div>
//         </div>
//       </main>

//       {/* ═══════════ FLOATING CART BAR (MOBILE + DESKTOP) ═══════════ */}
//       <AnimatePresence>
//         {showAddons && selectedAddons.length > 0 && (
//           <motion.div
//             initial={{ y: 100, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             exit={{ y: 100, opacity: 0 }}
//             transition={{ type: "spring", stiffness: 300, damping: 30 }}
//             className="fixed bottom-4 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:max-w-lg z-[90]"
//           >
//             <div className="bg-slate-900 text-white rounded-2xl shadow-2xl p-3 flex items-center gap-3 border border-emerald-500/30">
//               <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
//                 <Puzzle className="w-5 h-5 text-emerald-400" />
//               </div>
//               <div className="flex-1 min-w-0">
//                 <p className="text-[11px] text-white/60">
//                   {selectedAddons.length} add-on{selectedAddons.length > 1 ? 's' : ''} selected
//                 </p>
//                 <p className="text-sm font-bold text-white">
//                   ₹{addonsTotalWithGST.toLocaleString()} <span className="text-[10px] text-white/50 font-normal">incl. GST</span>
//                 </p>
//               </div>
//               <button
//                 onClick={openBulkAddonBooking}
//                 className="shrink-0 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 group"
//               >
//                 Book Now
//                 <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
//               </button>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <BookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} selectedPlan={selectedPlan} />
//       <TimelyFooter />
//     </>
//   );
// };

// export default Price;