// src/Pages/RoleDashboard.js
// import axios from 'axios';
// import { useEffect, useState } from 'react';
// import { FaEdit, FaEye, FaSearch, FaTrash, FaUserTie } from 'react-icons/fa';
// import EmployeeDetailsModal from '../Components/EmployeeDetailsModel'; // ✅ Fixed path

// const RoleDashboard = () => {
//   const [roles, setRoles] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [editingRole, setEditingRole] = useState(null);
//   const [formData, setFormData] = useState({ name: '', description: '' });
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
  
//   // ✅ Modal State
//   const [showEmployeeModal, setShowEmployeeModal] = useState(false);
//   const [selectedRoleForModal, setSelectedRoleForModal] = useState(null);

//   useEffect(() => {
//     fetchRoles();
//   }, []);

//   const fetchRoles = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get('http://localhost:5000/api/roles/all');
      
//       if (response.data.success) {
//         setRoles(response.data.data);
//       } else {
//         setError(response.data.message || 'Failed to load roles');
//       }
//     } catch (error) {
//       console.error('Error fetching roles:', error);
//       setError('Failed to load roles. Please check your connection.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');

//     try {
//       if (editingRole) {
//         const response = await axios.put(
//           `http://localhost:5000/api/roles/update/${editingRole._id}`,
//           formData
//         );
        
//         if (response.data.success) {
//           setSuccess('Role updated successfully');
//           fetchRoles();
//           handleCloseModal();
//         } else {
//           setError(response.data.message || 'Failed to update role');
//         }
//       } else {
//         const response = await axios.post(
//           'http://localhost:5000/api/roles/create',
//           formData
//         );
        
//         if (response.data.success) {
//           setSuccess('Role added successfully');
//           fetchRoles();
//           handleCloseModal();
//         } else {
//           setError(response.data.message || 'Failed to add role');
//         }
//       }
//     } catch (error) {
//       console.error('Error saving role:', error);
//       setError(error.response?.data?.message || 'Failed to save role');
//     }
//   };

//   const handleDelete = async (id, name) => {
//     if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

//     try {
//       const response = await axios.delete(`http://localhost:5000/api/roles/delete/${id}`);
      
//       if (response.data.success) {
//         setSuccess('Role deleted successfully');
//         fetchRoles();
//       } else {
//         setError(response.data.message || 'Failed to delete role');
//       }
//     } catch (error) {
//       console.error('Error deleting role:', error);
//       setError(error.response?.data?.message || 'Failed to delete role');
//     }
//   };

//   const handleEdit = (role) => {
//     setEditingRole(role);
//     setFormData({
//       name: role.name,
//       description: role.description
//     });
//     setShowAddModal(true);
//   };

//   const handleAdd = () => {
//     setEditingRole(null);
//     setFormData({ name: '', description: '' });
//     setShowAddModal(true);
//   };

//   const handleCloseModal = () => {
//     setShowAddModal(false);
//     setEditingRole(null);
//     setFormData({ name: '', description: '' });
//     setError('');
//   };

//   // ✅ Open employee modal
//   const handleViewEmployees = (role) => {
//     if (role.employeeCount === 0) {
//       alert('No employees with this role yet.');
//       return;
//     }
//     setSelectedRoleForModal(role);
//     setShowEmployeeModal(true);
//   };

//   // ✅ Close employee modal
//   const handleCloseEmployeeModal = () => {
//     setShowEmployeeModal(false);
//     setSelectedRoleForModal(null);
//   };

//   const filteredRoles = roles.filter(role =>
//     role.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     role.description?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="w-12 h-12 border-b-2 border-green-600 rounded-full animate-spin"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6">
//       {/* Header */}
//       <div className="flex flex-col items-start justify-between gap-4 mb-6 md:flex-row md:items-center">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-800">Role Management</h1>
//           <p className="text-gray-600">Manage all roles and view employees</p>
//         </div>
//         <button
//           onClick={handleAdd}
//           className="flex items-center gap-2 px-6 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700"
//         >
//           <FaUserTie /> Add New Role
//         </button>
//       </div>

//       {/* Search Bar */}
//       <div className="mb-6">
//         <div className="relative">
//           <FaSearch className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
//           <input
//             type="text"
//             placeholder="Search roles by name or description..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-lg"
//           />
//         </div>
//       </div>

//       {/* Messages */}
//       {error && (
//         <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
//           {error}
//         </div>
//       )}
//       {success && (
//         <div className="p-4 mb-4 text-green-700 bg-green-100 rounded-lg">
//           {success}
//         </div>
//       )}

//       {/* Roles Grid */}
//       <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
//         {filteredRoles.map((role) => (
//           <div
//             key={role._id}
//             className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md"
//           >
//             <div className="p-5">
//               {/* Role Header */}
//               <div className="flex items-start justify-between mb-3">
//                 <div>
//                   <h3 className="text-xl font-semibold text-gray-800">
//                     {role.name}
//                   </h3>
//                   <p className="mt-1 text-sm text-gray-500">
//                     {role.description}
//                   </p>
//                 </div>
//                 <div className="flex space-x-2">
//                   <button
//                     onClick={() => handleEdit(role)}
//                     className="p-1 text-green-600 hover:text-green-800"
//                     title="Edit"
//                   >
//                     <FaEdit />
//                   </button>
//                   <button
//                     onClick={() => handleDelete(role._id, role.name)}
//                     className="p-1 text-red-600 hover:text-red-800"
//                     title="Delete"
//                   >
//                     <FaTrash />
//                   </button>
//                 </div>
//               </div>

//               {/* Employee Count */}
//               <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
//                 <div className="flex items-center space-x-2">
//                   <div className={`w-3 h-3 rounded-full ${role.employeeCount > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
//                   <span className="text-sm text-gray-600">
//                     {role.employeeCount || 0} employee(s)
//                   </span>
//                 </div>
//                 <button
//                   onClick={() => handleViewEmployees(role)}
//                   disabled={!role.employeeCount || role.employeeCount === 0}
//                   className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 ${
//                     role.employeeCount > 0
//                       ? 'bg-green-100 text-green-700 hover:bg-green-200'
//                       : 'bg-gray-100 text-gray-500 cursor-not-allowed'
//                   }`}
//                 >
//                   <FaEye /> View Employees
//                 </button>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Empty State */}
//       {filteredRoles.length === 0 && (
//         <div className="py-12 text-center">
//           <div className="mb-4 text-6xl text-gray-400">👔</div>
//           <h3 className="mb-2 text-xl font-semibold text-gray-600">No roles found</h3>
//           <p className="mb-4 text-gray-500">
//             {searchTerm ? 'Try a different search term' : 'Add your first role to get started'}
//           </p>
//           {!searchTerm && (
//             <button
//               onClick={handleAdd}
//               className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
//             >
//               Create First Role
//             </button>
//           )}
//         </div>
//       )}

//       {/* Add/Edit Role Modal */}
//       {showAddModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//           <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
//             <div className="flex items-center justify-between p-6 border-b">
//               <h3 className="text-xl font-semibold text-gray-800">
//                 {editingRole ? 'Edit Role' : 'Add New Role'}
//               </h3>
//               <button
//                 onClick={handleCloseModal}
//                 className="text-2xl text-gray-400 hover:text-gray-600"
//               >
//                 &times;
//               </button>
//             </div>

