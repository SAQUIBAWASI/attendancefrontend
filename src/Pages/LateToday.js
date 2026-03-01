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
// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import { isEmployeeHidden } from "../utils/employeeStatus";
// import { API_BASE_URL } from "../config";

// const BASE_URL = API_BASE_URL;

// const LateToday = () => {
//   const [records, setRecords] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     fetchLateAttendance();
//   }, []);

//   const fetchLateAttendance = async () => {
//     try {
//       setLoading(true);

//       // Fetch all required data
//       const [
//         empResp,
//         shiftsResp,
//         masterShiftsResp,
//         attendanceResp,
//       ] = await Promise.all([
//         axios.get(`${BASE_URL}/employees/get-employees`),
//         axios.get(`${BASE_URL}/shifts/assignments`),
//         axios.get(`${BASE_URL}/shifts/master`),
//         axios.get(`${BASE_URL}/attendance/allattendance`)
//       ]);

//       const employees = empResp.data || [];

//       // Get shift data
//       const shiftsData = shiftsResp.data.success ? shiftsResp.data.data || [] : [];
//       const masterShifts = masterShiftsResp.data.success ? masterShiftsResp.data.data || [] : [];

//       // Process attendance data
//       const attendanceData = attendanceResp.data || [];
//       const allAttendance = Array.isArray(attendanceData)
//         ? attendanceData
//         : attendanceData.records || attendanceData.allAttendance || [];

//       // Process late records
//       const lateRecords = processLateRecords(allAttendance, employees, shiftsData, masterShifts);
//       setRecords(lateRecords);

//     } catch (err) {
//       console.error("Error fetching data:", err);
//       setError("Failed to fetch data. Please ensure backend is running.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Get Employee Shift Time
//   const getEmployeeShift = (employeeId, shiftsData, masterShifts) => {
//     const shiftAssignment = shiftsData.find(s =>
//       s.employeeAssignment?.employeeId === employeeId ||
//       s.employeeId === employeeId
//     );

//     if (!shiftAssignment) return null;

//     const shiftType = shiftAssignment.shiftType;
//     const masterShift = masterShifts.find(shift => shift.shiftType === shiftType);

//     if (!masterShift) {
//       // Default shift times
//       const shiftTimes = {
//         "A": { start: "10:00", end: "19:00", grace: 5, isBrakeShift: false },
//         "B": { start: "14:00", end: "22:00", grace: 5, isBrakeShift: false },
//         "C": { start: "18:00", end: "21:00", grace: 5, isBrakeShift: false },
//         "D": { start: "09:00", end: "18:00", grace: 5, isBrakeShift: false },
//         "E": { start: "10:00", end: "21:00", grace: 5, isBrakeShift: false },
//         "F": { start: "14:00", end: "23:00", grace: 5, isBrakeShift: false },
//         "G": { start: "09:00", end: "21:00", grace: 5, isBrakeShift: false },
//         "H": { start: "09:00", end: "21:00", grace: 5, isBrakeShift: false },
//         "I": { start: "07:00", end: "17:00", grace: 5, isBrakeShift: false },
//         "BR": { start: "07:00", end: "21:30", grace: 5, isBrakeShift: true },
//       };

//       return shiftTimes[shiftType] || { start: "09:00", end: "18:00", grace: 5, isBrakeShift: false };
//     }

//     // Check if it's a brake shift
//     if (masterShift.isBrakeShift && masterShift.timeSlots && masterShift.timeSlots.length >= 2) {
//       return {
//         start: masterShift.timeSlots[0]?.timeRange?.split('-')[0]?.trim() || "07:00",
//         end: masterShift.timeSlots[1]?.timeRange?.split('-')[1]?.trim() || "21:30",
//         grace: 5,
//         isBrakeShift: true
//       };
//     }

//     // Regular shift
//     if (masterShift.timeSlots && masterShift.timeSlots.length > 0) {
//       const timeSlot = masterShift.timeSlots[0];
//       if (timeSlot.timeRange) {
//         const [start, end] = timeSlot.timeRange.split('-').map(s => s.trim());
//         return {
//           start: start || "09:00",
//           end: end || "18:00",
//           grace: 5,
//           isBrakeShift: false
//         };
//       }
//     }

//     return { start: "09:00", end: "18:00", grace: 5, isBrakeShift: false };
//   };

//   // Calculate late minutes
//   const calculateLateMinutes = (employeeId, checkInTime, shiftsData, masterShifts) => {
//     const shift = getEmployeeShift(employeeId, shiftsData, masterShifts);
//     if (!shift || !checkInTime) return 0;

//     const checkInDateTime = new Date(checkInTime);
//     const [hours, minutes] = shift.start.split(':').map(Number);

//     const shiftStartTime = new Date(checkInDateTime);
//     shiftStartTime.setHours(hours, minutes, 0, 0);

//     const graceTime = new Date(shiftStartTime);
//     graceTime.setMinutes(graceTime.getMinutes() + shift.grace);

//     if (checkInDateTime > graceTime) {
//       const diffMs = checkInDateTime - graceTime;
//       return Math.floor(diffMs / (1000 * 60));
//     }

//     return 0;
//   };

//   // Process late records
//   const processLateRecords = (attendanceData, employees, shiftsData, masterShifts) => {
//     const today = new Date().toISOString().split('T')[0];
//     const lateRecords = [];

//     attendanceData.forEach(record => {
//       if (!record.checkInTime) return;

//       const recordDate = new Date(record.checkInTime).toISOString().split('T')[0];
//       if (recordDate !== today) return;

//       const id = (typeof record.employeeId === 'object' ? record.employeeId?.employeeId : record.employeeId);
//       if (!id) return;

