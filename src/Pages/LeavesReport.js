// import axios from "axios";
// import { useEffect, useState } from "react";

// const LeavesReport = () => {
//   const [approvedLeaves, setApprovedLeaves] = useState([]);

//   const fetchApprovedLeaves = async () => {
//     try {
//       const res = await axios.get("https://api.timelyhealth.in/api/leaves/approved-leaves");
//       setApprovedLeaves(res.data);
//     } catch (err) {
//       console.error("Failed to fetch approved leaves:", err);
//     }
//   };

//   useEffect(() => {
//     fetchApprovedLeaves();
//   }, []);

//   return (
//     <div className="max-w-6xl p-6 mx-auto mt-6 bg-white rounded-lg shadow-md">
//       <h1 className="mb-6 text-3xl font-bold text-center">Approved Leaves Report</h1>

//       <div className="overflow-x-auto">
//         <table className="min-w-full text-sm border border-gray-300">
//           <thead className="text-gray-700 bg-gray-100">
//             <tr>
//               <th className="px-4 py-2 border">Employee</th>
//               <th className="px-4 py-2 border">Leave Type</th>
//               <th className="px-4 py-2 border">Start Date</th>
//               <th className="px-4 py-2 border">End Date</th>
//               <th className="px-4 py-2 border">Days</th>
//               <th className="px-4 py-2 border">Reason</th>
//               <th className="px-4 py-2 border">Status</th>
//             </tr>
//           </thead>
//           <tbody>
//             {approvedLeaves.length > 0 ? (
//               approvedLeaves.map((l) => (
//                 <tr key={l._id} className="border-b hover:bg-gray-50">
//                   <td className="px-4 py-2 font-medium">{l.employeeName}</td>
//                   <td className="px-4 py-2 capitalize">{l.leaveType}</td>
//                   <td className="px-4 py-2">
//                     {new Date(l.startDate).toLocaleDateString()}
//                   </td>
//                   <td className="px-4 py-2">
//                     {new Date(l.endDate).toLocaleDateString()}
//                   </td>
//                   <td className="px-4 py-2">{l.days}</td>
//                   <td className="px-4 py-2">{l.reason}</td>
//                   <td className="px-4 py-2 font-semibold text-center text-green-700">
//                     Approved
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="7" className="py-6 text-center text-gray-500">
//                   No approved leaves found.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default LeavesReport;




// import axios from "axios";
// import { useEffect, useState } from "react";

// const LeaveReport = () => {
//   const [approvedLeaves, setApprovedLeaves] = useState([]);

//   const fetchApprovedLeaves = async () => {
//     try {
//       const res = await axios.get("https://api.timelyhealth.in/api/leaves/leaves");
//       // ✅ Filter only approved leaves
//       const approved = (res.data.records || res.data).filter(
//         (l) => l.status?.toLowerCase() === "approved"
//       );
//       setApprovedLeaves(approved);
//     } catch (err) {
//       console.error("Failed to fetch approved leaves:", err);
//     }
//   };

//   useEffect(() => {
//     fetchApprovedLeaves();
//   }, []);

//   return (
//     <div className="max-w-6xl p-6 mx-auto mt-6 bg-white rounded-lg shadow-md">
//       <h1 className="mb-6 text-3xl font-bold text-center">Approved Leaves Report</h1>

//       <div className="overflow-x-auto">
//         <table className="min-w-full text-sm border border-gray-300">
//           <thead className="text-gray-700 bg-gray-100">
//             <tr>
//               <th className="px-4 py-2 border">Employee</th>
//               <th className="px-4 py-2 border">Leave Type</th>
//               <th className="px-4 py-2 border">Start Date</th>
//               <th className="px-4 py-2 border">End Date</th>
//               <th className="px-4 py-2 border">Days</th>
//               <th className="px-4 py-2 border">Reason</th>
//             </tr>
//           </thead>
//           <tbody>
//             {approvedLeaves.length > 0 ? (
//               approvedLeaves.map((l) => (
//                 <tr key={l._id} className="border-b hover:bg-gray-50">
//                   <td className="px-4 py-2 font-medium">{l.employeeName}</td>
//                   <td className="px-4 py-2 capitalize">{l.leaveType}</td>
//                   <td className="px-4 py-2">{new Date(l.startDate).toLocaleDateString()}</td>
//                   <td className="px-4 py-2">{new Date(l.endDate).toLocaleDateString()}</td>
//                   <td className="px-4 py-2">{l.days}</td>
//                   <td className="px-4 py-2">{l.reason}</td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="6" className="py-6 text-center text-gray-500">
//                   No approved leaves found.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default LeaveReport;


// import axios from "axios";
// import { useEffect, useState } from "react";

// const LeaveReport = () => {
//   const [approvedLeaves, setApprovedLeaves] = useState([]);

//   const fetchApprovedLeaves = async () => {
//     try {
//       const res = await axios.get("https://api.timelyhealth.in/api/leaves/leaves");
//       // ✅ Filter only approved leaves
//       const approved = (res.data.records || res.data).filter(
//         (l) => l.status?.toLowerCase() === "approved"
//       );
//       setApprovedLeaves(approved);
//     } catch (err) {
//       console.error("Failed to fetch approved leaves:", err);
//     }
//   };

//   useEffect(() => {
//     fetchApprovedLeaves();
//   }, []);

//   // ✅ Function to download CSV
//   const downloadCSV = () => {
//     if (approvedLeaves.length === 0) {
//       alert("No approved leave data available to download!");
//       return;
//     }

//     const headers = [
//       "Employee Name,Leave Type,Start Date,End Date,Days,Reason",
//     ];
//     const rows = approvedLeaves.map((l) =>
//       [
//         l.employeeName,
//         l.leaveType,
//         new Date(l.startDate).toLocaleDateString(),
//         new Date(l.endDate).toLocaleDateString(),
//         l.days,
//         `"${l.reason}"`,
//       ].join(",")
//     );

//     const csvContent = [headers, ...rows].join("\n");
//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = "Approved_Leave_Report.csv";
//     link.click();
//   };

//   return (
//     <div className="max-w-6xl p-6 mx-auto mt-6 bg-white rounded-lg shadow-md">
//       <div className="flex items-center justify-between mb-6">
//         <h1 className="text-3xl font-bold">Approved Leave Requests</h1>
//         <button
//           onClick={downloadCSV}
//           className="px-4 py-2 text-white transition bg-green-600 rounded hover:bg-green-700"
//         >
//           ⬇️ Download CSV
//         </button>
//       </div>

