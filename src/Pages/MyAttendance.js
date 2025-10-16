// src/pages/MyAttendance.jsx
import { useEffect, useState } from "react";

const BASE_URL = "http://localhost:5000"; // Replace with your backend base URL

export default function MyAttendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAttendance = async () => {
      const employeeId = localStorage.getItem("employeeId");
      if (!employeeId) {
        setError("Employee ID not found in localStorage.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${BASE_URL}/api/attendance/myattendance/${employeeId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch attendance");
        setRecords(data.records || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  if (loading) return <p className="text-center mt-6 text-lg font-medium">Loading attendance...</p>;
  if (error) return <p className="text-center mt-6 text-red-600 font-medium">{error}</p>;
  if (records.length === 0) return <p className="text-center mt-6 text-gray-700 font-medium">No attendance records found.</p>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600 text-center mb-8">
        My Attendance
      </h2>

      <div className="overflow-x-auto shadow-lg rounded-lg">
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead className="bg-gradient-to-r from-green-100 to-teal-100 text-gray-700">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-sm">Date</th>
              <th className="px-6 py-3 text-left font-semibold text-sm">Check-In</th>
              <th className="px-6 py-3 text-left font-semibold text-sm">Check-Out</th>
              <th className="px-6 py-3 text-left font-semibold text-sm">Total Hours</th>
              <th className="px-6 py-3 text-left font-semibold text-sm">Distance (m)</th>
              <th className="px-6 py-3 text-left font-semibold text-sm">Onsite</th>
              <th className="px-6 py-3 text-left font-semibold text-sm">Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((rec, idx) => (
              <tr key={rec._id} className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                <td className="px-6 py-3 text-gray-700">{new Date(rec.checkInTime || rec.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-3 text-gray-700">{rec.checkInTime ? new Date(rec.checkInTime).toLocaleTimeString() : "-"}</td>
                <td className="px-6 py-3 text-gray-700">{rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleTimeString() : "-"}</td>
                <td className="px-6 py-3 font-semibold text-gray-800">{rec.totalHours.toFixed(2)}</td>
                <td className="px-6 py-3 text-gray-700">{rec.distance.toFixed(2)}</td>
                <td className="px-6 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      rec.onsite ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
                    }`}
                  >
                    {rec.onsite ? "Yes" : "No"}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      rec.status === "checked-in" ? "bg-blue-200 text-blue-800" : "bg-purple-200 text-purple-800"
                    }`}
                  >
                    {rec.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