//       const lateMinutes = calculateLateMinutes(id, record.checkInTime, shiftsData, masterShifts);
//       if (lateMinutes > 0) {
//         const emp = employees.find(e => e.employeeId === id || e._id === id);

//         // Skip inactive employees
//         if (emp && isEmployeeHidden(emp)) return;

//         const shift = getEmployeeShift(id, shiftsData, masterShifts);

//         lateRecords.push({
//           _id: record._id || id + Date.now(),
//           employeeId: id,
//           employeeName: emp?.name || "Unknown",
//           shiftStart: shift?.start || "Not set",
//           checkInTime: record.checkInTime,
//           lateByMinutes: lateMinutes,
//           shiftType: shift?.shiftType || "Unknown",
//           isBrakeShift: shift?.isBrakeShift || false
//         });
//       }
//     });

//     return lateRecords.sort((a, b) => b.lateByMinutes - a.lateByMinutes);
//   };

//   return (
//     <div className="max-w-5xl p-6 mx-auto mt-6 bg-white rounded-lg shadow-md">
//       {/* <h2 className="mb-4 text-2xl font-bold text-center">Late Comers Today</h2> */}

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
//                 <th className="px-4 py-2 border">Shift Start</th>
//                 <th className="px-4 py-2 border">Check In</th>
//                 <th className="px-4 py-2 border">Late By</th>
//                 <th className="px-4 py-2 border">Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               {records.map((rec) => (
//                 <tr key={rec._id} className="hover:bg-gray-50">
//                   <td className="px-4 py-2 border">{rec.employeeId}</td>
//                   <td className="px-4 py-2 border">{rec.employeeName || "-"}</td>
//                   <td className="px-4 py-2 font-medium text-blue-600 border">
//                     {rec.shiftStart || "-"}
//                   </td>
//                   <td className="px-4 py-2 font-medium text-red-600 border">
//                     {rec.checkInTime
//                       ? new Date(rec.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
//                       : "-"}
//                   </td>
//                   <td className="px-4 py-2 text-gray-700 border">
//                     {rec.lateByMinutes ? `${rec.lateByMinutes} mins` : "-"}
//                   </td>
//                   <td className="px-4 py-2 font-semibold text-yellow-700 border">
//                     <span className="px-2 py-1 text-xs bg-yellow-100 rounded">
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
// };

// export default LateToday;

// import axios from "axios";
// import { useEffect, useState } from "react";
// import { FaCalendarAlt, FaSearch } from "react-icons/fa";
// import { API_BASE_URL } from "../config";
// import { isEmployeeHidden } from "../utils/employeeStatus";

// const BASE_URL = API_BASE_URL;

// const LateToday = () => {
//   const [records, setRecords] = useState([]);
//   const [filteredRecords, setFilteredRecords] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [filterType, setFilterType] = useState("date"); // 'date' or 'month'
//   const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
//   const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  
//   // Search filters
//   const [searchTerm, setSearchTerm] = useState("");
//   const [deptSearchTerm, setDeptSearchTerm] = useState("");
  
//   // Pagination
//   const [pagination, setPagination] = useState({
//     currentPage: 1,
//     totalPages: 1,
//     totalCount: 0,
//     limit: 10,
//   });
  
//   const [debug, setDebug] = useState({});

//   useEffect(() => {
//     fetchLateAttendance();
//   }, [selectedDate, selectedMonth, filterType]);

//   useEffect(() => {
//     // Apply filters whenever records or search terms change
//     filterRecords();
//   }, [records, searchTerm, deptSearchTerm]);

//   useEffect(() => {
//     // Reset to first page when filters change
//     setPagination(prev => ({ ...prev, currentPage: 1 }));
//   }, [searchTerm, deptSearchTerm, filterType, selectedDate, selectedMonth]);

//   const filterRecords = () => {
//     let filtered = [...records];
    
//     // Filter by Employee ID or Name
//     if (searchTerm.trim()) {
//       const term = searchTerm.toLowerCase().trim();
//       filtered = filtered.filter(rec => 
//         rec.employeeId?.toString().toLowerCase().includes(term) ||
//         rec.employeeName?.toLowerCase().includes(term)
//       );
//     }
    
//     // Filter by Department or Designation
//     if (deptSearchTerm.trim()) {
//       const term = deptSearchTerm.toLowerCase().trim();
//       filtered = filtered.filter(rec => 
//         rec.department?.toLowerCase().includes(term) ||
//         rec.designation?.toLowerCase().includes(term)
//       );
//     }
    
//     setFilteredRecords(filtered);
//     setPagination(prev => ({
//       ...prev,
//       totalCount: filtered.length,
//       totalPages: Math.ceil(filtered.length / prev.limit)
//     }));
//   };

//   // Pagination calculations
//   const indexOfLastRow = pagination.currentPage * pagination.limit;
//   const indexOfFirstRow = indexOfLastRow - pagination.limit;
//   const currentRows = filteredRecords.slice(indexOfFirstRow, indexOfLastRow);

//   const handleItemsPerPageChange = (limit) => {
//     setPagination({
//       currentPage: 1,
//       limit: limit,
//       totalCount: filteredRecords.length,
//       totalPages: Math.ceil(filteredRecords.length / limit)
//     });
//   };

//   const fetchLateAttendance = async () => {
//     try {
//       setLoading(true);

//       const [
//         empResp,
//         shiftsResp,
//         masterShiftsResp,
//         attendanceResp,
//       ] = await Promise.all([
//         axios.get(`${BASE_URL}/employees/get-employees`),
//         axios.get(`${BASE_URL}/shifts/assignments`),
//         axios.get(`${BASE_URL}/shifts/master`),
//         axios.get(`${BASE_URL}/attendance/allattendance`)
//       ]);

