// import axios from "axios";
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// const EmployeeLocation = () => {
//   const navigate = useNavigate();
//   const [locationData, setLocationData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   // 🟦 Get employeeId from localStorage
//   const employeeDataRaw = localStorage.getItem("employeeData");
//   let employeeId = null;
//   if (employeeDataRaw) {
//     try {
//       const employeeData = JSON.parse(employeeDataRaw);
//       employeeId = employeeData.employeeId;
//     } catch (err) {
//       console.error("Invalid employee data in localStorage.");
//     }
//   }

//   // 🟩 Fetch Location from backend
//   useEffect(() => {
//     const fetchLocation = async () => {
//       if (!employeeId) {
//         setError("❌ Employee not logged in. Please login first.");
//         setLoading(false);
//         return;
//       }

//       try {
//         setLoading(true);
//         const res = await axios.get(
//           `https://api.timelyhealth.in/api/employees/mylocation/${employeeId}`
//         );

//         if (res.data && res.data.success && res.data.data) {
//           setLocationData(res.data.data);
//         } else {
//           setError("❌ No location assigned yet. Please contact admin.");
//         }
//       } catch (err) {
//         console.error("Error fetching location:", err);
//         setError("❌ Failed to fetch location. Please contact admin.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchLocation();
//   }, [employeeId]);

//   return (
//     <div className="flex min-h-screen bg-gray-100">
//       <div className="flex flex-col flex-1">
        

//         <main className="p-4 sm:p-6 lg:p-8">
//           <div className="max-w-5xl p-6 mx-auto bg-white rounded-lg shadow-md">
//             {/* Header + Back Button */}
//             <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:justify-between sm:items-center">
//               <h2 className="text-2xl font-bold text-blue-900">My Office Assigned Location</h2>
//               {/* <button
//                 onClick={() => navigate("/employeedashboard")}
//                 className="w-full px-5 py-2 font-medium text-gray-900 transition-all bg-blue-600 rounded-lg sm:w-auto hover:bg-blue-700"
//               >
//                 ← Back to Dashboard
//               </button> */}
//             </div>

//             {/* Loading & Error States */}
//             {loading ? (
//               <p className="text-gray-500">Loading your location...</p>
//             ) : error ? (
//               <p className="text-red-600">{error}</p>
//             ) : !locationData ? (
//               <p className="text-gray-500">
//                 No location assigned yet. Please contact admin.
//               </p>
//             ) : (
//               <>
//                 {/* Desktop Table */}
//                 <div className="hidden overflow-x-auto sm:block">
//                   <table className="w-full min-w-[500px] text-sm border">
//                     <thead className="text-gray-700 bg-gray-200">
//                       <tr>
//                         <th className="p-2 border">Employee Name</th>
//                         <th className="p-2 border">Employee ID</th>
//                         <th className="p-2 border">Location Name</th>
//                         <th className="p-2 border">Full Address</th>
//                         <th className="p-2 border">Latitude</th>
//                         <th className="p-2 border">Longitude</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       <tr className="border-b hover:bg-white">
//                         <td className="p-2 border">
//                           {locationData?.employee?.name || "N/A"}
//                         </td>
//                         <td className="p-2 border">
//                           {locationData?.employee?.employeeId || "N/A"}
//                         </td>
//                         <td className="p-2 border">
//                           {locationData?.location?.name || "N/A"}
//                         </td>
//                         <td className="p-2 text-sm border">
//                           {locationData?.location?.fullAddress || "N/A"}
//                         </td>
//                         <td className="p-2 border">
//                           {locationData?.location?.latitude ?? "N/A"}
//                         </td>
//                         <td className="p-2 border">
//                           {locationData?.location?.longitude ?? "N/A"}
//                         </td>
//                       </tr>
//                     </tbody>
//                   </table>
//                 </div>

