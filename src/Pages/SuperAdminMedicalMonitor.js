import { useState } from "react";

export default function SuperAdminSidebar() {
  const [activeTab, setActiveTab] = useState("summary"); // summary | reports | leaves

  return (
    <div
      style={{
        width: "250px",
        height: "100vh",
        backgroundColor: "#1e293b",
        color: "white",
        padding: "20px",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "30px" }}>🩺 Super Admin</h2>

      <ul style={{ listStyle: "none", padding: 0 }}>
        <li
          onClick={() => setActiveTab("summary")}
          style={{
            padding: "10px",
            marginBottom: "10px",
            cursor: "pointer",
            backgroundColor:
              activeTab === "summary" ? "#3b82f6" : "transparent",
            borderRadius: "8px",
          }}
        >
          Attendance Summary
        </li>
        <li
          onClick={() => setActiveTab("reports")}
          style={{
            padding: "10px",
            marginBottom: "10px",
            cursor: "pointer",
            backgroundColor:
              activeTab === "reports" ? "#3b82f6" : "transparent",
            borderRadius: "8px",
          }}
        >
          Attendance Reports
        </li>
        <li
          onClick={() => setActiveTab("leaves")}
          style={{
            padding: "10px",
            marginBottom: "10px",
            cursor: "pointer",
            backgroundColor:
              activeTab === "leaves" ? "#3b82f6" : "transparent",
            borderRadius: "8px",
          }}
        >
          Leave Requests
        </li>
      </ul>
    </div>
  ); 
}


