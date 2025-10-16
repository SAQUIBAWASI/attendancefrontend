// src/pages/AttendanceCapture.jsx
import { useEffect, useState } from "react";

const OFFICE_COORDS = { lat: 17.4458661, lng: 78.3849383 }; // Timely Health Office
const ONSITE_RADIUS_M = 50; // 50 meters
const BASE_URL = "https://attendancebackend-5cgn.onrender.com"; // ✅ Replace with your backend base URL

// ✅ Haversine formula (distance between two points in meters)
function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function AttendanceCapture() {
  const [position, setPosition] = useState(null);
  const [distance, setDistance] = useState(null);
  const [locStatus, setLocStatus] = useState("idle");
  const [submitting, setSubmitting] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);

  // ✅ Restore check-in state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("checkedIn");
    if (stored === "true") setCheckedIn(true);
  }, []);

  // ✅ Fetch current geolocation
  const fetchLocation = () => {
    if (!navigator.geolocation) {
      setLocStatus("error");
      return alert("Geolocation not supported by this browser.");
    }

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
        alert("Location permission denied: " + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // ✅ Handle Check-In API call
  const handleCheckIn = async () => {
    if (!position) return alert("Please fetch your current location first!");

    const employeeId = localStorage.getItem("employeeId") || "EMP1024";
    const employeeEmail =
      localStorage.getItem("employeeEmail") || "ayesha.khan@example.com";

    const payload = {
      employeeId,
      employeeEmail,
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

      if (!res.ok) throw new Error(data.message || "Check-in failed");

      alert(
        `✅ Check-In Successful! ${data.onsite ? "(Onsite)" : "(Offsite)"}`
      );
      setCheckedIn(true);
      localStorage.setItem("checkedIn", "true");
    } catch (err) {
      alert("❌ Failed to Check-In: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Handle Check-Out API call (same style as Check-In)
  const handleCheckOut = async () => {
    if (!position) return alert("Please fetch your current location first!");

    const employeeId = localStorage.getItem("employeeId") || "EMP1024";
    const employeeEmail =
      localStorage.getItem("employeeEmail") || "ayesha.khan@example.com";

    const payload = {
      employeeId,
      employeeEmail,
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

      if (!res.ok) throw new Error(data.message || "Check-out failed");

      alert(
        `✅ Check-Out Successful! ${data.onsite ? "(Onsite)" : "(Offsite)"}`
      );
      setCheckedIn(false);
      localStorage.removeItem("checkedIn");
    } catch (err) {
      alert("❌ Failed to Check-Out: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto text-center">
      <h2 className="text-2xl font-semibold mb-6">Attendance Capture</h2>

      {/* --- Location Section --- */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-medium mb-2">Your Location</h3>
        <button
          onClick={fetchLocation}
          className="px-4 py-2 bg-green-600 text-white rounded"
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

      {/* --- Attendance Buttons --- */}
      {!checkedIn ? (
        <button
          onClick={handleCheckIn}
          disabled={submitting}
          className="w-full py-3 bg-green-700 text-white rounded-lg text-lg font-semibold"
        >
          {submitting ? "Checking In..." : "Check In"}
        </button>
      ) : (
        <button
          onClick={handleCheckOut}
          disabled={submitting}
          className="w-full py-3 bg-red-600 text-white rounded-lg text-lg font-semibold"
        >
          {submitting ? "Checking Out..." : "Check Out"}
        </button>
      )}
    </div>
  );
}
