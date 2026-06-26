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
//                 className="w-full px-5 py-2 font-medium text-gray-900 transition-all bg-blue-600 rounded-lg sm:w-auto hover:bg-blue-700"
//               >
//                 ← Back to Dashboard
//               </button> */}
//             </div>

//             {loading ? (
//               <p className="text-gray-500">Loading your shift...</p>
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
//                       <tr className="border-b hover:bg-white">
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
//                                 : "bg-gray-200 text-gray-700"
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
//                   <div className="p-4 border rounded-lg shadow-sm bg-white">
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
//                             : "bg-gray-200 text-gray-700"
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
//                 <p className="ml-3 text-gray-500">Loading your shift...</p>
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
//                 <div className="mb-4 text-5xl text-gray-700">⏰</div>
//                 <h3 className="mb-2 text-xl font-semibold text-gray-500">No Shift Assigned</h3>
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
//                       <tr className="border-b hover:bg-white">
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
//                                 ? "bg-emerald-50 text-emerald-700 border border-green-200"
//                                 : status === "Upcoming"
//                                 ? "bg-blue-50 text-blue-700 border border-blue-200"
//                                 : "bg-gray-100 text-gray-700 border border-gray-200"
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
//                             ? "bg-emerald-50 text-emerald-700"
//                             : status === "Upcoming"
//                             ? "bg-blue-50 text-blue-700"
//                             : "bg-gray-100 text-gray-700"
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
import { useEffect, useMemo, useState } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import { FiClock, FiCalendar, FiCheckCircle } from "react-icons/fi";
import { API_BASE_URL } from "../config";
import "./EmployeeDashboard.css";
import "./EmployeeLeaves.css";

const parseTimeParts = (timeStr) => {
  if (!timeStr) return [10, 0];
  const trimmed = timeStr.trim();
  const ampmMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (ampmMatch) {
    let hours = Number(ampmMatch[1]);
    const minutes = Number(ampmMatch[2]);
    const period = ampmMatch[3].toUpperCase();
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return [hours, minutes];
  }
  const [hours, minutes] = trimmed.split(":").map(Number);
  return [hours || 10, minutes || 0];
};

const formatDate = (dateValue) => {
  if (!dateValue) return "Daily";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Daily";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const buildShiftList = (shiftData) => {
  if (!shiftData) return [];

  const shiftsList = [
    {
      ...shiftData,
      shiftPeriod: "Current",
      date: shiftData.effectiveFrom || shiftData.assignedDate || null,
    },
  ];

  const scheduled = shiftData.scheduledChange;
  if (scheduled?.shiftType) {
    const timeRange = scheduled.selectedTimeRange || "";
    const [startTime, endTime] = timeRange.split(" - ");
    shiftsList.push({
      _id: `${shiftData._id}-upcoming`,
      shiftType: scheduled.shiftType,
      shiftName: scheduled.shiftName || `Shift ${scheduled.shiftType}`,
      shiftCategory: scheduled.shiftCategory || shiftData.shiftCategory,
      startTime: startTime?.trim() || "",
      endTime: endTime?.trim() || "",
      timeRange,
      description: scheduled.selectedDescription,
      date: scheduled.effectiveFrom,
      isBrakeShift: scheduled.isBrakeShift,
      shiftPeriod: "Upcoming",
      isScheduled: true,
    });
  }

  return shiftsList;
};

