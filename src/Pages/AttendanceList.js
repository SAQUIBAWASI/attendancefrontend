// // src/pages/AllAttendance.jsx
// import { useEffect, useState } from "react";

// const BASE_URL = "https://attendancebackend-5cgn.onrender.com"; // replace with your backend URL

// export default function AttendanceList() {
//   const [records, setRecords] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const fetchAllAttendance = async () => {
//       try {
//         const res = await fetch(`${BASE_URL}/api/attendance/allattendance`);
//         const data = await res.json();

//         if (!res.ok) throw new Error(data.message || "Failed to fetch attendance");

//         setRecords(data.records || []);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAllAttendance();
//   }, []);

//   if (loading)
//     return <p className="mt-6 text-center text-gray-700">Loading attendance records...</p>;

//   if (error)
//     return <p className="mt-6 text-center text-red-600">{error}</p>;

//   if (records.length === 0)
//     return <p className="mt-6 text-center text-gray-700">No attendance records found.</p>;

//   return (
//     <div className="max-w-6xl p-6 mx-auto">
//       <h2 className="mb-6 text-3xl font-bold text-center text-blue-700">
//         All Employee Attendance
//       </h2>

//       <div className="overflow-x-auto">
//         <table className="w-full border border-collapse border-gray-300 rounded-lg shadow-md">
//           <thead className="bg-blue-100">
//             <tr>
//               <th className="px-4 py-2 text-left text-blue-700 border">Employee ID</th>
//               <th className="px-4 py-2 text-left text-blue-700 border">Email</th>
//               <th className="px-4 py-2 text-left text-blue-700 border">Check-In</th>
//               <th className="px-4 py-2 text-left text-blue-700 border">Check-Out</th>
//               <th className="px-4 py-2 text-left text-blue-700 border">Total Hours</th>
//               <th className="px-4 py-2 text-left text-blue-700 border">Distance (m)</th>
//               <th className="px-4 py-2 text-left text-blue-700 border">Onsite</th>
//               <th className="px-4 py-2 text-left text-blue-700 border">Status</th>
//             </tr>
//           </thead>

//           <tbody>
//             {records.map((rec) => (
//               <tr key={rec._id} className="hover:bg-gray-50">
//                 <td className="px-4 py-2 border">{rec.employeeId}</td>
//                 <td className="px-4 py-2 border">{rec.employeeEmail}</td>
//                 <td className="px-4 py-2 border">
//                   {rec.checkInTime
//                     ? new Date(rec.checkInTime).toLocaleString()
//                     : "-"}
//                 </td>
//                 <td className="px-4 py-2 border">
//                   {rec.checkOutTime
//                     ? new Date(rec.checkOutTime).toLocaleString()
//                     : "-"}
//                 </td>
//                 <td className="px-4 py-2 border">{rec.totalHours?.toFixed(2) || "-"}</td>
//                 <td className="px-4 py-2 border">{rec.distance?.toFixed(2) || "-"}</td>
//                 <td className="px-4 py-2 border">{rec.onsite ? "Yes" : "No"}</td>
//                 <td className="px-4 py-2 capitalize border">{rec.status}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }



// src/pages/AllAttendance.jsx
import { useEffect, useState } from "react";

const BASE_URL = "https://attendancebackend-5cgn.onrender.com";

export default function AttendanceList() {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  useEffect(() => {
    const fetchAllAttendance = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/attendance/allattendance`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to fetch attendance");

        setRecords(data.records || []);
        setFilteredRecords(data.records || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllAttendance();
  }, []);

  // ✅ Date filter
  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setSelectedMonth(""); // reset month filter when using date

    if (!date) {
      setFilteredRecords(records);
      return;
    }

    const filtered = records.filter((rec) => {
      const checkInDate = new Date(rec.checkInTime).toISOString().split("T")[0];
      return checkInDate === date;
    });
    setFilteredRecords(filtered);
  };

  // ✅ Month filter (e.g. 2025-10)
  const handleMonthChange = (e) => {
    const month = e.target.value;
    setSelectedMonth(month);
    setSelectedDate(""); // reset date filter when using month

    if (!month) {
      setFilteredRecords(records);
      return;
    }

    const [year, monthNum] = month.split("-");
    const filtered = records.filter((rec) => {
      const d = new Date(rec.checkInTime);
      return (
        d.getFullYear() === parseInt(year) &&
        d.getMonth() + 1 === parseInt(monthNum)
      );
    });

    setFilteredRecords(filtered);
  };

  // ✅ Download CSV function
  const downloadCSV = () => {
    if (filteredRecords.length === 0) {
      alert("No data available to download!");
      return;
    }

    const headers = [
      "Employee ID",
      "Email",
      "Check-In Time",
      "Check-Out Time",
      "Total Hours",
      "Distance (m)",
      "Onsite",
      "Status",
    ];

    const csvRows = [
      headers.join(","), // Header row
      ...filteredRecords.map((rec) =>
        [
          rec.employeeId,
          rec.employeeEmail,
          rec.checkInTime ? new Date(rec.checkInTime).toLocaleString() : "-",
          rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleString() : "-",
          rec.totalHours?.toFixed(2) || "-",
          rec.distance?.toFixed(2) || "-",
          rec.onsite ? "Yes" : "No",
          rec.status,
        ].join(",")
      ),
    ];

    const csvData = csvRows.join("\n");
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "attendance_records.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading)
    return <p className="mt-6 text-center text-gray-700">Loading attendance records...</p>;

  if (error)
    return <p className="mt-6 text-center text-red-600">{error}</p>;

  if (records.length === 0)
    return <p className="mt-6 text-center text-gray-700">No attendance records found.</p>;

  return (
    <div className="max-w-6xl p-6 mx-auto">
      <h2 className="mb-6 text-3xl font-bold text-center text-blue-700">
        All Employee Attendance
      </h2>

      {/* ✅ Filters and Download */}
      <div className="flex flex-col items-center justify-between gap-3 mb-6 sm:flex-row">
        <div className="flex gap-3">
          <div>
            <label className="block mb-1 text-sm text-gray-700">Filter by Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="p-2 border rounded"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-700">Filter by Month:</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={handleMonthChange}
              className="p-2 border rounded"
            />
          </div>
        </div>

        <button
          onClick={downloadCSV}
          className="px-4 py-2 text-white transition bg-green-600 rounded hover:bg-green-700"
        >
          Download CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border border-collapse border-gray-300 rounded-lg shadow-md">
          <thead className="bg-blue-100">
            <tr>
              <th className="px-4 py-2 text-left text-blue-700 border">Employee ID</th>
              <th className="px-4 py-2 text-left text-blue-700 border">Email</th>
              <th className="px-4 py-2 text-left text-blue-700 border">Check-In</th>
              <th className="px-4 py-2 text-left text-blue-700 border">Check-Out</th>
              <th className="px-4 py-2 text-left text-blue-700 border">Total Hours</th>
              <th className="px-4 py-2 text-left text-blue-700 border">Distance (m)</th>
              <th className="px-4 py-2 text-left text-blue-700 border">Onsite</th>
              <th className="px-4 py-2 text-left text-blue-700 border">Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredRecords.map((rec) => (
              <tr key={rec._id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">{rec.employeeId}</td>
                <td className="px-4 py-2 border">{rec.employeeEmail}</td>
                <td className="px-4 py-2 border">
                  {rec.checkInTime ? new Date(rec.checkInTime).toLocaleString() : "-"}
                </td>
                <td className="px-4 py-2 border">
                  {rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleString() : "-"}
                </td>
                <td className="px-4 py-2 border">{rec.totalHours?.toFixed(2) || "-"}</td>
                <td className="px-4 py-2 border">{rec.distance?.toFixed(2) || "-"}</td>
                <td className="px-4 py-2 border">{rec.onsite ? "Yes" : "No"}</td>
                <td className="px-4 py-2 capitalize border">{rec.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
