// // src/pages/AttendanceCapture.jsx
// import { useEffect, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import EmployeeSidebar from "../Components/EmployeeSidebar";
// import Navbar from "../Components/Navbar";

// const OFFICE_COORDS = { lat: 17.4458661, lng: 78.3849383 };
// const ONSITE_RADIUS_M = 50;
// const BASE_URL = "https://attendancebackend-5cgn.onrender.com";

// // Haversine formula
// function haversineDistance(lat1, lon1, lat2, lon2) {
//   const R = 6371000;
//   const toRad = (deg) => (deg * Math.PI) / 180;
//   const dLat = toRad(lat2 - lat1);
//   const dLon = toRad(lon2 - lon1);
//   const a =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos(toRad(lat1)) *
//       Math.cos(toRad(lat2)) *
//       Math.sin(dLon / 2) ** 2;
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return R * c;
// }

// export default function AttendanceCapture() {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const [position, setPosition] = useState(null);
//   const [distance, setDistance] = useState(null);
//   const [locStatus, setLocStatus] = useState("idle");
//   const [submitting, setSubmitting] = useState(false);
//   const [checkedIn, setCheckedIn] = useState(false);
//   const [employeeId, setEmployeeId] = useState(null);
//   const [email, setEmail] = useState(null);

//   const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
//   const storageKey = `attendance_${employeeId}_${today}`;

//   // Load employee data
//   useEffect(() => {
//     const stateId = location.state?.employeeId;
//     const stateEmail = location.state?.email;

//     if (stateId && stateEmail) {
//       setEmployeeId(stateId);
//       setEmail(stateEmail);
//       localStorage.setItem(
//         "employeeData",
//         JSON.stringify({ employeeId: stateId, email: stateEmail })
//       );
//     } else {
//       const stored = JSON.parse(localStorage.getItem("employeeData"));
//       if (stored) {
//         setEmployeeId(stored.employeeId);
//         setEmail(stored.email);
//       }
//     }
//   }, [location.state]);

//   // Restore today's attendance status from backend first
//   useEffect(() => {
//     const fetchTodayStatus = async () => {
//       if (!employeeId) return;

//       try {
//         const res = await fetch(`${BASE_URL}/api/attendance/myattendance/${employeeId}`);
//         const data = await res.json();
//         if (!res.ok) throw new Error(data.message || "Failed to fetch status");

//         // Filter today's record
//         const todayRecord = data.records.find((rec) => {
//           const recDate = new Date(rec.checkInTime).toLocaleDateString("en-CA");
//           return recDate === today;
//         });

//         if (todayRecord) {
//           // Update UI based on status
//           if (todayRecord.status === "checked-in") {
//             setCheckedIn(true); // show Check-Out
//             localStorage.setItem(storageKey, JSON.stringify({ checkedIn: true, checkedOut: false }));
//           } else if (todayRecord.status === "checked-out") {
//             setCheckedIn(false); // show Check-In
//             localStorage.setItem(storageKey, JSON.stringify({ checkedIn: true, checkedOut: true }));
//           }
//         } else {
//           // No record today
//           setCheckedIn(false);
//           localStorage.removeItem(storageKey);
//         }
//       } catch (err) {
//         console.error("Error fetching today's attendance:", err.message);
//       }
//     };

//     fetchTodayStatus();
//   }, [employeeId, storageKey, today]);

//   // Fetch geolocation
//   const fetchLocation = () => {
//     if (!navigator.geolocation) return alert("Geolocation not supported!");
//     setLocStatus("fetching");

//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
//         setPosition(coords);
//         const d = haversineDistance(
//           coords.lat,
//           coords.lng,
//           OFFICE_COORDS.lat,
//           OFFICE_COORDS.lng
//         );
//         setDistance(Math.round(d));
//         setLocStatus("success");
//       },
//       (err) => {
//         setLocStatus("error");
//         alert("Location error: " + err.message);
//       },
//       { enableHighAccuracy: true, timeout: 10000 }
//     );
//   };

//   // Check-In
//   const handleCheckIn = async () => {
//     if (!position) return alert("Fetch your location first!");
//     if (!employeeId) return alert("Employee ID missing!");

//     const payload = { employeeId, employeeEmail: email, latitude: position.lat, longitude: position.lng };

//     try {
//       setSubmitting(true);
//       const res = await fetch(`${BASE_URL}/api/attendance/checkin`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Check-In failed");

//       alert(
//         `✅ Check-In Successful! ${
//           distance <= ONSITE_RADIUS_M ? "(Onsite)" : "(Offsite)"
//         }`
//       );

//       setCheckedIn(true); // show Check-Out
//       localStorage.setItem(storageKey, JSON.stringify({ checkedIn: true, checkedOut: false }));
//     } catch (err) {
//       alert("❌ " + err.message);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // Check-Out
//   const handleCheckOut = async () => {
//     if (!position) return alert("Fetch your location first!");
//     if (!employeeId) return alert("Employee ID missing!");

//     const payload = { employeeId, employeeEmail: email, latitude: position.lat, longitude: position.lng };

//     try {
//       setSubmitting(true);
//       const res = await fetch(`${BASE_URL}/api/attendance/checkout`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Check-Out failed");

//       alert(
//         `✅ Check-Out Successful! ${
//           distance <= ONSITE_RADIUS_M ? "(Onsite)" : "(Offsite)"
//         }`
//       );

//       setCheckedIn(false); // show Check-In
//       localStorage.setItem(storageKey, JSON.stringify({ checkedIn: true, checkedOut: true }));
//     } catch (err) {
//       alert("❌ " + err.message);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="flex flex-col sm:flex-row min-h-screen bg-gray-100">
//       {/* Sidebar hidden on small screens */}
//       <div className="hidden sm:block">
//         <EmployeeSidebar />
//       </div>

//       <div className="flex flex-col flex-1">
//         <Navbar />

//         <div className="flex flex-col flex-1 p-4 sm:p-6 items-center justify-center">
//           <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-6 sm:p-8 text-center">
//             <h2 className="mb-6 text-2xl sm:text-3xl font-semibold text-gray-800">
//               Attendance Capture
//             </h2>

//             {/* ✅ Back Button */}
//             <button
//               onClick={() => navigate("/employeedashboard")}
//               className="mb-5 w-full sm:w-auto px-5 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all"
//             >
//               ← Back to Dashboard
//             </button>

//             <div className="p-4 mb-6 bg-gray-50 rounded-lg shadow-sm">
//               <h3 className="mb-2 text-lg font-medium text-gray-700">Your Location</h3>
//               <button
//                 onClick={fetchLocation}
//                 className="w-full sm:w-auto px-5 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
//                 disabled={locStatus === "fetching"}
//               >
//                 {locStatus === "fetching" ? "Fetching..." : "Get Current Location"}
//               </button>

//               {position && (
//                 <div className="mt-3 text-gray-700 text-sm sm:text-base">
//                   <p>Lat: {position.lat.toFixed(6)}</p>
//                   <p>Lng: {position.lng.toFixed(6)}</p>
//                   <p>
//                     Distance:{" "}
//                     <strong>
//                       {distance} m (
//                       {distance <= ONSITE_RADIUS_M ? (
//                         <span className="text-green-600">Onsite</span>
//                       ) : (
//                         <span className="text-red-600">Outside</span>
//                       )}
//                       )
//                     </strong>
//                   </p>
//                 </div>
//               )}
//             </div>

//             {!checkedIn ? (
//               <button
//                 onClick={handleCheckIn}
//                 disabled={submitting}
//                 className="w-full py-3 text-lg font-semibold text-white bg-green-700 rounded-lg hover:bg-green-800"
//               >
//                 {submitting ? "Checking In..." : "Check In"}
//               </button>
//             ) : (
//               <button
//                 onClick={handleCheckOut}
//                 disabled={submitting}
//                 className="w-full py-3 text-lg font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700"
//               >
//                 {submitting ? "Checking Out..." : "Check Out"}
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// src/pages/AttendanceCapture.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import EmployeeSidebar from "../Components/EmployeeSidebar";
import Navbar from "../Components/Navbar";

const OFFICE_COORDS = { lat: 17.445860, lng: 78.387154 };
const ONSITE_RADIUS_M = 700;
const BASE_URL = "https://attendancebackend-5cgn.onrender.com";

// ✅ Accurate Haversine Formula
function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Radius of Earth in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // in meters
  return distance;
}

