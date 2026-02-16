// import axios from "axios";
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// // import EmployeeSidebar from "../Components/EmployeeSidebar";


// const EmployeeShift = () => {
//   const navigate = useNavigate();
//   const [shift, setShift] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [status, setStatus] = useState("");

//   const employeeDataRaw = localStorage.getItem("employeeData");
//   let employeeId = null;
//   if (employeeDataRaw) {
//     try {
//       const employeeData = JSON.parse(employeeDataRaw);
//       employeeId = employeeData.employeeId;
//     } catch (err) {
//       console.error("Invalid employee data in localStorage.");
//     }
//   }

//   useEffect(() => {
//     const fetchShift = async () => {
//       if (!employeeId) {
//         setError("❌ Employee not logged in. Please login first.");
//         setLoading(false);
//         return;
//       }

//       try {
//         setLoading(true);
//         const res = await axios.get(
//           `https://api.timelyhealth.in/api/shifts/employee/${employeeId}`
//         );

//         if (res.data) {
//           setShift(res.data);
//         } else {
//           setError("❌ No shift assigned yet. Please contact admin.");
//         }
//       } catch (err) {
//         console.error("Error fetching shift:", err);
//         setError("❌ Failed to fetch shift. Please contact admin.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchShift();
//   }, [employeeId]);

//   const determineShiftStatus = (shiftData) => {
//     if (!shiftData) return;
//     const now = new Date();
//     const [startH, startM] = shiftData.startTime.split(":").map(Number);
//     const [endH, endM] = shiftData.endTime.split(":").map(Number);

//     let startTime = new Date();
//     startTime.setHours(startH, startM, 0, 0);

//     let endTime = new Date();
//     endTime.setHours(endH, endM, 0, 0);

//     if (endTime <= startTime) {
//       endTime.setDate(endTime.getDate() + 1);
//     }

//     let newStatus = "";
//     if (now >= startTime && now <= endTime) {
//       newStatus = "Ongoing";
//     } else if (now < startTime) {
//       newStatus = "Upcoming";
//     } else {
//       newStatus = "Completed";
//     }

//     setStatus((prev) => (prev !== newStatus ? newStatus : prev));
//   };

//   useEffect(() => {
//     if (!shift) return;

//     determineShiftStatus(shift);

//     const interval = setInterval(() => {
//       determineShiftStatus(shift);
//     }, 60000);

//     return () => clearInterval(interval);
//   }, [shift]);

//   return (
//     <div className="flex min-h-screen bg-gray-100">

//       <div className="flex flex-col flex-1">


//         <main className="p-4 sm:p-6 lg:p-8">
//           <div className="max-w-5xl p-6 mx-auto bg-white rounded-lg shadow-md">
//             {/* Header + Back Button */}
//             <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:justify-between sm:items-center">
//               <h2 className="text-2xl font-bold text-blue-900">My Shift</h2>
//               {/* <button
//                 onClick={() => navigate("/employeedashboard")}
//                 className="w-full px-5 py-2 font-medium text-white transition-all bg-blue-600 rounded-lg sm:w-auto hover:bg-blue-700"
//               >
//                 ← Back to Dashboard
//               </button> */}
//             </div>

//             {loading ? (
//               <p className="text-gray-600">Loading your shift...</p>
//             ) : error ? (
//               <p className="text-red-600">{error}</p>
//             ) : !shift ? (
//               <p className="text-gray-500">
//                 No shift assigned yet. Please contact admin.
//               </p>
//             ) : (
//               <>
//                 {/* Desktop/Tablet Table */}
//                 <div className="hidden overflow-x-auto sm:block">
//                   <table className="w-full min-w-[500px] text-sm border">
//                     <thead className="text-gray-700 bg-gray-200">
//                       <tr>
//                         <th className="p-2 border">Shift Type</th>
//                         <th className="p-2 border">Start Time</th>
//                         <th className="p-2 border">End Time</th>
//                         <th className="p-2 border">Status</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       <tr className="border-b hover:bg-gray-50">
//                         <td className="p-2 border">{shift.shiftType}</td>
//                         <td className="p-2 border">{shift.startTime}</td>
//                         <td className="p-2 border">{shift.endTime}</td>
//                         <td className="p-2 border">
//                           <span
//                             className={`px-2 py-1 rounded text-xs font-semibold ${
//                               status === "Ongoing"
//                                 ? "bg-green-200 text-green-800"
//                                 : status === "Upcoming"
//                                 ? "bg-blue-200 text-blue-800"
//                                 : "bg-gray-200 text-gray-800"
//                             }`}
//                           >
//                             {status}
//                           </span>
//                         </td>
//                       </tr>
//                     </tbody>
//                   </table>
//                 </div>

