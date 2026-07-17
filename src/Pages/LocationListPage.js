// import { useEffect, useState } from "react";
// import { FiEdit, FiTrash2 } from "react-icons/fi";
// import { useNavigate } from "react-router-dom";
// import { API_BASE_URL } from "../config";

// const LocationListPage = () => {
//   const [locations, setLocations] = useState([]);
//   const [filteredLocations, setFilteredLocations] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [errorMessage, setErrorMessage] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");

//   // Edit Modal States
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [editLocation, setEditLocation] = useState(null);
//   const [updatedName, setUpdatedName] = useState("");
//   const [updatedFullAddress, setUpdatedFullAddress] = useState("");
//   const [updatedLatitude, setUpdatedLatitude] = useState("");
//   const [updatedLongitude, setUpdatedLongitude] = useState("");

//   // Fetch all locations
//   const fetchLocations = async () => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/location/alllocation`);
//       const data = await response.json();

//       if (!response.ok) throw new Error(data.message || "Failed to fetch locations");

//       setLocations(data.locations || []);
//       setFilteredLocations(data.locations || []);
//       setLoading(false);
//     } catch (error) {
//       setErrorMessage(error.message);
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchLocations();
//   }, []);

//   // Search and Sort functionality
//   useEffect(() => {
//     const filtered = locations
//       .filter(
//         (loc) =>
//           loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           loc.fullAddress.toLowerCase().includes(searchTerm.toLowerCase())
//       )
//       .sort((a, b) => {
//         // Active (status !== 'inactive') should be first (0), Inactive (status === 'inactive') should be second (1)
//         const statusA = a.status === "inactive" ? 1 : 0;
//         const statusB = b.status === "inactive" ? 1 : 0;
//         return statusA - statusB;
//       });
//     setFilteredLocations(filtered);
//   }, [searchTerm, locations]);

//   // Handle Delete
//   const handleDelete = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this location?")) return;

//     try {
//       const response = await fetch(`${API_BASE_URL}/location/deletelocation/${id}`, {
//         method: "DELETE",
//       });
//       const data = await response.json();

//       if (!response.ok) throw new Error(data.message || "Failed to delete location");

//       setLocations((prev) => prev.filter((loc) => loc._id !== id));
//       setFilteredLocations((prev) => prev.filter((loc) => loc._id !== id));
//     } catch (error) {
//       alert("❌ " + error.message);
//     }
//   };

//   // Handle Toggle Status
//   const handleToggleStatus = async (location) => {
//     const newStatus = location.status === "inactive" ? "active" : "inactive";
//     const confirmMsg = location.status === "inactive"
//       ? `Are you sure you want to make ${location.name} ACTIVE?`
//       : `Are you sure you want to make ${location.name} INACTIVE?`;

//     if (!window.confirm(confirmMsg)) return;

//     try {
//       const response = await fetch(`${API_BASE_URL}/location/updatelocation/${location._id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           ...location,
//           status: newStatus,
//         }),
//       });

//       const data = await response.json();
//       if (!response.ok) throw new Error(data.message || "Failed to update status");

//       setLocations((prev) =>
//         prev.map((loc) => (loc._id === location._id ? { ...loc, status: newStatus } : loc))
//       );
//       alert(`✅ Location set to ${newStatus}`);
//     } catch (error) {
//       alert("❌ " + error.message);
//     }
//   };

//   // Open Edit Modal
//   const openEditModal = (location) => {
//     setEditLocation(location);
//     setUpdatedName(location.name);
//     setUpdatedFullAddress(location.fullAddress);
//     setUpdatedLatitude(location.latitude.toString());   // prefill lat
//     setUpdatedLongitude(location.longitude.toString()); // prefill lng
//     setIsEditModalOpen(true);
//   };
//   const navigate = useNavigate();
//   // Handle Update
//   const handleUpdate = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await fetch(`${API_BASE_URL}/location/updatelocation/${editLocation._id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           name: updatedName,
//           fullAddress: updatedFullAddress,
//           latitude: parseFloat(updatedLatitude),
//           longitude: parseFloat(updatedLongitude),
//         }),
//       });

