// src/pages/LateToday.jsx
import axios from "axios";
import { useEffect, useState } from "react";

const BASE_URL = "https://attendancebackend-5cgn.onrender.com"; // replace with your backend URL

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
      const resp = await axios.get(`${BASE_URL}/api/attendance/lateattendance`);
      if (resp.data && resp.data.records) {
        setRecords(resp.data.records);
      } else {
        setError("Unexpected API response");
      }
    } catch (err) {
      console.error("Error fetching late records:", err);
      setError("Failed to fetch late attendance records");
    } finally {
      setLoading(false);
    }
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
                <th className="px-4 py-2 border">Check In</th>
                <th className="px-4 py-2 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec) => (
                <tr key={rec._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{rec.employeeId}</td>
                  <td className="px-4 py-2 border">{rec.employeeName || "-"}</td>
                  <td className="px-4 py-2 border">{rec.employeeEmail}</td>
                  <td className="px-4 py-2 border">
                    {rec.checkInTime
                      ? new Date(rec.checkInTime).toLocaleTimeString()
                      : "-"}
                  </td>
                  <td className="px-4 py-2 border text-yellow-700 font-semibold">
                    Late Come
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