//                 {/* Mobile View */}
//                 <div className="flex flex-col gap-4 sm:hidden">
//                   <div className="p-4 border rounded-lg shadow-sm bg-white">
//                     <div className="flex items-center justify-between mb-2">
//                       <span className="font-medium text-gray-700">
//                         Employee
//                       </span>
//                       <span className="text-gray-900">
//                         {locationData?.employee?.name || "N/A"}
//                       </span>
//                     </div>
//                     <div className="flex items-center justify-between mb-2">
//                       <span className="font-medium text-gray-700">
//                         Employee ID
//                       </span>
//                       <span className="text-gray-900">
//                         {locationData?.employee?.employeeId || "N/A"}
//                       </span>
//                     </div>
//                     <div className="flex items-center justify-between mb-2">
//                       <span className="font-medium text-gray-700">
//                         Location
//                       </span>
//                       <span className="text-gray-900">
//                         {locationData?.location?.name || "N/A"}
//                       </span>
//                     </div>
//                     <div className="mb-2">
//                       <span className="font-medium text-gray-700">
//                         Address:
//                       </span>
//                       <p className="mt-1 text-sm text-gray-900">
//                         {locationData?.location?.fullAddress || "N/A"}
//                       </p>
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <span className="font-medium text-gray-700">
//                         Coordinates
//                       </span>
//                       <span className="text-xs text-gray-900">
//                         {locationData?.location?.latitude ?? "N/A"},{" "}
//                         {locationData?.location?.longitude ?? "N/A"}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </>
//             )}
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default Employe
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import { FiMapPin, FiUser, FiNavigation } from "react-icons/fi";
import { API_BASE_URL } from "../config";
import "./EmployeeDashboard.css";
import "./EmployeeLeaves.css";