//                 {/* Mobile Cards */}
//                 <div className="flex flex-col gap-4 sm:hidden">
//                   <div className="p-4 border rounded-lg shadow-sm bg-gray-50">
//                     <div className="flex items-center justify-between mb-2">
//                       <span className="font-medium text-gray-700">
//                         Shift Type
//                       </span>
//                       <span className="text-gray-900">{shift.shiftType}</span>
//                     </div>
//                     <div className="flex items-center justify-between mb-2">
//                       <span className="font-medium text-gray-700">Start</span>
//                       <span className="text-gray-900">{shift.startTime}</span>
//                     </div>
//                     <div className="flex items-center justify-between mb-2">
//                       <span className="font-medium text-gray-700">End</span>
//                       <span className="text-gray-900">{shift.endTime}</span>
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <span className="font-medium text-gray-700">Status</span>
//                       <span
//                         className={`px-2 py-1 rounded text-xs font-semibold ${
//                           status === "Ongoing"
//                             ? "bg-green-200 text-green-800"
//                             : status === "Upcoming"
//                             ? "bg-blue-200 text-blue-800"
//                             : "bg-gray-200 text-gray-800"
//                         }`}
//                       >
//                         {status}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </>
//             )}
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default EmployeeShift;

// EmployeeMyShift.js
// EmployeeShift.js - सिर्फ fetchShift function को update करें
// import axios from "axios";
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// const EmployeeShift = () => {
//   const navigate = useNavigate();
//   const [shift, setShift] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [status, setStatus] = useState("");

//   const employeeDataRaw = localStorage.getItem("employeeData");
//   let employeeId = null;
//   if (employeeDataRaw) {
//     try {
//       const employeeData = JSON.parse(employeeDataRaw);
//       employeeId = employeeData.employeeId;
//     } catch (err) {
//       console.error("Invalid employee data in localStorage.");
//     }
//   }

//   useEffect(() => {
//     const fetchShift = async () => {
//       if (!employeeId) {
//         setError("❌ Employee not logged in. Please login first.");
//         setLoading(false);
//         return;
//       }

//       try {
//         setLoading(true);
//         console.log("🔍 Fetching shift for employee:", employeeId);

//         const res = await axios.get(
//           `https://api.timelyhealth.in/api/shifts/employee/${employeeId}`
//         );

//         console.log("📱 API Response:", res.data); // Debug log

//         // ✅ FIX: Check response structure properly
//         if (res.data && res.data.success && res.data.data) {
//           setShift(res.data.data); // ✅ Now accessing res.data.data
//           console.log("✅ Shift data set:", res.data.data);
//         } else if (res.data && res.data.success === false) {
//           setError(res.data.message || "❌ No shift assigned yet.");
//         } else {
//           setError("❌ Invalid response from server");
//         }
//       } catch (err) {
//         console.error("❌ Error fetching shift:", err);
//         console.error("❌ Error details:", err.response?.data || err.message);
//         setError("❌ Failed to fetch shift. Please contact admin.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchShift();
//   }, [employeeId]);

//   // ✅ FIX: Update determineShiftStatus function
//   const determineShiftStatus = (shiftData) => {
//     if (!shiftData) return;

//     const now = new Date();

//     // ✅ Extract startTime and endTime from shiftData
//     const startTimeStr = shiftData.startTime || "10:00";
//     const endTimeStr = shiftData.endTime || "19:00";

//     console.log("⏰ Time check:", { startTimeStr, endTimeStr });

//     const [startH, startM] = startTimeStr.split(":").map(Number);
//     const [endH, endM] = endTimeStr.split(":").map(Number);

//     let startTime = new Date();
//     startTime.setHours(startH, startM, 0, 0);

//     let endTime = new Date();
//     endTime.setHours(endH, endM, 0, 0);

//     if (endTime <= startTime) {
//       endTime.setDate(endTime.getDate() + 1);
//     }

//     let newStatus = "";
//     if (now >= startTime && now <= endTime) {
//       newStatus = "Ongoing";
//     } else if (now < startTime) {
//       newStatus = "Upcoming";
//     } else {
//       newStatus = "Completed";
//     }

//     console.log("🔄 Status updated to:", newStatus);
//     setStatus((prev) => (prev !== newStatus ? newStatus : prev));
//   };

//   useEffect(() => {
//     if (!shift) return;

//     determineShiftStatus(shift);

//     const interval = setInterval(() => {
//       determineShiftStatus(shift);
//     }, 60000);

//     return () => clearInterval(interval);
//   }, [shift]);

//   return (
//     <div className="flex min-h-screen bg-gray-100">
//       <div className="flex flex-col flex-1">
//         <main className="p-4 sm:p-6 lg:p-8">
//           <div className="max-w-5xl p-6 mx-auto bg-white rounded-lg shadow-md">
//             {/* Header + Back Button */}
//             <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:justify-between sm:items-center">
//               <h2 className="text-2xl font-bold text-blue-900">My Shift</h2>
//             </div>