//       <div className="overflow-x-auto">
//         <table className="min-w-full text-sm border border-gray-300">
//           <thead className="text-gray-700 bg-gray-100">
//             <tr>
//               <th className="px-4 py-2 border">Employee</th>
//               <th className="px-4 py-2 border">Leave Type</th>
//               <th className="px-4 py-2 border">Start Date</th>
//               <th className="px-4 py-2 border">End Date</th>
//               <th className="px-4 py-2 border">Days</th>
//               <th className="px-4 py-2 border">Reason</th>
//             </tr>
//           </thead>
//           <tbody>
//             {approvedLeaves.length > 0 ? (
//               approvedLeaves.map((l) => (
//                 <tr key={l._id} className="border-b hover:bg-gray-50">
//                   <td className="px-4 py-2 font-medium">{l.employeeName}</td>
//                   <td className="px-4 py-2 capitalize">{l.leaveType}</td>
//                   <td className="px-4 py-2">
//                     {new Date(l.startDate).toLocaleDateString()}
//                   </td>
//                   <td className="px-4 py-2">
//                     {new Date(l.endDate).toLocaleDateString()}
//                   </td>
//                   <td className="px-4 py-2">{l.days}</td>
//                   <td className="px-4 py-2">{l.reason}</td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="6" className="py-6 text-center text-gray-500">
//                   No approved leaves found.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default LeaveReport;


// import axios from "axios";
// import { useEffect, useState } from "react";

// const LeaveReport = () => {
//   const [approvedLeaves, setApprovedLeaves] = useState([]);
//   const [filteredLeaves, setFilteredLeaves] = useState([]);
//   const [selectedMonth, setSelectedMonth] = useState("");

//   // ✅ Fetch all approved leaves
//   const fetchApprovedLeaves = async () => {
//     try {
//       const res = await axios.get("https://api.timelyhealth.in/api/leaves/leaves");
//       const approved = (res.data.records || res.data).filter(
//         (l) => l.status?.toLowerCase() === "approved"
//       );
//       setApprovedLeaves(approved);
//       setFilteredLeaves(approved);
//     } catch (err) {
//       console.error("Failed to fetch approved leaves:", err);
//     }
//   };

//   useEffect(() => {
//     fetchApprovedLeaves();
//   }, []);

//   // ✅ Handle Month Change
//   const handleMonthChange = (e) => {
//     const month = e.target.value;
//     setSelectedMonth(month);

//     if (!month) {
//       setFilteredLeaves(approvedLeaves);
//       return;
//     }

//     const [year, selectedMonthNum] = month.split("-");
//     const filtered = approvedLeaves.filter((l) => {
//       const leaveDate = new Date(l.startDate);
//       return (
//         leaveDate.getFullYear().toString() === year &&
//         (leaveDate.getMonth() + 1).toString().padStart(2, "0") === selectedMonthNum
//       );
//     });

//     setFilteredLeaves(filtered);
//   };

//   // ✅ Download CSV
//   const downloadCSV = () => {
//     if (filteredLeaves.length === 0) {
//       alert("No approved leave data available to download!");
//       return;
//     }

//     const headers = ["Employee Name,Leave Type,Start Date,End Date,Days,Reason"];
//     const rows = filteredLeaves.map((l) =>
//       [
//         l.employeeName,
//         l.leaveType,
//         new Date(l.startDate).toLocaleDateString(),
//         new Date(l.endDate).toLocaleDateString(),
//         l.days,
//         `"${l.reason}"`,
//       ].join(",")
//     );

//     const csvContent = [headers, ...rows].join("\n");
//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);

//     const fileName = selectedMonth
//       ? `Approved_Leaves_${selectedMonth}.csv`
//       : "Approved_Leaves_All.csv";

//     link.download = fileName;
//     link.click();
//   };

//   return (
//     <div className="max-w-6xl p-6 mx-auto mt-6 bg-white rounded-lg shadow-md">
//       {/* Header Section */}
//       <div className="flex flex-col items-center justify-between gap-4 mb-6 md:flex-row">
//         <h1 className="text-3xl font-bold">Approved Leave Requests</h1>

//         <div className="flex items-center gap-3">
//           {/* ✅ Month Picker */}
//           <input
//             type="month"
//             value={selectedMonth}
//             onChange={handleMonthChange}
//             className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-green-200"
//           />
//           <button
//             onClick={downloadCSV}
//             className="px-4 py-2 text-white transition bg-green-600 rounded hover:bg-green-700"
//           >
//             ⬇️ Download CSV
//           </button>
//         </div>
//       </div>

//       {/* ✅ Total Leaves Info */}
//       <div className="mb-4 text-lg font-semibold text-gray-700">
//         Total Approved Leaves:{" "}
//         <span className="text-green-700">{filteredLeaves.length}</span>
//         {selectedMonth && (
//           <span className="ml-2 text-sm text-gray-500">
//             (for {new Date(selectedMonth).toLocaleString("default", { month: "long", year: "numeric" })})
//           </span>
//         )}
//       </div>

//       {/* ✅ Table */}
//       <div className="overflow-x-auto">
//         <table className="min-w-full text-sm border border-gray-300">
//           <thead className="text-gray-700 bg-gray-100">
//             <tr>
//               <th className="px-4 py-2 border">Employee</th>
//               <th className="px-4 py-2 border">Leave Type</th>
//               <th className="px-4 py-2 border">Start Date</th>
//               <th className="px-4 py-2 border">End Date</th>
//               <th className="px-4 py-2 border">Days</th>
//               <th className="px-4 py-2 border">Reason</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredLeaves.length > 0 ? (
//               filteredLeaves.map((l) => (
//                 <tr key={l._id} className="border-b hover:bg-gray-50">
//                   <td className="px-4 py-2 font-medium">{l.employeeName}</td>
//                   <td className="px-4 py-2 capitalize">{l.leaveType}</td>
//                   <td className="px-4 py-2">
//                     {new Date(l.startDate).toLocaleDateString()}
//                   </td>
//                   <td className="px-4 py-2">
//                     {new Date(l.endDate).toLocaleDateString()}
//                   </td>
//                   <td className="px-4 py-2">{l.days}</td>
//                   <td className="px-4 py-2">{l.reason}</td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="6" className="py-6 text-center text-gray-500">
//                   No approved leaves found for this month.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default LeaveReport;