//       const employees = empResp.data || [];
//       const activeEmployees = employees.filter(emp => !isEmployeeHidden(emp));
//       const activeEmployeeIds = new Set(activeEmployees.map(emp => emp.employeeId || emp._id));

//       const shiftsData = shiftsResp.data.success ? shiftsResp.data.data || [] : [];
//       const masterShifts = masterShiftsResp.data.success ? masterShiftsResp.data.data || [] : [];

//       const attendanceData = attendanceResp.data || [];
//       const allAttendance = Array.isArray(attendanceData)
//         ? attendanceData
//         : attendanceData.records || attendanceData.allAttendance || [];

//       setDebug({
//         totalEmployees: employees.length,
//         activeEmployees: activeEmployees.length,
//         totalAttendance: allAttendance.length,
//         filterType,
//         selectedDate: filterType === 'date' ? selectedDate : selectedMonth
//       });

//       const lateRecords = processLateRecords(allAttendance, employees, activeEmployeeIds, shiftsData, masterShifts);
//       setRecords(lateRecords);

//     } catch (err) {
//       console.error("Error fetching data:", err);
//       setError("Failed to fetch data. Please ensure backend is running.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getEmployeeShift = (employeeId, shiftsData, masterShifts) => {
//     const shiftAssignment = shiftsData.find(s =>
//       s.employeeAssignment?.employeeId === employeeId ||
//       s.employeeId === employeeId
//     );

//     if (!shiftAssignment) return null;

//     const shiftType = shiftAssignment.shiftType;
//     const masterShift = masterShifts.find(shift => shift.shiftType === shiftType);

//     if (!masterShift) {
//       const shiftTimes = {
//         "A": { start: "10:00", end: "19:00", grace: 5, isBrakeShift: false },
//         "B": { start: "14:00", end: "22:00", grace: 5, isBrakeShift: false },
//         "C": { start: "18:00", end: "21:00", grace: 5, isBrakeShift: false },
//         "D": { start: "09:00", end: "18:00", grace: 5, isBrakeShift: false },
//         "E": { start: "10:00", end: "21:00", grace: 5, isBrakeShift: false },
//         "F": { start: "14:00", end: "23:00", grace: 5, isBrakeShift: false },
//         "G": { start: "09:00", end: "21:00", grace: 5, isBrakeShift: false },
//         "H": { start: "09:00", end: "21:00", grace: 5, isBrakeShift: false },
//         "I": { start: "07:00", end: "17:00", grace: 5, isBrakeShift: false },
//         "BR": { start: "07:00", end: "21:30", grace: 5, isBrakeShift: true },
//       };

//       return shiftTimes[shiftType] || { start: "09:00", end: "18:00", grace: 5, isBrakeShift: false };
//     }

//     if (masterShift.isBrakeShift && masterShift.timeSlots && masterShift.timeSlots.length >= 2) {
//       return {
//         start: masterShift.timeSlots[0]?.timeRange?.split('-')[0]?.trim() || "07:00",
//         end: masterShift.timeSlots[1]?.timeRange?.split('-')[1]?.trim() || "21:30",
//         grace: 5,
//         isBrakeShift: true
//       };
//     }

//     if (masterShift.timeSlots && masterShift.timeSlots.length > 0) {
//       const timeSlot = masterShift.timeSlots[0];
//       if (timeSlot.timeRange) {
//         const [start, end] = timeSlot.timeRange.split('-').map(s => s.trim());
//         return {
//           start: start || "09:00",
//           end: end || "18:00",
//           grace: 5,
//           isBrakeShift: false
//         };
//       }
//     }

//     return { start: "09:00", end: "18:00", grace: 5, isBrakeShift: false };
//   };

//   const calculateLateMinutes = (employeeId, checkInTime, shiftsData, masterShifts) => {
//     const shift = getEmployeeShift(employeeId, shiftsData, masterShifts);
//     if (!shift || !checkInTime) return 0;

//     const checkInDateTime = new Date(checkInTime);
//     const [hours, minutes] = shift.start.split(':').map(Number);

//     const shiftStartTime = new Date(checkInDateTime);
//     shiftStartTime.setHours(hours, minutes, 0, 0);

//     const graceTime = new Date(shiftStartTime);
//     graceTime.setMinutes(graceTime.getMinutes() + shift.grace);

//     if (checkInDateTime > graceTime) {
//       const diffMs = checkInDateTime - graceTime;
//       return Math.floor(diffMs / (1000 * 60));
//     }

//     return 0;
//   };

//   const processLateRecords = (attendanceData, employees, activeEmployeeIds, shiftsData, masterShifts) => {
//     const lateRecords = [];

//     attendanceData.forEach(record => {
//       if (!record.checkInTime) return;

//       const recordDate = new Date(record.checkInTime).toISOString().split('T')[0];
//       const recordMonth = recordDate.slice(0, 7);

//       // Apply filter based on type
//       if (filterType === 'date') {
//         if (recordDate !== selectedDate) return;
//       } else {
//         if (recordMonth !== selectedMonth) return;
//       }

//       const id = (typeof record.employeeId === 'object' 
//         ? record.employeeId?.employeeId || record.employeeId?._id
//         : record.employeeId);
      
//       if (!id) return;
//       if (!activeEmployeeIds.has(id)) return;

//       const lateMinutes = calculateLateMinutes(id, record.checkInTime, shiftsData, masterShifts);
//       if (lateMinutes > 0) {
//         const emp = employees.find(e => (e.employeeId === id || e._id === id));
//         const shift = getEmployeeShift(id, shiftsData, masterShifts);

