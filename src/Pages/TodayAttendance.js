// src/pages/TodayAttendance.jsx
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const TodayAttendance = () => {
  const [todayRecords, setTodayRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchTodayAttendance();
  }, []);

  const fetchTodayAttendance = async () => {
    try {
      setLoading(true);
      const resp = await axios.get(
        "https://attendancebackend-5cgn.onrender.com/api/attendance/today"
      );

      let records = resp.data.records || [];

      const formattedRecords = records.map((rec) => ({
        ...rec,
        employeeName: rec.employeeName || rec.employee?.name || "-",
        employeeEmail: rec.employeeEmail || rec.employee?.email || "-",
      }));

      setTodayRecords(formattedRecords);
    } catch (err) {
      setError("Failed to fetch today's attendance");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "checked-in":
        return "bg-green-100 text-green-800";
      case "checked-out":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading)
    return <p className="text-center mt-6 text-gray-600">Loading today's attendance...</p>;

  if (error)
    return <p className="text-center mt-6 text-red-600">{error}</p>;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold text-gray-800">Today's Attendance</h3>

        <button
          onClick={() => navigate("/attendance-records")}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition text-sm"
        >
          View All Records
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left border border-gray-200">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-2 border">Employee ID</th>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Check In</th>
              <th className="px-4 py-2 border">Check Out</th>
              <th className="px-4 py-2 border">Total Hours</th>
              <th className="px-4 py-2 border">Distance (m)</th>
              <th className="px-4 py-2 border">Onsite</th>
              <th className="px-4 py-2 border">Status</th>
            </tr>
          </thead>

          <tbody>
            {todayRecords.length > 0 ? (
              todayRecords.map((rec) => (
                <tr key={rec._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{rec.employeeId}</td>
                  <td className="px-4 py-2">{rec.employeeName}</td>
                  <td className="px-4 py-2">
                    {rec.checkInTime ? new Date(rec.checkInTime).toLocaleTimeString() : "-"}
                  </td>
                  <td className="px-4 py-2">
                    {rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleTimeString() : "-"}
                  </td>
                  <td className="px-4 py-2">
                    {rec.totalHours ? Number(rec.totalHours).toFixed(2) : "0.00"}
                  </td>
                  <td className="px-4 py-2">
                    {rec.distance ? Number(rec.distance).toFixed(2) : "0.00"}
                  </td>
                  <td className="px-4 py-2">{rec.onsite ? "Yes" : "No"}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        rec.status
                      )}`}
                    >
                      {rec.status || "-"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center py-4 text-gray-500">
                  No attendance records for today.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TodayAttendance;
