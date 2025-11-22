import { ArrowLeft, Eye, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function EmployeeDashboard() {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const BASE_URL = "http://localhost:5000";

  // ✅ Correct useEffect (Attendance Summary Fetch)
  useEffect(() => {
    const fetchAttendanceSummary = async () => {
      try {
        const employeeData = JSON.parse(localStorage.getItem("employeeData"));
        const employeeId = employeeData?.employeeId;

        if (!employeeId) {
          setError("❌ Employee ID not found. Please log in again.");
          setLoading(false);
          return;
        }

        const res = await fetch(
          `${BASE_URL}/api/attendanceSummary/getattendancesummary?employeeId=${employeeId}`
        );
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to fetch summary");

        const summary = data.summary || [];

        // Sort by latest month first
        const sortedSummary = summary.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );

        setRecords(sortedSummary);
      } catch (err) {
        console.error("Summary fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceSummary();
  }, []);

  return (
    <div className="min-h-screen p-6 bg-gray-100">

      {/* Back Button */}
      <button
        onClick={() => navigate("/employeedashboard")}
        className="flex items-center gap-2 px-4 py-2 mb-4 text-white transition bg-gray-700 rounded-lg hover:bg-gray-800"
      >
        <ArrowLeft size={18} /> Back
      </button>

      <div className="p-6 bg-white shadow-lg rounded-xl">
        <h2 className="mb-6 text-xl font-bold">My Salary Details</h2>

        {loading && <p className="text-center text-gray-500">Loading...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-white bg-blue-600">
              <th className="p-3">ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Present</th>
              <th className="p-3">Late Days</th>
              <th className="p-3">Half Days</th>
              <th className="p-3">Salary</th>
              <th className="p-3">Month</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {records.map((emp, index) => (
              <tr
                key={index}
                className="text-gray-700 transition border-b hover:bg-gray-50"
              >
                <td className="p-3">{emp.employeeId}</td>

                <td className="flex items-center gap-3 p-3">
                  <div className="flex items-center justify-center w-10 h-10 font-bold text-blue-700 bg-blue-100 rounded-full">
                    {emp.name?.charAt(0)}
                  </div>
                  {emp.name}
                </td>

                <td className="p-3">
                  <div className="px-4 py-1 font-semibold text-green-700 bg-green-100 rounded-full w-fit">
                    {emp.presentDays}
                  </div>
                </td>

                <td className="p-3">
                  <div className="px-4 py-1 font-semibold text-blue-700 bg-blue-100 rounded-full w-fit">
                    {emp.lateDays}
                  </div>
                </td>

                <td className="p-3">
                  <div className="px-4 py-1 font-semibold text-yellow-600 bg-yellow-100 rounded-full w-fit">
                    {emp.halfDays}
                  </div>
                </td>

                <td className="p-3 font-bold text-green-700">
                  ₹{emp.calculatedSalary}
                </td>

                <td className="p-3">{emp.month}</td>

                <td className="flex gap-3 p-3">
                  <button
                    onClick={() =>
                      navigate(`/employee-details/${emp.employeeId}`, {
                        state: emp,
                      })
                    }
                    className="p-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                  >
                    <Eye size={18} />
                  </button>

                  <button
                    onClick={() =>
                      navigate(`/employee-slip/${emp.employeeId}`, {
                        state: emp,
                      })
                    }
                    className="p-2 text-white bg-purple-500 rounded-lg hover:bg-purple-600"
                  >
                    <FileText size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!loading && records.length === 0 && (
          <p className="p-6 text-center text-gray-500">No records found.</p>
        )}
      </div>
    </div>
  );
}
