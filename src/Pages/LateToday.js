// src/pages/LateToday.jsx
import axios from "axios";
import { useEffect, useState } from "react";

const BASE_URL = "https://attendancebackend-5cgn.onrender.com";

const LateToday = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLateAttendance();
  }, []);

  // Fetch Late Attendance (shift-wise already filtered from backend)
  const fetchLateAttendance = async () => {
    try {
      setLoading(true);

      const resp = await axios.get(`${BASE_URL}/api/attendance/lateattendance`);
      let data = resp.data.records || [];

      // ⭐ FIX: Missing name? → Fetch from employee table
      const updatedData = await Promise.all(
        data.map(async (rec) => {
          if (!rec.employeeName) {
            try {
              const emp = await axios.get(
                `${BASE_URL}/api/employees/${rec.employeeId}`
              );
              rec.employeeName = emp.data?.name || "-";
            } catch (err) {
              rec.employeeName = "-";
            }
          }
          return rec;
        })
      );

      setRecords(updatedData);
    } catch (err) {
      console.error("Late fetch error:", err);
      setError("Failed to fetch late attendance records");
    } finally {
      setLoading(false);
    }
  };

  // Format Time
  const formatTime = (time) => {
    if (!time) return "-";
    return new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white rounded-lg shadow-md mt-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Late Comers Today</h2>

      {loading ? (
        <p className="text-center text-gray-600">Loading late attendance...</p>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : records.length === 0 ? (
        <p className="text-center text-gray-500">No late comers today.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-2 border">Employee ID</th>
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">Shift Start</th>
                <th className="px-4 py-2 border">Check In</th>
                <th className="px-4 py-2 border">Status</th>
              </tr>
            </thead>

            <tbody>
              {records.map((rec) => (
                <tr key={rec._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{rec.employeeId}</td>
                  <td className="px-4 py-2">{rec.employeeName}</td>
                  <td className="px-4 py-2">{rec.employeeEmail}</td>

                  <td className="px-4 py-2 font-semibold text-blue-600">
                    {rec.shiftStart || "-"}
                  </td>

                  <td className="px-4 py-2 font-semibold text-red-600">
                    {formatTime(rec.checkInTime)}
                  </td>

                  <td className="px-4 py-2">
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
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