// import axios from "axios";
// import { useEffect, useMemo, useState } from "react";
// import {
//   Bar,
//   BarChart,
//   CartesianGrid,
//   ResponsiveContainer,
//   Tooltip,
//   XAxis,
//   YAxis,
// } from "recharts";
// import { isEmployeeHidden } from "../utils/employeeStatus";

// const LeaveReport = () => {
//   const [approvedLeaves, setApprovedLeaves] = useState([]);
//   const [filteredLeaves, setFilteredLeaves] = useState([]);
//   const [selectedMonth, setSelectedMonth] = useState("");
//   const [selectedEmployee, setSelectedEmployee] = useState("");
//   const [selectedType, setSelectedType] = useState("");

//   // ✅ Fetch all approved leaves and employees
//   const fetchApprovedLeaves = async () => {
//     try {
//       const [leavesRes, empRes] = await Promise.all([
//         axios.get("https://api.timelyhealth.in/api/leaves/leaves?status=approved"),
//         axios.get("https://api.timelyhealth.in/api/employees/get-employees")
//       ]);

//       const employees = empRes.data || [];
//       const allLeaves = leavesRes.data.records || leavesRes.data;

//       const approved = allLeaves.filter((l) => {
//         if (l.status?.toLowerCase() !== "approved") return false;

//         // Find employee to check status
//         const emp = employees.find(e => e.employeeId === l.employeeId || e._id === l.employeeId);

//         // Use central utility with employee object (or fallback to ID check)
//         return !isEmployeeHidden(emp || { employeeId: l.employeeId });
//       });

//       setApprovedLeaves(approved);
//       setFilteredLeaves(approved);
//     } catch (err) {
//       console.error("Failed to fetch data:", err);
//     }
//   };

//   useEffect(() => {
//     fetchApprovedLeaves();
//   }, []);

//   // ✅ Unique employee and leave type lists
//   const employees = [...new Set(approvedLeaves.map((l) => l.employeeName))];
//   const leaveTypes = [...new Set(approvedLeaves.map((l) => l.leaveType))];

//   // ✅ Filter function
//   useEffect(() => {
//     let filtered = [...approvedLeaves];

//     if (selectedMonth) {
//       const [year, selectedMonthNum] = selectedMonth.split("-");
//       filtered = filtered.filter((l) => {
//         const leaveDate = new Date(l.startDate);
//         return (
//           leaveDate.getFullYear().toString() === year &&
//           (leaveDate.getMonth() + 1).toString().padStart(2, "0") === selectedMonthNum
//         );
//       });
//     }

//     if (selectedEmployee) {
//       filtered = filtered.filter((l) => l.employeeName === selectedEmployee);
//     }

//     if (selectedType) {
//       filtered = filtered.filter((l) => l.leaveType === selectedType);
//     }

//     setFilteredLeaves(filtered);
//   }, [selectedMonth, selectedEmployee, selectedType, approvedLeaves]);

//   // ✅ Download CSV
//   const downloadCSV = () => {
//     if (filteredLeaves.length === 0) {
//       alert("No approved leave data available to download!");
//       return;
//     }

//     const headers = ["Employee Name,Leave Type,Start Date,End Date,Days,Reason"];
//     const rows = filteredLeaves.map((l) =>
//       [
//         l.employeeName,
//         l.leaveType,
//         new Date(l.startDate).toLocaleDateString(),
//         new Date(l.endDate).toLocaleDateString(),
//         l.days,
//         `"${l.reason}"`,
//       ].join(",")
//     );

//     const csvContent = [headers, ...rows].join("\n");
//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);

//     const fileName = selectedMonth
//       ? `Approved_Leaves_${selectedMonth}.csv`
//       : "Approved_Leaves_All.csv";

//     link.download = fileName;
//     link.click();
//   };

//   // ✅ Chart Data - Who took the most leaves
//   const leaveCountData = useMemo(() => {
//     const countMap = {};
//     approvedLeaves.forEach((l) => {
//       countMap[l.employeeName] = (countMap[l.employeeName] || 0) + l.days;
//     });
//     return Object.entries(countMap).map(([name, totalDays]) => ({
//       name,
//       totalDays,
//     }));
//   }, [approvedLeaves]);

//   return (
//     <div className="p-6 mx-auto mt-6 bg-white rounded-lg shadow-md max-w-7xl">

//       <div className="grid grid-cols-3 gap-2 mb-4">

//         <div className="px-3 py-2 text-center rounded-md shadow-sm bg-green-50">
//           <p className="text-[11px] text-gray-500 leading-tight">
//             Approved Leaves
//           </p>
//           <h2 className="text-sm font-semibold leading-tight text-green-700">
//             {filteredLeaves.length}
//           </h2>
//         </div>

//         <div className="px-3 py-2 text-center rounded-md shadow-sm bg-blue-50">
//           <p className="text-[11px] text-gray-500 leading-tight">
//             Employees
//           </p>
//           <h2 className="text-sm font-semibold leading-tight text-blue-700">
//             {employees.length}
//           </h2>
//         </div>

//         <div className="px-3 py-2 text-center rounded-md shadow-sm bg-yellow-50">
//           <p className="text-[11px] text-gray-500 leading-tight">
//             Leave Types
//           </p>
//           <h2 className="text-sm font-semibold leading-tight text-yellow-700">
//             {leaveTypes.length}
//           </h2>
//         </div>

//       </div>
//       {/* Header */}
//       <div className="flex flex-col items-center justify-between gap-4 mb-6 md:flex-row">
//         <h1 className="text-3xl font-bold">Approved Leave Reports</h1>

//         <div className="flex flex-wrap items-center gap-3">
//           <input
//             type="month"
//             value={selectedMonth}
//             onChange={(e) => setSelectedMonth(e.target.value)}
//             className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-green-200"
//           />

//           <select
//             value={selectedEmployee}
//             onChange={(e) => setSelectedEmployee(e.target.value)}
//             className="px-3 py-2 border border-gray-300 rounded"
//           >
//             <option value="">All Employees</option>
//             {employees.map((name) => (
//               <option key={name} value={name}>
//                 {name}
//               </option>
//             ))}
//           </select>

//           <select
//             value={selectedType}
//             onChange={(e) => setSelectedType(e.target.value)}
//             className="px-3 py-2 border border-gray-300 rounded"
//           >
//             <option value="">All Leave Types</option>
//             {leaveTypes.map((t) => (
//               <option key={t} value={t}>
//                 {t}
//               </option>
//             ))}
//           </select>

//           <button
//             onClick={downloadCSV}
//             className="px-4 py-2 text-white transition bg-green-600 rounded hover:bg-green-700"
//           >
//             ⬇️ Download CSV
//           </button>
//         </div>
//       </div>

