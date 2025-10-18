import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ShiftList() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://attendancebackend-5cgn.onrender.com/api/shifts/all");
      setShifts(res.data);
    } catch (err) {
      alert("❌ Failed to load shifts");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this shift?")) return;

    try {
      await axios.delete(`https://attendancebackend-5cgn.onrender.com/api/shifts/${id}`);
      alert("✅ Shift deleted successfully");
      fetchShifts();
    } catch (err) {
      alert("❌ Failed to delete shift");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Assigned Shifts</h1>
          <button
            onClick={() => navigate("/shift")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Assign New Shift
          </button>
        </div>

        {loading ? (
          <div className="text-center text-gray-600 py-8">Loading shifts...</div>
        ) : shifts.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            No shifts assigned yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                  <th className="px-4 py-3 border-b">Employee ID</th>
                  <th className="px-4 py-3 border-b">Employee Name</th>
                  <th className="px-4 py-3 border-b">Shift Type</th>
                  <th className="px-4 py-3 border-b">Start Time</th>
                  <th className="px-4 py-3 border-b">End Time</th>
                  <th className="px-4 py-3 border-b text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shifts.map((shift) => (
                  <tr
                    key={shift._id}
                    className="border-b hover:bg-gray-50 text-sm text-gray-800"
                  >
                    <td className="px-4 py-3">{shift.employeeId}</td>
                    <td className="px-4 py-3">{shift.employeeName}</td>
                    <td className="px-4 py-3 font-semibold text-blue-700">
                      Shift {shift.shiftType}
                    </td>
                    <td className="px-4 py-3">{shift.startTime}</td>
                    <td className="px-4 py-3">{shift.endTime}</td>
                    <td className="px-4 py-3 text-center flex justify-center gap-2">
                      <button
                        onClick={() => navigate(`/edit-shift/${shift._id}`)}
                        className="px-3 py-1 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(shift._id)}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
