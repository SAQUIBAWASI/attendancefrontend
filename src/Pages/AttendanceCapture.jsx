

// src/pages/AttendanceCapture.jsx
// import { useEffect, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import EmployeeSidebar from "../Components/EmployeeSidebar";
// import Navbar from "../Components/Navbar";

// const OFFICE_COORDS = { lat: 17.445860, lng: 78.387154 };
// const ONSITE_RADIUS_M = 600;
// const BASE_URL = "https://api.timelyhealth.in/";

// // ✅ Accurate Haversine Formula
// function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
//   const R = 6371e3; // Radius of Earth in meters
//   const φ1 = (lat1 * Math.PI) / 180;
//   const φ2 = (lat2 * Math.PI) / 180;
//   const Δφ = ((lat2 - lat1) * Math.PI) / 180;
//   const Δλ = ((lon2 - lon1) * Math.PI) / 180;

//   const a =
//     Math.sin(Δφ / 2) ** 2 +
//     Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

//   const distance = R * c; // in meters
//   return distance;
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

//   // Restore today's attendance status
//   useEffect(() => {
//     const fetchTodayStatus = async () => {
//       if (!employeeId) return;

//       try {
//         const res = await fetch(`${BASE_URL}/api/attendance/myattendance/${employeeId}`);
//         const data = await res.json();
//         if (!res.ok) throw new Error(data.message || "Failed to fetch status");

//         const todayRecord = data.records.find((rec) => {
//           const recDate = new Date(rec.checkInTime).toLocaleDateString("en-CA");
//           return recDate === today;
//         });

//         if (todayRecord) {
//           if (todayRecord.status === "checked-in") {
//             setCheckedIn(true);
//             localStorage.setItem(storageKey, JSON.stringify({ checkedIn: true, checkedOut: false }));
//           } else if (todayRecord.status === "checked-out") {
//             setCheckedIn(false);
//             localStorage.setItem(storageKey, JSON.stringify({ checkedIn: true, checkedOut: true }));
//           }
//         } else {
//           setCheckedIn(false);
//           localStorage.removeItem(storageKey);
//         }
//       } catch (err) {
//         console.error("Error fetching today's attendance:", err.message);
//       }
//     };

//     fetchTodayStatus();
//     fetchTodayStatus();
//   }, [employeeId, storageKey, today]);
// 
// // ✅ Fetch Active Permissions
// // useEffect(() => {
// //   const fetchPermissions = async () => {
// //     if (!employeeId) return;
// //     try {
// //       const res = await fetch(`${BASE_URL}/api/permissions/my-permissions/${employeeId}`);
// //       const data = await res.json();
// //       if (res.ok) {
// //         // Find if there is any APPROVED permission that is NOT COMPLETED
// //         const active = data.find(p => p.status === "APPROVED");
// //         setActivePermission(active);
// //       }
// //     } catch (err) {
// //       console.error("Error fetching permissions:", err);
// //     }
// //   };
// //   fetchPermissions();
// // }, [employeeId]);

//   // ✅ Fetch Geolocation
//   const fetchLocation = () => {
//     if (!navigator.geolocation) return alert("Geolocation not supported!");
//     setLocStatus("fetching");

//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
//         setPosition(coords);

//         // ✅ Use accurate function
//         const d = getDistanceFromLatLonInMeters(
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
//       { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
//     );
//   };

//   // ✅ Check-In (Auto Onsite / Offsite)
//   const handleCheckIn = async () => {
//     if (!position) return alert("Please fetch your location first!");
//     if (!employeeId) return alert("Employee ID missing!");

//     const statusType = distance <= ONSITE_RADIUS_M ? "Onsite" : "Offsite";

//     const payload = {
//       employeeId,
//       employeeEmail: email,
//       latitude: position.lat,
//       longitude: position.lng,
//       locationType: statusType, // ✅ store onsite/offsite
//     };

//     try {
//       setSubmitting(true);
//       const res = await fetch(`${BASE_URL}/api/attendance/checkin`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Check-In failed");

//       alert(`✅ Check-In Successful! (${statusType})`);
//       setCheckedIn(true);
//       localStorage.setItem(storageKey, JSON.stringify({ checkedIn: true, checkedOut: false }));
//     } catch (err) {
//       alert("❌ " + err.message);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // ✅ Check-Out (Auto Onsite / Offsite)
//   const handleCheckOut = async () => {
//     if (!position) return alert("Please fetch your location first!");
//     if (!employeeId) return alert("Employee ID missing!");

//     const statusType = distance <= ONSITE_RADIUS_M ? "Onsite" : "Offsite";

//     const payload = {
//       employeeId,
//       employeeEmail: email,
//       latitude: position.lat,
//       longitude: position.lng,
//       locationType: statusType, // ✅ store onsite/offsite
//     };

//     try {
//       setSubmitting(true);
//       const res = await fetch(`${BASE_URL}/api/attendance/checkout`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Check-Out failed");

//       alert(`✅ Check-Out Successful! (${statusType})`);
//       setCheckedIn(false);
//       localStorage.setItem(storageKey, JSON.stringify({ checkedIn: true, checkedOut: true }));
//     } catch (err) {
//       alert("❌ " + err.message);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="flex flex-col min-h-screen bg-gray-100 sm:flex-row">
//       {/* Sidebar */}
//       <div className="hidden sm:block">
//         <EmployeeSidebar />
//       </div>

//       <div className="flex flex-col flex-1">
//         <Navbar />

//         <div className="flex flex-col items-center justify-center flex-1 p-4 sm:p-6">
//           <div className="w-full max-w-lg p-6 text-center bg-white shadow-lg rounded-2xl sm:p-8">
//             <h2 className="mb-6 text-2xl font-semibold text-gray-700 sm:text-3xl">
//               Attendance Capture
//             </h2>

//             {/* Back Button */}
//             <button
//               onClick={() => navigate("/employeedashboard")}
//               className="w-full px-5 py-2 mb-5 text-gray-900 transition-all bg-blue-600 rounded-lg sm:w-auto hover:bg-blue-700"
//             >
//               ← Back to Dashboard
//             </button>

//             <div className="p-4 mb-6 rounded-lg shadow-sm bg-white">
//               <h3 className="mb-2 text-lg font-medium text-gray-700">Your Location</h3>
//               <button
//                 onClick={fetchLocation}
//                 className="w-full px-5 py-2 text-gray-900 bg-blue-600 rounded-lg sm:w-auto hover:bg-blue-800"
//                 disabled={locStatus === "fetching"}
//               >
//                 {locStatus === "fetching" ? "Fetching..." : "Get Current Location"}
//               </button>

//               {position && (
//                 <div className="mt-3 text-sm text-gray-700 sm:text-base">
//                   <p>Lat: {position.lat.toFixed(6)}</p>
//                   <p>Lng: {position.lng.toFixed(6)}</p>
//                   <p>
//                     Distance:{" "}
//                     <strong>
//                       {distance} m (
//                       {distance <= ONSITE_RADIUS_M ? (
//                         <span className="text-blue-700">Onsite</span>
//                       ) : (
//                         <span className="text-red-600">Offsite</span>
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
//                 className="w-full py-3 text-lg font-semibold text-gray-900 bg-blue-800 rounded-lg hover:bg-green-800"
//               >
//                 {submitting ? "Checking In..." : "Check In"}
//               </button>
//             ) : (
//               <button
//                 onClick={handleCheckOut}
//                 disabled={submitting}
//                 className="w-full py-3 text-lg font-semibold text-gray-900 bg-red-600 rounded-lg hover:bg-red-700"
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




// import { useEffect, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import EmployeeSidebar from "../Components/EmployeeSidebar";
// import Navbar from "../Components/Navbar";

// const OFFICE_COORDS = { lat: 17.4458661, lng: 78.3849383 };
// const ONSITE_RADIUS_M = 50;
// const BASE_URL = "https://api.timelyhealth.in/";

// // Haversine formula
// function haversineDistance(lat1, lon1, lat2, lon2) {
//   const R = 6371000; // meters
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

//   // Restore today's attendance status from backend
//   useEffect(() => {
//     const fetchTodayStatus = async () => {
//       if (!employeeId) return;
//       try {
//         const res = await fetch(
//           `${BASE_URL}/api/attendance/myattendance/${employeeId}`
//         );
//         const data = await res.json();
//         if (!res.ok) throw new Error(data.message || "Failed to fetch status");

//         // Filter today's record
//         const todayRecord = data.records.find((rec) => {
//           const recDate = new Date(rec.checkInTime).toLocaleDateString("en-CA");
//           return recDate === today;
//         });

//         if (todayRecord) {
//           if (todayRecord.status === "checked-in") {
//             setCheckedIn(true);
//             localStorage.setItem(
//               storageKey,
//               JSON.stringify({ checkedIn: true, checkedOut: false })
//             );
//           } else if (todayRecord.status === "checked-out") {
//             setCheckedIn(false);
//             localStorage.setItem(
//               storageKey,
//               JSON.stringify({ checkedIn: true, checkedOut: true })
//             );
//           }
//         } else {
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
//     if (!navigator.geolocation)
//       return alert("Geolocation not supported!");

//     setLocStatus("fetching");
//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         const coords = {
//           lat: pos.coords.latitude,
//           lng: pos.coords.longitude,
//         };
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

//     const payload = {
//       employeeId,
//       employeeEmail: email,
//       latitude: position.lat,
//       longitude: position.lng,
//     };

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
//       setCheckedIn(true);
//       localStorage.setItem(
//         storageKey,
//         JSON.stringify({ checkedIn: true, checkedOut: false })
//       );
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

//     const payload = {
//       employeeId,
//       employeeEmail: email,
//       latitude: position.lat,
//       longitude: position.lng,
//     };

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
//       setCheckedIn(false);
//       localStorage.setItem(
//         storageKey,
//         JSON.stringify({ checkedIn: true, checkedOut: true })
//       );
//     } catch (err) {
//       alert("❌ " + err.message);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="flex flex-col min-h-screen bg-gray-100 sm:flex-row">
//       {/* Sidebar hidden on small screens */}
//       <div className="hidden sm:block">
//         <EmployeeSidebar />
//       </div>

//       <div className="flex flex-col flex-1">
//         <Navbar />
//         <div className="flex flex-col items-center justify-center flex-1 p-4 sm:p-6">
//           <div className="w-full max-w-lg p-6 text-center bg-white shadow-lg rounded-2xl sm:p-8">
//             <h2 className="mb-6 text-2xl font-semibold text-gray-700 sm:text-3xl">
//               Attendance Capture
//             </h2>

//             {/* Back Button */}
//             <button
//               onClick={() => navigate("/employeedashboard")}
//               className="w-full px-5 py-2 mb-5 text-gray-900 transition-all bg-blue-600 rounded-lg sm:w-auto hover:bg-blue-700"
//             >
//               ← Back to Dashboard
//             </button>

//             <div className="p-4 mb-6 rounded-lg shadow-sm bg-white">
//               <h3 className="mb-2 text-lg font-medium text-gray-700">
//                 Your Location
//               </h3>

//               <button
//                 onClick={fetchLocation}
//                 className="w-full px-5 py-2 text-gray-900 bg-blue-600 rounded-lg sm:w-auto hover:bg-blue-800"
//                 disabled={locStatus === "fetching"}
//               >
//                 {locStatus === "fetching"
//                   ? "Fetching..."
//                   : "Get Current Location"}
//               </button>

//               {position && (
//                 <div className="mt-3 text-sm text-gray-700 sm:text-base">
//                   <p>Lat: {position.lat.toFixed(6)}</p>
//                   <p>Lng: {position.lng.toFixed(6)}</p>
//                   <p>
//                     Distance:{" "}
//                     <strong>
//                       {distance} m (
//                       {distance <= ONSITE_RADIUS_M ? (
//                         <span className="text-blue-700">Onsite</span>
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
//                 className="w-full py-3 text-lg font-semibold text-gray-900 bg-blue-800 rounded-lg hover:bg-green-800"
//               >
//                 {submitting ? "Checking In..." : "Check In"}
//               </button>
//             ) : (
//               <button
//                 onClick={handleCheckOut}
//                 disabled={submitting}
//                 className="w-full py-3 text-lg font-semibold text-gray-900 bg-red-600 rounded-lg hover:bg-red-700"
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
// import { useEffect, useState } from "react";
// import { useLocation } from "react-router-dom";
// import EmployeeSidebar from "../Components/EmployeeSidebar";
// import Navbar from "../Components/Navbar";

// const OFFICE_COORDS = { lat: 17.4458661, lng: 78.3849383 };
// const ONSITE_RADIUS_M = 50;
// const BASE_URL = "https://api.timelyhealth.in/";

// // Haversine formula for distance
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
//   const [position, setPosition] = useState(null);
//   const [distance, setDistance] = useState(null);
//   const [locStatus, setLocStatus] = useState("idle");
//   const [submitting, setSubmitting] = useState(false);
//   const [checkedIn, setCheckedIn] = useState(false);

//   // ✅ Read employee data from location.state or fallback to localStorage
//   const [employeeId, setEmployeeId] = useState(null);
//   const [email, setEmail] = useState(null);

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

//   // Restore check-in status
//   useEffect(() => {
//     const storedCheckIn = localStorage.getItem("checkedIn");
//     if (storedCheckIn === "true") setCheckedIn(true);
//   }, []);

//   // Fetch current geolocation
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

//   // ✅ Handle Check-In
//   const handleCheckIn = async () => {
//     if (!position) return alert("Fetch your location first!");
//     if (!employeeId) return alert("Employee ID missing!");

//     const payload = {
//       employeeId,
//       employeeEmail: email,
//       latitude: position.lat,
//       longitude: position.lng,
//     };

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
//           distance <= ONSITE_RADIUS_M ? "(Onsite)" : "(Outside office)"
//         }`
//       );
//       setCheckedIn(true);
//       localStorage.setItem("checkedIn", "true");
//     } catch (err) {
//       alert("❌ " + err.message);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // ✅ Handle Check-Out
//   const handleCheckOut = async () => {
//     if (!position) return alert("Fetch your location first!");
//     if (!employeeId) return alert("Employee ID missing!");

