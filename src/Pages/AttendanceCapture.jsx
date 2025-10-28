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
// import { useEffect, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import EmployeeSidebar from "../Components/EmployeeSidebar";
// import Navbar from "../Components/Navbar";

// const OFFICE_COORDS = { lat: 17.445860, lng: 78.387154 };
// const ONSITE_RADIUS_M = 600;
// const BASE_URL = "https://attendancebackend-5cgn.onrender.com";

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
//   }, [employeeId, storageKey, today]);

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
//     <div className="flex flex-col sm:flex-row min-h-screen bg-gray-100">
//       {/* Sidebar */}
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

//             {/* Back Button */}
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
// const BASE_URL = "https://attendancebackend-5cgn.onrender.com";

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

//             {/* Back Button */}
//             <button
//               onClick={() => navigate("/employeedashboard")}
//               className="mb-5 w-full sm:w-auto px-5 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all"
//             >
//               ← Back to Dashboard
//             </button>

//             <div className="p-4 mb-6 bg-gray-50 rounded-lg shadow-sm">
//               <h3 className="mb-2 text-lg font-medium text-gray-700">
//                 Your Location
//               </h3>

//               <button
//                 onClick={fetchLocation}
//                 className="w-full sm:w-auto px-5 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
//                 disabled={locStatus === "fetching"}
//               >
//                 {locStatus === "fetching"
//                   ? "Fetching..."
//                   : "Get Current Location"}
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
// import { useEffect, useState } from "react";
// import { useLocation } from "react-router-dom";
// import EmployeeSidebar from "../Components/EmployeeSidebar";
// import Navbar from "../Components/Navbar";

// const OFFICE_COORDS = { lat: 17.4458661, lng: 78.3849383 };
// const ONSITE_RADIUS_M = 50;
// const BASE_URL = "https://attendancebackend-5cgn.onrender.com";

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
//       <div className="flex-1 flex flex-col">
//         {/* Navbar */}
//         <Navbar />

//         {/* Attendance Content */}
//         <div className="p-6 max-w-lg mx-auto text-center">
//           <h2 className="text-2xl font-semibold mb-6">Attendance Capture</h2>

//           <div className="bg-white p-4 rounded-lg shadow-md mb-6">
//             <h3 className="text-lg font-medium mb-2">Your Location</h3>
//             <button
//               onClick={fetchLocation}
//               className="px-4 py-2 bg-green-600 text-white rounded"
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
//               className="w-full py-3 bg-green-700 text-white rounded-lg text-lg font-semibold"
//             >
//               {submitting ? "Checking In..." : "Check In"}
//             </button>
//           ) : (
//             <button
//               onClick={handleCheckOut}
//               disabled={submitting}
//               className="w-full py-3 bg-red-600 text-white rounded-lg text-lg font-semibold"
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
// const BASE_URL = "https://attendancebackend-5cgn.onrender.com/api/attendance";
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
//     <div className="min-h-screen flex flex-col items-center bg-gray-100 p-4">
//       <button
//         onClick={() => navigate("/employeedashboard")}
//         className="self-start mb-4 text-gray-700 hover:text-gray-900 font-medium"
//       >
//         ← Back
//       </button>

//       <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 flex flex-col gap-4">
//         <h2 className="text-2xl font-semibold text-center">Attendance Capture</h2>

//         <div className="bg-gray-50 p-4 rounded-md flex flex-col gap-3">
//           <button
//             onClick={fetchLocation}
//             className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
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
//             className="w-full py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
//           >
//             {submitting ? "Checking In..." : "Check In"}
//           </button>
//         ) : (
//           <button
//             onClick={handleCheckOut}
//             disabled={submitting || !position || !employeeId}
//             className="w-full py-3 bg-red-600 text-white rounded-lg text-lg font-semibold hover:bg-red-700 transition"
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

// const BASE_URL = "https://attendancebackend-5cgn.onrender.com/api/attendance";
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
//     <div className="min-h-screen flex flex-col items-center bg-gray-100 p-4">
//       <button
//         onClick={() => navigate("/employeedashboard")}
//         className="self-start mb-4 text-gray-700 hover:text-gray-900 font-medium"
//       >
//         ← Back
//       </button>

//       <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 flex flex-col gap-4">
//         <h2 className="text-2xl font-semibold text-center">Attendance Capture</h2>

//         <div className="bg-gray-50 p-4 rounded-md flex flex-col gap-3">
//           <button
//             onClick={fetchLocation}
//             className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
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
//             className="w-full py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
//           >
//             {submitting ? "Checking In..." : "Check In"}
//           </button>
//         ) : (
//           <button
//             onClick={handleCheckOut}
//             disabled={submitting || !position || !employeeId}
//             className="w-full py-3 bg-red-600 text-white rounded-lg text-lg font-semibold hover:bg-red-700 transition"
//           >
//             {submitting ? "Checking Out..." : "Check Out"}
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }


import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const BASE_URL = "https://attendancebackend-5cgn.onrender.com"; // backend root URL
const ONSITE_RADIUS_M = 50; // 50 meters radius

