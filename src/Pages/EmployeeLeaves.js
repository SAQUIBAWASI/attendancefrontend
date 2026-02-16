// import axios from "axios";
// import { useEffect, useState } from "react";
// import EmployeeSidebar from "../Components/EmployeeSidebar";
// import Navbar from "../Components/Navbar";

// const EmployeeLeaves = () => {
//   const [leaves, setLeaves] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     // Log all localStorage keys and values
//     console.log("✅ LocalStorage contents:");
//     for (let i = 0; i < localStorage.length; i++) {
//       const key = localStorage.key(i);
//       const value = localStorage.getItem(key);
//       console.log(`${key}: ${value}`);
//     }

//     // Get employeeData object from localStorage
//     const employeeDataRaw = localStorage.getItem("employeeData");
//     if (!employeeDataRaw) {
//       setError("❌ Employee data not found in localStorage.");
//       setLoading(false);
//       return;
//     }

//     let employeeId = null;
//     try {
//       const employeeData = JSON.parse(employeeDataRaw);
//       employeeId = employeeData.employeeId;
//       console.log("✅ employeeId from localStorage:", employeeId);
//     } catch (err) {
//       console.error("❌ Failed to parse employeeData:", err);
//       setError("❌ Invalid employee data in localStorage.");
//       setLoading(false);
//       return;
//     }

//     if (!employeeId) {
//       setError("❌ Employee ID not found in employeeData.");
//       setLoading(false);
//       return;
//     }

//     const fetchLeaves = async () => {
//       try {
//         const resp = await axios.get(
//           `https://api.timelyhealth.inapi/leaves/employeeleaves/${employeeId}`
//         );

//         if (resp.data && resp.data.success) {
//           setLeaves(resp.data.records);
//         } else {
//           setError("❌ Unexpected API response.");
//         }
//       } catch (err) {
//         console.error(err);
//         setError("❌ Failed to fetch leaves.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchLeaves();
//   }, []);

//   if (loading) return <p className="p-4">Loading...</p>;
//   if (error) return <p className="p-4 text-red-600">{error}</p>;

//   return (
//     <div className="flex min-h-screen bg-gray-100">
//       {/* Sidebar */}
//       <EmployeeSidebar />

//       {/* Main content */}
//       <div className="flex flex-col flex-1">
//         {/* Navbar */}
//         <Navbar />

//         {/* Page content */}
//         <main className="p-6">
//           <div className="max-w-5xl p-6 mx-auto bg-white rounded shadow-md">
//             <h2 className="mb-4 text-2xl font-bold text-blue-900">My Leave Requests</h2>
//             {leaves.length === 0 ? (
//               <p className="text-gray-500">No leave records found.</p>
//             ) : (
//               <div className="overflow-x-auto">
//                 <table className="w-full text-sm border">
//                   <thead className="text-gray-700 bg-gray-200">
//                     <tr>
//                       <th className="p-2 border">Leave Type</th>
//                       <th className="p-2 border">Start Date</th>
//                       <th className="p-2 border">End Date</th>
//                       <th className="p-2 border">Days</th>
//                       <th className="p-2 border">Reason</th>
//                       <th className="p-2 border">Status</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {leaves.map((leave) => (
//                       <tr key={leave._id} className="border-b hover:bg-gray-50">
//                         <td className="p-2 capitalize border">{leave.leaveType}</td>
//                         <td className="p-2 border">
//                           {new Date(leave.startDate).toLocaleDateString()}
//                         </td>
//                         <td className="p-2 border">
//                           {new Date(leave.endDate).toLocaleDateString()}
//                         </td>
//                         <td className="p-2 border">{leave.days}</td>
//                         <td className="p-2 border">{leave.reason}</td>
//                         <td className="p-2 border">
//                           <span
//                             className={`px-2 py-1 rounded text-xs font-semibold ${
//                               leave.status === "approved"
//                                 ? "bg-green-200 text-green-800"
//                                 : leave.status === "rejected"
//                                 ? "bg-red-200 text-red-800"
//                                 : "bg-yellow-200 text-yellow-800"
//                             }`}
//                           >
//                             {leave.status}
//                           </span>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default EmployeeLeaves;






import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";