const EmployeeShift = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusUpdates, setStatusUpdates] = useState({});

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

        if (res.data?.success && res.data.data) {
          setShifts(buildShiftList(res.data.data));
        } else if (res.data?.success === false) {
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

  const determineShiftStatus = (shift) => {
    if (!shift) return "Not Available";
    if (shift.isScheduled) return "Scheduled";

    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const shiftDate = shift.date
      ? new Date(shift.date).toISOString().split("T")[0]
      : today;

    const [startH, startM] = parseTimeParts(shift.startTime);
    const [endH, endM] = parseTimeParts(shift.endTime);

    let startTime = new Date(shiftDate);
    startTime.setHours(startH, startM, 0, 0);

    let endTime = new Date(shiftDate);
    endTime.setHours(endH, endM, 0, 0);

    if (endTime <= startTime) {
      endTime.setDate(endTime.getDate() + 1);
    }

    if (now >= startTime && now <= endTime) return "Ongoing";
    if (now < startTime) return "Upcoming";
    return "Completed";
  };

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

  const getStatusClass = (status) => {
    if (status === "Ongoing") return "bg-green-200 text-green-800";
    if (status === "Upcoming" || status === "Scheduled") return "bg-blue-200 text-blue-800";
    return "bg-gray-200 text-gray-700";
  };

  const summary = useMemo(() => {
    const statuses = Object.values(statusUpdates);
    const ongoing = statuses.filter((s) => s === "Ongoing").length;
    const upcoming = shifts.filter((s) => s.shiftPeriod === "Upcoming").length;
    const scheduled = statuses.filter((s) => s === "Scheduled").length;
    return { ongoing, upcoming, scheduled };
  }, [shifts, statusUpdates]);

  if (loading) {
    return (
      <div className="emp-dash">
        <div className="emp-dash__loading">
          <div className="emp-dash__spinner" />
          <p className="emp-dash__loading-text">Loading your shifts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="emp-dash">
        <main style={{ display: "grid", placeItems: "center", minHeight: "60vh", padding: "1rem" }}>
          <div className="emp-dash__card" style={{ maxWidth: 520, width: "100%" }}>
            <div className="emp-dash__card-header">
              <div>
                <h3 className="emp-dash__card-title">Couldn’t load shifts</h3>
                <p className="emp-dash__card-desc">{error}</p>
              </div>
              <button type="button" className="emp-dash__card-link" onClick={() => window.location.reload()}>
                Retry
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="emp-dash">
      <main>
        <div className="emp-dash__header">
          <div>
            <h1 className="emp-dash__greeting">
              My <span>Shift</span>
            </h1>
            <p className="emp-dash__subtitle">See your current and upcoming shift schedule.</p>
          </div>
          <div className="emp-dash__date-pill">
            <FaCalendarAlt />
            <span>
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        <div className="emp-dash__stats">
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Shifts</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FiCalendar />
              </div>
            </div>
            <div className="emp-dash__stat-value">{shifts.length}</div>
            <div className="emp-dash__stat-meta">listed</div>
          </div>
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Ongoing</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <FiClock />
              </div>
            </div>
            <div className="emp-dash__stat-value">{summary.ongoing}</div>
            <div className="emp-dash__stat-meta">right now</div>
          </div>
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Upcoming</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                <FiCalendar />
              </div>
            </div>
            <div className="emp-dash__stat-value">{summary.upcoming}</div>
            <div className="emp-dash__stat-meta">next</div>
          </div>
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Scheduled</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                <FiCheckCircle />
              </div>
            </div>
            <div className="emp-dash__stat-value">{summary.scheduled}</div>
            <div className="emp-dash__stat-meta">changes</div>
          </div>
        </div>

        <div className="emp-dash__card">
          <div className="emp-dash__card-header">
            <div>
              <h3 className="emp-dash__card-title">Shift Schedule</h3>
              <p className="emp-dash__card-desc">Current assignment and scheduled changes</p>
            </div>
          </div>

          {shifts.length === 0 ? (
            <div className="emp-dash__card-body" style={{ textAlign: "center" }}>
              <p style={{ color: "var(--ed-text-muted)", margin: 0 }}>No shifts assigned yet. Please contact admin.</p>
            </div>
          ) : (
            <>
              <div className="emp-dash__table-wrap">
                <table className="emp-dash__table">
                  <thead>
                    <tr>
                      <th>Period</th>
                      <th>Shift Type</th>
                      <th>Shift Name</th>
                      <th>Effective From</th>
                      <th>Time Range</th>
                      <th>Start</th>
                      <th>End</th>
                      <th style={{ textAlign: "right" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shifts.map((shift, index) => {
                      const status = statusUpdates[index] || "Checking...";
                      const statusBadge =
                        status === "Ongoing" || status === "Completed"
                          ? "emp-dash__table-status--present"
                          : "emp-dash__table-status--other";

                      return (
                        <tr key={shift._id || index}>
                          <td>
                            <span
                              className={`emp-dash__table-status ${
                                shift.shiftPeriod === "Upcoming" ? "emp-dash__table-status--other" : "emp-dash__table-status--present"
                              }`}
                            >
                              {shift.shiftPeriod}
                            </span>
                          </td>
                          <td style={{ textTransform: "capitalize", fontWeight: 600 }}>{shift.shiftType || "—"}</td>
                          <td>{shift.shiftName || "—"}</td>
                          <td>{formatDate(shift.date)}</td>
                          <td>{shift.timeRange || `${shift.startTime || "—"} - ${shift.endTime || "—"}`}</td>
                          <td>{shift.startTime || "—"}</td>
                          <td>{shift.endTime || "—"}</td>
                          <td style={{ textAlign: "right" }}>
                            <span className={`emp-dash__table-status ${statusBadge}`}>{status}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="emp-dash__mobile-list">
                {shifts.map((shift, index) => {
                  const status = statusUpdates[index] || "Checking...";
                  return (
                    <div key={shift._id || index} className="emp-dash__mobile-item">
                      <div className="emp-dash__mobile-item-top">
                        <span className="emp-dash__mobile-date">
                          {shift.shiftPeriod} • {formatDate(shift.date)}
                        </span>
                        <span className={`emp-dash__table-status ${status === "Ongoing" ? "emp-dash__table-status--present" : "emp-dash__table-status--other"}`}>
                          {status}
                        </span>
                      </div>
                      <div className="emp-dash__mobile-grid">
                        <div className="emp-dash__mobile-field">
                          <span>Type</span>
                          <span style={{ textTransform: "capitalize" }}>{shift.shiftType || "—"}</span>
                        </div>
                        <div className="emp-dash__mobile-field">
                          <span>Name</span>
                          <span>{shift.shiftName || "—"}</span>
                        </div>
                        <div className="emp-dash__mobile-field">
                          <span>Start</span>
                          <span>{shift.startTime || "—"}</span>
                        </div>
                        <div className="emp-dash__mobile-field">
                          <span>End</span>
                          <span>{shift.endTime || "—"}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default EmployeeShift;




