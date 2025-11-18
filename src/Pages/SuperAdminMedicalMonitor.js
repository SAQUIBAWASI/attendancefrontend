// import { useState } from "react";

// export default function SuperAdminSidebar() {
//   const [activeTab, setActiveTab] = useState("summary"); // summary | reports | leaves

//   return (
//     <div
//       style={{
//         width: "250px",
//         height: "100vh",
//         backgroundColor: "#1e293b",
//         color: "white",
//         padding: "20px",
//       }}
//     >
//       <h2 style={{ textAlign: "center", marginBottom: "30px" }}>🩺 Super Admin</h2>

//       <ul style={{ listStyle: "none", padding: 0 }}>
//         <li
//           onClick={() => setActiveTab("summary")}
//           style={{
//             padding: "10px",
//             marginBottom: "10px",
//             cursor: "pointer",
//             backgroundColor:
//               activeTab === "summary" ? "#3b82f6" : "transparent",
//             borderRadius: "8px",
//           }}
//         >
//           Attendance Summary
//         </li>
//         <li
//           onClick={() => setActiveTab("reports")}
//           style={{
//             padding: "10px",
//             marginBottom: "10px",
//             cursor: "pointer",
//             backgroundColor:
//               activeTab === "reports" ? "#3b82f6" : "transparent",
//             borderRadius: "8px",
//           }}
//         >
//           Attendance Reports
//         </li>
//         <li
//           onClick={() => setActiveTab("leaves")}
//           style={{
//             padding: "10px",
//             marginBottom: "10px",
//             cursor: "pointer",
//             backgroundColor:
//               activeTab === "leaves" ? "#3b82f6" : "transparent",
//             borderRadius: "8px",
//           }}
//         >
//           Leave Requests
//         </li>
//       </ul>
//     </div>
//   ); 
// }

import { useEffect, useState } from "react";
import {
  FiCalendar,
  FiCamera,
  FiCheckCircle,
  FiClock
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import SuperAdminNavbar from "../Components/SuperAdminNavbar";
import SuperAdminSidebar from "../Components/SuperAdminSidebar";

const SuperAdminDashboard = () => {
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Detect screen width
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">

      {/* Sidebar */}
      <SuperAdminSidebar
        isCollapsed={isCollapsed}
        isMobile={isMobile}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Mobile Overlay */}
      {isMobile && !isCollapsed && isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* Navbar */}
        <SuperAdminNavbar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          isMobile={isMobile}
          toggleMobileSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Dashboard */}
        <main className="flex-1 p-4 overflow-y-auto md:p-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Super Admin Dashboard
          </h1>
          <p className="text-gray-500">Manage Employees & System Controls</p>

          {/* Cards */}
          <div className="grid grid-cols-1 gap-4 mt-8 sm:grid-cols-2 lg:grid-cols-3">

          <DashboardCard
                        icon={<FiCamera className="text-3xl text-green-600" />}
                        title="Mark Attendance"
                        subtitle="Capture photo & location"
                        onClick={() => navigate("/attendance-capture")}
                      />

            <DashboardCard
              icon={<FiClock className="text-3xl text-green-600" />}
              title="My Attendance"
              subtitle="View attendance records"
              onClick={() => navigate("/myattendance")}
            />

            <DashboardCard
              icon={<FiCalendar className="text-3xl text-purple-600" />}
              title="Leave Requests"
              subtitle="Apply For leave"
              onClick={() => navigate("/leave-application")}
            />

            <DashboardCard
              icon={<FiCheckCircle className="text-3xl text-orange-600" />}
              title="Approve Leaves"
              subtitle="Approve/Reject leave requests"
              onClick={() => navigate("/leave-approvals")}
            />

            {/* <DashboardCard
              icon={<FiClipboard className="text-3xl text-red-600" />}
              title="Reports"
              subtitle="Download monthly reports"
              onClick={() => navigate("/admin/reports")}
            /> */}

          </div>

          {/* Leave Approval Section */}
          <div
            onClick={() => navigate("/leave-approvals")}
            className="p-6 mt-10 transition bg-white shadow-md cursor-pointer rounded-xl hover:shadow-lg"
          >
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
              <FiCheckCircle /> Pending Leave Approvals
            </h3>
            <p className="text-sm text-gray-500">
              Review employee leave requests and update their status.
            </p>
            <div className="flex justify-center mt-10 text-gray-400">
              <FiCheckCircle className="text-4xl" />
            </div>
          </div>

          {/* Attendance Monitor Section */}
          <div
            onClick={() => navigate("/attendance-records")}
            className="p-6 mt-6 transition bg-white shadow-md cursor-pointer rounded-xl hover:shadow-lg"
          >
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
              <FiClock /> Attendance Monitor
            </h3>
            <p className="text-sm text-gray-500">
              Track daily attendance of all employees.
            </p>
            <div className="flex justify-center mt-10 text-gray-400">
              <FiClock className="text-4xl" />
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

// Reusable Dashboard Card Component
const DashboardCard = ({ icon, title, subtitle, onClick }) => (
  <div
    onClick={onClick}
    className="flex flex-col items-center justify-center p-6 transition transform bg-white shadow-md cursor-pointer rounded-xl hover:scale-105 hover:shadow-lg"
  >
    <div className="p-4 mb-3 bg-gray-100 rounded-full">{icon}</div>
    <h4 className="font-semibold text-gray-800">{title}</h4>
    <p className="text-sm text-gray-500">{subtitle}</p>
  </div>
);

export default SuperAdminDashboard;
