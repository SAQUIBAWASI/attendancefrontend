import axios from "axios";
import { useEffect, useState } from "react";
import {
    FaCheck,
    FaEdit,
    FaEye, FaPlus,
    FaSave, FaTimes,
    FaTrash,
    FaUserShield,
    FaUsers
} from "react-icons/fa";
import { toast } from "react-toastify";

const UserAccessManagement = () => {
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState(null);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleCode, setNewRoleCode] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [userPermissions, setUserPermissions] = useState({});

  // Available modules and actions
  const modules = [
    { id: 'dashboard', name: 'Dashboard', color: 'bg-blue-100 text-blue-800' },
    { id: 'employees', name: 'Employees', color: 'bg-green-100 text-green-800' },
    { id: 'attendance', name: 'Attendance', color: 'bg-purple-100 text-purple-800' },
    { id: 'leaves', name: 'Leaves', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'payroll', name: 'Payroll', color: 'bg-indigo-100 text-indigo-800' },
    { id: 'reports', name: 'Reports', color: 'bg-pink-100 text-pink-800' },
    { id: 'shifts', name: 'Shifts', color: 'bg-teal-100 text-teal-800' },
    { id: 'locations', name: 'Locations', color: 'bg-orange-100 text-orange-800' },
    { id: 'users', name: 'User Management', color: 'bg-red-100 text-red-800' },
    { id: 'settings', name: 'Settings', color: 'bg-gray-100 text-gray-800' },
  ];

  const actions = [
    { id: 'view', name: 'View', color: 'bg-blue-50' },
    { id: 'create', name: 'Create', color: 'bg-green-50' },
    { id: 'edit', name: 'Edit', color: 'bg-yellow-50' },
    { id: 'delete', name: 'Delete', color: 'bg-red-50' },
    { id: 'approve', name: 'Approve', color: 'bg-purple-50' },
    { id: 'reject', name: 'Reject', color: 'bg-pink-50' },
    { id: 'generate', name: 'Generate', color: 'bg-teal-50' },
    { id: 'manage', name: 'Manage', color: 'bg-indigo-50' },
  ];

  useEffect(() => {
    fetchRoles();
    fetchUsers();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await axios.get("https://credenhealth.onrender.com/api/roles", {
        withCredentials: true
      });
      setRoles(response.data.data || response.data);
    } catch (error) {
      toast.error("Failed to load roles");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get("https://credenhealth.onrender.com/api/users", {
        withCredentials: true
      });
      setUsers(response.data.data || response.data);
    } catch (error) {
      console.error("Failed to load users");
    }
  };

  const handlePermissionToggle = (roleId, moduleId, actionId) => {
    setRoles(prevRoles =>
      prevRoles.map(role => {
        if (role._id === roleId) {
          const moduleIndex = role.permissions.findIndex(p => p.module === moduleId);
          
          if (moduleIndex === -1) {
            // Add new module with action
            return {
              ...role,
              permissions: [
                ...role.permissions,
                { module: moduleId, actions: [actionId] }
              ]
            };
          } else {
            // Add or remove action from existing module
            const module = role.permissions[moduleIndex];
            const hasAction = module.actions.includes(actionId);
            
            const updatedPermissions = [...role.permissions];
            if (hasAction) {
              // Remove action
              updatedPermissions[moduleIndex] = {
                ...module,
                actions: module.actions.filter(a => a !== actionId)
              };
              // Remove module if no actions left
              if (updatedPermissions[moduleIndex].actions.length === 0) {
                updatedPermissions.splice(moduleIndex, 1);
              }
            } else {
              // Add action
              updatedPermissions[moduleIndex] = {
                ...module,
                actions: [...module.actions, actionId]
              };
            }
            
            return {
              ...role,
              permissions: updatedPermissions
            };
          }
        }
        return role;
      })
    );
  };

  const handleModuleToggle = (roleId, moduleId) => {
    setRoles(prevRoles =>
      prevRoles.map(role => {
        if (role._id === roleId) {
          const moduleIndex = role.permissions.findIndex(p => p.module === moduleId);
          const module = modules.find(m => m.id === moduleId);
          
          if (moduleIndex === -1) {
            // Add all actions for this module
            const defaultActions = ['view', 'create', 'edit', 'delete'];
            return {
              ...role,
              permissions: [
                ...role.permissions,
                { module: moduleId, actions: defaultActions }
              ]
            };
          } else {
            // Remove entire module
            return {
              ...role,
              permissions: role.permissions.filter(p => p.module !== moduleId)
            };
          }
        }
        return role;
      })
    );
  };

  const startEditRole = (role) => {
    setEditingRole({ ...role });
  };

  const saveRole = async () => {
    if (!editingRole?.name.trim() || !editingRole?.code.trim()) {
      toast.error("Role name and code are required");
      return;
    }

    try {
      await axios.put(
        `https://credenhealth.onrender.com/api/roles/${editingRole._id}`,
        {
          name: editingRole.name,
          description: editingRole.description,
          permissions: editingRole.permissions
        },
        { withCredentials: true }
      );
      
      setRoles(prevRoles =>
        prevRoles.map(role => 
          role._id === editingRole._id ? editingRole : role
        )
      );
      
      setEditingRole(null);
      toast.success("Role updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update role");
    }
  };

  const deleteRole = async (roleId, roleCode) => {
    if (['ADMIN', 'HR', 'EMPLOYEE', 'SUPER_ADMIN'].includes(roleCode)) {
      toast.error("Cannot delete default roles");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this role?")) return;
    
    try {
      await axios.delete(
        `https://credenhealth.onrender.com/api/roles/${roleId}`,
        { withCredentials: true }
      );
      
      setRoles(prevRoles => prevRoles.filter(role => role._id !== roleId));
      toast.success("Role deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete role");
    }
  };

  const addNewRole = async () => {
    if (!newRoleName.trim() || !newRoleCode.trim()) {
      toast.error("Role name and code are required");
      return;
    }

    try {
      const response = await axios.post(
        "https://credenhealth.onrender.com/api/roles",
        {
          name: newRoleName,
          code: newRoleCode.toUpperCase(),
          description: "New role with custom permissions",
          permissions: []
        },
        { withCredentials: true }
      );
      
      setRoles(prevRoles => [...prevRoles, response.data.data]);
      setNewRoleName("");
      setNewRoleCode("");
      setShowAddModal(false);
      toast.success("New role added successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add role");
    }
  };

  const viewRoleUsers = async (role) => {
    try {
      const response = await axios.get(
        `https://credenhealth.onrender.com/api/users/role/${role._id}`,
        { withCredentials: true }
      );
      
      setSelectedRole({
        ...role,
        users: response.data.data
      });
      setShowUsersModal(true);
    } catch (error) {
      toast.error("Failed to load users");
    }
  };

  const updateUserRole = async (userId, roleId) => {
    try {
      await axios.post(
        "https://credenhealth.onrender.com/api/roles/assign",
        { userId, roleId },
        { withCredentials: true }
      );
      
      toast.success("User role updated successfully");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update user role");
    }
  };

  const saveAllPermissions = async () => {
    try {
      // Save each role's permissions
      for (const role of roles) {
        await axios.put(
          `https://credenhealth.onrender.com/api/roles/${role._id}`,
          { permissions: role.permissions },
          { withCredentials: true }
        );
      }
      
      toast.success("All permissions saved successfully!");
    } catch (error) {
      toast.error("Failed to save permissions");
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">User Access Management</h1>
          <p className="text-gray-600 mt-2">
            Manage roles and permissions for Admin, HR, Manager, Team Lead, and Employees
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FaPlus /> Add New Role
          </button>
          <button
            onClick={saveAllPermissions}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FaSave /> Save All Changes
          </button>
        </div>
      </div>

      {/* Add Role Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Add New Role</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role Name *
                </label>
                <input
                  type="text"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="e.g., Finance Manager"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role Code *
                </label>
                <input
                  type="text"
                  value={newRoleCode}
                  onChange={(e) => setNewRoleCode(e.target.value)}
                  placeholder="e.g., FINANCE_MGR (uppercase)"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
                />
                <p className="text-xs text-gray-500 mt-1">Unique uppercase code (no spaces)</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
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

      {/* Users Modal */}
      {showUsersModal && selectedRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Users with {selectedRole.name} Role
                </h3>
                <p className="text-gray-600">
                  {selectedRole.users?.length || 0} users assigned
                </p>
              </div>
              <button
                onClick={() => setShowUsersModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {selectedRole.users?.map(user => (
                <div key={user._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div>
                    <h4 className="font-medium">{user.name}</h4>
                    <p className="text-sm text-gray-600">{user.email} • {user.employeeId}</p>
                    <p className="text-xs text-gray-500">{user.department} • {user.designation}</p>
                  </div>
                  <select
                    value={user.role?._id || ''}
                    onChange={(e) => updateUserRole(user._id, e.target.value)}
                    className="border rounded-lg px-3 py-1.5 text-sm"
                  >
                    {roles.map(role => (
                      <option key={role._id} value={role._id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Roles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {roles.map(role => (
          <div key={role._id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            {/* Role Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div className="flex-1">
                {editingRole?._id === role._id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editingRole.name}
                      onChange={(e) => setEditingRole({...editingRole, name: e.target.value})}
                      className="text-xl font-bold text-gray-800 border-b border-blue-500 focus:outline-none w-full"
                    />
                    <input
                      type="text"
                      value={editingRole.code}
                      onChange={(e) => setEditingRole({...editingRole, code: e.target.value})}
                      className="text-sm text-gray-600 border-b focus:outline-none w-full"
                    />
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-gray-800">{role.name}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        role.isDefault ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {role.isDefault ? 'Default' : 'Custom'}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">{role.code}</p>
                    <p className="text-gray-600">{role.description}</p>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => viewRoleUsers(role)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2"
                  title="View Users"
                >
                  <FaUsers /> {role.usersCount || 0} Users
                </button>
                
                {editingRole?._id === role._id ? (
                  <>
                    <button
                      onClick={saveRole}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
                      title="Save"
                    >
                      <FaCheck /> Save
                    </button>
                    <button
                      onClick={() => setEditingRole(null)}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2"
                      title="Cancel"
                    >
                      <FaTimes /> Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEditRole(role)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
                      title="Edit Role"
                    >
                      <FaEdit /> Edit
                    </button>
                    {!role.isDefault && (
                      <button
                        onClick={() => deleteRole(role._id, role.code)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2"
                        title="Delete Role"
                      >
                        <FaTrash /> Delete
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Permissions Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Module</th>
                    {actions.map(action => (
                      <th key={action.id} className="text-center py-3 px-2 font-medium text-gray-700">
                        <div className="flex flex-col items-center">
                          <span className="text-xs">{action.name}</span>
                          <div className={`w-6 h-1 rounded-full mt-1 ${action.color}`}></div>
                        </div>
                      </th>
                    ))}
                    <th className="text-center py-3 px-2 font-medium text-gray-700">All</th>
                  </tr>
                </thead>
                <tbody>
                  {modules.map(module => {
                    const modulePermissions = role.permissions?.find(p => p.module === module.id);
                    const hasAllActions = modulePermissions && 
                      ['view', 'create', 'edit', 'delete'].every(action => 
                        modulePermissions.actions.includes(action)
                      );
                    
                    return (
                      <tr key={module.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${module.color.split(' ')[0]}`}></div>
                            <span className="font-medium text-gray-700">{module.name}</span>
                          </div>
                        </td>
                        
                        {actions.map(action => {
                          const hasPermission = modulePermissions?.actions.includes(action.id);
                          return (
                            <td key={action.id} className="text-center py-3 px-2">
                              <button
                                onClick={() => handlePermissionToggle(role._id, module.id, action.id)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto transition-all ${
                                  hasPermission
                                    ? 'bg-blue-100 text-blue-600 border-2 border-blue-300'
                                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                }`}
                                title={`${action.name} ${module.name}`}
                              >
                                {hasPermission ? '✓' : '+'}
                              </button>
                            </td>
                          );
                        })}
                        
                        <td className="text-center py-3 px-2">
                          <button
                            onClick={() => handleModuleToggle(role._id, module.id)}
                            className={`px-3 py-1 rounded text-sm font-medium ${
                              hasAllActions
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {hasAllActions ? 'Remove All' : 'Add All'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">
                    Total Permissions: <span className="font-semibold">
                      {role.permissions?.reduce((total, perm) => total + perm.actions.length, 0) || 0}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Last updated: {new Date(role.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">
                    {role.usersCount || 0} users assigned
                  </p>
                  {role.isDefault && (
                    <p className="text-xs text-green-600 mt-1">Default System Role</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              axios.post("https://credenhealth.onrender.com/api/roles/seed/default", {}, { withCredentials: true })
                .then(() => {
                  toast.success("Default roles restored");
                  fetchRoles();
                })
                .catch(() => toast.error("Failed to restore default roles"));
            }}
            className="p-4 border rounded-lg hover:bg-gray-50 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaUserShield className="text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium">Restore Default Roles</h4>
                <p className="text-sm text-gray-600">Reset Admin, HR, Employee roles</p>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => {
              // Export permissions to CSV
              const csvData = roles.map(role => ({
                Role: role.name,
                Code: role.code,
                Permissions: role.permissions?.map(p => `${p.module}:${p.actions.join(',')}`).join(';') || ''
              }));
              console.log("Export CSV:", csvData);
              toast.info("Export feature coming soon!");
            }}
            className="p-4 border rounded-lg hover:bg-gray-50 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FaSave className="text-green-600" />
              </div>
              <div>
                <h4 className="font-medium">Export Permissions</h4>
                <p className="text-sm text-gray-600">Download CSV report</p>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => {
              // Show permissions audit
              toast.info("Audit log feature coming soon!");
            }}
            className="p-4 border rounded-lg hover:bg-gray-50 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FaEye className="text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium">View Audit Log</h4>
                <p className="text-sm text-gray-600">See permission changes</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Permission Guide</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {modules.map(module => (
            <div key={module.id} className="flex items-center gap-2 p-2 border rounded-lg">
              <div className={`w-3 h-3 rounded-full ${module.color.split(' ')[0]}`}></div>
              <span className="text-sm font-medium">{module.name}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {actions.map(action => (
            <div key={action.id} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${action.color}`}></div>
              <span className="text-xs">{action.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserAccessManagement;