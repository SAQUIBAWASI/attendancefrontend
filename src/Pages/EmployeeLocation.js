import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";

const EmployeeLocation = () => {
  const navigate = useNavigate();
  const [locationData, setLocationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🟦 Get employeeId from localStorage
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

  // 🟩 Fetch Location from backend
  useEffect(() => {
    const fetchLocation = async () => {
      if (!employeeId) {
        setError("❌ Employee not logged in. Please login first.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await axios.get(
          `http://localhost:5000/api/employees/mylocation/${employeeId}`
        );

        if (res.data && res.data.success && res.data.data) {
          setLocationData(res.data.data);
        } else {
          setError("❌ No location assigned yet. Please contact admin.");
        }
      } catch (err) {
        console.error("Error fetching location:", err);
        setError("❌ Failed to fetch location. Please contact admin.");
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, [employeeId]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex flex-col flex-1">
        <Navbar />

        <main className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-5xl p-6 mx-auto bg-white rounded-lg shadow-md">
            {/* Header + Back Button */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
              <h2 className="text-2xl font-bold text-blue-900">My Office Assigned Location</h2>
              <button
                onClick={() => navigate("/employeedashboard")}
                className="px-5 py-2 w-full sm:w-auto bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium"
              >
                ← Back to Dashboard
              </button>
            </div>

            {/* Loading & Error States */}
            {loading ? (
              <p className="text-gray-600">Loading your location...</p>
            ) : error ? (
              <p className="text-red-600">{error}</p>
            ) : !locationData ? (
              <p className="text-gray-500">
                No location assigned yet. Please contact admin.
              </p>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full min-w-[500px] text-sm border">
                    <thead className="bg-gray-200 text-gray-700">
                      <tr>
                        <th className="p-2 border">Employee Name</th>
                        <th className="p-2 border">Employee ID</th>
                        <th className="p-2 border">Location Name</th>
                        <th className="p-2 border">Full Address</th>
                        <th className="p-2 border">Latitude</th>
                        <th className="p-2 border">Longitude</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="p-2 border">
                          {locationData?.employee?.name || "N/A"}
                        </td>
                        <td className="p-2 border">
                          {locationData?.employee?.employeeId || "N/A"}
                        </td>
                        <td className="p-2 border">
                          {locationData?.location?.name || "N/A"}
                        </td>
                        <td className="p-2 border text-sm">
                          {locationData?.location?.fullAddress || "N/A"}
                        </td>
                        <td className="p-2 border">
                          {locationData?.location?.latitude ?? "N/A"}
                        </td>
                        <td className="p-2 border">
                          {locationData?.location?.longitude ?? "N/A"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Mobile View */}
                <div className="sm:hidden flex flex-col gap-4">
                  <div className="p-4 border rounded-lg shadow-sm bg-gray-50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-700">
                        Employee
                      </span>
                      <span className="text-gray-900">
                        {locationData?.employee?.name || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-700">
                        Employee ID
                      </span>
                      <span className="text-gray-900">
                        {locationData?.employee?.employeeId || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-700">
                        Location
                      </span>
                      <span className="text-gray-900">
                        {locationData?.location?.name || "N/A"}
                      </span>
                    </div>
                    <div className="mb-2">
                      <span className="font-medium text-gray-700">
                        Address:
                      </span>
                      <p className="text-gray-900 text-sm mt-1">
                        {locationData?.location?.fullAddress || "N/A"}
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">
                        Coordinates
                      </span>
                      <span className="text-gray-900 text-xs">
                        {locationData?.location?.latitude ?? "N/A"},{" "}
                        {locationData?.location?.longitude ?? "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default EmployeeLocation;