//             {loading ? (
//               <div className="flex items-center justify-center py-8">
//                 <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
//                 <p className="ml-3 text-gray-600">Loading your shift...</p>
//               </div>
//             ) : error ? (
//               <div className="p-4 border border-red-200 rounded-lg bg-red-50">
//                 <p className="font-medium text-red-600">{error}</p>
//                 <p className="mt-1 text-sm text-red-500">
//                   Please contact the administrator.
//                 </p>
//               </div>
//             ) : !shift ? (
//               <div className="py-8 text-center">
//                 <div className="mb-4 text-5xl text-gray-300">⏰</div>
//                 <h3 className="mb-2 text-xl font-semibold text-gray-600">No Shift Assigned</h3>
//                 <p className="text-gray-500">
//                   You have not been assigned any shift yet.
//                 </p>
//               </div>
//             ) : (
//               <>
//                 {/* Desktop/Tablet Table */}
//                 <div className="hidden mb-6 overflow-x-auto sm:block">
//                   <table className="w-full min-w-[500px] text-sm border">
//                     <thead className="text-gray-700 bg-gray-100">
//                       <tr>
//                         <th className="p-3 text-left border">Shift Type</th>
//                         <th className="p-3 text-left border">Shift Name</th>
//                         <th className="p-3 text-left border">Time Range</th>
//                         <th className="p-3 text-left border">Start Time</th>
//                         <th className="p-3 text-left border">End Time</th>
//                         <th className="p-3 text-left border">Status</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       <tr className="border-b hover:bg-gray-50">
//                         <td className="p-3 border">
//                           <span className="font-medium text-blue-700">
//                             {shift.shiftType}
//                           </span>
//                         </td>
//                         <td className="p-3 border">{shift.shiftName}</td>
//                         <td className="p-3 font-medium border">
//                           {shift.timeRange || `${shift.startTime} - ${shift.endTime}`}
//                         </td>
//                         <td className="p-3 border">{shift.startTime}</td>
//                         <td className="p-3 border">{shift.endTime}</td>
//                         <td className="p-3 border">
//                           <span
//                             className={`px-3 py-1 rounded text-sm font-semibold ${
//                               status === "Ongoing"
//                                 ? "bg-green-100 text-green-800 border border-green-200"
//                                 : status === "Upcoming"
//                                 ? "bg-blue-100 text-blue-800 border border-blue-200"
//                                 : "bg-gray-100 text-gray-800 border border-gray-200"
//                             }`}
//                           >
//                             {status}
//                           </span>
//                         </td>
//                       </tr>
//                     </tbody>
//                   </table>
//                 </div>

//                 {/* Mobile Cards */}
//                 <div className="flex flex-col gap-4 sm:hidden">
//                   <div className="p-5 bg-white border rounded-lg shadow-sm">
//                     <div className="flex items-center justify-between pb-3 mb-4 border-b">
//                       <h3 className="text-lg font-bold text-blue-900">Shift Details</h3>
//                       <span
//                         className={`px-3 py-1 rounded text-xs font-semibold ${
//                           status === "Ongoing"
//                             ? "bg-green-100 text-green-800"
//                             : status === "Upcoming"
//                             ? "bg-blue-100 text-blue-800"
//                             : "bg-gray-100 text-gray-800"
//                         }`}
//                       >
//                         {status}
//                       </span>
//                     </div>

//                     <div className="space-y-3">
//                       <div className="flex items-center justify-between">
//                         <span className="font-medium text-gray-700">Shift Type</span>
//                         <span className="font-medium text-gray-900">{shift.shiftType}</span>
//                       </div>
//                       <div className="flex items-center justify-between">
//                         <span className="font-medium text-gray-700">Shift Name</span>
//                         <span className="text-gray-900">{shift.shiftName}</span>
//                       </div>
//                       <div className="flex items-center justify-between">
//                         <span className="font-medium text-gray-700">Time Range</span>
//                         <span className="font-medium text-gray-900">
//                           {shift.timeRange || `${shift.startTime} - ${shift.endTime}`}
//                         </span>
//                       </div>
//                       <div className="flex items-center justify-between">
//                         <span className="font-medium text-gray-700">Start Time</span>
//                         <span className="text-gray-900">{shift.startTime}</span>
//                       </div>
//                       <div className="flex items-center justify-between">
//                         <span className="font-medium text-gray-700">End Time</span>
//                         <span className="text-gray-900">{shift.endTime}</span>
//                       </div>
//                       <div className="flex items-center justify-between">
//                         <span className="font-medium text-gray-700">Description</span>
//                         <span className="text-right text-gray-900">
//                           {shift.description || "Shift timing"}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </>
//             )}
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default EmployeeShift;