//         lateRecords.push({
//           _id: record._id || id + Date.now() + Math.random(),
//           employeeId: id,
//           employeeName: emp?.name || "Unknown",
//           department: emp?.department || emp?.departmentName || "N/A",
//           designation: emp?.designation || emp?.role || "N/A",
//           shiftStart: shift?.start || "Not set",
//           checkInTime: record.checkInTime,
//           lateByMinutes: lateMinutes,
//           shiftType: shift?.shiftType || "Unknown",
//           isBrakeShift: shift?.isBrakeShift || false,
//           expectedTime: shift?.start || "Not set",
//           actualTime: new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//           date: recordDate
//         });
//       }
//     });

//     // Group by employee for month view (total late days)
//     if (filterType === 'month') {
//       const groupedByEmployee = {};
//       lateRecords.forEach(record => {
//         const key = record.employeeId;
//         if (!groupedByEmployee[key]) {
//           groupedByEmployee[key] = {
//             ...record,
//             lateByMinutes: 1, // Count as 1 late day
//             totalLateDays: 1,
//             totalLateMinutes: 0
//           };
//         } else {
//           groupedByEmployee[key].totalLateDays++;
//           groupedByEmployee[key].totalLateMinutes += record.lateByMinutes;
//         }
//       });
      
//       // Convert back to array and add display info
//       return Object.values(groupedByEmployee).map(rec => ({
//         ...rec,
//         lateByMinutes: rec.totalLateMinutes || rec.lateByMinutes,
//         displayValue: `${rec.totalLateDays || 1} day(s) (${rec.totalLateMinutes || rec.lateByMinutes} mins)`
//       })).sort((a, b) => b.lateByMinutes - a.lateByMinutes);
//     }

//     return lateRecords.sort((a, b) => b.lateByMinutes - a.lateByMinutes);
//   };

//   const getLateColor = (minutes) => {
//     if (minutes <= 5) return 'text-green-600 bg-green-100';
//     if (minutes <= 10) return 'text-lime-600 bg-lime-100';
//     if (minutes <= 20) return 'text-yellow-600 bg-yellow-100';
//     if (minutes <= 30) return 'text-orange-600 bg-orange-100';
//     if (minutes <= 45) return 'text-red-600 bg-red-100';
//     if (minutes <= 55) return 'text-red-700 bg-red-200';
//     if (minutes <= 65) return 'text-red-800 bg-red-300';
//     return 'text-red-900 bg-red-400';
//   };

//   return (
//     <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
//       <div className="mx-auto max-w-9xl">
//         {/* Filters */}
//         <div className="p-2 mb-2 bg-white rounded-lg shadow-md">
//           <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
//             {/* ID/Name Search */}
//             <div className="relative">
//               <FaSearch className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
//               <input
//                 type="text"
//                 placeholder="Search by ID or Name..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             {/* Department/Designation Dropdown */}
//             <div className="relative">
//               <select
//                 value={deptSearchTerm}
//                 onChange={(e) => setDeptSearchTerm(e.target.value)}
//                 className="w-full px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 <option value="">All Departments & Designations</option>
//                 <option value="Laboratory Medicine">Laboratory Medicine</option>
//                 <option value="Sales">Sales</option>
//                 <option value="Marketing">Marketing</option>
//                 <option value="Medical">Medical</option>
//                 <option value="Nursing">Nursing</option>
//                 <option value="Developer">Developer</option>
//                 <option value="Designer">Designer</option>
//                 <option value="Heath Department">Heath Department</option>
//                 <option value="Management">Management</option>
//               </select>
//             </div>

//             {/* Filter Type */}
//             <select
//               value={filterType}
//               onChange={(e) => setFilterType(e.target.value)}
//               className="px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             >
//               <option value="date">Date </option>
//               <option value="month">Month </option>
//             </select>

//             {/* Date/Month Picker */}
//             <div className="relative">
//               <FaCalendarAlt className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
//               {filterType === "date" ? (
//                 <input
//                   type="date"
//                   value={selectedDate}
//                   onChange={(e) => setSelectedDate(e.target.value)}
//                   className="w-full py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               ) : (
//                 <input
//                   type="month"
//                   value={selectedMonth}
//                   onChange={(e) => setSelectedMonth(e.target.value)}
//                   className="w-full py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               )}
//             </div>

//             {/* Placeholder for alignment */}
//             <div></div>
//           </div>
//         </div>

