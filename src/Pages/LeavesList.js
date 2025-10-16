// src/pages/LeavesList.jsx
import axios from "axios";
import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";

const LeavesList = () => {
  const [leaves, setLeaves] = useState([]);
  const [editingRecord, setEditingRecord] = useState(null);
  const [updatedStatus, setUpdatedStatus] = useState("");

  const fetchLeaves = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/leaves/leaves");
      setLeaves(res.data.records || res.data); // adapt if API returns { records: [...] }
    } catch (err) {
      console.error("Failed to fetch leaves:", err);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleEdit = (rec) => {
    setEditingRecord(rec);
    setUpdatedStatus(rec.status);
  };

  const handleUpdateStatus = async () => {
    if (!["pending", "approved", "rejected"].includes(updatedStatus)) {
      alert("Status must be Pending, Approved, or Rejected");
      return;
    }
    try {
      await axios.put(
        `http://localhost:5000/api/leaves/updateleaves/${editingRecord._id}`,
        { status: updatedStatus }
      );
      alert(`Leave ${updatedStatus}`);
      setEditingRecord(null);
      fetchLeaves();
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update leave status");
    }
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded-lg shadow-md mt-6">
      <h1 className="text-3xl font-bold text-center mb-6">Leave Requests</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-2 border">Employee</th>
              <th className="px-4 py-2 border">Leave Type</th>
              <th className="px-4 py-2 border">Start Date</th>
              <th className="px-4 py-2 border">End Date</th>
              <th className="px-4 py-2 border">Days</th>
              <th className="px-4 py-2 border">Reason</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaves.length > 0 ? (
              leaves.map((l) => (
                <tr key={l._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{l.employeeName}</td>
                  <td className="px-4 py-2 capitalize">{l.leaveType}</td>
                  <td className="px-4 py-2">
                    {new Date(l.startDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    {new Date(l.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">{l.days}</td>
                  <td className="px-4 py-2">{l.reason}</td>
                  <td className={`px-4 py-2 rounded-full text-center font-semibold ${getStatusClass(l.status)}`}>
                    {l.status}
                  </td>
                  <td className="px-4 py-2 flex gap-2 justify-center">
                    <button
                      onClick={() => handleEdit(l)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-6 text-gray-500">
                  No leave requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md relative">
            <button
              onClick={() => setEditingRecord(null)}
              className="absolute top-3 right-3 text-gray-600 hover:text-black"
            >
              <FaTimes />
            </button>
            <h2 className="text-xl font-bold mb-4">Edit Leave Status</h2>
            <p className="mb-2">
              <strong>Employee:</strong> {editingRecord.employeeName}
            </p>
            <p className="mb-4">
              <strong>Leave Type:</strong> {editingRecord.leaveType}
            </p>
            <select
              value={updatedStatus}
              onChange={(e) => setUpdatedStatus(e.target.value)}
              className="w-full px-3 py-2 border rounded mb-4"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleUpdateStatus}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
              >
                Save
              </button>
              <button
                onClick={() => setEditingRecord(null)}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeavesList;
