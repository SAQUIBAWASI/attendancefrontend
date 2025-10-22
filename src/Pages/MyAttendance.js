// src/pages/MyAttendance.jsx
import { useEffect, useState } from "react";
import { CSVLink } from "react-csv";
import { useNavigate } from "react-router-dom";
import EmployeeNavbar from "../Components/EmployeeNavbar";
// import EmployeeSidebar from "../Components/EmployeeSidebar";

const BASE_URL = "https://attendancebackend-5cgn.onrender.com";

export default function MyAttendance() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const employeeData = JSON.parse(localStorage.getItem("employeeData"));
        const employeeId = employeeData?.employeeId;

        if (!employeeId) {
          setError("❌ Employee ID not found. Please log in again.");
          setLoading(false);
          return;
        }

        const res = await fetch(`${BASE_URL}/api/attendance/myattendance/${employeeId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch attendance");

        setRecords(data.records || []);
      } catch (err) {
        console.error("Attendance fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  const csvData = records.map((rec) => ({
    Date: new Date(rec.checkInTime || rec.createdAt).toLocaleDateString(),
    "Check In": rec.checkInTime ? new Date(rec.checkInTime).toLocaleTimeString() : "-",
    "Check Out": rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleTimeString() : "-",
    "Total Hours": rec.totalHours ? rec.totalHours.toFixed(2) : "0.00",
    "Distance (m)": rec.distance ? rec.distance.toFixed(2) : "0.00",
    Onsite: rec.onsite ? "Yes" : "No",
    Status: rec.status,
  }));

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
     

      {/* Main Section */}
      <div className="flex flex-col flex-1">
        <EmployeeNavbar />

        <div className="flex-1 p-4 sm:p-6 lg:p-10 flex justify-center items-start">
          <div className="w-full max-w-5xl bg-white shadow-xl rounded-2xl p-6 sm:p-8">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600 mb-3 sm:mb-0 text-center">
                📅 My Attendance
              </h2>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate("/employeedashboard")}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm font-semibold"
                >
                  ← Back
                </button>

                <CSVLink
                  data={csvData}
                  filename={`attendance_${new Date().toLocaleDateString()}.csv`}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-semibold text-center"
                >
                  ⬇ Download CSV
                </CSVLink>
              </div>
            </div>

            {/* Loading / Error / No Data */}
            {loading ? (
              <p className="text-center text-gray-600 animate-pulse">Loading attendance...</p>
            ) : error ? (
              <p className="text-center text-red-600">{error}</p>
            ) : records.length === 0 ? (
              <p className="text-center text-gray-700">No attendance records found.</p>
            ) : (
              <>
                {/* Table */}
                <div className="overflow-x-auto border rounded-lg shadow-sm">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gradient-to-r from-green-100 to-teal-100 text-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">Date</th>
                        <th className="px-4 py-3 text-left font-semibold">Check-In</th>
                        <th className="px-4 py-3 text-left font-semibold">Check-Out</th>
                        <th className="px-4 py-3 text-left font-semibold">Total Hours</th>
                        <th className="px-4 py-3 text-left font-semibold">Distance (m)</th>
                        <th className="px-4 py-3 text-left font-semibold">Onsite</th>
                        <th className="px-4 py-3 text-left font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((rec, idx) => (
                        <tr
                          key={rec._id || idx}
                          className={`border-t ${
                            idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                          } hover:bg-green-50 transition`}
                        >
                          <td className="px-4 py-3">
                            {new Date(rec.checkInTime || rec.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            {rec.checkInTime
                              ? new Date(rec.checkInTime).toLocaleTimeString()
                              : "-"}
                          </td>
                          <td className="px-4 py-3">
                            {rec.checkOutTime
                              ? new Date(rec.checkOutTime).toLocaleTimeString()
                              : "-"}
                          </td>
                          <td className="px-4 py-3 font-semibold text-gray-800">
                            {rec.totalHours ? rec.totalHours.toFixed(2) : "0.00"}
                          </td>
                          <td className="px-4 py-3">{rec.distance?.toFixed(2) || "0.00"}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                rec.onsite
                                  ? "bg-green-200 text-green-800"
                                  : "bg-red-200 text-red-800"
                              }`}
                            >
                              {rec.onsite ? "Yes" : "No"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                rec.status === "checked-in"
                                  ? "bg-blue-200 text-blue-800"
                                  : "bg-purple-200 text-purple-800"
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

                {/* Footer Summary */}
                <div className="mt-6 text-sm text-gray-600 text-center sm:text-right">
                  Total Records:{" "}
                  <span className="font-semibold text-gray-800">
                    {records.length}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
