import axios from "axios";
import { useEffect, useState } from "react";
import { FiCheckSquare, FiLayout, FiSearch, FiSettings, FiTrash2, FiUser, FiUsers, FiX } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { API_BASE_URL } from "../config";

const UserAccessManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");

  // Permissions Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [permissions, setPermissions] = useState([]);

  // All available permissions grouped with sleek icons
  const allPermissions = [
    {
      category: "Dashboard",
      icon: <FiLayout />,
      items: [
        { id: "dashboard_view", name: "View Dashboard" }
      ]
    },
    {
      category: "Employee Management",
      icon: <FiUsers />,
      items: [
        { id: "employee_view_all", name: "View All Employees (Admin)" },
        { id: "employee_add", name: "Add Employees" },
      ]
    },
    {
      category: "Attendance Management",
      icon: <FiCheckSquare />,
      items: [
        { id: "attendance_view_all", name: "View All Attendance (Admin)" },
      ]
    },
    {
      category: "Leave Management",
      icon: <FiX />,
      items: [
        { id: "leave_view", name: "View Leaves" },
        { id: "leave_approve", name: "Approve Leaves (Admin)" },
        { id: "leave_reject", name: "Reject Leaves" }
      ]
    },
    {
      category: "Payroll Management",
      icon: <FiSettings />,
      items: [
        { id: "payroll_manage", name: "Manage Payroll (Admin)" },
      ]
    },
    {
      category: "Reports & Analytics",
      icon: <FiSearch />,
      items: [
        { id: "reports_view", name: "View Reports" },
        { id: "user_activity_view", name: "View User Activity" }
      ]
    },
    {
      category: "Shift Management",
      icon: <FiSettings />,
      items: [
        { id: "shifts_view", name: "View Shifts" },
        { id: "shifts_manage", name: "Manage Shifts (Admin)" }
      ]
    },
    {
      category: "Location Management",
      icon: <FiUsers />,
      items: [
        { id: "locations_view", name: "View Locations" },
        { id: "locations_manage", name: "Manage Locations (Admin)" }
      ]
    },
    {
      category: "System Access",
      icon: <FiUser />,
      items: [
        { id: "user_access_manage", name: "Manage User Access (Admin)" },
      ]
    },
  ];

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/employees/get-employees`);
      setEmployees(response.data);
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
      const response = await axios.put(`${API_BASE_URL}/employees/update/${selectedEmployee._id}`, { permissions });

      if (response.status === 200) {
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
    <div className="flex h-[calc(100vh-64px)] bg-[#F8FAFC] text-[#334155] font-sans">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* 🟣 LEFT SIDEBAR - TEAMS/DEPARTMENTS */}
      <div className="w-64 bg-white border-r border-gray-100 flex flex-col shadow-sm">
        <div className="p-6 border-b border-gray-50">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <FiUsers className="text-blue-600" /> Departments
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDepartment(dept)}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex justify-between items-center ${selectedDepartment === dept
                ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
            >
              <span>{dept}</span>
              {selectedDepartment !== dept && dept !== "All" && (
                <span className="bg-gray-100 text-gray-400 text-[10px] px-2 py-0.5 rounded-lg">
                  {employees.filter(e => e.department === dept).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 🔵 RIGHT CONTENT - EMPLOYEE GRID */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Sleek Sub-Header */}
        <div className="px-8 py-6 bg-white/50 backdrop-blur-sm border-b border-gray-100 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black text-gray-900 leading-none">User Access</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Manage platform-wide permissions</p>
          </div>
          <div className="relative w-80 group">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-100 rounded-2xl text-[13px] font-medium shadow-sm outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all"
            />
          </div>
        </div>

        {/* Grid Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-blue-600">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-[10px] uppercase font-black tracking-widest">Loading Personnel...</span>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-40">
              <FiUser size={64} className="mb-4" />
              <p className="text-sm font-bold uppercase tracking-widest">No matching users found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredEmployees.map((emp) => (
                <div key={emp._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 group overflow-hidden">
                  <div className="p-4 flex flex-col items-center text-center">
                    <div className="relative mb-3">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-lg font-black shadow-lg shadow-blue-200">
                        {emp.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-lg border-2 border-white ${emp.status === 'inactive' ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                    </div>

                    <h3 className="font-bold text-gray-900 text-[13px] truncate w-full mb-3">{emp.name}</h3>

                    <button
                      onClick={() => openPermissionModal(emp)}
                      className="w-full py-2 bg-[#F8FAFC] hover:bg-blue-600 text-gray-600 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-blue-100"
                    >
                      <FiSettings className="w-3 h-3" /> Manage
                    </button>
                  </div>
                  <div className="bg-[#F8FAFC]/50 px-4 py-2 border-t border-gray-50 flex justify-between items-center text-[9px] font-bold text-gray-400">
                    <span className="uppercase tracking-wider">{emp.department || "General"}</span>
                    <span className={`uppercase tracking-widest ${emp.status === 'inactive' ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {emp.status === 'inactive' ? '● Inactive' : '● Active'}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-[#F8FAFC] rounded-[32px] shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">

            {/* Modal Header */}
            <div className="px-10 py-8 bg-white border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-black">
                  {selectedEmployee.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 leading-tight">
                    {selectedEmployee.name}
                  </h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Configure Module Access Permissions</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-12 h-12 flex items-center justify-center bg-gray-50 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded-2xl transition-all duration-300"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Toolbar */}
            <div className="px-10 py-4 bg-white/50 border-b border-gray-100 flex justify-between items-center">
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    const allIds = [];
                    allPermissions.forEach(cat => cat.items.forEach(item => allIds.push(item.id)));
                    setPermissions(allIds);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-300"
                >
                  <FiCheckSquare /> Grant All
                </button>
                <button
                  onClick={() => setPermissions([])}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-600 hover:text-white transition-all duration-300"
                >
                  <FiTrash2 /> Revoke All
                </button>
              </div>
              <div className="bg-white px-4 py-2 rounded-xl border border-gray-100">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  {permissions.length} Enabled Modules
                </span>
              </div>
            </div>

            {/* Scrollable Permission Grid */}
            <div className="flex-1 overflow-y-auto p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {allPermissions.map((category) => (
                  <div key={category.category} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-5 bg-gradient-to-r from-white to-gray-50/50 border-b border-gray-50 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg text-sm">
                          {category.icon}
                        </div>
                        <h4 className="font-black text-gray-900 text-[11px] uppercase tracking-wider">{category.category}</h4>
                      </div>
                      <button
                        onClick={() => handleSelectCategory(category.items)}
                        className="text-[9px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest"
                      >
                        Toggle
                      </button>
                    </div>
                    <div className="p-6 space-y-4">
                      {category.items.map((perm) => (
                        <label key={perm.id} className="flex items-center cursor-pointer group select-none">
                          <div className="relative flex items-center">
                            <input
                              type="checkbox"
                              checked={permissions.includes(perm.id)}
                              onChange={() => handleTogglePermission(perm.id)}
                              className="peer sr-only"
                            />
                            <div className="w-5 h-5 border-2 border-gray-100 rounded-lg bg-white peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all duration-300 flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                            </div>
                          </div>
                          <span className="ml-4 text-xs font-bold text-gray-600 group-hover:text-blue-600 transition-colors">
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
            <div className="px-10 py-8 bg-white border-t border-gray-100 flex justify-end gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-8 py-4 text-gray-400 font-black text-[11px] uppercase tracking-widest hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={savePermissions}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-95"
              >
                Save Permissions
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default UserAccessManagement;
