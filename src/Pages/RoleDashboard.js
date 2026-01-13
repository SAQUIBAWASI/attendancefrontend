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
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6">
//       {/* Header */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-800">Role Management</h1>
//           <p className="text-gray-600">Manage all roles and view employees</p>
//         </div>
//         <button
//           onClick={handleAdd}
//           className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
//         >
//           <FaUserTie /> Add New Role
//         </button>
//       </div>

//       {/* Search Bar */}
//       <div className="mb-6">
//         <div className="relative">
//           <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//           <input
//             type="text"
//             placeholder="Search roles by name or description..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg"
//           />
//         </div>
//       </div>

//       {/* Messages */}
//       {error && (
//         <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
//           {error}
//         </div>
//       )}
//       {success && (
//         <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
//           {success}
//         </div>
//       )}

//       {/* Roles Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {filteredRoles.map((role) => (
//           <div
//             key={role._id}
//             className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md"
//           >
//             <div className="p-5">
//               {/* Role Header */}
//               <div className="flex justify-between items-start mb-3">
//                 <div>
//                   <h3 className="text-xl font-semibold text-gray-800">
//                     {role.name}
//                   </h3>
//                   <p className="text-sm text-gray-500 mt-1">
//                     {role.description}
//                   </p>
//                 </div>
//                 <div className="flex space-x-2">
//                   <button
//                     onClick={() => handleEdit(role)}
//                     className="text-green-600 hover:text-green-800 p-1"
//                     title="Edit"
//                   >
//                     <FaEdit />
//                   </button>
//                   <button
//                     onClick={() => handleDelete(role._id, role.name)}
//                     className="text-red-600 hover:text-red-800 p-1"
//                     title="Delete"
//                   >
//                     <FaTrash />
//                   </button>
//                 </div>
//               </div>

//               {/* Employee Count */}
//               <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
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
//         <div className="text-center py-12">
//           <div className="text-gray-400 mb-4 text-6xl">👔</div>
//           <h3 className="text-xl font-semibold text-gray-600 mb-2">No roles found</h3>
//           <p className="text-gray-500 mb-4">
//             {searchTerm ? 'Try a different search term' : 'Add your first role to get started'}
//           </p>
//           {!searchTerm && (
//             <button
//               onClick={handleAdd}
//               className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
//             >
//               Create First Role
//             </button>
//           )}
//         </div>
//       )}

//       {/* Add/Edit Role Modal */}
//       {showAddModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
//             <div className="flex justify-between items-center p-6 border-b">
//               <h3 className="text-xl font-semibold text-gray-800">
//                 {editingRole ? 'Edit Role' : 'Add New Role'}
//               </h3>
//               <button
//                 onClick={handleCloseModal}
//                 className="text-gray-400 hover:text-gray-600 text-2xl"
//               >
//                 &times;
//               </button>
//             </div>

//             <form onSubmit={handleSubmit} className="p-6">
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
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
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
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

//               <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
//                 <button
//                   type="button"
//                   onClick={handleCloseModal}
//                   className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 bg-green-600 text-white rounded-lg"
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
import { FaEdit, FaEye, FaSearch, FaTrash, FaUserTie } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import EmployeeDetailsModal from '../Components/EmployeeDetailsModel'; // ✅ Fixed path

const RoleDashboard = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // ✅ Modal State
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [selectedRoleForModal, setSelectedRoleForModal] = useState(null);
  
  // ✅ Get location for URL state
  const location = useLocation();

  // ✅ Check if we need to open modal automatically from URL state
  useEffect(() => {
    if (location.state?.openAddModal) {
      setShowAddModal(true);
      // Clear the state to prevent reopening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

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

  const handleEdit = (role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description
    });
    setShowAddModal(true);
  };

  const handleAdd = () => {
    setEditingRole(null);
    setFormData({ name: '', description: '' });
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingRole(null);
    setFormData({ name: '', description: '' });
    setError('');
  };

  // ✅ Open employee modal
  const handleViewEmployees = (role) => {
    if (role.employeeCount === 0) {
      alert('No employees with this role yet.');
      return;
    }
    setSelectedRoleForModal(role);
    setShowEmployeeModal(true);
  };

  // ✅ Close employee modal
  const handleCloseEmployeeModal = () => {
    setShowEmployeeModal(false);
    setSelectedRoleForModal(null);
  };

  const filteredRoles = roles.filter(role =>
    role.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Role Management</h1>
          <p className="text-gray-600">Manage all roles and view employees</p>
        </div>
        <button
          onClick={handleAdd}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <FaUserTie /> Add New Role
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search roles by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoles.map((role) => (
          <div
            key={role._id}
            className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md"
          >
            <div className="p-5">
              {/* Role Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {role.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {role.description}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(role)}
                    className="text-green-600 hover:text-green-800 p-1"
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(role._id, role.name)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              {/* Employee Count */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${role.employeeCount > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-sm text-gray-600">
                    {role.employeeCount || 0} employee(s)
                  </span>
                </div>
                <button
                  onClick={() => handleViewEmployees(role)}
                  disabled={!role.employeeCount || role.employeeCount === 0}
                  className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 ${
                    role.employeeCount > 0
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <FaEye /> View Employees
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredRoles.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4 text-6xl">👔</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No roles found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Try a different search term' : 'Add your first role to get started'}
          </p>
          {!searchTerm && (
            <button
              onClick={handleAdd}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Create First Role
            </button>
          )}
        </div>
      )}

      {/* Add/Edit Role Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-800">
                {editingRole ? 'Edit Role' : 'Add New Role'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg"
                >
                  {editingRole ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ Employee Details Modal */}
      {showEmployeeModal && selectedRoleForModal && (
        <EmployeeDetailsModal
          type="role"
          id={selectedRoleForModal._id}
          name={selectedRoleForModal.name}
          onClose={handleCloseEmployeeModal}
        />
      )}
    </div>
  );
};

export default RoleDashboard;