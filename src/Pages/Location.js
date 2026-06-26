import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMapPin, FiCalendar, FiNavigation } from "react-icons/fi";
import { API_BASE_URL } from "../config";
import "../index.css";
import "./EmployeeDashboard.css";

const AddLocationPage = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [fullAddress, setFullAddress] = useState("");

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);

  // ✅ Detect Current Location
  const handleGetCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setErrorMessage("❌ Geolocation is not supported by your browser.");
      return;
    }

    setLoadingLocation(true);
    setErrorMessage("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLatitude(latitude.toFixed(6));
        setLongitude(longitude.toFixed(6));

        // ✅ Reverse geocoding to get full address (using OpenStreetMap)
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          if (data.display_name) {
            setFullAddress(data.display_name);
          } else {
            setFullAddress("");
            setErrorMessage("⚠️ Could not fetch full address.");
          }
        } catch {
          setErrorMessage("⚠️ Failed to fetch address from coordinates.");
        }

        setLoadingLocation(false);
      },
      (err) => {
        setLoadingLocation(false);
        setErrorMessage("❌ Location access denied. Please enter manually.");
      }
    );
  };

  // ✅ Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/location/add-location`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            latitude,
            longitude,
            fullAddress,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add location");
      }

      setSuccessMessage("✅ Location added successfully!");
      setName("");
      setLatitude("");
      setLongitude("");
      setFullAddress("");

      // ✅ Redirect after success
      setTimeout(() => {
        navigate("/locationlist"); // Change route if needed
      }, 1000);
    } catch (error) {
      setErrorMessage(`❌ ${error.message}`);
    }
  };

  return (
    <div className="emp-dash">
      <main className="p-4 sm:p-6 lg:p-8">
        {/* Dashboard Header */}
        <div className="emp-dash__header">
          <div>
            <h1 className="emp-dash__greeting">
              Add <span>Location</span>
            </h1>
            <p className="emp-dash__subtitle">
              Register a new office location in the system
            </p>
          </div>
          <div className="emp-dash__date-pill">
            <FiCalendar />
            <span>
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Form Card */}
        <div className="emp-dash__card">
          <div className="emp-dash__card-header">
            <div>
              <h3 className="emp-dash__card-title flex items-center gap-2">
                <FiMapPin className="text-blue-600" /> Location Details
              </h3>
              <p className="emp-dash__card-desc">Enter location information or use auto-detect</p>
            </div>
          </div>
          <div className="emp-dash__card-body bg-gray-50/50">
            {/* Success / Error Message */}
            {successMessage && (
              <div className="p-4 mb-4 text-green-700 bg-green-100 border border-green-200 rounded-lg">
                {successMessage}
              </div>
            )}
            {errorMessage && (
              <div className="p-4 mb-4 text-red-700 bg-red-100 border border-red-200 rounded-lg">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Location Name */}
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Location Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="Enter location name"
                  required
                />
              </div>

              {/* Auto Detect Location Button */}
              <div className="flex items-center justify-between mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <label className="text-sm font-medium text-gray-700">
                  Detect Location Automatically
                </label>
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  className="h-8 px-4 text-xs font-medium text-gray-900 bg-blue-600 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                  disabled={loadingLocation}
                >
                  <FiNavigation className="text-xs" />
                  {loadingLocation ? "Fetching..." : "Get Current Location"}
                </button>
              </div>

              {/* Latitude */}
              <div className="mb-4">
                <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude
                </label>
                <input
                  id="latitude"
                  type="text"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="Enter latitude"
                  required
                />
              </div>

              {/* Longitude */}
              <div className="mb-4">
                <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude
                </label>
                <input
                  id="longitude"
                  type="text"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="Enter longitude"
                  required
                />
              </div>

              {/* Full Address */}
              <div className="mb-6">
                <label htmlFor="fullAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Address
                </label>
                <textarea
                  id="fullAddress"
                  value={fullAddress}
                  onChange={(e) => setFullAddress(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="Enter full address or use auto-detect"
                  rows="3"
                  required
                ></textarea>
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/locationlist")}
                  className="emp-dash__btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="emp-dash__btn-primary"
                >
                  <FiMapPin className="mr-1" size={14} />
                  Add Location
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AddLocationPage;