//       const data = await response.json();
//       if (!response.ok) throw new Error(data.message || "Failed to update location");

//       // Update list locally
//       setLocations((prev) =>
//         prev.map((loc) =>
//           loc._id === editLocation._id
//             ? {
//               ...loc,
//               name: updatedName,
//               fullAddress: updatedFullAddress,
//               latitude: parseFloat(updatedLatitude),
//               longitude: parseFloat(updatedLongitude),
//             }
//             : loc
//         )
//       );
//       setFilteredLocations((prev) =>
//         prev.map((loc) =>
//           loc._id === editLocation._id
//             ? {
//               ...loc,
//               name: updatedName,
//               fullAddress: updatedFullAddress,
//               latitude: parseFloat(updatedLatitude),
//               longitude: parseFloat(updatedLongitude),
//             }
//             : loc
//         )
//       );

//       setIsEditModalOpen(false);
//     } catch (error) {
//       alert("❌ " + error.message);
//     }
//   };

//   return (
//    <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
//       <div className="mx-auto max-w-8xl">
//       {/* Title + Search */}
//       <div className="flex flex-col items-center justify-between gap-4 mb-6 md:flex-row">
//         {/* <h2 className="text-2xl font-bold text-blue-900">📍 Location Management</h2> */}

//         {/* Search + Add Location */}
//         <div className="flex flex-col gap-3 mb-4 md:flex-row md:items-center md:justify-between">

//           {/* Search Bar */}
//           <div className="relative w-full md:w-1/3">
//             {/* <FiSearch className="absolute text-gray-500 transform -translate-y-1/2 left-3 top-1/2" /> */}
//             {/* <input
//               type="text"
//               placeholder="Search location..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             /> */}
//           </div>
//           </div>

//           {/* Add Location Button */}
//           <button
//             onClick={() => {
//               const isEmployee = window.location.pathname.startsWith("/emp-");
//               navigate(isEmployee ? "/emp-add-location" : "/addlocation");
//             }}
//             className="flex items-center gap-2 px-4 py-2 text-sm text-gray-900 bg-blue-600 rounded-lg hover:bg-blue-800"
//           >
//             📍 Add Location
//           </button>

//         </div>

//       </div>

//       {/* Loading / Error */}
//       {loading && <div className="py-10 text-center text-gray-500">Loading...</div>}
//       {errorMessage && (
//         <div className="p-4 mb-4 text-red-700 bg-red-100 border border-red-200 rounded">
//           ❌ {errorMessage}
//         </div>
//       )}

//       {/* Empty State */}
//       {!loading && filteredLocations.length === 0 && (
//         <div className="p-6 text-center text-gray-500 rounded-md bg-white">
//           No matching locations found.
//         </div>
//       )}

//       {/* Table */}
//       {!loading && filteredLocations.length > 0 && (
//         <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
//           <table className="min-w-full">
//             <thead className="text-left text-sm text-gray-900 bg-gradient-to-r from-green-500 to-blue-600">
//               <tr>
//                 <th className="px-2 py-2 text-center">S.No</th>
//                 <th className="px-2 py-2 text-center">Location Name</th>
//                 <th className="px-2 py-2 text-center">Full Address</th>
//                 <th className="px-2 py-2 text-center">Latitude</th>
//                 <th className="px-2 py-2 text-center">Longitude</th>
//                 <th className="px-2 py-2 text-center">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {filteredLocations.map((loc, index) => (
//                 <tr key={loc._id} className="transition hover:bg-blue-50">
//                   <td className="px-2 py-2 text-center whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
//                   <td className="px-2 py-2 text-center whitespace-nowrap text-sm font-medium text-gray-900">{loc.name}</td>
//                   <td className="px-2 py-2 text-center text-sm text-gray-500">{loc.fullAddress}</td>
//                   <td className="px-2 py-2 text-center text-sm text-gray-500">{loc.latitude}</td>
//                   <td className="px-2 py-2 text-center text-sm text-gray-500">{loc.longitude}</td>
//                   <td className="px-2 py-2 text-center text-center">
//                     <div className="flex items-center justify-center gap-3">
//                       <button
//                         onClick={() => openEditModal(loc)}
//                         className="p-2 text-blue-600 transition rounded hover:bg-blue-100"
//                       >
//                         <FiEdit size={18} />
//                       </button>
//                       <button
//                         onClick={() => handleToggleStatus(loc)}
//                         className={`px-2 py-2 text-center text-[10px] font-bold rounded uppercase transition ${loc.status === "inactive"
//                           ? "bg-gray-100 text-gray-500 hover:bg-blue-100 hover:text-green-700"
//                           : "bg-blue-100 text-green-700 hover:bg-gray-200 hover:text-gray-700"
//                           }`}
//                         title={loc.status === "inactive" ? "Make Active" : "Make Inactive"}
//                       >
//                         {loc.status === "inactive" ? "Inactive" : "Active"}
//                       </button>
//                       <button
//                         onClick={() => handleDelete(loc._id)}
//                         className="p-2 text-red-600 transition rounded hover:bg-red-100"
//                       >
//                         <FiTrash2 size={18} />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* Edit Modal */}
//       {isEditModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100/60">
//           <div className="w-full max-w-md p-6 bg-white border border-gray-200 shadow-2xl rounded-xl">
//             <h3 className="mb-4 text-lg font-semibold text-blue-800">Edit Location</h3>
//             <form onSubmit={handleUpdate}>
//               {/* Location Name */}
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700">Location Name</label>
//                 <input
//                   type="text"
//                   value={updatedName}
//                   onChange={(e) => setUpdatedName(e.target.value)}
//                   className="w-full p-2 mt-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
//                   required
//                 />
//               </div>

//               {/* Full Address */}
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700">Full Address</label>
//                 <textarea
//                   value={updatedFullAddress}
//                   onChange={(e) => setUpdatedFullAddress(e.target.value)}
//                   className="w-full p-2 mt-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
//                   rows="3"
//                   required
//                 ></textarea>
//               </div>

//               {/* Latitude */}
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700">Latitude</label>
//                 <input
//                   type="text"
//                   value={updatedLatitude}
//                   onChange={(e) => setUpdatedLatitude(e.target.value)}
//                   className="w-full p-2 mt-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
//                   required
//                 />
//               </div>

//               {/* Longitude */}
//               <div className="mb-6">
//                 <label className="block text-sm font-medium text-gray-700">Longitude</label>
//                 <input
//                   type="text"
//                   value={updatedLongitude}
//                   onChange={(e) => setUpdatedLongitude(e.target.value)}
//                   className="w-full p-2 mt-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
//                   required
//                 />
//               </div>

//               {/* Buttons */}
//               <div className="flex justify-end gap-3">
//                 <button
//                   type="button"
//                   onClick={() => setIsEditModalOpen(false)}
//                   className="px-2 py-2 text-center text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-2 py-2 text-center text-gray-900 transition bg-blue-600 rounded shadow-md hover:bg-blue-700 hover:shadow-lg"
//                 >
//                   Save Changes
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default LocationListPage;


import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBuilding, FaMapMarkerAlt, FaSearch } from "react-icons/fa";
import { FiEdit, FiTrash2, FiCalendar, FiMapPin, FiGlobe, FiActivity, FiChevronUp, FiChevronDown } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import "../index.css";
import "./EmployeeDashboard.css";

