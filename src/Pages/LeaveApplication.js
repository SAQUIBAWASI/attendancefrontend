import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = "http://localhost:5001/";

const LeaveRequestForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    employeeId: "",
    employeeName: "",
    leaveType: "casual",
    startDate: "",
    endDate: "",
    days: 0,
    reason: "",
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [permissionForm, setPermissionForm] = useState({ reason: "", duration: "" });
  const [permissionLoading, setPermissionLoading] = useState(false);
  const [activePermission, setActivePermission] = useState(null);
  const [position, setPosition] = useState(null);
  const [submittingDuty, setSubmittingDuty] = useState(false);

  useEffect(() => {
    const rawData = localStorage.getItem("employeeData");
    console.log("DEBUG: rawData:", rawData);

    let employeeData = null;
    try {
      if (rawData) employeeData = JSON.parse(rawData);
    } catch (e) {
      console.error("DEBUG: JSON parse error:", e);
    }

    const id = employeeData?.employeeId || localStorage.getItem("employeeId");
    const name = employeeData?.name || localStorage.getItem("employeeName") || employeeData?.employeeName;

    console.log("DEBUG: Resolved ID:", id);
    console.log("DEBUG: Resolved Name:", name);

    if (id && name) {
      setFormData((prev) => ({
        ...prev,
        employeeId: id,
        employeeName: name,
      }));
      fetchActivePermission(id);
    } else {
      console.warn("DEBUG: Required details missing from storage!");
    }

    fetchLocation();
  }, []);

  const fetchLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.error("Location error:", err),
        { enableHighAccuracy: true }
      );
    }
  };

  const fetchActivePermission = async (employeeId) => {
    try {
      const res = await axios.get(`${BASE_URL}api/permissions/my-permissions/${employeeId}`);
      if (res.status === 200 && res.data) {
        const active = res.data.find(p => p.status === "APPROVED");
        setActivePermission(active);
      }
    } catch (err) {
      console.error("Error fetching permission:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "startDate" || name === "endDate") {
        if (updated.startDate && updated.endDate) {
          const start = new Date(updated.startDate);
          const end = new Date(updated.endDate);
          const diffTime = end - start;
          const diffDays = diffTime >= 0 ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 : 0;
          updated.days = diffDays;
        }
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await axios.post("http://localhost:5001/api/leaves/apply", formData);
      if (response.status === 201) {
        setSuccessMessage("✅ Leave application submitted successfully!");
        setFormData({
          ...formData,
          leaveType: "casual",
          startDate: "",
          endDate: "",
          days: 0,
          reason: "",
        });
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "❌ Failed to submit leave application.");
    }
  };

  const handlePermissionSubmit = async (e) => {
    e.preventDefault();
    setPermissionLoading(true);

    // Fail-safe: Get directly from storage if state is empty
    const rawData = localStorage.getItem("employeeData");
    let employeeData = null;
    try { if (rawData) employeeData = JSON.parse(rawData); } catch (e) { }

    const id = formData.employeeId || employeeData?.employeeId || employeeData?._id || localStorage.getItem("employeeId");
    const name = formData.employeeName || employeeData?.name || localStorage.getItem("employeeName") || employeeData?.employeeName;
    const durationNum = parseInt(permissionForm.duration);

    if (!id || !name) {
      alert("❌ Employee ID or Name not found. Please log out and log in again.");
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
        fetchActivePermission(formData.employeeId);
      }
    } catch (err) {
      alert("❌ " + (err.response?.data?.message || err.message));
    } finally {
      setPermissionLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex-1 flex flex-col">
        <div className="p-6">
          {/* Top Buttons */}
          <div className="max-w-md mx-auto mb-6 flex flex-col sm:flex-row gap-4 justify-between">
            <button
              onClick={() => navigate("/myleaves")}
              className="px-5 py-2 text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition-all shadow-sm"
            >
              ← My Leaves
            </button>

            <button
              onClick={() => setIsPermissionModalOpen(true)}
              className="px-5 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm"
            >
              Request Permission
            </button>
          </div>

          {/* ✅ Back to Duty Section */}
          {activePermission && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg shadow-sm max-w-md mx-auto">
              <h3 className="text-lg font-bold text-yellow-800 mb-2">🔴 Active Permission</h3>
              <div className="text-sm text-yellow-800 mb-4 bg-white p-3 rounded border border-yellow-100">
                <p className="mb-1"><span className="font-semibold">Reason:</span> {activePermission.reason}</p>
                <p><span className="font-semibold">Duration:</span> {activePermission.duration} mins</p>
              </div>

              <button
                onClick={async () => {
                  if (!position) {
                    fetchLocation();
                    return alert("Please allow location access and try again!");
                  }

                  try {
                    setSubmittingDuty(true);
                    const res = await axios.put(`${BASE_URL}api/permissions/back-to-duty/${activePermission._id}`, {
                      lat: position.lat,
                      lng: position.lng
                    });

                    if (res.data) {
                      alert(`✅ Back to Duty Successful! \nDistance check: ${res.data.locationCheck?.distance}`);
                      setActivePermission(null);
                      navigate("/myleaves");
                    }
                  } catch (err) {
                    alert("❌ " + (err.response?.data?.message || err.message));
                  } finally {
                    setSubmittingDuty(false);
                  }
                }}
                disabled={submittingDuty}
                className="w-full py-3 text-lg font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 shadow transition-all flex justify-center items-center gap-2"
              >
                {submittingDuty ? "Processing..." : "Report Back to Duty"}
              </button>
            </div>
          )}

          <div className="max-w-md mx-auto bg-white rounded shadow p-6">
            <h2 className="mb-4 text-xl font-bold text-blue-900">Leave Request Form</h2>
            {successMessage && <div className="p-3 mb-4 text-green-700 bg-green-100 rounded">{successMessage}</div>}
            {errorMessage && <div className="p-3 mb-4 text-red-700 bg-red-100 rounded">{errorMessage}</div>}

            <form onSubmit={handleSubmit}>
              <input value={formData.employeeId} readOnly className="mb-2 p-2 border rounded w-full bg-gray-100" placeholder="Employee ID" required />
              <input value={formData.employeeName} readOnly className="mb-2 p-2 border rounded w-full bg-gray-100" placeholder="Employee Name" required />
              <select name="leaveType" value={formData.leaveType} onChange={handleChange} className="mb-2 p-2 border rounded w-full" required>
                <option value="casual">Casual</option>
                <option value="sick">Sick</option>
                <option value="earned">Earned</option>
              </select>
              <input name="startDate" type="date" value={formData.startDate} onChange={handleChange} className="mb-2 p-2 border rounded w-full" required />
              <input name="endDate" type="date" value={formData.endDate} onChange={handleChange} className="mb-2 p-2 border rounded w-full" required />
              <input name="days" type="number" value={formData.days} readOnly className="mb-2 p-2 border rounded w-full" placeholder="Number of Days" />
              <textarea name="reason" value={formData.reason} onChange={handleChange} className="mb-2 p-2 border rounded w-full" placeholder="Reason for leave" rows="3" required />
              <button type="submit" className="w-full px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700">Submit Leave Request</button>
            </form>
          </div>
        </div>
      </div>

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
                <button onClick={()=>navigate('/mypermissions')} type="submit" disabled={permissionLoading} className="flex-1 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">{permissionLoading ? "Submitting..." : "Request"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveRequestForm;