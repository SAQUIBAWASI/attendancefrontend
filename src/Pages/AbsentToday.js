import axios from "axios";
import { useEffect, useState } from "react";
import { isEmployeeHidden } from "../utils/employeeStatus";

const AbsentToday = () => {
  const [absentEmployees, setAbsentEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD

  useEffect(() => {
    fetchAbsentEmployees();
  }, []);

  const fetchAbsentEmployees = async () => {
    try {
      setLoading(true);

      // Fetch all employees
      const empResp = await axios.get("http://localhost:5000/api/employees/get-employees");
      const employees = empResp.data;

      // Fetch today’s attendance
      const attResp = await axios.get("http://localhost:5000/api/attendance/today");
      const attendanceData = attResp.data;
      const attendance = attendanceData.records || [];

      // Extract unique present employee IDs
      const presentIds = [
        ...new Set(
          attendance.map((a) => {
            if (typeof a.employeeId === "object") {
              return a.employeeId.employeeId || a.employeeId._id || "";
            }
            return a.employeeId || a.empId || "";
          }).filter(Boolean)
        ),
      ];

      console.log("✅ Present IDs:", presentIds);

      // Filter employees who are not present and are active
      const absents = employees.filter((emp) => {
        const empId = emp.employeeId || emp._id || emp.empId;

        // Check if employee is inactive (hidden) using utility
        if (isEmployeeHidden(emp)) return false;

        return !presentIds.includes(empId);
      });

      console.log("🚨 Absent Employees:", absents);

      // Format for table
      const formatted = absents.map((emp) => ({
        employeeId: emp.employeeId || emp._id,
        name: emp.name || emp.fullName || "N/A",
        date: new Date().toLocaleDateString("en-CA"),
      }));

      setAbsentEmployees(formatted);
    } catch (err) {
      console.error("❌ Error fetching absent employees:", err);
      setError("Failed to fetch absent employees");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <p className="text-center mt-6 text-gray-600">Loading Absent Employees Today ({today})...</p>;
  if (error)
    return <p className="text-center mt-6 text-red-600">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md mt-6">
      {/* <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Absent Employees Today ({today})
      </h2> */}

      {absentEmployees.length === 0 ? (
        <p className="text-center text-green-600 font-semibold">
          No absent employees today 🎉
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-2 border">Employee ID</th>
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Date</th>
              </tr>
            </thead>
            <tbody>
              {absentEmployees.map((emp) => (
                <tr
                  key={emp.employeeId}
                  className="border-t hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-4 py-2 font-medium">{emp.employeeId}</td>
                  <td className="px-4 py-2">{emp.name}</td>
                  <td className="px-4 py-2">{emp.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AbsentToday;