//     const payload = {
//       employeeId,
//       employeeEmail: email,
//       latitude: position.lat,
//       longitude: position.lng,
//     };

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
//           distance <= ONSITE_RADIUS_M ? "(Onsite)" : "(Outside office)"
//         }`
//       );
//       setCheckedIn(false);
//       localStorage.removeItem("checkedIn");
//     } catch (err) {
//       alert("❌ " + err.message);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="flex min-h-screen bg-gray-100">
//       {/* Sidebar */}
//       <EmployeeSidebar />

//       {/* Main Content */}
//       <div className="flex flex-col flex-1">
//         {/* Navbar */}
//         <Navbar />

//         {/* Attendance Content */}
//         <div className="max-w-lg p-6 mx-auto text-center">
//           <h2 className="mb-6 text-2xl font-semibold">Attendance Capture</h2>

//           <div className="p-4 mb-6 bg-white rounded-lg shadow-md">
//             <h3 className="mb-2 text-lg font-medium">Your Location</h3>
//             <button
//               onClick={fetchLocation}
//               className="px-4 py-2 text-gray-900 bg-blue-600 rounded"
//               disabled={locStatus === "fetching"}
//             >
//               {locStatus === "fetching" ? "Fetching..." : "Get Current Location"}
//             </button>

//             {position && (
//               <div className="mt-3 text-gray-700">
//                 <p>Lat: {position.lat.toFixed(6)}</p>
//                 <p>Lng: {position.lng.toFixed(6)}</p>
//                 <p>
//                   Distance:{" "}
//                   <strong>
//                     {distance} m ({distance <= ONSITE_RADIUS_M ? "Onsite" : "Outside"})
//                   </strong>
//                 </p>
//               </div>
//             )}
//           </div>

//           {!checkedIn ? (
//             <button
//               onClick={handleCheckIn}
//               disabled={submitting}
//               className="w-full py-3 text-lg font-semibold text-gray-900 bg-blue-800 rounded-lg"
//             >
//               {submitting ? "Checking In..." : "Check In"}
//             </button>
//           ) : (
//             <button
//               onClick={handleCheckOut}
//               disabled={submitting}
//               className="w-full py-3 text-lg font-semibold text-gray-900 bg-red-600 rounded-lg"
//             >
//               {submitting ? "Checking Out..." : "Check Out"}
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// import { useEffect, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// const BASE_URL = "https://api.timelyhealth.in//api/attendance";
// const OFFICE_COORDS = { lat: 17.448294, lng: 78.391487 };
// const ONSITE_RADIUS_M = 600;

// // Haversine formula to calculate distance
// function haversineDistance(lat1, lon1, lat2, lon2) {
//   const R = 6371000; // meters
//   const toRad = (deg) => (deg * Math.PI) / 180;
//   const dLat = toRad(lat2 - lat1);
//   const dLon = toRad(lon2 - lon1);
//   const a =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos(toRad(lat1)) *
//       Math.cos(toRad(lat2)) *
//       Math.sin(dLon / 2) ** 2;
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return Math.round(R * c);
// }

// export default function AttendanceCapture() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [position, setPosition] = useState(null);
//   const [distance, setDistance] = useState(null);
//   const [checkedIn, setCheckedIn] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [employeeId, setEmployeeId] = useState(null);
//   const [employeeEmail, setEmployeeEmail] = useState(null);

//   // Load employee data
//   useEffect(() => {
//     const stateId = location.state?.employeeId;
//     const stateEmail = location.state?.email;

//     if (stateId && stateEmail) {
//       setEmployeeId(stateId);
//       setEmployeeEmail(stateEmail);
//       localStorage.setItem(
//         "employeeData",
//         JSON.stringify({ employeeId: stateId, email: stateEmail })
//       );
//     } else {
//       const stored = JSON.parse(localStorage.getItem("employeeData"));
//       if (stored) {
//         setEmployeeId(stored.employeeId);
//         setEmployeeEmail(stored.email);
//       }
//     }
//   }, [location.state]);

//   // Fetch today's attendance to determine initial checkedIn state
//   useEffect(() => {
//     const fetchTodayAttendance = async () => {
//       if (!employeeId) return;

//       try {
//         const res = await fetch(`${BASE_URL}/myattendance/${employeeId}`);
//         const data = await res.json();
//         if (!res.ok) throw new Error(data.message || "Failed to fetch");

//         const today = new Date();
//         today.setHours(0, 0, 0, 0);

//         // Check if there's a record with status 'checked-in' today
//         const todayCheckIn = data.records.find(
//           (rec) =>
//             new Date(rec.checkInTime) >= today &&
//             rec.status === "checked-in"
//         );

//         setCheckedIn(!!todayCheckIn);
//       } catch (err) {
//         console.error("Fetch today attendance error:", err);
//       }
//     };

//     fetchTodayAttendance();
//   }, [employeeId]);

//   const fetchLocation = () => {
//     if (!navigator.geolocation)
//       return alert("Geolocation is not supported by your browser");

//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
//         setPosition(coords);
//         setDistance(
//           haversineDistance(
//             coords.lat,
//             coords.lng,
//             OFFICE_COORDS.lat,
//             OFFICE_COORDS.lng
//           )
//         );
//       },
//       (err) => alert(err.message),
//       { enableHighAccuracy: true, timeout: 10000 }
//     );
//   };

//   const handleCheckIn = async () => {
//     if (!position) return alert("Get your location first");
//     if (!employeeId || !employeeEmail)
//       return alert("Employee data missing");

//     setSubmitting(true);
//     try {
//       const res = await fetch(`${BASE_URL}/checkin`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           employeeId,
//           employeeEmail,
//           latitude: position.lat,
//           longitude: position.lng,
//         }),
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message);

//       alert(data.message);
//       setCheckedIn(true);
//     } catch (err) {
//       alert(err.message);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleCheckOut = async () => {
//     if (!position) return alert("Get your location first");
//     if (!employeeId) return alert("Employee data missing");

//     setSubmitting(true);
//     try {
//       const res = await fetch(`${BASE_URL}/checkout`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           employeeId,
//           latitude: position.lat,
//           longitude: position.lng,
//         }),
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message);

//       alert(data.message);
//       setCheckedIn(false);
//     } catch (err) {
//       alert(err.message);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="flex flex-col items-center min-h-screen p-4 bg-gray-100">
//       <button
//         onClick={() => navigate("/employeedashboard")}
//         className="self-start mb-4 font-medium text-gray-700 hover:text-gray-900"
//       >
//         ← Back
//       </button>

//       <div className="flex flex-col w-full max-w-md gap-4 p-6 bg-white shadow-lg rounded-xl">
//         <h2 className="text-2xl font-semibold text-center">Attendance Capture</h2>

//         <div className="flex flex-col gap-3 p-4 rounded-md bg-white">
//           <button
//             onClick={fetchLocation}
//             className="px-4 py-2 text-gray-900 transition bg-blue-600 rounded hover:bg-blue-800"
//           >
//             Get Current Location
//           </button>

//           {position && (
//             <div className="text-gray-700">
//               <p>Lat: {position.lat.toFixed(6)}</p>
//               <p>Lng: {position.lng.toFixed(6)}</p>
//               <p>
//                 Distance: <strong>{distance} m</strong> (
//                 {distance <= ONSITE_RADIUS_M ? "Onsite" : "Outside"})
//               </p>
//             </div>
//           )}
//         </div>

//         {!checkedIn ? (
//           <button
//             onClick={handleCheckIn}
//             disabled={submitting || !position || !employeeId}
//             className="w-full py-3 text-lg font-semibold text-gray-900 transition bg-blue-600 rounded-lg hover:bg-blue-700"
//           >
//             {submitting ? "Checking In..." : "Check In"}
//           </button>
//         ) : (
//           <button
//             onClick={handleCheckOut}
//             disabled={submitting || !position || !employeeId}
//             className="w-full py-3 text-lg font-semibold text-gray-900 transition bg-red-600 rounded-lg hover:bg-red-700"
//           >
//             {submitting ? "Checking Out..." : "Check Out"}
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }

// import { useEffect, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";

// const BASE_URL = "https://api.timelyhealth.in//api/attendance";
// const OFFICE_COORDS = { lat: 17.448294, lng: 78.391487 };
// const ONSITE_RADIUS_M = 600;

// // Haversine formula to calculate distance
// function haversineDistance(lat1, lon1, lat2, lon2) {
//   const R = 6371000; // meters
//   const toRad = (deg) => (deg * Math.PI) / 180;
//   const dLat = toRad(lat2 - lat1);
//   const dLon = toRad(lon2 - lon1);
//   const a =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos(toRad(lat1)) *
//       Math.cos(toRad(lat2)) *
//       Math.sin(dLon / 2) ** 2;
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return Math.round(R * c);
// }

// export default function AttendanceCapture() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [position, setPosition] = useState(null);
//   const [distance, setDistance] = useState(null);
//   const [checkedIn, setCheckedIn] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [employeeId, setEmployeeId] = useState(null);
//   const [employeeEmail, setEmployeeEmail] = useState(null);

//   // Load employee data
//   useEffect(() => {
//     const stateId = location.state?.employeeId;
//     const stateEmail = location.state?.email;

//     if (stateId && stateEmail) {
//       setEmployeeId(stateId);
//       setEmployeeEmail(stateEmail);
//       localStorage.setItem(
//         "employeeData",
//         JSON.stringify({ employeeId: stateId, email: stateEmail })
//       );
//     } else {
//       const stored = JSON.parse(localStorage.getItem("employeeData"));
//       if (stored) {
//         setEmployeeId(stored.employeeId);
//         setEmployeeEmail(stored.email);
//       }
//     }
//   }, [location.state]);

//   // Fetch today's attendance to determine initial checkedIn state
//   useEffect(() => {
//     const fetchTodayAttendance = async () => {
//       if (!employeeId) return;

//       try {
//         const res = await fetch(`${BASE_URL}/myattendance/${employeeId}`);
//         const data = await res.json();
//         if (!res.ok) throw new Error(data.message || "Failed to fetch");

//         const today = new Date();
//         today.setHours(0, 0, 0, 0);

//         // Check if there's a record with status 'checked-in' today
//         const todayCheckIn = data.records.find(
//           (rec) =>
//             new Date(rec.checkInTime) >= today &&
//             rec.status === "checked-in"
//         );

//         setCheckedIn(!!todayCheckIn);
//       } catch (err) {
//         console.error("Fetch today attendance error:", err);
//       }
//     };

//     fetchTodayAttendance();
//   }, [employeeId]);

//   const fetchLocation = () => {
//     if (!navigator.geolocation)
//       return alert("Geolocation is not supported by your browser");

//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
//         setPosition(coords);
//         setDistance(
//           haversineDistance(
//             coords.lat,
//             coords.lng,
//             OFFICE_COORDS.lat,
//             OFFICE_COORDS.lng
//           )
//         );
//       },
//       (err) => alert(err.message),
//       { enableHighAccuracy: true, timeout: 10000 }
//     );
//   };

//   const handleCheckIn = async () => {
//     if (!position) return alert("Get your location first");
//     if (!employeeId || !employeeEmail)
//       return alert("Employee data missing");

//     setSubmitting(true);
//     try {
//       const res = await fetch(`${BASE_URL}/checkin`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           employeeId,
//           employeeEmail,
//           latitude: position.lat,
//           longitude: position.lng,
//         }),
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message);

//       alert(data.message);
//       setCheckedIn(true);
//     } catch (err) {
//       alert(err.message);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleCheckOut = async () => {
//     if (!position) return alert("Get your location first");
//     if (!employeeId) return alert("Employee data missing");

//     setSubmitting(true);
//     try {
//       const res = await fetch(`${BASE_URL}/checkout`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           employeeId,
//           latitude: position.lat,
//           longitude: position.lng,
//         }),
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message);

//       alert(data.message);
//       setCheckedIn(false);
//     } catch (err) {
//       alert(err.message);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="flex flex-col items-center min-h-screen p-4 bg-gray-100">
//       <button
//         onClick={() => navigate("/employeedashboard")}
//         className="self-start mb-4 font-medium text-gray-700 hover:text-gray-900"
//       >
//         ← Back
//       </button>

//       <div className="flex flex-col w-full max-w-md gap-4 p-6 bg-white shadow-lg rounded-xl">
//         <h2 className="text-2xl font-semibold text-center">Attendance Capture</h2>

//         <div className="flex flex-col gap-3 p-4 rounded-md bg-white">
//           <button
//             onClick={fetchLocation}
//             className="px-4 py-2 text-gray-900 transition bg-blue-600 rounded hover:bg-blue-800"
//           >
//             Get Current Location
//           </button>

//           {position && (
//             <div className="text-gray-700">
//               <p>Lat: {position.lat.toFixed(6)}</p>
//               <p>Lng: {position.lng.toFixed(6)}</p>
//               <p>
//                 Distance: <strong>{distance} m</strong> (
//                 {distance <= ONSITE_RADIUS_M ? "Onsite" : "Outside"})
//               </p>
//             </div>
//           )}
//         </div>

//         {!checkedIn ? (
//           <button
//             onClick={handleCheckIn}
//             disabled={submitting || !position || !employeeId}
//             className="w-full py-3 text-lg font-semibold text-gray-900 transition bg-blue-600 rounded-lg hover:bg-blue-700"
//           >
//             {submitting ? "Checking In..." : "Check In"}
//           </button>
//         ) : (
//           <button
//             onClick={handleCheckOut}
//             disabled={submitting || !position || !employeeId}
//             className="w-full py-3 text-lg font-semibold text-gray-900 transition bg-red-600 rounded-lg hover:bg-red-700"
//           >
//             {submitting ? "Checking Out..." : "Check Out"}
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }


// import axios from "axios";
// import { useEffect, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";

// const BASE_URL = "https://localhost:5000";
// const ONSITE_RADIUS_M = 50;

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
//   return Math.round(R * c);
// }

// export default function AttendanceCapture() {
//   const navigate = useNavigate();
//   const routerLocation = useLocation();

//   const [employeeId, setEmployeeId] = useState(null);
//   const [employeeEmail, setEmployeeEmail] = useState(null);
//   const [assignedLocation, setAssignedLocation] = useState(null);
//   const [position, setPosition] = useState(null);
//   const [distance, setDistance] = useState(null);
//   const [checkedIn, setCheckedIn] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [reason, setReason] = useState("");
//   const [error, setError] = useState("");

//   // Get employeeId & email
//   useEffect(() => {
//     const stateId = routerLocation.state?.employeeId;
//     const stateEmail = routerLocation.state?.email;

//     if (stateId && stateEmail) {
//       setEmployeeId(stateId);
//       setEmployeeEmail(stateEmail);
//       localStorage.setItem(
//         "employeeData",
//         JSON.stringify({ employeeId: stateId, email: stateEmail })
//       );
//     } else {
//       const stored = localStorage.getItem("employeeData");
//       if (stored) {
//         const data = JSON.parse(stored);
//         setEmployeeId(data.employeeId);
//         setEmployeeEmail(data.email);
//       }
//     }
//   }, [routerLocation.state]);

//   // Fetch Employee’s Assigned Location
//   useEffect(() => {
//     const fetchAssignedLocation = async () => {
//       if (!employeeId) return;
//       try {
//         const res = await axios.get(`${BASE_URL}/api/employees/mylocation/${employeeId}`);
//         if (res.data.success && res.data.data) {
//           setAssignedLocation(res.data.data.location);
//         } else {
//           setError("❌ No assigned location found for this employee.");
//         }
//       } catch (err) {
//         console.error("Error fetching employee location:", err);
//         setError("❌ Failed to fetch employee location.");
//       }
//     };
//     fetchAssignedLocation();
//   }, [employeeId]);

//   // Fetch today’s attendance
//   useEffect(() => {
//     const fetchTodayAttendance = async () => {
//       if (!employeeId) return;
//       try {
//         const res = await axios.get(`${BASE_URL}/api/attendance/myattendance/${employeeId}`);
//         const data = res.data;
//         const today = new Date();
//         today.setHours(0, 0, 0, 0);
//         const todayCheckIn = data.records?.find(
//           (rec) => new Date(rec.checkInTime) >= today && rec.status === "checked-in"
//         );
//         setCheckedIn(!!todayCheckIn);
//       } catch (err) {
//         console.error("Error fetching today attendance:", err);
//       }
//     };
//     fetchTodayAttendance();
//   }, [employeeId]);

//   // Get current live location
//   const fetchLocation = () => {
//     if (!navigator.geolocation)
//       return alert("Geolocation is not supported by your browser.");

//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
//         setPosition(coords);

//         if (assignedLocation) {
//           const dist = haversineDistance(
//             coords.lat,
//             coords.lng,
//             assignedLocation.latitude,
//             assignedLocation.longitude
//           );
//           setDistance(dist);
//         } else {
//           alert("No assigned location found. Please contact admin.");
//         }
//       },
//       (err) => alert(err.message),
//       { enableHighAccuracy: true, timeout: 10000 }
//     );
//   };

//   // Handle Check-In
//   // Frontend fix - always send reason
// const handleCheckIn = async () => {
//   if (!position) return alert("Please capture your current location first.");
//   if (!employeeId || !employeeEmail)
//     return alert("Employee data missing. Please login again.");
//   if (distance > ONSITE_RADIUS_M && !reason.trim())
//     return alert("You are outside the office range. Please select a reason.");

//   setSubmitting(true);
//   try {
//     const res = await axios.post(`${BASE_URL}/api/attendance/checkin`, {
//       employeeId,
//       employeeEmail,
//       latitude: position.lat,
//       longitude: position.lng,
//       reason: reason || "Onsite", // ✅ Always send reason
//     });

//     alert(res.data.message);
//     setCheckedIn(true);
//   } catch (err) {
//     alert(err.response?.data?.message || "Check-in failed.");
//   } finally {
//     setSubmitting(false);
//   }
// };

//   // Handle Check-Out
//   const handleCheckOut = async () => {
//     if (!position) return alert("Please capture your current location first.");
//     if (!employeeId) return alert("Employee data missing.");
//     if (distance > ONSITE_RADIUS_M && !reason.trim())
//       return alert("You are outside the office range. Please select a reason.");

//     setSubmitting(true);
//     try {
//       const res = await axios.post(`${BASE_URL}/api/attendance/checkout`, {
//         employeeId,
//         latitude: position.lat,
//         longitude: position.lng,
//         reason: distance > ONSITE_RADIUS_M ? reason : undefined,
//       });

//       alert(res.data.message);
//       setCheckedIn(false);
//     } catch (err) {
//       alert(err.response?.data?.message || "Check-out failed.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="flex flex-col items-center min-h-screen p-4 bg-gray-100">
//       {/* <button
//         onClick={() => navigate("/employeedashboard")}
//         className="self-start mb-4 font-medium text-gray-700 hover:text-gray-900"
//       >
//         ← Back
//       </button> */}

//       <div className="flex flex-col w-full max-w-md gap-6 p-6 bg-white shadow-lg rounded-xl">
//         <h2 className="text-2xl font-semibold text-center">Attendance Capture</h2>

//         {employeeId && (
//           <div className="p-3 rounded-md bg-green-50">
//             <p className="font-medium text-green-700">
//               Employee: {employeeId} | {employeeEmail}
//             </p>
//           </div>
//         )}

//         {assignedLocation ? (
//           <div className="p-4 rounded-md bg-blue-50">
//             <h3 className="font-medium text-blue-700">
//               Assigned Location: {assignedLocation.name}
//             </h3>
//             <p>Lat: {assignedLocation.latitude}</p>
//             <p>Lng: {assignedLocation.longitude}</p>
//             <p>Onsite Radius: {ONSITE_RADIUS_M} m</p>
//           </div>
//         ) : (
//           <p className="text-red-600">{error}</p>
//         )}

//         <div className="p-4 rounded-md bg-white">
//           <button
//             onClick={fetchLocation}
//             className="px-4 py-2 text-gray-900 transition bg-blue-600 rounded hover:bg-blue-800"
//           >
//             Get My Current Location
//           </button>

//           {position && (
//             <>
//               <p>Your Latitude: {position.lat.toFixed(6)}</p>
//               <p>Your Longitude: {position.lng.toFixed(6)}</p>

//               {distance != null && (
//                 <p>
//                   Distance from assigned location:{" "}
//                   <strong>{distance} m</strong> -{" "}
//                   <span
//                     className={
//                       distance <= ONSITE_RADIUS_M
//                         ? "text-blue-700 font-semibold"
//                         : "text-red-600 font-semibold"
//                     }
//                   >
//                     {distance <= ONSITE_RADIUS_M
//                       ? "Inside Assigned Area"
//                       : "Outside Assigned Area"}
//                   </span>
//                 </p>
//               )}
//             </>
//           )}
//         </div>

//         {/* Reason Dropdown */}
//         {distance > ONSITE_RADIUS_M && (
//           <div className="flex flex-col">
//             <label className="mb-1 font-medium text-gray-700">
//               Reason (required since you’re outside the assigned area):
//             </label>
//             <select
//               value={reason}
//               onChange={(e) => setReason(e.target.value)}
//               className="p-2 border rounded-md"
//             >
//               <option value="">-- Select Reason --</option>
//               <option value="Field Work">Field Work</option>
//               <option value="Work From Home">Work From Home</option>
//             </select>
//           </div>
//         )}

//         {!checkedIn ? (
//           <button
//             onClick={handleCheckIn}
//             disabled={submitting || !position || !employeeId}
//             className={`w-full py-3 text-gray-900 rounded-lg text-lg font-semibold transition ${
//               submitting || !position || !employeeId
//                 ? "bg-gray-400 cursor-not-allowed"
//                 : "bg-blue-600 hover:bg-blue-700"
//             }`}
//           >
//             {submitting ? "Checking In..." : "Check In"}
//           </button>
//         ) : (
//           <button
//             onClick={handleCheckOut}
//             disabled={submitting || !position || !employeeId}
//             className={`w-full py-3 text-gray-900 rounded-lg text-lg font-semibold transition ${
//               submitting || !position || !employeeId
//                 ? "bg-gray-400 cursor-not-allowed"
//                 : "bg-red-600 hover:bg-red-700"
//             }`}
//           >
//             {submitting ? "Checking Out..." : "Check Out"}
//           </button>
//         )}

//         {checkedIn && (
//           <div className="p-3 text-center rounded-md bg-yellow-50">
//             <p className="font-medium text-yellow-700">
//               ✅ You are currently checked in
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// import axios from "axios";
// import { useEffect, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";

// const BASE_URL = "https://api.timelyhealth.in/";
// const ONSITE_RADIUS_M = 50;

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
//   return Math.round(R * c);
// }

// export default function AttendanceCapture() {
//   const navigate = useNavigate();
//   const routerLocation = useLocation();

//   const [employeeId, setEmployeeId] = useState(null);
//   const [employeeEmail, setEmployeeEmail] = useState(null);
//   const [employeeName, setEmployeeName] = useState(null);
//   const [assignedLocation, setAssignedLocation] = useState(null);
//   const [position, setPosition] = useState(null);
//   const [distance, setDistance] = useState(null);
//   const [checkedIn, setCheckedIn] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [reason, setReason] = useState("");
//   const [error, setError] = useState("");
//   const [loadingLocation, setLoadingLocation] = useState(true);
//   const [locationError, setLocationError] = useState("");

//   // Get employeeId & email
//   useEffect(() => {
//     const stateId = routerLocation.state?.employeeId;
//     const stateEmail = routerLocation.state?.email;

//     if (stateId && stateEmail) {
//       setEmployeeId(stateId);
//       setEmployeeEmail(stateEmail);
//       localStorage.setItem(
//         "employeeData",
//         JSON.stringify({ employeeId: stateId, email: stateEmail })
//       );
//     } else {
//       const stored = localStorage.getItem("employeeData");
//       if (stored) {
//         const data = JSON.parse(stored);
//         setEmployeeId(data.employeeId);
//         setEmployeeEmail(data.email);
//       } else {
//         navigate("/");
//       }
//     }
//   }, [routerLocation.state, navigate]);

//   // Fetch Employee's Assigned Location and Name
//   useEffect(() => {
//     const fetchAssignedLocation = async () => {
//       if (!employeeId) return;

//       setLoadingLocation(true);
//       try {
//         const res = await axios.get(`${BASE_URL}api/employees/mylocation/${employeeId}`);
//         console.log("Location API Response:", res.data);

//         if (res.data.success && res.data.data) {
//           setAssignedLocation(res.data.data.location);

//           // ✅ Extract employee name from API response
//           if (res.data.data.employee && res.data.data.employee.name) {
//             setEmployeeName(res.data.data.employee.name);
//           } else {
//             const username = employeeEmail ? employeeEmail.split('@')[0] : '';
//             setEmployeeName(username);
//           }

//           setError("");
//         } else {
//           setError("❌ No assigned location found for this employee.");
//           setAssignedLocation(null);
//         }
//       } catch (err) {
//         console.error("Error fetching employee location:", err);
//         setError("❌ Failed to fetch employee location. Please try again.");
//         setAssignedLocation(null);
//       } finally {
//         setLoadingLocation(false);
//       }
//     };

//     if (employeeId) {
//       fetchAssignedLocation();
//     }
//   }, [employeeId, employeeEmail]);

//   // Fetch today's attendance
//   useEffect(() => {
//     const fetchTodayAttendance = async () => {
//       if (!employeeId) return;
//       try {
//         const res = await axios.get(`${BASE_URL}api/attendance/myattendance/${employeeId}`);
//         const data = res.data;

//         // ✅ Get employee name from attendance API response too
//         if (data.employeeName) {
//           setEmployeeName(data.employeeName);
//         }

//         const today = new Date();
//         today.setHours(0, 0, 0, 0);
//         const todayCheckIn = data.records?.find(
//           (rec) => new Date(rec.checkInTime) >= today && rec.status === "checked-in"
//         );
//         setCheckedIn(!!todayCheckIn);
//       } catch (err) {
//         console.error("Error fetching today attendance:", err);
//       }
//     };

//     if (employeeId) {
//       fetchTodayAttendance();
//     }
//   }, [employeeId]);

//   // Get current live location
//   const fetchLocation = () => {
//     setLocationError("");

//     if (!navigator.geolocation) {
//       setLocationError("Geolocation is not supported by your browser.");
//       return alert("Geolocation is not supported by your browser.");
//     }

//     setPosition(null);

//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
//         setPosition(coords);
//         console.log("Geolocation captured:", coords);

//         if (assignedLocation) {
//           const dist = haversineDistance(
//             coords.lat,
//             coords.lng,
//             assignedLocation.latitude,
//             assignedLocation.longitude
//           );
//           setDistance(dist);
//           console.log("Distance calculated:", dist, "meters");
//         } else {
//           setLocationError("No assigned location found. Please contact admin.");
//         }
//       },
//       (err) => {
//         const errorMessage = "Error getting location: " + err.message;
//         setLocationError(errorMessage);
//         alert(errorMessage);
//       },
//       { 
//         enableHighAccuracy: true, 
//         timeout: 15000,
//         maximumAge: 0 
//       }
//     );
//   };

//   // Handle Check-In
//   const handleCheckIn = async () => {
//     if (!position) return alert("Please capture your current location first.");
//     if (!employeeId || !employeeEmail)
//       return alert("Employee data missing. Please login again.");
//     if (distance > ONSITE_RADIUS_M && !reason.trim())
//       return alert("You are outside the office range. Please select a reason.");

//     setSubmitting(true);
//     try {
//       const res = await axios.post(`${BASE_URL}api/attendance/checkin`, {
//         employeeId,
//         employeeEmail,
//         latitude: position.lat,
//         longitude: position.lng,
//         reason: reason || "Onsite",
//       });

//       alert(res.data.message);
//       setCheckedIn(true);

//       // ✅ Update employee name from response
//       if (res.data.employeeName) {
//         setEmployeeName(res.data.employeeName);
//       }
//     } catch (err) {
//       alert(err.response?.data?.message || "Check-in failed.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // Handle Check-Out - ✅ Added confirmation dialog
//   const handleCheckOut = async () => {
//     if (!position) return alert("Please capture your current location first.");
//     if (!employeeId) return alert("Employee data missing.");

//     // ✅ CONFIRMATION DIALOG ADDED HERE
//     const isConfirmed = window.confirm("Are you sure you want to check out?");
//     if (!isConfirmed) return;

//     if (distance > ONSITE_RADIUS_M && !reason.trim())
//       return alert("You are outside the office range. Please select a reason.");

//     setSubmitting(true);
//     try {
//       const res = await axios.post(`${BASE_URL}api/attendance/checkout`, {
//         employeeId,
//         latitude: position.lat,
//         longitude: position.lng,
//         reason: distance > ONSITE_RADIUS_M ? reason : undefined,
//       });

//       alert(res.data.message);
//       setCheckedIn(false);
//       setReason("");
//       setPosition(null);
//       setDistance(null);
//     } catch (err) {
//       alert(err.response?.data?.message || "Check-out failed.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="flex flex-col items-center min-h-screen p-2 bg-gray-100">
//       <div className="flex flex-col w-full max-w-md gap-2 p-2 bg-white shadow-lg rounded-xl">
//         <h2 className="text-3xl font-bold text-center">Attendance Capture</h2>

//         {employeeId && (
//           <div className="p-2 rounded-md bg-green-50">
//             <p className="font-bold text-blue-700">
//               Employee ID: {employeeId}
//             </p>
//              {employeeName && (
//               <p className="mt-1 font-bold text-blue-700">Name: {employeeName}</p>
//             )}
//             {employeeEmail && (
//               <p className="mt-1 font-bold text-blue-700">Email: {employeeEmail}</p>
//             )}
//           </div>
//         )}

//         {loadingLocation ? (
//           <div className="p-0 rounded-md bg-blue-50">
//             <p className="text-blue-700">Loading location information...</p>
//           </div>
//         ) : assignedLocation ? (
//           <div className="p-0 rounded-md bg-blue-50">
//             <h5 className="font-bold text-blue-700">
//               Assigned Location: {assignedLocation.name}
//             </h5>
//             <p>Onsite Radius: {ONSITE_RADIUS_M} meters</p>
//           </div>
//         ) : (
//           <div className="p-0 rounded-md bg-red-50">
//             <p className="font-medium text-red-600">{error || "Location not found"}</p>
//             <p className="mt-1 text-sm text-gray-500">
//               Please contact admin to assign a location for your employee account.
//             </p>
//           </div>
//         )}

//         <div className="p-4 rounded-md bg-white">
//           <button
//             onClick={fetchLocation}
//             className={`bg-blue-600 text-gray-900 px-4 py-2 rounded hover:bg-blue-800 transition ${
//               !assignedLocation ? "opacity-50 cursor-not-allowed" : ""
//             }`}
//             disabled={!assignedLocation}
//           >
//             {!position ? "Get My Current Location" : "Update My Location"}
//           </button>

//           {!assignedLocation ? (
//             <p className="mt-2 text-sm text-red-500">
//               You need an assigned location to capture attendance.
//             </p>
//           ) : locationError ? (
//             <p className="mt-2 text-sm text-red-500">{locationError}</p>
//           ) : null}

//           {position && (
//             <div className="p-3 mt-4 rounded-md bg-green-50">
//               <p className="font-medium text-green-700">📍 Location Captured Successfully!</p>

//               {distance != null && (
//                 <p className="mt-2">
//                   Distance from assigned location:{" "}
//                   <strong>{distance} m</strong> -{" "}
//                   <span
//                     className={
//                       distance <= ONSITE_RADIUS_M
//                         ? "text-blue-700 font-semibold"
//                         : "text-red-600 font-semibold"
//                     }
//                   >
//                     {distance <= ONSITE_RADIUS_M
//                       ? "Inside Assigned Area"
//                       : "Outside Assigned Area"}
//                   </span>
//                 </p>
//               )}
//             </div>
//           )}
//         </div>

//         {distance > ONSITE_RADIUS_M && (
//           <div className="flex flex-col">
//             <label className="mb-1 font-medium text-gray-700">
//               Reason (required since you're outside the assigned area):
//             </label>
//             <select
//               value={reason}
//               onChange={(e) => setReason(e.target.value)}
//               className="p-2 border rounded-md"
//             >
//               <option value="">-- Select Reason --</option>
//               <option value="Field Work">Field Work</option>
//               <option value="Work From Home">Work From Home</option>
//             </select>
//           </div>
//         )}

//         {!checkedIn ? (
//           <button
//             onClick={handleCheckIn}
//             disabled={submitting || !position || !employeeId || !assignedLocation}
//             className={`w-full py-3 text-gray-900 rounded-lg text-lg font-semibold transition ${
//               submitting || !position || !employeeId || !assignedLocation
//                 ? "bg-gray-400 cursor-not-allowed"
//                 : "bg-blue-600 hover:bg-blue-700"
//             }`}
//           >
//             {submitting ? "Checking In..." : "Check In"}
//           </button>
//         ) : (
//           <button
//             onClick={handleCheckOut}
//             disabled={submitting || !position || !employeeId || !assignedLocation}
//             className={`w-full py-3 text-gray-900 rounded-lg text-lg font-semibold transition ${
//               submitting || !position || !employeeId || !assignedLocation
//                 ? "bg-gray-400 cursor-not-allowed"
//                 : "bg-red-600 hover:bg-red-700"
//             }`}
//           >
//             {submitting ? "Checking Out..." : "Check Out"}
//           </button>
//         )}

//         {checkedIn && (
//           <div className="p-3 text-center rounded-md bg-yellow-50">
//             <p className="font-medium text-yellow-700">
//               ✅ You are currently checked in
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// import axios from "axios";
// import { useEffect, useRef, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { API_BASE_URL } from "../config";

// const BASE_URL = API_BASE_URL; // Use imported API_BASE_URL
// const ONSITE_RADIUS_M = 50;

// // Haversine formula
// function haversineDistance(lat1, lon1, lat2, lon2) {
//   const R = 6371000;
//   const toRad = (deg) => (deg * Math.PI) / 180;
//   const dLat = toRad(lat2 - lat1);
//   const dLon = toRad(lon2 - lon1);
//   const a =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos(toRad(lat1)) *
//     Math.cos(toRad(lat2)) *
//     Math.sin(dLon / 2) ** 2;
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return Math.round(R * c);
// }

// export default function AttendanceCapture() {
//   const navigate = useNavigate();
//   const routerLocation = useLocation();

//   // Swipe related refs and state
//   const swipeAreaRef = useRef(null);
//   const [swipeProgress, setSwipeProgress] = useState(0);
//   const [isSwiping, setIsSwiping] = useState(false);

//   const [employeeId, setEmployeeId] = useState(null);
//   const [employeeEmail, setEmployeeEmail] = useState(null);
//   const [employeeName, setEmployeeName] = useState(null);
//   const [assignedLocation, setAssignedLocation] = useState(null);
//   const [position, setPosition] = useState(null);
//   const [distance, setDistance] = useState(null);
//   const [checkedIn, setCheckedIn] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [reason, setReason] = useState("");
//   const [error, setError] = useState("");
//   const [loadingLocation, setLoadingLocation] = useState(true);
//   const [locationError, setLocationError] = useState("");
//   const [allLocations, setAllLocations] = useState([]);
//   const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");

//   // Current time state
//   const [currentTime, setCurrentTime] = useState("");

//   // Get employeeId & email
//   useEffect(() => {
//     const stateId = routerLocation.state?.employeeId;
//     const stateEmail = routerLocation.state?.email;

//     if (stateId && stateEmail) {
//       setEmployeeId(stateId);
//       setEmployeeEmail(stateEmail);
//       localStorage.setItem(
//         "employeeData",
//         JSON.stringify({ employeeId: stateId, email: stateEmail })
//       );
//     } else {
//       const stored = localStorage.getItem("employeeData");
//       if (stored) {
//         const data = JSON.parse(stored);
//         setEmployeeId(data.employeeId);
//         setEmployeeEmail(data.email);
//       } else {
//         navigate("/");
//       }
//     }
//   }, [routerLocation.state, navigate]);

//   // Fetch Employee's Assigned Location and Name
//   useEffect(() => {
//     const fetchAssignedLocation = async () => {
//       if (!employeeId) return;

//       setLoadingLocation(true);
//       try {
//         const res = await axios.get(`${BASE_URL}api/employees/mylocation/${employeeId}`);

//         if (res.data.success && res.data.data) {
//           setAssignedLocation(res.data.data.location);

//           // Extract employee name from API response
//           if (res.data.data.employee && res.data.data.employee.name) {
//             setEmployeeName(res.data.data.employee.name);
//           } else {
//             const username = employeeEmail ? employeeEmail.split('@')[0] : '';
//             setEmployeeName(username);
//           }

//           setError("");
//         } else {
//           setError("No assigned location found for this employee.");
//           setAssignedLocation(null);
//         }
//       } catch (err) {
//         console.error("Error fetching employee location:", err);
//         setError("Failed to fetch employee location. Please try again.");
//         setAssignedLocation(null);
//       } finally {
//         setLoadingLocation(false);
//       }
//     };

//     if (employeeId) {
//       fetchAssignedLocation();
//     }
//   }, [employeeId, employeeEmail]);

//   // Fetch All Locations for Selection
//   useEffect(() => {
//     const fetchAllLocations = async () => {
//       try {
//         const res = await axios.get(`${BASE_URL}api/location/alllocation`);
//         if (res.data.locations) {
//           setAllLocations(res.data.locations);
//         }
//       } catch (err) {
//         console.error("Error fetching all locations:", err);
//       }
//     };
//     fetchAllLocations();
//   }, []);

//   const handleSelectLocation = (loc) => {
//     setAssignedLocation(loc);
//     setIsLocationModalOpen(false);
//     // Clear previous position/distance to force update for new location
//     setPosition(null);
//     setDistance(null);
//     alert(`Switched to location: ${loc.name}`);
//   };

//   const filteredLocations = allLocations.filter(loc =>
//     loc.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     loc.fullAddress?.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   // Fetch today's attendance
//   useEffect(() => {
//     const fetchTodayAttendance = async () => {
//       if (!employeeId) return;
//       try {
//         const res = await axios.get(`${BASE_URL}api/attendance/myattendance/${employeeId}`);
//         const data = res.data;

//         // Get employee name from attendance API response too
//         if (data.employeeName) {
//           setEmployeeName(data.employeeName);
//         }

//         const today = new Date();
//         today.setHours(0, 0, 0, 0);
//         const todayCheckIn = data.records?.find(
//           (rec) => new Date(rec.checkInTime) >= today && rec.status === "checked-in"
//         );
//         setCheckedIn(!!todayCheckIn);
//       } catch (err) {
//         console.error("Error fetching today attendance:", err);
//       }
//     };

//     if (employeeId) {
//       fetchTodayAttendance();
//     }
//   }, [employeeId]);

//   // Update current time
//   useEffect(() => {
//     const updateTime = () => {
//       const now = new Date();
//       setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
//     };
//     updateTime();
//     const interval = setInterval(updateTime, 60000);
//     return () => clearInterval(interval);
//   }, []);

//   // Get current live location
//   const fetchLocation = () => {
//     setLocationError("");

//     if (!navigator.geolocation) {
//       setLocationError("Geolocation is not supported by your browser.");
//       return alert("Geolocation is not supported by your browser.");
//     }

//     setPosition(null);

//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
//         setPosition(coords);

//         if (assignedLocation) {
//           const dist = haversineDistance(
//             coords.lat,
//             coords.lng,
//             assignedLocation.latitude,
//             assignedLocation.longitude
//           );
//           setDistance(dist);
//         } else {
//           setLocationError("No assigned location found. Please contact admin.");
//         }
//       },
//       (err) => {
//         const errorMessage = "Error getting location: " + err.message;
//         setLocationError(errorMessage);
//         alert(errorMessage);
//       },
//       {
//         enableHighAccuracy: true,
//         timeout: 15000,
//         maximumAge: 0
//       }
//     );
//   };

//   // Handle Check-In
//   const handleCheckIn = async () => {
//     if (!position) return alert("Please capture your current location first.");
//     if (!employeeId || !employeeEmail)
//       return alert("Employee data missing. Please login again.");
//     if (distance > ONSITE_RADIUS_M && !reason.trim())
//       return alert("You are outside the office range. Please select a reason.");

//     setSubmitting(true);
//     try {
//       const res = await axios.post(`${BASE_URL}api/attendance/checkin`, {
//         employeeId,
//         employeeEmail,
//         latitude: position.lat,
//         longitude: position.lng,
//         reason: reason || "Onsite",
//       });

//       alert(res.data.message);
//       setCheckedIn(true);

//       if (res.data.employeeName) {
//         setEmployeeName(res.data.employeeName);
//       }
//     } catch (err) {
//       alert(err.response?.data?.message || "Check-in failed.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // Handle Check-Out
//   const handleCheckOut = async () => {
//     if (!position) return alert("Please capture your current location first.");
//     if (!employeeId) return alert("Employee data missing.");

//     const isConfirmed = window.confirm("Are you sure you want to check out?");
//     if (!isConfirmed) return;

//     if (distance > ONSITE_RADIUS_M && !reason.trim())
//       return alert("You are outside the office range. Please select a reason.");

//     setSubmitting(true);
//     try {
//       const res = await axios.post(`${BASE_URL}api/attendance/checkout`, {
//         employeeId,
//         latitude: position.lat,
//         longitude: position.lng,
//         reason: distance > ONSITE_RADIUS_M ? reason : undefined,
//       });

//       alert(res.data.message);
//       setCheckedIn(false);
//       setReason("");
//       setPosition(null);
//       setDistance(null);
//     } catch (err) {
//       alert(err.response?.data?.message || "Check-out failed.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // Manual swipe handler with click/touch
//   const handleManualSwipe = () => {
//     if (submitting || !position || !employeeId || !assignedLocation) {
//       alert("Please capture your location first and make sure all data is loaded.");
//       return;
//     }

//     // Animate the swipe
//     setIsSwiping(true);
//     let progress = 0;
//     const interval = setInterval(() => {
//       progress += 0.1;
//       setSwipeProgress(progress);

//       if (progress >= 1) {
//         clearInterval(interval);
//         setTimeout(() => {
//           if (!checkedIn) {
//             handleCheckIn();
//           } else {
//             handleCheckOut();
//           }
//           setIsSwiping(false);
//           setSwipeProgress(0);
//         }, 300);
//       }
//     }, 30);
//   };

//   // Simple mouse/touch handlers
//   useEffect(() => {
//     const swipeArea = swipeAreaRef.current;
//     if (!swipeArea) return;

//     let startX = 0;
//     let isDragging = false;
//     const minSwipeDistance = 100;

//     const onStart = (clientX) => {
//       if (submitting || !position || !employeeId || !assignedLocation) return;
//       startX = clientX;
//       isDragging = true;
//       setIsSwiping(true);
//     };

//     const onMove = (clientX) => {
//       if (!isDragging) return;

//       const diff = clientX - startX;

//       if (!checkedIn && diff > 0) {
//         // Check-in: right swipe
//         const progress = Math.min(diff / minSwipeDistance, 1);
//         setSwipeProgress(progress);
//       } else if (checkedIn && diff < 0) {
//         // Check-out: left swipe
//         const progress = Math.min(Math.abs(diff) / minSwipeDistance, 1);
//         setSwipeProgress(progress);
//       }
//     };

//     const onEnd = (clientX) => {
//       if (!isDragging) return;

//       isDragging = false;
//       const diff = clientX - startX;

//       if (!checkedIn && diff >= minSwipeDistance) {
//         // Successful right swipe for check-in
//         handleCheckIn();
//       } else if (checkedIn && diff <= -minSwipeDistance) {
//         // Successful left swipe for check-out
//         handleCheckOut();
//       }

//       // Reset after a delay
//       setTimeout(() => {
//         setSwipeProgress(0);
//         setIsSwiping(false);
//       }, 300);
//     };

//     // Mouse events
//     const handleMouseDown = (e) => {
//       onStart(e.clientX);
//     };

//     const handleMouseMove = (e) => {
//       onMove(e.clientX);
//     };

//     const handleMouseUp = (e) => {
//       onEnd(e.clientX);
//     };

//     // Touch events
//     const handleTouchStart = (e) => {
//       onStart(e.touches[0].clientX);
//     };

//     const handleTouchMove = (e) => {
//       onMove(e.touches[0].clientX);
//     };

//     const handleTouchEnd = (e) => {
//       const clientX = e.changedTouches[0]?.clientX || 0;
//       onEnd(clientX);
//     };

//     // Add event listeners
//     swipeArea.addEventListener('mousedown', handleMouseDown);
//     document.addEventListener('mousemove', handleMouseMove);
//     document.addEventListener('mouseup', handleMouseUp);

//     swipeArea.addEventListener('touchstart', handleTouchStart);
//     document.addEventListener('touchmove', handleTouchMove);
//     document.addEventListener('touchend', handleTouchEnd);

//     return () => {
//       // Cleanup
//       swipeArea.removeEventListener('mousedown', handleMouseDown);
//       document.removeEventListener('mousemove', handleMouseMove);
//       document.removeEventListener('mouseup', handleMouseUp);

//       swipeArea.removeEventListener('touchstart', handleTouchStart);
//       document.removeEventListener('touchmove', handleTouchMove);
//       document.removeEventListener('touchend', handleTouchEnd);
//     };
//   }, [checkedIn, submitting, position, employeeId, assignedLocation]);

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-0">
//       {/* Header */}
//       <div className="flex justify-between items-center p-2 bg-white shadow-sm">
//         <div>
//           <h1 className="text-xl font-bold text-gray-900">Attendance</h1>
//         </div>
//         <div className="text-right">
//           <div className="text-2xl font-bold text-blue-600">{currentTime}</div>
//           <div className="text-xs text-gray-500">Current Time</div>
//         </div>
//       </div>

//       {/* Main Content Container - Reduced padding */}
//       <div className="p-3 max-w-md mx-auto">

//         {/* Employee Info Card - Compact */}
//         <div className="bg-white rounded-xl shadow-sm p-3 mb-2">
//           <div className="flex items-center space-x-3">
//             <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
//               <span className="text-gray-900 font-bold">
//                 {employeeName ? employeeName.charAt(0).toUpperCase() : "U"}
//               </span>
//             </div>
//             <div className="flex-1 min-w-0">
//               {employeeName && (
//                 <h2 className="text-base font-bold text-gray-900 truncate">{employeeName}</h2>
//               )}
//               {employeeId && (
//                 <p className="text-xs text-gray-500">ID: {employeeId}</p>
//               )}
//               {employeeEmail && (
//                 <p className="text-xs text-gray-500 truncate">{employeeEmail}</p>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Location Card - Compact */}
//         <div className="bg-white rounded-xl shadow-sm p-3 mb-2">
//           <div className="flex justify-between items-center mb-2">
//             <h3 className="text-sm font-semibold text-gray-900">Location Status</h3>
//             <button
//               onClick={() => setIsLocationModalOpen(true)}
//               className="text-xs text-blue-600 hover:text-blue-800 font-medium"
//             >
//               Select Location
//             </button>
//             <div className={`px-2 py-1 rounded-full text-xs font-medium ${position ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-700'
//               }`}>
//               {position ? 'Captured ✓' : 'Required'}
//             </div>
//           </div>

//           {loadingLocation ? (
//             <div className="animate-pulse">
//               <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
//               <div className="h-3 bg-gray-200 rounded w-1/2"></div>
//             </div>
//           ) : assignedLocation ? (
//             <div>
//               <div className="flex items-center space-x-2 mb-2">
//                 <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
//                   <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
//                   </svg>
//                 </div>
//                 <div className="min-w-0">
//                   <h4 className="text-sm font-medium text-gray-900 truncate">{assignedLocation.name}</h4>
//                   <p className="text-xs text-gray-500">Assigned Location • Radius: {ONSITE_RADIUS_M}m</p>
//                 </div>
//               </div>

//               {position && distance != null && (
//                 <div className="mt-2 p-2 bg-white rounded-lg">
//                   <div className="flex justify-between items-center mb-1">
//                     <span className="text-xs text-gray-700">Distance:</span>
//                     <span className={`text-sm font-bold ${distance <= ONSITE_RADIUS_M ? 'text-blue-700' : 'text-red-600'
//                       }`}>
//                       {distance}m
//                     </span>
//                   </div>
//                   <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
//                     <div
//                       className={`h-full ${distance <= ONSITE_RADIUS_M ? 'bg-blue-600' : 'bg-red-500'
//                         }`}
//                       style={{ width: `${Math.min((distance / ONSITE_RADIUS_M) * 100, 100)}%` }}
//                     ></div>
//                   </div>
//                   <p className={`text-xs mt-1 font-medium ${distance <= ONSITE_RADIUS_M ? 'text-blue-700' : 'text-red-600'
//                     }`}>
//                     {distance <= ONSITE_RADIUS_M ? '✓ Within office radius' : '⚠ Outside office radius'}
//                   </p>
//                 </div>
//               )}

//               <button
//                 onClick={fetchLocation}
//                 className={`w-full mt-2 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center space-x-1 transition ${!assignedLocation
//                   ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
//                   : position
//                     ? 'bg-amber-500 hover:bg-amber-600 text-gray-900'
//                     : 'bg-blue-600 hover:bg-blue-700 text-gray-900'
//                   }`}
//                 disabled={!assignedLocation}
//               >
//                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
//                 </svg>
//                 <span>{!position ? "Get Current Location" : "Update Location"}</span>
//               </button>
//             </div>
//           ) : (
//             <div className="text-center py-2">
//               <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-1">
//                 <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
//                 </svg>
//               </div>
//               <p className="text-xs text-gray-700 mb-0.5">No location assigned</p>
//               <p className="text-xs text-gray-500">Please contact admin</p>
//             </div>
//           )}
//         </div>

//         {/* Reason Selection (if outside radius) - Compact */}
//         {distance > ONSITE_RADIUS_M && (
//           <div className="bg-white rounded-xl shadow-sm p-3 mb-2">
//             <h3 className="text-sm font-semibold text-gray-900 mb-2">Reason Required</h3>
//             <select
//               value={reason}
//               onChange={(e) => setReason(e.target.value)}
//               className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
//             >
//               <option value="">-- Select Reason --</option>
//               <option value="Field Work">Field Work</option>
//               <option value="Work From Home">Work From Home</option>
//               <option value="Client Meeting">Client Meeting</option>
//               <option value="Other">Other</option>
//             </select>
//             <p className="text-xs text-gray-500 mt-1">You're outside the assigned area ({distance}m)</p>
//           </div>
//         )}

//         {/* Attendance Card - Compact */}
//         <div className="bg-white rounded-xl shadow-sm p-3">
//           {/* Status Header */}
//           <div className="flex items-center justify-between mb-3">
//             <div>
//               <h3 className="text-sm font-semibold text-gray-900">Today's Attendance</h3>
//               <p className="text-xs text-gray-500">
//                 {checkedIn ? 'You are currently checked in' : 'Ready to check in'}
//               </p>
//             </div>
//             <div className={`px-2 py-1 rounded-full text-xs font-medium ${checkedIn ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
//               }`}>
//               {checkedIn ? 'Checked In' : 'Not Checked In'}
//             </div>
//           </div>

//           {/* Swipe Instructions */}
//           <div className="text-center mb-3">
//             <p className="text-sm text-gray-700 font-medium">
//               {!checkedIn
//                 ? "Swipe right → to check in"
//                 : "Swipe left ← to check out"
//               }
//             </p>
//           </div>

//           {/* Swipe Button Container */}
//           <div className="mb-3">
//             <div
//               ref={swipeAreaRef}
//               className={`relative overflow-hidden rounded-lg ${!position || !assignedLocation || submitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-[0.98] transition-transform'
//                 }`}
//               onClick={handleManualSwipe}
//             >
//               {!checkedIn ? (
//                 // Check-in swipe button
//                 <div className="relative bg-gradient-to-r from-blue-500 to-blue-600 h-12">
//                   {/* Swipe progress overlay */}
//                   <div
//                     className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500"
//                     style={{
//                       width: `${swipeProgress * 100}%`,
//                       transition: isSwiping ? 'none' : 'width 0.2s ease-out'
//                     }}
//                   ></div>

//                   {/* Content */}
//                   <div className="absolute inset-0 flex items-center justify-between px-3">
//                     <div className="flex items-center gap-1 text-gray-900">
//                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
//                       </svg>
//                       <span className="text-sm font-bold">CHECK IN</span>
//                     </div>

//                     <div className="flex items-center gap-1 text-gray-900">
//                       <span className="text-xs">Swipe →</span>
//                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
//                       </svg>
//                     </div>
//                   </div>
//                 </div>
//               ) : (
//                 // Check-out swipe button
//                 <div className="relative bg-gradient-to-r from-red-500 to-red-600 h-12">
//                   {/* Swipe progress overlay */}
//                   <div
//                     className="absolute right-0 top-0 bottom-0 bg-gradient-to-r from-red-400 to-red-500"
//                     style={{
//                       width: `${swipeProgress * 100}%`,
//                       transition: isSwiping ? 'none' : 'width 0.2s ease-out'
//                     }}
//                   ></div>

//                   {/* Content */}
//                   <div className="absolute inset-0 flex items-center justify-between px-3">
//                     <div className="flex items-center gap-1 text-gray-900">
//                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
//                       </svg>
//                       <span className="text-xs">← Swipe</span>
//                     </div>

//                     <div className="flex items-center gap-1 text-gray-900">
//                       <span className="text-sm font-bold">CHECK OUT</span>
//                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
//                       </svg>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Help text */}
//             <p className="text-center text-xs text-gray-500 mt-1">
//               {!position ? "Capture location first" : "Click or drag to swipe"}
//             </p>
//           </div>

//           {/* Loading State */}
//           {submitting && (
//             <div className="text-center py-2 mb-2">
//               <div className="inline-flex items-center justify-center gap-1">
//                 <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
//                 <span className="text-xs text-gray-700">
//                   {!checkedIn ? "Processing Check In..." : "Processing Check Out..."}
//                 </span>
//               </div>
//             </div>
//           )}

//           {/* Status Message - Only when checked in and not submitting */}
//           {checkedIn && !submitting && (
//             <div className="text-center py-2 border-t border-gray-200">
//               <div className="inline-flex flex-col items-center gap-0">
//                 <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
//                   <svg className="w-5 h-5 text-blue-700" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                   </svg>
//                 </div>
//                 <div>
//                   <p className="text-sm font-bold text-green-800">You are checked in</p>
//                   <p className="text-xs text-blue-700">Remember to check out when leaving</p>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Simple Footer */}
//           {/* <div className="text-center text-gray-500 text-xs mt-2 pt-2 border-t border-gray-200">
//             <p>Swipe right to check in • Swipe left to check out</p>
//           </div> */}
//         </div>

//         {/* Global Footer */}
//         <div className="text-center text-gray-500 text-xs mt-2 pt-2 border-t border-gray-200">
//           <p>Make sure location is captured before checking in/out</p>
//         </div>

//       </div>

//       {/* Location Selection Modal */}
//       {isLocationModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white  backdrop-blur-sm">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col animate-fade-in-up">
//             <div className="p-4 border-b flex justify-between items-center bg-white rounded-t-2xl">
//               <h3 className="text-lg font-bold text-gray-900">Select Site Location</h3>
//               <button
//                 onClick={() => setIsLocationModalOpen(false)}
//                 className="text-gray-500 hover:text-gray-500 p-1"
//               >
//                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
//                 </svg>
//               </button>
//             </div>