const EmployeeLeaves = () => {
  const navigate = useNavigate();
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  // Modal & Form State
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [submittingLeave, setSubmittingLeave] = useState(false);
  const [leaveFormData, setLeaveFormData] = useState({
    employeeId: "",
    employeeName: "",
    leaveType: "casual",
    startDate: "",
    endDate: "",
    days: 0,
    reason: "",
  });

  useEffect(() => {
    const employeeDataRaw = localStorage.getItem("employeeData");
    if (!employeeDataRaw) {
      setError("❌ Employee data not found in localStorage.");
      setLoading(false);
      return;
    }

    let employeeId = null;
    try {
      const employeeData = JSON.parse(employeeDataRaw);
      employeeId = employeeData.employeeId;
    } catch (err) {
      setError("❌ Invalid employee data in localStorage.");
      setLoading(false);
      return;
    }

    if (!employeeId) {
      setError("❌ Employee ID not found in employeeData.");
      setLoading(false);
      return;
    }

    const fetchLeaves = async () => {
      try {
        const resp = await axios.get(
          `${API_BASE_URL}/leaves/employeeleaves/${employeeId}`
        );

        if (resp.data && resp.data.success) {
          setLeaves(resp.data.records);
          setFilteredLeaves(resp.data.records);
        } else {
          setError("❌ Unexpected API response.");
        }
      } catch (err) {
        setError("❌ Failed to fetch leaves.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaves();
  }, []);

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setSelectedMonth("");

    if (!date) {
      setFilteredLeaves(leaves);
      return;
    }

    const filtered = leaves.filter((l) => {
      const leaveDate = new Date(l.startDate).toISOString().split("T")[0];
      return leaveDate === date;
    });

    setFilteredLeaves(filtered);
  };

  const handleMonthChange = (e) => {
    const month = e.target.value;
    setSelectedMonth(month);
    setSelectedDate("");

    if (!month) {
      setFilteredLeaves(leaves);
      return;
    }

    const [year, monthNum] = month.split("-");
    const filtered = leaves.filter((l) => {
      const d = new Date(l.startDate);
      return (
        d.getFullYear() === parseInt(year) &&
        d.getMonth() + 1 === parseInt(monthNum)
      );
    });

    setFilteredLeaves(filtered);
  };

  // Handle Form Change & Date Calculation
  const handleLeaveChange = (e) => {
    const { name, value } = e.target;
    setLeaveFormData((prev) => {
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

  // Handle Leave Submit
  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    setSubmittingLeave(true);

    const rawData = localStorage.getItem("employeeData");
    let employeeData = null;
    try { if (rawData) employeeData = JSON.parse(rawData); } catch (e) { }

    const id = leaveFormData.employeeId || employeeData?.employeeId || localStorage.getItem("employeeId");
    const name = leaveFormData.employeeName || employeeData?.name || localStorage.getItem("employeeName") || employeeData?.employeeName;

    if (!id) {
      alert("❌ Employee details missing. Please re-login.");
      setSubmittingLeave(false);
      return;
    }

    const payload = {
      ...leaveFormData,
      employeeId: id,
      employeeName: name
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/leaves/add-leave`, payload);
      if (response.status === 201) {
        alert("✅ Leave application submitted successfully!");
        setLeaveFormData({
          employeeId: "",
          employeeName: "",
          leaveType: "casual",
          startDate: "",
          endDate: "",
          days: 0,
          reason: "",
        });
        setIsLeaveModalOpen(false);
        // Refresh leaves list
        window.location.reload();
      }
    } catch (error) {
      alert(error.response?.data?.message || "❌ Failed to submit leave application.");
    } finally {
      setSubmittingLeave(false);
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">


      {/* Page content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl p-6 mx-auto bg-white rounded-lg shadow-md">
          <div className="flex flex-col gap-4 mb-6 md:flex-row md:justify-between md:items-center">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-blue-900">
                My Leave Requests
              </h2>
              <button
                onClick={() => setIsLeaveModalOpen(true)}
                className="px-4 py-2 text-sm font-bold text-white transition-all bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700"
              >
                + Apply Leave
              </button>
            </div>

            <div className="flex flex-col items-stretch w-full gap-3 sm:flex-row md:items-center md:w-auto">
              {/* <button
                onClick={() => navigate("/employeedashboard")}
                className="w-full px-5 py-2 font-medium text-white transition-all bg-blue-600 rounded-lg sm:w-auto hover:bg-blue-700"
              >
                ← Back to Dashboard
              </button> */}

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex flex-col">
                  <label className="mb-1 text-sm text-gray-600">
                    Filter by Date:
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    className="w-full p-2 border rounded sm:w-auto"
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
                    className="w-full p-2 border rounded sm:w-auto"
                  />
                </div>
              </div>
            </div>
          </div>

          {filteredLeaves.length === 0 ? (
            <p className="text-gray-500">No leave records found.</p>
          ) : (
            <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
              <table className="min-w-full">
                <thead className="text-sm text-left text-white bg-gradient-to-r from-purple-500 to-blue-600">
                  <tr>
                    <th className="px-4 py-2">Leave Type</th>
                    <th className="px-4 py-2">Start Date</th>
                    <th className="px-4 py-2">End Date</th>
                    <th className="px-4 py-2">Days</th>
                    <th className="px-4 py-2">Reason</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaves.map((leave) => (
                    <tr
                      key={leave._id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="p-2 capitalize border">{leave.leaveType}</td>
                      <td className="p-2 border">
                        {new Date(leave.startDate).toLocaleDateString()}
                      </td>
                      <td className="p-2 border">
                        {new Date(leave.endDate).toLocaleDateString()}
                      </td>
                      <td className="p-2 border">{leave.days}</td>
                      <td className="p-2 border">{leave.reason}</td>
                      <td className="p-2 border">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${leave.status === "approved"
                            ? "bg-green-200 text-green-800"
                            : leave.status === "rejected"
                              ? "bg-red-200 text-red-800"
                              : "bg-yellow-200 text-yellow-800"
                            }`}
                        >
                          {leave.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Apply Leave Modal */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Apply for Leave</h3>
              <button onClick={() => setIsLeaveModalOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            <form onSubmit={handleLeaveSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Leave Type</label>
                <select name="leaveType" value={leaveFormData.leaveType} onChange={handleLeaveChange} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required>
                  <option value="casual">Casual</option>
                  <option value="sick">Sick</option>
                  <option value="earned">Earned</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Start Date</label>
                  <input name="startDate" type="date" value={leaveFormData.startDate} onChange={handleLeaveChange} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">End Date</label>
                  <input name="endDate" type="date" value={leaveFormData.endDate} onChange={handleLeaveChange} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Total Days</label>
                <input name="days" type="number" value={leaveFormData.days} readOnly className="w-full p-2 bg-gray-100 border rounded-lg outline-none" placeholder="0" />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Reason</label>
                <textarea name="reason" value={leaveFormData.reason} onChange={handleLeaveChange} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" rows="3" placeholder="Reason for leave" required></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsLeaveModalOpen(false)} className="flex-1 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                <button type="submit" disabled={submittingLeave} className="flex-1 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">{submittingLeave ? "Applying..." : "Apply Leave"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeLeaves;

