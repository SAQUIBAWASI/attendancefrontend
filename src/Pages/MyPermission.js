import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, API_DOMAIN } from "../config";

const BASE_URL = API_DOMAIN;

const EmployeePermissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [filteredPermissions, setFilteredPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [position, setPosition] = useState(null);
  const [submittingDuty, setSubmittingDuty] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [permissionForm, setPermissionForm] = useState({ reason: "", duration: "" });
  const [permissionLoading, setPermissionLoading] = useState(false);
  const navigate = useNavigate();

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => console.error("Location error:", err),
      { enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  useEffect(() => {
    const employeeDataRaw = localStorage.getItem("employeeData");

    if (!employeeDataRaw) {
      setError("❌ Employee data not found in localStorage.");
      setLoading(false);
      return;
    }

    let employeeId;
    try {
      employeeId = JSON.parse(employeeDataRaw).employeeId;
    } catch {
      setError("❌ Invalid employee data.");
      setLoading(false);
      return;
    }

    const fetchPermissions = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/permissions/my-permissions/${employeeId}`
        );

        if (Array.isArray(res.data)) {
          setPermissions(res.data);
          setFilteredPermissions(res.data);
        } else {
          setError("❌ Unexpected API response format.");
        }
      } catch (err) {
        setError("❌ Failed to fetch permissions.");
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setSelectedMonth("");

    if (!date) {
      setFilteredPermissions(permissions);
      return;
    }

    const filtered = permissions.filter((p) => {
      const d = new Date(p.createdAt).toISOString().split("T")[0];
      return d === date;
    });

    setFilteredPermissions(filtered);
  };

  const handleMonthChange = (e) => {
    const month = e.target.value;
    setSelectedMonth(month);
    setSelectedDate("");

    if (!month) {
      setFilteredPermissions(permissions);
      return;
    }

    const [year, monthNum] = month.split("-");
    const filtered = permissions.filter((p) => {
      const d = new Date(p.createdAt);
      return (
        d.getFullYear() === parseInt(year) &&
        d.getMonth() + 1 === parseInt(monthNum)
      );
    });

    setFilteredPermissions(filtered);
  };

  const handleBackToDuty = async (permissionId) => {
    if (!position) {
      fetchLocation();
      return alert("Please allow location access and try again!");
    }

    try {
      setSubmittingDuty(true);
      const res = await axios.put(`${BASE_URL}api/permissions/back-to-duty/${permissionId}`, {
        lat: position.lat,
        lng: position.lng
      });

      if (res.data) {
        alert(`✅ Back to Duty Successful! \nDistance check: ${res.data.locationCheck?.distance}`);
        // Refresh permissions
        window.location.reload();
      }
    } catch (err) {
      alert("❌ " + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingDuty(false);
    }
  };

  const handlePermissionSubmit = async (e) => {
    e.preventDefault();
    setPermissionLoading(true);

    const rawData = localStorage.getItem("employeeData");
    let employeeData = null;
    try { if (rawData) employeeData = JSON.parse(rawData); } catch (e) { }

    const id = employeeData?.employeeId || localStorage.getItem("employeeId");
    // Some basic fail-safe for name, though usually permissions are by ID
    const name = employeeData?.name || localStorage.getItem("employeeName") || "Employee";
    const durationNum = parseInt(permissionForm.duration);

    if (!id) {
      alert("❌ Employee ID not found. Please log out and log in again.");
      setPermissionLoading(false);
      return;
    }

    if (!permissionForm.reason || isNaN(durationNum)) {
      alert("❌ Please provide a valid reason and duration.");
      setPermissionLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}api/permissions/request`, {
        employeeId: id,
        employeeName: name,
        reason: permissionForm.reason,
        duration: durationNum,
      });

      if (res.status === 201) {
        alert("✅ Permission Requested Successfully!");
        setIsPermissionModalOpen(false);
        setPermissionForm({ reason: "", duration: "" });
        // Refresh permissions
        window.location.reload();
      }
    } catch (err) {
      alert("❌ " + (err.response?.data?.message || err.message));
    } finally {
      setPermissionLoading(false);
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl p-6 mx-auto bg-white rounded-lg shadow-md">
          <div className="flex flex-col gap-4 mb-6 md:flex-row md:justify-between md:items-center">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-blue-900">
                My Permission Requests
              </h2>
              <button
                onClick={() => setIsPermissionModalOpen(true)}
                className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm"
              >
                + Request Permission
              </button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex flex-col">
                <label className="mb-1 text-sm text-gray-600">
                  Filter by Date:
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  className="p-2 border rounded"
                />
              </div>

              <div className="flex flex-col">
                <label className="mb-1 text-sm text-gray-600">
                  Filter by Month:
                </label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={handleMonthChange}
                  className="p-2 border rounded"
                />
              </div>
            </div>
          </div>

          {filteredPermissions.length === 0 ? (
            <p className="text-gray-500">No permission records found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border text-sm min-w-[600px]">
                <thead className="bg-gray-200 text-gray-700">
                  <tr>
                    <th className="p-2 border">Date</th>
                    <th className="p-2 border">Duration (mins)</th>
                    <th className="p-2 border">Reason</th>
                    <th className="p-2 border">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPermissions.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50">
                      <td className="p-2 border">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-2 border">{p.duration}</td>
                      <td className="p-2 border">{p.reason}</td>
                      <td className="p-2 border">
                        <div className="flex flex-col gap-2 items-center">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded ${p.status === "APPROVED"
                              ? "bg-green-200 text-green-800"
                              : p.status === "REJECTED"
                                ? "bg-red-200 text-red-800"
                                : p.status === "COMPLETED"
                                  ? "bg-blue-200 text-blue-800"
                                  : "bg-yellow-200 text-yellow-800"
                              }`}
                          >
                            {p.status}
                          </span>

                          {p.status === "APPROVED" && (
                            <button
                              onClick={() => handleBackToDuty(p._id)}
                              disabled={submittingDuty}
                              className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                              {submittingDuty ? "..." : "Back To Duty"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Permission Modal */}
      {isPermissionModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Request Permission</h3>
              <button onClick={() => setIsPermissionModalOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            <form onSubmit={handlePermissionSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" rows="3" value={permissionForm.reason} onChange={(e) => setPermissionForm({ ...permissionForm, reason: e.target.value })} placeholder="Why do you need permission?"></textarea>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <input type="number" required min="1" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={permissionForm.duration} onChange={(e) => setPermissionForm({ ...permissionForm, duration: e.target.value })} placeholder="e.g. 30" />
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setIsPermissionModalOpen(false)} className="flex-1 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                <button type="submit" disabled={permissionLoading} className="flex-1 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">{permissionLoading ? "Submitting..." : "Request"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeePermissions;

