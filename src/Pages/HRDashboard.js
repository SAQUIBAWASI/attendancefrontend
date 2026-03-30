import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const HRDashboard = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole");
  const isHR = userRole === "hr";

  useEffect(() => {
    if (!isHR && userRole) {
      navigate("/login");
    }
  }, [isHR, navigate, userRole]);

  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    pendingLeaves: 0
  });

  useEffect(() => {
    setStats({
      totalEmployees: 45,
      presentToday: 38,
      pendingLeaves: 12
    });
  }, []);

  if (!isHR) {
    return (
      <div className="flex items-center justify-center h-[80vh] text-red-600">
        Access Denied. HR privileges required.
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="mb-4">
        <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold inline-block">
          HR DASHBOARD
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500">Total Employees</h3>
          <p className="text-2xl font-bold">{stats.totalEmployees}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500">Present Today</h3>
          <p className="text-2xl font-bold text-green-600">{stats.presentToday}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500">Pending Leaves</h3>
          <p className="text-2xl font-bold text-orange-600">{stats.pendingLeaves}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Employee List</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">ID</th>
              <th className="text-left py-2">Name</th>
              <th className="text-left py-2">Position</th>
              <th className="text-left py-2">Status</th>
             </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2">EMP001</td>
              <td>John Doe</td>
              <td>Software Engineer</td>
              <td><span className="text-green-600">Active</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HRDashboard;