const LocationListPage = () => {
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Search filters
  const [searchTerm, setSearchTerm] = useState("");
  
  // City and State filter states
  const [filterCity, setFilterCity] = useState("");
  const [filterState, setFilterState] = useState("");
  const [showCityFilter, setShowCityFilter] = useState(false);
  const [showStateFilter, setShowStateFilter] = useState(false);
  
  // Pin code filter
  const [filterPinCode, setFilterPinCode] = useState("");
  
  // Unique cities and states
  const [uniqueCities, setUniqueCities] = useState([]);
  const [uniqueStates, setUniqueStates] = useState([]);
  
  // Refs for click outside
  const cityFilterRef = useRef(null);
  const stateFilterRef = useRef(null);
  
  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  });

  // Edit Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editLocation, setEditLocation] = useState(null);
  const [updatedName, setUpdatedName] = useState("");
  const [updatedFullAddress, setUpdatedFullAddress] = useState("");
  const [updatedLatitude, setUpdatedLatitude] = useState("");
  const [updatedLongitude, setUpdatedLongitude] = useState("");

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cityFilterRef.current && !cityFilterRef.current.contains(event.target)) {
        setShowCityFilter(false);
      }
      if (stateFilterRef.current && !stateFilterRef.current.contains(event.target)) {
        setShowStateFilter(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Extract unique cities and states from locations
  const extractUniqueValues = (locationsData) => {
    const cities = new Set();
    const states = new Set();
    
    locationsData.forEach(loc => {
      const addressParts = loc.fullAddress.split(',');
      if (addressParts.length > 1) {
        const possibleCity = addressParts[addressParts.length - 2]?.trim();
        if (possibleCity && possibleCity.length > 2) cities.add(possibleCity);
      }
      
      const possibleState = addressParts[addressParts.length - 1]?.trim();
      if (possibleState && possibleState.length > 2) states.add(possibleState);
      
      const pinMatch = loc.fullAddress.match(/\b\d{6}\b/);
      if (pinMatch) {
        const beforePin = loc.fullAddress.substring(0, pinMatch.index).trim();
        const lastComma = beforePin.lastIndexOf(',');
        if (lastComma !== -1) {
          const possibleStateFromPin = beforePin.substring(lastComma + 1).trim();
          if (possibleStateFromPin && possibleStateFromPin.length > 2) states.add(possibleStateFromPin);
        }
      }
    });
    
    setUniqueCities(Array.from(cities).sort());
    setUniqueStates(Array.from(states).sort());
  };

  // Fetch all locations
  const fetchLocations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/location/alllocation`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Failed to fetch locations");

      const locationsData = data.locations || [];
      setLocations(locationsData);
      extractUniqueValues(locationsData);
      setFilteredLocations(locationsData);
      setLoading(false);
      
      setPagination(prev => ({
        ...prev,
        totalCount: locationsData.length,
        totalPages: Math.ceil(locationsData.length / prev.limit),
        currentPage: 1
      }));
    } catch (error) {
      setErrorMessage(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    filterLocations();
  }, [searchTerm, filterCity, filterState, filterPinCode, locations]);

  useEffect(() => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, [searchTerm, filterCity, filterState, filterPinCode]);

  const filterLocations = () => {
    let filtered = [...locations];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(loc => 
        loc.name?.toLowerCase().includes(term) ||
        loc.fullAddress?.toLowerCase().includes(term)
      );
    }

    if (filterCity) {
      filtered = filtered.filter(loc => {
        const addressParts = loc.fullAddress.split(',');
        if (addressParts.length > 1) {
          const possibleCity = addressParts[addressParts.length - 2]?.trim();
          return possibleCity === filterCity;
        }
        return false;
      });
    }

    if (filterState) {
      filtered = filtered.filter(loc => {
        const addressParts = loc.fullAddress.split(',');
        const possibleState = addressParts[addressParts.length - 1]?.trim();
        return possibleState === filterState;
      });
    }

    if (filterPinCode.trim()) {
      filtered = filtered.filter(loc => {
        const pinMatch = loc.fullAddress.match(/\b\d{6}\b/);
        return pinMatch && pinMatch[0] === filterPinCode;
      });
    }

    filtered.sort((a, b) => {
      const statusA = a.status === "inactive" ? 1 : 0;
      const statusB = b.status === "inactive" ? 1 : 0;
      return statusA - statusB;
    });

    setFilteredLocations(filtered);
    setPagination(prev => ({
      ...prev,
      totalCount: filtered.length,
      totalPages: Math.ceil(filtered.length / prev.limit)
    }));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterCity("");
    setFilterState("");
    setFilterPinCode("");
  };

  const handleItemsPerPageChange = (limit) => {
    setPagination({
      currentPage: 1,
      limit: limit,
      totalCount: filteredLocations.length,
      totalPages: Math.ceil(filteredLocations.length / limit)
    });
  };

  const handlePrevPage = () => {
    if (pagination.currentPage > 1) {
      setPagination(prev => ({
        ...prev,
        currentPage: prev.currentPage - 1
      }));
    }
  };

  const handleNextPage = () => {
    if (pagination.currentPage < pagination.totalPages) {
      setPagination(prev => ({
        ...prev,
        currentPage: prev.currentPage + 1
      }));
    }
  };

  const handlePageClick = (page) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= pagination.totalPages; i++) {
      if (
        i === 1 ||
        i === pagination.totalPages ||
        (i >= pagination.currentPage - 2 && i <= pagination.currentPage + 2)
      ) {
        pageNumbers.push(i);
      } else if (i === pagination.currentPage - 3 || i === pagination.currentPage + 3) {
        pageNumbers.push("...");
      }
    }
    return pageNumbers;
  };

  const indexOfLastItem = pagination.currentPage * pagination.limit;
  const indexOfFirstItem = indexOfLastItem - pagination.limit;
  const currentItems = filteredLocations.slice(indexOfFirstItem, indexOfLastItem);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this location?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/location/deletelocation/${id}`, {
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

  const handleToggleStatus = async (location) => {
    const newStatus = location.status === "inactive" ? "active" : "inactive";
    const confirmMsg = location.status === "inactive"
      ? `Are you sure you want to make ${location.name} ACTIVE?`
      : `Are you sure you want to make ${location.name} INACTIVE?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const response = await fetch(`${API_BASE_URL}/location/updatelocation/${location._id}`, {
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

  const openEditModal = (location) => {
    setEditLocation(location);
    setUpdatedName(location.name);
    setUpdatedFullAddress(location.fullAddress);
    setUpdatedLatitude(location.latitude.toString());
    setUpdatedLongitude(location.longitude.toString());
    setIsEditModalOpen(true);
  };
  
  const navigate = useNavigate();
  
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/location/updatelocation/${editLocation._id}`, {
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

      setIsEditModalOpen(false);
      fetchLocations();
    } catch (error) {
      alert("❌ " + error.message);
    }
  };

  return (
    <div className="emp-dash">
      <main className="p-2 sm:p-4 lg:p-6">
        {/* Dashboard Header */}
        <div className="emp-dash__header">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap flex items-center gap-2">
              Location <span>Management</span>
            </h1>
             {/* <p className="emp-dash__subtitle text-xs sm:text-sm text-gray-500 font-medium">
              Manage and monitor all office locations
            </p> */}
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

        {/* Top KPI Stats Grid */}
        {!loading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
            <div className="emp-dash__stat">
              <div className="emp-dash__stat-top">
                <span className="emp-dash__stat-label">Total Locations</span>
                <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                  <FiMapPin className="text-blue-500" />
                </div>
              </div>
              <div className="emp-dash__stat-value">
                {locations.length}
              </div>
              <div className="emp-dash__stat-meta">registered locations</div>
            </div>

            <div className="emp-dash__stat">
              <div className="emp-dash__stat-top">
                <span className="emp-dash__stat-label">Active Locations</span>
                <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                  <FiActivity className="text-green-500" />
                </div>
              </div>
              <div className="emp-dash__stat-value">
                {locations.filter(l => l.status !== 'inactive').length}
              </div>
              <div className="emp-dash__stat-meta">currently active</div>
            </div>

            <div className="emp-dash__stat">
              <div className="emp-dash__stat-top">
                <span className="emp-dash__stat-label">Unique Cities</span>
                <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                  <FaBuilding className="text-amber-500" />
                </div>
              </div>
              <div className="emp-dash__stat-value">
                {uniqueCities.length}
              </div>
              <div className="emp-dash__stat-meta">cities covered</div>
            </div>

            <div className="emp-dash__stat">
              <div className="emp-dash__stat-top">
                <span className="emp-dash__stat-label">Unique States</span>
                <div className="emp-dash__stat-icon emp-dash__stat-icon--absent">
                  <FaMapMarkerAlt className="text-rose-500" />
                </div>
              </div>
              <div className="emp-dash__stat-value">
                {uniqueStates.length}
              </div>
              <div className="emp-dash__stat-meta">states covered</div>
            </div>
          </div>
        )}

        {/* Filter Card */}
        <div className="emp-dash__card">
          {/* Desktop Header - Hidden on mobile */}
          {/* <div className="hidden sm:flex emp-dash__card-header">
            <div>
              <h3 className="emp-dash__card-title flex items-center gap-2">
                <FiMapPin className="text-blue-600" /> Filter Locations
              </h3>
              <p className="emp-dash__card-desc">Search by name, address, city, state, or pin code</p>
            </div>
          </div> */}

          {/* Mobile Filter Toggle Button */}
          <div className="sm:hidden flex items-center justify-between p-3 border-b border-gray-100">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-700"
            >
              <FiMapPin className="text-blue-600" />
              Filters
              {showMobileFilters ? <FiChevronUp className="ml-1" /> : <FiChevronDown className="ml-1" />}
            </button>
            <span className="text-xs text-gray-400">
              {filteredLocations.length} locations
            </span>
          </div>

          {/* Filter Content - Toggle on Mobile */}
          <div className={`${showMobileFilters ? 'block' : 'hidden sm:block'}`}>
            <div className="emp-dash__card-body bg-gray-50/50">
              <div className="flex flex-wrap items-center gap-3">
                
                {/* Location Name/Address Search */}
                <div className="relative flex-1 min-w-[180px]">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <FaSearch className="text-xs" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search by name or address..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                {/* City Filter Button */}
                <div className="relative" ref={cityFilterRef}>
                  <button
                    onClick={() => setShowCityFilter(!showCityFilter)}
                    className={`h-8 px-3 text-xs font-medium rounded-lg transition flex items-center gap-1 ${
                      filterCity 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    <FaBuilding className="text-xs" /> City {filterCity && `: ${filterCity}`}
                  </button>
                  
                  {showCityFilter && (
                    <div className="absolute z-50 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      <div 
                        onClick={() => {
                          setFilterCity('');
                          setShowCityFilter(false);
                        }}
                        className="px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer border-b border-gray-200 font-medium text-gray-700"
                      >
                        All Cities
                      </div>
                      {uniqueCities.map(city => (
                        <div 
                          key={city}
                          onClick={() => {
                            setFilterCity(city);
                            setShowCityFilter(false);
                          }}
                          className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer ${
                            filterCity === city ? 'bg-blue-50 text-blue-700 font-medium' : ''
                          }`}
                        >
                          {city}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* State Filter Button */}
                <div className="relative" ref={stateFilterRef}>
                  <button
                    onClick={() => setShowStateFilter(!showStateFilter)}
                    className={`h-8 px-3 text-xs font-medium rounded-lg transition flex items-center gap-1 ${
                      filterState 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    <FaMapMarkerAlt className="text-xs" /> State {filterState && `: ${filterState}`}
                  </button>
                  
                  {showStateFilter && (
                    <div className="absolute z-50 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      <div 
                        onClick={() => {
                          setFilterState('');
                          setShowStateFilter(false);
                        }}
                        className="px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer border-b border-gray-200 font-medium text-gray-700"
                      >
                        All States
                      </div>
                      {uniqueStates.map(state => (
                        <div 
                          key={state}
                          onClick={() => {
                            setFilterState(state);
                            setShowStateFilter(false);
                          }}
                          className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer ${
                            filterState === state ? 'bg-blue-50 text-blue-700 font-medium' : ''
                          }`}
                        >
                          {state}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pin Code Search */}
                <div className="relative w-[120px]">
                  <input
                    type="text"
                    placeholder="Pin Code"
                    value={filterPinCode}
                    onChange={(e) => setFilterPinCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    maxLength="6"
                  />
                </div>

                {/* Add Location Button */}
                <button
                  onClick={() => {
                    const isEmployee = window.location.pathname.startsWith("/emp-");
                    navigate(isEmployee ? "/emp-add-location" : "/addlocation");
                  }}
                  className="h-8 px-3 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition flex items-center gap-1"
                >
                  📍 Add Location
                </button>

                {/* Clear Filters Button */}
                {(searchTerm || filterCity || filterState || filterPinCode) && (
                  <button
                    onClick={clearFilters}
                    className="h-8 px-3 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Active filter chips */}
              {(searchTerm || filterCity || filterState || filterPinCode) && (
                <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                  <span className="text-[10px] text-gray-500 font-medium">Active Filters:</span>
                  {searchTerm && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-[9px] font-semibold border border-gray-200">
                      "{searchTerm}"
                    </span>
                  )}
                  {filterCity && (
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[9px] font-semibold border border-blue-200">
                      City: {filterCity}
                    </span>
                  )}
                  {filterState && (
                    <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full text-[9px] font-semibold border border-purple-200">
                      State: {filterState}
                    </span>
                  )}
                  {filterPinCode && (
                    <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-[9px] font-semibold border border-green-200">
                      Pin: {filterPinCode}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* GAP BETWEEN FILTER CARD AND TABLE */}
        <div className="mt-6"></div>

        {/* Loading / Error */}
        {loading && (
          <div className="flex items-center justify-center py-10">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 border-b-2 border-blue-600 rounded-full animate-spin"></div>
              <p className="text-xs font-semibold text-gray-500">Loading locations...</p>
            </div>
          </div>
        )}
        {errorMessage && (
          <div className="p-4 mb-4 text-red-700 bg-red-100 border border-red-200 rounded-lg">
            ❌ {errorMessage}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredLocations.length === 0 && (
          <div className="p-8 text-center bg-white rounded-lg shadow-md">
            <p className="text-lg text-gray-500">No locations found</p>
            <p className="mt-2 text-sm text-gray-500">
              {(searchTerm || filterCity || filterState || filterPinCode) && "Try clearing filters"}
            </p>
          </div>
        )}

        {/* Table Card */}
        {!loading && filteredLocations.length > 0 && (
          <div className="emp-dash__card">
            <div className="overflow-x-auto">
              <table className="emp-dash__table min-w-[1100px]">
                <thead>
                  <tr>
                    <th className="text-center whitespace-nowrap">S.No</th>
                    <th className="text-center whitespace-nowrap">Location Name</th>
                    <th className="text-center whitespace-nowrap">Full Address</th>
                    <th className="text-center whitespace-nowrap">City</th>
                    <th className="text-center whitespace-nowrap">State</th>
                    <th className="text-center whitespace-nowrap">Pin Code</th>
                    <th className="text-center whitespace-nowrap hidden md:table-cell">Latitude</th>
                    <th className="text-center whitespace-nowrap hidden md:table-cell">Longitude</th>
                    <th className="text-center whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {currentItems.map((loc, index) => {
                      const addressParts = loc.fullAddress.split(',');
                      const city = addressParts.length > 1 ? addressParts[addressParts.length - 2]?.trim() : '-';
                      const state = addressParts.length > 0 ? addressParts[addressParts.length - 1]?.trim() : '-';
                      const pinMatch = loc.fullAddress.match(/\b\d{6}\b/);
                      const pinCode = pinMatch ? pinMatch[0] : '-';

                      return (
                        <motion.tr
                          key={loc._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2, delay: index * 0.02 }}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="text-center font-medium text-gray-900 whitespace-nowrap">
                            {indexOfFirstItem + index + 1}
                          </td>
                          <td className="text-center font-medium text-gray-900 whitespace-nowrap">
                            {loc.name}
                          </td>
                          <td className="text-center text-gray-500 max-w-xs truncate">
                            {loc.fullAddress}
                          </td>
                          <td className="text-center text-gray-500 whitespace-nowrap">
                            {city}
                          </td>
                          <td className="text-center text-gray-500 whitespace-nowrap">
                            {state}
                          </td>
                          <td className="text-center text-gray-500 whitespace-nowrap">
                            {pinCode}
                          </td>
                          <td className="text-center text-gray-500 whitespace-nowrap hidden md:table-cell">
                            {loc.latitude}
                          </td>
                          <td className="text-center text-gray-500 whitespace-nowrap hidden md:table-cell">
                            {loc.longitude}
                          </td>
                          <td className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => openEditModal(loc)}
                                className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100"
                                title="Edit Location"
                              >
                                <FiEdit size={14} />
                              </button>
                              <button
                                onClick={() => handleToggleStatus(loc)}
                                className={`px-2 py-1 text-[10px] font-bold rounded uppercase transition ${
                                  loc.status === "inactive"
                                    ? "bg-gray-100 text-gray-500 hover:bg-blue-100 hover:text-green-700"
                                    : "bg-green-100 text-green-700 hover:bg-gray-200 hover:text-gray-700"
                                }`}
                                title={loc.status === "inactive" ? "Make Active" : "Make Inactive"}
                              >
                                {loc.status === "inactive" ? "Inactive" : "Active"}
                              </button>
                              <button
                                onClick={() => handleDelete(loc._id)}
                                className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
                                title="Delete Location"
                              >
                                <FiTrash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredLocations.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  <span>Showing</span>
                  <span className="font-semibold text-gray-900">
                    {filteredLocations.length > 0 ? indexOfFirstItem + 1 : 0}
                  </span>
                  <span>to</span>
                  <span className="font-semibold text-gray-900">
                    {Math.min(indexOfLastItem, filteredLocations.length)}
                  </span>
                  <span>of</span>
                  <span className="font-semibold text-gray-900">
                    {filteredLocations.length}
                  </span>
                  <span>records</span>

                  <select
                    value={pagination.limit}
                    onChange={(e) => {
                      const newLimit = Number(e.target.value);
                      handleItemsPerPageChange(newLimit);
                    }}
                    className="px-2 py-1 text-xs border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={pagination.currentPage === 1}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, index) => (
                      page === "..." ? (
                        <span key={index} className="px-2 text-gray-400 text-xs">...</span>
                      ) : (
                        <button
                          key={index}
                          onClick={() => handlePageClick(page)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            pagination.currentPage === page
                              ? "bg-blue-600 text-white"
                              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    ))}
                  </div>

                  <button
                    onClick={handleNextPage}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="w-full max-w-md p-6 bg-white border border-gray-200 shadow-2xl rounded-xl">
              <h3 className="mb-4 text-lg font-semibold text-blue-800">Edit Location</h3>
              <form onSubmit={handleUpdate}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Location Name</label>
                  <input
                    type="text"
                    value={updatedName}
                    onChange={(e) => setUpdatedName(e.target.value)}
                    className="w-full p-2 mt-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Full Address</label>
                  <textarea
                    value={updatedFullAddress}
                    onChange={(e) => setUpdatedFullAddress(e.target.value)}
                    className="w-full p-2 mt-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    rows="3"
                    required
                  ></textarea>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Latitude</label>
                  <input
                    type="text"
                    value={updatedLatitude}
                    onChange={(e) => setUpdatedLatitude(e.target.value)}
                    className="w-full p-2 mt-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700">Longitude</label>
                  <input
                    type="text"
                    value={updatedLongitude}
                    onChange={(e) => setUpdatedLongitude(e.target.value)}
                    className="w-full p-2 mt-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-md shadow-blue-200"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default LocationListPage;
