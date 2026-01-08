// import axios from "axios";
// import { useEffect, useState } from "react";

// const LeavesReport = () => {
//   const [approvedLeaves, setApprovedLeaves] = useState([]);

//   const fetchApprovedLeaves = async () => {
//     try {
//       const res = await axios.get("http://localhost:5000/api/leaves/approved-leaves");
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
//       const res = await axios.get("http://localhost:5000/api/leaves/leaves");
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
//       const res = await axios.get("http://localhost:5000/api/leaves/leaves");
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
//       const res = await axios.get("http://localhost:5000/api/leaves/leaves");
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

import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const LeaveReport = () => {
  const [approvedLeaves, setApprovedLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedType, setSelectedType] = useState("");

  // ✅ Fetch all approved leaves
  const fetchApprovedLeaves = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/leaves/leaves?status=approved");
      const INACTIVE_EMPLOYEE_IDS = ['EMP002', 'EMP003', 'EMP004', 'EMP008', 'EMP010', 'EMP018', 'EMP019'];
      const approved = (res.data.records || res.data).filter(
        (l) => l.status?.toLowerCase() === "approved" && !INACTIVE_EMPLOYEE_IDS.includes(l.employeeId)
      );
      setApprovedLeaves(approved);
      setFilteredLeaves(approved);
    } catch (err) {
      console.error("Failed to fetch approved leaves:", err);
    }
  };

  useEffect(() => {
    fetchApprovedLeaves();
  }, []);

  // ✅ Unique employee and leave type lists
  const employees = [...new Set(approvedLeaves.map((l) => l.employeeName))];
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

    setFilteredLeaves(filtered);
  }, [selectedMonth, selectedEmployee, selectedType, approvedLeaves]);

  // ✅ Download CSV
  const downloadCSV = () => {
    if (filteredLeaves.length === 0) {
      alert("No approved leave data available to download!");
      return;
    }

    const headers = ["Employee Name,Leave Type,Start Date,End Date,Days,Reason"];
    const rows = filteredLeaves.map((l) =>
      [
        l.employeeName,
        l.leaveType,
        new Date(l.startDate).toLocaleDateString(),
        new Date(l.endDate).toLocaleDateString(),
        l.days,
        `"${l.reason}"`,
      ].join(",")
    );

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

  // ✅ Chart Data - Who took the most leaves
  const leaveCountData = useMemo(() => {
    const countMap = {};
    approvedLeaves.forEach((l) => {
      countMap[l.employeeName] = (countMap[l.employeeName] || 0) + l.days;
    });
    return Object.entries(countMap).map(([name, totalDays]) => ({
      name,
      totalDays,
    }));
  }, [approvedLeaves]);

  return (
    <div className="p-6 mx-auto mt-6 bg-white rounded-lg shadow-md max-w-7xl">

      <div className="grid grid-cols-3 gap-2 mb-4">

        <div className="px-3 py-2 text-center rounded-md shadow-sm bg-green-50">
          <p className="text-[11px] text-gray-500 leading-tight">
            Approved Leaves
          </p>
          <h2 className="text-sm font-semibold text-green-700 leading-tight">
            {filteredLeaves.length}
          </h2>
        </div>

        <div className="px-3 py-2 text-center rounded-md shadow-sm bg-blue-50">
          <p className="text-[11px] text-gray-500 leading-tight">
            Employees
          </p>
          <h2 className="text-sm font-semibold text-blue-700 leading-tight">
            {employees.length}
          </h2>
        </div>

        <div className="px-3 py-2 text-center rounded-md shadow-sm bg-yellow-50">
          <p className="text-[11px] text-gray-500 leading-tight">
            Leave Types
          </p>
          <h2 className="text-sm font-semibold text-yellow-700 leading-tight">
            {leaveTypes.length}
          </h2>
        </div>

      </div>
      {/* Header */}
      <div className="flex flex-col items-center justify-between gap-4 mb-6 md:flex-row">
        <h1 className="text-3xl font-bold">Approved Leave Reports</h1>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-green-200"
          />

          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded"
          >
            <option value="">All Employees</option>
            {employees.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded"
          >
            <option value="">All Leave Types</option>
            {leaveTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <button
            onClick={downloadCSV}
            className="px-4 py-2 text-white transition bg-green-600 rounded hover:bg-green-700"
          >
            ⬇️ Download CSV
          </button>
        </div>
      </div>

      {/* ✅ Stats Summary */}
      {/* <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
        <div className="p-4 text-center rounded-lg shadow bg-green-50">
          <p className="text-sm text-gray-600">Total Approved Leaves</p>
          <h2 className="text-2xl font-bold text-green-700">{filteredLeaves.length}</h2>
        </div>

        <div className="p-4 text-center rounded-lg shadow bg-blue-50">
          <p className="text-sm text-gray-600">Total Employees</p>
          <h2 className="text-2xl font-bold text-blue-700">{employees.length}</h2>
        </div>

        <div className="p-4 text-center rounded-lg shadow bg-yellow-50">
          <p className="text-sm text-gray-600">Leave Types</p>
          <h2 className="text-2xl font-bold text-yellow-700">{leaveTypes.length}</h2>
        </div>
      </div> */}

      {/* <div className="grid grid-cols-3 gap-2 mb-4">
  
  <div className="px-3 py-2 text-center rounded-md shadow-sm bg-green-50">
    <p className="text-[11px] text-gray-500 leading-tight">
      Approved Leaves
    </p>
    <h2 className="text-sm font-semibold text-green-700 leading-tight">
      {filteredLeaves.length}
    </h2>
  </div>

  <div className="px-3 py-2 text-center rounded-md shadow-sm bg-blue-50">
    <p className="text-[11px] text-gray-500 leading-tight">
      Employees
    </p>
    <h2 className="text-sm font-semibold text-blue-700 leading-tight">
      {employees.length}
    </h2>
  </div>

  <div className="px-3 py-2 text-center rounded-md shadow-sm bg-yellow-50">
    <p className="text-[11px] text-gray-500 leading-tight">
      Leave Types
    </p>
    <h2 className="text-sm font-semibold text-yellow-700 leading-tight">
      {leaveTypes.length}
    </h2>
  </div>

</div> */}


      {/* ✅ Bar Chart */}
      {/* <div className="p-4 mb-8 rounded-lg shadow bg-gray-50">
        <h2 className="mb-4 text-xl font-semibold text-gray-800">
          📊 Who Took the Most Leaves
        </h2>
        {leaveCountData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={leaveCountData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="totalDays" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="py-8 text-center text-gray-500">No data available</p>
        )}
      </div> */}
      {/* <h1 className="text-3xl font-bold">Approved Leave Reports</h1> <br/> */}
      {/* ✅ Leave Table */}
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
            </tr>
          </thead>
          <tbody>
            {filteredLeaves.length > 0 ? (
              filteredLeaves.map((l) => (
                <tr key={l._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{l.employeeName}</td>
                  <td className="px-4 py-2 capitalize">{l.leaveType}</td>
                  <td className="px-4 py-2">{new Date(l.startDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{new Date(l.endDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{l.days}</td>
                  <td className="px-4 py-2">{l.reason}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-6 text-center text-gray-500">
                  No approved leaves found for this selection.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 mb-8 rounded-lg shadow bg-gray-50">
        <h2 className="mb-4 text-xl font-semibold text-gray-800">
          📊 Who Took the Most Leaves
        </h2>
        {leaveCountData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={leaveCountData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="totalDays" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="py-8 text-center text-gray-500">No data available</p>
        )}
      </div>
    </div>
  );
};

export default LeaveReport;
