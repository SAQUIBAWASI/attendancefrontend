

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
  FaMapMarkerAlt,
  FaCamera,
  FaSpinner,
  FaCheck,
  FaTimes,
  FaArrowRight,
  FaArrowLeft,
  FaCalendarAlt,
  FaClock,
  FaBuilding,
  FaWifi,
  FaRedo,
  FaExclamationTriangle,
  FaRocket,
  FaVolumeUp
} from "react-icons/fa";
import { BsCamera, BsCalendarCheck } from "react-icons/bs";

const BASE_URL = API_BASE_URL.endsWith("/") ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
const cleanBaseUrl = BASE_URL.replace(/\/api\/?$/, "");

const ONSITE_RADIUS_M = 50;
const ONSITE_ONLY_DEPARTMENTS = ["Laboratory Medicine", "Medical", "Nursing"];

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

const base64ToFile = (base64String, filename) => {
  try {
    const arr = base64String.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  } catch (error) {
    console.error("Error converting base64 to file:", error);
    return null;
  }
};

// --- Camera Shutter Sound ---
const playShutterSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioContext.currentTime;
    
    const osc1 = audioContext.createOscillator();
    const gain1 = audioContext.createGain();
    osc1.connect(gain1);
    gain1.connect(audioContext.destination);
    osc1.frequency.value = 1500;
    osc1.type = "square";
    gain1.gain.setValueAtTime(0.05, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc1.start(now);
    osc1.stop(now + 0.05);
    
    const osc2 = audioContext.createOscillator();
    const gain2 = audioContext.createGain();
    osc2.connect(gain2);
    gain2.connect(audioContext.destination);
    osc2.frequency.value = 1200;
    osc2.type = "square";
    gain2.gain.setValueAtTime(0.05, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.13);
  } catch (e) {
    console.log("Audio not supported");
  }
};

// --- Success Sound ---
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

// --- Female Voice Functions ---
const getFemaleVoice = (voices) => {
  let femaleVoice = voices.find(
    (voice) =>
      voice.name.toLowerCase().includes("female") ||
      voice.name.toLowerCase().includes("woman") ||
      voice.name.toLowerCase().includes("girl") ||
      voice.name.toLowerCase().includes("zira") ||
      voice.name.toLowerCase().includes("samantha") ||
      voice.name.toLowerCase().includes("victoria") ||
      voice.name.toLowerCase().includes("google uk english female") ||
      voice.name.toLowerCase().includes("siri") ||
      voice.name.toLowerCase().includes("alexa")
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
        setTimeout(() => trySpeak(attempt + 1), 300);
      }
    };
    
    trySpeak();
  });
};

const speakCheckInSuccess = async (name) => {
  const message = `Hello ${name}! You have successfully checked in. Have a great day!`;
  return speakWithRetry(message);
};

const speakCheckOutSuccess = async (name) => {
  const message = `Hello ${name}! You have successfully checked out. Thank you!`;
  return speakWithRetry(message);
};

export default function AttendanceCapture() {
  const navigate = useNavigate();
  const routerLocation = useLocation();

  // Camera refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Employee State
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
  const [isImageCaptureAllowed, setIsImageCaptureAllowed] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Camera State
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [cameraMode, setCameraMode] = useState("checkin");

  // UI State
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [toastMessage, setToastMessage] = useState(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showReasonPopup, setShowReasonPopup] = useState(false);
  const [tempReason, setTempReason] = useState("");
  const [pendingAction, setPendingAction] = useState(null);
  const [isReasonProcessing, setIsReasonProcessing] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [allLocations, setAllLocations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Welcome Popup State
  const [showWelcomePopup, setShowWelcomePopup] = useState(() => {
    return localStorage.getItem("hasSeenWelcomePopup") !== "true";
  });

  // Get employee data
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

  // Fetch employee data for image capture permission
  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!employeeId) return;
      try {
        const url = `${cleanBaseUrl}/api/employees/get-employee?employeeId=${employeeId}`;
        const res = await axios.get(url);
        if (res.data.success && res.data.data) {
          const employeeData = res.data.data;
          const isAllowed = employeeData.isAllowedImageCapturedAttendance === "true" ||
            employeeData.isAllowedImageCapturedAttendance === true;
          setIsImageCaptureAllowed(isAllowed);
          if (employeeData.name) setEmployeeName(employeeData.name);
          if (employeeData.department) setEmployeeDepartment(employeeData.department);
        }
      } catch (err) {
        console.error("Error fetching employee data:", err);
      }
    };
    if (employeeId) fetchEmployeeData();
  }, [employeeId]);

  // Fetch assigned location
  useEffect(() => {
    const fetchAssignedLocation = async () => {
      if (!employeeId) return;
      setLoadingLocation(true);
      try {
        const url = `${cleanBaseUrl}/api/employees/mylocation/${employeeId}`;
        const res = await axios.get(url);
        if (res.data) {
          let locationData = null;
          if (res.data.success && res.data.data) {
            locationData = res.data.data.location || res.data.data;
          } else if (res.data.location) {
            locationData = res.data.location;
          } else if (res.data.data) {
            locationData = res.data.data;
          } else if (res.data.latitude || res.data.coordinates) {
            locationData = res.data;
          }
          if (locationData) {
            setAssignedLocation(locationData);
          }
        }
      } catch (err) {
        console.error("Error fetching location:", err);
      } finally {
        setLoadingLocation(false);
      }
    };
    if (employeeId) fetchAssignedLocation();
  }, [employeeId]);

  // Fetch all locations
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

  // Fetch today's attendance
  useEffect(() => {
    const fetchTodayAttendance = async () => {
      if (!employeeId) return;
      try {
        const url = `${cleanBaseUrl}/api/attendance/myattendance/${employeeId}`;
        const res = await axios.get(url);
        const records = res.data.records || [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayRecord = records.find((rec) => {
          const checkInTime = new Date(rec.checkInTime);
          return checkInTime >= today && (rec.status === "checked-in" || rec.status === "on-break");
        });
        setCheckedIn(!!todayRecord);
      } catch (err) {
        console.error("Error fetching attendance:", err);
      }
    };
    if (employeeId) fetchTodayAttendance();
  }, [employeeId]);

  // Update time
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
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Get location
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported"));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
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
          resolve(coords);
        },
        (err) => {
          reject(new Error("Error getting location: " + err.message));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  };

  // Camera functions
  const startCamera = async () => {
    try {
      setCameraError(null);
      const constraints = {
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraReady(true);
      }
    } catch (err) {
      setCameraError("Unable to access camera. Please check permissions.");
      setIsCameraReady(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraReady(false);
    setCapturedImage(null);
  };

  const handleCloseCamera = () => {
    stopCamera();
    setShowCameraModal(false);
    setCapturedImage(null);
    setIsCapturing(false);
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedImage(imageData);
    playShutterSound();
    return imageData;
  };

  // --- Instant Capture ---
  const handleCaptureNow = () => {
    if (!videoRef.current || !isCameraReady) {
      alert("Camera is not ready. Please wait.");
      return;
    }
    
    setIsCapturing(true);
    const imageData = captureImage();
    
    if (imageData) {
      setTimeout(() => {
        if (cameraMode === "checkin") {
          const isOnsiteOnlyDepartment = ONSITE_ONLY_DEPARTMENTS.includes(employeeDepartment);
          if (!isOnsiteOnlyDepartment && distance > ONSITE_RADIUS_M && !reason.trim()) {
            if (!isReasonProcessing && !showReasonPopup) {
              setPendingAction("submit");
              setTempReason("");
              setShowReasonPopup(true);
              setIsCapturing(false);
            }
            return;
          }
          handleSubmitCheckIn(imageData);
        } else {
          handleSubmitCheckOut(imageData);
        }
      }, 300);
    } else {
      setIsCapturing(false);
      alert("Failed to capture image. Please try again.");
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setIsCapturing(false);
    if (videoRef.current && isCameraReady) {
      videoRef.current.play().catch((err) => console.error("Error resuming video:", err));
    }
  };

  // Submit functions
  const handleSubmitCheckIn = async (imageData) => {
    if (!employeeId || !employeeEmail) {
      alert("Employee data missing.");
      setIsCapturing(false);
      return;
    }

    try {
      await getCurrentLocation();
    } catch (err) {
      alert("Could not get location: " + err.message);
      setIsCapturing(false);
      return;
    }

    const isOnsiteOnlyDepartment = ONSITE_ONLY_DEPARTMENTS.includes(employeeDepartment);

    if (isOnsiteOnlyDepartment && distance > ONSITE_RADIUS_M) {
      alert(`Outside office range (${distance}m). Must be within ${ONSITE_RADIUS_M}m.`);
      setIsCapturing(false);
      return;
    }

    if (!isOnsiteOnlyDepartment && distance > ONSITE_RADIUS_M && !reason.trim()) {
      if (!isReasonProcessing && !showReasonPopup) {
        setPendingAction("submit");
        setTempReason("");
        setShowReasonPopup(true);
      }
      return;
    }

    setSubmitting(true);
    try {
      const imageFile = base64ToFile(imageData, `checkin-${employeeId}-${Date.now()}.jpg`);
      if (!imageFile) {
        alert("Failed to process image.");
        setIsCapturing(false);
        setSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append("employeeId", employeeId);
      formData.append("employeeEmail", employeeEmail);
      formData.append("latitude", position.lat.toString());
      formData.append("longitude", position.lng.toString());
      formData.append("reason", isOnsiteOnlyDepartment ? "Onsite" : reason || "Onsite");
      formData.append("image", imageFile);

      await axios.post(`${cleanBaseUrl}/api/attendance/checkin`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      handleCloseCamera();
      setIsCapturing(false);
      setSuccessMessage("✅ Check-in Successful with Photo! 📸");
      setShowSuccessPopup(true);
      setCheckedIn(true);
      
      // Play success sound and speak
      playSuccessSound();
      setTimeout(async () => {
        setIsSpeaking(true);
        await speakCheckInSuccess(employeeName);
        setIsSpeaking(false);
      }, 500);
      
    } catch (err) {
      alert(err.response?.data?.message || "Check-in failed.");
      setIsCapturing(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitCheckOut = async (imageData) => {
    if (!employeeId) {
      alert("Employee data missing.");
      setIsCapturing(false);
      return;
    }

    let lat = null;
    let lng = null;
    try {
      const coords = await getCurrentLocation();
      lat = coords.lat;
      lng = coords.lng;
    } catch (err) {}

    setSubmitting(true);
    try {
      const imageFile = base64ToFile(imageData, `checkout-${employeeId}-${Date.now()}.jpg`);
      if (!imageFile) {
        alert("Failed to process image.");
        setIsCapturing(false);
        setSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append("employeeId", employeeId);
      if (lat && lng) {
        formData.append("latitude", lat.toString());
        formData.append("longitude", lng.toString());
      }
      formData.append("image", imageFile);

      await axios.post(`${cleanBaseUrl}/api/attendance/checkout`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      handleCloseCamera();
      setIsCapturing(false);
      setSuccessMessage("✅ Check-out Successful with Photo! 📸");
      setShowSuccessPopup(true);
      setCheckedIn(false);
      
      // Play success sound and speak
      playSuccessSound();
      setTimeout(async () => {
        setIsSpeaking(true);
        await speakCheckOutSuccess(employeeName);
        setIsSpeaking(false);
      }, 500);
      
    } catch (err) {
      alert(err.response?.data?.message || "Check-out failed.");
      setIsCapturing(false);
    } finally {
      setSubmitting(false);
    }
  };

  // Normal Check-in (without camera)
  const handleNormalCheckIn = async () => {
    if (!position) {
      alert("Please get your location first.");
      return;
    }
    if (!employeeId || !employeeEmail) {
      alert("Employee data missing.");
      return;
    }

    const isOnsiteOnlyDepartment = ONSITE_ONLY_DEPARTMENTS.includes(employeeDepartment);

    if (isOnsiteOnlyDepartment && distance > ONSITE_RADIUS_M) {
      alert(`Outside office range (${distance}m). Must be within ${ONSITE_RADIUS_M}m.`);
      return;
    }
    if (!isOnsiteOnlyDepartment && distance > ONSITE_RADIUS_M && !reason.trim()) {
      alert("Outside office range. Please select a reason.");
      return;
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

      setSuccessMessage("✅ Check-in Successful!");
      setShowSuccessPopup(true);
      setCheckedIn(true);
      
      playSuccessSound();
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

  // Normal Check-out (without camera)
  const handleNormalCheckOut = async () => {
    if (!employeeId) return alert("Employee data missing.");

    let lat = null;
    let lng = null;
    if (position) {
      lat = position.lat;
      lng = position.lng;
    } else {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        },
        () => {},
        { enableHighAccuracy: true, timeout: 5000 }
      );
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
      setSuccessMessage("✅ Check-out Successful!");
      setShowSuccessPopup(true);
      setCheckedIn(false);
      
      playSuccessSound();
      setTimeout(async () => {
        setIsSpeaking(true);
        await speakCheckOutSuccess(employeeName);
        setIsSpeaking(false);
      }, 500);
      
    } catch (err) {
      alert(err.response?.data?.message || "Check-out failed.");
    } finally {
      setSubmitting(false);
    }
  };

  // Open camera handlers
  const handleOpenCameraForCheckIn = async () => {
    if (checkedIn) {
      alert("Already checked in today.");
      return;
    }

    try {
      await getCurrentLocation();
    } catch (err) {
      alert(err.message);
      return;
    }

    const isOnsiteOnlyDepartment = ONSITE_ONLY_DEPARTMENTS.includes(employeeDepartment);

    if (isOnsiteOnlyDepartment && distance > ONSITE_RADIUS_M) {
      alert(`Department must be within ${ONSITE_RADIUS_M}m. Current distance: ${distance}m`);
      return;
    }

    if (!isOnsiteOnlyDepartment && distance > ONSITE_RADIUS_M) {
      setPendingAction("camera");
      setTempReason("");
      setShowReasonPopup(true);
      return;
    }

    setCameraMode("checkin");
    setShowCameraModal(true);
    setTimeout(() => startCamera(), 300);
  };

  const handleOpenCameraForCheckOut = async () => {
    if (!checkedIn) {
      alert("Not checked in yet.");
      return;
    }

    try {
      await getCurrentLocation();
    } catch (err) {}

    setCameraMode("checkout");
    setShowCameraModal(true);
    setTimeout(() => startCamera(), 300);
  };

  // Reason popup handlers
  const handleReasonConfirm = () => {
    if (!tempReason.trim()) {
      alert("Please select a reason.");
      return;
    }
    setIsReasonProcessing(true);
    setReason(tempReason);
    setShowReasonPopup(false);

    setTimeout(() => {
      if (pendingAction === "camera") {
        setCameraMode("checkin");
        setShowCameraModal(true);
        setTimeout(() => startCamera(), 300);
      } else if (pendingAction === "submit") {
        if (cameraMode === "checkin") {
          handleSubmitCheckIn(capturedImage);
        } else {
          handleSubmitCheckOut(capturedImage);
        }
      }
      setPendingAction(null);
      setIsReasonProcessing(false);
    }, 300);
  };

  const handleReasonCancel = () => {
    setShowReasonPopup(false);
    setTempReason("");
    setPendingAction(null);
    setIsReasonProcessing(false);
  };

  const handleGetLocation = async () => {
    try {
      await getCurrentLocation();
      setToastMessage({ text: "📍 Location captured!", type: "success" });
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      setToastMessage({ text: "❌ " + err.message, type: "error" });
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

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

  const isOnsiteOnlyDepartment = ONSITE_ONLY_DEPARTMENTS.includes(employeeDepartment);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/80 to-purple-50/60 p-4 relative">
      {/* Toast Message */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
          <div
            className={`px-6 py-3 rounded-2xl shadow-2xl backdrop-blur-sm ${
              toastMessage.type === "success"
                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                : "bg-gradient-to-r from-red-500 to-rose-500 text-white"
            } font-medium text-sm flex items-center gap-2.5 border border-white/20`}
          >
            <span className="text-lg">{toastMessage.type === "success" ? "✅" : "❌"}</span>
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 transform animate-scale-up border border-green-200/50">
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                  <div className="relative w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                    <span className="text-3xl">✅</span>
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900">{successMessage}</h3>
              
              {isSpeaking && (
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <div className="flex items-center gap-0.5">
                    <div className="w-1 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: "0s" }}></div>
                    <div className="w-1 h-3 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-1 h-4 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                    <div className="w-1 h-3 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: "0.6s" }}></div>
                    <div className="w-1 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: "0.8s" }}></div>
                  </div>
                  <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                    <FaVolumeUp className="text-xs" /> Speaking...
                  </span>
                </div>
              )}
              
              <button
                onClick={() => {
                  setShowSuccessPopup(false);
                  setTimeout(() => {
                    window.location.reload();
                  }, 300);
                }}
                className="mt-4 w-full py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/30 transition-all duration-200 transform hover:scale-[1.02] active:scale-95"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reason Popup */}
      {showReasonPopup && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 transform animate-scale-up border border-yellow-200/50">
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
                  <div className="relative w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/30">
                    <span className="text-3xl">⚠️</span>
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Outside Office Range</h3>
              <p className="text-sm text-gray-600 mt-1">
                You are <span className="font-bold text-red-500">{distance}m</span> away from the office.
                <br />
                <span className="text-xs text-gray-500">Please select a reason for check-in.</span>
              </p>
              <div className="mt-4">
                <select
                  value={tempReason}
                  onChange={(e) => setTempReason(e.target.value)}
                  className="w-full p-3 text-sm border border-gray-200 rounded-xl bg-gray-50/50 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                >
                  <option value="">-- Select Reason --</option>
                  <option value="Field Work">📋 Field Work</option>
                  <option value="Work From Home">🏠 Work From Home</option>
                  <option value="Client Meeting">🤝 Client Meeting</option>
                  <option value="Other">📝 Other</option>
                </select>
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={handleReasonCancel}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReasonConfirm}
                  disabled={isReasonProcessing}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 shadow-lg shadow-yellow-500/30 transition-all duration-200 transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                >
                  {isReasonProcessing ? "Processing..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Camera Modal */}
      {showCameraModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[95vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <FaCamera className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {cameraMode === "checkin" ? "Check In Photo" : "Check Out Photo"}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    {cameraMode === "checkin" ? "For attendance verification" : "For checkout verification"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseCamera}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 hover:bg-red-50 hover:text-red-500 transition-all duration-300 shadow-md hover:shadow-lg transform hover:rotate-90"
              >
                <FaTimes className="text-gray-600 hover:text-red-500 transition-colors text-lg" />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-hidden flex flex-col">
              <div className="relative bg-black rounded-2xl overflow-hidden aspect-[4/3] flex items-center justify-center">
                {capturedImage ? (
                  <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover ${!isCameraReady ? "hidden" : ""}`}
                    />
                    {!isCameraReady && !cameraError && (
                      <div className="text-center text-white">
                        <FaSpinner className="w-10 h-10 animate-spin mx-auto mb-3 text-indigo-400" />
                        <p className="text-base font-medium">Starting camera...</p>
                      </div>
                    )}
                    {cameraError && (
                      <div className="text-center text-white p-4">
                        <FaExclamationTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                        <p className="text-sm font-medium text-red-400">{cameraError}</p>
                        <button
                          onClick={startCamera}
                          className="mt-3 px-5 py-2.5 bg-indigo-600 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
                        >
                          Retry
                        </button>
                      </div>
                    )}
                  </>
                )}

                {!capturedImage && isCameraReady && !isCapturing && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 border-2 border-white/20 rounded-2xl"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 border border-white/10 rounded-full"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-center gap-4">
                {capturedImage ? (
                  <>
                    <button
                      onClick={handleRetake}
                      className="px-6 py-3 rounded-xl text-sm font-medium bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors flex items-center gap-2"
                    >
                      <FaRedo className="text-base" /> Retake
                    </button>
                    <button
                      onClick={() => {
                        if (capturedImage) {
                          if (cameraMode === "checkin") {
                            const isOnsiteOnlyDepartment = ONSITE_ONLY_DEPARTMENTS.includes(employeeDepartment);
                            if (!isOnsiteOnlyDepartment && distance > ONSITE_RADIUS_M && !reason.trim()) {
                              if (!isReasonProcessing && !showReasonPopup) {
                                setPendingAction("submit");
                                setTempReason("");
                                setShowReasonPopup(true);
                                setIsCapturing(false);
                              }
                              return;
                            }
                            handleSubmitCheckIn(capturedImage);
                          } else {
                            handleSubmitCheckOut(capturedImage);
                          }
                        }
                      }}
                      disabled={submitting}
                      className="px-8 py-3 rounded-xl text-base font-bold text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/30 transition-all duration-200 flex items-center gap-3 disabled:opacity-50"
                    >
                      {submitting ? <FaSpinner className="animate-spin text-lg" /> : <FaCheck className="text-lg" />}
                      Submit
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleCloseCamera}
                      className="px-6 py-3 rounded-xl text-sm font-medium bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCaptureNow}
                      disabled={!isCameraReady || isCapturing}
                      className="relative px-10 py-3 rounded-xl text-base font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg shadow-indigo-500/30 transition-all duration-200 flex items-center gap-3 disabled:opacity-50"
                    >
                      {isCapturing ? (
                        <>
                          <FaSpinner className="animate-spin text-lg" /> Capturing...
                        </>
                      ) : (
                        <>
                          <BsCamera className="text-lg" /> Capture Now
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>

              <div className="mt-3 text-center">
                <p className="text-xs text-gray-400 font-medium">
                  {capturedImage
                    ? "✅ Photo captured! Click Submit to continue."
                    : "📸 Click 'Capture Now' to take a photo instantly"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Main UI */}
      <div className="max-w-md mx-auto">
        {/* Header - Time Only */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg shadow-indigo-500/8 border border-white/70">
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

        {/* Combined Card - Location + Attendance + Status */}
        <div className="bg-white/85 backdrop-blur-2xl rounded-3xl shadow-xl shadow-indigo-500/5 border border-white/60 p-5 hover:shadow-2xl hover:shadow-indigo-500/8 transition-all duration-500">
          
          {/* Row 1: Location Header with Change button */}
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center shadow-sm">
                <FaMapMarkerAlt className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Location</h3>
                <p className="text-[10px] text-gray-400 font-medium">
                  {isImageCaptureAllowed ? "Auto-detected on capture" : "Get location to check in"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-all bg-indigo-50 px-3 py-1.5 rounded-xl hover:bg-indigo-100 border border-indigo-100 shadow-sm uppercase tracking-wider"
            >
              Change
            </button>
          </div>

          {/* Row 2: Location details - Always visible */}
          {loadingLocation ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ) : assignedLocation ? (
            <>
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
                      distance <= ONSITE_RADIUS_M ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {distance}m
                  </div>
                )}
              </div>

              {/* Row 3: Distance bar - Only if position exists */}
              {position && distance != null && !checkedIn && (
                <div className="mt-3 p-3 bg-gray-50/80 rounded-xl">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs text-gray-600 flex items-center gap-1">
                      <FaWifi className="text-gray-400" /> Distance from office
                    </span>
                    <span className={`text-sm font-bold ${distance <= ONSITE_RADIUS_M ? "text-green-600" : "text-red-600"}`}>
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

              {/* Row 4: Location status - Always visible */}
              <div className="mt-3 p-2.5 bg-indigo-50/60 rounded-xl text-center border border-indigo-100/50">
                <p className="text-xs text-indigo-600 font-medium flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {position
                    ? "📍 Location captured automatically"
                    : `📍 ${isImageCaptureAllowed ? "Location will be captured when you mark attendance" : "Click 'Get Location' to capture"}`}
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">No location assigned. Contact admin.</p>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-gray-100/80 my-4"></div>

          {/* Row 5: Attendance Section */}
          <div>
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
                  !checkedIn ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}
              >
                {!checkedIn ? "Pending" : "Active ✅"}
              </div>
            </div>

            {/* Onsite-only warning */}
            {!checkedIn && isOnsiteOnlyDepartment && distance !== null && distance > ONSITE_RADIUS_M && (
              <div className="bg-red-50/80 backdrop-blur-sm rounded-xl border border-red-200/50 p-3 mb-3">
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">🚫</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-red-800">
                      {employeeDepartment} dept must be within {ONSITE_RADIUS_M}m
                    </p>
                    <p className="text-[10px] text-red-600">Current: {distance}m</p>
                  </div>
                </div>
              </div>
            )}

            {/* Reason selector for swipe mode */}
            {!checkedIn && !isImageCaptureAllowed && !isOnsiteOnlyDepartment && distance !== null && distance > ONSITE_RADIUS_M && (
              <div className="bg-yellow-50/80 rounded-xl border border-yellow-200/50 p-3 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <span className="text-xs">⚠️</span>
                  </div>
                  <span className="text-xs font-medium text-gray-900">Reason Required</span>
                  <span className="ml-auto text-[10px] text-red-500 font-medium">Outside: {distance}m</span>
                </div>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-2 text-xs border border-gray-200 rounded-lg bg-white/50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="">-- Select Reason --</option>
                  <option value="Field Work">📋 Field Work</option>
                  <option value="Work From Home">🏠 Work From Home</option>
                  <option value="Client Meeting">🤝 Client Meeting</option>
                  <option value="Other">📝 Other</option>
                </select>
              </div>
            )}

            {/* Get Location button for swipe mode */}
            {!isImageCaptureAllowed && !position && (
              <button
                onClick={handleGetLocation}
                className="w-full mb-3 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <FaMapMarkerAlt className="w-4 h-4" />
                <span>Get Location</span>
              </button>
            )}

            {/* Main Attendance Button */}
            {!checkedIn ? (
              <button
                onClick={isImageCaptureAllowed ? handleOpenCameraForCheckIn : handleNormalCheckIn}
                disabled={submitting || (!position && !isImageCaptureAllowed)}
                className={`w-full py-4 rounded-2xl text-base font-bold text-white transition-all duration-300 flex items-center justify-center gap-3 ${
                  submitting || (!position && !isImageCaptureAllowed)
                    ? "bg-gray-400 cursor-not-allowed opacity-60"
                    : isImageCaptureAllowed
                    ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 shadow-lg shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/40 transform hover:scale-[1.02] active:scale-95"
                    : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 transform hover:scale-[1.02] active:scale-95"
                }`}
              >
                {submitting ? (
                  <>
                    <FaSpinner className="w-5 h-5 animate-spin" /> Processing...
                  </>
                ) : !position && !isImageCaptureAllowed ? (
                  <>
                    <FaMapMarkerAlt className="w-5 h-5" /> Get Location First
                  </>
                ) : isImageCaptureAllowed ? (
                  <>
                    <FaCamera className="w-5 h-5" /> Check In with Photo
                    <span className="text-xs opacity-80 bg-white/20 px-2 py-0.5 rounded-full">Auto-Capture</span>
                  </>
                ) : (
                  <>
                    <FaArrowRight className="w-5 h-5" /> Check In
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={isImageCaptureAllowed ? handleOpenCameraForCheckOut : handleNormalCheckOut}
                disabled={submitting}
                className="w-full py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg shadow-red-500/30 transition-all duration-300 flex items-center justify-center gap-3 transform hover:scale-[1.02] active:scale-95"
              >
                {submitting ? (
                  <>
                    <FaSpinner className="w-5 h-5 animate-spin" /> Processing...
                  </>
                ) : isImageCaptureAllowed ? (
                  <>
                    <FaCamera className="w-5 h-5" /> Check Out with Photo
                    <span className="text-xs opacity-80 bg-white/20 px-2 py-0.5 rounded-full">Auto-Capture</span>
                  </>
                ) : (
                  <>
                    <FaArrowLeft className="w-5 h-5" /> Check Out
                  </>
                )}
              </button>
            )}

            {/* Row 6: Status text below button */}
            <div className="mt-3 text-center">
              <p className="text-xs text-gray-500 font-medium flex items-center justify-center gap-2">
                {!checkedIn ? (
                  isImageCaptureAllowed ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 rounded-full text-indigo-600">
                      <BsCamera className="text-xs" /> Click above to capture photo & check in
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 rounded-full text-blue-600">
                      <FaArrowRight className="text-xs" /> Click above to check in
                    </span>
                  )
                ) : isImageCaptureAllowed ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 rounded-full text-red-600">
                    <BsCamera className="text-xs" /> Click above to capture photo & check out
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 rounded-full text-red-600">
                    <FaArrowLeft className="text-xs" /> Click above to check out
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-5">
          <p className="text-[9px] text-gray-300 font-medium">Powered by Timely Health HRMS</p>
        </div>
      </div>

      {/* Location Selection Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col animate-scale-in">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FaBuilding className="text-indigo-500" /> Select Location
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
                <input
                  type="text"
                  placeholder="Search location..."
                  className="w-full pl-4 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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

      {/* Welcome Popup - Simplified */}
      {showWelcomePopup && employeeName && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 transform animate-scale-up border border-white/30">
            <button
              onClick={() => {
                setShowWelcomePopup(false);
                localStorage.setItem("hasSeenWelcomePopup", "true");
              }}
              className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-white/80 hover:bg-red-50 hover:text-red-500 transition-all duration-300"
            >
              <FaTimes className="text-gray-600 hover:text-red-500 transition-colors text-sm" />
            </button>

            <div className="text-center">
              <div className="flex justify-center mb-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl blur-lg opacity-30 animate-pulse"></div>
                  <div className="relative w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <span className="text-3xl animate-bounce" style={{ animationDuration: "2s" }}>
                      👋
                    </span>
                  </div>
                </div>
              </div>

              <h2 className="text-xl font-bold text-gray-900">Welcome, {employeeName}! 🌟</h2>

              <div className="mt-2 text-center space-y-0.5">
                <p className="text-xs text-indigo-600 font-medium flex items-center justify-center gap-1">
                  <FaCalendarAlt className="text-indigo-500 text-xs" /> {currentDate}
                </p>
                <p className="text-xs text-purple-600 font-medium flex items-center justify-center gap-1">
                  <FaClock className="text-purple-500 text-xs" /> {currentTime} IST
                </p>
              </div>

              <button
                onClick={() => {
                  setShowWelcomePopup(false);
                  localStorage.setItem("hasSeenWelcomePopup", "true");
                }}
                className="mt-4 w-full relative group py-3 rounded-xl text-sm font-bold text-white overflow-hidden transition-all duration-300 transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-indigo-500/30"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 group-hover:from-indigo-600 group-hover:via-purple-600 group-hover:to-pink-600 transition-all duration-300"></div>
                <span className="relative flex items-center justify-center gap-2">
                  <FaRocket className="text-white group-hover:animate-bounce" /> Let's Get Started
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes scale-up {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(15px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.4s ease-out;
        }
        .animate-scale-up {
          animation: scale-up 0.35s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.25s ease-out;
        }
        .z-60 {
          z-index: 60;
        }
      `}</style>
    </div>
  );
}