//             <div className="p-4 bg-white">
//               <div className="relative mb-4">
//                 <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                   </svg>
//                 </span>
//                 <input
//                   type="text"
//                   placeholder="Search site or address..."
//                   className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   autoFocus
//                 />
//               </div>

//               <div className="overflow-y-auto max-h-[50vh] space-y-2 pr-1 custom-scrollbar">
//                 {filteredLocations.length > 0 ? (
//                   filteredLocations.map((loc) => (
//                     <div
//                       key={loc._id}
//                       onClick={() => handleSelectLocation(loc)}
//                       className="p-3 border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 cursor-pointer transition-all flex items-start space-x-3 group"
//                     >
//                       <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-gray-900 transition-colors text-blue-600">
//                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
//                         </svg>
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors truncate">{loc.name}</h4>
//                         <p className="text-xs text-gray-500 truncate mt-0.5">{loc.fullAddress || "No address provided"}</p>
//                       </div>
//                       <div className="flex-shrink-0 self-center">
//                         <svg className="w-5 h-5 text-gray-700 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
//                         </svg>
//                       </div>
//                     </div>
//                   ))
//                 ) : (
//                   <div className="text-center py-8">
//                     <p className="text-gray-500 text-sm">No locations found matching your search.</p>
//                   </div>
//                 )}
//               </div>
//             </div>

//             <div className="p-4 bg-white border-t rounded-b-2xl">
//               <p className="text-xs text-gray-500 text-center">
//                 Select a site to update your capture radius
//               </p>
//             </div>
//           </div>
//         </div>
//       )}

//       <style jsx>{`
//         @keyframes fade-in-up {
//           from {
//             opacity: 0;
//             transform: translateY(10px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
//         .animate-fade-in-up {
//           animation: fade-in-up 0.3s ease-out;
//         }
//         .custom-scrollbar::-webkit-scrollbar {
//           width: 4px;
//         }
//         .custom-scrollbar::-webkit-scrollbar-track {
//           background: #f1f1f1;
//         }
//         .custom-scrollbar::-webkit-scrollbar-thumb {
//           background: #cbd5e1;
//           border-radius: 10px;
//         }
//         .custom-scrollbar::-webkit-scrollbar-thumb:hover {
//           background: #94a3b8;
//         }
//       `}</style>

//     </div>
//   );
// }


import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import {
  FaStar,
  FaCalendarAlt,
  FaClock,
  FaQuoteLeft,
  FaQuoteRight,
  FaRocket,
  FaTimes,
  FaVolumeUp,
  FaUserFriends,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaUserCheck,
  FaBuilding,
  FaWifi,
  FaArrowRight,
  FaArrowLeft,
  FaSpinner,
  FaHome,
  FaBriefcase,
  FaUsers,
} from "react-icons/fa";
import { MdCelebration, MdLocationOn, MdWork, MdOutlineAttachMoney } from "react-icons/md";
import { BsStars, BsCalendarCheck, BsClockHistory, BsPersonBadge } from "react-icons/bs";

// FIX: Ensure BASE_URL ends without trailing slash and remove any duplicate 'api'
const BASE_URL = API_BASE_URL.endsWith("/") ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
const cleanBaseUrl = BASE_URL.replace(/\/api\/?$/, "");

const ONSITE_RADIUS_M = 50;

// List of departments that should ONLY have onsite option
const ONSITE_ONLY_DEPARTMENTS = ["Laboratory Medicine", "Medical", "Nursing"];

// Haversine formula
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Motivational thoughts collection with categories
const MOTIVATIONAL_THOUGHTS = [
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", emoji: "💪", category: "success" },
  { text: "The only way to do great work is to love what you do.", emoji: "❤️", category: "passion" },
  { text: "Believe you can and you're halfway there.", emoji: "🌟", category: "belief" },
  { text: "It does not matter how slowly you go as long as you do not stop.", emoji: "🚀", category: "persistence" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", emoji: "✨", category: "dreams" },
  { text: "You are never too old to set another goal or to dream a new dream.", emoji: "🌈", category: "goals" },
  { text: "The secret of getting ahead is getting started.", emoji: "🏃‍♂️", category: "action" },
  { text: "Your attitude, not your aptitude, will determine your altitude.", emoji: "📈", category: "attitude" },
  { text: "The only impossible journey is the one you never begin.", emoji: "🌄", category: "courage" },
  { text: "Dream big and dare to fail.", emoji: "🎯", category: "ambition" },
  { text: "Success is not the key to happiness. Happiness is the key to success.", emoji: "😊", category: "happiness" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", emoji: "🌳", category: "timing" },
  { text: "You miss 100% of the shots you don't take.", emoji: "🏀", category: "opportunity" },
  { text: "The only limit to our realization of tomorrow is our doubts of today.", emoji: "🔥", category: "belief" },
  { text: "Great things never come from comfort zones.", emoji: "🌊", category: "growth" },
  { text: "The difference between ordinary and extraordinary is that little extra.", emoji: "⭐", category: "excellence" },
  { text: "Success usually comes to those who are too busy to be looking for it.", emoji: "🎯", category: "focus" },
  { text: "Don't watch the clock; do what it does. Keep going.", emoji: "⏰", category: "persistence" },
  { text: "The only person you are destined to become is the person you decide to be.", emoji: "🌟", category: "identity" },
  { text: "What you get by achieving your goals is not as important as what you become.", emoji: "🌱", category: "growth" },
  { text: "The journey of a thousand miles begins with a single step.", emoji: "👣", category: "beginning" },
  { text: "Believe in yourself and all that you are. Know that there is something inside you that is greater than any obstacle.", emoji: "💫", category: "belief" },
  { text: "Your limitation—it's only your imagination.", emoji: "🧠", category: "imagination" },
  { text: "Push yourself, because no one else is going to do it for you.", emoji: "💪", category: "motivation" },
];

// Greetings based on time of day with fun emojis
const getGreeting = (name) => {
  const hour = new Date().getHours();
  let greeting = "";
  let emoji = "";

  if (hour >= 5 && hour < 12) {
    greeting = "Good Morning";
    emoji = "🌅";
  } else if (hour >= 12 && hour < 17) {
    greeting = "Good Afternoon";
    emoji = "☀️";
  } else if (hour >= 17 && hour < 21) {
    greeting = "Good Evening";
    emoji = "🌆";
  } else {
    greeting = "Good Night";
    emoji = "🌙";
  }

  return { greeting, emoji, name };
};

// Get Indian date format with day
const getIndianDate = () => {
  const now = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Kolkata",
  };
  return now.toLocaleDateString("en-IN", options);
};

// Get Indian time with seconds
const getIndianTime = () => {
  const now = new Date();
  return now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
};

// Get current day and date details
const getDayDetails = () => {
  const now = new Date();
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const day = days[now.getDay()];
  const date = now.getDate();
  const month = now.toLocaleString("en-US", { month: "long" });
  const year = now.getFullYear();
  return { day, date, month, year };
};

// Get random motivational thought
const getRandomThought = () => {
  return MOTIVATIONAL_THOUGHTS[Math.floor(Math.random() * MOTIVATIONAL_THOUGHTS.length)];
};

// Sound function - Welcome
const playWelcomeSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523.25, 587.33, 659.25, 783.99];
    notes.forEach((freq, index) => {
      setTimeout(() => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = freq;
        oscillator.type = "sine";
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.25);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.25);
      }, index * 150);
    });
  } catch (e) {
    console.log("Audio not supported");
  }
};

// Success sound for Check-in/Check-out
const playSuccessSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, index) => {
      setTimeout(() => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = freq;
        oscillator.type = "sine";
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      }, index * 120);
    });
  } catch (e) {
    console.log("Audio not supported");
  }
};

// ✅ FIX: Get voices with retry mechanism
const getFemaleVoice = (voices) => {
  // Try to find female voice
  let femaleVoice = voices.find(
    (voice) =>
      voice.name.toLowerCase().includes("female") ||
      voice.name.toLowerCase().includes("woman") ||
      voice.name.toLowerCase().includes("girl") ||
      voice.name.toLowerCase().includes("zira") ||
      voice.name.toLowerCase().includes("samantha") ||
      voice.name.toLowerCase().includes("victoria") ||
      voice.name.toLowerCase().includes("google uk english female")
  );

  if (!femaleVoice) {
    femaleVoice = voices.find((voice) => voice.lang.includes("en-IN"));
  }

  if (!femaleVoice) {
    femaleVoice = voices.find((voice) => voice.lang.includes("en-US") || voice.lang.includes("en-GB"));
  }

  if (!femaleVoice && voices.length > 0) {
    femaleVoice = voices[0];
  }

  return femaleVoice;
};

// ✅ FIX: Speak with voice loading retry
const speakWithRetry = (message, retries = 5) => {
  return new Promise((resolve) => {
    if (!("speechSynthesis" in window)) {
      resolve(false);
      return;
    }

    const trySpeak = (attempt = 0) => {
      const voices = window.speechSynthesis.getVoices();
      
      if (voices.length > 0 || attempt >= retries) {
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(message);
        const femaleVoice = getFemaleVoice(voices);
        
        if (femaleVoice) {
          utterance.voice = femaleVoice;
        }
        
        utterance.lang = "en-IN";
        utterance.pitch = 1.2;
        utterance.rate = 0.9;
        utterance.volume = 1;
        
        utterance.onend = () => resolve(true);
        utterance.onerror = () => resolve(false);
        
        window.speechSynthesis.speak(utterance);
      } else {
        // Wait for voices to load
        setTimeout(() => trySpeak(attempt + 1), 300);
      }
    };
    
    trySpeak();
  });
};

// Female voice welcome message
const speakWelcomeMessage = async (name, greeting) => {
  const { day, date, month, year } = getDayDetails();
  const currentTime = getIndianTime();
  const message = `Hello ${name}! ${greeting}! Today is ${day}, ${date} ${month} ${year}. The current time is ${currentTime} IST. Welcome to your attendance dashboard. Have a wonderful and productive day ahead. Stay motivated and keep shining!`;
  return speakWithRetry(message);
};

// Female voice for Check-in success (short)
const speakCheckInSuccess = async (name) => {
  const message = `You have successfully checked in. Have a great day!`;
  return speakWithRetry(message);
};

// Female voice for Check-out success (short)
const speakCheckOutSuccess = async (name) => {
  const message = `You have successfully checked out. Thank you!`;
  return speakWithRetry(message);
};