//             <form onSubmit={handleSubmit} className="p-6">
//               <div className="space-y-4">
//                 <div>
//                   <label className="block mb-2 text-sm font-medium text-gray-700">
//                     Role Name *
//                   </label>
//                   <input
//                     type="text"
//                     name="name"
//                     value={formData.name}
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg"
//                     placeholder="e.g., Manager, Developer"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block mb-2 text-sm font-medium text-gray-700">
//                     Description *
//                   </label>
//                   <textarea
//                     name="description"
//                     value={formData.description}
//                     onChange={handleInputChange}
//                     rows="3"
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg"
//                     placeholder="Describe the role..."
//                     required
//                   />
//                 </div>
//               </div>

//               <div className="flex justify-end pt-6 mt-6 space-x-3 border-t">
//                 <button
//                   type="button"
//                   onClick={handleCloseModal}
//                   className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 text-white bg-green-600 rounded-lg"
//                 >
//                   {editingRole ? 'Update' : 'Add'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* ✅ Employee Details Modal */}
//       {showEmployeeModal && selectedRoleForModal && (
//         <EmployeeDetailsModal
//           type="role"
//           id={selectedRoleForModal._id}
//           name={selectedRoleForModal.name}
//           onClose={handleCloseEmployeeModal}
//         />
//       )}
//     </div>
//   );
// };

// export default RoleDashboard;

// src/Pages/RoleDashboard.js
import axios from 'axios';
import { useEffect, useState } from 'react';
import { FaEdit, FaEye, FaPlus, FaSearch, FaTrash, FaUserTie } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';

const RoleDashboard = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal State
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [selectedRoleForModal, setSelectedRoleForModal] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState('');
  
  const location = useLocation();

  useEffect(() => {
    if (location.state?.openAddModal) {
      setShowAddModal(true);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Fetch roles
  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/roles/all');
      
      if (response.data.success) {
        setRoles(response.data.data);
      } else {
        setError(response.data.message || 'Failed to load roles');
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      setError('Failed to load roles. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees for selected role
  const fetchEmployeesForRole = async (roleId) => {
    try {
      setEmployeeLoading(true);
      const response = await axios.get(`http://localhost:5000/api/roles/${roleId}/employees`);
      
      console.log('Role Employees API Response:', response.data);
      
      // Handle different response formats
      let employeesData = [];
      
      if (response.data.success) {
        if (Array.isArray(response.data.employees)) {
          employeesData = response.data.employees;
        } else if (response.data.data && Array.isArray(response.data.data.employees)) {
          employeesData = response.data.data.employees;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          employeesData = response.data.data;
        } else if (Array.isArray(response.data)) {
          employeesData = response.data;
        }
      }
      
      setEmployees(employeesData || []);
    } catch (error) {
      console.error('Error fetching role employees:', error);
      console.error('Error details:', error.response?.data);
      setEmployees([]);
    } finally {
      setEmployeeLoading(false);
    }
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add/Update role
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingRole) {
        const response = await axios.put(
          `http://localhost:5000/api/roles/update/${editingRole._id}`,
          formData
        );
        
        if (response.data.success) {
          setSuccess('Role updated successfully');
          fetchRoles();
          handleCloseModal();
        } else {
          setError(response.data.message || 'Failed to update role');
        }
      } else {
        const response = await axios.post(
          'http://localhost:5000/api/roles/create',
          formData
        );
        
        if (response.data.success) {
          setSuccess('Role added successfully');
          fetchRoles();
          handleCloseModal();
        } else {
          setError(response.data.message || 'Failed to add role');
        }
      }
    } catch (error) {
      console.error('Error saving role:', error);
      setError(error.response?.data?.message || 'Failed to save role');
    }
  };

  // Delete role
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const response = await axios.delete(`http://localhost:5000/api/roles/delete/${id}`);
      
      if (response.data.success) {
        setSuccess('Role deleted successfully');
        fetchRoles();
      } else {
        setError(response.data.message || 'Failed to delete role');
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      setError(error.response?.data?.message || 'Failed to delete role');
    }
  };

  // Open modal for editing
  const handleEdit = (role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description
    });
    setShowAddModal(true);
  };

  // Open modal for adding
  const handleAdd = () => {
    setEditingRole(null);
    setFormData({ name: '', description: '' });
    setShowAddModal(true);
  };

  // Close role modal
  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingRole(null);
    setFormData({ name: '', description: '' });
    setError('');
  };

  // Open employee modal
  const handleViewEmployees = async (role) => {
    if (role.employeeCount === 0) {
      alert('No employees with this role yet.');
      return;
    }
    setSelectedRoleForModal(role);
    await fetchEmployeesForRole(role._id);
    setShowEmployeeModal(true);
  };

  // Close employee modal
  const handleCloseEmployeeModal = () => {
    setShowEmployeeModal(false);
    setSelectedRoleForModal(null);
    setEmployees([]);
    setEmployeeSearch('');
  };

  // Filter roles
  const filteredRoles = roles.filter(role =>
    role.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter employees with safe checks
  const filteredEmployees = Array.isArray(employees) 
    ? employees.filter((emp) => {
        if (!emp) return false;
        const searchTerm = employeeSearch.toLowerCase().trim();
        
        const nameMatch = emp.name && emp.name.toLowerCase().includes(searchTerm);
        const emailMatch = emp.email && emp.email.toLowerCase().includes(searchTerm);
        const phoneMatch = emp.phone && emp.phone.toString().includes(searchTerm);
        const empIdMatch = emp.employeeId && emp.employeeId.toLowerCase().includes(searchTerm);
        const roleMatch = emp.role && emp.role.toLowerCase().includes(searchTerm);
        const departmentMatch = emp.department && emp.department.toLowerCase().includes(searchTerm);
        
        return nameMatch || emailMatch || phoneMatch || empIdMatch || roleMatch || departmentMatch;
      })
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-b-2 border-green-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Top Bar: Search + Button */}
      <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
        
        {/* Search Bar */}
        <div className="relative w-full md:max-w-md">
          <FaSearch className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
          <input
            type="text"
            placeholder="Search roles by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Add Button */}
        <button
          onClick={handleAdd}
          className="flex items-center justify-center gap-2 px-6 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700"
        >
          <FaPlus /> Add New Role
        </button>

      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 mb-4 text-green-700 bg-green-100 rounded-lg">
          {success}
        </div>
      )}

      {/* Roles Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-bold min-w-[600px]">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 font-bold text-left text-gray-800">Role Name</th>
              <th className="p-2 font-bold text-left text-gray-800">Description</th>
              <th className="p-2 font-bold text-left text-gray-800">Employees</th>
              <th className="p-2 font-bold text-left text-gray-800">Status</th>
              <th className="p-2 font-bold text-left text-gray-800">Actions</th>
            </tr>
          </thead>
          
          <tbody>
            {filteredRoles.map((role) => (
              <tr key={role._id} className="border-b hover:bg-gray-50">
                <td className="p-2">
                  <div className="font-medium text-gray-800">{role.name}</div>
                </td>
                <td className="p-2">
                  <div className="max-w-md text-gray-600">{role.description}</div>
                </td>
                <td className="p-2">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${role.employeeCount > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="font-medium">{role.employeeCount || 0}</span>
                    <span className="ml-1 text-gray-500">employees</span>
                  </div>
                </td>
                <td className="p-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${role.employeeCount > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {role.employeeCount > 0 ? 'Active' : 'No Employees'}
                  </span>
                </td>
                <td className="p-2">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleViewEmployees(role)}
                      disabled={!role.employeeCount || role.employeeCount === 0}
                      className={`px-3 py-1 text-sm font-medium rounded-lg flex items-center gap-2 ${
                        role.employeeCount > 0
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <FaEye size={14} /> View
                    </button>
                    <button
                      onClick={() => handleEdit(role)}
                      className="p-1 text-green-600 hover:text-green-800"
                      title="Edit"
                    >
                      <FaEdit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(role._id, role.name)}
                      className="p-1 text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredRoles.length === 0 && (
        <div className="py-12 text-center bg-white border border-gray-200 rounded-lg">
          <div className="mb-4 text-6xl text-gray-400">👔</div>
          <h3 className="mb-2 text-xl font-semibold text-gray-600">No roles found</h3>
          <p className="mb-4 text-gray-500">
            {searchTerm ? 'Try a different search term' : 'Add your first role to get started'}
          </p>
          {!searchTerm && (
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-6 py-2 mx-auto text-white bg-green-600 rounded-lg hover:bg-green-700"
            >
              <FaUserTie /> Create First Role
            </button>
          )}
        </div>
      )}

      {/* Add/Edit Role Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-800">
                {editingRole ? 'Edit Role' : 'Add New Role'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-2xl text-black-800 hover:text-black-600"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Role Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="e.g., Manager, Developer"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Describe the role..."
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-6 mt-6 space-x-3 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-green-600 rounded-lg"
                >
                  {editingRole ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Employee Details Modal (Table Format) */}
      {showEmployeeModal && selectedRoleForModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-2 overflow-y-auto bg-black bg-opacity-50">
          <div className="w-full my-8 bg-white rounded-lg shadow-xl max-w-7xl">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-2 border-b">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedRoleForModal.name} - Role Employees
                </h2>
                <div className="flex items-center gap-4 mt-2">
                  <div className="text-gray-600">
                    <span className="font-semibold">Total:</span> {employees.length}
                  </div>
                  <div className="text-gray-600">
                    <span className="font-semibold">Showing:</span> {filteredEmployees.length}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCloseEmployeeModal}
                  className="text-2xl text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="p-2 border-b bg-gray-50">
              <div className="relative">
                <FaSearch className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  placeholder="Search employees by name, email, phone, or ID..."
                  value={employeeSearch}
                  onChange={(e) => setEmployeeSearch(e.target.value)}
                  className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Employees Table */}
            <div className="overflow-x-auto border rounded-lg">
              {employeeLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="w-8 h-8 border-b-2 border-green-600 rounded-full animate-spin"></div>
                  <p className="ml-3 text-gray-800">Loading employees...</p>
                </div>
              ) : filteredEmployees.length > 0 ? (
                <table className="w-full text-bold min-w-[600px]">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="p-2 font-bold text-left text-gray-800 border">Emp ID</th>
                      <th className="p-2 font-bold text-left text-gray-800 border">Name</th>
                      <th className="p-2 font-bold text-left text-gray-800 border">Phone</th>
                      <th className="p-2 font-bold text-left text-gray-800 border">Department</th>
                      <th className="p-2 font-bold text-left text-gray-800 border">Role</th>
                      <th className="p-2 font-bold text-left text-gray-800 border">Join Date</th>
                    </tr>
                  </thead>
                  
                  <tbody>
                    {filteredEmployees.map((emp) => (
                      <tr key={emp._id || emp.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium border">{emp.employeeId || emp.empId || 'N/A'}</td>
                        <td className="p-2 border">
                          <div className="font-medium">{emp.name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{emp.email || 'N/A'}</div>
                        </td>
                        <td className="p-2 border">{emp.phone || 'N/A'}</td>
                        <td className="p-2 border">{emp.department || 'N/A'}</td>
                        <td className="p-2 border">{emp.role || selectedRoleForModal.name}</td>
                        <td className="p-2 border">
                          {emp.joinDate ? new Date(emp.joinDate).toLocaleDateString() : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center">
                  <div className="mb-3 text-4xl text-gray-400">👨‍💼</div>
                  <p className="text-gray-600">No employees found with this role.</p>
                  <p className="mt-2 text-sm text-gray-500">
                    API Response: {employees.length} employees found in data
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {filteredEmployees.length} of {employees.length} employees
                </p>
                <button
                  onClick={handleCloseEmployeeModal}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleDashboard;