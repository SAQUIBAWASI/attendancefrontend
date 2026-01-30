import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = "http://localhost:5000/";

const EmployeePermissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [filteredPermissions, setFilteredPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [position, setPosition] = useState(null);
  const [submittingDuty, setSubmittingDuty] = useState(false);
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
          `http://localhost:5000/api/permissions/my-permissions/${employeeId}`
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

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl p-6 mx-auto bg-white rounded-lg shadow-md">
          <div className="flex flex-col gap-4 mb-6 md:flex-row md:justify-between md:items-center">
            <h2 className="text-2xl font-bold text-blue-900">
              My Permission Requests
            </h2>

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
    </div>
  );
};

export default EmployeePermissions;