//         {loading ? (
//           <div className="p-8 text-center bg-white rounded-lg shadow-md">
//             <div className="flex items-center justify-center">
//               <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
//               <span className="ml-2 text-gray-600">Loading late attendance...</span>
//             </div>
//           </div>
//         ) : error ? (
//           <div className="p-8 text-center bg-white rounded-lg shadow-md">
//             <p className="text-red-600">{error}</p>
//           </div>
//         ) : filteredRecords.length === 0 ? (
//           <div className="p-8 text-center bg-white rounded-lg shadow-md">
//             <p className="text-lg text-gray-500">No late arrivals found</p>
//             <p className="mt-2 text-sm text-gray-400">
//               {filterType === 'date' 
//                 ? `For date: ${selectedDate}` 
//                 : `For month: ${selectedMonth}`}
//               {(searchTerm || deptSearchTerm) && " - Try clearing search filters"}
//             </p>
//           </div>
//         ) : (
//           <>
//             {/* Activities Table */}
//             <div className="mb-6 overflow-hidden bg-white rounded-lg shadow-lg">
//               <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
//                 <table className="min-w-full">
//                   <thead className="text-sm text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
//                     <tr>
//                       <th className="py-2 text-center">Employee ID</th>
//                       <th className="py-2 text-center">Name</th>
//                       <th className="py-2 text-center">Department</th>
//                       <th className="py-2 text-center">Designation</th>
//                       <th className="py-2 text-center">Expected Time</th>
//                       <th className="py-2 text-center">Actual Time</th>
//                       <th className="py-2 text-center">Date</th>
//                       <th className="py-2 text-center">Late By</th>
//                       <th className="py-2 text-center">Status</th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {currentRows.map((rec) => (
//                       <tr key={rec._id} className="transition-colors hover:bg-gray-50">
//                         <td className="px-2 py-2 text-sm font-medium text-center text-gray-900 whitespace-nowrap">
//                           {rec.employeeId}
//                         </td>
//                         <td className="px-2 py-2 text-sm font-medium text-center text-gray-900 whitespace-nowrap">
//                           {rec.employeeName || "-"}
//                         </td>
//                         <td className="px-2 py-2 text-sm text-center text-gray-600">
//                           {rec.department}
//                         </td>
//                         <td className="px-2 py-2 text-sm text-center text-gray-600">
//                           {rec.designation}
//                         </td>
//                         <td className="px-2 py-2 text-sm font-medium text-center text-blue-600">
//                           {rec.expectedTime || "-"}
//                         </td>
//                         <td className="px-2 py-2 text-sm font-medium text-center text-orange-600">
//                           {rec.actualTime || "-"}
//                         </td>
//                         <td className="px-2 py-2 text-sm text-center text-gray-600">
//                           {rec.date || (rec.checkInTime ? new Date(rec.checkInTime).toLocaleDateString() : '-')}
//                         </td>
//                         <td className="px-2 py-2 text-center">
//                           <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getLateColor(rec.lateByMinutes)}`}>
//                             {filterType === 'month' && rec.totalLateDays 
//                               ? `${rec.totalLateDays} day(s)` 
//                               : `${rec.lateByMinutes} mins`}
//                           </span>
//                         </td>
//                         <td className="px-2 py-2 text-center">
//                           <span className="px-3 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-full">
//                             Late
//                           </span>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>

//               {/* Pagination */}
//               {filteredRecords.length > 0 && (
//                 <div className="flex items-center justify-between px-2 py-2 text-center border-t border-gray-200 bg-gray-50">
//                   <div className="flex flex-wrap items-center justify-between gap-4">
//                     {/* Left Side - Showing Info + Select */}
//                     <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
//                       <span>Showing</span>
//                       <span className="font-medium">
//                         {(pagination.currentPage - 1) * pagination.limit + 1}
//                       </span>
//                       <span>to</span>
//                       <span className="font-medium">
//                         {Math.min(
//                           pagination.currentPage * pagination.limit,
//                           pagination.totalCount
//                         )}
//                       </span>
//                       <span>of</span>
//                       <span className="font-medium">
//                         {pagination.totalCount}
//                       </span>
//                       <span>results</span>

//                       {/* Select Dropdown */}
//                       <select
//                         value={pagination.limit}
//                         onChange={(e) => {
//                           const newLimit = Number(e.target.value);
//                           handleItemsPerPageChange(newLimit);
//                         }}
//                         className="p-1 ml-2 text-sm border rounded-lg"
//                       >
//                         <option value={5}>5</option>
//                         <option value={10}>10</option>
//                         <option value={20}>20</option>
//                         <option value={50}>50</option>
//                       </select>
//                     </div>
//                   </div>

//                   <div className="flex gap-2">
//                     <button
//                       onClick={() =>
//                         setPagination((prev) => ({
//                           ...prev,
//                           currentPage: prev.currentPage - 1,
//                         }))
//                       }
//                       disabled={pagination.currentPage === 1}
//                       className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       Previous
//                     </button>

//                     <div className="flex items-center gap-1">
//                       {[...Array(pagination.totalPages)].map((_, index) => {
//                         const page = index + 1;
//                         if (
//                           page === 1 ||
//                           page === pagination.totalPages ||
//                           (page >= pagination.currentPage - 1 &&
//                             page <= pagination.currentPage + 1)
//                         ) {
//                           return (
//                             <button
//                               key={page}
//                               onClick={() =>
//                                 setPagination((prev) => ({
//                                   ...prev,
//                                   currentPage: page,
//                                 }))
//                               }
//                               className={`px-2 py-2 rounded-lg text-sm font-medium transition-colors ${
//                                 pagination.currentPage === page
//                                   ? "bg-blue-600 text-white"
//                                   : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
//                               }`}
//                             >
//                               {page}
//                             </button>
//                           );
//                         } else if (
//                           page === pagination.currentPage - 2 ||
//                           page === pagination.currentPage + 2
//                         ) {
//                           return (
//                             <span key={page} className="px-2 text-gray-500">
//                               ...
//                             </span>
//                           );
//                         }
//                         return null;
//                       })}
//                     </div>

//                     <button
//                       onClick={() =>
//                         setPagination((prev) => ({
//                           ...prev,
//                           currentPage: prev.currentPage + 1,
//                         }))
//                       }
//                       disabled={pagination.currentPage === pagination.totalPages}
//                       className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       Next
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default LateToday;

import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { FaBuilding, FaCalendarAlt, FaSearch, FaUserTag } from "react-icons/fa";
import { API_BASE_URL } from "../config";
import "../index.css";
import { isEmployeeHidden } from "../utils/employeeStatus";

const BASE_URL = API_BASE_URL;

