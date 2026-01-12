// // src/pages/TodayAttendance.jsx
// import axios from "axios";
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// const TodayAttendance = () => {
//   const [todayRecords, setTodayRecords] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchTodayAttendance();
//   }, []);

//   const fetchTodayAttendance = async () => {
//     try {
//       setLoading(true);
//       const resp = await axios.get(
//         "https://api.timelyhealth.in//api/attendance/today"
//       );

//       let records = resp.data.records || [];

//       const formattedRecords = records.map((rec) => ({
//         ...rec,
//         employeeName: rec.employeeName || rec.employee?.name || "-",
//         employeeEmail: rec.employeeEmail || rec.employee?.email || "-",
//       }));

//       setTodayRecords(formattedRecords);
//     } catch (err) {
//       setError("Failed to fetch today's attendance");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStatusColor = (status) => {
//     switch ((status || "").toLowerCase()) {
//       case "checked-in":
//         return "bg-green-100 text-green-800";
//       case "checked-out":
//         return "bg-blue-100 text-blue-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   if (loading)
//     return <p className="mt-6 text-center text-gray-600">Loading today's attendance...</p>;

//   if (error)
//     return <p className="mt-6 text-center text-red-600">{error}</p>;

//   return (
//     <div className="max-w-6xl p-6 mx-auto mt-6 bg-white rounded-lg shadow-md">
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-2xl font-bold text-gray-800">Today's Attendance</h3>

//         <button
//           onClick={() => navigate("/attendance-records")}
//           className="px-4 py-2 text-sm text-white transition bg-blue-600 rounded hover:bg-blue-700"
//         >
//           View All Records
//         </button>
//       </div>

//       <div className="overflow-x-auto">
//         <table className="min-w-full text-sm text-left border border-gray-200">
//           <thead className="text-gray-700 bg-gray-100">
//             <tr>
//               <th className="px-4 py-2 border">Employee ID</th>
//               <th className="px-4 py-2 border">Name</th>
//               <th className="px-4 py-2 border">Check In</th>
//               <th className="px-4 py-2 border">Check Out</th>
//               <th className="px-4 py-2 border">Total Hours</th>
//               <th className="px-4 py-2 border">Distance (m)</th>
//               <th className="px-4 py-2 border">Onsite</th>
//               <th className="px-4 py-2 border">Status</th>
//             </tr>
//           </thead>

//           <tbody>
//             {todayRecords.length > 0 ? (
//               todayRecords.map((rec) => (
//                 <tr key={rec._id} className="border-t hover:bg-gray-50">
//                   <td className="px-4 py-2 font-medium">{rec.employeeId}</td>
//                   <td className="px-4 py-2">{rec.employeeName}</td>
//                   <td className="px-4 py-2">
//                     {rec.checkInTime ? new Date(rec.checkInTime).toLocaleTimeString() : "-"}
//                   </td>
//                   <td className="px-4 py-2">
//                     {rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleTimeString() : "-"}
//                   </td>
//                   <td className="px-4 py-2">
//                     {rec.totalHours ? Number(rec.totalHours).toFixed(2) : "0.00"}
//                   </td>
//                   <td className="px-4 py-2">
//                     {rec.distance ? Number(rec.distance).toFixed(2) : "0.00"}
//                   </td>
//                   <td className="px-4 py-2">{rec.onsite ? "Yes" : "No"}</td>
//                   <td className="px-4 py-2">
//                     <span
//                       className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
//                         rec.status
//                       )}`}
//                     >
//                       {rec.status || "-"}
//                     </span>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan={8} className="py-4 text-center text-gray-500">
//                   No attendance records for today.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default TodayAttendance;

// import axios from "axios";
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// // const BASE_URL = "https://api.timelyhealth.in/"; // replace with your backend base URL

// const TodayAttendance = () => {
//   const [todayRecords, setTodayRecords] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchTodayAttendance();
//   }, []);

//   const fetchTodayAttendance = async () => {
//     try {
//       setLoading(true);
//       const resp = await axios.get("https://api.timelyhealth.in//api/attendance/today");
//       if (resp.data && resp.data.records) {
//         setTodayRecords(resp.data.records);
//       }
//     } catch (err) {
//       console.error("Error fetching today's attendance:", err);
//       setError("Failed to fetch today's attendance");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStatusColor = (status) => {
//     switch ((status || "").toLowerCase()) {
//       case "checked-in":
//         return "bg-green-100 text-green-800";
//       case "checked-out":
//         return "bg-blue-100 text-blue-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   if (loading)
//     return <p className="mt-6 text-center text-gray-600">Loading today's attendance...</p>;
//   if (error) return <p className="mt-6 text-center text-red-600">{error}</p>;

//   return (
//     <div className="max-w-6xl p-6 mx-auto mt-6 bg-white rounded-lg shadow-md">
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-2xl font-bold text-gray-800">Today's Attendance</h3>
//         <button
//           onClick={() => navigate("/attendance-records")}
//           className="px-4 py-2 text-sm text-white transition bg-blue-600 rounded hover:bg-blue-700"
//         >
//           View All Records
//         </button>
//       </div>

