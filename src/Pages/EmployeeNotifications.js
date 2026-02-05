import axios from "axios";
import { useEffect, useState } from "react";
import { FiCalendar, FiClock, FiSun } from "react-icons/fi";
import { MdCheckCircle, MdError, MdNotificationsActive } from "react-icons/md";
import { API_BASE_URL } from "../config";

const EmployeeNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get employee ID from local storage or profile
  const employeeData = JSON.parse(localStorage.getItem("employeeData"));
  const employeeId = employeeData?.employeeId;

  // Icon mapping based on type
  const iconMap = {
    leave: <FiCalendar className="text-orange-500" />,
    shift: <FiClock className="text-blue-500" />,
    general: <FiSun className="text-yellow-500" />, // Holidays
    attendance: <MdCheckCircle className="text-green-500" />,
    default: <MdNotificationsActive className="text-gray-500" />
  };

  useEffect(() => {
    if (!employeeId) {
      setError("Employee ID not found. Please login again.");
      setLoading(false);
      return;
    }
    fetchNotifications();

    // ✅ Mark all as read automatically on page load
    markAllRead();

  }, [employeeId]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/notifications/${employeeId}`);
      setNotifications(res.data || []);
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
      // Update local state to reflect read status
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const markAllRead = async () => {
    try {
      await axios.put(`${API_BASE_URL}/notifications/read-all/${employeeId}`);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  if (error) return (
    <div className="p-6 text-center text-red-500 bg-red-50 rounded-xl m-4 border border-red-100">
      <MdError className="mx-auto text-3xl mb-2" />
      {error}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <MdNotificationsActive className="text-blue-600" />
          My Notifications
        </h1>
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={markAllRead}
            className="text-sm text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors font-medium"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div
              key={notif._id}
              onClick={() => !notif.isRead && markAsRead(notif._id)}
              className={`relative flex gap-3 p-3 rounded-lg transition-all border cursor-pointer
                ${notif.isRead
                  ? "bg-white border-gray-100"
                  : "bg-blue-50/50 border-blue-100 hover:bg-blue-50"
                } shadow-sm hover:shadow-md`}
            >
              {/* Status Indicator Dot */}
              {!notif.isRead && (
                <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-blue-600"></div>
              )}

              <div className="flex-shrink-0 mt-0.5 text-lg p-1.5 bg-white rounded-md shadow-sm h-fit">
                {iconMap[notif.type] || iconMap.default}
              </div>

              <div className="flex-1">
                <h3 className={`text-sm font-semibold mb-0.5 ${notif.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                  {notif.title}
                </h3>
                <p className="text-xs text-gray-600 leading-snug mb-1.5">
                  {notif.message}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-medium bg-gray-50 px-1.5 py-0.5 rounded">
                    {new Date(notif.createdAt).toLocaleString()}
                  </span>
                  {notif.type === 'shift' && (
                    <span className="text-[10px] text-blue-600 font-medium">Shift Update</span>
                  )}
                  {notif.type === 'leave' && (
                    <span className="text-[10px] text-orange-600 font-medium">Leave Update</span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 text-2xl">
              <MdNotificationsActive />
            </div>
            <h3 className="text-gray-900 font-semibold mb-1">No notifications yet</h3>
            <p className="text-gray-500 text-sm">We'll notify you when something important happens.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeNotifications;
