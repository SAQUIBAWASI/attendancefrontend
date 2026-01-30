import axios from "axios";
import { useEffect, useState } from "react";

const BASE_URL = "http://localhost:5000/";

export const Permissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAllPermissions = async () => {
    try {
      const res = await axios.get(`${BASE_URL}api/permissions/all`);
      setPermissions(res.data);
    } catch (err) {
      console.error("Error fetching permissions:", err);
      setError("❌ Failed to fetch permissions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPermissions();
  }, []);

  const handleApprove = async (id) => {
    if (!window.confirm("Are you sure you want to APPROVE this permission?")) return;

    try {
      const res = await axios.put(`${BASE_URL}api/permissions/approve/${id}`);
      if (res.status === 200) {
        alert("✅ Permission Approved Successfully!");
        fetchAllPermissions(); // Refresh list
      }
    } catch (err) {
      alert("❌ Error: " + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <div className="p-6">Loading permissions...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto w-full">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-blue-900 border-b-2 border-blue-100 pb-2">
              Employee Permission Requests
            </h2>
            <button
              onClick={fetchAllPermissions}
              className="px-4 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors text-sm font-semibold"
            >
              Refresh Data
            </button>
          </div>

          {permissions.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No permission requests found.
            </div>
          ) : (
            <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
              <table className="min-w-full">
                <thead className="text-left text-sm text-white bg-gradient-to-r from-purple-500 to-blue-600">
                  <tr>
                    <th className="px-4 py-2 border">Name</th>
                    <th className="px-4 py-2 border">Date</th>
                    <th className="px-4 py-2 border">Duration</th>
                    <th className="px-4 py-2 border">Reason</th>
                    <th className="px-4 py-2 border">Status</th>
                    <th className="px-4 py-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {permissions.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2 border p-4 text-sm font-medium text-gray-800">{p.employeeName}</td>
                      <td className="px-4 py-2 border text-gray-600">
                        {new Date(p.createdAt).toLocaleDateString()}
                        <br />
                        <span className="text-xs">{new Date(p.createdAt).toLocaleTimeString()}</span>
                      </td>
                      <td className="px-4 py-2 border font-semibold text-[#1E40AF]">{p.duration} mins</td>
                      <td className="px-4 py-2 border max-w-xs overflow-hidden text-ellipsis italic text-gray-700">
                        "{p.reason}"
                      </td>
                      <td className="px-4 py-2 border">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${p.status === "APPROVED"
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : p.status === "COMPLETED"
                              ? "bg-blue-100 text-blue-700 border border-blue-200"
                              : p.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                                : "bg-red-100 text-red-700 border border-red-200"
                            }`}
                        >
                          {p.status === "COMPLETED" ? "IN DUTY" : p.status}
                        </span>
                        {p.status === "COMPLETED" && p.returnLocation && (
                          <div className="bg-gray-50 text-[10px] text-gray-400 font-mono mt-1">
                            <p className="text-[#1E40AF] font-bold">
                              Reported: {new Date(p.returnedAt).toLocaleTimeString()}
                            </p>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2 border text-center">
                        {p.status === "PENDING" ? (
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleApprove(p._id)}
                              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-all font-bold shadow-sm"
                            >
                              Approve
                            </button>
                            {/* Rejection logic can be added later if needed */}
                          </div>
                        ) : p.status === "APPROVED" ? (
                          <span className="text-green-600 font-bold italic">Active</span>
                        ) : (
                          <span className="text-gray-400">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
