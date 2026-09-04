import axios from "axios";
import { useEffect, useState } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import {
  FiBriefcase,
  FiCheckCircle,
  FiX,
  FiClock,
  FiAward,
  FiLink,
  FiInfo,
  FiUsers,
  FiEye,
  FiStar,
  FiFlag,
  FiAlertCircle,
  FiRefreshCw,
  FiSearch,
  FiUserPlus,
  FiSend,
  FiUser
} from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = "https://ingrainhirebackend.ingrainsystems.com/api";

function EmployeeReferral() {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [viewingReferral, setViewingReferral] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // State for Refer to Someone modal
  const [isReferModalOpen, setIsReferModalOpen] = useState(false);
  const [referringJob, setReferringJob] = useState(null);
  const [referFormData, setReferFormData] = useState({
    firstName: "",
    lastName: "",
    candidateEmail: "",
    candidatePhone: "",
    candidateExperience: "",
    candidateSkills: "",
    message: "",
    relation: "friend"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referSuccess, setReferSuccess] = useState(false);

  // Get employee data from localStorage
  const employeeDataRaw = localStorage.getItem("employeeData");
  let employeeId = null;
  let employeeName = "N/A";
  let employeeEmail = "N/A";
  
  if (employeeDataRaw) {
    try {
      const employeeData = JSON.parse(employeeDataRaw);
      employeeId = employeeData.employeeId;
      employeeName = employeeData.name || employeeData.employeeName || "N/A";
      employeeEmail = employeeData.email || employeeData.employeeEmail || "N/A";
    } catch (err) {
      console.error("Invalid employee data in localStorage.");
    }
  }

  // Fetch referrals
  const fetchReferrals = async () => {
    if (!employeeId) {
      setError("Employee not logged in. Please login first.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await axios.get(
        `${API_BASE}/jobs/myreffraljobs/${employeeId}`
      );

      console.log("Referrals response:", response.data);

      if (response.data && response.data.success) {
        setReferrals(response.data.data || []);
        if (response.data.data?.length === 0) {
          setError("No referrals assigned to you yet.");
        }
      } else {
        setError(response.data?.message || "Failed to fetch referrals");
      }
    } catch (err) {
      console.error("Error fetching referrals:", err);
      setError("Failed to fetch referrals. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, [employeeId]);

  // Open Refer to Someone modal
  const openReferModal = (referral) => {
    setReferringJob(referral);
    setReferFormData({
      firstName: "",
      lastName: "",
      candidateEmail: "",
      candidatePhone: "",
      candidateExperience: "",
      candidateSkills: "",
      message: `Hi,\n\nI came across this great opportunity for ${referral.jobTitle} and thought you might be interested.\n\nCheck it out here: ${referral.jobLink}\n\nLet me know if you have any questions!\n\nBest regards,\n${employeeName}`,
      relation: "friend"
    });
    setReferSuccess(false);
    setIsReferModalOpen(true);
  };

  const closeReferModal = () => {
    setIsReferModalOpen(false);
    setReferringJob(null);
    setReferFormData({
      firstName: "",
      lastName: "",
      candidateEmail: "",
      candidatePhone: "",
      candidateExperience: "",
      candidateSkills: "",
      message: "",
      relation: "friend"
    });
    setReferSuccess(false);
  };

  const handleReferFormChange = (e) => {
    const { name, value } = e.target;
    setReferFormData(prev => ({ ...prev, [name]: value }));
  };

  // Submit referral
  const handleSubmitReferral = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!referFormData.firstName.trim()) {
      toast.warning("Please enter candidate's first name");
      return;
    }
    if (!referFormData.lastName.trim()) {
      toast.warning("Please enter candidate's last name");
      return;
    }
    if (!referFormData.candidateEmail.trim()) {
      toast.warning("Please enter candidate email");
      return;
    }
    if (!referFormData.candidateEmail.includes('@')) {
      toast.warning("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    try {
      const fullName = `${referFormData.firstName} ${referFormData.lastName}`.trim();
      
      const payload = {
        jobId: referringJob.jobId || referringJob._id,
        jobTitle: referringJob.jobTitle,
        jobLink: referringJob.jobLink,
        referralId: referringJob._id,
        employeeId: employeeId,
        employeeName: employeeName,
        employeeEmail: employeeEmail,
        candidate: {
          firstName: referFormData.firstName,
          lastName: referFormData.lastName,
          name: fullName,
          email: referFormData.candidateEmail,
          phone: referFormData.candidatePhone,
          experience: referFormData.candidateExperience,
          skills: referFormData.candidateSkills
        },
        message: referFormData.message,
        relation: referFormData.relation
      };

      const response = await axios.post(
        `${API_BASE}/jobs/refercandidate`,
        payload
      );

      if (response.data && response.data.success) {
        setReferSuccess(true);
        toast.success(`Referral sent to ${fullName}!`);
        const updatedReferrals = referrals.map(r => {
          if (r._id === referringJob._id) {
            return {
              ...r,
              totalReferralsMade: (r.totalReferralsMade || 0) + 1,
              pendingReferrals: (r.pendingReferrals || 0) + 1
            };
          }
          return r;
        });
        setReferrals(updatedReferrals);
        setTimeout(() => {
          closeReferModal();
        }, 2000);
      } else {
        toast.error(response.data?.message || "Failed to send referral");
      }
    } catch (err) {
      console.error("Error sending referral:", err);
      toast.error(err.response?.data?.message || "Failed to send referral. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
      active: "bg-emerald-50 text-emerald-700 border-emerald-200",
      expired: "bg-red-50 text-red-700 border-red-200",
      completed: "bg-blue-50 text-blue-700 border-blue-200",
      cancelled: "bg-gray-50 text-gray-700 border-gray-200"
    };
    return colors[status] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <FiClock className="text-yellow-500" size={12} />,
      active: <FiCheckCircle className="text-emerald-500" size={12} />,
      expired: <FiX className="text-red-500" size={12} />,
      completed: <FiStar className="text-blue-500" size={12} />,
      cancelled: <FiX className="text-gray-500" size={12} />
    };
    return icons[status] || <FiInfo className="text-gray-500" size={12} />;
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: "Pending",
      active: "Active",
      expired: "Expired",
      completed: "Completed",
      cancelled: "Cancelled"
    };
    return labels[status] || status || "N/A";
  };

  const filteredReferrals = referrals.filter(referral => {
    if (!searchQuery && !selectedStatus) return true;
    
    const search = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      referral.jobTitle?.toLowerCase().includes(search) ||
      referral.employeeName?.toLowerCase().includes(search) ||
      referral.employeeEmail?.toLowerCase().includes(search);
    
    const matchesStatus = !selectedStatus || referral.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStats = () => {
    const total = referrals.length;
    const active = referrals.filter(r => r.status === 'active').length;
    const pending = referrals.filter(r => r.status === 'pending').length;
    const completed = referrals.filter(r => r.status === 'completed').length;
    const expired = referrals.filter(r => r.status === 'expired').length;
    return { total, active, pending, completed, expired };
  };

  const stats = getStats();

  const openViewModal = (referral) => {
    setViewingReferral(referral);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setViewingReferral(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // ✅ Function to handle link click - opens in new tab
  const handleLinkClick = (url, e) => {
    e.stopPropagation(); // Prevent card click
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500 font-medium">Loading your referrals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-6">
      <ToastContainer />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            My <span className="text-indigo-600">Referrals</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            View jobs assigned to you for referral
          </p>
        </div>
        <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
          <FaCalendarAlt className="text-gray-400" />
          <span className="text-xs font-medium text-gray-600">
            {new Date().toLocaleDateString("en-US", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <FiBriefcase className="text-blue-600 text-sm" />
            </div>
            <div>
              <p className="text-[10px] text-gray-500">Total</p>
              <p className="text-lg font-bold text-gray-800">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3 border border-emerald-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-100 rounded-lg">
              <FiCheckCircle className="text-emerald-600 text-sm" />
            </div>
            <div>
              <p className="text-[10px] text-gray-500">Active</p>
              <p className="text-lg font-bold text-gray-800">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-3 border border-yellow-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-yellow-100 rounded-lg">
              <FiClock className="text-yellow-600 text-sm" />
            </div>
            <div>
              <p className="text-[10px] text-gray-500">Pending</p>
              <p className="text-lg font-bold text-gray-800">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-3 border border-blue-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <FiStar className="text-blue-600 text-sm" />
            </div>
            <div>
              <p className="text-[10px] text-gray-500">Completed</p>
              <p className="text-lg font-bold text-gray-800">{stats.completed}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-3 border border-red-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-red-100 rounded-lg">
              <FiFlag className="text-red-600 text-sm" />
            </div>
            <div>
              <p className="text-[10px] text-gray-500">Expired</p>
              <p className="text-lg font-bold text-gray-800">{stats.expired}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 mb-4">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[160px]">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
            <input
              type="text"
              placeholder="Search by job title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-xs"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 border border-gray-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            onClick={() => {
              setRefreshing(true);
              fetchReferrals().finally(() => setRefreshing(false));
              toast.info("Refreshing referrals...");
            }}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 text-[10px] font-bold transition-colors"
          >
            <FiRefreshCw className={refreshing ? "animate-spin" : ""} size={12} />
            Refresh
          </button>
          {(searchQuery || selectedStatus) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedStatus("");
              }}
              className="px-2.5 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Referrals List */}
      {error && !loading ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <div className="flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mb-2">
              <FiAlertCircle className="text-amber-500 text-xl" />
            </div>
            <p className="text-sm font-medium text-gray-700">{error}</p>
            {error.includes("No referrals") && (
              <p className="text-xs text-gray-400 mt-1">
                Check back later when new opportunities are assigned.
              </p>
            )}
          </div>
        </div>
      ) : filteredReferrals.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <div className="flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mb-2">
              <FiSearch className="text-gray-300 text-xl" />
            </div>
            <p className="text-sm font-medium text-gray-700">No matching referrals</p>
            <p className="text-xs text-gray-400 mt-1">
              {searchQuery || selectedStatus ? "Try adjusting your filters" : "No referrals assigned yet"}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredReferrals.map((referral) => (
            <div
              key={referral._id}
              className="bg-white border border-gray-200 rounded-xl p-3 hover:shadow-md transition-shadow duration-300"
            >
              {/* Status Badge */}
              <div className="flex items-start justify-between mb-2">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium border ${getStatusBadgeColor(referral.status)}`}>
                  {getStatusIcon(referral.status)} {getStatusLabel(referral.status)}
                </span>
                {referral.bonusAmount > 0 && (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                    ₹{referral.bonusAmount}
                  </span>
                )}
              </div>

              {/* Job Title */}
              <h3 className="text-sm font-semibold text-gray-800 mb-1 truncate">
                {referral.jobTitle}
              </h3>

              {/* ✅ Job Link - Clickable */}
              <div 
                className="flex items-center gap-1 text-[10px] text-blue-600 truncate mb-2 cursor-pointer hover:underline group"
                onClick={(e) => handleLinkClick(referral.jobLink, e)}
              >
                <FiLink className="text-[10px] flex-shrink-0 group-hover:text-blue-800" />
                <span className="truncate group-hover:text-blue-800">
                  {referral.jobLink || 'No link'}
                </span>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-1.5 mb-2">
                <div className="bg-gray-50 rounded-lg p-1.5">
                  <p className="text-[8px] text-gray-400 uppercase tracking-wider">Expires</p>
                  <p className="text-[10px] font-medium text-gray-700">
                    {formatDate(referral.expiryDate)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-1.5">
                  <p className="text-[8px] text-gray-400 uppercase tracking-wider">Max</p>
                  <p className="text-[10px] font-medium text-gray-700">
                    {referral.maxReferralsPerEmployee || 5}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-3 text-[10px] text-gray-500 border-t border-gray-100 pt-2">
                <div className="flex items-center gap-0.5">
                  <FiUsers className="text-gray-400" size={11} />
                  <span>{referral.totalReferralsMade || 0}</span>
                </div>
                <div className="flex items-center gap-0.5">
                  <FiCheckCircle className="text-emerald-500" size={11} />
                  <span>{referral.successfulReferrals || 0}</span>
                </div>
                <div className="flex items-center gap-0.5">
                  <FiClock className="text-yellow-500" size={11} />
                  <span>{(referral.totalReferralsMade || 0) - (referral.successfulReferrals || 0)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-1.5 mt-2">
                <button
                  onClick={() => openViewModal(referral)}
                  className="flex-1 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <FiEye size={12} />
                  View
                </button>
                <button
                  onClick={() => openReferModal(referral)}
                  className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <FiUserPlus size={12} />
                  Refer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Referral Modal - Transparent Background */}
      {isViewModalOpen && viewingReferral && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-100">
            <div className="px-6 py-5 bg-gradient-to-r from-indigo-50 via-white to-violet-50 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
                  <FiBriefcase size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Referral Details</h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">
                    #{viewingReferral._id?.slice(-6) || 'N/A'}
                  </p>
                </div>
              </div>
              <button
                onClick={closeViewModal}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"
              >
                <FiX size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Job Info */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Job</p>
                <p className="font-semibold text-gray-800 text-lg mt-1">{viewingReferral.jobTitle}</p>
                {/* ✅ Clickable link in view modal */}
                <div 
                  className="mt-1 flex items-center gap-1 text-xs text-blue-600 truncate cursor-pointer hover:underline group"
                  onClick={(e) => handleLinkClick(viewingReferral.jobLink, e)}
                >
                  <FiLink className="text-xs flex-shrink-0 group-hover:text-blue-800" />
                  <span className="truncate group-hover:text-blue-800">{viewingReferral.jobLink}</span>
                </div>
              </div>

              {/* Status & Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</p>
                  <span className={`mt-1 inline-block px-2.5 py-1 rounded-full text-[11px] font-medium border ${getStatusBadgeColor(viewingReferral.status)}`}>
                    {getStatusIcon(viewingReferral.status)} {getStatusLabel(viewingReferral.status)}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Max Referrals</p>
                  <p className="text-lg font-bold text-gray-800 mt-1">{viewingReferral.maxReferralsPerEmployee || 5}</p>
                </div>
              </div>

              {/* Expiry & Assigned Date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Expiry Date</p>
                  <p className="text-sm font-medium text-gray-700 mt-1">
                    {formatDate(viewingReferral.expiryDate)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Assigned Date</p>
                  <p className="text-sm font-medium text-gray-700 mt-1">
                    {formatDate(viewingReferral.assignedAt)}
                  </p>
                </div>
              </div>

              {/* Bonus */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Bonus</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-lg font-bold text-emerald-600">₹{viewingReferral.bonusAmount || 0}</span>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full ${viewingReferral.isBonusPaid ? 'bg-emerald-50 text-emerald-600' : 'bg-yellow-50 text-yellow-600'}`}>
                    {viewingReferral.isBonusPaid ? 'Paid' : 'Pending'}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
                  <p className="text-[10px] text-gray-400">Total</p>
                  <p className="text-lg font-bold text-gray-800">{viewingReferral.totalReferralsMade || 0}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
                  <p className="text-[10px] text-gray-400">Successful</p>
                  <p className="text-lg font-bold text-emerald-600">{viewingReferral.successfulReferrals || 0}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
                  <p className="text-[10px] text-gray-400">Pending</p>
                  <p className="text-lg font-bold text-yellow-600">
                    {(viewingReferral.totalReferralsMade || 0) - (viewingReferral.successfulReferrals || 0)}
                  </p>
                </div>
              </div>

              {/* Message */}
              {viewingReferral.message && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Message</p>
                  <div className="text-sm text-gray-600 mt-1 whitespace-pre-wrap break-words">
                    {viewingReferral.message}
                  </div>
                </div>
              )}

              {/* Refer Button */}
              <button
                onClick={() => {
                  closeViewModal();
                  openReferModal(viewingReferral);
                }}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <FiUserPlus size={16} />
                Refer Someone to this Job
              </button>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end">
              <button
                onClick={closeViewModal}
                className="py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/20"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refer to Someone Modal - Transparent Background */}
      {isReferModalOpen && referringJob && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-100">
            <div className="px-6 py-5 bg-gradient-to-r from-emerald-50 via-white to-green-50 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                  <FiUserPlus size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Refer Someone</h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                    {referringJob.jobTitle}
                  </p>
                </div>
              </div>
              <button
                onClick={closeReferModal}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"
              >
                <FiX size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {referSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiCheckCircle className="text-3xl text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Referral Sent!</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Successfully referred {referFormData.firstName} {referFormData.lastName} for {referringJob.jobTitle}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReferral} className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Job You're Referring</p>
                    <p className="font-semibold text-gray-800">{referringJob.jobTitle}</p>
                    {/* ✅ Clickable link in referral modal */}
                    <div 
                      className="mt-1 flex items-center gap-1 text-xs text-blue-600 truncate cursor-pointer hover:underline group"
                      onClick={(e) => handleLinkClick(referringJob.jobLink, e)}
                    >
                      <FiLink className="text-xs flex-shrink-0 group-hover:text-blue-800" />
                      <span className="truncate group-hover:text-blue-800">{referringJob.jobLink}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                        <input
                          type="text"
                          name="firstName"
                          value={referFormData.firstName}
                          onChange={handleReferFormChange}
                          placeholder="First name"
                          className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-xl focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 transition-all outline-none text-xs"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                        <input
                          type="text"
                          name="lastName"
                          value={referFormData.lastName}
                          onChange={handleReferFormChange}
                          placeholder="Last name"
                          className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-xl focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 transition-all outline-none text-xs"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="candidateEmail"
                      value={referFormData.candidateEmail}
                      onChange={handleReferFormChange}
                      placeholder="Enter email"
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 transition-all outline-none text-xs"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="candidatePhone"
                        value={referFormData.candidatePhone}
                        onChange={handleReferFormChange}
                        placeholder="Phone"
                        className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 transition-all outline-none text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider">
                        Experience
                      </label>
                      <select
                        name="candidateExperience"
                        value={referFormData.candidateExperience}
                        onChange={handleReferFormChange}
                        className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 transition-all outline-none text-xs"
                      >
                        <option value="">Select</option>
                        <option value="Fresher">Fresher</option>
                        <option value="0-1">0-1 Years</option>
                        <option value="1-2">1-2 Years</option>
                        <option value="2-3">2-3 Years</option>
                        <option value="3-4">3-4 Years</option>
                        <option value="5+">5+ Years</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider">
                      Skills
                    </label>
                    <input
                      type="text"
                      name="candidateSkills"
                      value={referFormData.candidateSkills}
                      onChange={handleReferFormChange}
                      placeholder="e.g. React, Node.js"
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 transition-all outline-none text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider">
                      Relationship
                    </label>
                    <select
                      name="relation"
                      value={referFormData.relation}
                      onChange={handleReferFormChange}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 transition-all outline-none text-xs"
                    >
                      <option value="friend">Friend</option>
                      <option value="colleague">Colleague</option>
                      <option value="family">Family</option>
                      <option value="acquaintance">Acquaintance</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider">
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={referFormData.message}
                      onChange={handleReferFormChange}
                      rows="3"
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 transition-all outline-none text-xs resize-none"
                      placeholder="Personal message..."
                    />
                  </div>

                  <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                    <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1">
                      <FiInfo className="text-sm" />
                      Summary
                    </p>
                    <div className="grid grid-cols-2 gap-1 mt-1 text-[10px] text-gray-600">
                      <div>
                        <span className="text-gray-400">Job:</span>
                        <span className="font-medium ml-1">{referringJob.jobTitle}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">By:</span>
                        <span className="font-medium ml-1">{employeeName}</span>
                      </div>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5">
                      <span className="text-gray-400">Candidate:</span>
                      <span className="font-medium ml-1">
                        {referFormData.firstName || "—"} {referFormData.lastName || "—"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={closeReferModal}
                      className="flex-1 py-2 px-4 rounded-xl border border-gray-200 text-[10px] font-bold uppercase tracking-wider text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-[1.5] py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <FiSend size={12} />
                          Send
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeReferral;