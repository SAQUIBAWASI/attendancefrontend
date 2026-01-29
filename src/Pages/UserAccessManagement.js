import { useEffect, useState } from "react";
import { FiCheckSquare, FiSettings, FiTrash2, FiUser, FiUsers, FiX } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UserAccessManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");

  // Permissions Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [permissions, setPermissions] = useState([]);

  // All available permissions grouped
  const allPermissions = [
    { 
      category: "Dashboard", 
      items: [
        { id: "dashboard_view", name: "View Dashboard" }
      ] 
    },
    { 
      category: "Employee Management", 
      items: [
        { id: "employee_view_all", name: "View All Employees (Admin)" }, 
        { id: "employee_add", name: "Add Employees" }, 
        // { id: "employee_edit", name: "Edit Employees" }, 
        // { id: "employee_delete", name: "Delete Employees" }
      ] 
    },
    { 
      category: "Attendance Management", 
      items: [
        { id: "attendance_view_all", name: "View All Attendance (Admin)" }, 
        // { id: "attendance_edit", name: "Edit Attendance" }, 
        // { id: "attendance_approve", name: "Approve Attendance" }
      ] 
    },
    { 
      category: "Leave Management", 
      items: [
        { id: "leave_view", name: "View Leaves" }, 
        { id: "leave_approve", name: "Approve Leaves (Admin)" }, 
        { id: "leave_reject", name: "Reject Leaves" }
      ] 
    },
    { 
      category: "Payroll Management", 
      items: [
        // { id: "payroll_view", name: "View Own Salary" }, 
        { id: "payroll_manage", name: "Manage Payroll (Admin)" },
        // { id: "payroll_generate", name: "Generate Payroll" }
      ] 
    },
    { 
      category: "Reports & Analytics", 
      items: [
        { id: "reports_view", name: "View Reports" },
        { id: "user_activity_view", name: "View User Activity" }
      ] 
    },
    { 
      category: "Shift Management", 
      items: [
        { id: "shifts_view", name: "View Shifts" }, 
        { id: "shifts_manage", name: "Manage Shifts (Admin)" }
      ] 
    },
    { 
      category: "Location Management", 
      items: [
        { id: "locations_view", name: "View Locations" }, 
        { id: "locations_manage", name: "Manage Locations (Admin)" }
      ] 
    },
    { 
      category: "System Access", 
      items: [
        { id: "user_access_manage", name: "Manage User Access (Admin)" },
        // { id: "department_view", name: "View Departments" }, 
        // { id: "department_manage", name: "Manage Departments" }
      ] 
    },
  ];

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/employees/get-employees");
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  // Extract unique departments
  const departments = ["All", ...new Set(employees.map(e => e.department).filter(Boolean))];

  // Open Modal
  const openPermissionModal = (emp) => {
    setSelectedEmployee(emp);
    setPermissions(emp.permissions || []);
    setIsModalOpen(true);
  };

  // Toggle Permission
  const handleTogglePermission = (permId) => {
    setPermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  // Toggle Category
  const handleSelectCategory = (categoryItems) => {
    const allIds = categoryItems.map((i) => i.id);
    const allSelected = allIds.every((id) => permissions.includes(id));
    
    if (allSelected) {
      setPermissions((prev) => prev.filter((id) => !allIds.includes(id)));
    } else {
      setPermissions((prev) => [...new Set([...prev, ...allIds])]);
    }
  };

  // Save Permissions
  const savePermissions = async () => {
    if (!selectedEmployee) return;

    try {
      const response = await fetch(`http://localhost:5000/api/employees/update/${selectedEmployee._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions }),
      });

      if (response.ok) {
        toast.success(`Access updated for ${selectedEmployee.name}`);
        setEmployees((prev) =>
          prev.map((e) => (e._id === selectedEmployee._id ? { ...e, permissions } : e))
        );
        setIsModalOpen(false);
      } else {
        toast.error("Failed to update access");
      }
    } catch (error) {
      toast.error("Error updating permissions");
    }
  };

  const filteredEmployees = employees.filter((e) => {
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          e.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDepartment === "All" || e.department === selectedDepartment;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="flex h-[calc(100vh-100px)] bg-gray-100 font-sans">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* 🟢 LEFT SIDEBAR - TEAMS/DEPARTMENTS */}
      <div className="w-54 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="p-2 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FiUsers className="text-blue-600" /> Teams
          </h2>
          <p className="text-xs text-gray-400 mt-1">Select a department to view users</p>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDepartment(dept)}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all flex justify-between items-center ${
                selectedDepartment === dept 
                  ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span>{dept}</span>
              {dept !== "All" && (
                <span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-full">
                  {employees.filter(e => e.department === dept).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 🔵 RIGHT CONTENT - EMPLOYEE GRID */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        {/* <div className="bg-white border-b border-gray-200 px-8 py-5 flex justify-between items-center shadow-sm z-10">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">User Access Control</h1>
            <p className="text-sm text-gray-500">Manage permissions and roles for your team members</p>
          </div>
          <div className="relative w-72">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
            />
          </div>
        </div> */}

        {/* Grid Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {loading ? (
            <div className="flex items-center justify-center h-full text-gray-400">Loading users...</div>
          ) : filteredEmployees.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <FiUser className="text-4xl mb-3 opacity-20" />
              <p>No users found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredEmployees.map((emp) => (
                <div key={emp._id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group">
                  <div className="p-5 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xl font-bold mb-3 shadow-blue-200 shadow-lg">
                      {emp.name.charAt(0)}
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg truncate w-full">{emp.name}</h3>
                    <p className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-1">{emp.role}</p>
                    <p className="text-xs text-gray-400 mb-4 truncate w-full">{emp.email}</p>
                    
                    <button 
                      onClick={() => openPermissionModal(emp)}
                      className="w-full py-2 bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 group-hover:bg-blue-600 group-hover:text-white"
                    >
                      <FiSettings className="w-4 h-4" /> Manage Access
                    </button>
                  </div>
                  <div className="bg-gray-50 px-4 py-2 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-500 rounded-b-xl">
                    <span>{emp.department || "No Dept"}</span>
                    <span className={`px-2 py-0.5 rounded-full font-medium ${emp.status === 'inactive' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                      {emp.status === 'inactive' ? 'Inactive' : 'Active'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 🟠 PERMISSIONS MODAL */}
      {isModalOpen && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">
                    {selectedEmployee.name.charAt(0)}
                  </span>
                  Manage Permissions for {selectedEmployee.name}
                </h2>
                <p className="text-sm text-gray-500 mt-1 pl-10">Configure what modules & features this user can access.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition text-gray-500">
                <FiX size={24} />
              </button>
            </div>

            {/* Toolbar */}
            <div className="px-8 py-3 bg-white border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
               <div className="flex gap-3">
                 <button
                   onClick={() => {
                     const allIds = [];
                     allPermissions.forEach(cat => cat.items.forEach(item => allIds.push(item.id)));
                     setPermissions(allIds);
                   }}
                   className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded hover:bg-blue-100 transition"
                 >
                   <FiCheckSquare /> Select All
                 </button>
                 <button
                   onClick={() => setPermissions([])}
                   className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded hover:bg-red-100 transition"
                 >
                   <FiTrash2 /> Deselect All
                 </button>
               </div>
               <span className="text-xs font-medium text-gray-400">
                 {permissions.length} permissions granted
               </span>
            </div>

            {/* Scrollable Permission Grid */}
            <div className="flex-1 overflow-y-auto p-8 bg-gray-50/30">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allPermissions.map((category) => (
                  <div key={category.category} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                      <h4 className="font-semibold text-gray-700 text-sm">{category.category}</h4>
                      <button 
                        onClick={() => handleSelectCategory(category.items)}
                        className="text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wider"
                      >
                        Toggle Group
                      </button>
                    </div>
                    <div className="p-4 space-y-3">
                      {category.items.map((perm) => (
                        <label key={perm.id} className="flex items-start cursor-pointer group select-none">
                          <div className="relative flex items-center">
                            <input
                              type="checkbox"
                              checked={permissions.includes(perm.id)}
                              onChange={() => handleTogglePermission(perm.id)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                            />
                          </div>
                          <span className="ml-3 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                            {perm.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-gray-100 bg-white flex justify-end gap-3 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button 
                onClick={savePermissions}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg shadow-blue-200 transition-all active:scale-95"
              >
                Save Changes
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default UserAccessManagement;