export default function AttendanceCapture() {
  const location = useLocation();
  const navigate = useNavigate();
  const [position, setPosition] = useState(null);
  const [distance, setDistance] = useState(null);
  const [locStatus, setLocStatus] = useState("idle");
  const [submitting, setSubmitting] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [employeeId, setEmployeeId] = useState(null);
  const [email, setEmail] = useState(null);

  const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
  const storageKey = `attendance_${employeeId}_${today}`;

  // Load employee data
  useEffect(() => {
    const stateId = location.state?.employeeId;
    const stateEmail = location.state?.email;

    if (stateId && stateEmail) {
      setEmployeeId(stateId);
      setEmail(stateEmail);
      localStorage.setItem(
        "employeeData",
        JSON.stringify({ employeeId: stateId, email: stateEmail })
      );
    } else {
      const stored = JSON.parse(localStorage.getItem("employeeData"));
      if (stored) {
        setEmployeeId(stored.employeeId);
        setEmail(stored.email);
      }
    }
  }, [location.state]);

  // Restore today's attendance status
  useEffect(() => {
    const fetchTodayStatus = async () => {
      if (!employeeId) return;

      try {
        const res = await fetch(`${BASE_URL}/api/attendance/myattendance/${employeeId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch status");

        const todayRecord = data.records.find((rec) => {
          const recDate = new Date(rec.checkInTime).toLocaleDateString("en-CA");
          return recDate === today;
        });

        if (todayRecord) {
          if (todayRecord.status === "checked-in") {
            setCheckedIn(true);
            localStorage.setItem(storageKey, JSON.stringify({ checkedIn: true, checkedOut: false }));
          } else if (todayRecord.status === "checked-out") {
            setCheckedIn(false);
            localStorage.setItem(storageKey, JSON.stringify({ checkedIn: true, checkedOut: true }));
          }
        } else {
          setCheckedIn(false);
          localStorage.removeItem(storageKey);
        }
      } catch (err) {
        console.error("Error fetching today's attendance:", err.message);
      }
    };

    fetchTodayStatus();
  }, [employeeId, storageKey, today]);

  // ✅ Fetch Geolocation
  const fetchLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported!");
    setLocStatus("fetching");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(coords);

        // ✅ Use accurate function
        const d = getDistanceFromLatLonInMeters(
          coords.lat,
          coords.lng,
          OFFICE_COORDS.lat,
          OFFICE_COORDS.lng
        );
        setDistance(Math.round(d));
        setLocStatus("success");
      },
      (err) => {
        setLocStatus("error");
        alert("Location error: " + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // ✅ Check-In (Auto Onsite / Offsite)
  const handleCheckIn = async () => {
    if (!position) return alert("Please fetch your location first!");
    if (!employeeId) return alert("Employee ID missing!");

    const statusType = distance <= ONSITE_RADIUS_M ? "Onsite" : "Offsite";

    const payload = {
      employeeId,
      employeeEmail: email,
      latitude: position.lat,
      longitude: position.lng,
      locationType: statusType, // ✅ store onsite/offsite
    };

    try {
      setSubmitting(true);
      const res = await fetch(`${BASE_URL}/api/attendance/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Check-In failed");

      alert(`✅ Check-In Successful! (${statusType})`);
      setCheckedIn(true);
      localStorage.setItem(storageKey, JSON.stringify({ checkedIn: true, checkedOut: false }));
    } catch (err) {
      alert("❌ " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Check-Out (Auto Onsite / Offsite)
  const handleCheckOut = async () => {
    if (!position) return alert("Please fetch your location first!");
    if (!employeeId) return alert("Employee ID missing!");

    const statusType = distance <= ONSITE_RADIUS_M ? "Onsite" : "Offsite";

    const payload = {
      employeeId,
      employeeEmail: email,
      latitude: position.lat,
      longitude: position.lng,
      locationType: statusType, // ✅ store onsite/offsite
    };

    try {
      setSubmitting(true);
      const res = await fetch(`${BASE_URL}/api/attendance/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Check-Out failed");

      alert(`✅ Check-Out Successful! (${statusType})`);
      setCheckedIn(false);
      localStorage.setItem(storageKey, JSON.stringify({ checkedIn: true, checkedOut: true }));
    } catch (err) {
      alert("❌ " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden sm:block">
        <EmployeeSidebar />
      </div>

      <div className="flex flex-col flex-1">
        <Navbar />

        <div className="flex flex-col flex-1 p-4 sm:p-6 items-center justify-center">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-6 sm:p-8 text-center">
            <h2 className="mb-6 text-2xl sm:text-3xl font-semibold text-gray-800">
              Attendance Capture
            </h2>

            {/* Back Button */}
            <button
              onClick={() => navigate("/employeedashboard")}
              className="mb-5 w-full sm:w-auto px-5 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all"
            >
              ← Back to Dashboard
            </button>

            <div className="p-4 mb-6 bg-gray-50 rounded-lg shadow-sm">
              <h3 className="mb-2 text-lg font-medium text-gray-700">Your Location</h3>
              <button
                onClick={fetchLocation}
                className="w-full sm:w-auto px-5 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
                disabled={locStatus === "fetching"}
              >
                {locStatus === "fetching" ? "Fetching..." : "Get Current Location"}
              </button>

              {position && (
                <div className="mt-3 text-gray-700 text-sm sm:text-base">
                  <p>Lat: {position.lat.toFixed(6)}</p>
                  <p>Lng: {position.lng.toFixed(6)}</p>
                  <p>
                    Distance:{" "}
                    <strong>
                      {distance} m (
                      {distance <= ONSITE_RADIUS_M ? (
                        <span className="text-green-600">Onsite</span>
                      ) : (
                        <span className="text-red-600">Offsite</span>
                      )}
                      )
                    </strong>
                  </p>
                </div>
              )}
            </div>

            {!checkedIn ? (
              <button
                onClick={handleCheckIn}
                disabled={submitting}
                className="w-full py-3 text-lg font-semibold text-white bg-green-700 rounded-lg hover:bg-green-800"
              >
                {submitting ? "Checking In..." : "Check In"}
              </button>
            ) : (
              <button
                onClick={handleCheckOut}
                disabled={submitting}
                className="w-full py-3 text-lg font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                {submitting ? "Checking Out..." : "Check Out"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
