import axios from "axios";
import { useEffect, useState } from "react";
import EmployeeSidebar from "../Components/EmployeeSidebar";
import Navbar from "../Components/Navbar";

const EmployeeShift = () => {
  const [shift, setShift] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState(""); // "Ongoing", "Upcoming", "Completed"

  // Get logged-in employeeId from localStorage
  const employeeDataRaw = localStorage.getItem("employeeData");
  let employeeId = null;
  if (employeeDataRaw) {
    try {
      const employeeData = JSON.parse(employeeDataRaw);
      employeeId = employeeData.employeeId;
    } catch (err) {
      console.error("Invalid employee data in localStorage.");
    }
  }

  const fetchShift = async () => {
    if (!employeeId) {
      setError("❌ Employee not logged in. Please login first.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(
        `https://attendancebackend-5cgn.onrender.com/api/shifts/employee/${employeeId}`
      );

      if (res.data) {
        setShift(res.data);
        determineShiftStatus(res.data);
      } else {
        setError("❌ No shift assigned yet. Please contact admin.");
      }
    } catch (err) {
      console.error("Error fetching shift:", err);
      setError("❌ Failed to fetch shift. Please contact admin.");
      setShift(null);
    } finally {
      setLoading(false);
    }
  };

  const determineShiftStatus = (shiftData) => {
    const now = new Date();
    const [startH, startM] = shiftData.startTime.split(":").map(Number);
    const [endH, endM] = shiftData.endTime.split(":").map(Number);

    let startTime = new Date();
    startTime.setHours(startH, startM, 0);

    let endTime = new Date();
    endTime.setHours(endH, endM, 0);

    // Handle overnight shift (e.g., 22:00 - 06:00)
    if (endTime <= startTime) {
      endTime.setDate(endTime.getDate() + 1);
    }

    if (now >= startTime && now <= endTime) {
      setStatus("Ongoing");
    } else if (now < startTime) {
      setStatus("Upcoming");
    } else {
      setStatus("Completed");
    }
  };

useEffect(() => {
  fetchShift(); // fetch once on mount

  const interval = setInterval(() => {
    if (shift) determineShiftStatus(shift); // only update status
  }, 60000);

  return () => clearInterval(interval);
}, []); // <-- empty dependency array


  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <EmployeeSidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <Navbar />

        {/* Page content */}
        <main className="p-6">
          <div className="bg-white rounded shadow-md max-w-5xl mx-auto p-6">
            <h2 className="text-2xl font-bold text-blue-900 mb-6">
              My Shift
            </h2>

            {loading ? (
              <p className="text-gray-600">Loading your shift...</p>
            ) : error ? (
              <p className="text-red-600">{error}</p>
            ) : !shift ? (
              <p className="text-gray-500">
                No shift assigned yet. Please contact admin.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border text-sm">
                  <thead className="bg-gray-200 text-gray-700">
                    <tr>
                      <th className="p-2 border">Shift Type</th>
                      <th className="p-2 border">Start Time</th>
                      <th className="p-2 border">End Time</th>
                      <th className="p-2 border">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-gray-50 border-b">
                      <td className="p-2 border">{shift.shiftType}</td>
                      <td className="p-2 border">{shift.startTime}</td>
                      <td className="p-2 border">{shift.endTime}</td>
                      <td className="p-2 border">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            status === "Ongoing"
                              ? "bg-green-200 text-green-800"
                              : status === "Upcoming"
                              ? "bg-blue-200 text-blue-800"
                              : "bg-gray-200 text-gray-800"
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default EmployeeShift;