//       <div className="overflow-x-auto">
//         <table className="min-w-full text-sm text-left border border-gray-200">
//           <thead className="text-gray-700 bg-gray-100">
//             <tr>
//               <th className="px-4 py-2 border">Employee ID</th>
//               <th className="px-4 py-2 border">Email</th>
//               <th className="px-4 py-2 border">Check In</th>
//               <th className="px-4 py-2 border">Check Out</th>
//               <th className="px-4 py-2 border">Total Hours</th>
//               <th className="px-4 py-2 border">Distance (m)</th>
//               <th className="px-4 py-2 border">Onsite</th>
//               <th className="px-4 py-2 border">Status</th>
//             </tr>
//           </thead>
//           <tbody>
//             {todayRecords.length > 0 ? (
//               todayRecords.map((rec) => (
//                 <tr
//                   key={rec._id}
//                   className="border-t cursor-pointer hover:bg-gray-50"
//                   onClick={() =>
//                     navigate(`/employee-details/${rec.employeeId}`)
//                   }
//                 >
//                   <td className="px-4 py-2 font-medium">{rec.employeeId}</td>
//                   <td className="px-4 py-2">{rec.employeeEmail}</td>
//                   <td className="px-4 py-2">
//                     {rec.checkInTime
//                       ? new Date(rec.checkInTime).toLocaleTimeString()
//                       : "-"}
//                   </td>
//                   <td className="px-4 py-2">
//                     {rec.checkOutTime
//                       ? new Date(rec.checkOutTime).toLocaleTimeString()
//                       : "-"}
//                   </td>
//                   <td className="px-4 py-2">{rec.totalHours?.toFixed(2) || "-"}</td>
//                   <td className="px-4 py-2">{rec.distance?.toFixed(2) || "-"}</td>
//                   <td className="px-4 py-2">{rec.onsite ? "Yes" : "No"}</td>
//                   <td className="px-4 py-2">
//                     <span
//                       className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
//                         rec.status
//                       )}`}
//                     >
//                       {rec.status || "-"}
//                     </span>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan={8} className="py-4 text-center text-gray-500">
//                   No attendance records for today.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default TodayAttendance;

import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isEmployeeHidden } from "../utils/employeeStatus";

const TodayAttendance = () => {
  const [todayRecords, setTodayRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchTodayAttendance();
  }, []);

  const fetchTodayAttendance = async () => {
    try {
      setLoading(true);

      // 1️⃣ Fetch attendance
      const attendanceResp = await axios.get(
        "https://api.timelyhealth.in/api/attendance/today"
      );

      const attendance = attendanceResp.data.records || [];

      // 2️⃣ Fetch employee list
      const empResp = await axios.get(
        "https://api.timelyhealth.in/api/employees/get-employees"
      );
      const employees = empResp.data || [];

      // 3️⃣ Map employee name into attendance records
      const merged = attendance.map((rec) => {
        const empId =
          rec.employeeId?._id ||
          rec.employeeId?.employeeId ||
          rec.employeeId ||
          rec.empId ||
          "";

        const employee = employees.find(
          (e) =>
            e.employeeId === empId ||
            e._id === empId ||
            e.empId === empId
        );

        return {
          ...rec,
          name: employee?.name || employee?.fullName || "N/A",
        };
      });

      const activeRecords = merged.filter((rec) => {
        const empId =
          rec.employeeId?.employeeId ||
          (typeof rec.employeeId === 'string' ? rec.employeeId : '') ||
          rec.empId ||
          "";

        // Find the employee in the full list to check their database status
        const employee = employees.find(e => e.employeeId === empId || e._id === empId);

        // Use central utility
        return !isEmployeeHidden(employee || { employeeId: empId });
      });

      setTodayRecords(activeRecords);
    } catch (err) {
      console.error("Error fetching today's attendance:", err);
      setError("Failed to fetch today's attendance");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "checked-in":
        return "bg-green-100 text-green-800";
      case "checked-out":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading)
    return (
      <p className="mt-6 text-center text-gray-600">
        Loading today's attendance...
      </p>
    );
  if (error)
    return <p className="mt-6 text-center text-red-600">{error}</p>;

  return (
    <div className="max-w-6xl p-6 mx-auto mt-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        {/* <h3 className="text-2xl font-bold text-gray-800">
          Today's Attendance
        </h3> */}
        {/* <button
          onClick={() => navigate("/attendance-records")}
          className="px-4 py-2 text-sm text-white transition bg-blue-600 rounded hover:bg-blue-700"
        >
          View All Records
        </button> */}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left border border-gray-200">
          <thead className="text-gray-700 bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Employee ID</th>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Check In</th>
              <th className="px-4 py-2 border">Check Out</th>
              <th className="px-4 py-2 border">Total Hours</th>
              <th className="px-4 py-2 border">Distance (m)</th>
              <th className="px-4 py-2 border">Onsite</th>
              <th className="px-4 py-2 border">Status</th>
            </tr>
          </thead>

          <tbody>
            {todayRecords.length > 0 ? (
              todayRecords.map((rec) => (
                <tr
                  key={rec._id}
                  className="border-t cursor-pointer hover:bg-gray-50"
                  onClick={() =>
                    navigate(`/employee-details/${rec.employeeId}`)
                  }
                >
                  <td className="px-4 py-2 font-medium">
                    {rec.employeeId?.employeeId ||
                      rec.employeeId ||
                      "-"}
                  </td>

                  <td className="px-4 py-2">{rec.name}</td>

                  <td className="px-4 py-2">
                    {rec.checkInTime
                      ? new Date(rec.checkInTime).toLocaleTimeString()
                      : "-"}
                  </td>

                  <td className="px-4 py-2">
                    {rec.checkOutTime
                      ? new Date(rec.checkOutTime).toLocaleTimeString()
                      : "-"}
                  </td>

                  <td className="px-4 py-2">
                    {rec.totalHours?.toFixed(2) || "-"}
                  </td>

                  <td className="px-4 py-2">
                    {rec.distance?.toFixed(2) || "-"}
                  </td>

                  <td className="px-4 py-2">
                    {rec.onsite ? "Yes" : "No"}
                  </td>

                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        rec.status
                      )}`}
                    >
                      {rec.status || "-"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-4 text-center text-gray-500">
                  No attendance records for today.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TodayAttendance;