//       {/* ✅ Stats Summary */}
//       {/* <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
//         <div className="p-4 text-center rounded-lg shadow bg-green-50">
//           <p className="text-sm text-gray-600">Total Approved Leaves</p>
//           <h2 className="text-2xl font-bold text-green-700">{filteredLeaves.length}</h2>
//         </div>

//         <div className="p-4 text-center rounded-lg shadow bg-blue-50">
//           <p className="text-sm text-gray-600">Total Employees</p>
//           <h2 className="text-2xl font-bold text-blue-700">{employees.length}</h2>
//         </div>

//         <div className="p-4 text-center rounded-lg shadow bg-yellow-50">
//           <p className="text-sm text-gray-600">Leave Types</p>
//           <h2 className="text-2xl font-bold text-yellow-700">{leaveTypes.length}</h2>
//         </div>
//       </div> */}

//       {/* <div className="grid grid-cols-3 gap-2 mb-4">
  
//   <div className="px-3 py-2 text-center rounded-md shadow-sm bg-green-50">
//     <p className="text-[11px] text-gray-500 leading-tight">
//       Approved Leaves
//     </p>
//     <h2 className="text-sm font-semibold leading-tight text-green-700">
//       {filteredLeaves.length}
//     </h2>
//   </div>

//   <div className="px-3 py-2 text-center rounded-md shadow-sm bg-blue-50">
//     <p className="text-[11px] text-gray-500 leading-tight">
//       Employees
//     </p>
//     <h2 className="text-sm font-semibold leading-tight text-blue-700">
//       {employees.length}
//     </h2>
//   </div>

//   <div className="px-3 py-2 text-center rounded-md shadow-sm bg-yellow-50">
//     <p className="text-[11px] text-gray-500 leading-tight">
//       Leave Types
//     </p>
//     <h2 className="text-sm font-semibold leading-tight text-yellow-700">
//       {leaveTypes.length}
//     </h2>
//   </div>

// </div> */}


//       {/* ✅ Bar Chart */}
//       {/* <div className="p-4 mb-8 rounded-lg shadow bg-gray-50">
//         <h2 className="mb-4 text-xl font-semibold text-gray-800">
//           📊 Who Took the Most Leaves
//         </h2>
//         {leaveCountData.length > 0 ? (
//           <ResponsiveContainer width="100%" height={300}>
//             <BarChart data={leaveCountData}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="name" />
//               <YAxis />
//               <Tooltip />
//               <Bar dataKey="totalDays" fill="#16a34a" />
//             </BarChart>
//           </ResponsiveContainer>
//         ) : (
//           <p className="py-8 text-center text-gray-500">No data available</p>
//         )}
//       </div> */}
//       {/* <h1 className="text-3xl font-bold">Approved Leave Reports</h1> <br/> */}
//       {/* ✅ Leave Table */}
//       <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
//         <table className="min-w-full">
//           <thead className="text-sm text-left text-white bg-gradient-to-r from-purple-500 to-blue-600">
//             <tr>
//               <th className="px-4 py-2 border">Name</th>
//               <th className="px-4 py-2 border">Leave Type</th>
//               <th className="px-4 py-2 border">Start Date</th>
//               <th className="px-4 py-2 border">End Date</th>
//               <th className="px-4 py-2 border">Days</th>
//               <th className="px-4 py-2 border">Reason</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredLeaves.length > 0 ? (
//               filteredLeaves.map((l) => (
//                 <tr key={l._id} className="border-b hover:bg-gray-50">
//                   <td className="px-4 py-2 font-medium">{l.employeeName}</td>
//                   <td className="px-4 py-2 capitalize">{l.leaveType}</td>
//                   <td className="px-4 py-2">{new Date(l.startDate).toLocaleDateString()}</td>
//                   <td className="px-4 py-2">{new Date(l.endDate).toLocaleDateString()}</td>
//                   <td className="px-4 py-2">{l.days}</td>
//                   <td className="px-4 py-2">{l.reason}</td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="6" className="py-6 text-center text-gray-500">
//                   No approved leaves found for this selection.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       <div className="p-4 mb-8 rounded-lg shadow bg-gray-50">
//         <h2 className="mb-4 text-xl font-semibold text-gray-800">
//           📊 Who Took the Most Leaves
//         </h2>
//         {leaveCountData.length > 0 ? (
//           <ResponsiveContainer width="100%" height={300}>
//             <BarChart data={leaveCountData}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="name" />
//               <YAxis />
//               <Tooltip />
//               <Bar dataKey="totalDays" fill="#16a34a" />
//             </BarChart>
//           </ResponsiveContainer>
//         ) : (
//           <p className="py-8 text-center text-gray-500">No data available</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default LeaveReport;



// import axios from "axios";
// import { useEffect, useMemo, useState } from "react";
// import { FaCalendarAlt, FaSearch } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";
// import {
//   Bar,
//   BarChart,
//   CartesianGrid,
//   ResponsiveContainer,
//   Tooltip,
//   XAxis,
//   YAxis,
// } from "recharts";
// import { API_BASE_URL } from "../config";
// import { isEmployeeHidden } from "../utils/employeeStatus";

// const LeaveReport = () => {
//   const [approvedLeaves, setApprovedLeaves] = useState([]);
//   const [filteredLeaves, setFilteredLeaves] = useState([]);
//   const [selectedMonth, setSelectedMonth] = useState("");
//   const [selectedEmployee, setSelectedEmployee] = useState("");
//   const [selectedType, setSelectedType] = useState("");
//   const [loading, setLoading] = useState(true);

//   // Pagination states
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(10);

//   const navigate = useNavigate();

//   // ✅ Fetch all approved leaves and employees
//   const fetchApprovedLeaves = async () => {
//     try {
//       setLoading(true);
//       const [leavesRes, empRes] = await Promise.all([
//         axios.get(`${API_BASE_URL}/leaves/leaves?status=approved`),
//         axios.get(`${API_BASE_URL}/employees/get-employees`)
//       ]);

//       const employees = empRes.data || [];
//       const allLeaves = leavesRes.data.records || leavesRes.data;

//       const approved = allLeaves.filter((l) => {
//         if (l.status?.toLowerCase() !== "approved") return false;

//         // Find employee to check status
//         const emp = employees.find(e => e.employeeId === l.employeeId || e._id === l.employeeId);

//         // Use central utility with employee object (or fallback to ID check)
//         return !isEmployeeHidden(emp || { employeeId: l.employeeId });
//       });

