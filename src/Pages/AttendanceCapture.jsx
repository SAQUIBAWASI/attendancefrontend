// src/pages/AttendanceCapture.jsx
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import EmployeeSidebar from "../Components/EmployeeSidebar";
import Navbar from "../Components/Navbar";

const OFFICE_COORDS = { lat: 17.4458661, lng: 78.3849383 };
const ONSITE_RADIUS_M = 50;
const BASE_URL = "https://attendancebackend-5cgn.onrender.com";

// Haversine formula for distance
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
  return R * c;
}

export default function AttendanceCapture() {
  const location = useLocation();
  const [position, setPosition] = useState(null);
  const [distance, setDistance] = useState(null);
  const [locStatus, setLocStatus] = useState("idle");
  const [submitting, setSubmitting] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [employeeId, setEmployeeId] = useState(null);
  const [email, setEmail] = useState(null);

  // ✅ Load employee data
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

  // ✅ Restore check-in status based on employeeId
  useEffect(() => {
    if (employeeId) {
      const storedStatus = localStorage.getItem(`checkedIn_${employeeId}`);
      if (storedStatus === "true") {
        setCheckedIn(true);
      } else {
        setCheckedIn(false);
      }
    }
  }, [employeeId]);

  // ✅ Fetch current geolocation
  const fetchLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported!");
    setLocStatus("fetching");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(coords);
        const d = haversineDistance(
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
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // ✅ Handle Check-In
  const handleCheckIn = async () => {
    if (!position) return alert("Fetch your location first!");
    if (!employeeId) return alert("Employee ID missing!");

    const payload = {
      employeeId,
      employeeEmail: email,
      latitude: position.lat,
      longitude: position.lng,
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

      alert(
        `✅ Check-In Successful! ${
          distance <= ONSITE_RADIUS_M ? "(Onsite)" : "(Outside office)"
        }`
      );

      setCheckedIn(true);
      localStorage.setItem(`checkedIn_${employeeId}`, "true");
    } catch (err) {
      alert("❌ " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Handle Check-Out
  const handleCheckOut = async () => {
    if (!position) return alert("Fetch your location first!");
    if (!employeeId) return alert("Employee ID missing!");

    const payload = {
      employeeId,
      employeeEmail: email,
      latitude: position.lat,
      longitude: position.lng,
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

      alert(
        `✅ Check-Out Successful! ${
          distance <= ONSITE_RADIUS_M ? "(Onsite)" : "(Outside office)"
        }`
      );

      setCheckedIn(false);
      localStorage.removeItem(`checkedIn_${employeeId}`);
    } catch (err) {
      alert("❌ " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <EmployeeSidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        {/* Navbar */}
        <Navbar />

        {/* Attendance Content */}
        <div className="max-w-lg p-6 mx-auto text-center">
          <h2 className="mb-6 text-2xl font-semibold">Attendance Capture</h2>

          <div className="p-4 mb-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-2 text-lg font-medium">Your Location</h3>
            <button
              onClick={fetchLocation}
              className="px-4 py-2 text-white bg-green-600 rounded"
              disabled={locStatus === "fetching"}
            >
              {locStatus === "fetching" ? "Fetching..." : "Get Current Location"}
            </button>

            {position && (
              <div className="mt-3 text-gray-700">
                <p>Lat: {position.lat.toFixed(6)}</p>
                <p>Lng: {position.lng.toFixed(6)}</p>
                <p>
                  Distance:{" "}
                  <strong>
                    {distance} m ({distance <= ONSITE_RADIUS_M ? "Onsite" : "Outside"})
                  </strong>
                </p>
              </div>
            )}
          </div>

          {/* ✅ Show correct button per employee */}
          {!checkedIn ? (
            <button
              onClick={handleCheckIn}
              disabled={submitting}
              className="w-full py-3 text-lg font-semibold text-white bg-green-700 rounded-lg"
            >
              {submitting ? "Checking In..." : "Check In"}
            </button>
          ) : (
            <button
              onClick={handleCheckOut}
              disabled={submitting}
              className="w-full py-3 text-lg font-semibold text-white bg-red-600 rounded-lg"
            >
              {submitting ? "Checking Out..." : "Check Out"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
