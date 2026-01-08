import { useEffect, useState } from "react";
import { FiEdit, FiSearch, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const LocationListPage = () => {
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Edit Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editLocation, setEditLocation] = useState(null);
  const [updatedName, setUpdatedName] = useState("");
  const [updatedFullAddress, setUpdatedFullAddress] = useState("");
  const [updatedLatitude, setUpdatedLatitude] = useState("");
  const [updatedLongitude, setUpdatedLongitude] = useState("");

  // Fetch all locations
  const fetchLocations = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/location/alllocation");
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Failed to fetch locations");

      setLocations(data.locations || []);
      setFilteredLocations(data.locations || []);
      setLoading(false);
    } catch (error) {
      setErrorMessage(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // Search and Sort functionality
  useEffect(() => {
    const filtered = locations
      .filter(
        (loc) =>
          loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          loc.fullAddress.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        // Active (status !== 'inactive') should be first (0), Inactive (status === 'inactive') should be second (1)
        const statusA = a.status === "inactive" ? 1 : 0;
        const statusB = b.status === "inactive" ? 1 : 0;
        return statusA - statusB;
      });
    setFilteredLocations(filtered);
  }, [searchTerm, locations]);

  // Handle Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this location?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/location/deletelocation/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Failed to delete location");

      setLocations((prev) => prev.filter((loc) => loc._id !== id));
      setFilteredLocations((prev) => prev.filter((loc) => loc._id !== id));
    } catch (error) {
      alert("❌ " + error.message);
    }
  };

  // Handle Toggle Status
  const handleToggleStatus = async (location) => {
    const newStatus = location.status === "inactive" ? "active" : "inactive";
    const confirmMsg = location.status === "inactive"
      ? `Are you sure you want to make ${location.name} ACTIVE?`
      : `Are you sure you want to make ${location.name} INACTIVE?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const response = await fetch(`http://localhost:5000/api/location/updatelocation/${location._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...location,
          status: newStatus,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update status");

      setLocations((prev) =>
        prev.map((loc) => (loc._id === location._id ? { ...loc, status: newStatus } : loc))
      );
      alert(`✅ Location set to ${newStatus}`);
    } catch (error) {
      alert("❌ " + error.message);
    }
  };

  // Open Edit Modal
  const openEditModal = (location) => {
    setEditLocation(location);
    setUpdatedName(location.name);
    setUpdatedFullAddress(location.fullAddress);
    setUpdatedLatitude(location.latitude.toString());   // prefill lat
    setUpdatedLongitude(location.longitude.toString()); // prefill lng
    setIsEditModalOpen(true);
  };
  const navigate = useNavigate();
  // Handle Update
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/location/updatelocation/${editLocation._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: updatedName,
          fullAddress: updatedFullAddress,
          latitude: parseFloat(updatedLatitude),
          longitude: parseFloat(updatedLongitude),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update location");

      // Update list locally
      setLocations((prev) =>
        prev.map((loc) =>
          loc._id === editLocation._id
            ? {
              ...loc,
              name: updatedName,
              fullAddress: updatedFullAddress,
              latitude: parseFloat(updatedLatitude),
              longitude: parseFloat(updatedLongitude),
            }
            : loc
        )
      );
      setFilteredLocations((prev) =>
        prev.map((loc) =>
          loc._id === editLocation._id
            ? {
              ...loc,
              name: updatedName,
              fullAddress: updatedFullAddress,
              latitude: parseFloat(updatedLatitude),
              longitude: parseFloat(updatedLongitude),
            }
            : loc
        )
      );

      setIsEditModalOpen(false);
    } catch (error) {
      alert("❌ " + error.message);
    }
  };

  return (
    <div className="max-w-6xl p-6 mx-auto bg-white rounded-lg shadow-lg">
      {/* Title + Search */}
      <div className="flex flex-col items-center justify-between gap-4 mb-6 md:flex-row">
        <h2 className="text-2xl font-bold text-blue-900">📍 Location Management</h2>

        {/* Search + Add Location */}
        <div className="flex flex-col gap-3 mb-4 md:flex-row md:items-center md:justify-between">

          {/* Search Bar */}
          <div className="relative w-full md:w-1/3">
            <FiSearch className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Search location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Add Location Button */}
          <button
            onClick={() => navigate("/addlocation")}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700"
          >
            📍 Add Location
          </button>

        </div>

      </div>

      {/* Loading / Error */}
      {loading && <div className="py-10 text-center text-gray-500">Loading...</div>}
      {errorMessage && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 border border-red-200 rounded">
          ❌ {errorMessage}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredLocations.length === 0 && (
        <div className="p-6 text-center text-gray-500 rounded-md bg-gray-50">
          No matching locations found.
        </div>
      )}

      {/* Table */}
      {!loading && filteredLocations.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-md">
            <thead className="bg-blue-600">
              <tr>
                <th className="px-4 py-3 text-sm font-semibold text-left text-white">#</th>
                <th className="px-4 py-3 text-sm font-semibold text-left text-white">Location Name</th>
                <th className="px-4 py-3 text-sm font-semibold text-left text-white">Full Address</th>
                <th className="px-4 py-3 text-sm font-semibold text-left text-white">Latitude</th>
                <th className="px-4 py-3 text-sm font-semibold text-left text-white">Longitude</th>
                <th className="px-4 py-3 text-sm font-semibold text-center text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLocations.map((loc, index) => (
                <tr key={loc._id} className="transition hover:bg-blue-50">
                  <td className="px-4 py-3 text-sm text-gray-700">{index + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{loc.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{loc.fullAddress}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{loc.latitude}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{loc.longitude}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => openEditModal(loc)}
                        className="p-2 text-blue-600 transition rounded hover:bg-blue-100"
                      >
                        <FiEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(loc)}
                        className={`px-2 py-1 text-[10px] font-bold rounded uppercase transition ${loc.status === "inactive"
                            ? "bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-700"
                            : "bg-green-100 text-green-700 hover:bg-gray-200 hover:text-gray-700"
                          }`}
                        title={loc.status === "inactive" ? "Make Active" : "Make Inactive"}
                      >
                        {loc.status === "inactive" ? "Inactive" : "Active"}
                      </button>
                      <button
                        onClick={() => handleDelete(loc._id)}
                        className="p-2 text-red-600 transition rounded hover:bg-red-100"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60">
          <div className="w-full max-w-md p-6 bg-white border border-gray-200 shadow-2xl rounded-xl">
            <h3 className="mb-4 text-lg font-semibold text-blue-800">Edit Location</h3>
            <form onSubmit={handleUpdate}>
              {/* Location Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Location Name</label>
                <input
                  type="text"
                  value={updatedName}
                  onChange={(e) => setUpdatedName(e.target.value)}
                  className="w-full p-2 mt-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Full Address */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Full Address</label>
                <textarea
                  value={updatedFullAddress}
                  onChange={(e) => setUpdatedFullAddress(e.target.value)}
                  className="w-full p-2 mt-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  required
                ></textarea>
              </div>

              {/* Latitude */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Latitude</label>
                <input
                  type="text"
                  value={updatedLatitude}
                  onChange={(e) => setUpdatedLatitude(e.target.value)}
                  className="w-full p-2 mt-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Longitude */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700">Longitude</label>
                <input
                  type="text"
                  value={updatedLongitude}
                  onChange={(e) => setUpdatedLongitude(e.target.value)}
                  className="w-full p-2 mt-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white transition bg-blue-600 rounded shadow-md hover:bg-blue-700 hover:shadow-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationListPage;