//       setApprovedLeaves(approved);
//       setFilteredLeaves(approved);
//       setCurrentPage(1);
//     } catch (err) {
//       console.error("Failed to fetch data:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchApprovedLeaves();
//   }, []);

//   // ✅ Unique employee and leave type lists
//   const employees = [...new Set(approvedLeaves.map((l) => l.employeeName))];
//   const leaveTypes = [...new Set(approvedLeaves.map((l) => l.leaveType))];

//   // ✅ Filter function
//   useEffect(() => {
//     let filtered = [...approvedLeaves];

//     if (selectedMonth) {
//       const [year, selectedMonthNum] = selectedMonth.split("-");
//       filtered = filtered.filter((l) => {
//         const leaveDate = new Date(l.startDate);
//         return (
//           leaveDate.getFullYear().toString() === year &&
//           (leaveDate.getMonth() + 1).toString().padStart(2, "0") === selectedMonthNum
//         );
//       });
//     }

//     if (selectedEmployee) {
//       filtered = filtered.filter((l) => l.employeeName === selectedEmployee);
//     }

//     if (selectedType) {
//       filtered = filtered.filter((l) => l.leaveType === selectedType);
//     }

//     setFilteredLeaves(filtered);
//     setCurrentPage(1); // Reset to first page on filter change
//   }, [selectedMonth, selectedEmployee, selectedType, approvedLeaves]);

//   // ✅ Clear Filters
//   const clearFilters = () => {
//     setSelectedMonth("");
//     setSelectedEmployee("");
//     setSelectedType("");
//   };

//   // ✅ Download CSV
//   const downloadCSV = () => {
//     if (filteredLeaves.length === 0) {
//       alert("No approved leave data available to download!");
//       return;
//     }

//     const headers = ["Employee Name,Leave Type,Start Date,End Date,Days,Reason"];
//     const rows = filteredLeaves.map((l) =>
//       [
//         l.employeeName,
//         l.leaveType,
//         new Date(l.startDate).toLocaleDateString(),
//         new Date(l.endDate).toLocaleDateString(),
//         l.days,
//         `"${l.reason}"`,
//       ].join(",")
//     );

//     const csvContent = [headers, ...rows].join("\n");
//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);

//     const fileName = selectedMonth
//       ? `Approved_Leaves_${selectedMonth}.csv`
//       : "Approved_Leaves_All.csv";

//     link.download = fileName;
//     link.click();
//   };

//   // ✅ Chart Data - Who took the most leaves
//   const leaveCountData = useMemo(() => {
//     const countMap = {};
//     approvedLeaves.forEach((l) => {
//       countMap[l.employeeName] = (countMap[l.employeeName] || 0) + l.days;
//     });
//     return Object.entries(countMap).map(([name, totalDays]) => ({
//       name,
//       totalDays,
//     }));
//   }, [approvedLeaves]);

//   // ✅ Pagination Handlers
//   const handleItemsPerPageChange = (e) => {
//     setItemsPerPage(Number(e.target.value));
//     setCurrentPage(1);
//   };

//   const handlePrevPage = () => {
//     if (currentPage > 1) setCurrentPage(currentPage - 1);
//   };

//   const handleNextPage = () => {
//     if (currentPage < totalPages) setCurrentPage(currentPage + 1);
//   };

//   const handlePageClick = (page) => {
//     setCurrentPage(page);
//   };

//   const getPageNumbers = () => {
//     const pageNumbers = [];
//     for (let i = 1; i <= totalPages; i++) {
//       if (
//         i === 1 ||
//         i === totalPages ||
//         (i >= currentPage - 2 && i <= currentPage + 2)
//       ) {
//         pageNumbers.push(i);
//       } else if (i === currentPage - 3 || i === currentPage + 3) {
//         pageNumbers.push("...");
//       }
//     }
//     return pageNumbers;
//   };

//   // Calculate pagination
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentItems = filteredLeaves.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage);

//   // ✅ Stat Box
//   const StatCard = ({ label, value, color }) => (
//     <div
//       className={`bg-white rounded-lg p-3 shadow-sm border-t-4 ${color} text-center`}
//     >
//       <div className="text-lg font-bold">{value}</div>
//       <div className="text-xs font-medium text-gray-700">{label}</div>
//     </div>
//   );

//   // ✅ Loading Screen
//   if (loading)
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
//         <div className="text-center">
//           <div className="w-12 h-12 mx-auto mb-3 border-b-2 border-purple-600 rounded-full animate-spin"></div>
//           <p className="font-semibold text-gray-600">
//             Loading leave reports...
//           </p>
//         </div>
//       </div>
//     );

//   return (
//     <div className="min-h-screen px-2 py-2 bg-gradient-to-br from-purple-50 to-blue-100">
//       <div className="mx-auto max-w-9xl">
//         {/* ✅ Stats */}
//         <div className="grid grid-cols-2 gap-2 mb-2 sm:grid-cols-4">
//           <StatCard
//             label={`Total Approved: ${approvedLeaves.length}`}
//             // value={approvedLeaves.length}
//             color="border-green-500"
//           />
//           <StatCard
//             label={`Employees: ${employees.length}`}
//             // value={employees.length}
//             color="border-blue-500"
//           />
//           <StatCard
//             label={`Leave Types: ${leaveTypes.length}`}
//             // value={leaveTypes.length}
//             color="border-purple-500"
//           />
//           <StatCard
//             label={`Total Days: ${filteredLeaves.reduce((sum, l) => sum + l.days, 0)}`}
//             // value={filteredLeaves.reduce((sum, l) => sum + l.days, 0)}
//             color="border-yellow-500"
//           />
//         </div>

//         <div className="p-2 mb-2 bg-white border border-gray-200 shadow-md rounded-xl">
//           {/* Filters – Single Row */}
//           <div className="flex items-end gap-4 flex-nowrap">
//             {/* Month Filter */}
//             <div className="flex flex-col w-40">
//               <label className="mb-1 text-xs font-semibold text-gray-600">
//                 <FaCalendarAlt className="inline mr-1" /> Month
//               </label>
//               <input
//                 type="month"
//                 value={selectedMonth}
//                 onChange={(e) => setSelectedMonth(e.target.value)}
//                 className="px-3 text-sm border border-gray-300 rounded-md h-9 focus:outline-none focus:ring-1 focus:ring-blue-500"
//               />
//             </div>

