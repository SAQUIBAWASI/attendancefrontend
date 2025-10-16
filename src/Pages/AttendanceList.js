// src/pages/AllAttendance.jsx
import { useEffect, useState } from "react";

const BASE_URL = "https://attendancebackend-5cgn.onrender.com"; // replace with your backend URL

export default function AttendanceList() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAllAttendance = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/attendance/allattendance`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to fetch attendance");

        setRecords(data.records || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllAttendance();
  }, []);

  if (loading)
    return <p className="text-center mt-6 text-gray-700">Loading attendance records...</p>;

  if (error)
    return <p className="text-center mt-6 text-red-600">{error}</p>;

  if (records.length === 0)
    return <p className="text-center mt-6 text-gray-700">No attendance records found.</p>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">
        All Employee Attendance
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 shadow-md rounded-lg">
          <thead className="bg-blue-100">
            <tr>
              <th className="border px-4 py-2 text-left text-blue-700">Employee ID</th>
              <th className="border px-4 py-2 text-left text-blue-700">Email</th>
              <th className="border px-4 py-2 text-left text-blue-700">Check-In</th>
              <th className="border px-4 py-2 text-left text-blue-700">Check-Out</th>
              <th className="border px-4 py-2 text-left text-blue-700">Total Hours</th>
              <th className="border px-4 py-2 text-left text-blue-700">Distance (m)</th>
              <th className="border px-4 py-2 text-left text-blue-700">Onsite</th>
              <th className="border px-4 py-2 text-left text-blue-700">Status</th>
            </tr>
          </thead>

          <tbody>
            {records.map((rec) => (
              <tr key={rec._id} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{rec.employeeId}</td>
                <td className="border px-4 py-2">{rec.employeeEmail}</td>
                <td className="border px-4 py-2">
                  {rec.checkInTime
                    ? new Date(rec.checkInTime).toLocaleString()
                    : "-"}
                </td>
                <td className="border px-4 py-2">
                  {rec.checkOutTime
                    ? new Date(rec.checkOutTime).toLocaleString()
                    : "-"}
                </td>
                <td className="border px-4 py-2">{rec.totalHours?.toFixed(2) || "-"}</td>
                <td className="border px-4 py-2">{rec.distance?.toFixed(2) || "-"}</td>
                <td className="border px-4 py-2">{rec.onsite ? "Yes" : "No"}</td>
                <td className="border px-4 py-2 capitalize">{rec.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


