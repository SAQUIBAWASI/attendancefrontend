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
//     <div className="p-6 max-w-6xl mx-auto bg-white rounded-lg shadow-md mt-6">
//       <h1 className="text-3xl font-bold text-center mb-6">Approved Leaves Report</h1>

//       <div className="overflow-x-auto">
//         <table className="min-w-full border border-gray-300 text-sm">
//           <thead className="bg-gray-100 text-gray-700">
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
//                   <td className="px-4 py-2 text-green-700 font-semibold text-center">
//                     Approved
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="7" className="text-center py-6 text-gray-500">
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
//     <div className="p-6 max-w-6xl mx-auto bg-white rounded-lg shadow-md mt-6">
//       <h1 className="text-3xl font-bold text-center mb-6">Approved Leaves Report</h1>

//       <div className="overflow-x-auto">
//         <table className="min-w-full border border-gray-300 text-sm">
//           <thead className="bg-gray-100 text-gray-700">
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
//                 <td colSpan="6" className="text-center py-6 text-gray-500">
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
//     <div className="p-6 max-w-6xl mx-auto bg-white rounded-lg shadow-md mt-6">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold">Approved Leave Requests</h1>
//         <button
//           onClick={downloadCSV}
//           className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
//         >
//           ⬇️ Download CSV
//         </button>
//       </div>

//       <div className="overflow-x-auto">
//         <table className="min-w-full border border-gray-300 text-sm">
//           <thead className="bg-gray-100 text-gray-700">
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
//                 <td colSpan="6" className="text-center py-6 text-gray-500">
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


import axios from "axios";
import { useEffect, useState } from "react";

const LeaveReport = () => {
  const [approvedLeaves, setApprovedLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");

  // ✅ Fetch all approved leaves
  const fetchApprovedLeaves = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/leaves/leaves");
      const approved = (res.data.records || res.data).filter(
        (l) => l.status?.toLowerCase() === "approved"
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

  // ✅ Handle Month Change
  const handleMonthChange = (e) => {
    const month = e.target.value;
    setSelectedMonth(month);

    if (!month) {
      setFilteredLeaves(approvedLeaves);
      return;
    }

    const [year, selectedMonthNum] = month.split("-");
    const filtered = approvedLeaves.filter((l) => {
      const leaveDate = new Date(l.startDate);
      return (
        leaveDate.getFullYear().toString() === year &&
        (leaveDate.getMonth() + 1).toString().padStart(2, "0") === selectedMonthNum
      );
    });

    setFilteredLeaves(filtered);
  };

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

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded-lg shadow-md mt-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Approved Leave Requests</h1>

        <div className="flex items-center gap-3">
          {/* ✅ Month Picker */}
          <input
            type="month"
            value={selectedMonth}
            onChange={handleMonthChange}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-green-200"
          />
          <button
            onClick={downloadCSV}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            ⬇️ Download CSV
          </button>
        </div>
      </div>

      {/* ✅ Total Leaves Info */}
      <div className="mb-4 text-lg font-semibold text-gray-700">
        Total Approved Leaves:{" "}
        <span className="text-green-700">{filteredLeaves.length}</span>
        {selectedMonth && (
          <span className="ml-2 text-sm text-gray-500">
            (for {new Date(selectedMonth).toLocaleString("default", { month: "long", year: "numeric" })})
          </span>
        )}
      </div>

      {/* ✅ Table */}
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
            </tr>
          </thead>
          <tbody>
            {filteredLeaves.length > 0 ? (
              filteredLeaves.map((l) => (
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
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500">
                  No approved leaves found for this month.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaveReport;
