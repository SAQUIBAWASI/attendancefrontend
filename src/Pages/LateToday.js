// // src/pages/LateToday.jsx
// import axios from "axios";
// import { useEffect, useState } from "react";

// const BASE_URL = "https://api.timelyhealth.in/";

// const LateToday = () => {
//   const [records, setRecords] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     fetchLateAttendance();
//   }, []);

//   // Fetch Late Attendance (shift-wise already filtered from backend)
//   const fetchLateAttendance = async () => {
//     try {
//       setLoading(true);

//       const resp = await axios.get(`${BASE_URL}/api/attendance/lateattendance`);
//       let data = resp.data.records || [];

//       // ⭐ FIX: Missing name? → Fetch from employee table
//       const updatedData = await Promise.all(
//         data.map(async (rec) => {
//           if (!rec.employeeName) {
//             try {
//               const emp = await axios.get(
//                 `${BASE_URL}/api/employees/${rec.employeeId}`
//               );
//               rec.employeeName = emp.data?.name || "-";
//             } catch (err) {
//               rec.employeeName = "-";
//             }
//           }
//           return rec;
//         })
//       );

//       setRecords(updatedData);
//     } catch (err) {
//       console.error("Late fetch error:", err);
//       setError("Failed to fetch late attendance records");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Format Time
//   const formatTime = (time) => {
//     if (!time) return "-";
//     return new Date(time).toLocaleTimeString([], {
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: true,
//     });
//   };

//   return (
//     <div className="max-w-5xl p-6 mx-auto mt-6 bg-white rounded-lg shadow-md">
//       <h2 className="mb-4 text-2xl font-bold text-center">Late Comers Today</h2>

//       {loading ? (
//         <p className="text-center text-gray-600">Loading late attendance...</p>
//       ) : error ? (
//         <p className="text-center text-red-600">{error}</p>
//       ) : records.length === 0 ? (
//         <p className="text-center text-gray-500">No late comers today.</p>
//       ) : (
//         <div className="overflow-x-auto">
//           <table className="w-full text-sm border border-gray-300">
//             <thead className="text-gray-700 bg-gray-100">
//               <tr>
//                 <th className="px-4 py-2 border">Employee ID</th>
//                 <th className="px-4 py-2 border">Name</th>
//                 <th className="px-4 py-2 border">Email</th>
//                 <th className="px-4 py-2 border">Shift Start</th>
//                 <th className="px-4 py-2 border">Check In</th>
//                 <th className="px-4 py-2 border">Status</th>
//               </tr>
//             </thead>

//             <tbody>
//               {records.map((rec) => (
//                 <tr key={rec._id} className="border-t hover:bg-gray-50">
//                   <td className="px-4 py-2">{rec.employeeId}</td>
//                   <td className="px-4 py-2">{rec.employeeName}</td>
//                   <td className="px-4 py-2">{rec.employeeEmail}</td>

//                   <td className="px-4 py-2 font-semibold text-blue-600">
//                     {rec.shiftStart || "-"}
//                   </td>

//                   <td className="px-4 py-2 font-semibold text-red-600">
//                     {formatTime(rec.checkInTime)}
//                   </td>

//                   <td className="px-4 py-2">
//                     <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">
//                       Late
//                     </span>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// src/pages/LateToday.jsx
import axios from "axios";
import React, { useEffect, useState } from "react";
import { isEmployeeHidden } from "../utils/employeeStatus";
import { API_BASE_URL } from "../config";

const BASE_URL = API_BASE_URL;

