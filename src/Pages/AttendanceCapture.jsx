

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
//             <h2 className="mb-6 text-2xl font-semibold text-gray-800 sm:text-3xl">
//               Attendance Capture
//             </h2>

//             {/* Back Button */}
//             <button
//               onClick={() => navigate("/employeedashboard")}
//               className="w-full px-5 py-2 mb-5 text-white transition-all bg-blue-600 rounded-lg sm:w-auto hover:bg-blue-700"
//             >
//               ← Back to Dashboard
//             </button>

//             <div className="p-4 mb-6 rounded-lg shadow-sm bg-gray-50">
//               <h3 className="mb-2 text-lg font-medium text-gray-700">Your Location</h3>
//               <button
//                 onClick={fetchLocation}
//                 className="w-full px-5 py-2 text-white bg-green-600 rounded-lg sm:w-auto hover:bg-green-700"
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
//                         <span className="text-green-600">Onsite</span>
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
//             <h2 className="mb-6 text-2xl font-semibold text-gray-800 sm:text-3xl">
//               Attendance Capture
//             </h2>

//             {/* Back Button */}
//             <button
//               onClick={() => navigate("/employeedashboard")}
//               className="w-full px-5 py-2 mb-5 text-white transition-all bg-blue-600 rounded-lg sm:w-auto hover:bg-blue-700"
//             >
//               ← Back to Dashboard
//             </button>

//             <div className="p-4 mb-6 rounded-lg shadow-sm bg-gray-50">
//               <h3 className="mb-2 text-lg font-medium text-gray-700">
//                 Your Location
//               </h3>

//               <button
//                 onClick={fetchLocation}
//                 className="w-full px-5 py-2 text-white bg-green-600 rounded-lg sm:w-auto hover:bg-green-700"
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
//               className="px-4 py-2 text-white bg-green-600 rounded"
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
//               className="w-full py-3 text-lg font-semibold text-white bg-green-700 rounded-lg"
//             >
//               {submitting ? "Checking In..." : "Check In"}
//             </button>
//           ) : (
//             <button
//               onClick={handleCheckOut}
//               disabled={submitting}
//               className="w-full py-3 text-lg font-semibold text-white bg-red-600 rounded-lg"
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

//         <div className="flex flex-col gap-3 p-4 rounded-md bg-gray-50">
//           <button
//             onClick={fetchLocation}
//             className="px-4 py-2 text-white transition bg-green-600 rounded hover:bg-green-700"
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
//             className="w-full py-3 text-lg font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
//           >
//             {submitting ? "Checking In..." : "Check In"}
//           </button>
//         ) : (
//           <button
//             onClick={handleCheckOut}
//             disabled={submitting || !position || !employeeId}
//             className="w-full py-3 text-lg font-semibold text-white transition bg-red-600 rounded-lg hover:bg-red-700"
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

//         <div className="flex flex-col gap-3 p-4 rounded-md bg-gray-50">
//           <button
//             onClick={fetchLocation}
//             className="px-4 py-2 text-white transition bg-green-600 rounded hover:bg-green-700"
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
//             className="w-full py-3 text-lg font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
//           >
//             {submitting ? "Checking In..." : "Check In"}
//           </button>
//         ) : (
//           <button
//             onClick={handleCheckOut}
//             disabled={submitting || !position || !employeeId}
//             className="w-full py-3 text-lg font-semibold text-white transition bg-red-600 rounded-lg hover:bg-red-700"
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

//         <div className="p-4 rounded-md bg-gray-50">
//           <button
//             onClick={fetchLocation}
//             className="px-4 py-2 text-white transition bg-green-600 rounded hover:bg-green-700"
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
//                         ? "text-green-600 font-semibold"
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
//             className={`w-full py-3 text-white rounded-lg text-lg font-semibold transition ${
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
//             className={`w-full py-3 text-white rounded-lg text-lg font-semibold transition ${
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
//             <p className="font-bold text-green-600">
//               Employee ID: {employeeId}
//             </p>
//              {employeeName && (
//               <p className="mt-1 font-bold text-green-600">Name: {employeeName}</p>
//             )}
//             {employeeEmail && (
//               <p className="mt-1 font-bold text-green-600">Email: {employeeEmail}</p>
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
//             <p className="mt-1 text-sm text-gray-600">
//               Please contact admin to assign a location for your employee account.
//             </p>
//           </div>
//         )}

//         <div className="p-4 rounded-md bg-gray-50">
//           <button
//             onClick={fetchLocation}
//             className={`bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition ${
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
//                         ? "text-green-600 font-semibold"
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
//             className={`w-full py-3 text-white rounded-lg text-lg font-semibold transition ${
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
//             className={`w-full py-3 text-white rounded-lg text-lg font-semibold transition ${
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

import { API_BASE_URL, API_DOMAIN } from "../config";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const BASE_URL = API_BASE_URL; // Use imported API_BASE_URL
const ONSITE_RADIUS_M = 50;

// Haversine formula
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

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
  const [assignedLocation, setAssignedLocation] = useState(null);
  const [position, setPosition] = useState(null);
  const [distance, setDistance] = useState(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [locationError, setLocationError] = useState("");
  const [allLocations, setAllLocations] = useState([]);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Current time state
  const [currentTime, setCurrentTime] = useState("");

  // Get employeeId & email
  useEffect(() => {
    const stateId = routerLocation.state?.employeeId;
    const stateEmail = routerLocation.state?.email;

    if (stateId && stateEmail) {
      setEmployeeId(stateId);
      setEmployeeEmail(stateEmail);
      localStorage.setItem(
        "employeeData",
        JSON.stringify({ employeeId: stateId, email: stateEmail })
      );
    } else {
      const stored = localStorage.getItem("employeeData");
      if (stored) {
        const data = JSON.parse(stored);
        setEmployeeId(data.employeeId);
        setEmployeeEmail(data.email);
      } else {
        navigate("/");
      }
    }
  }, [routerLocation.state, navigate]);

  // Fetch Employee's Assigned Location and Name
  useEffect(() => {
    const fetchAssignedLocation = async () => {
      if (!employeeId) return;

      setLoadingLocation(true);
      try {
        const res = await axios.get(`${BASE_URL}api/employees/mylocation/${employeeId}`);

        if (res.data.success && res.data.data) {
          setAssignedLocation(res.data.data.location);

          // Extract employee name from API response
          if (res.data.data.employee && res.data.data.employee.name) {
            setEmployeeName(res.data.data.employee.name);
          } else {
            const username = employeeEmail ? employeeEmail.split('@')[0] : '';
            setEmployeeName(username);
          }

          setError("");
        } else {
          setError("No assigned location found for this employee.");
          setAssignedLocation(null);
        }
      } catch (err) {
        console.error("Error fetching employee location:", err);
        setError("Failed to fetch employee location. Please try again.");
        setAssignedLocation(null);
      } finally {
        setLoadingLocation(false);
      }
    };

    if (employeeId) {
      fetchAssignedLocation();
    }
  }, [employeeId, employeeEmail]);

  // Fetch All Locations for Selection
  useEffect(() => {
    const fetchAllLocations = async () => {
      try {
        const res = await axios.get(`${BASE_URL}api/location/alllocation`);
        if (res.data.locations) {
          setAllLocations(res.data.locations);
        }
      } catch (err) {
        console.error("Error fetching all locations:", err);
      }
    };
    fetchAllLocations();
  }, []);

  const handleSelectLocation = (loc) => {
    setAssignedLocation(loc);
    setIsLocationModalOpen(false);
    // Clear previous position/distance to force update for new location
    setPosition(null);
    setDistance(null);
    alert(`Switched to location: ${loc.name}`);
  };

  const filteredLocations = allLocations.filter(loc =>
    loc.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.fullAddress?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fetch today's attendance
  useEffect(() => {
    const fetchTodayAttendance = async () => {
      if (!employeeId) return;
      try {
        const res = await axios.get(`${BASE_URL}api/attendance/myattendance/${employeeId}`);
        const data = res.data;

        // Get employee name from attendance API response too
        if (data.employeeName) {
          setEmployeeName(data.employeeName);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayCheckIn = data.records?.find(
          (rec) => new Date(rec.checkInTime) >= today && rec.status === "checked-in"
        );
        setCheckedIn(!!todayCheckIn);
      } catch (err) {
        console.error("Error fetching today attendance:", err);
      }
    };

    if (employeeId) {
      fetchTodayAttendance();
    }
  }, [employeeId]);

  // Update current time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Get current live location
  const fetchLocation = () => {
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
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
        } else {
          setLocationError("No assigned location found. Please contact admin.");
        }
      },
      (err) => {
        const errorMessage = "Error getting location: " + err.message;
        setLocationError(errorMessage);
        alert(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  // Handle Check-In
  const handleCheckIn = async () => {
    if (!position) return alert("Please capture your current location first.");
    if (!employeeId || !employeeEmail)
      return alert("Employee data missing. Please login again.");
    if (distance > ONSITE_RADIUS_M && !reason.trim())
      return alert("You are outside the office range. Please select a reason.");

    setSubmitting(true);
    try {
      const res = await axios.post(`${BASE_URL}api/attendance/checkin`, {
        employeeId,
        employeeEmail,
        latitude: position.lat,
        longitude: position.lng,
        reason: reason || "Onsite",
      });

      alert(res.data.message);
      setCheckedIn(true);

      if (res.data.employeeName) {
        setEmployeeName(res.data.employeeName);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Check-in failed.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Check-Out
  const handleCheckOut = async () => {
    if (!position) return alert("Please capture your current location first.");
    if (!employeeId) return alert("Employee data missing.");

    const isConfirmed = window.confirm("Are you sure you want to check out?");
    if (!isConfirmed) return;

    if (distance > ONSITE_RADIUS_M && !reason.trim())
      return alert("You are outside the office range. Please select a reason.");

    setSubmitting(true);
    try {
      const res = await axios.post(`${BASE_URL}api/attendance/checkout`, {
        employeeId,
        latitude: position.lat,
        longitude: position.lng,
        reason: distance > ONSITE_RADIUS_M ? reason : undefined,
      });

      alert(res.data.message);
      setCheckedIn(false);
      setReason("");
      setPosition(null);
      setDistance(null);
    } catch (err) {
      alert(err.response?.data?.message || "Check-out failed.");
    } finally {
      setSubmitting(false);
    }
  };

  // Manual swipe handler with click/touch
  const handleManualSwipe = () => {
    if (submitting || !position || !employeeId || !assignedLocation) {
      alert("Please capture your location first and make sure all data is loaded.");
      return;
    }

    // Animate the swipe
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

  // Simple mouse/touch handlers
  useEffect(() => {
    const swipeArea = swipeAreaRef.current;
    if (!swipeArea) return;

    let startX = 0;
    let isDragging = false;
    const minSwipeDistance = 100;

    const onStart = (clientX) => {
      if (submitting || !position || !employeeId || !assignedLocation) return;
      startX = clientX;
      isDragging = true;
      setIsSwiping(true);
    };

    const onMove = (clientX) => {
      if (!isDragging) return;

      const diff = clientX - startX;

      if (!checkedIn && diff > 0) {
        // Check-in: right swipe
        const progress = Math.min(diff / minSwipeDistance, 1);
        setSwipeProgress(progress);
      } else if (checkedIn && diff < 0) {
        // Check-out: left swipe
        const progress = Math.min(Math.abs(diff) / minSwipeDistance, 1);
        setSwipeProgress(progress);
      }
    };

    const onEnd = (clientX) => {
      if (!isDragging) return;

      isDragging = false;
      const diff = clientX - startX;

      if (!checkedIn && diff >= minSwipeDistance) {
        // Successful right swipe for check-in
        handleCheckIn();
      } else if (checkedIn && diff <= -minSwipeDistance) {
        // Successful left swipe for check-out
        handleCheckOut();
      }

      // Reset after a delay
      setTimeout(() => {
        setSwipeProgress(0);
        setIsSwiping(false);
      }, 300);
    };

    // Mouse events
    const handleMouseDown = (e) => {
      onStart(e.clientX);
    };

    const handleMouseMove = (e) => {
      onMove(e.clientX);
    };

    const handleMouseUp = (e) => {
      onEnd(e.clientX);
    };

    // Touch events
    const handleTouchStart = (e) => {
      onStart(e.touches[0].clientX);
    };

    const handleTouchMove = (e) => {
      onMove(e.touches[0].clientX);
    };

    const handleTouchEnd = (e) => {
      const clientX = e.changedTouches[0]?.clientX || 0;
      onEnd(clientX);
    };

    // Add event listeners
    swipeArea.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    swipeArea.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      // Cleanup
      swipeArea.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);

      swipeArea.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [checkedIn, submitting, position, employeeId, assignedLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-0">
      {/* Header */}
      <div className="flex justify-between items-center p-2 bg-white shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Attendance</h1>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{currentTime}</div>
          <div className="text-xs text-gray-500">Current Time</div>
        </div>
      </div>

      {/* Main Content Container - Reduced padding */}
      <div className="p-3 max-w-md mx-auto">

        {/* Employee Info Card - Compact */}
        <div className="bg-white rounded-xl shadow-sm p-3 mb-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">
                {employeeName ? employeeName.charAt(0).toUpperCase() : "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              {employeeName && (
                <h2 className="text-base font-bold text-gray-900 truncate">{employeeName}</h2>
              )}
              {employeeId && (
                <p className="text-xs text-gray-600">ID: {employeeId}</p>
              )}
              {employeeEmail && (
                <p className="text-xs text-gray-500 truncate">{employeeEmail}</p>
              )}
            </div>
          </div>
        </div>

        {/* Location Card - Compact */}
        <div className="bg-white rounded-xl shadow-sm p-3 mb-2">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-gray-900">Location Status</h3>
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Select Location
            </button>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${position ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
              {position ? 'Captured ✓' : 'Required'}
            </div>
          </div>

          {loadingLocation ? (
            <div className="animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ) : assignedLocation ? (
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">{assignedLocation.name}</h4>
                  <p className="text-xs text-gray-600">Assigned Location • Radius: {ONSITE_RADIUS_M}m</p>
                </div>
              </div>

              {position && distance != null && (
                <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-700">Distance:</span>
                    <span className={`text-sm font-bold ${distance <= ONSITE_RADIUS_M ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {distance}m
                    </span>
                  </div>
                  <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${distance <= ONSITE_RADIUS_M ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      style={{ width: `${Math.min((distance / ONSITE_RADIUS_M) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className={`text-xs mt-1 font-medium ${distance <= ONSITE_RADIUS_M ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {distance <= ONSITE_RADIUS_M ? '✓ Within office radius' : '⚠ Outside office radius'}
                  </p>
                </div>
              )}

              <button
                onClick={fetchLocation}
                className={`w-full mt-2 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center space-x-1 transition ${!assignedLocation
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : position
                    ? 'bg-amber-500 hover:bg-amber-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                disabled={!assignedLocation}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <span>{!position ? "Get Current Location" : "Update Location"}</span>
              </button>
            </div>
          ) : (
            <div className="text-center py-2">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-1">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
              <p className="text-xs text-gray-700 mb-0.5">No location assigned</p>
              <p className="text-xs text-gray-500">Please contact admin</p>
            </div>
          )}
        </div>

        {/* Reason Selection (if outside radius) - Compact */}
        {distance > ONSITE_RADIUS_M && (
          <div className="bg-white rounded-xl shadow-sm p-3 mb-2">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Reason Required</h3>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
            >
              <option value="">-- Select Reason --</option>
              <option value="Field Work">Field Work</option>
              <option value="Work From Home">Work From Home</option>
              <option value="Client Meeting">Client Meeting</option>
              <option value="Other">Other</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">You're outside the assigned area ({distance}m)</p>
          </div>
        )}

        {/* Attendance Card - Compact */}
        <div className="bg-white rounded-xl shadow-sm p-3">
          {/* Status Header */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Today's Attendance</h3>
              <p className="text-xs text-gray-600">
                {checkedIn ? 'You are currently checked in' : 'Ready to check in'}
              </p>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${checkedIn ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
              }`}>
              {checkedIn ? 'Checked In' : 'Not Checked In'}
            </div>
          </div>

          {/* Swipe Instructions */}
          <div className="text-center mb-3">
            <p className="text-sm text-gray-700 font-medium">
              {!checkedIn
                ? "Swipe right → to check in"
                : "Swipe left ← to check out"
              }
            </p>
          </div>

          {/* Swipe Button Container */}
          <div className="mb-3">
            <div
              ref={swipeAreaRef}
              className={`relative overflow-hidden rounded-lg ${!position || !assignedLocation || submitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-[0.98] transition-transform'
                }`}
              onClick={handleManualSwipe}
            >
              {!checkedIn ? (
                // Check-in swipe button
                <div className="relative bg-gradient-to-r from-blue-500 to-blue-600 h-12">
                  {/* Swipe progress overlay */}
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500"
                    style={{
                      width: `${swipeProgress * 100}%`,
                      transition: isSwiping ? 'none' : 'width 0.2s ease-out'
                    }}
                  ></div>

                  {/* Content */}
                  <div className="absolute inset-0 flex items-center justify-between px-3">
                    <div className="flex items-center gap-1 text-white">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                      </svg>
                      <span className="text-sm font-bold">CHECK IN</span>
                    </div>

                    <div className="flex items-center gap-1 text-white">
                      <span className="text-xs">Swipe →</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              ) : (
                // Check-out swipe button
                <div className="relative bg-gradient-to-r from-red-500 to-red-600 h-12">
                  {/* Swipe progress overlay */}
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-gradient-to-r from-red-400 to-red-500"
                    style={{
                      width: `${swipeProgress * 100}%`,
                      transition: isSwiping ? 'none' : 'width 0.2s ease-out'
                    }}
                  ></div>

                  {/* Content */}
                  <div className="absolute inset-0 flex items-center justify-between px-3">
                    <div className="flex items-center gap-1 text-white">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                      </svg>
                      <span className="text-xs">← Swipe</span>
                    </div>

                    <div className="flex items-center gap-1 text-white">
                      <span className="text-sm font-bold">CHECK OUT</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Help text */}
            <p className="text-center text-xs text-gray-500 mt-1">
              {!position ? "Capture location first" : "Click or drag to swipe"}
            </p>
          </div>

          {/* Loading State */}
          {submitting && (
            <div className="text-center py-2 mb-2">
              <div className="inline-flex items-center justify-center gap-1">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs text-gray-700">
                  {!checkedIn ? "Processing Check In..." : "Processing Check Out..."}
                </span>
              </div>
            </div>
          )}

          {/* Status Message - Only when checked in and not submitting */}
          {checkedIn && !submitting && (
            <div className="text-center py-2 border-t border-gray-100">
              <div className="inline-flex flex-col items-center gap-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-green-800">You are checked in</p>
                  <p className="text-xs text-green-600">Remember to check out when leaving</p>
                </div>
              </div>
            </div>
          )}

          {/* Simple Footer */}
          {/* <div className="text-center text-gray-500 text-xs mt-2 pt-2 border-t border-gray-100">
            <p>Swipe right to check in • Swipe left to check out</p>
          </div> */}
        </div>

        {/* Global Footer */}
        <div className="text-center text-gray-400 text-xs mt-2 pt-2 border-t border-gray-200">
          <p>Make sure location is captured before checking in/out</p>
        </div>

      </div>

      {/* Location Selection Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col animate-fade-in-up">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <h3 className="text-lg font-bold text-gray-900">Select Site Location</h3>
              <button
                onClick={() => setIsLocationModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <div className="p-4 bg-white">
              <div className="relative mb-4">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search site or address..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="overflow-y-auto max-h-[50vh] space-y-2 pr-1 custom-scrollbar">
                {filteredLocations.length > 0 ? (
                  filteredLocations.map((loc) => (
                    <div
                      key={loc._id}
                      onClick={() => handleSelectLocation(loc)}
                      className="p-3 border border-gray-100 rounded-xl hover:bg-blue-50 hover:border-blue-200 cursor-pointer transition-all flex items-start space-x-3 group"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors text-blue-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors truncate">{loc.name}</h4>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{loc.fullAddress || "No address provided"}</p>
                      </div>
                      <div className="flex-shrink-0 self-center">
                        <svg className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">No locations found matching your search.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t rounded-b-2xl">
              <p className="text-xs text-gray-500 text-center">
                Select a site to update your capture radius
              </p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>

    </div>
  );
}