//             {/* Employee Filter */}
//             <div className="flex flex-col w-48">
//               <label className="mb-1 text-xs font-semibold text-gray-600">
//                 <FaSearch className="inline mr-1" /> Employee
//               </label>
//               <select
//                 value={selectedEmployee}
//                 onChange={(e) => setSelectedEmployee(e.target.value)}
//                 className="px-3 text-sm border border-gray-300 rounded-md h-9 focus:outline-none focus:ring-1 focus:ring-blue-500"
//               >
//                 <option value="">All Employees</option>
//                 {employees.map((name) => (
//                   <option key={name} value={name}>
//                     {name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Leave Type Filter */}
//             <div className="flex flex-col w-40">
//               <label className="mb-1 text-xs font-semibold text-gray-600">
//                 Leave Type
//               </label>
//               <select
//                 value={selectedType}
//                 onChange={(e) => setSelectedType(e.target.value)}
//                 className="px-3 text-sm border border-gray-300 rounded-md h-9 focus:outline-none focus:ring-1 focus:ring-blue-500"
//               >
//                 <option value="">All Types</option>
//                 {leaveTypes.map((t) => (
//                   <option key={t} value={t}>
//                     {t}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Clear Button */}
//             <button
//               onClick={clearFilters}
//               className="h-9 px-5 mb-[2px] text-sm font-medium text-white bg-gray-500 rounded-md hover:bg-gray-600 transition"
//             >
//               Clear
//             </button>

//             {/* Download CSV Button */}
//             <button
//               onClick={downloadCSV}
//               className="h-9 px-5 mb-[2px] text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition"
//             >
//               ⬇️ Download CSV
//             </button>

//             {/* Back to Leaves Button */}
//             <button 
//               onClick={() => navigate("/leaves")}
//               className="h-9 px-5 mb-[2px] text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
//             >
//               ← Back to Leaves
//             </button>
//           </div>
//         </div>

//         {/* ✅ Bar Chart */}
//         <div className="p-4 mb-4 bg-white rounded-lg shadow-lg">
//           <h2 className="mb-4 text-lg font-semibold text-gray-800">
//             📊 Who Took the Most Leaves
//           </h2>
//           {leaveCountData.length > 0 ? (
//             <ResponsiveContainer width="100%" height={300}>
//               <BarChart data={leaveCountData}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="name" />
//                 <YAxis />
//                 <Tooltip />
//                 <Bar dataKey="totalDays" fill="#16a34a" />
//               </BarChart>
//             </ResponsiveContainer>
//           ) : (
//             <p className="py-8 text-center text-gray-500">No data available</p>
//           )}
//         </div>

//         {/* ✅ Table */}
//         <div className="mb-6 overflow-hidden bg-white rounded-lg shadow-lg">
//           <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
//             <table className="min-w-full">
//               <thead className="text-sm text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
//                 <tr>
//                   <th className="px-4 py-2 text-center">Employee Name</th>
//                   <th className="px-4 py-2 text-center">Leave Type</th>
//                   <th className="px-4 py-2 text-center">Start Date</th>
//                   <th className="px-4 py-2 text-center">End Date</th>
//                   <th className="px-4 py-2 text-center">Days</th>
//                   <th className="px-4 py-2 text-center">Reason</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {currentItems.length > 0 ? (
//                   currentItems.map((l) => (
//                     <tr
//                       key={l._id}
//                       className="transition border-b hover:bg-gray-50"
//                     >
//                       <td className="px-4 py-2 text-sm font-medium text-center text-gray-900 whitespace-nowrap">
//                         <div className="font-semibold">{l.employeeName}</div>
//                       </td>
//                       <td className="px-4 py-2 text-sm font-medium text-center text-gray-900 capitalize whitespace-nowrap">
//                         {l.leaveType}
//                       </td>
//                       <td className="px-4 py-2 text-sm font-medium text-center text-gray-900 whitespace-nowrap">
//                         {new Date(l.startDate).toLocaleDateString()}
//                       </td>
//                       <td className="px-4 py-2 text-sm font-medium text-center text-gray-900 whitespace-nowrap">
//                         {new Date(l.endDate).toLocaleDateString()}
//                       </td>
//                       <td className="px-4 py-2 text-sm font-medium text-center text-gray-900 whitespace-nowrap">
//                         <span className="px-2 py-2 text-xs text-center text-green-700 bg-green-100 rounded-full">
//                           {l.days} {l.days === 1 ? 'day' : 'days'}
//                         </span>
//                       </td>
//                       <td className="max-w-xs px-4 py-2 text-sm font-medium text-center text-gray-500 truncate whitespace-nowrap">
//                         {l.reason}
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="6" className="py-6 text-center text-gray-500">
//                       No approved leaves found for this selection.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* ✅ Pagination Section */}
//         {filteredLeaves.length > 0 && (
//           <div className="flex flex-col items-center justify-between gap-4 mt-6 sm:flex-row">
//             {/* Show entries dropdown */}
//             <div className="flex flex-wrap items-center gap-4">
//               <div className="flex items-center gap-2">
//                 <label className="text-sm font-medium text-gray-700">
//                   Show:
//                 </label>
//                 <select
//                   value={itemsPerPage}
//                   onChange={handleItemsPerPageChange}
//                   className="p-2 text-sm border rounded-lg"
//                 >
//                   <option value={5}>5</option>
//                   <option value={10}>10</option>
//                   <option value={20}>20</option>
//                   <option value={50}>50</option>
//                 </select>
//                 <span className="text-sm text-gray-600">entries</span>
//               </div>
//             </div>

//             {/* Pagination buttons */}
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={handlePrevPage}
//                 disabled={currentPage === 1}
//                 className={`px-4 py-1 text-sm border rounded-lg ${
//                   currentPage === 1
//                     ? "text-gray-400 bg-gray-100 cursor-not-allowed"
//                     : "text-blue-600 bg-white hover:bg-blue-50 border-blue-200"
//                 }`}
//               >
//                 Previous
//               </button>

//               {getPageNumbers().map((page, index) => (
//                 <button
//                   key={index}
//                   onClick={() => typeof page === 'number' ? handlePageClick(page) : null}
//                   disabled={page === "..."}
//                   className={`px-4 py-1 text-sm border rounded-lg ${
//                     page === "..."
//                       ? "text-gray-500 bg-gray-50 cursor-default"
//                       : currentPage === page
//                       ? "text-white bg-blue-600 border-blue-600"
//                       : "text-blue-600 bg-white hover:bg-blue-50 border-blue-300"
//                   }`}
//                 >
//                   {page}
//                 </button>
//               ))}

//               <button
//                 onClick={handleNextPage}
//                 disabled={currentPage === totalPages}
//                 className={`px-4 py-1 text-sm border rounded-lg ${
//                   currentPage === totalPages
//                     ? "text-gray-400 bg-gray-100 cursor-not-allowed"
//                     : "text-blue-600 bg-white hover:bg-blue-50 border-blue-300"
//                 }`}
//               >
//                 Next
//               </button>
//             </div>
//           </div>
//         )}

//         {/* No records message */}
//         {filteredLeaves.length === 0 && (
//           <div className="py-8 text-center text-gray-500">
//             No records found
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default LeaveReport;


import axios from "axios";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaBuilding, FaCalendarAlt, FaUserTag } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { API_BASE_URL } from "../config";
import { isEmployeeHidden } from "../utils/employeeStatus";

const LeaveReport = () => {
  const [approvedLeaves, setApprovedLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Employees data for department/designation
  const [employees, setEmployees] = useState([]);
  
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

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const navigate = useNavigate();

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

  // ✅ Fetch all approved leaves and employees
  const fetchApprovedLeaves = async () => {
    try {
      setLoading(true);
      const [leavesRes, empRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/leaves/leaves?status=approved`),
        axios.get(`${API_BASE_URL}/employees/get-employees`)
      ]);

      const employeesData = empRes.data || [];
      const activeEmployees = employeesData.filter(emp => !isEmployeeHidden(emp));
      setEmployees(activeEmployees);
      
      // Extract unique departments and designations
      const depts = new Set();
      const designations = new Set();
      activeEmployees.forEach(emp => {
        if (emp.department) depts.add(emp.department);
        if (emp.role || emp.designation) designations.add(emp.role || emp.designation);
      });
      setUniqueDepartments(Array.from(depts).sort());
      setUniqueDesignations(Array.from(designations).sort());

      const allLeaves = leavesRes.data.records || leavesRes.data;
      
      // Filter out leaves from hidden employees
      const activeEmployeeIds = new Set(activeEmployees.map(emp => emp.employeeId || emp._id));
      const approved = allLeaves.filter((l) => {
        if (l.status?.toLowerCase() !== "approved") return false;
        return activeEmployeeIds.has(l.employeeId);
      });

      setApprovedLeaves(approved);
      setFilteredLeaves(approved);
      setCurrentPage(1);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovedLeaves();
  }, []);

  // Get employee department and designation
  const getEmployeeDetails = (employeeId) => {
    const emp = employees.find(e => e.employeeId === employeeId || e._id === employeeId);
    return {
      department: emp?.department || emp?.departmentName || "N/A",
      designation: emp?.designation || emp?.role || "N/A"
    };
  };

  // ✅ Unique employee and leave type lists
  const employeesList = [...new Set(approvedLeaves.map((l) => l.employeeName))];
  const leaveTypes = [...new Set(approvedLeaves.map((l) => l.leaveType))];

  // ✅ Filter function
  useEffect(() => {
    let filtered = [...approvedLeaves];

    if (selectedMonth) {
      const [year, selectedMonthNum] = selectedMonth.split("-");
      filtered = filtered.filter((l) => {
        const leaveDate = new Date(l.startDate);
        return (
          leaveDate.getFullYear().toString() === year &&
          (leaveDate.getMonth() + 1).toString().padStart(2, "0") === selectedMonthNum
        );
      });
    }

    if (selectedEmployee) {
      filtered = filtered.filter((l) => l.employeeName === selectedEmployee);
    }

    if (selectedType) {
      filtered = filtered.filter((l) => l.leaveType === selectedType);
    }
    
    // Filter by Department
    if (filterDepartment) {
      filtered = filtered.filter(l => {
        const empDetails = getEmployeeDetails(l.employeeId);
        return empDetails.department === filterDepartment;
      });
    }
    
    // Filter by Designation
    if (filterDesignation) {
      filtered = filtered.filter(l => {
        const empDetails = getEmployeeDetails(l.employeeId);
        return empDetails.designation === filterDesignation;
      });
    }

    setFilteredLeaves(filtered);
    setCurrentPage(1);
  }, [selectedMonth, selectedEmployee, selectedType, filterDepartment, filterDesignation, approvedLeaves]);

  // ✅ Clear Filters
  const clearFilters = () => {
    setSelectedMonth("");
    setSelectedEmployee("");
    setSelectedType("");
    setFilterDepartment("");
    setFilterDesignation("");
  };

  // ✅ Download CSV
  const downloadCSV = () => {
    if (filteredLeaves.length === 0) {
      alert("No approved leave data available to download!");
      return;
    }

    const headers = ["Employee Name,Employee ID,Department,Designation,Leave Type,Start Date,End Date,Days,Reason"];
    const rows = filteredLeaves.map((l) => {
      const empDetails = getEmployeeDetails(l.employeeId);
      return [
        l.employeeName,
        l.employeeId,
        empDetails.department,
        empDetails.designation,
        l.leaveType,
        new Date(l.startDate).toLocaleDateString(),
        new Date(l.endDate).toLocaleDateString(),
        l.days,
        `"${l.reason}"`,
      ].join(",");
    });

    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);

    const fileName = selectedMonth
      ? `Approved_Leaves_${selectedMonth}.csv`
      : "Approved_Leaves_All.csv";

    link.download = fileName;
    link.click();
  };

  // ✅ Chart Data - Who took the most leaves with color coding
  const leaveCountData = useMemo(() => {
    const countMap = {};
    approvedLeaves.forEach((l) => {
      countMap[l.employeeName] = (countMap[l.employeeName] || 0) + l.days;
    });
    
    // Convert to array and sort by total days
    const data = Object.entries(countMap)
      .map(([name, totalDays]) => ({ name, totalDays }))
      .sort((a, b) => b.totalDays - a.totalDays);
    
    return data;
  }, [approvedLeaves]);

  // Custom Bar component with dynamic colors based on value
  const CustomBar = (props) => {
    const { x, y, width, height, value } = props;
    let color = '#22c55e'; // green for low
    
    if (value > 10) color = '#ef4444'; // red for very high
    else if (value > 7) color = '#f97316'; // orange for high
    else if (value > 4) color = '#eab308'; // yellow for medium
    
    return <rect x={x} y={y} width={width} height={height} fill={color} radius={[4, 4, 0, 0]} />;
  };

  // ✅ Pagination Handlers
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 2 && i <= currentPage + 2)
      ) {
        pageNumbers.push(i);
      } else if (i === currentPage - 3 || i === currentPage + 3) {
        pageNumbers.push("...");
      }
    }
    return pageNumbers;
  };

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLeaves.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage);

  // ✅ Stat Box
  const StatCard = ({ label, value, color }) => (
    <div
      className={`bg-white rounded-lg p-3 shadow-sm border-t-4 ${color} text-center`}
    >
      <div className="text-lg font-bold">{value}</div>
      <div className="text-xs font-medium text-gray-700">{label}</div>
    </div>
  );

  // ✅ Loading Screen
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 border-b-2 border-purple-600 rounded-full animate-spin"></div>
          <p className="font-semibold text-gray-600">
            Loading leave reports...
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen px-2 py-2 bg-gradient-to-br from-purple-50 to-blue-100">
      <div className="mx-auto max-w-9xl">
        {/* ✅ Stats */}
        <div className="grid grid-cols-2 gap-2 mb-2 sm:grid-cols-4">
          <StatCard
            label={`Total Approved: ${approvedLeaves.length}`}
            // value={approvedLeaves.length}
            color="border-green-500"
          />
          <StatCard
            label={`Employees: ${employeesList.length}`}
            // value={employeesList.length}
            color="border-blue-500"
          />
          <StatCard
            label={`Leave Types: ${leaveTypes.length}`}
            // value={leaveTypes.length}
            color="border-purple-500"
          />
          <StatCard
            label={`Total Days: ${filteredLeaves.reduce((sum, l) => sum + (l.days || 0), 0)}`}
            // value={filteredLeaves.reduce((sum, l) => sum + l.days, 0)}
            color="border-yellow-500"
          />
        </div>

        {/* Filters Section */}
        <div className="p-3 mb-3 bg-white rounded-lg shadow-md">
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Month Filter */}
            <div className="relative w-[150px]">
              <FaCalendarAlt className="absolute text-xs text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                placeholder="Select Month"
              />
            </div>

            {/* Employee Filter */}
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="h-8 px-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 min-w-[150px]"
            >
              <option value="">All Employees</option>
              {employeesList.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>

            {/* Leave Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="h-8 px-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 min-w-[120px]"
            >
              <option value="">All Types</option>
              {leaveTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

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

            {/* Clear Button */}
            {(selectedMonth || selectedEmployee || selectedType || filterDepartment || filterDesignation) && (
              <button
                onClick={clearFilters}
                className="h-8 px-3 text-xs font-medium text-gray-600 transition bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Clear
              </button>
            )}

            {/* Download CSV Button */}
            <button
              onClick={downloadCSV}
              className="h-8 px-3 text-xs font-medium text-white transition bg-green-600 rounded-md hover:bg-green-700"
            >
              ⬇️ CSV
            </button>

            {/* Back to Leaves Button */}
            {/* <button 
              onClick={() => navigate("/leaves")}
              className="h-8 px-3 text-xs font-medium text-white transition bg-blue-600 rounded-md hover:bg-blue-700"
            >
              ← Back
            </button> */}
          </div>
        </div>

        {/* ✅ Bar Chart */}
        <div className="p-4 mb-4 bg-white rounded-lg shadow-lg">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            📊 Who Took the Most Leaves
          </h2>
          {leaveCountData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={leaveCountData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalDays" shape={<CustomBar />} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-8 text-center text-gray-500">No data available</p>
          )}
        </div>

        {/* ✅ Table */}
        <div className="mb-6 overflow-hidden bg-white rounded-lg shadow-lg">
          <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
            <table className="min-w-full">
              <thead className="text-sm text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
                <tr>
                  <th className="py-2 text-center ">Employee ID</th>
                  <th className="py-2 text-center ">Employee Name</th>
                  <th className="py-2 text-center ">Department</th>
                  <th className="py-2 text-center ">Designation</th>
                  <th className="py-2 text-center ">Leave Type</th>
                  <th className="py-2 text-center ">Start Date</th>
                  <th className="py-2 text-center ">End Date</th>
                  <th className="py-2 text-center ">Days</th>
                  <th className="py-2 text-center ">Reason</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((l) => {
                    const empDetails = getEmployeeDetails(l.employeeId);
                    return (
                      <tr
                        key={l._id}
                        className="transition border-b hover:bg-gray-50"
                      >
                        <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
                          {l.employeeId}
                        </td>
                        <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
                          <div className="font-medium">{l.employeeName}</div>
                        </td>
                        <td className="px-2 py-2 text-center text-gray-600 ">
                          {empDetails.department}
                        </td>
                        <td className="px-2 py-2 text-center text-gray-600 ">
                          {empDetails.designation}
                        </td>
                        <td className="px-2 py-2 font-medium text-center text-gray-600 capitalize ">
                          {l.leaveType}
                        </td>
                        <td className="px-2 py-2 font-medium text-center text-gray-600 ">
                          {new Date(l.startDate).toLocaleDateString()}
                        </td>
                        <td className="px-2 py-2 font-medium text-center text-gray-600 ">
                          {new Date(l.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-2 py-2 font-medium text-center text-gray-600 ">
                          <span className="px-2 py-2 text-center text-green-700 bg-green-100 rounded-full">
                            {l.days} {l.days === 1 ? 'day' : 'days'}
                          </span>
                        </td>
                        <td className="max-w-xs px-2 py-2 font-medium text-center text-gray-500 truncate ">
                          {l.reason}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="9" className="py-6 text-center text-gray-500">
                      No approved leaves found for this selection.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ✅ Pagination Section */}
        {filteredLeaves.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-4 mt-6 sm:flex-row">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Show:
                </label>
                <select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="p-2 text-sm border rounded-lg"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm text-gray-600">entries</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`px-4 py-1 text-sm border rounded-lg ${
                  currentPage === 1
                    ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                    : "text-blue-600 bg-white hover:bg-blue-50 border-blue-200"
                }`}
              >
                Previous
              </button>

              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' ? handlePageClick(page) : null}
                  disabled={page === "..."}
                  className={`px-4 py-1 text-sm border rounded-lg ${
                    page === "..."
                      ? "text-gray-500 bg-gray-50 cursor-default"
                      : currentPage === page
                      ? "text-white bg-blue-600 border-blue-600"
                      : "text-blue-600 bg-white hover:bg-blue-50 border-blue-300"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`px-4 py-1 text-sm border rounded-lg ${
                  currentPage === totalPages
                    ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                    : "text-blue-600 bg-white hover:bg-blue-50 border-blue-300"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveReport;