const LateToday = () => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Date filters
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  
  // Search filters
  const [searchTerm, setSearchTerm] = useState("");
  
  // Department and Designation filter states
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterDesignation, setFilterDesignation] = useState("");
  const [showDepartmentFilter, setShowDepartmentFilter] = useState(false);
  const [showDesignationFilter, setShowDesignationFilter] = useState(false);
  
  // Unique departments and designations
  const [uniqueDepartments, setUniqueDepartments] = useState([]);
  const [uniqueDesignations, setUniqueDesignations] = useState([]);
  
  // Refs for click outside
  const departmentFilterRef = useRef(null);
  const designationFilterRef = useRef(null);
  
  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  });
  
  const [debug, setDebug] = useState({});

  // Click outside handlers for filter dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (departmentFilterRef.current && !departmentFilterRef.current.contains(event.target)) {
        setShowDepartmentFilter(false);
      }
      if (designationFilterRef.current && !designationFilterRef.current.contains(event.target)) {
        setShowDesignationFilter(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Extract unique departments and designations from employees
  const extractUniqueValues = (employees) => {
    const depts = new Set();
    const designations = new Set();
    
    employees.forEach(emp => {
      if (emp.department) depts.add(emp.department);
      if (emp.role || emp.designation) designations.add(emp.role || emp.designation);
    });
    
    setUniqueDepartments(Array.from(depts).sort());
    setUniqueDesignations(Array.from(designations).sort());
  };

  useEffect(() => {
    fetchLateAttendance();
  }, [fromDate, toDate, selectedMonth]);

  useEffect(() => {
    // Apply filters whenever records or search terms change
    filterRecords();
  }, [records, searchTerm, filterDepartment, filterDesignation]);

  useEffect(() => {
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, [searchTerm, filterDepartment, filterDesignation, fromDate, toDate, selectedMonth]);

  const filterRecords = () => {
    let filtered = [...records];
    
    // Filter by Employee ID or Name
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(rec => 
        rec.employeeId?.toString().toLowerCase().includes(term) ||
        rec.employeeName?.toLowerCase().includes(term)
      );
    }
    
    // Filter by Department
    if (filterDepartment) {
      filtered = filtered.filter(rec => rec.department === filterDepartment);
    }
    
    // Filter by Designation
    if (filterDesignation) {
      filtered = filtered.filter(rec => rec.designation === filterDesignation);
    }
    
    setFilteredRecords(filtered);
    setPagination(prev => ({
      ...prev,
      totalCount: filtered.length,
      totalPages: Math.ceil(filtered.length / prev.limit)
    }));
  };

  // Pagination calculations
  const indexOfLastRow = pagination.currentPage * pagination.limit;
  const indexOfFirstRow = indexOfLastRow - pagination.limit;
  const currentRows = filteredRecords.slice(indexOfFirstRow, indexOfLastRow);

  const handleItemsPerPageChange = (limit) => {
    setPagination({
      currentPage: 1,
      limit: limit,
      totalCount: filteredRecords.length,
      totalPages: Math.ceil(filteredRecords.length / limit)
    });
  };

  const fetchLateAttendance = async () => {
    try {
      setLoading(true);

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
      const activeEmployees = employees.filter(emp => !isEmployeeHidden(emp));
      const activeEmployeeIds = new Set(activeEmployees.map(emp => emp.employeeId || emp._id));
      
      // Extract unique values for filters
      extractUniqueValues(activeEmployees);

      const shiftsData = shiftsResp.data.success ? shiftsResp.data.data || [] : [];
      const masterShifts = masterShiftsResp.data.success ? masterShiftsResp.data.data || [] : [];

      const attendanceData = attendanceResp.data || [];
      const allAttendance = Array.isArray(attendanceData)
        ? attendanceData
        : attendanceData.records || attendanceData.allAttendance || [];

      setDebug({
        totalEmployees: employees.length,
        activeEmployees: activeEmployees.length,
        totalAttendance: allAttendance.length,
        fromDate,
        toDate,
        selectedMonth
      });

      const lateRecords = processLateRecords(allAttendance, employees, activeEmployeeIds, shiftsData, masterShifts);
      setRecords(lateRecords);

    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeShift = (employeeId, shiftsData, masterShifts) => {
    const shiftAssignment = shiftsData.find(s =>
      s.employeeAssignment?.employeeId === employeeId ||
      s.employeeId === employeeId
    );

    if (!shiftAssignment) return null;

    const shiftType = shiftAssignment.shiftType;
    const masterShift = masterShifts.find(shift => shift.shiftType === shiftType);

    if (!masterShift) {
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

    if (masterShift.isBrakeShift && masterShift.timeSlots && masterShift.timeSlots.length >= 2) {
      return {
        start: masterShift.timeSlots[0]?.timeRange?.split('-')[0]?.trim() || "07:00",
        end: masterShift.timeSlots[1]?.timeRange?.split('-')[1]?.trim() || "21:30",
        grace: 5,
        isBrakeShift: true
      };
    }

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

  const processLateRecords = (attendanceData, employees, activeEmployeeIds, shiftsData, masterShifts) => {
    const lateRecords = [];
    const lateByEmployee = {}; // For month grouping

    attendanceData.forEach(record => {
      if (!record.checkInTime) return;

      const recordDate = new Date(record.checkInTime);
      const recordDateStr = recordDate.toISOString().split('T')[0];
      const recordMonth = recordDateStr.slice(0, 7);

      // Apply filters
      let shouldInclude = false;
      
      // Check if record matches from-to date range
      if (fromDate && toDate) {
        const fromDateTime = new Date(fromDate);
        fromDateTime.setHours(0, 0, 0, 0);
        const toDateTime = new Date(toDate);
        toDateTime.setHours(23, 59, 59, 999);
        
        if (recordDate >= fromDateTime && recordDate <= toDateTime) {
          shouldInclude = true;
        }
      }
      
      // Check if record matches month filter
      if (selectedMonth && recordMonth === selectedMonth) {
        shouldInclude = true;
      }
      
      // If no date filters, include all
      if (!fromDate && !toDate && !selectedMonth) {
        shouldInclude = true;
      }

      if (!shouldInclude) return;

      const id = (typeof record.employeeId === 'object' 
        ? record.employeeId?.employeeId || record.employeeId?._id
        : record.employeeId);
      
      if (!id) return;
      if (!activeEmployeeIds.has(id)) return;

      const lateMinutes = calculateLateMinutes(id, record.checkInTime, shiftsData, masterShifts);
      if (lateMinutes > 0) {
        const emp = employees.find(e => (e.employeeId === id || e._id === id));
        const shift = getEmployeeShift(id, shiftsData, masterShifts);

        const recordObj = {
          _id: record._id || id + Date.now() + Math.random(),
          employeeId: id,
          employeeName: emp?.name || "Unknown",
          department: emp?.department || emp?.departmentName || "N/A",
          designation: emp?.designation || emp?.role || "N/A",
          shiftStart: shift?.start || "Not set",
          checkInTime: record.checkInTime,
          lateByMinutes: lateMinutes,
          shiftType: shift?.shiftType || "Unknown",
          isBrakeShift: shift?.isBrakeShift || false,
          expectedTime: shift?.start || "Not set",
          actualTime: new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: recordDateStr
        };

        lateRecords.push(recordObj);

        // For month grouping
        const key = id;
        if (!lateByEmployee[key]) {
          lateByEmployee[key] = {
            ...recordObj,
            lateByMinutes: lateMinutes,
            totalLateDays: 1,
            totalLateMinutes: lateMinutes
          };
        } else {
          lateByEmployee[key].totalLateDays++;
          lateByEmployee[key].totalLateMinutes += lateMinutes;
          lateByEmployee[key].lateByMinutes = lateByEmployee[key].totalLateMinutes;
        }
      }
    });

    // If month filter is applied, return grouped by employee
    if (selectedMonth && !fromDate && !toDate) {
      return Object.values(lateByEmployee).map(rec => ({
        ...rec,
        displayValue: `${rec.totalLateDays} day(s) (${rec.totalLateMinutes} mins)`
      })).sort((a, b) => b.lateByMinutes - a.lateByMinutes);
    }

    return lateRecords.sort((a, b) => b.lateByMinutes - a.lateByMinutes);
  };

  const getLateColor = (minutes) => {
    if (minutes <= 5) return 'text-green-600 bg-green-100';
    if (minutes <= 10) return 'text-lime-600 bg-lime-100';
    if (minutes <= 20) return 'text-yellow-600 bg-yellow-100';
    if (minutes <= 30) return 'text-orange-600 bg-orange-100';
    if (minutes <= 45) return 'text-red-600 bg-red-100';
    if (minutes <= 55) return 'text-red-700 bg-red-200';
    if (minutes <= 65) return 'text-red-800 bg-red-300';
    return 'text-red-900 bg-red-400';
  };

  return (
    <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="mx-auto max-w-9xl">
        {/* Filters */}
        <div className="p-3 mb-3 bg-white rounded-lg shadow-md">
          <div className="flex flex-wrap items-center gap-2">
            
            {/* ID/Name Search */}
            <div className="relative flex-1 min-w-[180px]">
              <FaSearch className="absolute text-sm text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
              <input
                type="text"
                placeholder="Search by ID or Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Department Filter Button */}
            <div className="relative" ref={departmentFilterRef}>
              <button
                onClick={() => setShowDepartmentFilter(!showDepartmentFilter)}
                className={`h-8 px-3 text-xs font-medium rounded-md transition flex items-center gap-1 ${
                  filterDepartment 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                <FaBuilding className="text-xs" /> Dept {filterDepartment && `: ${filterDepartment}`}
              </button>
              
              {/* Department Filter Dropdown */}
              {showDepartmentFilter && (
                <div className="absolute z-50 w-48 mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
                  <div 
                    onClick={() => {
                      setFilterDepartment('');
                      setShowDepartmentFilter(false);
                    }}
                    className="px-3 py-2 text-xs font-medium text-gray-700 border-b border-gray-100 cursor-pointer hover:bg-blue-50"
                  >
                    All Departments
                  </div>
                  {uniqueDepartments.map(dept => (
                    <div 
                      key={dept}
                      onClick={() => {
                        setFilterDepartment(dept);
                        setShowDepartmentFilter(false);
                      }}
                      className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer ${
                        filterDepartment === dept ? 'bg-blue-50 text-blue-700 font-medium' : ''
                      }`}
                    >
                      {dept}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Designation Filter Button */}
            <div className="relative" ref={designationFilterRef}>
              <button
                onClick={() => setShowDesignationFilter(!showDesignationFilter)}
                className={`h-8 px-3 text-xs font-medium rounded-md transition flex items-center gap-1 ${
                  filterDesignation 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                <FaUserTag className="text-xs" /> Desig {filterDesignation && `: ${filterDesignation}`}
              </button>
              
              {/* Designation Filter Dropdown */}
              {showDesignationFilter && (
                <div className="absolute z-50 w-48 mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
                  <div 
                    onClick={() => {
                      setFilterDesignation('');
                      setShowDesignationFilter(false);
                    }}
                    className="px-3 py-2 text-xs font-medium text-gray-700 border-b border-gray-100 cursor-pointer hover:bg-blue-50"
                  >
                    All Designations
                  </div>
                  {uniqueDesignations.map(des => (
                    <div 
                      key={des}
                      onClick={() => {
                        setFilterDesignation(des);
                        setShowDesignationFilter(false);
                      }}
                      className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer ${
                        filterDesignation === des ? 'bg-blue-50 text-blue-700 font-medium' : ''
                      }`}
                    >
                      {des}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* From Date */}
            <div className="relative w-[150px]">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 pointer-events-none">
                From:
              </span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className="w-full pl-12 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* To Date */}
            <div className="relative w-[150px]">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 pointer-events-none">
                To:
              </span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className="w-full pl-10 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Month Selector */}
            <div className="relative w-[150px]">
              <FaCalendarAlt className="absolute text-xs text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Clear Filters Button */}
            {(searchTerm || filterDepartment || filterDesignation || fromDate || toDate) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterDepartment("");
                  setFilterDesignation("");
                  setFromDate("");
                  setToDate("");
                  setSelectedMonth(new Date().toISOString().slice(0, 7));
                }}
                className="h-8 px-3 text-xs font-medium text-gray-600 transition bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center bg-white rounded-lg shadow-md">
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
              <span className="ml-2 text-gray-600">Loading late attendance...</span>
            </div>
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-white rounded-lg shadow-md">
            <p className="text-red-600">{error}</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-lg shadow-md">
            <p className="text-lg text-gray-500">No late arrivals found</p>
            <p className="mt-2 text-sm text-gray-400">
              {fromDate && toDate 
                ? `From ${fromDate} to ${toDate}` 
                : selectedMonth 
                ? `For month: ${selectedMonth}`
                : "Try selecting a date range or month"}
              {(searchTerm || filterDepartment || filterDesignation) && " - Try clearing filters"}
            </p>
          </div>
        ) : (
          <>
            {/* Activities Table */}
            <div className="mb-6 overflow-hidden bg-white rounded-lg shadow-lg">
              <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
                <table className="min-w-full">
                  <thead className="text-xs text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
                    <tr>
                      <th className="px-2 py-2 text-center">Employee ID</th>
                      <th className="px-2 py-2 text-center">Name</th>
                      <th className="px-2 py-2 text-center">Department</th>
                      <th className="px-2 py-2 text-center">Designation</th>
                      <th className="px-2 py-2 text-center">Expected Time</th>
                      <th className="px-2 py-2 text-center">Actual Time</th>
                      <th className="px-2 py-2 text-center">Date</th>
                      <th className="px-2 py-2 text-center">Late By</th>
                      <th className="px-2 py-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentRows.map((rec) => (
                      <tr key={rec._id} className="text-xs transition-colors hover:bg-gray-50">
                        <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
                          {rec.employeeId}
                        </td>
                        <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
                          {rec.employeeName || "-"}
                        </td>
                        <td className="px-2 py-2 text-center text-gray-600">
                          {rec.department}
                        </td>
                        <td className="px-2 py-2 text-center text-gray-600">
                          {rec.designation}
                        </td>
                        <td className="px-2 py-2 font-medium text-center text-blue-600">
                          {rec.expectedTime || "-"}
                        </td>
                        <td className="px-2 py-2 font-medium text-center text-orange-600">
                          {rec.actualTime || "-"}
                        </td>
                        <td className="px-2 py-2 text-center text-gray-600">
                          {rec.date || (rec.checkInTime ? new Date(rec.checkInTime).toLocaleDateString() : '-')}
                        </td>
                        <td className="px-2 py-2 text-center">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${getLateColor(rec.lateByMinutes)}`}>
                            {selectedMonth && !fromDate && !toDate && rec.totalLateDays 
                              ? `${rec.totalLateDays} day(s)` 
                              : `${rec.lateByMinutes} mins`}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-center">
                          <span className="px-2 py-1 text-[10px] font-semibold text-yellow-700 bg-yellow-100 rounded-full">
                            Late
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredRecords.length > 0 && (
                <div className="flex items-center justify-between px-2 py-2 border-t border-gray-200 bg-gray-50">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-700">
                    <span>Showing</span>
                    <span className="font-medium">
                      {(pagination.currentPage - 1) * pagination.limit + 1}
                    </span>
                    <span>to</span>
                    <span className="font-medium">
                      {Math.min(
                        pagination.currentPage * pagination.limit,
                        pagination.totalCount
                      )}
                    </span>
                    <span>of</span>
                    <span className="font-medium">
                      {pagination.totalCount}
                    </span>
                    <span>results</span>

                    {/* Select Dropdown */}
                    <select
                      value={pagination.limit}
                      onChange={(e) => {
                        const newLimit = Number(e.target.value);
                        handleItemsPerPageChange(newLimit);
                      }}
                      className="p-1 ml-1 text-xs border rounded-lg"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          currentPage: prev.currentPage - 1,
                        }))
                      }
                      disabled={pagination.currentPage === 1}
                      className="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    <div className="flex items-center gap-0.5">
                      {[...Array(pagination.totalPages)].map((_, index) => {
                        const page = index + 1;
                        if (
                          page === 1 ||
                          page === pagination.totalPages ||
                          (page >= pagination.currentPage - 1 &&
                            page <= pagination.currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() =>
                                setPagination((prev) => ({
                                  ...prev,
                                  currentPage: page,
                                }))
                              }
                              className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                                pagination.currentPage === page
                                  ? "bg-blue-600 text-white"
                                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (
                          page === pagination.currentPage - 2 ||
                          page === pagination.currentPage + 2
                        ) {
                          return (
                            <span key={page} className="px-1 text-xs text-gray-500">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          currentPage: prev.currentPage + 1,
                        }))
                      }
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LateToday;