import { useEffect, useState } from "react";
import { CSVLink } from "react-csv";
import EmployeeSidebar from "../Components/EmployeeSidebar";
import Navbar from "../Components/Navbar";

const BASE_URL = "http://localhost:5000"; // backend base URL

export default function MyAttendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        // ✅ Load employee data from localStorage
        const employeeData = JSON.parse(localStorage.getItem("employeeData"));
        const employeeId = employeeData?.employeeId;

        if (!employeeId) {
          setError("❌ Employee ID not found in localStorage. Please log in again.");
          setLoading(false);
          return;
        }

        // ✅ Fetch attendance for this employee
        const res = await fetch(`${BASE_URL}/api/attendance/myattendance/${employeeId}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to fetch attendance");

        // ✅ Store attendance records
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

  // ✅ CSV Export Data
  const csvData = records.map((rec) => ({
    Date: new Date(rec.checkInTime || rec.createdAt).toLocaleDateString(),
    "Check In": rec.checkInTime ? new Date(rec.checkInTime).toLocaleTimeString() : "-",
    "Check Out": rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleTimeString() : "-",
    "Total Hours": rec.totalHours ? rec.totalHours.toFixed(2) : "0.00",
    "Distance (m)": rec.distance ? rec.distance.toFixed(2) : "0.00",
    Onsite: rec.onsite ? "Yes" : "No",
    Status: rec.status,
  }));

  // ✅ Conditional Rendering
  if (loading)
    return <p className="text-center mt-6 text-lg font-medium">Loading attendance...</p>;

  if (error)
    return <p className="text-center mt-6 text-red-600 font-medium">{error}</p>;

  if (records.length === 0)
    return <p className="text-center mt-6 text-gray-700 font-medium">
      No attendance records found.
    </p>;

  // ✅ Page Layout
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="flex-shrink-0 h-screen sticky top-0">
        <EmployeeSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-auto">
        <Navbar />

        <div className="p-6 flex-1">
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600 text-center mb-4">
            My Attendance
          </h2>

          {/* ✅ CSV Download Button */}
          <div className="text-right mb-4">
            <CSVLink
              data={csvData}
              filename={`attendance_report_${new Date().toLocaleDateString()}.csv`}
              className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 transition"
            >
              Download CSV
            </CSVLink>
          </div>

          {/* ✅ Attendance Table */}
          <div className="overflow-x-auto shadow-lg rounded-lg bg-white p-4">
            <table className="min-w-full table-auto">
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
                  <tr key={rec._id || idx} className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <td className="px-6 py-3 text-gray-700">
                      {new Date(rec.checkInTime || rec.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-gray-700">
                      {rec.checkInTime ? new Date(rec.checkInTime).toLocaleTimeString() : "-"}
                    </td>
                    <td className="px-6 py-3 text-gray-700">
                      {rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleTimeString() : "-"}
                    </td>
                    <td className="px-6 py-3 font-semibold text-gray-800">
                      {rec.totalHours ? rec.totalHours.toFixed(2) : "0.00"}
                    </td>
                    <td className="px-6 py-3 text-gray-700">
                      {rec.distance ? rec.distance.toFixed(2) : "0.00"}
                    </td>
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
        </div>
      </div>
    </div>
  );
}
