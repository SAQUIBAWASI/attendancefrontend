import axios from "axios";
import { useEffect, useState } from "react";
import EmployeeSidebar from "../Components/EmployeeSidebar";
import Navbar from "../Components/Navbar";

const EmployeeLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Log all localStorage keys and values
    console.log("✅ LocalStorage contents:");
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      console.log(`${key}: ${value}`);
    }

    // Get employeeData object from localStorage
    const employeeDataRaw = localStorage.getItem("employeeData");
    if (!employeeDataRaw) {
      setError("❌ Employee data not found in localStorage.");
      setLoading(false);
      return;
    }

    let employeeId = null;
    try {
      const employeeData = JSON.parse(employeeDataRaw);
      employeeId = employeeData.employeeId;
      console.log("✅ employeeId from localStorage:", employeeId);
    } catch (err) {
      console.error("❌ Failed to parse employeeData:", err);
      setError("❌ Invalid employee data in localStorage.");
      setLoading(false);
      return;
    }

    if (!employeeId) {
      setError("❌ Employee ID not found in employeeData.");
      setLoading(false);
      return;
    }

    const fetchLeaves = async () => {
      try {
        const resp = await axios.get(
          `https://attendancebackend-5cgn.onrender.com/api/leaves/employeeleaves/${employeeId}`
        );

        if (resp.data && resp.data.success) {
          setLeaves(resp.data.records);
        } else {
          setError("❌ Unexpected API response.");
        }
      } catch (err) {
        console.error(err);
        setError("❌ Failed to fetch leaves.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaves();
  }, []);

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;

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
            <h2 className="text-2xl font-bold mb-4 text-blue-900">My Leave Requests</h2>
            {leaves.length === 0 ? (
              <p className="text-gray-500">No leave records found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border text-sm">
                  <thead className="bg-gray-200 text-gray-700">
                    <tr>
                      <th className="p-2 border">Leave Type</th>
                      <th className="p-2 border">Start Date</th>
                      <th className="p-2 border">End Date</th>
                      <th className="p-2 border">Days</th>
                      <th className="p-2 border">Reason</th>
                      <th className="p-2 border">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.map((leave) => (
                      <tr key={leave._id} className="hover:bg-gray-50 border-b">
                        <td className="p-2 border capitalize">{leave.leaveType}</td>
                        <td className="p-2 border">
                          {new Date(leave.startDate).toLocaleDateString()}
                        </td>
                        <td className="p-2 border">
                          {new Date(leave.endDate).toLocaleDateString()}
                        </td>
                        <td className="p-2 border">{leave.days}</td>
                        <td className="p-2 border">{leave.reason}</td>
                        <td className="p-2 border">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              leave.status === "approved"
                                ? "bg-green-200 text-green-800"
                                : leave.status === "rejected"
                                ? "bg-red-200 text-red-800"
                                : "bg-yellow-200 text-yellow-800"
                            }`}
                          >
                            {leave.status}
                          </span>
                        </td>
                      </tr>
                    ))}
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

export default EmployeeLeaves;