const EmployeeLocation = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get employee data from localStorage
  const employeeDataRaw = localStorage.getItem("employeeData");
  let employeeId = null;
  let employeeName = "N/A";
  if (employeeDataRaw) {
    try {
      const employeeData = JSON.parse(employeeDataRaw);
      employeeId = employeeData.employeeId;
      employeeName = employeeData.name || employeeData.employeeName || "N/A";
    } catch (err) {
      console.error("Invalid employee data in localStorage.");
    }
  }

  // Fetch locations data
  useEffect(() => {
    const fetchLocations = async () => {
      if (!employeeId) {
        setError("❌ Employee not logged in. Please login first.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await axios.get(
          `${API_BASE_URL}/employees/mylocation/${employeeId}`
        );

        // API returns: { success: true, data: { location: {...} } }
        if (res.data && res.data.success && res.data.data) {
          const rawData = res.data.data;
          // Normalize: could be array or single object with { location }
          const dataArray = Array.isArray(rawData) ? rawData : [rawData];
          setLocations(dataArray);
        } else {
          setError("❌ No locations assigned yet. Please contact admin.");
        }
      } catch (err) {
        console.error("Error fetching locations:", err);
        setError("❌ Failed to fetch locations. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, [employeeId]);

  const summary = useMemo(() => {
    const first = locations?.[0]?.location || locations?.[0] || null;
    return {
      total: locations.length,
      primaryName: first?.name || "Not Assigned",
      coords:
        first && (first.latitude || first.longitude)
          ? `${first.latitude ?? "—"}, ${first.longitude ?? "—"}`
          : "—",
    };
  }, [locations]);

  if (loading) {
    return (
      <div className="emp-dash">
        <div className="emp-dash__loading">
          <div className="emp-dash__spinner" />
          <p className="emp-dash__loading-text">Loading your location...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="emp-dash">
        <main style={{ display: "grid", placeItems: "center", minHeight: "60vh", padding: "1rem" }}>
          <div className="emp-dash__card" style={{ maxWidth: 520, width: "100%" }}>
            <div className="emp-dash__card-header">
              <div>
                <h3 className="emp-dash__card-title">Couldn’t load location</h3>
                <p className="emp-dash__card-desc">{error}</p>
              </div>
              <button type="button" className="emp-dash__card-link" onClick={() => window.location.reload()}>
                Retry
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="emp-dash">
      <main>
        <div className="emp-dash__header">
          <div>
            <h1 className="emp-dash__greeting">
              My <span>Location</span>
            </h1>
            <p className="emp-dash__subtitle">View your office assigned location details.</p>
          </div>
          <div className="emp-dash__date-pill">
            <FaCalendarAlt />
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

        <div className="emp-dash__stats">
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Employee</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <FiUser />
              </div>
            </div>
            <div className="emp-dash__stat-value" style={{ fontSize: "1.1rem" }}>
              {employeeName}
            </div>
            <div className="emp-dash__stat-meta">{employeeId || "—"}</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Locations</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FiMapPin />
              </div>
            </div>
            <div className="emp-dash__stat-value">{summary.total}</div>
            <div className="emp-dash__stat-meta">assigned</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Primary</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                <FiMapPin />
              </div>
            </div>
            <div className="emp-dash__stat-value" style={{ fontSize: "1.1rem" }}>
              {summary.primaryName}
            </div>
            <div className="emp-dash__stat-meta">location name</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Coordinates</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                <FiNavigation />
              </div>
            </div>
            <div className="emp-dash__stat-value" style={{ fontSize: "1.1rem" }}>
              {summary.coords}
            </div>
            <div className="emp-dash__stat-meta">lat, long</div>
          </div>
        </div>

        <div className="emp-dash__card">
          <div className="emp-dash__card-header">
            <div>
              <h3 className="emp-dash__card-title">Assigned Locations</h3>
              {/* <p className="emp-dash__card-desc">Office location details including address and coordinates</p> */}
            </div>
          </div>

          {locations.length === 0 ? (
            <div className="emp-dash__card-body" style={{ textAlign: "center" }}>
              <p style={{ color: "var(--ed-text-muted)", margin: 0 }}>No location assigned yet. Please contact admin.</p>
            </div>
          ) : (
            <>
              <div className="emp-dash__table-wrap">
                <table className="emp-dash__table">
                  <thead>
                    <tr>
                      <th>Location</th>
                      <th>Full Address</th>
                      <th>Latitude</th>
                      <th style={{ textAlign: "right" }}>Longitude</th>
                    </tr>
                  </thead>
                  <tbody>
                    {locations.map((item, index) => {
                      const loc = item?.location || item;
                      return (
                        <tr key={loc?._id || index}>
                          <td style={{ fontWeight: 700 }}>{loc?.name || "—"}</td>
                          <td title={loc?.fullAddress || ""} style={{ maxWidth: 360, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {loc?.fullAddress || "—"}
                          </td>
                          <td>{loc?.latitude ?? "—"}</td>
                          <td style={{ textAlign: "right" }}>{loc?.longitude ?? "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="emp-dash__mobile-list">
                {locations.map((item, index) => {
                  const loc = item?.location || item;
                  return (
                    <div key={loc?._id || index} className="emp-dash__mobile-item">
                      <div className="emp-dash__mobile-item-top">
                        <span className="emp-dash__mobile-date">{loc?.name || "Location"}</span>
                        <span className="emp-dash__table-status emp-dash__table-status--present">Assigned</span>
                      </div>
                      <div className="emp-dash__mobile-grid">
                        <div className="emp-dash__mobile-field">
                          <span>Address</span>
                          <span style={{ textAlign: "right" }}>{loc?.fullAddress || "—"}</span>
                        </div>
                        <div className="emp-dash__mobile-field">
                          <span>Latitude</span>
                          <span>{loc?.latitude ?? "—"}</span>
                        </div>
                        <div className="emp-dash__mobile-field">
                          <span>Longitude</span>
                          <span>{loc?.longitude ?? "—"}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default EmployeeLocation;
