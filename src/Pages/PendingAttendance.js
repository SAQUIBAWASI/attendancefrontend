// import axios from "axios";
// import { useEffect, useState } from "react";
// import { FaCheckCircle, FaInfoCircle, FaTimesCircle } from "react-icons/fa";

// const PendingAttendanceRequests = () => {
//   const [requests, setRequests] = useState([]);

//   useEffect(() => {
//     fetchPendingRequests();
//   }, []);

//   const fetchPendingRequests = async () => {
//     try {
//       const resp = await axios.get("https://attendancebackend-5cgn.onrender.com/api/leaves/pendingleaves");
//       const INACTIVE_EMPLOYEE_IDS = ['EMP002', 'EMP003', 'EMP004', 'EMP008', 'EMP010', 'EMP018', 'EMP019'];
//       if (resp.data && resp.data.records) {
//         // Assuming 'employeeId' or 'employee' field exists in the records for filtering
//         // If not, you might need to adjust the filtering logic based on available fields like employeeName
//         const activeRequests = resp.data.records.filter(record => 
//           !INACTIVE_EMPLOYEE_IDS.includes(record.employeeId) && 
//           !INACTIVE_EMPLOYEE_IDS.includes(record.employee)
//         );
//         setRequests(activeRequests);
//       } else {
//         console.error("Unexpected API response:", resp.data);
//       }
//     } catch (err) {
//       console.error("Error fetching pending attendance:", err);
//     }
//   };

//   const updateRequestStatus = async (id, newStatus) => {
//     try {
//       await axios.put(`https://attendancebackend-5cgn.onrender.com/api/attendance/update/${id}`, { status: newStatus });
//       alert(`✅ Request ${newStatus.toLowerCase()} successfully!`);
//       fetchPendingRequests(); // Refresh
//     } catch (err) {
//       console.error("Error updating request:", err);
//       alert("❌ Failed to update request");
//     }
//   };

//   return (
//     <div className="p-6 bg-white rounded-lg shadow-md">
//       <h2 className="mb-4 text-2xl font-bold">Pending Attendance Requests</h2>

//       <div className="overflow-x-auto">
//         <table className="w-full text-sm border">
//           <thead className="text-gray-700 bg-gray-200">
//             <tr>
//               <th className="p-2 border">Employee</th>
//               <th className="p-2 border">Leave Type</th>
//               <th className="p-2 border">Start Date</th>
//               <th className="p-2 border">End Date</th>
//               <th className="p-2 border">Days</th>
//               <th className="p-2 border">Reason</th>
//               <th className="p-2 border">Status</th>
//               <th className="p-2 border">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {requests.length > 0 ? (
//               requests.map((rec) => (
//                 <tr key={rec._id} className="border-b hover:bg-gray-50">
//                   <td className="p-2 font-medium border">{rec.employeeName}</td>
//                   <td className="p-2 capitalize border">{rec.leaveType}</td>
//                   <td className="p-2 border">{new Date(rec.startDate).toLocaleDateString()}</td>
//                   <td className="p-2 border">{new Date(rec.endDate).toLocaleDateString()}</td>
//                   <td className="p-2 border">{rec.days}</td>
//                   <td className="p-2 border">{rec.reason}</td>
//                   <td className="p-2 border">
//                     <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-200 rounded">
//                       {rec.status}
//                     </span>
//                   </td>
//                   <td className="flex justify-center gap-2 p-2 text-lg border">
//                     <button
//                       title="Approve"
//                       onClick={() => updateRequestStatus(rec._id, "Approved")}
//                       className="text-green-600 hover:text-green-800"
//                     >
//                       <FaCheckCircle />
//                     </button>
//                     <button
//                       title="Reject"
//                       onClick={() => updateRequestStatus(rec._id, "Rejected")}
//                       className="text-red-600 hover:text-red-800"
//                     >
//                       <FaTimesCircle />
//                     </button>
//                     <button
//                       title="View Info"
//                       onClick={() => alert(`Details:\n${JSON.stringify(rec, null, 2)}`)}
//                       className="text-blue-600 hover:text-blue-800"
//                     >
//                       <FaInfoCircle />
//                     </button>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="8" className="p-4 text-center text-gray-500">
//                   No pending requests found.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default PendingAttendanceRequests;


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
      const res = await axios.get("https://attendancebackend-5cgn.onrender.com/api/leaves/leaves");
      const INACTIVE_EMPLOYEE_IDS = ['EMP002', 'EMP003', 'EMP004', 'EMP008', 'EMP010', 'EMP018', 'EMP019'];
      const rawRecords = res.data.records || res.data;
      const activeLeaves = rawRecords.filter(l => !INACTIVE_EMPLOYEE_IDS.includes(l.employeeId));
      setLeaves(activeLeaves);
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
        `https://attendancebackend-5cgn.onrender.com/api/leaves/updateleaves/${editingRecord._id}`,
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
    <div className="max-w-6xl p-6 mx-auto mt-6 bg-white rounded-lg shadow-md">
      <h1 className="mb-6 text-3xl font-bold text-center">Leave Requests</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border border-gray-300">
          <thead className="text-gray-700 bg-gray-100">
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
                  <td className="flex justify-center gap-2 px-4 py-2">
                    <button
                      onClick={() => handleEdit(l)}
                      className="px-3 py-1 text-white transition bg-blue-600 rounded hover:bg-blue-700"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="py-6 text-center text-gray-500">
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
          <div className="relative w-full max-w-md p-6 bg-white rounded-lg">
            <button
              onClick={() => setEditingRecord(null)}
              className="absolute text-gray-600 top-3 right-3 hover:text-black"
            >
              <FaTimes />
            </button>
            <h2 className="mb-4 text-xl font-bold">Edit Leave Status</h2>
            <p className="mb-2">
              <strong>Employee:</strong> {editingRecord.employeeName}
            </p>
            <p className="mb-4">
              <strong>Leave Type:</strong> {editingRecord.leaveType}
            </p>
            <select
              value={updatedStatus}
              onChange={(e) => setUpdatedStatus(e.target.value)}
              className="w-full px-3 py-2 mb-4 border rounded"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleUpdateStatus}
                className="px-4 py-2 text-white transition bg-green-600 rounded hover:bg-green-700"
              >
                Save
              </button>
              <button
                onClick={() => setEditingRecord(null)}
                className="px-4 py-2 text-white transition bg-gray-400 rounded hover:bg-gray-500"
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