export default function AttendanceCapture() {
  const navigate = useNavigate();
  const routerLocation = useLocation();

  // Swipe related refs and state
  const swipeAreaRef = useRef(null);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const [employeeId, setEmployeeId] = useState(null);
  const [employeeEmail, setEmployeeEmail] = useState(null);
  const [employeeName, setEmployeeName] = useState(null);
  const [employeeDepartment, setEmployeeDepartment] = useState(null);
  const [assignedLocation, setAssignedLocation] = useState(null);
  const [position, setPosition] = useState(null);
  const [distance, setDistance] = useState(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [allLocations, setAllLocations] = useState([]);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);

  // Success Popup states
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [successEmoji, setSuccessEmoji] = useState("");
  const [successType, setSuccessType] = useState(""); // "checkin" or "checkout"
  const [isPopupClosing, setIsPopupClosing] = useState(false);

  // Welcome Popup states
  const [showWelcomePopup, setShowWelcomePopup] = useState(() => {
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcomePopup");
    if (hasSeenWelcome === "true") {
      return false;
    }
    return true;
  });
  
  const [greetingMessage, setGreetingMessage] = useState("");
  const [greetingEmoji, setGreetingEmoji] = useState("");
  const [currentIndianDate, setCurrentIndianDate] = useState("");
  const [currentIndianTime, setCurrentIndianTime] = useState("");
  const [motivationalThought, setMotivationalThought] = useState(null);
  const [particles, setParticles] = useState([]);

  // Current time state
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  // ✅ Load voices on component mount
  useEffect(() => {
    if ("speechSynthesis" in window) {
      // Try to load voices immediately
      let voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setVoicesLoaded(true);
      }
      
      // Also listen for voices changed event
      const onVoicesChanged = () => {
        setVoicesLoaded(true);
      };
      
      window.speechSynthesis.addEventListener("voiceschanged", onVoicesChanged);
      
      // Fallback: if voices still not loaded after 2 seconds, retry
      const timeout = setTimeout(() => {
        if (window.speechSynthesis.getVoices().length > 0) {
          setVoicesLoaded(true);
        }
      }, 2000);
      
      return () => {
        window.speechSynthesis.removeEventListener("voiceschanged", onVoicesChanged);
        clearTimeout(timeout);
      };
    }
  }, []);

  // Get employeeId & email from navigation state or localStorage
  useEffect(() => {
    const stateId = routerLocation.state?.employeeId;
    const stateEmail = routerLocation.state?.email;
    const stateName = routerLocation.state?.employeeName;
    const stateDepartment = routerLocation.state?.department;

    if (stateId && stateEmail) {
      setEmployeeId(stateId);
      setEmployeeEmail(stateEmail);
      if (stateName) setEmployeeName(stateName);
      if (stateDepartment) setEmployeeDepartment(stateDepartment);
      localStorage.setItem(
        "employeeData",
        JSON.stringify({
          employeeId: stateId,
          email: stateEmail,
          employeeName: stateName,
          department: stateDepartment,
        })
      );
    } else {
      const stored = localStorage.getItem("employeeData");
      if (stored) {
        const data = JSON.parse(stored);
        setEmployeeId(data.employeeId);
        setEmployeeEmail(data.email);
        setEmployeeName(data.employeeName);
        setEmployeeDepartment(data.department);
      } else {
        navigate("/");
      }
    }
  }, [routerLocation.state, navigate]);

  // ✅ Initialize welcome popup data
  useEffect(() => {
    if (employeeName && showWelcomePopup) {
      const { greeting, emoji } = getGreeting(employeeName);
      setGreetingMessage(greeting);
      setGreetingEmoji(emoji);
      setCurrentIndianDate(getIndianDate());
      setCurrentIndianTime(getIndianTime());
      const thought = getRandomThought();
      setMotivationalThought(thought);

      setTimeout(() => {
        playWelcomeSound();
      }, 300);

      // ✅ Speak with retry when voices are ready
      const speakWelcome = async () => {
        if (voicesLoaded) {
          setIsSpeaking(true);
          await speakWelcomeMessage(employeeName, greeting);
          setIsSpeaking(false);
        } else {
          // Wait for voices and retry
          let attempts = 0;
          const checkVoices = setInterval(() => {
            attempts++;
            if (window.speechSynthesis.getVoices().length > 0) {
              clearInterval(checkVoices);
              setIsSpeaking(true);
              speakWelcomeMessage(employeeName, greeting).then(() => {
                setIsSpeaking(false);
              });
            } else if (attempts > 10) {
              clearInterval(checkVoices);
              // Fallback: try anyway
              setIsSpeaking(true);
              speakWelcomeMessage(employeeName, greeting).then(() => {
                setIsSpeaking(false);
              });
            }
          }, 500);
        }
      };
      
      speakWelcome();
      generateParticles();

      localStorage.setItem("hasSeenWelcomePopup", "true");
    }
  }, [employeeName, showWelcomePopup, voicesLoaded]);

  // Generate floating particles
  const generateParticles = () => {
    const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#FF9FF3", "#54A0FF"];
    const newParticles = [];
    for (let i = 0; i < 20; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: Math.random() * 3 + 2,
        delay: Math.random() * 2,
      });
    }
    setParticles(newParticles);
  };

  // Fetch Employee's Assigned Location
  useEffect(() => {
    const fetchAssignedLocation = async () => {
      if (!employeeId) return;
      setLoadingLocation(true);
      setError("");

      try {
        const url = `${cleanBaseUrl}/api/employees/mylocation/${employeeId}`;
        const res = await axios.get(url);

        if (res.data) {
          let locationData = null;
          let employeeData = null;

          if (res.data.success && res.data.data) {
            locationData = res.data.data.location || res.data.data;
            employeeData = res.data.data.employee;
          } else if (res.data.location) {
            locationData = res.data.location;
            employeeData = res.data.employee;
          } else if (res.data.data) {
            locationData = res.data.data;
          } else if (res.data.latitude || res.data.coordinates) {
            locationData = res.data;
          }

          if (locationData) {
            setAssignedLocation(locationData);
            if (employeeData) {
              if (employeeData.name) setEmployeeName(employeeData.name);
              if (employeeData.department) setEmployeeDepartment(employeeData.department);
            }
          } else {
            setError("No assigned location found for this employee.");
          }
        }
      } catch (err) {
        console.error("Error fetching location:", err);
        setError("Failed to fetch location");
      } finally {
        setLoadingLocation(false);
      }
    };
    if (employeeId) fetchAssignedLocation();
  }, [employeeId]);

  // Fetch All Locations
  useEffect(() => {
    const fetchAllLocations = async () => {
      try {
        const url = `${cleanBaseUrl}/api/location/alllocation`;
        const res = await axios.get(url);
        if (res.data.locations) setAllLocations(res.data.locations);
        else if (res.data.data) setAllLocations(res.data.data);
        else if (Array.isArray(res.data)) setAllLocations(res.data);
      } catch (err) {
        console.error("Error fetching locations:", err);
      }
    };
    fetchAllLocations();
  }, []);

  const handleSelectLocation = (loc) => {
    setAssignedLocation(loc);
    setIsLocationModalOpen(false);
    setPosition(null);
    setDistance(null);
    alert(`Switched to location: ${loc.name}`);
  };

  const filteredLocations = allLocations.filter(
    (loc) =>
      loc.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.fullAddress?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fetch today's attendance
  useEffect(() => {
    const fetchTodayAttendance = async () => {
      if (!employeeId) return;
      try {
        const url = `${cleanBaseUrl}/api/attendance/myattendance/${employeeId}`;
        const res = await axios.get(url);

        if (res.data.employeeName) {
          setEmployeeName(res.data.employeeName);
        }

        const records = res.data.records || [];

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayRecord = records.find((rec) => {
          const checkInTime = new Date(rec.checkInTime);
          return checkInTime >= today && (rec.status === "checked-in" || rec.status === "on-break");
        });

        if (todayRecord) {
          setCheckedIn(true);
        } else {
          setCheckedIn(false);
        }
      } catch (err) {
        console.error("Error fetching attendance:", err);
      }
    };
    if (employeeId) fetchTodayAttendance();
  }, [employeeId]);

  // Update current time and date
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      setCurrentDate(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      );
      setCurrentIndianTime(getIndianTime());
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Get current live location
  const fetchLocation = () => {
    if (!navigator.geolocation) {
      return alert("Geolocation is not supported by your browser.");
    }
    setPosition(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(coords);
        if (assignedLocation) {
          const dist = haversineDistance(
            coords.lat,
            coords.lng,
            assignedLocation.latitude,
            assignedLocation.longitude
          );
          setDistance(dist);
        }
      },
      (err) => alert("Error getting location: " + err.message),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // ✅ Handle Check-In with voice
  const handleCheckIn = async () => {
    if (!position) return alert("Please capture your current location first.");
    if (!employeeId || !employeeEmail) return alert("Employee data missing.");

    const isOnsiteOnlyDepartment = ONSITE_ONLY_DEPARTMENTS.includes(employeeDepartment);

    if (isOnsiteOnlyDepartment && distance > ONSITE_RADIUS_M) {
      return alert(`You are outside the office range (${distance}m). Must be within ${ONSITE_RADIUS_M}m.`);
    }
    if (!isOnsiteOnlyDepartment && distance > ONSITE_RADIUS_M && !reason.trim()) {
      return alert("You are outside the office range. Please select a reason.");
    }

    setSubmitting(true);
    try {
      await axios.post(`${cleanBaseUrl}/api/attendance/checkin`, {
        employeeId,
        employeeEmail,
        latitude: position.lat,
        longitude: position.lng,
        reason: isOnsiteOnlyDepartment ? "Onsite" : reason || "Onsite",
      });

      setSuccessType("checkin");
      setSuccessMessage("✅ Check-in Successful!");
      setSuccessEmoji("✅");
      setShowSuccessPopup(true);
      setIsPopupClosing(false);

      playSuccessSound();
      
      // ✅ Speak check-in success with retry
      setTimeout(async () => {
        setIsSpeaking(true);
        await speakCheckInSuccess(employeeName);
        setIsSpeaking(false);
      }, 500);
      
    } catch (err) {
      alert(err.response?.data?.message || "Check-in failed.");
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Handle Check-Out with voice
  const handleCheckOut = async () => {
    if (!employeeId) return alert("Employee data missing.");

    let lat = null;
    let lng = null;

    if (position) {
      lat = position.lat;
      lng = position.lng;
    } else {
      const gotLocation = await new Promise((resolve) => {
        if (!navigator.geolocation) {
          resolve(false);
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            lat = pos.coords.latitude;
            lng = pos.coords.longitude;
            resolve(true);
          },
          () => resolve(false),
          { enableHighAccuracy: true, timeout: 5000 }
        );
      });

      if (!gotLocation) {
        const proceed = window.confirm("Location not available. Check out anyway?");
        if (!proceed) return;
      }
    }

    if (!window.confirm("Are you sure you want to check out?")) return;

    setSubmitting(true);
    try {
      const payload = { employeeId };
      if (lat && lng) {
        payload.latitude = lat;
        payload.longitude = lng;
      }

      await axios.post(`${cleanBaseUrl}/api/attendance/checkout`, payload);

      setSuccessType("checkout");
      setSuccessMessage("✅ Check-out Successful!");
      setSuccessEmoji("✅");
      setShowSuccessPopup(true);
      setIsPopupClosing(false);

      playSuccessSound();
      
      // ✅ Speak check-out success with retry
      setTimeout(async () => {
        setIsSpeaking(true);
        await speakCheckOutSuccess(employeeName);
        setIsSpeaking(false);
      }, 500);
      
    } catch (err) {
      console.error("Check-out error:", err);
      alert(err.response?.data?.message || "Check-out failed.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle close success popup
  const handleCloseSuccessPopup = () => {
    if (isPopupClosing) return;
    setIsPopupClosing(true);
    setShowSuccessPopup(false);
    setTimeout(() => {
      window.location.reload();
    }, 300);
  };

  // Manual swipe handler
  const handleManualSwipe = () => {
    if (submitting) {
      alert("Please wait, previous action is processing...");
      return;
    }

    if (!checkedIn && !position) {
      alert("Please capture your location first.");
      return;
    }

    setIsSwiping(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.1;
      setSwipeProgress(progress);
      if (progress >= 1) {
        clearInterval(interval);
        setTimeout(() => {
          if (!checkedIn) {
            handleCheckIn();
          } else {
            handleCheckOut();
          }
          setIsSwiping(false);
          setSwipeProgress(0);
        }, 300);
      }
    }, 30);
  };

  // Swipe event handlers
  useEffect(() => {
    const swipeArea = swipeAreaRef.current;
    if (!swipeArea) return;

    let startX = 0;
    let isDragging = false;
    const minSwipeDistance = 100;

    const onStart = (clientX) => {
      if (submitting) return;
      if (!checkedIn && !position) return;
      startX = clientX;
      isDragging = true;
      setIsSwiping(true);
    };

    const onMove = (clientX) => {
      if (!isDragging) return;
      const diff = clientX - startX;
      if (!checkedIn && diff > 0) {
        setSwipeProgress(Math.min(diff / minSwipeDistance, 1));
      } else if (checkedIn && diff < 0) {
        setSwipeProgress(Math.min(Math.abs(diff) / minSwipeDistance, 1));
      }
    };

    const onEnd = (clientX) => {
      if (!isDragging) return;
      isDragging = false;
      const diff = clientX - startX;
      if (!checkedIn && diff >= minSwipeDistance) {
        handleCheckIn();
      } else if (checkedIn && diff <= -minSwipeDistance) {
        handleCheckOut();
      }
      setTimeout(() => {
        setSwipeProgress(0);
        setIsSwiping(false);
      }, 300);
    };

    const handleMouseDown = (e) => onStart(e.clientX);
    const handleMouseMove = (e) => onMove(e.clientX);
    const handleMouseUp = (e) => onEnd(e.clientX);
    const handleTouchStart = (e) => onStart(e.touches[0].clientX);
    const handleTouchMove = (e) => onMove(e.touches[0].clientX);
    const handleTouchEnd = (e) => onEnd(e.changedTouches[0]?.clientX || 0);

    swipeArea.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    swipeArea.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      swipeArea.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      swipeArea.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [checkedIn, submitting, position, employeeId, assignedLocation]);

  const isOnsiteOnlyDepartment = ONSITE_ONLY_DEPARTMENTS.includes(employeeDepartment);

  // Function to replay voice
  const replayVoice = async () => {
    if (employeeName) {
      const { greeting } = getGreeting(employeeName);
      setIsSpeaking(true);
      await speakWelcomeMessage(employeeName, greeting);
      setIsSpeaking(false);
    }
  };

  // Close welcome popup and cancel speech
  const handleCloseWelcomePopup = () => {
    setShowWelcomePopup(false);
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/80 to-purple-50/60 p-4 relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-gradient-to-br from-indigo-300/25 to-blue-400/20 rounded-full blur-3xl animate-orb-float" style={{ animationDuration: '8s' }}></div>
        <div className="absolute top-1/3 -right-16 w-64 h-64 bg-gradient-to-br from-purple-300/20 to-pink-300/15 rounded-full blur-3xl animate-orb-float" style={{ animationDuration: '10s', animationDelay: '2s' }}></div>
        <div className="absolute -bottom-16 left-1/4 w-56 h-56 bg-gradient-to-br from-cyan-300/20 to-emerald-300/15 rounded-full blur-3xl animate-orb-float" style={{ animationDuration: '12s', animationDelay: '4s' }}></div>
      </div>

      <div className="max-w-md mx-auto relative z-10">
        {/* SUCCESS POPUP */}
        {showSuccessPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 transform animate-scale-up border border-green-200/50">
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                    <div className="relative w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                      <span className="text-3xl">{successEmoji}</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900">{successMessage}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {successType === "checkin" ? (
                    <>Checked in at {getIndianTime()} IST</>
                  ) : (
                    <>Checked out at {getIndianTime()} IST</>
                  )}
                </p>

                {/* ✅ Voice indicator in success popup */}
                {isSpeaking && (
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <div className="flex items-center gap-0.5">
                      <div className="w-1 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: "0s" }}></div>
                      <div className="w-1 h-3 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                      <div className="w-1 h-4 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                      <div className="w-1 h-3 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: "0.6s" }}></div>
                      <div className="w-1 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: "0.8s" }}></div>
                    </div>
                    <span className="text-xs text-green-600 font-medium">🔊 Speaking...</span>
                  </div>
                )}

                <button
                  onClick={handleCloseSuccessPopup}
                  disabled={isPopupClosing}
                  className="mt-3 w-full py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/30 transition-all duration-200 transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* WELCOME POPUP */}
        {showWelcomePopup && employeeName && motivationalThought && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {particles.map((particle) => (
                <div
                  key={particle.id}
                  className="absolute rounded-full animate-float"
                  style={{
                    left: `${particle.x}%`,
                    top: `${particle.y}%`,
                    width: `${particle.size}px`,
                    height: `${particle.size}px`,
                    backgroundColor: particle.color,
                    opacity: 0.5,
                    animationDuration: `${particle.duration}s`,
                    animationDelay: `${particle.delay}s`,
                  }}
                />
              ))}
            </div>

            <div className="relative bg-gradient-to-br from-white via-indigo-50/95 to-purple-50/95 rounded-3xl shadow-2xl max-w-sm w-full p-5 transform animate-scale-up border border-white/30">
              <button
                onClick={handleCloseWelcomePopup}
                className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-white/80 hover:bg-red-50 hover:text-red-500 transition-all duration-300 shadow-md hover:shadow-lg transform hover:rotate-90"
                aria-label="Close"
              >
                <FaTimes className="text-gray-600 hover:text-red-500 transition-colors text-sm" />
              </button>

              {isSpeaking && (
                <div className="absolute top-2 right-12 flex items-center gap-1">
                  <div className="flex items-center gap-0.5">
                    <div className="w-1 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: "0s" }}></div>
                    <div className="w-1 h-3 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-1 h-4 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                    <div className="w-1 h-3 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: "0.6s" }}></div>
                    <div className="w-1 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: "0.8s" }}></div>
                  </div>
                  <span className="text-[10px] font-medium text-purple-600">🔊</span>
                </div>
              )}

              <div className="relative">
                <div className="flex justify-center mb-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl blur-lg opacity-30 animate-pulse"></div>
                    <div className="relative w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                      <span className="text-3xl animate-bounce" style={{ animationDuration: "2s" }}>
                        {greetingEmoji || "🌟"}
                      </span>
                    </div>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-center text-gray-900">
                  {greetingMessage}, {employeeName}! 👋
                </h2>

                <div className="mt-2 text-center space-y-0.5">
                  <p className="text-xs text-indigo-600 font-medium flex items-center justify-center gap-1">
                    <FaCalendarAlt className="text-indigo-500 text-xs" />
                    {currentIndianDate}
                  </p>
                  <p className="text-xs text-purple-600 font-medium flex items-center justify-center gap-1">
                    <FaClock className="text-purple-500 text-xs" />
                    {currentIndianTime} IST
                  </p>
                </div>

                <div className="mt-2 p-2.5 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 rounded-xl border border-indigo-100/50">
                  <div className="flex items-start gap-1.5">
                    <FaQuoteLeft className="text-indigo-400 text-xs mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-700 text-center leading-relaxed">
                      {motivationalThought.emoji} {motivationalThought.text}
                    </p>
                    <FaQuoteRight className="text-indigo-400 text-xs mt-0.5 flex-shrink-0" />
                  </div>
                </div>

                <button
                  onClick={replayVoice}
                  className="mt-2 w-full py-1.5 rounded-xl text-xs font-medium bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/25 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <FaVolumeUp className="text-white text-xs" />
                  <span>🔊 Listen Again</span>
                </button>

                <button
                  onClick={handleCloseWelcomePopup}
                  className="mt-2 w-full relative group py-2 rounded-xl text-sm font-bold text-white overflow-hidden transition-all duration-300 transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-indigo-500/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 group-hover:from-indigo-600 group-hover:via-purple-600 group-hover:to-pink-600 transition-all duration-300"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-700"></div>
                  <span className="relative flex items-center justify-center gap-2 text-sm">
                    <FaRocket className="text-white group-hover:animate-bounce" />
                    Let's Get Started
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header with Time */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg shadow-indigo-500/8 border border-white/70 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-1.5">
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-75"></div>
              </div>
              <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">Live</span>
            </div>
            <div className="w-px h-5 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
            <span className="text-xs font-semibold text-gray-600">{currentDate}</span>
            <div className="w-px h-5 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
            <span className="text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{currentTime}</span>
          </div>
        </div>

        {/* Employee Info Card */}
        <div className="relative overflow-hidden bg-white/85 backdrop-blur-2xl rounded-3xl shadow-xl shadow-indigo-500/5 border border-white/60 p-5 mb-4 group hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-400/15 to-purple-400/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:from-indigo-400/25 group-hover:to-purple-400/25 transition-all duration-700"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

          <div className="relative flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur-md opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
              <div className="relative w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 ring-2 ring-white/50">
                <span className="text-2xl font-bold text-white drop-shadow-sm">
                  {employeeName ? employeeName.charAt(0).toUpperCase() : "U"}
                </span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-sm">
                <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-50"></div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-gray-900 truncate">{employeeName || "Employee"}</h2>
              <p className="text-sm font-semibold flex items-center gap-1.5">
                <FaUsers className="text-indigo-500 text-xs" />
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{employeeDepartment || "Department"}</span>
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-gray-500 flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-full">
                  <BsPersonBadge className="text-gray-400" />
                  {employeeId || "N/A"}
                </span>
                <span className="text-[10px] text-gray-500 truncate flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-full">
                  <span className="text-gray-400 text-[8px]">✉️</span>
                  {employeeEmail || "email"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Location Card */}
        <div className="bg-white/85 backdrop-blur-2xl rounded-3xl shadow-xl shadow-indigo-500/5 border border-white/60 p-4 mb-4 hover:shadow-2xl hover:shadow-indigo-500/8 transition-all duration-500">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center shadow-sm">
                <FaMapMarkerAlt className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Location</h3>
                <p className="text-[10px] text-gray-400 font-medium">Office geofence tracking</p>
              </div>
            </div>
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-all bg-indigo-50 px-3 py-1.5 rounded-xl hover:bg-indigo-100 border border-indigo-100 shadow-sm uppercase tracking-wider"
            >
              Change
            </button>
          </div>

          {loadingLocation ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ) : assignedLocation ? (
            <div>
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 rounded-xl border border-indigo-100/50">
                <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaBuilding className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {assignedLocation.name || "Unnamed Location"}
                  </h4>
                  <p className="text-xs text-gray-500">Radius: {ONSITE_RADIUS_M}m</p>
                </div>
                {position && (
                  <div
                    className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                      distance <= ONSITE_RADIUS_M
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {distance}m
                  </div>
                )}
              </div>

              {position && distance != null && !checkedIn && (
                <div className="mt-3 p-3 bg-gray-50/80 rounded-xl">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs text-gray-600 flex items-center gap-1">
                      <FaWifi className="text-gray-400" />
                      Distance from office
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        distance <= ONSITE_RADIUS_M ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {distance}m
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        distance <= ONSITE_RADIUS_M
                          ? "bg-gradient-to-r from-green-400 to-green-500"
                          : "bg-gradient-to-r from-red-400 to-red-500"
                      }`}
                      style={{ width: `${Math.min((distance / ONSITE_RADIUS_M) * 100, 100)}%` }}
                    ></div>
                  </div>
                  {distance > ONSITE_RADIUS_M && !isOnsiteOnlyDepartment && (
                    <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                      <span>⚠️</span> Outside office radius - Reason required
                    </p>
                  )}
                </div>
              )}

              <button
                onClick={fetchLocation}
                className="w-full mt-3 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <FaMapMarkerAlt className="w-4 h-4" />
                <span>{!position ? "Get Location" : "Update Location"}</span>
              </button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">No location assigned. Contact admin.</p>
            </div>
          )}
        </div>

        {/* Reason Selection */}
        {!checkedIn && !isOnsiteOnlyDepartment && distance > ONSITE_RADIUS_M && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-sm">⚠️</span>
              </div>
              <span className="text-sm font-medium text-gray-900">Reason Required</span>
              <span className="ml-auto text-xs text-red-500 font-medium">Outside: {distance}m</span>
            </div>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2.5 text-sm border border-gray-200 rounded-xl bg-white/50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              <option value="">-- Select Reason --</option>
              <option value="Field Work">📋 Field Work</option>
              <option value="Work From Home">🏠 Work From Home</option>
              <option value="Client Meeting">🤝 Client Meeting</option>
              <option value="Other">📝 Other</option>
            </select>
          </div>
        )}

        {/* Onsite-only department warning */}
        {!checkedIn && isOnsiteOnlyDepartment && distance > ONSITE_RADIUS_M && (
          <div className="bg-red-50/80 backdrop-blur-sm rounded-3xl shadow-xl border border-red-200/50 p-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-lg">🚫</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-red-800">
                  {employeeDepartment} department must be within {ONSITE_RADIUS_M}m
                </p>
                <p className="text-xs text-red-600 mt-0.5">Current distance: {distance}m</p>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Swipe Card */}
        <div className="bg-white/85 backdrop-blur-2xl rounded-3xl shadow-xl shadow-indigo-500/5 border border-white/60 p-5 hover:shadow-2xl hover:shadow-indigo-500/8 transition-all duration-500">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <div className="w-7 h-7 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                  <BsCalendarCheck className="text-indigo-600 text-xs" />
                </div>
                Today's Attendance
              </h3>
              <p className="text-[10px] text-gray-400 font-medium mt-0.5 ml-9">
                {!checkedIn ? "Ready to mark attendance" : "Currently on duty"}
              </p>
            </div>
            <div
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border shadow-sm ${
                !checkedIn
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
              }`}
            >
              {!checkedIn ? "Pending" : "Active ✅"}
            </div>
          </div>

          <div className="text-center mb-3">
            <p className="text-xs text-gray-500 font-medium flex items-center justify-center gap-2">
              {!checkedIn ? (
                <>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 rounded-full text-indigo-600">
                    <FaArrowRight className="text-[9px] animate-bounce-x" />
                    <span className="text-[10px] font-semibold">Swipe right to check in</span>
                  </span>
                </>
              ) : (
                <>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 rounded-full text-red-600">
                    <FaArrowLeft className="text-[9px] animate-bounce-x-reverse" />
                    <span className="text-[10px] font-semibold">Swipe left to check out</span>
                  </span>
                </>
              )}
            </p>
          </div>

          <div className="mb-3">
            <div
              ref={swipeAreaRef}
              className={`relative overflow-hidden rounded-2xl ${
                submitting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
              onClick={handleManualSwipe}
            >
              {!checkedIn ? (
                <div className="relative h-16 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/30">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 opacity-60"
                    style={{ width: `${swipeProgress * 100}%`, transition: isSwiping ? "none" : "width 0.3s ease-out" }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shimmer"></div>
                  <div className="absolute inset-0 flex items-center justify-between px-5">
                    <div className="flex items-center gap-2.5 text-white">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 shadow-inner">
                        <FaCheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="text-sm font-extrabold tracking-wide">CHECK IN</span>
                        <p className="text-[9px] text-white/70 font-medium">Mark your attendance</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/80">
                      <span className="text-[10px] font-semibold">Swipe</span>
                      <div className="flex gap-0.5 animate-bounce-x">
                        <FaArrowRight className="w-3 h-3 opacity-40" />
                        <FaArrowRight className="w-3 h-3 opacity-70" />
                        <FaArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative h-16 bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 shadow-lg shadow-red-500/30">
                  <div
                    className="absolute inset-y-0 right-0 bg-gradient-to-r from-red-400 to-orange-400 opacity-60"
                    style={{ width: `${swipeProgress * 100}%`, transition: isSwiping ? "none" : "width 0.3s ease-out" }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                  <div className="absolute inset-0 flex items-center justify-between px-5">
                    <div className="flex items-center gap-1.5 text-white/80">
                      <div className="flex gap-0.5 animate-bounce-x-reverse">
                        <FaArrowLeft className="w-3 h-3" />
                        <FaArrowLeft className="w-3 h-3 opacity-70" />
                        <FaArrowLeft className="w-3 h-3 opacity-40" />
                      </div>
                      <span className="text-[10px] font-semibold">Swipe</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-white">
                      <div>
                        <span className="text-sm font-extrabold tracking-wide">CHECK OUT</span>
                        <p className="text-[9px] text-white/70 font-medium text-right">End your shift</p>
                      </div>
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 shadow-inner">
                        <FaTimes className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <p className="text-center text-[10px] text-gray-400 mt-2 font-medium">
              {!checkedIn ? "📍 Capture your location first, then swipe to check in" : "👆 Tap or swipe the bar to check out"}
            </p>
          </div>

          {submitting && (
            <div className="text-center py-3">
              <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 shadow-sm">
                <FaSpinner className="w-4 h-4 text-indigo-600 animate-spin" />
                <span className="text-sm text-indigo-700 font-semibold">Processing...</span>
              </div>
            </div>
          )}
        </div>

        <div className="text-center mt-5 space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm">
            <span className="text-[10px]">📍</span>
            <p className="text-[10px] text-gray-500 font-medium">
              {isOnsiteOnlyDepartment
                ? `${employeeDepartment}: Must be within ${ONSITE_RADIUS_M}m of office`
                : "Location required • Outside radius needs reason"}
            </p>
          </div>
          <p className="text-[9px] text-gray-300 font-medium">Powered by Timely Health HRMS</p>
        </div>
      </div>

      {/* Location Selection Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col animate-scale-in">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FaBuilding className="text-indigo-500" />
                Select Location
              </h3>
              <button
                onClick={() => setIsLocationModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-4 flex-1 overflow-hidden">
              <div className="relative mb-3">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
                <input
                  type="text"
                  placeholder="Search location..."
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="overflow-y-auto max-h-[50vh] space-y-2">
                {filteredLocations.length > 0 ? (
                  filteredLocations.map((loc) => (
                    <div
                      key={loc._id}
                      onClick={() => handleSelectLocation(loc)}
                      className="p-3 border border-gray-100 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/50 cursor-pointer transition-all"
                    >
                      <h4 className="font-medium text-gray-900">{loc.name}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{loc.fullAddress || "No address"}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No locations found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-up {
          from { opacity: 0; transform: scale(0.9) translateY(15px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(180deg); }
        }
        @keyframes orb-float {
          0%, 100% { transform: translateY(0px) translateX(0px) scale(1); }
          25% { transform: translateY(-20px) translateX(10px) scale(1.05); }
          50% { transform: translateY(-10px) translateX(-15px) scale(0.95); }
          75% { transform: translateY(-25px) translateX(5px) scale(1.02); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes bounce-x {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(4px); }
        }
        @keyframes bounce-x-reverse {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-4px); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-scale-up { animation: scale-up 0.35s ease-out; }
        .animate-scale-in { animation: scale-up 0.25s ease-out; }
        .animate-float { animation: float infinite ease-in-out; }
        .animate-orb-float { animation: orb-float infinite ease-in-out; }
        .animate-shimmer { animation: shimmer 2.5s infinite ease-in-out; }
        .animate-bounce-x { animation: bounce-x 1.5s infinite ease-in-out; }
        .animate-bounce-x-reverse { animation: bounce-x-reverse 1.5s infinite ease-in-out; }
        .animate-bounce {
          animation: bounce 2s infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}