import axios from "axios";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";

const EmployeeShift = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusUpdates, setStatusUpdates] = useState({});

  // Get employee ID from localStorage
  const employeeDataRaw = localStorage.getItem("employeeData");
  let employeeId = null;
  if (employeeDataRaw) {
    try {
      const employeeData = JSON.parse(employeeDataRaw);
      employeeId = employeeData.employeeId;
    } catch (err) {
      console.error("Invalid employee data in localStorage.");
    }
  }

  // Fetch shifts data
  useEffect(() => {
    const fetchShifts = async () => {
      if (!employeeId) {
        setError("❌ Employee not logged in. Please login first.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await axios.get(
          `${API_BASE_URL}/shifts/employee/${employeeId}`
        );

        if (res.data && res.data.success && res.data.data) {
          const shiftData = Array.isArray(res.data.data) ? res.data.data : [res.data.data];
          setShifts(shiftData);
          console.log("✅ Shift data loaded:", shiftData);
        } else if (res.data && res.data.success === false) {
          setError(res.data.message || "❌ No shifts assigned yet.");
        } else {
          setError("❌ Invalid response from server");
        }
      } catch (err) {
        console.error("❌ Error fetching shifts:", err);
        setError("❌ Failed to fetch shifts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchShifts();
  }, [employeeId]);

  // Determine shift status for each shift
  const determineShiftStatus = (shift) => {
    if (!shift) return "Not Available";

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const shiftDate = shift.date || today;

    const startTimeStr = shift.startTime || "10:00";
    const endTimeStr = shift.endTime || "19:00";

    const [startH, startM] = startTimeStr.split(":").map(Number);
    const [endH, endM] = endTimeStr.split(":").map(Number);

    let startTime = new Date(shiftDate);
    startTime.setHours(startH, startM, 0, 0);

    let endTime = new Date(shiftDate);
    endTime.setHours(endH, endM, 0, 0);

    if (endTime <= startTime) {
      endTime.setDate(endTime.getDate() + 1);
    }

    if (now >= startTime && now <= endTime) {
      return "Ongoing";
    } else if (now < startTime) {
      return "Upcoming";
    } else {
      return "Completed";
    }
  };

  // Update status for all shifts
  useEffect(() => {
    if (shifts.length === 0) return;

    const updates = {};
    shifts.forEach((shift, index) => {
      updates[index] = determineShiftStatus(shift);
    });
    setStatusUpdates(updates);

    const interval = setInterval(() => {
      const newUpdates = {};
      shifts.forEach((shift, index) => {
        newUpdates[index] = determineShiftStatus(shift);
      });
      setStatusUpdates(newUpdates);
    }, 60000);

    return () => clearInterval(interval);
  }, [shifts]);

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl p-6 mx-auto bg-white rounded-lg shadow-md">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-blue-900">
              My Shift Schedule
            </h2>
          </div>

          {shifts.length === 0 ? (
            <div className="py-8 text-center">
              <div className="mb-4 text-5xl text-gray-300">⏰</div>
              <h3 className="mb-2 text-xl font-semibold text-gray-600">No Shifts Assigned</h3>
              <p className="text-gray-500">
                You have not been assigned any shifts yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
              <table className="min-w-full">
                <thead className="text-sm text-left text-white bg-gradient-to-r from-purple-500 to-blue-600">
                  <tr>
                    <th className="px-4 py-2">Shift Type</th>
                    <th className="px-4 py-2">Shift Name</th>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Time Range</th>
                    <th className="px-4 py-2">Start Time</th>
                    <th className="px-4 py-2">End Time</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {shifts.map((shift, index) => (
                    <tr
                      key={shift._id || index}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="p-2 capitalize border">{shift.shiftType}</td>
                      <td className="p-2 border">{shift.shiftName}</td>
                      <td className="p-2 border">
                        {shift.date ? new Date(shift.date).toLocaleDateString() : "Daily"}
                      </td>
                      <td className="p-2 font-medium border">
                        {shift.timeRange || `${shift.startTime} - ${shift.endTime}`}
                      </td>
                      <td className="p-2 border">{shift.startTime}</td>
                      <td className="p-2 border">{shift.endTime}</td>
                      <td className="p-2 border">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${statusUpdates[index] === "Ongoing"
                              ? "bg-green-200 text-green-800"
                              : statusUpdates[index] === "Upcoming"
                                ? "bg-blue-200 text-blue-800"
                                : "bg-gray-200 text-gray-800"
                            }`}
                        >
                          {statusUpdates[index] || "Checking..."}
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
    </div>
  );
};

export default EmployeeShift;
