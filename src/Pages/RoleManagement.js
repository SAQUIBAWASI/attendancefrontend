import axios from "axios";
import { useEffect, useState } from "react";

const permissionsList = [
  { key: "viewOwnAttendance", label: "View Own Attendance", description: "View personal attendance records" },
  { key: "markAttendance", label: "Mark Attendance", description: "Mark personal attendance" },
  { key: "viewTeamAttendance", label: "View Team Attendance", description: "View team member attendance" },
  { key: "requestLeave", label: "Request Leave", description: "Submit leave requests" },
  { key: "approveTeamLeave", label: "Approve Team Leave", description: "Approve/reject team leave requests" },
  { key: "viewOwnProfile", label: "View Own Profile", description: "View personal profile information" },
  { key: "viewDepartmentReports", label: "View Department Reports", description: "Access department-level reports" },
  { key: "viewAllReports", label: "View All Reports", description: "Access all system reports" },
  { key: "manageDepartmentEmployees", label: "Manage Department Employees", description: "Manage employees within department" },
  { key: "manageAllEmployees", label: "Manage All Employees", description: "Manage all employees in system" },
];

export default function RoleManagement() {
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    axios.get("/api/roles").then((res) => setRoles(res.data));
  }, []);

  const handleToggle = (roleId, permKey) => {
    const role = roles.find((r) => r._id === roleId);
    const updatedPermissions = { ...role.permissions, [permKey]: !role.permissions[permKey] };

    axios.put(`/api/roles/${roleId}`, { permissions: updatedPermissions })
      .then((res) => {
        setRoles((prev) => prev.map((r) => (r._id === roleId ? res.data : r)));
      });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-700 flex items-center gap-2">
        <span>⚙️</span> Permissions Overview
      </h2>
      <p className="text-gray-600 mb-4 text-center">Overview of permissions across different roles</p>
      <div className="overflow-x-auto">
        <table className="w-full table-auto border border-gray-200 shadow-sm rounded-lg overflow-hidden">
          <thead className="bg-blue-100">
            <tr>
              <th className="border px-4 py-3 text-left">Permission</th>
              {roles.map((role) => (
                <th key={role._id} className="border px-4 py-3 text-center">{role.name}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {permissionsList.map((perm) => (
              <tr key={perm.key} className="hover:bg-gray-50">
                <td className="border px-4 py-2">
                  <div className="font-semibold">{perm.label}</div>
                  <div className="text-gray-500 text-sm">{perm.description}</div>
                </td>
                {roles.map((role) => (
                  <td key={role._id} className="border px-4 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={!!role.permissions[perm.key]}
                      onChange={() => handleToggle(role._id, perm.key)}
                      className="w-5 h-5 accent-green-500 cursor-pointer"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
