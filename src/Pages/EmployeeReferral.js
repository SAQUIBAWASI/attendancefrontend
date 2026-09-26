import axios from "axios";
import { useEffect, useState } from "react";
import { FaCalendarAlt, FaSearch, FaSync, FaChevronDown, FaChevronUp, FaUser, FaSpinner } from "react-icons/fa";
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
  FiFilter,
  FiTrash2,
  FiInbox,
  FiUser
} from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./EmployeeDashboard.css";
import "./EmployeeLeaves.css";
import "../index.css";

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
  const [showMobileFilters, setShowMobileFilters] = useState(false);

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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-3 border-3 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-gray-600">Loading your referrals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="emp-dash">
      <ToastContainer />
      <main className="p-2 sm:p-4 lg:p-6">

        {/* ── Desktop Header ── */}
        <div className="hidden sm:flex items-center justify-between gap-4 flex-wrap mb-4">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap">
              My <span>Referrals</span>
            </h1>
          </div>

          {/* Right side: Compact Filters (Desktop only) */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Quick Search - Compact */}
            <div className="relative">
              <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]" />
              <input
                type="text"
                placeholder="Search job title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[150px] pl-7 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              />
            </div>

            {/* Status Filter Dropdown */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-8 px-2.5 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-medium text-gray-700"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Clear Filters Button */}
            {(searchQuery || selectedStatus) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedStatus("");
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm whitespace-nowrap"
              >
                <FiTrash2 className="w-3 h-3" />
                Clear
              </button>
            )}

            {/* Refresh Button */}
            <button
              onClick={() => {
                setRefreshing(true);
                fetchReferrals().finally(() => setRefreshing(false));
              }}
              disabled={refreshing}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-all shadow-sm whitespace-nowrap"
            >
              <FaSync className={refreshing ? "animate-spin" : ""} size={10} />
              {refreshing ? "Loading..." : "Refresh"}
            </button>

            {/* Employee info pill */}
            {employeeName && employeeName !== "N/A" && (
              <div className="emp-dash__date-pill">
                <FaUser className="text-blue-600 text-[10px]" />
                <span>{employeeName}</span>
                {employeeId && <span className="text-gray-400 text-[10px] font-medium">· {employeeId}</span>}
              </div>
            )}
          </div>
        </div>

        {/* ── Mobile Header - Title + Filters Toggle ── */}
        <div className="sm:hidden flex items-center justify-between gap-2 flex-wrap mb-3">
          <h1 className="text-base font-bold whitespace-nowrap">
            My <span className="text-indigo-600">Referrals</span>
          </h1>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-gray-500">
              <strong>{filteredReferrals.length}</strong> referrals
            </span>
          </div>
        </div>

        {/* Mobile Filters Toggle */}
        <div className="sm:hidden mb-3">
          <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-gray-200">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-700"
            >
              <FiFilter className="text-blue-600 text-base" />
              <span>Filters &amp; Actions</span>
              {showMobileFilters ? (
                <FaChevronUp className="text-gray-400" />
              ) : (
                <FaChevronDown className="text-gray-400" />
              )}
            </button>
          </div>

          {showMobileFilters && (
            <div className="mt-2 p-4 bg-white rounded-xl border border-gray-200 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Search Job Title</label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text"
                    placeholder="Search by job title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="pt-3 border-t border-gray-200 space-y-2">
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedStatus("");
                  }}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
                >
                  <FiTrash2 className="w-4 h-4" />
                  Clear Filters
                </button>
                <button
                  onClick={() => {
                    setRefreshing(true);
                    fetchReferrals().finally(() => setRefreshing(false));
                  }}
                  disabled={refreshing}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-all shadow-sm"
                >
                  <FaSync className={refreshing ? "animate-spin" : ""} size={14} />
                  {refreshing ? "Loading..." : "Refresh Data"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── KPI Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Referrals</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FiBriefcase className="text-blue-500" />
              </div>
            </div>
            <div className="emp-dash__stat-value">{stats.total}</div>
            <div className="emp-dash__stat-meta">assigned jobs 💼</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Active Jobs</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <FiCheckCircle className="text-green-500" />
              </div>
            </div>
            <div className="emp-dash__stat-value">{stats.active}</div>
            <div className="emp-dash__stat-meta">open for referral ✅</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Pending</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                <FiClock className="text-amber-500" />
              </div>
            </div>
            <div className="emp-dash__stat-value">{stats.pending}</div>
            <div className="emp-dash__stat-meta">awaiting response ⏳</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Completed</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <FiStar className="text-blue-500" />
              </div>
            </div>
            <div className="emp-dash__stat-value">{stats.completed}</div>
            <div className="emp-dash__stat-meta">successful hires 🌟</div>
          </div>
        </div>

        {/* ── Card Container ── */}
        <div className="emp-dash__card mb-6">
          <div className="emp-dash__card-header flex items-center justify-between">
            <div>
              <h3 className="emp-dash__card-title flex items-center gap-2">
                <FiBriefcase className="text-blue-600" />
                My Referral Jobs
              </h3>
              <p className="emp-dash__card-desc">
                View and refer candidates for jobs assigned to you
              </p>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              {filteredReferrals.length} Jobs
            </span>
          </div>

          <div className="emp-dash__card-body">
            {error && !loading ? (
              <div className="py-12 text-center">
                <div className="flex flex-col items-center gap-2">
                  <FiAlertCircle className="text-4xl text-amber-500 mb-1" />
                  <p className="text-base font-semibold text-gray-700">{error}</p>
                  {error.includes("No referrals") && (
                    <p className="text-xs text-gray-400 max-w-sm">
                      Check back later when new referral opportunities are assigned to your account.
                    </p>
                  )}
                </div>
              </div>
            ) : filteredReferrals.length === 0 ? (
              <div className="py-12 text-center">
                <div className="flex flex-col items-center gap-2">
                  <FiInbox className="text-5xl text-gray-300 mb-1" />
                  <p className="text-base font-semibold text-gray-600">No Matching Referrals Found</p>
                  <p className="text-xs text-gray-400 max-w-sm">
                    {searchQuery || selectedStatus ? "Try adjusting your search terms or filters." : "No referral jobs assigned to your account yet."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredReferrals.map((referral) => (
                  <div
                    key={referral._id}
                    className="bg-white border border-gray-100 rounded-xl p-4 shadow-2xs hover:shadow-md transition-all hover:border-indigo-200 group flex flex-col justify-between"
                  >
                    <div>
                      {/* Status Badge & Bonus */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadgeColor(referral.status)}`}>
                          {getStatusIcon(referral.status)} <span className="ml-1">{getStatusLabel(referral.status)}</span>
                        </span>
                        {referral.bonusAmount > 0 && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            ₹{referral.bonusAmount} Bonus
                          </span>
                        )}
                      </div>

                      {/* Job Title */}
                      <h3 className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-1.5" title={referral.jobTitle}>
                        {referral.jobTitle}
                      </h3>

                      {/* Job Link */}
                      <div
                        className="flex items-center gap-1.5 text-xs text-blue-600 truncate mb-3 cursor-pointer hover:underline group/link"
                        onClick={(e) => handleLinkClick(referral.jobLink, e)}
                        title={referral.jobLink}
                      >
                        <FiLink className="text-xs flex-shrink-0 text-blue-500 group-hover/link:text-blue-700" />
                        <span className="truncate text-[11px] font-medium">{referral.jobLink || 'No link provided'}</span>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Expires</p>
                          <p className="text-xs font-semibold text-slate-700 truncate mt-0.5">
                            {formatDate(referral.expiryDate)}
                          </p>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Max Allowed</p>
                          <p className="text-xs font-semibold text-slate-700 truncate mt-0.5">
                            {referral.maxReferralsPerEmployee || 5} candidates
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      {/* Metrics bar */}
                      <div className="flex items-center justify-between text-[11px] text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100 mb-3">
                        <div className="flex items-center gap-1" title="Total Referrals Made">
                          <FiUsers className="text-slate-400" size={12} />
                          <span className="font-semibold text-slate-700">{referral.totalReferralsMade || 0}</span>
                        </div>
                        <div className="flex items-center gap-1" title="Successful Hires">
                          <FiCheckCircle className="text-emerald-500" size={12} />
                          <span className="font-semibold text-emerald-700">{referral.successfulReferrals || 0}</span>
                        </div>
                        <div className="flex items-center gap-1" title="Pending Candidates">
                          <FiClock className="text-amber-500" size={12} />
                          <span className="font-semibold text-amber-700">{(referral.totalReferralsMade || 0) - (referral.successfulReferrals || 0)}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => openViewModal(referral)}
                          className="flex-1 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 shadow-2xs"
                        >
                          <FiEye size={12} />
                          View
                        </button>
                        <button
                          onClick={() => openReferModal(referral)}
                          className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm"
                        >
                          <FiUserPlus size={12} />
                          Refer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </main>

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