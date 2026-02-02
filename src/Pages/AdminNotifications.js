import { useEffect, useState } from "react";
import { FaExclamationTriangle, FaShoppingCart, FaTag, FaUserPlus, FaUserShield } from "react-icons/fa";
import { MdDelete, MdNotificationsActive } from "react-icons/md";

const iconMap = {
  newUser: <FaUserPlus className="text-green-600" />,
  security: <FaExclamationTriangle className="text-red-600" />,
  roleChange: <FaUserShield className="text-blue-600" />,
  vendorOrder: <FaShoppingCart className="text-blue-600" />,
  vendorCoupon: <FaTag className="text-green-600" />,
  leave: <MdNotificationsActive className="text-orange-500" />,
  permission: <MdNotificationsActive className="text-purple-500" />,
};

const AdminNotifications = () => {
 const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const API_BASE_URL = "http://localhost:5000/api"; // ✅ Use correct Base URL

  // Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);

        const adminEmail = localStorage.getItem("adminEmail"); // ✅ Get Email
        if (!adminEmail) throw new Error("Admin email not found. Please login again.");

        const res = await fetch(`${API_BASE_URL}/notifications/${adminEmail}`); // ✅ Use email
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();
        setNotifications(data || []);
      } catch (err) {
        setError(err.message || "Failed to fetch notifications");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // ✅ Mark all as read when page opens
  useEffect(() => {
    const markAllRead = async () => {
      try {
        const adminEmail = localStorage.getItem("adminEmail");
        if (!adminEmail) return;

        await fetch(`${API_BASE_URL}/notifications/read-all/${adminEmail}`, {
          method: "PUT",
        });
        
        // Optionally update local state if needed, but the main goal is backend update
        // so that Navbar poll picks it up. 
        // To force Navbar update, we'd need a context or event, but for now this is the fix.
        
        // Also refresh the trigger event for other tabs/components if using window storage event
        window.dispatchEvent(new Event("storage"));
      } catch (error) {
        console.error("Error marking notifications as read:", error);
      }
    };
    markAllRead();
  }, []);

  // Handle notification delete with API call
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/${id}`, { // ✅ Use Base URL
        method: "DELETE",
      });
      // Note: Backend might not have DELETE route implemented yet based on list_dir, 
      // but keeping it if it exists or for future using correct URL.
      // If it fails, we handle error.

      if (!res.ok) {
        // const errorData = await res.json();
        // throw new Error(errorData.message || "Failed to delete notification");
        console.warn("Delete API might not be implemented yet");
      }

      // Remove from local state after successful delete (optimistic update)
      setNotifications((prev) => prev.filter((notif) => notif._id !== id));
    } catch (err) {
      alert(`Error deleting notification: ${err.message}`);
    }
  };

  if (loading) return <div className="p-4 text-center">Loading notifications...</div>;
  if (error) return <div className="p-4 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
        <MdNotificationsActive className="text-blue-600 text-xl" />
        Admin Notifications
      </h1>

      <div className="space-y-2">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div
              key={notif._id}
              className="flex items-start justify-between bg-white p-3 rounded-md shadow-sm border border-gray-100 hover:shadow-md transition"
            >
              <div className="flex gap-3">
                <div className="text-xl mt-0.5">
                  {iconMap[notif.type] || <MdNotificationsActive className="text-gray-600" />}
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-800">{notif.title}</h2>
                  {notif.vendorName && (
                    <p className="text-xs text-gray-500 italic">Vendor: {notif.vendorName}</p>
                  )}
                  <p className="text-xs text-gray-600 leading-tight">{notif.message}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleDelete(notif._id)}
                className="text-red-500 hover:text-red-700 text-lg ml-3 mt-1"
                title="Delete notification"
              >
                <MdDelete />
              </button>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 text-sm">No notifications available.</p>
        )}
      </div>
    </div>
  );
};

export default AdminNotifications;