const LateToday = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLateAttendance();
  }, []);

  const fetchLateAttendance = async () => {
    try {
      setLoading(true);

      // Fetch all required data
      const [
        empResp,
        shiftsResp,
        masterShiftsResp,
        attendanceResp,
      ] = await Promise.all([
        axios.get(`${BASE_URL}/employees/get-employees`),
        axios.get(`${BASE_URL}/shifts/assignments`),
        axios.get(`${BASE_URL}/shifts/master`),
        axios.get(`${BASE_URL}/attendance/allattendance`)
      ]);

      const employees = empResp.data || [];

      // Get shift data
      const shiftsData = shiftsResp.data.success ? shiftsResp.data.data || [] : [];
      const masterShifts = masterShiftsResp.data.success ? masterShiftsResp.data.data || [] : [];

      // Process attendance data
      const attendanceData = attendanceResp.data || [];
      const allAttendance = Array.isArray(attendanceData)
        ? attendanceData
        : attendanceData.records || attendanceData.allAttendance || [];

      // Process late records
      const lateRecords = processLateRecords(allAttendance, employees, shiftsData, masterShifts);
      setRecords(lateRecords);

    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // Get Employee Shift Time
  const getEmployeeShift = (employeeId, shiftsData, masterShifts) => {
    const shiftAssignment = shiftsData.find(s =>
      s.employeeAssignment?.employeeId === employeeId ||
      s.employeeId === employeeId
    );

    if (!shiftAssignment) return null;

    const shiftType = shiftAssignment.shiftType;
    const masterShift = masterShifts.find(shift => shift.shiftType === shiftType);

    if (!masterShift) {
      // Default shift times
      const shiftTimes = {
        "A": { start: "10:00", end: "19:00", grace: 5, isBrakeShift: false },
        "B": { start: "14:00", end: "22:00", grace: 5, isBrakeShift: false },
        "C": { start: "18:00", end: "21:00", grace: 5, isBrakeShift: false },
        "D": { start: "09:00", end: "18:00", grace: 5, isBrakeShift: false },
        "E": { start: "10:00", end: "21:00", grace: 5, isBrakeShift: false },
        "F": { start: "14:00", end: "23:00", grace: 5, isBrakeShift: false },
        "G": { start: "09:00", end: "21:00", grace: 5, isBrakeShift: false },
        "H": { start: "09:00", end: "21:00", grace: 5, isBrakeShift: false },
        "I": { start: "07:00", end: "17:00", grace: 5, isBrakeShift: false },
        "BR": { start: "07:00", end: "21:30", grace: 5, isBrakeShift: true },
      };

      return shiftTimes[shiftType] || { start: "09:00", end: "18:00", grace: 5, isBrakeShift: false };
    }

    // Check if it's a brake shift
    if (masterShift.isBrakeShift && masterShift.timeSlots && masterShift.timeSlots.length >= 2) {
      return {
        start: masterShift.timeSlots[0]?.timeRange?.split('-')[0]?.trim() || "07:00",
        end: masterShift.timeSlots[1]?.timeRange?.split('-')[1]?.trim() || "21:30",
        grace: 5,
        isBrakeShift: true
      };
    }

    // Regular shift
    if (masterShift.timeSlots && masterShift.timeSlots.length > 0) {
      const timeSlot = masterShift.timeSlots[0];
      if (timeSlot.timeRange) {
        const [start, end] = timeSlot.timeRange.split('-').map(s => s.trim());
        return {
          start: start || "09:00",
          end: end || "18:00",
          grace: 5,
          isBrakeShift: false
        };
      }
    }

    return { start: "09:00", end: "18:00", grace: 5, isBrakeShift: false };
  };

  // Calculate late minutes
  const calculateLateMinutes = (employeeId, checkInTime, shiftsData, masterShifts) => {
    const shift = getEmployeeShift(employeeId, shiftsData, masterShifts);
    if (!shift || !checkInTime) return 0;

    const checkInDateTime = new Date(checkInTime);
    const [hours, minutes] = shift.start.split(':').map(Number);

    const shiftStartTime = new Date(checkInDateTime);
    shiftStartTime.setHours(hours, minutes, 0, 0);

    const graceTime = new Date(shiftStartTime);
    graceTime.setMinutes(graceTime.getMinutes() + shift.grace);

    if (checkInDateTime > graceTime) {
      const diffMs = checkInDateTime - graceTime;
      return Math.floor(diffMs / (1000 * 60));
    }

    return 0;
  };

  // Process late records
  const processLateRecords = (attendanceData, employees, shiftsData, masterShifts) => {
    const today = new Date().toISOString().split('T')[0];
    const lateRecords = [];

    attendanceData.forEach(record => {
      if (!record.checkInTime) return;

      const recordDate = new Date(record.checkInTime).toISOString().split('T')[0];
      if (recordDate !== today) return;

      const id = (typeof record.employeeId === 'object' ? record.employeeId?.employeeId : record.employeeId);
      if (!id) return;

      const lateMinutes = calculateLateMinutes(id, record.checkInTime, shiftsData, masterShifts);
      if (lateMinutes > 0) {
        const emp = employees.find(e => e.employeeId === id || e._id === id);

        // Skip inactive employees
        if (emp && isEmployeeHidden(emp)) return;

        const shift = getEmployeeShift(id, shiftsData, masterShifts);

        lateRecords.push({
          _id: record._id || id + Date.now(),
          employeeId: id,
          employeeName: emp?.name || "Unknown",
          shiftStart: shift?.start || "Not set",
          checkInTime: record.checkInTime,
          lateByMinutes: lateMinutes,
          shiftType: shift?.shiftType || "Unknown",
          isBrakeShift: shift?.isBrakeShift || false
        });
      }
    });

    return lateRecords.sort((a, b) => b.lateByMinutes - a.lateByMinutes);
  };

  return (
    <div className="max-w-5xl p-6 mx-auto mt-6 bg-white rounded-lg shadow-md">
      {/* <h2 className="mb-4 text-2xl font-bold text-center">Late Comers Today</h2> */}

      {loading ? (
        <p className="text-center text-gray-600">Loading late attendance...</p>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : records.length === 0 ? (
        <p className="text-center text-gray-500">No late comers today.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-300">
            <thead className="text-gray-700 bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">Employee ID</th>
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Shift Start</th>
                <th className="px-4 py-2 border">Check In</th>
                <th className="px-4 py-2 border">Late By</th>
                <th className="px-4 py-2 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec) => (
                <tr key={rec._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{rec.employeeId}</td>
                  <td className="px-4 py-2 border">{rec.employeeName || "-"}</td>
                  <td className="px-4 py-2 font-medium text-blue-600 border">
                    {rec.shiftStart || "-"}
                  </td>
                  <td className="px-4 py-2 font-medium text-red-600 border">
                    {rec.checkInTime
                      ? new Date(rec.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : "-"}
                  </td>
                  <td className="px-4 py-2 text-gray-700 border">
                    {rec.lateByMinutes ? `${rec.lateByMinutes} mins` : "-"}
                  </td>
                  <td className="px-4 py-2 font-semibold text-yellow-700 border">
                    <span className="px-2 py-1 text-xs bg-yellow-100 rounded">
                      Late
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LateToday;