// Haversine formula to calculate distance in meters (FOR UI DISPLAY ONLY)
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // meters
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
  const location = useLocation();

  const [officeLocation, setOfficeLocation] = useState(null);
  const [position, setPosition] = useState(null);
  const [distance, setDistance] = useState(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [employeeId, setEmployeeId] = useState(null);
  const [employeeEmail, setEmployeeEmail] = useState(null);

  // Load employee data
  useEffect(() => {
    const stateId = location.state?.employeeId;
    const stateEmail = location.state?.email;

    if (stateId && stateEmail) {
      setEmployeeId(stateId);
      setEmployeeEmail(stateEmail);
      localStorage.setItem(
        "employeeData",
        JSON.stringify({ employeeId: stateId, email: stateEmail })
      );
    } else {
      const stored = JSON.parse(localStorage.getItem("employeeData"));
      if (stored) {
        setEmployeeId(stored.employeeId);
        setEmployeeEmail(stored.email);
      }
    }
  }, [location.state]);

  // Fetch office location
  useEffect(() => {
    const fetchOfficeLocation = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/location/active`);
        const data = await res.json();
        if (data.success && data.location) {
          setOfficeLocation({
            lat: data.location.latitude,
            lng: data.location.longitude,
            name: data.location.name,
          });
        } else {
          alert("No office location set by admin yet.");
        }
      } catch (err) {
        console.error("Error fetching office location:", err);
      }
    };
    fetchOfficeLocation();
  }, []);

  // Fetch today's attendance
  useEffect(() => {
    const fetchTodayAttendance = async () => {
      if (!employeeId) return;

      try {
        const res = await fetch(`${BASE_URL}/api/attendance/myattendance/${employeeId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch");

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayCheckIn = data.records.find(
          (rec) =>
            new Date(rec.checkInTime) >= today && rec.status === "checked-in"
        );

        setCheckedIn(!!todayCheckIn);
      } catch (err) {
        console.error("Fetch today attendance error:", err);
      }
    };

    fetchTodayAttendance();
  }, [employeeId]);

  // Get current location
  const fetchLocation = () => {
    if (!navigator.geolocation)
      return alert("Geolocation is not supported by your browser");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(coords);

        if (officeLocation) {
          const dist = haversineDistance(
            coords.lat,
            coords.lng,
            officeLocation.lat,
            officeLocation.lng
          );
          setDistance(dist);
        } else {
          alert("Location Capture Successfully.");
        }
      },
      (err) => alert(err.message),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Handle Check-In
  const handleCheckIn = async () => {
    if (!position) return alert("Get your location first");
    if (!employeeId || !employeeEmail) return alert("Employee data missing");

    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/api/attendance/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId,
          employeeEmail,
          latitude: position.lat,
          longitude: position.lng
          // NOTE: distance and locationStatus removed - backend will calculate
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Use backend response message directly
      alert(data.message);
      setCheckedIn(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Check-Out
  const handleCheckOut = async () => {
    if (!position) return alert("Get your location first");
    if (!employeeId) return alert("Employee data missing");

    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/api/attendance/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId,
          latitude: position.lat,
          longitude: position.lng
          // NOTE: distance and locationStatus removed - backend will calculate
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Use backend response message directly
      alert(data.message);
      setCheckedIn(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-4">
      <button
        onClick={() => navigate("/employeedashboard")}
        className="self-start mb-4 text-gray-700 hover:text-gray-900 font-medium"
      >
        ← Back
      </button>

      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 flex flex-col gap-6">
        <h2 className="text-2xl font-semibold text-center">Attendance Capture</h2>

        {/* Employee Info */}
        {employeeId && (
          <div className="bg-green-50 p-3 rounded-md">
            <p className="text-green-700 font-medium">
              Employee: {employeeId} | {employeeEmail}
            </p>
          </div>
        )}

        {/* Office Location */}
        {officeLocation && (
          <div className="bg-blue-50 p-4 rounded-md flex flex-col gap-2">
            <h3 className="font-medium text-blue-700">Office Location: {officeLocation.name}</h3>
            <p>Lat: {officeLocation.lat.toFixed(6)}</p>
            <p>Lng: {officeLocation.lng.toFixed(6)}</p>
            <p>Onsite Radius: {ONSITE_RADIUS_M} m</p>
          </div>
        )}

        {/* Employee Location */}
        <div className="bg-gray-50 p-4 rounded-md flex flex-col gap-2">
          <button
            onClick={fetchLocation}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Get My Current Location
          </button>

          {position && (
            <>
              <p>Your Latitude: {position.lat.toFixed(6)}</p>
              <p>Your Longitude: {position.lng.toFixed(6)}</p>
              {distance != null && (
                <p>
                  Distance from office: <strong>{distance} m</strong> -{" "}
                  <span
                    className={
                      distance <= ONSITE_RADIUS_M ? "text-green-600 font-semibold" : "text-red-600 font-semibold"
                    }
                  >
                    {distance <= ONSITE_RADIUS_M ? "Inside Office" : "Outside Office"}
                  </span>
                  <br />
                  <small className="text-gray-500">(This is for display only - backend will calculate actual distance)</small>
                </p>
              )}
            </>
          )}
        </div>

        {/* Check-In / Check-Out Button */}
        {!checkedIn ? (
          <button
            onClick={handleCheckIn}
            disabled={submitting || !position || !employeeId}
            className={`w-full py-3 text-white rounded-lg text-lg font-semibold transition ${
              submitting || !position || !employeeId
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {submitting ? "Checking In..." : "Check In"}
          </button>
        ) : (
          <button
            onClick={handleCheckOut}
            disabled={submitting || !position || !employeeId}
            className={`w-full py-3 text-white rounded-lg text-lg font-semibold transition ${
              submitting || !position || !employeeId
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {submitting ? "Checking Out..." : "Check Out"}
          </button>
        )}

        {/* Status Message */}
        {checkedIn && (
          <div className="bg-yellow-50 p-3 rounded-md text-center">
            <p className="text-yellow-700 font-medium">
              ✅ You are currently checked in
            </p>
          </div>
        )}
      </div>
    </div>
  );
}