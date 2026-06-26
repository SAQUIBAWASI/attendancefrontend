import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import { 
  FiCalendar, 
  FiClock, 
  FiSun, 
  FiSearch, 
  FiX, 
  FiAlertCircle, 
  FiRefreshCw, 
  FiInbox,
  FiChevronRight
} from "react-icons/fi";
import { 
  MdCheckCircle, 
  MdError, 
  MdNotificationsActive,
  MdOutlineMarkEmailRead
} from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

const EmployeeNotifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedNotification, setSelectedNotification] = useState(null);

  // Get employee ID and details from local storage
  const employeeData = JSON.parse(localStorage.getItem("employeeData"));
  const employeeId = employeeData?.employeeId;
  const employeeName = employeeData?.name || employeeData?.employeeName || (employeeData?.firstName ? `${employeeData.firstName} ${employeeData.lastName || ''}` : "Employee");

  // Relative Time Formatter
  const formatRelativeTime = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    } catch (e) {
      return "Some time ago";
    }
  };

  // Notification Type Configuration for Colors, Icons, CTAs
  const typeConfig = {
    leave: {
      icon: <FiCalendar className="text-orange-500 text-lg" />,
      bg: "bg-orange-50 border-orange-100",
      accent: "border-l-4 border-l-orange-500",
      text: "text-orange-600",
      label: "Leave Update",
      cta: "View Leave History",
      link: "/myleaves"
    },
    shift: {
      icon: <FiClock className="text-blue-500 text-lg" />,
      bg: "bg-blue-50 border-blue-100",
      accent: "border-l-4 border-l-blue-500",
      text: "text-blue-600",
      label: "Shift Update",
      cta: "View Shift Schedule",
      link: "/my-shift"
    },
    attendance: {
      icon: <MdCheckCircle className="text-emerald-500 text-lg" />,
      bg: "bg-emerald-50 border-emerald-100",
      accent: "border-l-4 border-l-emerald-500",
      text: "text-emerald-600",
      label: "Attendance Record",
      cta: "View Attendance Records",
      link: "/myattendance"
    },
    general: {
      icon: <FiSun className="text-amber-500 text-lg" />,
      bg: "bg-amber-50 border-amber-100",
      accent: "border-l-4 border-l-amber-500",
      text: "text-amber-600",
      label: "General Announcement",
      cta: "Go to Dashboard",
      link: "/employeedashboard"
    },
    default: {
      icon: <MdNotificationsActive className="text-violet-500 text-lg" />,
      bg: "bg-violet-50 border-violet-100",
      accent: "border-l-4 border-l-violet-500",
      text: "text-violet-600",
      label: "System Alert",
      cta: "Go to Dashboard",
      link: "/employeedashboard"
    }
  };

  useEffect(() => {
    if (!employeeId) {
      setError("Employee ID not found. Please login again.");
      setLoading(false);
      return;
    }
    fetchNotificationsAndMarkRead();
  }, [employeeId]);

  const fetchNotificationsAndMarkRead = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/notifications/${employeeId}`);
      const data = res.data || [];
      setNotifications(data);
      
      // If there are unread notifications, mark them read in the database
      // so the navbar unread count clears, but keep the local highlight in this session.
      const hasUnread = data.some(n => !n.isRead);
      if (hasUnread) {
        await axios.put(`${API_BASE_URL}/notifications/read-all/${employeeId}`);
        // Dispatch custom event to sync the navbar count to 0
        window.dispatchEvent(new Event('notification-updated'));
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/notifications/read/${id}`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      window.dispatchEvent(new Event('notification-updated'));
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.put(`${API_BASE_URL}/notifications/read-all/${employeeId}`);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      window.dispatchEvent(new Event('notification-updated'));
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  // Notification Counts for Badges
  const counts = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter(n => !n.isRead).length;
    const leave = notifications.filter(n => n.type === "leave").length;
    const shift = notifications.filter(n => n.type === "shift").length;
    const attendance = notifications.filter(n => n.type === "attendance").length;
    const general = notifications.filter(n => n.type === "general" || n.type === "default").length;

    return { total, unread, leave, shift, attendance, general };
  }, [notifications]);

  // Search & Tab Filter logic
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notif => {
      // Tab selection filter
      if (selectedTab === "unread" && notif.isRead) return false;
      if (selectedTab === "leave" && notif.type !== "leave") return false;
      if (selectedTab === "shift" && notif.type !== "shift") return false;
      if (selectedTab === "attendance" && notif.type !== "attendance") return false;
      if (selectedTab === "general" && notif.type !== "general" && notif.type !== "default") return false;

      // Search query filter
      if (searchTerm.trim() !== "") {
        const query = searchTerm.toLowerCase();
        return (
          notif.title?.toLowerCase().includes(query) ||
          notif.message?.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [notifications, selectedTab, searchTerm]);

  // Handle clicking a notification card
  const handleNotificationClick = (notif) => {
    setSelectedNotification(notif);
    if (!notif.isRead) {
      markAsRead(notif._id);
    }
  };

  // Handle CTA redirection from detailed view
  const handleCtaClick = (link) => {
    setSelectedNotification(null);
    navigate(link);
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-96 gap-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-blue-100 animate-pulse"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 animate-spin"></div>
      </div>
      <p className="text-gray-500 font-medium animate-pulse">Loading notifications...</p>
    </div>
  );

  if (error) return (
    <div className="max-w-md mx-auto my-12 p-6 text-center bg-red-50/50 border border-red-100 rounded-2xl shadow-sm">
      <FiAlertCircle className="mx-auto text-4xl text-red-500 mb-3" />
      <h3 className="text-gray-900 font-semibold mb-1">Failed to load</h3>
      <p className="text-red-600 text-sm mb-4">{error}</p>
      <button 
        onClick={fetchNotificationsAndMarkRead}
        className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2 rounded-xl transition shadow-sm font-medium"
      >
        <FiRefreshCw /> Retry
      </button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* CSS Animation injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoomIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
        .animate-zoomIn {
          animation: zoomIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}} />

      {/* Personalized Welcoming Banner */}
      {/* <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 md:p-8 text-white shadow-lg border border-blue-500/10 animate-fadeIn">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 space-y-2">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            Welcome back, {employeeName}!
          </h2>
          <p className="text-blue-100 text-xs md:text-sm max-w-xl leading-relaxed">
            Stay updated with your shift changes, attendance, leave approvals, and office announcements.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-white backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              {counts.total} Total Notifications
            </span>
            {counts.unread > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500 text-white shadow-sm border border-blue-400">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                {counts.unread} New Updates
              </span>
            )}
          </div>
        </div>
      </div> */}

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fadeIn">
        {/* Search & Bulk Actions Bar */}
        <div className="p-4 md:p-6 border-b border-gray-50 bg-gray-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
            <input
              type="text"
              placeholder="Search by keyword, title, or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white placeholder-gray-400 text-gray-800 text-sm transition outline-none shadow-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                <FiX className="text-base" />
              </button>
            )}
          </div>

          {/* Mark all as read */}
          {counts.unread > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-2 self-start md:self-auto text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/70 border border-blue-100 px-4 py-2 rounded-xl transition font-semibold text-xs shadow-sm"
            >
              <MdOutlineMarkEmailRead className="text-base" />
              Mark all as read
            </button>
          )}
        </div>

        {/* Category Tabs Scroll Grid */}
        <div className="border-b border-gray-100 px-4 md:px-6 bg-white overflow-x-auto scrollbar-none">
          <div className="flex space-x-1.5 py-3 min-w-max">
            {[
              { id: "all", label: "All", count: counts.total },
              { id: "unread", label: "Unread", count: counts.unread, badge: counts.unread > 0 },
              { id: "leave", label: "Leaves", count: counts.leave },
              { id: "shift", label: "Shifts", count: counts.shift },
              { id: "attendance", label: "Attendance", count: counts.attendance },
              { id: "general", label: "Announcements", count: counts.general }
            ].map((tab) => {
              const isActive = selectedTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition duration-200 border
                    ${isActive
                      ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                      : "bg-white border-gray-100 text-gray-600 hover:bg-gray-50 hover:border-gray-200"
                    }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold transition
                      ${isActive
                        ? "bg-white text-blue-700"
                        : tab.badge
                          ? "bg-blue-600 text-white animate-pulse"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notifications list */}
        <div className="divide-y divide-gray-100">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => {
              const config = typeConfig[notif.type] || typeConfig.default;
              return (
                <div
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`relative flex items-start gap-4 p-4 md:p-5 transition-all duration-200 cursor-pointer group hover:bg-gray-50/50
                    ${config.accent}
                    ${notif.isRead
                      ? "bg-white"
                      : "bg-blue-50/20 hover:bg-blue-50/40"
                    }`}
                >
                  {/* Soft Background Icon Container */}
                  <div className={`flex-shrink-0 p-2.5 rounded-xl border ${config.bg} transition-transform duration-200 group-hover:scale-105 shadow-sm`}>
                    {config.icon}
                  </div>

                  {/* Message details */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`text-sm font-semibold transition leading-tight
                        ${notif.isRead 
                          ? 'text-gray-700 font-medium' 
                          : 'text-gray-900 font-bold group-hover:text-blue-700'
                        }`}
                      >
                        {notif.title}
                      </h3>
                      
                      {/* Badge / Indicators */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md">
                          {formatRelativeTime(notif.createdAt)}
                        </span>
                        {!notif.isRead && (
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 border border-white shadow-sm"></span>
                        )}
                      </div>
                    </div>

                    <p className={`text-xs leading-relaxed max-w-2xl line-clamp-2
                      ${notif.isRead ? 'text-gray-500' : 'text-gray-600 font-medium'}`}
                    >
                      {notif.message}
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <span className={`text-[10px] font-semibold tracking-wide uppercase ${config.text}`}>
                        {config.label}
                      </span>
                      
                      {/* Tiny interactive arrow */}
                      <span className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition duration-200 flex items-center gap-0.5 text-[11px] font-semibold">
                        View details
                        <FiChevronRight className="text-xs" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            /* Empty State */
            <div className="text-center py-16 px-4">
              <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500 text-3xl border border-blue-100/50 shadow-inner animate-bounce duration-1000">
                <FiInbox />
              </div>
              <h3 className="text-gray-900 font-bold mb-1 text-base">All caught up!</h3>
              <p className="text-gray-500 text-xs md:text-sm max-w-xs mx-auto leading-relaxed">
                {searchTerm || selectedTab !== "all"
                  ? "We couldn't find any notifications matching your filters."
                  : "You don't have any notifications right now."
                }
              </p>
              
              {(searchTerm || selectedTab !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedTab("all");
                  }}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/70 border border-blue-100 px-3 py-1.5 rounded-lg transition font-semibold"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Detailed Modal Overlay */}
      {selectedNotification && (() => {
        const notif = selectedNotification;
        const config = typeConfig[notif.type] || typeConfig.default;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn">
            {/* Modal Card */}
            <div 
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all scale-100 animate-zoomIn"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header colored by type */}
              <div className={`p-5 flex items-center justify-between border-b border-gray-50 ${config.bg}`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg border border-gray-100 shadow-sm">
                    {config.icon}
                  </div>
                  <div>
                    <span className={`text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded bg-white shadow-xs ${config.text}`}>
                      {config.label}
                    </span>
                    <div className="text-[10px] text-gray-500 font-medium mt-0.5">
                      {new Date(notif.createdAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="p-1 rounded-lg hover:bg-white text-gray-400 hover:text-gray-600 transition shadow-xs border border-transparent hover:border-gray-100"
                >
                  <FiX className="text-lg" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <h4 className="text-base font-bold text-gray-900 leading-snug">
                    {notif.title}
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap select-text">
                    {notif.message}
                  </p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-end gap-2.5">
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-100/50 text-gray-700 text-xs font-semibold rounded-xl transition shadow-xs"
                >
                  Close
                </button>
                {config.link && (
                  <button
                    onClick={() => handleCtaClick(config.link)}
                    className="inline-flex items-center gap-1.5 px-4.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition shadow-sm"
                  >
                    {config.cta}
                    <FiChevronRight className="text-sm" />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default EmployeeNotifications;
