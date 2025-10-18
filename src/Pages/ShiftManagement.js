import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ShiftAssignment() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: "",
    employeeName: "",
    shiftType: "",
    startTime: "",
    endTime: "",
  });

  const shifts = {
    A: { startTime: "06:00", endTime: "14:00" },
    B: { startTime: "14:00", endTime: "22:00" },
    C: { startTime: "22:00", endTime: "06:00" },
  };

  // When admin selects shift type (A/B/C)
  const handleShiftChange = (shift) => {
    setFormData({
      ...formData,
      shiftType: shift,
      startTime: shifts[shift].startTime,
      endTime: shifts[shift].endTime,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.employeeId || !formData.employeeName || !formData.shiftType) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/api/shifts/assign", formData);

      if (res.status === 200 || res.status === 201) {
        alert("✅ Shift assigned successfully!");
        setFormData({
          employeeId: "",
          employeeName: "",
          shiftType: "",
          startTime: "",
          endTime: "",
        });
        navigate("/shifts");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Failed to assign shift. Check your server connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
        <h1 className="text-xl font-bold mb-4 text-gray-800 text-center">
          Assign Shift to Employee
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Employee ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee ID *
            </label>
            <input
              type="text"
              value={formData.employeeId}
              onChange={(e) =>
                setFormData({ ...formData, employeeId: e.target.value })
              }
              placeholder="Enter employee ID"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Employee Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee Name *
            </label>
            <input
              type="text"
              value={formData.employeeName}
              onChange={(e) =>
                setFormData({ ...formData, employeeName: e.target.value })
              }
              placeholder="Enter employee name"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Shift Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Shift *
            </label>
            <div className="flex gap-3">
              {["A", "B", "C"].map((shift) => (
                <button
                  key={shift}
                  type="button"
                  onClick={() => handleShiftChange(shift)}
                  className={`flex-1 py-2 rounded-lg border text-center font-semibold ${
                    formData.shiftType === shift
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Shift {shift}
                </button>
              ))}
            </div>
          </div>

          {/* Start & End Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold"
          >
            {loading ? "Assigning..." : "Assign Shift"}
          </button>

          {/* Cancel */}
          <button
            type="button"
            onClick={() => navigate("/shifts")}
            className="w-full border mt-2 py-2 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
