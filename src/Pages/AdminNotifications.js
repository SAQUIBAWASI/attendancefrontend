import { useCallback, useEffect, useState } from "react";
import {
  FaExclamationTriangle,
  FaShoppingCart,
  FaTag,
  FaUserClock,
  FaUserPlus,
  FaUserShield,
} from "react-icons/fa";
import { FiRefreshCw, FiUserX, FiClock, FiCalendar } from "react-icons/fi";
import { MdDelete, MdNotificationsActive } from "react-icons/md";
import { API_BASE_URL } from "../config";
import { runAdminMissedLoginCheck } from "../utils/adminMissedLoginAlert";
import { getAdminEmail } from "../utils/adminSession";

const iconMap = {
  newUser: <FaUserPlus className="text-blue-700" />,
  security: <FaExclamationTriangle className="text-red-600" />,
  roleChange: <FaUserShield className="text-blue-600" />,
  vendorOrder: <FaShoppingCart className="text-blue-600" />,
  vendorCoupon: <FaTag className="text-blue-700" />,
  leave: <MdNotificationsActive className="text-orange-500" />,
  permission: <MdNotificationsActive className="text-purple-500" />,
  attendance: <FaUserClock className="text-amber-600" />,
};

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [attendanceAlerts, setAttendanceAlerts] = useState([]);
  const [attendanceMeta, setAttendanceMeta] = useState(null);
  const [todayRecords, setTodayRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [missedLoading, setAlertsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const fetchNotifications = useCallback(async () => {
    const adminEmail = getAdminEmail();
    if (!adminEmail) {
      setNotifications([]);
      return;
    }

    const res = await fetch(`${API_BASE_URL}/notifications/${adminEmail}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const data = await res.json();
    setNotifications(data || []);
  }, []);

  const fetchAttendanceAlerts = useCallback(async (createNotifications = false) => {
    try {
      setAlertsLoading(true);
      const result = await runAdminMissedLoginCheck(createNotifications);
      setAttendanceAlerts(result.attendanceAlerts || []);
      setTodayRecords(result.todayRecords || []);
      setAttendanceMeta({
        totalAssigned: result.totalAssigned,
        totalPresent: result.totalPresent,
        missedCount: result.missedEmployees?.length || 0,
        lateCount: result.lateEmployees?.length || 0,
      });
      setLastChecked(new Date());
      if (createNotifications) {
        fetchNotifications();
      }
    } catch (err) {
      console.error("Failed to fetch attendance alerts:", err);
    } finally {
      setAlertsLoading(false);
    }
  }, [fetchNotifications]);

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await fetchAttendanceAlerts(true);
      await fetchNotifications();
    } catch (err) {
      setError(err.message || "Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  }, [fetchNotifications, fetchAttendanceAlerts]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchAttendanceAlerts(true);
    }, 60000);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchAttendanceAlerts(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchAttendanceAlerts]);

  useEffect(() => {
    const markAllRead = async () => {
      try {
        const adminEmail = getAdminEmail();
        if (!adminEmail) return;

        await fetch(`${API_BASE_URL}/notifications/read-all/${adminEmail}`, {
          method: "PUT",
        });
        window.dispatchEvent(new Event("notification-updated"));
      } catch (markError) {
        console.error("Error marking notifications as read:", markError);
      }
    };
    markAllRead();
  }, []);

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/notifications/${id}`, { method: "DELETE" });
      setNotifications((prev) => prev.filter((notif) => notif._id !== id));
    } catch (err) {
      alert(`Error deleting notification: ${err.message}`);
    }
  };

  const getRecordStatusBadge = (status) => {
    const styles = {
      missed: "bg-red-100 text-red-800",
      late: "bg-orange-100 text-orange-800",
      pending: "bg-gray-100 text-gray-700",
      "on-time": "bg-green-100 text-green-800",
      "checked-out": "bg-blue-100 text-blue-800",
    };
    const labels = {
      missed: "Not Checked In",
      late: "Late",
      pending: "Pending",
      "on-time": "On Time",
      "checked-out": "Checked Out",
    };
    return (
      <span className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${styles[status] || styles.pending}`}>
        {labels[status] || status}
      </span>
    );
  };

  const todayDateLabel = new Date().toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  if (loading && missedLoading) {
    return <div className="p-4 text-center">Loading notifications...</div>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
          <MdNotificationsActive className="text-xl text-blue-600" />
          Admin Notifications
        </h1>
        <button
          type="button"
          onClick={loadAll}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
        >
          <FiRefreshCw className={missedLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Live attendance alerts: missed + late check-in */}
      <div className="overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm">
        <div className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 md:px-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-bold text-amber-800">
                <FaUserClock className="text-base" />
                Today&apos;s Attendance Alerts
              </h2>
              <p className="mt-0.5 text-xs text-amber-700">
                Missed login (not checked in) and late check-in (checked in after assigned time + 1 min).
              </p>
            </div>
            <div className="text-xs text-amber-700">
              {lastChecked
                ? `Updated ${lastChecked.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                : "Checking..."}
              {attendanceMeta && (
                <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 font-semibold">
                  {attendanceMeta.missedCount} missed • {attendanceMeta.lateCount} late • {attendanceMeta.totalPresent} present
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {missedLoading && attendanceAlerts.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-gray-500">Checking employee attendance...</p>
          ) : attendanceAlerts.length > 0 ? (
            attendanceAlerts.map((employee) => {
              const isLate = employee.alertType === "late";
              return (
                <div
                  key={`${employee.employeeId}-${employee.alertType}`}
                  className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-5"
                >
                  <div className="flex items-start gap-3">
                    <div className={`rounded-lg p-2.5 ${isLate ? "bg-orange-100 text-orange-700" : "bg-amber-100 text-amber-700"}`}>
                      {isLate ? <FiClock /> : <FiUserX />}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-gray-900">{employee.employeeName}</h3>
                        <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                          {employee.employeeId}
                        </span>
                        <span className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${isLate ? "bg-orange-100 text-orange-800" : "bg-amber-100 text-amber-800"}`}>
                          {isLate ? "Late Check-In" : "Not Checked In"}
                        </span>
                      </div>
                      {isLate ? (
                        <p className="mt-1 text-sm text-gray-700">
                          Assigned check-in time is{" "}
                          <span className="font-bold text-amber-800">{employee.shiftStart}</span>.
                          Checked in at{" "}
                          <span className="font-bold text-orange-700">{employee.checkInDisplay}</span>.
                        </p>
                      ) : (
                        <p className="mt-1 text-sm text-gray-700">
                          Employee check-in time is{" "}
                          <span className="font-bold text-amber-800">{employee.shiftStart}</span> but not
                          checked in yet.
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        {employee.department} • {employee.designation} • Shift {employee.shiftType}
                        {employee.timeRange ? ` • ${employee.timeRange}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 self-start md:self-center">
                    <span className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600">
                      {employee.delayMinutes} min late
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="px-4 py-8 text-center text-sm text-green-700">
              All assigned employees have checked in on time today.
            </p>
          )}
        </div>
      </div>

      {/* Today Records */}
      <div className="overflow-hidden rounded-xl border border-blue-200 bg-white shadow-sm">
        <div className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 md:px-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-bold text-blue-800">
                <FiCalendar className="text-base" />
                Today Records
              </h2>
              <p className="mt-0.5 text-xs text-blue-700">
                All employees with assigned shifts — check-in status for {todayDateLabel}.
              </p>
            </div>
            {attendanceMeta && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
                {attendanceMeta.totalPresent} checked in / {attendanceMeta.totalAssigned} assigned
              </span>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Employee ID</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Assigned Time</th>
                <th className="px-4 py-3 font-semibold">Check-In</th>
                <th className="px-4 py-3 font-semibold">Check-Out</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Delay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {missedLoading && todayRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                    Loading today&apos;s records...
                  </td>
                </tr>
              ) : todayRecords.length > 0 ? (
                todayRecords.map((record) => (
                  <tr key={record.employeeId} className="hover:bg-gray-50/80">
                    <td className="px-4 py-3 font-medium text-gray-800">{record.employeeId}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{record.employeeName}</div>
                      <div className="text-xs text-gray-500">{record.department}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-blue-800">{record.shiftStart}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{record.checkInDisplay}</td>
                    <td className="px-4 py-3 text-gray-600">{record.checkOutDisplay}</td>
                    <td className="px-4 py-3">{getRecordStatusBadge(record.recordStatus)}</td>
                    <td className="px-4 py-3">
                      {record.delayMinutes > 0 ? (
                        <span className="font-bold text-red-600">{record.delayMinutes} min</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                    No records for today.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Saved notifications */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-4 py-3 md:px-5">
          <h2 className="text-sm font-semibold text-gray-800">Notification History</h2>
          {!getAdminEmail() && (
            <p className="mt-1 text-xs text-amber-700">
              Log in again as admin to load saved notification history.
            </p>
          )}
        </div>

        <div className="space-y-2 p-4">
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <div
                key={notif._id}
                className="flex items-start justify-between rounded-md border border-gray-200 bg-white p-3 shadow-sm transition hover:shadow-md"
              >
                <div className="flex gap-3">
                  <div className="mt-0.5 text-xl">
                    {iconMap[notif.type] || <MdNotificationsActive className="text-gray-500" />}
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-gray-700">{notif.title}</h2>
                    {notif.vendorName && (
                      <p className="text-xs italic text-gray-500">Vendor: {notif.vendorName}</p>
                    )}
                    <p className="text-xs leading-tight text-gray-500">{notif.message}</p>
                    <p className="mt-0.5 text-[10px] text-gray-500">
                      {new Date(notif.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(notif._id)}
                  className="ml-3 mt-1 text-lg text-red-500 hover:text-red-700"
                  title="Delete notification"
                >
                  <MdDelete />
                </button>
              </div>
            ))
          ) : (
            <p className="py-6 text-center text-sm text-gray-500">No notification history yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;