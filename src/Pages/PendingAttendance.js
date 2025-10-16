import axios from "axios";
import { useEffect, useState } from "react";
import { FaCheckCircle, FaInfoCircle, FaTimesCircle } from "react-icons/fa";

const PendingAttendanceRequests = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const resp = await axios.get("https://attendancebackend-5cgn.onrender.com/api/leaves/pendingleaves");
      if (resp.data && resp.data.records) {
        setRequests(resp.data.records);
      } else {
        console.error("Unexpected API response:", resp.data);
      }
    } catch (err) {
      console.error("Error fetching pending attendance:", err);
    }
  };

  const updateRequestStatus = async (id, newStatus) => {
    try {
      await axios.put(`https://attendancebackend-5cgn.onrender.com/api/attendance/update/${id}`, { status: newStatus });
      alert(`✅ Request ${newStatus.toLowerCase()} successfully!`);
      fetchPendingRequests(); // Refresh
    } catch (err) {
      console.error("Error updating request:", err);
      alert("❌ Failed to update request");
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Pending Attendance Requests</h2>

      <div className="overflow-x-auto">
        <table className="w-full border text-sm">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="p-2 border">Employee</th>
              <th className="p-2 border">Leave Type</th>
              <th className="p-2 border">Start Date</th>
              <th className="p-2 border">End Date</th>
              <th className="p-2 border">Days</th>
              <th className="p-2 border">Reason</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.length > 0 ? (
              requests.map((rec) => (
                <tr key={rec._id} className="hover:bg-gray-50 border-b">
                  <td className="p-2 border font-medium">{rec.employeeName}</td>
                  <td className="p-2 border capitalize">{rec.leaveType}</td>
                  <td className="p-2 border">{new Date(rec.startDate).toLocaleDateString()}</td>
                  <td className="p-2 border">{new Date(rec.endDate).toLocaleDateString()}</td>
                  <td className="p-2 border">{rec.days}</td>
                  <td className="p-2 border">{rec.reason}</td>
                  <td className="p-2 border">
                    <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-xs font-semibold">
                      {rec.status}
                    </span>
                  </td>
                  <td className="p-2 border flex gap-2 justify-center text-lg">
                    <button
                      title="Approve"
                      onClick={() => updateRequestStatus(rec._id, "Approved")}
                      className="text-green-600 hover:text-green-800"
                    >
                      <FaCheckCircle />
                    </button>
                    <button
                      title="Reject"
                      onClick={() => updateRequestStatus(rec._id, "Rejected")}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTimesCircle />
                    </button>
                    <button
                      title="View Info"
                      onClick={() => alert(`Details:\n${JSON.stringify(rec, null, 2)}`)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaInfoCircle />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="p-4 text-center text-gray-500">
                  No pending requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PendingAttendanceRequests;
