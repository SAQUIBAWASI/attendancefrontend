import { useEffect, useState } from "react";
import { FaEdit, FaSave, FaTimes, FaTrash, FaUserShield } from "react-icons/fa";
import { toast } from "react-toastify";

const UserAccessManagement = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [newRoleName, setNewRoleName] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // All available permissions
  const allPermissions = [
    { id: "dashboard_view", name: "View Dashboard", category: "Dashboard" },
    { id: "employee_view", name: "View Employees", category: "Employees" },
    { id: "employee_add", name: "Add Employees", category: "Employees" },
    { id: "employee_edit", name: "Edit Employees", category: "Employees" },
    { id: "employee_delete", name: "Delete Employees", category: "Employees" },
    { id: "attendance_view", name: "View Attendance", category: "Attendance" },
    { id: "attendance_edit", name: "Edit Attendance", category: "Attendance" },
    { id: "attendance_approve", name: "Approve Attendance", category: "Attendance" },
    { id: "leave_view", name: "View Leaves", category: "Leaves" },
    { id: "leave_approve", name: "Approve Leaves", category: "Leaves" },
    { id: "leave_reject", name: "Reject Leaves", category: "Leaves" },
    { id: "payroll_view", name: "View Payroll", category: "Payroll" },
    { id: "payroll_generate", name: "Generate Payroll", category: "Payroll" },
    { id: "payroll_edit", name: "Edit Payroll", category: "Payroll" },
    { id: "reports_view", name: "View Reports", category: "Reports" },
    { id: "reports_generate", name: "Generate Reports", category: "Reports" },
    { id: "shifts_view", name: "View Shifts", category: "Shifts" },
    { id: "shifts_manage", name: "Manage Shifts", category: "Shifts" },
    { id: "locations_view", name: "View Locations", category: "Locations" },
    { id: "locations_manage", name: "Manage Locations", category: "Locations" },
    { id: "users_view", name: "View Users", category: "Users" },
    { id: "users_manage", name: "Manage Users", category: "Users" },
    { id: "settings_view", name: "View Settings", category: "Settings" },
    { id: "settings_edit", name: "Edit Settings", category: "Settings" },
  ];

  // Initial roles data
  const initialRoles = [
    {
      id: "admin",
      name: "Administrator",
      description: "Full system access with all permissions",
      permissions: allPermissions.map(p => p.id)
    },
    {
      id: "hr",
      name: "HR Manager",
      description: "HR management with employee and attendance access",
      permissions: [
        "dashboard_view",
        "employee_view", "employee_add", "employee_edit",
        "attendance_view", "attendance_edit", "attendance_approve",
        "leave_view", "leave_approve", "leave_reject",
        "payroll_view", "payroll_generate",
        "reports_view",
        "shifts_view", "shifts_manage"
      ]
    },
    {
      id: "manager",
      name: "Department Manager",
      description: "Team management with limited access",
      permissions: [
        "dashboard_view",
        "employee_view",
        "attendance_view",
        "leave_view", "leave_approve",
        "reports_view",
        "shifts_view"
      ]
    },
    {
      id: "employee",
      name: "Employee",
      description: "Basic access for regular employees",
      permissions: [
        "dashboard_view",
        "attendance_view",
        "leave_view"
      ]
    }
  ];

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      // API call for existing roles
      // const response = await axios.get("/api/roles");
      // setRoles(response.data);
      
      // For demo, using initial data
      setRoles(initialRoles);
      
      // Group permissions by category
      const groupedPermissions = {};
      allPermissions.forEach(perm => {
        if (!groupedPermissions[perm.category]) {
          groupedPermissions[perm.category] = [];
        }
        groupedPermissions[perm.category].push(perm);
      });
      setPermissions(groupedPermissions);
      
    } catch (error) {
      toast.error("Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = (roleId, permissionId) => {
    setRoles(prevRoles =>
      prevRoles.map(role => {
        if (role.id === roleId) {
          const hasPermission = role.permissions.includes(permissionId);
          return {
            ...role,
            permissions: hasPermission
              ? role.permissions.filter(p => p !== permissionId)
              : [...role.permissions, permissionId]
          };
        }
        return role;
      })
    );
  };

  const handleSelectAllCategory = (roleId, category) => {
    setRoles(prevRoles =>
      prevRoles.map(role => {
        if (role.id === roleId) {
          const categoryPermissions = allPermissions
            .filter(p => p.category === category)
            .map(p => p.id);
          
          const hasAllCategoryPermissions = categoryPermissions.every(p => 
            role.permissions.includes(p)
          );
          
          return {
            ...role,
            permissions: hasAllCategoryPermissions
              ? role.permissions.filter(p => !categoryPermissions.includes(p))
              : [...new Set([...role.permissions, ...categoryPermissions])]
          };
        }
        return role;
      })
    );
  };

  const handleSelectAll = (roleId) => {
    setRoles(prevRoles =>
      prevRoles.map(role => {
        if (role.id === roleId) {
          const allPermissionIds = allPermissions.map(p => p.id);
          const hasAllPermissions = allPermissionIds.every(p => 
            role.permissions.includes(p)
          );
          
          return {
            ...role,
            permissions: hasAllPermissions ? [] : allPermissionIds
          };
        }
        return role;
      })
    );
  };

  const startEditRole = (role) => {
    setEditingRole({ ...role });
  };

  const cancelEdit = () => {
    setEditingRole(null);
  };

  const saveRole = async () => {
    if (!editingRole?.name.trim()) {
      toast.error("Role name is required");
      return;
    }

    try {
      // API call to update role
      // await axios.put(`/api/roles/${editingRole.id}`, editingRole);
      
      // Update local state
      setRoles(prevRoles =>
        prevRoles.map(role => 
          role.id === editingRole.id ? editingRole : role
        )
      );
      
      setEditingRole(null);
      toast.success("Role updated successfully");
    } catch (error) {
      toast.error("Failed to update role");
    }
  };

  const deleteRole = async (roleId) => {
    if (!window.confirm("Are you sure you want to delete this role?")) return;
    
    try {
      // API call to delete role
      // await axios.delete(`/api/roles/${roleId}`);
      
      // Update local state
      setRoles(prevRoles => prevRoles.filter(role => role.id !== roleId));
      toast.success("Role deleted successfully");
    } catch (error) {
      toast.error("Failed to delete role");
    }
  };

  const addNewRole = async () => {
    if (!newRoleName.trim()) {
      toast.error("Role name is required");
      return;
    }

    const newRole = {
      id: newRoleName.toLowerCase().replace(/\s+/g, '_'),
      name: newRoleName,
      description: "New role with basic permissions",
      permissions: ["dashboard_view", "attendance_view"]
    };

    try {
      // API call to add role
      // await axios.post("/api/roles", newRole);
      
      // Update local state
      setRoles(prevRoles => [...prevRoles, newRole]);
      setNewRoleName("");
      setShowAddModal(false);
      toast.success("New role added successfully");
    } catch (error) {
      toast.error("Failed to add new role");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">User Access Management</h1>
          <p className="text-gray-600 mt-2">
            Manage permissions for different roles (Admin, HR, Manager, etc.)
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <FaUserShield /> Add New Role
        </button>
      </div>

      {/* Add Role Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Add New Role</h3>
            <input
              type="text"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="Enter role name (e.g., Supervisor)"
              className="w-full p-3 border rounded-lg mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={addNewRole}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {roles.map(role => (
          <div key={role.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            {/* Role Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                {editingRole?.id === role.id ? (
                  <input
                    type="text"
                    value={editingRole.name}
                    onChange={(e) => setEditingRole({...editingRole, name: e.target.value})}
                    className="text-xl font-bold text-gray-800 border-b border-blue-500 focus:outline-none"
                  />
                ) : (
                  <h3 className="text-xl font-bold text-gray-800">{role.name}</h3>
                )}
                <p className="text-gray-600 text-sm mt-1">{role.description}</p>
              </div>
              
              <div className="flex gap-2">
                {editingRole?.id === role.id ? (
                  <>
                    <button
                      onClick={saveRole}
                      className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      title="Save"
                    >
                      <FaSave />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                      title="Cancel"
                    >
                      <FaTimes />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEditRole(role)}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      title="Edit Role"
                    >
                      <FaEdit />
                    </button>
                    {role.id !== "admin" && role.id !== "employee" && (
                      <button
                        onClick={() => deleteRole(role.id)}
                        className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        title="Delete Role"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Select All Button */}
            <div className="mb-6">
              <button
                onClick={() => handleSelectAll(role.id)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium"
              >
                {role.permissions.length === allPermissions.length 
                  ? "Deselect All Permissions" 
                  : "Select All Permissions"}
              </button>
              <span className="text-sm text-gray-500 ml-3">
                {role.permissions.length} / {allPermissions.length} permissions
              </span>
            </div>

            {/* Permissions Grid */}
            <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
              {Object.entries(permissions).map(([category, categoryPermissions]) => (
                <div key={category} className="border-t pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-gray-700">{category}</h4>
                    <button
                      onClick={() => handleSelectAllCategory(role.id, category)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {categoryPermissions.every(p => role.permissions.includes(p.id))
                        ? "Deselect All"
                        : "Select All"
                      }
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categoryPermissions.map(permission => (
                      <div key={permission.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`${role.id}-${permission.id}`}
                          checked={role.permissions.includes(permission.id)}
                          onChange={() => handlePermissionToggle(role.id, permission.id)}
                          className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <label
                          htmlFor={`${role.id}-${permission.id}`}
                          className="ml-2 text-sm text-gray-700 cursor-pointer"
                        >
                          {permission.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Assigned Users Count (Optional) */}
            <div className="mt-6 pt-4 border-t">
              <p className="text-sm text-gray-500">
                {/* {role.usersCount || 0} users assigned to this role */}
                Sample role - Connect with your user database
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Permission Legend */}
      <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Permission Categories Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { color: "bg-blue-100 text-blue-800", text: "Dashboard - View analytics" },
            { color: "bg-green-100 text-green-800", text: "Employees - Manage workforce" },
            { color: "bg-purple-100 text-purple-800", text: "Attendance - Track presence" },
            { color: "bg-yellow-100 text-yellow-800", text: "Leaves - Approve time off" },
            { color: "bg-indigo-100 text-indigo-800", text: "Payroll - Salary management" },
            { color: "bg-pink-100 text-pink-800", text: "Reports - Generate insights" },
            { color: "bg-gray-100 text-gray-800", text: "Settings - System configuration" },
            { color: "bg-red-100 text-red-800", text: "Admin - Full system access" },
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${item.color.split(' ')[0]}`}></div>
              <span className="text-sm">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Save All Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={() => toast.success("All permissions saved successfully!")}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-md"
        >
          Save All Changes
        </button>
      </div>
    </div>
  );
};

export default UserAccessManagement;